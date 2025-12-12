using DAL.Helper.Interfaces;
using DAL.Interfaces;
using Models;
using System;
using System.Collections.Generic;
using System.Data;

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

        public NguoiDung GetById(string nguoiDungId)
        {
            try
            {
                var dt = _databaseHelper.ExecuteSProcedureReturnDataTable(out string msg, "sp_NguoiDung_GetById",
                    "@NguoiDungId", nguoiDungId);

                if (dt.Rows.Count > 0)
                {
                    var row = dt.Rows[0];
                    return new NguoiDung
                    {
                        NguoiDungId = row["NguoiDungId"].ToString(),
                        Email = row["Email"].ToString(),
                        MatKhauHash = row["MatKhauHash"].ToString(),
                        HoTen = row["HoTen"].ToString(),
                        SDT = row["SoDienThoai"].ToString(),
                        VaiTro = row["VaiTro"].ToString(),
                        TrangThai = Convert.ToBoolean(row["TrangThai"]),
                        NgayTao = Convert.ToDateTime(row["NgayTao"]),
                        NgayCapNhat = Convert.ToDateTime(row["NgayCapNhat"])
                    };
                }
                return null;
            }
            catch
            {
                return null;
            }
        }

        public List<NguoiDung> GetAll()
        {
            var list = new List<NguoiDung>();
            try
            {
                var dt = _databaseHelper.ExecuteSProcedureReturnDataTable(out string msg, "sp_NguoiDung_GetAll");

                foreach (DataRow row in dt.Rows)
                {
                    list.Add(new NguoiDung
                    {
                        NguoiDungId = row["NguoiDungId"].ToString(),
                        Email = row["Email"].ToString(),
                        MatKhauHash = row["MatKhauHash"].ToString(),
                        HoTen = row["HoTen"].ToString(),
                        SDT = row["SoDienThoai"].ToString(),
                        VaiTro = row["VaiTro"].ToString(),
                        TrangThai = Convert.ToBoolean(row["TrangThai"]),
                        NgayTao = Convert.ToDateTime(row["NgayTao"]),
                        NgayCapNhat = Convert.ToDateTime(row["NgayCapNhat"])
                    });
                }
            }
            catch
            {
                // Log nếu cần
            }
            return list;
        }

        public bool Update(NguoiDung nguoiDung, out string msg)
        {
            msg = string.Empty;
            try
            {
                msg = _databaseHelper.ExecuteSProcedure("sp_NguoiDung_Update",
                    "@NguoiDungId", nguoiDung.NguoiDungId,
                    "@Email", nguoiDung.Email,
                    "@MatKhauHash", nguoiDung.MatKhauHash,
                    "@HoTen", nguoiDung.HoTen,
                    "@SoDienThoai", nguoiDung.SDT ?? "",
                    "@VaiTro", nguoiDung.VaiTro ?? "Khách Hàng",
                    "@TrangThai", nguoiDung.TrangThai,
                    "@NgayCapNhat", DateTime.Now);
                return string.IsNullOrEmpty(msg) || msg.Contains("OK");
            }
            catch (Exception ex)
            {
                msg = ex.Message;
                return false;
            }
        }

        public bool Delete(string nguoiDungId, out string msg)
        {
            msg = string.Empty;
            try
            {
                msg = _databaseHelper.ExecuteSProcedure("sp_NguoiDung_Delete",
                    "@NguoiDungId", nguoiDungId);

                return string.IsNullOrEmpty(msg) || msg.Contains("OK");
            }
            catch (Exception ex)
            {
                msg = ex.Message;
                return false;
            }
        }

        public NguoiDung GetByEmail(string email)
        {
            try
            {
                var dt = _databaseHelper.ExecuteSProcedureReturnDataTable(out string msg, "sp_NguoiDung_GetByEmail",
                    "@Email", email);

                if (dt.Rows.Count > 0)
                {
                    var row = dt.Rows[0];
                    return new NguoiDung
                    {
                        NguoiDungId = row["NguoiDungId"].ToString(),
                        Email = row["Email"].ToString(),
                        MatKhauHash = row["MatKhauHash"].ToString(),
                        HoTen = row["HoTen"].ToString(),
                        SDT = row["SoDienThoai"].ToString(),
                        VaiTro = row["VaiTro"].ToString(),
                        TrangThai = Convert.ToBoolean(row["TrangThai"]),
                        NgayTao = Convert.ToDateTime(row["NgayTao"]),
                        NgayCapNhat = Convert.ToDateTime(row["NgayCapNhat"])
                    };
                }
                return null;
            }
            catch
            {
                return null;
            }
        }

        public bool CheckExist(string Email)
        {
            // LƯU Ý: Cách này nguy hiểm nếu không kiểm soát kỹ dữ liệu đầu vào
            string query = $"SELECT COUNT(*) FROM NguoiDung WHERE Email = '{Email}'";

            string msgError = "";
            object result = _databaseHelper.ExecuteScalar(query, out msgError);

            // Kiểm tra lỗi
            if (!string.IsNullOrEmpty(msgError))
            {
                // Có lỗi kết nối hoặc SQL -> Trả về true để chặn (hoặc xử lý tùy logic)
                return true;
            }

            if (result != null && result != DBNull.Value)
            {
                return Convert.ToInt32(result) > 0;
            }
            return false;
        }
        public bool CheckEmailExist(string email, string nguoiDungIdToExclude)
        {
            // Escape ký tự ' để tránh lỗi SQL
            string safeEmail = email.Replace("'", "''");
            string safeId = string.IsNullOrEmpty(nguoiDungIdToExclude) ? null : nguoiDungIdToExclude.Replace("'", "''");

            string query = "SELECT COUNT(*) FROM NguoiDung WHERE Email = '" + safeEmail + "'";

            if (!string.IsNullOrEmpty(safeId))
            {
                query += " AND NguoiDungId <> '" + safeId + "'";
            }

            string msgError = "";
            object result = _databaseHelper.ExecuteScalar(query, out msgError);

            if (!string.IsNullOrEmpty(msgError))
            {
                // Có lỗi kết nối hoặc SQL -> trả về true để chặn (hoặc xử lý theo logic)
                return true;
            }

            if (result != null && result != DBNull.Value)
            {
                return Convert.ToInt32(result) > 0;
            }

            return false;
        }

    }
}
