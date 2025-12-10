# Complete Email Templates - Ready to Copy & Paste

All templates below are ready to use. Simply copy the HTML code and paste it directly into Supabase Email Templates.

---

## 1️⃣ CONFIRM SIGNUP EMAIL

**Use for:** Supabase → Authentication → Email Templates → **Confirm signup**

**Copy this entire HTML code:**

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
                    <tr>
                        <td style="padding: 40px 30px;">
                            <p style="margin: 0 0 24px 0; font-size: 16px; color: #1f2937; line-height: 1.6;">
                                Hi {{ user_email }},
                            </p>
                            <p style="margin: 0 0 24px 0; font-size: 15px; color: #4b5563; line-height: 1.6;">
                                Welcome to <strong>TradeOne</strong> – your comprehensive trading dashboard and trade copier platform. We're excited to have you on board!
                            </p>
                            <p style="margin: 0 0 32px 0; font-size: 15px; color: #4b5563; line-height: 1.6;">
                                To complete your registration and start trading, please verify your email address by clicking the button below:
                            </p>
                            <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 0 0 32px 0;">
                                <tr>
                                    <td style="border-radius: 6px; background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%);">
                                        <a href="{{ confirmation_url }}" style="display: inline-block; padding: 14px 32px; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 6px;">
                                            Verify Email Address
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            <p style="margin: 0 0 24px 0; font-size: 13px; color: #6b7280;">
                                Or copy and paste this link in your browser:
                            </p>
                            <p style="margin: 0 0 32px 0; font-size: 12px; color: #3b82f6; word-break: break-all;">
                                {{ confirmation_url }}
                            </p>
                            <div style="background-color: #f0f9ff; border-left: 4px solid #06b6d4; padding: 16px; border-radius: 4px; margin: 0 0 32px 0;">
                                <p style="margin: 0; font-size: 14px; color: #0369a1; font-weight: 500;">
                                    ⏱️ This link expires in 24 hours
                                </p>
                            </div>
                            <p style="margin: 0 0 24px 0; font-size: 14px; color: #6b7280; line-height: 1.6;">
                                If you didn't create this account, you can safely ignore this email. Your email won't be confirmed unless you click the button above.
                            </p>
                            <p style="margin: 0; font-size: 14px; color: #4b5563;">
                                Best regards,<br>
                                <strong>The TradeOne Team</strong>
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="border-top: 1px solid #e5e7eb; padding: 24px 30px; background-color: #f9fafb; border-radius: 0 0 8px 8px; text-align: center;">
                            <div style="margin: 0 0 16px 0;">
                                <a href="https://tradeone.vercel.app" style="color: #3b82f6; text-decoration: none; font-size: 14px; margin: 0 12px;">Visit TradeOne</a>
                                <span style="color: #d1d5db;">•</span>
                                <a href="https://tradeone.vercel.app/support" style="color: #3b82f6; text-decoration: none; font-size: 14px; margin: 0 12px;">Support</a>
                            </div>
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

---

## 2️⃣ RESET PASSWORD EMAIL

**Use for:** Supabase → Authentication → Email Templates → **Reset password**

