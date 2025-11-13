'use client';

import { useState, useEffect, useRef } from 'react';
import type { Medication, Allergy } from '@/types';
import { searchDrugs, parseDosage, parseForm, getSuggestedDirections, getSuggestedQuantity, type DrugSearchResult } from '@/lib/rxnav';
import { isLikelyMaintenanceMed, getMaintenanceReason } from '@/lib/maintenance';
import { checkAllergyConflictsAsync, getAllergies } from '@/lib/allergies';
import { checkMedicationInteractions, getSeverityBadge, type DrugInteraction } from '@/lib/interactions';
import { checkContraindications, type ContraindicationWarning } from '@/lib/contraindications';
import { getHealthConditions } from '@/lib/health-conditions';

interface AddMedicationFormProps {
  onSubmit: (data: Omit<Medication, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  initialData?: Medication;
  isEditing?: boolean;
  existingMedications?: Medication[];
}

export default function AddMedicationForm({ onSubmit, onCancel, initialData, isEditing = false, existingMedications = [] }: AddMedicationFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [quantity, setQuantity] = useState(initialData?.quantity || '');
  const [frequency, setFrequency] = useState(initialData?.frequency || '');
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [isMaintenance, setIsMaintenance] = useState(initialData?.isMaintenance ?? false);
  
  // Refill tracking
  const [refillsRemaining, setRefillsRemaining] = useState<number | undefined>(initialData?.refills_remaining);
  const [totalRefills, setTotalRefills] = useState<number | undefined>(initialData?.total_refills);
  const [lastPickupDate, setLastPickupDate] = useState<string>(initialData?.last_pickup_date || '');
  
  // Autocomplete state
  const [searchResults, setSearchResults] = useState<DrugSearchResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRxcui, setSelectedRxcui] = useState<string | undefined>(initialData?.rxcui);
  const [maintenanceReason, setMaintenanceReason] = useState<string | null>(null);
  const [justSelected, setJustSelected] = useState(false);
  const [suggestedDirections, setSuggestedDirections] = useState<string>('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Allergy warning state
  const [allergyConflicts, setAllergyConflicts] = useState<{ allergy: Allergy; conflictingIngredient: string }[]>([]);
  const [isCheckingAllergies, setIsCheckingAllergies] = useState(false);
  
  // Drug interaction warning state
  const [interactions, setInteractions] = useState<DrugInteraction[]>([]);
  const [isCheckingInteractions, setIsCheckingInteractions] = useState(false);
  
  // Contraindication warning state
  const [contraindications, setContraindications] = useState<ContraindicationWarning[]>([]);
  const [isCheckingContraindications, setIsCheckingContraindications] = useState(false);
  
  // Confirmation dialog state
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingSubmitData, setPendingSubmitData] = useState<Omit<Medication, 'id' | 'createdAt' | 'updatedAt'> | null>(null);

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
    const medicationName = drug.displayName || drug.name;
    setName(medicationName);
    setSelectedRxcui(drug.rxcui);
    setShowDropdown(false);
    setJustSelected(true);
    
    // Get suggested directions (using parsed dosage for context)
    const extractedStrength = parseDosage(drug.name);
    const suggested = getSuggestedDirections(drug.name, extractedStrength);
    setSuggestedDirections(suggested);
    
    // Get suggested quantity
    const suggestedQty = getSuggestedQuantity(drug.name, suggested);
    if (suggestedQty) {
      setQuantity(suggestedQty);
    }
    
    // Auto-populate directions if empty
    if (!frequency && suggested) {
      setFrequency(suggested);
    }
    
    const isMaintenanceDrug = isLikelyMaintenanceMed(medicationName);
    setIsMaintenance(isMaintenanceDrug);
    
    const reason = getMaintenanceReason(medicationName);
    setMaintenanceReason(reason);
    
