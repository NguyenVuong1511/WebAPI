using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DTO.AnhTour
{
    public class SetAnhTourAvatar
    {
        [Required]
        public Guid AnhTourId { get; set; }

        [Required]
        public Guid TourId { get; set; }
    }
}
