using System;
using System.Collections.Generic; // list kullanabilmek için bu kütüphaneyi ekledik
using System.Linq;
using System.Runtime.CompilerServices;
using System.Security.Cryptography.X509Certificates; //Any() ve FirstOrDefault() gibi metodları kullanabilmek için


namespace Hastane_Kayit_Sistemi
{

    public class Kisi
    {
        public string Tckimlikno { get; }
        public string Isim { get; private set; }//private set kontrollü değiştirme sağlar. Değer sadece Kisi sınıfı içinden değiştirilebilir
        public string Telefonno { get; private set; }



        public Kisi(string tckimlikno, string isim, string telefonno) // kişi nesnesi oluşturulurken bana bu 3 bilgiyi vermek zorundasın demek.
        {
            this.Tckimlikno = tckimlikno; //Tckimlikno özelliğinin atandığı tek yerdir {get;} olduğu için 
            this.Isim = isim;
            this.Telefonno = telefonno;

            if (string.IsNullOrWhiteSpace(tckimlikno) || tckimlikno.Length != 11 || !IsNumeric(tckimlikno)) // sistemin sağlamşığını arttırır ve hatalı veri baştan reddedilir
            {
                throw new ArgumentException("Lütfen geçerli bir tc giriniz");
            }
        }

        public void IsimGüncelle(string yeniisim) // {private set;} olduğundan dolayı  dışarıdan doğrudan değer atayamayacağımız için kontrollü değer ataması/değişimi sağlar
        {
            if (string.IsNullOrWhiteSpace(yeniisim))
            {
                throw new ArgumentException("isim boş olamaz");
            }

            this.Isim = yeniisim;
            Console.WriteLine($" {Tckimlikno} tc kimlik nolu kişinin ismi {yeniisim} olarak güncellendi");
        }

        public void TelefonGüncelle(string yenitelefon)
        {
            if (string.IsNullOrWhiteSpace(yenitelefon))
            {
                throw new ArgumentException("Telefon boş olamaz");
            }

            this.Telefonno = yenitelefon;
            Console.WriteLine($" {Tckimlikno} tc kimlik nolu kişinin ismi {yenitelefon} olarak güncellendi");
        }

        private bool IsNumeric(string input) // tcnin sadece rakamlardan oluştuğunu komtrol eder. private olmasının sebebi sadece bu class içinde kullanılacak.
        {
            long.TryParse(input, out _); // long.TryParse verilen input metnini (tckimlikno parametre olarak gelecek) long (büyük bir tam sayı) tipine çevirmeyi dener
                                         // out eğer çevirme başarılı olursa sonucu atmak için bir yer belirtiriz 
                                         //(alt çizgi) burdaki değeri kullanmayacağımızı belirtir sadece dönüşümün başarılı olup olmadığını merak ediyoruz
                                         // başarılı olursa true olmazsa false döner
            return long.TryParse(input, out _); ;
        }

        public void BilgiGoster()
        {
            Console.WriteLine("----Kişi Bilgileri----");
            Console.WriteLine($"tc kimlik no {Tckimlikno}\nisim: {Isim}\ntelefon:{Telefonno}");
            Console.WriteLine("------------------------------");
        }



    }




    public class HastaneKayitSistemi
    {
        private List<Kisi> _kayitlikisiler; // private yani sadece HastanekayitSistemi içinden kullanılabilir.Dışardan kimse bu listeyi doğrudan değiştirip bozamaz.Kapsülleme prensibine örnek

        public HastaneKayitSistemi()
        {
            _kayitlikisiler = new List<Kisi>();

        }

        public bool KisiKaydet(string paramTcKimlikNo, string paramisim, string paramtelefonNumarasi) //kayıt sistemi için dışarıdan almamız gerekenler
        {
            if (_kayitlikisiler.Any(kisi => kisi.Tckimlikno == paramTcKimlikNo))
            {
                Console.WriteLine($"Hata: {paramTcKimlikNo} zaten kayıtlı");
                return false;
            }

            try
            {
                Kisi yenikisi = new Kisi(paramTcKimlikNo, paramisim, paramtelefonNumarasi);
                _kayitlikisiler.Add(yenikisi);
                Console.WriteLine($"{paramTcKimlikNo} tcli kişi başarıyla eklendi");
                return true;
            }
            catch (ArgumentException ex)
            {
                Console.WriteLine($"{paramTcKimlikNo} tcli kişi eklenirken hata oluştu {ex.Message}");
                return false;
            }

        }

