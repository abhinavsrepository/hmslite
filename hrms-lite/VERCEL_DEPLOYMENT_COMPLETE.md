# Complete Vercel Deployment Strategy - HRMS Lite

## 📋 Prerequisites

### 1. Vercel Account
- Sign up at [vercel.com](https://vercel.com)
- Verify your email
- Have your GitHub account ready for integration

### 2. GitHub Repository
- Create a GitHub repository for your HRMS Lite project
- Push all code to the repository
- Ensure all files are committed

### 3. MongoDB Atlas Setup (Already Done ✅)
- Your MongoDB Atlas connection is configured
- Database name: `hrms`
- Connection URI: Already in `.env` file

### 4. Local Setup Verification
```bash
# Clone the repository
git clone <your-repo-url>
cd hrms-lite

# Install dependencies
cd backend && pip install -r requirements.txt && cd ..

# Start the application locally
npm run dev
```

---

## 🏗️ Deployment Architecture

```
hrms-lite/
├── api/                    # Vercel serverless functions (single entry point)
│   └── index.py           # FastAPI app with unified API
├── backend/               # FastAPI application
│   ├── app/
│   │   ├── core/         # Configuration and utilities
│   │   ├── db/           # Database layer (MongoDB)
│   │   ├── models/       # Database models
│   │   ├── schemas/      # Pydantic schemas
│   │   ├── services/     # Business logic
│   │   ├── api/          # API endpoints
│   │   └── utils/        # Helper functions
│   ├── run.py            # Entry point
│   └── .env              # Environment variables
├── frontend/             # React application
│   ├── src/
│   │   ├── services/     # API services
│   │   ├── config.js     # Configuration
│   │   └── ...
│   ├── package.json      # Frontend dependencies
│   └── .env.production   # Production environment
├── vercel.json           # Vercel configuration
└── package.json          # Root package.json (build scripts)
```

---

## 🚀 Step-by-Step Deployment

### STEP 1: Prepare Backend for Vercel

#### 1.1 Verify Backend Configuration

Check that your backend is ready:

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Test the backend locally
python run.py --dev
```

#### 1.2 Check Environment Variables

Your backend already has the MongoDB configuration in `.env`:

```bash
DB_TYPE=mongodb
MONGODB_URI=mongodb+srv://abhi2510979b_db_user:ZWDcqnkXuD5PUGPA@cluster0.negeuoc.mongodb.net/?appName=Cluster0
MONGODB_DB_NAME=hrms
```

**Important for Vercel:**
- MongoDB URI must be set as Vercel environment variable
- Add `DB_TYPE=mongodb` to Vercel environment variables

#### 1.3 Verify Vercel Configuration

The `vercel.json` at the root level is already configured:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    },
    {
      "src": "api/index.py",
      "use": "@vercel/python",
      "config": {
        "includeFiles": "backend/**"
      }
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
      "src": "/redoc",
      "dest": "api/index.py"
    },
    {
      "src": "/openapi.json",
      "dest": "api/index.py"
    },
    {
      "src": "/health",
      "dest": "api/index.py"
    },
    {
      "handle": "filesystem"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "env": {
    "PYTHONUNBUFFERED": "1",
    "VERCEL": "1"
  }
}
```

#### 1.4 Update Backend CORS Configuration

You need to add your Vercel frontend URL to CORS origins.

**Current configuration** is in `backend/app/core/config.py`:

```python
CORS_ORIGINS: list[str] = Field(
    default=["*"],
    description="Allowed CORS origins"
)
```

**Update for Vercel deployment:**

```python
CORS_ORIGINS: list[str] = Field(
    default=[
        "https://your-app-name.vercel.app",  # Production frontend
        "https://your-app-name-git-*.vercel.app",  # Preview deployments
        "http://localhost:5173"  # Local development
    ],
    description="Allowed CORS origins"
)
```

**Note:** You'll need to update this after deployment when you get your actual Vercel URLs.

---

### STEP 2: Prepare Frontend for Vercel

#### 2.1 Verify Frontend Dependencies

Check `frontend/package.json`:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  }
}
```

#### 2.2 Configure Production Environment

The `.env.production` is already set up correctly:

```env
# Production Environment Variables

