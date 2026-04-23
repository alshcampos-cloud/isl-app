/**
 * NextStepSuggestion.jsx — Contextual "What's Next?" suggestions
 * shown at the end of feature workflows to reconnect features.
 *
 * D.R.A.F.T. protocol: NEW file.
 *
 * Usage:
 *   <NextStepSuggestion context="practice-end" onNavigate={fn} />
 *   <NextStepSuggestion context="jd-complete" onNavigate={fn} />
 *   <NextStepSuggestion context="story-match" onNavigate={fn} />
 *   <NextStepSuggestion context="portfolio-analysis" onNavigate={fn} />
 */

import { ChevronRight } from 'lucide-react';

function getSuggestions(context) {
  // Read feature state from localStorage to determine relevant suggestions
  const hasStories = (() => {
    try { return JSON.parse(localStorage.getItem('isl_stories') || '[]').length > 0; } catch { return false; }
  })();

  const hasPortfolio = (() => {
    try { return JSON.parse(localStorage.getItem('isl_portfolio') || '[]').length > 0; } catch { return false; }
  })();

  const hasJD = (() => {
    try {
      return Object.keys(localStorage).some(k => k.startsWith('jd_decoder_'));
    } catch { return false; }
  })();

  switch (context) {
    case 'practice-end':
      return [
        !hasStories && { label: 'Build your Story Bank', desc: 'Turn this practice into a reusable STAR story', view: 'story-bank', color: 'from-emerald-500 to-teal-500' },
        !hasPortfolio && { label: 'Add to Portfolio', desc: 'Document your work for future interviews', view: 'portfolio', color: 'from-indigo-500 to-purple-500' },
        hasStories && !hasJD && { label: 'Decode a Job Description', desc: 'Get questions tailored to your target role', view: 'jd-decoder', color: 'from-sky-500 to-blue-500' },
        hasStories && hasJD && { label: 'View Progress', desc: 'See how your interview prep is tracking', view: 'command-center', color: 'from-teal-500 to-emerald-500' },
      ].filter(Boolean).slice(0, 2);

    case 'jd-complete':
      return [
        hasPortfolio && { label: 'Match to Portfolio', desc: 'See which projects match this job', view: 'portfolio', color: 'from-indigo-500 to-purple-500' },
        { label: 'Practice Targeted Questions', desc: 'Practice questions predicted for this role', view: 'practice', color: 'from-teal-500 to-emerald-500' },
        !hasStories && { label: 'Build Stories', desc: 'Prepare STAR stories for these questions', view: 'story-bank', color: 'from-emerald-500 to-teal-500' },
      ].filter(Boolean).slice(0, 2);

    case 'story-match':
      return [
        { label: 'Practice These Questions', desc: 'Put your stories to work', view: 'practice', color: 'from-teal-500 to-emerald-500' },
        !hasJD && { label: 'Decode a JD', desc: 'Get questions for your target role', view: 'jd-decoder', color: 'from-sky-500 to-blue-500' },
        hasJD && hasPortfolio && { label: 'Match to Portfolio', desc: 'Connect stories to your past work', view: 'portfolio', color: 'from-indigo-500 to-purple-500' },
      ].filter(Boolean).slice(0, 2);

    case 'portfolio-analysis':
      return [
        hasJD && { label: 'Match to JD', desc: 'See how this project fits your target role', view: 'jd-match', color: 'from-sky-500 to-blue-500' },
        { label: 'Walk Through', desc: 'Let AI help you talk about this project', view: 'walkthrough', color: 'from-purple-500 to-indigo-500' },
        !hasStories && { label: 'Build Stories', desc: 'Turn this into interview-ready STAR stories', view: 'story-bank', color: 'from-emerald-500 to-teal-500' },
      ].filter(Boolean).slice(0, 2);

    default:
      return [];
  }
}

export default function NextStepSuggestion({ context, onNavigate }) {
  const suggestions = getSuggestions(context);

  if (suggestions.length === 0) return null;

  return (
    <div className="mt-4 pt-4 border-t border-slate-100">
      <p className="text-xs font-semibold text-slate-500 mb-2">What's Next?</p>
      <div className="space-y-2">
        {suggestions.map((s, i) => (
          <button
            key={i}
            onClick={() => onNavigate?.(s.view)}
            onTouchEnd={(e) => { e.preventDefault(); onNavigate?.(s.view); }}
            className="w-full flex items-center gap-3 p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all group text-left"
          >
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${s.color} flex items-center justify-center flex-shrink-0`}>
              <ChevronRight className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-700 group-hover:text-slate-900">{s.label}</p>
              <p className="text-[10px] text-slate-400">{s.desc}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 flex-shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
}
