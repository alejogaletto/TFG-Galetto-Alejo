-- ============================================================================
-- Row Level Security (RLS) Policies for User Data Isolation
-- ============================================================================
-- This migration adds RLS policies to ensure users can only access their own data
--
-- IMPORTANT: Run migration 01_migrate_user_id_to_text.sql FIRST
-- This ensures user_id columns are VARCHAR and can be compared with auth.uid()
-- ============================================================================

-- ============================================================================
-- Form Table
-- ============================================================================

-- Enable RLS on Form table
ALTER TABLE "Form" ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own forms
CREATE POLICY "Users can view own forms"
  ON "Form"
  FOR SELECT
  USING (auth.uid()::text = user_id);

-- Policy: Users can insert their own forms
CREATE POLICY "Users can insert own forms"
  ON "Form"
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

-- Policy: Users can update their own forms
CREATE POLICY "Users can update own forms"
  ON "Form"
  FOR UPDATE
  USING (auth.uid()::text = user_id);

-- Policy: Users can delete their own forms
CREATE POLICY "Users can delete own forms"
  ON "Form"
  FOR DELETE
  USING (auth.uid()::text = user_id);

-- ============================================================================
-- VirtualSchema Table (Databases)
-- ============================================================================

-- Enable RLS on VirtualSchema table
ALTER TABLE "VirtualSchema" ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own virtual schemas
CREATE POLICY "Users can view own virtual schemas"
  ON "VirtualSchema"
  FOR SELECT
  USING (auth.uid()::text = user_id);

-- Policy: Users can insert their own virtual schemas
CREATE POLICY "Users can insert own virtual schemas"
  ON "VirtualSchema"
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

-- Policy: Users can update their own virtual schemas
CREATE POLICY "Users can update own virtual schemas"
  ON "VirtualSchema"
  FOR UPDATE
  USING (auth.uid()::text = user_id);

-- Policy: Users can delete their own virtual schemas
CREATE POLICY "Users can delete own virtual schemas"
  ON "VirtualSchema"
  FOR DELETE
  USING (auth.uid()::text = user_id);

-- ============================================================================
-- Workflow Table
-- ============================================================================

-- Enable RLS on Workflow table
ALTER TABLE "Workflow" ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own workflows
CREATE POLICY "Users can view own workflows"
  ON "Workflow"
  FOR SELECT
  USING (auth.uid()::text = user_id);

-- Policy: Users can insert their own workflows
CREATE POLICY "Users can insert own workflows"
  ON "Workflow"
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

-- Policy: Users can update their own workflows
CREATE POLICY "Users can update own workflows"
  ON "Workflow"
  FOR UPDATE
  USING (auth.uid()::text = user_id);

-- Policy: Users can delete their own workflows
CREATE POLICY "Users can delete own workflows"
  ON "Workflow"
  FOR DELETE
  USING (auth.uid()::text = user_id);

-- ============================================================================
-- Solution Table
-- ============================================================================

-- Enable RLS on Solution table
ALTER TABLE "Solution" ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own solutions
CREATE POLICY "Users can view own solutions"
  ON "Solution"
  FOR SELECT
  USING (auth.uid()::text = user_id);

-- Policy: Users can insert their own solutions
CREATE POLICY "Users can insert own solutions"
  ON "Solution"
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

-- Policy: Users can update their own solutions
CREATE POLICY "Users can update own solutions"
  ON "Solution"
  FOR UPDATE
  USING (auth.uid()::text = user_id);

-- Policy: Users can delete their own solutions
CREATE POLICY "Users can delete own solutions"
  ON "Solution"
  FOR DELETE
  USING (auth.uid()::text = user_id);

-- ============================================================================
-- BusinessData Table
-- ============================================================================

-- Enable RLS on BusinessData table
ALTER TABLE "BusinessData" ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own business data
CREATE POLICY "Users can view own business data"
  ON "BusinessData"
  FOR SELECT
  USING (auth.uid()::text = user_id);

-- Policy: Users can insert their own business data
CREATE POLICY "Users can insert own business data"
  ON "BusinessData"
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

-- Policy: Users can update their own business data
CREATE POLICY "Users can update own business data"
  ON "BusinessData"
  FOR UPDATE
  USING (auth.uid()::text = user_id);

-- Policy: Users can delete their own business data
CREATE POLICY "Users can delete own business data"
  ON "BusinessData"
  FOR DELETE
  USING (auth.uid()::text = user_id);

-- ============================================================================
-- Child Tables (inherit access through parent relationships)
-- ============================================================================

-- FormField Table (belongs to Form)
ALTER TABLE "FormField" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view form fields for their forms"
  ON "FormField"
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM "Form"
      WHERE "Form".id = "FormField".form_id
      AND "Form".user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can insert form fields for their forms"
  ON "FormField"
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "Form"
      WHERE "Form".id = "FormField".form_id
      AND "Form".user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can update form fields for their forms"
  ON "FormField"
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM "Form"
      WHERE "Form".id = "FormField".form_id
      AND "Form".user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can delete form fields for their forms"
  ON "FormField"
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM "Form"
      WHERE "Form".id = "FormField".form_id
      AND "Form".user_id = auth.uid()::text
    )
  );

-- FormSubmission Table (belongs to Form) - Special case: public can insert, owner can read
ALTER TABLE "FormSubmission" ENABLE ROW LEVEL SECURITY;

-- Anyone can submit to a form (public forms)
CREATE POLICY "Anyone can submit to forms"
  ON "FormSubmission"
  FOR INSERT
  WITH CHECK (true);

