# Install Reddit + Meta + LinkedIn pixels — now or wait?

**Labels suggestion:** marketing, decision, blocking, attribution, wave-1
**Assignees suggestion:** @lucas (owner) + @jacobdev-prog (engineering-lens reviewer)

---

## Context

Every paid ad we've run has had broken or missing attribution. The Google Ads test (~170 impressions) had a broken conversion pixel — no usable learning. Until pixels are wired, every paid dollar is functionally blind. Lucas hit a Meta Business Manager permissions wall in Phase 1; the unblock requires Lucas to provision new Pixel IDs + ad accounts (~60 min Lucas-time across the three platforms).

## Options

- **A) Install now** — Lucas spends 60 min provisioning Meta Pixel + LinkedIn Insight Tag + Reddit Pixel. Add Conversions API where free. Cost: 60 min today + ~30 min QA. Unblocks all paid amplification with measurable CAC.
- **B) Wait, run paid with UTM-only attribution** — UTM params + signup-source dropdown as fallback. Cheaper today, but can't optimize ad sets on conversion events. CAC math becomes inferred, not measured.
- **C) Hybrid — Meta only first** — Meta is the largest likely paid channel. Skip LinkedIn + Reddit pixels for now. Cuts setup to ~25 min.

## Recommended

**A** if Lucas has 60 min this week. **C** as fallback if time-boxed. **B** is acceptable only for a single $50-100 test, not for the $390 Ad #2 budget.

Rationale: paid spend without measurement is structurally a gamble. The 60-min provisioning cost is amortized across every future ad — pay it once.

## Jacob's input requested

- Does the install approach (client-side pixel + Conversions API) match what you'd build if this were a pure engineering task?
- Any deliverability/privacy/ATT-related gotcha we're missing in the iOS 14+ environment?
- Would you write the QA checklist + pixel-fire test plan?

## Decision deadline

**By end of week 2026-05-15.** Blocks every other paid decision (D2, D4, D10).

## Outcome (filled in after decision)

_TBD_
