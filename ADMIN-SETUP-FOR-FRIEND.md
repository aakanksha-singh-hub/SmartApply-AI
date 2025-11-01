# 🎯 Admin Dashboard Setup - For Your Friend

## ✅ **What Your Friend Needs to Do (2 Minutes)**

Your friend has MongoDB access, so this is super easy!

---

## 📋 **Step-by-Step Instructions:**

### **Step 1: Open MongoDB Shell**

Open terminal/command prompt and type:

```bash
mongosh
```

(If that doesn't work, try `mongo`)

---

### **Step 2: Switch to Database**

```bash
use smartapply-ai
```

---

### **Step 3: Make You Admin**

```bash
db.users.updateOne(
  { username: "admin" },
  { $set: { role: "admin" } }
)
```

You should see:
```
{
  acknowledged: true,
  matchedCount: 1,
  modifiedCount: 1
}
```

---

### **Step 4: Verify It Worked**

```bash
db.users.find({ username: "admin" })
```

You should see your user with `role: 'admin'`

---

### **Step 5: Exit MongoDB**

```bash
exit
```

---

## ✅ **That's It!**

Now you can:

1. **Login** at `localhost:5173/signin`
   - Username: `admin`
   - Password: `Admin123`

2. **Go to** `localhost:5173/admin`

3. **✅ You'll see the admin dashboard!**

---

## 🎬 **Demo the Admin Dashboard:**

Once you're in, show your teacher these 4 sections:

### **1. Dashboard** (`/admin`)
- Shows total users, resumes analyzed
- Popular careers chart
- Quick action buttons

### **2. Career Management** (`/admin/careers`) ⭐ **MOST IMPRESSIVE**
- Click "Add New Career"
- Fill in details (e.g., "Quantum Computing Researcher")
- Click "Create"
- **Say:** "Done! Students can now select this career. No code changes needed!"

### **3. User Management** (`/admin/users`)
- View all registered students
- Search for users
- Click role badge to toggle User ↔ Admin

### **4. Analytics** (`/admin/analytics`)
- User growth chart (last 30 days)
- Popular careers bar chart
- Key metrics

---

## 📝 **Complete MongoDB Commands (Copy-Paste):**

```bash
mongosh
use smartapply-ai
db.users.updateOne({ username: "admin" }, { $set: { role: "admin" } })
db.users.find({ username: "admin" })
exit
```

---

## 🎉 **That's All Your Friend Needs to Do!**

**Total time: 2 minutes**

After that, you can demo the admin dashboard to your teacher! 🚀

