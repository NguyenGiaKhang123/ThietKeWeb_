const API_URL = 'http://localhost:3000/api';

// Hàm sửa lỗi ảnh
function fixImg(url) {
    if (!url || url === 'null') return 'https://placehold.co/600x400?text=No+Image';
    if (url.includes('drive.google.com')) {
        let id = '';
        const parts = url.split(/\/d\/|id=/);
        if (parts.length > 1) id = parts[1].split('/')[0];
        if (id) return `https://lh3.googleusercontent.com/d/${id}`;
    }
    return url;
}

// Hàm format ngày
function formatDate(dateString) {
    if(!dateString) return '';
    const date = new Date(dateString);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
}

// --- 1. LOAD TRANG CHỦ: VEDETTE ---
async function loadVedette() {
    try {
        const res = await fetch(`${API_URL}/articles`);
        const data = await res.json();
        if (data.length === 0) return;

        const bigNews = data[0];
        const subNews = data.slice(1, 4);

        // LƯU Ý: href="detail.html?id=${...}"
        document.getElementById('vedette-area').innerHTML = `
            <div class="vedette-grid">
                <article class="vedette-main article-card">
                    <a href="detail.html?id=${bigNews.article_id}" class="thumb-wrapper">
                        <img src="${fixImg(bigNews.thumbnail_url)}" onerror="this.src='https://placehold.co/800x450?text=Loi+Anh'" referrerpolicy="no-referrer">
                    </a>
                    <h1 class="title-serif"><a href="detail.html?id=${bigNews.article_id}">${bigNews.title}</a></h1>
                    <p class="desc">${bigNews.summary}</p>
                    <div class="meta"><span class="badge badge-live">MỚI</span> ${formatDate(bigNews.published_at)}</div>
                </article>

                <div class="sub-vedette">
                    ${subNews.map(news => `
                        <article class="sub-vedette-item article-card">
                            <h3 class="title-serif"><a href="detail.html?id=${news.article_id}">${news.title}</a></h3>
                            <div class="meta text-gray">${formatDate(news.published_at)}</div>
                        </article>
                        <div style="border-top:1px solid #f0f0f0"></div>
                    `).join('')}
                </div>
            </div>
        `;
    } catch (e) { console.error(e); }
}

// --- 2. LOAD TRANG CHỦ: CATEGORIES ---
async function loadCategories() {
    try {
        const resCat = await fetch(`${API_URL}/categories`);
        const categories = await resCat.json();
        const container = document.getElementById('category-container');
        const nav = document.getElementById('main-nav');
        
        container.innerHTML = '';
        nav.innerHTML = '<a href="index.html" class="nav-link highlight">Trang chủ</a>'; // Link về Home

        for (const cat of categories) {
            nav.innerHTML += `<a href="#cat-${cat.category_id}" class="nav-link">${cat.name}</a>`;

            const resNews = await fetch(`${API_URL}/news/category/${cat.category_id}`);
            const newsList = await resNews.json();

            if (newsList.length > 0) {
                const first = newsList[0];
                const others = newsList.slice(1, 4);

                // LƯU Ý: href="detail.html?id=${...}"
                container.innerHTML += `
                    <section id="cat-${cat.category_id}" class="cat-section">
                        <div class="cat-header"><h2 class="cat-title"><a href="#">${cat.name}</a></h2></div>
                        
                        <article class="card-row article-card">
                            <a href="detail.html?id=${first.article_id}" class="thumb-wrapper">
                                <img src="${fixImg(first.thumbnail_url)}" onerror="this.src='https://placehold.co/300x200?text=Loi+Anh'" referrerpolicy="no-referrer">
                            </a>
                            <div class="card-content">
                                <h3 class="title-serif"><a href="detail.html?id=${first.article_id}">${first.title}</a></h3>
                                <p class="desc">${first.summary}</p>
                            </div>
                        </article>

                        <div class="grid-3">
                            ${others.map(n => `
                                <article class="card-stack article-card">
                                    <a href="detail.html?id=${n.article_id}" class="thumb-wrapper">
                                        <img src="${fixImg(n.thumbnail_url)}" onerror="this.src='https://placehold.co/220x140?text=Loi+Anh'" referrerpolicy="no-referrer">
                                    </a>
                                    <h3 class="title-serif"><a href="detail.html?id=${n.article_id}">${n.title}</a></h3>
                                </article>
                            `).join('')}
                        </div>
                    </section>
                `;
            }
        }
    } catch (e) { console.error(e); }
}

// --- 3. LOAD TRANG DETAIL ---
async function loadArticleDetail() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (!id) return;

    try {
        const res = await fetch(`${API_URL}/news/${id}`);
        if (!res.ok) {
            document.getElementById('d-title').innerText = "Không tìm thấy bài viết!";
            return;
        }
        const article = await res.json();

        document.title = article.title;
        document.getElementById('d-category').innerText = article.category_name || 'Tin tức';
        document.getElementById('d-title').innerText = article.title;
        document.getElementById('d-author').innerText = article.author_name || 'Admin';
        document.getElementById('d-date').innerText = formatDate(article.published_at);
        document.getElementById('d-summary').innerText = article.summary;

        const imgEl = document.getElementById('d-img');
        if (article.thumbnail_url) {
            imgEl.src = fixImg(article.thumbnail_url);
            imgEl.style.display = 'block';
            imgEl.setAttribute('referrerpolicy', 'no-referrer');
        }

        // Tự động xuống dòng cho nội dung
        let contentHTML = article.content || "";
        contentHTML = contentHTML.split('\n').map(p => p.trim() ? `<p>${p}</p>` : "").join('');
        document.getElementById('d-content').innerHTML = contentHTML;

    } catch (e) { console.error(e); }
}

// --- MAIN RUN ---
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('detail.html')) {
        loadArticleDetail();
    } else {
        loadVedette();
        loadCategories();
    }
});