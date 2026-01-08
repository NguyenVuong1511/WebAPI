// Admin Users Management JavaScript - Kết nối API
let currentPage = 1;
const pageSize = 10;
let allUsers = [];

document.addEventListener('DOMContentLoaded', function() {
    // Kiểm tra quyền admin
    if (!AuthHelper.requireAuth('Admin')) {
        return;
    }

    console.log('Admin Users loaded');
    
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

async function loadUsers() {
    try {
        const tbody = document.getElementById('users-table-body');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: var(--spacing-xl);">Đang tải...</td></tr>';
        }

        const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.USER_GET_ALL);
        const response = await APIHelper.get(url);
        
        if (response && response.data) {
            allUsers = Array.isArray(response.data) ? response.data : [];
        } else if (Array.isArray(response)) {
            allUsers = response;
        } else {
            allUsers = [];
        }

        let filteredUsers = applyFilters(allUsers);
        const totalPages = Math.ceil(filteredUsers.length / pageSize);
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

        renderUsersTable(paginatedUsers);
        updatePaginationInfo(filteredUsers.length);
    } catch (error) {
        console.error('Error loading users:', error);
        const tbody = document.getElementById('users-table-body');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: var(--spacing-xl); color: red;">Lỗi khi tải dữ liệu người dùng</td></tr>';
        }
        showToast('Lỗi khi tải danh sách người dùng', 'error');
    }
}

function applyFilters(users) {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const roleFilter = document.getElementById('role-filter').value;
    const statusFilter = document.getElementById('status-filter').value;

    return users.filter(user => {
        const hoTen = (user.hoTen || user.HoTen || '').toLowerCase();
        const email = (user.email || user.Email || '').toLowerCase();
        const soDienThoai = (user.soDienThoai || user.SoDienThoai || '').toString();
        const vaiTro = user.vaiTro || user.VaiTro || '';
        const trangThai = user.trangThai !== undefined ? user.trangThai : (user.TrangThai !== undefined ? user.TrangThai : true);
        
        const matchSearch = !searchTerm || 
            hoTen.includes(searchTerm) ||
            email.includes(searchTerm) ||
            soDienThoai.includes(searchTerm);
        const matchRole = !roleFilter || vaiTro === roleFilter;
        const matchStatus = !statusFilter || trangThai.toString() === statusFilter;
        return matchSearch && matchRole && matchStatus;
    });
}

