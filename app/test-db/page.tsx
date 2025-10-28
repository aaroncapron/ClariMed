'use client'

/**
 * Database Test Page
 * 
 * Visit /test-db to verify database setup
 * This page checks if all required tables exist
 */

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface TableCheck {
  name: string
  exists: boolean
  error?: string
}

export default function TestDatabasePage() {
  const [checks, setChecks] = useState<TableCheck[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function verifyTables() {
      const supabase = createClient()
      const tables = ['user_profiles', 'allergies', 'medications']
      const results: TableCheck[] = []

      for (const table of tables) {
        try {
          const { error } = await supabase
            .from(table)
            .select('id')
            .limit(1)

          results.push({
            name: table,
            exists: !error,
            error: error?.message
          })
        } catch (err) {
          results.push({
            name: table,
            exists: false,
            error: String(err)
          })
        }
      }

      setChecks(results)
      setLoading(false)
    }

    verifyTables()
  }, [])

  const allGood = checks.every(c => c.exists)

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🔍 Database Verification
        </h1>
        <p className="text-gray-600 mb-8">
          Checking if Supabase database is properly configured...
        </p>

        {loading ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Checking tables...</p>
          </div>
        ) : (
          <>
            {/* Results */}
            <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
              <div className={`px-6 py-4 ${allGood ? 'bg-green-50 border-l-4 border-green-500' : 'bg-yellow-50 border-l-4 border-yellow-500'}`}>
                <h2 className="text-lg font-semibold">
                  {allGood ? '✅ All Tables Found!' : '⚠️ Some Issues Detected'}
                </h2>
              </div>

              <div className="divide-y">
                {checks.map((check) => (
                  <div key={check.name} className="px-6 py-4 flex items-center justify-between">
                    <div>
                      <span className="font-mono text-sm font-medium text-gray-900">
                        {check.name}
                      </span>
                      {check.error && (
                        <p className="text-xs text-red-600 mt-1">{check.error}</p>
                      )}
                    </div>
                    <span className={`text-2xl ${check.exists ? '' : 'opacity-50'}`}>
                      {check.exists ? '✅' : '❌'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Instructions */}
            {!allGood && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="font-semibold text-blue-900 mb-3">🔧 How to Fix</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
                  <li>Open your Supabase Dashboard → SQL Editor</li>
                  <li>Run the migration file: <code className="bg-blue-100 px-2 py-1 rounded">lib/supabase/migrations/001_initial_schema.sql</code></li>
                  <li>Run the second migration: <code className="bg-blue-100 px-2 py-1 rounded">lib/supabase/migrations/002_add_name_phone_fields.sql</code></li>
                  <li>Refresh this page to verify</li>
                </ol>
              </div>
            )}

            {allGood && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="font-semibold text-green-900 mb-3">🎉 Database is Ready!</h3>
                <p className="text-sm text-green-800 mb-4">
                  All required tables exist. You can now test the authentication flow.
                </p>
                <div className="space-y-2 text-sm text-green-800">
                  <p className="font-medium">Next steps:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Test signup at <a href="/auth/signup" className="underline">/auth/signup</a></li>
                    <li>Check email verification flow</li>
                    <li>Test login at <a href="/auth/login" className="underline">/auth/login</a></li>
                  </ul>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
