-- =====================================================
-- CRM Solution - Workflows Seed Script
-- =====================================================
-- This script creates sample workflows for CRM automation
-- including lead assignment and follow-up automation
--
-- Run this script after seed-crm-solution.sql
-- =====================================================

DO $$
DECLARE
  v_lead_assignment_workflow_id INTEGER;
  v_deal_notification_workflow_id INTEGER;
  v_crm_solution_id INTEGER;
  v_leads_table_id INTEGER;
  v_deals_table_id INTEGER;
  v_activities_table_id INTEGER;
BEGIN

  -- =====================================================
  -- 1. Get IDs of CRM tables
  -- =====================================================
  SELECT vts.id INTO v_leads_table_id
  FROM "VirtualTableSchema" vts
  JOIN "VirtualSchema" vs ON vts.virtual_schema_id = vs.id
  WHERE vs.template_type = 'crm' AND vs.is_template = true AND vts.name = 'Leads'
  ORDER BY vts.creation_date DESC
  LIMIT 1;

  SELECT vts.id INTO v_deals_table_id
  FROM "VirtualTableSchema" vts
  JOIN "VirtualSchema" vs ON vts.virtual_schema_id = vs.id
  WHERE vs.template_type = 'crm' AND vs.is_template = true AND vts.name = 'Deals'
  ORDER BY vts.creation_date DESC
  LIMIT 1;

  SELECT vts.id INTO v_activities_table_id
  FROM "VirtualTableSchema" vts
  JOIN "VirtualSchema" vs ON vts.virtual_schema_id = vs.id
  WHERE vs.template_type = 'crm' AND vs.is_template = true AND vts.name = 'Activities'
  ORDER BY vts.creation_date DESC
  LIMIT 1;

  -- Get CRM Solution ID
  SELECT id INTO v_crm_solution_id
  FROM "Solution"
  WHERE template_type = 'crm_sales' AND is_template = true
  ORDER BY creation_date DESC
  LIMIT 1;

  IF v_leads_table_id IS NULL THEN
    RAISE EXCEPTION 'CRM tables not found. Please run seed-crm-solution.sql first.';
  END IF;

  RAISE NOTICE 'Found CRM Tables:';
  RAISE NOTICE '  Leads Table ID: %', v_leads_table_id;
  RAISE NOTICE '  Deals Table ID: %', v_deals_table_id;
  RAISE NOTICE '  Activities Table ID: %', v_activities_table_id;

  -- =====================================================
  -- 2. Lead Assignment Workflow
  -- =====================================================
  INSERT INTO "Workflow" (
    "name",
    "description",
    "is_active",
    "configs"
  ) VALUES (
    'CRM: Lead Auto-Assignment',
    'Automatically assign new leads to sales representatives and create follow-up activities',
    true,
    jsonb_build_object(
      'trigger_type', 'business_data_insert',
      'trigger_table_id', v_leads_table_id,
      'description', 'Triggers when a new lead is created',
      'tags', jsonb_build_array('crm', 'leads', 'automation')
    )
  ) RETURNING id INTO v_lead_assignment_workflow_id;

  -- Step 1: Check Lead Score and Assign
  INSERT INTO "WorkflowStep" (
    "workflow_id",
    "type",
    "position",
    "configs"
  ) VALUES (
    v_lead_assignment_workflow_id,
    'condition',
    1,
    jsonb_build_object(
      'name', 'Check Lead Score',
      'condition', jsonb_build_object(
        'field', 'score',
        'operator', 'greater_than',
        'value', 70
      ),
      'description', 'Prioritize high-score leads'
    )
  );

  -- Step 2: Update Lead with Assignment
  INSERT INTO "WorkflowStep" (
    "workflow_id",
    "type",
    "position",
    "configs"
  ) VALUES (
    v_lead_assignment_workflow_id,
    'update_data',
    2,
    jsonb_build_object(
      'name', 'Assign to Sales Rep',
      'table_id', v_leads_table_id,
      'updates', jsonb_build_object(
        'assigned_to', 'Round Robin Assignment',
        'status', 'contacted'
      ),
      'description', 'Assign lead to available sales representative'
    )
  );

  -- Step 3: Send Email Notification
  INSERT INTO "WorkflowStep" (
    "workflow_id",
    "type",
    "position",
    "configs",
    "external_services"
  ) VALUES (
    v_lead_assignment_workflow_id,
    'send_email',
    3,
    jsonb_build_object(
      'name', 'Notify Sales Rep',
      'to', '{{assigned_to_email}}',
      'subject', 'New Lead Assigned: {{lead_name}}',
      'body', 'You have been assigned a new lead. Name: {{lead_name}}, Company: {{company}}, Score: {{score}}',
      'description', 'Send email notification to assigned sales rep'
    ),
    jsonb_build_object(
      'service', 'email',
      'provider', 'smtp'
    )
  );

  -- Step 4: Create Follow-up Activity
  INSERT INTO "WorkflowStep" (
    "workflow_id",
    "type",
    "position",
    "configs"
  ) VALUES (
    v_lead_assignment_workflow_id,
    'create_data',
    4,
    jsonb_build_object(
      'name', 'Schedule Follow-up',
      'table_id', v_activities_table_id,
      'data', jsonb_build_object(
        'type', 'task',
        'related_to', '{{lead_name}}',
        'description', 'Follow up with new lead - initial contact',
        'date', '{{tomorrow}}',
        'assigned_to', '{{assigned_to}}',
        'status', 'planned'
      ),
      'description', 'Create follow-up task for next day'
    )
  );

  RAISE NOTICE 'Lead Assignment Workflow created with ID: %', v_lead_assignment_workflow_id;

  -- =====================================================
  -- 3. Deal Stage Change Notification Workflow
  -- =====================================================
  INSERT INTO "Workflow" (
    "name",
    "description",
    "is_active",
    "configs"
  ) VALUES (
    'CRM: Deal Stage Notifications',
    'Send notifications when deals move to important stages',
    true,
    jsonb_build_object(
      'trigger_type', 'business_data_update',
      'trigger_table_id', v_deals_table_id,
      'trigger_field', 'stage',
      'description', 'Triggers when deal stage is updated',
      'tags', jsonb_build_array('crm', 'deals', 'notifications')
    )
  ) RETURNING id INTO v_deal_notification_workflow_id;

  -- Step 1: Check if Closed Won
  INSERT INTO "WorkflowStep" (
    "workflow_id",
    "type",
    "position",
    "configs"
  ) VALUES (
    v_deal_notification_workflow_id,
    'condition',
    1,
    jsonb_build_object(
      'name', 'Check if Won',
      'condition', jsonb_build_object(
        'field', 'stage',
        'operator', 'equals',
        'value', 'closed_won'
      ),
      'description', 'Check if deal was won'
    )
  );

  -- Step 2: Send Celebration Email
  INSERT INTO "WorkflowStep" (
    "workflow_id",
    "type",
    "position",
    "configs",
    "external_services"
  ) VALUES (
    v_deal_notification_workflow_id,
    'send_email',
    2,
    jsonb_build_object(
      'name', 'Celebrate Win',
      'to', '{{assigned_to_email}}, sales-team@company.com',
      'subject', '🎉 Deal Won: {{deal_name}} - ${{value}}',
      'body', 'Congratulations! {{assigned_to}} closed {{deal_name}} for ${{value}}!',
      'description', 'Celebrate deal closure with team'
    ),
    jsonb_build_object(
      'service', 'email',
      'provider', 'smtp'
    )
  );

  -- Step 3: Log Win Activity
  INSERT INTO "WorkflowStep" (
    "workflow_id",
    "type",
    "position",
    "configs"
  ) VALUES (
    v_deal_notification_workflow_id,
    'create_data',
    3,
    jsonb_build_object(
      'name', 'Log Win Activity',
      'table_id', v_activities_table_id,
      'data', jsonb_build_object(
        'type', 'note',
        'related_to', '{{deal_name}}',
        'description', 'Deal closed successfully! Value: ${{value}}',
        'date', '{{today}}',
        'assigned_to', '{{assigned_to}}',
        'status', 'completed'
      ),
      'description', 'Create activity log for won deal'
    )
  );

  RAISE NOTICE 'Deal Notification Workflow created with ID: %', v_deal_notification_workflow_id;

  -- =====================================================
  -- 4. Link Workflows to CRM Solution
  -- =====================================================
  IF v_crm_solution_id IS NOT NULL THEN
    INSERT INTO "SolutionComponent" (
      "solution_id",
      "component_type",
      "component_id",
      "configs"
    ) VALUES
      (
        v_crm_solution_id,
        'workflow',
        v_lead_assignment_workflow_id,
        '{"display_order": 6, "name": "Lead Auto-Assignment"}'
      ),
      (
        v_crm_solution_id,
        'workflow',
        v_deal_notification_workflow_id,
        '{"display_order": 7, "name": "Deal Stage Notifications"}'
      );
    
    RAISE NOTICE 'Workflows linked to CRM Solution';
  END IF;

  -- =====================================================
  -- Summary
  -- =====================================================
  RAISE NOTICE '================================================';
  RAISE NOTICE 'CRM Workflows created successfully!';
  RAISE NOTICE '================================================';
  RAISE NOTICE 'Lead Assignment Workflow ID: %', v_lead_assignment_workflow_id;
  RAISE NOTICE 'Deal Notification Workflow ID: %', v_deal_notification_workflow_id;
  RAISE NOTICE '================================================';
  RAISE NOTICE 'Workflow Features:';
  RAISE NOTICE '  1. Auto-assign new leads to sales reps';
  RAISE NOTICE '  2. Create follow-up activities';
  RAISE NOTICE '  3. Send email notifications';
  RAISE NOTICE '  4. Celebrate deal wins with team';
  RAISE NOTICE '  5. Log important activities';
  RAISE NOTICE '================================================';
  RAISE NOTICE 'Note: These workflows are templates and may need';
  RAISE NOTICE 'configuration for your specific email setup.';
  RAISE NOTICE '================================================';

END $$;

-- =====================================================
-- Verification Query
-- =====================================================
-- Run this to verify workflows were created
SELECT 
  w.id,
  w.name,
  w.description,
  w.is_active,
  COUNT(ws.id) as step_count
FROM "Workflow" w
LEFT JOIN "WorkflowStep" ws ON w.id = ws.workflow_id
WHERE w.name LIKE 'CRM:%'
GROUP BY w.id, w.name, w.description, w.is_active
ORDER BY w.id;

-- View workflow steps
SELECT 
  w.name as workflow_name,
  ws.position,
  ws.type,
  ws.configs->>'name' as step_name,
  ws.configs->>'description' as step_description
FROM "Workflow" w
JOIN "WorkflowStep" ws ON w.id = ws.workflow_id
WHERE w.name LIKE 'CRM:%'
ORDER BY w.name, ws.position;

