// upgrade_db.js
require('dotenv').config();
const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    ssl: { rejectUnauthorized: false }
});

connection.connect(err => {
    if (err) throw err;
    console.log("⏳ Đang nâng cấp Database...");

    // Lệnh thêm cột summary và category vào bảng articles
    const sql = `
        ALTER TABLE articles 
        ADD COLUMN summary TEXT AFTER title,
        ADD COLUMN category VARCHAR(50) AFTER summary;
    `;

    connection.query(sql, (err, result) => {
        if (err) {
            console.log("⚠️ Có thể bạn đã nâng cấp rồi (Lỗi: " + err.code + ")");
        } else {
            console.log("✅ Đã thêm cột 'summary' và 'category' thành công!");
        }
        connection.end();
    });
});