# API Research for ClariMed Medical Knowledge Integration

**Last Updated**: November 13, 2025

## Overview

This document captures our research into UMLS-licensed medical terminology APIs to replace hardcoded drug classifications and relationships in ClariMed. We have access to these resources through our approved UMLS license.

---

## Available Resources

### 1. RxNorm
- **Purpose**: Normalized naming system for drugs and semantic interoperation
- **Access**: UMLS license approved (free, no cost)
- **Updates**: Full monthly releases (1st Monday) + Weekly updates (Wednesdays)
- **API Available**: Yes (REST API via RxNorm API)

### 2. RxClass
- **Purpose**: Drug classification system (not yet explored)
- **Status**: To be researched

### 3. SNOMED CT
- **Purpose**: Clinical terminology with disease-drug relationships
- **Status**: To be researched

### 4. UMLS Metathesaurus
- **Purpose**: Links between terminologies, semantic network
- **Status**: To be researched

### 5. VSAC (Value Set Authority Center)
- **Purpose**: Repository for public value sets
- **Status**: To be researched

---

## RxNorm Deep Dive

### What RxNorm Provides

#### Normalized Drug Names
- **Format**: Ingredient + Strength + Dose Form
- **Example**: `Naproxen 250 MG Oral Tablet`
- **Branded Format**: `Naproxen 250 MG Oral Tablet [Prosaid]`

#### Unique Identifiers
- **RXCUI**: Concept Unique Identifier (what we currently use)
- **RXAUI**: Atom Unique Identifier (more granular)

#### Term Types (TTY)
RxNorm uses hierarchical term types at different specificity levels:

| TTY | Name | Description | Example |
|-----|------|-------------|---------|
| IN | Ingredient | Base active compound | `Fluoxetine` |
| PIN | Precise Ingredient | Specific salt/ester form | `Fluoxetine Hydrochloride` |
| MIN | Multiple Ingredients | Combination drugs | `Fluoxetine / Olanzapine` |
| DF | Dose Form | Administration form | `Oral Solution` |
| DFG | Dose Form Group | Group of related forms | `Oral Liquid` |
| SCDC | Semantic Clinical Drug Component | Ingredient + Strength | `Fluoxetine 4 MG/ML` |
| SCDF | Semantic Clinical Drug Form | Ingredient + Dose Form | `Fluoxetine Oral Solution` |
| SCD | Semantic Clinical Drug | Full specification (generic) | `Fluoxetine 4 MG/ML Oral Solution` |
| BN | Brand Name | Proprietary name | `Prozac` |
| SBD | Semantic Branded Drug | Full specification (branded) | `Fluoxetine 4 MG/ML Oral Solution [Prozac]` |
| BPCK | Brand Name Pack | Multi-drug branded pack | Drug pack with brand |
| GPCK | Generic Pack | Multi-drug generic pack | Drug pack without brand |

### Relationships in RxNorm

**Bidirectional relationships** connect concepts together:

| Relationship | Example |
|--------------|---------|
| `has_tradename` | Generic → Branded version |
| `tradename_of` | Branded → Generic version |
| `has_ingredient` | Drug → Ingredient |
| `ingredient_of` | Ingredient → Drug |
| `has_dose_form` | Drug → Dose Form |
| `dose_form_of` | Dose Form → Drug |
| `isa` | Specific → General |
| `inverse_isa` | General → Specific |
| `consists_of` | Pack → Components |
| `constitutes` | Components → Pack |

**Key Insight**: We can traverse these relationships to get drug class info!

### Attributes in RxNorm

RxNorm includes additional data as attributes:

- **NDC Codes**: 11-digit normalized format
- **UNII Codes**: Unique Ingredient Identifiers
- **Human/Veterinary Flag**: `RXN_HUMAN_DRUG` / `RXN_VET_DRUG`
- **Strength Information**: `RXN_STRENGTH`, `RXN_BOSS_STRENGTH_*`
- **Availability**: `RXN_AVAILABLE_STRENGTH`

### Data Files Structure

RxNorm provides 9 pipe-delimited files:

1. **RXNCONSO.RRF** - All drug names, concepts, and identifiers
2. **RXNREL.RRF** - All relationships between atoms and concepts
3. **RXNSAT.RRF** - All attributes (NDCs, flags, etc.)
4. **RXNSTY.RRF** - Semantic types (80% are "Clinical Drug")
5. **RXNCUI.RRF** - History of retired SAB=RXNORM concepts
6. **RXNCUICHANGES.RRF** - Recent changes to non-RXNORM atoms
7. **RXNATOMARCHIVE.RRF** - Archive of all removed RXNORM atoms
8. **RXNSAB.RRF** - Metadata about sources
9. **RXNDOC.RRF** - Documentation of data elements

### Current Prescribable Content Subset

NLM provides a **subset of currently prescribable drugs**:
- Only includes active SAB=RXNORM data
- FDA SPL drugs and ingredients
- Small set of CMS data
- **No license required for this subset**
- Smaller, more focused dataset

### RxNorm API

