# ⚔️ BATTLE SCARS — Lessons Learned from InterviewAnswers.AI
## What Went Wrong, What We Fixed, and What Claude Code Must Never Repeat

**Purpose:** This document captures months of hard-won engineering lessons. Read this BEFORE writing any code. Every item here cost real time, real bugs, and real user frustration.

---

## 🏗️ ARCHITECTURE LESSONS

### Lesson 1: The Monolithic App.jsx Problem
**What happened:** App.jsx grew to 8,099 lines with ~70 useState hooks, all views managed by internal state (`currentView`), not React Router.
**Impact:** Every change risked breaking unrelated features. A fix on line 5316 could break behavior on line 740.
**Rule for nursing track:** DO NOT add to App.jsx. Build nursing features as **separate components** in `src/Components/NursingTrack/`. Import them into App.jsx with the smallest possible integration point.

### Lesson 2: State-Based Routing is Fragile
**What happened:** Views controlled by `currentView` state instead of URL routes. Refreshing the page lost your place. Navigation persistence had to be hacked with localStorage.
**Impact:** Debugging was hell — couldn't link to a specific view, couldn't tell what state the app was in.
**Rule for nursing track:** If adding new views, prefer proper React Router routes over state-based view switching. If you must use the existing state pattern, document exactly which states you're adding and why.

### Lesson 3: Edge Functions Need Error Handling
**What happened:** Supabase Edge Functions (AI feedback, checkout, webhooks) would fail silently. 40% failure rate on question generation.
**Fix:** Added retry logic (3 attempts, delays: 0s/1s/2s), only charge usage AFTER success.
**Rule for nursing track:** Any new Edge Function must include:
- Retry logic (3 attempts with backoff)
- Explicit error responses (not silent failures)
- Console logging for every attempt
- Never charge/track usage before confirmed success

---

## 🎤 SPEECH RECOGNITION / MICROPHONE LESSONS

### Lesson 4: iOS Safari Microphone is Special
**What happened:** Mic worked on Chrome desktop but broke on iOS Safari. Start/stop sounds are OS-level and cannot be suppressed.
**Fix:** Keep mic session open continuously — start once, pause/resume processing, stop only on exit. Reinitialize fresh recognition object on each new session (not reuse stale one).
**Rule for nursing track:** If nursing track uses speech features (mock interview), inherit the existing mic lifecycle exactly. Do NOT create a new speech recognition implementation. Use the same `recognitionRef`, same `startListening`/`stopListening`, same cleanup.

### Lesson 5: getUserMedia Requires User Gesture on Mobile
**What happened:** Trying to start mic programmatically (not from a click handler) silently fails on iOS.
**Fix:** Always trigger mic from direct user interaction (button click/touch).
**Rule:** Never auto-start mic. Always require explicit user tap.

