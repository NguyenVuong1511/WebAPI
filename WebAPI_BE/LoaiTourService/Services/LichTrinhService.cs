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
    }
}