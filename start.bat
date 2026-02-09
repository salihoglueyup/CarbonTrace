@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion
title CBAM Guard - Yönetim Konsolu

:: Renkli çıktı için ANSI desteği (Windows 10+)
for /f "tokens=4-5 delims=. " %%i in ('ver') do set VERSION=%%i.%%j
if "%VERSION%" geq "10.0" (set "ESC=")

:: Değişkenler
set "PROJECT_ROOT=%~dp0"
set "BACKEND_DIR=%PROJECT_ROOT%backend"
set "FRONTEND_DIR=%PROJECT_ROOT%frontend"
set "VENV_DIR=%PROJECT_ROOT%.venv"

:MENU
cls
echo.
echo  ╔══════════════════════════════════════════════════════════════════╗
echo  ║                                                                  ║
echo  ║     ██████╗██████╗  █████╗ ███╗   ███╗     ██████╗ ██╗   ██╗██████╗ 
echo  ║    ██╔════╝██╔══██╗██╔══██╗████╗ ████║    ██╔════╝ ██║   ██║██╔══██╗
echo  ║    ██║     ██████╔╝███████║██╔████╔██║    ██║  ███╗██║   ██║██████╔╝
echo  ║    ██║     ██╔══██╗██╔══██║██║╚██╔╝██║    ██║   ██║██║   ██║██╔═══╝ 
echo  ║    ╚██████╗██████╔╝██║  ██║██║ ╚═╝ ██║    ╚██████╔╝╚██████╔╝██║     
echo  ║     ╚═════╝╚═════╝ ╚═╝  ╚═╝╚═╝     ╚═╝     ╚═════╝  ╚═════╝ ╚═╝     
echo  ║                                                                  ║
echo  ║           KOBİ'ler için CBAM Uyum ve Yeşil Finansman             ║
echo  ╚══════════════════════════════════════════════════════════════════╝
echo.
echo  ┌────────────────────────────────────────────────────────────────────┐
echo  │                      🚀 HIZLI BAŞLATMA                             │
echo  ├────────────────────────────────────────────────────────────────────┤
echo  │  [1] 🌐 Tam Uygulama Başlat (Backend + Frontend)                   │
echo  │  [2] 🔧 Sadece Backend (FastAPI)                                   │
echo  │  [3] 🎨 Sadece Frontend (React)                                    │
echo  ├────────────────────────────────────────────────────────────────────┤
echo  │                      📦 KURULUM                                    │
echo  ├────────────────────────────────────────────────────────────────────┤
echo  │  [4] 📥 İlk Kurulum (Tüm bağımlılıkları yükle)                     │
echo  │  [5] 🔄 Bağımlılıkları Güncelle                                    │
echo  │  [6] 🐍 Python Virtual Environment Oluştur                         │
echo  ├────────────────────────────────────────────────────────────────────┤
echo  │                      🛠️ GELİŞTİRİCİ ARAÇLARI                       │
echo  ├────────────────────────────────────────────────────────────────────┤
echo  │  [7] 🧪 Testleri Çalıştır                                          │
echo  │  [8] 🏗️ Production Build Oluştur                                   │
echo  │  [9] 🗃️ Veritabanını Sıfırla                                       │
echo  │  [10] 📊 API Dokümantasyonu Aç                                     │
echo  ├────────────────────────────────────────────────────────────────────┤
echo  │                      ℹ️ BİLGİ                                      │
echo  ├────────────────────────────────────────────────────────────────────┤
echo  │  [11] 📋 Proje Durumu                                              │
echo  │  [12] 🌍 Tarayıcıda Aç                                             │
echo  ├────────────────────────────────────────────────────────────────────┤
echo  │                      🧹 BAKIM                                      │
echo  ├────────────────────────────────────────────────────────────────────┤
echo  │  [13] 🗑️ Cache Temizle (Vite + Browser)                            │
echo  │  [0] ❌ Çıkış                                                      │
echo  └────────────────────────────────────────────────────────────────────┘
echo.
set /p choice=Seçiminiz (0-13): 

