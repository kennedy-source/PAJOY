@echo off
title PAJOY System - Launching...
echo.
echo ========================================
echo  PAJOY SYSTEM - Desktop Application
echo ========================================
echo.
echo Starting the application...
echo Please wait, this may take a moment on first run.
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    echo.
)

REM Check if frontend is built for production
if not exist "frontend\dist" (
    echo Building frontend...
    call npm run build
    echo.
)

REM Start the app
echo Launching PAJOY System...
call npm start

if errorlevel 1 (
    echo.
    echo Error starting PAJOY System
    echo Please ensure Node.js is installed: https://nodejs.org
    pause
    exit /b 1
)
