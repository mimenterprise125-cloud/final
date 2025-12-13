# 🚨 Emails Still Plain Text After Pasting HTML - Advanced Troubleshooting

## Common Issues & Solutions

---

## Issue 1: Email Client Stripping HTML

Some email clients (especially corporate/enterprise) strip HTML for security.

### ✅ Solution: Test with Different Email Provider

Try these email addresses in order:
1. **Gmail** (gmail.com) - Best HTML support
2. **Outlook.com** (outlook.com) - Good support
3. **ProtonMail** - Good support
4. **Apple iCloud** - Good support

❌ **Avoid testing with**:
- Corporate email servers (often strip HTML)
- Some Yahoo Mail accounts (inconsistent)
- Temporary email services (limited HTML support)

---

## Issue 2: Supabase Using Default Template Instead

Supabase might be falling back to default template if HTML has errors.

### ✅ Solution: Verify Template Format

1. **Go to Supabase**: Authentication → Email Templates → [Your Template]

2. **Check the Message Body field contains**:
   - Must start with: `<!DOCTYPE html>`
   - Must end with: `</html>`
   - No extra spaces before `<!DOCTYPE`
   - No markdown code fences (no ````html` tags)

3. **Common mistakes**:

   ❌ **WRONG** - Has markdown code fence:
   ```
   ```html
   <!DOCTYPE html>
   <html>...
   ```
   ```

   ❌ **WRONG** - Missing DOCTYPE:
   ```
   <html>
   <head>...
   ```

   ✅ **CORRECT**:
   ```html
   <!DOCTYPE html>
   <html lang="en">
   <head>
       <meta charset="UTF-8">
   ...
   </html>
   ```

---

## Issue 3: Supabase Needs Time to Propagate

Sometimes Supabase takes a few minutes to update email templates.

### ✅ Solution: Wait and Clear Cache

1. Wait 2-3 minutes after saving
2. Clear browser cache (Ctrl+Shift+Delete)
3. Log out and log back into Supabase Dashboard
4. Send a NEW test email (don't check old ones)

---

## Issue 4: Template Variables Causing Issues

If Supabase variables are incorrect, it might fallback to plain text.

### ✅ Solution: Verify Variables

Make sure these variables are EXACTLY as shown:
- `{{ .Email }}` or `{{ user_email }}`
- `{{ .ConfirmationURL }}` or `{{ confirmation_url }}`

**Try this**: Remove ALL variables temporarily and test with static text:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Test</title>
</head>
<body style="background-color: #f5f5f5; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px;">
        <h1 style="color: #06b6d4;">🎉 Styled Email Test</h1>
        <p style="font-size: 16px; color: #333;">If you see colors and formatting, HTML is working!</p>
        <a href="https://tradeone.vercel.app" style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%); color: white; text-decoration: none; border-radius: 6px;">Click Me</a>
    </div>
</body>
</html>
```

If this works with colors/styling, then issue is with variables. Then add variables back one by one.

---

## Issue 5: Brevo SMTP Might Be Converting to Plain Text

Some SMTP providers convert HTML to plain text if HTML fails validation.

### ✅ Solution: Check Brevo Settings

1. **Go to Brevo Dashboard**: https://app.brevo.com
2. **Navigate to**: Settings → **Senders & IP**
3. **Verify**: Your sender email is verified
4. **Check**: Brevo logs for any HTML parsing errors

Also check Brevo email logs:
- Go to: https://app.brevo.com/log
- Find your test email
- Check if it shows "HTML" or "Plain text" in delivery details

---

## Issue 6: Inline Styles Being Stripped

Some email systems require inline CSS (not `<style>` tags).

### ✅ Solution: Verify Inline Styles

Our templates already use inline styles, but verify:

✅ **CORRECT** (inline):
```html
<td style="background: #06b6d4; padding: 20px;">
```

❌ **WRONG** (style tag):
```html
<style>
.header { background: #06b6d4; }
</style>
<td class="header">
```

---

## 🔬 Diagnostic Test - Step by Step

### Step 1: Test with Minimal HTML

1. Go to Supabase: Authentication → Email Templates → **Confirm signup**

2. **Replace** entire Message Body with this MINIMAL test:

```html
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>Test</title></head>
<body style="background:#red;">
<h1 style="color:blue;">TEST STYLED EMAIL</h1>
<p style="font-size:20px;color:green;">If you see colors, HTML works!</p>
</body>
</html>
```

3. **Save** and send test signup email

4. **Check email**:
   - ✅ If you see BLUE heading and GREEN text → HTML works, issue is with complex template
   - ❌ If still plain text → Issue is with email client or Supabase/Brevo config

---

### Step 2: If Minimal HTML Works

The issue is with the complex template. Common problems:

1. **Image URLs failing**: `<img src="https://tradeone.vercel.app/favicon.svg">`
   - Try removing the `<img>` tag temporarily
   
2. **Gradient CSS not supported**: `linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)`
   - Try solid color instead: `background: #06b6d4;`

3. **Complex table structure**:
   - Some email clients have table nesting limits

---

### Step 3: If Even Minimal HTML is Plain Text

The issue is with your setup:

#### A. Check Email Client
Send test to multiple emails:
- Gmail: [Create test account](https://gmail.com)
- Outlook: [Create test account](https://outlook.com)

#### B. Check Supabase Auth Settings
1. Go to: Settings → Authentication → **Email Settings**
2. Verify: "Enable email confirmations" is ON
3. Check: "Secure email change" setting

#### C. Check Brevo Integration
1. Supabase Dashboard → Settings → Authentication → **SMTP Settings**
2. Click "Send test email"
3. If test fails, SMTP credentials are wrong

---

## 🎯 Quick Diagnostic Commands

### Test 1: Send Email via Supabase
```typescript
const { data, error } = await supabase.auth.signUp({
  email: 'yourtest@gmail.com',  // Use Gmail!
  password: 'TestPassword123!',
  options: {
    emailRedirectTo: 'https://tradeone.vercel.app/dashboard'
  }
});
console.log('Signup result:', data, error);
```

### Test 2: Check Supabase Logs
1. Supabase Dashboard → Settings → **Logs**
2. Filter by: `auth`
3. Look for email send events
4. Check for errors like "template parsing failed"

### Test 3: Check Brevo Delivery
1. Brevo Dashboard: https://app.brevo.com/log
2. Find your test email
3. Check "Content Type": Should say "HTML"
4. If says "Text", Brevo is converting to plain text

---

## 🔧 Nuclear Option: Manual HTML Email Test

Bypass Supabase templates entirely to verify Brevo works:

### Create a test file: `test-brevo-email.html`

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Direct Brevo Test</title>
</head>
<body style="background-color: #f0f0f0; padding: 40px; font-family: Arial, sans-serif;">
    <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <h1 style="color: #06b6d4; font-size: 32px; margin: 0 0 20px 0;">🎨 Brevo HTML Test</h1>
        <p style="font-size: 18px; color: #333; line-height: 1.6;">
            If you can see this with <strong style="color: #f43f5e;">colors</strong> and 
            <span style="background: #fbbf24; padding: 2px 8px; border-radius: 3px;">formatting</span>, 
            then Brevo HTML emails are working!
        </p>
        <div style="margin: 30px 0;">
            <a href="https://tradeone.vercel.app" 
               style="display: inline-block; 
                      padding: 15px 30px; 
                      background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%); 
                      color: white; 
                      text-decoration: none; 
                      border-radius: 8px; 
                      font-weight: bold;
                      font-size: 16px;">
                Click This Styled Button
            </a>
        </div>
        <p style="font-size: 14px; color: #666; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e5e5;">
            This is a direct HTML email test via Brevo SMTP.
        </p>
    </div>
</body>
</html>
```

Send this directly via Brevo's API or test send feature.

---

## 📋 Checklist - Before Asking for More Help

Please verify:

- [ ] You pasted HTML into **Message (Body)** field (not Subject)
- [ ] HTML starts with `<!DOCTYPE html>` (no extra characters before)
- [ ] HTML ends with `</html>` (no extra characters after)
- [ ] No markdown code fences (no ````html` tags) in Supabase
- [ ] You clicked **Save** after pasting
- [ ] You waited 2-3 minutes after saving
- [ ] You sent a **NEW** test email (not checking old ones)
- [ ] You tested with Gmail or Outlook.com email address
- [ ] Brevo SMTP credentials are correct in Supabase
- [ ] Sender email is verified in Brevo dashboard

---

## 🆘 If Still Not Working

### Provide These Details:

1. **Screenshot** of Supabase Email Templates page showing:
   - Which template (Confirm signup, Invite, etc.)
   - The Message (Body) field with HTML visible
   
2. **Email client** you're testing with:
   - Gmail? Outlook? Corporate email?
   
3. **First 20 lines** of what you pasted (to verify format)

4. **Brevo log** screenshot showing:
   - Email delivery status
   - Content type (HTML or Text)

5. **Supabase logs** screenshot showing:
   - Any email-related errors

---

## 💡 Most Likely Issue

Based on "still showing plain text", the most common causes are:

1. **70% chance**: Email client is stripping HTML → Test with Gmail
2. **20% chance**: Markdown code fences in Supabase → Check for ````html` tags
3. **10% chance**: Supabase cache → Wait 3 minutes, send new email

Try testing with a **fresh Gmail account** - that should work if HTML is properly pasted.
