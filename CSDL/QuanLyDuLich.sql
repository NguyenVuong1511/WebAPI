USE master;
GO
CREATE DATABASE QuanLyDuLich;
GO
USE QuanLyDuLich;
GO

-----------------------------------------------------
-- 1. NGƯỜI DÙNG (Tài khoản & Phân quyền)
-----------------------------------------------------
CREATE TABLE NguoiDung (
    NguoiDungId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
    Email NVARCHAR(255) NOT NULL UNIQUE,
    MatKhau NVARCHAR(255) NOT NULL, -- Lưu text thuần theo yêu cầu bài tập
    HoTen NVARCHAR(200) NOT NULL,
    SoDienThoai NVARCHAR(20),
    DiaChi NVARCHAR(300),
    VaiTro NVARCHAR(50) DEFAULT N'Khách Hàng', -- 'Admin' hoặc 'Khách Hàng'
    TrangThai BIT DEFAULT 1, -- 1: Hoạt động, 0: Bị khóa
    NgayTao DATETIME DEFAULT GETDATE()
);

-----------------------------------------------------
-- 2. LOẠI TOUR (Phân loại để lọc dữ liệu)
-----------------------------------------------------
CREATE TABLE LoaiTour (
    LoaiTourId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
    TenLoai NVARCHAR(100) NOT NULL, -- Ví dụ: Tour Biển, Tour Núi, Tour Quốc Tế
    MoTa NVARCHAR(MAX)
);

-----------------------------------------------------
-- 3. ĐỊA ĐIỂM (Dùng cho Điểm xuất phát và Lịch trình)
-----------------------------------------------------
CREATE TABLE DiaDiem (
    DiaDiemId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
    TenDiaDiem NVARCHAR(200) NOT NULL,
    MoTa NVARCHAR(MAX)
);

-----------------------------------------------------
-- 4. TOUR (Thông tin Tour chính)
-----------------------------------------------------
CREATE TABLE Tour (
    TourId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
    TenTour NVARCHAR(300) NOT NULL,
    MoTaNgan NVARCHAR(500),
    MoTaChiTiet NVARCHAR(MAX),
    DiemXuatPhatId UNIQUEIDENTIFIER, 
    LoaiTourId UNIQUEIDENTIFIER,
    GiaNguoiLon DECIMAL(18,2) NOT NULL,
    GiaTreEm DECIMAL(18,2) DEFAULT 0,
    ThoiGianKhoiHanh NVARCHAR(100), -- Ví dụ: "Hằng tuần" hoặc "Ngày 15 hằng tháng"
    TrangThai NVARCHAR(50) DEFAULT N'Sẵn sàng', -- 'Sẵn sàng', 'Hết chỗ', 'Tạm ngưng'
    NgayTao DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (DiemXuatPhatId) REFERENCES DiaDiem(DiaDiemId),
    FOREIGN KEY (LoaiTourId) REFERENCES LoaiTour(LoaiTourId)
);

-----------------------------------------------------
-- 5. ẢNH TOUR (Gallery - Một tour có nhiều ảnh)
-----------------------------------------------------
CREATE TABLE AnhTour (
    AnhTourId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
    TourId UNIQUEIDENTIFIER NOT NULL,
    LinkAnh NVARCHAR(MAX) NOT NULL,
    IsAvatar BIT DEFAULT 0, -- Ảnh đại diện chính cho Tour
    FOREIGN KEY (TourId) REFERENCES Tour(TourId) ON DELETE CASCADE
);

-----------------------------------------------------
-- 6. LỊCH TRÌNH (Chi tiết các ngày đi)
-----------------------------------------------------
CREATE TABLE LichTrinh (
    LichTrinhId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
    TourId UNIQUEIDENTIFIER NOT NULL,
    NgayThu INT NOT NULL, -- Ngày 1, Ngày 2...
    TieuDe NVARCHAR(300),
    NoiDung NVARCHAR(MAX),
    FOREIGN KEY (TourId) REFERENCES Tour(TourId) ON DELETE CASCADE
);

-----------------------------------------------------
-- 7. BOOKING (Đơn đặt Tour)
-----------------------------------------------------
CREATE TABLE Booking (
    BookingId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
    TourId UNIQUEIDENTIFIER NOT NULL,
    NguoiDungId UNIQUEIDENTIFIER NOT NULL,
    NgayDat DATETIME DEFAULT GETDATE(),
    SoNguoiLon INT DEFAULT 1,
    SoTreEm INT DEFAULT 0,
    TongTien DECIMAL(18,2), -- Tính sẵn và lưu lại để làm báo cáo
    PhuongThucThanhToan NVARCHAR(50), -- 'Tiền mặt', 'Chuyển khoản'
    TrangThaiThanhToan NVARCHAR(50) DEFAULT N'Chờ xác nhận',
    GhiChu NVARCHAR(MAX),
    FOREIGN KEY (TourId) REFERENCES Tour(TourId),
    FOREIGN KEY (NguoiDungId) REFERENCES NguoiDung(NguoiDungId)
);

-----------------------------------------------------
-- 8. BOOKING CHI TIẾT (Danh sách hành khách đi cùng)
-----------------------------------------------------
CREATE TABLE BookingChiTiet (
    ChiTietId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
    BookingId UNIQUEIDENTIFIER NOT NULL,
    HoTen NVARCHAR(200) NOT NULL,
    LoaiKhach NVARCHAR(50), -- 'Người lớn' hoặc 'Trẻ em'
    CMND NVARCHAR(50),
    FOREIGN KEY (BookingId) REFERENCES Booking(BookingId) ON DELETE CASCADE
);

-----------------------------------------------------
-- 9. ĐÁNH GIÁ (Feedback khách hàng)
-----------------------------------------------------
CREATE TABLE DanhGia (
    DanhGiaId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
    TourId UNIQUEIDENTIFIER NOT NULL,
    NguoiDungId UNIQUEIDENTIFIER NOT NULL,
    SoSao INT CHECK (SoSao >= 1 AND SoSao <= 5),
    BinhLuan NVARCHAR(MAX),
    NgayDanhGia DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (TourId) REFERENCES Tour(TourId),
    FOREIGN KEY (NguoiDungId) REFERENCES NguoiDung(NguoiDungId)
);

-----------------------------------------------------
-- 10. TIN TỨC (Dành cho trang chủ phong phú)
-----------------------------------------------------
CREATE TABLE TinTuc (
    TinTucId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
    TieuDe NVARCHAR(300) NOT NULL,
    NoiDung NVARCHAR(MAX),
    AnhDaiDien NVARCHAR(MAX),
    NgayDang DATETIME DEFAULT GETDATE(),
    NguoiDangId UNIQUEIDENTIFIER,
    FOREIGN KEY (NguoiDangId) REFERENCES NguoiDung(NguoiDungId)
);

-----------------------------------------------------
-- 11. LIÊN HỆ (Hộp thư góp ý)
-----------------------------------------------------
CREATE TABLE LienHe (
    LienHeId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
    HoTen NVARCHAR(200),
    Email NVARCHAR(200),
    TieuDe NVARCHAR(300),
    NoiDung NVARCHAR(MAX),
    NgayGui DATETIME DEFAULT GETDATE(),
    DaXem BIT DEFAULT 0 -- Quản lý xem Admin đã đọc chưa
);