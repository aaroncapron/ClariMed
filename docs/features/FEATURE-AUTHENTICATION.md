# 🔐 Feature: Authentication & User Accounts

**Status:** 🚧 In Development  
**Priority:** Critical - Foundation for all multi-user features  
**Complexity:** Medium  
**Started:** October 23, 2025  
**Completed:** TBD

---

## 🎯 Vision

**"Secure, privacy-first authentication system that enables multi-device sync, data backup, and personalized features while keeping user data encrypted and protected."**

Enable users to:
- Create secure accounts with email/password
- Sync medications across multiple devices
- Back up data to cloud (encrypted)
- Manage personal health information (allergies, pet profiles)
- Control their data (export, delete anytime)

---

## 🛠️ Technical Implementation

### Technology Stack
- **Supabase Auth** - Authentication service
- **Supabase PostgreSQL** - Database (encrypted at rest)
- **Row Level Security (RLS)** - Database access control
- **Next.js API Routes** - Server-side auth handling
- **HTTP-only Cookies** - Secure session management

### Database Schema

#### Users Table (managed by Supabase Auth)
```sql
-- Automatically created by Supabase
-- Contains: id, email, encrypted_password, etc.
```

#### User Profiles Table
```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  date_of_birth DATE,
  preferred_pharmacy TEXT,
  preferred_pharmacy_location JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own profile
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);
```

#### Allergies Table
```sql
CREATE TABLE allergies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  allergen TEXT NOT NULL,
  rxcui TEXT,
  severity TEXT CHECK (severity IN ('mild', 'moderate', 'severe', 'anaphylaxis')),
  reaction TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE allergies ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own allergies"
  ON allergies FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own allergies"
  ON allergies FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own allergies"
  ON allergies FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own allergies"
  ON allergies FOR DELETE
  USING (auth.uid() = user_id);
```

#### Medications Table (migrated from localStorage)
```sql
CREATE TABLE medications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  frequency TEXT NOT NULL,
  notes TEXT,
  rxcui TEXT,
  verified BOOLEAN DEFAULT FALSE,
  is_maintenance BOOLEAN DEFAULT FALSE,
  therapeutic_class TEXT,
  ingredients TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own medications"
  ON medications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own medications"
  ON medications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own medications"
  ON medications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own medications"
  ON medications FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_medications_user_id ON medications(user_id);
CREATE INDEX idx_medications_created_at ON medications(created_at DESC);
```

---

## 🔒 Security & Privacy

### Data Protection
- ✅ **Passwords hashed** with bcrypt (Supabase default)
- ✅ **Database encryption at rest** (Supabase provides)
- ✅ **HTTPS/TLS in transit** (Vercel provides)
- ✅ **Row Level Security** (users can only access their own data)
- ✅ **HTTP-only cookies** (prevent XSS attacks)
- ✅ **CSRF protection** (Supabase handles)

