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
-- 6. Cập nhật mật khẩu người dùng
CREATE PROCEDURE sp_NguoiDung_DoiMatKhau
    @Email NVARCHAR(100),
    @Password NVARCHAR(255),
    @Password_new NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;

    -- 1. Kiểm tra người dùng có tồn tại và mật khẩu hiện tại có đúng không
    IF NOT EXISTS (
        SELECT 1 
        FROM NguoiDung 
        WHERE Email = @Email 
          AND MatKhau = @Password
    )
    BEGIN
        RETURN N'Mật khẩu hiện tại không đúng hoặc email không tồn tại';
    END

    -- 2. Cập nhật mật khẩu mới
    UPDATE NguoiDung
    SET MatKhau = @Password_new
    WHERE Email = @Email;

    -- 3. Thành công
    RETURN NULL;
END
GO
--- 7. Thay đổi trạng thái tài khoản
CREATE PROCEDURE sp_NguoiDung_DoiTrangThai
    @Email NVARCHAR(100),
    @TrangThai BIT
AS
BEGIN
    SET NOCOUNT ON;

    -- Kiểm tra người dùng có tồn tại không
    IF NOT EXISTS (
        SELECT 1 
        FROM NguoiDung 
        WHERE Email = @Email
    )
    BEGIN
        RETURN N'Người dùng không tồn tại';
    END

    -- Cập nhật trạng thái
    UPDATE NguoiDung
    SET TrangThai = @TrangThai
    WHERE Email = @Email;

    RETURN NULL;
END
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

USE QuanLyDuLich;
GO

-- 1. Lấy danh sách đánh giá theo Tour (Kèm tên người dùng)
CREATE PROCEDURE sp_DanhGia_GetByTourId
    @TourId UNIQUEIDENTIFIER
AS
BEGIN
    SELECT 
        dg.DanhGiaId,
        dg.TourId,
        dg.NguoiDungId,
        nd.HoTen AS TenNguoiDung, -- Join để lấy tên hiển thị lên UI
        nd.Email,
        dg.SoSao,
        dg.BinhLuan,
        dg.NgayDanhGia
    FROM DanhGia dg
    INNER JOIN NguoiDung nd ON dg.NguoiDungId = nd.NguoiDungId
    WHERE dg.TourId = @TourId
    ORDER BY dg.NgayDanhGia DESC;
END
GO

-- 2. Thêm mới đánh giá
CREATE PROCEDURE sp_DanhGia_Insert
    @TourId UNIQUEIDENTIFIER,
    @NguoiDungId UNIQUEIDENTIFIER,
    @SoSao INT,
    @BinhLuan NVARCHAR(MAX)
AS
BEGIN
    INSERT INTO DanhGia (TourId, NguoiDungId, SoSao, BinhLuan, NgayDanhGia)
    VALUES (@TourId, @NguoiDungId, @SoSao, @BinhLuan, GETDATE());
END
GO

-- 3. Xóa đánh giá (Dành cho Admin nếu vi phạm)
CREATE PROCEDURE sp_DanhGia_Delete
    @DanhGiaId UNIQUEIDENTIFIER
AS
BEGIN
    DELETE FROM DanhGia WHERE DanhGiaId = @DanhGiaId;
END
GO

USE QuanLyDuLich;
GO

-- 1. Gửi liên hệ (Dành cho Khách hàng/Guest)
CREATE OR ALTER PROCEDURE sp_LienHe_Insert
    @HoTen NVARCHAR(200),
    @Email NVARCHAR(200),
    @TieuDe NVARCHAR(300),
    @NoiDung NVARCHAR(MAX)
AS
BEGIN
    INSERT INTO LienHe (HoTen, Email, TieuDe, NoiDung, NgayGui, DaXem)
    VALUES (@HoTen, @Email, @TieuDe, @NoiDung, GETDATE(), 0);
END
GO

-- 2. Lấy danh sách liên hệ (Dành cho Admin)
CREATE OR ALTER PROCEDURE sp_LienHe_GetAll
AS
BEGIN
    SELECT LienHeId, HoTen, Email, TieuDe, NoiDung, NgayGui, DaXem
    FROM LienHe
    ORDER BY DaXem ASC, NgayGui DESC; -- Ưu tiên hiện tin chưa xem trước, mới nhất lên đầu
END
GO

-- 3. Đánh dấu đã xem (Dành cho Admin)
CREATE OR ALTER PROCEDURE sp_LienHe_MarkAsRead
    @LienHeId UNIQUEIDENTIFIER
AS
BEGIN
    UPDATE LienHe
    SET DaXem = 1
    WHERE LienHeId = @LienHeId;
END
GO

-- 4. Xóa liên hệ (Nếu cần dọn dẹp spam)
CREATE OR ALTER PROCEDURE sp_LienHe_Delete
    @LienHeId UNIQUEIDENTIFIER
AS
BEGIN
    DELETE FROM LienHe WHERE LienHeId = @LienHeId;
END
GO

USE QuanLyDuLich;
GO

CREATE OR ALTER PROCEDURE sp_ThongKe_Dashboard
AS
BEGIN
    SET NOCOUNT ON;

    -- BẢNG 1: SỐ LIỆU TỔNG QUÁT (Doanh thu & Số booking tháng này)
    SELECT 
        -- Tổng doanh thu (Chỉ tính các đơn KHÔNG PHẢI trạng thái 'Hủy' hoặc 'Chờ xác nhận' nếu muốn chặt chẽ hơn)
        ISNULL(SUM(CASE WHEN TrangThaiThanhToan = N'Đã thanh toán' THEN TongTien ELSE 0 END), 0) AS TongDoanhThu,
        
        -- Tổng số Booking trong tháng hiện tại
        (SELECT COUNT(BookingId) 
         FROM Booking 
         WHERE MONTH(NgayDat) = MONTH(GETDATE()) 
           AND YEAR(NgayDat) = YEAR(GETDATE())) AS BookingTrongThang,

        -- Tổng số khách hàng (User)
        (SELECT COUNT(NguoiDungId) FROM NguoiDung WHERE VaiTro = N'Khách Hàng') AS TongKhachHang

    FROM Booking;

    -- BẢNG 2: TOP 5 TOUR NỔI BẬT (Được đặt nhiều nhất)
    SELECT TOP 5 
        t.TenTour,
        t.GiaNguoiLon,
        COUNT(b.BookingId) AS SoLuotDat,
        ISNULL(SUM(b.TongTien), 0) AS DoanhThuTour
    FROM Booking b
    INNER JOIN Tour t ON b.TourId = t.TourId
    WHERE b.TrangThaiThanhToan <> N'Hủy' -- Không tính đơn hủy
    GROUP BY t.TenTour, t.GiaNguoiLon
    ORDER BY COUNT(b.BookingId) DESC;
END
GO