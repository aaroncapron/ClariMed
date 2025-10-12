/**
 * ClariMed - Simple Type Definitions
 * 
 * Starting with the absolute basics.
 * We can add complexity later if needed.
 */

export interface Medication {
  id: string; // Simple UUID
  name: string; // e.g., "Lisinopril 10mg"
  dosage: string; // e.g., "10mg"
  frequency: string; // e.g., "Once daily"
  notes?: string; // Optional notes
  rxcui?: string; // RxNorm Concept Unique Identifier (from RxNav API)
  verified?: boolean; // Whether medication was validated via RxNav
  isMaintenance: boolean; // User-defined or auto-suggested based on drug class
  therapeuticClass?: string; // ATC code (e.g., "C10AA05" for atorvastatin)
  ingredients?: string[]; // Array of ingredient RxCUIs (for combo drugs & interaction checking)
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface MedicationFormData {
  name: string;
  dosage: string;
  frequency: string;
  notes?: string;
}