-- Only form owners can view submissions
CREATE POLICY "Users can view submissions for their forms"
  ON "FormSubmission"
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM "Form"
      WHERE "Form".id = "FormSubmission".form_id
      AND "Form".user_id = auth.uid()::text
    )
  );

-- WorkflowStep Table (belongs to Workflow)
ALTER TABLE "WorkflowStep" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view workflow steps for their workflows"
  ON "WorkflowStep"
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM "Workflow"
      WHERE "Workflow".id = "WorkflowStep".workflow_id
      AND "Workflow".user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can insert workflow steps for their workflows"
  ON "WorkflowStep"
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "Workflow"
      WHERE "Workflow".id = "WorkflowStep".workflow_id
      AND "Workflow".user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can update workflow steps for their workflows"
  ON "WorkflowStep"
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM "Workflow"
      WHERE "Workflow".id = "WorkflowStep".workflow_id
      AND "Workflow".user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can delete workflow steps for their workflows"
  ON "WorkflowStep"
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM "Workflow"
      WHERE "Workflow".id = "WorkflowStep".workflow_id
      AND "Workflow".user_id = auth.uid()::text
    )
  );

-- WorkflowTrigger Table (belongs to Workflow)
ALTER TABLE "WorkflowTrigger" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view workflow triggers for their workflows"
  ON "WorkflowTrigger"
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM "Workflow"
      WHERE "Workflow".id = "WorkflowTrigger".workflow_id
      AND "Workflow".user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can insert workflow triggers for their workflows"
  ON "WorkflowTrigger"
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "Workflow"
      WHERE "Workflow".id = "WorkflowTrigger".workflow_id
      AND "Workflow".user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can update workflow triggers for their workflows"
  ON "WorkflowTrigger"
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM "Workflow"
      WHERE "Workflow".id = "WorkflowTrigger".workflow_id
      AND "Workflow".user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can delete workflow triggers for their workflows"
  ON "WorkflowTrigger"
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM "Workflow"
      WHERE "Workflow".id = "WorkflowTrigger".workflow_id
      AND "Workflow".user_id = auth.uid()::text
    )
  );

-- VirtualTableSchema Table (belongs to VirtualSchema)
ALTER TABLE "VirtualTableSchema" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view virtual table schemas for their virtual schemas"
  ON "VirtualTableSchema"
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM "VirtualSchema"
      WHERE "VirtualSchema".id = "VirtualTableSchema".virtual_schema_id
      AND "VirtualSchema".user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can insert virtual table schemas for their virtual schemas"
  ON "VirtualTableSchema"
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "VirtualSchema"
      WHERE "VirtualSchema".id = "VirtualTableSchema".virtual_schema_id
      AND "VirtualSchema".user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can update virtual table schemas for their virtual schemas"
  ON "VirtualTableSchema"
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM "VirtualSchema"
      WHERE "VirtualSchema".id = "VirtualTableSchema".virtual_schema_id
      AND "VirtualSchema".user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can delete virtual table schemas for their virtual schemas"
  ON "VirtualTableSchema"
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM "VirtualSchema"
      WHERE "VirtualSchema".id = "VirtualTableSchema".virtual_schema_id
      AND "VirtualSchema".user_id = auth.uid()::text
    )
  );

-- VirtualFieldSchema Table (belongs to VirtualTableSchema -> VirtualSchema)
ALTER TABLE "VirtualFieldSchema" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view virtual field schemas for their virtual schemas"
  ON "VirtualFieldSchema"
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM "VirtualTableSchema"
      INNER JOIN "VirtualSchema" ON "VirtualSchema".id = "VirtualTableSchema".virtual_schema_id
      WHERE "VirtualTableSchema".id = "VirtualFieldSchema".virtual_table_schema_id
      AND "VirtualSchema".user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can insert virtual field schemas for their virtual schemas"
  ON "VirtualFieldSchema"
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "VirtualTableSchema"
      INNER JOIN "VirtualSchema" ON "VirtualSchema".id = "VirtualTableSchema".virtual_schema_id
      WHERE "VirtualTableSchema".id = "VirtualFieldSchema".virtual_table_schema_id
      AND "VirtualSchema".user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can update virtual field schemas for their virtual schemas"
  ON "VirtualFieldSchema"
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM "VirtualTableSchema"
      INNER JOIN "VirtualSchema" ON "VirtualSchema".id = "VirtualTableSchema".virtual_schema_id
      WHERE "VirtualTableSchema".id = "VirtualFieldSchema".virtual_table_schema_id
      AND "VirtualSchema".user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can delete virtual field schemas for their virtual schemas"
  ON "VirtualFieldSchema"
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM "VirtualTableSchema"
      INNER JOIN "VirtualSchema" ON "VirtualSchema".id = "VirtualTableSchema".virtual_schema_id
      WHERE "VirtualTableSchema".id = "VirtualFieldSchema".virtual_table_schema_id
      AND "VirtualSchema".user_id = auth.uid()::text
    )
  );

-- ============================================================================
-- Notes
-- ============================================================================

-- This migration enables Row Level Security on all main tables and their child tables.
-- After applying these policies, the database will automatically enforce that:
--   1. Users can only see/modify their own data
--   2. Child records are accessible only if the parent is owned by the user
--   3. Form submissions are publicly insertable but only viewable by form owners
--
-- To apply this migration:
--   1. Go to Supabase Dashboard -> SQL Editor
--   2. Copy and paste this entire file
--   3. Click "Run"
--
-- To verify RLS is working:
--   1. Try querying a table as a non-owner user
--   2. You should only see your own records
--
-- To rollback (NOT RECOMMENDED in production):
--   ALTER TABLE "TableName" DISABLE ROW LEVEL SECURITY;
--   DROP POLICY "policy_name" ON "TableName";

