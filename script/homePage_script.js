// 1. Hiển thị ngày giờ
const dateEl = document.getElementById('date-now');
if (dateEl) {
    dateEl.innerText = new Date().toLocaleDateString('vi-VN', {weekday: 'long', day: 'numeric', month: 'numeric'});
}

// 2. Back to Top
window.onscroll = function() {
    var btn = document.getElementById("back-to-top");
    if (window.pageYOffset > 300) btn.classList.add("visible");
    else btn.classList.remove("visible");
};

// 3. Sidebar Menu
function toggleSidebar() {
    document.getElementById("sidebarMenu").classList.toggle("active");
    document.getElementById("sidebarOverlay").classList.toggle("active");
}

// 4. Login Modal
function openLogin() {
    document.getElementById("loginModal").classList.add("active");
}
function closeLogin() {
    document.getElementById("loginModal").classList.remove("active");
}
// Click overlay để đóng
document.getElementById("loginModal").addEventListener("click", function(e) {
    if (e.target === this) closeLogin();
});