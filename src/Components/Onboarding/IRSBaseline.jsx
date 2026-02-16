import React, { useState, useEffect, useRef } from 'react'
import { trackOnboardingEvent } from '../../utils/onboardingTracker'

/**
 * IRSBaseline — Screen 4: Interview Readiness Score Baseline
 *
 * IRS v1 (from PRODUCT_ARCHITECTURE.md):
 *   Composite 0-100. Three inputs equally weighted:
 *   1. Session consistency: streak days / 14, capped at 1.0
 *   2. STAR structure adherence: average AI assessment score
 *   3. Question coverage: unique questions practiced / total in bank
 *
 * For onboarding: 1 session, 1 question, 0 streak days.
 *   - Session consistency: 1/14 = 0.071 → 7.1/100
 *   - STAR adherence: practiceScore/10 → e.g. 6/10 = 60/100
 *   - Question coverage: 1/50 = 0.02 → 2/100
 *   - Composite: (7.1 + 60 + 2) / 3 ≈ 23
 *
 * Display: Animated progress ring (0 → score) with 500ms fill.
 * Ghost ring at 75 shows aspirational target.
 */

export default function IRSBaseline({ practiceScore, onContinue }) {
  const [animatedScore, setAnimatedScore] = useState(0)
  const [showDetails, setShowDetails] = useState(false)
  const animationRef = useRef(null)

  // Calculate real IRS
  const sessionConsistency = (1 / 14) * 100    // 1 day / 14 target = ~7
  const starAdherence = ((practiceScore || 6) / 10) * 100 // practice score normalized
  const questionCoverage = (1 / 50) * 100       // 1 question / ~50 in bank = 2

  const realIRS = Math.round((sessionConsistency + starAdherence + questionCoverage) / 3)
  const hasTrackedScore = useRef(false)

  // Animate the score ring on mount
  useEffect(() => {
    const startTime = Date.now()
    const duration = 1200 // 1.2s for dramatic effect

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      // Ease-out cubic for smooth deceleration
      const eased = 1 - Math.pow(1 - progress, 3)
      setAnimatedScore(Math.round(eased * realIRS))

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate)
      } else {
        // Show details after animation completes
        setTimeout(() => setShowDetails(true), 300)
        if (!hasTrackedScore.current) {
          hasTrackedScore.current = true
          trackOnboardingEvent(4, 'score_shown', { irs_score: realIRS, practice_score: practiceScore || 6 })
        }
      }
    }

    // Small delay before starting animation
    const timeout = setTimeout(() => {
      animationRef.current = requestAnimationFrame(animate)
    }, 500)

    return () => {
      clearTimeout(timeout)
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [realIRS])

  const circumference = 2 * Math.PI * 80
  const scoreOffset = circumference - (animatedScore / 100) * circumference
  const ghostOffset = circumference - (75 / 100) * circumference

  return (
    <div className="flex-1 flex flex-col justify-center items-center text-center">
      <p className="text-sm text-teal-600 font-medium tracking-wide uppercase mb-2">
        Your Starting Point
      </p>

      <h2 className="text-2xl font-bold text-slate-800 mb-8">
        Interview Readiness Score
      </h2>

      {/* Score ring */}
      <div className="relative w-52 h-52 mx-auto mb-8">
        <svg className="w-52 h-52 -rotate-90" viewBox="0 0 200 200">
          {/* Background ring */}
          <circle
            cx="100" cy="100" r="80"
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="8"
          />

          {/* Ghost ring at 75 (aspirational target) */}
          <circle
            cx="100" cy="100" r="80"
            fill="none"
            stroke="#0d948833"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={ghostOffset}
          />

          {/* Actual score ring */}
          <circle
            cx="100" cy="100" r="80"
            fill="none"
            stroke="#0d9488"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={scoreOffset}
            style={{ transition: 'stroke-dashoffset 0.1s linear' }}
          />
        </svg>

        {/* Score number */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold text-slate-800">
            {animatedScore}
          </span>
          <span className="text-sm text-slate-400">out of 100</span>
        </div>

        {/* 75 marker */}
        <div
          className="absolute text-xs font-medium text-teal-500/50"
          style={{
            top: '8px',
            right: '20px',
          }}
        >
          75
        </div>
      </div>

      {/* Score context */}
      <div className="mb-6">
        <p className="text-slate-600 mb-2">
          {realIRS < 20
            ? "Everyone starts here. One practice session and you're already ahead of most candidates who never practice at all."
            : realIRS < 40
            ? "A solid starting point. With consistent practice, users typically see their score climb 15+ points in the first week."
            : "Great start! You're already showing strong fundamentals."}
        </p>
      </div>

      {/* Score breakdown (appears after animation) */}
      {showDetails && (
        <div className="animate-fadeIn w-full max-w-sm mb-8">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm text-left">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-3">
              Score Breakdown
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
                sublabel={`${practiceScore || 6}/10 on your practice`}
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