**REST API available** for programmatic access:
- No need to download full dataset
- Real-time queries
- Documentation: [RxNorm API page](https://lhncbc.nlm.nih.gov/RxNav/APIs/)

### RxNav Browser

Web-based search and browse tool built on RxNorm API:
- No license needed to view SAB=RXNORM data
- Good for exploring data structure
- URL: [RxNav page](https://mor.nlm.nih.gov/RxNav/)

---

## Current ClariMed Issues (Hardcoded Data)

### 1. Drug Classifications (`lib/drug-info-utils.ts`)

**Current approach**: Pattern matching on drug names
```typescript
if (name.includes('statin')) return 'Statin - Cholesterol-lowering medication';
```

**Problems**:
- Only covers ~11 drug classes
- Misses drugs like sulfamethazine
- No standardization
- Constant maintenance required

**RxNorm Solution**: Use relationships like `ingredient_of`, `isa`, and traverse to therapeutic class

---

### 2. Common Uses (`lib/drug-info-utils.ts`)

**Current approach**: Hardcoded strings for ~10 medication types
```typescript
if (name.includes('statin')) return 'Lower cholesterol and reduce heart disease risk';
```

**Problems**:
- Limited coverage
- Generic fallback: "Consult your healthcare provider"
- Not clinical terminology

**Potential Solution**: RxNorm doesn't directly provide indications, but RxClass might

---

### 3. Allergy Cross-Reactivity (`lib/allergies.ts`)

**Current approach**: Manually maintained object with 4 drug classes
```typescript
const ALLERGY_CROSS_REACTIVITY = {
  penicillin: ['amoxicillin', 'ampicillin', 'augmentin', ...],
  ibuprofen: ['naproxen', 'aspirin', 'celecoxib', ...],
  sulfa: ['sulfamethoxazole', 'trimethoprim', 'bactrim', ...],
  acetaminophen: ['acetaminophen', 'tylenol', 'paracetamol']
};
```

**Problems**:
- Only 4 drug classes covered
- Missing many important cross-reactivities
- Hard to maintain
- Not comprehensive

**RxNorm Solution**: Use `ingredient_of` and `isa` relationships to find related drugs

---

### 4. Contraindications (`lib/contraindications.ts`)

**Current approach**: Object with ~50 hardcoded contraindication rules
```typescript
const KNOWN_CONTRAINDICATIONS = {
  pregnancy: {
    'Warfarin': { severity: 'critical', description: '...' },
    'Lisinopril': { severity: 'critical', description: '...' },
    // ... more hardcoded entries
  }
}
```

**Problems**:
- Limited to ~50 medications
- Not comprehensive
- Requires constant updates
- May miss critical safety information

**SNOMED CT Solution**: Disease-drug relationships could provide this systematically

---

## Proposed Architecture Changes

### Phase 1: RxNorm API Integration (High Priority)

1. **Create Medical Knowledge Service**
   - `lib/medical-knowledge/rxnorm-service.ts`
   - Abstract API calls
   - Handle errors gracefully

2. **Replace Drug Classification**
   - Query RxNorm relationships instead of pattern matching
   - Use `allrelated` endpoint to get drug classes
   - Cache results in database

3. **Enhance Ingredient Detection**
   - Use RxNorm's ingredient relationships
   - More accurate allergy cross-reactivity
   - Better interaction checking

### Phase 2: RxClass Integration (Medium Priority)

1. **Research RxClass API** (next step)
   - Understand drug classification capabilities
   - Explore therapeutic categories
   - Determine ATC code usage

2. **Integrate Therapeutic Information**
   - Get authoritative drug classes
   - Link to common uses/indications
   - Replace hardcoded common uses

### Phase 3: SNOMED CT Integration (Lower Priority)

1. **Research SNOMED CT API**
   - Disease-drug relationships
   - Contraindication data
   - Clinical concepts

2. **Enhance DUR Checks**
   - Replace hardcoded contraindications
   - More comprehensive safety checking
   - Link to health conditions

### Caching Strategy

**Why cache?**
- Drug classifications don't change often
- Reduce API calls and latency
- Offline fallback capability

**Proposed approach**:
1. Add `drug_metadata` table to Supabase
   - `rxcui` (primary key)
   - `drug_class`
   - `therapeutic_category`
   - `atc_code`
   - `ingredients` (array)
   - `last_updated`
   
2. Cache lifetime: 30 days
3. Background refresh job (optional)
4. Fallback to pattern-matching if API fails

---

---

## API Documentation Deep Dive

### Available APIs from NLM

We have access to **4 REST APIs** with our UMLS license:

1. **RxNorm API** - Full RxNorm dataset
2. **Prescribable RxNorm API** - Subset of currently prescribable drugs
3. **RxTerms API** - Simplified consumer-friendly names
4. **RxClass API** - Drug classification system

**Additional Tools**:
- **RxNav-in-a-Box** - Local Docker deployment of all APIs (requires UMLS license)
- **RxMix** - Interactive/batch API testing tool

### Authentication & Licensing

- ✅ **No license needed** for RxNorm, RxTerms, RxClass APIs
- ✅ **No API key required**
- ⚠️ **Exception**: RxNorm API returns some proprietary data that may require source licenses
- ✅ **RxNav-in-a-Box requires UMLS license** (which we have)

### Required Attribution

All applications must include:
> "This product uses publicly available data from the U.S. National Library of Medicine (NLM), National Institutes of Health, Department of Health and Human Services; NLM is not responsible for the product and does not endorse or recommend this or any other product."

**Status**: ✅ Already implemented in Footer component

---

## RxNorm API - Key Functions

**Base URL**: `https://rxnav.nlm.nih.gov/REST/rxnorm/`

### Drug Classification & Relationships (HIGH PRIORITY)

| Function | Endpoint | Description | Use Case |
|----------|----------|-------------|----------|
| `getAllRelatedInfo` | `/rxcui/{rxcui}/allrelated` | **ALL concepts related to drug** | Get ingredients, drug class, forms |
| `getRelatedByRelationship` | `/rxcui/{rxcui}/related?rela=...` | Filter by specific relationship | Get only ingredients or only forms |
| `getRelatedByType` | `/rxcui/{rxcui}/related?tty=...` | Filter by term type | Get only IN, BN, SCD, etc. |
| `getAllProperties` | `/rxcui/{rxcui}/allProperties` | **Complete concept details** | Get TTY, name, attributes |
| `getRxProperty` | `/rxcui/{rxcui}/property` | Specific property value | Get single attribute |

**Scope**: Active (current RxNorm with SAB=RXNORM and not suppressed)

### Drug Search (Already Using)

| Function | Endpoint | Description | Use Case |
|----------|----------|-------------|----------|
| `getApproximateMatch` | `/approximateTerm?term=...` | Fuzzy search | Current autocomplete |
| `findRxcuiByString` | `/rxcui?name=...` | Exact name match | Verify drug exists |
| `getDrugs` | `/drugs?name=...` | Drugs related to name | Alternative search |
| `getSpellingSuggestions` | `/spellingsuggestions?name=...` | Fix typos | Improve UX |

### NDC Codes

| Function | Endpoint | Description | Use Case |
|----------|----------|-------------|----------|
| `getNDCs` | `/rxcui/{rxcui}/ndcs` | Get all NDCs for drug | Link to specific products |
| `getAllHistoricalNDCs` | `/rxcui/{rxcui}/allhistoricalndcs` | Include discontinued | Complete history |

### Metadata

| Function | Endpoint | Description |
|----------|----------|-------------|
| `getTermTypes` | `/termtypes` | List of all TTY codes |
| `getRelaTypes` | `/relatypes` | List of all relationships |
| `getRxNormVersion` | `/version` | Current RxNorm version |

---

## Prescribable RxNorm API

**Base URL**: `https://rxnav.nlm.nih.gov/REST/prescribable/`

**Same functions as RxNorm API** but limited to **Current Prescribable Content** subset.

### When to Use Prescribable vs Full RxNorm

| Use Case | API |
|----------|-----|
| Current prescriptions | Prescribable |
| Historical medications | RxNorm |
| Research/analysis | RxNorm |
| Production app (faster) | Prescribable |

**Recommendation**: Start with Prescribable API (smaller, faster, focused)

---

## RxClass API - Drug Classification System

**Base URL**: `https://rxnav.nlm.nih.gov/REST/rxclass/`

**THIS IS THE MISSING PIECE** for replacing hardcoded drug classes!

### Key Functions

| Function | Endpoint | Description | Use Case |
|----------|----------|-------------|----------|
| `getClassByRxNormDrugId` | `/class/byRxcui?rxcui=...` | **Get all classes for drug** | Replace getMedicationClass() |
| `getClassByRxNormDrugName` | `/class/byDrugName?drugName=...` | Get classes by name | Alternative lookup |
| `getClassMembers` | `/classMembers?classId=...` | Get all drugs in class | Allergy cross-reactivity |
| `getAllClasses` | `/allClasses?classTypes=...` | List all classes by type | Browse classifications |
| `getClassTypes` | `/classTypes` | Available class systems | See what's available |

### Available Class Types

RxClass supports **multiple classification systems**:

- **ATC** - Anatomical Therapeutic Chemical Classification
- **MESHPA** - MeSH Pharmacological Actions
- **EPC** - Established Pharmacologic Class
- **MOA** - Mechanism of Action
- **PE** - Physiologic Effect
- **PK** - Pharmacokinetics
- **DISEASE** - Indication (disease)
- **CHEM** - Chemical Structure
- **VA** - Veterans Affairs Drug Classification

### Example Query for Sulfamethazine

```
GET /rxclass/class/byRxcui?rxcui=1101606&relaSource=ATC

Response:
{
  "rxclassMinConceptList": {
    "rxclassMinConcept": [
      {
        "classId": "J01EB02",
        "className": "sulfamethazine",
        "classType": "ATC"
      },
      {
        "classId": "J01E",
        "className": "SULFONAMIDES AND TRIMETHOPRIM",
        "classType": "ATC"
      }
    ]
  }
}
```

**This solves the sulfamethazine problem!** We can get "Sulfonamide antibiotic" from ATC classification.

---

## RxTerms API - Consumer-Friendly Names

**Base URL**: `https://rxnav.nlm.nih.gov/REST/RxTerms/`

### Functions

| Function | Endpoint | Description | Use Case |
|----------|----------|-------------|----------|
| `getAllRxTermInfo` | `/rxcui/{rxcui}/allinfo` | All RxTerms data for drug | Consumer display names |
| `getRxTermDisplayName` | `/rxcui/{rxcui}/name` | Display name | Simplified UI |

**Purpose**: Simplified, consumer-friendly drug names (used in patient-facing apps)

**ClariMed Use**: Potentially useful for "Clarity Mode" to show simpler names

---

## RxNav-in-a-Box - Local Deployment

**What it is**: Docker container with all APIs running locally

**Advantages**:
- No internet dependency
- Faster response times
- No rate limits
- Full control
- Privacy (HIPAA compliance easier)

**Requirements**:
- UMLS license ✅ (we have it)
- Docker installed
- ~10GB disk space (estimated)
- Regular updates (monthly)

**Use Case**: Production deployment option

---

## RxMix - API Testing Tool

**URL**: https://lhncbc.nlm.nih.gov/RxNav/applications/RxMixTutorial.html

**Purpose**: Interactive tool to test API calls and see responses

**Use Cases**:
- Test queries before implementing
- Understand response formats
- Build complex queries
- Batch operations
- Learning tool

---

## Proposed Implementation Strategy

### Phase 1: RxClass Integration (IMMEDIATE)

**Goal**: Replace `getMedicationClass()` with real drug class data

```typescript
// NEW: lib/medical-knowledge/rxclass-service.ts
async function getDrugClasses(rxcui: string) {
  const response = await fetch(
    `https://rxnav.nlm.nih.gov/REST/rxclass/class/byRxcui?rxcui=${rxcui}&relaSource=ATC`
  );
  // Returns: ATC class, MeSH pharmacological action, etc.
}
```

**Benefits**:
- Sulfamethazine shows "Sulfonamide antibiotic"
- All drugs get accurate classifications
- No hardcoding needed
- Authoritative data

### Phase 2: Enhanced Ingredient Lookup

**Goal**: Use RxNorm relationships for allergy cross-reactivity

```typescript
// ENHANCED: lib/allergies.ts
async function getRelatedDrugs(rxcui: string) {
  const response = await fetch(
    `https://rxnav.nlm.nih.gov/REST/rxnorm/rxcui/${rxcui}/allrelated`
  );
  // Returns: All related ingredients, forms, brands
}
```

**Benefits**:
- Comprehensive cross-reactivity
- No manual maintenance
- Catches edge cases

### Phase 3: Prescribable Content Optimization

**Goal**: Use Prescribable API for faster queries

```typescript
// OPTIMIZED: Switch base URL
const BASE_URL = 'https://rxnav.nlm.nih.gov/REST/prescribable/';
```

**Benefits**:
- Faster response (smaller dataset)
- Focus on current medications
- Still comprehensive for active drugs

### Phase 4: Local Deployment (Optional)

**Goal**: Deploy RxNav-in-a-Box for production

**Benefits**:
- No external dependency
- HIPAA compliance easier
- Faster performance
- Offline capability

---

## Testing Plan

### Step 1: Use RxMix to Explore

1. Test `getClassByRxNormDrugId` with known drugs
2. Understand response formats
3. Test error cases
4. Document findings

### Step 2: Build Prototype Service

1. Create `lib/medical-knowledge/rxclass-service.ts`
2. Implement caching layer
3. Add error handling
4. Test with edge cases

### Step 3: Replace Hardcoded Functions

1. Update `getMedicationClass()` to use API
2. Update `getCommonUse()` with RxClass data
3. Update allergy cross-reactivity with relationships

### Step 4: Performance Testing

1. Measure API latency
2. Optimize caching strategy
3. Decide on Prescribable vs Full RxNorm
4. Consider RxNav-in-a-Box for production

---

## Next Immediate Steps

### 1. Test RxClass API with Known Drugs

Use RxMix to query:
- Lisinopril (RXCUI: 29046)
- Sulfamethazine (RXCUI: 1101606)
- Atorvastatin (RXCUI: 83367)
- Ibuprofen (RXCUI: 5640)

Document what class types give best results (ATC, EPC, MESHPA)

### 2. Test getAllRelatedInfo

```
GET /rxnorm/rxcui/1101606/allrelated
```

See what relationships exist for cross-reactivity

### 3. Design Caching Schema

Add to Supabase:
```sql
CREATE TABLE drug_metadata (
  rxcui TEXT PRIMARY KEY,
  drug_classes JSONB,      -- Array of class objects
  ingredients JSONB,        -- Array of ingredient RXCUIs
  atc_codes TEXT[],         -- ATC classification codes
  mesh_pa TEXT[],           -- MeSH Pharmacological Actions
  last_updated TIMESTAMP,
  rxnorm_version TEXT
);
```

### 4. Create Proof of Concept

Build minimal version of `rxclass-service.ts` that:
- Queries RxClass API
- Returns drug class string
- Handles errors gracefully
- Caches results

---

## Questions Answered

1. ✅ **Does RxClass provide therapeutic uses/indications?**
   - Yes! Via DISEASE class type and MeSH Pharmacological Actions

2. ✅ **What are the rate limits?**
   - Not explicitly stated (need to test)
   - RxNav-in-a-Box option for unlimited local access

3. ✅ **Do we need API keys?**
   - No! Public access, no authentication

4. ✅ **Can we get drug class from RxNorm alone?**
   - No, need RxClass API for proper classifications
   - RxNorm has relationships but not therapeutic classes

5. ✅ **Is there offline option?**
   - Yes! RxNav-in-a-Box for local deployment

---

## Resources

- [RxNorm API Documentation](https://lhncbc.nlm.nih.gov/RxNav/APIs/api-RxNorm.html)
- [RxClass API Documentation](https://lhncbc.nlm.nih.gov/RxNav/APIs/api-RxClass.html)
- [RxTerms API Documentation](https://lhncbc.nlm.nih.gov/RxNav/APIs/api-RxTerms.html)
- [Prescribable RxNorm API](https://lhncbc.nlm.nih.gov/RxNav/APIs/api-Prescribable.html)
- [RxMix Tutorial](https://lhncbc.nlm.nih.gov/RxNav/applications/RxMixTutorial.html)
- [RxNav-in-a-Box](https://lhncbc.nlm.nih.gov/RxNav/applications/RxNav-in-a-Box.html)
- [Terms of Service](https://rxnav.nlm.nih.gov/TermOfService.html)

---

## Benefits of This Approach

### Scalability
- No hardcoding = no constant updates
- Comprehensive coverage of all medications
- Authoritative data from NLM

### Safety
- More accurate drug classifications
- Better cross-reactivity detection
- Comprehensive contraindications
- Reduced risk of missing critical interactions

### Maintainability
- Less code to maintain
- Standardized terminology
- Clear data provenance
- Version controlled via RxNorm releases

### Professional
- Industry-standard terminologies
- Meets regulatory expectations
- Interoperable with EHR systems
- Auditable data sources

---

---

## SNOMED CT - Clinical Terminology

### Overview

**SNOMED CT (Systematized Nomenclature of Medicine - Clinical Terms)** is the world's most comprehensive, multilingual health terminology.

**Key Facts**:
- ✅ **U.S. Federal Standard** for clinical health information exchange
- ✅ **Required for Meaningful Use** EHR certification
- ✅ **Owned by SNOMED International** (not-for-profit)
- ✅ **Distributed by NLM** as U.S. National Release Center
- ✅ **Updated twice yearly** (ongoing expansion)
- 🌍 **Used in 50+ countries** globally

### What SNOMED CT Provides

**Clinical Content Hierarchies**:
1. **Clinical Finding** - Diseases, disorders, symptoms
2. **Procedure** - Medical/surgical procedures
3. **Situation with Explicit Context** - Medical history, family history
4. **Events** - Adverse events, complications

**Use Cases**:
- Electronic Health Records (EHR)
- Problem lists
- Diagnoses
- Family health history
- Clinical documentation
- Research studies

### SNOMED CT Capabilities

#### Semantic Interoperability
Enables different terms to mean the same thing:
- "Heart attack" = "Myocardial infarction" = "MI"
- Computer understands they're identical concepts

#### Multilingual Support
- Removes language barriers
- Consistent across healthcare settings
- Global standardization

#### Mappings to Other Standards
- **ICD-9-CM** mapping available
- **ICD-10-CM** mapping available
- Facilitates cross-terminology translation

### Access Methods

#### 1. UMLS Metathesaurus (Our Primary Access)
- ✅ **We have access** via UMLS license
- SNOMED CT integrated into UMLS
- Accessible through UMLS tools and browser

#### 2. SNOMED CT Browser (NLM)
- Web-based search and browse
- Available through UTS Applications menu
- No separate API documented

#### 3. UMLS API
- Access SNOMED CT concepts via UMLS API
- Query by concept, term, or code
- Retrieve relationships and mappings

**⚠️ Important**: No standalone SNOMED CT REST API like RxNorm has. Access is through UMLS Metathesaurus.

### CORE Problem List Subset

**Purpose**: Most frequently used SNOMED CT concepts for problem lists

**Coverage**:
- **16,874 concepts** covering 95% of clinical usage
- Based on data from 8 major institutions:
  - Beth Israel Deaconess Medical Center
  - Intermountain Healthcare
  - Kaiser Permanente
  - Mayo Clinic
  - Nebraska University Medical Center
  - Regenstrief Institute
  - Hong Kong Hospital Authority
  - Veterans Administration

**Use Cases**:
- Problem list documentation
- Discharge diagnoses
- Reason for encounter
- Summary-level clinical data

**File Format**: Downloadable subset with:
- SNOMED_CID (Concept ID)
- SNOMED_FSN (Fully Specified Name)
- UMLS_CUI (Link to UMLS concepts)
- OCCURRENCE (How many institutions use it)
- USAGE (Average usage percentage)

### Mappings Available

#### SNOMED CT → ICD-10-CM
**Purpose**: Generate billing codes from clinical data
- Semi-automated code generation
- Supports reimbursement
- Statistical reporting

#### ICD-9-CM → SNOMED CT
**Purpose**: Migrate legacy data
- Translate old codes to SNOMED CT
- Data modernization

**ClariMed Use**: Could map health conditions to both systems for interoperability

### Post-Coordination

**Feature**: Combine concepts for specific meanings

**Example**:
- Base concept: `95570007 Kidney stone`
- Add qualifier: `7771000 Left`
- Result: "Left kidney stone"

**Benefit**: Extend vocabulary without diverging from standards

### Meaningful Use Support

SNOMED CT supports **6 Meaningful Use Objectives**:
1. ✅ Maintain up-to-date problem list
2. ✅ Record patient family health history
3. ✅ Report cancer cases
4. ✅ Record and track vital signs
5. ✅ Record smoking status
6. ✅ Provide summary record for transitions

**ClariMed Relevance**: Health conditions list aligns with #1

---

## SNOMED CT for ClariMed

### Potential Use Cases

#### 1. Health Conditions (HIGH PRIORITY)

**Current**: Free-text strings with categories
```typescript
interface HealthCondition {
  condition: string; // User enters "Diabetes"
  category: HealthConditionCategory; // "endocrine"
}
```

**With SNOMED CT**:
```typescript
interface HealthCondition {
  condition: string;
  snomed_code: string; // "73211009"
  snomed_fsn: string; // "Diabetes mellitus (disorder)"
  umls_cui: string; // Links to UMLS
  category: HealthConditionCategory;
}
```

**Benefits**:
- Standardized terminology
- Autocomplete from CORE subset
- ICD-10-CM mapping for interoperability
- Semantic relationships

#### 2. Contraindications Enhancement

**Current**: Hardcoded object with ~50 rules
```typescript
const KNOWN_CONTRAINDICATIONS = {
  pregnancy: {
    'Warfarin': { severity: 'critical', ... }
  }
}
```

**With SNOMED CT**: Query relationships between:
- Disease concepts (from SNOMED CT)
- Drug concepts (from RxNorm)
- Use UMLS to link terminologies

**Challenge**: Contraindication data may not be directly in SNOMED CT
- Need to research if SNOMED CT has drug-disease relationships
- May need additional source (FDA SPL, clinical guidelines)

#### 3. Family Health History

**Future Feature**: Track family medical history
- Use SNOMED CT "Situation with explicit context" hierarchy
- Standard codes for "Family history of X"
- Supports Meaningful Use objective

#### 4. Problem List (Long-term)

**Vision**: Full EHR-grade problem list
- Active diagnoses
- Historical conditions
- Resolved problems
- CORE subset provides 95% coverage

### Integration Strategy

#### Phase 1: Research UMLS API Access
1. Explore UMLS Terminology Services (UTS) API
2. Test querying SNOMED CT concepts
3. Understand response formats
4. Document authentication/licensing

#### Phase 2: Health Conditions Enhancement
1. Add SNOMED CT autocomplete to Health Conditions form
2. Store SNOMED codes with conditions
3. Use CORE subset for common conditions
4. Enable ICD-10-CM mapping

#### Phase 3: Contraindication Expansion (If Feasible)
1. Research if SNOMED CT provides drug-disease relationships
2. If yes: Query relationships via UMLS
3. If no: Look for alternative sources (FDA, clinical guidelines)
4. Expand beyond 50 hardcoded rules

### Limitations & Considerations

#### No REST API
- Unlike RxNorm, SNOMED CT doesn't have dedicated REST API
- Must access through UMLS Metathesaurus
- May be more complex to query

#### Licensing
- ✅ Free in U.S. (IHTSDO member territory)
- ✅ Free for research projects
- ✅ Covered by our UMLS license
- Subject to IHTSDO Affiliate license terms

#### Complexity
- More comprehensive = more complex
- May need training to use effectively
- Post-coordination adds flexibility but complexity

#### Update Frequency
- Updated twice yearly
- Need to sync with UMLS releases
- May lag behind RxNorm (which updates monthly)

---

## UMLS REST API

### Overview

**Base URI**: `https://uts-ws.nlm.nih.gov/rest`

