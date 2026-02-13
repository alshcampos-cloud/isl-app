// NursingTrack — Loading Skeleton
// ============================================================
// Shared loading state for components that use useNursingQuestions.
// Shows a subtle pulse animation while questions load.
//
// Usage:
//   if (loading) return <NursingLoadingSkeleton title="Quick Practice" onBack={onBack} />;
//
// D.R.A.F.T. Protocol: NEW file. No existing code modified.
// ============================================================

import { ArrowLeft, Loader2 } from 'lucide-react';

export default function NursingLoadingSkeleton({ title = 'Loading...', onBack }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900">
      {/* Top Nav */}
      <div className="bg-slate-900/80 backdrop-blur-lg border-b border-white/10 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Back</span>
            </button>
          )}
          <span className="text-white/60 text-sm font-medium">{title}</span>
          <div className="w-16" /> {/* spacer for alignment */}
        </div>
      </div>

      {/* Loading Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-sky-400 animate-spin mb-4" />
        <p className="text-slate-400 text-sm">Loading questions...</p>

        {/* Skeleton Cards */}
        <div className="w-full mt-8 space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white/5 border border-white/10 rounded-xl p-5 animate-pulse"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-white/10 rounded-lg" />
                <div className="h-4 bg-white/10 rounded w-1/3" />
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-white/5 rounded w-full" />
                <div className="h-3 bg-white/5 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
