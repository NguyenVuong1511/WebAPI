// Admin Bookings Management JavaScript
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
        document.getElementById('user-role').textContent = user.role || 'Quản Trị Viên';
    }
}

function loadBookings() {
    // Mock data - Bookings từ database
    allBookings = [
        {
            bookingId: '31FEDE4C-F72A-46E4-860C-13B37F21AF88',
            tourName: 'Tour Miền Bắc: Hà Nội - Hạ Long - Sa Pa',
            customerName: 'Lê Văn C',
            ngayKhoiHanh: '2025-01-15',
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
            ],
            hoanTra: []
        },
        {
            bookingId: '3B77F08D-D653-4687-8F88-EE6C3ABDB691',
            tourName: 'Tour Di sản Miền Trung: Đà Nẵng - Hội An - Huế',
            customerName: 'Hoàng Minh E',
            ngayKhoiHanh: '2025-02-20',
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
            ],
            hoanTra: []
        },
        {
            bookingId: '586CCD5A-1069-426C-9F41-E065B604AB4E',
            tourName: 'Tour Đà Lạt: Thành phố Ngàn Hoa',
            customerName: 'Phạm Thị D',
            ngayKhoiHanh: '2025-03-10',
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
            thanhToan: [],
            hoanTra: []
        },
        {
            bookingId: '8FECA6C6-6AF9-45E2-B1F0-312F2F22E9B4',
            tourName: 'Tour TP.HCM - Miền Tây Sông Nước',
            customerName: 'Lê Văn C',
            ngayKhoiHanh: '2025-01-25',
            soNguoiLon: 4,
            soTreEm: 0,
            tongTien: 34000000,
            trangThai: 'Đã xác nhận',
            hoaDon: {
                hoaDonId: 'B8F3D33B-6E0D-4395-AC1C-9DF152C73F4E',
                tongTien: 34000000,
                tienDaThanhToan: 3400000,
                trangThaiThanhToan: 'Đã thanh toán một phần',
                ngayLap: '2024-12-30'
            },
            thanhToan: [
                {
                    thanhToanId: '20F9FB0D-2375-49C1-8077-727B018977E3',
                    soTien: 3400000,
                    phuongThuc: 'Thẻ Tín dụng',
                    trangThai: 'Đang chờ xử lý',
                    ngayThanhToan: '2024-12-30'
                }
            ],
            hoanTra: []
        },
        {
            bookingId: 'B7195581-5BB5-45C8-880F-2F4794F64B43',
            tourName: 'Tour Côn Đảo Hồi Tưởng',
            customerName: 'Trần Thị B',
            ngayKhoiHanh: '2025-03-01',
            soNguoiLon: 2,
            soTreEm: 2,
            tongTien: 0,
            trangThai: 'Đã hủy',
            hoaDon: {
                hoaDonId: 'C5F36821-FF46-42E0-8926-62D3B5DD73C4',
                tongTien: 0,
                tienDaThanhToan: 0,
                trangThaiThanhToan: 'Đã hủy',
                ngayLap: '2024-12-15'
            },
            thanhToan: [],
            hoanTra: [
                {
                    hoanTraId: 'F9221188-5599-4F47-BE63-D6496FE6C1C3',
                    lyDo: 'Hoàn trả 10% do lỗi hệ thống',
                    soTienTraLai: 1700000,
                    trangThai: 'Đã hoàn thành',
                    ngayYeuCau: '2024-12-16'
                }
            ]
        }
    ];

    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const statusFilter = document.getElementById('status-filter').value;
    const dateFrom = document.getElementById('date-from').value;
    const dateTo = document.getElementById('date-to').value;

    const filteredBookings = allBookings.filter(booking => {
        const matchSearch = !searchTerm || 
            booking.bookingId.toLowerCase().includes(searchTerm) ||
            booking.customerName.toLowerCase().includes(searchTerm) ||
            booking.tourName.toLowerCase().includes(searchTerm);
        const matchStatus = !statusFilter || booking.trangThai === statusFilter;
        const matchDate = (!dateFrom || booking.ngayKhoiHanh >= dateFrom) &&
                        (!dateTo || booking.ngayKhoiHanh <= dateTo);
        return matchSearch && matchStatus && matchDate;
    });

    renderBookingsTable(filteredBookings);
}

