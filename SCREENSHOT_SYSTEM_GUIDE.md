# Screenshot System Implementation Guide

## Overview

Complete screenshot management system for trade journal with:
- **Database table** for storing screenshot metadata and URLs
- **Screenshot uploader** component with drag-and-drop
- **Screenshot modal** with trade details overlay
- **Mobile view** with screenshot thumbnail as action
- **Desktop view** with full screenshot gallery

---

## 1. Database Setup

### Migration File
**File:** `supabase/add_screenshots_table.sql`

### Tables Created

#### `journal_screenshots`
Stores all screenshots associated with journal entries.

**Columns:**
- `id` (UUID) - Primary key
- `journal_id` (UUID) - Foreign key to journals table
- `user_id` (UUID) - Foreign key to auth.users
- `image_url` (TEXT) - URL to image stored in Supabase Storage
- `thumbnail_url` (TEXT) - Optional optimized thumbnail URL
- `file_name` (TEXT) - Original file name
- `file_size` (INTEGER) - Size in bytes
- `mime_type` (TEXT) - Image MIME type (image/jpeg, image/png, etc.)
- `uploaded_at` (TIMESTAMPTZ) - Upload timestamp
- `metadata` (JSONB) - Flexible field for: camera_settings, device_info, annotations
- `display_order` (INTEGER) - For ordering multiple screenshots
- `created_at` (TIMESTAMPTZ) - Record creation time
- `updated_at` (TIMESTAMPTZ) - Last update time

#### `journals` (Modified)
Added optional field to link primary screenshot:
- `primary_screenshot_id` (UUID) - Foreign key to journal_screenshots

### Row Level Security (RLS)
All tables have RLS enabled with policies:
- Users can only view their own screenshots
- Users can only insert/update/delete their own screenshots

### Indexes
- `idx_journal_screenshots_journal_id` - Fast lookups by journal
- `idx_journal_screenshots_user_id` - Fast lookups by user
- `idx_journal_screenshots_created_at` - Chronological queries
- `idx_journals_primary_screenshot_id` - Primary screenshot lookups

---

## 2. Storage Setup

### Supabase Storage Bucket

Create a storage bucket for trade screenshots:

```sql
-- Create bucket via Supabase dashboard or:
INSERT INTO storage.buckets (id, name, public)
VALUES ('trade-screenshots', 'trade-screenshots', true);
```

**Path Structure:**
```
trade-screenshots/
  {user_id}/
    {journal_id}/
      {timestamp}-{random}.jpg
```

### RLS Policies for Storage

```sql
-- Allow users to upload to their own directory
CREATE POLICY "Allow users to upload their own screenshots"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'trade-screenshots' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to view their own screenshots
CREATE POLICY "Allow users to view their own screenshots"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'trade-screenshots' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to delete their own screenshots
CREATE POLICY "Allow users to delete their own screenshots"
  ON storage.objects
  FOR DELETE
  USING (bucket_id = 'trade-screenshots' AND auth.uid()::text = (storage.foldername(name))[1]);
```

---

## 3. Components

### A. ScreenshotUploader Component
**File:** `src/components/modals/ScreenshotUploader.tsx`

**Purpose:** Upload and manage screenshot files before saving trade

**Features:**
- Drag-and-drop support
- Click to browse files
- Image preview grid
- File validation (type, size)
- Max files limit (default 5)
- Max file size (default 10MB)
- Remove individual screenshots
- Upload progress indicator

**Props:**
```typescript
interface ScreenshotUploaderProps {
  screenshots: ScreenshotFile[];      // Current screenshots
  onAdd: (files: File[]) => void;     // Handler for new files
  onRemove: (id: string) => void;     // Handler to remove file
  maxSize?: number;                    // Max file size in bytes (default 10MB)
  maxFiles?: number;                   // Max files allowed (default 5)
  disabled?: boolean;                  // Disable uploads
}
```

