# 🎓 Admin Dashboard - Teacher's Guide

## 📋 Complete Guide for SmartApply AI Administration

---

## 🚀 **Quick Start**

### **Step 1: Create Your First Admin Account**

Since this is the first time, you'll need to manually create an admin account in the database:

**Option A: Using MongoDB Compass (GUI)**
1. Open MongoDB Compass
2. Connect to your database
3. Find the `users` collection
4. Find your user account (search by email/username)
5. Click "Edit Document"
6. Add a new field: `"role": "admin"`
7. Click "Update"

**Option B: Using MongoDB Shell**
```bash
# Open MongoDB shell
mongosh

# Switch to your database
use smartapply-ai

# Update a user to admin
db.users.updateOne(
  { username: "teacher@example.com" },
  { $set: { role: "admin" } }
)
```

**Option C: Sign Up Normally, Then Promote**
1. Sign up at http://localhost:5173/signup
2. Use MongoDB to change your role to "admin" (see Option A or B)
3. Log out and log in again

---

## 🔐 **Accessing the Admin Dashboard**

### **Login**
1. Go to: `http://localhost:5173/signin`
2. Sign in with your admin account
3. Navigate to: `http://localhost:5173/admin`

**Direct URL**: `http://localhost:5173/admin`

---

## 🎯 **Admin Dashboard Features**

### **1. Dashboard (Overview)**
**URL**: `/admin`

**What you see:**
- 📊 **Total Users** - How many students have signed up
- 📄 **Resumes Analyzed** - Total resume submissions
- 📈 **New Sign-ups Today/Week** - Recent activity
- ⭐ **Average Resume Score** - Platform performance
- 🎯 **Popular Careers** - Top 5 career choices
- ⚡ **Quick Actions** - Navigate to other sections

**Use Case:**
- Get a quick overview of platform usage
- See which careers are most popular
- Monitor daily/weekly growth

---

### **2. User Management**
**URL**: `/admin/users`

**Features:**
- ✅ **View All Users** - See all registered students
- 🔍 **Search Users** - Find users by name, email, or career
- 🗑️ **Delete Users** - Remove inactive/test accounts
- 👑 **Change User Roles** - Promote users to admin or demote to user
- 📄 **Pagination** - Navigate through large user lists

**What you can see for each user:**
- Name and email
- Career interest
- Join date
- Current role (User/Admin)

**Actions:**
- **Delete**: Remove a user permanently
- **Toggle Role**: Click on the role badge to change between User ↔ Admin

**Use Case:**
- Monitor student enrollments
- Remove test accounts
- Give teaching assistants admin access

---

### **3. Job Management** ⭐ (Most Important for Teachers)
**URL**: `/admin/careers`

**This is where you add new careers/jobs to the system!**

#### **Add New Career:**
1. Click "Add New Career" button
2. Fill in the form:

**Required Fields:**
- **Career ID**: Unique identifier (e.g., `data-scientist`)
- **Job Title**: Display name (e.g., `Data Scientist`)
- **Domain**: Category (e.g., `Technology`, `Healthcare`)
- **Subdomain**: Subcategory (e.g., `Data & Analytics`)
- **Description**: Brief overview of the role

**Optional Fields:**
- **Min/Max Salary**: Salary range
- **Growth Outlook**: e.g., "High", "15% annually"
- **Skills**: Comma-separated (e.g., `Python, SQL, Machine Learning`)
- **Experience Levels**: e.g., `Entry, Mid, Senior`
- **Active**: Toggle to show/hide from users

3. Click "Create Career"

#### **Edit Career:**
1. Find the career card
2. Click the Edit (pencil) icon
3. Update fields
4. Click "Update Career"

#### **Delete Career:**
1. Find the career card
2. Click the Delete (trash) icon
3. Confirm deletion

**Use Case:**
- Add emerging job roles (AI Engineer, Blockchain Developer)
- Update salary information
- Add careers specific to your region/industry
- Hide outdated careers without deleting them

---

### **4. Analytics**
**URL**: `/admin/analytics`

**Charts & Insights:**
- 📈 **User Growth Chart** - Daily sign-ups over last 30 days
- 📊 **Popular Careers Chart** - Top 10 career choices with percentages
- 🎯 **Key Metrics** - Total users, resumes, average scores

**Use Case:**
- Present platform success to stakeholders
- Identify trending careers
- Track platform adoption over time
- Generate reports for administration

---

## 📊 **Example Workflows**

### **Workflow 1: Adding a New Career (e.g., Prompt Engineer)**

```
1. Go to /admin/careers
2. Click "Add New Career"
3. Fill in:
   - ID: prompt-engineer
   - Title: Prompt Engineer
   - Domain: Technology
   - Subdomain: Artificial Intelligence
   - Description: Design and optimize prompts for AI systems...
   - Min Salary: 80000
   - Max Salary: 150000
   - Growth: High, 25% annually
   - Skills: LLM, Python, Prompt Design, AI Ethics
   - Experience Levels: Entry, Mid, Senior
   - Active: ✓ (checked)
4. Click "Create Career"
5. ✅ Done! Students can now select this career
```

### **Workflow 2: Monitoring Student Progress**

```
1. Go to /admin (Dashboard)
2. Check "Total Users" - See how many students enrolled
3. Check "Popular Careers" - See what students are interested in
4. Go to /admin/users
5. Search for specific students
6. Review their career choices
7. Go to /admin/analytics
8. View user growth chart
9. Generate insights for your report
```

