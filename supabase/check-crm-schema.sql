-- Check CRM Virtual Schema and Tables
-- Run this in Supabase SQL Editor to diagnose the issue

-- 1. Check if CRM Virtual Schema exists
SELECT 
    id,
    name,
    description,
    user_id,
    creation_date
FROM "VirtualSchema"
WHERE name = 'CRM'
ORDER BY id DESC;

-- 2. Check CRM Tables (should be IDs 25-28)
SELECT 
    vts.id,
    vts.name,
    vts.virtual_schema_id,
    vs.name as schema_name,
    vs.user_id
FROM "VirtualTableSchema" vts
JOIN "VirtualSchema" vs ON vs.id = vts.virtual_schema_id
WHERE vts.id IN (25, 26, 27, 28)
   OR vs.name = 'CRM'
ORDER BY vts.id;

-- 3. Check which user owns the CRM schema
SELECT DISTINCT
    vs.user_id,
    vs.name as schema_name,
    COUNT(vts.id) as table_count
FROM "VirtualSchema" vs
LEFT JOIN "VirtualTableSchema" vts ON vts.virtual_schema_id = vs.id
WHERE vs.name = 'CRM'
GROUP BY vs.user_id, vs.name;

-- 4. Check what user_id your current user has
SELECT 
    '7b9effee-7ae8-455b-8096-ec81390518a2' as expected_user_id;

-- 5. Check all schemas for user 7b9effee-7ae8-455b-8096-ec81390518a2
SELECT 
    vs.id,
    vs.name,
    vs.user_id,
    COUNT(vts.id) as table_count
FROM "VirtualSchema" vs
LEFT JOIN "VirtualTableSchema" vts ON vts.virtual_schema_id = vs.id
WHERE vs.user_id = '7b9effee-7ae8-455b-8096-ec81390518a2'
GROUP BY vs.id, vs.name, vs.user_id
ORDER BY vs.id;

-- 6. Check RLS policies on VirtualSchema
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'VirtualSchema';

-- 7. Check RLS policies on VirtualTableSchema  
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'VirtualTableSchema';

