@echo off
echo ========================================
echo  PAJOY POS - Production Deployment
echo ========================================
echo.

cd /d "%~dp0"

echo Step 1: Installing dependencies...
npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo Step 2: Building frontend...
npm run build
if %errorlevel% neq 0 (
    echo ERROR: Failed to build frontend
    pause
    exit /b 1
)

echo.
echo Step 3: Starting application...
echo.
echo IMPORTANT: Make sure you have updated .env with real Pesapal credentials!
echo.
echo If you haven't set up ngrok yet, run: ngrok http 4000
echo Then update PESAPAL_CALLBACK_URL in .env with the ngrok URL
echo.
pause

npm start