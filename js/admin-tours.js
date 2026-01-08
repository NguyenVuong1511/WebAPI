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
 * Logout function
 */
function logout() {
    if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
        AuthHelper.logout();
        window.location.href = '/login.html';
    }
}

/**
 * Switch main tabs (Tours / Categories)
 */
function switchMainTab(tabName) {
    // Update tab buttons
    const tabButtons = document.querySelectorAll('.tab-nav-btn');
    tabButtons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    // Update tab panels
    document.getElementById('tours-tab').style.display = tabName === 'tours' ? 'block' : 'none';
    document.getElementById('categories-tab').style.display = tabName === 'categories' ? 'block' : 'none';
    
    // Load data for selected tab
    if (tabName === 'categories') {
        loadCategories();
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
        const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.LOAITOUR_GET_ALL);
        const response = await APIHelper.get(url);

        if (response.success && response.data) {
            allCategories = response.data;
            renderCategoriesTable(allCategories);
            updateCategorySelects();
        } else {
            console.error('Failed to load categories:', response.message);
            allCategories = [];
            renderCategoriesTable([]);
        }
    } catch (error) {
        console.error('Error loading categories:', error);
        allCategories = [];
        renderCategoriesTable([]);
    }
}

function renderCategoriesTable(categories) {
    const tbody = document.getElementById('categories-table-body');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (categories.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align: center; padding: var(--spacing-xl);">Chưa có loại tour nào</td></tr>';
        return;
    }

    categories.forEach(cat => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${cat.tenLoai || '-'}</td>
            <td>${cat.moTa || '-'}</td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn action-btn-secondary" onclick="editCategory('${cat.loaiTourId}')">✏️ Sửa</button>
                    <button class="action-btn action-btn-danger" onclick="deleteCategory('${cat.loaiTourId}')">🗑️ Xóa</button>
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
    
    // Update filter select
    const filterSelect = document.getElementById('loaitour-filter');
    if (filterSelect) {
        const currentValue = filterSelect.value;
        filterSelect.innerHTML = '<option value="">Tất cả loại tour</option>';
        allCategories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.loaiTourId;
            option.textContent = cat.tenLoai;
            filterSelect.appendChild(option);
        });
        if (currentValue) filterSelect.value = currentValue;
    }
}

function showAddCategoryModal() {
    document.getElementById('category-modal-title').textContent = 'Thêm Loại Tour';
    document.getElementById('category-form').reset();
    document.getElementById('category-id').value = '';
    document.getElementById('category-modal').classList.add('active');
}

function editCategory(categoryId) {
    const category = allCategories.find(c => c.loaiTourId === categoryId);
    if (!category) {
        alert('Không tìm thấy loại tour');
        return;
    }

    document.getElementById('category-modal-title').textContent = 'Sửa Loại Tour';
    document.getElementById('category-id').value = category.loaiTourId;
    document.getElementById('category-ten').value = category.tenLoai || '';
    document.getElementById('category-mota').value = category.moTa || '';
    document.getElementById('category-modal').classList.add('active');
}

async function saveCategory(event) {
    event.preventDefault();
    
    const categoryId = document.getElementById('category-id').value;
    const data = {
        tenLoai: document.getElementById('category-ten').value,
        moTa: document.getElementById('category-mota').value
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
            alert(categoryId ? 'Cập nhật loại tour thành công!' : 'Tạo loại tour thành công!');
            closeCategoryModal();
            loadCategories();
        } else {
            alert('Lỗi: ' + (response.message || 'Không thể lưu loại tour'));
        }
    } catch (error) {
        console.error('Error saving category:', error);
        alert('Lỗi khi lưu loại tour');
    }
}

