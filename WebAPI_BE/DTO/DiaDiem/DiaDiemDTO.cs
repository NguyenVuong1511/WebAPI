using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DTO.DiaDiem
{
    public class DiaDiemDTO
    {
        public Guid DiaDiemId { get; set; }
        public string TenDiaDiem { get; set; } = string.Empty;
        public string? MoTa { get; set; }
    }
}
