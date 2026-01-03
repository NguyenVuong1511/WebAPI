using DTO.User;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Models;

namespace UserService.Interfaces
{
    public interface IUserService
    {
        //Admin
        Task<List<NguoiDungDTO>> GetAllAsync();
        Task<ApiResponse<bool>> CreateAsync(CreateNguoiDungDTO model);
        Task<ApiResponse<bool>> DeleteAsync(Guid id);
        //Task<ApiResponse<bool>> Lock_UnlockAsnyc(bool check);
        //Khách hàng
        Task<ApiResponse<bool>> UpdateAsync(Guid id, NguoiDungUpdateDTO model);
        Task<NguoiDungDTO> GetByIdAsync(Guid id);
        Task<ApiResponse<bool>> UpdatePassAsnyc(UpdatePassNguoiDungDTO model);
    }
}