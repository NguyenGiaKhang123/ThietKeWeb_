require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const multer = require('multer'); // <--- MỚI: Thư viện upload
const path = require('path');     // <--- MỚI: Thư viện xử lý đường dẫn

const app = express();
const PORT = 4000;

// 1. Kết nối Database
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    ssl: { rejectUnauthorized: false }
});

db.connect((err) => {
    if (err) console.error("❌ Kết nối MySQL thất bại: " + err.message);
    else console.log("✅ Đã kết nối MySQL thành công!");
});

app.use(cors());
app.use(express.json());

// --- CẤU HÌNH UPLOAD ẢNH (MỚI) ---
// 1. Cho phép truy cập ảnh trong thư mục 'uploads' từ trình duyệt
// Ví dụ: http://localhost:4000/uploads/anh.jpg sẽ xem được ảnh
app.use('/uploads', express.static('uploads')); 

// 2. Cấu hình nơi lưu và tên file
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Ảnh sẽ được lưu vào thư mục 'uploads/' nằm cùng cấp với server.js
        cb(null, 'uploads/'); 
    },
    filename: (req, file, cb) => {
        // Đặt tên file = thời gian hiện tại + đuôi file gốc (để tránh trùng tên)
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });


// =======================================================
// DANH SÁCH API
// =======================================================

// --- API UPLOAD AVATAR (MỚI - QUAN TRỌNG) ---
app.post('/api/upload-avatar', upload.single('avatar'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'Chưa chọn file nào!' });
    }
    // Tạo đường dẫn ảnh đầy đủ để frontend lưu vào DB
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.json({ url: fileUrl });
});

// --- API 1: ĐĂNG BÀI VIẾT ---
app.post('/api/add-article', (req, res) => {
    const { title, summary, category, content, image_url } = req.body;
    console.log("Đang đăng bài:", title);
    const sql = `INSERT INTO articles (title, summary, category, content, image_url) VALUES (?, ?, ?, ?, ?)`;
    db.query(sql, [title, summary, category, content, image_url], (err, result) => {
        if (err) {
            console.error("Lỗi SQL:", err);
            return res.status(500).json({ message: 'Lỗi lưu vào Database' });
        }
        res.status(200).json({ message: 'Đăng bài thành công!', id: result.insertId });
    });
});

// --- API 2: LẤY TẤT CẢ BÀI VIẾT ---
app.get('/api/articles', (req, res) => {
    const sql = "SELECT * FROM articles ORDER BY created_at DESC";
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ message: 'Lỗi lấy dữ liệu' });
        res.json(results);
    });
});

// --- API 3: LẤY CHI TIẾT 1 BÀI VIẾT ---
app.get('/api/articles/:id', (req, res) => {
    const { id } = req.params;
    const sql = "SELECT * FROM articles WHERE id = ?";
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json({ message: 'Lỗi server' });
        if (result.length === 0) return res.status(404).json({ message: 'Bài viết không tồn tại' });
        res.json(result[0]);
    });
});

// --- API 4: LẤY BÀI VIẾT THEO DANH MỤC ---
app.get('/api/articles/category/:catName', (req, res) => {
    const { catName } = req.params;
    const sql = "SELECT * FROM articles WHERE category = ? ORDER BY created_at DESC";
    db.query(sql, [catName], (err, results) => {
        if (err) return res.status(500).json({ message: 'Lỗi lấy dữ liệu' });
        res.json(results);
    });
});

// --- API 5: XÓA BÀI VIẾT ---
app.delete('/api/delete-article/:id', (req, res) => {
    const { id } = req.params;
    const sql = "DELETE FROM articles WHERE id = ?";
    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error("Lỗi xóa bài:", err);
            return res.status(500).json({ message: 'Lỗi server khi xóa bài' });
        }
        res.status(200).json({ message: 'Đã xóa bài viết thành công!' });
    });
});

