# CLAUDE.md — InterviewAnswers.AI Operating Instructions
# Claude Code reads this file automatically on every session.
# DO NOT SKIP. DO NOT SKIM. READ FULLY BEFORE WRITING ANY CODE.

---

# PART 1: PROJECT CONTEXT

## What This App Is
InterviewAnswers.AI is a live, deployed AI-powered interview preparation app:
- **Live Prompter** — real-time coaching during practice
- **AI Mock Interviewer** — conversational interview simulation
- **STAR Method Coaching** — Situation-Task-Action-Result framework
- **Practice Mode** — self-paced interview prep
- **Stripe billing** — freemium model, $29.99/month Pro tier
- **Supabase Auth** — email/password + email verification
- **Usage tracking** — per-feature monthly counters
- **Capacitor** — iOS/Android native app wrapper

## Tech Stack
- React 18 + Vite + Tailwind CSS
- ~70 useState hooks in monolithic App.jsx (8,099 lines)
- React Router v6 (top-level) + currentView state (internal views)
- Supabase PostgreSQL (RLS-protected)
- Anthropic Claude via Supabase Edge Functions (Haiku for practice, Sonnet for interviews)
- Stripe (web) + Apple/Google IAP (native)
- Vercel (web deployment) + Capacitor (iOS/Android)

## Current Views (state-based)
home, practice, ai-interviewer, prompter, flashcard, settings, commandCenter

## Question Data Structure
```
{ id, question, category, priority, keywords[], bullets[], narrative, followUps[] }
```

---

# PART 2: CURRENT WORK — Nursing Interview Track

## What We're Building
A **healthcare/nursing specialty track** inside InterviewAnswers.AI. NOT a separate app.

**Marketing:** NurseInterviewPro.ai is a landing page that funnels into the nursing track within the main app.

## The Walled Garden Model

**AI DOES (coaching engine):**
- Conducts mock interviews using questions from curated content library
- Evaluates communication quality (STAR structure, specificity, confidence, clarity)
- Provides real-time delivery feedback (pacing, filler words, detail level)
- Adapts session flow based on user responses
- Coaches users to articulate REAL clinical experiences
- Flags when responses are vague or lack genuine clinical detail

**AI NEVER DOES:**
- Generate clinical scenarios from its own training data
- Invent medical facts, drug dosages, or clinical protocols
- Recommend clinical interventions
- Evaluate clinical accuracy outside validated rubrics
- Act as a clinical reference or textbook
- Replace NCLEX prep, clinical education, or CE requirements

**The line:** The advisory board creates the CONTENT (questions, scenarios, rubrics). The AI creates the EXPERIENCE (conducts the interview, gives feedback, adapts, coaches delivery). They serve completely different functions.

