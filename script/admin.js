// script/admin_script.js

const API_URL = 'https://thietkeweb-8kq5.onrender.com/api';

// --- PHẦN 1: QUẢN LÝ BÀI VIẾT ---

async function dangBai() {
    const dataToSend = {
        title: document.getElementById('title').value,
        summary: document.getElementById('summary').value,
        category: document.getElementById('category').value,
        content: document.getElementById('content').value,
        image_url: document.getElementById('imageUrl').value
    };

    if(!dataToSend.title) return alert("Vui lòng nhập tiêu đề!");

    try {
        const res = await fetch(`${API_URL}/add-article`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dataToSend)
        });

        if (res.ok) {
            alert("Đăng bài thành công!");
            // Reset form
            document.getElementById('title').value = "";
            document.getElementById('summary').value = "";
            document.getElementById('content').value = "";
            document.getElementById('imageUrl').value = "";
            
            taiDanhSachBaiViet(); // Reload danh sách
        } else {
            alert("Lỗi server!");
        }
    } catch (e) { console.error(e); }
}

async function taiDanhSachBaiViet() {
    try {
        const res = await fetch(`${API_URL}/articles`);
        const articles = await res.json();
        
        const listDiv = document.getElementById('article-list');
        
        if(articles.length === 0) {
            listDiv.innerHTML = '<p style="text-align:center; color:#999">Chưa có bài viết nào.</p>';
            return;
        }

        let html = '';
        articles.forEach(art => {
            html += `
                <div class="list-item">
                    <div class="item-info">
                        <h4>${art.title}</h4>
                        <span>${art.category}</span> <span style="color:#aaa">ID: ${art.id}</span>
                    </div>
                    <button class="btn-delete" onclick="xoaBai(${art.id})">Xóa</button>
                </div>
            `;
        });
        listDiv.innerHTML = html;
    } catch (e) { console.error(e); }
}

async function xoaBai(id) {
    if(!confirm("Xóa bài viết này?")) return;
    try {
        const res = await fetch(`${API_URL}/delete-article/${id}`, { method: 'DELETE' });
        if (res.ok) { 
            alert("Đã xóa!"); 
            taiDanhSachBaiViet(); 
        }
    } catch (e) { alert("Lỗi kết nối!"); }
}

// --- PHẦN 2: QUẢN LÝ USER ---

async function taiDanhSachUser() {
    try {
        const res = await fetch(`${API_URL}/users`);
        const users = await res.json();
        
        const listDiv = document.getElementById('user-list');
        
        if(users.length === 0) {
            listDiv.innerHTML = '<p style="text-align:center; color:#999">Chưa có thành viên nào.</p>';
            return;
        }

        let html = '';
        users.forEach(u => {
            html += `
                <div class="list-item">
                    <div class="item-info user-info">
                        <h4>${u.username} <span style="background:#eee; color:#666;">ID: ${u.id}</span></h4>
                        <p> Email: ${u.email}</p>
                        <p> Pass: <span class="user-pass">${u.password}</span></p>
                    </div>
                    <button class="btn-delete" onclick="xoaUser(${u.id})">Xóa</button>
                </div>
            `;
        });
        listDiv.innerHTML = html;
    } catch (e) { 
        console.error(e);
        document.getElementById('user-list').innerHTML = '<p style="color:red">Lỗi tải danh sách User</p>';
    }
}

async function xoaUser(id) {
    if(!confirm("CẢNH BÁO: Bạn có chắc muốn xóa vĩnh viễn tài khoản này?")) return;
    try {
        const res = await fetch(`${API_URL}/user/delete/${id}`, { method: 'DELETE' });
        if (res.ok) { 
            alert("Đã xóa tài khoản thành công!"); 
            taiDanhSachUser(); 
        } else {
            alert("Lỗi khi xóa!");
        }
    } catch (e) { alert("Lỗi kết nối!"); }
}

// KHỞI CHẠY KHI TRANG TẢI XONG
document.addEventListener('DOMContentLoaded', () => {
    taiDanhSachBaiViet();
    taiDanhSachUser();

});