# API URL for production
# - Use empty string '' for unified deployment (same domain)
# - Or use full URL: 'https://your-api.vercel.app'
VITE_API_URL=

# App Configuration
VITE_APP_NAME=HRMS Lite
VITE_APP_VERSION=1.0.0
```

**Important:** Leave `VITE_API_URL=` empty for unified deployment (recommended).

#### 2.3 Test Frontend Build Locally

```bash
cd frontend

# Install dependencies
npm install

# Build for production
npm run build

# Preview the production build
npm run preview
```

This should create a `dist` folder with your built application.

---

### STEP 3: Create Root Configuration Files

#### 3.1 Create Root `package.json`

Create `package.json` at the root of the project:

```json
{
  "name": "hrms-lite",
  "version": "1.0.0",
  "description": "HRMS Lite - Full Stack HR Management System",
  "scripts": {
    "build": "cd frontend && npm install && npm run build",
    "dev": "cd frontend && npm run dev",
    "install:all": "npm install && cd frontend && npm install"
  },
  "keywords": [
    "hrms",
    "hr",
    "attendance",
    "employees"
  ],
  "license": "MIT"
}
```

#### 3.2 Verify Root `vercel.json`

The file already exists and is configured correctly for unified deployment.

---

### STEP 4: Deploy to Vercel

#### Option A: Using Vercel CLI (Recommended)

```bash
# 1. Install Vercel CLI globally
npm install -g vercel

# 2. Login to Vercel
vercel login

# 3. Deploy from project root
cd hrms-lite
vercel --prod

# 4. Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? Select your account
# - Link to existing project? No
# - What's your project's name? hrms-lite
# - In which directory is your code located? ./
# - Want to override the settings? No
```

#### Option B: Using GitHub Integration

**1. Push your code to GitHub**

```bash
cd hrms-lite
git init
git add .
git commit -m "Prepare for Vercel deployment"
git remote add origin <your-github-repo-url>
git push -u origin main
```

**2. Create Deployment via Vercel Dashboard**

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Select the repository: `hrms-lite`
5. Configure project settings:
   - **Framework Preset**: `None` (or `Other`)
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build`
   - **Output Directory**: `frontend/dist`
   - **Install Command**: `npm install`

**6. Set Environment Variables**

In the Vercel project settings:
- Go to **Settings** → **Environment Variables**
- Add the following variables:

**Backend Environment Variables:**
```
Name: DB_TYPE
Value: mongodb

Name: MONGODB_URI
Value: mongodb+srv://abhi2510979b_db_user:ZWDcqnkXuD5PUGPA@cluster0.negeuoc.mongodb.net/?appName=Cluster0

Name: MONGODB_DB_NAME
Value: hrms

Name: CORS_ORIGINS
Value: "https://your-app-name.vercel.app"

Name: LOG_LEVEL
Value: INFO

Name: PYTHONUNBUFFERED
Value: 1
```

**Frontend Environment Variables:**
```
Name: VITE_API_URL
Value: ""  (empty string for unified deployment)

Name: VITE_APP_NAME
Value: HRMS Lite

Name: VITE_APP_VERSION
Value: 1.0.0
```

**7. Click "Deploy"**

The deployment process will:
1. Build the frontend
2. Set up the serverless functions
3. Deploy both to Vercel

---

### STEP 5: Post-Deployment Setup

#### 5.1 Update CORS Configuration

After deployment, you'll get your Vercel URLs:

**Production URL:** `https://hrms-lite.vercel.app`
**API URL:** `https://hrms-lite.vercel.app/api`

**Update your backend CORS configuration:**

Edit `backend/app/core/config.py`:

```python
CORS_ORIGINS: list[str] = Field(
    default=[
        "https://hrms-lite.vercel.app",  # Production frontend
        "https://hrms-lite-git-*.vercel.app",  # Preview deployments
        "http://localhost:5173"  # Local development
    ],
    description="Allowed CORS origins"
)
```

**Commit and push the change:**

