# 👥 User Migration Guide - Old Users to Supabase Auth

## 🎯 Choose Your Migration Strategy

### Quick Decision Tree:

```
Are you in development/testing with no real user data?
├─ YES → Use OPTION A (Clean Slate)
└─ NO → Continue...
    │
    Do you have only one real user (yourself)?
    ├─ YES → Use OPTION B (Migrate to Primary User)
    └─ NO → Continue...
        │
        Do you have multiple users but can manually map them?
        ├─ YES → Use OPTION C (Manual Mapping)
        └─ NO → Use OPTION D (Advanced - Contact Support)
```

---

## 📋 Option A: Clean Slate (Recommended for Development)

**Use When:**
- You're in development/testing phase
- All existing data is test data
- You're okay starting fresh
- Fastest and simplest approach

**What It Does:**
- Deletes all forms, workflows, databases, solutions
- Removes old user records
- Keeps only Supabase Auth users
- Fresh start with proper UUIDs

**Steps:**

1. **Go to Supabase Dashboard** → SQL Editor
2. **Open file**: `supabase/migrations/02_migrate_existing_users.sql`
3. **Scroll to OPTION A section**
4. **Uncomment the BEGIN...COMMIT block** (remove the `/*` and `*/`)
5. **Run the query**
6. **Test**: Login with OAuth and create new data

**Result:** Clean database, ready for production use! ✨

---

## 📋 Option B: Migrate Data to Primary User (You)

**Use When:**
- You're the only real user
- You want to keep existing data
- All data should be assigned to your OAuth account

**What It Does:**
- Keeps all existing forms, workflows, databases
- Assigns everything to your Supabase Auth UUID
- Preserves all data

**Steps:**

1. **Find Your UUID:**
   - Go to Supabase Dashboard → SQL Editor
   - Run this query:
   ```sql
   SELECT id, email, raw_user_meta_data->>'name' as name
   FROM auth.users
   ORDER BY created_at;
   ```
   - Copy your UUID (looks like `5f2d2d88-1bbe-4f71-bb7e-aee1bdaf27b8`)

2. **Run Migration:**
   - Open file: `supabase/migrations/02_migrate_existing_users.sql`
   - Scroll to **OPTION B section**
   - Find the line: `target_uuid TEXT := 'YOUR_UUID_HERE';`
   - Replace `YOUR_UUID_HERE` with your actual UUID
   - **Uncomment the block** (remove `/*` and `*/`)
   - **Run the query**

3. **Verify:**
   ```sql
   SELECT user_id, COUNT(*) as count 
   FROM "Form" 
   GROUP BY user_id;
   ```
   Should show only your UUID

4. **Test**: Login and verify all your data is visible

**Result:** All data assigned to you! 🎉

---

## 📋 Option C: Manual Mapping (Multiple Users)

**Use When:**
- You have multiple real users
- You can identify old_id → new_uuid mappings
- Each user has valuable data to preserve

**What It Does:**
- Maps old integer IDs (1, 2, 3) to new UUIDs
- Preserves data for each user
- Updates all references

**Steps:**

1. **Identify Old Users:**
   ```sql
   SELECT id, email, name FROM "User";
   ```
   Note: `id` values (might be '1', '2', '3')

2. **Identify New Auth Users:**
   ```sql
   SELECT id, email FROM auth.users;
   ```
   Note: `id` values (UUIDs)

3. **Create Mapping:**
   - Open file: `supabase/migrations/02_migrate_existing_users.sql`
   - Scroll to **OPTION C section**
   - **Uncomment the entire block**
   - Edit the `INSERT INTO user_id_mapping` section:
   ```sql
   INSERT INTO user_id_mapping (old_id, new_id, email, name) VALUES
     ('1', '5f2d2d88-...actual-uuid...', 'user1@example.com', 'User 1'),
     ('2', '6b9cbd49-...actual-uuid...', 'user2@example.com', 'User 2');
   ```

4. **Run Migration:**
   - Select and run the entire OPTION C block
   - Check the verification query at the end

5. **Test**: Each user should login and see only their data

**Result:** All users migrated with their data intact! 🎊

---

## 📋 Option D: Advanced - Programmatic Migration

**Use When:**
- You have many users
- Users need to keep their old passwords
- You want to create Supabase Auth accounts programmatically

**What It Does:**
- Uses Supabase Admin API to create auth accounts
- Requires Node.js script (cannot be done in SQL for security)

**Note:** This is complex and typically not needed for small applications.

If you need this, let me know and I'll create a migration script!

---

## 🧪 After Migration - Testing Checklist

Run these tests after migration:

### Test 1: Login
- [ ] Can login with OAuth (Google)
- [ ] No errors in console
- [ ] Redirects to dashboard successfully

