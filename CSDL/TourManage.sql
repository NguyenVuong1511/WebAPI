
﻿use QuanLyDuLich
GO

----------------------------------------------------------------
-- ------------------------- LOAI TOUR -------------------------
----------------------------------------------------------------
CREATE PROCEDURE sp_GetAllLoaiTour
AS
BEGIN
    SET NOCOUNT ON;

    SELECT LoaiTourId, TenLoai, MoTa
    FROM LoaiTour
    ORDER BY TenLoai;
END;
GO


CREATE PROCEDURE sp_GetLoaiTourById
    @LoaiTourId UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;

    SELECT LoaiTourId, TenLoai, MoTa
    FROM LoaiTour
    WHERE LoaiTourId = @LoaiTourId;
END;
GO

CREATE PROCEDURE dbo.sp_AddLoaiTour
    @TenLoai NVARCHAR(100),
    @MoTa NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        -- Validate sớm (tránh NULL/whitespace)
        IF @TenLoai IS NULL OR LEN(LTRIM(RTRIM(@TenLoai))) = 0
        BEGIN
            RAISERROR(N'Tên loại không được để trống', 16, 1);
            RETURN;
        END

        -- Normalize TenLoai: trim + gộp nhiều khoảng trắng
        SET @TenLoai = LTRIM(RTRIM(@TenLoai));
        WHILE CHARINDEX(N'  ', @TenLoai) > 0
            SET @TenLoai = REPLACE(@TenLoai, N'  ', N' ');

        IF LEN(@TenLoai) > 100
        BEGIN
            RAISERROR(N'Tên loại tối đa 100 ký tự', 16, 1);
            RETURN;
        END

        IF EXISTS (SELECT 1 FROM LoaiTour WHERE TenLoai = @TenLoai)
        BEGIN
            RAISERROR(N'Tên loại tour này đã tồn tại!', 16, 1);
            RETURN;
        END

        INSERT INTO LoaiTour (TenLoai, MoTa)
        VALUES (@TenLoai, @MoTa);
    END TRY
    BEGIN CATCH
        -- Unique violation
        IF ERROR_NUMBER() IN (2601, 2627)
        BEGIN
            RAISERROR(N'Tên loại tour này đã tồn tại!', 16, 1);
            RETURN;
        END

        DECLARE @Msg NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR(@Msg, 16, 1);
    END CATCH
END;
GO


CREATE PROCEDURE dbo.sp_UpdateLoaiTour
    @LoaiTourId UNIQUEIDENTIFIER,
    @TenLoai NVARCHAR(100),
    @MoTa NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        -- Validate sớm TenLoai
        IF @TenLoai IS NULL OR LEN(LTRIM(RTRIM(@TenLoai))) = 0
        BEGIN
            RAISERROR(N'Tên loại không được để trống', 16, 1);
            RETURN;
        END

        -- Normalize TenLoai
        SET @TenLoai = LTRIM(RTRIM(@TenLoai));
        WHILE CHARINDEX(N'  ', @TenLoai) > 0
            SET @TenLoai = REPLACE(@TenLoai, N'  ', N' ');

        IF LEN(@TenLoai) > 100
        BEGIN
            RAISERROR(N'Tên loại tối đa 100 ký tự', 16, 1);
            RETURN;
        END

        -- Check tồn tại
        IF NOT EXISTS (SELECT 1 FROM LoaiTour WHERE LoaiTourId = @LoaiTourId)
        BEGIN
            RAISERROR(N'Không tìm thấy loại tour', 16, 1);
            RETURN;
        END

        -- Check trùng (trừ chính nó)
        IF EXISTS (SELECT 1 FROM LoaiTour WHERE TenLoai = @TenLoai AND LoaiTourId <> @LoaiTourId)
        BEGIN
            RAISERROR(N'Tên loại tour này đã tồn tại!', 16, 1);
            RETURN;
        END

        UPDATE LoaiTour
        SET TenLoai = @TenLoai,
            MoTa = @MoTa
        WHERE LoaiTourId = @LoaiTourId;
    END TRY
    BEGIN CATCH
        IF ERROR_NUMBER() IN (2601, 2627)
        BEGIN
            RAISERROR(N'Tên loại tour này đã tồn tại!', 16, 1);
            RETURN;
        END

        DECLARE @Msg NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR(@Msg, 16, 1);
    END CATCH
