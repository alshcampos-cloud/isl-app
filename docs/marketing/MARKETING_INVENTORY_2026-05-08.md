# Marketing Asset Inventory — 2026-05-08
**Authored by:** Cowork (autonomous discovery pass)
**Method:** Walked `docs/marketing/` + `docs/research/` + brand-flavored files in `docs/` top-level + cross-referenced `~/Desktop/IA_AI_LAUNCH_INDEX.md` for content not directly visible in sandbox mount.
**Sandbox caveat:** Some asset paths under `docs/marketing/practice_ritual/` and `docs/marketing/mocks/` are documented in the Launch Index but the sandbox sees only `.DS_Store` placeholders for those dirs. **Lucas's Mac is canonical** — assume the launch index is correct for those entries.

---

## ⚠️ Video asset reality check (added 2026-05-12)

A second pass to verify video assets in the working tree turned up a significant gap from what the Launch Index documents:

**Found in repo working tree:**
- `ads/app-recording.mp4` (326K) — older app demo recording
- `ads/app-clip-15s.mp4` (104K) — older app clip
- **Note:** `ads/` is in `.gitignore` — these are NOT tracked, just present locally

**Documented in Launch Index but NOT in repo working tree:**
- `docs/marketing/mocks/` — directory does not exist. Per Launch Index, should contain `letter_on_screen_v2.mp4`, `wwp_audio_only_v0_5.mp4`, `static_a_practice_not_cheat.png`, `static_b_before_it_happens.png`, `static_c_testing_effect.png`
- `docs/marketing/practice_ritual/cinematic_v1/` — exists but contains only `.DS_Store`. Per Launch Index, should contain 3 spots (γ object_waiting / β practice_visible / ε walk_and_react) × ~9 artifacts each
- `docs/marketing/practice_ritual/reflection_15s/raw/` — exists but contains only `.DS_Store`. Per Launch Index, should contain 5 raw mp4 clips

**Implication:** Lucas's locked "Option 1 — commit existing video assets as-is" policy depends on those files being moved into the working tree first. The polished launch creative (Letter on Screen v2 + WWP audio + statics) is not currently in the repo. Either:
- (a) Files exist on Lucas's Mac in a different location and need to be copied/moved into `docs/marketing/mocks/` and `docs/marketing/practice_ritual/*/raw/`, then `git add`
- (b) Launch Index paths are aspirational / forward-looking and the files haven't been exported yet
- (c) Files were deleted in a prior cleanup pass and need rebuilding

**Action required from Lucas:** confirm which case applies and either move files into the working tree or update Launch Index paths to match reality.

