/**
 * Simple localStorage wrapper for medications
 * 
 * No encryption, no IndexedDB complexity.
 * Just JSON in localStorage to start.
 * We can upgrade this later if needed.
 */

import type { Medication } from '@/types';

const STORAGE_KEY = 'clarimed_medications';

/**
 * Get all medications from localStorage
 */
export function getMedications(): Medication[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const medications = JSON.parse(stored);
    
    // Migrate old medications that don't have isMaintenance field
    return medications.map((med: any) => ({
      ...med,
      isMaintenance: med.isMaintenance ?? false, // Default to false if not set
      therapeuticClass: med.therapeuticClass ?? undefined,
      ingredients: med.ingredients ?? undefined,
    }));
  } catch (error) {
    console.error('Error loading medications:', error);
    return [];
  }
}

/**
 * Save medications to localStorage
 */
export function saveMedications(medications: Medication[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(medications));
  } catch (error) {
    console.error('Error saving medications:', error);
    throw new Error('Failed to save medications');
  }
}

/**
 * Add a new medication
 */
export function addMedication(
  data: Omit<Medication, 'id' | 'createdAt' | 'updatedAt'>
): Medication {
  const medications = getMedications();
  
  const newMedication: Medication = {
    ...data,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  medications.push(newMedication);
  saveMedications(medications);
  
  return newMedication;
}

/**
 * Update an existing medication
 */
export function updateMedication(
  id: string,
  data: Partial<Omit<Medication, 'id' | 'createdAt' | 'updatedAt'>>
): Medication | null {
  const medications = getMedications();
  const index = medications.findIndex(med => med.id === id);
  
  if (index === -1) return null;
  
  medications[index] = {
    ...medications[index],
    ...data,
    updatedAt: new Date().toISOString(),
  };
  
  saveMedications(medications);
  return medications[index];
}

/**
 * Delete a medication
 */
export function deleteMedication(id: string): boolean {
  const medications = getMedications();
  const filtered = medications.filter(med => med.id !== id);
  
  if (filtered.length === medications.length) return false;
  
  saveMedications(filtered);
  return true;
}

/**
 * Clear all medications (useful for testing)
 */
export function clearAllMedications(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}
