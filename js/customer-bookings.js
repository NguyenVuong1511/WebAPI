// Customer Bookings Management JavaScript
let allBookings = [];
let currentBookingId = null;

document.addEventListener('DOMContentLoaded', function() {
    // Kiểm tra đăng nhập
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    if (!user.email || user.role !== 'Khách Hàng') {
        alert('Vui lòng đăng nhập để truy cập trang này!');
        window.location.href = 'login.html';
        return;
    }
    
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
    
    // Đóng modal hủy tour khi click bên ngoài
    const cancelModal = document.getElementById('cancel-booking-modal');
    if (cancelModal) {
        cancelModal.addEventListener('click', function(e) {
            if (e.target === cancelModal) {
                closeCancelBookingModal();
            }
        });
    }
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
        
        const canCancel = canCancelBooking(booking);
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
                    ${canCancel ? 
                        `<button class="action-btn action-btn-danger" onclick="showCancelBookingModalFromTable('${booking.bookingId}')">✕ Hủy</button>` : ''}
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
        'Chờ xác nhận': 'status-pending',
        'Chờ hủy': 'status-pending'
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
    const cancelBtn = document.getElementById('cancel-btn');
    
    if (booking.trangThai === 'Chờ thanh toán') {
        paymentBtn.style.display = 'block';
    } else {
        paymentBtn.style.display = 'none';
    }
    
    // Hiển thị nút hủy tour nếu booking có thể hủy
    if (canCancelBooking(booking)) {
        cancelBtn.style.display = 'block';
    } else {
        cancelBtn.style.display = 'none';
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

// Hàm kiểm tra xem booking có thể hủy không
function canCancelBooking(booking) {
    // Không thể hủy nếu đã hủy hoặc đã hoàn thành
    if (booking.trangThai === 'Đã hủy' || booking.trangThai === 'Đã hoàn thành') {
        return false;
    }
    
    // Kiểm tra thời gian: chỉ có thể hủy trước 7 ngày khởi hành
    if (booking.ngayKhoiHanh) {
        const ngayKhoiHanh = new Date(booking.ngayKhoiHanh);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        ngayKhoiHanh.setHours(0, 0, 0, 0);
        
        const daysUntilDeparture = Math.ceil((ngayKhoiHanh - today) / (1000 * 60 * 60 * 24));
        
        // Có thể hủy nếu còn ít nhất 7 ngày trước ngày khởi hành
        return daysUntilDeparture >= 7;
    }
    
    return false;
}

// Tính số ngày còn lại trước ngày khởi hành
function getDaysUntilDeparture(ngayKhoiHanh) {
    if (!ngayKhoiHanh) return 0;
    const ngayKhoiHanhDate = new Date(ngayKhoiHanh);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    ngayKhoiHanhDate.setHours(0, 0, 0, 0);
    
    return Math.ceil((ngayKhoiHanhDate - today) / (1000 * 60 * 60 * 24));
}

// Tính phần trăm hoàn tiền dựa trên số ngày trước khởi hành
function calculateRefundPercentage(daysUntilDeparture) {
    if (daysUntilDeparture >= 30) {
        return 100; // Hoàn 100% nếu hủy trước 30 ngày
    } else if (daysUntilDeparture >= 14) {
        return 80; // Hoàn 80% nếu hủy trước 14 ngày
    } else if (daysUntilDeparture >= 7) {
        return 50; // Hoàn 50% nếu hủy trước 7 ngày
    } else {
        return 0; // Không hoàn tiền nếu hủy dưới 7 ngày
    }
}

// Hiển thị modal hủy tour từ bảng
function showCancelBookingModalFromTable(bookingId) {
    currentBookingId = bookingId;
    showCancelBookingModal();
}

// Hiển thị modal hủy tour
function showCancelBookingModal() {
    if (!currentBookingId) return;
    
    const booking = allBookings.find(b => b.bookingId === currentBookingId);
    if (!booking) {
        alert('Không tìm thấy booking');
        return;
    }
    
    // Kiểm tra điều kiện hủy
    if (!canCancelBooking(booking)) {
        alert('Booking này không thể hủy. Vui lòng liên hệ nhân viên để được hỗ trợ.');
        return;
    }
    
    const daysUntilDeparture = getDaysUntilDeparture(booking.ngayKhoiHanh);
    const refundPercentage = calculateRefundPercentage(daysUntilDeparture);
    const refundAmount = (booking.tongTien * refundPercentage) / 100;
    
    // Hiển thị chính sách hủy
    const policyInfo = document.getElementById('cancel-policy-info');
    policyInfo.innerHTML = `
        <div class="cancel-policy-title">📋 Chính sách hủy tour</div>
        <ul class="cancel-policy-list">
            <li>Hủy trước 30 ngày: Hoàn 100% tiền cọc</li>
            <li>Hủy trước 14 ngày: Hoàn 80% tiền cọc</li>
            <li>Hủy trước 7 ngày: Hoàn 50% tiền cọc</li>
            <li>Hủy dưới 7 ngày: Không hoàn tiền</li>
        </ul>
        <div class="cancel-policy-warning">
            ⚠️ Còn ${daysUntilDeparture} ngày trước ngày khởi hành (${formatDate(booking.ngayKhoiHanh)})
        </div>
        <div class="cancel-policy-refund">
            💰 Số tiền được hoàn lại: ${formatCurrency(refundAmount)} (${refundPercentage}% của ${formatCurrency(booking.tongTien)})
        </div>
    `;
    
    // Reset form
    document.getElementById('cancel-reason').value = '';
    document.getElementById('confirm-cancel').checked = false;
    
    // Hiển thị modal
    document.getElementById('cancel-booking-modal').classList.add('active');
}

// Đóng modal hủy tour
function closeCancelBookingModal() {
    document.getElementById('cancel-booking-modal').classList.remove('active');
}

// Gửi yêu cầu hủy tour
function submitCancelBooking() {
    if (!currentBookingId) return;
    
    const booking = allBookings.find(b => b.bookingId === currentBookingId);
    if (!booking) {
        alert('Không tìm thấy booking');
        return;
    }
    
    // Validate form
    const form = document.getElementById('cancel-booking-form');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const cancelReason = document.getElementById('cancel-reason').value.trim();
    if (!cancelReason) {
        alert('Vui lòng nhập lý do hủy tour');
        return;
    }
    
    const daysUntilDeparture = getDaysUntilDeparture(booking.ngayKhoiHanh);
    const refundPercentage = calculateRefundPercentage(daysUntilDeparture);
    const refundAmount = (booking.tongTien * refundPercentage) / 100;
    
    // Xác nhận hủy
    if (!confirm(`Bạn có chắc chắn muốn hủy tour này không?\n\n` +
        `Tour: ${booking.tourName}\n` +
        `Ngày khởi hành: ${formatDate(booking.ngayKhoiHanh)}\n` +
        `Số tiền được hoàn lại: ${formatCurrency(refundAmount)} (${refundPercentage}%)\n\n` +
        `Yêu cầu hủy sẽ được gửi đến nhân viên để xử lý.`)) {
        return;
    }
    
    try {
        // TODO: Gửi API request để hủy booking
        // const response = await fetch(`/api/bookings/${currentBookingId}/cancel`, {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({
        //         reason: cancelReason,
        //         refundAmount: refundAmount
        //     })
        // });
        
        // Mock: Cập nhật trạng thái booking
        booking.trangThai = 'Chờ hủy';
        booking.cancelRequest = {
            reason: cancelReason,
            refundAmount: refundAmount,
            refundPercentage: refundPercentage,
            requestDate: new Date().toISOString().split('T')[0],
            status: 'Chờ xử lý'
        };
        
        alert('Yêu cầu hủy tour đã được gửi thành công!\nNhân viên sẽ xử lý và liên hệ với bạn trong vòng 24 giờ.');
        
        // Đóng modal và reload
        closeCancelBookingModal();
        closeBookingDetailModal();
        loadBookings();
    } catch (error) {
        console.error('Error canceling booking:', error);
        alert('Lỗi khi gửi yêu cầu hủy tour. Vui lòng thử lại sau.');
    }
}

