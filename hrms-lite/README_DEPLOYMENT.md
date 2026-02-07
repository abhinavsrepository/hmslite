# 🚀 Vercel Deployment Strategy - HRMS Lite

Complete deployment strategy for deploying HRMS Lite to Vercel with MongoDB Atlas integration.

---

## 📚 Documentation Index

### 🎯 Main Guides

1. **DEPLOYMENT_STRATEGY_SUMMARY.md**
   - Overview of entire deployment strategy
   - Project structure for deployment
   - Quick reference and checklists

2. **VERCEL_DEPLOYMENT_COMPLETE.md**
   - 450+ lines comprehensive guide
   - Detailed step-by-step deployment
   - Troubleshooting and best practices

3. **VERCEL_QUICK_START.md**
   - Deploy in 5 minutes
   - Simple step-by-step process
   - Common commands and troubleshooting

4. **VERCEL_ENV_VARIABLES.md**
   - Complete environment variable reference
   - Security best practices
   - Troubleshooting tips

5. **MONGODB_SETUP_COMPLETE.md**
   - MongoDB integration status
   - Testing results
   - Configuration details

---

## 🚀 Quick Start

### Before Deploying

```bash
# Install all dependencies
npm run install:all

# Test MongoDB connection
cd backend && python test_mongodb.py

# Build frontend
cd frontend && npm run build
```

### Deploy to Vercel

```bash
# Windows
deploy-vercel.bat

# Linux/Mac
bash deploy-vercel.sh

# Or using Vercel CLI
vercel login
vercel --prod
```

### Set Environment Variables

Go to Vercel Dashboard → Settings → Environment Variables

**Backend Variables:**
```bash
DB_TYPE=mongodb
MONGODB_URI=mongodb+srv://abhi2510979b_db_user:ZWDcqnkXuD5PUGPA@cluster0.negeuoc.mongodb.net/?appName=Cluster0
MONGODB_DB_NAME=hrms
CORS_ORIGINS="https://your-app.vercel.app"
LOG_LEVEL=INFO
PYTHONUNBUFFERED=1
```

**Frontend Variables:**
```bash
VITE_API_URL=""
VITE_APP_NAME=HRMS Lite
VITE_APP_VERSION=1.0.0
```

---

## 📊 Deployment Architecture

```
Unified Deployment (Recommended)
├── Frontend: https://your-app.vercel.app
├── API: https://your-app.vercel.app/api
├── Docs: https://your-app.vercel.app/docs
└── MongoDB: Atlas (already configured)

Separate Deployment (Alternative)
├── Frontend: https://your-app.vercel.app
├── Backend: https://your-api.vercel.app
└── MongoDB: Atlas (same config)
```

---

## ✅ What's Already Configured

### Configuration Files

- ✅ `package.json` - Root build scripts
- ✅ `vercel.json` - Vercel configuration
- ✅ `api/index.py` - Serverless function entry point
- ✅ `.env.production` - Frontend production config
- ✅ `backend/.env` - MongoDB configuration

### MongoDB Integration

- ✅ MongoDB driver installed
- ✅ Database layer updated for MongoDB
- ✅ Connection tested and working
- ✅ Test script available

### Frontend Setup

- ✅ React 19.2.0 configured
- ✅ Vite configured
- ✅ API URL configuration ready
- ✅ Build scripts working

### Backend Setup

- ✅ FastAPI configured
- ✅ Unified API entry point
- ✅ CORS configuration ready
- ✅ Health check endpoint

---

## 🎯 Deployment Steps

### Step 1: Update CORS Configuration

Edit `backend/app/core/config.py`:

```python
CORS_ORIGINS: list[str] = Field(
    default=[
        "http://localhost:5173",  # Local development
    ],
    description="Allowed CORS origins"
)
```

### Step 2: Test Locally

```bash
# Test frontend build
cd frontend && npm run build

# Test MongoDB connection
cd backend && python test_mongodb.py

# Test backend
cd backend && python run.py --dev
```

### Step 3: Deploy to Vercel

```bash
# Windows
deploy-vercel.bat

# Linux/Mac
bash deploy-vercel.sh

# Or Vercel CLI
vercel login
vercel --prod
```

### Step 4: Configure MongoDB Atlas

1. Go to MongoDB Atlas → Network Access
2. Add IP: `34.25.247.0/24` (Vercel range)
3. Or use "Access from Anywhere" for development

### Step 5: Update CORS with Vercel URL

After deployment, get your Vercel URL and update:

Edit `backend/app/core/config.py`:

```python
CORS_ORIGINS: list[str] = Field(
    default=[
        "https://your-app.vercel.app",  # Add your URL
        "http://localhost:5173"
    ],
    description="Allowed CORS origins"
)
```

### Step 6: Test Deployment

