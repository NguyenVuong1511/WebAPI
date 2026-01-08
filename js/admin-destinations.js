// Admin Destinations Management JavaScript - Kết nối API
let allDestinations = [];

document.addEventListener('DOMContentLoaded', function() {
    // Kiểm tra quyền admin
    if (!AuthHelper.requireAuth('Admin')) {
        return;
    }

    console.log('Admin Destinations loaded');
    
    loadUserInfo();
    loadDestinations();
    
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        let debounceTimer;
        searchInput.addEventListener('input', function() {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                loadDestinations();
            }, 300);
        });
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                clearTimeout(debounceTimer);
                loadDestinations();
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

async function loadDestinations() {
    try {
        const tbody = document.getElementById('destinations-table-body');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="3" class="loading-state">Đang tải...</td></tr>';
        }

        const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.DIADIEM_GET_ALL);
        const response = await APIHelper.get(url);

        if (response && response.success && response.data) {
            allDestinations = Array.isArray(response.data) ? response.data : [];
        } else if (Array.isArray(response)) {
            allDestinations = response;
        } else {
            allDestinations = [];
        }

        // Filter by search term
        const searchTerm = document.getElementById('search-input')?.value.toLowerCase().trim() || '';
        let filteredDestinations = allDestinations;
        
        if (searchTerm) {
            filteredDestinations = allDestinations.filter(dest => 
                (dest.tenDiaDiem && dest.tenDiaDiem.toLowerCase().includes(searchTerm)) ||
                (dest.moTa && dest.moTa.toLowerCase().includes(searchTerm))
            );
        }

        renderDestinationsTable(filteredDestinations);
    } catch (error) {
        console.error('Error loading destinations:', error);
        const tbody = document.getElementById('destinations-table-body');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="3" class="error-state">Lỗi khi tải dữ liệu địa điểm</td></tr>';
        }
        showToast('Lỗi khi tải danh sách địa điểm', 'error');
    }
}

function renderDestinationsTable(destinations) {
    const tbody = document.getElementById('destinations-table-body');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (destinations.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" class="empty-state">Không tìm thấy địa điểm nào</td></tr>';
        return;
    }

    destinations.forEach(dest => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${escapeHtml(dest.tenDiaDiem || '-')}</td>
            <td>${dest.moTa ? (dest.moTa.length > 100 ? escapeHtml(dest.moTa.substring(0, 100)) + '...' : escapeHtml(dest.moTa)) : '-'}</td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn action-btn-secondary" onclick="editDestination('${escapeHtml(dest.diaDiemId)}')">Sửa</button>
                    <button class="action-btn action-btn-danger" onclick="deleteDestination('${escapeHtml(dest.diaDiemId)}')">Xóa</button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function showAddDestinationModal() {
    document.getElementById('destination-modal-title').textContent = 'Thêm địa điểm mới';
    document.getElementById('destination-form').reset();
    document.getElementById('destination-id').value = '';
    document.getElementById('destination-modal').classList.add('active');
}

function editDestination(destinationId) {
    const destination = allDestinations.find(d => d.diaDiemId === destinationId);
    if (!destination) {
        showToast('Không tìm thấy địa điểm', 'error');
        return;
    }

    document.getElementById('destination-modal-title').textContent = 'Sửa địa điểm';
    document.getElementById('destination-id').value = destination.diaDiemId;
    document.getElementById('destination-name').value = destination.tenDiaDiem || '';
    document.getElementById('destination-description').value = destination.moTa || '';
    document.getElementById('destination-modal').classList.add('active');
}

async function saveDestination(event) {
    event.preventDefault();
    
    const destinationId = document.getElementById('destination-id').value;
    const tenDiaDiem = document.getElementById('destination-name').value.trim();
    const moTa = document.getElementById('destination-description').value.trim();

    if (!tenDiaDiem) {
        showToast('Vui lòng nhập tên địa điểm', 'error');
        return;
    }

    const data = {
        tenDiaDiem: tenDiaDiem,
        moTa: moTa || null
    };

    if (destinationId) {
        data.diaDiemId = destinationId;
    }

    try {
        let response;
        if (destinationId) {
            // Update
            const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.DIADIEM_UPDATE);
            response = await APIHelper.post(url, data);
        } else {
            // Create
            const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.DIADIEM_CREATE);
            response = await APIHelper.post(url, data);
        }

        if (response && response.success) {
            showToast(destinationId ? 'Cập nhật địa điểm thành công!' : 'Thêm địa điểm thành công!', 'success');
            closeDestinationModal();
            await loadDestinations();
        } else {
            showToast(response?.message || (destinationId ? 'Không thể cập nhật địa điểm' : 'Không thể thêm địa điểm'), 'error');
        }
    } catch (error) {
        console.error('Error saving destination:', error);
        showToast('Lỗi khi lưu địa điểm', 'error');
    }
}

async function deleteDestination(destinationId) {
    if (!confirm('Bạn có chắc chắn muốn xóa địa điểm này? Hành động này không thể hoàn tác.')) return;

    try {
        const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.DIADIEM_DELETE) + `/${destinationId}`;
        const response = await APIHelper.post(url);

        if (response && response.success) {
            showToast('Xóa địa điểm thành công!', 'success');
            await loadDestinations();
        } else {
            showToast(response?.message || 'Không thể xóa địa điểm', 'error');
        }
    } catch (error) {
        console.error('Error deleting destination:', error);
        showToast('Lỗi khi xóa địa điểm', 'error');
    }
}

function closeDestinationModal() {
    document.getElementById('destination-modal').classList.remove('active');
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

