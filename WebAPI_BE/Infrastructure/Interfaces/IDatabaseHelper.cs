using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Interfaces
{
    public interface IDatabaseHelper
    {
        //-----------------------//
        //----QUẢN LÝ KẾT NỐI----//
        //-----------------------//
        void SetConnectionString(string connectionString);
        //-------------//
        // TRANSACTION //
        //-------------//
        string OpenConnectionAndBeginTransaction();
        string CloseConnectionAndEndTransaction(bool isRollbackTransaction);
        //------------//
        // SQL THƯỜNG //
        //------------//
        string ExecuteNoneQuery(string strquery);
        DataTable ExecuteQueryToDataTable(string strquery, out string msgError);
        object ExecuteScalar(string strquery, out string msgError);
        //------------------//
        // STORED PROCEDURE //
        //------------------//
        string ExecuteSProcedure(string procName, params object[] paramObjects);
        DataTable ExecuteSProcedureReturnDataTable(out string msgError, string procName, params object[] paramObjects);
        object ExecuteScalarSProcedure(out string msgError, string procName, params object[] paramObjects);
        //------------------------------------//
        // MULTI STORED PROCEDURE TRANSACTION //
        //------------------------------------//
        List<string> ExecuteSProcedureWithTransaction(List<StoreParameterInfo> storeInfos);
        List<object> ExecuteScalarSProcedureWithTransaction(out List<string> msgErrors, List<StoreParameterInfo> storeInfos);

    }
}