async function deleteCategory(categoryId) {
    if (!confirm('Bạn có chắc chắn muốn xóa loại tour này?')) return;

    try {
        const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.LOAITOUR_DELETE) + `/${categoryId}`;
        const response = await APIHelper.delete(url);

        if (response.success) {
            alert('Xóa loại tour thành công!');
            loadCategories();
        } else {
            alert('Lỗi: ' + (response.message || 'Không thể xóa loại tour'));
        }
    } catch (error) {
        console.error('Error deleting category:', error);
        alert('Lỗi khi xóa loại tour');
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
        const searchTerm = document.getElementById('search-input').value;
        const loaiTourFilter = document.getElementById('loaitour-filter').value;
        const statusFilter = document.getElementById('status-filter').value;
        
        let url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.TOUR_GET_ALL);
        if (searchTerm) {
            url += `?keyword=${encodeURIComponent(searchTerm)}`;
        }
        
        const response = await APIHelper.get(url);

        if (response.success && response.data) {
            allTours = response.data;
            
            // Apply filters
            let filteredTours = allTours;
            if (loaiTourFilter) {
                filteredTours = filteredTours.filter(t => t.loaiTourId === loaiTourFilter);
            }
            if (statusFilter) {
                filteredTours = filteredTours.filter(t => t.trangThai === statusFilter);
            }
            
            renderToursTable(filteredTours);
        } else {
            console.error('Failed to load tours:', response.message);
            allTours = [];
            renderToursTable([]);
        }
    } catch (error) {
        console.error('Error loading tours:', error);
        allTours = [];
        renderToursTable([]);
    }
}

function renderToursTable(tours) {
    const tbody = document.getElementById('tours-table-body');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (tours.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: var(--spacing-xl);">Không tìm thấy tour nào</td></tr>';
        return;
    }

    tours.forEach(tour => {
        const loaiTour = allCategories.find(c => c.loaiTourId === tour.loaiTourId);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${tour.tenTour || '-'}</td>
            <td>${loaiTour ? loaiTour.tenLoai : '-'}</td>
            <td style="max-width: 300px;">${tour.moTaNgan || '-'}</td>
            <td style="text-align: right;">${FormatHelper.currency(tour.giaNguoiLon)}</td>
            <td style="text-align: right;">${FormatHelper.currency(tour.giaTreEm)}</td>
            <td><span class="status-badge ${getStatusClass(tour.trangThai)}">${tour.trangThai || 'Không hoạt động'}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn action-btn-primary" onclick="viewTourDetail('${tour.tourId}')" 
                            title="Quản lý Lịch trình & Ảnh tour"
                            style="background: #4CAF50;">
                        📋 Lịch trình & Ảnh
                    </button>
                    <button class="action-btn action-btn-secondary" onclick="editTour('${tour.tourId}')" title="Sửa thông tin tour">✏️</button>
                    <button class="action-btn action-btn-danger" onclick="deleteTour('${tour.tourId}')" title="Xóa tour">🗑️</button>
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
    document.getElementById('modal-title').textContent = 'Tạo Tour mới';
    document.getElementById('tour-form').reset();
    document.getElementById('tour-id').value = '';
    document.getElementById('tour-trangthai').value = 'Hoạt động';
    document.getElementById('tour-modal').classList.add('active');
}

function editTour(tourId) {
    const tour = allTours.find(t => t.tourId === tourId);
    if (!tour) {
        alert('Không tìm thấy tour');
        return;
    }

    document.getElementById('modal-title').textContent = 'Sửa Tour';
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
    const data = {
        tenTour: document.getElementById('tour-ten').value,
        loaiTourId: document.getElementById('tour-loai').value,
        moTaNgan: document.getElementById('tour-mota-ngan').value,
        moTaChiTiet: document.getElementById('tour-mota-chitiet').value,
        diemXuatPhatId: document.getElementById('tour-diem-xuatphat').value,
        thoiGianKhoiHanh: document.getElementById('tour-thoigian-khoihanh').value,
        giaNguoiLon: parseFloat(document.getElementById('tour-gia-nguoilon').value) || 0,
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
            alert(tourId ? 'Cập nhật tour thành công!' : 'Tạo tour thành công!');
            closeTourModal();
            loadTours();
        } else {
            alert('Lỗi: ' + (response.message || 'Không thể lưu tour'));
        }
    } catch (error) {
        console.error('Error saving tour:', error);
        alert('Lỗi khi lưu tour');
    }
}

async function deleteTour(tourId) {
    if (!confirm('Bạn có chắc chắn muốn xóa tour này?')) return;

    try {
        const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.TOUR_DELETE) + `/${tourId}`;
        const response = await APIHelper.delete(url);

        if (response.success) {
            alert('Xóa tour thành công!');
            loadTours();
        } else {
            alert('Lỗi: ' + (response.message || 'Không thể xóa tour'));
        }
    } catch (error) {
        console.error('Error deleting tour:', error);
        alert('Lỗi khi xóa tour');
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
        alert('Không tìm thấy tour');
        return;
    }

    document.getElementById('tour-detail-title').textContent = tour.tenTour;
    await showDetailTab('lich-trinh');
    document.getElementById('tour-detail-modal').classList.add('active');
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

    let tableRows = '';
    if (currentSchedules.length === 0) {
        tableRows = '<tr><td colspan="4" style="text-align: center; padding: var(--spacing-xl);">Chưa có lịch trình nào</td></tr>';
    } else {
        currentSchedules.sort((a, b) => a.ngayThu - b.ngayThu);
        currentSchedules.forEach(sch => {
            tableRows += `
                <tr>
                    <td>${sch.ngayThu}</td>
                    <td>${sch.tieuDe || '-'}</td>
                    <td style="max-width: 400px; white-space: pre-wrap;">${sch.noiDung || '-'}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="action-btn action-btn-secondary" onclick="editSchedule('${sch.lichTrinhId}')">✏️ Sửa</button>
                            <button class="action-btn action-btn-danger" onclick="deleteSchedule('${sch.lichTrinhId}')">🗑️ Xóa</button>
                        </div>
                    </td>
                </tr>
            `;
        });
    }

    content.innerHTML = `
        <div style="margin-bottom: var(--spacing-md);">
            <button class="cta-button cta-secondary" onclick="showAddScheduleModal()">➕ Thêm lịch trình</button>
        </div>
        <table class="bookings-table">
            <thead>
                <tr>
                    <th>Ngày thứ</th>
                    <th>Tiêu đề</th>
                    <th>Nội dung</th>
                    <th>Thao tác</th>
                </tr>
            </thead>
            <tbody>
                ${tableRows}
            </tbody>
        </table>
    `;
}

