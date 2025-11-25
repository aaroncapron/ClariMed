# Drug Search Improvements - GoodRx Analysis

**Purpose**: Research findings on improving ClariMed's drug search functionality based on GoodRx's approach.

**Last Updated**: November 24, 2025

---

## Executive Summary

GoodRx excels at making drug search intuitive and fast through:
- Prominent search placement with popular drug suggestions
- Smart autocomplete with brand name recognition
- Visual hierarchy and categorization
- Graceful error handling (spelling suggestions)

ClariMed can adopt similar patterns while maintaining its safety-first, RxNav-powered approach.

---

## GoodRx Key Features Observed

### 1. Popular Searches
**What They Do:**
- Display 10-15 commonly searched drugs on homepage
- Include both brand names (Ozempic, Wegovy) and generics (Atorvastatin, Metformin)
- Group by therapeutic category (GLP-1s, ED meds, statins)

**Value Proposition:**
- Reduces friction - users can click instead of type
- Educates users on proper drug names
- Drives engagement with common medications

### 2. Search Interface
**What They Do:**
- Large, prominent search box
- Placeholder text with examples ("Search for a drug")
- Real-time autocomplete as you type
- Fast response (likely < 100ms perceived latency)

**Value Proposition:**
- Reduces cognitive load
- Provides immediate feedback
- Handles both brand and generic names

### 3. Autocomplete Results
**What They Do:**
- Show brand names prominently with generic in parentheses
- Display dosage forms (tablet, capsule, etc.)
- Color-coded badges for generic vs brand
- Sort by relevance (exact match → common medications → alphabetical)

**Value Proposition:**
- Users recognize brand names easier
- Quick visual scanning
- Reduced selection errors

### 4. Error Handling
**What They Do:**
- Spelling suggestions for typos
- "Did you mean...?" prompts
- Fuzzy matching algorithm

**Value Proposition:**
- Graceful degradation
- Improved user experience
- Higher success rate

---

## Current ClariMed Implementation Analysis

### Strengths
- Uses authoritative RxNav API (public domain, no rate limits)
- 150ms debounce for fast perceived response
- Smart sorting: Form → Generic/Brand → Dosage → Alphabetical
- Displays both SCD (generic) and SBD (brand) properly
- Shows dosage form badges
- Already has spelling suggestion API integration (`getSpellingSuggestions`)

### Gaps
- No popular/recent searches shown
- Spelling suggestions not used in UI
- Limited visual hierarchy in dropdown
- No search examples in placeholder
- No "no results" state with suggestions
- No category grouping (by therapeutic class)

---

## Recommended Improvements (Prioritized)

### HIGH PRIORITY

#### 1. Add Popular Medications Display
**Implementation:**
- Show 8-10 common medications above search box (when empty)
- Include mix of brand and generic names
- Make clickable to auto-fill search

**Suggested Medications:**
- Lisinopril (blood pressure)
- Atorvastatin (cholesterol)
- Metformin (diabetes)
- Levothyroxine (thyroid)
- Omeprazole (acid reflux)
- Albuterol (asthma)
- Sertraline (depression)
- Gabapentin (nerve pain)

**Technical:**
```typescript
// In AddMedicationForm.tsx or new component
const POPULAR_MEDICATIONS = [
  { name: 'Lisinopril', rxcui: '314076', category: 'Blood Pressure' },
  { name: 'Atorvastatin', rxcui: '83367', category: 'Cholesterol' },
  // ... etc
];
```

#### 2. Enhance Placeholder Text
**Current:** `"e.g., Lisinopril"`
**Improved:** `"Search medications (e.g., Lisinopril, Lipitor, Metformin)"`

**Why:** Educates users that both brand and generic work

#### 3. Add Spelling Suggestions
**Implementation:**
- When search returns 0 results, call `getSpellingSuggestions()`
- Show "Did you mean...?" with clickable suggestions

**Technical:**
```typescript
// In AddMedicationForm.tsx useEffect
if (results.length === 0 && name.length >= 3) {
  const suggestions = await getSpellingSuggestions(name);
  setSpellingSuggestions(suggestions);
}
```

#### 4. Improve Dropdown Visual Hierarchy
**Current:** Flat list with small badges
**Improved:**
- Larger drug names (font-size: 16px → 18px)
- Bold brand names, regular generic
- More prominent dosage form badges
- Hover state with subtle background color

