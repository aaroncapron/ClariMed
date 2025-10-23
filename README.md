# ClariMed - Simple Medication Tracker

**A clean, straightforward medication management PWA for personal use.**

---

## 🎯 Project Vision

**Tagline:** "100% correct when showing info to the user. That is our priority."

ClariMed helps users track medications with clarity and simplicity. No complexity, no confusion - just clear medication management.

---

## 📋 Current Status: Authentication & Security Foundation 🔐

**Latest:** October 23, 2025 - Setting up user accounts with Supabase!

### What's Working (v0.5.0 - Maintenance Meds & Smart Search! 🎉)
- ✅ Add medications (name, dosage, frequency, notes)
- ✅ **Edit medications** - Click edit button, form prefills, update functionality
- ✅ **Search medications** - Real-time search by name, dosage, frequency, or notes
- ✅ **RxNav Smart Autocomplete** - Intelligent medication lookup with NIH RxNav API
  - 🔵 Generic drug results (SCD)
  - 🟢 Brand name results (SBD)
  - **Hybrid search**: Falls back to `approximateTerm` API for partial matches (e.g., "lisin" finds lisinopril)
  - **Smart sorting**: Tablets → Capsules → Liquids, Generic before Brand, Lowest to Highest dose
  - **Brand name formatting**: "Prinivil (lisinopril) 10 MG" instead of "lisinopril 10 MG [Prinivil]"
  - **Deduplication**: Removes duplicate packages/manufacturers, shows one per formulation
  - Auto-fill dosage from drug name
  - Stores RxCUI codes for future interaction checking
  - **✓ Verified badge** on validated medications
  - Fast 150ms debounce for responsive autocomplete
- ✅ **Maintenance Medication Detection** 🆕
  - Smart auto-detection based on drug class (statins, BP meds, diabetes, thyroid, etc.)
  - User can override any suggestion
  - **Navy blue "Maintenance" badge** on medication cards (in Clinical mode)
  - Helpful explanations (e.g., "Blood pressure medication - ACE inhibitor")
  - Covers: ACE inhibitors, ARBs, beta blockers, CCBs, statins, diabetes meds, anticoagulants, and more
- ✅ **Two-Mode Toggle** 🆕 (Oct 12, 2025)
  - **Clarity Mode** (📄 Teal): Simple, minimal view for everyday users
  - **Clinical Mode** (📚 Navy): Detailed view with all medical information
  - Floating toggle button (bottom-right corner)
  - localStorage remembers your preference
  - Auto-scroll to edit form when clicking Edit button
- ✅ View medication list with beautiful cards
- ✅ Delete medications with confirmation
- ✅ localStorage persistence (survives page refresh)
- ✅ **Professional centered layout** with max-width container
- ✅ **Clean header bar** with branding and primary action
- ✅ **Large, obvious buttons** with hover effects
- ✅ **Beautiful medication cards** with proper spacing and badges
- ✅ **Clear visual hierarchy** - blue accents, proper typography
- ✅ **Improved empty states** - icon and helpful messaging for both empty list and no search results
- ✅ TypeScript type safety

### 🚧 In Development (Oct 23, 2025)
- 🔐 **Authentication System** - Supabase setup for secure user accounts
  - Email/password authentication
  - Row Level Security for data privacy
  - User profiles with allergies
  - Multi-device sync
- 🐾 **Pet Medication Tracking** - Track meds for your furry friends
- 💰 **Prescription Savings Finder** - MySimpleRX + GoodRx integration
- 🔔 **Message Center** - In-app notifications for reminders & refills
- 📄 **PDF Export** - Print medication list for doctors

### Up Next 🎯
- Sort medications (by name, date added, dosage, maintenance status)
- **DUR & Interaction Checking** (Phase 2 priority)
- OTC/Supplement tracking
- Advanced filtering with API data

---

## 🛠️ Tech Stack

### Core
- **Next.js 14** - React framework (App Router)
- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling

### Database & Authentication (NEW! 🔐)
- **Supabase** - PostgreSQL database + authentication
- **Row Level Security** - Users can only access their own data
- **@supabase/ssr** - Server-side rendering support

