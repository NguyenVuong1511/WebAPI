using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Linq;
using System.Reflection;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;

namespace DAL.Helper
{
    //Chuyển đổi qua lại giữa Object (đối tượng C#) và chuỗi JSON.
    public static class MessageConvert
    {
        private static readonly JsonSerializerSettings Settings = new JsonSerializerSettings
        {
            Formatting = Formatting.None,
            DateFormatHandling = DateFormatHandling.IsoDateFormat,
            NullValueHandling = NullValueHandling.Ignore,
            ContractResolver = new CamelCasePropertyNamesContractResolver(),
            ReferenceLoopHandling = ReferenceLoopHandling.Ignore // Tránh lỗi vòng lặp vô tận
        };

        public static string SerializeObject(this object obj)
        {
            return obj == null ? "" : JsonConvert.SerializeObject(obj, Settings);
        }

        public static T? DeserializeObject<T>(this string json)
        {
            if (string.IsNullOrWhiteSpace(json)) return default;
            return JsonConvert.DeserializeObject<T>(json, Settings);
        }

        public static object? DeserializeObject(this string json, Type type)
        {
            if (string.IsNullOrWhiteSpace(json)) return null;
            try
            {
                return JsonConvert.DeserializeObject(json, type, Settings);
            }
            catch (Exception)
            {
                // Khuyên dùng: Nên Log lỗi ở đây để debug
                return null;
            }
        }
    }

    public static class CollectionHelper
    {
        // Cache PropertyInfo để tránh dùng Reflection nhiều lần
        private static readonly System.Collections.Concurrent.ConcurrentDictionary<Type, PropertyInfo[]> _propertyCache
            = new System.Collections.Concurrent.ConcurrentDictionary<Type, PropertyInfo[]>();

        private static PropertyInfo[] GetCachedProperties(Type type)
        {
            return _propertyCache.GetOrAdd(type, t => t.GetProperties());
        }

        public static string GetExcelColumnName(int columnNumber)
        {
            string columnName = String.Empty;
            while (columnNumber > 0)
            {
                int modulo = (columnNumber - 1) % 26;
                columnName = Convert.ToChar(65 + modulo) + columnName;
                columnNumber = (columnNumber - modulo) / 26;
            }
            return columnName;
        }

        public static object? GetPropertyValue(this object obj, string propName)
        {
            if (obj == null) return null;
            return obj.GetType().GetProperty(propName)?.GetValue(obj, null);
        }

        public static string GetPropertyValueToString(this object obj, string propName)
        {
            var val = obj.GetPropertyValue(propName);
            return val?.ToString() ?? string.Empty;
        }

        /// <summary>
        /// Phân trang tối ưu: Không load toàn bộ dữ liệu vào RAM
        /// </summary>
        public static List<T> GetSourceWithPaging<T>(IEnumerable<T> source, int pageSize, int pageIndex, out int totalPage)
        {
            // Kiểm tra null để tránh lỗi
            if (source == null)
            {
                totalPage = 0;
                return new List<T>();
            }

            // Dùng Count() của LINQ, nó được tối ưu cho ICollection/List mà không cần ToArray
            int totalRow = source.Count();

            totalPage = totalRow == 0 ? 0 : (int)Math.Ceiling((double)totalRow / pageSize);

            if (pageIndex < 1) pageIndex = 1;

            // Chỉ lấy dữ liệu cần thiết
            return source.Skip((pageIndex - 1) * pageSize).Take(pageSize).ToList();
        }

        public static DataTable ConvertTo<T>(this IEnumerable<T> list)
        {
            DataTable table = CreateTable<T>();
            Type entityType = typeof(T);
            PropertyDescriptorCollection properties = TypeDescriptor.GetProperties(entityType);

            foreach (T item in list)
            {
                DataRow row = table.NewRow();
                foreach (PropertyDescriptor prop in properties)
                {
                    // Xử lý Nullable khi add vào row
                    row[prop.Name] = prop.GetValue(item) ?? DBNull.Value;
                }
                table.Rows.Add(row);
            }
            return table;
        }

        public static IList<T> ConvertTo<T>(this DataTable table)
        {
            if (table == null || table.Rows.Count == 0) return new List<T>();

            var list = new List<T>();
            var properties = GetCachedProperties(typeof(T));

            // Map column names to properties để tìm kiếm nhanh hơn O(1)
            var propDict = properties.ToDictionary(p => p.Name.ToLower(), p => p);

            foreach (DataRow row in table.Rows)
            {
                list.Add(CreateItemFromRow<T>(row, propDict));
            }

            return list;
        }

        // Tách hàm xử lý 1 dòng, truyền vào Dictionary Property để tối ưu tốc độ
        private static T CreateItemFromRow<T>(DataRow row, Dictionary<string, PropertyInfo> propDict)
        {
            T obj = Activator.CreateInstance<T>();

            foreach (DataColumn column in row.Table.Columns)
            {
                string colName = column.ColumnName.ToLower();

                // Tìm Property trong Dictionary (nhanh hơn GetProperty rất nhiều)
                if (propDict.TryGetValue(colName, out PropertyInfo prop))
                {
                    object value = row[column];
                    if (value == DBNull.Value) continue;

                    try
                    {
                        // Logic đặc thù cho cột JSON (Giữ nguyên logic của bạn)
                        if (column.ColumnName.IndexOf("json", StringComparison.OrdinalIgnoreCase) >= 0)
                        {
                            string jsonVal = (value.ToString() ?? "").Replace("$", "");
                            prop.SetValue(obj, MessageConvert.DeserializeObject(jsonVal, prop.PropertyType));
                        }
                        else
                        {
                            // Tự động convert kiểu dữ liệu an toàn
                            Type targetType = Nullable.GetUnderlyingType(prop.PropertyType) ?? prop.PropertyType;
                            object safeValue = (value is IConvertible) ? Convert.ChangeType(value, targetType) : value;
                            prop.SetValue(obj, safeValue);
                        }
                    }
                    catch
                    {
                        // Bỏ qua lỗi convert dòng này hoặc log nếu cần
                    }
                }
            }
            return obj;
        }

        // Helper cũ để tương thích ngược nếu code cũ gọi trực tiếp
        public static T CreateItem<T>(DataRow row)
        {
            var properties = GetCachedProperties(typeof(T));
            var propDict = properties.ToDictionary(p => p.Name.ToLower(), p => p);
            return CreateItemFromRow<T>(row, propDict);
        }

        public static DataTable CreateTable<T>()
        {
            Type entityType = typeof(T);
            var table = new DataTable(entityType.Name);
            PropertyDescriptorCollection properties = TypeDescriptor.GetProperties(entityType);

            foreach (PropertyDescriptor prop in properties)
            {
                // Fix lỗi DataTable không nhận Nullable<T> trực tiếp
                Type colType = Nullable.GetUnderlyingType(prop.PropertyType) ?? prop.PropertyType;
                table.Columns.Add(prop.Name, colType);
            }
            return table;
        }
    }
}