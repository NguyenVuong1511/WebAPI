USE QuanLyDuLich;
GO

-- Xóa dữ liệu cũ nếu có (chạy theo thứ tự ngược lại của khóa ngoại)
DELETE FROM LienHe;
DELETE FROM TinTuc;
DELETE FROM DanhGia;
DELETE FROM BookingChiTiet;
DELETE FROM Booking;
DELETE FROM LichTrinh;
DELETE FROM AnhTour;
DELETE FROM Tour;
DELETE FROM DiaDiem;
DELETE FROM LoaiTour;
DELETE FROM NguoiDung;
GO

-----------------------------------------------------
-- 1. CHÈN DỮ LIỆU BẢNG: NguoiDung (5 bản ghi)
-----------------------------------------------------
INSERT INTO NguoiDung (Email, MatKhau, HoTen, SoDienThoai, VaiTro) VALUES
(N'admin@gmail.com', N'admin123', N'Quản Trị Viên', N'0901234567', N'Admin'),
(N'khachhang1@gmail.com', N'123456', N'Nguyễn Văn A', N'0911111111', N'Khách Hàng'),
(N'khachhang2@gmail.com', N'123456', N'Trần Thị B', N'0922222222', N'Khách Hàng'),
(N'khachhang3@gmail.com', N'123456', N'Lê Văn C', N'0933333333', N'Khách Hàng'),
(N'nhanvien1@gmail.com', N'123456', N'Phạm Văn D', N'0944444444', N'Khách Hàng');

-----------------------------------------------------
-- 2. CHÈN DỮ LIỆU BẢNG: LoaiTour (5 bản ghi)
-----------------------------------------------------
INSERT INTO LoaiTour (TenLoai, MoTa) VALUES
(N'Tour Biển', N'Khám phá các bãi biển đẹp nhất Việt Nam'),
(N'Tour Núi', N'Trải nghiệm leo núi và không khí trong lành'),
(N'Tour Văn Hóa', N'Tìm hiểu di tích lịch sử và văn hóa địa phương'),
(N'Tour Quốc Tế', N'Du lịch các nước khu vực Châu Á'),
(N'Tour Nghỉ Dưỡng', N'Thư giãn tại các Resort cao cấp');

-----------------------------------------------------
-- 3. CHÈN DỮ LIỆU BẢNG: DiaDiem (5 bản ghi)
-----------------------------------------------------
INSERT INTO DiaDiem (TenDiaDiem, MoTa) VALUES
(N'Đà Nẵng', N'Thành phố đáng sống nhất Việt Nam'),
(N'Nha Trang', N'Vịnh biển đẹp nhất thế giới'),
(N'Sapa', N'Thành phố trong sương'),
(N'Phú Quốc', N'Đảo ngọc phương Nam'),
(N'Hà Nội', N'Thủ đô ngàn năm văn hiến');

-----------------------------------------------------
-- 4. CHÈN DỮ LIỆU BẢNG: Tour (5 bản ghi)
-----------------------------------------------------
-- Lấy ID mẫu để gắn kết dữ liệu
DECLARE @DiemDN UNIQUEIDENTIFIER = (SELECT TOP 1 DiaDiemId FROM DiaDiem WHERE TenDiaDiem = N'Đà Nẵng');
DECLARE @LoaiBien UNIQUEIDENTIFIER = (SELECT TOP 1 LoaiTourId FROM LoaiTour WHERE TenLoai = N'Tour Biển');

INSERT INTO Tour (TenTour, MoTaNgan, DiemXuatPhatId, LoaiTourId, GiaNguoiLon, GiaTreEm, ThoiGianKhoiHanh) VALUES
(N'Đà Nẵng - Hội An 3 ngày 2 đêm', N'Khám phá phố cổ Hội An và biển Mỹ Khê', @DiemDN, @LoaiBien, 3500000, 1750000, N'Thứ 6 hàng tuần'),
(N'Nha Trang Biển Gọi', N'Lặn ngắm san hô tại hòn Mun', (SELECT DiaDiemId FROM DiaDiem WHERE TenDiaDiem = N'Hà Nội'), @LoaiBien, 4200000, 2100000, N'Hàng ngày'),
(N'Sapa - Fansipan Huyền Thoại', N'Chinh phục nóc nhà Đông Dương', @DiemDN, (SELECT LoaiTourId FROM LoaiTour WHERE TenLoai = N'Tour Núi'), 2800000, 1400000, N'Thứ 7 hàng tuần'),
(N'Phú Quốc Nắng Vàng', N'Trải nghiệm cáp treo vượt biển dài nhất', @DiemDN, @LoaiBien, 5500000, 2750000, N'Ngày 15 hàng tháng'),
(N'Hà Nội - Hạ Long', N'Tham quan di sản thiên nhiên thế giới', (SELECT DiaDiemId FROM DiaDiem WHERE TenDiaDiem = N'Hà Nội'), (SELECT LoaiTourId FROM LoaiTour WHERE TenLoai = N'Tour Văn Hóa'), 2200000, 1100000, N'Chủ nhật hàng tuần');

