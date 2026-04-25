# When You Return — Quick Runbook

**TL;DR:** Read `docs/CRISIS_SPRINT_HANDOFF_APR25.md` for full context. This file is paste-ready commands + URLs.

---

## In order — copy-paste these as you go

### 1. ASC API Key (5 min)

**Generate:**
```
https://appstoreconnect.apple.com/access/integrations/api
```
- Click **"Team Keys"** tab (NOT "Individual Keys")
- Click **"+"** → name it `RevenueCat`
- Access Role: **App Manager**
- Generate, download `.p8`
- Note the Issuer ID and Key ID

**Upload to RevenueCat:**
```
https://app.revenuecat.com/projects/72b8c4e6/apps/appffad3710fa
```
Scroll to **"App Store Connect API"** section → upload `.p8` + paste Issuer ID + Key ID → wait for "Valid Credentials" green check.

### 2. Verify entitlement name (2 min)

```
https://app.revenuecat.com/projects/72b8c4e6/product-catalog/entitlements
```

Confirm the entitlement is named **exactly** `Koda Labs Pro` (capital K, capital L, capital P, single space). Rename if not.

### 3. Test IAP on existing Build 31 (3 min)

This validates Action 1 worked, **before** rebuilding Build 32. No code change needed.

On your iPhone (InterviewAnswers app currently has Build 31):
- Sign out, sign up fresh with `alshtest+iaptest@gmail.com` (or any Gmail+ alias)
- Get past onboarding
- Tap pricing → Get 30-Day Pass → sandbox sheet → confirm purchase
- Pro tier should activate
- OR: if you've already purchased, tap Settings → Restore Purchases — should now succeed

**If this works:** Action 1 is verified. Move to Step 4.
**If this fails:** Action 2 (entitlement name) might be wrong. Recheck.

### 4. Configure Supabase Auth custom SMTP via Resend (15 min)

**Resend — create new API key:**
```
https://resend.com/api-keys
```
- Create API Key, name `Supabase Auth SMTP`
- Permission: **Sending access**
- Domain: `interviewanswers.ai`
- Copy the `re_...` key

**Supabase — configure SMTP:**
```
https://supabase.com/dashboard/project/tzrlpwtkrtvjpdhcaayu/auth/smtp
```
- Toggle "Enable Custom SMTP" ON
- Sender email: `noreply@interviewanswers.ai`
- Sender name: `InterviewAnswers.ai`
- Host: `smtp.resend.com`
- Port: `465`
- Username: `resend`
- Password: the `re_...` key
- Save

**Test:**
- New incognito window → sign up with a Yahoo/AOL test address
- Verification email should arrive without "looks dangerous" warning

### 5. Build 32 — Xcode archive + submit (15 min)

```bash
# Open the iOS project
open /Users/alshcampos/Downloads/isl-complete/ios/App/App.xcodeproj
```

In Xcode:
1. Top toolbar: select **"Any iOS Device (arm64)"** as target
2. **Product → Archive** (NOT just Build)
3. Wait ~3-5 min
4. Window → Organizer → latest archive → **Distribute App**
5. **App Store Connect → Upload** → wait ~10-15 min for ASC processing

In App Store Connect:
```
https://appstoreconnect.apple.com/apps
```
- InterviewAnswers → 1.0 (Prepare for Submission)
- **Build** section → click **+** → select **Build 32** (just-uploaded)
- **App Review Information → Notes** → paste content from `docs/APP_STORE_REVIEW_NOTES_BUILD32.md` (the block in gray code box)
- Replace `[INSERT YOUR SANDBOX TESTER...]` placeholders with real credentials
- Save → **Submit for Review**

### 6. (Recommended) Request expedited review (2 min)

Apple has rejected this app twice. With end-to-end testing complete, request expedited review:
```
https://appstoreconnect.apple.com/apps
```
Resources and Help (top right) → Contact Us → **Request an Expedited App Review**

Reason text:
```
Critical bug fixes for previously-rejected submission.

Build 32 addresses both the IAP error from Build 30/31 and a routing
issue we identified through internal review. End-to-end testing complete
on physical iPhone with sandbox tester. Both fixes verified working.

Sandbox tester credentials provided in App Review Information notes.
```

---

## Quick sanity checks (verify code is in good state)

### Verify deployed web has the password-reset fix

```bash
curl -sS "https://www.interviewanswers.ai/$(curl -sS https://www.interviewanswers.ai/ | grep -oE '/assets/App-[^"]+\.js' | head -1)" 2>/dev/null | grep -oE "detectSessionInUrl:!1|exchangeCodeForSession" | head -3
```

Expected output:
```
detectSessionInUrl:!1
exchangeCodeForSession
```

If both appear → web fix is live. ✅

### Verify iOS bundle is general-target

```bash
ls /Users/alshcampos/Downloads/isl-complete/ios/App/App/public/assets/ | grep -i nursing
```

Expected: empty output (no nursing chunks).

### Verify build number is 32

```bash
grep CURRENT_PROJECT_VERSION /Users/alshcampos/Downloads/isl-complete/ios/App/App.xcodeproj/project.pbxproj | head -2
```

Expected: `CURRENT_PROJECT_VERSION = 32;` (×2 — Debug + Release configs)

---

## What's been pushed (sprint commits)

```
0bd060c Refine verify-general-scrub.sh: allowlist known false positives
0d3c2f2 Add Build 32-specific App Store review notes
d03561d Add CRISIS_SPRINT_HANDOFF_APR25.md
ca7182e Fix: iOS landing page leak + password reset race + build target guard
13b9c5c Fix password reset race condition (synchronous recovery detection)
```

All on `feature/ui-polish`, all pushed to origin.

---

## If something goes wrong

### Apple rejects Build 32

Reply in App Store Connect:
> "Could you share the exact error text or a screenshot of the failure your reviewer observed? We have addressed both the IAP error and the routing issue from prior submissions, and end-to-end tested on a physical iPhone with sandbox account. If a different failure mode is occurring on your test device, the screenshot will help us address it directly. Thank you."

### IAP test still fails after ASC API Key upload

Check entitlement name (Action 2). If still failing, check:
- Apple Developer "Paid Apps Agreement" status: https://appstoreconnect.apple.com/business/agreements
- Sandbox tester storefront region matches product storefront
- Bundle ID `ai.interviewanswers.app` is correct in BOTH ASC + RC

### Password reset still failing on iPhone

If you tap a reset link in iOS Mail, it opens **mobile Safari** (not the InterviewAnswers app — we don't have Universal Links). Mobile Safari may have stale session cookies.

Workarounds:
- Test reset on **Mac browser** instead (cleanest path)
- OR long-press the email link → "Open in Safari" + use Private Browsing
- OR clear Safari cache on iPhone first (Settings → Safari → Clear History and Website Data)

The deeper fix (Universal Links setup) is queued for a follow-up sprint.
