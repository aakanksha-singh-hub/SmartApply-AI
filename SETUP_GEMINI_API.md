# Setting Up Gemini API

## Why You Need This

Currently, the app is using **fallback roadmaps** (hardcoded career paths). To get **AI-powered personalized career recommendations**, you need to configure the Gemini API.

## Steps to Get Your Gemini API Key

### 1. Visit Google AI Studio
Go to: **https://aistudio.google.com/app/apikey**

OR

Go to: **https://makersuite.google.com/app/apikey**

### 2. Sign in with your Google Account
Use any Google account (Gmail)

### 3. Create API Key
- Click **"Get API Key"** or **"Create API Key"**
- Click **"Create API key in new project"** (or select existing project)
- Copy the API key that appears

### 4. Add to Your Project

Open the `.env` file in your project root and add your API key:

```env
VITE_GEMINI_API_KEY=your_api_key_here
```

Replace `your_api_key_here` with the actual key you copied.

### 5. Restart the Development Server

```bash
npm run dev
```

The server needs to restart to pick up the new environment variable.

## How to Verify It's Working

1. Go through the career assessment
2. Check the browser console (F12)
3. You should see: `🚀 Generating career roadmap with Gemini AI`
4. Instead of: `🔄 Using fallback roadmap generation`

## Benefits of Using Gemini API

### With Gemini API (AI-Powered):
✅ Personalized career recommendations based on YOUR specific profile
✅ Dynamic roadmaps tailored to your skills and experience
✅ Intelligent alternative career suggestions
✅ Context-aware learning resources
✅ Unique insights for every user

### Without Gemini API (Fallback):
⚠️ Generic pre-defined roadmaps
⚠️ Limited career paths (only Startup Founder, Climate Scientist, Tech, Business)
⚠️ Same recommendations for similar profiles
⚠️ Basic learning resources

## Free Tier Information

- **Free quota**: 60 requests per minute
- **Cost**: FREE for moderate usage
- **Perfect for**: Development and testing
- **No credit card required**: Just a Google account

## Troubleshooting

### Issue: Still seeing fallback after adding key

**Solution**: Make sure you restarted the dev server with `npm run dev`

### Issue: API key not working

**Solution**: 
1. Check that there are no extra spaces in the `.env` file
2. Make sure the format is exactly: `VITE_GEMINI_API_KEY=your_key_here`
3. Verify the key is valid at https://aistudio.google.com/

### Issue: Rate limit exceeded

**Solution**: You're making too many requests. Wait a minute and try again.

## Security Note

⚠️ **NEVER commit the `.env` file to Git!**

The `.env` file is already in `.gitignore`, so it won't be committed. This keeps your API key safe.

---

## Quick Start (TL;DR)

1. Go to https://aistudio.google.com/app/apikey
2. Create API key
3. Add to `.env` file: `VITE_GEMINI_API_KEY=your_key`
4. Run `npm run dev`
5. Test the career assessment

That's it! 🎉

