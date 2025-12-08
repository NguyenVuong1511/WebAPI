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
        public string StoreProcedureName { get; set; }
        public List<Object> StoreProcedureParams { get; set; }
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
    }
}
