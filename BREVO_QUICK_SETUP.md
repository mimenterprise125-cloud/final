# ⚡ Quick Setup: Brevo + Supabase Email

## 🎯 5-Minute Setup

### 1. Brevo Credentials
```
Go to: https://app.brevo.com → Settings → SMTP & API
Copy: SMTP Key (not API key!)
```

### 2. Supabase SMTP
```
Dashboard → Settings → Authentication → SMTP Settings
Enable Custom SMTP:
  Host: smtp-relay.brevo.com
  Port: 587
  Username: your-brevo-email@domain.com
  Password: your-brevo-smtp-key
  Sender: noreply@yourdomain.com
  Name: TradeOne
```

### 3. Update Templates
```
Authentication → Email Templates
- Confirm signup → Copy HTML from EMAIL_TEMPLATES_COMPLETE.md (section 1)
- Reset password → Copy HTML from EMAIL_TEMPLATES_COMPLETE.md (section 2)
- Change email → Copy HTML from EMAIL_TEMPLATES_COMPLETE.md (section 3)
- Magic link → Copy HTML from EMAIL_TEMPLATES_COMPLETE.md (section 4)
- Invite user → Copy HTML from EMAIL_TEMPLATES_COMPLETE.md (section 5)
```

### 4. Set Redirect URLs
```
Settings → Authentication → URL Configuration
Site URL: https://yourdomain.com (or http://localhost:5173)
Redirect URLs: 
  - http://localhost:5173/**
  - https://yourdomain.com/**
```

### 5. Test
```typescript
// Signup test
await supabase.auth.signUp({
  email: 'test@example.com',
  password: 'password123',
  options: {
    emailRedirectTo: `${window.location.origin}/dashboard`
  }
});

// Check email inbox → Click link → Should redirect to /dashboard
```

---

## 🎨 Customize Branding

In EMAIL_TEMPLATES_COMPLETE.md, find and replace:

```html
<!-- Logo -->
<img src="https://tradeone.vercel.app/favicon.svg">
<!-- Replace with your logo URL -->

<!-- Links -->
<a href="https://tradeone.vercel.app">
<!-- Replace with your domain -->

<!-- Colors (optional) -->
background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)
<!-- Change gradient colors -->
```

---

## 🔍 Quick Troubleshooting

| Problem | Solution |
|---|---|
| Email not sending | Check Brevo logs: app.brevo.com/log |
| Goes to spam | Verify domain in Brevo + add SPF/DKIM |
| Wrong redirect | Check Site URL + emailRedirectTo in code |
| SMTP auth failed | Use SMTP Key (not API key) |
| Variables not replacing | Use `{{ confirmation_url }}` with spaces |

---

## 📊 Monitor

- **Brevo Logs**: https://app.brevo.com/log (all sent emails)
- **Supabase Logs**: Settings → API Logs (auth events)

---

## ✅ Production Checklist

- [ ] SMTP configured
- [ ] All templates updated
- [ ] Site URL = production domain
- [ ] Domain verified in Brevo
- [ ] Test emails work
- [ ] Logo/branding updated

---

**Need more details?** → See BREVO_EMAIL_SETUP.md
**Email templates?** → See EMAIL_TEMPLATES_COMPLETE.md
