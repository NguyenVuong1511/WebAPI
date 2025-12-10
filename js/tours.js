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

function loadTours() {
    // Mock data - Tours từ database
    allTours = [
        {
            tourId: '21214074-E7AA-43E3-8FE2-E3F33A8089F6',
            tenTour: 'Tour Miền Bắc: Hà Nội - Hạ Long - Sa Pa',
            moTaNgan: 'Khám phá vẻ đẹp kỳ vĩ của Vịnh Hạ Long và nét văn hóa độc đáo tại Sa Pa.',
            soNgay: 5,
            thoiGian_BatDau: '2025-01-15',
            thoiGian_KetThuc: '2025-01-19',
            khuVuc: 'Miền Bắc',
            giaTour: 2500000,
            hinhAnh: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
            trangThai: 'Đã phát hành',
            badge: 'popular'
        },
        {
            tourId: '3A5B895A-3411-4F01-AABC-1D6C6D4DF3D1',
            tenTour: 'Tour Di sản Miền Trung: Đà Nẵng - Hội An - Huế',
            moTaNgan: 'Hành trình khám phá 3 Di sản Văn hóa Thế giới tại Miền Trung.',
            soNgay: 4,
            thoiGian_BatDau: '2025-02-20',
            thoiGian_KetThuc: '2025-02-23',
            khuVuc: 'Miền Trung',
            giaTour: 3200000,
            hinhAnh: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
            trangThai: 'Đã phát hành',
            badge: 'new'
        },
        {
            tourId: '586CCD5A-1069-426C-9F41-E065B604AB4E',
            tenTour: 'Tour Đà Lạt: Thành phố Ngàn Hoa',
            moTaNgan: 'Khám phá thành phố mộng mơ với khí hậu mát mẻ và cảnh quan tuyệt đẹp.',
            soNgay: 3,
            thoiGian_BatDau: '2025-01-25',
            thoiGian_KetThuc: '2025-01-27',
            khuVuc: 'Miền Nam',
            giaTour: 1800000,
            hinhAnh: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
            trangThai: 'Đã phát hành',
            badge: null
        },
        {
            tourId: '31FEDE4C-F72A-46E4-860C-13B37F21AF88',
            tenTour: 'Tour TP.HCM - Miền Tây Sông Nước',
            moTaNgan: 'Trải nghiệm văn hóa miền Tây với chợ nổi, vườn trái cây và ẩm thực đặc sắc.',
            soNgay: 2,
            thoiGian_BatDau: '2025-02-10',
            thoiGian_KetThuc: '2025-02-11',
            khuVuc: 'Miền Nam',
            giaTour: 1500000,
            hinhAnh: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
            trangThai: 'Đã phát hành',
            badge: null
        },
        {
            tourId: '3B77F08D-D653-4687-8F88-EE6C3ABDB691',
            tenTour: 'Tour Côn Đảo Hồi Tưởng',
            moTaNgan: 'Hành trình về nguồn tại Côn Đảo - nơi lưu giữ lịch sử và thiên nhiên hoang sơ.',
            soNgay: 4,
            thoiGian_BatDau: '2025-03-01',
            thoiGian_KetThuc: '2025-03-04',
            khuVuc: 'Miền Nam',
            giaTour: 4500000,
            hinhAnh: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
            trangThai: 'Đã phát hành',
            badge: null
        },
        {
            tourId: 'A1B2C3D4-E5F6-7890-ABCD-EF1234567890',
            tenTour: 'Tour Phú Quốc: Đảo Ngọc',
            moTaNgan: 'Thư giãn tại đảo ngọc với bãi biển trong xanh và resort sang trọng.',
            soNgay: 3,
            thoiGian_BatDau: '2025-02-15',
            thoiGian_KetThuc: '2025-02-17',
            khuVuc: 'Miền Nam',
            giaTour: 3500000,
            hinhAnh: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
            trangThai: 'Đã phát hành',
            badge: 'popular'
        },
        {
            tourId: 'B2C3D4E5-F6A7-8901-BCDE-F23456789012',
            tenTour: 'Tour Nha Trang: Thành phố Biển',
            moTaNgan: 'Khám phá thành phố biển xinh đẹp với nhiều hoạt động thú vị.',
            soNgay: 3,
            thoiGian_BatDau: '2025-02-25',
            thoiGian_KetThuc: '2025-02-27',
            khuVuc: 'Miền Trung',
            giaTour: 2200000,
            hinhAnh: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
            trangThai: 'Đã phát hành',
            badge: null
        },
        {
            tourId: 'C3D4E5F6-A7B8-9012-CDEF-345678901234',
            tenTour: 'Tour Mù Cang Chải: Mùa Vàng',
            moTaNgan: 'Ngắm ruộng bậc thang vàng óng trong mùa lúa chín tại Mù Cang Chải.',
            soNgay: 2,
            thoiGian_BatDau: '2025-09-15',
            thoiGian_KetThuc: '2025-09-16',
            khuVuc: 'Miền Bắc',
            giaTour: 1200000,
            hinhAnh: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
            trangThai: 'Đã phát hành',
            badge: 'new'
        },
        {
            tourId: 'D4E5F6A7-B8C9-0123-DEF4-456789012345',
            tenTour: 'Tour Hà Giang: Cực Bắc Tổ Quốc',
            moTaNgan: 'Chinh phục cung đường đèo đẹp nhất Việt Nam và khám phá văn hóa dân tộc.',
            soNgay: 4,
            thoiGian_BatDau: '2025-03-10',
            thoiGian_KetThuc: '2025-03-13',
            khuVuc: 'Miền Bắc',
            giaTour: 2800000,
            hinhAnh: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
            trangThai: 'Đã phát hành',
            badge: null
        },
        {
            tourId: 'E5F6A7B8-C9D0-1234-EF45-567890123456',
            tenTour: 'Tour Quy Nhơn: Biển Xanh Cát Trắng',
            moTaNgan: 'Thư giãn tại bãi biển đẹp nhất miền Trung với nước biển trong xanh.',
            soNgay: 3,
            thoiGian_BatDau: '2025-04-01',
            thoiGian_KetThuc: '2025-04-03',
            khuVuc: 'Miền Trung',
            giaTour: 2000000,
            hinhAnh: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
            trangThai: 'Đã phát hành',
            badge: null
        },
        {
            tourId: 'F6A7B8C9-D0E1-2345-F456-678901234567',
            tenTour: 'Tour Sài Gòn: Thành phố Không Ngủ',
            moTaNgan: 'Khám phá Sài Gòn về đêm với ẩm thực đường phố và cuộc sống sôi động.',
            soNgay: 1,
            thoiGian_BatDau: '2025-02-05',
            thoiGian_KetThuc: '2025-02-05',
            khuVuc: 'Miền Nam',
            giaTour: 800000,
            hinhAnh: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
            trangThai: 'Đã phát hành',
            badge: null
        },
        {
            tourId: 'A7B8C9D0-E1F2-3456-4567-789012345678',
            tenTour: 'Tour Bà Nà Hills: Cổng Trời',
            moTaNgan: 'Trải nghiệm cáp treo dài nhất thế giới và khám phá làng Pháp cổ.',
            soNgay: 1,
            thoiGian_BatDau: '2025-02-28',
            thoiGian_KetThuc: '2025-02-28',
            khuVuc: 'Miền Trung',
            giaTour: 1500000,
            hinhAnh: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
            trangThai: 'Đã phát hành',
            badge: null
        }
    ];

    // Chỉ hiển thị tour đã phát hành
    allTours = allTours.filter(tour => tour.trangThai === 'Đã phát hành');
    
    applyFilters();
}

