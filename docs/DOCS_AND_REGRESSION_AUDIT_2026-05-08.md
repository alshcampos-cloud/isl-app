# Docs & Regression Infrastructure Audit — 2026-05-08

Inventory + honest assessment of what's in place vs. what `JACOB_REPORT_TRIAGE_FRAMEWORK.md` assumes is in place.

---

## 1. Doc inventory

The repo has **57 markdown files at `docs/` top level** + **29 in `docs/marketing/`** + 6 in `docs/research/` + 3 in `docs/prompts/` + the `CLAUDE.md` at root. Classification below uses the user's 5-role taxonomy: STATE / GATES / TIMELINE / HOW / WHY.

### Top-level docs/ (sorted by role)

**HOW — conventions, runbooks, templates** (the triage framework joins this group)

| Doc | One-line role |
|---|---|
| `CLAUDE.md` (root) | Master operating instructions for Claude sessions; the "read this first" file |
| `PROTOCOLS.md` | V.S.A.F.E.R.-M (bug fixes) and D.R.A.F.T. (feature exploration) protocols |
| `SMOKE_TEST_PROTOCOL.md` | Pre-deploy smoke test (the protocol the new framework references) |
| `BATTLE_SCARS.md` | 20 lessons from past breakages — the rules the framework enforces |
| `JACOB_REPORT_TRIAGE_FRAMEWORK.md` | **NEW** — how to triage and sequence Jacob's findings without cascading regressions |
| `JACOB_BUILD_GUIDE.md` | Build instructions document handed to Jacob for the access layer |
| `PRODUCT_ARCHITECTURE.md` | App structure, route map, view hierarchy |
| `REPO_MAP.md` | File locations — STALE (Feb 15, commit `9924434`; HEAD is far ahead) |
| `IMPLEMENTATION_GUIDE.md` | How specific features are wired |
| `IOS_DEPLOYMENT_GUIDE.md` | iOS build pipeline (Feb 28; pre-Build 43) |
| `APP_STORE_CONNECT_SETUP.md` | App Store Connect provisioning steps |
| `APP_STORE_METADATA.md` | Listing copy + screenshots metadata for both apps |
| `EMAIL_SETUP_GUIDE.md` | Email deliverability setup (Resend/DKIM/SPF) |
| `GMAIL_POLL_HANDOFF.md` | Gmail poll cron job conventions |
| `GOOGLE_ADS_PLAYBOOK.md` | Google Ads campaign template |
| `LINKEDIN_LAUNCH_KIT.md` | LinkedIn launch copy template |
| `PRODUCTHUNT_LAUNCH_KIT.md` | PH launch copy template |
| `LAUNCH_DAY_OPS_CARD.md` | The 6 dashboards + on-call routine for launch day |
| `WHEN_YOU_RETURN_RUNBOOK.md` | Quick steps to take after stepping away |
| `SESSION_HANDOFF_GUIDE.md` | How to write a clean handoff between Claude sessions |
| `HANDOFF_PROMPT.md` | Paste-ready handoff prompt template |
| `NURSING_TRACK_INSTRUCTIONS.md` | Nursing track operating manual |
| `qa-checklist-nursing-track.md` | Pre-merge QA gate for nursing track |
| `erin-testing-guide.md` | Clinical-review testing flow for Erin |
| `ERIN_REVIEW_FORM.md` / `.html` | Clinical review form template |
| `DESIGN_DIRECTION.md` | Design system / brand voice |
| `IOS_PRICING_HANDOFF.md` | Deferred IAP pricing-update workstream guide |

**STATE — point-in-time snapshots**

| Doc | One-line role |
|---|---|
| `SESSION_STATE.md` | The active "where things stand" doc (last updated May 6) |
| `INFRASTRUCTURE_STATUS.md` | Single source of truth for infra state (Apr 22 — older sibling of SESSION_STATE) |
| `AI_QUALITY_TEST_RESULTS.md` | Snapshot of AI evaluator quality (Feb 19) |
| `PHASE2_AUDIT_REPORT.md` | Phase 2 production audit findings (Feb 15) |
| `PRICING_AUDIT_2026-04-30.md` | What was wrong with website pricing on Apr 30 |
| `PRICING_UPDATE_STATUS_APR30.md` | What got fixed in the pricing update sprint (Apr 30 sibling) |
| `APP_STORE_REVIEW_NOTES_BUILD31.md` | Review notes paste for Build 31 — historical only (current is 43) |
| `APP_STORE_REVIEW_NOTES_BUILD32.md` | Review notes paste for Build 32 — historical only |
| `erin-question-drafts-v2.md` | Nursing competency question drafts (Feb 12) |

