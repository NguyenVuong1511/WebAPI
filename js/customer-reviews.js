// Customer Reviews Management JavaScript - Kết nối API
let allBookings = [];
let allReviews = [];
let allTours = [];
let toursMap = new Map(); // Map tourId -> tenTour

// Utility functions
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
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

    console.log('Customer Reviews loaded');
    
    loadUserInfo();
    loadBookings();
    
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                loadReviews();
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

async function loadBookings() {
    try {
        const user = AuthHelper.getUser();
        if (!user || !user.nguoiDungId) {
            showToast('Không tìm thấy thông tin người dùng', 'error');
            return;
        }

        const userId = user.nguoiDungId;
        const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.BOOKING_MY_HISTORY) + `/${userId}`;
        const response = await APIHelper.get(url);
        
        if (response && response.success && response.data) {
            allBookings = Array.isArray(response.data) ? response.data : [];
        } else if (Array.isArray(response)) {
            allBookings = response;
        } else if (response && Array.isArray(response.data)) {
            allBookings = response.data;
        } else {
            allBookings = [];
        }
        
        // Load reviews for all tours in bookings
        await loadReviews();
    } catch (error) {
        console.error('Error loading bookings:', error);
        showToast('Lỗi khi tải danh sách booking', 'error');
    }
}

async function loadReviews() {
    try {
        const reviewsList = document.getElementById('reviews-list');
        if (reviewsList) {
            reviewsList.innerHTML = '<div class="loading-state">Đang tải...</div>';
        }

        const user = AuthHelper.getUser();
        if (!user || !user.nguoiDungId) {
            showToast('Không tìm thấy thông tin người dùng', 'error');
            return;
        }

        // Load tất cả tours để lấy tourId
        toursMap.clear();
        try {
            const toursUrl = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.TOUR_USER_GET_ALL);
            const toursResponse = await APIHelper.post(toursUrl, {});
            
            if (toursResponse && toursResponse.data) {
                const tours = Array.isArray(toursResponse.data) ? toursResponse.data : [];
                tours.forEach(tour => {
                    const tenTour = tour.tenTour || tour.TenTour || '';
                    const tourId = tour.tourId || tour.TourId;
                    if (tenTour && tourId) {
                        toursMap.set(tourId, tenTour); // Map tourId -> tenTour
                    }
                });
            }
        } catch (error) {
            console.error('Error loading tours:', error);
        }
        
        // Tạo reverse map: tên tour -> tourId (để tìm tourId từ booking)
        const tourNameToIdMap = new Map();
        toursMap.forEach((tenTour, tourId) => {
            tourNameToIdMap.set(tenTour, tourId);
        });

        // Lấy tourIds từ bookings qua tên tour
        const tourIds = [];
        allBookings.forEach(booking => {
            const tenTour = booking.tenTour || booking.TenTour || '';
            const tourId = tourNameToIdMap.get(tenTour);
            if (tourId && !tourIds.includes(tourId)) {
                tourIds.push(tourId);
            }
        });

        // Load reviews cho từng tour
        allReviews = [];
        for (const tourId of tourIds) {
            try {
                const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.FEEDBACK_GET_BY_TOUR) + `/${tourId}`;
                const response = await APIHelper.get(url);
                
                if (response && response.success && response.data) {
                    const reviews = Array.isArray(response.data) ? response.data : [];
                    // Lọc chỉ reviews của user hiện tại
                    const userReviews = reviews.filter(r => 
                        (r.nguoiDungId || r.NguoiDungId) === user.nguoiDungId
                    );
                    allReviews.push(...userReviews);
                }
            } catch (error) {
                console.error(`Error loading reviews for tour ${tourId}:`, error);
            }
        }

        // Filter reviews
        const searchTerm = document.getElementById('search-input')?.value.toLowerCase().trim() || '';
        const ratingFilter = document.getElementById('rating-filter')?.value || '';
        
        let filteredReviews = allReviews;
        
        if (searchTerm) {
            filteredReviews = filteredReviews.filter(review => {
                // Cần lấy tên tour từ booking
                const booking = allBookings.find(b => 
                    (b.tourId || b.TourId) === (review.tourId || review.TourId)
                );
                const tenTour = booking ? (booking.tenTour || booking.TenTour || '') : '';
                return tenTour.toLowerCase().includes(searchTerm);
            });
        }
        
        if (ratingFilter) {
            filteredReviews = filteredReviews.filter(review => {
                const soSao = review.soSao || review.SoSao || 0;
                return soSao.toString() === ratingFilter;
            });
        }

        renderReviewsList(filteredReviews);
    } catch (error) {
        console.error('Error loading reviews:', error);
        const reviewsList = document.getElementById('reviews-list');
        if (reviewsList) {
            reviewsList.innerHTML = '<div class="error-state">Lỗi khi tải danh sách đánh giá</div>';
        }
        showToast('Lỗi khi tải danh sách đánh giá', 'error');
    }
}

