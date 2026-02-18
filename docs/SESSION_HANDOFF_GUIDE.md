# Claude Code Session Handoff Guide

> How to start a new Claude Code session without losing progress.

## The Problem

Each Claude Code session starts fresh — it doesn't remember 
previous sessions. If you open a new session and say "continue 
where we left off," it has no idea what you're talking about.

## The Solution: Your Docs Folder IS Your Memory

Everything Claude Code needs to know is (or should be) in your 
repo's /docs folder. When you start a new session, the FIRST 
thing Claude Code does is read CLAUDE.md, which points it to 
all the other docs. Here's what each file does:

### Files Claude Code reads automatically:
- **CLAUDE.md** — Top-level instructions, rules, protocols, 
  and pointers to everything else. This is the "brain" that 
  persists across sessions. MUST be kept updated.

### Files Claude Code reads when told to:
- **docs/PROTOCOLS.md** — V.S.A.F.E.R.-M, D.R.A.F.T., and 
  other development protocols
- **docs/BATTLE_SCARS.md** — Lessons learned from past bugs. 
  Prevents repeating mistakes.
- **docs/REPO_MAP.md** — Where everything is in the codebase
- **docs/PRODUCT_ARCHITECTURE.md** — How the app is structured
- **docs/PHASE2_AUDIT_REPORT.md** — Current state assessment
- **docs/SMOKE_TEST_PROTOCOL.md** — Pre-deploy testing (NEW)

### Strategy documents:
- **docs/research/Master_Strategy_v2.docx** — The 50-page 
  strategy. Claude Code can read this when it needs strategic 
  context.

---

## How to Start a New Session

### Option A: Quick continuation (most common)
Paste this at the start of any new Claude Code session:

```
Read CLAUDE.md, then read docs/PROTOCOLS.md, 
docs/BATTLE_SCARS.md, and docs/SMOKE_TEST_PROTOCOL.md.

Then read docs/SESSION_STATE.md for current project status.

Tell me what you understand about where we are and what's 
next before writing any code.
```

### Option B: Starting a specific task
```
Read CLAUDE.md, docs/PROTOCOLS.md, docs/BATTLE_SCARS.md, 
and docs/SMOKE_TEST_PROTOCOL.md.

Then read [specific prompt file, e.g., docs/prompts/PHASE_3.md].

Execute using V.S.A.F.E.R.-M protocol.
```

### Option C: Full context load (for big decisions)
```
Read CLAUDE.md and ALL files in /docs/ including 
docs/research/Master_Strategy_v2.docx.

Give me a full status report: what's shipped, what's broken, 
what's next per the strategy.
```

---

## The Critical File: SESSION_STATE.md

Create and maintain this file at docs/SESSION_STATE.md. Update 
it at the END of every coding session. This is the single file 
that tells a new session exactly where you left off.

Template:

```markdown
# Session State — Last Updated: [date]

## What's Live on Production
- Phase 1: Self-efficacy feedback ✅
- Phase 2: Onboarding flow ✅
- Phase 2 fixes: Auth routing, nursing customization, 
  breathing copy, button colors ✅
- [add new items as they ship]

## Known Bugs (unfixed)
- [list any known issues]

## What Was Just Completed
- [last session's work]

## What's Next
- [the immediate next task]
- [reference to prompt file if one exists]

## Active Branches
- main (production)
- [any feature branches]

## Test Accounts
- [test account emails and what state they're in]

## Key Decisions Made
- No skip-to-signup on Screen 3 (value-before-signup thesis)
- Get Pro Access stays on /signup (paid conversion path)
- IRS shown as secondary on Screen 4 until Phase 3
- [add decisions as they're made]
```

---

## How to Keep This Working

### After every Claude Code session:
1. Ask Claude Code to update docs/SESSION_STATE.md before closing
2. If new battle scars were learned, add them to BATTLE_SCARS.md
3. If CLAUDE.md rules need updating, update them

### Before every deploy:
1. Claude Code runs smoke test protocol
2. You do 2-minute phone check after deploy

### When starting Phase 3 or any major feature:
1. Write a prompt document (like PHASE_2_COMPLETION.md)
2. Save it to docs/prompts/
3. Start new session with "Read CLAUDE.md + 
   docs/prompts/[PROMPT].md and execute"

---

## What NOT to Rely On

- Don't assume Claude Code "remembers" anything from a 
  previous session — it doesn't
- Don't assume Claude Code tested auth flows — "it compiles" 
  is not "it works"
- Don't assume changes to one file didn't break another — 
  always run smoke tests
- Don't assume Vercel deployed successfully — check the 
  Vercel dashboard or test production
