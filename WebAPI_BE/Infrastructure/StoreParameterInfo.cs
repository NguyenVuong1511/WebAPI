using Microsoft.Data.SqlClient;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure
{
    public class StoreParameterInfo
    {
        public string StoreProcedureName { get; set; } = string.Empty;
        public List<SqlParameter> StoreProcedureParams { get; set; } = new List<SqlParameter>();
    }
}
