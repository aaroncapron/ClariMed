/**
 * Drug interaction checking using RxNav Interaction API.
 * Provides informational warnings only - not medical advice.
 * Users should always consult healthcare providers.
 * 
 * @see https://lhncbc.nlm.nih.gov/RxNav/APIs/InteractionAPIs.html
 */

import type { Medication } from '@/types';
import { getIngredients, checkInteractions as fetchInteractions } from './rxnav';

export type InteractionSeverity = 'critical' | 'major' | 'moderate' | 'minor' | 'unknown';

export interface DrugInteraction {
  drugA: { name: string; rxcui: string };
  drugB: { name: string; rxcui: string };
  severity: InteractionSeverity;
  description: string;
  source?: string;
}

// Legacy interface for backwards compatibility
export interface InteractionWarning {
  medication1: { name: string; rxcui: string };
  medication2: { name: string; rxcui: string };
  severity: 'high' | 'moderate' | 'low' | 'N/A';
  description: string;
}

/**
 * Maps RxNav severity strings to our standard severity levels.
 * @param severity - The severity string from RxNav API
 * @returns Normalized severity level
 */
export function mapSeverity(severity: string): InteractionSeverity {
  const lower = severity.toLowerCase();
  
  if (lower.includes('contraindicated')) return 'critical';
  if (lower.includes('major') || lower === 'high') return 'major';
  if (lower.includes('moderate')) return 'moderate';
  if (lower.includes('minor') || lower === 'low') return 'minor';
  
  return 'unknown';
}

/**
 * Gets badge configuration for display based on severity.
 * @param severity - The interaction severity level
 * @returns Badge configuration with label and color classes
 */
export function getSeverityBadge(severity: InteractionSeverity) {
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
    case 'unknown':
    default:
      return {
        label: 'Unknown',
        color: 'bg-gray-100 text-gray-800 border-gray-300',
      };
  }
}

/**
 * Checks for drug interactions between two specific medications by RxCUI.
 * Automatically converts drug product RxCUIs to ingredient RxCUIs for interaction checking.
 * @param rxcui1 - RxCUI of first medication (can be product or ingredient)
 * @param rxcui2 - RxCUI of second medication (can be product or ingredient)
 * @returns Array of drug interactions found
 */
export async function checkDrugInteraction(
  rxcui1: string,
  rxcui2: string
): Promise<DrugInteraction[]> {
  if (!rxcui1 || !rxcui2) {
    return [];
  }

  try {
    // Convert product RxCUIs to ingredient RxCUIs (required by interaction API)
    const ingredients1 = await getIngredients(rxcui1);
    const ingredients2 = await getIngredients(rxcui2);
    
    // If no ingredients found, the RxCUIs might already be ingredients, so try them directly
    const rxcuisToCheck = [
      ...(ingredients1.length > 0 ? ingredients1 : [rxcui1]),
      ...(ingredients2.length > 0 ? ingredients2 : [rxcui2])
    ];
    
    if (rxcuisToCheck.length < 2) {
      return [];
    }
    
    const interactionData = await fetchInteractions(rxcuisToCheck);
    
    if (!interactionData || interactionData.length === 0) {
      return [];
    }

    const interactions: DrugInteraction[] = [];

    for (const group of interactionData) {
      if (!group.fullInteractionType) continue;
      
      for (const type of group.fullInteractionType) {
        if (!type.interactionPair) continue;
        
        for (const pair of type.interactionPair) {
          const severity = mapSeverity(pair.severity || 'unknown');
          
          interactions.push({
            drugA: {
              name: pair.interactionConcept[0]?.minConceptItem?.name || 'Unknown',
              rxcui: pair.interactionConcept[0]?.minConceptItem?.rxcui || rxcui1,
            },
            drugB: {
              name: pair.interactionConcept[1]?.minConceptItem?.name || 'Unknown',
              rxcui: pair.interactionConcept[1]?.minConceptItem?.rxcui || rxcui2,
            },
            severity,
            description: pair.description || 'No description available',
            source: group.sourceName || 'DrugBank',
          });
        }
      }
    }

    return interactions;
  } catch (error) {
    console.error('Error checking drug interaction:', error);
    return [];
  }
}

/**
 * Checks a new medication for interactions with existing medications.
 * @param newMedication - The medication being added (partial Medication object with at least name and rxcui)
 * @param existingMedications - Array of existing medications
 * @returns Array of drug interactions found
 */
