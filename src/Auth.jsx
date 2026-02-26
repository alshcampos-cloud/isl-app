import { useState } from 'react'
import { supabase } from './lib/supabase'
import { Mail, Lock, User, AlertCircle, CheckCircle } from 'lucide-react'
import { trackSignUp } from './utils/googleAdsTracking'

function Auth({ onAuthSuccess, defaultMode = 'login', onBack = null, fromNursing = false }) {
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
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}${fromNursing ? '/nursing' : '/app'}`,
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-sky-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        {/* Back link */}
        {onBack && (
          <button
            onClick={onBack}
            className="text-sm text-gray-500 hover:text-indigo-600 mb-4 flex items-center gap-1 transition-colors"
          >
            ← Back
          </button>
        )}

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h1>
          <p className="text-gray-600">
            {isSignUp
              ? (fromNursing ? 'Sign up for NurseInterviewPro' : 'Sign up for InterviewAnswers.ai')
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

        <form onSubmit={handleAuth} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required={isSignUp}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="John Doe"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>
            {isSignUp && password.length > 0 && (
              <div className="mt-2 space-y-1">
                <p className={`text-xs ${password.length >= 8 ? 'text-green-600' : 'text-gray-400'}`}>
                  {password.length >= 8 ? '✓' : '○'} At least 8 characters
                </p>
                <p className={`text-xs ${/[A-Z]/.test(password) ? 'text-green-600' : 'text-gray-400'}`}>
                  {/[A-Z]/.test(password) ? '✓' : '○'} One uppercase letter
                </p>
                <p className={`text-xs ${/[0-9]/.test(password) ? 'text-green-600' : 'text-gray-400'}`}>
                  {/[0-9]/.test(password) ? '✓' : '○'} One number
                </p>
                <p className={`text-xs ${/[^A-Za-z0-9]/.test(password) ? 'text-green-600' : 'text-gray-400'}`}>
                  {/[^A-Za-z0-9]/.test(password) ? '✓' : '○'} One special character (recommended)
                </p>
              </div>
            )}
            {isSignUp && !password && (
              <p className="text-xs text-gray-500 mt-1">
                At least 8 characters
              </p>
            )}
          </div>

          {isSignUp && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
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
                  className="mt-1 w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                />
                <span className="text-sm text-gray-600">
                  I agree to the{' '}
                  <a
                    href="https://interviewanswers.ai/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-teal-600 hover:text-teal-700 underline"
                  >
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a
                    href="https://interviewanswers.ai/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
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
            className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-bold py-3 rounded-lg disabled:opacity-50 transition shadow-md"
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
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full">
              <h2 className="text-2xl font-bold mb-4">Reset Password</h2>
              <p className="text-gray-600 mb-6">
                Enter your email and we'll send you a reset link.
              </p>
              <form onSubmit={handlePasswordReset} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowPasswordReset(false)}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg disabled:opacity-50"
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