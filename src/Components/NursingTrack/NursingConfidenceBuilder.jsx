// NursingTrack — Confidence Builder (Placeholder)
// Will be fully built in Step 4.
// This stub exists so the import in NursingTrackApp.jsx doesn't break the build.

export default function NursingConfidenceBuilder({ specialty, onBack, userData, refreshUsage }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 flex items-center justify-center p-4">
      <div className="text-center">
        <p className="text-white text-lg font-semibold mb-2">Confidence Builder</p>
        <p className="text-slate-400 text-sm mb-4">Coming in Step 4</p>
        <button
          onClick={onBack}
          onTouchEnd={(e) => { e.preventDefault(); onBack(); }}
          className="text-sky-400 hover:text-sky-300 text-sm"
        >
          ← Back to Dashboard
        </button>
      </div>
    </div>
  );
}
