using DTO.AnhTour;
using Infrastructure.Interfaces;
using Models;
using System.Data;
using TourManageService.Interfaces;
namespace TourManageService.Services
{
    public class AnhTourService : IAnhTourService
    {
        private readonly IDatabaseHelper _dbHelper;

        public AnhTourService(IDatabaseHelper dbHelper)
        {
            _dbHelper = dbHelper;
        }

        public async Task<ApiResponse<List<AnhTourDTO>>> GetByTourId(Guid tourId)
        {
            return await Task.Run(() =>
            {
                string msgError;

                var table = _dbHelper.ExecuteSProcedureReturnDataTable(
                    out msgError,
                    "sp_AnhTour_GetByTourId",
                    "@TourId", tourId
                );

                if (!string.IsNullOrEmpty(msgError))
                {
                    return new ApiResponse<List<AnhTourDTO>>
                    {
                        Success = false,
                        Code = "SQL_ERROR",
                        Message = msgError
                    };
                }

                var data = table.AsEnumerable().Select(r => new AnhTourDTO
                {
                    AnhTourId = r.Field<Guid>("AnhTourId"),
                    TourId = r.Field<Guid>("TourId"),
                    LinkAnh = r.Field<string>("LinkAnh"),
                    IsAvatar = r.Field<bool>("IsAvatar")
                }).ToList();

                return new ApiResponse<List<AnhTourDTO>>
                {
                    Success = true,
                    Code = "SUCCESS",
                    Message = "Lấy danh sách ảnh tour thành công",
                    Data = data
                };
            });
        }
    }
}