**GATES — what needs to happen / blockers**

| Doc | One-line role |
|---|---|
| `APP_STORE_RESUBMISSION_PLAN.md` | Resubmission gate work list after rejections |
| `NURSING_TRACK_REMAINING_WORK.md` | Nursing-track punch list (Feb 13) |

**TIMELINE — when**

| Doc | One-line role |
|---|---|
| `LAUNCH_PLAN_V2_APR22.md` | 30-day launch playbook (Apr 22 strategy) |
| `LAUNCH_DAY1_ACTION_CARD.md` | Launch day 1 action card (Apr 22 plan, day-of) |
| `OVERNIGHT_SENSATION_PLAN.md` | Overnight + 30-day push plan |
| `SHIP_PACKAGE_APR24.md` | Ad rebuild sprint scope (Apr 24) |
| `CRISIS_SPRINT_HANDOFF_APR25.md` | Apr 25–26 crisis sprint scope |
| `SPRINT_3_PLAN.md` | Sprint 3 plan (drafted while Sprint 2 in flight) |

**WHY — rationale, research, persuasion**

| Doc | One-line role |
|---|---|
| `BLOG_WHY_WE_REMOVED_LIVE_PROMPTER.md` | The ethics-pivot blog post |
| `JACOB_RESPONSE_DRAFT.md` | Draft response to Jacob explaining strategic shift |
| `LAUNCH_BUDGET_APR22.md` | 30-day budget + CAC math |
| `LAUNCH_REVIEW_APR22.md` | Reviewer/auditor pass on the launch plan |
| `COMPETITIVE_POSITIONING_APR22.md` | Competitive brief |
| `COST_ANALYSIS.md` | Unit economics (Anthropic API + infra) |
| `COST_ANALYSIS_DETAILED.md` | Detailed cost analysis (sibling — see duplicates below) |
| `AI_QUALITY_CRITERIA.md` | Research: what makes a great interview response |
| `QUESTION_GROUPS_RESEARCH.md` | Research underpinning question bank groupings |
| `NEXT_LEVEL_RESEARCH.md` | Generic "next-level moves" research |
| `PHONE_DISPATCH_SPEC.md` | Spec for iPhone-dispatch agent control |
| `CLAUDE_CODE_HANDOFF.md` | Original Feb 9 handoff describing nursing-track exploration |

### `docs/marketing/` (29 files — campaigns + creative briefs)

