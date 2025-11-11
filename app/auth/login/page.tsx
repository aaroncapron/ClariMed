/**
 * Login Page
 * 
 * User authentication page
 */

'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import LoginForm from '@/components/auth/LoginForm'
import { Suspense } from 'react'

function LoginContent() {
  const searchParams = useSearchParams()
  const resetSuccess = searchParams.get('reset') === 'success'
  const error = searchParams.get('error')

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Branding */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-600 mb-2">ClariMed</h1>
          <p className="text-gray-600">Welcome back!</p>
        </div>

        {/* Success Message */}
        {resetSuccess && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-700 flex items-center gap-2">
              <span className="text-lg">✓</span>
              Password updated successfully! You can now log in with your new password.
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-700 flex items-start gap-2">
              <span className="text-lg flex-shrink-0">⚠</span>
              <span>{error}</span>
            </p>
          </div>
        )}

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign in</h2>
          <p className="text-gray-600 mb-6">Access your medication tracker</p>

          <LoginForm />

          {/* Don't have account */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don&apos;t have an account?{' '}
              <Link href="/auth/signup" className="text-blue-600 hover:text-blue-700 font-medium">
                Sign up
              </Link>
            </p>
          </div>
        </div>

        {/* Medical Disclaimer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            ClariMed is a medication tracker, not a medical device. Always consult your healthcare provider.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}
