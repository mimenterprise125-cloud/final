-- ============================================================================
-- OPTION 1: Make Symbols Readable by Everyone (Global Library)
-- ============================================================================
-- If you want all users to see all saved symbols but each user can only
-- add/delete their own, use this policy:

DROP POLICY IF EXISTS "symbols_select" ON symbols;

CREATE POLICY "symbols_select_all" ON symbols FOR SELECT
  USING (true);  -- Everyone can read all symbols

CREATE POLICY "symbols_insert" ON symbols FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "symbols_delete" ON symbols FOR DELETE
  USING (user_id = auth.uid());

-- ============================================================================
-- OPTION 2: Keep Symbols Private (Current - Each User Only Sees Their Own)
-- ============================================================================
-- Current default behavior - revert to this if you change it

DROP POLICY IF EXISTS "symbols_select_all" ON symbols;

CREATE POLICY "symbols_select" ON symbols FOR SELECT
  USING (user_id = auth.uid());  -- Only see your own

CREATE POLICY "symbols_insert" ON symbols FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "symbols_delete" ON symbols FOR DELETE
  USING (user_id = auth.uid());

-- ============================================================================
-- OPTION 3: Admin Creates Shared Symbols (Admin-Only Global Library)
-- ============================================================================
-- Only admins can create symbols, everyone can see them

DROP POLICY IF EXISTS "symbols_select" ON symbols;
DROP POLICY IF EXISTS "symbols_insert" ON symbols;
DROP POLICY IF EXISTS "symbols_delete" ON symbols;

CREATE POLICY "symbols_select_all" ON symbols FOR SELECT
  USING (true);  -- Everyone reads

CREATE POLICY "symbols_insert_admin_only" ON symbols FOR INSERT
  WITH CHECK (
    (SELECT is_admin FROM profiles WHERE id = auth.uid()) = true
  );

CREATE POLICY "symbols_delete_admin_only" ON symbols FOR DELETE
  USING (
    (SELECT is_admin FROM profiles WHERE id = auth.uid()) = true
  );

-- ============================================================================
-- Recommendation
-- ============================================================================
-- Use OPTION 1 (Global Library) if:
--   ✓ You want all users to access all symbols
--   ✓ Reduces data duplication
--   ✓ Better symbol discovery
--
-- Use OPTION 2 (Private - Current) if:
--   ✓ You want isolation between users
--   ✓ Users have different symbol preferences
--   ✓ Better data privacy
