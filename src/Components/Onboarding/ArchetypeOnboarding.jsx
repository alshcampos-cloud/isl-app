import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { getArchetype, getArchetypeConfig, getPostOnboardingRoute, TIMELINE_OPTIONS, FIELD_OPTIONS, NURSING_FIRST_QUESTION } from '../../utils/archetypeRouter'
import { trackOnboardingEvent, startScreenTimer } from '../../utils/onboardingTracker'
import BreathingExercise from './BreathingExercise'
import OnboardingPractice from './OnboardingPractice'
import IRSBaseline from './IRSBaseline'
import FeaturePreview from './FeaturePreview'
import SignUpPrompt from './SignUpPrompt'

/**
 * ArchetypeOnboarding — Phase 2: Value-First Onboarding
 *
 * Flow (standard):   Archetype → Breathing → Practice → IRS → Feature Preview → Sign Up (6 screens)
 * Flow (urgent):     Archetype → Practice → IRS → Feature Preview → Sign Up (5 screens, skip breathing)
 * Uses Supabase anonymous auth so Edge Function works before real signup.
 *
 * Research basis:
 *   - Calm data: breathing exercise = #1 drop-off point (~50%), skip for urgent seekers
 *   - Feature preview before signup: 2x engagement, 1.7x signups (HowdyGo)
 *   - Loss-framed CTAs: 21% conversion lift (McKinsey)
 *   - Nielsen Norman: 60% abandon pre-value registration
 */
