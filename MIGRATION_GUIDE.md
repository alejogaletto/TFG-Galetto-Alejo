# 🔄 Database Migration Guide - User ID Type Change

## ⚠️ Important: Run Migrations in Order

You have **TWO migrations** to run. They **MUST** be run in this specific order:

### Migration 1️⃣: Change user_id Type (MUST RUN FIRST)
### Migration 2️⃣: Apply RLS Policies (MUST RUN SECOND)

---

## Why This Migration is Needed

### The Problem:
Your database was originally designed with:
- `User.id` as `INTEGER` (auto-increment: 1, 2, 3, etc.)
- `user_id` columns as `INTEGER` in all tables

But Supabase Auth uses:
- User IDs as `UUID` (like `5f2d2d88-1bbe-4f71-bb7e-aee1bdaf27b8`)

This causes a **type mismatch** when trying to compare them in RLS policies.

### The Solution:
Change all `user_id` columns from `INTEGER` to `VARCHAR(255)` to store UUIDs.

---

## 🚀 Step-by-Step Migration Instructions

### Step 1: Backup Your Data (RECOMMENDED)

Before running any migrations, it's good practice to backup:

1. Go to **Supabase Dashboard** → Your Project
2. Click **Database** → **Backups**
3. Click **Create Backup** (optional but recommended)

### Step 2: Run Migration 1 - Change Column Types

1. **Open Supabase Dashboard** → SQL Editor
2. **Open the file**: `supabase/migrations/01_migrate_user_id_to_text.sql`
3. **Copy the entire contents**
4. **Paste into SQL Editor**
5. **Click RUN** (or Cmd/Ctrl + Enter)

**Expected Result:**
```
Success. No rows returned
```

**What This Does:**
- Changes `User.id` from `INTEGER` to `VARCHAR(255)`
- Changes `user_id` in Form, VirtualSchema, Workflow, Solution, BusinessData to `VARCHAR(255)`
- Recreates foreign key constraints
- Adds performance indexes

⚠️ **IMPORTANT**: If you have existing integer user IDs (1, 2, 3), they will be converted to strings ("1", "2", "3"). You'll need to update these to match Supabase Auth UUIDs.

### Step 3: Update Existing Data (If Needed)

If you have existing users with integer IDs, you need to map them to their Supabase Auth UUIDs.

#### Option A: You're starting fresh (no real user data)
```sql
-- Delete all test data
DELETE FROM "FormSubmission";
DELETE FROM "BusinessData";
DELETE FROM "FormField";
DELETE FROM "Form";
DELETE FROM "VirtualFieldSchema";
DELETE FROM "VirtualTableSchema";
DELETE FROM "VirtualSchema";
DELETE FROM "WorkflowStep";
DELETE FROM "WorkflowTrigger";
DELETE FROM "Workflow";
DELETE FROM "SolutionComponent";
DELETE FROM "Solution";
DELETE FROM "User" WHERE id NOT IN (
  SELECT id FROM auth.users
);
```

#### Option B: You have real data to preserve
You'll need to manually update `user_id` values to match Supabase Auth UUIDs:

```sql
-- Example: Update user_id for a specific user
-- Replace 'OLD_ID' with current id (e.g., '1', '2')
-- Replace 'NEW_UUID' with the Supabase Auth UUID

UPDATE "User" SET id = 'NEW_UUID' WHERE id = 'OLD_ID';
UPDATE "Form" SET user_id = 'NEW_UUID' WHERE user_id = 'OLD_ID';
UPDATE "VirtualSchema" SET user_id = 'NEW_UUID' WHERE user_id = 'OLD_ID';
UPDATE "Workflow" SET user_id = 'NEW_UUID' WHERE user_id = 'OLD_ID';
UPDATE "Solution" SET user_id = 'NEW_UUID' WHERE user_id = 'OLD_ID';
UPDATE "BusinessData" SET user_id = 'NEW_UUID' WHERE user_id = 'OLD_ID';
```

To find Supabase Auth UUIDs:
```sql
SELECT id, email FROM auth.users;
```

### Step 4: Verify Migration 1 Succeeded

Run this query to verify column types changed:

```sql
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND column_name IN ('id', 'user_id')
  AND table_name IN ('User', 'Form', 'VirtualSchema', 'Workflow', 'Solution', 'BusinessData')
ORDER BY table_name, column_name;
```

**Expected Result:**
All `id` and `user_id` columns should show `character varying` or `varchar`.

### Step 5: Run Migration 2 - Apply RLS Policies

1. **Still in SQL Editor**
2. **Open the file**: `supabase/migrations/add_rls_policies.sql`
3. **Copy the entire contents**
4. **Paste into SQL Editor**
5. **Click RUN**

**Expected Result:**
```
Success. No rows returned
```

**What This Does:**
- Enables Row Level Security on all main tables
- Creates policies so users can only access their own data
- Sets up policies for child tables (inherit through parent)
- Special policy for FormSubmission (public insert, owner read)

### Step 6: Verify RLS is Active

