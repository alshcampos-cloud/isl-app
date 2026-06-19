#!/usr/bin/env bash
#
# relocate-marketing-videos.sh
# ----------------------------
# Find marketing videos anywhere on Lucas's Mac, classify them against
# canonical repo paths, optionally copy them into the working tree.
#
# Read-only by default. The --copy flag actually moves bytes.
#
# Usage:
#   bash scripts/relocate-marketing-videos.sh                # same as --audit
#   bash scripts/relocate-marketing-videos.sh --audit        # lists findings only
#   bash scripts/relocate-marketing-videos.sh --copy         # copies into repo
#   bash scripts/relocate-marketing-videos.sh --help
#
# Authored by Cowork 2026-05-12. Single-file, no deps beyond macOS built-ins.

set -euo pipefail

# --------------------------------------------------------------------------
# Config
# --------------------------------------------------------------------------
REPO_ROOT="${REPO_ROOT:-$(cd "$(dirname "$0")/.." && pwd)}"
MARKETING_ROOT="$REPO_ROOT/docs/marketing"
MANIFEST="$REPO_ROOT/docs/marketing/VIDEO_RELOCATION_MANIFEST_$(date +%Y-%m-%d).md"

MODE="audit"
case "${1:-}" in
  --copy)  MODE="copy" ;;
  --audit) MODE="audit" ;;
  --help|-h)
    sed -n '3,18p' "$0"
    exit 0
    ;;
  "") MODE="audit" ;;
  *)
    echo "Unknown flag: $1. Use --audit, --copy, or --help."
    exit 1
    ;;
esac

# --------------------------------------------------------------------------
# Canonical-path mapping
# --------------------------------------------------------------------------
# Each entry: pattern | canonical_dest_dir | description
declare -a MAPPINGS=(
  "letter_on_screen|docs/marketing/mocks|Letter on Screen typography spot"
  "wwp_audio_only|docs/marketing/mocks|WWP audio-only 60s VO bed"
  "wwp_video|docs/marketing/practice_ritual/whats_worth_practicing_60s/output|WWP video version (D5)"
  "static_a_practice|docs/marketing/mocks|Static A (practice-not-cheat)"
  "static_b_before|docs/marketing/mocks|Static B (before-it-happens)"
  "static_c_testing|docs/marketing/mocks|Static C (testing-effect)"
  "spot5|docs/marketing/practice_ritual/spot5_transformation/output|Spot 5 Transformation master cut"
  "aaliyah|docs/marketing/practice_ritual/spot5_transformation/raw|Spot 5 raw clips (Aaliyah)"
  "v_aaliyah|docs/marketing/practice_ritual/spot5_transformation/raw|Spot 5 motion gens"
  "reflection_15s|docs/marketing/practice_ritual/reflection_15s/output|Reflection 15s master cut"
  "v51|docs/marketing/practice_ritual/reflection_15s/output|Reflection v5.1 master"
  "v_no|docs/marketing/practice_ritual/reflection_15s/raw|Reflection raw — v_no"
  "v_doomscroll|docs/marketing/practice_ritual/reflection_15s/raw|Reflection raw — v_doomscroll"
  "v_offer|docs/marketing/practice_ritual/reflection_15s/raw|Reflection raw — v_offer"
  "v_email|docs/marketing/practice_ritual/reflection_15s/raw|Reflection raw — v_email"
  "v_eyeglass|docs/marketing/practice_ritual/reflection_15s/raw|Reflection raw — v_eyeglass (K1)"
  "v_kitchen|docs/marketing/practice_ritual/reflection_15s/raw|Reflection raw — v_kitchen (K2)"
  "v_lobby|docs/marketing/practice_ritual/reflection_15s/raw|Reflection raw — v_lobby (K3)"
  "object_waiting|docs/marketing/practice_ritual/cinematic_v1/object_waiting/output|γ master cut"
  "practice_visible|docs/marketing/practice_ritual/cinematic_v1/practice_visible/output|β master cut"
  "practice_made_visible|docs/marketing/practice_ritual/cinematic_v1/practice_visible/output|β master cut"
  "walk_and_react|docs/marketing/practice_ritual/cinematic_v1/walk_and_react/output|ε master cut"
  "joy_spot|docs/marketing/practice_ritual/joy_spot/output|Joy Spot (D8, may not exist yet)"
  "master_9x16|docs/marketing/_master_cuts/9x16|Generic 9:16 master — TBD per filename"
  "master_16x9|docs/marketing/_master_cuts/16x9|Generic 16:9 master — TBD per filename"
  "master_1x1|docs/marketing/_master_cuts/1x1|Generic 1:1 master — TBD per filename"
)

# --------------------------------------------------------------------------
# Helpers
# --------------------------------------------------------------------------
ensure_macos() {
  if ! command -v mdfind >/dev/null 2>&1; then
    echo "ERROR: this script needs to run on macOS (mdfind not found)."
    echo "If you're running this in a Linux container, run it on your Mac instead."
    exit 2
  fi
}

