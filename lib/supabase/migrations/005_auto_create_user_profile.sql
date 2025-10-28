-- ClariMed Database Schema Migration
-- Created: October 28, 2025
-- Purpose: Automatically create user_profiles when new auth.users are created

-- =====================================================
-- 1. First, ensure first_name and last_name columns exist
-- =====================================================
-- This is from migration 002, but we'll ensure it's applied
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS first_name TEXT,
  ADD COLUMN IF NOT EXISTS last_name TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT;

-- =====================================================
-- 2. Drop full_name column if it exists
-- =====================================================
ALTER TABLE user_profiles
  DROP COLUMN IF EXISTS full_name;

-- =====================================================
-- 3. Create function to handle new user creation
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, first_name, last_name, phone)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    NEW.raw_user_meta_data->>'phone'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 4. Create trigger on auth.users
-- =====================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- 5. Backfill existing users who don't have profiles
-- =====================================================
INSERT INTO public.user_profiles (id, email, first_name, last_name, phone)
SELECT 
  u.id,
  u.email,
  u.raw_user_meta_data->>'first_name' as first_name,
  u.raw_user_meta_data->>'last_name' as last_name,
  u.raw_user_meta_data->>'phone' as phone
FROM auth.users u
LEFT JOIN public.user_profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- =====================================================
-- 6. Verification
-- =====================================================
-- After running this migration:
-- - All existing auth.users should have corresponding user_profiles
-- - New signups will automatically create user_profiles
-- - User metadata (first_name, last_name, phone) will be synced from auth.users
-- - full_name column has been removed
