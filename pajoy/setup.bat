@echo off
setlocal enabledelayedexpansion

title PAJOY System - Setup

echo.
echo ========================================
echo  PAJOY SYSTEM - First-Time Setup
echo ========================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed!
    echo.
    echo To fix this:
    echo 1. Visit: https://nodejs.org
    echo 2. Download and install Node.js LTS version
    echo 3. Make sure "Add to PATH" is selected during installation
    echo 4. Restart your computer
    echo 5. Run this setup script again
    echo.
    pause
    exit /b 1
)

echo ✓ Node.js found
node --version
npm --version
echo.

echo Installing dependencies...
echo This may take a few minutes on first run...
echo.

call npm install
if errorlevel 1 (
    echo.
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo Building frontend...
call npm run build
if errorlevel 1 (
    echo.
    echo ERROR: Failed to build frontend
    pause
    exit /b 1
)

echo.
echo Seeding database with sample data...
call npm run seed
if errorlevel 1 (
    echo.
    echo ERROR: Failed to seed database
    pause
    exit /b 1
)

echo.
echo ========================================
echo  Setup Complete!
echo ========================================
echo.
echo You can now launch the app by:
echo 1. Double-clicking "launch.bat"
echo 2. Or running "npm start" in PowerShell/Command Prompt
echo.
pause
