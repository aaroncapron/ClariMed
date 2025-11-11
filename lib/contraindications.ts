/**
 * Medication contraindications based on health conditions.
 * Checks if medications are safe given user's medical history.
 */

import type { Medication, HealthCondition } from '@/types';
import { getRelatedConcepts, DrugProperties } from './rxnav';

export interface ContraindicationWarning {
  condition: string;
  medication: string;
  severity: 'critical' | 'major' | 'moderate' | 'minor';
  description: string;
  category: string;
}

/**
 * Checks for medication contraindications against a list of health conditions using the RxNav API.
 * @param medication The medication to check.
 * @param conditions The user's list of health conditions.
 * @returns A promise that resolves to an array of contraindication warnings.
 */
export async function checkContraindications(
  medication: Medication,
  conditions: HealthCondition[]
): Promise<ContraindicationWarning[]> {
  if (!medication.rxcui || conditions.length === 0) {
    return [];
  }

  const warnings: ContraindicationWarning[] = [];
  const conditionRxcuis = conditions
    .map(c => c.rxcui)
    .filter((rxcui): rxcui is string => !!rxcui);

  if (conditionRxcuis.length === 0) {
    return [];
  }

  // Get concepts that may be contraindicated by the medication
  const contraindicatedConcepts = await getRelatedConcepts(medication.rxcui, [
    'CI_with',
  ]);

  for (const concept of contraindicatedConcepts) {
    for (const condition of conditions) {
      if (condition.rxcui && concept.rxcui === condition.rxcui) {
        warnings.push({
          condition: condition.condition,
          medication: medication.name,
          severity: 'critical', // API doesn't provide severity, default to critical
          description: `This medication may be contraindicated with ${condition.condition}.`,
          category: condition.category,
        });
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
