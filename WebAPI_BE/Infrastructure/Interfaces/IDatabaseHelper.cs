using System;
using System.Collections.Generic;
using System.Data;
using System.Threading.Tasks; // Cần thêm namespace này

namespace Infrastructure.Interfaces
{
    public interface IDatabaseHelper
    {
        // ... (Giữ nguyên các hàm Sync cũ nếu muốn dùng song song) ...
        void SetConnectionString(string connectionString);

        // ==========================================
        // ASYNC METHODS (Dùng cho BookingService mới)
        // ==========================================

        // 1. Thực thi thủ tục không trả về dữ liệu (VD: Update, Delete, Insert đơn lẻ)
        // Trả về string.Empty nếu thành công, trả về Message lỗi nếu thất bại
        Task<string> ExecuteSProcedureAsync(string procName, params object[] paramObjects);

        // 2. Thực thi thủ tục trả về DataTable (VD: GetById, GetAll)
        // Trả về DataTable. Nếu lỗi sẽ return null hoặc throw Exception tùy logic
        Task<DataTable> ExecuteSProcedureReturnDataTableAsync(string procName, params object[] paramObjects);

        // 3. Thực thi Transaction nhiều thủ tục (VD: Create Booking + Create Detail)
        // Trả về danh sách lỗi (List<string>). Nếu Count == 0 là thành công.
        Task<List<string>> ExecuteSProcedureWithTransactionAsync(List<StoreParameterInfo> storeInfos);
        
        // ==========================================
        // CÁC HÀM SYNC CŨ (Giữ lại để không lỗi code cũ)
        // ==========================================
        string OpenConnectionAndBeginTransaction();
        string CloseConnectionAndEndTransaction(bool isRollbackTransaction);
        string ExecuteNoneQuery(string strquery);
        DataTable ExecuteQueryToDataTable(string strquery, out string msgError);
        object ExecuteScalar(string strquery, out string msgError);
        string ExecuteSProcedure(string procName, params object[] paramObjects);
        DataTable ExecuteSProcedureReturnDataTable(out string msgError, string procName, params object[] paramObjects);
        List<string> ExecuteSProcedureWithTransaction(List<StoreParameterInfo> storeInfos);
    }
}