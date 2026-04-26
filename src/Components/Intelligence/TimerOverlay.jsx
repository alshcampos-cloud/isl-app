/**
 * TimerOverlay.jsx — Countdown timer for timed practice mode.
 *
 * Phase 4J: Visual countdown bar with color transitions for time pressure practice.
 * Typical interview panels are 30-minute slots with 5-8 questions = ~3-4 min per answer.
 *
 * Props:
 *   isActive — whether the timer is running
 *   durationSeconds — countdown duration (120, 180, or 300)
 *   onTimeUp — callback when timer reaches 0
 *   onElapsed — callback with elapsed seconds (for WPM calculation)
 */

import { useState, useEffect, useRef, useCallback } from 'react';

function TimerOverlay({ isActive, durationSeconds = 180, onTimeUp, onElapsed }) {
  const [remaining, setRemaining] = useState(durationSeconds);
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);
  const onTimeUpRef = useRef(onTimeUp);
  const onElapsedRef = useRef(onElapsed);

  // Keep callback refs current to avoid stale closures
  onTimeUpRef.current = onTimeUp;
  onElapsedRef.current = onElapsed;

  // Reset when duration changes or timer restarts
  useEffect(() => {
    setRemaining(durationSeconds);
    startTimeRef.current = null;
  }, [durationSeconds]);

  // Timer logic
  useEffect(() => {
    if (!isActive) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      // Report elapsed time when stopping
      if (startTimeRef.current && onElapsedRef.current) {
        const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000);
        onElapsedRef.current(elapsed);
      }
      return;
    }

    // Start the timer
    if (!startTimeRef.current) {
      startTimeRef.current = Date.now();
    }

    intervalRef.current = setInterval(() => {
      setRemaining(prev => {
        const next = prev - 1;
        if (next <= 0) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          // Schedule side effect outside state updater
          setTimeout(() => { if (onTimeUpRef.current) onTimeUpRef.current(); }, 0);
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isActive]);

  if (!isActive) return null;

  // Calculate progress and colors
  const progress = remaining / durationSeconds;
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;

  // Color transitions: green → yellow (30s left) → red (10s left)
  let barColor, textColor, bgColor;
  if (remaining <= 10) {
    barColor = 'bg-red-500';
    textColor = 'text-red-600';
    bgColor = 'bg-red-100';
  } else if (remaining <= 30) {
    barColor = 'bg-amber-500';
    textColor = 'text-amber-600';
    bgColor = 'bg-amber-50';
  } else {
    barColor = 'bg-teal-500';
    textColor = 'text-teal-600';
    bgColor = 'bg-teal-50';
  }

  return (
    <div className={`w-full rounded-lg px-3 py-1.5 ${bgColor} transition-colors duration-500`}>
      <div className="flex items-center justify-between mb-1">
        <span className={`text-xs font-semibold ${textColor}`}>
          ⏱ {minutes}:{String(seconds).padStart(2, '0')}
        </span>
        <span className="text-[10px] text-slate-400">
          {durationSeconds / 60}m target
        </span>
      </div>
      <div className="h-1.5 bg-white/60 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-linear ${barColor} ${remaining <= 10 ? 'animate-pulse' : ''}`}
          style={{ width: `${progress * 100}%` }}
        />
      </div>
    </div>
  );
}

/**
 * Timer duration selector pills.
 * Props:
 *   selectedDuration — current duration in seconds
 *   onSelect — callback(seconds)
 */
export function TimerSelector({ selectedDuration, onSelect }) {
  const options = [
    { label: '2 min', seconds: 120, desc: 'Tight' },
    { label: '3 min', seconds: 180, desc: 'Standard' },
    { label: '5 min', seconds: 300, desc: 'Relaxed' },
  ];

  return (
    <div className="flex items-center gap-1.5">
      {options.map(opt => (
        <button
          key={opt.seconds}
          onClick={() => onSelect(opt.seconds)}
          className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
            selectedDuration === opt.seconds
              ? 'bg-teal-500 text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export default TimerOverlay;
