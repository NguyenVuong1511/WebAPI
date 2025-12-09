using DAL.Helper.Interfaces;
using DAL.Interfaces;
using Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAL
{
    public class NguoiDungRepository : INguoiDungRepository
    {
        private readonly IDatabaseHelper _databaseHelper;

        public NguoiDungRepository(IDatabaseHelper databaseHelper)
        {
            _databaseHelper = databaseHelper;
        }

        public bool Create(NguoiDung newNguoiDung, out string msg)
        {
            msg = string.Empty;
            try
            {
                msg = _databaseHelper.ExecuteSProcedure("sp_NguoiDung_Create",
                    "@NguoiDungId", newNguoiDung.NguoiDungId,
                    "@Email", newNguoiDung.Email,
                    "@MatKhauHash", newNguoiDung.MatKhauHash,
                    "@HoTen", newNguoiDung.HoTen,
                    "@SoDienThoai", newNguoiDung.SDT ?? "",
                    "@VaiTro", newNguoiDung.VaiTro ?? "Khách Hàng",
                    "@TrangThai", newNguoiDung.TrangThai,
                    "@NgayTao", DateTime.Now,
                    "@NgayCapNhat", DateTime.Now);

                // Kiểm tra trả về SP
                if (msg.Contains("EMAIL_EXISTS"))
                {
                    msg = "Email đã tồn tại";
                    return false;
                }

                return string.IsNullOrEmpty(msg) || msg.Contains("OK");
            }
            catch (Exception ex)
            {
                msg = ex.Message;
                return false;
            }
        }
    }
}
