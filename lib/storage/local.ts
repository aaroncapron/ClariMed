/**
 * Browser localStorage medication storage operations.
 * Used for guest users who are not authenticated.
 */

import type { Medication } from '@/types';

const STORAGE_KEY = 'clarimed_medications';

/**
 * Retrieves all medications from browser localStorage.
 * @returns Array of medications from localStorage
 */
export function getMedicationsFromLocalStorage(): Medication[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const medications = JSON.parse(stored);
    
    // Migrate old medications that don't have new fields
    return medications.map((med: any) => ({
      ...med,
      // Ensure all required fields exist
      quantity: med.quantity ?? '',
      isMaintenance: med.isMaintenance ?? false,
      therapeuticClass: med.therapeuticClass ?? undefined,
      ingredients: med.ingredients ?? undefined,
      refills_remaining: med.refills_remaining ?? undefined,
      total_refills: med.total_refills ?? undefined,
      last_fill_date: med.last_fill_date ?? undefined,
      next_refill_date: med.next_refill_date ?? undefined,
      last_pickup_date: med.last_pickup_date ?? undefined,
      estimated_next_pickup: med.estimated_next_pickup ?? undefined,
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
export function saveMedicationsToLocalStorage(medications: Medication[]): void {
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
export function addMedicationToLocalStorage(
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
export function updateMedicationInLocalStorage(
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
export function deleteMedicationFromLocalStorage(id: string): boolean {
  const medications = getMedicationsFromLocalStorage();
  const filtered = medications.filter(med => med.id !== id);
  
  if (filtered.length === medications.length) return false;
  
  saveMedicationsToLocalStorage(filtered);
  return true;
}

/**
 * Clears all medication data from browser localStorage.
 */
export function clearLocalStorage(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}
