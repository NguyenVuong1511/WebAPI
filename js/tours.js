// Tours List Page JavaScript
let allTours = [];
let filteredTours = [];
let currentPage = 1;
const toursPerPage = 9;

document.addEventListener('DOMContentLoaded', function() {
    checkUserLogin();
    loadTours();
    
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                applyFilters();
            }
        });
    }
});

// Load tours from API
async function loadTours() {
    try {
        const toursLoading = document.getElementById('tours-loading');
        const toursGrid = document.getElementById('tours-grid');
        const toursEmpty = document.getElementById('tours-empty');
        
        if (toursLoading) toursLoading.style.display = 'block';
        if (toursGrid) toursGrid.style.display = 'none';
        if (toursEmpty) toursEmpty.style.display = 'none';
        
        // POST /tour/user/get-all với TourUserQueryDTO
        const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.TOUR_USER_GET_ALL);
        const requestBody = {
            Keyword: '',
            SortBy: 'NgayTao',
            SortDir: 'DESC'
        };
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
            throw new Error('Không thể tải danh sách tour');
        }
        
        const result = await response.json();
        
        // Xử lý response (có thể là ApiResponse hoặc trực tiếp là array)
        if (result && result.data && Array.isArray(result.data)) {
            allTours = result.data;
        } else if (Array.isArray(result)) {
            allTours = result;
        } else {
            allTours = [];
        }
        
        // Chỉ hiển thị tour đã phát hành
        allTours = allTours.filter(tour => {
            const trangThai = tour.trangThai || tour.TrangThai || '';
            return trangThai === 'Đã phát hành' || trangThai === 'Đã Phát Hành';
        });
        
        if (toursLoading) toursLoading.style.display = 'none';
        applyFilters();
    } catch (error) {
        console.error('Error loading tours:', error);
        const toursLoading = document.getElementById('tours-loading');
        const toursEmpty = document.getElementById('tours-empty');
        if (toursLoading) toursLoading.style.display = 'none';
        if (toursEmpty) {
            toursEmpty.style.display = 'block';
            toursEmpty.innerHTML = `
                <div class="empty-icon">✈️</div>
                <h3>Lỗi khi tải danh sách tour</h3>
                <p>Vui lòng thử lại sau</p>
            `;
        }
    }
}

function checkUserLogin() {
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    const authButtons = document.getElementById('auth-buttons');
    const userMenu = document.getElementById('user-menu');
    
    if (user.email && user.role === 'Khách Hàng') {
        // User đã đăng nhập
        if (authButtons) authButtons.style.display = 'none';
        if (userMenu) {
            userMenu.style.display = 'flex';
            const avatar = document.getElementById('user-avatar-menu');
            if (avatar && user.name) {
                const nameParts = user.name.split(' ');
                const initials = nameParts.length >= 2 
                    ? nameParts[0][0] + nameParts[nameParts.length - 1][0]
                    : user.name[0];
                avatar.textContent = initials.toUpperCase();
            }
        }
    } else {
        // User chưa đăng nhập
        if (authButtons) authButtons.style.display = 'flex';
        if (userMenu) userMenu.style.display = 'none';
    }
}

function logout() {
    sessionStorage.removeItem('user');
    window.location.href = 'tours.html';
}

