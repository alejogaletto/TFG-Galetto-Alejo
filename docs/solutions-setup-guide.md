# Solutions System - Setup Guide

This guide will help you set up the Solutions system in your application.

## Prerequisites

- Database access (PostgreSQL via Supabase)
- Node.js and npm installed
- Application running locally or deployed

## Step 1: Database Migration

### Option A: Via Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy and paste the contents of `supabase/schema.sql` (the Solution and SolutionComponent tables)
5. Run the migration
6. Verify tables were created in the **Table Editor**

### Option B: Via psql Command Line

```bash
# Connect to your database
psql -U your_user -d your_database

# Run the schema additions
\i supabase/schema.sql

# Verify tables
\dt

# You should see:
# - Solution
# - SolutionComponent
```

### Verify Migration

Check that the following tables exist:
- `Solution`
- `SolutionComponent`

Check that indexes were created:
- `idx_solution_user_id`
- `idx_solution_template_type`
- `idx_solution_is_template`
- `idx_solution_component_solution_id`
- `idx_solution_component_type_id`

## Step 2: Seed Template Data

Seed the database with predefined solution templates:

### Via Supabase Dashboard

1. Go to **SQL Editor**
2. Create a new query
3. Copy and paste the contents of `supabase/seed-solution-templates.sql`
4. Run the script
5. Go to **Table Editor** → **Solution** table
6. Verify you see 6 template records with `is_template = true`:
   - CRM - Gestión de Clientes
   - Control de Inventario
   - Dashboard Analítico
   - Mesa de Ayuda
   - E-commerce Dashboard
   - Gestión de Proyectos

### Via Command Line

```bash
psql -U your_user -d your_database -f supabase/seed-solution-templates.sql
```

## Step 3: Verify API Endpoints

Test that the API endpoints are working:

### Test 1: Get Templates

```bash
curl http://localhost:3000/api/solutions?is_template=true
```

Expected: JSON array with 6 template solutions

### Test 2: Get User Solutions

```bash
curl http://localhost:3000/api/solutions?user_id=1&is_template=false
```

Expected: JSON array (may be empty if no user solutions exist yet)

### Test 3: Create a Solution

```bash
curl -X POST http://localhost:3000/api/solutions \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "name": "Test Solution",
    "description": "Testing solution creation",
    "is_template": false,
    "status": "draft"
  }'
```

Expected: JSON object with the created solution

## Step 4: Test the Frontend

1. Start your development server:
```bash
npm run dev
```

2. Navigate to `http://localhost:3000/dashboard/solutions`

3. You should see:
   - Statistics cards showing templates and solutions counts
   - "Nueva Solución" button
   - List of available templates (if you click "Nueva Solución" → "Plantillas" tab)
   - Your solutions (if any)

4. Test creating a solution:
   - Click "Nueva Solución"
   - Go to "Plantillas" tab
   - Click on any template (e.g., "CRM - Gestión de Clientes")
   - It should create a new solution instance and redirect you to `/dashboard/solutions/{id}`

## Step 5: Link Components to Solutions

Once you have solutions created, you can link existing forms, databases, and workflows:

```javascript
// Example: Link a form to a solution
const response = await fetch('/api/solution-components', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    solution_id: 1,
    component_type: 'form',
    component_id: 5,  // ID of an existing form
    configs: { display_order: 1 }
  })
});
```

## Step 6: Using the Solution Builder

The solution builder provides a visual interface for creating custom dashboards.

### Creating a Solution from Scratch

1. Go to `/dashboard/solutions`
2. Click "Nueva Solución"
3. Select "Desde Cero" tab
4. Enter name and description
5. Click "Crear Solución"
6. You'll be redirected to the advanced builder

### Using the Advanced Builder

**Drag and Drop Components:**
1. Browse components in the left sidebar
2. Drag any component to the canvas area
3. Components appear in the canvas immediately

**Configure Components:**
1. Click on any component in the canvas
2. Configuration panel appears on the right
3. Set data sources, titles, colors, etc.
4. Changes apply in real-time

