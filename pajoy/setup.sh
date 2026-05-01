#!/usr/bin/env bash

# PAJOY System - First-Time Setup for macOS/Linux

set -e

echo ""
echo "========================================"
echo "  PAJOY SYSTEM - First-Time Setup"
echo "========================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed!"
    echo ""
    echo "To fix this:"
    echo "1. Visit: https://nodejs.org"
    echo "2. Download and install Node.js LTS version"
    echo "3. Restart your terminal"
    echo "4. Run this setup script again"
    echo ""
    exit 1
fi

echo "✓ Node.js found"
node --version
npm --version
echo ""

echo "Installing dependencies..."
echo "This may take a few minutes on first run..."
echo ""

if ! npm install; then
    echo ""
    echo "ERROR: Failed to install dependencies"
    exit 1
fi

echo ""
echo "Building frontend..."
if ! npm run build; then
    echo ""
    echo "ERROR: Failed to build frontend"
    exit 1
fi

echo ""
echo "Seeding database with sample data..."
if ! npm run seed; then
    echo ""
    echo "ERROR: Failed to seed database"
    exit 1
fi

echo ""
echo "========================================"
echo "  Setup Complete!"
echo "========================================"
echo ""
echo "You can now launch the app by:"
echo "1. Running: ./launch.sh"
echo "2. Or running: npm start"
echo ""
