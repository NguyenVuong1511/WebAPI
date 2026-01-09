// Customer Dashboard JavaScript - Kết nối API
let allBookings = [];

// Utility functions
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
}

function formatCurrency(amount) {
    if (!amount && amount !== 0) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
}

function showToast(message, type = 'success') {
    Toastify({
        text: message,
        duration: 3000,
        gravity: 'top',
        position: 'right',
        backgroundColor: type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6',
        stopOnFocus: true
    }).showToast();
}

document.addEventListener('DOMContentLoaded', function() {
    // Kiểm tra đăng nhập
    if (!AuthHelper.requireAuth('Khách Hàng')) {
        return;
    }

    console.log('Customer Dashboard loaded');
    
    loadUserInfo();
    loadDashboardData();
});

function loadUserInfo() {
    try {
        const user = AuthHelper.getUser();
        if (user) {
            // Get initials
            let initials = 'KH';
            if (user.hoTen) {
                const nameParts = user.hoTen.split(' ');
                if (nameParts.length >= 2) {
                    initials = (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
                } else if (nameParts.length === 1) {
                    initials = nameParts[0][0].toUpperCase();
                }
            } else if (user.name) {
                const nameParts = user.name.split(' ');
                if (nameParts.length >= 2) {
                    initials = (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
                } else if (nameParts.length === 1) {
                    initials = nameParts[0][0].toUpperCase();
                }
            }
            
            const userName = user.hoTen || user.name || 'Khách Hàng';
            const userEmail = user.email || 'customer@travelviet.com';
            
            // Sidebar user info
            const sidebarAvatar = document.getElementById('sidebar-user-avatar');
            const sidebarName = document.getElementById('sidebar-user-name');
            const sidebarEmail = document.getElementById('sidebar-user-email');
            
            if (sidebarAvatar) sidebarAvatar.textContent = initials;
            if (sidebarName) sidebarName.textContent = userName;
            if (sidebarEmail) sidebarEmail.textContent = userEmail;
            
            // Header user info
            const headerAvatar = document.getElementById('header-user-avatar');
            const headerName = document.getElementById('header-user-name');
            const headerEmail = document.getElementById('header-user-email');
            
            if (headerAvatar) headerAvatar.textContent = initials;
            if (headerName) headerName.textContent = userName;
            if (headerEmail) headerEmail.textContent = userEmail;
        }
    } catch (error) {
        console.error('Error loading user info:', error);
    }
}

function logout() {
    if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
        AuthHelper.logout();
        window.location.href = 'login.html';
    }
}

async function loadDashboardData() {
    try {
        const user = AuthHelper.getUser();
        if (!user || !user.nguoiDungId) {
            showToast('Không tìm thấy thông tin người dùng', 'error');
            return;
        }

        const userId = user.nguoiDungId;
        const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.BOOKING_MY_HISTORY) + `/${userId}`;
        console.log('Loading bookings from:', url);
        
        const response = await APIHelper.get(url);
        console.log('Bookings response:', response);
        
        if (response && response.success && response.data) {
            allBookings = Array.isArray(response.data) ? response.data : [];
        } else if (Array.isArray(response)) {
            allBookings = response;
        } else if (response && Array.isArray(response.data)) {
            allBookings = response.data;
        } else {
            console.warn('Unexpected response format:', response);
            allBookings = [];
        }
        
        console.log('Loaded bookings:', allBookings.length);
        
        // Calculate statistics
        calculateStatistics(allBookings);
        
        // Render upcoming tours
        renderUpcomingTours(allBookings);
        
        // Render recent bookings
        renderRecentBookings(allBookings);
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showToast('Lỗi khi tải dữ liệu dashboard', 'error');
        
        // Show error in tables
        const upcomingBody = document.getElementById('upcoming-tours-body');
        const recentBody = document.getElementById('recent-bookings-body');
        if (upcomingBody) {
            upcomingBody.innerHTML = '<tr><td colspan="6" class="customer-loading">Lỗi khi tải dữ liệu</td></tr>';
        }
        if (recentBody) {
            recentBody.innerHTML = '<tr><td colspan="6" class="customer-loading">Lỗi khi tải dữ liệu</td></tr>';
        }
    }
}

function calculateStatistics(bookings) {
    const totalBookings = bookings.length;
    const confirmedBookings = bookings.filter(b => 
        (b.trangThaiThanhToan || b.TrangThaiThanhToan) === 'Đã xác nhận' || 
        (b.trangThaiThanhToan || b.TrangThaiThanhToan) === 'Đã thanh toán'
    ).length;
    const pendingPayment = bookings.filter(b => 
        (b.trangThaiThanhToan || b.TrangThaiThanhToan) === 'Chờ thanh toán' ||
        (b.trangThaiThanhToan || b.TrangThaiThanhToan) === 'Chờ xác nhận'
    ).length;
    
    const paidBookings = bookings.filter(b => 
        (b.trangThaiThanhToan || b.TrangThaiThanhToan) === 'Đã thanh toán'
    );
    const paidAmount = paidBookings.reduce((sum, b) => {
        const tongTien = b.tongTien || b.TongTien || 0;
        return sum + tongTien;
    }, 0);
    
    document.getElementById('total-bookings').textContent = totalBookings;
    document.getElementById('confirmed-bookings').textContent = confirmedBookings;
    document.getElementById('pending-payment').textContent = pendingPayment;
    document.getElementById('paid-amount').textContent = formatCurrency(paidAmount);
}

