#!/usr/bin/env bash
# PAJOY System launcher script for macOS/Linux

echo ""
echo "========================================"
echo "  PAJOY SYSTEM - Desktop Application"
echo "========================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed"
    echo "Please install Node.js from: https://nodejs.org"
    exit 1
fi

echo "Starting the application..."
echo "Please wait, this may take a moment on first run."
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
    echo ""
fi

# Check if frontend is built
if [ ! -d "frontend/dist" ]; then
    echo "Building frontend..."
    npm run build
    echo ""
fi

# Start the app
echo "Launching PAJOY System..."
npm start

if [ $? -ne 0 ]; then
    echo ""
    echo "Error starting PAJOY System"
    echo "Please check the error messages above"
    exit 1
fi
