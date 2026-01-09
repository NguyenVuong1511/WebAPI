// Detail Tour Page JavaScript
let currentTour = null;
let currentTourId = null;

document.addEventListener('DOMContentLoaded', function() {
    // Lấy tourId từ URL
    const urlParams = new URLSearchParams(window.location.search);
    currentTourId = urlParams.get('tourId');
    
    if (!currentTourId) {
        showError('Không tìm thấy tour');
        return;
    }
    
    loadTourDetail();
    setupBookingForm();
});

// Load tour detail from API - Sử dụng GET /tour/get-by-id/{id} (AllowAnonymous)
async function loadTourDetail() {
    try {
        // GET /tour/get-by-id/{id} - AllowAnonymous nên khách hàng có thể dùng
        const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.TOUR_GET_BY_ID) + `/${currentTourId}`;
        console.log('Loading tour detail from:', url);
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            // Nếu không tìm thấy, thử load từ user/get-all
            console.warn('Tour not found by ID, trying user/get-all...');
            return await loadTourDetailFromList();
        }
        
        const result = await response.json();
        console.log('Tour detail response:', result);
        
        // Xử lý response (có thể là ApiResponse hoặc trực tiếp là TourDTO)
        if (result && result.data) {
            currentTour = result.data;
        } else if (result && result.TourId) {
            currentTour = result;
        } else {
            // Thử load từ danh sách
            return await loadTourDetailFromList();
        }
        
        if (!currentTour) {
            showError('Không tìm thấy tour');
            return;
        }
        
        // Load thêm thông tin: hình ảnh, lịch trình
        await loadTourAdditionalInfo();
        renderTourDetail();
    } catch (error) {
        console.error('Error loading tour detail:', error);
        // Thử load từ danh sách nếu lỗi
        await loadTourDetailFromList();
    }
}

// Fallback: Load tour từ danh sách
async function loadTourDetailFromList() {
    try {
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
        
        currentTour = tours.find(tour => {
            const tourId = (tour.TourId || tour.tourId || '').toString();
            return tourId === currentTourId || tourId.toLowerCase() === currentTourId.toLowerCase();
        });
        
        if (!currentTour) {
            showError('Không tìm thấy tour');
            return;
        }
        
        await loadTourAdditionalInfo();
        renderTourDetail();
    } catch (error) {
        console.error('Error loading tour from list:', error);
        showError('Lỗi khi tải chi tiết tour');
    }
}

// Load thêm thông tin: hình ảnh, lịch trình
async function loadTourAdditionalInfo() {
    if (!currentTour || !currentTourId) return;
    
    try {
        // Load hình ảnh tour từ API
        try {
            const anhTourUrl = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.ANHTOUR_GET_BY_TOUR) + `/${currentTourId}`;
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
                
                // Lấy ảnh đại diện hoặc ảnh đầu tiên
                // AnhTourDTO có LinkAnh và IsAvatar
                if (anhTours.length > 0) {
                    const anhDaiDien = anhTours.find(a => a.isAvatar || a.IsAvatar) || anhTours[0];
                    const linkAnh = anhDaiDien.linkAnh || anhDaiDien.LinkAnh || '';
                    if (linkAnh) {
                        currentTour.hinhAnh = linkAnh;
                    }
                }
            }
        } catch (e) {
            console.log('Could not load tour images:', e);
        }
        
        // Load lịch trình để tính số ngày và hiển thị
        try {
            const lichTrinhUrl = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.LICHTRINH_GET_BY_TOUR) + `/${currentTourId}`;
            const lichTrinhResponse = await fetch(lichTrinhUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (lichTrinhResponse.ok) {
                const lichTrinhResult = await lichTrinhResponse.json();
                let lichTrinhs = [];
                
                if (lichTrinhResult && lichTrinhResult.data && Array.isArray(lichTrinhResult.data)) {
                    lichTrinhs = lichTrinhResult.data;
                } else if (Array.isArray(lichTrinhResult)) {
                    lichTrinhs = lichTrinhResult;
                }
                
                // Tính số ngày từ lịch trình
                if (lichTrinhs.length > 0) {
                    const uniqueDays = new Set(lichTrinhs.map(lt => lt.ngayThu || lt.NgayThu || 0).filter(d => d > 0));
                    if (uniqueDays.size > 0) {
                        currentTour.soNgay = Math.max(...Array.from(uniqueDays));
                    }
                    // Lưu lịch trình để render
                    currentTour.lichTrinhs = lichTrinhs;
                }
            }
        } catch (e) {
            console.log('Could not load tour schedule:', e);
        }
    } catch (error) {
        console.error('Error loading additional info:', error);
    }
}

