# Jacob Test Report — Triage (2026-05-08)

Triage of `JACOB_TEST_REPORT.md` (saved at repo root, 68 lines, 10.6 KB) against `docs/JACOB_REPORT_TRIAGE_FRAMEWORK.md` Step 7.

**Triage only — no code changes, no git operations, no fixes.** Lucas reviews this before authorizing any fix branch.

## Headline

- **30 actionable findings + 1 contextual observation (SEO).**
- **Severity counts:** P0 = 8 · P1 = 13 · P2 = 9 · Context = 1
- **Blast counts:** HIGH = 8 · MEDIUM = 13 · LOW = 9
- **Top 3 highest-priority items:** #8 Annual pass Stripe error, #1+#6 (429 cluster — likely one root cause), #16 Delete All schema-cache error
- **Time estimate to clear all 8 P0s:** 8–14 hours of focused engineering (range reflects whether the 429 cluster is one fix or five)
- **Strong coupling clusters detected:** (a) Anthropic 429 cluster (5 items, likely one cause), (b) tab-visibility state-loss cluster (6 items, likely one cause), (c) ethics-pivot copy debt (1 item shares root with our recent Live Prompter sweep)

## Triage Matrix

| # | Finding (one-line) | Severity | Blast | Coupled to | Suggested fix branch name | Files touched (best guess) |
|---:|---|:---:|:---:|---|---|---|
| 0 | SEO — site only reachable by direct URL, doesn't surface in web search | Context (P2) | LOW | — | — | `index.html`, robots.txt, Vercel config — separate work, not a bug |
| 1 | Job Decoder fails with `Analysis failed: 429` | **P0** | HIGH | #6 (same error pattern) | `fix/jacob-001-anthropic-429-cluster` | Edge Function (Anthropic API call), client error handler |
| 2 | Interview Coach and AI Coach share the same token counter | **P0** | HIGH | — (creditSystem.js) | `fix/jacob-002-coach-token-separation` | `src/utils/creditSystem.js`, `supabase/functions/check-usage/index.ts`, possibly migration |
| 3 | Follow-up email fails to generate | **P0** | HIGH | #4, #5 (other Edge-Function-driven features) | `fix/jacob-003-followup-email` | `supabase/functions/<followup>/index.ts`, error handling |
| 4 | STAR Drill fails to evaluate response | **P0** | HIGH | #3, #5 (same shape — Edge Function failure mode) | `fix/jacob-004-star-drill-eval` | Edge Function for STAR eval |
| 5 | Story Bank "match stories" button fails | **P0** | HIGH | #3, #4 | `fix/jacob-005-story-bank-match` | Edge Function for story matching, RLS check |
| 6 | Job Focus "Curate my role" → `Analysis failed: 429` | **P0** | HIGH | #1 (almost certainly same root cause) | `fix/jacob-001-anthropic-429-cluster` (bundled with #1) | Same Edge Function pool as #1 |
| 7 | AI Interviewer "Next" button cycles through user's bank instead of AI's queue | **P0** | MEDIUM | — | `fix/jacob-007-ai-interviewer-next-button` | `src/Components/AIInterviewer/*` — local state in interview component |
| 8 | Annual pass purchase fails after 30-day pass: "specified `payment` mode but passed a recurring price" | **P0** | HIGH | — Stripe checkout config | `fix/jacob-008-annual-stripe-mode-mismatch` | `supabase/functions/create-checkout-session/`, Stripe price config in Dashboard |
| 9 | Add Question / Question Catalog tabs don't load questions after tab-switch | P1 | MEDIUM | #10, #19, #20, #21, #29 (tab-visibility cluster) | `fix/jacob-009-021-tab-visibility-cluster` (bundled) | Page Visibility API listener, useEffect cleanup in `Components/QuestionBank/*` |
| 10 | Edit Question loses edits if you tab-switch before save | P1 | MEDIUM | #9 (same cluster) | bundled w/ #9 | Edit form component — save-on-blur or autosave logic |
| 11 | AI Coach answer doesn't save after completion | **P0** | HIGH | — DB writes | `fix/jacob-011-ai-coach-answer-save` | AI Coach component + Edge Function + `user_answers` (or similar) table |
| 12 | Question Generator saves each question twice | P1 | MEDIUM | — | `fix/jacob-012-question-generator-dedupe` | Question Generator save handler — likely double-fire of `onClick` or `useEffect` deps |
| 13 | Interview Date function pulls input from other functions ("jumbled mess") | P1 | MEDIUM | — | `fix/jacob-013-interview-date-state-pollution` | Interview Date component — likely shared state via Context not isolated |
| 14 | False advertisement — at 7 uses, Live Prompter prompts "Unlimited access" but tier doesn't deliver | **P0** | LOW | rebrand-residue | `fix/jacob-014-false-ad-prompt-copy` | The upgrade-modal copy (likely `App.jsx` or a `UsageLimitModal.jsx`) |
| 15 | Timer doesn't work in Practice Mode | P1 | MEDIUM | — | `fix/jacob-015-practice-mode-timer` | Practice Mode component — likely missing `setInterval` cleanup or `useState` not wired |
| 16 | Delete All Questions: "Could not find the table 'public.practice_history' in the schema cache"; modal won't close | **P0** | HIGH | DB migration drift | `fix/jacob-016-practice-history-schema-drift` | Edge Function or RPC referencing `practice_history`, possibly a missing migration |
| 17 | Question Catalog kicks user out after selection | P1 | MEDIUM | — | `fix/jacob-017-catalog-kick-out` | Question Catalog component — `onSelect` likely closes modal/route unintentionally |
| 18 | AI Coach says "rush answer" even when answer is strong | P1 | MEDIUM | — | `fix/jacob-018-ai-coach-early-finish-flag` | AI Coach prompt or wrapper logic — add early-completion override |
| 19 | Live Prompter tokens not consumed after tab-switch | P1 | MEDIUM | #9 cluster | bundled w/ #9 | Usage-tracking on Practice Prompter, tab-visibility listener |
| 20 | Practice Mode no longer generates feedback after tab-switch | P1 | MEDIUM | #9 cluster | bundled w/ #9 | Practice Mode Edge Function call lifecycle |
| 21 | Practice Mode token exploit — tab-switch during eval = no token | P1 | MEDIUM | #9 cluster, #28 (same token-exploit shape) | bundled w/ #9 | Token consumption ordering — should commit BEFORE eval, not after |
| 22 | Annual pass description duplicates "Unlimited AI Coach" already in 30-day | P2 | LOW | — | `fix/jacob-022-annual-pass-redundant-copy` | PricingPage.jsx or wherever annual tier features list lives |
| 23 | Contact Support button opens browser but does nothing | P2 | LOW | — | `fix/jacob-023-contact-support-link` | Settings component — `mailto:` or external link handler |
| 24 | No way to reopen the tutorial without account deletion | P2 | LOW | — | `fix/jacob-024-tutorial-reopen-button` | Settings component, Tutorial component reset hook |
| 25 | Back arrow goes to main page instead of previous page (Privacy / ToS) | P2 | MEDIUM | React Router history | `fix/jacob-025-back-arrow-history` | LegalPages, navigation hooks (uses `navigate(-1)` vs hardcoded route) |
| 26 | "Date till interview" off-by-one and doesn't disappear when passed | P2 | LOW | — | `fix/jacob-026-interview-date-display` | Date utility / Prep component (Command Center) |
| 27 | "Explore Question Bank" button opens command center on wrong sub-tab | P2 | LOW | — | `fix/jacob-027-explore-bank-subtab-route` | Wherever the button is wired — needs full route incl. sub-tab |
| 28 | Question Generator exploit — tokens only consumed on save, not on generate | P1 | MEDIUM | #21 (same exploit shape) | `fix/jacob-028-generator-token-cap` | Generator flow — add per-session generation cap |
| 29 | Practice button stops opening after tab-switch | P1 | MEDIUM | #9 cluster | bundled w/ #9 | Practice mode entry point |
| 30 | "Your prep journeys" Ready button opens command center | P2 | LOW | — | `fix/jacob-030-prep-ready-button-destination` | Prep journey component (main page) |

