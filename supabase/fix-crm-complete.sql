-- =====================================================
-- Complete CRM Fix Script
-- =====================================================
-- Runs all fixes for CRM solution display issues
-- User: 7b9effee-7ae8-455b-8096-ec81390518a2
-- Solution ID: 22
-- =====================================================
-- This script will:
-- 1. Update canvas config to use data-table instead of kanban
-- 2. Add sample data to showcase CRM functionality
-- =====================================================

-- =====================================================
-- STEP 1: Fix Canvas Configuration
-- =====================================================

DO $$
DECLARE
  v_solution_id INTEGER := 22;
  v_contacts_table_id INTEGER;
  v_leads_table_id INTEGER;
  v_deals_table_id INTEGER;
  v_activities_table_id INTEGER;
  v_canvas_config JSONB;
BEGIN

  SELECT vts.id INTO v_contacts_table_id FROM "VirtualTableSchema" vts
  JOIN "VirtualSchema" vs ON vts.virtual_schema_id = vs.id
  WHERE vs.template_type = 'crm' AND vs.is_template = true AND vts.name = 'Contacts' LIMIT 1;

  SELECT vts.id INTO v_leads_table_id FROM "VirtualTableSchema" vts
  JOIN "VirtualSchema" vs ON vts.virtual_schema_id = vs.id
  WHERE vs.template_type = 'crm' AND vs.is_template = true AND vts.name = 'Leads' LIMIT 1;

  SELECT vts.id INTO v_deals_table_id FROM "VirtualTableSchema" vts
  JOIN "VirtualSchema" vs ON vts.virtual_schema_id = vs.id
  WHERE vs.template_type = 'crm' AND vs.is_template = true AND vts.name = 'Deals' LIMIT 1;

  SELECT vts.id INTO v_activities_table_id FROM "VirtualTableSchema" vts
  JOIN "VirtualSchema" vs ON vts.virtual_schema_id = vs.id
  WHERE vs.template_type = 'crm' AND vs.is_template = true AND vts.name = 'Activities' LIMIT 1;

  v_canvas_config := jsonb_build_array(
    jsonb_build_object('id', 'stat-contacts', 'type', 'stat-card', 'size', jsonb_build_object('width', 1, 'height', 1), 
      'config', jsonb_build_object('title', 'Total Contacts', 'tableId', v_contacts_table_id::text)),
    jsonb_build_object('id', 'stat-leads', 'type', 'stat-card', 'size', jsonb_build_object('width', 1, 'height', 1),
      'config', jsonb_build_object('title', 'Active Leads', 'tableId', v_leads_table_id::text)),
    jsonb_build_object('id', 'stat-deals', 'type', 'stat-card', 'size', jsonb_build_object('width', 1, 'height', 1),
      'config', jsonb_build_object('title', 'Open Deals', 'tableId', v_deals_table_id::text)),
    jsonb_build_object('id', 'stat-activities', 'type', 'stat-card', 'size', jsonb_build_object('width', 1, 'height', 1),
      'config', jsonb_build_object('title', 'Activities', 'tableId', v_activities_table_id::text)),
    jsonb_build_object('id', 'deals-table', 'type', 'data-table', 'size', jsonb_build_object('width', 4, 'height', 2),
      'config', jsonb_build_object('title', 'Deal Pipeline', 'tableId', v_deals_table_id::text, 'dataSource', 'table-' || v_deals_table_id::text, 'allowCreate', true, 'allowEdit', true,
        'columnConfigs', jsonb_build_array(
          jsonb_build_object('field', 'name', 'label', 'Deal Name', 'visible', true, 'editable', true),
          jsonb_build_object('field', 'value', 'label', 'Value ($)', 'visible', true, 'editable', true),
          jsonb_build_object('field', 'stage', 'label', 'Stage', 'visible', true, 'editable', true, 'type', 'dropdown',
            'options', jsonb_build_array(
              jsonb_build_object('value', 'lead', 'label', 'Lead', 'color', 'blue'),
              jsonb_build_object('value', 'qualified', 'label', 'Qualified', 'color', 'purple'),
              jsonb_build_object('value', 'proposal', 'label', 'Proposal', 'color', 'yellow'),
              jsonb_build_object('value', 'negotiation', 'label', 'Negotiation', 'color', 'orange'),
              jsonb_build_object('value', 'closed_won', 'label', 'Closed Won', 'color', 'green'),
              jsonb_build_object('value', 'closed_lost', 'label', 'Closed Lost', 'color', 'red')
            )
          ),
          jsonb_build_object('field', 'probability', 'label', 'Probability %', 'visible', true, 'editable', true),
          jsonb_build_object('field', 'contact_name', 'label', 'Contact', 'visible', true, 'editable', true),
          jsonb_build_object('field', 'expected_close_date', 'label', 'Expected Close', 'visible', true, 'editable', true)
        )
      )
    ),
    jsonb_build_object('id', 'activities', 'type', 'activity-timeline', 'size', jsonb_build_object('width', 2, 'height', 2),
      'config', jsonb_build_object('title', 'Recent Activities', 'tableId', v_activities_table_id::text, 'allowCreate', true)),
    jsonb_build_object('id', 'contacts', 'type', 'contact-card-list', 'size', jsonb_build_object('width', 2, 'height', 2),
      'config', jsonb_build_object('title', 'Contacts', 'tableId', v_contacts_table_id::text, 'allowCreate', true))
  );

  UPDATE "Solution" SET configs = jsonb_set(COALESCE(configs, '{}'::jsonb), '{canvas}', v_canvas_config), modification_date = CURRENT_TIMESTAMP WHERE id = v_solution_id;

  RAISE NOTICE 'Step 1: Canvas configuration updated ✓';
