// Admin Tours Management JavaScript - Kết nối API
let allTours = [];
let allCategories = [];
let allDiaDiems = [];
let currentTourId = null;
let currentSchedules = [];
let currentImages = [];

document.addEventListener('DOMContentLoaded', function() {
    // Kiểm tra quyền admin
    if (!AuthHelper.requireAuth('Admin')) {
        return;
    }

    console.log('Admin Tours loaded');
    
    // Load user info
    loadUserInfo();
    
    // Load initial data
    loadDiaDiems();
    loadCategories();
    loadTours();
    
    // Setup event listeners
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                loadTours();
            }
        });
    }
    
    // Setup category search event listener
    const categorySearchInput = document.getElementById('category-search-input');
    if (categorySearchInput) {
        categorySearchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                renderCategoriesTable(allCategories);
            }
        });
        
        // Real-time search as user types (debounced)
        let searchTimeout;
        categorySearchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                renderCategoriesTable(allCategories);
            }, 300);
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

/**
 * Load user info
 */
function loadUserInfo() {
    const user = AuthHelper.getUser();
    if (user) {
        const initials = FormatHelper.getInitials(user.hoTen || 'NV');
        const userName = user.hoTen || 'Quản Trị Viên';
        const userEmail = user.email || 'admin@travelviet.com';
        const userRole = user.role === 'Admin' ? 'Quản Trị Viên' : user.role || 'Quản Trị Viên';
        
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
}

/**
 * Logout function
 */
function logout() {
    if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
        AuthHelper.logout();
        window.location.href = 'login.html';
    }
}

/**
 * Show toast notification
 */
function showToast(message, type = 'success') {
    // Remove existing toasts
    const existingToasts = document.querySelectorAll('.toast');
    existingToasts.forEach(toast => toast.remove());
    
    // Create new toast
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}

/**
 * Show loading state in table
 */
function showLoadingState(tbody) {
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="7" class="loading-state">Đang tải...</td></tr>';
}

/**
 * Show empty state in table
 */
function showEmptyState(tbody, message = 'Không tìm thấy dữ liệu', colspan = 7) {
    if (!tbody) return;
    tbody.innerHTML = `<tr><td colspan="${colspan}" class="empty-state">${message}</td></tr>`;
}

/**
 * Show error state in table
 */
function showErrorState(tbody, message = 'Đã xảy ra lỗi', colspan = 7) {
    if (!tbody) return;
    tbody.innerHTML = `<tr><td colspan="${colspan}" class="error-state">${message}</td></tr>`;
}

/**
 * Switch main tabs (Tours / Categories)
 */
function switchMainTab(tabName, clickedElement) {
    // Update tab buttons
    const tabButtons = document.querySelectorAll('.tab-nav-btn');
    tabButtons.forEach(btn => btn.classList.remove('active'));
    
    // Activate clicked button
    if (clickedElement) {
        clickedElement.classList.add('active');
    } else if (event && event.target) {
        event.target.classList.add('active');
    } else {
        // Fallback: activate first button if tours, second if categories
        if (tabName === 'tours') {
            tabButtons[0]?.classList.add('active');
        } else {
            tabButtons[1]?.classList.add('active');
        }
    }
    
    // Update tab panels
    const toursTab = document.getElementById('tours-tab');
    const categoriesTab = document.getElementById('categories-tab');
    
    if (toursTab && categoriesTab) {
        if (tabName === 'tours') {
            toursTab.style.display = 'block';
            toursTab.classList.add('active');
            categoriesTab.style.display = 'none';
            categoriesTab.classList.remove('active');
        } else if (tabName === 'categories') {
            toursTab.style.display = 'none';
            toursTab.classList.remove('active');
            categoriesTab.style.display = 'block';
            categoriesTab.classList.add('active');
        }
    }
    
    // Load data for selected tab
    if (tabName === 'categories') {
        loadCategories();
    } else if (tabName === 'tours') {
        loadTours();
    }
}

// ======================
// LOẠI TOUR (CATEGORIES)
// ======================

/**
 * Load tour categories from API
 */
