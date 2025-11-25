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
 * Get ingredient RXCUI from a drug product RXCUI.
 * RxClass data is only available for ingredients, not formulations.
 */
async function getIngredientRxcui(rxcui: string): Promise<string | null> {
  try {
    const response = await fetch(
      `https://rxnav.nlm.nih.gov/REST/rxcui/${rxcui}/related.json?tty=IN`
    );
    
    if (!response.ok) return null;
    
    const data = await response.json();
    const conceptGroups = data.relatedGroup?.conceptGroup || [];
    
    for (const group of conceptGroups) {
      if (group.tty === 'IN' && group.conceptProperties && group.conceptProperties.length > 0) {
        return group.conceptProperties[0].rxcui;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error getting ingredient RXCUI:', error);
    return null;
  }
}

/**
 * Get drug classes for a given RxCUI from RxClass API.
 * Returns EPC, MoA, PE, and therapeutic uses.
 * IMPORTANT: RxClass data is only available for ingredient RXCUIs, not product RXCUIs.
 */
export async function getClassByRxcui(rxcui: string): Promise<DrugClassInfo | null> {
  if (!rxcui) return null;

  try {
    // CRITICAL FIX: RxClass only has data for INGREDIENT RXCUIs, not product RXCUIs
    // First, try to get the ingredient RXCUI
    let targetRxcui = rxcui;
    const ingredientRxcui = await getIngredientRxcui(rxcui);
    if (ingredientRxcui) {
      targetRxcui = ingredientRxcui;
      console.log(`[RxClass] Using ingredient RXCUI ${targetRxcui} instead of product RXCUI ${rxcui}`);
    }

    // Get all classes for this drug from DailyMed source (most comprehensive)
    const response = await fetch(
      `${RXCLASS_BASE_URL}/class/byRxcui.json?rxcui=${targetRxcui}&relaSource=DAILYMED`
    );

    if (!response.ok) {
      console.warn(`RxClass API error for rxcui ${targetRxcui}: ${response.status}`);
      return null;
    }

    const data = await response.json();
    
    // FIXED: The API returns rxclassDrugInfoList, not rxclassMinConceptList
    const drugInfoList = data.rxclassDrugInfoList?.rxclassDrugInfo || [];

    if (drugInfoList.length === 0) {
      // If DAILYMED has no data, try MEDRT source (often has more comprehensive data)
      const medrtResponse = await fetch(
        `${RXCLASS_BASE_URL}/class/byRxcui.json?rxcui=${targetRxcui}&relaSource=MEDRT`
      );
      
      if (medrtResponse.ok) {
        const medrtData = await medrtResponse.json();
        const medrtList = medrtData.rxclassDrugInfoList?.rxclassDrugInfo || [];
        return extractClassInfo(medrtList);
      }
      
      return null;
    }

    const classInfo = extractClassInfo(drugInfoList);
    
    // If no EPC, try FDASPL source as backup
    if (!classInfo?.epc) {
      const fdaSplResponse = await fetch(
        `${RXCLASS_BASE_URL}/class/byRxcui.json?rxcui=${targetRxcui}&relaSource=FDASPL`
      );
      
      if (fdaSplResponse.ok) {
        const fdaSplData = await fdaSplResponse.json();
        const fdaSplList = fdaSplData.rxclassDrugInfoList?.rxclassDrugInfo || [];
        const fdaClassInfo = extractClassInfo(fdaSplList);
        if (fdaClassInfo?.epc && classInfo) {
          classInfo.epc = fdaClassInfo.epc;
        }
      }
    }

    return classInfo;
  } catch (error) {
    console.error('RxClass API error:', error);
    return null;
  }
}

/**
 * Helper function to extract class info from drug info list
 */
function extractClassInfo(drugInfoList: any[]): DrugClassInfo | null {
  if (!drugInfoList || drugInfoList.length === 0) return null;
  
  const classInfo: DrugClassInfo = {};

  // Extract EPC (Established Pharmacologic Class) - most useful for users
  const epcItem = drugInfoList.find((item: any) => 
    item.rxclassMinConceptItem?.classType === 'EPC'
  );
  if (epcItem) {
    classInfo.epc = epcItem.rxclassMinConceptItem.className;
  }

  // Extract MoA (Mechanism of Action)
  const moaItem = drugInfoList.find((item: any) => 
    item.rxclassMinConceptItem?.classType === 'MOA'
  );
  if (moaItem) {
    classInfo.moa = moaItem.rxclassMinConceptItem.className;
  }

  // Extract PE (Physiologic Effect)
  const peItem = drugInfoList.find((item: any) => 
    item.rxclassMinConceptItem?.classType === 'PE'
  );
  if (peItem) {
    classInfo.pe = peItem.rxclassMinConceptItem.className;
  }

  return Object.keys(classInfo).length > 0 ? classInfo : null;
}

/**
 * Blacklist of terms that indicate side effects, adverse reactions, contraindications,
 * or risk factors - not therapeutic indications. These should be filtered out from display.
 * EXPANDED: Now includes alarming/confusing clinical terms for patient-facing safety.
 */
const SIDE_EFFECT_TERMS = [
  // Hypersensitivity and allergic reactions
  'angioedema',
  'anaphylaxis',
  'hypersensitivity',
  'drug hypersensitivity',
  'drug eruptions',
  'serum sickness',
  'stevens-johnson',
  'toxic epidermal necrolysis',
  
  // Organ toxicity and damage
  'cholestasis',
  'hepatotoxicity',
  'nephrotoxicity',
  'cardiotoxicity',
  'neurotoxicity',
  'ototoxicity',
  'liver diseases',
  'liver disease',
  'hepatic',
  'kidney disease',
  'renal disease',
  
  // Blood disorders
  'agranulocytosis',
  'thrombocytopenia',
  'neutropenia',
  'anemia',
  'leukopenia',
  'hemorrhage',
  'bleeding',
  
  // Metabolic/endocrine adverse effects
  'acidosis',
  'lactic acidosis',
  'hyperglycemia',
  'hypoglycemia',
  'electrolyte imbalance',
  
  // Cancer and neoplasms (these are risks, not indications)
  'neoplasms',
  'neoplasm',
  'carcinoma',
  'cancer',
  'malignancy',
  'tumor',
  
  // Enzyme deficiencies (contraindications, not indications)
  'deficiency',
  'glucosephosphate dehydrogenase deficiency',
  'g6pd deficiency',
  
  // Other adverse effects
  'rhabdomyolysis',
  'seizures',
  'convulsions',
  'respiratory depression',
  'bone marrow suppression',
  'pancreatitis',
  'myopathy',
  
  // PATIENT-FACING FILTERS (NEW):
  // Alarming/confusing clinical terms
  'threatened',              // "abortion, threatened" for warfarin
  'insufficiency',           // Often contraindications listed as treatments
  'renal failure',           // Be specific - filter organ failures but allow "heart failure"
  'kidney failure',
  'liver failure',
  'respiratory failure',
  'radioactive',             // Diagnostic procedures, not treatments
  'diagnostic',              // Diagnostic procedures
  'diagnostic agent',
  
  // Contradictory/misleading terms
  'alcoholism',              // Not appropriate for patient-facing display
  'drug abuse',
  'substance abuse',
  
  // Too technical/rare conditions that confuse patients
  'aneurysm',                // Warfarin example - rare use
  'coagulopathy',
  'disseminated intravascular coagulation',
  
  // Pregnancy-related clinical terms that are alarming
  'abortion',                // Medical term for miscarriage - alarming to patients
  'fetal death',
  'stillbirth'
];

/**
 * Medical terms to translate to patient-friendly language.
 * Maps clinical ICD-10 terminology to plain English.
 */
const MEDICAL_TERM_TRANSLATIONS: Record<string, string> = {
  // Cardiovascular
  'hypertension': 'high blood pressure',
  'hypertensive disease': 'high blood pressure',
  'hypotension': 'low blood pressure',
  'heart failure': 'heart failure',  // Normalize capitalization
  'atrial fibrillation': 'irregular heartbeat (AFib)',
  'coronary artery disease': 'heart disease',
  'myocardial infarction': 'heart attack',
  'angina pectoris': 'chest pain',
  
  // Endocrine/Metabolic
  'diabetes mellitus, type 2': 'type 2 diabetes',
  'diabetes mellitus, type 1': 'type 1 diabetes',
  'diabetes mellitus': 'diabetes',
  'hypothyroidism': 'underactive thyroid',
  'hyperthyroidism': 'overactive thyroid',
  'hypercholesterolemia': 'high cholesterol',
  'hyperlipoproteinemias': 'high cholesterol',
  'dyslipidemia': 'abnormal cholesterol levels',
  'obesity': 'overweight',
  
  // Respiratory
  'asthma': 'asthma',
  'chronic obstructive pulmonary disease': 'COPD',
  'bronchospasm': 'breathing difficulty',
  'dyspnea': 'shortness of breath',
  
  // Gastrointestinal
  'gastroesophageal reflux': 'acid reflux (GERD)',
  'peptic ulcer': 'stomach ulcer',
  'constipation': 'constipation',
  'diarrhea': 'diarrhea',
  
  // Mental Health
  'depressive disorder': 'depression',
  'anxiety disorders': 'anxiety',
  'bipolar disorder': 'bipolar disorder',
  
  // Musculoskeletal
  'arthritis, rheumatoid': 'rheumatoid arthritis',
  'osteoarthritis': 'arthritis',
  'osteoporosis': 'weak bones',
  
  // Neurological
  'epilepsy': 'seizures',
  'migraine': 'migraines',
  'neuropathy': 'nerve pain',
  
  // Renal
  'diabetic nephropathies': 'diabetic kidney disease',
  'chronic kidney disease': 'kidney disease',
  
  // Hematological
  'thromboembolism': 'blood clots',
  'deep vein thrombosis': 'blood clot in leg (DVT)',
  'pulmonary embolism': 'blood clot in lung'
};

/**
 * Translate medical terminology to patient-friendly language.
 * Returns translated term if found, otherwise original term.
 */
function translateMedicalTerm(term: string): string {
  const lowerTerm = term.toLowerCase().trim();
  
  // Check for exact match
  if (MEDICAL_TERM_TRANSLATIONS[lowerTerm]) {
    return MEDICAL_TERM_TRANSLATIONS[lowerTerm];
  }
  
  // Check for partial match
  for (const [medical, friendly] of Object.entries(MEDICAL_TERM_TRANSLATIONS)) {
    if (lowerTerm.includes(medical)) {
      return friendly;
    }
  }
  
  // Return original if no translation found
  return term;
}

/**
 * Filter out side effects and adverse reactions from therapeutic uses.
 * Returns true if the use is valid (not a side effect).
 * ENHANCED: Now also filters alarming and inappropriate patient-facing terms.
 */
function isValidTherapeuticUse(use: string): boolean {
  const lowerUse = use.toLowerCase();
  return !SIDE_EFFECT_TERMS.some(term => lowerUse.includes(term));
}

/**
 * Get therapeutic uses (may_treat relationships) from MED-RT.
 * Returns diseases/conditions the drug may treat.
 * IMPORTANT: Uses ingredient RXCUI for better data availability.
 * Filters out side effects and adverse reactions.
 */
export async function getTherapeuticUses(rxcui: string): Promise<string[]> {
  if (!rxcui) return [];

  try {
    // CRITICAL FIX: Get ingredient RXCUI first for better data availability
    let targetRxcui = rxcui;
    const ingredientRxcui = await getIngredientRxcui(rxcui);
    if (ingredientRxcui) {
      targetRxcui = ingredientRxcui;
    }

    const response = await fetch(
      `${RXCLASS_BASE_URL}/class/byRxcui.json?rxcui=${targetRxcui}&relaSource=MEDRT&rela=may_treat`
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    
    // FIXED: The API returns rxclassDrugInfoList, not rxclassMinConceptList
    const drugInfoList = data.rxclassDrugInfoList?.rxclassDrugInfo || [];

    const uses = drugInfoList
      .filter((item: any) => item.rxclassMinConceptItem?.classType === 'DISEASE')
      .map((item: any) => item.rxclassMinConceptItem.className as string)
      .filter(isValidTherapeuticUse) // Filter out side effects and inappropriate terms
      .map(translateMedicalTerm); // Translate to patient-friendly language

    // Deduplicate (case-insensitive)
    const useMap = new Map<string, string>();
    uses.forEach((use: string) => {
      useMap.set(use.toLowerCase(), use);
    });
    const uniqueUses = Array.from(useMap.values());

    return uniqueUses.slice(0, 3); // Limit to top 3 most common uses
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
