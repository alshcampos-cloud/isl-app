# Pre-Deploy Smoke Test Protocol

> **MANDATORY.** Run before EVERY `git push origin main`.
> If any test fails, do NOT push. Fix the failure first.
> Add this file to /docs/SMOKE_TEST_PROTOCOL.md in the repo.

## Why This Exists

We've shipped multiple production-breaking bugs that compiled 
fine but broke critical user paths:

- Anonymous auth creating dead-end email verification loops
- Redirect loops trapping users in onboarding
- Pro tier queries failing silently on wrong column names
- CTAs pointing to wrong routes after partial updates

"It compiles" is not "it works." This protocol catches 
regressions before they reach production.

---

## The 8 Critical Paths

These are the paths that MUST work at all times. Every deploy
gets tested against all 8. No exceptions.

### Path 1: Landing Page Loads
```
Action: Navigate to / (root)
Expected: Landing page renders with hero, features, CTAs
Failure indicators: Blank page, redirect to /app, redirect 
  to /onboarding, console errors, white screen
```

### Path 2: Landing → Onboarding → Practice → Signup
```
Action: Clear all auth state → Navigate to / → Click 
  "Start Practicing Free" → Complete Screens 1-5
Expected: 
  - Screen 1: Archetype questions render
  - Screen 2: Breathing exercise renders (skip works)
  - Screen 3: Practice question renders, textarea accepts 
    input, AI feedback returns
  - Screen 4: Score displays (skip works)
  - Screen 5: Signup form renders, accepts email/password
Failure indicators: Redirect loop, blank screens, API 
  errors on feedback, stuck on loading spinner
```

### Path 3: Login for Existing Users
```
Action: Navigate to /login
Expected: Login form renders, accepts email/password
Failure indicators: Redirect away from login, form doesn't 
  render, "Verify Your Email" screen for users who ARE verified
Special check: If an anonymous session exists (from onboarding), 
  /login should still show the login form (sign out anonymous 
  session first)
```

### Path 4: Authenticated User → Home Screen
```
Action: Log in as verified user → redirected to /app
Expected: Home screen renders with practice modes, stat cards 
  (or zero-state welcome), navigation works
Failure indicators: Stuck on verification screen, blank home 
  screen, console errors, missing components
```

### Path 5: Nursing Track Access
```
Action: Navigate to /nurse landing page → Click CTA → 
  Verify onboarding has from=nursing behavior
Expected: Nursing landing page renders, CTAs go to 
  /onboarding?from=nursing, field selection is skipped, 
  nursing practice question appears
Failure indicators: CTAs going to /signup, field selection 
  showing for nursing users, generic question instead of 
  nursing question
```

### Path 6: Stripe Payment Flow
```
Action: As logged-in free user, click upgrade/Pro button
Expected: Stripe checkout loads with correct price and plan
Failure indicators: Checkout doesn't load, wrong price, 
  wrong plan name, error on redirect back
Note: Don't complete actual payment in testing — just verify 
  checkout renders
```

### Path 7: AI Features Function
```
Action: As logged-in user, start a practice session →
  submit an answer → receive AI feedback
Expected: AI feedback returns within 10 seconds, shows
  structured coaching response
Failure indicators: API timeout, error message, blank
  feedback, "undefined" in response
Also test: AI Interviewer start → first question appears
```

### Path 8: Streak Display on Home Screen (Phase 3)
```
Action: As logged-in user, navigate to home screen (/app)
Expected:
  - 5 stat cards render in grid (including streak card)
  - Streak card shows flame icon + "0 Day Streak" for new users
  - After completing a practice session, streak updates to 1
  - Tapping streak card opens popover with details
  - On mobile: cards wrap to 2 columns naturally
Failure indicators: Missing streak card, grid layout broken,
  streak not incrementing after session, console errors from
  user_streaks table query, popover doesn't open
Note: If user_streaks table doesn't exist, streak card
  renders nothing (graceful degradation — not an error)
```

---

## How to Run (for Claude Code)

Before every `git push origin main`, run this automated check:

```bash
# 1. Build must succeed
npm run build

# 2. Check for console errors in build output
# Zero errors = pass. Warnings are OK.

# 3. Start local preview
npx vite preview --port 4173 &
sleep 3

# 4. Verify critical routes return 200 (not redirects)
# These are static checks — they verify the routes EXIST
curl -s -o /dev/null -w "%{http_code}" http://localhost:4173/
curl -s -o /dev/null -w "%{http_code}" http://localhost:4173/onboarding
curl -s -o /dev/null -w "%{http_code}" http://localhost:4173/login

# 5. Kill preview server
kill %1
```

This catches build failures and missing routes. It does NOT 
catch auth state bugs (those require browser testing). For auth 
state bugs, Lucas must test manually on production after deploy.

---

## Post-Deploy Manual Checks (Lucas)

After every deploy, spend 2 minutes on your PHONE in an 
INCOGNITO window:

1. Load interviewanswers.ai — landing page shows? ✅/❌
2. Click "Start Practicing Free" — onboarding loads? ✅/❌
3. Click "Sign In" on onboarding — login form shows? ✅/❌
4. Click logo on onboarding — landing page shows? ✅/❌
5. If you have a test account: log in — home screen loads? ✅/❌

Takes 2 minutes. Catches the bugs that cost you ad dollars.

---

## Adding to CLAUDE.md

Add this line to the top-level rules in CLAUDE.md:

```
## Pre-Deploy Protocol
Before EVERY git push to main, run the smoke test protocol 
defined in /docs/SMOKE_TEST_PROTOCOL.md. If any path fails, 
fix it before pushing. No exceptions.
```

This ensures every Claude Code session — even brand new ones — 
knows to run smoke tests before deploying.

---

## When to Update This Protocol

Add new paths when:
- A new critical feature ships (e.g., IRS dashboard, gamification)
- A production bug reveals a path that wasn't being tested
- A new integration is added (e.g., push notifications)

Format: Copy the path template above, describe the action, 
expected result, and failure indicators.
