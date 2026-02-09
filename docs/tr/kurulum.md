# 🛠️ Kurulum ve Başlangıç Rehberi

**CBAM Guard** kurulum rehberine hoş geldiniz. Bu belge, geliştirme ortamınızı hazırlamanız için gereken tüm adımları detaylıca kapsar.

## 📋 Ön Gereksinimler

Başlamadan önce bilgisayarınızda aşağıdakilerin kurulu olduğundan emin olun:

| Yazılım | Versiyon | Gerekli Olduğu Yer |
| :--- | :--- | :--- |
| **Python** | 3.10+ | Backend Çalışma Zamanı |
| **Node.js** | 18+ | Frontend Çalışma Zamanı |
| **PostgreSQL** | 14+ | Prodüksiyon Veritabanı (Opsiyonel) |
| **Git** | Güncel | Versiyon Kontrolü |

> **Not:** Geliştirme (Development) ortamında varsayılan olarak `SQLite` kullanılır, bu yüzden PostgreSQL kurmak zorunlu değildir.

---

## 🚀 Adım Adım Kurulum

### 1. Projeyi İndirin (Clone)

Kodları bilgisayarınıza çekerek başlayın:

```bash
git clone https://github.com/your-org/cbam-guard.git
cd cbam-guard
```

### 2. Backend Kurulumu (FastAPI)

Backend klasörüne gidin ve Python ortamını hazırlayın.

```bash
cd backend
```

#### a. Sanal Ortam (Virtual Environment) Oluşturma

Bağımlılıkları izole etmek için sanal ortam kurun.

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

#### b. Paketleri Yükleme

```bash
pip install -r requirements.txt
```

#### c. Konfigürasyon (.env)

`backend/` dizininde `.env` adlı bir dosya oluşturun ve aşağıdaki ayarları ekleyin.

```ini
# .env ayarları
PROJECT_NAME="CBAM Guard"
API_V1_STR="/api"
SECRET_KEY="GUVENLI_BIR_ANAHTAR_ILE_DEGISTIRIN"
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Veritabanı (Varsayılan: SQLite)
DATABASE_URL="sqlite+aiosqlite:///./sql_app.db"

# Opsiyonel: PostgreSQL Bağlantısı
# DATABASE_URL="postgresql+asyncpg://kullanici:sifre@localhost/veritabani"

# AI Servisi (Opsiyonel)
OPENAI_API_KEY=""
```

#### d. Veritabanı ve Örnek Veriler

Veritabanını başlatın ve test verilerini ekleyin.

```bash
# Tabloları oluştur (Migrasyon)
alembic upgrade head

# Başlangıç verilerini ekle (Admin kullanıcısı, ayarlar)
python scripts/seed_data.py
```

#### e. Sunucuyu Başlatma

```bash
uvicorn main:app --reload
```

✅ **Başarılı:** API şu adreste çalışıyor: `http://localhost:8000`.

---

### 3. Frontend Kurulumu (React)

Yeni bir terminal açın ve frontend klasörüne gidin.

```bash
cd frontend
```

#### a. Paketleri Yükleme

```bash
npm install
# VEYA
yarn install
```

#### b. Konfigürasyon

API adresini değiştirmek isterseniz `frontend/` içinde `.env` oluşturun.

```ini
VITE_API_URL="http://localhost:8000"
```

#### c. Geliştirme Sunucusunu Başlatma

```bash
npm run dev
```

✅ **Başarılı:** Uygulama şu adreste çalışıyor: `http://localhost:5173`.

---

## 🐛 Sorun Giderme (Troubleshooting)

### Sık Karşılaşılan Hatalar

<details>
<summary><strong>🔴 Port 8000 kullanımda (Address already in use)</strong></summary>

Başka bir uygulama 8000 portunu kullanıyor.
**Çözüm:** Farklı bir portta çalıştırın:

```bash
uvicorn main:app --reload --port 8001
```

</details>

<details>
<summary><strong>🔴 Python "Module not found" hatası</strong></summary>

Sanal ortamı aktif etmemiş olabilirsiniz.
**Çözüm:** `venv\Scripts\activate` komutunu tekrar çalıştırın ve başında `(venv)` ibaresini gördüğünüzden emin olun.
</details>

<details>
<summary><strong>🔴 Tarayıcıda CORS Hatası</strong></summary>

Frontend backend'e erişemiyor.
**Çözüm:** Backend `.env` dosyasındaki `BACKEND_CORS_ORIGINS` ayarına `http://localhost:5173` adresinin ekli olduğundan emin olun.
</details>

---

## 🐳 Docker ile Kurulum (Alternatif)

Eğer Docker kullanmayı tercih ederseniz, tüm sistemi tek komutla ayağa kaldırabilirsiniz.

```bash
docker-compose up --build
```

Bu komut şunları başlatır:

* Backend: `:8000`
* Frontend: `:3000` (veya ayarlanan port)
* PostgreSQL: `:5432`
