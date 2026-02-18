// NursingIRSDisplay.jsx — Nursing-adapted IRS hero card
// Phase 3, Unit 3. D.R.A.F.T. protocol: NEW file.
//
// Adapted from IRSDisplay.jsx for the nursing track:
//   - Accepts userId + specialtyId as props (not self-fetching auth)
//   - Queries nursing tables via fetchNursingIRSData()
//   - Passes scale='nursing' to calculateStarAdherence() (1-5 → 0-100)
//   - Reuses ALL pure calculator functions from irsCalculator.js
//   - Same visual structure: animated ring, mini bars, detail modal, rotating tips

import { useState, useEffect, useCallback, useRef } from 'react';
import { X, TrendingUp, Target, BookOpen, Flame, PenTool } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { fetchNursingIRSData } from './nursingIRSData';
import {
  calculateConsistency,
  calculateStarAdherence,
  calculateCoverage,
  calculateAnswerPreparedness,
  isPersonalizedAnswer,
  calculateIRS,
  getIRSLevel,
  getGrowthTips,
} from '../IRS/irsCalculator';

// ── SVG Ring Constants ──────────────────────────────────────
const RING_RADIUS = 54;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

// Color map for IRS levels (matches getIRSLevel in irsCalculator.js)
const LEVEL_COLORS = {
  emerald: { ring: '#10b981', bg: 'from-emerald-400 to-teal-500', text: 'text-emerald-400', barBg: 'bg-emerald-500' },
  teal:    { ring: '#14b8a6', bg: 'from-teal-400 to-cyan-500', text: 'text-teal-400', barBg: 'bg-teal-500' },
  blue:    { ring: '#3b82f6', bg: 'from-blue-400 to-indigo-500', text: 'text-blue-400', barBg: 'bg-blue-500' },
  indigo:  { ring: '#6366f1', bg: 'from-indigo-400 to-purple-500', text: 'text-indigo-400', barBg: 'bg-indigo-500' },
  slate:   { ring: '#94a3b8', bg: 'from-slate-400 to-slate-500', text: 'text-slate-400', barBg: 'bg-slate-500' },
};

const TIP_ROTATION_MS = 8000;

