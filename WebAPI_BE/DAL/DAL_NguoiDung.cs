using DAL.Helper.Interfaces;
using DAL.Interfaces;
using DAL.Helper;
using Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace DAL
{
    public partial class DAL_NguoiDung : INguoiDung
    {
        private IDatabaseHelper _dbHelper;
        public DAL_NguoiDung(IDatabaseHelper db)
        {
            _dbHelper = db;
        }

        public bool Create(NguoiDung newNguoiDung)
        {
            List<string> errors = new List<string>();
            try
            {
                var storeInfos = new List<StoreParameterInfo>()
                {
                    new StoreParameterInfo
                    {
                    StoreProcedureName = "sp_NguoiDung_Create",
                    StoreProcedureParams = new object[] {
                        "NguoiDungId", newNguoiDung.NguoiDungId,
                        "Email", newNguoiDung.Email,
                        "MatKhauHash", newNguoiDung.MatKhauHash,
                        "HoTen", newNguoiDung.HoTen,
                        "SDT", newNguoiDung.SDT,
                        "VaiTro", newNguoiDung.VaiTro,
                        "TrangThai", newNguoiDung.TrangThai,
                        "NgayTao", newNguoiDung.NgayTao,
                        "NgayCapNhat", newNguoiDung.NgayCapNhat }
                    }
                };
                // Gọi transaction
                var result = _dbHelper.ExecuteScalarSProcedureWithTransaction(out errors, storeInfos);

                // Kiểm tra lỗi từ DB
                if (errors != null && errors.Count > 0)
                    throw new Exception(string.Join(" | ", errors));

                return true;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
    }
}
