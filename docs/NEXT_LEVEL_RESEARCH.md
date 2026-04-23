# InterviewAnswers.ai — Next Level Research & Action Plan

**Start:** 2026-04-09 10:05 AM
**Target completion:** 2026-04-09 2:05 PM (4 hours)

## The Brief

Founder identified 4 critical areas requiring thorough research before code changes:

1. **Home Page Layout & Appeal** — Is it functional? Mobile vs desktop? Panel vs dashboard vs social feed? Square vs rectangle cards? Order optimization? Separate layouts per viewport? Sidebar navigation?

2. **App Store Readiness** — Every button in Settings functional? All required links present? What will Apple reject us for? What are we missing?

3. **AI Feature Data Access** — The AI Coach told a user it "doesn't have access to practice session data." What other AI features have similar gaps where the AI lacks context it should have?

4. **Curated Interview Playlists (NEW)** — Current format selection still feels random because it picks questions via seeded RNG. Founder wants CURATED, NAMED interviews (like Spotify playlists):
   - Click AI Interview → pick format → **see list of curated interviews with summaries**
   - Optional "More Info" / "Show Questions" toggle (hidden by default)
   - Click to begin the interview — plays a specific ordered sequence
   - Examples: "The FAANG Phone Screen", "Amazon Leadership Principles Deep Dive", "Executive Final Round"

**Target completion extended:** 3:05 PM (5 hours total from 10:05 AM start).

## The Team (Agent Roles)

- **Supervisor** — time tracking, pivots agents as needed
- **Auditor** — reviews work against research, corrects trajectory
- **Product Manager** — task ordering, frontend↔backend communication
- **Finance** — cost impact of changes
- **Coder 1, 2, 3** — implement, cross-check each other's work
- **Reviewer** — final quality check
- **Owner** — will not let this fail
- **Researcher** — thorough, competition-aware, communicates in replicable findings

## Phase 1: Research (10:05-11:15) — STATUS: IN PROGRESS

### Active Agents
| Agent | Task | Status |
|-------|------|--------|
| Researcher 1 | Home page layout patterns + competitor analysis | 🔄 Running |
| Researcher 2 | App Store 2026 compliance + rejection risks | 🔄 Running |
| Auditor 1 | AI features data access audit | 🔄 Running |
| Auditor 2 | Settings page functionality + Apple requirements | 🔄 Running |
| Auditor 3 | Visual UX audit of home page (mobile + desktop) | 🔄 Running |

### Findings (populated as agents report)

#### Home Page Layout — RESEARCHER 1 REPORT RECEIVED

### Verdict: REDO ENTIRELY into "Hero + Feed" hybrid pattern

**Key findings:**
- Current layout reads as "panel of panels" because everything has EQUAL visual weight
- Consumer habit apps (Duolingo, Headspace, Calm, Noom, BetterUp) all use **Hero + Feed**, NOT dashboard grids
- Only B2B productivity tools (Notion, Linear, Big Interview desktop) use sidebars
- InterviewAnswers.ai is squarely in the consumer/habit bucket → NO sidebar
- Single responsive layout, mobile-first, Tailwind breakpoints (NOT separate mobile/desktop)

### The Pattern: Hero + Feed
- **Hero** = one big, unmissable primary action above the fold ("Start Today's Practice")
- **Feed** = scrollable, visually varied cards below for secondary engagement

### Card Shape Rules (critical)
| Element | Shape | Tailwind |
|---------|-------|----------|
| Hero action | Wide rectangle | `aspect-[3/1]` mobile, `aspect-[4/1]` desktop |
| IRS dial | **Square** | `aspect-square` |
| Streak | **Square** | `aspect-square` |
| 5 stat cards | **Square** | `aspect-square` or `aspect-[4/3]` |
| 4 practice cards | **Square or 4:3** | `aspect-[4/3]` |
| Score Trend chart | **Locked 16:9** | `aspect-[16/9]` |
| Tools grid (9) | **Square** | `aspect-square` |

