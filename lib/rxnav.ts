/**
 * RxNav API integration for medication lookup and validation.
 * Uses NIH RxNav REST API (public domain, no API key required).
 * 
 * @see https://lhncbc.nlm.nih.gov/RxNav/APIs/
 */

const RXNAV_BASE_URL = 'https://rxnav.nlm.nih.gov/REST';

export interface DrugSearchResult {
  rxcui: string;
  name: string;
  synonym?: string;
  tty: 'SCD' | 'SBD' | 'BPCK' | 'GPCK' | 'IN';
  language: string;
  suppress: string;
  displayName?: string;
  form?: string;
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
 * Formats brand drug names to display brand first with generic in parentheses.
 * @param name - Original drug name
 * @param synonym - Optional synonym
 * @returns Formatted name or original if no brand brackets found
 * @example "lisinopril 10 MG [Prinivil]" → "Prinivil (lisinopril) 10 MG"
 */
function formatBrandName(name: string, synonym?: string): string {
  const bracketMatch = name.match(/^(.+?)\s*\[([^\]]+)\]$/);
  
  if (bracketMatch) {
    const [, genericPart, brandName] = bracketMatch;
    const ingredientMatch = genericPart.match(/^([a-zA-Z\s]+)\s+(.+)$/);
    
    if (ingredientMatch) {
      const [, ingredient, rest] = ingredientMatch;
      return `${brandName} (${ingredient.trim()}) ${rest}`;
    }
  }
  
  return name;
}

/**
 * Extracts dosage form priority for sorting (Tablet=1, Capsule=2, Liquid=3, Other=4).
 * @param name - Medication name
 * @returns Priority number for sorting
 */
function getDosageFormPriority(name: string): number {
  const nameLower = name.toLowerCase();
  
  if (/\btablet\b/i.test(nameLower)) return 1;
  if (/\bcapsule\b/i.test(nameLower)) return 2;
  if (/\b(liquid|solution|suspension|syrup|oral solution)\b/i.test(nameLower)) return 3;
  
  return 4; // Everything else
}

/**
 * Extracts dosage form name from medication string.
 */
function extractDosageForm(name: string): string {
  const formMatch = name.match(/\b(Tablet|Capsule|Liquid|Solution|Suspension|Syrup|Oral Solution|Injection|Cream|Ointment|Gel|Patch)\b/i);
  return formMatch ? formMatch[1] : 'Other';
}

/**
 * Searches for drugs by name using RxNav API.
 * Returns both generic (SCD) and brand (SBD) results with intelligent fallback.
 * @param query - Search term (minimum 2 characters)
 * @returns Array of matching drug results, sorted by relevance
 */
