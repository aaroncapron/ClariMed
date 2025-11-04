## Enhanced Drug Utilization Review (DUR) System

### Overview
The DUR system has been significantly expanded to provide comprehensive medication safety checking against:
1. **Drug-to-drug interactions** (via RxNav API)
2. **Drug allergies** (with cross-reactivity detection)
3. **Health condition contraindications** (new in this update)

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

Checks medications against health conditions for safety concerns:

**Severity Levels**:
- **Critical**: Absolute contraindications (e.g., ACE inhibitors in pregnancy)
- **Major**: Serious risks requiring monitoring (e.g., NSAIDs in kidney disease)
- **Moderate**: Use with caution (e.g., corticosteroids in diabetes)
- **Minor**: Generally safe but noteworthy

**Example Contraindications**:
- **Pregnancy**:
  - Critical: Isotretinoin, Warfarin, ACE inhibitors, ARBs, Statins
  - Major: NSAIDs (3rd trimester), Tetracyclines
  
- **Kidney Disease**:
  - Major: NSAIDs, Metformin, Lithium
  
- **Liver Disease**:
  - Critical: Methotrexate
  - Major: Acetaminophen, Statins
  
- **Asthma**:
  - Major: NSAIDs, Beta blockers

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
2. ✅ Build contraindication checking system
3. ✅ Create common allergies/conditions reference data
4. ✅ Add database migration for health_conditions table
5. ⏳ **Create health conditions management UI** (profile page)
6. ⏳ **Integrate contraindication checking into AddMedicationForm**
7. ⏳ **Add autocomplete for common allergies in allergy form**
8. ⏳ **Update dashboard to show contraindication warnings**
9. ⏳ **Write tests for contraindications and reference data**
10. ⏳ **Update documentation (FEATURES.md, CHANGELOG.md)**

### Technical Notes

- All new code follows existing patterns (matches allergies.ts structure)
- Type-safe with TypeScript interfaces
- Supabase integration with RLS
- Performance optimized with database indexing
- Autocomplete uses fuzzy matching for better UX
- Contraindication data curated from FDA drug labels and medical literature

### Benefits

1. **Comprehensive Safety**: Three-layer checking (interactions, allergies, contraindications)
2. **User-Friendly**: Autocomplete from common conditions/allergies
3. **Informative**: Clear explanations of why medications may be risky
4. **Privacy**: All data stored securely with user-specific access
5. **Scalable**: Easy to add more conditions and contraindications
6. **Compliant**: Maintains FDA non-device status

This positions ClariMed as a comprehensive medication safety tool while staying within legal boundaries.
