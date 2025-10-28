-- ============================================================================
-- Migration: Change user_id from INTEGER to TEXT to support Supabase Auth UUIDs
-- ============================================================================
-- This migration updates all user_id columns from INTEGER to TEXT/VARCHAR
-- to accommodate Supabase Auth's UUID-based user IDs
-- ============================================================================

-- Step 1: Drop foreign key constraints that reference User(id)
ALTER TABLE "Form" DROP CONSTRAINT IF EXISTS "Form_user_id_fkey";
ALTER TABLE "VirtualSchema" DROP CONSTRAINT IF EXISTS "VirtualSchema_user_id_fkey";
ALTER TABLE "Workflow" DROP CONSTRAINT IF EXISTS "Workflow_user_id_fkey";
ALTER TABLE "Solution" DROP CONSTRAINT IF EXISTS "Solution_user_id_fkey";
ALTER TABLE "BusinessData" DROP CONSTRAINT IF EXISTS "BusinessData_user_id_fkey";

-- Step 2: Change User.id from INTEGER to VARCHAR (to store UUIDs)
-- First, we need to handle the SERIAL constraint
ALTER TABLE "User" ALTER COLUMN "id" DROP DEFAULT;
DROP SEQUENCE IF EXISTS "User_id_seq";

-- Now change the type
ALTER TABLE "User" ALTER COLUMN "id" TYPE VARCHAR(255);

-- Step 3: Change user_id columns in all related tables
ALTER TABLE "Form" ALTER COLUMN "user_id" TYPE VARCHAR(255);
ALTER TABLE "VirtualSchema" ALTER COLUMN "user_id" TYPE VARCHAR(255);
ALTER TABLE "Workflow" ALTER COLUMN "user_id" TYPE VARCHAR(255);
ALTER TABLE "Solution" ALTER COLUMN "user_id" TYPE VARCHAR(255);
ALTER TABLE "BusinessData" ALTER COLUMN "user_id" TYPE VARCHAR(255);

-- Step 4: Re-add foreign key constraints (without CASCADE for safety)
ALTER TABLE "Form" 
  ADD CONSTRAINT "Form_user_id_fkey" 
  FOREIGN KEY ("user_id") REFERENCES "User"("id");

ALTER TABLE "VirtualSchema" 
  ADD CONSTRAINT "VirtualSchema_user_id_fkey" 
  FOREIGN KEY ("user_id") REFERENCES "User"("id");

ALTER TABLE "Workflow" 
  ADD CONSTRAINT "Workflow_user_id_fkey" 
  FOREIGN KEY ("user_id") REFERENCES "User"("id");

ALTER TABLE "Solution" 
  ADD CONSTRAINT "Solution_user_id_fkey" 
  FOREIGN KEY ("user_id") REFERENCES "User"("id");

ALTER TABLE "BusinessData" 
  ADD CONSTRAINT "BusinessData_user_id_fkey" 
  FOREIGN KEY ("user_id") REFERENCES "User"("id");

-- Step 5: Add indexes for performance
CREATE INDEX IF NOT EXISTS "idx_form_user_id" ON "Form"("user_id");
CREATE INDEX IF NOT EXISTS "idx_virtual_schema_user_id" ON "VirtualSchema"("user_id");
CREATE INDEX IF NOT EXISTS "idx_workflow_user_id" ON "Workflow"("user_id");
CREATE INDEX IF NOT EXISTS "idx_solution_user_id" ON "Solution"("user_id");
CREATE INDEX IF NOT EXISTS "idx_business_data_user_id" ON "BusinessData"("user_id");

-- ============================================================================
-- Migration Complete
-- ============================================================================
-- User.id is now VARCHAR(255) and can store Supabase Auth UUIDs
-- All user_id foreign keys are updated to match
-- ============================================================================

