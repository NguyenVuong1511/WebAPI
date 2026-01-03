using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DTO.AnhTour
{
    public class AnhTourDTO
    {
        public Guid AnhTourId { get; set; }
        public Guid TourId { get; set; }
        public string LinkAnh { get; set; } = string.Empty;
        public bool IsAvatar { get; set; }
    }
}
