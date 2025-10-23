/**
 * Email Verification Page
 * 
 * Shown after user signs up, prompts them to check email
 */

import Link from 'next/link'

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Branding */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-600 mb-2">ClariMed</h1>
        </div>

        {/* Verification Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Icon */}
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">📧</span>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-3">Check your email</h2>
          
          <p className="text-gray-600 mb-6">
            We&apos;ve sent you a verification email. Please click the link in the email to verify your account and complete the signup process.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-700">
              <strong>Don&apos;t see the email?</strong> Check your spam folder or wait a few minutes for it to arrive.
            </p>
          </div>

          {/* Back to login */}
          <Link
            href="/auth/login"
            className="inline-block text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Back to login
          </Link>
        </div>

        {/* Help text */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Having trouble? The verification email should arrive within a few minutes.
          </p>
        </div>
      </div>
    </div>
  )
}
