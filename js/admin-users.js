// Admin Users Management JavaScript
let currentPage = 1;
const pageSize = 10;
let allUsers = [];

document.addEventListener('DOMContentLoaded', function() {
    loadUserInfo();
    loadUsers();
    
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                loadUsers();
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

function loadUsers() {
    // Mock data
    allUsers = [
        {
            nguoiDungId: '40C2C104-795B-40C0-9C71-71C08968033B',
            hoTen: 'Nguyễn Văn A',
            email: 'admin@dulich.com',
            soDienThoai: '0901234567',
            vaiTro: 'Quản Trị Viên',
            trangThai: true,
            ngayTao: '2024-01-01',
            khachHang: {
                diaChi: '123 Đường Nguyễn Trãi, Q.1, TP.HCM',
                gioiTinh: 'Nam',
                ngaySinh: '1990-05-15',
                cmnd_HoChieu: '123456789'
            }
        },
        {
            nguoiDungId: 'A59145AE-C991-44C0-8197-CF21904ED683',
            hoTen: 'Trần Thị B',
            email: 'manager@dulich.com',
            soDienThoai: '0918765432',
            vaiTro: 'Quản Lý',
            trangThai: true,
            ngayTao: '2024-01-02',
            khachHang: {
                diaChi: '456 Đường Lê Lợi, Q. Bình Thạnh, TP.HCM',
                gioiTinh: 'Nữ',
                ngaySinh: '1985-11-20',
                cmnd_HoChieu: '987654321'
            }
        },
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

    let filteredUsers = applyFilters(allUsers);
    const totalPages = Math.ceil(filteredUsers.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

    renderUsersTable(paginatedUsers);
    updatePaginationInfo(filteredUsers.length);
}

function applyFilters(users) {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const roleFilter = document.getElementById('role-filter').value;
    const statusFilter = document.getElementById('status-filter').value;

    return users.filter(user => {
        const matchSearch = !searchTerm || 
            user.hoTen.toLowerCase().includes(searchTerm) ||
            user.email.toLowerCase().includes(searchTerm) ||
            (user.soDienThoai && user.soDienThoai.includes(searchTerm));
        const matchRole = !roleFilter || user.vaiTro === roleFilter;
        const matchStatus = !statusFilter || user.trangThai.toString() === statusFilter;
        return matchSearch && matchRole && matchStatus;
    });
}

function renderUsersTable(users) {
    const tbody = document.getElementById('users-table-body');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: var(--spacing-xl);">Không tìm thấy người dùng nào</td></tr>';
        return;
    }

    users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.hoTen}</td>
            <td>${user.email}</td>
            <td>${user.soDienThoai || '-'}</td>
            <td><span class="status-badge ${getRoleClass(user.vaiTro)}">${user.vaiTro}</span></td>
            <td><span class="status-badge ${user.trangThai ? 'status-confirmed' : 'status-cancelled'}">${user.trangThai ? 'Hoạt động' : 'Không hoạt động'}</span></td>
            <td>${formatDate(user.ngayTao)}</td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn action-btn-secondary" onclick="editUser('${user.nguoiDungId}')">✏️ Sửa</button>
                    ${user.vaiTro === 'Khách Hàng' && user.khachHang ? 
                        `<button class="action-btn action-btn-secondary" onclick="viewCustomerDetail('${user.nguoiDungId}')">👁️ Chi tiết</button>` : ''}
                    <button class="action-btn action-btn-danger" onclick="deleteUser('${user.nguoiDungId}')">🗑️ Xóa</button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function getRoleClass(role) {
    const roleMap = {
        'Quản Trị Viên': 'status-paid',
        'Quản Lý': 'status-confirmed',
        'Nhân viên': 'status-pending',
        'Khách Hàng': 'status-pending'
    };
    return roleMap[role] || 'status-pending';
}

function showAddUserModal() {
    document.getElementById('modal-title').textContent = 'Thêm người dùng mới';
    document.getElementById('user-form').reset();
    document.getElementById('user-id').value = '';
    document.getElementById('password-section').style.display = 'block';
    document.getElementById('user-password').required = true;
    document.getElementById('user-modal').classList.add('active');
}

function editUser(userId) {
    const user = allUsers.find(u => u.nguoiDungId === userId);
    if (!user) return;

    document.getElementById('modal-title').textContent = 'Sửa thông tin người dùng';
    document.getElementById('user-id').value = user.nguoiDungId;
    document.getElementById('user-ho-ten').value = user.hoTen;
    document.getElementById('user-email').value = user.email;
    document.getElementById('user-phone').value = user.soDienThoai || '';
    document.getElementById('user-role').value = user.vaiTro;
    document.getElementById('user-status').value = user.trangThai.toString();
    document.getElementById('password-section').style.display = 'none';
    document.getElementById('user-password').required = false;
    document.getElementById('user-modal').classList.add('active');
}

function saveUser(event) {
    event.preventDefault();
    const userId = document.getElementById('user-id').value;
    alert(userId ? 'Cập nhật người dùng thành công!' : 'Thêm người dùng thành công!');
    closeUserModal();
    loadUsers();
}

function deleteUser(userId) {
    if (!confirm('Bạn có chắc chắn muốn xóa người dùng này?')) return;
    alert('Xóa người dùng thành công!');
    loadUsers();
}

function viewCustomerDetail(userId) {
    const user = allUsers.find(u => u.nguoiDungId === userId);
    if (!user || !user.khachHang) return;

    const content = `
        <div class="user-info-section">
            <div class="user-info-item">
                <span class="user-info-label">Họ tên:</span>
                <span class="user-info-value">${user.hoTen}</span>
            </div>
            <div class="user-info-item">
                <span class="user-info-label">Email:</span>
                <span class="user-info-value">${user.email}</span>
            </div>
            <div class="user-info-item">
                <span class="user-info-label">Số điện thoại:</span>
                <span class="user-info-value">${user.soDienThoai || '-'}</span>
            </div>
            <div class="user-info-item">
                <span class="user-info-label">Địa chỉ:</span>
                <span class="user-info-value">${user.khachHang.diaChi || '-'}</span>
            </div>
            <div class="user-info-item">
                <span class="user-info-label">Giới tính:</span>
                <span class="user-info-value">${user.khachHang.gioiTinh || '-'}</span>
            </div>
            <div class="user-info-item">
                <span class="user-info-label">Ngày sinh:</span>
                <span class="user-info-value">${user.khachHang.ngaySinh ? formatDate(user.khachHang.ngaySinh) : '-'}</span>
            </div>
            <div class="user-info-item">
                <span class="user-info-label">CMND/Hộ chiếu:</span>
                <span class="user-info-value">${user.khachHang.cmnd_HoChieu || '-'}</span>
            </div>
        </div>
    `;

    document.getElementById('customer-detail-content').innerHTML = content;
    document.getElementById('customer-detail-modal').classList.add('active');
}

function closeUserModal() {
    document.getElementById('user-modal').classList.remove('active');
}

function closeCustomerDetailModal() {
    document.getElementById('customer-detail-modal').classList.remove('active');
}

function previousPage() {
    if (currentPage > 1) {
        currentPage--;
        loadUsers();
    }
}

function nextPage() {
    const filteredUsers = applyFilters(allUsers);
    const totalPages = Math.ceil(filteredUsers.length / pageSize);
    if (currentPage < totalPages) {
        currentPage++;
        loadUsers();
    }
}

function updatePaginationInfo(total) {
    const startIndex = (currentPage - 1) * pageSize + 1;
    const endIndex = Math.min(currentPage * pageSize, total);
    document.getElementById('pagination-info').textContent = 
        `Hiển thị ${startIndex}-${endIndex} của ${total} người dùng`;
}

function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
}

