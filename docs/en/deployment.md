# 🚀 Deployment Guide

This guide covers the deployment of CBAM Guard to a production environment using Docker and Nginx.

## 📦 Docker Deployment (Recommended)

The easiest way to deploy is using the provided `docker-compose.yml`.

### 1. Prepare Environment

On your production server:

```bash
git clone https://github.com/your-org/cbam-guard.git
cd cbam-guard
cp backend/.env.example backend/.env
# EDIT .env WITH PRODUCTION VALUES!
```

### 2. Production Config

Ensure your `.env` has:

```ini
DEBUG=False
ENVIRONMENT=production
ALLOWED_HOSTS=["cbam.yourcompany.com"]
```

### 3. Build & Run

```bash
docker-compose up -d --build
```

This lifts containers for FastAPI, React (served via Nginx), Postgres, and Redis.

## 🌐 Nginx Configuration

We use Nginx as a reverse proxy to serve the frontend static files and proxy API requests to the backend.

**Default `nginx.conf` snippet:**

```nginx
server {
    listen 80;
    server_name cbam.yourcompany.com;

    # Frontend (React)
    location / {
        root /usr/share/nginx/html;
        index index.html index.htm;
        try_files $uri $uri/ /index.html; # History API fallback
    }

    # Backend (FastAPI)
    location /api {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 🔄 CI/CD Pipeline

We use **GitHub Actions** for continuous deployment.

### Workflow: `.github/workflows/deploy.yml`

1. **Test:** Runs `pytest` on push to `main`.
2. **Build:** Builds Docker images and pushes to user Container Registry (GHCR/DockerHub).
3. **Deploy:** SSHs into the production server and runs `docker-compose pull && docker-compose up -d`.

## 📈 Monitoring

* **Logs:** `docker-compose logs -f`
* **Health Checks:** Configure uptime monitors (e.g., UptimeRobot) to ping `/api/health`.
