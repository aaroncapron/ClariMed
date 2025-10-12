# ClariMed - Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

## Upcoming (v0.6.0+)

### Planned Features
- **Two-Mode Toggle** (Clarity ↔ Clinical)
- **Sorting Options** (name, date added, dosage, maintenance status)
- **DUR & Interaction Checking** (using RxNav interaction API)
- **Export Data** (JSON/PDF)
- **Dark Mode**

### Phase 4+ (Future)
- Supabase authentication
- Patient profile (allergies, conditions)
- Multi-device sync
- PWA offline support
- iOS/Android native apps

---

**Legend:**
- 🎉 **Major Feature** - New significant functionality
- 🐛 **Bug Fix** - Fixed broken behavior
- 🎨 **UI Improvement** - Visual or UX enhancement
- 📝 **Documentation** - Added or updated docs
- 🔧 **Technical** - Internal changes, refactoring
- ⚠️ **Breaking Change** - May require migration