async function loadCategories() {
    try {
        const tbody = document.getElementById('categories-table-body');
        if (tbody) {
            showLoadingState(tbody);
        }
        
        const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.LOAITOUR_GET_ALL);
        const response = await APIHelper.get(url);

        if (response.success && response.data) {
            allCategories = response.data;
            renderCategoriesTable(allCategories);
            updateCategorySelects();
        } else {
            console.error('Failed to load categories:', response.message);
            allCategories = [];
            const tbody = document.getElementById('categories-table-body');
            if (tbody) {
                showEmptyState(tbody, response.message || 'Chưa có loại tour nào', 3);
            }
        }
    } catch (error) {
        console.error('Error loading categories:', error);
        allCategories = [];
        const tbody = document.getElementById('categories-table-body');
        if (tbody) {
            showErrorState(tbody, 'Lỗi khi tải dữ liệu loại tour', 3);
        }
    }
}

function renderCategoriesTable(categories) {
    const tbody = document.getElementById('categories-table-body');
    if (!tbody) return;

    tbody.innerHTML = '';

    // Apply search filter
    const searchTerm = document.getElementById('category-search-input')?.value.toLowerCase().trim() || '';
    let filteredCategories = categories;
    
    if (searchTerm) {
        filteredCategories = categories.filter(cat => {
            const tenLoai = (cat.tenLoai || '').toLowerCase();
            const moTa = (cat.moTa || '').toLowerCase();
            return tenLoai.includes(searchTerm) || moTa.includes(searchTerm);
        });
    }

    if (filteredCategories.length === 0) {
        if (searchTerm) {
            showEmptyState(tbody, 'Không tìm thấy loại tour nào phù hợp', 3);
        } else {
            showEmptyState(tbody, 'Chưa có loại tour nào', 3);
        }
        return;
    }

    filteredCategories.forEach(cat => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${escapeHtml(cat.tenLoai || '-')}</td>
            <td>${truncateText(escapeHtml(cat.moTa || '-'), 100)}</td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn action-btn-secondary" onclick="editCategory('${escapeHtml(cat.loaiTourId)}')">Sửa</button>
                    <button class="action-btn action-btn-danger" onclick="deleteCategory('${escapeHtml(cat.loaiTourId)}')">Xóa</button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function updateCategorySelects() {
    // Update tour form category select
    const tourLoaiSelect = document.getElementById('tour-loai');
    if (tourLoaiSelect) {
        const currentValue = tourLoaiSelect.value;
        tourLoaiSelect.innerHTML = '<option value="">Chọn loại tour</option>';
        allCategories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.loaiTourId;
            option.textContent = cat.tenLoai;
            tourLoaiSelect.appendChild(option);
        });
        if (currentValue) tourLoaiSelect.value = currentValue;
    }
}

function showAddCategoryModal() {
    document.getElementById('category-modal-title').textContent = 'Thêm loại tour';
    document.getElementById('category-form').reset();
    document.getElementById('category-id').value = '';
    document.getElementById('category-modal').classList.add('active');
}

function editCategory(categoryId) {
    const category = allCategories.find(c => c.loaiTourId === categoryId);
    if (!category) {
        showToast('Không tìm thấy loại tour', 'error');
        return;
    }

    document.getElementById('category-modal-title').textContent = 'Sửa loại tour';
    document.getElementById('category-id').value = category.loaiTourId;
    document.getElementById('category-ten').value = category.tenLoai || '';
    document.getElementById('category-mota').value = category.moTa || '';
    document.getElementById('category-modal').classList.add('active');
}

async function saveCategory(event) {
    event.preventDefault();
    
    const categoryId = document.getElementById('category-id').value;
    const tenLoai = document.getElementById('category-ten').value.trim();
    const moTa = document.getElementById('category-mota').value.trim();
    
    // Validation
    if (!tenLoai) {
        showToast('Vui lòng nhập tên loại tour', 'error');
        return;
    }

    const data = {
        tenLoai: tenLoai,
        moTa: moTa
    };

    try {
        let response;
        if (categoryId) {
            // Update
            data.loaiTourId = categoryId;
            const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.LOAITOUR_UPDATE);
            response = await APIHelper.put(url, data);
        } else {
            // Create
            const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.LOAITOUR_CREATE);
            response = await APIHelper.post(url, data);
        }

        if (response.success) {
            showToast(categoryId ? 'Cập nhật loại tour thành công!' : 'Tạo loại tour thành công!', 'success');
            closeCategoryModal();
            loadCategories();
        } else {
            showToast(response.message || (categoryId ? 'Không thể cập nhật loại tour' : 'Không thể tạo loại tour'), 'error');
        }
    } catch (error) {
        console.error('Error saving category:', error);
        showToast('Lỗi khi lưu loại tour', 'error');
    }
}

