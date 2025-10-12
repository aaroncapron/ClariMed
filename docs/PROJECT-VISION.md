# Project Vision & Technical Roadmap

**Last Updated:** October 12, 2025

---

## 🎯 Core Vision

**"100% correct when showing info to the user. That is our priority."**

ClariMed helps users track medications with clarity and simplicity. No complexity, no confusion - just clear medication management.

---

## 🎨 Design Philosophy: Two Modes

### Clarity Mode (Default)
- **Icon:** 📄 Notepad
- **Target:** Patients who want essential info without overwhelm
- **Shows:**
  - Drug name, dosage, frequency
  - Simple "what it's for" description
  - Critical warnings only (red alerts)
  - ✓ Verified badge
- **Hides:** Technical details, ATC codes, complex pharmacology

### Clinical Mode (Power Users)
- **Icon:** 📚 Detailed Chart
- **Target:** Pharmacy techs, nurses, detail-oriented users
- **Shows Everything from Clarity Mode, PLUS:**
  - RxCUI codes
  - Therapeutic class (e.g., "C10AA05 - HMG CoA reductase inhibitor")
  - ATC classification (WHO codes)
  - Full indications & usage
  - Complete dosage & administration details
  - All contraindications
  - Comprehensive warnings & precautions
  - Drug interactions (all severity levels)
  - Special populations data
  - Active ingredients breakdown
  - Links to full prescribing information

---

## 📐 Complete Feature Roadmap

### Phase 1: Polish MVP ✅ COMPLETE (Oct 11, 2025)
- ✅ Fix UI layout and spacing
- ✅ Add landing page
- ✅ Improve button clarity
- ✅ Better visual design
- ✅ Simple navigation

**Result:** Professional-looking medication tracker with centered layout, clear buttons, beautiful cards, and proper spacing.

### Phase 2: Core Enhancements ⏳ (Current - Oct 12, 2025)
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
- 🔄 **Two-Mode System** (Clarity ↔ Clinical)
  - Toggle switch with smooth animations
  - Mode-specific views and data display
- 🔄 **DUR (Drug Utilization Review) & Interaction Checking**
  - **Component-level detection**: Extract ingredients from combo drugs (e.g., Percocet = acetaminophen + oxycodone)
  - Check interactions between ALL ingredients across all medications
  - **Color-coded severity:**
    - 🔴 **Red**: Life-threatening, serious injury risk (drug allergies, pregnancy contraindications, critical interactions)
    - 🟡 **Yellow/Orange**: Moderate severity, requires doctor discussion
    - 🔵 **Blue**: Informational notices
  - **Never hide interactions** - show all with appropriate severity
  - Display which specific component causes interaction
  - Educational framing: "Discuss with your doctor or pharmacist"
- 🔄 Sort options (name, date added, dosage, maintenance status)
- 🔄 **DailyMed & NIPH Integration**
  - Fetch detailed prescribing information via DailyMed API
  - Retrieve ATC classification codes
  - Cache data locally (IndexedDB) for 90-day freshness
  - Show "Last verified" timestamps
- Local caching of RxNav results
- Store **NDC codes** for precise product identification (future)

### Phase 3: Advanced Features
- **Enhanced interaction checking**
  - Ingredient-level interaction analysis
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

### Phase 5: PWA & Mobile
- Offline support with service workers
- Install as Progressive Web App
- **Native iOS/Android apps** (future expansion)
- Push notifications for medication reminders
- Background sync

### Phase 6: Polish & Accessibility
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

## 💾 Data Model

### Current (v0.5.0)
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
- [x] **Extract ingredients from combo drugs**
- [ ] Accurate ingredient-level interaction checking
- [ ] Component-specific interaction warnings
- [ ] Evidence-based recommendations with severity ratings
- [ ] Clear data sources attribution
- [ ] **Use NDC codes for precise identification** (future)
- [ ] **DailyMed API integration** for prescribing information
- [ ] **NIPH ATC classification codes** for therapeutic classes
- [ ] **Local data caching** with 90-day freshness
- [ ] **Show data timestamps**
- [ ] **Medical disclaimer** - Not a medical device, educational purposes only
- [ ] **Disclaimer: Government funding cuts may affect RxNav availability**

### User Experience
- [x] Simple, intuitive interface
- [x] Clear visual hierarchy
- [x] Obvious interactions
- [x] Helpful error messages
- [x] Smooth animations

### Data Privacy
- [x] Local-first storage
- [ ] Optional encryption
- [x] No data collection
- [x] User owns their data

### Reliability
- [x] Type-safe code
- [x] Error handling
- [x] Data validation
- [ ] Offline support
- [ ] Backup options

---

## 📝 Why We Restarted

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

## ⚠️ Important Notes

### RxNorm Licensing & Risks
- ✅ **RxNav API** - Free, no account needed, public domain SAB=RXNORM data
- ✅ **Current Prescribable Content Subset** - Free download, no license required
- ⚠️ **Full RxNorm Release Files** - Requires free UMLS UTS account
- ⚠️ **Non-RXNORM Sources** - May require additional licensing
- ⚠️ **Government Funding Risk** - Recent spending cuts may affect data freshness and API availability

### Risk Mitigation Strategy
- **Cache API responses locally** to reduce dependency
- **Download prescribable subset** for offline backup
- **Show data timestamps** and freshness indicators
- **Don't block core functionality** if API is unavailable
- **Always include medical disclaimer** about consulting healthcare providers

---

**This document contains the complete technical vision for ClariMed.**
