# EmailJS Setup Guide

This guide will help you set up EmailJS to replace the SMTP email functionality in your expense management application.

## Step 1: Create EmailJS Account

1. Go to [https://www.emailjs.com/](https://www.emailjs.com/)
2. Sign up for a free account
3. Verify your email address

## Step 2: Create Email Service

1. In your EmailJS dashboard, go to "Email Services"
2. Click "Add New Service"
3. Choose your email provider (Gmail, Outlook, etc.)
4. Follow the setup instructions for your provider
5. Note down your **Service ID**

## Step 3: Create Email Templates

### Password Reset Template

1. Go to "Email Templates" in your dashboard
2. Click "Create New Template"
3. Name it "password_reset_template"
4. Use this template content:

```
Subject: Password Reset - Expense Management

Hello {{to_name}},

Your password has been reset. Here are your new login credentials:

Email: {{to_email}}
Temporary Password: {{temporary_password}}

Please login and change your password immediately.

Best regards,
{{from_name}}
```

### Welcome Email Template

1. Create another template named "welcome_template"
2. Use this template content:

```
Subject: Welcome to Expense Management System

Hello {{to_name}},

Welcome to the Expense Management System! Your account has been created.

Your login credentials:
Email: {{to_email}}
Temporary Password: {{temporary_password}}

Please login and change your password immediately.

Best regards,
{{from_name}}
```

## Step 4: Get Your Public Key

1. Go to "Account" in your EmailJS dashboard
2. Find your **Public Key** (also called API Key)

## Step 5: Configure the Application

1. Open `src/config/emailjs.js`
2. Replace the placeholder values:

```javascript
export const EMAILJS_CONFIG = {
  SERVICE_ID: 'your_actual_service_id',     // Replace with your Service ID
  PUBLIC_KEY: 'your_actual_public_key',     // Replace with your Public Key
  TEMPLATES: {
    PASSWORD_RESET: 'password_reset_template',
    WELCOME: 'welcome_template'
  }
};
```

## Step 6: Test the Setup

1. Start your application: `npm run dev`
2. Try creating a new user or resetting a password
3. Check your email to see if the emails are being sent

## Troubleshooting

### Common Issues:

1. **"Service not found" error**: Check that your Service ID is correct
2. **"Template not found" error**: Verify your template names match exactly
3. **"Invalid public key" error**: Double-check your Public Key
4. **"The recipients address is empty" error**: 
   - Make sure your EmailJS templates use `{{to_email}}` for the recipient
   - Check that the `to_email` parameter is being passed correctly
   - Verify your email service is properly configured in EmailJS
5. **Emails not sending**: Check your email service provider settings

### Testing Tips:

- Use the EmailJS dashboard to test templates
- Check the browser console for error messages
- Verify your email service is properly connected

## Free Tier Limits

EmailJS free tier includes:
- 200 emails per month
- Basic templates
- Standard support

For higher limits, consider upgrading to a paid plan.

## Security Notes

- Never commit your actual EmailJS credentials to version control
- Use environment variables in production
- Regularly rotate your API keys
- Monitor your email usage to avoid hitting limits
