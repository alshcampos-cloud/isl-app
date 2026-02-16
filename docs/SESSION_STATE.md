# Session State — Last Updated: February 16, 2026 (Late Evening)

## What's Live on Production (www.interviewanswers.ai)

### Phase 1: Self-Efficacy Feedback Redesign ✅
- Three-path feedback (main practice, AI interviewer, nursing)
- "Example Strong Answer" constrained to user's actual content
- Bandura-aligned coaching language

### Phase 2: Onboarding + Funnel ✅
- 5-screen onboarding flow (archetype → breathing → practice → IRS → signup)
- Anonymous auth routing fixed (LandingPage, ProtectedRoute, AuthPage)
- Onboarding redirect loop fixed (sign out anonymous before /login or /)
- Logo/brand link back to landing page from onboarding
- All landing page CTAs → /onboarding
- Nursing landing page CTAs → /onboarding?from=nursing (except "Get Pro Access")
- Nursing visitors: field selection auto-skipped, nursing practice question, SBAR citation
- Breathing exercise: evidence claims softened to supportable language
- Urgent seeker question: "Tell me about your professional background"
- Red/pink positive action buttons → teal in general track
- Zero-state home screen: archetype-aware welcome message
- IRS Screen 4: practice score prominent, IRS secondary with explanation
- Funnel tracking: 25 onboarding_events being recorded
- ArchetypeCTA fix: column mismatch (id→user_id) + missing migration applied (9d10421)
- E2E signup tested on iPhone Chrome — works (email goes to spam)

### Phase 3: IRS + Streaks — IN PROGRESS
- Unit 1: ArchetypeCTA fix (9d10421) — SHIPPED
- Unit 1b: Browser detection consolidation (887daca) — SHIPPED
- Unit 1c: Streak counter system (cfe857a) — SHIPPED ✅ (migration applied)
- Unit 2: IRS v1 — Interview Readiness Score (b60348e) — SHIPPED ✅
- Unit 3: Nursing dashboard wiring — NOT STARTED

### Nursing Track
- Walled garden model: AI coaches communication, never generates clinical content
- 64 Erin-approved curated questions wired into AI Coach system prompt
- 7 practice modes functional
- Credit system with triple protection
- Pro tier badge fix deployed

## Known Bugs / Unverified Items
1. ~~E2E signup NOT tested~~ — **TESTED Feb 16.** Works on iPhone Chrome.
2. **ArchetypeCTA fix deployed** (9d10421) — needs verification with new signup.
3. **Email goes to spam** — SPF/DKIM/DMARC not configured. Verification
   emails arrive but in spam folder. Needs Resend or DNS fix.
4. **Mobile responsiveness NOT tested** — No real device testing done.
   Audit flagged potential issues with stat cards and practice mode
   cards at phone widths.
5. **Tutorial race condition** — Pre-existing bug from commit 9924434
   (Feb 14). hasAcceptedFirstTimeTerms never initialized from DB.
6. **Duplicate loadUserTierAndStats calls** — Runs twice on page load.
   Not user-facing but doubles Supabase request volume.

## What's Next: Phase 3 Units
- [x] Unit 1: ArchetypeCTA fix (SHIPPED 9d10421)
- [x] Unit 1b: Browser detection consolidation (SHIPPED 887daca)
- [x] Unit 1c: Streak counter system (SHIPPED cfe857a) — ✅ MIGRATION APPLIED
- [x] Unit 2: IRS v1 (Interview Readiness Score) — SHIPPED b60348e ✅
- [ ] Unit 3: Wire nursing dashboard to real IRS/streak data
- [ ] Email deliverability (SPF/DKIM/DMARC or Resend)

## Phase 3 Plan (after Phase 2 verified)
Per strategy doc, highest-ROI features:
1. IRS v1 (Interview Readiness Score — North Star metric) — 2 weekends
2. Streak system (Duolingo data: 3x daily return, +14% D14 retention) — 1 weekend
3. Personalize home screen by archetype — 1 weekend
4. Analytics setup (Mixpanel or PostHog) — 1 weekend

## Strategy Alignment (from Phase 2 audit)
- Phases shipped: 1 (feedback) + 2 (onboarding) of 10
- Score: 3/10 (expected — early in roadmap)
- Missing: IRS, streaks, gamification, Confidence Lab, reverse trial, 
  push notifications, spaced repetition, analytics
- Nursing track: 10/10 walled garden compliance
- General track: functional but generic

## Key Decisions Made
- No skip-to-signup on Screen 3 (value-before-signup thesis)
- Skip only on Screens 2 and 4 (skip to next screen, not to signup)
- "Get Pro Access" stays on /signup (paid conversion path, not onboarding)
- IRS shown as secondary on Screen 4 until Phase 3 builds real system
- Nursing onboarding auto-detects from=nursing, not a full redesign yet
- Evidence claims must be supportable (no unverified percentages)
- Color psychology enforced: teal for growth CTAs, never red

## Active Branch
- main (production, auto-deploys via Vercel)

## Key Commits (recent)
- b60348e: Phase 3 Unit 2 — IRS hero card with animated ring, breakdown bars, detail modal
- cfe857a: Phase 3 Unit 1c — Streak counter with Supabase persistence + milestone toasts
- 887daca: Browser detection consolidation into shared utility
- ff15595: iOS third-party browser warnings for all mic features
- 9d10421: Fix ArchetypeCTA column mismatch + add missing migration (Phase 3 Unit 1)
- b9bb4c6: Pro tier query, AI Coach question library, webhook, session docs
- 857a518: Onboarding signup copy honesty fix
- 3609709: Email verification bypass security fix

## Product Expansion Sequence (from strategy)
1. Nursing Interview Prep (weeks 1-4) — IN PROGRESS
2. Public Speaking Trainer (weeks 5-12) — NOT STARTED
3. Executive Communication Coach (Q2-Q3) — NOT STARTED

## Files to Read for Full Context
- CLAUDE.md (top-level instructions)
- docs/PROTOCOLS.md (V.S.A.F.E.R.-M, D.R.A.F.T.)
- docs/BATTLE_SCARS.md (20+ lessons learned)
- docs/SMOKE_TEST_PROTOCOL.md (pre-deploy testing)
- docs/PHASE2_AUDIT_REPORT.md (full production audit)
- docs/research/Master_Strategy_v2.docx (50-page strategy)
