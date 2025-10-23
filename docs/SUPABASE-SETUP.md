# 🚀 Supabase Setup Guide for ClariMed

Follow these steps to set up your Supabase project and connect ClariMed to your database.

---

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click **"Start your project"** or **"Sign in"** if you have an account
3. Click **"New project"**
4. Fill in the details:
   - **Name:** `ClariMed` (or whatever you prefer)
   - **Database Password:** Choose a strong password (save this!)
   - **Region:** Choose closest to you (e.g., `US East` for East Coast)
   - **Pricing Plan:** Select **Free** tier (perfect for development)
5. Click **"Create new project"**
6. Wait 2-3 minutes for project to be created

---

## Step 2: Get Your API Credentials

1. In your Supabase project dashboard, click the **Settings** icon (⚙️) in the left sidebar
2. Click **API** under Project Settings
3. You'll see two important values:
   - **Project URL** (looks like: `https://abcdefghijklmnop.supabase.co`)
   - **anon public** key (long string starting with `eyJ...`)

**Keep this tab open - you'll need these values in Step 4!**

---

## Step 3: Run the Database Migration

1. In your Supabase project, click **SQL Editor** in the left sidebar
2. Click **"+ New query"**
3. Open the file: `lib/supabase/migrations/001_initial_schema.sql`
4. Copy the ENTIRE contents of that file
5. Paste it into the Supabase SQL Editor
6. Click **"Run"** (or press `Ctrl+Enter`)
7. You should see: **"Success. No rows returned"**

This creates all your database tables with proper security!

---

## Step 4: Configure Environment Variables

1. In your ClariMed project, copy `.env.local.example` to `.env.local`:
   ```bash
   copy .env.local.example .env.local
   ```

2. Open `.env.local` and fill in your values from Step 2:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

3. Save the file

4. **IMPORTANT:** Make sure `.env.local` is in your `.gitignore` (it should be by default)

---

## Step 5: Configure Email Settings

### For Development (Use Native Sender)

**You're currently using Supabase's built-in email service** - this is perfect for development!

By default, Supabase sends verification emails from `noreply@mail.app.supabase.io`. This works out of the box with:
- ✅ Email verification
- ✅ Password reset emails
- ✅ Magic link authentication
- ✅ Email change confirmations

**No configuration needed for development!**

You can customize the email templates:
1. In Supabase dashboard, go to **Authentication** → **Email Templates**
2. You'll see templates for:
   - Confirm signup
   - Magic link
   - Change email address
   - Reset password
3. Customize the text and styling if you want (optional)

### ⚠️ For Production (SMTP Required)

**Important:** Supabase's native email sender has rate limits and may not be reliable for production use. 

**Before deploying to production, you MUST set up custom SMTP:**

1. Choose an email service provider:
   - **SendGrid** (Recommended - 100 free emails/day)
   - **Amazon SES** (Very cheap, $0.10 per 1000 emails)
   - **Mailgun** (Good for higher volume)
   - **Resend** (Developer-friendly)

2. Get SMTP credentials from your provider

3. Configure in Supabase:
   - Go to **Authentication** → **Settings** → **SMTP Settings**
   - Enable "Use custom SMTP"
   - Fill in:
     - SMTP Host (e.g., `smtp.sendgrid.net`)
     - SMTP Port (usually `587` for TLS)
     - SMTP Username
     - SMTP Password
     - Sender email (e.g., `noreply@clarimed.com`)
     - Sender name (e.g., `ClariMed`)

4. Test the connection with the "Send test email" button

**Why SMTP is needed for production:**
- More reliable delivery
- Higher rate limits
- Better deliverability (less likely to be marked as spam)
- Custom sender domain (looks more professional)
- Detailed delivery analytics
- Better reputation management

---

## Step 6: Test the Connection

1. Restart your Next.js dev server:
   ```bash
   npm run dev
   ```

2. Open your browser to `http://localhost:3000`

