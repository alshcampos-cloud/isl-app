import React, { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

/**
 * SignUpPrompt — Screen 5: Create Account to Save Progress
 *
 * Uses Supabase updateUser() to promote anonymous user to real account.
 * This preserves the same user ID, so any data created during onboarding
 * (practice sessions, scores) stays linked to the account.
 *
 * "Create an account to save your progress and start your 7-day free Pro trial."
 * Value already demonstrated — signup preserves what they built.
 */

export default function SignUpPrompt({ archetype, archetypeConfig, onComplete }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showPassword, setShowPassword] = useState(false)

  const handleSignUp = useCallback(async (e) => {
    e.preventDefault()
    if (!email.trim() || !password.trim()) return

    setIsLoading(true)
    setError(null)

    try {
      // Promote anonymous user to real account using updateUser
      // This preserves the same user ID + any onboarding data
      const { data, error: updateError } = await supabase.auth.updateUser({
        email: email.trim(),
        password: password.trim(),
        data: {
          full_name: fullName.trim() || undefined,
          archetype: archetype,
        },
      })

      if (updateError) {
        // If updateUser fails (e.g., email already exists), try regular signup
        if (updateError.message.includes('already') || updateError.message.includes('exists')) {
          setError('An account with this email already exists. Try signing in instead.')
          return
        }
        throw updateError
      }

      // Success — onComplete will store archetype + navigate
      onComplete()
    } catch (err) {
      console.error('Sign up error:', err)
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [email, password, fullName, archetype, onComplete])

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
          Save your progress
        </h2>

        <p className="text-slate-500 text-sm max-w-xs mx-auto">
          Create a free account to keep your score, track your improvement, and unlock more practice questions.
        </p>
      </div>

      {/* What you'll lose without signup */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
        <p className="text-sm text-amber-700 font-medium mb-2">Without an account, you'll lose:</p>
        <ul className="text-sm text-amber-600 space-y-1">
          <li className="flex items-start gap-2">
            <span className="mt-0.5">{'>'}</span>
            <span>Your Interview Readiness Score baseline</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5">{'>'}</span>
            <span>Your practice session and feedback</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5">{'>'}</span>
            <span>Your personalized learning path</span>
          </li>
        </ul>
      </div>

      {/* Sign up form */}
      <form onSubmit={handleSignUp} className="space-y-4">
        <div>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Full name (optional)"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-700 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
            autoComplete="name"
          />
        </div>

        <div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            required
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-700 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
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
            minLength={6}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-700 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 pr-12"
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-500"
          >
            {showPassword ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            )}
          </button>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isLoading || !email.trim() || !password.trim()}
          className={`w-full py-3 px-6 rounded-xl font-semibold transition-all
            ${!isLoading && email.trim() && password.trim()
              ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-600/20'
              : 'bg-slate-100 text-slate-300 cursor-not-allowed'
            }`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Creating account...
            </span>
          ) : (
            'Create free account'
          )}
        </button>
      </form>

      {/* Terms and sign in link */}
      <div className="mt-6 text-center space-y-3">
        <p className="text-xs text-slate-400">
          By creating an account, you agree to our{' '}
          <Link to="/terms" className="underline hover:text-slate-500">Terms</Link> and{' '}
          <Link to="/privacy" className="underline hover:text-slate-500">Privacy Policy</Link>.
        </p>

        <p className="text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="text-teal-600 font-medium hover:text-teal-700">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
