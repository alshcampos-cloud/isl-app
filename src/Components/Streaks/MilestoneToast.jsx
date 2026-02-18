// MilestoneToast.jsx — Lightweight streak milestone celebration
// Phase 3, Unit 1. D.R.A.F.T. protocol: NEW file.
//
// Renders nothing when no milestone. Auto-dismisses after 4 seconds.
// Growth framing ONLY — no guilt/loss messaging.
// Uses framer-motion (already in bundle).

import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Flame } from 'lucide-react';
import { getMilestoneMessage } from '../../utils/streakCalculator';

/**
 * @param {{ milestone: number|null, onDismiss: () => void }} props
 * milestone — 3, 7, 14, or 30 when a milestone is hit; null to hide
 * onDismiss — called when toast auto-dismisses or user clicks
 */
export default function MilestoneToast({ milestone, onDismiss }) {
  // Auto-dismiss after 4 seconds
  useEffect(() => {
    if (!milestone) return;
    const timer = setTimeout(() => {
      onDismiss?.();
    }, 4000);
    return () => clearTimeout(timer);
  }, [milestone, onDismiss]);

  return (
    <AnimatePresence>
      {milestone && (
        <motion.div
          initial={{ opacity: 0, y: -40, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] max-w-sm w-[calc(100%-2rem)]"
          onClick={() => onDismiss?.()}
        >
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-4 shadow-2xl shadow-orange-500/30 border border-orange-400/50 cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Flame className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold text-sm">
                  {milestone}-Day Streak!
                </p>
                <p className="text-white/80 text-xs leading-snug">
                  {getMilestoneMessage(milestone)}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
