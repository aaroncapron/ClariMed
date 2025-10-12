# RxNav API - Quick Reference & Examples

## 🔗 Official Documentation
- **API Docs**: https://lhncbc.nlm.nih.gov/RxNav/APIs/api-RxNorm.getAllConceptsByTTY.html
- **Interactive Browser**: https://mor.nlm.nih.gov/RxNav/

---

## 🎯 Key Endpoints We'll Use

### 1. Search Drugs by Name
**Endpoint**: `/REST/drugs.json`
**Use Case**: Autocomplete, medication lookup

```bash
GET https://rxnav.nlm.nih.gov/REST/drugs.json?name=lisinopril
```

**Response Example**:
```json
{
  "drugGroup": {
    "name": "lisinopril",
    "conceptGroup": [
      {
        "tty": "SBD",
        "conceptProperties": [
          {
            "rxcui": "314076",
            "name": "lisinopril 10 MG Oral Tablet",
            "synonym": "Prinivil 10 MG Oral Tablet",
            "tty": "SBD",
            "language": "ENG",
            "suppress": "N",
            "umlscui": "C0978482"
          }
        ]
      }
    ]
  }
}
```

---

### 2. Get Drug Details by RxCUI
**Endpoint**: `/REST/rxcui/{rxcui}/properties.json`
**Use Case**: Get full details after user selects medication

```bash
GET https://rxnav.nlm.nih.gov/REST/rxcui/314076/properties.json
```

**Response Example**:
```json
{
  "properties": {
    "rxcui": "314076",
    "name": "lisinopril 10 MG Oral Tablet",
    "synonym": "Prinivil 10 MG Oral Tablet",
    "tty": "SBD",
    "language": "ENG",
    "suppress": "N",
    "umlscui": "C0978482"
  }
}
```

---

### 3. Get Ingredients (Active Components)
**Endpoint**: `/REST/rxcui/{rxcui}/related.json?tty=IN`
**Use Case**: Get active ingredients for interaction checking

```bash
GET https://rxnav.nlm.nih.gov/REST/rxcui/314076/related.json?tty=IN
```

**Response Example**:
```json
{
  "relatedGroup": {
    "conceptGroup": [
      {
        "tty": "IN",
        "conceptProperties": [
          {
            "rxcui": "29046",
            "name": "lisinopril",
            "tty": "IN"
          }
        ]
      }
    ]
  }
}
```

---

### 4. Check Drug Interactions
**Endpoint**: `/REST/interaction/list.json`
**Use Case**: Check if two drugs interact

```bash
GET https://rxnav.nlm.nih.gov/REST/interaction/list.json?rxcuis=29046+5640
# lisinopril (29046) + ibuprofen (5640)
```

**Response Example**:
```json
{
  "fullInteractionTypeGroup": [
    {
      "sourceName": "DrugBank",
      "fullInteractionType": [
        {
          "minConcept": [
            {
              "rxcui": "29046",
              "name": "lisinopril",
              "tty": "IN"
            },
            {
              "rxcui": "5640",
              "name": "ibuprofen",
              "tty": "IN"
            }
          ],
          "interactionPair": [
            {
              "interactionConcept": [
                {
                  "minConceptItem": {
                    "rxcui": "29046",
                    "name": "lisinopril",
                    "tty": "IN"
                  },
                  "sourceConceptItem": {
                    "id": "DB00722",
                    "name": "Lisinopril",
                    "url": "https://go.drugbank.com/drugs/DB00722#interactions"
                  }
                },
                {
                  "minConceptItem": {
                    "rxcui": "5640",
                    "name": "ibuprofen",
                    "tty": "IN"
                  },
                  "sourceConceptItem": {
                    "id": "DB01050",
                    "name": "Ibuprofen",
                    "url": "https://go.drugbank.com/drugs/DB01050#interactions"
                  }
                }
              ],
              "severity": "N/A",
              "description": "The risk or severity of adverse effects can be increased when Lisinopril is combined with Ibuprofen."
            }
          ]
        }
      ]
    }
  ]
}
```

---

### 5. Spelling Suggestions
**Endpoint**: `/REST/spellingsuggestions.json`
**Use Case**: Help user when they misspell drug name

```bash
GET https://rxnav.nlm.nih.gov/REST/spellingsuggestions.json?name=lissinopril
```

**Response**:
```json
{
  "suggestionGroup": {
    "name": "lissinopril",
    "suggestionList": {
      "suggestion": [
        "lisinopril",
        "enalapril",
        "fosinopril"
      ]
    }
  }
}
```

