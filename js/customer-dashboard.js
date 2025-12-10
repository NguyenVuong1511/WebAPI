// Customer Dashboard JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Kiểm tra đăng nhập
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    if (!user.email || user.role !== 'Khách Hàng') {
        alert('Vui lòng đăng nhập để truy cập trang này!');
        window.location.href = 'login.html';
        return;
    }
    
    loadUserInfo();
    loadDashboardData();
});

function loadUserInfo() {
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    if (user.name) {
        const nameParts = user.name.split(' ');
        const initials = nameParts.length >= 2 
            ? nameParts[0][0] + nameParts[nameParts.length - 1][0]
            : user.name[0];
        document.getElementById('user-avatar').textContent = initials.toUpperCase();
        document.getElementById('user-name').textContent = user.name;
        document.getElementById('user-role').textContent = user.role || 'Khách Hàng';
    }
}

function loadDashboardData() {
    // Mock data - Thống kê cho khách hàng
    const dashboardData = {
        totalBookings: 3,
        confirmedBookings: 2,
        pendingPayment: 1,
        paidAmount: 23000000,
        upcomingTours: [
            {
                bookingId: '31FEDE4C-F72A-46E4-860C-13B37F21AF88',
                tourName: 'Tour Miền Bắc: Hà Nội - Hạ Long - Sa Pa',
                ngayKhoiHanh: '2025-01-15',
                soNguoiLon: 2,
                soTreEm: 0,
                trangThai: 'Đã xác nhận'
            },
            {
                bookingId: '3B77F08D-D653-4687-8F88-EE6C3ABDB691',
                tourName: 'Tour Di sản Miền Trung: Đà Nẵng - Hội An - Huế',
                ngayKhoiHanh: '2025-02-20',
                soNguoiLon: 1,
                soTreEm: 1,
                trangThai: 'Đã thanh toán'
            }
        ],
        recentBookings: [
            {
                bookingId: '31FEDE4C-F72A-46E4-860C-13B37F21AF88',
                tourName: 'Tour Miền Bắc: Hà Nội - Hạ Long - Sa Pa',
                ngayDat: '2024-12-20',
                tongTien: 17000000,
                trangThai: 'Đã xác nhận'
            },
            {
                bookingId: '3B77F08D-D653-4687-8F88-EE6C3ABDB691',
                tourName: 'Tour Di sản Miền Trung: Đà Nẵng - Hội An - Huế',
                ngayDat: '2024-12-15',
                tongTien: 6000000,
                trangThai: 'Đã thanh toán'
            },
            {
                bookingId: '586CCD5A-1069-426C-9F41-E065B604AB4E',
                tourName: 'Tour Đà Lạt: Thành phố Ngàn Hoa',
                ngayDat: '2024-12-10',
                tongTien: 9600000,
                trangThai: 'Chờ thanh toán'
            }
        ]
    };

    // Update statistics
    document.getElementById('total-bookings').textContent = dashboardData.totalBookings;
    document.getElementById('confirmed-bookings').textContent = dashboardData.confirmedBookings;
    document.getElementById('pending-payment').textContent = dashboardData.pendingPayment;
    document.getElementById('paid-amount').textContent = formatCurrency(dashboardData.paidAmount);

    // Render upcoming tours
    renderUpcomingTours(dashboardData.upcomingTours);

    // Render recent bookings
    renderRecentBookings(dashboardData.recentBookings);
}

function renderUpcomingTours(tours) {
    const tbody = document.getElementById('upcoming-tours-body');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (tours.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: var(--spacing-xl);">Không có tour sắp tới</td></tr>';
        return;
    }

    // Lọc tour sắp tới (ngày khởi hành >= hôm nay)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const upcomingTours = tours.filter(tour => {
        const tourDate = new Date(tour.ngayKhoiHanh);
        tourDate.setHours(0, 0, 0, 0);
        return tourDate >= today;
    }).sort((a, b) => new Date(a.ngayKhoiHanh) - new Date(b.ngayKhoiHanh));

    if (upcomingTours.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: var(--spacing-xl);">Không có tour sắp tới</td></tr>';
        return;
    }

    upcomingTours.forEach(tour => {
        const row = document.createElement('tr');
        const soNguoi = `${tour.soNguoiLon} người lớn${tour.soTreEm > 0 ? `, ${tour.soTreEm} trẻ em` : ''}`;
        
        row.innerHTML = `
            <td>${tour.tourName}</td>
            <td>${formatDate(tour.ngayKhoiHanh)}</td>
            <td>${soNguoi}</td>
            <td><span class="status-badge ${getStatusClass(tour.trangThai)}">${tour.trangThai}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn action-btn-secondary" onclick="viewBookingDetail('${tour.bookingId}')">👁️ Chi tiết</button>
                </div>
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
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: var(--spacing-xl);">Không có booking nào</td></tr>';
        return;
    }

    bookings.forEach(booking => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${booking.bookingId.substring(0, 8)}...</td>
            <td>${booking.tourName}</td>
            <td>${formatDate(booking.ngayDat)}</td>
            <td>${formatCurrency(booking.tongTien)}</td>
            <td><span class="status-badge ${getStatusClass(booking.trangThai)}">${booking.trangThai}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn action-btn-secondary" onclick="viewBookingDetail('${booking.bookingId}')">👁️ Chi tiết</button>
                    ${booking.trangThai === 'Chờ thanh toán' ? 
                        `<button class="action-btn action-btn-primary" onclick="makePayment('${booking.bookingId}')">💳 Thanh toán</button>` : ''}
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function getStatusClass(status) {
    const statusMap = {
        'Đã xác nhận': 'status-confirmed',
        'Chờ thanh toán': 'status-pending',
        'Đã thanh toán': 'status-paid',
        'Đã hủy': 'status-cancelled',
        'Chờ xác nhận': 'status-pending'
    };
    return statusMap[status] || 'status-pending';
}

function viewBookingDetail(bookingId) {
    // Redirect to customer bookings page
    window.location.href = `customer-bookings.html?bookingId=${bookingId}`;
}

function makePayment(bookingId) {
    if (!confirm('Bạn có muốn thanh toán booking này không?')) return;
    alert('Chức năng thanh toán sẽ được tích hợp sau!');
    // TODO: Redirect to payment page
    // window.location.href = `customer-payment.html?bookingId=${bookingId}`;
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
}

function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
}

