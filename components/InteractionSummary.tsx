/**
 * Displays a summary of drug interactions detected in the user's medication list.
 * Adapts display based on view mode (clarity vs clinical).
 */
'use client';

import { useEffect, useState } from 'react';
import type { Medication } from '@/types';
import { checkAllInteractions, getSeverityBadge, type DrugInteraction } from '@/lib/interactions';
import { useViewMode } from '@/contexts/ViewModeContext';

interface InteractionSummaryProps {
  medications: Medication[];
}

export default function InteractionSummary({ medications }: InteractionSummaryProps) {
  const { viewMode } = useViewMode();
  const [interactions, setInteractions] = useState<DrugInteraction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadInteractions() {
      if (medications.length < 2) {
        setInteractions([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      const results = await checkAllInteractions(medications);
      setInteractions(results);
      setLoading(false);
    }

    loadInteractions();
  }, [medications]);

  if (loading) {
    return null;
  }

  if (interactions.length === 0) {
    return null;
  }

  if (viewMode === 'clarity') {
    return <ClaritySummary interactions={interactions} />;
  }

  return <ClinicalSummary interactions={interactions} />;
}

// Clarity Mode: Simple count with color indicator
function ClaritySummary({ interactions }: { interactions: DrugInteraction[] }) {
  const criticalCount = interactions.filter(i => i.severity === 'critical').length;
  const majorCount = interactions.filter(i => i.severity === 'major').length;
  const moderateCount = interactions.filter(i => i.severity === 'moderate').length;
  const minorCount = interactions.filter(i => i.severity === 'minor').length;

  const hasSerious = criticalCount > 0 || majorCount > 0;
  const bgColor = hasSerious ? 'bg-amber-50 border-amber-300' : 'bg-blue-50 border-blue-300';
  const iconColor = hasSerious ? 'text-amber-600' : 'text-blue-600';
  const textColor = hasSerious ? 'text-amber-900' : 'text-blue-900';

  return (
    <div className={`${bgColor} border-2 rounded-xl p-4 mb-6`}>
      <div className="flex items-center gap-3">
        <svg className={`w-6 h-6 ${iconColor} flex-shrink-0`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div className="flex-1">
          <p className={`${textColor} font-semibold`}>
            {interactions.length} potential interaction{interactions.length !== 1 ? 's' : ''} detected
          </p>
          <p className={`text-sm ${textColor} opacity-75`}>
            Review your medication combinations
          </p>
        </div>
        {(criticalCount > 0 || majorCount > 0) && (
          <div className="flex gap-2">
            {criticalCount > 0 && (
              <span className="px-2 py-1 text-xs font-bold rounded bg-red-100 text-red-800 border border-red-300">
                {criticalCount} Critical
              </span>
            )}
            {majorCount > 0 && (
              <span className="px-2 py-1 text-xs font-bold rounded bg-orange-100 text-orange-800 border border-orange-300">
                {majorCount} Major
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Clinical Mode: Detailed breakdown with expandable interactions
function ClinicalSummary({ interactions }: { interactions: DrugInteraction[] }) {
  const [expanded, setExpanded] = useState(false);

  const criticalInteractions = interactions.filter(i => i.severity === 'critical');
  const majorInteractions = interactions.filter(i => i.severity === 'major');
  const moderateInteractions = interactions.filter(i => i.severity === 'moderate');
  const minorInteractions = interactions.filter(i => i.severity === 'minor');

  return (
    <div className="bg-white border-2 border-amber-300 rounded-2xl mb-8 overflow-hidden">
      <div className="bg-amber-50 p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
            <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-amber-900 mb-2">
              Drug Interaction Summary
            </h3>
            <p className="text-amber-800 mb-4">
              We detected {interactions.length} potential interaction{interactions.length !== 1 ? 's' : ''} between your medications.
            </p>
            <div className="flex flex-wrap gap-3">
              {criticalInteractions.length > 0 && (
                <div className="flex items-center gap-2 px-3 py-2 bg-red-100 border border-red-300 rounded-lg">
                  <span className="font-bold text-red-900">{criticalInteractions.length}</span>
                  <span className="text-sm text-red-800">Critical</span>
                </div>
              )}
              {majorInteractions.length > 0 && (
                <div className="flex items-center gap-2 px-3 py-2 bg-orange-100 border border-orange-300 rounded-lg">
                  <span className="font-bold text-orange-900">{majorInteractions.length}</span>
                  <span className="text-sm text-orange-800">Major</span>
                </div>
              )}
              {moderateInteractions.length > 0 && (
                <div className="flex items-center gap-2 px-3 py-2 bg-yellow-100 border border-yellow-300 rounded-lg">
                  <span className="font-bold text-yellow-900">{moderateInteractions.length}</span>
                  <span className="text-sm text-yellow-800">Moderate</span>
                </div>
              )}
              {minorInteractions.length > 0 && (
                <div className="flex items-center gap-2 px-3 py-2 bg-blue-100 border border-blue-300 rounded-lg">
                  <span className="font-bold text-blue-900">{minorInteractions.length}</span>
                  <span className="text-sm text-blue-800">Minor</span>
                </div>
              )}
            </div>
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex-shrink-0 px-4 py-2 bg-white border-2 border-amber-300 text-amber-900 hover:bg-amber-50 font-semibold rounded-lg transition-all"
          >
            {expanded ? 'Hide Details' : 'View Details'}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
          {interactions.map((interaction, index) => {
            const badge = getSeverityBadge(interaction.severity);
            return (
              <div key={index} className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                <div className="flex items-start gap-3 mb-2">
                  <span className={`px-3 py-1 text-xs font-bold rounded border ${badge.color}`}>
                    {badge.label}
                  </span>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900">
                      {interaction.drugA.name} + {interaction.drugB.name}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-700 ml-0">{interaction.description}</p>
              </div>
            );
          })}
          <div className="pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              <span className="font-semibold">Important:</span> This information is for educational purposes only. 
              Always consult your healthcare provider about potential drug interactions.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