async function deleteCategory(categoryId) {
    if (!confirm('Bạn có chắc chắn muốn xóa loại tour này? Hành động này không thể hoàn tác.')) return;

    try {
        const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.LOAITOUR_DELETE) + `/${categoryId}`;
        const response = await APIHelper.delete(url);

        if (response.success) {
            showToast('Xóa loại tour thành công!', 'success');
            loadCategories();
        } else {
            showToast(response.message || 'Không thể xóa loại tour', 'error');
        }
    } catch (error) {
        console.error('Error deleting category:', error);
        showToast('Lỗi khi xóa loại tour', 'error');
    }
}

function closeCategoryModal() {
    document.getElementById('category-modal').classList.remove('active');
}

// ======================
// ĐỊA ĐIỂM
// ======================

async function loadDiaDiems() {
    try {
        const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.DIADIEM_GET_ALL);
        const response = await APIHelper.get(url);

        if (response.success && response.data) {
            allDiaDiems = response.data;
            updateDiaDiemSelect();
        } else {
            console.error('Failed to load dia diems:', response.message);
            allDiaDiems = [];
        }
    } catch (error) {
        console.error('Error loading dia diems:', error);
        allDiaDiems = [];
    }
}

function updateDiaDiemSelect() {
    const select = document.getElementById('tour-diem-xuatphat');
    if (!select) return;

    const currentValue = select.value;
    select.innerHTML = '<option value="">Chọn điểm xuất phát</option>';
    
    allDiaDiems.forEach(dd => {
        const option = document.createElement('option');
        option.value = dd.diaDiemId;
        option.textContent = dd.tenDiaDiem;
        select.appendChild(option);
    });
    
    if (currentValue) select.value = currentValue;
}

// ======================
// TOURS
// ======================

/**
 * Load tours from API
 */
async function loadTours() {
    try {
        const tbody = document.getElementById('tours-table-body');
        if (tbody) {
            showLoadingState(tbody);
        }
        
        const searchTerm = document.getElementById('search-input')?.value || '';
        
        let url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.TOUR_GET_ALL);
        if (searchTerm) {
            url += `?keyword=${encodeURIComponent(searchTerm)}`;
        }
        
        const response = await APIHelper.get(url);

        if (response.success && response.data) {
            allTours = response.data;
            renderToursTable(allTours);
        } else {
            console.error('Failed to load tours:', response.message);
            allTours = [];
            const tbody = document.getElementById('tours-table-body');
            if (tbody) {
                showEmptyState(tbody, response.message || 'Không tìm thấy tour nào');
            }
        }
    } catch (error) {
        console.error('Error loading tours:', error);
        allTours = [];
        const tbody = document.getElementById('tours-table-body');
        if (tbody) {
            showErrorState(tbody, 'Lỗi khi tải dữ liệu tour');
        }
    }
}