**Usage Example:**
```tsx
const [screenshots, setScreenshots] = useState<ScreenshotFile[]>([]);

const handleAddScreenshots = (files: File[]) => {
  const newScreenshots = files.map(file => ({
    id: crypto.randomUUID(),
    file,
    preview: URL.createObjectURL(file),
  }));
  setScreenshots([...screenshots, ...newScreenshots]);
};

const handleRemoveScreenshot = (id: string) => {
  setScreenshots(screenshots.filter(s => s.id !== id));
};

<ScreenshotUploader
  screenshots={screenshots}
  onAdd={handleAddScreenshots}
  onRemove={handleRemoveScreenshot}
  maxFiles={5}
  maxSize={10 * 1024 * 1024}
/>
```

---

### B. ScreenshotModal Component
**File:** `src/components/modals/ScreenshotModal.tsx`

**Purpose:** Display screenshot with trade details overlay

**Features:**
- Large image display
- Navigation (prev/next) between screenshots
- Thumbnail carousel
- Trade details sidebar showing:
  - Symbol, entry price, exit price
  - Realized points/amount (with profit/loss coloring)
  - Setup, session, execution type
  - Trade result (win/loss)
  - Duration
  - Notes
- Download screenshot button
- Delete screenshot button
- File info (name, upload date)
- Mobile responsive layout

**Props:**
```typescript
interface ScreenshotModalProps {
  isOpen: boolean;                    // Modal visibility
  onClose: () => void;                // Close handler
  screenshots: Screenshot[];          // Screenshots to display
  initialIndex?: number;              // Starting screenshot index
  tradeDetails: TradeDetails;        // Trade info to display
  onDelete?: (screenshotId: string) => Promise<void>; // Delete handler
}

interface Screenshot {
  id: string;
  imageUrl: string;
  fileName?: string;
  uploadedAt?: string;
}

interface TradeDetails {
  symbol: string;
  entryPrice?: number;
  exitPrice?: number;
  realizedPoints?: number;
  realizedAmount?: number;
  setup?: string;
  session?: string;
  executionType?: string;
  result?: string;
  win?: boolean;
  notes?: string;
  durationMinutes?: number;
}
```

**Usage Example:**
```tsx
const [isModalOpen, setIsModalOpen] = useState(false);

const tradeDetails: TradeDetails = {
  symbol: 'EURUSD',
  entryPrice: 1.0850,
  exitPrice: 1.0865,
  realizedPoints: 15,
  realizedAmount: 150,
  setup: 'Higher Lows & Highs',
  win: true,
};

<ScreenshotModal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  screenshots={screenshots}
  tradeDetails={tradeDetails}
  onDelete={handleDeleteScreenshot}
/>
```

---

### C. ScreenshotGallery Component
**File:** `src/components/modals/ScreenshotGallery.tsx`

**Purpose:** Display screenshots in different layouts

**Features:**
- Three variants:
  - **mobile**: Single screenshot with overlay, badge for additional count
  - **desktop**: Grid layout with all screenshots
  - **compact**: Thumbnail grid (3 visible + count badge)
- Click to open modal
- Hover effects
- Progressive disclosure (show N screenshots, +X more)

**Props:**
```typescript
interface ScreenshotGalleryProps {
  screenshots: Screenshot[];
  tradeDetails: TradeDetails;
  variant?: "mobile" | "desktop" | "compact"; // Default: "desktop"
  onDelete?: (screenshotId: string) => Promise<void>;
}
```

**Usage Examples:**

**Mobile View (in journal list):**
```tsx
<ScreenshotGallery
  screenshots={trade.screenshots}
  tradeDetails={trade}
  variant="mobile"
  onDelete={handleDeleteScreenshot}
/>
```

**Desktop View (in journal detail):**
```tsx
<ScreenshotGallery
  screenshots={trade.screenshots}
  tradeDetails={trade}
  variant="desktop"
  onDelete={handleDeleteScreenshot}
/>
```

**Compact View (in trading card):**
```tsx
<ScreenshotGallery
  screenshots={trade.screenshots}
  tradeDetails={trade}
  variant="compact"
/>
```

