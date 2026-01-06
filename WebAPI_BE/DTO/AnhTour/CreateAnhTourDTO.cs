using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DTO.AnhTour
{
    public class CreateAnhTourDTO
    {
        [Required]
        public Guid TourId { get; set; }

        [Required]
        public string LinkAnh { get; set; } = string.Empty;
    }
}
