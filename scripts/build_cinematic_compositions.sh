#!/usr/bin/env bash
#
# build_cinematic_compositions.sh
# -------------------------------
# Build γ / β / ε spot compositions from recovered Nano Banana Pro keyframes.
# Simple static-still concat (no Ken-Burns) — fast, faithful to keyframes.
#
# Output: docs/marketing/practice_ritual/cinematic_v1/[spot]/output/master_9x16.mp4

set -euo pipefail

REPO_ROOT="${REPO_ROOT:-$(cd "$(dirname "$0")/.." && pwd)}"
CINE="$REPO_ROOT/docs/marketing/practice_ritual/cinematic_v1"

W=1080; H=1920; FPS=30
BEAT_DUR=2.8
ENDCARD_DUR=2.0
BG="#0E1D30"

build_spot() {
  local SPOT_DIR="$1"
  local NAME="$2"
  local KEY_DIR="$CINE/$SPOT_DIR/keyframes_recovered_2026-05-13"
  local OUT_DIR="$CINE/$SPOT_DIR/output"
  local OUT="$OUT_DIR/master_9x16.mp4"
  mkdir -p "$OUT_DIR"

  # Pick 2K versions (_02 suffix); fall back to _01 thumbs if not present.
  local frames=()
  while IFS= read -r f; do frames+=("$f"); done < <(find "$KEY_DIR" -maxdepth 1 -name "keyframe_*_02_*.jpg" 2>/dev/null | sort)
  if [[ ${#frames[@]} -eq 0 ]]; then
    while IFS= read -r f; do frames+=("$f"); done < <(find "$KEY_DIR" -maxdepth 1 -name "keyframe_*_01_*.jpg" 2>/dev/null | sort)
  fi

  local n=${#frames[@]}
  if [[ $n -eq 0 ]]; then
    echo "WARN: no keyframes in $KEY_DIR — skipping $NAME"
    return
  fi

  echo "=== Building $NAME (n=$n) ==="

  # Endcard PNG
  local TMP="/tmp/cine_$SPOT_DIR"
  rm -rf "$TMP"
  mkdir -p "$TMP"

  local FONT="/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf"
  [[ -f "$FONT" ]] || FONT="/System/Library/Fonts/Supplemental/Times New Roman Bold.ttf"

  ffmpeg -y -hide_banner -loglevel error \
    -f lavfi -i "color=c=${BG}:s=${W}x${H}:r=1:d=1" \
    -vf "drawtext=fontfile=${FONT}:text='ia.ai':fontcolor=white:fontsize=130:x=(w-text_w)/2:y=(h-text_h)/2-50,drawtext=fontfile=${FONT}:text='practice not cheat':fontcolor=white@0.75:fontsize=44:x=(w-text_w)/2:y=h/2+90" \
    -frames:v 1 "$TMP/endcard.png" 2>&1 | head -5 || true

  # Build a concat demuxer list. Use duration directives.
  local LIST="$TMP/concat.txt"
  : > "$LIST"
  for f in "${frames[@]}"; do
    echo "file '$f'" >> "$LIST"
    echo "duration $BEAT_DUR" >> "$LIST"
  done
  # Endcard
  echo "file '$TMP/endcard.png'" >> "$LIST"
  echo "duration $ENDCARD_DUR" >> "$LIST"
  # Concat demuxer requires final file repeated without duration so the last duration applies
  echo "file '$TMP/endcard.png'" >> "$LIST"

  # Single ffmpeg call: concat the stills, scale to 9:16 1080×1920 with cover/crop, encode.
  ffmpeg -y -hide_banner -loglevel error \
    -f concat -safe 0 -i "$LIST" \
    -vf "scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},setsar=1,fps=${FPS}" \
    -c:v libx264 -preset medium -crf 22 -pix_fmt yuv420p \
    -movflags +faststart \
    "$OUT"

  local sz; sz=$(stat -c %s "$OUT" 2>/dev/null || stat -f %z "$OUT" 2>/dev/null)
  local dur; dur=$(ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "$OUT" 2>/dev/null)
  echo "  ✓ $OUT  $sz bytes  ${dur}s"
  rm -rf "$TMP"
}

build_spot "object_waiting"    "γ Object Waiting"
build_spot "practice_visible"  "β Practice Made Visible"
build_spot "walk_and_react"    "ε Walk-and-React"

echo
echo "=== All compositions complete ==="
ls -lh "$CINE"/*/output/master_9x16.mp4 2>/dev/null
