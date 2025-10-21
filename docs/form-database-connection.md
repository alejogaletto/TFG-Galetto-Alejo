# Form-Database Connection System

## Overview

The Form-Database Connection system allows users to link forms directly to virtual database schemas, enabling automatic storage of form submissions into structured database tables with field-level mapping.

## Architecture

### Key Components

1. **VirtualSchema**: Represents a database (can be user-created or system template)
2. **VirtualTableSchema**: Tables within a database
3. **VirtualFieldSchema**: Fields/columns within tables
4. **DataConnection**: Links a form to a specific database and table
5. **FieldMapping**: Maps form fields to database fields
6. **BusinessData**: Stores the actual form submission data

### Data Flow

```
User Creates Form → Selects Database Template → Creates DataConnection
              ↓
Form Builder → Selects Table → Updates DataConnection.virtual_table_schema_id
              ↓
Field Mapping → Auto/Manual Mapping → Creates FieldMapping records
              ↓
Form Submission → Stores in BusinessData → Uses FieldMapping for structure
```

## Database Templates

### System Templates

Pre-configured database schemas available to all users:

1. **Customers Database** (`customers`)
   - Category: CRM
   - Tables: Customers
   - Fields: id, name, email, phone, created_at

2. **Products Catalog** (`products`)
   - Category: Inventory
   - Tables: Products
   - Fields: id, name, description, price, category, in_stock

3. **Orders Management** (`orders`)
   - Category: Sales
   - Tables: Orders, OrderItems
   - Fields: Various order and line item fields

4. **Employees Directory** (`employees`)
   - Category: HR
   - Tables: Employees
   - Fields: id, first_name, last_name, email, position, department, hire_date

### Template Structure

Templates are stored as `VirtualSchema` records with:
- `is_template = true`
- `user_id = NULL` (system-wide)
- `template_type`: Unique identifier
- `icon`, `color`, `category`: UI metadata

## API Endpoints

### Data Connections

#### POST /api/data-connections
Create or update a data connection between a form and database.

**Request Body:**
```json
{
  "form_id": 123,
  "virtual_schema_id": 456,
  "virtual_table_schema_id": 789,
  "configs": {}
}
```

**Response:**
```json
{
  "id": 1,
  "form_id": 123,
  "virtual_schema_id": 456,
  "virtual_table_schema_id": 789,
  "configs": {},
  "creation_date": "2025-01-01T00:00:00Z"
}
```

#### GET /api/data-connections?form_id=123
Fetch data connection for a specific form.

**Response:**
```json
{
  "id": 1,
  "form_id": 123,
  "virtual_schema_id": 456,
  "virtual_table_schema_id": 789,
  "configs": {},
  "creation_date": "2025-01-01T00:00:00Z"
}
```

### Field Mappings

#### POST /api/field-mappings
Create or update field mappings (batch operation).

**Request Body:**
```json
[
  {
    "data_connection_id": 1,
    "form_field_id": 10,
    "virtual_field_schema_id": 20,
    "changes": null
  },
  {
    "data_connection_id": 1,
    "form_field_id": 11,
    "virtual_field_schema_id": 21,
    "changes": null
  }
]
```

**Response:**
```json
[
  {
    "id": 1,
    "data_connection_id": 1,
    "form_field_id": 10,
    "virtual_field_schema_id": 20,
    "changes": null
  },
  {
    "id": 2,
    "data_connection_id": 1,
    "form_field_id": 11,
    "virtual_field_schema_id": 21,
    "changes": null
  }
]
```

#### GET /api/field-mappings?data_connection_id=1
Fetch field mappings for a data connection.

#### DELETE /api/field-mappings?data_connection_id=1
Delete all field mappings for a data connection.

## User Workflow

### 1. Form Creation (Wizard)

When creating a form through the wizard:

