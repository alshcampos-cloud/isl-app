# HANDOFF PROMPT — Paste This Into Your New Claude Code Session
# Generated: February 18, 2026
# Copy everything below the line into your new session.

---

## CONTEXT: Pick up exactly where we left off on InterviewAnswers.AI

You are continuing work on **InterviewAnswers.AI** — a live, deployed AI-powered interview preparation app with a nursing specialty track being built on the `feature/nursing-track` branch.

**Project location:** `/Users/alshcampos/Downloads/isl-complete`

### MANDATORY: Read These Files FIRST (Before Writing Any Code)
```
CLAUDE.md                                    — Master operating instructions (auto-loaded)
docs/BATTLE_SCARS.md                         — 20+ engineering lessons (read before coding)
docs/NURSING_TRACK_INSTRUCTIONS.md           — Nursing track operating manual + C.O.A.C.H. protocol
docs/NURSING_TRACK_REMAINING_WORK.md         — Status archive (nursing track engineering complete)
docs/SESSION_STATE.md                        — Project status (needs updating — see below)
docs/PROTOCOLS.md                            — D.R.A.F.T., V.S.A.F.E.R.-M protocols
docs/SMOKE_TEST_PROTOCOL.md                  — Pre-deploy testing checklist
```

---

## CURRENT STATE (as of February 18, 2026, 3:34 AM UTC)

### Branch: `feature/nursing-track`
- Last committed: `71325b6` (Merge main into feature/nursing-track)
- **33 files modified + 5 new files — ALL UNCOMMITTED but deployed to Vercel production**
- The uncommitted changes ARE live on www.interviewanswers.ai (deployed via `npx vercel --prod` from this branch)

### What's Deployed (Production: www.interviewanswers.ai)
Everything below is LIVE:

#### Supabase Edge Functions (all 3 deployed Feb 18, 2026):
- `ai-feedback` (v29) — nursing-coach mode, server-side credit validation, server-side onboarding prompts, pass-based pricing
- `create-checkout-session` (v14) — supports both general Pro ($29.99/mo) and nursing 30-day pass ($19.99)
- `stripe-webhook` (v14) — handles pass expiry columns, both subscription and pass checkout types

#### Supabase Migrations Applied:
- `20260217000001_add_pass_columns.sql` — Added `nursing_pass_expires`, `general_pass_expires` columns to user_profiles
- `20260217000002_add_session_answer_feedback.sql` — Added `user_answer`, `ai_feedback` TEXT columns to nursing_practice_sessions
- `20260216000002_user_streaks.sql` — User streaks table for streak tracking
- All earlier nursing track migrations (tables, seed data, saved answers, archetype columns)

#### Stripe:
- Nursing 30-Day Pass price ID: `price_1Sxe9LJtT6sejUOK1JKSxVqA` ($19.99 one-time)
- General Pro subscription: existing monthly at $29.99/mo
- Both products configured in Stripe Dashboard + webhook

---

## WHAT WAS JUST COMPLETED (Last 2 Sessions — Feb 17-18)

### P1: Conversion Optimization (8 Changes — ALL DONE)
| # | Change | File(s) | Status |
|---|--------|---------|--------|
| 1 | Fix Pro pricing CTA bug (was linking to wrong plan) | PricingSection.jsx, NursingLandingPage.jsx | ✅ |
| 2 | Mid-page CTAs on NursingLandingPage | NursingLandingPage.jsx | ✅ |
| 3 | Skip breathing exercise for urgent seekers (archetype) | ArchetypeOnboarding.jsx | ✅ |
| 4 | Loss-framed signup copy with real feature list | SignUpPrompt.jsx | ✅ |
| 5 | IRS trajectory visualization on IRSBaseline screen | IRSBaseline.jsx | ✅ |
| 6 | Feature Preview screen between IRS and Signup | FeaturePreview.jsx (NEW) | ✅ |
| 7 | Clinical credibility signals for nursing onboarding | OnboardingPractice.jsx | ✅ |
| 8 | Server-side onboarding prompts (IP protection) | OnboardingPractice.jsx, ai-feedback/index.ts | ✅ |

### P2: Product Separation + Pass Pricing (ALL DONE)
| Change | File(s) | Status |
|--------|---------|--------|
| Separate pricing components | GeneralPricing.jsx (NEW), NursingPricing.jsx (NEW) | ✅ |
| creditSystem.js overhaul for pass-based access | creditSystem.js | ✅ |
| create-checkout-session pass mode | create-checkout-session/index.ts | ✅ |
| stripe-webhook pass fulfillment | stripe-webhook/index.ts | ✅ |
| Server-side credit validation (pass-aware) | ai-feedback/index.ts | ✅ |
| NursingTrackApp pricing integration | NursingTrackApp.jsx | ✅ |
| All upgrade links → returnTo=/nursing | 9 nursing components | ✅ |

