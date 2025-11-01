# 🚀 SmartApply AI - Deployment Guide

This guide will help you deploy your full-stack SmartApply AI application to production.

## 📋 Table of Contents
1. [Deployment Strategy](#deployment-strategy)
2. [Environment Variables](#environment-variables)
3. [Deploy Backend](#deploy-backend)
4. [Deploy Frontend](#deploy-frontend)
5. [Post-Deployment](#post-deployment)

---

## 🎯 Deployment Strategy

**Recommended Setup:**
- **Frontend**: Vercel or Netlify (free, fast CDN)
- **Backend**: Render or Railway (free tier available)

**Alternative:**
- Both on Render (one service for frontend, one for backend)

---

## 🔐 Environment Variables

### Backend Environment Variables

Create a `.env` file in the `backend/` folder (for local) and set these in your hosting platform:

```env
PORT=4000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
MONGO_URI=mongodb+srv://adityabelgaonkar:adityabelgaonkar@cluster0.x2hfgjt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
```

**⚠️ IMPORTANT:** 
- Generate a strong JWT_SECRET: Use `openssl rand -base64 32` or a password generator
- Your MONGO_URI already looks production-ready ✅

### Frontend Environment Variables

Set these in your frontend hosting platform:

```env
VITE_BACKEND_URL=https://your-backend-url.onrender.com
VITE_GEMINI_API_KEY=your-complete-gemini-api-key-here
```

**Replace `https://your-backend-url.onrender.com` with your actual backend URL after deployment!**

---

## 🔧 Deploy Backend (Render - Recommended)

### Step 1: Prepare Backend

1. **Create `backend/.env`** (for local reference):
```env
PORT=4000
JWT_SECRET=your-strong-secret-here
MONGO_URI=mongodb+srv://adityabelgaonkar:adityabelgaonkar@cluster0.x2hfgjt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
```

### Step 2: Deploy on Render

1. **Sign up**: Go to [render.com](https://render.com) and sign up with GitHub

2. **Create New Web Service**:
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the repository

3. **Configure Service**:
   - **Name**: `smartapply-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Plan**: Free

4. **Add Environment Variables**:
   - Click "Environment" tab
   - Add:
     - `PORT` = `4000`
     - `JWT_SECRET` = (generate a strong secret)
     - `MONGO_URI` = `mongodb+srv://adityabelgaonkar:adityabelgaonkar@cluster0.x2hfgjt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`

5. **Deploy**:
   - Click "Create Web Service"
   - Wait for deployment (2-3 minutes)
   - Copy your service URL (e.g., `https://smartapply-backend.onrender.com`)

### Step 3: Test Backend

Visit: `https://your-backend-url.onrender.com/health` (if you have a health endpoint)
Or: `https://your-backend-url.onrender.com/` (should show your API welcome message)

---

## 🌐 Deploy Frontend (Vercel - Recommended)

### Step 1: Update Frontend Config

Your frontend already uses `VITE_BACKEND_URL` from environment variables, so no code changes needed!

### Step 2: Deploy on Vercel

1. **Sign up**: Go to [vercel.com](https://vercel.com) and sign up with GitHub

2. **Import Project**:
   - Click "Add New..." → "Project"
   - Import your GitHub repository
   - Select the repository

3. **Configure Project**:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (root of your repo)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. **Add Environment Variables**:
   - Click "Environment Variables"
   - Add:
     - `VITE_BACKEND_URL` = `https://your-backend-url.onrender.com` (from Step 2 above)
     - `VITE_GEMINI_API_KEY` = `your-complete-gemini-api-key`

   **⚠️ Make sure to replace `your-backend-url` with your actual Render backend URL!**

5. **Deploy**:
   - Click "Deploy"
   - Wait for build (2-3 minutes)
   - Your site will be live at `https://your-app-name.vercel.app`

---

## 🎨 Deploy Frontend (Netlify - Alternative)

### Step 1: Prepare Build

1. Build locally first to test:
```bash
npm run build
```

### Step 2: Deploy on Netlify

1. **Sign up**: Go to [netlify.com](https://netlify.com) and sign up with GitHub

2. **New Site from Git**:
   - Click "Add new site" → "Import an existing project"
   - Connect to GitHub and select repository

3. **Build Settings**:
   - **Base directory**: Leave empty (root)
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`

4. **Environment Variables**:
   - Go to Site settings → Environment variables
   - Add:
     - `VITE_BACKEND_URL` = `https://your-backend-url.onrender.com`
     - `VITE_GEMINI_API_KEY` = `your-complete-gemini-api-key`

5. **Deploy**:
   - Click "Deploy site"
   - Wait for build
   - Your site will be live at `https://random-name.netlify.app`

---

## 🚂 Alternative: Deploy Both on Render

If you prefer to keep everything on one platform:

### Backend Service
- Follow the backend deployment steps above (Render)
- Keep as "Web Service"

### Frontend Service
1. **Create New Static Site**:
   - Click "New +" → "Static Site"
   - Connect GitHub repo

2. **Configure**:
   - **Root Directory**: Leave empty (or `./`)
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`

3. **Environment Variables**:
   - Add `VITE_BACKEND_URL` and `VITE_GEMINI_API_KEY`

4. **Deploy**: Click "Create Static Site"

---

## ✅ Post-Deployment Checklist

### 1. Update Backend CORS (if needed)

Your backend already has `app.use(cors())` which allows all origins, so this should work!

If you want to restrict CORS to your frontend only, update `backend/server.js`:

```javascript
const cors = require('cors');
const corsOptions = {
  origin: ['https://your-frontend.vercel.app', 'https://your-frontend.netlify.app'],
  credentials: true
};
app.use(cors(corsOptions));
```

### 2. Test Your Deployment

1. **Test Frontend**: Visit your frontend URL
2. **Test Sign Up**: Create a test account
3. **Test Sign In**: Login with test account
4. **Test Admin**: Login with admin account (`admin`/`Admin123`)
5. **Test API Calls**: Check browser console for errors

### 3. MongoDB Atlas Security

Your MongoDB Atlas is already configured. Make sure:
- ✅ Your IP is whitelisted (or `0.0.0.0/0` for all IPs)
- ✅ Database user has correct permissions
- ✅ Connection string is correct

---

## 🔄 Updating Your Deployment

### Backend Updates
1. Push changes to GitHub
2. Render will auto-deploy (if auto-deploy is enabled)
3. Or manually redeploy from Render dashboard

### Frontend Updates
1. Push changes to GitHub
2. Vercel/Netlify will auto-deploy
3. Or manually redeploy from dashboard

---

## 🐛 Troubleshooting

### Backend Issues

**Problem**: Backend not starting
- **Solution**: Check Render logs for errors
- Verify environment variables are set correctly
- Check MongoDB connection string

**Problem**: CORS errors
- **Solution**: Ensure `cors()` middleware is enabled in `server.js`

### Frontend Issues

**Problem**: Can't connect to backend
- **Solution**: 
  - Verify `VITE_BACKEND_URL` is set correctly
  - Check backend URL is accessible (visit in browser)
  - Ensure backend is running

**Problem**: Environment variables not working
- **Solution**: 
  - Restart deployment (Redeploy)
  - Verify variables start with `VITE_` prefix
  - Check build logs for errors

---

## 📝 Quick Reference

### Backend URLs:
- Render: `https://your-app.onrender.com`
- Railway: `https://your-app.railway.app`

### Frontend URLs:
- Vercel: `https://your-app.vercel.app`
- Netlify: `https://your-app.netlify.app`
- Render (Static): `https://your-app.onrender.com`

### Important Files:
- Backend env: `backend/.env` (local only)
- Frontend env: Set in hosting platform
- Backend entry: `backend/server.js`
- Frontend entry: `src/main.tsx`

---

## 🎉 You're Done!

Your SmartApply AI app should now be live! Share your frontend URL with users.

**Need help?** Check the logs in your hosting platform's dashboard.