### Storage
- **Supabase PostgreSQL** - Secure cloud database (in progress)
- **localStorage** - Legacy support (will migrate to Supabase)

### Future Additions
- PWA capabilities (service worker, offline support)
- Push notifications (native apps)
- Encryption for sensitive data

---

## 🎨 Design Philosophy

### Two Modes: Clarity vs Clinical 🔄
**Toggle Switch:** Always visible, smooth Tailwind animations between modes

#### 1. **Clarity Mode** (Default for most users)
- **Icon**: 📋 Notepad
- **Target Audience**: Patients who want essential info without overwhelm
- **What's Shown**:
  - Maintenance medications (front and center)
  - Drug name, dosage, frequency
  - Simple "What it's for" description
  - Critical warnings only (red alerts)
  - "✓ Verified" badge
- **Hidden**: Technical details, ATC codes, complex pharmacology
- **View All Option**: "Show all medications" button to see non-maintenance meds

#### 2. **Clinical Mode** (For healthcare workers, power users)
- **Icon**: 📊 Detailed Chart
- **Target Audience**: Pharmacy techs, nurses, detail-oriented users
- **What's Shown**:
  - ALL medications (maintenance + PRN + discontinued)
  - Sorted: Most recent to oldest
  - Everything from Clarity Mode, PLUS:
    - RxCUI codes
    - Therapeutic class (e.g., "C10AA05 - HMG CoA reductase inhibitor")
    - ATC classification (WHO codes)
    - Full indications & usage (from DailyMed API)
    - Complete dosage & administration details
    - All contraindications
    - Comprehensive warnings & precautions
    - Drug interactions (all severity levels with detailed descriptions)
    - Special populations (pregnancy, pediatric, geriatric, renal/hepatic)
    - Active ingredients breakdown
    - Links to full prescribing information

### Current Focus
- Start with clean, centered layouts
- Clear visual hierarchy
- Obvious interactive elements
- Smooth transitions
- Mobile-first responsive design
- **Mode toggle accessible on all pages**

---

## 📐 Immediate Next Steps (UI Improvements)

### 1. Fix Layout Issues
- [ ] Center content properly
- [ ] Add proper spacing/padding
- [ ] Create max-width container
- [ ] Improve vertical rhythm

### 2. Add Landing Page
- [ ] Welcome screen on first visit
- [ ] Clear CTAs (Call To Actions)
- [ ] Overview of features
- [ ] "Get Started" flow

### 3. Improve Buttons & Interactions
- [ ] Larger, more obvious buttons
- [ ] Clear hover states
- [ ] Better contrast
- [ ] Loading states where needed
- [ ] Confirmation dialogs

### 4. Navigation
- [ ] Simple header/nav bar
- [ ] Clear page structure
- [ ] Breadcrumbs if needed

### 5. Empty States
- [ ] Better "no medications" view
- [ ] Helpful onboarding messages
- [ ] Visual guides

---

## 🗺️ Feature Roadmap

### Phase 1: Polish MVP ✅ COMPLETE (Oct 11, 2025)
- ✅ Fix UI layout and spacing
- ✅ Add landing page
- ✅ Improve button clarity
- ✅ Better visual design
- ✅ Simple navigation

**Result:** Professional-looking medication tracker with centered layout, clear buttons, beautiful cards, and proper spacing.

### Phase 2: Core Enhancements ⏳ (Current - Oct 11, 2025)
- ✅ Edit existing medications
- ✅ Search/filter medications (by name, dosage, frequency, notes)
- ✅ **RxNorm API integration** for medication lookup & validation
- ✅ **Smart Autocomplete** medication names using RxNav
  - ✅ Hybrid search (drugs.json + approximateTerm for partial matches)
  - ✅ Brand name formatting (brand first, generic in parentheses)
  - ✅ Intelligent sorting (form → generic/brand → dosage strength → alphabetical)
  - ✅ Deduplication (one entry per formulation)
  - ✅ Fast 150ms response time