**Purpose**: Gateway to access all UMLS Metathesaurus content including SNOMED CT, RxNorm, ICD-10, and 200+ other vocabularies

**Documentation**: https://documentation.uts.nlm.nih.gov/rest/home.html

### Authentication

**⚠️ REQUIRES API KEY** (unlike RxNorm/RxClass which are open)

**How to get API key**:
1. Sign in to UTS (UMLS Terminology Services)
2. Navigate to "My Profile"
3. Generate API key
4. **We already have UMLS license** (approved November 13, 2025)

**Usage**: Include `apiKey` parameter in all requests
```
https://uts-ws.nlm.nih.gov/rest/search/current?string=diabetes&apiKey=YOUR_API_KEY
```

**New 2022 method**: Simple API key in query string (no more ticket-granting tickets)

**Validation endpoint**: Can validate other users' API keys
```
https://utslogin.nlm.nih.gov/validateUser?validatorApiKey=YOUR_API_KEY&apiKey=USER_API_KEY
```

### Core API Endpoints

#### 1. Search
**Endpoint**: `/search/{version}`
**Purpose**: Find CUIs (Concept Unique Identifiers) by term or code

**Example - Search for "diabetes"**:
```
GET /search/current?string=diabetes&apiKey=YOUR_API_KEY
```

