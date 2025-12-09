using DAL.Helper.Interfaces;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Data;

namespace DAL.Helper
{
    public class DatabaseHelper : IDatabaseHelper
    {
        public string StrConnection { get; set; }
        public SqlConnection sqlConnection { get; set; }
        public SqlTransaction sqlTransaction { get; set; }

        public DatabaseHelper(IConfiguration configuration)
        {
            StrConnection = configuration["ConnectionStrings:DefaultConnection"];
        }

        public void SetConnectionString(string connectionString)
        {
            StrConnection = connectionString;
        }

        // ================================
        // 1. OPEN / CLOSE CONNECTION
        // ================================
        public string OpenConnection()
        {
            try
            {
                sqlConnection = new SqlConnection(StrConnection);
                sqlConnection.Open();
                return string.Empty;
            }
            catch (Exception ex)
            {
                return ex.Message;
            }
        }

        public string OpenConnectionAndBeginTransaction()
        {
            try
            {
                sqlConnection = new SqlConnection(StrConnection);
                sqlConnection.Open();
                sqlTransaction = sqlConnection.BeginTransaction();
                return string.Empty;
            }
            catch (Exception ex)
            {
                return ex.Message;
            }
        }

        public string CloseConnection()
        {
            try
            {
                if (sqlConnection != null && sqlConnection.State != ConnectionState.Closed)
                    sqlConnection.Close();

                return string.Empty;
            }
            catch (Exception ex)
            {
                return ex.Message;
            }
        }

        public string CloseConnectionAndEndTransaction(bool isRollback)
        {
            try
            {
                if (sqlTransaction != null)
                {
                    if (isRollback)
                        sqlTransaction.Rollback();
                    else
                        sqlTransaction.Commit();
                }

                if (sqlConnection != null && sqlConnection.State != ConnectionState.Closed)
                    sqlConnection.Close();

                return string.Empty;
            }
            catch (Exception ex)
            {
                return ex.Message;
            }
        }

        // ================================
        // 2. SQL QUERY THƯỜNG
        // ================================
        public string ExecuteNoneQuery(string sql)
        {
            try
            {
                using (SqlConnection conn = new SqlConnection(StrConnection))
                {
                    conn.Open();
                    SqlCommand cmd = new SqlCommand(sql, conn);
                    cmd.ExecuteNonQuery();
                }
                return string.Empty;
            }
            catch (Exception ex)
            {
                return ex.Message;
            }
        }

        public DataTable ExecuteQueryToDataTable(string sql, out string msgError)
        {
            msgError = string.Empty;
            DataTable dt = new DataTable();

            try
            {
                using (SqlConnection conn = new SqlConnection(StrConnection))
                {
                    conn.Open();
                    SqlDataAdapter da = new SqlDataAdapter(sql, conn);
                    da.Fill(dt);
                }
            }
            catch (Exception ex)
            {
                msgError = ex.Message;
            }

            return dt;
        }

        public object ExecuteScalar(string sql, out string msgError)
        {
            msgError = string.Empty;

            try
            {
                using (SqlConnection conn = new SqlConnection(StrConnection))
                {
                    conn.Open();
                    SqlCommand cmd = new SqlCommand(sql, conn);
                    return cmd.ExecuteScalar();
                }
            }
            catch (Exception ex)
            {
                msgError = ex.Message;
                return null;
            }
        }

        // ================================
        // 3. STORE PROCEDURE
        // ================================
        private SqlCommand PrepareCommand(SqlConnection conn, string proc, object[] paramObjects)
        {
            SqlCommand cmd = new SqlCommand(proc, conn);
            cmd.CommandType = CommandType.StoredProcedure;

            if (paramObjects != null && paramObjects.Length > 0)
            {
                for (int i = 0; i < paramObjects.Length; i += 2)
                {
                    string paramName = paramObjects[i].ToString();
                    object paramValue = paramObjects[i + 1];

                    cmd.Parameters.AddWithValue(paramName, paramValue ?? DBNull.Value);
                }
            }

            return cmd;
        }

        public string ExecuteSProcedure(string procName, params object[] paramObjects)
        {
            try
            {
                using (SqlConnection conn = new SqlConnection(StrConnection))
                {
                    conn.Open();
                    SqlCommand cmd = PrepareCommand(conn, procName, paramObjects);
                    cmd.ExecuteNonQuery();
                }
                return string.Empty;
            }
            catch (Exception ex)
            {
                return ex.Message;
            }
        }

        public DataTable ExecuteSProcedureReturnDataTable(out string msgError, string procName, params object[] paramObjects)
        {
            msgError = string.Empty;
            DataTable dt = new DataTable();

            try
            {
                using (SqlConnection conn = new SqlConnection(StrConnection))
                {
                    conn.Open();
                    SqlCommand cmd = PrepareCommand(conn, procName, paramObjects);
                    SqlDataAdapter da = new SqlDataAdapter(cmd);
                    da.Fill(dt);
                }
            }
            catch (Exception ex)
            {
                msgError = ex.Message;
            }

            return dt;
        }

        public object ExecuteScalarSProcedure(out string msgError, string procName, params object[] paramObjects)
        {
            msgError = string.Empty;

            try
            {
                using (SqlConnection conn = new SqlConnection(StrConnection))
                {
                    conn.Open();
                    SqlCommand cmd = PrepareCommand(conn, procName, paramObjects);
                    return cmd.ExecuteScalar();
                }
            }
            catch (Exception ex)
            {
                msgError = ex.Message;
                return null;
            }
        }

        // ================================
        // 4. TRANSACTION MULTI STORE
        // ================================
        public List<string> ExecuteSProcedureWithTransaction(List<StoreParameterInfo> storeInfos)
        {
            List<string> errors = new List<string>();

            try
            {
                OpenConnectionAndBeginTransaction();

                foreach (var item in storeInfos)
                {
                    SqlCommand cmd = new SqlCommand(item.StoreProcedureName, sqlConnection, sqlTransaction);
                    cmd.CommandType = CommandType.StoredProcedure;

                    foreach (var p in item.StoreProcedureParams)
                        cmd.Parameters.Add(p);

                    cmd.ExecuteNonQuery();
                }

                CloseConnectionAndEndTransaction(false);
            }
            catch (Exception ex)
            {
                errors.Add(ex.Message);
                CloseConnectionAndEndTransaction(true);
            }

            return errors;
        }

        public List<object> ExecuteScalarSProcedureWithTransaction(out List<string> msgErrors, List<StoreParameterInfo> storeInfos)
        {
            List<object> results = new List<object>();
            msgErrors = new List<string>();

            try
            {
                OpenConnectionAndBeginTransaction();

                foreach (var item in storeInfos)
                {
                    SqlCommand cmd = new SqlCommand(item.StoreProcedureName, sqlConnection, sqlTransaction);
                    cmd.CommandType = CommandType.StoredProcedure;

                    foreach (var p in item.StoreProcedureParams)
                        cmd.Parameters.Add(p);

                    results.Add(cmd.ExecuteScalar());
                }

                CloseConnectionAndEndTransaction(false);
            }
            catch (Exception ex)
            {
                msgErrors.Add(ex.Message);
                CloseConnectionAndEndTransaction(true);
            }

            return results;
        }
    }
}