- ✅ **Handle multiple results** (generics and brands)
- ✅ Store RxNorm CUI codes with medications
- ✅ **Verification badge** for API-validated medications
- ✅ **Maintenance Medication Detection** ⭐ COMPLETE!
  - ✅ Smart auto-suggestion based on drug patterns and ATC codes
  - ✅ User override capability (always editable)
  - ✅ Purple "Maintenance" badge on medication cards
  - ✅ Helpful explanations (drug class specific)
  - ✅ Covers: ACE inhibitors, ARBs, beta blockers, CCBs, statins, diabetes meds, thyroid, anticoagulants, antiepileptics, immunosuppressants
  - 🔄 Filter Clarity Mode to show maintenance meds first (next step!)
- 🔄 **Two-Mode System** (Clarity ↔ Clinical)
  - Toggle switch with smooth animations
  - Mode-specific views and data display
  - Toggle switch with smooth animations
  - Mode-specific views and data display
- 🔄 **DUR (Drug Utilization Review) & Interaction Checking**
  - **Component-level detection**: Extract ingredients from combo drugs (e.g., Percocet = acetaminophen + oxycodone)
  - Check interactions between ALL ingredients across all medications
  - **Color-coded severity**:
    - 🔴 **Red**: Life-threatening, serious injury risk (drug allergies, pregnancy contraindications, critical interactions)
    - 🟡 **Yellow/Orange**: Moderate severity, requires doctor discussion
    - 🔵 **Blue**: Informational notices
  - **Never hide interactions** - show all with appropriate severity
  - Display which specific component causes interaction (e.g., "Percocet (acetaminophen) interacts with Warfarin")
  - Educational framing: "Discuss with your doctor or pharmacist"
- 🔄 Sort options (name, date added, dosage)
- 🔄 **DailyMed & NIPH Integration**
  - Fetch detailed prescribing information via DailyMed API
  - Retrieve ATC classification codes from Norwegian Institute of Public Health
  - Cache data locally (IndexedDB) for 90-day freshness
  - Show "Last verified" timestamps
- Local caching of RxNav results
- Store **NDC codes** for precise product identification (future)
- Medication categories/tags
- Due date/reminder tracking

### Phase 3: Advanced Features
- **Enhanced interaction checking**
  - Ingredient-level interaction analysis (complete)
  - Severity ratings with evidence-based recommendations
  - Support for combo drug interactions
- **Download RxNorm prescribable subset for offline use**
  - Optional 100MB download with progress bar & cancel
  - Enables offline medication lookup
  - Faster autocomplete without API calls
- **Local database storage** (reduce API dependency)
- Medication history/timeline (including discontinued meds)
- Export data (PDF, JSON)
- Print-friendly views

### Phase 4: Security, Authentication & User Profiles 🔐
**Technology Stack: Supabase (PostgreSQL + Auth)**
- **Secure authentication system**
  - Email/phone verification
  - Password requirements following industry standards
  - Optional 2FA (two-factor authentication)
  - OAuth options (Google, Apple)
- **Patient Profile & Medical History**
  - Allergies (drug, food, environmental)
  - Medical conditions (chronic diseases, current diagnoses)
  - Pregnancy status
  - Age/Date of Birth
  - Preferred pharmacy location (for coupon finder)
  - Additional DUR checks:
    - Drug-allergy interactions
    - Drug-disease contraindications
    - Age-specific warnings
    - Pregnancy category alerts
- **Data encryption & privacy**
  - HTTPS (transport layer) ✅ Already implemented via Vercel
  - Database encryption at rest (Supabase provides)
  - End-to-end encryption for sensitive fields
  - **PHI (Protected Health Information) compliance**
  - Local-first with cloud backup option
- **Multi-device sync** (optional)
- Backup/restore functionality
- User owns their data - export anytime

