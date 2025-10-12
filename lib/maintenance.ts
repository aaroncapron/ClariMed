/**
 * Maintenance Medication Detection
 * 
 * Uses ATC (Anatomical Therapeutic Chemical) codes and drug classes
 * to auto-suggest whether a medication is a maintenance medication.
 * 
 * Maintenance meds = drugs patient must take regularly to manage chronic conditions
 * (e.g., statins, BP meds, insulin, anticoagulants)
 */

/**
 * ATC code prefixes that typically indicate maintenance medications
 * Based on WHO ATC classification system
 */
const MAINTENANCE_ATC_PREFIXES = [
  // Cardiovascular System
  'C01', // Cardiac therapy
  'C02', // Antihypertensives
  'C03', // Diuretics
  'C07', // Beta blocking agents
  'C08', // Calcium channel blockers
  'C09', // Agents acting on renin-angiotensin system
  'C10', // Lipid modifying agents (statins)
  
  // Blood and blood forming organs
  'B01A', // Antithrombotic agents (warfarin, etc.)
  
  // Endocrine System
  'A10', // Drugs used in diabetes (insulin, metformin)
  'H03', // Thyroid therapy (levothyroxine)
  
  // Nervous System
  'N03', // Antiepileptics
  'N05A', // Antipsychotics (chronic use)
  'N06A', // Antidepressants (chronic use)
  
  // Respiratory System
  'R03', // Drugs for obstructive airway diseases (chronic asthma/COPD)
  
  // Immunosuppressants
  'L04', // Immunosuppressants
  'L01', // Antineoplastic agents (cancer - ongoing treatment)
  
  // Musculoskeletal System
  'M05B', // Drugs affecting bone structure (osteoporosis)
];

/**
 * Common drug name patterns that indicate maintenance medications
 * Used as fallback when ATC codes aren't available
 */
const MAINTENANCE_DRUG_PATTERNS = [
  // Statins (cholesterol)
  /statin$/i,
  /atorvastatin|simvastatin|rosuvastatin|pravastatin|lovastatin|fluvastatin/i,
  
  // ACE Inhibitors (blood pressure)
  /pril$/i, // lisinopril, enalapril, ramipril, etc.
  /lisinopril|enalapril|ramipril|benazepril|captopril|fosinopril|perindopril|quinapril|trandolapril/i,
  
  // ARBs (blood pressure)
  /sartan$/i, // losartan, valsartan, telmisartan, etc.
  /losartan|valsartan|telmisartan|irbesartan|olmesartan|candesartan|azilsartan/i,
  
  // Beta Blockers (blood pressure, heart)
  /olol$/i, // metoprolol, atenolol, carvedilol, etc.
  /metoprolol|atenolol|carvedilol|bisoprolol|propranolol|nadolol|labetalol|nebivolol/i,
  
  // Calcium Channel Blockers
  /dipine$/i, // amlodipine, nifedipine, etc.
  /amlodipine|nifedipine|felodipine|diltiazem|verapamil|nicardipine/i,
  
  // Diuretics
  /thiazide|furosemide|torsemide|spironolactone|hydrochlorothiazide|chlorthalidone|bumetanide|triamterene|amiloride/i,
  
  // Diabetes
  /insulin|metformin|glipizide|glyburide|sitagliptin|empagliflozin|dulaglutide|semaglutide|liraglutide|pioglitazone|glimepiride/i,
  
  // Thyroid
  /levothyroxine|synthroid|liothyronine|armour thyroid/i,
  
  // Anticoagulants
  /warfarin|apixaban|rivaroxaban|dabigatran|edoxaban/i,
  /coumadin|eliquis|xarelto|pradaxa|savaysa/i,
  
  // Antiplatelets
  /clopidogrel|prasugrel|ticagrelor|plavix|aspirin/i,
  
  // Immunosuppressants
  /tacrolimus|cyclosporine|azathioprine|mycophenolate/i,
  /prograf|neoral|imuran|cellcept/i,
  
  // Antiepileptics
  /levetiracetam|phenytoin|carbamazepine|valproate|lamotrigine/i,
  /keppra|dilantin|tegretol|depakote|lamictal/i,
];