```bash
git add backend/app/core/config.py
git commit -m "Update CORS for Vercel deployment"
git push
```

Vercel will automatically redeploy with the updated CORS settings.

#### 5.2 Update Frontend CORS in Vercel Dashboard

If needed, you can also update CORS settings directly in Vercel:

1. Go to **Settings** → **Environment Variables**
2. Update `CORS_ORIGINS` to include your new frontend URL

#### 5.3 Test Your Deployment

**1. Check Frontend:**
- Visit your deployed frontend URL
- Verify the application loads correctly
- Check browser console for any errors

**2. Check API:**
- Visit `https://hrms-lite.vercel.app/api/docs` (Swagger docs)
- Test the API endpoints using the interactive documentation

**3. Test End-to-End:**
- Login/create an employee
- Test attendance tracking
- Verify data is being stored in MongoDB Atlas

**4. Check Vercel Logs:**
- Go to Vercel dashboard → Your project → **Functions** → **Logs**
- Monitor for any errors

---

## 📊 Deployment URLs

After successful deployment, you'll have:

| Service | URL | Purpose |
|---------|-----|---------|
| **Frontend** | `https://hrms-lite.vercel.app` | React application |
| **API Documentation** | `https://hrms-lite.vercel.app/docs` | Swagger UI |
| **Alternative Docs** | `https://hrms-lite.vercel.app/redoc` | ReDoc |
| **Health Check** | `https://hrms-lite.vercel.app/health` | Health endpoint |

---

## 🗄️ Database Setup for Vercel

### MongoDB Atlas Configuration

Your MongoDB setup is already configured and will work on Vercel. However, ensure:

**1. IP Whitelisting:**
- Go to MongoDB Atlas → Network Access
- Add your Vercel IP addresses:
  - `34.25.247.0/24` (general Vercel range)
  - Or use "Access from Anywhere" for development

**2. Database Users:**
- Verify your database user has proper permissions
- User: `abhi2510979b_db_user`

**3. Connection String Security:**
- Your connection string is already in `.env`
- Keep it secure - don't commit to GitHub
- Set it in Vercel environment variables

**4. Testing Connection:**
```bash
# Test connection from Vercel serverless function
curl https://hrms-lite.vercel.app/health
```

### Alternative: Vercel Postgres (Not Recommended)

If you want to use Vercel's PostgreSQL, you would need to:

1. Add Vercel Postgres integration
2. Update your database layer to use PostgreSQL
3. Change `DB_TYPE` to `postgres`
4. Add `POSTGRES_URL` environment variable

**Recommendation:** Stick with MongoDB Atlas as it's already configured and working.

---

## 🔧 Troubleshooting

### Problem 1: Build Fails

**Symptoms:** Build error during Vercel deployment

**Solutions:**
```bash
# 1. Clear Vercel cache
# In Vercel dashboard, go to Project Settings → General → Clear Cache

# 2. Test build locally
cd frontend
npm install
npm run build

# 3. Check for syntax errors
python -m py_compile api/index.py
```

### Problem 2: API Returns 404

**Symptoms:** API endpoints not found

**Solutions:**
- Verify `vercel.json` routes are correct
- Check that `api/index.py` is properly configured
- Look at Vercel logs for import errors

### Problem 3: CORS Errors

**Symptoms:** Browser console shows CORS errors

**Solutions:**
1. Update `CORS_ORIGINS` in `backend/app/core/config.py`
2. Ensure your frontend URL is exactly as deployed
3. Include both production and preview URLs
4. Redeploy backend after changes

### Problem 4: MongoDB Connection Fails

**Symptoms:** API returns connection errors

**Solutions:**
1. Check environment variables in Vercel dashboard
2. Verify MongoDB URI is correct
3. Check IP whitelist in MongoDB Atlas
4. Look at Vercel logs for specific error messages

### Problem 5: Frontend Shows White Screen

**Symptoms:** Frontend loads but shows blank page

**Solutions:**
1. Check browser console for JavaScript errors
2. Verify `vercel.json` routes are correct
3. Ensure `dist` folder is being built
4. Check Vercel build logs