### **Workflow 3: Managing Users**

```
1. Go to /admin/users
2. Search for "test" to find test accounts
3. Delete test accounts (trash icon)
4. Find a teaching assistant's account
5. Click their "User" role badge
6. Promote to "Admin"
7. ✅ They now have admin access!
```

---

## 🔒 **Security & Best Practices**

### **Admin Account Security:**
- ✅ Use strong passwords (minimum 6 characters, with uppercase/number)
- ✅ Don't share admin credentials with students
- ✅ Create separate admin accounts for each teacher/TA
- ✅ Regularly review who has admin access

### **Data Management:**
- ⚠️ **Deleting users is permanent** - Always confirm before deleting
- ✅ Use the "Active" toggle for careers instead of deleting
- ✅ Back up your database regularly
- ✅ Test new careers with "Active: false" before showing to students

### **Career Management Best Practices:**
1. **Use consistent naming**: `job-title-format` (lowercase, hyphens)
2. **Research before adding**: Verify salary and growth data
3. **Keep descriptions brief**: 1-2 sentences maximum
4. **Update regularly**: Salary ranges change over time
5. **Categorize properly**: Correct domain/subdomain helps students

---

## 🎓 **Use Cases for Teachers**

### **For Computer Science Class:**
```
Add careers:
- Software Engineer
- Data Scientist
- Cybersecurity Analyst
- DevOps Engineer
- Cloud Architect
- AI/ML Engineer
```

### **For Business Class:**
```
Add careers:
- Business Analyst
- Product Manager
- Marketing Manager
- Financial Analyst
- Management Consultant
```

### **For Healthcare Class:**
```
Add careers:
- Registered Nurse
- Physician
- Healthcare Administrator
- Medical Researcher
- Public Health Specialist
```

---

## 📞 **Common Questions**

### **Q: How do I see what careers are already in the system?**
A: Go to `/admin/careers`. All existing careers are displayed as cards.

### **Q: Can I edit a career after creating it?**
A: Yes! Click the Edit (pencil) icon on any career card.

### **Q: What if I accidentally delete something?**
A: Deletions are permanent. Always confirm before deleting. For careers, use "Active: false" instead.

### **Q: How do I give another teacher admin access?**
A: 
1. Ask them to sign up normally
2. Go to `/admin/users`
3. Find their account
4. Click their "User" role badge
5. It changes to "Admin"

### **Q: Can students see the admin dashboard?**
A: No. Only users with `role: "admin"` can access `/admin` pages.

### **Q: How do I remove someone's admin access?**
A: Same as giving it - click their "Admin" badge, it changes to "User".

### **Q: Where is the data stored?**
A: All data is in MongoDB:
- Users → `users` collection
- Careers → `careers` collection

---

## 🐛 **Troubleshooting**

### **Problem: "Access denied. Admin privileges required"**
**Solution**: Your account doesn't have admin role. Use MongoDB to set `role: "admin"`.

### **Problem: Can't see admin dashboard after logging in**
**Solution**: 
1. Log out completely
2. Clear browser cache (Ctrl + Shift + Delete)
3. Log in again
4. Navigate to `/admin`

### **Problem: Changes not showing up**
**Solution**: Refresh the page (Ctrl + F5 for hard refresh).

### **Problem: Career creation fails**
**Solution**: 
- Check if Career ID is unique (no spaces, no duplicates)
- Ensure all required fields are filled
- Try a simpler ID (e.g., "test-career-1")

---

## 🎯 **Quick Reference**

| Page | URL | Purpose |
|------|-----|---------|
| **Dashboard** | `/admin` | Overview & stats |
| **Users** | `/admin/users` | Manage students |
| **Careers** | `/admin/careers` | Add/edit jobs |
| **Analytics** | `/admin/analytics` | View charts |

| Action | How To |
|--------|--------|
| **Add Career** | `/admin/careers` → "Add New Career" |
| **Edit Career** | Click pencil icon on career card |
| **Delete Career** | Click trash icon (permanent!) |
| **Make Admin** | `/admin/users` → Click user's role badge |
| **Delete User** | `/admin/users` → Click trash icon |
| **Search Users** | `/admin/users` → Search box at top |

---

## 🚀 **Getting Started Checklist**

- [ ] Create your admin account (update MongoDB)
- [ ] Log in at `/signin`
- [ ] Navigate to `/admin`
- [ ] Explore the Dashboard
- [ ] Go to `/admin/careers`
- [ ] Add your first career
- [ ] Test: Try searching for it on the main site
- [ ] Go to `/admin/users`
- [ ] Review registered users
- [ ] Go to `/admin/analytics`
- [ ] Check the charts

---

## 📝 **Notes**

- All changes are **immediate** - no need to restart the server
- The admin dashboard is **responsive** - works on tablets/phones
- All actions are **logged** to the console for debugging
- **Backup your database** before making bulk changes

---

## ✅ **You're All Set!**

The admin dashboard is now fully functional. You can:
- ✅ Monitor student enrollments
- ✅ Add new career opportunities
- ✅ View analytics and insights
- ✅ Manage user accounts
- ✅ Track platform growth

**Admin Dashboard URL**: `http://localhost:5173/admin`

**Happy administrating! 🎉**

