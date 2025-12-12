// Admin Tours Management JavaScript
let allTours = [];
let allDiaDiems = [];
let currentTourId = null;

document.addEventListener('DOMContentLoaded', function() {
    loadUserInfo();
    loadDiaDiems();
    loadTours();
    
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                loadTours();
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

function loadDiaDiems() {
    // Mock data - Địa điểm từ database
    allDiaDiems = [
        { diaDiemId: '190BD314-58DC-4587-A449-74E6F20F4955', tenDiaDiem: 'Sân bay Tân Sơn Nhất' },
        { diaDiemId: '5CA44023-B4A2-46F4-9092-A1BDE32CB988', tenDiaDiem: 'Vịnh Hạ Long' },
        { diaDiemId: '5D68A6A0-D383-4DA9-BDE3-F88B96F01E9C', tenDiaDiem: 'Phố cổ Hội An' },
        { diaDiemId: 'AEF070DF-5311-41BB-ADDA-BC4FD5A3F5B2', tenDiaDiem: 'Chợ Bến Thành' },
        { diaDiemId: 'D6266497-2549-4EBE-957B-CE05B4E2D38E', tenDiaDiem: 'Đà Lạt' }
    ];

    const select = document.getElementById('tour-diem-xuatphat');
    if (select) {
        allDiaDiems.forEach(dd => {
            const option = document.createElement('option');
            option.value = dd.diaDiemId;
            option.textContent = dd.tenDiaDiem;
            select.appendChild(option);
        });
    }
}

function loadTours() {
    // Mock data - Tours từ database
    allTours = [
        {
            tourId: '21214074-E7AA-43E3-8FE2-E3F33A8089F6',
            tenTour: 'Tour Miền Bắc: Hà Nội - Hạ Long - Sa Pa',
            moTaNgan: 'Khám phá vẻ đẹp kỳ vĩ của Vịnh Hạ Long và nét văn hóa độc đáo tại Sa Pa.',
            moTaChiTiet: 'Chi tiết hành trình 5 ngày, bao gồm tham quan Vịnh Hạ Long, leo núi Hàm Rồng, khám phá bản làng...',
            soNgay: 5,
            thoiGian_BatDau: '2025-01-15',
            thoiGian_KetThuc: '2025-01-19',
            diemXuatPhat: '190BD314-58DC-4587-A449-74E6F20F4955',
            hinhAnh: 'hinh_anh_tour_mien_bac.jpg',
            trangThai: 'Đã phát hành'
        },
        {
            tourId: '3A5B895A-3411-4F01-AABC-1D6C6D4DF3D1',
            tenTour: 'Tour Di sản Miền Trung: Đà Nẵng - Hội An - Huế',
            moTaNgan: 'Hành trình khám phá 3 Di sản Văn hóa Thế giới tại Miền Trung.',
            moTaChiTiet: 'Chi tiết hành trình 4 ngày 3 đêm, tham quan Phố cổ Hội An, Cố đô Huế, Bà Nà Hills...',
            soNgay: 4,
            thoiGian_BatDau: '2025-02-20',
            thoiGian_KetThuc: '2025-02-23',
            diemXuatPhat: '5CA44023-B4A2-46F4-9092-A1BDE32CB988',
            hinhAnh: 'hinh_anh_tour_mien_trung.jpg',
            trangThai: 'Đã phát hành'
        },
        {
            tourId: '844A695E-B3F3-47DE-A68A-E7088101B8E9',
            tenTour: 'Tour Đà Lạt: Thành phố Ngàn Hoa',
            moTaNgan: 'Tận hưởng khí hậu mát mẻ và các điểm tham quan nổi tiếng tại Đà Lạt.',
            moTaChiTiet: 'Tour 3 ngày, tham quan Thung lũng Tình Yêu, Hồ Xuân Hương, Thiền viện Trúc Lâm...',
            soNgay: 3,
            thoiGian_BatDau: '2025-03-10',
            thoiGian_KetThuc: '2025-03-12',
            diemXuatPhat: '5D68A6A0-D383-4DA9-BDE3-F88B96F01E9C',
            hinhAnh: 'hinh_anh_tour_dalat.jpg',
            trangThai: 'Đã phát hành'
        },
        {
            tourId: 'AC507766-06B7-4CB8-A129-116FBC938C11',
            tenTour: 'Tour TP.HCM - Miền Tây Sông Nước',
            moTaNgan: 'Khám phá cuộc sống sông nước và vườn trái cây Miền Tây.',
            moTaChiTiet: 'Tour 2 ngày, tham quan chợ nổi Cái Răng, lò kẹo dừa, miệt vườn...',
            soNgay: 2,
            thoiGian_BatDau: '2025-04-05',
            thoiGian_KetThuc: '2025-04-06',
            diemXuatPhat: 'AEF070DF-5311-41BB-ADDA-BC4FD5A3F5B2',
            hinhAnh: 'hinh_anh_tour_mientay.jpg',
            trangThai: 'Bản nháp'
        },
        {
            tourId: 'EAFF1F4C-EBCD-46A6-B7EB-3F131731D8B2',
            tenTour: 'Tour Côn Đảo Hồi Tưởng',
            moTaNgan: 'Khám phá lịch sử và bãi biển đẹp của Côn Đảo.',
            moTaChiTiet: 'Tour 3 ngày 2 đêm, viếng nghĩa trang Hàng Dương, tham quan bãi Đầm Trầu.',
            soNgay: 3,
            thoiGian_BatDau: '2025-05-01',
            thoiGian_KetThuc: '2025-05-03',
            diemXuatPhat: 'D6266497-2549-4EBE-957B-CE05B4E2D38E',
            hinhAnh: 'hinh_anh_tour_condao.jpg',
            trangThai: 'Đã phát hành'
        }
    ];

    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const statusFilter = document.getElementById('status-filter').value;

    const filteredTours = allTours.filter(tour => {
        const matchSearch = !searchTerm || tour.tenTour.toLowerCase().includes(searchTerm);
        const matchStatus = !statusFilter || tour.trangThai === statusFilter;
        return matchSearch && matchStatus;
    });

    renderToursTable(filteredTours);
}

function renderToursTable(tours) {
    const tbody = document.getElementById('tours-table-body');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (tours.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: var(--spacing-xl);">Không tìm thấy tour nào</td></tr>';
        return;
    }

    tours.forEach(tour => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${tour.tenTour}</td>
            <td>${tour.moTaNgan || '-'}</td>
            <td>${tour.soNgay} ngày</td>
            <td>${formatDate(tour.thoiGian_BatDau)}</td>
            <td>${formatDate(tour.thoiGian_KetThuc)}</td>
            <td><span class="status-badge ${getStatusClass(tour.trangThai)}">${tour.trangThai}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn action-btn-secondary" onclick="viewTourDetail('${tour.tourId}')">👁️ Chi tiết</button>
                    <button class="action-btn action-btn-secondary" onclick="editTour('${tour.tourId}')">✏️ Sửa</button>
                    <button class="action-btn action-btn-danger" onclick="deleteTour('${tour.tourId}')">🗑️ Xóa</button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function getStatusClass(status) {
    const statusMap = {
        'Đã phát hành': 'status-confirmed',
        'Bản nháp': 'status-pending',
        'Đã hủy': 'status-cancelled'
    };
    return statusMap[status] || 'status-pending';
}

function showAddTourModal() {
    document.getElementById('modal-title').textContent = 'Tạo Tour mới';
    document.getElementById('tour-form').reset();
    document.getElementById('tour-id').value = '';
    document.getElementById('tour-modal').classList.add('active');
}

function editTour(tourId) {
    try {
        const tour = allTours.find(t => t.tourId === tourId);
        if (!tour) {
            alert('Không tìm thấy tour');
            return;
        }

        document.getElementById('modal-title').textContent = 'Sửa Tour';
        document.getElementById('tour-id').value = tour.tourId;
        document.getElementById('tour-ten').value = tour.tenTour;
        document.getElementById('tour-mota-ngan').value = tour.moTaNgan || '';
        document.getElementById('tour-mota-chitiet').value = tour.moTaChiTiet || '';
        document.getElementById('tour-so-ngay').value = tour.soNgay;
        document.getElementById('tour-ngay-batdau').value = tour.thoiGian_BatDau || '';
        document.getElementById('tour-ngay-ketthuc').value = tour.thoiGian_KetThuc || '';
        document.getElementById('tour-diem-xuatphat').value = tour.diemXuatPhat || '';
        document.getElementById('tour-hinhanh').value = tour.hinhAnh || '';
        document.getElementById('tour-trangthai').value = tour.trangThai;
        document.getElementById('tour-modal').classList.add('active');
    } catch (error) {
        console.error('Error loading tour:', error);
        alert('Lỗi khi tải thông tin tour');
    }
}

function saveTour(event) {
    event.preventDefault();
    const tourId = document.getElementById('tour-id').value;
    alert(tourId ? 'Cập nhật tour thành công!' : 'Tạo tour thành công!');
    closeTourModal();
    loadTours();
}

function deleteTour(tourId) {
    if (!confirm('Bạn có chắc chắn muốn xóa tour này?')) return;
    alert('Xóa tour thành công!');
    loadTours();
}

function viewTourDetail(tourId) {
    currentTourId = tourId;
    const tour = allTours.find(t => t.tourId === tourId);
    if (!tour) {
        alert('Không tìm thấy tour');
        return;
    }

    document.getElementById('tour-detail-title').textContent = tour.tenTour;
    showTab('lich-trinh');
    document.getElementById('tour-detail-modal').classList.add('active');
}

function showTab(tabName) {
    // Update tab buttons
    const tabButtons = document.querySelectorAll('#tour-detail-modal .tab-button');
    tabButtons.forEach(btn => btn.classList.remove('active'));
    
    // Find and activate clicked button
    const clickedButton = event ? event.target : tabButtons[0];
    if (clickedButton) {
        clickedButton.classList.add('active');
    }

    const content = document.getElementById('tour-detail-content');
    if (!content) return;

    if (tabName === 'lich-trinh') {
        // Mock data - Lịch trình
        content.innerHTML = `
            <div style="margin-bottom: var(--spacing-md);">
                <button class="cta-button cta-secondary" onclick="addLichTrinh()">➕ Thêm lịch trình</button>
            </div>
            <table class="tour-detail-table">
                <thead>
                    <tr>
                        <th>Ngày thứ</th>
                        <th>Tiêu đề</th>
                        <th>Giờ bắt đầu</th>
                        <th>Giờ kết thúc</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>1</td>
                        <td>Khởi hành và tham quan Vịnh Hạ Long</td>
                        <td>08:00</td>
                        <td>18:00</td>
                        <td>
                            <div class="action-buttons">
                                <button class="action-btn action-btn-secondary" onclick="editLichTrinh('1')">Sửa</button>
                                <button class="action-btn action-btn-danger" onclick="deleteLichTrinh('1')">Xóa</button>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td>2</td>
                        <td>Khám phá hang động</td>
                        <td>07:30</td>
                        <td>16:00</td>
                        <td>
                            <div class="action-buttons">
                                <button class="action-btn action-btn-secondary" onclick="editLichTrinh('2')">Sửa</button>
                                <button class="action-btn action-btn-danger" onclick="deleteLichTrinh('2')">Xóa</button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        `;
    } else if (tabName === 'dia-diem') {
        // Mock data - Địa điểm
        content.innerHTML = `
            <div style="margin-bottom: var(--spacing-md);">
                <button class="cta-button cta-secondary" onclick="addDiaDiemToTour()">➕ Thêm địa điểm</button>
            </div>
            <table class="tour-detail-table">
                <thead>
                    <tr>
                        <th>Tên địa điểm</th>
                        <th>Loại</th>
                        <th>Thứ tự tham quan</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Vịnh Hạ Long</td>
                        <td>Danh lam thắng cảnh</td>
                        <td>1</td>
                        <td>
                            <div class="action-buttons">
                                <button class="action-btn action-btn-danger" onclick="removeDiaDiem('1')">Xóa</button>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td>Phố cổ Hội An</td>
                        <td>Di tích lịch sử</td>
                        <td>2</td>
                        <td>
                            <div class="action-buttons">
                                <button class="action-btn action-btn-danger" onclick="removeDiaDiem('2')">Xóa</button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        `;
    } else if (tabName === 'gia-tour') {
        // Mock data - Giá tour
        content.innerHTML = `
            <div style="margin-bottom: var(--spacing-md);">
                <button class="cta-button cta-secondary" onclick="addGiaTour()">➕ Thêm giá</button>
            </div>
            <table class="tour-detail-table">
                <thead>
                    <tr>
                        <th>Tên giá</th>
                        <th>Giá</th>
                        <th>Đơn vị</th>
                        <th>Ngày áp dụng</th>
                        <th>Trạng thái</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Giá người lớn 5N4Đ</td>
                        <td>8.500.000₫</td>
                        <td>VNĐ</td>
                        <td>01/01/2025 - 30/06/2025</td>
                        <td><span class="status-badge status-confirmed">Hoạt động</span></td>
                        <td>
                            <div class="action-buttons">
                                <button class="action-btn action-btn-secondary" onclick="editGiaTour('1')">Sửa</button>
                                <button class="action-btn action-btn-danger" onclick="deleteGiaTour('1')">Xóa</button>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td>Giá trẻ em 5N4Đ</td>
                        <td>5.000.000₫</td>
                        <td>VNĐ</td>
                        <td>01/01/2025 - 30/06/2025</td>
                        <td><span class="status-badge status-confirmed">Hoạt động</span></td>
                        <td>
                            <div class="action-buttons">
                                <button class="action-btn action-btn-secondary" onclick="editGiaTour('2')">Sửa</button>
                                <button class="action-btn action-btn-danger" onclick="deleteGiaTour('2')">Xóa</button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        `;
    }
    
    // Update tab content display
    content.classList.add('active');
}

function closeTourModal() {
    document.getElementById('tour-modal').classList.remove('active');
}

function closeTourDetailModal() {
    document.getElementById('tour-detail-modal').classList.remove('active');
}

// Placeholder functions for tour detail actions
function addLichTrinh() {
    alert('Chức năng thêm lịch trình sẽ được tích hợp sau');
}

function editLichTrinh(id) {
    alert('Chức năng sửa lịch trình sẽ được tích hợp sau');
}

function deleteLichTrinh(id) {
    if (confirm('Bạn có chắc chắn muốn xóa lịch trình này?')) {
        alert('Xóa lịch trình thành công!');
    }
}

function addDiaDiemToTour() {
    alert('Chức năng thêm địa điểm vào tour sẽ được tích hợp sau');
}

function removeDiaDiem(id) {
    if (confirm('Bạn có chắc chắn muốn xóa địa điểm này khỏi tour?')) {
        alert('Xóa địa điểm thành công!');
    }
}

function addGiaTour() {
    alert('Chức năng thêm giá tour sẽ được tích hợp sau');
}

function editGiaTour(id) {
    alert('Chức năng sửa giá tour sẽ được tích hợp sau');
}

function deleteGiaTour(id) {
    if (confirm('Bạn có chắc chắn muốn xóa giá tour này?')) {
        alert('Xóa giá tour thành công!');
    }
}

function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
}

