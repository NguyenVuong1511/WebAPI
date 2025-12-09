using DAL.Interfaces;
using Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BLL
{
    public class BLL_NguoiDung
    {
        private INguoiDung _nguoiDung;
        public BLL_NguoiDung(INguoiDung nd)
        {
            _nguoiDung = nd;
        }
        public bool Create(NguoiDung nd)
        {
            return _nguoiDung.Create(nd);
        }
    }
}
