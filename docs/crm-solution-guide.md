# CRM Solution Implementation Guide

## Overview

This guide covers the complete CRM (Customer Relationship Management) solution built to showcase the platform's power in integrating forms, databases, workflows, and custom components into a cohesive business application.

The CRM solution demonstrates:
- **Forms Integration**: Capture leads and manage data through forms
- **Database Management**: Structured data storage with relationships
- **Visual Components**: Kanban boards, contact cards, activity timelines
- **Workflow Automation**: Auto-assignment and notifications
- **Drag-and-Drop Builder**: Customize your CRM dashboard

## Table of Contents

1. [Quick Start](#quick-start)
2. [Architecture](#architecture)
3. [Database Structure](#database-structure)
4. [Components](#components)
5. [Forms](#forms)
6. [Workflows](#workflows)
7. [Customization](#customization)
8. [Troubleshooting](#troubleshooting)

---

## Quick Start

### Prerequisites

- Platform instance running
- Access to Supabase/PostgreSQL database
- User account with appropriate permissions

### Installation

**Option 1: Run Complete Setup (Recommended)**

```bash
# Navigate to your project directory
cd /path/to/your/project

# Run the complete setup script
psql -U your_user -d your_database -f supabase/setup-crm-complete.sql
```

**Option 2: Via Supabase Dashboard**

1. Log into Supabase Dashboard
2. Navigate to SQL Editor
3. Open and run each script in order:
   - `seed-crm-solution.sql`
   - `seed-crm-forms.sql`
   - `seed-crm-solution-template.sql`
   - `seed-crm-workflows.sql`

**Option 3: Step-by-Step Manual Setup**

```bash
# 1. Create database structure
psql -U your_user -d your_database -f supabase/seed-crm-solution.sql

# 2. Create forms
psql -U your_user -d your_database -f supabase/seed-crm-forms.sql

# 3. Create solution template
psql -U your_user -d your_database -f supabase/seed-crm-solution-template.sql

# 4. Create workflows (optional)
psql -U your_user -d your_database -f supabase/seed-crm-workflows.sql
```

### Instantiate Your CRM

1. Navigate to `/dashboard/solutions`
2. Find "CRM - Sales Pipeline" template
3. Click "Use Template"
4. Give your CRM a name
5. Click "Create"
6. Access your CRM at `/solutions/{your-crm-id}`

---

## Architecture

### System Design

```
┌─────────────────────────────────────────────────────────────┐
│                     CRM Solution                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │    Forms     │  │   Database   │  │  Workflows   │    │
│  │              │  │              │  │              │    │
│  │ Lead Capture │──│  Contacts    │──│ Auto-Assign  │    │
│  │ Contact Form │  │  Leads       │  │ Notify       │    │
│  │ Deal Form    │──│  Deals       │──│ Follow-up    │    │
│  │ Activity Log │  │  Activities  │  │              │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
│         │                  │                  │            │
│         └──────────────────┴──────────────────┘            │
│                            │                               │
│                            ▼                               │
│              ┌──────────────────────────┐                 │
│              │   Visual Components      │                 │
│              │                          │                 │
│              │  • Kanban Board          │                 │
│              │  • Contact Cards         │                 │
│              │  • Activity Timeline     │                 │
│              │  • Deal Progress         │                 │
│              │  • Stat Cards            │                 │
│              └──────────────────────────┘                 │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

```
User Action (Form Submit)
  ↓
FormSubmission Created
  ↓
DataConnection + FieldMapping
  ↓
BusinessData Inserted (Leads table)
  ↓
Workflow Triggered (Lead Assignment)
  ↓
Actions Executed:
  - Update assigned_to field
  - Send email notification
  - Create follow-up activity
  ↓
UI Updates (Real-time via API)
  - Kanban board refreshes
  - Activity timeline updates
  - Stats cards recalculate
```

---

## Database Structure

### VirtualSchema: CRM Database

The CRM uses a single VirtualSchema (`template_type: 'crm'`) containing 4 tables:

### 1. Contacts Table

Stores customer and contact information.

**Fields:**
- `name` (text, required): Full name
- `email` (email, required): Email address
- `phone` (text): Phone number
- `company` (text): Company name
- `status` (dropdown): active | inactive | prospect
- `assigned_to` (text): Sales rep name
- `tags` (text): Comma-separated tags
- `notes` (textarea): Additional information
- `created_date` (date): Record creation date

**Use Cases:**
- Store customer information
- Track contact status
- Assign contacts to team members
- Search and filter contacts

### 2. Leads Table

Manages sales leads and prospects.

**Fields:**
- `name` (text, required): Lead name
- `email` (email, required): Contact email
- `phone` (text): Phone number
- `company` (text): Company name
- `source` (dropdown): website | referral | social | event | cold_call | other
- `status` (dropdown): new | contacted | qualified | unqualified | converted
- `score` (number): Lead quality score (0-100)
- `assigned_to` (text): Assigned sales rep
- `notes` (textarea): Qualification notes
- `created_date` (date): Lead capture date

**Use Cases:**
- Capture leads from forms
- Track lead source and quality
- Qualify leads before converting to deals
- Auto-assign to sales reps

### 3. Deals Table

Tracks sales opportunities and pipeline.

**Fields:**
- `name` (text, required): Deal name
- `contact_name` (text): Associated contact
- `value` (number, required): Deal value in USD
- `stage` (dropdown): lead | qualified | proposal | negotiation | closed_won | closed_lost
- `probability` (number): Win probability percentage (0-100)
- `expected_close_date` (date): Expected closing date
- `assigned_to` (text): Deal owner
- `notes` (textarea): Deal strategy and details
- `created_date` (date): Deal creation date

**Use Cases:**
- Manage sales pipeline
- Track deal progress through stages
- Forecast revenue
- Drag deals on Kanban board

### 4. Activities Table

Logs all customer interactions and activities.

**Fields:**
- `type` (dropdown): call | email | meeting | note | task
- `related_to` (text): Related contact or deal
- `description` (textarea, required): Activity details
- `date` (date, required): Activity date
- `assigned_to` (text): Team member
- `status` (dropdown): planned | completed | cancelled

**Use Cases:**
- Log customer interactions
- Track sales activities
- Schedule follow-ups
- Activity history timeline

---

## Components

The CRM solution includes 4 new reusable components:

### 1. Kanban Board

**Component ID:** `kanban-board`

**Description:** Drag-and-drop Kanban board for visualizing and managing deal pipeline.

**Features:**
- 6 stage columns: Lead, Qualified, Proposal, Negotiation, Closed Won, Closed Lost
- Drag deals between stages (updates database)
- Shows deal value, contact, probability
- Add new deals directly to any column
- Real-time updates

**Configuration:**
```typescript
{
  tableId: "deals_table_id",
  title: "Deal Pipeline",
  allowCreate: true,
  allowEdit: true,
  showValue: true,
  showProbability: true,
  columns: [
    { id: "lead", title: "Lead", stage: "lead", color: "bg-blue-500" },
    // ... more columns
  ]
}
```

**Usage in Builder:**
1. Drag "Kanban Board" from component palette
2. Configure `tableId` to point to Deals table
3. Customize columns if needed
4. Adjust size (recommended: 4 columns wide, 2 rows tall)

### 2. Contact Card List

**Component ID:** `contact-card-list`

**Description:** Grid or list view of contacts with search and CRUD operations.

**Features:**
- Grid or list view toggle
- Search by name, email, company, phone
- Add, edit, delete contacts
- Status badges
- Avatar initials
- Quick actions (email, phone)

**Configuration:**
```typescript
{
  tableId: "contacts_table_id",
  title: "Contacts",
  allowCreate: true,
  allowEdit: true,
  allowDelete: true,
  defaultView: "grid", // or "list"
  showSearch: true
}
```

### 3. Activity Timeline

**Component ID:** `activity-timeline`

**Description:** Chronological timeline of activities grouped by date.

**Features:**
- Groups activities by date (Today, Yesterday, etc.)
- Different icons for activity types
- Shows related contacts/deals
- Log new activities
- Status indicators
- Scrollable history

**Configuration:**
```typescript
{
  tableId: "activities_table_id",
  title: "Recent Activities",
  allowCreate: true,
  maxItems: 10,
  showRelatedTo: true,
  showAssignedTo: true
}
```

### 4. Deal Progress

**Component ID:** `deal-progress`

**Description:** Visual progress indicator for individual deals.

**Features:**
- Progress bar based on stage
- Deal details (value, probability, dates)
- Stage update dropdown
- Expected value calculation
- Assigned team member

**Configuration:**
```typescript
{
  dealId: 123, // specific deal, or
  tableId: "deals_table_id", // show selector
  title: "Deal Progress",
  showDetails: true,
  allowStageUpdate: true,
  showValue: true,
  showProbability: true
}
```

---

## Forms

### 1. Lead Capture Form

**Purpose:** Capture new leads from website or marketing campaigns.

**Fields:**
- Full Name (required)
- Email Address (required)
- Phone Number
- Company
- Lead Source (dropdown)
- Message / Notes (textarea)

**Integration:**
- Create DataConnection to Leads table
- Map form fields to database fields
- Trigger lead assignment workflow on submit

### 2. Contact Management Form

**Purpose:** Add or update contacts in the CRM.

**Fields:**
- Full Name (required)
- Email (required)
- Phone
- Company
- Status (dropdown)
- Assigned To
- Tags
- Notes

### 3. Deal / Opportunity Form

**Purpose:** Create or update sales opportunities.

**Fields:**
- Deal Name (required)
- Deal Value (required)
- Contact Name
- Stage (dropdown)
- Win Probability
- Expected Close Date
- Assigned To
- Notes

### 4. Activity Log Form

**Purpose:** Log customer interactions and activities.

**Fields:**
- Activity Type (dropdown: Call, Email, Meeting, Note, Task)
- Related To
- Description (required)
- Date (required)
- Assigned To
- Status (dropdown)

---

## Workflows

### 1. Lead Auto-Assignment Workflow

**Trigger:** When new lead is created (BusinessData insert on Leads table)

**Steps:**
1. **Check Lead Score** - Prioritize high-score leads (score > 70)
2. **Assign to Sales Rep** - Round-robin assignment, update status to "contacted"
3. **Notify Sales Rep** - Send email with lead details
4. **Schedule Follow-up** - Create activity task for next day

**Configuration:**
```sql
Trigger: business_data_insert on Leads table
Actions:
  - Condition: score > 70
  - Update: assigned_to, status
  - Email: to sales rep
  - Create: follow-up activity
```

### 2. Deal Stage Notifications Workflow

**Trigger:** When deal stage is updated

**Steps:**
1. **Check if Won** - Condition: stage = "closed_won"
2. **Celebrate Win** - Send celebration email to team
3. **Log Win Activity** - Create activity record for the win

**Configuration:**
```sql
Trigger: business_data_update on Deals table (field: stage)
Actions:
  - Condition: stage = "closed_won"
  - Email: to team
  - Create: win activity log
```

---

## Customization

### Customize Canvas Layout

1. Navigate to your CRM solution
2. Click "Edit Design" button
3. Drag components to rearrange
4. Resize components by adjusting grid size
5. Add new components from palette
6. Configure each component's settings
7. Save changes

### Add New Tables

```sql
-- Add custom table to CRM schema
INSERT INTO "VirtualTableSchema" (
  "virtual_schema_id",
  "name",
  "description"
) VALUES (
  your_crm_schema_id,
  'Custom Table',
  'Your custom table description'
);

-- Add fields
INSERT INTO "VirtualFieldSchema" (...) VALUES (...);
```

### Create Custom Workflows

1. Go to `/dashboard/workflows`
2. Click "Create Workflow"
3. Set trigger: BusinessData insert/update on CRM table
4. Add workflow steps
5. Link to your CRM solution via SolutionComponent

### Connect Forms to Tables

```sql
-- Create DataConnection
INSERT INTO "DataConnection" (
  "form_id",
  "virtual_table_schema_id"
) VALUES (
  your_form_id,
  your_table_id
);

-- Create FieldMappings
INSERT INTO "FieldMapping" (
  "data_connection_id",
  "form_field_id",
  "virtual_field_schema_id"
) VALUES (...);
```

---

## Troubleshooting

### Setup Script Fails

**Problem:** SQL script returns errors

**Solutions:**
1. Check database connection
2. Ensure you have proper permissions
3. Verify no conflicting data exists
4. Run scripts in correct order
5. Check PostgreSQL version compatibility

### Components Not Showing

**Problem:** CRM components don't render in solution

**Solutions:**
1. Verify `tableId` in component config
2. Check table has data
3. Refresh browser cache
4. Check browser console for errors
5. Verify imports in `app/solutions/[solutionId]/page.tsx`

### Kanban Drag Not Working

**Problem:** Can't drag deals between columns

**Solutions:**
1. Check BusinessData API permissions
2. Verify deal has `stage` field
3. Ensure `allowEdit` config is true
4. Check network tab for failed API calls
5. Verify drag-drop library is installed (`@hello-pangea/dnd`)

### Workflows Not Triggering

**Problem:** Workflows don't execute on data changes

**Solutions:**
1. Verify workflow `is_active = true`
2. Check trigger configuration matches table
3. Ensure workflow engine is running
4. Review workflow logs for errors
5. Test with manual trigger first

### Forms Not Submitting to Database

**Problem:** Form submits but data doesn't appear in tables

**Solutions:**
1. Check DataConnection exists
2. Verify FieldMappings are correct
3. Check field name matching (case-sensitive)
4. Review FormSubmission records
5. Check BusinessData API logs

---

## Best Practices

### Data Entry

1. **Use Forms**: Always use forms for data entry to ensure validation and trigger workflows
2. **Required Fields**: Keep name and email required on all customer-facing forms
3. **Lead Scoring**: Develop a consistent lead scoring methodology
4. **Activity Logging**: Log all customer interactions for full history

### Pipeline Management

1. **Stage Definitions**: Clearly define what each stage means
2. **Regular Updates**: Update deal stages promptly
3. **Probability Guidelines**: Use realistic probability percentages
4. **Expected Dates**: Always set expected close dates
5. **Deal Hygiene**: Archive or delete dead deals

### Team Collaboration

1. **Assignment**: Always assign records to team members
2. **Follow-ups**: Use activity tasks for scheduled follow-ups
3. **Notes**: Add detailed notes for context
4. **Tags**: Use consistent tagging for segmentation

### Performance

1. **Pagination**: For large datasets, implement pagination in components
2. **Filtering**: Use filters to reduce data loaded
3. **Archiving**: Archive old/closed records periodically
4. **Indexes**: Add database indexes on frequently queried fields

---

## Advanced Topics

### Multi-tenant Setup

If running CRM for multiple organizations:

1. Add `user_id` filters to all queries
2. Use Row Level Security (RLS) policies
3. Separate data by organization
4. Customize workflows per tenant

### Email Integration

To enable workflow emails:

1. Configure SMTP settings in environment variables
2. Update workflow email templates
3. Test email delivery
4. Set up bounce handling
5. Monitor email logs

### Analytics & Reporting

Build custom analytics:

1. Create aggregation queries
2. Add chart components to canvas
3. Build custom reports
4. Export data for external analysis
5. Set up scheduled reports

### Mobile Optimization

For mobile CRM access:

1. Use responsive component sizing
2. Test on mobile devices
3. Optimize for touch interactions
4. Consider mobile-first workflows
5. Add offline support

---

## Support & Resources

### Documentation
- Platform Documentation: `/docs`
- Solutions System: `docs/solutions-system.md`
- Workflow Builder: `docs/workflow-builder.md`
- Database Builder: `docs/database-builder.md`

### Example Queries

```sql
-- Get all active leads assigned to user
SELECT * FROM "BusinessData"
WHERE virtual_table_schema_id = leads_table_id
AND data_json->>'status' = 'new'
AND data_json->>'assigned_to' = 'John Doe';

-- Calculate total deal value by stage
SELECT 
  data_json->>'stage' as stage,
  SUM((data_json->>'value')::numeric) as total_value,
  COUNT(*) as deal_count
FROM "BusinessData"
WHERE virtual_table_schema_id = deals_table_id
GROUP BY data_json->>'stage';

-- Activity count by type in last 30 days
SELECT 
  data_json->>'type' as activity_type,
  COUNT(*) as count
FROM "BusinessData"
WHERE virtual_table_schema_id = activities_table_id
AND (data_json->>'date')::date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY data_json->>'type';
```

---

## Conclusion

The CRM solution demonstrates the platform's capability to integrate multiple features into a cohesive business application. By combining forms, databases, workflows, and custom components, users can build powerful solutions tailored to their specific needs.

This CRM serves as a reference implementation for:
- Building complex solutions
- Creating reusable components
- Integrating multiple platform features
- Automating business processes
- Designing intuitive interfaces

Feel free to extend this CRM with additional features, customize it for your use case, or use it as inspiration for building other solutions!

---

**Version:** 1.0  
**Last Updated:** November 2025  
**Maintained By:** Platform Team

