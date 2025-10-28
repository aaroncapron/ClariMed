# Data Migration Testing Guide

**Project:** ClariMed v0.6.1  
**Test Date:** October 28, 2025  
**Tested By:** Aaron Capron  
**Status:** All tests passed

---

## Purpose

Verify localStorage to Supabase migration works correctly. The migration system allows users with existing localStorage data to seamlessly import their medications into their new Supabase account.

**Key Requirements:**
- Migration banner appears when appropriate
- Data imports correctly without duplication
- Migration tracking prevents re-prompting
- Skip option works and is remembered
- No cross-user data contamination

---

## Pre-Testing Setup

### Step 1: Run Database Migration
Before testing, run the migration:

1. Open Supabase Dashboard → SQL Editor
2. Run migration: `lib/supabase/migrations/003_add_migration_tracking.sql`
3. Verify successful execution

### Step 2: Start Dev Server
```bash
npm run dev
```

### Step 3: Verify Database Tables
- [x] Visit http://localhost:3000/test-db
- [x] All 3 tables exist: `user_profiles`, `allergies`, `medications`

### Step 4: Browser Console Access
To paste test code in console, type `allow pasting` first (Chrome/Edge/Firefox).

---

## Test Scenarios

### Test 1: Fresh User (No Migration Needed)
**Objective:** Verify new users without localStorage don't see migration banner

**Setup:**
1. Clear browser data or use incognito mode
2. Ensure no localStorage data exists

**Steps:**
1. Sign up as new user
2. Verify email and log in
3. Navigate to dashboard

**Expected Results:**
- [x] No migration banner appears
- [x] Dashboard shows empty medication list
- [x] Add medication button functional

**Result:** PASS

---

### Test 2: User with localStorage Data (Happy Path)
**Objective:** Verify migration banner appears for users with existing data

**Setup:**
1. Log out if logged in
2. Add test medications to localStorage via console

**Steps:**
1. Sign up as new user
2. Verify email and log in
3. Navigate to dashboard

**Expected Results:**
- [x] Migration banner appears
- [x] Banner shows correct medication count
- [x] Import and Skip buttons visible
- [x] Clear informational text

**Result:** PASS

---

### Test 3: Import Medications (Migration Success)
**Objective:** Verify successful data import from localStorage to Supabase

**Steps:**
1. From Test 2, click "Yes, Import (Recommended)"
2. Wait for import completion

**Expected Results:**
- [x] Loading state displayed during import
- [x] Banner disappears after success
- [x] All medications appear in list
- [x] All data preserved (name, dosage, directions, notes)
- [x] localStorage cleared after import
- [x] Banner doesn't reappear on refresh

**Database Verification:**
- [x] Medications saved to Supabase with correct user_id
- [x] migration_completed = true
- [x] migration_completed_at timestamp set
- [x] migration_skipped = false

**Result:** PASS

---

### Test 4: Skip Migration (User Choice)
**Objective:** Verify skip option works and is remembered

**Setup:**
1. Log out
2. Add localStorage medications
3. Sign up as different new user

**Steps:**
1. See migration banner
2. Click "Skip for Now"

**Expected Results:**
- [x] Banner disappears immediately
- [x] No medications imported
- [x] localStorage data preserved
- [x] Banner doesn't reappear on refresh

**Database Verification:**
- [x] migration_completed = false
- [x] migration_completed_at = NULL
- [x] migration_skipped = true

**Result:** PASS

---

### Test 5: Already Migrated User (No Re-prompt)
**Objective:** Verify users who already migrated don't see banner again

**Setup:**
- Use account from Test 3 (already imported)

**Steps:**
1. Log out
2. Add new localStorage medications
3. Log back in with same account

**Expected Results:**
- [x] No migration banner appears
- [x] Only original Supabase medications shown
- [x] New localStorage data ignored
- [x] Prevents duplication and cross-contamination

**Result:** PASS

---

### Test 6: Cross-User Data Protection (Critical!)
**Objective:** Ensure users cannot see other users' medications

**Setup:**
- Two test accounts: User A (with medications) and User B (empty)

**Steps:**
1. Log in as User A
2. Add medication "Lisinopril 10mg"
3. Log out
4. Log in as User B
5. Check medication list

**Expected Results:**
- [x] User B sees only their own medications
- [x] User B does not see User A's medications
- [x] Row Level Security working correctly

**Database Verification:**
- [x] Each medication has correct user_id
- [x] No cross-contamination in database

**Result:** PASS

---

### Test 7: Migration Error Handling
**Objective:** Verify graceful error handling during migration

**Setup:**
- Have localStorage data ready
- Simulate connection error

**Steps:**
1. Sign up new user
2. See migration banner
3. Click import with connection error

**Expected Results:**
- [x] Error message displayed
- [x] Banner remains visible for retry
- [x] Import button becomes clickable again
- [x] localStorage data not lost

**Recovery:**
- [x] Restore connection
- [x] Retry succeeds

**Result:** PASS

---

### Test 8: Large Dataset Migration
**Objective:** Verify performance with larger datasets

**Setup:**
- Create 15+ medications in localStorage

**Steps:**
1. Sign up new user
2. Import all medications

**Expected Results:**
- [x] All 15 medications import successfully
- [x] No data loss
- [x] Performance acceptable (< 5 seconds)
- [x] UI remains responsive

**Result:** PASS

---

### Test 9: Storage Layer Routing (Unified API)
**Objective:** Verify storage functions route to correct backend

**Test 9a: Guest User (localStorage)**
- [x] Guest users read/write to localStorage

**Test 9b: Authenticated User (Supabase)**
- [x] Authenticated users read/write to Supabase

**Result:** PASS

---

### Test 10: Add Medication After Migration
**Objective:** Verify new medications save to Supabase after migration

**Setup:**
- Logged in with migrated account

**Steps:**
1. Add new medication "Aspirin 81mg"
2. Refresh page

**Expected Results:**
- [x] New medication appears in list
- [x] Medication saved to Supabase
- [x] localStorage remains empty
- [x] Correct user_id in database

**Result:** PASS

---

## Test Results Summary

### Critical Tests (Must Pass)
- [x] Test 3: Import Medications
- [x] Test 5: Already Migrated User
- [x] Test 6: Cross-User Data Protection
- [x] Test 10: Add Medication After Migration

### Important Tests (Should Pass)
- [x] Test 1: Fresh User
- [x] Test 2: User with localStorage Data
- [x] Test 4: Skip Migration
- [x] Test 7: Migration Error Handling

### Optional Tests (Nice to Have)
- [x] Test 8: Large Dataset Migration
- [x] Test 9: Storage Layer Routing

**Total Tests:** 10  
**Passed:** 10  
**Failed:** 0  
**Skipped:** 0  

**Overall Status:** ✅ ALL TESTS PASSED

---

## Known Issues & Workarounds

None identified. All test scenarios passed successfully.

---

## Debugging Tools

### Check localStorage Contents
```javascript
console.log(localStorage.getItem('clarimed_medications'));
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

## Sign-Off

All migration flows have been tested and verified working correctly. The data migration system successfully handles all scenarios including happy path, error handling, and edge cases. Row Level Security is properly enforced, preventing cross-user data contamination.

**Tested By:** Aaron Capron  
**Date:** October 28, 2025  
**Next Steps:** Update documentation and push to GitHub
