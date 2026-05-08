#!/usr/bin/env bash
# scripts/smoke-test.sh — pre-deploy smoke test
# Runs 9 fast HTTP- and filesystem-level checks. Exits non-zero on any required failure.
# What this does NOT do is documented in docs/SMOKE_TEST_AUTOMATION.md.
#
# Usage:  npm run smoke
#    or:  bash scripts/smoke-test.sh

set -uo pipefail

# ────────────────────────────────────────────────────────────
# Config — repo root resolution + counters + colors
# ────────────────────────────────────────────────────────────
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

PASS=0
FAIL=0
WARN=0
SKIP=0
FAILED_CHECKS=()

# Colors (skip if not a TTY)
if [ -t 1 ]; then
  R=$'\033[31m'; G=$'\033[32m'; Y=$'\033[33m'; B=$'\033[34m'; C=$'\033[36m'; N=$'\033[0m'
else
  R=""; G=""; Y=""; B=""; C=""; N=""
fi

ok()    { echo "${G}✅ PASS${N}  $1"; PASS=$((PASS+1)); }
fail()  { echo "${R}❌ FAIL${N}  $1"; [ -n "${2:-}" ] && echo "        └── ${2}"; FAIL=$((FAIL+1)); FAILED_CHECKS+=("$1"); }
warn()  { echo "${Y}⚠️  WARN${N}  $1"; [ -n "${2:-}" ] && echo "        └── ${2}"; WARN=$((WARN+1)); }
skip()  { echo "${C}⏭  SKIP${N}  $1"; [ -n "${2:-}" ] && echo "        └── ${2}"; SKIP=$((SKIP+1)); }
header(){ echo ""; echo "${B}── $1 ──${N}"; }

echo "${B}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${N}"
echo "${B} InterviewAnswers.ai — smoke test  $(date '+%Y-%m-%d %H:%M:%S %Z')${N}"
echo "${B} branch: $(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo unknown)  HEAD: $(git rev-parse --short HEAD 2>/dev/null || echo unknown)${N}"
echo "${B}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${N}"

# ────────────────────────────────────────────────────────────
# Check 1 — npm run build succeeds
# ────────────────────────────────────────────────────────────
header "1/9  npm run build"
if [ -n "${SMOKE_SKIP_BUILD:-}" ]; then
  skip "npm run build (SMOKE_SKIP_BUILD set)"
else
  BUILD_LOG="$(mktemp -t smoke_build.XXXXXX)"
  if npm run build >"$BUILD_LOG" 2>&1; then
    ok "npm run build completed"
  else
    fail "npm run build failed" "see $BUILD_LOG (tail below)"
    tail -20 "$BUILD_LOG"
  fi
  rm -f "$BUILD_LOG"
fi

# ────────────────────────────────────────────────────────────
# Check 2 — homepage 200
# ────────────────────────────────────────────────────────────
header "2/9  GET https://www.interviewanswers.ai/"
HOME_CODE="$(curl -sS -o /dev/null -w '%{http_code}' --max-time 10 https://www.interviewanswers.ai/ 2>/dev/null || true)"
[ -z "$HOME_CODE" ] && HOME_CODE="000"
if [ "$HOME_CODE" = "200" ]; then
  ok "homepage returned 200"
else
  fail "homepage returned $HOME_CODE (expected 200)" "if 000, network blocked — re-run on local machine"
fi

# ────────────────────────────────────────────────────────────
# Check 3 — /ethics 200 + body contains expected copy
# ────────────────────────────────────────────────────────────
header "3/9  GET https://www.interviewanswers.ai/ethics"
ETHICS_TMP="$(mktemp -t smoke_ethics.XXXXXX)"
ETHICS_CODE="$(curl -sS -o "$ETHICS_TMP" -w '%{http_code}' --max-time 10 https://www.interviewanswers.ai/ethics 2>/dev/null || true)"
[ -z "$ETHICS_CODE" ] && ETHICS_CODE="000"
if [ "$ETHICS_CODE" = "200" ]; then
  if grep -qiE "ethics|practice, not cheat" "$ETHICS_TMP"; then
    ok "/ethics returned 200 + contains expected copy"
  else
    fail "/ethics returned 200 but body missing 'ethics' or 'Practice, not cheat'" "first 200 chars: $(head -c 200 "$ETHICS_TMP")"
  fi
else
  fail "/ethics returned $ETHICS_CODE (expected 200)" "if 000, network blocked — re-run on local machine"
fi
rm -f "$ETHICS_TMP"

# ────────────────────────────────────────────────────────────
# Check 4 — JSON-LD prices in index.html match expected
# ────────────────────────────────────────────────────────────
header '4/9  index.html JSON-LD prices ($39 / $19.99 / $149)'
EXPECT_PRICES=("39" "19.99" "149")
MISSING_PRICES=()
for p in "${EXPECT_PRICES[@]}"; do
  if ! grep -qE "\"price\"[[:space:]]*:[[:space:]]*\"${p}\"" index.html; then
    MISSING_PRICES+=("$p")
  fi
