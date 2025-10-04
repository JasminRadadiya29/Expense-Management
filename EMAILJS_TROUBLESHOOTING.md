# EmailJS Troubleshooting Guide

## "The recipients address is empty" Error

This error occurs when EmailJS cannot find the recipient email address in your template. Here's how to fix it:

### Step 1: Check Your EmailJS Template Configuration

1. **Go to your EmailJS Dashboard** → Email Templates
2. **Open your template** (password_reset_template or welcome_template)
3. **Check the "To Email" field** - this is the most important part!

### Step 2: Configure the "To Email" Field Correctly

In your EmailJS template, the "To Email" field should be set to one of these:

**Option 1: Use a parameter**
```
{{to_email}}
```

**Option 2: Use alternative parameter names**
```
{{user_email}}}
```
or
```
{{email}}
```

**Option 3: Use a static email for testing**
```
your-test-email@gmail.com
```

### Step 3: Verify Your Email Service Configuration

1. **Go to Email Services** in your EmailJS dashboard
2. **Check your email service** (Gmail, Outlook, etc.)
3. **Make sure it's properly connected** and verified
4. **Test the service** by sending a test email from the dashboard

### Step 4: Template Configuration Checklist

Your EmailJS template should have:

```
Subject: Password Reset - Expense Management

To Email: {{to_email}}  ← This is the KEY field!

Hello {{to_name}},

Your password has been reset. Here are your new login credentials:

Email: {{to_email}}
Temporary Password: {{temporary_password}}

Please login and change your password immediately.

Best regards,
{{from_name}}
```

### Step 5: Test with Static Email First

To isolate the issue, try setting a static email in your template:

1. **Set "To Email" to a real email address** (like your own email)
2. **Test the email sending** from your application
3. **If it works**, the issue is with the parameter mapping
4. **If it doesn't work**, the issue is with your email service configuration

### Step 6: Check Browser Console

Look for these logs in your browser console:
- "Sending password reset email to: [email]"
- "Service ID: [your-service-id]"
- "Template ID: [your-template-id]"
- "Template params: [object with parameters]"

### Common Solutions:

1. **Wrong parameter name**: Make sure your template uses `{{to_email}}` exactly
2. **Email service not configured**: Check your EmailJS email service setup
3. **Template not saved**: Make sure you saved your template after making changes
4. **Wrong template ID**: Verify the template ID in your config matches your EmailJS template

### Quick Fix Test:

Try this simple test template in EmailJS:

```
Subject: Test Email

To Email: your-email@gmail.com  ← Use your real email for testing

Hello,

This is a test email.

Best regards,
Test System
```

If this works, then the issue is with parameter mapping. If it doesn't work, the issue is with your email service configuration.

### Still Having Issues?

1. **Check EmailJS documentation**: https://www.emailjs.com/docs/
2. **Verify your service is active**: Make sure your email service is not suspended
3. **Check email service limits**: Some services have daily sending limits
4. **Try a different email service**: Test with a different email provider in EmailJS
