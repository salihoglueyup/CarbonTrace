# 📡 API Referansı

CBAM Guard API'si RESTful prensiplerine dayanır. Tüm yanıtlar JSON formatındadır.

> **Temel URL:** `http://localhost:8000/api`

## 🔐 Kimlik Doğrulama (Authentication)

### Giriş Yap (Login)

Kullanıcı girişi yap ve erişim token'ı al.

* **Uç Nokta:** `POST /token`
* **İçerik Tipi:** `application/x-www-form-urlencoded`

**İstek Gövdesi:**

| Alan | Tip | Açıklama |
| :--- | :--- | :--- |
| `username` | string | Kullanıcı e-postası |
| `password` | string | Kullanıcı şifresi |

**Yanıt (200 OK):**

```json
{
  "access_token": "eyJhbGciOiJIUzI1Ni...",
  "token_type": "bearer"
}
```

---

## 📊 Dashboard

### İstatistikleri Getir

Dashboard için özet KPI verilerini getirir.

* **Uç Nokta:** `GET /dashboard/stats`
* **Yetki:** Gerekli

**Yanıt (200 OK):**

```json
{
  "total_emissions": 12500.4,
  "estimated_tax": 450000,
  "active_alerts": 3,
  "ytd_change": -5.2
}
```

---

## 🏭 Emisyonlar (Emissions)

### Emisyon Trendini Getir

Aylık toplanmış geçmiş emisyon verilerini getirir.

* **Uç Nokta:** `GET /emissions/trend`
* **Parametreler:**
  * `start_date` (YYYY-MM-DD): Başlangıç
  * `end_date` (YYYY-MM-DD): Bitiş

**Yanıt (200 OK):**

```json
[
  {
    "month": "Ocak",
    "scope1": 120,
    "scope2": 80,
    "scope3": 200
  },
  {
    "month": "Şubat",
    "scope1": 115,
    "scope2": 78,
    "scope3": 190
  }
]
```

---

## 🌍 Gerçek Zamanlı (Real-time)

### WebSocket Bildirimleri

Canlı bildirim akışına bağlanır.

* **Uç Nokta:** `WS /ws/notifications`

**Mesaj Formatı:**

```json
{
  "type": "alert",
  "severity": "high",
  "message": "Fabrika A için kota limitine ulaşıldı",
  "timestamp": "2023-10-27T10:00:00Z"
}
```
