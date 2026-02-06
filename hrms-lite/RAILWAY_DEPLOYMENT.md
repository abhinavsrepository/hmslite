# Deploy HRMS Lite on Railway

Railway is the easiest platform for deploying full-stack apps with persistent databases.

## Why Railway?
- ✅ Native Docker support
- ✅ Persistent SQLite/PostgreSQL
- ✅ Automatic HTTPS
- ✅ Environment variables GUI
- ✅ Easy rollbacks
- ✅ Free tier: $5/month credit

---

## Quick Deploy (5 Minutes)

### Step 1: Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Verify email

### Step 2: Deploy Backend

#### Option A: One-Click Deploy (Template)

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/hrms-lite)

#### Option B: Manual Deploy

1. **New Project** → **Deploy from GitHub repo**
2. Select your `hrms-lite` repository
3. Set Root Directory: `backend`
4. Add environment variables (see below)
5. Click **Deploy**

### Step 3: Deploy Frontend

1. **New Project** → **Deploy from GitHub repo**
2. Select same repository
3. Set Root Directory: `frontend`
4. Add environment variable:
   ```
   VITE_API_URL=https://your-backend.railway.app/api
   ```
5. Click **Deploy**

---

## Detailed Setup

### 1. Project Structure for Railway

Create `railway.json` in project root:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "Dockerfile.backend"
  },
  "deploy": {
    "startCommand": "python run.py",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### 2. Backend Dockerfile

Create `backend/Dockerfile.railway`:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy app
COPY . .

# Create data directory for persistent SQLite
RUN mkdir -p /data

# Environment
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV DB_PATH=/data/hrms.db
ENV PORT=8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" || exit 1

EXPOSE 8000

# Start command
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### 3. Frontend Dockerfile

Create `frontend/Dockerfile.railway`:

```dockerfile
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### 4. Nginx Config

Create `frontend/nginx.conf`:

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API proxy (if using single domain)
    location /api {
        proxy_pass ${BACKEND_URL};
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # React Router support
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

### 5. Environment Variables

#### Backend Variables (Railway Dashboard)

```
APP_NAME=HRMS Lite API
APP_VERSION=1.0.0
HOST=0.0.0.0
PORT=8000
DEBUG=false
RELOAD=false

# Database - Railway provides persistent storage at /data
DB_PATH=/data/hrms.db

# CORS - Add your frontend URL after deploying
CORS_ORIGINS=["https://your-frontend.railway.app","https://your-custom-domain.com"]
CORS_ALLOW_CREDENTIALS=true
CORS_ALLOW_METHODS=["GET","POST","PUT","DELETE"]
CORS_ALLOW_HEADERS=["*"]

# Logging
LOG_LEVEL=INFO
```

#### Frontend Variables

```
VITE_API_URL=https://your-backend.railway.app/api
```

---

## Database Options on Railway

### Option 1: SQLite (Persistent Volume)

Railway provides persistent storage at `/data`:

```python
# backend/app/core/config.py
DB_PATH = os.getenv("DB_PATH", "/data/hrms.db")
```

No additional setup needed!

### Option 2: Railway PostgreSQL (Recommended for Production)

1. Click **New** → **Database** → **Add PostgreSQL**
2. Railway creates the database
3. Get connection string from **Variables** tab
4. Update backend to use PostgreSQL:

```python
# backend/app/db/database.py
import os
import psycopg2
from psycopg2.extras import RealDictCursor

DATABASE_URL = os.getenv("DATABASE_URL")  # Railway provides this

if DATABASE_URL:
    def get_db_connection():
        conn = psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)
        return conn
else:
    # Fallback to SQLite
    from .sqlite_db import get_db_connection
```

### Option 3: Railway MySQL

Similar to PostgreSQL, just select MySQL when adding database.

---

## Deploy with Railway CLI

### Install CLI

```bash
npm install -g @railway/cli
```

### Login

```bash
railway login
```

### Initialize Project

```bash
cd hrms-lite

# Initialize Railway project
railway init

# Select "Empty Project"
```

### Deploy Backend

```bash
cd backend

# Link to project
railway link

# Add environment variables
railway variables set APP_NAME="HRMS Lite API"
railway variables set DB_PATH="/data/hrms.db"
railway variables set CORS_ORIGINS='["*"]'

# Deploy
railway up

# Get URL
railway domain
```

### Deploy Frontend

```bash
cd ../frontend

# Link to new service
railway link

# Add env var
railway variables set VITE_API_URL="https://your-backend.railway.app/api"

# Deploy
railway up

