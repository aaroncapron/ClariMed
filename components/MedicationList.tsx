/**
 * Displays user's medication list with interaction warnings.
 * Adapts display based on view mode (clarity vs clinical).
 */
'use client';

import { useEffect, useState } from 'react';
import type { Medication, Allergy } from '@/types';
import { useViewMode } from '@/contexts/ViewModeContext';
import { checkMedicationInteractions, type DrugInteraction } from '@/lib/interactions';
import { checkContraindications, type ContraindicationWarning } from '@/lib/contraindications';
import { getHealthConditions } from '@/lib/health-conditions';
import { getAllergies, checkAllergyConflictsAsync } from '@/lib/allergies';
import ClarityMedicationCard from './ClarityMedicationCard';
import ClinicalMedicationCard from './ClinicalMedicationCard';

interface MedicationListProps {
  medications: Medication[];
  onDelete: (id: string) => void;
  onEdit: (med: Medication) => void;
}

export default function MedicationList({ medications, onDelete, onEdit }: MedicationListProps) {
  const { viewMode } = useViewMode();
  const [medicationInteractions, setMedicationInteractions] = useState<Map<string, DrugInteraction[]>>(new Map());
  const [medicationContraindications, setMedicationContraindications] = useState<Map<string, ContraindicationWarning[]>>(new Map());
  const [medicationAllergies, setMedicationAllergies] = useState<Map<string, { allergy: Allergy; conflictingIngredient: string }[]>>(new Map());

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

  useEffect(() => {
    async function loadContraindications() {
      const contraindicationMap = new Map<string, ContraindicationWarning[]>();
      
      try {
        const healthConditions = await getHealthConditions();
        
        if (healthConditions.length > 0) {
          for (const med of medications) {
            const warnings = await checkContraindications(med, healthConditions);
            if (warnings.length > 0) {
              contraindicationMap.set(med.id, warnings);
            }
          }
        }
      } catch (err) {
        console.error('Error loading contraindications:', err);
      }
      
      setMedicationContraindications(contraindicationMap);
    }

    if (medications.length > 0) {
      loadContraindications();
    } else {
      setMedicationContraindications(new Map());
    }
  }, [medications]);

  useEffect(() => {
    async function loadAllergyConflicts() {
      const allergyMap = new Map<string, { allergy: Allergy; conflictingIngredient: string }[]>();
      
      try {
        const allergies = await getAllergies();
        
        if (allergies.length > 0) {
          for (const med of medications) {
            const conflicts = await checkAllergyConflictsAsync(med, allergies);
            if (conflicts.length > 0) {
              allergyMap.set(med.id, conflicts);
            }
          }
        }
      } catch (err) {
        console.error('Error loading allergy conflicts:', err);
      }
      
      setMedicationAllergies(allergyMap);
    }

    if (medications.length > 0) {
      loadAllergyConflicts();
    } else {
      setMedicationAllergies(new Map());
    }
  }, [medications]);

  if (viewMode === 'clarity') {
    return (
      <div className="space-y-4">
        {medications.map((med) => (
          <ClarityMedicationCard
            key={med.id}
            medication={med}
            interactions={medicationInteractions.get(med.id) || []}
            contraindications={medicationContraindications.get(med.id) || []}
            allergies={medicationAllergies.get(med.id) || []}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {medications.map((med) => (
        <ClinicalMedicationCard
          key={med.id}
          medication={med}
          interactions={medicationInteractions.get(med.id) || []}
          contraindications={medicationContraindications.get(med.id) || []}
          allergies={medicationAllergies.get(med.id) || []}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
