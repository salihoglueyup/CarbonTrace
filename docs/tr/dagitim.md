# 🚀 Dağıtım (Deployment) Rehberi

Bu rehber, CBAM Guard projesinin Docker ve Nginx kullanılarak canlı (production) ortama alınmasını kapsar.

## 📦 Docker ile Dağıtım (Önerilen)

En kolay yöntem `docker-compose.yml` dosyasını kullanmaktır.

### 1. Ortamı Hazırlayın

Sunucunuzda:

```bash
git clone https://github.com/your-org/cbam-guard.git
cd cbam-guard
cp backend/.env.example backend/.env
# .env DOSYASINI CANLI AYARLARLA DÜZENLEYİN!
```

### 2. Canlı Ortam Ayarları

`.env` dosyanızda şunların olduğundan emin olun:

```ini
DEBUG=False
ENVIRONMENT=production
ALLOWED_HOSTS=["cbam.sirketiniz.com"]
```

### 3. Derle ve Çalıştır

```bash
docker-compose up -d --build
```

Bu komut FastAPI, React (Nginx üzerinden), Postgres ve Redis konteynerlerini ayağa kaldırır.

## 🌐 Nginx Konfigürasyonu

Nginx'i statik frontend dosyalarını sunmak ve API isteklerini backend'e yönlendirmek için "Reverse Proxy" olarak kullanıyoruz.

**Örnek `nginx.conf`:**

```nginx
server {
    listen 80;
    server_name cbam.sirketiniz.com;

    # Frontend (React)
    location / {
        root /usr/share/nginx/html;
        index index.html index.htm;
        try_files $uri $uri/ /index.html; # React Router için gerekli
    }

    # Backend (FastAPI)
    location /api {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 🔄 CI/CD Süreci

Sürekli dağıtım için **GitHub Actions** kullanıyoruz.

### İş Akışı: `.github/workflows/deploy.yml`

1. **Test:** `main` dalına kod atıldığında `pytest` çalışır.
2. **Build:** Docker imajlarını oluşturur ve kayıt defterine (GHCR/DockerHub) gönderir.
3. **Deploy:** Sunucuya SSH ile bağlanır ve `docker-compose pull && docker-compose up -d` komutunu çalıştırır.

## 📈 İzleme (Monitoring)

* **Loglar:** `docker-compose logs -f`
* **Sağlık Kontrolü:** `/api/health` adresini pingleyen bir servis (örn. UptimeRobot) kurun.
