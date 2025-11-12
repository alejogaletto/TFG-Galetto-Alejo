-- =====================================================
-- Create CRM Virtual Schema for Specific User
-- =====================================================
-- This script creates the CRM database structure for a specific user
-- so it appears in the builder's data source selector
-- =====================================================

DO $$
DECLARE
  v_user_id TEXT := '7b9effee-7ae8-455b-8096-ec81390518a2';
  v_schema_id INTEGER;
  v_contacts_table_id INTEGER;
  v_leads_table_id INTEGER;
  v_deals_table_id INTEGER;
  v_activities_table_id INTEGER;
BEGIN
  
  RAISE NOTICE '';
  RAISE NOTICE '🚀 Creating CRM Virtual Schema for User...';
  RAISE NOTICE '================================================';
  
  -- Check if CRM schema already exists for this user
  SELECT id INTO v_schema_id
  FROM "VirtualSchema"
  WHERE user_id = v_user_id::uuid
    AND name = 'CRM'
  LIMIT 1;
  
  IF v_schema_id IS NOT NULL THEN
    RAISE NOTICE '✅ CRM Schema already exists (ID: %)', v_schema_id;
  ELSE
    -- Create CRM Virtual Schema for the user
    INSERT INTO "VirtualSchema" (
      "name",
      "description",
      "user_id",
      "icon",
      "color",
      "category"
    ) VALUES (
      'CRM',
      'Customer Relationship Management Database',
      v_user_id::uuid,
      'users',
      'bg-blue-500',
      'Sales & CRM'
    ) RETURNING id INTO v_schema_id;
    
    RAISE NOTICE '✅ Created CRM Schema (ID: %)', v_schema_id;
  END IF;
  
  RAISE NOTICE '';
  RAISE NOTICE '📋 Creating CRM Tables...';
  
  -- 1. CONTACTS TABLE
  SELECT id INTO v_contacts_table_id
  FROM "VirtualTableSchema"
  WHERE virtual_schema_id = v_schema_id
    AND name = 'Contacts'
  LIMIT 1;
  
  IF v_contacts_table_id IS NULL THEN
    INSERT INTO "VirtualTableSchema" (
      "name",
      "virtual_schema_id",
      "user_id"
    ) VALUES (
      'Contacts',
      v_schema_id,
      v_user_id::uuid
    ) RETURNING id INTO v_contacts_table_id;
    
    -- Insert fields for Contacts
    INSERT INTO "VirtualFieldSchema" (virtual_table_schema_id, name, type, required, "order") VALUES
      (v_contacts_table_id, 'name', 'text', true, 1),
      (v_contacts_table_id, 'email', 'email', true, 2),
      (v_contacts_table_id, 'phone', 'text', false, 3),
      (v_contacts_table_id, 'company', 'text', false, 4),
      (v_contacts_table_id, 'position', 'text', false, 5),
      (v_contacts_table_id, 'status', 'text', false, 6),
      (v_contacts_table_id, 'tags', 'text', false, 7),
      (v_contacts_table_id, 'notes', 'textarea', false, 8);
    
    RAISE NOTICE '  ✅ Created Contacts table (ID: %)', v_contacts_table_id;
  ELSE
    RAISE NOTICE '  ℹ️  Contacts table already exists (ID: %)', v_contacts_table_id;
  END IF;
  
  -- 2. LEADS TABLE
  SELECT id INTO v_leads_table_id
  FROM "VirtualTableSchema"
  WHERE virtual_schema_id = v_schema_id
    AND name = 'Leads'
  LIMIT 1;
  
  IF v_leads_table_id IS NULL THEN
    INSERT INTO "VirtualTableSchema" (
      "name",
      "virtual_schema_id",
      "user_id"
    ) VALUES (
      'Leads',
      v_schema_id,
      v_user_id::uuid
    ) RETURNING id INTO v_leads_table_id;
    
    -- Insert fields for Leads
    INSERT INTO "VirtualFieldSchema" (virtual_table_schema_id, name, type, required, "order") VALUES
      (v_leads_table_id, 'name', 'text', true, 1),
      (v_leads_table_id, 'email', 'email', true, 2),
      (v_leads_table_id, 'phone', 'text', false, 3),
      (v_leads_table_id, 'company', 'text', false, 4),
      (v_leads_table_id, 'source', 'text', false, 5),
      (v_leads_table_id, 'status', 'text', false, 6),
      (v_leads_table_id, 'score', 'number', false, 7),
      (v_leads_table_id, 'notes', 'textarea', false, 8);
    
    RAISE NOTICE '  ✅ Created Leads table (ID: %)', v_leads_table_id;
  ELSE
    RAISE NOTICE '  ℹ️  Leads table already exists (ID: %)', v_leads_table_id;
  END IF;
  
  -- 3. DEALS TABLE
  SELECT id INTO v_deals_table_id
  FROM "VirtualTableSchema"
  WHERE virtual_schema_id = v_schema_id
    AND name = 'Deals'
  LIMIT 1;
  
  IF v_deals_table_id IS NULL THEN
    INSERT INTO "VirtualTableSchema" (
      "name",
      "virtual_schema_id",
      "user_id"
    ) VALUES (
      'Deals',
      v_schema_id,
      v_user_id::uuid
    ) RETURNING id INTO v_deals_table_id;
    
    -- Insert fields for Deals
    INSERT INTO "VirtualFieldSchema" (virtual_table_schema_id, name, type, required, "order") VALUES
      (v_deals_table_id, 'name', 'text', true, 1),
      (v_deals_table_id, 'value', 'number', true, 2),
      (v_deals_table_id, 'stage', 'text', true, 3),
      (v_deals_table_id, 'probability', 'number', false, 4),
      (v_deals_table_id, 'contact_name', 'text', false, 5),
      (v_deals_table_id, 'expected_close_date', 'date', false, 6),
      (v_deals_table_id, 'assigned_to', 'text', false, 7),
      (v_deals_table_id, 'notes', 'textarea', false, 8);
    
    RAISE NOTICE '  ✅ Created Deals table (ID: %)', v_deals_table_id;
  ELSE
    RAISE NOTICE '  ℹ️  Deals table already exists (ID: %)', v_deals_table_id;
  END IF;
  
  -- 4. ACTIVITIES TABLE
  SELECT id INTO v_activities_table_id
  FROM "VirtualTableSchema"
  WHERE virtual_schema_id = v_schema_id
    AND name = 'Activities'
  LIMIT 1;
  
  IF v_activities_table_id IS NULL THEN
    INSERT INTO "VirtualTableSchema" (
      "name",
      "virtual_schema_id",
      "user_id"
    ) VALUES (
      'Activities',
      v_schema_id,
      v_user_id::uuid
    ) RETURNING id INTO v_activities_table_id;
    
    -- Insert fields for Activities
    INSERT INTO "VirtualFieldSchema" (virtual_table_schema_id, name, type, required, "order") VALUES
      (v_activities_table_id, 'type', 'text', true, 1),
      (v_activities_table_id, 'description', 'text', true, 2),
      (v_activities_table_id, 'date', 'date', true, 3),
      (v_activities_table_id, 'status', 'text', false, 4),
      (v_activities_table_id, 'related_to', 'text', false, 5),
      (v_activities_table_id, 'assigned_to', 'text', false, 6),
      (v_activities_table_id, 'duration_minutes', 'number', false, 7),
      (v_activities_table_id, 'notes', 'textarea', false, 8);
    
    RAISE NOTICE '  ✅ Created Activities table (ID: %)', v_activities_table_id;
  ELSE
    RAISE NOTICE '  ℹ️  Activities table already exists (ID: %)', v_activities_table_id;
  END IF;
  
  RAISE NOTICE '';
  RAISE NOTICE '================================================';
  RAISE NOTICE '✅ CRM Virtual Schema Setup Complete!';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Schema ID: %', v_schema_id;
  RAISE NOTICE '📋 Table IDs:';
  RAISE NOTICE '   - Contacts: %', v_contacts_table_id;
  RAISE NOTICE '   - Leads: %', v_leads_table_id;
  RAISE NOTICE '   - Deals: %', v_deals_table_id;
  RAISE NOTICE '   - Activities: %', v_activities_table_id;
  RAISE NOTICE '';
  RAISE NOTICE '🔄 Next: Refresh your browser to see the CRM tables';
  RAISE NOTICE '    in the builder''s data source selector!';
  RAISE NOTICE '================================================';
  
END $$;

