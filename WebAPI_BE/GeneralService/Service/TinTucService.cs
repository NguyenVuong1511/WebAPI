using DTO.TinTuc;
using GeneralService.Interfaces;
using Infrastructure.Interfaces;
using Models;
using System.Data;

namespace GeneralService.Service
{
    public class TinTucService : ITinTucService
    {
        private readonly IDatabaseHelper _dbHelper;
        public TinTucService(IDatabaseHelper dbHelper, IConfiguration config)
        {
            _dbHelper = dbHelper;
        }
        public async Task<List<TinTucDTO>> GetAllAsync()
        {
            var result = new List<TinTucDTO>();

            var dt = await _dbHelper.ExecuteSProcedureReturnDataTableAsync(
                "sp_TinTuc_GetAll"
            );

            if (dt != null && dt.Rows.Count > 0)
            {
                foreach (DataRow row in dt.Rows)
                {
                    result.Add(new TinTucDTO
                    {
                        TinTucId = Guid.Parse(row["TinTucId"].ToString()),
                        TieuDe = row["TieuDe"].ToString(),
                        NoiDung = row["NoiDung"].ToString(),
                        AnhDaiDien = row["AnhDaiDien"]?.ToString(),
                        NgayDang = Convert.ToDateTime(row["NgayDang"]),
                        NguoiDangId = Guid.Parse(row["NguoiDangId"].ToString())
                    });
                }
            }

            return result;
        }
        public async Task<TinTucDTO?> GetByIdAsync(Guid tinTucId)
        {
            if (tinTucId == Guid.Empty)
                return null;

            string msgError = string.Empty;
            var dt = _dbHelper.ExecuteSProcedureReturnDataTable(
                out msgError,
                "sp_TinTuc_GetById",
                "@TinTucId", tinTucId
            );

            if (dt != null && dt.Rows.Count > 0)
            {
                var row = dt.Rows[0];
                return new TinTucDTO
                {
                    TinTucId = Guid.Parse(row["TinTucId"].ToString()!),
                    TieuDe = row["TieuDe"].ToString(),
                    NoiDung = row["NoiDung"].ToString(),
                    AnhDaiDien = row["AnhDaiDien"]?.ToString(),
                    NgayDang = Convert.ToDateTime(row["NgayDang"]),
                    NguoiDangId = Guid.Parse(row["NguoiDangId"].ToString()!)
                };
            }

            return null;
        }
        public async Task<ApiResponse<bool>> CreateAsync(CreateTinTucDTO model)
        {
            if (model == null || string.IsNullOrWhiteSpace(model.TieuDe)|| string.IsNullOrWhiteSpace(model.NoiDung))
            {
                return new ApiResponse<bool>
                {
                    Success = false,
                    Message = "Thêm tin tức không thành công",
                    Data = false
                };
            }

            var result = await _dbHelper.ExecuteSProcedureAsync(
                "sp_TinTuc_Insert",
                "@TinTucId", Guid.NewGuid(),
                "@TieuDe", model.TieuDe,
                "@NoiDung", model.NoiDung,
                "@AnhDaiDien", model.AnhDaiDien,
                "@NguoiDangId", model.NguoiDangId
            );

            if (string.IsNullOrEmpty(result))
            {
                return new ApiResponse<bool>
                {
                    Success = true,
                    Message = "Thêm tin tức thành công",
                    Data = true
                };
            }
            else
            {
                return new ApiResponse<bool>
                {
                    Success = false,
                    Message = result,
                    Data = false
                };
            }
        }
        public async Task<ApiResponse<bool>> UpdateAsync(Guid id, CreateTinTucDTO model)
        {
            if (id == Guid.Empty)
            {
                return new ApiResponse<bool>
                {
                    Success = false,
                    Message = "Tin tức không tồn tại",
                    Data = false
                };
            }

            if (model == null
                || string.IsNullOrWhiteSpace(model.TieuDe)
                || string.IsNullOrWhiteSpace(model.NoiDung))
            {
                return new ApiResponse<bool>
                {
                    Success = false,
                    Message = "Tiêu đề và nội dung không được để trống",
                    Data = false
                };
            }

            var result = await _dbHelper.ExecuteSProcedureAsync(
                "sp_TinTuc_Update",
                "@TinTucId", id,
                "@TieuDe", model.TieuDe,
                "@NoiDung", model.NoiDung,
                "@AnhDaiDien", model.AnhDaiDien,
                "@NguoiDangId", model.NguoiDangId
            );

            if (string.IsNullOrEmpty(result))
            {
                return new ApiResponse<bool>
                {
                    Success = true,
                    Message = "Cập nhật tin tức thành công",
                    Data = true
                };
            }
            else
            {
                return new ApiResponse<bool>
                {
                    Success = false,
                    Message = result,
                    Data = false
                };
            }
        }
        public async Task<ApiResponse<bool>> DeleteAsync(Guid id)
        {
            // 1. Kiểm tra ID rỗng
            if (id == Guid.Empty)
            {
                return new ApiResponse<bool>
                {
                    Success = false,
                    Message = "ID tin tức không hợp lệ",
                    Data = false
                };
            }

            // 2. Gọi Stored Procedure
            var result = await _dbHelper.ExecuteSProcedureAsync(
                "sp_TinTuc_Delete",
                "@TinTucId", id
            );

            // 3. Xử lý kết quả trả về từ DatabaseHelper
            // Nếu result rỗng -> Thành công. Nếu có chữ -> Lỗi từ SQL (do RAISERROR hoặc Exception)
            if (string.IsNullOrEmpty(result))
            {
                return new ApiResponse<bool>
                {
                    Success = true,
                    Message = "Xóa tin tức thành công",
                    Data = true
                };
            }
            else
            {
                return new ApiResponse<bool>
                {
                    Success = false,
                    Message = result, // Message này lấy từ RAISERROR trong SQL
                    Data = false
                };
            }
        }

    }
}
