require('dotenv').config(); // Nạp biến môi trường từ file .env
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const multer = require('multer'); // Thư viện xử lý upload file
const path = require('path');     // Thư viện xử lý đường dẫn file

const app = express();
const PORT = process.env.PORT || 4000;

// =======================================================
// 1. KẾT NỐI DATABASE (MySQL)
// =======================================================
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    ssl: { rejectUnauthorized: false } // Cần thiết nếu dùng DB trên Cloud (VD: Aiven, Azure)
});

db.connect((err) => {
    if (err) console.error("❌ Kết nối MySQL thất bại: " + err.message);
    else console.log("✅ Đã kết nối MySQL thành công!");
});

// =======================================================
// 2. CẤU HÌNH MIDDLEWARE (Trung gian xử lý)
// =======================================================
app.use(cors()); // Cho phép Frontend (khác port) gọi API
app.use(express.json()); // Cho phép đọc dữ liệu JSON từ body request

// --- QUAN TRỌNG: Mở thư mục 'uploads' ra internet ---
// Giúp trình duyệt xem được ảnh qua đường dẫn: https://thietkeweb-8kq5.onrender.com/uploads/ten-anh.jpg
app.use('/uploads', express.static('uploads')); 


// =======================================================
// 3. CẤU HÌNH UPLOAD ẢNH (Multer)
// =======================================================
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Lưu file vào thư mục 'uploads/' (phải tạo thư mục này thủ công nếu chưa có)
        cb(null, 'uploads/'); 
    },
    filename: (req, file, cb) => {
        // Đặt tên file = Thời gian hiện tại + Đuôi file gốc (VD: .jpg, .png)
        // Mục đích: Tránh việc 2 ảnh cùng tên ghi đè lên nhau
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });


// =======================================================
// 4. CÁC API HỆ THỐNG
// =======================================================

// --- API: Upload Avatar ---
// Frontend cần gửi Form-Data với key là 'avatar'
app.post('/api/upload-avatar', upload.single('avatar'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'Lỗi: Chưa chọn file nào!' });
    }
    // Tạo đường dẫn đầy đủ để Frontend lưu vào DB
    // Ví dụ: https://thietkeweb-8kq5.onrender.com/uploads/1702345678.jpg
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.json({ url: fileUrl });
});

// --- API: Đăng ký tài khoản ---
app.post('/api/register', (req, res) => {
    const { username, email, password } = req.body;
    
    // Bước 1: Kiểm tra xem username hoặc email đã tồn tại chưa
    const checkUserSql = "SELECT * FROM users WHERE username = ? OR email = ?";
    db.query(checkUserSql, [username, email], (err, results) => {
        if (err) return res.status(500).json({ message: 'Lỗi server kiểm tra user' });
        
        if (results.length > 0) {
            const existingUser = results[0];
            if (existingUser.username === username) return res.status(400).json({ message: 'Tên đăng nhập đã tồn tại!' });
            if (existingUser.email === email) return res.status(400).json({ message: 'Email này đã được sử dụng!' });
        }

        // Bước 2: Nếu chưa có thì tạo mới
        const insertSql = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
        db.query(insertSql, [username, email, password], (err, result) => {
            if (err) return res.status(500).json({ message: 'Lỗi khi tạo tài khoản' });
            res.status(200).json({ message: 'Đăng ký thành công!' });
        });
    });
});

// --- API: Đăng nhập ---
app.post('/api/login', (req, res) => {
    const { username, password } = req.body; 
    // Cho phép đăng nhập bằng cả Email hoặc Username
    const sql = "SELECT * FROM users WHERE (email = ? OR username = ?) AND password = ?";
    
    db.query(sql, [username, username, password], (err, results) => {
        if (err) return res.status(500).json({ message: 'Lỗi server' });
        
        if (results.length > 0) {
            const user = results[0];
            // Trả về thông tin cơ bản (không trả về password)
            res.status(200).json({ 
                message: 'Đăng nhập thành công!',
                user: { id: user.id, username: user.username, email: user.email, role: user.user_level }
            });
        } else {
            res.status(401).json({ message: 'Sai tài khoản hoặc mật khẩu!' });
        }
    });
});


// =======================================================
// 5. CÁC API VỀ NGƯỜI DÙNG (USER PROFILE)
// =======================================================

