using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DTO.User
{
    public class NguoiDungRegisterDTO
    {
        public string Email { get; set; } = string.Empty;

        public string Password { get; set; } = string.Empty;

        public string HoTen { get; set; } = string.Empty;

        public string? SoDienThoai { get; set; }

        public string? DiaChi { get; set; }
    }
}
