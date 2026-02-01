# REPO MAP PACKET - ISL (InterviewAnswers.ai)
## Bug Fixing Reference - DO NOT REFACTOR

---

## 1. PROJECT OVERVIEW

**Project Name:** ISL (Interview as a Second Language)
**Deployed URL:** InterviewAnswers.ai
**Repository:** `/Users/alshcampos/Downloads/isl-complete`

### Tech Stack
| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | React | 18.2.0 |
| Routing | React Router DOM | 7.11.0 |
| Styling | Tailwind CSS | 3.4.0 |
| Animation | Framer Motion | 12.23.26 |
| Icons | Lucide React | 0.263.1 |
| Backend | Supabase (PostgreSQL + Auth) | 2.89.0 |
| API Functions | Supabase Edge Functions (Deno) | - |
| AI | Anthropic Claude API | Via Edge Functions |
| Build | Vite | 5.0.8 |
| Deployment | Vercel | - |

### Main Features
1. **AI Interviewer** - Realistic practice with adaptive follow-up questions
2. **Practice Mode** - Quick scoring with AI feedback
3. **Live Prompter** - Real-time bullet points during actual interviews
4. **Answer Assistant (AI Coach)** - STAR method coaching using MI principles
5. **Question Generator** - AI-powered personalized question generation
6. **Flashcard Mode** - Spaced repetition learning
7. **Usage Dashboard** - Advanced analytics + tier management
8. **Template Library** - Pre-built question sets (PM, SWE, General)

### Current Deployment Status
- Build: `vite build` → Output to `/dist`
- Hosting: Vercel with SPA rewrites (all routes → `/index.html`)
- Security headers: X-Content-Type-Options, X-Frame-Options, X-XSS-Protection

---

## 2. FILE STRUCTURE (Key Files Only)

```
/isl-complete/
├── src/
│   ├── App.jsx                          # MAIN APP (~6700 lines, all core logic)
│   ├── main.jsx                         # React entry point
│   ├── Auth.jsx                         # Login/signup flow
│   ├── ProtectedRoute.jsx               # Auth guard + password reset
│   ├── TemplateLibrary.jsx              # Template selection modal
│   ├── default_questions.js             # 12 default questions
│   │
│   ├── lib/
│   │   └── supabase.js                  # Supabase client initialization
│   │
│   ├── utils/
│   │   └── creditSystem.js              # Tier limits + usage tracking logic
│   │
│   └── Components/
│       ├── AnswerAssistant.jsx          # AI Coach (STAR coaching)
│       ├── QuestionAssistant.jsx        # Question generator
│       ├── UsageDashboard.jsx           # Usage analytics modal
│       ├── UsageLimitModal.jsx          # Usage limit display
│       ├── PricingPage.jsx              # Upgrade flow
│       ├── ConsentDialog.jsx            # Recording consent
│       ├── FirstTimeConsent.jsx         # Onboarding consent
│       ├── ResetPassword.jsx            # Password recovery
│       ├── SessionDetailsModal.jsx      # Session review modal
│       ├── Tutorial.jsx                 # Onboarding flow
│       └── RetentionDashboard.jsx       # Streak + achievements
│
├── supabase/
│   └── functions/
│       ├── ai-feedback/index.ts         # Main Claude API integration
│       └── generate-question/index.ts   # Question generation
│
├── package.json                         # Dependencies
├── vite.config.js                       # Build config
├── vercel.json                          # Deployment config
├── tailwind.config.js                   # Styling config
└── index.html                           # Entry HTML
```

---

## 3. ENTRY POINTS & CRITICAL PATHS

### Application Entry
```
index.html → src/main.jsx → BrowserRouter → App.jsx
                                              └── ProtectedRoute wraps ISL component
```

### Authentication Flow (ProtectedRoute.jsx)
```
1. Check URL hash for password recovery token (type=recovery)
   └── If found → Show ResetPassword modal immediately
2. Check Supabase session
   └── No session → Show Auth component (login/signup)
3. Check email_confirmed_at
   └── Not confirmed → Show email verification screen
4. Session valid + verified → Render children (ISL component)
```

**Key Auth Functions:**
- Login: `supabase.auth.signInWithPassword()`
- Signup: `supabase.auth.signUp()` with full_name
- Session: `supabase.auth.getSession()`
- Listener: `supabase.auth.onAuthStateChange()`

