-- =====================================================
-- CRM COMPLETE FIX - ONE SCRIPT TO RUN EVERYTHING
-- =====================================================
-- Run this script in Supabase Dashboard SQL Editor
-- User: 7b9effee-7ae8-455b-8096-ec81390518a2
-- Solution ID: 22
-- =====================================================
-- This master script:
-- 1. Diagnoses current state
-- 2. Gets correct table IDs
-- 3. Creates/verifies sample data
-- 4. Fixes canvas configuration with proper data-table setup
-- 5. Verifies everything works
-- =====================================================

DO $$
DECLARE
  v_user_id TEXT := '7b9effee-7ae8-455b-8096-ec81390518a2';
  v_solution_id INTEGER := 22;
  v_contacts_table_id INTEGER;
  v_leads_table_id INTEGER;
  v_deals_table_id INTEGER;
  v_activities_table_id INTEGER;
  v_canvas_config JSONB;
  v_data_count INTEGER;
  v_solution_exists BOOLEAN;
BEGIN

  RAISE NOTICE '';
  RAISE NOTICE '╔═══════════════════════════════════════════════╗';
  RAISE NOTICE '║   CRM COMPLETE FIX - SOLUTION 22              ║';
  RAISE NOTICE '╚═══════════════════════════════════════════════╝';
  RAISE NOTICE '';

  -- =====================================================
  -- DIAGNOSTIC: Check if solution exists
  -- =====================================================
  
  SELECT EXISTS(SELECT 1 FROM "Solution" WHERE id = v_solution_id) INTO v_solution_exists;
  
  IF NOT v_solution_exists THEN
    RAISE EXCEPTION 'Solution % does not exist!', v_solution_id;
  END IF;

  RAISE NOTICE '✓ Solution % exists', v_solution_id;

  -- =====================================================
  -- STEP 1: Get Correct Table IDs from Template
  -- =====================================================
  
  RAISE NOTICE '';
  RAISE NOTICE '📋 STEP 1: Getting Table IDs...';
  
  SELECT vts.id INTO v_contacts_table_id 
  FROM "VirtualTableSchema" vts
  JOIN "VirtualSchema" vs ON vts.virtual_schema_id = vs.id
  WHERE vs.template_type = 'crm' AND vs.is_template = true AND vts.name = 'Contacts' 
  LIMIT 1;

  SELECT vts.id INTO v_leads_table_id 
  FROM "VirtualTableSchema" vts
  JOIN "VirtualSchema" vs ON vts.virtual_schema_id = vs.id
  WHERE vs.template_type = 'crm' AND vs.is_template = true AND vts.name = 'Leads' 
  LIMIT 1;

  SELECT vts.id INTO v_deals_table_id 
  FROM "VirtualTableSchema" vts
  JOIN "VirtualSchema" vs ON vts.virtual_schema_id = vs.id
  WHERE vs.template_type = 'crm' AND vs.is_template = true AND vts.name = 'Deals' 
  LIMIT 1;

  SELECT vts.id INTO v_activities_table_id 
  FROM "VirtualTableSchema" vts
  JOIN "VirtualSchema" vs ON vts.virtual_schema_id = vs.id
  WHERE vs.template_type = 'crm' AND vs.is_template = true AND vts.name = 'Activities' 
  LIMIT 1;

  IF v_contacts_table_id IS NULL OR v_leads_table_id IS NULL OR 
     v_deals_table_id IS NULL OR v_activities_table_id IS NULL THEN
    RAISE EXCEPTION 'CRM tables not found! Run setup-crm-dashboard.sql first.';
  END IF;

  RAISE NOTICE '  ✓ Contacts Table ID: %', v_contacts_table_id;
  RAISE NOTICE '  ✓ Leads Table ID: %', v_leads_table_id;
  RAISE NOTICE '  ✓ Deals Table ID: %', v_deals_table_id;
  RAISE NOTICE '  ✓ Activities Table ID: %', v_activities_table_id;

  -- =====================================================
  -- STEP 2: Create Sample Data (if not exists)
  -- =====================================================
  
  RAISE NOTICE '';
  RAISE NOTICE '📊 STEP 2: Checking/Creating Sample Data...';
  
  -- Check if data already exists
  SELECT COUNT(*) INTO v_data_count
  FROM "BusinessData"
  WHERE user_id = v_user_id 
    AND virtual_table_schema_id IN (v_contacts_table_id, v_leads_table_id, v_deals_table_id, v_activities_table_id);

  IF v_data_count > 0 THEN
    RAISE NOTICE '  ℹ Data already exists (% records). Cleaning and recreating...', v_data_count;
    
    -- Clean existing data
    DELETE FROM "BusinessData" 
    WHERE user_id = v_user_id 
      AND virtual_table_schema_id IN (v_contacts_table_id, v_leads_table_id, v_deals_table_id, v_activities_table_id);
  END IF;

  -- Insert 5 Contacts
  INSERT INTO "BusinessData" (user_id, virtual_table_schema_id, data_json, creation_date) VALUES
    (v_user_id, v_contacts_table_id, '{"name":"John Anderson","email":"john.anderson@techcorp.com","phone":"+1 555-0101","company":"TechCorp Solutions","status":"active","assigned_to":"Sarah Johnson","tags":"Enterprise, VIP"}'::jsonb, CURRENT_DATE - INTERVAL '45 days'),
    (v_user_id, v_contacts_table_id, '{"name":"Maria Garcia","email":"maria.garcia@innovatech.io","phone":"+1 555-0102","company":"InnovaTech","status":"active","assigned_to":"Michael Chen","tags":"Startup, Tech"}'::jsonb, CURRENT_DATE - INTERVAL '30 days'),
    (v_user_id, v_contacts_table_id, '{"name":"David Williams","email":"dwilliams@globalinc.com","phone":"+1 555-0103","company":"Global Inc","status":"active","assigned_to":"Sarah Johnson","tags":"Enterprise"}'::jsonb, CURRENT_DATE - INTERVAL '20 days'),
    (v_user_id, v_contacts_table_id, '{"name":"Lisa Chen","email":"lisa.chen@startupxyz.com","phone":"+1 555-0104","company":"StartupXYZ","status":"prospect","assigned_to":"Michael Chen","tags":"Startup"}'::jsonb, CURRENT_DATE - INTERVAL '15 days'),
    (v_user_id, v_contacts_table_id, '{"name":"Robert Taylor","email":"robert.t@acmecorp.com","phone":"+1 555-0105","company":"Acme Corporation","status":"active","assigned_to":"Sarah Johnson","tags":"Partner, VIP"}'::jsonb, CURRENT_DATE - INTERVAL '60 days');

  RAISE NOTICE '  ✓ Created 5 contacts';

  -- Insert 5 Leads
  INSERT INTO "BusinessData" (user_id, virtual_table_schema_id, data_json, creation_date) VALUES
    (v_user_id, v_leads_table_id, '{"name":"Alex Thompson","email":"alex.thompson@newventure.com","phone":"+1 555-0201","company":"New Venture Inc","source":"website","status":"new","score":75,"assigned_to":"Sarah Johnson"}'::jsonb, CURRENT_DATE - INTERVAL '2 days'),
    (v_user_id, v_leads_table_id, '{"name":"Patricia Davis","email":"patricia.d@cloudnine.com","phone":"+1 555-0202","company":"Cloud Nine Systems","source":"referral","status":"contacted","score":85,"assigned_to":"Michael Chen"}'::jsonb, CURRENT_DATE - INTERVAL '5 days'),
    (v_user_id, v_leads_table_id, '{"name":"Carlos Mendez","email":"carlos.m@dataflow.io","phone":"+1 555-0203","company":"DataFlow Analytics","source":"social","status":"qualified","score":90,"assigned_to":"Sarah Johnson"}'::jsonb, CURRENT_DATE - INTERVAL '10 days'),
    (v_user_id, v_leads_table_id, '{"name":"Amanda White","email":"amanda.white@growth.co","phone":"+1 555-0204","company":"Growth Partners","source":"event","status":"contacted","score":65,"assigned_to":"Michael Chen"}'::jsonb, CURRENT_DATE - INTERVAL '3 days'),
    (v_user_id, v_leads_table_id, '{"name":"Thomas Anderson","email":"tanderson@innovate.com","phone":"+1 555-0205","company":"Innovate Labs","source":"website","status":"new","score":60,"assigned_to":"Sarah Johnson"}'::jsonb, CURRENT_DATE - INTERVAL '1 day');

  RAISE NOTICE '  ✓ Created 5 leads';

  -- Insert 6 Deals (using jsonb_build_object to avoid concatenation issues)
  INSERT INTO "BusinessData" (user_id, virtual_table_schema_id, data_json, creation_date) VALUES
    (v_user_id, v_deals_table_id, 
      jsonb_build_object(
        'name', 'TechCorp Enterprise Deal',
        'contact_name', 'John Anderson',
        'value', 85000,
        'stage', 'proposal',
        'probability', 70,
        'expected_close_date', (CURRENT_DATE + INTERVAL '15 days')::text,
        'assigned_to', 'Sarah Johnson'
      ), CURRENT_DATE - INTERVAL '20 days'),
    (v_user_id, v_deals_table_id, 
      jsonb_build_object(
        'name', 'InnovaTech Starter Package',
        'contact_name', 'Maria Garcia',
        'value', 12000,
        'stage', 'negotiation',
        'probability', 85,
        'expected_close_date', (CURRENT_DATE + INTERVAL '7 days')::text,
        'assigned_to', 'Michael Chen'
      ), CURRENT_DATE - INTERVAL '15 days'),
    (v_user_id, v_deals_table_id, 
      jsonb_build_object(
        'name', 'Global Inc Multi-Year',
        'contact_name', 'David Williams',
        'value', 250000,
        'stage', 'qualified',
        'probability', 60,
        'expected_close_date', (CURRENT_DATE + INTERVAL '45 days')::text,
        'assigned_to', 'Sarah Johnson'
      ), CURRENT_DATE - INTERVAL '10 days'),
    (v_user_id, v_deals_table_id, 
      jsonb_build_object(
        'name', 'Digital Wave Solution',
        'contact_name', 'Emily Rodriguez',
        'value', 45000,
        'stage', 'proposal',
        'probability', 65,
        'expected_close_date', (CURRENT_DATE + INTERVAL '20 days')::text,
        'assigned_to', 'Michael Chen'
      ), CURRENT_DATE - INTERVAL '12 days'),
    (v_user_id, v_deals_table_id, 
      jsonb_build_object(
        'name', 'Acme Corp Expansion',
        'contact_name', 'Robert Taylor',
        'value', 35000,
        'stage', 'closed_won',
        'probability', 100,
        'expected_close_date', (CURRENT_DATE - INTERVAL '5 days')::text,
        'assigned_to', 'Sarah Johnson'
      ), CURRENT_DATE - INTERVAL '30 days'),
    (v_user_id, v_deals_table_id, 
      jsonb_build_object(
        'name', 'FutureTech AI Integration',
        'contact_name', 'Jennifer Lee',
        'value', 120000,
        'stage', 'negotiation',
        'probability', 80,
        'expected_close_date', (CURRENT_DATE + INTERVAL '10 days')::text,
        'assigned_to', 'Michael Chen'
      ), CURRENT_DATE - INTERVAL '8 days');

  RAISE NOTICE '  ✓ Created 6 deals ($547,000 total pipeline)';

  -- Insert 10 Activities (using jsonb_build_object to avoid concatenation issues)
  INSERT INTO "BusinessData" (user_id, virtual_table_schema_id, data_json, creation_date) VALUES
    (v_user_id, v_activities_table_id, 
      jsonb_build_object(
        'type', 'call',
        'related_to', 'TechCorp Enterprise Deal',
        'description', 'Follow-up call with John Anderson. Discussed implementation timeline.',
        'date', CURRENT_DATE::text,
        'assigned_to', 'Sarah Johnson',
        'status', 'completed'
      ), CURRENT_DATE),
    (v_user_id, v_activities_table_id, 
      jsonb_build_object(
        'type', 'email',
        'related_to', 'Maria Garcia - InnovaTech',
        'description', 'Sent contract for review with pricing breakdown.',
        'date', CURRENT_DATE::text,
        'assigned_to', 'Michael Chen',
        'status', 'completed'
      ), CURRENT_DATE),
    (v_user_id, v_activities_table_id, 
      jsonb_build_object(
        'type', 'meeting',
        'related_to', 'Global Inc',
        'description', 'Demo meeting showcasing enterprise features.',
        'date', (CURRENT_DATE - INTERVAL '1 day')::text,
        'assigned_to', 'Sarah Johnson',
        'status', 'completed'
      ), CURRENT_DATE - INTERVAL '1 day'),
    (v_user_id, v_activities_table_id, 
      jsonb_build_object(
        'type', 'task',
        'related_to', 'DataFlow Analytics',
        'description', 'Prepare custom proposal.',
        'date', (CURRENT_DATE + INTERVAL '1 day')::text,
        'assigned_to', 'Sarah Johnson',
        'status', 'planned'
      ), CURRENT_DATE),
    (v_user_id, v_activities_table_id, 
      jsonb_build_object(
        'type', 'call',
        'related_to', 'Emily Rodriguez',
        'description', 'Discovery call for technical requirements.',
        'date', (CURRENT_DATE - INTERVAL '2 days')::text,
        'assigned_to', 'Michael Chen',
        'status', 'completed'
      ), CURRENT_DATE - INTERVAL '2 days'),
    (v_user_id, v_activities_table_id, 
      jsonb_build_object(
        'type', 'note',
        'related_to', 'Acme Corp',
        'description', 'Deal closed! Customer very happy.',
        'date', (CURRENT_DATE - INTERVAL '5 days')::text,
        'assigned_to', 'Sarah Johnson',
        'status', 'completed'
      ), CURRENT_DATE - INTERVAL '5 days'),
    (v_user_id, v_activities_table_id, 
      jsonb_build_object(
        'type', 'meeting',
        'related_to', 'FutureTech AI',
        'description', 'Technical architecture review meeting.',
        'date', (CURRENT_DATE - INTERVAL '3 days')::text,
        'assigned_to', 'Michael Chen',
        'status', 'completed'
      ), CURRENT_DATE - INTERVAL '3 days'),
    (v_user_id, v_activities_table_id, 
      jsonb_build_object(
        'type', 'email',
        'related_to', 'Alex Thompson',
        'description', 'Sent welcome email with product overview.',
        'date', (CURRENT_DATE - INTERVAL '1 day')::text,
        'assigned_to', 'Sarah Johnson',
        'status', 'completed'
      ), CURRENT_DATE - INTERVAL '1 day'),
    (v_user_id, v_activities_table_id, 
      jsonb_build_object(
        'type', 'call',
        'related_to', 'Patricia Davis',
        'description', 'Initial qualification call. Budget confirmed.',
        'date', (CURRENT_DATE - INTERVAL '4 days')::text,
        'assigned_to', 'Michael Chen',
        'status', 'completed'
      ), CURRENT_DATE - INTERVAL '4 days'),
    (v_user_id, v_activities_table_id, 
      jsonb_build_object(
        'type', 'task',
        'related_to', 'Global Inc Executive Presentation',
        'description', 'Prepare executive deck for C-level meeting.',
        'date', (CURRENT_DATE + INTERVAL '3 days')::text,
        'assigned_to', 'Sarah Johnson',
        'status', 'planned'
      ), CURRENT_DATE);

  RAISE NOTICE '  ✓ Created 10 activities';

  -- =====================================================
  -- STEP 3: Fix Canvas Configuration with Proper Data Table
  -- =====================================================
  
  RAISE NOTICE '';
  RAISE NOTICE '🎨 STEP 3: Updating Canvas Configuration...';

  v_canvas_config := jsonb_build_array(
    -- Row 1: 4 Stat Cards (Spanish)
    jsonb_build_object(
      'id', 'stat-contacts',
      'type', 'stat-card',
      'size', jsonb_build_object('width', 1, 'height', 1),
      'config', jsonb_build_object(
        'title', 'Contactos Totales',
        'tableId', v_contacts_table_id,
        'metric', 'count',
        'icon', 'users'
      )
    ),
    jsonb_build_object(
      'id', 'stat-leads',
      'type', 'stat-card',
      'size', jsonb_build_object('width', 1, 'height', 1),
      'config', jsonb_build_object(
        'title', 'Leads Activos',
        'tableId', v_leads_table_id,
        'metric', 'count',
        'icon', 'user-plus'
      )
    ),
    jsonb_build_object(
      'id', 'stat-deals',
      'type', 'stat-card',
      'size', jsonb_build_object('width', 1, 'height', 1),
      'config', jsonb_build_object(
        'title', 'Deals Abiertos',
        'tableId', v_deals_table_id,
        'metric', 'count',
        'icon', 'briefcase'
      )
    ),
    jsonb_build_object(
      'id', 'stat-activities',
      'type', 'stat-card',
      'size', jsonb_build_object('width', 1, 'height', 1),
      'config', jsonb_build_object(
        'title', 'Actividades Hoy',
        'tableId', v_activities_table_id,
        'metric', 'count',
        'icon', 'activity'
      )
    ),
    -- Row 2: Deal Pipeline Data Table (Spanish + Stage Colors)
    jsonb_build_object(
      'id', 'deals-table',
      'type', 'data-table',
      'size', jsonb_build_object('width', 4, 'height', 2),
      'config', jsonb_build_object(
        'title', 'Pipeline de Ventas',
        'tableId', v_deals_table_id,
        'allowCreate', true,
        'allowEdit', true,
        'allowDelete', true,
        'showSearch', true,
        'pageSize', 10,
        'columns', jsonb_build_array(
          jsonb_build_object('key', 'name', 'label', 'Nombre del Deal', 'sortable', true, 'width', 200),
          jsonb_build_object('key', 'value', 'label', 'Valor ($)', 'sortable', true, 'width', 120, 'format', 'currency'),
          jsonb_build_object('key', 'stage', 'label', 'Etapa', 'sortable', true, 'width', 150, 'type', 'badge',
            'options', jsonb_build_array('lead', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost'),
            'stageColors', jsonb_build_object(
              'lead', jsonb_build_object('label', 'Lead', 'color', 'blue'),
              'qualified', jsonb_build_object('label', 'Calificado', 'color', 'purple'),
              'proposal', jsonb_build_object('label', 'Propuesta', 'color', 'yellow'),
              'negotiation', jsonb_build_object('label', 'Negociación', 'color', 'orange'),
              'closed_won', jsonb_build_object('label', 'Cerrado Ganado', 'color', 'green'),
              'closed_lost', jsonb_build_object('label', 'Cerrado Perdido', 'color', 'red')
            )),
          jsonb_build_object('key', 'probability', 'label', 'Probabilidad %', 'sortable', true, 'width', 120),
          jsonb_build_object('key', 'contact_name', 'label', 'Contacto', 'sortable', true, 'width', 180),
          jsonb_build_object('key', 'expected_close_date', 'label', 'Cierre Esperado', 'sortable', true, 'width', 130, 'format', 'date')
        )
      )
    ),
    -- Row 3: Activities Timeline and Contacts List (Spanish)
    jsonb_build_object(
      'id', 'activities',
      'type', 'activity-timeline',
      'size', jsonb_build_object('width', 2, 'height', 2),
      'config', jsonb_build_object(
        'title', 'Actividades Recientes',
        'tableId', v_activities_table_id,
        'allowCreate', true,
        'maxItems', 10,
        'showRelatedTo', true,
        'showAssignedTo', true
      )
    ),
    jsonb_build_object(
      'id', 'contacts',
      'type', 'contact-card-list',
      'size', jsonb_build_object('width', 2, 'height', 2),
      'config', jsonb_build_object(
        'title', 'Contactos',
        'tableId', v_contacts_table_id,
        'allowCreate', true,
        'allowEdit', true,
        'allowDelete', true,
        'defaultView', 'grid',
        'showSearch', true
      )
    )
  );

  -- Update the solution
  UPDATE "Solution" 
  SET 
    configs = jsonb_set(
      COALESCE(configs, '{}'::jsonb), 
      '{canvas}', 
      v_canvas_config
    ),
    modification_date = CURRENT_TIMESTAMP 
  WHERE id = v_solution_id;

  RAISE NOTICE '  ✓ Canvas updated with 7 components';
  RAISE NOTICE '    - 4 stat cards';
  RAISE NOTICE '    - 1 data table (Deal Pipeline)';
  RAISE NOTICE '    - 1 activity timeline';
  RAISE NOTICE '    - 1 contact list';

  -- =====================================================
  -- STEP 4: Final Verification
  -- =====================================================
  
  RAISE NOTICE '';
  RAISE NOTICE '✅ STEP 4: Verification...';
  RAISE NOTICE '';
  
  SELECT COUNT(*) INTO v_data_count FROM "BusinessData" 
  WHERE user_id = v_user_id AND virtual_table_schema_id = v_contacts_table_id;
  RAISE NOTICE '  📇 Contacts: % records', v_data_count;
  
  SELECT COUNT(*) INTO v_data_count FROM "BusinessData" 
  WHERE user_id = v_user_id AND virtual_table_schema_id = v_leads_table_id;
  RAISE NOTICE '  🎯 Leads: % records', v_data_count;
  
  SELECT COUNT(*) INTO v_data_count FROM "BusinessData" 
  WHERE user_id = v_user_id AND virtual_table_schema_id = v_deals_table_id;
  RAISE NOTICE '  💼 Deals: % records', v_data_count;
  
  SELECT COUNT(*) INTO v_data_count FROM "BusinessData" 
  WHERE user_id = v_user_id AND virtual_table_schema_id = v_activities_table_id;
  RAISE NOTICE '  📊 Activities: % records', v_data_count;

  RAISE NOTICE '';
  RAISE NOTICE '╔═══════════════════════════════════════════════╗';
  RAISE NOTICE '║          ✅ CRM FIX COMPLETED!                ║';
  RAISE NOTICE '╠═══════════════════════════════════════════════╣';
  RAISE NOTICE '║  Next Steps:                                  ║';
  RAISE NOTICE '║  1. Refresh your browser                      ║';
  RAISE NOTICE '║  2. Navigate to solution 22                   ║';
  RAISE NOTICE '║  3. Deal Pipeline should now show 6 deals     ║';
  RAISE NOTICE '║  4. All components should have data           ║';
  RAISE NOTICE '╚═══════════════════════════════════════════════╝';
  RAISE NOTICE '';

END $$;

-- Final Success Message
SELECT 
  '🎉 SUCCESS!' as status,
  'CRM Solution 22 Fixed' as message,
  (SELECT COUNT(*) FROM "BusinessData" WHERE user_id = '7b9effee-7ae8-455b-8096-ec81390518a2') as total_records;