3. Open the browser console (F12)

4. You should NOT see any Supabase connection errors

---

## Step 7: Verify Database Tables

1. In Supabase dashboard, click **Table Editor** in left sidebar
2. You should see these tables:
   - ✅ `user_profiles`
   - ✅ `allergies`
   - ✅ `medications`

3. Click on each table to see the columns match our schema

---

## Step 8: Test Row Level Security

To verify RLS is working:

1. In Supabase, go to **Authentication** → **Policies**
2. Select the `medications` table
3. You should see 4 policies:
   - ✅ Users can view own medications
   - ✅ Users can insert own medications
   - ✅ Users can update own medications
   - ✅ Users can delete own medications

---

## Troubleshooting

### "Invalid API key" error
- Double-check you copied the **anon public** key, not the service_role key
- Make sure there are no extra spaces in `.env.local`
- Restart your dev server after changing `.env.local`

### "Failed to create extension uuid-ossp"
- This is normal if the extension already exists
- You can safely ignore this error

### SQL migration fails
- Make sure you copied the ENTIRE file contents
- Check for any syntax errors in the SQL
- Try running the migration in smaller chunks (one table at a time)

### Can't see environment variables in browser
- `NEXT_PUBLIC_` variables are accessible in browser
- Regular variables (without `NEXT_PUBLIC_`) are server-side only
- Restart dev server after changing `.env.local`

---

## Security Checklist

✅ **Do NOT commit `.env.local` to Git**  
✅ **Do NOT share your anon key publicly** (it's okay for client-side use though)  
✅ **Do NOT share your service_role key** (only use server-side, never commit)  
✅ **Enable Row Level Security on all tables** (done in migration)  
✅ **Use HTTPS in production** (Vercel provides this automatically)

---

## Next Steps

Once you've completed this setup:

1. ✅ Your database is ready
2. ✅ Authentication is configured
3. ✅ Row Level Security is enabled
4. ✅ Environment variables are set

**Now we can build the signup/login UI!**

Return to the main development and let me know when you're ready to continue. I'll create the authentication pages next.

---

## Useful Supabase Dashboard Links

- **SQL Editor:** For running queries and migrations
- **Table Editor:** View and edit data visually
- **Authentication:** Manage users and auth settings
- **API Docs:** Auto-generated API documentation for your tables
- **Database → Roles:** View RLS policies and permissions

---

## Production Checklist (For Later)

When you're ready to deploy:

### Critical (Must Do Before Launch)
- [ ] **Set up custom SMTP** (SendGrid, Amazon SES, etc.) - Native email won't cut it!
- [ ] Configure custom domain for auth redirects (e.g., `app.clarimed.com`)
- [ ] Update email templates with your branding
- [ ] Test all email flows (signup, password reset, etc.)
- [ ] Enable HTTPS (Vercel does this automatically)

### Security
- [ ] Review and tighten RLS policies if needed
- [ ] Enable 2FA for your Supabase account
- [ ] Rotate API keys if they were ever exposed
- [ ] Set up rate limiting if needed
- [ ] Review audit logs regularly

### Reliability
- [ ] Set up database backups (automatic on paid plans)
- [ ] Monitor error rates in Supabase dashboard
- [ ] Set up uptime monitoring (e.g., Uptime Robot)
- [ ] Create a status page (e.g., status.clarimed.com)

### Performance
- [ ] Enable database indexes (already done in migration)
- [ ] Monitor slow queries
- [ ] Set up CDN for static assets (Vercel does this)
- [ ] Consider connection pooling if traffic is high

### Legal & Compliance
- [ ] Add Terms of Service page
- [ ] Add Privacy Policy page
- [ ] Add medical disclaimer to all pages
- [ ] Consider HIPAA compliance if handling PHI (requires Supabase Pro + BAA)

---

**Questions? Issues?** Let me know and I'll help troubleshoot! 🚀
