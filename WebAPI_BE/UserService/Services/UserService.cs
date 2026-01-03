using DTO.User;
using Infrastructure;
using Infrastructure.Interfaces;
using Microsoft.Data.SqlClient;
using Models;
using System.Data;
using UserService.Interfaces;

namespace UserService.Services
{
    public class UserService : IUserService
    {
        private readonly IDatabaseHelper _dbHelper;
        private readonly IConfiguration _config;

        public UserService(IDatabaseHelper dbHelper, IConfiguration config)
        {
            _dbHelper = dbHelper;
            _config = config;
        }
        public async Task<List<NguoiDungDTO>> GetAllAsync()
        {
            var result = new List<NguoiDungDTO>();

            string msgError = string.Empty;
            var dt = _dbHelper.ExecuteSProcedureReturnDataTable(out msgError, "sp_NguoiDung_GetAll");
            if(dt != null && dt.Rows.Count > 0)
            {
                foreach(DataRow row in dt.Rows)
                {
                    result.Add(new NguoiDungDTO
                    {
                        NguoiDungId = Guid.Parse(row["NguoiDungId"].ToString()),
                        Email = row["Email"].ToString(),
                        HoTen = row["HoTen"].ToString(),
                        SDT = row["SoDienThoai"].ToString(),
                        DiaChi = row["DiaChi"].ToString(),
                        VaiTro = row["VaiTro"].ToString(),
                        TrangThai = Convert.ToBoolean(row["TrangThai"]),
                        NgayTao = Convert.ToDateTime(row["NgayTao"])
                    });
                }
                return result;
            }
            return result;

        }
        public Task<NguoiDungDTO?> GetByIdAsync(Guid id)
        {
            string msgError = string.Empty;
            var dt = _dbHelper.ExecuteSProcedureReturnDataTable(out msgError, "sp_NguoiDung_GetById", "@Id", id);
            if (!string.IsNullOrEmpty(msgError))
            {
                return Task.FromResult<NguoiDungDTO?>(null);

            }
            if(dt != null && dt.Rows.Count > 0)
            {
                var row = dt.Rows[0];
                var result = new NguoiDungDTO
                {
                    NguoiDungId = Guid.Parse(row["NguoiDungId"].ToString()!),
                    Email = row["Email"].ToString(),
                    HoTen = row["HoTen"].ToString(),
                    SDT = row["SoDienThoai"].ToString(),
                    DiaChi = row["DiaChi"].ToString(),
                    VaiTro = row["VaiTro"].ToString(),
                    TrangThai = Convert.ToBoolean(row["TrangThai"]),
                    NgayTao = Convert.ToDateTime(row["NgayTao"])
                };
                return Task.FromResult<NguoiDungDTO?>(result);
            }
            return Task.FromResult<NguoiDungDTO?>(null);
        }
        public async Task<ApiResponse<bool>> CreateAsync(CreateNguoiDungDTO model)
        {
            if (string.IsNullOrWhiteSpace(model.Email) || string.IsNullOrWhiteSpace(model.Password) || string.IsNullOrWhiteSpace(model.HoTen) || string.IsNullOrWhiteSpace(model.SDT))
            {
                return new ApiResponse<bool>
                {
                    Success = false,
                    Message = "Đăng ký không thành công",
                    Data = false,
                };
            }
            var result = await _dbHelper.ExecuteSProcedureAsync("sp_NguoiDung_Create",
                "@Email", model.Email,
                "@MatKhau", model.Password,
                "@HoTen", model.HoTen,
                "SoDienThoai", model.SDT,
                "@DiaChi", model.DiaChi,
                "@VaiTro", model.VaiTro,
                "@TrangThai", model.TrangThai
            );
            if(result == string.Empty)
            {
                return new ApiResponse<bool>
                {
                    Success = true,
                    Message = "Đăng ký thành công",
                    Data = true,
                };
            }
            else
            {
                return new ApiResponse<bool>
                {
                    Success = false,
                    Message = result,
                    Data = false,
                };
            }
        }
        public async Task<ApiResponse<bool>> UpdateAsync(Guid id, NguoiDungUpdateDTO model)
        {
            if(id == Guid.Empty)
            {
                return new ApiResponse<bool>
                {
                    Success = false,
                    Message = "Người dùng không tồn tại",
                };
            }
            if (string.IsNullOrWhiteSpace(model.HoTen))
            {
                return new ApiResponse<bool>
                {
                    Success = false,
                    Message = "Họ tên không được để trống",
                    Data = false
                };
            }
            if (string.IsNullOrWhiteSpace(model.SDT))
            {
                return new ApiResponse<bool>
                {
                    Success = false,
                    Message = "Số điện thoại không được để trống",
                    Data = false
                };
            }
            var result = await _dbHelper.ExecuteSProcedureAsync(
                "sp_NguoiDung_Update",
                "@NguoiDungId", id,
                "@HoTen", model.HoTen,
                "@SoDienThoai", model.SDT,
                "@DiaChi", model.DiaChi,
                "@TrangThai", model.TrangThai
            );
            if (string.IsNullOrEmpty(result))
            {
                return new ApiResponse<bool>
                {
                    Success = true,
                    Message = "Cập nhật thành công",
                    Data = true
                };
            }
            else
            {
                return new ApiResponse<bool>
                {
                    Success = false,
                    Message = result,
                    Data = false
                };
            }
        }
        public async Task<ApiResponse<bool>> DeleteAsync(Guid id)
        {
            if(id == Guid.Empty)
            {
                return new ApiResponse<bool>
                {
                    Success = false,
                    Message = "Người dùng không tồn tại",
                    Data = false
                };
            }
            var result = await _dbHelper.ExecuteSProcedureAsync(
                "sp_NguoiDung_Delete",
                "@NguoiDungId", id
            );
            if (string.IsNullOrEmpty(result))
            {
                return new ApiResponse<bool>
                {
                    Success = true,
                    Message = "Xóa người dùng thành công",
                    Data = true
                };
            }
            else
            {
                return new ApiResponse<bool>
                {
                    Success = false,
                    Message = result,
                    Data = false
                };
            }
        }
    }
}
