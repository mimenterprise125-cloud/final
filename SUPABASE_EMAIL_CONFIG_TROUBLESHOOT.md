# Supabase Email Not Arriving - Complete Troubleshooting Guide

## Problem
✅ Email templates are configured (HTML is set up)
❌ But verification emails are still NOT arriving

## Root Cause
Supabase uses **two different email systems**:

### 1. **Email Templates** (What you configured)
- ✅ You set the HTML template
- ✅ This is just the DESIGN of the email
- ❌ This does NOT send the email itself

### 2. **Email Provider** (What's missing)
- This is the actual service that SENDS the email
- Without this, emails can't be delivered even with perfect templates

## Solution: Configure Email Provider in Supabase

### OPTION A: Use Supabase's Built-in Email (Free but limited)

1. Go to **Supabase Dashboard** → Your Project
2. Click **Authentication** in left sidebar
3. Click **Providers** tab
4. Click on **Email** provider
5. Look for section: **"Email Confirmations"** or **"Confirm email"**

Check if these are enabled:
- ☑️ **Enable email confirmations** - MUST BE CHECKED
- ☑️ **Double confirm email change** - optional

6. Scroll down to find:
- **From email address**: Should be `noreply@yourdomain.com` or `noreply@mail.supabase.io`
- If empty, Supabase uses its default

**Issue with Supabase Free Email:**
- Only sends ~3-5 emails per day
- Other emails are silently dropped (no error)
- For testing/production use SMTP instead

### OPTION B: Use SendGrid SMTP (Recommended for Production)

#### Step 1: Create SendGrid Account
1. Go to https://sendgrid.com
2. Sign up for free account
3. Verify email
4. Go to **Settings > API Keys**
5. Create a new API Key (copy it somewhere safe)

#### Step 2: Configure in Supabase
1. Go to **Supabase Dashboard** → Your Project
2. Click **Authentication**
3. Click **Providers** tab
4. Click **Email** provider
5. Scroll down to find **SMTP Settings** (or **Mail Provider**)

6. Select **Custom SMTP**
7. Fill in these details:

```
Host: smtp.sendgrid.net
Port: 587
Username: apikey
Password: <Your SendGrid API Key>
Sender Email: noreply@yourdomain.com (or noreply@mail.supabase.io)
Sender Name: TradeOne
```

8. Click **Test** or **Save**

#### Step 3: Enable Email Confirmations
Still in the Email provider settings:
- ☑️ **Enable email confirmations**
- ☑️ Save

### OPTION C: Use Gmail SMTP (Easiest for Testing)

#### Step 1: Create Gmail App Password
1. Go to https://myaccount.google.com
2. Click **Security** in left sidebar
3. Find **App passwords** (requires 2FA enabled)
4. Select **Mail** and **Windows Computer**
5. Copy the generated 16-character password

#### Step 2: Configure in Supabase
1. Go to **Supabase Dashboard** → Your Project
2. Click **Authentication**
3. Click **Providers** tab
4. Click **Email** provider
5. Look for **SMTP Settings** or **Mail Provider**
6. Select **Custom SMTP**
7. Fill in:

```
Host: smtp.gmail.com
Port: 587
Username: your-email@gmail.com
Password: <16-character app password>
Sender Email: your-email@gmail.com
Sender Name: TradeOne
```

8. Click **Test** or **Save**

### OPTION D: Use Mailgun SMTP

#### Step 1: Create Mailgun Account
1. Go to https://www.mailgun.com
2. Sign up for free account
3. Verify email
4. Go to **Sending > Domain Settings**
5. Copy SMTP credentials

#### Step 2: Configure in Supabase
1. Go to **Supabase Dashboard** → Your Project
2. Click **Authentication**
3. Click **Providers** tab
4. Click **Email** provider
5. Look for **SMTP Settings**
6. Select **Custom SMTP**
7. Fill in Mailgun SMTP details
8. Click **Save**

## After Configuration - Testing

### Test 1: Send Verification Email
1. Go to app Signup page
2. Enter test email and password
3. Check console for:
   ```
   confirmation_sent_at: "2025-12-12T19:39:10..." ← Should be set
   ```

### Test 2: Check Email
1. Go to your email inbox
2. Check **Inbox** first
3. Check **Spam/Junk** folder
4. **IMPORTANT**: Check **Promotions** tab if Gmail (emails often go there)

### Test 3: Verify Email Works
1. Click the verification link in email
2. App should redirect to dashboard
3. You should be authenticated
4. Session should no longer be `null`

## Debugging Checklist

- [ ] Email provider is configured (not just templates)
- [ ] SMTP credentials are correct
- [ ] "Enable email confirmations" is checked
- [ ] Sender email address is set
- [ ] Email template has `{{.ConfirmationURL}}`
- [ ] Check spam/promotions folder
- [ ] Retry after 5 minutes (sometimes email is delayed)
- [ ] Check Supabase project logs for errors (Authentication > Logs)

## Common Issues & Solutions

### Issue: "Connection refused" error
- **Cause**: SMTP host or port wrong
- **Solution**: Double-check SMTP settings from your email provider

### Issue: "Authentication failed" error
- **Cause**: SMTP username or password wrong
- **Solution**: Regenerate credentials and paste correctly (watch for spaces)

### Issue: Email goes to spam
- **Solution 1**: Whitelist sender domain in your email filters
- **Solution 2**: Use a proper domain instead of @mail.supabase.io
- **Solution 3**: Implement DKIM/SPF records (advanced)

### Issue: Supabase Free Email Not Working
- **Cause**: Supabase free plan has daily email limits
- **Solution**: Switch to SendGrid, Gmail, or Mailgun SMTP

### Issue: "Confirm email" toggle is missing
- **Cause**: Supabase version issue or configuration not loaded
- **Solution**: 
  1. Refresh the page
  2. Sign out and back in
  3. Check if you're in the right project

## Quick Checklist for SendGrid (Recommended)

1. ☐ SendGrid account created (free tier is fine)
2. ☐ API Key generated and copied
3. ☐ Supabase Email Provider set to Custom SMTP
4. ☐ Host: smtp.sendgrid.net
5. ☐ Port: 587
6. ☐ Username: apikey
7. ☐ Password: YOUR_SENDGRID_API_KEY
8. ☐ Email confirmations ENABLED
9. ☐ Settings SAVED
10. ☐ Test signup and check email

## If Still Not Working

### Check Supabase Logs:
1. Go to your **Supabase Project Dashboard**
2. Click **Authentication** → **Logs**
3. Look for signup attempts
4. Check for error messages

### Get Support:
1. Check Supabase Discord: https://discord.supabase.io
2. Check Supabase GitHub Issues
3. Check your email provider's logs (SendGrid, Gmail, etc.)
