# How to Run the Admin Database Migration

The admin system requires three tables to be created in your Supabase database. Follow these steps:

## 🚀 Method 1: Supabase Dashboard (Easiest - Recommended)

### Step 1: Open Supabase Dashboard
1. Go to https://app.supabase.com
2. Log in with your account
3. Click on your project name (prop-dashboard-pro or similar)

### Step 2: Go to SQL Editor
1. Look at the left sidebar
2. Click **SQL Editor** (or find it under "Development")
3. Click the **New Query** button

### Step 3: Copy the Migration SQL
1. In your code editor, open: `supabase/admin_setup.sql`
2. **Select ALL** the content (Ctrl+A)
3. **Copy** it (Ctrl+C)

### Step 4: Run the Migration
1. In Supabase SQL Editor, **Paste** the SQL (Ctrl+V)
2. Click the **Run** button (or press Cmd+Enter / Ctrl+Enter)
3. Wait for it to complete (you should see no errors)

### Step 5: Verify Success
You should see messages like:
```
CREATE TABLE IF NOT EXISTS admin_settings
CREATE TABLE IF NOT EXISTS error_logs
CREATE TABLE IF NOT EXISTS pricing_tiers
```

That's it! Your database is now set up.

---

## 📋 Method 2: What Gets Created

The migration will create these 3 tables:

### 1. `admin_settings`
- Stores global admin configuration
- Fields: pricing_enabled, maintenance_mode, propfirm_locked, journal_locked, lock_type, etc.

### 2. `error_logs`
- Stores application errors for monitoring
- Fields: message, severity, timestamp, stack_trace, user_id, page

### 3. `pricing_tiers`
- Stores pricing plan configurations
- Fields: name, price, features, locked_sections

The migration also sets up **Row-Level Security (RLS)** policies to protect data.

---

## ✅ How to Verify It Worked

After running the migration:

1. In Supabase Dashboard, go to **Table Editor**
2. You should see three new tables:
   - ✅ `admin_settings`
   - ✅ `error_logs`
   - ✅ `pricing_tiers`

3. In your app, the admin panel at `/admin` should now:
   - Load without errors
   - Show all admin features working
   - Allow you to toggle features
   - Display error logs

---

## 🐛 Troubleshooting

### "Syntax error in SQL"
- Make sure you copied the **entire** `supabase/admin_setup.sql` file
- Try running it line by line if needed

### "Tables already exist"
- That's fine! The migration uses `CREATE TABLE IF NOT EXISTS`
- Existing tables will be skipped

### App still shows "Admin settings table may not exist"
- Wait 5 seconds and refresh the page (Ctrl+F5)
- The app caches the initial state

### I don't see the tables in Table Editor
- Refresh the page
- Make sure you're looking at the right project
- Check the "All tables" view, not just your schema

---

## 🎯 Next Steps After Migration

1. ✅ Navigate to `http://localhost:5173/admin`
2. ✅ You should see the admin dashboard
3. ✅ Try toggling a feature to test it works
4. ✅ Check that error logs appear when you create errors
5. ✅ Visit `/pricing` to see your pricing page
6. ✅ Lock PropFirm/Journal and verify the messages appear

---

## 📞 Need Help?

If migration fails:
1. Check the error message in Supabase SQL Editor
2. Make sure you're using the correct project
3. Verify your Supabase credentials are set up correctly
4. Try running the SQL file again

If the admin panel still doesn't work after migration:
1. Hard refresh your browser (Ctrl+Shift+R or Cmd+Shift+R)
2. Check browser console (F12) for any errors
3. Verify you're logged in as an admin user
