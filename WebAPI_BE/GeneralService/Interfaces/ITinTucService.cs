using DTO.TinTuc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Models;
namespace GeneralService.Interfaces
{
    public interface ITinTucService
    {
        /* ==================== KHÁCH HÀNG ==================== */

        // Lấy danh sách tin tức (hiển thị ngoài trang chủ)
        Task<List<TinTucDTO>> GetAllAsync();

        // Xem chi tiết tin tức
        Task<TinTucDTO?> GetByIdAsync(Guid tinTucId);


        /* ==================== ADMIN ==================== */

        // Thêm tin tức mới
        Task<ApiResponse<bool>> CreateAsync(CreateTinTucDTO model);

        // Sửa tin tức
        Task<ApiResponse<bool>> UpdateAsync(Guid id, CreateTinTucDTO model);
        //Xóa tin tức
        Task<ApiResponse<bool>> DeleteAsync(Guid id);
    }
}
