using DAL.Helper;
using DAL.Helper.Interfaces;
using DAL;
using BLL;
using BLL.Interfaces;
using DAL.Interfaces;

namespace API_NguoiDung
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            builder.Services.AddCors(o => o.AddPolicy("AllowAll",
                p => p.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader()));

            builder.Services.AddControllers();
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

            // DatabaseHelper
            builder.Services.AddSingleton<IDatabaseHelper, DatabaseHelper>();

            // DAL
            builder.Services.AddScoped<INguoiDungRepository, NguoiDungRepository>();

            // BLL
            builder.Services.AddScoped<INguoiDungService, NguoiDungService>();

            var app = builder.Build();

            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseCors("AllowAll");
            app.MapControllers();
            app.Run();
        }
    }
}
