/**
 * Displays a notice that drug interaction checking is temporarily unavailable.
 * Feature disabled due to RxNav Interaction API endpoint issues.
 */
'use client';

import type { Medication } from '@/types';

interface InteractionSummaryProps {
  medications: Medication[];
}

export default function InteractionSummary({ medications }: InteractionSummaryProps) {
  // Only show message if user has multiple medications
  if (medications.length < 2) {
    return null;
  }

  return (
    <div className="bg-gray-50 border-2 border-gray-300 rounded-xl p-4 mb-6">
      <div className="flex items-center gap-3">
        <svg className="w-6 h-6 text-gray-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div className="flex-1">
          <p className="text-gray-900 font-semibold">
            Drug Interaction Checking Temporarily Unavailable
          </p>
          <p className="text-sm text-gray-600 mt-1">
            We&apos;re working on implementing a new data source for interaction checking. 
            Please consult your healthcare provider or pharmacist about potential interactions.
          </p>
        </div>
      </div>
    </div>
  );
}
