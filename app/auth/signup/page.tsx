/**
 * Signup Page
 * 
 * User registration page with form validation
 */

import Link from 'next/link'
import SignupForm from '@/components/auth/SignupForm'

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Branding */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-600 mb-2">ClariMed</h1>
          <p className="text-gray-600">Simple medication tracking</p>
        </div>

        {/* Signup Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Create your account</h2>
          <p className="text-gray-600 mb-6">Start tracking your medications securely</p>

          <SignupForm />

          {/* Already have account */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-blue-600 hover:text-blue-700 font-medium">
                Sign in
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