if "%choice%"=="1" goto START_ALL
if "%choice%"=="2" goto START_BACKEND
if "%choice%"=="3" goto START_FRONTEND
if "%choice%"=="4" goto FIRST_INSTALL
if "%choice%"=="5" goto UPDATE_DEPS
if "%choice%"=="6" goto CREATE_VENV
if "%choice%"=="7" goto RUN_TESTS
if "%choice%"=="8" goto PRODUCTION_BUILD
if "%choice%"=="9" goto RESET_DB
if "%choice%"=="10" goto OPEN_DOCS
if "%choice%"=="11" goto PROJECT_STATUS
if "%choice%"=="12" goto OPEN_BROWSER
if "%choice%"=="13" goto CLEAR_CACHE
if "%choice%"=="0" goto EXIT

echo.
echo ⚠️ Geçersiz seçim! Lütfen 0-13 arası bir değer girin.
timeout /t 2 >nul
goto MENU

:START_ALL
cls
echo.
echo  ╔══════════════════════════════════════════════════════════════════╗
echo  ║             🚀 TAM UYGULAMA BAŞLATILIYOR                         ║
echo  ╚══════════════════════════════════════════════════════════════════╝
echo.
echo  [1/5] 📂 Dizin kontrolü yapılıyor...

if not exist "%BACKEND_DIR%" (
    echo  ❌ Backend dizini bulunamadı!
    goto MENU
)
if not exist "%FRONTEND_DIR%" (
    echo  ❌ Frontend dizini bulunamadı!
    goto MENU
)
echo  ✅ Dizinler mevcut
echo.

echo  [2/5] 🔌 Port kontrolü yapılıyor...

:: Backend port kontrolü (8001)
set "PORT8000_KILLED=0"
for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr ":8001.*LISTENING"') do (
    if not "%%a"=="" (
        echo  ⚠️ Port 8001 meşgul ^(PID: %%a^) - kapatılıyor...
        taskkill /PID %%a /F >nul 2>&1
        set "PORT8000_KILLED=1"
    )
)
if "!PORT8000_KILLED!"=="1" echo  ✅ Port 8001 temizlendi

:: Frontend port kontrolü (5173)  
set "PORT5173_KILLED=0"
for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr ":5173.*LISTENING"') do (
    if not "%%a"=="" (
        echo  ⚠️ Port 5173 meşgul ^(PID: %%a^) - kapatılıyor...
        taskkill /PID %%a /F >nul 2>&1
        set "PORT5173_KILLED=1"
    )
)
if "!PORT5173_KILLED!"=="1" echo  ✅ Port 5173 temizlendi

:: Portlar boşsa mesaj ver
if "!PORT8000_KILLED!"=="0" if "!PORT5173_KILLED!"=="0" echo  ✅ Tüm portlar zaten boş
echo.

echo  [3/5] 🧹 Vite cache temizleniyor...
cd /d %FRONTEND_DIR%
if exist "node_modules\.vite" (
    rmdir /s /q "node_modules\.vite" 2>nul
    echo  ✅ Cache temizlendi (güncel tasarım garantisi)
) else (
    echo  ✅ Cache zaten temiz
)
echo.

echo  [4/5] 🔧 Backend başlatılıyor (FastAPI - Port 8001)...
start "CBAM Backend" cmd /k "cd /d %BACKEND_DIR% && call %VENV_DIR%\Scripts\activate.bat && python -m uvicorn main:app --host 0.0.0.0 --port 8001 --reload"
echo  ✅ Backend penceresi açıldı
echo.

echo  ⏳ Backend'in başlaması bekleniyor...
timeout /t 3 /nobreak >nul
echo.

echo  [5/5] 🎨 Frontend başlatılıyor (React - Port 5173)...
start "CBAM Frontend" cmd /k "cd /d %FRONTEND_DIR% && npm run dev"
echo  ✅ Frontend penceresi açıldı
echo.

echo  ╔══════════════════════════════════════════════════════════════════╗
echo  ║                    ✅ UYGULAMA BAŞLATILDI!                        ║
echo  ╠══════════════════════════════════════════════════════════════════╣
echo  ║                                                                  ║
echo  ║   📍 Frontend:  http://localhost:5173                             ║
echo  ║   📍 Backend:   http://localhost:8001                             ║
echo  ║   📍 API Docs:  http://localhost:8001/docs                        ║
echo  ║                                                                  ║
echo  ║   💡 İpucu: Tarayıcıda açmak için [12] seçin                      ║
echo  ║                                                                  ║
echo  ╚══════════════════════════════════════════════════════════════════╝
echo.
pause
goto MENU

