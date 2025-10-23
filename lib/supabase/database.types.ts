/**
 * Database Type Definitions
 * 
 * These types are generated from your Supabase database schema.
 * To regenerate: npx supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/supabase/database.types.ts
 * 
 * For now, we'll define them manually based on our schema.
 */

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
      user_profiles: {
        Row: {
          id: string
          email: string
          first_name: string | null
          last_name: string | null
          phone: string | null
          full_name: string | null // Legacy field
          date_of_birth: string | null
          preferred_pharmacy: string | null
          preferred_pharmacy_location: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          full_name?: string | null
          date_of_birth?: string | null
          preferred_pharmacy?: string | null
          preferred_pharmacy_location?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          full_name?: string | null
          date_of_birth?: string | null
          preferred_pharmacy?: string | null
          preferred_pharmacy_location?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
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
          dosage: string
          frequency: string
          notes: string | null
          rxcui: string | null
          verified: boolean
          is_maintenance: boolean
          therapeutic_class: string | null
          ingredients: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          dosage: string
          frequency: string
          notes?: string | null
          rxcui?: string | null
          verified?: boolean
          is_maintenance?: boolean
          therapeutic_class?: string | null
          ingredients?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          dosage?: string
          frequency?: string
          notes?: string | null
          rxcui?: string | null
          verified?: boolean
          is_maintenance?: boolean
          therapeutic_class?: string | null
          ingredients?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
