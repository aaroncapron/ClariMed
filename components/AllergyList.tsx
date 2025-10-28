'use client';

import { useState, useEffect, useRef } from 'react';
import type { Allergy, AllergySeverity, AllergyFormData } from '@/types';
import { getAllergies, addAllergy, updateAllergy, deleteAllergy } from '@/lib/allergies';
import { searchDrugs, type DrugSearchResult } from '@/lib/rxnav';

export default function AllergyList() {
  const [allergies, setAllergies] = useState<Allergy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<AllergyFormData>({
    allergen: '',
    severity: 'moderate',
    reaction: '',
  });

  // Autocomplete state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<DrugSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load allergies on mount
  useEffect(() => {
    loadAllergies();
  }, []);

  // Handle click outside dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle search with debounce
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const results = await searchDrugs(searchQuery);
        setSearchResults(results);
        setShowDropdown(results.length > 0);
      } catch (err) {
        console.error('Search error:', err);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  async function loadAllergies() {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getAllergies();
      setAllergies(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load allergies');
    } finally {
      setIsLoading(false);
    }
  }

  function handleSearchChange(value: string) {
    setSearchQuery(value);
    setFormData({ ...formData, allergen: value, rxcui: undefined });
  }

  function selectDrug(drug: DrugSearchResult) {
    setFormData({
      ...formData,
      allergen: drug.displayName || drug.name,
      rxcui: drug.rxcui,
    });
    setSearchQuery(drug.displayName || drug.name);
    setShowDropdown(false);
    setSearchResults([]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!formData.allergen.trim()) {
      setError('Allergen name is required');
      return;
    }

    try {
      setError(null);
      
      if (editingId) {
        // Update existing allergy
        const updated = await updateAllergy(editingId, formData);
        setAllergies(allergies.map(a => a.id === editingId ? updated : a));
        setEditingId(null);
      } else {
        // Add new allergy
        const newAllergy = await addAllergy(formData);
        setAllergies([newAllergy, ...allergies]);
        setIsAdding(false);
      }
      
      // Reset form
      setFormData({
        allergen: '',
        severity: 'moderate',
        reaction: '',
      });
      setSearchQuery('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save allergy');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this allergy?')) return;
    
    try {
      setError(null);
      await deleteAllergy(id);
      setAllergies(allergies.filter(a => a.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete allergy');
    }
  }

  function startEdit(allergy: Allergy) {
    setEditingId(allergy.id);
    setFormData({
      allergen: allergy.allergen,
      severity: allergy.severity,
      reaction: allergy.reaction || '',
      rxcui: allergy.rxcui,
    });
    setSearchQuery(allergy.allergen);
    setIsAdding(false);
  }

  function cancelEdit() {
    setEditingId(null);
    setIsAdding(false);
    setFormData({
      allergen: '',
      severity: 'moderate',
      reaction: '',
    });
    setSearchQuery('');
  }

  const getSeverityColor = (severity: AllergySeverity) => {
    switch (severity) {
      case 'mild': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'moderate': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'severe': return 'bg-red-100 text-red-800 border-red-300';
      case 'anaphylaxis': return 'bg-purple-100 text-purple-800 border-purple-300';
    }
  };

  const getSeverityLabel = (severity: AllergySeverity) => {
    return severity.charAt(0).toUpperCase() + severity.slice(1);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Allergies</h2>
        <p className="text-gray-500">Loading allergies...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Allergies</h2>
        {!isAdding && !editingId && (
          <button
            onClick={() => setIsAdding(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Add Allergy
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700">
          {error}
        </div>
      )}

      {/* Add/Edit Form */}
      {(isAdding || editingId) && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="font-medium mb-3">
            {editingId ? 'Edit Allergy' : 'Add New Allergy'}
          </h3>
          
          <div className="space-y-3">
            <div className="relative" ref={dropdownRef}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Allergen Name *
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                onFocus={() => {
                  if (searchResults.length > 0) setShowDropdown(true);
                }}
                placeholder="Search medications (e.g., Penicillin, Sulfa drugs)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              {isSearching && (
                <div className="absolute right-3 top-9 text-gray-400">
                  <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                </div>
              )}
              
              {/* Autocomplete Dropdown */}
              {showDropdown && searchResults.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {searchResults.map((drug) => (
                    <button
                      key={drug.rxcui}
                      type="button"
                      onClick={() => selectDrug(drug)}
                      className="w-full text-left px-3 py-2 hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0"
                    >
                      <div className="font-medium text-gray-900">
                        {drug.displayName || drug.name}
                      </div>
                      {drug.tty && (
                        <div className="text-xs text-gray-500 mt-0.5">
                          {drug.tty === 'SCD' ? 'Generic' : drug.tty === 'SBD' ? 'Brand' : drug.tty}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Search for medication allergens or enter custom allergen (e.g., food, environmental)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Severity *
              </label>
              <select
                value={formData.severity}
                onChange={(e) => setFormData({ ...formData, severity: e.target.value as AllergySeverity })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="mild">Mild</option>
                <option value="moderate">Moderate</option>
                <option value="severe">Severe</option>
                <option value="anaphylaxis">Anaphylaxis</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reaction (optional)
              </label>
              <textarea
                value={formData.reaction}
                onChange={(e) => setFormData({ ...formData, reaction: e.target.value })}
                placeholder="e.g., Hives, difficulty breathing, swelling"
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {editingId ? 'Update' : 'Add'} Allergy
            </button>
            <button
              type="button"
              onClick={cancelEdit}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Allergies List */}
      {allergies.length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          No allergies recorded. Click "Add Allergy" to add one.
        </p>
      ) : (
        <div className="space-y-3">
          {allergies.map((allergy) => (
            <div
              key={allergy.id}
              className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-lg">{allergy.allergen}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded border ${getSeverityColor(allergy.severity)}`}>
                      {getSeverityLabel(allergy.severity)}
                    </span>
                  </div>
                  {allergy.reaction && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Reaction:</span> {allergy.reaction}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    Added: {new Date(allergy.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => startEdit(allergy)}
                    className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(allergy.id)}
                    className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
