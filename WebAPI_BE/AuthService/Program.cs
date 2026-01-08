using AuthService.Interfaces;
using AuthService.Services;
using Infrastructure;
using Infrastructure.Interfaces;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// 1. THÊM CORS - CHO PHÉP TẤT CẢ (CHỈ ĐỂ TEST)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.AllowAnyOrigin()  // Cho phép mọi origin
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// 2. Đăng ký DI
builder.Services.AddScoped<IDatabaseHelper, DatabaseHelper>();
builder.Services.AddScoped<IAuthService, AuthService.Services.AuthService>();

// 3. Cấu hình JWT (như cũ)
var jwtSettings = builder.Configuration.GetSection("Jwt");
var key = Encoding.ASCII.GetBytes(jwtSettings["SecretKey"]);

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options => {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(key),
            ValidateIssuer = true,
            ValidIssuer = jwtSettings["Issuer"],
            ValidateAudience = true,
            ValidAudience = jwtSettings["Audience"],
            ValidateLifetime = true
        };
    });

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// 4. DÙNG CORS – đặt TRƯỚC Authentication/Authorization
app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.Run();