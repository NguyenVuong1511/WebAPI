// Customer Profile Management JavaScript - Kết nối API
let currentUser = null;

// Utility functions
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
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

    console.log('Customer Profile loaded');
    
    loadUserInfo();
    loadProfileData();
});

function loadUserInfo() {
    try {
        const user = AuthHelper.getUser();
        if (user) {
            currentUser = user;
            
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

async function loadProfileData() {
    try {
        const user = AuthHelper.getUser();
        if (!user) {
            showToast('Không tìm thấy thông tin người dùng', 'error');
            return;
        }

        // USER_GET_BY_ID yêu cầu Admin role, nên khách hàng không thể dùng
        // Sử dụng thông tin từ session storage
        fillFormFromUser(user);
    } catch (error) {
        console.error('Error loading profile data:', error);
        if (currentUser) {
            fillFormFromUser(currentUser);
        }
    }
}

function fillFormFromUser(user) {
    document.getElementById('ho-ten').value = user.hoTen || user.HoTen || user.name || '';
    document.getElementById('email').value = user.email || user.Email || '';
    document.getElementById('so-dien-thoai').value = user.soDienThoai || user.SoDienThoai || user.sDT || '';
    document.getElementById('dia-chi').value = user.diaChi || user.DiaChi || '';
}

async function saveProfile(event) {
    event.preventDefault();
    
    try {
        const user = AuthHelper.getUser();
        if (!user || !user.nguoiDungId) {
            showToast('Không tìm thấy thông tin người dùng', 'error');
            return;
        }

        const hoTen = document.getElementById('ho-ten').value.trim();
        const soDienThoai = document.getElementById('so-dien-thoai').value.trim();
        const diaChi = document.getElementById('dia-chi').value.trim();

        if (!hoTen) {
            showToast('Vui lòng nhập họ tên', 'error');
            return;
        }

        // NguoiDungUpdateDTO: HoTen, SDT, DiaChi, TrangThai (PascalCase)
        const updateData = {
            HoTen: hoTen,
            SDT: soDienThoai || '',
            DiaChi: diaChi || '',
            TrangThai: true // Giữ trạng thái hoạt động
        };

        const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.USER_UPDATE) + `/${user.nguoiDungId}`;
        const response = await APIHelper.post(url, updateData);

        if (response && response.success) {
            showToast('Cập nhật thông tin thành công!', 'success');
            
            // Update user in storage
            const updatedUser = {
                ...user,
                hoTen: hoTen,
                soDienThoai: soDienThoai,
                diaChi: diaChi
            };
            AuthHelper.saveUser(updatedUser, localStorage.getItem('user') !== null);
            
            // Reload user info
            setTimeout(() => {
                loadUserInfo();
            }, 500);
        } else {
            showToast(response?.message || 'Không thể cập nhật thông tin', 'error');
        }
    } catch (error) {
        console.error('Error saving profile:', error);
        showToast('Lỗi khi cập nhật thông tin', 'error');
    }
}

async function changePassword(event) {
    event.preventDefault();
    
    try {
        const user = AuthHelper.getUser();
        if (!user || !user.email) {
            showToast('Không tìm thấy thông tin người dùng', 'error');
            return;
        }

        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        if (!currentPassword) {
            showToast('Vui lòng nhập mật khẩu hiện tại', 'error');
            return;
        }

        if (!newPassword || newPassword.length < 6) {
            showToast('Mật khẩu mới phải có ít nhất 6 ký tự', 'error');
            return;
        }

        if (newPassword !== confirmPassword) {
            showToast('Mật khẩu xác nhận không khớp', 'error');
            return;
        }

        // UpdatePassNguoiDungDTO: Email, Password, Password_new (PascalCase)
        const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.USER_UPDATE_PASSWORD);
        const response = await APIHelper.post(url, {
            Email: user.email,
            Password: currentPassword,
            Password_new: newPassword
        });

        if (response && response.success) {
            showToast('Đổi mật khẩu thành công!', 'success');
            document.getElementById('change-password-form').reset();
        } else {
            showToast(response?.message || 'Không thể đổi mật khẩu. Vui lòng kiểm tra mật khẩu hiện tại.', 'error');
        }
    } catch (error) {
        console.error('Error changing password:', error);
        showToast('Lỗi khi đổi mật khẩu', 'error');
    }
}
