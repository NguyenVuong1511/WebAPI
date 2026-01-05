using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DTO.LichTrinh
{
    public class LichTrinhDTO
    {
        public Guid LichTrinhId { get; set; }
        public Guid TourId { get; set; }
        public int NgayThu { get; set; }
        public string? TieuDe { get; set; }
        public string? NoiDung { get; set; }
    }
}
