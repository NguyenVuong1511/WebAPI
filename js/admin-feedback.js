// Admin Feedback Management JavaScript
let allReviews = [];

document.addEventListener('DOMContentLoaded', function() {
    loadUserInfo();
    loadReviews();
    
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
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    if (user.name) {
        const nameParts = user.name.split(' ');
        const initials = nameParts.length >= 2 
            ? nameParts[0][0] + nameParts[nameParts.length - 1][0]
            : user.name[0];
        document.getElementById('user-avatar').textContent = initials.toUpperCase();
        document.getElementById('user-name').textContent = user.name;
        document.getElementById('user-role').textContent = user.role || 'Quản Trị Viên';
    }
}

function loadReviews() {
    // Mock data - Đánh giá từ database
    allReviews = [
        {
            danhGiaId: '19624956-B1BA-4FD3-837C-7B194357DDF4',
            tourName: 'Tour Miền Bắc: Hà Nội - Hạ Long - Sa Pa',
            customerName: 'Nguyễn Văn A',
            sao: 5,
            tieuDe: 'Tuyệt vời!',
            noiDung: 'Tour Hạ Long rất tuyệt vời, hướng dẫn viên chuyên nghiệp. Cảnh đẹp, dịch vụ tốt, rất đáng để trải nghiệm.',
            ngayDanhGia: '2024-01-20',
            trangThai: 'approved',
            bookingId: '31FEDE4C-F72A-46E4-860C-13B37F21AF88'
        },
        {
            danhGiaId: '2D93E4D0-5783-4EEF-8AF1-6D374A9E3DD2',
            tourName: 'Tour Di sản Miền Trung: Đà Nẵng - Hội An - Huế',
            customerName: 'Hoàng Minh E',
            sao: 4,
            tieuDe: 'Hài lòng',
            noiDung: 'Dịch vụ tốt, lịch trình hợp lý. Đồ ăn ngon, khách sạn sạch sẽ.',
            ngayDanhGia: '2024-01-19',
            trangThai: 'approved',
            bookingId: '3B77F08D-D653-4687-8F88-EE6C3ABDB691'
        },
        {
            danhGiaId: '9D46FA45-3ED9-4E46-AA48-5B404CF1E1C0',
            tourName: 'Tour Đà Lạt: Thành phố Ngàn Hoa',
            customerName: 'Phạm Thị D',
            sao: 5,
            tieuDe: 'Rất đáng tiền',
            noiDung: 'Giá cả phải chăng, rất đáng trải nghiệm. Đà Lạt đẹp quá, sẽ quay lại lần nữa.',
            ngayDanhGia: '2024-01-15',
            trangThai: 'pending',
            bookingId: '586CCD5A-1069-426C-9F41-E065B604AB4E'
        },
        {
            danhGiaId: 'AFD6AB25-47BE-4533-B278-8F90D5EF3507',
            tourName: 'Tour TP.HCM - Miền Tây Sông Nước',
            customerName: 'Lê Văn C',
            sao: 3,
            tieuDe: 'Trung bình',
            noiDung: 'Đồ ăn trên tàu không ngon lắm. Nhưng cảnh đẹp, người dân thân thiện.',
            ngayDanhGia: '2024-01-10',
            trangThai: 'approved',
            bookingId: null
        },
        {
            danhGiaId: 'F438098F-F48B-4856-B461-489FE80A57E7',
            tourName: 'Tour Côn Đảo Hồi Tưởng',
            customerName: 'Trần Thị B',
            sao: 4,
            tieuDe: 'Tốt',
            noiDung: 'Nên thử tour này! Có nhiều điều thú vị để khám phá.',
            ngayDanhGia: '2024-01-05',
            trangThai: 'hidden',
            bookingId: null
        }
    ];

    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const ratingFilter = document.getElementById('rating-filter').value;
    const statusFilter = document.getElementById('status-filter').value;

    const filteredReviews = allReviews.filter(review => {
        const matchSearch = !searchTerm || 
            review.tourName.toLowerCase().includes(searchTerm) ||
            review.customerName.toLowerCase().includes(searchTerm);
        const matchRating = !ratingFilter || review.sao.toString() === ratingFilter;
        const matchStatus = !statusFilter || review.trangThai === statusFilter;
        return matchSearch && matchRating && matchStatus;
    });

    renderReviewsTable(filteredReviews);
    updateStatistics();
}

function renderReviewsTable(reviews) {
    const tbody = document.getElementById('reviews-table-body');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (reviews.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: var(--spacing-xl);">Không tìm thấy đánh giá nào</td></tr>';
        return;
    }

    reviews.forEach(review => {
        const row = document.createElement('tr');
        const stars = getStarDisplay(review.sao);
        const statusText = {
            'approved': 'Đã duyệt',
            'pending': 'Chờ duyệt',
            'hidden': 'Đã ẩn'
        };
        
        row.innerHTML = `
            <td>${review.tourName}</td>
            <td>${review.customerName}</td>
            <td>${stars} (${review.sao}/5)</td>
            <td>${review.tieuDe || '-'}</td>
            <td>${review.noiDung ? (review.noiDung.length > 50 ? review.noiDung.substring(0, 50) + '...' : review.noiDung) : '-'}</td>
            <td>${formatDate(review.ngayDanhGia)}</td>
            <td><span class="status-badge ${getStatusClass(review.trangThai)}">${statusText[review.trangThai]}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn action-btn-secondary" onclick="viewReviewDetail('${review.danhGiaId}')">👁️ Chi tiết</button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
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

function getStatusClass(status) {
    const statusMap = {
        'approved': 'status-confirmed',
        'pending': 'status-pending',
        'hidden': 'status-cancelled'
    };
    return statusMap[status] || 'status-pending';
}

function updateStatistics() {
    const total = allReviews.length;
    const approved = allReviews.filter(r => r.trangThai === 'approved').length;
    const pending = allReviews.filter(r => r.trangThai === 'pending').length;
    const hidden = allReviews.filter(r => r.trangThai === 'hidden').length;
    const average = total > 0 ? (allReviews.reduce((sum, r) => sum + r.sao, 0) / total).toFixed(1) : '0.0';

    document.getElementById('total-reviews').textContent = total;
    document.getElementById('average-rating').textContent = average;
    document.getElementById('pending-reviews').textContent = pending;
    document.getElementById('hidden-reviews').textContent = hidden;
}

function viewReviewDetail(reviewId) {
    try {
        const review = allReviews.find(r => r.danhGiaId === reviewId);
        if (!review) {
            alert('Không tìm thấy đánh giá');
            return;
        }

        const stars = getStarDisplay(review.sao);
        const statusText = {
            'approved': 'Đã duyệt',
            'pending': 'Chờ duyệt',
            'hidden': 'Đã ẩn'
        };

        const content = `
            <div class="review-detail-section">
                <span class="review-detail-label">Tour:</span>
                <span class="review-detail-value">${review.tourName}</span>
            </div>
            <div class="review-detail-section">
                <span class="review-detail-label">Khách hàng:</span>
                <span class="review-detail-value">${review.customerName}</span>
            </div>
            <div class="review-detail-section">
                <span class="review-detail-label">Điểm đánh giá:</span>
                <span class="review-detail-value">${stars} (${review.sao}/5)</span>
            </div>
            <div class="review-detail-section">
                <span class="review-detail-label">Tiêu đề:</span>
                <span class="review-detail-value">${review.tieuDe || '-'}</span>
            </div>
            <div class="review-detail-section">
                <span class="review-detail-label">Nội dung:</span>
                <span class="review-detail-value">${review.noiDung || '-'}</span>
            </div>
            <div class="review-detail-section">
                <span class="review-detail-label">Ngày đánh giá:</span>
                <span class="review-detail-value">${formatDate(review.ngayDanhGia)}</span>
            </div>
            <div class="review-detail-section">
                <span class="review-detail-label">Trạng thái:</span>
                <span class="review-detail-value"><span class="status-badge ${getStatusClass(review.trangThai)}">${statusText[review.trangThai]}</span></span>
            </div>
            ${review.bookingId ? `
            <div class="review-detail-section">
                <span class="review-detail-label">Mã Booking:</span>
                <span class="review-detail-value">${review.bookingId.substring(0, 8)}</span>
            </div>
            ` : ''}
        `;

        document.getElementById('review-detail-content').innerHTML = content;
        document.getElementById('review-detail-modal').classList.add('active');
        
        // Show/hide buttons based on status
        const approveBtn = document.getElementById('approve-btn');
        const hideBtn = document.getElementById('hide-btn');
        const deleteBtn = document.getElementById('delete-btn');
        
        if (review.trangThai === 'approved') {
            approveBtn.style.display = 'none';
        } else {
            approveBtn.style.display = 'block';
        }
        
        // Store current review ID for actions
        approveBtn.setAttribute('data-review-id', reviewId);
        hideBtn.setAttribute('data-review-id', reviewId);
        deleteBtn.setAttribute('data-review-id', reviewId);
    } catch (error) {
        console.error('Error viewing review detail:', error);
        alert('Lỗi khi tải thông tin đánh giá');
    }
}

function approveReview() {
    const reviewId = event.target.getAttribute('data-review-id');
    if (!reviewId) return;
    
    if (!confirm('Bạn có chắc chắn muốn duyệt đánh giá này?')) return;
    
    try {
        alert('Duyệt đánh giá thành công!');
        closeReviewDetailModal();
        loadReviews();
    } catch (error) {
        console.error('Error approving review:', error);
        alert('Lỗi khi duyệt đánh giá');
    }
}

function hideReview() {
    const reviewId = event.target.getAttribute('data-review-id');
    if (!reviewId) return;
    
    if (!confirm('Bạn có chắc chắn muốn ẩn đánh giá này?')) return;
    
    try {
        alert('Ẩn đánh giá thành công!');
        closeReviewDetailModal();
        loadReviews();
    } catch (error) {
        console.error('Error hiding review:', error);
        alert('Lỗi khi ẩn đánh giá');
    }
}

function deleteReview() {
    const reviewId = event.target.getAttribute('data-review-id');
    if (!reviewId) return;
    
    if (!confirm('Bạn có chắc chắn muốn xóa đánh giá này? Hành động này không thể hoàn tác.')) return;
    
    try {
        alert('Xóa đánh giá thành công!');
        closeReviewDetailModal();
        loadReviews();
    } catch (error) {
        console.error('Error deleting review:', error);
        alert('Lỗi khi xóa đánh giá');
    }
}

function closeReviewDetailModal() {
    document.getElementById('review-detail-modal').classList.remove('active');
}

function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
}

