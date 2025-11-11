-- =====================================================
-- CRM Setup Verification Script
-- =====================================================
-- This script checks if the CRM was set up correctly
-- =====================================================

\echo '================================================'
\echo 'CRM SETUP VERIFICATION'
\echo '================================================'
\echo ''

-- 1. Check VirtualSchema
\echo '1. Checking CRM Virtual Schema...'
SELECT 
  id,
  name,
  template_type,
  is_template,
  creation_date
FROM "VirtualSchema" 
WHERE template_type = 'crm' AND is_template = true
ORDER BY creation_date DESC;

\echo ''

-- 2. Check VirtualTableSchemas
\echo '2. Checking CRM Tables...'
SELECT 
  vts.id,
  vts.name,
  vs.name as schema_name
FROM "VirtualTableSchema" vts
JOIN "VirtualSchema" vs ON vts.virtual_schema_id = vs.id
WHERE vs.template_type = 'crm' AND vs.is_template = true
ORDER BY vts.name;

\echo ''

-- 3. Check field counts
\echo '3. Checking Field Counts per Table...'
SELECT 
  vts.name as table_name,
  COUNT(vfs.id) as field_count
FROM "VirtualTableSchema" vts
JOIN "VirtualSchema" vs ON vts.virtual_schema_id = vs.id
LEFT JOIN "VirtualFieldSchema" vfs ON vts.id = vfs.virtual_table_schema_id
WHERE vs.template_type = 'crm' AND vs.is_template = true
GROUP BY vts.name
ORDER BY vts.name;

\echo ''

-- 4. Check Forms
\echo '4. Checking CRM Forms...'
SELECT 
  id,
  name,
  is_active,
  creation_date
FROM "Form" 
WHERE name IN (
  'Lead Capture Form',
  'Contact Management Form',
  'Deal / Opportunity Form',
  'Activity Log Form'
)
ORDER BY name;

\echo ''

-- 5. Check Solution Template
\echo '5. Checking CRM Solution Template...'
SELECT 
  id,
  name,
  template_type,
  is_template,
  status,
  user_id
FROM "Solution" 
WHERE template_type = 'crm_sales' AND is_template = true
ORDER BY creation_date DESC;

\echo ''

-- 6. Check Solution Components
\echo '6. Checking Solution Component Links...'
SELECT 
  sc.id,
  s.name as solution_name,
  sc.component_type,
  sc.component_id,
  sc.configs->>'name' as component_name
FROM "SolutionComponent" sc
JOIN "Solution" s ON sc.solution_id = s.id
WHERE s.template_type = 'crm_sales' AND s.is_template = true
ORDER BY sc.id;

\echo ''

-- 7. Check Workflows
\echo '7. Checking CRM Workflows...'
SELECT 
  id,
  name,
  is_active,
  creation_date
FROM "Workflow" 
WHERE name LIKE 'CRM:%'
ORDER BY name;

\echo ''
\echo '================================================'
\echo 'VERIFICATION COMPLETE'
\echo '================================================'

