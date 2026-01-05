using BookingService.Interfaces;
using BookingService.Services;
using Infrastructure;
using Infrastructure.Extensions;
using Infrastructure.Interfaces;

var builder = WebApplication.CreateBuilder(args);

// ==========================================
// 1. REGISTER SERVICES (Dependency Injection)
// ==========================================
// JWT
builder.Services.AddCustomJwtAuthentication(builder.Configuration);
// Add Controllers
builder.Services.AddControllers();

// Add Swagger/OpenAPI (Để test API)
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// --- Đăng ký các Service của bạn tại đây ---

// 1. Đăng ký DatabaseHelper
builder.Services.AddScoped<IDatabaseHelper, DatabaseHelper>();

// 2. Đăng ký BookingService
// Lưu ý: Đảm bảo bạn đã using BookingService.Services
builder.Services.AddScoped<IBookingService, BookingService.Services.BookingService>();

// ==========================================
// 2. BUILD APP
// ==========================================
var app = builder.Build();

// ==========================================
// 3. CONFIGURE PIPELINE (Middleware)
// ==========================================

// Cấu hình Swagger UI (Chỉ chạy ở môi trường Dev hoặc tùy chỉnh)
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Đừng quên 2 dòng này
app.UseAuthentication();
app.UseAuthorization();

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();