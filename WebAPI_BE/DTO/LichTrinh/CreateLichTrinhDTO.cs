using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DTO.LichTrinh
{
    public class CreateLichTrinhDTO
    {
        [Required]
        public Guid TourId { get; set; }

        [Required]
        public int NgayThu { get; set; }

        [MaxLength(300)]
        public string? TieuDe { get; set; }

        public string? NoiDung { get; set; }
    }
}
