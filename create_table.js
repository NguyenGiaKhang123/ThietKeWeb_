require('dotenv').config();
const mysql = require('mysql2');

// Lấy thông tin từ file .env của bạn
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    ssl: { rejectUnauthorized: false } // Dòng quan trọng để kết nối Aiven
});

console.log("⏳ Đang kết nối tới Aiven...");

connection.connect((err) => {
    if (err) {
        console.error("❌ Kết nối thất bại: " + err.message);
        return;
    }
    console.log("✅ Kết nối thành công! Đang tiến hành tạo bảng...");

    // 1. Lệnh tạo bảng Articles (Bài viết)
    const sqlArticles = `
        CREATE TABLE IF NOT EXISTS articles (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            image_url TEXT,
            content TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;

    // 2. Lệnh tạo bảng Categories (Danh mục sách)
    const sqlCategories = `
        CREATE TABLE IF NOT EXISTS categories (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL
        )
    `;

    // Thực thi lệnh 1
    connection.query(sqlArticles, (err, result) => {
        if (err) console.error("❌ Lỗi tạo bảng Articles: ", err);
        else console.log("✅ Đã tạo bảng 'articles' thành công!");

        // Thực thi lệnh 2
        connection.query(sqlCategories, (err, result) => {
            if (err) console.error("❌ Lỗi tạo bảng Categories: ", err);
            else console.log("✅ Đã tạo bảng 'categories' thành công!");

            console.log("🎉 Hoàn tất! Bạn có thể chạy lại server.js ngay bây giờ.");
            connection.end(); // Ngắt kết nối
        });
    });
});