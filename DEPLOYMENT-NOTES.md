# 🚀 Deployment Notes - Personal Reference

**⚠️ PRIVATE DOCUMENT - DO NOT COMMIT TO GIT**

---

## 📦 Vercel Deployment Guide

### First Time Setup
```bash
# Install Vercel CLI globally (one time only)
npm install -g vercel

# Login to Vercel (one time only)
vercel login
```

### Deploying to Production

#### Option 1: Deploy Current Code
```bash
# Deploy whatever is in your local directory right now
vercel --prod
```

#### Option 2: Let Git Handle It (Recommended!)
```bash
# Just push to GitHub and Vercel auto-deploys
git add .
git commit -m "Your commit message"
git push origin main
```

#### Option 3: Preview Deploy (Test Before Production)
```bash
# Creates a preview URL to test changes
vercel

# If it looks good, promote to production
vercel --prod
```

---

## 🔗 Deployment History & Checkpoints

### v0.4.0 - RxNav Autocomplete Complete 🎉
- **Deployed:** October 11, 2025
- **Production URL:** https://clari-l10x0kfgd-aaron-cs-projects-2e9c6868.vercel.app
- **Status:** ✅ LIVE AND LOOKING GOOD!
- **Features:**
  - RxNav API autocomplete integration
  - Generic (SCD) and Brand (SBD) drug lookup
  - Auto-fill dosage from drug name
  - Green "✓ Verified" badge on validated medications
  - Stores RxCUI codes for future interaction checking
- **LinkedIn Flex Status:** Ready to brag! 💪

### v0.3.0 - Edit & Search Complete
- **Features:**
  - Edit medication functionality
  - Real-time search/filter
  - Professional UI polish

### v0.2.0 - UI Overhaul
- **Features:**
  - Centered layout
  - Beautiful cards
  - Professional design

### v0.1.0 - MVP
- **Features:**
  - Basic CRUD operations
  - localStorage persistence

---

## 🎯 Quick Commands Cheatsheet

```bash
# Check Vercel CLI version
vercel --version

# See all your Vercel projects
vercel list

# Check deployment status
vercel inspect [deployment-url]

# Remove a deployment
vercel remove [deployment-name]

# Link project to existing Vercel project
vercel link

# Pull environment variables from Vercel
vercel env pull

# View logs
vercel logs [deployment-url]
```

---

## 🔧 Troubleshooting

### Build Failed with ESLint Error
- **Problem:** Quote marks need escaping in JSX
- **Solution:** Replace `"` with `&quot;` in JSX text content

### Changes Not Showing Up
1. Clear browser cache (Ctrl + Shift + R)
2. Check if deployment succeeded: `vercel list`
3. Make sure you pushed to the right branch

### "Command Not Found: vercel"
```bash
# Reinstall Vercel CLI
npm install -g vercel
```

---

## 📝 Pre-Deployment Checklist

Before running `vercel --prod`:
- [ ] Test locally: `npm run dev`
- [ ] Check for TypeScript errors: `npm run build`
- [ ] Update version in README.md
- [ ] Update CHANGELOG (if you make one)
- [ ] Commit all changes to Git
- [ ] Update this deployment notes doc with new URL

---

## 🎓 LinkedIn Brag Template

```
🚀 Excited to share my latest project: ClariMed - A medication tracker that bridges my pharmacy technician experience with my CS education at UTEP!

✨ Features:
• Real-time medication validation using NIH's RxNorm database
• Smart autocomplete with 26,000+ medications
• Built with Next.js, TypeScript, and RxNav REST API

💊 Combining my 1 year of experience as a pharmacy tech with senior-level CS skills to solve real healthcare problems.

🔗 Live demo: https://clari-l10x0kfgd-aaron-cs-projects-2e9c6868.vercel.app/

#HealthTech #Pharmacy #ComputerScience #UTEP #WebDevelopment #TypeScript #NextJS
```

---

## 🔐 Environment Variables (Future)

When you need to add secrets:
```bash
# Add environment variable to Vercel
vercel env add [VARIABLE_NAME]

# Pull them locally for development
vercel env pull .env.local
```

---

## 🌐 Custom Domain (Future)

When you're ready for a custom domain:
1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your domain (e.g., clarimed.com)
3. Update DNS records as instructed
4. Wait for SSL certificate (automatic)

---

**Last Updated:** October 11, 2025
**Current Version:** 0.4.0
**Production URL:** https://clari-l10x0kfgd-aaron-cs-projects-2e9c6868.vercel.app
**Status:** ✅ LIVE - Ready for LinkedIn!
