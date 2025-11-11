-- =====================================================
-- Fix RLS Policies for CRM Templates
-- =====================================================
-- This script updates RLS policies to allow templates
-- to be visible to all authenticated users
--
-- Run this in Supabase Dashboard SQL Editor
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own solutions and all templates" ON "Solution";
DROP POLICY IF EXISTS "Users can view solutions" ON "Solution";

-- Create new policy that allows:
-- 1. Users to see their own solutions (user_id matches)
-- 2. Everyone to see templates (is_template = true)
CREATE POLICY "Users can view their own solutions and all templates"
  ON "Solution"
  FOR SELECT
  USING (
    auth.uid()::text = user_id::text 
    OR is_template = true
  );

-- Also update policy for SolutionComponent if needed
DROP POLICY IF EXISTS "Users can view solution components" ON "SolutionComponent";

CREATE POLICY "Users can view solution components"
  ON "SolutionComponent"
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM "Solution" s 
      WHERE s.id = "SolutionComponent".solution_id 
      AND (
        auth.uid()::text = s.user_id::text 
        OR s.is_template = true
      )
    )
  );

-- Update VirtualSchema policy to allow templates to be visible
DROP POLICY IF EXISTS "Users can view virtual schemas" ON "VirtualSchema";

CREATE POLICY "Users can view virtual schemas"
  ON "VirtualSchema"
  FOR SELECT
  USING (
    auth.uid()::text = user_id::text 
    OR is_template = true
  );

-- Verify the policies
SELECT 
  'RLS Policies Updated' as status,
  schemaname, 
  tablename, 
  policyname,
  permissive,
  cmd
FROM pg_policies 
WHERE tablename IN ('Solution', 'SolutionComponent', 'VirtualSchema')
ORDER BY tablename, policyname;