-----------------------------------------------------
-- 5. CHÈN DỮ LIỆU BẢNG: AnhTour (5 bản ghi)
-----------------------------------------------------
INSERT INTO AnhTour (TourId, LinkAnh, IsAvatar)
SELECT TOP 5 TourId, 'https://picsum.photos/800/600', 1 FROM Tour;

-----------------------------------------------------
-- 6. CHÈN DỮ LIỆU BẢNG: LichTrinh (5 bản ghi)
-----------------------------------------------------
INSERT INTO LichTrinh (TourId, NgayThu, TieuDe, NoiDung)
SELECT TOP 5 TourId, 1, N'Ngày khởi hành', N'Tập trung tại điểm hẹn và di chuyển' FROM Tour;

-----------------------------------------------------
-- 7. CHÈN DỮ LIỆU BẢNG: Booking (5 bản ghi)
-----------------------------------------------------
INSERT INTO Booking (TourId, NguoiDungId, TongTien, PhuongThucThanhToan, TrangThaiThanhToan)
SELECT TOP 5 
    (SELECT TOP 1 TourId FROM Tour), 
    NguoiDungId, 
    5000000, 
    N'Chuyển khoản', 
    N'Đã thanh toán' 
FROM NguoiDung WHERE VaiTro = N'Khách Hàng';

-----------------------------------------------------
-- 8. CHÈN DỮ LIỆU BẢNG: BookingChiTiet (5 bản ghi)
-----------------------------------------------------
INSERT INTO BookingChiTiet (BookingId, HoTen, LoaiKhach, CMND)
SELECT TOP 5 BookingId, N'Khách đi cùng ' + CAST(ROW_NUMBER() OVER(ORDER BY BookingId) AS NVARCHAR), N'Người lớn', '0123456789' FROM Booking;

-----------------------------------------------------
-- 9. CHÈN DỮ LIỆU BẢNG: DanhGia (5 bản ghi)
-----------------------------------------------------
INSERT INTO DanhGia (TourId, NguoiDungId, SoSao, BinhLuan)
SELECT TOP 5 
    (SELECT TOP 1 TourId FROM Tour), 
    NguoiDungId, 
    5, 
    N'Chuyến đi rất tuyệt vời, hướng dẫn viên nhiệt tình!' 
FROM NguoiDung WHERE VaiTro = N'Khách Hàng';

-----------------------------------------------------
-- 10. CHÈN DỮ LIỆU BẢNG: TinTuc (5 bản ghi)
-----------------------------------------------------
DECLARE @AdminId UNIQUEIDENTIFIER = (SELECT TOP 1 NguoiDungId FROM NguoiDung WHERE VaiTro = 'Admin');

INSERT INTO TinTuc (TieuDe, NoiDung, AnhDaiDien, NguoiDangId) VALUES
(N'Top 5 điểm đến mùa hè 2024', N'Nội dung tin tức 1...', 'news1.jpg', @AdminId),
(N'Kinh nghiệm du lịch Sapa tự túc', N'Nội dung tin tức 2...', 'news2.jpg', @AdminId),
(N'Cẩm nang đi biển mùa đông', N'Nội dung tin tức 3...', 'news3.jpg', @AdminId),
(N'Khuyến mãi tour Tết 2025', N'Nội dung tin tức 4...', 'news4.jpg', @AdminId),
(N'Những món ăn phải thử khi đến Hội An', N'Nội dung tin tức 5...', 'news5.jpg', @AdminId);

-----------------------------------------------------
-- 11. CHÈN DỮ LIỆU BẢNG: LienHe (5 bản ghi)
-----------------------------------------------------
INSERT INTO LienHe (HoTen, Email, TieuDe, NoiDung) VALUES
(N'Người gửi A', 'a@gmail.com', N'Tư vấn tour', N'Tôi muốn tư vấn tour Đà Nẵng'),
(N'Người gửi B', 'b@gmail.com', N'Hỗ trợ đặt tour', N'Lỗi khi thanh toán'),
(N'Người gửi C', 'c@gmail.com', N'Hợp tác', N'Muốn làm đại lý'),
(N'Người gửi D', 'd@gmail.com', N'Góp ý', N'Web rất đẹp'),
(N'Người gửi E', 'e@gmail.com', N'Khiếu nại', N'Xe đón muộn');

SELECT 'Hoàn thành chèn dữ liệu mẫu!' AS Status;