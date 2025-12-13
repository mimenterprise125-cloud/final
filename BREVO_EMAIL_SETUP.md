# Brevo Email Setup with Supabase

This guide explains how to configure Brevo SMTP with Supabase for beautiful, styled email verification (no OTP required).

---

## 📋 Prerequisites

- Brevo account: https://app.brevo.com
- Supabase project: https://supabase.com
- Access to both dashboards

---

## Step 1: Get Brevo SMTP Credentials

1. **Login to Brevo Dashboard**: https://app.brevo.com
2. **Navigate to**: Settings → **SMTP & API**
3. **Copy these values**:
   - SMTP Server: `smtp-relay.brevo.com`
   - Port: `587`
   - Login: Your Brevo account email
   - SMTP Key: Click "Generate a new SMTP key" or copy existing one

4. **Important**: Use SMTP Key, NOT API Key!

---

## Step 2: Configure Supabase SMTP Settings

1. **Go to Supabase Dashboard**: https://supabase.com/dashboard
2. **Navigate to**: Your Project → **Settings** → **Authentication**
3. **Scroll to**: "SMTP Settings" section
4. **Click**: "Enable Custom SMTP"

5. **Enter Brevo Credentials**:
   ```
   SMTP Host: smtp-relay.brevo.com
   SMTP Port: 587
   SMTP Username: your-brevo-email@domain.com
   SMTP Password: your-brevo-smtp-key
   Sender email: noreply@yourdomain.com
   Sender name: TradeOne
   ```

6. **Click**: "Save" and test the connection

---

## Step 3: Configure Redirect URLs

1. **In Supabase Dashboard**: Settings → **Authentication** → **URL Configuration**
2. **Set Site URL**: 
   - Production: `https://yourdomain.com`
   - Development: `http://localhost:5173`

3. **Add Redirect URLs**:
   ```
   http://localhost:5173/**
   https://yourdomain.com/**
   ```

4. **Save** settings

---

## Step 4: Update Email Templates in Supabase

Now paste the HTML templates from `EMAIL_TEMPLATES_COMPLETE.md`:

### 🔹 Confirm Signup Email
1. Go to: **Authentication** → **Email Templates** → **Confirm signup**
2. Copy HTML from section "1️⃣ CONFIRM SIGNUP EMAIL" in `EMAIL_TEMPLATES_COMPLETE.md`
3. Paste into email body
4. Keep `{{ confirmation_url }}` and `{{ user_email }}` as-is (Supabase auto-replaces)
5. **Save**

### 🔹 Reset Password Email
1. Go to: **Authentication** → **Email Templates** → **Reset password**
2. Copy HTML from section "2️⃣ RESET PASSWORD EMAIL"
3. Paste and **Save**

### 🔹 Change Email Address
1. Go to: **Authentication** → **Email Templates** → **Change email**
2. Copy HTML from section "3️⃣ CHANGE EMAIL ADDRESS"
3. Paste and **Save**

### 🔹 Magic Link (Optional)
1. Go to: **Authentication** → **Email Templates** → **Magic link**
2. Copy HTML from section "4️⃣ MAGIC LINK"
3. Paste and **Save**

### 🔹 Invite User (Optional)
1. Go to: **Authentication** → **Email Templates** → **Invite user**
2. Copy HTML from section "5️⃣ INVITE USER"
3. Paste and **Save**

---

## Step 5: Customize Templates (Optional)

Update branding in the templates:

### Change Logo URL:
Find: `https://tradeone.vercel.app/favicon.svg`
Replace with: Your hosted logo URL

### Change Domain Links:
Find: `https://tradeone.vercel.app`
Replace with: Your domain

### Change Colors (optional):
- Signup: `#06b6d4` (cyan-blue)
- Password Reset: `#f59e0b` (orange)
- Change Email: `#8b5cf6` (purple)
- Magic Link: `#10b981` (green)
- Invite: `#ec4899` (pink)

---

## Step 6: Test Email Flow

### Test Signup:
```typescript
const { data, error } = await supabase.auth.signUp({
  email: 'test@example.com',
  password: 'SecurePassword123!',
  options: {
    emailRedirectTo: `${window.location.origin}/dashboard`,
  }
});
```

