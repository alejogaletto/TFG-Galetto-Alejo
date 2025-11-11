-- =====================================================
-- CRM Solution Diagnostic Script
-- =====================================================
-- Diagnose current state of solution 22 and data
-- User: 7b9effee-7ae8-455b-8096-ec81390518a2
-- =====================================================

-- 1. Check Solution 22 details
SELECT 
  '=== SOLUTION 22 DETAILS ===' as section,
  id,
  name,
  user_id,
  status,
  jsonb_array_length(configs->'canvas') as canvas_component_count
FROM "Solution"
WHERE id = 22;

-- 2. Get Solution 22's canvas configuration
SELECT 
  '=== CANVAS CONFIGURATION ===' as section,
  jsonb_pretty(configs->'canvas') as canvas_config
FROM "Solution"
WHERE id = 22;

-- 3. Check CRM VirtualSchema (template)
SELECT 
  '=== CRM VIRTUAL SCHEMA ===' as section,
  id,
  name,
  template_type,
  is_template,
  user_id
FROM "VirtualSchema"
WHERE template_type = 'crm' AND is_template = true;

-- 4. Check CRM Tables
SELECT 
  '=== CRM TABLES ===' as section,
  vts.id as table_id,
  vts.name as table_name,
  vs.id as schema_id
FROM "VirtualTableSchema" vts
JOIN "VirtualSchema" vs ON vts.virtual_schema_id = vs.id
WHERE vs.template_type = 'crm' AND vs.is_template = true
ORDER BY vts.name;

-- 5. Check data for user 7b9effee-7ae8-455b-8096-ec81390518a2
SELECT 
  '=== DATA COUNT BY TABLE ===' as section,
  vts.name as table_name,
  vts.id as table_id,
  COUNT(bd.id) as record_count
FROM "VirtualTableSchema" vts
JOIN "VirtualSchema" vs ON vts.virtual_schema_id = vs.id
LEFT JOIN "BusinessData" bd ON bd.virtual_table_schema_id = vts.id 
  AND bd.user_id = '7b9effee-7ae8-455b-8096-ec81390518a2'
WHERE vs.template_type = 'crm' AND vs.is_template = true
GROUP BY vts.name, vts.id
ORDER BY vts.name;

-- 6. Sample deals data (first 3 records)
SELECT 
  '=== SAMPLE DEALS DATA ===' as section,
  bd.id,
  bd.user_id,
  bd.virtual_table_schema_id,
  bd.data_json->>'name' as deal_name,
  bd.data_json->>'value' as deal_value,
  bd.data_json->>'stage' as deal_stage
FROM "BusinessData" bd
JOIN "VirtualTableSchema" vts ON bd.virtual_table_schema_id = vts.id
JOIN "VirtualSchema" vs ON vts.virtual_schema_id = vs.id
WHERE vs.template_type = 'crm' 
  AND vs.is_template = true 
  AND vts.name = 'Deals'
  AND bd.user_id = '7b9effee-7ae8-455b-8096-ec81390518a2'
LIMIT 3;

-- 7. Check if data exists in template vs user-specific tables
SELECT 
  '=== TEMPLATE VS USER DATA ===' as section,
  'Template tables (is_template=true)' as data_type,
  COUNT(DISTINCT bd.id) as total_records
FROM "BusinessData" bd
JOIN "VirtualTableSchema" vts ON bd.virtual_table_schema_id = vts.id
JOIN "VirtualSchema" vs ON vts.virtual_schema_id = vs.id
WHERE vs.template_type = 'crm' AND vs.is_template = true
  AND bd.user_id = '7b9effee-7ae8-455b-8096-ec81390518a2'

UNION ALL

SELECT 
  '=== TEMPLATE VS USER DATA ===' as section,
  'User-specific tables (is_template=false)' as data_type,
  COUNT(DISTINCT bd.id) as total_records
FROM "BusinessData" bd
JOIN "VirtualTableSchema" vts ON bd.virtual_table_schema_id = vts.id
JOIN "VirtualSchema" vs ON vts.virtual_schema_id = vs.id
WHERE vs.template_type = 'crm' AND vs.is_template = false
  AND bd.user_id = '7b9effee-7ae8-455b-8096-ec81390518a2';

-- 8. Get exact table IDs being used in canvas
SELECT 
  '=== TABLE IDS IN CANVAS ===' as section,
  elem->>'type' as component_type,
  elem->'config'->>'tableId' as table_id_in_config,
  elem->'config'->>'dataSource' as data_source_in_config
FROM "Solution",
  jsonb_array_elements(configs->'canvas') as elem
WHERE id = 22
  AND elem->>'type' IN ('stat-card', 'data-table', 'activity-timeline', 'contact-card-list');

