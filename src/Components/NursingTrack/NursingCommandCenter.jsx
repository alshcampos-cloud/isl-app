// NursingTrack — Command Center (Analytics Dashboard)
// The power-user view. Shows session progress, question bank, and readiness assessment.
//
// 3 tabs: Progress | Question Bank | Readiness
//
// Data: receives sessionHistory array from NursingTrackApp (in-memory for now, Supabase Phase 6).
// Questions: reads from nursingQuestions.js directly.
//
// ⚠️ D.R.A.F.T. Protocol: NEW file. No existing code modified.

import { useState, useMemo, useEffect, useCallback, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, BarChart3, BookOpen, Shield, Target, Bot,
  MessageSquare, Zap, CheckCircle, AlertCircle, TrendingUp,
  TrendingDown, Minus, Clock, Award, Layers, ChevronRight,
  ChevronDown, ChevronUp, Save, Edit3, Lock, Sparkles, Stethoscope
} from 'lucide-react';

const NursingAnswerAssistant = lazy(() => import('./NursingAnswerAssistant'));
import { getCategories, getFrameworkDetails, CLINICAL_FRAMEWORKS } from './nursingQuestions';
import useNursingQuestions from './useNursingQuestions';
import NursingLoadingSkeleton from './NursingLoadingSkeleton';
import {
  countByMode, averageScore, averageSBARScores, weakestSBARComponent,
  averageByFramework, perQuestionStats, scoreTrend, uniqueQuestionsPracticed,
} from './nursingSessionStore';
import { scoreColor5, scoreColor10 } from './nursingUtils';
import { fetchSavedAnswers, upsertSavedAnswer } from './nursingSupabase';

const TABS = [
  { id: 'progress', label: 'Progress', icon: BarChart3 },
  { id: 'bank', label: 'Question Bank', icon: BookOpen },
  { id: 'readiness', label: 'Readiness', icon: Shield },
];

