using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DTO.Tour
{
    public class TourDTO
    {
        public Guid TourId { get; set; }
        public string TenTour { get; set; } = string.Empty;
        public string? MoTaNgan { get; set; }
        public string? MoTaChiTiet { get; set; }
        public Guid? DiemXuatPhatId { get; set; }
        public Guid? LoaiTourId { get; set; }
        public decimal GiaNguoiLon { get; set; }
        public decimal GiaTreEm { get; set; }
        public string? ThoiGianKhoiHanh { get; set; }
        public string? TrangThai { get; set; }
        public DateTime NgayTao { get; set; }
    }
}
