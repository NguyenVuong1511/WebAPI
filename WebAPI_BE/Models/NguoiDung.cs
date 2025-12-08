using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Models
{
    internal class NguoiDung
    {
        public string NguoiDungId { get; set; }
        public string Email { get; set; }
        public string MatKhauHash { get; set; }
        public string HoTen {  get; set; }
        public string SDT { get; set; }
        public string VaiTro { get; set; }
        public bool TrangThai { get; set; }
        public DateTime NgayTao { get; set; }
        public DateTime NgayCapNhat { get; set; }

    }
}
