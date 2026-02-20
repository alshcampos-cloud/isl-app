# Session State — Last Updated: February 20, 2026 (Morning)

---

## ⚠️ NEW SESSION STARTUP — READ THESE BEFORE WRITING ANY CODE

### Required Reading (in order):
1. `CLAUDE.md` — Master operating instructions (auto-loaded). Project context, tech stack, walled garden model, Erin's constraints, product decisions, D.R.A.F.T. + V.S.A.F.E.R.-M protocols, 20 battle scars, pattern reference.
2. `docs/SESSION_STATE.md` — This file. Current status and next steps.
3. `docs/BATTLE_SCARS.md` — 20+ hard-won engineering lessons. Read before coding.
4. `docs/PROTOCOLS.md` — Full protocol details: D.R.A.F.T. (feature exploration), V.S.A.F.E.R.-M (bug fixes), C.O.A.C.H. (AI conversation design for nursing mock interviewer).
5. `docs/NURSING_TRACK_INSTRUCTIONS.md` — Nursing track operating manual + C.O.A.C.H. protocol.
6. `docs/SMOKE_TEST_PROTOCOL.md` — Pre-deploy testing. All 7 critical paths must pass before any `git push` to main.
7. `docs/AI_QUALITY_CRITERIA.md` — Interview quality research (545 lines, 8 sections). Informs AI quality testing work.

### Also available (read as needed):
- `docs/PRODUCT_ARCHITECTURE.md` — App structure
- `docs/REPO_MAP.md` — File locations
- `docs/HANDOFF_PROMPT.md` — Detailed handoff from Feb 18 session (commit details, file lists, architecture reference)
- `docs/SESSION_HANDOFF_GUIDE.md` — How session handoffs work
- `docs/PHASE2_AUDIT_REPORT.md` — Full production audit and scoring
- `docs/GOOGLE_ADS_PLAYBOOK.md` — Google Ads campaign setup guide
- `docs/LINKEDIN_LAUNCH_KIT.md` — Launch post, headline, about section, team structure
- `docs/NURSING_TRACK_REMAINING_WORK.md` — Engineering-to-clinical handoff archive
- `docs/erin-question-drafts-v2.md` — ~68 questions for Erin's clinical review
- `docs/ERIN_REVIEW_FORM.md` — Formatted review form with all 68 questions
- `docs/erin-testing-guide.md` — Step-by-step testing guide + MI questions
- `docs/qa-checklist-nursing-track.md` — Pre-merge QA checklist (60+ items)
- `docs/research/Master_Strategy_v2.docx` — 50-page strategy document

### Three Protocols:
1. **D.R.A.F.T.** — Feature exploration. Branch, restrict to new files, align with Erin, experiment, track for merge.
2. **V.S.A.F.E.R.-M** — Production bug fixes. Verify baseline, scope-lock, additive only, function-preserving, exact-line accounting, regression-aware, merge-gated.
3. **C.O.A.C.H.** — AI conversation design. Context set, only curated questions, assess communication (not clinical), coach with layers, handle boundaries.

### Hard Stop Rule:
If you need to change shared utilities, global config, routing architecture, app-wide state, auth, or billing → **STOP AND ASK FIRST.**

---

## IMMEDIATE NEXT STEPS

### 1. "My Best Answer" Populate Feature — JUST SHIPPED (Feb 20)
**Commit:** `8ae02fa` on `feature/nursing-track`

**What shipped:**
- **Path 1A:** "Save as Best Answer" button in Practice Mode feedback area — ✅ BROWSER TESTED, PASSING
- **Path 1B:** Per-question "Save as Best Answer" in Mock Interview session summary — ✅ BROWSER TESTED, PASSING
- **Path 2A:** New `NursingAnswerAssistant.jsx` (804 lines) — MI-guided answer crafting with C.O.A.C.H. protocol, walled garden enforcement, Anthropic overloaded_error detection
- **Path 2B:** "Craft with AI Coach" button wired into Command Center Question Bank

