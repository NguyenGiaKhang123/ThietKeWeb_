require('dotenv').config();
const mysql = require('mysql2');

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
    if (err) {
        console.error("❌ Kết nối thất bại:", err.message);
        return;
    }
    console.log("✅ Đã kết nối Database thành công!");
    runReset();
});

function runReset() {
    // Lệnh 1: Xóa bảng cũ
    const sqlDrop = "DROP TABLE IF EXISTS users";
    
    // Lệnh 2: Tạo bảng mới chuẩn chỉnh
    const sqlCreate = `
        CREATE TABLE users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(50) NOT NULL UNIQUE,
            email VARCHAR(100) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;

    console.log("⏳ Đang xóa bảng cũ...");
    db.query(sqlDrop, (err) => {
        if (err) { console.error("Lỗi xóa bảng:", err); process.exit(1); }
        
        console.log("⏳ Đang tạo bảng mới với cột 'username'...");
        db.query(sqlCreate, (err) => {
            if (err) { console.error("Lỗi tạo bảng:", err); process.exit(1); }
            
            console.log("🎉 THÀNH CÔNG! Database đã được cập nhật.");
            console.log("👉 Bây giờ bạn có thể chạy lại server.js và Đăng ký bình thường.");
            process.exit(0); // Tự động thoát
        });
    });
}