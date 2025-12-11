const API_URL = 'https://thietkeweb-8kq5.onrender.com/api';

// Hàm sửa ảnh lỗi (Giữ nguyên)
function fixImg(url) {
    if (!url || url === 'null' || url === '') return 'https://placehold.co/600x400?text=No+Image';
    return url;
}

// Map tên tiếng Anh sang tiếng Việt để hiển thị tiêu đề
const categoryNames = {
    'thoisu': 'Thời sự',
    'thegioi': 'Thế giới',
    'kinhdoanh': 'Kinh doanh',
    'congnghe': 'Công nghệ',
    'thethao': 'Thể thao',
    'giaitri': 'Giải trí',
    'suckhoe': 'Sức khỏe',
    'giaoduc': 'Giáo dục',
    'dulich': 'Du lịch',
    'gocnhin': 'Góc nhìn',  // <--- Đã thêm
    'thugian': 'Thư giãn'   // <--- Đã thêm
};

// ===============================================
// --- HÀM XỬ LÝ UI (CẦN THIẾT CHO ONCLICK TRONG HTML) ---
// ===============================================

// Hàm mở/đóng Sidebar
function toggleSidebar() {
    const sidebarMenu = document.getElementById("sidebarMenu");
    const sidebarOverlay = document.getElementById("sidebarOverlay");
    if (sidebarMenu && sidebarOverlay) {
        sidebarMenu.classList.toggle("active");
        sidebarOverlay.classList.toggle("active");
    }
}

// Hàm mở Modal Login
function openLogin() { 
    const loginModal = document.getElementById("loginModal");
    if (loginModal) {
        loginModal.classList.add("active"); 
    }
}

// Hàm đóng Modal Login
function closeLogin() { 
    const loginModal = document.getElementById("loginModal");
    if (loginModal) {
        loginModal.classList.remove("active"); 
    }
}


document.addEventListener('DOMContentLoaded', async function() {
    // Cập nhật ngày tháng trên header
    const dateNowElement = document.getElementById('date-now');
    if (dateNowElement) {
        dateNowElement.innerText = new Date().toLocaleDateString('vi-VN', {weekday: 'long', day: 'numeric', month: 'numeric', year: 'numeric'});
    }
    
    // Xử lý đóng Modal khi click ra ngoài
    const loginModal = document.getElementById("loginModal");
    if (loginModal) {
        loginModal.addEventListener("click", function(e) { 
            if (e.target === this) closeLogin(); 
        });
    }

    // 1. Lấy tham số 'cat' từ URL (ví dụ: category.html?cat=thoisu)
    const urlParams = new URLSearchParams(window.location.search);
    const catKey = urlParams.get('cat');

    // Cập nhật tiêu đề trang
    const catTitle = categoryNames[catKey] || 'Tin tức chung';
    
    // --- CẬP NHẬT GIAO DIỆN ---
    document.getElementById('cat-title').innerText = catTitle; // Tiêu đề lớn
    
    // Sửa breadcrumb (Trang chủ / Tên chuyên mục)
    const breadElement = document.getElementById('bread-current');
    if (breadElement) {
        breadElement.innerText = catTitle; 
    }

    document.title = `${catTitle} - Báo 247`;

    if (!catKey) {
        document.getElementById('article-list').innerHTML = '<p>Không tìm thấy chuyên mục.</p>';
        return;
    }

    try {
        // 2. Gọi API lấy bài viết theo chuyên mục
        const res = await fetch(`${API_URL}/articles/category/${catKey}`);
        const articles = await res.json();

        const container = document.getElementById('article-list');
        
        if (articles.length === 0) {
            container.innerHTML = '<p>Chưa có bài viết nào trong chuyên mục này.</p>';
            return;
        }

        // 3. Hiển thị danh sách bài viết
        let html = '';
        articles.forEach(art => {
            // Xử lý ảnh (nếu lỗi hoặc null thì dùng ảnh placeholder)
            let imgUrl = fixImg(art.image_url);

            html += `
                <article class="card-row article-card">
                    <a href="detail.html?id=${art.id}" class="thumb-wrapper">
                        <img src="${imgUrl}" alt="${art.title}" onerror="this.src='https://placehold.co/800x400?text=Loi+Anh'">
                    </a>
                    <div class="card-content">
                        <h3 class="title-serif" style="margin-top:0;">
                            <a href="detail.html?id=${art.id}">${art.title}</a>
                        </h3>
                        <div class="meta" style="margin-bottom: 10px;">
                            <span class="text-red bold">${catTitle}</span>
                            <span class="dot"></span>
                            <span>${new Date(art.created_at).toLocaleDateString('vi-VN')}</span>
                        </div>
                        <p class="desc">${art.summary || 'Không có mô tả.'}</p>
                    </div>
                </article>
            `;
        });

        container.innerHTML = html;

    } catch (error) {
        console.error(error);
        document.getElementById('article-list').innerHTML = '<p style="color:red">Lỗi kết nối Server.</p>';
    }
});
