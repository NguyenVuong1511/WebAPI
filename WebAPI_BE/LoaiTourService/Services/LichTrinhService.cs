using DTO.LichTrinh;
using Infrastructure.Interfaces;
using Models;
using System.Data;
using TourManageService.Interfaces;

namespace TourManageService.Services
{
    public class LichTrinhService : ILichTrinhService
    {
        private readonly IDatabaseHelper _dbHelper;

        public LichTrinhService(IDatabaseHelper dbHelper)
        {
            _dbHelper = dbHelper;
        }

        public async Task<ApiResponse<List<LichTrinhDTO>>> GetByTourId(Guid tourId)
        {
            return await Task.Run(() =>
            {
                string msgError;

                var table = _dbHelper.ExecuteSProcedureReturnDataTable(
                    out msgError,
                    "sp_LichTrinh_GetByTourId",
                    "@TourId", tourId
                );

                if (!string.IsNullOrEmpty(msgError))
                {
                    return new ApiResponse<List<LichTrinhDTO>>
                    {
                        Success = false,
                        Code = "SQL_ERROR",
                        Message = msgError
                    };
                }

                var data = table.AsEnumerable().Select(r => new LichTrinhDTO
                {
                    LichTrinhId = r.Field<Guid>("LichTrinhId"),
                    TourId = r.Field<Guid>("TourId"),
                    NgayThu = r.Field<int>("NgayThu"),
                    TieuDe = r.Field<string?>("TieuDe"),
                    NoiDung = r.Field<string?>("NoiDung")
                }).ToList();

                return new ApiResponse<List<LichTrinhDTO>>
                {
                    Success = true,
                    Code = "SUCCESS",
                    Message = "Lấy danh sách lịch trình thành công",
                    Data = data
                };
            });
        }

        public async Task<ApiResponse<Guid>> Create(CreateLichTrinhDTO model)
        {
            return await Task.Run(() =>
            {
                string msgError;

                var result = _dbHelper.ExecuteScalarSProcedure(
                    out msgError,
                    "sp_LichTrinh_Insert",
                    "@TourId", model.TourId,
                    "@NgayThu", model.NgayThu,
                    "@TieuDe", model.TieuDe,
                    "@NoiDung", model.NoiDung
                );

                if (!string.IsNullOrEmpty(msgError) || result == null)
                {
                    return new ApiResponse<Guid>
                    {
                        Success = false,
                        Code = "SQL_ERROR",
                        Message = msgError
                    };
                }

                return new ApiResponse<Guid>
                {
                    Success = true,
                    Code = "CREATED",
                    Message = "Thêm lịch trình thành công",
                    Data = (Guid)result
                };
            });
        }
        public async Task<ApiResponse<bool>> Update(UpdateLichTrinhDTO model)
        {
            return await Task.Run(() =>
            {
                var msgError = _dbHelper.ExecuteSProcedure(
                    "sp_LichTrinh_Update",
                    "@LichTrinhId", model.LichTrinhId,
                    "@NgayThu", model.NgayThu,
                    "@TieuDe", model.TieuDe,
                    "@NoiDung", model.NoiDung
                );

                if (!string.IsNullOrEmpty(msgError))
                {
                    return new ApiResponse<bool>
                    {
                        Success = false,
                        Code = "SQL_ERROR",
                        Message = msgError
                    };
                }

                return new ApiResponse<bool>
                {
                    Success = true,
                    Code = "UPDATED",
                    Message = "Cập nhật lịch trình thành công",
                    Data = true
                };
            });
        }


        public async Task<ApiResponse<bool>> Delete(Guid lichTrinhId)
        {
            return await Task.Run(() =>
            {
                var msgError = _dbHelper.ExecuteSProcedure(
                    "sp_LichTrinh_Delete",
                    "@LichTrinhId", lichTrinhId
                );

                if (!string.IsNullOrEmpty(msgError))
                {
                    return new ApiResponse<bool>
                    {
                        Success = false,
                        Code = "SQL_ERROR",
                        Message = msgError
                    };
                }

                return new ApiResponse<bool>
                {
                    Success = true,
                    Code = "DELETED",
                    Message = "Xoá lịch trình thành công",
                    Data = true
                };
            });
        }
    }
}