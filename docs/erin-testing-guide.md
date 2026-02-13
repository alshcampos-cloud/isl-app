# Erin's Clinical Review & Testing Guide
## NurseInterviewPro — Nursing Interview Track

**Date:** February 11, 2026
**Reviewer:** Erin (Clinical Domain Expert)
**URL:** localhost:3000/nursing (or deployed Vercel URL)
**Time needed:** ~60-90 minutes for full review

---

## What You're Looking At

This is the nursing interview prep track inside InterviewAnswers.AI. It has **9 practice modes** across **8 nursing specialties**. The AI coaches communication and delivery — it does NOT generate clinical content or evaluate clinical accuracy.

Everything you're reviewing today was built on the "walled garden" model you approved: **humans create the content, AI creates the experience.**

---

## How to Navigate the App

The app flows like this:

```
localhost:3000/nursing
        ↓
┌─────────────────────────────┐
│   SPECIALTY SELECTION       │  ← First screen. Pick one of 8 specialties.
│   (ED, ICU, OR, L&D, etc.) │     Each card shows how many questions it has.
└──────────────┬──────────────┘
               ↓
┌─────────────────────────────┐
│   DASHBOARD                 │  ← Your home base after picking a specialty.
│                             │
│   ┌── Stat Cards ──────┐   │  Total Sessions | Avg Score | Practiced | Streak
│   │  (click any card   │   │  Clicking ANY stat card → Command Center
│   │   → Command Center)│   │
│   └────────────────────┘   │
│                             │
│   ┌── Practice Modes ──┐   │  7 mode cards arranged in a 2-column grid:
│   │  Mock Interview     │   │  Click any card to enter that mode.
│   │  Quick Practice     │   │
│   │  SBAR Communication │   │
│   │  Flashcards         │   │
│   │  AI Interview Coach │   │
│   │  Confidence Builder │   │
│   │  Offer Negotiation  │   │
│   └────────────────────┘   │
│                             │
│   ┌── Progress Summary ─┐  │  (only shows after you've done some practice)
│   │  Readiness Score     │  │  Interview Readiness ring + Score Trend + Frameworks
│   │  Score Trend chart   │  │
│   │  Framework Confidence│  │
│   └─────────────────────┘  │
│                             │
│   ┌── Recent Activity ──┐  │  Last 5 sessions with scores
│   │  "View All →"       │──┤──→ goes to Command Center
│   └─────────────────────┘  │
│                             │
│   [ Command Center button ]─┤──→ Command Center (analytics + Question Bank)
│   [ Resources button ]──────┤──→ Clinical Resources & References
│                             │
│   Walled Garden Notice      │  "About Our Content" disclaimer
└─────────────────────────────┘
```

**Top nav bar** (always visible):
- **General / Nursing toggle** — switches between the main app and nursing track
- **Specialty indicator** — shows which specialty you picked + "Change" link
- **User info** — your name and tier (Free / Pro / Beta)

**To change specialty:** Click "Change" in the top nav bar (takes you back to Specialty Selection).

---

## Part 1: Question Bank Review (The Clinical Gold)

### Where to find ALL the questions in the app:

**Method 1 — Command Center Question Bank (best for browsing):**
1. From the Dashboard, click **any stat card** (Total Sessions, Avg Score, etc.) OR scroll down and click the **"Command Center"** button
2. In Command Center, click the **"Question Bank"** tab (second tab)
3. You'll see every question listed with category badges and framework tags
4. **Filter options** at the top: by Category (Motivation, Behavioral, etc.), by Framework (STAR/SBAR), and by Status (Mastered/Needs Review/Unattempted)
5. **Click any question to expand it** — you'll see:
   - The full question text
   - Key Points to Hit (bullet points the AI uses for coaching)
   - Follow-up questions
   - "My Best Answer" section where users can save their response

**Method 2 — Flashcards (great for reviewing one at a time):**
1. From the Dashboard, click **"Flashcards"** card in the Practice Modes section
2. Cards show the question on front, key talking points on back
3. Swipe through or use arrows to navigate

**Method 3 — During any practice mode:**
- Mock Interview, Quick Practice, and SBAR Drill all pull from the same question bank
- You'll encounter questions organically as you practice

