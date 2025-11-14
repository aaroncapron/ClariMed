/**
 * Database row types matching Supabase schema.
 */

export interface MedicationRow {
  id: string;
  user_id: string;
  name: string;
  quantity: string | null;
  frequency: string;
  notes: string | null;
  rxcui: string | null;
  verified: boolean;
  is_maintenance: boolean;
  therapeutic_class: string | null;
  ingredients: string | null;
  refills_remaining: number | null;
  total_refills: number | null;
  next_refill_date: string | null;
  last_pickup_date: string | null;
  estimated_next_pickup: string | null;
  created_at: string;
  updated_at: string;
}

export interface AllergyRow {
  id: string;
  user_id: string;
  allergy: string;
  category: string;
  severity: string | null;
  reaction: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface HealthConditionRow {
  id: string;
  user_id: string;
  condition: string;
  category: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserProfileRow {
  id: string;
  migration_completed: boolean;
  migration_skipped: boolean;
  pickup_reminder_days: number;
  created_at: string;
  updated_at: string;
}