### Routing Logic (App.jsx)
**State:** `currentView` (persisted to localStorage as `isl_current_view`)

**Views:**
| View | Description |
|------|-------------|
| `'home'` | Dashboard with stats |
| `'prompter'` | Live Prompter mode |
| `'ai-interviewer'` | AI Interviewer mode |
| `'practice'` | Practice mode |
| `'flashcard'` | Flashcard mode |
| `'command-center'` | Settings/bank/progress |
| `'template-library'` | Template selection |
| `'settings'` | User settings |

**Modals (boolean state):**
- `showUsageDashboard` → UsageDashboard
- `showPricingPage` → PricingPage
- `showAnswerAssistant` → AnswerAssistant
- `showTemplateLibrary` → TemplateLibrary

### Usage Tracking System
**File:** `src/utils/creditSystem.js`

**Functions:**
| Function | Purpose |
|----------|---------|
| `canUseFeature(usage, tier, feature)` | Check if user can use feature |
| `incrementUsage(supabase, userId, feature)` | Increment usage count |
| `getUsageStats(supabase, userId, tier)` | Get all feature usage |
| `getCurrentPeriod()` | Get YYYY-MM period string |

**Tier Limits:**
| Feature | Free | Pro |
|---------|------|-----|
| ai_interviewer | 3 | 50 |
| practice_mode | 10 | Unlimited |
| answer_assistant | 5 | 15 |
| question_gen | 5 | Unlimited |
| live_prompter_questions | 10 | Unlimited |

### Practice Mode Flow
```
startPracticeMode()
  └── Check consent (showConsentDialog if needed)
  └── actuallyStartPractice()
        └── checkUsageLimitsSync('practiceMode')  # Sync check from state
        └── Set currentQuestion, currentMode, currentView
        └── trackUsageInBackground()  # Fire-and-forget
        └── User answers (speak or type)
        └── handlePracticeModeSubmit()
              └── Fetch ai-feedback endpoint
              └── flushSync(setFeedback())  # Force immediate DOM update
              └── savePracticeSession()  # Fire-and-forget
```

### AI Interviewer Flow
```
startAIInterviewer()
  └── Check consent
  └── actuallyStartAIInterviewer()
        └── checkUsageLimitsSync('aiInterviewer')
        └── Pick random question
        └── speakText(question)  # AI speaks via Web Speech API
        └── User speaks answer (speech recognition)
        └── handleAIInterviewerSubmit()
              └── Fetch ai-feedback with conversationHistory
              └── If continue_conversation: setFollowUpQuestion()
              └── Else: flushSync(setFeedback())
              └── Save session with full conversation
```

### AI Coach / Answer Assistant Flow
```
openAnswerAssistant(question)
  └── checkUsageLimitsSync('answerAssistant')
  └── setShowAnswerAssistant(true)

In AnswerAssistant.jsx:
  Stage: 'existing-answer' → 'intro' → 'probing' → 'building' → 'complete'

  startAssistant()
    └── mode: 'answer-assistant-start'
    └── Returns opening question

  handleUserResponse()
    └── mode: 'answer-assistant-continue'
    └── Returns follow-up OR synthesized STAR answer

  handleSaveAnswer()
    └── Update question in Supabase
    └── onAnswerSaved() callback
        └── trackUsageAfterSuccess()  # Usage tracked AFTER success
```

---

## 4. STATE ARCHITECTURE

### Global State (App.jsx useState)
**Total: ~70 useState declarations**

**Critical State:**
| State | Purpose | Persistence |
|-------|---------|-------------|
| `currentView` | Current page/view | localStorage |
| `currentUser` | Authenticated user object | Session |
| `userTier` | 'free' or 'pro' | Supabase |
| `questions` | User's question bank | Supabase + localStorage backup |
| `currentQuestion` | Active question in any mode | Memory |
| `feedback` | AI feedback object | Memory |
| `practiceHistory` | All practice sessions | Supabase + localStorage |
| `usageStatsData` | Current usage counts | Supabase |

**Mode/Session State:**
| State | Purpose |
|-------|---------|
| `currentMode` | 'prompter', 'ai-interviewer', 'practice', 'flashcard' |
| `isListening` | Speech recognition active |
| `interviewSessionActive` | AI Interviewer session running |
| `isCapturing` | Mic actively recording |
| `isAnalyzing` | Waiting for AI response |
| `hasConsented` | Recording consent given |

