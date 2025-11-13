/**
 * Allergy management for authenticated users via Supabase.
 */

import type { Allergy, AllergyFormData, Medication } from '@/types';
import { createClient } from '@/lib/supabase/client';
import { getCurrentUser } from '@/lib/supabase/auth';
import { getIngredients, getRelatedConcepts } from './rxnav';

/**
 * Retrieves all allergies for an authenticated user from Supabase.
 * @param userId - The authenticated user's ID
 * @returns Array of user's allergies
 * @throws Error if database query fails
 */
async function getAllergiesFromSupabase(userId: string): Promise<Allergy[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('allergies')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error loading allergies from Supabase:', error);
    throw new Error('Failed to load allergies');
  }

  return (data || []).map((allergy: any) => ({
    id: allergy.id,
    user_id: allergy.user_id,
    allergen: allergy.allergen,
    rxcui: allergy.rxcui || undefined,
    severity: allergy.severity,
    reaction: allergy.reaction || undefined,
    created_at: allergy.created_at,
    updated_at: allergy.updated_at,
  }));
}

/**
 * Adds a new allergy to Supabase.
 * @param userId - The authenticated user's ID
 * @param data - Allergy form data
 * @returns Created allergy with database-generated fields
 * @throws Error if insertion fails
 */
async function addAllergyToSupabase(
  userId: string,
  data: AllergyFormData
): Promise<Allergy> {
  const supabase = createClient();

  const { data: inserted, error } = (await supabase
    .from('allergies')
    .insert({
      user_id: userId,
      allergen: data.allergen,
      rxcui: data.rxcui || null,
      severity: data.severity,
      reaction: data.reaction || null,
    } as any)
    .select()
    .single()) as any;

  if (error) {
    console.error('Error adding allergy to Supabase:', error);
    throw new Error('Failed to add allergy');
  }

  return {
    id: inserted.id,
    user_id: inserted.user_id,
    allergen: inserted.allergen,
    rxcui: inserted.rxcui || undefined,
    severity: inserted.severity,
    reaction: inserted.reaction || undefined,
    created_at: inserted.created_at,
    updated_at: inserted.updated_at,
  };
}

/**
 * Updates an existing allergy in Supabase.
 * @param userId - The authenticated user's ID
 * @param id - Allergy ID to update
 * @param data - Partial allergy data to update
 * @returns Updated allergy
 * @throws Error if update fails
 */
async function updateAllergyInSupabase(
  userId: string,
  id: string,
  data: Partial<AllergyFormData>
): Promise<Allergy> {
  const supabase = createClient();

  const updateData: any = {};
  if (data.allergen !== undefined) updateData.allergen = data.allergen;
  if (data.rxcui !== undefined) updateData.rxcui = data.rxcui || null;
  if (data.severity !== undefined) updateData.severity = data.severity;
  if (data.reaction !== undefined) updateData.reaction = data.reaction || null;

  // Supabase type inference issue with allergies table (safe to ignore)
  const { data: updated, error } = (await supabase
    .from('allergies')
    // @ts-expect-error - Supabase type inference issue with allergies table
    .update(updateData)
    .eq('id', id)
    .eq('user_id', userId) // Security: ensure user owns this allergy
    .select()
    .single()) as any;

  if (error || !updated) {
    console.error('Error updating allergy in Supabase:', error);
    throw new Error('Failed to update allergy');
  }

  return {
    id: updated.id,
    user_id: updated.user_id,
    allergen: updated.allergen,
    rxcui: updated.rxcui || undefined,
    severity: updated.severity,
    reaction: updated.reaction || undefined,
    created_at: updated.created_at,
    updated_at: updated.updated_at,
  };
}

/**
 * Deletes an allergy from Supabase.
 * @param userId - The authenticated user's ID
 * @param id - Allergy ID to delete
 * @returns True if deletion successful
 * @throws Error if deletion fails
 */
async function deleteAllergyFromSupabase(userId: string, id: string): Promise<boolean> {
  const supabase = createClient();

  const { error } = await supabase
    .from('allergies')
    .delete()
    .eq('id', id)
    .eq('user_id', userId); // Security: ensure user owns this allergy

  if (error) {
    console.error('Error deleting allergy from Supabase:', error);
    throw new Error('Failed to delete allergy');
  }

  return true;
}

/**
 * Retrieves all allergies for authenticated user.
 * @returns Array of allergies
 * @throws Error if not authenticated
 */
export async function getAllergies(): Promise<Allergy[]> {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error('Authentication required to access allergies');
  }
  
  return getAllergiesFromSupabase(user.id);
}

/**
 * Adds a new allergy for authenticated user.
 * @param data - Allergy form data
 * @returns Created allergy
 * @throws Error if not authenticated
 */