**Search SNOMED CT specifically**:
```
GET /search/current?string=diabetes&sabs=SNOMEDCT_US&apiKey=YOUR_API_KEY
```

**Search with source filters**:
- `sabs=SNOMEDCT_US` - SNOMED CT only
- `sabs=RXNORM` - RxNorm only  
- `sabs=ICD10CM` - ICD-10-CM only

**Advanced search options**:
- `partialSearch=true` - Returns partial matches (diabetes → diabetic, diabetic neuropathy)
- `returnIdType=code` - Return source codes instead of CUIs
- `pageNumber=1&pageSize=25` - Pagination

**Example - Search by CUI, return SNOMED code**:
```
GET /search/current?string=C0009044&sabs=SNOMEDCT_US&returnIdType=code&apiKey=YOUR_API_KEY
```

#### 2. Concept Information
**Endpoint**: `/content/{version}/CUI/{CUI}`
**Purpose**: Get full details about a UMLS concept

**Example**:
```
GET /content/current/CUI/C0011849?apiKey=YOUR_API_KEY
```

**Returns**: Name, semantic types, definitions, source vocabularies

#### 3. Concept Atoms
**Endpoint**: `/content/{version}/CUI/{CUI}/atoms`
**Purpose**: Get all terms (atoms) for a concept from all source vocabularies

