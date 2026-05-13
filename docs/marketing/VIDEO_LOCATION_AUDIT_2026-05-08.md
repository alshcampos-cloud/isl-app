# Video Location Audit
**Date:** 2026-05-12 (search performed); doc dated 2026-05-08 to match the inventory cohort
**Authored by:** Cowork (autonomous Mac-mounted-filesystem search)
**Method:** Exhaustive `find` walk across all mounted folders (Downloads, Documents, Movies, Desktop, Pictures, Mobile Documents/iCloud). Sandbox is Linux, so `mdfind`/`lsof`/`defaults` not available — those queries are deferred to the Mac-side script in `scripts/relocate-marketing-videos.sh`.

## TL;DR

**Polished launch creative referenced in `~/Desktop/IA_AI_LAUNCH_INDEX.md` is NOT in the mounted filesystem.** Zero matches for `spot5`, `reflection`, `letter_on_screen`, `wwp`, `joy_spot`, `object_waiting`, `practice_visible`, `walk_and_react`, `v_aaliyah`, `v_eyeglass`, `v_kitchen`, `v_lobby`, `master_9x16`, `master_16x9`, `master_1x1`, `v51`. Lucas needs to run the Mac-side `mdfind`-based search (script provided) to surface them — they may live in `~/Library/` paths the sandbox can't reach, or may have been deleted/moved.

## Search scope (Linux-sandbox-reachable)

| Folder | Mount path | Result |
|---|---|---|
| `~/Downloads` | `mnt/Downloads` | 16 mp4/mov; all personal/academic. Zero marketing-named. |
| `~/Documents` | `mnt/Documents` | 29 mp4 (mostly Zoom recordings); zero marketing-named. |
| `~/Movies` | `mnt/Movies` | 1 mp4 (iMovie library — `RPReplay_Final1729084747.mp4`, ~1MB, unclear contents) |
| `~/Desktop` | `mnt/Desktop` | ~50 mp4/mov; zero marketing-named. Three iOS Simulator Screen Recordings (33 MB, 85 MB, 259 MB) in `AppStoreAssets/General/Video/` — App Store screenshot captures, not launch creative. |
| `~/Pictures` | `mnt/Pictures` | Photos Library + Lightroom Library (not searched — too large; Photos+Videos there if any) |
| `~/Library/Mobile Documents` (iCloud) | `mnt/Mobile Documents` | 1 mp4 (`Heat Presentation 540.mp4` — academic). Zero marketing. |
| `isl-complete` repo | `mnt/isl-complete` | 2 mp4 files: `ads/app-recording.mp4` (326K), `ads/app-clip-15s.mp4` (104K). Both gitignored (`ads/` in `.gitignore`). |

## Mapping table — actual findings → canonical repo paths

| Current location | Canonical repo path | Action |
|---|---|---|
| `~/Downloads/isl-complete/ads/app-recording.mp4` (326K) | `ads/app-recording.mp4` (already there) | **SKIP — gitignored.** Decide whether to ungitignore or move to `docs/marketing/legacy/` |
| `~/Downloads/isl-complete/ads/app-clip-15s.mp4` (104K) | `ads/app-clip-15s.mp4` (already there) | **SKIP — gitignored.** Same as above |
| `~/Desktop/AppStoreAssets/General/Video/*.mov` (33 MB, 85 MB, 259 MB iOS sim recordings) | TBD — either `docs/marketing/ads/app_screenshots/` or out-of-repo | **FLAG.** Lucas decides: are these marketing-usable, or App Store screenshot raws only? |
| `~/Movies/iMovie Library.imovielibrary/My Movie/Original Media/RPReplay_Final1729084747.mp4` | TBD | **FLAG.** Unclear contents — Lucas verify. |

## Canonical paths expected per Launch Index — status

