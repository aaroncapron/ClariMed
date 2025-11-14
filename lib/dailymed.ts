/**
 * DailyMed API Integration
 * Fetches drug labeling data from FDA's DailyMed service
 * Used as secondary source for drug classifications and indications
 */

const DAILYMED_BASE_URL = 'https://dailymed.nlm.nih.gov/dailymed';

export interface DailyMedInfo {
  indications?: string;
  drugClass?: string;
  warnings?: string[];
}

/**
 * Search DailyMed for drug information by drug name
 * Returns SPL (Structured Product Label) set ID for the drug
 */
async function searchDailyMed(drugName: string): Promise<string | null> {
  if (!drugName) return null;

  try {
    // Use DailyMed drug search API
    const response = await fetch(
      `${DAILYMED_BASE_URL}/services/v2/spls.json?drug_name=${encodeURIComponent(drugName)}`
    );

    if (!response.ok) {
      console.warn(`DailyMed search failed for "${drugName}": ${response.status}`);
      return null;
    }

    const data = await response.json();
    
    // Get the first result's SPL set ID
    if (data.data && data.data.length > 0) {
      return data.data[0].setid;
    }

    return null;
  } catch (error) {
    console.error('DailyMed search error:', error);
    return null;
  }
}

/**
 * Get drug information from DailyMed by RxNorm CUI
 * This is more reliable than name search
 */
async function getDailyMedByRxcui(rxcui: string): Promise<string | null> {
  if (!rxcui) return null;

  try {
    // Use RxNorm CUI to find SPL set ID
    const response = await fetch(
      `${DAILYMED_BASE_URL}/services/v2/spls.json?rxcui=${rxcui}`
    );

    if (!response.ok) {
      console.warn(`DailyMed lookup failed for rxcui ${rxcui}: ${response.status}`);
      return null;
    }

    const data = await response.json();
    
    if (data.data && data.data.length > 0) {
      return data.data[0].setid;
    }

    return null;
  } catch (error) {
    console.error('DailyMed RxCUI lookup error:', error);
    return null;
  }
}

/**
 * Extract indications and usage from DailyMed SPL data
 * Returns the clinical indications text
 */
async function getIndicationsFromSPL(setId: string): Promise<string | null> {
  if (!setId) return null;

  try {
    // Fetch the SPL document
    const response = await fetch(
      `${DAILYMED_BASE_URL}/services/v2/spls/${setId}.json`
    );

    if (!response.ok) {
      console.warn(`DailyMed SPL fetch failed for ${setId}: ${response.status}`);
      return null;
    }

    const data = await response.json();
    
    // Look for indications and usage section
    if (data.data && data.data.length > 0) {
      const spl = data.data[0];
      
      // Try to find indications_and_usage section
      if (spl.indications_and_usage && Array.isArray(spl.indications_and_usage)) {
        // Extract text content, removing HTML tags and cleaning up
        const indications = spl.indications_and_usage
          .map((item: any) => {
            if (typeof item === 'string') {
              return item;
            } else if (item.value) {
              return item.value;
            }
            return '';
          })
          .filter((text: string) => text.length > 0)
          .join(' ');

        if (indications) {
          // Clean up HTML tags and extra whitespace
          const cleaned = indications
            .replace(/<[^>]*>/g, ' ')  // Remove HTML tags
            .replace(/\s+/g, ' ')       // Normalize whitespace
            .trim();

          // Return first sentence or first 150 characters
          const firstSentence = cleaned.match(/^[^.!?]+[.!?]/);
          if (firstSentence) {
            return firstSentence[0].trim();
          }
          
          return cleaned.substring(0, 150) + (cleaned.length > 150 ? '...' : '');
        }
      }
    }

    return null;
  } catch (error) {
    console.error('DailyMed SPL parsing error:', error);
    return null;
  }
}

/**
 * Get common use/indications for a drug from DailyMed
 * Tries RxCUI first, falls back to name search
 */
export async function getCommonUseFromDailyMed(
  rxcui?: string,
  drugName?: string
): Promise<string | null> {
  // Try RxCUI first (most reliable)
  if (rxcui) {
    const setId = await getDailyMedByRxcui(rxcui);
    if (setId) {
      const indications = await getIndicationsFromSPL(setId);
      if (indications) {
        return indications;
      }
    }
  }

  // Fall back to name search
  if (drugName) {
    // Extract base drug name (remove strength and form)
    const baseName = drugName.split(/\d+/)[0].trim();
    const setId = await searchDailyMed(baseName);
    if (setId) {
      const indications = await getIndicationsFromSPL(setId);
      if (indications) {
        return indications;
      }
    }
  }

  return null;
}

/**
 * Get drug class information from DailyMed
 * Note: DailyMed doesn't have a dedicated drug class field in the same format as RxClass
 * This returns the pharmaceutical class if available
 */
export async function getDrugClassFromDailyMed(
  rxcui?: string,
  drugName?: string
): Promise<string | null> {
  // Try RxCUI first
  if (rxcui) {
    const setId = await getDailyMedByRxcui(rxcui);
    if (setId) {
      const drugClass = await extractDrugClassFromSPL(setId);
      if (drugClass) {
        return drugClass;
      }
    }
  }

  // Fall back to name search
  if (drugName) {
    const baseName = drugName.split(/\d+/)[0].trim();
    const setId = await searchDailyMed(baseName);
    if (setId) {
      const drugClass = await extractDrugClassFromSPL(setId);
      if (drugClass) {
        return drugClass;
      }
    }
  }

  return null;
}

/**
 * Extract drug class from SPL data
 */
async function extractDrugClassFromSPL(setId: string): Promise<string | null> {
  if (!setId) return null;

  try {
    const response = await fetch(
      `${DAILYMED_BASE_URL}/services/v2/spls/${setId}.json`
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    
    if (data.data && data.data.length > 0) {
      const spl = data.data[0];
      
      // Look for drug class information
      if (spl.pharm_class_epc) {
        return Array.isArray(spl.pharm_class_epc) 
          ? spl.pharm_class_epc[0] 
          : spl.pharm_class_epc;
      }
      
      if (spl.pharm_class_moa) {
        return Array.isArray(spl.pharm_class_moa)
          ? spl.pharm_class_moa[0]
          : spl.pharm_class_moa;
      }
    }

    return null;
  } catch (error) {
    console.error('DailyMed drug class extraction error:', error);
    return null;
  }
}