    checkForAllergyConflicts(medicationName, drug.rxcui);
    checkForInteractions(medicationName, drug.rxcui);
    checkForContraindications(medicationName, drug.rxcui);
  };
  
  // Check for allergy conflicts using new API-driven function
  const checkForAllergyConflicts = async (medicationName: string, rxcui?: string) => {
    if (!rxcui) {
      setAllergyConflicts([]);
      return;
    }
    
    try {
      setIsCheckingAllergies(true);
      setAllergyConflicts([]);
      
      const allergies = await getAllergies();
      
      // Create a temporary medication object for checking
      const tempMedication: Medication = {
        id: 'temp',
        name: medicationName,
        rxcui,
        quantity: '',
        frequency: '',
        isMaintenance: false,
        verified: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      const conflicts = await checkAllergyConflictsAsync(tempMedication, allergies);
      setAllergyConflicts(conflicts);
    } catch (err) {
      console.error('Error checking allergies:', err);
    } finally {
      setIsCheckingAllergies(false);
    }
  };
  
  /**
   * Checks for drug interactions with existing medications.
   * This is informational only and does not constitute medical advice.
   */
  const checkForInteractions = async (medicationName: string, rxcui?: string) => {
    if (!rxcui || isEditing) {
      setInteractions([]);
      return;
    }
    
    try {
      setIsCheckingInteractions(true);
      setInteractions([]);
      
      const foundInteractions = await checkMedicationInteractions(
        { name: medicationName, rxcui },
        existingMedications
      );
      
      setInteractions(foundInteractions);
    } catch (err) {
      console.error('Error checking interactions:', err);
    } finally {
      setIsCheckingInteractions(false);
    }
  };

  /**
   * Checks for contraindications with user's health conditions using new API-driven function.
   * This is informational only and does not constitute medical advice.
   */
  const checkForContraindications = async (medicationName: string, rxcui?: string) => {
    if (isEditing || !rxcui) {
      setContraindications([]);
      return;
    }
    
    try {
      setIsCheckingContraindications(true);
      setContraindications([]);
      
      const healthConditions = await getHealthConditions();
      
      // Create a temporary medication object for checking
      const tempMedication: Medication = {
        id: 'temp',
        name: medicationName,
        rxcui,
        quantity: '',
        frequency: '',
        isMaintenance: false,
        verified: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      const warnings = await checkContraindications(tempMedication, healthConditions);
      setContraindications(warnings);
    } catch (err) {
      console.error('Error checking contraindications:', err);
    } finally {
      setIsCheckingContraindications(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !quantity.trim() || !frequency.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    const medicationData = {
      name: name.trim(),
      quantity: quantity.trim(),
      frequency: frequency.trim(),
      notes: notes.trim() || undefined,
      rxcui: selectedRxcui,
      verified: !!selectedRxcui,
      isMaintenance,
      refills_remaining: refillsRemaining,
      total_refills: totalRefills,
      last_pickup_date: lastPickupDate || undefined,
    };

    // Check if there are any warnings (allergies, interactions, or contraindications)
    const hasWarnings = allergyConflicts.length > 0 || interactions.length > 0 || contraindications.length > 0;
    
    if (hasWarnings && !isEditing) {
      // Show confirmation dialog
      setPendingSubmitData(medicationData);
      setShowConfirmDialog(true);
    } else {
      // No warnings or editing mode, proceed directly
      submitMedication(medicationData);
    }
  };

  const submitMedication = async (data: Omit<Medication, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await onSubmit(data);

      // Reset form only after successful submission
      setName('');
      setQuantity('');
      setFrequency('');
      setNotes('');
      setSelectedRxcui(undefined);
      setIsMaintenance(false);
      setMaintenanceReason(null);
      setSuggestedDirections('');
      setRefillsRemaining(undefined);
      setTotalRefills(undefined);
      setLastPickupDate('');
      setAllergyConflicts([]);
      setInteractions([]);
      setContraindications([]);
      setShowConfirmDialog(false);
      setPendingSubmitData(null);
    } catch (error) {
      console.error('Error submitting medication:', error);
      alert('Failed to add medication. Please try again.');
    }
  };

  const handleConfirmAdd = () => {
    if (pendingSubmitData) {
      submitMedication(pendingSubmitData);
    }
  };

  const handleCancelConfirm = () => {
    setShowConfirmDialog(false);
    setPendingSubmitData(null);
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
        {allergyConflicts.length > 0 && (
          <div className="space-y-3">
            {allergyConflicts.map((conflict, index) => (
              <div key={index} className="p-4 bg-red-50 border-2 border-red-300 rounded-xl">
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div className="flex-1">
                    <h4 className="font-bold text-red-900 mb-1">Allergy Alert</h4>
                    <p className="text-red-800 mb-1">
                      This medication may conflict with your allergy to <span className="font-semibold">{conflict.allergy.allergen}</span>
                    </p>
                    <p className="text-sm text-red-700">
                      Conflicting ingredient: {conflict.conflictingIngredient}
                    </p>
                    <p className="text-sm text-red-700 mt-2">
                      ⚠️ Please consult with your healthcare provider or pharmacist before taking this medication.
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Drug Interaction Warnings */}
        {interactions.length > 0 && (
          <div className="space-y-3">
            {interactions.map((interaction, index) => {
              const badge = getSeverityBadge(interaction.severity);
              return (
                <div key={index} className="p-4 bg-amber-50 border-2 border-amber-300 rounded-xl">
                  <div className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-bold text-amber-900">Potential Drug Interaction</h4>
                        <span className={`px-2 py-1 text-xs font-semibold rounded border ${badge.color}`}>
                          {badge.label}
                        </span>
                      </div>
                      <p className="text-amber-800 mb-1">
                        <span className="font-semibold">{interaction.drugB.name}</span>
                      </p>
                      <p className="text-amber-700 text-sm mb-3">{interaction.description}</p>
                      <p className="text-xs text-amber-600 italic">
                        This information is for educational purposes only. Always consult your healthcare provider about potential drug interactions before starting or stopping any medication.
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Quantity */}
        <div>
          <label htmlFor="quantity" className="block text-base font-semibold text-gray-700 mb-2">
            Quantity *
          </label>
          <input
            type="text"
            id="quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="e.g., 30 tablets, 1 patch box, 90 capsules"
            className="w-full px-5 py-4 text-lg border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            required
          />
          <p className="text-sm text-gray-500 mt-1">
            How much was dispensed (e.g., &quot;30 tablets&quot; for a 30-day supply)
          </p>
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
          {suggestedDirections && suggestedDirections !== frequency && (
            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <span className="font-semibold">💡 Suggested directions: </span>
                {suggestedDirections}
              </p>
              <button
                type="button"
                onClick={() => setFrequency(suggestedDirections)}
                className="mt-2 text-xs text-blue-600 hover:text-blue-700 font-medium underline"
              >
                Use this suggestion
              </button>
            </div>
          )}
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

        {/* Refill Tracking Section */}
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-xl p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Refill Tracking (Optional)
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Track your refills to know when to call your doctor or pharmacy
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Refills Remaining */}
            <div>
              <label htmlFor="refillsRemaining" className="block text-sm font-semibold text-gray-700 mb-2">
                Refills Remaining
              </label>
              <input
                type="number"
                id="refillsRemaining"
                value={refillsRemaining ?? ''}
                onChange={(e) => setRefillsRemaining(e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="e.g., 2"
                min="0"
                className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
              />
            </div>

            {/* Total Refills */}
            <div>
              <label htmlFor="totalRefills" className="block text-sm font-semibold text-gray-700 mb-2">
                Total Refills Authorized
              </label>
              <input
                type="number"
                id="totalRefills"
                value={totalRefills ?? ''}
                onChange={(e) => setTotalRefills(e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="e.g., 5"
                min="0"
                className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
              />
            </div>

            {/* Last Pickup Date */}
            <div className="md:col-span-2">
              <label htmlFor="lastPickupDate" className="block text-sm font-semibold text-gray-700 mb-2">
                Last Pickup Date
              </label>
              <input
                type="date"
                id="lastPickupDate"
                value={lastPickupDate}
                onChange={(e) => setLastPickupDate(e.target.value)}
                className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
              />
              <p className="text-xs text-gray-500 mt-1">
                When did you last pick up this prescription from the pharmacy?
              </p>
            </div>
          </div>

          {refillsRemaining !== undefined && refillsRemaining <= 1 && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-300 rounded-lg">
              <p className="text-sm text-amber-800 font-medium flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {refillsRemaining === 0 
                  ? 'No refills remaining! Contact your doctor for a new prescription.'
                  : 'Low on refills. Consider contacting your doctor soon.'}
              </p>
            </div>
          )}
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

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Potential Safety Concerns Detected
                  </h3>
                  <p className="text-gray-700">
                    We found potential safety concerns with this medication. Please review the warnings below before proceeding.
                  </p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                {allergyConflicts.map((conflict, index) => (
                  <div key={`allergy-${index}`} className="p-4 bg-red-50 border-2 border-red-300 rounded-xl">
                    <h4 className="font-bold text-red-900 mb-2 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      Allergy Alert
                    </h4>
                    <p className="text-red-900 font-medium text-sm mb-1">
                      Allergy: {conflict.allergy.allergen}
                    </p>
                    <p className="text-red-800 text-sm">
                      Conflicting ingredient: {conflict.conflictingIngredient}
                    </p>
                  </div>
                ))}

                {interactions.map((interaction, index) => {
                  const badge = getSeverityBadge(interaction.severity);
                  return (
                    <div key={index} className="p-4 bg-amber-50 border-2 border-amber-300 rounded-xl">
                      <div className="flex items-start gap-2 mb-2">
                        <h4 className="font-bold text-amber-900 flex items-center gap-2">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          Drug Interaction
                        </h4>
                        <span className={`px-2 py-1 text-xs font-semibold rounded border ${badge.color}`}>
                          {badge.label}
                        </span>
                      </div>
                      <p className="text-amber-900 font-medium text-sm mb-1">
                        Interacts with: {interaction.drugB.name}
                      </p>
                      <p className="text-amber-800 text-sm">{interaction.description}</p>
                    </div>
                  );
                })}

                {contraindications.map((warning, index) => {
                  const severityColors = {
                    critical: 'border-red-400 bg-red-50',
                    major: 'border-orange-400 bg-orange-50',
                    moderate: 'border-yellow-400 bg-yellow-50',
                    minor: 'border-blue-400 bg-blue-50',
                  };
                  const severityTextColors = {
                    critical: 'text-red-900',
                    major: 'text-orange-900',
                    moderate: 'text-yellow-900',
                    minor: 'text-blue-900',
                  };
                  const severityBadgeColors = {
                    critical: 'bg-red-100 text-red-800 border-red-300',
                    major: 'bg-orange-100 text-orange-800 border-orange-300',
                    moderate: 'bg-yellow-100 text-yellow-800 border-yellow-300',
                    minor: 'bg-blue-100 text-blue-800 border-blue-300',
                  };
                  
                  return (
                    <div key={`contra-${index}`} className={`p-4 border-2 rounded-xl ${severityColors[warning.severity]}`}>
                      <div className="flex items-start gap-2 mb-2">
                        <h4 className={`font-bold flex items-center gap-2 ${severityTextColors[warning.severity]}`}>
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Health Condition Alert
                        </h4>
                        <span className={`px-2 py-1 text-xs font-semibold rounded border ${severityBadgeColors[warning.severity]}`}>
                          {warning.severity.toUpperCase()}
                        </span>
                      </div>
                      <p className={`font-medium text-sm mb-1 ${severityTextColors[warning.severity]}`}>
                        Condition: {warning.condition}
                      </p>
                      <p className={`text-sm ${severityTextColors[warning.severity]}`}>
                        {warning.description}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-xl mb-6">
                <p className="text-sm text-blue-900 font-medium mb-2">
                  Important: This information is for educational purposes only.
                </p>
                <p className="text-sm text-blue-800">
                  Always consult your healthcare provider before starting, stopping, or changing any medication. 
                  They can provide personalized medical advice based on your complete health history.
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={handleCancelConfirm}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-all"
                >
                  Review Information
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAdd}
                  className="flex-1 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-semibold transition-all"
                >
                  I Understand, Add Anyway
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
