using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HastaneApi.Models;
using HastaneApi.Data;

namespace HastaneApi.Controllers;

[ApiController]
[Route("api/patients")]
public class PatientController : ControllerBase
{
    private readonly HastaneDbContext _context;

    public PatientController(HastaneDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllPatients()
    {
        try
        {
            var kisiler = await _context.Kisiler.ToListAsync();

            if (kisiler.Count == 0)
            {
                return Ok(new { message = "Henüz kayıtlı kişi yok", kisiler = new List<Kisi>() });
            }

            return Ok(new { message = "Kayıtlı kişiler listelendi", kisiler = kisiler });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Kişiler listelenirken bir hata oluştu", error = ex.Message });
        }
    }

    [HttpPost]
    public async Task<IActionResult> CreatePatient([FromBody] KisiKaydetRequest request)
    {
        try
        {
            if (request == null)
            {
                return BadRequest(new { message = "İstek gövdesi boş olamaz" });
            }

            var mevcutKisi = await _context.Kisiler
                .FirstOrDefaultAsync(k => k.Tckimlikno == request.TcKimlikNo);

            if (mevcutKisi != null)
            {
                return BadRequest(new { message = $"{request.TcKimlikNo} zaten kayıtlı" });
            }

            Kisi yenikisi = new Kisi(request.TcKimlikNo, request.Isim, request.TelefonNumarasi);
            _context.Kisiler.Add(yenikisi);
            await _context.SaveChangesAsync();

            return Ok(new { message = $"{request.TcKimlikNo} tcli kişi başarıyla eklendi", kisi = yenikisi });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = $"{request?.TcKimlikNo} tcli kişi eklenirken hata oluştu: {ex.Message}" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Kişi eklenirken bir hata oluştu", error = ex.Message });
        }
    }

    [HttpGet("{tc}")]
    public async Task<IActionResult> GetPatientByTc(string tc)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(tc))
            {
                return BadRequest(new { message = "TC Kimlik Numarası boş olamaz" });
            }

            var bulunankisi = await _context.Kisiler
                .FirstOrDefaultAsync(k => k.Tckimlikno == tc);

            if (bulunankisi != null)
            {
                return Ok(new { message = $"Sorgu başarılı. {tc} kişi bulundu", kisi = bulunankisi });
            }
            else
            {
                return NotFound(new { message = "Sorgu başarısız. Kişi bulunamadı." });
            }
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Kişi sorgulanırken bir hata oluştu", error = ex.Message });
        }
    }
}

public class KisiKaydetRequest
{
    public string TcKimlikNo { get; set; } = string.Empty;
    public string Isim { get; set; } = string.Empty;
    public string TelefonNumarasi { get; set; } = string.Empty;
}

