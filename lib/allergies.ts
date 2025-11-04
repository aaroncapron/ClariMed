/**
 * Allergy management for authenticated users via Supabase.
 */

import type { Allergy, AllergyFormData } from '@/types';
import { createClient } from '@/lib/supabase/client';
import { getCurrentUser } from '@/lib/supabase/auth';

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
 * Drug class cross-reactivity mappings for allergy checking.
 * Maps allergen keywords to related drugs that may cause reactions.
 */
const DRUG_CLASS_CROSS_REACTIONS: Record<string, string[]> = {
  'penicillin': ['amoxicillin', 'ampicillin', 'penicillin', 'augmentin', 'amoxil', 'unasyn'],
  'amoxicillin': ['penicillin', 'ampicillin', 'augmentin', 'amoxil'],
  'ampicillin': ['penicillin', 'amoxicillin', 'augmentin', 'unasyn'],
  'cephalosporin': ['cephalexin', 'cefdinir', 'cefuroxime', 'ceftriaxone', 'cefprozil', 'cefazolin'],
  'cephalexin': ['cefdinir', 'cefuroxime', 'cephalosporin', 'keflex'],
  'cefdinir': ['cephalexin', 'cefuroxime', 'cephalosporin'],
  'sulfa': ['sulfamethoxazole', 'trimethoprim', 'bactrim', 'septra', 'sulfadiazine', 'sulfasalazine'],
  'sulfamethoxazole': ['sulfa', 'bactrim', 'septra', 'trimethoprim'],
  'bactrim': ['sulfa', 'sulfamethoxazole', 'trimethoprim', 'septra'],
  'aspirin': ['ibuprofen', 'naproxen', 'nsaid', 'advil', 'motrin', 'aleve', 'diclofenac', 'meloxicam', 'flurbiprofen', 'ansaid'],
  'ibuprofen': ['aspirin', 'naproxen', 'nsaid', 'advil', 'motrin', 'flurbiprofen'],
  'naproxen': ['aspirin', 'ibuprofen', 'nsaid', 'aleve', 'flurbiprofen'],
  'flurbiprofen': ['aspirin', 'ibuprofen', 'naproxen', 'nsaid', 'ansaid'],
  'ansaid': ['aspirin', 'ibuprofen', 'naproxen', 'nsaid', 'flurbiprofen'],
  'nsaid': ['aspirin', 'ibuprofen', 'naproxen', 'diclofenac', 'meloxicam', 'flurbiprofen', 'ansaid'],
  'statin': ['atorvastatin', 'simvastatin', 'rosuvastatin', 'pravastatin', 'lipitor', 'crestor'],
  'atorvastatin': ['statin', 'lipitor', 'simvastatin', 'rosuvastatin'],
  'macrolide': ['azithromycin', 'erythromycin', 'clarithromycin', 'zithromax', 'biaxin'],
  'azithromycin': ['macrolide', 'zithromax', 'erythromycin', 'clarithromycin'],
  'erythromycin': ['macrolide', 'azithromycin', 'clarithromycin'],
};

/**
 * Checks medication for potential allergy conflicts.
 * @param medicationName - Name of medication to check
 * @param allergies - User's allergy list
 * @returns Array of conflicting allergies
 */
export function checkAllergyConflicts(
  medicationName: string,
  allergies: Allergy[]
): Allergy[] {
  if (!medicationName || allergies.length === 0) return [];
  
  const medLower = medicationName.toLowerCase();
  
  return allergies.filter(allergy => {
    const allergenLower = allergy.allergen.toLowerCase();
    
    const extractIngredients = (name: string) => {
      const beforeDosage = name.split(/\d+\s*(mg|mcg|ml|g|%|unit)/i)[0].trim();
      
      // Extract text from both parentheses () and brackets []
      // Example: Handles "Ansaid (flurbiprofen)" and "Supra Sulfa [sulfamethazine]"
      const extractedContent: string[] = [];
      
      // Extract from parentheses
      const parenthesesMatches = beforeDosage.match(/\(([^)]+)\)/g);
      if (parenthesesMatches) {
        parenthesesMatches.forEach(match => {
          const content = match.replace(/[()]/g, '').trim();
          if (content) extractedContent.push(content);
        });
      }
      
      // Extract from brackets
      const bracketMatches = beforeDosage.match(/\[([^\]]+)\]/g);
      if (bracketMatches) {
        bracketMatches.forEach(match => {
          const content = match.replace(/[\[\]]/g, '').trim();
          if (content) extractedContent.push(content);
        });
      }
      
      // Remove parentheses, brackets, and form descriptions from main text
      const withoutEnclosures = beforeDosage
        .replace(/\(.*?\)/g, '')
        .replace(/\[.*?\]/g, '')
        .replace(/oral|tablet|capsule|solution|suspension|injection/gi, '')
        .trim();
      
      // Combine all parts: main text + content from parentheses + content from brackets
      const allParts = [withoutEnclosures, ...extractedContent].join(' ');
      return allParts;
    };
    
    const allergenIngredient = extractIngredients(allergenLower);
    const medIngredient = extractIngredients(medLower);
    
    const allergenParts = allergenIngredient.split(/[\/\-\s]|and/i).map(p => p.trim()).filter(p => p.length > 2);
    const medParts = medIngredient.split(/[\/\-\s]|and/i).map(p => p.trim()).filter(p => p.length > 2);
    
    for (const allergenPart of allergenParts) {
      for (const medPart of medParts) {
        if (medPart.includes(allergenPart) || allergenPart.includes(medPart)) {
          return true;
        }
      }
      if (medLower.includes(allergenPart)) {
        return true;
      }
    }
    
    for (const allergenPart of allergenParts) {
      const crossReactiveClasses = DRUG_CLASS_CROSS_REACTIONS[allergenPart];
      if (crossReactiveClasses) {
        for (const relatedDrug of crossReactiveClasses) {
          if (medLower.includes(relatedDrug)) {
            return true;
          }
        }
      }
    }
    
    return false;
  });
}
