/**
 * Supabase Admin Client (Service Role)
 * 
 * This client uses the service_role key which bypasses RLS.
 * ⚠️ NEVER expose this client to the frontend!
 * ⚠️ Only use server-side for admin operations.
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error('Missing SUPABASE_URL environment variable');
}

if (!supabaseServiceKey) {
  console.warn('⚠️  SUPABASE_SERVICE_ROLE_KEY not set. Admin operations will not work.');
}

// Admin client with full access (bypasses RLS)
export const supabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

/**
 * Example usage for category management:
 * 
 * // Add a new category
 * const { data, error } = await supabaseAdmin
 *   .from('categories')
 *   .insert({
 *     name: 'Desserts',
 *     name_en: 'Desserts',
 *     name_nl: 'Nagerechten',
 *     icon: '🍰',
 *     sort_order: 5
 *   });
 * 
 * // Update a category
 * const { error } = await supabaseAdmin
 *   .from('categories')
 *   .update({ name: 'Updated Name' })
 *   .eq('id', categoryId);
 * 
 * // Delete a category
 * const { error } = await supabaseAdmin
 *   .from('categories')
 *   .delete()
 *   .eq('id', categoryId);
 */
