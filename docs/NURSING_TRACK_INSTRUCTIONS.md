# NURSING_TRACK_INSTRUCTIONS.md — Nursing Interview Track Operating Manual
# Read this file FULLY before writing any nursing track code.
# This supplements (does NOT replace) the existing CLAUDE.md.

---

# PART 1: WHAT WAS ALREADY BUILT (Current State)

## Files Created on feature/nursing-track Branch
All in `src/Components/NursingTrack/`:
- `nursingQuestions.js` (495 lines) — Placeholder question library, 8 specialties, 5 frameworks
- `SpecialtySelection.jsx` (142 lines) — 8 specialty cards with descriptions
- `NursingDashboard.jsx` (241 lines) — Home base with 4 practice modes
- `NursingMockInterview.jsx` (474 lines) — Chat-based mock interview, calls ai-feedback Edge Function
- `NursingTrackApp.jsx` (165 lines) — Internal router for the nursing flow
- `NursingLandingPage.jsx` (423 lines) — NurseInterviewPro.ai marketing page
- `docs/nursing_db_schema.sql` (231 lines) — Database schema design

## Routes Added to App.jsx (4 lines only)
- `/nursing` — Protected route (requires auth) → NursingTrackApp
- `/nurse` — Public landing page → NursingLandingPage
- Both are lazy-loaded and code-split. Zero impact on existing users.

## What Works Now
- Full UI flow: specialty selection → dashboard → mock interview
- AI chat calls existing ai-feedback Edge Function with fetchWithRetry
- Build compiles cleanly
- Routes serve on localhost:3000

## What's NOT Wired Yet
- Speech recognition (mic) — must inherit from App.jsx, NOT rebuild
- Usage tracking / credit system
- Auth-aware user state inside nursing components
- Real question content (all placeholders)
- Resources/reference page
- STAR coaching integration
- Practice mode, SBAR drill, behavioral mode (ComingSoon placeholders)

---

# PART 2: PRODUCT DECISIONS (LOCKED)

## Erin's Constraints (Co-founder, Clinical Domain Expert)
- ✅ Individual nurses as target market (B2C)
- ✅ Staffing agencies — maybe later
- ✅ Walled garden model
- ❌ NO nursing schools as customers
- ❌ NO hospitals as customers
- ❌ NO specialty matching feature (nurses know their specialty)
- ❌ NO separate app (track inside InterviewAnswers.AI)
- ⚠️ Don't be patronizing about "needing more experience" — guide constructively

## This Is a Solo Build
Lucas is building this alone. There is no advisory board yet. The MVP needs to be compelling enough to recruit board members. Build for demo quality — functional on localhost, not production-ready.

---

# PART 3: CONTENT SOURCING — LEGAL FRAMEWORK

## What's Legally Free to Use
Interview questions are NOT copyrightable. "Tell me about a time you recognized a patient was deteriorating" is a question concept — no one owns it.

Clinical frameworks are published public knowledge:
- **SBAR** — developed by DoD/Kaiser Permanente, freely disseminated across healthcare
- **Nursing Process** (Assess, Diagnose, Plan, Implement, Evaluate) — foundational nursing education
- **Maslow's Hierarchy** — public domain
- **ABC Prioritization** (Airway, Breathing, Circulation) — universal clinical concept
- **NCSBN Clinical Judgment Measurement Model** — publicly published framework

## Legitimate Public Sources to Reference and Link To
- NCSBN NCLEX-RN Test Plan (free public PDF)
- CDC clinical guidelines (public domain — government works)
- NIH / PubMed open-access articles
- CMS guidelines (public domain)
- WHO frameworks (public)
- State Boards of Nursing scope-of-practice documents (public)
- Joint Commission National Patient Safety Goals (public)
- IHI SBAR Toolkit (freely available)
- Professional association public resources (ANA, ENA, AACN)

