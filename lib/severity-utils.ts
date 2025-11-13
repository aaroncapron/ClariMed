/**
 * Unified severity color system and utility functions
 * Used across interactions, contraindications, and allergies
 */

import type { Allergy } from '@/types';
import type { DrugInteraction } from './interactions';

export const SEVERITY_COLORS = {
  critical: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    border: 'border-red-300',
    bgLight: 'bg-red-50',
    textLight: 'text-red-700',
    borderLight: 'border-red-200',
    hover: 'hover:bg-red-100',
  },
  major: {
    bg: 'bg-orange-100',
    text: 'text-orange-800',
    border: 'border-orange-300',
    bgLight: 'bg-orange-50',
    textLight: 'text-orange-700',
    borderLight: 'border-orange-200',
    hover: 'hover:bg-orange-100',
  },
  moderate: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    border: 'border-yellow-300',
    bgLight: 'bg-yellow-50',
    textLight: 'text-yellow-700',
    borderLight: 'border-yellow-200',
    hover: 'hover:bg-yellow-100',
  },
  minor: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-300',
    bgLight: 'bg-blue-50',
    textLight: 'text-blue-700',
    borderLight: 'border-blue-200',
    hover: 'hover:bg-blue-100',
  },
};

const CRITICAL_INTERACTION_KEYWORDS = [
  'contraindicated',
  'do not use',
  'fatal',
  'life-threatening',
  'death',
  'cardiac arrest',
  'respiratory depression',
  'serotonin syndrome',
  'severe hypotension',
  'bleeding risk',
  'anticoagulant',
  'warfarin',
  'maoi',
];

const MAJOR_INTERACTION_KEYWORDS = [
  'avoid',
  'caution',
  'monitor closely',
  'dose adjustment',
  'increased risk',
  'reduced effectiveness',
  'toxicity',
];

const MINOR_INTERACTION_KEYWORDS = [
  'minimal',
  'unlikely',
  'consider',
  'minor',
  'no significant',
];

/**
 * Determines severity level based on interaction description if not provided by API
 */
export function inferInteractionSeverity(interaction: DrugInteraction): 'critical' | 'major' | 'moderate' | 'minor' {
  if (interaction.severity && interaction.severity !== 'unknown') {
    return interaction.severity as 'critical' | 'major' | 'moderate' | 'minor';
  }
  
  const description = interaction.description.toLowerCase();
  
  if (CRITICAL_INTERACTION_KEYWORDS.some(keyword => description.includes(keyword))) {
    return 'critical';
  }
  
  if (MAJOR_INTERACTION_KEYWORDS.some(keyword => description.includes(keyword))) {
    return 'major';
  }
  
  if (MINOR_INTERACTION_KEYWORDS.some(keyword => description.includes(keyword))) {
    return 'minor';
  }
  
  return 'moderate';
}

/**
 * Maps allergy severity to standard severity colors
 */
export function getAllergySeverity(allergy: Allergy): 'critical' | 'major' | 'moderate' | 'minor' {
  switch (allergy.severity) {
    case 'anaphylaxis':
    case 'severe':
      return 'critical';
    case 'moderate':
      return 'major';
    case 'mild':
    default:
      return 'moderate';
  }
}