### Privacy Commitments
- ✅ **No third-party data sharing** (except required APIs like RxNorm)
- ✅ **User owns their data** (can export/delete anytime)
- ✅ **Minimal data collection** (only what's necessary)
- ✅ **No tracking or analytics** without consent
- ✅ **HIPAA-aware design** (not claiming compliance yet)

### Authentication Flow
```
1. User signs up with email + password
2. Supabase sends verification email
3. User verifies email
4. User logs in
5. Supabase issues JWT token
6. Token stored in HTTP-only cookie
7. All API requests include token
8. Supabase validates token + RLS enforces access control
```

---

## 📁 File Structure

```
lib/
  supabase/
    client.ts          # Supabase client initialization
    auth.ts            # Auth helper functions
    database.types.ts  # TypeScript types from database schema
  migrations/          # Database migration scripts
app/
  (auth)/              # Auth pages route group
    login/
      page.tsx         # Login page
    signup/
      page.tsx         # Signup page
    verify-email/
      page.tsx         # Email verification page
    reset-password/
      page.tsx         # Password reset page
  api/
    auth/
      callback/        # OAuth callback handler
        route.ts
contexts/
  AuthContext.tsx      # Auth state management
components/
  auth/
    LoginForm.tsx      # Login form component
    SignupForm.tsx     # Signup form component
    AuthGuard.tsx      # Protected route wrapper
```

---

## 🎨 User Experience

### Sign Up Flow
1. User visits ClariMed
2. "Get Started" or "Sign Up" button
3. Enter email + password (with strength requirements)
4. Accept Terms of Service & Privacy Policy
5. Click "Create Account"
6. "Check your email to verify" message
7. Click verification link in email
8. Redirected to login page
9. Log in with credentials
10. Welcome to ClariMed!

### Login Flow
1. Enter email + password
2. Click "Log In"
3. Redirected to dashboard with medications

### Password Requirements
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character

### Migration from localStorage
When existing user creates account:
1. Detect medications in localStorage
2. Show migration prompt: "Import your existing medications?"
3. If yes, bulk insert into database
4. Clear localStorage after successful migration
5. Show success message: "X medications imported"

---

## 🧪 Testing Plan

### Unit Tests
- [ ] Auth helper functions
- [ ] Password validation
- [ ] Email validation
- [ ] Token parsing

### Integration Tests
- [ ] Sign up flow (happy path)
- [ ] Sign up with invalid email
- [ ] Sign up with weak password
- [ ] Login flow (happy path)
- [ ] Login with wrong password
- [ ] Password reset flow
- [ ] Email verification flow

### Security Tests
- [ ] RLS policies prevent unauthorized access
- [ ] Cannot read other users' medications
- [ ] Cannot update other users' data
- [ ] Cannot delete other users' data
- [ ] Session expires after timeout
- [ ] CSRF protection works

---

## 📋 Development Checklist

### Phase 1: Setup Supabase
- [ ] Create Supabase project
- [ ] Configure authentication settings
- [ ] Set up email templates
- [ ] Create database tables
- [ ] Enable Row Level Security
- [ ] Create RLS policies
- [ ] Generate TypeScript types

### Phase 2: Client Integration
- [ ] Install `@supabase/supabase-js` and `@supabase/auth-helpers-nextjs`
- [ ] Create Supabase client singleton
- [ ] Create auth helper functions
- [ ] Create AuthContext provider
- [ ] Create AuthGuard component

### Phase 3: UI Components
- [ ] LoginForm component
- [ ] SignupForm component
- [ ] Password strength indicator
- [ ] Email verification page
- [ ] Password reset flow

### Phase 4: Migration Logic
- [ ] Detect localStorage data
- [ ] Migration prompt component
- [ ] Bulk insert medications
- [ ] Clear localStorage after migration
- [ ] Error handling for migration

### Phase 5: Testing & Documentation
- [ ] Write unit tests
- [ ] Write integration tests
- [ ] Test RLS policies
- [ ] Update README.md
- [ ] Create user documentation
- [ ] Privacy policy page
- [ ] Terms of service page

---

## 🚨 Important Notes

### Email Service Configuration

#### Development
- **Using Supabase's native email sender** (default)
- Works out of the box for development
- Sends from `noreply@mail.app.supabase.io`
- Perfect for testing signup/login flows

#### Production (CRITICAL!)
- **MUST configure custom SMTP before launch**
- Native sender has rate limits and deliverability issues
- Recommended providers:
  - **SendGrid** - 100 free emails/day, reliable
  - **Amazon SES** - Very affordable, scalable
  - **Resend** - Developer-friendly, modern
  - **Mailgun** - Good for high volume
- Configure in Supabase: **Authentication → Settings → SMTP Settings**
- Required for reliable:
  - Email verification
  - Password resets
  - Account notifications

### HIPAA Compliance
- **Not claiming HIPAA compliance yet** (requires BAA with Supabase)
- Designed with privacy best practices
- Can upgrade to HIPAA-compliant tier in future

### Data Retention
- Users can delete account anytime
- All data permanently deleted within 30 days
- Backup exports available before deletion

### Rate Limiting
- Supabase provides rate limiting on auth endpoints
- Prevents brute force attacks
- Additional rate limiting can be added via middleware

---

## 📊 Success Metrics

- [ ] User sign-up completion rate > 80%
- [ ] Email verification rate > 90%
- [ ] Migration success rate > 95%
- [ ] Zero unauthorized data access incidents
- [ ] Average login time < 2 seconds

---

**Next Steps:** Set up Supabase project and create initial database schema.

**Depends On:** None (foundation feature)  
**Enables:** Multi-device sync, pet profiles, message center, all future features
