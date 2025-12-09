// Staff Dashboard JavaScript
document.addEventListener('DOMContentLoaded', function() {
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
        document.getElementById('user-role').textContent = user.role || 'Nhân viên';
    }
}

function loadDashboardData() {
    // Mock data - Thống kê cho nhân viên
    const dashboardData = {
        todayBookings: 3,
        pendingBookings: 2,
        pendingReviews: 1,
        pendingRefunds: 1,
        urgentBookings: [
            {
                bookingId: '586CCD5A-1069-426C-9F41-E065B604AB4E',
                tourName: 'Tour Đà Lạt: Thành phố Ngàn Hoa',
                customerName: 'Phạm Thị D',
                ngayKhoiHanh: '2025-03-10',
                soNguoiLon: 3,
                soTreEm: 0,
                tongTien: 9600000,
                trangThai: 'Chờ thanh toán'
            },
            {
                bookingId: '8FECA6C6-6AF9-45E2-B1F0-312F2F22E9B4',
                tourName: 'Tour TP.HCM - Miền Tây Sông Nước',
                customerName: 'Lê Văn C',
                ngayKhoiHanh: '2025-01-25',
                soNguoiLon: 4,
                soTreEm: 0,
                tongTien: 34000000,
                trangThai: 'Chờ xác nhận'
            }
        ],
        recentBookings: [
            {
                bookingId: '31FEDE4C-F72A-46E4-860C-13B37F21AF88',
                tourName: 'Tour Miền Bắc: Hà Nội - Hạ Long - Sa Pa',
                customerName: 'Lê Văn C',
                ngayKhoiHanh: '2025-01-15',
                trangThai: 'Đã xác nhận'
            },
            {
                bookingId: '3B77F08D-D653-4687-8F88-EE6C3ABDB691',
                tourName: 'Tour Di sản Miền Trung: Đà Nẵng - Hội An - Huế',
                customerName: 'Hoàng Minh E',
                ngayKhoiHanh: '2025-02-20',
                trangThai: 'Đã thanh toán'
            },
            {
                bookingId: '586CCD5A-1069-426C-9F41-E065B604AB4E',
                tourName: 'Tour Đà Lạt: Thành phố Ngàn Hoa',
                customerName: 'Phạm Thị D',
                ngayKhoiHanh: '2025-03-10',
                trangThai: 'Chờ thanh toán'
            }
        ]
    };

    // Update statistics
    document.getElementById('today-bookings').textContent = dashboardData.todayBookings;
    document.getElementById('pending-bookings').textContent = dashboardData.pendingBookings;
    document.getElementById('pending-reviews').textContent = dashboardData.pendingReviews;
    document.getElementById('pending-refunds').textContent = dashboardData.pendingRefunds;

    // Render urgent bookings
    renderUrgentBookings(dashboardData.urgentBookings);

    // Render recent bookings
    renderRecentBookings(dashboardData.recentBookings);
}

function renderUrgentBookings(bookings) {
    const tbody = document.getElementById('urgent-bookings-list');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (bookings.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: var(--spacing-xl);">Không có booking nào cần xử lý</td></tr>';
        return;
    }

    bookings.forEach(booking => {
        const row = document.createElement('tr');
        const soNguoi = `${booking.soNguoiLon} người lớn${booking.soTreEm > 0 ? `, ${booking.soTreEm} trẻ em` : ''}`;
        
        row.innerHTML = `
            <td>${booking.bookingId.substring(0, 8)}</td>
            <td>${booking.tourName}</td>
            <td>${booking.customerName}</td>
            <td>${formatDate(booking.ngayKhoiHanh)}</td>
            <td>${soNguoi}</td>
            <td>${formatCurrency(booking.tongTien)}</td>
            <td><span class="status-badge ${getStatusClass(booking.trangThai)}">${booking.trangThai}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn action-btn-secondary" onclick="viewBookingDetail('${booking.bookingId}')">👁️ Chi tiết</button>
                    ${booking.trangThai === 'Chờ xác nhận' ? 
                        `<button class="action-btn action-btn-primary" onclick="confirmBooking('${booking.bookingId}')">✓ Xác nhận</button>` : ''}
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function renderRecentBookings(bookings) {
    const tbody = document.getElementById('recent-bookings-list');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (bookings.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: var(--spacing-xl);">Không có booking nào</td></tr>';
        return;
    }

    bookings.forEach(booking => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${booking.bookingId.substring(0, 8)}</td>
            <td>${booking.tourName}</td>
            <td>${booking.customerName}</td>
            <td>${formatDate(booking.ngayKhoiHanh)}</td>
            <td><span class="status-badge ${getStatusClass(booking.trangThai)}">${booking.trangThai}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn action-btn-secondary" onclick="viewBookingDetail('${booking.bookingId}')">👁️ Chi tiết</button>
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
    // Redirect to booking detail page
    window.location.href = `staff-bookings.html?bookingId=${bookingId}`;
}

function confirmBooking(bookingId) {
    if (!confirm('Bạn có chắc chắn muốn xác nhận booking này?')) return;
    alert('Xác nhận booking thành công!');
    loadDashboardData();
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

