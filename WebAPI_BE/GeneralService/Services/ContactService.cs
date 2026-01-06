using DTO.General;
using GeneralService.Interfaces;
using Infrastructure.Interfaces;
using Models;
using System.Data;

namespace GeneralService.Services
{
    public class ContactService : IContactService
    {
        private readonly IDatabaseHelper _dbHelper;

        public ContactService(IDatabaseHelper dbHelper)
        {
            _dbHelper = dbHelper;
        }

        // 1. Gửi liên hệ
        public async Task<ApiResponse<string>> SendContact(ContactCreateDto model)
        {
            var response = new ApiResponse<string>();
            try
            {
                // Gọi SP insert
                string result = await _dbHelper.ExecuteSProcedureAsync(
                    "sp_LienHe_Insert",
                    "@HoTen", model.HoTen,
                    "@Email", model.Email,
                    "@TieuDe", model.TieuDe,
                    "@NoiDung", model.NoiDung
                );

                if (string.IsNullOrEmpty(result))
                {
                    response.Success = true;
                    response.Message = "Gửi liên hệ thành công. Chúng tôi sẽ phản hồi sớm!";
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

        // 2. Lấy danh sách liên hệ (Admin)
        public async Task<ApiResponse<List<ContactViewDto>>> GetAllContacts()
        {
            var response = new ApiResponse<List<ContactViewDto>>();
            try
            {
                DataTable dt = await _dbHelper.ExecuteSProcedureReturnDataTableAsync("sp_LienHe_GetAll");
                var list = new List<ContactViewDto>();

                foreach (DataRow row in dt.Rows)
                {
                    list.Add(new ContactViewDto
                    {
                        LienHeId = Guid.Parse(row["LienHeId"].ToString()),
                        HoTen = row["HoTen"].ToString(),
                        Email = row["Email"].ToString(),
                        TieuDe = row["TieuDe"].ToString(),
                        NoiDung = row["NoiDung"].ToString(),
                        NgayGui = Convert.ToDateTime(row["NgayGui"]), // InvariantGlobalization=false sẽ giúp dòng này chạy ngon
                        DaXem = row["DaXem"] != DBNull.Value && Convert.ToBoolean(row["DaXem"])
                    });
                }

                response.Success = true;
                response.Data = list;
            }
            catch (Exception ex)
            {
                response.Success = false;
                response.Message = "Lỗi tải danh sách: " + ex.Message;
            }
            return response;
        }

        // 3. Đánh dấu đã xem
        public async Task<ApiResponse<string>> MarkAsRead(Guid lienHeId)
        {
            var response = new ApiResponse<string>();
            try
            {
                string result = await _dbHelper.ExecuteSProcedureAsync(
                    "sp_LienHe_MarkAsRead",
                    "@LienHeId", lienHeId
                );

                if (string.IsNullOrEmpty(result))
                {
                    response.Success = true;
                    response.Message = "Đã đánh dấu là đã xem.";
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

        // 4. Xóa liên hệ
        public async Task<ApiResponse<string>> DeleteContact(Guid lienHeId)
        {
            var response = new ApiResponse<string>();
            try
            {
                string result = await _dbHelper.ExecuteSProcedureAsync(
                    "sp_LienHe_Delete",
                    "@LienHeId", lienHeId
                );

                if (string.IsNullOrEmpty(result))
                {
                    response.Success = true;
                    response.Message = "Đã xóa liên hệ.";
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
