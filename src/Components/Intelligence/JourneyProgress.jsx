/**
 * JourneyProgress.jsx — Visual 5-step progress bar for the home screen.
 *
 * Shows users where they are in their interview prep journey:
 *   Step 1: Practice → Step 2: Stories → Step 3: Decode JD → Step 4: Portfolio → Step 5: Ready
 *
 * D.R.A.F.T. protocol: NEW file. Minimal App.jsx touch (import + 1 render line).
 *
 * Props:
 *   practiceHistory — array of past practice sessions
 *   questions       — array of question objects
 *   getUserContext   — function returning { jobDescription, company, etc. }
 *   onNavigate      — (viewName) => void — triggers navigation
 */

import { useState } from 'react';
import { CheckCircle, Target, BookOpen, FileText, Briefcase, Trophy } from 'lucide-react';

const STEPS = [
  { id: 'practice',  label: 'Practice',   sublabel: 'Complete 1 session',  icon: Target,    view: 'practice' },
  { id: 'stories',   label: 'Stories',    sublabel: 'Build STAR stories',  icon: BookOpen,  view: 'story-bank' },
  { id: 'jd',        label: 'Decode JD',  sublabel: 'Analyze a job post',  icon: FileText,  view: 'jd-decoder' },
  { id: 'portfolio',  label: 'Portfolio',   sublabel: 'Add your work',       icon: Briefcase, view: 'portfolio' },
  { id: 'ready',     label: 'Ready',      sublabel: 'Interview ready!',    icon: Trophy,    view: 'command-center' },
];

export default function JourneyProgress({ practiceHistory = [], questions = [], getUserContext, onNavigate }) {
  const [dismissed, setDismissed] = useState(false);

  // ─── Compute milestones ─────────────────────────────────────────────────────

  const hasPractice = practiceHistory.length >= 1;

  const hasStories = (() => {
    try {
      const raw = localStorage.getItem('isl_stories');
      return raw ? JSON.parse(raw).length > 0 : false;
    } catch { return false; }
  })();

  const hasJD = (() => {
    try {
      const ctx = getUserContext ? getUserContext() : {};
      return !!(ctx.jobDescription && ctx.jobDescription.length > 20);
    } catch { return false; }
  })();

  const hasPortfolio = (() => {
    try {
      const raw = localStorage.getItem('isl_portfolio');
      return raw ? JSON.parse(raw).length > 0 : false;
    } catch { return false; }
  })();

  const coverage = (() => {
    if (questions.length === 0) return 0;
    const practiced = new Set(practiceHistory.map(s => s.question));
    return Math.round((practiced.size / questions.length) * 100);
  })();

  const isReady = hasPractice && hasStories && hasJD && hasPortfolio && coverage >= 50;

  // Map step IDs to completion status
  const status = {
    practice: hasPractice,
    stories: hasStories,
    jd: hasJD,
    portfolio: hasPortfolio,
    ready: isReady,
  };

  // Find current step (first incomplete)
  const currentStepIdx = STEPS.findIndex(s => !status[s.id]);
  const allComplete = currentStepIdx === -1;
  const completedCount = STEPS.filter(s => status[s.id]).length;

  // Don't show if dismissed
  if (dismissed) return null;

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="mb-4 sm:mb-6 bg-white rounded-2xl border border-slate-100/80 shadow-[0_2px_16px_-4px_rgba(0,0,0,0.06)] p-3 sm:p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs sm:text-sm font-bold text-slate-800 tracking-tight">
            {allComplete ? 'Journey Complete!' : 'Your Prep Journey'}
          </p>
          <p className="text-[10px] sm:text-xs text-slate-400 font-medium">
            {allComplete ? "You're interview ready" : `${completedCount} of ${STEPS.length} milestones`}
          </p>
        </div>
        {allComplete && (
          <button
            onClick={() => setDismissed(true)}
            className="text-[10px] text-slate-400 hover:text-slate-600 transition-colors"
          >
            Hide
          </button>
        )}
      </div>

      {/* Steps */}
      <div className="flex items-start justify-between relative">
        {/* Background line */}
        <div className="absolute top-4 left-4 right-4 h-0.5 bg-slate-200/60 z-0 rounded-full" />
        {/* Progress line */}
        <div
          className="absolute top-4 left-4 h-0.5 bg-gradient-to-r from-teal-400 to-emerald-400 z-0 transition-all duration-700 ease-out rounded-full"
          style={{
            width: `${allComplete ? 100 : Math.max(0, (currentStepIdx / (STEPS.length - 1)) * 100)}%`,
          }}
        />

        {STEPS.map((step, i) => {
          const isComplete = status[step.id];
          const isCurrent = i === currentStepIdx;
          const Icon = step.icon;

          return (
            <button
              key={step.id}
              onClick={() => onNavigate?.(step.view)}
              onTouchEnd={(e) => { e.preventDefault(); onNavigate?.(step.view); }}
              className="flex flex-col items-center relative z-10 group"
              style={{ flex: 1, minWidth: 0 }}
            >
              {/* Circle node */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                isComplete
                  ? 'bg-gradient-to-br from-teal-400 to-emerald-500 shadow-md shadow-teal-500/40 ring-2 ring-teal-200/50 ring-offset-1'
                  : isCurrent
                  ? 'bg-white border-2 border-teal-400 shadow-lg shadow-teal-400/30 ring-4 ring-teal-100/60 animate-pulse'
                  : 'bg-slate-50 border border-slate-200'
              }`}>
                {isComplete ? (
                  <CheckCircle className="w-4 h-4 text-white" />
                ) : (
                  <Icon className={`w-3.5 h-3.5 ${isCurrent ? 'text-teal-500' : 'text-slate-300'}`} />
                )}
              </div>

              {/* Label */}
              <p className={`text-[9px] sm:text-[10px] font-semibold mt-1 leading-tight text-center ${
                isComplete ? 'text-teal-600' : isCurrent ? 'text-slate-700' : 'text-slate-300'
              }`}>
                {step.label}
              </p>

              {/* Sublabel - desktop only */}
              <p className={`text-[7px] sm:text-[8px] leading-tight text-center hidden sm:block ${
                isComplete ? 'text-teal-400' : isCurrent ? 'text-slate-400' : 'text-slate-200'
              }`}>
                {step.sublabel}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