# Get URL
railway domain
```

### Open in Browser

```bash
railway open
```

---

## Railway Configuration Files

### railway.yaml (Alternative to railway.json)

```yaml
services:
  backend:
    build:
      dockerfile: backend/Dockerfile.railway
    deploy:
      healthcheck:
        path: /health
        timeout: 10
      restart:
        policy: on-failure
        maxRetries: 10
    volumes:
      - /data
    env:
      - DB_PATH=/data/hrms.db
      
  frontend:
    build:
      dockerfile: frontend/Dockerfile.railway
    deploy:
      healthcheck:
        path: /
        timeout: 10
```

---

## Connecting Services

### Internal Networking

Railway provides internal DNS for service communication:

```
# Frontend calls backend internally
VITE_API_URL=http://backend.railway.internal:8000/api
```

Or use public URL:
```
VITE_API_URL=https://hrms-api.up.railway.app/api
```

### Custom Domain

1. Go to Service Settings → Domains
2. Click **Generate Domain** (free .railway.app domain)
3. Or **Custom Domain** (add your domain)
4. Update DNS records as instructed

---

## Monitoring & Logs

### View Logs

```bash
# Live logs
railway logs --follow

# Specific service
railway logs -s backend
```

### Metrics Dashboard

Railway provides built-in metrics:
- CPU usage
- Memory usage
- Disk usage
- Network requests
- Response times

Access at: `railway.app/project/your-project/metrics`

---

## Backup Strategy

### Automated Backups (SQLite)

Create `backup.sh`:

```bash
#!/bin/bash
BACKUP_DIR=/data/backups
DB_PATH=/data/hrms.db
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup
mkdir -p $BACKUP_DIR
sqlite3 $DB_PATH ".backup $BACKUP_DIR/hrms_$DATE.db"
gzip $BACKUP_DIR/hrms_$DATE.db

# Keep last 7 backups
ls -t $BACKUP_DIR/hrms_*.db.gz | tail -n +8 | xargs -r rm
```

Add to crontab (if using persistent server):
```bash
0 2 * * * /data/backup.sh
```

### PostgreSQL Backups

Railway automatically backs up PostgreSQL daily.

Restore from dashboard: **Database** → **Backups** → **Restore**

---

## CI/CD with GitHub Actions

Create `.github/workflows/railway-deploy.yml`:

```yaml
name: Deploy to Railway

on:
  push:
    branches: [ main ]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Install Railway CLI
        run: npm install -g @railway/cli
      
      - name: Deploy Backend
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
        run: |
          cd backend
          railway up --service backend
          
  deploy-frontend:
    runs-on: ubuntu-latest
    needs: deploy-backend
    steps:
      - uses: actions/checkout@v3
      
      - name: Install Railway CLI
        run: npm install -g @railway/cli
      
      - name: Deploy Frontend
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
        run: |
          cd frontend
          railway up --service frontend
```

Add `RAILWAY_TOKEN` to GitHub Secrets:
1. Railway Dashboard → Account Settings → Tokens
2. Generate new token
3. Add to GitHub: Settings → Secrets → New repository secret

---

## Troubleshooting

### Build Fails

```bash
# Check build logs
railway logs --build

# Redeploy
cd backend
railway up
```

### Database Locked

SQLite on Railway can have locking issues with multiple workers.

Solution: Use PostgreSQL or limit workers to 1:

```dockerfile
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]
```

### CORS Errors

Update CORS_ORIGINS with exact Railway domain:
```
CORS_ORIGINS=["https://hrms-frontend.up.railway.app"]
```

### Out of Memory

Railway free tier: 512MB RAM

Optimize:
```dockerfile
# Use smaller base image
FROM python:3.11-alpine

# Or limit workers
CMD ["uvicorn", "app.main:app", "--workers", "1"]
```

---

## Pricing

| Resource | Free Tier | Paid ($5+ credit) |
|----------|-----------|-------------------|
| RAM | 512 MB | Up to 32 GB |
| CPU | Shared | Dedicated |
| Disk | 1 GB | Up to 100 GB |
| Bandwidth | 100 GB/month | Unlimited |
| Databases | 1 PostgreSQL | Unlimited |

---

## Migration from Other Platforms

### From Vercel

1. Export database: Download SQLite file or pg_dump
2. Upload to Railway volume: `railway up --data`
3. Update env vars
4. Deploy

### From Heroku

Railway has Heroku migration guide: [docs.railway.app/migrate/heroku](https://docs.railway.app/migrate/heroku)

---

## Quick Reference

```bash
# Login
railway login

# Link project
railway link

# View variables
railway variables

# Add variable
railway variables set KEY=value

# Deploy
railway up

# View logs
railway logs -f

# Open app
railway open

# Status
railway status
```

---

## Summary

1. ✅ Railway provides persistent storage (unlike Vercel)
2. ✅ Native Docker support
3. ✅ Easy environment variable management
4. ✅ Automatic HTTPS and custom domains
5. ✅ Generous free tier ($5 credit/month)
6. ✅ Built-in monitoring and logging

**Ready to deploy?**
```bash
railway login && railway init && railway up
```
