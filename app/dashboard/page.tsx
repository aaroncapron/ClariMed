/**
 * Dashboard Page - Authenticated Users Only
 * 
 * Main medication management interface
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import type { Medication } from '@/types';
import { getMedications, addMedication, updateMedication, deleteMedication } from '@/lib/storage';
import MedicationList from '@/components/MedicationList';
import AddMedicationForm from '@/components/AddMedicationForm';
import FloatingViewToggle from '@/components/FloatingViewToggle';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const router = useRouter();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingMed, setEditingMed] = useState<Medication | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const formRef = useRef<HTMLDivElement>(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/landing');
    }
  }, [user, authLoading, router]);

  // Load medications on mount
  useEffect(() => {
    setMedications(getMedications());
  }, []);

  // Auto-scroll to form when it opens
  useEffect(() => {
    if (showForm && formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [showForm]);

  const handleAdd = (data: Omit<Medication, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingMed) {
      // Update existing medication
      updateMedication(editingMed.id, data);
      setEditingMed(null);
    } else {
      // Add new medication
      addMedication(data);
    }
    setMedications(getMedications());
    setShowForm(false);
  };

  const handleEdit = (med: Medication) => {
    setEditingMed(med);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingMed(null);
  };

  // Filter medications based on search query
  const filteredMedications = medications.filter((med) => {
    const query = searchQuery.toLowerCase();
    return (
      med.name.toLowerCase().includes(query) ||
      med.dosage.toLowerCase().includes(query) ||
      med.frequency.toLowerCase().includes(query) ||
      (med.notes && med.notes.toLowerCase().includes(query))
    );
  });

  const handleDelete = (id: string) => {
    if (confirm('Delete this medication?')) {
      deleteMedication(id);
      setMedications(getMedications());
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header Bar */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-blue-600 mb-1">
                ClariMed
              </h1>
              <p className="text-gray-600 text-sm">
                Welcome back!
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowForm(!showForm)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all hover:shadow-lg active:scale-95"
              >
                {showForm ? '✕ Cancel' : (editingMed ? 'Edit Medication' : '+ Add Medication')}
              </button>
              <button
                onClick={handleSignOut}
                className="text-gray-600 hover:text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-100 transition"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 bg-gray-50">
        <div className="max-w-5xl mx-auto px-6 py-8">

      {/* Search Bar */}
      {!showForm && medications.length > 0 && (
        <div className="mb-8">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search medications by name, dosage, or frequency..."
              className="w-full px-6 py-4 pl-14 text-lg border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
            <svg
              className="absolute left-5 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          {searchQuery && (
            <p className="mt-3 text-sm text-gray-600">
              Found <span className="font-semibold">{filteredMedications.length}</span> medication{filteredMedications.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <div ref={formRef} className="mb-8 scroll-mt-8">
          <AddMedicationForm 
            onSubmit={handleAdd} 
            onCancel={handleCancel}
            initialData={editingMed || undefined}
            isEditing={!!editingMed}
          />
        </div>
      )}

      {/* Medication List */}
      {medications.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-300">
          <div className="text-6xl mb-4">💊</div>
          <p className="text-gray-600 text-xl font-medium mb-2">No medications yet</p>
          <p className="text-gray-400">Click &quot;Add Medication&quot; above to get started</p>
        </div>
      ) : filteredMedications.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-300">
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-gray-600 text-xl font-medium mb-2">No medications found</p>
          <p className="text-gray-400">Try a different search term</p>
        </div>
      ) : (
        <MedicationList 
          medications={filteredMedications} 
          onDelete={handleDelete}
          onEdit={handleEdit}
        />
      )}
        </div>
      </main>

      {/* Floating View Mode Toggle */}
      <FloatingViewToggle />
    </div>
  );
}