| Canonical path | Expected file | Found? |
|---|---|---|
| `docs/marketing/mocks/letter_on_screen_v2.mp4` (12.0s, 220 KB) | Typography spot | ❌ Not in mounted FS |
| `docs/marketing/mocks/wwp_audio_only_v0_5.mp4` (60.0s, 11.6 MB) | WWP VO + waveform | ❌ Not in mounted FS |
| `docs/marketing/mocks/static_a_practice_not_cheat.png` (287 KB) | Static A | ❌ Not in mounted FS |
| `docs/marketing/mocks/static_b_before_it_happens.png` (325 KB) | Static B | ❌ Not in mounted FS |
| `docs/marketing/mocks/static_c_testing_effect.png` (49 KB) | Static C | ❌ Not in mounted FS |
| `docs/marketing/practice_ritual/reflection_15s/raw/v_no.mp4` (5.1 MB) | Reflection raw | ❌ Not in mounted FS |
| `docs/marketing/practice_ritual/reflection_15s/raw/v3.mp4` (3.2 MB) | Reflection raw | ❌ Not in mounted FS |
| `docs/marketing/practice_ritual/reflection_15s/raw/v_doomscroll.mp4` (1.7 MB) | Reflection raw | ❌ Not in mounted FS |
| `docs/marketing/practice_ritual/reflection_15s/raw/v_offer_v3.mp4` (1.0 MB) | Reflection raw | ❌ Not in mounted FS |
| `docs/marketing/practice_ritual/reflection_15s/raw/v_email_v3.mp4` (1.0 MB) | Reflection raw | ❌ Not in mounted FS |
| `docs/marketing/practice_ritual/cinematic_v1/object_waiting/output/` | γ master cuts (Phase 1 incomplete) | ⏸ Phase 1 was paused — likely doesn't exist yet |
| `docs/marketing/practice_ritual/cinematic_v1/practice_visible/output/` | β master cuts (Phase 1 incomplete) | ⏸ Same as above |
| `docs/marketing/practice_ritual/cinematic_v1/walk_and_react/output/` | ε master cuts (Phase 1 incomplete) | ⏸ Same as above |
| `docs/marketing/practice_ritual/spot5_transformation/output/master.mp4` | Spot 5 final | ❌ Not in mounted FS |
| `docs/marketing/practice_ritual/whats_worth_practicing_60s/output/` | WWP video (D5 decision pending) | ⏸ Not built yet (D5) |
| `docs/marketing/practice_ritual/joy_spot/output/` | Joy Spot (D8 decision pending) | ⏸ Not built yet (D8) |

**Status legend:** ❌ = expected but missing from sandbox-reachable FS. ⏸ = expected to not exist (production paused/pending). The ❌ rows are the ones Lucas needs to find or rebuild.

## Hypotheses for the missing files

1. **They live outside mounted folders.** Most likely: `~/Library/Application Support/<something>/`, `~/Library/Caches/`, or in a Time Machine backup. The sandbox doesn't see `~/Library` except `~/Library/Mobile Documents`.
2. **They were deleted in a cleanup pass.** Possible — particularly the Reflection master was documented as "wiped" in `~/Desktop/IA_AI_LAUNCH_INDEX.md` line 21. The other files may have been removed in parallel cleanup.
3. **They are open in QuickTime, never saved to disk.** QuickTime's "Untitled.mov" doesn't write to disk until you File→Save. Lucas, check QuickTime's open documents.
4. **They live in a non-mounted folder.** E.g., `~/Sites/`, `~/Workspace/`, or a custom-named project folder.

## Recommendation

Run `scripts/relocate-marketing-videos.sh` on the Mac (provided as Phase C of this consolidation). The script uses `mdfind` (macOS Spotlight) to comprehensively search the entire user filesystem — including `~/Library/` paths the sandbox can't reach — for any video matching the canonical names. If files are found, the script copies them into the repo working tree; if not, it produces a manifest of what's missing so Lucas can decide: rebuild from raw clips, restore from Time Machine, or accept the loss and re-plan.

## Action items for Lucas

1. Run `bash scripts/relocate-marketing-videos.sh --audit` first (read-only, just lists what mdfind finds).
2. Review the audit output. Tell Cowork (or Jacob) where the missing files actually live — or confirm they're gone.
3. If recoverable: run `bash scripts/relocate-marketing-videos.sh --copy` to move them into the repo working tree.
4. After copy: `git status docs/marketing/` to see the new files, then `git add docs/marketing/` + commit.
5. Update Launch Index paths or this audit doc to reflect new reality.

---

— Cowork (read-only mandate maintained for sandbox; Mac-side script does the actual work locally)
