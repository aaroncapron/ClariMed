'use client';

import { useState, useEffect, useRef } from 'react';
import type { Medication } from '@/types';
import { searchDrugs, parseDosage, parseForm, type DrugSearchResult } from '@/lib/rxnav';
import { isLikelyMaintenanceMed, getMaintenanceReason } from '@/lib/maintenance';
import { checkAllergyConflicts, getAllergies } from '@/lib/allergies';

interface AddMedicationFormProps {
  onSubmit: (data: Omit<Medication, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  initialData?: Medication;
  isEditing?: boolean;
}

export default function AddMedicationForm({ onSubmit, onCancel, initialData, isEditing = false }: AddMedicationFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [dosage, setDosage] = useState(initialData?.dosage || '');
  const [frequency, setFrequency] = useState(initialData?.frequency || '');
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [isMaintenance, setIsMaintenance] = useState(initialData?.isMaintenance ?? false);
  
  // Autocomplete state
  const [searchResults, setSearchResults] = useState<DrugSearchResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRxcui, setSelectedRxcui] = useState<string | undefined>(initialData?.rxcui);
  const [maintenanceReason, setMaintenanceReason] = useState<string | null>(null);
  const [justSelected, setJustSelected] = useState(false); // Track if user just selected from dropdown
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Allergy warning state
  const [allergyWarning, setAllergyWarning] = useState<string | null>(null);
  const [isCheckingAllergies, setIsCheckingAllergies] = useState(false);

  // Debounced search effect
  useEffect(() => {
    // Don't show dropdown if user just selected something
    if (justSelected) {
      return;
    }

    const timer = setTimeout(async () => {
      if (name.length >= 2 && !isEditing) { // Don't autocomplete when editing
        setIsLoading(true);
        const results = await searchDrugs(name);
        // Results are already sorted by rxnav.ts: Form → Generic/Brand → Alphabetical
        setSearchResults(results);
        setShowDropdown(results.length > 0);
        setIsLoading(false);
      } else {
        setSearchResults([]);
        setShowDropdown(false);
      }
    }, 150); // Reduced from 300ms to 150ms for faster response

    return () => clearTimeout(timer);
  }, [name, isEditing, justSelected]);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectDrug = (drug: DrugSearchResult) => {
    // Use displayName for brands (formatted), or regular name for generics
    const medicationName = drug.displayName || drug.name;
    setName(medicationName);
    setSelectedRxcui(drug.rxcui);
    setShowDropdown(false);
    setJustSelected(true); // Mark that user just selected - prevents dropdown from reopening
    
    // Auto-fill dosage if we can parse it
    const extractedDosage = parseDosage(drug.name); // Use original name for parsing
    if (extractedDosage) {
      setDosage(extractedDosage);
    }
    
    const isMaintenanceDrug = isLikelyMaintenanceMed(medicationName);
    setIsMaintenance(isMaintenanceDrug);
    
    const reason = getMaintenanceReason(medicationName);
    setMaintenanceReason(reason);
    
    // Check for allergy conflicts
    checkForAllergyConflicts(medicationName);
  };
  
