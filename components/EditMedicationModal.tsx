'use client';

import { useState, useEffect } from 'react';
import type { Medication } from '@/types';
import { getAvailableFormulations } from '@/lib/rxnav';

// Import the helper function to get form-specific quantities
function getQuantityOptionsForForm(form: string): { value: number; label: string }[] {
  const formLower = form.toLowerCase();
  
  // Injectables (vials, syringes, ampules)
  if (/vial|syringe|ampul|injection|cartridge/i.test(formLower)) {
    return [
      { value: 1, label: '1' },
      { value: 2, label: '2' },
      { value: 4, label: '4' },
      { value: 6, label: '6' },
      { value: 10, label: '10' }
    ];
  }
  
  // Pen injectors (insulin, GLP-1s) - dispensed by carton
  if (/pen|autoinjector|prefilled/i.test(formLower)) {
    return [
      { value: 1, label: '1 carton' },
      { value: 2, label: '2 cartons' },
      { value: 3, label: '3 cartons' }
    ];
  }
  
  // Patches
  if (/patch|transdermal/i.test(formLower)) {
    return [
      { value: 4, label: '4 patches' },
      { value: 8, label: '8 patches' },
      { value: 12, label: '12 patches' },
      { value: 30, label: '30 patches' }
    ];
  }
  
  // Inhalers
  if (/inhaler|aerosol|inhalation/i.test(formLower)) {
    return [
      { value: 1, label: '1 inhaler' },
      { value: 2, label: '2 inhalers' },
      { value: 3, label: '3 inhalers' }
    ];
  }
  
  // Topicals (creams, ointments, gels)
  if (/cream|ointment|gel|lotion|foam/i.test(formLower)) {
    return [
      { value: 1, label: '1 tube' },
      { value: 2, label: '2 tubes' },
      { value: 3, label: '3 tubes' }
    ];
  }
  
  // Liquids (solutions, suspensions, syrups)
  if (/solution|suspension|syrup|liquid|elixir/i.test(formLower)) {
    return [
      { value: 1, label: '1 bottle' },
      { value: 2, label: '2 bottles' },
      { value: 3, label: '3 bottles' }
    ];
  }
  
  // Tablets and Capsules (most common)
  const unit = /capsule/i.test(formLower) ? 'capsules' : 'tablets';
  return [
    { value: 6, label: `6 ${unit}` },
    { value: 10, label: `10 ${unit}` },
    { value: 14, label: `14 ${unit}` },
    { value: 20, label: `20 ${unit}` },
    { value: 30, label: `30 ${unit}` },
    { value: 60, label: `60 ${unit}` },
    { value: 90, label: `90 ${unit}` },
    { value: 180, label: `180 ${unit}` }
  ];
}

interface EditMedicationModalProps {
  medication: Medication;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedMedication: Medication) => Promise<void>;
}

interface FormulationData {
  strengths: string[];
  forms: string[];
  formulations: Array<{
    rxcui: string;
    name: string;
    strength: string;
    form: string;
    tty: 'SCD' | 'SBD';
    isBrand: boolean;
  }>;
  quantityOptions: Array<{ value: number; label: string }>;
}

