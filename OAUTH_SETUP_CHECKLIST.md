# OAuth Setup Checklist - DevTunnels

## Your Configuration
- **Forwarding URL**: `https://zg5791kj-8080.inc1.devtunnels.ms`
- **OAuth Redirect**: `https://zg5791kj-8080.inc1.devtunnels.ms/dashboard`
- **Supabase**: `https://jabzseuicykmvfedxbwn.supabase.co`

---

## ✅ Checklist

### Phase 1: Google Cloud Console Configuration
- [ ] Go to https://console.cloud.google.com/
- [ ] Select your project
- [ ] Navigate to **APIs & Services** → **Credentials**
- [ ] Click on your **OAuth 2.0 Client ID**
- [ ] Scroll to **Authorized redirect URIs**
- [ ] Click **Add URI**
- [ ] Paste: `https://zg5791kj-8080.inc1.devtunnels.ms/dashboard`
- [ ] Click **Save**

### Phase 2: Supabase Google OAuth Setup
- [ ] Go to https://app.supabase.com/
- [ ] Select your project: `jabzseuicykmvfedxbwn`
- [ ] Go to **Authentication** → **Providers**
- [ ] Click on **Google**
- [ ] Verify your **Client ID** is set
- [ ] Verify your **Client Secret** is set
- [ ] Ensure callback URL exists in Google Console:
  - [ ] `https://jabzseuicykmvfedxbwn.supabase.co/auth/v1/callback`

### Phase 3: Verify .env Configuration
- [ ] Open `.env` in your project root
- [ ] Verify this line exists:
  ```
  VITE_OAUTH_REDIRECT_DOMAIN=https://zg5791kj-8080.inc1.devtunnels.ms
  ```
- [ ] Do NOT include `/dashboard` in the domain (code adds it automatically)

### Phase 4: Test OAuth Flow
- [ ] Start dev server: `npm run dev`
- [ ] Open browser to: `https://zg5791kj-8080.inc1.devtunnels.ms`
- [ ] Click "Sign up with Google" button
- [ ] You should be redirected to Google login
- [ ] After login, you should be redirected to:
  ```
  https://zg5791kj-8080.inc1.devtunnels.ms/dashboard
  ```
- [ ] Check browser console for any errors
- [ ] Verify you're logged in to the dashboard

---

## If OAuth Still Fails

### Try These Steps:

1. **Clear Everything**
   ```
   - Close browser completely
   - Clear cache and cookies for your domain
   - Hard refresh (Ctrl+Shift+R)
   - Close dev server and restart (npm run dev)
   ```

2. **Verify Redirect URI in Google Console**
   ```
   Exact match required:
   https://zg5791kj-8080.inc1.devtunnels.ms/dashboard
   
   NOT: https://zg5791kj-8080.inc1.devtunnels.ms
   NOT: https://zg5791kj-8080.inc1.devtunnels.ms/dashboard/
   NOT: http://zg5791kj-8080.inc1.devtunnels.ms/dashboard
   ```

3. **Check Browser Console**
   - Open DevTools (F12)
   - Go to Console tab
   - Look for error messages mentioning "redirect"
   - Share any errors you see

4. **Verify HTTPS**
   - Your forwarding URL MUST be `https://` (not http)
   - Google OAuth requires HTTPS
   - DevTunnels provides HTTPS by default ✅

5. **Check Network Tab**
   - Open DevTools (F12)
   - Go to Network tab
   - Click "Sign up with Google"
   - Look for requests to Google and Supabase
   - Check if any requests are being blocked (red status)

---

## Common Issues & Solutions

### Issue: Still Redirecting to localhost
**Solution**: 
- Restart dev server completely
- Clear browser cache
- Check that `.env` file is in project root (not in src/)
- Verify `VITE_OAUTH_REDIRECT_DOMAIN` has no trailing slash

### Issue: "Redirect URI mismatch" Error
**Solution**:
- Copy-paste the exact URI from browser address bar
- Add to Google Console exactly as shown
- Wait a few minutes for Google to process the change
- Refresh browser

### Issue: Blank page after Google login
**Solution**:
- Check browser console for errors
- Verify Supabase credentials in `.env`
- Ensure Google Client ID and Secret are correct in Supabase
- Check that callback URL is added to Google Console

### Issue: DevTunnels URL changed
**Solution** (when your tunnel resets):
1. Get the new URL from your terminal
2. Update `.env`:
   ```
   VITE_OAUTH_REDIRECT_DOMAIN=https://NEW-URL.inc1.devtunnels.ms
   ```
3. Update Google Console with new URL
4. Restart dev server
5. Test again

---

## Quick Command Reference

**Start Dev Server:**
```bash
npm run dev
```

**View .env Configuration:**
```bash
cat .env
```

**Test if forwarding URL is accessible:**
```bash
curl -I https://zg5791kj-8080.inc1.devtunnels.ms
```

---

## Support Resources

- [Google OAuth Setup Guide](./GOOGLE_OAUTH_SETUP.md)
- [Supabase Auth Docs](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [DevTunnels Documentation](https://learn.microsoft.com/en-us/azure/dev-tunnels/)

---

## Next Steps

1. ✅ **Add redirect URI to Google Console** (most important!)
2. ✅ **Restart dev server**
3. ✅ **Test OAuth flow**
4. ✅ **Check browser console for errors**

Once OAuth is working, you can continue building your application!
