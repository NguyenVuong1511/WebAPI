USE QuanLyDuLich;
GO
--------------------------------------------------------------------------ĐÀO THỊ THANH-------------------------------------------------------------------------------
-----------------------------------------------------
-- 1. THỦ TỤC ĐĂNG KÝ (Register)
-----------------------------------------------------
CREATE OR ALTER PROCEDURE sp_NguoiDung_DangKy
    @Email NVARCHAR(255),
    @MatKhau NVARCHAR(255),
    @HoTen NVARCHAR(200)
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Kiểm tra xem Email đã tồn tại chưa
    IF EXISTS (SELECT 1 FROM NguoiDung WHERE Email = @Email)
    BEGIN
        RAISERROR(N'Email này đã được sử dụng!', 16, 1);
        RETURN;
    END

    -- Chèn dữ liệu mới (NguoiDungId tự sinh nhờ DEFAULT NEWSEQUENTIALID)
    INSERT INTO NguoiDung (Email, MatKhau, HoTen, VaiTro, TrangThai)
    VALUES (@Email, @MatKhau, @HoTen, N'Khách Hàng', 1);
END
GO

-----------------------------------------------------
-- 2. THỦ TỤC ĐĂNG NHẬP (Login)
-----------------------------------------------------
CREATE OR ALTER PROCEDURE sp_NguoiDung_DangNhap
    @Email NVARCHAR(255),
    @MatKhau NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;

    -- Lấy thông tin người dùng nếu khớp Email, Mật khẩu và tài khoản không bị khóa
    SELECT NguoiDungId, Email, HoTen, VaiTro
    FROM NguoiDung
    WHERE Email = @Email 
      AND MatKhau = @MatKhau 
      AND TrangThai = 1;
END
GO

---------------------------------------------------------
---3. THỦ TỤC LẤY HẾT DANH SÁCH NGƯỜI DÙNG
---------------------------------------------------------
USE QuanLyDuLich;
GO

-- 1. Lấy danh sách người dùng (có phân trang hoặc lấy hết)
CREATE PROCEDURE sp_NguoiDung_GetAll
AS
BEGIN
    SELECT NguoiDungId, Email, HoTen, SoDienThoai, DiaChi, VaiTro, TrangThai, NgayTao
    FROM NguoiDung
    ORDER BY NgayTao DESC;
END;
GO

-- 2. Lấy chi tiết 1 người dùng
CREATE PROCEDURE sp_NguoiDung_GetById
    @Id UNIQUEIDENTIFIER
AS
BEGIN
    SELECT NguoiDungId, Email, HoTen, SoDienThoai, DiaChi, VaiTro, TrangThai, NgayTao
    FROM NguoiDung
    WHERE NguoiDungId = @Id;
END;
GO

-- 3. Thêm mới người dùng (Register)
CREATE OR ALTER PROCEDURE sp_NguoiDung_Create 
    @Email NVARCHAR(255),
    @MatKhau NVARCHAR(255),
    @HoTen NVARCHAR(200),
    @SoDienThoai NVARCHAR(20),
    @DiaChi NVARCHAR(300),
    @VaiTro NVARCHAR(50),
	@TrangThai BIT
AS
BEGIN
    INSERT INTO NguoiDung (Email, MatKhau, HoTen, SoDienThoai, DiaChi, VaiTro, TrangThai)
    VALUES (@Email, @MatKhau, @HoTen, @SoDienThoai, @DiaChi, @VaiTro, @TrangThai);
END;
GO


-- 4. Cập nhật thông tin người dùng
CREATE PROCEDURE sp_NguoiDung_Update
    @NguoiDungId UNIQUEIDENTIFIER,
    @HoTen NVARCHAR(200),
    @SoDienThoai NVARCHAR(20),
    @DiaChi NVARCHAR(300),
    @TrangThai BIT
AS
BEGIN
    UPDATE NguoiDung
    SET HoTen = @HoTen,
        SoDienThoai = @SoDienThoai,
        DiaChi = @DiaChi,
        TrangThai = @TrangThai
    WHERE NguoiDungId = @NguoiDungId;
END;
GO

-- 5. Xóa người dùng (Nên xóa mềm - đổi trạng thái, nhưng ở đây làm xóa cứng nếu cần)
CREATE PROCEDURE sp_NguoiDung_Delete
    @NguoiDungId UNIQUEIDENTIFIER
