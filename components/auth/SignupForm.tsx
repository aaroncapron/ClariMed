/**
 * Signup Form Component
 * 
 * Handles user registration with email/password
 * Includes validation and error handling
 */

'use client'

import { useState } from 'react'
import { signUp, validateEmail, validatePassword, validatePhone } from '@/lib/supabase/auth'
import { useRouter } from 'next/navigation'

export default function SignupForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [passwordErrors, setPasswordErrors] = useState<string[]>([])
  const [phoneError, setPhoneError] = useState<string | null>(null)

  const handlePasswordChange = (value: string) => {
    setPassword(value)
    setPasswordErrors(validatePassword(value))
  }

  const handlePhoneChange = (value: string) => {
    setPhone(value)
    // Clear error when user starts typing
    if (phoneError) setPhoneError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setPhoneError(null)
    setLoading(true)

    // Validate required fields
    if (!firstName.trim() || !lastName.trim()) {
      setError('First name and last name are required')
      setLoading(false)
      return
    }

    // Validate email
    if (!validateEmail(email)) {
      setError('Please enter a valid email address')
      setLoading(false)
      return
    }

    // Validate password
    const passwordValidationErrors = validatePassword(password)
    if (passwordValidationErrors.length > 0) {
      setError(passwordValidationErrors[0])
      setLoading(false)
      return
    }

    // Validate phone if provided
    let formattedPhone: string | undefined
    if (phone.trim()) {
      const phoneValidation = validatePhone(phone.trim())
      if (!phoneValidation.valid) {
        setPhoneError(phoneValidation.error || 'Invalid phone number')
        setLoading(false)
        return
      }
      formattedPhone = phoneValidation.formatted
    }

    try {
      const { user, error: signUpError } = await signUp({
        email,
        password,
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
        phone: formattedPhone,
      })

      if (signUpError) {
        setError(signUpError.message)
        setLoading(false)
        return
      }

      if (user) {
        // Success! Show verification message
        router.push('/auth/verify-email')
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
      setLoading(false)
    }
  }

  const passwordStrength = () => {
    if (password.length === 0) return null
    if (passwordErrors.length === 0) return 'strong'
    if (passwordErrors.length <= 2) return 'medium'
    return 'weak'
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name Fields - Side by Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
            First Name *
          </label>
          <input
            id="firstName"
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="John"
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
            Last Name *
          </label>
          <input
            id="lastName"
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Doe"
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          Email Address *
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Phone Number */}
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
          Phone Number <span className="text-gray-400">(optional)</span>
        </label>
        <input
          id="phone"
          type="tel"
          value={phone}
          onChange={(e) => handlePhoneChange(e.target.value)}
          placeholder="(555) 123-4567 or +1 555 123 4567"
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            phoneError ? 'border-red-300' : 'border-gray-300'
          }`}
        />
        {phoneError && (
          <p className="mt-1 text-sm text-red-600">{phoneError}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          US format: 10 digits, or international with +
        </p>
      </div>

      {/* Password */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
          Password *
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
            aria-label={showPassword ? 'Hide password' : 'Show password'}
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

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        {loading ? 'Creating account...' : 'Create Account'}
      </button>

      {/* Terms Notice */}
      <p className="text-xs text-gray-500 text-center">
        By signing up, you agree to our Terms of Service and Privacy Policy
      </p>
    </form>
  )
}