---

## 4. Integration with AddJournalDialog

### Step 1: Add Screenshot Uploader to Form

```tsx
// In AddJournalDialog.tsx, add to form state:
const [screenshotFiles, setScreenshotFiles] = useState<ScreenshotFile[]>([]);

// Add to form JSX (after symbol field):
<ScreenshotUploader
  screenshots={screenshotFiles}
  onAdd={(files) => {
    const newScreenshots = files.map(file => ({
      id: crypto.randomUUID(),
      file,
      preview: URL.createObjectURL(file),
    }));
    setScreenshotFiles([...screenshotFiles, ...newScreenshots]);
  }}
  onRemove={(id) => {
    setScreenshotFiles(screenshotFiles.filter(s => s.id !== id));
  }}
  maxFiles={5}
/>
```

### Step 2: Upload Screenshots on Save

```tsx
// When saving trade entry:
const handleSaveJournal = async () => {
  // 1. Save journal entry first
  const { data: journal, error: journalError } = await supabase
    .from('journals')
    .insert([formData])
    .select()
    .single();

  if (journalError) throw journalError;

  // 2. Upload screenshots
  for (const screenshot of screenshotFiles) {
    const filePath = `${userId}/${journal.id}/${Date.now()}-${crypto.randomUUID()}.${screenshot.file.type.split('/')[1]}`;

    // Upload to storage
    const { data: storageData, error: storageError } = await supabase
      .storage
      .from('trade-screenshots')
      .upload(filePath, screenshot.file);

    if (storageError) throw storageError;

    // Get public URL
    const { data: { publicUrl } } = supabase
      .storage
      .from('trade-screenshots')
      .getPublicUrl(filePath);

    // Save screenshot metadata
    const { error: ssError } = await supabase
      .from('journal_screenshots')
      .insert([{
        journal_id: journal.id,
        user_id: userId,
        image_url: publicUrl,
        file_name: screenshot.file.name,
        file_size: screenshot.file.size,
        mime_type: screenshot.file.type,
      }]);

    if (ssError) throw ssError;
  }

  // 3. Success
  setScreenshotFiles([]);
  onClose();
};
```

---

## 5. Integration with Journal List

### Mobile View

Replace action button with screenshot gallery:

```tsx
// In journal list (mobile breakpoint: < 640px)
{trade.screenshots && trade.screenshots.length > 0 ? (
  <ScreenshotGallery
    screenshots={trade.screenshots}
    tradeDetails={trade}
    variant="mobile"
    onDelete={handleDeleteScreenshot}
  />
) : (
  <div className="text-center py-4 text-muted-foreground text-sm">
    No screenshot
  </div>
)}
```

### Desktop View

Add as separate column or section:

```tsx
// In journal table (desktop)
<TableCell className="max-w-xs">
  <ScreenshotGallery
    screenshots={trade.screenshots}
    tradeDetails={trade}
    variant="compact"
    onDelete={handleDeleteScreenshot}
  />
</TableCell>
```

---

## 6. API Functions

### Fetch Screenshots for Journal

```typescript
// In lib/supabase-helpers.ts
export async function getJournalScreenshots(journalId: string) {
  const { data, error } = await supabase
    .from('journal_screenshots')
    .select('*')
    .eq('journal_id', journalId)
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data;
}
```

### Delete Screenshot

```typescript
export async function deleteScreenshot(screenshotId: string, filePath: string) {
  // Delete from storage
  const { error: storageError } = await supabase
    .storage
    .from('trade-screenshots')
    .remove([filePath]);

  if (storageError) throw storageError;

  // Delete from database
  const { error: dbError } = await supabase
    .from('journal_screenshots')
    .delete()
    .eq('id', screenshotId);

  if (dbError) throw dbError;
}
```

### Upload Screenshot to Existing Journal