END;
GO


CREATE PROCEDURE sp_DeleteLoaiTour
    @LoaiTourId UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        IF NOT EXISTS (SELECT 1 FROM LoaiTour WHERE LoaiTourId = @LoaiTourId)
        BEGIN
            RAISERROR(N'Không tìm thấy loại tour', 16, 1);
            RETURN;
        END

        -- Nếu đang có Tour tham chiếu thì chặn luôn (message sạch)
        IF EXISTS (SELECT 1 FROM Tour WHERE LoaiTourId = @LoaiTourId)
        BEGIN
            RAISERROR(N'Loại tour đang được sử dụng, không thể xoá', 16, 1);
            RETURN;
        END

        DELETE FROM LoaiTour
        WHERE LoaiTourId = @LoaiTourId;
    END TRY
    BEGIN CATCH
        -- FK constraint (phòng trường hợp vẫn dính FK)
        IF ERROR_NUMBER() = 547
        BEGIN
            RAISERROR(N'Loại tour đang được sử dụng, không thể xoá', 16, 1);
            RETURN;
        END

        DECLARE @Msg NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR(@Msg, 16, 1);
    END CATCH
END;
GO

IF OBJECT_ID(N'dbo.sp_GetAllLoaiTour', N'P') IS NOT NULL DROP PROCEDURE dbo.sp_GetAllLoaiTour;
IF OBJECT_ID(N'dbo.sp_AddLoaiTour',    N'P') IS NOT NULL DROP PROCEDURE dbo.sp_AddLoaiTour;
IF OBJECT_ID(N'dbo.sp_UpdateLoaiTour', N'P') IS NOT NULL DROP PROCEDURE dbo.sp_UpdateLoaiTour;
IF OBJECT_ID(N'dbo.sp_DeleteLoaiTour', N'P') IS NOT NULL DROP PROCEDURE dbo.sp_DeleteLoaiTour;
IF OBJECT_ID(N'dbo.sp_GetLoaiTourById',N'P') IS NOT NULL DROP PROCEDURE dbo.sp_GetLoaiTourById;
GO


------------------------------------------------------------------------------
-----------------------------TOUR-----------------------------------------------
---------------------------------------------------------------------------------
CREATE PROCEDURE sp_GetAllTour
    @Keyword NVARCHAR(300) = NULL
AS
BEGIN
    SELECT
        TourId,
        TenTour,
        MoTaNgan,
        MoTaChiTiet,
        DiemXuatPhatId,
        LoaiTourId,
        GiaNguoiLon,
        GiaTreEm,
        ThoiGianKhoiHanh,
        TrangThai,
        NgayTao
    FROM Tour
    WHERE
        @Keyword IS NULL
        OR TenTour LIKE N'%' + @Keyword + N'%'
    ORDER BY NgayTao DESC;
END;
GO


CREATE PROCEDURE [dbo].[sp_GetAllTour_Sort]
    @Keyword NVARCHAR(300) = NULL,
    @SortBy NVARCHAR(50) = N'NgayTao',   -- TenTour | NgayTao | GiaNguoiLon | GiaTreEm
    @SortDir NVARCHAR(4)  = N'DESC'      -- ASC | DESC
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        TourId,
        TenTour,
        MoTaNgan,
        MoTaChiTiet,
        DiemXuatPhatId,
        LoaiTourId,
        GiaNguoiLon,
        GiaTreEm,
        ThoiGianKhoiHanh,
        TrangThai,
        NgayTao
    FROM Tour
    WHERE
        @Keyword IS NULL
        OR TenTour LIKE N'%' + @Keyword + N'%'
    ORDER BY
        -- TenTour
        CASE WHEN @SortBy = N'TenTour' AND @SortDir = N'ASC'  THEN TenTour END ASC,
        CASE WHEN @SortBy = N'TenTour' AND @SortDir = N'DESC' THEN TenTour END DESC,

        -- NgayTao
        CASE WHEN @SortBy = N'NgayTao' AND @SortDir = N'ASC'  THEN NgayTao END ASC,
        CASE WHEN @SortBy = N'NgayTao' AND @SortDir = N'DESC' THEN NgayTao END DESC,

        -- GiaNguoiLon
        CASE WHEN @SortBy = N'GiaNguoiLon' AND @SortDir = N'ASC'  THEN GiaNguoiLon END ASC,
        CASE WHEN @SortBy = N'GiaNguoiLon' AND @SortDir = N'DESC' THEN GiaNguoiLon END DESC,

        -- GiaTreEm
        CASE WHEN @SortBy = N'GiaTreEm' AND @SortDir = N'ASC'  THEN GiaTreEm END ASC,
        CASE WHEN @SortBy = N'GiaTreEm' AND @SortDir = N'DESC' THEN GiaTreEm END DESC,

        -- fallback mặc định
        NgayTao DESC;
