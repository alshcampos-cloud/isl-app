# App Store Connect — Review Notes for Build 1.0 (31)

**Use this in:** App Store Connect → My Apps → InterviewAnswers → App Store tab → 1.0 Prepare for Submission → **App Review Information** → "Notes" field.

---

## Recommended Review Notes (paste into "Notes" textarea)

```
Dear Review Team,

Thank you for your patience through our previous submissions of Build 30.
We have identified and fixed the root cause of the in-app purchase error.

ROOT CAUSE
Our IAP fallback code path was passing a malformed StoreProduct stub to
purchaseStoreProduct() instead of a fully-fetched StoreProduct object,
causing a native bridge error in StoreKit 2. The user's experience: a
generic "error message" upon tapping the purchase button — exactly what
your tester observed.

FIX (BUILD 31)
- Replaced the fallback path: now fetches the real StoreProduct via
  Purchases.getProducts() before calling purchaseStoreProduct().
- Strengthened initialization: app verifies products are reachable
  before marking the store as ready; otherwise shows a clear error.
- All bridge errors now mapped to user-friendly messages instead of
  raw error objects.

REVENUECAT CONFIGURATION (verified Apr 25, 2026)
- IAP key C32J4S676D.p8 — uploaded, valid credentials
- "default" offering — 5 packages, all attached to App Store Connect
  product IDs (general 30day, annual all-access, monthly, yearly,
  lifetime)
- Bundle ID ai.interviewanswers.app — matched in RevenueCat

TO TEST
1. Launch the app, tap through onboarding (or sign in with the sandbox
   tester credentials below).
2. From the home screen, tap any "Upgrade" or pricing CTA — this routes
   to /pricing.
3. Tap the "Get 30-Day Pass — $14.99" button.
4. Apple's sandbox purchase sheet appears with the correct price.
5. Complete the purchase using a sandbox tester account.
6. App returns to the success state; user is granted the "Koda Labs Pro"
   entitlement.
7. "Restore Purchases" is also available in Settings → Account.

SANDBOX TESTER
Email: [INSERT YOUR SANDBOX TESTER EMAIL HERE]
Password: [INSERT YOUR SANDBOX TESTER PASSWORD HERE]

(If the tester account is locked, you can create a fresh one in App Store
Connect → Users and Access → Sandbox → Test Accounts.)

We have tested this build end-to-end on a physical iPhone running iOS
26.4 with a sandbox account. Purchase, restore, cancel, and re-launch
flows all work correctly.

We sincerely apologize for the back-and-forth on this issue. Thank you
for your continued patience.

Best regards,
The InterviewAnswers.ai team
```

---

## Before You Submit — 3-step pre-flight

### 1. Confirm sandbox tester exists

Open: https://appstoreconnect.apple.com/access/users
Click: **Sandbox** (left sidebar) → **Test Accounts**

If you have a sandbox tester:
- Use the email/password in the review notes above (replace the placeholder)

If you don't:
- Click **"+"** to create one
- Use a fake email like `iaai-sandbox@interviewanswers.ai` with a memorable password
- Region: United States
- Save the credentials, paste into the review notes

### 2. Test on YOUR iPhone first (required — do NOT skip)

a. Make sure your iPhone is signed OUT of the App Store with your real Apple ID for sandbox testing:
   - **Settings → App Store → Sandbox Account** → Sign in with the sandbox tester from step 1

b. Build and run via Xcode:
   - Open `ios/App/App.xcworkspace` in Xcode
   - Select your iPhone as the target
   - Product → Archive (or just Run)

c. Test the 6-step flow yourself:
   1. Tap pricing → Apple sheet appears (with price $14.99) ✅
   2. Complete purchase ✅
   3. App grants Pro entitlement ✅
   4. Tap "Restore Purchases" ✅
   5. Cancel a purchase mid-flow ✅
   6. Kill the app + reopen → still Pro ✅

If ANY of those fail, do NOT submit. Tell me which step failed and I'll diagnose.

### 3. Archive + Submit

Once your test passes:

a. Xcode → Product → **Archive**
b. Wait for archive to complete (~3 min)
c. Window → Organizer → Archives → Latest archive
d. **Distribute App** → App Store Connect → Upload
e. Wait for build to appear in ASC (~10-15 min processing)
f. Go to ASC → InterviewAnswers → 1.0 → **Build** section → select Build 31
g. Paste the review notes above into **App Review Information → Notes**
h. **Save** then **Submit for Review**

### 4. (Optional but recommended) Request expedited review

Given this is your second identical rejection and you've now isolated
the root cause, you can request expedited review:

- ASC → Resources and Help → Contact Us → **Request an Expedited App Review**
- Reason: "Critical bug fix — second rejection of identical IAP issue,
  root cause now identified and patched. End-to-end testing complete."
- Apple will typically respond within 24h on expedited reviews.

---

## What to do if Apple rejects again

Reply to the rejection in App Store Connect with:

> "Could you please share the exact error message text or a screenshot of
> the failure your tester observed? We have identified and fixed two
> separate issues in the IAP path and have tested end-to-end on a
> physical iPhone — but if a different error pattern is occurring on
> your iPad test environment, the screenshot will help us address it
> directly."

Apple reviewers do respond to in-thread questions and often share
screenshots when asked politely.

---

## Side tasks (NOT blockers, do later)

- [ ] Upload **App Store Connect API Key** (separate from the IAP key) to
      RevenueCat → Project Settings → Apps → InterviewAnswers.ai →
      "App Store Connect API" section. This enables automatic price-change
      sync but does not affect transactions.
- [ ] Configure **Apple Server-to-Server Notification URL** in App Store
      Connect → Apps → InterviewAnswers → App Information → App Store
      Server Notifications. Use the URL RevenueCat provides under
      App Settings.
- [ ] Fix typo: RevenueCat project name "Kodq Labs" → "Koda Labs"
      (Project Settings → General → Project Name).
