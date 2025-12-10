const API_URL = 'http://localhost:4000/api'; // Đảm bảo đúng cổng Server

// Hàm sửa ảnh lỗi
function fixImg(url) {
    if (!url || url === 'null' || url === '') return 'https://placehold.co/600x400?text=No+Image';
    return url;
}

// Hàm format ngày
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.getDate()}/${date.getMonth() + 1}`;
}

// --- HÀM CHÍNH: TẢI VÀ CHIA BÀI VIẾT ---
async function initHomePage() {
    try {
        const res = await fetch(`${API_URL}/articles`);
        const articles = await res.json();

        if (!articles || articles.length === 0) return;

        // 1. Xử lý phần Vedette (Lấy bài mới nhất)
        renderVedette(articles);

        document.querySelector('.vedette-main').innerHTML = `
        <a href="detail.html?id=${latest.id}" class="thumb-wrapper">
            <img src="${fixImg(latest.image_url)}" 
                 alt="${latest.title}" 
                 onerror="this.src='https://placehold.co/800x400?text=Anh+Loi+Link'">
        </a>
        <h1 class="title-serif"><a href="detail.html?id=${latest.id}">${latest.title}</a></h1>
        <p class="desc">${latest.summary || ''}</p>
        <div class="meta">
            <span class="badge badge-live">MỚI</span> 
            <span>${formatDate(latest.created_at)}</span>
        </div>
    `;

        // 2. Chia bài về các chuyên mục
        // Lưu ý: Nếu database chưa có cột category chuẩn, bạn có thể tạm thời chia theo số lượng bài để test
        // Ví dụ: thoisu = articles.slice(5, 9);
        
        const thoisu = articles.filter(a => a.category === 'thoisu');
        const thegioi = articles.filter(a => a.category === 'thegioi');
        const kinhdoanh = articles.filter(a => a.category === 'kinhdoanh');
        const congnghe = articles.filter(a => a.category === 'congnghe');
        const thethao = articles.filter(a => a.category === 'thethao');
        const giaitri = articles.filter(a => a.category === 'giaitri');
        const suckhoe = articles.filter(a => a.category === 'suckhoe');
        const giaoduc = articles.filter(a => a.category === 'giaoduc');
        const dulich = articles.filter(a => a.category === 'dulich');

        fillSection('thoisu', thoisu);
        fillSection('thegioi', thegioi);
        fillSection('kinhdoanh', kinhdoanh);
        fillSection('congnghe', congnghe);
        fillSection('thethao', thethao);
        fillSection('giaitri', giaitri);
        fillSection('suckhoe', suckhoe);
        fillSection('giaoduc', giaoduc);
        fillSection('dulich', dulich);

    } catch (error) {
        console.error("Lỗi tải trang chủ:", error);
    }
}

// --- HÀM VẼ VEDETTE (TIN NỔI BẬT) ---
function renderVedette(articles) {
    const latest = articles[0]; // Bài mới nhất
    const sub = articles.slice(1, 4); // 3 bài tiếp theo

    // Render bài to nhất (Vedette Main)
    // CHÚ Ý: href="detail.html?id=${latest.id}" -> Đây là chỗ tạo link
    document.querySelector('.vedette-main').innerHTML = `
        <a href="detail.html?id=${latest.id}" class="thumb-wrapper">
            <img src="${fixImg(latest.image_url)}" alt="${latest.title}">
        </a>
        <h1 class="title-serif"><a href="detail.html?id=${latest.id}">${latest.title}</a></h1>
        <p class="desc">${latest.summary || ''}</p>
        <div class="meta">
            <span class="badge badge-live">MỚI</span> 
            <span>${formatDate(latest.created_at)}</span>
        </div>
    `;

    // Render 3 bài nhỏ bên cạnh
    const subContainer = document.querySelector('.sub-vedette');
    subContainer.innerHTML = '';
    sub.forEach(item => {
        subContainer.innerHTML += `
            <article class="sub-vedette-item article-card">
                <h3 class="title-serif"><a href="detail.html?id=${item.id}">${item.title}</a></h3>
                <div class="meta text-gray">${formatDate(item.created_at)}</div>
            </article>
            <div style="border-top:1px solid #f0f0f0"></div>
        `;
    });
}

// --- HÀM ĐỔ DỮ LIỆU VÀO TỪNG CHUYÊN MỤC ---
function fillSection(sectionId, data) {
    const section = document.getElementById(sectionId);
    if (!section || data.length === 0) return;

    const first = data[0]; 
    const others = data.slice(1, 4); 

    const bigCard = section.querySelector('.card-row');
    if (bigCard) {
        bigCard.innerHTML = `
            <a href="detail.html?id=${first.id}" class="thumb-wrapper">
                <img src="${fixImg(first.image_url)}" 
                     alt="${first.title}"
                     onerror="this.src='https://placehold.co/800x400?text=Anh+Loi+Link'">
            </a>
            <div class="card-content">
                <h3 class="title-serif"><a href="detail.html?id=${first.id}">${first.title}</a></h3>
                <p class="desc">${first.summary || ''}</p>
            </div>
        `;
    }
    
    // Sửa tương tự cho phần smallGrid nếu cần

    // Tìm thẻ chứa 3 bài nhỏ (grid-3)
    const smallGrid = section.querySelector('.grid-3');
    if (smallGrid) {
        // CHÚ Ý: href="detail.html?id=${item.id}"
        smallGrid.innerHTML = others.map(item => `
            <article class="card-stack article-card">
                <a href="detail.html?id=${item.id}" class="thumb-wrapper">
                    <img src="${fixImg(item.image_url)}" alt="${item.title}">
                </a>
                <h3 class="title-serif"><a href="detail.html?id=${item.id}">${item.title}</a></h3>
            </article>
        `).join('');
    }
}

// --- CÁC SỰ KIỆN KHÁC (GIỮ NGUYÊN) ---
document.getElementById('date-now').innerText = new Date().toLocaleDateString('vi-VN', {weekday: 'long', day: 'numeric', month: 'numeric', year: 'numeric'});
window.onscroll = function() {
    var btn = document.getElementById("back-to-top");
    if (window.pageYOffset > 300) btn.classList.add("visible"); else btn.classList.remove("visible");
};
function openLogin() { document.getElementById("loginModal").classList.add("active"); }
function closeLogin() { document.getElementById("loginModal").classList.remove("active"); }
document.getElementById("loginModal").addEventListener("click", function(e) { if (e.target === this) closeLogin(); });
function toggleSidebar() {
    document.getElementById("sidebarMenu").classList.toggle("active");
    document.getElementById("sidebarOverlay").classList.toggle("active");
}

// Chạy hàm lấy dữ liệu ngay khi web tải xong
initHomePage();