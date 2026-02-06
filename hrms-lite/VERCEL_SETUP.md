# Vercel Deployment Setup

## 🚀 Quick Deploy

### 1. Environment Variables (Required)

In Vercel Dashboard → Project Settings → Environment Variables:

| Variable | Development Value | Production Value |
|----------|------------------|------------------|
| `VITE_API_URL` | `http://localhost:8000` | (empty) or `https://your-domain.vercel.app` |

**For unified deployment (frontend + backend on same domain):**
- Set `VITE_API_URL` to empty string or leave unset

**For separate deployment:**
- Set `VITE_API_URL` to your backend URL

### 2. Local Development

```bash
# Terminal 1: Start Backend
cd backend
pip install -r requirements.txt
python run.py

# Terminal 2: Start Frontend
cd frontend
npm install
npm run dev
```

### 3. Vercel CLI Deployment (Optional)

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

## 📁 Environment Files

| File | Purpose |
|------|---------|
| `.env.development` | Local development settings |
| `.env.production` | Production build defaults |
| `.env.example` | Template for documentation |

## 🔧 Configuration Files

### `vercel.json`
- Defines build settings
- Routes API calls to Python handler
- Routes frontend to static files

### `frontend/src/config.js`
- Reads environment variables
- Handles API URL logic
- Supports both unified and separate deployment

### `api/index.py`
- Vercel serverless entry point
- Imports FastAPI app from backend

## 🌐 API Endpoints

After deployment:

```
https://your-app.vercel.app/          → Frontend
https://your-app.vercel.app/api/*     → Backend API
https://your-app.vercel.app/docs      → API Documentation
https://your-app.vercel.app/health    → Health Check
```

## ⚠️ Important Notes

1. **SQLite on Vercel**: Data is ephemeral (resets on deploy)
   - For production, use Turso, Supabase, or Neon PostgreSQL

2. **Environment Variables in Vercel**:
   - Must be set in Dashboard (not just in .env files)
   - Changes require redeployment

3. **CORS**: Already configured to allow all origins (`["*"]`)

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| 404 on API calls | Check `VITE_API_URL` is set correctly |
| CORS errors | Verify backend is running and CORS is enabled |
| Database not found | Check `DB_PATH` environment variable |
| Build fails | Check `dist` folder exists in `vercel.json` |

## 📚 Useful Commands

```bash
# Test locally (production build)
cd frontend
npm run build
npx serve dist

# Check Vercel logs
vercel logs --tail

# Redeploy
vercel --force
```
