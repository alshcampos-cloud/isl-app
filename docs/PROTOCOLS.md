# InterviewAnswers.AI — Development Protocols

> Reference for all Claude Code sessions. Use the right protocol for the right job.

---

## B.U.I.L.D. — New Features to Live App

Use for: Any new feature shipping to production.

**B — Branch and Baseline**
- Create feature branch from main
- Document current state: commit hash, line counts, deployed behavior
- Take screenshots for before/after
- Verify recent fixes are present (check Battle Scars)

**U — Unit of Change**
- Define the single smallest shippable unit
- Not the whole feature — the smallest piece that delivers user value alone
- Ship units, not features

**I — Isolate New Code**
- All new functionality lives in NEW files
- Only modifications to existing files: import statements and render calls
- If editing logic inside App.jsx → STOP → Create a wrapper or context provider

**L — Lighthouse Check**
- Before merging: Open app → Sign in → Practice Mode → Complete session → See feedback → Return to home
- If any step breaks, do not merge
- Test on iOS Safari specifically (Battle Scar #5)

**D — Deploy and Document**
- Merge to main → Push to production
- Document: files added/modified, user-facing behavior changes
- Add to BATTLE_SCARS.md if applicable
- Update CHANGELOG.md

---

## V.S.A.F.E.R.-M — Production Bug Fixes

Use for: Anything broken in production. Surgical precision required.

**V — Verify Baseline**
- Extract current deployed code
- Verify checksums/key lines
- Confirm recent fixes are present

**S — Scope-locked**
- Only address what is shown in screenshots/notes
- Do NOT touch unrelated areas

**A — Additive + Localized**
- Do not refactor, rename, or reorganize
- Minimal edit surface area

**F — Function-preserving**
- Assume recent fixes are fragile
- Preserve existing behavior

**E — Exact-line Accounting**
- File name, exact line ranges
- BEFORE/AFTER snippets
- 1-sentence rationale per change

**R — Regression-aware**
- List 3–7 specific things the change could break
- Explain how you avoided each

**M — Merge-gated**
- Draft fix as sandbox block
- Self-check against constraints
- Integrate with smallest replacement
- Run regression checklist

---

## D.R.A.F.T. — Exploration / Sandbox

Use for: New features where the right approach is unclear. Experimenting.

**D — Diverge:** Feature branch, never touch production
**R — Restrict:** New files/components only, don't modify existing code
**A — Align:** With product decisions (Erin's feedback baked in as constraints)
**F — Free:** To experiment (unlike V.S.A.F.E.R.-M, we want to play here)
**T — Track:** Document everything for future merge decisions

---

## C.O.A.C.H. — AI Conversation Design

Use for: Designing AI-mediated coaching conversations within the app. Ensures walled garden compliance.

**C — Context Set:** Frame the session, tell the user what to expect
**O — Only Curated Questions:** Pull from library, never generate clinical scenarios
**A — Assess Communication:** Evaluate STAR/SBAR structure, specificity, reasoning narrative, outcomes, authenticity. NOT clinical accuracy.
**C — Coach With Layers:** (1) What was strong, (2) What to improve, (3) Offer retry
**H — Handle Follow-ups and Boundaries:** Probe deeper like a real interviewer. Redirect clinical questions to facility protocols/UpToDate.

---

## 🛑 HARD STOP RULE (All Protocols)

If you need to change shared utilities, global config, routing architecture, app-wide state, auth, or billing without asking first — **STOP and ask Lucas.**