## What NOT to Do
- Do NOT reproduce copyrighted textbook content (Lippincott, Elsevier, etc.)
- Do NOT copy proprietary question banks (UWorld, Kaplan, Hurst)
- Do NOT copy paid course materials
- DO reference frameworks by name and cite them
- DO link to free public resources
- DO write original evaluation rubrics (that's our IP)
- DO write original coaching prompts (also our IP)

## How Citations Work In-App
When the AI references a framework in feedback, the user sees:
> "Your answer demonstrated strong SBAR structure (Source: IHI, SBAR Communication Framework)"

Every question in the library has metadata: framework source, author, reviewer, review date. That metadata powers the citations. No other interview prep tool does this.

---

# PART 4: AI CONVERSATION ARCHITECTURE

## The C.O.A.C.H. Protocol — How the AI Conducts Interviews

### C — CONTEXT SET
AI opens every session with framing:
> "I'm going to ask you questions you'd encounter in a [specialty] nurse interview. Answer as you would in a real interview — draw from your actual clinical experience. I'll give you feedback on how to strengthen your responses. Ready?"

### O — ONLY CURATED QUESTIONS
Questions come from the content library database. The AI NEVER generates its own clinical scenarios. It selects questions tagged to the user's chosen specialty and difficulty level.

### A — ASSESS COMMUNICATION (Not Clinical Accuracy)
After each answer, evaluate on these dimensions ONLY:
- **STAR structure** — Did they frame Situation, Task, Action, Result?
- **Specificity** — Did they give concrete details or stay vague?
- **Clinical reasoning narrative** — Did they walk through their thought process?
- **Outcomes** — Did they include measurable results?
- **Authenticity** — Does it sound like a real experience or rehearsed?

The AI does NOT evaluate whether the clinical content is medically correct. That's not its job.

### C — COACH WITH LAYERS
Feedback follows this structure every time:
1. **What was strong** — "You gave a specific patient scenario with a clear intervention — that's exactly what interviewers want to hear."
2. **What to improve** — "You jumped from the situation to the result. Walk the interviewer through your clinical reasoning — what did you assess first, what made you escalate?"
3. **Optional retry** — "Want to try that answer again with more detail on your assessment process?"

### H — HANDLE FOLLOW-UPS AND BOUNDARIES
**Dynamic follow-ups** (like a real interviewer):
> "You mentioned you called a rapid response. Walk me through what you saw that triggered that decision."

These probe deeper into the ANSWER, not into new clinical territory.

**Out-of-scope redirect** (when user asks clinical questions):
> "That's a great clinical knowledge area. For protocol-specific review, check your facility guidelines or resources like UpToDate. Let's focus on how you'd articulate that experience in an interview — that's what will land the job."

NEVER: "Actually, the correct protocol for sepsis is..." That crosses the walled garden line.

---

# PART 5: WHAT NEEDS TO BE BUILT NEXT

## Priority 1: Wire Existing App.jsx Functions to Nursing Track
Transfer these from the main app WITHOUT modifying App.jsx:
- **Speech recognition** — Inherit mic lifecycle (recognitionRef, startListening, stopListening). DO NOT rebuild. Pass as props or use context.
- **STAR coaching** — The same STAR evaluation logic used in practice mode
- **Usage tracking** — Same credit system, charge-after-success pattern
- **User state** — Auth-aware components that know the user's tier, name, usage

**APPROACH:** Create a NursingTrackProvider context that receives these functions from the parent ProtectedRoute/App level and distributes them to nursing components. This avoids modifying App.jsx internals — you're just passing what already exists.

## Priority 2: Build Real Question Library
Replace placeholder questions with real content sourced from:
- Publicly available nursing interview question collections
- NCSBN competency domains mapped to interview scenarios
- Framework-tagged evaluation rubrics (original — this is our IP)
- Each question needs: specialty, framework, difficulty, evaluation criteria, sample strong answer outline

## Priority 3: Resources & Reference Page
A "Resources" section inside the nursing track that links to legitimate free sources:
- NCSBN NCLEX-RN Test Plan (PDF link)
- CDC clinical guidelines
- IHI SBAR Toolkit
- Open-access nursing journals (PubMed)
- State Board scope-of-practice documents
- Joint Commission National Patient Safety Goals
- Professional association resources (ANA, ENA, AACN)

This reinforces the walled garden: "We help you communicate. These are where you learn the clinical substance."

## Priority 4: Polish the AI Mock Interview
- Implement C.O.A.C.H. protocol in the system prompt
- Wire speech recognition for voice input
- Add session summary at end (strengths, areas to improve, recommended resources)
- Add question difficulty progression (start easier, advance based on performance)
- Show framework citations in feedback

## Priority 5: Mode Switching
Users need to navigate between general interview prep and nursing track:
- Simple toggle or menu item inside the app
- "Switch to Nursing Track" / "Switch to General Prep"
- Remember user's last mode preference

---

# PART 6: THREE PROTOCOLS

## Protocol 1: D.R.A.F.T. — Feature Exploration

### D — DIVERGE FROM MAIN
- Work on feature branch only. State branch name at start of every session.

### R — RESTRICT TO NEW ADDITIONS
- CREATE new files ✅ | EXTEND config minimally ✅
- DO NOT modify existing components ❌ | DO NOT refactor ❌
- If you must touch an existing file, document: file, lines ADDED, why

### A — ALIGN WITH PRODUCT DECISIONS
- Check against Erin's approved/rejected list before building anything

### F — FREE TO EXPERIMENT
- Try approaches, build rough, iterate, throw away if needed

### T — TRACK FOR MERGE
- End of session: list new files, existing files touched, what works, what doesn't

---

## Protocol 2: V.S.A.F.E.R.-M — Production Bug Fixes (NOT for nursing track work)

- V: Verify baseline before touching code
- S: Scope-locked to specific bug
- A: Additive, no refactors
- F: Function-preserving, assume recent fixes fragile
- E: Exact-line accounting with BEFORE/AFTER
- R: Regression-aware (3-7 specific risks with mechanisms)
- M: Merge-gated (sandbox → self-check → integrate → checklist)

---

## Protocol 3: C.O.A.C.H. — AI Interview Conversation Design

- C: Context set (frame the session)
- O: Only curated questions (never AI-generated scenarios)
- A: Assess communication (not clinical accuracy)
- C: Coach with layers (strong → improve → retry)
- H: Handle follow-ups and boundaries (probe answers, redirect clinical questions)

Use this when writing or modifying the AI system prompt for the nursing mock interviewer.

---

## HARD STOP RULE (All Protocols)
If you need to change shared utilities, global config, routing architecture, app-wide state, authentication, or billing logic → **STOP AND ASK FIRST.**

---

# PART 7: BATTLE SCARS — Critical Lessons

## Architecture
1. **App.jsx is 8,099 lines.** Don't add to it. Build separate components.
2. **State-based routing is fragile.** Prefer React Router. Document any state additions.
3. **Edge Functions need retry logic.** 3 attempts, 0s/1s/2s backoff, charge after success only.

## Speech Recognition
4. **iOS Safari mic is special.** Keep session open, start once, pause/resume, stop on exit only.
5. **getUserMedia needs user gesture on mobile.** Never auto-start mic.
6. **Guard against "already started" errors.** Check isListeningRef before .start().
7. **Full cleanup between sessions.** Stop → remove listeners → null ref → reinit. 100ms delay.

## Billing
8. **Charge AFTER success, never before.** Check limits → API call → success → then charge.
9. **Beta users get unlimited access.** Check beta_testers table.
10. **Stripe webhook must be verified.** Use existing Stripe infrastructure, no parallel system.

## Methodology
11. **Never fix what you can't see.** Read the actual file first.
12. **One thing at a time.** Build one piece, verify, then next.
13. **String replacement typos are real.** Use proper file operations.
14. **Rollback must always be possible.** Know your commit. Use branches.
15. **Regression checklists required.** Specific risks with specific mechanisms.

## Mobile
16. **Test iOS Safari early.** Use both onClick AND onTouchStart/onTouchEnd.
17. **Capacitor adds complexity.** Web first, flag native considerations.

## Workflow
18. **Context loss between sessions.** This file exists for this reason.
19. **Don't trust AI-generated clinical content.** Cardinal rule. No exceptions.
20. **Erin's feedback is product truth.** When she says no, it's no.

---

# PART 8: PATTERNS REFERENCE

## USE These
| Situation | Pattern |
|-----------|---------|
| API call to Edge Function | Retry 3x with backoff, charge after success |
| Speech recognition | Inherit existing mic lifecycle, don't rebuild |
| New UI component | Separate file in Components/NursingTrack/ |
| AI conversation | C.O.A.C.H. protocol |
| Clinical content | Human-curated, publicly sourced frameworks, cite sources |
| New view/page | Prefer React Router over state-based |
| Feature exploration | D.R.A.F.T. protocol |
| Bug fix | V.S.A.F.E.R.-M protocol |

## NEVER Do These
| Anti-Pattern | Why |
|-------------|-----|
| Add code to App.jsx | 8,099 lines, every line = risk |
| AI generates clinical content | Patient safety, legal, credibility |
| Rebuild speech recognition | Months of iOS fixes would be lost |
| Charge before API success | Users pay for nothing |
| Fix multiple things at once | Cascading failures |
| Copy proprietary content | Legal liability (UWorld, Kaplan, textbooks) |
| Skip regression checklist | Breaks go undetected |

---

*This file supplements the existing CLAUDE.md. Both should be read before every session.*
*Last updated: February 9, 2026*