function renderUsersTable(users) {
    const tbody = document.getElementById('users-table-body');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: var(--spacing-xl);">Không tìm thấy khách hàng nào</td></tr>';
        return;
    }

    users.forEach(user => {
        const nguoiDungId = user.nguoiDungId || user.NguoiDungId;
        const hoTen = user.hoTen || user.HoTen || '-';
        const email = user.email || user.Email || '-';
        const soDienThoai = user.soDienThoai || user.SoDienThoai || '-';
        const vaiTro = user.vaiTro || user.VaiTro || '-';
        const trangThai = user.trangThai !== undefined ? user.trangThai : (user.TrangThai !== undefined ? user.TrangThai : true);
        const ngayTao = user.ngayTao || user.NgayTao;
        const khachHang = user.khachHang || user.KhachHang;
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${hoTen}</td>
            <td>${email}</td>
            <td>${soDienThoai}</td>
            <td><span class="status-badge ${getRoleClass(vaiTro)}">${vaiTro}</span></td>
            <td><span class="status-badge ${trangThai ? 'status-confirmed' : 'status-cancelled'}">${trangThai ? 'Hoạt động' : 'Không hoạt động'}</span></td>
            <td>${formatDate(ngayTao)}</td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn action-btn-secondary" onclick="editUser('${nguoiDungId}')">✏️ Sửa</button>
                    <button class="action-btn action-btn-secondary" onclick="showChangePasswordModal('${nguoiDungId}')">🔑 Đổi MK</button>
                    <button class="action-btn ${trangThai ? 'action-btn-warning' : 'action-btn-success'}" onclick="lockUnlockUser('${nguoiDungId}', ${!trangThai})">
                        ${trangThai ? '🔒 Khóa' : '🔓 Mở khóa'}
                    </button>
                    ${vaiTro === 'Khách Hàng' && khachHang ? 
                        `<button class="action-btn action-btn-secondary" onclick="viewCustomerDetail('${nguoiDungId}')">👁️ Chi tiết</button>` : ''}
                    <button class="action-btn action-btn-danger" onclick="deleteUser('${nguoiDungId}')">🗑️ Xóa</button>
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

async function editUser(userId) {
    try {
        // Load user detail from API
        const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.USER_GET_BY_ID) + `/${userId}`;
        const response = await APIHelper.get(url);
        
        const user = response?.data || response || allUsers.find(u => u.nguoiDungId === userId);
        if (!user) {
            showToast('Không tìm thấy người dùng', 'error');
            return;
        }

        document.getElementById('modal-title').textContent = 'Sửa thông tin người dùng';
        document.getElementById('user-id').value = user.nguoiDungId || user.NguoiDungId;
        document.getElementById('user-ho-ten').value = user.hoTen || user.HoTen || '';
        document.getElementById('user-email').value = user.email || user.Email || '';
        document.getElementById('user-phone').value = user.soDienThoai || user.SoDienThoai || '';
        document.getElementById('user-role').value = user.vaiTro || user.VaiTro || 'Khách Hàng';
        document.getElementById('user-status').value = (user.trangThai !== undefined ? user.trangThai : user.TrangThai !== undefined ? user.TrangThai : true).toString();
        document.getElementById('password-section').style.display = 'none';
        document.getElementById('user-password').required = false;
        document.getElementById('user-modal').classList.add('active');
    } catch (error) {
        console.error('Error loading user detail:', error);
        showToast('Lỗi khi tải thông tin người dùng', 'error');
    }
}

async function saveUser(event) {
    event.preventDefault();
    try {
        const userId = document.getElementById('user-id').value;
        const hoTen = document.getElementById('user-ho-ten').value;
        const email = document.getElementById('user-email').value;
        const soDienThoai = document.getElementById('user-phone').value;
        const vaiTro = document.getElementById('user-role').value;
        const trangThai = document.getElementById('user-status').value === 'true';
        const matKhau = document.getElementById('user-password').value;

        const data = {
            hoTen: hoTen,
            email: email,
            soDienThoai: soDienThoai || null,
            vaiTro: vaiTro,
            trangThai: trangThai
        };

        if (userId) {
            // Update user
            data.nguoiDungId = userId;
            if (matKhau) {
                data.matKhau = matKhau;
            }
            const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.USER_UPDATE);
            await APIHelper.put(url, data);
            showToast('Cập nhật người dùng thành công!', 'success');
        } else {
            // Create user
            if (!matKhau) {
                showToast('Vui lòng nhập mật khẩu', 'error');
                return;
            }
            data.matKhau = matKhau;
            const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.USER_CREATE);
            await APIHelper.post(url, data);
            showToast('Thêm người dùng thành công!', 'success');
        }

        closeUserModal();
        loadUsers();
    } catch (error) {
        console.error('Error saving user:', error);
        showToast('Lỗi khi lưu thông tin người dùng', 'error');
    }
}

async function deleteUser(userId) {
    if (!confirm('Bạn có chắc chắn muốn xóa người dùng này?')) return;
    
    try {
        const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.USER_DELETE) + `/${userId}`;
        await APIHelper.delete(url);
        showToast('Xóa người dùng thành công!', 'success');
        loadUsers();
    } catch (error) {
        console.error('Error deleting user:', error);
        showToast('Lỗi khi xóa người dùng', 'error');
    }
}

