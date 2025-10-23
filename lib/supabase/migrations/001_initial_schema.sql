-- ClariMed Database Schema Migration
-- Created: October 23, 2025
-- Purpose: Set up authentication and core data tables

-- =====================================================
-- 1. Enable UUID extension (if not already enabled)
-- =====================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 2. User Profiles Table
-- =====================================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  date_of_birth DATE,
  preferred_pharmacy TEXT,
  preferred_pharmacy_location JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- =====================================================
-- 3. Allergies Table
-- =====================================================
CREATE TABLE IF NOT EXISTS allergies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  allergen TEXT NOT NULL,
  rxcui TEXT,
  severity TEXT CHECK (severity IN ('mild', 'moderate', 'severe', 'anaphylaxis')),
  reaction TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE allergies ENABLE ROW LEVEL SECURITY;

-- RLS Policies for allergies
CREATE POLICY "Users can view own allergies"
  ON allergies FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own allergies"
  ON allergies FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own allergies"
  ON allergies FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own allergies"
  ON allergies FOR DELETE
  USING (auth.uid() = user_id);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_allergies_user_id ON allergies(user_id);

-- =====================================================
-- 4. Medications Table
-- =====================================================
CREATE TABLE IF NOT EXISTS medications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  frequency TEXT NOT NULL,
  notes TEXT,
  rxcui TEXT,
  verified BOOLEAN DEFAULT FALSE,
  is_maintenance BOOLEAN DEFAULT FALSE,
  therapeutic_class TEXT,
  ingredients TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for medications
CREATE POLICY "Users can view own medications"
  ON medications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own medications"
  ON medications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own medications"
  ON medications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own medications"
  ON medications FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_medications_user_id ON medications(user_id);
CREATE INDEX IF NOT EXISTS idx_medications_created_at ON medications(created_at DESC);

-- =====================================================
-- 5. Updated_at Trigger Function
-- =====================================================
-- This function automatically updates the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_allergies_updated_at
  BEFORE UPDATE ON allergies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medications_updated_at
  BEFORE UPDATE ON medications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 6. Comments for Documentation
-- =====================================================
COMMENT ON TABLE user_profiles IS 'User profile information and preferences';
COMMENT ON TABLE allergies IS 'User-reported allergies (medications, food, environmental)';
COMMENT ON TABLE medications IS 'User medications with dosage and frequency information';

COMMENT ON COLUMN medications.rxcui IS 'RxNorm Concept Unique Identifier from NIH RxNav API';
COMMENT ON COLUMN medications.verified IS 'Whether medication was validated against RxNorm database';
COMMENT ON COLUMN medications.is_maintenance IS 'Whether this is a maintenance medication taken regularly';
COMMENT ON COLUMN medications.therapeutic_class IS 'ATC classification code for drug categorization';
COMMENT ON COLUMN medications.ingredients IS 'Array of ingredient RxCUIs for combo drugs';
