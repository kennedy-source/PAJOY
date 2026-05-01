@echo off
echo ========================================
echo   PAJOY SYSTEM - Desktop Application
echo ========================================
echo.

echo Checking if Node.js is installed...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed
    echo Please install Node.js from: https://nodejs.org
    pause
    exit /b 1
)

echo Starting application...
echo Please wait, this may take a moment on first run.
echo.

echo Checking if frontend is built...
if not exist "frontend\dist" (
    echo Building frontend...
    cd frontend
    npm run build
    cd ..
    echo.
)

echo Launching PAJOY System...
npm start

if %errorlevel% neq 0 (
    echo.
    echo Error starting PAJOY System
    echo Please check the error messages above
    pause
    exit /b 1
)

echo.
echo PAJOY System launched successfully!
pause