**Undo/Redo:**
1. **Undo (Deshacer)**: Click to revert the last change
   - Removes the last added component
   - Reverts configuration changes
   - Restores deleted components
   - Button is disabled when no history available

2. **Redo (Rehacer)**: Click to restore undone changes
   - Restores the last undone action
   - Button is disabled when no future history

**Example Workflow:**
```
1. Drag "Stat Card" → History saved
2. Configure title and data source → History updated
3. Add "Data Table" → History saved
4. Oops! Wrong component → Click "Deshacer"
5. Table removed, back to just the stat card
6. Changed your mind? → Click "Rehacer"
7. Table comes back
```

**Save Your Work:**
1. Click "Guardar" button
2. Solution configuration is saved
3. Can be edited later

### Using Template-Based Solutions

1. Click "Nueva Solución"
2. Select "Plantillas" tab
3. Click on a template (e.g., "CRM")
4. You'll be redirected to the setup wizard
5. Follow the wizard steps:
   - Select modules
   - Choose forms
   - Configure databases
   - Set up workflows
6. Click "Crear Solución" to finish

## Common Issues

### Issue 1: "Solution table does not exist"

**Cause**: Migration not run

**Solution**: Run Step 1 again and verify tables were created

### Issue 2: "No templates showing in the UI"

**Cause**: Templates not seeded

**Solution**: Run Step 2 to seed template data

### Issue 3: "Cannot read user_id"

**Cause**: User not logged in or user data not in localStorage

**Solution**: Make sure you're logged in. The Solutions page tries to get user from `localStorage.getItem('user')`. You may need to adjust this based on your authentication implementation.

### Issue 4: "Templates showing but can't create instances"

**Cause**: API endpoint `/api/solutions/[id]/instantiate` not accessible

**Solution**: 
1. Check Next.js file structure: `app/api/solutions/[id]/instantiate/route.ts` exists
2. Restart your dev server
3. Check browser console for errors

## Verification Checklist

- [ ] Database tables created (Solution, SolutionComponent)
- [ ] Indexes created
- [ ] Template data seeded (6 templates)
- [ ] API endpoints responding
- [ ] `/dashboard/solutions` page loads
- [ ] Can see templates in the UI
- [ ] Can create a solution from a template
- [ ] Can create a solution from scratch
- [ ] Solution appears in "Mis Soluciones" list

## Next Steps

Once the basic setup is complete:

1. **Create Forms, Databases, Workflows** that can be linked to solutions
2. **Link Components** to your solutions via `POST /api/solution-components`
3. **Customize Solution Detail Pages** to display relevant data from linked components
4. **Add More Templates** by inserting records into the Solution table with `is_template = true`
5. **Implement Solution Analytics** to track usage and performance

## Additional Resources

- [Solutions System Documentation](./solutions-system.md)
- [API Endpoints Documentation](./api-endpoints.md)
- [Database Schema Documentation](./database-schema.md)

## Support

If you encounter issues:

1. Check the browser console for errors
2. Check the server logs for API errors
3. Verify database connections
4. Check that all files are in the correct locations
5. Ensure all dependencies are installed (`npm install`)

## Development Tips

### Testing Template Creation

You can manually create templates in the database:

```sql
INSERT INTO "Solution" (
  "name", "description", "template_type", "is_template", 
  "icon", "color", "category", "status", "configs"
) VALUES (
  'My Custom Template',
  'A custom template for testing',
  'custom',
  true,
  'package',
  'bg-teal-500',
  'Custom',
  'active',
  '{"features": ["Feature 1", "Feature 2"]}'
);
```

### Testing Component Linking

```sql
-- Link a form to a solution
INSERT INTO "SolutionComponent" (
  "solution_id", "component_type", "component_id", "configs"
) VALUES (
  1,  -- Solution ID
  'form',  -- Component type
  5,  -- Form ID
  '{"display_order": 1}'
);
```

### Checking Solution Data

```sql
-- Get all solutions with their components
SELECT 
  s.id, 
  s.name, 
  s.is_template,
  sc.component_type,
  sc.component_id
FROM "Solution" s
LEFT JOIN "SolutionComponent" sc ON s.id = sc.solution_id
ORDER BY s.creation_date DESC;
```
