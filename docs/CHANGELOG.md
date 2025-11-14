# ClariMed - Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased] - Surgical Refactor (In Progress)

### BREAKING CHANGES
- **Removed localStorage support** - Application now requires authentication
- **Removed data migration system** - No longer migrates data from guest to authenticated users
- **Removed drug-drug interaction checking** - RxNav interaction API discontinued (404 errors)
- **Authentication required** - All medication storage operations require Supabase login

### Removed
- Deleted `lib/storage/local.ts` - localStorage medication operations
- Deleted `lib/storage/migration.ts` - data migration utilities  
- Deleted `components/MigrationBanner.tsx` - migration prompt UI
- Deleted `lib/supabase/database.types.ts` - corrupted auto-generated types
- Removed drug interaction checking from `AddMedicationForm`
- Removed interaction warnings from medication cards and dashboard
- Removed localStorage fallback from storage layer

### Changed
- **Storage layer now Supabase-only** - `lib/storage/index.ts` requires authenticated user
- **Type system aligned with database schema** - Created clean `lib/supabase/db.types.ts`
- Fixed field mappings: `allergen` (not `allergy`), `diagnosed_date`, `last_fill_date`
- Fixed `ingredients` stored as `text[]` in database (not JSON)
- Updated `lib/allergies.ts`, `lib/health-conditions.ts`, `lib/storage/supabase.ts` with correct types
- `InteractionSummary` component now shows "unavailable" message
- Enhanced health alert visibility with amber background shading on medication cards

### Added
- Clean build script (`scripts/clean-build.js`) to handle Windows `.next/trace` lock issues
- New npm scripts: `npm run clean` and `npm run rebuild`
- Amber-50 background tint for medication cards with critical/major warnings
- Darker amber-400 borders for better warning visibility on white backgrounds

### Fixed
- Resolved TypeScript compilation errors from schema mismatches
- Fixed Supabase insert/update operations with proper type casting
- Eliminated "pathspec did not match" git commit errors on Windows
- Build now completes with 0 errors (17 routes optimized)
- All 140 tests passing

---

## [0.9.0] - 2025-11-04

### Added

**Enhanced Drug Utilization Review (DUR) System**
- Health conditions management UI on profile page
- `HealthConditionList` component with autocomplete from 40+ common conditions
- Category-based condition organization (cardiovascular, respiratory, endocrine, pregnancy, etc.)
- Contraindication checking when adding medications
- Health condition alerts displayed in confirmation dialog
- **Contraindication warnings displayed on dashboard for existing medications**
- Real-time checking of medications against user's health conditions
- Severity-based warnings: Critical, Major, Moderate, Minor
- **Expanded pregnancy contraindication database** with 23 medication classes including:
  - Hormonal medications (estrogen, estradiol, birth control pills, testosterone)
  - Teratogenic drugs (isotretinoin, valproic acid, methotrexate, thalidomide)
  - Anti-seizure medications (phenytoin, carbamazepine)
  - Cardiovascular drugs (ACE inhibitors, ARBs, statins)
  - Antibiotics (tetracyclines, fluoroquinolones, aminoglycosides)
  - Hair loss medications (finasteride, dutasteride)
  - And many more with detailed descriptions

**Dashboard Safety Display**
- Health condition alert badges shown in both clarity and clinical modes
- Expandable contraindication details in clinical mode
- Color-coded severity indicators (red for critical, orange for major, etc.)
- Combines interaction warnings and health condition alerts
- Automatic checking when health conditions are added or updated

**Safety Enhancements**
- Pregnancy contraindications: ACE inhibitors, statins, warfarin
- Kidney disease warnings: NSAIDs, metformin
- Liver disease alerts: Acetaminophen (high doses), methotrexate
- Asthma warnings: NSAIDs, beta blockers
- **Expanded contraindication coverage** with 11 new health condition categories:
  - **COPD/Chronic Obstructive Pulmonary Disease**: Beta blockers (bronchospasm), benzodiazepines (respiratory depression)
  - **Osteoporosis**: Corticosteroids (bone loss), proton pump inhibitors (calcium absorption)
  - **Depression**: Beta blockers and corticosteroids (mood worsening)
  - **Dementia/Cognitive Impairment**: Anticholinergics (cognitive decline), benzodiazepines (fall risk)
  - **Myasthenia Gravis**: Fluoroquinolones (crisis risk), beta blockers and aminoglycosides (muscle weakness)
  - **Long QT Syndrome**: Azithromycin, ondansetron (QT prolongation), methadone (sudden cardiac death)
  - **Arrhythmia**: Azithromycin (rhythm disturbance)
  - **Bleeding Disorder**: NSAIDs, antiplatelet drugs (hemorrhage risk)
  - **Thyroid Disease**: Amiodarone (thyroid dysfunction), lithium (hypothyroidism)
  - **Prostate Enlargement/BPH**: Anticholinergics (urinary retention), decongestants (obstruction)
- Comprehensive contraindication database now covering 34+ health conditions

**User Interface Improvements**
- Health conditions section added to profile page
- Autocomplete suggestions for common medical conditions
- Condition categories with color coding
- Contraindication warnings integrated into medication confirmation dialog

### Fixed

