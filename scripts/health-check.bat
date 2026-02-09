@echo off
chcp 65001 >nul
echo.
echo  ╔══════════════════════════════════════════════════════════════════╗
echo  ║             🔍 CBAM Guard - Sağlık Kontrolü                      ║
echo  ╚══════════════════════════════════════════════════════════════════╝
echo.

set ERRORS=0

echo  ┌─────────────────────────────────────────────────────────────┐
echo  │ 🐍 PYTHON KONTROL                                           │
echo  └─────────────────────────────────────────────────────────────┘
python --version >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    for /f "tokens=2" %%v in ('python --version 2^>^&1') do echo  ✅ Python: %%v
) else (
    echo  ❌ Python bulunamadı!
    set /a ERRORS+=1
)

pip --version >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    for /f "tokens=2" %%v in ('pip --version 2^>^&1') do echo  ✅ pip: %%v
) else (
    echo  ❌ pip bulunamadı!
    set /a ERRORS+=1
)
echo.

echo  ┌─────────────────────────────────────────────────────────────┐
echo  │ 📦 NODE.JS KONTROL                                          │
echo  └─────────────────────────────────────────────────────────────┘
node --version >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    for /f %%v in ('node --version 2^>^&1') do echo  ✅ Node.js: %%v
) else (
    echo  ❌ Node.js bulunamadı!
    set /a ERRORS+=1
)

npm --version >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    for /f %%v in ('npm --version 2^>^&1') do echo  ✅ npm: %%v
) else (
    echo  ❌ npm bulunamadı!
    set /a ERRORS+=1
)
echo.

echo  ┌─────────────────────────────────────────────────────────────┐
echo  │ 📂 DOSYA KONTROL                                            │
echo  └─────────────────────────────────────────────────────────────┘
if exist "%~dp0..\backend\requirements.txt" (
    echo  ✅ backend/requirements.txt
) else (
    echo  ❌ backend/requirements.txt bulunamadı!
    set /a ERRORS+=1
)

if exist "%~dp0..\frontend\package.json" (
    echo  ✅ frontend/package.json
) else (
    echo  ❌ frontend/package.json bulunamadı!
    set /a ERRORS+=1
)

if exist "%~dp0..\backend\main.py" (
    echo  ✅ backend/main.py
) else (
    echo  ❌ backend/main.py bulunamadı!
    set /a ERRORS+=1
)

if exist "%~dp0..\frontend\node_modules" (
    echo  ✅ frontend/node_modules
) else (
    echo  ⚠️ frontend/node_modules yok (npm install gerekli)
)

if exist "%~dp0..\backend\cbam_guard.db" (
    for %%I in ("%~dp0..\backend\cbam_guard.db") do echo  ✅ Veritabanı: %%~zI bytes
) else (
    echo  ⚠️ Veritabanı henüz oluşturulmamış
)
echo.

echo  ┌─────────────────────────────────────────────────────────────┐
echo  │ 🌐 PORT KONTROL                                             │
echo  └─────────────────────────────────────────────────────────────┘
netstat -ano | findstr ":8000" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo  ✅ Port 8000 ^(Backend^) aktif
) else (
    echo  ⚪ Port 8000 ^(Backend^) boş
)

netstat -ano | findstr ":5173" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo  ✅ Port 5173 ^(Frontend^) aktif
) else (
    echo  ⚪ Port 5173 ^(Frontend^) boş
)
echo.

echo  ════════════════════════════════════════════════════════════════════
if %ERRORS% EQU 0 (
    echo  ✅ Tüm kontroller başarılı! Sistem hazır.
) else (
    echo  ⚠️ %ERRORS% hata bulundu. Lütfen düzeltin.
)
echo  ════════════════════════════════════════════════════════════════════
echo.
pause
