use QuanLyDuLich
GO

----------------------------------------------------------------
-- ------------------------- LOAI TOUR -------------------------
----------------------------------------------------------------
CREATE PROCEDURE sp_GetAllLoaiTour
AS
BEGIN
    SELECT LoaiTourId, TenLoai, MoTa
    FROM LoaiTour;
END;
GO

CREATE PROCEDURE sp_AddLoaiTour
    @TenLoai NVARCHAR(100),
    @MoTa NVARCHAR(MAX)
AS
BEGIN
    IF EXISTS (SELECT 1 FROM LoaiTour WHERE TenLoai = @TenLoai)
    BEGIN
        RAISERROR('Tên loại tour này đã tồn tại!', 16, 1);
        RETURN;
    END

    INSERT INTO LoaiTour (TenLoai, MoTa)
    VALUES (@TenLoai, @MoTa);
END;

GO

CREATE PROCEDURE sp_UpdateLoaiTour
    @LoaiTourId UNIQUEIDENTIFIER,
    @TenLoai NVARCHAR(100),
    @MoTa NVARCHAR(MAX)
AS
BEGIN
    IF EXISTS (SELECT 1 FROM LoaiTour WHERE TenLoai = @TenLoai AND LoaiTourId <> @LoaiTourId)
    BEGIN
        RAISERROR('Tên loại tour này đã tồn tại!', 16, 1);
        RETURN;
    END

    UPDATE LoaiTour
    SET TenLoai = @TenLoai,
        MoTa = @MoTa
    WHERE LoaiTourId = @LoaiTourId;
END;

GO

CREATE PROCEDURE sp_DeleteLoaiTour
    @LoaiTourId UNIQUEIDENTIFIER
AS
BEGIN
    DELETE FROM LoaiTour
    WHERE LoaiTourId = @LoaiTourId;
END;
GO

CREATE PROCEDURE sp_GetLoaiTourById
    @LoaiTourId UNIQUEIDENTIFIER
AS
BEGIN
    SELECT LoaiTourId, TenLoai, MoTa
    FROM LoaiTour
    WHERE LoaiTourId = @LoaiTourId;
END;
GO