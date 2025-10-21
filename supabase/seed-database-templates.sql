-- Database Templates for Form Connections
-- These are pre-built database schemas that users can select when connecting forms

-- First, add is_template flag to VirtualSchema if it doesn't exist
ALTER TABLE "VirtualSchema" ADD COLUMN IF NOT EXISTS "is_template" BOOLEAN DEFAULT FALSE;
ALTER TABLE "VirtualSchema" ADD COLUMN IF NOT EXISTS "template_type" VARCHAR(100);
ALTER TABLE "VirtualSchema" ADD COLUMN IF NOT EXISTS "category" VARCHAR(100);
ALTER TABLE "VirtualSchema" ADD COLUMN IF NOT EXISTS "icon" VARCHAR(50);
ALTER TABLE "VirtualSchema" ADD COLUMN IF NOT EXISTS "color" VARCHAR(50);

-- ==============================================
-- CUSTOMERS DATABASE TEMPLATE
-- ==============================================
INSERT INTO "VirtualSchema" (
  "user_id",
  "name", 
  "description",
  "template_type",
  "is_template",
  "icon",
  "color",
  "category",
  "configs"
) VALUES (
  NULL, -- System template (no specific user)
  'Customers Database',
  'Gestiona información de clientes y contactos',
  'customers',
  true,
  'users',
  'bg-blue-500',
  'CRM',
  '{"features": ["Customer records", "Contact information", "Communication history"]}'
) RETURNING id AS customers_schema_id;

-- Get the last inserted schema ID for customers
WITH last_schema AS (
  SELECT id FROM "VirtualSchema" WHERE template_type = 'customers' ORDER BY id DESC LIMIT 1
)
INSERT INTO "VirtualTableSchema" (
  "virtual_schema_id",
  "name",
  "description",
  "configs"
)
SELECT 
  id,
  'Customers',
  'Store customer contact information',
  '{}'
FROM last_schema
RETURNING id AS customers_table_id;

-- Insert fields for Customers table
WITH last_table AS (
  SELECT vts.id 
  FROM "VirtualTableSchema" vts
  JOIN "VirtualSchema" vs ON vts.virtual_schema_id = vs.id
  WHERE vs.template_type = 'customers' AND vts.name = 'Customers'
  ORDER BY vts.id DESC LIMIT 1
)
INSERT INTO "VirtualFieldSchema" (
  "virtual_table_schema_id",
  "name",
  "type",
  "properties"
)
SELECT 
  id,
  field_name,
  field_type,
  field_props::jsonb
FROM last_table,
LATERAL (VALUES
  ('id', 'id', '{"required": true, "unique": true, "isPrimary": true}'),
  ('name', 'text', '{"required": true, "unique": false}'),
  ('email', 'email', '{"required": true, "unique": true}'),
  ('phone', 'text', '{"required": false, "unique": false}'),
  ('created_at', 'datetime', '{"required": true, "unique": false}')
) AS fields(field_name, field_type, field_props);

-- ==============================================
-- PRODUCTS DATABASE TEMPLATE
-- ==============================================
INSERT INTO "VirtualSchema" (
  "user_id",
  "name", 
  "description",
  "template_type",
  "is_template",
  "icon",
  "color",
  "category",
  "configs"
) VALUES (
  NULL,
  'Products Catalog',
  'Gestiona tu catálogo de productos e inventario',
  'products',
  true,
  'package',
  'bg-green-500',
  'Inventory',
  '{"features": ["Product catalog", "Pricing", "Stock management"]}'
);

WITH last_schema AS (
  SELECT id FROM "VirtualSchema" WHERE template_type = 'products' ORDER BY id DESC LIMIT 1
)
INSERT INTO "VirtualTableSchema" (
  "virtual_schema_id",
  "name",
  "description",
  "configs"
)
SELECT 
  id,
  'Products',
  'Store product information and pricing',
  '{}'
FROM last_schema;

WITH last_table AS (
  SELECT vts.id 
  FROM "VirtualTableSchema" vts
  JOIN "VirtualSchema" vs ON vts.virtual_schema_id = vs.id
  WHERE vs.template_type = 'products' AND vts.name = 'Products'
  ORDER BY vts.id DESC LIMIT 1
)
INSERT INTO "VirtualFieldSchema" (
  "virtual_table_schema_id",
  "name",
  "type",
  "properties"
)
SELECT 
  id,
  field_name,
  field_type,
  field_props::jsonb
FROM last_table,
LATERAL (VALUES
  ('id', 'id', '{"required": true, "unique": true, "isPrimary": true}'),
  ('name', 'text', '{"required": true, "unique": true}'),
  ('description', 'text', '{"required": false, "unique": false}'),
  ('price', 'number', '{"required": true, "unique": false}'),
  ('category', 'text', '{"required": true, "unique": false}'),
  ('in_stock', 'boolean', '{"required": true, "unique": false}')
) AS fields(field_name, field_type, field_props);

