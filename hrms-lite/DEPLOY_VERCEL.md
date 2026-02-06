# 🚀 Quick Deploy to Vercel

## Prerequisites
- [Vercel Account](https://vercel.com/signup)
- [Node.js](https://nodejs.org) installed
- Code pushed to GitHub

---

## Step 1: Deploy (One Command)

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy everything
vercel --prod
```

---

## Step 2: Set Environment Variables

Go to [vercel.com/dashboard](https://vercel.com/dashboard) → Your Project → Settings → Environment Variables

Add these:

```
APP_NAME=HRMS Lite
CORS_ORIGINS=["*"]
DB_PATH=/tmp/hrms.db
```

---

## Step 3: Redeploy

```bash
vercel --prod
```

---

## 🌐 Your URLs After Deploy

| Service | URL |
|---------|-----|
| App | `https://your-project.vercel.app` |
| API | `https://your-project.vercel.app/api` |
| Docs | `https://your-project.vercel.app/docs` |

---

## 📁 Project Structure for Vercel

```
hrms-lite/
├── api/                  # Vercel serverless functions
│   └── index.py         # API entry point
├── backend/             # FastAPI app
│   └── app/
├── frontend/            # React app
│   └── dist/           # Build output
├── vercel.json         # Vercel config
└── package.json        # Build scripts
```

---

## ⚠️ Important: Database

**SQLite on Vercel = Data resets on each deploy**

For production data persistence, use one of:

### Option 1: Vercel Postgres (Recommended)
```bash
vercel integrations add vercel-postgres
```

### Option 2: Supabase (Free)
1. Create project at [supabase.com](https://supabase.com)
2. Add connection string to env vars

### Option 3: Keep SQLite (Demo only)
- Data resets on each deployment
- Good for testing/demo

---

## 🔧 Custom Domain

1. Go to Project Settings → Domains
2. Add your domain
3. Update DNS records as instructed

---

## 🔄 Auto Deploy

Vercel auto-deploys on every git push:
```bash
git add .
git commit -m "Update feature"
git push origin main  # Auto deploys!
```

---

## ❌ Remove Deployment

```bash
vercel remove your-project-name
```

Or delete from Vercel Dashboard.
