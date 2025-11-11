## Enhanced Drug Utilization Review (DUR) System

### Overview
The DUR system has been significantly enhanced to provide comprehensive medication safety checking powered by the NIH RxNav API:
1. **Drug-to-drug interactions** (via RxNav Interaction API with DrugBank data)
2. **Drug allergies** (with intelligent cross-reactivity detection via API)
3. **Health condition contraindications** (via RxNav API)

All safety checks are **API-driven**, ensuring up-to-date and accurate information from trusted medical databases.

### New Features

#### 1. Common Drug Allergy Reference
**File**: `lib/medical-reference.ts`

- Pre-populated list of 18 common drug allergies
- Organized by drug class for easy selection
- Includes:
  - Beta-lactam antibiotics (Penicillin, Amoxicillin, Cephalosporins)
  - Sulfonamides (Sulfa drugs, Bactrim)
  - NSAIDs (Aspirin, Ibuprofen, Naproxen)
  - Opioids (Codeine, Morphine)
  - Other common allergens (Latex, Egg, Local anesthetics, etc.)
- Autocomplete suggestions when user types 2+ characters

#### 2. Health Conditions Tracking
**Files**: `lib/health-conditions.ts`, `types/index.ts`

**New TypeScript Interfaces**:
```typescript
interface HealthCondition {
  id: string;
  user_id: string;
  condition: string;
  rxcui?: string; // NEW: RxCUI for API-based contraindication checks
  category: HealthConditionCategory;
  diagnosed_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}
```

**Categories**:
- Cardiovascular (hypertension, heart disease, arrhythmia, etc.)
- Respiratory (asthma, COPD, sleep apnea)
- Endocrine (diabetes, thyroid disease)
- Gastrointestinal (GERD, peptic ulcer, IBD)
- Renal (kidney disease, CKD)
- Hepatic (liver disease, cirrhosis)
- Neurological (epilepsy, depression, Parkinson's)
- Pregnancy (pregnancy, breastfeeding)
- Other (glaucoma, gout, enlarged prostate, etc.)

**Common Conditions Reference**:
- 40+ pre-defined common health conditions
- User-friendly names with descriptions
- Autocomplete suggestions for easy selection

#### 3. Contraindication Checking
**File**: `lib/contraindications.ts`

Checks medications against health conditions for safety concerns using the RxNav API:

**API-Driven Approach**:
- Fetches contraindication data from RxNav in real-time
- Uses RxCUI codes to match medications with health conditions
- Always up-to-date with latest medical research
- No hardcoded data - fully dynamic

**Severity Levels**:
- **Critical**: Absolute contraindications (e.g., ACE inhibitors in pregnancy)
- **Major**: Serious risks requiring monitoring (e.g., NSAIDs in kidney disease)
- **Moderate**: Use with caution (e.g., corticosteroids in diabetes)
- **Minor**: Generally safe but noteworthy

**Key Functions**:
- `checkContraindications(medication, conditions)`: Async function that queries RxNav API
- `getContraindicationBadge(severity)`: Returns UI badge configuration

#### 4. Database Schema
**Migration**: `006_health_conditions.sql`

- New `health_conditions` table in Supabase
- Row Level Security (RLS) enabled
- User-specific policies (users only see/modify their own data)
- Auto-updating `updated_at` timestamp
- Indexed on `user_id` for performance

### Integration Points

The enhanced DUR system integrates into:

1. **AddMedicationForm**: 
   - Check drug interactions (existing)
   - Check allergy conflicts (existing)  
   - Check contraindications (to be added)
   - Unified warning display with severity indicators

2. **Dashboard**:
   - Interaction summary banner (existing)
   - Per-medication warning badges (existing)
   - Contraindication warnings (to be added)

3. **Profile Page** (future):
   - Health conditions management UI
   - Allergy list with autocomplete from common allergies
   - Visual overview of all safety factors

### FDA Compliance

All contraindication warnings maintain compliance:
- **Informational only** - no medical advice
- **Non-blocking** - user maintains autonomy
- **Clear disclaimers** on all warnings
- **Educational purpose** emphasized
- **Healthcare provider consultation** always recommended

The system provides **decision support information**, not **clinical decisions**.

### Next Steps

To complete the enhanced DUR implementation:

1. ✅ Create health conditions types and interfaces
2. ✅ Build contraindication checking system with RxNav API
3. ✅ Create common allergies/conditions reference data
4. ✅ Add database migration for health_conditions table
5. ✅ **Integrate allergy checking into AddMedicationForm with API**
6. ✅ **Integrate drug interaction checking with RxNav API**
7. ✅ **Integrate contraindication checking into AddMedicationForm**
8. ⏳ **Create health conditions management UI** (profile page)
9. ⏳ **Add autocomplete for common allergies in allergy form**
10. ⏳ **Update dashboard to show contraindication warnings**
11. ⏳ **Write tests for API-driven contraindications and interactions**
12. ✅ **Update documentation (FEATURES.md, HOW-IT-WORKS.md)**

### Technical Notes

- All safety checks are **API-driven** using NIH RxNav
- No hardcoded interaction or contraindication data
- Real-time checks against DrugBank via RxNav
- Type-safe with TypeScript interfaces
- Supabase integration with RLS for user data
- Performance optimized with database indexing
- Allergy checking uses ingredient and drug class analysis via API
- Contraindication data sourced from FDA drug labels via RxNav
- All checks return detailed warnings with severity levels

### Benefits

1. **Comprehensive Safety**: Three-layer checking (interactions, allergies, contraindications)
2. **User-Friendly**: Autocomplete from common conditions/allergies
3. **Informative**: Clear explanations of why medications may be risky
4. **Privacy**: All data stored securely with user-specific access
5. **Scalable**: Easy to add more conditions and contraindications
6. **Compliant**: Maintains FDA non-device status

This positions ClariMed as a comprehensive medication safety tool while staying within legal boundaries.
