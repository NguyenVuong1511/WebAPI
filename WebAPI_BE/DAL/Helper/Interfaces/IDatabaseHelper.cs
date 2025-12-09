using Microsoft.Data.SqlClient;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Helper.Interfaces
{
    public class StoreParameterInfo
    {
        public required string StoreProcedureName { get; set; }
        public required object[] StoreProcedureParams { get; set; }
    }
    public interface IDatabaseHelper
    {
        void SetConnectionString(string connectionString);
        string OpenConnection();
        string OpenConnectionAndBeginTransaction();
        string CloseConnection();
        string CloseConnectionAndEndTransaction(bool isRollbackTransaction);
        string ExecuteNoneQuery(string strquery);
        DataTable ExecuteQueryToDataTable(string strquery, out string msgError);
        object ExecuteScalar(string strquery, out string msgError);
        string ExecuteSProcedure(string procName, params object[] paramObjects);
        DataTable ExecuteSProcedureReturnDataTable(out string msgError, string procName, params object[] paramObjects);
        object ExecuteScalarSProcedure(out string msgError, string procName, params object[] paramObjects);
        List<string> ExecuteSProcedureWithTransaction(List<StoreParameterInfo> storeInfos);
        List<object> ExecuteScalarSProcedureWithTransaction(out List<string> msgErrors, List<StoreParameterInfo> storeInfos);
    }
}
