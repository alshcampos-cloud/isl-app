import { useState, useCallback } from 'react'
import { supabase } from './lib/supabase'
import { Mail, Lock, User, AlertCircle, CheckCircle } from 'lucide-react'
import { trackSignUp } from './utils/googleAdsTracking'
import { getDeviceFingerprint, hashEmail } from './utils/deviceFingerprint'
import GoogleSignInButton from './Components/GoogleSignInButton'
import { startGoogleOAuth } from './utils/googleOAuth'
import { isNativeApp } from './utils/platform'
import { showNursingFeatures } from './utils/appTarget'
import { isDisposableEmail } from './utils/disposableEmail'

function Auth({ onAuthSuccess, defaultMode = 'login', onBack = null, fromNursing: fromNursingProp = false }) {
  // Belt-and-suspenders: ignore fromNursing on general builds (Apple 4.3(a) compliance)
  const fromNursing = showNursingFeatures() && fromNursingProp
  const [loading, setLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(defaultMode === 'signup')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)

  const [showPasswordReset, setShowPasswordReset] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const handleGoogleSignIn = useCallback(async () => {
    setGoogleLoading(true)
    setError(null)

    const { error: oauthError } = await startGoogleOAuth({
      fromNursing,
    })

    if (oauthError) {
      setError(oauthError)
      setGoogleLoading(false)
    }
    // If no error, browser is redirecting to Google — don't reset loading
  }, [fromNursing])

  const handleAuth = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      if (isSignUp && password !== confirmPassword) {
        setError('Passwords do not match')
        setLoading(false)
        return
      }

      if (isSignUp) {
        // Block disposable/throwaway emails to prevent account-hopping abuse
        if (isDisposableEmail(email)) {
          setError("Please use a permanent email address to save your progress.");
          setLoading(false);
          return;
        }

        // Sign up
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/confirm`,
            data: {
              full_name: fullName
            }
          }
        })

        if (error) throw error

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

        setMessage('Check your email for the verification link!')
      } else {
        // Login
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        })

        if (error) throw error

        if (onAuthSuccess) onAuthSuccess(data.user)
      }
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }
  const handlePasswordReset = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      // IMPORTANT (Apr 26, 2026): redirect to /auth/reset, NOT /app or /nursing.
      // Supabase's PKCE flow strips type=recovery from the final landing URL
      // and only forwards ?code=<auth_code>. A dedicated /auth/reset route
      // means any ?code= arriving there is unambiguously a recovery code
      // (no Stripe/OAuth false positives). See src/Components/AuthReset.jsx
      // for the full explanation.
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset`,
      })

      if (error) throw error

      setMessage('Password reset link sent! Check your email.')
      setShowPasswordReset(false)
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(to bottom right, #fafaf8, #f5f5f0, #f0f4f8)' }}>
      <div className="bg-white rounded-2xl p-8 max-w-md w-full border border-warm-200/60" style={{ boxShadow: '0 16px 48px -8px rgba(0,0,0,0.08), 0 0 0 1px rgba(232,232,224,0.3)' }}>
        {/* Back link. Uses a plain <a href> instead of <button onClick>.
            Why: founder reported the button click was a no-op. Anchors with
            href do a full browser navigation (or React Router picks it up
            via the <Link> children) — can't be stuck by stale React state
            or synthetic event weirdness. Forces a clean page load back to /. */}
        {onBack && (
          <a
            href="/"
            className="text-sm text-warm-500 hover:text-teal-600 mb-4 inline-flex items-center gap-1 transition-colors cursor-pointer no-underline"
          >
            ← Back
          </a>
        )}

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-warm-800 mb-2">
            {isSignUp ? 'Create Account' : 'Welcome'}
          </h1>
          <p className="text-warm-500 font-medium">
            {isSignUp
              ? (fromNursing ? 'Sign up for NurseAnswerPro' : 'Sign up for InterviewAnswers.ai')
              : 'Log in to continue'}
          </p>
        </div>

        {message && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-green-800 text-sm">{message}</p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Google Sign-In — web only, not in native Capacitor app */}
        {!isNativeApp() && (
          <>
            <div className="mb-6">
              <GoogleSignInButton
                onClick={handleGoogleSignIn}
                loading={googleLoading}
                label={isSignUp ? 'Sign up with Google' : 'Sign in with Google'}
              />
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-px bg-warm-200" />
              <span className="text-xs text-warm-400 font-medium uppercase tracking-wider">or</span>
              <div className="flex-1 h-px bg-warm-200" />
            </div>
          </>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-sm font-medium text-warm-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-warm-400" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required={isSignUp}
                  className="w-full pl-10 pr-4 py-3 border border-warm-200 rounded-xl focus:ring-2 focus:ring-teal-300/50 focus:border-teal-300 transition-all duration-200"
                  placeholder="John Doe"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-warm-700 mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-warm-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 border border-warm-200 rounded-xl focus:ring-2 focus:ring-teal-300/50 focus:border-teal-300 transition-all duration-200"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-warm-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-warm-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full pl-10 pr-4 py-3 border border-warm-200 rounded-xl focus:ring-2 focus:ring-teal-300/50 focus:border-teal-300 transition-all duration-200"
                placeholder="••••••••"
              />
            </div>
            {isSignUp && password.length > 0 && (
              <div className="mt-2 space-y-1">
                <p className={`text-xs ${password.length >= 8 ? 'text-green-600' : 'text-warm-400'}`}>
                  {password.length >= 8 ? '✓' : '○'} At least 8 characters
                </p>
                <p className={`text-xs ${/[A-Z]/.test(password) ? 'text-green-600' : 'text-warm-400'}`}>
                  {/[A-Z]/.test(password) ? '✓' : '○'} One uppercase letter
                </p>
                <p className={`text-xs ${/[0-9]/.test(password) ? 'text-green-600' : 'text-warm-400'}`}>
                  {/[0-9]/.test(password) ? '✓' : '○'} One number
                </p>
                <p className={`text-xs ${/[^A-Za-z0-9]/.test(password) ? 'text-green-600' : 'text-warm-400'}`}>
                  {/[^A-Za-z0-9]/.test(password) ? '✓' : '○'} One special character (recommended)
                </p>
              </div>
            )}
            {isSignUp && !password && (
              <p className="text-xs text-warm-400 mt-1">
                At least 8 characters
              </p>
            )}
          </div>

          {isSignUp && (
            <div>
              <label className="block text-sm font-medium text-warm-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-warm-400" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-warm-200 rounded-xl focus:ring-2 focus:ring-teal-300/50 focus:border-teal-300 transition-all duration-200"
                  placeholder="••••••••"
                />
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-red-500 mt-1">Passwords don't match</p>
              )}
              {confirmPassword && password === confirmPassword && confirmPassword.length > 0 && (
                <p className="text-xs text-green-600 mt-1">✓ Passwords match</p>
              )}
            </div>
          )}

          {isSignUp && (
            <div className="space-y-3 pt-2">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 text-teal-600 border-warm-300 rounded focus:ring-teal-500"
                />
                <span className="text-sm text-warm-600">
                  I agree to the{' '}
                  <a
                    href="/terms"
                    className="text-teal-600 hover:text-teal-700 underline"
                  >
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a
                    href="/privacy"
                    className="text-teal-600 hover:text-teal-700 underline"
                  >
                    Privacy Policy
                  </a>
                  , and confirm I am 13 years or older.
                </span>
              </label>
            </div>
          )}

<button
            type="submit"
            disabled={loading || (isSignUp && !agreedToTerms)}
            className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-bold py-3.5 rounded-2xl disabled:opacity-50 transition-all duration-200 active:scale-[0.97]"
            style={{ boxShadow: '0 4px 12px -2px rgba(13, 148, 136, 0.3)' }}
          >
            {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Log In'}
          </button>
        </form>

        {!isSignUp && (
          <div className="mt-4 text-center">
            <button
              onClick={() => setShowPasswordReset(true)}
              className="text-sm text-teal-600 hover:text-teal-700"
            >
              Forgot password?
            </button>
          </div>
        )}

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp)
              setError(null)
              setMessage(null)
              setConfirmPassword('')
            }}
            className="text-teal-600 hover:text-teal-700 font-medium"
          >
            {isSignUp
              ? 'Already have an account? Log in'
              : "Don't have an account? Sign up"}
          </button>
        </div>

        {showPasswordReset && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full border border-warm-200/60" style={{ boxShadow: '0 16px 48px -8px rgba(0,0,0,0.12)' }}>
              <h2 className="text-2xl font-bold text-warm-800 mb-4">Reset Password</h2>
              <p className="text-warm-500 mb-6">
                Enter your email and we'll send you a reset link.
              </p>
              <form onSubmit={handlePasswordReset} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-warm-700 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-warm-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-warm-200 rounded-xl focus:ring-2 focus:ring-teal-300/50 focus:border-teal-300 transition-all duration-200"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowPasswordReset(false)}
                    className="flex-1 bg-warm-100 hover:bg-warm-200 text-warm-700 font-semibold py-3 rounded-xl transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-semibold py-3 rounded-xl disabled:opacity-50 transition-all duration-200 active:scale-[0.97]"
                  >
                    {loading ? 'Sending...' : 'Send Reset Link'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Auth