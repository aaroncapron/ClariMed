'use client';

import type { Medication } from '@/types';

interface MedicationListProps {
  medications: Medication[];
  onDelete: (id: string) => void;
  onEdit: (med: Medication) => void;
}

export default function MedicationList({ medications, onDelete, onEdit }: MedicationListProps) {
  return (
    <div className="space-y-6">
      {medications.map((med) => (
        <div
          key={med.id}
          className="bg-white rounded-2xl border border-gray-200 p-8 hover:shadow-xl transition-all hover:border-blue-300"
        >
          <div className="flex justify-between items-start gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <h3 className="text-2xl font-bold text-gray-900">
                  {med.name}
                </h3>
                {med.verified && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 text-sm font-semibold rounded-full border border-green-200">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Verified
                  </span>
                )}
                {med.isMaintenance && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-50 text-purple-700 text-sm font-semibold rounded-full border border-purple-200">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                    </svg>
                    Maintenance
                  </span>
                )}
              </div>
              <div className="space-y-3 text-gray-700">
                <p className="flex items-center gap-2 text-lg">
                  <span className="font-semibold text-blue-600">Dosage:</span> 
                  <span>{med.dosage}</span>
                </p>
                <p className="flex items-center gap-2 text-lg">
                  <span className="font-semibold text-blue-600">Frequency:</span> 
                  <span>{med.frequency}</span>
                </p>
                {med.notes && (
                  <p className="mt-4 text-base text-gray-600 bg-gray-50 p-4 rounded-lg">
                    <span className="font-semibold text-gray-700">Notes:</span> {med.notes}
                  </p>
                )}
              </div>
              <div className="mt-4 text-sm text-gray-400">
                Added {new Date(med.createdAt).toLocaleDateString('en-US', { 
                  month: 'long', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => onEdit(med)}
                className="px-6 py-3 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 font-semibold rounded-xl transition-all hover:shadow-md active:scale-95"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(med.id)}
                className="px-6 py-3 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 font-semibold rounded-xl transition-all hover:shadow-md active:scale-95"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
