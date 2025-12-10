// Admin Dashboard JavaScript
document.addEventListener('DOMContentLoaded', function() {
    console.log('Dashboard loaded');

    // TODO: Load data from API
    // Có thể tích hợp API để load dữ liệu thực tế từ database
    
    // Load dashboard statistics
    loadDashboardStats();
    
    // Load recent bookings
    loadRecentBookings();
});

/**
 * Load dashboard statistics from API
 */
async function loadDashboardStats() {
    try {
        // TODO: Replace with actual API endpoint
        // const response = await fetch('/api/admin/dashboard/stats');
        // const data = await response.json();
        
        // Mock data for now
        const stats = {
            totalTours: 5,
            totalBookings: 5,
            monthlyRevenue: 324000000,
            pendingBookings: 1
        };

        // Update UI
        const totalToursEl = document.getElementById('total-tours');
        const totalBookingsEl = document.getElementById('total-bookings');
        const monthlyRevenueEl = document.getElementById('monthly-revenue');
        const pendingBookingsEl = document.getElementById('pending-bookings');

        if (totalToursEl) totalToursEl.textContent = stats.totalTours;
        if (totalBookingsEl) totalBookingsEl.textContent = stats.totalBookings;
        if (monthlyRevenueEl) monthlyRevenueEl.textContent = formatCurrency(stats.monthlyRevenue);
        if (pendingBookingsEl) pendingBookingsEl.textContent = stats.pendingBookings;
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
    }
}

/**
 * Load recent bookings from API
 */
async function loadRecentBookings() {
    try {
        // TODO: Replace with actual API endpoint
        // const response = await fetch('/api/admin/bookings/recent');
        // const bookings = await response.json();
        
        // Mock data for now
        const bookings = [
            {
                bookingId: '31FEDE4C',
                tourName: 'Tour Miền Bắc',
                customerName: 'Lê Văn C',
                ngayKhoiHanh: '2025-01-15',
                soNguoi: '2 người lớn',
                tongTien: 17000000,
                trangThai: 'Đã xác nhận'
            },
            {
                bookingId: '3B77F08D',
                tourName: 'Tour Di sản Miền Trung',
                customerName: 'Hoàng Minh E',
                ngayKhoiHanh: '2025-02-20',
                soNguoi: '1 người lớn, 1 trẻ em',
                tongTien: 6000000,
                trangThai: 'Đã thanh toán'
            },
            {
                bookingId: '586CCD5A',
                tourName: 'Tour Đà Lạt',
                customerName: 'Phạm Thị D',
                ngayKhoiHanh: '2025-03-10',
                soNguoi: '3 người lớn',
                tongTien: 9600000,
                trangThai: 'Chờ thanh toán'
            }
        ];

        renderRecentBookings(bookings);
    } catch (error) {
        console.error('Error loading recent bookings:', error);
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
            <td>${formatDate(booking.ngayKhoiHanh)}</td>
            <td>${booking.soNguoi}</td>
            <td>${formatCurrency(booking.tongTien)}</td>
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
        'Chờ thanh toán': 'status-pending',
        'Đã thanh toán': 'status-paid',
        'Đã hủy': 'status-cancelled'
    };
    return statusMap[status] || 'status-pending';
}

/**
 * Format currency to Vietnamese format
 */
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
}

/**
 * Format date to Vietnamese format
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
}
