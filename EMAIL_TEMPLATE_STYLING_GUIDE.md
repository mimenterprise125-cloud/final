# Gmail Email Template Styling Guide for TradeOne

This guide explains how to style verification and notification emails that users receive from your TradeOne application.

## 📧 Where Email Templates Come From

In TradeOne, verification emails are sent by **Supabase Auth**. You have two options:

1. **Use Supabase's Default Templates** (Basic)
2. **Create Custom Email Templates** (Professional - Recommended)

## 🎨 Option 1: Customize Supabase Email Templates

### Access Supabase Email Templates:

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Go to **Authentication** > **Email Templates**
4. You'll see pre-built templates for:
   - Confirm signup
   - Invite user
   - Magic link
   - Change email
   - Reset password

### Available Templates in Supabase:

Each template has:
- **Subject line**
- **Email body** (HTML + text)
- **Link/button** for action

## 🎯 Option 2: Create Custom Email Templates (Best Practice)

### Step 1: HTML Email Structure

Create professional HTML emails that work in Gmail:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your TradeOne Account</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif; background-color: #f5f5f5;">
    
    <!-- Wrapper -->
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f5f5f5;">
        <tr>
            <td style="padding: 20px;">
                
                <!-- Main Container -->
                <table role="presentation" width="100%" max-width="600px" cellspacing="0" cellpadding="0" style="margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
                            <img src="https://tradeone.vercel.app/favicon.svg" alt="TradeOne" width="48" height="48" style="margin-bottom: 16px;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">Verify Your Email</h1>
                            <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px;">Complete your TradeOne registration</p>
                        </td>
                    </tr>
                    
                    <!-- Body Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            
                            <!-- Greeting -->
                            <p style="margin: 0 0 24px 0; font-size: 16px; color: #1f2937; line-height: 1.6;">
                                Hi {{ user_email }},
                            </p>
                            
                            <!-- Message -->
                            <p style="margin: 0 0 24px 0; font-size: 15px; color: #4b5563; line-height: 1.6;">
                                Welcome to <strong>TradeOne</strong> – your comprehensive trading dashboard and trade copier platform. We're excited to have you on board!
                            </p>
                            
                            <p style="margin: 0 0 32px 0; font-size: 15px; color: #4b5563; line-height: 1.6;">
                                To complete your registration and start trading, please verify your email address by clicking the button below:
                            </p>
                            
                            <!-- CTA Button -->
                            <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 0 0 32px 0;">
                                <tr>
                                    <td style="border-radius: 6px; background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%);">
                                        <a href="{{ confirmation_url }}" style="display: inline-block; padding: 14px 32px; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 6px;">
                                            Verify Email Address
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Alternative Link -->
                            <p style="margin: 0 0 24px 0; font-size: 13px; color: #6b7280;">
                                Or copy and paste this link in your browser:
                            </p>
                            <p style="margin: 0 0 32px 0; font-size: 12px; color: #3b82f6; word-break: break-all;">
                                {{ confirmation_url }}
                            </p>
                            
                            <!-- Important Info -->
                            <div style="background-color: #f0f9ff; border-left: 4px solid #06b6d4; padding: 16px; border-radius: 4px; margin: 0 0 32px 0;">
                                <p style="margin: 0; font-size: 14px; color: #0369a1; font-weight: 500;">
                                    ⏱️ This link expires in 24 hours
                                </p>
                            </div>
                            
                            <!-- Footer Message -->
                            <p style="margin: 0 0 24px 0; font-size: 14px; color: #6b7280; line-height: 1.6;">
                                If you didn't create this account, you can safely ignore this email. Your email won't be confirmed unless you click the button above.
                            </p>
                            
                            <!-- Best Wishes -->
                            <p style="margin: 0; font-size: 14px; color: #4b5563;">
                                Best regards,<br>
                                <strong>The TradeOne Team</strong>
                            </p>
                            
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="border-top: 1px solid #e5e7eb; padding: 24px 30px; background-color: #f9fafb; border-radius: 0 0 8px 8px; text-align: center;">
                            
                            <!-- Social Links -->
                            <div style="margin: 0 0 16px 0;">
                                <a href="https://tradeone.vercel.app" style="color: #3b82f6; text-decoration: none; font-size: 14px; margin: 0 12px;">Visit TradeOne</a>
                                <span style="color: #d1d5db;">•</span>
                                <a href="https://tradeone.vercel.app/support" style="color: #3b82f6; text-decoration: none; font-size: 14px; margin: 0 12px;">Support</a>
                            </div>
                            
                            <!-- Copyright -->
                            <p style="margin: 16px 0 0 0; font-size: 12px; color: #9ca3af;">
                                © 2025 TradeOne. All rights reserved.<br>
                                <a href="https://tradeone.vercel.app/privacy" style="color: #3b82f6; text-decoration: none;">Privacy Policy</a> • 
                                <a href="https://tradeone.vercel.app/terms" style="color: #3b82f6; text-decoration: none;">Terms of Service</a>
                            </p>
                            
                        </td>
                    </tr>
                    
                </table>
                
            </td>
        </tr>
    </table>
    
