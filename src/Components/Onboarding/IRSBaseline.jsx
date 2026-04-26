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

// Sprint 6 color stops for the ring as it fills.
// 0-40% amber, 40-70% teal, 70-100% emerald. Hex channels used for RGB lerp.
const RING_STOPS = [
  { at: 0.0,  r: 0xf5, g: 0x9e, b: 0x0b }, // amber-500
  { at: 0.4,  r: 0xf5, g: 0x9e, b: 0x0b }, // hold amber until 40%
  { at: 0.55, r: 0x14, g: 0xb8, b: 0xa6 }, // teal-500 mid
  { at: 0.7,  r: 0x14, g: 0xb8, b: 0xa6 }, // hold teal until 70%
  { at: 1.0,  r: 0x10, g: 0xb9, b: 0x81 }, // emerald-500
]

function ringColorForFill(fill) {
  const f = Math.max(0, Math.min(1, fill))
  for (let i = 1; i < RING_STOPS.length; i++) {
    const a = RING_STOPS[i - 1]
    const b = RING_STOPS[i]
    if (f <= b.at) {
      const span = b.at - a.at
      const t = span === 0 ? 0 : (f - a.at) / span
      const r = Math.round(a.r + (b.r - a.r) * t)
      const g = Math.round(a.g + (b.g - a.g) * t)
      const bl = Math.round(a.b + (b.b - a.b) * t)
      return `rgb(${r}, ${g}, ${bl})`
    }
  }
  const last = RING_STOPS[RING_STOPS.length - 1]
  return `rgb(${last.r}, ${last.g}, ${last.b})`
}

// Particle palette — teal + emerald shades
const BURST_COLORS = ['#14b8a6', '#2dd4bf', '#10b981', '#34d399']

