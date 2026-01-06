
using DTO.Tour;
using Models;

namespace TourManageService.Interfaces
{
    public interface ITourService
    {
        Task<ApiResponse<List<TourDTO>>> GetAll(string? keyword);
        Task<ApiResponse<TourDTO>> GetById(Guid id);

        Task<ApiResponse<bool>> Create(CreateTourDTO model);
        Task<ApiResponse<bool>> Update(UpdateTourDTO model);
        Task<ApiResponse<bool>> Delete(Guid id);
        // User
        Task<ApiResponse<List<TourDTO>>> GetAll(TourUserQueryDTO query);
    }
}
