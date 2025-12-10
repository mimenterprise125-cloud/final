-- ============================================================================
-- SUPABASE STORAGE BUCKET SETUP
-- ============================================================================
-- This guide shows how to create the journal-screenshots storage bucket
-- for storing trade journal screenshots

## Method 1: Using Supabase Dashboard (Easiest) ✅

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **Storage** in the left sidebar
4. Click **Create a new bucket**
5. Fill in the form:
   - **Bucket name**: `journal-screenshots`
   - **Privacy**: Public (or Private if you want)
   - Click **Create bucket**

6. You should now see "journal-screenshots" in your buckets list

## Method 2: Using SQL (For Automation)

Run this SQL in Supabase SQL Editor to create the bucket:

```sql
-- Create the storage bucket for journal screenshots
INSERT INTO storage.buckets (id, name, public)
VALUES ('journal-screenshots', 'journal-screenshots', true)
ON CONFLICT (id) DO NOTHING;
```

Then set up RLS policies:

```sql
-- Allow users to upload their own screenshots
CREATE POLICY "Allow insert to journal-screenshots"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'journal-screenshots'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to view their own screenshots
CREATE POLICY "Allow select from journal-screenshots"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'journal-screenshots'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own screenshots
CREATE POLICY "Allow delete from journal-screenshots"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'journal-screenshots'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to update their own screenshots
CREATE POLICY "Allow update in journal-screenshots"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'journal-screenshots'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'journal-screenshots'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

## Quick Checklist

After creating the bucket:

- [ ] Bucket name is exactly: `journal-screenshots`
- [ ] Bucket is set to Public (for easy access)
- [ ] RLS policies are applied (optional but recommended)
- [ ] You can see it in Storage → Buckets list

## Testing the Bucket

Try uploading a test file:

```typescript
const { data, error } = await supabase.storage
  .from('journal-screenshots')
  .upload(`${userId}/test.jpg`, file);

if (error) {
  console.error('Upload failed:', error.message);
  // If you see "Bucket not found", create it!
} else {
  console.log('Upload successful:', data);
}
```

## Troubleshooting

**Error: "Bucket not found"**
- Solution: Create the bucket using Method 1 (Dashboard) or Method 2 (SQL)

**Error: "Permission denied"**
- Solution: Check RLS policies or set bucket to Public

**Error: "Invalid bucket name"**
- Solution: Use exact name `journal-screenshots` (lowercase, no spaces)

## File Structure in Bucket

Recommended folder structure:

```
journal-screenshots/
├── {user_id}/
│   ├── {journal_id}_1.webp
│   ├── {journal_id}_2.webp
│   └── {journal_id}_3.webp
└── {user_id2}/
    └── ...
```

This structure:
- Keeps user files organized
- Enables easy RLS policies (check user_id folder)
- Prevents filename collisions

## After Creating the Bucket

1. Update your code to use the bucket name
2. Test uploading a screenshot
3. Verify the file appears in the bucket
4. Check RLS policies are working

Your form should now work without the "Bucket not found" error!
