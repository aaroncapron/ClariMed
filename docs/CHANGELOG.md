# ClariMed - Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.6.0] - 2025-10-23

### 🎉 Major Features Added

#### **Supabase Authentication & Security**
- Full authentication system with email/password
- User signup with password strength validation
- Login with show/hide password toggle
- Email verification flow
- Password reset functionality
- Secure logout with session cleanup

#### **Database & Security**
- PostgreSQL database with Supabase
- Row Level Security (RLS) policies - users only access their own data
- User profiles table with allergies support
- Medications table with user_id foreign key
- Server-side and client-side Supabase clients
- Cookie-based session management

#### **Routing & Pages**
- Landing page for unauthenticated users
- Protected dashboard for authenticated users
- Auth pages: signup, login, verify-email, reset-password
- Auth callback route for email verification
- Automatic redirects based on authentication state
- Clean root router (`app/page.tsx`) handling auth logic

#### **UI Components**
- `AuthContext` for global authentication state
- `SignupForm` component with validation
- `LoginForm` component with toggle visibility
- Protected route wrappers
- Consistent auth UI styling

### 🎨 UI Improvements
- Two-mode toggle (Clarity vs Clinical) with floating button
- Changed maintenance badge from purple to navy blue
- Improved form validation and error messages
- Better loading states during authentication

### 📝 Documentation
- Added `SUPABASE-SETUP.md` - Complete Supabase configuration guide
- Added `FEATURE-AUTHENTICATION.md` - Authentication implementation details
- Added `SECURITY-CHECKLIST.md` - Security best practices
- Added `FEATURES.md` - Consolidated detailed feature documentation
- Updated README.md - Concise version with v0.6.0 status
- Updated roadmap to use industry-standard versioning

### 🔧 Technical Changes
- Added `@supabase/supabase-js` and `@supabase/ssr` dependencies
- Created `lib/supabase/` directory structure
- Added `database.types.ts` for TypeScript types
- Added `auth.ts` helper functions
- Created migration file `001_initial_schema.sql`
- Updated `.gitignore` for Supabase files
- Improved TypeScript type safety across auth flows

---

## [0.5.0] - 2025-10-11

### 🎉 Major Features Added

#### **Maintenance Medication Detection**
- Smart auto-detection based on drug classes and patterns
- Covers 10+ medication categories (BP meds, statins, diabetes, thyroid, anticoagulants, etc.)
- User can always override suggestions
- Purple "Maintenance" badge on medication cards
- Drug class-specific explanations (e.g., "Blood pressure medication - ACE inhibitor")
- Backward compatible with existing medications

#### **Hybrid Smart Autocomplete**
- **Primary**: `drugs.json` API for complete terms
- **Fallback**: `approximateTerm.json` API for partial matches
- Now works with partial input (e.g., "lisin" finds lisinopril)
- Faster response time: 150ms debounce (down from 300ms)

#### **Intelligent Search Result Sorting**
- 4-level sort hierarchy:
  1. **Dosage Form**: Tablets → Capsules → Liquids → Other
  2. **Generic before Brand** (within each form)
  3. **Dosage Strength**: Lowest to highest (2.5 MG → 40 MG)
  4. **Alphabetically** (for ties)
- Smart unit conversion (MCG → MG, G → MG)

#### **Brand Name Formatting**
- **Before**: `lisinopril 10 MG Oral Tablet [Prinivil]`
- **After**: `Prinivil (lisinopril) 10 MG Oral Tablet`
- Brand name first, generic in parentheses
- Clearer for users to distinguish brands

#### **Deduplication**
- Removes duplicate packages/manufacturers
- Only shows one entry per unique drug formulation
- Reduces clutter by 30-50%

### 🐛 Bug Fixes
- Fixed lisinopril not auto-checking as maintenance medication
- Fixed autocomplete not appearing for partial drug names (< 5 characters)
- Fixed search results appearing in random order

