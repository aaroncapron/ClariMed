/**
 * Unified Storage Layer for Medications
 * 
 * Automatically routes to appropriate storage:
 * - Authenticated users: Supabase (cloud sync)
 * - Guest users: localStorage (device only)
 * 
 * Handles migration from localStorage to Supabase
 */

import type { Medication } from '@/types';
import { createClient } from '@/lib/supabase/client';
import { getCurrentUser } from '@/lib/supabase/auth';

const STORAGE_KEY = 'clarimed_medications';

// =====================================================
// SUPABASE STORAGE FUNCTIONS (Authenticated Users)
// =====================================================

/**
 * Get medications from Supabase for authenticated user
 */
async function getMedicationsFromSupabase(userId: string): Promise<Medication[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('medications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error loading medications from Supabase:', error);
    throw new Error('Failed to load medications');
  }

  // Map database fields to frontend format
  return (data || []).map((med: any) => ({
    id: med.id,
    name: med.name,
    dosage: med.dosage,
    frequency: med.frequency,
    notes: med.notes || undefined,
    rxcui: med.rxcui || undefined,
    verified: med.verified || false,
    isMaintenance: med.is_maintenance || false,
    therapeuticClass: med.therapeutic_class || undefined,
    ingredients: med.ingredients || undefined,
    createdAt: med.created_at,
    updatedAt: med.updated_at,
  }));
}

/**
 * Add medication to Supabase
 */
async function addMedicationToSupabase(
  userId: string,
  data: Omit<Medication, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Medication> {
  const supabase = createClient();

  const { data: inserted, error } = await supabase
    .from('medications')
    .insert({
      user_id: userId,
      name: data.name,
      dosage: data.dosage,
      frequency: data.frequency,
      notes: data.notes || null,
      rxcui: data.rxcui || null,
      verified: data.verified || false,
      is_maintenance: data.isMaintenance || false,
      therapeutic_class: data.therapeuticClass || null,
      ingredients: data.ingredients || null,
    } as any)
    .select()
    .single();

  if (error) {
    console.error('Error adding medication to Supabase:', error);
    throw new Error('Failed to add medication');
  }

  const med: any = inserted;
  return {
    id: med.id,
    name: med.name,
    dosage: med.dosage,
    frequency: med.frequency,
    notes: med.notes || undefined,
    rxcui: med.rxcui || undefined,
    verified: med.verified || false,
    isMaintenance: med.is_maintenance || false,
    therapeuticClass: med.therapeutic_class || undefined,
    ingredients: med.ingredients || undefined,
    createdAt: med.created_at,
    updatedAt: med.updated_at,
  };
}

/**
 * Update medication in Supabase
 */
async function updateMedicationInSupabase(
  userId: string,
  id: string,
  data: Partial<Omit<Medication, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<Medication> {
  const supabase = createClient();

  const updateData: any = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.dosage !== undefined) updateData.dosage = data.dosage;
  if (data.frequency !== undefined) updateData.frequency = data.frequency;
  if (data.notes !== undefined) updateData.notes = data.notes || null;
  if (data.rxcui !== undefined) updateData.rxcui = data.rxcui || null;
  if (data.verified !== undefined) updateData.verified = data.verified;
  if (data.isMaintenance !== undefined) updateData.is_maintenance = data.isMaintenance;
  if (data.therapeuticClass !== undefined) updateData.therapeutic_class = data.therapeuticClass || null;
  if (data.ingredients !== undefined) updateData.ingredients = data.ingredients || null;

  const { data: updated, error } = (await supabase
    .from('medications')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', userId) // Security: ensure user owns this medication
    .select()
    .single()) as any;

  if (error) {
    console.error('Error updating medication in Supabase:', error);
    throw new Error('Failed to update medication');
  }

  const med: any = updated;
  return {
    id: med.id,
    name: med.name,
    dosage: med.dosage,
    frequency: med.frequency,
    notes: med.notes || undefined,
    rxcui: med.rxcui || undefined,
    verified: med.verified || false,
    isMaintenance: med.is_maintenance || false,
    therapeuticClass: med.therapeutic_class || undefined,
    ingredients: med.ingredients || undefined,
    createdAt: med.created_at,
    updatedAt: med.updated_at,
  };
}

/**
 * Delete medication from Supabase
 */
async function deleteMedicationFromSupabase(userId: string, id: string): Promise<boolean> {
  const supabase = createClient();

  const { error } = await supabase
    .from('medications')
    .delete()
    .eq('id', id)
    .eq('user_id', userId); // Security: ensure user owns this medication

  if (error) {
    console.error('Error deleting medication from Supabase:', error);
    throw new Error('Failed to delete medication');
  }

  return true;
}

// =====================================================
// LOCALSTORAGE FUNCTIONS (Guest Users)
// =====================================================

/**
 * Get all medications from localStorage
 */
function getMedicationsFromLocalStorage(): Medication[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const medications = JSON.parse(stored);
    
    // Migrate old medications that don't have isMaintenance field
    return medications.map((med: any) => ({
      ...med,
      isMaintenance: med.isMaintenance ?? false,
      therapeuticClass: med.therapeuticClass ?? undefined,
      ingredients: med.ingredients ?? undefined,
    }));
  } catch (error) {
    console.error('Error loading medications from localStorage:', error);
    return [];
  }
}

/**
 * Save medications to localStorage
 */
function saveMedicationsToLocalStorage(medications: Medication[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(medications));
  } catch (error) {
    console.error('Error saving medications to localStorage:', error);
    throw new Error('Failed to save medications');
  }
}

/**
 * Add medication to localStorage
 */
