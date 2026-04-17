# ⚔️ BATTLE SCARS — Lessons Learned from InterviewAnswers.AI
## What Went Wrong, What We Fixed, and What Claude Code Must Never Repeat

**Purpose:** This document captures months of hard-won engineering lessons. Read this BEFORE writing any code. Every item here cost real time, real bugs, and real user frustration.

---

## 🏗️ ARCHITECTURE LESSONS

### Lesson 1: The Monolithic App.jsx Problem
**What happened:** App.jsx grew to 8,099 lines with ~70 useState hooks, all views managed by internal state (`currentView`), not React Router.
**Impact:** Every change risked breaking unrelated features. A fix on line 5316 could break behavior on line 740.
**Rule for nursing track:** DO NOT add to App.jsx. Build nursing features as **separate components** in `src/Components/NursingTrack/`. Import them into App.jsx with the smallest possible integration point.

### Lesson 2: State-Based Routing is Fragile
**What happened:** Views controlled by `currentView` state instead of URL routes. Refreshing the page lost your place. Navigation persistence had to be hacked with localStorage.
**Impact:** Debugging was hell — couldn't link to a specific view, couldn't tell what state the app was in.
**Rule for nursing track:** If adding new views, prefer proper React Router routes over state-based view switching. If you must use the existing state pattern, document exactly which states you're adding and why.

### Lesson 3: Edge Functions Need Error Handling
**What happened:** Supabase Edge Functions (AI feedback, checkout, webhooks) would fail silently. 40% failure rate on question generation.
**Fix:** Added retry logic (3 attempts, delays: 0s/1s/2s), only charge usage AFTER success.
**Rule for nursing track:** Any new Edge Function must include:
- Retry logic (3 attempts with backoff)
- Explicit error responses (not silent failures)
- Console logging for every attempt
- Never charge/track usage before confirmed success

---

## 🎤 SPEECH RECOGNITION / MICROPHONE LESSONS

### Lesson 4: iOS Safari Microphone is Special
**What happened:** Mic worked on Chrome desktop but broke on iOS Safari. Start/stop sounds are OS-level and cannot be suppressed.
**Fix:** Keep mic session open continuously — start once, pause/resume processing, stop only on exit. Reinitialize fresh recognition object on each new session (not reuse stale one).
**Rule for nursing track:** If nursing track uses speech features (mock interview), inherit the existing mic lifecycle exactly. Do NOT create a new speech recognition implementation. Use the same `recognitionRef`, same `startListening`/`stopListening`, same cleanup.

### Lesson 5: getUserMedia Requires User Gesture on Mobile
**What happened:** Trying to start mic programmatically (not from a click handler) silently fails on iOS.
**Fix:** Always trigger mic from direct user interaction (button click/touch).
**Rule:** Never auto-start mic. Always require explicit user tap.

