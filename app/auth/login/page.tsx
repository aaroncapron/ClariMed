/**
 * Login Page
 * 
 * User authentication page
 */

import Link from 'next/link'
import LoginForm from '@/components/auth/LoginForm'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Branding */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-600 mb-2">ClariMed</h1>
          <p className="text-gray-600">Welcome back!</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign in</h2>
          <p className="text-gray-600 mb-6">Access your medication tracker</p>

          <LoginForm />

          {/* Don't have account */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
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
