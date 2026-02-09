@echo off
chcp 65001 >nul
echo.
echo  ╔══════════════════════════════════════════════════════════════════╗
echo  ║             📦 CBAM Guard - Backup Scripti                       ║
echo  ╚══════════════════════════════════════════════════════════════════╝
echo.

:: Tarih formatı
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
set BACKUP_DATE=%datetime:~0,8%_%datetime:~8,6%
set BACKUP_DIR=%~dp0..\backups
set BACKUP_NAME=cbam_backup_%BACKUP_DATE%

echo  📅 Backup tarihi: %BACKUP_DATE%
echo  📂 Backup dizini: %BACKUP_DIR%
echo.

:: Backup dizini oluştur
if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"

echo  [1/3] 🗃️ Veritabanı yedekleniyor...
if exist "%~dp0..\backend\cbam_guard.db" (
    copy "%~dp0..\backend\cbam_guard.db" "%BACKUP_DIR%\cbam_guard_%BACKUP_DATE%.db" >nul
    echo  ✅ Veritabanı yedeklendi
) else (
    echo  ⚠️ Veritabanı bulunamadı, atlanıyor
)

echo  [2/3] ⚙️ Konfigürasyon dosyaları yedekleniyor...
if exist "%~dp0..\backend\.env" (
    copy "%~dp0..\backend\.env" "%BACKUP_DIR%\backend_env_%BACKUP_DATE%.txt" >nul
    echo  ✅ Backend .env yedeklendi
)
if exist "%~dp0..\frontend\.env" (
    copy "%~dp0..\frontend\.env" "%BACKUP_DIR%\frontend_env_%BACKUP_DATE%.txt" >nul
    echo  ✅ Frontend .env yedeklendi
)

echo  [3/3] 📊 Backend data yedekleniyor...
if exist "%~dp0..\data" (
    xcopy "%~dp0..\data\*" "%BACKUP_DIR%\data_%BACKUP_DATE%\" /E /I /Q >nul 2>&1
    echo  ✅ Data dizini yedeklendi
)

echo.
echo  ════════════════════════════════════════════════════════════════════
echo  ✅ Backup tamamlandı!
echo  📂 Konum: %BACKUP_DIR%
echo  ════════════════════════════════════════════════════════════════════
echo.

:: Eski backup'ları listele
echo  📋 Mevcut backup'lar:
dir /b "%BACKUP_DIR%\*.db" 2>nul
echo.
pause
