@echo off
SETLOCAL

set "PORT=3000"

echo ==================================================
echo Express API - installer and starter
echo ==================================================

echo [1/3] Installing dependencies...
call npm install
if not "%ERRORLEVEL%"=="0" (
    echo Failed to install dependencies.
    echo Please check your Node.js installation and try again.
    pause
    exit /b 1
)

echo [2/3] Checking port %PORT%...
powershell -NoProfile -Command "$port = %PORT%; $listener = Get-NetTCPConnection -ErrorAction SilentlyContinue | Where-Object { $_.LocalPort -eq $port -and $_.State -eq 'Listen' }; if ($listener) { Write-Host 'Port %PORT% is in use. Stopping stale Node process...'; exit 1 }"
if "%ERRORLEVEL%"=="1" (
    echo Closing old Node process to free port %PORT%...
    taskkill /F /IM node.exe >nul 2>&1
    if not "%ERRORLEVEL%"=="0" (
        echo Unable to free port %PORT%.
        echo Please close any running Node server manually.
        echo Example: taskkill /F /IM node.exe
        pause
        exit /b 1
    )
)

echo [3/3] Starting server...
if not exist "%~dp0logs" mkdir "%~dp0logs"
set "LOG=%~dp0logs\server.log"
echo [START] %date% %time% >> "%LOG%"

echo Starting Express server on http://localhost:%PORT%
node server.js >> "%LOG%" 2>&1

if not "%ERRORLEVEL%"=="0" (
    echo.
    echo Server stopped with an error.
    echo Check log file: %LOG%
    pause
    exit /b %ERRORLEVEL%
)

ENDLOCAL
exit /b 0