### Phase 5: Prescription Coupon Finder 💰
**"Find prescription coupons at your preferred pharmacy - helping patients afford their medications."**
- Search for prescription discount coupons by medication and location
- Compare prices across multiple pharmacies (Walgreens, CVS, Walmart, etc.)
- Filter by preferred pharmacy or closest location
- Show savings comparison: retail price vs. coupon price vs. insurance co-pay
- Digital coupon delivery (barcode, printable, SMS)
- Integration with GoodRx, SingleCare, or similar coupon providers
- Patient assistance program links (NeedyMeds)
- **Perfect for:** Patients with inadequate insurance or no insurance
- Price drop alerts for refill reminders
- Multi-medication total savings calculator

### Phase 6: PWA & Mobile
- Offline support with service workers
- Install as Progressive Web App
- **Native iOS/Android apps** (future expansion)
- Push notifications for medication reminders
- Background sync

### Phase 5: Polish & Accessibility
- Accessibility audit (WCAG compliance)
- Screen reader optimization
- Keyboard navigation
- Dark mode
- Custom themes
- Advanced settings
- Help/documentation
- **Medical disclaimer** (prominent, clear, non-intrusive)
  - "This is not medical advice. Always consult your healthcare provider."
  - Displayed during onboarding and accessible at all times

---

## 📁 Project Structure

```
ClariMed/
├── app/                   # Next.js app directory
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── MedicationList.tsx
│   └── AddMedicationForm.tsx
├── lib/                   # Utilities
│   └── storage.ts         # localStorage wrapper
├── types/                 # TypeScript types
│   └── index.ts           # Core types
├── _archive/              # Old complex codebase (reference)
├── public/                # Static assets
├── package.json           # Dependencies
├── tsconfig.json          # TypeScript config
├── tailwind.config.js     # Tailwind config
└── README.md              # This file
```

---

## 🚀 Getting Started

### Development
```bash
npm run dev        # Start dev server at http://localhost:3000
npm run build      # Build for production
npm run start      # Start production server
```

### Adding Features
1. Keep it simple
2. Test thoroughly
3. Maintain type safety
4. Update this README

---

## 💾 Data Model (Current)

```typescript
interface Medication {
  id: string;              // UUID
  name: string;            // "Lisinopril 10mg"
  dosage: string;          // "10mg"
  frequency: string;       // "Once daily"
  notes?: string;          // Optional notes
  rxcui?: string;          // RxNorm CUI (from RxNav API)
  verified?: boolean;      // API validation status
  isMaintenance: boolean;  // User-defined or auto-suggested
  therapeuticClass?: string; // ATC code (e.g., "C10AA05")
  ingredients?: string[];  // Array of ingredient RxCUIs (for combo drugs)
  createdAt: string;       // ISO date
  updatedAt: string;       // ISO date
}
```

### Future Enhancements (Phase 3+)
- Add `ndcCode` for barcode/precise product identification
- Add `discontinued` boolean and `discontinuedDate`
- Add `schedule` for reminders
- Add `refillDate` tracking
- Add `prescriber` information
- Add `pharmacy` information

### Future Patient Profile (Phase 4 - Post-Authentication)
```typescript
interface UserProfile {
  id: string;
  email: string;
  allergies: Allergy[];         // Drug, food, environmental
  conditions: MedicalCondition[]; // Chronic diseases, diagnoses
  dateOfBirth: string;          // For age-specific warnings
  pregnancyStatus?: boolean;    // Pregnancy contraindication checks
  createdAt: string;
  updatedAt: string;
}

interface Allergy {
  id: string;
  allergen: string;             // Name of allergen
  rxcui?: string;               // If drug allergy
  severity: 'mild' | 'moderate' | 'severe' | 'anaphylaxis';
  reaction: string;             // Description of reaction
}

interface MedicalCondition {
  id: string;
  condition: string;            // Name of condition
  icdCode?: string;             // ICD-10 code (optional)
  diagnosedDate?: string;
  isActive: boolean;
}
```

---

## 🎯 Core Requirements Checklist

