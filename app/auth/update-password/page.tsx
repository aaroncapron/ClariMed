/**
 * Update Password Page
 * 
 * Handles password updates after user clicks reset link
 */

'use client'

import { useState, useEffect } from 'react'
import { updatePassword, validatePassword } from '@/lib/supabase/auth'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function UpdatePasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [passwordErrors, setPasswordErrors] = useState<string[]>([])
  const [hasRecoveryToken, setHasRecoveryToken] = useState(false)

  useEffect(() => {
    // Check if user has a valid recovery token
    const checkRecoveryToken = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      // User should have a session from the recovery link
      if (session) {
        setHasRecoveryToken(true)
      }
    }

    checkRecoveryToken()
  }, [])

  const handlePasswordChange = (value: string) => {
    setPassword(value)
    setPasswordErrors(validatePassword(value))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    // Validate password
    const passwordValidationErrors = validatePassword(password)
    if (passwordValidationErrors.length > 0) {
      setError(passwordValidationErrors[0])
      setLoading(false)
      return
    }

    // Check passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    const { error: updateError } = await updatePassword(password)

    if (updateError) {
      setError(updateError.message)
      setLoading(false)
    } else {
      // Success! Redirect to login
      router.push('/auth/login?reset=success')
    }
  }

  const passwordStrength = () => {
    if (password.length === 0) return null
    if (passwordErrors.length === 0) return 'strong'
    if (passwordErrors.length <= 2) return 'medium'
    return 'weak'
  }

  if (!hasRecoveryToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-blue-600 mb-2">ClariMed</h1>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">⚠️</span>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-3">Invalid or Expired Link</h2>
            
            <p className="text-gray-600 mb-6">
              This password reset link is invalid or has expired. Please request a new one.
            </p>

            <Link
              href="/auth/reset-password"
              className="inline-block bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition"
            >
              Request New Link
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-600 mb-2">ClariMed</h1>
          <p className="text-gray-600">Set your new password</p>
        </div>

        {/* Update Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Reset Password</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* New Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 text-sm"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {password.length > 0 && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-2">
                    <div className={`h-1 flex-1 rounded ${
                      passwordStrength() === 'weak' ? 'bg-red-500' : 
                      passwordStrength() === 'medium' ? 'bg-yellow-500' : 
                      passwordStrength() === 'strong' ? 'bg-green-500' : 
                      'bg-gray-200'
                    }`} />
                    <div className={`h-1 flex-1 rounded ${
                      passwordStrength() === 'medium' ? 'bg-yellow-500' : 
                      passwordStrength() === 'strong' ? 'bg-green-500' : 
                      'bg-gray-200'
                    }`} />
                    <div className={`h-1 flex-1 rounded ${
                      passwordStrength() === 'strong' ? 'bg-green-500' : 
                      'bg-gray-200'
                    }`} />
                  </div>
                  {passwordErrors.length > 0 && (
                    <ul className="text-xs text-gray-600 space-y-1">
                      {passwordErrors.map((err, idx) => (
                        <li key={idx} className="flex items-start gap-1">
                          <span className="text-red-500 mt-0.5">✗</span>
                          {err}
                        </li>
                      ))}
                    </ul>
                  )}
                  {passwordErrors.length === 0 && (
                    <p className="text-xs text-green-600 flex items-center gap-1">
                      <span>✓</span>
                      Strong password!
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {confirmPassword && password !== confirmPassword && (
                <p className="mt-1 text-xs text-red-600">Passwords do not match</p>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || passwordErrors.length > 0 || password !== confirmPassword}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
