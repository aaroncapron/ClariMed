'use client';

import { useState, useEffect } from 'react';
import type { HealthCondition, HealthConditionCategory, HealthConditionFormData } from '@/types';
import { 
  getHealthConditions, 
  addHealthCondition, 
  updateHealthCondition, 
  deleteHealthCondition 
} from '@/lib/health-conditions';
import { getConditionAutocompleteSuggestions } from '@/lib/medical-reference';

export default function HealthConditionList() {
  const [conditions, setConditions] = useState<HealthCondition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<HealthConditionFormData>({
    condition: '',
    category: 'other',
    notes: '',
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<ReturnType<typeof getConditionAutocompleteSuggestions>>([]);

  useEffect(() => {
    loadConditions();
  }, []);

  useEffect(() => {
    if (searchQuery.length < 2) {
      setFilteredSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const suggestions = getConditionAutocompleteSuggestions(searchQuery);
    setFilteredSuggestions(suggestions);
    setShowSuggestions(suggestions.length > 0);
  }, [searchQuery]);

  async function loadConditions() {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getHealthConditions();
      setConditions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load health conditions');
    } finally {
      setIsLoading(false);
    }
  }

  function handleSearchChange(value: string) {
    setSearchQuery(value);
    setFormData({ ...formData, condition: value });
  }

  function selectSuggestion(suggestion: { name: string; category: HealthConditionCategory }) {
    setFormData({
      ...formData,
      condition: suggestion.name,
      category: suggestion.category,
    });
    setSearchQuery(suggestion.name);
    setShowSuggestions(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!formData.condition.trim()) {
      setError('Condition name is required');
      return;
    }

    try {
      setError(null);
      
      if (editingId) {
        const updated = await updateHealthCondition(editingId, formData);
        setConditions(conditions.map(c => c.id === editingId ? updated : c));
        setEditingId(null);
      } else {
        const newCondition = await addHealthCondition(formData);
        setConditions([newCondition, ...conditions]);
        setIsAdding(false);
      }
      
      setFormData({
        condition: '',
        category: 'other',
        notes: '',
      });
      setSearchQuery('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save health condition');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this health condition?')) return;
    
    try {
      setError(null);
      await deleteHealthCondition(id);
      setConditions(conditions.filter(c => c.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete health condition');
    }
  }

  function startEdit(condition: HealthCondition) {
    setEditingId(condition.id);
    setFormData({
      condition: condition.condition,
      category: condition.category,
      diagnosed_date: condition.diagnosed_date || undefined,
      notes: condition.notes || '',
    });
    setSearchQuery(condition.condition);
    setIsAdding(false);
  }

  function cancelEdit() {
    setEditingId(null);
    setIsAdding(false);
    setFormData({
      condition: '',
      category: 'other',
      notes: '',
    });
    setSearchQuery('');
  }

  const getCategoryColor = (category: HealthConditionCategory) => {
    switch (category) {
      case 'cardiovascular': return 'bg-red-100 text-red-800 border-red-300';
      case 'respiratory': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'endocrine': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'gastrointestinal': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'renal': return 'bg-cyan-100 text-cyan-800 border-cyan-300';
      case 'hepatic': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'neurological': return 'bg-pink-100 text-pink-800 border-pink-300';
      case 'pregnancy': return 'bg-green-100 text-green-800 border-green-300';
      case 'other': return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getCategoryLabel = (category: HealthConditionCategory) => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Health Conditions</h2>
        <p className="text-gray-500">Loading health conditions...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-semibold">Health Conditions</h2>
          <p className="text-sm text-gray-600 mt-1">
            Track medical conditions for medication safety checking
          </p>
        </div>
        {!isAdding && !editingId && (
          <button
            onClick={() => setIsAdding(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Add Condition
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700">
          {error}
        </div>
      )}

      {(isAdding || editingId) && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="font-medium mb-3">
            {editingId ? 'Edit Health Condition' : 'Add New Health Condition'}
          </h3>
          
          <div className="space-y-3">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Condition Name *
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                onFocus={() => {
                  if (filteredSuggestions.length > 0) setShowSuggestions(true);
                }}
                placeholder="e.g., Hypertension, Diabetes, Asthma"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              
              {showSuggestions && filteredSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {filteredSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => selectSuggestion(suggestion)}
                      className="w-full text-left px-3 py-2 hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0"
                    >
                      <div className="font-medium text-gray-900">
                        {suggestion.name}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {getCategoryLabel(suggestion.category)}
                        {suggestion.description && ` • ${suggestion.description}`}
                      </div>
                    </button>
                  ))}
                </div>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Start typing to see common conditions, or enter your own
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as HealthConditionCategory })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="cardiovascular">Cardiovascular</option>
                <option value="respiratory">Respiratory</option>
                <option value="endocrine">Endocrine</option>
                <option value="gastrointestinal">Gastrointestinal</option>
                <option value="renal">Renal (Kidney)</option>
                <option value="hepatic">Hepatic (Liver)</option>
                <option value="neurological">Neurological</option>
                <option value="pregnancy">Pregnancy</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Diagnosed Date (optional)
              </label>
              <input
                type="date"
                value={formData.diagnosed_date || ''}
                onChange={(e) => setFormData({ ...formData, diagnosed_date: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes (optional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional details about this condition"
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
              {editingId ? 'Update' : 'Add'} Condition
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

      {conditions.length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          No health conditions recorded. Click &quot;Add Condition&quot; to add one.
        </p>
      ) : (
        <div className="space-y-3">
          {conditions.map((condition) => (
            <div
              key={condition.id}
              className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-lg">{condition.condition}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded border ${getCategoryColor(condition.category)}`}>
                      {getCategoryLabel(condition.category)}
                    </span>
                  </div>
                  {condition.diagnosed_date && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Diagnosed:</span> {new Date(condition.diagnosed_date).toLocaleDateString()}
                    </p>
                  )}
                  {condition.notes && (
                    <p className="text-sm text-gray-600 mt-1">
                      <span className="font-medium">Notes:</span> {condition.notes}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    Added: {new Date(condition.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => startEdit(condition)}
                    className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(condition.id)}
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
