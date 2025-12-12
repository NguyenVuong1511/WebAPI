// Customer Bookings Management JavaScript
let allBookings = [];
let currentBookingId = null;

document.addEventListener('DOMContentLoaded', function() {
    loadUserInfo();
    loadBookings();
    
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                loadBookings();
            }
        });
    }
    
    // Đóng modal khi click bên ngoài
    const modals = document.querySelectorAll('.modal-overlay');
    modals.forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });
    
    // Đóng modal bằng phím ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            modals.forEach(modal => {
                modal.classList.remove('active');
            });
        }
    });
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

function loadBookings() {
    // Mock data - Chỉ hiển thị booking của khách hàng hiện tại
    const currentUser = JSON.parse(sessionStorage.getItem('user') || '{}');
    const currentUserId = currentUser.email || 'khachhang1@email.com'; // Giả sử lấy từ session
    
    // Mock data - Bookings của khách hàng
    allBookings = [
        {
            bookingId: '31FEDE4C-F72A-46E4-860C-13B37F21AF88',
            tourName: 'Tour Miền Bắc: Hà Nội - Hạ Long - Sa Pa',
            ngayKhoiHanh: '2025-01-15',
            ngayDat: '2024-12-20',
            soNguoiLon: 2,
            soTreEm: 0,
            tongTien: 17000000,
            trangThai: 'Đã xác nhận',
            hoaDon: {
                hoaDonId: '057C779C-55BF-47C7-B03E-5E4A8A3D1F7D',
                tongTien: 17000000,
                tienDaThanhToan: 17000000,
                trangThaiThanhToan: 'Đã thanh toán đủ',
                ngayLap: '2024-12-20'
            },
            thanhToan: [
                {
                    thanhToanId: '151B2519-5799-4255-99A1-543A25015ABB',
                    soTien: 17000000,
                    phuongThuc: 'Chuyển khoản',
                    trangThai: 'Thành công',
                    ngayThanhToan: '2024-12-20'
                }
            ]
        },
        {
            bookingId: '3B77F08D-D653-4687-8F88-EE6C3ABDB691',
            tourName: 'Tour Di sản Miền Trung: Đà Nẵng - Hội An - Huế',
            ngayKhoiHanh: '2025-02-20',
            ngayDat: '2024-12-15',
            soNguoiLon: 1,
            soTreEm: 1,
            tongTien: 6000000,
            trangThai: 'Đã thanh toán',
            hoaDon: {
                hoaDonId: '39D5AE02-C1A4-4E2C-9E60-EF4DD01C26A1',
                tongTien: 6000000,
                tienDaThanhToan: 6000000,
                trangThaiThanhToan: 'Đã thanh toán đủ',
                ngayLap: '2024-12-25'
            },
            thanhToan: [
                {
                    thanhToanId: '157652AC-C764-444A-821F-EF0F6FA75A5A',
                    soTien: 6000000,
                    phuongThuc: 'Tiền mặt',
                    trangThai: 'Thành công',
                    ngayThanhToan: '2024-12-25'
                }
            ]
        },
        {
            bookingId: '586CCD5A-1069-426C-9F41-E065B604AB4E',
            tourName: 'Tour Đà Lạt: Thành phố Ngàn Hoa',
            ngayKhoiHanh: '2025-03-10',
            ngayDat: '2024-12-10',
            soNguoiLon: 3,
            soTreEm: 0,
            tongTien: 9600000,
            trangThai: 'Chờ thanh toán',
            hoaDon: {
                hoaDonId: '8CB7DF63-2734-49B5-B9DE-16D4590566CA',
                tongTien: 9600000,
                tienDaThanhToan: 0,
                trangThaiThanhToan: 'Chờ thanh toán',
                ngayLap: '2024-12-28'
            },
            thanhToan: []
        }
    ];

    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const statusFilter = document.getElementById('status-filter').value;

    const filteredBookings = allBookings.filter(booking => {
        const matchSearch = !searchTerm || 
            booking.bookingId.toLowerCase().includes(searchTerm) ||
            booking.tourName.toLowerCase().includes(searchTerm);
        const matchStatus = !statusFilter || booking.trangThai === statusFilter;
        return matchSearch && matchStatus;
    });

    renderBookingsTable(filteredBookings);
}

