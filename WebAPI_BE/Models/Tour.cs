using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Models
{
    internal class Tour
    {
        public string TourId { get; set; }
        public string TenTourId { get; set; }
        public string MoTaNgan {  get; set; }
        public string MoTaChiTiet {  get; set; }
        public string DiemXuatPhat { get; set; }
        public DateTime ThoiGian_BatDau { get; set; }
        public DateTime ThoiGian_KetThuc {  get; set; }
        public int SoNgay {  get; set; }
        public string TrangThai { get; set; }
        public string HinhAnh {  get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdateAt {  get; set; } 
    }
}