function renderUpcomingTours(bookings) {
    const tbody = document.getElementById('upcoming-tours-body');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (bookings.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="customer-empty">Không có tour sắp tới</td></tr>';
        return;
    }

    // Lọc tour sắp tới (chỉ hiển thị tour đã xác nhận hoặc đã thanh toán)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Lấy tour từ booking - cần lấy ngày khởi hành từ tour
    // Tạm thời hiển thị tất cả booking đã xác nhận/đã thanh toán
    const upcomingBookings = bookings.filter(booking => {
        const trangThai = booking.trangThaiThanhToan || booking.TrangThaiThanhToan || '';
        return trangThai === 'Đã xác nhận' || trangThai === 'Đã thanh toán';
    }).slice(0, 5); // Chỉ hiển thị 5 tour gần nhất

    if (upcomingBookings.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="customer-empty">Không có tour sắp tới</td></tr>';
        return;
    }

    upcomingBookings.forEach(booking => {
        const tenTour = booking.tenTour || booking.TenTour || '-';
        const ngayDat = booking.ngayDat || booking.NgayDat;
        const soNguoiLon = booking.soNguoiLon || booking.SoNguoiLon || 0;
        const soTreEm = booking.soTreEm || booking.SoTreEm || 0;
        const trangThai = booking.trangThaiThanhToan || booking.TrangThaiThanhToan || 'Chờ xác nhận';
        const bookingId = booking.bookingId || booking.BookingId;
        
        const row = document.createElement('tr');
        const soNguoi = `${soNguoiLon} người lớn${soTreEm > 0 ? `, ${soTreEm} trẻ em` : ''}`;
        
        row.innerHTML = `
            <td>${escapeHtml(tenTour)}</td>
            <td>${formatDate(ngayDat)}</td>
            <td>${soNguoi}</td>
            <td>${formatCurrency(booking.tongTien || booking.TongTien || 0)}</td>
            <td><span class="customer-badge ${getStatusClass(trangThai)}">${escapeHtml(trangThai)}</span></td>
            <td>
                <button class="customer-btn customer-btn-secondary" onclick="viewBookingDetail('${bookingId}')">Chi tiết</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function renderRecentBookings(bookings) {
    const tbody = document.getElementById('recent-bookings-body');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (bookings.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="customer-empty">Không có booking nào</td></tr>';
        return;
    }

    // Sắp xếp theo ngày đặt (mới nhất trước) và chỉ hiển thị 5 booking gần nhất
    const recentBookings = [...bookings]
        .sort((a, b) => {
            const dateA = new Date(a.ngayDat || a.NgayDat || 0);
            const dateB = new Date(b.ngayDat || b.NgayDat || 0);
            return dateB - dateA;
        })
        .slice(0, 5);

    recentBookings.forEach(booking => {
        const bookingId = booking.bookingId || booking.BookingId || '';
        const tenTour = booking.tenTour || booking.TenTour || '-';
        const ngayDat = booking.ngayDat || booking.NgayDat;
        const tongTien = booking.tongTien || booking.TongTien || 0;
        const trangThai = booking.trangThaiThanhToan || booking.TrangThaiThanhToan || 'Chờ xác nhận';
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${bookingId.substring(0, 8)}...</td>
            <td>${escapeHtml(tenTour)}</td>
            <td>${formatDate(ngayDat)}</td>
            <td>${formatCurrency(tongTien)}</td>
            <td><span class="customer-badge ${getStatusClass(trangThai)}">${escapeHtml(trangThai)}</span></td>
            <td>
                <button class="customer-btn customer-btn-secondary" onclick="viewBookingDetail('${bookingId}')">Chi tiết</button>
                ${trangThai === 'Chờ thanh toán' ? 
                    `<button class="customer-btn customer-btn-primary" onclick="makePayment('${bookingId}')" style="margin-left: 0.5rem;">Thanh toán</button>` : ''}
            </td>
        `;
        tbody.appendChild(row);
    });
}

function getStatusClass(status) {
    const statusMap = {
        'Đã xác nhận': 'customer-badge-success',
        'Chờ thanh toán': 'customer-badge-warning',
        'Đã thanh toán': 'customer-badge-success',
        'Đã hủy': 'customer-badge-danger',
        'Chờ xác nhận': 'customer-badge-warning'
    };
    return statusMap[status] || 'customer-badge-warning';
}

function viewBookingDetail(bookingId) {
    // Redirect to customer bookings page
    window.location.href = `customer-bookings.html?bookingId=${bookingId}`;
}

function makePayment(bookingId) {
    if (!confirm('Bạn có muốn thanh toán booking này không?')) return;
    // Redirect to payment page or show payment modal
    window.location.href = `customer-bookings.html?bookingId=${bookingId}&action=payment`;
}