function renderReviewsList(reviews) {
    const reviewsList = document.getElementById('reviews-list');
    if (!reviewsList) return;

    reviewsList.innerHTML = '';

    if (reviews.length === 0) {
        reviewsList.innerHTML = '<div class="empty-state">Bạn chưa có đánh giá nào</div>';
        return;
    }

    reviews.forEach(review => {
        const danhGiaId = review.danhGiaId || review.DanhGiaId || '';
        const soSao = review.soSao || review.SoSao || 0;
        const binhLuan = review.binhLuan || review.BinhLuan || '';
        const ngayDanhGia = review.ngayDanhGia || review.NgayDanhGia;
        const tourId = review.tourId || review.TourId;
        
        // Tìm tên tour từ toursMap
        const tenTour = toursMap.get(tourId) || 'Tour không xác định';
        
        const reviewCard = document.createElement('div');
        reviewCard.className = 'review-card';
        reviewCard.innerHTML = `
            <div class="review-header">
                <div class="review-tour-name">${escapeHtml(tenTour)}</div>
                <div class="review-rating">${'⭐'.repeat(soSao)}</div>
            </div>
            <div class="review-content">${escapeHtml(binhLuan)}</div>
            <div class="review-footer">
                <span class="review-date">${formatDate(ngayDanhGia)}</span>
            </div>
        `;
        reviewsList.appendChild(reviewCard);
    });
}

async function showAddReviewModal() {
    // Load tours from bookings (chỉ tour đã đặt)
    const tourSelect = document.getElementById('review-tour');
    if (!tourSelect) return;
    
    tourSelect.innerHTML = '<option value="">Đang tải...</option>';
    
    try {
        // Load tất cả tours để lấy tourId
        const toursUrl = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.TOUR_USER_GET_ALL);
        const toursResponse = await APIHelper.post(toursUrl, {});
        
        const tempToursMap = new Map();
        if (toursResponse && toursResponse.data) {
            const tours = Array.isArray(toursResponse.data) ? toursResponse.data : [];
            tours.forEach(tour => {
                const tenTour = tour.tenTour || tour.TenTour || '';
                const tourId = tour.tourId || tour.TourId;
                if (tenTour && tourId) {
                    tempToursMap.set(tenTour, tourId);
                }
            });
        }
        
        // Lấy danh sách tour unique từ bookings
        const uniqueTours = [];
        const seenTourIds = new Set();
        
        allBookings.forEach(booking => {
            const tenTour = booking.tenTour || booking.TenTour || '';
            const tourId = tempToursMap.get(tenTour);
            
            if (tourId && tenTour && !seenTourIds.has(tourId)) {
                seenTourIds.add(tourId);
                uniqueTours.push({ tourId, tenTour });
            }
        });
        
        tourSelect.innerHTML = '<option value="">Chọn tour</option>';
        uniqueTours.forEach(tour => {
            const option = document.createElement('option');
            option.value = tour.tourId;
            option.textContent = tour.tenTour;
            tourSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading tours:', error);
        tourSelect.innerHTML = '<option value="">Lỗi khi tải danh sách tour</option>';
    }
    
    // Reset form
    document.getElementById('review-form').reset();
    document.getElementById('review-rating').value = '';
    document.getElementById('rating-text').textContent = 'Chọn số sao';
    updateStarButtons(0);
    
    document.getElementById('add-review-modal').classList.add('active');
}

function closeAddReviewModal() {
    document.getElementById('add-review-modal').classList.remove('active');
    document.getElementById('review-form').reset();
    document.getElementById('review-rating').value = '';
    document.getElementById('rating-text').textContent = 'Chọn số sao';
    updateStarButtons(0);
}

function setRating(rating) {
    document.getElementById('review-rating').value = rating;
    document.getElementById('rating-text').textContent = `${rating} sao`;
    updateStarButtons(rating);
}

function updateStarButtons(rating) {
    const starButtons = document.querySelectorAll('.star-btn');
    starButtons.forEach((btn, index) => {
        const btnRating = parseInt(btn.getAttribute('data-rating'));
        if (btnRating <= rating) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

async function saveReview(event) {
    event.preventDefault();
    
    try {
        const user = AuthHelper.getUser();
        if (!user || !user.nguoiDungId) {
            showToast('Không tìm thấy thông tin người dùng', 'error');
            return;
        }

        const tourId = document.getElementById('review-tour').value;
        const soSao = parseInt(document.getElementById('review-rating').value);
        const binhLuan = document.getElementById('review-content').value.trim();

        if (!tourId) {
            showToast('Vui lòng chọn tour', 'error');
            return;
        }

        if (!soSao || soSao < 1 || soSao > 5) {
            showToast('Vui lòng chọn số sao từ 1 đến 5', 'error');
            return;
        }

        if (!binhLuan) {
            showToast('Vui lòng nhập nội dung đánh giá', 'error');
            return;
        }

        // FeedbackCreateDto: TourId, NguoiDungId, SoSao, BinhLuan (PascalCase)
        const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.FEEDBACK_CREATE);
        const response = await APIHelper.post(url, {
            TourId: tourId,
            NguoiDungId: user.nguoiDungId,
            SoSao: soSao,
            BinhLuan: binhLuan
        });

        if (response && response.success) {
            showToast('Thêm đánh giá thành công!', 'success');
            closeAddReviewModal();
            await loadBookings(); // Reload để có reviews mới
        } else {
            showToast(response?.message || 'Không thể thêm đánh giá', 'error');
        }
    } catch (error) {
        console.error('Error saving review:', error);
        showToast('Lỗi khi thêm đánh giá', 'error');
    }
}