export default function NursingIRSDisplay({ userId, specialtyId, refreshTrigger }) {
  const [irsData, setIrsData] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [animatedScore, setAnimatedScore] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);
  const prevScoreRef = useRef(0);
  const animationRef = useRef(null);

  const loadIRS = useCallback(async () => {
    try {
      if (!userId) return;
      const data = await fetchNursingIRSData(userId, specialtyId || 'general');
      if (!data) return;
      setIrsData(data);
    } catch (err) {
      console.warn('NursingIRSDisplay load failed:', err);
    }
  }, [userId, specialtyId]);

  // Load on mount + whenever refreshTrigger changes (after session completion)
  useEffect(() => {
    loadIRS();
  }, [loadIRS, refreshTrigger]);

  // Animate score when irsData changes
  useEffect(() => {
    if (!irsData) return;

    const consistency = calculateConsistency(irsData.currentStreak);
    const starAdherence = calculateStarAdherence(irsData.scores, 'nursing');
    const coverage = calculateCoverage(irsData.uniquePracticed, irsData.totalQuestions);
    const answerPrep = calculateAnswerPreparedness(irsData.narratives, irsData.totalQuestions);
    const targetScore = calculateIRS(consistency, starAdherence, coverage, answerPrep);

    const startScore = prevScoreRef.current;
    const startTime = Date.now();
    const duration = 800;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startScore + (targetScore - startScore) * eased);
      setAnimatedScore(current);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        prevScoreRef.current = targetScore;
      }
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [irsData]);

  // Rotate through growth tips on a timer (must be above early return — rules of hooks)
  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex(prev => prev + 1);
    }, TIP_ROTATION_MS);
    return () => clearInterval(interval);
  }, []);

  // Don't render anything if no data loaded yet
  if (!irsData) return null;

  // Calculate components (nursing scale)
  const consistency = calculateConsistency(irsData.currentStreak);
  const starAdherence = calculateStarAdherence(irsData.scores, 'nursing');
  const coverage = calculateCoverage(irsData.uniquePracticed, irsData.totalQuestions);
  const answerPreparedness = calculateAnswerPreparedness(irsData.narratives, irsData.totalQuestions);
  const irsScore = calculateIRS(consistency, starAdherence, coverage, answerPreparedness);
  const level = getIRSLevel(irsScore);
  const tips = getGrowthTips(consistency, starAdherence, coverage, answerPreparedness);
  const currentTip = tips[tipIndex % tips.length];
  const colors = LEVEL_COLORS[level.color] || LEVEL_COLORS.slate;

  // Count personalized answers for detail modal sublabel
  const personalizedCount = (irsData.narratives || []).filter(n => isPersonalizedAnswer(n)).length;

  // Ring offset for animated score
  const ringOffset = RING_CIRCUMFERENCE - (animatedScore / 100) * RING_CIRCUMFERENCE;

  // Nursing-specific sublabels for detail modal
  const avgNursingScore = irsData.scores.length > 0
    ? (irsData.scores.reduce((a, b) => a + b, 0) / irsData.scores.length).toFixed(1)
    : null;

  return (
    <>
      {/* IRS Hero Card — full-width, above stats grid */}
      <div
        className="mb-4 sm:mb-6 bg-white/10 backdrop-blur-lg rounded-xl sm:rounded-2xl p-4 sm:p-5 text-white border border-white/20 cursor-pointer hover:bg-white/15 transition-all duration-200"
        onClick={() => setShowDetail(true)}
        onTouchEnd={(e) => { e.preventDefault(); setShowDetail(true); }}
      >
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Left: Animated SVG Progress Ring */}
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
              <circle
                cx="60" cy="60" r={RING_RADIUS}
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="8"
              />
              <circle
                cx="60" cy="60" r={RING_RADIUS}
                fill="none"
                stroke={colors.ring}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={RING_CIRCUMFERENCE}
                strokeDashoffset={ringOffset}
                style={{ transition: 'stroke-dashoffset 0.3s ease-out' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl sm:text-3xl font-black leading-none">{animatedScore}</span>
              <span className="text-[9px] sm:text-[10px] text-white/60 font-medium">IRS</span>
            </div>
          </div>

          {/* Right: Level + Breakdown Bars */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-sm sm:text-base font-bold ${colors.text}`}>
                {level.label}
              </span>
              <span className="text-[10px] text-white/40">Interview Readiness</span>
            </div>

            <div className="space-y-1.5">
              <MiniBar icon={<Flame className="w-3 h-3" />} label="Consistency" value={Math.round(consistency)} color={colors.barBg} />
              <MiniBar icon={<Target className="w-3 h-3" />} label="Quality" value={Math.round(starAdherence)} color={colors.barBg} />
              <MiniBar icon={<BookOpen className="w-3 h-3" />} label="Coverage" value={Math.round(coverage)} color={colors.barBg} />
              <MiniBar icon={<PenTool className="w-3 h-3" />} label="Answers" value={Math.round(answerPreparedness)} color={colors.barBg} />
            </div>
          </div>
        </div>

        {/* Growth tip — rotates through relevant tips */}
        <div className="mt-3 pt-2 border-t border-white/10 flex items-center gap-2">
          <TrendingUp className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" />
          <AnimatePresence mode="wait">
            <motion.p
              key={tipIndex % tips.length}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.3 }}
              className="text-[11px] sm:text-xs text-white/60"
            >
              {currentTip}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {showDetail && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowDetail(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-white/20 rounded-2xl p-6 max-w-sm w-full shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowDetail(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Header with large ring */}
              <div className="text-center mb-6">
                <div className="relative w-32 h-32 mx-auto mb-3">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r={RING_RADIUS} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                    <circle
                      cx="60" cy="60" r={RING_RADIUS} fill="none"
                      stroke={colors.ring} strokeWidth="8" strokeLinecap="round"
                      strokeDasharray={RING_CIRCUMFERENCE}
                      strokeDashoffset={RING_CIRCUMFERENCE - (irsScore / 100) * RING_CIRCUMFERENCE}
                      style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-black text-white">{irsScore}</span>
                    <span className="text-xs text-white/50">out of 100</span>
                  </div>
                </div>
                <h3 className={`text-xl font-bold ${colors.text}`}>{level.label}</h3>
                <p className="text-sm text-slate-400 mt-1">Interview Readiness Score</p>
              </div>

              {/* Detailed Breakdown */}
              <div className="space-y-4 mb-6">
                <DetailRow
                  icon={<Flame className="w-4 h-4 text-orange-400" />}
                  label="Consistency"
                  value={Math.round(consistency)}
                  sublabel={`${irsData.currentStreak} day streak (14-day target)`}
                  barColor="bg-orange-400"
                />
                <DetailRow
                  icon={<Target className="w-4 h-4 text-teal-400" />}
                  label="Answer Quality"
                  value={Math.round(starAdherence)}
                  sublabel={
                    avgNursingScore
                      ? `Avg ${avgNursingScore}/5 across ${irsData.scores.length} session${irsData.scores.length !== 1 ? 's' : ''}`
                      : 'No scored sessions yet'
                  }
                  barColor="bg-teal-400"
                />
                <DetailRow
                  icon={<BookOpen className="w-4 h-4 text-blue-400" />}
                  label="Question Coverage"
                  value={Math.round(coverage)}
                  sublabel={`${irsData.uniquePracticed} of ${irsData.totalQuestions} questions practiced`}
                  barColor="bg-blue-400"
                />
                <DetailRow
                  icon={<PenTool className="w-4 h-4 text-purple-400" />}
                  label="Answer Preparedness"
                  value={Math.round(answerPreparedness)}
                  sublabel={`${personalizedCount} of ${irsData.totalQuestions} answers saved`}
                  barColor="bg-purple-400"
                />
              </div>

              {/* Growth tip */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-3 mb-4">
                <div className="flex items-start gap-2">
                  <TrendingUp className="w-4 h-4 text-teal-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-white mb-1">Growth Tip</p>
                    <AnimatePresence mode="wait">
                      <motion.p
                        key={tipIndex % tips.length}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="text-xs text-slate-400"
                      >
                        {currentTip}
                      </motion.p>
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              <p className="text-[10px] text-slate-500 text-center">
                IRS combines your practice consistency, answer quality, question coverage, and answer preparedness into a single readiness score. Save answers and practice daily to watch it climb.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ── Sub-components ────────────────────────────────────────────

function MiniBar({ icon, label, value, color }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-white/40 flex-shrink-0">{icon}</span>
      <span className="text-[10px] sm:text-[11px] text-white/50 w-16 sm:w-20 truncate">{label}</span>
      <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all duration-700 ease-out`}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-[10px] text-white/40 w-6 text-right font-medium">{value}</span>
    </div>
  );
}

function DetailRow({ icon, label, value, sublabel, barColor }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm text-slate-300">{label}</span>
        </div>
        <span className="text-sm font-bold text-white">{value}/100</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className={`h-full ${barColor} rounded-full transition-all duration-700 ease-out`}
            style={{ width: `${value}%` }}
          />
        </div>
      </div>
      <p className="text-[10px] text-slate-500 mt-1">{sublabel}</p>
    </div>
  );
}
