/**
 * Drug information extraction utilities - TERTIARY FALLBACK ONLY
 * Pattern-matching functions used as last resort when API data unavailable
 * These are intentionally simplified and should not be primary data source
 */

/**
 * FALLBACK: Extract medication class from name patterns
 * Used only when RxClass and DailyMed APIs return no data
 * Returns empty string if pattern doesn't match (no generic fallback)
 */
export function getMedicationClassFallback(medicationName: string): string {
  const name = medicationName.toLowerCase();
  
  // Statins - specific drugs only
  if (name.includes('statin') || name.includes('atorvastatin') || name.includes('simvastatin') || 
      name.includes('rosuvastatin') || name.includes('pravastatin')) {
    return 'Statin - Cholesterol-lowering medication';
  }
  
  // ACE Inhibitors - specific suffix
  if (name.includes('lisinopril') || name.includes('enalapril') || name.includes('ramipril') ||
      name.includes('benazepril') || (name.includes('pril') && !name.includes('aripiprazole'))) {
    return 'ACE Inhibitor - Blood pressure medication';
  }
  
  // ARBs - specific suffix
  if (name.includes('losartan') || name.includes('valsartan') || name.includes('irbesartan') ||
      name.includes('olmesartan') || name.includes('telmisartan') || name.includes('candesartan')) {
    return 'ARB (Angiotensin Receptor Blocker) - Blood pressure medication';
  }
  
  // Beta Blockers - exclude prostaglandin analogs like latanoprost
  // CRITICAL: Must check for exclusions first to avoid false positives
  if (name.includes('olol') && 
      !name.includes('latanoprost') && !name.includes('latano') && 
      !name.includes('bimatoprost') && !name.includes('travoprost')) {
    return 'Beta Blocker - Heart and blood pressure medication';
  }
  
  // Diuretics
  if (name.includes('thiazide') || name.includes('furosemide') || 
      name.includes('hydrochlorothiazide') || name.includes('chlorthalidone') ||
      name.includes('bumetanide') || name.includes('torsemide')) {
    return 'Diuretic - Water pill for blood pressure';
  }
  
  // Proton Pump Inhibitors
  if (name.includes('omeprazole') || name.includes('esomeprazole') || 
      name.includes('lansoprazole') || name.includes('pantoprazole') || 
      name.includes('rabeprazole') || name.includes('prazole')) {
    return 'Proton Pump Inhibitor - Reduces stomach acid';
  }
  
  // SSRIs - specific drugs
  if (name.includes('sertraline') || name.includes('fluoxetine') || 
      name.includes('escitalopram') || name.includes('citalopram') ||
      name.includes('paroxetine') || name.includes('fluvoxamine')) {
    return 'SSRI - Antidepressant';
  }
  
  // Biguanides
  if (name.includes('metformin')) {
    return 'Biguanide - Diabetes medication';
  }
  
  // Thyroid hormones
  if (name.includes('levothyroxine') || name.includes('synthroid') || 
      name.includes('liothyronine') || name.includes('thyroid')) {
    return 'Thyroid Hormone Replacement';
  }
  
  // NSAIDs - specific drugs
  if (name.includes('ibuprofen') || name.includes('naproxen') || 
      name.includes('diclofenac') || name.includes('meloxicam') ||
      name.includes('celecoxib') || name.includes('indomethacin')) {
    return 'NSAID - Anti-inflammatory pain reliever';
  }
  
  // Antibiotics - specific patterns
  if (name.includes('amoxicillin') || name.includes('penicillin') || 
      name.includes('azithromycin') || name.includes('doxycycline') || 
      name.includes('ciprofloxacin') || name.includes('levofloxacin') ||
      name.includes('cephalexin') || name.includes('clindamycin')) {
    return 'Antibiotic - Fights bacterial infections';
  }
  
  // No pattern matched - return empty string (no generic fallback)
  return '';
}

/**
 * FALLBACK: Get common uses from name patterns
 * Used only when RxClass and DailyMed APIs return no data
 * Returns empty string if pattern doesn't match
 */
export function getCommonUseFallback(medicationName: string): string {
  const name = medicationName.toLowerCase();
  
  if (name.includes('statin')) {
    return 'Lower cholesterol and reduce heart disease risk';
  }
  
  if (name.includes('pril') && !name.includes('aripiprazole')) {
    return 'Lower blood pressure and protect kidneys';
  }
  
  if (name.includes('sartan')) {
    return 'Lower blood pressure';
  }
  
  // Beta blockers - with prostaglandin exclusions
  if ((name.includes('olol') || name.includes('metoprolol') || name.includes('atenolol')) &&
      !name.includes('latanoprost') && !name.includes('bimatoprost')) {
    return 'Control heart rate and blood pressure';
  }
  
  if (name.includes('prazole')) {
    return 'Treat acid reflux, GERD, and stomach ulcers';
  }
  
  if (name.includes('sertraline') || name.includes('fluoxetine') || name.includes('escitalopram')) {
    return 'Treat depression and anxiety disorders';
  }
  
  if (name.includes('metformin')) {
    return 'Control blood sugar in Type 2 diabetes';
  }
  
  if (name.includes('levothyroxine')) {
    return 'Treat underactive thyroid (hypothyroidism)';
  }
  
  if (name.includes('ibuprofen') || name.includes('naproxen')) {
    return 'Relieve pain, reduce inflammation and fever';
  }
  
  if (name.includes('amoxicillin') || name.includes('azithromycin') || name.includes('ciprofloxacin')) {
    return 'Treat bacterial infections';
  }
  
  // Prostaglandin analogs (eye drops)
  if (name.includes('latanoprost') || name.includes('bimatoprost') || name.includes('travoprost')) {
    return 'Treat glaucoma and high eye pressure';
  }
  
  // No pattern matched - return empty string
  return '';
}

/**
 * Backward compatibility - these call the fallback functions
 * @deprecated Use getMedicationClassFallback or the cascade in drug-info.ts
 */
export function getMedicationClass(medicationName: string): string {
  return getMedicationClassFallback(medicationName);
}

/**
 * @deprecated Use getCommonUseFallback or the cascade in drug-info.ts
 */
export function getCommonUse(medicationName: string): string {
  return getCommonUseFallback(medicationName);
}

/**
 * Extracts the dosage form from medication name (tablet, capsule, etc.)
 */
export function extractDosageForm(medicationName: string): string {
  const name = medicationName.toLowerCase();
  
  if (name.includes('tablet')) return 'Tablet';
  if (name.includes('capsule')) return 'Capsule';
  if (name.includes('injection')) return 'Injection';
  if (name.includes('syrup')) return 'Syrup';
  if (name.includes('solution')) return 'Solution';
  if (name.includes('cream')) return 'Cream';
  if (name.includes('ointment')) return 'Ointment';
  if (name.includes('patch')) return 'Patch';
  if (name.includes('inhaler')) return 'Inhaler';
  if (name.includes('spray')) return 'Spray';
  if (name.includes('drops')) return 'Drops';
  if (name.includes('powder')) return 'Powder';
  if (name.includes('gel')) return 'Gel';
  if (name.includes('lotion')) return 'Lotion';
  
  return 'Oral medication';
}
