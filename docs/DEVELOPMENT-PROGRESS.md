# ClariMed Development Progress# 📊 ClariMed Feature Development Progress



**Last Updated:** October 28, 2025  **Last Updated:** October 28, 2025  

**Current Phase:** User Profiles & Allergy Tracking (v0.7.x)**Current Phase:** User Profiles & Allergy Tracking (v0.7.x)



------



## Development Roadmap## 🎯 Development Roadmap



### Phase 1: Foundation & Security (COMPLETE - v0.6.x)### ✅ **Phase 1: Foundation & Security** (COMPLETE - v0.6.x)

1. ✅ **Authentication System** (v0.6.0)

**1. Authentication System (v0.6.0)**   - Supabase client libraries installed

- [x] Supabase client libraries installed   - Database schema created and migrated

- [x] Database schema created and migrated   - TypeScript types defined

- [x] TypeScript types defined   - Auth helper functions implemented

- [x] Auth helper functions implemented   - AuthContext provider created

- [x] AuthContext provider created   - Sign up, login, email verification flows

- [x] Sign up, login, email verification flows   - Password reset and update flows

- [x] Password reset and update flows   - Protected routes with auth guards

- [x] Protected routes with auth guards   - Row Level Security (RLS) enabled

- [x] Row Level Security (RLS) enabled   

2. ✅ **Data Migration System** (v0.6.1)

**2. Data Migration System (v0.6.1)**   - localStorage to Supabase migration

- [x] localStorage to Supabase migration   - Migration banner component

- [x] Migration banner component   - Unified storage layer (auto-routing)

- [x] Unified storage layer (auto-routing)   - Migration tracking in database

- [x] Migration tracking in database   - User choice: import or skip

- [x] User choice: import or skip   - Prevent duplicate migrations

- [x] Prevent duplicate migrations   

3. ✅ **User Profile Management** (v0.6.1)

**3. User Profile Management (v0.6.1)**   - Profile settings page

- [x] Profile settings page   - First name, last name, phone editing

- [x] First name, last name, phone editing   - Profile update persistence

- [x] Profile update persistence   - Link to password reset

- [x] Link to password reset   

   **Status:** ✅ Complete

**Status:** Complete     **Next:** Allergy tracking feature

**Next:** Allergy tracking feature

### 🔄 **Phase 2: User Profiles & Allergies** (IN PROGRESS - v0.7.x)

---4. ⏳ **Allergy Tracking** (NEXT)

   - Add allergy management UI

### Phase 2: User Profiles & Allergies (IN PROGRESS - v0.7.x)   - Search allergies via RxNav

   - Severity levels (mild, moderate, severe)

**4. Allergy Tracking (NEXT)**   - Reaction descriptions

- [ ] Add allergy management UI   - Allergy warnings on medication add

- [ ] Search allergies via RxNav

- [ ] Severity levels (mild, moderate, severe)### � **Phase 3: Prescription Savings Coupons** (v0.8.x)

- [ ] Reaction descriptions5. ⏳ **GoodRx Integration**

- [ ] Allergy warnings on medication add   - Search GoodRx prices by medication + dosage

   - Display coupon codes and prices

---   - Compare prices across pharmacies

   - Deep links to GoodRx app/website

### Phase 3: Prescription Savings Coupons (v0.8.x)   

6. ⏳ **Additional Coupon Services**

**5. GoodRx Integration**   - SingleCare integration

- [ ] Search GoodRx prices by medication + dosage   - RxSaver integration

- [ ] Display coupon codes and prices   - Blink Health integration

- [ ] Compare prices across pharmacies   

- [ ] Deep links to GoodRx app/website7. ⏳ **MySimpleRX Built-in Card**

   - Hardcoded discount card (BIN: 023914, PCN: 5555, Group: SIMPLE)

**6. Additional Coupon Services**   - Display card details for cash payments

- [ ] SingleCare integration   - Educational info about insurance alternatives

- [ ] RxSaver integration

- [ ] Blink Health integration**Real-World Use Case:**  

When patients run out early and insurance won't cover until the refill date, pharmacy techs offer GoodRx/SingleCare coupons to lower cash prices. ClariMed will show these options automatically so patients can compare and choose the best price.

**7. MySimpleRX Built-in Card**

- [ ] Hardcoded discount card (BIN: 023914, PCN: 5555, Group: SIMPLE)### 📋 **Phase 4: Pet Medication Tracking** (v0.9.x)

- [ ] Display card details for cash payments8. ⏳ Pet Profile Management

