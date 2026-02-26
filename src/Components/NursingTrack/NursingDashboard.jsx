// NursingTrack — Dashboard / Home View
// After selecting a specialty, this is the nurse's home base.
// Shows available practice modes tailored to their specialty.

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Bot, Target, BookOpen, Award,
  ChevronRight, Stethoscope, MessageSquare, Clock,
  BarChart3, Star, Sparkles, Layers, Shield, DollarSign,
  LogOut, Settings, ChevronDown, User
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { CLINICAL_FRAMEWORKS } from './nursingQuestions';
import useNursingQuestions from './useNursingQuestions';
import NursingLoadingSkeleton from './NursingLoadingSkeleton';
import NursingIRSDisplay from './NursingIRSDisplay';
import StreakDisplay from '../Streaks/StreakDisplay';
import {
  countByMode, averageScore, averageSBARScores, averageByFramework,
  uniqueQuestionsPracticed, scoreTrend,
} from './nursingSessionStore';

// Account dropdown menu — sign out, tier badge, settings link
function AccountMenu({ userData }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);
    return () => { document.removeEventListener('mousedown', handler); document.removeEventListener('touchstart', handler); };
  }, [open]);

  const tierLabel = userData?.isBeta ? 'Beta'
    : userData?.tier === 'annual' ? 'Annual'
    : userData?.tier === 'nursing_pass' ? 'Nursing Pass'
    : userData?.tier === 'pro' ? 'Pro'
    : 'Free';
  const tierClasses = userData?.isBeta
    ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
    : (userData?.tier === 'nursing_pass' || userData?.tier === 'annual' || userData?.tier === 'pro')
      ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
      : 'bg-white/10 text-slate-400 border-white/10';

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        onTouchEnd={(e) => { e.preventDefault(); setOpen(!open); }}
        className="flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors"
      >
        <User className="w-4 h-4" />
        <span className="text-xs hidden sm:inline">{userData?.displayName || ''}</span>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${tierClasses}`}>
          {tierLabel}
        </span>
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-slate-800 border border-white/10 rounded-xl shadow-2xl shadow-black/40 py-1 z-50">
          {/* User info */}
          <div className="px-3 py-2 border-b border-white/10">
            <p className="text-white text-xs font-medium truncate">{userData?.user?.email || ''}</p>
            <p className="text-slate-500 text-[10px] mt-0.5">{tierLabel} Plan</p>
          </div>

          {/* Settings — goes to general app settings */}
          <a
            href="/app?view=settings"
            className="flex items-center gap-2 px-3 py-2 text-slate-300 hover:text-white hover:bg-white/10 text-xs transition-colors no-underline"
          >
            <Settings className="w-3.5 h-3.5" /> Account Settings
          </a>

          {/* Sign out */}
          <button
            onClick={async () => { await supabase.auth.signOut(); window.location.href = '/'; }}
            onTouchEnd={async (e) => { e.preventDefault(); await supabase.auth.signOut(); window.location.href = '/'; }}
            className="flex items-center gap-2 w-full px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 text-xs transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>
      )}
    </div>
  );
}

export default function NursingDashboard({ specialty, onStartMode, onChangeSpecialty, onBack, userData, sessionHistory = [], streakRefreshTrigger, onShowPricing }) {
  const { questions, categories, loading } = useNursingQuestions(specialty.id);

  if (loading) return <NursingLoadingSkeleton title={`${specialty.name} Track`} onBack={onBack} />;

  // ── Compute real progress from sessionHistory ──
  const modeCounts = countByMode(sessionHistory);
  const totalSessions = sessionHistory.length;
  const avgScore = averageScore(sessionHistory);
  const questionsUniqueCount = uniqueQuestionsPracticed(sessionHistory);
  const trend = scoreTrend(sessionHistory, 20);
  const frameworkAvgs = averageByFramework(sessionHistory);
  const sbarAvgs = averageSBARScores(sessionHistory);
  // Recent sessions (last 5, newest first)
  const recentSessions = [...sessionHistory].sort((a, b) => b.timestamp.localeCompare(a.timestamp)).slice(0, 5);

  // Credits display — nursing track uses separate pools
  const isUnlimited = userData?.isBeta || userData?.tier === 'nursing_pass' || userData?.tier === 'annual' || userData?.tier === 'pro' || userData?.tier === 'beta';

  // Practice modes available in the nursing track
  const practiceModes = [
    {
      id: 'mock-interview',
      name: 'Mock Interview',
      description: `AI-coached ${specialty.shortName} interview simulation using real clinical scenarios`,
      icon: Bot,
      color: 'from-sky-600 to-cyan-500',
      badge: 'Most Popular',
      detail: 'Full interview with STAR coaching and real-time feedback',
    },
    {
      id: 'practice',
      name: 'Quick Practice',
      description: `Rapid-fire ${specialty.shortName} questions with instant scoring`,
      icon: Target,
      color: 'from-blue-500 to-cyan-500',
      badge: null,
      detail: 'Practice one question at a time, build confidence',
    },
    {
      id: 'sbar-drill',
      name: 'SBAR Communication',
      description: 'Practice structured clinical communication',
      icon: MessageSquare,
      color: 'from-green-500 to-emerald-500',
      badge: 'New',
      detail: 'Situation → Background → Assessment → Recommendation',
    },
    {
      id: 'flashcards',
      name: 'Flashcards',
      description: `Review ${specialty.shortName} questions with spaced repetition`,
      icon: Layers,
      color: 'from-sky-500 to-blue-500',
      badge: 'Free',
      detail: 'Flip cards, mark confidence, focus on weak areas',
    },
    {
      id: 'ai-coach',
      name: 'AI Interview Coach',
      description: 'Free-form coaching — ask anything about interview prep',
      icon: Sparkles,
      color: 'from-violet-500 to-purple-500',
      badge: isUnlimited ? null : 'Pass',
      detail: 'Answer workshopping, strategy, SBAR/STAR guidance, confidence coaching',
    },
    {
      id: 'confidence-builder',
      name: 'Confidence Builder',
      description: `Build your ${specialty.shortName} interview confidence with evidence from your real experience`,
      icon: Shield,
      color: 'from-amber-500 to-orange-500',
      badge: null, // Profile + Evidence + Reset are free; AI Brief uses credits
      detail: 'Background profile → Evidence file → AI confidence brief → Pre-interview reset',
    },
    {
      id: 'offer-coach',
      name: 'Offer Negotiation',
      description: 'Practice negotiating salary, sign-on bonuses, and benefits with AI coaching',
      icon: DollarSign,
      color: 'from-emerald-500 to-green-500',
      badge: isUnlimited ? null : 'Pass',
      detail: 'Scenario-based practice → AI evaluates communication, not dollar amounts',
    },
  ];

  const nursingCredits = {
    practice: userData?.usage?.nursingPractice,
    mock: userData?.usage?.nursingMock,
    sbar: userData?.usage?.nursingSbar,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900">
      {/* Top Nav */}
      <div className="bg-slate-900/80 backdrop-blur-lg border-b border-white/10 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          {/* Track Switcher — mirrors the toggle on the main app home screen */}
          <div className="flex items-center gap-1 bg-white/10 rounded-full p-0.5 border border-white/20">
            <a href="/app" className="px-3 py-1.5 rounded-full text-xs font-semibold text-white/70 hover:text-white hover:bg-white/10 transition-all no-underline">
              General
            </a>
            <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white text-slate-900 shadow-md">
              🩺 Nursing
            </span>
          </div>

          {/* Current specialty indicator */}
          <div className="flex items-center gap-2">
            <span className="text-xl">{specialty.icon}</span>
            <span className="text-white font-medium text-sm hidden sm:inline">{specialty.name}</span>
            <button
              onClick={onChangeSpecialty}
              className="text-xs text-sky-400 hover:text-sky-300 ml-1"
            >
              Change
            </button>
          </div>

          <AccountMenu userData={userData} />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        {/* Welcome Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`bg-gradient-to-r ${specialty.color} rounded-2xl p-6 sm:p-8 mb-8 relative overflow-hidden`}
        >
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Stethoscope className="w-5 h-5 text-white/80" />
              <span className="text-white/80 text-sm font-medium">Nursing Interview Prep</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              {specialty.name} Track
            </h1>
            <p className="text-white/80 text-sm sm:text-base max-w-xl">
              Practice with questions designed for {specialty.shortName} interviews.
              AI coaches your delivery — you bring your real clinical experiences.
            </p>
          </div>
          {/* Large emoji decoration */}
          <div className="absolute -right-4 -bottom-4 text-8xl opacity-20">
            {specialty.icon}
          </div>
        </motion.div>

        {/* IRS Hero Card — Interview Readiness Score (Phase 3 Unit 3) */}
        <NursingIRSDisplay
          userId={userData?.user?.id}
          specialtyId={specialty?.id}
          refreshTrigger={streakRefreshTrigger}
        />

        {/* Gradient Stats Cards — matches main app visual style */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-8">
          <div
            className="bg-gradient-to-br from-sky-500 to-cyan-600 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-white cursor-pointer hover:scale-[1.02] hover:shadow-lg transition-all"
            onClick={() => onStartMode('command-center')}
          >
            <p className="text-xs sm:text-sm text-white/90 font-medium mb-0.5">Total Sessions</p>
            <p className="text-2xl sm:text-3xl font-black">{totalSessions}</p>
            <p className="text-[10px] sm:text-xs text-white/75 mt-0.5">
              {totalSessions === 0 ? 'Start practicing!' : 'Keep it up!'}
            </p>
          </div>
          <div
            className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-white cursor-pointer hover:scale-[1.02] hover:shadow-lg transition-all"
            onClick={() => onStartMode('command-center')}
          >
            <p className="text-xs sm:text-sm text-white/90 font-medium mb-0.5">Avg Score</p>
            <p className="text-2xl sm:text-3xl font-black">{avgScore ? avgScore.toFixed(1) : '--'}</p>
            <p className="text-[10px] sm:text-xs text-white/75 mt-0.5">
              {avgScore ? (avgScore >= 4 ? 'Excellent' : avgScore >= 3 ? 'Improving' : 'Building') : 'of 5.0'}
            </p>
          </div>
          <div
            className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-white cursor-pointer hover:scale-[1.02] hover:shadow-lg transition-all"
            onClick={() => onStartMode('command-center')}
          >
            <p className="text-xs sm:text-sm text-white/90 font-medium mb-0.5">Practiced</p>
            <p className="text-2xl sm:text-3xl font-black">{questionsUniqueCount}</p>
            <p className="text-[10px] sm:text-xs text-white/75 mt-0.5">of {questions.length} questions</p>
          </div>
          {/* Streak — real data from user_streaks table (Phase 3 Unit 3) */}
          <StreakDisplay refreshTrigger={streakRefreshTrigger} />
        </div>

        {/* Usage Tracker — free users see remaining credits, Pro users see ∞ */}
        {!isUnlimited && (
          <div className="mb-8">
            <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-sky-400" />
              Credits This Month
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Mock Interview', credit: nursingCredits.mock, icon: '🤖', color: 'sky' },
                { label: 'Quick Practice', credit: nursingCredits.practice, icon: '🎯', color: 'blue' },
                { label: 'SBAR Drill', credit: nursingCredits.sbar, icon: '📋', color: 'green' },
              ].map(item => {
                const used = item.credit?.used || 0;
                const limit = item.credit?.limit || 0;
                const remaining = Math.max(0, limit - used);
                const pct = limit > 0 ? Math.min((used / limit) * 100, 100) : 0;
                const isExhausted = remaining === 0 && limit > 0;
                const barColor = isExhausted ? 'bg-red-500' : item.color === 'sky' ? 'bg-sky-500' : item.color === 'blue' ? 'bg-blue-500' : 'bg-green-500';

                return (
                  <div key={item.label} className={`bg-white/5 border rounded-xl p-3 text-center ${
                    isExhausted ? 'border-red-500/30' : 'border-white/10'
                  }`}>
                    <div className="text-lg mb-1">{item.icon}</div>
                    <p className="text-white font-bold text-xl">
                      {remaining}<span className="text-slate-500 text-sm">/{limit}</span>
                    </p>
                    <p className="text-slate-400 text-[10px] mb-2">{item.label}</p>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${barColor} rounded-full transition-all duration-500`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    {isExhausted && (
                      <p className="text-red-400 text-[9px] mt-1.5 font-medium">Resets next month</p>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-between mt-3">
              <p className="text-slate-600 text-[10px]">AI Coach, Confidence Builder, Offer Negotiation require a pass</p>
              <button
                onClick={onShowPricing}
                className="text-[10px] text-sky-400 hover:text-sky-300 font-medium transition-colors"
              >
                Get Nursing Pass →
              </button>
            </div>
          </div>
        )}

        {/* Pro badge for unlimited users */}
        {isUnlimited && (
          <div className="mb-8 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/20 rounded-xl p-4 flex items-center gap-3">
            <span className="text-2xl">{userData?.tier === 'beta' ? '🎖️' : '👑'}</span>
            <div>
              <p className="text-white font-semibold text-sm">
                {userData?.tier === 'beta' ? 'Beta Tester'
                  : userData?.tier === 'annual' ? 'Annual All-Access'
                  : userData?.tier === 'nursing_pass' ? 'Nursing Pass'
                  : 'Pro Member'} — Unlimited Access
              </p>
              <p className="text-amber-300/70 text-xs">
                {userData?.nursingPassExpires
                  ? `Expires ${new Date(userData.nursingPassExpires).toLocaleDateString()}`
                  : 'All modes and features are unlocked.'}
              </p>
            </div>
          </div>
        )}

        {/* Practice Modes */}
        <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-sky-400" />
          Practice Modes
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {practiceModes.map((mode, index) => {
            const Icon = mode.icon;
            return (
              <motion.button
                key={mode.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                onClick={() => onStartMode(mode.id)}
                className="relative text-left bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 hover:border-white/20 transition-all group"
              >
                {/* Badge */}
                {mode.badge && (
                  <span className={`absolute top-3 right-3 text-xs font-semibold px-2 py-0.5 rounded-full ${
                    mode.badge === 'Pass'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : mode.badge === 'New'
                        ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                        : mode.badge === 'Free'
                          ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                          : mode.badge === 'Most Popular'
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            : 'bg-slate-500/20 text-slate-300 border border-slate-500/30'
                  }`}>
                    {mode.badge === 'Pass' ? '🔒 Pass' : mode.badge}
                  </span>
                )}

                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${mode.color} flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold text-base mb-1">{mode.name}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed mb-2">{mode.description}</p>
                    <p className="text-slate-500 text-xs">{mode.detail}</p>
                  </div>

                  <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-slate-400 group-hover:translate-x-1 transition-all mt-1 flex-shrink-0" />
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Progress Summary — only shows when there's data */}
        {totalSessions > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
            {/* Score Trend Mini Chart */}
            {trend.length > 1 && (
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <p className="text-white font-semibold text-sm mb-2">Score Trend</p>
                <div className="flex items-end gap-0.5 h-10">
                  {trend.map((point, i) => {
                    const height = (point.score / 5) * 100;
                    return (
                      <div
                        key={i}
                        className={`flex-1 max-w-[12px] rounded-t-sm ${
                          point.score >= 4 ? 'bg-green-500' : point.score >= 3 ? 'bg-yellow-500' : 'bg-sky-500'
                        }`}
                        style={{ height: `${height}%` }}
                        title={`${point.score}/5`}
                      />
                    );
                  })}
                </div>
                <p className="text-slate-500 text-xs mt-1">Last {trend.length} scores</p>
              </div>
            )}

            {/* Framework Confidence */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <p className="text-white font-semibold text-sm mb-2">Framework Confidence</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-xs">SBAR (Clinical)</span>
                  <span className={`font-bold text-sm ${frameworkAvgs.sbar ? (frameworkAvgs.sbar >= 4 ? 'text-green-400' : frameworkAvgs.sbar >= 3 ? 'text-yellow-400' : 'text-sky-400') : 'text-slate-500'}`}>
                    {frameworkAvgs.sbar ? frameworkAvgs.sbar.toFixed(1) : '--'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-xs">STAR (Behavioral)</span>
                  <span className={`font-bold text-sm ${frameworkAvgs.star ? (frameworkAvgs.star >= 4 ? 'text-green-400' : frameworkAvgs.star >= 3 ? 'text-yellow-400' : 'text-sky-400') : 'text-slate-500'}`}>
                    {frameworkAvgs.star ? frameworkAvgs.star.toFixed(1) : '--'}
                  </span>
                </div>
              </div>
              {sbarAvgs && (
                <div className="mt-2 pt-2 border-t border-white/10 grid grid-cols-4 gap-1">
                  {['S', 'B', 'A', 'R'].map((letter, i) => {
                    const key = ['situation', 'background', 'assessment', 'recommendation'][i];
                    const val = sbarAvgs[key];
                    return (
                      <div key={letter} className="text-center">
                        <p className="text-slate-500 text-[10px]">{letter}</p>
                        <p className={`font-bold text-xs ${val && val >= 7 ? 'text-green-400' : val && val >= 5 ? 'text-yellow-400' : 'text-slate-400'}`}>
                          {val ? val.toFixed(0) : '--'}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Recent Activity — last 5 sessions */}
        {recentSessions.length > 0 && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-8">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-semibold text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-sky-400" />
                Recent Activity
              </h3>
              <button
                onClick={() => onStartMode('command-center')}
                className="text-xs text-sky-400 hover:text-sky-300 transition-colors"
              >
                View All →
              </button>
            </div>
            <div className="space-y-2">
              {recentSessions.map((session, idx) => {
                const modeLabels = {
                  'mock-interview': { label: 'Mock', color: 'bg-sky-500/20 text-sky-300' },
                  'practice': { label: 'Practice', color: 'bg-blue-500/20 text-blue-300' },
                  'sbar-drill': { label: 'SBAR', color: 'bg-green-500/20 text-green-300' },
                  'ai-coach': { label: 'Coach', color: 'bg-violet-500/20 text-violet-300' },
                  'offer-coach': { label: 'Offer', color: 'bg-emerald-500/20 text-emerald-300' },
                };
                const mode = modeLabels[session.mode] || { label: session.mode, color: 'bg-white/10 text-slate-300' };
                const scoreDisplay = session.score !== null ? `${session.score}/5` :
                  session.sbarScores ? `S${session.sbarScores.situation || '-'} B${session.sbarScores.background || '-'} A${session.sbarScores.assessment || '-'} R${session.sbarScores.recommendation || '-'}` :
                  null;
                return (
                  <div key={session.id || idx} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${mode.color}`}>
                      {mode.label}
                    </span>
                    <p className="text-slate-300 text-xs flex-1 truncate">{session.question}</p>
                    {scoreDisplay && (
                      <span className={`text-xs font-bold flex-shrink-0 ${
                        session.score >= 4 ? 'text-green-400' : session.score >= 3 ? 'text-yellow-400' : 'text-slate-400'
                      }`}>
                        {scoreDisplay}
                      </span>
                    )}
                    <span className="text-slate-600 text-[10px] flex-shrink-0">
                      {new Date(session.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Command Center — moved up for visibility */}
        <button
          onClick={() => onStartMode('command-center')}
          className="w-full bg-gradient-to-r from-sky-600/20 to-cyan-500/20 border border-sky-500/30 rounded-xl p-4 mb-4 flex items-center justify-between hover:from-sky-600/30 hover:to-cyan-500/30 transition-all group text-left"
        >
          <div className="flex items-center gap-3">
            <BarChart3 className="w-5 h-5 text-sky-400" />
            <div>
              <p className="text-white font-medium text-sm">Command Center</p>
              <p className="text-slate-400 text-xs">Track progress, browse questions, and assess your readiness</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-sky-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
        </button>

        {/* Resources Link — moved up for visibility */}
        <button
          onClick={() => onStartMode('resources')}
          className="w-full bg-white/5 border border-white/10 rounded-xl p-4 mb-8 flex items-center justify-between hover:bg-white/10 hover:border-white/20 transition-all group text-left"
        >
          <div className="flex items-center gap-3">
            <BookOpen className="w-5 h-5 text-sky-400" />
            <div>
              <p className="text-white font-medium text-sm">Clinical Resources & References</p>
              <p className="text-slate-400 text-xs">Free public sources for clinical knowledge — NCSBN, CDC, IHI, and more</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-slate-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
        </button>

        {/* Clinical Frameworks Reference */}
        <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-sky-400" />
          Clinical Frameworks Used
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
          {Object.entries(CLINICAL_FRAMEWORKS).map(([key, framework]) => (
            <div key={key} className="bg-white/5 border border-white/10 rounded-xl p-4">
              <h4 className="text-white font-medium text-sm mb-1">{framework.name}</h4>
              <p className="text-slate-400 text-xs leading-relaxed mb-2">{framework.description}</p>
              <p className="text-slate-500 text-xs italic">Source: {framework.source}</p>
            </div>
          ))}
        </div>

        {/* Question Categories */}
        <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-sky-400" />
          Question Categories
        </h2>

        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map(cat => (
            <span key={cat} className="bg-white/10 border border-white/10 text-white/80 text-sm px-3 py-1.5 rounded-full">
              {cat}
            </span>
          ))}
        </div>

        {/* Walled Garden Notice */}
        <div className="bg-sky-500/10 border border-sky-400/20 rounded-xl p-4 mb-8">
          <div className="flex items-start gap-3">
            <div className="text-sky-400 mt-0.5">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sky-200 text-sm font-medium mb-1">About Our Content</p>
              <p className="text-sky-300/70 text-xs leading-relaxed">
                All interview questions and clinical scenarios are written or reviewed by qualified nursing professionals.
                Our AI coaches your communication and delivery — it does not generate clinical content or serve as a clinical reference.
                For clinical questions, please refer to your facility protocols or resources like UpToDate.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
