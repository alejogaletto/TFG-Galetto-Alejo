-- Migration: Add Workflow Triggers and Execution Tables
-- Description: Enable workflow automation triggered by form submissions and database changes

-- Table to store workflow trigger associations
CREATE TABLE IF NOT EXISTS "WorkflowTrigger" (
  "id" SERIAL PRIMARY KEY,
  "workflow_id" INTEGER NOT NULL REFERENCES "Workflow"("id") ON DELETE CASCADE,
  "trigger_type" VARCHAR(50) NOT NULL CHECK (trigger_type IN ('form_submission', 'database_change')),
  "trigger_source_id" INTEGER NOT NULL, -- form_id or virtual_table_schema_id
  "trigger_config" JSONB DEFAULT '{}', -- { operations: ['create', 'update', 'delete'] }
  "creation_date" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster lookup by workflow
CREATE INDEX IF NOT EXISTS idx_workflow_trigger_workflow_id ON "WorkflowTrigger"("workflow_id");

-- Create index for faster lookup by trigger source
CREATE INDEX IF NOT EXISTS idx_workflow_trigger_source ON "WorkflowTrigger"("trigger_type", "trigger_source_id");

-- Table to log workflow executions
CREATE TABLE IF NOT EXISTS "WorkflowExecution" (
  "id" SERIAL PRIMARY KEY,
  "workflow_id" INTEGER NOT NULL REFERENCES "Workflow"("id") ON DELETE CASCADE,
  "status" VARCHAR(50) NOT NULL CHECK (status IN ('running', 'completed', 'failed')) DEFAULT 'running',
  "trigger_type" VARCHAR(50),
  "trigger_data" JSONB DEFAULT '{}', -- context data from trigger
  "execution_logs" JSONB DEFAULT '[]', -- array of log messages
  "error_message" TEXT,
  "started_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "completed_at" TIMESTAMP
);

-- Create index for faster lookup by workflow
CREATE INDEX IF NOT EXISTS idx_workflow_execution_workflow_id ON "WorkflowExecution"("workflow_id");

-- Create index for status queries
CREATE INDEX IF NOT EXISTS idx_workflow_execution_status ON "WorkflowExecution"("status");

-- Create index for time-based queries
CREATE INDEX IF NOT EXISTS idx_workflow_execution_started_at ON "WorkflowExecution"("started_at" DESC);

-- Add comment for documentation
COMMENT ON TABLE "WorkflowTrigger" IS 'Stores associations between workflows and their triggers (forms or database tables)';
COMMENT ON TABLE "WorkflowExecution" IS 'Logs execution history of workflows with status, logs, and error information';

