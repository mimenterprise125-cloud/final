# Google OAuth & Session Fix Guide

## Problem Analysis

You're experiencing two issues:

1. **After Gmail verification, user is not redirected to dashboard** - stays on signup/login page
2. **Subsequent login attempts show 404: NOT_FOUND with ID: bom1** - session error

### Root Causes

1. **Wrong redirect URL**: OAuth is redirecting directly to `/dashboard/journal` instead of `/auth/callback`
2. **Environment mismatch**: `.env` has `VITE_OAUTH_REDIRECT_DOMAIN=https://tradeone.vercel.app` (production) but you're testing locally
3. **Session not being established**: The callback handler isn't being reached
4. **HashRouter issue**: URLs with `#` aren't being handled correctly by OAuth flow

---

## ✅ Solution: Complete Fix

### Step 1: Fix `.env` File

Your current `.env`:
```env
VITE_OAUTH_REDIRECT_DOMAIN=https://tradeone.vercel.app  # ❌ Production domain
```

**For local development**, either:

**Option A: Remove the production domain (recommended for local testing)**
```env
# Comment out or remove this line for local development
# VITE_OAUTH_REDIRECT_DOMAIN=https://tradeone.vercel.app
```

**Option B: Use local development domain**
```env
# For local development (localhost)
# VITE_OAUTH_REDIRECT_DOMAIN=http://localhost:5173

# For production
VITE_OAUTH_REDIRECT_DOMAIN=https://tradeone.vercel.app
```

---

### Step 2: Fix Login Component

**File: `src/pages/Login.tsx`**

Find the Google OAuth call (around line 49-51) and change:

```typescript
// ❌ CURRENT (WRONG)
const { error } = await supabase.auth.signInWithOAuth({ 
  provider: 'google', 
  options: { redirectTo: getOAuthRedirectUrl('/dashboard/journal') }
})

// ✅ FIXED (CORRECT)
const { error } = await supabase.auth.signInWithOAuth({ 
  provider: 'google', 
  options: { redirectTo: getOAuthRedirectUrl('/auth/callback') }
})
```

---

### Step 3: Fix Signup Component

**File: `src/pages/Signup.tsx`**

Find the Google OAuth calls (around line 64 and 126) and change both:

```typescript
// ❌ CURRENT (WRONG)
options: { redirectTo: getOAuthRedirectUrl('/dashboard/journal') }

// ✅ FIXED (CORRECT)
options: { redirectTo: getOAuthRedirectUrl('/auth/callback') }
```

---

### Step 4: Verify auth-helpers.ts

Make sure your `getOAuthRedirectUrl` function includes the hash (`#`) for HashRouter:

**File: `src/lib/auth-helpers.ts`**

```typescript
export const getOAuthRedirectUrl = (path: string = '/auth/callback'): string => {
  // Priority 1: Use custom domain if set (ngrok, tunnel, etc.)
  if (import.meta.env.VITE_OAUTH_REDIRECT_DOMAIN) {
    const customDomain = import.meta.env.VITE_OAUTH_REDIRECT_DOMAIN.trim();
    const cleanDomain = customDomain.endsWith('/') ? customDomain.slice(0, -1) : customDomain;
    // For HashRouter, include # before the path
    return `${cleanDomain}/#${path}`;
  }
  
  // Priority 2: Use window.location.origin with # for HashRouter
  return `${window.location.origin}/#${path}`;
};
```

---

### Step 5: Verify Callback Page

**File: `src/pages/auth/callback.tsx`**

Make sure it looks like this:

```tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '@/lib/supabase';
import { Loader } from 'lucide-react';

export function AuthCallback() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the session that was just created by Supabase
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        if (data.session) {
          // ✅ Session exists, redirect to dashboard
          navigate('/dashboard/journal', { replace: true });
        } else {
          // ❌ No session, redirect to login
          navigate('/login', { replace: true });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Authentication failed');
        setTimeout(() => navigate('/login', { replace: true }), 3000);
      } finally {
        setLoading(false);
      }
    };

    handleCallback();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader className="w-12 h-12 animate-spin text-cyan-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Auth Error</h1>
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return null;
}
```

---

### Step 6: Verify Supabase Configuration

Go to **Supabase Dashboard** → Your Project:

1. **Authentication** → **Providers** → **Google**
   - ✅ Make sure "Enabled" is toggled ON
   - ✅ Google Client ID is set
   - ✅ Google Client Secret is set

2. **Authentication** → **URL Configuration**
   - ✅ **Site URL**: `http://localhost:5173` (for local) or `https://tradeone.vercel.app` (for production)
   - ✅ **Redirect URLs** should include:
     ```
     http://localhost:5173/#/auth/callback
     http://localhost:5173/#/dashboard/journal
     https://tradeone.vercel.app/#/auth/callback
     https://tradeone.vercel.app/#/dashboard/journal
     ```

