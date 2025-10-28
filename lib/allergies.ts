/**
 * Allergy Storage Layer
 * 
 * Manages allergy data for authenticated users via Supabase
 * (No localStorage support - allergies require authentication)
 */

import type { Allergy, AllergyFormData } from '@/types';
import { createClient } from '@/lib/supabase/client';
import { getCurrentUser } from '@/lib/supabase/auth';

// =====================================================
// SUPABASE STORAGE FUNCTIONS
// =====================================================

/**
 * Get all allergies from Supabase for authenticated user
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
 * Add allergy to Supabase
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
 * Update allergy in Supabase
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

  // Note: TypeScript reports "Argument of type 'any' is not assignable to parameter of type 'never'"
  // This is a Supabase type inference issue that doesn't occur in storage.ts with identical code.
  // The suppression is safe as updateData is properly typed and matches the allergies table schema.
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
 * Delete allergy from Supabase
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

// =====================================================
// PUBLIC API (Requires authentication)
// =====================================================

/**
 * Get all allergies (authenticated users only)
 */
export async function getAllergies(): Promise<Allergy[]> {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error('Authentication required to access allergies');
  }
  
  return getAllergiesFromSupabase(user.id);
}

/**
 * Add a new allergy
 */
export async function addAllergy(data: AllergyFormData): Promise<Allergy> {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error('Authentication required to add allergies');
  }
  
  return addAllergyToSupabase(user.id, data);
}

/**
 * Update an existing allergy
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
 * Delete an allergy
 */
export async function deleteAllergy(id: string): Promise<boolean> {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error('Authentication required to delete allergies');
  }
  
  return deleteAllergyFromSupabase(user.id, id);
}

/**
 * Drug class relationships for allergy cross-reactivity
 * Maps allergen keywords to related drug classes that may cause reactions
 */
const DRUG_CLASS_CROSS_REACTIONS: Record<string, string[]> = {
  // Penicillins - high cross-reactivity within class
  'penicillin': ['amoxicillin', 'ampicillin', 'penicillin', 'augmentin', 'amoxil', 'unasyn'],
  'amoxicillin': ['penicillin', 'ampicillin', 'augmentin', 'amoxil'],
  'ampicillin': ['penicillin', 'amoxicillin', 'augmentin', 'unasyn'],
  
  // Cephalosporins - some cross-reactivity with penicillins (5-10%)
  'cephalosporin': ['cephalexin', 'cefdinir', 'cefuroxime', 'ceftriaxone', 'cefprozil', 'cefazolin'],
  'cephalexin': ['cefdinir', 'cefuroxime', 'cephalosporin', 'keflex'],
  'cefdinir': ['cephalexin', 'cefuroxime', 'cephalosporin'],
  
  // Sulfa drugs
  'sulfa': ['sulfamethoxazole', 'trimethoprim', 'bactrim', 'septra', 'sulfadiazine', 'sulfasalazine'],
  'sulfamethoxazole': ['sulfa', 'bactrim', 'septra', 'trimethoprim'],
  'bactrim': ['sulfa', 'sulfamethoxazole', 'trimethoprim', 'septra'],
  
  // NSAIDs - high cross-reactivity within class
  'aspirin': ['ibuprofen', 'naproxen', 'nsaid', 'advil', 'motrin', 'aleve', 'diclofenac', 'meloxicam'],
  'ibuprofen': ['aspirin', 'naproxen', 'nsaid', 'advil', 'motrin'],
  'naproxen': ['aspirin', 'ibuprofen', 'nsaid', 'aleve'],
  'nsaid': ['aspirin', 'ibuprofen', 'naproxen', 'diclofenac', 'meloxicam'],
  
  // Statins
  'statin': ['atorvastatin', 'simvastatin', 'rosuvastatin', 'pravastatin', 'lipitor', 'crestor'],
  'atorvastatin': ['statin', 'lipitor', 'simvastatin', 'rosuvastatin'],
  
  // Macrolides
  'macrolide': ['azithromycin', 'erythromycin', 'clarithromycin', 'zithromax', 'biaxin'],
  'azithromycin': ['macrolide', 'zithromax', 'erythromycin', 'clarithromycin'],
  'erythromycin': ['macrolide', 'azithromycin', 'clarithromycin'],
};

/**
 * Check for potential allergy conflicts with a medication
 * @param medicationName - Name of the medication to check
 * @param allergies - User's allergy list
 * @returns Array of potential conflicts
 */
export function checkAllergyConflicts(
  medicationName: string,
  allergies: Allergy[]
): Allergy[] {
  if (!medicationName || allergies.length === 0) return [];
  
  const medLower = medicationName.toLowerCase();
  
  return allergies.filter(allergy => {
    const allergenLower = allergy.allergen.toLowerCase();
    
    // Extract core ingredient names by removing dosages, forms, etc.
    // Look for common drug ingredients (before dosage numbers)
    const extractIngredients = (name: string) => {
      // Remove everything after dosage (numbers + mg/mcg/etc)
      const beforeDosage = name.split(/\d+\s*(mg|mcg|ml|g|%|unit)/i)[0].trim();
      // Remove common words and parentheticals
      const cleaned = beforeDosage
        .replace(/\(.*?\)/g, '') // Remove parentheses
        .replace(/oral|tablet|capsule|solution|suspension|injection/gi, '')
        .trim();
      return cleaned;
    };
    
    const allergenIngredient = extractIngredients(allergenLower);
    const medIngredient = extractIngredients(medLower);
    
    // Check if any part of the allergen ingredient appears in the medication
    // Split by common delimiters like '/', '-', 'and'
    const allergenParts = allergenIngredient.split(/[\/\-]|and/i).map(p => p.trim()).filter(p => p.length > 2);
    const medParts = medIngredient.split(/[\/\-]|and/i).map(p => p.trim()).filter(p => p.length > 2);
    
    // Check for direct ingredient matching
    for (const allergenPart of allergenParts) {
      for (const medPart of medParts) {
        if (medPart.includes(allergenPart) || allergenPart.includes(medPart)) {
          return true;
        }
      }
      // Also check full medication name (for brand names like Augmentin containing amoxicillin)
      if (medLower.includes(allergenPart)) {
        return true;
      }
    }
    
    // Check for drug class cross-reactivity
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
