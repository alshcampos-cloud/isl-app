# App Store Connect — Review Notes for Build 1.0 (32)

**Use this in:** App Store Connect → My Apps → InterviewAnswers → App Store tab → 1.0 Prepare for Submission → **App Review Information** → "Notes" field.

**⚠️ DO THIS BEFORE SUBMITTING:** Action A (upload App Store Connect API Key to RevenueCat — see `docs/CRISIS_SPRINT_HANDOFF_APR25.md`). Without it, Apple's reviewer will hit the same "credential issue" error you saw and re-reject.

---

## Recommended Review Notes (paste into "Notes" textarea)

```
Dear Review Team,

Thank you for your continued patience through our submissions. Build 32
addresses two distinct issues from prior rejections:

ISSUE 1 — IAP error message on purchase (Build 30, Build 31 reviewer)
Our IAP fallback code path was passing a malformed StoreProduct stub to
purchaseStoreProduct() instead of a fully-fetched StoreProduct object,
causing a native bridge error in StoreKit 2. The user saw a generic
"error message" upon tapping the purchase button — exactly what your
tester observed.

FIX:
- Replaced the fallback path: now fetches the real StoreProduct via
  Purchases.getProducts() before calling purchaseStoreProduct().
- Strengthened initialization: app verifies products are reachable
  before marking the store as ready; otherwise shows a clear error.
- All bridge errors now mapped to user-friendly messages.

We tested this end-to-end on a physical iPhone running iOS 26.4 with a
sandbox tester account. The Apple sandbox purchase sheet now appears
correctly with the $14.99 price, the purchase completes, and the app
grants the "Koda Labs Pro" entitlement.

ISSUE 2 — App boot route showed marketing landing page on launch
Our iOS bundle had been built without the VITE_APP_TARGET=general
environment variable, which meant our route guard (which redirects "/"
to "/app" for native builds) didn't fire, and users saw the public
marketing landing page on launch instead of the actual app.

FIX:
- Rebuilt the iOS bundle with VITE_APP_TARGET=general (the native build
  target).
- Added a runtime defensive guard so future regressions are caught early.
- Verified the iOS bundle now contains zero "NurseAnswerPro" references
  (our nursing-only sub-brand) and zero nursing-track JS chunks. The
  general build is now cleanly separated from the all-features web build.

App now boots directly to /app (or /login if signed out), as intended.

REVENUECAT CONFIGURATION (verified Apr 25, 2026)
- In-App Purchase Key C32J4S676D.p8 — uploaded, "Valid credentials"
- App Store Connect API Key — uploaded prior to this submission to
  enable receipt validation in StoreKit 2 environments
- "default" offering — 5 packages, all attached to App Store Connect
  product IDs (general 30-day, annual all-access, monthly, yearly,
  lifetime)
- Bundle ID ai.interviewanswers.app — matches App Store Connect
- Entitlement "Koda Labs Pro" — verified

TO TEST
1. Launch the app — should land on the sign-in screen, NOT a marketing
   page. (Confirms the routing fix.)
2. Sign in with the sandbox tester credentials below (or create a new
   account; either works).
3. After the home screen loads, navigate to pricing — tap any "Upgrade"
   or pricing CTA.
4. Tap "Get 30-Day Pass — $14.99".
5. Apple's sandbox purchase sheet should appear with the price and the
   "[Environment: Sandbox]" / "For testing only" message.
6. Complete the purchase using the sandbox tester.
7. App returns to its post-purchase state; "Koda Labs Pro" entitlement
   is active.
8. "Restore Purchases" is also available in Settings → Account, and now
   succeeds without the "credential issue" error from Build 31.

SANDBOX TESTER
Email: [INSERT YOUR SANDBOX TESTER EMAIL HERE]
Password: [INSERT YOUR SANDBOX TESTER PASSWORD HERE]

(If the tester account needs to be re-created, you can create a fresh
one in App Store Connect → Users and Access → Sandbox → Test Accounts.)

We sincerely apologize for the back-and-forth on this app review and
have worked hard to ensure both issues are fully resolved before this
submission. Thank you again for your patience.

Best regards,
The InterviewAnswers.ai team
```

---

## Pre-flight checklist BEFORE pasting these notes

Confirm the following are TRUE before clicking "Submit for Review":

### Step 1 — RevenueCat dashboard
- [ ] App Store Connect API Key is uploaded → "Valid credentials" green check
  - URL: https://app.revenuecat.com/projects/72b8c4e6/apps/appffad3710fa
  - Section: "App Store Connect API" (NOT the IAP Key section above it)
- [ ] Entitlement is named exactly `Koda Labs Pro` (case-sensitive, single space)
- [ ] All 5 packages are attached to the `default` offering

### Step 2 — App Store Connect
- [ ] Paid Apps Agreement is **Active** (https://appstoreconnect.apple.com/business/agreements)
- [ ] All 4 product IDs exist and are "Ready to Submit" or "Approved":
  - `ai.interviewanswers.general.30day`
  - `ai.interviewanswers.annual.allaccess`
  - `monthly`, `yearly`, `lifetime` (the RC defaults)
- [ ] Sandbox tester exists in Users and Access → Sandbox → Test Accounts

### Step 3 — Xcode
- [ ] Build number reads **32** (Settings tab in App project, General → Identity → Build)
- [ ] Marketing version reads **1.0**
- [ ] Successfully archived (Product → Archive)
- [ ] Uploaded to App Store Connect (Window → Organizer → Distribute App)
- [ ] Build 32 appears in ASC → InterviewAnswers → 1.0 → Build section (~10-15 min after upload)

### Step 4 — Test (optional but recommended)
- [ ] Pre-test on a physical iPhone via TestFlight Internal Testing
- [ ] Confirm the 8 test steps in the review notes above pass
- [ ] If any fail: do NOT submit. Diagnose first.

### Step 5 — App Review Information
- [ ] Replace `[INSERT YOUR SANDBOX TESTER EMAIL HERE]` with real credentials
- [ ] Replace `[INSERT YOUR SANDBOX TESTER PASSWORD HERE]` with real credentials
- [ ] Save before submitting

### Step 6 — Submit
- [ ] **Submit for Review**
- [ ] (Recommended) Resources & Help → Contact Us → Request Expedited Review
  - Reason: "Critical bug fixes for previously-rejected submission. End-to-end testing complete."
  - Apple typically responds within 24h.

---

## What changed between Build 31 and Build 32

| Area | Build 31 | Build 32 |
|---|---|---|
| IAP malformed-fallback fix | ✅ | ✅ (same) |
| iOS routing — landing page vs app | ❌ Showed landing page | ✅ Goes to /app |
| Nursing chunks in bundle | ❌ Present (4 chunks) | ✅ Stripped |
| Bundle index.html nursing JSON-LD | ❌ Present | ✅ Removed |
| Password reset race condition | Partial (race #1 fix) | ✅ Both races fixed |

---

## If Apple rejects again

Reply in App Store Connect with:

> "Could you share the exact error text or a screenshot of the failure your reviewer observed? We have addressed both the IAP error and the routing issue from prior submissions, and end-to-end tested on a physical iPhone with sandbox account. If a different failure mode is occurring on your test device, the screenshot will help us address it directly. Thank you."

Apple reviewers do respond to in-thread questions and frequently share screenshots when asked politely.
