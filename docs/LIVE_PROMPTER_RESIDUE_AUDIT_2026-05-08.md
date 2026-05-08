# Live Prompter Residue Audit — 2026-05-08

Triggered by `npm run smoke` catching 3 mentions in `PricingPage.jsx` that survived the rebrand. This audit checks if there are MORE — across the whole repo, every file type — before triaging the fix.

## TL;DR — counts by category

| Category | Hits | Action |
|---|---:|---|
| **REAL** — user-facing copy that ships to humans | **~14 lines across 5 files** | Fix in one PR |
| **INTENTIONAL** — anti-marketing / disclaim / rebrand-narrative copy | **~32 lines** | Leave alone |
| **HISTORICAL** — legacy ad creative paused / archived docs | **~57 lines** | Leave or move to `archive/` |
| **TECHNICAL** — variable / DB column / component names | **~32 lines** | Separate cleanup PR (not blocking) |
| **STALE BUILD** — `ios/App/build-*`, `android/app/src/main/assets`, etc. — auto-regenerates on next `npm run build` | **216 lines** | Ignore — `npm run build` overwrites |
| **TOTAL HITS** | **371** | |

**Bottom line: 3 was a low-ball. The real number of user-shipping mentions is ~14 across 5 files — small fix, not a "30 line" disaster.** Plus another ~32 technical/internal references that are cosmetic-only (DB columns and variable names that work fine but don't read clean).

---

## 1. REAL — needs fix (user-shipping)

These are strings that reach users (in-app, GitHub README, public docs) and contradict the rebrand narrative.

### `src/Components/PricingPage.jsx` — 3 lines (the original smoke-test catch)

| Line | Text | Suggested fix |
|---:|---|---|
| 57 | `{ text: '10 Live Prompter questions/month', included: true },` | `'10 Practice Prompter questions/month'` |
| 80 | `{ text: '✨ UNLIMITED Live Prompter', included: true, highlight: true },` | `'✨ UNLIMITED Practice Prompter'` |
| 313 | `<td className="py-4 px-4 text-gray-700">Live Prompter</td>` | `<td className="py-4 px-4 text-gray-700">Practice Prompter</td>` |

### `README.md` (root, public on GitHub) — 2 lines

| Line | Text | Suggested fix |
|---:|---|---|
| 7 | `- **Live Prompter** - Real-time AI suggestions during actual interviews` | Remove or rewrite as: `- **Practice Prompter** — bullet-point rehearsal mode for interview prep (NOT for use during live interviews — see /ethics)` |
| 103 | `| Live Prompter | 5 min/day | Unlimited |` (pricing tier table row) | `| Practice Prompter | 10 questions/mo | Unlimited |` |

### `FEATURES.md` (root) — 6 lines

| Line | Text |
|---:|---|
| 5 | `### 1. Live Prompter` |
| 82 | `- **Keywords**: Phrases that trigger Live Prompter matching` |
| 85 | `### Live Prompter Matching` |
| 87 | `When using Live Prompter, the AI matches spoken phrases to your template questions using keyword matching:` |
| 106 | `\| Live Prompter \| 5 minutes \|` |
| 116 | `\| Live Prompter \| Unlimited \|` |

This is a feature-doc that still describes Live Prompter as a current feature with usage limits. **Either delete this section or rewrite as Practice Prompter.** Public on GitHub if repo is public.

### `DEPLOY-GUIDE.md` (root) — 4 lines

| Line | Text |
|---:|---|
| 106 | `### **Test 2: Live Prompter (No API Needed)**` |
| 107 | `- [ ] Click "Live Prompter"` |
| 144 | `### **Problem: Live Prompter doesn't match questions**` |
| 228 | `- ✅ Live Prompter matches questions` |

Internal deploy QA doc; lower priority since it doesn't ship to users, but stale (still references the deleted feature as a smoke-test step). **Update or move to `docs/archive/DEPLOY-GUIDE_pre-rebrand.md`.**

### `REPO_MAP.md` (root) — 2 lines

| Line | Text |
|---:|---|
| 29 | `3. **Live Prompter** - Real-time bullet points during actual interviews` |
| 120 | `\| `'prompter'` \| Live Prompter mode \|` |

REPO_MAP is already flagged as stale (Feb 15, commit 9924434) in `docs/DOCS_AND_REGRESSION_AUDIT_2026-05-08.md`. Both fixes happen at once when REPO_MAP is regenerated.

### `CLAUDE.md` (root) — 1 line

| Line | Text |
|---:|---|
| 11 | `- **Live Prompter** — real-time coaching during practice` |

Same stale-CLAUDE.md issue flagged in the Docs audit. Update when CLAUDE.md is refreshed.

**REAL total: 14 lines across 5 files.** Of those, 3 are in active user-facing UI (`PricingPage.jsx`), 4 are in public-on-GitHub docs (`README.md`, `FEATURES.md`), and 7 are in stale internal docs (`DEPLOY-GUIDE.md`, `REPO_MAP.md`, `CLAUDE.md`).

---

## 2. INTENTIONAL — disclaim / anti-marketing / rebrand narrative

These are CORRECT mentions of "Live Prompter" — the rebrand narrative explicitly cites the deleted feature as proof of the ethics pivot. **Do not strip these.**

| File | Hits | Why intentional |
|---|---:|---|
| `src/Components/Landing/WhyISLSection.jsx:7` | 1 | `"We deleted our live-interview prompter. No in-ear AI. No 'undetectable' mode."` — the anti-marketing disclaim that's the WHOLE positioning |
| `docs/BLOG_WHY_WE_REMOVED_LIVE_PROMPTER.md` | 4 | The literal blog post explaining the removal |
| `docs/marketing/AD_COPY_AUDIT.md` | 8 | The audit doc tracking every LP mention to fix in ads — describing them by name is the point |
| `docs/marketing/BRAND_REVIEW_2026-05-06.md` | 4 | Brand-voice audit identifying LP mentions for swap |
| `docs/marketing/BRAND_REVIEW_FIXES_APPLIED.md` | 5 | Log of which LP mentions were swapped to Practice Mode |
| `docs/marketing/DAY0_ORGANIC_POSTS.md` | 4 | Anti-marketing copy for launch ("Six months ago I shipped a feature called the Live Prompter. ... So I killed it.") |
| `docs/marketing/DONT_BE_A_FRAUD_CAMPAIGN.md` | 3 | Campaign positioning around the kill |

**INTENTIONAL total: ~32 lines.** All correct, all leave alone.

---

## 3. HISTORICAL — legacy ad creative + dated docs

These don't ship to users today and aren't actively maintained. They're paused/archived but still in the working tree.

| Path | Hits | Notes |
|---|---:|---|
| `ads/*.html` + `ads/*.md` (pre-pivot creative) | 47 | Old IG/FB/LinkedIn HTML mockups (`ig-feed-live-prompter.html`, etc.) and pre-pivot ad strategy docs (`AD_RESEARCH.md`, `AD_STRATEGY.md`, `CREATIVE_BRIEF.md`, `RECORDING_SCRIPT.md`, `headline-variations.md`). Paused. Recommend `git mv ads/ ads-archive-pre-rebrand/` for clarity. |
| Other older `docs/` files | ~10 | Crisis-sprint handoffs, implementation guides, AI quality criteria — all reference LP historically, no claim it's a current feature |

**HISTORICAL total: ~57 lines.** No action required; cosmetic move-to-archive optional.

---

## 4. TECHNICAL — variable / component / DB column names (not user-facing)

These are internal identifiers. Renaming requires a migration (DB column) or a multi-file refactor (state vars). They DON'T appear in user-facing copy — the UI shows "Practice Prompter" while the variable is `showLivePrompterWarning`. Cosmetic-only; cleaner to align names but no functional impact.

| File | Hits | What |
|---|---:|---|
| `src/App.jsx` | 8 + 11 = 19 | `showLivePrompterWarning` state hook (8) + `livePrompterQuestions` enum keys / `LIVE PROMPTER USAGE` comments (11). Modal title now says "Ready to rehearse?", body says "Practice Prompter" — variable names lag the UI rename. |
| `src/Components/ConsentDialog.jsx` | 2 | `showLivePrompterWarning` var passthrough |
| `src/utils/creditSystem.js` | 15 | DB column name `live_prompter_questions` + flag `live_prompter_unlimited` (used in feature-limit checks). Renaming = migration on `user_credits` table. |
| `supabase/functions/check-usage/index.ts` | 6 | Reads the same `live_prompter_questions` column for tier-limit enforcement |
| `src/Components/UsageDashboard.jsx` | 7 | `livePrompterUsed = usageData?.live_prompter_questions` — internal usage display, label may read "Practice Prompter" but variable name lags |
| `public/admin.html` | 2 | Admin dashboard internally labels feature "Live Prompter" in chart legend (line 876: `'Live Prompter': { key: 'live_prompter_questions', color: '#f97316' ... }`). Admin-only, `noindex,nofollow`, only Lucas sees it. |

**TECHNICAL total: ~32 lines.** Recommend a separate "DB column + state var rename" PR scheduled for post-launch. Not blocking. The DB rename is a multi-step migration:
1. Add new column `practice_prompter_questions` defaulting to value of `live_prompter_questions`
2. Backfill via `UPDATE`
3. Update Edge Function + creditSystem.js + UsageDashboard.jsx + admin.html to read the new column
4. Drop the old column in a follow-up migration after a soak period

**Don't do this in the same PR as the user-facing fix. Risk profile is HIGH (touches paid-tier enforcement); the user-facing fix is LOW.**

---

## 5. STALE BUILD ARTIFACTS — auto-regenerated on next build

| Path | Hits | Notes |
|---|---:|---|
| `ios/App/build-sim/Build/Products/Debug-iphonesimulator/App.app/public/assets/index-*.js` | ~16 each × 4 paths | Old Vite bundles from prior `npm run build` runs |
| `ios/App.xcarchive/Products/Applications/App.app/public/assets/index-NpE6UdMO.js` | 16 | Pre-rebrand iOS archive |
| `android/app/src/main/assets/public/assets/index-mGxrvAsS.js` | 16 | Pre-rebrand Android assets |
| `ios/DerivedData/.../public/index.html` etc. | smaller chunks | Xcode derived data |

**STALE BUILD total: 216 lines.** Will overwrite cleanly on next `npm run build`. Verify after fix lands by:
```bash
npm run build
grep -ri "live prompter" ios/App/build-sim/ android/app/src/main/assets/  # should be 0 after build
```

---

## 6. Recommended fix sequence

Follows the `JACOB_REPORT_TRIAGE_FRAMEWORK.md` LOW-blast-first ordering.

### One PR — LOW blast — knock out the user-facing residue (14 lines, 5 files)

```
fix/live-prompter-residue-PRICING-AND-DOCS
```

Files touched:
- `src/Components/PricingPage.jsx` (3 lines)
- `README.md` (2 lines)
- `FEATURES.md` (6 lines or strip the section entirely)
- `DEPLOY-GUIDE.md` (4 lines or move to archive)
- `REPO_MAP.md` (2 lines or stop here, full regenerate as a separate task)
- `CLAUDE.md` (1 line — bundled into the bigger CLAUDE.md refresh recommended in Docs audit)

After landing: `npm run smoke` should pass check 8.

### Separate PR — MEDIUM blast (post-launch) — internal rename

```
fix/live-prompter-internal-rename
```

State vars → `showPracticePrompterWarning`, comments → "PRACTICE PROMPTER", admin-dashboard label → "Practice Prompter".

Doesn't need DB migration. ~32 line touches across 5 files in `src/`.

### Separate PR — HIGH blast (post-launch + soak) — DB column rename

```
fix/db-rename-live-prompter-questions
```

Two-phase migration:
1. Add `practice_prompter_questions` column, backfill from `live_prompter_questions`, dual-write in app code
2. Switch read path, soak 2 weeks, drop old column

Touches: `creditSystem.js`, `check-usage/index.ts`, `UsageDashboard.jsx`, `admin.html`, plus 2 new migration files.

### Optional — cleanup

```bash
git mv ads/ ads-archive-pre-rebrand/  # 47 hits move to archive folder
```

---

## 7. Summary for the impatient

- **REAL launch-blocker hits: 14 lines across 5 files.** All low-blast (copy-only). One PR, ~30 minutes.
- **INTENTIONAL hits: ~32 lines.** Don't touch — they're the rebrand narrative.
- **HISTORICAL hits: ~57 lines.** Don't ship; optional move to archive.
- **TECHNICAL (variable/DB names): ~32 lines.** Cosmetic-only, post-launch PR.
- **STALE BUILD artifacts: 216 lines.** `npm run build` regenerates clean.

Generated 2026-05-08 by Cowork audit pass. Triggered by `npm run smoke` flagging 3 hits in `PricingPage.jsx`.