export default function IRSBaseline({ practiceScore, onContinue }) {
  const [view, setView] = useState('A') // 'A' | 'B'
  const [animatedScore, setAnimatedScore] = useState(0)
  const [ringColor, setRingColor] = useState(ringColorForFill(0))
  const [ringProgress, setRingProgress] = useState(0) // 0..1 for blur/opacity
  const [ringDone, setRingDone] = useState(false)     // triggers bounce + breath
  const [showBurst, setShowBurst] = useState(false)   // particle burst on landing
  const [showDetails, setShowDetails] = useState(false)
  const [committing, setCommitting] = useState(false)
  const animationRef = useRef(null)
  const commitTimerRef = useRef(null)
  const burstTimerRef = useRef(null)
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
      const scoreNow = eased * normalizedPracticeScore
      setAnimatedScore(Math.round(scoreNow * 10) / 10)

      // Fill fraction 0..1 relative to the target score's share of 10.
      const fill = (scoreNow / 10)
      setRingColor(ringColorForFill(fill))
      setRingProgress(progress)

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate)
      } else {
        setRingDone(true)
        setShowBurst(true)
        // Burst lifespan ~1s, then unmount
        burstTimerRef.current = setTimeout(() => setShowBurst(false), 1000)
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
      if (burstTimerRef.current) {
        clearTimeout(burstTimerRef.current)
        burstTimerRef.current = null
      }
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
        <div
          className={`relative w-44 h-44 mx-auto mb-8 ${ringDone ? 'ring-breath' : ''}`}
        >
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
              stroke={ringColor}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={scoreOffset}
              style={{
                transition: 'stroke-dashoffset 0.1s linear, stroke 0.1s linear',
              }}
            />
          </svg>

          {/* Particle burst — overlay, center of ring. Unmounts ~1s after landing. */}
          {showBurst && (
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 200 200"
              aria-hidden="true"
            >
              {Array.from({ length: 18 }).map((_, i) => {
                const angle = (i * 360) / 18
                const color = BURST_COLORS[i % BURST_COLORS.length]
                return (
                  <circle
                    key={i}
                    cx="100"
                    cy="100"
                    r="3"
                    fill={color}
                    className="burst-particle"
                    style={{
                      // Expose angle via CSS var so the @keyframes can keep the
                      // rotation while animating translate (transform is one property,
                      // keyframes would otherwise reset the rotate).
                      '--burst-angle': `${angle}deg`,
                      transformOrigin: '100px 100px',
                    }}
                  />
                )
              })}
            </svg>
          )}

          <div
            className={`absolute inset-0 flex flex-col items-center justify-center ${
              ringDone ? 'score-land' : ''
            }`}
            style={{
              // Blur fades from 2px -> 0 over the last 400ms of the 1200ms animation.
              filter: ringDone
                ? 'blur(0)'
                : `blur(${Math.max(0, 2 - Math.max(0, ringProgress - 0.66) * 6)}px)`,
              transition: ringDone ? 'filter 200ms ease-out' : 'none',
            }}
          >
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

        <style>{sharedKeyframes + revealKeyframes}</style>
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
        <div className="flex justify-center relative">
          {/* 14 orbiting day-particles — one per day of the commitment.
              Rendered only while committing, unmount after ~1s. Pure CSS. */}
          {committing && (
            <div className="commit-particles-wrap" aria-hidden="true">
              {Array.from({ length: 14 }).map((_, i) => {
                const angle = (i * 360) / 14 // ~25.7deg per step
                const delay = `${i * 30}ms`
                return (
                  <span
                    key={i}
                    className="commit-particle"
                    style={{
                      transform: `rotate(${angle}deg)`,
                      // Shared var used by both wrapper (fade) and dot (orbit)
                      // so the staggered sequence stays synchronized.
                      '--orbit-delay': delay,
                      animationDelay: delay,
                    }}
                  >
                    <span className="commit-particle-dot" />
                  </span>
                )
              })}
            </div>
          )}

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

      <style>{sharedKeyframes + commitKeyframes + orbitKeyframes}</style>
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

// Sprint 6 Task 1 — Screen A cinematic reveal.
// - burstOut: particles travel outward on their rotated axis (translate +64px), fade to 0.
// - scoreLand: number bounces 1 -> 1.15 -> 1 over 500ms after landing.
// - breath: ring container scales 1 -> 1.02 -> 1 infinitely, subtle "living" feel.
const revealKeyframes = `
  @keyframes burstOut {
    0%   {
      transform: rotate(var(--burst-angle, 0deg)) translate(0, 0) scale(1);
      opacity: 0.95;
    }
    60%  { opacity: 0.8; }
    100% {
      transform: rotate(var(--burst-angle, 0deg)) translate(0, -64px) scale(0.3);
      opacity: 0;
    }
  }
  .burst-particle {
    /* Rotation is composed inside the keyframe from --burst-angle so the
       keyframe's translate moves the particle along its own rotated axis —
       a radial spray from the ring center. */
    animation: burstOut 900ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
  }
  @keyframes scoreLand {
    0%   { transform: scale(1); }
    40%  { transform: scale(1.15); }
    100% { transform: scale(1); }
  }
  .score-land {
    animation: scoreLand 500ms ease-out;
  }
  @keyframes ringBreath {
    0%   { transform: scale(1); }
    50%  { transform: scale(1.02); }
    100% { transform: scale(1); }
  }
  .ring-breath {
    animation: ringBreath 3s ease-in-out 1s infinite alternate;
  }
`

// Sprint 6 Task 2 — Screen B commit particles.
// Wrap is an absolutely-positioned square centered on the button. Each .commit-particle
// is a rotated container; the inner dot animates outward along the container's y-axis,
// giving a 360deg staggered burst. Pointer-events: none so taps pass through.
const orbitKeyframes = `
  .commit-particles-wrap {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    pointer-events: none;
    z-index: 5;
  }
  .commit-particle {
    position: absolute;
    top: 0;
    left: 0;
    width: 0;
    height: 0;
    transform-origin: 0 0;
  }
  .commit-particle-dot {
    position: absolute;
    left: -4px;
    top: -4px;
    width: 8px;
    height: 8px;
    border-radius: 9999px;
    background: radial-gradient(circle at 30% 30%, #5eead4 0%, #14b8a6 60%, #0d9488 100%);
    box-shadow: 0 0 6px rgba(20,184,166,0.55);
    opacity: 0;
    animation: commitOrbitOut 800ms cubic-bezier(0.22, 1, 0.36, 1) var(--orbit-delay, 0ms) forwards;
  }
  .commit-particle {
    animation: commitOrbitFade 800ms linear var(--orbit-delay, 0ms) forwards;
  }
  @keyframes commitOrbitOut {
    0%   { transform: translate(0, 0) scale(0.6); opacity: 0; }
    15%  { opacity: 1; }
    100% { transform: translate(0, -80px) scale(0.5); opacity: 0; }
  }
  /* The rotated wrapper itself needs no movement — dot movement is what travels,
     but we keep a tiny fade on the wrapper as a belt-and-suspenders unmount cue. */
  @keyframes commitOrbitFade {
    0%, 95% { opacity: 1; }
    100%    { opacity: 0; }
  }
`
