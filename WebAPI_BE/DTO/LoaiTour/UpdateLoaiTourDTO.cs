using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DTO.LoaiTour
{
    public class UpdateLoaiTourDTO
    {
        [Required]
        public Guid LoaiTourId { get; set; }

        [Required]
        [StringLength(100)]
        public string TenLoai { get; set; } = string.Empty;

        public string? MoTa { get; set; }
    }
}
