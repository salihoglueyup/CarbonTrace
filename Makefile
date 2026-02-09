# ===================================
# CBAM Guard - Makefile
# ===================================
# Linux/macOS için komut kısayolları (make komutu ile kullanılır)

.PHONY: help install dev build test clean docker-up docker-down

# Varsayılan hedef
help:
	@echo "╔══════════════════════════════════════════════════════════════════╗"
	@echo "║                    CBAM Guard - Makefile                         ║"
	@echo "╚══════════════════════════════════════════════════════════════════╝"
	@echo ""
	@echo "Kullanım: make [hedef]"
	@echo ""
	@echo "Hedefler:"
	@echo "  install      - Tüm bağımlılıkları yükle"
	@echo "  dev          - Geliştirme sunucularını başlat"
	@echo "  backend      - Sadece backend başlat"
	@echo "  frontend     - Sadece frontend başlat"
	@echo "  build        - Production build oluştur"
	@echo "  test         - Testleri çalıştır"
	@echo "  lint         - Kod kalitesi kontrolü"
	@echo "  clean        - Geçici dosyaları temizle"
	@echo "  docker-up    - Docker container'ları başlat"
	@echo "  docker-down  - Docker container'ları durdur"
	@echo ""

# Kurulum
install:
	@echo "📦 Bağımlılıklar yükleniyor..."
	cd backend && pip install -r requirements.txt
	cd frontend && npm install
	@echo "✅ Kurulum tamamlandı!"

# Geliştirme
dev:
	@echo "🚀 Geliştirme sunucuları başlatılıyor..."
	@make -j2 backend frontend

backend:
	cd backend && python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload

frontend:
	cd frontend && npm run dev

# Build
build:
	@echo "🏗️ Production build oluşturuluyor..."
	cd frontend && npm run build
	@echo "✅ Build tamamlandı!"

# Test
test:
	@echo "🧪 Testler çalıştırılıyor..."
	cd backend && python -m pytest tests/ -v
	@echo "✅ Testler tamamlandı!"

# Lint
lint:
	@echo "🔍 Kod kalitesi kontrol ediliyor..."
	cd backend && python -m flake8 app/
	cd frontend && npm run lint
	@echo "✅ Lint tamamlandı!"

# Temizlik
clean:
	@echo "🧹 Geçici dosyalar temizleniyor..."
	find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".pytest_cache" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name "node_modules/.cache" -exec rm -rf {} + 2>/dev/null || true
	rm -rf frontend/dist
	@echo "✅ Temizlik tamamlandı!"

# Docker
docker-up:
	@echo "🐳 Docker container'lar başlatılıyor..."
	docker-compose up -d
	@echo "✅ Container'lar çalışıyor!"

docker-down:
	@echo "🐳 Docker container'lar durduruluyor..."
	docker-compose down
	@echo "✅ Container'lar durduruldu!"

docker-build:
	@echo "🐳 Docker image'ları oluşturuluyor..."
	docker-compose build
	@echo "✅ Image'lar hazır!"

# Veritabanı
db-reset:
	@echo "🗃️ Veritabanı sıfırlanıyor..."
	cd backend && rm -f cbam_guard.db && python -c "from app.db.init_db import init_db; init_db()"
	@echo "✅ Veritabanı sıfırlandı!"

db-migrate:
	@echo "🗃️ Veritabanı migration'ları çalıştırılıyor..."
	cd backend && alembic upgrade head
	@echo "✅ Migration tamamlandı!"