END
GO

CREATE PROCEDURE sp_GetTourById
    @TourId UNIQUEIDENTIFIER
AS
BEGIN
    SELECT
        TourId,
        TenTour,
        MoTaNgan,
        MoTaChiTiet,
        DiemXuatPhatId,
        LoaiTourId,
        GiaNguoiLon,
        GiaTreEm,
        ThoiGianKhoiHanh,
        TrangThai,
        NgayTao
    FROM Tour
    WHERE TourId = @TourId;
END;
GO


CREATE PROCEDURE [dbo].[sp_AddTour]
    @TenTour NVARCHAR(300),
    @MoTaNgan NVARCHAR(500),
    @MoTaChiTiet NVARCHAR(MAX),
    @DiemXuatPhatId UNIQUEIDENTIFIER,
    @LoaiTourId UNIQUEIDENTIFIER,
    @GiaNguoiLon DECIMAL(18,2),
    @GiaTreEm DECIMAL(18,2),
    @ThoiGianKhoiHanh NVARCHAR(100),
    @TrangThai NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    -- 1. Trùng tên tour
    IF EXISTS (SELECT 1 FROM Tour WHERE TenTour = @TenTour)
    BEGIN
        RAISERROR(N'Tên tour này đã tồn tại!', 16, 1);
        RETURN;
    END

    -- 2. Giá người lớn không được < 0
    IF @GiaNguoiLon < 0
    BEGIN
        RAISERROR(N'Giá người lớn không được nhỏ hơn 0!', 16, 1);
        RETURN;
    END

    -- 3. Giá trẻ em không được < 0
    IF ISNULL(@GiaTreEm, 0) < 0
    BEGIN
        RAISERROR(N'Giá trẻ em không được nhỏ hơn 0!', 16, 1);
        RETURN;
    END

    -- 4. Giá trẻ em phải nhỏ hơn giá người lớn
    IF ISNULL(@GiaTreEm, 0) >= @GiaNguoiLon
    BEGIN
        RAISERROR(N'Giá trẻ em phải nhỏ hơn giá người lớn!', 16, 1);
        RETURN;
    END

    -- 5. Insert dữ liệu
    INSERT INTO Tour
    (
        TenTour,
        MoTaNgan,
        MoTaChiTiet,
        DiemXuatPhatId,
        LoaiTourId,
        GiaNguoiLon,
        GiaTreEm,
        ThoiGianKhoiHanh,
        TrangThai
    )
    VALUES
    (
        @TenTour,
        @MoTaNgan,
        @MoTaChiTiet,
        @DiemXuatPhatId,
        @LoaiTourId,
        @GiaNguoiLon,
        ISNULL(@GiaTreEm, 0),
        @ThoiGianKhoiHanh,
        ISNULL(@TrangThai, N'Sẵn sàng')
    );
END
GO

