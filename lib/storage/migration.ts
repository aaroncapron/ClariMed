/**
 * Medication data migration from localStorage to Supabase.
 * Handles migration workflow for users transitioning from guest to authenticated.
 */

import type { Medication } from '@/types';
import { createClient } from '@/lib/supabase/client';
import { getMedicationsFromLocalStorage, clearLocalStorage } from './local';

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
      quantity: med.quantity || null,
      frequency: med.frequency,
      notes: med.notes || null,
      rxcui: med.rxcui || null,
      verified: med.verified || false,
      is_maintenance: med.isMaintenance || false,
      therapeutic_class: med.therapeuticClass || null,
      ingredients: med.ingredients || null,
      refills_remaining: med.refills_remaining !== undefined ? med.refills_remaining : null,
      total_refills: med.total_refills !== undefined ? med.total_refills : null,
      last_fill_date: med.last_fill_date || null,
      next_refill_date: med.next_refill_date || null,
      last_pickup_date: med.last_pickup_date || null,
      estimated_next_pickup: med.estimated_next_pickup || null,
    }));

    const { error } = await supabase
      .from('medications')
      .insert(medicationsToInsert as any);

    if (error) {
      console.error('Error migrating medications:', error);
      return { success: false, imported: 0, error: error.message };
    }

    // Mark migration as complete in user profile
    const updateData: any = {
      migration_completed: true,
      migration_completed_at: new Date().toISOString(),
    };
    await ((supabase.from('user_profiles') as any)
      .update(updateData)
      .eq('id', userId)) as any;

    // Clear localStorage after successful migration
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
 * Allows users to opt out of migration process.
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
 * Gets medications from localStorage for migration preview.
 * Allows users to see what data will be migrated.
 * @returns Array of medications from localStorage
 */
export function getLocalStorageMedications(): Medication[] {
  return getMedicationsFromLocalStorage();
}