async function viewCustomerDetail(userId) {
    try {
        // Load user detail from API
        const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.USER_GET_BY_ID) + `/${userId}`;
        const response = await APIHelper.get(url);
        
        const user = response?.data || response || allUsers.find(u => u.nguoiDungId === userId);
        if (!user) {
            showToast('Không tìm thấy thông tin người dùng', 'error');
            return;
        }

        const khachHang = user.khachHang || user.KhachHang || {};
        
        const content = `
            <div class="user-info-section">
                <div class="user-info-item">
                    <span class="user-info-label">Họ tên:</span>
                    <span class="user-info-value">${user.hoTen || user.HoTen || '-'}</span>
                </div>
                <div class="user-info-item">
                    <span class="user-info-label">Email:</span>
                    <span class="user-info-value">${user.email || user.Email || '-'}</span>
                </div>
                <div class="user-info-item">
                    <span class="user-info-label">Số điện thoại:</span>
                    <span class="user-info-value">${user.soDienThoai || user.SoDienThoai || '-'}</span>
                </div>
                <div class="user-info-item">
                    <span class="user-info-label">Vai trò:</span>
                    <span class="user-info-value">${user.vaiTro || user.VaiTro || '-'}</span>
                </div>
                <div class="user-info-item">
                    <span class="user-info-label">Trạng thái:</span>
                    <span class="user-info-value">${(user.trangThai !== undefined ? user.trangThai : user.TrangThai) ? 'Hoạt động' : 'Không hoạt động'}</span>
                </div>
                ${khachHang.diaChi || khachHang.DiaChi ? `
                <div class="user-info-item">
                    <span class="user-info-label">Địa chỉ:</span>
                    <span class="user-info-value">${khachHang.diaChi || khachHang.DiaChi || '-'}</span>
                </div>
                ` : ''}
                ${khachHang.gioiTinh || khachHang.GioiTinh ? `
                <div class="user-info-item">
                    <span class="user-info-label">Giới tính:</span>
                    <span class="user-info-value">${khachHang.gioiTinh || khachHang.GioiTinh || '-'}</span>
                </div>
                ` : ''}
                ${khachHang.ngaySinh || khachHang.NgaySinh ? `
                <div class="user-info-item">
                    <span class="user-info-label">Ngày sinh:</span>
                    <span class="user-info-value">${formatDate(khachHang.ngaySinh || khachHang.NgaySinh)}</span>
                </div>
                ` : ''}
                ${khachHang.cmnd_HoChieu || khachHang.Cmnd_HoChieu ? `
                <div class="user-info-item">
                    <span class="user-info-label">CMND/Hộ chiếu:</span>
                    <span class="user-info-value">${khachHang.cmnd_HoChieu || khachHang.Cmnd_HoChieu || '-'}</span>
                </div>
                ` : ''}
            </div>
        `;

        const modal = document.getElementById('customer-detail-modal');
        const contentDiv = document.getElementById('customer-detail-content');
        
        if (!modal) {
            console.error('Không tìm thấy modal customer-detail-modal');
            return;
        }
        
        if (!contentDiv) {
            console.error('Không tìm thấy customer-detail-content');
            return;
        }
        
        contentDiv.innerHTML = content;
        modal.classList.add('active');
    } catch (error) {
        console.error('Lỗi khi mở modal chi tiết khách hàng:', error);
        showToast('Có lỗi xảy ra khi mở thông tin khách hàng', 'error');
    }
}

function closeUserModal() {
    document.getElementById('user-modal').classList.remove('active');
}

function closeCustomerDetailModal() {
    document.getElementById('customer-detail-modal').classList.remove('active');
}

function showChangePasswordModal(userId) {
    document.getElementById('change-password-user-id').value = userId;
    document.getElementById('change-password-form').reset();
    document.getElementById('change-password-modal').classList.add('active');
}

function closeChangePasswordModal() {
    document.getElementById('change-password-modal').classList.remove('active');
    document.getElementById('change-password-form').reset();
}

async function changePassword(event) {
    event.preventDefault();
    
    const userId = document.getElementById('change-password-user-id').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (!newPassword || newPassword.length < 6) {
        showToast('Mật khẩu phải có ít nhất 6 ký tự', 'error');
        return;
    }

    if (newPassword !== confirmPassword) {
        showToast('Mật khẩu xác nhận không khớp', 'error');
        return;
    }

    try {
        const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.USER_UPDATE_PASSWORD);
        const response = await APIHelper.put(url, {
            nguoiDungId: userId,
            matKhau: newPassword
        });

        if (response && response.success) {
            showToast('Đổi mật khẩu thành công!', 'success');
            closeChangePasswordModal();
        } else {
            showToast(response?.message || 'Không thể đổi mật khẩu', 'error');
        }
    } catch (error) {
        console.error('Error changing password:', error);
        showToast('Lỗi khi đổi mật khẩu', 'error');
    }
}

async function lockUnlockUser(userId, unlock) {
    const action = unlock ? 'mở khóa' : 'khóa';
    if (!confirm(`Bạn có chắc chắn muốn ${action} tài khoản này?`)) return;

    try {
        const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.USER_LOCK_UNLOCK);
        const response = await APIHelper.put(url, {
            nguoiDungId: userId,
            trangThai: unlock
        });

        if (response && response.success) {
            showToast(`${unlock ? 'Mở khóa' : 'Khóa'} tài khoản thành công!`, 'success');
            await loadUsers();
        } else {
            showToast(response?.message || `Không thể ${action} tài khoản`, 'error');
        }
    } catch (error) {
        console.error('Error locking/unlocking user:', error);
        showToast(`Lỗi khi ${action} tài khoản`, 'error');
    }
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
        `Hiển thị ${startIndex}-${endIndex} của ${total} khách hàng`;
}

function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
}

function showToast(message, type = 'info') {
    Toastify({
        text: message,
        duration: 3000,
        gravity: 'top',
        position: 'right',
        backgroundColor: type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6',
        stopOnFocus: true
    }).showToast();
}