| Doc | Role |
|---|---|
| `LAUNCH_SEQUENCE.md` | TIMELINE — the master Day 0/1/3/7/14 launch sequence |
| `LAUNCH_STATUS.md` | STATE/GATES — running status of the launch push |
| `MORNING_CHECKLIST_2026-05-07.md` | TIMELINE — yesterday's morning runbook (today is May 8 — already history) |
| `MOTION_PROMPT_REFACTOR_2026-05-07.md` | STATE — log of the v2 motion-prompt refactor |
| `BRAND_REVIEW_2026-05-06.md` | STATE — brand-voice audit findings |
| `BRAND_REVIEW_FIXES_APPLIED.md` | STATE — what got fixed in response |
| `CHECKPOINT_OVERNIGHT_4ITEMS.md` / `_v2.md` | STATE — overnight checkpoint (v2 supersedes v1) |
| `CAMPAIGN_PLAN_v1.md` | TIMELINE — paid campaign plan |
| `CINEMATIC_AI_COMMERCIALS_v1.md` | WHY — cinematic-pack rationale |
| `COMMERCIAL_CONCEPTS_BEYOND_CHEAT.md` | WHY — concept exploration beyond the "cheat" wedge |
| `CREATIVE_ROTATION_v1.md` | TIMELINE — creative rotation schedule |
| `DAY0_ORGANIC_POSTS.md` | TIMELINE — day-0 organic post copy |
| `DONT_BE_A_FRAUD_CAMPAIGN.md` | WHY — fraud-positioning campaign |
| `EMAIL_SEQUENCE_v1.md` | TIMELINE — email drip plan |
| `GOOGLE_EMAIL_PH_CAMPAIGNS.md` | TIMELINE — Google + Email + Product Hunt campaign matrix |
| `INSTAGRAM_TIKTOK_CAMPAIGNS.md` | TIMELINE — IG/TT campaign matrix |
| `REDDIT_CAMPAIGNS.md` | TIMELINE — Reddit campaign matrix |
| `TRY_IT_FIRST_CAMPAIGN.md` | WHY — "try it first" CTA campaign |
| `NEW_AD_CAMPAIGNS_APR24.md` | TIMELINE — Apr 24 ad campaign brief (older) |
| `WEB_ONLY_LAUNCH_WEEK_APR22.md` | TIMELINE — Apr 22 web-only launch week (older) |
| `AD_COPY_AUDIT.md` | WHY — ad copy audit |
| `PHASE0_QA_FIXES_APPLIED.md` | STATE — QA fixes applied to Spot 1 + Joy Spot |
| `PHASE0_QA_SPOT1_JOY.md` | STATE — QA findings doc |
| `app_pricing_refactor_prompt.md` | HOW — paste-ready Claude Code prompt |
| `website_pricing_update_prompt.md` | HOW — paste-ready Claude Code prompt |
| `website_pricing_update_prompt_AUDIT.md` | WHY — audit of the prompt above |
| `instagram_ai_creator_research.md` | WHY — IG creator research |
| `pixel_install_template.html` | HOW — drop-in pixel template (referenced by Fix 3) |

### Other

- `docs/prompts/` — 3 files (PHASE_1_FEEDBACK_REDESIGN, PHASE_2_ARCHETYPE_ONBOARDING, PHASE_3_STREAKS_IRS) — all HOW (paste-ready prompts)
- `docs/research/` — 9 files (USF Pricing analysis, Master_Strategy_v2.docx, ERIN_Pricing_Review, etc.) — all WHY
- `docs/marketing/practice_ritual/` — 100+ files of campaign assets, motion prompts, supervisor logs (out of scope for this audit)

### Real duplicates / overlaps / staleness

These are actual conflicts or redundancies that warrant attention. Not invented.

