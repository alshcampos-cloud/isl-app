/**
 * SessionReport.jsx — Post-practice session summary report card.
 * Phase 4G: Shows stats, progress, weak points, and next step recommendation.
 *
 * Props:
 *   sessions — array of sessions from THIS practice session
 *   allHistory — full practiceHistory for comparison
 *   questions — all questions for coverage stats
 *   onClose — dismiss handler
 *   onDrill — optional handler to navigate to weak STAR drill
 */

import { useMemo, useEffect } from 'react';
import { X, TrendingUp, TrendingDown, Target, Zap, Lightbulb, RotateCcw } from 'lucide-react';
import NextStepSuggestion from './NextStepSuggestion';

const getScore = (s) => s.feedback?.overall ?? (s.feedback?.match_percentage != null ? s.feedback.match_percentage / 10 : null);

function SessionReport({ sessions = [], allHistory = [], questions = [], onClose, onDrill, onNavigate }) {
  const stats = useMemo(() => {
    const scored = sessions.filter(s => getScore(s) !== null);
    if (scored.length === 0) return null;

    const scores = scored.map(s => getScore(s));
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    const best = Math.max(...scores);
    const worst = Math.min(...scores);
    const bestIdx = scores.indexOf(best);
    const worstIdx = scores.indexOf(worst);

    // Compare to previous sessions (use date/question identity, not reference)
    const sessionKeys = new Set(sessions.map(s => `${s.date || ''}|${s.question || ''}`));
    const prevScored = allHistory
      .filter(s => !sessionKeys.has(`${s.date || ''}|${s.question || ''}`) && getScore(s) !== null)
      .slice(-scored.length);
    const prevAvg = prevScored.length > 0
      ? prevScored.reduce((sum, s) => sum + getScore(s), 0) / prevScored.length
      : null;

    // Coverage
    const practicedQuestions = new Set(allHistory.map(s => s.question));
    const coverage = questions.length > 0 ? Math.round((practicedQuestions.size / questions.length) * 100) : 0;

    // STAR component weakness (from framework_analysis if available)
    const starComponents = { situation: 0, task: 0, action: 0, result: 0, total: 0 };
    sessions.forEach(s => {
      const fa = s.feedback?.framework_analysis;
      if (fa) {
        starComponents.total++;
        if (fa.situation === 'Strong' || fa.situation === 'Present') starComponents.situation++;
        if (fa.task === 'Strong' || fa.task === 'Present') starComponents.task++;
        if (fa.action === 'Strong' || fa.action === 'Present') starComponents.action++;
        if (fa.result === 'Strong' || fa.result === 'Present') starComponents.result++;
      }
    });

    let weakestStar = null;
    if (starComponents.total > 0) {
      const rates = [
        { name: 'Situation', rate: starComponents.situation / starComponents.total },
        { name: 'Task', rate: starComponents.task / starComponents.total },
        { name: 'Action', rate: starComponents.action / starComponents.total },
        { name: 'Result', rate: starComponents.result / starComponents.total },
      ];
      weakestStar = rates.sort((a, b) => a.rate - b.rate)[0];
    }

    // Individual question score list
    const scoredQuestions = scored.map((s, i) => ({
      question: s.question || `Question ${i + 1}`,
      score: scores[i],
    }));

    return {
      count: scored.length,
      avg,
      best,
      worst,
      bestQuestion: scored[bestIdx]?.question,
      worstQuestion: scored[worstIdx]?.question,
      prevAvg,
      improvement: prevAvg !== null ? avg - prevAvg : null,
      coverage,
      practicedTotal: practicedQuestions.size,
      weakestStar,
      scoredQuestions,
    };
  }, [sessions, allHistory, questions]);

  // Quick Tip based on average score
  const quickTip = useMemo(() => {
    if (!stats) return null;
    const avg = stats.avg;
    if (avg >= 8) return { text: "Excellent session! You're ready for showtime.", color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' };
    if (avg >= 6) return { text: 'Good progress. Focus on adding more specific details and quantified results.', color: 'text-teal-700', bg: 'bg-teal-50 border-teal-200' };
    if (avg >= 4) return { text: 'Solid practice. Try using the STAR framework more deliberately.', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' };
    return { text: "Keep going! Every session makes you sharper. Try the Teach Me guides.", color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200' };
  }, [stats]);

  // Score dot color helper
  const scoreDotColor = (score) => {
    if (score >= 8) return 'bg-emerald-500';
    if (score >= 6) return 'bg-teal-500';
    if (score >= 4) return 'bg-amber-500';
    return 'bg-red-500';
  };

  // Escape key dismiss
  useEffect(() => {
    const handleKeyDown = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!stats) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Session Report">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} onTouchEnd={(e) => { e.preventDefault(); onClose(); }} />
        <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-teal-600 to-emerald-600 px-6 py-5 text-white">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Session Report</h2>
              <button onClick={onClose} aria-label="Close" className="p-1 hover:bg-white/20 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="p-8 text-center">
            <Zap className="w-10 h-10 text-teal-400 mx-auto mb-3" />
            <p className="text-lg font-bold text-gray-800 mb-2">Great practice!</p>
            <p className="text-sm text-gray-500">Your scores are still being calculated. Keep practicing to see detailed analytics here.</p>
          </div>
          <div className="px-6 py-4 bg-gray-50 border-t">
            <button onClick={onClose} className="w-full py-2.5 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-100 transition-all">Done</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Session Report">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} onTouchEnd={(e) => { e.preventDefault(); onClose(); }} />
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 to-emerald-600 px-6 py-5 text-white">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Session Report</h2>
            <button onClick={onClose} aria-label="Close" className="p-1 hover:bg-white/20 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-sm opacity-80 mt-1">{stats.count} question{stats.count !== 1 ? 's' : ''} practiced</p>
        </div>

        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Quick Tip */}
          {quickTip && (
            <div className={`flex items-start gap-2.5 p-3 rounded-xl border ${quickTip.bg}`}>
              <Lightbulb className={`w-4 h-4 mt-0.5 flex-shrink-0 ${quickTip.color}`} />
              <div>
                <p className={`text-xs font-semibold ${quickTip.color}`}>Quick Tip</p>
                <p className="text-xs text-gray-600 mt-0.5">{quickTip.text}</p>
              </div>
            </div>
          )}

          {/* Score summary */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 bg-teal-50 rounded-xl">
              <p className="text-2xl font-black text-teal-600">{stats.avg.toFixed(1)}</p>
              <p className="text-[10px] text-gray-500">Average</p>
            </div>
            <div className="text-center p-3 bg-emerald-50 rounded-xl">
              <p className="text-2xl font-black text-emerald-600">{stats.best.toFixed(1)}</p>
              <p className="text-[10px] text-gray-500">Best</p>
            </div>
            <div className="text-center p-3 bg-amber-50 rounded-xl">
              <p className="text-2xl font-black text-amber-600">{stats.worst.toFixed(1)}</p>
              <p className="text-[10px] text-gray-500">Lowest</p>
            </div>
          </div>

          {/* Individual question scores */}
          {stats.scoredQuestions.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Question Breakdown</p>
              {stats.scoredQuestions.map((q, i) => (
                <div key={i} className="flex items-center gap-2 px-2 py-1.5 bg-gray-50 rounded-lg">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${scoreDotColor(q.score)}`} />
                  <p className="text-xs text-gray-600 flex-1 line-clamp-1">{q.question}</p>
                  <span className="text-xs font-bold text-gray-700 tabular-nums">{q.score.toFixed(1)}</span>
                </div>
              ))}
            </div>
          )}

          {/* Improvement vs last session */}
          {stats.improvement !== null && (
            <div className={`flex items-center gap-2 p-3 rounded-xl ${stats.improvement >= 0 ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              {stats.improvement >= 0
                ? <TrendingUp className="w-5 h-5 text-green-600" />
                : <TrendingDown className="w-5 h-5 text-red-600" />
              }
              <span className={`text-sm font-semibold ${stats.improvement >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                {stats.improvement >= 0 ? '+' : ''}{stats.improvement.toFixed(1)} points vs previous session
              </span>
            </div>
          )}

          {/* Best & Worst */}
          {stats.bestQuestion && stats.count > 1 && (
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <span className="text-green-500">⭐</span>
                <div>
                  <p className="text-xs font-semibold text-green-700">Strongest</p>
                  <p className="text-xs text-gray-600 line-clamp-1">{stats.bestQuestion}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-amber-500">📚</span>
                <div>
                  <p className="text-xs font-semibold text-amber-700">Needs Work</p>
                  <p className="text-xs text-gray-600 line-clamp-1">{stats.worstQuestion}</p>
                </div>
              </div>
            </div>
          )}

          {/* Weakest STAR component */}
          {stats.weakestStar && stats.weakestStar.rate < 0.7 && (
            <div className="bg-purple-50 rounded-xl p-3 border border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-purple-700">Weakest STAR Component: {stats.weakestStar.name}</p>
                  <p className="text-[10px] text-purple-500">
                    Strong in {Math.round(stats.weakestStar.rate * 100)}% of answers
                  </p>
                </div>
                {onDrill && (
                  <button
                    onClick={() => { onClose(); onDrill(stats.weakestStar.name); }}
                    className="px-3 py-1 bg-purple-500 text-white text-xs rounded-lg font-medium hover:bg-purple-600"
                  >
                    Drill It
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Coverage */}
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-gray-600">Overall Coverage</span>
              <span className="text-xs text-gray-500">{stats.practicedTotal} of {questions.length}</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-teal-500 rounded-full" style={{ width: `${stats.coverage}%` }} />
            </div>
            <p className="text-[10px] text-gray-400 mt-1">{stats.coverage}% of your question bank practiced</p>
          </div>
        </div>

        {/* Next Step Suggestions */}
        {onNavigate && (
          <div className="px-6">
            <NextStepSuggestion context="practice-end" onNavigate={(view) => { onClose?.(); onNavigate(view); }} />
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-100 transition-all"
          >
            Done
          </button>
          {stats.weakestStar && stats.weakestStar.rate < 0.7 && onDrill && (
            <button
              onClick={() => onDrill(stats.weakestStar.name)}
              className="flex-1 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-indigo-600 transition-all flex items-center justify-center gap-1.5"
            >
              <Target className="w-4 h-4" />
              Drill {stats.weakestStar.name}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default SessionReport;