## Recommended Fix Sequence

Per `JACOB_REPORT_TRIAGE_FRAMEWORK.md` Step 2: **LOW blast first regardless of severity.**

### Wave 1 — LOW blast (safe, single-PR-each or bundle)

These can be batched into one or two PRs because they're all copy/route-level. Estimated 2–3 hours total.

1. **#14** — P0 false-advertisement copy (do this FIRST, even though LOW-blast — it's a P0 launch blocker for compliance)
2. **#22** — annual pass redundant copy
3. **#23** — Contact Support link
4. **#24** — Tutorial reopen button
5. **#26** — Date till interview off-by-one
6. **#27** — Explore Question Bank sub-tab route
7. **#30** — Prep journey Ready button destination

`fix/jacob-014-false-ad-prompt-copy` ships SOLO (P0, separate PR); items 22/23/24/26/27/30 can land as `fix/jacob-low-blast-batch`. Smoke test between waves.

### Wave 2 — MEDIUM blast (one PR per fix or per coupling cluster)

After Wave 1 deploys clean. Estimated 6–10 hours total.

8. **#9 + #10 + #19 + #20 + #21 + #29 (tab-visibility cluster)** — bundled to one PR `fix/jacob-009-021-tab-visibility-cluster`. Strong coupling — likely a single Page Visibility API + `useEffect` cleanup fix in shared hook. Investigate root cause first; if confirmed single-source, one PR. If multiple distinct causes, split.
9. **#7** — AI Interviewer next-button (P0, but MEDIUM blast — local component state)
10. **#11** — AI Coach answer-save (P0, but treated MEDIUM if it's a UI save handler not an Edge Function issue — investigate first; could promote to HIGH)
11. **#12** — Question Generator dedupe
12. **#13** — Interview Date state pollution
13. **#15** — Practice Mode timer
14. **#17** — Question Catalog kick-out
15. **#18** — AI Coach rush-answer override flag
16. **#25** — Back arrow history
17. **#28** — Question Generator token cap

