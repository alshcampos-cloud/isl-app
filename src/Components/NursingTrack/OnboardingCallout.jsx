// OnboardingCallout.jsx — banner for fresh nursing users
//
// 2026-06-11 (Layer 1 Issue #6C): displayed on NursingDashboard above the
// Practice Modes grid when the user has 0 nursing_practice + 0 nursing_mock
// sessions AND hasn't dismissed it. Persists dismissal in localStorage
// 'nursing_dashboard_callout_seen' so returning users don't see it again.
//
// Pairs with Layer 1 Issue #1 (Skip button on OnboardingPractice). Users who
// skipped the onboarding practice question reach the nursing dashboard with
// zero sessions — this banner gently nudges them to the highest-value first
// action (Mock Interview) before they bounce.
//
// Battle Scar #1: lives in src/Components/NursingTrack/ (NOT App.jsx).
// Battle Scar #19: copy avoids any clinical-content claims — pure UX nudge.
// PR #43 preserved: this component is consumed by NursingDashboard.jsx,
// never touches NursingTrackApp.jsx loadUserData or its session guards.

import { motion } from 'framer-motion';
import { X } from 'lucide-react';

const LOCAL_KEY = 'nursing_dashboard_callout_seen';

export default function OnboardingCallout({ onDismiss, onStart }) {
  const persistDismissal = () => {
    // localStorage write can throw in Safari private mode or when storage
    // quota is exceeded. Swallow — banner still disappears in-session via
    // calloutDismissedThisSession state. Returns after refresh in private
    // mode, which is acceptable for a soft nudge.
    try {
      localStorage.setItem(LOCAL_KEY, '1');
    } catch (_e) {
      // ignore
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative bg-sky-500/10 border border-sky-500/30 rounded-xl p-4 mb-6 z-20"
    >
      <button
        onClick={() => {
          persistDismissal();
          onDismiss();
        }}
        className="absolute top-3 right-3 text-slate-400 hover:text-white transition-colors p-1"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
      <div className="pr-8">
        <p className="text-white font-semibold text-base mb-1">
          New here? Try a mock interview first.
        </p>
        <p className="text-sky-200/80 text-sm mb-3">
          A 5-minute mock with a hiring-manager AI is the fastest way to see how you sound.
        </p>
        <button
          onClick={() => {
            persistDismissal();
            onStart();
          }}
          className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-medium text-sm rounded-lg transition-colors"
        >
          Start mock interview →
        </button>
      </div>
    </motion.div>
  );
}