**CRITICAL SAFETY FIX**
- Fixed allergy detection bug where brand names with generic in parentheses/brackets weren't matching
- Before: "Ansaid (flurbiprofen)" allergy failed to catch "Flurbiprofen" medication
- After: Properly extracts generic names from both `()` and `[]` notation
- Enhanced `extractIngredients()` function with dual regex patterns
- Added 6 comprehensive tests for bracket/parentheses scenarios

### Technical
- Created `components/HealthConditionList.tsx`
- Created `lib/health-conditions.ts` for Supabase CRUD operations
- Created `lib/contraindications.ts` with comprehensive medication safety rules
- Created `lib/medical-reference.ts` with 18 common allergies and 40+ conditions
- Database migration `006_health_conditions.sql` with RLS policies
- 85 contraindication tests, 60 medical reference tests
- All 159 tests passing

### Documentation
- Updated `.copilot-instructions.md` with Windows cmd.exe git commit format
- Created `docs/ENHANCED-DUR-SYSTEM.md` with detailed technical documentation

### Compliance
- All warnings remain informational and non-blocking
- FDA disclaimer included in all confirmation dialogs
- Maintains wellness tool classification

---

## [0.8.0] - 2025-11-11

### Added

**Legal Pages & Compliance**
- Created Terms of Service page (`/terms`) with RxNav non-commercial use requirements
- Created Privacy Policy page (`/privacy`) with comprehensive data protection disclosure
- Created Attributions page (`/attributions`) with required RxNav/NLM attribution
- All legal pages include FDA medical disclaimers and professional consultation warnings
- Cross-linked legal pages in footer and between each page
- Responsive design with professional typography and clear section hierarchy

**Refill Tracking System**
- Refill management fields in medication database and UI
- Track refills remaining, total refills authorized, fill dates, and pickup dates
- Low refill warnings (amber badge when ≤2 refills remaining)
- Next refill date calculation and display
- Estimated pharmacy pickup date tracking
- Database migration adds 7 new refill-related columns to medications table

**Storage Layer Refactoring**
- Modular storage architecture with clean separation of concerns
- `lib/storage/supabase.ts` - Supabase-specific operations
- `lib/storage/local.ts` - localStorage operations for guest users
- `lib/storage/migration.ts` - Data migration utilities
- `lib/storage/index.ts` - Unified API that routes to correct backend
- Backward compatible with existing code using storage layer

**Field Renaming**
- Changed `dosage` field to `quantity` for clarity
- Database migration migrates existing dosage data to quantity column
- Updated all components, forms, and search filters
- Quantity examples: "30 tablets", "1 patch box" (not strength/dosage)

**Enhanced DUR System**
- Async versions of allergy checking using RxNav API
- `checkAllergyConflictsAsync()` provides real-time cross-reactivity detection
- Enhanced ingredient extraction handles parentheses and brackets
- Better generic name matching from brand name entries

### Changed
- Footer component now links to legal pages instead of markdown files
- Database field naming standardized: snake_case in DB → camelCase in TypeScript
- Health conditions mapping fixed for proper field name translation
- Improved search functionality uses `quantity` instead of `dosage`

### Fixed
- TypeScript compilation errors from dosage→quantity refactoring
- Database field name mismatches (created_at vs createdAt) in health conditions
- All 159 tests passing with updated expectations
- Production build succeeds with zero errors

### Technical
- Created 3 legal page components with Next.js metadata
- Database migration: ADD quantity, refill tracking fields; migrate dosage→quantity
- Enhanced `types/index.ts` with refill tracking fields
- Updated storage layer across all modules
- Fixed contraindications test expectations for severity levels
- Enhanced `lib/health-conditions.ts` with proper field mapping

### Documentation
- Legal pages serve as documentation for terms, privacy, and attributions
- Updated copilot instructions with deployment pipeline requirements
- CHANGELOG.md updated with comprehensive v0.8.0 changes

### Compliance
- RxNav non-commercial use terms prominently displayed
- Medical disclaimers on all drug safety features
- Privacy policy covers Supabase, RxNav, and Vercel data sharing
- User data rights clearly documented (access, edit, delete, export)
- Children's privacy protection (under 13) included

---

## [Unreleased]

### Added

**Enhanced User Safety Features**
- Confirmation dialog when adding medications with allergy conflicts or drug interactions
- Modal overlay displays warning summary before final confirmation
- "Add Anyway" option maintains user autonomy while emphasizing informed decisions
- Interaction summary banner on dashboard (above medication list)
- Mode-specific summary designs: compact for clarity mode, detailed for clinical mode
- Per-medication interaction indicators with severity-based color coding
- Clickable interaction badges in clinical mode to expand full details
- Amber border highlighting for medications with critical or major interactions

**Dashboard Improvements**
- `InteractionSummary` component shows overall interaction count and severity distribution
- Expandable interaction details in clinical mode
- Individual medication cards show interaction count badges
- Visual distinction between medications with and without interactions
- Real-time interaction checking across medication list

### Technical
- Created `components/InteractionSummary.tsx` with mode-specific views
- Enhanced `MedicationList.tsx` to check and display interactions per medication
- Added confirmation dialog state management to `AddMedicationForm.tsx`
- Integrated interaction checking into medication list rendering
- Modal displays allergy warnings and drug interactions with severity badges

### Compliance
- Confirmation dialog includes FDA disclaimer
- User can cancel or proceed with full awareness
- All warnings remain informational and non-blocking
- Maintains wellness tool classification

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