export async function addAllergy(data: AllergyFormData): Promise<Allergy> {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error('Authentication required to add allergies');
  }
  
  return addAllergyToSupabase(user.id, data);
}

/**
 * Updates an existing allergy for authenticated user.
 * @param id - Allergy ID to update
 * @param data - Partial allergy data to update
 * @returns Updated allergy
 * @throws Error if not authenticated
 */
export async function updateAllergy(
  id: string,
  data: Partial<AllergyFormData>
): Promise<Allergy> {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error('Authentication required to update allergies');
  }
  
  return updateAllergyInSupabase(user.id, id, data);
}

/**
 * Deletes an allergy for authenticated user.
 * @param id - Allergy ID to delete
 * @returns True if deletion successful
 * @throws Error if not authenticated
 */
export async function deleteAllergy(id: string): Promise<boolean> {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error('Authentication required to delete allergies');
  }
  
  return deleteAllergyFromSupabase(user.id, id);
}

/**
 * Drug class cross-reactivity patterns for allergy checking.
 */
const ALLERGY_CROSS_REACTIVITY: { [key: string]: string[] } = {
  penicillin: [
    'amoxicillin',
    'ampicillin',
    'augmentin',
    'penicillin',
    'amoxil',
    'trimox',
  ],
  ibuprofen: [
    'ibuprofen',
    'naproxen',
    'aspirin',
    'celecoxib',
    'diclofenac',
    'flurbiprofen',
    'ansaid',
    'advil',
    'motrin',
    'aleve',
  ],
  sulfa: [
    'sulfamethoxazole',
    'trimethoprim',
    'bactrim',
    'septra',
    'sulfadiazine',
    'sulfasalazine',
    'sulfamethazine',
    'sulfa',
    'supra sulfa',
  ],
  acetaminophen: ['acetaminophen', 'tylenol', 'paracetamol'],
};

/**
 * Default severity levels for common drug allergies.
 * Used to suggest appropriate severity when adding allergies.
 */
export const DEFAULT_ALLERGY_SEVERITIES: {
  [key: string]: 'mild' | 'moderate' | 'severe' | 'anaphylaxis';
} = {
  // Penicillin allergies - often severe due to anaphylaxis risk
  penicillin: 'severe',
  'penicillin antibiotics': 'severe',
  amoxicillin: 'severe',
  ampicillin: 'severe',
  augmentin: 'severe',
  
  // Sulfa drugs - variable severity but often moderate to severe
  sulfa: 'moderate',
  'sulfa drugs': 'moderate',
  sulfamethoxazole: 'moderate',
  bactrim: 'moderate',
  
  // NSAIDs - typically moderate
  ibuprofen: 'moderate',
  naproxen: 'moderate',
  'nsaids': 'moderate',
  aspirin: 'moderate',
  
  // Others
  latex: 'severe',
  shellfish: 'severe',
  peanuts: 'anaphylaxis',
  'tree nuts': 'severe',
};

/**
 * Returns suggested severity for a given allergen name.
 * @param allergenName - The allergen name to check
 * @returns Suggested severity level
 */
export function getSuggestedAllergySeverity(
  allergenName: string
): 'mild' | 'moderate' | 'severe' | 'anaphylaxis' | null {
  const normalized = allergenName.toLowerCase().trim();
  
  // Check exact match
  if (DEFAULT_ALLERGY_SEVERITIES[normalized]) {
    return DEFAULT_ALLERGY_SEVERITIES[normalized];
  }
  
  // Check if allergen name contains any known drug class
  for (const [className, severity] of Object.entries(DEFAULT_ALLERGY_SEVERITIES)) {
    if (normalized.includes(className) || className.includes(normalized)) {
      return severity;
    }
  }
  
  return null; // No default suggestion, use form default
}

/**
 * Extracts generic name from parentheses or brackets in medication name.
 * E.g., "Advil (ibuprofen)" => "ibuprofen"
 * E.g., "Tylenol [acetaminophen]" => "acetaminophen"
 */
function extractGenericName(medicationName: string): string | null {
  const parenthesesMatch = medicationName.match(/\(([^)]+)\)/);
  if (parenthesesMatch) return parenthesesMatch[1].trim();

  const bracketsMatch = medicationName.match(/\[([^\]]+)\]/);
  if (bracketsMatch) return bracketsMatch[1].trim();

  return null;
}

/**
 * Simple string-based allergy conflict checking (synchronous).
 * Used for basic checks and testing. For comprehensive API-based checking,
 * use checkAllergyConflictsAsync.
 * 
 * @param medicationName - The medication name to check
 * @param allergies - The user's list of allergies
 * @returns Array of conflicting allergies
 */
