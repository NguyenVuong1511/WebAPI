using DAL.Helper.Interfaces;
using DAL.Interfaces;
using Models;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAL
{
    public class TourRepository : ITourReository
    {
        private readonly IDatabaseHelper _databaseHelper;

        public TourRepository(IDatabaseHelper databaseHelper)
        {
            _databaseHelper = databaseHelper;
        }
        public bool Create(Tour newTour, out string msg)
        {
            msg = string.Empty;
            try
            {
                msg = _databaseHelper.ExecuteSProcedure("sp_Tour_Create",
                    "@TourId", newTour.TourId,
                    "@TenTourId", newTour.TenTourId ?? "",
                    "@MoTaNgan", newTour.MoTaNgan ?? "",
                    "@MoTaChiTiet", newTour.MoTaChiTiet ?? "",
                    "@DiemXuatPhat", newTour.DiemXuatPhat ?? "",
                    "@ThoiGian_BatDau", newTour.ThoiGian_BatDau,
                    "@ThoiGian_KetThuc", newTour.ThoiGian_KetThuc,
                    "@SoNgay", newTour.SoNgay,
                    "@TrangThai", newTour.TrangThai ?? "",
                    "@HinhAnh", newTour.HinhAnh ?? "",
                    "@CreatedAt", DateTime.Now,
                    "@UpdateAt", DateTime.Now);

                if (msg != null && msg.Contains("TOUR_EXISTS"))
                {
                    msg = "Tour đã tồn tại";
                    return false;
                }

                return string.IsNullOrEmpty(msg) || (msg != null && msg.Contains("OK"));
            }
            catch (Exception ex)
            {
                msg = ex.Message;
                return false;
            }
        }

        public Tour GetById(string tourId)
        {
            try
            {
                var dt = _databaseHelper.ExecuteSProcedureReturnDataTable(out string msg, "sp_Tour_GetById",
                    "@TourId", tourId);

                if (dt.Rows.Count > 0)
                {
                    var row = dt.Rows[0];
                    return new Tour
                    {
                        TourId = row["TourId"].ToString(),
                        TenTourId = row["TenTourId"].ToString(),
                        MoTaNgan = row["MoTaNgan"].ToString(),
                        MoTaChiTiet = row["MoTaChiTiet"].ToString(),
                        DiemXuatPhat = row["DiemXuatPhat"].ToString(),
                        ThoiGian_BatDau = Convert.ToDateTime(row["ThoiGian_BatDau"]),
                        ThoiGian_KetThuc = Convert.ToDateTime(row["ThoiGian_KetThuc"]),
                        SoNgay = Convert.ToInt32(row["SoNgay"]),
                        TrangThai = row["TrangThai"].ToString(),
                        HinhAnh = row["HinhAnh"].ToString(),
                        CreatedAt = Convert.ToDateTime(row["CreatedAt"]),
                        UpdateAt = Convert.ToDateTime(row["UpdateAt"])
                    };
                }

                return null;
            }
            catch
            {
                return null;
            }
        }

        public List<Tour> GetAll()
        {
            var list = new List<Tour>();
            try
            {
                var dt = _databaseHelper.ExecuteSProcedureReturnDataTable(out string msg, "sp_Tour_GetAll");

                foreach (DataRow row in dt.Rows)
                {
                    list.Add(new Tour
                    {
                        TourId = row["TourId"].ToString(),
                        TenTourId = row["TenTourId"].ToString(),
                        MoTaNgan = row["MoTaNgan"].ToString(),
                        MoTaChiTiet = row["MoTaChiTiet"].ToString(),
                        DiemXuatPhat = row["DiemXuatPhat"].ToString(),
                        ThoiGian_BatDau = Convert.ToDateTime(row["ThoiGian_BatDau"]),
                        ThoiGian_KetThuc = Convert.ToDateTime(row["ThoiGian_KetThuc"]),
                        SoNgay = Convert.ToInt32(row["SoNgay"]),
                        TrangThai = row["TrangThai"].ToString(),
                        HinhAnh = row["HinhAnh"].ToString(),
                        CreatedAt = Convert.ToDateTime(row["CreatedAt"]),
                        UpdateAt = Convert.ToDateTime(row["UpdateAt"])
                    });
                }
            }
            catch
            {
                // Có thể log nếu cần
            }
            return list;
        }

        public bool Update(Tour tour, out string msg)
        {
            msg = string.Empty;
            try
            {
                msg = _databaseHelper.ExecuteSProcedure("sp_Tour_Update",
                    "@TourId", tour.TourId,
                    "@TenTourId", tour.TenTourId ?? "",
                    "@MoTaNgan", tour.MoTaNgan ?? "",
                    "@MoTaChiTiet", tour.MoTaChiTiet ?? "",
                    "@DiemXuatPhat", tour.DiemXuatPhat ?? "",
                    "@ThoiGian_BatDau", tour.ThoiGian_BatDau,
                    "@ThoiGian_KetThuc", tour.ThoiGian_KetThuc,
                    "@SoNgay", tour.SoNgay,
                    "@TrangThai", tour.TrangThai ?? "",
                    "@HinhAnh", tour.HinhAnh ?? "",
                    "@UpdateAt", DateTime.Now);

                if (msg != null && msg.Contains("TOUR_EXISTS"))
                {
                    msg = "Tour đã tồn tại";
                    return false;
                }

                return string.IsNullOrEmpty(msg) || (msg != null && msg.Contains("OK"));
            }
            catch (Exception ex)
            {
                msg = ex.Message;
                return false;
            }
        }

        public bool Delete(string tourId, out string msg)
        {
            msg = string.Empty;
            try
            {
                msg = _databaseHelper.ExecuteSProcedure("sp_Tour_Delete",
                    "@TourId", tourId);

                return string.IsNullOrEmpty(msg) || (msg != null && msg.Contains("OK"));
            }
            catch (Exception ex)
            {
                msg = ex.Message;
                return false;
            }
        }
    }
}