- [ ] Educational info about insurance alternatives9. ⏳ Pet Medication Tracking

10. ⏳ Pet-specific RxNorm lookup

**Real-World Use Case:**  

When patients run out early and insurance won't cover until the refill date, pharmacy techs offer GoodRx/SingleCare coupons to lower cash prices. ClariMed will show these options automatically so patients can compare and choose the best price.### 🔔 **Phase 5: Reminders & Notifications** (v1.0.x)

11. ⏳ Message Center Component

---12. ⏳ Medication Reminders

13. ⏳ Refill Tracking & Alerts

### Phase 4: Pet Medication Tracking (v0.9.x)

### 📄 **Phase 6: Export & Sharing** (v1.1.x)

**8. Pet Profile Management**14. ⏳ PDF Export

- [ ] Pet profiles (name, species, breed, weight, age)15. ⏳ Emergency Card Generator

- [ ] Multiple pet support

### 💊 **Phase 7: OTC/Supplement Tracking** (v1.2.x)

**9. Pet Medication Tracking**16. ⏳ OTC Medication Category

- [ ] Pet-specific medication list17. ⏳ Expiration Date Tracking

- [ ] Veterinary drug lookup

---

**10. Pet-specific RxNorm Lookup**

- [ ] Search veterinary medications## 📁 Files Created Today

- [ ] Pet medication verification

### Documentation

---- ✅ `docs/FEATURE-AUTHENTICATION.md` - Complete auth feature spec (updated with SMTP notes)

- ✅ `docs/SUPABASE-SETUP.md` - Step-by-step setup guide (updated with production email config)

### Phase 5: Reminders & Notifications (v1.0.x)- ✅ `docs/SECURITY-CHECKLIST.md` - Comprehensive security and privacy checklist



**11. Message Center Component**### Supabase Configuration

- [ ] In-app notification system- ✅ `lib/supabase/client.ts` - Browser client

- [ ] Message history- ✅ `lib/supabase/server.ts` - Server client

- ✅ `lib/supabase/database.types.ts` - TypeScript types

**12. Medication Reminders**- ✅ `lib/supabase/auth.ts` - Auth helper functions

- [ ] Schedule-based reminders- ✅ `lib/supabase/migrations/001_initial_schema.sql` - Database schema

- [ ] Customizable timing

### React Components

**13. Refill Tracking & Alerts**- ✅ `contexts/AuthContext.tsx` - Auth state provider

- [ ] Low medication warnings

- [ ] Refill date reminders### Configuration

- ✅ `.env.local.example` - Environment variable template

---

---

### Phase 6: Export & Sharing (v1.1.x)

## 🔧 Dependencies Installed

**14. PDF Export**

- [ ] Generate medication list PDF```json

- [ ] Print-friendly format{

  "@supabase/supabase-js": "^2.x",

**15. Emergency Card Generator**  "@supabase/ssr": "^0.x"

- [ ] Wallet-sized emergency card}

- [ ] Critical medication info```



------



### Phase 7: OTC/Supplement Tracking (v1.2.x)## 📝 Your Action Items



**16. OTC Medication Category**### **Immediate (Before Next Development Session)**

- [ ] Over-the-counter medication tracking

- [ ] Supplement tracking1. **Create Supabase Project**

   - Follow: `docs/SUPABASE-SETUP.md`

**17. Expiration Date Tracking**   - Save your credentials

- [ ] Expiration date field   - Run the database migration

- [ ] Expiration warnings   - Configure `.env.local`



---2. **Verify Setup**

   - Restart dev server: `npm run dev`

## Database Schema Overview   - Check for Supabase connection errors

   - Verify tables exist in Supabase dashboard

### Tables

### **Ready to Continue?**

**user_profiles**Once Supabase is set up, we'll build:

```- Sign up page with form validation

id (UUID, FK to auth.users)- Login page with error handling

email- Password reset flow

first_name- Migration tool (localStorage → Supabase)

last_name- Protected routes with AuthGuard

phone

allergies (text)---

created_at

updated_at## 🏗️ Database Schema Overview

migration_completed

migration_completed_at### Tables Created

migration_skipped```

```user_profiles

├── id (UUID, FK to auth.users)

**allergies**├── email

```├── full_name

id (UUID)├── date_of_birth

user_id (FK to auth.users)├── preferred_pharmacy

allergen├── preferred_pharmacy_location (JSON)

rxcui├── created_at

severity (enum)└── updated_at

reaction

created_atallergies

updated_at├── id (UUID)

