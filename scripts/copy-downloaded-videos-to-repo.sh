#!/usr/bin/env bash
#
# copy-downloaded-videos-to-repo.sh
# ---------------------------------
# Sweep ~/Downloads/ for any keyframe / motion-clip / spot videos that Cowork's
# in-browser recovery pulled out of AI Studio + Flow, classify them, and copy
# each into its canonical repo path.
#
# Originals are preserved (cp, not mv). Idempotent (skips files already at dest).
#
# Usage:
#   bash scripts/copy-downloaded-videos-to-repo.sh                # audit-only (default)
#   bash scripts/copy-downloaded-videos-to-repo.sh --copy         # actually copy
#   bash scripts/copy-downloaded-videos-to-repo.sh --help

set -euo pipefail

REPO_ROOT="${REPO_ROOT:-$(cd "$(dirname "$0")/.." && pwd)}"
DL_DIR="${DL_DIR:-$HOME/Downloads}"
MANIFEST="$REPO_ROOT/docs/marketing/DOWNLOAD_RELOCATION_MANIFEST_$(date +%Y-%m-%d).md"

MODE="audit"
case "${1:-}" in
  --copy)  MODE="copy" ;;
  --audit) MODE="audit" ;;
  --help|-h)
    sed -n '3,15p' "$0"
    exit 0
    ;;
  "") MODE="audit" ;;
  *) echo "Unknown flag: $1"; exit 1 ;;
esac

# --------------------------------------------------------------------------
# Canonical-path mapping
# pattern (case-insensitive substring) | canonical_dest_subpath
# --------------------------------------------------------------------------
declare -a MAPPINGS=(
  # AI Studio keyframes (downloaded as keyframe_<slug>_NN_WxH.jpg)
  "keyframe_epsilon_walk_react|docs/marketing/practice_ritual/cinematic_v1/walk_and_react/keyframes_recovered_2026-05-12"
  "keyframe_epsilon_ethan|docs/marketing/practice_ritual/cinematic_v1/walk_and_react/keyframes_recovered_2026-05-12"
  "keyframe_beta_camila|docs/marketing/practice_ritual/cinematic_v1/practice_visible/keyframes_recovered_2026-05-12"
  "keyframe_beta_golden_hour|docs/marketing/practice_ritual/cinematic_v1/practice_visible/keyframes_recovered_2026-05-12"
  "keyframe_beta_dawn|docs/marketing/practice_ritual/cinematic_v1/practice_visible/keyframes_recovered_2026-05-12"
  "keyframe_beta_night_kitchen|docs/marketing/practice_ritual/cinematic_v1/practice_visible/keyframes_recovered_2026-05-12"
  "keyframe_gamma_bottle|docs/marketing/practice_ritual/cinematic_v1/object_waiting/keyframes_recovered_2026-05-12"
  "keyframe_gamma_fridge|docs/marketing/practice_ritual/cinematic_v1/object_waiting/keyframes_recovered_2026-05-12"
  "keyframe_gamma_note|docs/marketing/practice_ritual/cinematic_v1/object_waiting/keyframes_recovered_2026-05-12"
  "keyframe_other_second_monitor|docs/marketing/practice_ritual/_inbox"

  # Flow motion clips (downloaded as flow_<projectslug>_NN_<uuidprefix>.mp4)
  "flow_apr29_reflection|docs/marketing/practice_ritual/reflection_15s/raw"
  "flow_spot5|docs/marketing/practice_ritual/spot5_transformation/raw"
  "flow_aaliyah|docs/marketing/practice_ritual/spot5_transformation/raw"
  "flow_object_waiting|docs/marketing/practice_ritual/cinematic_v1/object_waiting/raw"
  "flow_practice_visible|docs/marketing/practice_ritual/cinematic_v1/practice_visible/raw"
  "flow_walk_and_react|docs/marketing/practice_ritual/cinematic_v1/walk_and_react/raw"

  # AI Studio "Generated Image" default filenames (fallback if user used browser default)
  "Generated Image|docs/marketing/_inbox_unclassified"
)