function renderToursTable(tours) {
    const tbody = document.getElementById('tours-table-body');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (tours.length === 0) {
        showEmptyState(tbody, 'Không tìm thấy tour nào');
        return;
    }

    tours.forEach(tour => {
        const loaiTour = allCategories.find(c => c.loaiTourId === tour.loaiTourId);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${escapeHtml(tour.tenTour || '-')}</td>
            <td>${loaiTour ? escapeHtml(loaiTour.tenLoai) : '-'}</td>
            <td>${truncateText(escapeHtml(tour.moTaNgan || '-'), 100)}</td>
            <td style="text-align: right;">${FormatHelper.currency(tour.giaNguoiLon)}</td>
            <td style="text-align: right;">${FormatHelper.currency(tour.giaTreEm)}</td>
            <td><span class="status-badge ${getStatusClass(tour.trangThai)}">${escapeHtml(tour.trangThai || 'Không hoạt động')}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn action-btn-primary" onclick="viewTourDetail('${escapeHtml(tour.tourId)}')" 
                            title="Quản lý Lịch trình & Ảnh tour">
                        Chi tiết
                    </button>
                    <button class="action-btn action-btn-secondary" onclick="editTour('${escapeHtml(tour.tourId)}')" title="Sửa thông tin tour">Sửa</button>
                    <button class="action-btn action-btn-danger" onclick="deleteTour('${escapeHtml(tour.tourId)}')" title="Xóa tour">Xóa</button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function getStatusClass(status) {
    if (status === 'Hoạt động') return 'status-confirmed';
    if (status === 'Không hoạt động') return 'status-cancelled';
    return 'status-pending';
}

function showAddTourModal() {
    document.getElementById('modal-title').textContent = 'Thêm tour';
    document.getElementById('tour-form').reset();
    document.getElementById('tour-id').value = '';
    document.getElementById('tour-trangthai').value = 'Hoạt động';
    document.getElementById('tour-modal').classList.add('active');
}

function editTour(tourId) {
    const tour = allTours.find(t => t.tourId === tourId);
    if (!tour) {
        showToast('Không tìm thấy tour', 'error');
        return;
    }

    document.getElementById('modal-title').textContent = 'Sửa tour';
    document.getElementById('tour-id').value = tour.tourId;
    document.getElementById('tour-ten').value = tour.tenTour || '';
    document.getElementById('tour-loai').value = tour.loaiTourId || '';
    document.getElementById('tour-mota-ngan').value = tour.moTaNgan || '';
    document.getElementById('tour-mota-chitiet').value = tour.moTaChiTiet || '';
    document.getElementById('tour-diem-xuatphat').value = tour.diemXuatPhatId || '';
    document.getElementById('tour-thoigian-khoihanh').value = tour.thoiGianKhoiHanh || '';
    document.getElementById('tour-gia-nguoilon').value = tour.giaNguoiLon || 0;
    document.getElementById('tour-gia-treEm').value = tour.giaTreEm || 0;
    document.getElementById('tour-trangthai').value = tour.trangThai || 'Hoạt động';
    document.getElementById('tour-modal').classList.add('active');
}

async function saveTour(event) {
    event.preventDefault();
    
    const tourId = document.getElementById('tour-id').value;
    const tenTour = document.getElementById('tour-ten').value.trim();
    const loaiTourId = document.getElementById('tour-loai').value;
    const diemXuatPhatId = document.getElementById('tour-diem-xuatphat').value;
    const giaNguoiLon = parseFloat(document.getElementById('tour-gia-nguoilon').value);
    
    // Validation
    if (!tenTour) {
        showToast('Vui lòng nhập tên tour', 'error');
        return;
    }
    if (!loaiTourId) {
        showToast('Vui lòng chọn loại tour', 'error');
        return;
    }
    if (!diemXuatPhatId) {
        showToast('Vui lòng chọn điểm xuất phát', 'error');
        return;
    }
    if (isNaN(giaNguoiLon) || giaNguoiLon <= 0) {
        showToast('Giá người lớn phải là số lớn hơn 0', 'error');
        return;
    }

    const data = {
        tenTour: tenTour,
        loaiTourId: loaiTourId,
        moTaNgan: document.getElementById('tour-mota-ngan').value,
        moTaChiTiet: document.getElementById('tour-mota-chitiet').value,
        diemXuatPhatId: diemXuatPhatId,
        thoiGianKhoiHanh: document.getElementById('tour-thoigian-khoihanh').value,
        giaNguoiLon: giaNguoiLon,
        giaTreEm: parseFloat(document.getElementById('tour-gia-treEm').value) || 0,
        trangThai: document.getElementById('tour-trangthai').value
    };

    try {
        let response;
        if (tourId) {
            // Update
            data.tourId = tourId;
            const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.TOUR_UPDATE);
            response = await APIHelper.put(url, data);
        } else {
            // Create
            const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.TOUR_CREATE);
            response = await APIHelper.post(url, data);
        }

        if (response.success) {
            showToast(tourId ? 'Cập nhật tour thành công!' : 'Tạo tour thành công!', 'success');
            closeTourModal();
            loadTours();
        } else {
            showToast(response.message || (tourId ? 'Không thể cập nhật tour' : 'Không thể tạo tour'), 'error');
        }
    } catch (error) {
        console.error('Error saving tour:', error);
        showToast('Lỗi khi lưu tour', 'error');
    }
}

async function deleteTour(tourId) {
    if (!confirm('Bạn có chắc chắn muốn xóa tour này? Hành động này không thể hoàn tác.')) return;

    try {
        const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.TOUR_DELETE) + `/${tourId}`;
        const response = await APIHelper.delete(url);

        if (response.success) {
            showToast('Xóa tour thành công!', 'success');
            loadTours();
        } else {
            showToast(response.message || 'Không thể xóa tour', 'error');
        }
    } catch (error) {
        console.error('Error deleting tour:', error);
        showToast('Lỗi khi xóa tour', 'error');
    }
}

