require('dotenv').config(); // 👈 BẮT BUỘC CÓ DÒNG NÀY Ở TRÊN CÙNG

const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());

// 1. Cấu hình kết nối lấy từ file .env
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

// Kiểm tra kết nối ngay khi chạy server
connection.getConnection((err, conn) => {
    if (err) {
        console.error("❌ Lỗi kết nối Database Aiven:", err.message);
    } else {
        console.log("✅ Đã kết nối thành công tới Database Aiven!");
        conn.release();
    }
});

// 2. API Endpoint
app.get('/api/articles', (req, res) => {
    // Lưu ý: Kiểm tra lại tên bảng là 'news' hay 'Articles'
    const sql = "SELECT * FROM articles LIMIT 1000"; 

    connection.query(sql, (err, results) => {
        if (err) {
            console.error("Lỗi truy vấn:", err);
            return res.status(500).json({ error: "Lỗi server khi lấy bài viết" });
        }
        res.json(results);
    });
});

// 2.2 API: Lấy chi tiết 1 bài viết theo ID
// Frontend gọi: GET http://localhost:3000/api/news/1
app.get('/api/news/:id', (req, res) => {
    const id = req.params.id; // Lấy số id từ đường dẫn

    // SQL xịn: Lấy bài viết + Tên tác giả + Tên danh mục
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

        // Nếu không tìm thấy bài nào có ID này
        if (results.length === 0) {
            return res.status(404).json({ error: "Không tìm thấy bài viết" });
        }

        // Trả về kết quả đầu tiên (vì ID là duy nhất)
        res.json(results[0]);
    });
});

// 2.3 API: Lấy danh sách TẤT CẢ Danh mục (Để vẽ Menu)
// Frontend gọi: GET http://localhost:3000/api/categories
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

// 2.4 API: Lấy các bài viết thuộc 1 Danh mục cụ thể
// Frontend gọi: GET http://localhost:3000/api/news/category/1
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
    // Lưu ý: ORDER BY ... DESC để bài mới nhất hiện lên đầu

    connection.query(sql, [categoryId], (err, results) => {
        if (err) {
            console.error("Lỗi lọc bài viết:", err);
            return res.status(500).json({ error: "Lỗi Server" });
        }
        // Trả về danh sách bài viết (mảng)
        res.json(results);
    });
});

// ... (Đoạn code chạy server ở dưới cùng) ...

// 3. Chạy server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server Backend đang chạy tại: http://localhost:${PORT}`);
});

