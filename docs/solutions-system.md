# Solutions System

## Overview

The **Solutions System** is the orchestration layer that brings together all capabilities of your platform - Forms, Databases (Virtual Schemas), and Workflows - into cohesive, reusable business applications.

## Key Concepts

### 1. Solutions as Templates and Instances

Solutions exist in two forms:

- **Templates**: Predefined solution blueprints that users can instantiate (e.g., "CRM - Gestión de Clientes", "Control de Inventario")
- **Instances**: User-created solutions based on templates or built from scratch

### 2. Solution Components

A solution is composed of multiple components that reference existing system resources:

- **Forms**: Data collection interfaces
- **Databases** (Virtual Schemas): Structured data storage
- **Workflows**: Automated business logic and integrations

## Database Schema

### Solution Table

```sql
CREATE TABLE "Solution" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER REFERENCES "User"("id"),
  "name" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "template_type" VARCHAR(100),          -- e.g., 'crm', 'inventario', 'analytics'
  "is_template" BOOLEAN DEFAULT FALSE,   -- TRUE for templates, FALSE for instances
  "template_id" INTEGER REFERENCES "Solution"("id"),  -- Links instances to their template
  "status" VARCHAR(50) DEFAULT 'active', -- 'active', 'draft', 'archived'
  "icon" VARCHAR(50),                    -- Icon identifier (e.g., 'users', 'package')
  "color" VARCHAR(50),                   -- Color class (e.g., 'bg-blue-500')
  "category" VARCHAR(100),               -- Display category (e.g., 'Ventas', 'Inventario')
  "configs" JSONB,                       -- Additional configuration (features, settings)
  "creation_date" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "modification_date" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### SolutionComponent Table

```sql
CREATE TABLE "SolutionComponent" (
  "id" SERIAL PRIMARY KEY,
  "solution_id" INTEGER REFERENCES "Solution"("id") ON DELETE CASCADE,
  "component_type" VARCHAR(50) NOT NULL,  -- 'form', 'database', 'workflow', 'virtual_schema'
  "component_id" INTEGER NOT NULL,        -- ID of the referenced component
  "configs" JSONB,                        -- Component-specific configurations
  "creation_date" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## API Endpoints

### Solutions

#### `POST /api/solutions`
Create a new solution (template or instance)

**Request Body:**
```json
{
  "user_id": 1,
  "name": "Mi CRM Personalizado",
  "description": "Sistema de gestión de clientes",
  "template_type": "crm",
  "is_template": false,
  "status": "draft",
  "icon": "users",
  "color": "bg-blue-500",
  "category": "Ventas",
  "configs": {
    "features": ["Dashboard", "Leads", "Reportes"]
  }
}
```

#### `GET /api/solutions`
Get all solutions with optional filters

**Query Parameters:**
- `user_id` - Filter by user ID
- `is_template` - Filter templates (true) or instances (false)
- `template_type` - Filter by template type
- `includeComponents` - Include solution components (true/false)

**Example:**
```
GET /api/solutions?user_id=1&is_template=false&includeComponents=true
```

#### `GET /api/solutions/:id`
Get a specific solution by ID

**Query Parameters:**
- `includeComponents` - Include solution components (true/false)

#### `PUT /api/solutions/:id`
Update a solution

**Request Body:**
```json
{
  "name": "Updated Name",
  "description": "Updated description",
  "status": "active"
}
```

#### `DELETE /api/solutions/:id`
Delete a solution (components are cascade deleted)

#### `POST /api/solutions/:id/instantiate`
Create a new solution instance from a template

**Request Body:**
```json
{
  "user_id": 1,
  "name": "Mi CRM 2024",
  "description": "CRM para mi empresa"
}
```

**Response:**
Returns the new solution instance with all components copied from the template.

### Solution Components

#### `POST /api/solution-components`
Add a component to a solution

**Request Body:**
```json
{
  "solution_id": 1,
  "component_type": "form",
  "component_id": 5,
  "configs": {
    "display_order": 1
  }
}
```

#### `GET /api/solution-components`
Get solution components

**Query Parameters:**
- `solution_id` - Filter by solution ID
- `component_type` - Filter by component type

#### `DELETE /api/solution-components?id=:id`
Remove a component from a solution

## How It Works

### 1. Template Creation (Admin/System)

Templates are predefined solutions stored in the database with `is_template = true`. They serve as blueprints for users to create their own instances.

```sql
-- Example: CRM Template
INSERT INTO "Solution" (
  "name", "description", "template_type", "is_template", 
  "icon", "color", "category", "status", "configs"
) VALUES (
  'CRM - Gestión de Clientes',
  'Sistema completo para gestionar leads, clientes y ventas',
  'crm',
  true,
  'users',
  'bg-blue-500',
  'Ventas',
  'active',
  '{"features": ["Dashboard de ventas", "Gestión de leads", "Seguimiento de clientes"]}'
);
```

### 2. Solution Instantiation (User)

When a user selects a template:

1. A new Solution record is created with `is_template = false` and `template_id` pointing to the template
2. All SolutionComponents from the template are copied to the new solution
3. The user can then customize by adding/removing components

**Example Flow:**
```javascript
// User clicks on "CRM" template
const response = await fetch('/api/solutions/1/instantiate', {
  method: 'POST',
  body: JSON.stringify({
    user_id: currentUserId,
    name: 'Mi CRM 2024',
    description: 'CRM para mi equipo de ventas'
  })
});

// Returns new solution with components
const newSolution = await response.json();
// { id: 15, name: 'Mi CRM 2024', template_id: 1, components: [...] }
```

### 3. Component Linking

Solutions don't duplicate forms/databases/workflows - they **reference** existing ones:

```javascript
// Link a form to the solution
await fetch('/api/solution-components', {
  method: 'POST',
  body: JSON.stringify({
    solution_id: 15,
    component_type: 'form',
    component_id: 42,  // Existing form ID
    configs: { display_order: 1 }
  })
});

// Link a database
await fetch('/api/solution-components', {
  method: 'POST',
  body: JSON.stringify({
    solution_id: 15,
    component_type: 'virtual_schema',
    component_id: 8,  // Existing database ID
    configs: { display_order: 2 }
  })
});

// Link a workflow
await fetch('/api/solution-components', {
  method: 'POST',
  body: JSON.stringify({
    solution_id: 15,
    component_type: 'workflow',
    component_id: 12,  // Existing workflow ID
    configs: { display_order: 3 }
  })
});
```

### 4. Data Flow Example: CRM Solution

**Scenario**: User creates a CRM solution instance

1. **Form Component**: "Lead Capture Form" (component_type: 'form', component_id: 42)
   - Collects lead information (name, email, company, phone)
   
2. **Database Component**: "CRM Database" (component_type: 'virtual_schema', component_id: 8)
   - Contains tables: Leads, Customers, Deals
   - Form submissions are stored here via DataConnection and FieldMapping
   
3. **Workflow Component**: "Lead Assignment Workflow" (component_type: 'workflow', component_id: 12)
   - Automatically assigns new leads to sales reps
   - Sends email notifications
   - Updates lead status

**Data Flow:**
```
Lead Form → Form Submission → 
Field Mapping (via DataConnection) → 
Business Data (stored in Virtual Schema) → 
Workflow Triggered → 
Actions Executed (emails, updates)
```

## Frontend Implementation

### Solutions Page (`/dashboard/solutions/page.tsx`)

The main solutions page displays:

1. **Templates Section**: Available solution templates users can instantiate
2. **My Solutions Section**: User's created solution instances
3. **Statistics**: Total solutions, active solutions, available templates

**Key Features:**
- Fetch templates with `is_template=true`
- Fetch user instances with `user_id={userId}&is_template=false`
- One-click template instantiation
- Search and filter solutions

### Solution Detail Page (`/dashboard/solutions/[id]/page.tsx`)

Shows:
- Solution metadata
- Connected components (forms, databases, workflows)
- Data from the solution (e.g., leads in a CRM, inventory items)
- Analytics and reports

## Use Cases

### 1. CRM Solution

**Components:**
- Form: "Contact Form", "Lead Form"
- Database: "CRM Database" with tables (Contacts, Leads, Deals, Activities)
- Workflows: "Lead Assignment", "Follow-up Reminders", "Deal Stage Progression"

**Data Flow:**
- Leads captured via form → Stored in Leads table → Workflow assigns to sales rep → Follow-up reminders triggered

### 2. Inventory Management Solution

**Components:**
- Form: "Product Entry Form", "Stock Adjustment Form"
- Database: "Inventory Database" with tables (Products, Stock, Movements, Suppliers)
- Workflows: "Low Stock Alerts", "Reorder Automation", "Stock Movement Tracking"

**Data Flow:**
- Product added via form → Stored in Products table → Stock level monitored → Workflow triggers reorder when low

### 3. Analytics Dashboard Solution

**Components:**
- Database: Multiple databases as data sources
- Workflows: "Data Aggregation", "Report Generation"

**Data Flow:**
- Multiple BusinessData sources → Aggregation workflow → Dashboard displays KPIs

## Seeding Templates

To seed the database with predefined templates, run:

```bash
psql -U your_user -d your_database -f supabase/seed-solution-templates.sql
```

Or through Supabase dashboard:
1. Go to SQL Editor
2. Open `seed-solution-templates.sql`
3. Run the script

## Benefits

1. **Reusability**: Templates can be instantiated multiple times
2. **Modularity**: Solutions compose existing components rather than duplicating them
3. **Flexibility**: Users can customize instances by adding/removing components
4. **Scalability**: New templates can be added without code changes
5. **Data Integration**: Components work together seamlessly through existing data connections
6. **Business Context**: Solutions provide business context to technical components

## Next Steps

1. **Enhanced Templates**: Create more sophisticated templates with pre-configured components
2. **Solution Marketplace**: Allow users to share and download solution templates
3. **Component Library**: Build reusable form/workflow/database components optimized for specific solutions
4. **Solution Analytics**: Track usage, performance, and ROI of solutions
5. **AI-Powered Recommendations**: Suggest components based on solution type and user behavior
