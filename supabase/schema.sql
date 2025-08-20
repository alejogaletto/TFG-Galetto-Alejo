
CREATE TABLE "User" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(255),
  "email" VARCHAR(255) UNIQUE NOT NULL,
  "password" VARCHAR(255) NOT NULL,
  "configs" JSONB,
  "creation_date" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Form" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER REFERENCES "User"("id"),
  "name" VARCHAR(255),
  "description" TEXT,
  "creation_date" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "configs" JSONB,
  "is_active" BOOLEAN DEFAULT TRUE
);

CREATE TABLE "FormField" (
  "id" SERIAL PRIMARY KEY,
  "form_id" INTEGER REFERENCES "Form"("id"),
  "type" VARCHAR(50),
  "label" VARCHAR(255),
  "position" INTEGER,
  "configs" JSONB
);

CREATE TABLE "VirtualSchema" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER REFERENCES "User"("id"),
  "name" VARCHAR(255),
  "description" TEXT,
  "configs" JSONB,
  "creation_date" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "VirtualTableSchema" (
  "id" SERIAL PRIMARY KEY,
  "virtual_schema_id" INTEGER REFERENCES "VirtualSchema"("id"),
  "name" VARCHAR(255),
  "description" TEXT,
  "configs" JSONB,
  "creation_date" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "DataConnection" (
  "id" SERIAL PRIMARY KEY,
  "form_id" INTEGER REFERENCES "Form"("id"),
  "virtual_table_schema_id" INTEGER REFERENCES "VirtualTableSchema"("id"),
  "creation_date" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "VirtualFieldSchema" (
  "id" SERIAL PRIMARY KEY,
  "virtual_table_schema_id" INTEGER REFERENCES "VirtualTableSchema"("id"),
  "name" VARCHAR(255),
  "type" VARCHAR(50),
  "properties" JSONB
);

CREATE TABLE "FieldMapping" (
  "id" SERIAL PRIMARY KEY,
  "data_connection_id" INTEGER REFERENCES "DataConnection"("id"),
  "form_field_id" INTEGER REFERENCES "FormField"("id"),
  "virtual_field_schema_id" INTEGER REFERENCES "VirtualFieldSchema"("id"),
  "changes" JSONB
);

CREATE TABLE "BusinessData" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER REFERENCES "User"("id"),
  "virtual_table_schema_id" INTEGER REFERENCES "VirtualTableSchema"("id"),
  "data_json" JSONB,
  "creation_date" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "modification_date" TIMESTAMP
);

CREATE TABLE "FormSubmission" (
  "id" SERIAL PRIMARY KEY,
  "form_id" INTEGER REFERENCES "Form"("id") ON DELETE CASCADE,
  "submission_data" JSONB NOT NULL,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "ip_address" VARCHAR(45),
  "user_agent" TEXT
);

CREATE TABLE "Workflow" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER REFERENCES "User"("id"),
  "name" VARCHAR(255),
  "description" TEXT,
  "configs" JSONB,
  "is_active" BOOLEAN DEFAULT TRUE,
  "creation_date" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "WorkflowStep" (
  "id" SERIAL PRIMARY KEY,
  "workflow_id" INTEGER REFERENCES "Workflow"("id"),
  "type" VARCHAR(50),
  "position" INTEGER,
  "configs" JSONB,
  "external_services" JSONB
);
