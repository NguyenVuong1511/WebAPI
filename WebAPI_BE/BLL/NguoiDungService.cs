using BLL.Interfaces;
using DAL.Interfaces;
using Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BLL
{
    public class NguoiDungService : INguoiDungService
    {
        private readonly INguoiDungRepository _repo;

        public NguoiDungService(INguoiDungRepository repo)
        {
            _repo = repo;
        }

        public bool Create(NguoiDung nguoiDung, out string msg)
        {
            msg = string.Empty;

            try
            {
                // Hash mật khẩu trước khi lưu
                //nguoiDung.MatKhauHash = BCrypt.Net.BCrypt.HashPassword(nguoiDung.MatKhauHash);

                // Tạo ID mới nếu chưa có
                if (string.IsNullOrEmpty(nguoiDung.NguoiDungId))
                    nguoiDung.NguoiDungId = Guid.NewGuid().ToString();

                // Tự set ngày tạo và cập nhật
                nguoiDung.NgayTao = DateTime.Now;
                nguoiDung.NgayCapNhat = DateTime.Now;

                return _repo.Create(nguoiDung, out msg);
            }
            catch (Exception ex)
            {
                msg = ex.Message;
                return false;
            }
        }
    }
}