### Problem 6: Environment Variables Not Working

**Symptoms:** App behaves differently in production

**Solutions:**
1. Verify variables are set in Vercel dashboard
2. Check variable names match exactly (case-sensitive)
3. Restart deployment after adding variables
4. Check that `.env` files are not committed to Git

---

## 📈 Monitoring and Maintenance

### Vercel Dashboard

1. **Logs:**
   - Go to Project → Functions → Logs
   - Monitor API requests and errors

2. **Analytics:**
   - Go to Project → Analytics
   - View page views, referrers, etc.

3. **Deployment History:**
   - Go to Project → Deployments
   - Review all deployments and rollback if needed

4. **Environment Variables:**
   - Go to Settings → Environment Variables
   - Manage all configuration

### MongoDB Atlas Monitoring

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Monitor:
   - Database performance
   - Storage usage
   - Connection pool
   - Slow queries

### Health Monitoring

Set up alerts:

1. **Vercel:** Enable notifications for deployment failures
2. **MongoDB:** Set up alerts for connection failures
3. **Uptime:** Use a service like UptimeRobot to monitor your URLs

---

## 🔄 Continuous Deployment

### Automatic Updates

Vercel automatically deploys when you push to GitHub:

1. **Development:** Any push to main branch triggers preview deployment
2. **Production:** Push to main and merge will trigger production deployment

### Deployment Strategy

```bash
# 1. Make changes
git add .
git commit -m "Your changes description"
git push

# 2. Vercel automatically detects changes

# 3. Preview deployment created automatically

# 4. Merge to main for production deployment

# 5. Monitor deployment progress in Vercel dashboard
```

### Branch Protection

Recommended to enable branch protection:

1. Go to GitHub repository → Settings → Branches
2. Add rules:
   - Require pull request reviews
   - Require status checks to pass
   - Require branches to be up to date before merging

---

## 🎯 Best Practices

### 1. Environment Variables
- Never commit secrets to Git
- Use `.env.example` for documentation only
- Keep environment variables secure in Vercel dashboard

### 2. Database
- Regular backups in MongoDB Atlas
- Monitor performance and scale as needed
- Use connection pooling

### 3. Code Quality
- Write tests for critical functions
- Use linters and formatters
- Keep dependencies updated

### 4. Security
- Keep dependencies updated
- Use environment variables for secrets
- Enable CORS properly
- Use HTTPS everywhere

### 5. Monitoring
- Set up alerts for critical errors
- Monitor performance metrics
- Review logs regularly

---

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/)
- [MongoDB Atlas Documentation](https://www.mongodb.com/docs/atlas/)
- [React Deployment](https://react.dev/learn/deploying)

---

## ✅ Deployment Checklist

- [ ] Repository pushed to GitHub
- [ ] Backend code tested locally
- [ ] Frontend code tested locally
- [ ] `package.json` created at root
- [ ] `vercel.json` configured
- [ ] Environment variables set in Vercel
- [ ] CORS configuration updated
- [ ] MongoDB Atlas IP whitelist configured
- [ ] Build tested locally
- [ ] Deployment successful
- [ ] API documentation accessible
- [ ] Frontend loads correctly
- [ ] End-to-end testing completed
- [ ] Monitoring set up
- [ ] Alerts configured

---

## 🎉 Congratulations!

You've successfully deployed HRMS Lite to Vercel!

Your application is now live with:
- ✅ Frontend on Vercel
- ✅ Backend API on Vercel
- ✅ MongoDB Atlas integration
- ✅ Automatic deployments
- ✅ Monitoring and logs

**Your URLs:**
- **Frontend:** `https://hrms-lite.vercel.app`
- **API Docs:** `https://hrms-lite.vercel.app/docs`

---

**Need Help?**
- Check Vercel logs: Dashboard → Project → Functions → Logs
- Check MongoDB Atlas: Monitor performance
- Review this guide's troubleshooting section

**Next Steps:**
1. Test all features thoroughly
2. Set up monitoring and alerts
3. Share with your team
4. Start using automatic deployments