### Additional Fixes (Found During Testing)
| Fix | File(s) | Status |
|-----|---------|--------|
| Answer/feedback persistence in DB | nursingSessionStore.js, nursingSupabase.js, 3 mode components, NursingCommandCenter.jsx, migration SQL | ✅ Deployed + Migration Applied |
| Email confirmation routing (nursing users sent to general after email verify) | SignUpPrompt.jsx (5 changes), LandingPage.jsx (2 changes) | ✅ Deployed + Tested |
| Post-login routing `/login?from=nursing` → `/nursing` | AuthPage.jsx (already worked), tested end-to-end | ✅ Verified |

### Email Confirmation Routing Fix Details (5-point chain fix):
1. **SignUpPrompt.jsx**: Added `onboarding_field: 'nursing'` to signUp() user_metadata
2. **SignUpPrompt.jsx**: "Go to Sign In" button → `/login?from=nursing` for nursing users
3. **SignUpPrompt.jsx**: "Already have an account?" link → `/login?from=nursing`
4. **LandingPage.jsx**: Email confirmation redirect checks `user_metadata.onboarding_field`
5. **SignUpPrompt.jsx**: Sets `localStorage('isl_tutorial_seen', 'true')` + `isl_onboarding_field` immediately after signUp() (before email)

---

## UNCOMMITTED FILES (33 modified + 5 new — all deployed to Vercel)

### Modified Files:
```
STRIPE_SETUP.md
docs/SESSION_STATE.md
src/App.jsx                                    — Pass pricing routes, returnTo handling
src/Components/Landing/LandingPage.jsx         — Email confirmation nursing routing
src/Components/Landing/PricingSection.jsx      — CTA fix
src/Components/NativeCheckout.jsx              — Pass support
src/Components/NursingTrack/NursingAICoach.jsx — Upgrade link returnTo
src/Components/NursingTrack/NursingCommandCenter.jsx — Answer/feedback expandable details, bar graph fix
src/Components/NursingTrack/NursingConfidenceBuilder.jsx — Upgrade link returnTo
src/Components/NursingTrack/NursingDashboard.jsx — Pass-aware credit display
src/Components/NursingTrack/NursingLandingPage.jsx — Mid-page CTAs, pricing fix
src/Components/NursingTrack/NursingMockInterview.jsx — Answer persistence, upgrade link
src/Components/NursingTrack/NursingOfferCoach.jsx — Upgrade link returnTo
src/Components/NursingTrack/NursingPracticeMode.jsx — Answer persistence, upgrade link
src/Components/NursingTrack/NursingSBARDrill.jsx — Answer persistence, upgrade link
src/Components/NursingTrack/NursingTrackApp.jsx — Pricing route, pass-aware nav
src/Components/NursingTrack/nursingSessionStore.js — userAnswer + aiFeedback fields
src/Components/NursingTrack/nursingSupabase.js — user_answer + ai_feedback columns
src/Components/Onboarding/ArchetypeOnboarding.jsx — Skip breathing for urgent seekers
src/Components/Onboarding/IRSBaseline.jsx — IRS trajectory visualization
src/Components/Onboarding/OnboardingPractice.jsx — Clinical credibility, server-side prompts
src/Components/Onboarding/SignUpPrompt.jsx — Loss-framed copy, nursing routing fix
src/Components/StripeCheckout.jsx — Pass checkout support
src/Components/SubscriptionManagement.jsx — Pass display
src/Components/Tutorial.jsx — Minor fix
src/Components/UsageDashboard.jsx — Pass awareness
src/Components/UsageLimitModal.jsx — Pass-aware upgrade messaging
src/utils/archetypeRouter.js — Urgent seeker archetype routing
src/utils/creditSystem.js — Full overhaul for pass-based access model
supabase/functions/ai-feedback/index.ts — Server-side onboarding prompts, pass credit validation
supabase/functions/create-checkout-session/index.ts — Pass checkout mode
supabase/functions/stripe-webhook/index.ts — Pass fulfillment
supabase/migrations/20260216000002_user_streaks.sql — Modified
```

### New Files (untracked):
```
src/Components/GeneralPricing.jsx            — General track pricing component
src/Components/NursingTrack/NursingPricing.jsx — Nursing 30-day pass pricing component
src/Components/Onboarding/FeaturePreview.jsx — Feature preview screen (onboarding)
supabase/migrations/20260217000001_add_pass_columns.sql — Pass expiry columns migration
supabase/migrations/20260217000002_add_session_answer_feedback.sql — Answer/feedback columns migration
```

---

## WHAT NEEDS TO HAPPEN NEXT

### Immediate: Commit the uncommitted work
All 33+5 files are deployed but NOT committed to git. This is a risk. These changes should be committed to `feature/nursing-track` and eventually merged to `main`.

### SESSION_STATE.md Needs Updating
The file is stale — last meaningful update was Feb 16. Needs to reflect:
- P1 conversion optimization complete
- P2 pass pricing complete
- Answer/feedback persistence complete
- Email confirmation routing fix complete
- All edge functions deployed (ai-feedback v29, create-checkout-session v14, stripe-webhook v14)
- Migrations applied (pass columns, answer/feedback columns)

### Google Page Indexing
User received an email from Google about page indexing. This is the next task to investigate and address.

