/**
 * Displays user's medication list with interaction warnings.
 * Adapts display based on view mode (clarity vs clinical).
 */
'use client';

import { useEffect, useState } from 'react';
import type { Medication } from '@/types';
import { useViewMode } from '@/contexts/ViewModeContext';
import { checkMedicationInteractions, type DrugInteraction } from '@/lib/interactions';

interface MedicationListProps {
  medications: Medication[];
  onDelete: (id: string) => void;
  onEdit: (med: Medication) => void;
}

export default function MedicationList({ medications, onDelete, onEdit }: MedicationListProps) {
  const { viewMode } = useViewMode();
  const [medicationInteractions, setMedicationInteractions] = useState<Map<string, DrugInteraction[]>>(new Map());

  useEffect(() => {
    async function loadInteractions() {
      const interactionMap = new Map<string, DrugInteraction[]>();
      
      for (const med of medications) {
        const otherMeds = medications.filter(m => m.id !== med.id);
        if (otherMeds.length > 0) {
          const interactions = await checkMedicationInteractions(med, otherMeds);
          if (interactions.length > 0) {
            interactionMap.set(med.id, interactions);
          }
        }
      }
      
      setMedicationInteractions(interactionMap);
    }

    if (medications.length >= 2) {
      loadInteractions();
    } else {
      setMedicationInteractions(new Map());
    }
  }, [medications]);

  if (viewMode === 'clarity') {
    return <ClarityView medications={medications} onDelete={onDelete} onEdit={onEdit} medicationInteractions={medicationInteractions} />;
  }

  return <ClinicalView medications={medications} onDelete={onDelete} onEdit={onEdit} medicationInteractions={medicationInteractions} />;
}

interface ViewProps extends MedicationListProps {
  medicationInteractions: Map<string, DrugInteraction[]>;
}