```typescript
export async function uploadScreenshotToJournal(
  journalId: string,
  file: File,
  userId: string
) {
  const filePath = `${userId}/${journalId}/${Date.now()}-${crypto.randomUUID()}.${file.type.split('/')[1]}`;

  // Upload file
  const { error: uploadError } = await supabase
    .storage
    .from('trade-screenshots')
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  // Get public URL
  const { data: { publicUrl } } = supabase
    .storage
    .from('trade-screenshots')
    .getPublicUrl(filePath);

  // Save metadata
  const { data, error: dbError } = await supabase
    .from('journal_screenshots')
    .insert([{
      journal_id: journalId,
      user_id: userId,
      image_url: publicUrl,
      file_name: file.name,
      file_size: file.size,
      mime_type: file.type,
    }])
    .select()
    .single();

  if (dbError) throw dbError;
  return data;
}
```

---

## 7. Implementation Checklist

### Database
- [ ] Run migration: `supabase/add_screenshots_table.sql`
- [ ] Create storage bucket: `trade-screenshots`
- [ ] Set up RLS policies for storage
- [ ] Test RLS with sample data

### Components
- [ ] Create `ScreenshotUploader.tsx`
- [ ] Create `ScreenshotModal.tsx`
- [ ] Create `ScreenshotGallery.tsx`
- [ ] Test all three components in isolation

### AddJournalDialog Integration
- [ ] Import ScreenshotUploader
- [ ] Add state for screenshot files
- [ ] Add uploader to form
- [ ] Implement screenshot upload on save
- [ ] Test upload functionality

### Journal List Integration
- [ ] Mobile: Replace action with screenshot gallery (variant="mobile")
- [ ] Desktop: Add screenshot column (variant="compact")
- [ ] Test on different screen sizes

### API Functions
- [ ] Create helper functions in lib/supabase-helpers.ts
- [ ] Implement delete functionality
- [ ] Implement fetch functionality
- [ ] Test all API functions

### Testing
- [ ] Test single screenshot
- [ ] Test multiple screenshots
- [ ] Test navigation in modal
- [ ] Test download functionality
- [ ] Test delete functionality
- [ ] Test mobile responsiveness
- [ ] Test drag-and-drop upload
- [ ] Test file validation

---

## 8. File Size Optimization

### For Production

Consider adding thumbnail generation:

```typescript
// Resize image to create thumbnail (example with sharp)
import sharp from 'sharp';

export async function generateThumbnail(file: File): Promise<Blob> {
  const buffer = await file.arrayBuffer();
  const resized = await sharp(buffer)
    .resize(200, 200, { fit: 'cover' })
    .toBuffer();
  
  return new Blob([resized], { type: 'image/jpeg' });
}
```

### Storage Optimization

```typescript
// Compress before upload
export async function compressImage(file: File): Promise<Blob> {
  const canvas = document.createElement('canvas');
  const img = new Image();
  img.src = URL.createObjectURL(file);
  
  await new Promise(resolve => img.onload = resolve);
  
  canvas.width = Math.min(img.width, 2000);
  canvas.height = (canvas.width / img.width) * img.height;
  
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  
  return new Promise(resolve => {
    canvas.toBlob(resolve, 'image/jpeg', 0.8);
  });
}
```

---

## 9. Future Enhancements

- [ ] Annotation tools (draw, highlight, add text)
- [ ] Screenshot cropping before upload
- [ ] Batch screenshot download
- [ ] Screenshot comparison tool (entry vs exit)
- [ ] Screenshot sharing with other traders
- [ ] OCR to extract trade details from screenshot
- [ ] AI analysis of chart patterns
- [ ] Screenshot organization by tags
- [ ] Time-lapse view of multiple screenshots
- [ ] Screenshot watermarking for branding

---

## 10. Security Considerations

✅ **Implemented:**
- RLS policies on database and storage
- User ID verification
- File type validation (images only)
- File size limits
- User-specific storage directories

**Additional Recommendations:**
- Virus scan on upload (e.g., ClamAV)
- Rate limiting on upload endpoint
- Audit logging of deletes
- Automatic cleanup of orphaned files
- Backup of critical screenshots
- End-to-end encryption for sensitive data

