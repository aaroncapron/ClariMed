/**
 * Drug interaction checking using RxNav Interaction API.
 * Provides informational warnings only - not medical advice.
 * Users should always consult healthcare providers.
 * 
 * @see https://lhncbc.nlm.nih.gov/RxNav/APIs/InteractionAPIs.html
 */

import type { Medication } from '@/types';

const RXNAV_BASE_URL = 'https://rxnav.nlm.nih.gov/REST';

export type InteractionSeverity = 'critical' | 'major' | 'moderate' | 'minor' | 'unknown';

export interface DrugInteraction {
  drugA: {
    name: string;
    rxcui: string;
  };
  drugB: {
    name: string;
    rxcui: string;
  };
  severity: InteractionSeverity;
  description: string;
  source: string;
}

interface RxNavInteractionConcept {
  minConceptItem: {
    rxcui: string;
    name: string;
    tty: string;
  };
  sourceConceptItem: {
    id: string;
    name: string;
    url: string;
  };
}

interface RxNavInteractionPair {
  interactionConcept: RxNavInteractionConcept[];
  severity: string;
  description: string;
}

interface RxNavInteractionResponse {
  nlmDisclaimer: string;
  userInput: {
    sources: string[];
    rxcuis: string[];
  };
  fullInteractionTypeGroup?: Array<{
    sourceDisclaimer: string;
    sourceName: string;
    fullInteractionType: Array<{
      comment: string;
      minConcept: Array<{
        rxcui: string;
        name: string;
        tty: string;
      }>;
      interactionPair: RxNavInteractionPair[];
    }>;
  }>;
}

/**
 * Maps RxNav severity strings to our standardized severity levels.
 */
export function mapSeverity(rxnavSeverity: string): InteractionSeverity {
  const severity = rxnavSeverity.toLowerCase();
  
  if (severity.includes('contraindicated') || severity.includes('critical')) {
    return 'critical';
  }
  if (severity.includes('major') || severity.includes('high')) {
    return 'major';
  }
  if (severity.includes('moderate')) {
    return 'moderate';
  }
  if (severity.includes('minor') || severity.includes('low')) {
    return 'minor';
  }
  
  return 'unknown';
}

/**
 * Checks for drug interactions between two medications using RxNav API.
 * Returns empty array if no interactions or if API call fails.
 */
export async function checkDrugInteraction(
  rxcuiA: string,
  rxcuiB: string
): Promise<DrugInteraction[]> {
  if (!rxcuiA || !rxcuiB) {
    return [];
  }

  try {
    const url = `${RXNAV_BASE_URL}/interaction/interaction.json?rxcui=${rxcuiA}&sources=DrugBank`;
    const response = await fetch(url);
    
    if (!response.ok) {
      return [];
    }

    const data: RxNavInteractionResponse = await response.json();
    
    if (!data.fullInteractionTypeGroup) {
      return [];
    }

    const interactions: DrugInteraction[] = [];

    for (const group of data.fullInteractionTypeGroup) {
      for (const interactionType of group.fullInteractionType) {
        for (const pair of interactionType.interactionPair) {
          const interactingDrug = pair.interactionConcept.find(
            (concept) => concept.minConceptItem.rxcui === rxcuiB
          );

          if (interactingDrug) {
            const drugA = interactionType.minConcept[0];
            
            interactions.push({
              drugA: {
                name: drugA.name,
                rxcui: drugA.rxcui,
              },
              drugB: {
                name: interactingDrug.minConceptItem.name,
                rxcui: interactingDrug.minConceptItem.rxcui,
              },
              severity: mapSeverity(pair.severity),
              description: pair.description,
              source: group.sourceName,
            });
          }
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
 * Checks for interactions between a new medication and existing medications.
 * This is informational only and does not constitute medical advice.
 */
export async function checkMedicationInteractions(
  newMedication: { name: string; rxcui?: string },
  existingMedications: Medication[]
): Promise<DrugInteraction[]> {
  if (!newMedication.rxcui) {
    return [];
  }

  const medsWithRxcui = existingMedications.filter((med) => med.rxcui);
  
  if (medsWithRxcui.length === 0) {
    return [];
  }

  const interactionChecks = medsWithRxcui.map((med) =>
    checkDrugInteraction(newMedication.rxcui!, med.rxcui!)
  );

  const results = await Promise.all(interactionChecks);
  return results.flat();
}

/**
 * Checks all interactions within a list of medications.
 * Returns all unique interaction pairs found.
 */
export async function checkAllInteractions(
  medications: Medication[]
): Promise<DrugInteraction[]> {
  const medsWithRxcui = medications.filter((med) => med.rxcui);
  
  if (medsWithRxcui.length < 2) {
    return [];
  }

  const interactions: DrugInteraction[] = [];
  const checkedPairs = new Set<string>();

  for (let i = 0; i < medsWithRxcui.length; i++) {
    for (let j = i + 1; j < medsWithRxcui.length; j++) {
      const medA = medsWithRxcui[i];
      const medB = medsWithRxcui[j];
      
      const pairKey = [medA.rxcui, medB.rxcui].sort().join('-');
      
      if (!checkedPairs.has(pairKey)) {
        checkedPairs.add(pairKey);
        const results = await checkDrugInteraction(medA.rxcui!, medB.rxcui!);
        interactions.push(...results);
      }
    }
  }

  return interactions;
}

/**
 * Gets severity badge configuration for UI display.
 */
export function getSeverityBadge(severity: InteractionSeverity): {
  color: string;
  label: string;
} {
  switch (severity) {
    case 'critical':
      return { color: 'bg-red-100 text-red-800 border-red-300', label: 'Critical' };
    case 'major':
      return { color: 'bg-orange-100 text-orange-800 border-orange-300', label: 'Major' };
    case 'moderate':
      return { color: 'bg-yellow-100 text-yellow-800 border-yellow-300', label: 'Moderate' };
    case 'minor':
      return { color: 'bg-blue-100 text-blue-800 border-blue-300', label: 'Minor' };
    default:
      return { color: 'bg-gray-100 text-gray-800 border-gray-300', label: 'Unknown' };
  }
}