// Render tour detail - Bám sát TourDTO từ API
function renderTourDetail() {
    if (!currentTour) return;
    
    // Xử lý TourDTO (PascalCase) - bám sát API
    const tenTour = currentTour.TenTour || currentTour.tenTour || '';
    const moTaNgan = currentTour.MoTaNgan || currentTour.moTaNgan || '';
    const moTaChiTiet = currentTour.MoTaChiTiet || currentTour.moTaChiTiet || moTaNgan;
    const giaNguoiLon = currentTour.GiaNguoiLon || currentTour.giaNguoiLon || 0;
    const giaTreEm = currentTour.GiaTreEm || currentTour.giaTreEm || 0;
    const thoiGianKhoiHanh = currentTour.ThoiGianKhoiHanh || currentTour.thoiGianKhoiHanh || '';
    const trangThai = currentTour.TrangThai || currentTour.trangThai || '';
    const soNgay = currentTour.soNgay || currentTour.SoNgay || 0;
    const hinhAnh = currentTour.hinhAnh || currentTour.HinhAnh || currentTour.anhDaiDien || currentTour.AnhDaiDien || '';
    
    // Update hero section
    const heroTitle = document.querySelector('.detail-hero-title');
    if (heroTitle) heroTitle.textContent = tenTour;
    
    const heroSubtitle = document.querySelector('.detail-hero-subtitle');
    if (heroSubtitle && moTaNgan) {
        heroSubtitle.textContent = moTaNgan;
    }
    
    // Update tour title
    const tourTitle = document.querySelector('.tour-detail-title');
    if (tourTitle) tourTitle.textContent = tenTour;
    
    // Update tour meta
    const metaItems = document.querySelectorAll('.tour-meta-value');
    if (metaItems.length >= 4) {
        metaItems[0].textContent = formatDate(thoiGianKhoiHanh) || 'Sắp có';
        metaItems[1].textContent = soNgay > 0 ? (soNgay === 1 ? '1 ngày' : `${soNgay} ngày ${soNgay - 1} đêm`) : 'Liên hệ';
        metaItems[2].textContent = '2 - 20 người';
        // Rating có thể lấy từ feedback API
        metaItems[3].textContent = '4.8/5 (0 đánh giá)';
    }
    
    // Update gallery
    const mainImage = document.getElementById('main-gallery-image');
    if (mainImage) {
        if (hinhAnh) {
            mainImage.src = hinhAnh;
        }
        // Update hero background
        const hero = document.querySelector('.detail-hero');
        if (hero && hinhAnh) {
            hero.style.backgroundImage = `url(${hinhAnh})`;
        }
    }
    
    // Update description
    const descriptionContent = document.querySelector('.tour-info-content');
    if (descriptionContent) {
        if (moTaChiTiet) {
            descriptionContent.innerHTML = `<p>${escapeHtml(moTaChiTiet)}</p>`;
        } else if (moTaNgan) {
            descriptionContent.innerHTML = `<p>${escapeHtml(moTaNgan)}</p>`;
        }
    }
    
    // Update price
    const priceAmount = document.querySelector('.tour-price-amount');
    if (priceAmount) {
        priceAmount.textContent = formatCurrency(giaNguoiLon);
    }
    
    // Update price note
    const priceNote = document.querySelector('.tour-price-note');
    if (priceNote && giaTreEm > 0) {
        priceNote.textContent = `/ người lớn (Trẻ em: ${formatCurrency(giaTreEm)})`;
    }
    
    // Render lịch trình từ API
    renderItinerary();
    
    // Set minimum date for booking
    const ngayKhoiHanhInput = document.getElementById('ngay-khoi-hanh');
    if (ngayKhoiHanhInput) {
        const today = new Date().toISOString().split('T')[0];
        ngayKhoiHanhInput.setAttribute('min', today);
        if (thoiGianKhoiHanh) {
            try {
                const date = new Date(thoiGianKhoiHanh);
                if (!isNaN(date.getTime())) {
                    ngayKhoiHanhInput.value = date.toISOString().split('T')[0];
                }
            } catch (e) {
                // Ignore
            }
        }
    }
}