### What to look for:
These are the questions nurses will practice with. You're checking whether they're **realistic, relevant, and complete enough** for each specialty.

### Current Question Inventory

**10 General Questions (all specialties get these):**

| # | Question | Category | Framework |
|---|----------|----------|-----------|
| 1 | Tell me about yourself and why you chose nursing | Motivation | STAR |
| 2 | Tell me about a time you had to advocate for a patient | Behavioral | STAR |
| 3 | Describe a time you made an error or near-miss. How did you handle it? | Behavioral | STAR |
| 4 | How do you prioritize when you have multiple patients with competing needs? | Clinical Judgment | STAR |
| 5 | Describe a situation where you used SBAR to communicate critical information | Communication | SBAR |
| 6 | Tell me about a time you had a conflict with a colleague. How did you resolve it? | Behavioral | STAR |
| 7 | Why are you interested in this specialty and this unit? | Motivation | STAR |
| 8 | How do you handle end-of-life care and supporting grieving families? | Communication | STAR |
| 9 | Describe your experience with electronic health records and clinical documentation | Technical | STAR |
| 10 | Tell me about a time you received critical feedback. How did you respond? | Behavioral | STAR |

**Specialty-Specific Questions:**

| Specialty | # Qs | Questions |
|-----------|-------|----------|
| **ED** | 3 | Managing sudden patient influx; Triage and acuity determination; Verbally aggressive/combative patients |
| **ICU** | 3 | Noticing subtle changes in critically ill patients; Family communication with poor prognosis; Managing multiple high-acuity drips/devices |
| **OR** | 2 | Surgical counts and time-outs; Sterile technique and breaks in sterility |
| **L&D** | 2 | Unexpected birth plan changes; Recognizing fetal status changes requiring escalation |
| **Peds** | 1 | Assessment and communication differences with pediatric patients |
| **Psych** | 1 | Therapeutic communication to de-escalate a patient in crisis |
| **Med-Surg** | 1 | Managing a full assignment without things falling through cracks |
| **Travel** | 2 | Adapting to new facilities; Identifying safety concerns at new facilities |

### Questions for Erin to Consider:

**Coverage gaps:**
- Are there obvious interview questions missing for any specialty?
- Which specialties feel too thin? (Peds, Psych, Med-Surg have only 1 specialty question each)
- Are there categories we're missing entirely? (Current: Motivation, Behavioral, Clinical Judgment, Communication, Technical)
- Should we add questions about: charge nurse experience? Precepting? Floating to other units? Mandatory overtime?

**Quality of existing questions:**
- Do the questions feel like real interview questions you'd hear at Stanford?
- Are any too vague? Too broad? Too narrow?
- Are the follow-up prompts realistic?
- Do the "key points to hit" (bullet points) capture what a strong answer actually includes?

**Difficulty calibration:**
- Are beginner/intermediate/advanced labels accurate?
- Would a new grad vs. 5-year nurse vs. 10-year nurse experience these differently?

**Framework assignments:**
- Are the right questions tagged as SBAR vs. STAR?
- Should any STAR questions actually be SBAR (clinical scenario framing)?

---

## Part 2: Test Each Practice Mode

All 7 practice modes are accessible from the **Dashboard** in the "Practice Modes" section (the 2-column grid of cards right below the stat cards). Click any card to enter that mode. Every mode has a **back arrow** in the top-left to return to the Dashboard.

### Mode 1: Mock Interview (Most Important)
**How to get there:** Dashboard → click **"Mock Interview"** card (first card, blue gradient, "Most Popular" badge)
**What it does:** Full AI-led interview simulation. AI asks questions, you answer, it coaches your delivery.

**Test this:**
1. Start a mock interview
2. Answer 2-3 questions naturally (use your real experience!)
3. Check: Does the AI feedback feel helpful? Is it coaching communication or overstepping into clinical territory?
4. Check: Does the scoring (1-5) feel calibrated? Is a "3" really average?
5. Try giving a vague answer on purpose — does the AI catch it and push for specifics?
6. Try mentioning a drug or dosage — does the AI stay in its lane (communication coaching) or start evaluating clinical accuracy?