- Visit `https://your-app.vercel.app` (Frontend)
- Visit `https://your-app.vercel.app/docs` (API Docs)
- Check Vercel logs for errors

---

## 📝 Environment Variables

### Backend

```bash
DB_TYPE=mongodb
MONGODB_URI=mongodb+srv://abhi2510979b_db_user:ZWDcqnkXuD5PUGPA@cluster0.negeuoc.mongodb.net/?appName=Cluster0
MONGODB_DB_NAME=hrms
CORS_ORIGINS="https://your-app.vercel.app"
LOG_LEVEL=INFO
PYTHONUNBUFFERED=1
```

### Frontend

```bash
VITE_API_URL=""  # Empty for unified deployment
VITE_APP_NAME=HRMS Lite
VITE_APP_VERSION=1.0.0
```

---

## 🔧 Troubleshooting

### Frontend White Screen?

- Check browser console (F12)
- Verify `vercel.json` is configured
- Check Vercel build logs

### API 404 Errors?

- Check `api/index.py` exists
- Verify `vercel.json` routes
- Look at Vercel logs

### CORS Errors?

- Update `CORS_ORIGINS` in `backend/app/core/config.py`
- Clear browser cache
- Redeploy backend

### MongoDB Connection Failed?

- Verify `MONGODB_URI` in Vercel env vars
- Check MongoDB Atlas IP whitelist
- Restart deployment

---

## 📊 Monitoring

### Vercel Dashboard

- **Logs:** Project → Functions → Logs
- **Analytics:** Project → Analytics
- **Deployments:** Project → Deployments
- **Settings:** Project → Settings

### MongoDB Atlas

- Go to [mongodb.com/atlas](https://www.mongodb.com/atlas)
- Monitor database performance
- Check storage usage
- Review connection pool

---

## 🔄 Automatic Deployments

Vercel automatically deploys when you push to GitHub:

```bash
git add .
git commit -m "Your changes"
git push
```

**Preview deployments** = Every push to any branch
**Production deployments** = Merge to `main`

---

## 📚 Additional Resources

- **[VERCEL_DEPLOYMENT_COMPLETE.md](./VERCEL_DEPLOYMENT_COMPLETE.md)** - Comprehensive guide
- **[VERCEL_QUICK_START.md](./VERCEL_QUICK_START.md)** - Quick start guide
- **[VERCEL_ENV_VARIABLES.md](./VERCEL_ENV_VARIABLES.md)** - Environment variables
- **[MONGODB_SETUP_COMPLETE.md](./MONGODB_SETUP_COMPLETE.md)** - MongoDB guide

---

## 🎓 Best Practices

### Development

- Use preview deployments for testing
- Keep CORS_ORIGINS set for local dev
- Test before pushing
- Use debug logging when needed

### Production

- Use INFO logging for performance
- Monitor database usage
- Set up error alerts
- Keep dependencies updated

### Security

- Never commit secrets
- Use Vercel environment variables
- Rotate credentials regularly
- Monitor logs for security issues

---

## 📱 URLs After Deployment

| Service | URL | Access |
|---------|-----|--------|
| **Frontend** | `https://your-app.vercel.app` | Main application |
| **API Docs** | `https://your-app.vercel.app/docs` | Swagger UI |
| **ReDoc** | `https://your-app.vercel.app/redoc` | Alternative docs |
| **Health** | `https://your-app.vercel.app/health` | Health check |

---

## ✅ Pre-Deployment Checklist

### Before Deploying

- [ ] Frontend builds successfully: `npm run build`
- [ ] Backend tests pass: `python test_mongodb.py`
- [ ] MongoDB connection verified locally
- [ ] CORS configured for development
- [ ] All files committed to GitHub
- [ ] Root `package.json` exists
- [ ] `vercel.json` configured correctly
- [ ] `.env.production` set up

### Before Production

- [ ] Update CORS_ORIGINS with actual Vercel URL
- [ ] Set all environment variables in Vercel
- [ ] Add MongoDB IP whitelist
- [ ] Test all API endpoints
- [ ] Test frontend thoroughly
- [ ] Check Vercel logs for errors
- [ ] Monitor MongoDB Atlas connection
- [ ] Set up monitoring alerts

---

## 🎉 Ready to Deploy!

Your HRMS Lite is ready for Vercel deployment!

**Your deployment checklist:**
1. ✅ Configuration files ready
2. ✅ MongoDB configured
3. ✅ Scripts created
4. ✅ Documentation complete

**Next steps:**
1. Read `VERCEL_QUICK_START.md`
2. Follow deployment steps
3. Set environment variables
4. Test deployment
5. Monitor and maintain

**Happy Deploying!** 🚀

**Need help?** Check the comprehensive guides in this folder.
