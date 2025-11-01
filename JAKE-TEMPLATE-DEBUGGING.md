# 🔍 Jake's Resume Template - Debugging Guide

## 🎯 Problem
Getting generic placeholder data in the `.tex` file instead of actual resume content.

---

## ✅ Fixes Applied

### 1. **Improved Gemini Extraction Prompt**
- Now explicitly asks for EXACT text from resume
- Warns against using placeholders
- Better structured instructions

### 2. **Better Fallback Logic**
- No longer uses AI analysis "strengths" as experience bullets
- Returns clear `[placeholders]` for user to fill
- Better bullet point detection (supports -, *, •, etc.)

### 3. **Enhanced Debug Logging**
- Shows resume text length and preview
- Tracks Gemini extraction success
- Validates extracted data quality
- Shows exactly what was extracted

---

## 🔍 How to Debug

### Step 1: Open Browser Console
```
Press F12 (or Cmd+Option+J on Mac)
Go to "Console" tab
```

### Step 2: Upload Resume & Watch Logs

Look for these logs when downloading Jake's template:

#### **Check Resume Text Extraction:**
```
📄 Parsing resume data for Jake's template...
📊 Resume text available: YES
📏 Resume text length: 3245 characters
📝 Resume text preview:
[First 500 characters of your resume]
```

**What to Check:**
- ✅ Resume text available: YES
- ✅ Length > 500 characters
- ✅ Preview shows actual resume content

**If NO or length < 50:**
- Problem is with PDF text extraction
- See "Issue 1" below

---

#### **Check Gemini Extraction:**
```
🤖 Calling Gemini AI for resume data extraction...
📥 Received Gemini response, length: 2847
🧹 Cleaned response, searching for JSON...
🎯 Found JSON in response, parsing...
✅ Gemini AI successfully extracted resume data:
   📚 Education entries: 2
   💼 Experience entries: 3
   🚀 Projects: 1
   🛠️ Skills categories: 4
✨ Real data detected! Using Gemini extraction
```

**What to Check:**
- ✅ All steps complete without errors
- ✅ Education entries > 0
- ✅ Experience entries > 0
- ✅ "Real data detected" message

**If you see:**
```
⚠️ Gemini returned placeholder data, using regex fallback
```
- Gemini extracted generic data
- Will use regex fallback instead
- See "Issue 2" below

---

#### **Check Regex Fallback:**
```
📝 Using regex-based extraction
⚠️ No experience extracted from resume, using minimal template
```

**What to Check:**
- This means Gemini extraction failed or returned placeholders
- Regex fallback is running
- May still extract some data if resume is well-formatted

---

## 🐛 Common Issues & Solutions

### Issue 1: Resume Text Not Extracted
**Symptoms:**
```
📏 Resume text length: 0 characters
❌ Resume text too short or missing
```

**Cause**: PDF text extraction failed

**Solution**:
1. Make sure you're uploading a **text-based PDF** (not a scanned image)
2. Try copying text from your PDF - if you can't select text, it's an image
3. If it's an image PDF:
   - Use an OCR tool to convert it
   - Or recreate it as a text PDF

---

### Issue 2: Gemini Returns Placeholder Data
**Symptoms:**
```
⚠️ Gemini returned placeholder data, using regex fallback
```

**Causes:**
- Gemini API key missing
- Resume text is poorly formatted
- Gemini couldn't parse the structure

**Solution**:
1. **Check API Key:**
   ```bash
   # In .env file:
   VITE_GEMINI_API_KEY=your_actual_key_here
   ```

2. **Check Resume Format:**
   - Should have clear section headers: "Education", "Experience", "Skills"
   - Bullet points should use -, *, or •
   - Dates should be clear: "2020-2022", "Jan 2020 - Present"

3. **Manual Edit:**
   - The `.tex` file will have placeholders like `[Your Job Title]`
   - You can edit the `.tex` file directly before compiling
   - Just replace the `[placeholders]` with your real info

---

### Issue 3: Some Data Extracted, Some Missing
**Symptoms:**
```
📚 Education entries: 2  ✅
💼 Experience entries: 0  ❌
```

**Cause**: Some sections parsed successfully, others didn't

**Solution**:
1. **Check Section Headers** in your resume:
   - Use standard names: "Experience", "Work History", "Employment"
   - Not: "My Jobs", "Where I Worked", etc.

2. **Check Bullet Format**:
   - Use: `- Did something`, `• Achieved X`
   - Not: Just paragraphs of text

3. **Manual Edit**:
   - Download the `.tex` file
   - Find the Experience section
   - Replace placeholder with:
   ```latex
   \resumeSubheading
     {Your Job Title}{Jan 2022 - Present}
     {Company Name}{City, State}
     \resumeItemListStart
       \resumeItem{First bullet point}
       \resumeItem{Second bullet point}
     \resumeItemListEnd
   ```

---

## 📝 Example Console Output

### ✅ **Perfect Scenario (Gemini Working):**
```
📄 Parsing resume data for Jake's template...
📊 Resume text available: YES
📏 Resume text length: 3245 characters
📝 Resume text preview:
John Doe
john@email.com | 555-1234
EDUCATION
Stanford University...
🤖 Calling Gemini AI for resume data extraction...
📥 Received Gemini response, length: 2847
🧹 Cleaned response, searching for JSON...
🎯 Found JSON in response, parsing...
✅ Gemini AI successfully extracted resume data:
   📚 Education entries: 2
   💼 Experience entries: 3
   🚀 Projects: 1
   🛠️ Skills categories: 4
✨ Real data detected! Using Gemini extraction
📝 Generating Jake's Resume Template...
```

