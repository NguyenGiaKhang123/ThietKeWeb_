-- 1. Xóa bảng cũ nếu tồn tại (Làm mới database)
DROP TABLE IF EXISTS users;

-- 2. Tạo bảng users cơ bản
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Thêm tất cả các cột phụ (Bao gồm cả avatar_url và các thông tin cá nhân)
ALTER TABLE users 
ADD COLUMN avatar_url TEXT DEFAULT NULL AFTER email,
ADD COLUMN dob VARCHAR(20) DEFAULT NULL,
ADD COLUMN gender VARCHAR(20) DEFAULT 'Không chia sẻ',
ADD COLUMN phone VARCHAR(20) DEFAULT NULL,
ADD COLUMN address TEXT DEFAULT NULL,
ADD COLUMN user_level VARCHAR(50) DEFAULT 'Thành viên mới';