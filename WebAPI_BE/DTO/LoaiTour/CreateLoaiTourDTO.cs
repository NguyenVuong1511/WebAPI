using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DTO.LoaiTour
{
    public class CreateLoaiTourDTO
    {
        [Required]
        [StringLength(100)]
        public string TenLoai { get; set; } = string.Empty;
        public string? MoTa { get; set; }
    }
}