**Red flags to watch for:**
- AI generating clinical scenarios you didn't mention
- AI saying something clinically inaccurate
- AI being patronizing or gatekeepy ("you need more experience")
- Feedback that's too generic to be useful

### Mode 2: Quick Practice
**How to get there:** Dashboard → click **"Quick Practice"** card (blue gradient)
**What it does:** One question at a time, quick feedback, rapid-fire practice.

**Test this:**
1. Answer 2-3 questions
2. Is the feedback concise but useful? (Should be ~4 sentences max)
3. Does scoring feel consistent with Mock Interview?

### Mode 3: SBAR Communication Drill
**How to get there:** Dashboard → click **"SBAR Communication"** card (green gradient, "New" badge)
**What it does:** Scores each SBAR component separately (1-10 each): Situation, Background, Assessment, Recommendation.

**Test this:**
1. Pick a clinical scenario question
2. Give a structured SBAR response
3. Check: Are the per-component scores (S, B, A, R) reasonable?
4. Try being weak on one component deliberately — does it catch the weak spot?
5. Is the feedback specific enough to actually improve each component?

**This is the mode Erin should stress-test most** — the SBAR scoring rubric is the most clinically-adjacent feature.

### Mode 4: AI Interview Coach
**How to get there:** Dashboard → click **"AI Interview Coach"** card (purple gradient, "New" badge)
**What it does:** Free-form coaching chat. Ask anything about interview prep.

**Test this:**
1. Ask: "How should I talk about my infection prevention experience in an interview?"
2. Ask: "What's the correct dose of vancomycin?" (Should redirect — walled garden test)
3. Ask: "I'm nervous about panel interviews. Any tips?"
4. Check: Is the coaching genuinely helpful or generic?

### Mode 5: Confidence Builder
**How to get there:** Dashboard → click **"Confidence Builder"** card (orange/amber gradient, "New" badge)
**What it does:** 4-step flow: Background Profile > Evidence File > AI Confidence Brief > Pre-Interview Reset.

**Test this:**
1. Fill out the background profile with your real experience
2. Review the AI-generated confidence brief
3. Check: Does it feel personalized to YOUR experience, not generic?
4. Check: Does it stay in communication coaching territory?

### Mode 6: Offer Negotiation Coach
**How to get there:** Dashboard → click **"Offer Negotiation"** card (emerald/green gradient, "New" badge)
**What it does:** Practice negotiating salary/benefits. Scores confidence, professionalism, specificity, value framing, completeness.

**Test this:**
1. Try negotiating a scenario
2. Check: Does it avoid recommending specific dollar amounts? (It should redirect to BLS.gov, Glassdoor, etc.)
3. Is the "power phrase" rewrite actually better than what you said?

### Mode 7: Flashcards
**How to get there:** Dashboard → click **"Flashcards"** card (sky/blue gradient, "Free" badge)
**What it does:** Review questions with spaced repetition. No AI — just flip, review, mark confidence.

**Test this:**
1. Flip through a few cards
2. Are the bullet points on the back of each card helpful?

### Mode 8: Command Center
**How to get there:** Dashboard → click **any stat card** at the top (Total Sessions, Avg Score, Practiced, or Streak) OR scroll down and click the **"Command Center"** button near the bottom of the Dashboard
**What it does:** Analytics dashboard with 3 tabs: Progress, Question Bank, and Readiness Assessment.

**Test this:**
1. Click the **"Question Bank"** tab (second tab) — this is where ALL questions live
2. Use the **filter buttons** at the top to filter by Category, Framework, or Status
3. **Click any question to expand it** — see key points, follow-ups, and the "My Best Answer" save area
4. Try the **"My Best Answer"** feature — type an answer and click Save. This persists across sessions.
5. Click the **"Readiness"** tab (third tab) — check: Does the Readiness score formula make sense?
6. Click the **"Progress"** tab (first tab) — review session history and score trends

### Mode 9: Clinical Resources
**How to get there:** Dashboard → scroll to the bottom → click **"Clinical Resources & References"** button (just below the Command Center button)
**What it does:** Links to free public clinical resources (NCSBN, CDC, IHI, etc.)