CREATE PROCEDURE [dbo].[sp_UpdateTour]
    @TourId UNIQUEIDENTIFIER,
    @TenTour NVARCHAR(300),
    @MoTaNgan NVARCHAR(500),
    @MoTaChiTiet NVARCHAR(MAX),
    @DiemXuatPhatId UNIQUEIDENTIFIER,
    @LoaiTourId UNIQUEIDENTIFIER,
    @GiaNguoiLon DECIMAL(18,2),
    @GiaTreEm DECIMAL(18,2),
    @ThoiGianKhoiHanh NVARCHAR(100),
    @TrangThai NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    -- 1. Kiểm tra tồn tại Tour
    IF NOT EXISTS (
        SELECT 1 
        FROM Tour 
        WHERE TourId = @TourId
    )
    BEGIN
        RAISERROR(N'Không tìm thấy tour cần cập nhật!', 16, 1);
        RETURN;
    END

    -- 2. Kiểm tra trùng tên (ngoại trừ chính nó)
    IF EXISTS (
        SELECT 1
        FROM Tour
        WHERE TenTour = @TenTour
          AND TourId <> @TourId
    )
    BEGIN
        RAISERROR(N'Tên tour này đã tồn tại!', 16, 1);
        RETURN;
    END

    -- 3. Giá người lớn không được < 0
    IF @GiaNguoiLon < 0
    BEGIN
        RAISERROR(N'Giá người lớn không được nhỏ hơn 0!', 16, 1);
        RETURN;
    END

    -- 4. Giá trẻ em không được < 0
    IF ISNULL(@GiaTreEm, 0) < 0
    BEGIN
        RAISERROR(N'Giá trẻ em không được nhỏ hơn 0!', 16, 1);
        RETURN;
    END

    -- 5. Giá trẻ em phải nhỏ hơn giá người lớn
    IF ISNULL(@GiaTreEm, 0) >= @GiaNguoiLon
    BEGIN
        RAISERROR(N'Giá trẻ em phải nhỏ hơn giá người lớn!', 16, 1);
        RETURN;
    END

    -- 6. Update
    UPDATE Tour
    SET
        TenTour = @TenTour,
        MoTaNgan = @MoTaNgan,
        MoTaChiTiet = @MoTaChiTiet,
        DiemXuatPhatId = @DiemXuatPhatId,
        LoaiTourId = @LoaiTourId,
        GiaNguoiLon = @GiaNguoiLon,
        GiaTreEm = ISNULL(@GiaTreEm, 0),
        ThoiGianKhoiHanh = @ThoiGianKhoiHanh,
        TrangThai = ISNULL(@TrangThai, TrangThai)
    WHERE TourId = @TourId;
END
GO

CREATE PROCEDURE [dbo].[sp_DeleteTour]
    @TourId UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;

    -- 1. Kiểm tra Tour có tồn tại hay không
    IF NOT EXISTS (
        SELECT 1
        FROM Tour
        WHERE TourId = @TourId
    )
    BEGIN
        RAISERROR(N'Không tìm thấy tour cần xoá!', 16, 1);
        RETURN;
    END

    -- 2. Xoá tour
    DELETE FROM Tour
    WHERE TourId = @TourId;
END
GO

--------------------------
------------------------------ẢNH TOYR----------------------------
CREATE PROCEDURE [dbo].[sp_AnhTour_GetByTourId]
    @TourId UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        AnhTourId,
        TourId,
        LinkAnh,
        IsAvatar
    FROM AnhTour
    WHERE TourId = @TourId
    ORDER BY 
        ISNULL(IsAvatar, 0) DESC,
        AnhTourId ASC;
END
GO

Create PROCEDURE [dbo].[sp_AnhTour_Insert]
    @TourId UNIQUEIDENTIFIER,
    @LinkAnh NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO AnhTour (
        TourId,
        LinkAnh,
        IsAvatar
    )
    OUTPUT INSERTED.AnhTourId
    VALUES (
        @TourId,
        @LinkAnh,
        0
    );
END
GO

CREATE PROCEDURE [dbo].[sp_AnhTour_SetAvatar]
    @AnhTourId UNIQUEIDENTIFIER,
    @TourId UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRAN;

    BEGIN TRY
        -- Reset avatar cũ
        UPDATE AnhTour
        SET IsAvatar = 0
        WHERE TourId = @TourId;

        -- Set avatar mới
        UPDATE AnhTour
        SET IsAvatar = 1
        WHERE AnhTourId = @AnhTourId
          AND TourId = @TourId;

        COMMIT TRAN;
    END TRY
    BEGIN CATCH
        ROLLBACK TRAN;
        THROW;
    END CATCH