**The Score Trend problem diagnosis:** It looks stretched because it's filling a flex/grid cell with NO aspect-ratio lock. A line chart in a 4:1 or wider box reads as "banner" not "chart." Lock to `aspect-[16/9]` or `aspect-[2/1]`.

### Recommended Content Order (top to bottom)
1. Greeting strip (thin, ~40px, no card) — "Good afternoon, [name]" + date + tiny streak pill
2. **HERO CARD** — Today's Primary Action (full-width, 3:1, ONE dominant CTA)
3. **IRS Dial + Streak pair** — Side-by-side squares
4. **Stat cards strip** — 5 squares (2-col mobile, 5-col desktop)
5. **4 Practice Mode cards** — 2x2 mobile, 4-col desktop
6. **Score Trend chart** — Full-width, locked 16:9 (MOVED FROM TOP TO MID-PAGE)
7. **Journey progress** — Horizontal scroll strip (Duolingo-style)
8. **Learn & Listen** (2) — Side-by-side desktop, stacked mobile
9. **Tools grid (9)** — 3x3 squares
10. **Command Center bar** — Bottom or footer-anchored

### Visual Rhythm Fix (addresses "feels like a panel")
**Problem:** Uniform corner radius, shadow, padding, background on EVERY card → "panel soup"
**Fix:**
- Hero = strong gradient bg, `rounded-3xl`, prominent shadow
- Stat squares = minimal border only, no shadow, tight padding `p-3`
- Practice cards = medium shadow, `rounded-2xl`, generous padding
- Chart container = subtle border, no shadow, `rounded-xl`
- Tools grid = hairline border, no shadow
**The rule:** Vary treatment by element TYPE, not by screen position.

### Implementation Strategy
- Build new `HomePageV2` component per Battle Scar #1 (don't touch App.jsx monolith)
- Single responsive layout with Tailwind breakpoints
- No sidebar
- Mobile-first

### Sources cited
Duolingo redesign blog, Headspace case studies, BetterUp 2025, Noom brand hub, UXPin aspect ratio guide, Eleken card design examples, WeWeb 2026 responsive guide.

#### Settings Page — AUDITOR REPORT RECEIVED (full detail)

### Blockers (guaranteed Apple rejection):
1. **Delete Account broken** — fixed ✅
2. **Manage Subscription broken** — calls `onNavigate('pricing')` but there's NO `currentView === 'pricing'` branch in App.jsx (pricing is a modal). On iOS must also deep-link to Apple's subscription management. **NOT YET FIXED.**
3. **Rate the App placeholder** — fixed ✅ (removed)

### P2 issues:
4. Sign Out doesn't call `logoutIAP()` from nativePurchases.js — RevenueCat session persists after sign-out on native shared devices
5. Version hardcoded `v1.0.0` — should read from build or Capacitor
6. Privacy/Terms routing is fragile (state-based, loses on refresh) — works for review but not ideal

### Other findings:
- `getManageSubscriptionURL()` EXISTS in `src/utils/nativePurchases.js` line 247 but is never imported or used
- `logoutIAP()` EXISTS at line 235 but never called
- Profile Policy URL (Anthropic): 200 OK, verified
- `mailto:support@interviewanswers.ai`: functional
- Delete Account UI gate (type "DELETE") works correctly, just the handler was broken

### Source-mapped findings:
- SettingsPage.jsx line 107 — delete_user RPC: FIXED
- SettingsPage.jsx line 198 — `onNavigate('pricing')`: BROKEN (needs `onOpenPricing` prop)
- SettingsPage.jsx line 254 — fake App Store URL: FIXED (removed)
- SettingsPage.jsx line 61 — handleSignOut missing `logoutIAP()`
- SettingsPage.jsx line 551 — hardcoded version

#### App Store Readiness — RESEARCHER 2 REPORT RECEIVED (thorough)

### 🚨 NEW DISCOVERY: Guideline 5.1.2(i) (effective Nov 13, 2025)
Apple's new rule requires explicit consent before sending user data to third-party AI providers. Must name the provider ("Anthropic Claude"), data types, and obtain opt-in.

