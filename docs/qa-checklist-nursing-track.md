# QA Checklist — Nursing Track Pre-Merge

> Run through this checklist before merging `feature/nursing-track` into main.
> Test on Chrome desktop + iOS Safari (or at minimum Chrome mobile emulation).

---

## Pre-Test Setup

- [ ] Supabase migration applied (`docs/migration_nursing_credits.sql`)
- [ ] Verify columns exist: run verification query from migration file
- [ ] Dev server running (`npm run dev`)
- [ ] Have two test accounts ready:
  - **Free user** — tier = 'free' (or new account)
  - **Pro/Beta user** — tier = 'beta' or 'pro' in user_profiles

---

## 1. Entry Point & Navigation

- [ ] Navigate to `/nursing` — Nursing dashboard loads
- [ ] "Back to Main App" link returns to main InterviewAnswers.AI
- [ ] All 9 mode cards visible on dashboard
- [ ] Specialty filter works (select ED, ICU, etc. — question counts update)

---

## 2. Free User — Credit-Limited Modes

### 2a. Quick Practice (nursing_practice: 5/month)
- [ ] Tap "Quick Practice" — mode loads, question appears
- [ ] Complete a practice session (answer + get AI feedback)
- [ ] Credit tracker on dashboard updates (e.g., "4 remaining")
- [ ] Repeat until credits exhausted (or manually set usage to 5 in DB)
- [ ] At limit: upgrade prompt appears, cannot start new session
- [ ] Verify `nursing_practice` column increments in `usage_tracking` table

### 2b. Mock Interview (nursing_mock: 3/month)
- [ ] Tap "Mock Interview" — mode loads
- [ ] Complete a mock session (multi-question conversational interview)
- [ ] Credit tracker updates
- [ ] At limit: upgrade prompt appears
- [ ] Verify `nursing_mock` column increments in DB

### 2c. SBAR Drill (nursing_sbar: 3/month)
- [ ] Tap "SBAR Drill" — mode loads, scenario appears
- [ ] Complete an SBAR drill (give response, get per-component scoring)
- [ ] Verify AI does NOT coach user to say "The situation is..." (Natural Delivery Rule)
- [ ] Verify scoring is content-based, not delivery-style-based (Scoring Anchor)
- [ ] Credit tracker updates
- [ ] At limit: upgrade prompt appears
- [ ] Verify `nursing_sbar` column increments in DB

---

## 3. Free User — Pro-Gated Modes

### 3a. AI Coach
- [ ] Tap "AI Coach" on dashboard
- [ ] ProGateScreen appears (NOT the actual mode)
- [ ] "Upgrade to Pro" button links to pricing/billing
- [ ] "Back to Dashboard" returns to nursing dashboard

### 3b. Confidence Builder
- [ ] Same test as 3a — ProGateScreen appears

### 3c. Offer Negotiation Coach
- [ ] Same test as 3a — ProGateScreen appears

---

## 4. Free User — Free Forever Modes

### 4a. Flashcards
- [ ] Tap "Flashcards" — loads without credit check
- [ ] Can use freely, no limit warnings
- [ ] Badge shows "Free" (sky blue), not "Pro"

### 4b. Command Center (Question Bank)
- [ ] Tap "Command Center" — loads
- [ ] First 3 questions fully visible (FREE_PREVIEW_COUNT = 3)
- [ ] Questions 4+ are blurred with lock icon overlay
- [ ] "Unlock All Questions" upgrade CTA visible below blurred cards
- [ ] Cannot read blurred question text (blur is effective)
- [ ] Question count shows "3 unlocked · X Pro" for free users

### 4c. Resources
- [ ] Tap "Resources" — loads without credit check

---

## 5. Free User — Dashboard Usage Tracker

- [ ] "Credits This Month" section visible on dashboard
- [ ] 3 credit cards: Mock Interview, Quick Practice, SBAR Drill
- [ ] Each card shows: icon, remaining/limit, progress bar
- [ ] Progress bar color matches usage (green → amber → red as depleted)
- [ ] Exhausted credits show "0 left" with red styling
- [ ] "AI Coach, Confidence Builder, Offer Negotiation require Pro" text visible
- [ ] "Upgrade to Pro" link visible

---

## 6. Pro/Beta User — Unlimited Access

