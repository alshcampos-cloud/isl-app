# Session State — Last Updated: March 5, 2026 (early morning session)

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
- `docs/IOS_DEPLOYMENT_GUIDE.md` — **NEW (Feb 28)** — Complete iOS build/submit guide for both apps
- `docs/APP_STORE_METADATA.md` — **NEW (Feb 28)** — App Store descriptions, keywords, review notes for both apps
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

## CURRENT PRIORITIES (as of March 5, 2026)

### 1. COMPLETED — NurseAnswerPro (iOS) Apple Rejection Response ✅

**Status:** All 4 rejection issues addressed. Code deployed to production. Reply sent to Apple via Resolution Center. Awaiting re-review.

**Apple rejection (March 5, 2026 at 1:37 AM):** NurseAnswerPro iOS v1.0 rejected on 4 guidelines:
- Guideline 2.1(a) — App unresponsive after login on iPad Air 11-inch (M3)
- Guideline 1.4.1 — Medical citations missing for health-related content
- Guideline 2.1(b) — IAP products not submitted (app uses external Stripe)
- Guidelines 5.1.1(i) & 5.1.2(i) — AI data sharing disclosure with third-party (Anthropic)

**All fixes deployed and reply sent (March 5, 2026 at 3:36 AM):**
- [x] Loading spinner added to NursingTrackApp.jsx (prevents blank screen while userData loads)
- [x] Medical disclaimer "Not a Clinical Tool" added to FirstTimeConsent.jsx consent flow
- [x] "Clinical Frameworks Referenced" section added to NursingResources.jsx (5 frameworks with clickable source links)
- [x] Framework citations in NursingPracticeMode.jsx now tappable links to original sources
- [x] Non-affiliation disclaimer for NCSBN, ANA, IHI, AHA added
- [x] Prominent "Third-Party AI Data Disclosure" callout added to consent flow (names Anthropic's Claude AI)
- [x] IAP addressed via reply citing Guidelines 3.1.1(a) and 3.1.3 (external Stripe permitted on US storefront)
- [x] Test account (appreviewer@interviewanswers.ai) accepted_terms reset to FALSE so Apple sees consent flow
- [x] Code committed, pushed, deployed to Vercel production
- [x] Reply sent via App Store Connect Resolution Center

**App Store Connect details (NurseAnswerPro):**
- App ID: 6759942609
- Submission ID: 99378311-86b1-4ee0-8d34-f6bf712edbac
- Review date: March 05, 2026
- Review Device: iPad Air 11-inch (M3)
- Test account: appreviewer@interviewanswers.ai / AppleTester1!
- Test account user_id: 97ee699f-77da-48aa-9604-f7eabc9415b2

### 2. PENDING — General App (InterviewAnswers) iOS Resubmission

**Status:** Code complete. Screenshots ready. Logo being redesigned. Need to rebuild iOS binary, upload screenshots, and resubmit.
**Apple rejection (Feb 15):** Guidelines 5.1.1(i) and 5.1.2(i) — privacy says "OpenAI" but app uses Anthropic.
**All code fixes VERIFIED DONE.**

**Remaining steps:**
- [ ] Replace app icon with new logo
- [ ] Replace splash screen
- [ ] Rebuild iOS binary (./scripts/build-ios.sh general)
- [ ] Upload screenshots to App Store Connect
- [ ] Update App Privacy declarations
- [ ] Reply to Apple review thread
- [ ] Archive in Xcode and resubmit

**App Store Connect details (InterviewAnswers):**
- App ID: 6758879187
- Submission with "Unresolved Issues": b9b333d9-6379-4683-a579-c210cbe525e9

### 3. ACTIVE — Google Ads Campaign Running
**Status:** Campaign re-enabled Feb 22, $10/day budget, live.

### 4. ACTIVE — Google OAuth Sign-In (planned, not yet implemented)
**Status:** Plan approved. Addresses 89% onboarding bounce. Google Cloud Console + Supabase setup needed before code.

### 5. ACTIVE — Google Search Console "Page with redirect" Indexing Issue
**Status:** Google validated fix attempt and FAILED — some pages still affected.

---

## RECENTLY COMPLETED (March 5, 2026 — Early Morning Session)

### Apple App Store Rejection Response — NurseAnswerPro ✅
**Commit:** c92d341 — fix: Apple App Store rejection — add loading screen, medical disclaimers, AI disclosure, citations

Files modified (4 key files, 15 total):
1. **NursingTrackApp.jsx** — Added loading screen when `userData.loading === true` (+46 lines)
2. **FirstTimeConsent.jsx** — Added AI data disclosure + medical disclaimer to consent flow (+24 lines)
3. **NursingPracticeMode.jsx** — Made framework citations tappable links with source URLs (+21 lines)
4. **NursingResources.jsx** — Added "Clinical Frameworks Referenced" section + non-affiliation disclaimer (+45 lines)

Infrastructure changes:
- Supabase: Reset appreviewer accepted_terms to FALSE (so Apple sees consent flow)
- Vercel: Deployed to production (commit c92d341)
- App Store Connect: Reply sent via Resolution Center addressing all 4 guidelines

### Google OAuth Plan Created ✅
- Plan file at .claude/plans/velvety-dazzling-kite.md
- Addresses 89% onboarding bounce at sign-up screen
- Requires manual Google Cloud Console + Supabase dashboard setup before code

### Favicon Rebrand ✅
- Updated favicon from blue ISL to teal IA
- Google OAuth button component created (GoogleSignInButton.jsx)
- Native app guard added to ProtectedRoute.jsx

---

## PREVIOUSLY COMPLETED (Feb 28, 2026 — Evening Session)

### Additional Fixes Found During Simulator Testing ✅
- **SpecialtySelection.jsx:** Track switcher gated with showGeneralFeatures() (was showing dead "General" link)
- **SpecialtySelection.jsx:** Sign-out redirect fixed (/ → /login to avoid loop in nursing build)
- **NursingDashboard.jsx:** Track switcher gated — shows "🩺 NurseInterviewPro" label instead of General/Nursing toggle
- **NursingDashboard.jsx:** Added Privacy Policy + Terms of Service links to account dropdown menu
- **NursingDashboard.jsx:** Sign-out redirect fixed (/ → /login)
- **Auth.jsx:** Terms/Privacy links changed from external https://interviewanswers.ai/... to relative /terms and /privacy (stays in-app on iOS)
- **TermsPage.jsx:** Complete rewrite — now mentions Anthropic, recording consent, liability cap, arbitration, CCPA (18 sections, matches App.jsx version)
- **PrivacyPage.jsx:** Updated to match App.jsx version — added Microphone Access, Recording Consent, CCPA, Data Retention sections
- **PrivacyPage.jsx + TermsPage.jsx:** "Back to Home" links replaced with navigate(-1) (browser back) to avoid / redirect loop
- **capacitor.config.nursing.json:** hostname changed from nurseinterviewpro.ai → interviewanswers.ai (don't own that domain yet)

### Decisions Made This Session
- App name confirmed: **NurseInterviewPro** (not taken on App Store)
- Domain: Using interviewanswers.ai for now (not buying nurseinterviewpro.ai yet)
- Distribution: **TestFlight** for both apps simultaneously before App Store submission
- Bundle ID stays: ai.nurseinterviewpro.app

### Apple Rejection Fixes — CODE COMPLETE ✅
- Replaced ALL "OpenAI" with "Anthropic (Claude API)" in:
  - PrivacyPage.jsx (full rewrite of Third-Party Services + new Section 5)
  - FirstTimeConsent.jsx (summary tab, privacy tab, consent footer)
  - ConsentDialog.jsx (description, info box — native-aware variant)
  - App.jsx settings view (Third-Party Services + new AI Data Processing subsection)
- Created PrivacyInfo.xcprivacy (NSPrivacyTracking: false, 4 data types declared)
- Updated Info.plist mic/speech descriptions to mention Anthropic + on-device processing

### IAP → External Stripe Payment — DONE ✅
- Uninstalled cordova-plugin-purchase (npm + native iOS cleanup)
- Removed IAP initialization from main.jsx
- Changed getPaymentProvider() to always return 'stripe'
- Updated PricingPage to always use StripeCheckout
- Removed InAppPurchase from config.xml
- Legal basis: May 2025 Epic v. Apple court ruling (zero Apple commission)

### Two-App Architecture — DONE ✅
- Created src/utils/appTarget.js (VITE_APP_TARGET env var, build-time gating)
- Gated nursing features in general build:
  - App.jsx: Routes, track switcher, ArchetypeCTA, lazy imports
  - LandingNavbar.jsx: Desktop + mobile nursing links
  - STARMethodGuidePage.jsx: Footer nursing link
  - BehavioralInterviewQuestionsPage.jsx: Footer nursing link
- Gated general features in nursing build:
  - App.jsx: "/" → /nursing, "/app" → /nursing
  - NursingTrackApp.jsx: "Back to App" button → null
  - NursingDashboard.jsx: "Account Settings" link → hidden
- Created capacitor.config.nursing.json (ai.nurseinterviewpro.app)
- Created scripts/build-ios.sh (build any target with one command)
- All 3 builds verified: general, nursing, web ✅

### Hallucination Hardening (Final 3 Gaps) — DONE ✅
- NursingAICoach: Persistent clinical question escalation
- NursingMockInterview: Trivial input handling for closing phase
- NursingOfferCoach: Trivial input handling + full audit confirmed

### Teal Rebrand in iOS — DONE ✅
- capacitor.config.json: All background colors #1e1b4b → #0f766e

---

## GIT STATE

```
Branch: feature/nursing-track
Last commit: c92d341 — fix: Apple App Store rejection (pushed to origin Mar 5)
Main branch HEAD: 6a28236
Production deployed from: feature/nursing-track commit c92d341 (Mar 5 deploy via npx vercel --prod)
Working tree: Clean (no uncommitted changes)
```

---

## WHAT'S LIVE ON PRODUCTION (www.interviewanswers.ai)

**Production deployed from:** `feature/nursing-track` commit c92d341 via `npx vercel --prod` (March 5, 2026)

### Vercel
- Production URL: www.interviewanswers.ai
- Last deploy: March 5, 2026 — includes Apple rejection fixes (loading screen, medical disclaimers, AI disclosure, citations)
- Google OAuth, favicon rebrand, native app guard also included

### Supabase Edge Functions (all deployed):
- `ai-feedback` (v29) — nursing-coach mode, server-side credit validation, server-side onboarding prompts, pass-based pricing
- `create-checkout-session` (v14) — supports general 30-day pass ($14.99) and nursing 30-day pass ($19.99)
- `stripe-webhook` (v14) — handles pass expiry columns, both subscription and pass checkout types
- `generate-question` (v14) — question generation from job descriptions
- `create-portal-session` (v9) — Stripe customer portal
- `check-usage` (v4) — usage tracking

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
### iOS Two-App Architecture (Feb 28) ✅
### Apple Rejection Privacy Fixes (Feb 28) ✅
### IAP → External Stripe Payment (Feb 28) ✅
### Hallucination Hardening Final Gaps (Feb 28) ✅
### Google OAuth Button + Favicon Rebrand + Native App Guard (Mar 3) ✅
### NurseAnswerPro Apple Rejection Fixes (Mar 5) ✅

---

## KEY ROUTES

| Route | Component | Purpose |
|-------|-----------|---------|
| `/` | LandingPage | General landing + marketing (web) / redirects to /app or /nursing (iOS) |
| `/nurse` | NursingLandingPage | Nursing marketing page (web) / redirects to /nursing (nursing iOS) |
| `/onboarding` | ArchetypeOnboarding | Value-first onboarding (5-6 screens) |
| `/onboarding?from=nursing` | ArchetypeOnboarding | Nursing-specific onboarding flow |
| `/login` | AuthPage | Login |
| `/login?from=nursing` | AuthPage | Login with nursing redirect |
| `/signup` | AuthPage | Signup |
| `/auth/confirm` | AuthConfirm | Email confirmation token verification |
| `/app` | App.jsx (monolith) | General track dashboard (web+general iOS) / redirects to /nursing (nursing iOS) |
| `/nursing` | NursingTrackApp | Nursing track (web+nursing iOS) / redirects to /app (general iOS) |
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

---

## NEW FILES CREATED (Feb 28)

| File | Purpose |
|------|---------|
| `src/utils/appTarget.js` | Build-time feature gating (VITE_APP_TARGET) |
| `capacitor.config.nursing.json` | Capacitor config for NurseInterviewPro app |
| `scripts/build-ios.sh` | One-command build script for any target |
| `ios/App/App/PrivacyInfo.xcprivacy` | Apple privacy manifest |
| `docs/APP_STORE_METADATA.md` | App Store descriptions for both apps |
| `docs/IOS_DEPLOYMENT_GUIDE.md` | Complete iOS build/submit guide |

## FILES MODIFIED (Feb 28) — Summary

| File | Change |
|------|--------|
| `src/App.jsx` | +import appTarget, route gating, track switcher conditional, privacy text OpenAI→Anthropic |
| `src/Components/ConsentDialog.jsx` | Native-aware consent text, Anthropic disclosure |
| `src/Components/FirstTimeConsent.jsx` | OpenAI→Anthropic, AI coaching disclosure |
| `src/Components/Landing/PrivacyPage.jsx` | Full Anthropic section, OpenAI removed |
| `src/Components/Landing/LandingNavbar.jsx` | Nursing links gated by showNursingFeatures() |
| `src/Components/Landing/STARMethodGuidePage.jsx` | Footer nursing link gated |
| `src/Components/Landing/BehavioralInterviewQuestionsPage.jsx` | Footer nursing link gated |
| `src/Components/NursingTrack/NursingTrackApp.jsx` | handleBackToApp conditional, appTarget import |
| `src/Components/NursingTrack/NursingDashboard.jsx` | Account Settings gated, track switcher gated, Privacy/Terms links added, sign-out → /login |
| `src/Components/NursingTrack/SpecialtySelection.jsx` | Track switcher gated, sign-out → /login |
| `src/Components/Landing/TermsPage.jsx` | Complete rewrite (18 sections, Anthropic, navigate(-1) back) |
| `src/Auth.jsx` | Terms/Privacy links: external URLs → relative /terms and /privacy |
| `src/Components/NursingTrack/NursingAICoach.jsx` | Persistent clinical redirect prompt |
| `src/Components/NursingTrack/NursingMockInterview.jsx` | Trivial input handling prompt |
| `src/Components/NursingTrack/NursingOfferCoach.jsx` | Trivial input handling prompt |
| `src/Components/PricingPage.jsx` | Removed NativeCheckout, Stripe-only |
| `src/main.jsx` | Removed IAP initialization |
| `src/utils/platform.js` | getPaymentProvider() always returns 'stripe' |
| `capacitor.config.json` | Teal colors (#0f766e) |
| `ios/App/App/Info.plist` | Mic descriptions mention Anthropic |
| `ios/App/App/config.xml` | Removed InAppPurchase feature |
| `package.json` | Removed cordova-plugin-purchase |

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
- Route gating logic (appTarget.js — just built Feb 28, verified across 3 build targets)

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

---

## WHAT'S NEXT (Priority Order)

1. **Wait for Apple re-review** of NurseAnswerPro (reply sent, code deployed, test account reset)
2. **Implement Google OAuth** — Plan approved, need Google Cloud Console + Supabase setup first
3. **General app (InterviewAnswers) iOS resubmission** — icon, screenshots, reply to Apple
4. **Fix Google Search Console redirect issue**
5. **Merge feature/nursing-track → main** (60+ commits ahead)
6. **Email deliverability** — SPF/DKIM/DMARC for confirmation emails
7. **Mobile responsiveness audit** — no real device testing done

## KEY DECISIONS MADE
- Pricing is PASS-BASED, not subscription. Nursing $19.99, General $14.99. No Pro tier.
- Two-app architecture: Same codebase → VITE_APP_TARGET env var → separate builds
- External Stripe checkout for iOS (no Apple IAP, no 30% commission)
- Legal basis: Epic v. Apple May 2025 court ruling
- Nursing app = separate App Store listing (NurseInterviewPro, ai.nurseinterviewpro.app)
- General app = existing listing (InterviewAnswers, ai.interviewanswers.app)

---

*This file is the single source of truth for session continuity. Update at the END of every session.*