### VERIFICATION OF EXISTING COMPLIANCE

**FirstTimeConsent.jsx** — ✅ already comprehensive:
- Names "Anthropic's Claude AI" as third-party provider
- Lists exactly what data is sent (text only, not audio, not email/password)
- States Anthropic doesn't train models on this data
- Has mandatory checkbox + Anthropic privacy policy link
- Shows BEFORE AI features become accessible

**GAP**: Does NOT mention Google Cloud TTS (only Anthropic). Per strict reading of 5.1.2(i), should list all third-party AI providers. However, Google TTS is only used for audio output (not sending user data TO Google for analysis) — lower risk but still worth adding a mention.

**Info.plist** — ✅ excellent:
- `NSMicrophoneUsageDescription`: specific, explains Anthropic flow, notes no audio sent
- `NSSpeechRecognitionUsageDescription`: explains on-device transcription, only text to Anthropic
- Passes Apple's specificity requirement

### CRITICAL BLOCKERS FROM REPORT (mapped to status)

1. **5.1.2(i) AI Consent** — ✅ ALREADY COVERED for Anthropic. Consider adding Google TTS mention.
2. **5.1.1(v) Account Deletion** — ✅ FIXED this session (delete_user RPC)
3. **3.1.1 Restore Purchases** — ✅ exists in SettingsPage.jsx, gated to `isNativeApp()`
4. **3.1.2 Subscription Disclosure** — ⚠️ NEED TO VERIFY the paywall has the full verbatim text block
5. **3.1.2 EULA Link** — ✅ in Settings + Terms view, could add to paywall
6. **2.1 Demo Account** — ⚠️ need to verify reviewer account exists + has Pro entitlement
7. **5.1.1 Microphone Purpose** — ✅ strings in Info.plist are specific and compliant

### HIGH RISK (could still cause rejection)

1. **Sign In with Apple** — NOT required if using email/password only (we do). EXEMPT.
2. **Guideline 4.2 Capacitor wrapper** — needs real-device testing, native-styled offline screen
3. **App Privacy Labels** — App Store Connect must declare data categories accurately
4. **Guideline 1.4.1 Medical Disclaimer** — Nursing Track needs visible disclaimer
5. **Guideline 2.3.7 Marketing Claims** — avoid "get hired guaranteed" language

### VERBATIM LEGAL TEXT NEEDED

**Paywall subscription disclosure block** (section 6.1 of report):
```
Payment will be charged to your Apple ID account at confirmation of purchase.
Subscription automatically renews unless auto-renew is turned off at least
24 hours before the end of the current period. Your account will be charged
for renewal within 24 hours prior to the end of the current period at the
cost of the selected plan. You can manage and cancel your subscription by
going to your Apple ID Account Settings after purchase.
```

**Nursing Track health disclaimer** (section 2.4):
```
InterviewAnswers.ai's Nursing Track is an interview communication coaching
tool. It is NOT a clinical reference, medical education resource, or
substitute for professional nursing judgment, NCLEX prep, clinical education,
or facility protocols. For clinical questions, consult your facility
protocols, a licensed clinician, or resources like UpToDate. The AI does not
provide medical advice.
```

### ACTION ITEMS FROM REPORT

1. Add Google TTS to FirstTimeConsent disclosure (minor)
2. Verify GeneralPricing.jsx has full subscription disclosure block (Apple 3.1.2 verbatim)
3. Verify Nursing Track has visible medical disclaimer
4. Verify Stripe payment path is DISABLED on iOS builds (RevenueCat only on native)
5. Check App Store Connect for: Standard EULA selected, Privacy Labels accurate, screenshots at 1320×2868
6. Create/verify `apple-reviewer@interviewanswers.ai` demo account with Pro entitlement

#### App Store Readiness — OWNER'S PRELIMINARY SETTINGS AUDIT