-- ==============================================
-- ORDERS DATABASE TEMPLATE
-- ==============================================
INSERT INTO "VirtualSchema" (
  "user_id",
  "name", 
  "description",
  "template_type",
  "is_template",
  "icon",
  "color",
  "category",
  "configs"
) VALUES (
  NULL,
  'Orders Management',
  'Gestiona pedidos y ventas de clientes',
  'orders',
  true,
  'shopping-cart',
  'bg-purple-500',
  'Sales',
  '{"features": ["Order tracking", "Order items", "Sales history"]}'
);

-- Orders table
WITH last_schema AS (
  SELECT id FROM "VirtualSchema" WHERE template_type = 'orders' ORDER BY id DESC LIMIT 1
)
INSERT INTO "VirtualTableSchema" (
  "virtual_schema_id",
  "name",
  "description",
  "configs"
)
SELECT 
  id,
  'Orders',
  'Store customer order information',
  '{}'
FROM last_schema;

WITH last_table AS (
  SELECT vts.id 
  FROM "VirtualTableSchema" vts
  JOIN "VirtualSchema" vs ON vts.virtual_schema_id = vs.id
  WHERE vs.template_type = 'orders' AND vts.name = 'Orders'
  ORDER BY vts.id DESC LIMIT 1
)
INSERT INTO "VirtualFieldSchema" (
  "virtual_table_schema_id",
  "name",
  "type",
  "properties"
)
SELECT 
  id,
  field_name,
  field_type,
  field_props::jsonb
FROM last_table,
LATERAL (VALUES
  ('id', 'id', '{"required": true, "unique": true, "isPrimary": true}'),
  ('customer_id', 'number', '{"required": true, "unique": false}'),
  ('order_date', 'datetime', '{"required": true, "unique": false}'),
  ('status', 'text', '{"required": true, "unique": false}'),
  ('total', 'number', '{"required": true, "unique": false}')
) AS fields(field_name, field_type, field_props);

-- OrderItems table
WITH last_schema AS (
  SELECT id FROM "VirtualSchema" WHERE template_type = 'orders' ORDER BY id DESC LIMIT 1
)
INSERT INTO "VirtualTableSchema" (
  "virtual_schema_id",
  "name",
  "description",
  "configs"
)
SELECT 
  id,
  'OrderItems',
  'Store order line items and products',
  '{}'
FROM last_schema;

WITH last_table AS (
  SELECT vts.id 
  FROM "VirtualTableSchema" vts
  JOIN "VirtualSchema" vs ON vts.virtual_schema_id = vs.id
  WHERE vs.template_type = 'orders' AND vts.name = 'OrderItems'
  ORDER BY vts.id DESC LIMIT 1
)
INSERT INTO "VirtualFieldSchema" (
  "virtual_table_schema_id",
  "name",
  "type",
  "properties"
)
SELECT 
  id,
  field_name,
  field_type,
  field_props::jsonb
FROM last_table,
LATERAL (VALUES
  ('id', 'id', '{"required": true, "unique": true, "isPrimary": true}'),
  ('order_id', 'number', '{"required": true, "unique": false}'),
  ('product_id', 'number', '{"required": true, "unique": false}'),
  ('quantity', 'number', '{"required": true, "unique": false}'),
  ('price', 'number', '{"required": true, "unique": false}')
) AS fields(field_name, field_type, field_props);

-- ==============================================
-- EMPLOYEES DATABASE TEMPLATE
-- ==============================================
INSERT INTO "VirtualSchema" (
  "user_id",
  "name", 
  "description",
  "template_type",
  "is_template",
  "icon",
  "color",
  "category",
  "configs"
) VALUES (
  NULL,
  'Employees Directory',
  'Gestiona información de empleados y recursos humanos',
  'employees',
  true,
  'briefcase',
  'bg-orange-500',
  'HR',
  '{"features": ["Employee records", "Department management", "Contact info"]}'
);

WITH last_schema AS (
  SELECT id FROM "VirtualSchema" WHERE template_type = 'employees' ORDER BY id DESC LIMIT 1
)
INSERT INTO "VirtualTableSchema" (
  "virtual_schema_id",
  "name",
  "description",
  "configs"
)
SELECT 
  id,
  'Employees',
  'Store employee information and records',
  '{}'
FROM last_schema;

WITH last_table AS (
  SELECT vts.id 
  FROM "VirtualTableSchema" vts
  JOIN "VirtualSchema" vs ON vts.virtual_schema_id = vs.id
  WHERE vs.template_type = 'employees' AND vts.name = 'Employees'
  ORDER BY vts.id DESC LIMIT 1
)
INSERT INTO "VirtualFieldSchema" (
  "virtual_table_schema_id",
  "name",
  "type",
  "properties"
)
SELECT 
  id,
  field_name,
  field_type,
  field_props::jsonb
FROM last_table,
LATERAL (VALUES
  ('id', 'id', '{"required": true, "unique": true, "isPrimary": true}'),
  ('first_name', 'text', '{"required": true, "unique": false}'),
  ('last_name', 'text', '{"required": true, "unique": false}'),
  ('email', 'email', '{"required": true, "unique": true}'),
  ('position', 'text', '{"required": true, "unique": false}'),
  ('department', 'text', '{"required": true, "unique": false}'),
  ('hire_date', 'datetime', '{"required": true, "unique": false}')
) AS fields(field_name, field_type, field_props);

