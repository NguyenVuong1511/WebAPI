using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Models
{
    internal class Voucher
    {
        public string VoucherId { get; set; }
        public string BookingId {  get; set; }
        public string MaVoucher {  get; set; }
        public string DuongDanPDF { get; set; }
        public DateTime NgayPhatHanh { get; set; }
        public string TrangThai {  get; set; }
    }
}