AS
BEGIN
    DELETE FROM NguoiDung WHERE NguoiDungId = @NguoiDungId;
END;
GO

--------------------------------------------------------------------------NGUYỄN MINH VƯƠNG-------------------------------------------------------------------------------
USE QuanLyDuLich;
GO

-- 1. Thêm mới Booking (Header)
CREATE OR ALTER PROCEDURE sp_Booking_Insert
    @BookingId UNIQUEIDENTIFIER,
    @TourId UNIQUEIDENTIFIER,
    @NguoiDungId UNIQUEIDENTIFIER,
    @SoNguoiLon INT,
    @SoTreEm INT,
    @TongTien DECIMAL(18,2),
    @PhuongThucThanhToan NVARCHAR(50),
    @GhiChu NVARCHAR(MAX)
AS
BEGIN
    INSERT INTO Booking (BookingId, TourId, NguoiDungId, SoNguoiLon, SoTreEm, TongTien, PhuongThucThanhToan, TrangThaiThanhToan, GhiChu, NgayDat)
    VALUES (@BookingId, @TourId, @NguoiDungId, @SoNguoiLon, @SoTreEm, @TongTien, @PhuongThucThanhToan, N'Chờ xác nhận', @GhiChu, GETDATE());
END
GO

-- 2. Thêm chi tiết hành khách (Booking Detail)
CREATE OR ALTER PROCEDURE sp_BookingChiTiet_Insert
    @BookingId UNIQUEIDENTIFIER,
    @HoTen NVARCHAR(200),
    @LoaiKhach NVARCHAR(50),
    @CMND NVARCHAR(50)
AS
BEGIN
    INSERT INTO BookingChiTiet (BookingId, HoTen, LoaiKhach, CMND)
    VALUES (@BookingId, @HoTen, @LoaiKhach, @CMND);
END
GO

-- 3. Lấy lịch sử đặt tour của Khách hàng (Kèm tên Tour)
CREATE OR ALTER PROCEDURE sp_Booking_GetByUserId
    @NguoiDungId UNIQUEIDENTIFIER
AS
BEGIN
    SELECT b.*, t.TenTour, t.ThoiGianKhoiHanh
    FROM Booking b
    INNER JOIN Tour t ON b.TourId = t.TourId
    WHERE b.NguoiDungId = @NguoiDungId
    ORDER BY b.NgayDat DESC;
END
GO

-- 4. Lấy tất cả đơn hàng (Dành cho Admin)
CREATE OR ALTER PROCEDURE sp_Booking_GetAll
AS
BEGIN
    SELECT b.*, t.TenTour, nd.Email, nd.HoTen as NguoiDat
    FROM Booking b
    INNER JOIN Tour t ON b.TourId = t.TourId
    INNER JOIN NguoiDung nd ON b.NguoiDungId = nd.NguoiDungId
    ORDER BY b.NgayDat DESC;
END
GO

-- 5. Lấy chi tiết đơn hàng (Gồm danh sách hành khách)
CREATE OR ALTER PROCEDURE sp_Booking_GetById
    @BookingId UNIQUEIDENTIFIER
AS
BEGIN
    -- Result set 1: Thông tin chung
    SELECT b.*, t.TenTour, t.GiaNguoiLon, t.GiaTreEm
    FROM Booking b
    INNER JOIN Tour t ON b.TourId = t.TourId
    WHERE b.BookingId = @BookingId;

    -- Result set 2: Danh sách khách
    SELECT * FROM BookingChiTiet WHERE BookingId = @BookingId;
END
GO

-- 6. Cập nhật trạng thái (Duyệt hoặc Hủy)
CREATE OR ALTER PROCEDURE sp_Booking_UpdateStatus
    @BookingId UNIQUEIDENTIFIER,
    @TrangThaiThanhToan NVARCHAR(50)
AS
BEGIN
    UPDATE Booking
    SET TrangThaiThanhToan = @TrangThaiThanhToan
    WHERE BookingId = @BookingId;
END
GO

-- 7. Lấy giá Tour để tính toán (Bảo mật: không tin tưởng giá từ FE gửi lên)
CREATE OR ALTER PROCEDURE sp_Tour_GetPrice
    @TourId UNIQUEIDENTIFIER
AS
BEGIN
    SELECT GiaNguoiLon, GiaTreEm FROM Tour WHERE TourId = @TourId;
END
GO