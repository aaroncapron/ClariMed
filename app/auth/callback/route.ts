/**
 * Auth Callback Route
 * 
 * Handles the callback from Supabase after email verification
 * or other auth actions (password reset, magic links, etc.)
 */

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    await supabase.auth.exchangeCodeForSession(code)
  }

  // Redirect to home page after successful verification
  return NextResponse.redirect(new URL('/', requestUrl.origin))
}