**Example - Get all names for diabetes concept**:
```
GET /content/current/CUI/C0011849/atoms?apiKey=YOUR_API_KEY
```

**Use case**: Get SNOMED CT FSN, RxNorm names, ICD-10 descriptions all at once

#### 4. Definitions
**Endpoint**: `/content/{version}/CUI/{CUI}/definitions`
**Purpose**: Get definitions from various sources

**Example**:
```
GET /content/current/CUI/C0011849/definitions?apiKey=YOUR_API_KEY
```

#### 5. Relations
**Endpoint**: `/content/{version}/CUI/{CUI}/relations`
**Purpose**: Get relationships between concepts

**Example**:
```
GET /content/current/CUI/C0011849/relations?apiKey=YOUR_API_KEY
```

**Returns**: Related concepts, relationship types (is-a, part-of, may-treat, etc.)

**⚠️ 2022 Change**: Now returns source-asserted relations too (not just NLM-asserted)

#### 6. Source-Asserted Data
**Endpoint**: `/content/{version}/source/{source}/{id}`
**Purpose**: Get data from specific source vocabulary

**Example - Get SNOMED CT concept**:
```
GET /content/current/source/SNOMEDCT_US/73211009?apiKey=YOUR_API_KEY
```

**Example - Get RxNorm concept**:
```
GET /content/current/source/RXNORM/1101606?apiKey=YOUR_API_KEY
```

