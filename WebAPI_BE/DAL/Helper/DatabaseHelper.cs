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
        private string _connectionString;
        private SqlConnection _sqlConnection;
        private SqlTransaction _sqlTransaction;

        public DatabaseHelper(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection");
        }

        public void SetConnectionString(string connectionString)
        {
            _connectionString = connectionString;
        }

        // =========================
        // Transaction
        // =========================
        public string OpenConnectionAndBeginTransaction()
        {
            try
            {
                _sqlConnection = new SqlConnection(_connectionString);
                _sqlConnection.Open();
                _sqlTransaction = _sqlConnection.BeginTransaction();
                return string.Empty;
            }
            catch (Exception ex)
            {
                return ex.Message;
            }
        }

        public string CloseConnectionAndEndTransaction(bool rollback)
        {
            try
            {
                if (_sqlTransaction != null)
                {
                    if (rollback)
                        _sqlTransaction.Rollback();
                    else
                        _sqlTransaction.Commit();

                    _sqlTransaction.Dispose();
                }

                if (_sqlConnection != null)
                {
                    _sqlConnection.Close();
                    _sqlConnection.Dispose();
                }

                _sqlTransaction = null;
                _sqlConnection = null;

                return string.Empty;
            }
            catch (Exception ex)
            {
                return ex.Message;
            }
        }

        // =========================
        // SQL thường
        // =========================
        public string ExecuteNoneQuery(string sql)
        {
            try
            {
                using var conn = new SqlConnection(_connectionString);
                conn.Open();
                using var cmd = new SqlCommand(sql, conn);
                cmd.ExecuteNonQuery();
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
            var dt = new DataTable();

            try
            {
                using var conn = new SqlConnection(_connectionString);
                using var da = new SqlDataAdapter(sql, conn);
                da.Fill(dt);
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
                using var conn = new SqlConnection(_connectionString);
                using var cmd = new SqlCommand(sql, conn);
                conn.Open();
                return cmd.ExecuteScalar();
            }
            catch (Exception ex)
            {
                msgError = ex.Message;
                return null;
            }
        }

        // =========================
        // Stored Procedure thường
        // =========================
        private SqlCommand PrepareCommand(SqlConnection conn, string procName, object[] paramObjects)
        {
            var cmd = new SqlCommand(procName, conn)
            {
                CommandType = CommandType.StoredProcedure
            };

            if (paramObjects != null)
            {
                for (int i = 0; i < paramObjects.Length; i += 2)
                {
                    string paramName = paramObjects[i].ToString();
                    object paramValue = paramObjects[i + 1] ?? DBNull.Value;
                    cmd.Parameters.AddWithValue(paramName, paramValue);
                }
            }

            return cmd;
        }

        public string ExecuteSProcedure(string procName, params object[] paramObjects)
        {
            try
            {
                using var conn = new SqlConnection(_connectionString);
                conn.Open();
                using var cmd = PrepareCommand(conn, procName, paramObjects);
                cmd.ExecuteNonQuery();
                return string.Empty;
            }
            catch (Exception ex)
            {
                return $"SP {procName} lỗi: {ex.Message}";
            }
        }

        public DataTable ExecuteSProcedureReturnDataTable(out string msgError, string procName, params object[] paramObjects)
        {
            msgError = string.Empty;
            var dt = new DataTable();

            try
            {
                using var conn = new SqlConnection(_connectionString);
                using var cmd = PrepareCommand(conn, procName, paramObjects);
                using var da = new SqlDataAdapter(cmd);
                da.Fill(dt);
            }
            catch (Exception ex)
            {
                msgError = $"SP {procName} lỗi: {ex.Message}";
            }

            return dt;
        }

        public object ExecuteScalarSProcedure(out string msgError, string procName, params object[] paramObjects)
        {
            msgError = string.Empty;

            try
            {
                using var conn = new SqlConnection(_connectionString);
                using var cmd = PrepareCommand(conn, procName, paramObjects);
                conn.Open();
                return cmd.ExecuteScalar();
            }
            catch (Exception ex)
            {
                msgError = $"SP {procName} lỗi: {ex.Message}";
                return null;
            }
        }

        // =========================
        // Multi SP Transaction
        // =========================
        public List<string> ExecuteSProcedureWithTransaction(List<StoreParameterInfo> storeInfos)
        {
            var errors = new List<string>();

            try
            {
                OpenConnectionAndBeginTransaction();

                foreach (var info in storeInfos)
                {
                    using var cmd = new SqlCommand(info.StoreProcedureName, _sqlConnection, _sqlTransaction)
                    {
                        CommandType = CommandType.StoredProcedure
                    };
                    if (info.StoreProcedureParams != null)
                        cmd.Parameters.AddRange(info.StoreProcedureParams.ToArray());

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

        public List<object> ExecuteScalarSProcedureWithTransaction(out List<string> errors, List<StoreParameterInfo> storeInfos)
        {
            var results = new List<object>();
            errors = new List<string>();

            try
            {
                OpenConnectionAndBeginTransaction();

                foreach (var info in storeInfos)
                {
                    using var cmd = new SqlCommand(info.StoreProcedureName, _sqlConnection, _sqlTransaction)
                    {
                        CommandType = CommandType.StoredProcedure
                    };
                    if (info.StoreProcedureParams != null)
                        cmd.Parameters.AddRange(info.StoreProcedureParams.ToArray());

                    results.Add(cmd.ExecuteScalar());
                }

                CloseConnectionAndEndTransaction(false);
            }
            catch (Exception ex)
            {
                errors.Add(ex.Message);
                CloseConnectionAndEndTransaction(true);
            }

            return results;
        }
    }
}
