// Admin Edit Tour JavaScript
let allCategories = [];
let allDiaDiems = [];
let currentTourId = null;

document.addEventListener('DOMContentLoaded', function() {
    // Kiểm tra quyền admin
    if (!AuthHelper.requireAuth('Admin')) {
        return;
    }

    console.log('Admin Edit Tour loaded');
    
    // Lấy tour ID từ URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    currentTourId = urlParams.get('id');
    
    if (!currentTourId) {
        showToast('Không tìm thấy ID tour', 'error');
        setTimeout(() => {
            window.location.href = 'admin-tours.html';
        }, 1500);
        return;
    }
    
    // Load initial data
    loadDiaDiems();
    loadCategories();
    
    // Load tour details
    loadTourDetails();
    
    // Setup form submit listener
    const form = document.getElementById('tour-form');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            updateTour(e);
        });
    }
});

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
 * Logout function
 */
function logout() {
    if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
        AuthHelper.logout();
        window.location.href = 'login.html';
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
            updateCategorySelect();
        } else {
            console.error('Failed to load categories:', response.message);
            allCategories = [];
        }
    } catch (error) {
        console.error('Error loading categories:', error);
        allCategories = [];
    }
}

function updateCategorySelect() {
    const select = document.getElementById('tour-loai');
    if (!select) return;

    const currentValue = select.value;
    select.innerHTML = '<option value="">Chọn loại tour</option>';
    
    allCategories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.loaiTourId;
        option.textContent = cat.tenLoai;
        select.appendChild(option);
    });
    
    if (currentValue) select.value = currentValue;
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
// LOAD TOUR DETAILS
// ======================

async function loadTourDetails() {
    try {
        const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.TOUR_GET_BY_ID) + `/${currentTourId}`;
        const response = await APIHelper.get(url);

        if (response.success && response.data) {
            const tour = response.data;
            fillTourForm(tour);
        } else {
            console.error('Failed to load tour details:', response.message);
            showToast(response.message || 'Không tìm thấy tour', 'error');
            setTimeout(() => {
                window.location.href = 'admin-tours.html';
            }, 2000);
        }
    } catch (error) {
        console.error('Error loading tour details:', error);
        showToast('Lỗi khi tải thông tin tour', 'error');
        setTimeout(() => {
            window.location.href = 'admin-tours.html';
        }, 2000);
    }
}

function fillTourForm(tour) {
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
}

// ======================
// UPDATE TOUR
// ======================

async function updateTour(event) {
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
        tourId: tourId,
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
        const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.TOUR_UPDATE);
        const response = await APIHelper.put(url, data);

        if (response.success) {
            showToast('Cập nhật tour thành công!', 'success');
            // Redirect to tour management page after successful update
            setTimeout(() => {
                window.location.href = 'admin-tours.html';
            }, 1500);
        } else {
            showToast(response.message || 'Không thể cập nhật tour', 'error');
        }
    } catch (error) {
        console.error('Error updating tour:', error);
        showToast('Lỗi khi cập nhật tour', 'error');
    }
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
