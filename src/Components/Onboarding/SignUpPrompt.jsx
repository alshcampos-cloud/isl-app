import React, { useState, useRef, useCallback, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CheckCircle } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { trackOnboardingEvent } from '../../utils/onboardingTracker'
import { trackSignUp } from '../../utils/googleAdsTracking'
import { getDeviceFingerprint, hashEmail } from '../../utils/deviceFingerprint'
import GoogleSignInButton from '../GoogleSignInButton'
import { startGoogleOAuth } from '../../utils/googleOAuth'
import { isNativeApp } from '../../utils/platform'
import { showNursingFeatures } from '../../utils/appTarget'

/**
 * SignUpPrompt — Screen 6: Create Account to Save Progress
 *
 * Loss-framed copy: "Your results are ready" + "Save My Results" CTA.
 * Research: loss-framed CTAs 21% conversion lift (McKinsey),
 * first-person CTAs 202% lift (HubSpot).
 *
 * SECURITY: Uses signUp() (not updateUser()) to create real accounts.
 * updateUser() on anonymous users has a known Supabase bug (#29350) that
 * auto-confirms emails without the user clicking the confirmation link,
 * allowing fake emails to access the platform.
 *
 * Trade-off: anonymous user's onboarding data is not preserved (new user ID).
 * But proper email verification is non-negotiable for platform security.
 */

