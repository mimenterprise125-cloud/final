# Google OAuth 404 Error Fix - HashRouter & Redirect Configuration

## Problem Summary

After selecting Gmail and returning from Google OAuth, you're seeing a **404 Not Found** error with a URL like `#bom1`.

### Root Causes

1. **HashRouter Conflict**: Your app uses `HashRouter` which changes URLs to `/#/route` format, but Google OAuth doesn't understand hash-based routing
2. **Wrong Redirect Path**: Login is redirecting to `/dashboard/journal` instead of `/auth/callback` first
3. **Supabase Callback URL Not Configured**: Google OAuth needs a specific callback URL in Supabase

---

## ✅ Solution: Fix Redirect Logic

### Step 1: Update Login Component Redirect

Change the `redirectTo` to point to `/auth/callback` (not directly to dashboard):

**File: `src/pages/Login.tsx`**

Find this code (around line 49-51):
```typescript
const { error } = await supabase.auth.signInWithOAuth({ 
  provider: 'google',
  options: { redirectTo: getOAuthRedirectUrl('/dashboard/journal') }  // ❌ WRONG
});
```

Replace with:
```typescript
const { error } = await supabase.auth.signInWithOAuth({ 
  provider: 'google',
  options: { redirectTo: getOAuthRedirectUrl('/auth/callback') }  // ✅ RIGHT
});
```

**Why this matters:**
- Google redirects to Supabase first: `supabase.co/auth/v1/callback?code=xxx`
- Supabase then redirects to your app: `app.com/auth/callback`
- Your callback page checks the session and redirects to dashboard
- This is a 2-step redirect process, not direct

---

### Step 2: Update auth-helpers.ts

Make sure the OAuth redirect URL function handles HashRouter properly:

**File: `src/lib/auth-helpers.ts`**

Update the function to add `#` before the path for hash routing:

```typescript
export const getOAuthRedirectUrl = (path: string = '/auth/callback'): string => {
  // Priority 1: Use custom domain if set (ngrok, tunnel, etc.)
  if (import.meta.env.VITE_OAUTH_REDIRECT_DOMAIN) {
    const customDomain = import.meta.env.VITE_OAUTH_REDIRECT_DOMAIN.trim();
    const cleanDomain = customDomain.endsWith('/') ? customDomain.slice(0, -1) : customDomain;
    // For HashRouter, add # before the path
    return `${cleanDomain}/#${path}`;
  }
  
  // Priority 2: Use window.location.origin with hash
  // For HashRouter, use: origin/#/path
  return `${window.location.origin}/#${path}`;
};
```

---

### Step 3: Verify Supabase Configuration

Make sure Supabase is configured to redirect back to your app correctly.

**In Supabase Dashboard:**

1. Go to **Authentication** → **Providers** → **Google**
2. Verify Client ID and Secret are set
3. Go to **Authentication** → **URL Configuration**
4. Check **Site URL** is set to your app domain:
   ```
   http://localhost:5173  (for local dev)
   https://yourdomain.com (for production)
   ```
5. Check **Redirect URLs** include:
   ```
   http://localhost:5173/#/auth/callback
   http://localhost:5173/#/dashboard/journal
   https://yourdomain.com/#/auth/callback
   https://yourdomain.com/#/dashboard/journal
   ```

---

### Step 4: Update Google Cloud Console

Make sure Google OAuth is configured to accept your callback URLs.

**In Google Cloud Console:**

1. Go to **APIs & Services** → **Credentials**
2. Click your **OAuth 2.0 Client ID**
3. Under **Authorized Redirect URIs**, add:
   ```
   https://your-project.supabase.co/auth/v1/callback
   ```
   (This is where Google sends the code initially)

4. Under **Authorized JavaScript Origins**, add:
   ```
   http://localhost:5173
   http://localhost:3000
   https://yourdomain.com
   ```

---

## Testing the Flow

After making changes, test the complete OAuth flow:

1. **Start your dev server**: `npm run dev`
2. **Go to login page**: `http://localhost:5173/#/login`
3. **Click "Sign in with Google"**
4. **Complete Google authentication**
5. **You should be redirected to**: `http://localhost:5173/#/auth/callback`
6. **Then to**: `http://localhost:5173/#/dashboard/journal`

