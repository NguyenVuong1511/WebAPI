// Admin Dashboard JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Kiểm tra quyền admin
    if (!AuthHelper.requireAuth('Admin')) {
        return;
    }

    console.log('Admin Dashboard loaded');
    
    // Load user info
    loadUserInfo();
    
    // Load dashboard stats
    loadDashboardStats();
});

/**
 * Load user info
 */
function loadUserInfo() {
    const user = AuthHelper.getUser();
    if (user) {
        const initials = FormatHelper.getInitials(user.hoTen || 'NV');
        const userName = user.hoTen || 'Quản Trị Viên';
        const userEmail = user.email || 'admin@travelviet.com';
        const userRole = user.role === 'Admin' ? 'Quản Trị Viên' : user.role || 'Quản Trị Viên';
        
        // Sidebar user info
        const sidebarAvatar = document.getElementById('sidebar-user-avatar');
        const sidebarName = document.getElementById('sidebar-user-name');
        const sidebarEmail = document.getElementById('sidebar-user-email');
        
        if (sidebarAvatar) sidebarAvatar.textContent = initials;
        if (sidebarName) sidebarName.textContent = userRole;
        if (sidebarEmail) sidebarEmail.textContent = userEmail;
        
        // Header user info
        const headerAvatar = document.getElementById('header-user-avatar');
        const headerName = document.getElementById('header-user-name');
        const headerEmail = document.getElementById('header-user-email');
        
        if (headerAvatar) headerAvatar.textContent = initials;
        if (headerName) headerName.textContent = userRole;
        if (headerEmail) headerEmail.textContent = userEmail;
        
        // Update welcome message
        const welcomeUserName = document.getElementById('welcome-user-name');
        if (welcomeUserName) {
            welcomeUserName.textContent = userName;
        }
    }
}

/**
 * Logout function
 */
function logout() {
    if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
        AuthHelper.logout();
        window.location.href = 'login.html';
    }
}

/**
 * Load dashboard statistics from API
 */
async function loadDashboardStats() {
    try {
        const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.BOOKING_STATS);
        const response = await APIHelper.get(url);

        if (response.success && response.data) {
            const stats = response.data;
            
            // Update stat cards
            document.getElementById('stat-tong-doanh-thu').textContent = FormatHelper.currency(stats.tongDoanhThu || 0);
            document.getElementById('stat-booking-thang').textContent = FormatHelper.number(stats.bookingTrongThang || 0);
            document.getElementById('stat-tong-khach-hang').textContent = FormatHelper.number(stats.tongKhachHang || 0);
            
            // Update top tour
            if (stats.topTours && stats.topTours.length > 0) {
                const topTour = stats.topTours[0];
                document.getElementById('stat-top-tour').textContent = truncateText(topTour.tenTour || '-', 20);
                document.getElementById('stat-top-tour-count').textContent = `${FormatHelper.number(topTour.soLuotDat || 0)} lượt đặt`;
            } else {
                document.getElementById('stat-top-tour').textContent = '-';
                document.getElementById('stat-top-tour-count').textContent = 'Chưa có dữ liệu';
            }
            
            // Render top tours table
            renderTopToursTable(stats.topTours || []);
        } else {
            console.error('Failed to load dashboard stats:', response.message);
            showErrorState();
        }
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
        showErrorState();
    }
}

/**
 * Render top tours table
 */
function renderTopToursTable(topTours) {
    const tbody = document.getElementById('top-tours-table-body');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (topTours.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="empty-state">Chưa có dữ liệu tour</td></tr>';
        return;
    }

    topTours.forEach(tour => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${escapeHtml(tour.tenTour || '-')}</td>
            <td style="text-align: right;">${FormatHelper.currency(tour.giaTien || 0)}</td>
            <td style="text-align: center;">${FormatHelper.number(tour.soLuotDat || 0)}</td>
            <td style="text-align: right;">${FormatHelper.currency(tour.doanhThuTour || 0)}</td>
        `;
        tbody.appendChild(row);
    });
}

/**
 * Show error state
 */
function showErrorState() {
    const tbody = document.getElementById('top-tours-table-body');
    if (tbody) {
        tbody.innerHTML = '<tr><td colspan="4" class="error-state">Lỗi khi tải dữ liệu</td></tr>';
    }
}

/**
 * Helper functions
 */
function escapeHtml(text) {
    if (!text) return '';
    return text.toString()
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function truncateText(text, maxLength) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
}
