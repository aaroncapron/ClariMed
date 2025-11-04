/**
 * Medication contraindications based on health conditions.
 * Checks if medications are safe given user's medical history.
 */

import type { Medication, HealthCondition } from '@/types';

export interface ContraindicationWarning {
  condition: string;
  medication: string;
  severity: 'critical' | 'major' | 'moderate' | 'minor';
  description: string;
  category: string;
}

/**
 * Medication contraindications by condition keywords.
 * Maps condition names to medications that should be avoided or used with caution.
 */
const CONTRAINDICATIONS: Record<string, Array<{
  keywords: string[];
  severity: 'critical' | 'major' | 'moderate' | 'minor';
  description: string;
}>> = {
  'pregnancy': [
    {
      keywords: ['isotretinoin', 'accutane', 'thalidomide'],
      severity: 'critical',
      description: 'Severe birth defects. Absolutely contraindicated during pregnancy.',
    },
    {
      keywords: ['warfarin', 'coumadin'],
      severity: 'critical',
      description: 'Can cause fetal bleeding and birth defects.',
    },
    {
      keywords: ['ace inhibitor', 'lisinopril', 'enalapril', 'ramipril', 'benazepril'],
      severity: 'critical',
      description: 'ACE inhibitors can cause serious fetal harm, especially in second and third trimesters.',
    },
    {
      keywords: ['arb', 'losartan', 'valsartan', 'irbesartan', 'olmesartan'],
      severity: 'critical',
      description: 'ARBs can cause serious fetal harm.',
    },
    {
      keywords: ['statin', 'atorvastatin', 'simvastatin', 'rosuvastatin', 'pravastatin', 'lipitor', 'crestor'],
      severity: 'critical',
      description: 'Statins can cause fetal harm and are contraindicated during pregnancy.',
    },
    {
      keywords: ['ibuprofen', 'naproxen', 'nsaid', 'advil', 'motrin', 'aleve'],
      severity: 'major',
      description: 'NSAIDs should be avoided in third trimester. May cause premature closure of ductus arteriosus.',
    },
    {
      keywords: ['doxycycline', 'tetracycline', 'minocycline'],
      severity: 'major',
      description: 'Tetracyclines can affect fetal bone and tooth development.',
    },
  ],
  'breastfeeding': [
    {
      keywords: ['codeine', 'tramadol'],
      severity: 'major',
      description: 'Can pass into breast milk and cause serious side effects in nursing infants.',
    },
    {
      keywords: ['aspirin'],
      severity: 'moderate',
      description: 'May increase risk of Reye syndrome in nursing infants.',
    },
  ],
  'asthma': [
    {
      keywords: ['aspirin', 'nsaid', 'ibuprofen', 'naproxen'],
      severity: 'major',
      description: 'NSAIDs can trigger asthma attacks in sensitive individuals.',
    },
    {
      keywords: ['beta blocker', 'propranolol', 'metoprolol', 'atenolol'],
      severity: 'major',
      description: 'Beta blockers can cause bronchospasm and worsen asthma.',
    },
  ],
  'kidney disease': [
    {
      keywords: ['nsaid', 'ibuprofen', 'naproxen', 'diclofenac', 'meloxicam'],
      severity: 'major',
      description: 'NSAIDs can worsen kidney function and should be avoided in kidney disease.',
    },
    {
      keywords: ['metformin'],
      severity: 'major',
      description: 'Metformin requires dose adjustment or discontinuation in moderate to severe kidney disease.',
    },
    {
      keywords: ['lithium'],
      severity: 'major',
      description: 'Lithium is primarily eliminated by kidneys and requires careful monitoring.',
    },
  ],
  'chronic kidney disease': [
    {
      keywords: ['nsaid', 'ibuprofen', 'naproxen'],
      severity: 'major',
      description: 'NSAIDs can accelerate kidney disease progression.',
    },
    {
      keywords: ['metformin'],
      severity: 'major',
      description: 'Metformin may need dose adjustment based on kidney function.',
    },
  ],
  'liver disease': [
    {
      keywords: ['acetaminophen', 'tylenol'],
      severity: 'major',
      description: 'Acetaminophen can worsen liver damage. Maximum dose should be reduced.',
    },
    {
      keywords: ['statin', 'atorvastatin', 'simvastatin'],
      severity: 'major',
      description: 'Statins can cause liver enzyme elevation and require monitoring.',
    },
    {
      keywords: ['methotrexate'],
      severity: 'critical',
      description: 'Methotrexate is hepatotoxic and contraindicated in liver disease.',
    },
  ],
  'glaucoma': [
    {
      keywords: ['anticholinergic', 'diphenhydramine', 'benadryl', 'hydroxyzine'],
      severity: 'major',
      description: 'Anticholinergics can increase intraocular pressure and worsen glaucoma.',
    },
  ],
  'peptic ulcer': [
    {
      keywords: ['nsaid', 'aspirin', 'ibuprofen', 'naproxen'],
      severity: 'major',
      description: 'NSAIDs increase risk of bleeding and ulcer complications.',
    },
    {
      keywords: ['corticosteroid', 'prednisone', 'methylprednisolone'],
      severity: 'moderate',
      description: 'Corticosteroids increase risk of peptic ulcer disease.',
    },
  ],
  'gout': [
    {
      keywords: ['aspirin', 'thiazide', 'hydrochlorothiazide'],
      severity: 'moderate',
      description: 'Can increase uric acid levels and trigger gout attacks.',
    },
  ],
  'seizure': [
    {
      keywords: ['bupropion', 'wellbutrin'],
      severity: 'major',
      description: 'Bupropion lowers seizure threshold.',
    },
    {
      keywords: ['tramadol'],
      severity: 'moderate',
      description: 'Tramadol may lower seizure threshold.',
    },
  ],
  'epilepsy': [
    {
      keywords: ['bupropion', 'wellbutrin'],
      severity: 'major',
      description: 'Bupropion is contraindicated in seizure disorders.',
    },
  ],
  'enlarged prostate': [
    {
      keywords: ['anticholinergic', 'diphenhydramine', 'benadryl'],
      severity: 'moderate',
      description: 'Anticholinergics can worsen urinary retention.',
    },
  ],
  'hypertension': [
    {
      keywords: ['nsaid', 'ibuprofen', 'naproxen'],
      severity: 'moderate',
      description: 'NSAIDs can increase blood pressure and reduce effectiveness of antihypertensive medications.',
    },
    {
      keywords: ['decongestant', 'pseudoephedrine', 'phenylephrine'],
      severity: 'moderate',
      description: 'Decongestants can raise blood pressure.',
    },
  ],
  'heart failure': [
    {
      keywords: ['nsaid', 'ibuprofen', 'naproxen'],
      severity: 'major',
      description: 'NSAIDs can worsen heart failure by causing fluid retention.',
    },
    {
      keywords: ['calcium channel blocker', 'diltiazem', 'verapamil'],
      severity: 'moderate',
      description: 'Some calcium channel blockers can worsen heart failure.',
    },
  ],
  'diabetes': [
    {
      keywords: ['corticosteroid', 'prednisone', 'methylprednisolone', 'dexamethasone'],
      severity: 'moderate',
      description: 'Corticosteroids increase blood sugar levels and may require diabetes medication adjustment.',
    },
    {
      keywords: ['thiazide', 'hydrochlorothiazide'],
      severity: 'moderate',
      description: 'Thiazide diuretics can raise blood sugar levels.',
    },
  ],
};

/**
 * Checks medication for contraindications based on health conditions.
 * @param medication - Medication to check
 * @param conditions - User's health conditions
 * @returns Array of contraindication warnings
 */
export function checkContraindications(
  medication: Medication,
  conditions: HealthCondition[]
): ContraindicationWarning[] {
  if (!medication.name || conditions.length === 0) return [];

  const warnings: ContraindicationWarning[] = [];
  const medLower = medication.name.toLowerCase();

  for (const condition of conditions) {
    const conditionLower = condition.condition.toLowerCase();
    
    for (const [conditionKey, contraindicationList] of Object.entries(CONTRAINDICATIONS)) {
      if (conditionLower.includes(conditionKey)) {
        for (const contraindication of contraindicationList) {
          const matches = contraindication.keywords.some(keyword => 
            medLower.includes(keyword.toLowerCase())
          );

          if (matches) {
            warnings.push({
              condition: condition.condition,
              medication: medication.name,
              severity: contraindication.severity,
              description: contraindication.description,
              category: condition.category,
            });
          }
        }
      }
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
