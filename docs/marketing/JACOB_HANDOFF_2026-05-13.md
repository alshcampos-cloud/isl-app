# Jacob Handoff — Marketing Pivot Landing
**Date:** 2026-05-13
**From:** Lucas (via Cowork)
**To:** Jacob Bernal
**Branch:** `fix/jacob-followup-patches` (current) — or split into a new `feature/marketing-pivot` branch

This is the bundle of marketing work to commit, push, and hand off. Once it's on GitHub, send Jacob the email at the bottom of this doc.

---

## Step 1 — Push to GitHub (run in your Mac Terminal)

The sandbox couldn't write to `.git/index.lock` (locked by a different process). Run these commands from your Mac terminal:

```bash
cd ~/Downloads/isl-complete

# 1. Remove stale lock file (sandbox couldn't clear this)
rm -f .git/index.lock

# 2. Confirm what's about to be staged (should show ~17 marketing+scripts items)
git status --short docs/marketing/ scripts/

# 3. Stage the marketing pivot work only (leave engineering alone)
git add docs/marketing/ scripts/

# 4. Commit with the message below
git commit -m "marketing: full pivot landing — 7 spots, v2 agents roster, USF package, recovery tooling

Recovered, rebuilt, and consolidated the IA.ai marketing creative work for Jacob's handoff.

VIDEO COMPOSITIONS BUILT
- FINAL Reflection 15s with Adam Prime VO (K1 eyeglass → K2 kitchen → K3 lobby + Beat 1.5 second-monitor insert)
- γ Object Waiting (4-beat bottle/Soon-note sequence)
- β Practice Made Visible (7-beat Camila arc)
- ε Walk-and-React (8-beat Ethan arc)
- Reflection 15s silent backup
- Spot 5 Transformation (single Aaliyah anchor, needs more keyframes)
- Letter on Screen v2 (typography refusal narrative, regen)

RAW INGREDIENTS STAGED
- 24 production beat-numbered keyframes (K1/K2/K3 + cinematic beats)
- 35 recovered AI Studio Nano Banana Pro keyframes
- 7 Veo motion gens (4 Reflection, 1 walk_and_react, 2 practice_visible)
- 12 ElevenLabs VO files (Brian, Victor Voss, Adam Prime variants)

DOCS
- MARKETING_AGENTS_v2.md (canonical 12-specialist operating manual, locked 2026-04-29)
- MARKETING_FOR_JACOB_PRIMER.md (~10-min onboarding)
- MARKETING_DECISIONS_PENDING_2026-05-08.md (11 open decisions tiered)
- MARKETING_INVENTORY_2026-05-08.md (full asset audit)
- VIDEO_LOCATION_AUDIT_2026-05-08.md (filesystem recovery audit)
- USF partnerships package (11 files, full pitch bundle)
- 11 GitHub Issue drafts in _issue_drafts/

SCRIPTS
- build_all_compositions.sh, build_cinematic_compositions.sh, build_letter_on_screen_v2.sh
- copy-downloaded-videos-to-repo.sh, relocate-marketing-videos.sh
- flow-clip-download-helper.js (paste-into-DevTools)

Read-only mandate on engineering code held — no .jsx/.js/backend touched.

For Jacob: start with docs/marketing/MARKETING_FOR_JACOB_PRIMER.md then
docs/marketing/MARKETING_AGENTS_v2.md."

# 5. Push to GitHub (you'll need creds — Keychain should auto-fill)
git push origin fix/jacob-followup-patches
```

**If you'd rather isolate this on its own branch:**

```bash
# Instead of staying on fix/jacob-followup-patches, create a new branch first:
git checkout -b feature/marketing-pivot-2026-05-13
git add docs/marketing/ scripts/
git commit -m "<paste the same message as above>"
git push -u origin feature/marketing-pivot-2026-05-13
```

Then open a PR on GitHub from that branch to `main` so Jacob can review the bundle as one unit before merge.

---

## Step 2 — Send Jacob the email

Subject: **`Marketing pivot is live in the repo — your turn to drive`**

Body:

