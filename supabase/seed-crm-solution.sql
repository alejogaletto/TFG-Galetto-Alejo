-- =====================================================
-- CRM Solution - Database Structure Seed Script
-- =====================================================
-- This script creates the complete database structure for a CRM solution
-- including VirtualSchema, VirtualTableSchemas, and VirtualFieldSchemas
--
-- Run this script to set up the CRM database foundation
-- =====================================================

-- Clean up existing CRM data (optional - comment out if you want to keep existing data)
-- DELETE FROM "VirtualFieldSchema" WHERE "virtual_table_schema_id" IN (
--   SELECT id FROM "VirtualTableSchema" WHERE "virtual_schema_id" IN (
--     SELECT id FROM "VirtualSchema" WHERE "template_type" = 'crm'
--   )
-- );
-- DELETE FROM "VirtualTableSchema" WHERE "virtual_schema_id" IN (
--   SELECT id FROM "VirtualSchema" WHERE "template_type" = 'crm'
-- );
-- DELETE FROM "VirtualSchema" WHERE "template_type" = 'crm';

-- =====================================================
-- 1. Create CRM Virtual Schema (Template)
-- =====================================================
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
) RETURNING id AS crm_schema_id;

-- Get the ID of the created schema for reference
-- Note: In production, you'll need to get this ID and use it in subsequent inserts
-- For this script, we'll use a variable approach

DO $$
DECLARE
  v_schema_id INTEGER;
  v_contacts_table_id INTEGER;
  v_leads_table_id INTEGER;
  v_deals_table_id INTEGER;
  v_activities_table_id INTEGER;
