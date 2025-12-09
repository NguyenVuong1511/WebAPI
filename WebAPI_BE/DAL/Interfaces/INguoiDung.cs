using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Models;

namespace DAL.Interfaces
{
    public partial interface INguoiDung
    {
        public bool Create(NguoiDung newNguoiDung);
    }
}