**Repo footprint impact:** if all Launch Index videos land in the tree, total marketing-video footprint is estimated at ~30 MB (per Lucas's note). That fits comfortably under the 50 MB single-file LFS threshold and 300 MB total-repo threshold from the Video asset policy. No LFS needed today.

### Update 2026-05-12 — exhaustive sandbox sweep complete

Cowork ran an exhaustive `find` walk across every mounted folder (Downloads, Documents, Movies, Desktop, Pictures, Mobile Documents/iCloud) searching for any video matching the canonical patterns from the Launch Index. **Result: zero matches.** No `spot5`, `reflection`, `letter_on_screen`, `wwp`, `joy_spot`, `object_waiting`, `practice_visible`, `walk_and_react`, `v_aaliyah`, `v_eyeglass`, `v_kitchen`, `v_lobby`, `master_9x16`, `master_16x9`, `master_1x1`, or `v51` files found anywhere in the mounted filesystem.

The only `.mp4` files anywhere in the repo or its parent folders are:
- `isl-complete/ads/app-recording.mp4` (326K) — older app demo
- `isl-complete/ads/app-clip-15s.mp4` (104K) — older app clip
- Three iOS Simulator Screen Recordings in `~/Desktop/AppStoreAssets/General/Video/` (33 MB, 85 MB, 259 MB) — likely App Store screenshot raws, not launch creative

This points to the missing files being **either**:
- (a) inside `~/Library/` paths the sandbox doesn't mount,
- (b) inside an iMovie library that hasn't exported finished cuts,
- (c) in QuickTime memory but never saved to disk,
- (d) deleted in a prior cleanup pass (the Reflection master is documented as "wiped" in `~/Desktop/IA_AI_LAUNCH_INDEX.md` line 21).

**Path forward:** `scripts/relocate-marketing-videos.sh` was written for Lucas to run on his Mac — uses `mdfind` (Spotlight) to search the entire user filesystem including `~/Library/`, plus QuickTime/Trash/iMovie context. See [`./VIDEO_LOCATION_AUDIT_2026-05-08.md`](./VIDEO_LOCATION_AUDIT_2026-05-08.md) for the full audit doc.

---

## 1. Raw inventory table

Sorted by path. Status legend: **POLISHED** = ready to ship / **DRAFT** = in flight / **WIP** = active but unfinished / **WIP-ABANDONED** = started, paused without ship / **CANON** = locked, don't iterate / **DEPRECATED** = pre-rebrand, do not use.

### `docs/marketing/` top-level (11 .md files)

| File | Type | Format | Status | Modified | One-line summary |
|---|---|---|---|---|---|
| `AD_COPY_AUDIT.md` | brand review | .md | CANON | 2026-04-22 | Tracks every Live Prompter → Practice Prompter ad copy swap; "Ad Copy Audit — Practice Prompter Rebrand" |
| `DONT_BE_A_FRAUD_CAMPAIGN.md` | campaign plan | .md | DRAFT | 2026-04-27 | Anti-cheating positioning campaign (5 PNG creatives in `creatives/`) |
| `GOOGLE_EMAIL_PH_CAMPAIGNS.md` | campaign plan | .md | DRAFT | 2026-04-27 | Google Ads + Email drip + Product Hunt cross-channel matrix |
| `INSTAGRAM_TIKTOK_CAMPAIGNS.md` | campaign plan | .md | DRAFT | 2026-04-27 | IG/TT-specific campaign matrix with hook design |
| `JACOB_TEST_REPORT_TRIAGE_2026-05-08.md` | technical (mis-bucketed) | .md | POLISHED | 2026-05-08 | 30-finding triage + Wave 1 verification cards. **NOT marketing** — should move to `docs/`. |
| `KODA_INF_VERIFICATION_2026-05-08.md` | technical (mis-bucketed) | .md | POLISHED | 2026-05-08 | Jacob's koda-inf audit — 🟢 GREEN. **NOT marketing** — should move to `docs/`. |
| `NEW_AD_CAMPAIGNS_APR24.md` | campaign plan | .md | DRAFT | 2026-04-27 | Apr 24 ad campaign brief (older — may be superseded by `LAUNCH_SEQUENCE.md`) |
| `REDDIT_CAMPAIGNS.md` | campaign plan | .md | DRAFT | 2026-04-27 | Reddit-specific campaign matrix (subreddit targeting + ad copy) |
| `TRY_IT_FIRST_CAMPAIGN.md` | campaign plan | .md | DRAFT | 2026-04-27 | "Try it first" CTA campaign positioning |
| `WEB_ONLY_LAUNCH_WEEK_APR22.md` | campaign plan | .md | WIP-ABANDONED | 2026-04-27 | Apr 22 web-only launch week (older — slipped) |
| (`pixel_install_template.html`) | technical infra | .html | DRAFT | 2026-05-08 | Drop-in Meta + LinkedIn + Reddit pixel template with `<REPLACE_*>` placeholders (pending Lucas's pixel IDs) |

### `docs/marketing/partnerships/USF/` (USF Career Services partnership package — 11 files, ~1.7 MB)

| File | Type | Format | Status | Summary |
|---|---|---|---|---|
| `USF_PACKAGE_README.md` | navigation | .md | POLISHED | **START HERE** for any school conversation. Flags `USF_Proposal_General.html` as Jacob's default read; classifies the 10 other files by audience + use case. |
| `USF_Proposal_General.html` | proposal | .html | POLISHED | **The "general" variant Lucas referenced.** InterviewAnswers.AI pitch, audience-neutral. Use as default for any school. |
| `USF_Proposal_InterviewAnswersAI.pdf` | proposal | .pdf | POLISHED | PDF export of the General proposal — email-attachable. |
| `USF_Proposal_Nursing.html` | proposal | .html | POLISHED | NurseInterviewPro pitch for nursing-focused conversations. |
| `USF_Proposal_NurseInterviewPro.pdf` | proposal | .pdf | POLISHED | PDF export of the Nursing proposal. |
| `USF_Proposal_External.html` | proposal | .html | POLISHED | "External" variant — most generic framing, easiest to adapt for non-USF schools. |
| `USF_Pricing_Model.md` | reference | .md | POLISHED | Pricing economics + cited CA BRN / USF enrollment data. Canonical pricing source. |
| `USF_Pricing_Model.html` | reference | .html | POLISHED | Pricing model rendered for client share. |
| `USF_Pricing_Final.html` | reference | .html | POLISHED | Consolidated pricing analysis. |
| `USF_Pricing_Charts.html` | reference | .html | POLISHED | Chart-only view (cost/seat curves). |
| `USF_Partnership_Analysis.md` | strategic | .md | CANON | **The think-doc.** 12-section strategic analysis — who, why, decision-makers, economics, Erin's terms. Read before any school conversation. |
| `USF_Email_Jessica.html` | outreach | .html | DRAFT | Draft email to Jessica Li (USF contact). Not yet sent per file authorship date. Confirm with Lucas. |

**Origin:** files duplicated from `docs/research/USF_*` (preserved as historical source) + `~/Downloads/USF_Proposal_*.pdf` (originals preserved). Partnerships folder is the curated bundle Jacob uses.

### `docs/marketing/creatives/` (24 assets — statics + HTML mockups + design doc)

| File | Type | Format | Status | Summary |
|---|---|---|---|---|
| `DESIGN_PHILOSOPHY.md` | brand canon | .md | CANON | Brand design rules — typography, color, restraint principles |
| `dont-be-a-fraud-v1-earn-it.png` | ad still | .png | POLISHED | "Don't be a fraud — earn it" v1 ad creative (1200x628) |
| `dont-be-a-fraud-v2-family.png` | ad still | .png | POLISHED | v2 family-themed version |
| `dont-be-a-fraud-v3-nursing.png` | ad still | .png | POLISHED | v3 nursing-track-specific version |
| `dont-be-a-fraud-v4-we-deleted-it.png` | ad still | .png | POLISHED | v4 ethics-pivot referential |
| `dont-be-a-fraud-v5-science.png` | ad still | .png | POLISHED | v5 science-of-practice angle |
| `dont-be-a-fraud.html` | ad mockup | .html | DRAFT | Source HTML for don't-be-a-fraud series |
| `instagram-carousel-cover.html` | ad mockup | .html | DRAFT | IG carousel cover |
| `instagram-carousel-slide.html` | ad mockup | .html | DRAFT | IG carousel inner slide |
| `instagram-story-1.html` | ad mockup | .html | DRAFT | IG story v1 |
| `linkedin-post-image.html` | ad mockup | .html | DRAFT | LinkedIn post image source |
| `product-hunt-gallery-1.html` | ad mockup | .html | DRAFT | Product Hunt gallery slot 1 |
| `reddit-ad-general.html` | ad mockup | .html | DRAFT | Reddit ad — general audience |
| `reddit-ad-nursing.html` | ad mockup | .html | DRAFT | Reddit ad — nursing audience |
| `tiktok-thumbnail.html` | ad mockup | .html | DRAFT | TikTok thumbnail source |
| `try-it-first-v1.png` | ad still | .png | POLISHED | "Try it first" creative v1 (1200x628) |
| `v2-3am.png` + `.html` | ad still | .png/.html | POLISHED | "3am" cinematic still (v2 series) |
| `v2-floor-not-classroom.png` + `.html` | ad still | .png/.html | POLISHED | "Floor not classroom" still |
| `v2-quiet-contrarian.png` + `.html` | ad still | .png/.html | POLISHED | "Quiet contrarian" still |
| `v2-science-of-getting-good.png` + `.html` | ad still | .png/.html | POLISHED | "Science of getting good" still |
| `v2-two-doors.png` + `.html` | ad still | .png/.html | POLISHED | "Two doors" still |

### `docs/marketing/mocks/` (per Launch Index — not visible in sandbox)

| File | Type | Format | Status | Summary |
|---|---|---|---|---|
| `letter_on_screen_v2.mp4` | ad video | .mp4 | POLISHED | 12s typography spot, 1080x1920, 220 KB |
| `wwp_audio_only_v0_5.mp4` | ad video (audio bed) | .mp4 | POLISHED | "What's Worth Practicing" 60s VO over waveform viz, 1080x1920, 11.6 MB |
| `static_a_practice_not_cheat.png` | ad still | .png | POLISHED | 1080x1350, 287 KB |
| `static_b_before_it_happens.png` | ad still | .png | POLISHED | 1080x1080, 325 KB |
| `static_c_testing_effect.png` | ad still | .png | POLISHED | 1080x1080, 49 KB |

### `docs/marketing/practice_ritual/reflection_15s/raw/` (per Launch Index — sandbox sees only .DS_Store)

| File | Type | Status | Summary |
|---|---|---|---|
| `v_no.mp4` | reflection raw clip | POLISHED | 8s, 1920x1080, 5.1 MB |
| `v3.mp4` | reflection raw clip | POLISHED | 8s, 1280x720, 3.2 MB |
| `v_doomscroll.mp4` | reflection raw clip | POLISHED | 8s, 1280x720, 1.7 MB |
| `v_offer_v3.mp4` | reflection raw clip | POLISHED | 8s, 1280x720, 1.0 MB |
| `v_email_v3.mp4` | reflection raw clip | POLISHED | 8s, 1280x720, 1.0 MB |

**Reflection 15s master cut was wiped** — `REBUILD_EXECUTION_PROMPTS.md` documents regeneration steps.

### `docs/marketing/practice_ritual/cinematic_v1/` — 3-spot pack (per Launch Index — sandbox-invisible content)

Three spots, each with 9 artifacts (research_brief, storyboard, visual_direction, marketing_prompts, audio_brief, audit_log, finance_plan, media_test_plan, supervisor_log).

| Spot | Path | Status | Cost | Hard cap |
|---|---|---|---|---|
| **γ — "The Object That Was Waiting"** | `cinematic_v1/object_waiting/` | Phase 0 complete (9/9 artifacts); Phase 1 awaiting Owner gate | $11.30 expected | $25 hard cap |
| **β — "The Practice Made Visible"** | `cinematic_v1/practice_visible/` | Phase 0 complete; gated on γ Phase 1 closure | $14.40 expected | $35 hard cap |
| **ε — "The Walk-and-React"** | `cinematic_v1/walk_and_react/` | Phase 0 complete; gated on β Phase 1 closure | $11.20 expected | $30 hard cap |
| **Cross-spot** | `cinematic_v1/CROSS_SPOT_AUDITOR_LEDGER.md` | CANON | — | — |

Combined media test $900 (3 × $300, Days 4–13). Total production expected $36.90 / hard cap $90. **γ killed in prior session**; β + ε have raw clips on disk but Lucas paused on smoke/brightness fixes.

### Brand canon + launch docs in `docs/` (top-level — marketing-flavored)

| File | Type | Status | Summary |
|---|---|---|---|
| `BLOG_WHY_WE_REMOVED_LIVE_PROMPTER.md` | brand canon (blog post) | CANON | Ethics-pivot blog — explains deletion of in-interview live-prompter feature |
| `LAUNCH_PLAN_V2_APR22.md` | campaign plan | WIP-ABANDONED | Apr 22 30-day launch playbook (slipped) |
| `LAUNCH_DAY1_ACTION_CARD.md` | campaign plan | WIP-ABANDONED | Day 1 action card (Apr 22 plan) |
| `LAUNCH_DAY_OPS_CARD.md` | campaign plan | DRAFT | 6 dashboards to have open on launch day |
| `LAUNCH_REVIEW_APR22.md` | brand review | CANON | Auditor pass on launch plan |
| `LAUNCH_BUDGET_APR22.md` | metrics / budget | CANON | 30-day budget + CAC math |
| `LINKEDIN_LAUNCH_KIT.md` | campaign plan | DRAFT | LinkedIn launch copy + kit |
| `PRODUCTHUNT_LAUNCH_KIT.md` | campaign plan | DRAFT | Product Hunt kit |
| `GOOGLE_ADS_PLAYBOOK.md` | campaign plan | DRAFT | Google Ads campaign template |
| `OVERNIGHT_SENSATION_PLAN.md` | campaign plan | DRAFT | 30-day overnight push plan |
| `COMPETITIVE_POSITIONING_APR22.md` | brand canon | CANON | Competitive brief — positioning against incumbent prep tools |
| `NEXT_LEVEL_RESEARCH.md` | research | DRAFT | "Next-level moves" research synthesis |
| `DESIGN_DIRECTION.md` | brand canon | CANON | Design system / brand voice |
| `COST_ANALYSIS.md` / `_DETAILED.md` | metrics | CANON | Unit economics |
| `EMAIL_SETUP_GUIDE.md` | technical infra | DRAFT | Resend / DKIM / SPF email deliverability |
| `CRISIS_SPRINT_HANDOFF_APR25.md` | brand review | CANON (snapshot) | Apr 25-26 crisis sprint scope |
| `SHIP_PACKAGE_APR24.md` | campaign plan | CANON (snapshot) | Apr 24 ad rebuild sprint scope |
| `BATTLE_SCARS.md` | technical (also brand) | CANON | Lesson #20: "Erin's feedback is product truth" — brand-relevant |

### `docs/research/` (9 files)

| File | Type | Status | Summary |
|---|---|---|---|
| `Master_Strategy_v2.docx` | brand canon | CANON | Master strategy document |
| `USF_Partnership_Analysis.md` | research | CANON (decided no) | USF nursing-track partnership analysis |
| `USF_Pricing_Model.md` + `.html` | research | CANON | Pricing model exploration |
| `USF_Pricing_Charts.html`, `_Final.html` | research | CANON | Visual pricing charts |
| `USF_Proposal_External.html`, `_General.html`, `_Nursing.html` | research | CANON | USF proposal drafts |
| `USF_Email_Jessica.html` | research | CANON | USF outreach email |
| `ERIN_Pricing_Review.md` | research | CANON | Erin's clinical-lens pricing review |
| `agent_run_apr11/` | research | (subfolder) | Agent run logs from Apr 11 |

### `~/Desktop/IA_AI_LAUNCH_INDEX.md` (master index — outside repo)

**Type:** Master pointer doc. **Status:** CANON. **Updated:** 2026-05-07 evening.
**Summary:** Single source of truth for "where every launch asset lives on Lucas's Mac." Cross-links every cinematic pack artifact, every static, every reflection raw clip, every ad mockup, every brand canon doc.

---

## 2. Categorized view (Phase 2)

Same assets, grouped by role.

### BRAND CANON (locked — don't iterate)
- `BLOG_WHY_WE_REMOVED_LIVE_PROMPTER.md` — the ethics-pivot blog (the wedge)
- `COMPETITIVE_POSITIONING_APR22.md` — Patagonia / DuckDuckGo / Signal restraint frame
- `DESIGN_DIRECTION.md` — brand voice + design system
- `docs/research/Master_Strategy_v2.docx` — master strategy
- `creatives/DESIGN_PHILOSOPHY.md` — visual design principles
- `marketing/AD_COPY_AUDIT.md` — Live Prompter → Practice Prompter rebrand canon

### CREATIVE — VIDEO ADS
- `mocks/letter_on_screen_v2.mp4` — 12s typography spot ✅ shipped
- `mocks/wwp_audio_only_v0_5.mp4` — 60s "What's Worth Practicing" VO over waveform ✅ shipped
- Reflection 15s — master cut **WIPED**, raw clips intact, rebuild via `REBUILD_EXECUTION_PROMPTS.md`
- Cinematic pack γ / β / ε — Phase 0 artifacts done, Phase 1 production paused
- Spot 5 Transformation (Aaliyah / nursing) — built in prior session, on Lucas's Mac

### CREATIVE — STATIC
- `mocks/static_a_practice_not_cheat.png` (1080x1350)
- `mocks/static_b_before_it_happens.png` (1080x1080)
- `mocks/static_c_testing_effect.png` (1080x1080)
- `creatives/v2-3am.png`, `v2-quiet-contrarian.png`, `v2-floor-not-classroom.png`, `v2-science-of-getting-good.png`, `v2-two-doors.png`
- `creatives/dont-be-a-fraud-v1` through `v5` (5 versions)
- `creatives/try-it-first-v1.png`

### CREATIVE — STORYBOARDS
- `practice_ritual/cinematic_v1/object_waiting/storyboard.md` (γ)
- `practice_ritual/cinematic_v1/practice_visible/storyboard.md` (β)
- `practice_ritual/cinematic_v1/walk_and_react/storyboard.md` (ε)
- (Per Launch Index — sandbox-invisible)

### COPY
- `BLOG_WHY_WE_REMOVED_LIVE_PROMPTER.md` — the foundational blog post
- LinkedIn Launch Kit + Product Hunt Kit — drafts for specific channel posts
- Don't-be-a-fraud HTML mockups + Reddit/IG/TikTok HTML — copy embedded in design

### CAMPAIGN PLANS
- `LAUNCH_PLAN_V2_APR22.md` — 30-day playbook (older, slipped)
- `OVERNIGHT_SENSATION_PLAN.md` — overnight push
- `marketing/GOOGLE_EMAIL_PH_CAMPAIGNS.md`, `INSTAGRAM_TIKTOK_CAMPAIGNS.md`, `REDDIT_CAMPAIGNS.md` — channel-specific matrices
- `marketing/DONT_BE_A_FRAUD_CAMPAIGN.md`, `TRY_IT_FIRST_CAMPAIGN.md` — campaign-themed
- `marketing/NEW_AD_CAMPAIGNS_APR24.md`, `WEB_ONLY_LAUNCH_WEEK_APR22.md` — older, may be superseded

### BRAND REVIEWS / AUDITS
- `AD_COPY_AUDIT.md` — rebrand audit
- `LAUNCH_REVIEW_APR22.md` — auditor pass on launch plan
- `CRISIS_SPRINT_HANDOFF_APR25.md` — sprint scope
- `SHIP_PACKAGE_APR24.md` — ad rebuild sprint
- Per Launch Index: motion-prompt v2 refactor doc + cross-spot Auditor ledger (cinematic pack)

### METRICS / DECISIONS
- `LAUNCH_BUDGET_APR22.md` — 30-day budget + CAC math
- `COST_ANALYSIS.md` / `_DETAILED.md` — unit economics
- `docs/research/USF_Pricing_Model.md` + `ERIN_Pricing_Review.md` — pricing analysis
- (Forthcoming) `MARKETING_DECISIONS_PENDING_2026-05-08.md` — this doc set's decisions list

### TECHNICAL (flagged — not marketing per se)
- `marketing/pixel_install_template.html` — Meta + LinkedIn + Reddit pixel drop-in (waiting on Pixel IDs)
- `marketing/JACOB_TEST_REPORT_TRIAGE_2026-05-08.md` — **mis-bucketed**, move to `docs/`
- `marketing/KODA_INF_VERIFICATION_2026-05-08.md` — **mis-bucketed**, move to `docs/`
- `EMAIL_SETUP_GUIDE.md` — Resend / DKIM / SPF infra

### MARKETING AGENTS (retrieved from Lucas's Notes — Phase 3)
- See `MARKETING_AGENTS.md` once retrieved. Phase 3 currently **BLOCKED** — Notes access requires `request_access` Lucas-approval which can't proceed autonomously. Lucas needs to either approve when back at Mac OR paste agent definitions in chat.

---

## 3. Sandbox visibility gaps (flag for Lucas)

These items are documented in `~/Desktop/IA_AI_LAUNCH_INDEX.md` but the sandbox sees only `.DS_Store` placeholders for the parent directories:

- `docs/marketing/mocks/` — referenced for `letter_on_screen_v2.mp4`, `wwp_audio_only_v0_5.mp4`, `static_a/b/c_*.png`. Should be 5 files; sandbox sees 0.
- `docs/marketing/practice_ritual/cinematic_v1/` — referenced for 3 spots × 9 artifacts = 27 markdown files + `CROSS_SPOT_AUDITOR_LEDGER.md`. Sandbox sees 0.
- `docs/marketing/practice_ritual/reflection_15s/raw/` — referenced for 5 raw .mp4 clips. Sandbox sees 0.

**Assumed root cause:** these directories exist on Lucas's Mac but aren't tracked by git (large binary files + .DS_Store-only directories don't propagate the way text files do; possibly gitignored or in a separate workspace). The Launch Index is the authoritative pointer.

**Recommended action:** Lucas confirms when next at Mac that the Launch Index paths are still accurate. If any have moved or been wiped, update the index.

---

End of inventory. Total marketing-flavored assets catalogued: **~85** (11 marketing/.md + 24 creatives + ~10 mocks/practice_ritual binaries via Launch Index + 27 cinematic Phase 0 artifacts + 9 research + 18 brand-canon docs in `docs/`).