**Settings page has (good news):**
- ✅ Profile with email display
- ✅ Subscription → navigates to pricing
- ✅ Restore Purchases (gated to `isNativeApp()`)
- ✅ AI Data Sharing notice → Anthropic privacy link
- ✅ Privacy Policy → in-app navigation
- ✅ Terms of Service → in-app navigation
- ✅ Contact Support → mailto:support@interviewanswers.ai
- ✅ Reset Progress (with confirmation)
- ✅ Delete Account (with DELETE typing confirmation — meets Apple requirement)
- ✅ Sign Out
- ✅ Version display (hardcoded "v1.0.0")

**ISSUES FOUND:**

1. **🚨 BLOCKER: Rate the App URL is a placeholder**
   Line 254: `https://apps.apple.com/app/interviewanswers-ai/id0000000000`
   This is a fake App Store ID — if a reviewer clicks it, they'll see a broken link. Apple WILL mark this.

2. **⚠️ Version is hardcoded**
   Line 551: `InterviewAnswers.ai v1.0.0`
   Should read from package.json or Capacitor plugin. If we ship v1.1 and Settings still says 1.0.0, that's a minor issue but looks unprofessional.

3. **⚠️ "Manage Subscription" button**
   Line 198: `action: () => onNavigate('pricing')`
   On iOS native, this should deep-link to Apple's Manage Subscriptions settings, not a pricing page. Apple Guideline 3.1.2 requires a way to manage/cancel subscriptions.

4. **⚠️ Missing: Cancel subscription disclosure**
   Apple requires apps with auto-renewing subscriptions to show the cancel instructions in the settings or sub page.

5. **⚠️ Missing: Report a Problem / Bug report**
   Nice to have but not strictly required. The `mailto:` covers it.

6. **⚠️ Missing: Restore Purchases in WEB view**
   Restore is gated to native only. On the web, users using Stripe should be able to recover past sessions. Not a blocker but a UX gap.

7. **⚠️ Delete-account goes through Edge Function `delete-account`**
   Need to verify that Edge Function exists and works. If it doesn't, the button fails silently → Apple will mark us.

#### AI Data Access — AUDITOR FULL REPORT RECEIVED

### Key Discovery
**An `interview-coach` mode already exists in the Edge Function (lines 660-855)** with a purpose-built USER CONTEXT block, anti-hallucination rules, and the I.N.T.E.R.V.I.E.W. protocol. It expects:
- `practiceStats` (totalSessions, avgScore, recent scores)
- `weakAreas`, `strongAreas` (categories with real scores)
- `streakDays`, `questionsCompleted`, `totalQuestions`
- `targetRole`, `targetCompany`, `daysUntilInterview`, `questionGroups`

**But AIInterviewCoach component calls `mode: 'confidence-brief'` instead** (a thin pass-through). The entire data-aware mode was built and never connected.

### My Interim Fix (deployed this session)
Since switching to `interview-coach` mode would touch billing/credits (per HARD STOP rule), I took the **short-term safe path**:
- Kept `mode: 'confidence-brief'` (same credit key: `answer_assistant`)
- Computed REAL weakest/strongest category from `questions[].averageScore` in AIInterviewCoach
- Injected full practice data into the system prompt via `buildCoachSystemPrompt`
- Added explicit "Do NOT say 'I don't have access'" instruction
- `confidence-brief` passes systemPrompt through verbatim, so the AI sees the data

**This resolves the user-facing bug** (AI now has the data). The deeper refactor (switching to `interview-coach` mode + wiring credits) is tracked as follow-up work.

### Other Findings from Auditor (added to backlog)

**FINDING 2 (P1)** — `getUserContext()` only returns static job context (role, company, JD, portfolio). Doesn't include practiceHistory, scores, weakest/strongest categories, streak. Every caller inherits this. **Recommended: create sibling `getUserContextRich()` that composes the existing one.**

**FINDING 3 (P1)** — `streakDays: 0` hardcoded in Practice Mode + AI Interviewer submit calls (lines 3379, 3561). Comment says `TODO Phase 3: wire to streak system`. Real data exists in streaks table.

**FINDING 4 (P2)** — Practice/AI Interviewer contextSection (lines 278-303 in Edge Function) doesn't include performance data. Only `selfEfficacyData` addendum, only on final exchange.

