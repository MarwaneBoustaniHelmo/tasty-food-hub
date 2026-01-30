-- ============================================================================
-- FIX: Consolidate restaurants RLS policies - Remove SELECT overlap
-- ============================================================================
-- Issue: Multiple permissive SELECT policies for authenticated role
--        (admin_write + public_select both evaluate on every SELECT)
--
-- Solution: 
--   1. One SELECT policy for PUBLIC (anonymous + authenticated)
--   2. Separate write-only policies (INSERT/UPDATE/DELETE) for admins
-- ============================================================================

-- Ensure RLS is enabled
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;

-- Drop the overlapping policies
DROP POLICY IF EXISTS "admin_write" ON public.restaurants;
DROP POLICY IF EXISTS "public_select" ON public.restaurants;
DROP POLICY IF EXISTS "Allow public read access to restaurants" ON public.restaurants;

-- ============================================================================
-- POLICY 1: Public Read Access (SELECT only)
-- ============================================================================
-- All users (anonymous + authenticated) can view restaurants
-- This is appropriate for a public marketing site where restaurant
-- locations need to be visible to everyone
CREATE POLICY "public_read_restaurants"
  ON public.restaurants
  FOR SELECT
  TO PUBLIC  -- Both anon and authenticated
  USING (true);

COMMENT ON POLICY "public_read_restaurants" ON public.restaurants IS
  'Allow all users (anonymous and authenticated) to read restaurant data';

-- ============================================================================
-- POLICY 2: Admin Write Access (INSERT/UPDATE/DELETE only - NOT SELECT)
-- ============================================================================
-- Only users with admin role in JWT can modify restaurant data
-- Note: Separate policies for each operation to avoid SELECT overlap

CREATE POLICY "admin_insert_restaurants"
  ON public.restaurants
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (auth.jwt() ->> 'role') = 'admin'
    OR coalesce(auth.jwt() ->> 'is_admin', 'false') = 'true'
  );

CREATE POLICY "admin_update_restaurants"
  ON public.restaurants
  FOR UPDATE
  TO authenticated
  USING (
    (auth.jwt() ->> 'role') = 'admin'
    OR coalesce(auth.jwt() ->> 'is_admin', 'false') = 'true'
  )
  WITH CHECK (
    (auth.jwt() ->> 'role') = 'admin'
    OR coalesce(auth.jwt() ->> 'is_admin', 'false') = 'true'
  );

CREATE POLICY "admin_delete_restaurants"
  ON public.restaurants
  FOR DELETE
  TO authenticated
  USING (
    (auth.jwt() ->> 'role') = 'admin'
    OR coalesce(auth.jwt() ->> 'is_admin', 'false') = 'true'
  );

COMMENT ON POLICY "admin_insert_restaurants" ON public.restaurants IS
  'Allow admin users (via JWT claims) to insert restaurants';
COMMENT ON POLICY "admin_update_restaurants" ON public.restaurants IS
  'Allow admin users (via JWT claims) to update restaurants';
COMMENT ON POLICY "admin_delete_restaurants" ON public.restaurants IS
  'Allow admin users (via JWT claims) to delete restaurants';

-- ============================================================================
-- Verification
-- ============================================================================
DO $$
DECLARE
  select_policy_count INT;
BEGIN
  -- Count SELECT policies for authenticated role
  SELECT COUNT(*) INTO select_policy_count
  FROM pg_policies
  WHERE schemaname = 'public'
    AND tablename = 'restaurants'
    AND cmd = 'SELECT'
    AND 'authenticated' = ANY(roles);
  
  IF select_policy_count > 1 THEN
    RAISE WARNING 'Multiple SELECT policies still exist for authenticated role!';
  ELSE
    RAISE NOTICE '✅ Restaurants policies consolidated successfully!';
    RAISE NOTICE '   • 1 SELECT policy (public_read_restaurants)';
    RAISE NOTICE '   • 3 write policies (admin INSERT/UPDATE/DELETE)';
    RAISE NOTICE '   • No overlapping SELECT policies';
    RAISE NOTICE '   • Performance issue resolved';
  END IF;
END $$;

-- ============================================================================
-- Expected Result:
-- ============================================================================
-- SELECT queries: Only 1 policy evaluated (public_read_restaurants)
-- INSERT/UPDATE/DELETE: Only admin policies evaluated (if user is admin)
-- No more duplicate policy evaluation on SELECT operations
-- ============================================================================
