/**
 * Medication contraindications based on health conditions.
 * Checks if medications are safe given user's medical history.
 * 
 * Note: RxNav's CI_with relationship is limited. This implementation uses
 * ingredient-based checking combined with a curated knowledge base for
 * common critical contraindications (pregnancy, breastfeeding, etc.)
 */

import type { Medication, HealthCondition } from '@/types';
import { getRelatedConcepts, getIngredients, DrugProperties } from './rxnav';

export interface ContraindicationWarning {
  condition: string;
  medication: string;
  severity: 'critical' | 'major' | 'moderate' | 'minor';
  description: string;
  category: string;
}

/**
 * Known contraindications that RxNav API may not capture.
 * This provides a safety net for critical drug-condition interactions.
 */
export const KNOWN_CONTRAINDICATIONS: {
  [key: string]: {
    ingredients: string[];
    severity: 'critical' | 'major' | 'moderate' | 'minor';
    description: string;
  };
} = {
  pregnancy: {
    // Common pregnancy contraindications (FDA Category X and D)
    ingredients: [
      'isotretinoin',
      'accutane',
      'thalidomide',
      'finasteride',
      'dutasteride',
      'misoprostol',
      'methotrexate',
      'leflunomide',
      'mycophenolate',
      'ribavirin',
      'statins', // atorvastatin, simvastatin, rosuvastatin, etc.
      'atorvastatin',
      'lipitor',
      'simvastatin',
      'zocor',
      'rosuvastatin',
      'crestor',
      'pravastatin',
      'lovastatin',
      'fluvastatin',
      'pitavastatin',
      'warfarin',
      'coumadin',
      'ace inhibitors', // lisinopril, enalapril, etc.
      'lisinopril',
      'enalapril',
      'ramipril',
      'benazepril',
      'captopril',
      'quinapril',
      'arbs', // losartan, valsartan, etc.
      'losartan',
      'valsartan',
      'olmesartan',
      'irbesartan',
      'telmisartan',
      'candesartan',
      'tetracyclines',
      'tetracycline',
      'doxycycline',
      'minocycline',
      'demeclocycline',
      'testosterone',
      'danazol',
      'estradiol', // Can be contraindicated depending on use case
      'ethinyl estradiol',
      'mestranol',
      'phenytoin',
      'dilantin',
      'valproate',
      'valproic acid',
      'depakote',
      'divalproex',
      'carbamazepine',
      'tegretol',
      'topiramate',
      'topamax',
      'nsaid',
      'nsaids',
      'ibuprofen',
      'naproxen',
      'indomethacin',
      'ketorolac',
    ],
    severity: 'critical',
    description:
      'This medication may cause serious harm to an unborn baby, including birth defects or fetal harm. Do not take if pregnant or planning pregnancy. Consult your healthcare provider immediately.',
  },
  breastfeeding: {
    ingredients: [
      'codeine',
      'tramadol',
      'lithium',
      'amiodarone',
      'chloramphenicol',
      'cyclosporine',
      'ergotamine',
      'gold salts',
      'radioactive iodine',
    ],
    severity: 'major',
    description:
      'This medication passes into breast milk and may harm a nursing infant. Consult your healthcare provider before use.',
  },
  'chronic kidney disease': {
    ingredients: [
      'nsaid',
      'nsaids',
      'ibuprofen',
      'naproxen',
      'indomethacin',
      'diclofenac',
      'ketorolac',
      'metformin',
      'glucophage',
      'lithium',
    ],
    severity: 'major',
    description:
      'This medication may worsen kidney function or accumulate to toxic levels in patients with kidney disease. Close monitoring or dose adjustment may be required.',
  },
  'liver disease': {
    ingredients: [
      'acetaminophen',
      'tylenol',
      'paracetamol',
      'statins',
      'atorvastatin',
      'simvastatin',
      'rosuvastatin',
      'methotrexate',
      'isoniazid',
      'valproate',
    ],
    severity: 'major',
    description:
      'This medication may cause liver damage or worsen existing liver disease. Dose adjustment or alternative therapy may be needed.',
  },
  asthma: {
    ingredients: [
      'nsaid',
      'nsaids',
      'ibuprofen',
      'aspirin',
      'naproxen',
      'beta blocker',
      'beta-blocker',
      'propranolol',
      'metoprolol',
      'atenolol',
      'carvedilol',
    ],
    severity: 'major',
    description:
      'This medication may trigger asthma attacks or cause bronchospasm. Alternative therapy recommended.',
  },
  'narrow-angle glaucoma': {
    ingredients: [
      'anticholinergic',
      'diphenhydramine',
      'benadryl',
      'oxybutynin',
      'tolterodine',
      'scopolamine',
      'atropine',
    ],
    severity: 'major',
    description:
      'This medication may increase intraocular pressure and worsen glaucoma. Consult ophthalmologist.',
  },
  diabetes: {
    ingredients: [
      'corticosteroid',
      'prednisone',
      'dexamethasone',
      'hydrocortisone',
      'methylprednisolone',
      'thiazide',
      'hydrochlorothiazide',
    ],
    severity: 'moderate',
    description:
      'This medication may increase blood sugar levels. Close glucose monitoring recommended.',
  },
  'seizure disorder': {
    ingredients: [
      'bupropion',
      'wellbutrin',
      'zyban',
      'tramadol',
    ],
    severity: 'major',
    description:
      'This medication may lower seizure threshold and increase risk of seizures.',
  },
  'peptic ulcer disease': {
    ingredients: [
      'nsaid',
      'nsaids',
      'ibuprofen',
      'naproxen',
      'aspirin',
      'indomethacin',
    ],
    severity: 'major',
    description:
      'This medication may worsen peptic ulcers or cause gastrointestinal bleeding.',
  },
  'heart failure': {
    ingredients: [
      'nsaid',
      'nsaids',
      'ibuprofen',
      'naproxen',
      'calcium channel blocker',
      'verapamil',
      'diltiazem',
      'nifedipine',
    ],
    severity: 'major',
    description:
      'This medication may cause fluid retention and worsen heart failure.',
  },
  hypertension: {
    ingredients: [
      'nsaid',
      'nsaids',
      'ibuprofen',
      'naproxen',
    ],
    severity: 'moderate',
    description:
      'This medication may increase blood pressure. Monitor blood pressure closely.',
  },
};

