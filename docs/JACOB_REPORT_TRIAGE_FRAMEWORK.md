# Jacob Report — Triage Framework

When Jacob's test report arrives, work through it in this exact order. Don't skip steps. The discipline prevents fix-cascade regressions.

## Step 0 — Capture state before any fixes

Tag the current commit as a known-good rollback point:

```bash
cd /Users/alshcampos/Downloads/isl-complete
git tag -a pre-jacob-report -m "Tag: state before Jacob's findings — Build 43 known-good"
git push origin pre-jacob-report
```

This is your safety net. If a fix introduces regression, you can `git diff pre-jacob-report HEAD` or `git reset --hard pre-jacob-report` to recover.

## Step 1 — Triage every finding into a 2×3 matrix

For each item Jacob reports, classify two ways:

**Severity:**
- **P0** — Launch blocker (signup broken, payment broken, IAP broken, can't sign in, /ethics 404s, App Store rejection-trigger)
- **P1** — Ship-fix soon (UX problem that converts users away, broken state in a major feature, Apple guidelines risk)
- **P2** — Post-launch nice-to-have (cosmetic, edge case, content polish)

**Blast radius:**
- **HIGH** — Auth, payments (`Stripe*`, `RevenueCat*`), webhooks (`supabase/functions/*`), data writes, `src/utils/creditSystem.js`, IAP attribution, RLS policies
- **MEDIUM** — Routing changes, state management changes, shared components
- **LOW** — Copy edits, image swaps, static layout tweaks, single-file CSS changes

## Step 2 — Sequence by blast radius, NOT severity

Counterintuitive but critical: do LOW-blast fixes first, regardless of severity.

**Fix order:**
1. All LOW-blast (copy, UI text, statics) — knock out 10–20 in one session, single PR is fine
2. MEDIUM-blast (one PR per fix, smoke test between each)
3. HIGH-blast last (one PR per fix, fresh head only, second pair of eyes if possible)

Why: fixing 10 P0 high-blast items in one rushed session is how you ship 3 new regressions. Fixing 10 P0 low-blast items in one session is fine because the surface area is small.

## Step 3 — One fix per branch

```bash
git checkout main
git pull
git checkout -b fix/jacob-NNN-short-description
# make the fix
# test locally
git add <specific files>
git commit -m "Fix: <description>"
gh pr create --title "Fix: <description>" --body "Resolves Jacob report item NNN"
```

Don't pile multiple fixes on one branch. When something breaks, you can identify which fix caused it. When a deploy needs to roll back, you revert ONE PR.

## Step 4 — Smoke test gate before every deploy

Five paths must pass after any fix lands:

1. **Signup flow** — visit `/`, enter email, magic link arrives, signed in
2. **Free tier limits** — start a 2nd AI Mock Interview, verify cap is enforced
3. **30-day pass purchase** — Stripe checkout → success → entitlement granted in Supabase (check `user_credits` table)
4. **/ethics page** loads on production (`https://www.interviewanswers.ai/ethics` returns 200)
5. **Apple sandbox IAP** (when Build 43 is testable in TestFlight) — purchase 30-day pass, verify `sync-rc-purchase` function fires and grants entitlement

If any path breaks after a fix, **halt all further fixes** and either revert the breaking PR or hotfix immediately. Don't pile more fixes on top of a regressing main.

## Step 5 — HIGH-blast rules

For any fix touching auth / payments / webhooks / IAP:

- Daylight only (not late night)
- Read the entire surrounding function before editing — don't surgical-edit blind
- Run the smoke tests BEFORE the fix and AFTER, save outputs to confirm no behavior change beyond the intended fix
- If touching Stripe webhook code, verify `STRIPE_WEBHOOK_SECRET` signature checking is intact and you didn't accidentally weaken validation
- If touching `RC_REST_API_KEY` flow in `sync-rc-purchase`, run the function locally with `supabase functions serve` and pass a test payload BEFORE deploying
- Never deploy a HIGH-blast fix on a Friday or before sleep

## Step 6 — Couplings

Some fixes are coupled — fixing one without the other introduces silent breakage. Watch for these patterns:

- Pricing fix in JSON-LD without matching `.env` Stripe price ID update → web shows wrong price, Stripe charges different amount
- StoreKit product ID change without updating the App Store Connect product → IAP fails silently in production
- Removing a feature from `src/utils/creditSystem.js` without updating the UI that displays remaining credits → blank "0 credits" state in user dashboard
- Database migration without updating Edge Function code that reads/writes the column → 500 errors

If Jacob flags any item that touches these patterns, surface the coupling explicitly in the triage matrix and don't deploy until both halves are fixed.

## Step 7 — Triage prompt for Claude Code

When Jacob's report is in `docs/marketing/JACOB_TEST_REPORT.md`, paste this into Claude Code:

```
Read docs/JACOB_REPORT_TRIAGE_FRAMEWORK.md and docs/marketing/JACOB_TEST_REPORT.md.

For each finding in Jacob's report, output a triage row:

| # | Finding (one-line) | Severity (P0/P1/P2) | Blast (HIGH/MEDIUM/LOW) | Coupled to | Suggested fix branch name | Files touched |

Then output a recommended fix sequence — list the items in the order they should be fixed, grouped by LOW → MEDIUM → HIGH blast.

Then for each P0 item, write a one-paragraph diagnosis: what's the root cause, what file/function changes, what tests would prove the fix.

Do NOT make any code changes. Do NOT touch git. This is triage only.
```

Then review Claude Code's output before authorizing any fix. Sequence the fixes according to its recommendation. Tag every commit with the Jacob report item number for traceability.