:START_BACKEND
cls
echo.
echo  ╔══════════════════════════════════════════════════════════════════╗
echo  ║             🔧 BACKEND BAŞLATILIYOR (FastAPI)                    ║
echo  ╚══════════════════════════════════════════════════════════════════╝
echo.
cd /d %BACKEND_DIR%
echo  📂 Dizin: %BACKEND_DIR%
echo.
echo  🚀 Uvicorn başlatılıyor...
echo     Hot-reload aktif
echo     Port: 8001
echo.
call %VENV_DIR%\Scripts\activate.bat
python -m uvicorn main:app --host 0.0.0.0 --port 8001 --reload
pause
goto MENU

:START_FRONTEND
cls
echo.
echo  ╔══════════════════════════════════════════════════════════════════╗
echo  ║             🎨 FRONTEND BAŞLATILIYOR (React)                     ║
echo  ╚══════════════════════════════════════════════════════════════════╝
echo.
cd /d %FRONTEND_DIR%
echo  📂 Dizin: %FRONTEND_DIR%
echo.
echo  🧹 Vite cache temizleniyor...
if exist "node_modules\.vite" (
    rmdir /s /q "node_modules\.vite" 2>nul
    echo  ✅ Cache temizlendi
) else (
    echo  ℹ️ Cache zaten temiz
)
echo.
echo  🚀 Vite dev server başlatılıyor...
echo     Hot-reload aktif
echo     Port: 5173
echo.
npm run dev
pause
goto MENU

:FIRST_INSTALL
cls
echo.
echo  ╔══════════════════════════════════════════════════════════════════╗
echo  ║             📥 İLK KURULUM YAPILIYOR                             ║
echo  ╚══════════════════════════════════════════════════════════════════╝
echo.
echo  [1/4] 🐍 Python virtual environment kontrol ediliyor...
if not exist "%VENV_DIR%" (
    echo  ⏳ Virtual environment oluşturuluyor...
    python -m venv "%VENV_DIR%"
    echo  ✅ Virtual environment oluşturuldu
) else (
    echo  ✅ Virtual environment mevcut
)
echo.

echo  [2/4] 📦 Backend bağımlılıkları yükleniyor...
cd /d %BACKEND_DIR%
call "%VENV_DIR%\Scripts\activate.bat"
pip install -r requirements.txt --quiet
echo  ✅ Backend bağımlılıkları yüklendi
echo.

echo  [3/4] 📦 Frontend bağımlılıkları yükleniyor...
cd /d %FRONTEND_DIR%
call npm install
echo  ✅ Frontend bağımlılıkları yüklendi
echo.

echo  [4/4] 🗃️ Veritabanı hazırlanıyor...
cd /d %BACKEND_DIR%
if not exist "cbam_guard.db" (
    python -c "from app.db.init_db import init_db; init_db()"
    echo  ✅ Veritabanı oluşturuldu
) else (
    echo  ✅ Veritabanı mevcut
)
echo.

echo  ╔══════════════════════════════════════════════════════════════════╗
echo  ║               ✅ KURULUM TAMAMLANDI!                              ║
echo  ║                                                                  ║
echo  ║   Uygulamayı başlatmak için ana menüden [1] seçin                ║
echo  ╚══════════════════════════════════════════════════════════════════╝
echo.
pause
goto MENU

:UPDATE_DEPS
cls
echo.
echo  ╔══════════════════════════════════════════════════════════════════╗
echo  ║             🔄 BAĞIMLILIKLAR GÜNCELLENİYOR                       ║
echo  ╚══════════════════════════════════════════════════════════════════╝
echo.
echo  [1/2] 📦 Backend bağımlılıkları güncelleniyor...
cd /d %BACKEND_DIR%
pip install -r requirements.txt --upgrade --quiet
echo  ✅ Backend güncellendi
echo.

