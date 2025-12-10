# Google OAuth Setup Guide for TradeOne

This guide will help you configure Google OAuth authentication for TradeOne with automatic redirect to the Journal Dashboard after sign-in.

## 📋 Prerequisites

- Google Cloud Console account
- Supabase project set up
- TradeOne application running locally or deployed

## 🔧 Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top
3. Click "NEW PROJECT"
4. Enter project name: `TradeOne` (or your preferred name)
5. Click "CREATE"
6. Wait for the project to be created, then select it

## 🔑 Step 2: Enable Google+ API

1. In the Google Cloud Console, go to **APIs & Services** > **Library**
2. Search for `Google+ API`
3. Click on it and press **ENABLE**
4. Wait for it to enable

## 🎯 Step 3: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **+ CREATE CREDENTIALS** at the top
3. Select **OAuth client ID**
4. If prompted, configure the **OAuth consent screen** first:
   - Click **CONFIGURE CONSENT SCREEN**
   - Select **External** for User Type
   - Click **CREATE**
   - Fill in the form:
     - **App name**: TradeOne
     - **User support email**: your-email@example.com
     - **Developer contact**: your-email@example.com
   - Click **SAVE AND CONTINUE**
   - Skip optional scopes, click **SAVE AND CONTINUE**
   - Review and click **BACK TO DASHBOARD**

5. Now create the OAuth client ID:
   - Go back to **APIs & Services** > **Credentials**
   - Click **+ CREATE CREDENTIALS** > **OAuth client ID**
   - Choose **Web application**
   - Name it: `TradeOne Web Client`
   - Add Authorized JavaScript origins:
     - `http://localhost:5173` (local development)
     - `http://localhost:3000` (alternative local)
     - `https://tradeone.vercel.app` (production domain)
   - Add Authorized redirect URIs:
     - `http://localhost:5173/auth/callback` (local)
     - `http://localhost:5173` (local fallback)
     - `https://tradeone.vercel.app/auth/callback` (production)
     - `https://tradeone.vercel.app/dashboard/journal` (production redirect)
     - `https://jabzseuicykmvfedxbwn.supabase.co/auth/v1/callback` (Supabase callback)
   - Click **CREATE**
   - Copy your **Client ID** and **Client Secret**

## 🔐 Step 4: Configure Supabase Auth

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** > **Providers**
3. Find and enable **Google**
4. Paste your Google OAuth credentials:
   - **Client ID**: (from Step 3)
   - **Client Secret**: (from Step 3)
5. Click **SAVE**

## 💾 Step 5: Set Environment Variables

Create or update your `.env.local` file in the project root:

```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

**Note:** You don't need `VITE_GOOGLE_CLIENT_ID` because Supabase handles the OAuth flow on the backend. The Google Client ID & Secret are only needed in:
- Google Cloud Console (to generate credentials)
- Supabase Admin Panel (Authentication > Providers > Google)

## 🔄 Step 6: Configure Redirect Logic in AuthProvider

The `AuthProvider` in `src/lib/AuthProvider.tsx` handles Google OAuth redirects. Here's how it works:

### Current Flow:

1. **User clicks "Sign in with Google"** on Login page
2. Supabase initiates OAuth flow
3. User completes Google authentication
4. Google redirects to callback URL
5. Supabase confirms authentication
6. User is redirected based on their state

### To Redirect to Journal Dashboard After Sign-in:

The redirect is handled in `src/lib/AuthProvider.tsx`. Here's the relevant logic:

```typescript
// After Google OAuth completes, Supabase fires the onAuthStateChange event
supabase.auth.onAuthStateChange(async (event, session) => {
  if (event === 'SIGNED_IN' && session) {
    // User just signed in
    // Navigate to Journal Dashboard
    navigate('/dashboard/journal');
  }
});
```

## 📱 Step 7: Update Login Component

The Login component (`src/pages/Login.tsx`) already has Google OAuth button. It should look like:

```tsx
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthProvider';

export default function Login() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  const handleGoogleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard/journal`,
      },
    });
    
    if (error) {
      console.error('Google login error:', error);
      toast({ title: 'Login failed', variant: 'destructive' });
    }
  };

  return (
    <div>
      {/* Your login UI */}
      <button onClick={handleGoogleLogin}>
        Sign in with Google
      </button>
    </div>
  );
}
```

## 🎯 Step 8: Handle OAuth Callback

Supabase automatically handles the callback. The flow is:

1. **User completes Google sign-in**
2. **Google redirects to**: `https://your-domain/auth/v1/callback?code=xxx&state=xxx`
3. **Supabase exchanges code for session**
4. **Redirects to**: `${redirectTo}` parameter (Journal Dashboard in our case)

## 🚀 Step 9: Test Locally

1. Run the development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:5173/login`

3. Click "Sign in with Google"

4. Complete Google authentication

5. You should be redirected to `/dashboard/journal`

## 🔍 Troubleshooting

### Issue: Redirect Not Working

**Solution**: Check that:
- ✅ `redirectTo` parameter is set correctly in `signInWithOAuth`
- ✅ The redirect URL is added in Google Cloud Console
- ✅ The route `/dashboard/journal` exists in your app
- ✅ Check browser console for errors

### Issue: "Callback URL mismatch"

**Solution**: 
- Ensure the redirect URI in Google Cloud matches your app URL
- Add `http://localhost:5173/auth/callback` to authorized URIs
- For production, add your domain URLs

### Issue: CORS Errors

**Solution**:
- Add your domain to **Authorized JavaScript origins** in Google OAuth settings
- Ensure Supabase project URL is whitelisted

### Issue: User Not Authenticated After Redirect

**Solution**:
- Verify Supabase session is being stored in localStorage
- Check that `AuthProvider` is wrapping your app
- Verify user role/permissions in Supabase `auth.users` table

## 📊 Monitoring Sign-ins

To track successful Google sign-ins, add logging in `AuthProvider.tsx`:

```typescript
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN') {
    console.log('✅ User signed in:', session?.user?.email);
    console.log('📊 Provider:', session?.user?.app_metadata?.provider);
  }
});
```

## 🔒 Security Best Practices

1. **Never commit secrets**: Keep `VITE_SUPABASE_ANON_KEY` in `.env.local`, not in version control
2. **Use HTTPS in production**: Google OAuth requires HTTPS for production URLs
3. **Validate redirect URLs**: Only redirect to trusted routes in your app
4. **Enable row-level security**: Ensure Supabase RLS policies protect user data
5. **Rotate OAuth credentials**: Periodically update Google OAuth credentials

## 📚 Additional Resources

- [Supabase Google OAuth Guide](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Supabase Auth Helpers](https://supabase.com/docs/guides/auth/auth-helpers)

## ✅ Verification Checklist

- [ ] Google Cloud Project created
- [ ] Google+ API enabled
- [ ] OAuth credentials created (Client ID & Secret)
- [ ] Authorized URIs configured in Google Cloud
- [ ] Supabase Google provider enabled with credentials
- [ ] Environment variables set in `.env.local`
- [ ] Login component has Google sign-in button
- [ ] Redirect URL set to `/dashboard/journal`
- [ ] AuthProvider wraps entire app
- [ ] Journal Dashboard route exists at `/dashboard/journal`
- [ ] Tested locally with successful redirect

---

**Questions?** Check the browser console (F12) for detailed error messages that can help diagnose OAuth issues.