// Render lịch trình tour từ API
function renderItinerary() {
    if (!currentTour || !currentTour.lichTrinhs || !Array.isArray(currentTour.lichTrinhs)) {
        return;
    }
    
    const itineraryContainer = document.querySelector('.tour-itinerary');
    if (!itineraryContainer) return;
    
    // Nhóm lịch trình theo ngày
    const lichTrinhByDay = {};
    currentTour.lichTrinhs.forEach(lt => {
        const ngayThu = lt.ngayThu || lt.NgayThu || 1;
        if (!lichTrinhByDay[ngayThu]) {
            lichTrinhByDay[ngayThu] = [];
        }
        lichTrinhByDay[ngayThu].push(lt);
    });
    
    // Render từng ngày
    const sortedDays = Object.keys(lichTrinhByDay).sort((a, b) => parseInt(a) - parseInt(b));
    
    itineraryContainer.innerHTML = sortedDays.map(ngayThu => {
        const lichTrinhs = lichTrinhByDay[ngayThu];
        const firstLichTrinh = lichTrinhs[0];
        const tieuDe = firstLichTrinh.tieuDe || firstLichTrinh.TieuDe || `Ngày ${ngayThu}`;
        const noiDung = firstLichTrinh.noiDung || firstLichTrinh.NoiDung || '';
        
        // Render các hoạt động trong ngày
        const activities = lichTrinhs.map(lt => {
            const thoiGian = lt.thoiGian || lt.ThoiGian || '';
            const hoaDong = lt.hoaDong || lt.HoaDong || lt.noiDung || lt.NoiDung || '';
            if (thoiGian && hoaDong) {
                return `<p><strong>${escapeHtml(thoiGian)}</strong> - ${escapeHtml(hoaDong)}</p>`;
            } else if (hoaDong) {
                return `<p>${escapeHtml(hoaDong)}</p>`;
            }
            return '';
        }).filter(Boolean).join('');
        
        return `
            <div class="itinerary-day">
                <div class="itinerary-day-header">
                    <div class="itinerary-day-number">${ngayThu}</div>
                    <h4 class="itinerary-day-title">${escapeHtml(tieuDe)}</h4>
                </div>
                <div class="itinerary-day-content">
                    ${activities || `<p>${escapeHtml(noiDung)}</p>`}
                </div>
            </div>
        `;
    }).join('');
}

// Setup booking form
function setupBookingForm() {
    const bookingForm = document.getElementById('booking-form');
    if (!bookingForm) return;
    
    bookingForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        await submitBooking();
    });
    
    // Update guests list when number changes
    const soNguoiLonInput = document.getElementById('so-nguoi-lon');
    const soTreEmInput = document.getElementById('so-tre-em');
    const guestsList = document.getElementById('guests-list');
    
    if (soNguoiLonInput && soTreEmInput && guestsList) {
        soNguoiLonInput.addEventListener('change', updateGuestsList);
        soTreEmInput.addEventListener('change', updateGuestsList);
        updateGuestsList();
    }
}

// Update guests list
function updateGuestsList() {
    const soNguoiLon = parseInt(document.getElementById('so-nguoi-lon').value) || 0;
    const soTreEm = parseInt(document.getElementById('so-tre-em').value) || 0;
    const total = soNguoiLon + soTreEm;
    const guestsList = document.getElementById('guests-list');
    
    if (!guestsList) return;
    
    if (total === 0) {
        guestsList.innerHTML = '<p class="form-hint">Vui lòng chọn số lượng khách</p>';
        return;
    }
    
    guestsList.innerHTML = '';
    
    // Add adult guests
    for (let i = 0; i < soNguoiLon; i++) {
        guestsList.insertAdjacentHTML('beforeend', createGuestFields(i, true));
    }
    
    // Add child guests
    for (let i = 0; i < soTreEm; i++) {
        guestsList.insertAdjacentHTML('beforeend', createGuestFields(soNguoiLon + i, false));
    }
}

