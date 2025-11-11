-- =====================================================
-- CRM Solution - Complete Setup Script
-- =====================================================
-- This master script sets up the entire CRM solution
-- by running all component scripts in the correct order
--
-- USAGE:
--   psql -U your_user -d your_database -f setup-crm-complete.sql
--
-- Or via Supabase Dashboard:
--   1. Go to SQL Editor
--   2. Paste this script
--   3. Run
--
-- =====================================================

\echo '================================================'
\echo 'CRM SOLUTION - COMPLETE SETUP'
\echo '================================================'
\echo 'This will create:'
\echo '  - CRM Database Structure (VirtualSchema with 4 tables)'
\echo '  - CRM Forms (4 forms for data entry)'
\echo '  - CRM Solution Template (with pre-configured dashboard)'
\echo '  - CRM Workflows (2 automation workflows)'
\echo '================================================'
\echo ''

-- =====================================================
-- STEP 1: Database Structure
-- =====================================================
\echo 'STEP 1/4: Creating CRM Database Structure...'
\echo '  - VirtualSchema: CRM Database'
\echo '  - Tables: Contacts, Leads, Deals, Activities'
\echo '  - Fields: All necessary fields with proper types'
\echo ''

\ir seed-crm-solution.sql

\echo ''
\echo 'Database structure created ✓'
\echo ''

-- =====================================================
-- STEP 2: Forms
-- =====================================================
\echo 'STEP 2/4: Creating CRM Forms...'
\echo '  - Lead Capture Form'
\echo '  - Contact Management Form'
\echo '  - Deal / Opportunity Form'
\echo '  - Activity Log Form'
\echo ''

\ir seed-crm-forms.sql

\echo ''
\echo 'Forms created ✓'
\echo ''

-- =====================================================
-- STEP 3: Solution Template
-- =====================================================
\echo 'STEP 3/4: Creating CRM Solution Template...'
\echo '  - Solution: CRM - Sales Pipeline'
\echo '  - Canvas with 8 pre-configured components'
\echo '  - Linked database, forms, and workflows'
\echo ''

\ir seed-crm-solution-template.sql

\echo ''
\echo 'Solution template created ✓'
\echo ''

-- =====================================================
-- STEP 4: Workflows (Optional Automation)
-- =====================================================
\echo 'STEP 4/4: Creating CRM Workflows...'
\echo '  - Lead Auto-Assignment Workflow'
\echo '  - Deal Stage Notifications Workflow'
\echo ''

\ir seed-crm-workflows.sql

\echo ''
\echo 'Workflows created ✓'
\echo ''

-- =====================================================
-- VERIFICATION & SUMMARY
-- =====================================================
\echo '================================================'
\echo 'SETUP COMPLETE! 🎉'
\echo '================================================'
\echo ''
\echo 'Verification Queries:'
\echo ''

-- Check VirtualSchema and Tables
\echo '--- CRM Database Structure ---'
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

\echo ''
\echo '--- CRM Forms ---'
-- Check Forms
SELECT 
  f.id,
  f.name,
  COUNT(ff.id) as field_count,
  f.is_active
FROM "Form" f
LEFT JOIN "FormField" ff ON f.id = ff.form_id
WHERE f.name IN (
  'Lead Capture Form',
  'Contact Management Form',
  'Deal / Opportunity Form',
  'Activity Log Form'
)
GROUP BY f.id, f.name, f.is_active
ORDER BY f.id;

\echo ''
\echo '--- CRM Solution Template ---'
-- Check Solution
SELECT 
  s.id,
  s.name,
  s.template_type,
  s.is_template,
  s.status,
  COUNT(DISTINCT sc.id) as linked_components,
  jsonb_array_length(s.configs->'canvas') as canvas_components
FROM "Solution" s
LEFT JOIN "SolutionComponent" sc ON s.id = sc.solution_id
WHERE s.template_type = 'crm_sales' AND s.is_template = true
GROUP BY s.id, s.name, s.template_type, s.is_template, s.status, s.configs;

\echo ''
\echo '--- CRM Workflows ---'
-- Check Workflows
SELECT 
  w.id,
  w.name,
  w.is_active,
  COUNT(ws.id) as step_count
FROM "Workflow" w
LEFT JOIN "WorkflowStep" ws ON w.id = ws.workflow_id
WHERE w.name LIKE 'CRM:%'
GROUP BY w.id, w.name, w.is_active
ORDER BY w.id;

\echo ''
\echo '================================================'
\echo 'NEXT STEPS'
\echo '================================================'
\echo ''
\echo '1. Access the application at /dashboard/solutions'
\echo ''
\echo '2. You will see the "CRM - Sales Pipeline" template'
\echo ''
\echo '3. Click "Use Template" to create your CRM instance'
\echo ''
\echo '4. The CRM dashboard will include:'
\echo '   - 4 Stat Cards (Contacts, Leads, Deals, Activities)'
\echo '   - Kanban Board for Deal Pipeline'
\echo '   - Activity Timeline'
\echo '   - Contact List with search'
\echo ''
\echo '5. (Optional) Set up DataConnections to link forms to tables:'
\echo '   - Link "Lead Capture Form" to "Leads" table'
\echo '   - Link "Contact Form" to "Contacts" table'
\echo '   - Link "Deal Form" to "Deals" table'
\echo '   - Link "Activity Form" to "Activities" table'
\echo ''
\echo '6. (Optional) Configure workflow email settings'
\echo '   in /dashboard/workflows for automation'
\echo ''
\echo '================================================'
\echo 'For more details, see: docs/crm-solution-guide.md'
\echo '================================================'
\echo ''

