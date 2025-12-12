// Admin Reports JavaScript
document.addEventListener('DOMContentLoaded', function() {
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

function loadReports() {
    // Mock data - Báo cáo thống kê
    const reportData = {
        totalRevenue: 324000000,
        totalBookings: 45,
        totalCustomers: 38,
        cancelledBookings: 3,
        revenueChange: '+15%',
        bookingsChange: '+8%',
        customersChange: '+12%',
        cancelledRate: '6.7%',
        topTours: [
            { 
                tourName: 'Tour Miền Bắc: Hà Nội - Hạ Long - Sa Pa', 
                bookings: 15, 
                revenue: 127500000, 
                percentage: 39.4 
            },
            { 
                tourName: 'Tour Di sản Miền Trung: Đà Nẵng - Hội An - Huế', 
                bookings: 12, 
                revenue: 66000000, 
                percentage: 20.4 
            },
            { 
                tourName: 'Tour Đà Lạt: Thành phố Ngàn Hoa', 
                bookings: 10, 
                revenue: 32000000, 
                percentage: 9.9 
            },
            { 
                tourName: 'Tour TP.HCM - Miền Tây Sông Nước', 
                bookings: 8, 
                revenue: 14400000, 
                percentage: 4.4 
            },
            { 
                tourName: 'Tour Côn Đảo Hồi Tưởng', 
                bookings: 5, 
                revenue: 8500000, 
                percentage: 2.6 
            }
        ],
        refundStats: {
            total: 5,
            amount: 3200000,
            pending: 2
        },
        bookingStatusBreakdown: {
            'Đã xác nhận': 20,
            'Đã thanh toán': 15,
            'Chờ thanh toán': 8,
            'Đã hủy': 3
        }
    };

    // Update statistics cards
    document.getElementById('total-revenue').textContent = formatCurrency(reportData.totalRevenue);
    document.getElementById('total-bookings').textContent = reportData.totalBookings;
    document.getElementById('total-customers').textContent = reportData.totalCustomers;
    document.getElementById('cancelled-bookings').textContent = reportData.cancelledBookings;
    
    document.getElementById('revenue-change').textContent = reportData.revenueChange + ' so với kỳ trước';
    document.getElementById('bookings-change').textContent = reportData.bookingsChange + ' so với kỳ trước';
    document.getElementById('customers-change').textContent = reportData.customersChange + ' so với kỳ trước';
    document.getElementById('cancelled-change').textContent = 'Tỷ lệ hủy: ' + reportData.cancelledRate;

    // Render top tours table
    renderTopTours(reportData.topTours);

    // Update refund statistics
    document.getElementById('total-refunds').textContent = reportData.refundStats.total;
    document.getElementById('refund-amount').textContent = formatCurrency(reportData.refundStats.amount);
    document.getElementById('pending-refunds').textContent = reportData.refundStats.pending;

    // Render booking status breakdown (placeholder for chart)
    renderBookingStatusBreakdown(reportData.bookingStatusBreakdown);
}

function renderTopTours(tours) {
    const tbody = document.getElementById('top-tours-body');
    if (!tbody) return;

    tbody.innerHTML = '';

    tours.forEach((tour, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${tour.tourName}</td>
            <td>${tour.bookings}</td>
            <td>${formatCurrency(tour.revenue)}</td>
            <td>
                <div class="progress-bar-container">
                    <div class="progress-bar">
                        <div class="progress-bar-fill" style="width: ${tour.percentage}%"></div>
                    </div>
                    <span class="progress-percentage">${tour.percentage}%</span>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function renderBookingStatusBreakdown(breakdown) {
    // Placeholder - sẽ được thay thế bằng biểu đồ thực tế
    const container = document.getElementById('booking-status-chart');
    if (container) {
        let html = '<div style="display: flex; flex-direction: column; gap: var(--spacing-sm);">';
        for (const [status, count] of Object.entries(breakdown)) {
            const percentage = (count / 46 * 100).toFixed(1);
            html += `
                <div style="display: flex; align-items: center; gap: var(--spacing-md);">
                    <span style="min-width: 120px; font-size: var(--font-size-sm);">${status}:</span>
                    <div style="flex: 1; height: 20px; background: var(--bg-light); border-radius: 4px; overflow: hidden;">
                        <div style="height: 100%; width: ${percentage}%; background: var(--primary-color);"></div>
                    </div>
                    <span style="min-width: 50px; text-align: right; font-size: var(--font-size-sm);">${count} (${percentage}%)</span>
                </div>
            `;
        }
        html += '</div>';
        container.innerHTML = html;
    }
}

function exportReport() {
    try {
        // Placeholder function - sẽ tích hợp export Excel sau
        alert('Chức năng xuất Excel sẽ được tích hợp sau');
    } catch (error) {
        console.error('Error exporting report:', error);
        alert('Lỗi khi xuất báo cáo');
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
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
}

