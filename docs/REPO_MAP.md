# REPO MAP — InterviewAnswers.AI
## Generated: February 15, 2026 | Branch: main | Commit: 9924434

---

# 1. FILE INVENTORY (src/ — sorted by line count)

## Core App Files
| File | Lines | Notes |
|------|------:|-------|
| `src/App.jsx` | 8,154 | Monolithic main component (~70 useState hooks) |
| `src/main.jsx` | 50 | React entry point |
| `src/index.css` | 125 | Global styles |
| `src/lib/supabase.js` | 9 | Supabase client singleton |
| `src/default_questions.js` | 383 | Default interview question bank |
| `src/Auth.jsx` | 292 | Sign up / sign in / password reset forms |
| `src/ProtectedRoute.jsx` | 195 | Auth guard + email verification + recovery flow |
| `src/SupabaseTest.jsx` | 39 | Dev utility — Supabase connection test |

## Backup Files (dead weight — can be cleaned up)
| File | Lines |
|------|------:|
| `src/App.jsx.backup-before-no-interference` | 7,141 |
| `src/App.jsx.backup-before-complete-flushsync` | 7,120 |
| `src/App.jsx.backup-before-flushsync` | 7,118 |
| `src/App.jsx.backup-before-dual-layer` | 7,100 |
| `src/App.jsx.backup-before-callback-fix` | 7,071 |
| `src/App.jsx.backup-before-force-render` | 7,055 |
| `src/App.jsx.backup-nested` | 7,038 |
| `src/App.jsx.backup-ultimate` | 6,993 |
| `src/App.jsx.backup` | 6,992 |
| `src/Components/UsageDashboard.jsx.backup` | 722 |
| `src/Components/UsageLimitModal.jsx.backup` | 282 |

**Total backup dead weight: ~57,632 lines**