### 🎨 UI Improvements
- Added dosage form indicator in dropdown (`🔵 Generic • Tablet`)
- Improved maintenance checkbox styling (blue info box with icon)
- Better explanation text for auto-suggestions

### 📝 Documentation
- Added `MAINTENANCE-MEDS-FEATURE.md` - Complete technical documentation
- Added `SMART-AUTOCOMPLETE-FEATURE.md` - Autocomplete implementation details
- Updated README with Phase 2 progress
- Created CHANGELOG.md

### 🔧 Technical Changes
- Added `isMaintenance: boolean` field to Medication type
- Added `therapeuticClass?: string` for future ATC code storage
- Added `ingredients?: string[]` for combo drug interaction checking
- Created `lib/maintenance.ts` with detection logic
- Enhanced `lib/rxnav.ts` with hybrid search and advanced sorting
- Added storage migration for backward compatibility

---

## [0.4.0] - 2025-10-11

### 🎉 Major Features Added
- **RxNav Autocomplete** - Live medication lookup with NIH RxNav API
- Generic (SCD) and Brand (SBD) drug results
- Auto-fill dosage from drug name
- Store RxCUI codes with medications
- Green "✓ Verified" badge on validated medications

### 🎨 UI Improvements
- Search medications by name, dosage, frequency, or notes
- Beautiful autocomplete dropdown with hover states
- Loading spinner during API calls
- Empty state messages for no results

---

## [0.3.0] - 2025-10-10

### 🎉 Major Features Added
- **Edit medications** - Click edit button, form prefills, update functionality
- **Real-time search/filter** - Search by name, dosage, frequency, notes

### 🎨 UI Improvements
- Search bar with clear button
- Result count display
- Improved empty states

---

## [0.2.0] - 2025-10-09

### 🎨 UI Overhaul
- Professional centered layout with max-width container
- Clean header bar with branding
- Large, obvious buttons with hover effects
- Beautiful medication cards with proper spacing
- Clear visual hierarchy (blue accents, typography)
- Improved empty state with icon and messaging

---

## [0.1.0] - 2025-10-08

### 🎉 MVP Launch
- Add medications (name, dosage, frequency, notes)
- View medication list
- Delete medications with confirmation
- localStorage persistence
- TypeScript type safety
- Basic Tailwind CSS styling

---

## Upcoming Features

### v0.6.x - Authentication & Profiles (Current Phase)
- Improve signup/login forms (phone number field, split name into first/last)
- User profile management page
- Allergy tracking and management
- Profile settings (email change, password update)

### v0.7.x - Multi-User & Sync
- Migrate localStorage medications to Supabase
- Real-time multi-device sync
- Pet profiles and pet medication tracking
- Family member profiles
- Share medication lists with healthcare providers

### v0.8.x - Cost Savings & Coupons
- MySimpleRX API integration
- GoodRx price comparison
- Prescription coupon finder
- Generic alternative suggestions
- Pharmacy price comparison

### v0.9.x - Reminders & Notifications
- Message center for in-app notifications
- Refill tracking and reminders
- Medication schedule reminders
- Push notifications (PWA)
- Calendar integration

### v1.0.x - Production Release
- PDF export for medication lists
- Drug interaction checking (DUR with RxNav)
- OTC and supplement tracking
- Advanced sorting (name, date, dosage, maintenance status)
- Advanced filtering options
- PWA capabilities (offline support, installable)
- Mobile optimization and responsive design
- Dark mode support

### v1.1.x+ - Future Enhancements
- iOS/Android native apps
- Barcode scanning for medications
- Medication adherence tracking
- Integration with pharmacy systems
- Health insurance integration

---

**Legend:**
- 🎉 **Major Feature** - New significant functionality
- 🐛 **Bug Fix** - Fixed broken behavior
- 🎨 **UI Improvement** - Visual or UX enhancement
- 📝 **Documentation** - Added or updated docs
- 🔧 **Technical** - Internal changes, refactoring
- ⚠️ **Breaking Change** - May require migration