---

## 🛠️ Implementation Plan for ClariMed

### Phase 1: Basic Lookup (Now)
1. **Autocomplete dropdown** - User types "lisino..." → show suggestions
2. **Select from results** - User picks "lisinopril 10 MG Oral Tablet"
3. **Store RxCUI** - Save `314076` with medication
4. **Display validation badge** - Show ✓ "Verified with RxNorm"

### Phase 2: Interaction Checking (Next)
1. **Extract ingredients** - Get RxCUI codes for active ingredients
2. **Check all pairs** - When user has 3+ meds, check all combinations
3. **Display warnings** - Show high/moderate/low severity alerts
4. **Link to sources** - Show DrugBank/ONCHigh references

### Phase 3: Advanced (Later)
1. **NDC lookup** - Search by barcode/NDC code
2. **Brand/Generic mapping** - Show all equivalent products
3. **Offline database** - Download prescribable subset
4. **Cache results** - Store API responses in IndexedDB

---

## 📝 Code Skeleton

```typescript
// lib/rxnav.ts

const RXNAV_BASE_URL = 'https://rxnav.nlm.nih.gov/REST';

export interface DrugSearchResult {
  rxcui: string;
  name: string;
  synonym?: string;
  tty: string; // Term Type: SBD = Branded Drug, IN = Ingredient
}

/**
 * Search for drugs by name (autocomplete)
 */
export async function searchDrugs(query: string): Promise<DrugSearchResult[]> {
  try {
    const response = await fetch(
      `${RXNAV_BASE_URL}/drugs.json?name=${encodeURIComponent(query)}`
    );
    const data = await response.json();
    
    // Parse and flatten results
    const results: DrugSearchResult[] = [];
    const conceptGroups = data.drugGroup?.conceptGroup || [];
    
    for (const group of conceptGroups) {
      if (group.conceptProperties) {
        results.push(...group.conceptProperties);
      }
    }
    
    return results;
  } catch (error) {
    console.error('RxNav search error:', error);
    return [];
  }
}

/**
 * Get drug details by RxCUI
 */
export async function getDrugDetails(rxcui: string) {
  try {
    const response = await fetch(
      `${RXNAV_BASE_URL}/rxcui/${rxcui}/properties.json`
    );
    const data = await response.json();
    return data.properties;
  } catch (error) {
    console.error('RxNav details error:', error);
    return null;
  }
}

/**
 * Get active ingredients for a drug
 */
export async function getIngredients(rxcui: string): Promise<string[]> {
  try {
    const response = await fetch(
      `${RXNAV_BASE_URL}/rxcui/${rxcui}/related.json?tty=IN`
    );
    const data = await response.json();
    
    const ingredients: string[] = [];
    const groups = data.relatedGroup?.conceptGroup || [];
    
    for (const group of groups) {
      if (group.tty === 'IN' && group.conceptProperties) {
        ingredients.push(...group.conceptProperties.map((c: any) => c.rxcui));
      }
    }
    
    return ingredients;
  } catch (error) {
    console.error('RxNav ingredients error:', error);
    return [];
  }
}

/**
 * Check drug interactions between ingredients
 */
export async function checkInteractions(rxcuis: string[]) {
  try {
    const rxcuiList = rxcuis.join('+');
    const response = await fetch(
      `${RXNAV_BASE_URL}/interaction/list.json?rxcuis=${rxcuiList}`
    );
    const data = await response.json();
    return data.fullInteractionTypeGroup || [];
  } catch (error) {
    console.error('RxNav interaction check error:', error);
    return [];
  }
}
```

---

## 🧪 Test These URLs in Your Browser

Try these right now to see live data:

1. **Search "lisinopril"**: 
   https://rxnav.nlm.nih.gov/REST/drugs.json?name=lisinopril

2. **Get details for RxCUI 314076**:
   https://rxnav.nlm.nih.gov/REST/rxcui/314076/properties.json

3. **Check lisinopril + ibuprofen interaction**:
   https://rxnav.nlm.nih.gov/REST/interaction/list.json?rxcuis=29046+5640

---

## ✅ Next Steps

1. **Create `lib/rxnav.ts`** with the skeleton above
2. **Test API calls** - Make sure they work
3. **Add autocomplete** to medication form
4. **Store RxCUI** with each medication
5. **Build interaction checker** (Phase 2)

Want me to start building this integration now? 🚀
