using System;
using System.Collections.Generic;
using System.Data;
using System.Threading.Tasks;
using DTO.Feedback;
using FeedbackService.Interfaces;
using Infrastructure.Interfaces;
using Models;

namespace Services.FeedbackService.Services
{
    public class FeedbackService : IFeedbackService
    {
        private readonly IDatabaseHelper _dbHelper;

        public FeedbackService(IDatabaseHelper dbHelper)
        {
            _dbHelper = dbHelper;
        }

        // 1. Xem danh sách đánh giá của 1 Tour
        public async Task<ApiResponse<List<FeedbackViewDto>>> GetFeedbackByTourId(Guid tourId)
        {
            var response = new ApiResponse<List<FeedbackViewDto>>();
            try
            {
                // Gọi SP lấy dữ liệu
                // Lưu ý cú pháp paramObjects: "TênThamSo", GiáTrị
                DataTable dt = await _dbHelper.ExecuteSProcedureReturnDataTableAsync(
                    "sp_DanhGia_GetByTourId",
                    "@TourId", tourId
                );

                var list = new List<FeedbackViewDto>();

                // Map từ DataTable sang List Object
                foreach (DataRow row in dt.Rows)
                {
                    list.Add(new FeedbackViewDto
                    {
                        DanhGiaId = Guid.Parse(row["DanhGiaId"].ToString()),
                        TourId = Guid.Parse(row["TourId"].ToString()),
                        NguoiDungId = Guid.Parse(row["NguoiDungId"].ToString()),
                        TenNguoiDung = row["TenNguoiDung"].ToString(),
                        Email = row["Email"].ToString(),
                        SoSao = Convert.ToInt32(row["SoSao"]),
                        BinhLuan = row["BinhLuan"].ToString(),
                        NgayDanhGia = Convert.ToDateTime(row["NgayDanhGia"])
                    });
                }

                response.Success = true;
                response.Data = list;
            }
            catch (Exception ex)
            {
                response.Success = false;
                response.Message = "Lỗi khi lấy đánh giá: " + ex.Message;
            }

            return response;
        }

        // 2. Viết đánh giá mới
        public async Task<ApiResponse<string>> CreateFeedback(FeedbackCreateDto model)
        {
            var response = new ApiResponse<string>();

            // Validate cơ bản
            if (model.SoSao < 1 || model.SoSao > 5)
            {
                response.Success = false;
                response.Message = "Số sao phải từ 1 đến 5.";
                return response;
            }

            try
            {
                string result = await _dbHelper.ExecuteSProcedureAsync(
                    "sp_DanhGia_Insert",
                    "@TourId", model.TourId,
                    "@NguoiDungId", model.NguoiDungId,
                    "@SoSao", model.SoSao,
                    "@BinhLuan", model.BinhLuan
                );

                if (string.IsNullOrEmpty(result)) // DatabaseHelper trả về rỗng là thành công
                {
                    response.Success = true;
                    response.Message = "Đánh giá thành công!";
                }
                else
                {
                    response.Success = false;
                    response.Message = result; // Chuỗi lỗi từ DatabaseHelper
                }
            }
            catch (Exception ex)
            {
                response.Success = false;
                response.Message = ex.Message;
            }

            return response;
        }

        // 3. Xóa đánh giá (Admin)
        public async Task<ApiResponse<string>> DeleteFeedback(Guid feedbackId)
        {
            var response = new ApiResponse<string>();
            try
            {
                string result = await _dbHelper.ExecuteSProcedureAsync(
                    "sp_DanhGia_Delete",
                    "@DanhGiaId", feedbackId
                );

                if (string.IsNullOrEmpty(result))
                {
                    response.Success = true;
                    response.Message = "Đã xóa đánh giá.";
                }
                else
                {
                    response.Success = false;
                    response.Message = result;
                }
            }
            catch (Exception ex)
            {
                response.Success = false;
                response.Message = ex.Message;
            }

            return response;
        }
    }
}