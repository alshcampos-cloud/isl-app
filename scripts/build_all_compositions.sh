#!/usr/bin/env bash
#
# build_all_compositions.sh
# -------------------------
# Build every spot composition from production keyframes.
# Spots: γ Object Waiting, β Practice Visible, ε Walk-and-React,
#        Reflection 15s, Spot 5 Transformation.
#
# Reads from each spot's `keyframes_production/` dir (preferred) or falls back
# to `keyframes_recovered_*` if production is empty.
#
# Output: each spot's `output/master_9x16.mp4`

set -euo pipefail

REPO_ROOT="${REPO_ROOT:-$(cd "$(dirname "$0")/.." && pwd)}"
PR="$REPO_ROOT/docs/marketing/practice_ritual"

W=1080; H=1920; FPS=30
BEAT_DUR=2.8
ENDCARD_DUR=2.0
BG="#0E1D30"

FONT="/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf"
[[ -f "$FONT" ]] || FONT="/System/Library/Fonts/Supplemental/Times New Roman Bold.ttf"

build_spot() {
  local SPOT_REL="$1"       # e.g. cinematic_v1/object_waiting
  local NAME="$2"
  local SORT_PATTERN="${3:-k_beat}"  # glob to select frames in order
  local CUSTOM_DUR="${4:-$BEAT_DUR}"  # per-beat duration override

  local SPOT_DIR="$PR/$SPOT_REL"
  local KEY_DIR=""
  if [[ -d "$SPOT_DIR/keyframes_production" ]] && [[ -n "$(ls -A "$SPOT_DIR/keyframes_production" 2>/dev/null)" ]]; then
    KEY_DIR="$SPOT_DIR/keyframes_production"
  else
    # fall back to most-recent keyframes_recovered_* directory
    KEY_DIR=$(ls -dt "$SPOT_DIR"/keyframes_recovered_* 2>/dev/null | head -1 || true)
  fi
  local OUT_DIR="$SPOT_DIR/output"
  local OUT="$OUT_DIR/master_9x16.mp4"
  mkdir -p "$OUT_DIR"

  if [[ -z "$KEY_DIR" ]] || [[ ! -d "$KEY_DIR" ]]; then
    echo "WARN: no keyframes for $NAME — skipping"
    return
  fi

  local frames=()
  while IFS= read -r f; do frames+=("$f"); done < <(find "$KEY_DIR" -maxdepth 1 -type f \( -name "*.jpg" -o -name "*.png" \) 2>/dev/null | sort)
  local n=${#frames[@]}
  if [[ $n -eq 0 ]]; then echo "WARN: no frames in $KEY_DIR — skipping $NAME"; return; fi

  echo "=== Building $NAME (n=$n) ==="

  local TMP="/tmp/cine_$(basename "$SPOT_REL")"
  rm -rf "$TMP"; mkdir -p "$TMP"

  # Endcard
  ffmpeg -y -hide_banner -loglevel error \
    -f lavfi -i "color=c=${BG}:s=${W}x${H}:r=1:d=1" \
    -vf "drawtext=fontfile=${FONT}:text='ia.ai':fontcolor=white:fontsize=130:x=(w-text_w)/2:y=(h-text_h)/2-50,drawtext=fontfile=${FONT}:text='practice not cheat':fontcolor=white@0.75:fontsize=44:x=(w-text_w)/2:y=h/2+90" \
    -frames:v 1 "$TMP/endcard.png" 2>&1 | head -3 || true

  local LIST="$TMP/concat.txt"
  : > "$LIST"
  for f in "${frames[@]}"; do
    echo "file '$f'" >> "$LIST"
    echo "duration $CUSTOM_DUR" >> "$LIST"
  done
  echo "file '$TMP/endcard.png'" >> "$LIST"
  echo "duration $ENDCARD_DUR" >> "$LIST"
  echo "file '$TMP/endcard.png'" >> "$LIST"

  ffmpeg -y -hide_banner -loglevel error \
    -f concat -safe 0 -i "$LIST" \
    -vf "scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},setsar=1,fps=${FPS}" \
    -c:v libx264 -preset medium -crf 22 -pix_fmt yuv420p \
    -movflags +faststart \
    "$OUT"

  local sz; sz=$(stat -c %s "$OUT" 2>/dev/null || stat -f %z "$OUT" 2>/dev/null)
  local dur; dur=$(ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "$OUT" 2>/dev/null)
  echo "  ✓ $OUT  ${sz}B  ${dur}s"
  rm -rf "$TMP"
}

# γ Object Waiting — 4 beats × 2.8s = 11.2s + endcard
build_spot "cinematic_v1/object_waiting"   "γ Object Waiting"   "k_beat" "2.8"

# β Practice Made Visible — 7 beats × 2s = 14s + endcard (Camila full arc)
build_spot "cinematic_v1/practice_visible" "β Practice Visible" "k_beat" "2.0"

# ε Walk-and-React — 8 beats × 1.8s = 14.4s + endcard
build_spot "cinematic_v1/walk_and_react"   "ε Walk-and-React"   "k_beat" "1.8"

# Reflection 15s — 4 beats × 3.0s = 12s + endcard ~= 14s
build_spot "reflection_15s"                "Reflection 15s"     "k"      "3.0"

# Spot 5 Transformation — 1 keyframe × 5s + endcard (Aaliyah anchor)
build_spot "spot5_transformation"          "Spot 5 Transformation" "k_aaliyah" "5.0"

echo
echo "=== ALL COMPOSITIONS ==="
ls -lh "$PR"/*/output/master_9x16.mp4 "$PR"/cinematic_v1/*/output/master_9x16.mp4 2>/dev/null
