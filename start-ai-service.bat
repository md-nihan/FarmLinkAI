@echo off
echo ========================================
echo  FarmLink AI - Starting AI Service
echo ========================================
echo.

cd ai-service
echo Installing Python dependencies...
pip install -r requirements.txt

echo.
echo Starting AI Service on port 5000...
echo.
python app.py

pause
