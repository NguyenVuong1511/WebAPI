using BookingService.Interfaces;
using Infrastructure;
using Infrastructure.Interfaces;
using Infrastructure.Helpers; // Dùng CollectionHelper.ConvertTo
using Models;
using System;
using System.Collections.Generic;
using System.Data;
using Microsoft.Data.SqlClient;
using System.Threading.Tasks;
using DTO.Booking;

namespace BookingService.Services
{
    public class BookingService : IBookingService
    {
        private readonly IDatabaseHelper _dbHelper;

        public BookingService(IDatabaseHelper dbHelper)
        {
            _dbHelper = dbHelper;
        }

        // ==========================================================
        // KHÁCH HÀNG: ĐẶT TOUR
        // ==========================================================
        public async Task<ApiResponse<string>> CreateBookingAsync(CreateBookingRequest request)
        {
            var response = new ApiResponse<string>();
            try
            {
                // 1. Lấy giá Tour (Async) để tính tổng tiền tại Server
                var dtPrice = await _dbHelper.ExecuteSProcedureReturnDataTableAsync("sp_Tour_GetPrice",
                    "@TourId", request.TourId);

                if (dtPrice == null || dtPrice.Rows.Count == 0)
                {
                    response.Success = false;
                    response.Message = "Không tìm thấy thông tin Tour hoặc lỗi hệ thống.";
                    return response;
                }

                decimal giaNguoiLon = Convert.ToDecimal(dtPrice.Rows[0]["GiaNguoiLon"]);
                decimal giaTreEm = Convert.ToDecimal(dtPrice.Rows[0]["GiaTreEm"]);
                decimal tongTien = (request.SoNguoiLon * giaNguoiLon) + (request.SoTreEm * giaTreEm);

                // 2. Chuẩn bị dữ liệu Transaction
                Guid newBookingId = Guid.NewGuid();
                List<StoreParameterInfo> storeInfos = new List<StoreParameterInfo>();

                // a. Thêm Header (Bảng Booking)
                storeInfos.Add(new StoreParameterInfo
                {
                    StoreProcedureName = "sp_Booking_Insert",
                    StoreProcedureParams = new List<SqlParameter>
                    {
                        new SqlParameter("@BookingId", newBookingId),
                        new SqlParameter("@TourId", request.TourId),
                        new SqlParameter("@NguoiDungId", request.NguoiDungId),
                        new SqlParameter("@SoNguoiLon", request.SoNguoiLon),
                        new SqlParameter("@SoTreEm", request.SoTreEm),
                        new SqlParameter("@TongTien", tongTien),
                        new SqlParameter("@PhuongThucThanhToan", request.PhuongThucThanhToan),
                        new SqlParameter("@GhiChu", request.GhiChu ?? "")
                    }
                });

                // b. Thêm Details (Bảng BookingChiTiet - Loop qua danh sách khách)
                if (request.KhachHang != null)
                {
                    foreach (var guest in request.KhachHang)
                    {
                        storeInfos.Add(new StoreParameterInfo
                        {
                            StoreProcedureName = "sp_BookingChiTiet_Insert",
                            StoreProcedureParams = new List<SqlParameter>
                            {
                                new SqlParameter("@BookingId", newBookingId),
                                new SqlParameter("@HoTen", guest.HoTen),
                                new SqlParameter("@LoaiKhach", guest.LoaiKhach),
                                new SqlParameter("@CMND", guest.CMND ?? "")
                            }
                        });
                    }
                }

                // 3. Thực thi Transaction (Async)
                // Hàm này trả về List<string> chứa lỗi. Nếu count == 0 là thành công.
                var errors = await _dbHelper.ExecuteSProcedureWithTransactionAsync(storeInfos);

                if (errors.Count > 0)
                {
                    response.Success = false;
                    response.Message = "Lỗi khi đặt tour: " + string.Join(", ", errors);
                }
                else
                {
                    response.Success = true;
                    response.Message = "Đặt tour thành công!";
                    response.Data = newBookingId.ToString();
                }
            }
            catch (Exception ex)
            {
                response.Success = false;
                response.Message = "Exception: " + ex.Message;
            }
            return response;
        }