### Wave 3 — HIGH blast (one PR per fix, daylight only, second pair of eyes)

After Waves 1 and 2 are stable. Estimated 6–12 hours total. Run smoke before AND after each.

18. **#1 + #6 (Anthropic 429 cluster)** — `fix/jacob-001-anthropic-429-cluster`. Likely single root cause: tier-1 Anthropic rate limit, expired key, or expired billing. Investigate `supabase/functions/<all>/index.ts` for Anthropic calls; check Supabase secrets `ANTHROPIC_API_KEY`. May extend to #3, #4, #5 if same upstream — investigate before splitting.
19. **#3** — Follow-up email failure
20. **#4** — STAR drill eval failure
21. **#5** — Story bank match failure
22. **#2** — Coach token separation (creditSystem.js — DB schema may need migration)
23. **#8** — Annual pass Stripe payment-vs-subscription mismatch
24. **#16** — `practice_history` schema drift (DB migration audit)

### Skip / out of scope

- **#0 (SEO)** — not a bug, separate growth/marketing workstream

## P0 Diagnoses (one paragraph each)

For each P0, what's the root cause hypothesis, what files change, what test would prove the fix.

### #1 + #6 — Anthropic 429 cluster (Job Decoder, Job Focus)

**Root cause hypothesis:** HTTP 429 means "Too Many Requests" — most likely (a) Anthropic Tier 1 rate limit reached (50 RPM / 40k input tokens per minute on Sonnet), (b) `ANTHROPIC_API_KEY` is exhausted on its monthly billing cap, or (c) the Edge Function isn't applying the retry-with-backoff pattern from `BATTLE_SCARS.md` #3 (40% silent-failure rule). The fact that two distinct Edge-Function-driven features hit the same error suggests an upstream cause, not local logic. **Files to change:** `supabase/functions/job-decoder/index.ts`, `supabase/functions/job-focus/index.ts`, possibly a shared helper. **Test that proves the fix:** trigger Job Decoder twice in succession with retry instrumentation; confirm 200 response with retry count ≤3. Also: check Anthropic dashboard for 429 history and current tier.

### #2 — Interview Coach & AI Coach share token counter

**Root cause hypothesis:** the two features were built separately but both increment the same `live_prompter_questions` (or another shared) column in `user_credits`. `creditSystem.js` line 29 (`live_prompter_questions: 10`) is the candidate — if both features call `trackUsageInBackground('livePrompterQuestions', ...)`, they double-count. **Files to change:** `src/utils/creditSystem.js` (add separate enum keys + tier limits), `supabase/functions/check-usage/index.ts` (check the new column), and a Supabase migration adding the new column to `user_credits`. **Test that proves the fix:** use AI Coach to exhaustion → verify Interview Coach quota is unaffected; use Interview Coach to exhaustion → verify AI Coach quota unaffected.

### #3 — Follow-up email fails to generate

**Root cause hypothesis:** likely the Edge Function calling Anthropic for email-body generation is hitting the same 429 as #1+#6 (suggested coupling). Alternatively, a missing Resend integration or env var (`RESEND_API_KEY`). **Files to change:** `supabase/functions/<followup-email>/index.ts` — verify Anthropic call has retry-with-backoff and Resend send confirms success. **Test:** trigger Follow-up Email; assert email arrives at known inbox AND Edge Function returns 200 in logs.

### #4 — STAR Drill fails to evaluate

**Root cause hypothesis:** same upstream Anthropic 429 hypothesis as #1, #3, #6. Or: STAR rubric prompt is exceeding context window. **Files to change:** `supabase/functions/<star-eval>/index.ts`. **Test:** submit a known-good STAR answer; assert 200 + structured rubric response.

### #5 — Story Bank match fails

