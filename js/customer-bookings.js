// Customer Bookings Management JavaScript - Kết nối API
let allBookings = [];
let currentBookingId = null;

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

    console.log('Customer Bookings loaded');
    
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
    
    // Check URL params for booking detail
    const urlParams = new URLSearchParams(window.location.search);
    const bookingId = urlParams.get('bookingId');
    if (bookingId) {
        setTimeout(() => {
            viewBookingDetail(bookingId);
        }, 500);
    }
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
            if (sidebarName) sidebarName.textContent = 'Khách Hàng';
            if (sidebarEmail) sidebarEmail.textContent = userEmail;
            
            // Header user info
            const headerAvatar = document.getElementById('header-user-avatar');
            const headerName = document.getElementById('header-user-name');
            const headerEmail = document.getElementById('header-user-email');
            
            if (headerAvatar) headerAvatar.textContent = initials;
            if (headerName) headerName.textContent = 'Khách Hàng';
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

async function loadBookings() {
    try {
        const tbody = document.getElementById('bookings-table-body');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="7" class="loading-state">Đang tải...</td></tr>';
        }

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
        
        // Filter bookings
        const searchTerm = document.getElementById('search-input')?.value.toLowerCase().trim() || '';
        const statusFilter = document.getElementById('status-filter')?.value || '';
        
        let filteredBookings = allBookings;
        
        if (searchTerm) {
            filteredBookings = filteredBookings.filter(booking => {
                const tenTour = (booking.tenTour || booking.TenTour || '').toLowerCase();
                const bookingId = (booking.bookingId || booking.BookingId || '').toString().toLowerCase();
                return tenTour.includes(searchTerm) || bookingId.includes(searchTerm);
            });
        }
        
        if (statusFilter) {
            filteredBookings = filteredBookings.filter(booking => {
                const trangThai = booking.trangThaiThanhToan || booking.TrangThaiThanhToan || '';
                return trangThai === statusFilter;
            });
        }

        renderBookingsTable(filteredBookings);
    } catch (error) {
        console.error('Error loading bookings:', error);
        const tbody = document.getElementById('bookings-table-body');
        if (tbody) {
            const errorMessage = error?.message || 'Lỗi khi tải dữ liệu booking';
            tbody.innerHTML = `<tr><td colspan="7" class="error-state">${escapeHtml(errorMessage)}</td></tr>`;
        }
        showToast('Lỗi khi tải danh sách booking', 'error');
    }
}

