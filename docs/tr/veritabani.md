# 🗄️ Veritabanı Şeması

CBAM Guard, emisyonlar, raporlama ve organizasyonel yapıları yönetmek için ilişkisel bir veritabanı modeli kullanır.

## 📐 ER Diyagramı (Varlık-İlişki)

```mermaid
erDiagram
    User ||--o{ Report : created_by
    User ||--o{ Organization : belongs_to
    Organization ||--|{ Facility : has
    Facility ||--o{ Emission : generates
    Emission ||--|| EmissionFactor : uses_factor
    Report ||--|{ ReportItem : contains

    User {
        int id
        string email
        string hashed_password
        enum role "Admin, Manager, Viewer"
    }

    Organization {
        int id
        string name
        string tax_id
        string address
    }

    Facility {
        int id
        string name
        string type
        int org_id
    }

    Emission {
        int id
        date date
        float consumption
        float total_co2e
        string scope "Scope 1, 2, 3"
        int facility_id
    }

    EmissionFactor {
        int id
        string source_name
        float factor
        string unit "kgCO2e/unit"
        int year
    }
```

## 📋 Tablo Detayları

### `users` (Kullanıcılar)

Sistem kullanıcıları.

* `role`: RBAC izinlerini tanımlar.
* `is_active`: Soft delete (kullanıcıyı silmeden pasife alma) mekanizması.

### `emissions` (Emisyonlar)

Karbon aktivitelerinin ana defteri.

* `consumption`: Ham aktivite verisi (örn. 1000 m3 Gaz).
* `total_co2e`: Hesaplanan etki (Tüketim * Faktör).
* `scope`: Kapsam 1 (Doğrudan), Kapsam 2 (Enerji), Kapsam 3 (Tedarik Zinciri).

### `reports` (Raporlar)

Oluşturulan uyumluluk belgeleri.

* `period`: Kapsanan zaman aralığı (örn. "2024 1. Çeyrek").
* `status`: Taslak, Onay Bekliyor, Gönderildi.
* `data_snapshot`: Rapor oluşturulduğu andaki emisyon verilerinin JSON yedeği (değişmezlik için).
