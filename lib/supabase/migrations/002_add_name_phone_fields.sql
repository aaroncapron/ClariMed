-- ClariMed Database Schema Migration
-- Created: October 23, 2025
-- Purpose: Add first_name, last_name, and phone fields to user_profiles

-- =====================================================
-- 1. Add new columns to user_profiles
-- =====================================================
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS first_name TEXT,
  ADD COLUMN IF NOT EXISTS last_name TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT;

-- =====================================================
-- 2. Migrate existing full_name data
-- =====================================================
-- This will attempt to split existing full_name into first_name and last_name
-- For users who already signed up with full_name
UPDATE user_profiles
SET 
  first_name = SPLIT_PART(full_name, ' ', 1),
  last_name = CASE 
    WHEN full_name LIKE '% %' THEN TRIM(SUBSTRING(full_name FROM POSITION(' ' IN full_name) + 1))
    ELSE NULL
  END
WHERE full_name IS NOT NULL AND first_name IS NULL;

-- =====================================================
-- 3. Add comments for documentation
-- =====================================================
COMMENT ON COLUMN user_profiles.first_name IS 'User first name (preferred over full_name)';
COMMENT ON COLUMN user_profiles.last_name IS 'User last name (preferred over full_name)';
COMMENT ON COLUMN user_profiles.phone IS 'User phone number in E.164 format (e.g., +12025551234)';

-- Note: We keep full_name for backward compatibility and as a fallback
COMMENT ON COLUMN user_profiles.full_name IS 'Legacy field - use first_name/last_name instead';
