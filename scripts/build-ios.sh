#!/bin/bash
# ============================================================
# Build iOS apps for InterviewAnswers.ai
#
# Usage:
#   ./scripts/build-ios.sh general    — Build general InterviewAnswers app
#   ./scripts/build-ios.sh nursing    — Build NurseInterviewPro app
#   ./scripts/build-ios.sh web        — Build web version (all features)
#
# Each target uses a different VITE_APP_TARGET and Capacitor config.
# ============================================================

set -e

TARGET=${1:-"web"}
echo ""
echo "=============================="
echo "  Building: $TARGET"
echo "=============================="
echo ""

case $TARGET in
  general)
    echo "📦 Building GENERAL iOS app (InterviewAnswers.ai)"
    echo "   Bundle ID: ai.interviewanswers.app"
    echo "   Features: General interview prep only (no nursing)"
    echo ""

    # Build web assets with general target
    VITE_APP_TARGET=general npm run build

    # Use the default capacitor.config.json (general app)
    # (it's already set to ai.interviewanswers.app)

    # Sync to iOS
    npx cap sync ios

    echo ""
    echo "✅ General iOS build complete!"
    echo "   Next: Open Xcode with 'npx cap open ios' and build (⌘+B)"
    ;;

  nursing)
    echo "📦 Building NURSING iOS app (NurseInterviewPro)"
    echo "   Bundle ID: ai.nurseinterviewpro.app"
    echo "   Features: Nursing track only (no general)"
    echo ""

    # Build web assets with nursing target
    VITE_APP_TARGET=nursing npm run build

    # Swap Capacitor config to nursing version
    cp capacitor.config.json capacitor.config.backup.json
    cp capacitor.config.nursing.json capacitor.config.json

    # Sync to iOS
    npx cap sync ios

    # Restore original config
    mv capacitor.config.backup.json capacitor.config.json

    echo ""
    echo "✅ Nursing iOS build complete!"
    echo "   ⚠️  IMPORTANT: The Xcode project now has nursing config."
    echo "   ⚠️  You'll need to update the Bundle ID in Xcode to: ai.nurseinterviewpro.app"
    echo "   Next: Open Xcode with 'npx cap open ios' and build (⌘+B)"
    ;;

  web)
    echo "📦 Building WEB version (all features)"
    echo "   Deploy to: Vercel (interviewanswers.ai)"
    echo "   Features: Everything (general + nursing)"
    echo ""

    # Build with default target (all features)
    npm run build

    echo ""
    echo "✅ Web build complete!"
    echo "   Next: Deploy with 'npx vercel --prod'"
    ;;

  *)
    echo "❌ Unknown target: $TARGET"
    echo ""
    echo "Usage:"
    echo "  ./scripts/build-ios.sh general    — General iOS app"
    echo "  ./scripts/build-ios.sh nursing    — Nursing iOS app"
    echo "  ./scripts/build-ios.sh web        — Web version (all features)"
    exit 1
    ;;
esac

echo ""
echo "Build artifacts in: dist/"
echo ""
