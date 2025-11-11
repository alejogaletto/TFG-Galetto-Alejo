-- =====================================================
-- CRM Solution - Complete Setup (Supabase Dashboard)
-- =====================================================
-- This is a single-file version that works in Supabase Dashboard
-- Run this entire script at once in the SQL Editor
-- =====================================================

-- ==================================
-- STEP 1: Database Structure
-- ==================================

DO $$
DECLARE
  v_schema_id INTEGER;
  v_contacts_table_id INTEGER;
  v_leads_table_id INTEGER;
  v_deals_table_id INTEGER;
  v_activities_table_id INTEGER;
BEGIN

  -- Create CRM VirtualSchema
  INSERT INTO "VirtualSchema" (
    "name",
    "description",
    "template_type",
    "is_template",
    "icon",
    "color",
    "category",
    "configs"
  ) VALUES (
    'CRM Database',
    'Complete database structure for Customer Relationship Management with contacts, leads, deals, and activities tracking',
    'crm',
    true,
    'users',
    'bg-blue-500',
    'Sales & CRM',
    '{"features": ["Contact Management", "Lead Tracking", "Deal Pipeline", "Activity Logging"], "version": "1.0"}'
  ) RETURNING id INTO v_schema_id;

  -- Create Contacts Table
  INSERT INTO "VirtualTableSchema" (
    "virtual_schema_id",
    "name",
    "description",
    "configs"
  ) VALUES (
    v_schema_id,
    'Contacts',
    'Customer and contact information database',
    '{"icon": "user", "color": "blue", "permissions": {"create": true, "read": true, "update": true, "delete": true}}'
  ) RETURNING id INTO v_contacts_table_id;

  INSERT INTO "VirtualFieldSchema" ("virtual_table_schema_id", "name", "type", "properties") VALUES
    (v_contacts_table_id, 'name', 'text', '{"label": "Full Name", "required": true, "placeholder": "John Doe"}'),
    (v_contacts_table_id, 'email', 'email', '{"label": "Email Address", "required": true, "placeholder": "john@company.com"}'),
    (v_contacts_table_id, 'phone', 'text', '{"label": "Phone Number", "required": false, "placeholder": "+1 234 567 8900"}'),
    (v_contacts_table_id, 'company', 'text', '{"label": "Company", "required": false, "placeholder": "Acme Corp"}'),
    (v_contacts_table_id, 'status', 'dropdown', '{"label": "Status", "required": true, "options": [{"value": "active", "label": "Active", "color": "green"}, {"value": "inactive", "label": "Inactive", "color": "gray"}, {"value": "prospect", "label": "Prospect", "color": "blue"}], "default": "prospect"}'),
    (v_contacts_table_id, 'assigned_to', 'text', '{"label": "Assigned To", "required": false, "placeholder": "Sales Rep Name"}'),
    (v_contacts_table_id, 'tags', 'text', '{"label": "Tags", "required": false, "placeholder": "VIP, Partner, etc."}'),
    (v_contacts_table_id, 'notes', 'textarea', '{"label": "Notes", "required": false, "placeholder": "Additional information about this contact"}'),
    (v_contacts_table_id, 'created_date', 'date', '{"label": "Created Date", "required": false, "default": "now"}');

  -- Create Leads Table
  INSERT INTO "VirtualTableSchema" (
    "virtual_schema_id",
    "name",
    "description",
    "configs"
  ) VALUES (
    v_schema_id,
    'Leads',
    'Sales leads and prospects pipeline',
    '{"icon": "target", "color": "orange", "permissions": {"create": true, "read": true, "update": true, "delete": true}}'
  ) RETURNING id INTO v_leads_table_id;

  INSERT INTO "VirtualFieldSchema" ("virtual_table_schema_id", "name", "type", "properties") VALUES
    (v_leads_table_id, 'name', 'text', '{"label": "Lead Name", "required": true, "placeholder": "Jane Smith"}'),
    (v_leads_table_id, 'email', 'email', '{"label": "Email Address", "required": true, "placeholder": "jane@company.com"}'),
    (v_leads_table_id, 'phone', 'text', '{"label": "Phone Number", "required": false, "placeholder": "+1 234 567 8900"}'),
    (v_leads_table_id, 'company', 'text', '{"label": "Company", "required": false, "placeholder": "Tech Startup Inc"}'),
    (v_leads_table_id, 'source', 'dropdown', '{"label": "Lead Source", "required": true, "options": [{"value": "website", "label": "Website", "color": "blue"}, {"value": "referral", "label": "Referral", "color": "green"}, {"value": "social", "label": "Social Media", "color": "purple"}, {"value": "event", "label": "Event", "color": "orange"}, {"value": "cold_call", "label": "Cold Call", "color": "gray"}, {"value": "other", "label": "Other", "color": "gray"}], "default": "website"}'),
    (v_leads_table_id, 'status', 'dropdown', '{"label": "Lead Status", "required": true, "options": [{"value": "new", "label": "New", "color": "blue"}, {"value": "contacted", "label": "Contacted", "color": "yellow"}, {"value": "qualified", "label": "Qualified", "color": "green"}, {"value": "unqualified", "label": "Unqualified", "color": "red"}, {"value": "converted", "label": "Converted", "color": "green"}], "default": "new"}'),
    (v_leads_table_id, 'score', 'number', '{"label": "Lead Score", "required": false, "min": 0, "max": 100, "default": 50}'),
    (v_leads_table_id, 'assigned_to', 'text', '{"label": "Assigned To", "required": false, "placeholder": "Sales Rep Name"}'),
    (v_leads_table_id, 'notes', 'textarea', '{"label": "Notes", "required": false, "placeholder": "Lead qualification notes"}'),
    (v_leads_table_id, 'created_date', 'date', '{"label": "Created Date", "required": false, "default": "now"}');

  -- Create Deals Table
  INSERT INTO "VirtualTableSchema" (
    "virtual_schema_id",
    "name",
    "description",
    "configs"
  ) VALUES (
    v_schema_id,
    'Deals',
    'Sales opportunities and deals pipeline',
    '{"icon": "dollar-sign", "color": "green", "permissions": {"create": true, "read": true, "update": true, "delete": true}}'
  ) RETURNING id INTO v_deals_table_id;

  INSERT INTO "VirtualFieldSchema" ("virtual_table_schema_id", "name", "type", "properties") VALUES
    (v_deals_table_id, 'name', 'text', '{"label": "Deal Name", "required": true, "placeholder": "Q4 Enterprise Deal"}'),
    (v_deals_table_id, 'contact_name', 'text', '{"label": "Contact Name", "required": false, "placeholder": "Reference to contact"}'),
    (v_deals_table_id, 'value', 'number', '{"label": "Deal Value", "required": true, "min": 0, "placeholder": "50000"}'),
    (v_deals_table_id, 'stage', 'dropdown', '{"label": "Deal Stage", "required": true, "options": [{"value": "lead", "label": "Lead", "color": "blue"}, {"value": "qualified", "label": "Qualified", "color": "purple"}, {"value": "proposal", "label": "Proposal", "color": "yellow"}, {"value": "negotiation", "label": "Negotiation", "color": "orange"}, {"value": "closed_won", "label": "Closed Won", "color": "green"}, {"value": "closed_lost", "label": "Closed Lost", "color": "red"}], "default": "lead"}'),
    (v_deals_table_id, 'probability', 'number', '{"label": "Win Probability (%)", "required": false, "min": 0, "max": 100, "default": 50}'),
    (v_deals_table_id, 'expected_close_date', 'date', '{"label": "Expected Close Date", "required": false}'),
    (v_deals_table_id, 'assigned_to', 'text', '{"label": "Assigned To", "required": false, "placeholder": "Sales Rep Name"}'),
    (v_deals_table_id, 'notes', 'textarea', '{"label": "Notes", "required": false, "placeholder": "Deal details and strategy"}'),
    (v_deals_table_id, 'created_date', 'date', '{"label": "Created Date", "required": false, "default": "now"}');

  -- Create Activities Table
  INSERT INTO "VirtualTableSchema" (
    "virtual_schema_id",
    "name",
    "description",
    "configs"
  ) VALUES (
    v_schema_id,
    'Activities',
    'Track all customer interactions and activities',
    '{"icon": "activity", "color": "purple", "permissions": {"create": true, "read": true, "update": true, "delete": true}}'
  ) RETURNING id INTO v_activities_table_id;

  INSERT INTO "VirtualFieldSchema" ("virtual_table_schema_id", "name", "type", "properties") VALUES
    (v_activities_table_id, 'type', 'dropdown', '{"label": "Activity Type", "required": true, "options": [{"value": "call", "label": "Phone Call", "color": "blue"}, {"value": "email", "label": "Email", "color": "purple"}, {"value": "meeting", "label": "Meeting", "color": "green"}, {"value": "note", "label": "Note", "color": "gray"}, {"value": "task", "label": "Task", "color": "orange"}], "default": "note"}'),
    (v_activities_table_id, 'related_to', 'text', '{"label": "Related To", "required": false, "placeholder": "Contact or Deal name"}'),
    (v_activities_table_id, 'description', 'textarea', '{"label": "Description", "required": true, "placeholder": "Activity details"}'),
    (v_activities_table_id, 'date', 'date', '{"label": "Date", "required": true, "default": "now"}'),
    (v_activities_table_id, 'assigned_to', 'text', '{"label": "Assigned To", "required": false, "placeholder": "Team member name"}'),
    (v_activities_table_id, 'status', 'dropdown', '{"label": "Status", "required": true, "options": [{"value": "planned", "label": "Planned", "color": "blue"}, {"value": "completed", "label": "Completed", "color": "green"}, {"value": "cancelled", "label": "Cancelled", "color": "red"}], "default": "completed"}');

  RAISE NOTICE 'CRM Database created! Schema ID: %, Tables: Contacts (%), Leads (%), Deals (%), Activities (%)', 
    v_schema_id, v_contacts_table_id, v_leads_table_id, v_deals_table_id, v_activities_table_id;