**Root cause hypothesis:** Edge Function or RLS — could be either Anthropic-related (cluster) or a missing RLS policy on `stories` table. **Files to change:** `supabase/functions/<story-match>/index.ts` and/or `supabase/migrations/` if RLS missing. **Test:** save 3 stories, click Match; assert keyword overlap shows ≥1 match.

### #7 — AI Interviewer "Next" button cycles user's bank

**Root cause hypothesis:** the AI Interviewer component reuses a navigation handler shared with the question-bank flashcard view; both call the same `nextQuestion()` which reads from a shared Context state. The AI Interviewer should maintain its own queue. **Files to change:** `src/Components/AIInterviewer/*` — isolate AI queue state from `currentQuestionIndex` of the bank. **Test:** start AI Interviewer, answer 1 question, click Next twice; assert next question is generated by AI, not pulled from bank.

### #8 — Annual pass purchase fails after 30-day pass (Stripe error)

**Root cause hypothesis:** the `create-checkout-session` Edge Function is hardcoded to `mode: 'payment'` (one-time) but the annual pass price ID in Stripe is configured as `recurring`. The 30-day pass works because it's set up as `payment`. Either (a) flip annual to one-time pricing, or (b) detect annual price ID and switch to `mode: 'subscription'`. **Files to change:** `supabase/functions/create-checkout-session/index.ts`, possibly Stripe Dashboard config (manual). **Coupling:** if you flip Stripe Dashboard to `recurring`, you must also update the Edge Function — fix both halves in one PR per Step 6 of the framework. **Test:** logged-in user with no entitlement clicks Annual; checkout opens with correct price; complete with test card; entitlement granted.

### #11 — AI Coach answer not saving

**Root cause hypothesis:** AI Coach final-step handler doesn't await the `INSERT` to `coaching_sessions` (or whichever table) before navigating away, OR an RLS policy blocks the write silently. **Files to change:** AI Coach final-step component + possibly RLS policy on the relevant table. **Test:** complete a full AI Coach flow, refresh page, assert the saved answer appears in the bank.

### #14 — False advertisement upgrade prompt at 7 uses

**Root cause hypothesis:** the limit-reached modal text says "Unlimited access" but the Pro tier (or whichever upgrade target) does NOT actually deliver unlimited Practice Prompter — coupling with our recent rebrand work which renamed the feature but didn't audit upgrade-prompt copy. **Files to change:** the upgrade modal copy (search `App.jsx` or `UsageLimitModal.jsx` for the "Unlimited" string in Practice Prompter context). Confirm against `PricingPage.jsx` features array — Pro tier line 80 (post our recent fix) says "✨ UNLIMITED Practice Prompter" so the prompt MAY be accurate; but Jacob says it isn't delivered. Need to verify the actual entitlement check matches the marketing claim. **Test:** hit the 7-use limit, click Upgrade, complete Pro purchase, verify Practice Prompter is genuinely unlimited.

### #16 — Delete All Questions schema-cache error

**Root cause hypothesis:** the bulk-delete RPC or function references `public.practice_history` which never existed (or was renamed). Postgres returns a clear error. The modal doesn't close because the error isn't caught in the UI. **Files to change:** (a) audit `supabase/migrations/` for any `practice_history` table — if it's never created, remove the reference from the delete function; (b) add error catch in the modal so it closes on failure with a toast. **Test:** with dummy account having questions saved, click Delete All; assert all questions gone, modal closes, no error toast (or graceful error).

## Coupling Map

Pairs/clusters of fixes that MUST land together to avoid silent regression (per Step 6).

| Cluster | Items | Why coupled | Land-together rule |
|---|---|---|---|
| **Anthropic 429** | #1, #6, possibly #3, #4, #5 | Likely a single upstream cause (rate limit, key, or billing); fixing only one leaves the others broken | Investigate root cause FIRST; if same, fix in one PR; if distinct, split but ship within 24h |
| **Tab-visibility** | #9, #10, #19, #20, #21, #29 | Likely single Page Visibility / useEffect cleanup pattern; fixing one component without auditing the others = recurrence | One PR if one root cause; otherwise individual but ship together |
| **Coach token separation** | #2 + DB migration | If you add a new column without backfilling existing rows OR without updating Edge Function, users see "0 left" or 500 errors | DB migration + creditSystem.js + check-usage Edge Function in same PR |
| **Annual pass Stripe** | #8 + Stripe Dashboard config | If you flip the Stripe Dashboard price to one-time but Edge Function still expects `subscription`, OR vice versa, the next purchase silently breaks | Change BOTH halves in same PR; verify with sandbox test before merge |
| **Practice_history schema** | #16 + migration audit | If the table reference exists in old migrations or the delete function but the table never existed, just removing the reference may break a future migration assuming presence | Audit ALL migrations for the table name before deleting the reference |
| **False ad copy** | #14 + entitlement system | The marketing copy MUST match the actual tier delivery; if Pro really is unlimited, fix the copy. If Pro has a hidden cap, fix the cap or revise the copy | Verify entitlement before changing copy |
| **Token exploits** | #21 + #28 | Same shape (tokens not consumed in race conditions); both should change to "consume BEFORE async eval" pattern | Same engineer should fix both with same pattern; don't blend with tab-visibility cluster even if surface-similar |