// Load tours from API
async function loadTours() {
    try {
        const toursLoading = document.getElementById('tours-loading');
        const toursGrid = document.getElementById('tours-grid');
        const toursEmpty = document.getElementById('tours-empty');
        
        if (toursLoading) toursLoading.style.display = 'block';
        if (toursGrid) toursGrid.style.display = 'none';
        if (toursEmpty) toursEmpty.style.display = 'none';
        
        // POST /tour/user/get-all với TourUserQueryDTO
        const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.TOUR_USER_GET_ALL);
        const requestBody = {
            Keyword: '',
            SortBy: 'NgayTao',
            SortDir: 'DESC'
        };
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
            throw new Error('Không thể tải danh sách tour');
        }
        
        const result = await response.json();
        
        // Xử lý response (có thể là ApiResponse hoặc trực tiếp là array)
        if (result && result.data && Array.isArray(result.data)) {
            allTours = result.data;
        } else if (Array.isArray(result)) {
            allTours = result;
        } else {
            allTours = [];
        }
        
        // Chỉ hiển thị tour đã phát hành
        allTours = allTours.filter(tour => {
            const trangThai = tour.trangThai || tour.TrangThai || '';
            return trangThai === 'Đã phát hành' || trangThai === 'Đã Phát Hành';
        });
        
        if (toursLoading) toursLoading.style.display = 'none';
        applyFilters();
    } catch (error) {
        console.error('Error loading tours:', error);
        const toursLoading = document.getElementById('tours-loading');
        const toursEmpty = document.getElementById('tours-empty');
        if (toursLoading) toursLoading.style.display = 'none';
        if (toursEmpty) {
            toursEmpty.style.display = 'block';
            toursEmpty.innerHTML = `
                <div class="empty-icon">✈️</div>
                <h3>Lỗi khi tải danh sách tour</h3>
                <p>Vui lòng thử lại sau</p>
            `;
        }
    }
}

function applyFilters() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const regionFilter = document.getElementById('region-filter').value;
    const priceFilter = document.getElementById('price-filter').value;
    const durationFilter = document.getElementById('duration-filter').value;

    filteredTours = allTours.filter(tour => {
        // Xử lý cả camelCase và PascalCase
        const tenTour = tour.tenTour || tour.TenTour || '';
        const moTaNgan = tour.moTaNgan || tour.MoTaNgan || '';
        const khuVuc = tour.khuVuc || tour.KhuVuc || '';
        const giaTour = tour.giaTour || tour.GiaTour || tour.giaNguoiLon || tour.GiaNguoiLon || 0;
        const soNgay = tour.soNgay || tour.SoNgay || 0;
        
        // Search filter
        const matchSearch = !searchTerm || 
            tenTour.toLowerCase().includes(searchTerm) ||
            moTaNgan.toLowerCase().includes(searchTerm);
        
        // Region filter
        const matchRegion = !regionFilter || khuVuc === regionFilter;
        
        // Price filter
        let matchPrice = true;
        if (priceFilter) {
            const [min, max] = priceFilter.split('-').map(Number);
            matchPrice = giaTour >= min && giaTour <= max;
        }
        
        // Duration filter
        let matchDuration = true;
        if (durationFilter) {
            const duration = parseInt(durationFilter);
            if (duration === 1) {
                matchDuration = soNgay === 1;
            } else if (duration === 2) {
                matchDuration = soNgay === 2;
            } else if (duration === 3) {
                matchDuration = soNgay === 3;
            } else if (duration === 4) {
                matchDuration = soNgay === 4;
            } else if (duration === 5) {
                matchDuration = soNgay >= 5;
            }
        }
        
        return matchSearch && matchRegion && matchPrice && matchDuration;
    });

    currentPage = 1;
    renderTours();
}

function resetFilters() {
    document.getElementById('search-input').value = '';
    document.getElementById('region-filter').value = '';
    document.getElementById('price-filter').value = '';
    document.getElementById('duration-filter').value = '';
    applyFilters();
}