**Refs (for stable references):**
| Ref | Purpose |
|-----|---------|
| `recognitionRef` | SpeechRecognition instance |
| `synthRef` | SpeechSynthesis instance |
| `accumulatedTranscript` | Full transcript accumulator |
| `interviewSessionActiveRef` | Mirror of state for event handlers |
| `isCapturingRef` | Mirror of state |
| `lastFeedbackRef` | Backup feedback (tab switch safety) |

### Per-Component State
**UsageDashboard.jsx:**
- `loading`, `stats`, `celebrationMode`, `showInsights`

**AnswerAssistant.jsx:**
- `conversation`, `userInput`, `isLoading`, `stage`, `generatedAnswer`

**QuestionAssistant.jsx:**
- `targetRole`, `company`, `background`, `isGenerating`, `generatedQuestion`

### Supabase Tables Accessed
| Table | Used For |
|-------|----------|
| `questions` | User's question bank |
| `practice_sessions` | Session data + AI feedback |
| `practice_history` | Alternative analytics table |
| `usage_tracking` | Monthly feature usage |
| `user_profiles` | User tier + interview date |
| `beta_testers` | Whitelist for beta access |

### localStorage Keys
| Key Pattern | Purpose |
|-------------|---------|
| `isl_current_view` | Restore view after refresh |
| `isl_questions` | Question bank backup |
| `isl_history` | Practice history backup |
| `isl_question_context` | User context (role, company, etc.) |
| `isl_defaults_initialized_${userId}` | Prevent re-init defaults |
| `isl_keep_empty_${userId}` | User chose empty bank |
| `isl_recording_consent` | Recording consent flag |
| `isl_interview_date` | Interview date |
| `isl_daily_goal` | Daily practice goal |
| `isl_api_key` | API key (preserved on logout) |
| `isl_usage_${YYYY-MM}` | Monthly usage backup |

---

## 5. TAB SWITCHING / VISIBILITY HANDLING

### Main Visibility Handler (App.jsx:299-331)
```javascript
useEffect(() => {
  const handleVisibilityChange = () => {
    if (document.hidden) {
      console.log('App backgrounded - stopping mic');
      if (recognitionRef.current && interviewSessionActiveRef.current) {
        recognitionRef.current.stop();
        setInterviewSessionActive(false);
        setIsListening(false);
        setSessionReady(false);
      }
    } else {
      // NO INTERFERENCE: Let flushSync handle state updates naturally
      console.log('App visible - letting async operations complete naturally');
    }
    // TAB SWITCH FIX: Removed setCurrentView that was breaking buttons
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);
  return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
}, []);
```

### Mode Cleanup (App.jsx:265-297)
```javascript
// Stops mic when leaving mic-using modes (prompter, ai-interviewer, practice)
useEffect(() => {
  if (!['prompter', 'ai-interviewer', 'practice'].includes(currentMode)) {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    // Reset all mic state
    setInterviewSessionActive(false);
    setIsListening(false);
    setIsCapturing(false);
    setSessionReady(false);
  }
}, [currentMode]);
```

### UsageDashboard Visibility
**IMPORTANT:** Removed its own visibility listener that was causing infinite loading.
Now loads stats ONCE on mount (when user changes).
```javascript
useEffect(() => {
  loadAdvancedStats();
}, [user]);
// NO LONGER has visibilitychange listener
```

### flushSync Usage Pattern
All critical state updates now use `flushSync` to force immediate DOM commits:
```javascript
flushSync(() => {
  setFeedback(feedbackJson);
});
```

---

## 6. KNOWN BROKEN AREAS (From Bug Report)

### CRITICAL - Test Blockers

**Bug 1: Blank page on refresh in Practice Mode**
- Location: View restoration from localStorage
- Current Code: `currentView` restored from `isl_current_view` on mount (Line 88-91)
- Issue: If refreshed mid-session, `currentQuestion` is null but view is 'practice'

**Bug 2: Usage Dashboard infinite loading after tab switch**
- Location: `UsageDashboard.jsx:35-41`
- Fix Applied: Removed visibility listener, loads once on mount
- Status: Should be fixed, needs verification

**Bug 3: Practice Mode feedback errors**
- Location: `handlePracticeModeSubmit()` (Line 2379-2477)
- Pattern: Promise chain with flushSync for state commits
- Issue: AI API errors not always surfaced properly

