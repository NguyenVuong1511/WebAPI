using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DTO.Tour
{
    public class UpdateTourDTO
    {
        [Required]
        public Guid TourId { get; set; }

        [Required]
        [StringLength(300)]
        public string TenTour { get; set; } = string.Empty;

        [StringLength(500)]
        public string? MoTaNgan { get; set; }

        public string? MoTaChiTiet { get; set; }

        [Required]
        public Guid DiemXuatPhatId { get; set; }

        [Required]
        public Guid LoaiTourId { get; set; }

        [Required]
        public decimal GiaNguoiLon { get; set; }

        public decimal GiaTreEm { get; set; }

        public string? ThoiGianKhoiHanh { get; set; }

        public string? TrangThai { get; set; }
    }
}
