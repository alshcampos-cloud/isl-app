import { isTap } from '../../utils/tapGuard';
/**
 * TrialBanner.jsx — Shows premium trial status across the app.
 *
 * Three states:
 *   1. Active trial with hours remaining → green/teal banner with countdown
 *   2. Trial expiring soon (≤4 hours) → amber banner with urgency
 *   3. Trial expired → subtle banner with upgrade CTA
 *
 * Props:
 *   trialInfo — from getTrialInfo() { ends, hoursLeft, minutesLeft, isActive, isExpired, isExpiringSoon }
 *   onUpgrade — handler to show pricing page
 *   onDismiss — optional dismiss handler (for expired banner)
 */

import { useState, useEffect } from 'react';
import { Sparkles, Clock, X } from 'lucide-react';

function TrialBanner({ trialInfo, onUpgrade, onDismiss }) {
  const [timeLeft, setTimeLeft] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  // Live countdown timer
  useEffect(() => {
    if (!trialInfo?.isActive) return;

    const updateTime = () => {
      const now = new Date();
      const ms = trialInfo.ends - now;
      if (ms <= 0) {
        setTimeLeft(null);
        return;
      }
      const h = Math.floor(ms / (1000 * 60 * 60));
      const m = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
      setTimeLeft(`${h}h ${m}m`);
    };

    updateTime();
    const interval = setInterval(updateTime, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [trialInfo]);

  if (!trialInfo || dismissed) return null;

  // Active trial — show countdown
  if (trialInfo.isActive && !trialInfo.isExpiringSoon) {
    return (
      <div className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white px-4 py-2.5 flex items-center justify-center gap-2 text-sm">
        <Sparkles className="w-4 h-4 flex-shrink-0" />
        <span className="font-medium">Premium Trial Active</span>
        {timeLeft && (
          <span className="flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full text-xs font-bold">
            <Clock className="w-3 h-3" />
            {timeLeft} left
          </span>
        )}
        <span className="text-white/70 text-xs hidden sm:inline">— All features unlocked</span>
      </div>
    );
  }

  // Expiring soon — urgency
  if (trialInfo.isActive && trialInfo.isExpiringSoon) {
    return (
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2.5 flex items-center justify-between gap-2 text-sm">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 flex-shrink-0 animate-pulse" />
          <span className="font-medium">Trial ending soon — {timeLeft || 'minutes'} left</span>
        </div>
        <button
          onClick={onUpgrade}
          onTouchEnd={(e) => { if (isTap(e)) { e.preventDefault(); onUpgrade(); } }}
          className="px-3 py-1 bg-white text-orange-600 rounded-full text-xs font-bold hover:bg-orange-50 transition-colors flex-shrink-0"
        >
          Keep Premium
        </button>
      </div>
    );
  }

  // Expired — subtle CTA
  if (trialInfo.isExpired) {
    return (
      <div className="bg-gray-100 border-b border-gray-200 px-4 py-2 flex items-center justify-between gap-2 text-sm">
        <div className="flex items-center gap-2 text-gray-600">
          <Sparkles className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <span>Your premium trial has ended</span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={onUpgrade}
            onTouchEnd={(e) => { if (isTap(e)) { e.preventDefault(); onUpgrade(); } }}
            className="px-3 py-1 bg-teal-500 text-white rounded-full text-xs font-bold hover:bg-teal-600 transition-colors"
          >
            Upgrade
          </button>
          {onDismiss && (
            <button
              onClick={() => { setDismissed(true); onDismiss(); }}
              onTouchEnd={(e) => { if (isTap(e)) { e.preventDefault(); setDismissed(true); onDismiss(); } }}
              aria-label="Dismiss"
              className="p-1 hover:bg-gray-200 rounded"
            >
              <X className="w-3.5 h-3.5 text-gray-400" />
            </button>
          )}
        </div>
      </div>
    );
  }

  return null;
}

export default TrialBanner;
