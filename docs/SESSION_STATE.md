# Session State — Last Updated: February 26, 2026

---

## NEW SESSION STARTUP — READ THESE BEFORE WRITING ANY CODE

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
- `docs/erin-question-drafts-v2.md` — ~68 questions (ALL APPROVED by Erin 2/12/26)
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

## CURRENT PRIORITIES (as of Feb 23, 2026)

### 1. ACTIVE — Google Search Console "Page with redirect" Indexing Issue
**Status:** Google validated fix attempt and FAILED — some pages still affected.
**Error:** "Page with redirect" — Google is finding URLs that redirect and refusing to index them.
**Likely causes:**
- `interviewanswers.ai` → `www.interviewanswers.ai` redirects (Vercel config)
- Possibly the new `/auth/confirm` route we just added
- Need to check which specific URLs are flagged in Search Console
**Action:** Open Search Console, identify affected URLs, fix redirect chain issues.

### 2. ACTIVE — Google Ads Campaign Running
**Status:** Campaign re-enabled Feb 22, $10/day budget, live.
**Stats (as of Feb 22):** 170 impressions, $31.60 spent, 0 conversions, $2.43 avg CPC.
**Conversion tracking:** Correctly wired — trackSignUp() fires after successful supabase.auth.signUp(). Has never fired because no one has completed signup yet.
**Fixes deployed before re-enabling:**
- Email deliverability fixed (AuthConfirm.jsx + Supabase template change)
- Manually confirmed stuck user (that1girldora@gmail.com)
- Onboarding funnel audit completed (CTA visibility issue identified but not yet fixed)

### 3. ACTIVE — Organic Social Media Video Content
**Plan:** App demo videos with AI voiceover, posted to TikTok + Instagram Reels + Facebook Reels + YouTube Shorts.
**First video:** "Practice Mode → AI Feedback" targeting new grad nurses.
**Production stack:** CapCut (free, editing + captions) + ElevenLabs (free tier, natural AI voiceover) + iPhone screen recording.
**Script written:** 30-45 second hook-based video with shot list.
**Status:** Need to record screen recordings of app, then edit in CapCut.

### 4. ACTIVE — University Outreach Emails
**USF:** Joint email from Erin Spink + Lucas Campos sent to Stacey Kohut (sekohut1@usfca.edu), Director of Undergraduate Student Services, School of Nursing. **No response yet (12 hours in).**
**Hopkins:** Target identified — Laura Arthur, Director of Career Lab (nursing-specific career services for 1,100+ students). Find email via LinkedIn or try larthur@jhu.edu. CC Jennifer Dotzenrod (jdotzen1@jhu.edu), Associate Dean for Enrollment Management & Student Services.
**USC:** Lucas solo email to career center (not yet sent).
**Positioning:** B2C resource recommendation to students, NOT B2B sales to schools. Aligned with Erin's constraints.

---

## RECENTLY COMPLETED (Feb 22-23, 2026)

### Email Deliverability Fix — DEPLOYED ✅
**Problem:** Confirmation emails from support@interviewanswers.ai contained links to tzrlpwtkrtvjpdhcaayu.supabase.co — domain mismatch triggered Gmail spam filters.
**Fix:**
1. Created `src/Components/AuthConfirm.jsx` (NEW FILE) — handles `/auth/confirm?token_hash=xxx&type=signup` via `supabase.auth.verifyOtp()`
2. Added 2 lines to `src/App.jsx`:
   - Lazy import: `const AuthConfirm = lazy(() => import('./Components/AuthConfirm'));`
   - Route: `<Route path="/auth/confirm" element={<AuthConfirm />} />`
3. Updated Supabase email template: Changed from `{{ .ConfirmationURL }}` to `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=signup`
4. Built and deployed to Vercel production
5. Tested: `/auth/confirm?token_hash=test&type=signup` correctly shows error for invalid token

### User Recovery — that1girldora@gmail.com ✅
- Manually confirmed via SQL: `UPDATE auth.users SET email_confirmed_at = now() WHERE email = 'that1girldora@gmail.com'`
- Verified: email_confirmed_at = 2026-02-22 21:07:03.321885+00