function closeTourModal() {
    document.getElementById('tour-modal').classList.remove('active');
}

// ======================
// TOUR DETAIL (SCHEDULE & IMAGES)
// ======================

async function viewTourDetail(tourId) {
    currentTourId = tourId;
    const tour = allTours.find(t => t.tourId === tourId);
    if (!tour) {
        showToast('Không tìm thấy tour', 'error');
        return;
    }

    // Update summary section
    const loaiTour = allCategories.find(c => c.loaiTourId === tour.loaiTourId);
    document.getElementById('tour-detail-title').textContent = tour.tenTour;
    document.getElementById('summary-loai-tour').textContent = loaiTour ? loaiTour.tenLoai : '-';
    document.getElementById('summary-gia').textContent = `${FormatHelper.currency(tour.giaNguoiLon)} / ${FormatHelper.currency(tour.giaTreEm)}`;
    document.getElementById('summary-trang-thai').innerHTML = `<span class="status-badge ${getStatusClass(tour.trangThai)}">${tour.trangThai}</span>`;
    document.getElementById('summary-thoi-gian').textContent = tour.thoiGianKhoiHanh || '-';
    document.getElementById('summary-mo-ta').textContent = truncateText(tour.moTaNgan || '-', 200);
    
    await showDetailTab('lich-trinh');
    document.getElementById('tour-detail-modal').classList.add('active');
}

// Function to handle edit from detail view
function editTourFromDetail() {
    if (!currentTourId) {
        showToast('Không có tour nào được chọn', 'error');
        return;
    }
    
    // Close detail modal and open edit modal
    closeTourDetailModal();
    editTour(currentTourId);
}

// Function to handle delete from detail view
async function deleteTourFromDetail() {
    if (!currentTourId) {
        showToast('Không có tour nào được chọn', 'error');
        return;
    }
    
    if (!confirm('Bạn có chắc chắn muốn xóa tour này? Hành động này không thể hoàn tác.')) return;
    
    try {
        const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.TOUR_DELETE) + `/${currentTourId}`;
        const response = await APIHelper.delete(url);

        if (response.success) {
            showToast('Xóa tour thành công!', 'success');
            closeTourDetailModal();
            loadTours(); // Refresh the tours list
        } else {
            showToast(response.message || 'Không thể xóa tour', 'error');
        }
    } catch (error) {
        console.error('Error deleting tour:', error);
        showToast('Lỗi khi xóa tour', 'error');
    }
}

async function showDetailTab(tabName) {
    // Update tab buttons
    const tabButtons = document.querySelectorAll('#tour-detail-modal .tab-button');
    tabButtons.forEach(btn => btn.classList.remove('active'));
    
    // Find and activate clicked button
    if (event && event.target) {
        event.target.classList.add('active');
    } else {
        tabButtons[0].classList.add('active');
    }

    const content = document.getElementById('tour-detail-content');
    if (!content) return;

    if (tabName === 'lich-trinh') {
        await loadSchedules();
        renderSchedulesTab();
    } else if (tabName === 'anh-tour') {
        await loadImages();
        renderImagesTab();
    }
    
    content.classList.add('active');
}