export default function EditMedicationModal({
  medication,
  isOpen,
  onClose,
  onSave
}: EditMedicationModalProps) {
  const [loading, setLoading] = useState(false);
  const [formulationData, setFormulationData] = useState<FormulationData | null>(null);
  
  // Form state - mirroring GoodRx structure
  const [selectedType, setSelectedType] = useState<'generic' | 'brand'>('generic'); // Brand/Generic toggle
  const [selectedForm, setSelectedForm] = useState('');
  const [selectedStrength, setSelectedStrength] = useState('');
  const [selectedQuantity, setSelectedQuantity] = useState('');
  const [customQuantity, setCustomQuantity] = useState('');
  const [frequency, setFrequency] = useState(medication.frequency || '');
  const [notes, setNotes] = useState(medication.notes || '');
  
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Load formulation data when modal opens
  useEffect(() => {
    if (isOpen && medication.rxcui) {
      loadFormulations();
    }
  }, [isOpen, medication.rxcui]);

  async function loadFormulations() {
    if (!medication.rxcui) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const data = await getAvailableFormulations(medication.rxcui);
      setFormulationData(data);
      
      // Parse current medication to set initial values
      const isBrand = medication.name.includes('[') && medication.name.includes(']');
      setSelectedType(isBrand ? 'brand' : 'generic');
      
      // Try to detect current form and strength from name
      const currentForm = data.forms.find(f => 
        medication.name.toLowerCase().includes(f.toLowerCase())
      );
      const currentStrength = data.strengths.find(s => 
        medication.name.toLowerCase().includes(s.toLowerCase())
      );
      
      if (currentForm) setSelectedForm(currentForm);
      if (currentStrength) setSelectedStrength(currentStrength);
      
      // Set quantity from medication.quantity
      setSelectedQuantity(medication.quantity || '');
      
    } catch (err) {
      console.error('Error loading formulations:', err);
      setError('Failed to load medication options');
    } finally {
      setLoading(false);
    }
  }

  // Get filtered formulations based on selections
  function getFilteredFormulations() {
    if (!formulationData) return [];
    
    return formulationData.formulations.filter(f => {
      const typeMatch = selectedType === 'brand' ? f.isBrand : !f.isBrand;
      const formMatch = !selectedForm || f.form === selectedForm;
      const strengthMatch = !selectedStrength || f.strength === selectedStrength;
      return typeMatch && formMatch && strengthMatch;
    });
  }

  // Get quantity options based on selected form (dynamically generated)
  function getQuantityOptions() {
    if (!selectedForm) {
      return [];
    }
    
    // Generate form-specific quantity options
    return getQuantityOptionsForForm(selectedForm);
  }

  async function handleSave() {
    try {
      setSaving(true);
      setError(null);
      
      // Validate selections
      if (!selectedForm || !selectedStrength) {
        setError('Please select both form and dosage');
        return;
      }
      
      const quantity = selectedQuantity === 'custom' ? customQuantity : selectedQuantity;
      if (!quantity) {
        setError('Please select or enter a quantity');
        return;
      }
      
      // Find the matching formulation
      const filteredFormulations = getFilteredFormulations();
      const matchingFormulation = filteredFormulations.find(
        f => f.form === selectedForm && f.strength === selectedStrength
      );
      
      if (!matchingFormulation) {
        setError('Could not find matching medication');
        return;
      }
      
      // Build updated medication
      const updatedMedication: Medication = {
        ...medication,
        name: matchingFormulation.name,
        rxcui: matchingFormulation.rxcui,
        quantity,
        frequency,
        notes,
        updatedAt: new Date().toISOString()
      };
      
      await onSave(updatedMedication);
      onClose();
      
    } catch (err) {
      console.error('Error saving medication:', err);
      setError('Failed to save changes');
    } finally {
      setSaving(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-gray-900">Edit prescription</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6 space-y-6">
          {loading ? (
            <div className="text-center py-8 text-gray-600">
              Loading medication options...
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
              {error}
            </div>
          ) : formulationData ? (
            <>
              {/* 1. Medication options (Brand/Generic) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Medication options
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value as 'generic' | 'brand')}
                  className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="generic">Generic</option>
                  <option value="brand">Brand name</option>
                </select>
              </div>

              {/* 2. Form */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Form
                </label>
                <select
                  value={selectedForm}
                  onChange={(e) => setSelectedForm(e.target.value)}
                  className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select form...</option>
                  {formulationData.forms.map((form) => (
                    <option key={form} value={form}>
                      {form}
                    </option>
                  ))}
                </select>
              </div>

              {/* 3. Dosage (Strength) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dosage
                </label>
                <select
                  value={selectedStrength}
                  onChange={(e) => setSelectedStrength(e.target.value)}
                  disabled={!selectedForm}
                  className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">Select dosage...</option>
                  {formulationData.strengths.map((strength) => (
                    <option key={strength} value={strength}>
                      {strength}
                    </option>
                  ))}
                </select>
              </div>

              {/* 4. Quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity
                </label>
                <select
                  value={selectedQuantity}
                  onChange={(e) => setSelectedQuantity(e.target.value)}
                  disabled={!selectedForm}
                  className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">Select quantity...</option>
                  {getQuantityOptions().map((option) => (
                    <option key={option.value} value={option.label}>
                      {option.label}
                    </option>
                  ))}
                  <option value="custom">Custom quantity...</option>
                </select>
              </div>

              {/* Custom quantity input (shown when "custom" selected) */}
              {selectedQuantity === 'custom' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Custom quantity
                  </label>
                  <input
                    type="text"
                    value={customQuantity}
                    onChange={(e) => setCustomQuantity(e.target.value)}
                    placeholder="e.g., 45 tablets"
                    className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}

              {/* Additional fields: Frequency and Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Frequency
                </label>
                <input
                  type="text"
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  placeholder="e.g., Once daily"
                  className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any notes about this medication..."
                  rows={3}
                  className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-gray-600">
              No medication data available
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-6 py-3 text-lg font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || loading || !selectedForm || !selectedStrength}
            className="px-6 py-3 text-lg font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Update'}
          </button>
        </div>
      </div>
    </div>
  );
}
