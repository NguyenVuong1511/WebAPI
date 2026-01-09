// Index Page JavaScript - Load data from API
let allTours = [];
let allDestinations = [];
let allFeedbacks = [];

document.addEventListener('DOMContentLoaded', function() {
    checkUserLogin();
    loadFeaturedTours(); // Load tour nổi bật từ API
    loadDestinations();
    loadTestimonials();
    setupCarousel();
});

// Check if user is logged in
function checkUserLogin() {
    try {
        const user = AuthHelper.getUser();
        const authButtons = document.querySelector('.auth-buttons');
        const userMenu = document.getElementById('user-menu');
        
        if (user && user.email && user.role === 'Khách Hàng') {
            // User is logged in
            if (authButtons) authButtons.style.display = 'none';
            
            // Show user menu if exists
            if (userMenu) {
                userMenu.style.display = 'flex';
                const avatar = document.getElementById('user-avatar-menu');
                if (avatar) {
                    avatar.textContent = getInitials(user);
                }
            }
        } else {
            // User not logged in
            if (authButtons) authButtons.style.display = 'flex';
            if (userMenu) userMenu.style.display = 'none';
        }
    } catch (error) {
        console.error('Error checking user login:', error);
    }
}

function getInitials(user) {
    const name = user.hoTen || user.name || '';
    if (!name) return 'KH';
    const parts = name.split(' ');
    if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
}

function logout() {
    if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
        AuthHelper.logout();
        window.location.reload();
    }
}

// Load featured tours - Load từ API
async function loadFeaturedTours() {
    try {
        const toursContainer = document.querySelector('.tours-carousel-track') || document.getElementById('featured-tours-track');
        if (!toursContainer) return;
        
        // Load tours from API
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
        let tours = [];
        
        if (result && result.data && Array.isArray(result.data)) {
            tours = result.data;
        } else if (Array.isArray(result)) {
            tours = result;
        }
        
        // Filter only published tours
        tours = tours.filter(t => (t.TrangThai || t.trangThai) === 'Đã phát hành');
        
        // Sort by date and take top 8
        tours = tours.sort((a, b) => {
            const dateA = new Date(a.NgayTao || a.ngayTao || 0);
            const dateB = new Date(b.NgayTao || b.ngayTao || 0);
            return dateB - dateA;
        }).slice(0, 8);
        
        // Load images for each tour
        const toursWithImages = await Promise.all(tours.map(async (tour) => {
            const tourId = tour.TourId || tour.tourId;
            if (!tourId) return null;
            
            try {
                const anhTourUrl = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.ANHTOUR_GET_BY_TOUR) + `/${tourId}`;
                const anhResponse = await fetch(anhTourUrl, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                
                if (anhResponse.ok) {
                    const anhResult = await anhResponse.json();
                    let anhTours = [];
                    
                    if (anhResult && anhResult.data && Array.isArray(anhResult.data)) {
                        anhTours = anhResult.data;
                    } else if (Array.isArray(anhResult)) {
                        anhTours = anhResult;
                    }
                    
                    if (anhTours.length > 0) {
                        // AnhTourDTO có LinkAnh và IsAvatar
                        const anhDaiDien = anhTours.find(a => a.isAvatar || a.IsAvatar) || anhTours[0];
                        tour.hinhAnh = anhDaiDien.linkAnh || anhDaiDien.LinkAnh || '';
                    }
                }
            } catch (e) {
                console.log(`Could not load images for tour ${tourId}:`, e);
            }
            
            return tour;
        }));
        
        const validTours = toursWithImages.filter(t => t !== null);
        
        // Store tours for later use
        allTours = validTours;
        
        // Render tours
        renderTours(validTours, toursContainer);
        
        // Update hero section with first tour
        if (validTours.length > 0) {
            updateHeroSection(validTours[0]);
        }
        
    } catch (error) {
        console.error('Error loading featured tours:', error);
        const toursContainer = document.getElementById('featured-tours-track');
        if (toursContainer) {
            toursContainer.innerHTML = '<div class="error-state">Lỗi khi tải danh sách tour</div>';
        }
    }
}