### Medical Accuracy
- [x] Validate drug names against RxNorm
- [x] Store RxCUI codes for identification
- [x] **Handle multiple drug formulations** (generics and brands)
- [x] **Extract ingredients from combo drugs** (e.g., Percocet = acetaminophen + oxycodone)
- [ ] Accurate ingredient-level interaction checking
- [ ] Component-specific interaction warnings (show which ingredient causes issue)
- [ ] Evidence-based recommendations with severity ratings
- [ ] Clear data sources attribution
- [ ] **Use NDC codes for precise identification** (future)
- [ ] **DailyMed API integration** for prescribing information
- [ ] **NIPH ATC classification codes** for therapeutic classes
- [ ] **Local data caching** with 90-day freshness (don't rely solely on live API)
- [ ] **Show data timestamps** ("Last verified: Oct 11, 2025")
- [ ] **Medical disclaimer** - Not a medical device, educational purposes only
- [ ] **Disclaimer: Government funding cuts may affect RxNav availability**

### User Experience
- [x] Simple, intuitive interface
- [ ] Clear visual hierarchy
- [ ] Obvious interactions
- [ ] Helpful error messages
- [ ] Smooth animations

### Data Privacy
- [ ] Local-first storage
- [ ] Optional encryption
- [ ] No data collection
- [ ] User owns their data

### Reliability
- [x] Type-safe code
- [ ] Error handling
- [ ] Data validation
- [ ] Offline support
- [ ] Backup options

---

## 📝 Notes

### Why We Restarted
The original codebase had:
- Complex XState v5 state machines
- Heavy Zod validation schemas
- IndexedDB with Dexie
- 65+ tests
- Over-engineered architecture

**Too complex for a solo developer to maintain.**

New approach:
- Start simple, add complexity only when needed
- Use standard tools (localStorage, React state)
- Build features based on actual use
- Keep everything understandable

---

## 🤝 Contributing (Future)

This is currently a personal project. If open-sourced:
- Follow existing code style
- Write tests for new features
- Update documentation
- Keep changes focused

---

## 📄 License

TBD - Currently private/personal use

---

## 🔗 Resources

### Development
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)

### Medical Data APIs
- **RxNorm Overview** - [NLM RxNorm](https://www.nlm.nih.gov/research/umls/rxnorm/overview.html)
- **RxNorm Technical Docs** - [Documentation](https://www.nlm.nih.gov/research/umls/rxnorm/docs/index.html)
- **RxNav API** - [REST API](https://rxnav.nlm.nih.gov/RxNavAPIs.html) ⭐ **FREE, No License Required**
- **RxNav Browser** - [Interactive Browser](https://mor.nlm.nih.gov/RxNav/)
- **OpenFDA Drug API** - [Drug Information](https://open.fda.gov/apis/drug/)

### RxNorm Licensing (Important!)
- ✅ **RxNav API** - Free, no account needed, public domain SAB=RXNORM data
- ✅ **Current Prescribable Content Subset** - Free download, no license required
- ⚠️ **Full RxNorm Release Files** - Requires free UMLS UTS account
- ⚠️ **Non-RXNORM Sources** - May require additional licensing from providers
- ⚠️ **Government Funding Risk** - Recent spending cuts may affect data freshness and API availability
- 📄 [UMLS License Info](https://uts.nlm.nih.gov/uts/)

### Risk Mitigation
- **Cache API responses locally** to reduce dependency
- **Download prescribable subset** for offline backup
- **Show data timestamps** and freshness indicators
- **Don't block core functionality** if API is unavailable
- **Always include medical disclaimer** about consulting healthcare providers

---

**Last Updated:** October 11, 2025  
**Version:** 0.5.0 (Maintenance Meds & Smart Search! 🎉)  
**Status:** Active Development 🚧

### Recent Updates (v0.5.0 - Oct 11, 2025)
- ✅ **Maintenance Medication Detection** with smart auto-suggestion
- ✅ **Hybrid Search** (approximateTerm fallback for partial matches)
- ✅ **Intelligent Sorting** (form → generic/brand → strength → alphabetical)
- ✅ **Brand Name Formatting** (brand first, generic in parentheses)
- ✅ **Deduplication** (one entry per drug formulation)
- ✅ **Fast 150ms Autocomplete** response time
- ✅ **Purple Maintenance Badge** on medication cards
- ✅ **Drug Class Explanations** (ACE inhibitors, statins, etc.)