</body>
</html>
```

## 🎨 CSS Styling Best Practices for Gmail

### 1. **Use Inline Styles Only**
Gmail doesn't support `<style>` tags, so use inline styles:

```html
<!-- ✅ DO THIS -->
<p style="color: #1f2937; font-size: 16px; line-height: 1.6;">Text</p>

<!-- ❌ DON'T DO THIS -->
<style>
  p { color: #1f2937; }
</style>
```

### 2. **Supported Colors**

**TradeOne Brand Colors:**
- **Primary Cyan**: `#06b6d4`
- **Primary Blue**: `#3b82f6`
- **Dark Text**: `#1f2937`
- **Gray Text**: `#6b7280`
- **Background**: `#f5f5f5` or `#ffffff`

```html
<!-- Gradient Header (works in Gmail) -->
<td style="background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%); padding: 40px 20px;">
```

### 3. **Typography**

```html
<!-- Heading -->
<h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">Title</h1>

<!-- Body Text -->
<p style="font-size: 16px; color: #1f2937; line-height: 1.6; margin: 0 0 16px 0;">Text</p>

<!-- Small Text -->
<p style="font-size: 14px; color: #6b7280;">Small text</p>
```

### 4. **Buttons**

```html
<!-- Button with CTA -->
<table role="presentation" cellspacing="0" cellpadding="0">
    <tr>
        <td style="border-radius: 6px; background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%);">
            <a href="{{ confirmation_url }}" style="display: inline-block; padding: 14px 32px; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 6px;">
                Verify Email
            </a>
        </td>
    </tr>
</table>
```

### 5. **Spacing & Padding**

```html
<!-- Container with padding -->
<td style="padding: 40px 30px;">

<!-- Margin between elements -->
<p style="margin: 0 0 24px 0;">Paragraph with bottom margin</p>

<!-- Responsive padding -->
<td style="padding: 20px; /* mobile */">
```

### 6. **Borders & Shadows**

```html
<!-- Border -->
<td style="border-top: 1px solid #e5e7eb;">

<!-- Rounded corners -->
<table style="border-radius: 8px;">

<!-- Shadow (limited Gmail support - use background instead) -->
<td style="background-color: #f9fafb; border: 1px solid #e5e7eb;">
```

## 📱 Responsive Design

### Use Tables for Structure (Gmail Compatible):

```html
<!-- Responsive container -->
<table role="presentation" width="100%" max-width="600px" cellspacing="0" cellpadding="0">
    <tr>
        <td>Content</td>
    </tr>
</table>

<!-- Stack on mobile -->
<table role="presentation" width="100%" cellspacing="0" cellpadding="0">
    <tr>
        <td style="width: 50%; padding: 10px;">
            Column 1
        </td>
        <td style="width: 50%; padding: 10px;">
            Column 2
        </td>
    </tr>
</table>
```

## 🔗 How to Use This Template in Supabase

### Method 1: Copy Paste in Supabase Dashboard

1. Go to **Authentication** > **Email Templates**
2. Click **Confirm signup**
3. Replace the HTML with the template above
4. Update variables:
   - `{{ user_email }}` - User's email
   - `{{ confirmation_url }}` - Supabase confirmation link
5. Click **Save**

### Method 2: Use Environment Variables

In your Supabase config:

```typescript
// In your auth service
const emailTemplate = `
  ${htmlTemplate}
`;

// Send confirmation email
await supabase.auth.signUp({
  email: userEmail,
  password: userPassword,
  options: {
    emailRedirectTo: 'https://tradeone.vercel.app/dashboard/journal',
  }
});
```

## 📧 Email Template Variables

Available variables in Supabase templates:

```html
{{ user_email }}           <!-- User's email address -->
{{ confirmation_url }}     <!-- Verification link -->
{{ token_hash }}           <!-- Token hash -->
{{ link }}                 <!-- Alternative link format -->
{{ token }}                <!-- Token only -->
```

## 🎨 Complete Email Templates for All Email Types

### 1. Reset Password Email

Use this for the **Reset Password** template in Supabase:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your TradeOne Password</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif; background-color: #f5f5f5;">
    
    <!-- Wrapper -->
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f5f5f5;">
        <tr>
            <td style="padding: 20px;">
                
                <!-- Main Container -->
                <table role="presentation" width="100%" max-width="600px" cellspacing="0" cellpadding="0" style="margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
                            <img src="https://tradeone.vercel.app/favicon.svg" alt="TradeOne" width="48" height="48" style="margin-bottom: 16px;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">Reset Your Password</h1>
                            <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px;">Secure your TradeOne account</p>
                        </td>
                    </tr>
                    
                    <!-- Body Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            
                            <!-- Greeting -->
                            <p style="margin: 0 0 24px 0; font-size: 16px; color: #1f2937; line-height: 1.6;">
                                Hi {{ user_email }},
                            </p>
                            
                            <!-- Message -->
                            <p style="margin: 0 0 24px 0; font-size: 15px; color: #4b5563; line-height: 1.6;">
                                We received a request to reset the password for your TradeOne account. Click the button below to create a new password:
                            </p>
                            
                            <!-- CTA Button -->
                            <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 0 0 32px 0;">
                                <tr>
                                    <td style="border-radius: 6px; background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%);">
                                        <a href="{{ confirmation_url }}" style="display: inline-block; padding: 14px 32px; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 6px;">
                                            Reset Password
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Alternative Link -->
                            <p style="margin: 0 0 24px 0; font-size: 13px; color: #6b7280;">
                                Or copy and paste this link in your browser:
                            </p>
                            <p style="margin: 0 0 32px 0; font-size: 12px; color: #f59e0b; word-break: break-all;">
                                {{ confirmation_url }}
                            </p>
                            
                            <!-- Important Info -->
                            <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 4px; margin: 0 0 32px 0;">
                                <p style="margin: 0; font-size: 14px; color: #92400e; font-weight: 500;">
                                    ⏱️ This link expires in 1 hour
                                </p>
                            </div>
                            
                            <!-- Footer Message -->
                            <p style="margin: 0 0 24px 0; font-size: 14px; color: #6b7280; line-height: 1.6;">
                                If you didn't request this password reset, please ignore this email. Your account will remain secure.
                            </p>
                            
                            <!-- Best Wishes -->
                            <p style="margin: 0; font-size: 14px; color: #4b5563;">
                                Best regards,<br>
                                <strong>The TradeOne Team</strong>
                            </p>
                            
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="border-top: 1px solid #e5e7eb; padding: 24px 30px; background-color: #f9fafb; border-radius: 0 0 8px 8px; text-align: center;">
                            
                            <!-- Links -->
                            <div style="margin: 0 0 16px 0;">
                                <a href="https://tradeone.vercel.app" style="color: #3b82f6; text-decoration: none; font-size: 14px; margin: 0 12px;">Visit TradeOne</a>
                                <span style="color: #d1d5db;">•</span>
                                <a href="https://tradeone.vercel.app/support" style="color: #3b82f6; text-decoration: none; font-size: 14px; margin: 0 12px;">Support</a>
                            </div>
                            
                            <!-- Copyright -->
                            <p style="margin: 16px 0 0 0; font-size: 12px; color: #9ca3af;">
                                © 2025 TradeOne. All rights reserved.
                            </p>
                            
                        </td>
                    </tr>
                    
                </table>
                
            </td>
        </tr>
    </table>
    
</body>
</html>
```

---

### 2. Change Email Address Confirmation

Use this for the **Change Email** template in Supabase:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirm Your New Email Address</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif; background-color: #f5f5f5;">
    
    <!-- Wrapper -->
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f5f5f5;">
        <tr>
            <td style="padding: 20px;">
                
                <!-- Main Container -->
                <table role="presentation" width="100%" max-width="600px" cellspacing="0" cellpadding="0" style="margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
                            <img src="https://tradeone.vercel.app/favicon.svg" alt="TradeOne" width="48" height="48" style="margin-bottom: 16px;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">Confirm New Email</h1>
                            <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px;">Update your TradeOne email address</p>
                        </td>
                    </tr>
                    
                    <!-- Body Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            
                            <!-- Greeting -->
                            <p style="margin: 0 0 24px 0; font-size: 16px; color: #1f2937; line-height: 1.6;">
                                Hi {{ user_email }},
                            </p>
                            
                            <!-- Message -->
                            <p style="margin: 0 0 24px 0; font-size: 15px; color: #4b5563; line-height: 1.6;">
                                A request has been made to change the email address associated with your TradeOne account. To confirm this change, click the button below:
                            </p>
                            
                            <!-- CTA Button -->
                            <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 0 0 32px 0;">
                                <tr>
                                    <td style="border-radius: 6px; background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%);">
                                        <a href="{{ confirmation_url }}" style="display: inline-block; padding: 14px 32px; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 6px;">
                                            Confirm Email Change
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Alternative Link -->
                            <p style="margin: 0 0 24px 0; font-size: 13px; color: #6b7280;">
                                Or copy and paste this link in your browser:
                            </p>
                            <p style="margin: 0 0 32px 0; font-size: 12px; color: #8b5cf6; word-break: break-all;">
                                {{ confirmation_url }}
                            </p>
                            
                            <!-- Important Info -->
                            <div style="background-color: #f3e8ff; border-left: 4px solid #8b5cf6; padding: 16px; border-radius: 4px; margin: 0 0 32px 0;">
                                <p style="margin: 0; font-size: 14px; color: #5b21b6; font-weight: 500;">
                                    ⏱️ This link expires in 24 hours
                                </p>
                            </div>
                            
                            <!-- Footer Message -->
                            <p style="margin: 0 0 24px 0; font-size: 14px; color: #6b7280; line-height: 1.6;">
                                If you didn't request this change, please ignore this email. Your email address will not be changed unless you confirm it.
                            </p>
                            
                            <!-- Best Wishes -->
                            <p style="margin: 0; font-size: 14px; color: #4b5563;">
                                Best regards,<br>
                                <strong>The TradeOne Team</strong>
                            </p>
                            
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="border-top: 1px solid #e5e7eb; padding: 24px 30px; background-color: #f9fafb; border-radius: 0 0 8px 8px; text-align: center;">
                            
                            <!-- Links -->
                            <div style="margin: 0 0 16px 0;">
                                <a href="https://tradeone.vercel.app" style="color: #3b82f6; text-decoration: none; font-size: 14px; margin: 0 12px;">Visit TradeOne</a>
                                <span style="color: #d1d5db;">•</span>
                                <a href="https://tradeone.vercel.app/support" style="color: #3b82f6; text-decoration: none; font-size: 14px; margin: 0 12px;">Support</a>
                            </div>
                            
                            <!-- Copyright -->
                            <p style="margin: 16px 0 0 0; font-size: 12px; color: #9ca3af;">
                                © 2025 TradeOne. All rights reserved.
                            </p>
                            
                        </td>
                    </tr>
                    
                </table>
                
            </td>
        </tr>
    </table>
    
</body>
</html>
```

---

### 3. Magic Link / Passwordless Login Email

Use this for the **Magic Link** template in Supabase:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your TradeOne Login Link</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif; background-color: #f5f5f5;">
    
    <!-- Wrapper -->
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f5f5f5;">
        <tr>
            <td style="padding: 20px;">
                
                <!-- Main Container -->
                <table role="presentation" width="100%" max-width="600px" cellspacing="0" cellpadding="0" style="margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
                            <img src="https://tradeone.vercel.app/favicon.svg" alt="TradeOne" width="48" height="48" style="margin-bottom: 16px;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">Sign In to TradeOne</h1>
                            <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px;">Secure passwordless login</p>
                        </td>
                    </tr>
                    
                    <!-- Body Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            
                            <!-- Greeting -->
                            <p style="margin: 0 0 24px 0; font-size: 16px; color: #1f2937; line-height: 1.6;">
                                Hi {{ user_email }},
                            </p>
                            
                            <!-- Message -->
                            <p style="margin: 0 0 24px 0; font-size: 15px; color: #4b5563; line-height: 1.6;">
                                Click the button below to securely log in to your TradeOne account:
                            </p>
                            
                            <!-- CTA Button -->
                            <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 0 0 32px 0;">
                                <tr>
                                    <td style="border-radius: 6px; background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
                                        <a href="{{ confirmation_url }}" style="display: inline-block; padding: 14px 32px; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 6px;">
                                            Sign In to TradeOne
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Alternative Link -->
                            <p style="margin: 0 0 24px 0; font-size: 13px; color: #6b7280;">
                                Or copy and paste this link in your browser:
                            </p>
                            <p style="margin: 0 0 32px 0; font-size: 12px; color: #10b981; word-break: break-all;">
                                {{ confirmation_url }}
                            </p>
                            
                            <!-- Important Info -->
                            <div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 16px; border-radius: 4px; margin: 0 0 32px 0;">
                                <p style="margin: 0; font-size: 14px; color: #065f46; font-weight: 500;">
                                    ⏱️ This link expires in 1 hour
                                </p>
                            </div>
                            
                            <!-- Footer Message -->
                            <p style="margin: 0 0 24px 0; font-size: 14px; color: #6b7280; line-height: 1.6;">
                                If you didn't request this login link, please ignore this email. Your account remains secure.
                            </p>
                            
                            <!-- Best Wishes -->
                            <p style="margin: 0; font-size: 14px; color: #4b5563;">
                                Best regards,<br>
                                <strong>The TradeOne Team</strong>
                            </p>
                            
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="border-top: 1px solid #e5e7eb; padding: 24px 30px; background-color: #f9fafb; border-radius: 0 0 8px 8px; text-align: center;">
                            
                            <!-- Links -->
                            <div style="margin: 0 0 16px 0;">
                                <a href="https://tradeone.vercel.app" style="color: #3b82f6; text-decoration: none; font-size: 14px; margin: 0 12px;">Visit TradeOne</a>
                                <span style="color: #d1d5db;">•</span>
                                <a href="https://tradeone.vercel.app/support" style="color: #3b82f6; text-decoration: none; font-size: 14px; margin: 0 12px;">Support</a>
                            </div>
                            
                            <!-- Copyright -->
                            <p style="margin: 16px 0 0 0; font-size: 12px; color: #9ca3af;">
                                © 2025 TradeOne. All rights reserved.
                            </p>
                            
                        </td>
                    </tr>
                    
                </table>
                
            </td>
        </tr>
    </table>
    
</body>
</html>
```

---

### 4. Invite User / Team Invitation Email

Use this for the **Invite User** template in Supabase:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>You're Invited to TradeOne</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif; background-color: #f5f5f5;">
    
    <!-- Wrapper -->
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f5f5f5;">
        <tr>
            <td style="padding: 20px;">
                
                <!-- Main Container -->
                <table role="presentation" width="100%" max-width="600px" cellspacing="0" cellpadding="0" style="margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #ec4899 0%, #f43f5e 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
                            <img src="https://tradeone.vercel.app/favicon.svg" alt="TradeOne" width="48" height="48" style="margin-bottom: 16px;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">You're Invited! 🎉</h1>
                            <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px;">Join TradeOne and start trading</p>
                        </td>
                    </tr>
                    
                    <!-- Body Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            
                            <!-- Greeting -->
                            <p style="margin: 0 0 24px 0; font-size: 16px; color: #1f2937; line-height: 1.6;">
                                Hi {{ user_email }},
                            </p>
                            
                            <!-- Message -->
                            <p style="margin: 0 0 24px 0; font-size: 15px; color: #4b5563; line-height: 1.6;">
                                You've been invited to join a TradeOne team! Accept this invitation to get started:
                            </p>
                            
                            <!-- CTA Button -->
                            <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 0 0 32px 0;">
                                <tr>
                                    <td style="border-radius: 6px; background: linear-gradient(135deg, #ec4899 0%, #f43f5e 100%);">
                                        <a href="{{ confirmation_url }}" style="display: inline-block; padding: 14px 32px; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 6px;">
                                            Accept Invitation
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Alternative Link -->
                            <p style="margin: 0 0 24px 0; font-size: 13px; color: #6b7280;">
                                Or copy and paste this link in your browser:
                            </p>
                            <p style="margin: 0 0 32px 0; font-size: 12px; color: #ec4899; word-break: break-all;">
                                {{ confirmation_url }}
                            </p>
                            
                            <!-- Important Info -->
                            <div style="background-color: #ffe4e6; border-left: 4px solid #ec4899; padding: 16px; border-radius: 4px; margin: 0 0 32px 0;">
                                <p style="margin: 0; font-size: 14px; color: #831843; font-weight: 500;">
                                    ⏱️ This invitation expires in 7 days
                                </p>
                            </div>
                            
                            <!-- Footer Message -->
                            <p style="margin: 0 0 24px 0; font-size: 14px; color: #6b7280; line-height: 1.6;">
                                If you don't want to accept this invitation, you can ignore this email.
                            </p>
                            
                            <!-- Best Wishes -->
                            <p style="margin: 0; font-size: 14px; color: #4b5563;">
                                Best regards,<br>
                                <strong>The TradeOne Team</strong>
                            </p>
                            
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="border-top: 1px solid #e5e7eb; padding: 24px 30px; background-color: #f9fafb; border-radius: 0 0 8px 8px; text-align: center;">
                            
                            <!-- Links -->
                            <div style="margin: 0 0 16px 0;">
                                <a href="https://tradeone.vercel.app" style="color: #3b82f6; text-decoration: none; font-size: 14px; margin: 0 12px;">Visit TradeOne</a>
                                <span style="color: #d1d5db;">•</span>
                                <a href="https://tradeone.vercel.app/support" style="color: #3b82f6; text-decoration: none; font-size: 14px; margin: 0 12px;">Support</a>
                            </div>
                            
                            <!-- Copyright -->
                            <p style="margin: 16px 0 0 0; font-size: 12px; color: #9ca3af;">
                                © 2025 TradeOne. All rights reserved.
                            </p>
                            
                        </td>
                    </tr>
                    
                </table>
                
            </td>
        </tr>
    </table>
    
</body>
</html>
```

---

## 📋 Template Type Summary

| Template Type | Subject | Expiration | Header Color | Usage |
|---|---|---|---|---|
| **Confirm Signup** | Verify Your Email | 24 hours | Cyan-Blue (#06b6d4 → #3b82f6) | New user registration |
| **Reset Password** | Reset Your Password | 1 hour | Orange (#f59e0b → #f97316) | Forgotten password |
| **Change Email** | Confirm New Email | 24 hours | Purple (#8b5cf6 → #a855f7) | Email address update |
| **Magic Link** | Sign In to TradeOne | 1 hour | Green (#10b981 → #059669) | Passwordless login |
| **Invite User** | You're Invited | 7 days | Pink (#ec4899 → #f43f5e) | Team invitations |

---

## 🚀 How to Deploy All Templates to Supabase

1. Go to **Supabase Dashboard** → **Authentication** → **Email Templates**
2. For each email type below, click the template name and paste the corresponding HTML:
   - **Confirm signup** → Use "Confirm Signup Email" template above
   - **Reset password** → Use "Reset Password Email" template above
   - **Change email** → Use "Change Email Address Confirmation" template above
   - **Magic link** → Use "Magic Link / Passwordless Login Email" template above
   - **Invite user** → Use "Invite User / Team Invitation Email" template above
3. Click **Save** after each one
4. Test by triggering each action in your app

---

## ✨ Pro Tips

- Each template has a **unique color scheme** for visual differentiation
- All templates use the **TradeOne favicon** from your deployment
- Expiration times vary based on security requirements
- All links use `{{ confirmation_url }}` which Supabase automatically populates
- Templates are **fully responsive** on mobile devices

## ✅ Gmail Compatibility Checklist

- [x] Use inline CSS only (no `<style>` tags)
- [x] Use tables for layout
- [x] Use `role="presentation"` on tables
- [x] Set `cellspacing="0"` and `cellpadding="0"`
- [x] Use `width="100%"` for responsive design
- [x] Use `max-width="600px"` for container
- [x] Use web-safe fonts (Arial, Helvetica, Times New Roman)
- [x] Fallback colors for unsupported features
- [x] Alt text for images
- [x] Test in Litmus or Email on Acid

## 🧪 Testing Email Templates

### Tools to Test:

1. **Litmus** (https://www.litmus.com) - Preview in 70+ email clients
2. **Email on Acid** (https://www.emailonacid.com) - SPAM testing
3. **Stripo** (https://stripo.email) - Email builder
4. **MJML** (https://mjml.io) - Responsive email framework

### Test Checklist:

- [ ] Looks good in Gmail (web)
- [ ] Looks good in Gmail (mobile)
- [ ] Looks good in Outlook
- [ ] Looks good in Apple Mail
- [ ] Images load correctly
- [ ] Links are clickable
- [ ] Colors display correctly
- [ ] Text is readable

## 📊 Recommended Email Size

- **Total size**: < 100KB
- **Images**: < 50KB total
- **Width**: 600px (max)
- **Aspect ratio**: 16:9 for header

## 🚀 Deploy to Supabase

1. Finalize your HTML template
2. Go to Supabase Dashboard > Authentication > Email Templates
3. Click each template (Confirm signup, Reset password, etc.)
4. Paste your custom HTML
5. Click **Save**
6. Test by signing up with a test account

## 📝 Template Variables Summary

| Variable | Where | Usage |
|----------|-------|-------|
| `{{ user_email }}` | All templates | Display user's email |
| `{{ confirmation_url }}` | Signup/Email change | Verification link |
| `{{ token_hash }}` | All templates | Token for verification |
| `{{ token }}` | All templates | Raw token |

---

**Pro Tip:** Use `https://tradeone.vercel.app/favicon.svg` in your email template so your brand logo always displays correctly! 🎨