**Copy this entire HTML code:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your TradeOne Password</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif; background-color: #f5f5f5;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f5f5f5;">
        <tr>
            <td style="padding: 20px;">
                <table role="presentation" width="100%" max-width="600px" cellspacing="0" cellpadding="0" style="margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <tr>
                        <td style="background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
                            <img src="https://tradeone.vercel.app/favicon.svg" alt="TradeOne" width="48" height="48" style="margin-bottom: 16px;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">Reset Your Password</h1>
                            <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px;">Secure your TradeOne account</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 40px 30px;">
                            <p style="margin: 0 0 24px 0; font-size: 16px; color: #1f2937; line-height: 1.6;">
                                Hi {{ user_email }},
                            </p>
                            <p style="margin: 0 0 24px 0; font-size: 15px; color: #4b5563; line-height: 1.6;">
                                We received a request to reset the password for your TradeOne account. Click the button below to create a new password:
                            </p>
                            <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 0 0 32px 0;">
                                <tr>
                                    <td style="border-radius: 6px; background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%);">
                                        <a href="{{ confirmation_url }}" style="display: inline-block; padding: 14px 32px; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 6px;">
                                            Reset Password
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            <p style="margin: 0 0 24px 0; font-size: 13px; color: #6b7280;">
                                Or copy and paste this link in your browser:
                            </p>
                            <p style="margin: 0 0 32px 0; font-size: 12px; color: #f59e0b; word-break: break-all;">
                                {{ confirmation_url }}
                            </p>
                            <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 4px; margin: 0 0 32px 0;">
                                <p style="margin: 0; font-size: 14px; color: #92400e; font-weight: 500;">
                                    ⏱️ This link expires in 1 hour
                                </p>
                            </div>
                            <p style="margin: 0 0 24px 0; font-size: 14px; color: #6b7280; line-height: 1.6;">
                                If you didn't request this password reset, please ignore this email. Your account will remain secure.
                            </p>
                            <p style="margin: 0; font-size: 14px; color: #4b5563;">
                                Best regards,<br>
                                <strong>The TradeOne Team</strong>
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="border-top: 1px solid #e5e7eb; padding: 24px 30px; background-color: #f9fafb; border-radius: 0 0 8px 8px; text-align: center;">
                            <div style="margin: 0 0 16px 0;">
                                <a href="https://tradeone.vercel.app" style="color: #3b82f6; text-decoration: none; font-size: 14px; margin: 0 12px;">Visit TradeOne</a>
                                <span style="color: #d1d5db;">•</span>
                                <a href="https://tradeone.vercel.app/support" style="color: #3b82f6; text-decoration: none; font-size: 14px; margin: 0 12px;">Support</a>
                            </div>
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

## 3️⃣ CHANGE EMAIL ADDRESS CONFIRMATION EMAIL

**Use for:** Supabase → Authentication → Email Templates → **Change email**

**Copy this entire HTML code:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirm Your New Email Address</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif; background-color: #f5f5f5;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f5f5f5;">
        <tr>
            <td style="padding: 20px;">
                <table role="presentation" width="100%" max-width="600px" cellspacing="0" cellpadding="0" style="margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <tr>
                        <td style="background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
                            <img src="https://tradeone.vercel.app/favicon.svg" alt="TradeOne" width="48" height="48" style="margin-bottom: 16px;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">Confirm New Email</h1>
                            <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px;">Update your TradeOne email address</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 40px 30px;">
                            <p style="margin: 0 0 24px 0; font-size: 16px; color: #1f2937; line-height: 1.6;">
                                Hi {{ user_email }},
                            </p>
                            <p style="margin: 0 0 24px 0; font-size: 15px; color: #4b5563; line-height: 1.6;">
                                A request has been made to change the email address associated with your TradeOne account. To confirm this change, click the button below:
                            </p>
                            <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 0 0 32px 0;">
                                <tr>
                                    <td style="border-radius: 6px; background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%);">
                                        <a href="{{ confirmation_url }}" style="display: inline-block; padding: 14px 32px; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 6px;">
                                            Confirm Email Change
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            <p style="margin: 0 0 24px 0; font-size: 13px; color: #6b7280;">
                                Or copy and paste this link in your browser:
                            </p>
                            <p style="margin: 0 0 32px 0; font-size: 12px; color: #8b5cf6; word-break: break-all;">
                                {{ confirmation_url }}
                            </p>
                            <div style="background-color: #f3e8ff; border-left: 4px solid #8b5cf6; padding: 16px; border-radius: 4px; margin: 0 0 32px 0;">
                                <p style="margin: 0; font-size: 14px; color: #5b21b6; font-weight: 500;">
                                    ⏱️ This link expires in 24 hours
                                </p>
                            </div>
                            <p style="margin: 0 0 24px 0; font-size: 14px; color: #6b7280; line-height: 1.6;">
                                If you didn't request this change, please ignore this email. Your email address will not be changed unless you confirm it.
                            </p>
                            <p style="margin: 0; font-size: 14px; color: #4b5563;">
                                Best regards,<br>
                                <strong>The TradeOne Team</strong>
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="border-top: 1px solid #e5e7eb; padding: 24px 30px; background-color: #f9fafb; border-radius: 0 0 8px 8px; text-align: center;">
                            <div style="margin: 0 0 16px 0;">
                                <a href="https://tradeone.vercel.app" style="color: #3b82f6; text-decoration: none; font-size: 14px; margin: 0 12px;">Visit TradeOne</a>
                                <span style="color: #d1d5db;">•</span>
                                <a href="https://tradeone.vercel.app/support" style="color: #3b82f6; text-decoration: none; font-size: 14px; margin: 0 12px;">Support</a>
                            </div>
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