### MEDIUM PRIORITY

#### 5. Add Recent Searches (Local Storage)
**Implementation:**
- Store last 5 successfully added medications in localStorage
- Show below popular medications when user focuses search box
- Allow clicking to auto-fill

**Technical:**
```typescript
const STORAGE_KEY = 'clarimed_recent_searches';

const saveRecentSearch = (medication: string, rxcui: string) => {
  const recent = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  const updated = [
    { medication, rxcui, timestamp: Date.now() },
    ...recent.filter(r => r.rxcui !== rxcui)
  ].slice(0, 5);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
};
```

#### 6. Add Therapeutic Category Badges
**Implementation:**
- Use RxClass API to get therapeutic categories
- Display as subtle badges (e.g., "Antihypertensive", "Statin")

**API:**
```typescript
// Already available via RxClass integration
export async function getTherapeuticClasses(rxcui: string): Promise<string[]>
```

#### 7. Add "No Results" State
**Implementation:**
- Friendly message when 0 results
- Show spelling suggestions automatically
- Provide examples of valid searches

**UI:**
```
No medications found for "lipitor"

Did you mean?
• Lipitor
• Lisinopril

Try searching for:
• Brand names (Lipitor, Advil)
• Generic names (atorvastatin, ibuprofen)
```

### LOW PRIORITY

#### 8. Search Analytics
**Implementation:**
- Track common searches (anonymized)
- Identify patterns for better autocomplete
- Update popular medications list based on actual usage

#### 9. Search History Navigation
**Implementation:**
- Up/down arrow keys to navigate dropdown
- Enter to select
- Escape to close

#### 10. Advanced Filtering
**Implementation:**
- Filter by form (tablets only, liquids only)
- Filter by brand vs generic
- Filter by therapeutic class

---

## Implementation Roadmap

### Phase 1: Quick Wins (1-2 days)
- [ ] Add popular medications display
- [ ] Enhance placeholder text
- [ ] Improve dropdown visual hierarchy
- [ ] Add spelling suggestions on no results

### Phase 2: User Experience (3-5 days)
- [ ] Add recent searches (localStorage)
- [ ] Add therapeutic category badges
- [ ] Implement "no results" state
- [ ] Keyboard navigation

### Phase 3: Advanced Features (1-2 weeks)
- [ ] Search analytics (optional)
- [ ] Advanced filtering
- [ ] Performance optimizations (caching)

---

## Technical Considerations

### API Usage
**RxNav Endpoints:**
- Already using: `drugs.json`, `approximateTerm.json`, `related.json`
- Available but unused: `spellingsuggestions.json` ← ADD THIS

**Rate Limiting:**
- RxNav is public domain, no rate limits
- Implement client-side caching to reduce calls
- Cache popular medications in-app (no API needed)

### Performance
**Current:**
- 150ms debounce
- No caching
- Average 200-300ms API response

**Improvements:**
- Add localStorage cache (1-hour TTL)
- Preload popular medications on mount
- Reduce debounce to 100ms for better UX

### Accessibility
- [ ] Ensure dropdown is keyboard navigable
- [ ] ARIA labels for autocomplete
- [ ] Screen reader announcements for suggestions
- [ ] Focus management

---

## Success Metrics

**Quantitative:**
- Reduce average search time by 30%
- Increase successful medication additions by 20%
- Reduce typo-related search failures by 50%

**Qualitative:**
- Users report search feels "faster"
- Fewer user errors (wrong medication selected)
- Better brand/generic recognition

---

## Legal & Safety Notes

**CRITICAL:** All improvements must maintain:
- Informational purpose only (no medical advice)
- RxNav attribution in Footer
- User responsibility for verification
- Healthcare provider consultation disclaimers

**NO changes that:**
- Suggest dosages or directions
- Recommend medications
- Provide medical decision support
- Make therapeutic claims

---

## References

- GoodRx homepage analysis (November 24, 2025)
- RxNav API documentation: https://lhncbc.nlm.nih.gov/RxNav/APIs/
- Current ClariMed implementation: `lib/rxnav.ts`, `components/AddMedicationForm.tsx`

---

**Prepared by:** GitHub Copilot (Claude Sonnet 4.5)
**For:** ClariMed v0.8.0 Drug Search Enhancement
