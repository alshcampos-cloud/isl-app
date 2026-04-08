# Email Deliverability Setup Guide

## Current Problem
- Supabase uses default email sender (`noreply@mail.supabase.io`)
- No SPF/DKIM/DMARC configured for `interviewanswers.ai`
- Confirmation emails land in spam for most providers (Gmail, Outlook, Yahoo)
- This breaks the sign-up funnel — users can't verify email → can't use the app

## Workaround Already Working: Google OAuth
Google Sign-In is **already implemented** and bypasses email confirmation entirely.
Users who sign in with Google skip the email verification step completely.
This is confirmed working in `src/Auth.jsx` + `src/utils/googleOAuth.js`.

## Fix: Custom SMTP via SendGrid (Recommended)

### Step 1: Create SendGrid Account
1. Go to https://sendgrid.com and create a free account
2. Free tier: 100 emails/day (more than enough for current scale)
3. Complete identity verification

### Step 2: Verify Sender Domain
1. In SendGrid: Settings → Sender Authentication → Domain Authentication
2. Enter domain: `interviewanswers.ai`
3. SendGrid will provide DNS records to add

### Step 3: Add DNS Records
Add these to your domain registrar (wherever `interviewanswers.ai` DNS is managed):

**SPF Record** (TXT record on root domain):
```
v=spf1 include:sendgrid.net ~all
```

**DKIM Records** (CNAME records — SendGrid provides exact values):
```
s1._domainkey.interviewanswers.ai → s1.domainkey.u######.wl###.sendgrid.net
s2._domainkey.interviewanswers.ai → s2.domainkey.u######.wl###.sendgrid.net
```

**DMARC Record** (TXT record):
```
_dmarc.interviewanswers.ai → v=DMARC1; p=none; rua=mailto:admin@interviewanswers.ai
```

### Step 4: Create SendGrid API Key
1. In SendGrid: Settings → API Keys → Create API Key
2. Select "Restricted Access" → enable only "Mail Send"
3. Copy the API key (starts with `SG.`)

### Step 5: Configure Supabase Custom SMTP
1. Go to Supabase Dashboard → Project Settings → Auth → SMTP Settings
2. Toggle "Enable Custom SMTP"
3. Enter:
   - **Host:** `smtp.sendgrid.net`
   - **Port:** `587`
   - **Username:** `apikey` (literally the word "apikey")
   - **Password:** Your SendGrid API key (`SG.xxxxxxx`)
   - **Sender email:** `noreply@interviewanswers.ai`
   - **Sender name:** `InterviewAnswers.ai`

### Step 6: Customize Email Templates (Optional)
In Supabase Dashboard → Auth → Email Templates:
- **Confirmation email:** Customize subject and body
- **Magic link:** Not currently used but can be enabled later
- **Password reset:** Customize for brand consistency

### Step 7: Test
1. Create a new account with a fresh email
2. Check inbox (not spam!) for confirmation email
3. Verify it comes from `noreply@interviewanswers.ai`
4. Use https://www.mail-tester.com to check spam score (aim for 9+/10)
5. Test with Gmail, Outlook, and Yahoo addresses

## Alternative: Resend.com
Resend is a modern email API with excellent Supabase integration:
1. Create account at https://resend.com
2. Add domain, get DNS records
3. Generate API key
4. Configure in Supabase SMTP settings:
   - Host: `smtp.resend.com`
   - Port: `465`
   - Username: `resend`
   - Password: Your Resend API key

## DNS Propagation
After adding DNS records, allow 24-48 hours for full propagation.
You can check status at: https://mxtoolbox.com/spf.aspx

## Verification Checklist
- [ ] SendGrid account created
- [ ] Domain authenticated in SendGrid
- [ ] SPF record added to DNS
- [ ] DKIM records added to DNS
- [ ] DMARC record added to DNS
- [ ] API key created in SendGrid
- [ ] Custom SMTP configured in Supabase
- [ ] Test email received in inbox (not spam)
- [ ] Tested with Gmail, Outlook, Yahoo
- [ ] mail-tester.com score ≥ 9/10
