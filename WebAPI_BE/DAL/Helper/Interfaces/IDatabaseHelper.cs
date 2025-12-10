using Microsoft.Data.SqlClient;
using System.Collections.Generic;
using System.Data;

namespace DAL.Helper.Interfaces
{
    // Thông tin 1 stored procedure dùng trong transaction
    public class StoreParameterInfo
    {
        public required string StoreProcedureName { get; set; }
        public required List<SqlParameter> StoreProcedureParams { get; set; }
    }

    public interface IDatabaseHelper
    {
        // =========================
        // Connection String
        // =========================
        void SetConnectionString(string connectionString);

        // =========================
        // Transaction ONLY
        // =========================
        string OpenConnectionAndBeginTransaction();
        string CloseConnectionAndEndTransaction(bool isRollbackTransaction);

        // =========================
        // SQL Query thường (non-transaction)
        // =========================
        string ExecuteNoneQuery(string strquery);
        DataTable ExecuteQueryToDataTable(string strquery, out string msgError);
        object ExecuteScalar(string strquery, out string msgError);

        // =========================
        // Stored Procedure thường
        // =========================
        string ExecuteSProcedure(string procName, params object[] paramObjects);
        DataTable ExecuteSProcedureReturnDataTable(out string msgError, string procName, params object[] paramObjects);
        object ExecuteScalarSProcedure(out string msgError, string procName, params object[] paramObjects);

        // =========================
        // Multi Stored Procedure Transaction
        // =========================
        List<string> ExecuteSProcedureWithTransaction(List<StoreParameterInfo> storeInfos);
        List<object> ExecuteScalarSProcedureWithTransaction(out List<string> msgErrors, List<StoreParameterInfo> storeInfos);
    }
}
