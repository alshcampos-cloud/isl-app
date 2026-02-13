# 🔒 CLAUDE CODE HANDOFF — NurseInterviewPro Feature Exploration
## InterviewAnswers.AI — Nursing Interview Track

**Date:** February 9, 2026
**Developer:** Lucas
**Transferred from:** Claude.ai strategic planning session
**Purpose:** Explore adding a nursing interview prep track to existing InterviewAnswers.AI codebase
**Status:** EXPLORATION ONLY — Nothing goes live

---

## ⚠️ CRITICAL RULES — READ FIRST

1. **NOTHING GOES LIVE.** We are exploring on a feature branch. Production must remain untouched.
2. **Do NOT create a separate app.** This is a new track/module INSIDE InterviewAnswers.AI.
3. **Erin's feedback is law.** See Section 3 below — she is the clinical domain expert and co-founder.
4. **V.S.A.F.E.R.-M is for bug fixes on production.** This exploration uses the **D.R.A.F.T. Protocol** (see Section 5).

---

## 1. WHAT EXISTS — InterviewAnswers.AI Current State

InterviewAnswers.AI is a live, deployed AI-powered interview preparation app with:
- **Live Prompter** — real-time coaching during practice
- **AI Mock Interviewer** — conversational interview simulation
- **STAR Method Coaching** — Situation-Task-Action-Result framework
- **Practice Mode** — self-paced interview prep
- **Stripe billing** — freemium model, $29.99/month Pro tier
- **Authentication system** — login/signup flow
- **Usage tracking** — monitors user activity and limits
- **Landing page** — recently added before login flow for conversion

Tech decisions, frameworks, and architecture will be identified from the actual codebase once loaded.

---

## 2. WHAT WE'RE BUILDING — Nursing Interview Track

### Concept
Add a **healthcare/nursing specialty track** inside InterviewAnswers.AI. Individual nurses land on a targeted marketing page (NurseInterviewPro.ai domain) that funnels them into the nursing experience within the main app.

### Architecture: The Walled Garden Model

**AI DOES (coaching engine):**
- Conducts mock interviews using questions from our curated content library
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

**The line:** The board writes the playbook (questions, scenarios, evaluation criteria). The AI runs the session (conducts interview, gives feedback, adapts, coaches delivery). No board member is available at 11pm when a nervous new grad needs to practice.

