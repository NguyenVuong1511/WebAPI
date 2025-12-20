USE QuanLyDuLich;
GO

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