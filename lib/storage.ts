/**
 * Medication storage layer with automatic routing.
 * Routes to Supabase for authenticated users or localStorage for guests.
 * Handles data migration between storage backends.
 */

import type { Medication } from '@/types';
import { createClient } from '@/lib/supabase/client';
import { getCurrentUser } from '@/lib/supabase/auth';

const STORAGE_KEY = 'clarimed_medications';

/**
 * Retrieves all medications for an authenticated user from Supabase.
 * @param userId - The authenticated user's ID
 * @returns Array of medications
 * @throws Error if database query fails
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
 * Adds a new medication to Supabase for an authenticated user.
 * @param userId - The authenticated user's ID
 * @param data - Medication data without id and timestamps
 * @returns The created medication with database-generated fields
 * @throws Error if insertion fails
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
 * Updates an existing medication in Supabase.
 * @param userId - The authenticated user's ID
 * @param id - Medication ID to update
 * @param data - Partial medication data to update
 * @returns Updated medication
 * @throws Error if update fails or medication not found
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

  const { data: updated, error } = (await (supabase
    .from('medications') as any)
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
 * Deletes a medication from Supabase.
 * @param userId - The authenticated user's ID
 * @param id - Medication ID to delete
 * @returns True if deletion successful
 * @throws Error if deletion fails
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

/**
 * Retrieves all medications from browser localStorage.
 * Used for guest users who are not authenticated.
 * @returns Array of medications from localStorage
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
 * Saves medication array to browser localStorage.
 * @param medications - Array of medications to save
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
 * Adds a new medication to localStorage.
 * @param data - Medication data without id and timestamps
 * @returns The created medication with generated id
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
 * Updates an existing medication in localStorage.
 * @param id - Medication ID to update
 * @param data - Partial medication data to update
 * @returns Updated medication or null if not found
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
 * Deletes a medication from localStorage.
 * @param id - Medication ID to delete
 * @returns True if deletion successful, false if not found
 */
function deleteMedicationFromLocalStorage(id: string): boolean {
  const medications = getMedicationsFromLocalStorage();
  const filtered = medications.filter(med => med.id !== id);
  
  if (filtered.length === medications.length) return false;
  
  saveMedicationsToLocalStorage(filtered);
  return true;
}

/**
 * Retrieves all medications, automatically routing to appropriate storage backend.
 * @returns Array of medications
 */
export async function getMedications(): Promise<Medication[]> {
  const user = await getCurrentUser();
  
  if (user) {
    return getMedicationsFromSupabase(user.id);
  } else {
    return getMedicationsFromLocalStorage();
  }
}

/**
 * Adds a new medication, automatically routing to appropriate storage backend.
 * @param data - Medication data without id and timestamps
 * @returns The created medication
 */
export async function addMedication(
  data: Omit<Medication, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Medication> {
  const user = await getCurrentUser();
  
  if (user) {
    return addMedicationToSupabase(user.id, data);
  } else {
    return addMedicationToLocalStorage(data);
  }
}

/**
 * Updates an existing medication, automatically routing to appropriate storage backend.
 * @param id - Medication ID to update
 * @param data - Partial medication data to update
 * @returns Updated medication or null if not found
 */
export async function updateMedication(
  id: string,
  data: Partial<Omit<Medication, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<Medication | null> {
  const user = await getCurrentUser();
  
  if (user) {
    return updateMedicationInSupabase(user.id, id, data);
  } else {
    return updateMedicationInLocalStorage(id, data);
  }
}

/**
 * Deletes a medication, automatically routing to appropriate storage backend.
 * @param id - Medication ID to delete
 * @returns True if deletion successful
 */
export async function deleteMedication(id: string): Promise<boolean> {
  const user = await getCurrentUser();
  
  if (user) {
    return deleteMedicationFromSupabase(user.id, id);
  } else {
    return deleteMedicationFromLocalStorage(id);
  }
}

/**
 * Checks if user has localStorage medications that need migration to Supabase.
 * @param userId - The authenticated user's ID
 * @returns Object indicating if migration is needed and medication count
 */
export async function checkMigrationNeeded(userId: string): Promise<{
  needed: boolean;
  count: number;
}> {
  const supabase = createClient();
  const { data: profile } = (await supabase
    .from('user_profiles')
    .select('migration_completed, migration_skipped')
    .eq('id', userId)
    .single()) as any;

  if (profile?.migration_completed || profile?.migration_skipped) {
    return { needed: false, count: 0 };
  }

  const localMeds = getMedicationsFromLocalStorage();
  
  return {
    needed: localMeds.length > 0,
    count: localMeds.length,
  };
}

/**
 * Migrates all localStorage medications to Supabase for an authenticated user.
 * Clears localStorage after successful migration.
 * @param userId - The authenticated user's ID
 * @returns Object with success status, import count, and optional error message
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

    const updateData: any = {
      migration_completed: true,
      migration_completed_at: new Date().toISOString(),
    };
    await ((supabase.from('user_profiles') as any)
      .update(updateData)
      .eq('id', userId)) as any;

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
 * Marks migration as skipped in user profile.
 * @param userId - The authenticated user's ID
 */
export async function skipMigration(userId: string): Promise<void> {
  const supabase = createClient();
  const updateData: any = { migration_skipped: true };
  await ((supabase.from('user_profiles') as any)
    .update(updateData)
    .eq('id', userId)) as any;
}

/**
 * Clears all medication data from browser localStorage.
 */
export function clearLocalStorage(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Gets medications from localStorage for migration preview.
 * @returns Array of medications from localStorage
 */
export function getLocalStorageMedications(): Medication[] {
  return getMedicationsFromLocalStorage();
}

/**
 * @deprecated Use clearLocalStorage instead
 */
export function clearAllMedications(): void {
  clearLocalStorage();
}