### Lesson 6: Recognition "Already Started" Errors
**What happened:** Rapid spacebar presses caused `recognition.start()` to fire while already running → `InvalidStateError`.
**Fix:** Guard with `isListeningRef.current` check before calling `.start()`. Handle `no-speech` error gracefully (it's expected, not a real error). Handle `aborted` error with state reset.
**Rule:** Always check listening state before starting. Always handle these error types gracefully.

### Lesson 7: Mic Cleanup Between Sessions
**What happened:** Ending an interview and starting a new one broke the mic — stale recognition object.
**Fix:** Full cleanup sequence: stop recognition → remove event listeners → null the ref → reinitialize fresh on next session start. Add 100ms delay before starting new recognition to let browser release audio.
**Rule:** Every session transition must fully clean up and reinitialize speech recognition.

---

## 💰 BILLING / STRIPE LESSONS

### Lesson 8: Charge AFTER Success, Never Before
**What happened:** Usage counter incremented before API call. If call failed (40% of the time), user lost a credit for nothing.
**Fix:** Check limits before allowing action → make API call → only increment on success → if all retries fail, charge zero.
**Rule:** This pattern is sacred. The nursing track must follow the exact same flow:
```
1. Check if user has credits (gate the button)
2. User clicks
3. API call with retry
4. Wait for success
5. Only then increment usage
6. If all retries fail → user charged ZERO
```

### Lesson 9: Beta Users Need Unlimited Access
**What happened:** Beta testers (in Supabase `beta_testers` table) were hitting free tier limits during testing.
**Fix:** Check beta status before limit enforcement. Beta = unlimited.
**Rule:** The nursing track must respect the same beta_testers table.

### Lesson 10: Stripe Webhook Must Be Verified
**What happened:** Webhook needed proper signing secret verification. Without it, anyone could fake a payment event.
**Setup chain:** Create webhook in Stripe Dashboard → get signing secret (whsec_...) → set in Supabase secrets → verify signature in Edge Function.
**Rule:** If nursing track has separate pricing, it must go through the existing Stripe infrastructure — NOT a new parallel system.

---

## 🐛 BUG FIX METHODOLOGY LESSONS

### Lesson 11: Never Fix What You Can't See
**What happened:** Multiple times, Claude made fixes based on partial file context (couldn't see the full 8,099-line App.jsx). Result: syntax errors, unclosed tags, duplicate code blocks.
**Fix:** V.S.A.F.E.R.-M protocol — always verify baseline first, always see the actual code before changing it.
**Rule for Claude Code:** You have full filesystem access. USE IT. Read the actual file. Don't guess. Don't assume. `cat` the file, `grep` for the function, see the real code.

### Lesson 12: One Bug at a Time
**What happened:** Trying to fix multiple bugs in one session led to cascading failures — fix for Bug A broke the context for Bug B.
**Fix:** Strict single-bug scoping. Fix one thing, test it, confirm it works, then move to the next.
**Rule:** Same applies to feature building. Build one piece, verify it works, then build the next.

### Lesson 13: String Replacement Typos Are Real
**What happened:** Manual find-and-replace in large files introduced typos — wrong line ranges, missed closing brackets, duplicate paste.
**Fix:** V.S.A.F.E.R.-M exact-line accounting + sandbox-first approach.
**Rule for Claude Code:** Use proper file operations. Don't do massive string replacements. Create new files, test them, then integrate.

### Lesson 14: Rollback Must Always Be Possible
**What happened:** Broke production with a bad deploy. Had to `git revert` to get the app working for beta tester Jacob.
**Rule:** Always know what commit you're working from. Always be able to `git revert` or `git checkout` to a known-good state. Feature branches exist for this reason.

### Lesson 15: Regression Checklists Are Non-Negotiable
**What happened:** Fixed chart dot click handling (pointerEvents fix for iOS Safari) and almost broke desktop hover animations.
**Fix:** R in V.S.A.F.E.R.-M — list 3-7 specific things your change could break, tied to specific mechanisms (not generic warnings).
**Rule:** After building any nursing track feature, provide a specific regression checklist tied to the existing features it could affect.

---

## 📱 MOBILE / CROSS-PLATFORM LESSONS

### Lesson 16: Test on iOS Safari Early and Often
**What happened:** Features worked perfectly on Chrome desktop but broke on iOS Safari — mic issues, touch event issues (chart dots), CSS differences.
**Fix:** Always test touch events with both `onClick` AND `onTouchStart`/`onTouchEnd`. Use `<g>` wrapper with transparent hit targets for small SVG elements.
**Rule:** If building any interactive nursing track UI, assume iOS Safari will behave differently and design for it from the start.

### Lesson 17: Capacitor Adds Complexity
**What happened:** App runs on web (Vercel) and as native app (Capacitor for iOS/Android). Each platform has different payment flows (Stripe web vs Apple/Google IAP).
**Rule:** For now, the nursing track should work on web first. Don't worry about Capacitor-specific behavior during exploration. Flag anything that might need native consideration.

---

## 🔧 DEVELOPMENT WORKFLOW LESSONS

### Lesson 18: Context Loss Between Chat Sessions
**What happened:** Moving between Claude chat sessions lost all context — had to re-explain the codebase, re-establish constraints, re-identify what was already fixed.
**Fix:** Created handoff documents, protocol documents, repo maps.
**Rule:** The D.R.A.F.T. protocol exists for this reason. At the end of every session, provide a summary of what was built, what works, what needs work.

### Lesson 19: Don't Trust AI-Generated Clinical Content
**What happened:** This is the entire reason for the walled garden model. AI confidently generates plausible-sounding clinical content that may be wrong. In a nursing context, wrong clinical information could harm patients.
**Rule:** THE cardinal rule of this project. AI coaches communication. Humans provide clinical content. No exceptions. No shortcuts. No "just this once."

### Lesson 20: Erin's Feedback Is Product Truth
**What happened:** Lucas and Claude built an elaborate vision with specialty matching, nursing school B2B, hospital partnerships. Erin (the actual clinical domain expert) cut through it: nurses know their specialty, schools won't buy this, hospitals aren't the right customer.
**Rule:** When Erin says no, it's no. When she raises a concern, it becomes a constraint. She understands the nursing audience in a way that engineering analysis cannot replicate.

---

## 📋 QUICK REFERENCE: PATTERNS TO USE

| Situation | Pattern | Source |
|-----------|---------|--------|
| API call to Edge Function | Retry 3x with backoff, charge after success | Lesson 3, 8 |
| Speech recognition | Inherit existing mic lifecycle, don't rebuild | Lesson 4, 5, 6, 7 |
| New UI component | Separate file in Components/, minimal App.jsx touch | Lesson 1 |
| New view/page | Prefer React Router route over state-based view | Lesson 2 |
| Mobile interaction | Test iOS Safari, use touch events + click events | Lesson 16 |
| Any clinical content | Human-validated only, source-cited, never AI-generated | Lesson 19 |
| Bug fix | V.S.A.F.E.R.-M (one bug, verify baseline, exact lines) | Lesson 11-15 |
| Feature exploration | D.R.A.F.T. (branch, new files only, track for merge) | Lesson 14, 18 |

---

## 📋 QUICK REFERENCE: PATTERNS TO AVOID

| Anti-Pattern | Why | Lesson |
|-------------|-----|--------|
| Adding code to App.jsx | It's already 8,099 lines. Every line added increases risk | 1 |
| Silent API failures | Users think it worked when it didn't | 3 |
| Charging before success | Users pay for nothing | 8 |
| Rebuilding speech from scratch | Months of iOS Safari fixes would be lost | 4-7 |
| Fixing multiple things at once | Cascading failures | 12 |
| Guessing at code you haven't read | Typos, wrong assumptions, broken output | 11 |
| AI-generated clinical content | Patient safety risk, credibility risk, legal risk | 19 |
| Ignoring Erin's feedback | She's the domain expert, period | 20 |

---

*Compiled from 3+ months of InterviewAnswers.AI development — Lucas & Claude, February 2026*
*Every lesson here was learned the hard way. Don't repeat them.*

### Battle Scar: Ideal Answer hallucination
The Example Strong Answer prompt had no constraints on what facts the AI could use. It hallucinated HIPAA, patient data, and flu season for a fintech analytics answer because it saw 'Stanford' and assumed healthcare. Fix: added 6 IDEAL ANSWER RULES modeled on the nursing walled garden — ONLY use facts from the user's actual exchanges, NEVER invent context. Same principle as C.O.A.C.H.: constrain what the AI can generate.

### Battle Scar: AI Interviewer exchangeCount is 0-indexed
exchangeCount starts at 0, increments AFTER each response. So >= 3 check fires on the 4th user submission, not the 3rd. Self-efficacy addendum and consolidated ideal answer both fire at exchangeCount >= 3.

### Battle Scar: Nursing previousScores uses averaged scores
NursingPracticeMode.jsx line 188 creates [avg, avg, avg] instead of real per-session scores. Works for Phase 1. Replace with actual Supabase query in Phase 3 when IRS is wired up. Flagged by Erin.

### Battle Scar: Supabase SQL editor autocomplete corrupts queries
The Supabase SQL editor has aggressive autocomplete that silently modifies your SQL as you type. Column names, table names, and keywords get replaced with suggestions you didn't choose. This caused migrations to fail with cryptic errors — the SQL that ran wasn't what was written. Fix: Use the Monaco API directly (`window.monaco.editor.getModels()[n].setValue(sql)`) to inject queries, bypassing the autocomplete entirely. Also: migrations run in the SQL editor don't persist across sessions — always save migration SQL as `.sql` files in the repo, and re-run if the table doesn't exist.

### Battle Scar: Supabase onboarding_events table didn't persist
Ran the onboarding_events migration in the SQL editor during a session, got "Success", but the table wasn't there when we came back. The first full onboarding flow test failed silently (all tracking calls use try/catch with console.warn) because the table didn't exist yet. Had to re-run the migration AND re-do the entire test flow. Lesson: always verify tables exist with `SELECT * FROM information_schema.tables WHERE table_name = 'your_table'` before testing. Save migrations in docs/ and commit them.

### Battle Scar: Anonymous auth users get trapped on email verification screen
Anonymous users created via `signInAnonymously()` during onboarding have a valid Supabase session but no email. When they navigate to `/app`, ProtectedRoute checks email verification status — anonymous users have `email_confirmed_at: null` and no email to verify, creating a dead-end. Users see "Verify Your Email" with a blank email field and no way out. Fix: ProtectedRoute now checks `user.is_anonymous` before the email verification check and redirects anonymous users back to `/onboarding`. Also added guard in LandingPage.jsx to prevent anonymous sessions from being treated as authenticated. Lesson: anonymous auth is a real session with real tokens — every auth gate must explicitly handle the anonymous case.

### Battle Scar: Multiple CTAs pointing to different signup routes
Landing page had 7 CTA buttons across 5 component files. When onboarding was added at `/onboarding`, only the hero CTA was updated — the other 6 still pointed to `/signup`, bypassing the value-first onboarding entirely. Paid ad traffic landed on the landing page and most "Start Practicing Free" clicks skipped onboarding. Fix: systematic grep of all landing page components for `/signup` and bulk update. Lesson: when changing a user flow entry point, grep ALL files for the old route — not just the one you remember. Landing pages have CTAs scattered across navbar, hero, features, pricing, footer, and mobile sticky components.

### Battle Scar: Always test signup end-to-end after auth flow changes
After adding anonymous auth for onboarding + fixing the email verification trap + changing CTA routes, the full signup pipeline had 3 different entry points (landing → onboarding → signup, landing → direct signup, nursing landing → onboarding). Each path needed separate verification: clear all storage → navigate as new user → complete full flow → check Supabase for real account. Unit testing individual components doesn't catch routing/auth integration failures. Lesson: after any change to auth, routing, or onboarding — run the complete signup flow in an incognito window. Every. Single. Time.

### Battle Scar #21: Sign-out button hangs on iOS because async calls never resolve
Fixed April 11, 2026 in build 1.0 (30). The Settings page sign-out handler awaited `logoutIAP()` (RevenueCat) AND `supabase.auth.signOut()` sequentially. Either one can hang indefinitely inside the iOS WKWebView — there is no timeout, no abort controller, no fallback. When the first one hangs, the button shows "Signing out…" forever. Apple reviewer would hit this on their first test. The fix pattern ALREADY EXISTED in `src/App.jsx` line 4408 (profile dropdown sign-out) with a comment "SIGN OUT FIX: Don't await anything that might hang" but was never propagated to the Settings page. Solution: fire-and-forget both calls (`logoutIAP()?.catch?.(() => {})` + `supabase.auth.signOut({ scope: 'global' })?.catch?.(() => {})`), clear local storage synchronously, redirect via `window.location.href = '/'` in the same tick. Lesson: **when a fix is applied to one place, grep for the same pattern everywhere and apply it everywhere.** iOS WebView async hazards are not hypothetical — they bit us in Settings, the dropdown, and probably 3 other places that haven't been audited yet (SpecialtySelection, NursingDashboard, FirstTimeConsent, Onboarding all still use `await supabase.auth.signOut()`).

### Battle Scar #22: Battle Scar #3 was a lie — server-side retry logic never actually existed
Discovered April 11, 2026 via Auditor agent + direct code audit. Battle Scar #3 above says: "Any Edge Function must include: retry logic (3 attempts, 0s/1s/2s backoff), explicit error responses, console logging, never charge usage before confirmed success." This was true on the CLIENT (`src/utils/fetchWithRetry.js`) but NEVER on the server. **Five** Anthropic call sites in Supabase Edge Functions do raw `fetch('https://api.anthropic.com/v1/messages')` with zero retry, zero 429 handling, and return the raw Anthropic error body to the client as a 200 OK response — the client parses garbage. Worse: the nursing path `ai-feedback/index.ts:681` even LOGS the error then `return`s the bad data as if it were successful. Worse still: usage was sometimes charged on these broken responses (Battle Scar #8 violation stacked on top). Fix: new shared helper at `supabase/functions/_shared/anthropic.ts` with typed errors, exponential backoff (1s/2s/4s — more correct than the 0/1/2s the old Scar cited), Retry-After header respect, and shape validation. Plus client-side `fetchWithRetry.js` patched to stop retrying on 429/503 so we don't compound upstream pressure. **Battle Scar #3 should be considered updated: server-side retry wrapper exists at `_shared/anthropic.ts` as of April 11, 2026, not yet deployed as of 17:40 PDT.** Lesson: **"it's in the docs" ≠ "it's in the code." Audit claims against actual behavior before trusting them, especially for cross-cutting concerns like retry and error handling.** Added 2026-04-11.

### Battle Scar #23: Agent research without a Reviewer pass produces ~30% stale content
Also discovered April 11, 2026. Ran a 5-parallel-agent research sprint (email capacity, Anthropic capacity, infra capacity, launch plan, paid ROI) + consolidated their output into a master plan. Then ran a 6th Reviewer agent whose only job was to cross-check the master plan against the source research. Reviewer caught 7 critical issues the consolidation missed: (1) calendar day-of-week errors — Apr 15 is Wed not Tue, (2) Product Hunt launch date violating the source plan's own "2 weeks post-approval + reviews first" prerequisite, (3) CAC arithmetic inconsistency — $167 from one model mixed with 18 payers from another, (4) missing $25/mo Supabase Pro from the P0 budget total, (5) Anthropic target one tier too low ($250 actually lands on Tier 3, not Tier 2), (6) TWO additional Anthropic call sites the Auditor missed (`health-check/index.ts:67`, `scheduled-health-check/index.ts:135`), and (7) four pre-launch prerequisites the master plan silently dropped (`feature/nursing-track` merge, mobile real-device test, AI quality sweep, email warmup). Lesson: **when spawning agents in parallel, ALWAYS spawn a dedicated Reviewer at the end whose only job is to cross-check the final synthesis against the raw source material.** The research is only as trustworthy as its cross-check. Also: never trust any single agent's enumeration of "all call sites" or "all files that do X" — verify with your own grep. Added 2026-04-11.

### Battle Scar #24: Phase 2 Marketing Agent build — the self-fallback pattern for slow coders
Discovered April 11–12, 2026 during the Phase 2 Marketing Agent overnight build. Spawned 3 Coder sub-agents in parallel (Coder-1 for `public/team.html`, Coder-2 for `content-generator.ts` + `index.ts`, Coder-3 for the Deno Edge Function runtime). Coder-2 took ~30 minutes without returning and was blocking my TypeScript compile chain because `index.ts` had to import `content-generator.ts`. Rather than waiting indefinitely, I pivoted: built `content-generator.ts` and `index.ts` myself as the PRIMARY versions, then treated Coder-2's eventual output as a refinement option (diff and cherry-pick if something was better). The self-built versions compiled clean and shipped. **Lesson:** when spawning coder sub-agents in parallel for a tight-deadline build, always have a "self-fallback" ready for anything on the critical path. Never let one silent coder agent block the overall pipeline. The Supervisor's job is to pivot — if an agent goes quiet for >20 minutes on a critical path, start building it yourself in parallel.

**Companion lesson:** building agent code for Phase 2 re-validated Battle Scar #22 — Vercel can't bundle `/agents/` code into `/api/` serverless functions. The cleanest solution is to ship agent code in TWO places: `/agents/marketing-agent/` (Node/TypeScript, canonical reference, used for local CLI runs and future standalone server) AND `supabase/functions/marketing-agent/` (Deno, inlined templates, actually deployable via Supabase pg_cron). This is painful (same logic in two runtimes) but it's the reality of Phase 1's deployment architecture.

**Secondary fix bundled in:** the Phase 1 `ProposalStatus` TypeScript type in `agents/shared/types.ts` was `'proposed' | 'approved' | 'rejected' | 'implemented'` but the SQL migration uses `'pending'` as the actual status. `proposal-engine.ts` wrote `'pending'` without a type error (schema drift that would have broken on full typecheck). Fixed additively by extending the union to include `'pending'` — unblocks `tsc --noEmit` and matches the live DB. Added 2026-04-11.

### Battle Scar #25: "Update Review" is NOT "Resubmit to App Review" in ASC
Discovered April 15, 2026. After Apple rejected Build 1.0(30) for an IAP purchase error, I fixed the root cause (RevenueCat had zero products imported — the IAPs existed in App Store Connect but were never linked to RevenueCat's product catalog), updated the reviewer notes in the ASC version page, and clicked **"Update Review"** at the top of the page. Assumed that resubmitted to Apple. It did not.

**"Update Review" only saves metadata changes to the app version.** It does NOT push the submission back to Apple's review queue. The submission remained in 🔴 "Unresolved Issues" state.

To actually resubmit you have to:
1. Click **App Review** in the left sidebar (NOT the version page)
2. Click the submission in the Submissions table (the one showing "Unresolved Issues")
3. Click the **"Resubmit to App Review"** button in the top-right corner
4. Status changes to 🟡 "Waiting for Review"

**Lesson:** The ASC UI has two confusingly similar buttons. Always verify the submission-level status (🔴 Unresolved Issues vs. 🟡 Waiting for Review) on the App Review page, not the version page. The version-level "Ready for Review" can be green while the submission itself is still rejected and never re-queued.

**Related:** The root cause that originally triggered the rejection was a different gotcha — RevenueCat requires products to be manually imported and linked to entitlements + offerings for IAP to work. Even if IAPs exist in App Store Connect and StoreKit is configured correctly in the app, the call to `Purchases.getOfferings()` returns empty if RevenueCat doesn't know about the products. Always verify RevenueCat's Products catalog is populated before submitting any IAP-dependent build.

### Battle Scar #26: SQL migrations need destructive-operation confirmation in Supabase SQL Editor
Discovered April 15, 2026. When running the `20260415_update_delete_user_abuse.sql` migration (which replaces the `delete_user()` function — contains 14 `DELETE FROM` statements inside the function body), Supabase's SQL Editor popped a "Potential issue detected: Query has destructive operations" warning dialog. The migration looked frozen for a few seconds until I noticed the modal. Click "Run this query" to confirm.

**Lesson:** Migrations that create/replace functions containing DELETE statements will trigger Supabase's destructive-operation safeguard. It's a one-time click, but don't mistake it for a hang. Always check for modals when the editor appears to stall.
