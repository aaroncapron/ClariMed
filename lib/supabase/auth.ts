/**
 * Authentication Helper Functions
 * 
 * Provides easy-to-use functions for common auth operations:
 * - Sign up
 * - Sign in
 * - Sign out
 * - Password reset
 * - Get current user
 */

import { createClient } from './client'
import type { User } from '@supabase/supabase-js'

export interface SignUpData {
  email: string
  password: string
  firstName?: string
  lastName?: string
  phone?: string
  fullName?: string // Legacy support
}

export interface SignInData {
  email: string
  password: string
}

export interface AuthError {
  message: string
  code?: string
}

export interface AuthResult {
  user?: User | null
  error?: AuthError | null
}

/**
 * Sign up a new user
 */
export async function signUp({ email, password, firstName, lastName, phone, fullName }: SignUpData): Promise<AuthResult> {
  const supabase = createClient()

  // Build the full name for metadata (legacy support)
  const displayName = fullName || (firstName && lastName ? `${firstName} ${lastName}` : firstName || '')

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: displayName,
        first_name: firstName,
        last_name: lastName,
        phone: phone,
      },
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  })

  if (error) {
    return { error: { message: error.message, code: error.code } }
  }

  // Create user profile after successful signup
  if (data.user) {
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        id: data.user.id,
        email: data.user.email!,
        first_name: firstName || null,
        last_name: lastName || null,
        phone: phone || null,
        full_name: displayName || null, // Keep for backward compatibility
      } as any) // Type assertion needed until database is fully synced

    if (profileError) {
      console.error('Error creating user profile:', profileError)
      // Don't fail signup if profile creation fails
    }
  }

  return { user: data.user }
}

/**
 * Sign in an existing user
 */
export async function signIn({ email, password }: SignInData): Promise<AuthResult> {
  const supabase = createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: { message: error.message, code: error.code } }
  }

  return { user: data.user }
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<{ error?: AuthError }> {
  const supabase = createClient()

  const { error } = await supabase.auth.signOut()

  if (error) {
    return { error: { message: error.message, code: error.code } }
  }

  return {}
}

/**
 * Send password reset email
 */
export async function resetPassword(email: string): Promise<{ error?: AuthError }> {
  const supabase = createClient()

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  })

  if (error) {
    return { error: { message: error.message, code: error.code } }
  }

  return {}
}

/**
 * Update user password
 */
export async function updatePassword(newPassword: string): Promise<{ error?: AuthError }> {
  const supabase = createClient()

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  })

  if (error) {
    return { error: { message: error.message, code: error.code } }
  }

  return {}
}

/**
 * Get the current user
 */
export async function getCurrentUser(): Promise<User | null> {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()

  return user
}

/**
 * Get the current session
 */
export async function getSession() {
  const supabase = createClient()

  const { data: { session } } = await supabase.auth.getSession()

  return session
}

/**
 * Validate password strength
 * Returns an array of error messages, or empty array if valid
 */
export function validatePassword(password: string): string[] {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number')
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push('Password must contain at least one special character')
  }

  return errors
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate phone number format
 * Accepts various formats and returns normalized E.164 format if valid
 */
export function validatePhone(phone: string): { valid: boolean; formatted?: string; error?: string } {
  // Remove all non-digit characters except + at the start
  const cleaned = phone.replace(/[^\d+]/g, '')
  
  // Must start with + or be 10 digits (US format)
  if (cleaned.startsWith('+')) {
    // International format (E.164)
    if (cleaned.length >= 11 && cleaned.length <= 15) {
      return { valid: true, formatted: cleaned }
    }
    return { valid: false, error: 'Invalid international phone number format' }
  } else if (cleaned.length === 10) {
    // US format without country code
    return { valid: true, formatted: `+1${cleaned}` }
  } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
    // US format with leading 1
    return { valid: true, formatted: `+${cleaned}` }
  }
  
  return { valid: false, error: 'Phone must be 10 digits or start with +' }
}