### Google Ads Re-enabled ✅
- Campaign #1 unpaused, $10/day, live as of Feb 22

### Onboarding Funnel Audit — COMPLETED (not yet fixed) ✅
**Finding:** 50% dropout between feedback_received and IRS screen.
**Root cause:** "See your Interview Readiness Score" button only appears AFTER feedback loads (3-5 second API wait + 0.4s animation), no auto-scroll, button may be off-screen on mobile.
**Fix needed:** Sticky CTA button, auto-scroll to button after feedback, pulse animation. Files: `OnboardingPractice.jsx` line 175 (conditional render), line 211 (button).
**Status:** Identified but NOT implemented yet.

### Pricing Correction ✅
**IMPORTANT:** There is NO "$29.99 Pro tier" anymore. Correct pricing:
- **Nursing 30-Day Pass:** $19.99
- **General 30-Day Pass:** $14.99
- Pass-based credit system, not monthly subscription

---

## GIT STATE

```
Branch: feature/nursing-track
Last commit: 0a973df (pushed to origin Feb 22, 58 commits ahead of main)
Main branch HEAD: 6a28236 (fix: prevent inflated scores for trivial onboarding answers)
origin/main: IN SYNC with local main

Production deployed from: feature/nursing-track via `npx vercel --prod` (redeployed Feb 22 with all env vars + AuthConfirm fix)
```

---

## WHAT'S LIVE ON PRODUCTION (www.interviewanswers.ai)

**IMPORTANT:** Production is currently deployed from `feature/nursing-track` via `npx vercel --prod`, NOT from main branch auto-deploy.

### Vercel
- Production URL: www.interviewanswers.ai
- Last deploy: Feb 22 — includes AuthConfirm.jsx, email deliverability fix, all prior nursing track work

### Supabase Edge Functions (all deployed):
- `ai-feedback` (v29) — nursing-coach mode, server-side credit validation, server-side onboarding prompts, pass-based pricing
- `create-checkout-session` (v14) — supports general 30-day pass ($14.99) and nursing 30-day pass ($19.99)
- `stripe-webhook` (v14) — handles pass expiry columns, both subscription and pass checkout types
- `generate-question` (v14) — question generation from job descriptions
- `create-portal-session` (v9) — Stripe customer portal
- `check-usage` (v4) — usage tracking

### Supabase Email Template:
- **CHANGED Feb 22:** Confirmation email now uses `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=signup` instead of `{{ .ConfirmationURL }}`
- This routes confirmation through our domain (interviewanswers.ai) instead of supabase.co

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
| question-generator | Sonnet 4 | $$$ Expensive | generate-question/ | **Potential downgrade to Haiku 4.5** |
| confidence-brief | Sonnet 4 | $$$ Expensive | ai-feedback/ | **Potential downgrade to Haiku 4.5** |

---

## SHIPPED FEATURES

### Phase 1: Self-Efficacy Feedback Redesign ✅
### Phase 2: Onboarding + Funnel ✅
### Phase 3: IRS + Streaks ✅
### P1 Conversion Optimization ✅
### P2 Pass Pricing ✅
### Answer/Feedback Persistence ✅
### Email Confirmation Routing Fix ✅
### Landing Page ✅
### SEO Optimization ✅
### Google Search Console ✅ (but redirect issue now flagged)
### LinkedIn Launch ✅
### Nursing Track (all features) ✅
### "My Best Answer" Populate ✅
### Email Deliverability Fix (Feb 22) ✅
### Google Ads Conversion Tracking ✅
### Mock Interview Phase-Based Question Selection (Feb 26) ✅
### Mock Interview Per-Session Credit Model (Feb 26) ✅
### Mock Interview "Any Questions for Me?" Closing (Feb 26) ✅
### Mock Interview Continue Option + Exit Popup (Feb 26) ✅
### Mock Interview AI Session Debrief (Feb 26) ✅
### AI Coach Unlimited for Pass Holders (Feb 26) ✅
### Nursing Tutorial 7-Step Rewrite (Feb 26) ✅

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
| `/signup` | AuthPage | Signup |
| `/auth/confirm` | AuthConfirm | **NEW (Feb 22)** Email confirmation token verification |
| `/app` | App.jsx (monolith) | General track dashboard |
| `/nursing` | NursingTrackApp | Nursing track (protected) |
| `/behavioral-interview-questions` | SEO page | |
| `/nursing-interview-questions` | SEO page | |
| `/star-method-guide` | SEO page | |
| `/terms` | TermsPage | |
| `/privacy` | PrivacyPage | |