## Nursing Track Components (src/Components/NursingTrack/)
| File | Lines | Purpose |
|------|------:|---------|
| `nursingQuestions.js` | 2,450 | Curated question content library (68 questions) |
| `NursingConfidenceBuilder.jsx` | 1,099 | Confidence-building practice mode |
| `NursingCommandCenter.jsx` | 1,037 | Session history dashboard + analytics |
| `NursingOfferCoach.jsx` | 843 | Job offer evaluation coaching |
| `NursingAICoach.jsx` | 813 | Free-form AI coaching sessions |
| `NursingMockInterview.jsx` | 739 | Full mock interview simulation |
| `NursingDashboard.jsx` | 644 | Main nursing track home screen |
| `NursingSBARDrill.jsx` | 642 | SBAR framework practice drills |
| `NursingPracticeMode.jsx` | 627 | Quick single-question practice |
| `NursingLandingPage.jsx` | 522 | Marketing landing page |
| `NursingTrackApp.jsx` | 388 | Nursing track router/shell |
| `NursingFlashcards.jsx` | 375 | Flashcard review system |
| `nursingSupabase.js` | 346 | Supabase queries for nursing tables |
| `NursingSessionSummary.jsx` | 322 | Post-session feedback display |
| `useSpeechRecognition.js` | 280 | Extracted speech recognition hook (Battle Scars #4-7) |
| `NursingResources.jsx` | 268 | External resource links |
| `nursingSessionStore.js` | 181 | In-memory session state store |
| `nursingUtils.js` | 178 | Score parsing, response validation |
| `SpecialtySelection.jsx` | 159 | Specialty picker (onboarding) |
| `useNursingQuestions.js` | 85 | Question loading hook |
| `NursingLoadingSkeleton.jsx` | 60 | Loading state placeholder |

**Total nursing track: ~11,058 lines across 21 files**

## Landing Page Components (src/Components/Landing/)
| File | Lines | Purpose |
|------|------:|---------|
| `HeroSection.jsx` | 196 | Hero banner |
| `WhyISLSection.jsx` | 172 | Value proposition |
| `PricingSection.jsx` | 148 | Pricing tiers display |
| `FeaturesSection.jsx` | 142 | Feature showcase |
| `LandingNavbar.jsx` | 136 | Nav bar |
| `PrivacyPage.jsx` | 100 | Privacy policy |
| `HowItWorksSection.jsx` | 100 | Step-by-step explainer |
| `FAQSection.jsx` | 98 | FAQ accordion |
| `ProblemSection.jsx` | 93 | Pain point messaging |
| `LandingPage.jsx` | 88 | Landing page shell (composes sections) |
| `TestimonialsSection.jsx` | 75 | Testimonials |
| `TermsPage.jsx` | 70 | Terms of service |
| `CTASection.jsx` | 53 | Call-to-action |
| `SocialProofBar.jsx` | 47 | Social proof strip |
| `LandingFooter.jsx` | 46 | Footer |

**Total landing: ~1,564 lines across 15 files**

## Streak Components (src/Components/Streaks/)
| File | Lines | Purpose |
|------|------:|---------|
| `StreakDisplay.jsx` | 191 | Self-contained streak stat card + popover (Phase 3) |
| `MilestoneToast.jsx` | 58 | Milestone celebration toast with framer-motion (Phase 3) |

## Shared Components (src/Components/)
| File | Lines | Purpose |
|------|------:|---------|
| `SpeechUnavailableWarning.jsx` | ~60 | Reusable speech unavailability warning (Phase 3) |

## Other Components (src/Components/)
| File | Lines | Purpose |
|------|------:|---------|
| `TemplateLibrary.jsx` | 899 | Answer template browser |
| `UsageDashboard.jsx` | 789 | Usage stats dashboard |
| `AnswerAssistant.jsx` | 647 | AI answer generation |
| `Tutorial.jsx` | 444 | First-time user tutorial |
| `PricingPage.jsx` | 415 | Pricing page (Stripe/Native checkout) |
| `QuestionAssistant.jsx` | 363 | Question generation assistant |
| `UsageLimitModal.jsx` | 345 | "You've hit your limit" modal |
| `StripeCheckout.jsx` | 266 | Stripe Checkout integration |
| `FirstTimeConsent.jsx` | 260 | Terms acceptance modal |
| `RetentionDashboard.jsx` | 235 | Retention/engagement metrics |
| `ResetPassword.jsx` | 216 | Password reset form |
| `SubscriptionManagement.jsx` | 204 | Manage Pro subscription |
| `SessionDetailsModal.jsx` | 147 | Session detail viewer |
| `NativeCheckout.jsx` | 136 | Apple IAP checkout |
| `ErrorBoundary.jsx` | 96 | React error boundary |
| `ConsentDialog.jsx` | 87 | Generic consent dialog |
| `AuthPage.jsx` | 62 | Auth page wrapper (redirect logic) |

## Utilities (src/utils/)
| File | Lines | Purpose |
|------|------:|---------|
| `creditSystem.js` | 424 | Credit/usage limit logic (tier gates) |
| `nativePurchases.js` | 261 | Apple/Google IAP integration |
| `streakSupabase.js` | 183 | Streak DB layer: fetch, update, freeze (Phase 3) |
| `streakCalculator.js` | 130 | Pure streak logic: calculate, freeze, milestones (Phase 3) |
| `browserDetection.js` | ~90 | Shared browser/speech detection utility (Phase 3) |
| `fetchWithRetry.js` | 77 | Retry wrapper (3 attempts, backoff) |
| `nativeInit.js` | 62 | Capacitor initialization |
| `platform.js` | 58 | Platform detection (web vs native) |

---

# 2. AI FEEDBACK CALL (Practice Session Completion)

### Primary: Nursing Practice Mode
**File:** `src/Components/NursingTrack/NursingPracticeMode.jsx`
- **Line 164:** `submitAnswer()` function definition
- **Lines 174-190:** `fetchWithRetry()` call to `/functions/v1/ai-feedback` Edge Function
  - Mode: `nursing-coach`
  - Feature: `nursingPractice`
  - System prompt: `PRACTICE_SYSTEM_PROMPT()` (lines 28-86, C.O.A.C.H. protocol)
- **Lines 198-211:** Response parsing (feedback text, score, validation)
- **Line 227:** Credit charge AFTER success: `incrementUsage(supabase, userId, 'nursingPractice')`

### Legacy: Main App Practice
**File:** `src/App.jsx`
- **Line ~3053:** Legacy fetch to `ai-feedback` (within retry wrapper)
- **Line ~3205:** Another legacy fetch to `ai-feedback`

### Edge Function
**File:** `supabase/functions/ai-feedback/index.ts`
- Accepts `mode`, `systemPrompt`, `conversationHistory`, `userMessage`
- Routes to Claude Haiku (practice) or Sonnet (interviews)
- Server-side usage validation against `usage_tracking` table

---

# 3. SUPABASE AUTH FLOW

### Client Initialization
**File:** `src/lib/supabase.js` (lines 1-9)
- Env vars: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

### Sign Up / Sign In / Password Reset
**File:** `src/Auth.jsx`
- **Line 25:** `supabase.auth.signUp()` (email + password + full_name metadata)
- **Line 40:** `supabase.auth.signInWithPassword()`
- **Line 62:** `supabase.auth.resetPasswordForEmail()`

### Auth State Listeners
**File:** `src/App.jsx` (line 1047)
- Primary listener: updates `currentUser`, loads tier/stats

**File:** `src/ProtectedRoute.jsx` (line 17)
- Secondary listener: handles `SIGNED_IN`, `TOKEN_REFRESHED`, `SIGNED_OUT`, `PASSWORD_RECOVERY`
- Fetches fresh user via `supabase.auth.getUser()` to fix stale `email_confirmed_at`

### Session Check
**File:** `src/Components/AuthPage.jsx` (line 24)
- `supabase.auth.getSession()` — redirects if already logged in

**File:** `src/ProtectedRoute.jsx` (line 51)
- `supabase.auth.getSession()` — checks session on mount, fetches fresh user

### Email Verification
**File:** `src/ProtectedRoute.jsx` (lines 136-190)
- Checks `user.email_confirmed_at`
- Shows verification modal with resend button

### Sign Out
- `src/App.jsx` (lines 3971, 7590)
- `src/ProtectedRoute.jsx` (line 181)
- `src/Components/NursingTrack/NursingDashboard.jsx` (line 76)
- `src/Components/FirstTimeConsent.jsx` (line 85)

---

# 4. STRIPE INTEGRATION

### Frontend
| File | Purpose |
|------|---------|
| `src/Components/StripeCheckout.jsx` | Stripe Checkout flow (line 82: invokes Edge Function) |
| `src/Components/PricingPage.jsx` | Tier display, routes to Stripe or Native checkout |
| `src/Components/SubscriptionManagement.jsx` | Customer Portal (line 43: invokes portal Edge Function) |
| `src/Components/NativeCheckout.jsx` | Apple IAP fallback for iOS |

### Edge Functions
| File | Purpose |
|------|---------|
| `supabase/functions/create-checkout-session/index.ts` | Creates Stripe Checkout session |
| `supabase/functions/stripe-webhook/index.ts` | Handles 5 webhook events (checkout.completed, sub.updated, sub.deleted, invoice.succeeded, invoice.failed) |
| `supabase/functions/create-portal-session/index.ts` | Creates Stripe Customer Portal session |

### Pricing
- Pro tier: $29.99/month
- Price ID (from MEMORY): `price_1Sxe9LJtT6sejUOK1JKSxVqA`
- Stripe SDK: v14.21.0, API version 2023-10-16

### Database Columns (user_profiles)
- `subscription_id`, `stripe_customer_id`, `subscription_status`
- Migration: `supabase/migrations/20240131_add_stripe_columns.sql`

### Success Flow (App.jsx lines 1080-1133)
- Detects Stripe return via URL params
- Polls DB for tier update (12 attempts, 2s intervals)

---

# 5. SPEECH RECOGNITION / MICROPHONE

### Main App Implementation
**File:** `src/App.jsx`
- **Lines 1298-1313:** Browser detection (SpeechRecognition / webkit prefix)
- **Lines 1315-1429:** `initSpeechRecognition()` — continuous mode, interim results, iOS beep suppression
- **Lines 1772-1785:** `requestMicPermission()` — getUserMedia
- **Lines 1847-1897:** `startInterviewSession()` — mic stream + fresh recognition init
- **Lines 1960-2030:** `endInterviewSession()` — full cleanup (stop + null refs + release tracks)
- **Lines 2032-2069:** Spacebar capture handlers

### Key Refs (App.jsx)
- Line 144: `recognitionRef`
- Line 203: `isListeningRef`
- Line 205: `micStreamRef`

### Nursing Track Hook (extracted, standalone)
**File:** `src/Components/NursingTrack/useSpeechRecognition.js` (280 lines)
- Clean extraction of all Battle Scar workarounds (#4-7)
- Used by: NursingSBARDrill, NursingMockInterview, NursingPracticeMode, NursingAICoach

---

# 6. SUPABASE DATABASE TABLES

## Core App Tables (8)
| Table | Purpose |
|-------|---------|
| `questions` | Main interview question bank |
| `user_profiles` | User accounts + Stripe billing + consent |
| `practice_sessions` | Practice session history |
| `practice_history` | Historical practice records (legacy?) |
| `usage_tracking` | Per-feature monthly usage counters |
| `user_streaks` | Streak counter: current/longest streak, freeze status (Phase 3) |
| `beta_testers` | Beta tester IDs (unlimited access) |
| `profiles` | Default Supabase auth profiles (rarely used) |

## Nursing Track Tables (7)
| Table | Purpose |
|-------|---------|
| `nursing_specialties` | Specialty reference (ED, ICU, OR, etc.) |
| `clinical_frameworks` | Framework reference (NCSBN, SBAR, etc.) |
| `nursing_questions` | 68 curated questions with metadata |
| `nursing_user_profiles` | User specialty/experience preferences |
| `nursing_practice_sessions` | Per-question session records + scores |
| `nursing_flashcard_progress` | Flashcard mastery tracking |
| `nursing_saved_answers` | User's saved best answers |

## Views
| View | Purpose |
|------|---------|
| `nursing_questions_full` | Joins questions + specialty + framework |

## Migration Files
| File | Purpose |
|------|---------|
| `20240131_add_stripe_columns.sql` | Stripe columns on user_profiles |
| `20240201_add_terms_consent.sql` | Terms consent columns |
| `20260210000001_nursing_track_tables.sql` | Core nursing schema (8 tables + RLS) |
| `20260210000002_nursing_track_seed.sql` | Seed 68 questions |
| `20260210000003_nursing_track_v2.sql` | Offer Coach + Confidence Builder modes |
| `20260211000001_nursing_saved_answers.sql` | Saved answers table |
| `20260216000002_user_streaks.sql` | Streak counter table + RLS + trigger (Phase 3) |

---

# 7. SUPABASE EDGE FUNCTIONS

| Function | Purpose |
|----------|---------|
| `ai-feedback/` | AI feedback generation (Haiku for practice, Sonnet for interviews) |
| `create-checkout-session/` | Stripe Checkout session creation |
| `stripe-webhook/` | Stripe webhook handler (5 events) |
| `create-portal-session/` | Stripe Customer Portal |
| `check-usage/` | Server-side usage limit validation |
| `generate-question/` | AI question generation |
| `validate-native-receipt/` | Apple IAP receipt validation |

---

# 8. BROKEN IMPORTS / MISSING FILES

**Status: NONE DETECTED**

All 70+ source files validated. Every relative import resolves to an existing file. All external package imports are valid.

---

# 9. MISSING DOCUMENTS (Referenced but don't exist yet)

These files are referenced in the Session 0-3 prompt templates but have not been created:
- `/docs/PROTOCOLS.md` — Should contain B.U.I.L.D., D.R.A.F.T., V.S.A.F.E.R.-M protocols
- `/docs/PRODUCT_ARCHITECTURE.md` — Should contain architecture overview
- `/docs/prompts/PHASE_1_FEEDBACK_REDESIGN.md`
- `/docs/prompts/PHASE_2_ARCHETYPE_ONBOARDING.md`
- `/docs/prompts/PHASE_3_STREAKS_IRS.md`

---

# 10. REPO STATISTICS

| Metric | Count |
|--------|------:|
| Total src/ files | 78 |
| Active source files (excl. backups) | 67 |
| Backup files | 11 |
| Nursing track files | 21 |
| Streak files | 2 components + 2 utils |
| Shared components | 1 (SpeechUnavailableWarning) |
| Landing page files | 15 |
| Edge Functions | 7 |
| Database tables | 15 |
| Migration files | 7 |
| Total active source lines | ~28,000 |
| Total backup dead weight | ~57,600 |

---

*Generated by Session 0: Orientation audit. No code was modified.*
