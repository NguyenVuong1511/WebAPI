using DTO.User;
using Infrastructure.Interfaces;
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
    }
}
