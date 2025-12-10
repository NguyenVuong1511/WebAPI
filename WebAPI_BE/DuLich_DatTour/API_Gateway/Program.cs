using Ocelot.DependencyInjection;
using Ocelot.Middleware;

var builder = WebApplication.CreateBuilder(args);

// 1. Load cấu hình từ file ocelot.json
builder.Configuration.SetBasePath(builder.Environment.ContentRootPath)
    .AddJsonFile("ocelot.json", optional: false, reloadOnChange: true);

// 2. Đăng ký dịch vụ Ocelot
builder.Services.AddOcelot(builder.Configuration);

// (Optional) Đăng ký CORS nếu Front-end gọi trực tiếp vào Gateway
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        b => b.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

var app = builder.Build();

// 3. Sử dụng CORS
app.UseCors("AllowAll");

// 4. Sử dụng Ocelot (Phải dùng await vì nó là middleware bất đồng bộ)
await app.UseOcelot();

app.Run();