/**
 * ScoreTrendSparkline.jsx — Pure SVG sparkline showing score trend over time.
 *
 * Phase 4A: Zero AI, pure frontend visualization.
 * Shows practice score history with gradient fill, dot markers, and trend arrow.
 *
 * Props:
 *   practiceHistory — array of session objects with feedback?.overall scores
 *   width / height — SVG dimensions (responsive defaults)
 *   onClick — optional click handler (navigate to Command Center progress)
 */

import { useMemo } from 'react';

// Extract score from a session object (matches App.jsx pattern)
const getScore = (session) =>
  session.feedback?.overall ?? (session.feedback?.match_percentage != null ? session.feedback.match_percentage / 10 : null);

/**
 * Compute trend label by comparing last 5 avg vs previous 5 avg.
 * Returns { label, arrow, color }
 */
function computeTrend(scores) {
  if (scores.length < 3) return { label: 'Getting started', arrow: '→', colorClass: 'text-slate-500' };

  const recentCount = Math.min(5, Math.floor(scores.length / 2));
  const recent = scores.slice(-recentCount);
  const previous = scores.slice(-recentCount * 2, -recentCount);

  if (previous.length === 0) return { label: 'Building data', arrow: '→', colorClass: 'text-slate-500' };

  const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
  const prevAvg = previous.reduce((a, b) => a + b, 0) / previous.length;
  const diff = recentAvg - prevAvg;

  if (diff > 0.3) return { label: 'Improving', arrow: '↑', colorClass: 'text-emerald-600' };
  if (diff < -0.3) return { label: 'Needs focus', arrow: '↓', colorClass: 'text-amber-600' };
  return { label: 'Steady', arrow: '→', colorClass: 'text-sky-600' };
}

function ScoreTrendSparkline({
  practiceHistory = [],
  width = 280,
  height = 64,
  onClick,
}) {
  // Extract valid scores in chronological order
  const { scores, dates } = useMemo(() => {
    const validSessions = practiceHistory
      .filter(s => getScore(s) !== null)
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    return {
      scores: validSessions.map(s => getScore(s)),
      dates: validSessions.map(s => s.date),
    };
  }, [practiceHistory]);

  const trend = useMemo(() => computeTrend(scores), [scores]);

  // Not enough data — show placeholder
  if (scores.length < 2) {
    return (
      <div
        className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-slate-200 shadow-sm cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all"
        onClick={onClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick?.(); }}
        aria-label="View score trend details"
      >
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs sm:text-sm font-semibold text-slate-700">Score Trend</p>
          <span className="text-xs text-slate-400">
            {scores.length === 0 ? 'No scores yet' : '1 score — need 2+'}
          </span>
        </div>
        <div
          className="flex items-center justify-center rounded-lg bg-slate-50"
          style={{ height: `${height}px` }}
        >
          <p className="text-xs text-slate-400">Practice more to see your trend</p>
        </div>
      </div>
    );
  }

  // SVG path computation
  const padX = 16;
  const padTop = 8;
  const padBottom = 4;
  const chartW = width - padX * 2;
  const chartH = height - padTop - padBottom;

  const minScore = Math.max(0, Math.min(...scores) - 0.5);
  const maxScore = Math.min(10, Math.max(...scores) + 0.5);
  const range = maxScore - minScore || 1;

  const points = scores.map((score, i) => {
    const x = padX + (i / (scores.length - 1)) * chartW;
    const y = padTop + chartH - ((score - minScore) / range) * chartH;
    return { x, y, score };
  });

  // Polyline path
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

  // Gradient fill path (closes to bottom)
  const fillPath = `${linePath} L${points[points.length - 1].x.toFixed(1)},${height} L${points[0].x.toFixed(1)},${height} Z`;

  // Latest score + avg
  const latest = scores[scores.length - 1];
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;

  // Generate a unique ID for the gradient (avoid SVG ID collisions)
  const gradientId = `sparkGrad-${scores.length}-${Math.round(latest * 10)}`;

  return (
    <div
      className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-slate-200 shadow-sm cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all group"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick?.(); }}
      aria-label="View score trend details"
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <p className="text-xs sm:text-sm font-semibold text-slate-700">Score Trend</p>
          <span className={`text-xs font-bold ${trend.colorClass} flex items-center gap-0.5`}>
            {trend.arrow} {trend.label}
          </span>
        </div>
        <div className="flex items-center gap-3 text-[10px] sm:text-xs text-slate-500">
          <span>Latest: <strong className="text-teal-600">{latest.toFixed(1)}</strong></span>
          <span>Avg: <strong>{avg.toFixed(1)}</strong></span>
          <span>{scores.length} sessions</span>
          {onClick && <span className="text-slate-400 group-hover:text-teal-500 transition-colors">›</span>}
        </div>
      </div>

      {/* SVG Sparkline */}
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        style={{ height: `${height}px`, maxHeight: '80px' }}
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* Gradient fill under the line */}
        <path d={fillPath} fill={`url(#${gradientId})`} />

        {/* Main line */}
        <path
          d={linePath}
          fill="none"
          stroke="#14b8a6"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Dot markers */}
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={i === points.length - 1 ? 3.5 : 2}
            fill={i === points.length - 1 ? '#0d9488' : '#5eead4'}
            stroke="white"
            strokeWidth={i === points.length - 1 ? 1.5 : 0.5}
          />
        ))}

        {/* Score label on latest point */}
        {points.length > 0 && (
          <text
            x={points[points.length - 1].x}
            y={points[points.length - 1].y - 6}
            textAnchor="middle"
            fontSize="9"
            fontWeight="700"
            fill="#0d9488"
          >
            {latest.toFixed(1)}
          </text>
        )}
      </svg>
    </div>
  );
}

export default ScoreTrendSparkline;