## 4️⃣ MAGIC LINK / PASSWORDLESS LOGIN EMAIL

**Use for:** Supabase → Authentication → Email Templates → **Magic link**

**Copy this entire HTML code:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your TradeOne Login Link</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif; background-color: #f5f5f5;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f5f5f5;">
        <tr>
            <td style="padding: 20px;">
                <table role="presentation" width="100%" max-width="600px" cellspacing="0" cellpadding="0" style="margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <tr>
                        <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
                            <img src="https://tradeone.vercel.app/favicon.svg" alt="TradeOne" width="48" height="48" style="margin-bottom: 16px;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">Sign In to TradeOne</h1>
                            <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px;">Secure passwordless login</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 40px 30px;">
                            <p style="margin: 0 0 24px 0; font-size: 16px; color: #1f2937; line-height: 1.6;">
                                Hi {{ user_email }},
                            </p>
                            <p style="margin: 0 0 24px 0; font-size: 15px; color: #4b5563; line-height: 1.6;">
                                Click the button below to securely log in to your TradeOne account:
                            </p>
                            <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 0 0 32px 0;">
                                <tr>
                                    <td style="border-radius: 6px; background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
                                        <a href="{{ confirmation_url }}" style="display: inline-block; padding: 14px 32px; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 6px;">
                                            Sign In to TradeOne
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            <p style="margin: 0 0 24px 0; font-size: 13px; color: #6b7280;">
                                Or copy and paste this link in your browser:
                            </p>
                            <p style="margin: 0 0 32px 0; font-size: 12px; color: #10b981; word-break: break-all;">
                                {{ confirmation_url }}
                            </p>
                            <div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 16px; border-radius: 4px; margin: 0 0 32px 0;">
                                <p style="margin: 0; font-size: 14px; color: #065f46; font-weight: 500;">
                                    ⏱️ This link expires in 1 hour
                                </p>
                            </div>
                            <p style="margin: 0 0 24px 0; font-size: 14px; color: #6b7280; line-height: 1.6;">
                                If you didn't request this login link, please ignore this email. Your account remains secure.
                            </p>
                            <p style="margin: 0; font-size: 14px; color: #4b5563;">
                                Best regards,<br>
                                <strong>The TradeOne Team</strong>
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="border-top: 1px solid #e5e7eb; padding: 24px 30px; background-color: #f9fafb; border-radius: 0 0 8px 8px; text-align: center;">
                            <div style="margin: 0 0 16px 0;">
                                <a href="https://tradeone.vercel.app" style="color: #3b82f6; text-decoration: none; font-size: 14px; margin: 0 12px;">Visit TradeOne</a>
                                <span style="color: #d1d5db;">•</span>
                                <a href="https://tradeone.vercel.app/support" style="color: #3b82f6; text-decoration: none; font-size: 14px; margin: 0 12px;">Support</a>
                            </div>
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

## 5️⃣ INVITE USER / TEAM INVITATION EMAIL

**Use for:** Supabase → Authentication → Email Templates → **Invite user**