1. User fills basic information (name, description)
2. User selects a template
3. **In the "Customize" tab:**
   - User can enable database connection
   - Dropdown shows available virtual schemas (user's databases + system templates)
   - User selects a database or creates a new one
4. When form is created:
   - Form record is created
   - If database was selected, `DataConnection` record is created with `virtual_schema_id`

### 2. Form Builder (Field Mapping)

When editing the form in the builder:

1. **Database Connection Status:**
   - Shows if form is connected to a database
   - Displays database name and connected table (if selected)
   - Shows count of mapped fields

2. **Connecting to Database:**
   - User clicks "Connect Database"
   - Dialog shows available databases (fetched dynamically from API)
   - User selects database → fetches tables
   - User selects table
   - Option to auto-map fields (enabled by default)

3. **Field Mapping:**
   - System automatically maps fields based on:
     - Type compatibility (text→text, email→email, etc.)
     - Name similarity (fuzzy matching)
   - User can manually adjust mappings
   - Mappings are saved immediately to database

4. **Saving:**
   - Form fields are saved
   - Field mappings are persisted via API
   - Connection configuration is updated

### 3. Form Submission (User-Facing)

When a user submits the form:

1. Submission is received by `/api/form-submissions`
2. System checks if form has `DataConnection`
3. **If connected:**
   - Fetches `FieldMapping` records
   - Maps submitted data to database fields
   - Stores in `BusinessData` table with mapped structure
4. **If not connected:**
   - Stores in generic `FormSubmission` table

## Auto-Mapping Algorithm

The system uses intelligent field matching:

```typescript
function autoMapFields(formFields, databaseFields) {
  const mappings = {}
  
  for (const formField of formFields) {
    const match = databaseFields.find(dbField => {
      // Skip ID fields
      if (dbField.type === 'id') return false
      
      // Check type compatibility
      const typeMatches = isCompatibleType(formField.type, dbField.type)
      
      // Check name similarity
      const nameSimilarity = calculateSimilarity(
        formField.label.toLowerCase(),
        dbField.name.toLowerCase()
      )
      
      return typeMatches && nameSimilarity > 0.6
    })
    
    if (match) {
      mappings[formField.id] = match.id
    }
  }
  
  return mappings
}
```

### Type Compatibility Rules

- `text` → `text`, `varchar`
- `email` → `email`, `text`, `varchar`
- `number` → `number`, `integer`, `int`
- `phone` → `text`, `varchar`
- `checkbox` → `boolean`
- `date` → `datetime`, `date`, `timestamp`

## Migration Support

For existing forms with old `configs.database` configuration:

1. On form load, system checks for `configs.database` but no `DataConnection`
2. Fetches all virtual schemas
3. Finds matching schema by name (case-insensitive)
4. Creates `DataConnection` record
5. Migration happens silently, no user interaction needed

## Database Schema

### VirtualSchema (Extended)

```sql
CREATE TABLE "VirtualSchema" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER REFERENCES "User"("id"),
  "name" VARCHAR(255),
  "description" TEXT,
  "template_type" VARCHAR(100),      -- NEW
  "is_template" BOOLEAN DEFAULT FALSE, -- NEW
  "icon" VARCHAR(50),                 -- NEW
  "color" VARCHAR(50),                -- NEW
  "category" VARCHAR(100),            -- NEW
  "configs" JSONB,
  "creation_date" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### DataConnection (Extended)

```sql
CREATE TABLE "DataConnection" (
  "id" SERIAL PRIMARY KEY,
  "form_id" INTEGER REFERENCES "Form"("id"),
  "virtual_schema_id" INTEGER REFERENCES "VirtualSchema"("id"),  -- NEW
  "virtual_table_schema_id" INTEGER REFERENCES "VirtualTableSchema"("id"),
  "configs" JSONB,  -- NEW
  "creation_date" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Setup Instructions

### 1. Run Schema Migrations

```bash
# Add new fields to existing tables
psql -U your_user -d your_database -f supabase/migrations/add-dataconnection-fields.sql
```

### 2. Seed Database Templates

```bash
# Insert system template databases
psql -U your_user -d your_database -f supabase/seed-database-templates.sql
```

### 3. Verify Setup

Check that templates are available:

```sql
SELECT * FROM "VirtualSchema" WHERE is_template = true;
```

Should return 4 template databases (Customers, Products, Orders, Employees).

## Best Practices

### For Users

1. **Use Templates**: Start with system templates when possible for common use cases
2. **Field Naming**: Use clear, descriptive field names that match database conventions
3. **Auto-Mapping**: Enable auto-mapping first, then adjust manually if needed
4. **Test Submissions**: Submit test data to verify field mappings work correctly

### For Developers

1. **Always Persist**: Ensure DataConnection and FieldMapping are saved to database
2. **Validate Types**: Check type compatibility before mapping
3. **Handle Nulls**: Account for unmapped fields (data won't be saved)
4. **Error Handling**: Gracefully fallback to FormSubmission if connection fails
5. **Indexes**: Use proper indexes on foreign keys for performance

## Troubleshooting

### Form submissions not appearing in database

1. Check if `DataConnection` exists for the form
2. Verify `FieldMapping` records exist
3. Check `BusinessData` table for entries
4. Review API logs for errors during submission

### Field mappings not saving

1. Ensure `DataConnection` exists before creating mappings
2. Verify form fields have valid IDs
3. Check that virtual field schema IDs are correct
4. Validate field type compatibility

### Templates not showing

1. Run seed-database-templates.sql
2. Verify `is_template = true` in VirtualSchema
3. Check API endpoint `/api/virtual-schemas?includeTree=true`
4. Ensure user has permission to view templates

## Future Enhancements

- [ ] Conditional field mapping based on form values
- [ ] Multi-table support (one form → multiple tables)
- [ ] Field transformations (formatting, calculations)
- [ ] Sync back from database to form (pre-filling)
- [ ] Template marketplace for community-contributed schemas
- [ ] Data validation rules from database schema
- [ ] Relationship mapping (foreign keys)
- [ ] Bulk import/export of field mappings

