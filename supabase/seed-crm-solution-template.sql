-- =====================================================
-- CRM Solution - Solution Template Seed Script
-- =====================================================
-- This script creates a complete CRM solution template
-- with pre-configured canvas layout and component links
--
-- Run this script after:
-- 1. seed-crm-solution.sql (database structure)
-- 2. seed-crm-forms.sql (forms)
-- =====================================================

DO $$
DECLARE
  v_crm_solution_id INTEGER;
  v_crm_schema_id INTEGER;
  v_contacts_table_id INTEGER;
  v_leads_table_id INTEGER;
  v_deals_table_id INTEGER;
  v_activities_table_id INTEGER;
  v_lead_form_id INTEGER;
  v_contact_form_id INTEGER;
  v_deal_form_id INTEGER;
  v_activity_form_id INTEGER;
  v_canvas_config JSONB;
BEGIN

  -- =====================================================
  -- 1. Get IDs of previously created resources
  -- =====================================================
  
  -- Get CRM VirtualSchema ID
  SELECT id INTO v_crm_schema_id 
  FROM "VirtualSchema" 
  WHERE "template_type" = 'crm' AND "is_template" = true 
  ORDER BY "creation_date" DESC 
  LIMIT 1;

  IF v_crm_schema_id IS NULL THEN
    RAISE EXCEPTION 'CRM VirtualSchema not found. Please run seed-crm-solution.sql first.';
  END IF;

  -- Get table IDs
  SELECT id INTO v_contacts_table_id FROM "VirtualTableSchema" 
  WHERE "virtual_schema_id" = v_crm_schema_id AND "name" = 'Contacts';

  SELECT id INTO v_leads_table_id FROM "VirtualTableSchema" 
  WHERE "virtual_schema_id" = v_crm_schema_id AND "name" = 'Leads';

  SELECT id INTO v_deals_table_id FROM "VirtualTableSchema" 
  WHERE "virtual_schema_id" = v_crm_schema_id AND "name" = 'Deals';

  SELECT id INTO v_activities_table_id FROM "VirtualTableSchema" 
  WHERE "virtual_schema_id" = v_crm_schema_id AND "name" = 'Activities';

  -- Get form IDs
  SELECT id INTO v_lead_form_id FROM "Form" WHERE "name" = 'Lead Capture Form' ORDER BY "creation_date" DESC LIMIT 1;
  SELECT id INTO v_contact_form_id FROM "Form" WHERE "name" = 'Contact Management Form' ORDER BY "creation_date" DESC LIMIT 1;
  SELECT id INTO v_deal_form_id FROM "Form" WHERE "name" = 'Deal / Opportunity Form' ORDER BY "creation_date" DESC LIMIT 1;
  SELECT id INTO v_activity_form_id FROM "Form" WHERE "name" = 'Activity Log Form' ORDER BY "creation_date" DESC LIMIT 1;

  RAISE NOTICE 'Found resources:';
  RAISE NOTICE '  CRM Schema ID: %', v_crm_schema_id;
  RAISE NOTICE '  Contacts Table ID: %', v_contacts_table_id;
  RAISE NOTICE '  Leads Table ID: %', v_leads_table_id;
  RAISE NOTICE '  Deals Table ID: %', v_deals_table_id;
  RAISE NOTICE '  Activities Table ID: %', v_activities_table_id;

  -- =====================================================
  -- 2. Build Canvas Configuration
  -- =====================================================
  v_canvas_config := jsonb_build_array(
    -- Row 1: Stat Cards (4 cards, each spanning 1 column)
    jsonb_build_object(
      'id', 'stat-contacts',
      'type', 'stat-card',
      'size', jsonb_build_object('width', 1, 'height', 1),
      'config', jsonb_build_object(
        'title', 'Total Contacts',
        'tableId', v_contacts_table_id::text,
        'icon', 'users',
        'color', 'blue'
      )
    ),
    jsonb_build_object(
      'id', 'stat-leads',
      'type', 'stat-card',
      'size', jsonb_build_object('width', 1, 'height', 1),
      'config', jsonb_build_object(
        'title', 'Active Leads',
        'tableId', v_leads_table_id::text,
        'icon', 'target',
        'color', 'orange'
      )
    ),
    jsonb_build_object(
      'id', 'stat-deals',
      'type', 'stat-card',
      'size', jsonb_build_object('width', 1, 'height', 1),
      'config', jsonb_build_object(
        'title', 'Open Deals',
        'tableId', v_deals_table_id::text,
        'icon', 'dollar-sign',
        'color', 'green'
      )
    ),
    jsonb_build_object(
      'id', 'stat-activities',
      'type', 'stat-card',
      'size', jsonb_build_object('width', 1, 'height', 1),
      'config', jsonb_build_object(
        'title', 'Activities Today',
        'tableId', v_activities_table_id::text,
        'icon', 'activity',
        'color', 'purple'
      )
    ),
    
    -- Row 2: Kanban Board (full width)
    jsonb_build_object(
      'id', 'deals-kanban',
      'type', 'kanban-board',
      'size', jsonb_build_object('width', 4, 'height', 2),
      'config', jsonb_build_object(
        'title', 'Deal Pipeline',
        'tableId', v_deals_table_id::text,
        'allowCreate', true,
        'allowEdit', true,
        'showValue', true,
        'showProbability', true
      )
    ),
    
    -- Row 3: Left - Activity Timeline (2 columns)
    jsonb_build_object(
      'id', 'recent-activities',
      'type', 'activity-timeline',
      'size', jsonb_build_object('width', 2, 'height', 2),
      'config', jsonb_build_object(
        'title', 'Recent Activities',
        'tableId', v_activities_table_id::text,
        'allowCreate', true,
        'maxItems', 10,
        'showRelatedTo', true,
        'showAssignedTo', true
      )
    ),
    
    -- Row 3: Right - Contact List (2 columns)
    jsonb_build_object(
      'id', 'contacts-list',
      'type', 'contact-card-list',
      'size', jsonb_build_object('width', 2, 'height', 2),
      'config', jsonb_build_object(
        'title', 'Contacts',
        'tableId', v_contacts_table_id::text,
        'allowCreate', true,
        'allowEdit', true,
        'allowDelete', true,
        'defaultView', 'grid',
        'showSearch', true
      )
    )
  );

  -- =====================================================
  -- 3. Create CRM Solution Template
  -- =====================================================
  INSERT INTO "Solution" (
    "name",
    "description",
    "template_type",
    "is_template",
    "status",
    "icon",
    "color",
    "category",
    "configs"
  ) VALUES (
    'CRM - Sales Pipeline',
    'Complete Customer Relationship Management system with contact management, lead tracking, deal pipeline with Kanban board, and activity logging. Perfect for sales teams to manage their entire sales process.',
    'crm_sales',
    true,
    'active',
    'users',
    'bg-blue-500',
    'Sales & CRM',
    jsonb_build_object(
      'features', jsonb_build_array(
        'Contact Management',
        'Lead Tracking',
        'Deal Pipeline with Kanban',
        'Activity Timeline',
        'Sales Analytics'
      ),
      'version', '1.0',
      'canvas', v_canvas_config
    )
  ) RETURNING id INTO v_crm_solution_id;

  RAISE NOTICE 'CRM Solution Template created with ID: %', v_crm_solution_id;

  -- =====================================================
  -- 4. Link Components to Solution
  -- =====================================================
  
  -- Link VirtualSchema (Database)
  INSERT INTO "SolutionComponent" (
    "solution_id",
    "component_type",
    "component_id",
    "configs"
  ) VALUES (
    v_crm_solution_id,
    'virtual_schema',
    v_crm_schema_id,
    '{"display_order": 1, "name": "CRM Database"}'
  );

  -- Link Forms
  IF v_lead_form_id IS NOT NULL THEN
    INSERT INTO "SolutionComponent" (
      "solution_id",
      "component_type",
      "component_id",
      "configs"
    ) VALUES (
      v_crm_solution_id,
      'form',
      v_lead_form_id,
      '{"display_order": 2, "name": "Lead Capture Form"}'
    );
  END IF;

  IF v_contact_form_id IS NOT NULL THEN
    INSERT INTO "SolutionComponent" (
      "solution_id",
      "component_type",
      "component_id",
      "configs"
    ) VALUES (
      v_crm_solution_id,
      'form',
      v_contact_form_id,
      '{"display_order": 3, "name": "Contact Form"}'
    );
  END IF;

  IF v_deal_form_id IS NOT NULL THEN
    INSERT INTO "SolutionComponent" (
      "solution_id",
      "component_type",
      "component_id",
      "configs"
    ) VALUES (
      v_crm_solution_id,
      'form',
      v_deal_form_id,
      '{"display_order": 4, "name": "Deal Form"}'
    );
  END IF;

  IF v_activity_form_id IS NOT NULL THEN
    INSERT INTO "SolutionComponent" (
      "solution_id",
      "component_type",
      "component_id",
      "configs"
    ) VALUES (
      v_crm_solution_id,
      'form',
      v_activity_form_id,
      '{"display_order": 5, "name": "Activity Form"}'
    );
  END IF;

  -- =====================================================
  -- Summary
  -- =====================================================
  RAISE NOTICE '================================================';
  RAISE NOTICE 'CRM Solution Template created successfully!';
  RAISE NOTICE '================================================';
  RAISE NOTICE 'Solution ID: %', v_crm_solution_id;
  RAISE NOTICE 'Components linked:';
  RAISE NOTICE '  - CRM Database (VirtualSchema)';
  RAISE NOTICE '  - Lead Capture Form';
  RAISE NOTICE '  - Contact Form';
  RAISE NOTICE '  - Deal Form';
  RAISE NOTICE '  - Activity Form';
  RAISE NOTICE '================================================';
  RAISE NOTICE 'Canvas includes:';
  RAISE NOTICE '  - 4 Stat Cards (Contacts, Leads, Deals, Activities)';
  RAISE NOTICE '  - Kanban Board for Deal Pipeline';
  RAISE NOTICE '  - Activity Timeline';
  RAISE NOTICE '  - Contact Card List';
  RAISE NOTICE '================================================';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Users can now instantiate this template from /dashboard/solutions';
  RAISE NOTICE '2. Optionally run seed-crm-workflows.sql to add automation';
  RAISE NOTICE '3. Set up DataConnections to link forms to tables';
  RAISE NOTICE '================================================';

END $$;

-- =====================================================
-- Verification Query
-- =====================================================
-- Run this to verify the solution was created
SELECT 
  s.id,
  s.name,
  s.template_type,
  s.is_template,
  s.status,
  COUNT(sc.id) as component_count,
  jsonb_array_length(s.configs->'canvas') as canvas_components_count
FROM "Solution" s
LEFT JOIN "SolutionComponent" sc ON s.id = sc.solution_id
WHERE s.template_type = 'crm_sales' AND s.is_template = true
GROUP BY s.id, s.name, s.template_type, s.is_template, s.status, s.configs;

-- View linked components
SELECT 
  s.name as solution_name,
  sc.component_type,
  sc.configs->>'name' as component_name,
  sc.configs->>'display_order' as display_order
FROM "Solution" s
JOIN "SolutionComponent" sc ON s.id = sc.solution_id
WHERE s.template_type = 'crm_sales' AND s.is_template = true
ORDER BY (sc.configs->>'display_order')::int;

