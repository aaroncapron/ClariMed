# ClariMed - Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.8.0] - 2025-11-04

### Added

**Drug Utilization Review (DUR) System**
- Drug-to-drug interaction checking using RxNav Interaction API
- Real-time interaction detection when adding new medications
- Severity classification: Critical, Major, Moderate, Minor
- Color-coded warning badges for quick severity identification
- Detailed interaction descriptions from DrugBank source
- FDA-compliant disclaimers on all interaction warnings
- Automatic checking against all existing medications with RxCUI codes

**Enhanced Safety Features**
- Interaction warnings display before medication is added
- Educational information about potential drug interactions
- Clear disclaimers: "This information is for educational purposes only"
- Emphasis on consulting healthcare providers for all medication decisions

### Technical
- Created `lib/interactions.ts` with comprehensive interaction checking functions
- Added `checkDrugInteraction()` for pairwise medication checking
- Added `checkMedicationInteractions()` for new medication validation
- Added `checkAllInteractions()` for complete medication list analysis
- Implemented severity mapping from RxNav to standardized levels
- Added interaction warning UI to `AddMedicationForm.tsx`
- Updated dashboard to pass existing medications for interaction checking
- Created 60 comprehensive tests (all passing) including new interaction tests
- Test coverage for severity mapping, API integration, and edge cases

### Compliance
- System provides informational warnings only (not medical advice)
- Does not prevent users from adding medications (user autonomy maintained)
- Clear FDA-compliant language throughout
- No diagnostic or prescriptive functionality
- Maintains status as wellness/informational tool, not medical device

---

## [0.7.0] - 2025-10-28

### Added

**Automated Testing Infrastructure**
- Jest 29.7.0 test framework with React Testing Library integration
- 41 comprehensive unit tests covering core functionality
- Test coverage: maintenance detection, allergy conflicts, RxNav API, view mode persistence
- Coverage thresholds set to 70% for quality assurance
- Test scripts: `npm test`, `npm run test:ci`, `npm run test:coverage`

**Allergy Tracking System**
- Complete allergy management UI with full CRUD operations
- RxNav API integration for allergen autocomplete search
- Severity levels (mild, moderate, severe, anaphylaxis) with color-coded badges
- Reaction description field for documenting symptoms
- Allergy list component integrated into profile page
- Search allergens by name with real-time suggestions

**Medication Conflict Warnings**
- Automatic allergy conflict detection when adding medications
- Drug class cross-reactivity checking for safer medication management
- Support for 6 drug classes:
  - Penicillins (amoxicillin, ampicillin, etc.)
  - Cephalosporins (cephalexin, cefuroxime, etc.)
  - Sulfa drugs (sulfamethoxazole, sulfasalazine, etc.)
  - NSAIDs (ibuprofen, naproxen, aspirin, etc.)
  - Statins (atorvastatin, simvastatin, etc.)
  - Macrolides (azithromycin, erythromycin, etc.)
- Red alert banner displays when medication conflicts with recorded allergies
- Ingredient extraction algorithm for better matching (removes dosages and forms)

**Database Improvements**
- Automatic user profile creation via database trigger
- New users automatically get a profile when signing up
- Backfill existing auth.users without profiles
- Migration 005: Schema cleanup and auto-profile creation

### Changed
- Replaced `full_name` field with `first_name` and `last_name` in user profiles
- Updated signup flow to collect separate name fields
- Enhanced profile settings with structured name fields

### Fixed
- Missing user profiles for existing authenticated users
- User profile creation now happens automatically via trigger function

### Technical
- Created `lib/allergies.ts` with comprehensive allergy CRUD operations
- Added `checkAllergyConflicts()` function with drug class cross-reactivity
- Created `AllergyList.tsx` component (300+ lines) with RxNav search
- Added `DRUG_CLASS_CROSS_REACTIONS` map for related medications
- Database trigger: `handle_new_user()` auto-creates profiles
- Enhanced `AddMedicationForm.tsx` with allergy checking
- Added TypeScript types: `Allergy`, `AllergySeverity`, `AllergyFormData`

---

## [0.6.1] - 2025-10-28

### Added

**Data Migration System**
- Automatic localStorage to Supabase migration for authenticated users
- Migration banner with "Import" and "Skip" options that appears once
- Preserves all medication data including name, dosage, directions, notes, verified status, and RxCUI codes
- Migration status tracking in database prevents repeat prompts
- Row Level Security ensures users only see their own migration data

**User Profile Management**
- Profile settings page at `/dashboard/profile`
- Edit name, phone number, and allergies
- Real-time form validation with success/error feedback
- Server-side data updates with RLS protection

**Password Management**
- Password reset flow (request link from login page)
- Password update page for authenticated users
- Password strength validation
- Secure email-based verification

