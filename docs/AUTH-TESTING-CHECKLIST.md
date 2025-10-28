# 🧪 Authentication Testing Checklist

**Created:** October 23, 2025  
**Purpose:** Verify all authentication flows work correctly before proceeding to next features

---

## 📋 Pre-Testing Setup

### ✅ Step 1: Verify Database Setup
1. Visit: http://localhost:3000/test-db
2. Confirm all 3 tables exist:
   - ✅ `user_profiles`
   - ✅ `allergies`
   - ✅ `medications`
3. If any tables are missing:
   - Go to Supabase Dashboard → SQL Editor
   - Run: `lib/supabase/migrations/001_initial_schema.sql`
   - Run: `lib/supabase/migrations/002_add_name_phone_fields.sql`
   - Refresh test page

### ✅ Step 2: Verify Dev Server Running
```bash
npm run dev
```
Server should be at: http://localhost:3000

---

## 🔐 Authentication Flow Tests

### Test 1: Sign Up Flow (Happy Path)

**Steps:**
1. Go to: http://localhost:3000/auth/signup
2. Fill in form:
   - First Name: Test
   - Last Name: User
   - Email: test@example.com (use a real email you can access)
   - Phone: (555) 123-4567 (optional)
   - Password: Test123!@# (should show "Strong password!")
3. Click "Create Account"

**Expected Results:**
- ✅ Redirects to `/auth/verify-email`
- ✅ Shows message: "Check your email"
- ✅ Email arrives within 1-2 minutes
- ✅ Email has verification link

**Status:** [ ] Pass [ ] Fail

---

### Test 2: Email Verification

**Steps:**
1. Check inbox for verification email
2. Click the verification link in email

**Expected Results:**
- ✅ Redirects to `/auth/callback`
- ✅ Then redirects to login or dashboard
- ✅ No errors shown

**Status:** [ ] Pass [ ] Fail

---

### Test 3: Login Flow (Happy Path)

**Steps:**
1. Go to: http://localhost:3000/auth/login
2. Enter email and password from signup
3. Click "Sign In"

**Expected Results:**
- ✅ Redirects to `/dashboard`
- ✅ Shows welcome message
- ✅ Shows "Add Medication" button
- ✅ Shows "Profile" button
- ✅ Shows "Sign Out" button

**Status:** [ ] Pass [ ] Fail

---

### Test 4: Profile Page

**Steps:**
1. While logged in, click "Profile" button
2. Verify profile information is correct
3. Update first name to "Updated"
4. Click "Save Changes"

**Expected Results:**
- ✅ Shows success message: "Profile updated successfully!"
- ✅ Changes are saved
- ✅ Refresh page - changes persist

**Status:** [ ] Pass [ ] Fail

---

### Test 5: Sign Out

**Steps:**
1. While on dashboard, click "Sign Out"

**Expected Results:**
- ✅ Redirects to `/auth/login`
- ✅ Can no longer access `/dashboard` without logging in

**Status:** [ ] Pass [ ] Fail

---

### Test 6: Password Reset Flow

**Steps:**
1. Go to: http://localhost:3000/auth/login
2. Click "Forgot password?"
3. Enter email address
4. Click "Send Reset Link"

**Expected Results:**
- ✅ Shows "Check your email" message
- ✅ Password reset email arrives
- ✅ Email has reset link

**Status:** [ ] Pass [ ] Fail

---

### Test 7: Update Password

**Steps:**
1. Click the password reset link from email
2. Should redirect to `/auth/update-password`
3. Enter new password: NewTest123!@#
4. Confirm password
5. Click "Update Password"

**Expected Results:**
- ✅ Shows password strength indicator
- ✅ Validates password requirements
- ✅ Redirects to `/auth/login?reset=success`
- ✅ Shows success message
- ✅ Can log in with new password

**Status:** [ ] Pass [ ] Fail

---

## 🚨 Error Handling Tests

### Test 8: Sign Up with Invalid Email

**Steps:**
1. Go to signup page
2. Enter: notanemail
3. Try to submit

**Expected Results:**
- ✅ Shows validation error
- ✅ Form doesn't submit

**Status:** [ ] Pass [ ] Fail

---

### Test 9: Sign Up with Weak Password

**Steps:**
1. Go to signup page
2. Enter password: "test"
3. Observe password strength indicator

**Expected Results:**
- ✅ Shows "weak" indicator (red)
- ✅ Lists missing requirements
- ✅ Form doesn't submit

**Status:** [ ] Pass [ ] Fail

---

### Test 10: Sign Up with Existing Email