1. **`COST_ANALYSIS.md` vs `COST_ANALYSIS_DETAILED.md`** — Both top-level, both unit-economics. Reconcile or note which is canonical.
2. **`CHECKPOINT_OVERNIGHT_4ITEMS.md` vs `CHECKPOINT_OVERNIGHT_4ITEMS_v2.md`** — v1 is superseded by v2; safe to archive v1.
3. **`INFRASTRUCTURE_STATUS.md` (Apr 22) vs `SESSION_STATE.md` (May 6)** — Both claim "single source of truth" for current state. INFRASTRUCTURE_STATUS is a superset (infra) and SESSION_STATE is the active running log. Worth a one-line cross-reference at the top of each so a new session knows which to read.
4. **`LAUNCH_PLAN_V2_APR22.md` (strategy) + `docs/marketing/LAUNCH_SEQUENCE.md` (timeline) + `docs/marketing/LAUNCH_STATUS.md` (running status)** — Three "launch" docs. They're complementary, not duplicates: PLAN = strategy, SEQUENCE = timeline, STATUS = running state. But CLAUDE.md only points at PHASE2_AUDIT_REPORT and Master_Strategy_v2.docx for "strategic decisions" — should also point at the May launch trio.
5. **`APP_STORE_REVIEW_NOTES_BUILD31.md` and `BUILD32.md`** — Historical only; current build is 43. Move to `docs/archive/` to reduce sprawl, or note "for reference only" at the top.
6. **`REPO_MAP.md` (Feb 15, commit `9924434`)** — Stale. App.jsx alone has grown from 8,099 → 9,388 lines (+16%) since this snapshot.
7. **`CLAUDE.md` last updated Feb 16, 2026** — 2.7 months stale. Says App.jsx is 8,099 lines (now 9,388). Says `~70 useState hooks` (probably more now). Doesn't mention any of the launch infrastructure built since (Pixel install plan, Spot 5, Reflection v51, the Joy Spot pack, the §13 Verisimilitude Auditor). The CORE protocols (D.R.A.F.T., V.S.A.F.E.R.-M, the 20 battle scars) are still valid. The repo state and "current work" sections are stale.
8. **The Apr 22 "launch" cluster** (LAUNCH_PLAN_V2, LAUNCH_DAY1_ACTION_CARD, LAUNCH_REVIEW, LAUNCH_BUDGET) — All from the original Apr 22 launch attempt. The actual launch slipped (we're still pre-launch May 8). Worth a top-of-file "Status: pre-launch (slipped from Apr 22 → ~May target)" note so a new reader doesn't think launch already happened.

**Net assessment:** the doc set is rich (>200 markdown files counting subdirs) but role-overlapping. The new `JACOB_REPORT_TRIAGE_FRAMEWORK.md` slots cleanly into HOW alongside `PROTOCOLS.md`, `SMOKE_TEST_PROTOCOL.md`, and `BATTLE_SCARS.md` — it does NOT duplicate or conflict with any existing doc.

---

## 2. Regression infrastructure inventory

Honest count: **1 / 7** of the standard regression-prevention practices is in place.

| # | Practice | Status | Evidence |
|---|---|---|---|
| 1 | Pre-commit hooks | ❌ MISSING | No `.husky/`, no `.pre-commit-config.yaml`, no `husky` or `lint-staged` keys in `package.json` |
| 2 | CI workflows on PRs | ❌ MISSING | No `.github/workflows/` directory |
| 3 | TypeScript strict mode | ❌ MISSING | `tsconfig.json` exists but `"strict": false`, and only includes `agents/**` + `api/**` (server-side); `src/` is JavaScript |
| 4 | Test suite | ❌ NEAR-ZERO | One file: `src/utils/disposableEmail.test.js`. No `vitest.config.*`, no `jest.config.*`, no `playwright.config.*`, no `cypress/`. No `npm test` script. |
| 5 | Migration discipline | ⚠️ PARTIAL | `supabase/migrations/` has 20 dated, additive migrations. Naming is good (timestamp-prefixed). No `*.down.sql` reversal files — migrations are forward-only. |
| 6 | Error monitoring | ⚠️ HOMEGROWN | No Sentry/LogRocket/Datadog/Bugsnag SDK in `package.json`. But there IS a custom in-DB error tracker: migration `20260406210000_error_tracking.sql` and `20260406_health_monitoring.sql` suggest a homegrown error log. (Not the same as a real-time alerting SDK.) |
| 7 | Feature flags | ❌ MISSING | No LaunchDarkly / GrowthBook / PostHog / custom flag system in `src/` |

**Bonus findings:**
- ESLint script defined (`npm run lint`) but no root `.eslintrc*` or `eslint.config.*` — lint will fail or use default config.
- Currently on branch `feature/house-hunt-recovery`, not `main`. Worth flagging in any session-start protocol.
- Vercel deployment config (`vercel.json`) is the only "automation" — handles routing redirects (`/stealth-prompter → /ethics`, host normalization to `www.`).

---

## 3. Gaps the framework relies on but the repo doesn't have yet

The new `JACOB_REPORT_TRIAGE_FRAMEWORK.md` references several artifacts that either don't exist or exist only as documentation, not automation. Listing them so we don't ship aspirational tooling.

| Framework reference | Reality | Gap severity |
|---|---|---|
| Step 0: `git tag -a pre-jacob-report` | ✅ Works — git is git | OK |
| Step 3: `gh pr create ...` | ⚠️ Requires `gh` CLI installed locally; not part of repo automation | Minor (user runs locally) |
| Step 4: "Five smoke-test paths must pass" | ⚠️ The smoke tests are documented in `SMOKE_TEST_PROTOCOL.md` but executed by hand. **No automated smoke-test script** exists. There is no `npm run smoke` or `scripts/smoke-test.sh`. | **MEDIUM** — easy to skip when rushed |
| Step 5: "Run smoke tests BEFORE the fix and AFTER, save outputs" | ⚠️ Same as above — manual only, no output capture mechanism | MEDIUM |
| Step 5: "Run the function locally with `supabase functions serve`" | ✅ Standard Supabase CLI command | OK |
| Step 5: "Save outputs to confirm no behavior change" | ❌ No baseline-snapshot tooling. No way to diff "before fix" vs "after fix" behavior except by eyeballing it. | MEDIUM |
| Step 6: "Watch for couplings" | ✅ Documented; relies on operator discipline, not tooling | OK |
| Step 7: "Read JACOB_TEST_REPORT.md" | ⚠️ Path `docs/marketing/JACOB_TEST_REPORT.md` does not yet exist (Jacob hasn't filed yet) | OK — placeholder |

**Bottom line on gaps:** the framework is operable today by a disciplined operator using manual smoke-testing. It is NOT enforced by tooling. If a fix lands without running the smoke test, nothing in the repo catches it. The smoke test is honor-system only.

---

## 4. Recommended next steps

In rough priority order. None of these block triaging Jacob's report — they're hardening for the medium term.

### Immediate (do this week, low-effort, high-leverage)

1. **Refresh `CLAUDE.md`** — bump `App.jsx` line count to actual (9,388), update "Current Work" section past Feb 16, add references to the May launch trio (LAUNCH_SEQUENCE, LAUNCH_STATUS, LAUNCH_PLAN_V2_APR22), and add the new JACOB_REPORT_TRIAGE_FRAMEWORK to the "required reading" list.
2. **Archive stale build-specific docs** — Move `APP_STORE_REVIEW_NOTES_BUILD31.md` and `BUILD32.md` to `docs/archive/` (keep `BUILD43.md` if/when it exists).
3. **Top-of-file disambiguation notes** — Add 2–3 lines at the top of `INFRASTRUCTURE_STATUS.md`, `LAUNCH_PLAN_V2_APR22.md`, and `COST_ANALYSIS_DETAILED.md` clarifying their relationship to siblings (which is canonical, which is historical).
4. **Add `npm run smoke`** — a simple bash script under `scripts/smoke-test.sh` that runs the 5 critical paths against a deployed URL (curl-based). Even a 50-line script wired to `npm run smoke` is enough to make Step 4 of the framework enforceable.

### Soon (next 2 weeks, before launch hardens)

5. **Add a minimal CI workflow** — single `.github/workflows/pr.yml` that runs `npm run lint` + `npm run build` on every PR. No tests, just compile + lint. Catches half the regressions for free.
6. **Add `husky` + `lint-staged`** — run `eslint --fix` on staged JS files only. Cheap, fast, prevents the obvious typos.
7. **Wire one real error monitor** — Sentry's free tier is fine for early stage. Add the SDK to `src/main.jsx`. The homegrown DB error tracker is good for analytics but not for real-time alerting.

### Medium term (post-launch when there's air)

8. **Add Vitest + 5 smoke unit tests** — covering `creditSystem.js`, the auth context, the Stripe webhook handler, the RC sync function, and routing. Even 5 tests is infinitely better than 1.
9. **Reversible migrations** — for any future `supabase/migrations/*.sql`, ship a paired `*.down.sql` even if it's just a comment "no-op, additive only — to roll back, drop the new column."
10. **Refresh `REPO_MAP.md`** — re-generate the file map since it's pinned to `9924434` and HEAD is far past that.

---

## 5. TL;DR for the impatient

- **Doc sprawl is real but tractable.** ~200 markdown files across the project; most are cleanly classified by role. ~7 actual duplicates/staleness issues, all listed above.
- **`JACOB_REPORT_TRIAGE_FRAMEWORK.md` is additive.** It does not duplicate or conflict with `PROTOCOLS.md`, `BATTLE_SCARS.md`, or `SMOKE_TEST_PROTOCOL.md` — it sequences them.
- **Regression infrastructure is bare.** 1 of 7 standard practices in place (partial migration discipline). No CI, no pre-commit hooks, no test suite, no error monitor SDK, no feature flags.
- **Framework operability is honor-system today.** The smoke test is documented but not automated. A 50-line `scripts/smoke-test.sh` would close the biggest gap.

Generated 2026-05-08 by Cowork audit pass.