## Clinical Content Requirements
All clinical content must be:
- Written or reviewed by qualified nurses/nurse educators before reaching users
- Grounded in published frameworks (NCSBN Clinical Judgment Model, SBAR, Nursing Process, Maslow's, ABC)
- Tagged with metadata: author, reviewer, clinical framework source, review date
- Source-cited in-app

## Redirect for Out-of-Scope Questions
If a user asks a direct clinical question (e.g., "What's the correct dose of epinephrine?"), AI responds:
> "That's a great clinical knowledge question, but I'm designed to help you communicate your knowledge effectively in interviews, not to serve as a clinical reference. For clinical questions, please refer to your facility protocols or resources like UpToDate."

---

# PART 3: ERIN'S FEEDBACK — THESE ARE CONSTRAINTS

Erin is a healthcare infection prevention professional at Stanford Health Care. She is the clinical domain expert and co-founder. Her decisions are final on product direction.

### ✅ Approved
- Individual nurses as target market (B2C)
- Staffing agencies — maybe, explore later
- Walled garden model

### ❌ Rejected — DO NOT BUILD
- Nursing schools as customers (no B2B to schools)
- Hospitals as customers (no B2B to hospitals)
- Specialty matching feature (nurses already know their specialty)
- Separate app (it's a track inside InterviewAnswers.AI)

### ⚠️ Handle With Care
- "You just need more experience" messaging — don't be patronizing. Guide constructively, don't gatekeep.

---

# PART 4: PRODUCT DECISIONS (LOCKED)

| Decision | Choice | Reason |
|----------|--------|--------|
| Separate app vs. module | Module inside InterviewAnswers.AI | Erin's input + one codebase |
| Marketing | NurseInterviewPro.ai landing page → funnels into main app | Targeted messaging |
| Primary market | Individual nurses (B2C) | Erin confirmed |
| Secondary market | Staffing agencies (maybe later) | Erin said maybe |
| NOT pursuing | Nursing schools, hospitals (B2B) | Erin rejected |
| Clinical content | Human-validated library only | Walled garden |
| AI role | Communication coaching engine | Not clinical evaluation |
| Specialty matching | Removed | Erin rejected |

---

# PART 5: TWO PROTOCOLS

## Protocol 1: D.R.A.F.T. — Feature Exploration (Nursing Track)

### D — DIVERGE FROM MAIN
- Create feature branch (e.g., `feature/nursing-track`)
- Confirm you are NOT on main/master/production
- State branch name at start of every session

### R — RESTRICT TO NEW ADDITIONS
- **CREATE** new files, components, routes, modules ✅
- **EXTEND** existing config minimally if needed ✅
- **DO NOT** modify existing production components ❌
- **DO NOT** refactor, rename, or reorganize ❌
- **DO NOT** change shared state, global config, auth, billing, routing ❌
- If you MUST touch an existing file, document: file name, exact lines ADDED, why

### A — ALIGN WITH PRODUCT DECISIONS
Before building, verify it doesn't conflict with:
- Erin's approved/rejected list
- The walled garden model
- The decision to build inside InterviewAnswers.AI
- B2C target market

### F — FREE TO EXPERIMENT
- Try different UI approaches
- Experiment with prompts
- Build rough prototypes
- Iterate quickly, throw things away if needed

### T — TRACK FOR MERGE
At end of each session, provide:
- List of new files created
- Any existing files touched (and why)
- What was built, what works, what needs work
- What should be thrown away

---

## Protocol 2: V.S.A.F.E.R.-M — Production Bug Fixes

### V — VERIFY BASELINE
Before touching ANY code: extract current deployed code, verify recent fixes present (Math.round, pointerEvents, etc.), document commit hash and line counts.

### S — SCOPE-LOCKED
Only address what is shown in screenshots/notes. Do not touch unrelated areas.

### A — ADDITIVE + LOCALIZED
Do not refactor. Do not rename. Do not reorganize. Minimal edit surface.

### F — FUNCTION-PRESERVING
Assume recent fixes are fragile. Preserve existing behavior outside the failure.

### E — EXACT-LINE ACCOUNTING
For every file touched: file name, exact line ranges, BEFORE/AFTER snippets, 1-sentence rationale.

### R — REGRESSION-AWARE
List 3-7 specific things your change could break. Tie each risk to a specific mechanism (state, effect dependency, event listener lifecycle, async timing, permissions, browser quirks). No generic warnings.

### M — MERGE-GATED
1. Draft fix as standalone sandbox block
2. Self-check: replaces only intended behavior? Conflicts with recent fixes? Changes imports/state/hooks/routing/config? (If yes → STOP)
3. Integrate with smallest possible replacement
4. Provide regression checklist

---

## HARD STOP RULE (Both Protocols)
If you need to change shared utilities, global config, routing architecture, app-wide state, authentication, or billing logic → **STOP AND ASK FIRST.**

---

# PART 6: BATTLE SCARS — 20 Lessons from 3+ Months of Development

## 🏗️ Architecture

### 1. The Monolithic App.jsx Problem
App.jsx is 8,099 lines with ~70 useState hooks. Every change risks breaking unrelated features.
**RULE:** DO NOT add to App.jsx. Build nursing features as separate components in `src/Components/NursingTrack/`. Minimal integration point.

### 2. State-Based Routing is Fragile
Views controlled by `currentView` state, not URL routes. Refreshing loses your place.
**RULE:** Prefer React Router routes. If using existing state pattern, document exactly which states you're adding.

### 3. Edge Functions Need Error Handling
40% failure rate on question generation. Silent failures.
**RULE:** Any Edge Function must include: retry logic (3 attempts, 0s/1s/2s backoff), explicit error responses, console logging, never charge usage before confirmed success.

## 🎤 Speech Recognition / Microphone

### 4. iOS Safari Microphone is Special
Start/stop sounds are OS-level. Can't suppress them.
**RULE:** Keep mic session open continuously. Start once, pause/resume, stop only on exit. Reinitialize fresh on each new session. If nursing track uses speech, inherit existing mic lifecycle. DO NOT create new speech implementation.

### 5. getUserMedia Requires User Gesture on Mobile
Programmatic mic start silently fails on iOS.
**RULE:** Never auto-start mic. Always require explicit user tap.

### 6. Recognition "Already Started" Errors
Rapid presses cause InvalidStateError.
**RULE:** Guard with isListeningRef.current check. Handle no-speech gracefully. Handle aborted with state reset.

### 7. Mic Cleanup Between Sessions
Stale recognition objects break new sessions.
**RULE:** Full cleanup: stop → remove listeners → null ref → reinitialize fresh. 100ms delay before new recognition.

## 💰 Billing / Stripe

### 8. Charge AFTER Success, Never Before
Users lost credits for failed API calls.
**RULE:** Check limits → user clicks → API call with retry → wait for success → only then increment. All retries fail → charge ZERO.

### 9. Beta Users Need Unlimited Access
Beta testers hit free tier limits during testing.
**RULE:** Check beta_testers table before limit enforcement.

### 10. Stripe Webhook Must Be Verified
Signing secret verification prevents fake payment events.
**RULE:** Nursing track pricing goes through existing Stripe infrastructure. No parallel system.

## 🐛 Bug Fix Methodology

### 11. Never Fix What You Can't See
Fixes based on partial context caused syntax errors and duplicate code.
**RULE:** Read the actual file. Don't guess. `cat` the file, `grep` the function.

### 12. One Bug/Feature at a Time
Multiple fixes in one session caused cascading failures.
**RULE:** Build one piece, verify, then next piece.

### 13. String Replacement Typos Are Real
Manual find-and-replace in 8,099 lines introduced bugs.
**RULE:** Use proper file operations. Create new files, test, then integrate.

### 14. Rollback Must Always Be Possible
Broke production with a bad deploy.
**RULE:** Know your commit. Feature branches. Always be able to revert.

### 15. Regression Checklists Are Non-Negotiable
Chart dot fix almost broke desktop hover.
**RULE:** After any change, list specific things it could break with specific mechanisms.

## 📱 Mobile / Cross-Platform

### 16. Test iOS Safari Early and Often
Features work on Chrome desktop, break on iOS Safari.
**RULE:** Always use both onClick AND onTouchStart/onTouchEnd. Design for iOS Safari from the start.

### 17. Capacitor Adds Complexity
Web + native = different payment flows per platform.
**RULE:** Nursing track = web first. Flag anything needing native consideration.

## 🔧 Development Workflow

### 18. Context Loss Between Sessions
Moving between sessions lost all context.
**RULE:** This file (CLAUDE.md) exists for this reason. Read it every time.

### 19. Don't Trust AI-Generated Clinical Content
AI confidently generates plausible-sounding clinical content that may be wrong.
**RULE:** THE cardinal rule. AI coaches communication. Humans provide clinical content. No exceptions.

### 20. Erin's Feedback Is Product Truth
Engineering analysis cannot replicate domain expertise.
**RULE:** When Erin says no, it's no. Her concerns become constraints.

---

# PART 7: PATTERNS REFERENCE

## USE These Patterns
| Situation | Pattern |
|-----------|---------|
| API call to Edge Function | Retry 3x with backoff, charge after success |
| Speech recognition | Inherit existing mic lifecycle, don't rebuild |
| New UI component | Separate file in Components/, minimal App.jsx touch |
| New view/page | Prefer React Router route over state-based view |
| Mobile interaction | Test iOS Safari, use touch + click events |
| Clinical content | Human-validated only, source-cited, never AI-generated |
| Bug fix | V.S.A.F.E.R.-M |
| Feature exploration | D.R.A.F.T. |

## AVOID These Anti-Patterns
| Anti-Pattern | Why |
|-------------|-----|
| Adding code to App.jsx | Already 8,099 lines, every line increases risk |
| Silent API failures | Users think it worked when it didn't |
| Charging before success | Users pay for nothing |
| Rebuilding speech from scratch | Months of iOS Safari fixes lost |
| Fixing multiple things at once | Cascading failures |
| Guessing at unread code | Typos, wrong assumptions |
| AI-generated clinical content | Patient safety, credibility, legal risk |
| Ignoring Erin's feedback | She's the domain expert |

---

*This file is the single source of truth for Claude Code sessions on this project.*
*Last updated: February 9, 2026*
