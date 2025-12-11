const API_URL = 'https://thietkeweb-8kq5.onrender.com/api';

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

// Map tên hiển thị
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

// --- HÀM 1: VẼ VEDETTE ---
function renderVedette(articles) {
    if (!articles || articles.length === 0) return;

    const latest = articles[0]; 
    const sub = articles.slice(1, 5);

    const mainContainer = document.querySelector('.vedette-main');
    const subContainer = document.querySelector('.sub-vedette');

    if (mainContainer) {
        mainContainer.innerHTML = `
            <a href="detail.html?id=${latest.id}" class="thumb-wrapper">
                <img src="${fixImg(latest.image_url)}" alt="${latest.title}">
            </a>
            <h1 class="title-serif"><a href="detail.html?id=${latest.id}">${latest.title}</a></h1>
            <p class="desc">${latest.summary || ''}</p>
            <div class="meta">
                <span class="text-red bold">${categoryNames[latest.category] || 'Tin tức'}</span><span class="dot"></span>
                <span class="badge badge-live">MỚI</span> 
                <span>${formatDate(latest.created_at)}</span>
            </div>
        `;
    }

    if (subContainer) {
        let subHtml = '';
        sub.forEach((item, index) => {
            if (index > 0) subHtml += `<div style="border-top:1px solid #f0f0f0"></div>`;
            subHtml += `
                <article class="sub-vedette-item article-card">
                    <h3 class="title-serif"><a href="detail.html?id=${item.id}">${item.title}</a></h3>
                    <div class="meta text-gray">${formatDate(item.created_at)}</div>
                </article>
            `;
        });
        subContainer.innerHTML = subHtml;
    }
}

// --- HÀM 2: VẼ TỪNG CHUYÊN MỤC RIÊNG BIỆT ---
function renderCategorySection(allArticles, catId, displayCount = 4) {
    const section = document.getElementById(catId);
    if (!section) return;

    const catArticles = allArticles.filter(art => art.category === catId).slice(0, displayCount);

    if (catArticles.length === 0) return;

    const firstArticle = catArticles[0];
    const otherArticles = catArticles.slice(1);

    const bigCardHtml = `
        <article class="card-row article-card">
            <a href="detail.html?id=${firstArticle.id}" class="thumb-wrapper">
                <img src="${fixImg(firstArticle.image_url)}" alt="${firstArticle.title}">
            </a>
            <div class="card-content">
                <h3 class="title-serif"><a href="detail.html?id=${firstArticle.id}">${firstArticle.title}</a></h3>
                <p class="desc">${firstArticle.summary || ''}</p>
            </div>
        </article>
    `;

    let smallCardsHtml = '';
    if (otherArticles.length > 0) {
        smallCardsHtml = '<div class="grid-3">';
        otherArticles.forEach(art => {
            smallCardsHtml += `
                <article class="card-stack article-card">
                    <a href="detail.html?id=${art.id}" class="thumb-wrapper">
                        <img src="${fixImg(art.image_url)}" alt="${art.title}">
                    </a>
                    <h3 class="title-serif"><a href="detail.html?id=${art.id}">${art.title}</a></h3>
                </article>
            `;
        });
        smallCardsHtml += '</div>';
    }

    const header = section.querySelector('.cat-header');
    section.innerHTML = '';
    if (header) section.appendChild(header);
    section.insertAdjacentHTML('beforeend', bigCardHtml + smallCardsHtml);
}


// ===============================================
// --- HÀM XỬ LÝ UI (BURGER MENU, LOGIN...) ---
// ===============================================

function toggleSidebar() {
    const sidebarMenu = document.getElementById("sidebarMenu");
    const sidebarOverlay = document.getElementById("sidebarOverlay");
    if (sidebarMenu && sidebarOverlay) {
        sidebarMenu.classList.toggle("active");
        sidebarOverlay.classList.toggle("active");
    }
}

// Các hàm mở/đóng modal login vẫn giữ để hỗ trợ nút "Đăng nhập" ở Header
function openLogin() { 
    const loginModal = document.getElementById("loginModal");
    if (loginModal) loginModal.classList.add("active"); 
}

function closeLogin() { 
    const loginModal = document.getElementById("loginModal");
    if (loginModal) loginModal.classList.remove("active"); 
}


// ===============================================
// --- CHẠY CHÍNH (MAIN) ---
// ===============================================

document.addEventListener('DOMContentLoaded', async function() {
    const dateNowElement = document.getElementById('date-now');
    if (dateNowElement) {
        dateNowElement.innerText = new Date().toLocaleDateString('vi-VN', {weekday: 'long', day: 'numeric', month: 'numeric', year: 'numeric'});
    }

    const loginModal = document.getElementById("loginModal");
    if (loginModal) {
        loginModal.addEventListener("click", function(e) { 
            if (e.target === this) closeLogin(); 
        });
    }

    try {
        const res = await fetch(`${API_URL}/articles`);
        const allArticles = await res.json();
        
        renderVedette(allArticles);

        renderCategorySection(allArticles, 'thoisu');
        renderCategorySection(allArticles, 'thegioi');
        renderCategorySection(allArticles, 'kinhdoanh');
        renderCategorySection(allArticles, 'congnghe');
        renderCategorySection(allArticles, 'thethao');
        renderCategorySection(allArticles, 'giaitri');
        renderCategorySection(allArticles, 'suckhoe');
        renderCategorySection(allArticles, 'giaoduc');
        renderCategorySection(allArticles, 'dulich');

        renderTopArticles(allArticles);

    } catch (error) {
        console.error("Lỗi tải dữ liệu Trang chủ:", error);
    }
});
// --- HÀM 3: VẼ DANH SÁCH XEM NHIỀU (TOP ARTICLES) ---
function renderTopArticles(allArticles) {
    if (!allArticles || allArticles.length === 0) return;

    // Sắp xếp mô phỏng: lấy 5 bài đầu tiên (giả định là tin mới nhất cũng là tin hot)
    const topArticles = allArticles.slice(0, 5); 
    const container = document.querySelector('.rank-list'); 

    if (container) {
        let html = '';
        topArticles.forEach((art, index) => {
            let rankColor = '#888';
            if (index === 0) rankColor = '#e60000'; // Hạng 1 màu đỏ
            else if (index === 1) rankColor = '#04284d'; // Hạng 2 màu xanh đậm
            
            html += `
                <li class="rank-item">
                    <span class="rank-num" style="color:${rankColor}; font-weight:bold; font-size:20px;">${index + 1}</span>
                    <a href="detail.html?id=${art.id}" class="rank-link">${art.title}</a>
                </li>
            `;
        });
        container.innerHTML = html;
    }
    
    // Xóa luôn các placeholder loading nếu có (trên trang chủ)
    const skeletonList = document.querySelector('.sidebar-widget .skeleton');
    if (skeletonList) skeletonList.outerHTML = '';
}
// --- LƯU Ý: ĐÃ XÓA TOÀN BỘ PHẦN LOGIC AUTH Ở ĐÂY ---
// Logic auth sẽ được xử lý hoàn toàn bởi file script/auth.js
// để tránh xung đột sự kiện (như lỗi bấm vào tên bị đăng xuất).