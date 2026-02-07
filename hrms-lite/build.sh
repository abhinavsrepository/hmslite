#!/usr/bin/env bash
# Render Build Script for HRMS Lite
# Builds React frontend and installs Python backend dependencies

set -e

echo "=== Step 1: Build React frontend ==="
cd frontend
npm install
npm run build
echo "Frontend build complete."

echo "=== Step 2: Copy frontend build to backend/static ==="
cd ..
rm -rf backend/static
cp -r frontend/dist backend/static
echo "Static files copied to backend/static/"

echo "=== Step 3: Install Python dependencies ==="
cd backend
pip install -r requirements.txt
echo "Python dependencies installed."

echo "=== Build complete! ==="
