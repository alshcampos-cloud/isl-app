#!/usr/bin/env bash
#
# build_letter_on_screen_v2.sh
# ----------------------------
# Regenerate the "Letter on Screen v2" typography spot via ffmpeg.
# 12.0s, 1080x1920 (9:16), navy bg #0E1D30, white serif text, A-mark lockup.
# Standalone — no external assets required beyond system fonts.
#
# Output: docs/marketing/mocks/letter_on_screen_v2.mp4
#
# Refurbished from prior production work (task #91 — Letter on Screen v2 with real fonts + endcard).
# Original build script was lost in cleanup; this is a sandbox-faithful regeneration.

set -euo pipefail

REPO_ROOT="${REPO_ROOT:-$(cd "$(dirname "$0")/.." && pwd)}"
OUT_DIR="$REPO_ROOT/docs/marketing/mocks"
OUT="$OUT_DIR/letter_on_screen_v2.mp4"

mkdir -p "$OUT_DIR"

# Spec
W=1080; H=1920
TOTAL=12.0
FPS=30
BG="#0E1D30"   # navy
FG="white"
ACCENT="#FFC857"  # warm accent for "A" mark

# Pick a serif font that's likely on macOS (Times) but also works in Linux sandbox (DejaVu Serif)
if [[ -f "/System/Library/Fonts/Supplemental/Times New Roman.ttf" ]]; then
  FONT="/System/Library/Fonts/Supplemental/Times New Roman.ttf"
  FONT_BOLD="/System/Library/Fonts/Supplemental/Times New Roman Bold.ttf"
elif [[ -f "/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf" ]]; then
  FONT="/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf"
  FONT_BOLD="/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf"
else
  echo "ERROR: No serif font found. Install Times New Roman or DejaVu Serif."
  exit 1
fi

echo "Font: $FONT"
echo "Output: $OUT"

# The "letter" — restraint-narrative refusal text. Each line fades in / out.
# Beat 1 (0.0-2.5s): "We deleted"
# Beat 2 (2.5-5.0s): "the Live Prompter."
# Beat 3 (5.0-7.5s): "Practice is the work."
# Beat 4 (7.5-10.0s): "The interview is yours."
# Beat 5 (10.0-12.0s): "ia.ai" + "A" lockup

# Use drawtext with enable= ranges for each beat. Each line fade-in 0.4s, hold, fade-out 0.4s before next.

ffmpeg -y -hide_banner -loglevel warning \
  -f lavfi -i "color=c=${BG}:s=${W}x${H}:r=${FPS}:d=${TOTAL}" \
  -vf "
    drawtext=fontfile=${FONT_BOLD}:text='We deleted':fontcolor=${FG}:fontsize=110:x=(w-text_w)/2:y=(h-text_h)/2:alpha='if(lt(t,0.4),t/0.4,if(lt(t,2.1),1,if(lt(t,2.5),(2.5-t)/0.4,0)))':enable='between(t,0,2.5)',
    drawtext=fontfile=${FONT_BOLD}:text='the Live Prompter.':fontcolor=${FG}:fontsize=92:x=(w-text_w)/2:y=(h-text_h)/2:alpha='if(lt(t,2.9),(t-2.5)/0.4,if(lt(t,4.6),1,if(lt(t,5.0),(5.0-t)/0.4,0)))':enable='between(t,2.5,5.0)',
    drawtext=fontfile=${FONT}:text='Practice is the work.':fontcolor=${FG}:fontsize=88:x=(w-text_w)/2:y=(h-text_h)/2:alpha='if(lt(t,5.4),(t-5.0)/0.4,if(lt(t,7.1),1,if(lt(t,7.5),(7.5-t)/0.4,0)))':enable='between(t,5.0,7.5)',
    drawtext=fontfile=${FONT}:text='The interview is yours.':fontcolor=${FG}:fontsize=82:x=(w-text_w)/2:y=(h-text_h)/2:alpha='if(lt(t,7.9),(t-7.5)/0.4,if(lt(t,9.6),1,if(lt(t,10.0),(10.0-t)/0.4,0)))':enable='between(t,7.5,10.0)',
    drawtext=fontfile=${FONT_BOLD}:text='A':fontcolor=${ACCENT}:fontsize=220:x=(w-text_w)/2:y=(h-text_h)/2-80:alpha='if(lt(t,10.4),(t-10.0)/0.4,1)':enable='between(t,10.0,12.0)',
    drawtext=fontfile=${FONT_BOLD}:text='ia.ai':fontcolor=${FG}:fontsize=72:x=(w-text_w)/2:y=h/2+150:alpha='if(lt(t,10.8),(t-10.4)/0.4,1)':enable='between(t,10.4,12.0)',
    drawtext=fontfile=${FONT}:text='practice not cheat':fontcolor=${FG}@0.7:fontsize=40:x=(w-text_w)/2:y=h/2+260:alpha='if(lt(t,11.2),(t-10.8)/0.4,1)':enable='between(t,10.8,12.0)'
  " \
  -c:v libx264 -preset medium -crf 22 -pix_fmt yuv420p -an \
  -t "$TOTAL" \
  "$OUT"

# Size + duration check
sz=$(stat -c %s "$OUT" 2>/dev/null || stat -f %z "$OUT" 2>/dev/null)
dur=$(ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "$OUT" 2>/dev/null)
echo "---"
echo "Built: $OUT"
echo "Size:  ${sz} bytes"
echo "Dur:   ${dur}s (target 12.0s)"
echo "---"
echo "Note: this is a sandbox-faithful regen of the typography spot from locked specs."
echo "      The original v2 had hand-tuned serif kerning + A-mark lockup that Lucas"
echo "      may want to re-render via Adobe / Figma export when back at the Mac."