export default function SignUpPrompt({ archetype, archetypeConfig, practiceScore, fromNursing: fromNursingProp = false, onComplete }) {
  // Belt-and-suspenders — general builds ignore fromNursing entirely
  const fromNursing = showNursingFeatures() && fromNursingProp
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  // confirmPassword field removed (Sprint 2, Apr 2026) — modern best-practice is
  // single password field + show-password toggle. Password strength rules still apply.
  const [fullName, setFullName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const [signUpSuccess, setSignUpSuccess] = useState(false)
  const hasTrackedFormStart = useRef(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [googleError, setGoogleError] = useState(null)
  // Sprint 5 (Apr 2026): Email form is always visible but visually demoted.
  // Google SSO is the dominant CTA (h-14 + shadow); email inputs are h-10, muted,
  // and the submit button is gray (no gradient). Ratio = 1.4× taller SSO.

  // Sprint 5 / Task B: show a commitment banner if the user tapped the 14-day
  // commit button on IRSBaseline earlier in the onboarding flow.
  const [isCommitted, setIsCommitted] = useState(false)
  useEffect(() => {
    try {
      // Coder 2 writes 'isl_14day_commit' in IRSBaseline.jsx when user taps commit button.
      // Key may not exist on first pass — fall through to default CTA.
      const raw = localStorage.getItem('isl_14day_commit')
      if (!raw) return
      const parsed = JSON.parse(raw)
      if (parsed?.committed === true) setIsCommitted(true)
    } catch {
      // Malformed JSON or localStorage unavailable (Safari private mode) — default CTA
    }
  }, [])

  const handleGoogleSignIn = useCallback(async () => {
    setGoogleLoading(true)
    setGoogleError(null)
    trackOnboardingEvent(6, 'google_signin_clicked')

    const { error } = await startGoogleOAuth({
      fromNursing,
      archetype,
    })

    if (error) {
      setGoogleError(error)
      setGoogleLoading(false)
    }
    // If no error, browser is redirecting to Google — don't reset loading
  }, [fromNursing, archetype])

  const handleSignUp = useCallback(async (e) => {
    e.preventDefault()
    if (!email.trim() || !password.trim()) return

    // confirmPassword check removed (Sprint 2). Show-password toggle lets
    // users verify their password; 8-char minLength + strength hints still enforced.

    setIsLoading(true)
    setError(null)

    try {
      // SECURITY FIX: Use signUp() instead of updateUser() to create the account.
      // updateUser() on anonymous users has a known Supabase bug (GitHub #29350)
      // that auto-confirms the email without the user clicking the confirmation link.
      // This allowed fake emails to access the platform.
      //
      // Trade-off: onboarding data linked to the anonymous user ID is not preserved.
      // But security > convenience. The user will get a fresh account after confirming.

      // Step 1: Sign out the anonymous session
      await supabase.auth.signOut()

      // Step 2: Create a real account with signUp() — this properly requires email confirmation
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password: password.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm`,
          data: {
            full_name: fullName.trim() || undefined,
            archetype: archetype,
            onboarding_field: fromNursing ? 'nursing' : 'general',
          },
        },
      })

      if (signUpError) {
        if (signUpError.message.includes('already') || signUpError.message.includes('exists')) {
          setError('An account with this email already exists. Try signing in instead.')
          trackOnboardingEvent(6, 'signup_error', { error: 'email_exists' })
          return
        }
        throw signUpError
      }

      // Success — signUp() sends a confirmation email.
      // email_confirmed_at will be null until the user clicks the link.
      // ProtectedRoute.jsx will block access to /app until confirmed.
      //
      // IMPORTANT: Set tutorial-seen and onboarding field NOW, before the user
      // leaves to check email. handleSignUpComplete in ArchetypeOnboarding never
      // fires because the user navigates away to confirm their email first.
      localStorage.setItem('isl_tutorial_seen', 'true')
      if (fromNursing) {
        localStorage.setItem('isl_onboarding_field', 'nursing')
      }
      trackOnboardingEvent(6, 'signup_completed', { archetype })
      trackSignUp() // Google Ads conversion

      // Abuse tracking — non-blocking, must never break signup flow
      try {
        const fingerprint = await getDeviceFingerprint();
        const emailH = await hashEmail(email);
        const domain = email.split('@')[1]?.toLowerCase() || '';

        // Check for abuse
        const { data: abuseCheck } = await supabase.rpc('check_signup_abuse', {
          p_fingerprint: fingerprint, p_email_hash: emailH
        });

        // Record signal
        if (data?.user?.id) {
          await supabase.rpc('record_signup_signal', {
            p_fingerprint: fingerprint, p_email_hash: emailH,
            p_email_domain: domain, p_user_id: data.user.id
          });
        }

        // Flag abuse if detected
        if (abuseCheck?.reduced_tier && data?.user?.id) {
          await supabase.from('user_profiles')
            .update({ abuse_reduced_tier: true })
            .eq('user_id', data.user.id);
        }
      } catch (err) {
        console.warn('[Abuse] Signal recording failed:', err.message);
        // Non-blocking — don't break signup flow
      }

      setSignUpSuccess(true)
    } catch (err) {
      console.error('Sign up error:', err)
      setError(err.message || 'Something went wrong. Please try again.')
      trackOnboardingEvent(6, 'signup_error', { error: err.message })
    } finally {
      setIsLoading(false)
    }
  }, [email, password, fullName, archetype, fromNursing, onComplete])

  // After successful signup, show confirmation screen
  if (signUpSuccess) {
    return (
      <div className="flex-1 flex flex-col justify-center">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-teal-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-slate-800 mb-2">
            Check your email
          </h2>

          <p className="text-slate-500 text-sm max-w-xs mx-auto mb-2">
            We sent a confirmation link to:
          </p>

          <p className="text-teal-600 font-semibold mb-6">
            {email}
          </p>

          <p className="text-slate-400 text-xs max-w-xs mx-auto mb-8">
            Click the link in the email to activate your account. Check your spam folder if you don't see it.
          </p>
        </div>

        <button
          onClick={async () => {
            // Sign out any session and redirect to login
            // Preserve nursing context so AuthPage routes to /nursing after sign-in
            await supabase.auth.signOut()
            navigate(fromNursing ? '/login?from=nursing' : '/login', { replace: true })
          }}
          className="w-full py-3 px-6 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-teal-600/20"
        >
          Go to Sign In
        </button>

        <p className="text-center text-xs text-slate-400 mt-4">
          After confirming your email, sign in to access your account.
        </p>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col justify-center">
      <div className="text-center mb-8">
        <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-teal-100 flex items-center justify-center">
          <svg className="w-7 h-7 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-slate-800 mb-2">
          Your results are ready
        </h2>

        <p className="text-slate-500 text-sm max-w-xs mx-auto">
          {practiceScore
            ? `You scored ${practiceScore}/10 on your first practice — create a free account to keep your results and continue improving.`
            : 'Create a free account to save your progress and keep practicing.'}
        </p>
      </div>

      {/* What you get with a free account — actual free tier features */}
      <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 mb-6">
        <p className="text-sm text-teal-700 font-medium mb-2">Your free account includes each month:</p>
        <ul className="text-sm text-teal-600 space-y-1.5">
          <li className="flex items-start gap-2">
            <span className="mt-0.5">🎙️</span>
            <span>3 AI Mock Interviewer sessions</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5">📝</span>
            <span>10 Practice Mode sessions</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5">💡</span>
            <span>5 Answer Assistant sessions</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5">❓</span>
            <span>5 AI-generated custom questions</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5">📋</span>
            <span>10 Practice Prompter questions</span>
          </li>
        </ul>
        <p className="text-sm text-teal-700 font-medium mt-4 mb-2">Always included:</p>
        <ul className="text-sm text-teal-600 space-y-1.5">
          <li className="flex items-start gap-2">
            <span className="mt-0.5">📊</span>
            <span>STAR method coaching with detailed scoring</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5">📚</span>
            <span>50+ interview flashcards (unlimited)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5">📈</span>
            <span>Interview Readiness Score tracking</span>
          </li>
        </ul>
      </div>

      {/*
        Sprint 2 (Apr 2026): Google SSO is now the primary, visually dominant CTA.
        Email signup is collapsed behind a "Sign up with email instead" disclosure.
        Rationale: SSO = 1 click, email = 3 fields. Reducing friction for the 90%
        should materially improve signup conversion.
      */}

      {/* Commitment banner — shown if user tapped the 14-day commit button on IRSBaseline */}
      {isCommitted && (
        <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 mb-5">
          <div className="flex items-center gap-2 text-sm font-medium text-teal-900">
            <CheckCircle className="w-4 h-4 text-teal-600" />
            Your 14-day practice plan is ready
          </div>
          <p className="text-xs text-teal-700 mt-1">
            Sign up in 10 seconds to save your progress and start Day 1.
          </p>
        </div>
      )}

      {/* Google Sign-In — primary CTA, web only (not in native Capacitor app) */}
      {!isNativeApp() && (
        <>
          <GoogleSignInButton
            onClick={handleGoogleSignIn}
            loading={googleLoading}
            label="Continue with Google"
          />

          {googleError && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 text-center mt-3">
              {googleError}
            </p>
          )}

          <p className="text-center text-xs text-slate-400 mt-3">
            By continuing, you agree to our{' '}
            <Link to="/terms" className="underline hover:text-slate-500">Terms</Link> and{' '}
            <Link to="/privacy" className="underline hover:text-slate-500">Privacy Policy</Link>.
          </p>
        </>
      )}

      {/* Divider — demote signal (per Researcher spec) */}
      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs uppercase tracking-wider text-gray-400">or use email</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {/* Sign up form — always visible but visually demoted (h-10 inputs, gray submit) */}
      <form onSubmit={handleSignUp} className="space-y-3">
        <div>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Full name (optional)"
            className="w-full h-10 px-3 text-sm rounded-xl border border-gray-200 bg-gray-50 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 focus:bg-white"
            autoComplete="name"
          />
        </div>

        <div>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (!hasTrackedFormStart.current && e.target.value.trim().length > 0) {
                hasTrackedFormStart.current = true
                trackOnboardingEvent(6, 'form_started')
              }
            }}
            placeholder="Email address"
            required
            className="w-full h-10 px-3 text-sm rounded-xl border border-gray-200 bg-gray-50 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 focus:bg-white"
            autoComplete="email"
          />
        </div>

        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create a password"
            required
            minLength={8}
            className="w-full h-10 px-3 text-sm rounded-xl border border-gray-200 bg-gray-50 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 focus:bg-white pr-10"
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-500"
          >
            {showPassword ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            )}
          </button>
        </div>

        {/* Password strength guidance */}
        {password.length > 0 && (
          <div className="mt-2 space-y-1">
            <p className={`text-xs ${password.length >= 8 ? 'text-teal-600' : 'text-slate-300'}`}>
              {password.length >= 8 ? '✓' : '○'} At least 8 characters
            </p>
            <p className={`text-xs ${/[A-Z]/.test(password) ? 'text-teal-600' : 'text-slate-300'}`}>
              {/[A-Z]/.test(password) ? '✓' : '○'} One uppercase letter
            </p>
            <p className={`text-xs ${/[0-9]/.test(password) ? 'text-teal-600' : 'text-slate-300'}`}>
              {/[0-9]/.test(password) ? '✓' : '○'} One number
            </p>
            <p className={`text-xs ${/[^A-Za-z0-9]/.test(password) ? 'text-teal-600' : 'text-slate-300'}`}>
              {/[^A-Za-z0-9]/.test(password) ? '✓' : '○'} One special character (recommended)
            </p>
          </div>
        )}

        {/*
          Confirm password field removed (Sprint 2, Apr 2026).
          Users verify their password via the show-password toggle above.
          Password strength hints + 8-char minLength still enforced.
        */}

        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isLoading || !email.trim() || !password.trim() || password.length < 8}
          className={`w-full h-10 px-4 rounded-xl text-sm font-medium transition-colors border
            ${!isLoading && email.trim() && password.trim() && password.length >= 8
              ? 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              : 'bg-gray-50 border-gray-200 text-gray-300 cursor-not-allowed'
            }`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              Creating account...
            </span>
          ) : (
            'Save My Results'
          )}
        </button>
      </form>

      <p className="text-xs text-slate-400 text-center mt-4">
        By creating an account, you agree to our{' '}
        <Link to="/terms" className="underline hover:text-slate-500">Terms</Link> and{' '}
        <Link to="/privacy" className="underline hover:text-slate-500">Privacy Policy</Link>.
      </p>

      {/* Sign in link — always visible */}
      <p className="text-sm text-slate-500 text-center mt-6">
        Already have an account?{' '}
        <Link to={fromNursing ? '/login?from=nursing' : '/login'} className="text-teal-600 font-medium hover:text-teal-700" onClick={() => trackOnboardingEvent(6, 'signin_clicked')}>
          Sign in
        </Link>
      </p>
    </div>
  )
}