echo  [2/2] 📦 Frontend bağımlılıkları güncelleniyor...
cd /d %FRONTEND_DIR%
call npm update
echo  ✅ Frontend güncellendi
echo.
pause
goto MENU

:CREATE_VENV
cls
echo.
echo  ╔══════════════════════════════════════════════════════════════════╗
echo  ║         🐍 PYTHON VIRTUAL ENVIRONMENT OLUŞTURULUYOR              ║
echo  ╚══════════════════════════════════════════════════════════════════╝
echo.
if exist "%VENV_DIR%" (
    echo  ⚠️ Mevcut virtual environment bulundu.
    set /p confirm=Silip yeniden oluşturulsun mu? (E/H): 
    if /i "!confirm!"=="E" (
        rmdir /s /q "%VENV_DIR%"
    ) else (
        goto MENU
    )
)
echo.
echo  ⏳ Virtual environment oluşturuluyor...
python -m venv "%VENV_DIR%"
echo  ✅ Oluşturuldu: %VENV_DIR%
echo.
echo  💡 Aktif etmek için: .venv\Scripts\activate
echo.
pause
goto MENU

:RUN_TESTS
cls
echo.
echo  ╔══════════════════════════════════════════════════════════════════╗
echo  ║                 🧪 TESTLER ÇALIŞTIRILIYOR                        ║
echo  ╚══════════════════════════════════════════════════════════════════╝
echo.
echo  [1/2] 🐍 Backend testleri (pytest)...
cd /d %BACKEND_DIR%
python -m pytest tests/ -v --tb=short
echo.
echo  [2/2] 🎨 Frontend testleri...
cd /d %FRONTEND_DIR%
if exist "package.json" (
    npm test 2>nul || echo  ℹ️ Frontend test komutu yapılandırılmamış
)
echo.
pause
goto MENU

:PRODUCTION_BUILD
cls
echo.
echo  ╔══════════════════════════════════════════════════════════════════╗
echo  ║             🏗️ PRODUCTION BUILD OLUŞTURULUYOR                    ║
echo  ╚══════════════════════════════════════════════════════════════════╝
echo.
echo  [1/1] 📦 Frontend production build...
cd /d %FRONTEND_DIR%
call npm run build
echo.
if exist "%FRONTEND_DIR%\dist" (
    echo  ✅ Build başarılı!
    echo  📂 Çıktı: %FRONTEND_DIR%\dist
    for %%I in ("%FRONTEND_DIR%\dist\assets\*.js") do echo     📄 %%~nxI (%%~zI bytes)
) else (
    echo  ❌ Build başarısız!
)
echo.
pause
goto MENU

:RESET_DB
cls
echo.
echo  ╔══════════════════════════════════════════════════════════════════╗
echo  ║             🗃️ VERİTABANI SIFIRLANIYOR                           ║
echo  ╚══════════════════════════════════════════════════════════════════╝
echo.
echo  ⚠️ DİKKAT: Tüm veriler silinecek!
set /p confirm=Devam etmek istiyor musunuz? (E/H): 
if /i not "%confirm%"=="E" goto MENU
echo.
cd /d %BACKEND_DIR%
if exist "cbam_guard.db" (
    del /f cbam_guard.db
    echo  🗑️ Eski veritabanı silindi
)
python -c "from app.db.init_db import init_db; init_db()"
echo  ✅ Yeni veritabanı oluşturuldu
echo.
pause
goto MENU

:OPEN_DOCS
cls
echo.
echo  📊 API Dokümantasyonu açılıyor...
start http://localhost:8000/docs
timeout /t 2 >nul
goto MENU