### HIGH - Focus-Loss Cascade

**Bug 4: Sign out fails after tab switch**
- Location: Sign out handler (Line 3186-3231)
- Fix Applied: 10-second timeout wrapper with Promise.race
- Pattern: `Promise.race([signOutPromise, timeoutPromise])`

**Bug 5: Delete data fails after tab switch**
- Location: `deleteAllQuestions()` (Line 2132-2161)
- Pattern: Standard async function with await
- Issue: No timeout protection

**Bug 6: AI question generator fails after tab switch**
- Location: `QuestionAssistant.jsx:41-100`
- Fix Applied: 30-second timeout with AbortController
- Pattern: `controller.abort()` on timeout

### MEDIUM - Usage Tracking

**Bug 7: AI Coach usage tracking broken**
- Location: `handleAnswerSaved()` (Line 622-657)
- Fix Applied: `trackUsageAfterSuccess()` called AFTER save, not on modal open
- Key: Usage tracked after `incrementUsage()` succeeds

**Bug 8: Practice session counting logic**
- Location: `actuallyStartPractice()` (Line 2305-2330)
- Pattern: `trackUsageInBackground()` at session START
- Note: Intentional - tracks abandoned sessions

### LOW - Nice to Have

**Bug 9: Default questions not easily accessible**
- Location: `initializeDefaultQuestions()` function
- File: `default_questions.js` has 12 questions

**Bug 10: Days until interview off by one**
- Location: Days calculation (Line 3314-3320)
- Code: `Math.ceil(diffTime / (1000 * 60 * 60 * 24))`

**Bug 11: Flash Cards UI improvements**
- Location: `startFlashcardMode()` (Line 2369)

---

## 7. DO NOT TOUCH LIST

### Critical - NEVER Modify Without Full Understanding

| File/Area | Reason |
|-----------|--------|
| `src/lib/supabase.js` | Supabase client initialization - breaks all DB access |
| `src/ProtectedRoute.jsx` | Auth guard - breaks all authentication |
| `src/utils/creditSystem.js` | Usage tracking - breaks tier limits |
| Visibility handler (Line 299-331) | Tab switch handling - breaks state management |
| Sign out handler (Line 3186-3231) | Auth cleanup - could corrupt state |
| `flushSync()` calls | State commit timing - breaks feedback display |

### High Risk - Modify With Extreme Care

| File/Area | Risk |
|-----------|------|
| `handlePracticeModeSubmit()` | Core feedback flow |
| `handleAIInterviewerSubmit()` | Core feedback flow |
| `handleAnswerSaved()` | Usage tracking timing |
| `checkUsageLimitsSync()` | Gate for all features |
| `trackUsageInBackground()` | Usage counting |
| All useCallback handlers | Stable reference for tab switch |

### Database Schema Dependencies
- `questions` table: id, user_id, question, category, priority, keywords, bullets, narrative, follow_ups, is_default, created_at
- `usage_tracking` table: user_id, tier, period, ai_interviewer, practice_mode, answer_assistant, question_gen, live_prompter_questions, last_reset
- `practice_sessions` table: id, user_id, question_id, question_text, user_answer, mode, word_count, filler_word_count, ai_feedback, created_at

---

## 8. BUG FIX WORKFLOW (V.S.A.F.E.R.-M Protocol)

### For Each Bug Fix:

#### V - Verify
- Find exact file path and line numbers
- Read surrounding 50 lines for context
- Identify all callers of the function
- Check for refs that mirror state

#### S - Scope
- Define ONLY this bug, nothing else
- No "while I'm here" improvements
- No refactoring adjacent code
- No adding comments to unchanged code

#### A - Additive
- Prefer adding code over changing existing
- Wrap problematic code rather than rewrite
- Add timeouts, not restructure flow
- Add fallbacks, not redesign logic

#### F - Function-Preserving
- Test exact same inputs → same outputs
- Don't change function signatures
- Don't rename variables
- Don't change export patterns

#### E - Exact Line Accounting
```
BEFORE (Line X-Y):
[exact code]

AFTER (Line X-Y):
[exact code]
```

#### R - Regression Analysis
- What other functions call this?
- What state does this read/write?
- Could this break tab switching?
- Could this break usage tracking?

#### M - Merge-Gated
1. Test fix in isolation
2. Test all modes still work
3. Test tab switch scenario
4. Test usage counting
5. Only then integrate

