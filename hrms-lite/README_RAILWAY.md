# 🚂 Deploy HRMS Lite on Railway

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template/YOUR_TEMPLATE_ID)

## Quick Start (5 Minutes)

### Option 1: One-Click Deploy (Recommended)

Click the button above and follow the prompts.

### Option 2: CLI Deploy

```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Deploy with script
./deploy-railway.sh
```

### Option 3: Manual Deploy

```bash
# Backend
cd backend
railway init
railway up

# Frontend
cd ../frontend
railway init
railway up
```

---

## 📁 Files Created

| File | Description |
|------|-------------|
| `railway.json` | Railway configuration |
| `backend/Dockerfile.railway` | Backend Docker image |
| `frontend/Dockerfile.railway` | Frontend Docker image |
| `frontend/nginx.conf` | Nginx configuration |
| `deploy-railway.sh` | Automated deploy script |
| `RAILWAY_DEPLOYMENT.md` | Full deployment guide |

---

## 🌐 Your URLs After Deploy

```
Frontend: https://hrms-frontend.up.railway.app
Backend:  https://hrms-backend.up.railway.app
API Docs: https://hrms-backend.up.railway.app/docs
Health:   https://hrms-backend.up.railway.app/health
```

---

## ⚙️ Environment Variables

### Backend
```
APP_NAME=HRMS Lite API
DB_PATH=/data/hrms.db
CORS_ORIGINS=["https://your-frontend.up.railway.app"]
```

### Frontend
```
VITE_API_URL=https://your-backend.up.railway.app/api
```

---

## 💾 Database

### SQLite (Default)
- ✅ Persistent storage at `/data`
- ✅ Automatic backups
- ⚠️ Single instance only

### PostgreSQL (Recommended for Production)
```bash
railway add --database postgres
```
Railway auto-connects the database!

---

## 🔄 Auto Deploy

Railway auto-deploys when you push to GitHub:

```bash
git add .
git commit -m "Update feature"
git push origin main
# Auto deploys! 🚀
```

---

## 📊 Monitoring

- **Logs**: `railway logs -f`
- **Metrics**: Railway Dashboard → Metrics
- **Health**: `/health` endpoint

---

## 💰 Pricing

| Tier | Cost | Includes |
|------|------|----------|
| Free | $5 credit/month | 512MB RAM, 1GB disk |
| Starter | $5/month | 1GB RAM, 10GB disk |
| Pro | $50/month | 4GB RAM, 100GB disk |

---

## 🆘 Support

- **Railway Docs**: [docs.railway.app](https://docs.railway.app)
- **Community**: [discord.gg/railway](https://discord.gg/railway)
- **Issues**: Check `RAILWAY_DEPLOYMENT.md` for troubleshooting

---

## ✅ Why Railway?

- Persistent SQLite storage (unlike Vercel)
- Native Docker support
- Easy environment variables
- Automatic HTTPS
- Free custom domains
- Generous free tier

**Ready?**
```bash
railway login && railway init && railway up
```
