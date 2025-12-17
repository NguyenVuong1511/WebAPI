using BLL.Interfaces;
using DAL.Interfaces;
using Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
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

            // 1. Kiểm tra đối tượng đầu vào (Null Check)
            if (nguoiDung == null)
            {
                msg = "Dữ liệu người dùng không hợp lệ (null).";
                return false;
            }

            // 2. Validate dữ liệu bắt buộc (Data Validation)
            if (string.IsNullOrWhiteSpace(nguoiDung.HoTen))
            {
                msg = "Vui lòng nhập họ tên.";
                return false;
            }

            if (string.IsNullOrWhiteSpace(nguoiDung.Email))
            {
                msg = "Vui lòng nhập Email.";
                return false;
            }

            // Kiểm tra định dạng email
            if (!Regex.IsMatch(nguoiDung.Email, @"^[^@\s]+@[^@\s]+\.[^@\s]+$"))
            {
                msg = "Email không hợp lệ.";
                return false;
            }

            // Kiểm tra số điện thoại (ví dụ: chỉ 10-11 chữ số)
            if (!string.IsNullOrWhiteSpace(nguoiDung.SDT) &&
                !Regex.IsMatch(nguoiDung.SDT, @"^\d{10,11}$"))
            {
                msg = "Số điện thoại không hợp lệ.";
                return false;
            }

            if (string.IsNullOrWhiteSpace(nguoiDung.MatKhauHash))
            {
                msg = "Vui lòng nhập mật khẩu.";
                return false;
            }

            try
            {
                if (_repo.CheckExist(nguoiDung.Email))
                {
                    msg = "Email đã tồn tại trong hệ thống.";
                    return false;
                }

                //nguoiDung.MatKhauHash = BCrypt.Net.BCrypt.HashPassword(nguoiDung.MatKhauHash);

                if (string.IsNullOrEmpty(nguoiDung.NguoiDungId))
                {
                    nguoiDung.NguoiDungId = Guid.NewGuid().ToString();
                }

                nguoiDung.NgayTao = DateTime.Now;
                nguoiDung.NgayCapNhat = DateTime.Now;
                nguoiDung.TrangThai = true;

                return _repo.Create(nguoiDung, out msg);
            }
            catch (Exception ex)
            {
                msg = "Đã xảy ra lỗi trong quá trình xử lý: " + ex.Message;
                return false;
            }
        }

        public NguoiDung GetById(string nguoiDungId)
        {
            return _repo.GetById(nguoiDungId);
        }
        public List<NguoiDung> GetAll()
        {
            return _repo.GetAll();
        }
        public bool Update(NguoiDung nguoiDung, out string msg)
        {
            msg = string.Empty;

            // 1. Kiểm tra đối tượng đầu vào (Null Check)
            if (nguoiDung == null)
            {
                msg = "Dữ liệu người dùng không hợp lệ (null).";
                return false;
            }

            // 2. Validate dữ liệu bắt buộc (Data Validation)
            if (string.IsNullOrWhiteSpace(nguoiDung.HoTen))
            {
                msg = "Vui lòng nhập họ tên.";
                return false;
            }

            if (string.IsNullOrWhiteSpace(nguoiDung.Email))
            {
                msg = "Vui lòng nhập Email.";
                return false;
            }

            // Kiểm tra định dạng email
            if (!Regex.IsMatch(nguoiDung.Email, @"^[^@\s]+@[^@\s]+\.[^@\s]+$"))
            {
                msg = "Email không hợp lệ.";
                return false;
            }

            try
            {
                if (_repo.CheckEmailExist(nguoiDung.Email, nguoiDung.NguoiDungId))
                {
                    msg = "Email đã tồn tại trong hệ thống.";
                    return false;
                }

                nguoiDung.NgayCapNhat = DateTime.Now;
                nguoiDung.TrangThai = true;

                return _repo.Update(nguoiDung, out msg);
            }
            catch (Exception ex)
            {
                msg = "Đã xảy ra lỗi trong quá trình xử lý: " + ex.Message;
                return false;
            }
        }
        public bool Delete(string nguoiDungId, out string msg)
        {
            msg = string.Empty;
            if(nguoiDungId == null)
            {
                msg = "Chưa có người dùng nào được chọn";
                return false;
            }
            else
            {
                _repo.Delete(nguoiDungId,out msg);
                msg = "Xóa thành công người dùng id: " + nguoiDungId;
                return true;
            }
        }
        public NguoiDung GetByEmail(string email)
        {
            return _repo.GetByEmail(email);
        }
    }
}
