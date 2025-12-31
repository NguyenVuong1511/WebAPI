// Customer Invoices Management JavaScript
let allInvoices = [];
let currentInvoiceId = null;

document.addEventListener('DOMContentLoaded', function() {
    // Kiểm tra đăng nhập
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    if (!user.email || user.role !== 'Khách Hàng') {
        alert('Vui lòng đăng nhập để truy cập trang này!');
        window.location.href = 'login.html';
        return;
    }
    
    loadUserInfo();
    loadInvoices();
    
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                loadInvoices();
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

function loadInvoices() {
    // Mock data - Chỉ hiển thị hóa đơn của khách hàng hiện tại
    const currentUser = JSON.parse(sessionStorage.getItem('user') || '{}');
    
    // Mock data - Invoices của khách hàng
    allInvoices = [
        {
            hoaDonId: '057C779C-55BF-47C7-B03E-5E4A8A3D1F7D',
            bookingId: '31FEDE4C-F72A-46E4-860C-13B37F21AF88',
            tourName: 'Tour Miền Bắc: Hà Nội - Hạ Long - Sa Pa',
            tongTien: 17000000,
            tienDaThanhToan: 17000000,
            trangThaiThanhToan: 'Đã thanh toán đủ',
            ngayLap: '2024-12-20',
            soNguoiLon: 2,
            soTreEm: 0,
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
            hoaDonId: '39D5AE02-C1A4-4E2C-9E60-EF4DD01C26A1',
            bookingId: '3B77F08D-D653-4687-8F88-EE6C3ABDB691',
            tourName: 'Tour Di sản Miền Trung: Đà Nẵng - Hội An - Huế',
            tongTien: 6000000,
            tienDaThanhToan: 6000000,
            trangThaiThanhToan: 'Đã thanh toán đủ',
            ngayLap: '2024-12-25',
            soNguoiLon: 1,
            soTreEm: 1,
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
            hoaDonId: '8CB7DF63-2734-49B5-B9DE-16D4590566CA',
            bookingId: '586CCD5A-1069-426C-9F41-E065B604AB4E',
            tourName: 'Tour Đà Lạt: Thành phố Ngàn Hoa',
            tongTien: 9600000,
            tienDaThanhToan: 0,
            trangThaiThanhToan: 'Chờ thanh toán',
            ngayLap: '2024-12-28',
            soNguoiLon: 3,
            soTreEm: 0,
            thanhToan: []
        },
        {
            hoaDonId: 'B8F3D33B-6E0D-4395-AC1C-9DF152C73F4E',
            bookingId: '8FECA6C6-6AF9-45E2-B1F0-312F2F22E9B4',
            tourName: 'Tour TP.HCM - Miền Tây Sông Nước',
            tongTien: 34000000,
            tienDaThanhToan: 3400000,
            trangThaiThanhToan: 'Đã thanh toán một phần',
            ngayLap: '2024-12-30',
            soNguoiLon: 4,
            soTreEm: 0,
            thanhToan: [
                {
                    thanhToanId: '20F9FB0D-2375-49C1-8077-727B018977E3',
                    soTien: 3400000,
                    phuongThuc: 'Thẻ Tín dụng',
                    trangThai: 'Đang chờ xử lý',
                    ngayThanhToan: '2024-12-30'
                }
            ]
        }
    ];

    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const statusFilter = document.getElementById('status-filter').value;

    const filteredInvoices = allInvoices.filter(invoice => {
        const matchSearch = !searchTerm || 
            invoice.hoaDonId.toLowerCase().includes(searchTerm) ||
            invoice.bookingId.toLowerCase().includes(searchTerm) ||
            invoice.tourName.toLowerCase().includes(searchTerm);
        const matchStatus = !statusFilter || invoice.trangThaiThanhToan === statusFilter;
        return matchSearch && matchStatus;
    });

    renderInvoicesTable(filteredInvoices);
}

function renderInvoicesTable(invoices) {
    const tbody = document.getElementById('invoices-table-body');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (invoices.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; padding: var(--spacing-xl);">Không tìm thấy hóa đơn nào</td></tr>';
        return;
    }

    invoices.forEach(invoice => {
        const row = document.createElement('tr');
        const conNo = invoice.tongTien - invoice.tienDaThanhToan;
        
        row.innerHTML = `
            <td>${invoice.hoaDonId.substring(0, 8)}...</td>
            <td>${invoice.bookingId.substring(0, 8)}...</td>
            <td>${invoice.tourName}</td>
            <td>${formatDate(invoice.ngayLap)}</td>
            <td>${formatCurrency(invoice.tongTien)}</td>
            <td>${formatCurrency(invoice.tienDaThanhToan)}</td>
            <td>${formatCurrency(conNo)}</td>
            <td><span class="status-badge ${getStatusClass(invoice.trangThaiThanhToan)}">${invoice.trangThaiThanhToan}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn action-btn-secondary" onclick="viewInvoiceDetail('${invoice.hoaDonId}')">👁️ Chi tiết</button>
                    ${conNo > 0 ? 
                        `<button class="action-btn action-btn-primary" onclick="makePayment('${invoice.hoaDonId}')">💳 Thanh toán</button>` : ''}
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function getStatusClass(status) {
    const statusMap = {
        'Đã thanh toán đủ': 'status-paid',
        'Đã thanh toán một phần': 'status-partial',
        'Chờ thanh toán': 'status-unpaid',
        'Đã hủy': 'status-cancelled'
    };
    return statusMap[status] || 'status-unpaid';
}

function viewInvoiceDetail(hoaDonId) {
    currentInvoiceId = hoaDonId;
    const invoice = allInvoices.find(i => i.hoaDonId === hoaDonId);
    if (!invoice) {
        alert('Không tìm thấy hóa đơn');
        return;
    }

    document.getElementById('invoice-detail-title').textContent = `Hóa đơn: ${invoice.hoaDonId.substring(0, 8)}`;
    
    const conNo = invoice.tongTien - invoice.tienDaThanhToan;
    const paymentBtn = document.getElementById('payment-btn');
    if (conNo > 0) {
        paymentBtn.style.display = 'block';
    } else {
        paymentBtn.style.display = 'none';
    }
    
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    
    const content = document.getElementById('invoice-detail-content');
    content.innerHTML = `
        <div class="invoice-detail-header">
            <div class="invoice-company-info">
                <div class="invoice-company-name">Travel Viet</div>
                <div class="invoice-company-details">
                    123 Đường Nguyễn Trãi, Q.1, TP.HCM<br>
                    Điện thoại: 0901234567<br>
                    Email: info@travelviet.com
                </div>
            </div>
            <div class="invoice-info">
                <div class="invoice-title">HÓA ĐƠN</div>
                <div class="invoice-meta">
                    Mã HĐ: ${invoice.hoaDonId}<br>
                    Ngày lập: ${formatDate(invoice.ngayLap)}<br>
                    Mã Booking: ${invoice.bookingId.substring(0, 8)}...
                </div>
            </div>
        </div>
        
        <div class="invoice-detail-grid">
            <div class="invoice-detail-item">
                <span class="invoice-detail-label">Khách hàng:</span>
                <span class="invoice-detail-value">${user.name || 'Khách hàng'}</span>
            </div>
            <div class="invoice-detail-item">
                <span class="invoice-detail-label">Email:</span>
                <span class="invoice-detail-value">${user.email || '-'}</span>
            </div>
            <div class="invoice-detail-item">
                <span class="invoice-detail-label">Tour:</span>
                <span class="invoice-detail-value">${invoice.tourName}</span>
            </div>
            <div class="invoice-detail-item">
                <span class="invoice-detail-label">Số người:</span>
                <span class="invoice-detail-value">${invoice.soNguoiLon} người lớn${invoice.soTreEm > 0 ? `, ${invoice.soTreEm} trẻ em` : ''}</span>
            </div>
        </div>
        
        <table class="invoice-items-table">
            <thead>
                <tr>
                    <th>STT</th>
                    <th>Mô tả</th>
                    <th class="text-right">Số lượng</th>
                    <th class="text-right">Đơn giá</th>
                    <th class="text-right">Thành tiền</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>1</td>
                    <td>${invoice.tourName}</td>
                    <td class="text-right">${invoice.soNguoiLon + invoice.soTreEm}</td>
                    <td class="text-right">${formatCurrency(Math.round(invoice.tongTien / (invoice.soNguoiLon + invoice.soTreEm)))}</td>
                    <td class="text-right">${formatCurrency(invoice.tongTien)}</td>
                </tr>
            </tbody>
        </table>
        
        <div class="invoice-summary">
            <div class="invoice-summary-item">
                <span>Tổng tiền:</span>
                <span>${formatCurrency(invoice.tongTien)}</span>
            </div>
            <div class="invoice-summary-item">
                <span>Đã thanh toán:</span>
                <span>${formatCurrency(invoice.tienDaThanhToan)}</span>
            </div>
            <div class="invoice-summary-item">
                <span>Còn nợ:</span>
                <span>${formatCurrency(conNo)}</span>
            </div>
        </div>
        
        ${invoice.thanhToan && invoice.thanhToan.length > 0 ? `
            <div style="margin-top: var(--spacing-xl);">
                <h3 style="margin-bottom: var(--spacing-md); color: var(--text-primary);">Lịch sử thanh toán</h3>
                <table class="invoice-items-table">
                    <thead>
                        <tr>
                            <th>Ngày thanh toán</th>
                            <th>Số tiền</th>
                            <th>Phương thức</th>
                            <th>Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${invoice.thanhToan.map(payment => `
                            <tr>
                                <td>${formatDate(payment.ngayThanhToan)}</td>
                                <td>${formatCurrency(payment.soTien)}</td>
                                <td>${payment.phuongThuc}</td>
                                <td><span class="status-badge ${payment.trangThai === 'Thành công' ? 'status-paid' : 'status-partial'}">${payment.trangThai}</span></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        ` : ''}
    `;

    document.getElementById('invoice-detail-modal').classList.add('active');
}

function closeInvoiceDetailModal() {
    document.getElementById('invoice-detail-modal').classList.remove('active');
}

function downloadInvoice() {
    if (!currentInvoiceId) return;
    
    const invoice = allInvoices.find(i => i.hoaDonId === currentInvoiceId);
    if (!invoice) {
        alert('Không tìm thấy hóa đơn');
        return;
    }
    
    alert('Chức năng tải xuống PDF sẽ được tích hợp sau!');
    // TODO: Generate and download PDF
    // window.open(`/api/invoices/${currentInvoiceId}/pdf`, '_blank');
}

function makePayment() {
    if (!currentInvoiceId) return;
    
    const invoice = allInvoices.find(i => i.hoaDonId === currentInvoiceId);
    if (!invoice) {
        alert('Không tìm thấy hóa đơn');
        return;
    }
    
    const conNo = invoice.tongTien - invoice.tienDaThanhToan;
    if (conNo <= 0) {
        alert('Hóa đơn đã được thanh toán đủ');
        return;
    }
    
    if (!confirm(`Bạn có muốn thanh toán hóa đơn này không?\nSố tiền còn nợ: ${formatCurrency(conNo)}`)) return;
    
    alert('Chức năng thanh toán sẽ được tích hợp sau!\nBạn sẽ được chuyển đến trang thanh toán.');
    // TODO: Redirect to payment page
    // window.location.href = `customer-payment.html?invoiceId=${currentInvoiceId}`;
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

