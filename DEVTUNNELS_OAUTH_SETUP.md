# Google OAuth Setup - DevTunnels Configuration

## Your Current Setup

✅ **Forwarding URL Configured:**
```
https://zg5791kj-8080.inc1.devtunnels.ms
```

This is set in your `.env` file as:
```env
VITE_OAUTH_REDIRECT_DOMAIN=https://zg5791kj-8080.inc1.devtunnels.ms
```

## What You Need to Do

### Step 1: Add Redirect URI to Google OAuth Console

1. Go to **Google Cloud Console** → Your Project
2. Navigate to **APIs & Services** → **Credentials**
3. Click on your **OAuth 2.0 Client ID**
4. Scroll to **Authorized redirect URIs**
5. Add this exact URL:
   ```
   https://zg5791kj-8080.inc1.devtunnels.ms/dashboard
   ```
6. Click **Save**

### Step 2: Add Callback URL to Supabase

1. Go to **Supabase Dashboard** → Your Project
2. Navigate to **Authentication** → **Providers** → **Google**
3. Make sure your Google OAuth Client ID and Secret are set
4. Also ensure Supabase callback URL is in Google Console:
   ```
   https://jabzseuicykmvfedxbwn.supabase.co/auth/v1/callback
   ```

### Step 3: Verify Your Configuration

Your application now has:
- **Supabase URL**: `https://jabzseuicykmvfedxbwn.supabase.co`
- **Forwarding Domain**: `https://zg5791kj-8080.inc1.devtunnels.ms`
- **OAuth Redirect**: `https://zg5791kj-8080.inc1.devtunnels.ms/dashboard`

When you click "Sign up with Google", the redirect will use your forwarding URL instead of localhost.

## Important Notes

⚠️ **DevTunnels URLs Change**: 
- Your DevTunnels URL (`zg5791kj-8080.inc1.devtunnels.ms`) is temporary
- If your DevTunnels tunnel expires or resets, you'll get a new URL
- When that happens, you'll need to:
  1. Update `.env` with the new URL
  2. Update Google OAuth credentials with the new redirect URI
  3. Update Supabase callback URL if needed

## Testing the OAuth Flow

1. Make sure your development server is running:
   ```bash
   npm run dev
   ```

2. Visit your forwarding URL in the browser:
   ```
   https://zg5791kj-8080.inc1.devtunnels.ms
   ```

3. Click "Sign up with Google" or "Login with Google"

4. You should be redirected to:
   ```
   https://zg5791kj-8080.inc1.devtunnels.ms/dashboard
   ```

5. After successful Google OAuth, you'll be logged in to the dashboard

## Troubleshooting

### Still Redirecting to Localhost?
- Clear browser cache and cookies
- Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
- Close and reopen the browser
- Check that `.env` file has the correct forwarding URL

### "Redirect URI mismatch" Error
- Verify the exact redirect URI in Google Console matches: `https://zg5791kj-8080.inc1.devtunnels.ms/dashboard`
- No trailing slashes or extra spaces
- Check for http vs https (must be https for Google OAuth)

### DevTunnels URL Changed
When your tunnel resets and you get a new URL:
1. Update `.env`:
   ```env
   VITE_OAUTH_REDIRECT_DOMAIN=https://NEW-URL.inc1.devtunnels.ms
   ```
2. Update Google OAuth credentials with new URL
3. Restart development server
4. Test the OAuth flow again

## How It Works

The app automatically uses `VITE_OAUTH_REDIRECT_DOMAIN` from your `.env` file instead of `window.location.origin`. This means:

- ✅ All OAuth redirects go to your forwarding URL
- ✅ Works with any tunneling service (ngrok, DevTunnels, Cloudflare Tunnel, etc.)
- ✅ No hardcoded localhost references
- ✅ Same code works in dev and production

## For Production

When deploying to production:
```env
VITE_OAUTH_REDIRECT_DOMAIN=https://youractual domain.com
```

Then add that domain to Google OAuth:
```
https://youractual domain.com/dashboard
```

---

**Next Step**: Go to Google Cloud Console and add your DevTunnels redirect URI, then test the OAuth flow!