// Clarity Mode: Simple, clean, minimal view
function ClarityView({ medications, onDelete, onEdit, medicationInteractions }: ViewProps) {
  return (
    <div className="space-y-4">
      {medications.map((med) => {
        const interactions = medicationInteractions.get(med.id) || [];
        const hasInteractions = interactions.length > 0;
        const hasCritical = interactions.some(i => i.severity === 'critical');
        const hasMajor = interactions.some(i => i.severity === 'major');
        
        return (
          <div
            key={med.id}
            className={`bg-white rounded-xl border p-6 hover:shadow-lg transition-all ${
              hasCritical || hasMajor 
                ? 'border-amber-300 hover:border-amber-400' 
                : 'border-gray-200 hover:border-teal-300'
            }`}
          >
            <div className="flex justify-between items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-bold text-gray-900">
                    {med.name}
                  </h3>
                  {hasInteractions && (
                    <span className={`px-2 py-1 text-xs font-bold rounded ${
                      hasCritical 
                        ? 'bg-red-100 text-red-800 border border-red-300' 
                        : hasMajor
                        ? 'bg-orange-100 text-orange-800 border border-orange-300'
                        : 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                    }`}>
                      {interactions.length} interaction{interactions.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                <p className="text-gray-600 text-lg">
                  {med.dosage} • {med.frequency}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onEdit(med)}
                  className="px-4 py-2 bg-teal-50 text-teal-700 hover:bg-teal-100 font-semibold rounded-lg transition-all active:scale-95"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(med.id)}
                  className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 font-semibold rounded-lg transition-all active:scale-95"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Clinical Mode: Detailed, comprehensive view with all information
function ClinicalView({ medications, onDelete, onEdit, medicationInteractions }: ViewProps) {
  const [expandedInteractions, setExpandedInteractions] = useState<Set<string>>(new Set());

  const toggleInteractions = (medId: string) => {
    const newExpanded = new Set(expandedInteractions);
    if (newExpanded.has(medId)) {
      newExpanded.delete(medId);
    } else {
      newExpanded.add(medId);
    }
    setExpandedInteractions(newExpanded);
  };

  return (
    <div className="space-y-6">
      {medications.map((med) => {
        const interactions = medicationInteractions.get(med.id) || [];
        const hasInteractions = interactions.length > 0;
        const isExpanded = expandedInteractions.has(med.id);
        const criticalCount = interactions.filter(i => i.severity === 'critical').length;
        const majorCount = interactions.filter(i => i.severity === 'major').length;

        return (
          <div
            key={med.id}
            className={`bg-white rounded-2xl border p-8 hover:shadow-xl transition-all ${
              criticalCount > 0 || majorCount > 0
                ? 'border-amber-300 hover:border-amber-400'
                : 'border-gray-200 hover:border-blue-400'
            }`}
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
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 text-sm font-semibold rounded-full border border-blue-200">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                      </svg>
                      Maintenance
                    </span>
                  )}
                  {hasInteractions && (
                    <button
                      onClick={() => toggleInteractions(med.id)}
                      className={`inline-flex items-center gap-1 px-3 py-1 text-sm font-semibold rounded-full border transition-all ${
                        criticalCount > 0
                          ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                          : majorCount > 0
                          ? 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100'
                          : 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      {interactions.length} interaction{interactions.length !== 1 ? 's' : ''}
                    </button>
                  )}
                </div>
                
                {hasInteractions && isExpanded && (
                  <div className="mb-4 p-4 bg-amber-50 border-2 border-amber-300 rounded-xl space-y-3">
                    <h4 className="font-bold text-amber-900 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      Interactions Detected
                    </h4>
                    {interactions.map((interaction, idx) => {
                      const badge = (() => {
                        switch (interaction.severity) {
                          case 'critical': return { color: 'bg-red-100 text-red-800 border-red-300', label: 'Critical' };
                          case 'major': return { color: 'bg-orange-100 text-orange-800 border-orange-300', label: 'Major' };
                          case 'moderate': return { color: 'bg-yellow-100 text-yellow-800 border-yellow-300', label: 'Moderate' };
                          case 'minor': return { color: 'bg-blue-100 text-blue-800 border-blue-300', label: 'Minor' };
                          default: return { color: 'bg-gray-100 text-gray-800 border-gray-300', label: 'Unknown' };
                        }
                      })();
                      
                      return (
                        <div key={idx} className="p-3 bg-white border border-amber-200 rounded-lg">
                          <div className="flex items-start gap-2 mb-2">
                            <span className={`px-2 py-1 text-xs font-bold rounded border ${badge.color}`}>
                              {badge.label}
                            </span>
                            <p className="font-semibold text-amber-900 text-sm">
                              Interacts with: {interaction.drugB.name}
                            </p>
                          </div>
                          <p className="text-sm text-amber-800">{interaction.description}</p>
                        </div>
                      );
                    })}
                    <p className="text-xs text-amber-700 pt-2">
                      Consult your healthcare provider about these interactions.
                    </p>
                  </div>
                )}

                <div className="space-y-3 text-gray-700">
                  <p className="flex items-center gap-2 text-lg">
                    <span className="font-semibold text-blue-700">Dosage:</span> 
                    <span>{med.dosage}</span>
                  </p>
                  <p className="flex items-center gap-2 text-lg">
                    <span className="font-semibold text-blue-700">Directions:</span> 
                    <span>{med.frequency}</span>
                  </p>
                  {med.therapeuticClass && (
                    <p className="flex items-center gap-2 text-lg">
                      <span className="font-semibold text-blue-700">Class:</span> 
                      <span>{med.therapeuticClass}</span>
                    </p>
                  )}
                  {med.ingredients && med.ingredients.length > 0 && (
                    <p className="flex items-start gap-2 text-lg">
                      <span className="font-semibold text-blue-700">Ingredients:</span> 
                      <span>{med.ingredients.join(', ')}</span>
                    </p>
                  )}
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
                  className="px-6 py-3 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800 font-semibold rounded-xl transition-all hover:shadow-md active:scale-95"
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
        );
      })}
    </div>
  );
}