# Vercel Environment Variables Reference

## Complete List of Environment Variables

### Backend Variables

Copy these to Vercel Dashboard → Settings → Environment Variables

```bash
# Database Configuration
DB_TYPE=mongodb
MONGODB_URI=mongodb+srv://abhi2510979b_db_user:ZWDcqnkXuD5PUGPA@cluster0.negeuoc.mongodb.net/?appName=Cluster0
MONGODB_DB_NAME=hrms

# Application Configuration
APP_NAME=HRMS Lite API
APP_VERSION=1.0.0
LOG_LEVEL=INFO

# CORS Configuration
CORS_ORIGINS="https://your-app-name.vercel.app"

# Server Configuration
HOST=0.0.0.0
PORT=8000

# Build/Deployment
PYTHONUNBUFFERED=1
VERCEL=1
```

### Frontend Variables

Copy these to Vercel Dashboard → Settings → Environment Variables (Frontend)

```bash
# API Configuration
VITE_API_URL=""  # Empty for unified deployment, or https://your-api.vercel.app/api

# App Configuration
VITE_APP_NAME=HRMS Lite
VITE_APP_VERSION=1.0.0
```

---

## Frontend Environment Variables Setup

### Option 1: Empty String (Recommended)

```bash
VITE_API_URL=""
```

This uses the same origin for API calls (unified deployment).

### Option 2: Full API URL

```bash
VITE_API_URL=https://your-api.vercel.app/api
```

Use this if you deploy frontend and backend separately.

---

## MongoDB Atlas Configuration

### IP Whitelisting

After deployment, add your Vercel IP to MongoDB Atlas:

1. Go to MongoDB Atlas → Network Access
2. Add new IP address:
   - **Production:** `34.25.247.0/24` (Vercel general range)
   - **Development:** Your local IP

### Database User Permissions

Ensure your database user has these permissions:
- ✅ Read and write to databases
- ✅ Create collections
- ✅ View performance metrics

---

## Default URLs After Deployment

| Service | URL | Notes |
|---------|-----|-------|
| **Frontend** | `https://your-app-name.vercel.app` | React application |
| **API Docs** | `https://your-app-name.vercel.app/docs` | Swagger UI |
| **ReDoc** | `https://your-app-name.vercel.app/redoc` | Alternative docs |
| **Health** | `https://your-app-name.vercel.app/health` | Health check endpoint |

---

## CORS Configuration Update

### After Getting Your Vercel URL

Update `backend/app/core/config.py`:

```python
CORS_ORIGINS: list[str] = Field(
    default=[
        "https://your-app-name.vercel.app",  # Production
        "https://your-app-name-git-*.vercel.app",  # Preview deployments
        "http://localhost:5173"  # Local dev
    ],
    description="Allowed CORS origins"
)
```

### When to Update CORS

1. ✅ After first deployment
2. ✅ When adding a new frontend domain
3. ✅ When using preview deployments
4. ✅ For local development

---

## Testing Environment Variables

### Check Vercel Logs

1. Go to Vercel Dashboard → Your Project → Functions → Logs
2. Check that environment variables are loading

### Test API Endpoint

```bash
curl https://your-app-name.vercel.app/health
```

Expected response:
```json
{
  "status": "healthy",
  "database": "mongodb",
  "version": "1.0.0"
}
```

### Test Frontend

1. Visit `https://your-app-name.vercel.app`
2. Open browser console (F12)
3. Check for any errors

---

## Troubleshooting Environment Variables

### Variables Not Loading

1. Verify names match exactly (case-sensitive)
2. Restart deployment after adding variables
3. Check that variables are set for the correct environment (Production/Preview)

### CORS Errors

1. Update `CORS_ORIGINS` in `backend/app/core/config.py`
2. Redeploy backend: `vercel --prod`
3. Clear browser cache

### Database Connection Failed

1. Check `MONGODB_URI` is correct
2. Verify IP whitelist in MongoDB Atlas
3. Check database user permissions
4. Look at Vercel logs for specific error

---

## Security Best Practices

### Never Commit Secrets

- ❌ Don't commit `.env` files
- ❌ Don't commit connection strings to Git
- ❌ Don't commit API keys to Git

### Use Vercel Environment Variables

- ✅ Store all secrets in Vercel dashboard
- ✅ Use `.env.example` as template only
- ✅ Rotate credentials regularly

### Environment Variable Types

| Variable Type | Recommended Practice |
|---------------|---------------------|
| Production | Set in Vercel Dashboard |
| Development | Set in local `.env` files |
| Preview | Auto-inherited from main |

---

## Quick Reference

### Adding New Variable

1. Go to Vercel Dashboard → Settings → Environment Variables
2. Click "Add Variable"
3. Enter name and value
4. Select environment (Production/Preview)
5. Click "Add"

### Removing Variable

1. Go to Vercel Dashboard → Settings → Environment Variables
2. Find variable
3. Click "Delete"

### Editing Variable

1. Go to Vercel Dashboard → Settings → Environment Variables
2. Click on variable to edit
3. Update value
4. Save changes

### Viewing Variable Values

⚠️ **Note:** You can see variable names in the UI, but not the values (for security).

For debugging, check Vercel logs or use environment-specific testing.

---

## Production vs Development

### Production Environment

```bash
# Set in Vercel Dashboard → Production

DB_TYPE=mongodb
MONGODB_URI=<your-mongodb-uri>
CORS_ORIGINS="https://your-app.vercel.app"
LOG_LEVEL=INFO
PYTHONUNBUFFERED=1
```

### Development Environment

```bash
# Set in local .env files

DB_TYPE=mongodb
MONGODB_URI=<your-local-mongodb-uri>
CORS_ORIGINS="http://localhost:5173"
LOG_LEVEL=DEBUG
```

---

## Environment Variable Checklist

### Backend

- [ ] DB_TYPE (mongodb)
- [ ] MONGODB_URI
- [ ] MONGODB_DB_NAME (hrms)
- [ ] CORS_ORIGINS
- [ ] LOG_LEVEL (INFO)
- [ ] PYTHONUNBUFFERED (1)
- [ ] APP_NAME
- [ ] APP_VERSION

### Frontend

- [ ] VITE_API_URL (empty for unified)
- [ ] VITE_APP_NAME
- [ ] VITE_APP_VERSION

### MongoDB Atlas

- [ ] IP whitelist configured
- [ ] Database user permissions set
- [ ] Connection string correct

---

## Support

If you encounter issues with environment variables:

1. Check Vercel logs for errors
2. Verify variable names are correct
3. Ensure variables are set for the right environment
4. Restart the deployment
5. Clear Vercel cache

---

**Remember:** Always keep your secrets secure and never commit them to your code repository!
