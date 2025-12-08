# Google OAuth Setup Guide

## Problem
When signing up with Google, the redirect shows incorrect URL or the OAuth flow fails. This is common when using port forwarding/tunneling services (ngrok, etc.) or custom domains.

## Quick Solution - Port Forwarding/Tunneling (ngrok, Cloudflare Tunnel, etc.)

### Step 1: Start Your Port Forward
```bash
# ngrok example
ngrok http 5173

# You'll see output like:
# Forwarding    https://abc123def456.ngrok.io -> http://localhost:5173
```

### Step 2: Set Environment Variable
Create or edit your `.env` file:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_OAUTH_REDIRECT_DOMAIN=https://abc123def456.ngrok.io
```

**IMPORTANT**: 
- Use your actual ngrok URL (or tunnel URL)
- Do NOT include trailing slash
- Restart your dev server after adding `.env` changes

### Step 3: Add Redirect URI to Google OAuth
In Google Cloud Console, add this redirect URI:

```
https://abc123def456.ngrok.io/dashboard
```

### Step 4: Add Callback URL to Supabase
In Supabase, ensure this URL is configured:

```
https://your-supabase-url.supabase.co/auth/v1/callback
```

### Step 5: Test
1. Restart your dev server: `npm run dev` or `yarn dev`
2. Try signing up with Google
3. Should redirect to your tunnel URL, not localhost

---

## Detailed Configuration Guide

### Option 1: Development (localhost) - Simplest

No special setup needed! The code automatically handles localhost.

Just add these to Google OAuth credentials:

```
http://localhost:5173/dashboard
http://localhost:3000/dashboard
http://127.0.0.1:5173/dashboard
```

### Option 2: Port Forwarding with ngrok

#### Install ngrok
```bash
# Download from https://ngrok.com
# Or install via package manager
npm install -g ngrok
```

#### Start ngrok tunnel
```bash
ngrok http 5173
```

You'll see:
```
Forwarding    https://abc123def456.ngrok.io -> http://localhost:5173
```

#### Configure .env
```env
VITE_OAUTH_REDIRECT_DOMAIN=https://abc123def456.ngrok.io
```

#### Add to Google OAuth
```
https://abc123def456.ngrok.io/dashboard
```

### Option 3: Cloudflare Tunnel

#### Install Cloudflare CLI
```bash
npm install -g @cloudflare/wrangler
# or
brew install cloudflare-wrangler
```

#### Create tunnel
```bash
wrangler tunnel create my-app
wrangler tunnel run --url http://localhost:5173 my-app
```

You'll get a URL like: `https://my-app-xxxxx.cloudflareaccess.com`

#### Configure .env
```env
VITE_OAUTH_REDIRECT_DOMAIN=https://my-app-xxxxx.cloudflareaccess.com
```

### Option 4: Production Deployment

#### Configure .env for Production
```env
VITE_OAUTH_REDIRECT_DOMAIN=https://yourdomain.com
```

#### Add to Google OAuth
```
https://yourdomain.com/dashboard
```

---

## How to Configure Google OAuth

### 1. Go to Google Cloud Console
- Visit https://console.cloud.google.com/
- Select your project

### 2. Create OAuth Credentials
- Go to "APIs & Services" → "Credentials"
- Click "Create Credentials" → "OAuth 2.0 Client ID"
- Select "Web application"
- Name it something like "TradeOne App"

### 3. Add Authorized redirect URIs
- In the credentials page, click your OAuth 2.0 Client ID to edit
- Scroll to "Authorized redirect URIs"
- Add your redirect URI(s):
  - **Development (localhost)**: `http://localhost:5173/dashboard`, `http://localhost:3000/dashboard`
  - **Port forwarding (ngrok)**: `https://abc123def456.ngrok.io/dashboard`
  - **Production**: `https://yourdomain.com/dashboard`
- Click "Save"

### 4. Copy Client ID and Secret
- Note your **Client ID** and **Client Secret**
- You'll need these for Supabase

---

## Configure Supabase

### 1. Go to Supabase Dashboard
- Select your project
- Go to "Authentication" → "Providers"

### 2. Enable and Configure Google
- Find Google provider
- Toggle it on
- Paste your **Google OAuth Client ID**
- Paste your **Google OAuth Client Secret**
- Copy the **Callback URL** (something like `https://your-project.supabase.co/auth/v1/callback`)