export function checkAllergyConflicts(
  medicationName: string,
  allergies: Allergy[]
): Allergy[] {
  if (!medicationName || allergies.length === 0) {
    return [];
  }

  const conflicts: Allergy[] = [];
  const medNameLower = medicationName.toLowerCase();
  const genericName = extractGenericName(medicationName)?.toLowerCase();

  for (const allergy of allergies) {
    const allergenLower = allergy.allergen.toLowerCase();
    const allergyGeneric = extractGenericName(allergy.allergen)?.toLowerCase();

    // Direct match in medication name
    if (medNameLower.includes(allergenLower)) {
      conflicts.push(allergy);
      continue;
    }

    // Direct match in allergen with medication
    if (allergenLower.includes(medNameLower.split(' ')[0])) {
      conflicts.push(allergy);
      continue;
    }

    // Check generic name in parentheses/brackets
    if (genericName) {
      if (genericName.includes(allergenLower) || allergenLower.includes(genericName)) {
        conflicts.push(allergy);
        continue;
      }
      if (allergyGeneric && (genericName.includes(allergyGeneric) || allergyGeneric.includes(genericName))) {
        conflicts.push(allergy);
        continue;
      }
    }

    // Check allergy generic name
    if (allergyGeneric) {
      if (medNameLower.includes(allergyGeneric) || allergyGeneric.includes(medNameLower.split(' ')[0])) {
        conflicts.push(allergy);
        continue;
      }
    }

    // Check cross-reactivity patterns
    for (const [allergyClass, relatedDrugs] of Object.entries(ALLERGY_CROSS_REACTIVITY)) {
      const allergenMatchesClass = relatedDrugs.some(drug => allergenLower.includes(drug) || drug.includes(allergenLower));
      const medicationMatchesClass = relatedDrugs.some(drug => medNameLower.includes(drug));

      if (allergenMatchesClass && medicationMatchesClass) {
        conflicts.push(allergy);
        break;
      }

      // Also check generic names for cross-reactivity
      if (genericName) {
        const genericMatchesClass = relatedDrugs.some(drug => genericName.includes(drug) || drug.includes(genericName));
        if (allergenMatchesClass && genericMatchesClass) {
          conflicts.push(allergy);
          break;
        }
      }

      if (allergyGeneric) {
        const allergyGenericMatchesClass = relatedDrugs.some(drug => allergyGeneric.includes(drug) || drug.includes(allergyGeneric));
        const medicationMatchesClass = relatedDrugs.some(drug => medNameLower.includes(drug));
        if (allergyGenericMatchesClass && medicationMatchesClass) {
          conflicts.push(allergy);
          break;
        }
      }
    }
  }

  return conflicts;
}

/**
 * Checks for potential allergy conflicts using the RxNav API for cross-reactivity.
 * This is the comprehensive async version that uses the RxNav API.
 * 
 * @param medication - The medication being added.
 * @param allergies - The user's list of allergies.
 * @returns An array of conflicting allergies with detailed conflict information.
 */
export async function checkAllergyConflictsAsync(
  medication: Medication,
  allergies: Allergy[]
): Promise<{ allergy: Allergy; conflictingIngredient: string }[]> {
  if (!medication.rxcui || allergies.length === 0) {
    return [];
  }

  const conflicts: { allergy: Allergy; conflictingIngredient: string }[] = [];
  const medicationIngredients = await getIngredients(medication.rxcui);

  for (const allergy of allergies) {
    // CRITICAL: Check for exact RxCUI match first (same drug formulation)
    if (allergy.rxcui && allergy.rxcui === medication.rxcui) {
      conflicts.push({ allergy, conflictingIngredient: allergy.allergen });
      continue;
    }

    // Handle drug class allergies (e.g., "Penicillin antibiotics (drug class)")
    if (!allergy.rxcui || allergy.rxcui.startsWith('CLASS_')) {
      // Use synchronous cross-reactivity checking for drug classes
      const simpleConflicts = checkAllergyConflicts(medication.name, [allergy]);
      if (simpleConflicts.length > 0) {
        conflicts.push({ allergy, conflictingIngredient: allergy.allergen });
      }
      continue;
    }

    // Get ingredients from the allergen (if it's a drug)
    const allergenIngredients = await getIngredients(allergy.rxcui);
    
    // Check if any medication ingredients match any allergen ingredients (cross-reactivity)
    for (const medIngredientRxcui of medicationIngredients) {
      if (allergenIngredients.includes(medIngredientRxcui)) {
        // Get the ingredient name
        const relatedConcepts = await getRelatedConcepts(medIngredientRxcui, ['IN']);
        const ingredientName = relatedConcepts.find(c => c.rxcui === medIngredientRxcui)?.name || 'shared ingredient';
        
        conflicts.push({
          allergy,
          conflictingIngredient: ingredientName,
        });
        break; // Move to the next allergy once a conflict is found
      }
    }
  }

  return conflicts;
}
