export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      allergies: {
        Row: {
          id: string
          user_id: string
          allergen: string
          rxcui: string | null
          severity: 'mild' | 'moderate' | 'severe' | 'anaphylaxis' | null
          reaction: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          allergen: string
          rxcui?: string | null
          severity?: 'mild' | 'moderate' | 'severe' | 'anaphylaxis' | null
          reaction?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          allergen?: string
          rxcui?: string | null
          severity?: 'mild' | 'moderate' | 'severe' | 'anaphylaxis' | null
          reaction?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      medications: {
        Row: {
          id: string
          user_id: string
          name: string
          frequency: string
          notes: string | null
          rxcui: string | null
          verified: boolean
          is_maintenance: boolean
          therapeutic_class: string | null
          ingredients: string[] | null
          created_at: string
          updated_at: string
          quantity: string | null
          refills_remaining: number | null
          total_refills: number | null
          last_fill_date: string | null
          next_refill_date: string | null
          last_pickup_date: string | null
          estimated_next_pickup: string | null
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          frequency: string
          notes?: string | null
          rxcui?: string | null
          verified?: boolean
          is_maintenance?: boolean
          therapeutic_class?: string | null
          ingredients?: string[] | null
          created_at?: string
          updated_at?: string
          quantity?: string | null
          refills_remaining?: number | null
          total_refills?: number | null
          last_fill_date?: string | null
          next_refill_date?: string | null
          last_pickup_date?: string | null
          estimated_next_pickup?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          frequency?: string
          notes?: string | null
          rxcui?: string | null
          verified?: boolean
          is_maintenance?: boolean
          therapeutic_class?: string | null
          ingredients?: string[] | null
          created_at?: string
          updated_at?: string
          quantity?: string | null
          refills_remaining?: number | null
          total_refills?: number | null
          last_fill_date?: string | null
          next_refill_date?: string | null
          last_pickup_date?: string | null
          estimated_next_pickup?: string | null
        }
      }
      health_conditions: {
        Row: {
          id: string
          user_id: string
          condition: string
          category: string
          diagnosed_date: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          condition: string
          category: string
          diagnosed_date?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          condition?: string
          category?: string
          diagnosed_date?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          email: string
          date_of_birth: string | null
          preferred_pharmacy: string | null
          preferred_pharmacy_location: Json | null
          created_at: string
          updated_at: string
          migration_completed: boolean
          migration_completed_at: string | null
          migration_skipped: boolean
          first_name: string | null
          last_name: string | null
          phone: string | null
        }
        Insert: {
          id: string
          email: string
          date_of_birth?: string | null
          preferred_pharmacy?: string | null
          preferred_pharmacy_location?: Json | null
          created_at?: string
          updated_at?: string
          migration_completed?: boolean
          migration_completed_at?: string | null
          migration_skipped?: boolean
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
        }
        Update: {
          id?: string
          email?: string
          date_of_birth?: string | null
          preferred_pharmacy?: string | null
          preferred_pharmacy_location?: Json | null
          created_at?: string
          updated_at?: string
          migration_completed?: boolean
          migration_completed_at?: string | null
          migration_skipped?: boolean
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
        }
      }
    }
    Views: { [_ in never]: never }
    Functions: { [_ in never]: never }
    Enums: { [_ in never]: never }
  }
}
