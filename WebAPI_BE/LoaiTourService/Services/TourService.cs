using DTO.LoaiTour;
using DTO.Tour;
using Infrastructure;
using Infrastructure.Interfaces;
using Microsoft.AspNetCore.Mvc.Routing;
using Models;
using System.Data;
using TourManageService.Interfaces;
namespace TourManageService.Services
{
    public class TourService : ITourService
    {
        private readonly IDatabaseHelper _dbHelper;

        public TourService(IDatabaseHelper dbHelper)
        {
            _dbHelper = dbHelper;
        }

        public async Task<ApiResponse<List<TourDTO>>> GetAll(string? keyword)
        {
            return await Task.Run(() =>
            {
                string msgError;

                var table = _dbHelper.ExecuteSProcedureReturnDataTable(
                    out msgError,
                    "sp_GetAllTour",
                    "@Keyword", keyword
                );

                if (!string.IsNullOrEmpty(msgError))
                {
                    return new ApiResponse<List<TourDTO>>
                    {
                        Success = false,
                        Code = "SQL_ERROR",
                        Message = msgError
                    };
                }

                var data = table.AsEnumerable().Select(r => new TourDTO
                {
                    TourId = r.Field<Guid>("TourId"),
                    TenTour = r.Field<string>("TenTour"),
                    MoTaNgan = r.Field<string?>("MoTaNgan"),
                    MoTaChiTiet = r.Field<string?>("MoTaChiTiet"),
                    DiemXuatPhatId = r.Field<Guid?>("DiemXuatPhatId"),
                    LoaiTourId = r.Field<Guid?>("LoaiTourId"),
                    GiaNguoiLon = r.Field<decimal>("GiaNguoiLon"),
                    GiaTreEm = r.Field<decimal>("GiaTreEm"),
                    ThoiGianKhoiHanh = r.Field<string?>("ThoiGianKhoiHanh"),
                    TrangThai = r.Field<string?>("TrangThai"),
                    NgayTao = r.Field<DateTime>("NgayTao")
                }).ToList();

                return new ApiResponse<List<TourDTO>>
                {
                    Success = true,
                    Code = "SUCCESS",
                    Message = "Lấy danh sách tour thành công",
                    Data = data
                };
            });
        }
        public async Task<ApiResponse<TourDTO>> GetById(Guid id)
        {
            return await Task.Run(() =>
            {
                string msgError;

                var table = _dbHelper.ExecuteSProcedureReturnDataTable(
                    out msgError,
                    "sp_GetTourById",
                    "@TourId", id
                );

                if (!string.IsNullOrEmpty(msgError))
                {
                    return new ApiResponse<TourDTO>
                    {
                        Success = false,
                        Code = "SQL_ERROR",
                        Message = msgError
                    };
                }

                if (table.Rows.Count == 0)
                {
                    return new ApiResponse<TourDTO>
                    {
                        Success = false,
                        Code = "NOT_FOUND",
                        Message = "Không tìm thấy tour"
                    };
                }

                var r = table.Rows[0];

                return new ApiResponse<TourDTO>
                {
                    Success = true,
                    Code = "SUCCESS",
                    Message = "Lấy dữ liệu thành công",
                    Data = new TourDTO
                    {
                        TourId = r.Field<Guid>("TourId"),
                        TenTour = r.Field<string>("TenTour"),
                        MoTaNgan = r.Field<string?>("MoTaNgan"),
                        MoTaChiTiet = r.Field<string?>("MoTaChiTiet"),
                        DiemXuatPhatId = r.Field<Guid?>("DiemXuatPhatId"),
                        LoaiTourId = r.Field<Guid?>("LoaiTourId"),
                        GiaNguoiLon = r.Field<decimal>("GiaNguoiLon"),
                        GiaTreEm = r.Field<decimal>("GiaTreEm"),
                        ThoiGianKhoiHanh = r.Field<string?>("ThoiGianKhoiHanh"),
                        TrangThai = r.Field<string?>("TrangThai"),
                        NgayTao = r.Field<DateTime>("NgayTao")
                    }
                };
            });
        }
    }
}