**FINDING 5 (P2)** — AI Interviewer follow-up questions during the session don't see user performance history. `isFinalExchange` gate is too restrictive (line 1116 of Edge Function).

**FINDING 6 (P3)** — AnswerAssistant doesn't see practice data, including prior attempts at the specific question being answered.

**FINDING 7 (P3)** — Nursing Confidence Builder has the same `confidence-brief` pass-through problem but is out of scope.

#### AI Data Access Gaps — OWNER'S PRELIMINARY FINDINGS

**CONFIRMED BUG in AIInterviewCoach.jsx (lines 318-341):**
```js
const getCoachContext = useCallback(() => {
  const categories = ['Core Narrative', 'System-Level', 'Behavioral', 'Technical'];
  let weakest = null;
  let lowestPct = 101;

  for (const cat of categories) {
    const catQ = questions.filter(q => q.category === cat);
    if (catQ.length === 0) continue;
    // We don't have practice history directly, so just note the category sizes
    const pct = catQ.length;  // <-- THIS IS COUNTING QUESTIONS, NOT MEASURING WEAKNESS
    if (pct < lowestPct) {
      lowestPct = pct;
      weakest = cat;
    }
  }

  return {
    questionCount: questions.length,
    sessionCount: totalSessions + totalAISessions,
    weakestCategory: weakest,  // <-- Nonsense "weakest" — just the category with FEWEST questions
  };
}, [questions, totalSessions, totalAISessions]);
```

**What's passed to AI Coach:**
- Question count (total)
- Session count (total, not per category)
- "Weakest category" = category with fewest questions (!!) — not actual weakness from scores

**What's MISSING:**
- Per-question scores (we have them on `questions[].averageScore`)
- Recent practice feedback
- Actual weakness derived from scores
- Score trends
- Specific questions scored below 5
- Categories where avg score < 6

**Also:** AI Coach sends `mode: 'confidence-brief'` — this is the ONBOARDING SCORING mode, NOT a proper coach mode with user context. The Edge Function's `confidence-brief` mode is designed to grade a single answer, not to coach with user history.

**Root cause chain:**
1. `AIInterviewCoach.jsx` uses `mode: 'confidence-brief'` in fetch body (line 399)
2. Only sends a system prompt + the user message
3. No practice history or scores sent
4. Edge Function `confidence-brief` mode wasn't designed for this
5. The AI genuinely has no data to work with

**Same gap in AI Interviewer and Practice Mode:**
`getUserContext()` in App.jsx (line 635-665) returns ONLY:
- targetRole, targetCompany, background, interviewType, jobDescription, interviewDate, portfolioSummary

**MISSING from `getUserContext()`:**
- practiceHistory (we have this in state!)
- Average score
- Recent session scores
- Weakest area by actual performance
- Question bank stats (practiceCount, averageScore per question — already computed in `loadQuestions()`)

**Severity: CRITICAL** — This is the difference between "AI that knows you" and "AI that is technically running."

## Phase 2: Consolidation (11:15-11:45)

*To be populated after Phase 1 completes*

## Phase 3: Implementation (11:45-1:30)

*Priority-ordered task list to be generated*

## Phase 4: Verification (1:30-2:05)

*Build, browser test, final checks*

---

## Quick Fixes Already Shipped (while agents research)

### ✅ Fix 1: Account Deletion (CRITICAL App Store blocker)
**File:** `src/Components/SettingsPage.jsx` — `handleDeleteAccount()`
**Before:** Called `supabase.functions.invoke('delete-account')` — function does not exist
**After:** Calls `supabase.rpc('delete_user')` — matches the migration in `supabase/migrations/20260405_delete_user_account.sql`
**Impact:** Apple Guideline 5.1.1(v) is now actually satisfied.

### ✅ Fix 2: Placeholder "Rate the App" Link
**File:** `src/Components/SettingsPage.jsx`
**Before:** Linked to `https://apps.apple.com/app/interviewanswers-ai/id0000000000` (fake App ID)
**After:** Row removed until real App Store ID is available post-launch
**Impact:** Reviewers won't encounter a broken link.