function renderBookingsTable(bookings) {
    const tbody = document.getElementById('bookings-table-body');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (bookings.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: var(--spacing-xl);">Không tìm thấy booking nào</td></tr>';
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
                        `<button class="action-btn cta-button cta-primary" style="padding: var(--spacing-xs) var(--spacing-sm); font-size: var(--font-size-xs);" onclick="confirmBooking('${booking.bookingId}')">✓ Xác nhận</button>` : ''}
                    ${booking.trangThai !== 'Đã hủy' ? 
                        `<button class="action-btn action-btn-danger" onclick="cancelBooking('${booking.bookingId}')">✕ Hủy</button>` : ''}
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
    try {
        currentBookingId = bookingId;
        const booking = allBookings.find(b => b.bookingId === bookingId);
        if (!booking) {
            alert('Không tìm thấy booking');
            return;
        }

        showBookingTab('thong-tin');
        document.getElementById('booking-detail-modal').classList.add('active');
        
        // Show/hide confirm button based on status
        const confirmBtn = document.getElementById('confirm-booking-btn');
        if (booking.trangThai === 'Chờ xác nhận') {
            confirmBtn.style.display = 'block';
        } else {
            confirmBtn.style.display = 'none';
        }
    } catch (error) {
        console.error('Error viewing booking detail:', error);
        alert('Lỗi khi tải thông tin booking');
    }
}

function showBookingTab(tabName) {
    // Update tab buttons
    const tabButtons = document.querySelectorAll('#booking-detail-modal .booking-tab');
    tabButtons.forEach(btn => btn.classList.remove('active'));
    
    // Find and activate clicked button
    const clickedButton = event ? event.target : tabButtons[0];
    if (clickedButton) {
        clickedButton.classList.add('active');
    }

    const booking = allBookings.find(b => b.bookingId === currentBookingId);
    if (!booking) return;

    const content = document.getElementById('booking-detail-content');
    if (!content) return;
    
    if (tabName === 'thong-tin') {
        const soNguoi = `${booking.soNguoiLon} người lớn${booking.soTreEm > 0 ? `, ${booking.soTreEm} trẻ em` : ''}`;
        content.innerHTML = `
            <div class="booking-info-grid">
                <div class="booking-info-item">
                    <span class="booking-info-label">Mã Booking:</span>
                    <span class="booking-info-value">${booking.bookingId}</span>
                </div>
                <div class="booking-info-item">
                    <span class="booking-info-label">Tour:</span>
                    <span class="booking-info-value">${booking.tourName}</span>
                </div>
                <div class="booking-info-item">
                    <span class="booking-info-label">Khách hàng:</span>
                    <span class="booking-info-value">${booking.customerName}</span>
                </div>
                <div class="booking-info-item">
                    <span class="booking-info-label">Ngày khởi hành:</span>
                    <span class="booking-info-value">${formatDate(booking.ngayKhoiHanh)}</span>
                </div>
                <div class="booking-info-item">
                    <span class="booking-info-label">Số người:</span>
                    <span class="booking-info-value">${soNguoi}</span>
                </div>
                <div class="booking-info-item">
                    <span class="booking-info-label">Tổng tiền:</span>
                    <span class="booking-info-value">${formatCurrency(booking.tongTien)}</span>
                </div>
                <div class="booking-info-item">
                    <span class="booking-info-label">Trạng thái:</span>
                    <span class="booking-info-value"><span class="status-badge ${getStatusClass(booking.trangThai)}">${booking.trangThai}</span></span>
                </div>
            </div>
        `;
    } else if (tabName === 'hoa-don') {
        const hoaDon = booking.hoaDon || {};
        content.innerHTML = `
            <div class="booking-info-grid">
                <div class="booking-info-item">
                    <span class="booking-info-label">Mã Hóa đơn:</span>
                    <span class="booking-info-value">${hoaDon.hoaDonId || '-'}</span>
                </div>
                <div class="booking-info-item">
                    <span class="booking-info-label">Tổng tiền:</span>
                    <span class="booking-info-value">${formatCurrency(hoaDon.tongTien || 0)}</span>
                </div>
                <div class="booking-info-item">
                    <span class="booking-info-label">Tiền đã thanh toán:</span>
                    <span class="booking-info-value">${formatCurrency(hoaDon.tienDaThanhToan || 0)}</span>
                </div>
                <div class="booking-info-item">
                    <span class="booking-info-label">Tiền còn lại:</span>
                    <span class="booking-info-value">${formatCurrency((hoaDon.tongTien || 0) - (hoaDon.tienDaThanhToan || 0))}</span>
                </div>
                <div class="booking-info-item">
                    <span class="booking-info-label">Trạng thái thanh toán:</span>
                    <span class="booking-info-value"><span class="status-badge ${getStatusClass(hoaDon.trangThaiThanhToan || '')}">${hoaDon.trangThaiThanhToan || '-'}</span></span>
                </div>
                <div class="booking-info-item">
                    <span class="booking-info-label">Ngày lập:</span>
                    <span class="booking-info-value">${hoaDon.ngayLap ? formatDate(hoaDon.ngayLap) : '-'}</span>
                </div>
            </div>
        `;
    } else if (tabName === 'thanh-toan') {
        const thanhToan = booking.thanhToan || [];
        if (thanhToan.length === 0) {
            content.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: var(--spacing-xl);">Chưa có lịch sử thanh toán</p>';
        } else {
            let tableHTML = `
                <table class="payment-history-table">
                    <thead>
                        <tr>
                            <th>Ngày thanh toán</th>
                            <th>Số tiền</th>
                            <th>Phương thức</th>
                            <th>Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            thanhToan.forEach(tt => {
                tableHTML += `
                    <tr>
                        <td>${formatDate(tt.ngayThanhToan)}</td>
                        <td>${formatCurrency(tt.soTien)}</td>
                        <td>${tt.phuongThuc}</td>
                        <td><span class="status-badge ${getStatusClass(tt.trangThai)}">${tt.trangThai}</span></td>
                    </tr>
                `;
            });
            tableHTML += '</tbody></table>';
            content.innerHTML = tableHTML;
        }
    } else if (tabName === 'hoan-tra') {
        const hoanTra = booking.hoanTra || [];
        if (hoanTra.length === 0) {
            content.innerHTML = `
                <p style="text-align: center; color: var(--text-secondary); padding: var(--spacing-xl);">Chưa có yêu cầu hoàn trả</p>
            `;
        } else {
            let tableHTML = `
                <table class="refund-request-table">
                    <thead>
                        <tr>
                            <th>Ngày yêu cầu</th>
                            <th>Lý do</th>
                            <th>Số tiền</th>
                            <th>Trạng thái</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            hoanTra.forEach(ht => {
                tableHTML += `
                    <tr>
                        <td>${formatDate(ht.ngayYeuCau)}</td>
                        <td>${ht.lyDo}</td>
                        <td>${formatCurrency(ht.soTienTraLai)}</td>
                        <td><span class="status-badge ${getStatusClass(ht.trangThai)}">${ht.trangThai}</span></td>
                        <td>
                            <div class="action-buttons">
                                ${ht.trangThai === 'Đang xử lý' ? 
                                    `<button class="action-btn action-btn-secondary" onclick="processRefundRequest('${booking.bookingId}', '${ht.hoanTraId}')">Xử lý</button>` : ''}
                            </div>
                        </td>
                    </tr>
                `;
            });
            tableHTML += '</tbody></table>';
            content.innerHTML = tableHTML;
        }
    }
    
    content.classList.add('active');
}

