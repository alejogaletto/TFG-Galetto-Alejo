-- =====================================================
-- CRM Sample Data for User
-- =====================================================
-- Creates realistic dummy data for CRM showcase
-- User: 7b9effee-7ae8-455b-8096-ec81390518a2
-- =====================================================

DO $$
DECLARE
  v_user_id TEXT := '7b9effee-7ae8-455b-8096-ec81390518a2';
  v_contacts_table_id INTEGER;
  v_leads_table_id INTEGER;
  v_deals_table_id INTEGER;
  v_activities_table_id INTEGER;
BEGIN

  -- Get table IDs
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

  RAISE NOTICE 'Found table IDs - Contacts: %, Leads: %, Deals: %, Activities: %', 
    v_contacts_table_id, v_leads_table_id, v_deals_table_id, v_activities_table_id;

  -- =====================================================
  -- 1. CONTACTS (10 sample contacts)
  -- =====================================================
  
  INSERT INTO "BusinessData" (user_id, virtual_table_schema_id, data_json, creation_date) VALUES
    (v_user_id, v_contacts_table_id, jsonb_build_object(
      'name', 'John Anderson',
      'email', 'john.anderson@techcorp.com',
      'phone', '+1 555-0101',
      'company', 'TechCorp Solutions',
      'status', 'active',
      'assigned_to', 'Sarah Johnson',
      'tags', 'Enterprise, VIP',
      'notes', 'Key decision maker at TechCorp. Very interested in our enterprise package.',
      'created_date', (CURRENT_DATE - INTERVAL '45 days')::text
    ), CURRENT_DATE - INTERVAL '45 days'),

    (v_user_id, v_contacts_table_id, jsonb_build_object(
      'name', 'Maria Garcia',
      'email', 'maria.garcia@innovatech.io',
      'phone', '+1 555-0102',
      'company', 'InnovaTech',
      'status', 'active',
      'assigned_to', 'Michael Chen',
      'tags', 'Startup, Tech',
      'notes', 'CTO at fast-growing startup. Looking for scalable solutions.',
      'created_date', (CURRENT_DATE - INTERVAL '30 days')::text
    ), CURRENT_DATE - INTERVAL '30 days'),

    (v_user_id, v_contacts_table_id, jsonb_build_object(
      'name', 'David Williams',
      'email', 'dwilliams@globalinc.com',
      'phone', '+1 555-0103',
      'company', 'Global Inc',
      'status', 'active',
      'assigned_to', 'Sarah Johnson',
      'tags', 'Enterprise',
      'notes', 'VP of Operations. Needs multi-location support.',
      'created_date', (CURRENT_DATE - INTERVAL '20 days')::text
    ), CURRENT_DATE - INTERVAL '20 days'),

    (v_user_id, v_contacts_table_id, jsonb_build_object(
      'name', 'Lisa Chen',
      'email', 'lisa.chen@startupxyz.com',
      'phone', '+1 555-0104',
      'company', 'StartupXYZ',
      'status', 'prospect',
      'assigned_to', 'Michael Chen',
      'tags', 'Startup',
      'notes', 'Recently funded Series A. Exploring options.',
      'created_date', (CURRENT_DATE - INTERVAL '15 days')::text
    ), CURRENT_DATE - INTERVAL '15 days'),

    (v_user_id, v_contacts_table_id, jsonb_build_object(
      'name', 'Robert Taylor',
      'email', 'robert.t@acmecorp.com',
      'phone', '+1 555-0105',
      'company', 'Acme Corporation',
      'status', 'active',
      'assigned_to', 'Sarah Johnson',
      'tags', 'Partner, VIP',
      'notes', 'Long-term partner. Always looking for new features.',
      'created_date', (CURRENT_DATE - INTERVAL '60 days')::text
    ), CURRENT_DATE - INTERVAL '60 days'),

    (v_user_id, v_contacts_table_id, jsonb_build_object(
      'name', 'Emily Rodriguez',
      'email', 'emily.r@digitalwave.com',
      'phone', '+1 555-0106',
      'company', 'Digital Wave',
      'status', 'active',
      'assigned_to', 'Michael Chen',
      'tags', 'Tech, Mid-Market',
      'notes', 'Director of IT. Evaluating multiple vendors.',
      'created_date', (CURRENT_DATE - INTERVAL '12 days')::text
    ), CURRENT_DATE - INTERVAL '12 days'),

    (v_user_id, v_contacts_table_id, jsonb_build_object(
      'name', 'James Wilson',
      'email', 'jwilson@bluesky.com',
      'phone', '+1 555-0107',
      'company', 'Blue Sky Ventures',
      'status', 'prospect',
      'assigned_to', 'Sarah Johnson',
      'tags', 'Startup, Early Stage',
      'notes', 'Pre-seed startup. Price sensitive.',
      'created_date', (CURRENT_DATE - INTERVAL '5 days')::text
    ), CURRENT_DATE - INTERVAL '5 days'),

    (v_user_id, v_contacts_table_id, jsonb_build_object(
      'name', 'Sophia Martinez',
      'email', 'sophia.m@greenleaf.org',
      'phone', '+1 555-0108',
      'company', 'Greenleaf Energy',
      'status', 'active',
      'assigned_to', 'Michael Chen',
      'tags', 'Sustainability, Mid-Market',
      'notes', 'Operations Manager. Needs eco-friendly solutions.',
      'created_date', (CURRENT_DATE - INTERVAL '25 days')::text
    ), CURRENT_DATE - INTERVAL '25 days'),

    (v_user_id, v_contacts_table_id, jsonb_build_object(
      'name', 'Michael Brown',
      'email', 'mbrown@techsolutions.co',
      'phone', '+1 555-0109',
      'company', 'Tech Solutions Co',
      'status', 'inactive',
      'assigned_to', 'Sarah Johnson',
      'tags', 'On Hold',
      'notes', 'Put project on hold due to budget constraints. Follow up in Q2.',
      'created_date', (CURRENT_DATE - INTERVAL '90 days')::text
    ), CURRENT_DATE - INTERVAL '90 days'),

    (v_user_id, v_contacts_table_id, jsonb_build_object(
      'name', 'Jennifer Lee',
      'email', 'jennifer.lee@futuretech.io',
      'phone', '+1 555-0110',
      'company', 'FutureTech',
      'status', 'active',
      'assigned_to', 'Michael Chen',
      'tags', 'AI, Tech, Enterprise',
      'notes', 'CEO of AI startup. Very tech-savvy. Needs advanced features.',
      'created_date', (CURRENT_DATE - INTERVAL '8 days')::text
    ), CURRENT_DATE - INTERVAL '8 days');

  RAISE NOTICE 'Created 10 contacts';

  -- =====================================================
  -- 2. LEADS (8 sample leads)
  -- =====================================================
  
  INSERT INTO "BusinessData" (user_id, virtual_table_schema_id, data_json, creation_date) VALUES
    (v_user_id, v_leads_table_id, jsonb_build_object(
      'name', 'Alex Thompson',
      'email', 'alex.thompson@newventure.com',
      'phone', '+1 555-0201',
      'company', 'New Venture Inc',
      'source', 'website',
      'status', 'new',
      'score', 75,
      'assigned_to', 'Sarah Johnson',
      'notes', 'Downloaded whitepaper. High interest level.',
      'created_date', (CURRENT_DATE - INTERVAL '2 days')::text
    ), CURRENT_DATE - INTERVAL '2 days'),

    (v_user_id, v_leads_table_id, jsonb_build_object(
      'name', 'Patricia Davis',
      'email', 'patricia.d@cloudnine.com',
      'phone', '+1 555-0202',
      'company', 'Cloud Nine Systems',
      'source', 'referral',
      'status', 'contacted',
      'score', 85,
      'assigned_to', 'Michael Chen',
      'notes', 'Referred by existing customer. Had initial call, very interested.',
      'created_date', (CURRENT_DATE - INTERVAL '5 days')::text
    ), CURRENT_DATE - INTERVAL '5 days'),

    (v_user_id, v_leads_table_id, jsonb_build_object(
      'name', 'Carlos Mendez',
      'email', 'carlos.m@dataflow.io',
      'phone', '+1 555-0203',
      'company', 'DataFlow Analytics',
      'source', 'social',
      'status', 'qualified',
      'score', 90,
      'assigned_to', 'Sarah Johnson',
      'notes', 'Met at conference. Budget approved. Ready to move forward.',
      'created_date', (CURRENT_DATE - INTERVAL '10 days')::text
    ), CURRENT_DATE - INTERVAL '10 days'),

    (v_user_id, v_leads_table_id, jsonb_build_object(
      'name', 'Amanda White',
      'email', 'amanda.white@growth.co',
      'phone', '+1 555-0204',
      'company', 'Growth Partners',
      'source', 'event',
      'status', 'contacted',
      'score', 65,
      'assigned_to', 'Michael Chen',
      'notes', 'Met at trade show. Interested but needs more info.',
      'created_date', (CURRENT_DATE - INTERVAL '3 days')::text
    ), CURRENT_DATE - INTERVAL '3 days'),

    (v_user_id, v_leads_table_id, jsonb_build_object(
      'name', 'Thomas Anderson',
      'email', 'tanderson@innovate.com',
      'phone', '+1 555-0205',
      'company', 'Innovate Labs',
      'source', 'website',
      'status', 'new',
      'score', 60,
      'assigned_to', 'Sarah Johnson',
      'notes', 'Filled out contact form. Waiting for follow-up.',
      'created_date', (CURRENT_DATE - INTERVAL '1 day')::text
    ), CURRENT_DATE - INTERVAL '1 day'),

    (v_user_id, v_leads_table_id, jsonb_build_object(
      'name', 'Rachel Green',
      'email', 'rachel.g@smartsys.com',
      'phone', '+1 555-0206',
      'company', 'Smart Systems',
      'source', 'referral',
      'status', 'qualified',
      'score', 88,
      'assigned_to', 'Michael Chen',
      'notes', 'Strong referral from partner. Ready for demo.',
      'created_date', (CURRENT_DATE - INTERVAL '7 days')::text
    ), CURRENT_DATE - INTERVAL '7 days'),

    (v_user_id, v_leads_table_id, jsonb_build_object(
      'name', 'Kevin Park',
      'email', 'kevin.park@nextstep.io',
      'phone', '+1 555-0207',
      'company', 'NextStep Technologies',
      'source', 'cold_call',
      'status', 'unqualified',
      'score', 30,
      'assigned_to', 'Sarah Johnson',
      'notes', 'Not a good fit for our product. Too early stage.',
      'created_date', (CURRENT_DATE - INTERVAL '14 days')::text
    ), CURRENT_DATE - INTERVAL '14 days'),

    (v_user_id, v_leads_table_id, jsonb_build_object(
      'name', 'Michelle Kim',
      'email', 'michelle.kim@pioneer.com',
      'phone', '+1 555-0208',
      'company', 'Pioneer Enterprises',
      'source', 'event',
      'status', 'contacted',
      'score', 78,
      'assigned_to', 'Michael Chen',
      'notes', 'VP of Sales. Very engaged. Scheduling demo next week.',
      'created_date', (CURRENT_DATE - INTERVAL '4 days')::text
    ), CURRENT_DATE - INTERVAL '4 days');

  RAISE NOTICE 'Created 8 leads';

  -- =====================================================
  -- 3. DEALS (10 sample deals)
  -- =====================================================
  
  INSERT INTO "BusinessData" (user_id, virtual_table_schema_id, data_json, creation_date) VALUES
    (v_user_id, v_deals_table_id, jsonb_build_object(
      'name', 'TechCorp Enterprise Deal',
      'contact_name', 'John Anderson',
      'value', 85000,
      'stage', 'proposal',
      'probability', 70,
      'expected_close_date', (CURRENT_DATE + INTERVAL '15 days')::text,
      'assigned_to', 'Sarah Johnson',
      'notes', 'Large enterprise deal. Proposal submitted. Waiting for board approval.',
      'created_date', (CURRENT_DATE - INTERVAL '20 days')::text
    ), CURRENT_DATE - INTERVAL '20 days'),

    (v_user_id, v_deals_table_id, jsonb_build_object(
      'name', 'InnovaTech Starter Package',
      'contact_name', 'Maria Garcia',
      'value', 12000,
      'stage', 'negotiation',
      'probability', 85,
      'expected_close_date', (CURRENT_DATE + INTERVAL '7 days')::text,
      'assigned_to', 'Michael Chen',
      'notes', 'Negotiating final terms. Should close soon.',
      'created_date', (CURRENT_DATE - INTERVAL '15 days')::text
    ), CURRENT_DATE - INTERVAL '15 days'),

    (v_user_id, v_deals_table_id, jsonb_build_object(
      'name', 'Global Inc Multi-Year Contract',
      'contact_name', 'David Williams',
      'value', 250000,
      'stage', 'qualified',
      'probability', 60,
      'expected_close_date', (CURRENT_DATE + INTERVAL '45 days')::text,
      'assigned_to', 'Sarah Johnson',
      'notes', 'Huge opportunity. Need to involve executive team.',
      'created_date', (CURRENT_DATE - INTERVAL '10 days')::text
    ), CURRENT_DATE - INTERVAL '10 days'),

    (v_user_id, v_deals_table_id, jsonb_build_object(
      'name', 'Digital Wave IT Solution',
      'contact_name', 'Emily Rodriguez',
      'value', 45000,
      'stage', 'proposal',
      'probability', 65,
      'expected_close_date', (CURRENT_DATE + INTERVAL '20 days')::text,
      'assigned_to', 'Michael Chen',
      'notes', 'Competing with two other vendors. Price is key factor.',
      'created_date', (CURRENT_DATE - INTERVAL '12 days')::text
    ), CURRENT_DATE - INTERVAL '12 days'),

    (v_user_id, v_deals_table_id, jsonb_build_object(
      'name', 'Acme Corp Expansion',
      'contact_name', 'Robert Taylor',
      'value', 35000,
      'stage', 'closed_won',
      'probability', 100,
      'expected_close_date', (CURRENT_DATE - INTERVAL '5 days')::text,
      'assigned_to', 'Sarah Johnson',
      'notes', 'Existing customer expansion. Closed successfully!',
      'created_date', (CURRENT_DATE - INTERVAL '30 days')::text
    ), CURRENT_DATE - INTERVAL '30 days'),

    (v_user_id, v_deals_table_id, jsonb_build_object(
      'name', 'FutureTech AI Integration',
      'contact_name', 'Jennifer Lee',
      'value', 120000,
      'stage', 'negotiation',
      'probability', 80,
      'expected_close_date', (CURRENT_DATE + INTERVAL '10 days')::text,
      'assigned_to', 'Michael Chen',
      'notes', 'Advanced integration project. Custom pricing nearly finalized.',
      'created_date', (CURRENT_DATE - INTERVAL '8 days')::text
    ), CURRENT_DATE - INTERVAL '8 days'),

    (v_user_id, v_deals_table_id, jsonb_build_object(
      'name', 'DataFlow Analytics Platform',
      'contact_name', 'Carlos Mendez',
      'value', 67000,
      'stage', 'proposal',
      'probability', 75,
      'expected_close_date', (CURRENT_DATE + INTERVAL '12 days')::text,
      'assigned_to', 'Sarah Johnson',
      'notes', 'Strong interest. Demo went very well. Proposal under review.',
      'created_date', (CURRENT_DATE - INTERVAL '10 days')::text
    ), CURRENT_DATE - INTERVAL '10 days'),

    (v_user_id, v_deals_table_id, jsonb_build_object(
      'name', 'Smart Systems Upgrade',
      'contact_name', 'Rachel Green',
      'value', 28000,
      'stage', 'qualified',
      'probability', 70,
      'expected_close_date', (CURRENT_DATE + INTERVAL '25 days')::text,
      'assigned_to', 'Michael Chen',
      'notes', 'Upgrade from legacy system. Need technical discovery call.',
      'created_date', (CURRENT_DATE - INTERVAL '7 days')::text
    ), CURRENT_DATE - INTERVAL '7 days'),

    (v_user_id, v_deals_table_id, jsonb_build_object(
      'name', 'Greenleaf Energy Solution',
      'contact_name', 'Sophia Martinez',
      'value', 18000,
      'stage', 'lead',
      'probability', 40,
      'expected_close_date', (CURRENT_DATE + INTERVAL '40 days')::text,
      'assigned_to', 'Michael Chen',
      'notes', 'Initial interest. Need to qualify budget and timeline.',
      'created_date', (CURRENT_DATE - INTERVAL '5 days')::text
    ), CURRENT_DATE - INTERVAL '5 days'),

    (v_user_id, v_deals_table_id, jsonb_build_object(
      'name', 'Blue Sky Ventures Startup Pack',
      'contact_name', 'James Wilson',
      'value', 8500,
      'stage', 'closed_lost',
      'probability', 0,
      'expected_close_date', (CURRENT_DATE - INTERVAL '2 days')::text,
      'assigned_to', 'Sarah Johnson',
      'notes', 'Lost to competitor. Price was too high for early-stage startup.',
      'created_date', (CURRENT_DATE - INTERVAL '20 days')::text
    ), CURRENT_DATE - INTERVAL '20 days');

  RAISE NOTICE 'Created 10 deals';

  -- =====================================================
  -- 4. ACTIVITIES (15 sample activities)
  -- =====================================================
  
  INSERT INTO "BusinessData" (user_id, virtual_table_schema_id, data_json, creation_date) VALUES
    (v_user_id, v_activities_table_id, jsonb_build_object(
      'type', 'call',
      'related_to', 'TechCorp Enterprise Deal',
      'description', 'Follow-up call with John Anderson. Discussed implementation timeline and custom requirements.',
      'date', CURRENT_DATE::text,
      'assigned_to', 'Sarah Johnson',
      'status', 'completed'
    ), CURRENT_DATE),

    (v_user_id, v_activities_table_id, jsonb_build_object(
      'type', 'email',
      'related_to', 'Maria Garcia - InnovaTech',
      'description', 'Sent contract for review. Included pricing breakdown and implementation schedule.',
      'date', CURRENT_DATE::text,
      'assigned_to', 'Michael Chen',
      'status', 'completed'
    ), CURRENT_DATE),

    (v_user_id, v_activities_table_id, jsonb_build_object(
      'type', 'meeting',
      'related_to', 'Global Inc Multi-Year Contract',
      'description', 'Demo meeting with David Williams and his team. Showcased enterprise features.',
      'date', (CURRENT_DATE - INTERVAL '1 day')::text,
      'assigned_to', 'Sarah Johnson',
      'status', 'completed'
    ), CURRENT_DATE - INTERVAL '1 day'),

    (v_user_id, v_activities_table_id, jsonb_build_object(
      'type', 'task',
      'related_to', 'DataFlow Analytics',
      'description', 'Prepare custom proposal with analytics integration details.',
      'date', (CURRENT_DATE + INTERVAL '1 day')::text,
      'assigned_to', 'Sarah Johnson',
      'status', 'planned'
    ), CURRENT_DATE),

    (v_user_id, v_activities_table_id, jsonb_build_object(
      'type', 'call',
      'related_to', 'Emily Rodriguez - Digital Wave',
      'description', 'Discovery call to understand technical requirements and integration needs.',
      'date', (CURRENT_DATE - INTERVAL '2 days')::text,
      'assigned_to', 'Michael Chen',
      'status', 'completed'
    ), CURRENT_DATE - INTERVAL '2 days'),

    (v_user_id, v_activities_table_id, jsonb_build_object(
      'type', 'note',
      'related_to', 'Acme Corp Expansion',
      'description', 'Deal closed! Customer very happy with the solution. Excellent opportunity for referrals.',
      'date', (CURRENT_DATE - INTERVAL '5 days')::text,
      'assigned_to', 'Sarah Johnson',
      'status', 'completed'
    ), CURRENT_DATE - INTERVAL '5 days'),

    (v_user_id, v_activities_table_id, jsonb_build_object(
      'type', 'meeting',
      'related_to', 'FutureTech AI Integration',
      'description', 'Technical architecture review meeting. Discussed API integrations and data flow.',
      'date', (CURRENT_DATE - INTERVAL '3 days')::text,
      'assigned_to', 'Michael Chen',
      'status', 'completed'
    ), CURRENT_DATE - INTERVAL '3 days'),

    (v_user_id, v_activities_table_id, jsonb_build_object(
      'type', 'email',
      'related_to', 'Alex Thompson - New Lead',
      'description', 'Sent welcome email with product overview and case studies.',
      'date', (CURRENT_DATE - INTERVAL '1 day')::text,
      'assigned_to', 'Sarah Johnson',
      'status', 'completed'
    ), CURRENT_DATE - INTERVAL '1 day'),

    (v_user_id, v_activities_table_id, jsonb_build_object(
      'type', 'call',
      'related_to', 'Patricia Davis - Cloud Nine',
      'description', 'Initial qualification call. Budget confirmed, timeline is 2 months.',
      'date', (CURRENT_DATE - INTERVAL '4 days')::text,
      'assigned_to', 'Michael Chen',
      'status', 'completed'
    ), CURRENT_DATE - INTERVAL '4 days'),

    (v_user_id, v_activities_table_id, jsonb_build_object(
      'type', 'task',
      'related_to', 'Rachel Green - Smart Systems',
      'description', 'Schedule technical discovery call with IT team.',
      'date', (CURRENT_DATE + INTERVAL '2 days')::text,
      'assigned_to', 'Michael Chen',
      'status', 'planned'
    ), CURRENT_DATE),

    (v_user_id, v_activities_table_id, jsonb_build_object(
      'type', 'meeting',
      'related_to', 'Carlos Mendez - DataFlow',
      'description', 'Met at industry conference. Great conversation about analytics needs.',
      'date', (CURRENT_DATE - INTERVAL '10 days')::text,
      'assigned_to', 'Sarah Johnson',
      'status', 'completed'
    ), CURRENT_DATE - INTERVAL '10 days'),

    (v_user_id, v_activities_table_id, jsonb_build_object(
      'type', 'email',
      'related_to', 'InnovaTech Negotiation',
      'description', 'Sent revised pricing based on annual commitment.',
      'date', (CURRENT_DATE - INTERVAL '1 day')::text,
      'assigned_to', 'Michael Chen',
      'status', 'completed'
    ), CURRENT_DATE - INTERVAL '1 day'),

    (v_user_id, v_activities_table_id, jsonb_build_object(
      'type', 'note',
      'related_to', 'Blue Sky Ventures',
      'description', 'Lost deal to competitor. Price was the main factor. Consider startup-friendly pricing tier.',
      'date', (CURRENT_DATE - INTERVAL '2 days')::text,
      'assigned_to', 'Sarah Johnson',
      'status', 'completed'
    ), CURRENT_DATE - INTERVAL '2 days'),

    (v_user_id, v_activities_table_id, jsonb_build_object(
      'type', 'call',
      'related_to', 'Michelle Kim - Pioneer',
      'description', 'Initial outreach call. Very interested. Scheduling product demo for next week.',
      'date', (CURRENT_DATE - INTERVAL '3 days')::text,
      'assigned_to', 'Michael Chen',
      'status', 'completed'
    ), CURRENT_DATE - INTERVAL '3 days'),

    (v_user_id, v_activities_table_id, jsonb_build_object(
      'type', 'task',
      'related_to', 'Global Inc Executive Presentation',
      'description', 'Prepare executive presentation deck for C-level meeting.',
      'date', (CURRENT_DATE + INTERVAL '3 days')::text,
      'assigned_to', 'Sarah Johnson',
      'status', 'planned'
    ), CURRENT_DATE);

  RAISE NOTICE 'Created 15 activities';

  -- =====================================================
  -- SUMMARY
  -- =====================================================
  RAISE NOTICE '========================================';
  RAISE NOTICE 'CRM SAMPLE DATA CREATED SUCCESSFULLY!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'User: %', v_user_id;
  RAISE NOTICE 'Contacts: 10';
  RAISE NOTICE 'Leads: 8';
  RAISE NOTICE 'Deals: 10 (1 closed won, 1 closed lost, 8 in pipeline)';
  RAISE NOTICE 'Activities: 15 (12 completed, 3 planned)';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Total Deal Value in Pipeline: $668,500';
  RAISE NOTICE '========================================';

END $$;

-- Verify the data
SELECT 
  'Sample Data Summary' as info,
  (SELECT COUNT(*) FROM "BusinessData" WHERE user_id = '7b9effee-7ae8-455b-8096-ec81390518a2') as total_records;

