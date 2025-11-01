# ⚡ Quick Deployment Guide

## 🎯 Fastest Path to Production

### Option 1: Render (Backend) + Vercel (Frontend) - Recommended ⭐

**Backend (5 minutes):**
1. Go to [render.com](https://render.com) → Sign up with GitHub
2. New → Web Service → Connect repo
3. Settings:
   - Root Directory: `backend`
   - Build: `npm install`
   - Start: `npm start`
4. Environment Variables:
   - `PORT` = `4000`
   - `JWT_SECRET` = (generate strong secret)
   - `MONGO_URI` = `mongodb+srv://adityabelgaonkar:adityabelgaonkar@cluster0.x2hfgjt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`
5. Deploy → Copy URL (e.g., `https://smartapply-backend.onrender.com`)

**Frontend (5 minutes):**
1. Go to [vercel.com](https://vercel.com) → Sign up with GitHub
2. New Project → Import repo
3. Framework: Vite
4. Environment Variables:
   - `VITE_BACKEND_URL` = (paste your Render backend URL)
   - `VITE_GEMINI_API_KEY` = (your complete API key)
5. Deploy → Done! 🎉

---

### Option 2: Both on Render

**Backend:**
- Follow Render steps above

**Frontend:**
1. Render → New → Static Site
2. Connect repo
3. Build: `npm run build`
4. Publish: `dist`
5. Environment Variables: Same as Vercel
6. Deploy

---

## 🔑 Generate Strong JWT Secret

**Command:**
```bash
openssl rand -base64 32
```

Or use: https://generate-secret.vercel.app/32

---

## ✅ After Deployment

1. Test frontend URL
2. Test signup/login
3. Test admin access (`admin`/`Admin123`)
4. Check browser console for errors

---

## 📚 Full Guide

See `DEPLOYMENT-GUIDE.md` for detailed instructions.

