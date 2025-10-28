-- ============================================================================
-- Migration: Map Existing User Data to Supabase Auth Users
-- ============================================================================
-- This script helps migrate existing data from old integer-based user IDs
-- to new Supabase Auth UUID-based user IDs
-- ============================================================================

-- ============================================================================
-- STEP 1: DIAGNOSTIC - Check Current State
-- ============================================================================

-- Check existing users in custom User table
SELECT 
  'Custom User Table' as source,
  id as user_id,
  email,
  name,
  creation_date
FROM "User"
ORDER BY id;

-- Check Supabase Auth users
SELECT 
  'Supabase Auth' as source,
  id as user_id,
  email,
  raw_user_meta_data->>'name' as name,
  created_at
FROM auth.users
ORDER BY created_at;

-- Check data distribution by user_id
SELECT 
  'Form' as table_name,
  user_id,
  COUNT(*) as record_count
FROM "Form"
GROUP BY user_id
UNION ALL
SELECT 
  'VirtualSchema' as table_name,
  user_id,
  COUNT(*) as record_count
FROM "VirtualSchema"
GROUP BY user_id
UNION ALL
SELECT 
  'Workflow' as table_name,
  user_id,
  COUNT(*) as record_count
FROM "Workflow"
GROUP BY user_id
UNION ALL
SELECT 
  'Solution' as table_name,
  user_id,
  COUNT(*) as record_count
FROM "Solution"
GROUP BY user_id
UNION ALL
SELECT 
  'BusinessData' as table_name,
  user_id,
  COUNT(*) as record_count
FROM "BusinessData"
GROUP BY user_id
ORDER BY table_name, user_id;

-- ============================================================================
-- STEP 2: CHOOSE YOUR MIGRATION STRATEGY
-- ============================================================================

-- ┌─────────────────────────────────────────────────────────────────────────┐
-- │ OPTION A: Clean Slate (Development/Testing)                             │
-- │ Use this if you're okay deleting all test data and starting fresh       │
-- └─────────────────────────────────────────────────────────────────────────┘

-- UNCOMMENT to delete all data and start fresh:
/*
BEGIN;

-- Delete all child records first (respects foreign keys)
DELETE FROM "FormSubmission";
DELETE FROM "FormField";
DELETE FROM "FieldMapping";
DELETE FROM "VirtualFieldSchema";
DELETE FROM "VirtualTableSchema";
DELETE FROM "DataConnection";
DELETE FROM "BusinessData";
DELETE FROM "WorkflowStep";
DELETE FROM "WorkflowTrigger";
DELETE FROM "SolutionComponent";

-- Delete parent records
DELETE FROM "Form";
DELETE FROM "VirtualSchema";
DELETE FROM "Workflow";
DELETE FROM "Solution";

-- Delete old User records that don't match auth.users
DELETE FROM "User" 
WHERE id NOT IN (
  SELECT id::text FROM auth.users
);

COMMIT;

-- Verify cleanup
SELECT 'Forms remaining' as check_name, COUNT(*) as count FROM "Form"
UNION ALL
SELECT 'Workflows remaining', COUNT(*) FROM "Workflow"
UNION ALL
SELECT 'Schemas remaining', COUNT(*) FROM "VirtualSchema"
UNION ALL
SELECT 'Users remaining', COUNT(*) FROM "User";
*/

-- ┌─────────────────────────────────────────────────────────────────────────┐
-- │ OPTION B: Migrate Data to Primary OAuth User                            │
-- │ Use this if you want to keep existing data and assign it to yourself    │
-- └─────────────────────────────────────────────────────────────────────────┘

-- STEP 1: Find your Supabase Auth UUID
-- Run this first to get your UUID:
SELECT 
  id,
  email,
  raw_user_meta_data->>'name' as name,
  created_at
FROM auth.users
ORDER BY created_at;

-- STEP 2: Replace YOUR_UUID_HERE with your actual UUID from above
-- Then UNCOMMENT and run this block:
/*
BEGIN;

-- Set your UUID here
DO $$
DECLARE
  target_uuid TEXT := 'YOUR_UUID_HERE'; -- Replace with your actual UUID
BEGIN
  -- Update User table
  UPDATE "User" SET id = target_uuid WHERE id != target_uuid;
  
  -- Update all related tables
  UPDATE "Form" SET user_id = target_uuid WHERE user_id != target_uuid;
  UPDATE "VirtualSchema" SET user_id = target_uuid WHERE user_id != target_uuid;
  UPDATE "Workflow" SET user_id = target_uuid WHERE user_id != target_uuid;
  UPDATE "Solution" SET user_id = target_uuid WHERE user_id != target_uuid;
  UPDATE "BusinessData" SET user_id = target_uuid WHERE user_id != target_uuid;
  
  -- Report what was updated
  RAISE NOTICE 'Migration complete. All data assigned to user: %', target_uuid;
END $$;

COMMIT;

-- Verify migration
SELECT 
  'Form' as table_name,
  user_id,
  COUNT(*) as record_count
FROM "Form"
GROUP BY user_id;
*/

