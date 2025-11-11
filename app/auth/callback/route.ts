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
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')

  // Handle explicit errors from Supabase
  if (error) {
    console.error('Auth callback error:', error, errorDescription)
    
    // Create user-friendly error messages
    let userMessage = 'Authentication failed. Please try again.'
    
    if (errorDescription?.includes('expired') || error === 'expired_token') {
      userMessage = 'This verification link has expired. Please request a new one.'
    } else if (errorDescription?.includes('invalid') || error === 'invalid_request') {
      userMessage = 'This verification link is invalid or has already been used. Please request a new one.'
    } else if (errorDescription) {
      // Use the error description if available
      userMessage = errorDescription
    }
    
    // Redirect to login with error message
    const loginUrl = new URL('/auth/login', requestUrl.origin)
    loginUrl.searchParams.set('error', userMessage)
    return NextResponse.redirect(loginUrl)
  }

  if (code) {
    const supabase = await createClient()
    
    try {
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
      
      if (exchangeError) {
        console.error('Error exchanging code for session:', exchangeError)
        
        // Handle specific exchange errors
        let userMessage = 'Unable to complete verification. Please try again.'
        
        if (exchangeError.message?.includes('expired')) {
          userMessage = 'This verification link has expired. Please request a new one.'
        } else if (exchangeError.message?.includes('invalid')) {
          userMessage = 'This verification link is invalid or has already been used.'
        }
        
        const loginUrl = new URL('/auth/login', requestUrl.origin)
        loginUrl.searchParams.set('error', userMessage)
        return NextResponse.redirect(loginUrl)
      }
      
      // Successful verification - redirect to home page
      return NextResponse.redirect(new URL('/', requestUrl.origin))
    } catch (err) {
      console.error('Unexpected error during code exchange:', err)
      
      const loginUrl = new URL('/auth/login', requestUrl.origin)
      loginUrl.searchParams.set('error', 'An unexpected error occurred. Please try logging in again.')
      return NextResponse.redirect(loginUrl)
    }
  }

  // No code provided - redirect to login
  const loginUrl = new URL('/auth/login', requestUrl.origin)
  loginUrl.searchParams.set('error', 'Invalid authentication request.')
  return NextResponse.redirect(loginUrl)
}
