using BookingService.Interfaces;
using BookingService.Services;
using Infrastructure;
using Infrastructure.Extensions;
using Infrastructure.Interfaces;

var builder = WebApplication.CreateBuilder(args);

// ==========================================
// 1. REGISTER SERVICES (Dependency Injection)
// ==========================================
builder.Services.AddCustomJwtAuthentication(builder.Configuration);
builder.Services.AddControllers();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();


builder.Services.AddScoped<IDatabaseHelper, DatabaseHelper>();

builder.Services.AddScoped<IBookingService, BookingService.Services.BookingService>();
builder.Services.AddScoped<IBookingThongKeService, BookingService.Services.BookingThongKeService>();

// ==========================================
// 2. BUILD APP
// ==========================================
var app = builder.Build();

// ==========================================
// 3. CONFIGURE PIPELINE (Middleware)
// ==========================================

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