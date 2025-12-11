const AUTH_API_URL = 'https://thietkeweb-8kq5.onrender.com/api';

// --- 1. HÀM HIỂN THỊ THÔNG BÁO ---
function showMessage(msg) {
    let box = document.getElementById('custom-notification');
    if (!box) {
        box = document.createElement('div');
        box.id = 'custom-notification';
        document.body.appendChild(box);
    }
    box.innerText = msg;
    box.classList.add('active');
    setTimeout(() => { box.classList.remove('active'); }, 2000);
}

// --- 2. HÀM NHẬP LIỆU (Prompt) ---
function showCustomPrompt(title, type = 'text', value = '') {
    return new Promise((resolve) => {
        let modal = document.getElementById('custom-input-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'custom-input-modal';
            modal.className = 'custom-modal-overlay';
            modal.innerHTML = `
                <div class="custom-modal-box">
                    <div class="custom-modal-title" id="cm-title">Nhập thông tin</div>
                    <input type="text" class="custom-modal-input" id="cm-input">
                    <div class="custom-modal-actions">
                        <button class="btn-c-cancel" id="cm-cancel">Hủy</button>
                        <button class="btn-c-confirm" id="cm-confirm">Lưu</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        }

        const titleEl = document.getElementById('cm-title');
        const inputEl = document.getElementById('cm-input');
        const btnCancel = document.getElementById('cm-cancel');
        const btnConfirm = document.getElementById('cm-confirm');

        titleEl.innerText = title;
        inputEl.type = type; 
        inputEl.value = value;
        
        modal.classList.add('active');
        inputEl.focus();

        btnCancel.onclick = () => {
            modal.classList.remove('active');
            resolve(null); 
        };

        btnConfirm.onclick = () => {
            const val = inputEl.value.trim();
            modal.classList.remove('active');
            resolve(val); 
        };
    });
}

// --- 3. CÁC HÀM AUTH ---

function openLogin() { 
    const loginModal = document.getElementById("loginModal");
    if(loginModal) loginModal.classList.add("active"); 
}
function closeLogin() { 
    const loginModal = document.getElementById("loginModal");
    if(loginModal) loginModal.classList.remove("active"); 
}

function switchTab(tab) {
    const formLogin = document.getElementById('form-login');
    const formRegister = document.getElementById('form-register');
    const tabLogin = document.getElementById('tab-login');
    const tabRegister = document.getElementById('tab-register');
    const msg = document.getElementById('auth-message');
    if(msg) msg.innerText = ''; 

    if (tab === 'login') {
        if(formLogin) formLogin.style.display = 'block';
        if(formRegister) formRegister.style.display = 'none';
        if(tabLogin) { tabLogin.style.borderBottom = '2px solid #e60000'; tabLogin.style.color = '#e60000'; }
        if(tabRegister) { tabRegister.style.borderBottom = 'none'; tabRegister.style.color = '#666'; }
    } else {
        if(formLogin) formLogin.style.display = 'none';
        if(formRegister) formRegister.style.display = 'block';
        if(tabRegister) { tabRegister.style.borderBottom = '2px solid #04284d'; tabRegister.style.color = '#04284d'; }
        if(tabLogin) { tabLogin.style.borderBottom = 'none'; tabLogin.style.color = '#666'; }
    }
}

async function handleRegister() {
    const username = document.getElementById('reg-username').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const pass = document.getElementById('reg-pass').value;
    const msg = document.getElementById('auth-message');

    if (!username || !email || !pass) {
        if(msg) msg.innerText = "Vui lòng điền đầy đủ thông tin!";
        return;
    }

    try {
        const res = await fetch(`${AUTH_API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password: pass })
        });
        const data = await res.json();
        if (res.ok) {
            showMessage("Đăng ký thành công! Hãy đăng nhập.");
            switchTab('login');
            document.getElementById('login-input').value = username; 
        } else {
            if(msg) msg.innerText = data.message;
        }
    } catch (e) {
        if(msg) msg.innerText = "Lỗi kết nối server!";
    }
}

async function handleLogin() {
    const inputVal = document.getElementById('login-input').value.trim();
    const pass = document.getElementById('login-pass').value;
    const msg = document.getElementById('auth-message');

    if (!inputVal || !pass) {
        if(msg) msg.innerText = "Vui lòng nhập đủ thông tin!";
        return;
    }

    try {
        const res = await fetch(`${AUTH_API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: inputVal, password: pass }) 
        });
        const data = await res.json();

        if (res.ok) {
            localStorage.setItem('currentUser', JSON.stringify(data.user));
            showMessage(`Xin chào, ${data.user.username}!`);
            closeLogin();
            checkLoginStatus(); // Cập nhật ngay giao diện
        } else {
            if(msg) msg.innerText = data.message;
        }
    } catch (e) {
        console.error(e);
        if(msg) msg.innerText = "Lỗi kết nối server!";
    }
}

function handleLogout() {
    if(confirm("Bạn có chắc muốn đăng xuất?")) {
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html'; // Quay về trang chủ khi logout
    }
}

// --- QUAN TRỌNG: HÀM NÀY ĐÃ ĐƯỢC SỬA LẠI ---
function checkLoginStatus() {
    const userJson = localStorage.getItem('currentUser');
    const btnLoginAreas = document.querySelectorAll('.header-right');

    if (userJson) {
        const user = JSON.parse(userJson);
        btnLoginAreas.forEach(area => {
            // Tìm nút đăng nhập cũ để thay thế
            const btn = area.querySelector('.btn-open-login');
            if(btn) {
                // Thay thế bằng HTML mới: Tách riêng Link Profile và Nút Logout
                btn.outerHTML = `
                    <div style="display:inline-block; margin-left:10px; font-size:13px; display:flex; align-items:center;">
                        <a href="profile.html" style="font-weight:bold; color:#04284d; text-decoration:none; margin-right:5px;">
                            Chào, ${user.username}
                        </a>
                        
                        <span style="color:#ccc; margin:0 5px;">|</span>
                        
                        <span style="color:#d0021b; cursor:pointer; font-weight:bold;" onclick="handleLogout()">(Thoát)</span>
                    </div>
                `;
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    checkLoginStatus();
    
    // Đóng modal khi click ngoài
    const loginModal = document.getElementById("loginModal");
    if (loginModal) {
        loginModal.addEventListener("click", function(e) { 
            if (e.target === this) closeLogin(); 
        });
    }
});