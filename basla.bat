@echo off
echo ================================================
echo    PARIBU ARBITRAJ RADAR - LOCALHOST
echo ================================================
echo.

REM Node.js kontrolu
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [HATA] Node.js yuklu degil!
    echo.
    echo Lutfen Node.js yukleyin: https://nodejs.org
    echo.
    pause
    exit /b 1
)

echo [OK] Node.js bulundu
echo.

REM node_modules kontrolu
if not exist "node_modules" (
    echo [ADIM 1/2] Bagimliliklari yukleniyor...
    echo.
    call npm install
    echo.
    if %ERRORLEVEL% NEQ 0 (
        echo [HATA] Bagimliliklari yukleme basarisiz!
        pause
        exit /b 1
    )
    echo [OK] Bagimliliklari yuklendi
    echo.
) else (
    echo [OK] Bagimliliklari zaten yuklu
    echo.
)

echo [ADIM 2/2] Server baslatiliyor...
echo.
echo ================================================
echo  Server: http://localhost:3000
echo  Tarayicida index.html dosyasini ac!
echo ================================================
echo.
echo Durdurmak icin: Ctrl + C
echo.

REM Server'i baslat
node server.js

pause
