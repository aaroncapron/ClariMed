/**
 * RxNav API Wrapper
 * 
 * Interface for NIH RxNav REST API for medication lookup and validation.
 * No API key required - public domain data.
 * 
 * Documentation: https://lhncbc.nlm.nih.gov/RxNav/APIs/
 */

const RXNAV_BASE_URL = 'https://rxnav.nlm.nih.gov/REST';

export interface DrugSearchResult {
  rxcui: string;
  name: string;
  synonym?: string;
  tty: 'SCD' | 'SBD' | 'BPCK' | 'GPCK' | 'IN'; // Term Type
  language: string;
  suppress: string;
  displayName?: string; // Formatted name for display
  form?: string; // Dosage form (Tablet, Capsule, etc.)
}

export interface DrugProperties {
  rxcui: string;
  name: string;
  synonym?: string;
  tty: string;
  language: string;
  suppress: string;
  umlscui?: string;
}

/**
 * Format brand drug name to put brand first, generic in parentheses
 * Example: "lisinopril 10 MG Oral Tablet [Prinivil]" → "Prinivil (lisinopril) 10 MG Oral Tablet"
 */
function formatBrandName(name: string, synonym?: string): string {
  // Check if there's a brand name in brackets
  const bracketMatch = name.match(/^(.+?)\s*\[([^\]]+)\]$/);
  
  if (bracketMatch) {
    const [, genericPart, brandName] = bracketMatch;
    // Extract the ingredient name (before dosage)
    const ingredientMatch = genericPart.match(/^([a-zA-Z\s]+)\s+(.+)$/);
    
    if (ingredientMatch) {
      const [, ingredient, rest] = ingredientMatch;
      return `${brandName} (${ingredient.trim()}) ${rest}`;
    }
  }
  
  return name;
}

/**
 * Extract dosage form from medication name
 * Returns priority order: Tablet=1, Capsule=2, Liquid=3, Other=4
 */
function getDosageFormPriority(name: string): number {
  const nameLower = name.toLowerCase();
  
  if (/\btablet\b/i.test(nameLower)) return 1;
  if (/\bcapsule\b/i.test(nameLower)) return 2;
  if (/\b(liquid|solution|suspension|syrup|oral solution)\b/i.test(nameLower)) return 3;
  
  return 4; // Everything else
}

/**
 * Extract dosage form name for grouping
 */
function extractDosageForm(name: string): string {
  const formMatch = name.match(/\b(Tablet|Capsule|Liquid|Solution|Suspension|Syrup|Oral Solution|Injection|Cream|Ointment|Gel|Patch)\b/i);
  return formMatch ? formMatch[1] : 'Other';
}

/**
 * Search for drugs by name (autocomplete)
 * Returns both generic (SCD) and brand (SBD) results
 * Uses approximateTerm API for better partial matching
 */
export async function searchDrugs(query: string): Promise<DrugSearchResult[]> {
  if (!query || query.length < 2) return [];
  
  try {
    // First, try the regular drugs API (works for more complete terms)
    let response = await fetch(
      `${RXNAV_BASE_URL}/drugs.json?name=${encodeURIComponent(query)}`
    );
    
    if (!response.ok) {
      throw new Error(`RxNav API error: ${response.status}`);
    }
    
    let data = await response.json();
    let hasResults = data.drugGroup?.conceptGroup && data.drugGroup.conceptGroup.length > 0;
    
    // If no results, try approximateTerm API (better for partial matches like "lisin")
    if (!hasResults) {
      response = await fetch(
        `${RXNAV_BASE_URL}/approximateTerm.json?term=${encodeURIComponent(query)}&maxEntries=10`
      );
      
      if (!response.ok) {
        throw new Error(`RxNav API error: ${response.status}`);
      }
      
      const approxData = await response.json();
      const candidates = approxData.approximateGroup?.candidate || [];
      
      // Get unique RxCUIs (ingredients)
      const rxcuiSet = new Set<string>();
      candidates.forEach((c: any) => {
        if (c.rxcui) rxcuiSet.add(c.rxcui);
      });
      const uniqueRxcuis = Array.from(rxcuiSet).slice(0, 5);
      
      // For each ingredient, get the drug products (SCD/SBD)
      const allResults: DrugSearchResult[] = [];
      
      for (const rxcui of uniqueRxcuis) {
        const relatedResponse = await fetch(
          `${RXNAV_BASE_URL}/rxcui/${rxcui}/related.json?tty=SCD+SBD`
        );
        
        if (relatedResponse.ok) {
          const relatedData = await relatedResponse.json();
          const conceptGroups = relatedData.relatedGroup?.conceptGroup || [];
          
          for (const group of conceptGroups) {
            if ((group.tty === 'SCD' || group.tty === 'SBD') && group.conceptProperties) {
              for (const drug of group.conceptProperties) {
                allResults.push({
                  ...drug,
                  displayName: group.tty === 'SBD' ? formatBrandName(drug.name, drug.synonym) : drug.name,
                  form: extractDosageForm(drug.name),
                });
              }
            }
          }
        }
      }
      
      // Sort and return
      return sortDrugResults(allResults);
    }
    
    // Parse results from drugs API
    const results: DrugSearchResult[] = [];
    const conceptGroups = data.drugGroup?.conceptGroup || [];
    
    for (const group of conceptGroups) {
      // Prioritize SCD (generic) and SBD (brand) results
      if ((group.tty === 'SCD' || group.tty === 'SBD') && group.conceptProperties) {
        for (const drug of group.conceptProperties) {
          results.push({
            ...drug,
            displayName: group.tty === 'SBD' ? formatBrandName(drug.name, drug.synonym) : drug.name,
            form: extractDosageForm(drug.name),
          });
        }
      }
    }
    
    return sortDrugResults(results);
  } catch (error) {
    console.error('RxNav search error:', error);
    return [];
  }
}

