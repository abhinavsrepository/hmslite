# Deploy HRMS Lite to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/hrms-lite)

## One-Click Deploy

Click the button above or follow manual steps below.

---

## Manual Deploy

### Step 1: Clone & Push to GitHub
```bash
git clone https://github.com/yourusername/hrms-lite.git
cd hrms-lite
git push origin main
```

### Step 2: Deploy to Vercel
```bash
npx vercel --prod
```

### Step 3: Done! 🎉
Your app is live at `https://your-project.vercel.app`

---

## Project Structure

```
hrms-lite/
├── api/index.py      # Backend entry (Vercel)
├── backend/          # FastAPI app
├── frontend/         # React app
└── vercel.json       # Config
```

---

## Environment Variables

Set in Vercel Dashboard:

```
APP_NAME=HRMS Lite
CORS_ORIGINS=["*"]
```

---

## Features

- ✅ React + FastAPI + SQLite
- ✅ Single Vercel deployment
- ✅ Auto-deploy on git push
- ✅ Free SSL/HTTPS
- ✅ Global CDN

---

## Local Development

```bash
# Backend
cd backend
python run.py --dev

# Frontend (new terminal)
cd frontend
npm run dev
```

---

## Support

Issues? Check `DEPLOY_VERCEL.md` for detailed guide.