### Lesson 6: Recognition "Already Started" Errors
**What happened:** Rapid spacebar presses caused `recognition.start()` to fire while already running → `InvalidStateError`.
**Fix:** Guard with `isListeningRef.current` check before calling `.start()`. Handle `no-speech` error gracefully (it's expected, not a real error). Handle `aborted` error with state reset.
**Rule:** Always check listening state before starting. Always handle these error types gracefully.

### Lesson 7: Mic Cleanup Between Sessions
**What happened:** Ending an interview and starting a new one broke the mic — stale recognition object.
**Fix:** Full cleanup sequence: stop recognition → remove event listeners → null the ref → reinitialize fresh on next session start. Add 100ms delay before starting new recognition to let browser release audio.
**Rule:** Every session transition must fully clean up and reinitialize speech recognition.

---

## 💰 BILLING / STRIPE LESSONS

### Lesson 8: Charge AFTER Success, Never Before
**What happened:** Usage counter incremented before API call. If call failed (40% of the time), user lost a credit for nothing.
**Fix:** Check limits before allowing action → make API call → only increment on success → if all retries fail, charge zero.
**Rule:** This pattern is sacred. The nursing track must follow the exact same flow:
```
1. Check if user has credits (gate the button)
2. User clicks
3. API call with retry
4. Wait for success
5. Only then increment usage
6. If all retries fail → user charged ZERO
```

### Lesson 9: Beta Users Need Unlimited Access
**What happened:** Beta testers (in Supabase `beta_testers` table) were hitting free tier limits during testing.
**Fix:** Check beta status before limit enforcement. Beta = unlimited.
**Rule:** The nursing track must respect the same beta_testers table.

### Lesson 10: Stripe Webhook Must Be Verified
**What happened:** Webhook needed proper signing secret verification. Without it, anyone could fake a payment event.
**Setup chain:** Create webhook in Stripe Dashboard → get signing secret (whsec_...) → set in Supabase secrets → verify signature in Edge Function.
**Rule:** If nursing track has separate pricing, it must go through the existing Stripe infrastructure — NOT a new parallel system.

---

## 🐛 BUG FIX METHODOLOGY LESSONS

### Lesson 11: Never Fix What You Can't See
**What happened:** Multiple times, Claude made fixes based on partial file context (couldn't see the full 8,099-line App.jsx). Result: syntax errors, unclosed tags, duplicate code blocks.
**Fix:** V.S.A.F.E.R.-M protocol — always verify baseline first, always see the actual code before changing it.
**Rule for Claude Code:** You have full filesystem access. USE IT. Read the actual file. Don't guess. Don't assume. `cat` the file, `grep` for the function, see the real code.

### Lesson 12: One Bug at a Time
**What happened:** Trying to fix multiple bugs in one session led to cascading failures — fix for Bug A broke the context for Bug B.
**Fix:** Strict single-bug scoping. Fix one thing, test it, confirm it works, then move to the next.
**Rule:** Same applies to feature building. Build one piece, verify it works, then build the next.

### Lesson 13: String Replacement Typos Are Real
**What happened:** Manual find-and-replace in large files introduced typos — wrong line ranges, missed closing brackets, duplicate paste.
**Fix:** V.S.A.F.E.R.-M exact-line accounting + sandbox-first approach.
**Rule for Claude Code:** Use proper file operations. Don't do massive string replacements. Create new files, test them, then integrate.

### Lesson 14: Rollback Must Always Be Possible
**What happened:** Broke production with a bad deploy. Had to `git revert` to get the app working for beta tester Jacob.
**Rule:** Always know what commit you're working from. Always be able to `git revert` or `git checkout` to a known-good state. Feature branches exist for this reason.

### Lesson 15: Regression Checklists Are Non-Negotiable
**What happened:** Fixed chart dot click handling (pointerEvents fix for iOS Safari) and almost broke desktop hover animations.
**Fix:** R in V.S.A.F.E.R.-M — list 3-7 specific things your change could break, tied to specific mechanisms (not generic warnings).
**Rule:** After building any nursing track feature, provide a specific regression checklist tied to the existing features it could affect.

---

## 📱 MOBILE / CROSS-PLATFORM LESSONS

### Lesson 16: Test on iOS Safari Early and Often
**What happened:** Features worked perfectly on Chrome desktop but broke on iOS Safari — mic issues, touch event issues (chart dots), CSS differences.
**Fix:** Always test touch events with both `onClick` AND `onTouchStart`/`onTouchEnd`. Use `<g>` wrapper with transparent hit targets for small SVG elements.
**Rule:** If building any interactive nursing track UI, assume iOS Safari will behave differently and design for it from the start.

### Lesson 17: Capacitor Adds Complexity
**What happened:** App runs on web (Vercel) and as native app (Capacitor for iOS/Android). Each platform has different payment flows (Stripe web vs Apple/Google IAP).
**Rule:** For now, the nursing track should work on web first. Don't worry about Capacitor-specific behavior during exploration. Flag anything that might need native consideration.

---

## 🔧 DEVELOPMENT WORKFLOW LESSONS

### Lesson 18: Context Loss Between Chat Sessions
**What happened:** Moving between Claude chat sessions lost all context — had to re-explain the codebase, re-establish constraints, re-identify what was already fixed.
**Fix:** Created handoff documents, protocol documents, repo maps.
**Rule:** The D.R.A.F.T. protocol exists for this reason. At the end of every session, provide a summary of what was built, what works, what needs work.

### Lesson 19: Don't Trust AI-Generated Clinical Content
**What happened:** This is the entire reason for the walled garden model. AI confidently generates plausible-sounding clinical content that may be wrong. In a nursing context, wrong clinical information could harm patients.
**Rule:** THE cardinal rule of this project. AI coaches communication. Humans provide clinical content. No exceptions. No shortcuts. No "just this once."

### Lesson 20: Erin's Feedback Is Product Truth
**What happened:** Lucas and Claude built an elaborate vision with specialty matching, nursing school B2B, hospital partnerships. Erin (the actual clinical domain expert) cut through it: nurses know their specialty, schools won't buy this, hospitals aren't the right customer.
**Rule:** When Erin says no, it's no. When she raises a concern, it becomes a constraint. She understands the nursing audience in a way that engineering analysis cannot replicate.

---

## 📋 QUICK REFERENCE: PATTERNS TO USE

| Situation | Pattern | Source |
|-----------|---------|--------|
| API call to Edge Function | Retry 3x with backoff, charge after success | Lesson 3, 8 |
| Speech recognition | Inherit existing mic lifecycle, don't rebuild | Lesson 4, 5, 6, 7 |
| New UI component | Separate file in Components/, minimal App.jsx touch | Lesson 1 |
| New view/page | Prefer React Router route over state-based view | Lesson 2 |
| Mobile interaction | Test iOS Safari, use touch events + click events | Lesson 16 |
| Any clinical content | Human-validated only, source-cited, never AI-generated | Lesson 19 |
| Bug fix | V.S.A.F.E.R.-M (one bug, verify baseline, exact lines) | Lesson 11-15 |
| Feature exploration | D.R.A.F.T. (branch, new files only, track for merge) | Lesson 14, 18 |

---

## 📋 QUICK REFERENCE: PATTERNS TO AVOID

| Anti-Pattern | Why | Lesson |
|-------------|-----|--------|
| Adding code to App.jsx | It's already 8,099 lines. Every line added increases risk | 1 |
| Silent API failures | Users think it worked when it didn't | 3 |
| Charging before success | Users pay for nothing | 8 |
| Rebuilding speech from scratch | Months of iOS Safari fixes would be lost | 4-7 |
| Fixing multiple things at once | Cascading failures | 12 |
| Guessing at code you haven't read | Typos, wrong assumptions, broken output | 11 |
| AI-generated clinical content | Patient safety risk, credibility risk, legal risk | 19 |
| Ignoring Erin's feedback | She's the domain expert, period | 20 |

---

*Compiled from 3+ months of InterviewAnswers.AI development — Lucas & Claude, February 2026*
*Every lesson here was learned the hard way. Don't repeat them.*

### Battle Scar: Ideal Answer hallucination
The Example Strong Answer prompt had no constraints on what facts the AI could use. It hallucinated HIPAA, patient data, and flu season for a fintech analytics answer because it saw 'Stanford' and assumed healthcare. Fix: added 6 IDEAL ANSWER RULES modeled on the nursing walled garden — ONLY use facts from the user's actual exchanges, NEVER invent context. Same principle as C.O.A.C.H.: constrain what the AI can generate.

### Battle Scar: AI Interviewer exchangeCount is 0-indexed
exchangeCount starts at 0, increments AFTER each response. So >= 3 check fires on the 4th user submission, not the 3rd. Self-efficacy addendum and consolidated ideal answer both fire at exchangeCount >= 3.

### Battle Scar: Nursing previousScores uses averaged scores
NursingPracticeMode.jsx line 188 creates [avg, avg, avg] instead of real per-session scores. Works for Phase 1. Replace with actual Supabase query in Phase 3 when IRS is wired up. Flagged by Erin.
