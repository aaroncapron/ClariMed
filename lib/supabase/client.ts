/**
 * Supabase Client Configuration
 * 
 * This file sets up the Supabase client for use in client-side components.
 * For server-side usage (API routes, Server Components), use server.ts instead.
 */

import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './database.types'

/**
 * Creates a Supabase client for client-side usage
 * This client is safe to use in React components and client-side code
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
