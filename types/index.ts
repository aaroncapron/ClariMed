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
  frequency: string; // Directions for use (e.g., "Take 1 tablet by mouth once daily", "Split tablet in half, take twice weekly")
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

export type AllergySeverity = 'mild' | 'moderate' | 'severe' | 'anaphylaxis';

export interface Allergy {
  id: string; // UUID
  user_id: string; // Foreign key to auth.users
  allergen: string; // Name of allergen (e.g., "Penicillin", "Sulfa drugs")
  rxcui?: string; // RxNorm Concept Unique Identifier (if medication)
  severity: AllergySeverity; // Severity level
  reaction?: string; // Description of reaction (e.g., "Hives", "Difficulty breathing")
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
}

export interface AllergyFormData {
  allergen: string;
  rxcui?: string;
  severity: AllergySeverity;
  reaction?: string;
}