  // Check for allergy conflicts
  const checkForAllergyConflicts = async (medicationName: string) => {
    try {
      setIsCheckingAllergies(true);
      setAllergyWarning(null);
      
      // Fetch user's allergies
      const allergies = await getAllergies();
      const conflicts = checkAllergyConflicts(medicationName, allergies);
      
      if (conflicts.length > 0) {
        const allergyNames = conflicts.map(a => a.allergen).join(', ');
        const warningText = `This medication may conflict with your allergies: ${allergyNames}`;
        setAllergyWarning(warningText);
      }
    } catch (err) {
      console.error('Error checking allergies:', err);
    } finally {
      setIsCheckingAllergies(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !dosage.trim() || !frequency.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    onSubmit({
      name: name.trim(),
      dosage: dosage.trim(),
      frequency: frequency.trim(),
      notes: notes.trim() || undefined,
      rxcui: selectedRxcui,
      verified: !!selectedRxcui,
      isMaintenance,
    });

    // Reset form
    setName('');
    setDosage('');
    setFrequency('');
    setNotes('');
    setSelectedRxcui(undefined);
    setIsMaintenance(false);
    setMaintenanceReason(null);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border-2 border-blue-200 p-8 shadow-lg">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">
        {isEditing ? 'Edit Medication' : 'Add Medication'}
      </h2>
      
      <div className="space-y-6">
        {/* Medication Name with Autocomplete */}
        <div className="relative" ref={dropdownRef}>
          <label htmlFor="name" className="block text-base font-semibold text-gray-700 mb-2">
            Medication Name *
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setSelectedRxcui(undefined); // Clear verification if user types manually
              setJustSelected(false); // User is typing again, allow dropdown to show
            }}
            placeholder="e.g., Lisinopril"
            className="w-full px-5 py-4 text-lg border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            required
            autoComplete="off"
          />
          
          {/* Loading indicator */}
          {isLoading && (
            <div className="absolute right-5 top-[52px] text-gray-400">
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          )}
          
          {/* Autocomplete Dropdown */}
          {showDropdown && searchResults.length > 0 && (
            <div className="absolute z-10 w-full mt-2 bg-white border-2 border-gray-300 rounded-xl shadow-xl max-h-64 overflow-y-auto">
              {searchResults.map((drug) => (
                <button
                  key={drug.rxcui}
                  type="button"
                  onClick={() => handleSelectDrug(drug)}
                  className="w-full px-5 py-3 text-left hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0"
                >
                  <div className="font-semibold text-gray-900">{drug.displayName || drug.name}</div>
                  <div className="text-sm text-gray-500 mt-1">
                    {drug.tty === 'SCD' && <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-1" />}
                    {drug.tty === 'SCD' && 'Generic'}
                    {drug.tty === 'SBD' && <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1" />}
                    {drug.tty === 'SBD' && 'Brand'}
                    {drug.form && ` • ${drug.form}`}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Allergy Warning */}
        {allergyWarning && (
          <div className="p-4 bg-red-50 border-2 border-red-300 rounded-xl">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="flex-1">
                <h4 className="font-bold text-red-900 mb-1">Allergy Alert</h4>
                <p className="text-red-800">{allergyWarning}</p>
                <p className="text-sm text-red-700 mt-2">
                  Please consult with your healthcare provider before taking this medication.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Dosage */}
        <div>
          <label htmlFor="dosage" className="block text-base font-semibold text-gray-700 mb-2">
            Dosage *
          </label>
          <input
            type="text"
            id="dosage"
            value={dosage}
            onChange={(e) => setDosage(e.target.value)}
            placeholder="e.g., 10mg"
            className="w-full px-5 py-4 text-lg border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            required
          />
        </div>

        {/* Directions (formerly Frequency) */}
        <div>
          <label htmlFor="frequency" className="block text-base font-semibold text-gray-700 mb-2">
            Directions *
          </label>
          <input
            type="text"
            id="frequency"
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
            placeholder="e.g., Take 1 tablet by mouth once daily"
            className="w-full px-5 py-4 text-lg border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            required
          />
          <p className="text-sm text-gray-500 mt-1">
            How to take this medication (e.g., &quot;Take 2 capsules weekly&quot; or &quot;Split tablet in half, take with food&quot;)
          </p>
        </div>

        {/* Maintenance Medication Checkbox */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-5">
          <label className="flex items-start cursor-pointer group">
            <input
              type="checkbox"
              checked={isMaintenance}
              onChange={(e) => setIsMaintenance(e.target.checked)}
              className="mt-1 h-5 w-5 text-blue-500 border-2 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
            />
            <div className="ml-3 flex-1">
              <span className="text-base font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                This is a maintenance medication
              </span>
              <p className="text-sm text-gray-600 mt-1">
                Medications taken regularly for chronic conditions (e.g., blood pressure, cholesterol, diabetes)
              </p>
              {maintenanceReason && (
                <p className="text-sm text-blue-700 mt-2 font-medium">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500 mr-1.5" />
                  Auto-suggested: {maintenanceReason}
                </p>
              )}
            </div>
          </label>
        </div>

        {/* Notes */}
        <div>
          <label htmlFor="notes" className="block text-base font-semibold text-gray-700 mb-2">
            Notes (optional)
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g., Take with food"
            rows={4}
            className="w-full px-5 py-4 text-lg border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-4 mt-8">
        <button
          type="submit"
          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all hover:shadow-lg active:scale-95"
        >
          {isEditing ? 'Update Medication' : 'Add Medication'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-8 py-4 border-2 border-gray-300 rounded-xl font-semibold text-lg text-gray-700 hover:bg-gray-50 transition-all active:scale-95"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
