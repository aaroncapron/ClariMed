# 🔄 Migration Testing Guide

**Version:** v0.6.1  
**Created:** October 28, 2025  
**Purpose:** Verify localStorage to Supabase migration works correctly

---

## 🎯 What We're Testing

The migration system allows users with existing localStorage data to seamlessly import their medications into their new Supabase account. This guide ensures:
1. ✅ Migration banner appears when appropriate
2. ✅ Data imports correctly without duplication
3. ✅ Migration tracking prevents re-prompting
4. ✅ Skip option works and is remembered
5. ✅ No cross-user data contamination

---

## 📋 Pre-Testing Setup

### Step 1: Run Database Migration (IMPORTANT!)
Before testing, you MUST run the new migration:

1. Open Supabase Dashboard → SQL Editor
2. Run this migration:
   ```sql
   -- lib/supabase/migrations/003_add_migration_tracking.sql
   
   ALTER TABLE user_profiles
     ADD COLUMN IF NOT EXISTS migration_completed BOOLEAN DEFAULT FALSE,
     ADD COLUMN IF NOT EXISTS migration_completed_at TIMESTAMP WITH TIME ZONE,
     ADD COLUMN IF NOT EXISTS migration_skipped BOOLEAN DEFAULT FALSE;
   
   CREATE INDEX IF NOT EXISTS idx_user_profiles_migration_completed 
     ON user_profiles(migration_completed);
   
   COMMENT ON COLUMN user_profiles.migration_completed IS 'Whether user has completed localStorage to Supabase migration';
   COMMENT ON COLUMN user_profiles.migration_completed_at IS 'Timestamp when migration was completed';
   COMMENT ON COLUMN user_profiles.migration_skipped IS 'Whether user chose to skip migration (dont ask again)';
   ```
3. Verify migration ran successfully (no errors)

### Step 2: Start Dev Server
```bash
npm run dev
```

### Step 3: Verify Database Tables
Visit: http://localhost:3000/test-db

Confirm all 3 tables exist:
- ✅ `user_profiles`
- ✅ `allergies`
- ✅ `medications`

### Step 4: Bypass Browser Console Paste Warning
Modern browsers block pasting into the console to protect against self-XSS scams. To allow pasting:

**Chrome/Edge:**
1. Open console (F12)
2. Type `allow pasting` and press Enter
3. Now you can paste test code

**Firefox:**
1. Open console (F12)
2. Type `allow pasting` in the console
3. Now you can paste

**Safari:**
1. Enable Developer Menu: Safari → Preferences → Advanced → "Show Develop menu"
2. Open console (Option + Command + C)
3. Pasting should work by default

**Alternative:** Instead of pasting, you can type the code manually or save it as a browser bookmark (bookmarklet).

---

## 🧪 Test Scenarios

### Test 1: Fresh User (No Migration Needed)

**Setup:**
1. Clear browser data (or use Incognito/Private mode)
2. Ensure no localStorage data exists

**Steps:**
1. Sign up as new user
2. Verify email and log in
3. Go to dashboard

**Expected Result:**
- ✅ NO migration banner appears
- ✅ Dashboard shows empty medication list
- ✅ "Add Medication" button works

**Status:** [✅] Pass

---

### Test 2: User with localStorage Data (Happy Path)

**Setup:**
1. Log out (if logged in)
2. Add some medications to localStorage (as guest):
   ```javascript
   // Open browser console and run:
   localStorage.setItem('clarimed_medications', JSON.stringify([
     {
       id: '1',
       name: 'Lisinopril',
       dosage: '10mg',
       frequency: 'Once daily',
       notes: 'Take with food',
       verified: true,
       isMaintenance: true,
       createdAt: new Date().toISOString(),
       updatedAt: new Date().toISOString()
     },
     {
       id: '2',
       name: 'Metformin',
       dosage: '500mg',
       frequency: 'Twice daily',
       notes: 'With breakfast and dinner',
       verified: false,
       isMaintenance: true,
       createdAt: new Date().toISOString(),
       updatedAt: new Date().toISOString()
     }
   ]));
   ```

**Steps:**
1. Sign up as NEW user (fresh account)
2. Verify email and log in
3. Go to dashboard

