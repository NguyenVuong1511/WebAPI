// Admin Dashboard JavaScript - Kết nối API
document.addEventListener('DOMContentLoaded', function() {
    // Kiểm tra quyền admin
    if (!AuthHelper.requireAuth('Admin')) {
        return;
    }

    console.log('Dashboard loaded');
    
    // Load dashboard statistics
    loadDashboardStats();
    
    // Load recent bookings
    loadRecentBookings();
});

/**
 * Logout function
 */
function logout() {
    if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
        AuthHelper.logout();
        window.location.href = '/login.html';
    }
}

/**
 * Load dashboard statistics from API
 */
async function loadDashboardStats() {
    try {
        // Gọi API thống kê
        const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.BOOKING_STATS);
        const response = await APIHelper.get(url);

        if (response.success && response.data) {
            const stats = response.data;
            
            // Update UI với dữ liệu từ API
            const totalToursEl = document.getElementById('total-tours');
            const totalBookingsEl = document.getElementById('total-bookings');
            const monthlyRevenueEl = document.getElementById('monthly-revenue');
            const pendingBookingsEl = document.getElementById('pending-bookings');

            // Chuẩn hóa tên field (camelCase hoặc PascalCase)
            const tongDoanhThu = stats.tongDoanhThu || stats.TongDoanhThu || 0;
            const bookingTrongThang = stats.bookingTrongThang || stats.BookingTrongThang || 0;
            const tongKhachHang = stats.tongKhachHang || stats.TongKhachHang || 0;

            if (totalToursEl) totalToursEl.textContent = tongKhachHang; // Tạm dùng total customers
            if (totalBookingsEl) totalBookingsEl.textContent = bookingTrongThang;
            if (monthlyRevenueEl) monthlyRevenueEl.textContent = FormatHelper.currency(tongDoanhThu);
            if (pendingBookingsEl) pendingBookingsEl.textContent = '...'; // Load riêng
        } else {
            console.error('Failed to load stats:', response.message);
        }
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
        // Không hiển thị alert để không làm phiền user
    }
}

/**
 * Load recent bookings from API
 */
async function loadRecentBookings() {
    try {
        // Gọi API lấy tất cả bookings
        const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.BOOKING_ADMIN_ALL);
        const response = await APIHelper.get(url);

        if (response.success && response.data) {
            // Lấy 5 booking gần nhất
            const bookings = response.data.slice(0, 5).map(b => ({
                bookingId: (b.bookingId || b.BookingId || '').toString().substring(0, 8),
                tourName: b.tenTour || b.TenTour || 'N/A',
                customerName: b.nguoiDat || b.NguoiDat || 'N/A',
                email: b.email || b.Email || '',
                ngayDat: b.ngayDat || b.NgayDat,
                soNguoi: `${b.soNguoiLon || b.SoNguoiLon || 0} người lớn${(b.soTreEm || b.SoTreEm) ? ', ' + (b.soTreEm || b.SoTreEm) + ' trẻ em' : ''}`,
                tongTien: b.tongTien || b.TongTien || 0,
                trangThai: b.trangThaiThanhToan || b.TrangThaiThanhToan || 'Chờ xác nhận'
            }));

            renderRecentBookings(bookings);
        } else {
            console.error('Failed to load bookings:', response.message);
            renderRecentBookings([]);
        }
    } catch (error) {
        console.error('Error loading recent bookings:', error);
        renderRecentBookings([]);
    }
}

/**
 * Render recent bookings table
 */
function renderRecentBookings(bookings) {
    const tbody = document.getElementById('recent-bookings-list');
    if (!tbody) return;

    tbody.innerHTML = '';

    bookings.forEach(booking => {
        const row = document.createElement('tr');
        
        const statusClass = getStatusClass(booking.trangThai);
        
        row.innerHTML = `
            <td>${booking.bookingId}</td>
            <td>${booking.tourName}</td>
            <td>${booking.customerName}</td>
            <td>${FormatHelper.date(booking.ngayDat)}</td>
            <td>${booking.soNguoi}</td>
            <td>${FormatHelper.currency(booking.tongTien)}</td>
            <td><span class="status-badge ${statusClass}">${booking.trangThai}</span></td>
        `;
        
        tbody.appendChild(row);
    });
}

/**
 * Get status badge class based on status text
 */
function getStatusClass(status) {
    const statusMap = {
        'Đã xác nhận': 'status-confirmed',
        'Chờ xác nhận': 'status-pending',
        'Chờ thanh toán': 'status-pending',
        'Đã thanh toán': 'status-paid',
        'Đã hủy': 'status-cancelled'
    };
    return statusMap[status] || 'status-pending';
}