function renderBookingsTable(bookings) {
    const tbody = document.getElementById('bookings-table-body');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (bookings.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: var(--spacing-xl);">Không tìm thấy booking nào</td></tr>';
        return;
    }

    bookings.forEach(booking => {
        const row = document.createElement('tr');
        const soNguoi = `${booking.soNguoiLon} người lớn${booking.soTreEm > 0 ? `, ${booking.soTreEm} trẻ em` : ''}`;
        
        row.innerHTML = `
            <td>${booking.bookingId.substring(0, 8)}...</td>
            <td>${booking.tourName}</td>
            <td>${formatDate(booking.ngayKhoiHanh)}</td>
            <td>${soNguoi}</td>
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
    currentBookingId = bookingId;
    const booking = allBookings.find(b => b.bookingId === bookingId);
    if (!booking) {
        alert('Không tìm thấy booking');
        return;
    }

    document.getElementById('booking-detail-title').textContent = `Chi tiết Booking: ${booking.bookingId.substring(0, 8)}`;
    
    // Hiển thị nút thanh toán nếu cần
    const paymentBtn = document.getElementById('payment-btn');
    if (booking.trangThai === 'Chờ thanh toán') {
        paymentBtn.style.display = 'block';
    } else {
        paymentBtn.style.display = 'none';
    }
    
    showTab('thong-tin');
    document.getElementById('booking-detail-modal').classList.add('active');
}

function showTab(tabName) {
    // Update tab buttons
    const tabButtons = document.querySelectorAll('#booking-detail-modal .tab-button');
    tabButtons.forEach(btn => btn.classList.remove('active'));
    
    // Find and activate clicked button
    const clickedButton = event ? event.target : tabButtons[0];
    if (clickedButton) {
        clickedButton.classList.add('active');
    }

    const content = document.getElementById('booking-detail-content');
    if (!content) return;

    const booking = allBookings.find(b => b.bookingId === currentBookingId);
    if (!booking) return;

    if (tabName === 'thong-tin') {
        content.innerHTML = `
            <div class="booking-info-grid">
                <div class="booking-info-item">
                    <span class="booking-info-label">Mã Booking:</span>
                    <span class="booking-info-value">${booking.bookingId}</span>
                </div>
                <div class="booking-info-item">
                    <span class="booking-info-label">Tên Tour:</span>
                    <span class="booking-info-value">${booking.tourName}</span>
                </div>
                <div class="booking-info-item">
                    <span class="booking-info-label">Ngày khởi hành:</span>
                    <span class="booking-info-value">${formatDate(booking.ngayKhoiHanh)}</span>
                </div>
                <div class="booking-info-item">
                    <span class="booking-info-label">Ngày đặt:</span>
                    <span class="booking-info-value">${formatDate(booking.ngayDat)}</span>
                </div>
                <div class="booking-info-item">
                    <span class="booking-info-label">Số người lớn:</span>
                    <span class="booking-info-value">${booking.soNguoiLon}</span>
                </div>
                <div class="booking-info-item">
                    <span class="booking-info-label">Số trẻ em:</span>
                    <span class="booking-info-value">${booking.soTreEm}</span>
                </div>
                <div class="booking-info-item">
                    <span class="booking-info-label">Tổng tiền:</span>
                    <span class="booking-info-value">${formatCurrency(booking.tongTien)}</span>
                </div>
                <div class="booking-info-item">
                    <span class="booking-info-label">Trạng thái:</span>
                    <span class="booking-info-value">
                        <span class="status-badge ${getStatusClass(booking.trangThai)}">${booking.trangThai}</span>
                    </span>
                </div>
            </div>
        `;
    } else if (tabName === 'hoa-don') {
        const hoaDon = booking.hoaDon || {};
        const conNo = hoaDon.tongTien - hoaDon.tienDaThanhToan;
        
        content.innerHTML = `
            <div class="invoice-info-grid">
                <div class="booking-info-item">
                    <span class="booking-info-label">Mã hóa đơn:</span>
                    <span class="booking-info-value">${hoaDon.hoaDonId || '-'}</span>
                </div>
                <div class="booking-info-item">
                    <span class="booking-info-label">Ngày lập:</span>
                    <span class="booking-info-value">${formatDate(hoaDon.ngayLap)}</span>
                </div>
                <div class="booking-info-item">
                    <span class="booking-info-label">Trạng thái thanh toán:</span>
                    <span class="booking-info-value">${hoaDon.trangThaiThanhToan || '-'}</span>
                </div>
            </div>
            <div class="invoice-summary">
                <div class="invoice-summary-item">
                    <span>Tổng tiền:</span>
                    <span>${formatCurrency(hoaDon.tongTien || 0)}</span>
                </div>
                <div class="invoice-summary-item">
                    <span>Đã thanh toán:</span>
                    <span>${formatCurrency(hoaDon.tienDaThanhToan || 0)}</span>
                </div>
                <div class="invoice-summary-item">
                    <span>Còn nợ:</span>
                    <span>${formatCurrency(conNo)}</span>
                </div>
            </div>
        `;
    } else if (tabName === 'thanh-toan') {
        const thanhToan = booking.thanhToan || [];
        
        if (thanhToan.length === 0) {
            content.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">💳</div>
                    <div class="empty-state-text">Chưa có lịch sử thanh toán</div>
                    <div class="empty-state-desc">Bạn chưa thực hiện thanh toán nào cho booking này</div>
                </div>
            `;
        } else {
            let tableHTML = `
                <table class="payment-history-table">
                    <thead>
                        <tr>
                            <th>Mã thanh toán</th>
                            <th>Số tiền</th>
                            <th>Phương thức</th>
                            <th>Trạng thái</th>
                            <th>Ngày thanh toán</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            
            thanhToan.forEach(payment => {
                tableHTML += `
                    <tr>
                        <td>${payment.thanhToanId.substring(0, 8)}...</td>
                        <td>${formatCurrency(payment.soTien)}</td>
                        <td>${payment.phuongThuc}</td>
                        <td><span class="status-badge ${payment.trangThai === 'Thành công' ? 'status-paid' : 'status-pending'}">${payment.trangThai}</span></td>
                        <td>${formatDate(payment.ngayThanhToan)}</td>
                    </tr>
                `;
            });
            
            tableHTML += `
                    </tbody>
                </table>
            `;
            
            content.innerHTML = tableHTML;
        }
    }
    
    content.classList.add('active');
}

function closeBookingDetailModal() {
    document.getElementById('booking-detail-modal').classList.remove('active');
}

function makePayment() {
    if (!currentBookingId) return;
    
    const booking = allBookings.find(b => b.bookingId === currentBookingId);
    if (!booking) {
        alert('Không tìm thấy booking');
        return;
    }
    
    if (!confirm(`Bạn có muốn thanh toán booking này không?\nTổng tiền: ${formatCurrency(booking.tongTien)}`)) return;
    
    alert('Chức năng thanh toán sẽ được tích hợp sau!\nBạn sẽ được chuyển đến trang thanh toán.');
    // TODO: Redirect to payment page
    // window.location.href = `customer-payment.html?bookingId=${currentBookingId}`;
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

