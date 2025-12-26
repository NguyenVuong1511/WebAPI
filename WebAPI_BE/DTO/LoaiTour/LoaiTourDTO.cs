using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DTO.LoaiTour
{
    public class LoaiTourDTO
    {
        public Guid LoaiTourId { get; set; }
        public string TenLoai { get; set; } = string.Empty;
        public string? MoTa { get; set; }
    }
}
