# Critical OAuth Configuration - Supabase URL Setup

## 🔴 Issue: 404 Error After Google OAuth

You're getting:
```
GET https://tradeone.vercel.app/dashboard/journal 404 (Not Found)
```

This happens because **Supabase doesn't know where to redirect after OAuth completion**.

---

## ✅ FIX: Configure Supabase URL Settings

### Step 1: Go to Supabase Dashboard

1. Navigate to: https://app.supabase.com/
2. Select your project: **prop-dashboard**
3. Go to **Authentication** → **URL Configuration**

### Step 2: Set Site URL

**For Production (tradeone.vercel.app):**
```
https://tradeone.vercel.app
```

**For Local Development:**
```
http://localhost:5173
```

(If you're testing locally, use localhost. For production, use your actual domain)

### Step 3: Add Redirect URLs

Add BOTH of these redirect URLs (they tell Supabase where to send the user after OAuth):

**For Production:**
```
https://tradeone.vercel.app/auth/callback
https://tradeone.vercel.app/#/auth/callback
https://tradeone.vercel.app/#/dashboard/journal
```

**For Local Development:**
```
http://localhost:5173/auth/callback
http://localhost:5173/#/auth/callback
http://localhost:5173/#/dashboard/journal
```

### Step 4: Verify Google OAuth Provider

Go to **Authentication** → **Providers** → **Google**

Confirm:
- ✅ **Enabled** toggle is ON
- ✅ **Client ID** is set (your Google OAuth Client ID)
- ✅ **Client Secret** is set (your Google OAuth Client Secret)

### Step 5: Add Callback to Google Console

In Google Cloud Console, add the Supabase callback URL:

**Go to:** APIs & Services → Credentials → Your OAuth 2.0 Client ID

**Add to "Authorized Redirect URIs":**
```
https://jabzseuicykmvfedxbwn.supabase.co/auth/v1/callback
```

(This is where Google sends the auth code - Supabase then redirects the user to your app)

---

## 🔑 OAuth Flow with Supabase

```
1. User clicks "Sign in with Google" on your app
   ↓
2. App sends user to: supabase.auth.signInWithOAuth()
   ↓
3. Supabase redirects to: Google's login page
   ↓
4. User logs in with Google
   ↓
5. Google redirects to: https://jabzseuicykmvfedxbwn.supabase.co/auth/v1/callback?code=...
   ↓
6. Supabase verifies the code and redirects to: "Redirect URL" from Supabase config
   ↓
7. Your app loads the callback page: /auth/callback
   ↓
8. Callback verifies session and redirects to: /dashboard/journal
```

---

## 🚨 Why 404 Happens

**Scenario:**
- Supabase is configured to redirect to: `https://tradeone.vercel.app/dashboard/journal`
- But you're using HashRouter, which means URLs are: `https://tradeone.vercel.app/#/dashboard/journal`
- The server tries to find `/dashboard/journal` on the server (without the #)
- That route doesn't exist on the server → 404

**Solution:**
- Always use the `/auth/callback` route (not the final dashboard route)
- Let the callback page check the session and redirect to dashboard

---

## ✅ Correct Configuration

### In Supabase Dashboard → URL Configuration

**Site URL:**
```
https://tradeone.vercel.app
```

**Redirect URLs:**
```
https://tradeone.vercel.app/auth/callback
https://tradeone.vercel.app/#/auth/callback
https://tradeone.vercel.app/#/dashboard/journal
```

### In Your Code (already fixed)

**Login.tsx:**
```typescript
options: { redirectTo: getOAuthRedirectUrl('/auth/callback') }
```

**Signup.tsx:**
```typescript
options: { redirectTo: getOAuthRedirectUrl('/auth/callback') }
```

**Auth Callback:**
```typescript
// Callback page verifies session then redirects
if (data.session) {
  navigate('/dashboard/journal', { replace: true });
}
```

---

## Testing Checklist

- [ ] Open browser DevTools (F12)
- [ ] Go to Console tab
- [ ] Clear all cookies and cache
- [ ] Go to `https://tradeone.vercel.app/` (or localhost)
- [ ] Click "Sign in with Google"
- [ ] Complete Google login
- [ ] Should see: "Completing sign in..." loading page
- [ ] Should redirect to: `/#/auth/callback`
- [ ] Should then redirect to: `/#/dashboard/journal`
- [ ] Should see your trading dashboard

---

## Common Mistakes to Avoid

❌ **Wrong:** Adding `/dashboard/journal` as the redirect URL in Supabase
✅ **Correct:** Adding `/auth/callback` as the redirect URL

❌ **Wrong:** Forgetting the `#` in HashRouter URLs
✅ **Correct:** Using `/#/auth/callback`

❌ **Wrong:** Redirecting directly to dashboard from `signInWithOAuth()`
✅ **Correct:** Redirecting to `/auth/callback` first, then letting the callback page handle the dashboard redirect

---

## After Deployment to Vercel

When you deploy to **tradeone.vercel.app**:

1. Update `.env` in your deployment environment
2. Go to Supabase → URL Configuration
3. Set Site URL to: `https://tradeone.vercel.app`
4. Add Redirect URLs for your production domain
5. Test the OAuth flow on production

---

## Summary

The 404 error is solved by:

1. ✅ Making sure Supabase knows about `/auth/callback` route
2. ✅ Not redirecting directly to dashboard in OAuth (use callback first)
3. ✅ Letting the callback page verify session before redirecting
4. ✅ Ensuring all URLs include `#` for HashRouter compatibility

After these Supabase configuration changes, your OAuth flow should work perfectly! 🎉