function showAddScheduleModal() {
    document.getElementById('schedule-modal-title').textContent = 'Thêm Lịch trình';
    document.getElementById('schedule-form').reset();
    document.getElementById('schedule-id').value = '';
    document.getElementById('schedule-tour-id').value = currentTourId;
    document.getElementById('schedule-modal').classList.add('active');
}

function editSchedule(scheduleId) {
    const schedule = currentSchedules.find(s => s.lichTrinhId === scheduleId);
    if (!schedule) {
        alert('Không tìm thấy lịch trình');
        return;
    }

    document.getElementById('schedule-modal-title').textContent = 'Sửa Lịch trình';
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
    const data = {
        tourId: document.getElementById('schedule-tour-id').value,
        ngayThu: parseInt(document.getElementById('schedule-ngaythu').value),
        tieuDe: document.getElementById('schedule-tieude').value,
        noiDung: document.getElementById('schedule-noidung').value
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
            alert(scheduleId ? 'Cập nhật lịch trình thành công!' : 'Tạo lịch trình thành công!');
            closeScheduleModal();
            await loadSchedules();
            renderSchedulesTab();
        } else {
            alert('Lỗi: ' + (response.message || 'Không thể lưu lịch trình'));
        }
    } catch (error) {
        console.error('Error saving schedule:', error);
        alert('Lỗi khi lưu lịch trình');
    }
}

