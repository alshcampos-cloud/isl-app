import React from 'react';

// LoadingShell — branded fallback shown while the lazy-loaded App chunk downloads.
// Rendered BEFORE the main <Routes> tree exists, so it must be self-contained
// (no react-router hooks, no app state). Matches the teal palette used elsewhere
// in the app (see App.jsx LoadingFallback ~line 9299 for the in-app equivalent).
export default function LoadingShell() {
  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-sky-50 flex items-center justify-center"
      role="status"
      aria-live="polite"
      aria-label="Loading InterviewAnswers.ai"
    >
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mx-auto mb-4" />
        <div className="text-slate-600 text-lg">Loading InterviewAnswers.ai...</div>
      </div>
    </div>
  );
}
