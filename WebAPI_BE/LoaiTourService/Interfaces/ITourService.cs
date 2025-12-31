
using DTO.Tour;
using Models;

namespace TourManageService.Interfaces
{
    public interface ITourService
    {
        Task<ApiResponse<List<TourDTO>>> GetAll(string? keyword);
        Task<ApiResponse<TourDTO>> GetById(Guid id);

        Task<ApiResponse<bool>> Create(CreateTourDTO model);
    }
}