// Create guest fields
function createGuestFields(index, isAdult = true) {
    const guestType = isAdult ? 'Người lớn' : 'Trẻ em';
    return `
        <div class="guest-info-card" data-index="${index}" data-type="${isAdult ? 'adult' : 'child'}">
            <div class="guest-card-header">
                <h4>Thông tin ${guestType} ${index + 1}</h4>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Họ và tên <span class="required">*</span></label>
                    <input type="text" class="form-input" name="guests[${index}][hoTen]" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Giới tính</label>
                    <select class="form-select" name="guests[${index}][gioiTinh]">
                        <option value="">Chọn giới tính</option>
                        <option value="Nam">Nam</option>
                        <option value="Nữ">Nữ</option>
                        <option value="Khác">Khác</option>
                    </select>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Ngày sinh</label>
                    <input type="date" class="form-input" name="guests[${index}][ngaySinh]">
                </div>
                <div class="form-group">
                    <label class="form-label">CMND/Hộ chiếu</label>
                    <input type="text" class="form-input" name="guests[${index}][cmndHoChieu]" placeholder="Số CMND hoặc hộ chiếu">
                </div>
            </div>
            <input type="hidden" name="guests[${index}][loaiKhach]" value="${isAdult ? 'Người lớn' : 'Trẻ em'}">
        </div>
    `;
}

// Submit booking
async function submitBooking() {
    try {
        // Check authentication
        const user = AuthHelper.getUser();
        if (!user || !user.nguoiDungId) {
            alert('Vui lòng đăng nhập để đặt tour');
            window.location.href = 'login.html';
            return;
        }
        
        const bookingForm = document.getElementById('booking-form');
        if (!bookingForm.checkValidity()) {
            bookingForm.reportValidity();
            return;
        }
        
        const formData = new FormData(bookingForm);
        const soNguoiLon = parseInt(formData.get('soNguoiLon')) || 0;
        const soTreEm = parseInt(formData.get('soTreEm')) || 0;
        
        if (soNguoiLon === 0) {
            alert('Vui lòng chọn ít nhất 1 người lớn');
            return;
        }
        
        // Collect guest data
        const guestsList = document.getElementById('guests-list');
        const guestCards = guestsList.querySelectorAll('.guest-info-card');
        const khachHang = [];
        
        guestCards.forEach((card, index) => {
            const hoTen = formData.get(`guests[${index}][hoTen]`);
            const cmnd = formData.get(`guests[${index}][cmndHoChieu]`) || '';
            const loaiKhach = formData.get(`guests[${index}][loaiKhach]`) || 'Người lớn';
            
            if (hoTen) {
                khachHang.push({
                    HoTen: hoTen,
                    LoaiKhach: loaiKhach,
                    CMND: cmnd
                });
            }
        });
        
        if (khachHang.length !== (soNguoiLon + soTreEm)) {
            alert('Vui lòng điền đầy đủ thông tin khách hàng');
            return;
        }
        
        // CreateBookingRequest: TourId, NguoiDungId, SoNguoiLon, SoTreEm, PhuongThucThanhToan, GhiChu, KhachHang
        const bookingData = {
            TourId: currentTourId,
            NguoiDungId: user.nguoiDungId,
            SoNguoiLon: soNguoiLon,
            SoTreEm: soTreEm,
            PhuongThucThanhToan: 'Tiền mặt',
            GhiChu: '',
            KhachHang: khachHang
        };
        
        // POST /booking/create
        const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.BOOKING_CREATE);
        const token = AuthHelper.getToken();
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(bookingData)
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            alert('Đặt tour thành công! Vui lòng chờ xác nhận từ nhân viên.');
            window.location.href = 'customer-bookings.html';
        } else {
            alert(result.message || 'Không thể đặt tour. Vui lòng thử lại sau.');
        }
    } catch (error) {
        console.error('Error submitting booking:', error);
        alert('Lỗi khi đặt tour. Vui lòng thử lại sau.');
    }
}

// Utility functions
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

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showError(message) {
    const main = document.querySelector('main');
    if (main) {
        main.innerHTML = `
            <div style="text-align: center; padding: 50px;">
                <h2>${message}</h2>
                <a href="tours.html">Quay lại danh sách tour</a>
            </div>
        `;
    }
}

// Gallery image change function
function changeGalleryImage(imageUrl) {
    const mainImage = document.getElementById('main-gallery-image');
    if (mainImage) {
        mainImage.src = imageUrl;
    }
    
    // Update active thumbnail
    const thumbs = document.querySelectorAll('.tour-gallery-thumb');
    thumbs.forEach(thumb => thumb.classList.remove('active'));
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    }
}
