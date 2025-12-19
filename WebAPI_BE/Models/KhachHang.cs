using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Models
{
    public class KhachHang
    {
        public string KhachHangId {  get; set; }
        public string NguoiDungId { get; set; }
        public string DiaChi {  get; set; }
        public string GioiTinh { get; set; }
        public DateTime NgaySinh { get; set; }
        public string CMND_HoChieu { get; set; }
    }
}
