const API_BASE_URL = 'http://localhost:5299';

// Sayfa yüklendiğinde event listener'ları başlat
document.addEventListener('DOMContentLoaded', () => {
    // Form submit event listener
    document.getElementById('patientForm').addEventListener('submit', handleFormSubmit);
    
    // Search form submit event listener
    document.getElementById('searchForm').addEventListener('submit', handleSearchSubmit);
});

// Form submit handler
async function handleFormSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const submitButton = form.querySelector('.btn-submit');
    const originalButtonText = submitButton.textContent;
    
    // Form verilerini al
    const formData = {
        TcKimlikNo: document.getElementById('tc').value.trim(),
        Isim: document.getElementById('isim').value.trim(),
        TelefonNumarasi: document.getElementById('telefon').value.trim()
    };
    
    // Validasyon
    if (formData.TcKimlikNo.length !== 11 || !/^\d+$/.test(formData.TcKimlikNo)) {
        showToast('Lütfen geçerli bir TC kimlik numarası giriniz (11 haneli).', 'error');
        return;
    }
    
    if (!formData.Isim) {
        showToast('Lütfen hasta adını giriniz.', 'error');
        return;
    }
    
    if (!formData.TelefonNumarasi) {
        showToast('Lütfen telefon numarasını giriniz.', 'error');
        return;
    }
    
    // Butonu devre dışı bırak
    submitButton.disabled = true;
    submitButton.textContent = 'Kaydediliyor...';
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/patients`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Başarılı kayıt
            showToast('Hasta başarıyla veritabanına kaydedildi!', 'success');
            
            // Formu temizle
            form.reset();
        } else {
            // Hata durumu
            showToast(data.message || 'Kayıt sırasında bir hata oluştu.', 'error');
        }
    } catch (error) {
        console.error('Kayıt sırasında hata oluştu:', error);
        showToast('Bağlantı hatası. Lütfen API\'nin çalıştığından emin olun.', 'error');
    } finally {
        // Butonu tekrar etkinleştir
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
    }
}

// Hasta sorgulama handler
async function handleSearchSubmit(event) {
    event.preventDefault();
    
    const searchInput = document.getElementById('searchTc');
    const searchButton = event.target.querySelector('.btn-search');
    const resultDiv = document.getElementById('searchResult');
    const tc = searchInput.value.trim();
    
    // Validasyon
    if (tc.length !== 11 || !/^\d+$/.test(tc)) {
        showToast('Lütfen geçerli bir TC kimlik numarası giriniz (11 haneli).', 'error');
        return;
    }
    
    // Butonu devre dışı bırak
    const originalButtonText = searchButton.textContent;
    searchButton.disabled = true;
    searchButton.textContent = 'Sorgulanıyor...';
    resultDiv.innerHTML = '<div class="loading-card">Sorgulanıyor...</div>';
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/patients/${tc}`);
        const data = await response.json();
        
        if (response.ok && data.kisi) {
            // Hasta bulundu - kart göster
            displayPatientCard(data.kisi);
            showToast(data.message || 'Hasta bulundu!', 'success');
        } else {
            // Hasta bulunamadı
            resultDiv.innerHTML = `
                <div class="patient-card not-found">
                    <div class="card-icon">❌</div>
                    <h3>Kayıt Bulunamadı</h3>
                    <p>${data.message || 'Bu TC kimlik numarasına ait hasta kaydı bulunamadı.'}</p>
                </div>
            `;
            showToast(data.message || 'Kayıt bulunamadı.', 'error');
        }
    } catch (error) {
        console.error('Sorgulama sırasında hata oluştu:', error);
        resultDiv.innerHTML = `
            <div class="patient-card not-found">
                <div class="card-icon">⚠️</div>
                <h3>Bağlantı Hatası</h3>
                <p>API'ye bağlanılamadı. Lütfen API'nin çalıştığından emin olun.</p>
            </div>
        `;
        showToast('Bağlantı hatası. Lütfen API\'nin çalıştığından emin olun.', 'error');
    } finally {
        // Butonu tekrar etkinleştir
        searchButton.disabled = false;
        searchButton.textContent = originalButtonText;
    }
}

// Hasta bilgilerini kart olarak göster
function displayPatientCard(patient) {
    const resultDiv = document.getElementById('searchResult');
    const tc = patient.tckimlikno || patient.Tckimlikno || '-';
    const isim = patient.isim || patient.Isim || '-';
    const telefon = patient.telefonno || patient.Telefonno || '-';
    
    resultDiv.innerHTML = `
        <div class="patient-card">
            <div class="card-header">
                <div class="card-icon">✅</div>
                <h3>Hasta Bilgileri</h3>
            </div>
            <div class="card-body">
                <div class="info-row">
                    <span class="info-label">TC Kimlik No:</span>
                    <span class="info-value">${tc}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">İsim:</span>
                    <span class="info-value">${isim}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Telefon:</span>
                    <span class="info-value">${telefon}</span>
                </div>
            </div>
        </div>
    `;
}

// Toast bildirimi göster
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.add('show');
    
    // 3 saniye sonra gizle
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

