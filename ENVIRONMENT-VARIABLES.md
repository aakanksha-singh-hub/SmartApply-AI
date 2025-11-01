# 🔐 Environment Variables Reference

## Backend Variables (Set in hosting platform)

### Required:
```env
PORT=4000
JWT_SECRET=your-strong-secret-here  # Generate with: openssl rand -base64 32
MONGO_URI=mongodb+srv://adityabelgaonkar:adityabelgaonkar@cluster0.x2hfgjt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
```

### Notes:
- `PORT`: Usually 4000, but Render/Railway may assign automatically
- `JWT_SECRET`: **Generate a strong secret** - don't use "secretive" in production!
- `MONGO_URI`: Your MongoDB Atlas connection string (already production-ready ✅)

---

## Frontend Variables (Set in hosting platform)

### Required:
```env
VITE_BACKEND_URL=https://your-backend-url.onrender.com
VITE_GEMINI_API_KEY=your-complete-gemini-api-key
```

### Notes:
- `VITE_BACKEND_URL`: Must be your **actual deployed backend URL**
  - Local: `http://localhost:4000`
  - Production: `https://smartapply-backend.onrender.com` (or your backend URL)
- `VITE_GEMINI_API_KEY`: Your complete Gemini API key (you have `AIza...` - make sure it's complete)

---

## Where to Set These

### Render (Backend):
1. Go to your service dashboard
2. Click "Environment" tab
3. Add each variable

### Vercel/Netlify (Frontend):
1. Go to project settings
2. Find "Environment Variables"
3. Add each variable
4. **Redeploy** after adding variables!

---

## ⚠️ Important Security Notes

1. **Never commit `.env` files** to GitHub
2. **Generate a strong JWT_SECRET** for production
3. **Keep your MongoDB credentials secure**
4. **Don't share your Gemini API key publicly**

---

## 🧪 Testing Locally

Create `backend/.env`:
```env
PORT=4000
JWT_SECRET=dev-secret-change-in-production
MONGO_URI=mongodb+srv://adityabelgaonkar:adityabelgaonkar@cluster0.x2hfgjt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
```

Create `.env` in root:
```env
VITE_BACKEND_URL=http://localhost:4000
VITE_GEMINI_API_KEY=your-complete-gemini-api-key
```

