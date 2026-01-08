// Tours List Page JavaScript - Kết nối với API
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

function checkUserLogin() {
    const user = AuthHelper.getUser();
    const authButtons = document.getElementById('auth-buttons');
    const userMenu = document.getElementById('user-menu');
    
    if (user && user.email) {
        // User đã đăng nhập
        if (authButtons) authButtons.style.display = 'none';
        if (userMenu) {
            userMenu.style.display = 'flex';
            const avatar = document.getElementById('user-avatar-menu');
            if (avatar && user.hoTen) {
                avatar.textContent = FormatHelper.getInitials(user.hoTen).toUpperCase();
            }
        }
    } else {
        // User chưa đăng nhập
        if (authButtons) authButtons.style.display = 'flex';
        if (userMenu) userMenu.style.display = 'none';
    }
}

function logout() {
    AuthHelper.logout();
    window.location.href = 'tours.html';
}

async function loadTours() {
    try {
        // Lấy filter values
        const keyword = document.getElementById('search-input')?.value || '';
        const sortBy = 'NgayTao'; // Mặc định
        const sortDir = 'desc';
        
        // Gọi API User Get All Tours
        const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.TOUR_USER_GET_ALL);
        const response = await APIHelper.post(url, {
            keyword: keyword,
            sortBy: sortBy,
            sortDir: sortDir
        });

        if (response.success && response.data) {
            allTours = response.data.map(tour => ({
                tourId: tour.tourId || tour.TourId,
                tenTour: tour.tenTour || tour.TenTour,
                moTaNgan: tour.moTaNgan || tour.MoTaNgan,
                giaNguoiLon: tour.giaNguoiLon || tour.GiaNguoiLon || 0,
                giaTreEm: tour.giaTreEm || tour.GiaTreEm || 0,
                thoiGianKhoiHanh: tour.thoiGianKhoiHanh || tour.ThoiGianKhoiHanh,
                trangThai: tour.trangThai || tour.TrangThai,
                ngayTao: tour.ngayTao || tour.NgayTao,
                // Default image nếu không có
                hinhAnh: tour.anhDaiDien || tour.AnhDaiDien || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800'
            }));
            
            applyFilters();
        } else {
            console.error('Failed to load tours:', response.message);
            allTours = [];
            renderTours();
        }
    } catch (error) {
        console.error('Error loading tours:', error);
        allTours = [];
        renderTours();
        // Không hiển thị alert để tránh làm phiền user
    }
}

function applyFilters() {
    const searchTerm = (document.getElementById('search-input')?.value || '').toLowerCase();
    const priceFilter = document.getElementById('price-filter')?.value || '';

    filteredTours = allTours.filter(tour => {
        // Search filter
        const matchSearch = !searchTerm || 
            tour.tenTour.toLowerCase().includes(searchTerm) ||
            (tour.moTaNgan && tour.moTaNgan.toLowerCase().includes(searchTerm));
        
        // Price filter
        let matchPrice = true;
        if (priceFilter) {
            const [min, max] = priceFilter.split('-').map(Number);
            const price = tour.giaNguoiLon;
            if (max) {
                matchPrice = price >= min && price <= max;
            } else {
                matchPrice = price >= min; // Trường hợp "5000000-" (trên 5tr)
            }
        }
        
        return matchSearch && matchPrice;
    });

    currentPage = 1;
    renderTours();
}

function resetFilters() {
    if (document.getElementById('search-input')) document.getElementById('search-input').value = '';
    if (document.getElementById('price-filter')) document.getElementById('price-filter').value = '';
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
            if (document.getElementById('current-page')) {
                document.getElementById('current-page').textContent = currentPage;
            }
            if (document.getElementById('total-pages')) {
                document.getElementById('total-pages').textContent = totalPages;
            }
            
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

    card.innerHTML = `
        <div class="tour-card-image">
            <img src="${tour.hinhAnh}" alt="${tour.tenTour}" loading="lazy">
        </div>
        <div class="tour-card-content">
            <div class="tour-card-meta">
                <span class="tour-card-type">Tour</span>
                <span class="tour-card-status">${tour.trangThai || 'Sẵn sàng'}</span>
            </div>
            <h3 class="tour-card-title">${tour.tenTour}</h3>
            <p class="tour-card-description">${tour.moTaNgan || ''}</p>
            <div class="tour-card-info">
                <div class="tour-card-info-item">
                    <span>📅</span>
                    <span>Khởi hành: ${tour.thoiGianKhoiHanh || 'Liên hệ'}</span>
                </div>
            </div>
            <div class="tour-card-footer">
                <div class="tour-card-pricing">
                    <span class="tour-card-price">${FormatHelper.currency(tour.giaNguoiLon)}</span>
                    <span class="tour-card-duration">/ người lớn</span>
                </div>
                <a href="detail-tour.html?tourId=${tour.tourId}" class="tour-card-btn">Xem chi tiết</a>
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
