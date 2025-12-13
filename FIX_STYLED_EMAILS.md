# 🚨 FIX: Styled Emails Not Showing

## Problem
Emails are coming as plain text instead of styled HTML.

## Root Cause
HTML templates were not properly pasted into Supabase Email Templates, OR you pasted into wrong field.

---

## ✅ SOLUTION: Step-by-Step Fix

### Step 1: Open Supabase Dashboard
1. Go to: https://supabase.com/dashboard
2. Select your project
3. Navigate to: **Authentication** → **Email Templates**

### Step 2: For EACH Email Template

You'll see a form like this:

```
┌─────────────────────────────────────┐
│ Subject:                            │
│ [Text field - keep default or edit]│
│                                     │
│ Message (Body):                     │
│ [Large text area - PASTE HTML HERE]│
│                                     │
│ [Save button]                       │
└─────────────────────────────────────┘
```

### Step 3: Paste FULL HTML Code

**CRITICAL**: You must paste the **ENTIRE HTML** starting with `<!DOCTYPE html>` all the way to `</html>`

#### ✅ CORRECT Example (Confirm Signup):

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your TradeOne Account</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif; background-color: #f5f5f5;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f5f5f5;">
        <tr>
            <td style="padding: 20px;">
                <table role="presentation" width="100%" max-width="600px" cellspacing="0" cellpadding="0" style="margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <tr>
                        <td style="background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
                            <img src="https://tradeone.vercel.app/favicon.svg" alt="TradeOne" width="48" height="48" style="margin-bottom: 16px;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">Verify Your Email</h1>
                            <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px;">Complete your TradeOne registration</p>
                        </td>
                    </tr>
                    ... [REST OF HTML] ...
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
```

#### ❌ WRONG - Don't do this:
```
Just the body content without <!DOCTYPE html>...
```

---

## 📋 Which Template to Update

Based on your error message "You have been invited", you're seeing the **Invite user** template.

Update these templates in order:

### 1. **Confirm signup** (for new user registration)
- File: `EMAIL_TEMPLATES_COMPLETE.md` → Section "1️⃣ CONFIRM SIGNUP EMAIL"
- Supabase: Authentication → Email Templates → **Confirm signup**

### 2. **Invite user** (for team invitations) ← **THIS IS YOUR ISSUE**
- File: `EMAIL_TEMPLATES_COMPLETE.md` → Section "5️⃣ INVITE USER"
- Supabase: Authentication → Email Templates → **Invite user**

### 3. **Reset password** (for password resets)
- File: `EMAIL_TEMPLATES_COMPLETE.md` → Section "2️⃣ RESET PASSWORD EMAIL"
- Supabase: Authentication → Email Templates → **Reset password**

### 4. **Change email** (for email changes)
- File: `EMAIL_TEMPLATES_COMPLETE.md` → Section "3️⃣ CHANGE EMAIL ADDRESS"
- Supabase: Authentication → Email Templates → **Change email**

### 5. **Magic link** (for passwordless login - optional)
- File: `EMAIL_TEMPLATES_COMPLETE.md` → Section "4️⃣ MAGIC LINK"
- Supabase: Authentication → Email Templates → **Magic link**

---

## 🎯 Quick Fix for Your Current Issue

Since you're getting "You have been invited", fix the **Invite user** template:

1. Open `EMAIL_TEMPLATES_COMPLETE.md`
2. Scroll to **"5️⃣ INVITE USER / TEAM INVITATION EMAIL"**
3. Copy the ENTIRE HTML code block (starts with `<!DOCTYPE html>`)
4. Go to Supabase: **Authentication** → **Email Templates** → **Invite user**
5. Paste into the **Message (Body)** field (NOT Subject)
6. Click **Save**
7. Test again

---

## ✅ Verification Steps

After updating templates:

1. **Clear your test**: Delete any pending invitations
2. **Send new test email**: 
   ```typescript
   await supabase.auth.signUp({
     email: 'test@example.com',
     password: 'password123'
   });
   ```
3. **Check email**: Should now show styled version with:
   - ✓ Colored gradient header
   - ✓ TradeOne logo
   - ✓ Styled button
   - ✓ Professional layout

---

## 🔍 Debugging Checklist

If still plain text after updating:

- [ ] Did you paste into **Message (Body)** field? (not Subject)
- [ ] Did you paste the **ENTIRE HTML** including `<!DOCTYPE html>`?
- [ ] Did you click **Save** button after pasting?
- [ ] Did you wait 30 seconds for Supabase to update?
- [ ] Did you send a NEW email (not checking old ones)?
- [ ] Is your email client blocking HTML? (try different email provider)

---

## 📸 Visual Guide

### ❌ What you're seeing now:
```
Plain text email:
--------------------
You have been invited

You have been invited to create a user on https://tradeone.vercel.app. 
Follow this link to accept the invite:

Accept the invite

Alternatively, enter the code: 63769403
```

### ✅ What you SHOULD see after fix:
```
[Beautiful gradient header with logo]
━━━━━━━━━━━━━━━━━━━━━━━
    🎉 You're Invited!
    Join TradeOne
━━━━━━━━━━━━━━━━━━━━━━━

Hi test@example.com,

You've been invited to join a 
TradeOne team!

[Styled gradient button: Accept Invitation]

Or copy link:
https://tradeone.vercel.app/...

⏱️ This invitation expires in 7 days

[Professional footer with links]
```

---

## 💡 Pro Tip

After pasting HTML, you can test the template directly in Supabase:
- Some Supabase versions have a "Preview" button
- Or send yourself a test email immediately

---

## 🆘 Still Not Working?

If emails are STILL plain text after following all steps:

1. **Check email client settings**: Gmail sometimes blocks external images
2. **Try different email**: Some providers strip HTML (use Gmail, Outlook, ProtonMail)
3. **Verify Supabase version**: Older projects might need migration
4. **Check browser**: Try incognito mode or different browser
5. **Contact Supabase support**: Rare but possible platform issue

---

## 📞 Need More Help?

If still having issues, provide:
- Screenshot of Supabase Email Templates page (show the Message field)
- Which email template you're testing (Confirm signup, Invite user, etc.)
- Email client you're using (Gmail, Outlook, Apple Mail, etc.)
