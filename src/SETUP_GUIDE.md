# 🚀 Setup Guide - Online Examination System

This guide will help you set up the Online Examination System with Supabase backend.

## 📝 Overview

Your examination system is now connected to Supabase and ready to use! Here's what has been integrated:

✅ **Supabase Authentication** - Real user login/logout  
✅ **Database Backend** - All data persists to Supabase  
✅ **API Server** - Edge functions handling all operations  
✅ **Auto-Grading** - Automatic exam scoring  
✅ **Real-time Features** - Live monitoring and updates

## 🎯 Quick Start

### Step 1: Run the Seed Script

The first time you use the system, you need to populate the database with initial data.

**Option A: Automatic Seeding (Easiest)**
1. The app will detect an empty database
2. You'll see a "Seed Database" button
3. Click it to create demo data automatically

**Option B: Manual Seeding via Console**
1. Open browser developer console (F12)
2. Run: 
   ```javascript
   import('./lib/seedData.js').then(m => m.seedDatabase())
   ```

### Step 2: Login with Demo Accounts

After seeding, use these credentials:

**🔑 Admin Account**
- Email: `admin@exam.com`
- Password: `admin123`
- Access: Full system control

**🔑 Moderator Account**
- Email: `moderator@exam.com`  
- Password: `mod123`
- Access: Question and exam management

**🔑 Student Account**
- Email: `student@exam.com`
- Password: `student123`
- Access: Take exams and view results

## 📊 What Gets Created

The seed script creates:

### Users (8 total)
- 1 Super Admin
- 1 Moderator
- 1 Student (demo account)
- 5 Additional Students (Alice, Bob, Carol, David, Emma)

### Questions (10 total)
- Geography: 1 question
- Programming: 4 questions
- Web Development: 3 questions
- Algorithms: 1 question
- Databases: 1 question

### Exams (2 total)
1. **Web Development Fundamentals**
   - 30 minutes
   - 6 questions
   - 10 points total
   - Passing: 6 points (60%)

2. **Programming Concepts Quiz**
   - 45 minutes
   - 7 questions
   - 15 points total
   - Passing: 9 points (60%)

## 🎓 Using the System

### As Admin/Moderator

1. **Create Questions**
   - Go to "Questions" menu
   - Click "Add Question"
   - Fill in question details
   - Save

2. **Create Exams**
   - Go to "Exams" menu
   - Click "Create New Exam"
   - Set exam details (title, duration, etc.)
   - Select questions
   - Configure settings (randomization, anti-cheat)
   - Publish

3. **Monitor Exams**
   - Go to "Monitoring" menu
   - View active exam sessions
   - Track student activity
   - Check for violations

4. **View Results**
   - Go to "Results" menu
   - See all submissions
   - Export data
   - Analyze performance

### As Student

1. **View Available Exams**
   - Login to student dashboard
   - See list of published exams
   - Check deadlines

2. **Take an Exam**
   - Click "Start Exam"
   - Read instructions
   - Answer questions
   - Use navigation to move between questions
   - Submit when complete

3. **View Results**
   - Check dashboard for completed exams
   - View scores and feedback
   - Review answers (if enabled)

## 🔐 Creating New Users

### Create Student via Admin Panel
1. Login as Admin/Moderator
2. Go to "Students" menu
3. Click "Add Student"
4. Enter student details:
   - Name
   - Email
   - Student ID
   - Course
   - Year
5. System creates account with default password: `student123`

### Create Admin/Moderator via API
Use the signup endpoint with role parameter:

```javascript
// Admin signup
await authAPI.signUp({
  email: 'newadmin@exam.com',
  password: 'securepassword',
  name: 'New Admin',
  role: 'super_admin' // or 'moderator'
});
```

## 📱 Testing the System

### Test Scenario 1: Complete Exam Flow
1. Login as Admin
2. Create a new exam with 3-5 questions
3. Set duration to 10 minutes
4. Publish the exam
5. Logout
6. Login as Student
7. Take the exam
8. Submit answers
9. View results
10. Logout
11. Login as Admin
12. Check monitoring and results

### Test Scenario 2: Anti-Cheat Features
1. Login as Student
2. Start an exam with anti-cheat enabled
3. Try switching tabs → Warning logged
4. Admin can see warnings in monitoring

### Test Scenario 3: Auto-Grading
1. Login as Student
2. Take an exam with known answers
3. Submit exam
4. Immediately see score
5. Verify correct/incorrect marking

## 🔧 Troubleshooting

### Issue: "Unauthorized" Error
**Solution:** Session expired. Logout and login again.

### Issue: No Exams Showing for Student
**Solution:** Check exam status is "published" and date range is valid.

### Issue: Questions Not Loading
**Solution:** Verify you're logged in as Admin/Moderator.

### Issue: Exam Won't Submit
**Solution:** Check internet connection. Data is auto-saved.

### Issue: Seed Script Fails
**Solution:** Check console for errors. May need to clear existing data first.

## 🌐 Pushing to GitHub

### Before Pushing

1. Verify `.gitignore` is in place
2. Never commit API keys or secrets
3. Use environment variables for sensitive data

### Safe to Commit
✅ All React components  
✅ UI library files  
✅ Configuration files  
✅ Documentation  
✅ Public assets

### DO NOT Commit
❌ `.env` files  
❌ `node_modules/`  
❌ Personal API keys  
❌ Database credentials

### GitHub Setup

```bash
# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Online Examination System"

# Add remote
git remote add origin https://github.com/yourusername/online-examination-system.git

# Push
git push -u origin main
```

## 🔐 Environment Variables (For Production)

Create a `.env` file (already in .gitignore):

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

Update code to use env vars:
```typescript
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
```

## 📚 Next Steps

1. ✅ Seed the database
2. ✅ Test all features
3. ✅ Create your own questions and exams
4. ✅ Customize the theme (optional)
5. ✅ Push to GitHub
6. 📱 Deploy to Vercel/Netlify (optional)
7. 🚀 Share your project!

## 💡 Pro Tips

- **Backup Data:** Export results regularly
- **Test Thoroughly:** Try all features before production use
- **Monitor Usage:** Check Supabase dashboard for usage stats
- **Update Regularly:** Keep dependencies updated
- **Document Changes:** Update README when adding features

## 🆘 Need Help?

- Check the console for error messages
- Review the API logs in Supabase dashboard
- Open an issue on GitHub
- Check Supabase documentation

## 🎉 You're All Set!

Your Online Examination System is ready to use. Enjoy creating and managing exams!

---

**Remember:** This is for educational purposes. Do not store sensitive personal information in this demo environment.
