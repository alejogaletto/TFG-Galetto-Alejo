-- =====================================================
-- Fix CRM Canvas Configuration for Solution 22
-- =====================================================
-- Replace Kanban Board with Data Table
-- User: 7b9effee-7ae8-455b-8096-ec81390518a2
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

  -- Get table IDs for this solution
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

  -- Build new canvas configuration
  v_canvas_config := jsonb_build_array(
    -- Row 1: Stat Cards (4 cards)
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
    
    -- Row 2: Deals Data Table (full width) - REPLACED KANBAN
    jsonb_build_object(
      'id', 'deals-table',
      'type', 'data-table',
      'size', jsonb_build_object('width', 4, 'height', 2),
      'config', jsonb_build_object(
        'title', 'Deal Pipeline',
        'tableId', v_deals_table_id::text,
        'dataSource', 'table-' || v_deals_table_id::text,
        'allowCreate', true,
        'allowEdit', true,
        'allowDelete', true,
        'pagination', true,
        'columnConfigs', jsonb_build_array(
          jsonb_build_object('field', 'name', 'label', 'Deal Name', 'visible', true, 'editable', true, 'type', 'text'),
          jsonb_build_object('field', 'value', 'label', 'Value ($)', 'visible', true, 'editable', true, 'type', 'number'),
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
          jsonb_build_object('field', 'probability', 'label', 'Probability %', 'visible', true, 'editable', true, 'type', 'number'),
          jsonb_build_object('field', 'contact_name', 'label', 'Contact', 'visible', true, 'editable', true, 'type', 'text'),
          jsonb_build_object('field', 'expected_close_date', 'label', 'Expected Close', 'visible', true, 'editable', true, 'type', 'date'),
          jsonb_build_object('field', 'assigned_to', 'label', 'Assigned To', 'visible', true, 'editable', true, 'type', 'text')
        )
      )
    ),
    
    -- Row 3: Activity Timeline (left, 2 columns)
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
    
    -- Row 3: Contact List (right, 2 columns)
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

  -- Update the solution's canvas configuration
  UPDATE "Solution"
  SET configs = jsonb_set(
    COALESCE(configs, '{}'::jsonb),
    '{canvas}',
    v_canvas_config
  ),
  modification_date = CURRENT_TIMESTAMP
  WHERE id = v_solution_id;

  RAISE NOTICE 'Canvas configuration updated for solution %', v_solution_id;
  RAISE NOTICE 'Deals Table ID: %', v_deals_table_id;
  RAISE NOTICE 'Contacts Table ID: %', v_contacts_table_id;
  RAISE NOTICE 'Leads Table ID: %', v_leads_table_id;
  RAISE NOTICE 'Activities Table ID: %', v_activities_table_id;

END $$;

-- Verify the update
SELECT 
  id,
  name,
  jsonb_array_length(configs->'canvas') as canvas_components_count
FROM "Solution"
WHERE id = 22;