### Test Password Reset:
```typescript
const { error } = await supabase.auth.resetPasswordForEmail(
  'test@example.com',
  {
    redirectTo: `${window.location.origin}/reset-password`,
  }
);
```

### Verification:
1. Check email inbox (and spam folder)
2. Verify styled template appears correctly
3. Click verification link
4. Confirm redirect works

---

## 🎨 Email Template Variables

Supabase automatically replaces these variables:

| Variable | Description | Example |
|---|---|---|
| `{{ user_email }}` | User's email address | user@example.com |
| `{{ confirmation_url }}` | Verification/reset link | https://app.supabase.co/verify?token=... |
| `{{ .Email }}` | Alternative email variable | user@example.com |
| `{{ .Token }}` | Confirmation token | abc123... |
| `{{ .TokenHash }}` | Hashed token | hash123... |

**Important**: Use `{{ confirmation_url }}` for links - Supabase generates the full URL with token.

---

## 🔧 Troubleshooting

### Problem: Email not sending
**Solutions:**
- Check Brevo SMTP logs: https://app.brevo.com/log
- Verify SMTP credentials in Supabase are correct
- Check spam folder
- Ensure sender email is verified in Brevo

### Problem: Wrong redirect after email verification
**Solutions:**
- Check Site URL in Supabase settings
- Verify redirect URLs include your domain
- Ensure `emailRedirectTo` is set in signup calls

### Problem: Template variables not replacing
**Solutions:**
- Use exact syntax: `{{ confirmation_url }}` (with spaces)
- Some variables are case-sensitive
- Check Supabase docs for current variable syntax

### Problem: "SMTP authentication failed"
**Solutions:**
- Use SMTP Key, NOT API Key from Brevo
- Regenerate SMTP key in Brevo dashboard
- Double-check username is your Brevo account email

### Problem: Emails go to spam
**Solutions:**
- Verify your domain in Brevo (Settings → Senders)
- Add SPF and DKIM records to your domain DNS
- Use a custom domain email (not Gmail/Yahoo)

---

## 📊 Monitor Email Delivery

**Brevo Dashboard**: https://app.brevo.com/log
- View all sent emails
- Check delivery status
- See open rates and click rates
- Debug failed sends

**Supabase Logs**: Settings → API Logs
- View auth events
- Check for SMTP errors

---

## 🚀 Production Checklist

Before going live:

- [ ] Custom SMTP configured in Supabase
- [ ] All 5 email templates updated with HTML
- [ ] Site URL set to production domain
- [ ] Redirect URLs include production domain
- [ ] Sender domain verified in Brevo
- [ ] SPF/DKIM records added to DNS
- [ ] Test emails sent and received successfully
- [ ] Email links redirect correctly
- [ ] Branding/logo updated in templates
- [ ] Terms/Privacy links updated in footer

---

## 🔐 Security Best Practices

1. **Never expose SMTP credentials** in frontend code
2. **Use environment variables** for sensitive config
3. **Enable email rate limiting** in Supabase to prevent spam
4. **Verify sender domain** to prevent spoofing
5. **Use HTTPS** for all redirect URLs
6. **Set short token expiry** (1-24 hours)

---

## 📚 Additional Resources

- **Brevo SMTP Docs**: https://developers.brevo.com/docs/send-emails-with-smtp
- **Supabase Auth Docs**: https://supabase.com/docs/guides/auth
- **Email Template Guide**: https://supabase.com/docs/guides/auth/auth-email-templates
- **Troubleshooting**: https://supabase.com/docs/guides/auth/troubleshooting

---

## 💡 Pro Tips

1. **Test with real email addresses** (not temporary/disposable)
2. **Use email testing tools**: https://www.mail-tester.com
3. **Keep templates mobile-responsive** (already done in provided templates)
4. **Monitor bounce rates** in Brevo dashboard
5. **Set up Brevo webhooks** for delivery tracking (optional)

---

## ✅ Summary

With Brevo SMTP + Supabase:
- ✓ Beautiful styled emails (no coding required)
- ✓ Reliable delivery (Brevo handles infrastructure)
- ✓ Easy customization (just edit HTML templates)
- ✓ Full control over branding
- ✓ Production-ready out of the box

**No custom backend code needed** - Supabase handles everything via SMTP!
