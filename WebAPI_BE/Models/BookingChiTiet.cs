using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Models
{
    internal class BookingChiTiet
    {
        public string BookingChiTietId {  get; set; }
        public string BookingId { get; set; }
        public string HoTenKhach {  get; set; }
        public string GioiTinh { get; set; }
        public DateTime NgaySinh { get; set; }
        public string LoaiKhach { get; set; }
        public string CMND_HoChieu { get; set; }
    }
}