// Old mock data (removed - now using API)
// Commented out - now loading from API
/*
        const featuredTours = [
            {
                TourId: '21214074-E7AA-43E3-8FE2-E3F33A8089F6',
                TenTour: 'Vịnh Hạ Long - Kỳ Quan Thiên Nhiên',
                MoTaNgan: 'Khám phá vẻ đẹp hùng vĩ của vịnh Hạ Long với hàng nghìn đảo đá vôi độc đáo. Trải nghiệm du thuyền sang trọng và tham quan các hang động kỳ bí.',
                GiaNguoiLon: 2500000,
                GiaTreEm: 1500000,
                ThoiGianKhoiHanh: '2025-01-15',
                TrangThai: 'Đã phát hành',
                NgayTao: '2024-12-01T00:00:00',
                // Field bổ sung để hiển thị
                hinhAnh: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
                soNgay: 3,
                khuVuc: 'Miền Bắc',
                badge: 'Phổ biến'
            },
            {
                TourId: '3A5B895A-3411-4F01-AABC-1D6C6D4DF3D1',
                TenTour: 'Sapa - Núi Rừng Tây Bắc',
                MoTaNgan: 'Trải nghiệm văn hóa dân tộc và cảnh quan núi rừng tuyệt đẹp tại Sapa. Tham quan Fansipan, làng Cát Cát và thưởng thức ẩm thực địa phương.',
                GiaNguoiLon: 3200000,
                GiaTreEm: 2000000,
                ThoiGianKhoiHanh: '2025-02-20',
                TrangThai: 'Đã phát hành',
                NgayTao: '2024-12-15T00:00:00',
                hinhAnh: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
                soNgay: 4,
                khuVuc: 'Miền Bắc',
                badge: 'Mới'
            },
            {
                TourId: '586CCD5A-1069-426C-9F41-E065B604AB4E',
                TenTour: 'Phú Quốc - Thiên Đường Biển Đảo',
                MoTaNgan: 'Thư giãn tại những bãi biển tuyệt đẹp và khám phá văn hóa địa phương. Trải nghiệm lặn biển, tham quan nhà tù Phú Quốc và thưởng thức hải sản tươi ngon.',
                GiaNguoiLon: 4500000,
                GiaTreEm: 2800000,
                ThoiGianKhoiHanh: '2025-02-15',
                TrangThai: 'Đã phát hành',
                NgayTao: '2024-11-20T00:00:00',
                hinhAnh: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
                soNgay: 5,
                khuVuc: 'Miền Nam',
                badge: 'Yêu thích'
            },
            {
                TourId: '31FEDE4C-F72A-46E4-860C-13B37F21AF88',
                TenTour: 'Hội An - Phố Cổ Di Sản',
                MoTaNgan: 'Khám phá phố cổ Hội An với kiến trúc cổ kính và ẩm thực đặc sắc. Tham quan chùa Cầu, làng gốm Thanh Hà và thưởng thức cao lầu.',
                GiaNguoiLon: 2800000,
                GiaTreEm: 1800000,
                ThoiGianKhoiHanh: '2025-02-10',
                TrangThai: 'Đã phát hành',
                NgayTao: '2024-11-15T00:00:00',
                hinhAnh: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
                soNgay: 3,
                khuVuc: 'Miền Trung',
                badge: 'Đặc biệt'
            },
            {
                TourId: '3B77F08D-D653-4687-8F88-EE6C3ABDB691',
                TenTour: 'Đà Lạt - Thành Phố Ngàn Hoa',
                MoTaNgan: 'Khám phá thành phố mộng mơ với khí hậu mát mẻ quanh năm. Tham quan thác Datanla, hồ Xuân Hương và thưởng thức cà phê đặc sản.',
                GiaNguoiLon: 2200000,
                GiaTreEm: 1400000,
                ThoiGianKhoiHanh: '2025-01-25',
                TrangThai: 'Đã phát hành',
                NgayTao: '2024-11-10T00:00:00',
                hinhAnh: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
                soNgay: 3,
                khuVuc: 'Miền Nam',
                badge: 'Phổ biến'
            },
            {
                TourId: 'A1B2C3D4-E5F6-7890-ABCD-EF1234567890',
                TenTour: 'Nha Trang - Biển Xanh Cát Trắng',
                MoTaNgan: 'Tận hưởng kỳ nghỉ biển tuyệt vời với các hoạt động thể thao dưới nước. Tham quan Vinpearl, tháp Bà Ponagar và thưởng thức hải sản tươi sống.',
                GiaNguoiLon: 3500000,
                GiaTreEm: 2200000,
                ThoiGianKhoiHanh: '2025-02-25',
                TrangThai: 'Đã phát hành',
                NgayTao: '2024-10-25T00:00:00',
                hinhAnh: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
                soNgay: 4,
                khuVuc: 'Miền Trung',
                badge: 'Yêu thích'
            },
            {
                TourId: 'B2C3D4E5-F6A7-8901-BCDE-F23456789012',
                TenTour: 'Huế - Cố Đô Lịch Sử',
                MoTaNgan: 'Khám phá di sản văn hóa thế giới với Đại Nội, lăng tẩm các vua và sông Hương thơ mộng. Trải nghiệm ẩm thực cung đình độc đáo.',
                GiaNguoiLon: 2600000,
                GiaTreEm: 1600000,
                ThoiGianKhoiHanh: '2025-02-18',
                TrangThai: 'Đã phát hành',
                NgayTao: '2024-12-10T00:00:00',
                hinhAnh: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
                soNgay: 3,
                khuVuc: 'Miền Trung',
                badge: 'Mới'
            },
            {
                TourId: 'C3D4E5F6-A7B8-9012-CDEF-345678901234',
                TenTour: 'Mũi Né - Sa Mạc Việt Nam',
                MoTaNgan: 'Trải nghiệm độc đáo với đồi cát bay, tham quan làng chài và thưởng thức hải sản tươi ngon. Hoạt động lướt ván và chèo thuyền kayak.',
                GiaNguoiLon: 2300000,
                GiaTreEm: 1500000,
                ThoiGianKhoiHanh: '2025-02-22',
                TrangThai: 'Đã phát hành',
                NgayTao: '2024-10-15T00:00:00',
                hinhAnh: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
                soNgay: 3,
                khuVuc: 'Miền Nam',
                badge: 'Đặc biệt'
            }
        ];
        
        // Store tours for later use
        allTours = featuredTours;
        
        // Render tours
        renderTours(featuredTours, toursContainer);
        
        // Update hero section with first tour
        updateHeroSection(featuredTours[0]);
        
    } catch (error) {
        console.error('Error loading featured tours:', error);
        const toursContainer = document.querySelector('.tours-carousel-track');
        if (toursContainer) {
            toursContainer.innerHTML = '<div class="error-state">Lỗi khi tải danh sách tour</div>';
        }
    }
}
*/

