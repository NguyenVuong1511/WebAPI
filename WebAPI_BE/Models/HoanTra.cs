using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Models
{
    internal class HoanTra
    {
        public string HoanTraId { get; set; }
        public string BookingId { get; set; }
        public string HoaDonId { get; set; }
        public string LyDo {  get; set; }
        public double SoTienLai { get; set; }
        public string TrangThai { get; set; }
        public DateTime NgayYeuCau {  get; set; }
    }
}
