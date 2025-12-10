require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

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
app.use(express.json()); // QUAN TRỌNG: Để server đọc được JSON từ admin.html gửi lên

// --- API 1: ĐĂNG BÀI VIẾT (Dùng Link Ảnh) ---
// Lưu ý: Đã bỏ 'upload.single' vì không còn upload file nữa
app.post('/api/add-article', (req, res) => {
    // Lấy dữ liệu từ body (admin.html gửi lên dạng JSON)
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

app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
});