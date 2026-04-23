import { useEffect, useState, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { consumeOAuthContext } from '../utils/googleOAuth'
import { trackSignUp } from '../utils/googleAdsTracking'

/**
 * OAuthCallback — handles /auth/callback after Google OAuth redirect.
 *
 * Flow:
 * 1. Google authenticates user → redirects to Supabase callback
 * 2. Supabase processes the auth → redirects to /auth/callback (this page)
 * 3. This component detects the session using multiple strategies
 *    (same approach as AuthConfirm.jsx's battle-tested 6-strategy pattern)
 * 4. Routes user to /nursing or /app based on saved context
 *
 * New vs returning user detection:
 * - Compares created_at to now — if <60 seconds ago, it's a new user
 * - Only new users fire trackSignUp() (prevents duplicate Google Ads conversions)
 */
export default function OAuthCallback() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState('loading') // loading | success | error
  const [errorMsg, setErrorMsg] = useState('')
  const statusRef = useRef('loading')
  const hasProcessed = useRef(false)

  useEffect(() => {
    // Prevent double-processing in React strict mode
    if (hasProcessed.current) return
    hasProcessed.current = true

    const setStatusSafe = (newStatus, msg) => {
      if (statusRef.current === 'success') return
      statusRef.current = newStatus
      setStatus(newStatus)
      if (msg) setErrorMsg(msg)
    }

    const handleOAuthReturn = async () => {
      try {
        const code = searchParams.get('code')

        // Strategy 1: Check for existing session (Supabase may have already processed the hash)
        const { data: { session } } = await supabase.auth.getSession()

        if (session?.user) {
          console.log('[OAuthCallback] Session found on first check')
          handleSessionFound(session.user)
          return
        }

        // Strategy 2: PKCE code exchange (Supabase sends ?code=xxx)
        if (code) {
          console.log('[OAuthCallback] PKCE code detected, exchanging...')
          try {
            const { data, error } = await supabase.auth.exchangeCodeForSession(code)
            if (!error && data?.session?.user) {
              console.log('[OAuthCallback] Session established via code exchange')
              handleSessionFound(data.session.user)
              return
            }
            if (error) console.error('[OAuthCallback] Code exchange error:', error)
          } catch (e) {
            console.error('[OAuthCallback] Code exchange exception:', e)
          }
        }

        // Strategy 3: Wait and retry (timing race with detectSessionInUrl)
        await new Promise(r => setTimeout(r, 2000))
        const { data: { session: retrySession } } = await supabase.auth.getSession()

        if (retrySession?.user) {
          console.log('[OAuthCallback] Session found on retry')
          handleSessionFound(retrySession.user)
          return
        }

        // Strategy 4: Listen for auth state change
        console.log('[OAuthCallback] Listening for auth state change...')
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
          if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && newSession?.user) {
            console.log('[OAuthCallback] Auth state change:', event)
            handleSessionFound(newSession.user)
            subscription.unsubscribe()
          }
        })

        // Strategy 5: Graceful fallback after 8 seconds
        setTimeout(() => {
          subscription.unsubscribe()
          if (statusRef.current === 'loading') {
            console.warn('[OAuthCallback] Timeout — redirecting to /app as fallback')
            // OAuth likely succeeded but session detection failed
            // Better to send to app (ProtectedRoute will handle) than show error
            setStatusSafe('success')
            navigate('/app', { replace: true })
          }
        }, 8000)
      } catch (err) {
        console.error('[OAuthCallback] Exception:', err)
        setStatusSafe('error', err.message || 'Something went wrong.')
        setTimeout(() => navigate('/login', { replace: true }), 3000)
      }
    }

    const handleSessionFound = (user) => {
      setStatusSafe('success')

      // Detect new vs returning user
      const createdAt = new Date(user.created_at)
      const now = new Date()
      const isNewUser = (now - createdAt) < 60000 // Created less than 60 seconds ago

      if (isNewUser) {
        console.log('[OAuthCallback] New user detected — firing trackSignUp()')
        trackSignUp()
      } else {
        console.log('[OAuthCallback] Returning user — skipping trackSignUp()')
      }

      // Read context saved by startGoogleOAuth()
      const context = consumeOAuthContext()

      // Also check user_metadata (belt-and-suspenders)
      const metaField = user.user_metadata?.onboarding_field
      const localField = localStorage.getItem('isl_onboarding_field')

      // Determine destination
      const isNursing = context?.fromNursing || metaField === 'nursing' || localField === 'nursing'
      const destination = isNursing ? '/nursing' : '/app'

      console.log('[OAuthCallback] Routing to:', destination, { context, metaField, localField })

      // Short delay for UX (show success state briefly)
      setTimeout(() => {
        navigate(destination, { replace: true })
      }, 1000)
    }

    handleOAuthReturn()
  }, [navigate, searchParams])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-sky-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
        {status === 'loading' && (
          <>
            <div className="w-12 h-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-800 mb-2">Signing you in...</h2>
            <p className="text-slate-500 text-sm">Just a moment while we set up your account.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-slate-800 mb-2">You're all set!</h2>
            <p className="text-slate-500 text-sm">Redirecting you now...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-slate-800 mb-2">Something went wrong</h2>
            <p className="text-slate-500 text-sm mb-4">{errorMsg || 'Redirecting to login...'}</p>
            <button
              onClick={() => navigate('/login', { replace: true })}
              onTouchEnd={(e) => {
                e.preventDefault()
                navigate('/login', { replace: true })
              }}
              className="px-6 py-2 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 transition-colors"
            >
              Go to Login
            </button>
          </>
        )}
      </div>
    </div>
  )
}