function applyFilters() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const regionFilter = document.getElementById('region-filter').value;
    const priceFilter = document.getElementById('price-filter').value;
    const durationFilter = document.getElementById('duration-filter').value;

    filteredTours = allTours.filter(tour => {
        // Search filter
        const matchSearch = !searchTerm || 
            tour.tenTour.toLowerCase().includes(searchTerm) ||
            tour.moTaNgan.toLowerCase().includes(searchTerm);
        
        // Region filter
        const matchRegion = !regionFilter || tour.khuVuc === regionFilter;
        
        // Price filter
        let matchPrice = true;
        if (priceFilter) {
            const [min, max] = priceFilter.split('-').map(Number);
            matchPrice = tour.giaTour >= min && tour.giaTour <= max;
        }
        
        // Duration filter
        let matchDuration = true;
        if (durationFilter) {
            const duration = parseInt(durationFilter);
            if (duration === 1) {
                matchDuration = tour.soNgay === 1;
            } else if (duration === 2) {
                matchDuration = tour.soNgay === 2;
            } else if (duration === 3) {
                matchDuration = tour.soNgay === 3;
            } else if (duration === 4) {
                matchDuration = tour.soNgay === 4;
            } else if (duration === 5) {
                matchDuration = tour.soNgay >= 5;
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

    const badge = tour.badge 
        ? `<span class="tour-card-badge ${tour.badge}">${tour.badge === 'popular' ? 'Phổ biến' : 'Mới'}</span>`
        : '';

    const durationText = tour.soNgay === 1 
        ? '1 ngày' 
        : `${tour.soNgay} ngày ${tour.soNgay - 1} đêm`;

    card.innerHTML = `
        <div class="tour-card-image">
            <img src="${tour.hinhAnh}" alt="${tour.tenTour}" loading="lazy">
            ${badge}
        </div>
        <div class="tour-card-content">
            <div class="tour-card-meta">
                <span class="tour-card-type">${tour.khuVuc}</span>
                <span class="tour-card-status">Sẵn sàng</span>
            </div>
            <h3 class="tour-card-title">${tour.tenTour}</h3>
            <p class="tour-card-description">${tour.moTaNgan}</p>
            <div class="tour-card-info">
                <div class="tour-card-info-item">
                    <span>📅</span>
                    <span>Khởi hành: ${formatDate(tour.thoiGian_BatDau)}</span>
                </div>
                <div class="tour-card-info-item">
                    <span>📍</span>
                    <span>Khu vực: ${tour.khuVuc}</span>
                </div>
            </div>
            <div class="tour-card-footer">
                <div class="tour-card-pricing">
                    <span class="tour-card-price">${formatCurrency(tour.giaTour)}</span>
                    <span class="tour-card-duration">${durationText}</span>
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