// Render tours
function renderTours(tours, container) {
    container.innerHTML = '';
    
    tours.forEach(tour => {
        const tourCard = createTourCard(tour);
        container.appendChild(tourCard);
    });
}

// Create tour card element - Bám sát cấu trúc TourDTO từ API
function createTourCard(tour) {
    const article = document.createElement('article');
    article.className = 'tour-card';
    
    // Extract data từ TourDTO (PascalCase) - bám sát API
    const tourId = tour.TourId || tour.tourId || '';
    const tenTour = tour.TenTour || tour.tenTour || '';
    const moTaNgan = tour.MoTaNgan || tour.moTaNgan || '';
    const giaNguoiLon = tour.GiaNguoiLon || tour.giaNguoiLon || 0;
    const giaTreEm = tour.GiaTreEm || tour.giaTreEm || 0;
    const thoiGianKhoiHanh = tour.ThoiGianKhoiHanh || tour.thoiGianKhoiHanh || '';
    const trangThai = tour.TrangThai || tour.trangThai || '';
    const ngayTao = tour.NgayTao || tour.ngayTao || new Date();
    
    // Field bổ sung để hiển thị (có thể lấy từ AnhTour, LichTrinh API)
    const soNgay = tour.soNgay || tour.SoNgay || 0;
    const khuVuc = tour.khuVuc || tour.KhuVuc || '';
    const hinhAnh = tour.hinhAnh || tour.HinhAnh || tour.anhDaiDien || tour.AnhDaiDien || 'https://via.placeholder.com/800x600';
    const badgeText = tour.badge || '';
    
    // Tính số ngày từ duration text nếu có
    let durationText = '';
    if (soNgay > 0) {
        durationText = soNgay === 1 ? '1 ngày' : `${soNgay} ngày ${soNgay - 1} đêm`;
    } else {
        durationText = 'Liên hệ';
    }
    
    // Badge mapping
    let badge = '';
    if (badgeText) {
        const badgeMap = {
            'Phổ biến': 'Phổ biến',
            'Mới': 'Mới',
            'Yêu thích': 'Yêu thích',
            'Đặc biệt': 'Đặc biệt'
        };
        const badgeLabel = badgeMap[badgeText] || badgeText;
        badge = `<span class="tour-badge">${badgeLabel}</span>`;
    }
    
    // Format thời gian khởi hành
    let thoiGianDisplay = 'Sắp có';
    if (thoiGianKhoiHanh) {
        // ThoiGianKhoiHanh có thể là string hoặc date
        try {
            const date = new Date(thoiGianKhoiHanh);
            if (!isNaN(date.getTime())) {
                thoiGianDisplay = formatDate(date);
            } else {
                thoiGianDisplay = thoiGianKhoiHanh; // Giữ nguyên nếu là string
            }
        } catch (e) {
            thoiGianDisplay = thoiGianKhoiHanh;
        }
    }
    
    article.innerHTML = `
        <div class="tour-image">
            <img src="${hinhAnh}" alt="${escapeHtml(tenTour)}" loading="lazy">
            ${badge}
        </div>
        <div class="tour-content">
            <div class="tour-meta">
                <span class="tour-type">${escapeHtml(khuVuc || 'Tour Trong Nước')}</span>
                <span class="tour-status">${trangThai === 'Đã phát hành' ? 'Sẵn sàng' : trangThai || 'Sẵn sàng'}</span>
            </div>
            <h3 class="tour-title">${escapeHtml(tenTour)}</h3>
            <p class="tour-description">${escapeHtml(moTaNgan || 'Khám phá hành trình tuyệt vời')}</p>
            <div class="tour-info">
                <div class="tour-date">
                    <span class="tour-date-label">Khởi hành:</span>
                    <span class="tour-date-value">${thoiGianDisplay}</span>
                </div>
                <div class="tour-destinations">
                    <span class="tour-destinations-label">Khu vực:</span>
                    <span class="tour-destinations-value">${escapeHtml(khuVuc || 'N/A')}</span>
                </div>
            </div>
            <div class="tour-footer">
                <div class="tour-pricing">
                    <span class="tour-price">${formatCurrency(giaNguoiLon)}</span>
                    <span class="tour-duration">${durationText}</span>
                </div>
                <a href="detail-tour.html?tourId=${tourId}" class="tour-btn">Xem chi tiết</a>
            </div>
        </div>
    `;
    
    return article;
}