## PRICING MODEL

| Product | Price | Type |
|---------|-------|------|
| General 30-Day Pass | $14.99 | One-time |
| Nursing 30-Day Pass | $19.99 | One-time (Stripe Price ID: price_1Sxe9LJtT6sejUOK1JKSxVqA) |

**NOTE:** There is NO monthly Pro subscription anymore. It's pass-based.

## CREDIT SYSTEM (Nursing Track)

| Feature | Free | Pass | Charging Model |
|---------|------|------|----------------|
| Quick Practice | 3/mo | Unlimited | Per-question (each question = 1 credit) |
| Mock Interview | 2/mo | Unlimited | Per-session (7-question interview = 1 credit, Continue = +1 credit) |
| SBAR Drill | 2/mo | Unlimited | Per-question |
| AI Coach | 0 (Pass only) | Unlimited | Per-message |
| Offer Coach | 0 (Pass only) | Unlimited | Per-session |
| Confidence Builder | 0 (Pass only) | Unlimited | Per-session |
| Flashcards | Unlimited | Unlimited | Free (no credits) |

**Mock Interview credit details (updated Feb 26):**
- 1 credit charged on FIRST answer (not on session open)
- Exit without answering = 0 credits charged (free users see reassuring popup)
- "Continue with More Questions" after initial 7 = costs 1 additional credit for free tier
- Session debrief on summary screen does NOT cost a credit (part of session they already paid for)

---

## UNDEPLOYED CHANGES (as of Feb 26)

**These changes are built and build-verified on `feature/nursing-track` but NOT yet deployed:**

| File | Change | Sessions Ago |
|------|--------|-------------|
| `NursingMockInterview.jsx` | Phase-based questions, per-session credits, candidate Qs, continue, exit popup | Feb 26 |
| `NursingSessionSummary.jsx` | AI session debrief | Feb 26 |
| `creditSystem.js` | nursing_mock: 1→2, nursing_coach: 999999 | Feb 26 |
| `NursingTutorial.jsx` | 7-step rewrite | Feb 25 |
| `NursingAICoach.jsx` | Credit bug fix (was blocking coach) | Feb 25 |
| `NursingTrackApp.jsx` | Removed first_name/last_name + added triggerStreakRefresh to OfferCoach | Feb 25-26 |
| `NursingResources.jsx` | Scroll-to-top fix | Feb 25 |
| `NursingDashboard.jsx` | Reordered sections | Feb 25 |
| `ai-feedback/index.ts` | Removed 20-session AI Coach cap | Feb 25 |

**To deploy:** `supabase functions deploy ai-feedback` THEN `npm run build && npx vercel --prod`

---

## KNOWN BUGS / ACTIVE ISSUES

1. **Google Search Console "Page with redirect"** — Validation failed. Some pages still affected. NEEDS INVESTIGATION.
2. **Onboarding CTA button visibility** — 50% dropout. Button hidden until feedback loads, no auto-scroll. IDENTIFIED, NOT FIXED.
3. **Mobile responsiveness NOT tested** — No real device testing done.
4. **Tutorial race condition** — hasAcceptedFirstTimeTerms never initialized from DB (pre-existing).
5. **Nursing purchase tracking** — App.jsx hardcodes $14.99 for trackPurchase, should be $19.99 for nursing. DON'T touch App.jsx per Battle Scar #1.

## THINGS NOT TO TOUCH (recently fixed, fragile):
- Email confirmation flow (AuthConfirm.jsx + Supabase template — just deployed Feb 22)
- Credit system (triple protection: UI + guard function + server-side)
- Speech recognition lifecycle (months of iOS Safari fixes)
- Anonymous auth flow in onboarding
- Onboarding scoring (belt-and-suspenders client + server-side)