async function deleteSchedule(scheduleId) {
    if (!confirm('Bạn có chắc chắn muốn xóa lịch trình này?')) return;

    try {
        const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.LICHTRINH_DELETE) + `/${scheduleId}`;
        const response = await APIHelper.delete(url);

        if (response.success) {
            alert('Xóa lịch trình thành công!');
            await loadSchedules();
            renderSchedulesTab();
        } else {
            alert('Lỗi: ' + (response.message || 'Không thể xóa lịch trình'));
        }
    } catch (error) {
        console.error('Error deleting schedule:', error);
        alert('Lỗi khi xóa lịch trình');
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

    let imageCards = '';
    if (currentImages.length === 0) {
        imageCards = '<p style="text-align: center; padding: var(--spacing-xl); color: var(--text-secondary);">Chưa có ảnh nào</p>';
    } else {
        currentImages.forEach(img => {
            const isAvatar = img.isAvatar ? '⭐ Ảnh đại diện' : '';
            imageCards += `
                <div class="image-card" style="border: 1px solid var(--border-color); border-radius: 8px; padding: var(--spacing-md); margin-bottom: var(--spacing-md);">
                    <img src="${img.linkAnh}" alt="Tour image" style="width: 100%; max-height: 300px; object-fit: cover; border-radius: 4px; margin-bottom: var(--spacing-sm);" onerror="this.src='img/placeholder.jpg'">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="color: var(--primary-color); font-weight: 600;">${isAvatar}</span>
                        <div class="action-buttons">
                            ${!img.isAvatar ? `<button class="action-btn action-btn-secondary" onclick="setAsAvatar('${img.anhTourId}')">⭐ Đặt làm đại diện</button>` : ''}
                            <button class="action-btn action-btn-danger" onclick="deleteImage('${img.anhTourId}')">🗑️ Xóa</button>
                        </div>
                    </div>
                </div>
            `;
        });
    }

    content.innerHTML = `
        <div style="margin-bottom: var(--spacing-md);">
            <button class="cta-button cta-secondary" onclick="showAddImageModal()">➕ Thêm ảnh</button>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: var(--spacing-md);">
            ${imageCards}
        </div>
    `;
}

function showAddImageModal() {
    document.getElementById('image-form').reset();
    document.getElementById('image-tour-id').value = currentTourId;
    document.getElementById('image-modal').classList.add('active');
}

async function saveImage(event) {
    event.preventDefault();
    
    const data = {
        tourId: document.getElementById('image-tour-id').value,
        linkAnh: document.getElementById('image-link').value
    };

    try {
        const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.ANHTOUR_CREATE);
        const response = await APIHelper.post(url, data);

        if (response.success) {
            alert('Thêm ảnh thành công!');
            closeImageModal();
            await loadImages();
            renderImagesTab();
        } else {
            alert('Lỗi: ' + (response.message || 'Không thể thêm ảnh'));
        }
    } catch (error) {
        console.error('Error saving image:', error);
        alert('Lỗi khi thêm ảnh');
    }
}

async function setAsAvatar(imageId) {
    try {
        const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.ANHTOUR_SET_AVATAR);
        const response = await APIHelper.put(url, { anhTourId: imageId });

        if (response.success) {
            alert('Đặt ảnh đại diện thành công!');
            await loadImages();
            renderImagesTab();
        } else {
            alert('Lỗi: ' + (response.message || 'Không thể đặt ảnh đại diện'));
        }
    } catch (error) {
        console.error('Error setting avatar:', error);
        alert('Lỗi khi đặt ảnh đại diện');
    }
}

async function deleteImage(imageId) {
    if (!confirm('Bạn có chắc chắn muốn xóa ảnh này?')) return;

    try {
        const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.ANHTOUR_DELETE) + `/${imageId}`;
        const response = await APIHelper.delete(url);

        if (response.success) {
            alert('Xóa ảnh thành công!');
            await loadImages();
            renderImagesTab();
        } else {
            alert('Lỗi: ' + (response.message || 'Không thể xóa ảnh'));
        }
    } catch (error) {
        console.error('Error deleting image:', error);
        alert('Lỗi khi xóa ảnh');
    }
}

function closeImageModal() {
    document.getElementById('image-modal').classList.remove('active');
}