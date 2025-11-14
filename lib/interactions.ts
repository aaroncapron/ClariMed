/**
 * Drug interaction checking using RxNav Interaction API.
 * 
 * CURRENTLY DISABLED: The RxNav Interaction API endpoint is returning 404 errors
 * and appears to be deprecated or unavailable. This feature is temporarily disabled
 * until an alternative data source is implemented (e.g., DailyMed, OpenFDA, or local knowledge base).
 * 
 * All functions return empty arrays to prevent breaking the application.
 * 
 * @see https://lhncbc.nlm.nih.gov/RxNav/APIs/InteractionAPIs.html
 */

import type { Medication } from '@/types';

export type InteractionSeverity = 'critical' | 'major' | 'moderate' | 'minor' | 'unknown';

export interface DrugInteraction {
  drugA: { name: string; rxcui: string };
  drugB: { name: string; rxcui: string };
  severity: InteractionSeverity;
  description: string;
  source?: string;
}

/**
 * DISABLED: Checks for drug interactions between two specific medications by RxCUI.
 * @returns Empty array (feature currently disabled)
 */
export async function checkDrugInteraction(
  rxcui1: string,
  rxcui2: string
): Promise<DrugInteraction[]> {
  console.warn('Drug interaction checking is temporarily disabled - RxNav API endpoint unavailable');
  return [];
}

/**
 * DISABLED: Checks a new medication for interactions with existing medications.
 * @returns Empty array (feature currently disabled)
 */
export async function checkMedicationInteractions(
  newMedication: Partial<Medication> & { name: string; rxcui?: string },
  existingMedications: Medication[]
): Promise<DrugInteraction[]> {
  console.warn('Drug interaction checking is temporarily disabled - RxNav API endpoint unavailable');
  return [];
}

/**
 * DISABLED: Checks all medications in a list for interactions with each other.
 * @returns Empty array (feature currently disabled)
 */
export async function checkAllInteractions(
  medications: Medication[]
): Promise<DrugInteraction[]> {
  console.warn('Drug interaction checking is temporarily disabled - RxNav API endpoint unavailable');
  return [];
}