- [ ] Switch to pro/beta test account
- [ ] Dashboard shows "Unlimited Access" gold badge (NOT credit tracker)
- [ ] All 9 modes accessible — no ProGateScreen on any mode
- [ ] Quick Practice: no credit limit warning, "Unlimited" shown
- [ ] Mock Interview: no credit limit warning, "Unlimited" shown
- [ ] SBAR Drill: no credit limit warning
- [ ] AI Coach: loads directly (no gate)
- [ ] Confidence Builder: loads directly (no gate)
- [ ] Offer Negotiation: loads directly (no gate)
- [ ] Command Center: ALL questions visible (no blur, no lock icons)
- [ ] Question count shows total without locked/unlocked split

---

## 7. "Practice This" Deep-Link (Bug Fix Verification)

- [ ] Go to Command Center → Question Bank tab
- [ ] Click "Practice This" on a specific question
- [ ] Quick Practice mode opens with THAT EXACT question first
- [ ] (Not a random question from the pool)
- [ ] After going back to dashboard, start Practice again — normal shuffle (no stale targeting)

---

## 8. SBAR Natural Delivery (Bug Fix Verification)

- [ ] Start SBAR Drill
- [ ] Give a response in natural conversational style (no "The situation is...")
- [ ] AI feedback should NOT tell you to label sections
- [ ] AI feedback should praise natural fluid delivery
- [ ] Score should reflect content quality, not format compliance
- [ ] Try a response WITH labeled sections — should score same quality level
  (Scoring Anchor: format doesn't affect score, only content does)

---

## 9. Credit Isolation (Regression Check)

- [ ] Use a nursing Quick Practice credit
- [ ] Verify main app's `practice_mode` count DID NOT increment
- [ ] Use a nursing Mock Interview credit
- [ ] Verify main app's `ai_interviewer` count DID NOT increment
- [ ] Use main app Practice Mode
- [ ] Verify nursing `nursing_practice` count DID NOT increment
- [ ] **Key:** Nursing and main app credit pools are fully independent

---

## 10. Stripe Upgrade Flow (from Nursing Track)

- [ ] As free user in nursing track, hit any credit limit
- [ ] Click "Upgrade to Pro" button — navigates to `/app?upgrade=true`
- [ ] Pricing modal auto-opens on the main app screen
- [ ] StripeCheckout button visible and clickable
- [ ] (Optional) Complete a test checkout — verify Pro access unlocks both general + nursing
- [ ] After upgrade, return to `/nursing` — all modes accessible, no gates, no blur
- [ ] Verify "General" track switcher tab (top nav) goes to `/app` WITHOUT `?upgrade=true`

---

## 11. Delete All Data — Pro User Protection

> Critical: Paying users must not lose their subscription

- [ ] As Pro user, go to Settings → "Delete All My Data"
- [ ] First confirm dialog mentions "Your Pro subscription will NOT be canceled"
- [ ] Click OK → Second confirm → Data deleted
- [ ] After sign-out and re-login, user is STILL Pro (tier preserved)
- [ ] Verify in Supabase: `user_profiles` row still exists with `tier: 'pro'`, `subscription_id`, `stripe_customer_id` intact
- [ ] Verify `practice_sessions`, `questions`, `usage_tracking` rows are deleted
- [ ] As Free user, "Delete All My Data" works normally (no subscription to preserve)

---

## 12. Main App Regression Check

> Critical: Nursing track changes must NOT break existing features

- [ ] Main app Home screen loads normally
- [ ] Main app Practice Mode works (check + increment `practice_mode`)
- [ ] Main app AI Interviewer works (check + increment `ai_interviewer`)
- [ ] Main app Answer Assistant works
- [ ] Main app Live Prompter works
- [ ] Settings/billing page loads
- [ ] Pricing page loads
- [ ] `?upgrade=true` param auto-opens pricing modal
- [ ] `?success=true` param still triggers Stripe success handler (no conflict)

---

## 11. Edge Cases

- [ ] New user (no usage_tracking row yet) — first nursing session creates row correctly
- [ ] Month rollover — new period creates fresh row, credits reset
- [ ] Rapid-click on "Practice This" — doesn't crash or double-navigate
- [ ] Back button behavior: each mode returns cleanly to dashboard
- [ ] Speech recognition in Mock Interview inherits existing mic lifecycle (if applicable)

---

## 12. Mobile (iOS Safari / Chrome Mobile)

- [ ] Dashboard layout responsive on mobile
- [ ] Mode cards scrollable / tap targets large enough
- [ ] Credit tracker readable on small screen
- [ ] Blur gate works on mobile (CSS filter support)
- [ ] Touch events work on all buttons (onClick + touch handlers)

---

## Sign-Off

| Tester | Date | Device/Browser | Pass/Fail | Notes |
|--------|------|---------------|-----------|-------|
|        |      |               |           |       |
|        |      |               |           |       |

---

*Generated for feature/nursing-track merge review*
