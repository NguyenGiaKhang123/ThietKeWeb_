require('dotenv').config(); // BẮT BUỘC CÓ DÒNG NÀY Ở TRÊN CÙNG

const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const jwt = require('jsonwebtoken'); // Thư viện tạo token đăng nhập

const app = express();
app.use(cors());
app.use(express.json()); // BẮT BUỘC: Để đọc được dữ liệu JSON từ form đăng nhập/đăng ký

// 1. Cấu hình kết nối Database
const connection = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    ssl: {
        rejectUnauthorized: false
    },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Kiểm tra kết nối
connection.getConnection((err, conn) => {
    if (err) {
        console.error("❌ Lỗi kết nối Database:", err.message);
    } else {
        console.log("✅ Đã kết nối thành công tới Database!");
        conn.release();
    }
});

// ==========================================
// PHẦN 1: API XÁC THỰC (ĐĂNG KÝ & ĐĂNG NHẬP)
// ==========================================

// 1.1 Đăng ký (Lưu mật khẩu thô - Dễ nhất)
app.post('/api/auth/register', (req, res) => {
    const { username, password, full_name } = req.body;

    // Kiểm tra dữ liệu gửi lên
    if (!username || !password || !full_name) {
        return res.status(400).json({ error: "Vui lòng điền đầy đủ thông tin" });
    }

    // Câu lệnh lưu user mới (Mặc định role là 'reader')
    const sql = "INSERT INTO users (username, password, full_name, role) VALUES (?, ?, ?, 'reader')";

    connection.query(sql, [username, password, full_name], (err, result) => {
        if (err) {
            // Lỗi 1062 là lỗi trùng tên đăng nhập (Duplicate entry)
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ error: "Tên đăng nhập đã tồn tại" });
            }
            console.error("Lỗi đăng ký:", err);
            return res.status(500).json({ error: "Lỗi Server" });
        }
        res.status(201).json({ message: "Đăng ký thành công!" });
    });
});

// 1.2 Đăng nhập (So sánh mật khẩu thô)
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;

    const sql = "SELECT * FROM users WHERE username = ?";
    connection.query(sql, [username], (err, results) => {
        if (err) return res.status(500).json({ error: "Lỗi Server" });
        
        // Nếu không tìm thấy user
        if (results.length === 0) {
            return res.status(401).json({ error: "Sai tên đăng nhập hoặc mật khẩu" });
        }

        const user = results[0];

        // So sánh mật khẩu trực tiếp
        if (user.password !== password) {
            return res.status(401).json({ error: "Sai tên đăng nhập hoặc mật khẩu" });
        }

        // Tạo Token (Thẻ bài chứng minh đã đăng nhập)
        // 'mat_khau_bi_mat_123' là khóa bí mật, bạn có thể đổi tùy ý
        const token = jwt.sign(
            { id: user.user_id, role: user.role, name: user.full_name },
            'mat_khau_bi_mat_123', 
            { expiresIn: '24h' }
        );

        // Trả về kết quả
        res.json({
            message: "Đăng nhập thành công",
            token: token,
            user: {
                id: user.user_id,
                username: user.username,
                full_name: user.full_name,
                role: user.role
            }
        });
    });
});

// ==========================================
// PHẦN 2: API TIN TỨC (CODE CŨ CỦA BẠN)
// ==========================================

// 2.1 Lấy danh sách bài viết
app.get('/api/articles', (req, res) => {
    const sql = "SELECT * FROM articles LIMIT 1000"; 
    connection.query(sql, (err, results) => {
        if (err) {
            console.error("Lỗi truy vấn:", err);
            return res.status(500).json({ error: "Lỗi server khi lấy bài viết" });
        }
        res.json(results);
    });
});

// 2.2 Lấy chi tiết 1 bài viết theo ID
app.get('/api/news/:id', (req, res) => {
    const id = req.params.id;
    const sql = `
        SELECT 
            a.*, 
            c.name AS category_name, 
            u.full_name AS author_name 
        FROM articles a
        LEFT JOIN categories c ON a.category_id = c.category_id
        LEFT JOIN users u ON a.user_id = u.user_id
        WHERE a.article_id = ?
    `;

    connection.query(sql, [id], (err, results) => {
        if (err) {
            console.error("Lỗi lấy chi tiết:", err);
            return res.status(500).json({ error: "Lỗi Server" });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: "Không tìm thấy bài viết" });
        }
        res.json(results[0]);
    });
});

// 2.3 Lấy danh sách TẤT CẢ Danh mục
app.get('/api/categories', (req, res) => {
    const sql = "SELECT * FROM categories";
    connection.query(sql, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Lỗi lấy danh mục" });
        }
        res.json(results);
    });
});

// 2.4 Lấy bài viết thuộc 1 Danh mục cụ thể
app.get('/api/news/category/:id', (req, res) => {
    const categoryId = req.params.id;
    const sql = `
        SELECT 
            a.*, 
            c.name AS category_name, 
            u.full_name AS author_name 
        FROM articles a
        JOIN categories c ON a.category_id = c.category_id
        LEFT JOIN users u ON a.user_id = u.user_id
        WHERE a.category_id = ?
        ORDER BY a.published_at DESC 
    `;

    connection.query(sql, [categoryId], (err, results) => {
        if (err) {
            console.error("Lỗi lọc bài viết:", err);
            return res.status(500).json({ error: "Lỗi Server" });
        }
        res.json(results);
    });
});

// 3. Chạy server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server Backend đang chạy tại: http://localhost:${PORT}`);
});