### ✅ Fix 3: AI Coach Practice Data Access
**Files:** `src/Components/AIInterviewCoach.jsx`, `src/utils/coachPrompt.js`, `src/App.jsx`
**Before:**
- `getCoachContext()` only counted questions, didn't compute actual weakness from scores
- Used nonsense "weakestCategory = category with fewest questions"
- Didn't receive `practiceHistory` at all
- Coach prompt didn't include any real performance data

**After:**
- AIInterviewCoach now accepts `practiceHistory` and `userContextData` props
- `getCoachContext()` computes:
  - Weakest category by actual average score
  - Strongest category
  - Overall average across practiced questions
  - Recent session scores (last 5)
  - Top 3 struggling questions (low score, multiple attempts)
  - Recent feedback gaps (last 3 sessions)
  - Days until interview, role, company, background, JD
- Coach system prompt now has a "USER'S PRACTICE HISTORY" block with all this data
- System prompt explicitly tells the AI: "Do NOT say 'I don't have access to your data' — you do"

**Impact:** When user asks "what are my weakest areas?", the AI can now answer with actual data.

## Real-Time Log

**10:05 AM** — Phase 1 started. 5 agents launched for parallel research.
**10:18 AM** — Found delete-account Edge Function missing. Fix applied.
**10:22 AM** — Rate App placeholder link removed.
**10:32 AM** — AI Coach data access pipeline rewritten. Build clean.
**10:42 AM** — Extended to 5 hours. 6th agent launched for curated interview playlists.
**10:55 AM** — Home layout research report in. Decisive "Hero+Feed" verdict. HomePageV2 coder agent launched.
**11:00 AM** — Settings audit received. All P0/P1 blockers identified. Delete Account + Manage Subscription fixes applied. Dynamic version string.
**11:10 AM** — AI data access audit received. Confirmed interim fix adequate. Deeper refactor (switch to `interview-coach` mode) deferred due to billing HARD STOP.
**11:15 AM** — HomePageV2.jsx built (357 lines) + integrated behind feature flag. Browser-verified.
**11:30 AM** — App Store 2026 research received. Critical new 5.1.2(i) rule found. FirstTimeConsent verified compliant for Anthropic. Google TTS gap noted. Apple verbatim disclosure added to both paywalls.
**11:45 AM** — Viewport audit received. Found the actual Score Trend stretch bug in ScoreTrendSparkline.jsx. Fixed `preserveAspectRatio="none"` → `xMidYMid meet` + viewBox 280×64 → 1200×300. IRS + Score Trend now side-by-side on lg:. Browser-verified the chart now looks like a real chart.

## PHASE 2 SUMMARY (as of 11:55 AM)

**6 Research Reports Received, 1 Pending (curated interviews).**
**14 Code Changes Shipped.** All builds passing clean.

### App Store Compliance Status
- ✅ 5.1.1 Privacy (deletion, purpose strings, consent)
- ✅ 3.1.1 IAP (RevenueCat gated, Restore Purchases present)
- ✅ 3.1.2 Subscription disclosure (verbatim block on both paywalls)
- ✅ 5.1.2(i) AI data sharing (Anthropic disclosed, consent checkbox)
- ✅ 1.4.1 Medical disclaimer (Nursing Track covered)
- ⚠️ 2.3.7 Metadata (need to verify App Store Connect listing)
- ⚠️ 2.1 Demo account (need to verify reviewer account in App Store Connect)

### Layout Status
- ✅ Score Trend stretch bug FIXED (2-line change)
- ✅ IRS + Score Trend side-by-side on desktop (old layout)
- ✅ HomePageV2 available behind feature flag for future full swap
- ⏳ Stats cards (rectangles → squares) — auditor recommended, pending if time
- ⏳ Tools grid (4-col + 5-col mismatch → 3×3) — pending if time
- ⏳ Recommendation bar inline with Practice heading — pending if time
