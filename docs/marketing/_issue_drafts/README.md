# GitHub Issues drafts — marketing decisions

**Authored:** 2026-05-12
**Source:** [`../MARKETING_DECISIONS_PENDING_2026-05-08.md`](../MARKETING_DECISIONS_PENDING_2026-05-08.md)

One file per pending marketing decision. Each file is a ready-to-paste GitHub Issue body. Lucas batches the open + paste operation when ready.

---

## To batch-create the Issues

1. Open this folder.
2. For each `decision-NN-*.md`:
   - Open the file → copy the entire body (everything below the title — title goes in the Issue subject field).
   - Paste into [https://github.com/alshcampos-cloud/isl-app/issues/new](https://github.com/alshcampos-cloud/isl-app/issues/new).
   - Set the title to match the H1 of the file.
   - Add the labels listed under "Labels suggestion".
   - Assign the people listed under "Assignees suggestion".
   - Submit.
3. After creation, **link the GitHub Issue URL back into [`../MARKETING_DECISIONS_PENDING_2026-05-08.md`](../MARKETING_DECISIONS_PENDING_2026-05-08.md)** under each decision's heading so the source-of-truth doc points at the discussion thread.

---

## Suggested order — open these first

### 🔴 BLOCKING — this week
1. [`decision-01-install-pixels-now.md`](./decision-01-install-pixels-now.md) — attribution infrastructure; blocks D2, D4, D10
2. [`decision-03-linkedin-founder-essay-day0.md`](./decision-03-linkedin-founder-essay-day0.md) — Day 0 organic launch; tied to D11
3. [`decision-02-ad2-budget-kill-switch.md`](./decision-02-ad2-budget-kill-switch.md) — first measurable paid spend; blocked by D1

### 🟡 SOON — within 2 weeks
4. [`decision-04-spot5-transformation-paid.md`](./decision-04-spot5-transformation-paid.md) — nursing-track paid push; Erin gate
5. [`decision-06-resend-pro-upgrade.md`](./decision-06-resend-pro-upgrade.md) — email deliverability infra
6. [`decision-05-wwp-60s-video-version.md`](./decision-05-wwp-60s-video-version.md) — WWP video version production
7. [`decision-07-cinematic-pack-kill-or-revive.md`](./decision-07-cinematic-pack-kill-or-revive.md) — Cinematic v1 sunk-cost question
8. [`decision-08-joy-spot-timing.md`](./decision-08-joy-spot-timing.md) — Joy Spot sequencing

### 🟢 LATER — strategic / longer-arc
9. [`decision-09-seo-content-roadmap.md`](./decision-09-seo-content-roadmap.md) — SEO 12-article pilot or kill
10. [`decision-10-pricing-comms-strategy.md`](./decision-10-pricing-comms-strategy.md) — when to surface $39 / $149 publicly
11. [`decision-11-apple-build43-launch-timing.md`](./decision-11-apple-build43-launch-timing.md) — launch sequencing post App Store approval

---

## Naming convention

`decision-NN-[slug].md` where NN matches the decision number in `MARKETING_DECISIONS_PENDING_2026-05-08.md` and `[slug]` is a 2-5 word kebab-case identifier.

Future decisions: add the next sequential number (D12, D13...) and update this README + the source-of-truth decisions doc.

---

## What goes in each file

- **H1** — concise, action-oriented title (becomes Issue subject)
- **Labels suggestion** — comma-separated chips
- **Assignees suggestion** — GitHub handles
- **Context** — 2-3 sentences from MARKETING_DECISIONS_PENDING
- **Options** — A/B/C/D with implications
- **Recommended** — best-evidence pick with one-line rationale
- **Jacob's input requested** — specific questions for his comment (or "None" if founder-only)
- **Decision deadline** — pulled from decisions doc
- **Outcome** — empty until the Issue is closed; filled with decision + date when resolved

---

— Cowork (read-only mandate maintained)
