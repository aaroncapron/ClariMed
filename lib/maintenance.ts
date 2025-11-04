/**
 * Maintenance medication detection using ATC codes and drug name patterns.
 * Identifies medications typically taken long-term for chronic conditions.
 */

/**
 * ATC code prefixes indicating maintenance medications (WHO classification).
 */
const MAINTENANCE_ATC_PREFIXES = [
  'C01',
  'C02',
  'C03',
  'C07',
  'C08',
  'C09',
  'C10',
  'B01A',
  'A10',
  'H03',
  'N03',
  'N05A',
  'N06A',
  'R03',
  'L04',
  'L01',
  'M05B',
];

/**
 * Drug name patterns indicating maintenance medications.
 * Used as fallback when ATC codes are unavailable.
 */
const MAINTENANCE_DRUG_PATTERNS = [
  /statin$/i,
  /atorvastatin|simvastatin|rosuvastatin|pravastatin|lovastatin|fluvastatin/i,
  /pril$/i,
  /lisinopril|enalapril|ramipril|benazepril|captopril|fosinopril|perindopril|quinapril|trandolapril/i,
  /sartan$/i,
  /losartan|valsartan|telmisartan|irbesartan|olmesartan|candesartan|azilsartan/i,
  /olol$/i,
  /metoprolol|atenolol|carvedilol|bisoprolol|propranolol|nadolol|labetalol|nebivolol/i,
  /dipine$/i,
  /amlodipine|nifedipine|felodipine|diltiazem|verapamil|nicardipine/i,
  /thiazide|furosemide|torsemide|spironolactone|hydrochlorothiazide|chlorthalidone|bumetanide|triamterene|amiloride/i,
  /insulin|metformin|glipizide|glyburide|sitagliptin|empagliflozin|dulaglutide|semaglutide|liraglutide|pioglitazone|glimepiride/i,
  /levothyroxine|synthroid|liothyronine|armour thyroid/i,
  /warfarin|apixaban|rivaroxaban|dabigatran|edoxaban/i,
  /coumadin|eliquis|xarelto|pradaxa|savaysa/i,
  /clopidogrel|prasugrel|ticagrelor|plavix|aspirin/i,
  /tacrolimus|cyclosporine|azathioprine|mycophenolate/i,
  /prograf|neoral|imuran|cellcept/i,
  /levetiracetam|phenytoin|carbamazepine|valproate|lamotrigine/i,
  /keppra|dilantin|tegretol|depakote|lamictal/i,
];

/**
 * Determines if a medication is likely maintenance-based on therapeutic class or name.
 * @param drugName - Medication name
 * @param atcCode - Optional ATC code from API
 * @returns True if likely maintenance medication
 */
export function isLikelyMaintenanceMed(
  drugName: string,
  atcCode?: string
): boolean {
  if (atcCode) {
    const isMaintenanceByATC = MAINTENANCE_ATC_PREFIXES.some(prefix => 
      atcCode.toUpperCase().startsWith(prefix)
    );
    if (isMaintenanceByATC) return true;
  }
  
  const isMaintenanceByName = MAINTENANCE_DRUG_PATTERNS.some(pattern => 
    pattern.test(drugName)
  );
  
  return isMaintenanceByName;
}

/**
 * Provides user-friendly explanation for why a drug is suggested as maintenance.
 * @param drugName - Medication name
 * @param atcCode - Optional ATC code
 * @returns Explanation string or null if not maintenance
 */
export function getMaintenanceReason(
  drugName: string,
  atcCode?: string
): string | null {
  if (!isLikelyMaintenanceMed(drugName, atcCode)) {
    return null;
  }
  
  const lowerName = drugName.toLowerCase();
  
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
  
  return 'This medication is typically taken regularly for chronic conditions';
}