```sql
-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('Form', 'VirtualSchema', 'Workflow', 'Solution', 'BusinessData');

-- Check policies were created
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, cmd;
```

**Expected Result:**
- All 5 tables should have `rowsecurity = true`
- You should see multiple policies (view, insert, update, delete) for each table

---

## 🧪 Testing After Migration

### Test 1: Login with OAuth User

1. Login with your Google account
2. Go to **Dashboard**
3. Check if you see your forms, workflows, databases
4. Create a new form - verify it saves correctly

### Test 2: Verify Data Isolation

1. **User A**: Login with one Google account
   - Note what data you see (forms, databases, etc.)
   
2. **User B**: Open incognito window, login with different Google account
   - You should see EMPTY lists or different data
   - You should NOT see User A's data

3. **API Test**: Open DevTools → Network tab
   - Call `GET /api/forms`
   - Verify response only contains current user's forms
   - Check all items have `user_id` matching your auth user ID

### Test 3: Check Console for Errors

Open browser console (F12) and look for:
- ❌ RLS policy errors
- ❌ Type mismatch errors
- ❌ Permission denied errors

If you see any, report them!

---

## 🔥 Troubleshooting

### Error: "operator does not exist: integer = uuid"

**Cause**: You tried to run Migration 2 before Migration 1.

**Fix**: Run Migration 1 first, then Migration 2.

### Error: "relation does not exist"

**Cause**: Table names might be different in your database.

**Fix**: Check your actual table names:
```sql
SELECT tablename FROM pg_tables WHERE schemaname = 'public';
```

Update migration file if needed.

### Error: "foreign key constraint fails"

**Cause**: You have data referencing user IDs that don't exist in User table.

**Fix**: Clean up orphaned data:
```sql
-- Find orphaned records
SELECT 'Form' as table_name, COUNT(*) 
FROM "Form" 
WHERE user_id NOT IN (SELECT id FROM "User");

-- Delete orphaned records (if safe to do)
DELETE FROM "Form" WHERE user_id NOT IN (SELECT id FROM "User");
```

Repeat for other tables.

### RLS Blocks All Access

**Cause**: Your application isn't passing authentication properly.

**Fix**: 
1. Check `lib/auth-helpers.ts` is being used
2. Verify `createServerClient()` is used in API routes
3. Check browser has valid session:
   ```javascript
   const { data: { session } } = await supabase.auth.getSession()
   console.log('Session:', session)
   ```

### Data Disappeared After Migration

**Cause**: Your `user_id` values don't match Supabase Auth UUIDs.

**Fix**: 
1. Check what user_ids exist:
   ```sql
   SELECT DISTINCT user_id FROM "Form";
   ```
   
2. Check Supabase Auth users:
   ```sql
   SELECT id, email FROM auth.users;
   ```
   
3. Update mismatched IDs (see Step 3 above)

---

## 🎯 Success Checklist

After completing all steps, verify:

- [ ] Migration 1 ran without errors
- [ ] Migration 2 ran without errors
- [ ] All tables have `rowsecurity = true`
- [ ] Multiple policies exist for each table
- [ ] Can login with OAuth
- [ ] Can see your own data in dashboard
- [ ] Cannot see other users' data
- [ ] Can create new forms/workflows/databases
- [ ] No console errors in browser
- [ ] No RLS errors in Supabase logs

---

## 📚 Files Reference

- **Migration 1**: `supabase/migrations/01_migrate_user_id_to_text.sql`
- **Migration 2**: `supabase/migrations/add_rls_policies.sql`
- **Auth Helpers**: `lib/auth-helpers.ts`
- **Summary**: `USER_DATA_ISOLATION_SUMMARY.md`

---

## 🆘 Need Help?

If you encounter issues:

1. **Check Supabase Logs**: Dashboard → Logs → Search for errors
2. **Check Browser Console**: F12 → Console tab
3. **Verify Auth**: Make sure you're logged in with Supabase Auth
4. **Check User Table**: Make sure your user exists with correct UUID

---

## ⏪ Rollback (Emergency Only)

If something goes terribly wrong, you can rollback:

### Disable RLS (Temporary):
```sql
ALTER TABLE "Form" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "VirtualSchema" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Workflow" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Solution" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "BusinessData" DISABLE ROW LEVEL SECURITY;
```

⚠️ **WARNING**: This removes all security! Only use for debugging.

### Drop Policies:
```sql
DROP POLICY IF EXISTS "Users can view own forms" ON "Form";
DROP POLICY IF EXISTS "Users can insert own forms" ON "Form";
DROP POLICY IF EXISTS "Users can update own forms" ON "Form";
DROP POLICY IF EXISTS "Users can delete own forms" ON "Form";
-- Repeat for other tables...
```

### Restore from Backup:
If you created a backup in Step 1, restore it from Dashboard → Database → Backups.

---

## 🎉 Migration Complete!

Once everything is working:
- ✅ Users are isolated from each other
- ✅ Data is secure at database level
- ✅ Application filters by user ID
- ✅ Ready for production!