function closeTourDetailModal() {
    document.getElementById('tour-detail-modal').classList.remove('active');
    currentTourId = null;
}

// ======================
// LỊCH TRÌNH (SCHEDULES)
// ======================

async function loadSchedules() {
    if (!currentTourId) return;

    try {
        const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.LICHTRINH_GET_BY_TOUR) + `/${currentTourId}`;
        const response = await APIHelper.get(url);

        if (response.success && response.data) {
            currentSchedules = response.data;
        } else {
            currentSchedules = [];
        }
    } catch (error) {
        console.error('Error loading schedules:', error);
        currentSchedules = [];
    }
}

function renderSchedulesTab() {
    const content = document.getElementById('tour-detail-content');
    if (!content) return;

    if (currentSchedules.length === 0) {
        content.innerHTML = `
            <div style="margin-bottom: var(--spacing-md);">
                <button class="cta-button cta-secondary" onclick="showAddScheduleModal()">➕ Thêm ngày lịch trình</button>
            </div>
            <div class="empty-state">
                <div>📭</div>
                <p>Chưa có lịch trình nào</p>
            </div>
        `;
        return;
    }

    // Sort schedules by day number
    currentSchedules.sort((a, b) => a.ngayThu - b.ngayThu);

    let scheduleItems = '';
    currentSchedules.forEach(sch => {
        scheduleItems += `
            <div class="schedule-item">
                <div class="schedule-header" onclick="toggleSchedule(this)">
                    <div>
                        <strong>Ngày ${sch.ngayThu}</strong> - ${escapeHtml(sch.tieuDe || '(Không có tiêu đề)')}
                    </div>
                    <div class="schedule-actions">
                        <button class="action-btn action-btn-secondary" onclick="event.stopPropagation(); editSchedule('${escapeHtml(sch.lichTrinhId)}')">Sửa</button>
                        <button class="action-btn action-btn-danger" onclick="event.stopPropagation(); deleteSchedule('${escapeHtml(sch.lichTrinhId)}')">Xóa</button>
                    </div>
                </div>
                <div class="schedule-body">
                    <p><strong>Nội dung:</strong></p>
                    <pre style="white-space: pre-wrap; margin: 10px 0; padding: 10px; background: #f8f9fa; border-radius: 4px;">${escapeHtml(sch.noiDung || '')}</pre>
                </div>
            </div>
        `;
    });

    content.innerHTML = `
        <div style="margin-bottom: var(--spacing-md);">
            <button class="cta-button cta-secondary" onclick="showAddScheduleModal()">➕ Thêm ngày lịch trình</button>
        </div>
        <div class="schedule-list">
            ${scheduleItems}
        </div>
    `;
}

function toggleSchedule(headerElement) {
    const body = headerElement.nextElementSibling;
    body.classList.toggle('open');
}

function showAddScheduleModal() {
    document.getElementById('schedule-modal-title').textContent = 'Thêm lịch trình';
    document.getElementById('schedule-form').reset();
    document.getElementById('schedule-id').value = '';
    document.getElementById('schedule-tour-id').value = currentTourId;
    document.getElementById('schedule-modal').classList.add('active');
}

function editSchedule(scheduleId) {
    const schedule = currentSchedules.find(s => s.lichTrinhId === scheduleId);
    if (!schedule) {
        showToast('Không tìm thấy lịch trình', 'error');
        return;
    }

    document.getElementById('schedule-modal-title').textContent = 'Sửa lịch trình';
    document.getElementById('schedule-id').value = schedule.lichTrinhId;
    document.getElementById('schedule-tour-id').value = schedule.tourId;
    document.getElementById('schedule-ngaythu').value = schedule.ngayThu || 1;
    document.getElementById('schedule-tieude').value = schedule.tieuDe || '';
    document.getElementById('schedule-noidung').value = schedule.noiDung || '';
    document.getElementById('schedule-modal').classList.add('active');
}

