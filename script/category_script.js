const API_URL = 'https://thietkeweb-8kq5.onrender.com/api';

// Hàm xử lý ảnh lỗi
function fixImg(url) {
    if (!url || url === 'null' || url === '') return 'https://placehold.co/600x400?text=No+Image';
    return url;
}

// Danh sách tên chuyên mục (từ khóa -> tên hiển thị)
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
    'gocnhin': 'Góc nhìn',
    'thugian': 'Thư giãn'
};

// --- CÁC HÀM GIAO DIỆN ---

// Đóng mở menu sidebar
function toggleSidebar() {
    const sidebarMenu = document.getElementById("sidebarMenu");
    const sidebarOverlay = document.getElementById("sidebarOverlay");
    if (sidebarMenu && sidebarOverlay) {
        sidebarMenu.classList.toggle("active");
        sidebarOverlay.classList.toggle("active");
    }
}

// Mở form đăng nhập
function openLogin() { 
    const loginModal = document.getElementById("loginModal");
    if (loginModal) loginModal.classList.add("active"); 
}

// Đóng form đăng nhập
function closeLogin() { 
    const loginModal = document.getElementById("loginModal");
    if (loginModal) loginModal.classList.remove("active"); 
}


// --- CHẠY KHI TRANG TẢI XONG ---
document.addEventListener('DOMContentLoaded', async function() {
    
    // Hiển thị ngày tháng
    const dateNowElement = document.getElementById('date-now');
    if (dateNowElement) {
        dateNowElement.innerText = new Date().toLocaleDateString('vi-VN', {weekday: 'long', day: 'numeric', month: 'numeric', year: 'numeric'});
    }
    
    // Đóng login khi click ra ngoài
    const loginModal = document.getElementById("loginModal");
    if (loginModal) {
        loginModal.addEventListener("click", function(e) { 
            if (e.target === this) closeLogin(); 
        });
    }

    // 1. Lấy tên chuyên mục từ link (vd: ?cat=thoisu)
    const urlParams = new URLSearchParams(window.location.search);
    const catKey = urlParams.get('cat');

    // 2. Cập nhật tiêu đề trang web
    const catTitle = categoryNames[catKey] || 'Tin tức chung';
    document.getElementById('cat-title').innerText = catTitle; 
    
    const breadElement = document.getElementById('bread-current');
    if (breadElement) breadElement.innerText = catTitle; 

    document.title = `${catTitle} - Báo 247`;

    if (!catKey) {
        document.getElementById('article-list').innerHTML = '<p>Không tìm thấy chuyên mục.</p>';
        return;
    }

    // 3. Tải danh sách bài viết từ Server
    try {
        const res = await fetch(`${API_URL}/articles/category/${catKey}`);
        const articles = await res.json();

        const container = document.getElementById('article-list');
        
        if (articles.length === 0) {
            container.innerHTML = '<p>Chưa có bài viết nào.</p>';
            return;
        }

        // 4. Vẽ bài viết lên giao diện
        let html = '';
        articles.forEach(art => {
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
                        <p class="desc">${art.summary || ''}</p>
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