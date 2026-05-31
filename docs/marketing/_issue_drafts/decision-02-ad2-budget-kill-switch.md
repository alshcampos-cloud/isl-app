# Commit $390 Ad #2 budget as kill-switch test at current pricing?

**Labels suggestion:** marketing, decision, blocking, paid-spend, wave-1
**Assignees suggestion:** @lucas (owner) + @jacobdev-prog (experiment design)

---

## Context

We have one paid test in the books (Google Ads, broken pixel, inconclusive). Re-running with $390 hard cap + current pricing ($39 / $19.99 / $149) + new creative (Letter on Screen v2 + 3 statics) would be the first real read on whether brand voice + current funnel produce a measurable CAC. **Depends on D1 (pixels) being resolved first.**

## Options

- **A) Yes, $390 hard cap, single channel** — Pre-commit kill at CTR<1.5% OR CPC>$3 after 1000 impressions. Soft-launch organic first (3-5 days LinkedIn/Reddit), only amplify what gets organic traction. Daylight-only deploy.
- **B) Yes, split: $200 Meta + $190 LinkedIn** — Diversify channel risk. Two smaller signals beat one ambiguous larger signal. Same kill thresholds.
- **C) No, wait for Apple Build 43 approval first** — Mobile conversions hit a "download coming soon" wall if iOS app isn't live; tanks conversion rate.
- **D) No, $50 micro-test first to validate pixel firing end-to-end before $390** — Engineering hygiene: prove the measurement before scaling the spend.

## Recommended

**D, then A.** $50 smoke test confirms pixels fire correctly end-to-end → then commit $390 with confidence. Total budget: $440. The brand-voice gate is absolute either way.

## Jacob's input requested

- Is the kill threshold (CTR<1.5% OR CPC>$3 after 1000 impressions) defensible, or should it be statistical-significance-based?
- What confound do we still have on D's outcome (small-sample noise)?
- How should we read a $50 smoke test that shows mixed pixel firing?

## Decision deadline

**Blocked by D1.** Once pixels are wired (target end of week 2026-05-15), this decision is good for 7 days.

## Outcome (filled in after decision)

_TBD_
