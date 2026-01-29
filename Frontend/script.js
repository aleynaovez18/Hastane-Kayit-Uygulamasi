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

// HTML escape fonksiyonu
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Attribute value escape fonksiyonu
function escapeAttribute(text) {
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

// Hasta bilgilerini kart olarak göster
function displayPatientCard(patient) {
    const resultDiv = document.getElementById('searchResult');
    const tc = patient.tckimlikno || patient.Tckimlikno || '-';
    const isim = patient.isim || patient.Isim || '-';
    const telefon = patient.telefonno || patient.Telefonno || '-';
    
    // Değerleri escape et
    const escapedTc = escapeHtml(tc);
    const escapedIsim = escapeHtml(isim);
    const escapedTelefon = escapeHtml(telefon);
    
    resultDiv.innerHTML = `
        <div class="patient-card" data-tc="${escapedTc}">
            <div class="card-header">
                <div class="card-icon">✅</div>
                <h3>Hasta Bilgileri</h3>
            </div>
            <div class="card-body">
                <div class="info-row">
                    <span class="info-label">TC Kimlik No:</span>
                    <span class="info-value">${escapedTc}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">İsim:</span>
                    <span class="info-value">${escapedIsim}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Telefon:</span>
                    <span class="info-value">${escapedTelefon}</span>
                </div>
            </div>
            <div class="card-actions">
                <button class="btn-edit" data-tc="${escapeAttribute(tc)}" data-isim="${escapeAttribute(isim)}" data-telefon="${escapeAttribute(telefon)}">✏️ Düzenle</button>
            </div>
        </div>
    `;
    
    // Event listener ekle
    const editButton = resultDiv.querySelector('.btn-edit');
    editButton.addEventListener('click', function() {
        enableEditMode(this.getAttribute('data-tc'), this.getAttribute('data-isim'), this.getAttribute('data-telefon'));
    });
}

// Düzenleme modunu etkinleştir
function enableEditMode(tc, currentIsim, currentTelefon) {
    const resultDiv = document.getElementById('searchResult');
    
    // Değerleri escape et
    const escapedTc = escapeHtml(tc);
    const escapedIsim = escapeHtml(currentIsim);
    const escapedTelefon = escapeHtml(currentTelefon);
    
    resultDiv.innerHTML = `
        <div class="patient-card edit-mode" data-tc="${escapedTc}">
            <div class="card-header">
                <div class="card-icon">✏️</div>
                <h3>Hasta Bilgilerini Düzenle</h3>
            </div>
            <div class="card-body">
                <div class="info-row">
                    <span class="info-label">TC Kimlik No:</span>
                    <span class="info-value">${escapedTc}</span>
                </div>
                <div class="form-group">
                    <label for="editIsim">İsim:</label>
                    <input type="text" id="editIsim" value="${escapeAttribute(currentIsim)}" placeholder="Hasta adı soyadı" required>
                </div>
                <div class="form-group">
                    <label for="editTelefon">Telefon:</label>
                    <input type="tel" id="editTelefon" value="${escapeAttribute(currentTelefon)}" placeholder="Telefon numarası" required>
                </div>
            </div>
            <div class="card-actions">
                <button class="btn-update" data-tc="${escapeAttribute(tc)}" data-original-isim="${escapeAttribute(currentIsim)}" data-original-telefon="${escapeAttribute(currentTelefon)}">💾 Güncelle</button>
                <button class="btn-cancel" data-tc="${escapeAttribute(tc)}" data-original-isim="${escapeAttribute(currentIsim)}" data-original-telefon="${escapeAttribute(currentTelefon)}">❌ İptal</button>
            </div>
        </div>
    `;
    
    // Event listener'ları ekle
    const updateButton = resultDiv.querySelector('.btn-update');
    const cancelButton = resultDiv.querySelector('.btn-cancel');
    
    updateButton.addEventListener('click', function() {
        updatePatient(this.getAttribute('data-tc'));
    });
    
    cancelButton.addEventListener('click', function() {
        cancelEdit(
            this.getAttribute('data-tc'),
            this.getAttribute('data-original-isim'),
            this.getAttribute('data-original-telefon')
        );
    });
}

// Hasta bilgilerini güncelle
async function updatePatient(tc) {
    const editIsim = document.getElementById('editIsim').value.trim();
    const editTelefon = document.getElementById('editTelefon').value.trim();
    const updateButton = document.querySelector('.btn-update');
    
    // Validasyon
    if (!editIsim) {
        showToast('Lütfen hasta adını giriniz.', 'error');
        return;
    }
    
    if (!editTelefon) {
        showToast('Lütfen telefon numarasını giriniz.', 'error');
        return;
    }
    
    // Butonu devre dışı bırak
    const originalButtonText = updateButton.textContent;
    updateButton.disabled = true;
    updateButton.textContent = 'Güncelleniyor...';
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/patients/${tc}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                Isim: editIsim,
                TelefonNumarasi: editTelefon
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Başarılı güncelleme
            showToast('Bilgiler başarıyla güncellendi', 'success');
            
            // Güncellenmiş bilgileri tekrar göster
            displayPatientCard({
                tckimlikno: tc,
                isim: editIsim,
                telefonno: editTelefon
            });
        } else {
            // Hata durumu
            showToast(data.message || 'Güncelleme sırasında bir hata oluştu.', 'error');
        }
    } catch (error) {
        console.error('Güncelleme sırasında hata oluştu:', error);
        showToast('Bağlantı hatası. Lütfen API\'nin çalıştığından emin olun.', 'error');
    } finally {
        // Butonu tekrar etkinleştir
        updateButton.disabled = false;
        updateButton.textContent = originalButtonText;
    }
}

// Düzenlemeyi iptal et
function cancelEdit(tc, originalIsim, originalTelefon) {
    displayPatientCard({
        tckimlikno: tc,
        isim: originalIsim,
        telefonno: originalTelefon
    });
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

