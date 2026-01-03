using DTO.AnhTour;
using Models;

namespace TourManageService.Interfaces
{
    public interface IAnhTourService
    {
        Task<ApiResponse<List<AnhTourDTO>>> GetByTourId(Guid tourId);
    }
}
