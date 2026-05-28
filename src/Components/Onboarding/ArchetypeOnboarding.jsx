import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { getArchetype, getArchetypeConfig, getPostOnboardingRoute, TIMELINE_OPTIONS, FIELD_OPTIONS, NURSING_FIRST_QUESTION } from '../../utils/archetypeRouter'
import { showNursingFeatures } from '../../utils/appTarget'
import { readLocalSession } from '../../utils/localSessionGuard'
import { trackOnboardingEvent, startScreenTimer } from '../../utils/onboardingTracker'
import useDocumentHead from '../../hooks/useDocumentHead'
// BreathingExercise no longer routed in onboarding (Sprint 2, Apr 2026).
// File preserved at ./BreathingExercise for possible reuse in settings/wellness.
import OnboardingPractice from './OnboardingPractice'
import IRSBaseline from './IRSBaseline'
import FeaturePreview from './FeaturePreview'
import SignUpPrompt from './SignUpPrompt'

/**
 * ArchetypeOnboarding — Phase 2: Value-First Onboarding
 *
 * Flow (all archetypes): Archetype → Practice → IRS → Feature Preview → Sign Up (5 screens)
 * Uses Supabase anonymous auth so Edge Function works before real signup.
 *
 * Research basis:
 *   - Calm data: breathing exercise = #1 drop-off point (~50%), skip for ALL archetypes (Sprint 2, Apr 2026)
 *   - Feature preview before signup: 2x engagement, 1.7x signups (HowdyGo)
 *   - Loss-framed CTAs: 21% conversion lift (McKinsey)
 *   - Nielsen Norman: 60% abandon pre-value registration
 *
 * Note: BreathingExercise.jsx is preserved (not deleted) — may be reused as a
 * settings/wellness feature later. This file just no longer routes into it.
 */