export default function NursingCommandCenter({ specialty, onBack, onStartMode, sessionHistory = [], userData, onShowPricing }) {
  const [activeTab, setActiveTab] = useState('progress');

  const { questions, categories, loading } = useNursingQuestions(specialty.id);

  if (loading) return <NursingLoadingSkeleton title="Command Center" onBack={onBack} />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 flex flex-col">
      {/* Header */}
      <div className="bg-slate-900/80 backdrop-blur-lg border-b border-white/10 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Dashboard</span>
          </button>

          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-sky-400" />
            <span className="text-white font-medium text-sm">Command Center</span>
          </div>

          <div className="w-16" />
        </div>

        {/* Tab bar */}
        <div className="max-w-5xl mx-auto px-4 pb-2">
          <div className="flex gap-1 bg-white/5 rounded-xl p-1">
            {TABS.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-sky-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'progress' && (
            <motion.div key="progress" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <ProgressTab
                sessionHistory={sessionHistory}
                questions={questions}
                specialty={specialty}
              />
            </motion.div>
          )}
          {activeTab === 'bank' && (
            <motion.div key="bank" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <QuestionBankTab
                questions={questions}
                categories={categories}
                sessionHistory={sessionHistory}
                specialty={specialty}
                onStartMode={onStartMode}
                userData={userData}
                onShowPricing={onShowPricing}
              />
            </motion.div>
          )}
          {activeTab === 'readiness' && (
            <motion.div key="readiness" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <ReadinessTab
                sessionHistory={sessionHistory}
                questions={questions}
                specialty={specialty}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ============================================================
// TAB 1: PROGRESS DASHBOARD
// ============================================================
function ProgressTab({ sessionHistory, questions, specialty }) {
  const modeCounts = useMemo(() => countByMode(sessionHistory), [sessionHistory]);
  const avgScore = useMemo(() => averageScore(sessionHistory), [sessionHistory]);
  const trend = useMemo(() => scoreTrend(sessionHistory), [sessionHistory]);
  const uniqueQs = useMemo(() => uniqueQuestionsPracticed(sessionHistory), [sessionHistory]);
  const sbarAvg = useMemo(() => averageSBARScores(sessionHistory), [sessionHistory]);
  const weakSBAR = useMemo(() => weakestSBARComponent(sbarAvg), [sbarAvg]);
  const frameworkAvg = useMemo(() => averageByFramework(sessionHistory), [sessionHistory]);

  const totalSessions = sessionHistory.length;

  // Empty state
  if (totalSessions === 0) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 text-center">
        <BarChart3 className="w-16 h-16 text-slate-700 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Your Progress Starts Here</h2>
        <p className="text-slate-400 text-sm mb-1 max-w-md mx-auto">
          Complete your first mock interview, practice session, or SBAR drill and your scores, trends, and readiness assessment will appear here.
        </p>
        <p className="text-slate-500 text-xs mt-3">
          Every session counts — even your first one builds momentum.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Session count cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <StatCard icon={BarChart3} label="Total Sessions" value={totalSessions} color="text-sky-400" />
        <StatCard icon={Bot} label="Mock Interviews" value={modeCounts['mock-interview']} color="text-cyan-400" />
        <StatCard icon={Target} label="Quick Practice" value={modeCounts['practice']} color="text-blue-400" />
        <StatCard icon={Zap} label="SBAR Drills" value={modeCounts['sbar-drill']} color="text-green-400" />
      </div>

      {/* Score overview row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
          <p className="text-slate-400 text-xs mb-1">Average Score</p>
          <p className={`text-2xl font-bold ${avgScore !== null ? scoreColor5(avgScore) : 'text-slate-500'}`}>
            {avgScore !== null ? avgScore.toFixed(1) : '--'}
          </p>
          <p className="text-slate-500 text-xs">/ 5</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
          <p className="text-slate-400 text-xs mb-1">Questions Covered</p>
          <p className="text-2xl font-bold text-white">{uniqueQs}</p>
          <p className="text-slate-500 text-xs">of {questions.length}</p>
        </div>
        {trend.length >= 2 && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center col-span-2 sm:col-span-1">
            <p className="text-slate-400 text-xs mb-1">Score Trend</p>
            <div className="flex items-center justify-center gap-1">
              {trend[trend.length - 1].score > trend[0].score ? (
                <TrendingUp className="w-5 h-5 text-green-400" />
              ) : trend[trend.length - 1].score < trend[0].score ? (
                <TrendingDown className="w-5 h-5 text-red-400" />
              ) : (
                <Minus className="w-5 h-5 text-yellow-400" />
              )}
              <p className="text-white font-bold text-lg">
                {trend[0].score.toFixed(1)} → {trend[trend.length - 1].score.toFixed(1)}
              </p>
            </div>
            <p className="text-slate-500 text-xs">first → latest</p>
          </div>
        )}
      </div>

      {/* Score Trend Chart — SVG line + dot chart (matches general Command Center style) */}
      {trend.length >= 2 && (() => {
        const pointSpacing = 60;
        const leftPad = 50;
        const rightPad = 30;
        const chartW = Math.max(400, leftPad + (trend.length * pointSpacing) + rightPad);
        const chartH = 200;
        const plotTop = 20;
        const plotBottom = 160;
        const plotRange = plotBottom - plotTop; // 140px for 0-5 score range

        return (
          <div className="mb-8">
            <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-sky-400" /> Score Over Time
            </h3>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 overflow-x-auto">
              <div style={{ minWidth: `${chartW}px`, height: `${chartH}px` }}>
                <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-full" preserveAspectRatio="xMinYMid meet">
                  <defs>
                    <linearGradient id="nursingLineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#38bdf8" />
                      <stop offset="50%" stopColor="#0ea5e9" />
                      <stop offset="100%" stopColor="#6366f1" />
                    </linearGradient>
                  </defs>

                  {/* Y-axis gridlines (0-5 scale) */}
                  {[0, 1, 2, 3, 4, 5].map(score => {
                    const y = plotBottom - (score / 5) * plotRange;
                    return (
                      <g key={score}>
                        <line x1={leftPad - 5} y1={y} x2={chartW - rightPad} y2={y}
                          stroke="rgba(255,255,255,0.08)" strokeWidth="1" strokeDasharray={score === 0 ? '0' : '4,4'} />
                        <text x={leftPad - 12} y={y + 4} fontSize="11" fill="#94a3b8" textAnchor="end" fontWeight="500">{score}</text>
                      </g>
                    );
                  })}

                  {/* Polyline connecting dots */}
                  <polyline
                    points={trend.map((pt, i) => {
                      const x = leftPad + (i * pointSpacing);
                      const y = plotBottom - (pt.score / 5) * plotRange;
                      return `${x},${y}`;
                    }).join(' ')}
                    fill="none"
                    stroke="url(#nursingLineGradient)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Clickable dots + date labels */}
                  {trend.map((pt, i) => {
                    const x = leftPad + (i * pointSpacing);
                    const y = plotBottom - (pt.score / 5) * plotRange;
                    const dateStr = new Date(pt.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    return (
                      <g key={i} style={{ cursor: 'pointer' }}>
                        <circle cx={x} cy={y} r="16" fill="transparent" />
                        <circle cx={x} cy={y} r="7" fill="#0ea5e9" stroke="white" strokeWidth="2.5"
                          className="hover:opacity-80 transition-opacity" />
                        <text x={x} y={plotBottom + 20} fontSize="9" fill="#64748b" textAnchor="middle"
                          transform={`rotate(-35, ${x}, ${plotBottom + 20})`}>{dateStr}</text>
                        {/* Score label above dot */}
                        <text x={x} y={y - 12} fontSize="10" fill="#e2e8f0" textAnchor="middle" fontWeight="600">
                          {pt.score.toFixed(1)}
                        </text>
                      </g>
                    );
                  })}

                  {/* Axis labels */}
                  <text x={leftPad - 12} y={12} fontSize="10" fill="#64748b" textAnchor="end" fontWeight="600">Score</text>
                </svg>
              </div>
              {trend.length > 8 && (
                <p className="text-[10px] text-slate-500 text-center mt-1">Scroll horizontally to see all {trend.length} sessions →</p>
              )}
            </div>

            {/* Summary stats below chart */}
            <div className="grid grid-cols-4 gap-2 mt-3">
              <div className="bg-white/5 rounded-lg p-2 text-center">
                <p className="text-slate-400 text-[10px]">First</p>
                <p className="text-white text-sm font-bold">{trend[0].score.toFixed(1)}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-2 text-center">
                <p className="text-slate-400 text-[10px]">Latest</p>
                <p className="text-white text-sm font-bold">{trend[trend.length - 1].score.toFixed(1)}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-2 text-center">
                <p className="text-slate-400 text-[10px]">Best</p>
                <p className="text-green-400 text-sm font-bold">{Math.max(...trend.map(t => t.score)).toFixed(1)}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-2 text-center">
                <p className="text-slate-400 text-[10px]">Change</p>
                <p className={`text-sm font-bold ${
                  trend[trend.length - 1].score > trend[0].score ? 'text-green-400' :
                  trend[trend.length - 1].score < trend[0].score ? 'text-red-400' : 'text-yellow-400'
                }`}>
                  {trend[trend.length - 1].score > trend[0].score ? '+' : ''}
                  {(trend[trend.length - 1].score - trend[0].score).toFixed(1)}
                </p>
              </div>
            </div>
          </div>
        );
      })()}

      {/* SBAR Component Breakdown */}
      {sbarAvg && (
        <div className="mb-8">
          <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-green-400" /> SBAR Component Breakdown
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { key: 'situation', label: 'Situation', short: 'S' },
              { key: 'background', label: 'Background', short: 'B' },
              { key: 'assessment', label: 'Assessment', short: 'A' },
              { key: 'recommendation', label: 'Recommendation', short: 'R' },
            ].map(comp => {
              const val = sbarAvg[comp.key];
              const isWeakest = comp.key === weakSBAR;
              return (
                <div key={comp.key} className={`bg-white/5 border rounded-xl p-4 text-center ${
                  isWeakest ? 'border-amber-500/30' : 'border-white/10'
                }`}>
                  <div className="text-green-400 text-xs font-bold mb-1">{comp.label}</div>
                  <div className={`text-2xl font-bold ${val !== null ? scoreColor10(val) : 'text-slate-500'}`}>
                    {val !== null ? val.toFixed(1) : '--'}
                  </div>
                  <div className="text-slate-500 text-xs">/ 10</div>
                  {/* Score bar */}
                  <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        val === null ? 'bg-slate-600' : val >= 8 ? 'bg-green-500' : val >= 6 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: val !== null ? `${val * 10}%` : '0%' }}
                    />
                  </div>
                  {isWeakest && (
                    <p className="text-amber-300 text-[10px] mt-1 font-medium">Focus area</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Framework Confidence */}
      <div className="mb-8">
        <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
          <Award className="w-4 h-4 text-sky-400" /> Framework Confidence
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-300 border border-green-500/30">SBAR</span>
              <span className="text-slate-500 text-xs">Clinical Scenarios</span>
            </div>
            <div className={`text-xl font-bold ${frameworkAvg.sbar !== null ? scoreColor5(frameworkAvg.sbar) : 'text-slate-500'}`}>
              {frameworkAvg.sbar !== null ? frameworkAvg.sbar.toFixed(1) : '--'}
              <span className="text-slate-500 text-xs font-normal"> / 5</span>
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">STAR</span>
              <span className="text-slate-500 text-xs">Behavioral</span>
            </div>
            <div className={`text-xl font-bold ${frameworkAvg.star !== null ? scoreColor5(frameworkAvg.star) : 'text-slate-500'}`}>
              {frameworkAvg.star !== null ? frameworkAvg.star.toFixed(1) : '--'}
              <span className="text-slate-500 text-xs font-normal"> / 5</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Sessions (last 10) */}
      {sessionHistory.length > 0 && (
        <div className="mb-8">
          <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-sky-400" /> Recent Sessions
          </h3>
          <div className="space-y-2">
            {sessionHistory.slice().reverse().slice(0, 10).map(session => (
              <div key={session.id} className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  session.mode === 'mock-interview' ? 'bg-sky-500/20' :
                  session.mode === 'sbar-drill' ? 'bg-green-500/20' : 'bg-blue-500/20'
                }`}>
                  {session.mode === 'mock-interview' ? <Bot className="w-4 h-4 text-sky-400" /> :
                   session.mode === 'sbar-drill' ? <Zap className="w-4 h-4 text-green-400" /> :
                   <Target className="w-4 h-4 text-blue-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs truncate">{session.question}</p>
                  <p className="text-slate-500 text-[10px]">
                    {session.mode === 'mock-interview' ? 'Mock Interview' :
                     session.mode === 'sbar-drill' ? 'SBAR Drill' : 'Quick Practice'}
                    {' • '}
                    {new Date(session.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  {session.score !== null ? (
                    <span className={`text-sm font-bold ${scoreColor5(session.score)}`}>{session.score}/5</span>
                  ) : session.sbarScores ? (
                    <div className="flex gap-0.5">
                      {['situation', 'background', 'assessment', 'recommendation'].map(comp => (
                        <span key={comp} className={`text-[10px] font-medium px-1 rounded ${
                          session.sbarScores[comp] !== null ? scoreColor10(session.sbarScores[comp]) : 'text-slate-500'
                        }`}>
                          {session.sbarScores[comp] ?? '-'}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-slate-500 text-xs">--</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Per-Question Progress — sparkline charts + attempt history */}
      {sessionHistory.length > 0 && (() => {
        // Group sessions by questionId, compute per-question stats
        const qStats = {};
        sessionHistory.forEach(s => {
          if (!qStats[s.questionId]) {
            qStats[s.questionId] = {
              questionId: s.questionId,
              question: s.question,
              category: s.category,
              sessions: [],
            };
          }
          qStats[s.questionId].sessions.push(s);
        });
        // Sort each question's sessions chronologically
        Object.values(qStats).forEach(q => {
          q.sessions.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
        });
        // Sort questions by most recently practiced
        const sortedQs = Object.values(qStats).sort((a, b) => {
          const aLast = a.sessions[a.sessions.length - 1].timestamp;
          const bLast = b.sessions[b.sessions.length - 1].timestamp;
          return bLast.localeCompare(aLast);
        });

        return (
          <div className="mb-8">
            <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-sky-400" /> Progress by Question
            </h3>
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {sortedQs.map(qStat => {
                const scoredSessions = qStat.sessions.filter(s => s.score !== null);
                const avg = scoredSessions.length > 0
                  ? scoredSessions.reduce((sum, s) => sum + s.score, 0) / scoredSessions.length
                  : null;
                const best = scoredSessions.length > 0
                  ? Math.max(...scoredSessions.map(s => s.score))
                  : null;
                const trendUp = scoredSessions.length >= 2
                  ? scoredSessions[scoredSessions.length - 1].score > scoredSessions[0].score
                  : null;
                const trendDown = scoredSessions.length >= 2
                  ? scoredSessions[scoredSessions.length - 1].score < scoredSessions[0].score
                  : null;

                return (
                  <div key={qStat.questionId} className="bg-white/5 border border-white/10 rounded-xl p-4">
                    {/* Question header */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-xs font-medium leading-snug line-clamp-2">{qStat.question}</p>
                        <p className="text-slate-500 text-[10px] mt-0.5">{qStat.category} · {scoredSessions.length} attempt{scoredSessions.length !== 1 ? 's' : ''}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {trendUp === true && <TrendingUp className="w-3.5 h-3.5 text-green-400" />}
                        {trendDown === true && <TrendingDown className="w-3.5 h-3.5 text-red-400" />}
                        {trendUp === false && trendDown === false && scoredSessions.length >= 2 && <Minus className="w-3.5 h-3.5 text-yellow-400" />}
                        {avg !== null && (
                          <span className={`text-sm font-bold ${scoreColor5(avg)}`}>
                            {avg.toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Sparkline chart */}
                    {scoredSessions.length >= 2 && (
                      <div className="w-full overflow-x-auto">
                        <div className="min-w-[200px] max-w-full">
                          <svg width="100%" height="60" viewBox="0 0 260 60" preserveAspectRatio="xMidYMid meet">
                            {/* Grid lines (0, 2.5, 5) */}
                            {[0, 2.5, 5].map(score => (
                              <line key={score} x1="15" y1={50 - (score / 5) * 40} x2="250" y2={50 - (score / 5) * 40}
                                stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="2,2" />
                            ))}
                            {/* Polyline */}
                            <polyline
                              points={scoredSessions.map((s, i) => {
                                const x = 20 + (i / Math.max(1, scoredSessions.length - 1)) * 225;
                                const y = 50 - (s.score / 5) * 40;
                                return `${x},${y}`;
                              }).join(' ')}
                              fill="none" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                            />
                            {/* Dots */}
                            {scoredSessions.map((s, i) => {
                              const x = 20 + (i / Math.max(1, scoredSessions.length - 1)) * 225;
                              const y = 50 - (s.score / 5) * 40;
                              return (
                                <g key={i}>
                                  <circle cx={x} cy={y} r="5" fill="#0ea5e9" stroke="#0f172a" strokeWidth="2" />
                                  <title>Attempt {i + 1}: {s.score}/5 — {new Date(s.timestamp).toLocaleDateString()}</title>
                                </g>
                              );
                            })}
                            {/* Y-axis labels */}
                            <text x="10" y="14" fontSize="8" fill="#64748b" textAnchor="end">5</text>
                            <text x="10" y="53" fontSize="8" fill="#64748b" textAnchor="end">0</text>
                          </svg>
                        </div>
                      </div>
                    )}

                    {/* Attempt list with expandable answer + feedback */}
                    {scoredSessions.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {scoredSessions.slice().reverse().slice(0, 5).map((s, i) => {
                          const hasDetail = s.userAnswer || s.aiFeedback;
                          return (
                            <details key={s.id || i} className="group rounded bg-white/[0.03] overflow-hidden">
                              <summary className={`flex items-center justify-between text-[10px] px-2 py-1 ${hasDetail ? 'cursor-pointer hover:bg-white/[0.06]' : 'cursor-default'}`}>
                                <span className="text-slate-500 flex items-center gap-1">
                                  {s.mode === 'mock-interview' ? '🎙️' : s.mode === 'sbar-drill' ? '⚡' : '🎯'}{' '}
                                  {new Date(s.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                  {' · '}
                                  {new Date(s.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  {hasDetail && <span className="text-sky-400/60 ml-1" title="Tap to see your answer & feedback">📝</span>}
                                </span>
                                <span className={`font-bold ${scoreColor5(s.score)}`}>{s.score}/5</span>
                              </summary>
                              {hasDetail && (
                                <div className="px-2 pb-2 pt-1 space-y-1.5 border-t border-white/5">
                                  {s.userAnswer && (
                                    <div>
                                      <p className="text-[9px] text-sky-400 font-semibold uppercase tracking-wider mb-0.5">Your Answer</p>
                                      <p className="text-[10px] text-slate-400 leading-relaxed line-clamp-4">{s.userAnswer}</p>
                                    </div>
                                  )}
                                  {s.aiFeedback && (
                                    <div>
                                      <p className="text-[9px] text-emerald-400 font-semibold uppercase tracking-wider mb-0.5">AI Feedback</p>
                                      <p className="text-[10px] text-slate-400 leading-relaxed line-clamp-6">{s.aiFeedback}</p>
                                    </div>
                                  )}
                                </div>
                              )}
                            </details>
                          );
                        })}
                        {scoredSessions.length > 5 && (
                          <p className="text-slate-500 text-[10px] text-center">+ {scoredSessions.length - 5} more attempts</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}
    </div>
  );
}

// ============================================================
// TAB 2: QUESTION BANK
// ============================================================
function QuestionBankTab({ questions, categories, sessionHistory, specialty, onStartMode, userData, onShowPricing }) {
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterFramework, setFilterFramework] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all'); // all, mastered, needs-review, unattempted
  const [expandedQuestion, setExpandedQuestion] = useState(null);

  // Saved answers state: { [questionCode]: answerText }
  const [savedAnswers, setSavedAnswers] = useState({});
  const [editingAnswer, setEditingAnswer] = useState(null); // question ID being edited
  const [draftAnswer, setDraftAnswer] = useState('');
  const [savingAnswer, setSavingAnswer] = useState(false);

  // AI Answer Coach state
  const [coachingQuestion, setCoachingQuestion] = useState(null); // full question object or null

  const userId = userData?.user?.id;

  // Load saved answers on mount
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    async function load() {
      const result = await fetchSavedAnswers(userId);
      if (!cancelled) {
        if (result.fromSupabase && result.data) {
          setSavedAnswers(result.data);
        } else {
          // Fallback: load from localStorage
          try {
            const local = JSON.parse(localStorage.getItem(`nursing_saved_answers_${userId}`) || '{}');
            setSavedAnswers(local);
          } catch { /* ignore */ }
        }
      }
    }

    load();
    return () => { cancelled = true; };
  }, [userId]);

  // Save an answer (Supabase + localStorage fallback)
  const handleSaveAnswer = useCallback(async (questionCode) => {
    if (!draftAnswer.trim() || !userId) return;
    setSavingAnswer(true);

    const trimmed = draftAnswer.trim();

    // Update local state immediately
    setSavedAnswers(prev => {
      const next = { ...prev, [questionCode]: trimmed };
      // Also persist to localStorage as fallback
      try { localStorage.setItem(`nursing_saved_answers_${userId}`, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });

    // Persist to Supabase (non-blocking, best-effort)
    await upsertSavedAnswer(userId, questionCode, trimmed);

    setSavingAnswer(false);
    setEditingAnswer(null);
  }, [draftAnswer, userId]);

  const qStats = useMemo(() => perQuestionStats(sessionHistory), [sessionHistory]);

  const filteredQuestions = useMemo(() => {
    let qs = questions;
    if (filterCategory !== 'all') qs = qs.filter(q => q.category === filterCategory);
    if (filterFramework !== 'all') qs = qs.filter(q => q.responseFramework === filterFramework);
    if (filterStatus === 'mastered') qs = qs.filter(q => qStats[q.id]?.bestScore >= 4);
    else if (filterStatus === 'needs-review') qs = qs.filter(q => qStats[q.id] && (qStats[q.id].bestScore === null || qStats[q.id].bestScore < 4));
    else if (filterStatus === 'unattempted') qs = qs.filter(q => !qStats[q.id]);
    return qs;
  }, [questions, filterCategory, filterFramework, filterStatus, qStats]);

  const masteredCount = questions.filter(q => qStats[q.id]?.bestScore >= 4).length;
  const needsReviewCount = questions.filter(q => qStats[q.id] && (qStats[q.id].bestScore === null || qStats[q.id].bestScore < 4)).length;
  const unattemptedCount = questions.filter(q => !qStats[q.id]).length;

  // All questions are now unlocked for all users (free tier gives full question access)
  // isPro controls premium UI features like saved answers badge
  const FREE_PREVIEW_COUNT = 3;
  const userTier = userData?.tier || 'free';
  const isPro = true; // All users see all questions — credit limits gate AI usage, not content

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <button
          onClick={() => setFilterStatus(filterStatus === 'mastered' ? 'all' : 'mastered')}
          className={`text-center p-3 rounded-xl border transition-all ${
            filterStatus === 'mastered' ? 'bg-green-500/10 border-green-500/30' : 'bg-white/5 border-white/10'
          }`}
        >
          <CheckCircle className="w-4 h-4 text-green-400 mx-auto mb-1" />
          <p className="text-white font-bold text-lg">{masteredCount}</p>
          <p className="text-slate-400 text-[10px]">Mastered</p>
        </button>
        <button
          onClick={() => setFilterStatus(filterStatus === 'needs-review' ? 'all' : 'needs-review')}
          className={`text-center p-3 rounded-xl border transition-all ${
            filterStatus === 'needs-review' ? 'bg-amber-500/10 border-amber-500/30' : 'bg-white/5 border-white/10'
          }`}
        >
          <AlertCircle className="w-4 h-4 text-amber-400 mx-auto mb-1" />
          <p className="text-white font-bold text-lg">{needsReviewCount}</p>
          <p className="text-slate-400 text-[10px]">Needs Review</p>
        </button>
        <button
          onClick={() => setFilterStatus(filterStatus === 'unattempted' ? 'all' : 'unattempted')}
          className={`text-center p-3 rounded-xl border transition-all ${
            filterStatus === 'unattempted' ? 'bg-sky-500/10 border-sky-500/30' : 'bg-white/5 border-white/10'
          }`}
        >
          <Layers className="w-4 h-4 text-sky-400 mx-auto mb-1" />
          <p className="text-white font-bold text-lg">{unattemptedCount}</p>
          <p className="text-slate-400 text-[10px]">Unattempted</p>
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-3">
        {/* Category filter */}
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setFilterCategory('all')}
            className={`text-xs px-2 py-1 rounded-full border transition-colors ${
              filterCategory === 'all' ? 'bg-sky-500/20 text-sky-300 border-sky-500/30' : 'text-slate-400 bg-white/5 border-white/10'
            }`}
          >All Categories</button>
          {categories.map(cat => (
            <button key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`text-xs px-2 py-1 rounded-full border transition-colors ${
                filterCategory === cat ? 'bg-sky-500/20 text-sky-300 border-sky-500/30' : 'text-slate-400 bg-white/5 border-white/10'
              }`}
            >{cat}</button>
          ))}
        </div>
        {/* Framework filter */}
        <div className="flex gap-1.5">
          {[
            { value: 'all', label: 'All Frameworks' },
            { value: 'sbar', label: 'SBAR', cls: 'bg-green-500/20 text-green-300 border-green-500/30' },
            { value: 'star', label: 'STAR', cls: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
          ].map(opt => (
            <button key={opt.value}
              onClick={() => setFilterFramework(opt.value)}
              className={`text-xs px-2 py-1 rounded-full border transition-colors ${
                filterFramework === opt.value
                  ? (opt.cls || 'bg-sky-500/20 text-sky-300 border-sky-500/30')
                  : 'text-slate-400 bg-white/5 border-white/10'
              }`}
            >{opt.label}</button>
          ))}
        </div>
      </div>

      {/* Question list */}
      <p className="text-slate-500 text-xs mb-3">
        {filteredQuestions.length} question{filteredQuestions.length !== 1 ? 's' : ''}
        {!isPro && filteredQuestions.length > FREE_PREVIEW_COUNT && (
          <span className="text-slate-600 ml-1">
            · {FREE_PREVIEW_COUNT} unlocked · <Lock className="w-2.5 h-2.5 inline -mt-0.5" /> {filteredQuestions.length - FREE_PREVIEW_COUNT} Pro
          </span>
        )}
      </p>

      <div className="space-y-2 mb-8">
        {filteredQuestions.map((q, idx) => {
          const stats = qStats[q.id];
          const isMastered = stats?.bestScore >= 4;
          const isExpanded = expandedQuestion === q.id;
          const isLocked = !isPro && idx >= FREE_PREVIEW_COUNT;

          // ── Locked/blurred question card (free users, beyond preview) ──
          if (isLocked) {
            return (
              <div key={q.id} className="relative bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                <div className="p-4 flex items-start gap-3 select-none" style={{ filter: 'blur(6px)', WebkitFilter: 'blur(6px)' }}>
                  <div className="mt-0.5 flex-shrink-0">
                    <div className="w-4 h-4 rounded-full border border-slate-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/10 text-slate-400">{q.category}</span>
                    </div>
                    <p className="text-white text-sm leading-relaxed">{q.question}</p>
                  </div>
                </div>
                {/* Lock overlay */}
                <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center pointer-events-none">
                  <Lock className="w-4 h-4 text-slate-500" />
                </div>
              </div>
            );
          }

          // ── Visible question card (Pro, Beta, or within free preview) ──
          return (
            <div key={q.id} className={`bg-white/5 border rounded-xl overflow-hidden transition-colors ${
              isMastered ? 'border-green-500/20' : stats ? 'border-amber-500/20' : 'border-white/10'
            }`}>
              <button
                onClick={() => setExpandedQuestion(isExpanded ? null : q.id)}
                className="w-full text-left p-4 flex items-start gap-3"
              >
                {/* Status icon */}
                <div className="mt-0.5 flex-shrink-0">
                  {isMastered ? (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  ) : stats ? (
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-600" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  {/* Tags */}
                  <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      q.responseFramework === 'sbar'
                        ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                        : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    }`}>
                      {q.responseFramework === 'sbar' ? 'SBAR' : 'STAR'}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/10 text-slate-400">{q.category}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      q.difficulty === 'advanced' ? 'bg-red-500/10 text-red-300' :
                      q.difficulty === 'intermediate' ? 'bg-yellow-500/10 text-yellow-300' :
                      'bg-green-500/10 text-green-300'
                    }`}>{q.difficulty}</span>
                  </div>
                  <p className="text-white text-sm leading-relaxed">{q.question}</p>

                  {/* Quick stats inline */}
                  {stats && (
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-slate-500 text-[10px]">{stats.attempts} attempt{stats.attempts !== 1 ? 's' : ''}</span>
                      {stats.bestScore !== null && (
                        <span className={`text-[10px] font-medium ${scoreColor5(stats.bestScore)}`}>
                          Best: {stats.bestScore}/5
                        </span>
                      )}
                      {stats.avgScore !== null && (
                        <span className="text-slate-500 text-[10px]">Avg: {stats.avgScore.toFixed(1)}</span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex-shrink-0 mt-1">
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                </div>
              </button>

              {/* Expanded details */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 border-t border-white/5 pt-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Left column: key points, follow-ups, practice CTA */}
                        <div>
                          {/* Key points */}
                          {q.bullets?.length > 0 && (
                            <div className="mb-3">
                              <p className="text-sky-300 text-xs font-medium mb-1.5">Key points to hit:</p>
                              {q.bullets.map((b, i) => (
                                <p key={i} className="text-slate-400 text-xs mb-0.5">• {b}</p>
                              ))}
                            </div>
                          )}

                          {/* Framework citation */}
                          {q.clinicalFramework && (
                            <p className="text-slate-500 text-[10px] italic mb-3">
                              Framework: {getFrameworkDetails(q.clinicalFramework)?.name} — {getFrameworkDetails(q.clinicalFramework)?.source}
                            </p>
                          )}

                          {/* Follow-ups */}
                          {q.followUps?.length > 0 && (
                            <div className="mb-3">
                              <p className="text-slate-500 text-xs font-medium mb-1">Possible follow-ups:</p>
                              {q.followUps.map((fu, i) => (
                                <p key={i} className="text-slate-500 text-xs italic">• {fu}</p>
                              ))}
                            </div>
                          )}

                          {/* Practice CTA */}
                          <button
                            onClick={(e) => { e.stopPropagation(); onStartMode('practice', q.id); }}
                            className="text-xs bg-sky-600/20 text-sky-300 border border-sky-500/30 px-3 py-1.5 rounded-lg hover:bg-sky-600/30 transition-colors flex items-center gap-1"
                          >
                            <Target className="w-3 h-3" /> Practice This
                          </button>
                        </div>

                        {/* Right column: My Best Answer */}
                        <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sky-300 text-xs font-medium flex items-center gap-1">
                              <Save className="w-3 h-3" /> My Best Answer
                            </p>
                            {savedAnswers[q.id] && editingAnswer !== q.id && (
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setCoachingQuestion(q);
                                  }}
                                  className="text-[10px] text-sky-400 hover:text-sky-300 bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 rounded-md transition-colors flex items-center gap-1"
                                  title="Refine with AI Coach"
                                >
                                  <Stethoscope className="w-2.5 h-2.5" /> Refine
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingAnswer(q.id);
                                    setDraftAnswer(savedAnswers[q.id]);
                                  }}
                                  className="text-slate-500 hover:text-slate-300 transition-colors"
                                >
                                  <Edit3 className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </div>

                          {editingAnswer === q.id ? (
                            // Edit mode
                            <div onClick={(e) => e.stopPropagation()}>
                              <textarea
                                value={draftAnswer}
                                onChange={(e) => setDraftAnswer(e.target.value)}
                                placeholder="Write your strongest answer here... Review it before your next interview."
                                className="w-full bg-slate-800/50 border border-white/10 rounded-lg p-2 text-slate-300 text-xs leading-relaxed resize-none focus:outline-none focus:border-sky-500/40 placeholder-slate-600"
                                rows={5}
                                autoFocus
                              />
                              <div className="flex items-center justify-end gap-2 mt-2">
                                <button
                                  onClick={() => { setEditingAnswer(null); setDraftAnswer(''); }}
                                  className="text-[10px] text-slate-500 hover:text-slate-300 px-2 py-1 transition-colors"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => handleSaveAnswer(q.id)}
                                  disabled={savingAnswer || !draftAnswer.trim()}
                                  className="text-[10px] bg-sky-600/20 text-sky-300 border border-sky-500/30 px-3 py-1 rounded-lg hover:bg-sky-600/30 transition-colors disabled:opacity-50 flex items-center gap-1"
                                >
                                  <Save className="w-2.5 h-2.5" />
                                  {savingAnswer ? 'Saving...' : 'Save'}
                                </button>
                              </div>
                            </div>
                          ) : savedAnswers[q.id] ? (
                            // Display saved answer
                            <p className="text-slate-400 text-xs leading-relaxed whitespace-pre-wrap">{savedAnswers[q.id]}</p>
                          ) : (
                            // Empty state — prompt to add (manual or AI Coach)
                            <div className="py-3 space-y-2" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => setCoachingQuestion(q)}
                                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-300 text-xs font-medium hover:bg-sky-500/20 transition-all"
                              >
                                <Stethoscope className="w-3.5 h-3.5" /> Craft with AI Coach
                              </button>
                              <button
                                onClick={() => {
                                  setEditingAnswer(q.id);
                                  setDraftAnswer('');
                                }}
                                className="w-full text-center py-1.5 text-slate-600 hover:text-slate-400 text-[10px] transition-colors"
                              >
                                or write manually
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Upgrade CTA for free users with locked questions */}
      {!isPro && filteredQuestions.length > FREE_PREVIEW_COUNT && (
        <div className="relative mb-8">
          {/* Gradient fade from the blurred cards */}
          <div className="absolute -top-16 inset-x-0 h-16 bg-gradient-to-t from-slate-900 to-transparent pointer-events-none z-10" />

          <div className="relative z-20 bg-gradient-to-br from-sky-600/10 to-purple-600/10 border border-sky-500/20 rounded-2xl p-6 text-center">
            <Sparkles className="w-6 h-6 text-sky-400 mx-auto mb-3" />
            <h3 className="text-white font-semibold text-lg mb-1">
              Unlock All {filteredQuestions.length} Questions
            </h3>
            <p className="text-slate-400 text-sm mb-1">
              You're previewing {FREE_PREVIEW_COUNT} of {filteredQuestions.length} curated interview questions.
            </p>
            <p className="text-slate-500 text-xs mb-4">
              Pro members get the full question bank, key points to hit, follow-up questions, and saved answers.
            </p>
            <button
              onClick={onShowPricing}
              className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-500 text-white font-medium px-6 py-2.5 rounded-xl transition-colors text-sm"
            >
              <Sparkles className="w-4 h-4" />
              Get Nursing Pass — $19.99
            </button>
          </div>
        </div>
      )}

      {/* AI Answer Coach Modal */}
      {coachingQuestion && (
        <Suspense fallback={null}>
          <NursingAnswerAssistant
            question={coachingQuestion}
            specialty={specialty}
            userData={userData}
            existingAnswer={savedAnswers[coachingQuestion.id] || ''}
            onAnswerSaved={({ answerText }) => {
              // Update local state immediately
              setSavedAnswers(prev => {
                const next = { ...prev, [coachingQuestion.id]: answerText };
                try { localStorage.setItem(`nursing_saved_answers_${userData?.user?.id}`, JSON.stringify(next)); } catch { /* ignore */ }
                return next;
              });
              setCoachingQuestion(null);
            }}
            onClose={() => setCoachingQuestion(null)}
            onShowPricing={onShowPricing}
          />
        </Suspense>
      )}
    </div>
  );
}

// ============================================================
// TAB 3: READINESS ASSESSMENT
// ============================================================
function ReadinessTab({ sessionHistory, questions, specialty }) {
  const totalSessions = sessionHistory.length;
  const uniqueQs = useMemo(() => uniqueQuestionsPracticed(sessionHistory), [sessionHistory]);
  const avgScore = useMemo(() => averageScore(sessionHistory), [sessionHistory]);
  const frameworkAvg = useMemo(() => averageByFramework(sessionHistory), [sessionHistory]);
  const sbarAvg = useMemo(() => averageSBARScores(sessionHistory), [sessionHistory]);
  const qStats = useMemo(() => perQuestionStats(sessionHistory), [sessionHistory]);
  const masteredCount = questions.filter(q => qStats[q.id]?.bestScore >= 4).length;
  const categories = useMemo(() => getCategories(questions), [questions]);

  // Compute readiness score (0-100)
  // Weighted: 30% question coverage, 30% avg score, 20% mastered %, 20% session volume
  const readinessScore = useMemo(() => {
    if (totalSessions === 0) return 0;

    const coverageRatio = Math.min(uniqueQs / questions.length, 1);
    const scoreRatio = avgScore !== null ? (avgScore / 5) : 0;
    const masteredRatio = Math.min(masteredCount / questions.length, 1);
    const volumeRatio = Math.min(totalSessions / 30, 1); // 30 sessions = full volume credit

    return Math.round(
      (coverageRatio * 30) +
      (scoreRatio * 30) +
      (masteredRatio * 20) +
      (volumeRatio * 20)
    );
  }, [totalSessions, uniqueQs, questions.length, avgScore, masteredCount]);

  // Per-category stats
  const categoryStats = useMemo(() => {
    return categories.map(cat => {
      const catQuestions = questions.filter(q => q.category === cat);
      const catSessions = sessionHistory.filter(s => s.category === cat);
      const practiced = new Set(catSessions.map(s => s.questionId)).size;
      const scored = catSessions.filter(s => s.score !== null);
      const avg = scored.length > 0 ? scored.reduce((sum, s) => sum + s.score, 0) / scored.length : null;
      return { category: cat, total: catQuestions.length, practiced, avg };
    });
  }, [categories, questions, sessionHistory]);

  // Readiness color
  const readinessColor = readinessScore >= 70 ? 'text-green-400' : readinessScore >= 40 ? 'text-yellow-400' : 'text-sky-400';
  const readinessBg = readinessScore >= 70 ? 'from-green-500' : readinessScore >= 40 ? 'from-yellow-500' : 'from-sky-500';

  // Empty state
  if (totalSessions === 0) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 text-center">
        <Shield className="w-16 h-16 text-slate-700 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Readiness Assessment</h2>
        <p className="text-slate-400 text-sm mb-1 max-w-md mx-auto">
          After a few practice sessions, this tab will show your interview readiness score,
          framework confidence, and per-category breakdown.
        </p>
        <p className="text-slate-500 text-xs mt-3">
          Start with a Mock Interview or SBAR Drill — your data populates in real time.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Overall Readiness Score */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center mb-8"
      >
        <p className="text-slate-400 text-sm mb-2">Interview Readiness</p>
        <div className="relative w-32 h-32 mx-auto mb-4">
          {/* Circle progress */}
          <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
            <circle
              cx="60" cy="60" r="52" fill="none"
              className={readinessScore >= 70 ? 'stroke-green-500' : readinessScore >= 40 ? 'stroke-yellow-500' : 'stroke-sky-500'}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${(readinessScore / 100) * 326.73} 326.73`}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-3xl font-bold ${readinessColor}`}>{readinessScore}</span>
          </div>
        </div>
        <p className={`text-lg font-semibold ${readinessColor}`}>
          {readinessScore >= 80 ? 'Strong — Interview Ready' :
           readinessScore >= 60 ? 'Good Progress — Keep Practicing' :
           readinessScore >= 40 ? 'Building Momentum' :
           'Getting Started — Great Foundation'}
        </p>
        <p className="text-slate-500 text-xs mt-1">
          Based on question coverage, scores, mastery, and practice volume
        </p>
      </motion.div>

      {/* Framework Confidence */}
      <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
        <Award className="w-4 h-4 text-sky-400" /> Framework Confidence
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
        <FrameworkConfidenceCard
          label="SBAR"
          sublabel="Clinical Scenarios"
          avg={frameworkAvg.sbar}
          badgeClass="bg-green-500/20 text-green-300 border-green-500/30"
          specialty={specialty}
        />
        <FrameworkConfidenceCard
          label="STAR"
          sublabel="Behavioral Questions"
          avg={frameworkAvg.star}
          badgeClass="bg-purple-500/20 text-purple-300 border-purple-500/30"
          specialty={specialty}
        />
      </div>

      {/* SBAR breakdown in readiness context */}
      {sbarAvg && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-8">
          <p className="text-white text-sm font-medium mb-3">SBAR Component Readiness</p>
          <div className="space-y-3">
            {[
              { key: 'situation', label: 'Situation' },
              { key: 'background', label: 'Background' },
              { key: 'assessment', label: 'Assessment' },
              { key: 'recommendation', label: 'Recommendation' },
            ].map(comp => {
              const val = sbarAvg[comp.key];
              return (
                <div key={comp.key}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-slate-300 text-xs">{comp.label}</span>
                    <span className={`text-xs font-medium ${val !== null ? scoreColor10(val) : 'text-slate-500'}`}>
                      {val !== null ? `${val.toFixed(1)}/10` : 'No data'}
                    </span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        val === null ? 'bg-slate-700' : val >= 8 ? 'bg-green-500' : val >= 6 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: val !== null ? `${val * 10}%` : '0%' }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Per-Category Breakdown */}
      <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
        <BookOpen className="w-4 h-4 text-sky-400" /> Category Breakdown
      </h3>

      <div className="space-y-2 mb-8">
        {categoryStats.map(cs => {
          const coveragePercent = cs.total > 0 ? Math.round((cs.practiced / cs.total) * 100) : 0;
          return (
            <div key={cs.category} className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white text-sm font-medium">{cs.category}</span>
                <div className="flex items-center gap-2">
                  {cs.avg !== null && (
                    <span className={`text-xs font-medium ${scoreColor5(cs.avg)}`}>{cs.avg.toFixed(1)}/5</span>
                  )}
                  <span className="text-slate-400 text-xs">{cs.practiced}/{cs.total}</span>
                </div>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    coveragePercent >= 80 ? 'bg-green-500' : coveragePercent >= 50 ? 'bg-yellow-500' : 'bg-sky-500'
                  }`}
                  style={{ width: `${coveragePercent}%` }}
                />
              </div>
              {/* Constructive framing per Erin's constraint */}
              {cs.avg !== null && cs.avg < 3.5 && (
                <p className="text-sky-300/70 text-[10px] mt-1.5">
                  Your {cs.category.toLowerCase()} answers are developing — try a few more practice rounds to strengthen this area.
                </p>
              )}
              {cs.avg !== null && cs.avg >= 4 && (
                <p className="text-green-300/70 text-[10px] mt-1.5">
                  Strong performance in {cs.category.toLowerCase()} — keep this up!
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Constructive summary */}
      <div className="bg-sky-500/10 border border-sky-400/20 rounded-xl p-4 mb-8">
        <p className="text-sky-200 text-sm font-medium mb-2">Your Path Forward</p>
        <div className="space-y-2">
          {uniqueQs < questions.length && (
            <p className="text-sky-300/70 text-xs">
              You've practiced {uniqueQs} of {questions.length} questions. Expanding your coverage will strengthen your readiness.
            </p>
          )}
          {frameworkAvg.sbar !== null && frameworkAvg.star !== null && (
            <p className="text-sky-300/70 text-xs">
              {frameworkAvg.sbar > frameworkAvg.star
                ? `Your SBAR responses (${frameworkAvg.sbar.toFixed(1)}/5) are stronger than STAR (${frameworkAvg.star.toFixed(1)}/5) — try more behavioral practice to balance out.`
                : frameworkAvg.star > frameworkAvg.sbar
                  ? `Your STAR responses (${frameworkAvg.star.toFixed(1)}/5) are stronger than SBAR (${frameworkAvg.sbar.toFixed(1)}/5) — more SBAR drills will help you communicate clinical scenarios clearly.`
                  : `Your SBAR and STAR scores are balanced at ${frameworkAvg.sbar.toFixed(1)}/5 — great consistency!`
              }
            </p>
          )}
          {sbarAvg && Object.values(sbarAvg).some(v => v !== null && v < 6) && (
            <p className="text-sky-300/70 text-xs">
              Focus on your SBAR components that score below 6/10 — structured repetition in the SBAR Drill will build muscle memory.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// SHARED COMPONENTS
// ============================================================

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
      <Icon className={`w-5 h-5 ${color} mx-auto mb-1`} />
      <div className="text-white font-bold text-lg">{value}</div>
      <div className="text-slate-400 text-xs">{label}</div>
    </div>
  );
}

function FrameworkConfidenceCard({ label, sublabel, avg, badgeClass, specialty }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className={`text-xs px-2 py-0.5 rounded-full border ${badgeClass}`}>{label}</span>
        <span className="text-slate-500 text-xs">{sublabel}</span>
      </div>
      <div className={`text-2xl font-bold mb-1 ${avg !== null ? scoreColor5(avg) : 'text-slate-500'}`}>
        {avg !== null ? avg.toFixed(1) : '--'}
        <span className="text-slate-500 text-xs font-normal"> / 5</span>
      </div>
      {avg !== null && (
        <p className="text-slate-500 text-xs">
          {avg >= 4 ? `Strong ${label} communication` :
           avg >= 3 ? `Good foundation — room to grow` :
           `Building your ${label} skills`}
        </p>
      )}
      {avg === null && (
        <p className="text-slate-500 text-xs">No {label} sessions yet</p>
      )}
    </div>
  );
}
