/**
 * Medical reference data for common drug allergies and health conditions.
 * Used for autocomplete suggestions and contraindication checking.
 */

export interface CommonDrugAllergy {
  name: string;
  category: string;
  description: string;
}

export interface CommonHealthCondition {
  name: string;
  category: 'cardiovascular' | 'respiratory' | 'endocrine' | 'gastrointestinal' | 'renal' | 'hepatic' | 'neurological' | 'pregnancy' | 'other';
  description: string;
}

/**
 * Common drug allergies organized by class.
 */
export const COMMON_DRUG_ALLERGIES: CommonDrugAllergy[] = [
  {
    name: 'Penicillin',
    category: 'Beta-Lactam Antibiotics',
    description: 'May cause cross-reactions with other penicillins and some cephalosporins',
  },
  {
    name: 'Amoxicillin',
    category: 'Beta-Lactam Antibiotics',
    description: 'Penicillin-type antibiotic',
  },
  {
    name: 'Ampicillin',
    category: 'Beta-Lactam Antibiotics',
    description: 'Penicillin-type antibiotic',
  },
  {
    name: 'Cephalosporins',
    category: 'Beta-Lactam Antibiotics',
    description: 'May cross-react with penicillins in 1-10% of cases',
  },
  {
    name: 'Sulfa drugs (Sulfonamides)',
    category: 'Sulfonamide Antibiotics',
    description: 'Includes sulfamethoxazole, trimethoprim-sulfamethoxazole (Bactrim)',
  },
  {
    name: 'Aspirin',
    category: 'NSAIDs',
    description: 'May cause cross-reactions with other NSAIDs',
  },
  {
    name: 'Ibuprofen',
    category: 'NSAIDs',
    description: 'May cross-react with other NSAIDs including aspirin',
  },
  {
    name: 'Naproxen',
    category: 'NSAIDs',
    description: 'May cross-react with other NSAIDs',
  },
  {
    name: 'Codeine',
    category: 'Opioid Analgesics',
    description: 'May cause cross-reactions with other opioids',
  },
  {
    name: 'Morphine',
    category: 'Opioid Analgesics',
    description: 'May cause cross-reactions with other opioids',
  },
  {
    name: 'Latex',
    category: 'Non-Drug Allergen',
    description: 'Important for medication packaging and delivery devices',
  },
  {
    name: 'Egg',
    category: 'Food Allergen',
    description: 'Relevant for some vaccines and medications',
  },
  {
    name: 'Shellfish',
    category: 'Food Allergen',
    description: 'May affect iodine-containing contrast media',
  },
  {
    name: 'Local anesthetics (Novocaine)',
    category: 'Anesthetic Agents',
    description: 'May include lidocaine, benzocaine, procaine',
  },
  {
    name: 'Tetracycline',
    category: 'Tetracycline Antibiotics',
    description: 'Includes doxycycline, minocycline',
  },
  {
    name: 'Quinolones (Fluoroquinolones)',
    category: 'Fluoroquinolone Antibiotics',
    description: 'Includes ciprofloxacin, levofloxacin',
  },
  {
    name: 'Macrolides',
    category: 'Macrolide Antibiotics',
    description: 'Includes erythromycin, azithromycin, clarithromycin',
  },
  {
    name: 'Contrast dye',
    category: 'Diagnostic Agents',
    description: 'Used in CT scans and other imaging',
  },
];

/**
 * Common health conditions that may contraindicate medications.
 */