async function saveSchedule(event) {
    event.preventDefault();
    
    const scheduleId = document.getElementById('schedule-id').value;
    const ngayThu = parseInt(document.getElementById('schedule-ngaythu').value);
    const tieuDe = document.getElementById('schedule-tieude').value.trim();
    const noiDung = document.getElementById('schedule-noidung').value.trim();
    
    // Validation
    if (!ngayThu || ngayThu <= 0) {
        showToast('Ngày thứ phải là số nguyên dương', 'error');
        return;
    }

    const data = {
        tourId: document.getElementById('schedule-tour-id').value,
        ngayThu: ngayThu,
        tieuDe: tieuDe,
        noiDung: noiDung
    };

    try {
        let response;
        if (scheduleId) {
            // Update
            data.lichTrinhId = scheduleId;
            const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.LICHTRINH_UPDATE);
            response = await APIHelper.put(url, data);
        } else {
            // Create
            const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.LICHTRINH_CREATE);
            response = await APIHelper.post(url, data);
        }

        if (response.success) {
            showToast(scheduleId ? 'Cập nhật lịch trình thành công!' : 'Tạo lịch trình thành công!', 'success');
            closeScheduleModal();
            await loadSchedules();
            renderSchedulesTab();
        } else {
            showToast(response.message || (scheduleId ? 'Không thể cập nhật lịch trình' : 'Không thể tạo lịch trình'), 'error');
        }
    } catch (error) {
        console.error('Error saving schedule:', error);
        showToast('Lỗi khi lưu lịch trình', 'error');
    }
}

async function deleteSchedule(scheduleId) {
    if (!confirm('Bạn có chắc chắn muốn xóa lịch trình này? Hành động này không thể hoàn tác.')) return;

    try {
        const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.LICHTRINH_DELETE) + `/${scheduleId}`;
        const response = await APIHelper.delete(url);

        if (response.success) {
            showToast('Xóa lịch trình thành công!', 'success');
            await loadSchedules();
            renderSchedulesTab();
        } else {
            showToast(response.message || 'Không thể xóa lịch trình', 'error');
        }
    } catch (error) {
        console.error('Error deleting schedule:', error);
        showToast('Lỗi khi xóa lịch trình', 'error');
    }
}

function closeScheduleModal() {
    document.getElementById('schedule-modal').classList.remove('active');
}

// ======================
// ẢNH TOUR (IMAGES)
// ======================

async function loadImages() {
    if (!currentTourId) return;

    try {
        const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.ANHTOUR_GET_BY_TOUR) + `/${currentTourId}`;
        const response = await APIHelper.get(url);

        if (response.success && response.data) {
            currentImages = response.data;
        } else {
            currentImages = [];
        }
    } catch (error) {
        console.error('Error loading images:', error);
        currentImages = [];
    }
}

function renderImagesTab() {
    const content = document.getElementById('tour-detail-content');
    if (!content) return;

    let imageGallery = '';
    if (currentImages.length === 0) {
        imageGallery = `
            <div style="margin-bottom: var(--spacing-md);">
                <button class="cta-button cta-secondary" onclick="showAddImageModal()">➕ Thêm ảnh</button>
            </div>
            <div class="empty-state">
                <div>📭</div>
                <p>Chưa có ảnh nào</p>
            </div>
        `;
    } else {
        let imageCards = '';
        currentImages.forEach(img => {
            const isAvatar = img.isAvatar ? '<span class="avatar-badge">Ảnh đại diện</span>' : '';
            imageCards += `
                <div class="image-card">
                    ${isAvatar}
                    <img src="${escapeHtml(img.linkAnh)}" alt="Tour image" onerror="this.src='img/placeholder.jpg'; this.alt='Image not found'">
                    <div class="image-actions">
                        ${!img.isAvatar ? `<button class="action-btn action-btn-secondary" onclick="setAsAvatar('${escapeHtml(img.anhTourId)}')">Đặt làm đại diện</button>` : ''}
                        <button class="action-btn action-btn-danger" onclick="deleteImage('${escapeHtml(img.anhTourId)}')">Xóa</button>
                    </div>
                </div>
            `;
        });
        
        imageGallery = `
            <div style="margin-bottom: var(--spacing-md);">
                <div class="form-group">
                    <label class="form-label required" for="add-image-url">Link ảnh</label>
                    <div style="display: flex; gap: var(--spacing-sm);">
                        <input type="url" id="add-image-url" class="form-input" placeholder="https://example.com/image.jpg">
                        <button class="cta-button cta-secondary" onclick="addImageFromInput()">Thêm ảnh</button>
                    </div>
                </div>
            </div>
            <div class="image-gallery">
                ${imageCards}
            </div>
        `;
    }

    content.innerHTML = imageGallery;
}

