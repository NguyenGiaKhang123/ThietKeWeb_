document.getElementById('date-now').innerText = new Date().toLocaleDateString('vi-VN', {weekday: 'long', day: 'numeric', month: 'numeric', year: 'numeric'});

// Scroll Events
window.onscroll = function() {
    var btn = document.getElementById("back-to-top");
    if (window.pageYOffset > 300) { btn.classList.add("visible"); } 
    else { btn.classList.remove("visible"); }
};

// JS MODAL LOGIN
function openLogin() { document.getElementById("loginModal").classList.add("active"); }
function closeLogin() { document.getElementById("loginModal").classList.remove("active"); }
document.getElementById("loginModal").addEventListener("click", function(e) { if (e.target === this) closeLogin(); });

// JS SIDEBAR MENU (TOGGLE DROPDOWN)
function toggleSidebar() {
    document.getElementById("sidebarMenu").classList.toggle("active");
    document.getElementById("sidebarOverlay").classList.toggle("active");
}