```├── user_id (FK to auth.users)

├── allergen

**medications**├── rxcui

```├── severity (enum)

id (UUID)├── reaction

user_id (FK to auth.users)├── created_at

name└── updated_at

dosage

frequencymedications

notes├── id (UUID)

rxcui├── user_id (FK to auth.users)

verified (boolean)├── name

is_maintenance (boolean)├── dosage

therapeutic_class├── frequency

ingredients (array)├── notes

created_at├── rxcui

updated_at├── verified (boolean)

```├── is_maintenance (boolean)

├── therapeutic_class

**migrations**├── ingredients (array)

```├── created_at

id (UUID)└── updated_at

user_id (FK to auth.users)```

completed (boolean)

completed_at### Security Features

skipped (boolean)- ✅ Row Level Security (RLS) enabled on all tables

```- ✅ Users can only access their own data

- ✅ Automatic timestamp updates

### Security Features- ✅ Cascade deletes (user deletion removes all data)

- Row Level Security (RLS) enabled on all tables

- Users can only access their own data---

- Automatic timestamp updates

- Cascade deletes (user deletion removes all data)## 🎯 Next Development Session Plan



---### **Session 2: Authentication UI** (After Supabase Setup)



## Dependencies**Estimated Time:** 2-3 hours



**Current:****Tasks:**

```json1. Create signup form component with validation

{2. Create login form component

  "@supabase/supabase-js": "^2.x",3. Build signup page (`app/(auth)/signup/page.tsx`)

  "@supabase/ssr": "^0.x"4. Build login page (`app/(auth)/login/page.tsx`)

}5. Add password strength indicator

```6. Create AuthGuard component for protected routes

7. Add navigation (Login/Signup buttons in header)

---8. Test complete auth flow



## Resources**Testing:**

- Sign up new user

### Supabase Documentation- Verify email notification

- [Auth Documentation](https://supabase.com/docs/guides/auth)- Log in with credentials

- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)- Test wrong password

- [Database Functions](https://supabase.com/docs/guides/database/functions)- Test invalid email

- Verify RLS (user can't access other data)

### Next.js + Supabase

- [Official Next.js Guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)---

- [Server-Side Auth](https://supabase.com/docs/guides/auth/server-side/nextjs)

## 💡 Feature Highlights

---

### MySimpleRX Integration (Phase 3)

## Important NotesYour discount card info:

- **BIN:** 023914

### Privacy & Security- **PCN:** 5555

- All user data encrypted at rest (Supabase default)- **Group:** SIMPLE

- HTTPS enforced (Vercel default)- **ID:** Patient's 10-digit phone number

- Row Level Security prevents unauthorized access

- No third-party data sharing without consentWe'll hardcode this as a "built-in coupon" option alongside GoodRx/SingleCare searches.

- Users can export/delete data anytime

### Pet Medication Tracking (Phase 2)

### FDA ComplianceNew features coming:

- Authentication doesn't change FDA classification- Pet profiles (name, species, breed, weight, age)

- Still a general wellness app (tracking only)- Pet-specific medications (insulin, seizure meds, gabapentin)

- No diagnosis, treatment, or medical recommendations- Veterinary drug lookup (RxNorm has vet meds!)

- Proper disclaimers will be added to UI- Pet med discounts (mySimpleRX advertises this!)



------



**Maintained By:** Aaron Capron## 📚 Resources


### Supabase Documentation
- [Auth Documentation](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Database Functions](https://supabase.com/docs/guides/database/functions)

### Next.js + Supabase
- [Official Next.js Guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Server-Side Auth](https://supabase.com/docs/guides/auth/server-side/nextjs)

---

## ⚠️ Important Notes

### Privacy & Security
- All user data encrypted at rest (Supabase default)
- HTTPS enforced (Vercel default)
- Row Level Security prevents unauthorized access
- No third-party data sharing without consent
- Users can export/delete data anytime

### FDA Compliance
- Authentication doesn't change FDA classification
- Still a general wellness app (tracking only)
- No diagnosis, treatment, or medical recommendations
- Proper disclaimers will be added to UI

---

## 🚀 Ready to Continue?

**When you're ready for the next session, just say:**
- "I've set up Supabase, let's build the login page"
- "Authentication is ready, next feature please"
- Or ask any questions about the setup!

**If you need help:**
- "How do I create a Supabase project?"
- "The migration isn't working"
- "I'm getting an error with environment variables"

---

**Great work on starting ClariMed's secure foundation! 🎉**
