# 🔐 Güvenlik Rehberi

Güvenlik, CBAM Guard'ın temel taşlarından biridir. Bu belge, hassas emisyon ve finansal verileri korumak için uygulanan güvenlik mekanizmalarını açıklar.

## 🛡️ Kimlik Doğrulama ve Yetkilendirme

### JWT (JSON Web Tokens)

Durumsuz (Stateless) JWT kimlik doğrulaması kullanıyoruz.

* **Format:** Bearer Token
* **Şifreleme:** HS256 (HMAC with SHA-256)
* **Süre:** Erişim token'ları kısa ömürlüdür (varsayılan 30 dk).

### RBAC (Rol Tabanlı Erişim Kontrolü)

Uç noktalara erişim, `UserRole` enum'ı ile tanımlanan rollerle sıkı bir şekilde kontrol edilir.

| Rol | İzinler |
| :--- | :--- |
| **Admin** | Tam sistem erişimi. Kullanıcı oluşturma/silme, Sistem Ayarları. |
| **Manager** | Tüm verileri görüntüleme, Rapor oluşturma, Tedarikçi davet etme. |
| **Viewer** (İzleyici) | Sadece Dashboard ve Raporları görüntüleme (Salt okunur). |
| **Supplier** (Tedarikçi)| Sadece kendi veri giriş portalına kısıtlı erişim. |

## 🔒 Veri Koruma

### Parolalar

* Parolalar **asla** açık metin (plain text) olarak saklanmaz.
* Otomatik tuzlama (salting) ile **Bcrypt** hashing algoritması kullanılır.

### İletim ve Depolama Güvenliği

* **İletim:** Tüm API trafiği HTTPS (TLS 1.2+) üzerinden olmalıdır.
* **Depolama:** Hassas alanlar (örn. harici servis API anahtarları) veritabanında şifreli saklanmalıdır.

## 🛡️ API Güvenliği

### Girdi Doğrulama (Input Validation)

Gelen tüm istekler **Pydantic** şemaları kullanılarak doğrulanır.

* ORM filtreleme sayesinde **SQL Enjeksiyonu** engellenir.
* React, girdileri render etmeden önce temizleyerek **XSS** saldırılarını önler.

### Hız Sınırlama (Rate Limiting)

DDoS ve kaba kuvvet (brute-force) saldırılarını önlemek için:

* **Giriş (Login):** IP başına dakikada 5 deneme ile sınırlı.
* **Public API:** Dakikada 100 istek ile sınırlı.

## 🚨 Olay Müdahalesi (Incident Response)

Bir güvenlik ihlali durumunda:

1. **Anahtarları Döndürün:** `.env` dosyasındaki `SECRET_KEY` ve veritabanı şifrelerini derhal değiştirin.
2. **Token'ları İptal Edin:** Kullanıcı tablosundaki "token versiyonunu" artırarak aktif tüm oturumları düşürün.
3. **Denetim Logları:** Şüpheli aktiviteler için `AuditLog` tablosunu inceleyin.
