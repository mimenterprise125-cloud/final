# Google OAuth Configuration Usage in Code

## Overview

This guide shows how the `.env` configuration values are used throughout your React + Supabase application for Google OAuth.

---

## 1. Environment Variables Loaded by Vite

### File: `.env`

```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Google OAuth
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
VITE_OAUTH_REDIRECT_DOMAIN=https://yourdomain.com
```

### Accessed in Code

Vite automatically loads variables starting with `VITE_` and makes them available via:

```typescript
import.meta.env.VITE_SUPABASE_URL
import.meta.env.VITE_SUPABASE_ANON_KEY
import.meta.env.VITE_GOOGLE_CLIENT_ID
import.meta.env.VITE_OAUTH_REDIRECT_DOMAIN
```

---

## 2. Supabase Client Initialization

### File: `src/lib/supabase.ts`

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase configuration. Please copy .env.example to .env ' +
    'and set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export default supabase;
```

**What it does:**
- Reads `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from `.env`
- Creates Supabase client that connects to your Supabase project
- Exported as singleton for use throughout the app

---

## 3. OAuth Redirect URL Helper

### File: `src/lib/auth-helpers.ts`

```typescript
/**
 * Get the correct redirect URL for OAuth callbacks
 * Handles both development and production environments
 * Supports custom domains via VITE_OAUTH_REDIRECT_DOMAIN
 */
export const getOAuthRedirectUrl = (path: string = '/auth/callback'): string => {
  // Priority 1: Use custom domain if set (ngrok, tunnel, production, etc.)
  if (import.meta.env.VITE_OAUTH_REDIRECT_DOMAIN) {
    const customDomain = import.meta.env.VITE_OAUTH_REDIRECT_DOMAIN.trim();
    const cleanDomain = customDomain.endsWith('/') 
      ? customDomain.slice(0, -1) 
      : customDomain;
    // For HashRouter, include # before the path
    return `${cleanDomain}/#${path}`;
  }
  
  // Priority 2: Use current origin (localhost, auto-detect)
  return `${window.location.origin}/#${path}`;
};

/**
 * Get all valid OAuth redirect URLs for configuration reference
 */
export const getOAuthRedirectUrls = (): string[] => {
  const urls = [
    // Development URLs
    'http://localhost:5173/#/auth/callback',
    'http://localhost:5173/#/dashboard/journal',
    'http://localhost:3000/#/auth/callback',
    'http://localhost:3000/#/dashboard/journal',
  ];
  
  // Add custom domain if set
  if (import.meta.env.VITE_OAUTH_REDIRECT_DOMAIN) {
    const cleanDomain = import.meta.env.VITE_OAUTH_REDIRECT_DOMAIN.endsWith('/') 
      ? import.meta.env.VITE_OAUTH_REDIRECT_DOMAIN.slice(0, -1)
      : import.meta.env.VITE_OAUTH_REDIRECT_DOMAIN;
    urls.push(`${cleanDomain}/#/auth/callback`);
    urls.push(`${cleanDomain}/#/dashboard/journal`);
  }
  
  return urls;
};

/**
 * Log OAuth setup instructions to console (development only)
 */
export const logOAuthSetupInstructions = () => {
  if (import.meta.env.DEV) {
    console.group('🔐 Google OAuth Setup Instructions');
    console.log('Add these redirect URLs to Google Cloud Console:');
    getOAuthRedirectUrls().forEach(url => console.log(`  • ${url}`));
    console.log('\nAdd these redirect URLs to Supabase URL Configuration:');
    getOAuthRedirectUrls().forEach(url => console.log(`  • ${url}`));
    console.groupEnd();
  }
};
```

**What it does:**
- Uses `VITE_OAUTH_REDIRECT_DOMAIN` for custom domains (ngrok, tunnels, production)
- Falls back to `window.location.origin` for auto-detection
- Provides helper functions for logging setup instructions
- Ensures proper HashRouter URL format with `#`

---

## 4. Google Login Handler

### File: `src/pages/Login.tsx`

```typescript
import supabase from '@/lib/supabase';
import { getOAuthRedirectUrl, logOAuthSetupInstructions } from '@/lib/auth-helpers';

export function Login() {
  const handleGoogle = async () => {
    // Log setup instructions to browser console (for debugging)
    logOAuthSetupInstructions();

    // Initiate Google OAuth flow with Supabase
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // This URL is where Supabase redirects AFTER Google authentication
        redirectTo: getOAuthRedirectUrl('/auth/callback'),
      },
    });

    if (error) {
      console.error('OAuth error:', error);
      // Show error toast/message to user
    }
  };

  return (
    <button onClick={handleGoogle}>
      Sign in with Google
    </button>
  );
}
```

**What it does:**
- Calls `signInWithOAuth` to start Google OAuth flow
- Uses `getOAuthRedirectUrl` to generate correct callback URL
- Redirects to Google login page
- Google redirects to Supabase callback endpoint
- Supabase redirects to your app's `/auth/callback` route

---

## 5. Auth Callback Handler

### File: `src/pages/auth/callback.tsx`

