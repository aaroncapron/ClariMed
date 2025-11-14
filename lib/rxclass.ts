/**
 * RxClass API integration for drug classification.
 * Uses NIH RxClass API to get FDA Established Pharmacologic Classes (EPC),
 * Mechanism of Action (MoA), and Physiologic Effects (PE).
 * 
 * @see https://lhncbc.nlm.nih.gov/RxNav/APIs/RxClassAPIs.html
 */

const RXCLASS_BASE_URL = 'https://rxnav.nlm.nih.gov/REST/rxclass';

export interface DrugClassInfo {
  epc?: string;           // FDA Established Pharmacologic Class
  moa?: string;           // Mechanism of Action
  pe?: string;            // Physiologic Effect
  therapeuticUse?: string; // May_treat relationships
}

interface RxClassResponse {
  rxclassMinConceptList?: {
    rxclassMinConcept: Array<{
      classId: string;
      className: string;
      classType: string;
    }>;
  };
}

/**
 * Get drug classes for a given RxCUI from RxClass API.
 * Returns EPC, MoA, PE, and therapeutic uses.
 */
export async function getClassByRxcui(rxcui: string): Promise<DrugClassInfo | null> {
  if (!rxcui) return null;

  try {
    // Get all classes for this drug from DailyMed source (most comprehensive)
    const response = await fetch(
      `${RXCLASS_BASE_URL}/class/byRxcui.json?rxcui=${rxcui}&relaSource=DAILYMED`
    );

    if (!response.ok) {
      console.warn(`RxClass API error for rxcui ${rxcui}: ${response.status}`);
      return null;
    }

    const data: RxClassResponse = await response.json();
    const concepts = data.rxclassMinConceptList?.rxclassMinConcept || [];

    if (concepts.length === 0) {
      return null;
    }

    const classInfo: DrugClassInfo = {};

    // Extract EPC (Established Pharmacologic Class) - most useful for users
    const epcClass = concepts.find(c => c.classType === 'EPC');
    if (epcClass) {
      classInfo.epc = epcClass.className;
    }

    // Extract MoA (Mechanism of Action)
    const moaClass = concepts.find(c => c.classType === 'MOA');
    if (moaClass) {
      classInfo.moa = moaClass.className;
    }

    // Extract PE (Physiologic Effect)
    const peClass = concepts.find(c => c.classType === 'PE');
    if (peClass) {
      classInfo.pe = peClass.className;
    }

    // If no EPC, try FDASPL source as backup
    if (!classInfo.epc) {
      const fdaSplResponse = await fetch(
        `${RXCLASS_BASE_URL}/class/byRxcui.json?rxcui=${rxcui}&relaSource=FDASPL`
      );
      
      if (fdaSplResponse.ok) {
        const fdaSplData: RxClassResponse = await fdaSplResponse.json();
        const fdaSplConcepts = fdaSplData.rxclassMinConceptList?.rxclassMinConcept || [];
        const fdaEpc = fdaSplConcepts.find(c => c.classType === 'EPC');
        if (fdaEpc) {
          classInfo.epc = fdaEpc.className;
        }
      }
    }

    return Object.keys(classInfo).length > 0 ? classInfo : null;
  } catch (error) {
    console.error('RxClass API error:', error);
    return null;
  }
}

/**
 * Get therapeutic uses (may_treat relationships) from MED-RT.
 * Returns diseases/conditions the drug may treat.
 */
export async function getTherapeuticUses(rxcui: string): Promise<string[]> {
  if (!rxcui) return [];

  try {
    const response = await fetch(
      `${RXCLASS_BASE_URL}/class/byRxcui.json?rxcui=${rxcui}&relaSource=MEDRT&rela=may_treat`
    );

    if (!response.ok) {
      return [];
    }

    const data: RxClassResponse = await response.json();
    const concepts = data.rxclassMinConceptList?.rxclassMinConcept || [];

    return concepts
      .filter(c => c.classType === 'DISEASE')
      .map(c => c.className)
      .slice(0, 3); // Limit to top 3 most common uses
  } catch (error) {
    console.error('RxClass therapeutic uses error:', error);
    return [];
  }
}

/**
 * Format drug class for user-friendly display.
 * Prioritizes EPC, falls back to MoA/PE if needed.
 */
export function formatDrugClass(classInfo: DrugClassInfo): string {
  if (classInfo.epc) {
    return classInfo.epc;
  }
  
  if (classInfo.moa && classInfo.pe) {
    return `${classInfo.moa} - ${classInfo.pe}`;
  }
  
  if (classInfo.moa) {
    return classInfo.moa;
  }
  
  if (classInfo.pe) {
    return classInfo.pe;
  }
  
  return '';
}
