using DTO.DiaDiem;
using Models;

namespace GeneralService.Interfaces
{
    public interface IDiaDiemService
    {
        Task<ApiResponse<List<DiaDiemDTO>>> GetAllAsync();
        Task<ApiResponse<DiaDiemDTO>> GetByIdAsync(Guid id);
        Task<ApiResponse<string>> CreateAsync(DiaDiemDTO model);
        Task<ApiResponse<string>> UpdateAsync(DiaDiemDTO model);
        Task<ApiResponse<string>> DeleteAsync(Guid id);
    }
}
