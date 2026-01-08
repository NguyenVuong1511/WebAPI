// Admin Reports JavaScript - Kết nối API
document.addEventListener('DOMContentLoaded', function() {
    // Kiểm tra quyền admin
    if (!AuthHelper.requireAuth('Admin')) {
        return;
    }

    console.log('Admin Reports loaded');
    
    loadUserInfo();
    loadReports();
    
    const periodFilter = document.getElementById('period-filter');
    if (periodFilter) {
        periodFilter.addEventListener('change', function() {
            const customRange = document.getElementById('custom-date-range');
            if (this.value === 'custom') {
                customRange.classList.add('active');
            } else {
                customRange.classList.remove('active');
            }
        });
    }
});

function loadUserInfo() {
    try {
        const user = AuthHelper.getUser();
        if (user) {
            // Get initials
            let initials = 'NV';
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
            
            const userName = user.hoTen || user.name || 'Quản Trị Viên';
            const userEmail = user.email || 'admin@travelviet.com';
            const userRole = (user.role === 'Admin' || user.role === 'admin') ? 'Quản Trị Viên' : (user.role || 'Quản Trị Viên');
            
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

async function loadReports() {
    try {
        // Lấy thống kê từ API
        const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.BOOKING_STATS);
        const response = await APIHelper.get(url);
        
        if (response && response.success && response.data) {
            const stats = response.data;
            
            // Update statistics cards
            document.getElementById('total-revenue').textContent = formatCurrency(stats.tongDoanhThu || 0);
            document.getElementById('total-bookings').textContent = stats.tongBooking || 0;
            document.getElementById('total-customers').textContent = stats.tongKhachHang || 0;
            document.getElementById('cancelled-bookings').textContent = stats.bookingHuy || 0;
            
            // Tính phần trăm thay đổi (nếu có dữ liệu so sánh)
            const revenueChange = stats.tangTruongDoanhThu || 0;
            const bookingsChange = stats.tangTruongBooking || 0;
            const customersChange = stats.tangTruongKhachHang || 0;
            const cancelledRate = stats.tongBooking > 0 
                ? ((stats.bookingHuy || 0) / stats.tongBooking * 100).toFixed(1) 
                : '0.0';
            
            document.getElementById('revenue-change').textContent = 
                (revenueChange >= 0 ? '+' : '') + revenueChange.toFixed(1) + '% so với kỳ trước';
            document.getElementById('bookings-change').textContent = 
                (bookingsChange >= 0 ? '+' : '') + bookingsChange.toFixed(1) + '% so với kỳ trước';
            document.getElementById('customers-change').textContent = 
                (customersChange >= 0 ? '+' : '') + customersChange.toFixed(1) + '% so với kỳ trước';
            document.getElementById('cancelled-change').textContent = 'Tỷ lệ hủy: ' + cancelledRate + '%';

            // Render top tours table
            if (stats.tourBanChay && Array.isArray(stats.tourBanChay)) {
                renderTopTours(stats.tourBanChay);
            } else {
                renderTopTours([]);
            }

            // Update refund statistics (nếu có)
            if (stats.thongKeHoanTien) {
                document.getElementById('total-refunds').textContent = stats.thongKeHoanTien.tongYeuCau || 0;
                document.getElementById('refund-amount').textContent = formatCurrency(stats.thongKeHoanTien.tongTienHoan || 0);
                document.getElementById('pending-refunds').textContent = stats.thongKeHoanTien.dangXuLy || 0;
            } else {
                document.getElementById('total-refunds').textContent = '0';
                document.getElementById('refund-amount').textContent = formatCurrency(0);
                document.getElementById('pending-refunds').textContent = '0';
            }

            // Render booking status breakdown (nếu có)
            if (stats.phanTichBooking) {
                renderBookingStatusBreakdown(stats.phanTichBooking);
            } else {
                renderBookingStatusBreakdown({});
            }
        } else if (response && Array.isArray(response)) {
            // Nếu response là array trực tiếp
            const stats = response[0] || {};
            // Xử lý tương tự như trên
            document.getElementById('total-revenue').textContent = formatCurrency(stats.tongDoanhThu || 0);
            document.getElementById('total-bookings').textContent = stats.tongBooking || 0;
            document.getElementById('total-customers').textContent = stats.tongKhachHang || 0;
            document.getElementById('cancelled-bookings').textContent = stats.bookingHuy || 0;
            renderTopTours(stats.tourBanChay || []);
        } else {
            // Nếu API không trả về dữ liệu, hiển thị 0
            document.getElementById('total-revenue').textContent = formatCurrency(0);
            document.getElementById('total-bookings').textContent = '0';
            document.getElementById('total-customers').textContent = '0';
            document.getElementById('cancelled-bookings').textContent = '0';
            document.getElementById('revenue-change').textContent = 'So với kỳ trước';
            document.getElementById('bookings-change').textContent = 'So với kỳ trước';
            document.getElementById('customers-change').textContent = 'So với kỳ trước';
            document.getElementById('cancelled-change').textContent = 'Tỷ lệ hủy: 0%';
            renderTopTours([]);
            // Không hiển thị toast warning nếu không có dữ liệu (có thể là bình thường)
        }
    } catch (error) {
        console.error('Error loading reports:', error);
        // Chỉ hiển thị toast nếu là lỗi thực sự
        if (error.message && !error.message.includes('404')) {
            showToast('Lỗi khi tải báo cáo thống kê', 'error');
        }
        
        // Hiển thị giá trị mặc định
        document.getElementById('total-revenue').textContent = formatCurrency(0);
        document.getElementById('total-bookings').textContent = '0';
        document.getElementById('total-customers').textContent = '0';
        document.getElementById('cancelled-bookings').textContent = '0';
        document.getElementById('revenue-change').textContent = 'So với kỳ trước';
        document.getElementById('bookings-change').textContent = 'So với kỳ trước';
        document.getElementById('customers-change').textContent = 'So với kỳ trước';
        document.getElementById('cancelled-change').textContent = 'Tỷ lệ hủy: 0%';
        renderTopTours([]);
    }
}

function renderTopTours(tours) {
    const tbody = document.getElementById('top-tours-body');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (tours.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: var(--spacing-xl);">Không có dữ liệu</td></tr>';
        return;
    }

    // Tính tổng doanh thu để tính phần trăm
    const totalRevenue = tours.reduce((sum, tour) => sum + (tour.doanhThu || 0), 0);

    tours.forEach((tour, index) => {
        const row = document.createElement('tr');
        const percentage = totalRevenue > 0 ? ((tour.doanhThu || 0) / totalRevenue * 100).toFixed(1) : 0;
        
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${escapeHtml(tour.tenTour || tour.tourName || '-')}</td>
            <td>${tour.soLuongBooking || tour.bookings || 0}</td>
            <td>${formatCurrency(tour.doanhThu || tour.revenue || 0)}</td>
            <td>
                <div class="progress-bar-container">
                    <div class="progress-bar">
                        <div class="progress-bar-fill" style="width: ${percentage}%"></div>
                    </div>
                    <span class="progress-percentage">${percentage}%</span>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function renderBookingStatusBreakdown(breakdown) {
    const container = document.getElementById('booking-status-chart');
    if (!container) return;
    
    if (!breakdown || Object.keys(breakdown).length === 0) {
        container.innerHTML = '<p class="analysis-chart-placeholder">Không có dữ liệu</p>';
        return;
    }
    
    const total = Object.values(breakdown).reduce((sum, count) => sum + (count || 0), 0);
    
    let html = '<div style="display: flex; flex-direction: column; gap: var(--spacing-sm);">';
    for (const [status, count] of Object.entries(breakdown)) {
        const percentage = total > 0 ? ((count || 0) / total * 100).toFixed(1) : 0;
        html += `
            <div style="display: flex; align-items: center; gap: var(--spacing-md);">
                <span style="min-width: 120px; font-size: var(--font-size-sm);">${escapeHtml(status)}:</span>
                <div style="flex: 1; height: 20px; background: var(--bg-light); border-radius: 4px; overflow: hidden;">
                    <div style="height: 100%; width: ${percentage}%; background: var(--primary-color);"></div>
                </div>
                <span style="min-width: 50px; text-align: right; font-size: var(--font-size-sm);">${count || 0} (${percentage}%)</span>
            </div>
        `;
    }
    html += '</div>';
    container.innerHTML = html;
}

function exportReport() {
    try {
        // Placeholder function - sẽ tích hợp export Excel sau
        showToast('Chức năng xuất Excel sẽ được tích hợp sau', 'info');
    } catch (error) {
        console.error('Error exporting report:', error);
        showToast('Lỗi khi xuất báo cáo', 'error');
    }
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
}

function formatDate(dateString) {
    if (!dateString) return '-';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
    } catch (e) {
        return dateString;
    }
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showToast(message, type = 'success') {
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) return;
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toastContainer.removeChild(toast);
        }, 300);
    }, 3000);
}
