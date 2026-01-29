namespace HastaneApi.Models;

public class Kisi
{
    public string Tckimlikno { get; }
    public string Isim { get; private set; }
    public string Telefonno { get; private set; }

    public Kisi(string tckimlikno, string isim, string telefonno)
    {
        this.Tckimlikno = tckimlikno;
        this.Isim = isim;
        this.Telefonno = telefonno;

        if (string.IsNullOrWhiteSpace(tckimlikno) || tckimlikno.Length != 11 || !IsNumeric(tckimlikno))
        {
            throw new ArgumentException("Lütfen geçerli bir tc giriniz");
        }
    }

    public void IsimGüncelle(string yeniisim)
    {
        if (string.IsNullOrWhiteSpace(yeniisim))
        {
            throw new ArgumentException("isim boş olamaz");
        }

        this.Isim = yeniisim;
    }

    public void TelefonGüncelle(string yenitelefon)
    {
        if (string.IsNullOrWhiteSpace(yenitelefon))
        {
            throw new ArgumentException("Telefon boş olamaz");
        }

        this.Telefonno = yenitelefon;
    }

    private bool IsNumeric(string input)
    {
        return long.TryParse(input, out _);
    }
}



