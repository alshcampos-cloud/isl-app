import React, { useState, useEffect, useRef } from 'react'
import { Check } from 'lucide-react'
import { trackOnboardingEvent } from '../../utils/onboardingTracker'

/**
 * IRSBaseline — Screen 4: Interview Readiness Score Baseline
 *
 * Sprint 5 / Coder 2 split: one file, two internal screens via a state machine.
 *   - Screen A: "Your score" — just the big ring + friendly copy + CTA to plan.
 *   - Screen B: "Your 14-day plan" — small score reminder + trajectory + breakdown
 *                + 14-day commit button (CSS-only microinteraction) + "Maybe later".
 *
 * Commit write contract (Auditor-locked, localStorage-only v1):
 *   localStorage.setItem('isl_14day_commit', JSON.stringify({
 *     committed: true,
 *     timestamp: new Date().toISOString()
 *   }))
 *
 * "Maybe later" is a zero-write dismiss — advance with NO localStorage write.
 */

export default function IRSBaseline({ practiceScore, onContinue }) {
  const [view, setView] = useState('A') // 'A' | 'B'
  const [animatedScore, setAnimatedScore] = useState(0)
  const [showDetails, setShowDetails] = useState(false)
  const [committing, setCommitting] = useState(false)
  const animationRef = useRef(null)
  const commitTimerRef = useRef(null)
  const hasTrackedScore = useRef(false)

  const normalizedPracticeScore = practiceScore || 6

  // Calculate real IRS
  const sessionConsistency = (1 / 14) * 100    // 1 day / 14 target = ~7
  const starAdherence = (normalizedPracticeScore / 10) * 100 // practice score normalized
  const questionCoverage = (1 / 50) * 100       // 1 question / ~50 in bank = 2

  const realIRS = Math.round((sessionConsistency + starAdherence + questionCoverage) / 3)

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

  // Cleanup the commit-timer on unmount — prevents stale-closure navigation
  // if the user hits back mid-animation (Auditor-required).
  useEffect(() => {
    return () => {
      if (commitTimerRef.current) {
        clearTimeout(commitTimerRef.current)
        commitTimerRef.current = null
      }
    }
  }, [])

  const circumference = 2 * Math.PI * 80
  const scoreOffset = circumference - (Math.min(animatedScore, 10) / 10) * circumference

  const handleAdvanceToPlan = () => {
    trackOnboardingEvent(4, 'plan_viewed', { irs_score: realIRS })
    setView('B')
  }

  const handleBackToScore = () => {
    if (committing) return // guard against back-tap mid-animation
    setView('A')
  }

  const handleCommit = () => {
    if (committing) return
    setCommitting(true)

    // localStorage write — progressive enhancement. Safari private mode throws.
    try {
      localStorage.setItem(
        'isl_14day_commit',
        JSON.stringify({
          committed: true,
          timestamp: new Date().toISOString()
        })
      )
    } catch (e) {
      // Non-blocking — proceed with UX even if the write fails.
      // eslint-disable-next-line no-console
      console.warn('[IRSBaseline] localStorage write failed:', e)
    }

    trackOnboardingEvent(4, 'committed_14day', { irs_score: realIRS })

    // 1.0s animation + 600ms dwell = 1600ms total before advance.
    commitTimerRef.current = setTimeout(() => {
      trackOnboardingEvent(4, 'completed')
      onContinue()
    }, 1600)
  }

  const handleMaybeLater = () => {
    // Zero-write dismiss — NO localStorage, NO guilt copy. Just advance.
    trackOnboardingEvent(4, 'declined_14day')
    onContinue()
  }

  // ===== SCREEN A — Your score =====
  if (view === 'A') {
    return (
      <div className="flex-1 flex flex-col justify-center items-center text-center">
        <p className="text-sm text-teal-600 font-medium tracking-wide uppercase mb-2">
          Your Starting Point
        </p>

        <h2 className="text-2xl font-bold text-slate-800 mb-2">
          Your starting point
        </h2>

        <p className="text-slate-500 text-sm mb-8 max-w-xs">
          Here's where you are today — but not where you'll stay.
        </p>

        {/* Big score ring */}
        <div className="relative w-44 h-44 mx-auto mb-8">
          <svg className="w-44 h-44 -rotate-90" viewBox="0 0 200 200">
            <circle
              cx="100" cy="100" r="80"
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="10"
            />
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

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold text-slate-800">
              {animatedScore.toFixed(0)}
            </span>
            <span className="text-sm text-slate-400">out of 10</span>
          </div>
        </div>

        {/* CTA — advances to Screen B */}
        {showDetails && (
          <div className="animate-fadeIn w-full">
            <button
              onClick={handleAdvanceToPlan}
              onTouchStart={(e) => { e.currentTarget.style.opacity = '0.85' }}
              onTouchEnd={(e) => { e.currentTarget.style.opacity = '1' }}
              className="w-full py-3 px-6 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-teal-600/20"
            >
              See my 14-day plan →
            </button>
          </div>
        )}

        {/* Skip link — visible while animation plays */}
        {!showDetails && (
          <button
            onClick={() => { trackOnboardingEvent(4, 'skipped'); onContinue(); }}
            className="mt-4 text-sm text-slate-400 hover:text-slate-500 transition-colors"
          >
            Skip for now
          </button>
        )}

        <style>{sharedKeyframes}</style>
      </div>
    )
  }

  // ===== SCREEN B — Your 14-day plan =====
  return (
    <div className="flex-1 flex flex-col justify-start items-center text-center pt-2">
      {/* Back button + compact score reminder */}
      <div className="w-full max-w-sm flex items-center justify-between mb-4">
        <button
          onClick={handleBackToScore}
          className="text-sm text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1"
          aria-label="Back to score"
        >
          ← Back
        </button>

        {/* Compact score ring — corner */}
        <div className="flex items-center gap-2">
          <div className="relative w-10 h-10">
            <svg className="w-10 h-10 -rotate-90" viewBox="0 0 200 200">
              <circle cx="100" cy="100" r="80" fill="none" stroke="#e2e8f0" strokeWidth="18" />
              <circle
                cx="100" cy="100" r="80"
                fill="none"
                stroke="#0d9488"
                strokeWidth="18"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={circumference - (Math.min(normalizedPracticeScore, 10) / 10) * circumference}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[10px] font-bold text-slate-700">{normalizedPracticeScore}</span>
            </div>
          </div>
          <span className="text-xs text-slate-400">/10</span>
        </div>
      </div>

      <p className="text-sm text-teal-600 font-medium tracking-wide uppercase mb-2">
        Your 14-Day Plan
      </p>

      <h2 className="text-2xl font-bold text-slate-800 mb-2">
        Where you could be in 14 days
      </h2>

      <p className="text-slate-500 text-sm mb-6 max-w-xs">
        Practice daily and your score climbs fast. Here's the trajectory.
      </p>

      {/* Trajectory chart */}
      <div className="w-full max-w-sm bg-white rounded-2xl border border-slate-200 p-4 shadow-sm text-left mb-4">
        <p className="text-xs font-medium text-slate-500 mb-3">Projected trajectory:</p>
        <div className="space-y-2">
          {/* Day 1 — current */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 w-12 text-right">Day 1</span>
            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-teal-500 rounded-full" style={{ width: `${realIRS}%` }} />
            </div>
            <span className="text-xs font-semibold text-teal-600 w-8">{realIRS}</span>
            <span className="text-xs text-teal-500 font-medium w-12">← You</span>
          </div>
          {/* Day 7 */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 w-12 text-right">Day 7</span>
            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-teal-400 rounded-full" style={{ width: '45%' }} />
            </div>
            <span className="text-xs font-semibold text-slate-500 w-8">~45</span>
            <span className="text-xs text-slate-400 w-12"></span>
          </div>
          {/* Day 14 */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 w-12 text-right">Day 14</span>
            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-teal-300 rounded-full" style={{ width: '65%' }} />
            </div>
            <span className="text-xs font-semibold text-slate-500 w-8">~65</span>
            <span className="text-xs text-slate-400 w-12"></span>
          </div>
        </div>
        <p className="text-xs text-slate-400 mt-3">
          Based on users who practice daily. Scores grow fastest in the first 2 weeks.
        </p>
      </div>

      {/* 3 breakdown bars */}
      <div className="w-full max-w-sm bg-white rounded-2xl border border-slate-200 p-4 shadow-sm text-left mb-6">
        <p className="text-xs font-medium text-slate-500 mb-3">What moves your score:</p>
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
      </div>

      {/* Commit button with morph microinteraction */}
      <div className="w-full max-w-sm">
        <div className="flex justify-center">
          <button
            onClick={handleCommit}
            onTouchStart={(e) => { if (!committing) e.currentTarget.style.opacity = '0.92' }}
            onTouchEnd={(e) => { e.currentTarget.style.opacity = '1' }}
            disabled={committing}
            aria-label="Commit to 14 days of practice"
            className={
              committing
                ? 'commit-pill flex items-center justify-center h-14 bg-gradient-to-r from-teal-500 to-teal-600 text-white font-semibold rounded-full shadow-lg'
                : 'w-full h-14 bg-gradient-to-r from-teal-500 to-teal-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl active:scale-[0.98] transition-all'
            }
          >
            {committing ? (
              <Check size={28} strokeWidth={3} className="commit-check" />
            ) : (
              "Yes, I'll practice for 14 days"
            )}
          </button>
        </div>

        <button
          onClick={handleMaybeLater}
          onTouchStart={(e) => { e.currentTarget.style.opacity = '0.7' }}
          onTouchEnd={(e) => { e.currentTarget.style.opacity = '1' }}
          disabled={committing}
          className="w-full h-10 mt-2 text-sm text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-40"
        >
          Maybe later
        </button>
      </div>

      <style>{sharedKeyframes + commitKeyframes}</style>
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

const sharedKeyframes = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fadeIn {
    animation: fadeIn 0.4s ease-out forwards;
  }
`

// Commit microinteraction (Auditor-approved, CSS-only):
//   - Width collapses from full to a pill (300ms).
//   - Pill scale-bounces 1 -> 1.08 -> 1 over 400ms ease-out.
//   - Teal radial glow pulses via box-shadow over 600ms.
// Total ~1.0s. Checkmark fades in over the morph.
const commitKeyframes = `
  @keyframes commitMorph {
    0%   { width: 100%; border-radius: 0.75rem; }
    100% { width: 4rem;  border-radius: 9999px; }
  }
  @keyframes commitBounce {
    0%   { transform: scale(1); }
    40%  { transform: scale(1.08); }
    100% { transform: scale(1); }
  }
  @keyframes commitGlow {
    0%   { box-shadow: 0 0 0 0 rgba(20,184,166,0); }
    50%  { box-shadow: 0 0 24px 12px rgba(20,184,166,0.5); }
    100% { box-shadow: 0 0 0 0 rgba(20,184,166,0); }
  }
  @keyframes commitCheckIn {
    0%   { opacity: 0; transform: scale(0.5); }
    60%  { opacity: 1; transform: scale(1.1); }
    100% { opacity: 1; transform: scale(1); }
  }
  .commit-pill {
    width: 4rem;
    animation:
      commitMorph 300ms ease-out forwards,
      commitBounce 400ms ease-out 300ms,
      commitGlow 600ms ease-out 300ms;
  }
  .commit-check {
    animation: commitCheckIn 300ms ease-out 150ms both;
  }
`
