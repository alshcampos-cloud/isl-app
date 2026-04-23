// StreakDisplay.jsx — Self-contained streak stat card for the home screen
// Phase 3, Unit 1. D.R.A.F.T. protocol: NEW file.
//
// Pattern: follows ArchetypeCTA.jsx — fetches its own data, renders nothing on error.
// Designed to drop into the existing stats grid as a 5th card.

import { useState, useEffect, useCallback, useRef } from 'react';
import { Flame, Snowflake, Trophy, X } from 'lucide-react';
import { StreakStatIcon } from '../icons/FeatureIcons';
import { AnimatePresence, motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { fetchStreak, activateFreeze } from '../../utils/streakSupabase';
import { checkFreeze, getLocalDateString } from '../../utils/streakCalculator';

const MILESTONES_CONFIG = [
  { days: 3, label: '3 days', icon: '🌱' },
  { days: 7, label: '1 week', icon: '🔥' },
  { days: 14, label: '2 weeks', icon: '⭐' },
  { days: 30, label: '1 month', icon: '🏆' },
];

export default function StreakDisplay({ refreshTrigger, variant = 'dark' }) {
  const [streak, setStreak] = useState(null);
  const [showPopover, setShowPopover] = useState(false);
  const [freezeLoading, setFreezeLoading] = useState(false);

  // Track touch start position to distinguish taps from scrolls
  // Bug fix: onTouchEnd fires on scroll, causing popover to open while scrolling
  const touchStartY = useRef(null);

  const loadStreak = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const data = await fetchStreak(supabase, user.id);
      setStreak(data);
    } catch (err) {
      console.warn('StreakDisplay load failed:', err);
    }
  }, []);

  // Load on mount + whenever refreshTrigger changes (after session completion)
  useEffect(() => {
    loadStreak();
  }, [loadStreak, refreshTrigger]);

  // Don't render anything if we have no data
  if (!streak) return null;

  // Recalculate streak on display — the DB stores the last known value,
  // but if the user missed days since then, the displayed streak should be 0.
  // The DB only updates on session completion, so we need this client-side check.
  let currentStreak = streak.current_streak || 0;
  const longestStreak = streak.longest_streak || 0;
  const freezeInfo = checkFreeze(
    streak.freezes_used_this_week || 0,
    streak.freeze_week_start
  );

  if (currentStreak > 0 && streak.last_practice_date) {
    const today = getLocalDateString();
    const lastDate = streak.last_practice_date; // already YYYY-MM-DD
    const a = new Date(lastDate + 'T00:00:00');
    const b = new Date(today + 'T00:00:00');
    const daysSince = Math.round((b - a) / (1000 * 60 * 60 * 24));
    // If more than 1 day gap and no freeze available, streak is broken
    if (daysSince > 1) {
      // Check if a freeze could cover exactly 1 missed day (gap of 2)
      if (daysSince === 2 && freezeInfo.canFreeze) {
        // Freeze covers 1 missed day — streak survives but don't increment
      } else {
        currentStreak = 0; // streak is broken, show 0
      }
    }
  }

  // Flame color: teal at 0-6, orange at 7+
  const isHotStreak = currentStreak >= 7;
  const gradientFrom = isHotStreak ? 'from-orange-400' : 'from-teal-400';
  const gradientTo = isHotStreak ? 'to-red-500' : 'to-emerald-500';

  const handleFreezeActivate = async () => {
    setFreezeLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await activateFreeze(supabase, user.id);
      await loadStreak(); // Refresh data
    } finally {
      setFreezeLoading(false);
    }
  };

  return (
    <>
      {/* Stat card — matches existing grid card style */}
      <div
        className={`rounded-xl sm:rounded-2xl p-3 sm:p-4 hover:scale-[1.02] transition-all duration-200 cursor-pointer relative ${
          variant === 'light'
            ? 'bg-white text-slate-800 border border-slate-200 shadow-sm hover:shadow-md active:scale-[0.98]'
            : 'bg-white/10 backdrop-blur-lg text-white border border-white/20 hover:bg-white/15'
        }`}
        onClick={() => setShowPopover(true)}
        onTouchStart={(e) => { touchStartY.current = e.touches[0].clientY; }}
        onTouchEnd={(e) => {
          // Only open on actual taps, not scrolls (delta < 10px)
          const endY = e.changedTouches[0].clientY;
          if (touchStartY.current !== null && Math.abs(endY - touchStartY.current) < 10) {
            e.preventDefault();
            setShowPopover(true);
          }
          touchStartY.current = null;
        }}
      >
        <div className="flex items-center gap-2 sm:gap-3">
          <div className={`w-10 h-10 sm:w-12 sm:h-12 ${variant === 'light' ? 'bg-amber-50' : 'bg-amber-500/20'} rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0`}>
            <StreakStatIcon size={26} />
          </div>
          <div className="min-w-0">
            <p className="text-2xl font-bold leading-tight">
              {currentStreak}
            </p>
            <p className={`text-xs leading-tight font-medium whitespace-nowrap ${variant === 'light' ? 'text-slate-500' : 'text-white/80'}`}>
              {currentStreak === 1 ? 'Day' : 'Day Streak'}
            </p>
          </div>
        </div>
      </div>

      {/* Popover / Detail modal */}
      <AnimatePresence>
        {showPopover && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowPopover(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-white/20 rounded-2xl p-6 max-w-sm w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={() => setShowPopover(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Header */}
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-3 bg-amber-500/20 rounded-2xl flex items-center justify-center">
                  <StreakStatIcon size={38} />
                </div>
                <h3 className="text-2xl font-black text-white">{currentStreak} Day{currentStreak !== 1 ? 's' : ''}</h3>
                <p className="text-sm text-slate-400 mt-1">
                  {currentStreak === 0
                    ? 'Complete a practice session to start your streak!'
                    : 'Keep practicing daily to grow your streak.'}
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                  <Trophy className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                  <p className="text-lg font-bold text-white">{longestStreak}</p>
                  <p className="text-[10px] text-slate-400">Longest Streak</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                  <Snowflake className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
                  <p className="text-lg font-bold text-white">{freezeInfo.freezesRemaining}</p>
                  <p className="text-[10px] text-slate-400">Freeze{freezeInfo.freezesRemaining !== 1 ? 's' : ''} Left</p>
                </div>
              </div>

              {/* Milestones */}
              <div className="mb-6">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Milestones</p>
                <div className="flex gap-2">
                  {MILESTONES_CONFIG.map(m => {
                    const achieved = longestStreak >= m.days;
                    return (
                      <div
                        key={m.days}
                        className={`flex-1 text-center py-2 rounded-lg border ${
                          achieved
                            ? 'bg-teal-500/20 border-teal-500/30'
                            : 'bg-white/5 border-white/10 opacity-50'
                        }`}
                      >
                        <div className="text-lg">{m.icon}</div>
                        <p className={`text-[10px] font-medium ${achieved ? 'text-teal-300' : 'text-slate-500'}`}>
                          {m.label}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Freeze action */}
              {freezeInfo.canFreeze && currentStreak > 0 && (
                <button
                  onClick={handleFreezeActivate}
                  disabled={freezeLoading}
                  className="w-full py-2.5 bg-cyan-500/20 border border-cyan-500/30 rounded-xl text-cyan-300 text-sm font-semibold hover:bg-cyan-500/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Snowflake className="w-4 h-4" />
                  {freezeLoading ? 'Activating...' : 'Activate Streak Freeze'}
                </button>
              )}

              {/* Tip */}
              <p className="text-xs text-slate-500 text-center mt-4">
                Complete any practice session to keep your streak alive.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
