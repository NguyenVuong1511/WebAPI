using BookingService.Interfaces;
using DTO.Booking;
using Infrastructure.Interfaces;
using System.Data;

namespace BookingService.Services
{
    public class BookingThongKeService : IBookingThongKeService
    {
        private readonly IDatabaseHelper _dbHelper;

        public BookingThongKeService(IDatabaseHelper dbHelper)
        {
            _dbHelper = dbHelper;
        }

        public async Task<DashboardViewModel> GetDashboardStatsAsync()
        {
            var result = new DashboardViewModel();

            // Gọi Stored Procedure trả về DataSet
            DataSet ds = await _dbHelper.ExecuteSProcedureReturnDataSetAsync("sp_ThongKe_Dashboard");

            if (ds != null && ds.Tables.Count > 0)
            {
                // 1. Xử lý Bảng 1: Số liệu tổng quát (Luôn là Row đầu tiên của Table[0])
                if (ds.Tables[0].Rows.Count > 0)
                {
                    DataRow row = ds.Tables[0].Rows[0];
                    result.TongDoanhThu = row["TongDoanhThu"] != DBNull.Value ? Convert.ToDecimal(row["TongDoanhThu"]) : 0;
                    result.BookingTrongThang = row["BookingTrongThang"] != DBNull.Value ? Convert.ToInt32(row["BookingTrongThang"]) : 0;
                    result.TongKhachHang = row["TongKhachHang"] != DBNull.Value ? Convert.ToInt32(row["TongKhachHang"]) : 0;
                }

                // 2. Xử lý Bảng 2: Top 5 Tour (Nằm ở Table[1])
                if (ds.Tables.Count > 1 && ds.Tables[1].Rows.Count > 0)
                {
                    foreach (DataRow row in ds.Tables[1].Rows)
                    {
                        result.TopTours.Add(new TopTourModel
                        {
                            TenTour = row["TenTour"].ToString() ?? "",
                            GiaTien = row["GiaNguoiLon"] != DBNull.Value ? Convert.ToDecimal(row["GiaNguoiLon"]) : 0,
                            SoLuotDat = row["SoLuotDat"] != DBNull.Value ? Convert.ToInt32(row["SoLuotDat"]) : 0,
                            DoanhThuTour = row["DoanhThuTour"] != DBNull.Value ? Convert.ToDecimal(row["DoanhThuTour"]) : 0
                        });
                    }
                }
            }

            return result;
        }
    }
}
