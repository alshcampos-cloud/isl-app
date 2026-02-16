import React, { useState, useEffect, useRef } from 'react'
import { trackOnboardingEvent } from '../../utils/onboardingTracker'

/**
 * IRSBaseline — Screen 4: Interview Readiness Score Baseline
 *
 * Reframed per Phase 2 Completion:
 *   - Practice score shown prominently ("You scored 7/10 on your first try")
 *   - IRS shown as secondary with clear explanation of why it's low
 *   - Ghost ring removed (confusing without context)
 *   - Breakdown kept but labeled so users understand the components
 *   - Skip link available immediately for users who want to move on
 */

export default function IRSBaseline({ practiceScore, onContinue }) {
  const [animatedScore, setAnimatedScore] = useState(0)
  const [showDetails, setShowDetails] = useState(false)
  const animationRef = useRef(null)

  const normalizedPracticeScore = practiceScore || 6

  // Calculate real IRS
  const sessionConsistency = (1 / 14) * 100    // 1 day / 14 target = ~7
  const starAdherence = (normalizedPracticeScore / 10) * 100 // practice score normalized
  const questionCoverage = (1 / 50) * 100       // 1 question / ~50 in bank = 2

  const realIRS = Math.round((sessionConsistency + starAdherence + questionCoverage) / 3)
  const hasTrackedScore = useRef(false)

  // Animate the practice score ring on mount (based on practice score, not IRS)
  const practicePercent = (normalizedPracticeScore / 10) * 100
  useEffect(() => {
    const startTime = Date.now()
    const duration = 1200

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setAnimatedScore(Math.round(eased * normalizedPracticeScore * 10) / 10)

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate)
      } else {
        setTimeout(() => setShowDetails(true), 300)
        if (!hasTrackedScore.current) {
          hasTrackedScore.current = true
          trackOnboardingEvent(4, 'score_shown', { irs_score: realIRS, practice_score: normalizedPracticeScore })
        }
      }
    }

    const timeout = setTimeout(() => {
      animationRef.current = requestAnimationFrame(animate)
    }, 500)

    return () => {
      clearTimeout(timeout)
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [normalizedPracticeScore, realIRS])

  const circumference = 2 * Math.PI * 80
  const scoreOffset = circumference - (Math.min(animatedScore, 10) / 10) * circumference

  return (
    <div className="flex-1 flex flex-col justify-center items-center text-center">
      <p className="text-sm text-teal-600 font-medium tracking-wide uppercase mb-2">
        Your First Practice
      </p>

      <h2 className="text-2xl font-bold text-slate-800 mb-2">
        You scored {normalizedPracticeScore}/10 on your first try
      </h2>

      <p className="text-slate-500 text-sm mb-8">
        {normalizedPracticeScore >= 7
          ? "That's a strong start — most people score lower on their first attempt."
          : normalizedPracticeScore >= 5
          ? "That's better than many first attempts. Practice makes the difference."
          : "Everyone starts here. The key is consistent practice — scores climb fast."}
      </p>

      {/* Practice score ring */}
      <div className="relative w-44 h-44 mx-auto mb-8">
        <svg className="w-44 h-44 -rotate-90" viewBox="0 0 200 200">
          {/* Background ring */}
          <circle
            cx="100" cy="100" r="80"
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="10"
          />

          {/* Score ring — based on practice score */}
          <circle
            cx="100" cy="100" r="80"
            fill="none"
            stroke="#0d9488"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={scoreOffset}
            style={{ transition: 'stroke-dashoffset 0.1s linear' }}
          />
        </svg>

        {/* Score number */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold text-slate-800">
            {animatedScore.toFixed(0)}
          </span>
          <span className="text-sm text-slate-400">out of 10</span>
        </div>
      </div>

      {/* IRS as secondary element + breakdown (appears after animation) */}
      {showDetails && (
        <div className="animate-fadeIn w-full max-w-sm mb-8">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm text-left">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                Interview Readiness Score
              </p>
              <span className="text-lg font-bold text-teal-600">{realIRS}/100</span>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              This combines practice consistency, answer quality, and question coverage. It grows as you practice.
            </p>
            <div className="space-y-3">
              <ScoreRow
                label="Practice consistency"
                value={Math.round(sessionConsistency)}
                sublabel="1 day of 14-day target"
              />
              <ScoreRow
                label="Answer quality"
                value={Math.round(starAdherence)}
                sublabel={`${normalizedPracticeScore}/10 on your practice`}
              />
              <ScoreRow
                label="Question coverage"
                value={Math.round(questionCoverage)}
                sublabel="1 of ~50 questions attempted"
              />
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100">
              <div className="flex items-center gap-2 text-xs text-teal-600">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <span>Users who practice daily for a week typically reach 45+</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Continue button */}
      {showDetails && (
        <div className="animate-fadeIn w-full">
          <button
            onClick={() => { trackOnboardingEvent(4, 'completed'); onContinue(); }}
            className="w-full py-3 px-6 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-teal-600/20"
          >
            Save my progress
          </button>
        </div>
      )}

      {/* Skip link — visible immediately while animation plays */}
      {!showDetails && (
        <button
          onClick={() => { trackOnboardingEvent(4, 'skipped'); onContinue(); }}
          className="mt-4 text-sm text-slate-400 hover:text-slate-500 transition-colors"
        >
          Skip for now
        </button>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  )
}

function ScoreRow({ label, value, sublabel }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-slate-600">{label}</span>
        <span className="text-sm font-semibold text-slate-800">{value}/100</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-teal-500 rounded-full transition-all duration-500"
            style={{ width: `${value}%` }}
          />
        </div>
        <span className="text-xs text-slate-400 whitespace-nowrap">{sublabel}</span>
      </div>
    </div>
  )
}
