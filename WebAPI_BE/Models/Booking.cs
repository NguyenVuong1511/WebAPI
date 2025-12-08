using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Models
{
    internal class Booking
    {
        public string BookingId { get; set; }
        public string TourId { get; set; }
        public string NguoiDatId { get; set; }
        public int SoNguoiLon {  get; set; }
        public int SoTreEm { get; set; }
        public DateTime NgayKhoiHanh {  get; set; }
        public DateTime NgayDat {  get; set; }
        public string TrangThai { get; set; }
    }
}
