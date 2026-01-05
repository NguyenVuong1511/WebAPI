using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DTO.TinTuc
{
    public class CreateTinTucDTO
    {
        public string TieuDe { get; set; }
        public string NoiDung { get; set; }
        public string AnhDaiDien { get; set; }
        public Guid NguoiDangId { get; set; }
    }
}
