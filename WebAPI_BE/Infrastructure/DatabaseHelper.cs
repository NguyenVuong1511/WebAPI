using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Infrastructure;
using Infrastructure.Interfaces;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;

namespace Infrastructure
{
    public class DatabaseHelper : IDatabaseHelper
    {
        private string _connectionString = string.Empty;
        private SqlConnection? _connection;
        private SqlTransaction? _transaction;

        public DatabaseHelper(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection") ?? string.Empty;
        }
        // =========================
        // QUẢN LÝ CONNECTION STRING
        // =========================
        public void SetConnectionString(string connectionString)
        {
            _connectionString = connectionString;
        }

        // =========================
        // TRANSACTION
        // =========================
        public string OpenConnectionAndBeginTransaction()
        {
            try
            {
                _connection = new SqlConnection(_connectionString);
                _connection.Open();
                _transaction = _connection.BeginTransaction();
                return string.Empty;
            }
            catch (Exception ex)
            {
                return ex.Message;
            }
        }

        public string CloseConnectionAndEndTransaction(bool isRollbackTransaction)
        {
            try
            {
                if (_transaction != null)
                {
                    if (isRollbackTransaction)
                        _transaction.Rollback();
                    else
                        _transaction.Commit();
                }

                _connection?.Close();
                return string.Empty;
            }
            catch (Exception ex)
            {
                return ex.Message;
            }
        }
        // =========================
        // SQL THƯỜNG
        // =========================
        public string ExecuteNoneQuery(string strquery)
        {
            try
            {
                using var conn = new SqlConnection(_connectionString);
                using var cmd = new SqlCommand(strquery, conn);
                conn.Open();
                cmd.ExecuteNonQuery();
                return string.Empty;
            }
            catch (Exception ex)
            {
                return ex.Message;
            }
        }

        public DataTable ExecuteQueryToDataTable(string strquery, out string msgError)
        {
            msgError = string.Empty;
            var table = new DataTable();

            try
            {
                using var conn = new SqlConnection(_connectionString);
                using var cmd = new SqlCommand(strquery, conn);
                using var adapter = new SqlDataAdapter(cmd);

                conn.Open();
                adapter.Fill(table);
            }
            catch (Exception ex)
            {
                msgError = ex.Message;
            }

            return table;
        }

        public object ExecuteScalar(string strquery, out string msgError)
        {
            msgError = string.Empty;

            try
            {
                using var conn = new SqlConnection(_connectionString);
                using var cmd = new SqlCommand(strquery, conn);
                conn.Open();
                return cmd.ExecuteScalar();
            }
            catch (Exception ex)
            {
                msgError = ex.Message;
                return null!;
            }
        }

        // =========================
        // STORED PROCEDURE
        // =========================
        public string ExecuteSProcedure(string procName, params object[] paramObjects)
        {
            try
            {
                using var conn = new SqlConnection(_connectionString);
                using var cmd = CreateCommand(procName, conn, null, paramObjects);

                conn.Open();
                cmd.ExecuteNonQuery();
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
            var table = new DataTable();

            try
            {
                using var conn = new SqlConnection(_connectionString);
                using var cmd = CreateCommand(procName, conn, null, paramObjects);
                using var adapter = new SqlDataAdapter(cmd);

                conn.Open();
                adapter.Fill(table);
            }
            catch (Exception ex)
            {
                msgError = ex.Message;
            }

            return table;
        }

        public object ExecuteScalarSProcedure(out string msgError, string procName, params object[] paramObjects)
        {
            msgError = string.Empty;

            try
            {
                using var conn = new SqlConnection(_connectionString);
                using var cmd = CreateCommand(procName, conn, null, paramObjects);

                conn.Open();
                return cmd.ExecuteScalar();
            }
            catch (Exception ex)
            {
                msgError = ex.Message;
                return null!;
            }
        }

        // =========================
        // MULTI STORED PROCEDURE TRANSACTION
        // =========================
        public List<string> ExecuteSProcedureWithTransaction(List<StoreParameterInfo> storeInfos)
        {
            var errors = new List<string>();
            OpenConnectionAndBeginTransaction();

            try
            {
                foreach (var store in storeInfos)
                {
                    using var cmd = new SqlCommand(
                        store.StoreProcedureName,
                        _connection,
                        _transaction
                    );

                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddRange(store.StoreProcedureParams.ToArray());
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

        public List<object> ExecuteScalarSProcedureWithTransaction(
            out List<string> msgErrors,
            List<StoreParameterInfo> storeInfos)
        {
            msgErrors = new List<string>();
            var results = new List<object>();

            OpenConnectionAndBeginTransaction();

            try
            {
                foreach (var store in storeInfos)
                {
                    using var cmd = new SqlCommand(
                        store.StoreProcedureName,
                        _connection,
                        _transaction
                    );

                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddRange(store.StoreProcedureParams.ToArray());
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

        // =========================
        // PRIVATE HELPER
        // =========================
        private SqlCommand CreateCommand(
            string procName,
            SqlConnection conn,
            SqlTransaction? trans,
            params object[] paramObjects)
        {
            var cmd = new SqlCommand(procName, conn, trans)
            {
                CommandType = CommandType.StoredProcedure
            };

            for (int i = 0; i < paramObjects.Length; i += 2)
            {
                cmd.Parameters.AddWithValue(
                    paramObjects[i].ToString()!,
                    paramObjects[i + 1] ?? DBNull.Value
                );
            }

            return cmd;
        }
    }
}
