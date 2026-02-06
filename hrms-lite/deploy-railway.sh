#!/bin/bash

# Railway Deployment Script for HRMS Lite

echo "🚂 Railway Deployment Script"
echo "=============================="

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

# Check login status
echo "🔐 Checking Railway login..."
railway whoami || railway login

echo ""
echo "📦 Deploying Backend..."
echo "------------------------"
cd backend

# Link to backend service (creates if doesn't exist)
railway link || railway init

# Set environment variables
echo "Setting environment variables..."
railway variables set APP_NAME="HRMS Lite API"
railway variables set DB_PATH="/data/hrms.db"
railway variables set CORS_ORIGINS='["*"]'
railway variables set DEBUG="false"
railway variables set RELOAD="false"

# Deploy
echo "Deploying backend..."
railway up

# Get backend URL
BACKEND_URL=$(railway domain)
echo "✅ Backend deployed to: $BACKEND_URL"

cd ..

echo ""
echo "🎨 Deploying Frontend..."
echo "------------------------"
cd frontend

# Link to frontend service
railway link || railway init

# Set environment variables
echo "Setting environment variables..."
railway variables set VITE_API_URL="$BACKEND_URL/api"

# Deploy
echo "Deploying frontend..."
railway up

# Get frontend URL
FRONTEND_URL=$(railway domain)
echo "✅ Frontend deployed to: $FRONTEND_URL"

cd ..

echo ""
echo "🎉 Deployment Complete!"
echo "======================="
echo "Frontend: $FRONTEND_URL"
echo "Backend:  $BACKEND_URL"
echo "API Docs: $BACKEND_URL/docs"
echo ""
echo "💡 Next steps:"
echo "1. Update CORS_ORIGINS in backend with your frontend URL"
echo "2. Add a custom domain (optional)"
echo "3. Set up a database (PostgreSQL) for production"
