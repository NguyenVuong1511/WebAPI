using Infrastructure;
using Infrastructure.Interfaces;
using TourManageService.Interface;
using TourManageService.Interfaces;
using TourManageService.Services;


var builder = WebApplication.CreateBuilder(args);

// 1. Add services to the container.
builder.Services.AddControllers();

// --- CẤU HÌNH SWAGGER (Bắt buộc để chạy được giao diện test API) ---
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// --- ĐĂNG KÝ DEPENDENCY INJECTION (DI) ---
// Infrastructure
builder.Services.AddScoped<IDatabaseHelper, DatabaseHelper>();

// Services (Business Logic)
builder.Services.AddScoped<ILoaiTourService, LoaiTourService>();

// Nếu bạn có TourService trong cùng project này, hãy đăng ký thêm:
builder.Services.AddScoped<ITourService, TourService>();

var app = builder.Build();

// 2. Configure the HTTP request pipeline.

// --- KÍCH HOẠT SWAGGER UI KHI Ở MÔI TRƯỜNG DEV ---
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection(); // Khuyến nghị thêm

app.UseAuthorization();

app.MapControllers();

app.Run();