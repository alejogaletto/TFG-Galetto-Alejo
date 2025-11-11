# CRM Solution Fix Guide

## Problem Summary
Solution 22 (CRM - Sales Pipeline) is showing stat cards with data, but the Deal Pipeline table is empty. This is because the data-table component configuration needs proper setup with the correct table IDs and column configurations.

## Solution
Run the **master fix script** that will:
1. ✅ Get correct table IDs from the CRM template
2. ✅ Create sample data (5 contacts, 5 leads, 6 deals, 10 activities)
3. ✅ Fix canvas configuration with proper data-table setup
4. ✅ Verify everything is working

## How to Fix

### Step 1: Run the Master Script

Open **Supabase Dashboard** → **SQL Editor** → **New query**

Copy and paste the contents of: **`supabase/crm-complete-fix.sql`**

Click **Run**

### Step 2: Verify Success

You should see output like:
```
✓ Solution 22 exists
✓ Contacts Table ID: XX
✓ Leads Table ID: XX
✓ Deals Table ID: XX
✓ Activities Table ID: XX
✓ Created 5 contacts
✓ Created 5 leads
✓ Created 6 deals ($547,000 total pipeline)
✓ Created 10 activities
✓ Canvas updated with 7 components

📇 Contacts: 5 records
🎯 Leads: 5 records
💼 Deals: 6 records
📊 Activities: 10 records

✅ CRM FIX COMPLETED!
```

### Step 3: Refresh Browser

1. Go back to your application
2. **Hard refresh** your browser (Cmd/Ctrl + Shift + R)
3. Navigate to Solution 22
4. You should now see:
   - **4 Stat Cards** showing: 5 contacts, 5 leads, 6 deals, 10 activities
   - **Deal Pipeline Table** with 6 deals showing:
     - TechCorp Enterprise Deal ($85,000)
     - InnovaTech Starter Package ($12,000)
     - Global Inc Multi-Year ($250,000)
     - Digital Wave Solution ($45,000)
     - Acme Corp Expansion ($35,000 - Closed Won)
     - FutureTech AI Integration ($120,000)
   - **Recent Activities** timeline with 10 activities
   - **Contacts** grid with 5 contacts

## Troubleshooting

### If Deal Pipeline is Still Empty

**Option 1: Run Diagnostic Script**
Run `supabase/diagnose-crm-solution.sql` to see current state and identify issues.

**Option 2: Check Browser Console**
Open Developer Tools (F12) → Console tab → Look for any errors

**Option 3: Verify RLS Policies**
The script assumes RLS policies allow the user to read template data. If you see "No data" but the script says it created records, RLS might be blocking access.

### If Components Show as Generic Placeholders in Edit Mode

This is expected! The custom CRM components (activity-timeline, contact-card-list) are only visible in **view mode**, not edit mode. They've been added to the builder's component palette under "Datos" and "Métricas" categories.

## Files Created

### Scripts
1. **`crm-complete-fix.sql`** ⭐ **RUN THIS ONE** - Master script that fixes everything
2. **`diagnose-crm-solution.sql`** - Diagnostic script to check current state
3. **`fix-crm-data-display.sql`** - Alternative fix script (same as master)

### Previous Scripts (for reference)
- `seed-crm-solution.sql` - Creates CRM database schema
- `seed-crm-forms.sql` - Creates CRM forms
- `seed-crm-solution-template.sql` - Creates solution template
- `seed-crm-workflows.sql` - Creates workflows
- `setup-crm-dashboard.sql` - Complete initial setup
- `fix-crm-rls-policies.sql` - RLS policy fixes
- `fix-crm-insert-policy.sql` - INSERT policy fixes

## What the Fix Does Technically

### Data Table Configuration
The fix ensures the data-table component has:
- Correct `tableId` pointing to the Deals virtual table
- Proper `columns` array with field mappings:
  - `name` → Deal Name
  - `value` → Value ($) with currency formatting
  - `stage` → Stage with dropdown select
  - `probability` → Probability %
  - `contact_name` → Contact
  - `expected_close_date` → Expected Close with date formatting

### Sample Data Structure
Each deal record has this structure:
```json
{
  "name": "TechCorp Enterprise Deal",
  "contact_name": "John Anderson",
  "value": 85000,
  "stage": "proposal",
  "probability": 70,
  "expected_close_date": "2025-11-21",
  "assigned_to": "Sarah Johnson"
}
```

The data-table component reads these fields from `BusinessData.data_json` and displays them according to the column configuration.

## Next Steps

After confirming the fix works:
1. ✅ Deal Pipeline shows data
2. ✅ All components are interactive
3. ✅ You can add/edit/delete records
4. ✅ CRM is fully functional

You can now use this as a showcase for your platform's capabilities!