**Expected Results:**
- ✅ Migration banner appears with "2 medications" message
- ✅ Banner shows "Import" and "Skip for Now" buttons
- ✅ Info text explains what will happen

**Status:** [ ] Pass [ ] Fail

---

### Test 3: Import Medications (Migration Success)

**Setup:**
- Continue from Test 2 (migration banner visible)

**Steps:**
1. Click "✓ Yes, Import (Recommended)" button
2. Wait for import to complete

**Expected Results:**
- ✅ Button shows "Importing..." with spinner
- ✅ Banner disappears after successful import
- ✅ 2 medications appear in medication list
- ✅ All medication data preserved (name, dosage, frequency, notes)
- ✅ localStorage is cleared (check with: `localStorage.getItem('clarimed_medications')`)
- ✅ Refresh page - banner does NOT reappear

**Verify in Database:**
1. Go to Supabase Dashboard → Table Editor → `medications`
2. Check that 2 rows exist with your user_id
3. Verify all data is correct

**Verify in Database (user_profiles):**
1. Go to Supabase Dashboard → Table Editor → `user_profiles`
2. Find your user row
3. Verify:
   - `migration_completed` = `true`
   - `migration_completed_at` has timestamp
   - `migration_skipped` = `false`

**Status:** [ ] Pass [ ] Fail

---

### Test 4: Skip Migration (User Choice)

**Setup:**
1. Log out
2. Add localStorage medications again (use code from Test 2)
3. Sign up as DIFFERENT new user
4. Verify email and log in

**Steps:**
1. See migration banner appear
2. Click "Skip for Now" button

**Expected Results:**
- ✅ Banner disappears immediately
- ✅ No medications imported to dashboard
- ✅ localStorage medications still exist (user can use as guest if they log out)
- ✅ Refresh page - banner does NOT reappear

**Verify in Database:**
1. Go to Supabase Dashboard → Table Editor → `user_profiles`
2. Find your user row
3. Verify:
   - `migration_completed` = `false`
   - `migration_completed_at` = `NULL`
   - `migration_skipped` = `true`

**Status:** [ ] Pass [ ] Fail

---

### Test 5: Already Migrated User (No Re-prompt)

**Setup:**
- Use account from Test 3 (already imported data)

**Steps:**
1. Log out
2. Add NEW localStorage medications (different from before)
3. Log back in with SAME account

**Expected Results:**
- ✅ NO migration banner appears
- ✅ Only Supabase medications show (original 2)
- ✅ New localStorage medications are ignored
- ✅ This prevents accidental duplication or cross-user contamination

**Why This Matters:**
If multiple people use the same browser (family computer, library, etc.), we don't want User B's medications to get imported into User A's account when User A logs back in.

**Status:** [ ] Pass [ ] Fail

---

### Test 6: Cross-User Data Protection (Critical!)

**Purpose:** Ensure User A cannot see User B's medications

**Setup:**
1. Have 2 test accounts ready:
   - User A (with medications)
   - User B (empty or with different medications)

**Steps:**
1. Log in as User A
2. Add a medication: "Lisinopril 10mg"
3. Note the medication appears
4. Log out
5. Log in as User B
6. Check medication list

**Expected Results:**
- ✅ User B sees ONLY their own medications (or empty list)
- ✅ User B does NOT see "Lisinopril 10mg" from User A
- ✅ Row Level Security (RLS) is working

**Database Verification:**
1. Go to Supabase Dashboard → SQL Editor
2. Run:
   ```sql
   SELECT user_id, name, dosage 
   FROM medications 
   ORDER BY created_at DESC;
   ```
3. Verify each medication has the correct user_id
4. Confirm no cross-contamination

**Status:** [ ] Pass [ ] Fail

---

### Test 7: Migration Error Handling

**Setup:**
- Have localStorage data ready
- Temporarily break Supabase connection (disconnect internet or invalid URL)

**Steps:**
1. Sign up new user
2. See migration banner
3. Click "Import"
4. Wait for error

**Expected Results:**
- ✅ Error message appears: "Failed to import medications"
- ✅ Banner does NOT disappear (user can retry)
- ✅ Import button becomes clickable again
- ✅ Medications remain in localStorage (not lost)

**Recovery:**
1. Restore internet/Supabase connection
2. Click "Import" again
3. Should succeed this time

