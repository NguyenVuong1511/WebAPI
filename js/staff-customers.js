// Staff Customers Management JavaScript
let allCustomers = [];

document.addEventListener('DOMContentLoaded', function() {
    loadUserInfo();
    loadCustomers();
    
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                loadCustomers();
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
        document.getElementById('user-role').textContent = user.role || 'Nhân viên';
    }
}

function loadCustomers() {
    // Mock data - Chỉ hiển thị khách hàng (vai trò = 'Khách Hàng')
    allCustomers = [
        {
            nguoiDungId: 'B25E5E1B-9DC3-44DB-86AF-18C29A5E93C6',
            hoTen: 'Lê Văn C',
            email: 'khachhang1@email.com',
            soDienThoai: '0987654321',
            vaiTro: 'Khách Hàng',
            trangThai: true,
            ngayTao: '2024-01-03',
            khachHang: {
                diaChi: '789 Đường Hai Bà Trưng, Hà Nội',
                gioiTinh: 'Nam',
                ngaySinh: '2000-01-01',
                cmnd_HoChieu: '112233445'
            }
        },
        {
            nguoiDungId: 'BE5A83D4-4A14-46EF-85B1-822DDA9D74E4',
            hoTen: 'Phạm Thị D',
            email: 'khachhang2@email.com',
            soDienThoai: '0976543210',
            vaiTro: 'Khách Hàng',
            trangThai: true,
            ngayTao: '2024-01-04',
            khachHang: {
                diaChi: '999 Đường Cầu Giấy, Hà Nội',
                gioiTinh: 'Nam',
                ngaySinh: '1975-03-25',
                cmnd_HoChieu: '223344556'
            }
        },
        {
            nguoiDungId: 'C9EA54FC-9F78-4802-9B3C-5145646DA9C2',
            hoTen: 'Hoàng Minh E',
            email: 'khachhang3@email.com',
            soDienThoai: '0965432109',
            vaiTro: 'Khách Hàng',
            trangThai: true,
            ngayTao: '2024-01-05',
            khachHang: {
                diaChi: '101 Đường Trần Phú, Đà Nẵng',
                gioiTinh: 'Nữ',
                ngaySinh: '1998-07-30',
                cmnd_HoChieu: '334455667'
            }
        }
    ];

    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const statusFilter = document.getElementById('status-filter').value;

    const filteredCustomers = allCustomers.filter(customer => {
        const matchSearch = !searchTerm || 
            customer.hoTen.toLowerCase().includes(searchTerm) ||
            customer.email.toLowerCase().includes(searchTerm) ||
            customer.soDienThoai.includes(searchTerm) ||
            (customer.khachHang && customer.khachHang.diaChi && customer.khachHang.diaChi.toLowerCase().includes(searchTerm));
        const matchStatus = !statusFilter || customer.trangThai.toString() === statusFilter;
        return matchSearch && matchStatus;
    });

    renderCustomersTable(filteredCustomers);
}

function renderCustomersTable(customers) {
    const tbody = document.getElementById('customers-table-body');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (customers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: var(--spacing-xl);">Không tìm thấy khách hàng nào</td></tr>';
        return;
    }

    customers.forEach(customer => {
        const row = document.createElement('tr');
        const diaChi = customer.khachHang && customer.khachHang.diaChi ? customer.khachHang.diaChi : '-';
        
        row.innerHTML = `
            <td>${customer.hoTen}</td>
            <td>${customer.email}</td>
            <td>${customer.soDienThoai || '-'}</td>
            <td>${diaChi}</td>
            <td>${customer.vaiTro}</td>
            <td><span class="status-badge ${customer.trangThai ? 'status-active' : 'status-inactive'}">${customer.trangThai ? 'Đang hoạt động' : 'Đã khóa'}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn action-btn-secondary" onclick="viewCustomerDetail('${customer.nguoiDungId}')">👁️ Chi tiết</button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function viewCustomerDetail(nguoiDungId) {
    const customer = allCustomers.find(c => c.nguoiDungId === nguoiDungId);
    if (!customer) {
        alert('Không tìm thấy khách hàng');
        return;
    }

    const khachHang = customer.khachHang || {};
    const nameParts = customer.hoTen.split(' ');
    const initials = nameParts.length >= 2 
        ? nameParts[0][0] + nameParts[nameParts.length - 1][0]
        : customer.hoTen[0];

    const content = document.getElementById('customer-detail-content');
    content.innerHTML = `
        <div style="text-align: center; margin-bottom: var(--spacing-xl);">
            <div class="customer-avatar">${initials.toUpperCase()}</div>
            <h3 style="margin: var(--spacing-sm) 0; color: var(--text-primary);">${customer.hoTen}</h3>
            <p style="color: var(--text-secondary);">${customer.email}</p>
        </div>
        <div class="customer-detail-grid">
            <div class="customer-info-item">
                <span class="customer-info-label">Họ tên:</span>
                <span class="customer-info-value">${customer.hoTen}</span>
            </div>
            <div class="customer-info-item">
                <span class="customer-info-label">Email:</span>
                <span class="customer-info-value">${customer.email}</span>
            </div>
            <div class="customer-info-item">
                <span class="customer-info-label">Số điện thoại:</span>
                <span class="customer-info-value">${customer.soDienThoai || '-'}</span>
            </div>
            <div class="customer-info-item">
                <span class="customer-info-label">Vai trò:</span>
                <span class="customer-info-value">${customer.vaiTro}</span>
            </div>
            <div class="customer-info-item">
                <span class="customer-info-label">Trạng thái:</span>
                <span class="customer-info-value">
                    <span class="status-badge ${customer.trangThai ? 'status-active' : 'status-inactive'}">
                        ${customer.trangThai ? 'Đang hoạt động' : 'Đã khóa'}
                    </span>
                </span>
            </div>
            <div class="customer-info-item">
                <span class="customer-info-label">Ngày tạo:</span>
                <span class="customer-info-value">${formatDate(customer.ngayTao)}</span>
            </div>
            <div class="customer-info-item">
                <span class="customer-info-label">Địa chỉ:</span>
                <span class="customer-info-value">${khachHang.diaChi || '-'}</span>
            </div>
            <div class="customer-info-item">
                <span class="customer-info-label">Giới tính:</span>
                <span class="customer-info-value">${khachHang.gioiTinh || '-'}</span>
            </div>
            <div class="customer-info-item">
                <span class="customer-info-label">Ngày sinh:</span>
                <span class="customer-info-value">${khachHang.ngaySinh ? formatDate(khachHang.ngaySinh) : '-'}</span>
            </div>
            <div class="customer-info-item">
                <span class="customer-info-label">CMND/Hộ chiếu:</span>
                <span class="customer-info-value">${khachHang.cmnd_HoChieu || '-'}</span>
            </div>
        </div>
    `;

    document.getElementById('customer-detail-modal').classList.add('active');
}

function closeCustomerDetailModal() {
    document.getElementById('customer-detail-modal').classList.remove('active');
}

function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
}