### Test 2: Data Visibility
- [ ] See your forms in `/dashboard/forms`
- [ ] See your databases in `/dashboard/databases`
- [ ] See your workflows in `/dashboard/workflows`
- [ ] Data counts match what you expect

### Test 3: Create New Data
- [ ] Create a new form
- [ ] Create a new database
- [ ] Create a new workflow
- [ ] All save successfully

### Test 4: API Verification
Open browser DevTools → Network tab:
- [ ] GET `/api/forms` returns only your forms
- [ ] GET `/api/workflows` returns only your workflows
- [ ] All responses have correct `user_id`

### Test 5: Data Isolation (If Multiple Users)
- [ ] Login as User A → see User A's data
- [ ] Login as User B (different browser/incognito) → see User B's data
- [ ] User B does NOT see User A's data

---

## 🔍 Verification Queries

After migration, run these to verify everything worked:

### Check User Mapping:
```sql
-- Should show all users have valid auth.users IDs
SELECT 
  f.user_id,
  COUNT(*) as form_count,
  u.email
FROM "Form" f
LEFT JOIN auth.users u ON u.id::text = f.user_id
GROUP BY f.user_id, u.email;
```

### Check for Orphaned Data:
```sql
-- Should return 0 for all
SELECT 'Orphaned Forms' as check_name, COUNT(*) 
FROM "Form" 
WHERE user_id NOT IN (SELECT id::text FROM auth.users)

UNION ALL

SELECT 'Orphaned Workflows', COUNT(*) 
FROM "Workflow" 
WHERE user_id NOT IN (SELECT id::text FROM auth.users);
```

### Summary Report:
```sql
SELECT 
  'Auth Users' as metric,
  COUNT(*) as count
FROM auth.users

UNION ALL

SELECT 'Total Forms', COUNT(*) FROM "Form"
UNION ALL
SELECT 'Total Workflows', COUNT(*) FROM "Workflow"
UNION ALL
SELECT 'Total Databases', COUNT(*) FROM "VirtualSchema";
```

---

## 🚨 Troubleshooting

### "Cannot see my data after migration"

**Check 1:** Verify your user_id matches your auth user ID
```sql
-- Get your auth ID
SELECT id FROM auth.users WHERE email = 'your@email.com';

-- Check your data
SELECT user_id, COUNT(*) FROM "Form" GROUP BY user_id;
```

**Fix:** If they don't match, run Option B again with correct UUID.

### "RLS policy violation" error

**Cause:** Data has user_id that doesn't exist in auth.users

**Fix:** 
```sql
-- Find orphaned data
SELECT DISTINCT user_id FROM "Form"
WHERE user_id NOT IN (SELECT id::text FROM auth.users);

-- Delete or reassign it
DELETE FROM "Form" 
WHERE user_id NOT IN (SELECT id::text FROM auth.users);
```

### "Foreign key constraint" error

**Cause:** Trying to update User.id but child records exist

**Fix:** The migration script handles this by updating child records first. Run the full block, not individual lines.

---

## 📊 My Recommendation

Based on your situation (just logged in with OAuth and seeing old user's data):

### **Use Option B - Migrate to Primary User**

Since you're likely the only real user and want to keep the databases you created, this is perfect:

1. Find your OAuth UUID
2. Assign all existing data to your UUID
3. Test and verify
4. Done! 🎉

**Time:** 5 minutes  
**Risk:** Low (can rollback)  
**Result:** Clean, secure, all your data preserved

---

## 💡 Quick Start (Option B)

```sql
-- Step 1: Get your UUID
SELECT id, email FROM auth.users;
-- Copy the UUID

-- Step 2: Run migration (replace YOUR_UUID)
DO $$
DECLARE
  target_uuid TEXT := 'YOUR_UUID_HERE';
BEGIN
  UPDATE "User" SET id = target_uuid WHERE id != target_uuid;
  UPDATE "Form" SET user_id = target_uuid WHERE user_id != target_uuid;
  UPDATE "VirtualSchema" SET user_id = target_uuid WHERE user_id != target_uuid;
  UPDATE "Workflow" SET user_id = target_uuid WHERE user_id != target_uuid;
  UPDATE "Solution" SET user_id = target_uuid WHERE user_id != target_uuid;
  UPDATE "BusinessData" SET user_id = target_uuid WHERE user_id != target_uuid;
END $$;

-- Step 3: Verify
SELECT user_id, COUNT(*) FROM "Form" GROUP BY user_id;
```

Done! ✅

---

## 📚 Related Files

- **Migration Script**: `supabase/migrations/02_migrate_existing_users.sql`
- **RLS Policies**: `supabase/migrations/add_rls_policies.sql`
- **Summary**: `USER_DATA_ISOLATION_SUMMARY.md`
- **Main Guide**: `MIGRATION_GUIDE.md`

