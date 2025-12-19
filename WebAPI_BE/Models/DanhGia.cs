using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Models
{
    public class DanhGia
    {
        public string DanhGiaId { get; set; }
        public string TourId { get; set; }
        public string NguoiDungId { get; set; }
        public string BookingId {  get; set; }
        public int Sao {  get; set; }
        public string TieuDe {  get; set; }
        public string NoiDung {  get; set; }
        public DateTime NgayDanhGia { get; set; }
    }
}