// Update hero section with featured tour - Bám sát TourDTO
function updateHeroSection(tour) {
    if (!tour) return;
    
    const tenTour = tour.TenTour || tour.tenTour || 'Khám Phá Vẻ Đẹp Việt Nam';
    const moTaNgan = tour.MoTaNgan || tour.moTaNgan || 'Trải nghiệm những hành trình tuyệt vời';
    const hinhAnh = tour.hinhAnh || tour.HinhAnh || tour.anhDaiDien || tour.AnhDaiDien || '';
    
    // Update hero background if image exists
    if (hinhAnh) {
        const hero = document.querySelector('.hero');
        if (hero) {
            hero.style.backgroundImage = `url(${hinhAnh})`;
        }
    }
    
    // Optionally update hero text
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle && tenTour) {
        heroTitle.textContent = tenTour;
    }
    
    const heroSubtitle = document.querySelector('.hero-subtitle');
    if (heroSubtitle && moTaNgan) {
        heroSubtitle.textContent = moTaNgan;
    }
}

// Load destinations (from tours or separate API)
async function loadDestinations() {
    try {
        const container = document.getElementById('destinations-container');
        const loading = document.getElementById('destinations-loading');
        const error = document.getElementById('destinations-error');
        const empty = document.getElementById('destinations-empty');
        
        if (!container) return;
        
        // Show loading
        if (loading) loading.style.display = 'block';
        if (error) error.style.display = 'none';
        if (empty) empty.style.display = 'none';
        container.innerHTML = '';
        
        // Try to load from DiaDiem API if available
        // Otherwise, extract from tours
        try {
            const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.DIADIEM_GET_ALL);
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const result = await response.json();
                let destinations = [];
                
                if (result && result.data && Array.isArray(result.data)) {
                    destinations = result.data;
                } else if (Array.isArray(result)) {
                    destinations = result;
                }
                
                if (destinations.length > 0) {
                    renderDestinations(destinations.slice(0, 6), container);
                    if (loading) loading.style.display = 'none';
                    return;
                }
            }
        } catch (e) {
            console.log('DiaDiem API not available, using tours data');
        }
        
        // Fallback: Extract destinations from mock tours
        if (allTours.length === 0) {
            await loadFeaturedTours();
        }
        
        // Extract unique khuVuc from tours (mock data) - bám sát TourDTO
        const uniqueKhuVuc = [...new Set(allTours.map(t => t.khuVuc || t.KhuVuc).filter(Boolean))];
        
        if (uniqueKhuVuc.length === 0) {
            // Use default destinations if no tours
            const defaultDestinations = [
                { tenDiaDiem: 'Miền Bắc', moTa: 'Khám phá vẻ đẹp miền Bắc với Hạ Long, Sapa' },
                { tenDiaDiem: 'Miền Trung', moTa: 'Trải nghiệm di sản văn hóa tại Huế, Hội An' },
                { tenDiaDiem: 'Miền Nam', moTa: 'Thư giãn tại các bãi biển tuyệt đẹp' }
            ];
            renderDestinations(defaultDestinations, container);
            if (loading) loading.style.display = 'none';
            return;
        }
        
        // Create destination cards from khuVuc
        const destinations = uniqueKhuVuc.slice(0, 6).map(khuVuc => ({
            tenDiaDiem: khuVuc,
            moTa: `Khám phá ${khuVuc} với những tour tuyệt vời`
        }));
        
        renderDestinations(destinations, container);
        if (loading) loading.style.display = 'none';
        
    } catch (error) {
        console.error('Error loading destinations:', error);
        const loading = document.getElementById('destinations-loading');
        const errorDiv = document.getElementById('destinations-error');
        if (loading) loading.style.display = 'none';
        if (errorDiv) errorDiv.style.display = 'block';
    }
}

