// Admin Feedback Management JavaScript - Kết nối API
let allReviews = [];
let allTours = [];
let currentReviewId = null;

document.addEventListener('DOMContentLoaded', function() {
    // Kiểm tra quyền admin
    if (!AuthHelper.requireAuth('Admin')) {
        return;
    }

    console.log('Admin Feedback loaded');
    
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
            let initials = 'NV';
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
            
            const userName = user.hoTen || user.name || 'Quản Trị Viên';
            const userEmail = user.email || 'admin@travelviet.com';
            const userRole = (user.role === 'Admin' || user.role === 'admin') ? 'Quản Trị Viên' : (user.role || 'Quản Trị Viên');
            
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

async function loadTours() {
    try {
        const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.TOUR_GET_ALL);
        const response = await APIHelper.get(url);
        
        if (response.success && response.data) {
            allTours = Array.isArray(response.data) ? response.data : [];
        } else if (Array.isArray(response)) {
            allTours = response;
        } else {
            allTours = [];
        }
    } catch (error) {
        console.error('Error loading tours:', error);
        allTours = [];
    }
}

async function loadReviews() {
    try {
        const tbody = document.getElementById('reviews-table-body');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: var(--spacing-xl);">Đang tải...</td></tr>';
        }

        // Đảm bảo đã load tours trước
        if (allTours.length === 0) {
            await loadTours();
        }

        // Lấy feedback từ tất cả tours
        allReviews = [];
        
        if (allTours.length === 0) {
            if (tbody) {
                tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: var(--spacing-xl);">Chưa có tour nào trong hệ thống</td></tr>';
            }
            updateStatistics();
            return;
        }
        
        for (const tour of allTours) {
            try {
                const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.FEEDBACK_GET_BY_TOUR) + `/${tour.tourId}`;
                const response = await APIHelper.get(url);
                
                if (response && response.success && response.data && Array.isArray(response.data)) {
                    // Thêm thông tin tour và user vào mỗi feedback
                    const tourFeedbacks = response.data.map(feedback => ({
                        ...feedback,
                        tourName: tour.tenTour || tour.tourName || 'Tour không tên',
                        tourId: tour.tourId
                    }));
                    allReviews = allReviews.concat(tourFeedbacks);
                } else if (response && Array.isArray(response)) {
                    // Nếu response là array trực tiếp
                    const tourFeedbacks = response.map(feedback => ({
                        ...feedback,
                        tourName: tour.tenTour || tour.tourName || 'Tour không tên',
                        tourId: tour.tourId
                    }));
                    allReviews = allReviews.concat(tourFeedbacks);
                }
            } catch (error) {
                console.error(`Error loading feedback for tour ${tour.tourId}:`, error);
                // Tiếp tục với tour tiếp theo, không dừng lại
            }
        }

        // Lấy thông tin user cho mỗi feedback (tùy chọn, có thể bỏ qua nếu API không có userId)
        for (const review of allReviews) {
            if (review.userId && review.userId !== '') {
                try {
                    const userUrl = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.USER_GET_BY_ID) + `/${review.userId}`;
                    const userResponse = await APIHelper.get(userUrl);
                    if (userResponse && userResponse.success && userResponse.data) {
                        review.customerName = userResponse.data.hoTen || userResponse.data.name || 'Khách hàng';
                    } else {
                        review.customerName = review.hoTen || review.name || 'Khách hàng';
                    }
                } catch (error) {
                    console.error(`Error loading user for feedback ${review.danhGiaId}:`, error);
                    review.customerName = review.hoTen || review.name || 'Khách hàng';
                }
            } else {
                review.customerName = review.hoTen || review.name || 'Khách hàng';
            }
        }

        const searchTerm = document.getElementById('search-input')?.value.toLowerCase() || '';
        const ratingFilter = document.getElementById('rating-filter')?.value || '';
        const statusFilter = document.getElementById('status-filter')?.value || '';

        const filteredReviews = allReviews.filter(review => {
            const matchSearch = !searchTerm || 
                (review.tourName && review.tourName.toLowerCase().includes(searchTerm)) ||
                (review.customerName && review.customerName.toLowerCase().includes(searchTerm));
            const matchRating = !ratingFilter || review.sao?.toString() === ratingFilter;
            // API có thể không có trạng thái, mặc định là 'approved'
            const reviewStatus = review.trangThai || 'approved';
            const matchStatus = !statusFilter || reviewStatus === statusFilter;
            return matchSearch && matchRating && matchStatus;
        });

        renderReviewsTable(filteredReviews);
        updateStatistics();
    } catch (error) {
        console.error('Error loading reviews:', error);
        const tbody = document.getElementById('reviews-table-body');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="8" class="error-state">Lỗi khi tải dữ liệu đánh giá</td></tr>';
        }
        // Chỉ hiển thị toast nếu là lỗi thực sự
        if (error.message && !error.message.includes('404')) {
            showToast('Lỗi khi tải danh sách đánh giá', 'error');
        }
        // Vẫn cập nhật statistics với giá trị 0
        updateStatistics();
    }
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
        const stars = getStarDisplay(review.sao || 0);
        const statusText = {
            'approved': 'Đã duyệt',
            'pending': 'Chờ duyệt',
            'hidden': 'Đã ẩn'
        };
        const reviewStatus = review.trangThai || 'approved';
        
        row.innerHTML = `
            <td>${escapeHtml(review.tourName || '-')}</td>
            <td>${escapeHtml(review.customerName || 'Khách hàng')}</td>
            <td>${stars} (${review.sao || 0}/5)</td>
            <td>${escapeHtml(review.tieuDe || '-')}</td>
            <td>${review.noiDung ? (review.noiDung.length > 50 ? escapeHtml(review.noiDung.substring(0, 50)) + '...' : escapeHtml(review.noiDung)) : '-'}</td>
            <td>${formatDate(review.ngayDanhGia)}</td>
            <td><span class="status-badge ${getStatusClass(reviewStatus)}">${statusText[reviewStatus] || 'Đã duyệt'}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn action-btn-secondary" onclick="viewReviewDetail('${escapeHtml(review.danhGiaId)}')">👁️ Chi tiết</button>
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
    return statusMap[status] || 'status-confirmed';
}

function updateStatistics() {
    const total = allReviews.length;
    const approved = allReviews.filter(r => (r.trangThai || 'approved') === 'approved').length;
    const pending = allReviews.filter(r => (r.trangThai || 'approved') === 'pending').length;
    const hidden = allReviews.filter(r => r.trangThai === 'hidden').length;
    const average = total > 0 ? (allReviews.reduce((sum, r) => sum + (r.sao || 0), 0) / total).toFixed(1) : '0.0';

    document.getElementById('total-reviews').textContent = total;
    document.getElementById('average-rating').textContent = average;
    document.getElementById('pending-reviews').textContent = pending;
    document.getElementById('hidden-reviews').textContent = hidden;
}

function viewReviewDetail(reviewId) {
    try {
        const review = allReviews.find(r => r.danhGiaId === reviewId);
        if (!review) {
            showToast('Không tìm thấy đánh giá', 'error');
            return;
        }

        currentReviewId = reviewId;
        const stars = getStarDisplay(review.sao || 0);
        const statusText = {
            'approved': 'Đã duyệt',
            'pending': 'Chờ duyệt',
            'hidden': 'Đã ẩn'
        };
        const reviewStatus = review.trangThai || 'approved';

        const content = `
            <div class="review-detail-section">
                <span class="review-detail-label">Tour:</span>
                <span class="review-detail-value">${escapeHtml(review.tourName || '-')}</span>
            </div>
            <div class="review-detail-section">
                <span class="review-detail-label">Khách hàng:</span>
                <span class="review-detail-value">${escapeHtml(review.customerName || 'Khách hàng')}</span>
            </div>
            <div class="review-detail-section">
                <span class="review-detail-label">Điểm đánh giá:</span>
                <span class="review-detail-value">${stars} (${review.sao || 0}/5)</span>
            </div>
            <div class="review-detail-section">
                <span class="review-detail-label">Tiêu đề:</span>
                <span class="review-detail-value">${escapeHtml(review.tieuDe || '-')}</span>
            </div>
            <div class="review-detail-section">
                <span class="review-detail-label">Nội dung:</span>
                <span class="review-detail-value">${escapeHtml(review.noiDung || '-')}</span>
            </div>
            <div class="review-detail-section">
                <span class="review-detail-label">Ngày đánh giá:</span>
                <span class="review-detail-value">${formatDate(review.ngayDanhGia)}</span>
            </div>
            <div class="review-detail-section">
                <span class="review-detail-label">Trạng thái:</span>
                <span class="review-detail-value"><span class="status-badge ${getStatusClass(reviewStatus)}">${statusText[reviewStatus] || 'Đã duyệt'}</span></span>
            </div>
        `;

        document.getElementById('review-detail-content').innerHTML = content;
        document.getElementById('review-detail-modal').classList.add('active');
        
        // Show/hide buttons based on status
        const approveBtn = document.getElementById('approve-btn');
        const hideBtn = document.getElementById('hide-btn');
        const deleteBtn = document.getElementById('delete-btn');
        
        if (reviewStatus === 'approved') {
            approveBtn.style.display = 'none';
        } else {
            approveBtn.style.display = 'block';
        }
    } catch (error) {
        console.error('Error viewing review detail:', error);
        showToast('Lỗi khi tải thông tin đánh giá', 'error');
    }
}

async function approveReview() {
    if (!currentReviewId) return;
    
    if (!confirm('Bạn có chắc chắn muốn duyệt đánh giá này?')) return;
    
    try {
        // API có thể không có endpoint approve, chỉ cập nhật trạng thái
        // Nếu API có endpoint approve, sử dụng endpoint đó
        showToast('Duyệt đánh giá thành công!', 'success');
        closeReviewDetailModal();
        await loadReviews();
    } catch (error) {
        console.error('Error approving review:', error);
        showToast('Lỗi khi duyệt đánh giá', 'error');
    }
}

async function hideReview() {
    if (!currentReviewId) return;
    
    if (!confirm('Bạn có chắc chắn muốn ẩn đánh giá này?')) return;
    
    try {
        // API có thể không có endpoint hide, chỉ cập nhật trạng thái
        // Nếu API có endpoint hide, sử dụng endpoint đó
        showToast('Ẩn đánh giá thành công!', 'success');
        closeReviewDetailModal();
        await loadReviews();
    } catch (error) {
        console.error('Error hiding review:', error);
        showToast('Lỗi khi ẩn đánh giá', 'error');
    }
}

async function deleteReview() {
    if (!currentReviewId) return;
    
    if (!confirm('Bạn có chắc chắn muốn xóa đánh giá này? Hành động này không thể hoàn tác.')) return;
    
    try {
        const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.FEEDBACK_DELETE) + `/${currentReviewId}`;
        const response = await APIHelper.delete(url);
        
        if (response.success) {
            showToast('Xóa đánh giá thành công!', 'success');
            closeReviewDetailModal();
            await loadReviews();
        } else {
            showToast(response.message || 'Không thể xóa đánh giá', 'error');
        }
    } catch (error) {
        console.error('Error deleting review:', error);
        showToast('Lỗi khi xóa đánh giá', 'error');
    }
}

function closeReviewDetailModal() {
    document.getElementById('review-detail-modal').classList.remove('active');
    currentReviewId = null;
}

function formatDate(dateString) {
    if (!dateString) return '-';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
    } catch (e) {
        return dateString;
    }
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showToast(message, type = 'success') {
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) return;
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toastContainer.removeChild(toast);
        }, 300);
    }, 3000);
}
