import React, { useState, useEffect, useRef, useCallback } from 'react'
import { trackOnboardingEvent } from '../../utils/onboardingTracker'

/**
 * BreathingExercise — Screen 2: Guided Breathing Animation
 *
 * 30-second guided breath cycle (box breathing: 4-4-4-4).
 * "92% of people feel interview anxiety. Let's start by taking a breath."
 *
 * Physiological Management source (Huang & Mayer 2020):
 * Managing the body's anxiety response is one of 4 self-efficacy sources.
 *
 * iOS Safari: Uses CSS animations (not requestAnimationFrame) for smooth
 * rendering. Tested with transform + opacity transitions.
 */

const BREATH_PHASES = [
  { label: 'Breathe in', duration: 4000, scale: 1.4 },
  { label: 'Hold', duration: 4000, scale: 1.4 },
  { label: 'Breathe out', duration: 4000, scale: 1.0 },
  { label: 'Hold', duration: 4000, scale: 1.0 },
]

const TOTAL_CYCLES = 2 // 2 full cycles = 32 seconds ≈ 30 seconds
const TOTAL_DURATION = BREATH_PHASES.reduce((s, p) => s + p.duration, 0) * TOTAL_CYCLES

export default function BreathingExercise({ onComplete }) {
  const [phase, setPhase] = useState(-1) // -1 = intro, 0-3 = breath phases
  const [cycleCount, setCycleCount] = useState(0)
  const [isActive, setIsActive] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [elapsedMs, setElapsedMs] = useState(0)
  const timerRef = useRef(null)
  const startTimeRef = useRef(null)

  const currentPhase = phase >= 0 ? BREATH_PHASES[phase] : null

  // Start the breathing exercise
  const handleStart = useCallback(() => {
    setIsActive(true)
    setPhase(0)
    setCycleCount(0)
    startTimeRef.current = Date.now()
    trackOnboardingEvent(2, 'started')
  }, [])

  // Progress through phases
  useEffect(() => {
    if (!isActive || phase < 0) return

    timerRef.current = setTimeout(() => {
      const nextPhase = phase + 1
      if (nextPhase >= BREATH_PHASES.length) {
        // Completed one cycle
        const newCycleCount = cycleCount + 1
        if (newCycleCount >= TOTAL_CYCLES) {
          // All cycles done
          setIsActive(false)
          setIsComplete(true)
          trackOnboardingEvent(2, 'completed', { duration_ms: Date.now() - startTimeRef.current })
          return
        }
        setCycleCount(newCycleCount)
        setPhase(0)
      } else {
        setPhase(nextPhase)
      }
    }, BREATH_PHASES[phase].duration)

    return () => clearTimeout(timerRef.current)
  }, [isActive, phase, cycleCount])

  // Track elapsed time for progress ring
  useEffect(() => {
    if (!isActive) return
    const interval = setInterval(() => {
      setElapsedMs(Date.now() - startTimeRef.current)
    }, 50)
    return () => clearInterval(interval)
  }, [isActive])

  const progressPercent = Math.min((elapsedMs / TOTAL_DURATION) * 100, 100)

  return (
    <div className="flex-1 flex flex-col justify-center items-center text-center">
      {/* Intro state */}
      {!isActive && !isComplete && (
        <div className="animate-fadeIn">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-teal-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342" />
            </svg>
          </div>

          <p className="text-slate-400 text-sm font-medium tracking-wide uppercase mb-2">
            Before we begin
          </p>

          <h2 className="text-2xl font-bold text-slate-800 mb-3">
            Let's take a breath
          </h2>

          <p className="text-slate-500 mb-8 max-w-sm mx-auto">
            92% of people feel interview anxiety. A 30-second breathing exercise
            can reduce stress hormones by up to 25%.
          </p>

          <button
            onClick={handleStart}
            className="px-8 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-teal-600/20"
          >
            Start breathing exercise
          </button>

          <button
            onClick={() => { trackOnboardingEvent(2, 'skipped'); onComplete(); }}
            className="block mx-auto mt-4 text-sm text-slate-400 hover:text-slate-500 transition-colors"
          >
            Skip for now
          </button>
        </div>
      )}

      {/* Active breathing state */}
      {isActive && currentPhase && (
        <div className="animate-fadeIn">
          <p className="text-sm text-slate-400 mb-8">
            Follow the circle. {cycleCount + 1} of {TOTAL_CYCLES} cycles.
          </p>

          {/* Breathing circle */}
          <div className="relative w-48 h-48 mx-auto mb-8">
            {/* Progress ring */}
            <svg className="absolute inset-0 w-48 h-48 -rotate-90" viewBox="0 0 200 200">
              <circle
                cx="100" cy="100" r="90"
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="4"
              />
              <circle
                cx="100" cy="100" r="90"
                fill="none"
                stroke="#0d9488"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 90}`}
                strokeDashoffset={`${2 * Math.PI * 90 * (1 - progressPercent / 100)}`}
                style={{ transition: 'stroke-dashoffset 0.1s linear' }}
              />
            </svg>

            {/* Breathing orb */}
            <div
              className="absolute inset-0 flex items-center justify-center"
            >
              <div
                className="w-24 h-24 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 opacity-80"
                style={{
                  transform: `scale(${currentPhase.scale})`,
                  transition: `transform ${currentPhase.duration}ms ease-in-out`,
                }}
              />
            </div>
          </div>

          {/* Phase label */}
          <p className="text-xl font-semibold text-slate-700 animate-pulse">
            {currentPhase.label}
          </p>
        </div>
      )}

      {/* Completion state */}
      {isComplete && (
        <div className="animate-fadeIn">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-slate-800 mb-2">
            Nicely done
          </h2>

          <p className="text-slate-500 mb-8 max-w-sm mx-auto">
            Your heart rate just dropped. You're calmer now than when you started.
            Let's use that clarity for a quick practice round.
          </p>

          <button
            onClick={onComplete}
            className="px-8 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-teal-600/20"
          >
            Try a practice question
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