### Fixed
- Dropdown no longer reopens after selecting medication from autocomplete (added `justSelected` state tracking)
- Improved medication form UX flow

### Changed
- Renamed "Frequency" field to "Directions" throughout the app for pharmacy accuracy
- Updated placeholder text with better examples: "Take 1 tablet daily", "Take half a tablet weekly"
- Field labels now match real prescription directions terminology

### Documentation
- Added `testing/MIGRATION-TESTING-GUIDE.md` with 10 comprehensive test scenarios
- Added console paste bypass instructions for testing
- Updated roadmap with prescription coupon feature (v0.8.x)
- Added real-world pharmacy insights to `FEATURE-PRESCRIPTION-COUPONS.md`
- Updated `SESSION-AUTH-COMPLETE.md` with migration system details
- Organized test documentation into `docs/testing/` directory

### Technical
- Added `migrations` table to track user migration status
- Created migration SQL: `003_add_migration_tracking.sql`
- Enhanced storage API to handle guest vs authenticated routing
- Added `justSelected` boolean flag to prevent search effect race conditions
- Updated TypeScript types and documentation for `frequency` field

---

## [0.6.0] - 2025-10-23

### Added

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

### UI Improvements
- Two-mode toggle (Clarity vs Clinical) with floating button
- Changed maintenance badge from purple to navy blue
- Improved form validation and error messages
- Better loading states during authentication

### Documentation
- Added `SUPABASE-SETUP.md` - Complete Supabase configuration guide
- Added `FEATURE-AUTHENTICATION.md` - Authentication implementation details
- Added `SECURITY-CHECKLIST.md` - Security best practices
- Added `FEATURES.md` - Consolidated detailed feature documentation
- Updated README.md - Concise version with v0.6.0 status
- Updated roadmap to use industry-standard versioning

### Technical Changes
- Added `@supabase/supabase-js` and `@supabase/ssr` dependencies
- Created `lib/supabase/` directory structure
- Added `database.types.ts` for TypeScript types
- Added `auth.ts` helper functions
- Created migration file `001_initial_schema.sql`
- Updated `.gitignore` for Supabase files
- Improved TypeScript type safety across auth flows

---

## [0.5.0] - 2025-10-11

### Added

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

### Fixed
- Fixed lisinopril not auto-checking as maintenance medication
- Fixed autocomplete not appearing for partial drug names (< 5 characters)
- Fixed search results appearing in random order

### UI Improvements
- Added dosage form indicator in dropdown (`🔵 Generic • Tablet`)
- Improved maintenance checkbox styling (blue info box with icon)
- Better explanation text for auto-suggestions

### Documentation
- Added `MAINTENANCE-MEDS-FEATURE.md` - Complete technical documentation
- Added `SMART-AUTOCOMPLETE-FEATURE.md` - Autocomplete implementation details
- Updated README with Phase 2 progress
- Created CHANGELOG.md

### Technical Changes
- Added `isMaintenance: boolean` field to Medication type
- Added `therapeuticClass?: string` for future ATC code storage
- Added `ingredients?: string[]` for combo drug interaction checking
- Created `lib/maintenance.ts` with detection logic
- Enhanced `lib/rxnav.ts` with hybrid search and advanced sorting
- Added storage migration for backward compatibility

---

## [0.4.0] - 2025-10-11

### Added
- **RxNav Autocomplete** - Live medication lookup with NIH RxNav API
- Generic (SCD) and Brand (SBD) drug results
- Auto-fill dosage from drug name
- Store RxCUI codes with medications
- Green "✓ Verified" badge on validated medications

### UI Improvements
- Search medications by name, dosage, frequency, or notes
- Beautiful autocomplete dropdown with hover states
- Loading spinner during API calls
- Empty state messages for no results

---

## [0.3.0] - 2025-10-10

### Added
- **Edit medications** - Click edit button, form prefills, update functionality
- **Real-time search/filter** - Search by name, dosage, frequency, notes

### UI Improvements
- Search bar with clear button
- Result count display
- Improved empty states

---

## [0.2.0] - 2025-10-09

### Changed
- Professional centered layout with max-width container
- Clean header bar with branding
- Large, obvious buttons with hover effects
- Beautiful medication cards with proper spacing
- Clear visual hierarchy (blue accents, typography)
- Improved empty state with icon and messaging

---

## [0.1.0] - 2025-10-08

### Added
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
- **Major Feature** - New significant functionality
- **Bug Fix** - Fixed broken behavior
- **UI Improvement** - Visual or UX enhancement
- **Documentation** - Added or updated docs
- **Technical** - Internal changes, refactoring
- **Breaking Change** - May require migration