// --- Lấy thông tin chi tiết user ---
app.get('/api/user/:id', (req, res) => {
    const sql = "SELECT id, username, email, avatar_url, dob, gender, phone, address, user_level FROM users WHERE id = ?";
    db.query(sql, [req.params.id], (err, result) => {
        if (err) return res.status(500).json({ message: 'Lỗi server' });
        if (result.length === 0) return res.status(404).json({ message: 'User không tồn tại' });
        res.json(result[0]);
    });
});

// --- Cập nhật thông tin user ---
app.put('/api/user/update', (req, res) => {
    const { id, field, value } = req.body;
    
    // Bảo mật: Chỉ cho phép sửa những trường này
    const allowedFields = ['dob', 'gender', 'phone', 'address', 'email', 'avatar_url'];
    
    if (!allowedFields.includes(field)) {
        return res.status(400).json({ message: 'Không được phép sửa trường dữ liệu này!' });
    }

    const sql = `UPDATE users SET ${field} = ? WHERE id = ?`;
    db.query(sql, [value, id], (err, result) => {
        if (err) {
            console.error(err);
            if (err.code === 'ER_DUP_ENTRY') { // Lỗi trùng lặp (ví dụ trùng email)
                 return res.status(400).json({ message: 'Dữ liệu này đã tồn tại (ví dụ: Email trùng)!' });
            }
            return res.status(500).json({ message: 'Lỗi cập nhật' });
        }
        res.status(200).json({ message: 'Cập nhật thành công!' });
    });
});

// --- Xóa tài khoản (Dành cho Admin hoặc User tự xóa) ---
app.delete('/api/user/delete/:id', (req, res) => {
    const { id } = req.params;
    const sql = "DELETE FROM users WHERE id = ?";
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json({ message: 'Lỗi server khi xóa user' });
        res.status(200).json({ message: 'Đã xóa tài khoản vĩnh viễn!' });
    });
});

// --- Lấy danh sách tất cả user (Dành cho Admin) ---
app.get('/api/users', (req, res) => {
    const sql = "SELECT id, username, email, created_at FROM users ORDER BY id DESC";
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ message: 'Lỗi lấy danh sách' });
        res.json(results);
    });
});


// =======================================================
// 6. CÁC API VỀ BÀI VIẾT (ARTICLES)
// =======================================================

// --- Thêm bài viết mới ---
app.post('/api/add-article', (req, res) => {
    const { title, summary, category, content, image_url } = req.body;
    
    const sql = `INSERT INTO articles (title, summary, category, content, image_url) VALUES (?, ?, ?, ?, ?)`;
    db.query(sql, [title, summary, category, content, image_url], (err, result) => {
        if (err) {
            console.error("Lỗi SQL:", err);
            return res.status(500).json({ message: 'Lỗi lưu bài viết vào Database' });
        }
        res.status(200).json({ message: 'Đăng bài thành công!', id: result.insertId });
    });
});

// --- Lấy tất cả bài viết (Mới nhất lên đầu) ---
app.get('/api/articles', (req, res) => {
    const sql = "SELECT * FROM articles ORDER BY created_at DESC";
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ message: 'Lỗi lấy dữ liệu' });
        res.json(results);
    });
});

// --- Lấy chi tiết 1 bài viết theo ID ---
app.get('/api/articles/:id', (req, res) => {
    const { id } = req.params;
    const sql = "SELECT * FROM articles WHERE id = ?";
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json({ message: 'Lỗi server' });
        if (result.length === 0) return res.status(404).json({ message: 'Bài viết không tồn tại' });
        res.json(result[0]);
    });
});

// --- Lấy bài viết theo Danh mục (Category) ---
app.get('/api/articles/category/:catName', (req, res) => {
    const { catName } = req.params;
    const sql = "SELECT * FROM articles WHERE category = ? ORDER BY created_at DESC";
    db.query(sql, [catName], (err, results) => {
        if (err) return res.status(500).json({ message: 'Lỗi lấy dữ liệu' });
        res.json(results);
    });
});

// --- Xóa bài viết ---
app.delete('/api/delete-article/:id', (req, res) => {
    const { id } = req.params;
    const sql = "DELETE FROM articles WHERE id = ?";
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json({ message: 'Lỗi server khi xóa bài' });
        res.status(200).json({ message: 'Đã xóa bài viết thành công!' });
    });
});

// =======================================================
// KHỞI ĐỘNG SERVER
// =======================================================
app.listen(PORT, () => {
    console.log(`🚀 Server đang chạy tại: http://localhost:${PORT}`);
    console.log(`📂 Thư mục ảnh mở tại: http://localhost:${PORT}/uploads`);
});