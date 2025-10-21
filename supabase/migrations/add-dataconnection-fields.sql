-- Migration: Add missing fields to DataConnection and VirtualSchema tables
-- These fields support the enhanced form-to-database connection system and database templates

-- ==============================================
-- Add fields to VirtualSchema for template support
-- ==============================================
ALTER TABLE "VirtualSchema" 
ADD COLUMN IF NOT EXISTS "template_type" VARCHAR(100);

ALTER TABLE "VirtualSchema" 
ADD COLUMN IF NOT EXISTS "is_template" BOOLEAN DEFAULT FALSE;

ALTER TABLE "VirtualSchema" 
ADD COLUMN IF NOT EXISTS "icon" VARCHAR(50);

ALTER TABLE "VirtualSchema" 
ADD COLUMN IF NOT EXISTS "color" VARCHAR(50);

ALTER TABLE "VirtualSchema" 
ADD COLUMN IF NOT EXISTS "category" VARCHAR(100);

-- Add indexes for VirtualSchema templates
CREATE INDEX IF NOT EXISTS "idx_virtualschema_user_id" ON "VirtualSchema"("user_id");
CREATE INDEX IF NOT EXISTS "idx_virtualschema_is_template" ON "VirtualSchema"("is_template");
CREATE INDEX IF NOT EXISTS "idx_virtualschema_template_type" ON "VirtualSchema"("template_type");

-- ==============================================
-- Add fields to DataConnection
-- ==============================================

-- Add virtual_schema_id to track the parent schema
ALTER TABLE "DataConnection" 
ADD COLUMN IF NOT EXISTS "virtual_schema_id" INTEGER REFERENCES "VirtualSchema"("id");

-- Add configs for additional connection configuration
ALTER TABLE "DataConnection" 
ADD COLUMN IF NOT EXISTS "configs" JSONB;

-- Add indexes for DataConnection
CREATE INDEX IF NOT EXISTS "idx_dataconnection_form_id" ON "DataConnection"("form_id");
CREATE INDEX IF NOT EXISTS "idx_dataconnection_virtual_schema_id" ON "DataConnection"("virtual_schema_id");
CREATE INDEX IF NOT EXISTS "idx_dataconnection_virtual_table_schema_id" ON "DataConnection"("virtual_table_schema_id");

-- ==============================================
-- Add comments to explain the fields
-- ==============================================
COMMENT ON COLUMN "VirtualSchema"."is_template" IS 'Indicates if this schema is a system template available to all users';
COMMENT ON COLUMN "VirtualSchema"."template_type" IS 'Type identifier for the template (e.g., customers, products, orders)';
COMMENT ON COLUMN "VirtualSchema"."icon" IS 'Icon name for UI display of the template';
COMMENT ON COLUMN "VirtualSchema"."color" IS 'Color class for UI display of the template';
COMMENT ON COLUMN "VirtualSchema"."category" IS 'Category for organizing templates (e.g., CRM, Inventory, Sales)';

COMMENT ON COLUMN "DataConnection"."virtual_schema_id" IS 'Reference to the parent VirtualSchema (database) for this connection';
COMMENT ON COLUMN "DataConnection"."configs" IS 'Additional configuration for the data connection (sync settings, filters, etc.)';

