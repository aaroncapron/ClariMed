/**
 * Medication storage layer with automatic routing.
 * Routes to Supabase for authenticated users or localStorage for guests.
 * Handles data migration between storage backends.
 * 
 * This is the main entry point for all medication storage operations.
 * Components should import from this file, not the individual storage modules.
 */

import type { Medication } from '@/types';
import { getCurrentUser } from '@/lib/supabase/auth';

// Import storage backends
import {
  getMedicationsFromSupabase,
  addMedicationToSupabase,
  updateMedicationInSupabase,
  deleteMedicationFromSupabase,
} from './supabase';

import {
  getMedicationsFromLocalStorage,
  addMedicationToLocalStorage,
  updateMedicationInLocalStorage,
  deleteMedicationFromLocalStorage,
  clearLocalStorage,
} from './local';

// Re-export migration functions
export {
  checkMigrationNeeded,
  migrateMedicationsToSupabase,
  skipMigration,
  getLocalStorageMedications,
} from './migration';

// Re-export localStorage clear function
export { clearLocalStorage };

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
 * @deprecated Use clearLocalStorage instead
 */
export function clearAllMedications(): void {
  clearLocalStorage();
}