function renderBookingsTable(bookings) {
    const tbody = document.getElementById('bookings-table-body');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (bookings.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="empty-state">Không tìm thấy booking nào</td></tr>';
        return;
    }

    bookings.forEach(booking => {
        const bookingId = booking.bookingId || booking.BookingId || '';
        const tenTour = booking.tenTour || booking.TenTour || '-';
        const ngayDat = booking.ngayDat || booking.NgayDat;
        const soNguoiLon = booking.soNguoiLon || booking.SoNguoiLon || 0;
        const soTreEm = booking.soTreEm || booking.SoTreEm || 0;
        const tongTien = booking.tongTien || booking.TongTien || 0;
        const trangThai = booking.trangThaiThanhToan || booking.TrangThaiThanhToan || 'Chờ xác nhận';
        
        const row = document.createElement('tr');
        const soNguoi = `${soNguoiLon} người lớn${soTreEm > 0 ? `, ${soTreEm} trẻ em` : ''}`;
        
        const canCancel = canCancelBooking(booking);
        row.innerHTML = `
            <td>${bookingId.substring(0, 8)}...</td>
            <td>${escapeHtml(tenTour)}</td>
            <td>${formatDate(ngayDat)}</td>
            <td>${soNguoi}</td>
            <td>${formatCurrency(tongTien)}</td>
            <td><span class="status-badge ${getStatusClass(trangThai)}">${escapeHtml(trangThai)}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn action-btn-secondary" onclick="viewBookingDetail('${bookingId}')">👁️ Chi tiết</button>
                    ${canCancel ? 
                        `<button class="action-btn action-btn-danger" onclick="showCancelBookingModalFromTable('${bookingId}')">✕ Hủy</button>` : ''}
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

async function viewBookingDetail(bookingId) {
    currentBookingId = bookingId;
    
    try {
        // Tìm booking từ danh sách đã load
        let booking = allBookings.find(b => 
            (b.bookingId || b.BookingId) === bookingId
        );
        
        // Nếu không tìm thấy, thử load lại từ API
        if (!booking) {
            const user = AuthHelper.getUser();
            if (user && user.nguoiDungId) {
                const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.BOOKING_MY_HISTORY) + `/${user.nguoiDungId}`;
                const response = await APIHelper.get(url);
                
                if (response && response.success && response.data) {
                    const bookings = Array.isArray(response.data) ? response.data : [];
                    booking = bookings.find(b => 
                        (b.bookingId || b.BookingId) === bookingId
                    );
                }
            }
        }
        
        if (!booking) {
            showToast('Không tìm thấy booking', 'error');
            return;
        }

        document.getElementById('booking-detail-title').textContent = `Chi tiết Booking: ${(bookingId || '').substring(0, 8)}`;
        
        // Hiển thị nút hủy tour nếu booking có thể hủy
        const cancelBtn = document.getElementById('cancel-btn');
        if (canCancelBooking(booking)) {
            cancelBtn.style.display = 'block';
        } else {
            cancelBtn.style.display = 'none';
        }
        
        showTab('thong-tin', booking);
        document.getElementById('booking-detail-modal').classList.add('active');
    } catch (error) {
        console.error('Error loading booking detail:', error);
        showToast('Lỗi khi tải chi tiết booking', 'error');
    }
}

function showTab(tabName, booking = null) {
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

    // If booking not provided, find from allBookings
    if (!booking && currentBookingId) {
        booking = allBookings.find(b => 
            (b.bookingId || b.BookingId) === currentBookingId
        );
    }
    
    if (!booking) return;

    if (tabName === 'thong-tin') {
        const tenTour = booking.tenTour || booking.TenTour || '-';
        const ngayDat = booking.ngayDat || booking.NgayDat;
        const soNguoiLon = booking.soNguoiLon || booking.SoNguoiLon || 0;
        const soTreEm = booking.soTreEm || booking.SoTreEm || 0;
        const tongTien = booking.tongTien || booking.TongTien || 0;
        const trangThai = booking.trangThaiThanhToan || booking.TrangThaiThanhToan || 'Chờ xác nhận';
        const bookingId = booking.bookingId || booking.BookingId || '';
        
        content.innerHTML = `
            <div class="booking-info-grid">
                <div class="booking-info-item">
                    <span class="booking-info-label">Mã Booking:</span>
                    <span class="booking-info-value">${escapeHtml(bookingId)}</span>
                </div>
                <div class="booking-info-item">
                    <span class="booking-info-label">Tên Tour:</span>
                    <span class="booking-info-value">${escapeHtml(tenTour)}</span>
                </div>
                <div class="booking-info-item">
                    <span class="booking-info-label">Ngày đặt:</span>
                    <span class="booking-info-value">${formatDate(ngayDat)}</span>
                </div>
                <div class="booking-info-item">
                    <span class="booking-info-label">Số người lớn:</span>
                    <span class="booking-info-value">${soNguoiLon}</span>
                </div>
                <div class="booking-info-item">
                    <span class="booking-info-label">Số trẻ em:</span>
                    <span class="booking-info-value">${soTreEm}</span>
                </div>
                <div class="booking-info-item">
                    <span class="booking-info-label">Tổng tiền:</span>
                    <span class="booking-info-value">${formatCurrency(tongTien)}</span>
                </div>
                <div class="booking-info-item">
                    <span class="booking-info-label">Trạng thái:</span>
                    <span class="booking-info-value">
                        <span class="status-badge ${getStatusClass(trangThai)}">${escapeHtml(trangThai)}</span>
                    </span>
                </div>
            </div>
        `;
    } else if (tabName === 'hanh-khach') {
        const danhSachHanhKhach = booking.danhSachHanhKhach || booking.DanhSachHanhKhach || [];
        
        if (danhSachHanhKhach.length === 0) {
            content.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">👥</div>
                    <div class="empty-state-text">Chưa có thông tin hành khách</div>
                </div>
            `;
        } else {
            let tableHTML = `
                <table class="passenger-table">
                    <thead>
                        <tr>
                            <th>Họ tên</th>
                            <th>Loại khách</th>
                            <th>CMND/Hộ chiếu</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            
            danhSachHanhKhach.forEach(khach => {
                const hoTen = khach.hoTen || khach.HoTen || '-';
                const loaiKhach = khach.loaiKhach || khach.LoaiKhach || 'Người lớn';
                const cmnd = khach.cmnd || khach.CMND || '-';
                
                tableHTML += `
                    <tr>
                        <td>${escapeHtml(hoTen)}</td>
                        <td>${escapeHtml(loaiKhach)}</td>
                        <td>${escapeHtml(cmnd)}</td>
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
    // Clear URL params
    if (window.location.search.includes('bookingId')) {
        window.history.replaceState({}, document.title, window.location.pathname);
    }
}

// Hàm kiểm tra xem booking có thể hủy không
function canCancelBooking(booking) {
    const trangThai = booking.trangThaiThanhToan || booking.TrangThaiThanhToan || '';
    // Không thể hủy nếu đã hủy hoặc đã thanh toán
    if (trangThai === 'Đã hủy' || trangThai === 'Đã thanh toán') {
        return false;
    }
    // Có thể hủy nếu còn ở trạng thái chờ xác nhận hoặc chờ thanh toán
    return trangThai === 'Chờ xác nhận' || trangThai === 'Chờ thanh toán';
}

// Hiển thị modal hủy tour từ bảng
function showCancelBookingModalFromTable(bookingId) {
    currentBookingId = bookingId;
    showCancelBookingModal();
}

// Hiển thị modal hủy tour
function showCancelBookingModal() {
    if (!currentBookingId) return;
    
    const booking = allBookings.find(b => 
        (b.bookingId || b.BookingId) === currentBookingId
    );
    if (!booking) {
        showToast('Không tìm thấy booking', 'error');
        return;
    }
    
    // Kiểm tra điều kiện hủy
    if (!canCancelBooking(booking)) {
        showToast('Booking này không thể hủy. Vui lòng liên hệ nhân viên để được hỗ trợ.', 'error');
        return;
    }
    
    const tongTien = booking.tongTien || booking.TongTien || 0;
    
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
            ⚠️ Yêu cầu hủy sẽ được gửi đến nhân viên để xử lý
        </div>
        <div class="cancel-policy-refund">
            💰 Tổng tiền booking: ${formatCurrency(tongTien)}
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
async function submitCancelBooking() {
    if (!currentBookingId) return;
    
    const booking = allBookings.find(b => 
        (b.bookingId || b.BookingId) === currentBookingId
    );
    if (!booking) {
        showToast('Không tìm thấy booking', 'error');
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
        showToast('Vui lòng nhập lý do hủy tour', 'error');
        return;
    }
    
    // Xác nhận hủy
    const tenTour = booking.tenTour || booking.TenTour || '';
    if (!confirm(`Bạn có chắc chắn muốn hủy tour này không?\n\n` +
        `Tour: ${tenTour}\n\n` +
        `Yêu cầu hủy sẽ được gửi đến nhân viên để xử lý.`)) {
        return;
    }
    
    try {
        const user = AuthHelper.getUser();
        if (!user || !user.nguoiDungId) {
            showToast('Không tìm thấy thông tin người dùng', 'error');
            return;
        }
        
        const userId = user.nguoiDungId;
        const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.BOOKING_CANCEL) + `/${currentBookingId}?userId=${userId}`;
        const response = await APIHelper.post(url);
        
        if (response && response.success) {
            showToast('Yêu cầu hủy tour đã được gửi thành công!', 'success');
            closeCancelBookingModal();
            closeBookingDetailModal();
            await loadBookings();
        } else {
            showToast(response?.message || 'Không thể hủy booking', 'error');
        }
    } catch (error) {
        console.error('Error canceling booking:', error);
        showToast('Lỗi khi gửi yêu cầu hủy tour. Vui lòng thử lại sau.', 'error');
    }
}
