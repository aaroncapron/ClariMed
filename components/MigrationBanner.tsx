/**
 * Migration Banner Component
 * 
 * Prompts users to import their localStorage medications to Supabase
 * Shows when user logs in and has existing local data
 */

'use client'

import { useState } from 'react'
import { migrateMedicationsToSupabase, skipMigration } from '@/lib/storage'

interface MigrationBannerProps {
  userId: string
  medicationCount: number
  onComplete: () => void
}

export default function MigrationBanner({ userId, medicationCount, onComplete }: MigrationBannerProps) {
  const [importing, setImporting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleImport = async () => {
    setError(null)
    setImporting(true)

    const result = await migrateMedicationsToSupabase(userId)

    if (result.success) {
      onComplete()
    } else {
      setError(result.error || 'Failed to import medications')
      setImporting(false)
    }
  }

  const handleSkip = async () => {
    await skipMigration(userId)
    onComplete()
  }

  return (
    <div className="mb-6 bg-blue-50 border-l-4 border-blue-500 rounded-lg p-6 shadow-md">
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-2xl">📦</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            Import Your Medications?
          </h3>
          
          <p className="text-blue-800 mb-4">
            We found <strong>{medicationCount} medication{medicationCount !== 1 ? 's' : ''}</strong> saved on this device. 
            Import them to your account to sync across all your devices and back them up to the cloud.
          </p>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded px-4 py-2">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={handleImport}
              disabled={importing}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
            >
              {importing ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Importing...
                </>
              ) : (
                <>
                  ✓ Yes, Import (Recommended)
                </>
              )}
            </button>

            <button
              onClick={handleSkip}
              disabled={importing}
              className="text-blue-700 hover:text-blue-800 px-4 py-2 rounded-lg hover:bg-blue-100 transition disabled:opacity-50"
            >
              Skip for Now
            </button>
          </div>

          {/* Info */}
          <p className="mt-3 text-xs text-blue-600">
            💡 Your medications will be encrypted and only accessible by you. You can export or delete them anytime.
          </p>
        </div>
      </div>
    </div>
  )
}