        public Kisi KisiSorgula(string paramtckimlikno)
        {
            Kisi bulunankisi = _kayitlikisiler.FirstOrDefault(kisi => kisi.Tckimlikno == paramtckimlikno); // bu kod listede belirli şarta uyan ilk elemanı bulur ve döndürür eğer hiçbir eleman bulamazsa null döndürür.

            if (bulunankisi != null)
            {
                Console.WriteLine($"Sorgu başarılı. {paramtckimlikno} kişi bulundu");
                return bulunankisi;
            }
            else
            {
                Console.WriteLine("Sorgu başarısız");
                return null;
            }
        }

        public void KisiListele()
        {
            if (_kayitlikisiler.Count == 0)
            {
                Console.WriteLine("Henüz kayıtlı kişi yok");
                return; // metottan çık
            }
            else
            {
                foreach (var kisi in _kayitlikisiler)
                {
                    kisi.BilgiGoster();
                }

                Console.WriteLine("------------------");
            }
        }


    }


    internal class Program
    {

        static void Main(string[] args)
        {

            HastaneKayitSistemi sistem = new HastaneKayitSistemi();
            bool UygulamayiCalistir = true;

            Console.WriteLine("-----Hastane Kayıt Sistemine Hoş Geldiniz-----");

            while (UygulamayiCalistir)
            {
                Console.WriteLine("\n--- Menü ---");
                Console.WriteLine("1. Yeni Kişi Kaydet");
                Console.WriteLine("2. Kişi Sorgula");
                Console.WriteLine("3. Tüm Kayıtlı Kişileri Listele");
                Console.WriteLine("4. Çıkış");
                Console.Write("Lütfen bir seçim yapın (1-4): ");

                string secim = Console.ReadLine();

                switch (secim)
                {
                    case "1":
                        KisiKaydetMetot(sistem);
                        break;

                    case "2":
                        KisiSorgulaMetot(sistem);
                        break;

                    case "3":
                        sistem.KisiListele();
                        break;

                    case "4":
                        UygulamayiCalistir = false;
                        Console.WriteLine("Uygulamadan çıkılıyor. Hoşça kalın!");
                        break;


                    default:
                        Console.WriteLine("Geçerli bir seçim yapın");
                        break;

                }
                Console.WriteLine("\nDevam etmek için bir tuşa basın...");
                Console.ReadKey(); // Kullanıcının herhangi bir tuşa basmasını bekler. Ekran hemen kapanmaz.
                Console.Clear(); // Konsol ekranını temizler. Bir sonraki menü daha temiz görünü
            }

        }

        private static void KisiKaydetMetot(HastaneKayitSistemi sistem)
        {
            string TC, isim, telefon;

            while (true)
            {
                Console.WriteLine("TC Giriniz:");
                TC = Console.ReadLine();

                if (string.IsNullOrWhiteSpace(TC) || TC.Length != 11) //IsNumeric(TC) kabul etmedi?
                {
                    Console.WriteLine("Hata: Geçersiz TC Kimlik Numarası formatı. Lütfen 11 haneli bir sayı girin.");
                }
                else
                {
                    break; // Geçerli TC girildi, döngüden çık.
                }
            }

            
            Console.WriteLine("İsim Giriniz:");
            isim = Console.ReadLine();

            Console.WriteLine("Telefon Giriniz:");
            telefon = Console.ReadLine();

            sistem.KisiKaydet(TC,isim ,telefon);

        }

        private static void KisiSorgulaMetot(HastaneKayitSistemi sistem)
        {
            Console.WriteLine("\n--- Kişi Sorgula ---");
            Console.Write("Sorgulamak istediğiniz TC Kimlik Numarasını girin: ");
            string sorguTc = Console.ReadLine();

            Kisi bulunankisi = sistem.KisiSorgula(sorguTc);

            if (bulunankisi != null)
            {
                bulunankisi.BilgiGoster();
            }






        }
    }

}