/**
 * Extract numeric dosage strength for sorting
 * Examples: "10 MG" → 10, "2.5 MG" → 2.5, "100 MCG" → 0.1 (convert to MG)
 */
function extractDosageStrength(name: string): number {
  // Match dosage pattern: number + unit
  const match = name.match(/(\d+(?:\.\d+)?)\s*(MG|MCG|G|ML|%|UNIT)/i);
  
  if (!match) return 0; // No dosage found, sort to beginning
  
  const [, value, unit] = match;
  let numericValue = parseFloat(value);
  
  // Normalize to MG for comparison
  const unitUpper = unit.toUpperCase();
  if (unitUpper === 'MCG') {
    numericValue = numericValue / 1000; // Convert MCG to MG
  } else if (unitUpper === 'G') {
    numericValue = numericValue * 1000; // Convert G to MG
  }
  // ML, %, UNIT stay as-is for now
  
  return numericValue;
}

/**
 * Sort drug results by form, generic/brand, then alphabetically
 * Also deduplicates results based on name (ignoring different packages/manufacturers)
 */
function sortDrugResults(results: DrugSearchResult[]): DrugSearchResult[] {
  // First, deduplicate by name (same drug name = same drug, different packages)
  const seen = new Set<string>();
  const uniqueResults = results.filter((drug) => {
    // Normalize the name for comparison (remove extra spaces, lowercase)
    const normalizedName = (drug.displayName || drug.name).toLowerCase().trim();
    
    if (seen.has(normalizedName)) {
      return false; // Skip duplicate
    }
    
    seen.add(normalizedName);
    return true; // Keep first occurrence
  });
  
  // Then sort the unique results
  return uniqueResults.sort((a, b) => {
    // First: Sort by dosage form (Tablet, Capsule, Liquid, Other)
    const formA = getDosageFormPriority(a.name);
    const formB = getDosageFormPriority(b.name);
    if (formA !== formB) return formA - formB;
    
    // Second: Generic (SCD) before Brand (SBD) within same form
    if (a.tty === 'SCD' && b.tty === 'SBD') return -1;
    if (a.tty === 'SBD' && b.tty === 'SCD') return 1;
    
    // Third: Sort by dosage strength (lowest to highest)
    const strengthA = extractDosageStrength(a.name);
    const strengthB = extractDosageStrength(b.name);
    if (strengthA !== strengthB) return strengthA - strengthB;
    
    // Fourth: Alphabetically by display name (for drugs with same strength)
    return (a.displayName || a.name).localeCompare(b.displayName || b.name);
  });
}

/**
 * Get drug details by RxCUI
 */
export async function getDrugDetails(rxcui: string): Promise<DrugProperties | null> {
  try {
    const response = await fetch(
      `${RXNAV_BASE_URL}/rxcui/${rxcui}/properties.json`
    );
    
    if (!response.ok) {
      throw new Error(`RxNav API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.properties || null;
  } catch (error) {
    console.error('RxNav details error:', error);
    return null;
  }
}

/**
 * Get active ingredients for a drug (for interaction checking)
 */
export async function getIngredients(rxcui: string): Promise<string[]> {
  try {
    const response = await fetch(
      `${RXNAV_BASE_URL}/rxcui/${rxcui}/related.json?tty=IN`
    );
    
    if (!response.ok) {
      throw new Error(`RxNav API error: ${response.status}`);
    }
    
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
 * Check drug interactions between ingredient RxCUIs
 * Note: Requires ingredient RxCUIs, not drug product RxCUIs
 */
export async function checkInteractions(ingredientRxcuis: string[]) {
  if (ingredientRxcuis.length < 2) return [];
  
  try {
    const rxcuiList = ingredientRxcuis.join('+');
    const response = await fetch(
      `${RXNAV_BASE_URL}/interaction/list.json?rxcuis=${rxcuiList}`
    );
    
    if (!response.ok) {
      throw new Error(`RxNav API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.fullInteractionTypeGroup || [];
  } catch (error) {
    console.error('RxNav interaction check error:', error);
    return [];
  }
}

/**
 * Get spelling suggestions for misspelled drug names
 */
export async function getSpellingSuggestions(query: string): Promise<string[]> {
  try {
    const response = await fetch(
      `${RXNAV_BASE_URL}/spellingsuggestions.json?name=${encodeURIComponent(query)}`
    );
    
    if (!response.ok) {
      throw new Error(`RxNav API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.suggestionGroup?.suggestionList?.suggestion || [];
  } catch (error) {
    console.error('RxNav spelling suggestions error:', error);
    return [];
  }
}

/**
 * Parse dosage from medication name
 * Example: "lisinopril 10 MG Oral Tablet" → "10 MG"
 */
export function parseDosage(medicationName: string): string {
  const match = medicationName.match(/(\d+(?:\.\d+)?\s*(?:MG|ML|MCG|G|%|UNIT))/i);
  return match ? match[1] : '';
}

/**
 * Parse form from medication name
 * Example: "lisinopril 10 MG Oral Tablet" → "Oral Tablet"
 */
export function parseForm(medicationName: string): string {
  const match = medicationName.match(/(?:MG|ML|MCG|G|%|UNIT)\s+(.+?)$/i);
  return match ? match[1] : '';
}
