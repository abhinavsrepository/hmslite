#!/bin/bash

# Vercel Deployment Script for HRMS Lite
# This script helps you deploy the project to Vercel

echo "======================================"
echo "  HRMS Lite - Vercel Deployment"
echo "======================================"
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Check if we're in the correct directory
if [ ! -f "package.json" ]; then
    echo "Error: Please run this script from the project root directory"
    exit 1
fi

echo "Step 1: Testing frontend build..."
cd frontend
npm install
if [ $? -ne 0 ]; then
    echo "Frontend build failed!"
    exit 1
fi
cd ..

echo ""
echo "Step 2: Testing backend..."
cd backend
pip install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "Backend dependencies failed to install!"
    exit 1
fi
python test_mongodb.py
if [ $? -ne 0 ]; then
    echo "Backend test failed!"
    exit 1
fi
cd ..

echo ""
echo "Step 3: Deploying to Vercel..."
vercel --prod

echo ""
echo "======================================"
echo "  Deployment Complete!"
echo "======================================"
echo ""
echo "Make sure to:"
echo "1. Update CORS_ORIGINS in backend/app/core/config.py"
echo "2. Set environment variables in Vercel dashboard"
echo "3. Add your frontend URL to MongoDB Atlas IP whitelist"
echo ""
