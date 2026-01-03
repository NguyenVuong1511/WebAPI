using Infrastructure.Interfaces;
using Infrastructure;
using UserService.Interfaces;
using Infrastructure.Extensions;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddCustomJwtAuthentication(builder.Configuration);

// 1. Đăng ký Dependency Injection
builder.Services.AddScoped<IDatabaseHelper, DatabaseHelper>();
builder.Services.AddScoped<IUserService, UserService.Services.UserService>();

// --- KẾT THÚC ---

var app = builder.Build(); // <-- Mọi đăng ký phải nằm TRÊN dòng này

// ... phần còn lại giữ nguyên
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
app.UseAuthentication();
app.UseAuthorization();
app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();
app.Run();