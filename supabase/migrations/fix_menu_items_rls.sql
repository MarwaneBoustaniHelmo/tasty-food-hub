-- ==================================================
-- FIX: Enable complete RLS on public.menu_items
-- ==================================================
-- This addresses Supabase Security Advisor warnings by
-- explicitly defining ALL operation policies.
--
-- Access Model:
-- - Public (anon): READ ONLY (browse menu)
-- - Service Role: FULL ACCESS (bypasses RLS)
-- - Authenticated users: READ ONLY (no special privileges)
-- - NO user ownership: menu items are restaurant-managed
-- ==================================================

-- Ensure RLS is enabled (idempotent)
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists (for idempotency)
DROP POLICY IF EXISTS "Menu items are publicly readable" ON public.menu_items;

-- Create explicit SELECT policy for public menu browsing
CREATE POLICY "Public read access to menu items"
  ON public.menu_items
  FOR SELECT
  USING (true);

-- Explicitly deny INSERT for non-service-role users
-- Only restaurant admins (via service_role) should add menu items
CREATE POLICY "Deny public insert to menu items"
  ON public.menu_items
  FOR INSERT
  WITH CHECK (false);

-- Explicitly deny UPDATE for non-service-role users
-- Only restaurant admins (via service_role) should modify menu items
CREATE POLICY "Deny public update to menu items"
  ON public.menu_items
  FOR UPDATE
  USING (false);

-- Explicitly deny DELETE for non-service-role users
-- Only restaurant admins (via service_role) should remove menu items
CREATE POLICY "Deny public delete to menu items"
  ON public.menu_items
  FOR DELETE
  USING (false);

-- ==================================================
-- VERIFICATION QUERIES (run after applying)
-- ==================================================
-- Check RLS status:
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'menu_items';
--
-- List all policies:
-- SELECT * FROM pg_policies WHERE tablename = 'menu_items';
--
-- Test as anon (should work - read-only):
-- SELECT * FROM menu_items WHERE is_available = true;
--
-- Test write as anon (should fail):
-- INSERT INTO menu_items (name, category_id, price) VALUES ('Test', '...', 9.99); 
-- -- Expected: Error: new row violates row-level security policy
--
-- UPDATE menu_items SET price = 99.99 WHERE id = '...';
-- -- Expected: Error: new row violates row-level security policy
-- ==================================================

-- ==================================================
-- PERFORMANCE: Indexes for policy filters
-- ==================================================
-- These indexes already exist from schema.sql but listed for reference:
-- CREATE INDEX idx_menu_items_category ON public.menu_items(category_id);
-- CREATE INDEX idx_menu_items_available ON public.menu_items(is_available);
-- ==================================================