```typescript
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '@/lib/supabase';

/**
 * This page handles the OAuth callback from Supabase
 * 
 * Flow:
 * 1. User clicks "Sign in with Google" on Login page
 * 2. Redirected to Google for authentication
 * 3. Google redirects to Supabase: supabase.co/auth/v1/callback?code=xxx
 * 4. Supabase verifies code and creates session
 * 5. Supabase redirects to: app.com/#/auth/callback
 * 6. This component checks for session
 * 7. If session exists → Redirect to dashboard
 * 8. If no session → Redirect to login
 */
export function AuthCallback() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the session created by Supabase OAuth flow
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        if (data.session) {
          // ✅ Session established, user is authenticated
          navigate('/dashboard/journal', { replace: true });
        } else {
          // ⚠️ No session found, redirect to login
          navigate('/login', { replace: true });
        }
      } catch (err) {
        // ❌ Authentication failed
        setError(err instanceof Error ? err.message : 'Authentication failed');
        setTimeout(() => navigate('/login', { replace: true }), 3000);
      } finally {
        setLoading(false);
      }
    };

    handleCallback();
  }, [navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return null;
}
```

**What it does:**
- Receives OAuth callback from Supabase
- Checks if session was created successfully
- Redirects to dashboard if authenticated
- Redirects to login if not authenticated

---

## 6. Configuration Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                                                               │
│  .env File                                                    │
│  ├─ VITE_SUPABASE_URL                                        │
│  ├─ VITE_SUPABASE_ANON_KEY                                   │
│  ├─ VITE_GOOGLE_CLIENT_ID                                    │
│  └─ VITE_OAUTH_REDIRECT_DOMAIN (optional)                    │
│                                                               │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ Loaded by Vite
                       │ (import.meta.env.VITE_*)
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                                                               │
│  src/lib/supabase.ts                                         │
│  ├─ Creates Supabase client                                  │
│  └─ Uses VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY         │
│                                                               │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ Exported as singleton
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                                                               │
│  src/lib/auth-helpers.ts                                     │
│  ├─ getOAuthRedirectUrl()                                    │
│  │  └─ Uses VITE_OAUTH_REDIRECT_DOMAIN                       │
│  └─ logOAuthSetupInstructions()                              │
│                                                               │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ Used by
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                                                               │
│  src/pages/Login.tsx                                         │
│  └─ handleGoogle()                                           │
│     ├─ Calls supabase.auth.signInWithOAuth()                │
│     ├─ Sets redirectTo using getOAuthRedirectUrl()           │
│     └─ Initiates Google OAuth flow                          │
│                                                               │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ User redirected to Google
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  Google Authentication Server                                │
│  └─ User logs in, grants permissions                         │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ Google redirects with code
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  Supabase OAuth Callback                                     │
│  └─ https://your-project.supabase.co/auth/v1/callback       │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ Supabase verifies code,
                       │ creates session,
                       │ redirects to your app
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  src/pages/auth/callback.tsx                                │
│  ├─ URL: http://localhost:5173/#/auth/callback              │
│  ├─ Gets session from Supabase                              │
│  └─ Redirects to dashboard                                  │
│                                                               │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ Session established
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  src/pages/dashboard/JournalDashboard.tsx                   │
│  └─ URL: http://localhost:5173/#/dashboard/journal          │
│     User is now authenticated and can use the app            │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 7. Environment-Specific Configurations

### Development Local

```env
# .env (local development)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-local-anon-key
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
# VITE_OAUTH_REDIRECT_DOMAIN=  (leave empty, will use localhost)
```

### Development with ngrok/Tunnel

```env
# .env (using ngrok tunnel)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-local-anon-key
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
VITE_OAUTH_REDIRECT_DOMAIN=https://abc123.ngrok.io
```

### Production

```env
# .env.production (or set in deployment platform)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-production-anon-key
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
VITE_OAUTH_REDIRECT_DOMAIN=https://yourdomain.com
```

---

## 8. Supabase Server-Side Configuration (config.toml)

For local Supabase development with `supabase start`:

### File: `supabase/config.toml`

```toml
[auth.external.google]
enabled = true
client_id = "your-google-client-id.apps.googleusercontent.com"
# Use environment variable for secret (never hardcode)
secret = "env(SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_SECRET)"
skip_nonce_check = false
```

### File: `supabase/.env.local`

```env
SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_SECRET=your-google-client-secret
```

---

## Summary

| Configuration | Location | Usage | Example |
|---|---|---|---|
| **Supabase URL** | `.env` VITE_SUPABASE_URL | Create Supabase client | `https://xyz.supabase.co` |
| **Supabase Key** | `.env` VITE_SUPABASE_ANON_KEY | Create Supabase client | `eyJ...` |
| **Google Client ID** | `.env` VITE_GOOGLE_CLIENT_ID | Google OAuth setup | `xyz.apps.googleusercontent.com` |
| **OAuth Redirect** | `.env` VITE_OAUTH_REDIRECT_DOMAIN | OAuth callback URL | `https://yourdomain.com` |
| **Google Secret** | `.env` (dev only) or env var (prod) | Supabase configuration | `abc123...` |
| **Supabase Google Config** | `supabase/config.toml` | Local Supabase setup | Client ID & secret |

---

## Next Steps

1. Copy `.env.example` to `.env`
2. Fill in your Google and Supabase credentials
3. Restart your dev server: `npm run dev`
4. Test OAuth flow by clicking "Sign in with Google" on login page
5. Check browser console for any errors or setup instructions

For more details, see [GOOGLE_OAUTH_COMPLETE_SETUP.md](./GOOGLE_OAUTH_COMPLETE_SETUP.md)