// Render destinations
function renderDestinations(destinations, container) {
    container.innerHTML = '';
    
    destinations.forEach(dest => {
        const card = document.createElement('div');
        card.className = 'destination-card';
        
        const tenDiaDiem = dest.tenDiaDiem || dest.TenDiaDiem || dest.tenDiaDiem || '';
        const moTa = dest.moTa || dest.MoTa || '';
        const hinhAnh = dest.hinhAnh || dest.HinhAnh || 'https://via.placeholder.com/400x300';
        
        card.innerHTML = `
            <div class="destination-image">
                <img src="${hinhAnh}" alt="${escapeHtml(tenDiaDiem)}" loading="lazy">
            </div>
            <div class="destination-content">
                <h3 class="destination-name">${escapeHtml(tenDiaDiem)}</h3>
                ${moTa ? `<p class="destination-description">${escapeHtml(moTa)}</p>` : ''}
            </div>
        `;
        
        container.appendChild(card);
    });
}

// Load testimonials (feedbacks) from API
async function loadTestimonials() {
    try {
        const container = document.getElementById('testimonials-container');
        const loading = document.getElementById('testimonials-loading');
        const error = document.getElementById('testimonials-error');
        const empty = document.getElementById('testimonials-empty');
        
        if (!container) return;
        
        // Show loading
        if (loading) loading.style.display = 'block';
        if (error) error.style.display = 'none';
        if (empty) empty.style.display = 'none';
        container.innerHTML = '';
        
        // Try to load feedbacks from API (using real tour IDs from database)
        // Since we're using mock data for featured tours, we'll try to load feedbacks
        // from actual tours in the database
        try {
            // Try to get real tours from API to load feedbacks
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
            
            if (response.ok) {
                const result = await response.json();
                let realTours = [];
                
                if (result && result.data && Array.isArray(result.data)) {
                    realTours = result.data;
                } else if (Array.isArray(result)) {
                    realTours = result;
                }
                
                // Filter published tours
                realTours = realTours.filter(tour => {
                    const trangThai = tour.trangThai || tour.TrangThai || '';
                    return trangThai === 'Đã phát hành' || trangThai === 'Đã Phát Hành';
                });
                
                // Get feedbacks from real tours (limit to 3 tours to avoid too many requests)
                const feedbackPromises = realTours.slice(0, 3).map(async (tour) => {
                    const tourId = tour.tourId || tour.TourId;
                    if (!tourId) return [];
                    
                    try {
                        const feedbackUrl = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.FEEDBACK_GET_BY_TOUR) + `/${tourId}`;
                        const feedbackResponse = await fetch(feedbackUrl, {
                            method: 'GET',
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        });
                        
                        if (feedbackResponse.ok) {
                            const feedbackResult = await feedbackResponse.json();
                            let feedbacks = [];
                            
                            if (feedbackResult && feedbackResult.data && Array.isArray(feedbackResult.data)) {
                                feedbacks = feedbackResult.data;
                            } else if (Array.isArray(feedbackResult)) {
                                feedbacks = feedbackResult;
                            }
                            
                            return feedbacks.map(fb => ({
                                ...fb,
                                tourName: tour.tenTour || tour.TenTour || ''
                            }));
                        }
                    } catch (e) {
                        console.error(`Error loading feedback for tour ${tourId}:`, e);
                    }
                    
                    return [];
                });
                
                const feedbackArrays = await Promise.all(feedbackPromises);
                allFeedbacks = feedbackArrays.flat();
                
                // Sort by date (newest first) and take top 6
                allFeedbacks.sort((a, b) => {
                    const dateA = new Date(a.ngayDanhGia || a.NgayDanhGia || 0);
                    const dateB = new Date(b.ngayDanhGia || b.NgayDanhGia || 0);
                    return dateB - dateA;
                });
                
                const topFeedbacks = allFeedbacks.slice(0, 6);
                
                if (topFeedbacks.length > 0) {
                    renderTestimonials(topFeedbacks, container);
                    if (loading) loading.style.display = 'none';
                    return;
                }
            }
        } catch (e) {
            console.error('Error loading real tours for feedbacks:', e);
        }
        
        // If no feedbacks from API, show empty state
        if (loading) loading.style.display = 'none';
        if (empty) empty.style.display = 'block';
        
    } catch (error) {
        console.error('Error loading testimonials:', error);
        const loading = document.getElementById('testimonials-loading');
        const errorDiv = document.getElementById('testimonials-error');
        if (loading) loading.style.display = 'none';
        if (errorDiv) errorDiv.style.display = 'block';
    }
}

