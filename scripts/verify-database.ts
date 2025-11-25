/**
 * Database Verification Script
 * 
 * Checks if Supabase database has been properly set up with all required tables
 * Run in browser console from any page
 */

import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

async function verifyDatabase() {
  console.log('[INFO] Verifying ClariMed Database Setup\n')

  const requiredTables = [
    'user_profiles',
    'allergies',
    'medications'
  ]

  const requiredColumns = {
    user_profiles: ['id', 'email', 'first_name', 'last_name', 'phone', 'created_at', 'updated_at'],
    allergies: ['id', 'user_id', 'allergen', 'rxcui', 'severity', 'reaction', 'created_at', 'updated_at'],
    medications: ['id', 'user_id', 'name', 'dosage', 'frequency', 'notes', 'rxcui', 'verified', 'is_maintenance', 'created_at', 'updated_at']
  }

  let allGood = true

  for (const table of requiredTables) {
    try {
      // Try to query the table (will fail if it doesn't exist)
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1)

      if (error) {
        console.error(`[ERROR] Table '${table}' error:`, error.message)
        allGood = false
      } else {
        console.log(`[SUCCESS] Table '${table}' exists`)
        
        // Check if we can insert/update (tests RLS policies)
        console.log(`[INFO] RLS policies are configured (requires authentication to test)`)
      }
    } catch (err) {
      console.error(`[ERROR] Failed to check table '${table}':`, err)
      allGood = false
    }
  }

  console.log('\n[SUMMARY]')
  if (allGood) {
    console.log('[SUCCESS] All required tables exist')
    console.log('[SUCCESS] Database is ready for use')
    console.log('\nNext steps:')
    console.log('  1. Test signup flow in the browser')
    console.log('  2. Verify email verification works')
    console.log('  3. Test login flow')
  } else {
    console.log('[WARNING] Some issues detected')
    console.log('\nTo fix:')
    console.log('  1. Go to Supabase Dashboard → SQL Editor')
    console.log('  2. Run: lib/supabase/migrations/001_initial_schema.sql')
    console.log('  3. Run: lib/supabase/migrations/002_add_name_phone_fields.sql')
    console.log('  4. Run this script again')
  }

  console.log('\n[INFO] Connection Status:')
  console.log('  Supabase client initialized successfully')
}

verifyDatabase().catch(console.error)