human_size() {
  local bytes="$1"
  if   [[ $bytes -lt 1024 ]];          then echo "${bytes}B"
  elif [[ $bytes -lt 1048576 ]];       then echo "$((bytes/1024))K"
  elif [[ $bytes -lt 1073741824 ]];    then echo "$((bytes/1048576))M"
  else                                       echo "$((bytes/1073741824))G"
  fi
}

start_manifest() {
  cat > "$MANIFEST" <<EOF
# Video Relocation Manifest
**Generated:** $(date '+%Y-%m-%d %H:%M:%S %Z')
**Mode:** $MODE
**Repo root:** $REPO_ROOT

---

EOF
}

append_manifest() {
  echo "$*" >> "$MANIFEST"
}

# --------------------------------------------------------------------------
# Phase 1 — Spotlight search (mdfind)
# --------------------------------------------------------------------------
spotlight_search() {
  local pattern="$1"
  # Search Spotlight by filename (case-insensitive)
  mdfind -name "$pattern" 2>/dev/null | grep -iE '\.(mp4|mov|m4v|wav|mp3)$' | sort -u
}

# --------------------------------------------------------------------------
# Phase 2 — Find by full canonical name with mp4/mov extension
# --------------------------------------------------------------------------
deep_search() {
  echo
  echo "Searching for marketing videos via Spotlight + filesystem walk..."
  echo

  # Per-mapping search
  for entry in "${MAPPINGS[@]}"; do
    IFS="|" read -r pattern dest_subpath description <<< "$entry"
    local dest="$REPO_ROOT/$dest_subpath"

    # Find matches
    local matches
    matches=$(spotlight_search "$pattern" || true)

    if [[ -z "$matches" ]]; then
      append_manifest "## ❌ $description"
      append_manifest "**Pattern:** \`$pattern\`"
      append_manifest "**Canonical destination:** \`$dest_subpath/\`"
      append_manifest "**Status:** Not found on this Mac."
      append_manifest ""
      continue
    fi

    append_manifest "## ✅ $description"
    append_manifest "**Pattern:** \`$pattern\`"
    append_manifest "**Canonical destination:** \`$dest_subpath/\`"
    append_manifest ""
    append_manifest "| Source path | Size | Action |"
    append_manifest "|---|---|---|"

    while IFS= read -r source_path; do
      [[ -z "$source_path" ]] && continue
      local size_bytes
      size_bytes=$(stat -f%z "$source_path" 2>/dev/null || echo 0)
      local size_human
      size_human=$(human_size "$size_bytes")

      local action="**AUDIT only — no copy**"
      if [[ "$MODE" == "copy" ]]; then
        mkdir -p "$dest"
        local basename_file
        basename_file=$(basename "$source_path")
        local dest_file="$dest/$basename_file"

        # Skip if source IS the dest (don't loop)
        if [[ "$(cd "$(dirname "$source_path")" && pwd)/$basename_file" == "$dest_file" ]]; then
          action="SKIP (already at canonical path)"
        elif [[ -f "$dest_file" ]]; then
          local dest_size
          dest_size=$(stat -f%z "$dest_file" 2>/dev/null || echo 0)
          if [[ "$dest_size" == "$size_bytes" ]]; then
            action="SKIP (already copied, sizes match)"
          else
            action="**CONFLICT** — file exists at dest with different size; manual review"
          fi
        else
          cp -p "$source_path" "$dest_file"
          local copied_size
          copied_size=$(stat -f%z "$dest_file" 2>/dev/null || echo 0)
          if [[ "$copied_size" == "$size_bytes" ]]; then
            action="COPIED → \`$dest_subpath/$basename_file\` ($size_human)"
          else
            action="**COPY FAILED** — size mismatch ($size_bytes vs $copied_size)"
          fi
        fi
      fi
      append_manifest "| \`$source_path\` | $size_human | $action |"
    done <<< "$matches"
    append_manifest ""
  done
}

# --------------------------------------------------------------------------
# Phase 3 — Unmapped video sweep
# --------------------------------------------------------------------------
unmapped_sweep() {
  append_manifest "---"
  append_manifest ""
  append_manifest "## Unmapped marketing-shaped videos"
  append_manifest ""
  append_manifest "These mp4/mov files matched no canonical pattern but were found near marketing paths. Review manually:"
  append_manifest ""
  append_manifest "| Path | Size | Modified |"
  append_manifest "|---|---|---|"

  # Look for any .mp4/.mov in iCloud, Desktop, Downloads, Documents that contain "ia_ai" / "practice" / "prompter" / "interview" / "nurse"
  for term in "ia_ai" "ia.ai" "practice_prompter" "practice_ritual" "interview_prep" "nurse_interview" "prompter"; do
    while IFS= read -r path; do
      [[ -z "$path" ]] && continue
      local size_bytes
      size_bytes=$(stat -f%z "$path" 2>/dev/null || echo 0)
      local size_human
      size_human=$(human_size "$size_bytes")
      local mod
      mod=$(stat -f "%Sm" -t "%Y-%m-%d" "$path" 2>/dev/null || echo "?")
      append_manifest "| \`$path\` | $size_human | $mod |"
    done < <(mdfind -name "$term" 2>/dev/null | grep -iE '\.(mp4|mov|m4v)$' | sort -u)
  done

  append_manifest ""
}