**Steps:**
1. Try to sign up with email already used
2. Submit form

**Expected Results:**
- ✅ Shows error message
- ✅ Doesn't create duplicate account

**Status:** [ ] Pass [ ] Fail

---

### Test 11: Login with Wrong Password

**Steps:**
1. Go to login page
2. Enter correct email
3. Enter wrong password
4. Submit

**Expected Results:**
- ✅ Shows error: "Invalid email or password"
- ✅ Doesn't log in
- ✅ Password field is cleared

**Status:** [ ] Pass [ ] Fail

---

### Test 12: Login with Unverified Email

**Steps:**
1. Sign up with new email
2. DON'T verify email
3. Try to log in

**Expected Results:**
- ✅ Shows message about email verification
- ✅ Doesn't grant access

**Status:** [ ] Pass [ ] Fail

---

### Test 13: Access Protected Routes When Not Logged In

**Steps:**
1. Make sure you're logged out
2. Try to visit: http://localhost:3000/dashboard

**Expected Results:**
- ✅ Redirects to `/landing` or `/auth/login`
- ✅ Doesn't show dashboard content

**Status:** [ ] Pass [ ] Fail

---

## 🔒 Security Tests

### Test 14: Row Level Security (RLS)

**Steps:**
1. Log in as User A
2. Open browser console (F12)
3. Note your user ID from profile page
4. Try to query another user's data:
```javascript
const supabase = window.__supabase // May need to expose this
await supabase.from('medications').select('*').eq('user_id', 'DIFFERENT_USER_ID')
```

**Expected Results:**
- ✅ Returns empty array or error
- ✅ Cannot access other users' data

**Status:** [ ] Pass [ ] Fail (or Skip if complex)

---

### Test 15: Session Persistence

**Steps:**
1. Log in
2. Close browser completely
3. Reopen browser
4. Go to http://localhost:3000/dashboard

**Expected Results:**
- ✅ Still logged in
- ✅ Dashboard loads without login prompt

**Status:** [ ] Pass [ ] Fail

---

## 🎨 UI/UX Tests

### Test 16: Password Visibility Toggle

**Steps:**
1. Go to login or signup page
2. Enter password
3. Click "Show" button

**Expected Results:**
- ✅ Password becomes visible
- ✅ Button changes to "Hide"
- ✅ Click again - password hidden

**Status:** [ ] Pass [ ] Fail

---

### Test 17: Form Validation

**Steps:**
1. Try to submit empty signup form
2. Fill only some fields

**Expected Results:**
- ✅ Required fields show error
- ✅ Form doesn't submit until all required fields valid

**Status:** [ ] Pass [ ] Fail

---

### Test 18: Responsive Design

**Steps:**
1. Test auth pages on mobile size (resize browser)
2. Check all pages: signup, login, verify, reset

**Expected Results:**
- ✅ Forms are readable and usable
- ✅ Buttons are touchable
- ✅ No horizontal scroll

**Status:** [ ] Pass [ ] Fail

---

## 📊 Database Tests

### Test 19: User Profile Creation

**Steps:**
1. Sign up new user
2. Go to Supabase Dashboard → Table Editor → user_profiles
3. Find the new user

**Expected Results:**
- ✅ Profile row exists
- ✅ first_name, last_name, email are populated
- ✅ created_at timestamp is set

**Status:** [ ] Pass [ ] Fail

---

### Test 20: Profile Updates

**Steps:**
1. Update profile in app
2. Check Supabase Dashboard
3. Verify updated_at timestamp changed

**Expected Results:**
- ✅ Data updated in database
- ✅ updated_at reflects change time

**Status:** [ ] Pass [ ] Fail

---

## 📝 Summary

### Test Results
- **Total Tests:** 20
- **Passed:** ___ / 20
- **Failed:** ___ / 20
- **Skipped:** ___ / 20

### Critical Issues Found
1. 
2. 
3. 

### Minor Issues Found
1. 
2. 
3. 

### Next Steps
- [ ] Fix critical issues
- [ ] Re-test failed tests
- [ ] Document any workarounds
- [ ] Update DEVELOPMENT-PROGRESS.md when all tests pass

---

## 🎉 Ready for Next Phase?

Once all critical tests pass:
- [ ] Update CHANGELOG.md with v0.6.1 details
- [ ] Mark authentication as complete in DEVELOPMENT-PROGRESS.md
- [ ] Move to Option 2: Data Migration (localStorage → Supabase)

---

**Tested By:** _______________  
**Date:** _______________  
**Environment:** Development (localhost)  
**Notes:**

