using Microsoft.EntityFrameworkCore;
using HastaneApi.Data;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
// Swagger yapılandırması
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// SQLite veritabanı yapılandırması
builder.Services.AddDbContext<HastaneDbContext>(options =>
    options.UseSqlite("Data Source=hastane.db"));

// CORS ayarları
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// Veritabanını otomatik oluştur (yoksa)
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<HastaneDbContext>();
    context.Database.EnsureCreated();
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// CORS middleware'ini ekle
app.UseCors();

app.MapControllers();

app.Run();
