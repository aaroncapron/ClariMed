/**
 * Drug information extraction utilities
 * Pattern-matching functions to extract drug class, common uses, and dosage forms
 */

/**
 * Extracts medication class from the medication name.
 * Returns a user-friendly description of what type of drug it is.
 */
export function getMedicationClass(medicationName: string): string {
  const name = medicationName.toLowerCase();
  
  if (name.includes('statin')) {
    return 'Statin - Cholesterol-lowering medication';
  }
  
  if (name.includes('pril')) {
    return 'ACE Inhibitor - Blood pressure medication';
  }
  
  if (name.includes('sartan')) {
    return 'ARB (Angiotensin Receptor Blocker) - Blood pressure medication';
  }
  
  if (name.includes('olol')) {
    return 'Beta Blocker - Heart and blood pressure medication';
  }
  
  if (name.includes('thiazide') || name.includes('furosemide') || name.includes('hydrochlorothiazide')) {
    return 'Diuretic - Water pill for blood pressure';
  }
  
  if (name.includes('prazole')) {
    return 'Proton Pump Inhibitor - Reduces stomach acid';
  }
  
  if (name.includes('sertraline') || name.includes('fluoxetine') || name.includes('pram')) {
    return 'SSRI - Antidepressant';
  }
  
  if (name.includes('metformin')) {
    return 'Biguanide - Diabetes medication';
  }
  
  if (name.includes('levothyroxine') || name.includes('synthroid')) {
    return 'Thyroid Hormone Replacement';
  }
  
  if (name.includes('ibuprofen') || name.includes('naproxen') || name.includes('diclofenac')) {
    return 'NSAID - Anti-inflammatory pain reliever';
  }
  
  if (name.includes('cillin') || name.includes('mycin') || name.includes('cycline') || name.includes('floxacin')) {
    return 'Antibiotic - Fights bacterial infections';
  }
  
  return ' ';
}

/**
 * Returns common uses for a medication based on its name.
 */
export function getCommonUse(medicationName: string): string {
  const name = medicationName.toLowerCase();
  
  if (name.includes('statin')) {
    return 'Lower cholesterol and reduce heart disease risk';
  }
  
  if (name.includes('pril')) {
    return 'Lower blood pressure and protect kidneys';
  }
  
  if (name.includes('sartan')) {
    return 'Lower blood pressure (alternative to ACE inhibitors)';
  }
  
  if (name.includes('olol') || name.includes('metoprolol') || name.includes('atenolol')) {
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
  
  if (name.includes('cillin') || name.includes('mycin')) {
    return 'Treat bacterial infections';
  }
  
  return 'Consult your healthcare provider for specific uses';
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
