@echo off
REM Vercel Deployment Script for HRMS Lite (Windows)
REM This script helps you deploy the project to Vercel

echo ======================================
echo   HRMS Lite - Vercel Deployment
echo ======================================
echo.

REM Check if Vercel CLI is installed
where vercel >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Vercel CLI not found. Installing...
    npm install -g vercel
)

REM Check if we're in the correct directory
if not exist "package.json" (
    echo Error: Please run this script from the project root directory
    exit /b 1
)

echo Step 1: Testing frontend build...
cd frontend
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo Frontend build failed!
    exit /b 1
)
cd ..

echo.
echo Step 2: Testing backend...
cd backend
pip install -r requirements.txt
if %ERRORLEVEL% NEQ 0 (
    echo Backend dependencies failed to install!
    exit /b 1
)
python test_mongodb.py
if %ERRORLEVEL% NEQ 0 (
    echo Backend test failed!
    exit /b 1
)
cd ..

echo.
echo Step 3: Deploying to Vercel...
vercel --prod

echo.
echo ======================================
echo   Deployment Complete!
echo ======================================
echo.
echo Make sure to:
echo 1. Update CORS_ORIGINS in backend/app/core/config.py
echo 2. Set environment variables in Vercel dashboard
echo 3. Add your frontend URL to MongoDB Atlas IP whitelist
echo.

pause