export default function ArchetypeOnboarding({ getSessionToken, getCurrentUser }) {
  useDocumentHead({
    title: 'Get Started | InterviewAnswers.ai',
    description: 'Start your personalized interview preparation journey with AI coaching.',
    robots: 'noindex, nofollow',
  })

  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  // Gate nursing URL flag by build target (Apple 4.3(a) compliance — general builds ignore ?from=nursing)
  const fromNursing = showNursingFeatures() && searchParams.get('from') === 'nursing'
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

  // Captures the established anon session so OnboardingPractice (and other
  // children) read the access_token WITHOUT calling the deadlock-prone
  // supabase.auth.getSession() inside their submit handlers. Audit 2026-05-28
  // identified the lack of this as the root cause of "fallback feedback every
  // time" — the /onboarding route renders this component without
  // getSessionToken/getCurrentUser props (App.jsx ~9876), so children fell back
  // to bare getSession() which deadlocks under lock contention, the practice
  // submit hit the 5s timeout-race in OnboardingPractice (PR #35), and the
  // generic 3/10 fallback fired every time. With sessionRef populated post
  // signInAnonymously() success, the token is read synchronously — no lock.
  const sessionRef = useRef(null)
  const getSessionTokenLocal = useCallback(
    () => Promise.resolve({ data: { session: sessionRef.current }, error: null }),
    []
  )

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

  // On mount: create anonymous session for Edge Function auth.
  // KEY GUARANTEE (audit 2026-05-28): setAnonSessionReady(true) fires ONLY
  // when a real session has been captured into sessionRef. The earlier P0
  // fix (PR #29, 2026-05-23) ALSO set anonSessionReady=true on the 3s
  // spinner-unblock fallback — that produced the "fallback feedback every
  // time" symptom: the timer would fire before signInAnonymously() finished,
  // anonSessionReady=true with no actual session, OnboardingPractice
  // submitted with no JWT, ai-feedback returned 500, the user always saw
  // the generic 3/10 fallback. Now the spinner unblocks at 8s regardless
  // (UX), but anonSessionReady stays false until a session truly lands —
  // the submit button stays gated, preventing the no-JWT submit.
  useEffect(() => {
    if (hasInitialized.current) return
    hasInitialized.current = true

    const fallbackTimer = setTimeout(() => {
      console.warn('⚠️ ArchetypeOnboarding: session init timed out after 8s — unblocking spinner; submit stays gated on real session')
      setIsInitializing(false)
    }, 8000)

    async function initAnonymousSession() {
      try {
        // FAST PATH: read localStorage directly before calling getSession().
        // The supabase SDK persists the session at sb-<ref>-auth-token. When
        // the GoTrue Web Lock deadlocks (Battle Scar from PRs #29/#35/#37/#39),
        // getSession() returns null even though the JWT is sitting right there
        // in localStorage. Without this fast-path, a returning logged-in
        // nursing user lands on /onboarding, the navigate-to-/nursing branch
        // never fires (because getSession() came back null), and they're
        // trapped on the practice screen with anonSessionReady=false → Get
        // Feedback permanently disabled. Direct localStorage read is
        // lock-free, synchronous, and reflects the canonical truth (since
        // that's where supabase-js persists the session).
        const stored = readLocalSession()
        if (stored.isValid && !stored.isAnonymous) {
          navigate(fromNursing ? '/nursing' : '/app', { replace: true })
          return
        }

        // No stored logged-in session → fall through to the existing path:
        // try getSession() (still useful for fresh tabs where the SDK is
        // unblocked), then sign in anonymously if no session exists.
        const { data: { session: existing } } = await supabase.auth.getSession()
        if (existing && !existing.user.is_anonymous) {
          navigate(fromNursing ? '/nursing' : '/app', { replace: true })
          return
        }

        let activeSession = existing
        if (!existing) {
          // signInAnonymously() returns the new session directly in data.session
          // — use that to avoid a second getSession() call (which could
          // re-enter the deadlock-prone lock).
          const { data, error } = await supabase.auth.signInAnonymously()
          if (error) {
            console.error('Anonymous sign-in failed:', error.message)
          } else {
            activeSession = data.session
          }
        }

        if (activeSession) {
          // Capture into sessionRef BEFORE marking ready, so any child that
          // reads getSessionTokenLocal() immediately on render has the token.
          sessionRef.current = activeSession
          setAnonSessionReady(true)
        }
        // If no activeSession (signInAnonymously errored), we deliberately do
        // NOT set anonSessionReady — the practice submit button stays disabled
        // rather than submitting without a JWT and getting the generic fallback.
      } catch (err) {
        console.error('Onboarding init error:', err)
        // Same: do not set anonSessionReady on error.
      } finally {
        clearTimeout(fallbackTimer)
        setIsInitializing(false)
      }
    }

    initAnonymousSession()

    return () => clearTimeout(fallbackTimer)
  }, [navigate, fromNursing])

  // When user selects timeline + field, compute archetype
  const handleArchetypeDetection = useCallback(() => {
    if (!timeline) return
    const detected = getArchetype({ timeline, field: field || 'general' })
    const config = getArchetypeConfig(detected)
    setArchetype(detected)
    setArchetypeConfig(config)
    trackOnboardingEvent(1, 'completed', { timeline, field: field || 'general', archetype: detected })
    // Skip breathing exercise for ALL archetypes — go straight to practice.
    // Research: Calm's breathing = ~50% drop-off (Sprint 2 fix, Apr 2026).
    // BreathingExercise.jsx is preserved for possible reuse as a settings/wellness feature.
    setScreen(3)
  }, [timeline, field])

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
      const user = getCurrentUser ? getCurrentUser() : (await supabase.auth.getUser()).data.user
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
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', 'conversion', { send_to: 'AW-17966963623/eihLCKPu9bMcEKe3qPdC' });
    }

    // Navigate to appropriate post-onboarding route
    // Pass field so nursing users always land on /nursing regardless of archetype
    const route = getPostOnboardingRoute(archetype, field)
    navigate(route, { replace: true })
  }, [archetype, field, navigate])

  // Progress bar — all archetypes skip breathing now (5 screens total).
  // Screen numbers remain 1, 3, 4, 5, 6 to avoid renumbering downstream screen constants;
  // we map screen→effective step position so the bar fills smoothly (1/5, 2/5, ...).
  const totalScreens = 5
  const effectiveScreen = screen >= 3 ? screen - 1 : screen
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

      {/* Logo — link back to landing page (signs out anonymous session).
          When in the nursing funnel, brand as NurseAnswerPro and route back
          to /nurse so the user stays inside the nursing flow they entered
          from. Without this gate, a nursing user saw "InterviewAnswers.AI"
          in the top-left and clicking it dumped them on the general / landing,
          breaking the funnel illusion and orphaning their session intent. */}
      <div className="fixed top-3 left-4 z-50">
        <button
          onClick={async () => {
            await supabase.auth.signOut()
            navigate(fromNursing ? '/nurse' : '/', { replace: true })
          }}
          className="text-sm font-bold text-slate-700 hover:text-teal-600 transition-colors flex items-center gap-1.5"
        >
          {fromNursing ? (
            <>
              <span className="text-lg">🩺</span>
              <span>NurseAnswerPro</span>
            </>
          ) : (
            <>
              <span className="text-lg">🎯</span>
              <span>InterviewAnswers<span className="text-teal-500">.AI</span></span>
            </>
          )}
        </button>
      </div>

      {/* Sign-in link — signs out anonymous session before navigating.
          Preserve ?from=nursing so AuthPage's back arrow returns to /nurse
          (not the general / landing). Without this, a nursing-funnel user
          clicking "Sign in" lands on /login with no context, and the in-page
          ← Back button routes them out of the nursing flow. */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={async () => {
            await supabase.auth.signOut()
            navigate(fromNursing ? '/login?from=nursing' : '/login', { replace: true })
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

        {/* screen === 2 (BreathingExercise) removed — Sprint 2 Apr 2026.
            Screen number 2 is now a no-op; handleArchetypeDetection jumps 1 → 3. */}

        {screen === 3 && archetypeConfig && (
          <OnboardingPractice
            question={fromNursing ? NURSING_FIRST_QUESTION : archetypeConfig.firstQuestion}
            anonSessionReady={anonSessionReady}
            onComplete={handlePracticeComplete}
            fromNursing={fromNursing}
            getSessionToken={getSessionToken || getSessionTokenLocal}
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
          Two quick questions so we can help you the right way.
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

      {/* Question 2: Field (appears after timeline selected) */}
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
