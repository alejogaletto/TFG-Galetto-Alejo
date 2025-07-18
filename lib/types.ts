
export type User = {
  id: number;
  name?: string;
  email: string;
  password?: string;
  configs?: any;
  creation_date?: string;
};

export type Form = {
  id: number;
  user_id?: number;
  name?: string;
  description?: string;
  creation_date?: string;
  configs?: any;
  is_active?: boolean;
};

export type FormField = {
  id: number;
  form_id?: number;
  type?: string;
  label?: string;
  position?: number;
  configs?: any;
};

export type DataConnection = {
  id: number;
  form_id?: number;
  virtual_table_schema_id?: number;
  creation_date?: string;
};

export type FieldMapping = {
  id: number;
  data_connection_id?: number;
  form_field_id?: number;
  virtual_field_schema_id?: number;
  changes?: any;
};

export type VirtualSchema = {
  id: number;
  user_id?: number;
  name?: string;
  description?: string;
  configs?: any;
  creation_date?: string;
};

export type VirtualTableSchema = {
  id: number;
  virtual_schema_id?: number;
  name?: string;
  description?: string;
  configs?: any;
  creation_date?: string;
};

export type VirtualFieldSchema = {
  id: number;
  virtual_table_schema_id?: number;
  name?: string;
  type?: string;
  properties?: any;
};

export type BusinessData = {
  id: number;
  user_id?: number;
  virtual_table_schema_id?: number;
  data_json?: any;
  creation_date?: string;
  modification_date?: string;
};

export type Workflow = {
  id: number;
  user_id?: number;
  name?: string;
  description?: string;
  configs?: any;
  is_active?: boolean;
  creation_date?: string;
};

export type WorkflowStep = {
  id: number;
  workflow_id?: number;
  type?: string;
  position?: number;
  configs?: any;
  external_services?: any;
};
