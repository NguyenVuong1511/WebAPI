using DTO;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace UserService.Interfaces // Namespace khớp với folder
{
    public interface IUserService
    {
        Task<List<NguoiDungDTO>> GetAllAsync();
        Task<NguoiDungDTO> GetByIdAsync(Guid id);
        Task<bool> CreateAsync(NguoiDungRegisterDTO model);
        Task<bool> UpdateAsync(Guid id, NguoiDungUpdateDTO model);
        Task<bool> DeleteAsync(Guid id);
    }
}