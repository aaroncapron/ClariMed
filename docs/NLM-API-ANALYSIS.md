# NLM API Analysis for ClariMed

**Last Updated**: November 13, 2025

## Executive Summary

ClariMed requires three core capabilities:
1. **Drug lookup & verification** (RxCUI assignment)
2. **Drug classification** (therapeutic categories, cross-reactivity)
3. **Interaction checking** (drug-drug interactions)

**Critical Finding**: RxNav interaction endpoint (`/interaction/list.json`) returns 404 for ingredient RxCUIs. This endpoint appears deprecated or non-functional as of November 2025.

---

## API Comparison Matrix

| API | Drug Search | Drug Classes | Ingredients | Interactions | License |
|-----|-------------|--------------|-------------|--------------|---------|
| **RxNorm API** | ✅ Full | ❌ No | ✅ Yes | ❌ 404 Error | None |
| **Prescribable API** | ✅ Current only | ❌ No | ✅ Yes | ❌ 404 Error | None |
| **RxClass API** | ❌ No | ✅ Yes | ❌ No | ❌ No | None |
| **RxTerms API** | ✅ Consumer names | ❌ No | ✅ Yes | ❌ No | None |

---

## RxNorm vs Prescribable API

### Full RxNorm API
**Base URL**: `https://rxnav.nlm.nih.gov/REST/`

**Scope**: Complete RxNorm dataset including historical drugs

**Use When**:
- Historical medication tracking
- Research applications
- Comprehensive drug database needed

### Prescribable API
**Base URL**: `https://rxnav.nlm.nih.gov/REST/prescribable/`

**Scope**: Current Prescribable Content subset (active medications only)

**Use When**:
- Production medication tracking apps
- Current prescription focus
- Faster performance needed (smaller dataset)

**Recommendation**: Use Prescribable API for ClariMed. Users track current medications, not historical drugs.

---

## Available Endpoints

### Prescribable API Functions (Same as Full RxNorm)

| Function | Endpoint | ClariMed Usage |
|----------|----------|----------------|
| `getApproximateTerm` | `/approximateTerm` | ✅ Currently using |
| `getDrugs` | `/drugs` | ✅ Currently using |
| `getAllRelatedInfo` | `/rxcui/{rxcui}/allrelated` | ⚠️ Should use |
| `getRelatedByType` | `/rxcui/{rxcui}/related?tty=IN` | ✅ Currently using |
| `getAllProperties` | `/rxcui/{rxcui}/allProperties` | ⚠️ Should use |
| `getNDCs` | `/rxcui/{rxcui}/ndcs` | ❌ Not needed |
| `getSpellingSuggestions` | `/spellingsuggestions` | ⚠️ Should add |

**Missing Endpoint**: `/interaction/list.json` - Returns 404 for both APIs

---

## RxClass API

**Base URL**: `https://rxnav.nlm.nih.gov/REST/rxclass/`

**Purpose**: Drug classification system (ATC, MeSH, EPC, etc.)

### Key Functions

| Function | Endpoint | ClariMed Usage |
|----------|----------|----------------|
| `getClassByRxNormDrugId` | `/class/byRxcui` | ✅ Replace `getMedicationClass()` |
| `getClassMembers` | `/classMembers` | ✅ Allergy cross-reactivity |
| `getAllClasses` | `/allClasses` | ❌ Not needed |

### Available Classification Types

- **ATC** - Anatomical Therapeutic Chemical (WHO standard)
- **MESHPA** - MeSH Pharmacological Actions
- **EPC** - Established Pharmacologic Class (FDA)
- **MOA** - Mechanism of Action
- **PE** - Physiologic Effect
- **VA** - Veterans Affairs Drug Classification

**Recommendation**: Use ATC for primary classification, EPC as secondary.

---

## RxTerms API

**Base URL**: `https://rxnav.nlm.nih.gov/REST/RxTerms/`

**Purpose**: Consumer-friendly drug names for patient-facing interfaces

### Key Features

- Simplified names (e.g., "INDERAL (Oral-pill)")
- Separated strength + dose form (e.g., "80 MG Tabs")
- Common synonyms (e.g., HCTZ for hydrochlorothiazide)
- Tall man lettering (FDA recommendation)
- Excludes obsolete/unavailable drugs

**ClariMed Use Case**: Potential for "Clarity Mode" simplified display

**Recommendation**: Low priority. Current RxNorm names are acceptable.

---

## Competitor Analysis

### MyTherapy
- **Focus**: Medication reminders, adherence tracking
- **Interaction Checking**: Not advertised publicly
- **Business Model**: Free app, pharma partnerships
- **Data Sources**: Not disclosed