function showAddImageModal() {
    document.getElementById('image-form').reset();
    document.getElementById('image-tour-id').value = currentTourId;
    document.getElementById('image-modal').classList.add('active');
}

// Function to add image from input field directly
async function addImageFromInput() {
    const imageUrl = document.getElementById('add-image-url').value.trim();
    
    if (!imageUrl) {
        showToast('Vui lòng nhập link ảnh', 'error');
        return;
    }
    
    // Basic URL validation
    try {
        new URL(imageUrl);
    } catch (e) {
        showToast('Link ảnh không hợp lệ', 'error');
        return;
    }

    const data = {
        tourId: currentTourId,
        linkAnh: imageUrl
    };

    try {
        const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.ANHTOUR_CREATE);
        const response = await APIHelper.post(url, data);

        if (response.success) {
            showToast('Thêm ảnh thành công!', 'success');
            document.getElementById('add-image-url').value = ''; // Clear input
            await loadImages();
            renderImagesTab();
        } else {
            showToast(response.message || 'Không thể thêm ảnh', 'error');
        }
    } catch (error) {
        console.error('Error saving image:', error);
        showToast('Lỗi khi thêm ảnh', 'error');
    }
}

async function saveImage(event) {
    event.preventDefault();
    
    const linkAnh = document.getElementById('image-link').value.trim();
    
    if (!linkAnh) {
        showToast('Vui lòng nhập link ảnh', 'error');
        return;
    }
    
    // Basic URL validation
    try {
        new URL(linkAnh);
    } catch (e) {
        showToast('Link ảnh không hợp lệ', 'error');
        return;
    }

    const data = {
        tourId: document.getElementById('image-tour-id').value,
        linkAnh: linkAnh
    };

    try {
        const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.ANHTOUR_CREATE);
        const response = await APIHelper.post(url, data);

        if (response.success) {
            showToast('Thêm ảnh thành công!', 'success');
            closeImageModal();
            await loadImages();
            renderImagesTab();
        } else {
            showToast(response.message || 'Không thể thêm ảnh', 'error');
        }
    } catch (error) {
        console.error('Error saving image:', error);
        showToast('Lỗi khi thêm ảnh', 'error');
    }
}

async function setAsAvatar(imageId) {
    try {
        const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.ANHTOUR_SET_AVATAR);
        const response = await APIHelper.put(url, { 
            anhTourId: imageId,
            tourId: currentTourId
        });

        if (response.success) {
            showToast('Đặt ảnh đại diện thành công!', 'success');
            await loadImages();
            renderImagesTab();
        } else {
            showToast(response.message || 'Không thể đặt ảnh đại diện', 'error');
        }
    } catch (error) {
        console.error('Error setting avatar:', error);
        showToast('Lỗi khi đặt ảnh đại diện', 'error');
    }
}

async function deleteImage(imageId) {
    if (!confirm('Bạn có chắc chắn muốn xóa ảnh này? Hành động này không thể hoàn tác.')) return;

    try {
        const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.ANHTOUR_DELETE) + `/${imageId}`;
        const response = await APIHelper.delete(url);

        if (response.success) {
            showToast('Xóa ảnh thành công!', 'success');
            await loadImages();
            renderImagesTab();
        } else {
            showToast(response.message || 'Không thể xóa ảnh', 'error');
        }
    } catch (error) {
        console.error('Error deleting image:', error);
        showToast('Lỗi khi xóa ảnh', 'error');
    }
}

function closeImageModal() {
    document.getElementById('image-modal').classList.remove('active');
}

// ======================
// HELPER FUNCTIONS
// ======================

// Escape HTML to prevent XSS
function escapeHtml(text) {
    if (!text) return '';
    return text.toString()
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Truncate text with ellipsis
function truncateText(text, maxLength) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
}