#### 7. Source Relations
**Endpoint**: `/content/{version}/source/{source}/{id}/relations`
**Purpose**: Get relationships within specific source

**Example - SNOMED CT relationships**:
```
GET /content/current/source/SNOMEDCT_US/73211009/relations?apiKey=YOUR_API_KEY
```

#### 8. Source Hierarchy
**Endpoints**:
- `/content/{version}/source/{source}/{id}/parents` - Immediate parents
- `/content/{version}/source/{source}/{id}/children` - Immediate children
- `/content/{version}/source/{source}/{id}/ancestors` - All ancestors
- `/content/{version}/source/{source}/{id}/descendants` - All descendants

**Example - Get SNOMED CT hierarchy**:
```
GET /content/current/source/SNOMEDCT_US/73211009/ancestors?apiKey=YOUR_API_KEY
```

#### 9. Crosswalk (CRITICAL FOR US!)
**Endpoint**: `/crosswalk/{version}/source/{source}/{id}`
**Purpose**: Map codes between terminologies via shared CUI

**Example - Map RxNorm to SNOMED CT**:
```
GET /crosswalk/current/source/RXNORM/1101606?apiKey=YOUR_API_KEY
```

**Returns**: All codes that share the same UMLS CUI (SNOMED CT, ICD-10, MeSH, etc.)

**Use case**: Given RxNorm drug, find related SNOMED CT procedure/finding concepts

#### 10. Semantic Network
**Endpoint**: `/semantic-network/{version}/TUI/{id}`
**Purpose**: Get semantic type information

