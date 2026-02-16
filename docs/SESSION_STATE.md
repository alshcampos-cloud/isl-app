# Session State — Last Updated: February 17, 2026

## What's Live on Production (www.interviewanswers.ai)

### Phase 1: Self-Efficacy Feedback Redesign ✅
- Three-path feedback (main practice, AI interviewer, nursing)
- "Example Strong Answer" constrained to user's actual content
- Bandura-aligned coaching language

### Phase 2: Onboarding + Funnel ~90% ✅
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
- ArchetypeCTA component deployed (not yet verified rendering)

### Nursing Track
- Walled garden model: AI coaches communication, never generates clinical content
- 64 Erin-approved curated questions wired into AI Coach system prompt
- 7 practice modes functional
- Credit system with triple protection
- Pro tier badge fix deployed

## Known Bugs / Unverified Items
1. **E2E signup NOT tested on production** — Nobody has completed 
   Screen 5 signup with a real email on production. Unknown if 
   account creation, email verification, and redirect work together.
2. **ArchetypeCTA rendering NOT verified** — Component deployed but 
   never confirmed showing on home screen with real user data.
3. **Email deliverability unknown** — SPF/DKIM/DMARC not configured 
   for Supabase email. Verification emails may go to spam or not arrive.
4. **Mobile responsiveness NOT tested** — No real device testing done. 
   Audit flagged potential issues with stat cards and practice mode 
   cards at phone widths.
5. **Tutorial race condition** — Pre-existing bug from commit 9924434 
   (Feb 14). hasAcceptedFirstTimeTerms never initialized from DB.
6. **Duplicate loadUserTierAndStats calls** — Runs twice on page load. 
   Not user-facing but doubles Supabase request volume.

## What's Next: Phase 2 Completion
Before Phase 3, Lucas must manually verify:
- [ ] Complete real signup through all 5 screens on production (phone)
- [ ] Confirm email verification works
- [ ] Confirm ArchetypeCTA renders on home screen
- [ ] Test on actual phone (mobile responsiveness)
- [ ] Check onboarding_events in Supabase for real ad traffic data

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
- b3891f7: Fix anonymous users trapped on email verification
- ea78e3b: Route all landing page CTAs through /onboarding
- 4bab02a: Phase 2 completion — 6 production fixes
- 547e17a: Fix onboarding redirect loop + logo back link
- e91cf84: Breathing claims + nursing onboarding customization
- 7145606: Docs — battle scars + audit report update
- [latest]: Nursing AI Coach wired to curated question library

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