done
if [ ${#MISSING_PRICES[@]} -eq 0 ]; then
  ok "all expected prices present (39, 19.99, 149)"
else
  fail "missing price(s) in index.html JSON-LD: ${MISSING_PRICES[*]}" "expected each as \"price\": \"<value>\""
fi

# ────────────────────────────────────────────────────────────
# Check 5 — .env Stripe price IDs (4 keys, each price_*)
# ────────────────────────────────────────────────────────────
header "5/9  .env Stripe price IDs (4 keys, format price_*)"
if [ ! -f .env ]; then
  fail ".env not found at repo root"
else
  EXPECT_KEYS=(
    "VITE_STRIPE_ANNUAL_PRICE_ID"
    "VITE_STRIPE_GENERAL_PASS_PRICE_ID"
    "VITE_STRIPE_NURSING_PASS_PRICE_ID"
    "VITE_STRIPE_PRO_PRICE_ID"
  )
  STRIPE_OK=1
  for k in "${EXPECT_KEYS[@]}"; do
    line="$(grep -E "^${k}=" .env || true)"
    if [ -z "$line" ]; then
      fail ".env missing key: $k"
      STRIPE_OK=0
    else
      val="${line#*=}"
      val="${val%\"}"
      val="${val#\"}"
      val="${val%\'}"
      val="${val#\'}"
      if [[ "$val" == price_* ]]; then
        :
      else
        fail ".env $k value does not match price_* (got: ${val:0:12}…)"
        STRIPE_OK=0
      fi
    fi
  done
  [ $STRIPE_OK -eq 1 ] && ok "all 4 Stripe price IDs present and price_*-formatted"
fi

# ────────────────────────────────────────────────────────────
# Check 6 — Supabase secrets contain RC_REST_API_KEY
# ────────────────────────────────────────────────────────────
header "6/9  Supabase secrets list contains RC_REST_API_KEY"
if command -v supabase >/dev/null 2>&1; then
  SECRETS_LOG="$(mktemp -t smoke_secrets.XXXXXX)"
  if supabase secrets list >"$SECRETS_LOG" 2>&1; then
    if grep -q "^RC_REST_API_KEY" "$SECRETS_LOG" || grep -q "[[:space:]]RC_REST_API_KEY[[:space:]]" "$SECRETS_LOG" || grep -q "| RC_REST_API_KEY" "$SECRETS_LOG"; then
      ok "RC_REST_API_KEY present in Supabase secrets"
    else
      fail "RC_REST_API_KEY NOT in Supabase secrets list"
    fi
  else
    skip "supabase secrets list failed (not logged in, or no project linked)" "run 'supabase login' + 'supabase link --project-ref tzrlpwtkrtvjpdhcaayu' first"
  fi
  rm -f "$SECRETS_LOG"
else
  skip "supabase CLI not installed" "install via 'brew install supabase/tap/supabase' to enable this check"
fi

# ────────────────────────────────────────────────────────────
# Check 7 — Google gtag still installed in index.html
# ────────────────────────────────────────────────────────────
header "7/9  Google gtag installed in index.html"
if grep -qE "googletagmanager\.com/gtag/js\?id=AW-" index.html && grep -qE "AW-17966963623" index.html; then
  ok "gtag script + real conversion ID (AW-17966963623) present"
else
  fail "gtag script or AW-17966963623 missing from index.html"
fi

# ────────────────────────────────────────────────────────────
# Check 8 — no deprecated terms in user-facing copy
# ────────────────────────────────────────────────────────────
header "8/9  No deprecated terms in landing/pricing copy"
DEPRECATED_HITS="$(grep -rnE "Live Prompter|in-ear|undetectable AI" \
  src/Components/Landing/ \
  src/Components/PricingPage.jsx \
  2>/dev/null || true)"
if [ -z "$DEPRECATED_HITS" ]; then
  ok "no 'Live Prompter', 'in-ear', or 'undetectable AI' in landing/pricing copy"
else
  fail "deprecated terms found in user-facing copy"
  echo "$DEPRECATED_HITS" | head -10 | sed 's/^/        /'
fi

# ────────────────────────────────────────────────────────────
# Check 9 — console.log in production source (warn-only)
# ────────────────────────────────────────────────────────────
header "9/9  console.log audit in src/ (warn-only)"
LOG_HITS="$(grep -rn "console\.log" src/ 2>/dev/null \
  | grep -v "\.test\." \
  | grep -v "App\.jsx\.backup" \
  | wc -l | tr -d ' ')"
if [ "${LOG_HITS:-0}" = "0" ]; then
  ok "no console.log in src/"
elif [ "${LOG_HITS:-0}" -le 5 ]; then
  warn "$LOG_HITS console.log lines in src/ (under 5 — likely intentional debug)"
else
  warn "$LOG_HITS console.log lines in src/ — review before prod deploy"
  grep -rn "console\.log" src/ 2>/dev/null \
    | grep -v "\.test\." \
    | grep -v "App\.jsx\.backup" \
    | head -10 | sed 's/^/        /'
fi

# ────────────────────────────────────────────────────────────
# Summary
# ────────────────────────────────────────────────────────────
TOTAL=$((PASS+FAIL))
echo ""
echo "${B}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${N}"
if [ $FAIL -eq 0 ]; then
  echo "${G}✅ $PASS/$TOTAL PASSED${N}  ($WARN warning(s), $SKIP skipped)"
  echo "${B}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${N}"
  exit 0
else
  echo "${R}❌ $PASS/$TOTAL PASSED — $FAIL failure(s)${N}  ($WARN warning(s), $SKIP skipped)"
  echo ""
  echo "Failed checks:"
  for f in "${FAILED_CHECKS[@]}"; do echo "  • $f"; done
  echo "${B}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${N}"
  exit 1
fi
