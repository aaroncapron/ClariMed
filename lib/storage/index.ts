/**
 * Medication storage layer for Supabase.
 * All storage operations now require authentication.
 * 
 * This is the main entry point for all medication storage operations.
 * Components should import from this file, not the individual storage modules.
 */

import type { Medication } from '@/types';
import { getCurrentUser } from '@/lib/supabase/auth';

// Import storage backend
import {
  getMedicationsFromSupabase,
  addMedicationToSupabase,
  updateMedicationInSupabase,
  deleteMedicationFromSupabase,
} from './supabase';

/**
 * Retrieves all medications for the authenticated user.
 * @returns Array of medications
 * @throws Error if user is not authenticated
 */
export async function getMedications(): Promise<Medication[]> {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error('Authentication required');
  }
  
  return getMedicationsFromSupabase(user.id);
}

/**
 * Adds a new medication for the authenticated user.
 * @param data - Medication data without id and timestamps
 * @returns The created medication
 * @throws Error if user is not authenticated
 */
export async function addMedication(
  data: Omit<Medication, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Medication> {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error('Authentication required');
  }
  
  return addMedicationToSupabase(user.id, data);
}

/**
 * Updates an existing medication for the authenticated user.
 * @param id - Medication ID to update
 * @param data - Partial medication data to update
 * @returns Updated medication
 * @throws Error if user is not authenticated or medication not found
 */
export async function updateMedication(
  id: string,
  data: Partial<Omit<Medication, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<Medication | null> {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error('Authentication required');
  }
  
  return updateMedicationInSupabase(user.id, id, data);
}

/**
 * Deletes a medication for the authenticated user.
 * @param id - Medication ID to delete
 * @returns True if deletion successful
 * @throws Error if user is not authenticated
 */
export async function deleteMedication(id: string): Promise<boolean> {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error('Authentication required');
  }
  
  return deleteMedicationFromSupabase(user.id, id);
}

