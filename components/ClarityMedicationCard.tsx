/**
 * Simple, clean medication card for Clarity mode
 * Shows basic information with minimal visual complexity
 */

import type { Medication, Allergy } from '@/types';
import type { DrugInteraction } from '@/lib/interactions';
import type { ContraindicationWarning } from '@/lib/contraindications';
import { SEVERITY_COLORS, inferInteractionSeverity, getAllergySeverity } from '@/lib/severity-utils';

interface ClarityMedicationCardProps {
  medication: Medication;
  interactions: DrugInteraction[];
  contraindications: ContraindicationWarning[];
  allergies: { allergy: Allergy; conflictingIngredient: string }[];
  onEdit: (med: Medication) => void;
  onDelete: (id: string) => void;
}

export default function ClarityMedicationCard({
  medication: med,
  interactions,
  contraindications,
  allergies,
  onEdit,
  onDelete,
}: ClarityMedicationCardProps) {
  const interactionSeverities = interactions.map(i => inferInteractionSeverity(i));
  const contraindicationSeverities = contraindications.map(c => c.severity);
  const allergySeverities = allergies.map(a => getAllergySeverity(a.allergy));
  
  const allSeverities = [...interactionSeverities, ...contraindicationSeverities, ...allergySeverities];
  const hasCritical = allSeverities.includes('critical');
  const hasMajor = allSeverities.includes('major');
  const hasModerate = allSeverities.includes('moderate');
  
  const highestAllergySeverity = allergySeverities.reduce((highest, current) => {
    const order = { critical: 4, major: 3, moderate: 2, minor: 1 };
    return (order[current] || 0) > (order[highest] || 0) ? current : highest;
  }, 'minor' as 'critical' | 'major' | 'moderate' | 'minor');

  return (
    <div
      className={`bg-white rounded-xl border p-6 hover:shadow-lg transition-all ${
        hasCritical || hasMajor 
          ? 'border-amber-300 hover:border-amber-400' 
          : 'border-gray-200 hover:border-teal-300'
      }`}
    >
      <div className="flex justify-between items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <h3 className="text-xl font-bold text-gray-900">
              {med.name}
            </h3>
            {allergies.length > 0 && (
              <span className={`px-2 py-1 text-xs font-bold rounded border ${
                SEVERITY_COLORS[highestAllergySeverity].bg
              } ${SEVERITY_COLORS[highestAllergySeverity].text} ${
                SEVERITY_COLORS[highestAllergySeverity].border
              }`}>
                {allergies.length} allergy alert{allergies.length !== 1 ? 's' : ''}
              </span>
            )}
            {interactions.length > 0 && (
              <span className={`px-2 py-1 text-xs font-bold rounded border ${
                hasCritical
                  ? `${SEVERITY_COLORS.critical.bg} ${SEVERITY_COLORS.critical.text} ${SEVERITY_COLORS.critical.border}`
                  : hasMajor
                  ? `${SEVERITY_COLORS.major.bg} ${SEVERITY_COLORS.major.text} ${SEVERITY_COLORS.major.border}`
                  : hasModerate
                  ? `${SEVERITY_COLORS.moderate.bg} ${SEVERITY_COLORS.moderate.text} ${SEVERITY_COLORS.moderate.border}`
                  : `${SEVERITY_COLORS.minor.bg} ${SEVERITY_COLORS.minor.text} ${SEVERITY_COLORS.minor.border}`
              }`}>
                {interactions.length} interaction{interactions.length !== 1 ? 's' : ''}
              </span>
            )}
            {contraindications.length > 0 && (
              <span className={`px-2 py-1 text-xs font-bold rounded border ${
                contraindications.some(c => c.severity === 'critical')
                  ? `${SEVERITY_COLORS.critical.bg} ${SEVERITY_COLORS.critical.text} ${SEVERITY_COLORS.critical.border}`
                  : contraindications.some(c => c.severity === 'major')
                  ? `${SEVERITY_COLORS.major.bg} ${SEVERITY_COLORS.major.text} ${SEVERITY_COLORS.major.border}`
                  : contraindications.some(c => c.severity === 'moderate')
                  ? `${SEVERITY_COLORS.moderate.bg} ${SEVERITY_COLORS.moderate.text} ${SEVERITY_COLORS.moderate.border}`
                  : `${SEVERITY_COLORS.minor.bg} ${SEVERITY_COLORS.minor.text} ${SEVERITY_COLORS.minor.border}`
              }`}>
                {contraindications.length} health alert{contraindications.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          <p className="text-gray-600 text-lg">
            {med.quantity} • {med.frequency}
          </p>
          {med.refills_remaining !== undefined && (
            <div className="mt-2 flex items-center gap-2">
              <span className={`text-sm px-3 py-1 rounded-full font-medium ${
                med.refills_remaining === 0 
                  ? 'bg-red-100 text-red-800 border border-red-300'
                  : med.refills_remaining === 1
                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                  : 'bg-green-100 text-green-800 border border-green-300'
              }`}>
                {med.refills_remaining} refill{med.refills_remaining !== 1 ? 's' : ''} remaining
              </span>
            </div>
          )}
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
}
