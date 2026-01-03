using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DTO.Tour
{
    public class TourUserQueryDTO
    {
        public string? Keyword { get; set; }

        /// <summary>
        /// TenTour | NgayTao | GiaNguoiLon | GiaTreEm
        /// </summary>
        public string SortBy { get; set; } = "NgayTao";

        /// <summary>
        /// ASC | DESC
        /// </summary>
        public string SortDir { get; set; } = "DESC";
    }
}
