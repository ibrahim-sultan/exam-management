# 🚀 Deployment Guide

This guide covers deploying your Online Examination System to production.

## 📋 Pre-Deployment Checklist

- [ ] All features tested locally
- [ ] Database seeded with initial data
- [ ] Environment variables configured
- [ ] `.gitignore` includes sensitive files
- [ ] README.md updated
- [ ] Code pushed to GitHub

## 🌐 Deployment Options

### Option 1: Vercel (Recommended)

Vercel provides zero-configuration deployment for React applications.

#### Steps:

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Configure project:
     - Framework Preset: Vite
     - Build Command: `npm run build`
     - Output Directory: `dist`

3. **Add Environment Variables**
   - In Vercel project settings
   - Go to "Environment Variables"
   - Add:
     ```
     VITE_SUPABASE_URL=your_supabase_url
     VITE_SUPABASE_ANON_KEY=your_anon_key
     ```

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Visit your live site!

#### Auto-Deploy
Vercel automatically redeploys when you push to GitHub.

---

### Option 2: Netlify

Similar to Vercel, great for React applications.

#### Steps:

1. **Push to GitHub**

2. **Import to Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Connect to GitHub
   - Select your repository

3. **Build Settings**
   - Build command: `npm run build`
   - Publish directory: `dist`

4. **Environment Variables**
   - Go to Site settings → Environment variables
   - Add your Supabase credentials

5. **Deploy**

---

### Option 3: GitHub Pages

Free hosting for static sites.

#### Steps:

1. **Install gh-pages**
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Update package.json**
   ```json
   {
     "homepage": "https://yourusername.github.io/online-examination-system",
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d dist"
     }
   }
   ```

3. **Deploy**
   ```bash
   npm run deploy
   ```

4. **Configure GitHub Pages**
   - Go to repository settings
   - Pages section
   - Select `gh-pages` branch
   - Save

---

## 🔐 Environment Variables

For production, use environment variables for sensitive data.

### Create .env file (Local Development)

```env
# Supabase
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here

# Optional: Analytics
VITE_GA_TRACKING_ID=your_ga_id
```

### Update Code to Use Env Vars

```typescript
// utils/supabase/client.tsx
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'fallback_url';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'fallback_key';
```

## 🗄️ Database Setup (Production)

### Supabase Configuration