export async function checkMedicationInteractions(
  newMedication: Partial<Medication> & { name: string; rxcui?: string },
  existingMedications: Medication[]
): Promise<DrugInteraction[]> {
  if (!newMedication.rxcui || existingMedications.length === 0) {
    return [];
  }

  const interactions: DrugInteraction[] = [];

  for (const existingMed of existingMedications) {
    if (!existingMed.rxcui) continue;

    const foundInteractions = await checkDrugInteraction(
      newMedication.rxcui,
      existingMed.rxcui
    );

    // Enhance the interaction objects with actual medication names
    const enhancedInteractions = foundInteractions.map(interaction => ({
      ...interaction,
      drugA: {
        ...interaction.drugA,
        name: newMedication.name,
      },
      drugB: {
        ...interaction.drugB,
        name: existingMed.name,
      },
    }));

    interactions.push(...enhancedInteractions);
  }

  return interactions;
}

/**
 * Checks all medications in a list for interactions with each other.
 * @param medications - Array of medications to check
 * @returns Array of all drug interactions found
 */
export async function checkAllInteractions(
  medications: Medication[]
): Promise<DrugInteraction[]> {
  if (medications.length < 2) {
    return [];
  }

  const interactions: DrugInteraction[] = [];
  const checked = new Set<string>();

  // Check all unique pairs
  for (let i = 0; i < medications.length; i++) {
    const medA = medications[i];
    if (!medA.rxcui) continue;

    for (let j = i + 1; j < medications.length; j++) {
      const medB = medications[j];
      if (!medB.rxcui) continue;

      // Create a unique key for this pair to avoid duplicates
      const pairKey = [medA.rxcui, medB.rxcui].sort().join('-');
      if (checked.has(pairKey)) continue;
      checked.add(pairKey);

      const foundInteractions = await checkDrugInteraction(medA.rxcui, medB.rxcui);

      // Enhance with actual medication names
      const enhancedInteractions = foundInteractions.map(interaction => ({
        ...interaction,
        drugA: {
          ...interaction.drugA,
          name: medA.name,
        },
        drugB: {
          ...interaction.drugB,
          name: medB.name,
        },
      }));

      interactions.push(...enhancedInteractions);
    }
  }

  return interactions;
}

/**
 * Legacy function for backwards compatibility.
 * Checks for drug-drug interactions between a new medication and a list of existing ones.
 * @deprecated Use checkMedicationInteractions instead
 */
export async function checkDrugInteractions(
  newMedication: Medication,
  existingMedications: Medication[]
): Promise<InteractionWarning[]> {
  if (!newMedication.rxcui || existingMedications.length === 0) {
    return [];
  }

  const warnings: InteractionWarning[] = [];
  const existingRxcuis = existingMedications
    .map(med => med.rxcui)
    .filter((rxcui): rxcui is string => !!rxcui);

  if (existingRxcuis.length === 0) {
    return [];
  }

  const allRxcuis = [newMedication.rxcui, ...existingRxcuis];
  const interactionData = await fetchInteractions(allRxcuis);

  if (!interactionData) {
    return [];
  }

  for (const group of interactionData) {
    for (const type of group.fullInteractionType) {
      for (const interactionPair of type.interactionPair) {
        const med1Rxcui = interactionPair.interactionConcept[0].minConceptItem.rxcui;
        const med2Rxcui = interactionPair.interactionConcept[1].minConceptItem.rxcui;

        // Ensure the interaction involves the new medication
        if (med1Rxcui === newMedication.rxcui || med2Rxcui === newMedication.rxcui) {
          const med1 = allRxcuis.includes(med1Rxcui) && findMedicationByRxcui(newMedication, existingMedications, med1Rxcui);
          const med2 = allRxcuis.includes(med2Rxcui) && findMedicationByRxcui(newMedication, existingMedications, med2Rxcui);

          if (med1 && med2) {
            warnings.push({
              medication1: { name: med1.name, rxcui: med1.rxcui! },
              medication2: { name: med2.name, rxcui: med2.rxcui! },
              severity: interactionPair.severity,
              description: interactionPair.description,
            });
          }
        }
      }
    }
  }

  return warnings;
}

function findMedicationByRxcui(
  newMed: Medication,
  existingMeds: Medication[],
  rxcui: string
): Medication | undefined {
  if (newMed.rxcui === rxcui) {
    return newMed;
  }
  return existingMeds.find(med => med.rxcui === rxcui);
}
