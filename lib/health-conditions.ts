/**
 * Health condition management for authenticated users via Supabase.
 */

import type { HealthCondition, HealthConditionFormData, HealthConditionCategory } from '@/types';
import type { HealthConditionRow } from './storage/database.types';
import { createClient } from '@/lib/supabase/client';
import { getCurrentUser } from '@/lib/supabase/auth';

/**
 * Retrieves all health conditions for an authenticated user from Supabase.
 */
async function getHealthConditionsFromSupabase(userId: string): Promise<HealthCondition[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('health_conditions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error loading health conditions from Supabase:', error);
    throw new Error('Failed to load health conditions');
  }

  return (data || []).map((condition: HealthConditionRow) => ({
    id: condition.id,
    user_id: condition.user_id,
    condition: condition.condition,
    category: condition.category as HealthConditionCategory,
    diagnosed_date: condition.diagnosed_date || undefined,
    notes: condition.notes || undefined,
    rxcui: undefined,
    createdAt: condition.created_at,
    updatedAt: condition.updated_at,
  }));
}

/**
 * Adds a new health condition to Supabase.
 */
async function addHealthConditionToSupabase(
  userId: string,
  data: HealthConditionFormData
): Promise<HealthCondition> {
  const supabase = createClient();

  const insertData: Omit<HealthConditionRow, 'id' | 'created_at' | 'updated_at'> = {
    user_id: userId,
    condition: data.condition,
    category: data.category as string,
    diagnosed_date: data.diagnosed_date || null,
    notes: data.notes || null,
  };

  const { data: inserted, error } = await (supabase as any)
    .from('health_conditions')
    .insert(insertData)
    .select()
    .single();

  if (error) {
    console.error('Error adding health condition to Supabase:', error);
    throw new Error('Failed to add health condition');
  }

  return {
    id: inserted.id,
    user_id: inserted.user_id,
    condition: inserted.condition,
    category: inserted.category as HealthConditionCategory,
    diagnosed_date: inserted.diagnosed_date || undefined,
    notes: inserted.notes || undefined,
    rxcui: undefined,
    createdAt: inserted.created_at,
    updatedAt: inserted.updated_at,
  };
}

/**
 * Updates an existing health condition in Supabase.
 */
async function updateHealthConditionInSupabase(
  userId: string,
  id: string,
  data: Partial<HealthConditionFormData>
): Promise<HealthCondition> {
  const supabase = createClient();

  const updateData: Partial<Omit<HealthConditionRow, 'id' | 'user_id' | 'created_at' | 'updated_at'>> = {};
  if (data.condition !== undefined) updateData.condition = data.condition;
  if (data.category !== undefined) updateData.category = data.category as string;
  if (data.diagnosed_date !== undefined) updateData.diagnosed_date = data.diagnosed_date || null;
  if (data.notes !== undefined) updateData.notes = data.notes || null;

  const { data: updated, error } = await (supabase as any)
    .from('health_conditions')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error || !updated) {
    console.error('Error updating health condition in Supabase:', error);
    throw new Error('Failed to update health condition');
  }

  return {
    id: updated.id,
    user_id: updated.user_id,
    condition: updated.condition,
    category: updated.category as HealthConditionCategory,
    diagnosed_date: updated.diagnosed_date || undefined,
    notes: updated.notes || undefined,
    rxcui: undefined,
    createdAt: updated.created_at,
    updatedAt: updated.updated_at,
  };
}

/**
 * Deletes a health condition from Supabase.
 */
async function deleteHealthConditionFromSupabase(userId: string, id: string): Promise<boolean> {
  const supabase = createClient();

  const { error } = await supabase
    .from('health_conditions')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) {
    console.error('Error deleting health condition from Supabase:', error);
    throw new Error('Failed to delete health condition');
  }

  return true;
}

/**
 * Retrieves all health conditions for authenticated user.
 */
export async function getHealthConditions(): Promise<HealthCondition[]> {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error('Authentication required to access health conditions');
  }
  
  return getHealthConditionsFromSupabase(user.id);
}

/**
 * Adds a new health condition for authenticated user.
 */
export async function addHealthCondition(data: HealthConditionFormData): Promise<HealthCondition> {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error('Authentication required to add health conditions');
  }
  
  return addHealthConditionToSupabase(user.id, data);
}

/**
 * Updates an existing health condition for authenticated user.
 */
export async function updateHealthCondition(
  id: string,
  data: Partial<HealthConditionFormData>
): Promise<HealthCondition> {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error('Authentication required to update health conditions');
  }
  
  return updateHealthConditionInSupabase(user.id, id, data);
}

/**
 * Deletes a health condition for authenticated user.
 */
export async function deleteHealthCondition(id: string): Promise<boolean> {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error('Authentication required to delete health conditions');
  }
  
  return deleteHealthConditionFromSupabase(user.id, id);
}
