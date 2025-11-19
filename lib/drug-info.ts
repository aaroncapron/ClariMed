/**
 * Drug Information Cascade System
 * Orchestrates 3-tier fallback: RxClass API → DailyMed API → Pattern matching
 * Returns empty string if all sources fail (no unhelpful defaults)
 */

import { getClassByRxcui, getTherapeuticUses, formatDrugClass } from './rxclass';
import { getCommonUseFromDailyMed, getDrugClassFromDailyMed } from './dailymed';
import { getMedicationClassFallback, getCommonUseFallback } from './drug-info-utils';

/**
 * Get drug classification with 3-tier fallback
 * 1. Try RxClass API (WHO ATC classification - most authoritative)
 * 2. Try DailyMed API (FDA drug labels - official)
 * 3. Try pattern matching (hardcoded fallback - last resort)
 * Returns empty string if all fail
 */
export async function getDrugClass(rxcui?: string, drugName?: string): Promise<string> {
  // Tier 1: RxClass API (primary source - WHO ATC classification)
  if (rxcui) {
    try {
      const rxclassData = await getClassByRxcui(rxcui);
      if (rxclassData) {
        const formatted = formatDrugClass(rxclassData);
        if (formatted) {
          console.log(`[Drug Info] RxClass provided class for ${drugName || rxcui}: ${formatted}`);
          return formatted;
        }
      }
    } catch (error) {
      console.warn('[Drug Info] RxClass lookup failed, trying DailyMed:', error);
    }
  }
  
  // Tier 2: DailyMed API (secondary source - FDA labels)
  try {
    const dailymedClass = await getDrugClassFromDailyMed(rxcui, drugName);
    if (dailymedClass) {
      console.log(`[Drug Info] DailyMed provided class for ${drugName || rxcui}: ${dailymedClass}`);
      return dailymedClass;
    }
  } catch (error) {
    console.warn('[Drug Info] DailyMed lookup failed, trying pattern matching:', error);
  }
  
  // Tier 3: Pattern matching (tertiary fallback)
  if (drugName) {
    const patternClass = getMedicationClassFallback(drugName);
    if (patternClass) {
      console.log(`[Drug Info] Pattern matching provided class for ${drugName}: ${patternClass}`);
      return patternClass;
    }
  }
  
  // All sources failed - return empty string (no unhelpful default)
  console.log(`[Drug Info] No drug class found for ${drugName || rxcui}`);
  return '';
}

/**
 * Get common use/indications with 3-tier fallback
 * 1. Try RxClass API (may_treat relationships from MEDRT)
 * 2. Try DailyMed API (indication and usage from FDA labels)
 * 3. Try pattern matching (hardcoded fallback - last resort)
 * Returns empty string if all fail
 */
export async function getCommonUse(rxcui?: string, drugName?: string): Promise<string> {
  // Tier 1: RxClass API (therapeutic uses via may_treat)
  if (rxcui) {
    try {
      const therapeuticUses = await getTherapeuticUses(rxcui);
      if (therapeuticUses && therapeuticUses.length > 0) {
        const formatted = `Treat ${therapeuticUses.join(', ').toLowerCase()}`;
        console.log(`[Drug Info] RxClass provided uses for ${drugName || rxcui}: ${formatted}`);
        return formatted;
      }
    } catch (error) {
      console.warn('[Drug Info] RxClass therapeutic uses lookup failed, trying DailyMed:', error);
    }
  }
  
  // Tier 2: DailyMed API (indications from FDA labels)
  try {
    const dailymedUse = await getCommonUseFromDailyMed(rxcui, drugName);
    if (dailymedUse) {
      console.log(`[Drug Info] DailyMed provided indications for ${drugName || rxcui}: ${dailymedUse}`);
      return dailymedUse;
    }
  } catch (error) {
    console.warn('[Drug Info] DailyMed indications lookup failed, trying pattern matching:', error);
  }
  
  // Tier 3: Pattern matching (tertiary fallback)
  if (drugName) {
    const patternUse = getCommonUseFallback(drugName);
    if (patternUse) {
      console.log(`[Drug Info] Pattern matching provided use for ${drugName}: ${patternUse}`);
      return patternUse;
    }
  }
  
  // All sources failed - return empty string
  console.log(`[Drug Info] No common use found for ${drugName || rxcui}`);
  return '';
}

/**
 * Get both drug class and common use in parallel
 * More efficient than calling separately
 */
export async function getDrugInfo(rxcui?: string, drugName?: string): Promise<{
  drugClass: string;
  commonUse: string;
}> {
  const [drugClass, commonUse] = await Promise.all([
    getDrugClass(rxcui, drugName),
    getCommonUse(rxcui, drugName)
  ]);
  
  return { drugClass, commonUse };
}
