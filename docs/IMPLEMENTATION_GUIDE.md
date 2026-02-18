# InterviewAnswers.AI — Implementation Guide

> How to turn the Master Strategy into working code.
> This is your playbook. Follow it phase by phase.

---

## How This Works

You have three things working together:

1. **This docs folder** → Lives in your repo, gives Claude Code persistent memory
2. **Claude Code** → Reads these docs, then builds each phase
3. **The Master Strategy v2.0** → The research bible (keep in `/docs/research/`)

Every Claude Code session starts the same way:

```
Read CLAUDE.md, then /docs/PROTOCOLS.md, /docs/PRODUCT_ARCHITECTURE.md,
and /docs/BATTLE_SCARS.md. Then read the phase prompt I'm working on.
Use the B.U.I.L.D. protocol for all work.
```

---

## Step 0: Set Up Your Repo (Do This Once)

### 0a. Copy the docs folder into your project

```bash
cd ~/Downloads/isl-complete    # or wherever your repo lives

# Create the docs structure
mkdir -p docs/prompts
mkdir -p docs/research

# Copy CLAUDE.md to project root
cp CLAUDE.md ./CLAUDE.md

# Copy all docs
cp docs/PROTOCOLS.md ./docs/
cp docs/PRODUCT_ARCHITECTURE.md ./docs/
cp docs/prompts/*.md ./docs/prompts/

# Put the Master Strategy in research folder
cp InterviewAnswersAI_Master_Strategy_v2_Definitive.docx ./docs/research/
```

### 0b. Create BATTLE_SCARS.md (if it doesn't exist)

```bash
touch docs/BATTLE_SCARS.md
```

Add your existing 20+ battle scars. If you don't have them written down yet, start with what you remember. Claude Code will add to this file as you work.

### 0c. Create CHANGELOG.md

```bash
touch CHANGELOG.md
```

### 0d. Commit everything

```bash
git add -A
git commit -m "docs: add implementation kit from Master Strategy v2.0"
```

---

## Step 1: Verify Your Current App Works

Before building anything new, make sure your live app is stable:

```
Open Claude Code.
Select your project folder.
Paste:

"Read CLAUDE.md and /docs/PROTOCOLS.md. Using V.S.A.F.E.R.-M protocol,
verify the current deployed app works:
1. Can a user sign up?
2. Can a user complete a practice session?
3. Does AI feedback appear?
4. Does the usage dashboard load?
5. Can a user access their question bank?
Report any issues found. Do NOT fix anything yet — just report."
```

If there are broken things, fix them FIRST using V.S.A.F.E.R.-M before starting Phase 1.

---

## Step 2: Phase 1 — Feedback Redesign (Weeks 1–2)

**Why first:** Highest ROI. Changes AI prompts only. No new UI, no new architecture. Every user benefits immediately.

**Effort:** 3–5 evenings

**How:**

1. Open Claude Code
2. Select your project folder
3. Paste the contents of `/docs/prompts/PHASE_1_FEEDBACK_REDESIGN.md`
4. Claude Code will:
   - Read your codebase
   - Find the existing AI feedback call
   - Create `src/utils/selfEfficacyFeedback.js`
   - Integrate it with the existing feedback system
5. You review, test on iOS Safari, then deploy

**Test checklist:**
- [ ] Practice a question → get feedback → see all 4 self-efficacy sources
- [ ] Practice a second time → mastery source references improvement
- [ ] First-time user → no comparison data, still get all 4 sources
- [ ] iOS Safari works
- [ ] Nothing else broke

**When done:**
```bash
git add -A
git commit -m "feat: Phase 1 - self-efficacy feedback redesign (Huang & Mayer 2020)"
# Deploy to Vercel
```

---

## Step 3: Phase 2 — Archetype Onboarding (Week 2–3)

**Why second:** First impressions determine everything. Current onboarding is generic.

**Effort:** 1 weekend

**How:**

1. Open Claude Code
2. Paste `/docs/prompts/PHASE_2_ARCHETYPE_ONBOARDING.md`
3. Claude Code creates the 5-screen flow
4. You review, test, deploy

**Key decision:** The breathing exercise on Screen 2 is what differentiates you from every competitor. Don't skip it.

---

## Step 4: Phase 3 — Streaks + IRS (Weeks 3–5)

**Why third:** Retention mechanics that compound daily. The IRS score becomes the number users care about.

**Effort:** 2 weekends

**How:**

1. Open Claude Code
2. Paste `/docs/prompts/PHASE_3_STREAKS_IRS.md`
3. Claude Code creates streak tracking + IRS calculation + progress ring UI
4. You review, test (especially iOS Safari), deploy