// Render testimonials
function renderTestimonials(feedbacks, container) {
    container.innerHTML = '';
    
    feedbacks.forEach(feedback => {
        const card = document.createElement('div');
        card.className = 'testimonial-card';
        
        const tenNguoiDung = feedback.tenNguoiDung || feedback.TenNguoiDung || 'Khách hàng';
        const soSao = feedback.soSao || feedback.SoSao || 5;
        const binhLuan = feedback.binhLuan || feedback.BinhLuan || '';
        const ngayDanhGia = feedback.ngayDanhGia || feedback.NgayDanhGia || new Date();
        const tourName = feedback.tourName || '';
        
        const stars = '⭐'.repeat(soSao);
        
        card.innerHTML = `
            <div class="testimonial-rating">${stars}</div>
            <p class="testimonial-text">${escapeHtml(binhLuan)}</p>
            <div class="testimonial-author">
                <div class="testimonial-author-name">${escapeHtml(tenNguoiDung)}</div>
                ${tourName ? `<div class="testimonial-tour">Tour: ${escapeHtml(tourName)}</div>` : ''}
                <div class="testimonial-date">${formatDate(ngayDanhGia)}</div>
            </div>
        `;
        
        container.appendChild(card);
    });
}

// Setup carousel
function setupCarousel() {
    const carousel = document.querySelector('.tours-carousel');
    const track = document.querySelector('.tours-carousel-track');
    const prevBtn = document.querySelector('.carousel-btn-prev');
    const nextBtn = document.querySelector('.carousel-btn-next');
    
    if (!carousel || !track) return;
    
    let currentIndex = 0;
    const cards = track.querySelectorAll('.tour-card');
    if (cards.length === 0) return;
    
    const cardWidth = cards[0].offsetWidth + 24; // card width + gap
    const visibleCards = Math.floor(carousel.offsetWidth / cardWidth);
    const maxIndex = Math.max(0, cards.length - visibleCards);
    
    function updateCarousel() {
        track.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
        
        if (prevBtn) prevBtn.disabled = currentIndex === 0;
        if (nextBtn) nextBtn.disabled = currentIndex >= maxIndex;
    }
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentIndex > 0) {
                currentIndex--;
                updateCarousel();
            }
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (currentIndex < maxIndex) {
                currentIndex++;
                updateCarousel();
            }
        });
    }
    
    updateCarousel();
}

// Utility functions
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateString) {
    if (!dateString) return 'Sắp có';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
    } catch (e) {
        return 'Sắp có';
    }
}

function formatCurrency(amount) {
    if (!amount && amount !== 0) return 'Liên hệ';
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
}