/**
 * Simple synchronous contraindication check (used for testing).
 * Checks medication name against known contraindications for given conditions.
 * 
 * @param medication The medication to check
 * @param conditions The user's list of health conditions
 * @returns Array of contraindication warnings
 */
export function checkContraindications(
  medication: Medication,
  conditions: HealthCondition[]
): ContraindicationWarning[] {
  if (!medication.name || conditions.length === 0) {
    return [];
  }

  const warnings: ContraindicationWarning[] = [];
  const medNameLower = medication.name.toLowerCase();

  // Check each condition
  for (const condition of conditions) {
    const conditionLower = condition.condition.toLowerCase();
    const categoryLower = condition.category.toLowerCase();

    // Check known contraindications
    for (const [conditionKey, contraindicationData] of Object.entries(
      KNOWN_CONTRAINDICATIONS
    )) {
      // Match condition by name or category
      if (
        conditionLower.includes(conditionKey) ||
        categoryLower.includes(conditionKey) ||
        conditionKey.includes(conditionLower)
      ) {
        // Check if medication name contains any contraindicated ingredient
        const hasConflict = contraindicationData.ingredients.some(
          (contraindicatedIngredient) =>
            medNameLower.includes(contraindicatedIngredient.toLowerCase()) ||
            contraindicatedIngredient.toLowerCase().includes(medNameLower.split(' ')[0])
        );

        if (hasConflict) {
          warnings.push({
            condition: condition.condition,
            medication: medication.name,
            severity: contraindicationData.severity,
            description: contraindicationData.description,
            category: condition.category,
          });
          break; // Only add one warning per condition
        }
      }
    }
  }

  return warnings;
}