END $$;

-- =====================================================
-- STEP 2: Add Sample Data
-- =====================================================

DO $$
DECLARE
  v_user_id TEXT := '7b9effee-7ae8-455b-8096-ec81390518a2';
  v_contacts_table_id INTEGER;
  v_leads_table_id INTEGER;
  v_deals_table_id INTEGER;
  v_activities_table_id INTEGER;
BEGIN

  SELECT vts.id INTO v_contacts_table_id FROM "VirtualTableSchema" vts
  JOIN "VirtualSchema" vs ON vts.virtual_schema_id = vs.id
  WHERE vs.template_type = 'crm' AND vs.is_template = true AND vts.name = 'Contacts' LIMIT 1;

  SELECT vts.id INTO v_leads_table_id FROM "VirtualTableSchema" vts
  JOIN "VirtualSchema" vs ON vts.virtual_schema_id = vs.id
  WHERE vs.template_type = 'crm' AND vs.is_template = true AND vts.name = 'Leads' LIMIT 1;

  SELECT vts.id INTO v_deals_table_id FROM "VirtualTableSchema" vts
  JOIN "VirtualSchema" vs ON vts.virtual_schema_id = vs.id
  WHERE vs.template_type = 'crm' AND vs.is_template = true AND vts.name = 'Deals' LIMIT 1;

  SELECT vts.id INTO v_activities_table_id FROM "VirtualTableSchema" vts
  JOIN "VirtualSchema" vs ON vts.virtual_schema_id = vs.id
  WHERE vs.template_type = 'crm' AND vs.is_template = true AND vts.name = 'Activities' LIMIT 1;

  -- Delete existing data for this user (clean slate)
  DELETE FROM "BusinessData" WHERE user_id = v_user_id 
    AND virtual_table_schema_id IN (v_contacts_table_id, v_leads_table_id, v_deals_table_id, v_activities_table_id);

  -- Insert sample data (abbreviated for brevity - key records only)
  
  -- 5 Contacts
  INSERT INTO "BusinessData" (user_id, virtual_table_schema_id, data_json, creation_date) VALUES
    (v_user_id, v_contacts_table_id, '{"name":"John Anderson","email":"john.anderson@techcorp.com","phone":"+1 555-0101","company":"TechCorp Solutions","status":"active","assigned_to":"Sarah Johnson","tags":"Enterprise, VIP"}'::jsonb, CURRENT_DATE - INTERVAL '45 days'),
    (v_user_id, v_contacts_table_id, '{"name":"Maria Garcia","email":"maria.garcia@innovatech.io","phone":"+1 555-0102","company":"InnovaTech","status":"active","assigned_to":"Michael Chen","tags":"Startup, Tech"}'::jsonb, CURRENT_DATE - INTERVAL '30 days'),
    (v_user_id, v_contacts_table_id, '{"name":"David Williams","email":"dwilliams@globalinc.com","phone":"+1 555-0103","company":"Global Inc","status":"active","assigned_to":"Sarah Johnson","tags":"Enterprise"}'::jsonb, CURRENT_DATE - INTERVAL '20 days'),
    (v_user_id, v_contacts_table_id, '{"name":"Lisa Chen","email":"lisa.chen@startupxyz.com","phone":"+1 555-0104","company":"StartupXYZ","status":"prospect","assigned_to":"Michael Chen","tags":"Startup"}'::jsonb, CURRENT_DATE - INTERVAL '15 days'),
    (v_user_id, v_contacts_table_id, '{"name":"Robert Taylor","email":"robert.t@acmecorp.com","phone":"+1 555-0105","company":"Acme Corporation","status":"active","assigned_to":"Sarah Johnson","tags":"Partner, VIP"}'::jsonb, CURRENT_DATE - INTERVAL '60 days');

  -- 5 Leads
  INSERT INTO "BusinessData" (user_id, virtual_table_schema_id, data_json, creation_date) VALUES
    (v_user_id, v_leads_table_id, '{"name":"Alex Thompson","email":"alex.thompson@newventure.com","phone":"+1 555-0201","company":"New Venture Inc","source":"website","status":"new","score":75,"assigned_to":"Sarah Johnson"}'::jsonb, CURRENT_DATE - INTERVAL '2 days'),
    (v_user_id, v_leads_table_id, '{"name":"Patricia Davis","email":"patricia.d@cloudnine.com","phone":"+1 555-0202","company":"Cloud Nine Systems","source":"referral","status":"contacted","score":85,"assigned_to":"Michael Chen"}'::jsonb, CURRENT_DATE - INTERVAL '5 days'),
    (v_user_id, v_leads_table_id, '{"name":"Carlos Mendez","email":"carlos.m@dataflow.io","phone":"+1 555-0203","company":"DataFlow Analytics","source":"social","status":"qualified","score":90,"assigned_to":"Sarah Johnson"}'::jsonb, CURRENT_DATE - INTERVAL '10 days'),
    (v_user_id, v_leads_table_id, '{"name":"Amanda White","email":"amanda.white@growth.co","phone":"+1 555-0204","company":"Growth Partners","source":"event","status":"contacted","score":65,"assigned_to":"Michael Chen"}'::jsonb, CURRENT_DATE - INTERVAL '3 days'),
    (v_user_id, v_leads_table_id, '{"name":"Thomas Anderson","email":"tanderson@innovate.com","phone":"+1 555-0205","company":"Innovate Labs","source":"website","status":"new","score":60,"assigned_to":"Sarah Johnson"}'::jsonb, CURRENT_DATE - INTERVAL '1 day');

  -- 6 Deals
  INSERT INTO "BusinessData" (user_id, virtual_table_schema_id, data_json, creation_date) VALUES
    (v_user_id, v_deals_table_id, '{"name":"TechCorp Enterprise Deal","contact_name":"John Anderson","value":85000,"stage":"proposal","probability":70,"expected_close_date":"' || (CURRENT_DATE + INTERVAL '15 days')::text || '","assigned_to":"Sarah Johnson"}'::jsonb, CURRENT_DATE - INTERVAL '20 days'),
    (v_user_id, v_deals_table_id, '{"name":"InnovaTech Starter Package","contact_name":"Maria Garcia","value":12000,"stage":"negotiation","probability":85,"expected_close_date":"' || (CURRENT_DATE + INTERVAL '7 days')::text || '","assigned_to":"Michael Chen"}'::jsonb, CURRENT_DATE - INTERVAL '15 days'),
    (v_user_id, v_deals_table_id, '{"name":"Global Inc Multi-Year","contact_name":"David Williams","value":250000,"stage":"qualified","probability":60,"expected_close_date":"' || (CURRENT_DATE + INTERVAL '45 days')::text || '","assigned_to":"Sarah Johnson"}'::jsonb, CURRENT_DATE - INTERVAL '10 days'),
    (v_user_id, v_deals_table_id, '{"name":"Digital Wave Solution","contact_name":"Emily Rodriguez","value":45000,"stage":"proposal","probability":65,"expected_close_date":"' || (CURRENT_DATE + INTERVAL '20 days')::text || '","assigned_to":"Michael Chen"}'::jsonb, CURRENT_DATE - INTERVAL '12 days'),
    (v_user_id, v_deals_table_id, '{"name":"Acme Corp Expansion","contact_name":"Robert Taylor","value":35000,"stage":"closed_won","probability":100,"expected_close_date":"' || (CURRENT_DATE - INTERVAL '5 days')::text || '","assigned_to":"Sarah Johnson"}'::jsonb, CURRENT_DATE - INTERVAL '30 days'),
    (v_user_id, v_deals_table_id, '{"name":"FutureTech AI Integration","contact_name":"Jennifer Lee","value":120000,"stage":"negotiation","probability":80,"expected_close_date":"' || (CURRENT_DATE + INTERVAL '10 days')::text || '","assigned_to":"Michael Chen"}'::jsonb, CURRENT_DATE - INTERVAL '8 days');

  -- 10 Activities
  INSERT INTO "BusinessData" (user_id, virtual_table_schema_id, data_json, creation_date) VALUES
    (v_user_id, v_activities_table_id, '{"type":"call","related_to":"TechCorp Enterprise Deal","description":"Follow-up call with John Anderson. Discussed implementation timeline.","date":"' || CURRENT_DATE::text || '","assigned_to":"Sarah Johnson","status":"completed"}'::jsonb, CURRENT_DATE),
    (v_user_id, v_activities_table_id, '{"type":"email","related_to":"Maria Garcia - InnovaTech","description":"Sent contract for review with pricing breakdown.","date":"' || CURRENT_DATE::text || '","assigned_to":"Michael Chen","status":"completed"}'::jsonb, CURRENT_DATE),
    (v_user_id, v_activities_table_id, '{"type":"meeting","related_to":"Global Inc","description":"Demo meeting showcasing enterprise features.","date":"' || (CURRENT_DATE - INTERVAL '1 day')::text || '","assigned_to":"Sarah Johnson","status":"completed"}'::jsonb, CURRENT_DATE - INTERVAL '1 day'),
    (v_user_id, v_activities_table_id, '{"type":"task","related_to":"DataFlow Analytics","description":"Prepare custom proposal.","date":"' || (CURRENT_DATE + INTERVAL '1 day')::text || '","assigned_to":"Sarah Johnson","status":"planned"}'::jsonb, CURRENT_DATE),
    (v_user_id, v_activities_table_id, '{"type":"call","related_to":"Emily Rodriguez","description":"Discovery call for technical requirements.","date":"' || (CURRENT_DATE - INTERVAL '2 days')::text || '","assigned_to":"Michael Chen","status":"completed"}'::jsonb, CURRENT_DATE - INTERVAL '2 days'),
    (v_user_id, v_activities_table_id, '{"type":"note","related_to":"Acme Corp","description":"Deal closed! Customer very happy.","date":"' || (CURRENT_DATE - INTERVAL '5 days')::text || '","assigned_to":"Sarah Johnson","status":"completed"}'::jsonb, CURRENT_DATE - INTERVAL '5 days'),
    (v_user_id, v_activities_table_id, '{"type":"meeting","related_to":"FutureTech AI","description":"Technical architecture review meeting.","date":"' || (CURRENT_DATE - INTERVAL '3 days')::text || '","assigned_to":"Michael Chen","status":"completed"}'::jsonb, CURRENT_DATE - INTERVAL '3 days'),
    (v_user_id, v_activities_table_id, '{"type":"email","related_to":"Alex Thompson","description":"Sent welcome email with product overview.","date":"' || (CURRENT_DATE - INTERVAL '1 day')::text || '","assigned_to":"Sarah Johnson","status":"completed"}'::jsonb, CURRENT_DATE - INTERVAL '1 day'),
    (v_user_id, v_activities_table_id, '{"type":"call","related_to":"Patricia Davis","description":"Initial qualification call. Budget confirmed.","date":"' || (CURRENT_DATE - INTERVAL '4 days')::text || '","assigned_to":"Michael Chen","status":"completed"}'::jsonb, CURRENT_DATE - INTERVAL '4 days'),
    (v_user_id, v_activities_table_id, '{"type":"task","related_to":"Global Inc Executive Presentation","description":"Prepare executive deck for C-level meeting.","date":"' || (CURRENT_DATE + INTERVAL '3 days')::text || '","assigned_to":"Sarah Johnson","status":"planned"}'::jsonb, CURRENT_DATE);

  RAISE NOTICE 'Step 2: Sample data created ✓';
  RAISE NOTICE 'Created: 5 contacts, 5 leads, 6 deals, 10 activities';
END $$;

-- =====================================================
-- VERIFICATION
-- =====================================================
SELECT 
  'CRM Fix Complete!' as status,
  (SELECT COUNT(*) FROM "BusinessData" WHERE user_id = '7b9effee-7ae8-455b-8096-ec81390518a2') as total_records;