export default function ArchetypeOnboarding() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const fromNursing = searchParams.get('from') === 'nursing'
  const [screen, setScreen] = useState(1)
  const [timeline, setTimeline] = useState(null)
  const [field, setField] = useState(fromNursing ? 'nursing' : null)
  const [archetype, setArchetype] = useState(null)
  const [archetypeConfig, setArchetypeConfig] = useState(null)
  const [practiceScore, setPracticeScore] = useState(null)
  const [practiceAnswer, setPracticeAnswer] = useState('')
  const [anonSessionReady, setAnonSessionReady] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)
  const hasInitialized = useRef(false)

  // Track screen views + time-on-screen when screen changes
  const screenTimerRef = useRef(null)
  useEffect(() => {
    // Track 'viewed' event for current screen
    trackOnboardingEvent(screen, 'viewed')

    // Start timer for this screen
    screenTimerRef.current = startScreenTimer(screen)

    // When screen changes, record time spent on previous screen
    return () => {
      if (screenTimerRef.current) {
        screenTimerRef.current()
        screenTimerRef.current = null
      }
    }
  }, [screen])

  // On mount: create anonymous session for Edge Function auth
  useEffect(() => {
    if (hasInitialized.current) return
    hasInitialized.current = true

    async function initAnonymousSession() {
      try {
        // Check if user already has a real session → redirect to app
        const { data: { session } } = await supabase.auth.getSession()
        if (session && !session.user.is_anonymous) {
          navigate('/app', { replace: true })
          return
        }

        // If no session or anonymous session, create anonymous
        if (!session) {
          const { error } = await supabase.auth.signInAnonymously()
          if (error) {
            console.error('Anonymous sign-in failed:', error.message)
          }
        }
        setAnonSessionReady(true)
      } catch (err) {
        console.error('Onboarding init error:', err)
        // Still allow onboarding to proceed — practice just won't have AI feedback
        setAnonSessionReady(true)
      } finally {
        setIsInitializing(false)
      }
    }

    initAnonymousSession()
  }, [navigate])

  // When user selects timeline + field, compute archetype
  const handleArchetypeDetection = useCallback(() => {
    if (!timeline) return
    const detected = getArchetype({ timeline, field: field || 'general' })
    const config = getArchetypeConfig(detected)
    setArchetype(detected)
    setArchetypeConfig(config)
    trackOnboardingEvent(1, 'completed', { timeline, field: field || 'general', archetype: detected })
    // Urgent seekers skip breathing exercise — go straight to practice
    // Research: Calm's breathing = ~50% drop-off. Urgent seekers want practice, not relaxation.
    if (detected === 'urgent_seeker') {
      setScreen(3)
    } else {
      setScreen(2)
    }
  }, [timeline, field])

  // After breathing exercise completes
  const handleBreathingComplete = useCallback(() => {
    setScreen(3)
  }, [])

  // After practice completes with a score
  const handlePracticeComplete = useCallback((score, answer) => {
    setPracticeScore(score)
    setPracticeAnswer(answer)
    setScreen(4)
  }, [])

  // After IRS baseline screen → Feature Preview
  const handleIRSContinue = useCallback(() => {
    setScreen(5)
  }, [])

  // After Feature Preview → Signup
  const handleFeaturePreviewContinue = useCallback(() => {
    setScreen(6)
  }, [])

  // After signup completes
  const handleSignUpComplete = useCallback(async () => {
    // Set tutorial as seen (skip Tutorial modal since onboarding replaces it)
    localStorage.setItem('isl_tutorial_seen', 'true')

    // Store archetype in user profile
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user && !user.is_anonymous) {
        await supabase.from('user_profiles').upsert({
          user_id: user.id,
          archetype: archetype,
          onboarding_completed_at: new Date().toISOString(),
          onboarding_field: field || 'general',
        }, { onConflict: 'user_id' })
      }
    } catch (err) {
      console.error('Failed to store archetype:', err)
    }

    trackOnboardingEvent(6, 'signup_completed', { archetype })

    // Navigate to appropriate post-onboarding route
    // Pass field so nursing users always land on /nursing regardless of archetype
    const route = getPostOnboardingRoute(archetype, field)
    navigate(route, { replace: true })
  }, [archetype, field, navigate])

  // Progress bar — urgent seekers skip breathing (5 screens), others have 6
  const totalScreens = archetype === 'urgent_seeker' ? 5 : 6
  // Map screen numbers to progress: for urgent seekers, screen 2 (breathing) is skipped
  // so we compute effective step position
  const effectiveScreen = (archetype === 'urgent_seeker' && screen >= 3) ? screen - 1 : screen
  const progress = (effectiveScreen / totalScreens) * 100

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 text-sm">Setting up your experience...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-slate-200">
        <div
          className="h-full bg-teal-500 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Logo — link back to landing page (signs out anonymous session) */}
      <div className="fixed top-3 left-4 z-50">
        <button
          onClick={async () => {
            await supabase.auth.signOut()
            navigate('/', { replace: true })
          }}
          className="text-sm font-bold text-slate-700 hover:text-teal-600 transition-colors flex items-center gap-1.5"
        >
          <span className="text-lg">🎯</span>
          <span>InterviewAnswers<span className="text-teal-500">.AI</span></span>
        </button>
      </div>

      {/* Sign-in link — signs out anonymous session before navigating */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={async () => {
            await supabase.auth.signOut()
            navigate('/login', { replace: true })
          }}
          className="text-sm text-slate-500 hover:text-teal-600 transition-colors"
        >
          Already have an account? <span className="font-medium">Sign in</span>
        </button>
      </div>

      {/* Screen content */}
      <div className="max-w-lg mx-auto px-4 pt-12 pb-8 min-h-screen flex flex-col">
        {screen === 1 && (
          <ScreenOne
            timeline={timeline}
            setTimeline={setTimeline}
            field={field}
            setField={setField}
            onContinue={handleArchetypeDetection}
            fromNursing={fromNursing}
          />
        )}

        {screen === 2 && (
          <BreathingExercise onComplete={handleBreathingComplete} />
        )}

        {screen === 3 && archetypeConfig && (
          <OnboardingPractice
            question={fromNursing ? NURSING_FIRST_QUESTION : archetypeConfig.firstQuestion}
            anonSessionReady={anonSessionReady}
            onComplete={handlePracticeComplete}
            fromNursing={fromNursing}
          />
        )}

        {screen === 4 && (
          <IRSBaseline
            practiceScore={practiceScore}
            onContinue={handleIRSContinue}
          />
        )}

        {screen === 5 && (
          <FeaturePreview
            fromNursing={fromNursing}
            practiceScore={practiceScore}
            onContinue={handleFeaturePreviewContinue}
          />
        )}

        {screen === 6 && (
          <SignUpPrompt
            archetype={archetype}
            archetypeConfig={archetypeConfig}
            practiceScore={practiceScore}
            fromNursing={fromNursing}
            onComplete={handleSignUpComplete}
          />
        )}
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────
// Screen 1: Archetype Detection
// ──────────────────────────────────────────────
function ScreenOne({ timeline, setTimeline, field, setField, onContinue, fromNursing }) {
  const [showField, setShowField] = useState(false)

  const handleTimelineSelect = (value) => {
    setTimeline(value)
    trackOnboardingEvent(1, 'timeline_selected', { timeline: value })
    // If nursing user (field already set), don't show field question
    if (!fromNursing) {
      setTimeout(() => setShowField(true), 300)
    }
  }

  // For nursing users: show Continue as soon as timeline is selected (field is pre-set)
  const canContinue = timeline && field

  return (
    <div className="flex-1 flex flex-col justify-center">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">
          Let's personalize your experience
        </h1>
        <p className="text-slate-500">
          {fromNursing
            ? 'One quick question so we can tailor your nursing interview prep.'
            : 'Two quick questions so we can help you the right way.'}
        </p>
      </div>

      {/* Question 1: Timeline */}
      <div className="mb-8">
        <p className="text-sm font-medium text-slate-600 mb-3">
          When is your next interview?
        </p>
        <div className="space-y-2">
          {TIMELINE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleTimelineSelect(opt.value)}
              className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all duration-200
                ${timeline === opt.value
                  ? 'border-teal-500 bg-teal-50 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{opt.emoji}</span>
                <div>
                  <span className="font-medium text-slate-800">{opt.label}</span>
                  <p className="text-xs text-slate-400 mt-0.5">{opt.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Question 2: Field (appears after timeline selected) — skipped for nursing users */}
      {showField && !fromNursing && (
        <div className="mb-8 animate-fadeIn">
          <p className="text-sm font-medium text-slate-600 mb-3">
            What field are you in?
          </p>
          <div className="grid grid-cols-2 gap-2">
            {FIELD_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => { setField(opt.value); trackOnboardingEvent(1, 'field_selected', { field: opt.value }); }}
                className={`px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all duration-200
                  ${field === opt.value
                    ? 'border-teal-500 bg-teal-50 text-teal-700 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-600'
                  }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Continue button */}
      {canContinue && (
        <div className="animate-fadeIn">
          <button
            onClick={onContinue}
            className="w-full py-3 px-6 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-teal-600/20"
          >
            Continue
          </button>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  )
}