**Browser test results (Feb 20):**
- Path 1A: Practice → feedback → "Save as Best Answer" → gold button → green checkmark → IRS updates (32→35) → verified in Command Center Question Bank ✅
- Path 1B: Mock Interview → End Session → Summary → per-question "Save as Best Answer" → green checkmark ✅
- Path 2A+2B: ✅ **FULLY TESTED AND PASSING** (Feb 20, after Anthropic outage resolved)
  - AI Coach modal opens from Question Bank "Craft with AI Coach" button ✅
  - Intro stage renders with question, Theory/Communication tags, MI explanation ✅
  - "Let's Get Started" fires `startConversation` → AI returns probing question ✅
  - 3-exchange MI conversation: AI uses affirmations, asks deepening follow-ups, draws out user experience ✅
  - Exchange counter updates correctly: "1 exchange", "2 exchanges", "3 exchanges" ✅
  - "Quick Synthesis" appears after 1 exchange, "Create Polished Answer" after 3 ✅
  - Synthesis produces 2-paragraph polished answer using ONLY user-provided facts ✅
  - **Walled garden compliance verified:** AI never generated clinical content, drug dosages, or protocols ✅
  - Self-efficacy message: "Take a deep breath. You just crafted a polished answer from your real experience — that's a real accomplishment." ✅
  - "Save as Best Answer" → answer appears immediately in Question Bank with "Refine" button ✅
  - DB verified: 3 rows in `nursing_saved_answers` (ned_1, ng_11, ned_3) — no duplicates ✅
- Upsert: DB has UNIQUE(user_id, question_code) constraint, code uses `onConflict`, 3 saved answers in DB (no duplicates) ✅
- Credit charging: Beta tester has unlimited access (beta_testers table bypasses limits). Credit flow uses existing `nursing_coach` pool via `nursingFeature: 'nursingCoach'` ✅

**Bug found & fixed during testing (earlier in session):**
- Edge Function returns HTTP 200 for Anthropic `overloaded_error`, bypassing `fetchWithRetry`. Added `data.type === 'error'` detection in all 3 AI call functions (startConversation, sendMessage, synthesizeAnswer) with user-friendly messages.

**ALL PATHS TESTED AND PASSING.** Feature is ready for merge review.

### 2. AI Quality Testing & Documentation
**Context:** User wants a structured quality audit of every AI-powered feature before running ads. Test each feature, document the AI responses, and build a data set that demonstrates quality.

**What's ready:**
- `docs/AI_QUALITY_CRITERIA.md` — Comprehensive research document covering hiring manager evaluation criteria, STAR/SBAR effectiveness, rubrics (Google re:Work, BARS, Amazon), red flags, AI feedback design, nursing-specific criteria (NCSBN Clinical Judgment Model), and synthesis.
- Erin (Chief Quality Officer) needs to review this document
- Erin will also run her own live tests

**Potential model downgrades to test:**
- Question Generator: Sonnet 4 → Haiku 4.5 (currently expensive for single-call)
- General Confidence Brief: Sonnet 4 → Haiku 4.5 (currently expensive for single-call)
- Decision: Test quality FIRST, then downgrade if quality holds

### 2. Erin's Review Queue
- `docs/AI_QUALITY_CRITERIA.md` — needs her review (especially Section 6: Nursing-Specific Criteria)
- `docs/erin-question-drafts-v2.md` — ~68 questions still pending clinical review
- `docs/ERIN_REVIEW_FORM.md` — Formatted review form
- `docs/erin-testing-guide.md` — Testing guide for her
- Live app testing — she will run her own tests

### 3. Uncommitted Changes (Current)
These files are modified or new but NOT committed on `feature/nursing-track`:

**Modified (16 files) — from previous sessions, still uncommitted:**
- `docs/SESSION_STATE.md` — This file
- `index.html` — SEO structured data
- `public/sitemap.xml` — Sitemap updates
- `src/App.jsx` — SEO page routes, ScrollToTop
- `src/Auth.jsx` — Auth changes
- `src/Components/AuthPage.jsx` — Auth page updates
- `src/Components/Landing/FAQSection.jsx` — FAQ updates
- `src/Components/Landing/FeaturesSection.jsx` — Live Prompter rewrite (Feb 19)
- `src/Components/Landing/LandingFooter.jsx` — Footer updates
- `src/Components/Landing/PricingSection.jsx` — Pricing updates
- `src/Components/Landing/PrivacyPage.jsx` — Privacy page
- `src/Components/Landing/TermsPage.jsx` — Terms page
- `src/Components/Onboarding/ArchetypeOnboarding.jsx` — Onboarding changes
- `src/Components/Onboarding/SignUpPrompt.jsx` — Signup changes
- `src/hooks/useDocumentHead.js` — SEO meta tags hook
- `src/main.jsx` — Main entry changes
- `supabase/functions/ai-feedback/index.ts` — Edge Function changes

