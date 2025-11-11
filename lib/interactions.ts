/**
 * Drug interaction checking using RxNav Interaction API.
 * Provides informational warnings only - not medical advice.
 * Users should always consult healthcare providers.
 * 
 * @see https://lhncbc.nlm.nih.gov/RxNav/APIs/InteractionAPIs.html
 */

import type { Medication } from '@/types';
import { getIngredients, checkInteractions as fetchInteractions } from './rxnav';

export interface InteractionWarning {
  medication1: { name: string; rxcui: string };
  medication2: { name: string; rxcui: string };
  severity: 'high' | 'moderate' | 'low' | 'N/A';
  description: string;
}

/**
 * Checks for drug-drug interactions between a new medication and a list of existing ones.
 * @param newMedication The medication being added.
 * @param existingMedications The list of medications the user is already taking.
 * @returns A promise that resolves to an array of interaction warnings.
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