BEGIN

  -- Get the CRM schema ID
  SELECT id INTO v_schema_id 
  FROM "VirtualSchema" 
  WHERE "template_type" = 'crm' AND "is_template" = true 
  ORDER BY "creation_date" DESC 
  LIMIT 1;

  -- =====================================================
  -- 2. Create Contacts Table Schema
  -- =====================================================
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

  -- Contacts Table Fields
  INSERT INTO "VirtualFieldSchema" ("virtual_table_schema_id", "name", "type", "properties") VALUES
    (v_contacts_table_id, 'name', 'text', '{"label": "Full Name", "required": true, "placeholder": "John Doe"}'),
    (v_contacts_table_id, 'email', 'email', '{"label": "Email Address", "required": true, "placeholder": "john@company.com"}'),
    (v_contacts_table_id, 'phone', 'text', '{"label": "Phone Number", "required": false, "placeholder": "+1 234 567 8900"}'),
    (v_contacts_table_id, 'company', 'text', '{"label": "Company", "required": false, "placeholder": "Acme Corp"}'),
    (v_contacts_table_id, 'status', 'dropdown', '{"label": "Status", "required": true, "options": [
      {"value": "active", "label": "Active", "color": "green"},
      {"value": "inactive", "label": "Inactive", "color": "gray"},
      {"value": "prospect", "label": "Prospect", "color": "blue"}
    ], "default": "prospect"}'),
    (v_contacts_table_id, 'assigned_to', 'text', '{"label": "Assigned To", "required": false, "placeholder": "Sales Rep Name"}'),
    (v_contacts_table_id, 'tags', 'text', '{"label": "Tags", "required": false, "placeholder": "VIP, Partner, etc."}'),
    (v_contacts_table_id, 'notes', 'textarea', '{"label": "Notes", "required": false, "placeholder": "Additional information about this contact"}'),
    (v_contacts_table_id, 'created_date', 'date', '{"label": "Created Date", "required": false, "default": "now"}');

  -- =====================================================
  -- 3. Create Leads Table Schema
  -- =====================================================
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

  -- Leads Table Fields
  INSERT INTO "VirtualFieldSchema" ("virtual_table_schema_id", "name", "type", "properties") VALUES
    (v_leads_table_id, 'name', 'text', '{"label": "Lead Name", "required": true, "placeholder": "Jane Smith"}'),
    (v_leads_table_id, 'email', 'email', '{"label": "Email Address", "required": true, "placeholder": "jane@company.com"}'),
    (v_leads_table_id, 'phone', 'text', '{"label": "Phone Number", "required": false, "placeholder": "+1 234 567 8900"}'),
    (v_leads_table_id, 'company', 'text', '{"label": "Company", "required": false, "placeholder": "Tech Startup Inc"}'),
    (v_leads_table_id, 'source', 'dropdown', '{"label": "Lead Source", "required": true, "options": [
      {"value": "website", "label": "Website", "color": "blue"},
      {"value": "referral", "label": "Referral", "color": "green"},
      {"value": "social", "label": "Social Media", "color": "purple"},
      {"value": "event", "label": "Event", "color": "orange"},
      {"value": "cold_call", "label": "Cold Call", "color": "gray"},
      {"value": "other", "label": "Other", "color": "gray"}
    ], "default": "website"}'),
    (v_leads_table_id, 'status', 'dropdown', '{"label": "Lead Status", "required": true, "options": [
      {"value": "new", "label": "New", "color": "blue"},
      {"value": "contacted", "label": "Contacted", "color": "yellow"},
      {"value": "qualified", "label": "Qualified", "color": "green"},
      {"value": "unqualified", "label": "Unqualified", "color": "red"},
      {"value": "converted", "label": "Converted", "color": "green"}
    ], "default": "new"}'),
    (v_leads_table_id, 'score', 'number', '{"label": "Lead Score", "required": false, "min": 0, "max": 100, "default": 50}'),
    (v_leads_table_id, 'assigned_to', 'text', '{"label": "Assigned To", "required": false, "placeholder": "Sales Rep Name"}'),
    (v_leads_table_id, 'notes', 'textarea', '{"label": "Notes", "required": false, "placeholder": "Lead qualification notes"}'),
    (v_leads_table_id, 'created_date', 'date', '{"label": "Created Date", "required": false, "default": "now"}');

  -- =====================================================
  -- 4. Create Deals Table Schema
  -- =====================================================
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

  -- Deals Table Fields
  INSERT INTO "VirtualFieldSchema" ("virtual_table_schema_id", "name", "type", "properties") VALUES
    (v_deals_table_id, 'name', 'text', '{"label": "Deal Name", "required": true, "placeholder": "Q4 Enterprise Deal"}'),
    (v_deals_table_id, 'contact_name', 'text', '{"label": "Contact Name", "required": false, "placeholder": "Reference to contact"}'),
    (v_deals_table_id, 'value', 'number', '{"label": "Deal Value", "required": true, "min": 0, "placeholder": "50000"}'),
    (v_deals_table_id, 'stage', 'dropdown', '{"label": "Deal Stage", "required": true, "options": [
      {"value": "lead", "label": "Lead", "color": "blue"},
      {"value": "qualified", "label": "Qualified", "color": "purple"},
      {"value": "proposal", "label": "Proposal", "color": "yellow"},
      {"value": "negotiation", "label": "Negotiation", "color": "orange"},
      {"value": "closed_won", "label": "Closed Won", "color": "green"},
      {"value": "closed_lost", "label": "Closed Lost", "color": "red"}
    ], "default": "lead"}'),
    (v_deals_table_id, 'probability', 'number', '{"label": "Win Probability (%)", "required": false, "min": 0, "max": 100, "default": 50}'),
    (v_deals_table_id, 'expected_close_date', 'date', '{"label": "Expected Close Date", "required": false}'),
    (v_deals_table_id, 'assigned_to', 'text', '{"label": "Assigned To", "required": false, "placeholder": "Sales Rep Name"}'),
    (v_deals_table_id, 'notes', 'textarea', '{"label": "Notes", "required": false, "placeholder": "Deal details and strategy"}'),
    (v_deals_table_id, 'created_date', 'date', '{"label": "Created Date", "required": false, "default": "now"}');

  -- =====================================================
  -- 5. Create Activities Table Schema
  -- =====================================================
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

  -- Activities Table Fields
  INSERT INTO "VirtualFieldSchema" ("virtual_table_schema_id", "name", "type", "properties") VALUES
    (v_activities_table_id, 'type', 'dropdown', '{"label": "Activity Type", "required": true, "options": [
      {"value": "call", "label": "Phone Call", "color": "blue"},
      {"value": "email", "label": "Email", "color": "purple"},
      {"value": "meeting", "label": "Meeting", "color": "green"},
      {"value": "note", "label": "Note", "color": "gray"},
      {"value": "task", "label": "Task", "color": "orange"}
    ], "default": "note"}'),
    (v_activities_table_id, 'related_to', 'text', '{"label": "Related To", "required": false, "placeholder": "Contact or Deal name"}'),
    (v_activities_table_id, 'description', 'textarea', '{"label": "Description", "required": true, "placeholder": "Activity details"}'),
    (v_activities_table_id, 'date', 'date', '{"label": "Date", "required": true, "default": "now"}'),
    (v_activities_table_id, 'assigned_to', 'text', '{"label": "Assigned To", "required": false, "placeholder": "Team member name"}'),
    (v_activities_table_id, 'status', 'dropdown', '{"label": "Status", "required": true, "options": [
      {"value": "planned", "label": "Planned", "color": "blue"},
      {"value": "completed", "label": "Completed", "color": "green"},
      {"value": "cancelled", "label": "Cancelled", "color": "red"}
    ], "default": "completed"}');

  RAISE NOTICE 'CRM Database structure created successfully!';
  RAISE NOTICE 'Schema ID: %', v_schema_id;
  RAISE NOTICE 'Contacts Table ID: %', v_contacts_table_id;
  RAISE NOTICE 'Leads Table ID: %', v_leads_table_id;
  RAISE NOTICE 'Deals Table ID: %', v_deals_table_id;
  RAISE NOTICE 'Activities Table ID: %', v_activities_table_id;

END $$;

-- =====================================================
-- Verification Query
-- =====================================================
-- Run this to verify the structure was created correctly
SELECT 
  vs.name as schema_name,
  vts.name as table_name,
  COUNT(vfs.id) as field_count
FROM "VirtualSchema" vs
JOIN "VirtualTableSchema" vts ON vs.id = vts.virtual_schema_id
LEFT JOIN "VirtualFieldSchema" vfs ON vts.id = vfs.virtual_table_schema_id
WHERE vs.template_type = 'crm' AND vs.is_template = true
GROUP BY vs.name, vts.name
ORDER BY vts.name;

