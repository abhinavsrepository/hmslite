# 🚀 Vercel Deployment Quick Start

**Deploy HRMS Lite to Vercel in 5 Minutes!**

---

## ✅ Prerequisites

- [ ] GitHub repository ready
- [ ] Vercel account
- [ ] MongoDB Atlas connection working locally

---

## 🎯 Step 1: Update CORS Configuration

Open `backend/app/core/config.py`:

```python
CORS_ORIGINS: list[str] = Field(
    default=[
        "http://localhost:5173",  # Local development
    ],
    description="Allowed CORS origins"
)
```

**Note:** Update this after deployment when you get your actual Vercel URL.

---

## 📦 Step 2: Install Dependencies

```bash
# Install all dependencies
npm run install:all

# Test backend
cd backend && python test_mongodb.py

# Test frontend
cd frontend && npm run build
```

---

## 🔗 Step 3: Deploy to Vercel

### Option A: Using Deployment Scripts (Recommended)

```bash
# Windows
deploy-vercel.bat

# Linux/Mac
bash deploy-vercel.sh
```

### Option B: Using Vercel CLI

```bash
# Login and deploy
vercel login
vercel --prod
```

### Option C: Using Vercel Dashboard

1. Push to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import repository
4. Configure settings
5. Deploy!

---

## ⚙️ Step 4: Set Environment Variables

Go to Vercel Dashboard → Settings → Environment Variables

### Backend Variables:

```bash
DB_TYPE=mongodb
MONGODB_URI=mongodb+srv://abhi2510979b_db_user:ZWDcqnkXuD5PUGPA@cluster0.negeuoc.mongodb.net/?appName=Cluster0
MONGODB_DB_NAME=hrms
CORS_ORIGINS="https://your-app.vercel.app"
LOG_LEVEL=INFO
PYTHONUNBUFFERED=1
```

### Frontend Variables:

```bash
VITE_API_URL=""  # Empty for unified deployment
VITE_APP_NAME=HRMS Lite
VITE_APP_VERSION=1.0.0
```

---

## 🌐 Step 5: Configure MongoDB Atlas

1. Go to MongoDB Atlas → Network Access
2. Add IP: `34.25.247.0/24` (Vercel range)
3. Or use "Access from Anywhere" for development

---

## 🔍 Step 6: Verify Deployment

### Check Frontend:
- Visit `https://your-app.vercel.app`
- Verify application loads

### Check API:
- Visit `https://your-app.vercel.app/docs`
- Test API endpoints

### Check Logs:
- Vercel Dashboard → Functions → Logs
- Monitor for errors

---

## 📝 Step 7: Update CORS Configuration

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

Commit and push:
```bash
git add backend/app/core/config.py
git commit -m "Update CORS for Vercel"
git push
```

---

## 🎉 You're Done!

**Your URLs:**
- **Frontend:** `https://your-app.vercel.app`
- **API Docs:** `https://your-app.vercel.app/docs`

---

## 📚 Need More Details?

- **Complete Guide:** [VERCEL_DEPLOYMENT_COMPLETE.md](./VERCEL_DEPLOYMENT_COMPLETE.md)
- **Environment Variables:** [VERCEL_ENV_VARIABLES.md](./VERCEL_ENV_VARIABLES.md)
- **MongoDB Setup:** [MONGODB_SETUP.md](./MONGODB_SETUP.md)

---

## 🆘 Troubleshooting

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

## 🔄 Automatic Deployments

Vercel automatically deploys when you push to GitHub:

```bash
git add .
git commit -m "Your changes"
git push
```

**Preview deployments** are created automatically for every push.

**Production deployments** happen when you merge to `main`.

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

## 🎯 Quick Checklist

- [ ] Frontend builds locally: `npm run build`
- [ ] Backend tests locally: `python test_mongodb.py`
- [ ] CORS configured (for dev only)
- [ ] Deployed to Vercel
- [ ] Environment variables set
- [ ] MongoDB Atlas IP whitelisted
- [ ] Frontend loads correctly
- [ ] API endpoints work
- [ ] CORS updated with actual Vercel URL
- [ ] Monitoring set up

---

## 📱 Test Your Deployment

### 1. Create Employee
```
POST /api/employees/
Body: {"name": "John Doe", "email": "john@example.com", "status": "active"}
```

### 2. Check API Documentation
Visit: `https://your-app.vercel.app/docs`

### 3. View Frontend
Visit: `https://your-app.vercel.app`

### 4. Monitor Logs
Vercel Dashboard → Functions → Logs

---

## 🔐 Security Tips

1. **Never commit secrets** - Use Vercel environment variables
2. **Keep dependencies updated** - Regular updates prevent vulnerabilities
3. **Use HTTPS everywhere** - Vercel handles this automatically
4. **Monitor logs regularly** - Catch issues early
5. **Rotate credentials** - Change MongoDB password periodically

---

## 💡 Pro Tips

### Development
- Use preview deployments to test changes
- Keep `CORS_ORIGINS` set to local development
- Enable debug logging: `LOG_LEVEL=DEBUG`

### Production
- Use `LOG_LEVEL=INFO` for performance
- Monitor database usage
- Set up alerts for errors

### Optimization
- Use CDN for frontend (Vercel handles this)
- Enable compression
- Use connection pooling for MongoDB

---

## 🎊 Success!

Your HRMS Lite is now deployed!

**Next Steps:**
1. Test all features
2. Set up monitoring
3. Share with your team
4. Use automatic deployments

---

**Need Help?**
- Check [VERCEL_DEPLOYMENT_COMPLETE.md](./VERCEL_DEPLOYMENT_COMPLETE.md) for detailed guide
- Review [VERCEL_ENV_VARIABLES.md](./VERCEL_ENV_VARIABLES.md) for configuration
- Check Vercel logs for errors

**Happy Deploying!** 🚀