/**
 * Comprehensive async contraindication check using RxNav API.
 * Checks for medication contraindications against a list of health conditions.
 * Uses both RxNav API and a curated knowledge base for comprehensive checking.
 * 
 * @param medication The medication to check.
 * @param conditions The user's list of health conditions.
 * @returns A promise that resolves to an array of contraindication warnings.
 */
export async function checkContraindicationsAsync(
  medication: Medication,
  conditions: HealthCondition[]
): Promise<ContraindicationWarning[]> {
  if (!medication.rxcui || conditions.length === 0) {
    return [];
  }

  const warnings: ContraindicationWarning[] = [];

  // Get ingredient names for this medication
  let ingredientNames: string[] = [];
  try {
    const ingredientConcepts = await getRelatedConcepts(medication.rxcui, ['IN']);
    ingredientNames = ingredientConcepts.map((c) =>
      c.name.toLowerCase().trim()
    );
  } catch (error) {
    console.error('Error fetching ingredients for contraindication check:', error);
  }

  // Check each condition
  for (const condition of conditions) {
    const conditionLower = condition.condition.toLowerCase();
    const categoryLower = condition.category.toLowerCase();

    // Check known contraindications
    for (const [conditionKey, contraindicationData] of Object.entries(
      KNOWN_CONTRAINDICATIONS
    )) {
      // Match condition by name or category
      if (
        conditionLower.includes(conditionKey) ||
        categoryLower.includes(conditionKey)
      ) {
        // Check if any ingredient matches
        const hasConflict = ingredientNames.some((ingredient) =>
          contraindicationData.ingredients.some(
            (contraindicatedIngredient) =>
              ingredient.includes(contraindicatedIngredient.toLowerCase()) ||
              contraindicatedIngredient.toLowerCase().includes(ingredient)
          )
        );

        // Also check medication name for brand/generic matches
        const medNameLower = medication.name.toLowerCase();
        const nameHasConflict = contraindicationData.ingredients.some(
          (contraindicatedIngredient) =>
            medNameLower.includes(contraindicatedIngredient.toLowerCase())
        );

        if (hasConflict || nameHasConflict) {
          warnings.push({
            condition: condition.condition,
            medication: medication.name,
            severity: contraindicationData.severity,
            description: contraindicationData.description,
            category: condition.category,
          });
          break; // Only add one warning per condition
        }
      }
    }

    // Also check RxNav CI_with relationships as backup
    try {
      if (condition.rxcui) {
        const contraindicatedConcepts = await getRelatedConcepts(
          medication.rxcui,
          ['CI_with']
        );

        for (const concept of contraindicatedConcepts) {
          if (concept.rxcui === condition.rxcui) {
            // Only add if we haven't already found a match from known contraindications
            const alreadyWarned = warnings.some(
              (w) => w.condition === condition.condition
            );
            if (!alreadyWarned) {
              warnings.push({
                condition: condition.condition,
                medication: medication.name,
                severity: 'critical',
                description: `This medication may be contraindicated with ${condition.condition}.`,
                category: condition.category,
              });
            }
          }
        }
      }
    } catch (error) {
      console.error('Error checking CI_with relationships:', error);
    }
  }

  return warnings;
}

/**
 * Gets badge configuration for contraindication severity.
 */
export function getContraindicationBadge(severity: 'critical' | 'major' | 'moderate' | 'minor') {
  switch (severity) {
    case 'critical':
      return {
        label: 'Critical',
        color: 'bg-red-100 text-red-800 border-red-300',
      };
    case 'major':
      return {
        label: 'Major',
        color: 'bg-orange-100 text-orange-800 border-orange-300',
      };
    case 'moderate':
      return {
        label: 'Moderate',
        color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      };
    case 'minor':
      return {
        label: 'Minor',
        color: 'bg-blue-100 text-blue-800 border-blue-300',
      };
  }
}