-- ┌─────────────────────────────────────────────────────────────────────────┐
-- │ OPTION C: Manual Mapping (Multiple Users to Preserve)                   │
-- │ Use this if you have multiple real users to map                         │
-- └─────────────────────────────────────────────────────────────────────────┘

-- STEP 1: Create a mapping table
/*
CREATE TEMP TABLE user_id_mapping (
  old_id VARCHAR(255),
  new_id VARCHAR(255),
  email VARCHAR(255),
  name VARCHAR(255)
);

-- STEP 2: Insert your mappings
-- Format: old_user_id (from User table) -> new_uuid (from auth.users)
INSERT INTO user_id_mapping (old_id, new_id, email, name) VALUES
  ('1', '5f2d2d88-1bbe-4f71-bb7e-aee1bdaf27b8', 'user@example.com', 'User Name'),
  ('2', 'another-uuid-here', 'user2@example.com', 'User 2 Name');
  -- Add more mappings as needed

-- STEP 3: Apply the mapping
BEGIN;

-- Update User table
UPDATE "User" u
SET id = m.new_id
FROM user_id_mapping m
WHERE u.id = m.old_id;

-- Update Form table
UPDATE "Form" f
SET user_id = m.new_id
FROM user_id_mapping m
WHERE f.user_id = m.old_id;

-- Update VirtualSchema table
UPDATE "VirtualSchema" v
SET user_id = m.new_id
FROM user_id_mapping m
WHERE v.user_id = m.old_id;

-- Update Workflow table
UPDATE "Workflow" w
SET user_id = m.new_id
FROM user_id_mapping m
WHERE w.user_id = m.old_id;

-- Update Solution table
UPDATE "Solution" s
SET user_id = m.new_id
FROM user_id_mapping m
WHERE s.user_id = m.old_id;

-- Update BusinessData table
UPDATE "BusinessData" b
SET user_id = m.new_id
FROM user_id_mapping m
WHERE b.user_id = m.old_id;

COMMIT;

-- Verify migration
SELECT 
  table_name,
  user_id,
  record_count
FROM (
  SELECT 'Form' as table_name, user_id, COUNT(*) as record_count FROM "Form" GROUP BY user_id
  UNION ALL
  SELECT 'VirtualSchema', user_id, COUNT(*) FROM "VirtualSchema" GROUP BY user_id
  UNION ALL
  SELECT 'Workflow', user_id, COUNT(*) FROM "Workflow" GROUP BY user_id
  UNION ALL
  SELECT 'Solution', user_id, COUNT(*) FROM "Solution" GROUP BY user_id
  UNION ALL
  SELECT 'BusinessData', user_id, COUNT(*) FROM "BusinessData" GROUP BY user_id
) subquery
ORDER BY table_name, user_id;
*/

-- ┌─────────────────────────────────────────────────────────────────────────┐
-- │ OPTION D: Keep Old Users, Sync to Supabase Auth (Advanced)              │
-- │ Creates Supabase Auth accounts for existing users                       │
-- └─────────────────────────────────────────────────────────────────────────┘

-- NOTE: This requires using Supabase Admin API from your application
-- Cannot be done directly in SQL for security reasons
-- See the script: scripts/migrate-users-to-auth.ts

-- ============================================================================
-- STEP 3: Cleanup and Verification
-- ============================================================================

-- After running your chosen option, verify everything:

-- Check no orphaned data (data without valid user_id)
SELECT 
  'Orphaned Forms' as issue,
  COUNT(*) as count
FROM "Form" f
WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE id::text = f.user_id)

UNION ALL

SELECT 
  'Orphaned VirtualSchemas',
  COUNT(*)
FROM "VirtualSchema" v
WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE id::text = v.user_id)

UNION ALL

SELECT 
  'Orphaned Workflows',
  COUNT(*)
FROM "Workflow" w
WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE id::text = w.user_id)

UNION ALL

SELECT 
  'Orphaned Solutions',
  COUNT(*)
FROM "Solution" s
WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE id::text = s.user_id)

UNION ALL

SELECT 
  'Orphaned BusinessData',
  COUNT(*)
FROM "BusinessData" b
WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE id::text = b.user_id);

-- Final summary
SELECT 
  'Auth Users' as category,
  COUNT(*) as count
FROM auth.users

UNION ALL

SELECT 
  'Custom User Records',
  COUNT(*)
FROM "User"

UNION ALL

SELECT 
  'Total Forms',
  COUNT(*)
FROM "Form"

UNION ALL

SELECT 
  'Total Workflows',
  COUNT(*)
FROM "Workflow"

UNION ALL

SELECT 
  'Total VirtualSchemas',
  COUNT(*)
FROM "VirtualSchema";

-- ============================================================================
-- Migration Complete! 
-- ============================================================================
-- After migration:
-- 1. Test login with OAuth
-- 2. Verify you see your data in dashboard
-- 3. Create a new form/workflow to test RLS is working
-- 4. Try logging in with different user - should see different data
-- ============================================================================

