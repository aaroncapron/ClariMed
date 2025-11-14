# ClariMed Technical Specification

**Last Updated**: November 13, 2025

## Table of Contents
1. [Feature Requirements](#feature-requirements)
2. [API Integration Strategy](#api-integration-strategy)
3. [Data Models](#data-models)
4. [User Interface Components](#user-interface-components)
5. [Safety & Compliance](#safety--compliance)
6. [Prescription Savings Integration](#prescription-savings-integration)

---

## Feature Requirements

### 1. Health Profile Management

**User Profile Storage**:
- Allergies (with SNOMED CT codes)
- Health conditions (with SNOMED CT codes)
- Persistent storage in Supabase
- Always visible on dashboard (header component)

**UI Requirements**:
- Fixed header button: "Allergies & Conditions" or "Health Profile"
- Quick view modal/dropdown
- Edit capability inline
- Visual indicators (badge count) when profile incomplete

### 2. Medication Entry Enhancement

**Medication Name/NDC Field**:
- Combined input: "Medication Name/NDC"
- NDC lookup via RxNorm `/findRxcuiById?idtype=NDC`
- NDC purpose: Manufacturer identification for DAW/BMN prescriptions
- Example: Levoxyl (brand) vs generic levothyroxine

**NDC Integration Options**:
1. **Primary**: Separate NDC field (optional)
2. **Alternative**: Notes field for manufacturer info

**Recommendation**: Implement optional NDC field with manufacturer display.

### 3. Drug Utilization Review (DUR) System

**FDA Compliance**: NOT a medical device. Informational only.

#### Interaction Checks (Automatic)

**Drug-Allergy Check**:
- Trigger: User adds medication
- Check against: User's allergy profile
- Example: Amoxicillin-clavulanate + Penicillin allergy
- Action: Full-screen modal warning

**Drug-Drug Check**:
- Trigger: User adds medication
- Check against: Existing medications
- Method: RxClass therapeutic class comparison
- Examples:
  - Multiple SSRIs (serotonin syndrome risk)
  - Multiple statins (rhabdomyolysis risk)
  - Warfarin + NSAIDs (bleeding risk)
  - MAOIs + sympathomimetics (hypertensive crisis)

**Drug-Condition Check**:
- Trigger: User adds medication
- Check against: User's health conditions
- Method: UMLS CUI mapping (drug → condition)
- Examples:
  - Beta-blockers + asthma
  - NSAIDs + kidney disease
  - Metformin + renal impairment

#### Warning Modal Requirements

**Display**:
- Full-screen overlay (blocks dashboard)
- Severity-coded (critical/major/moderate)
- Clear, non-prescriptive language

**Content Template**:
```
⚠️ Potential Interaction Detected

[Drug Name] may interact with your [allergy/medication/condition]:
[Brief description from knowledge base]

This is informational only. Consult your healthcare provider 
or pharmacist with questions.

[Review Information] [Add Anyway]
```

**FDA Compliance**:
- NO recommendations to discontinue
- NO dosing advice
- NO treatment suggestions
- Always include provider consultation disclaimer

### 4. Interaction Display

**Medication Cards**:
- Small badge indicator on cards with interactions
- Color-coded by severity:
  - Red: Critical
  - Orange: Major
  - Yellow: Moderate
  - Blue: Minor

**Badge Content**: "⚠️ 2 interactions" (clickable)

**Detail View**: Modal with full interaction list

### 5. Directions Policy

**User Input Only**:
- NO default directions
- NO autocomplete for directions
- User types exactly what their prescription says
- Frequency field: Free text, user-defined

**Rationale**: FDA compliance - not a prescribing tool

---

## API Integration Strategy

### RxNorm Prescribable API

**Base URL**: `https://rxnav.nlm.nih.gov/REST/prescribable/`

**Key Endpoints**:

| Endpoint | Usage | Priority |
|----------|-------|----------|
| `/approximateTerm` | Medication search/autocomplete | ✅ Active |
| `/drugs` | Drug lookup by name | ✅ Active |
| `/rxcui/{rxcui}/related?tty=IN` | Get ingredients | ✅ Active |
| `/rxcui/{rxcui}/ndcs` | Get NDC codes | 🔄 Implement |
| `/findRxcuiById?idtype=NDC` | NDC → RxCUI lookup | 🔄 Implement |
| `/rxcui/{rxcui}/allProperties` | Full drug details | ⏳ Future |
| `/spellingsuggestions` | Typo correction | ⏳ Future |

**Interaction Endpoint Status**: ❌ Deprecated (404 errors)

### RxClass API

**Base URL**: `https://rxnav.nlm.nih.gov/REST/rxclass/`

**Purpose**: Drug classification for interaction detection

**Key Endpoints**:

| Endpoint | Usage | Priority |
|----------|-------|----------|
| `/class/byRxcui?rxcui={rxcui}&relaSource=ATC` | Get drug class | 🔄 Implement |
| `/classMembers?classId={id}` | Get drugs in class | 🔄 Implement |

**Classification Systems**:
- **ATC**: Primary (WHO standard)
- **EPC**: Secondary (FDA Established Pharmacologic Class)
- **MESHPA**: Tertiary (pharmacological actions)

### UMLS API

**Base URL**: `https://uts-ws.nlm.nih.gov/rest/`

**Authentication**: Requires API key (we have UMLS license)

**Key Endpoints**:

| Endpoint | Usage | Priority |
|----------|-------|----------|
| `/search/current?sabs=SNOMEDCT_US` | Health condition autocomplete | 🔄 Implement |
| `/content/current/CUI/{cui}` | Concept details | 🔄 Implement |
| `/content/current/CUI/{cui}/relations` | Drug-condition relations | 🔄 Implement |
| `/crosswalk/current/source/RXNORM/{rxcui}` | Map RxNorm → SNOMED | ⏳ Future |

**Rate Limit**: 20 requests/second per IP (implement caching)

### DailyMed API (Research Phase)

**Purpose**: FDA drug labels (SPL documents)

**Potential Uses**:
- Drug interaction text (unstructured)
- Contraindication information
- Black box warnings

**Status**: ⏳ Research needed

---

## Data Models

### Medication Model (Enhanced)

```typescript
interface Medication {
  id: string;
  user_id: string;
  name: string;
  rxcui?: string;
  ndc?: string; // NEW: National Drug Code
  manufacturer?: string; // NEW: Derived from NDC
  is_brand?: boolean; // NEW: Brand vs generic flag
  quantity: string;
  frequency: string; // User-defined, no defaults
  notes?: string;
  verified?: boolean;
  is_maintenance?: boolean;
  therapeutic_class?: string; // From RxClass ATC
  drug_class_id?: string; // ATC code
  ingredients?: string[]; // Ingredient RxCUIs
  
  // Refill tracking
  refills_remaining?: number;
  total_refills?: number;
  last_fill_date?: string;
  next_refill_date?: string;
  
  // Interaction flags
  has_drug_interactions?: boolean;
  has_allergy_interactions?: boolean;
  has_condition_interactions?: boolean;
  
  created_at: string;
  updated_at: string;
}
```

### Allergy Model (Enhanced)

```typescript
interface Allergy {
  id: string;
  user_id: string;
  allergy: string; // User-entered name
  snomed_code?: string; // NEW: SNOMED CT code
  umls_cui?: string; // NEW: UMLS CUI
  category: 'drug' | 'food' | 'environmental' | 'other';
  severity?: 'mild' | 'moderate' | 'severe' | 'anaphylaxis';
  reaction?: string; // User description
  notes?: string;
  created_at: string;
  updated_at: string;
}
```

### Health Condition Model (Enhanced)

```typescript
interface HealthCondition {
  id: string;
  user_id: string;
  condition: string; // User-entered name
  snomed_code?: string; // NEW: SNOMED CT code
  umls_cui?: string; // NEW: UMLS CUI
  category: HealthConditionCategory;
  diagnosis_date?: string;
  status: 'active' | 'resolved' | 'chronic';
  notes?: string;
  created_at: string;
  updated_at: string;
}
```

### Interaction Model (New)

```typescript
interface DrugInteraction {
  id: string;
  medication_id: string; // FK to medications
  interaction_type: 'drug-drug' | 'drug-allergy' | 'drug-condition';
  interacts_with_id?: string; // FK to medications/allergies/conditions
  severity: 'critical' | 'major' | 'moderate' | 'minor';
  description: string;
  source: 'rxclass' | 'local_kb' | 'umls';
  acknowledged: boolean; // User acknowledged warning
  acknowledged_at?: string;
  created_at: string;
}
```

### Drug Class Cache Model (New)

```typescript
interface DrugClassCache {
  rxcui: string; // Primary key
  atc_code: string;
  atc_name: string;
  epc_code?: string;
  epc_name?: string;
  mesh_pa?: string[];
  cached_at: string;
  expires_at: string; // 30 days from cached_at
}
```

### UMLS Cache Model (New)

```typescript
interface UMLSCache {
  search_query: string; // Primary key composite
  source_vocab: 'SNOMEDCT_US' | 'RXNORM'; // Primary key composite
  results: any; // JSON results
  cached_at: string;
  expires_at: string; // 30 days
}
```

---

## User Interface Components

### 1. Health Profile Header Button

**Location**: Fixed header (visible while scrolling)

**Design Options**:
- **Option A**: "Health Profile" (clearer)
- **Option B**: "Allergies & Conditions" (more specific)
- **Option C**: Medical file icon + badge count

**Behavior**:
- Click: Opens side panel or modal
- Badge: Shows count if profile incomplete (e.g., "Set up profile")
- Color: Red badge if allergies exist (safety emphasis)

**Content**:
```
Allergies (3)
- Penicillin (severe)
- Sulfa drugs (moderate)
- Shellfish (mild)

Conditions (2)
- Hypertension (active)
- Type 2 Diabetes (active)

[Edit Profile]
```

### 2. Enhanced Add Medication Form

**Fields**:
1. **Medication Name/NDC**
   - Autocomplete from RxNorm
   - Alternative: Paste NDC for lookup
   - Display: "Drug Name (Brand/Generic)"
   
2. **Manufacturer** (auto-populated if NDC provided, read-only)

3. **Quantity**
   - User input (no suggestions)
   
4. **Frequency**
   - Free text field
   - Placeholder: "As prescribed by your doctor"
   - NO dropdown, NO defaults
   
5. **Notes** (optional)
   - User can add DAW/BMN info here if not using NDC

**Validation**:
- Name/NDC: Required
- Quantity: Required
- Frequency: Required (user's responsibility)

### 3. Interaction Warning Modal

**Trigger Points**:
- User clicks "Add Medication" button
- Before saving to database

**Modal Structure**:

```
┌─────────────────────────────────────────┐
│  ⚠️  POTENTIAL INTERACTION DETECTED      │
│                                          │
│  Amoxicillin-Clavulanate may interact   │
│  with your Penicillin allergy:          │
│                                          │
│  Cross-reactivity exists between        │
│  penicillins and related beta-lactams.  │
│                                          │
│  Severity: CRITICAL                     │
│                                          │
│  This is informational only. If you     │
│  have questions, consult your healthcare│
│  provider or pharmacist.                │
│                                          │
│  [Review Information] [Add Anyway]      │
└─────────────────────────────────────────┘
```

**Button Behavior**:
- **Review Information**: Closes modal, returns to form
- **Add Anyway**: Saves medication + logs acknowledgment

### 4. Medication Card with Interactions

**Enhanced Card Design**:

```
┌──────────────────────────────────────┐
│ Amoxicillin-Clavulanate 875-125 MG  │
│ ⚠️ 2 interactions                     │
│                                       │
│ Twice daily                          │
│ 20 tablets remaining                 │
│                                       │
│ [View Details] [Edit] [Remove]       │
└──────────────────────────────────────┘
```

**Interaction Badge**:
- Color: Matches highest severity
- Clickable: Opens interaction details modal
- Count: Number of detected interactions

---

## Safety & Compliance

### FDA Medical Device Regulations

**ClariMed is NOT a medical device**:
- NO diagnostic features
- NO treatment recommendations
- NO dosing calculations
- NO prescription suggestions

### Terminology Requirements

**Approved Terms**:
- "Track medications"
- "Medication organizer"
- "Personal health record"
- "Informational purposes only"
- "May indicate potential concerns"

**Prohibited Terms**:
- "Diagnose"
- "Treat" / "Treatment"
- "Prescribe" / "Recommended dosage"
- "Medical decision support"

### Disclaimers (Required)

**On All Interaction Warnings**:
> "This is informational only. Consult your healthcare provider or pharmacist with questions."

**Medical Disclaimer (Footer)**:
> "It is not the intention of NLM to provide specific medical advice, but rather to provide users with information to better understand their health and their medications. NLM urges you to consult with a qualified physician for medical advice."

**NLM Attribution (Footer)**:
> "This product uses publicly available data from the U.S. National Library of Medicine (NLM), National Institutes of Health, Department of Health and Human Services; NLM is not responsible for the product and does not endorse or recommend this or any other product."

---

## Prescription Savings Integration

### Feature: Rx Savings Finder

**User Flow**:
1. User clicks "Find Savings" on medication card
2. System prompts for:
   - ZIP code (stored in profile after first use)
   - Pharmacy preference (optional)
3. Query multiple coupon APIs
4. Display best prices sorted by savings

### Target Integration APIs

#### 1. GoodRx API (Research Needed)
**Endpoints**: Unknown (not publicly documented)
**Method**: Reverse engineering or partnership inquiry

#### 2. BuzzRx API (Research Needed)
**Endpoints**: Unknown
**Method**: Partnership or affiliate program

#### 3. SingleCare API (Research Needed)
**Endpoints**: Unknown
**Method**: Partnership or affiliate program

#### 4. RxSaver by RetailMeNot
**Status**: Research partnership opportunities

#### 5. Alternative: RxSense API
**Source**: Powers Walgreens Rx Savings Finder
**Contact**: Investigate B2B API access

### Required Data for Coupon Lookup

**Input Parameters**:
- Drug name (from RxNorm)
- NDC (if available)
- Dosage form (e.g., "Oral Tablet")
- Strength (e.g., "500 MG")
- Quantity (user-selected from dropdown)
- ZIP code (user-provided)

**Quantity Dropdown Options**:
```typescript
const quantityOptions = [
  { value: 7, label: "7 (1 week supply)" },
  { value: 14, label: "14 (2 week supply)" },
  { value: 30, label: "30 (1 month supply)" },
  { value: 60, label: "60 (2 month supply)" },
  { value: 90, label: "90 (3 month supply)" },
  { value: 'custom', label: "Custom amount" }
];
```

### How GoodRx Knows Quantities

**Method 1**: RxNorm properties
- `RXN_AVAILABLE_STRENGTH` attribute
- Standard packaging sizes from RxNorm

**Method 2**: NDC package size
- NDC-11 format includes package size
- Example: `0781-1506-01` = 30 count bottle

**Method 3**: Pharmacy data partnerships
- Real-time inventory data
- Common dispensing quantities

**ClariMed Approach**:
- Use RxNorm `/rxcui/{rxcui}/allProperties` for available strengths
- Use NDC lookup for package sizes
- Provide standard quantity dropdown + custom input

### Savings Display UI

**Card Format**:
```
┌─────────────────────────────────────────┐
│ Amoxicillin 500mg - 30 Capsules         │
│                                          │
│ 💰 Best Price: $4.99 at Walmart         │
│    (Save $15.00 with GoodRx)            │
│                                          │
│ Other Options:                          │
│ • CVS: $8.50 (BuzzRx coupon)            │
│ • Walgreens: $10.99 (SingleCare)        │
│ • Target: $12.49 (No coupon)            │
│                                          │
│ [Get Coupon] [Change Pharmacy]          │
└─────────────────────────────────────────┘
```

### Monetization Options

1. **Affiliate Commissions**: Earn from coupon usage
2. **Pharmacy Partnerships**: Referral fees
3. **Premium Features**: Advanced savings tracking
4. **Anonymous Data**: Aggregate pricing insights (with consent)

---

## Implementation Phases

### Phase 1: Foundation (Current Sprint)
- ✅ Fix RxNorm integration (switch to Prescribable API)
- 🔄 Implement RxClass for drug classifications
- 🔄 Disable broken interaction endpoint
- 🔄 Add NDC lookup capability

### Phase 2: Safety Features (Next Sprint)
- 🔄 Enhanced allergy/condition models (SNOMED CT codes)
- 🔄 Health profile header component
- 🔄 Drug-allergy interaction checking
- 🔄 Drug-drug interaction checking (class-based)
- 🔄 Interaction warning modals

### Phase 3: UMLS Integration
- ⏳ UMLS API authentication setup
- ⏳ SNOMED CT autocomplete for conditions
- ⏳ Drug-condition interaction checking
- ⏳ CUI mapping and crosswalk

### Phase 4: Prescription Savings
- ⏳ Research coupon API partnerships
- ⏳ Implement savings finder UI
- ⏳ ZIP code storage in user profile
- ⏳ Multi-API price comparison

### Phase 5: Polish & Optimization
- ⏳ Caching strategy implementation
- ⏳ Performance optimization
- ⏳ Mobile responsiveness
- ⏳ Accessibility compliance

---

## Technical Stack Evaluation

### Current Stack
- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API routes, Supabase
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth
- **APIs**: RxNorm, RxClass (NLM)

### Recommendations: NO CHANGES NEEDED

**Rationale**:
- Next.js handles SSR for SEO (future marketing pages)
- React ecosystem mature for health tech
- TypeScript ensures type safety (critical for medical data)
- Supabase provides RLS (row-level security) for HIPAA-adjacent compliance
- Current stack scales to 10k+ users without changes

### Future Considerations (If Scaling Beyond 10k Users)

**Potential Additions**:
- **Redis**: API response caching (RxClass, UMLS)
- **Queue System**: Background jobs for savings finder
- **CDN**: Static asset delivery (Vercel Edge already provides this)

**Not Recommended**:
- Microservices (overkill for current scope)
- GraphQL (REST APIs working fine)
- Different database (Postgres handles medical data well)

---

## Knowledge Base Structure

### Local Interaction Knowledge Base

**Purpose**: Critical interactions when API unavailable

**Storage**: `lib/medical-knowledge/critical-interactions.ts`

**Structure**:
```typescript
interface CriticalInteraction {
  drug_class_a: string; // ATC code
  drug_class_b: string; // ATC code
  severity: 'critical' | 'major';
  description: string;
  mechanism: string;
}

const CRITICAL_INTERACTIONS: CriticalInteraction[] = [
  {
    drug_class_a: 'N06AB', // SSRIs
    drug_class_b: 'N06AG', // MAOIs
    severity: 'critical',
    description: 'Risk of serotonin syndrome',
    mechanism: 'Excessive serotonergic activity'
  },
  {
    drug_class_a: 'B01AA', // Warfarin
    drug_class_b: 'M01AE', // NSAIDs
    severity: 'major',
    description: 'Increased bleeding risk',
    mechanism: 'Anticoagulant potentiation'
  }
  // ... more critical pairs
];
```

**Coverage Priority**:
1. Life-threatening interactions (serotonin syndrome, bleeding, arrhythmias)
2. Common drug combinations (statins, antihypertensives, diabetes meds)
3. High-risk medications (warfarin, MAOIs, anticoagulants)

---

## API Rate Limiting & Caching

### RxNorm/RxClass (No documented limits)
**Strategy**: Aggressive caching (30-day expiration)

### UMLS (20 requests/second)
**Strategy**: 
- Implement rate limiter middleware
- Cache all responses (30-day expiration)
- Batch requests when possible

### Supabase Caching Table

```sql
CREATE TABLE api_cache (
  cache_key TEXT PRIMARY KEY,
  api_source TEXT NOT NULL, -- 'rxclass', 'umls', 'rxnorm'
  response_data JSONB NOT NULL,
  cached_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  hit_count INTEGER DEFAULT 0
);

CREATE INDEX idx_api_cache_expires ON api_cache(expires_at);
CREATE INDEX idx_api_cache_source ON api_cache(api_source);
```

---

## Security Considerations

### API Keys
- **UMLS API Key**: Server-side only (Next.js API routes)
- **Never expose** in client-side code
- Store in environment variables

### User Data
- **PHI Classification**: ClariMed stores Protected Health Information
- **Encryption**: At rest (Supabase) and in transit (HTTPS)
- **Access Control**: Row-level security (RLS) policies
- **Audit Logs**: Track all medication/allergy changes

### HIPAA Considerations
- ClariMed is **personal health record** (not covered entity)
- Users own their data
- No healthcare provider relationship
- Optional: Offer HIPAA-compliant hosting tier (future)

---

## Testing Strategy

### Unit Tests
- RxNorm API response parsing
- RxClass classification logic
- Interaction detection algorithms
- Allergy matching (cross-reactivity)

### Integration Tests
- Full DUR workflow (add medication → check interactions → display warnings)
- NDC lookup → manufacturer identification
- UMLS condition search → SNOMED CT code assignment

### E2E Tests
- User adds medication with allergy → sees warning modal
- User adds interacting drug → sees warning on existing med card
- User finds savings coupon → displays prices

---

**Owner**: Aaron Capron  
**Status**: Living Document - Updated as features evolve
