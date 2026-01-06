using DTO.DiaDiem;
using GeneralService.Interfaces;
using Infrastructure.Interfaces;
using Models;
using System.Data;

namespace GeneralService.Service
{
    public class DiaDiemService : IDiaDiemService
    {
        private readonly IDatabaseHelper _dbHelper;

        public DiaDiemService(IDatabaseHelper dbHelper)
        {
            _dbHelper = dbHelper;
        }

        public async Task<ApiResponse<List<DiaDiemDTO>>> GetAllAsync()
        {
            try
            {
                // Gọi database helper (Async)
                var dt = await _dbHelper.ExecuteSProcedureReturnDataTableAsync("sp_DiaDiem_GetAll");
                var list = new List<DiaDiemDTO>();

                if (dt != null && dt.Rows.Count > 0)
                {
                    foreach (DataRow row in dt.Rows)
                    {
                        list.Add(new DiaDiemDTO
                        {
                            DiaDiemId = Guid.Parse(row["DiaDiemId"].ToString()!),
                            TenDiaDiem = row["TenDiaDiem"].ToString()!,
                            MoTa = row["MoTa"] != DBNull.Value ? row["MoTa"].ToString() : null
                        });
                    }
                }

                return new ApiResponse<List<DiaDiemDTO>>
                {
                    Success = true,
                    Message = "Lấy dữ liệu thành công",
                    Data = list
                };
            }
            catch (Exception ex)
            {
                return new ApiResponse<List<DiaDiemDTO>>
                {
                    Success = false,
                    Message = "Lỗi hệ thống: " + ex.Message
                };
            }
        }

        public async Task<ApiResponse<DiaDiemDTO>> GetByIdAsync(Guid id)
        {
            try
            {
                var dt = await _dbHelper.ExecuteSProcedureReturnDataTableAsync("sp_DiaDiem_GetById", "@DiaDiemId", id);
                if (dt != null && dt.Rows.Count > 0)
                {
                    var row = dt.Rows[0];
                    var data = new DiaDiemDTO
                    {
                        DiaDiemId = Guid.Parse(row["DiaDiemId"].ToString()!),
                        TenDiaDiem = row["TenDiaDiem"].ToString()!,
                        MoTa = row["MoTa"] != DBNull.Value ? row["MoTa"].ToString() : null
                    };

                    return new ApiResponse<DiaDiemDTO>
                    {
                        Success = true,
                        Data = data
                    };
                }

                return new ApiResponse<DiaDiemDTO>
                {
                    Success = false,
                    Message = "Không tìm thấy địa điểm",
                    Code = "404"
                };
            }
            catch (Exception ex)
            {
                return new ApiResponse<DiaDiemDTO>
                {
                    Success = false,
                    Message = "Lỗi hệ thống: " + ex.Message
                };
            }
        }

        public async Task<ApiResponse<string>> CreateAsync(DiaDiemDTO model)
        {
            // Validation nghiệp vụ tại Service
            if (string.IsNullOrEmpty(model.TenDiaDiem))
            {
                return new ApiResponse<string>
                {
                    Success = false,
                    Message = "Tên địa điểm không được để trống"
                };
            }

            model.DiaDiemId = Guid.NewGuid();

            // ExecuteSProcedureAsync trong DatabaseHelper trả về string lỗi (nếu có) hoặc rỗng (nếu OK)
            string result = await _dbHelper.ExecuteSProcedureAsync("sp_DiaDiem_Insert",
                "@DiaDiemId", model.DiaDiemId,
                "@TenDiaDiem", model.TenDiaDiem,
                "@MoTa", model.MoTa);

            if (string.IsNullOrEmpty(result))
            {
                return new ApiResponse<string>
                {
                    Success = true,
                    Message = "Thêm địa điểm thành công"
                };
            }

            return new ApiResponse<string>
            {
                Success = false,
                Message = "Lỗi database: " + result
            };
        }

        public async Task<ApiResponse<string>> UpdateAsync(DiaDiemDTO model)
        {
            if (string.IsNullOrEmpty(model.TenDiaDiem))
            {
                return new ApiResponse<string>
                {
                    Success = false,
                    Message = "Tên địa điểm không được để trống"
                };
            }

            string result = await _dbHelper.ExecuteSProcedureAsync("sp_DiaDiem_Update",
                "@DiaDiemId", model.DiaDiemId,
                "@TenDiaDiem", model.TenDiaDiem,
                "@MoTa", model.MoTa);

            if (string.IsNullOrEmpty(result))
            {
                return new ApiResponse<string>
                {
                    Success = true,
                    Message = "Cập nhật thành công"
                };
            }

            return new ApiResponse<string>
            {
                Success = false,
                Message = "Lỗi database: " + result
            };
        }

        public async Task<ApiResponse<string>> DeleteAsync(Guid id)
        {
            string result = await _dbHelper.ExecuteSProcedureAsync("sp_DiaDiem_Delete", "@DiaDiemId", id);

            if (string.IsNullOrEmpty(result))
            {
                return new ApiResponse<string>
                {
                    Success = true,
                    Message = "Xóa thành công"
                };
            }

            return new ApiResponse<string>
            {
                Success = false,
                Message = "Lỗi database: " + result
            };
        }
    }
}