**New/Untracked (9 files):**
- `docs/AI_QUALITY_CRITERIA.md` — Interview quality research document (NEW Feb 19)
- `docs/AI_QUALITY_TEST_RESULTS.md` — Test results document
- `docs/GOOGLE_ADS_PLAYBOOK.md` — Google Ads campaign guide
- `docs/LINKEDIN_LAUNCH_KIT.md` — LinkedIn launch materials
- `src/Components/Landing/BehavioralInterviewQuestionsPage.jsx` — SEO page
- `src/Components/Landing/NursingInterviewQuestionsPage.jsx` — SEO page
- `src/Components/Landing/STARMethodGuidePage.jsx` — SEO page
- `src/Components/ScrollToTop.jsx` — Scroll-to-top utility
- `src/utils/googleAdsTracking.js` — Google Ads conversion tracking

**Just committed (Feb 20) — `8ae02fa`:**
- `src/Components/NursingTrack/NursingAnswerAssistant.jsx` — NEW (804 lines)
- `src/Components/NursingTrack/NursingCommandCenter.jsx` — AI Coach button + modal wiring
- `src/Components/NursingTrack/NursingMockInterview.jsx` — Pass userData to SessionSummary
- `src/Components/NursingTrack/NursingPracticeMode.jsx` — Save as Best Answer button
- `src/Components/NursingTrack/NursingSessionSummary.jsx` — Per-question save buttons

---

## GIT STATE

```
Branch: feature/nursing-track
Last commit: 8ae02fa (feat: My Best Answer populate — save from practice/mock + AI Coach component)
Main branch HEAD: 07061a4 (Fix SEO URLs)

Stashes:
  stash@{0}: WIP on feature/nursing-track (Phase 9 UX polish — old)
  stash@{1}: P1 changes on main - uncommitted
  stash@{2}: P1 changes on main - uncommitted

Recent commits on feature/nursing-track:
  8ae02fa feat: My Best Answer populate — save from practice/mock + AI Coach component
  1567d28 P1 conversion optimization, P2 pass pricing, answer persistence, email routing fix
  71325b6 Merge main into feature/nursing-track
  07061a4 Fix SEO URLs: use www.interviewanswers.ai to match Vercel redirect
  a6be784 SEO: JSON-LD structured data, per-route meta tags, keyword-optimized H1s
  38b7e35 Landing page redesign: teal unification, rebrand to InterviewAnswers.ai
```

---

## WHAT'S LIVE ON PRODUCTION (www.interviewanswers.ai)

**IMPORTANT:** Production is currently deployed from `feature/nursing-track` (uncommitted state) via `npx vercel --prod`, NOT from main branch auto-deploy.

### Vercel
- Production URL: www.interviewanswers.ai
- Auto-deploys from main are configured, but current production includes feature/nursing-track work
- Last deploy includes: conversion optimization, pass pricing, SEO pages, landing page changes

### Supabase Edge Functions (all deployed):
- `ai-feedback` (v29) — nursing-coach mode, server-side credit validation, server-side onboarding prompts, pass-based pricing
- `create-checkout-session` (v14) — supports both general Pro ($29.99/mo) and nursing 30-day pass ($19.99)
- `stripe-webhook` (v14) — handles pass expiry columns, both subscription and pass checkout types
- `generate-question` (v14) — question generation from job descriptions
- `create-portal-session` (v9) — Stripe customer portal
- `check-usage` (v4) — usage tracking

### Supabase Migrations Applied:
- `20260217000002_add_session_answer_feedback.sql` — user_answer, ai_feedback TEXT columns in nursing_practice_sessions
- `20260217000001_add_pass_columns.sql` — nursing_pass_expires, general_pass_expires in user_profiles
- `20260216000002_user_streaks.sql` — User streaks table
- All earlier nursing track migrations (tables, seed data, saved answers, archetype columns)
- **Feb 19:** Dropped `nursing_questions_full` view (SECURITY DEFINER vulnerability — was unused)

