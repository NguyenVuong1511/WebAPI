using AuthService.Interfaces;
using Infrastructure.Interfaces;
using DTO;
using Models;
using System.Data;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using System.Text.RegularExpressions;

namespace AuthService.Services
{
    public class AuthService : IAuthService
    {
        private readonly IDatabaseHelper _dbHelper;
        private readonly IConfiguration _config;

        public AuthService(IDatabaseHelper dbHelper, IConfiguration config)
        {
            _dbHelper = dbHelper;
            _config = config;
        }

        public async Task<ApiResponse<LoginResponseDTO>> LoginAsync(LoginRequestDTO request)
        {
            string msgError = "";
            // Gọi Store Procedure đăng nhập
            DataTable dt = _dbHelper.ExecuteSProcedureReturnDataTable(out msgError, "sp_NguoiDung_DangNhap",
                "@Email", request.Email,
                "@MatKhau", request.Password);

            if (!string.IsNullOrEmpty(msgError))
                return new ApiResponse<LoginResponseDTO> { Success = false, Message = "Lỗi DB: " + msgError };

            if (dt.Rows.Count > 0)
            {
                var row = dt.Rows[0];
                string role = row["VaiTro"].ToString() ?? "Khách Hàng";
                string token = GenerateJwtToken(request.Email, role);

                return new ApiResponse<LoginResponseDTO>
                {
                    Success = true,
                    Message = "Đăng nhập thành công",
                    Data = new LoginResponseDTO { AccessToken = token, Email = request.Email, Role = role }
                };
            }

            return new ApiResponse<LoginResponseDTO> { Success = false, Message = "Email hoặc mật khẩu không đúng" };
        }
        public async Task<ApiResponse<string>> RegisterAsync(NguoiDungRegisterDTO request)
        {
            if(IsValidEmail(request.Email))
            {
                if(request.Password.Length > 6)
                {
                    string msgError = _dbHelper.ExecuteSProcedure("sp_NguoiDung_DangKy",
                        "@Email", request.Email,
                        "@MatKhau", request.Password,
                        "@HoTen", request.HoTen);

                    if (string.IsNullOrEmpty(msgError))
                        return new ApiResponse<string> { Success = true, Message = "Đăng ký thành công" };

                    return new ApiResponse<string> { Success = false, Message = "Đăng ký thất bại: " + msgError };
                }
                else
                {
                    return new ApiResponse<string> { Success = false, Message = "Mật khẩu phải lớn hơn 6 ký tự" };
                }
                
            }
            else
            {
                return new ApiResponse<string> { Success = false, Message = "Email không đúng định dạng" };
            }
            
        }
        private bool IsValidEmail(string email)
        {
            if (string.IsNullOrWhiteSpace(email))
                return false;

            string pattern = @"^[^@\s]+@[^@\s]+\.[^@\s]+$";
            return Regex.IsMatch(email, pattern);
        }

        private string GenerateJwtToken(string email, string role)
        {
            // 1. Lấy đúng section "Jwt"
            var jwtSettings = _config.GetSection("Jwt");

            // 2. Phải dùng "SecretKey" thay vì "Key"
            var secretKey = jwtSettings["SecretKey"];

            // Kiểm tra để tránh lỗi Null lần nữa
            if (string.IsNullOrEmpty(secretKey))
            {
                throw new Exception("Không tìm thấy 'SecretKey' trong appsettings.json");
            }

            var key = Encoding.ASCII.GetBytes(secretKey);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.Email, email),
                    new Claim(ClaimTypes.Role, role)
                }),
                // 3. Phải dùng "ExpireMinutes" thay vì "DurationInMinutes"
                Expires = DateTime.UtcNow.AddMinutes(double.Parse(jwtSettings["ExpireMinutes"] ?? "60")),

                SigningCredentials = new SigningCredentials(
                    new SymmetricSecurityKey(key),
                    SecurityAlgorithms.HmacSha256Signature),

                Issuer = jwtSettings["Issuer"],
                Audience = jwtSettings["Audience"]
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
    }
}