**Result**: Perfect .tex file with all your real data!

---

### ⚠️ **Fallback Scenario (Regex Extraction):**
```
📄 Parsing resume data for Jake's template...
📊 Resume text available: YES
📏 Resume text length: 3245 characters
🤖 Calling Gemini AI for resume data extraction...
⚠️ Gemini extraction failed: API key not found
📝 Using regex-based extraction
⚠️ No experience extracted from resume, using minimal template
📝 Generating Jake's Resume Template...
```

**Result**: .tex file with placeholders like `[Your Job Title]` - you'll need to manually edit

---

### ❌ **Worst Scenario (No Text):**
```
📄 Parsing resume data for Jake's template...
📊 Resume text available: NO
📏 Resume text length: 0 characters
❌ Resume text too short or missing, skipping Gemini extraction
📝 Using regex-based extraction
📝 Generating Jake's Resume Template...
```

**Result**: Completely generic template - PDF wasn't readable

---

## 🛠️ Manual Editing Guide

If you get placeholders in your `.tex` file, here's how to fill them:

### Education Section:
```latex
\resumeSubheading
  {Stanford University}{Stanford, CA}  ← Replace with your school
  {Bachelor of Science in CS}{2018 - 2022}  ← Replace with your degree
```

### Experience Section:
```latex
\resumeSubheading
  {Software Engineer}{Jan 2022 - Present}  ← Replace with your job & dates
  {Google Inc.}{Mountain View, CA}  ← Replace with your company
  \resumeItemListStart
    \resumeItem{Led team of 8 developers...}  ← Replace with your bullets
    \resumeItem{Increased performance by 45%...}
  \resumeItemListEnd
```

### Skills Section:
```latex
\textbf{Languages}{: Python, JavaScript, Java}  ← Replace with your languages
\textbf{Frameworks}{: React, Django, Node.js}  ← Replace with your frameworks
```

---

## ✅ Quick Checklist

Before contacting support, verify:

- [ ] Opened browser console (F12)
- [ ] Uploaded a text-based PDF (not image)
- [ ] Checked console logs for errors
- [ ] Verified resume text was extracted (length > 500)
- [ ] Checked if Gemini API key is set in `.env`
- [ ] Restarted dev server after adding API key
- [ ] Resume has clear section headers (Education, Experience, Skills)
- [ ] Resume has bullet points (-, *, •)

---

## 🎯 Expected Behavior

### With Gemini AI Working:
- ✅ Extracts education: universities, degrees, dates
- ✅ Extracts experience: jobs, companies, bullet points
- ✅ Extracts projects: names, technologies, descriptions
- ✅ Categorizes skills: languages, frameworks, tools
- ✅ Uses exact wording from your resume
- ✅ No placeholders in `.tex` file

### With Regex Fallback:
- ⚠️ May extract some data if well-formatted
- ⚠️ Misses complex structures
- ⚠️ May have placeholders for missing data
- ⚠️ Still generates valid LaTeX file

### With No Extraction:
- ❌ All placeholders
- ❌ You'll need to manually edit
- ❌ But file structure is still correct
- ✅ Compiles successfully on Overleaf

---

## 📞 Still Having Issues?

### Share These Logs:
1. Open console (F12)
2. Upload resume & download template
3. Copy all console output
4. Share the logs showing:
   - Resume text length
   - Gemini extraction status
   - Any error messages

### Check These:
- Is your resume a text PDF or image PDF?
- Can you copy/paste text from your PDF?
- Is `VITE_GEMINI_API_KEY` set in `.env`?
- Did you restart `npm run dev` after adding key?
- What does console say for "Resume text length"?

---

## 🎉 Success Indicators

You know it's working when:
- ✅ Console shows: "Real data detected! Using Gemini extraction"
- ✅ `.tex` file has your actual university name
- ✅ `.tex` file has your actual job titles
- ✅ `.tex` file has your actual bullet points
- ✅ No `[placeholders]` in the file
- ✅ Compiles beautifully on Overleaf!

---

## 💡 Pro Tips

1. **Use a Well-Formatted Resume**:
   - Clear section headers
   - Bullet points for achievements
   - Standard date formats
   - Text-based PDF

2. **Check Extraction First**:
   - Upload resume
   - Complete analysis
   - Check console logs
   - Then download template

3. **Manual Edit is OK**:
   - Even if extraction fails
   - You can edit the `.tex` file
   - It's just plain text
   - Structure is still perfect

4. **Test on Overleaf**:
   - Upload `.tex` file
   - Click "Recompile"
   - See if it works
   - Edit any issues directly in Overleaf

---

## 🚀 Next Steps

1. **Refresh browser** (Ctrl + F5)
2. **Open console** (F12)
3. **Upload resume**
4. **Complete analysis**
5. **Watch console logs** while downloading template
6. **Share logs if issues persist**

Your `.tex` file should now have REAL data from your resume! 🎊

