# 🛡️ CBAM Guard (CarbonTrace)

<div align="center">

![CBAM Guard Logo](/docs/images/logo-placeholder.png)

**Yeni Nesil Sınırda Karbon Düzenleme Mekanizması (SKDM/CBAM) İzleme Sistemi**

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Python](https://img.shields.io/badge/Python-3.10%2B-blue)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-18-blue)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.95%2B-teal)](https://fastapi.tiangolo.com/)

[📚 Full Documentation (English)](../en/README.md) | [🇹🇷 Türkçe Dokümantasyon](./README.md)

</div>

---

## 🌍 Genel Bakış

**CBAM Guard**, şirketlerin Avrupa Birliği'nin **Sınırda Karbon Düzenleme Mekanizması (CBAM/SKDM)** süreçlerini yönetmelerine yardımcı olmak için geliştirilmiş kurumsal bir çözümdür. Gerçek zamanlı emisyon takibi, finansal modelleme ve yapay zeka destekli analizleri bir araya getirerek, karbon uyumluluğunu bir rekabet avantajına dönüştürür.

### 🌟 Temel Özellikler

| Özellik | Açıklama |
| :--- | :--- |
| **📊 Canlı Dashboard** | Kapsam 1, 2 ve 3 emisyonlarını interaktif ve dinamik grafiklerle görselleştirin. |
| **💰 CBAM Vergi Motoru** | Güncel ETS fiyatlarına ve emisyon verilerinize göre tahmini vergi yükümlülüğünü otomatik hesaplar. |
| **🤖 AI Uyum Asistanı** | Mevzuatla ilgili soruları yanıtlayan ve optimizasyon fırsatlarını tespit eden RAG tabanlı yapay zeka. |
| **🏭 Tedarikçi Portalı** | Tedarikçilerin kendi verilerini doğrudan girebileceği, güvenli ve kolay arayüz. |
| **📈 Finansal Projeksiyon** | "What-If" senaryoları ile karbon fiyat artışlarının maliyetlerinize etkisini simüle edin. |
| **🔔 Akıllı Bildirimler** | Emisyon artışları, kota limitleri ve yaklaşan raporlama tarihleri için anlık uyarılar. |

---

## 🚀 Hızlı Başlangıç

### Ön Gereksinimler

* **Docker** (Tavsiye edilir)
* *VEYA* **Python 3.10+** & **Node.js 18+**

### Kurulum

1. **Depoyu Klonlayın**

    ```bash
    git clone https://github.com/your-org/cbam-guard.git
    cd cbam-guard
    ```

2. **Docker ile Başlatma** (Yakında)

    ```bash
    docker-compose up -d
    ```

3. **Manuel Kurulum**
    * [Backend Kurulum Rehberi](kurulum.md#backend-kurulumu)
    * [Frontend Kurulum Rehberi](kurulum.md#frontend-kurulumu)

---

## 🏗️ Sistem Mimarisi

CBAM Guard, ölçeklenebilirlik ve sürdürülebilirlik için **modern ve modüler** bir mimariye sahiptir.

```mermaid
graph TD
    User[👤 Kullanıcı] -->|HTTPS| Frontend[⚛️ React Frontend]
    User -->|HTTPS| Portal[🌍 Tedarikçi Portalı]
    
    Frontend -->|REST/WS| API[🚀 FastAPI Backend]
    Portal -->|REST| API
    
    subgraph Veri Katmanı
        API -->|Okuma/Yazma| DB[(🐘 PostgreSQL)]
        API -->|Önbellek| Redis[(🔴 Redis)]
    end
    
    subgraph Servisler
        API -->|Asenkron| Celery[⚙️ Celery İşçileri]
        API -->|Sorgu| AI[🧠 AI Servisi (RAG)]
    end
    
    subgraph Harici Kaynaklar
        API -->|İstek| ETS[💶 ETS Piyasa Verileri]
        API -->|İstek| News[📰 Küresel Haberler]
    end
```

Teknik detaylar için **[Mimari Genel Bakış](mimari.md)** sayfasına göz atın.

---

## 🤝 Katkıda Bulunma

Açık kaynak işbirliğinin gücüne inanıyoruz. Projeye katkıda bulunmak istiyorsanız lütfen **[Katkıda Bulunma Rehberi](katkida-bulunma.md)**'ni okuyun.

---

## 📄 Lisans

Bu proje MIT Lisansı altında dağıtılmaktadır. Detaylar için `LICENSE` dosyasına bakınız.

<div align="center">
    <sub>Sürdürülebilir bir gelecek için ❤️ ile geliştirildi.</sub>
</div>
