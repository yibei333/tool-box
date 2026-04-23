using SharpDevLib;
using ToolBox.Filters;

var builder = WebApplication.CreateBuilder(args);
builder.Configuration.AddJsonFile(AppDomain.CurrentDomain.BaseDirectory.CombinePath("appsettings.json"), optional: false, reloadOnChange: true);

builder.Services.AddControllers(options =>
{
    options.Filters.Add<ExceptionFilter>();
});
builder.Services.AddHttpClient();
builder.Host.UseWindowsService();

var app = builder.Build();
app.UseDefaultFiles();
app.UseStaticFiles();
app.MapControllers();
app.Run();
