using Models;
using System.Collections.Generic;

namespace DAL.Interfaces
{
    public interface INguoiDungRepository
    {
        // Tạo mới người dùng
        bool Create(NguoiDung newNguoiDung, out string msg);

        //Lấy người dùng theo ID
        NguoiDung GetById(string nguoiDungId);

        // Lấy tất cả người dùng
        List<NguoiDung> GetAll();

        // Cập nhật thông tin người dùng
        bool Update(NguoiDung nguoiDung, out string msg);

        // Xóa người dùng theo ID
        bool Delete(string nguoiDungId, out string msg);

        // Tìm kiếm người dùng theo email
        NguoiDung GetByEmail(string email);
    }
}
