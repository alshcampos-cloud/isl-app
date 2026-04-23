/**
 * DeliveryInsights.jsx — Delivery analytics shown in practice feedback results.
 *
 * Phase 4B: Surfaces word count, filler words, hedging language, WPM, and
 * answer length assessment from data we ALREADY capture but never displayed.
 *
 * Props:
 *   answer — the user's answer text
 *   durationSeconds — optional recording duration (null if not timed)
 *   compact — if true, shows minimal inline version
 */

import { useMemo, useState } from 'react';
import { analyzeDelivery, getDeliveryTips } from '../../utils/deliveryMetrics';
import { ChevronDown, ChevronRight } from 'lucide-react';

// Answer length config
const LENGTH_CONFIG = {
  'too-short': { label: 'Too Short', color: 'text-amber-600', bg: 'bg-amber-50', bar: 'bg-amber-400', width: '15%' },
  'brief': { label: 'Brief', color: 'text-sky-600', bg: 'bg-sky-50', bar: 'bg-sky-400', width: '35%' },
  'good': { label: 'Good Length', color: 'text-emerald-600', bg: 'bg-emerald-50', bar: 'bg-emerald-400', width: '60%' },
  'detailed': { label: 'Detailed', color: 'text-teal-600', bg: 'bg-teal-50', bar: 'bg-teal-400', width: '85%' },
  'too-long': { label: 'Too Long', color: 'text-red-600', bg: 'bg-red-50', bar: 'bg-red-400', width: '100%' },
  'none': { label: 'No Answer', color: 'text-slate-400', bg: 'bg-slate-50', bar: 'bg-slate-300', width: '0%' },
};

function DeliveryInsights({ answer, durationSeconds = null, compact = false }) {
  const [expanded, setExpanded] = useState(false);

  const metrics = useMemo(() => analyzeDelivery(answer, durationSeconds), [answer, durationSeconds]);
  const tips = useMemo(() => getDeliveryTips(metrics), [metrics]);
  const lengthConfig = LENGTH_CONFIG[metrics.answerLength] || LENGTH_CONFIG['none'];

  if (!answer || metrics.wordCount === 0) return null;

  // Compact inline version — just the key stats
  if (compact) {
    return (
      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
        <span>{metrics.wordCount} words</span>
        {metrics.fillers.total > 0 && (
          <span className="text-amber-600">• {metrics.fillers.total} filler{metrics.fillers.total !== 1 ? 's' : ''}</span>
        )}
        {metrics.wpm.wpm > 0 && (
          <span>• {metrics.wpm.wpm} WPM</span>
        )}
        <span className={lengthConfig.color}>• {lengthConfig.label}</span>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 rounded-xl border border-slate-200/80 overflow-hidden mt-3">
      {/* Header — always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-slate-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-700">📊 Delivery Analysis</span>
          {/* Quick stats inline */}
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>{metrics.wordCount}w</span>
            {metrics.fillers.total > 0 && (
              <span className="text-amber-600 font-medium">{metrics.fillers.total} fillers</span>
            )}
            {metrics.wpm.wpm > 0 && <span>{metrics.wpm.wpm} WPM</span>}
          </div>
        </div>
        {expanded
          ? <ChevronDown className="w-4 h-4 text-slate-400" />
          : <ChevronRight className="w-4 h-4 text-slate-400" />
        }
      </button>

      {/* Expanded details */}
      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-slate-200/60">
          {/* Stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3">
            {/* Word Count */}
            <div className="bg-white rounded-lg p-2.5 border border-slate-100 text-center">
              <p className="text-lg font-bold text-slate-800">{metrics.wordCount}</p>
              <p className="text-[10px] text-slate-500 font-medium">Words</p>
            </div>

            {/* Filler Words */}
            <div className={`rounded-lg p-2.5 border text-center ${
              metrics.fillers.total >= 3 ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-100'
            }`}>
              <p className={`text-lg font-bold ${metrics.fillers.total >= 3 ? 'text-amber-600' : 'text-slate-800'}`}>
                {metrics.fillers.total}
              </p>
              <p className="text-[10px] text-slate-500 font-medium">Fillers</p>
            </div>

            {/* Hedging */}
            <div className={`rounded-lg p-2.5 border text-center ${
              metrics.hedging.total >= 2 ? 'bg-orange-50 border-orange-200' : 'bg-white border-slate-100'
            }`}>
              <p className={`text-lg font-bold ${metrics.hedging.total >= 2 ? 'text-orange-600' : 'text-slate-800'}`}>
                {metrics.hedging.total}
              </p>
              <p className="text-[10px] text-slate-500 font-medium" title="Phrases that weaken confidence: 'I think', 'maybe', 'probably'">Hedging*</p>
            </div>

            {/* WPM */}
            <div className="bg-white rounded-lg p-2.5 border border-slate-100 text-center">
              <p className="text-lg font-bold text-slate-800">
                {metrics.wpm.wpm > 0 ? metrics.wpm.wpm : '—'}
              </p>
              <p className="text-[10px] text-slate-500 font-medium">WPM</p>
            </div>
          </div>

          {/* Answer Length Bar */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-500">Answer Length</span>
              <span className={`text-xs font-semibold ${lengthConfig.color}`}>{lengthConfig.label}</span>
            </div>
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${lengthConfig.bar}`}
                style={{ width: lengthConfig.width }}
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">Ideal: 100-200 words (60-90 seconds)</p>
          </div>

          {/* Filler breakdown */}
          {metrics.fillers.breakdown.length > 0 && (
            <div>
              <p className="text-xs font-medium text-slate-600 mb-1">Filler Words Breakdown</p>
              <div className="flex flex-wrap gap-1.5">
                {metrics.fillers.breakdown.map(({ word, count }) => (
                  <span
                    key={word}
                    className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium"
                  >
                    "{word}" × {count}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Hedging breakdown */}
          {metrics.hedging.breakdown.length > 0 && (
            <div>
              <p className="text-xs font-medium text-slate-600 mb-1">Hedging Language</p>
              <div className="flex flex-wrap gap-1.5">
                {metrics.hedging.breakdown.map(({ phrase, count }) => (
                  <span
                    key={phrase}
                    className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs font-medium"
                  >
                    "{phrase}" × {count}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Tips */}
          {tips.length > 0 && (
            <div className="space-y-1.5 pt-1">
              {tips.map((tip, i) => (
                <div key={i} className="flex items-start gap-2 bg-white rounded-lg p-2.5 border border-slate-100">
                  <span className="text-sm flex-shrink-0">{tip.icon}</span>
                  <p className="text-xs text-slate-700 leading-relaxed">{tip.tip}</p>
                </div>
              ))}
            </div>
          )}

          {/* WPM assessment */}
          {metrics.wpm.wpm > 0 && (
            <div className="flex items-center gap-2 text-xs text-slate-500 pt-1">
              <span>🎙️</span>
              <span>{metrics.wpm.assessment}</span>
              {metrics.durationSeconds && (
                <span className="text-slate-400">
                  ({Math.floor(metrics.durationSeconds / 60)}:{String(Math.round(metrics.durationSeconds % 60)).padStart(2, '0')} recorded)
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default DeliveryInsights;
