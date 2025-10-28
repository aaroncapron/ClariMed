-- ClariMed Database Schema Migration
-- Created: October 24, 2025
-- Purpose: Add migration tracking to prevent cross-user data contamination

-- =====================================================
-- 1. Add migration tracking fields to user_profiles
-- =====================================================
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS migration_completed BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS migration_completed_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS migration_skipped BOOLEAN DEFAULT FALSE;

-- =====================================================
-- 2. Add indexes for migration queries
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_user_profiles_migration_completed 
  ON user_profiles(migration_completed);

-- =====================================================
-- 3. Add comments for documentation
-- =====================================================
COMMENT ON COLUMN user_profiles.migration_completed IS 'Whether user has completed localStorage to Supabase migration';
COMMENT ON COLUMN user_profiles.migration_completed_at IS 'Timestamp when migration was completed';
COMMENT ON COLUMN user_profiles.migration_skipped IS 'Whether user chose to skip migration (dont ask again)';
