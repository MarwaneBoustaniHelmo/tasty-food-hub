-- ==================================================
-- FIX: Enable complete RLS on public.categories
-- ==================================================
-- This makes the Security Advisor happy by explicitly
-- defining ALL operation policies (not just SELECT).
--
-- Access Model:
-- - Public (anon): READ ONLY
-- - Service Role: FULL ACCESS (bypasses RLS)
-- - Authenticated users: READ ONLY (no special privileges)
-- ==================================================

-- Ensure RLS is enabled (idempotent)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists (for idempotency)
DROP POLICY IF EXISTS "Categories are publicly readable" ON public.categories;

-- Create explicit SELECT policy for anonymous and authenticated users
CREATE POLICY "Public read access to categories"
  ON public.categories
  FOR SELECT
  USING (true);

-- Explicitly deny INSERT for non-service-role users
-- (Service role bypasses RLS automatically)
CREATE POLICY "Deny public insert to categories"
  ON public.categories
  FOR INSERT
  WITH CHECK (false);

-- Explicitly deny UPDATE for non-service-role users
CREATE POLICY "Deny public update to categories"
  ON public.categories
  FOR UPDATE
  USING (false);

-- Explicitly deny DELETE for non-service-role users
CREATE POLICY "Deny public delete to categories"
  ON public.categories
  FOR DELETE
  USING (false);

-- ==================================================
-- VERIFICATION QUERIES (run after applying)
-- ==================================================
-- Check RLS status:
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'categories';
--
-- List all policies:
-- SELECT * FROM pg_policies WHERE tablename = 'categories';
--
-- Test as anon (should work):
-- SELECT * FROM categories;
--
-- Test write as anon (should fail):
-- INSERT INTO categories (name) VALUES ('Test'); -- Error: new row violates policy
-- ==================================================