### Supabase Security:
- Security Advisor: 0 errors (as of Feb 19)
- All 3 nursing tables (nursing_questions, nursing_specialties, clinical_frameworks) have RLS enabled with SELECT policies for authenticated users

---

## AI MODEL MAP (Verified Feb 19)

| Feature | Model | Cost Tier | Edge Function | Notes |
|---------|-------|-----------|---------------|-------|
| generate-bullets | Haiku 3.5 Legacy | $ Cheapest | generate-bullets/ | Simple extraction |
| practice (general) | Haiku 4.5 | $$ Medium | ai-feedback/ | Single-call scoring |
| ai-interviewer | Haiku 4.5 | $$ Medium | ai-feedback/ | Multi-turn conversation |
| answer-assistant | Haiku 4.5 | $$ Medium | ai-feedback/ | STAR formatting |
| onboarding | Haiku 4.5 | $$ Medium | ai-feedback/ | Archetype classification |
| nursingPractice | Haiku 4.5 | $$ Medium | ai-feedback/ | Single-call nursing scoring |
| nursingMock | Sonnet 4 | $$$ Expensive | ai-feedback/ | Multi-turn nursing interview |
| nursingCoach | Sonnet 4 | $$$ Expensive | ai-feedback/ | Multi-turn clinical coaching |
| question-generator | Sonnet 4 | $$$ Expensive | generate-question/ | **Potential downgrade → Haiku 4.5** |
| confidence-brief | Sonnet 4 | $$$ Expensive | ai-feedback/ | **Potential downgrade → Haiku 4.5** |

---

## SHIPPED FEATURES

### Phase 1: Self-Efficacy Feedback Redesign ✅
- Three-path feedback (main practice, AI interviewer, nursing)
- "Example Strong Answer" constrained to user's actual content
- Bandura-aligned coaching language

### Phase 2: Onboarding + Funnel ✅
- 5-screen onboarding flow (archetype → breathing → practice → IRS → signup)
- Anonymous auth routing fixed
- All landing CTAs → /onboarding; nursing CTAs → /onboarding?from=nursing
- Nursing visitors: field selection auto-skipped, nursing practice question, SBAR citation
- Funnel tracking: 25 onboarding_events recorded
- E2E signup tested on iPhone Chrome — works (email goes to spam)

### Phase 3: IRS + Streaks ✅
- IRS v1 hero card with animated ring, breakdown bars, detail modal
- IRS v1.1 — Answer Preparedness as 4th component
- Streak counter with Supabase persistence + milestone toasts
- Nursing dashboard wired to real IRS/streak data

### P1 Conversion Optimization (Feb 17-18) ✅
- Fix Pro pricing CTA bug
- Mid-page CTAs on NursingLandingPage
- Skip breathing exercise for urgent seekers
- Loss-framed signup copy with real feature list
- IRS trajectory visualization on IRSBaseline screen
- Feature Preview screen between IRS and Signup
- Clinical credibility signals for nursing onboarding
- Server-side onboarding prompts (IP protection)

### P2 Pass Pricing (Feb 17-18) ✅
- Separate pricing: GeneralPricing.jsx, NursingPricing.jsx
- creditSystem.js overhaul for pass-based access
- create-checkout-session pass mode
- stripe-webhook pass fulfillment
- Server-side credit validation (pass-aware)
- All upgrade links include `&returnTo=/nursing`

### Answer/Feedback Persistence (Feb 18) ✅
- user_answer + ai_feedback stored in nursing_practice_sessions
- Expandable details in NursingCommandCenter

### Email Confirmation Routing Fix (Feb 18) ✅
- 5-point chain fix: signUp metadata, login links, LandingPage redirect, localStorage flags

### Landing Page ✅
- Teal color unification
- ISL → InterviewAnswers.ai rebrand
- **Live Prompter section updated (Feb 19):** Rewrote to explain fuzzy logic question matching during practice (was incorrectly telling users to use during real interviews)

### SEO Optimization ✅
- JSON-LD structured data (SoftwareApplication, FAQPage, Organization)
- Per-route dynamic meta tags via useDocumentHead hook
- 3 SEO content pages (Behavioral Questions, Nursing Questions, STAR Method Guide)
- H1 optimization, canonical URLs, sitemap

