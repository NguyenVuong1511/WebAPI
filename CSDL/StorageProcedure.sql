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
CREATE PROCEDURE sp_NguoiDung_Create
    @Email NVARCHAR(255),
    @MatKhau NVARCHAR(255),
    @HoTen NVARCHAR(200),
    @SoDienThoai NVARCHAR(20),
    @DiaChi NVARCHAR(300),
    @VaiTro NVARCHAR(50)
AS
BEGIN
    INSERT INTO NguoiDung (Email, MatKhau, HoTen, SoDienThoai, DiaChi, VaiTro)
    VALUES (@Email, @MatKhau, @HoTen, @SoDienThoai, @DiaChi, @VaiTro);
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