1. **Create Production Project**
   - Go to [supabase.com](https://supabase.com)
   - Create new project
   - Note your Project URL and Anon Key

2. **Configure Auth**
   - Go to Authentication → Settings
   - Set up email templates
   - Configure redirect URLs:
     ```
     https://yourdomain.com/**
     http://localhost:3000/**
     ```

3. **Database Setup**
   - The KV store is automatically available
   - Run seed script after deployment
   - Or manually create initial admin user

4. **Row Level Security (Optional)**
   For enhanced security, enable RLS:
   ```sql
   -- Example RLS policies
   ALTER TABLE kv_store_f04930f2 ENABLE ROW LEVEL SECURITY;
   
   CREATE POLICY "Users can read their own data"
   ON kv_store_f04930f2
   FOR SELECT
   USING (auth.uid()::text = (value->>'id')::text);
   ```

## 📊 Post-Deployment Tasks

### 1. Seed Production Database

After deployment:
1. Visit your deployed site
2. Click "Seed Database" button
3. Verify demo accounts work

Or use the API directly:
```bash
curl -X POST https://yoursite.com/api/seed
```

### 2. Create Production Admin

```javascript
// Run in browser console on deployed site
import { authAPI } from './lib/api';

await authAPI.signUp({
  email: 'admin@yourdomain.com',
  password: 'secure_password_here',
  name: 'System Admin',
  role: 'super_admin'
});
```

### 3. Test All Features

- [ ] Admin login
- [ ] Create questions
- [ ] Create exams
- [ ] Student login
- [ ] Take exam
- [ ] View results
- [ ] Monitoring works
- [ ] Anti-cheat features

### 4. Setup Monitoring

Consider adding:
- Error tracking (Sentry)
- Analytics (Google Analytics, Plausible)
- Performance monitoring (Vercel Analytics)

## 🔒 Security Best Practices

### Production Checklist

- [ ] Enable HTTPS (auto with Vercel/Netlify)
- [ ] Use strong passwords for admin accounts
- [ ] Enable email verification in Supabase
- [ ] Set up rate limiting
- [ ] Enable Row Level Security
- [ ] Regular security audits
- [ ] Keep dependencies updated
- [ ] Implement CSP headers
- [ ] Use environment variables for secrets
- [ ] Regular database backups

### Supabase Security Settings

```javascript
// Enable stricter auth settings
{
  "autoConfirmUsers": false,  // Require email verification
  "enableSignups": false,     // Disable public signups
  "sessionTimeout": 3600      // 1 hour sessions
}
```

## 📈 Performance Optimization

### Build Optimization

```json
// vite.config.ts
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu']
        }
      }
    }
  }
}
```

### Image Optimization
- Use WebP format
- Implement lazy loading
- Optimize image sizes
- Use CDN for static assets

### Code Splitting
Already implemented via React.lazy and Suspense (if needed)

## 🔄 Continuous Integration/Deployment

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test
    
    - name: Build
      run: npm run build
      env:
        VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
        VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
    
    - name: Deploy to Vercel
      run: vercel --prod
      env:
        VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
```

## 📱 Mobile Optimization

The app is responsive, but consider:
- PWA setup for mobile app experience
- Push notifications for exam reminders
- Offline support for viewing results

### PWA Setup (Optional)

1. **Create manifest.json**
```json
{
  "name": "Online Examination System",
  "short_name": "Exam System",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#000000",
  "background_color": "#ffffff"
}
```

2. **Add service worker**
3. **Update index.html**

## 🐛 Debugging Production Issues

### Common Issues

**Issue: White screen after deployment**
- Check browser console for errors
- Verify environment variables
- Check build logs

**Issue: API calls failing**
- Verify CORS settings in Supabase
- Check API endpoint URLs
- Confirm environment variables are set

**Issue: Authentication not working**
- Check redirect URLs in Supabase
- Verify auth settings
- Clear browser cache

### Logging

Add production logging:
```typescript
if (import.meta.env.PROD) {
  // Log errors to external service
  window.addEventListener('error', (e) => {
    // Send to error tracking service
  });
}
```

## 📊 Monitoring & Analytics

### Setup Analytics

```typescript
// Analytics wrapper
export const trackEvent = (event: string, data?: any) => {
  if (import.meta.env.PROD && window.gtag) {
    window.gtag('event', event, data);
  }
};

// Usage
trackEvent('exam_submitted', { examId, score });
```

### Performance Monitoring

```typescript
// Track page load time
window.addEventListener('load', () => {
  const loadTime = performance.now();
  trackEvent('page_load', { time: loadTime });
});
```

## 🔄 Updating Deployed App

```bash
# Make changes locally
git add .
git commit -m "Update: description"
git push origin main

# Vercel/Netlify auto-deploys
# Or manually trigger deployment
```

## 📦 Backup Strategy

1. **Database Backups**
   - Supabase provides automatic backups
   - Export data regularly
   - Store backups securely

2. **Code Backups**
   - GitHub serves as code backup
   - Tag releases
   - Keep production branch stable

## ✅ Launch Checklist

Before going live:

- [ ] All features tested in production
- [ ] Database seeded
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active
- [ ] Error tracking setup
- [ ] Analytics configured
- [ ] Backup strategy in place
- [ ] Documentation updated
- [ ] Team trained
- [ ] Support plan ready

## 🎉 You're Live!

Congratulations on deploying your Online Examination System!

### Next Steps:
1. Monitor initial usage
2. Gather user feedback
3. Plan improvements
4. Regular maintenance
5. Scale as needed

---

Need help? Check the troubleshooting section or open an issue on GitHub.
