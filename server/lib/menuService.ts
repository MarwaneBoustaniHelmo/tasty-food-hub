/**
 * Menu Management Service (Backend Only)
 * 
 * This module provides admin functions to manage categories and menu items
 * using the service_role key which bypasses RLS policies.
 * 
 * ⚠️ SECURITY: Never expose these functions to the frontend!
 * ⚠️ These operations should only be called from authenticated admin routes.
 */

import { supabaseAdmin } from './supabaseAdmin';

/**
 * Category Management
 */

export async function createCategory(category: {
  name: string;
  name_en?: string;
  name_nl?: string;
  icon?: string;
  sort_order?: number;
}) {
  if (!supabaseAdmin) {
    throw new Error('Supabase admin client not configured');
  }

  const { data, error } = await supabaseAdmin
    .from('categories')
    .insert(category)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateCategory(id: string, updates: {
  name?: string;
  name_en?: string;
  name_nl?: string;
  icon?: string;
  sort_order?: number;
}) {
  if (!supabaseAdmin) {
    throw new Error('Supabase admin client not configured');
  }

  const { data, error } = await supabaseAdmin
    .from('categories')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteCategory(id: string) {
  if (!supabaseAdmin) {
    throw new Error('Supabase admin client not configured');
  }

  const { error } = await supabaseAdmin
    .from('categories')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

/**
 * Menu Item Management
 */

export async function createMenuItem(item: {
  category_id: string;
  name: string;
  name_en?: string;
  name_nl?: string;
  description?: string;
  description_en?: string;
  description_nl?: string;
  price: number;
  image_url?: string;
  is_available?: boolean;
  is_best_seller?: boolean;
  is_new?: boolean;
  is_spicy?: boolean;
  nutritional_info?: any;
  extras?: any;
  sort_order?: number;
}) {
  if (!supabaseAdmin) {
    throw new Error('Supabase admin client not configured');
  }

  const { data, error } = await supabaseAdmin
    .from('menu_items')
    .insert(item)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateMenuItem(id: string, updates: {
  category_id?: string;
  name?: string;
  name_en?: string;
  name_nl?: string;
  description?: string;
  description_en?: string;
  description_nl?: string;
  price?: number;
  image_url?: string;
  is_available?: boolean;
  is_best_seller?: boolean;
  is_new?: boolean;
  is_spicy?: boolean;
  nutritional_info?: any;
  extras?: any;
  sort_order?: number;
}) {
  if (!supabaseAdmin) {
    throw new Error('Supabase admin client not configured');
  }

  const { data, error } = await supabaseAdmin
    .from('menu_items')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteMenuItem(id: string) {
  if (!supabaseAdmin) {
    throw new Error('Supabase admin client not configured');
  }

  const { error } = await supabaseAdmin
    .from('menu_items')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function toggleMenuItemAvailability(id: string, is_available: boolean) {
  if (!supabaseAdmin) {
    throw new Error('Supabase admin client not configured');
  }

  const { data, error } = await supabaseAdmin
    .from('menu_items')
    .update({ is_available })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function bulkUpdateMenuItemPrices(
  updates: Array<{ id: string; price: number }>
) {
  if (!supabaseAdmin) {
    throw new Error('Supabase admin client not configured');
  }

  const promises = updates.map(({ id, price }) =>
    supabaseAdmin
      .from('menu_items')
      .update({ price })
      .eq('id', id)
  );

  const results = await Promise.all(promises);
  
  const errors = results.filter(r => r.error);
  if (errors.length > 0) {
    throw new Error(`Failed to update ${errors.length} items`);
  }

  return { updated: results.length };
}

/**
 * Query helpers (still use admin for consistency, but read operations 
 * could also use regular client since RLS allows public reads)
 */

export async function getAllCategories() {
  if (!supabaseAdmin) {
    throw new Error('Supabase admin client not configured');
  }

  const { data, error } = await supabaseAdmin
    .from('categories')
    .select('*')
    .order('sort_order');

  if (error) throw error;
  return data;
}

export async function getAllMenuItems(categoryId?: string) {
  if (!supabaseAdmin) {
    throw new Error('Supabase admin client not configured');
  }

  let query = supabaseAdmin
    .from('menu_items')
    .select('*, categories(name, name_en, name_nl)');

  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }

  const { data, error } = await query.order('sort_order');

  if (error) throw error;
  return data;
}