END $$;

-- ==================================
-- STEP 2: Forms (abbreviated version - you can add more fields if needed)
-- ==================================

-- Lead Capture Form
DO $$
DECLARE v_form_id INTEGER;
BEGIN
  INSERT INTO "Form" ("name", "description", "is_active", "configs")
  VALUES ('Lead Capture Form', 'Capture new sales leads', true, '{"theme": "default"}')
  RETURNING id INTO v_form_id;
  
  INSERT INTO "FormField" ("form_id", "type", "label", "position", "configs") VALUES
    (v_form_id, 'text', 'Full Name', 1, '{"required": true}'),
    (v_form_id, 'email', 'Email', 2, '{"required": true}'),
    (v_form_id, 'text', 'Company', 3, '{"required": false}');
    
  RAISE NOTICE 'Lead Capture Form created with ID: %', v_form_id;
END $$;

-- ==================================
-- STEP 3: Solution Template
-- ==================================

DO $$
DECLARE
  v_crm_solution_id INTEGER;
  v_crm_schema_id INTEGER;
  v_contacts_table_id INTEGER;
  v_leads_table_id INTEGER;
  v_deals_table_id INTEGER;
  v_activities_table_id INTEGER;
  v_canvas_config JSONB;
BEGIN

  -- Get IDs
  SELECT id INTO v_crm_schema_id FROM "VirtualSchema" 
  WHERE template_type = 'crm' AND is_template = true ORDER BY creation_date DESC LIMIT 1;

  SELECT id INTO v_contacts_table_id FROM "VirtualTableSchema" 
  WHERE virtual_schema_id = v_crm_schema_id AND name = 'Contacts';

  SELECT id INTO v_leads_table_id FROM "VirtualTableSchema" 
  WHERE virtual_schema_id = v_crm_schema_id AND name = 'Leads';

  SELECT id INTO v_deals_table_id FROM "VirtualTableSchema" 
  WHERE virtual_schema_id = v_crm_schema_id AND name = 'Deals';

  SELECT id INTO v_activities_table_id FROM "VirtualTableSchema" 
  WHERE virtual_schema_id = v_crm_schema_id AND name = 'Activities';

  -- Build canvas
  v_canvas_config := jsonb_build_array(
    jsonb_build_object('id', 'stat-contacts', 'type', 'stat-card', 'size', jsonb_build_object('width', 1, 'height', 1), 
      'config', jsonb_build_object('title', 'Total Contacts', 'tableId', v_contacts_table_id::text, 'icon', 'users')),
    jsonb_build_object('id', 'stat-leads', 'type', 'stat-card', 'size', jsonb_build_object('width', 1, 'height', 1),
      'config', jsonb_build_object('title', 'Active Leads', 'tableId', v_leads_table_id::text, 'icon', 'target')),
    jsonb_build_object('id', 'stat-deals', 'type', 'stat-card', 'size', jsonb_build_object('width', 1, 'height', 1),
      'config', jsonb_build_object('title', 'Open Deals', 'tableId', v_deals_table_id::text, 'icon', 'dollar-sign')),
    jsonb_build_object('id', 'stat-activities', 'type', 'stat-card', 'size', jsonb_build_object('width', 1, 'height', 1),
      'config', jsonb_build_object('title', 'Activities', 'tableId', v_activities_table_id::text, 'icon', 'activity')),
    jsonb_build_object('id', 'deals-kanban', 'type', 'kanban-board', 'size', jsonb_build_object('width', 4, 'height', 2),
      'config', jsonb_build_object('title', 'Deal Pipeline', 'tableId', v_deals_table_id::text, 'allowCreate', true)),
    jsonb_build_object('id', 'activities', 'type', 'activity-timeline', 'size', jsonb_build_object('width', 2, 'height', 2),
      'config', jsonb_build_object('title', 'Recent Activities', 'tableId', v_activities_table_id::text)),
    jsonb_build_object('id', 'contacts', 'type', 'contact-card-list', 'size', jsonb_build_object('width', 2, 'height', 2),
      'config', jsonb_build_object('title', 'Contacts', 'tableId', v_contacts_table_id::text))
  );

  -- Create Solution Template
  INSERT INTO "Solution" (
    "name", "description", "template_type", "is_template", "status", "icon", "color", "category", "configs"
  ) VALUES (
    'CRM - Sales Pipeline',
    'Complete CRM with contact management, lead tracking, and deal pipeline',
    'crm_sales',
    true,
    'active',
    'users',
    'bg-blue-500',
    'Sales & CRM',
    jsonb_build_object('features', jsonb_build_array('Contact Management', 'Lead Tracking', 'Deal Pipeline', 'Activity Timeline'), 
      'version', '1.0', 'canvas', v_canvas_config)
  ) RETURNING id INTO v_crm_solution_id;

  -- Link components
  INSERT INTO "SolutionComponent" ("solution_id", "component_type", "component_id", "configs")
  VALUES (v_crm_solution_id, 'virtual_schema', v_crm_schema_id, '{"display_order": 1}');

  RAISE NOTICE 'CRM Solution Template created with ID: %', v_crm_solution_id;

END $$;

-- ==================================
-- STEP 4: Fix RLS Policies
-- ==================================

DROP POLICY IF EXISTS "Users can view their own solutions and all templates" ON "Solution";
CREATE POLICY "Users can view their own solutions and all templates" ON "Solution"
  FOR SELECT USING (auth.uid()::text = user_id::text OR is_template = true);

DROP POLICY IF EXISTS "Users can view virtual schemas" ON "VirtualSchema";
CREATE POLICY "Users can view virtual schemas" ON "VirtualSchema"
  FOR SELECT USING (auth.uid()::text = user_id::text OR is_template = true);

-- ==================================
-- VERIFICATION
-- ==================================

SELECT 'CRM Setup Complete!' as status,
  (SELECT COUNT(*) FROM "VirtualSchema" WHERE template_type = 'crm') as schemas,
  (SELECT COUNT(*) FROM "Solution" WHERE template_type = 'crm_sales') as solutions;