**Example**:
```
GET /semantic-network/current/TUI/T047?apiKey=YOUR_API_KEY
```

**Semantic types**: Disease or Syndrome, Pharmacologic Substance, Clinical Drug, etc.

### Key Features

#### Partial Search (2022)
```
GET /search/current?string=Congenital Nephrogenic Diabetes Insipidus&partialSearch=true&apiKey=YOUR_API_KEY
```
Returns results with 4 words, 3 words, 2 words, 1 word

#### Automated Downloads (2023)
Download full releases via API:
```bash
curl "https://uts-ws.nlm.nih.gov/download?url=https://download.nlm.nih.gov/umls/kss/rxnorm/RxNorm_weekly_10052022.zip&apiKey=YOUR_API_KEY" -o RxNorm_weekly_10052022.zip
```

**Available downloads**:
- RxNorm weekly releases
- SNOMED CT releases
- UMLS full releases

#### ElasticSearch (2022)
API uses ElasticSearch for improved search ranking and relevance

#### Word Stemming (2023)
- "lungs" finds "lung"
- "diabetic" finds "diabetes"
- Generally returns more results

### Version Parameter

**Options**:
- `current` - Latest release (recommended)
- `2024AA` - Specific UMLS release
- `2023AB` - Older release

**Example**:
```
/search/current/... (uses latest)
/search/2024AA/... (uses specific version)
```

### Rate Limits

**❓ Not documented** - Need to test or contact NLM

### Response Format

**Standard JSON structure**:
```json
{
  "pageSize": 25,
  "pageNumber": 1,
  "result": {
    "results": [
      {
        "ui": "C0011849",
        "name": "Diabetes Mellitus",
        "uri": "https://uts-ws.nlm.nih.gov/rest/content/current/CUI/C0011849",
        "rootSource": "SNOMEDCT_US"
      }
    ]
  }
}
```

---

## UMLS for ClariMed - Implementation Strategy

### Use Case 1: Enhanced Health Conditions

**Goal**: Standardize health condition entry with SNOMED CT codes

**Implementation**:

```typescript
// New health-conditions service
async function searchHealthCondition(query: string): Promise<ConditionSuggestion[]> {
  const response = await fetch(
    `https://uts-ws.nlm.nih.gov/rest/search/current?` +
    `string=${encodeURIComponent(query)}&` +
    `sabs=SNOMEDCT_US&` +
    `apiKey=${UMLS_API_KEY}`
  );
  
  const data = await response.json();
  return data.result.results.map(r => ({
    name: r.name,
    cui: r.ui,
    snomedCode: r.code // if returnIdType=code
  }));
}
```

**UI Enhancement**:
- Autocomplete in HealthConditionList
- Store SNOMED code with condition
- Display standardized name

**Database**:
```sql
ALTER TABLE health_conditions ADD COLUMN snomed_code TEXT;
ALTER TABLE health_conditions ADD COLUMN umls_cui TEXT;
```

### Use Case 2: Drug-Condition Mapping

**Goal**: Link medications to contraindicated conditions

**Implementation**:

```typescript
// Check if medication interacts with health condition
async function checkDrugConditionContraindication(
  rxcui: string,
  snomedCode: string
): Promise<ContraIndicationResult> {
  
  // Step 1: Get drug CUI from RxNorm RXCUI
  const drugCUI = await getCUIFromRxNorm(rxcui);
  
  // Step 2: Get condition CUI from SNOMED code
  const conditionCUI = await getCUIFromSNOMED(snomedCode);
  
  // Step 3: Check for relationships
  const relations = await fetch(
    `https://uts-ws.nlm.nih.gov/rest/content/current/CUI/${drugCUI}/relations?apiKey=${UMLS_API_KEY}`
  );
  
  // Look for "contraindicated_by" or similar relationships
  // ⚠️ May not exist - need to test
}
```

**Challenge**: UMLS may not have explicit drug-condition contraindications
- Need to research if relations include contraindications
- May need external source (FDA SPL, clinical guidelines)

### Use Case 3: Cross-Terminology Mapping

**Goal**: Map between RxNorm drugs and SNOMED CT conditions

**Implementation**:

```typescript
// Get all related terminologies for a drug
async function getCrosswalk(rxcui: string) {
  const response = await fetch(
    `https://uts-ws.nlm.nih.gov/rest/crosswalk/current/source/RXNORM/${rxcui}?apiKey=${UMLS_API_KEY}`
  );
  
  const data = await response.json();
  
  // Returns codes from SNOMED CT, ICD-10, MeSH, etc.
  const snomedCodes = data.result.filter(r => r.rootSource === 'SNOMEDCT_US');
  const icd10Codes = data.result.filter(r => r.rootSource === 'ICD10CM');
  
  return { snomedCodes, icd10Codes };
}
```

**Use case**: Generate ICD-10 codes for health conditions for insurance/billing

### Use Case 4: SNOMED CT Hierarchy Navigation

**Goal**: Find related conditions (parent/child relationships)

**Implementation**:

```typescript
// Get broader/narrower conditions
async function getRelatedConditions(snomedCode: string) {
  // Get parent conditions (broader)
  const parents = await fetch(
    `https://uts-ws.nlm.nih.gov/rest/content/current/source/SNOMEDCT_US/${snomedCode}/parents?apiKey=${UMLS_API_KEY}`
  );
  
  // Get child conditions (narrower)
  const children = await fetch(
    `https://uts-ws.nlm.nih.gov/rest/content/current/source/SNOMEDCT_US/${snomedCode}/children?apiKey=${UMLS_API_KEY}`
  );
  
  return { parents, children };
}
```

**Use case**: Suggest related conditions when adding health history

### Security Considerations

**API Key Storage**:
```env
# .env.local (NEVER commit!)
UMLS_API_KEY=your-key-here
```

### Security Considerations

**API Key Storage**:
```env
# .env.local (NEVER commit!)
UMLS_API_KEY=your-key-here
```

**Server-side only**: ⚠️ **Do NOT expose API key to client**
- Create Next.js API route: `/api/umls/search`
- API route calls UMLS with server-side key
- Client calls our API route

**Rate limiting**: Implement caching to reduce API calls

### Rate Limits & Terms of Service

**⚠️ CRITICAL: 20 requests per second per IP address**

NLM enforces strict rate limiting:
- **Maximum**: 20 requests/second from single IP
- **Penalty**: Service blocked until rate drops below limit
- **Recommendation**: Cache results for 12-24 hours
- **Exception requests**: Contact NLM for high-volume use cases

**Best practices**:
```typescript
// Implement rate limiting in API route
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(20, '1 s'), // 20 requests per second
});

