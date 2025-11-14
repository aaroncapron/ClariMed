/**
 * Detailed, comprehensive medication card for Clinical mode
 * Shows all technical information, contraindications, and allergies
 */

'use client';

import { useState } from 'react';
import type { Medication, Allergy } from '@/types';
import type { ContraindicationWarning } from '@/lib/contraindications';
import { SEVERITY_COLORS, getAllergySeverity } from '@/lib/severity-utils';
import { getMedicationClass, getCommonUse, extractDosageForm } from '@/lib/drug-info-utils';

interface ClinicalMedicationCardProps {
  medication: Medication;
  contraindications: ContraindicationWarning[];
  allergies: { allergy: Allergy; conflictingIngredient: string }[];
  onEdit: (med: Medication) => void;
  onDelete: (id: string) => void;
}

export default function ClinicalMedicationCard({
  medication: med,
  contraindications,
  allergies,
  onEdit,
  onDelete,
}: ClinicalMedicationCardProps) {
  const [isContraindicationsExpanded, setIsContraindicationsExpanded] = useState(false);
  const [isAllergiesExpanded, setIsAllergiesExpanded] = useState(false);

  const criticalCount = contraindications.filter(c => c.severity === 'critical').length;
  const majorCount = contraindications.filter(c => c.severity === 'major').length;
  
  const allergySeverities = allergies.map(a => getAllergySeverity(a.allergy));
  const highestAllergySeverity = allergySeverities.reduce((highest, current) => {
    const order = { critical: 4, major: 3, moderate: 2, minor: 1 };
    return (order[current] || 0) > (order[highest] || 0) ? current : highest;
  }, 'minor' as 'critical' | 'major' | 'moderate' | 'minor');
  

  
  const contraindicationSeverities = contraindications.map(c => c.severity);
  const highestContraindicationSeverity = contraindicationSeverities.reduce((highest, current) => {
    const order = { critical: 4, major: 3, moderate: 2, minor: 1 };
    return (order[current] || 0) > (order[highest] || 0) ? current : highest;
  }, 'minor' as 'critical' | 'major' | 'moderate' | 'minor');

  return (
    <div
      className={`rounded-2xl border p-8 hover:shadow-xl transition-all ${
        criticalCount > 0 || majorCount > 0
          ? 'bg-amber-50 border-amber-400 hover:border-amber-500'
          : 'bg-white border-gray-200 hover:border-blue-400'
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
            {allergies.length > 0 && (
              <button
                onClick={() => setIsAllergiesExpanded(!isAllergiesExpanded)}
                className={`inline-flex items-center gap-1 px-3 py-1 text-sm font-semibold rounded-full border transition-all ${
                  SEVERITY_COLORS[highestAllergySeverity].bgLight
                } ${SEVERITY_COLORS[highestAllergySeverity].textLight} ${
                  SEVERITY_COLORS[highestAllergySeverity].borderLight
                } ${SEVERITY_COLORS[highestAllergySeverity].hover}`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {allergies.length} allergy alert{allergies.length !== 1 ? 's' : ''}
              </button>
            )}
            {contraindications.length > 0 && (
              <button
                onClick={() => setIsContraindicationsExpanded(!isContraindicationsExpanded)}
                className={`inline-flex items-center gap-1 px-3 py-1 text-sm font-semibold rounded-full border transition-all ${
                  SEVERITY_COLORS[highestContraindicationSeverity].bgLight
                } ${SEVERITY_COLORS[highestContraindicationSeverity].textLight} ${
                  SEVERITY_COLORS[highestContraindicationSeverity].borderLight
                } ${SEVERITY_COLORS[highestContraindicationSeverity].hover}`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {contraindications.length} health alert{contraindications.length !== 1 ? 's' : ''}
              </button>
            )}
          </div>
          
          {contraindications.length > 0 && isContraindicationsExpanded && (
            <div className={`mb-4 p-4 border-2 rounded-xl space-y-3 ${
              SEVERITY_COLORS[highestContraindicationSeverity].bgLight
            } ${SEVERITY_COLORS[highestContraindicationSeverity].borderLight}`}>
              <h4 className={`font-bold flex items-center gap-2 ${
                SEVERITY_COLORS[highestContraindicationSeverity].textLight
              }`}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Health Condition Alerts
              </h4>
              {contraindications.map((warning, idx) => {
                const severity = warning.severity as 'critical' | 'major' | 'moderate' | 'minor';
                const severityLabel = severity.charAt(0).toUpperCase() + severity.slice(1);
                
                return (
                  <div key={idx} className={`p-3 bg-white border rounded-lg ${
                    SEVERITY_COLORS[severity].borderLight
                  }`}>
                    <div className="flex items-start gap-2 mb-2">
                      <span className={`px-2 py-1 text-xs font-bold rounded border ${
                        SEVERITY_COLORS[severity].bg
                      } ${SEVERITY_COLORS[severity].text} ${
                        SEVERITY_COLORS[severity].border
                      }`}>
                        {severityLabel}
                      </span>
                      <p className={`font-semibold text-sm ${
                        SEVERITY_COLORS[severity].textLight
                      }`}>
                        Condition: {warning.condition}
                      </p>
                    </div>
                    <p className={`text-sm ${SEVERITY_COLORS[severity].text}`}>
                      {warning.description}
                    </p>
                  </div>
                );
              })}
              <p className={`text-xs pt-2 ${SEVERITY_COLORS[highestContraindicationSeverity].text}`}>
                This is informational only. Consult your healthcare provider about your health conditions and medications.
              </p>
            </div>
          )}

          {allergies.length > 0 && isAllergiesExpanded && (
            <div className={`mb-4 p-4 border-2 rounded-xl space-y-3 ${
              SEVERITY_COLORS[highestAllergySeverity].bgLight
            } ${SEVERITY_COLORS[highestAllergySeverity].borderLight}`}>
              <h4 className={`font-bold flex items-center gap-2 ${
                SEVERITY_COLORS[highestAllergySeverity].textLight
              }`}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Allergy Alerts Detected
              </h4>
              {allergies.map((conflict, idx) => {
                const severity = getAllergySeverity(conflict.allergy);
                const allergyDisplayLabel = (() => {
                  switch (conflict.allergy.severity) {
                    case 'anaphylaxis': return 'Anaphylaxis Risk';
                    case 'severe': return 'Severe';
                    case 'moderate': return 'Moderate';
                    case 'mild': return 'Mild';
                    default: return 'Unknown';
                  }
                })();
                
                return (
                  <div key={idx} className={`p-3 bg-white border rounded-lg ${
                    SEVERITY_COLORS[severity].borderLight
                  }`}>
                    <div className="flex items-start gap-2 mb-2">
                      <span className={`px-2 py-1 text-xs font-bold rounded border ${
                        SEVERITY_COLORS[severity].bg
                      } ${SEVERITY_COLORS[severity].text} ${
                        SEVERITY_COLORS[severity].border
                      }`}>
                        {allergyDisplayLabel}
                      </span>
                      <p className={`font-semibold text-sm ${
                        SEVERITY_COLORS[severity].textLight
                      }`}>
                        Allergy: {conflict.allergy.allergen}
                      </p>
                    </div>
                    <p className={`text-sm ${SEVERITY_COLORS[severity].text}`}>
                      Conflicting ingredient: {conflict.conflictingIngredient}
                    </p>
                    {conflict.allergy.reaction && (
                      <p className={`text-xs mt-1 italic ${
                        SEVERITY_COLORS[severity].textLight
                      }`}>
                        Previous reaction: {conflict.allergy.reaction}
                      </p>
                    )}
                  </div>
                );
              })}
              <p className={`text-xs pt-2 ${SEVERITY_COLORS[highestAllergySeverity].text}`}>
                ⚠️ <strong>WARNING:</strong> Do not take this medication. Consult your healthcare provider or pharmacist immediately.
              </p>
            </div>
          )}

          {/* Clinical Details Section */}
          <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
            <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Clinical Information
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(() => {
                const drugClass = getMedicationClass(med.name);
                if (drugClass && drugClass !== 'Prescription Medication') {
                  return (
                    <div className="bg-white p-3 rounded-lg border border-blue-200">
                      <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">Drug Class</p>
                      <p className="text-sm text-gray-900">{drugClass}</p>
                    </div>
                  );
                }
                return null;
              })()}
              
              {(() => {
                const commonUse = getCommonUse(med.name);
                if (commonUse) {
                  return (
                    <div className="bg-white p-3 rounded-lg border border-blue-200">
                      <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">Common Use</p>
                      <p className="text-sm text-gray-900">{commonUse}</p>
                    </div>
                  );
                }
                return null;
              })()}
              
              <div className="bg-white p-3 rounded-lg border border-blue-200">
                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">Dosage Form</p>
                <p className="text-sm font-bold text-gray-900">{extractDosageForm(med.name)}</p>
              </div>
            </div>
            
            {med.ingredients && med.ingredients.length > 0 && (
              <div className="mt-3 bg-white p-3 rounded-lg border border-blue-200">
                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2">Active Ingredients</p>
                <div className="flex flex-wrap gap-2">
                  {med.ingredients.map((ingredient, idx) => (
                    <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full border border-blue-300">
                      {ingredient}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {med.therapeuticClass && (
              <div className="mt-3 bg-white p-3 rounded-lg border border-blue-200">
                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">Therapeutic Class (ATC Code)</p>
                <p className="text-sm font-mono text-gray-900">{med.therapeuticClass}</p>
              </div>
            )}
          </div>

          {/* Prescription Details */}
          <div className="space-y-3 text-gray-700">
            <p className="flex items-center gap-2 text-lg">
              <span className="font-semibold text-blue-700">Quantity Dispensed:</span> 
              <span>{med.quantity}</span>
            </p>
            <p className="flex items-start gap-2 text-lg">
              <span className="font-semibold text-blue-700 flex-shrink-0">Directions:</span> 
              <span className="bg-gray-50 px-3 py-1 rounded border border-gray-200">{med.frequency}</span>
            </p>
            {med.refills_remaining !== undefined && (
              <div className="flex items-center gap-2">
                <span className="font-semibold text-blue-700">Refills:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  med.refills_remaining === 0 
                    ? 'bg-red-100 text-red-800 border border-red-300'
                    : med.refills_remaining === 1
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : 'bg-green-100 text-green-800 border border-green-300'
                }`}>
                  {med.refills_remaining} remaining
                </span>
                {med.total_refills !== undefined && (
                  <span className="text-sm text-gray-500">(of {med.total_refills})</span>
                )}
              </div>
            )}
            {med.last_pickup_date && (
              <p className="flex items-center gap-2 text-sm text-gray-600">
                <span className="font-semibold">Last picked up:</span> 
                <span>{new Date(med.last_pickup_date).toLocaleDateString()}</span>
              </p>
            )}
            {med.notes && (
              <p className="mt-4 text-base text-gray-600 bg-amber-50 p-4 rounded-lg border border-amber-200">
                <span className="font-semibold text-gray-700">Patient Notes:</span> {med.notes}
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
}
