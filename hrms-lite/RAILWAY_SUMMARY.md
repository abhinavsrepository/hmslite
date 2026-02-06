# 🚂 Railway Deployment Summary

## ✅ What's Ready

All files created for Railway deployment:

### Configuration Files
```
railway.json                 # Railway deployment config
backend/Dockerfile.railway   # Backend Docker image
frontend/Dockerfile.railway  # Frontend Docker image
frontend/nginx.conf          # Nginx reverse proxy config
deploy-railway.sh           # Automated deployment script
```

### CI/CD
```
.github/workflows/deploy-railway.yml  # GitHub Actions auto-deploy
```

### Documentation
```
RAILWAY_DEPLOYMENT.md       # Complete deployment guide
README_RAILWAY.md           # Quick start README
deploy-railway.sh          # One-command deploy script
```

---

## 🚀 Deploy Now (3 Options)

### Option 1: One-Command Deploy (Easiest)

```bash
# From project root
./deploy-railway.sh
```

This will:
- Deploy backend
- Get backend URL
- Deploy frontend with correct API URL
- Show you all URLs

### Option 2: Railway CLI

```bash
# Install CLI
npm install -g @railway/cli

# Login
railway login

# Deploy backend
cd backend
railway init
railway up

# Get backend URL (copy this)
railway domain

# Deploy frontend
cd ../frontend
railway init
railway variables set VITE_API_URL="https://your-backend.up.railway.app/api"
railway up
```

### Option 3: GitHub + Railway Dashboard

1. Push code to GitHub
2. Go to [railway.app/new](https://railway.app/new)
3. Select "Deploy from GitHub repo"
4. Choose your repo
5. Deploy backend service (set root to `backend`)
6. Deploy frontend service (set root to `frontend`)

---

## 🔧 Environment Variables

### Backend (Set in Railway Dashboard)

```
APP_NAME=HRMS Lite API
DB_PATH=/data/hrms.db
CORS_ORIGINS=["https://your-frontend.up.railway.app"]
DEBUG=false
RELOAD=false
LOG_LEVEL=INFO
```

### Frontend

```
VITE_API_URL=https://your-backend.up.railway.app/api
```

---

## 💾 Database Options

### 1. SQLite (Default - Persistent!)
```
DB_PATH=/data/hrms.db
```
✅ Data persists across deployments
✅ Automatic backups

### 2. PostgreSQL (Production)
```bash
railway add --database postgres
```
Railway auto-sets `DATABASE_URL` environment variable.

---

## 🌐 Your URLs

After deployment:

```
Frontend: https://hrms-frontend.up.railway.app
Backend:  https://hrms-backend.up.railway.app
API Docs: https://hrms-backend.up.railway.app/docs
```

---

## 🔄 Auto Deploy

Railway automatically deploys when you push to GitHub:

```bash
git add .
git commit -m "New feature"
git push origin main
# 🚀 Auto deploys!
```

---

## 📊 Commands

```bash
# View logs
railway logs -f

# View variables
railway variables

# Set variable
railway variables set KEY=value

# Open app in browser
railway open

# Status
railway status
```

---

## 💰 Pricing

| Resource | Free Tier |
|----------|-----------|
| RAM | 512 MB |
| Disk | 1 GB |
| Bandwidth | 100 GB/month |
| Databases | 1 PostgreSQL |
| Cost | $5 credit/month |

---

## 🆘 Troubleshooting

### Need Help?

1. Check logs: `railway logs -f`
2. Check `RAILWAY_DEPLOYMENT.md` for detailed troubleshooting
3. Railway Discord: [discord.gg/railway](https://discord.gg/railway)

---

## ✨ Why Railway vs Vercel?

| Feature | Railway | Vercel |
|---------|---------|--------|
| SQLite Persistence | ✅ Yes | ❌ No (resets) |
| Docker Support | ✅ Native | ⚠️ Limited |
| PostgreSQL | ✅ Built-in | ❌ External |
| Custom Domains | ✅ Free | ✅ Free |
| Easy Env Vars | ✅ GUI + CLI | ✅ GUI + CLI |

**Choose Railway for:** Full-stack apps with databases

---

## 🎉 Ready to Deploy!

```bash
./deploy-railway.sh
```

Or:

```bash
railway login && railway init && railway up
```
