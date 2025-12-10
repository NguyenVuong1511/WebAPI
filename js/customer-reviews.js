// Customer Reviews Management JavaScript
let allReviews = [];
let allTours = [];
let currentReviewId = null;
let selectedRating = 0;

document.addEventListener('DOMContentLoaded', function() {
    // Kiểm tra đăng nhập
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    if (!user.email || user.role !== 'Khách Hàng') {
        alert('Vui lòng đăng nhập để truy cập trang này!');
        window.location.href = 'login.html';
        return;
    }
    
    loadUserInfo();
    loadTours();
    loadReviews();
    
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                loadReviews();
            }
        });
    }
    
    // Star rating buttons
    const starButtons = document.querySelectorAll('.star-btn');
    starButtons.forEach((btn, index) => {
        btn.addEventListener('click', function() {
            selectRating(index + 1);
        });
        btn.addEventListener('mouseenter', function() {
            highlightStars(index + 1);
        });
    });
    
    const ratingInput = document.getElementById('review-rating');
    if (ratingInput) {
        ratingInput.parentElement.addEventListener('mouseleave', function() {
            highlightStars(selectedRating);
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
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    if (user.name) {
        const nameParts = user.name.split(' ');
        const initials = nameParts.length >= 2 
            ? nameParts[0][0] + nameParts[nameParts.length - 1][0]
            : user.name[0];
        document.getElementById('user-avatar').textContent = initials.toUpperCase();
        document.getElementById('user-name').textContent = user.name;
        document.getElementById('user-role').textContent = user.role || 'Khách Hàng';
    }
}

function loadTours() {
    // Mock data - Tours để chọn khi thêm đánh giá
    allTours = [
        { tourId: '21214074-E7AA-43E3-8FE2-E3F33A8089F6', tenTour: 'Tour Miền Bắc: Hà Nội - Hạ Long - Sa Pa' },
        { tourId: '3A5B895A-3411-4F01-AABC-1D6C6D4DF3D1', tenTour: 'Tour Di sản Miền Trung: Đà Nẵng - Hội An - Huế' },
        { tourId: '844A695E-B3F3-47DE-A68A-E7088101B8E9', tenTour: 'Tour Đà Lạt: Thành phố Ngàn Hoa' },
        { tourId: 'AC507766-06B7-4CB8-A129-116FBC938C11', tenTour: 'Tour TP.HCM - Miền Tây Sông Nước' },
        { tourId: 'EAFF1F4C-EBCD-46A6-B7EB-3F131731D8B2', tenTour: 'Tour Côn Đảo Hồi Tưởng' }
    ];
    
    const select = document.getElementById('review-tour');
    if (select) {
        allTours.forEach(tour => {
            const option = document.createElement('option');
            option.value = tour.tourId;
            option.textContent = tour.tenTour;
            select.appendChild(option);
        });
    }
}

function loadReviews() {
    // Mock data - Chỉ hiển thị đánh giá của khách hàng hiện tại
    const currentUser = JSON.parse(sessionStorage.getItem('user') || '{}');
    
    allReviews = [
        {
            danhGiaId: '19624956-B1BA-4FD3-837C-7B194357DDF4',
            tourId: '21214074-E7AA-43E3-8FE2-E3F33A8089F6',
            tourName: 'Tour Miền Bắc: Hà Nội - Hạ Long - Sa Pa',
            sao: 5,
            tieuDe: 'Tuyệt vời!',
            noiDung: 'Tour Hạ Long rất tuyệt vời, hướng dẫn viên chuyên nghiệp. Cảnh đẹp, dịch vụ tốt, rất đáng để trải nghiệm.',
            ngayDanhGia: '2024-01-20',
            bookingId: '31FEDE4C-F72A-46E4-860C-13B37F21AF88'
        },
        {
            danhGiaId: '2D93E4D0-5783-4EEF-8AF1-6D374A9E3DD2',
            tourId: '3A5B895A-3411-4F01-AABC-1D6C6D4DF3D1',
            tourName: 'Tour Di sản Miền Trung: Đà Nẵng - Hội An - Huế',
            sao: 4,
            tieuDe: 'Hài lòng',
            noiDung: 'Dịch vụ tốt, lịch trình hợp lý. Đồ ăn ngon, khách sạn sạch sẽ.',
            ngayDanhGia: '2024-01-19',
            bookingId: '3B77F08D-D653-4687-8F88-EE6C3ABDB691'
        },
        {
            danhGiaId: '9D46FA45-3ED9-4E46-AA48-5B404CF1E1C0',
            tourId: '844A695E-B3F3-47DE-A68A-E7088101B8E9',
            tourName: 'Tour Đà Lạt: Thành phố Ngàn Hoa',
            sao: 5,
            tieuDe: 'Rất đáng tiền',
            noiDung: 'Giá cả phải chăng, rất đáng trải nghiệm. Đà Lạt đẹp quá, sẽ quay lại lần nữa.',
            ngayDanhGia: '2024-01-15',
            bookingId: '586CCD5A-1069-426C-9F41-E065B604AB4E'
        }
    ];

    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const ratingFilter = document.getElementById('rating-filter').value;

    const filteredReviews = allReviews.filter(review => {
        const matchSearch = !searchTerm || 
            review.tourName.toLowerCase().includes(searchTerm);
        const matchRating = !ratingFilter || review.sao.toString() === ratingFilter;
        return matchSearch && matchRating;
    });

    renderReviewsList(filteredReviews);
}

function renderReviewsList(reviews) {
    const container = document.getElementById('reviews-list');
    if (!container) return;

    container.innerHTML = '';

    if (reviews.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">⭐</div>
                <div class="empty-state-text">Chưa có đánh giá nào</div>
                <div class="empty-state-desc">Bạn chưa đánh giá tour nào. Hãy thêm đánh giá để chia sẻ trải nghiệm của bạn!</div>
            </div>
        `;
        return;
    }

    reviews.forEach(review => {
        const card = document.createElement('div');
        card.className = 'review-card';
        card.onclick = () => viewReviewDetail(review.danhGiaId);
        
        const stars = getStarDisplay(review.sao);
        
        card.innerHTML = `
            <div class="review-header">
                <div>
                    <div class="review-tour">${review.tourName}</div>
                </div>
                <div class="review-rating">
                    <span class="star-rating">${stars}</span>
                    <span class="rating-value">${review.sao}/5</span>
                </div>
            </div>
            <div class="review-content">
                ${review.tieuDe ? `<div class="review-title">${review.tieuDe}</div>` : ''}
                <div class="review-text">${review.noiDung}</div>
            </div>
            <div class="review-footer">
                <div class="review-date">${formatDate(review.ngayDanhGia)}</div>
                <div class="review-actions">
                    <button class="action-btn action-btn-secondary" onclick="event.stopPropagation(); viewReviewDetail('${review.danhGiaId}')">👁️ Chi tiết</button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

function getStarDisplay(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            stars += '⭐';
        } else {
            stars += '☆';
        }
    }
    return stars;
}

function viewReviewDetail(reviewId) {
    currentReviewId = reviewId;
    const review = allReviews.find(r => r.danhGiaId === reviewId);
    if (!review) {
        alert('Không tìm thấy đánh giá');
        return;
    }

    document.getElementById('review-detail-title').textContent = 'Chi tiết Đánh giá';
    
    const editBtn = document.getElementById('edit-btn');
    const deleteBtn = document.getElementById('delete-btn');
    editBtn.style.display = 'block';
    deleteBtn.style.display = 'block';
    
    const content = document.getElementById('review-detail-content');
    const stars = getStarDisplay(review.sao);
    
    content.innerHTML = `
        <div class="review-detail-section">
            <span class="review-detail-label">Tour:</span>
            <span class="review-detail-value">${review.tourName}</span>
        </div>
        <div class="review-detail-section">
            <span class="review-detail-label">Đánh giá:</span>
            <div class="review-rating" style="margin-top: var(--spacing-xs);">
                <span class="star-rating">${stars}</span>
                <span class="rating-value">${review.sao}/5</span>
            </div>
        </div>
        ${review.tieuDe ? `
        <div class="review-detail-section">
            <span class="review-detail-label">Tiêu đề:</span>
            <span class="review-detail-value">${review.tieuDe}</span>
        </div>
        ` : ''}
        <div class="review-detail-section">
            <span class="review-detail-label">Nội dung:</span>
            <span class="review-detail-value">${review.noiDung}</span>
        </div>
        <div class="review-detail-section">
            <span class="review-detail-label">Ngày đánh giá:</span>
            <span class="review-detail-value">${formatDate(review.ngayDanhGia)}</span>
        </div>
    `;

    document.getElementById('review-detail-modal').classList.add('active');
}

function closeReviewDetailModal() {
    document.getElementById('review-detail-modal').classList.remove('active');
}

function editReview() {
    if (!currentReviewId) return;
    
    const review = allReviews.find(r => r.danhGiaId === currentReviewId);
    if (!review) {
        alert('Không tìm thấy đánh giá');
        return;
    }
    
    closeReviewDetailModal();
    
    // Fill form with review data
    document.getElementById('review-tour').value = review.tourId;
    selectRating(review.sao);
    document.getElementById('review-title').value = review.tieuDe || '';
    document.getElementById('review-content').value = review.noiDung;
    
    document.getElementById('add-review-modal').classList.add('active');
}

function deleteReview() {
    if (!currentReviewId) return;
    
    if (!confirm('Bạn có chắc chắn muốn xóa đánh giá này không?')) return;
    
    // Remove from array
    allReviews = allReviews.filter(r => r.danhGiaId !== currentReviewId);
    
    alert('Xóa đánh giá thành công!');
    closeReviewDetailModal();
    loadReviews();
}

function selectRating(rating) {
    selectedRating = rating;
    document.getElementById('review-rating').value = rating;
    highlightStars(rating);
}

function highlightStars(rating) {
    const starButtons = document.querySelectorAll('#add-review-modal .star-btn');
    starButtons.forEach((btn, index) => {
        if (index < rating) {
            btn.classList.add('active', 'selected');
        } else {
            btn.classList.remove('active', 'selected');
        }
    });
}

function closeAddReviewModal() {
    document.getElementById('add-review-modal').classList.remove('active');
    document.getElementById('review-form').reset();
    selectedRating = 0;
    highlightStars(0);
    currentReviewId = null;
}

function saveReview(event) {
    event.preventDefault();
    
    const tourId = document.getElementById('review-tour').value;
    const rating = document.getElementById('review-rating').value;
    const title = document.getElementById('review-title').value;
    const content = document.getElementById('review-content').value;
    
    if (!tourId || !rating || !content) {
        alert('Vui lòng điền đầy đủ thông tin bắt buộc');
        return;
    }
    
    const tour = allTours.find(t => t.tourId === tourId);
    
    if (currentReviewId) {
        // Update existing review
        const review = allReviews.find(r => r.danhGiaId === currentReviewId);
        if (review) {
            review.sao = parseInt(rating);
            review.tieuDe = title;
            review.noiDung = content;
            alert('Cập nhật đánh giá thành công!');
        }
    } else {
        // Add new review
        const newReview = {
            danhGiaId: 'NEW-' + Date.now(),
            tourId: tourId,
            tourName: tour ? tour.tenTour : '',
            sao: parseInt(rating),
            tieuDe: title,
            noiDung: content,
            ngayDanhGia: new Date().toISOString().split('T')[0],
            bookingId: null
        };
        allReviews.push(newReview);
        alert('Thêm đánh giá thành công!');
    }
    
    closeAddReviewModal();
    loadReviews();
}

function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
}