END
GO


CREATE PROCEDURE [dbo].[sp_AnhTour_Delete]
    @AnhTourId UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;

    -- 1. Kiểm tra ảnh tour có tồn tại hay không
    IF NOT EXISTS (
        SELECT 1
        FROM AnhTour
        WHERE AnhTourId = @AnhTourId
    )
    BEGIN
        RAISERROR(N'Không tìm thấy ảnh tour cần xoá!', 16, 1);
        RETURN;
    END

    -- 2. Xoá ảnh tour
    DELETE FROM AnhTour
    WHERE AnhTourId = @AnhTourId;
END


-------------------------------------------------------------
-------------------LICH TRINH----------------------------------
CREATE PROCEDURE [dbo].[sp_LichTrinh_GetByTourId]
    @TourId UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;

    -- 1. Kiểm tra Tour tồn tại
    IF NOT EXISTS (
        SELECT 1 FROM Tour WHERE TourId = @TourId
    )
    BEGIN
        RAISERROR(N'Không tìm thấy tour!', 16, 1);
        RETURN;
    END

    -- 2. Lấy lịch trình
    SELECT
        LichTrinhId,
        TourId,
        NgayThu,
        TieuDe,
        NoiDung
    FROM LichTrinh
    WHERE TourId = @TourId
    ORDER BY NgayThu ASC;
END
GO


CREATE PROCEDURE [dbo].[sp_LichTrinh_Insert]
    @TourId UNIQUEIDENTIFIER,
    @NgayThu INT,
    @TieuDe NVARCHAR(300),
    @NoiDung NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    -- 1. Kiểm tra Tour tồn tại
    IF NOT EXISTS (
        SELECT 1 FROM Tour WHERE TourId = @TourId
    )
    BEGIN
        RAISERROR(N'Không tìm thấy tour để thêm lịch trình!', 16, 1);
        RETURN;
    END

    -- 2. Validate Ngày thứ
    IF @NgayThu <= 0
    BEGIN
        RAISERROR(N'Ngày thứ phải lớn hơn 0!', 16, 1);
        RETURN;
    END

    -- 3. Insert
    INSERT INTO LichTrinh
    (
        TourId,
        NgayThu,
        TieuDe,
        NoiDung
    )
    OUTPUT INSERTED.LichTrinhId
    VALUES
    (
        @TourId,
        @NgayThu,
        @TieuDe,
        @NoiDung
    );
END
GO


CREATE PROCEDURE [dbo].[sp_LichTrinh_Update]
    @LichTrinhId UNIQUEIDENTIFIER,
    @NgayThu INT,
    @TieuDe NVARCHAR(300),
    @NoiDung NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    -- 1. Kiểm tra tồn tại
    IF NOT EXISTS (
        SELECT 1 FROM LichTrinh WHERE LichTrinhId = @LichTrinhId
    )
    BEGIN
        RAISERROR(N'Không tìm thấy lịch trình cần cập nhật!', 16, 1);
        RETURN;
    END

    -- 2. Validate Ngày thứ
    IF @NgayThu <= 0
    BEGIN
        RAISERROR(N'Ngày thứ phải lớn hơn 0!', 16, 1);
        RETURN;
    END

    -- 3. Update
    UPDATE LichTrinh
    SET
        NgayThu = @NgayThu,
        TieuDe = @TieuDe,
        NoiDung = @NoiDung
    WHERE LichTrinhId = @LichTrinhId;
END
GO
CREATE PROCEDURE [dbo].[sp_LichTrinh_Delete]
    @LichTrinhId UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;

    -- 1. Kiểm tra tồn tại
    IF NOT EXISTS (
        SELECT 1 FROM LichTrinh WHERE LichTrinhId = @LichTrinhId
    )
    BEGIN
        RAISERROR(N'Không tìm thấy lịch trình cần xoá!', 16, 1);
        RETURN;
    END

    -- 2. Xoá
    DELETE FROM LichTrinh
    WHERE LichTrinhId = @LichTrinhId;
END
GO