:PROJECT_STATUS
cls
echo.
echo  ╔══════════════════════════════════════════════════════════════════╗
echo  ║                    📋 PROJE DURUMU                               ║
echo  ╚══════════════════════════════════════════════════════════════════╝
echo.
echo  📂 Proje Dizini: %PROJECT_ROOT%
echo.
echo  ┌─────────────────────────────────────────────────────────────┐
echo  │ 🐍 BACKEND                                                  │
echo  └─────────────────────────────────────────────────────────────┘
cd /d %BACKEND_DIR%
if exist "requirements.txt" (
    echo  ✅ requirements.txt mevcut
) else (
    echo  ❌ requirements.txt bulunamadı
)
if exist "cbam_guard.db" (
    for %%I in (cbam_guard.db) do echo  ✅ Veritabanı: %%~zI bytes
) else (
    echo  ⚠️ Veritabanı henüz oluşturulmamış
)
python --version 2>nul || echo  ❌ Python bulunamadı
echo.
echo  ┌─────────────────────────────────────────────────────────────┐
echo  │ 🎨 FRONTEND                                                 │
echo  └─────────────────────────────────────────────────────────────┘
cd /d %FRONTEND_DIR%
if exist "node_modules" (
    echo  ✅ node_modules mevcut
) else (
    echo  ⚠️ node_modules yüklenmemiş (npm install gerekli)
)
if exist "dist" (
    echo  ✅ Production build mevcut
) else (
    echo  ℹ️ Production build yok
)
call node --version 2>nul || echo  ❌ Node.js bulunamadı
call npm --version 2>nul || echo  ❌ npm bulunamadı
echo.
echo  ┌─────────────────────────────────────────────────────────────┐
echo  │ 🌐 PORTLAR                                                  │
echo  └─────────────────────────────────────────────────────────────┘
netstat -ano | findstr ":8000" >nul 2>&1 && echo  ✅ Port 8000 (Backend) aktif || echo  ⚪ Port 8000 (Backend) boş
netstat -ano | findstr ":5173" >nul 2>&1 && echo  ✅ Port 5173 (Frontend) aktif || echo  ⚪ Port 5173 (Frontend) boş
echo.
pause
goto MENU

:OPEN_BROWSER
cls
echo.
echo  🌍 Tarayıcıda açılıyor...
start http://localhost:5173
timeout /t 1 >nul
goto MENU

:CLEAR_CACHE
cls
echo.
echo  ╔══════════════════════════════════════════════════════════════════╗
echo  ║           🗑️ CACHE TEMİZLENİYOR                                 ║
echo  ╚══════════════════════════════════════════════════════════════════╝
echo.
cd /d %FRONTEND_DIR%

echo  [1/4] 🧹 Vite cache temizleniyor...
if exist "node_modules\.vite" (
    rmdir /s /q "node_modules\.vite" 2>nul
    echo  ✅ node_modules/.vite silindi
) else (
    echo  ℹ️ Vite cache zaten temiz
)
echo.

echo  [2/4] 🧹 dist klasörü temizleniyor...
if exist "dist" (
    rmdir /s /q "dist" 2>nul
    echo  ✅ dist klasörü silindi
) else (
    echo  ℹ️ dist klasörü zaten temiz
)
echo.

echo  [3/4] 🧹 TypeScript cache temizleniyor...
if exist "tsconfig.tsbuildinfo" (
    del /f "tsconfig.tsbuildinfo" 2>nul
    echo  ✅ tsconfig.tsbuildinfo silindi
) else (
    echo  ℹ️ TypeScript cache yok
)
echo.

echo  [4/4] 🧹 Browser cache önlemi...
echo  💡 Tarayıcınızda Ctrl+Shift+R ile hard refresh yapın
echo     veya DevTools'da "Disable cache" seçeneğini aktif edin.
echo.

echo  ╔══════════════════════════════════════════════════════════════════╗
echo  ║              ✅ CACHE TEMİZLENDİ!                                ║
echo  ║                                                                  ║
echo  ║   💡 Şimdi [1] veya [3] ile uygulamayı yeniden başlatın         ║
echo  ║   💡 Tarayıcıda Ctrl+Shift+R ile hard refresh yapın             ║
echo  ╚══════════════════════════════════════════════════════════════════╝
echo.
pause
goto MENU

:EXIT
cls
echo.
echo  ╔══════════════════════════════════════════════════════════════════╗
echo  ║                                                                  ║
echo  ║        🌿 CBAM Guard'ı kullandığınız için teşekkürler! 🌿         ║
echo  ║                                                                  ║
echo  ║           Sürdürülebilir bir gelecek için teknoloji              ║
echo  ║                                                                  ║
echo  ╚══════════════════════════════════════════════════════════════════╝
echo.
timeout /t 2 >nul
exit /b 0
