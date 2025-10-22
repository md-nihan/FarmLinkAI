@echo off
echo ========================================
echo  FarmLink AI - Starting Backend Server
echo ========================================
echo.

echo Installing Node.js dependencies...
call npm install

echo.
echo Starting Backend Server on port 3000...
echo.
call npm start

pause