start_manifest() {
  cat > "$MANIFEST" <<EOF
# Download Relocation Manifest
**Generated:** $(date '+%Y-%m-%d %H:%M:%S %Z')
**Mode:** $MODE
**Source:** \`$DL_DIR\`
**Repo root:** \`$REPO_ROOT\`

EOF
}

append_manifest() { echo "$*" >> "$MANIFEST"; }

human_size() {
  local bytes="$1"
  if   [[ $bytes -lt 1024 ]];       then echo "${bytes}B"
  elif [[ $bytes -lt 1048576 ]];    then echo "$((bytes/1024))K"
  elif [[ $bytes -lt 1073741824 ]]; then echo "$((bytes/1048576))M"
  else                                    echo "$((bytes/1073741824))G"
  fi
}

# --------------------------------------------------------------------------
# Main
# --------------------------------------------------------------------------
main() {
  if [[ ! -d "$DL_DIR" ]]; then
    echo "ERROR: Downloads directory not found: $DL_DIR"
    exit 2
  fi

  start_manifest

  if [[ "$MODE" == "copy" ]]; then
    echo "⚠️  --copy mode: this will create directories and copy files into the repo."
    echo "    Originals are preserved (cp, not mv)."
    echo "    Idempotent (re-running skips files already at canonical paths)."
    echo
    read -r -p "Continue? [y/N] " yn
    case "$yn" in [Yy]*) ;; *) echo "Aborted."; exit 0 ;; esac
    echo
  fi

  local total=0 copied=0 skipped=0 unclassified=0

  for entry in "${MAPPINGS[@]}"; do
    IFS="|" read -r pattern dest_subpath <<< "$entry"
    local dest="$REPO_ROOT/$dest_subpath"

    # Find matches in DL_DIR by case-insensitive substring on filename
    local matches
    matches=$(find "$DL_DIR" -maxdepth 2 -type f -mtime -7 \( -iname "*.mp4" -o -iname "*.mov" -o -iname "*.webm" -o -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" \) 2>/dev/null \
      | grep -iE "$(echo "$pattern" | sed 's/_/[ _-]/g')" | sort -u || true)

    if [[ -z "$matches" ]]; then
      continue
    fi

    append_manifest ""
    append_manifest "## Pattern: \`$pattern\` → \`$dest_subpath/\`"
    append_manifest ""
    append_manifest "| Source | Size | Action |"
    append_manifest "|---|---|---|"

    while IFS= read -r src; do
      [[ -z "$src" ]] && continue
      total=$((total+1))
      local sz; sz=$(stat -f%z "$src" 2>/dev/null || stat -c%s "$src" 2>/dev/null || echo 0)
      local sh; sh=$(human_size "$sz")
      local base; base=$(basename "$src")
      local action=""

      if [[ "$MODE" == "copy" ]]; then
        mkdir -p "$dest"
        local dest_file="$dest/$base"
        if [[ -f "$dest_file" ]]; then
          local dsz; dsz=$(stat -f%z "$dest_file" 2>/dev/null || stat -c%s "$dest_file" 2>/dev/null || echo 0)
          if [[ "$dsz" == "$sz" ]]; then
            action="SKIP (already at dest, sizes match)"
            skipped=$((skipped+1))
          else
            action="**CONFLICT** (dest exists with different size $dsz vs $sz)"
          fi
        else
          cp -p "$src" "$dest_file"
          action="COPIED → \`$dest_subpath/$base\` ($sh)"
          copied=$((copied+1))
        fi
      else
        action="(AUDIT: would copy to $dest_subpath/)"
      fi

      append_manifest "| \`$base\` | $sh | $action |"
    done <<< "$matches"
  done

  # Unclassified videos in Downloads (anything looking marketing-shaped but matching no pattern)
  append_manifest ""
  append_manifest "---"
  append_manifest ""
  append_manifest "## Unclassified — review manually"
  append_manifest ""
  append_manifest "Marketing-shaped files in Downloads that matched no mapping pattern:"
  append_manifest ""
  append_manifest "| File | Size | Modified |"
  append_manifest "|---|---|---|"
  while IFS= read -r f; do
    [[ -z "$f" ]] && continue
    local base; base=$(basename "$f")
    # Skip if already matched a pattern (heuristic)
    local matched_some=0
    for entry in "${MAPPINGS[@]}"; do
      IFS="|" read -r pattern _ <<< "$entry"
      if echo "$base" | grep -iqE "$(echo "$pattern" | sed 's/_/[ _-]/g')"; then
        matched_some=1; break
      fi
    done
    if [[ $matched_some -eq 0 ]] && echo "$base" | grep -iqE "(keyframe|spot|reflection|letter|wwp|joy|ethan|camila|aaliyah|practice|cinematic|veo|flow_|nb_pro|nano_banana|generated.image)"; then
      local sz; sz=$(stat -f%z "$f" 2>/dev/null || stat -c%s "$f" 2>/dev/null || echo 0)
      local sh; sh=$(human_size "$sz")
      local mod; mod=$(stat -f "%Sm" -t "%Y-%m-%d" "$f" 2>/dev/null || date -d "@$(stat -c %Y "$f" 2>/dev/null)" "+%Y-%m-%d" 2>/dev/null || echo "?")
      append_manifest "| \`$base\` | $sh | $mod |"
      unclassified=$((unclassified+1))
    fi
  done < <(find "$DL_DIR" -maxdepth 2 -type f -mtime -7 \( -iname "*.mp4" -o -iname "*.mov" -o -iname "*.jpg" -o -iname "*.png" \) 2>/dev/null | sort -u)

  append_manifest ""
  append_manifest "---"
  append_manifest ""
  append_manifest "## Summary"
  append_manifest ""
  append_manifest "- **Total matched files:** $total"
  append_manifest "- **Copied to repo:** $copied"
  append_manifest "- **Skipped (already at dest):** $skipped"
  append_manifest "- **Unclassified (manual review):** $unclassified"

  echo
  echo "=========================================="
  echo "Done."
  echo "Manifest: $MANIFEST"
  echo "Total: $total | Copied: $copied | Skipped: $skipped | Unclassified: $unclassified"
  echo "=========================================="
  echo
  if [[ "$MODE" == "audit" ]]; then
    echo "AUDIT mode — no files were copied. Review manifest, then re-run with --copy."
  else
    echo "Files copied. Next:"
    echo "  cd \"$REPO_ROOT\" && git status docs/marketing/"
    echo "  git add docs/marketing/ && git commit -m 'docs(marketing): land recovered keyframes + clips'"
  fi
}

main "$@"
