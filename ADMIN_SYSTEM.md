# Admin Panel & Feature Management System

## Overview

A comprehensive admin panel system for managing website features, monitoring errors, managing users, configuring pricing, and enabling maintenance mode.

## Features

### 1. **Admin Dashboard Overview**
- **Total Users**: Display total registered users
- **Error Logs**: Count of all logged errors
- **Maintenance Mode Status**: Current state
- **Pricing Status**: Whether pricing is enabled

### 2. **Error Monitoring System**
- Real-time error logging with severity levels
  - **Critical**: Major system failures
  - **High**: Significant functionality issues
  - **Medium**: Non-critical errors
  - **Low**: Warnings and minor issues
- Error details include:
  - Message and description
  - Timestamp
  - Stack trace
  - User ID (if applicable)
  - Page where error occurred
- Clear all logs button for cleanup
- Scrollable error history (last 100 errors)

### 3. **User Management**
- View total user count
- Analytics on:
  - Total registered accounts
  - Premium users
  - Free users
  - Inactive users (30+ days)
- Real-time user statistics

### 4. **Pricing Management**
- **Enable/Disable Pricing**: Toggle pricing system on/off
- **Pricing Tiers**: Configure custom pricing tiers with:
  - Tier name
  - Monthly price
  - Features included
  - Locked sections per tier
- When pricing is enabled, website sections lock based on user tier
- When disabled, all features are available to all users

### 5. **Feature Management (Lock/Unlock)**
- **PropFirm Section**: Lock/unlock prop firm features
- **Journal Section**: Lock/unlock trading journal features
- Locked sections display "Under Development" message
- Instant toggle with immediate effect

### 6. **Maintenance Mode**
- **Single Toggle**: Enable/disable website maintenance
- When active:
  - All users see maintenance page
  - Shows estimated return time
  - Displays support contact info
  - Beautiful loading animations
- Perfect for deployment, updates, or emergency maintenance

## File Structure

```
src/
├── lib/
│   └── AdminContext.tsx          # Admin state management & API
├── hooks/
│   └── useErrorReporting.ts      # Error reporting hook
├── components/
│   ├── UnderDevelopment.tsx      # Locked section display
│   └── FeatureGuard.tsx          # Feature access control wrapper
├── pages/
│   ├── Admin.tsx                 # Main admin panel
│   └── UnderMaintenance.tsx      # Maintenance mode page
└── supabase/
    └── admin_setup.sql           # Database schema & RLS policies

Routes:
/admin                 # Admin panel (requires auth)
/maintenance           # Maintenance page (shown when maintenance_mode=true)
```

## Database Schema

### admin_settings
```sql
- id (TEXT, primary key)
- pricing_enabled (BOOLEAN)
- pricing_tiers (JSONB array)
- maintenance_mode (BOOLEAN)
- propfirm_locked (BOOLEAN)
- journal_locked (BOOLEAN)
- active_user_count (INTEGER)
- total_user_count (INTEGER)
- error_logs (JSONB array)
- locked_sections (TEXT array)
- created_at, updated_at (TIMESTAMP)
```

### error_logs
```sql
- id (UUID, primary key)
- message (TEXT)
- severity (TEXT: low/medium/high/critical)
- timestamp (TIMESTAMP)
- stack_trace (TEXT)
- user_id (UUID, FK to auth.users)
- page (TEXT)
- created_at (TIMESTAMP)
```

### pricing_tiers
```sql
- id (UUID, primary key)
- name (TEXT)
- price (DECIMAL)
- features (JSONB array)
- locked_sections (TEXT array)
- created_at, updated_at (TIMESTAMP)
```

## Setup Instructions

### 1. Run Database Migration
```bash
# Execute the SQL in Supabase:
# Navigate to SQL Editor in Supabase dashboard
# Copy contents of supabase/admin_setup.sql
# Run the script
```

### 2. Import Context Provider
In your `App.tsx`, wrap your app with `AdminProvider`:

```tsx
import { AdminProvider } from '@/lib/AdminContext';

<AdminProvider>
  {/* Your app content */}
</AdminProvider>
```

### 3. Use Feature Guards
To protect PropFirm and Journal sections:

```tsx
import FeatureGuard from '@/components/FeatureGuard';

<FeatureGuard feature="journal">
  <TradingJournal />
</FeatureGuard>

<FeatureGuard feature="propfirm">
  <TradeCopier />
</FeatureGuard>
```

### 4. Report Errors
Use the error reporting hook in any component:

```tsx
import { useErrorReporting } from '@/hooks/useErrorReporting';

const MyComponent = () => {
  const { reportError } = useErrorReporting();
  
  const handleError = async () => {
    try {
      // some operation
    } catch (err) {
      await reportError(
        'Operation failed',
        'high',
        '/dashboard/accounts',
        err.stack
      );
    }
  };
  
  return <button onClick={handleError}>Do Something</button>;
};
```

## Usage Examples

### Enable Maintenance Mode
1. Navigate to `/admin`
2. Click "Maintenance" tab
3. Click "Enable Maintenance Mode" button
4. Website now shows maintenance page to all users

### Lock PropFirm Section
1. Navigate to `/admin`
2. Click "Features" tab
3. Click "Lock Section" under PropFirm
4. Users see "Under Development" page when visiting PropFirm

### View Error Logs
1. Navigate to `/admin`
2. Click "Errors" tab
3. See all logged errors with details
4. Click "Clear All Logs" to reset

### Enable Pricing
1. Navigate to `/admin`
2. Click "Pricing" tab
3. Click "Enable Pricing" button
4. Configure pricing tiers
5. Website now enforces pricing restrictions

## API Methods (useAdmin hook)

```tsx
const {
  adminSettings,        // Current settings
  loading,              // Loading state
  error,                // Error messages
  updateSettings,       // Update any setting
  toggleMaintenanceMode,// Toggle maintenance
  togglePricingEnabled, // Toggle pricing
  togglePropFirmLock,   // Lock/unlock propfirm
  toggleJournalLock,    // Lock/unlock journal
  addErrorLog,          // Add error log entry
  clearErrorLogs,       // Clear all errors
  updatePricingTiers,   // Update pricing tiers
} = useAdmin();
```

## Security Considerations

- ✅ RLS (Row Level Security) policies in place
- ✅ Only authenticated users can access admin panel
- ✅ Error logs respect user privacy
- ✅ Maintenance mode prevents unauthorized access
- ⚠️ TODO: Add role-based access control (admin-only checks)

## Future Enhancements

- [ ] Admin-only role verification
- [ ] User suspension/ban system
- [ ] Advanced pricing tier management
- [ ] Email notifications for critical errors
- [ ] Error analytics dashboard
- [ ] Scheduled maintenance mode
- [ ] User activity logs
- [ ] Backup & restore functionality
- [ ] API rate limiting management

## Troubleshooting

### Maintenance page not showing
- Check `adminSettings.maintenance_mode` value
- Ensure routing is set up correctly
- Verify AdminProvider is wrapping the app

### Error logs not appearing
- Check network tab for failed inserts
- Verify error_logs table exists
- Check RLS policies allow inserts

### Feature locks not working
- Ensure FeatureGuard is wrapping the component
- Check if `adminSettings` is loaded
- Verify toggle functions are being called

## Support

For issues or questions about the admin system, please check the error logs or review the implementation in the respective files.
