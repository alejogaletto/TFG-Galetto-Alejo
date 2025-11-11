-- =====================================================
-- CRM Setup Verification Script (Supabase Dashboard)
-- =====================================================
-- Run this in Supabase Dashboard SQL Editor
-- =====================================================

-- 1. Check VirtualSchema
SELECT 
  '1. CRM Virtual Schema' as check_type,
  id,
  name,
  template_type,
  is_template,
  user_id,
  creation_date
FROM "VirtualSchema" 
WHERE template_type = 'crm' AND is_template = true
ORDER BY creation_date DESC;

-- 2. Check VirtualTableSchemas
SELECT 
  '2. CRM Tables' as check_type,
  vts.id,
  vts.name as table_name,
  vs.name as schema_name,
  vs.id as schema_id
FROM "VirtualTableSchema" vts
JOIN "VirtualSchema" vs ON vts.virtual_schema_id = vs.id
WHERE vs.template_type = 'crm' AND vs.is_template = true
ORDER BY vts.name;

-- 3. Check field counts
SELECT 
  '3. Field Counts' as check_type,
  vts.name as table_name,
  COUNT(vfs.id) as field_count
FROM "VirtualTableSchema" vts
JOIN "VirtualSchema" vs ON vts.virtual_schema_id = vs.id
LEFT JOIN "VirtualFieldSchema" vfs ON vts.id = vfs.virtual_table_schema_id
WHERE vs.template_type = 'crm' AND vs.is_template = true
GROUP BY vts.name
ORDER BY vts.name;

-- 4. Check Forms
SELECT 
  '4. CRM Forms' as check_type,
  id,
  name,
  is_active,
  user_id,
  creation_date
FROM "Form" 
WHERE name IN (
  'Lead Capture Form',
  'Contact Management Form',
  'Deal / Opportunity Form',
  'Activity Log Form'
)
ORDER BY name;

-- 5. Check Solution Template
SELECT 
  '5. CRM Solution Template' as check_type,
  id,
  name,
  template_type,
  is_template,
  status,
  user_id,
  creation_date
FROM "Solution" 
WHERE template_type = 'crm_sales' AND is_template = true
ORDER BY creation_date DESC;

-- 6. Check Solution Components
SELECT 
  '6. Solution Components' as check_type,
  sc.id,
  s.name as solution_name,
  sc.component_type,
  sc.component_id,
  sc.configs->>'name' as component_name
FROM "SolutionComponent" sc
JOIN "Solution" s ON sc.solution_id = s.id
WHERE s.template_type = 'crm_sales' AND s.is_template = true
ORDER BY sc.id;

-- 7. Check Workflows
SELECT 
  '7. CRM Workflows' as check_type,
  id,
  name,
  is_active,
  user_id,
  creation_date
FROM "Workflow" 
WHERE name LIKE 'CRM:%'
ORDER BY name;

-- 8. Summary count
SELECT 
  'SUMMARY' as info,
  (SELECT COUNT(*) FROM "VirtualSchema" WHERE template_type = 'crm' AND is_template = true) as crm_schemas,
  (SELECT COUNT(*) FROM "VirtualTableSchema" vts 
   JOIN "VirtualSchema" vs ON vts.virtual_schema_id = vs.id 
   WHERE vs.template_type = 'crm' AND vs.is_template = true) as crm_tables,
  (SELECT COUNT(*) FROM "Form" WHERE name LIKE '%Form' AND name IN ('Lead Capture Form', 'Contact Management Form', 'Deal / Opportunity Form', 'Activity Log Form')) as crm_forms,
  (SELECT COUNT(*) FROM "Solution" WHERE template_type = 'crm_sales' AND is_template = true) as crm_solutions,
  (SELECT COUNT(*) FROM "Workflow" WHERE name LIKE 'CRM:%') as crm_workflows;

