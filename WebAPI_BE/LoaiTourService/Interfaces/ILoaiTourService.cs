using DTO.LoaiTour;
using Models;
namespace TourManageService.Interface
{
    public interface ILoaiTourService
    {
        Task<ApiResponse<List<LoaiTourDTO>>> GetAll();
        Task<ApiResponse<LoaiTourDTO>> GetById(Guid id);
        Task<ApiResponse<bool>> Create(CreateLoaiTourDTO model);
        Task<ApiResponse<bool>> Update(UpdateLoaiTourDTO model);
        //Task<ApiResponse<bool>> Delete(Guid id);
    }
}
