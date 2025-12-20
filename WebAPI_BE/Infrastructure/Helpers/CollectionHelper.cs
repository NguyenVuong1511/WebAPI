using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Helpers
{
    public static class CollectionHelper
    {
        // Cache PropertyInfo để tối ưu Reflection
        private static readonly ConcurrentDictionary<Type, PropertyInfo[]> _propertyCache
            = new ConcurrentDictionary<Type, PropertyInfo[]>();

        private static PropertyInfo[] GetCachedProperties(Type type)
        {
            return _propertyCache.GetOrAdd(type, t => t.GetProperties());
        }

        // =========================
        // PAGING
        // =========================
        public static List<T> GetSourceWithPaging<T>(IEnumerable<T> source, int pageSize, int pageIndex, out int totalPage)
        {
            if (source == null)
            {
                totalPage = 0;
                return new List<T>();
            }

            int totalRow = source.Count();
            totalPage = totalRow == 0 ? 0 : (int)Math.Ceiling((double)totalRow / pageSize);

            if (pageIndex < 1) pageIndex = 1;

            return source.Skip((pageIndex - 1) * pageSize).Take(pageSize).ToList();
        }

        // =========================
        // OBJECT -> DATATABLE
        // =========================
        public static DataTable ConvertTo<T>(this IEnumerable<T> list)
        {
            DataTable table = CreateTable<T>();
            PropertyDescriptorCollection properties = TypeDescriptor.GetProperties(typeof(T));

            foreach (T item in list)
            {
                DataRow row = table.NewRow();
                foreach (PropertyDescriptor prop in properties)
                {
                    row[prop.Name] = prop.GetValue(item) ?? DBNull.Value;
                }
                table.Rows.Add(row);
            }

            return table;
        }

        // =========================
        // DATATABLE -> LIST<T>
        // =========================
        public static IList<T> ConvertTo<T>(this DataTable table)
        {
            if (table == null || table.Rows.Count == 0)
                return new List<T>();

            var list = new List<T>();
            var properties = GetCachedProperties(typeof(T));

            var propDict = properties.ToDictionary(p => p.Name.ToLower(), p => p);

            foreach (DataRow row in table.Rows)
            {
                list.Add(CreateItemFromRow<T>(row, propDict));
            }

            return list;
        }

        private static T CreateItemFromRow<T>(DataRow row, Dictionary<string, PropertyInfo> propDict)
        {
            T obj = Activator.CreateInstance<T>();

            foreach (DataColumn column in row.Table.Columns)
            {
                string colName = column.ColumnName.ToLower();

                if (!propDict.TryGetValue(colName, out PropertyInfo prop))
                    continue;

                object value = row[column];
                if (value == DBNull.Value) continue;

                try
                {
                    // Nếu cột chứa JSON
                    if (column.ColumnName.Contains("json", StringComparison.OrdinalIgnoreCase))
                    {
                        string jsonVal = value.ToString() ?? "";
                        prop.SetValue(obj, MessageConvert.DeserializeObject(jsonVal, prop.PropertyType));
                    }
                    else
                    {
                        Type targetType = Nullable.GetUnderlyingType(prop.PropertyType) ?? prop.PropertyType;

                        object safeValue = Convert.ChangeType(value, targetType);

                        prop.SetValue(obj, safeValue);
                    }
                }
                catch
                {
                    // Bỏ qua lỗi mapping
                }
            }

            return obj;
        }

        // =========================
        // CREATE DATATABLE
        // =========================
        public static DataTable CreateTable<T>()
        {
            DataTable table = new DataTable(typeof(T).Name);
            PropertyDescriptorCollection properties = TypeDescriptor.GetProperties(typeof(T));

            foreach (PropertyDescriptor prop in properties)
            {
                Type colType = Nullable.GetUnderlyingType(prop.PropertyType) ?? prop.PropertyType;

                table.Columns.Add(prop.Name, colType);
            }

            return table;
        }
    }
}