function renderTours() {
    const toursGrid = document.getElementById('tours-grid');
    const toursLoading = document.getElementById('tours-loading');
    const toursEmpty = document.getElementById('tours-empty');
    const toursCount = document.getElementById('tours-count-number');
    const pagination = document.getElementById('tours-pagination');

    // Hide all states
    if (toursGrid) toursGrid.style.display = 'none';
    if (toursLoading) toursLoading.style.display = 'none';
    if (toursEmpty) toursEmpty.style.display = 'none';
    if (pagination) pagination.style.display = 'none';

    // Show loading
    if (toursLoading) toursLoading.style.display = 'block';

    // Simulate loading delay
    setTimeout(() => {
        if (toursLoading) toursLoading.style.display = 'none';

        if (filteredTours.length === 0) {
            // Show empty state
            if (toursEmpty) toursEmpty.style.display = 'block';
            if (toursCount) toursCount.textContent = '0';
            return;
        }

        // Update count
        if (toursCount) toursCount.textContent = filteredTours.length;

        // Calculate pagination
        const totalPages = Math.ceil(filteredTours.length / toursPerPage);
        const startIndex = (currentPage - 1) * toursPerPage;
        const endIndex = startIndex + toursPerPage;
        const toursToShow = filteredTours.slice(startIndex, endIndex);

        // Render tours
        if (toursGrid) {
            toursGrid.innerHTML = '';
            toursGrid.style.display = 'grid';

            toursToShow.forEach(tour => {
                const tourCard = createTourCard(tour);
                toursGrid.appendChild(tourCard);
            });
        }

        // Show pagination if needed
        if (totalPages > 1 && pagination) {
            pagination.style.display = 'flex';
            document.getElementById('current-page').textContent = currentPage;
            document.getElementById('total-pages').textContent = totalPages;
            
            const prevBtn = document.getElementById('prev-page');
            const nextBtn = document.getElementById('next-page');
            if (prevBtn) prevBtn.disabled = currentPage === 1;
            if (nextBtn) nextBtn.disabled = currentPage === totalPages;
        }
    }, 300);
}

function createTourCard(tour) {
    const card = document.createElement('article');
    card.className = 'tour-card';

    // Xử lý cả camelCase và PascalCase
    const tourId = tour.tourId || tour.TourId || '';
    const tenTour = tour.tenTour || tour.TenTour || '';
    const moTaNgan = tour.moTaNgan || tour.MoTaNgan || '';
    const soNgay = tour.soNgay || tour.SoNgay || 0;
    const thoiGianBatDau = tour.thoiGian_BatDau || tour.ThoiGian_BatDau || tour.thoiGianBatDau || tour.ThoiGianBatDau || '';
    const khuVuc = tour.khuVuc || tour.KhuVuc || '';
    const giaTour = tour.giaTour || tour.GiaTour || tour.giaNguoiLon || tour.GiaNguoiLon || 0;
    const hinhAnh = tour.hinhAnh || tour.HinhAnh || tour.anhDaiDien || tour.AnhDaiDien || 'https://via.placeholder.com/800x600';
    
    const badge = tour.badge 
        ? `<span class="tour-card-badge ${tour.badge}">${tour.badge === 'popular' ? 'Phổ biến' : 'Mới'}</span>`
        : '';

    const durationText = soNgay === 1 
        ? '1 ngày' 
        : `${soNgay} ngày ${soNgay - 1} đêm`;

    card.innerHTML = `
        <div class="tour-card-image">
            <img src="${hinhAnh}" alt="${tenTour}" loading="lazy">
            ${badge}
        </div>
        <div class="tour-card-content">
            <div class="tour-card-meta">
                <span class="tour-card-type">${khuVuc}</span>
                <span class="tour-card-status">Sẵn sàng</span>
            </div>
            <h3 class="tour-card-title">${tenTour}</h3>
            <p class="tour-card-description">${moTaNgan}</p>
            <div class="tour-card-info">
                <div class="tour-card-info-item">
                    <span>📅</span>
                    <span>Khởi hành: ${formatDate(thoiGianBatDau)}</span>
                </div>
                <div class="tour-card-info-item">
                    <span>📍</span>
                    <span>Khu vực: ${khuVuc}</span>
                </div>
            </div>
            <div class="tour-card-footer">
                <div class="tour-card-pricing">
                    <span class="tour-card-price">${formatCurrency(giaTour)}</span>
                    <span class="tour-card-duration">${durationText}</span>
                </div>
                <a href="detail-tour.html?tourId=${tourId}" class="tour-card-btn">Xem chi tiết</a>
            </div>
        </div>
    `;

    return card;
}

function changePage(direction) {
    const totalPages = Math.ceil(filteredTours.length / toursPerPage);
    const newPage = currentPage + direction;
    
    if (newPage >= 1 && newPage <= totalPages) {
        currentPage = newPage;
        renderTours();
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
}

