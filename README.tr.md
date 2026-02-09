# 🛡️ CBAM Guard (CarbonTrace)

<div align="center">

![CBAM Guard Logo](docs/images/logo-placeholder.png)

### **Sınırda Karbon Düzenleme Mekanizması (SKDM) için Kurumsal Standart**

**Emisyon İzleme • Maliyet Analizi • Karbon Uyumluluğu • Yapay Zeka Destekli**

[![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.95%2B-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://postgresql.org)
[![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://docker.com)
[![License](https://img.shields.io/badge/Lisans-MIT-green?style=for-the-badge)](LICENSE)

[📚 Full Documentation (English)](README.md) | [🇹🇷 Türkçe Dokümantasyon](docs/tr/README.md)

</div>

---

## 🚀 Neden CBAM Guard?

Avrupa Birliği'nin **Sınırda Karbon Düzenleme Mekanizması (CBAM/SKDM)**, global ticareti yeniden şekillendiriyor. **CBAM Guard**, ihracatçıların bu sürece uyum sağlamasını kolaylaştıran, kapsamlı bir dijital çözümdür.

* **⚡ Otomatik Uyum:** Karmaşık Excel tablolarına veda edin. Gömülü emisyon hesaplamalarını tamamen otomatikleştiriyoruz.
* **📉 Maliyet Optimizasyonu:** Gelişmiş "What-If" senaryoları ile gelecekteki vergi yükünüzü hesaplayın ve daha yeşil üretim yolları keşfedin.
* **🧠 Yapay Zeka Desteği:** Entegre **AI Mevzuat Uzmanı**, karmaşık regülasyon sorularınızı anında yanıtlar.
* **🔗 Tedarikçi Entegrasyonu:** Tedarikçilerinizin verilerini doğrudan sisteme girmesini sağlayan güvenli portal.

---

## 🌟 Temel Özellikler

| Modül | Açıklama |
| :--- | :--- |
| **📊 Akıllı Dashboard** | Kapsam 1, 2 ve 3 emisyonlarının trend analizi ve anomali tespiti ile gerçek zamanlı görselleştirilmesi. |
| **💰 Vergi Motoru** | Canlı **ETS (Emisyon Ticaret Sistemi)** fiyatlarına dayalı tahmini karbon vergisi hesaplaması. |
| **📄 Otomatik Raporlama** | Resmi AB CBAM Geçiş Sicili ile uyumlu **XML** ve **PDF** formatında tek tıkla rapor oluşturma. |
| **🌍 Tedarikçi Portalı** | Tedarikçilerin kendi verilerini güvenli bir şekilde girmesi için token tabanlı erişim sistemi. |
| **🔮 Öngörü (Forecasting)** | Artan karbon fiyatlarının önümüzdeki 5 yıl içinde ürün maliyetlerinize etkisini simüle eden finansal modeller. |
| **🔔 Akıllı Bildirimler** | Kota aşımları, ani fiyat artışları ve yaklaşan raporlama tarihleri için anlık uyarılar. |

---

## 📚 Dokümantasyon

Projeyi kurmanız ve kullanmanız için gereken her şey detaylıca belgelenmiştir.

| Rehber | Açıklama |
| :--- | :--- |
| **[🚀 Hızlı Başlangıç](docs/tr/kurulum.md)** | Docker ve Manuel kurulum talimatları. |
| **[🏗️ Sistem Mimarisi](docs/tr/mimari.md)** | Altıgen Mimari, Veri Akışı ve Teknoloji Yığını detayları. |
| **[📖 Kullanıcı Kılavuzu](docs/tr/kullanim-kilavuzu.md)** | Dashboard kullanımı, emisyon yönetimi ve rapor oluşturma. |
| **[🔌 API Referansı](docs/tr/api-referansi.md)** | Dış sistemlerle entegrasyon için Swagger dokümantasyonu. |
| **[🔐 Güvenlik](docs/tr/guvenlik.md)** | RBAC, JWT Şifreleme ve Veri Koruma standartları. |
| **[🚀 Dağıtım (Deploy)](docs/tr/dagitim.md)** | Docker, Nginx ve CI/CD kullanarak canlıya alma rehberi. |
| **[🗄️ Veritabanı](docs/tr/veritabani.md)** | ER Diyagramları ve Şema açıklamaları. |
| **[❓ SSS](docs/tr/sss.md)** | Sıkça Sorulan Sorular ve Sorun Giderme. |
| **[📖 Sözlük](docs/tr/sozluk.md)** | CBAM terimleri (Scope 1-2-3, CN Kodları, ETS) açıklamaları. |

---

## 🛠️ Teknoloji Yığını

**Frontend (Önyüz):**

* **React 18** (Vite)
* **Tailwind CSS** (Harika Tasarımlar)
* **Recharts** (Veri Görselleştirme)
* **Axios** (API İletişimi)

**Backend (Arkayüz):**

* **FastAPI** (Yüksek Performanslı Python Çatısı)
* **SQLAlchemy** (Asenkron ORM)
* **Pydantic** (Veri Doğrulama)
* **Celery** (Arkaplan İşlemleri)
* **LangChain & OpenAI** (Yapay Zeka Özellikleri)

**Altyapı:**

* **PostgreSQL** (Ana Veritabanı)
* **Redis** (Önbellekleme & Mesaj Kuyruğu)
* **Docker & Docker Compose** (Konteynerizasyon)

---

## 🤝 Katkıda Bulunma

Katkılarınızı bekliyoruz! Lütfen Pull Request gönderme, hata bildirme ve özellik önerme süreçleri için [Katkıda Bulunma Rehberi](docs/tr/katkida-bulunma.md)'ni inceleyin.

---

## 📂 Proje Yapısı

```bash
cbam-guard/
├── backend/                # FastAPI Uygulaması
│   ├── app/
│   │   ├── api/            # API Rotaları
│   │   ├── core/           # Konfigürasyon & Güvenlik
│   │   ├── models/         # Veritabanı Modelleri
│   │   ├── schemas/        # Veri Şemaları (Pydantic)
│   │   └── services/       # İş Mantığı & AI Servisleri
│   └── tests/              # Testler
├── frontend/               # React Uygulaması
│   ├── src/
│   │   ├── components/     # UI Bileşenleri
│   │   ├── contexts/       # State Yönetimi (Auth, Dil)
│   │   ├── pages/          # Sayfa Görünümleri
│   │   └── services/       # API İstemcileri
│   └── public/             # Statik Dosyalar
├── docs/                   # Dokümantasyon Klasörü
└── scripts/                # Yardımcı Scriptler
```

---

## 👥 Takım

**Garanti BBVA Teknoloji Hackathon Ekibi**

* **CyberArchitect** - *Lider Mimar & Backend*
* **UXVisio** - *Frontend & Veri Görselleştirme*
* **AIEngineer** - *Yapay Zeka & Veri Bilimi*

---

## 📄 Lisans

Bu proje **MIT Lisansı** ile lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakınız.

<div align="center">
    <h3>Sürdürülebilir Bir Gelecek İçin 💚 ile Geliştirildi</h3>
    <sub>Garanti BBVA Teknoloji - Hackathon Projesi</sub>
</div>