export async function searchDrugs(query: string): Promise<DrugSearchResult[]> {
  if (!query || query.length < 2) return [];
  
  try {
    let response = await fetch(
      `${RXNAV_BASE_URL}/drugs.json?name=${encodeURIComponent(query)}`
    );
    
    if (!response.ok) {
      throw new Error(`RxNav API error: ${response.status}`);
    }
    
    let data = await response.json();
    let hasResults = data.drugGroup?.conceptGroup && data.drugGroup.conceptGroup.length > 0;
    
    if (!hasResults) {
      response = await fetch(
        `${RXNAV_BASE_URL}/approximateTerm.json?term=${encodeURIComponent(query)}&maxEntries=10`
      );
      
      if (!response.ok) {
        throw new Error(`RxNav API error: ${response.status}`);
      }
      
      const approxData = await response.json();
      const candidates = approxData.approximateGroup?.candidate || [];
      
      const rxcuiSet = new Set<string>();
      candidates.forEach((c: any) => {
        if (c.rxcui) rxcuiSet.add(c.rxcui);
      });
      const uniqueRxcuis = Array.from(rxcuiSet).slice(0, 5);
      
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
      
      return sortDrugResults(allResults);
    }
    
    const results: DrugSearchResult[] = [];
    const conceptGroups = data.drugGroup?.conceptGroup || [];
    
    for (const group of conceptGroups) {
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
 * Extracts and normalizes numeric dosage strength for sorting.
 * Converts MCG to MG and G to MG for consistent comparison.
 * @param name - Medication name containing dosage
 * @returns Normalized dosage value in MG
 */
function extractDosageStrength(name: string): number {
  const match = name.match(/(\d+(?:\.\d+)?)\s*(MG|MCG|G|ML|%|UNIT)/i);
  
  if (!match) return 0;
  
  const [, value, unit] = match;
  let numericValue = parseFloat(value);
  
  const unitUpper = unit.toUpperCase();
  if (unitUpper === 'MCG') {
    numericValue = numericValue / 1000;
  } else if (unitUpper === 'G') {
    numericValue = numericValue * 1000;
  }
  
  return numericValue;
}

/**
 * Sorts and deduplicates drug results by form, generic/brand preference, dosage, and name.
 * @param results - Array of drug search results
 * @returns Sorted and deduplicated array
 */
function sortDrugResults(results: DrugSearchResult[]): DrugSearchResult[] {
  const seen = new Set<string>();
  const uniqueResults = results.filter((drug) => {
    const normalizedName = (drug.displayName || drug.name).toLowerCase().trim();
    
    if (seen.has(normalizedName)) {
      return false;
    }
    
    seen.add(normalizedName);
    return true;
  });
  
  return uniqueResults.sort((a, b) => {
    const formA = getDosageFormPriority(a.name);
    const formB = getDosageFormPriority(b.name);
    if (formA !== formB) return formA - formB;
    
    if (a.tty === 'SCD' && b.tty === 'SBD') return -1;
    if (a.tty === 'SBD' && b.tty === 'SCD') return 1;
    
    const strengthA = extractDosageStrength(a.name);
    const strengthB = extractDosageStrength(b.name);
    if (strengthA !== strengthB) return strengthA - strengthB;
    
    return (a.displayName || a.name).localeCompare(b.displayName || b.name);
  });
}

/**
 * Retrieves related concepts (like ingredients, therapeutic classes) for a given RxCUI.
 * @param rxcui - The RxNorm Concept Unique Identifier.
 * @param tty - A list of term types to filter by (e.g., 'IN' for ingredient, 'TC' for therapeutic class).
 * @returns A promise that resolves to an array of related concepts.
 */
export async function getRelatedConcepts(
  rxcui: string,
  tty: string[]
): Promise<DrugProperties[]> {
  if (!rxcui || tty.length === 0) return [];

  try {
    const ttyString = tty.join('+');
    const response = await fetch(
      `${RXNAV_BASE_URL}/rxcui/${rxcui}/related.json?tty=${ttyString}`
    );

    if (!response.ok) {
      throw new Error(`RxNav related concepts API error: ${response.status}`);
    }

    const data = await response.json();
    const concepts: DrugProperties[] = [];
    const groups = data.relatedGroup?.conceptGroup || [];

    for (const group of groups) {
      if (tty.includes(group.tty) && group.conceptProperties) {
        concepts.push(...group.conceptProperties);
      }
    }

    return concepts;
  } catch (error) {
    console.error('RxNav related concepts error:', error);
    return [];
  }
}

/**
 * Retrieves detailed drug properties by RxCUI.
 * @param rxcui - RxNorm concept unique identifier
 * @returns Drug properties or null if not found
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
 * Retrieves active ingredient RxCUIs for a drug product.
 * @param rxcui - Drug product RxCUI
 * @returns Array of ingredient RxCUIs
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
 * Checks for drug interactions between ingredients.
 * @param ingredientRxcuis - Array of ingredient RxCUIs (not drug product RxCUIs)
 * @returns Array of interaction groups
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
 * Retrieves spelling suggestions for potentially misspelled drug names.
 * @param query - Potentially misspelled drug name
 * @returns Array of suggested spellings
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
 * Parses dosage from medication name.
 * @param medicationName - Full medication name
 * @returns Dosage string or empty string if not found
 * @example parseDosage("lisinopril 10 MG Oral Tablet") // "10 MG"
 */
export function parseDosage(medicationName: string): string {
  const match = medicationName.match(/(\d+(?:\.\d+)?\s*(?:MG|ML|MCG|G|%|UNIT))/i);
  return match ? match[1] : '';
}

/**
 * Parses dosage form from medication name.
 * @param medicationName - Full medication name
 * @returns Dosage form or empty string if not found
 * @example parseForm("lisinopril 10 MG Oral Tablet") // "Oral Tablet"
 */
export function parseForm(medicationName: string): string {
  const match = medicationName.match(/(?:MG|ML|MCG|G|%|UNIT)\s+(.+?)$/i);
  return match ? match[1] : '';
}
