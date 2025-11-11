/**
 * Supabase medication storage operations.
 * Handles all database interactions for authenticated users.
 */

import type { Medication } from '@/types';
import { createClient } from '@/lib/supabase/client';

/**
 * Retrieves all medications for an authenticated user from Supabase.
 * @param userId - The authenticated user's ID
 * @returns Array of medications
 * @throws Error if database query fails
 */
export async function getMedicationsFromSupabase(userId: string): Promise<Medication[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('medications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error loading medications from Supabase:', error);
    throw new Error('Failed to load medications');
  }

  // Map database fields to frontend format
  return (data || []).map((med: any) => ({
    id: med.id,
    name: med.name,
    quantity: med.quantity || '',
    frequency: med.frequency,
    notes: med.notes || undefined,
    rxcui: med.rxcui || undefined,
    verified: med.verified || false,
    isMaintenance: med.is_maintenance || false,
    therapeuticClass: med.therapeutic_class || undefined,
    ingredients: med.ingredients || undefined,
    refills_remaining: med.refills_remaining !== null ? med.refills_remaining : undefined,
    total_refills: med.total_refills !== null ? med.total_refills : undefined,
    last_fill_date: med.last_fill_date || undefined,
    next_refill_date: med.next_refill_date || undefined,
    last_pickup_date: med.last_pickup_date || undefined,
    estimated_next_pickup: med.estimated_next_pickup || undefined,
    createdAt: med.created_at,
    updatedAt: med.updated_at,
  }));
}

/**
 * Adds a new medication to Supabase for an authenticated user.
 * @param userId - The authenticated user's ID
 * @param data - Medication data without id and timestamps
 * @returns The created medication with database-generated fields
 * @throws Error if insertion fails
 */
export async function addMedicationToSupabase(
  userId: string,
  data: Omit<Medication, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Medication> {
  const supabase = createClient();

  const { data: inserted, error } = await supabase
    .from('medications')
    .insert({
      user_id: userId,
      name: data.name,
      quantity: data.quantity || null,
      frequency: data.frequency,
      notes: data.notes || null,
      rxcui: data.rxcui || null,
      verified: data.verified || false,
      is_maintenance: data.isMaintenance || false,
      therapeutic_class: data.therapeuticClass || null,
      ingredients: data.ingredients || null,
      refills_remaining: data.refills_remaining !== undefined ? data.refills_remaining : null,
      total_refills: data.total_refills !== undefined ? data.total_refills : null,
      last_fill_date: data.last_fill_date || null,
      next_refill_date: data.next_refill_date || null,
      last_pickup_date: data.last_pickup_date || null,
      estimated_next_pickup: data.estimated_next_pickup || null,
    } as any)
    .select()
    .single();

  if (error) {
    console.error('Error adding medication to Supabase:', error);
    throw new Error('Failed to add medication');
  }

  const med: any = inserted;
  return {
    id: med.id,
    name: med.name,
    quantity: med.quantity || '',
    frequency: med.frequency,
    notes: med.notes || undefined,
    rxcui: med.rxcui || undefined,
    verified: med.verified || false,
    isMaintenance: med.is_maintenance || false,
    therapeuticClass: med.therapeutic_class || undefined,
    ingredients: med.ingredients || undefined,
    refills_remaining: med.refills_remaining !== null ? med.refills_remaining : undefined,
    total_refills: med.total_refills !== null ? med.total_refills : undefined,
    last_fill_date: med.last_fill_date || undefined,
    next_refill_date: med.next_refill_date || undefined,
    last_pickup_date: med.last_pickup_date || undefined,
    estimated_next_pickup: med.estimated_next_pickup || undefined,
    createdAt: med.created_at,
    updatedAt: med.updated_at,
  };
}

/**
 * Updates an existing medication in Supabase.
 * @param userId - The authenticated user's ID
 * @param id - Medication ID to update
 * @param data - Partial medication data to update
 * @returns Updated medication
 * @throws Error if update fails or medication not found
 */
export async function updateMedicationInSupabase(
  userId: string,
  id: string,
  data: Partial<Omit<Medication, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<Medication> {
  const supabase = createClient();

  const updateData: any = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.quantity !== undefined) updateData.quantity = data.quantity || null;
  if (data.frequency !== undefined) updateData.frequency = data.frequency;
  if (data.notes !== undefined) updateData.notes = data.notes || null;
  if (data.rxcui !== undefined) updateData.rxcui = data.rxcui || null;
  if (data.verified !== undefined) updateData.verified = data.verified;
  if (data.isMaintenance !== undefined) updateData.is_maintenance = data.isMaintenance;
  if (data.therapeuticClass !== undefined) updateData.therapeutic_class = data.therapeuticClass || null;
  if (data.ingredients !== undefined) updateData.ingredients = data.ingredients || null;
  if (data.refills_remaining !== undefined) updateData.refills_remaining = data.refills_remaining !== undefined ? data.refills_remaining : null;
  if (data.total_refills !== undefined) updateData.total_refills = data.total_refills !== undefined ? data.total_refills : null;
  if (data.last_fill_date !== undefined) updateData.last_fill_date = data.last_fill_date || null;
  if (data.next_refill_date !== undefined) updateData.next_refill_date = data.next_refill_date || null;
  if (data.last_pickup_date !== undefined) updateData.last_pickup_date = data.last_pickup_date || null;
  if (data.estimated_next_pickup !== undefined) updateData.estimated_next_pickup = data.estimated_next_pickup || null;

  const { data: updated, error } = (await (supabase
    .from('medications') as any)
    .update(updateData)
    .eq('id', id)
    .eq('user_id', userId) // Security: ensure user owns this medication
    .select()
    .single()) as any;

  if (error) {
    console.error('Error updating medication in Supabase:', error);
    throw new Error('Failed to update medication');
  }

  const med: any = updated;
  return {
    id: med.id,
    name: med.name,
    quantity: med.quantity || '',
    frequency: med.frequency,
    notes: med.notes || undefined,
    rxcui: med.rxcui || undefined,
    verified: med.verified || false,
    isMaintenance: med.is_maintenance || false,
    therapeuticClass: med.therapeutic_class || undefined,
    ingredients: med.ingredients || undefined,
    refills_remaining: med.refills_remaining !== null ? med.refills_remaining : undefined,
    total_refills: med.total_refills !== null ? med.total_refills : undefined,
    last_fill_date: med.last_fill_date || undefined,
    next_refill_date: med.next_refill_date || undefined,
    last_pickup_date: med.last_pickup_date || undefined,
    estimated_next_pickup: med.estimated_next_pickup || undefined,
    createdAt: med.created_at,
    updatedAt: med.updated_at,
  };
}

/**
 * Deletes a medication from Supabase.
 * @param userId - The authenticated user's ID
 * @param id - Medication ID to delete
 * @returns True if deletion successful
 * @throws Error if deletion fails
 */
export async function deleteMedicationFromSupabase(userId: string, id: string): Promise<boolean> {
  const supabase = createClient();

  const { error } = await supabase
    .from('medications')
    .delete()
    .eq('id', id)
    .eq('user_id', userId); // Security: ensure user owns this medication

  if (error) {
    console.error('Error deleting medication from Supabase:', error);
    throw new Error('Failed to delete medication');
  }

  return true;
}