3. **APIs** → check if you have a User table (should auto-created by Supabase)

---

### Step 7: Verify Google Cloud Console

1. Go to **Google Cloud Console** → Your Project
2. **APIs & Services** → **Credentials**
3. Click your **OAuth 2.0 Client ID**
4. Under **Authorized redirect URIs**, make sure you have:
   ```
   https://jabzseuicykmvfedxbwn.supabase.co/auth/v1/callback
   ```
   (This is where Google sends the code - Supabase handles it)

5. Under **Authorized JavaScript Origins**:
   ```
   http://localhost:5173
   http://127.0.0.1:5173
   https://tradeone.vercel.app
   ```

---

## Testing the Complete Flow

After making all changes, test step by step:

### Test 1: Clear Everything First
```bash
# In browser:
1. Open DevTools (F12)
2. Application tab → Storage → Clear All
3. Close all tabs with your app
4. Close browser completely
```

### Test 2: Start Fresh
```bash
# In terminal:
npm run dev

# Wait for "VITE v... ready in ... ms"
```

### Test 3: Test Signup with Gmail

1. Go to `http://localhost:5173/#/signup` (note the `#`)
2. Click "Sign up with Google"
3. **Expected flow**:
   - Redirects to Google login
   - You log in with Gmail
   - Redirects to `http://localhost:5173/#/auth/callback` (should show "Completing sign in...")
   - Then redirects to `http://localhost:5173/#/dashboard/journal`

### Test 4: Test Login with Same Account

1. Go to `http://localhost:5173/#/login`
2. Click "Sign in with Google"
3. **Expected flow**:
   - Should quickly log in (Gmail knows you already logged in)
   - Redirects to `http://localhost:5173/#/auth/callback`
   - Then redirects to `http://localhost:5173/#/dashboard/journal`

---

## Troubleshooting the 404 Error

If you still get **404: NOT_FOUND with ID: bom1**:

### Check 1: Browser Console
```
Press F12 → Console tab
Look for any error messages about:
- auth
- redirect
- session
- OAuth
```

### Check 2: Network Tab
```
Press F12 → Network tab
Click "Sign in with Google"
Look for failed requests (red):
- Check the response status
- Check the error message
```

### Check 3: Clear Cache
```
Ctrl+Shift+Delete (or Cmd+Shift+Delete on Mac)
Select "All time"
Check: Cookies, Cache, etc.
Click Clear
```

### Check 4: Verify Routes
In your `src/App.tsx`, make sure this route exists:
```tsx
<Route path="/auth/callback" element={<AuthCallback />} />
```

### Check 5: Check Session Storage
In browser DevTools → Application → Local Storage:
- Should see: `sb-jabzseuicykmvfedxbwn-auth-token`
- If missing, session wasn't created

---

## Quick Checklist

Before testing, verify:

- [ ] `.env` updated (or production domain removed for local testing)
- [ ] `src/pages/Login.tsx` uses `/auth/callback` (not `/dashboard/journal`)
- [ ] `src/pages/Signup.tsx` uses `/auth/callback` (both occurrences)
- [ ] `src/lib/auth-helpers.ts` includes `#` in URLs
- [ ] `src/pages/auth/callback.tsx` exists and handles redirect
- [ ] `src/App.tsx` has `/auth/callback` route
- [ ] Supabase dashboard has Google provider enabled
- [ ] Supabase URL Configuration includes all redirect URLs with `#`
- [ ] Google Cloud Console has correct redirect URIs

---

## Expected Behavior After Fix

✅ **Signup Flow**:
1. User signs up with Gmail
2. Redirects to `/auth/callback` (shows loading)
3. Session is verified
4. Redirects to `/dashboard/journal`
5. User is logged in and can see dashboard

✅ **Login Flow**:
1. User logs in with Gmail
2. Redirects to `/auth/callback` (shows loading)
3. Session is verified
4. Redirects to `/dashboard/journal`
5. User is logged in and can see dashboard

✅ **No 404 Errors**: All redirects work correctly

✅ **Persistent Login**: Closing browser and reopening keeps user logged in

---

## Summary

The issue is that your OAuth flow is:
1. ❌ Trying to redirect directly to dashboard
2. ❌ Not handling the Supabase callback properly
3. ❌ Not establishing the session correctly

The fix is:
1. ✅ Redirect to `/auth/callback` first
2. ✅ Let callback verify session
3. ✅ Then redirect to dashboard
4. ✅ Use `#` format for HashRouter

Make these changes and test again!