### Google Search Console ✅
- Domain verified via DNS TXT
- Sitemap submitted: 6 pages discovered
- **Status Feb 19:** 3 pages indexed (/, /nurse, http redirect), 5 SEO pages still "Discovered - not indexed" (normal — 1-2 weeks)

### LinkedIn Launch ✅
- Post published with video
- `docs/LINKEDIN_LAUNCH_KIT.md` has headline, about section, experience entry, post, team structure, checklist

### Nursing Track
- Walled garden model: AI coaches communication, never generates clinical content
- 64 Erin-approved curated questions wired into AI Coach system prompt
- 7 practice modes functional
- Credit system with triple protection (UI + guard function + server-side)
- Enriched feedback: 4 sections (Feedback, STAR/SBAR Breakdown, Ideal Answer, Resources)
- **"My Best Answer" Populate (Feb 20):** Save from Practice Mode, Mock Interview summary, and AI Answer Coach. NursingAnswerAssistant component (804 lines) with MI-guided crafting, C.O.A.C.H. protocol, walled garden enforcement. Overloaded_error detection added.

---

## KEY ROUTES

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

## PRICING MODEL

| Product | Price | Type | Stripe Price ID |
|---------|-------|------|-----------------|
| General Pro | $29.99/mo | Subscription | (existing) |
| Nursing 30-Day Pass | $19.99 | One-time | price_1Sxe9LJtT6sejUOK1JKSxVqA |

## CREDIT SYSTEM (Nursing Track)

| Feature | Free | Pass |
|---------|------|------|
| Quick Practice | 3/mo | Unlimited |
| Mock Interview | 1/mo | Unlimited |
| SBAR Drill | 2/mo | Unlimited |
| AI Coach | 0 (Pro only) | 20/mo cap |
| Offer Coach | 0 (Pro only) | Unlimited |
| Confidence Builder | 0 (Pro only) | Unlimited |
| Flashcards | Unlimited | Unlimited |

---

## KNOWN BUGS / UNVERIFIED ITEMS
1. **Email goes to spam** — SPF/DKIM/DMARC not configured. Needs Resend or DNS fix.
2. **Mobile responsiveness NOT tested** — No real device testing done.
3. **Tutorial race condition** — hasAcceptedFirstTimeTerms never initialized from DB (pre-existing).
4. **Duplicate loadUserTierAndStats calls** — Runs twice on page load. Not user-facing.
5. **~68 questions pending Erin's clinical review** before merge to main.
6. **No nursing-specific tutorial** — General tutorial suppressed for nursing users, no replacement.

## THINGS NOT TO TOUCH (recently fixed, fragile):
- Email confirmation routing (5-point fix just deployed)
- Credit system (triple protection: UI + guard function + server-side)
- Speech recognition lifecycle (months of iOS Safari fixes)
- Anonymous auth flow in onboarding

---

## WHAT'S NEXT (Priority Order)
1. **AI Quality Testing** — Document AI responses across all features, evaluate against criteria
2. **Erin's Review** — AI_QUALITY_CRITERIA.md + live testing + question review
3. **Model Downgrades** — Test then potentially downgrade Question Generator + Confidence Brief
4. **Commit uncommitted changes** — 16 modified + 8 new files on feature/nursing-track
5. **Email deliverability** (SPF/DKIM/DMARC or Resend)
6. **Mobile responsiveness audit**
7. **Google Ads** — Conversion tracking infrastructure ready, GOOGLE_ADS_PLAYBOOK.md has full setup guide. Waiting on quality verification + more indexed pages.

## KEY DECISIONS MADE
- Live Prompter landing copy must emphasize PRACTICE, not real interview use ("wire those neurons")
- Dropped unused `nursing_questions_full` view for security (Feb 19)
- LinkedIn post published — monitor engagement before running ads
- AI quality criteria research completed — Erin to review before any prompt changes
- Model downgrades: test first, then decide
- No B2B to schools or hospitals (Erin rejected)
- No specialty matching feature (Erin rejected)
- Nursing is a module inside InterviewAnswers.AI, NOT a separate app

## TEST ACCOUNT
- Email: alshcampos@gmail.com
- Password: must be entered by the user (security boundary)
- Beta tester account — unlimited access

---

*This file is the single source of truth for session continuity. Update at the END of every session.*
