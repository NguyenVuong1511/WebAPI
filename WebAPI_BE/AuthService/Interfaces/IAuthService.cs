using DTO;
using Models;

namespace AuthService.Interfaces
{
    public interface IAuthService
    {
        Task<ApiResponse<LoginResponseDTO>> LoginAsync(LoginRequestDTO request);
        Task<ApiResponse<string>> RegisterAsync(NguoiDungRegisterDTO request);
    }
}
