# Deploy HRMS Lite on Vercel (Frontend + Backend)

## Overview
- **Frontend**: React app hosted on Vercel
- **Backend**: FastAPI hosted on Vercel Serverless Functions
- **Database**: SQLite (stored in `/tmp` for serverless) or use Vercel Postgres

---

## Step 1: Prepare Your Code

### 1.1 Update Backend for Vercel

Create `vercel.json` in backend folder:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/index.py",
      "use": "@vercel/python"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "api/index.py"
    }
  ]
}
```

### 1.2 Create Serverless Entry Point

Create `backend/api/index.py`:

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.main import app as fastapi_app

# Vercel serverless handler
app = fastapi_app

# Update CORS for Vercel
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Will be restricted by Vercel
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# For local testing
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

### 1.3 Update Database Path for Serverless

Edit `backend/app/core/config.py`:

```python
import os
DB_PATH = os.getenv("DB_PATH", "/tmp/hrms.db")  # /tmp is writable in serverless
```

### 1.4 Create requirements for Vercel

Create `backend/requirements-vercel.txt`:

```
fastapi>=0.100.0
pydantic>=2.0.0
pydantic-settings>=2.0.0
pydantic[email]>=2.0.0
email-validator>=2.0.0
```

---

## Step 2: Deploy Backend

### Option A: Vercel CLI (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy backend
cd backend
vercel --prod
```

### Option B: GitHub Integration

1. Push backend code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "Add New Project"
4. Import your GitHub repo
5. Set root directory to `backend`
6. Framework Preset: `Other`
7. Build Command: `pip install -r requirements-vercel.txt`
8. Click Deploy

**Get your backend URL:**
- Example: `https://hrms-api.vercel.app`

---

## Step 3: Deploy Frontend

### 3.1 Update Frontend API URL

Create `frontend/.env.production`:

```env
VITE_API_URL=https://hrms-api.vercel.app
```

### 3.2 Create vercel.json for Frontend

Create `frontend/vercel.json`:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "handle": "filesystem"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

### 3.3 Deploy Frontend

```bash
cd frontend

# Using Vercel CLI
vercel --prod

# Or use GitHub integration (same as backend)
```

---

## Step 4: Connect Frontend to Backend

### 4.1 Update Backend CORS

Edit `backend/app/core/config.py`:

```python
CORS_ORIGINS = [
    "https://hrms-app.vercel.app",  # Your frontend URL
    "https://hrms-app-git-main-yourname.vercel.app",  # Preview deployments
    "http://localhost:5173"  # Local development
]
```

### 4.2 Redeploy Backend

```bash
cd backend
vercel --prod
```

---

## Alternative: Deploy Everything in One Repo

### Project Structure

```
hrms-lite/
├── frontend/          # React app
├── backend/           # FastAPI app
├── api/              # Vercel serverless functions
│   └── index.py      # Main API entry
├── vercel.json       # Root config
└── package.json      # Build scripts
```

### Root vercel.json

```json
{
  "version": 2,
  "builds": [
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "frontend/dist"
      }
    },
    {
      "src": "api/index.py",
      "use": "@vercel/python"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "api/index.py"
    },
    {
      "src": "/docs",
      "dest": "api/index.py"
    },
    {
      "src": "/openapi.json",
      "dest": "api/index.py"
    },
    {
      "handle": "filesystem"
    },
    {
      "src": "/(.*)",
      "dest": "frontend/dist/index.html"
    }
  ]
}
```

### Root package.json

```json
{
  "name": "hrms-lite",
  "version": "1.0.0",
  "scripts": {
    "build": "cd frontend && npm install && npm run build",
    "dev": "cd frontend && npm run dev"
  }
}
```

### Unified API Entry (api/index.py)

```python
import sys
sys.path.insert(0, 'backend')

from app.main import app
from fastapi.middleware.cors import CORSMiddleware

# Add CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Vercel handler
handler = app
```

### Deploy Both Together

```bash
# From project root
vercel --prod
```

---

## Environment Variables (Vercel Dashboard)

### Backend Variables

Go to Project Settings → Environment Variables:

```
APP_NAME=HRMS Lite API
DB_PATH=/tmp/hrms.db
CORS_ORIGINS=["https://your-frontend.vercel.app"]
LOG_LEVEL=INFO
```

### Frontend Variables

```
VITE_API_URL=/api  # If using unified deployment
# OR
VITE_API_URL=https://your-backend.vercel.app  # If separate
```

---

## Important: Database Considerations

### ⚠️ SQLite Limitation on Vercel

Vercel is serverless - SQLite data will be lost on each deployment!

### Solutions:

#### Option 1: Vercel Postgres (Recommended)

1. Install Vercel Postgres:
```bash
vercel integrations add vercel-postgres
```

2. Update `backend/app/db/database.py`:

```python
import os
import psycopg2
from psycopg2.extras import RealDictCursor

POSTGRES_URL = os.getenv("POSTGRES_URL")

if POSTGRES_URL:
    # Use PostgreSQL on Vercel
    def get_db_connection():
        conn = psycopg2.connect(POSTGRES_URL)
        return conn
else:
    # Use SQLite locally
    from .sqlite_db import get_db_connection
```

#### Option 2: Supabase (Free Postgres)

1. Create project at [supabase.com](https://supabase.com)
2. Get connection string
3. Add to Vercel env vars: `POSTGRES_URL=postgresql://...`

#### Option 3: Keep SQLite (Data resets)

For demo purposes only - data resets on each deployment.

---

## Quick Deploy Script

Create `deploy.sh`:

```bash
#!/bin/bash

echo "🚀 Deploying HRMS Lite to Vercel..."

# Deploy backend
echo "📦 Deploying backend..."
cd backend
vercel --prod
BACKEND_URL=$(vercel --scope your-team inspect --latest | grep "Production" | awk '{print $2}')
cd ..

echo "🔗 Backend URL: $BACKEND_URL"

# Update frontend env
echo "VITE_API_URL=$BACKEND_URL" > frontend/.env.production

# Deploy frontend
echo "📦 Deploying frontend..."
cd frontend
vercel --prod

echo "✅ Deployment complete!"
```

---

## Troubleshooting

### 1. Build Fails

```bash
# Check Python version
vercel --version

# Use Python 3.9+
# Add to vercel.json:
{
  "builds": [{
    "src": "api/index.py",
    "use": "@vercel/python@3.9"
  }]
}
```

### 2. API Not Responding

Check Vercel Logs:
- Go to Project → Functions → Logs

### 3. CORS Errors

Update `CORS_ORIGINS` with exact Vercel domain (including `https://`)

### 4. Database Not Persisting

Use Vercel Postgres or Supabase (see above)

---

## Free Tier Limits

| Feature | Limit |
|---------|-------|
| Bandwidth | 100GB/month |
| Build Time | 6000 minutes/month |
| Serverless Functions | 100GB-hours |
| PostgreSQL | 60 days trial |

---

## Your Deployed URLs

After deployment, you'll have:

```
Frontend: https://hrms-lite.vercel.app
Backend:  https://hrms-lite.vercel.app/api
Docs:     https://hrms-lite.vercel.app/docs
```

Or if deployed separately:

```
Frontend: https://hrms-app.vercel.app
Backend:  https://hrms-api.vercel.app
```