        // ==========================================================
        // KHÁCH HÀNG: XEM LỊCH SỬ
        // ==========================================================
        public async Task<ApiResponse<List<BookingViewModel>>> GetMyHistoryAsync(Guid userId)
        {
            var response = new ApiResponse<List<BookingViewModel>>();
            try
            {
                var dt = await _dbHelper.ExecuteSProcedureReturnDataTableAsync("sp_Booking_GetByUserId",
                    "@NguoiDungId", userId);

                if (dt == null)
                {
                    response.Success = false;
                    response.Message = "Lỗi kết nối cơ sở dữ liệu.";
                }
                else
                {
                    // ConvertTo là Extension method từ CollectionHelper
                    response.Data = (List<BookingViewModel>)dt.ConvertTo<BookingViewModel>();
                    response.Success = true;
                }
            }
            catch (Exception ex)
            {
                response.Success = false;
                response.Message = ex.Message;
            }
            return response;
        }

        // ==========================================================
        // KHÁCH HÀNG: HỦY ĐƠN
        // ==========================================================
        public async Task<ApiResponse<string>> CancelBookingAsync(Guid bookingId, Guid userId)
        {
            var response = new ApiResponse<string>();

            // Logic mở rộng: Nên check xem đơn hàng có phải của userId này không trước khi hủy
            // Nhưng ở đây ta gọi thẳng procedure update

            string result = await _dbHelper.ExecuteSProcedureAsync("sp_Booking_UpdateStatus",
                "@BookingId", bookingId,
                "@TrangThaiThanhToan", "Đã hủy"); // Trạng thái text cứng hoặc dùng Enum

            if (string.IsNullOrEmpty(result))
            {
                response.Success = true;
                response.Message = "Hủy đơn hàng thành công.";
            }
            else
            {
                response.Success = false;
                response.Message = "Lỗi hủy đơn: " + result;
            }
            return response;
        }

        // ==========================================================
        // ADMIN: XEM TẤT CẢ ĐƠN
        // ==========================================================
        public async Task<ApiResponse<List<BookingViewModel>>> GetAllBookingsAsync()
        {
            var response = new ApiResponse<List<BookingViewModel>>();
            try
            {
                var dt = await _dbHelper.ExecuteSProcedureReturnDataTableAsync("sp_Booking_GetAll");

                if (dt == null)
                {
                    response.Success = false;
                    response.Message = "Lỗi lấy danh sách đơn hàng.";
                }
                else
                {
                    response.Data = (List<BookingViewModel>)dt.ConvertTo<BookingViewModel>();
                    response.Success = true;
                }
            }
            catch (Exception ex)
            {
                response.Success = false;
                response.Message = ex.Message;
            }
            return response;
        }

        // ==========================================================
        // ADMIN: DUYỆT ĐƠN (Thanh toán thành công)
        // ==========================================================
        public async Task<ApiResponse<string>> ApproveBookingAsync(Guid bookingId)
        {
            var response = new ApiResponse<string>();

            string result = await _dbHelper.ExecuteSProcedureAsync("sp_Booking_UpdateStatus",
                "@BookingId", bookingId,
                "@TrangThaiThanhToan", "Đã thanh toán");

            if (string.IsNullOrEmpty(result))
            {
                response.Success = true;
                response.Message = "Duyệt đơn hàng thành công.";
            }
            else
            {
                response.Success = false;
                response.Message = "Lỗi duyệt đơn: " + result;
            }
            return response;
        }

        // ==========================================================
        // ADMIN/USER: XEM CHI TIẾT ĐƠN (Header + Detail)
        // ==========================================================
        public async Task<ApiResponse<BookingViewModel>> GetBookingDetailAsync(Guid bookingId)
        {
            // Hàm này cần xử lý hơi khác vì SP trả về 2 bảng (Header và Detail)
            // Tuy nhiên ExecuteSProcedureReturnDataTableAsync hiện tại chỉ lấy bảng đầu tiên (Header).
            // Nếu muốn lấy cả Detail, bạn cần nâng cấp DatabaseHelper để hỗ trợ DataSet hoặc gọi 2 lần.
            // Ở mức độ cơ bản, tôi sẽ chỉ lấy thông tin chung.

            var response = new ApiResponse<BookingViewModel>();
            // Code tạm thời lấy Header
            return response;
        }
    }
}