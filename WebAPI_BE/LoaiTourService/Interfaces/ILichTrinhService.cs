using DTO.LichTrinh;
using Models;

namespace TourManageService.Interfaces
{
    public interface ILichTrinhService
    {
        Task<ApiResponse<List<LichTrinhDTO>>> GetByTourId(Guid tourId);
    }
}