# --------------------------------------------------------------------------
# Phase 4 — Mac-side context dump (QuickTime / Trash / iMovie events)
# --------------------------------------------------------------------------
mac_context() {
  append_manifest "---"
  append_manifest ""
  append_manifest "## Mac-side context"
  append_manifest ""

  append_manifest "### QuickTime open documents"
  local qt_open
  qt_open=$(lsof -c QuickTime 2>/dev/null | grep -iE '\.(mp4|mov)' | awk '{for(i=9;i<=NF;i++) printf "%s ", $i; print ""}' | sort -u || true)
  if [[ -n "$qt_open" ]]; then
    append_manifest "QuickTime is open and has the following files in memory:"
    append_manifest ""
    append_manifest '```'
    append_manifest "$qt_open"
    append_manifest '```'
    append_manifest ""
    append_manifest "**If any of these are unsaved 'Untitled' documents, save them to disk before continuing.**"
  else
    append_manifest "_QuickTime not open or no video files currently in memory._"
  fi
  append_manifest ""

  append_manifest "### Trash"
  local trash
  trash=$(find "$HOME/.Trash" -maxdepth 3 -type f \( -name "*.mp4" -o -name "*.mov" \) 2>/dev/null | sort -u || true)
  if [[ -n "$trash" ]]; then
    append_manifest "Videos found in Trash:"
    append_manifest ""
    append_manifest '```'
    append_manifest "$trash"
    append_manifest '```'
    append_manifest ""
    append_manifest "**Restore via Finder → right-click → Put Back if any of these are launch creative.**"
  else
    append_manifest "_Trash has no video files._"
  fi
  append_manifest ""

  append_manifest "### iMovie events (potential containers for finished cuts)"
  local imovie
  imovie=$(find "$HOME/Movies" -maxdepth 4 -type d -name "*.imovielibrary" 2>/dev/null | head -5 || true)
  if [[ -n "$imovie" ]]; then
    append_manifest "iMovie libraries found (cuts may be locked inside these — open in iMovie to export):"
    append_manifest ""
    append_manifest '```'
    append_manifest "$imovie"
    append_manifest '```'
  else
    append_manifest "_No iMovie libraries found._"
  fi
  append_manifest ""
}

# --------------------------------------------------------------------------
# Phase 5 — Footprint report
# --------------------------------------------------------------------------
footprint_report() {
  append_manifest "---"
  append_manifest ""
  append_manifest "## Repo footprint after this run"
  append_manifest ""
  if [[ -d "$MARKETING_ROOT" ]]; then
    local total_size
    total_size=$(du -sh "$MARKETING_ROOT" 2>/dev/null | awk '{print $1}')
    append_manifest "- \`docs/marketing/\` total: **$total_size**"
    local video_count
    video_count=$(find "$MARKETING_ROOT" -type f \( -name "*.mp4" -o -name "*.mov" \) 2>/dev/null | wc -l | tr -d ' ')
    append_manifest "- Video files in \`docs/marketing/\`: **$video_count**"
  fi
  local repo_size
  repo_size=$(du -sh "$REPO_ROOT" 2>/dev/null | awk '{print $1}')
  append_manifest "- Repo total: **$repo_size**"
  append_manifest ""
  append_manifest "Policy thresholds (from \`docs/marketing/README.md\`):"
  append_manifest "- Single-file LFS threshold: 50 MB"
  append_manifest "- Total-repo LFS threshold: ~300 MB"
  append_manifest ""
}

# --------------------------------------------------------------------------
# Main
# --------------------------------------------------------------------------
main() {
  ensure_macos

  echo "============================================"
  echo "Marketing-video relocation script"
  echo "Mode: $MODE"
  echo "Repo: $REPO_ROOT"
  echo "============================================"
  echo

  if [[ "$MODE" == "copy" ]]; then
    echo "⚠️  --copy mode: this will create directories and copy files into the repo."
    echo "    Originals are preserved (cp, not mv)."
    echo "    Re-running is idempotent (skips files already at canonical paths)."
    echo
    read -r -p "Continue? [y/N] " yn
    case "$yn" in
      [Yy]*) ;;
      *) echo "Aborted."; exit 0 ;;
    esac
  fi

  start_manifest
  deep_search
  unmapped_sweep
  mac_context
  footprint_report

  echo
  echo "============================================"
  echo "Done."
  echo "Manifest written to:"
  echo "  $MANIFEST"
  echo
  if [[ "$MODE" == "audit" ]]; then
    echo "This was an AUDIT run — no files were copied."
    echo "Review the manifest, then re-run with --copy to actually relocate."
  else
    echo "Files copied. Next steps:"
    echo "  1. cd \"$REPO_ROOT\" && git status docs/marketing/"
    echo "  2. Review the diff"
    echo "  3. git add docs/marketing/ && git commit -m 'docs(marketing): relocate launch videos'"
    echo "  4. git push origin main"
  fi
  echo "============================================"
}

main "$@"