function confirmBooking(bookingId) {
    if (!bookingId) bookingId = currentBookingId;
    if (!confirm('Bạn có chắc chắn muốn xác nhận booking này?')) return;

    try {
        alert('Xác nhận booking thành công!');
        closeBookingDetailModal();
        loadBookings();
    } catch (error) {
        console.error('Error confirming booking:', error);
        alert('Lỗi khi xác nhận booking');
    }
}

function cancelBooking(bookingId) {
    if (!confirm('Bạn có chắc chắn muốn hủy booking này?')) return;

    try {
        alert('Hủy booking thành công!');
        loadBookings();
    } catch (error) {
        console.error('Error cancelling booking:', error);
        alert('Lỗi khi hủy booking');
    }
}

function processRefundRequest(bookingId, hoanTraId) {
    const booking = allBookings.find(b => b.bookingId === bookingId);
    if (!booking) return;

    const hoanTra = booking.hoanTra.find(ht => ht.hoanTraId === hoanTraId);
    if (!hoanTra) return;

    document.getElementById('refund-booking-id').value = bookingId;
    document.getElementById('refund-lydo').value = hoanTra.lyDo || 'Khách hàng yêu cầu hoàn trả';
    document.getElementById('refund-sotien').value = hoanTra.soTienTraLai || '';
    document.getElementById('refund-trangthai').value = hoanTra.trangThai || 'Đang xử lý';
    document.getElementById('refund-modal').classList.add('active');
}

function processRefund(event) {
    event.preventDefault();
    
    const refundData = {
        bookingId: document.getElementById('refund-booking-id').value,
        lyDo: document.getElementById('refund-lydo').value,
        soTienTraLai: parseFloat(document.getElementById('refund-sotien').value),
        trangThai: document.getElementById('refund-trangthai').value
    };

    try {
        alert('Xử lý yêu cầu hoàn trả thành công!');
        closeRefundModal();
        loadBookings();
        // Refresh booking detail if modal is open
        if (currentBookingId) {
            viewBookingDetail(currentBookingId);
        }
    } catch (error) {
        console.error('Error processing refund:', error);
        alert('Lỗi khi xử lý hoàn trả');
    }
}

function closeBookingDetailModal() {
    document.getElementById('booking-detail-modal').classList.remove('active');
    currentBookingId = null;
}

function closeRefundModal() {
    document.getElementById('refund-modal').classList.remove('active');
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