### Expected URL Flow:
```
1. app.com/#/login (user clicks Google button)
   ↓
2. accounts.google.com (user logs in)
   ↓
3. supabase.co/auth/v1/callback?code=xxx (Google sends code)
   ↓
4. app.com/#/auth/callback (Supabase redirects back)
   ↓
5. app.com/#/dashboard/journal (callback page redirects after session check)
```

---

## Troubleshooting

### Still Getting 404?

**Check 1: Browser Console Errors**
- Open DevTools (F12)
- Go to **Console** tab
- Look for any error messages
- Share what you see

**Check 2: Verify HashRouter is Being Used**
```typescript
// In src/App.tsx, confirm:
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
// Not BrowserRouter
```

**Check 3: Check Network Tab**
- Open DevTools (F12)
- Go to **Network** tab
- Click "Sign in with Google"
- Look for the redirect requests
- Check if any have failed with 404 status

**Check 4: Verify Environment Variables**
- Check if `VITE_OAUTH_REDIRECT_DOMAIN` is set in `.env`
- If set, make sure it doesn't conflict with HashRouter
- Try removing it if not needed for local development:
  ```env
  # Comment out or remove:
  # VITE_OAUTH_REDIRECT_DOMAIN=...
  ```

### Getting "Redirect URI mismatch"?

- Verify EXACTLY what URL you see in the browser address bar
- Google needs that EXACT URL in the credentials
- Check for trailing slashes, http vs https, etc.

### Still Redirecting to Localhost?

- Check `.env` file path (must be in project root, not src/)
- Restart dev server completely
- Clear browser cache
- Try in an incognito/private window

---

## Complete File Changes

### 1. src/pages/Login.tsx - Update Redirect

Find around line 49 and change:
```typescript
// ❌ OLD
options: { redirectTo: getOAuthRedirectUrl('/dashboard/journal') }

// ✅ NEW
options: { redirectTo: getOAuthRedirectUrl('/auth/callback') }
```

### 2. src/lib/auth-helpers.ts - Add Hash Support

Update the `getOAuthRedirectUrl` function to include `#` in the path:
```typescript
export const getOAuthRedirectUrl = (path: string = '/auth/callback'): string => {
  if (import.meta.env.VITE_OAUTH_REDIRECT_DOMAIN) {
    const customDomain = import.meta.env.VITE_OAUTH_REDIRECT_DOMAIN.trim();
    const cleanDomain = customDomain.endsWith('/') ? customDomain.slice(0, -1) : customDomain;
    return `${cleanDomain}/#${path}`;
  }
  return `${window.location.origin}/#${path}`;
};
```

---

## Key Points to Remember

✅ **OAuth is a 2-step redirect process:**
1. Browser → Google (user logs in)
2. Google → Supabase Callback
3. Supabase → Your App's `/auth/callback`
4. App → Dashboard (after session verification)

✅ **HashRouter means all URLs have `#` in them:**
- Correct: `app.com/#/auth/callback`
- Wrong: `app.com/auth/callback`

✅ **Every URL must be registered in 2 places:**
- Google Cloud Console (for initial Google redirect)
- Supabase URL Configuration (for redirect back to app)

✅ **Use `/auth/callback` as the Supabase redirect URL**, not directly to dashboard

---

## Summary

The 404 error happens because:
1. ❌ You're redirecting directly to `/dashboard/journal`
2. ❌ Google OAuth doesn't know about that final URL
3. ❌ HashRouter might be confusing the OAuth flow

The fix:
1. ✅ Redirect to `/auth/callback` first
2. ✅ Let the callback page verify the session
3. ✅ Then redirect to `/dashboard/journal`
4. ✅ Ensure all URLs use `#` format for HashRouter

After these changes, your OAuth flow should work correctly!