### Remaining Known Issues:
1. **Email deliverability** — SPF/DKIM/DMARC not configured. Verification emails go to spam.
2. **Tutorial race condition** — `hasAcceptedFirstTimeTerms` never initialized from DB (pre-existing)
3. **Mobile responsiveness** — Not audited on real devices
4. **No nursing-specific tutorial** — General tutorial suppressed for nursing users, but no replacement exists
5. **Meta Ads target URL** — Should use `/onboarding?from=nursing` not `/nurse` (config change, not code)

### Things NOT to Touch (recently fixed, fragile):
- Email confirmation routing (5-point fix just deployed)
- Credit system (triple protection: UI + guard function + server-side)
- Speech recognition lifecycle (months of iOS Safari fixes)
- Anonymous auth flow in onboarding

---

## ARCHITECTURE QUICK REFERENCE

### Tech Stack
- React 18 + Vite + Tailwind CSS
- Supabase (PostgreSQL, Auth, Edge Functions)
- Anthropic Claude (Haiku 4.5 for practice/onboarding, Sonnet 4 for interviews/coaching)
- Stripe (web payments) + Capacitor (iOS/Android wrapper, web-first)
- Vercel (deployment, auto-deploys from main)

### Key Routes
| Route | Component | Purpose |
|-------|-----------|---------|
| `/` | LandingPage | General landing + marketing |
| `/nurse` | NursingLandingPage | Nursing marketing page |
| `/onboarding` | ArchetypeOnboarding | Value-first onboarding (5-6 screens) |
| `/onboarding?from=nursing` | ArchetypeOnboarding | Nursing-specific onboarding flow |
| `/login` | AuthPage | Login |
| `/login?from=nursing` | AuthPage | Login with nursing redirect |
| `/app` | App.jsx (monolith) | General track dashboard |
| `/nursing` | NursingTrackApp | Nursing track (protected) |

### Pricing Model
| Product | Price | Type | Stripe Price ID |
|---------|-------|------|-----------------|
| General Pro | $29.99/mo | Subscription | (existing) |
| Nursing 30-Day Pass | $19.99 | One-time | price_1Sxe9LJtT6sejUOK1JKSxVqA |

### Credit System (Nursing Track)
| Feature | Free | Pass |
|---------|------|------|
| Quick Practice | 3/mo | Unlimited |
| Mock Interview | 1/mo | Unlimited |
| SBAR Drill | 2/mo | Unlimited |
| AI Coach | 0 (Pro only) | 20/mo cap |
| Offer Coach | 0 (Pro only) | Unlimited |
| Confidence Builder | 0 (Pro only) | Unlimited |
| Flashcards | Unlimited | Unlimited |

### Three Protocols
1. **D.R.A.F.T.** — Feature exploration (nursing track). Branch, new files only, align with Erin, experiment, track for merge.
2. **V.S.A.F.E.R.-M** — Production bug fixes. Verify baseline, scope-lock, additive only, function-preserving, exact-line accounting, regression-aware, merge-gated.
3. **C.O.A.C.H.** — AI conversation design. Context set, only curated questions, assess communication (not clinical), coach with layers, handle boundaries.

### Hard Stop Rule
If you need to change shared utilities, global config, routing architecture, app-wide state, auth, or billing → **STOP AND ASK FIRST.**

### Test Account
- Email: alshcampos@gmail.com
- Password: Test102!
- This account may need password to be entered by the user (security boundary)

---

## GIT STATE
```
Branch: feature/nursing-track
Last commit: 71325b6 (Merge main into feature/nursing-track)
Main branch HEAD: 07061a4 (Fix SEO URLs)
Stashes:
  stash@{0}: WIP on feature/nursing-track (Phase 9 UX polish — old)
  stash@{1}: P1 changes on main - uncommitted
  stash@{2}: P1 changes on main - uncommitted
```

### Recent Main Branch Commits (for context):
```
07061a4 Fix SEO URLs: use www.interviewanswers.ai to match Vercel redirect
a6be784 SEO: Add JSON-LD structured data, per-route meta tags, keyword-optimized H1s
38b7e35 Landing page redesign: teal unification, rebrand, copy & SEO overhaul
9ecbba3 Complete teal color unification for all remaining internal views
be63dc5 Phase 3 Unit 3: Wire nursing dashboard to real IRS and streak data
ec92c80 IRS v1.1: Add Answer Preparedness as 4th component
b60348e Phase 3 Unit 2: Add IRS hero card to home screen
cfe857a Phase 3 Unit 1: Add streak counter with Supabase persistence
```

---

## VERCEL ENVIRONMENT
- Production URL: www.interviewanswers.ai
- Last deploy: ~12 hours ago (from feature/nursing-track, uncommitted changes)
- Auto-deploys from main branch are configured
- IMPORTANT: Current production is deployed from feature/nursing-track uncommitted state, NOT from main

## SUPABASE
- Edge Functions deployed: ai-feedback (v29), create-checkout-session (v14), stripe-webhook (v14), generate-question (v14), create-portal-session (v9), check-usage (v4)
- All migrations applied through 20260217000002

---

*This handoff was generated from a live session with full file access. All file paths, commit hashes, and deployment states are verified.*