**Critical:** Store streak and IRS data in Supabase, NOT localStorage. iOS Safari clears localStorage unpredictably (Battle Scar #5).

---

## Step 5: Phase 4 — Your Best Answer Engine (Week 5–6)

**Why fourth:** Immediate value for Urgent Seekers. Vicarious learning source.

**Effort:** 1 weekend

**Claude Code prompt:**
```
Read CLAUDE.md and all /docs/ files. Using B.U.I.L.D. protocol:

Create a "Your Best Answer" feature for the Question Bank.

For each question in the user's Question Bank, generate an AI-composed
ideal STAR answer using the user's experience data (job title, industry,
years of experience from their profile).

Create: src/Components/QuestionBank/YourBestAnswer.jsx
Create: src/utils/bestAnswerGenerator.js

The AI generates the answer on-demand (button press), not pre-computed.
Store generated answers in Supabase so they're not regenerated each time.
Show the answer in a collapsible panel below the question.

Pro feature only — free tier users see a blurred preview with upgrade CTA.

DONE: User clicks "Show Best Answer" → AI generates STAR answer → 
answer persists in database → free users see blurred version.
```

---

## Step 6: Phase 5 — Interview Confidence Lab (Weeks 6–10)

**Why fifth:** This is the product's soul. The 14-day progressive desensitization program.

**Effort:** 3–4 weekends

**This is the biggest build.** See Appendix B of the Master Strategy for the full 14-day specification. Create a separate prompt file:

```bash
# Create the prompt
touch docs/prompts/PHASE_5_CONFIDENCE_LAB.md
```

Then fill it with the Day 1–14 spec from the Master Strategy, formatted like the other phase prompts.

---

## Phases 6–10 (Weeks 10+)

| Phase | What | Prompt |
|-------|------|--------|
| 6 | Pricing tier update (add Mastery to Stripe) | 1 weekend |
| 7 | Nursing Track education (SBAR + micro-lessons) | 2–3 weekends |
| 8 | Analytics (Mixpanel/PostHog) | 1 evening |
| 9 | Push notifications (service worker) | 1 weekend |
| 10 | Ad creative launch (Meta Ads) | $500 budget, parallel |

Create prompt files for each as you reach them. The pattern is always the same: protocol, research basis, business case, unit of change, done criteria, do-not list.

---

## Rules for Every Claude Code Session

1. **Always start by reading docs.** Paste: "Read CLAUDE.md, /docs/PROTOCOLS.md, /docs/PRODUCT_ARCHITECTURE.md, and /docs/BATTLE_SCARS.md first."

2. **One phase at a time.** Never work on Phase 3 while Phase 2 is unfinished.

3. **Branch first.** `git checkout -b feature/phase-N-description`

4. **New files, not edits.** Claude Code should create new files. Only touch App.jsx for import statements and render calls.

5. **Test on iOS Safari.** Every time. Battle Scar #5.

6. **Update Battle Scars.** When something breaks or surprises you, add it.

7. **Update CHANGELOG.** When you ship something, document it.

8. **Commit after every working state.** Small commits, clear messages.

---

## When Things Break

Use V.S.A.F.E.R.-M. Paste this template:

```
Read CLAUDE.md and all /docs/ files. Using V.S.A.F.E.R.-M protocol:

BUG: [describe what's broken]
EXPECTED: [what should happen]
ACTUAL: [what actually happens]
DEVICE: [iPhone/Safari/Chrome/etc.]

1. Verify baseline — show me the current code for the affected area
2. Scope-lock — only touch the broken code
3. Propose minimal fix with BEFORE/AFTER
4. List 3–5 things this fix could break
5. Give me a test checklist
```

---

## File Structure When Complete

```
your-repo/
├── CLAUDE.md                              ← Claude Code reads this first
├── CHANGELOG.md                           ← What shipped, when
├── docs/
│   ├── PROTOCOLS.md                       ← B.U.I.L.D. / V.S.A.F.E.R.-M / D.R.A.F.T. / C.O.A.C.H.
│   ├── PRODUCT_ARCHITECTURE.md            ← Self-efficacy engine spec
│   ├── BATTLE_SCARS.md                    ← Lessons learned (keep updating)
│   ├── PRICING.md                         ← Tier structure + Stripe IDs
│   ├── NURSING_TRACK_INSTRUCTIONS.md      ← Existing nursing track spec
│   ├── research/
│   │   └── Master_Strategy_v2.docx        ← Full research bible
│   └── prompts/
│       ├── PHASE_1_FEEDBACK_REDESIGN.md
│       ├── PHASE_2_ARCHETYPE_ONBOARDING.md
│       ├── PHASE_3_STREAKS_IRS.md
│       ├── PHASE_4_YOUR_BEST_ANSWER.md
│       ├── PHASE_5_CONFIDENCE_LAB.md
│       └── ...future phases
├── src/
│   ├── App.jsx                            ← DO NOT REFACTOR
│   ├── Components/
│   │   ├── Onboarding/                    ← Phase 2
│   │   │   └── ArchetypeDetection.jsx
│   │   ├── Streaks/                       ← Phase 3
│   │   │   └── StreakTracker.jsx
│   │   ├── IRS/                           ← Phase 3
│   │   │   └── IRSDisplay.jsx
│   │   ├── QuestionBank/                  ← Phase 4
│   │   │   └── YourBestAnswer.jsx
│   │   ├── ConfidenceLab/                 ← Phase 5
│   │   │   └── ...
│   │   └── ...existing components
│   ├── utils/
│   │   ├── selfEfficacyFeedback.js        ← Phase 1
│   │   ├── archetypeRouter.js             ← Phase 2
│   │   ├── streakCalculator.js            ← Phase 3
│   │   ├── irsCalculator.js               ← Phase 3
│   │   ├── bestAnswerGenerator.js         ← Phase 4
│   │   ├── creditSystem.js                ← Existing
│   │   └── ...
│   └── lib/
│       └── supabase.js                    ← Existing
└── ...
```

---

## The Honest Reality Check

You're a solo founder working evenings and weekends with a baby on the way. The Master Strategy is ambitious. Here's the truth:

**Phases 1–3 alone make your app dramatically better.** Self-efficacy feedback + archetype onboarding + streaks/IRS = a fundamentally different product than what you have today. That's 5–6 weekends of work.

**Don't try to build everything before launching marketing.** Ship Phase 1, update your App Store listing, start the ad creative in parallel. Real user data from Phases 1–3 makes Phases 4–10 sharper.

**Sequence matters more than speed.** One phase done well beats three phases done halfway. The B.U.I.L.D. protocol exists because of the Battle Scars from rushing.

Build, measure, iterate. The research is done — now we build.
