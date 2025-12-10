# OAuth Redirect Issue - Complete Fix Guide

## 🔴 Your Current Problem

**Symptom:** After confirming Gmail, it redirects to localhost instead of dashboard

**Root Cause:** Mismatch between Google Cloud Console, Supabase, and your app code

---

## ✅ Step 1: Fix Google Cloud Console

This is the **PRIMARY** issue. Your Authorized Redirect URIs in Google Cloud need to match EXACTLY what Supabase expects.

### Go to Google Cloud Console:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to **APIs & Services** → **Credentials**
4. Click on your OAuth 2.0 Client ID (or create one if missing)
5. Edit the client

### Update Authorized Redirect URIs:

Replace ALL URIs with **ONLY these two**:

```
https://jabzseuicykmvfedxbwn.supabase.co/auth/v1/callback
https://tradeone.vercel.app/auth/v1/callback
```

**IMPORTANT:** 
- ❌ Do NOT include `/auth/callback` (without /v1)
- ❌ Do NOT include `https://tradeone.vercel.app` alone
- ✅ Use `/auth/v1/callback` - this is what Supabase expects

### Also Update Authorized JavaScript Origins:

```
https://jabzseuicykmvfedxbwn.supabase.co
https://tradeone.vercel.app
```

---

## ✅ Step 2: Verify Supabase Configuration

### Go to Supabase Dashboard:

1. Select your project
2. Go to **Authentication** → **Providers**
3. Click **Google**
4. Make sure you have:
   - ✅ Google Client ID (from Google Cloud Console)
   - ✅ Google Client Secret (from Google Cloud Console)
   - ✅ Enabled toggle is ON

### Check Supabase URL Configuration:

1. Go to **Authentication** → **URL Configuration**
2. Verify these are set correctly:

```
Site URL:
https://tradeone.vercel.app

Redirect URLs:
https://jabzseuicykmvfedxbwn.supabase.co/auth/v1/callback
https://tradeone.vercel.app
https://tradeone.vercel.app/auth/callback
https://tradeone.vercel.app/auth/v1/callback
```

---

## ✅ Step 3: Check Your Login Component Code

Make sure your login code uses the correct redirect:

### Correct Login.tsx:

```typescript
import { supabase } from '@/lib/supabase';

export function Login() {
  const handleGoogleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // This should redirect to your Vercel domain, NOT localhost
        redirectTo: `${window.location.origin}/auth/callback`,
        // OR explicitly:
        // redirectTo: 'https://tradeone.vercel.app/auth/callback',
      },
    });

    if (error) {
      console.error('OAuth error:', error);
    }
  };

  return (
    <button onClick={handleGoogleLogin}>
      Sign in with Google
    </button>
  );
}
```

**Key Point:** The `redirectTo` should NOT be `localhost` - it should be your Vercel domain.

---

## ✅ Step 4: Create/Verify Auth Callback Handler

You need a callback page that handles the redirect after Google authentication.

### Create `src/pages/auth/callback.tsx`:

```typescript
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

export function AuthCallback() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the session from the URL hash
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        if (data.session) {
          // Session established, redirect to dashboard
          console.log('✅ Auth successful, redirecting to dashboard');
          navigate('/dashboard/journal');
        } else {
          // No session, redirect to login
          console.warn('⚠️ No session found, redirecting to login');
          navigate('/login');
        }
      } catch (err) {
        console.error('❌ Auth callback error:', err);
        setError(err instanceof Error ? err.message : 'Authentication failed');
        
        // Redirect to login after showing error
        setTimeout(() => navigate('/login'), 2000);
      } finally {
        setLoading(false);
      }
    };

    handleCallback();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Completing sign in...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">Authentication error: {error}</p>
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return null;
}
```

### Add route to your router:

```typescript
// In your main router file (App.tsx or router config)
import { AuthCallback } from '@/pages/auth/callback';

// Add this route:
{
  path: '/auth/callback',
  element: <AuthCallback />,
}
```

---

## ✅ Step 5: Update Environment Variables

### In Vercel Dashboard:

1. Go to your Vercel project
2. Settings → Environment Variables
3. Set these:

```env
VITE_OAUTH_REDIRECT_DOMAIN=https://tradeone.vercel.app
VITE_SUPABASE_URL=https://jabzseuicykmvfedxbwn.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### In your local `.env` file:

```env
VITE_OAUTH_REDIRECT_DOMAIN=https://tradeone.vercel.app
VITE_SUPABASE_URL=https://jabzseuicykmvfedxbwn.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