### 3. Add Callback URL to Google Console
- Go back to Google Cloud Console
- Edit your OAuth 2.0 Client ID
- Add the Callback URL to "Authorized redirect URIs":
  ```
  https://your-project.supabase.co/auth/v1/callback
  ```
- Save

### 4. Save Supabase Configuration
- Click "Save" in Supabase

---

## Environment Variables Reference

### Complete .env Example
```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# OAuth Configuration - Choose ONE of these:

# For localhost (no configuration needed, but here it is)
# VITE_OAUTH_REDIRECT_DOMAIN=http://localhost:5173

# For ngrok or port forwarding
VITE_OAUTH_REDIRECT_DOMAIN=https://abc123def456.ngrok.io

# For production domain
# VITE_OAUTH_REDIRECT_DOMAIN=https://yourdomain.com

# For Cloudflare Tunnel
# VITE_OAUTH_REDIRECT_DOMAIN=https://my-app-xxxxx.cloudflareaccess.com
```

---

## Troubleshooting

### "Redirect URI mismatch" Error
**Problem**: Google returns "redirect_uri_mismatch"

**Solution**:
1. Check `.env` file for `VITE_OAUTH_REDIRECT_DOMAIN`
2. Make sure it matches EXACTLY what you added to Google OAuth (no trailing slashes)
3. Restart your dev server (`npm run dev`)
4. Open console and check the logged OAuth setup instructions

### ngrok URL Changes on Restart
**Problem**: ngrok gives a new URL every restart

**Solution**: 
- Subscribe to ngrok for static URLs
- OR manually update `.env` with new URL each restart
- OR use Cloudflare Tunnel instead (free, static URLs)

### Still Showing Localhost
**Problem**: Even with `.env` set, still redirecting to localhost

**Solution**:
1. **Verify `.env` file exists** in your project root
2. **Check file content**: Make sure `VITE_OAUTH_REDIRECT_DOMAIN=` line is there
3. **Restart dev server**: Stop and run `npm run dev` again
4. **Open console**: Check if the OAuth setup instructions are logged
5. **Clear browser cache**: Ctrl+Shift+Delete → Clear all

### Google OAuth Button Does Nothing
**Problem**: Clicking "Sign up with Google" doesn't open Google login

**Solution**:
1. Check Supabase configuration is correct
2. Verify Google Client ID is set in Supabase
3. Check browser console for errors (F12 → Console)
4. Ensure Callback URL is added to Google OAuth

---

## How the Code Works

The `getOAuthRedirectUrl()` function in `src/lib/auth-helpers.ts`:

```typescript
export const getOAuthRedirectUrl = (path: string = '/dashboard'): string => {
  // Priority 1: Use VITE_OAUTH_REDIRECT_DOMAIN if set
  if (import.meta.env.VITE_OAUTH_REDIRECT_DOMAIN) {
    const customDomain = import.meta.env.VITE_OAUTH_REDIRECT_DOMAIN.trim();
    const cleanDomain = customDomain.endsWith('/') 
      ? customDomain.slice(0, -1) 
      : customDomain;
    return `${cleanDomain}${path}`;
  }
  
  // Priority 2: Use window.location.origin (localhost, current domain, etc.)
  return `${window.location.origin}${path}`;
};
```

**How it works**:
1. First checks if `VITE_OAUTH_REDIRECT_DOMAIN` is set in `.env`
2. If yes, uses that domain (ngrok, tunnel, production domain)
3. If no, uses current origin (localhost, auto-detection)
4. Always appends `/dashboard` path
5. Removes trailing slashes to prevent errors

---

## Summary

| Setup | `.env` Configuration | Google OAuth URI |
|-------|----------------------|-------------------|
| **Localhost** | Not needed | `http://localhost:5173/dashboard` |
| **ngrok** | `VITE_OAUTH_REDIRECT_DOMAIN=https://abc123.ngrok.io` | `https://abc123.ngrok.io/dashboard` |
| **Cloudflare** | `VITE_OAUTH_REDIRECT_DOMAIN=https://tunnel-url.com` | `https://tunnel-url.com/dashboard` |
| **Production** | `VITE_OAUTH_REDIRECT_DOMAIN=https://yourdomain.com` | `https://yourdomain.com/dashboard` |

---

## Getting Help

Check these logs in browser console:
- Open Developer Tools: F12
- Go to Console tab
- Look for "🔐 Google OAuth Setup Instructions" message
- It shows all expected redirect URLs

---

**Last Updated**: December 2025