> Hey Jacob,
>
> I'm pivoting fully to marketing and I want you in the driver's seat for the mechanics, attribution, and channel work. There's a fresh bundle on the repo — branch `fix/jacob-followup-patches` (or the marketing pivot branch if I split it). Pull the latest and read in this order:
>
> 1. **`docs/marketing/MARKETING_FOR_JACOB_PRIMER.md`** — ~10-minute read. Where I'm coming from on brand position (Patagonia restraint / "practice not cheat" wedge), what channels we've tried, key terminology (CAC / LTV / ROAS / kill-switch math), what's locked vs. negotiable for you, and the first 3 calls I want your engineering lens on.
>
> 2. **`docs/marketing/MARKETING_AGENTS_v2.md`** — the locked 2026-04-29 12-specialist operating manual for *The Reflection* 20s spot. This is the contract. If a role drifts, the Boundary statement at the end of each section is how the Supervisor adjudicates. You won't be all 12 agents; you'll mostly be Coder B (FFmpeg / build pipeline), Pro AI Marketing Researcher (hook variants, kill-switch math), and Auditor (the andon cord). Read all 12 anyway so you know who's doing what.
>
> 3. **`docs/marketing/MARKETING_DECISIONS_PENDING_2026-05-08.md`** — 11 open decisions tiered 🔴 BLOCKING / 🟡 SOON / 🟢 LATER. The three I want your read on first are pixel install (D1), the $390 Ad #2 kill-switch test (D2), and the LinkedIn founder essay timing (D3). I've drafted GitHub Issue bodies for each at `docs/marketing/_issue_drafts/` — open them as issues so we can discuss in thread.
>
> 4. **`docs/marketing/README.md`** — single-page master index. Points at everything. Includes the 7 video compositions I just rebuilt (the FINAL Reflection-15s-with-Adam-VO master lives at `docs/marketing/practice_ritual/reflection_15s/output/master_FINAL_no_cheating_adam_v2.mp4` — 1.5 MB, 15.1s, K1→K2→K3 imagery, Adam Prime VO, -14 LUFS mix).
>
> **What you can start on this week (in priority order):**
>
> - **(a) Pixel install audit** — open `docs/marketing/_issue_drafts/decision-01-install-pixels-now.md`, copy into a GitHub Issue, and reply in-thread with the install playbook + QA checklist you'd run. I've been blocked on Meta Business Manager perms for a month; need an engineering eye on whether to power through or pivot to Conversions API direct.
>
> - **(b) Composition QC** — preview the 7 spots in `docs/marketing/practice_ritual/.../output/` directories. The FINAL Reflection one is in good shape. The cinematic-pack stills (γ/β/ε) are organic-LinkedIn ready but not paid-amplification ready. Tell me which of the 7 you'd actually ship to paid and which need motion/VO/captions before they're worth spending dollars behind.
>
> - **(c) USF partnership package familiarization** — there's a school we're talking to (Career Services at USF San Francisco). The full pitch bundle is in `docs/marketing/partnerships/USF/` — start with `USF_PACKAGE_README.md`. If you talk to any school, use `USF_Proposal_General.html` as the default. The pricing math is in `USF_Pricing_Model.md`.
>
> **What's still missing (for context):**
>
> - WWP audio-only v0.5 (the 60s waveform-viz VO spot) — we have the VO files in `docs/marketing/practice_ritual/reflection_15s/audio/` and the script in the repo, but the final waveform mix wasn't rebuilt this session.
> - Joy Spot — Phase 0 only, gated on Reflection paid signal per D8.
> - Apple Build 43 launch — App Store approval timing is the unknown.
>
> **One thing I'm thinking about for the next spot:** there's a new angle I had a great conversation about with a coworker yesterday — the high-experience professionals going up against new grads for the same not-always-great jobs in this market, and how IA.ai's value is bringing out genuine response and genuine experience (vs. generic muffled answers). That's the next commercial concept I want to build. I'll write the brief separately and we can collaborate on the production. Read `MARKETING_AGENTS_v2.md` first so we're operating from the same role contract when I do.
>
> Brand voice is locked. Pricing is locked. Mechanics, distribution, attribution, optimization — that's your authoring lane.
>
> Let me know when you've read through and I'll set up 30 minutes to align on the three blocking calls.
>
> — Lucas

---

## Files in this commit (final tally)

**`docs/marketing/`** (11 top-level docs + 4 subfolders):
- `README.md` — master index
- `MARKETING_AGENTS_v2.md` — canonical 12-specialist roster
- `MARKETING_AGENTS.md` — v1 stub (superseded, kept for history)
- `MARKETING_FOR_JACOB_PRIMER.md` — onboarding
- `MARKETING_DECISIONS_PENDING_2026-05-08.md` — 11 open decisions
- `MARKETING_INVENTORY_2026-05-08.md` — asset audit
- `VIDEO_LOCATION_AUDIT_2026-05-08.md` — filesystem recovery audit
- `JACOB_HANDOFF_2026-05-13.md` — this doc
- `_issue_drafts/` — 11 GitHub Issue templates + README
- `mocks/` — letter_on_screen_v2.mp4
- `partnerships/USF/` — 11-file USF pitch bundle
- `practice_ritual/` — keyframes, raw Veo gens, audio, output masters for 5 spots

**`scripts/`** (6 reusable tools):
- `build_all_compositions.sh`
- `build_cinematic_compositions.sh`
- `build_letter_on_screen_v2.sh`
- `copy-downloaded-videos-to-repo.sh`
- `flow-clip-download-helper.js`
- `relocate-marketing-videos.sh`

**Not committed (deliberately, engineering territory):**
- Anything under `src/`, `supabase/`, `ios/`, `koda-inf/`
- `.claude/settings.local.json`
- `docs/JACOB_PR_22_24_REVIEW_2026-05-12.md` (engineering review, separate concern)

---

— Cowork (read-only on engineering code held; marketing work committed)
