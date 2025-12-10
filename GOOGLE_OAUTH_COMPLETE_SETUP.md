# ============================================================================
# GOOGLE OAUTH CONFIGURATION SETUP GUIDE
# ============================================================================
# Complete guide to configure Google OAuth for your Supabase + React app
# This covers both development and production setups
# ============================================================================

## Table of Contents

1. [Get Google Credentials](#get-google-credentials)
2. [Configure .env File](#configure-env-file)
3. [Configure Supabase](#configure-supabase)
4. [Configure Supabase Local (config.toml)](#configure-supabase-local)
5. [Test OAuth Flow](#test-oauth-flow)
6. [Troubleshooting](#troubleshooting)

---

## Get Google Credentials

### Step 1: Go to Google Cloud Console

1. Visit: https://console.cloud.google.com/
2. Sign in with your Google account
3. Click on the project dropdown (top left)
4. Click **NEW PROJECT**
5. Enter a project name (e.g., "TradeOne")
6. Click **CREATE**

### Step 2: Enable Google+ API

1. In the sidebar, go to **APIs & Services** → **Enabled APIs & services**
2. Click **+ ENABLE APIS AND SERVICES**
3. Search for **Google+ API**
4. Click on it and then click **ENABLE**

### Step 3: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **+ CREATE CREDENTIALS**
3. Select **OAuth 2.0 Client ID**
4. If prompted, click **CONFIGURE CONSENT SCREEN** first:
   - Select **External**
   - Fill in:
     - **App name**: TradeOne
     - **User support email**: your-email@example.com
     - **Developer contact**: your-email@example.com
   - Click **SAVE AND CONTINUE**
   - Add scopes: `openid profile email`
   - Click **SAVE AND CONTINUE**
   - Click **BACK TO DASHBOARD**

5. Now create the OAuth 2.0 Client ID:
   - Click **+ CREATE CREDENTIALS** again
   - Select **OAuth 2.0 Client ID**
   - Application type: **Web application**
   - Name: TradeOne
   - Under **Authorized redirect URIs**, add:

```
https://your-project.supabase.co/auth/v1/callback
http://localhost:5173
http://localhost:5173/
```

6. Click **CREATE**
7. You'll see a popup with your credentials:
   - Copy the **Client ID**
   - Copy the **Client Secret**
   - Click **DONE**

### Step 4: Store Your Credentials

Save these securely:
- **Google Client ID**: `your-google-client-id.apps.googleusercontent.com`
- **Google Client Secret**: `your-google-client-secret`

⚠️ **IMPORTANT**: Never commit the Client Secret to git. Use environment variables instead.

---

## Configure .env File

### 1. Copy the Example File

```bash
cp .env.example .env
```

### 2. Update with Your Values

Open `.env` and fill in:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Google OAuth
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
VITE_GOOGLE_CLIENT_SECRET=your-google-client-secret

# For local development (leave empty or comment out)
# VITE_OAUTH_REDIRECT_DOMAIN=
```

### 3. Restart Dev Server

```bash
npm run dev
```

The app will now use your `.env` values.

---

## Configure Supabase

### In Supabase Dashboard

1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to **Authentication** → **Providers**
4. Find **Google** provider
5. Click to expand it
6. Toggle **ENABLED**
7. Paste your values:
   - **Client ID**: From Google Cloud Console
   - **Client Secret**: From Google Cloud Console
8. Click **SAVE**

### Configure Redirect URLs

1. Still in **Authentication**, go to **URL Configuration**
2. Set **Site URL** to your app domain:
   - **Development**: `http://localhost:5173`
   - **Production**: `https://yourdomain.com`

3. Add **Redirect URLs** (click **+** to add each):

```
http://localhost:5173
http://localhost:5173/#/auth/callback
http://localhost:5173/#/dashboard/journal
https://yourdomain.com
https://yourdomain.com/#/auth/callback
https://yourdomain.com/#/dashboard/journal
```

4. Click **SAVE**

---

## Configure Supabase Local

### For Local Development with `supabase start`

If you're running Supabase locally:

### 1. Copy Example Config

```bash
cp supabase/config.toml.example supabase/config.toml
```

### 2. Update Google Credentials

Edit `supabase/config.toml`:

```toml
[auth.external.google]
enabled = true
client_id = "your-google-client-id.apps.googleusercontent.com"
secret = "env(SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_SECRET)"
skip_nonce_check = false
```

### 3. Set Environment Variable

Create a `.env.local` file in the Supabase directory:

```bash
# supabase/.env.local
SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### 4. Start Supabase

```bash
supabase start
```

---

## Test OAuth Flow

### Step 1: Start Your App

```bash
npm run dev
```

### Step 2: Go to Login Page

```
http://localhost:5173/#/login
```

### Step 3: Click "Sign in with Google"

### Step 4: Complete Google Authentication

- You'll be redirected to Google
- Log in with your Google account
- Grant permissions to the app
- You'll be redirected to your app

### Expected Result

✅ You should be redirected to the dashboard at:
```
http://localhost:5173/#/dashboard/journal
```

✅ You should see your account name in the top right

---

## Troubleshooting

### Issue: "Invalid Client" Error

**Cause**: Google Client ID or Secret is incorrect

**Fix**:
1. Double-check values in Google Cloud Console
2. Make sure they're copied exactly (no spaces)
3. Update `.env` and restart dev server
4. Clear browser cache and try again

### Issue: "Redirect URI mismatch" Error

**Cause**: The redirect URL doesn't match what you added to Google Console

**Fix**:
1. Check what URL you see in browser address bar
2. Add that exact URL to Google Cloud Console:
   - **APIs & Services** → **Credentials**
   - Click your OAuth 2.0 Client ID
   - Under **Authorized redirect URIs**, add the exact URL
   - Make sure to use HTTPS for production
3. Wait a few minutes for changes to take effect
4. Try again

### Issue: 404 Error After Google Login

**Cause**: Callback route not configured correctly

**Fix**:
1. Check that `/auth/callback` route exists in your app
2. Make sure redirect URLs in Supabase include the callback URL
3. For HashRouter, make sure URLs include `#`:
   ```
   http://localhost:5173/#/auth/callback
   ```

### Issue: Stuck on Google Login Page

**Cause**: Network or configuration issue

**Fix**:
1. Clear browser cache and cookies
2. Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
3. Close browser completely and reopen
4. Check browser console for errors (F12 → Console tab)
5. Verify `.env` file is in project root (not `src/`)

### Issue: Getting CORS Errors

**Cause**: Your domain not authorized in Google Console

**Fix**:
1. Go to Google Cloud Console
2. **APIs & Services** → **Credentials**
3. Click your OAuth 2.0 Client ID
4. Under **Authorized JavaScript origins**, add:
   ```
   http://localhost:5173
   http://localhost:3000
   https://yourdomain.com
   ```
5. Save and wait a few minutes

---

## Production Deployment Checklist

Before deploying to production:

### Google Cloud Console

- [ ] Update **Authorized redirect URIs** with production domain
- [ ] Update **Authorized JavaScript origins** with production domain
- [ ] Change application type from "Testing" to "Production" if applicable

### Supabase Dashboard

- [ ] Update **Site URL** in **URL Configuration** to production domain
- [ ] Update **Redirect URLs** to use production domain (https)
- [ ] Verify Google Client ID and Secret are correct

### Your App

- [ ] Update `.env` with production values
- [ ] Set `VITE_OAUTH_REDIRECT_DOMAIN` if using custom domain
- [ ] Run `npm run build` and test production build locally
- [ ] Deploy and test OAuth flow with production URL

### Example Production URLs

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-production-anon-key
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
VITE_OAUTH_REDIRECT_DOMAIN=https://yourdomain.com
```

**Supabase URL Configuration:**
```
Site URL: https://yourdomain.com
Redirect URLs:
- https://yourdomain.com/#/auth/callback
- https://yourdomain.com/#/dashboard/journal
```

**Google Console Authorized URIs:**
```
Redirect URIs:
- https://your-project.supabase.co/auth/v1/callback
- https://yourdomain.com/#/auth/callback
- https://yourdomain.com/#/dashboard/journal

JavaScript Origins:
- https://yourdomain.com
```

---

## Key Configuration Files

### 1. `.env` - Frontend Environment Variables

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_OAUTH_REDIRECT_DOMAIN=https://yourdomain.com
```

### 2. `supabase/config.toml` - Backend Configuration (Local)

```toml
[auth.external.google]
enabled = true
client_id = "your-google-client-id"
secret = "env(SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_SECRET)"
```

### 3. Supabase Dashboard Settings

- **Authentication** → **Providers** → **Google**
  - Client ID
  - Client Secret

- **Authentication** → **URL Configuration**
  - Site URL
  - Redirect URLs

---

## Resources

- [Supabase Google OAuth Guide](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2/web-server-flow)
- [Google Cloud Console](https://console.cloud.google.com/)

---

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review your browser console for errors (F12)
3. Verify all configuration values are correct and match exactly
4. Check Supabase logs in the dashboard
5. Clear cache and try in an incognito window