export const COMMON_HEALTH_CONDITIONS: CommonHealthCondition[] = [
  // Pregnancy & Reproductive
  {
    name: 'Pregnancy',
    category: 'pregnancy',
    description: 'Many medications contraindicated during pregnancy',
  },
  {
    name: 'Breastfeeding',
    category: 'pregnancy',
    description: 'Some medications pass into breast milk',
  },
  {
    name: 'Trying to conceive',
    category: 'pregnancy',
    description: 'Certain medications should be avoided when planning pregnancy',
  },

  // Cardiovascular
  {
    name: 'Hypertension (High blood pressure)',
    category: 'cardiovascular',
    description: 'Affects medication choices for blood pressure management',
  },
  {
    name: 'Heart disease',
    category: 'cardiovascular',
    description: 'May contraindicate certain medications',
  },
  {
    name: 'Arrhythmia (Irregular heartbeat)',
    category: 'cardiovascular',
    description: 'Some medications can worsen heart rhythm problems',
  },
  {
    name: 'Heart failure',
    category: 'cardiovascular',
    description: 'Requires careful medication selection',
  },
  {
    name: 'History of heart attack',
    category: 'cardiovascular',
    description: 'May affect medication choices',
  },
  {
    name: 'History of stroke',
    category: 'cardiovascular',
    description: 'Important for anticoagulant and antiplatelet therapy',
  },
  {
    name: 'Blood clotting disorder',
    category: 'cardiovascular',
    description: 'Affects anticoagulation therapy',
  },

  // Respiratory
  {
    name: 'Asthma',
    category: 'respiratory',
    description: 'Some medications can trigger asthma symptoms',
  },
  {
    name: 'COPD (Chronic Obstructive Pulmonary Disease)',
    category: 'respiratory',
    description: 'May contraindicate respiratory depressants',
  },
  {
    name: 'Sleep apnea',
    category: 'respiratory',
    description: 'Some sedatives may worsen breathing during sleep',
  },

  // Endocrine
  {
    name: 'Diabetes (Type 1)',
    category: 'endocrine',
    description: 'Affects blood sugar management and medication interactions',
  },
  {
    name: 'Diabetes (Type 2)',
    category: 'endocrine',
    description: 'Some medications can affect blood glucose levels',
  },
  {
    name: 'Thyroid disease',
    category: 'endocrine',
    description: 'May interact with thyroid medications',
  },
  {
    name: 'Hyperthyroidism',
    category: 'endocrine',
    description: 'Overactive thyroid',
  },
  {
    name: 'Hypothyroidism',
    category: 'endocrine',
    description: 'Underactive thyroid',
  },

  // Gastrointestinal
  {
    name: 'GERD (Acid reflux)',
    category: 'gastrointestinal',
    description: 'Some medications can worsen reflux',
  },
  {
    name: 'Peptic ulcer disease',
    category: 'gastrointestinal',
    description: 'NSAIDs and some medications contraindicated',
  },
  {
    name: 'Inflammatory bowel disease (IBD)',
    category: 'gastrointestinal',
    description: 'Includes Crohn\'s disease and ulcerative colitis',
  },
  {
    name: 'Celiac disease',
    category: 'gastrointestinal',
    description: 'Some medications contain gluten',
  },

  // Renal
  {
    name: 'Kidney disease',
    category: 'renal',
    description: 'Many medications require dose adjustment',
  },
  {
    name: 'Chronic kidney disease (CKD)',
    category: 'renal',
    description: 'Affects medication clearance and dosing',
  },
  {
    name: 'End-stage renal disease (ESRD)',
    category: 'renal',
    description: 'Severe kidney dysfunction requiring dialysis',
  },

  // Hepatic
  {
    name: 'Liver disease',
    category: 'hepatic',
    description: 'Affects medication metabolism',
  },
  {
    name: 'Cirrhosis',
    category: 'hepatic',
    description: 'Advanced liver disease requiring special consideration',
  },
  {
    name: 'Hepatitis',
    category: 'hepatic',
    description: 'May affect medication choices',
  },

  // Neurological
  {
    name: 'Epilepsy',
    category: 'neurological',
    description: 'Some medications lower seizure threshold',
  },
  {
    name: 'Seizure disorder',
    category: 'neurological',
    description: 'Requires careful medication selection',
  },
  {
    name: 'Depression',
    category: 'neurological',
    description: 'Important for medication interactions',
  },
  {
    name: 'Anxiety disorder',
    category: 'neurological',
    description: 'May interact with various medications',
  },
  {
    name: 'Bipolar disorder',
    category: 'neurological',
    description: 'Some medications can trigger mood episodes',
  },
  {
    name: 'Parkinson\'s disease',
    category: 'neurological',
    description: 'Some medications can worsen symptoms',
  },
  {
    name: 'Dementia',
    category: 'neurological',
    description: 'May affect medication compliance and interactions',
  },
  {
    name: 'Migraine',
    category: 'neurological',
    description: 'Some medications can trigger migraines',
  },

  // Other
  {
    name: 'Glaucoma',
    category: 'other',
    description: 'Some medications increase intraocular pressure',
  },
  {
    name: 'Osteoporosis',
    category: 'other',
    description: 'Some medications affect bone density',
  },
  {
    name: 'Gout',
    category: 'other',
    description: 'Some medications can trigger gout attacks',
  },
  {
    name: 'Enlarged prostate (BPH)',
    category: 'other',
    description: 'Some medications worsen urinary symptoms',
  },
  {
    name: 'Alcohol use',
    category: 'other',
    description: 'Many medications interact with alcohol',
  },
  {
    name: 'Tobacco use',
    category: 'other',
    description: 'Affects metabolism of some medications',
  },
];

/**
 * Gets autocomplete suggestions for drug allergies.
 */
export function getAllergyAutocompleteSuggestions(query: string): CommonDrugAllergy[] {
  if (!query || query.length < 2) return [];
  
  const lowerQuery = query.toLowerCase();
  return COMMON_DRUG_ALLERGIES.filter(allergy =>
    allergy.name.toLowerCase().includes(lowerQuery) ||
    allergy.category.toLowerCase().includes(lowerQuery)
  ).slice(0, 10);
}

/**
 * Gets autocomplete suggestions for health conditions.
 */
export function getConditionAutocompleteSuggestions(query: string): CommonHealthCondition[] {
  if (!query || query.length < 2) return [];
  
  const lowerQuery = query.toLowerCase();
  return COMMON_HEALTH_CONDITIONS.filter(condition =>
    condition.name.toLowerCase().includes(lowerQuery) ||
    condition.description.toLowerCase().includes(lowerQuery)
  ).slice(0, 10);
}
