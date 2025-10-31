# ⚡ Quick Start Guide

Get your Online Examination System up and running in 5 minutes!

## 🎯 TL;DR

```bash
# Your app is already connected to Supabase!
# Just seed the database and start using it.

# 1. Open the app
# 2. You'll see the login page
# 3. First time? You need to seed the database
# 4. Use the test credentials to login
```

## 📋 First-Time Setup (3 Steps)

### Step 1: Seed the Database 🌱

**Option A: Use the Seeder Component (Easiest)**
1. Open your browser console (F12)
2. Run this command:
   ```javascript
   import('./lib/seedData.js').then(m => m.seedDatabase())
   ```
3. Wait for "Database seeding completed!" message

**Option B: Login as Admin First**
1. Try logging in as admin (even before seeding)
2. You'll get an error - that's expected
3. Open console and run the seed command above

### Step 2: Login 🔐

Use these test credentials:

**Admin Account**
```
Email: admin@exam.com
Password: admin123
```

**Student Account**
```
Email: student@exam.com
Password: student123
```

### Step 3: Explore! 🎉

You're all set! Start exploring the features.

---

## 🚀 Common Tasks

### Create a New Question

1. Login as Admin
2. Click "Questions" in sidebar
3. Click "Add Question"
4. Fill in:
   - Question text
   - Type (Multiple Choice, True/False, etc.)
   - Options (if applicable)
   - Correct answer
   - Category and difficulty
   - Points
5. Click "Add Question"

### Create a New Exam

1. Login as Admin
2. Click "Exams" in sidebar
3. Click "Create New Exam"
4. Fill in:
   - Title
   - Description
   - Duration (minutes)
   - Passing marks
5. Select questions
6. Configure settings:
   - Randomization
   - Anti-cheat features
   - Result visibility
7. Click "Create Exam"

### Take an Exam (as Student)

1. Login as Student
2. See available exams on dashboard
3. Click "Start Exam"
4. Read instructions
5. Answer questions
6. Navigate with Previous/Next buttons
7. Click "Submit Exam" when done

### View Results

**As Student:**
1. Dashboard shows completed exams
2. Click to view detailed results
3. See score and breakdown

**As Admin:**
1. Click "Results" in sidebar
2. See all submissions
3. Filter by exam or student
4. Export data

### Monitor Active Exams

1. Login as Admin
2. Click "Monitoring" in sidebar
3. See active exam sessions
4. View student activity
5. Check for warnings

---

## 👥 User Management

### Create a Student Account

**Via Admin Panel:**
1. Login as Admin
2. Click "Students" in sidebar
3. Click "Add Student"
4. Fill in details:
   - Name
   - Email
   - Student ID
   - Course
   - Year
5. Click "Add Student"
6. Default password: `student123`
7. Share credentials with student

### Create Admin/Moderator

Use the browser console:
```javascript
import { authAPI } from './lib/api';

await authAPI.signUp({
  email: 'newadmin@exam.com',
  password: 'securepassword',
  name: 'New Admin Name',
  role: 'super_admin'  // or 'moderator'
});
```

---

## 🔍 Troubleshooting

### Can't Login?

**Problem:** "Invalid credentials" error  
**Solution:** Make sure you've run the seed script first

**Problem:** Still can't login after seeding  
**Solution:** 
1. Check browser console for errors
2. Try clearing browser cache
3. Make sure you're using correct credentials

### No Questions/Exams Showing?

**Problem:** Lists are empty  
**Solution:** Seed script might have failed
- Check console for errors
- Try running seed script again
- Manually create a question

### Student Can't See Exam?

**Problem:** Exam not visible to student  
**Solution:** 
1. Check exam status is "published"
2. Verify exam dates (start/end time)
3. Make sure exam has questions assigned

---

## 📱 Features Overview

| Feature | Admin | Student |
|---------|-------|---------|
| Dashboard with stats | ✅ | ✅ |
| Create questions | ✅ | ❌ |
| Create exams | ✅ | ❌ |
| Manage students | ✅ | ❌ |
| Take exams | ❌ | ✅ |
| View all results | ✅ | Own only |
| Monitor sessions | ✅ | ❌ |
| Anti-cheat detection | ✅ | Enforced |

---

## 🎓 Test Scenarios

### Test 1: Create and Take Exam (5 min)

1. **As Admin:**
   - Create 3-5 questions
   - Create an exam with those questions
   - Set duration to 5 minutes
   - Publish exam

2. **As Student:**
   - Login
   - See exam on dashboard
   - Click "Start Exam"
   - Answer questions
   - Submit

3. **As Admin:**
   - Check monitoring (should see active session)
   - After submission, check results

### Test 2: Anti-Cheat Features (2 min)

1. **As Student:**
   - Start an exam with anti-cheat enabled
   - Try switching browser tab
   - Try copy-pasting text
   - See warning messages

2. **As Admin:**
   - Go to monitoring
   - See warnings logged

### Test 3: Bulk Operations (3 min)

1. **As Admin:**
   - Create 5 students via student management
   - Create 10 questions in different categories
   - Create 2 exams with different settings

---

## 🔑 All Test Credentials

After running seed script:

```
# Admins
admin@exam.com / admin123
moderator@exam.com / mod123

# Students  
student@exam.com / student123
alice@student.com / student123
bob@student.com / student123
carol@student.com / student123
david@student.com / student123
emma@student.com / student123
```

---

## 📚 Next Steps

1. ✅ Seed database
2. ✅ Login and explore
3. ✅ Create your own questions
4. ✅ Create your own exams
5. ✅ Test with student account
6. 📖 Read full documentation
7. 🎨 Customize theme (optional)
8. 🚀 Deploy to production
9. 📱 Push to GitHub

---

## 🆘 Need Help?

**Quick Fixes:**
- Refresh the page
- Clear browser cache
- Check console for errors
- Re-run seed script

**Documentation:**
- `README.md` - Full overview
- `SETUP_GUIDE.md` - Detailed setup
- `SUPABASE_INTEGRATION.md` - Technical details
- `DEPLOYMENT.md` - Going to production

**Support:**
- Check existing issues on GitHub
- Create new issue with details
- Include console errors in report

---

## 💡 Pro Tips

1. **Start Simple**
   - Create 2-3 questions first
   - Make a short 5-minute test exam
   - Test the full flow

2. **Use Categories**
   - Organize questions by topic
   - Makes exam creation easier
   - Better analytics

3. **Test Anti-Cheat**
   - Enable features gradually
   - Test with student account
   - Adjust based on needs

4. **Monitor First Exam**
   - Watch the monitoring panel
   - See how students interact
   - Adjust settings accordingly

5. **Export Data**
   - Regularly backup results
   - Export for analysis
   - Keep records

---

## ✅ Launch Checklist

Before using with real students:

- [ ] Database seeded successfully
- [ ] All demo accounts work
- [ ] Created at least 5 questions
- [ ] Created at least 1 exam
- [ ] Tested exam taking flow
- [ ] Verified auto-grading works
- [ ] Checked monitoring features
- [ ] Reviewed anti-cheat settings
- [ ] Set up student accounts
- [ ] Tested from student perspective

---

## 🎉 You're Ready!

Your Online Examination System is all set up and ready to use!

**Remember:**
- This is for educational/demo purposes
- Don't store sensitive personal data
- Use strong passwords in production
- Regular backups recommended

Happy examining! 🎓

---

**Quick Links:**
- [Full Documentation](README.md)
- [Setup Guide](SETUP_GUIDE.md)
- [Supabase Integration](SUPABASE_INTEGRATION.md)
- [Deployment Guide](DEPLOYMENT.md)
