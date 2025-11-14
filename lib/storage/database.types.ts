/**
 * Database row types aligned with current Supabase schema.
 */

export interface MedicationRow {
  id: string;
  user_id: string;
  name: string;
  frequency: string;
  notes: string | null;
  rxcui: string | null;
  verified: boolean;
  is_maintenance: boolean;
  therapeutic_class: string | null;
  ingredients: string[] | null;
  created_at: string;
  updated_at: string;
  quantity: string | null;
  refills_remaining: number | null;
  total_refills: number | null;
  last_fill_date: string | null;
  next_refill_date: string | null;
  last_pickup_date: string | null;
  estimated_next_pickup: string | null;
}

export interface AllergyRow {
  id: string;
  user_id: string;
  allergen: string;
  rxcui: string | null;
  severity: string | null;
  reaction: string | null;
  created_at: string;
  updated_at: string;
}

export interface HealthConditionRow {
  id: string;
  user_id: string;
  condition: string;
  category: string;
  diagnosed_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserProfileRow {
  id: string;
  email: string;
  date_of_birth: string | null;
  preferred_pharmacy: string | null;
  preferred_pharmacy_location: unknown | null;
  created_at: string;
  updated_at: string;
  migration_completed: boolean;
  migration_completed_at: string | null;
  migration_skipped: boolean;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
}
