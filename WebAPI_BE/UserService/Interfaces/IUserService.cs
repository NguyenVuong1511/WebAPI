using DTO.User;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Models;

namespace UserService.Interfaces
{
    public interface IUserService
    {
        Task<List<NguoiDungDTO>> GetAllAsync();
        Task<NguoiDungDTO> GetByIdAsync(Guid id);
        Task<ApiResponse<bool>> CreateAsync(CreateNguoiDungDTO model);
        Task<ApiResponse<bool>> UpdateAsync(Guid id, NguoiDungUpdateDTO model);
        Task<ApiResponse<bool>> DeleteAsync(Guid id);
    }
}