// --- API 6: ĐĂNG KÝ TÀI KHOẢN ---
app.post('/api/register', (req, res) => {
    const { username, email, password } = req.body;
    const checkUserSql = "SELECT * FROM users WHERE username = ? OR email = ?";
    db.query(checkUserSql, [username, email], (err, results) => {
        if (err) return res.status(500).json({ message: 'Lỗi server: ' + err.sqlMessage });
        
        if (results.length > 0) {
            const existingUser = results[0];
            if (existingUser.username === username) return res.status(400).json({ message: 'Tên đăng nhập này đã có người dùng!' });
            if (existingUser.email === email) return res.status(400).json({ message: 'Email này đã được sử dụng!' });
        }

        const insertSql = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
        db.query(insertSql, [username, email, password], (err, result) => {
            if (err) return res.status(500).json({ message: 'Lỗi khi tạo tài khoản' });
            res.status(200).json({ message: 'Đăng ký thành công!' });
        });
    });
});

// --- API 7: ĐĂNG NHẬP ---
app.post('/api/login', (req, res) => {
    const { username, password } = req.body; 
    const sql = "SELECT * FROM users WHERE (email = ? OR username = ?) AND password = ?";
    db.query(sql, [username, username, password], (err, results) => {
        if (err) return res.status(500).json({ message: 'Lỗi server' });
        
        if (results.length > 0) {
            const user = results[0];
            res.status(200).json({ 
                message: 'Đăng nhập thành công!',
                user: { id: user.id, username: user.username, email: user.email }
            });
        } else {
            res.status(401).json({ message: 'Tài khoản hoặc mật khẩu không đúng!' });
        }
    });
});

// --- API 8: LẤY THÔNG TIN CHI TIẾT USER ---
app.get('/api/user/:id', (req, res) => {
    // Đã thêm avatar_url
    const sql = "SELECT id, username, email, avatar_url, dob, gender, phone, address, user_level FROM users WHERE id = ?";
    db.query(sql, [req.params.id], (err, result) => {
        if (err) return res.status(500).json({ message: 'Lỗi server' });
        if (result.length === 0) return res.status(404).json({ message: 'User không tồn tại' });
        res.json(result[0]);
    });
});

// --- API 9: CẬP NHẬT THÔNG TIN ---
app.put('/api/user/update', (req, res) => {
    const { id, field, value } = req.body;
    
    // Đã thêm email và avatar_url vào danh sách cho phép sửa
    const allowedFields = ['dob', 'gender', 'phone', 'address', 'email', 'avatar_url'];
    
    if (!allowedFields.includes(field)) {
        return res.status(400).json({ message: 'Không được phép sửa trường này!' });
    }

    const sql = `UPDATE users SET ${field} = ? WHERE id = ?`;
    db.query(sql, [value, id], (err, result) => {
        if (err) {
            console.error(err);
            if (err.code === 'ER_DUP_ENTRY') {
                 return res.status(400).json({ message: 'Email này đã được sử dụng!' });
            }
            return res.status(500).json({ message: 'Lỗi cập nhật' });
        }
        res.status(200).json({ message: 'Cập nhật thành công!' });
    });
});

// --- API 10: XÓA TÀI KHOẢN ---
app.delete('/api/user/delete/:id', (req, res) => {
    const { id } = req.params;
    const sql = "DELETE FROM users WHERE id = ?";
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json({ message: 'Lỗi server khi xóa user' });
        res.status(200).json({ message: 'Đã xóa tài khoản vĩnh viễn!' });
    });
});
// --- API 11: LẤY DANH SÁCH TẤT CẢ USER (CHO ADMIN) ---
app.get('/api/users', (req, res) => {
    // Lấy hết thông tin quan trọng
    const sql = "SELECT id, username, email, password, created_at FROM users ORDER BY id DESC";
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ message: 'Lỗi lấy danh sách user' });
        res.json(results);
    });
});
// --- KHỞI ĐỘNG SERVER ---
app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
});