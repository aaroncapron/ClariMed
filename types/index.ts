/**
 * ClariMed - Simple Type Definitions
 * 
 * Starting with the absolute basics.
 * We can add complexity later if needed.
 */

export interface Medication {
  id: string; // Simple UUID
  name: string; // e.g., "Lisinopril 10 MG Oral Tablet" (includes strength from RxNav)
  quantity: string; // Quantity dispensed (e.g., "30 tablets", "1 patch box", "90 capsules")
  frequency: string; // Directions for use (e.g., "Take 1 tablet by mouth once daily", "Split tablet in half, take twice weekly")
  notes?: string; // Optional notes
  rxcui?: string; // RxNorm Concept Unique Identifier (from RxNav API)
  verified?: boolean; // Whether medication was validated via RxNav
  isMaintenance: boolean; // User-defined or auto-suggested based on drug class
  therapeuticClass?: string; // ATC code (e.g., "C10AA05" for atorvastatin)
  ingredients?: string[]; // Array of ingredient RxCUIs (for combo drugs & interaction checking)
  
  // Refill tracking
  refills_remaining?: number; // How many refills left (null if not tracked)
  total_refills?: number; // Total refills authorized (for reference)
  last_fill_date?: string; // ISO date string - when last filled/picked up
  next_refill_date?: string; // ISO date string - estimated date for next refill
  
  // Pickup tracking
  last_pickup_date?: string; // ISO date string - actual pickup date
  estimated_next_pickup?: string; // ISO date string - estimated next pickup based on supply
  
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface MedicationFormData {
  name: string;
  quantity: string;
  frequency: string;
  notes?: string;
  refills_remaining?: number;
  total_refills?: number;
  last_fill_date?: string;
  last_pickup_date?: string;
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

export type HealthConditionCategory = 
  | 'cardiovascular'
  | 'respiratory'
  | 'endocrine'
  | 'gastrointestinal'
  | 'renal'
  | 'hepatic'
  | 'neurological'
  | 'pregnancy'
  | 'other';

export interface HealthCondition {
  id: string; // UUID
  user_id: string; // Foreign key to auth.users
  condition: string; // Name of condition (e.g., "Pregnancy", "Hypertension", "Diabetes")
  rxcui?: string; // Add RxCUI for API-based checks
  category: HealthConditionCategory;
  diagnosed_date?: string; // ISO date string
  notes?: string; // Additional context
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface HealthConditionFormData {
  condition: string;
  category: HealthConditionCategory;
  diagnosed_date?: string;
  notes?: string;
}

/**
 * User Preferences
 */
export type ViewMode = 'clinical' | 'clarity';

export interface UserPreferences {
  id: string; // UUID
  user_id: string; // Foreign key to auth.users
  view_mode: ViewMode; // 'clinical' = show all DUR checks, interactions, technical details | 'clarity' = simplified view
  show_refill_reminders: boolean; // Show low refill warnings
  show_pickup_reminders: boolean; // Show upcoming pickup date reminders
  refill_reminder_threshold: number; // Show warning when refills <= this number (default: 1)
  pickup_reminder_days: number; // Show warning when pickup date is within this many days (default: 3)
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
}

export interface UserPreferencesFormData {
  view_mode: ViewMode;
  show_refill_reminders?: boolean;
  show_pickup_reminders?: boolean;
  refill_reminder_threshold?: number;
  pickup_reminder_days?: number;
}