**Copy this entire HTML code:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>You're Invited to TradeOne</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif; background-color: #f5f5f5;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f5f5f5;">
        <tr>
            <td style="padding: 20px;">
                <table role="presentation" width="100%" max-width="600px" cellspacing="0" cellpadding="0" style="margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <tr>
                        <td style="background: linear-gradient(135deg, #ec4899 0%, #f43f5e 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
                            <img src="https://tradeone.vercel.app/favicon.svg" alt="TradeOne" width="48" height="48" style="margin-bottom: 16px;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">You're Invited! 🎉</h1>
                            <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px;">Join TradeOne and start trading</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 40px 30px;">
                            <p style="margin: 0 0 24px 0; font-size: 16px; color: #1f2937; line-height: 1.6;">
                                Hi {{ user_email }},
                            </p>
                            <p style="margin: 0 0 24px 0; font-size: 15px; color: #4b5563; line-height: 1.6;">
                                You've been invited to join a TradeOne team! Accept this invitation to get started:
                            </p>
                            <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 0 0 32px 0;">
                                <tr>
                                    <td style="border-radius: 6px; background: linear-gradient(135deg, #ec4899 0%, #f43f5e 100%);">
                                        <a href="{{ confirmation_url }}" style="display: inline-block; padding: 14px 32px; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 6px;">
                                            Accept Invitation
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            <p style="margin: 0 0 24px 0; font-size: 13px; color: #6b7280;">
                                Or copy and paste this link in your browser:
                            </p>
                            <p style="margin: 0 0 32px 0; font-size: 12px; color: #ec4899; word-break: break-all;">
                                {{ confirmation_url }}
                            </p>
                            <div style="background-color: #ffe4e6; border-left: 4px solid #ec4899; padding: 16px; border-radius: 4px; margin: 0 0 32px 0;">
                                <p style="margin: 0; font-size: 14px; color: #831843; font-weight: 500;">
                                    ⏱️ This invitation expires in 7 days
                                </p>
                            </div>
                            <p style="margin: 0 0 24px 0; font-size: 14px; color: #6b7280; line-height: 1.6;">
                                If you don't want to accept this invitation, you can ignore this email.
                            </p>
                            <p style="margin: 0; font-size: 14px; color: #4b5563;">
                                Best regards,<br>
                                <strong>The TradeOne Team</strong>
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="border-top: 1px solid #e5e7eb; padding: 24px 30px; background-color: #f9fafb; border-radius: 0 0 8px 8px; text-align: center;">
                            <div style="margin: 0 0 16px 0;">
                                <a href="https://tradeone.vercel.app" style="color: #3b82f6; text-decoration: none; font-size: 14px; margin: 0 12px;">Visit TradeOne</a>
                                <span style="color: #d1d5db;">•</span>
                                <a href="https://tradeone.vercel.app/support" style="color: #3b82f6; text-decoration: none; font-size: 14px; margin: 0 12px;">Support</a>
                            </div>
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

## 📋 QUICK REFERENCE

| Email Type | Use in Supabase | Color | Expiry |
|---|---|---|---|
| 1️⃣ Confirm Signup | Confirm signup | Cyan-Blue | 24 hours |
| 2️⃣ Reset Password | Reset password | Orange | 1 hour |
| 3️⃣ Change Email | Change email | Purple | 24 hours |
| 4️⃣ Magic Link | Magic link | Green | 1 hour |
| 5️⃣ Invite User | Invite user | Pink | 7 days |

---

## ✅ HOW TO USE

1. **Go to Supabase Dashboard**
   - Navigate to: `Authentication` → `Email Templates`

2. **For each template:**
   - Click on the template name (e.g., "Confirm signup")
   - Copy the complete HTML code from above
   - Paste into the email body field
   - Click **Save**

3. **Test**
   - Sign up with test account
   - Verify email comes through
   - Click link to confirm it works

**That's it! All templates are ready to use.** 🚀