/**
 * Check if a medication is likely a maintenance medication
 * based on its therapeutic class (ATC code) or drug name
 * 
 * @param drugName - Name of the medication
 * @param atcCode - Optional ATC code from NIPH/RxNav
 * @returns true if likely maintenance med, false otherwise
 */
export function isLikelyMaintenanceMed(
  drugName: string,
  atcCode?: string
): boolean {
  // Check ATC code first (most reliable)
  if (atcCode) {
    const isMaintenanceByATC = MAINTENANCE_ATC_PREFIXES.some(prefix => 
      atcCode.toUpperCase().startsWith(prefix)
    );
    if (isMaintenanceByATC) return true;
  }
  
  // Fallback to drug name pattern matching
  const isMaintenanceByName = MAINTENANCE_DRUG_PATTERNS.some(pattern => 
    pattern.test(drugName)
  );
  
  return isMaintenanceByName;
}

/**
 * Get a user-friendly explanation of why a drug is suggested as maintenance
 * 
 * @param drugName - Name of the medication
 * @param atcCode - Optional ATC code
 * @returns Explanation string
 */
export function getMaintenanceReason(
  drugName: string,
  atcCode?: string
): string | null {
  if (!isLikelyMaintenanceMed(drugName, atcCode)) {
    return null;
  }
  
  const lowerName = drugName.toLowerCase();
  
  // Check common drug name patterns for specific explanations
  if (/statin/i.test(lowerName) || /atorvastatin|simvastatin|rosuvastatin|pravastatin|lovastatin|fluvastatin/i.test(lowerName)) {
    return 'Cholesterol medication (typically taken long-term)';
  }
  if (/pril$/i.test(lowerName) || /lisinopril|enalapril|ramipril|benazepril|captopril/i.test(lowerName)) {
    return 'Blood pressure medication - ACE inhibitor (typically taken long-term)';
  }
  if (/sartan$/i.test(lowerName) || /losartan|valsartan|telmisartan|irbesartan/i.test(lowerName)) {
    return 'Blood pressure medication - ARB (typically taken long-term)';
  }
  if (/olol$/i.test(lowerName) || /metoprolol|atenolol|carvedilol|bisoprolol/i.test(lowerName)) {
    return 'Blood pressure medication - Beta blocker (typically taken long-term)';
  }
  if (/dipine$/i.test(lowerName) || /amlodipine|nifedipine|felodipine/i.test(lowerName)) {
    return 'Blood pressure medication - Calcium channel blocker (typically taken long-term)';
  }
  if (/insulin|metformin|glipizide|glyburide/i.test(lowerName)) {
    return 'Diabetes medication (typically taken long-term)';
  }
  if (/levothyroxine|synthroid|levoxyl|liothyronine/i.test(lowerName)) {
    return 'Thyroid medication (typically taken long-term)';
  }
  if (/warfarin|apixaban|rivaroxaban|dabigatran|edoxaban|coumadin|eliquis|xarelto/i.test(lowerName)) {
    return 'Blood thinner - Anticoagulant (typically taken long-term)';
  }
  
  // Map ATC codes to explanations
  if (atcCode) {
    const code = atcCode.toUpperCase();
    if (code.startsWith('C10')) return 'Cholesterol medication (typically taken long-term)';
    if (code.startsWith('C07') || code.startsWith('C08') || code.startsWith('C09')) {
      return 'Blood pressure medication (typically taken long-term)';
    }
    if (code.startsWith('A10'))  return 'Diabetes medication (typically taken long-term)';
    if (code.startsWith('H03'))  return 'Thyroid medication (typically taken long-term)';
    if (code.startsWith('B01A')) return 'Blood thinner (typically taken long-term)';
    if (code.startsWith('N03'))  return 'Seizure medication (typically taken long-term)';
    if (code.startsWith('L04'))  return 'Immunosuppressant (typically taken long-term)';
  }
  
  // Generic fallback
  return 'This medication is typically taken regularly for chronic conditions';
}