**Status:** [ ] Pass [ ] Fail

---

### Test 8: Large Dataset Migration

**Setup:**
Create 10+ medications in localStorage:
```javascript
const meds = [];
for (let i = 1; i <= 15; i++) {
  meds.push({
    id: String(i),
    name: `Medication ${i}`,
    dosage: `${i}mg`,
    frequency: 'Once daily',
    notes: `Test medication ${i}`,
    verified: i % 2 === 0,
    isMaintenance: i % 3 === 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
}
localStorage.setItem('clarimed_medications', JSON.stringify(meds));
```

**Steps:**
1. Sign up new user
2. Import all 15 medications

**Expected Results:**
- ✅ All 15 medications import successfully
- ✅ No data loss
- ✅ Performance is acceptable (< 5 seconds)
- ✅ UI doesn't freeze during import

**Status:** [ ] Pass [ ] Fail

---

### Test 9: Storage Layer Routing (Unified API)

**Purpose:** Verify storage functions route to correct backend

**Test 9a: Guest User (localStorage)**
```javascript
// Log out completely
// Open console and run:
const meds = await getMedications(); // Should return localStorage data
console.log('Meds:', meds);
```

**Expected:** Returns medications from localStorage

**Test 9b: Authenticated User (Supabase)**
```javascript
// Log in
// Open console and run:
const meds = await getMedications(); // Should return Supabase data
console.log('Meds:', meds);
```

**Expected:** Returns medications from Supabase (may need to expose function)

**Status:** [ ] Pass [ ] Fail

---

### Test 10: Add Medication After Migration

**Setup:**
- Be logged in with migrated account

**Steps:**
1. Add NEW medication via UI: "Aspirin 81mg"
2. Refresh page

**Expected Results:**
- ✅ New medication appears in list
- ✅ Medication saved to Supabase (not localStorage)
- ✅ Check localStorage: should still be empty
- ✅ Check Supabase: should see new medication with correct user_id

**Status:** [ ] Pass [ ] Fail

---

## 📊 Test Results Summary

### Critical Tests (Must Pass)
- [ ] Test 3: Import Medications
- [ ] Test 5: Already Migrated User (No Re-prompt)
- [ ] Test 6: Cross-User Data Protection
- [ ] Test 10: Add Medication After Migration

### Important Tests (Should Pass)
- [ ] Test 1: Fresh User
- [ ] Test 2: User with localStorage Data
- [ ] Test 4: Skip Migration
- [ ] Test 7: Migration Error Handling

### Optional Tests (Nice to Have)
- [ ] Test 8: Large Dataset Migration
- [ ] Test 9: Storage Layer Routing

---

## 🐛 Known Issues & Workarounds

### Issue: Migration banner doesn't appear
**Cause:** Migration fields not in database  
**Fix:** Run migration 003 in Supabase SQL Editor

### Issue: "Cannot read property 'id' of undefined"
**Cause:** User not authenticated when checking migration  
**Fix:** Wrap migration check in `if (user)` condition

### Issue: Medications duplicated
**Cause:** Migration ran twice  
**Fix:** Check `migration_completed` flag before running

---

## 🔧 Debugging Tools

### Check localStorage Contents
```javascript
console.log(localStorage.getItem('clarimed_medications'));
```

### Check Current User
```javascript
// In AuthContext, expose user
console.log(user);
```

### Check Migration Status (SQL)
```sql
SELECT 
  id, 
  email, 
  migration_completed,
  migration_skipped,
  migration_completed_at
FROM user_profiles
ORDER BY created_at DESC;
```

### Check Medications in Supabase (SQL)
```sql
SELECT 
  m.id,
  m.user_id,
  m.name,
  m.dosage,
  m.created_at
FROM medications m
ORDER BY m.created_at DESC
LIMIT 50;
```

---

## ✅ Sign-Off

**Tester:** _______________  
**Date:** _______________  
**Environment:** Development (localhost:3000)  
**Browser:** _______________  
**Supabase Project:** _______________

### Overall Assessment
- [ ] All critical tests passed
- [ ] Ready for production
- [ ] Needs fixes (see issues above)

---

**Great work testing the migration system! This protects user data and ensures a smooth onboarding experience.** 🎉