---

## 9. CURRENT ISSUES TO FIX (Priority Order)

### CRITICAL (Test Blockers)

#### Issue #1: Blank page on refresh in Practice Mode
```
Location: App.jsx:88-91 (currentView restoration)
Problem: View restored but currentQuestion is null
Need to investigate: What state is missing on refresh?
```

#### Issue #2: Usage Dashboard infinite loading after tab switch
```
Location: UsageDashboard.jsx:35-41
Fix already applied: Removed visibility listener
Status: VERIFY FIX WORKS
```

#### Issue #3: Practice Mode feedback errors
```
Location: App.jsx:2379-2477 (handlePracticeModeSubmit)
Problem: Errors not always surfaced to user
Need to investigate: Error handling in promise chain
```

### HIGH (Focus-Loss Cascade)

#### Issue #4: Sign out fails after tab switch
```
Location: App.jsx:3186-3231
Fix already applied: 10-second timeout with Promise.race
Status: VERIFY FIX WORKS
```

#### Issue #5: Delete data fails after tab switch
```
Location: App.jsx:2132-2161 (deleteAllQuestions)
Problem: No timeout protection
Need: Add timeout wrapper like sign out
```

#### Issue #6: AI question generator fails after tab switch
```
Location: QuestionAssistant.jsx:41-100
Fix already applied: 30-second AbortController timeout
Status: VERIFY FIX WORKS
```

### MEDIUM (Usage Tracking)

#### Issue #7: AI Coach usage tracking broken
```
Location: App.jsx:622-657 (handleAnswerSaved)
Fix already applied: trackUsageAfterSuccess() after save
Status: VERIFY FIX WORKS
```

#### Issue #8: Practice session counting logic
```
Location: App.jsx:2305-2330 (actuallyStartPractice)
Current: Tracks at session START
Note: This is INTENTIONAL for abandoned session analytics
Status: DOCUMENT, NOT A BUG
```

### LOW (Nice to Have)

#### Issue #9: Default questions not easily accessible
```
Location: default_questions.js + initializeDefaultQuestions()
Need: Better UX to reload defaults
```

#### Issue #10: Days until interview off by one
```
Location: App.jsx:3314-3320
Code: Math.ceil(diffTime / (1000 * 60 * 60 * 24))
Need: Verify timezone handling
```

#### Issue #11: Flash Cards UI improvements
```
Location: startFlashcardMode() Line 2369
Low priority cosmetic changes
```

---

## 10. QUICK REFERENCE

### API Endpoints
```
Base: https://tzrlpwtkrtvjpdhcaayu.supabase.co/functions/v1/

Endpoints:
- /ai-feedback (POST) - Main Claude integration
- /generate-question (POST) - Question generation

Headers:
  Authorization: Bearer {session.access_token}
  Content-Type: application/json
```

### Speech Recognition
```javascript
recognitionRef.current = new (window.SpeechRecognition || window.webkitSpeechRecognition)()
// continuous: true
// interimResults: true
// language: 'en-US'
```

### State Update Pattern (Post-Tab-Switch Safe)
```javascript
// WRONG - can be batched/deferred
setFeedback(data);

// RIGHT - forces immediate commit
flushSync(() => {
  setFeedback(data);
});

// ALSO RIGHT - stable reference for event handlers
const handler = useCallback(() => {
  // Uses refs for latest values
  if (interviewSessionActiveRef.current) { ... }
}, [/* minimal deps */]);
```

### Timeout Wrapper Pattern
```javascript
const operation = async () => {
  const operationPromise = actualOperation();
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Timed out')), 10000)
  );

  try {
    return await Promise.race([operationPromise, timeoutPromise]);
  } catch (err) {
    // Handle timeout - force continue
    return null;
  }
};
```

---

## CHANGELOG OF RECENT FIXES

| Commit | Description |
|--------|-------------|
| b11b1ff | Apply flushSync to all critical state updates - fixes tab switching |
| 4ca1aad | All 8 required bugs (focus-loss cascade + usage tracking) |
| 46d3c0c | Template import duplicate prevention |
| a2f8026 | AI Coach + question gen + nav persistence |
| 28480d9 | iOS Safari touch events for chart dots |

---

**Last Updated:** 2026-01-31
**For Bug Fixing Only - DO NOT REFACTOR**
