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
 * Checks for potential allergy conflicts using the RxNav API for cross-reactivity.
 * @param medication - The medication being added.
 * @param allergies - The user's list of allergies.
 * @returns An array of conflicting allergies with detailed conflict information.
 */
export async function checkAllergyConflicts(
  medication: Medication,
  allergies: Allergy[]
): Promise<{ allergy: Allergy; conflictingIngredient: string }[]> {
  if (!medication.rxcui || allergies.length === 0) {
    return [];
  }

  const conflicts: { allergy: Allergy; conflictingIngredient: string }[] = [];
  const medicationIngredients = await getIngredients(medication.rxcui);

  for (const allergy of allergies) {
    if (!allergy.rxcui) {
      // Fallback for allergies without an RxCUI - simple string match
      if (medication.name.toLowerCase().includes(allergy.allergen.toLowerCase())) {
        conflicts.push({ allergy, conflictingIngredient: allergy.allergen });
      }
      continue;
    }

    // Get drug classes and ingredients related to the allergen
    const relatedAllergenConcepts = await getRelatedConcepts(allergy.rxcui, [
      'IN',
      'DF',
      'TC',
    ]);
    const allergenRelatedRxcuis = new Set(relatedAllergenConcepts.map(c => c.rxcui));

    // Direct match
    if (allergenRelatedRxcuis.has(medication.rxcui)) {
      conflicts.push({ allergy, conflictingIngredient: allergy.allergen });
      continue;
    }

    // Check if any medication ingredients match the allergen's related concepts
    for (const medIngredientRxcui of medicationIngredients) {
      if (allergenRelatedRxcuis.has(medIngredientRxcui)) {
        const conflictingConcept = relatedAllergenConcepts.find(
          c => c.rxcui === medIngredientRxcui
        );
        conflicts.push({
          allergy,
          conflictingIngredient: conflictingConcept?.name || allergy.allergen,
        });
        break; // Move to the next allergy once a conflict is found
      }
    }
  }

  return conflicts;
}