## What this triage does NOT cover

- Severity of the SEO finding (#0) — it's a marketing/growth concern, not a code bug
- Jacob's offhand mention that he wants the subscription refunded — that's a Stripe Dashboard action, not a code change
- The remaining smoke-test gap (`in-ear` false positive in `WhyISLSection.jsx:7`) flagged in the Live Prompter audit — separate from Jacob's report
- Whether Build 43 in App Store Connect is independently affected — Lucas runs that gate manually

Generated 2026-05-08 by Cowork triage pass against `JACOB_REPORT_TRIAGE_FRAMEWORK.md` Step 7. No code changes made. No git operations. Lucas reviews + authorizes fix waves.

---

## Wave 1 Per-Fix Verification

**Honest scope of `npm run smoke`:** the smoke test verifies no GLOBAL regression (build still works, key pages still 200, deprecated terms haven't crept back, Stripe price IDs still match, gtag still installed). It **does NOT** verify that Fix #N actually solved Bug #N. That requires reproducing the bug as Jacob saw it and confirming the bug is gone.

This section gives one verification card per fix so Lucas can scan and either approve or push back ("the repro didn't change, fix doesn't address it").

**Local dev session for visual verification:**

```bash
cd /Users/alshcampos/Downloads/isl-complete
npm run dev   # Vite dev server, typically http://localhost:5173
```

Sign in with a test account, then navigate per each card below.

---

### Fix #14 — Pro-tier upgrade prompt copy (PARKED — coupling-check finding)

```
Status: PARKED awaiting Lucas's copy decision. No edit applied yet.

JACOB'S ORIGINAL REPRO (JACOB_TEST_REPORT.md §High):
  Main Page → Live Prompter
  "At 7 uses it prompts the user to edit question to get 'Unlimited access'.
   However that is not true and could be a point of issue if a user brings it up.
   Change the text present in that message to be more accurate"

COUPLING-CHECK FINDING (this is what Lucas needs to review before fix):
  The prompt is NOT a Pro-tier paywall. It's a free-tier engagement gate.
  Logic at src/App.jsx:794:
    isLocked: sessionCount >= 7 && customized < 3 && withKeywords < 3
  The "Customize 3 questions to unlock unlimited access" claim at App.jsx:4870
  promises unlimited if you customize 3 questions. Reality:
    - Free tier is capped at 10 sessions/month per creditSystem.js:29
      (live_prompter_questions: 10, live_prompter_unlimited: false)
    - Customizing 3 questions clears the engagement gate (isLocked → false)
      but the user is STILL subject to the 10/month cap
  So the "unlimited access" claim is genuinely misleading.

PROPOSED COPY (option A — explicit about cap):
  "You've used your first 7 sessions! Customize at least 3 questions with 5+
   keywords to keep using Practice Prompter. (Free tier includes 10 sessions/month
   — upgrade for unlimited.)"

PROPOSED COPY (option B — punchier):
  "You've used your first 7 sessions! Customize at least 3 questions with 5+
   keywords to continue practicing. Upgrade to a Pass for unlimited access."

POST-FIX MANUAL VERIFICATION (after Lucas picks copy):
  1. Sign in as a fresh free-tier account (or reset sessionCount in localStorage)
  2. Use Practice Prompter 7 times without customizing 3 questions
  3. The lock screen at App.jsx:4867 appears
  4. Confirm the new copy is shown — no "unlimited access" claim
  5. Click "Go Customize Now"; customize 3 questions with 5+ keywords each
  6. Return to Practice Prompter; lock screen no longer appears
  7. Use Practice Prompter to the 10-session free-tier cap; verify upgrade prompt
     correctly directs to a paid Pass (not implies free unlimited)

SMOKE TEST IMPACT: pass (copy change in src/ but not in smoke-scoped paths;
                   smoke check 8 only scans Components/Landing/ + PricingPage.jsx)

CONFIDENCE LEVEL: high (once Lucas picks copy)
RATIONALE: pure string change in App.jsx, no logic touched, can't break anything.
           Coupling-verified against creditSystem.js to ensure new copy reflects
           reality of free-tier 10/month cap.
```

---

### Fix #22 — Annual pass redundant "Unlimited AI Coach" copy (DONE)

```
DIFF:
  src/Components/GeneralPricing.jsx:339          (general pricing)
    REMOVED line: 'Unlimited AI Coach',
  src/Components/NursingTrack/NursingPricing.jsx:300  (nursing pricing)
    REMOVED line: 'Unlimited AI Coach',

  Net: each annual feature list went from 4-5 bullets to 3-4. The dropped bullet
  is already implied by 'Everything in [the 30-Day Pass | Nursing Pass]'.

JACOB'S ORIGINAL REPRO (§Medium):
  Settings → Subscription
  "The annual pass says it also has unlimited AI coach usage but the 30 day
   pass already has that. Fix the text so it is more accurate"

POST-FIX MANUAL VERIFICATION:
  1. npm run dev → http://localhost:5173
  2. Sign in (any tier — copy is visible to all)
  3. Click Settings (gear icon) → Subscription, OR navigate to the pricing flow
  4. Scroll to the "Annual All-Access" card (general flow): confirm bullets are
       • Everything in the 30-Day Pass
       • Year-round access
       • Priority support
     (no "Unlimited AI Coach" line)
  5. Same check on the nursing pricing flow:
       • Everything in Nursing Pass
       • General Interview Prep included
       • Year-round access
       • Priority support
  6. Confirm the 30-Day Pass card still shows AI Coach as included (it does —
     untouched by this fix)

SMOKE TEST IMPACT: pass (no impact — outside smoke check scope)

CONFIDENCE LEVEL: high
RATIONALE: removed one element from each of two literal arrays. No logic, no
           state, no Stripe interaction. Worst case = visual layout shifts one
           pixel.
```

---

### Fix #23 — Contact Support button does nothing (DONE)

```
DIFF:
  src/Components/SettingsPage.jsx:300
  BEFORE: action: () => { window.location.href = 'mailto:support@interviewanswers.ai'; }
  AFTER:  action: async () => {
            try {
              await navigator.clipboard.writeText('support@interviewanswers.ai');
              alert('Email copied to clipboard:\n\nsupport@interviewanswers.ai\n\nPaste into your mail app to send.');
            } catch {
              window.location.href = 'mailto:support@interviewanswers.ai';
            }
          }

JACOB'S ORIGINAL REPRO (§Low):
  Settings → Contact support
  "Clicking on contact support opens a browser and then does nothing.
   Either fix the function of the button or remove it as a button and
   readd it as a line of text only"

POST-FIX MANUAL VERIFICATION:
  1. npm run dev → http://localhost:5173 → sign in
  2. Click Settings → Support → Contact Support row
  3. Expected (modern browser): alert appears with copied email message;
     verify clipboard contains "support@interviewanswers.ai" by paste-testing
     in another field
  4. Optional iOS sandbox / older-browser test: if clipboard API rejects, the
     mailto: fallback fires (same as old behavior — opens Mail app)
  5. Confirm support@interviewanswers.ai is still shown as the row's subtitle
     so the email is also readable without clicking

SMOKE TEST IMPACT: pass (no impact)

CONFIDENCE LEVEL: medium
RATIONALE: navigator.clipboard.writeText requires HTTPS in some browsers
           (works on localhost via Vite dev server); the try/catch falls back to
           the original mailto: behavior on failure, so the worst case is the
           same as before.
WORTH WATCHING: the alert() popup is a quick fix; if Lucas wants a toast/banner
           instead, that's a Wave-2 polish, not a regression.
```

---

### Fix #24 — Tutorial reopen button (SKIPPED — surfaced for Wave 2)

```
Status: SKIPPED. Reclassified from LOW to MEDIUM blast.

JACOB'S ORIGINAL REPRO (§Low):
  N/A
  "There is no way to reopen the tutorial without deleting your account
   and re signing up. Add a tutorial button in settings that re shows the
   initial tutorial."

WHY SKIPPED:
  Implementation requires:
   1. New menu item in src/Components/SettingsPage.jsx (Support section)
   2. New prop callback (e.g., onReplayTutorial) plumbed from SettingsPage
      back up to App.jsx
   3. App.jsx clears localStorage.removeItem('isl_tutorial_seen') and calls
      setShowTutorial(true)
   4. Tutorial.jsx hasShownTutorial check needs to also clear when forced

  This is additive cross-file logic, not a copy edit. Per the framework's
  blast-radius definition, this is closer to MEDIUM (state management +
  shared component touch) than LOW (single-file copy/CSS).

  Per Lucas's directive ("If any item turns out to be a different blast
  radius than triaged, STOP and surface — don't auto-promote it to MEDIUM
  territory"), I held off and surfaced.

PROPOSED WAVE-2 BRANCH: fix/jacob-024-tutorial-reopen-button
ESTIMATED EFFORT: 20 min, isolated PR.
```

---

### Fix #26 — Date till interview off-by-one + doesn't disappear (DONE)

```
DIFF:
  src/Components/InterviewContextHub.jsx:69-78
  BEFORE:
    const getDaysUntil = () => {
      if (!interviewDate) return null;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const interview = new Date(interviewDate + 'T00:00:00');
      const diffTime = interview.getTime() - today.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
      return Math.max(0, diffDays + 1);
    };
  AFTER:
    // Jacob #26 fix — was off-by-one (had `diffDays + 1`) and clamped at 0 so it
    // showed "0 days left" forever after the interview passed instead of disappearing.
    const getDaysUntil = () => {
      if (!interviewDate) return null;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const interview = new Date(interviewDate + 'T00:00:00');
      const diffTime = interview.getTime() - today.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
      return diffDays >= 0 ? diffDays : null;
    };

  The render check at line 246 already gates on `daysUntil !== null`, so
  returning null when the date has passed makes the section disappear
  automatically.

JACOB'S ORIGINAL REPRO (§Low):
  Command Center → Prep
  "When setting an interview date it says you have one extra day than you
   should. It also doesn't leave when they date has already passed.
   *This only affects the Prompt in the command center. On the main page
   the days are shown correctly."

POST-FIX MANUAL VERIFICATION:
  1. npm run dev → http://localhost:5173 → sign in
  2. Navigate to Command Center → Prep section (where InterviewContextHub renders)
  3. Set an interview date 5 days from today
     - BEFORE fix: "6 days left"
     - AFTER fix:  "5 days left" ✅
  4. Set an interview date for TODAY
     - BEFORE fix: "1 day left"
     - AFTER fix:  "0 day left" (or just "0 days left" — the render shows it)
  5. Set an interview date 2 days in the past
     - BEFORE fix: "0 days left" stuck
     - AFTER fix:  the entire days-until block disappears ✅
  6. Cross-check against the main-page display (HomePageV2.jsx ~line 99) — Jacob
     says that one is correct; verify both now show the same number for the
     same date

SMOKE TEST IMPACT: pass (no impact — pure date-math fix)

CONFIDENCE LEVEL: high
RATIONALE: pure arithmetic correction in one local function. The render-side
           gate (daysUntil !== null) already exists and was just receiving the
           wrong value — no other component reads this function.
WATCHOUT: the main-page display uses a different daysUntil calculation
           (HomePageV2.jsx line 99). If they were ever expected to differ this
           fix could surface that inconsistency, but Jacob explicitly said the
           main-page version is correct, so we're now aligned.
```

---

### Fix #27 — Explore Question Bank opens wrong sub-tab (DONE)

```
DIFF:
  src/App.jsx:4626 (button onClick in the empty-state Welcome card)
  BEFORE: onClick={() => setCurrentView('command-center')}
  AFTER:  onClick={() => { setCurrentView('command-center'); setCommandCenterTab('bank'); }}

JACOB'S ORIGINAL REPRO (§Low):
  Main Page → Explore Question Bank
  "When pressing the button it will open the command center but not set
   the sub tab to the question bank, instead it will open which ever sub
   tab the user had selected last"

POST-FIX MANUAL VERIFICATION:
  1. npm run dev → http://localhost:5173 → sign in (with empty question bank,
     or use a fresh account where questions.length === 0)
  2. Confirm the welcome card is visible on the home page
  3. First click the Settings or Command Center, manually navigate to
     Analytics or Progress sub-tab inside the command center, then go back
     home
  4. Click "Explore question bank" button
  5. Verify command center opens AND the active sub-tab is "Bank" (not the
     analytics/progress tab you last visited) ✅

SMOKE TEST IMPACT: pass (no impact)

CONFIDENCE LEVEL: high
RATIONALE: added a sibling state setter call. setCommandCenterTab is already
           imported and used 7+ times elsewhere in App.jsx (lines 3928, 3951,
           4032, 4089, 4526, 4576). Pure additive — can't break the
           setCurrentView call.
```

---

### Fix #30 — Prep Journey Ready button opens Command Center (DONE)

```
DIFF:
  src/Components/Intelligence/JourneyProgress.jsx
  Line 25 (Ready milestone definition):
    BEFORE: { id: 'ready', label: 'Ready', sublabel: 'Interview ready!', icon: Trophy, view: 'command-center' }
    AFTER:  { id: 'ready', label: 'Ready', sublabel: 'Interview ready!', icon: Trophy, view: null }

  Lines 125-126 (button click + touch handlers):
    BEFORE: onClick={() => onNavigate?.(step.view)}
            onTouchEnd={(e) => { if (isTap(e)) { e.preventDefault(); onNavigate?.(step.view); } }}
    AFTER:  onClick={() => step.view && onNavigate?.(step.view)}
            onTouchEnd={(e) => { if (isTap(e)) { e.preventDefault(); step.view && onNavigate?.(step.view); } }}

JACOB'S ORIGINAL REPRO (§Low):
  Main Page → Ready (Your prep journey)
  "When pressing the ready button on the prep journey graphic it opens
   the command center for some reason. If that is intentional disregard
   this error. Otherwise stop it from sending anywhere or send somewhere
   that makes more sense for a button that says you are interview ready"

POST-FIX MANUAL VERIFICATION:
  1. npm run dev → http://localhost:5173 → sign in
  2. Make sure the home page shows the Journey Progress component
     (requires questions.length > 0 OR practice history)
  3. Click each of the first 4 milestones (Practice / Stories / Decode JD /
     Portfolio) — verify each still navigates to its respective view (no
     regression)
  4. Click the Ready milestone (5th milestone, Trophy icon)
     - BEFORE fix: opened Command Center for no obvious reason
     - AFTER fix:  click is a no-op — page stays on home ✅
  5. Repeat #4 with touch events on a mobile/iPad simulator (iPhone SE size in
     dev tools)

SMOKE TEST IMPACT: pass (no impact)

CONFIDENCE LEVEL: high
RATIONALE: short-circuit guard added (`step.view && ...`). The first 4
           milestones still have non-null views, so existing navigation behavior
           is preserved exactly. Only the Ready node was changed to view: null,
           and only the new guard interacts with that.
NOTE: kept the visual button as-is so the Ready milestone still renders as
      part of the journey. Just removed the spurious click target. If Lucas
      wants a celebration / haptic / visual flourish on Ready, that's
      Wave-2 polish, not regression.
```

---

## Wave 1 Status & Sign-off Gate

**5 of 7 fixes applied** (#22, #23, #26, #27, #30) + **1 parked** (#14, awaiting Lucas's copy decision) + **1 surfaced for Wave 2** (#24, MEDIUM-blast cross-file additive).

Lucas should:
1. Read each verification card above
2. For each high-confidence fix: skim the diff and approve
3. For #14: pick copy option A or B (or write his own)
4. For #24: confirm Wave 2 deferral
5. After approval: commit with one-fix-per-branch separation per the framework Step 3
6. Tag rollback point on his Mac (sandbox lacks committer identity):
   ```bash
   git tag -a pre-jacob-wave-1 -m "Pre-Wave-1 rollback point — before Jacob report Wave 1 fixes"
   git push origin pre-jacob-wave-1
   ```

**Wave 2 + Wave 3 do not start until Wave 1 is reviewed and committed.**

---

## Verification Standards by Blast Radius

The 5 verification cards above are sufficient for LOW-blast fixes (copy, statics, single-file simple math). For MEDIUM and HIGH blast fixes, the standard rises:

### MEDIUM-blast (Wave 2)

Verification per fix should add:
- **Reproduce the bug pre-fix** to confirm the repro path matches what Jacob saw
- Manual click-through verification post-fix (same as LOW)
- Smoke test pass (no global regression introduced)
- A pair of test users (or one user + incognito) to verify state-isolation didn't break

### HIGH-blast (Wave 3 — Anthropic 429s, Stripe annual pass, DB migration drift, RLS, Coach token separation)

The smoke test is **too thin** to verify these. Required additional standard:

1. **Pre-fix repro evidence** — screenshot or log showing the bug existing in production OR staging
2. **Local repro** — reproduce on `localhost:5173` against staging Supabase / Stripe-test-mode keys
3. **Edge Function local test** — for fixes touching `supabase/functions/*`, run `supabase functions serve` and send a test payload via curl/httpie; assert HTTP 200 + correct payload shape
4. **Stripe sandbox checkout** — for #8 (annual pass), real test card → checkout success → `user_credits` row written → entitlement reflected in app
5. **Database migration dry-run** — for #16 (`practice_history` schema drift), run the migration on a Supabase shadow branch first; verify no data loss
6. **Post-fix evidence** — second screenshot/log showing the bug gone
7. **Save evidence in the PR description** so future reviewers (and your future self) can verify the fix actually worked

**Don't merge a HIGH-blast fix without all 7 above.** This is the framework's Step 5 in operational form.

(Section appended 2026-05-08 — Wave 1 verification cards added during/after Wave 1 application.)
