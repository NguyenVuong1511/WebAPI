using Newtonsoft.Json.Serialization;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Helpers
{
    public static class MessageConvert
    {
        private static readonly JsonSerializerSettings Settings =
            new JsonSerializerSettings
            {
                Formatting = Formatting.None,
                DateFormatHandling = DateFormatHandling.IsoDateFormat,
                NullValueHandling = NullValueHandling.Ignore,
                ContractResolver = new CamelCasePropertyNamesContractResolver(),
                ReferenceLoopHandling = ReferenceLoopHandling.Ignore
            };

        public static string SerializeObject(this object obj)
        {
            return obj == null ? string.Empty : JsonConvert.SerializeObject(obj, Settings);
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
            catch
            {
                // Có thể log nếu cần
                return null;
            }
        }
    }
}
