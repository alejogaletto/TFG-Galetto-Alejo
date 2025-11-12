-- =====================================================
-- Fix: Associate CRM Tables with User's Schema
-- =====================================================
-- This script ensures tables 25-28 exist and are accessible
-- by updating their parent schema to belong to the user
-- =====================================================

DO $$
DECLARE
  v_user_id TEXT := '7b9effee-7ae8-455b-8096-ec81390518a2';
  v_schema_id INTEGER;
  v_table_count INTEGER;
  v_current_user_id TEXT;
  v_schema_name TEXT;
BEGIN
  
  RAISE NOTICE '';
  RAISE NOTICE '🔍 Checking tables 25-28...';
  RAISE NOTICE '================================================';
  
  -- Check if tables 25-28 exist
  SELECT COUNT(*) INTO v_table_count
  FROM "VirtualTableSchema"
  WHERE id IN (25, 26, 27, 28);
  
  RAISE NOTICE 'Found % tables in range 25-28', v_table_count;
  
  IF v_table_count = 0 THEN
    RAISE NOTICE '❌ Tables 25-28 do not exist yet!';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  These tables need to be created first.';
    RAISE NOTICE '   Run the original seed-crm-solution.sql script';
    RAISE NOTICE '   to create the table structures.';
    RETURN;
  END IF;
  
  -- Get the schema ID that owns these tables
  SELECT DISTINCT virtual_schema_id INTO v_schema_id
  FROM "VirtualTableSchema"
  WHERE id IN (25, 26, 27, 28)
  LIMIT 1;
  
  RAISE NOTICE 'Tables belong to schema ID: %', v_schema_id;
  
  -- Check current owner of that schema
  SELECT user_id, name INTO v_current_user_id, v_schema_name
  FROM "VirtualSchema"
  WHERE id = v_schema_id;
  
  RAISE NOTICE 'Schema name: %', v_schema_name;
  RAISE NOTICE 'Current owner: %', COALESCE(v_current_user_id, 'NULL (template)');
  
  IF v_current_user_id = v_user_id THEN
    RAISE NOTICE '✅ Schema already belongs to user!';
    RAISE NOTICE '';
    RAISE NOTICE '🤔 If tables still not showing in builder:';
    RAISE NOTICE '   1. Check browser console for API errors';
    RAISE NOTICE '   2. Hard refresh the browser (Cmd+Shift+R)';
    RAISE NOTICE '   3. Verify RLS policies are correct';
    RETURN;
  END IF;
  
  -- Update the schema to belong to the user
  UPDATE "VirtualSchema"
  SET user_id = v_user_id
  WHERE id = v_schema_id;
  
  RAISE NOTICE '';
  RAISE NOTICE '✅ Updated schema ownership!';
  RAISE NOTICE '   Schema ID % now belongs to user %', v_schema_id, v_user_id;
  
  RAISE NOTICE '';
  RAISE NOTICE '================================================';
  RAISE NOTICE '✅ Fix Complete!';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Summary:';
  RAISE NOTICE '   - Schema: % (ID: %)', v_schema_name, v_schema_id;
  RAISE NOTICE '   - Owner: %', v_user_id;
  RAISE NOTICE '   - Tables: 25, 26, 27, 28';
  RAISE NOTICE '';
  RAISE NOTICE '🔄 Next Steps:';
  RAISE NOTICE '   1. Hard refresh your browser (Cmd/Ctrl + Shift + R)';
  RAISE NOTICE '   2. Open the CRM solution in the builder';
  RAISE NOTICE '   3. Tables should now appear in data source selector!';
  RAISE NOTICE '================================================';
  
END $$;

