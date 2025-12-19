using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Models
{
    public class ThanhToan
    {
        public string ThanhToanId { get; set; }
        public string HoaDonId { get; set; }
        public string BookingId { get; set; }
        public string NguoiThanhToanId { get; set; }
        public double SoTien {  get; set; }
        public string PhuongThuc {  get; set; }
        public string TrangThai { get; set; }
        public DateTime NgayThanhToan { get; set; }

    }
}