---

## GOOGLE ADS DETAILS

- **Account:** 867-867-9900
- **Conversion ID:** AW-17966963623
- **Conversion Labels:**
  - Sign-up: `pjnhCIauovwbEKe3qPdC`
  - Purchase: `vZMFCOGGpfwbEKe3qPdC`
  - Begin Practice: `b1ZICJ_C0PwbEKe3qPdC`
  - Pricing Page View: `6KM0CJzC0PwbEKe3qPdC`
- **Budget:** $10/day
- **Status (Feb 23):** LIVE. Campaign re-enabled Feb 22 after funnel fixes deployed.

## UNIVERSITY OUTREACH

| School | Contact | Email | Status |
|--------|---------|-------|--------|
| USF | Stacey Kohut (Dir. Undergrad Student Services, Nursing) | sekohut1@usfca.edu | Sent, no response (12 hrs) |
| Hopkins | Laura Arthur (Dir. Career Lab, Nursing) | LinkedIn / larthur@jhu.edu (try) | Email drafted, not sent yet |
| Hopkins CC | Jennifer Dotzenrod (Assoc Dean, Enrollment & Student Services) | jdotzen1@jhu.edu | CC on Laura's email |
| USC | Career Center (Lucas solo) | Not yet identified | Not sent |

---

## WHAT'S NEXT (Priority Order)

1. **Fix Google Search Console redirect issue** — Investigate which URLs are flagged, fix redirect chains
2. **Send Hopkins email** — Laura Arthur via LinkedIn or email
3. **Record app screen recordings** for video content (iPhone)
4. **Create first TikTok/Reels video** — Practice Mode → AI Feedback, targeting new grads
5. **Fix onboarding CTA visibility** — Auto-scroll, sticky button, pulse animation
6. **Merge feature/nursing-track → main** — 58 files different, origin now in sync
7. **Mobile responsiveness audit** — Zero real device testing done
8. **Check Apple** — User mentioned "we haven't checked Apple in quite some time"

## KEY DECISIONS MADE
- Pricing is PASS-BASED, not subscription. Nursing $19.99, General $14.99. No Pro tier.
- University outreach positioned as B2C resource recommendation, NOT B2B sales
- Organic social media (TikTok/Reels/Shorts) before paid TikTok ads ($50/day minimum too expensive)
- Video production: CapCut (free editing) + ElevenLabs (free AI voiceover) + iPhone screen recording
- Email deliverability fixed via PKCE token_hash flow through own domain (not supabase.co redirects)
- Erin's correct credentials: Erin Spink, MPH, BSN, RN, CIC
- Lucas's credentials: Lucas Campos, MSEM, BAP
- Lucas works in Patient Experience at Stanford Health Care
- Erin works in Infection Prevention at Stanford Health Care

## CONTENT SOURCES (for nursing track)
The nursing track was built using published competency standards:
- **Licensing:** NCSBN Clinical Judgment Measurement Model, NCLEX-RN Test Plan, Nurse Licensure Compact
- **Certification bodies:** BCEN (CEN), AACN (CCRN), AORN/CCI (CNOR), NCC (RNC-OB), PNCB (CPN), ANCC (PMH-BC, MEDSURG-BC), MSNCB (CMSRN)
- **Professional associations:** ANA, ENA, AWHONN, APNA, AMSN, SPN, NATHO, AORN
- **Regulatory:** Joint Commission (NPSG), AHRQ (TeamSTEPPS), CDC, CMS (SEP-1), IHI (SBAR), APIC
- **Clinical frameworks:** SBAR, NCSBN CJM, Nursing Process (ADPIE), Maslow's, ABC, NICHD 3-Tier, CUS
- All 68 questions reviewed and approved by Erin (2/12/26): 64 approved, 3 rewritten, 0 rejected

## TEST ACCOUNT
- Email: alshcampos@gmail.com
- Password: must be entered by the user (security boundary)
- Beta tester account — unlimited access

---

*This file is the single source of truth for session continuity. Update at the END of every session.*
