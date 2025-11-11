-- =====================================================
-- Add INSERT Policy for Solutions
-- =====================================================
-- Allow authenticated users to create their own solutions
-- =====================================================

-- Drop existing INSERT policy if it exists
DROP POLICY IF EXISTS "Users can insert their own solutions" ON "Solution";

-- Create policy to allow users to insert solutions
CREATE POLICY "Users can insert their own solutions"
  ON "Solution"
  FOR INSERT
  WITH CHECK (
    auth.uid()::text = user_id::text
  );

-- Also allow inserting solution components
DROP POLICY IF EXISTS "Users can insert solution components" ON "SolutionComponent";

CREATE POLICY "Users can insert solution components"
  ON "SolutionComponent"
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "Solution" s 
      WHERE s.id = "SolutionComponent".solution_id 
      AND auth.uid()::text = s.user_id::text
    )
  );

-- Verify policies
SELECT 
  'Policies Updated' as status,
  tablename,
  policyname,
  cmd
FROM pg_policies 
WHERE tablename IN ('Solution', 'SolutionComponent')
  AND cmd IN ('INSERT', 'SELECT')
ORDER BY tablename, cmd;

