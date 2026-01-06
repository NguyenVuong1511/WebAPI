using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DTO.TinTuc
{
    public class UpdateTinTucDTO
    {
        public Guid TinTucId { get; set; }

        public string TieuDe { get; set; }
        public string NoiDung { get; set; }
        public string? AnhDaiDien { get; set; }

        // Giữ để kiểm soát ai sửa (hoặc dùng khi chưa có auth)
        public Guid NguoiDangId { get; set; }
    }
}