export async function GET(request: Request) {
  const ip = request.headers.get('x-forwarded-for') ?? 'unknown';
  const { success } = await ratelimit.limit(ip);
  
  if (!success) {
    return new Response('Rate limit exceeded', { status: 429 });
  }
  
  // ... proceed with UMLS API call
}
```

**Required Attribution**:
Must include in application:
> "This product uses publicly available data from the U.S. National Library of Medicine (NLM), National Institutes of Health, Department of Health and Human Services; NLM is not responsible for the product and does not endorse or recommend this or any other product."

**✅ ClariMed compliance**: Already in Footer component with RxNav attribution

**Restrictions**:
- ❌ Cannot use NLM name/logo in branding
- ❌ Cannot claim NLM endorsement
- ✅ Must include medical disclaimer

**Medical Disclaimer** (already compliant):
> "It is not the intention of NLM to provide specific medical advice, but rather to provide users with information to better understand their health and their medications. NLM urges you to consult with a qualified physician for medical advice."

**✅ ClariMed compliance**: Already displayed throughout app

### Caching Strategy

**Supabase table**:
```sql
CREATE TABLE umls_cache (
  search_query TEXT PRIMARY KEY,
  source_vocab TEXT, -- 'SNOMEDCT_US', 'RXNORM', etc.
  results JSONB,
  cached_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '30 days'
);

CREATE INDEX idx_umls_cache_expires ON umls_cache(expires_at);
```

**Cache flow**:
1. Check cache for query + source
2. If hit and not expired: return cached results
3. If miss: Call UMLS API → cache → return results

### Answered Questions

1. ✅ **How to access SNOMED CT programmatically?**
   - Via UMLS API: `/search/current?sabs=SNOMEDCT_US`
   - Source-specific: `/content/current/source/SNOMEDCT_US/{code}`

2. ✅ **Authentication requirements?**
   - Requires API key (free with UMLS license)
   - Include `apiKey` parameter in all requests

3. ❓ **Rate limits?**
   - Not documented - need to test or contact NLM
   - Implement caching as best practice

4. ✅ **Cross-terminology mapping?**
   - Crosswalk endpoint: `/crosswalk/current/source/{source}/{id}`
   - Maps RxNorm ↔ SNOMED CT via shared CUIs

5. ✅ **CORE subset downloadable?**
   - Yes, automated download endpoint available
   - Can download full SNOMED CT release with API key

### Open Questions

1. **Does UMLS have drug-condition contraindications in relations?**
   - Need to test `/CUI/{CUI}/relations` for drug concepts
   - Check if relation types include contraindications
   - May need separate data source (FDA, clinical guidelines)

2. **What are actual rate limits?**
   - Documentation doesn't specify
   - Need to test or contact NLM
   - Implement exponential backoff

3. **Cost/licensing for production use?**
   - UMLS license is free
   - API key is free
   - No mentioned usage fees
   - Confirm terms of service for commercial app

---

## Summary: API Capabilities

| API | Drug Classes | Drug Info | Contraindications | Health Conditions | Access |
|-----|--------------|-----------|-------------------|-------------------|--------|
| **RxNorm** | ❌ No | ✅ Yes | ❌ No | ❌ No | ✅ REST API |
| **RxClass** | ✅✅ Yes! | ✅ Yes | ❌ No | ❌ No | ✅ REST API |
| **SNOMED CT** | ❌ No | ❌ No | ❓ Maybe | ✅✅ Yes! | ⚠️ Via UMLS |
| **UMLS** | ✅ Yes | ✅ Yes | ❓ Research | ✅ Yes | ❓ Need docs |

### Recommended Immediate Path:

1. ✅ **RxClass API** - Replace drug classification (HIGH PRIORITY)
2. ✅ **RxNorm API** - Enhanced relationships for cross-reactivity
3. ⏳ **UMLS API** - Research access to SNOMED CT
4. ⏳ **SNOMED CT** - Standardize health conditions (MEDIUM PRIORITY)

---

## References

- [RxNorm Overview](https://www.nlm.nih.gov/research/umls/rxnorm/overview.html)
- [RxNorm Technical Documentation](https://www.nlm.nih.gov/research/umls/rxnorm/docs/techdoc.html)
- [RxNorm API](https://lhncbc.nlm.nih.gov/RxNav/APIs/)
- [RxClass API](https://lhncbc.nlm.nih.gov/RxNav/APIs/api-RxClass.html)
- [SNOMED CT Resources (NLM)](https://www.nlm.nih.gov/healthit/snomedct/index.html)
- [SNOMED CT CORE Problem List](https://www.nlm.nih.gov/research/umls/Snomed/core_subset.html)
- [UMLS License Agreement](https://www.nlm.nih.gov/research/umls/knowledge_sources/metathesaurus/release/license_agreement.html)
- UMLS approval email received: November 13, 2025

---

**Status**: Research Phase - RxClass is clear winner for immediate implementation. SNOMED CT via UMLS needs further research.
**Owner**: Aaron Capron
**Priority**: 
- HIGH: RxClass integration for drug classes
- MEDIUM: UMLS/SNOMED CT research for health conditions