### Content Library (Human-Validated)
All clinical content must be:
- Written or reviewed by qualified nurses/nurse educators before reaching users
- Grounded in published frameworks (NCSBN Clinical Judgment Model, SBAR, Nursing Process, Maslow's, ABC prioritization)
- Tagged with metadata: author, reviewer, clinical framework source, review date
- Source-cited in-app — users see which framework their evaluation references

### Specialty Tracks (Phase 1 targets)
- Emergency Department (ED)
- Intensive Care Unit (ICU)
- Operating Room (OR)
- Labor & Delivery (L&D)
- Pediatrics
- Psych/Behavioral Health
- Med-Surg
- Travel Nursing

### Key Feature: Honest Gap Identification
When users consistently provide vague or generic answers lacking real clinical detail, the AI acknowledges it — but carefully (see Erin's feedback below).

### Redirect for Out-of-Scope Questions
If a user asks a direct clinical question (e.g., "What's the correct dose of epinephrine for anaphylaxis?"), AI responds:
> "That's a great clinical knowledge question, but I'm designed to help you communicate your knowledge effectively in interviews, not to serve as a clinical reference. For clinical questions, please refer to your facility protocols or resources like UpToDate."

---

## 3. ERIN'S FEEDBACK — THESE ARE CONSTRAINTS, NOT SUGGESTIONS

Erin is a healthcare infection prevention professional at Stanford Health Care. She is the clinical domain expert and will serve as founding clinical advisor. Her feedback from reviewing the product vision:

### ✅ Approved
- **Individual nurses as target market** — Yes, this is the right audience
- **Staffing agencies** — Maybe, worth exploring later
- **Walled garden model** — the AI coaches communication, board provides content (her clarifying question helped sharpen this)

### ❌ Rejected
- **Nursing schools as customers** — No. Don't pursue B2B to schools.
- **Hospitals as customers** — No. "Not where we should be advocating."
- **Specialty matching feature** — No. "You normally want to work in a specific area already." Nurses know what specialty they want. Don't tell them where to go.
- **Separate app** — No. Keep it inside InterviewAnswers.AI as a track/module. Use NurseInterviewPro.ai as a marketing landing page that funnels into the main app.

### ⚠️ Handle With Care
- **"You just need more experience" messaging** — Be very careful here. Don't be patronizing. If someone has gaps, guide them constructively. Don't gatekeep with a condescending tone. Frame as support, not judgment.

### 🔑 Key Question She Raised (Answered)
> "How many questions would be AI vs. Nurses review board? If all questions are produced by the board, what's the point of AI?"

**Answer:** The board creates the CONTENT (questions, scenarios, rubrics). The AI creates the EXPERIENCE (conducts the interview, gives real-time feedback, adapts to responses, coaches delivery, is available 24/7). They serve completely different functions. Think of it like: a textbook author writes the material, but a tutor helps you learn it. We need both.

---

## 4. PRODUCT DECISIONS ALREADY MADE

| Decision | Choice | Reason |
|----------|--------|--------|
| Separate app vs. module | Module inside InterviewAnswers.AI | Erin's input + one codebase, one billing system, baby on the way |
| Marketing approach | NurseInterviewPro.ai landing page → funnels into main app | Targeted messaging without separate codebase |
| Primary market | Individual nurses (B2C) | Erin confirmed; 200K+ annual demand |
| Secondary market | Staffing agencies (maybe later) | Erin said maybe |
| NOT pursuing | Nursing schools, hospitals (B2B) | Erin rejected |
| Clinical content | Human-validated library only | Walled garden — AI never generates clinical content |
| AI role | Communication coaching engine | Feedback on delivery, structure, specificity — not clinical evaluation |
| Specialty matching | Removed | Erin rejected — nurses already know their specialty |
| Pricing | $39-49/month (or fold into existing Pro tier) | TBD based on exploration |

---

## 5. THE D.R.A.F.T. PROTOCOL — Exploration Mode

This is NOT V.S.A.F.E.R.-M. That protocol is for surgical fixes on live production code. D.R.A.F.T. is for safe, creative exploration of new features.

### D — DIVERGE FROM MAIN
Before writing ANY code:
1. Create a new feature branch: `feature/nursing-track` (or similar)
2. Confirm you are NOT on `main`, `master`, or any production/deploy branch
3. Never commit to production branches during exploration
4. State the branch name at the start of every coding session

### R — RESTRICT MODIFICATIONS TO NEW ADDITIONS
Protect the existing codebase:
- **CREATE** new files, new components, new routes, new modules ✅
- **EXTEND** existing config files minimally if needed (e.g., adding a route) ✅
- **DO NOT** modify existing production components, pages, or utilities ❌
- **DO NOT** refactor, rename, or reorganize existing code ❌
- **DO NOT** change shared state, global config, authentication, billing, or routing logic ❌

If you MUST touch an existing file (e.g., to add a route entry), document:
- File name
- Exact lines added (not modified — ADDED)
- Why it can't be done without touching this file

**HARD STOP RULE (same as V.S.A.F.E.R.-M):**
If you need to change shared utilities, global config, routing architecture, app-wide state, authentication, or billing logic → STOP AND ASK FIRST.

### A — ALIGN WITH PRODUCT DECISIONS
Before building anything, verify it doesn't conflict with:
- Erin's approved/rejected list (Section 3)
- The walled garden model (AI coaches communication, never generates clinical content)
- The decision to build inside InterviewAnswers.AI (not a separate app)
- The target market (individual nurses, B2C)

If you're unsure whether a feature aligns, ASK before building.

### F — FREE TO EXPERIMENT
Unlike V.S.A.F.E.R.-M, we WANT creative exploration here:
- Try different UI approaches for the nursing track
- Experiment with prompt engineering for clinical interview coaching
- Build rough prototypes — they don't need to be production-ready
- Iterate quickly — build, review, adjust
- It's okay to build something and throw it away

The goal is to SEE what this could look like, not to ship it.

### T — TRACK FOR FUTURE MERGE
Document what you build so we can make informed merge decisions later:
- Maintain a running list of new files created
- Note any existing files that were touched (and why)
- Flag anything that would need production consideration before merge (e.g., new dependencies, environment variables, API changes)
- At the end of each session, provide a summary:
  - What was built
  - What works
  - What needs more work
  - What should be thrown away

---

## 6. EXPLORATION PRIORITIES

### Phase 1: See What We're Working With
1. Load and understand the existing InterviewAnswers.AI codebase
2. Map the architecture — file structure, routing, state management, component patterns
3. Identify natural extension points for a nursing track
4. Document findings before writing any new code

### Phase 2: Nursing Track Skeleton
1. New route/page for nursing interview experience
2. Specialty selection (ED, ICU, OR, L&D, etc.)
3. How nursing-specific questions feed into the existing mock interviewer
4. How the existing STAR coaching adapts for clinical scenarios

### Phase 3: Landing Page Concept
1. NurseInterviewPro.ai landing page design/copy
2. Funnel flow: landing page → signup/login → nursing track in main app
3. Messaging that speaks directly to nurses without confusing general users

### Phase 4: Content Architecture
1. Database schema for clinical content library
2. How questions are stored, tagged, and served (specialty, framework, difficulty)
3. Metadata structure (author, reviewer, source, review date)
4. How source citations appear in-app during sessions

---

## 7. WHAT SUCCESS LOOKS LIKE

At the end of this exploration, we should be able to:
- Show Erin a working prototype of the nursing track inside InterviewAnswers.AI
- Demonstrate how clinical content flows from the curated library into an AI-coached session
- Have a clear picture of what needs to be built vs. what already exists
- Know the real engineering effort required to ship this
- Have a landing page concept for NurseInterviewPro.ai

---

## 8. PROTOCOLS REFERENCE

| Situation | Protocol | Purpose |
|-----------|----------|---------|
| Bug fix on live production code | **V.S.A.F.E.R.-M** | Surgical, defensive, minimal-touch |
| New feature exploration (this work) | **D.R.A.F.T.** | Creative, isolated, well-tracked |

Both protocols share the HARD STOP RULE: Don't touch shared utilities, global config, routing architecture, app-wide state, auth, or billing without asking first.

---

*Transferred from Claude.ai conversation — Lucas & Claude, February 9, 2026*
*Erin's feedback incorporated — she is co-founder and clinical domain expert*
