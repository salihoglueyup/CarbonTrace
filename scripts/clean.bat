@echo off
chcp 65001 >nul
echo.
echo  ╔══════════════════════════════════════════════════════════════════╗
echo  ║             🧹 CBAM Guard - Temizlik Scripti                     ║
echo  ╚══════════════════════════════════════════════════════════════════╝
echo.

echo  [1/5] 🐍 Python cache temizleniyor...
for /d /r "%~dp0.." %%d in (__pycache__) do @if exist "%%d" rd /s /q "%%d" 2>nul
for /d /r "%~dp0.." %%d in (.pytest_cache) do @if exist "%%d" rd /s /q "%%d" 2>nul
echo  ✅ Python cache temizlendi

echo  [2/5] 📦 Node.js cache temizleniyor...
if exist "%~dp0..\frontend\node_modules\.cache" rd /s /q "%~dp0..\frontend\node_modules\.cache" 2>nul
if exist "%~dp0..\frontend\node_modules\.vite" rd /s /q "%~dp0..\frontend\node_modules\.vite" 2>nul
echo  ✅ Node.js cache temizlendi

echo  [3/5] 🏗️ Build çıktıları temizleniyor...
if exist "%~dp0..\frontend\dist" rd /s /q "%~dp0..\frontend\dist" 2>nul
echo  ✅ Build çıktıları temizlendi

echo  [4/5] 📝 Log dosyaları temizleniyor...
del /q "%~dp0..\backend\*.log" 2>nul
del /q "%~dp0..\*.log" 2>nul
echo  ✅ Log dosyaları temizlendi

echo  [5/5] 🗑️ Geçici dosyalar temizleniyor...
del /q "%~dp0..\*.tmp" 2>nul
del /q "%~dp0..\*~" 2>nul
echo  ✅ Geçici dosyalar temizlendi

echo.
echo  ════════════════════════════════════════════════════════════════════
echo  ✅ Temizlik tamamlandı!
echo  ════════════════════════════════════════════════════════════════════
echo.
pause
