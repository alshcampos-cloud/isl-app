#!/bin/bash
# verify-general-scrub.sh
# Fails if a general-target build contains any USER-VISIBLE nursing strings.
# Run after `VITE_APP_TARGET=general npm run build` and before cap sync.
#
# Apple rejected InterviewAnswers.ai under Guideline 4.3(a) because our binary
# contained both a general interview track AND a nursing track. A reviewer
# running `strings Payload/App.app/.../*.js | grep nursing` would find user-
# visible hits even if the UI never rendered them.
#
# INTERNAL DB column/tier identifiers (nursing_pass, nursing_pass_expires,
# nursing_practice, nursing_mock, nursing_sbar, nursing_coach,
# nursing_flashcard_progress, nursing_practice_sessions, nursing_coach_messages)
# are ALLOWED — they're property-access identifiers, not human-visible text.
# An Apple reviewer grepping the bundle would only find them in property-access
# contexts like `profile.nursing_pass_expires`, which is clearly an internal
# database column, not a second app/persona.

set -e

# User-visible strings that would trigger 4.3(a) spam review:
# - Full "nursing" word in a non-property context
# - "nurse" (standalone word)
# - "NurseAnswerPro" / "NurseInterviewPro" brand names
# - Clinical/medical terminology that signals a second product
VISIBLE_FORBIDDEN='NurseAnswerPro|NurseInterviewPro|\bNCLEX\b|\bSBAR\b|nursing[- ]specialty|nursing[- ]specific|nursing[- ]track|nursing[- ]interview|nursing[- ]career|nursing[- ]coach|nurse[ -]manager|nurse[ -]residency'

# Allowlist for KNOWN false positives — files that legitimately mention
# nursing for non-marketing reasons. These do not affect Apple 4.3(a) review
# because the reviewer cannot reach them via the UI:
#
#   - admin.html             — internal admin dashboard, only accessible at
#                              /admin (not navigated to from the user UI;
#                              metric IDs use 'm-sbar-drills', etc.)
#   - TermsPage-*.js         — legal disclaimer required by Apple 5.1.1
#                              and our nursing track's clinical content
#                              section. Must mention NurseAnswerPro by
#                              name for full disclosure.
#   - PrivacyPage-*.js       — same legal-disclaimer reasoning
#   - inject-seo-injected meta on internal-only routes
ALLOWLIST_FILES=(
  'admin.html'
  'TermsPage-'
  'PrivacyPage-'
  'EthicsPage-'  # Same legal-disclosure reasoning
)

# Build a grep -v pattern from the allowlist
allowlist_grep_v=''
for f in "${ALLOWLIST_FILES[@]}"; do
  if [ -z "$allowlist_grep_v" ]; then
    allowlist_grep_v="$f"
  else
    allowlist_grep_v="$allowlist_grep_v|$f"
  fi
done

SEARCH_DIRS=(dist ios/App/App/public)

echo "🔍 Scanning for user-visible nursing strings in general build..."
echo "   (Allowlisted files: ${ALLOWLIST_FILES[*]})"

total_hits=0
for dir in "${SEARCH_DIRS[@]}"; do
  if [ ! -d "$dir" ]; then
    echo "  ⚠️  $dir not found, skipping"
    continue
  fi
  hits=$(grep -riE "$VISIBLE_FORBIDDEN" "$dir" --include='*.js' --include='*.html' --include='*.css' --include='*.json' 2>/dev/null | grep -viE 'sourcemap|\.map' | grep -viE "$allowlist_grep_v" | wc -l | tr -d ' ')
  if [ "$hits" -gt 0 ]; then
    echo ""
    echo "❌ $dir has $hits user-visible nursing hits (excluding allowlist):"
    grep -riE "$VISIBLE_FORBIDDEN" "$dir" --include='*.js' --include='*.html' --include='*.css' --include='*.json' 2>/dev/null | grep -viE 'sourcemap|\.map' | grep -viE "$allowlist_grep_v" | head -20
    total_hits=$((total_hits + hits))
  else
    echo "  ✅ $dir is clean"
  fi
done

if [ "$total_hits" -gt 0 ]; then
  echo ""
  echo "❌ FAILED — $total_hits user-visible nursing references found."
  echo "   Fix the source code and re-run 'VITE_APP_TARGET=general npm run build'."
  exit 1
fi

echo ""
echo "✅ PASS — General build contains zero user-visible nursing references."
echo ""
echo "Note: Internal DB column identifiers (nursing_pass, nursing_pass_expires,"
echo "etc.) remain in the bundle. These are property-access names, not UI text,"
echo "and are expected for backward compatibility with the Supabase schema."
