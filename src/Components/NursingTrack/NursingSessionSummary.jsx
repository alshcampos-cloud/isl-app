// NursingTrack — Session Summary
// Shown after a mock interview session ends.
// Displays per-question scores, framework breakdown, strengths, areas to improve.
//
// Score parsing uses defensive null fallback — "Unscored" when AI doesn't format tag.
// This component NEVER generates clinical content. It summarizes communication coaching.
//
// ⚠️ D.R.A.F.T. Protocol: NEW file. No existing code modified.

import { motion } from 'framer-motion';
import {
  ArrowLeft, RotateCcw, BarChart3, CheckCircle, AlertCircle,
  BookOpen, Stethoscope, Target, TrendingUp
} from 'lucide-react';

export default function NursingSessionSummary({ specialty, sessionResults, onRetry, onBack }) {
  // ============================================================
  // COMPUTE SUMMARY STATS
  // ============================================================

  const totalQuestions = sessionResults.length;

  // Separate scored vs unscored
  const scoredResults = sessionResults.filter(r => r.score !== null);
  const unscoredCount = totalQuestions - scoredResults.length;

  // Overall average (only from scored results)
  const avgScore = scoredResults.length > 0
    ? (scoredResults.reduce((sum, r) => sum + r.score, 0) / scoredResults.length).toFixed(1)
    : null;

  // Framework breakdown
  const sbarResults = sessionResults.filter(r => r.responseFramework === 'sbar');
  const starResults = sessionResults.filter(r => r.responseFramework === 'star');

  const sbarScored = sbarResults.filter(r => r.score !== null);
  const starScored = starResults.filter(r => r.score !== null);

  const sbarAvg = sbarScored.length > 0
    ? (sbarScored.reduce((sum, r) => sum + r.score, 0) / sbarScored.length).toFixed(1)
    : null;
  const starAvg = starScored.length > 0
    ? (starScored.reduce((sum, r) => sum + r.score, 0) / starScored.length).toFixed(1)
    : null;

  // Strengths and areas to improve (top and bottom scored)
  const sortedByScore = [...scoredResults].sort((a, b) => b.score - a.score);
  const strengths = sortedByScore.slice(0, 2); // Top 2
  const toImprove = sortedByScore.length > 2
    ? sortedByScore.slice(-2).reverse() // Bottom 2
    : [];

  // Score color helper
  const scoreColor = (score) => {
    if (score === null) return 'text-slate-400';
    if (score >= 4) return 'text-green-400';
    if (score >= 3) return 'text-yellow-400';
    return 'text-red-400';
  };

  const scoreBg = (score) => {
    if (score === null) return 'bg-slate-500/10 border-slate-500/20';
    if (score >= 4) return 'bg-green-500/10 border-green-500/20';
    if (score >= 3) return 'bg-yellow-500/10 border-yellow-500/20';
    return 'bg-red-500/10 border-red-500/20';
  };

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900">
      {/* Header */}
      <div className="bg-slate-900/80 backdrop-blur-lg border-b border-white/10 sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Dashboard</span>
          </button>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-sky-400" />
            <span className="text-white font-medium text-sm">Session Summary</span>
          </div>
          <div className="w-16" />
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="text-5xl mb-3">{specialty.icon}</div>
          <h1 className="text-2xl font-bold text-white mb-2">Session Complete</h1>
          <p className="text-slate-400 text-sm">
            {specialty.name} Mock Interview — {totalQuestions} question{totalQuestions !== 1 ? 's' : ''} practiced
          </p>
        </motion.div>

        {/* Overall Score Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6 text-center"
        >
          {avgScore !== null ? (
            <>
              <div className={`text-5xl font-bold mb-1 ${scoreColor(parseFloat(avgScore))}`}>
                {avgScore}
              </div>
              <div className="text-slate-400 text-sm">out of 5.0</div>
              <div className="text-slate-500 text-xs mt-1">
                Based on {scoredResults.length} scored response{scoredResults.length !== 1 ? 's' : ''}
                {unscoredCount > 0 && ` (${unscoredCount} unscored)`}
              </div>
            </>
          ) : (
            <>
              <div className="text-3xl font-bold text-slate-400 mb-1">No Scores</div>
              <div className="text-slate-500 text-xs">
                The AI wasn't able to generate scores for this session. Your practice is still valuable!
              </div>
            </>
          )}
        </motion.div>

        {/* Framework Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="grid grid-cols-2 gap-3 mb-6"
        >
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
            <div className="text-green-400 text-xs font-semibold mb-1">SBAR</div>
            <div className="text-white text-xl font-bold">
              {sbarAvg !== null ? sbarAvg : '--'}
            </div>
            <div className="text-slate-500 text-xs mt-1">
              {sbarResults.length} clinical question{sbarResults.length !== 1 ? 's' : ''}
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
            <div className="text-purple-400 text-xs font-semibold mb-1">STAR</div>
            <div className="text-white text-xl font-bold">
              {starAvg !== null ? starAvg : '--'}
            </div>
            <div className="text-slate-500 text-xs mt-1">
              {starResults.length} behavioral question{starResults.length !== 1 ? 's' : ''}
            </div>
          </div>
        </motion.div>

        {/* Strengths */}
        {strengths.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-400" />
              Strongest Responses
            </h3>
            <div className="space-y-2">
              {strengths.map((result, i) => (
                <div key={i} className="bg-green-500/5 border border-green-500/10 rounded-xl p-3 flex items-start gap-3">
                  <div className={`text-sm font-bold ${scoreColor(result.score)} mt-0.5`}>
                    {result.score}/5
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-medium truncate">{result.question}</p>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full mt-1 inline-block ${
                      result.responseFramework === 'sbar'
                        ? 'bg-green-500/20 text-green-300'
                        : 'bg-purple-500/20 text-purple-300'
                    }`}>
                      {result.responseFramework === 'sbar' ? 'SBAR' : 'STAR'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Areas to Improve */}
        {toImprove.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mb-6"
          >
            <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
              <Target className="w-4 h-4 text-amber-400" />
              Areas to Strengthen
            </h3>
            <div className="space-y-2">
              {toImprove.map((result, i) => (
                <div key={i} className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-3 flex items-start gap-3">
                  <div className={`text-sm font-bold ${scoreColor(result.score)} mt-0.5`}>
                    {result.score}/5
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-medium truncate">{result.question}</p>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full mt-1 inline-block ${
                      result.responseFramework === 'sbar'
                        ? 'bg-green-500/20 text-green-300'
                        : 'bg-purple-500/20 text-purple-300'
                    }`}>
                      {result.responseFramework === 'sbar' ? 'SBAR' : 'STAR'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Per-Question Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-sky-400" />
            All Questions
          </h3>
          <div className="space-y-2">
            {sessionResults.map((result, i) => (
              <div key={i} className={`border rounded-xl p-3 flex items-center gap-3 ${scoreBg(result.score)}`}>
                <div className="text-slate-500 text-xs font-mono w-5 flex-shrink-0">
                  {i + 1}.
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs truncate">{result.question}</p>
                </div>
                <span className={`text-xs px-1.5 py-0.5 rounded-full flex-shrink-0 ${
                  result.responseFramework === 'sbar'
                    ? 'bg-green-500/20 text-green-300'
                    : 'bg-purple-500/20 text-purple-300'
                }`}>
                  {result.responseFramework === 'sbar' ? 'SBAR' : 'STAR'}
                </span>
                <div className={`text-sm font-bold flex-shrink-0 ${scoreColor(result.score)}`}>
                  {result.score !== null ? `${result.score}/5` : 'Unscored'}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recommended Resources */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-sky-500/10 border border-sky-400/20 rounded-xl p-4 mb-6"
        >
          <h3 className="text-sky-200 text-sm font-medium mb-2 flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Recommended Resources
          </h3>
          <p className="text-sky-300/70 text-xs leading-relaxed mb-2">
            Continue building your clinical knowledge with these free resources:
          </p>
          <div className="space-y-1">
            {sbarResults.length > 0 && (
              <p className="text-sky-300 text-xs">
                • <strong>SBAR Toolkit</strong> — Institute for Healthcare Improvement (free)
              </p>
            )}
            <p className="text-sky-300 text-xs">
              • <strong>NCLEX-RN Test Plan</strong> — NCSBN (free PDF)
            </p>
            <p className="text-sky-300 text-xs">
              • <strong>National Patient Safety Goals</strong> — Joint Commission
            </p>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-3 mb-8"
        >
          <button
            onClick={onRetry}
            className="flex-1 bg-gradient-to-r from-sky-600 to-cyan-500 text-white font-semibold py-3 rounded-xl shadow-lg shadow-sky-500/30 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Try Again
          </button>
          <button
            onClick={onBack}
            className="flex-1 bg-white/10 border border-white/20 text-white font-semibold py-3 rounded-xl hover:bg-white/20 transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
        </motion.div>

        {/* Walled garden reminder */}
        <p className="text-slate-600 text-xs text-center mb-4">
          AI coaches your communication and delivery • Clinical content reviewed by nursing professionals
        </p>
      </div>
    </div>
  );
}
