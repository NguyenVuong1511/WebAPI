using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Models
{
    public class GiaTour
    {
        public string GiaTourId { get; set; }
        public string TourId { get; set; }
        public string TenGia {  get; set; }
        public double Gia {  get; set; }
        public string DonVi { get; set; }
        public DateTime NgayApDung_BatDau { get; set; }
        public DateTime NgayApDung_KetThuc {  get; set; }
        public string TrangThai { get; set; }
    }
}