---

## 🔍 Debugging Steps

### 1. Check Browser Console

After clicking "Sign in with Google", open browser DevTools (F12):

```javascript
// In console, should show:
// ✅ "Redirecting to Google login"
// ✅ "Callback received" 
// ✅ "Session established"
// ❌ "Callback error" (if problem)
```

### 2. Check Network Tab

Look for these requests:
1. POST to `https://accounts.google.com/...` (Google login)
2. Redirect to `https://jabzseuicykmvfedxbwn.supabase.co/auth/v1/callback`
3. Redirect to `https://tradeone.vercel.app/auth/callback`

### 3. Check Supabase Logs

In Supabase Dashboard:
1. Go to **Authentication** → **Auth Logs**
2. Look for OAuth sign-in events
3. Check for any errors

---

## 🚨 Common Issues & Fixes

### Issue: Still redirects to localhost

**Solution:** Check your `redirectTo` in Login component
```typescript
// ❌ WRONG
redirectTo: 'http://localhost:5173/auth/callback'

// ✅ RIGHT
redirectTo: `${window.location.origin}/auth/callback`
// This will be: https://tradeone.vercel.app/auth/callback
```

### Issue: "Redirect URL mismatch"

**Solution:** The exact URLs must match between:
- ✅ Google Cloud Console → Authorized Redirect URIs
- ✅ Supabase → URL Configuration → Redirect URLs
- ✅ App code → `redirectTo` parameter

### Issue: White page after clicking Google button

**Solution:** Make sure you have the `/auth/callback` route created

### Issue: Gets logged in but still on login page

**Solution:** Check that AuthProvider is calling `navigate('/dashboard/journal')`:

```typescript
// In AuthProvider.tsx
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN' && session) {
    navigate('/dashboard/journal');
  }
});
```

---

## ✅ Final Verification Checklist

Before testing, verify ALL of these:

### Google Cloud Console:
- [ ] OAuth 2.0 Client ID exists
- [ ] Authorized Redirect URIs includes `https://jabzseuicykmvfedxbwn.supabase.co/auth/v1/callback`
- [ ] Authorized Redirect URIs includes `https://tradeone.vercel.app/auth/v1/callback`
- [ ] Authorized JavaScript Origins includes `https://tradeone.vercel.app`

### Supabase:
- [ ] Google provider is Enabled
- [ ] Client ID is set correctly
- [ ] Client Secret is set correctly
- [ ] Site URL is `https://tradeone.vercel.app`
- [ ] Redirect URLs includes the callback URLs

### Your App Code:
- [ ] Login component uses correct `redirectTo`
- [ ] Auth callback route exists at `/auth/callback`
- [ ] AuthProvider redirects to dashboard after login
- [ ] AuthGuard protects dashboard routes

### Vercel Deployment:
- [ ] Environment variables are set
- [ ] App has been redeployed (after changing env vars)
- [ ] App is running the latest code

---

## 🚀 Test the Flow

1. **Clear your browser cookies/cache** (or use incognito mode)
2. Go to `https://tradeone.vercel.app/login`
3. Click "Sign in with Google"
4. Complete Google authentication
5. **You should be redirected to:** `https://tradeone.vercel.app/dashboard/journal`
6. **NOT:** `localhost:5173/dashboard/journal`

---

## 📝 Summary of All Required URLs

| Service | URL | Purpose |
|---------|-----|---------|
| **Google Cloud** | `https://jabzseuicykmvfedxbwn.supabase.co/auth/v1/callback` | OAuth callback destination |
| **Google Cloud** | `https://tradeone.vercel.app/auth/v1/callback` | OAuth callback for Vercel |
| **Supabase** | `https://tradeone.vercel.app` | Site URL for redirects |
| **App Code** | `window.location.origin/auth/callback` | Redirect after OAuth |
| **Your Browser** | `https://tradeone.vercel.app/dashboard/journal` | Final destination |

---

## 💡 Key Takeaway

The issue is that:
1. ❌ Google redirects to Supabase callback
2. ❌ Supabase redirects back to your app
3. ❌ Your app redirects to dashboard

The `localhost` redirect means step 2 is configured wrong. Make sure Supabase is configured with your Vercel domain, not localhost!