### Drugs.com
- **Interaction Checker**: Available (web + mobile)
- **Data Sources**: Micromedex, Cerner Multum, ASHP (commercial)
- **Business Model**: Ad-supported, B2B licensing
- **Coverage**: 14,000+ medications

### Medscape
- **Target**: Healthcare professionals
- **Interaction Checker**: Available (requires account)
- **Data Sources**: Not disclosed (likely commercial)
- **Business Model**: Professional platform

**Key Insight**: Commercial apps use paid databases (Micromedex, Multum, First Databank) for interaction checking. Free apps either omit this feature or use limited datasets.

---

## Interaction Checking Problem

### Current Status
- RxNav `/interaction/list.json` endpoint returns 404
- Tested with both product and ingredient RxCUIs
- Tested with both Full and Prescribable APIs
- Endpoint appears deprecated or broken

### Alternative Approaches

#### Option 1: Local Knowledge Base (Immediate)
Maintain curated interaction dataset for critical drug pairs:
- Warfarin interactions (vitamin K, NSAIDs, antibiotics)
- MAOI interactions (SSRIs, sympathomimetics)
- QT-prolonging drug combinations
- Anticoagulant + antiplatelet combinations

**Pros**: Reliable, fast, no API dependency
**Cons**: Limited coverage, requires maintenance

#### Option 2: DailyMed SPL API (Research Needed)
FDA-approved drug labels contain interaction sections.

**Pros**: Authoritative FDA data
**Cons**: Unstructured text, requires parsing

#### Option 3: OpenFDA Drug API (Research Needed)
Free access to FDA datasets including adverse events.

**Pros**: Free, government data
**Cons**: Adverse events != interactions, complex queries

#### Option 4: Commercial API (Paid)
Use Micromedex, First Databank, or similar.

**Pros**: Comprehensive, reliable
**Cons**: Expensive ($thousands/year), licensing restrictions

---

## Recommendations for ClariMed

### Immediate Actions

1. **Switch to Prescribable API**
   - Update base URL in `lib/rxnav.ts`
   - Faster performance, focused dataset
   - No functionality loss

2. **Integrate RxClass API**
   - Replace `getMedicationClass()` hardcoded patterns
   - Use ATC classification system
   - Implement caching in Supabase

3. **Disable Interaction Checking Temporarily**
   - Remove broken API calls (stop 404 spam)
   - Display user-facing message: "Interaction checking is being updated with a new data source"
   - Implement local knowledge base for critical interactions only

4. **Add Spelling Suggestions**
   - Use `/spellingsuggestions` endpoint
   - Improve UX for misspelled drug names

### Research Tasks

1. **DailyMed API** - Investigate SPL (Structured Product Labeling) for interaction data
2. **OpenFDA API** - Evaluate adverse event data for interaction signals
3. **Commercial Options** - Price comparison for Micromedex, First Databank, Gold Standard

### Long-term Strategy

**Hybrid Approach**:
- RxClass for drug classification
- Local knowledge base for critical interactions
- DailyMed/OpenFDA for comprehensive interaction data (if feasible)
- Commercial API as last resort (if budget allows)

---

## Required Attribution

Must include in application (already compliant in Footer):

> "This product uses publicly available data from the U.S. National Library of Medicine (NLM), National Institutes of Health, Department of Health and Human Services; NLM is not responsible for the product and does not endorse or recommend this or any other product."

---

## Implementation Priority

1. **HIGH**: Disable broken interaction API (stop console errors)
2. **HIGH**: Switch to Prescribable API base URL
3. **HIGH**: Integrate RxClass for drug classification
4. **MEDIUM**: Implement local critical interaction knowledge base
5. **MEDIUM**: Research DailyMed/OpenFDA alternatives
6. **LOW**: Add RxTerms for consumer-friendly names

---

## Code Changes Required

### 1. Update Base URL (`lib/rxnav.ts`)
```typescript
// OLD
const RXNAV_BASE_URL = 'https://rxnav.nlm.nih.gov/REST';

// NEW
const RXNAV_BASE_URL = 'https://rxnav.nlm.nih.gov/REST/prescribable';
```

### 2. Add RxClass Service (`lib/medical-knowledge/rxclass-service.ts`)
New file for drug classification queries.

### 3. Disable Interaction Checking (`lib/interactions.ts`)
Comment out broken API calls, return empty arrays gracefully.

### 4. Update Components
- `InteractionSummary.tsx` - Display "feature unavailable" message
- `MedicationList.tsx` - Remove interaction badges temporarily
- `AddMedicationForm.tsx` - Skip interaction checks

---

**Owner**: Aaron Capron
**Status**: Analysis Complete - Ready for Implementation