**Test this:**
1. Are these the right resources?
2. Any missing that nurses would actually use?

---

## Part 3: Drawing Out Clinical Gold (Motivational Interviewing)

These questions are designed to help Erin surface insights that should be built into the product. **Not a quiz — a conversation.** Take notes.

### On the Questions Themselves

1. **"When you think about the last few nurses you interviewed at Stanford, what was the question that separated the strong candidates from the average ones?"**
   - (Looking for: questions we're missing, or angles on existing questions we haven't captured)

2. **"What's the most common mistake you see nurses make when answering behavioral interview questions?"**
   - (Looking for: coaching feedback the AI should be giving)

3. **"If you were prepping a nurse friend for an interview at your unit, what's the one thing you'd tell them to make sure they mention?"**
   - (Looking for: key talking points that should be in the bullet points)

4. **"Is there a type of question that trips up even experienced nurses?"**
   - (Looking for: where our difficulty calibration might be off, or questions we need to add)

### On Clinical Communication

5. **"What does a really good SBAR handoff sound like to you? What's the difference between a 6/10 and a 9/10?"**
   - (Looking for: calibration of our SBAR scoring rubric)

6. **"When a nurse gives you an SBAR and it's weak, which component is usually the problem?"**
   - (Looking for: coaching priorities in the SBAR drill)

7. **"What does 'clinical judgment' mean in an interview context? How does a nurse demonstrate it without reciting a textbook?"**
   - (Looking for: what the AI should reward in Clinical Judgment category answers)

### On the Walled Garden

8. **"Is there anything in the app where you thought 'the AI shouldn't be saying that' or 'that's not quite right clinically'?"**
   - (Looking for: walled garden breaches we need to fix)

9. **"If a nurse asks the AI 'what's the right treatment for sepsis?', what should the redirect actually say? Is our current redirect message good enough?"**
   - Current redirect: *"That's a great clinical knowledge question, but I'm designed to help you communicate your knowledge effectively in interviews, not to serve as a clinical reference. For clinical questions, please refer to your facility protocols or resources like UpToDate."*

10. **"Are there interview topics where the line between 'coaching communication' and 'evaluating clinical knowledge' gets blurry? Where should we be extra careful?"**
    - (Looking for: edge cases in the walled garden)

### On Missing Features / Content

11. **"What specialty are you most worried about in terms of content quality? Where do we need the most help?"**
    - (Looking for: priority for content expansion)

12. **"Should we have questions about infection prevention specifically? That's your world — what would those look like?"**
    - (Looking for: potential new category or specialty track)

13. **"Is there a clinical framework we're missing? We have NCSBN CJM, SBAR, Nursing Process/ADPIE, Maslow's, and ABC."**
    - (Looking for: framework gaps)

14. **"What about questions around workplace safety, staffing concerns, or 'tell me about a time you had to speak up'? Are those common in nursing interviews?"**
    - (Looking for: a potential "Professional Practice" category)

### On Tone and Approach

15. **"Does the app feel like it respects the nurse's intelligence and experience? Or does anything feel condescending?"**
    - (Erin's constraint: never be patronizing, never gatekeep)

16. **"If a brand-new grad used this vs. a 15-year ICU nurse, would both find it useful? Or does it skew toward one experience level?"**
    - (Looking for: whether we need experience-level differentiation)

---

## Part 4: Quick Bug Check

While testing, watch for:
- [ ] Pages that don't load or show errors
- [ ] Buttons that don't respond
- [ ] AI responses that take forever (>10 seconds)
- [ ] Scoring that seems wildly off
- [ ] Anything that looks broken on mobile (if testing on phone)
- [ ] Text that's cut off or hard to read

---

## How to Give Feedback

After testing, the most valuable things Erin can provide:

1. **Questions to add** — Even rough ideas. "They should ask about X" is gold.
2. **Bullet point corrections** — "The key points for question #4 are missing Y"
3. **Walled garden violations** — Any place the AI overstepped
4. **Tone issues** — Anything that felt patronizing, too clinical, or not clinical enough
5. **Priority order** — Which specialties need the most content work first?

---

*This guide was built from the current codebase as of Feb 11, 2026.*
*Branch: feature/nursing-track*
