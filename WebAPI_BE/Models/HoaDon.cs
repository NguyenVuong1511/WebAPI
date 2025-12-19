using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Models
{
    public class HoaDon
    {
        public string HoaDonId { get; set; }
        public string BookingId { get; set; }
        public string NguoiLapId { get; set; }
        public double TongTien { get; set; }
        public double TienDaThanhToan { get; set; }
        public string TrangThaiThanhToan { get; set; }
        public DateTime NgayLap {  get; set; }
    }
}
