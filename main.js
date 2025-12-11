/* =========================================
   LOGIC XỬ LÝ TRANG CHI TIẾT (DETAIL)
   ========================================= */

const DETAIL_API = 'https://thietkeweb-8kq5.onrender.com/api';

document.addEventListener('DOMContentLoaded', async function() {
    // 1. Lấy ID từ URL (Ví dụ: detail.html?id=5)
    const urlParams = new URLSearchParams(window.location.search);
    const baivietId = urlParams.get('id');

    if (!baivietId) {
        hienThiLoi("Không tìm thấy ID bài viết trên thanh địa chỉ.");
        return;
    }

    try {
        // 2. Gọi API lấy chi tiết bài viết từ Server
        const res = await fetch(`${DETAIL_API}/articles/${baivietId}`);
        
        if (!res.ok) {
            throw new Error("Bài viết không tồn tại hoặc đã bị xóa.");
        }

        const baiViet = await res.json();
        
        // Debug: Kiểm tra dữ liệu xem có image_url không
        console.log("Dữ liệu chi tiết:", baiViet);

        // 3. Hiển thị dữ liệu lên giao diện HTML
        document.title = baiViet.title; // Đổi tên tab trình duyệt

        // Điền dữ liệu
        document.getElementById('d-category').innerText = baiViet.category || 'Tin tức';
        document.getElementById('d-title').innerText = baiViet.title;
        document.getElementById('d-summary').innerText = baiViet.summary || '';
        document.getElementById('d-date').innerText = new Date(baiViet.created_at).toLocaleString('vi-VN');
        
        // Xử lý nội dung (HTML)
        let noiDung = baiViet.content || '';
        if (noiDung.indexOf('<p>') === -1) {
    
            let cacDoanVan = noiDung.split('\n');
    
    
            noiDung = cacDoanVan
                .filter(doan => doan.trim() !== '') 
                .map(doan => `<p>${doan}</p>`)      
                .join('');
        }

document.getElementById('d-content').innerHTML = noiDung;

        // Xử lý ảnh
        const imgElement = document.getElementById('d-img');
        
        // Kiểm tra biến image_url (đã sửa từ image thành image_url để khớp database)
        if (baiViet.image_url && baiViet.image_url !== 'null' && baiViet.image_url !== '') {
            imgElement.src = baiViet.image_url;
            imgElement.style.display = 'block';
            
            // Thêm xử lý nếu link ảnh chết (404)
            imgElement.onerror = function() {
                this.src = 'https://placehold.co/800x400?text=Anh+Loi+Link';
            };
        } else {
            imgElement.style.display = 'none';
        }

    } catch (error) {
        console.error(error);
        hienThiLoi("Không tìm thấy bài viết hoặc lỗi kết nối Server.");
    }
}); // <-- Đã thêm dấu đóng ngoặc ở đây

function hienThiLoi(message) {
    document.getElementById('d-title').innerText = "Thông báo lỗi";
    document.getElementById('d-summary').innerText = message;
    document.getElementById('d-content').innerHTML = `<a href="index.html" style="color:red; font-weight:bold;">← Quay lại trang chủ</a>`;
    document.getElementById('d-img').style.display = 'none';
}