@echo off
cls
echo ========================================
echo     FarmLink AI - Setup Wizard
echo ========================================
echo.

REM Check if .env exists
if exist .env (
    echo [OK] Environment file found
) else (
    echo [!] Creating .env file from template...
    copy .env.example .env
    echo.
    echo [ACTION REQUIRED] Please edit .env file with your credentials:
    echo   - MongoDB Atlas connection string
    echo   - Twilio Account SID and Auth Token
    echo   - Twilio WhatsApp number
    echo.
    pause
    notepad .env
)

echo.
echo Installing dependencies...
echo.

echo [1/2] Installing Node.js packages...
call npm install

echo.
echo [2/2] Installing Python packages...
cd ai-service
pip install -r requirements.txt
cd ..

echo.
echo ========================================
echo     Setup Complete!
echo ========================================
echo.
echo Next steps:
echo   1. Ensure .env file has correct credentials
echo   2. Run start-ai-service.bat in one terminal
echo   3. Run start-backend.bat in another terminal
echo   4. Open http://localhost:3000 in browser
echo.
echo Quick links after starting:
echo   - Marketplace: http://localhost:3000
echo   - Admin Panel: http://localhost:3000/admin.html
echo.
pause