function addMedicationToLocalStorage(
  data: Omit<Medication, 'id' | 'createdAt' | 'updatedAt'>
): Medication {
  const medications = getMedicationsFromLocalStorage();
  
  const newMedication: Medication = {
    ...data,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  medications.push(newMedication);
  saveMedicationsToLocalStorage(medications);
  
  return newMedication;
}

/**
 * Update medication in localStorage
 */
function updateMedicationInLocalStorage(
  id: string,
  data: Partial<Omit<Medication, 'id' | 'createdAt' | 'updatedAt'>>
): Medication | null {
  const medications = getMedicationsFromLocalStorage();
  const index = medications.findIndex(med => med.id === id);
  
  if (index === -1) return null;
  
  medications[index] = {
    ...medications[index],
    ...data,
    updatedAt: new Date().toISOString(),
  };
  
  saveMedicationsToLocalStorage(medications);
  return medications[index];
}

/**
 * Delete medication from localStorage
 */
function deleteMedicationFromLocalStorage(id: string): boolean {
  const medications = getMedicationsFromLocalStorage();
  const filtered = medications.filter(med => med.id !== id);
  
  if (filtered.length === medications.length) return false;
  
  saveMedicationsToLocalStorage(filtered);
  return true;
}

// =====================================================
// PUBLIC API (Auto-routes to correct storage)
// =====================================================

/**
 * Get all medications (routes to Supabase or localStorage based on auth)
 */
export async function getMedications(): Promise<Medication[]> {
  const user = await getCurrentUser();
  
  if (user) {
    // Authenticated user → Use Supabase
    return getMedicationsFromSupabase(user.id);
  } else {
    // Guest user → Use localStorage
    return getMedicationsFromLocalStorage();
  }
}

/**
 * Add a new medication
 */
export async function addMedication(
  data: Omit<Medication, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Medication> {
  const user = await getCurrentUser();
  
  if (user) {
    // Authenticated user → Save to Supabase
    return addMedicationToSupabase(user.id, data);
  } else {
    // Guest user → Save to localStorage
    return addMedicationToLocalStorage(data);
  }
}

/**
 * Update an existing medication
 */
export async function updateMedication(
  id: string,
  data: Partial<Omit<Medication, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<Medication | null> {
  const user = await getCurrentUser();
  
  if (user) {
    // Authenticated user → Update in Supabase
    return updateMedicationInSupabase(user.id, id, data);
  } else {
    // Guest user → Update in localStorage
    return updateMedicationInLocalStorage(id, data);
  }
}

/**
 * Delete a medication
 */
export async function deleteMedication(id: string): Promise<boolean> {
  const user = await getCurrentUser();
  
  if (user) {
    // Authenticated user → Delete from Supabase
    return deleteMedicationFromSupabase(user.id, id);
  } else {
    // Guest user → Delete from localStorage
    return deleteMedicationFromLocalStorage(id);
  }
}

// =====================================================
// MIGRATION UTILITIES
// =====================================================

/**
 * Check if user needs to migrate from localStorage to Supabase
 */
export async function checkMigrationNeeded(userId: string): Promise<{
  needed: boolean;
  count: number;
}> {
  // Check if user has already migrated or skipped
  const supabase = createClient();
  const { data: profile } = (await supabase
    .from('user_profiles')
    .select('migration_completed, migration_skipped')
    .eq('id', userId)
    .single()) as any;

  if (profile?.migration_completed || profile?.migration_skipped) {
    return { needed: false, count: 0 };
  }

  // Check if localStorage has medications
  const localMeds = getMedicationsFromLocalStorage();
  
  return {
    needed: localMeds.length > 0,
    count: localMeds.length,
  };
}

/**
 * Migrate medications from localStorage to Supabase
 */
export async function migrateMedicationsToSupabase(userId: string): Promise<{
  success: boolean;
  imported: number;
  error?: string;
}> {
  try {
    const localMeds = getMedicationsFromLocalStorage();
    
    if (localMeds.length === 0) {
      return { success: true, imported: 0 };
    }

    // Import all medications to Supabase
    const supabase = createClient();
    const medicationsToInsert = localMeds.map(med => ({
      user_id: userId,
      name: med.name,
      dosage: med.dosage,
      frequency: med.frequency,
      notes: med.notes || null,
      rxcui: med.rxcui || null,
      verified: med.verified || false,
      is_maintenance: med.isMaintenance || false,
      therapeutic_class: med.therapeuticClass || null,
      ingredients: med.ingredients || null,
    }));

    const { error } = await supabase
      .from('medications')
      .insert(medicationsToInsert as any);

    if (error) {
      console.error('Error migrating medications:', error);
      return { success: false, imported: 0, error: error.message };
    }

    // Mark migration as complete
    const updateData: any = {
      migration_completed: true,
      migration_completed_at: new Date().toISOString(),
    };
    await (supabase
      .from('user_profiles')
      .update(updateData)
      .eq('id', userId)) as any;

    // Clear localStorage
    clearLocalStorage();

    return { success: true, imported: localMeds.length };
  } catch (error) {
    console.error('Migration error:', error);
    return {
      success: false,
      imported: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Mark migration as skipped (user chose not to import)
 */
export async function skipMigration(userId: string): Promise<void> {
  const supabase = createClient();
  const updateData: any = { migration_skipped: true };
  await (supabase
    .from('user_profiles')
    .update(updateData)
    .eq('id', userId)) as any;
}

/**
 * Clear localStorage medications (used after successful migration)
 */
export function clearLocalStorage(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Get localStorage medications (for migration preview)
 */
export function getLocalStorageMedications(): Medication[] {
  return getMedicationsFromLocalStorage();
}

/**
 * Clear all medications (useful for testing)
 * @deprecated Use clearLocalStorage instead
 */
export function clearAllMedications(): void {
  clearLocalStorage();
}
