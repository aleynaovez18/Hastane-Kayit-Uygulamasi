using Microsoft.EntityFrameworkCore;
using HastaneApi.Models;

namespace HastaneApi.Data;

public class HastaneDbContext : DbContext
{
    public DbSet<Kisi> Kisiler { get; set; }

    public HastaneDbContext(DbContextOptions<HastaneDbContext> options) : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Kisi>(entity =>
        {
            entity.HasKey(e => e.Tckimlikno);
            entity.Property(e => e.Tckimlikno)
                  .HasMaxLength(11)
                  .IsRequired();
            entity.Property(e => e.Isim)
                  .IsRequired();
            entity.Property(e => e.Telefonno)
                  .IsRequired();
        });
    }
}

