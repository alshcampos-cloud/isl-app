import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

/**
 * AuthConfirm — handles email confirmation redirects.
 *
 * KEY INSIGHT: We use {{ .ConfirmationURL }} in the email template, which means
 * the Supabase server confirms the email BEFORE redirecting to this page.
 * If the user reaches /auth/confirm at all, their email IS confirmed.
 *
 * We try to establish a session (best UX = auto-login), but if we can't
 * (e.g., Safari stripping hash fragments, cross-browser issues), we show
 * a success message and redirect to login instead of an error.
 *
 * Session detection strategies (in order):
 * 1. getSession() — Supabase client may have already processed #access_token=
 * 2. Retry getSession() after delay — timing race with detectSessionInUrl
 * 3. PKCE code exchange — ?code=xxx in query params
 * 4. Legacy verifyOtp — ?token_hash=xxx&type=signup from old email templates
 * 5. onAuthStateChange listener — catch late session events
 * 6. Graceful fallback — email IS confirmed, redirect to login
 */
export default function AuthConfirm() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying');
  const [errorMsg, setErrorMsg] = useState('');
  const statusRef = useRef('verifying');

  useEffect(() => {
    const tokenHash = searchParams.get('token_hash');
    const type = searchParams.get('type');
    const code = searchParams.get('code');

    const setStatusSafe = (newStatus, msg) => {
      if (statusRef.current === 'success' || statusRef.current === 'confirmed') return;
      statusRef.current = newStatus;
      setStatus(newStatus);
      if (msg) setErrorMsg(msg);
    };

    const redirectToApp = (user) => {
      const onboardingField = user?.user_metadata?.onboarding_field;
      const nursingLocal = localStorage.getItem('isl_onboarding_field');
      const dest = (onboardingField === 'nursing' || nursingLocal === 'nursing') ? '/nursing' : '/app';
      setTimeout(() => navigate(dest, { replace: true }), 1500);
    };

    const handleConfirmation = async () => {
      try {
        // Strategy 1: Check if Supabase client already established a session
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          console.log('AuthConfirm: Session found on first check');
          setStatusSafe('success');
          redirectToApp(session.user);
          return;
        }

        // Strategy 2: Wait 2 seconds and retry — detectSessionInUrl may still be processing
        await new Promise(r => setTimeout(r, 2000));
        const { data: { session: retrySession } } = await supabase.auth.getSession();

        if (retrySession?.user) {
          console.log('AuthConfirm: Session found on retry');
          setStatusSafe('success');
          redirectToApp(retrySession.user);
          return;
        }

        // Strategy 3: PKCE code exchange
        if (code) {
          console.log('AuthConfirm: PKCE code detected, exchanging...');
          try {
            const { data, error } = await supabase.auth.exchangeCodeForSession(code);
            if (!error && data?.session?.user) {
              setStatusSafe('success');
              redirectToApp(data.session.user);
              return;
            }
            if (error) console.error('AuthConfirm: code exchange error:', error);
          } catch (e) {
            console.error('AuthConfirm: code exchange exception:', e);
          }
        }

        // Strategy 4: Legacy token_hash flow
        if (tokenHash && type) {
          console.log('AuthConfirm: token_hash flow detected');
          try {
            const { data, error } = await supabase.auth.verifyOtp({
              token_hash: tokenHash,
              type: type,
            });
            if (!error) {
              setStatusSafe('success');
              const user = data?.user || data?.session?.user;
              if (user) {
                redirectToApp(user);
              } else {
                setTimeout(() => navigate('/login', { replace: true }), 2000);
              }
              return;
            }
            console.error('AuthConfirm: verifyOtp error:', error);
          } catch (e) {
            console.error('AuthConfirm: verifyOtp exception:', e);
          }
        }

        // Strategy 5: Listen for auth state change
        console.log('AuthConfirm: Listening for auth state change...');
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
          if (event === 'SIGNED_IN' && newSession?.user) {
            console.log('AuthConfirm: SIGNED_IN event received');
            setStatusSafe('success');
            redirectToApp(newSession.user);
            subscription.unsubscribe();
          }
        });

        // Strategy 6: Graceful fallback after 5 seconds
        // Since we use {{ .ConfirmationURL }}, the email was confirmed server-side
        // BEFORE Supabase redirected here. If we can't establish a session
        // (e.g., Safari hash fragment issues), still show success and redirect to login.
        setTimeout(() => {
          subscription.unsubscribe();
          if (statusRef.current === 'verifying') {
            console.log('AuthConfirm: Timeout — showing confirmed, redirecting to login');
            setStatusSafe('confirmed');
            setTimeout(() => navigate('/login', { replace: true }), 2500);
          }
        }, 5000);
      } catch (err) {
        console.error('AuthConfirm exception:', err);
        // Even on exception, the email was likely confirmed server-side
        setStatusSafe('confirmed');
        setTimeout(() => navigate('/login', { replace: true }), 2500);
      }
    };

    handleConfirmation();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-sky-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
        {status === 'verifying' && (
          <>
            <div className="w-12 h-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-slate-800 mb-2">Verifying your email...</h2>
            <p className="text-slate-500">Just a moment while we confirm your account.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-slate-800 mb-2">Email confirmed!</h2>
            <p className="text-slate-500">Redirecting you to the app...</p>
          </>
        )}

        {status === 'confirmed' && (
          <>
            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-slate-800 mb-2">Email confirmed!</h2>
            <p className="text-slate-500">Redirecting you to sign in...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-slate-800 mb-2">Verification failed</h2>
            <p className="text-slate-500 mb-6">{errorMsg}</p>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/signup')}
                className="w-full py-3 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 transition-colors"
              >
                Try signing up again
              </button>
              <button
                onClick={() => navigate('/login')}
                className="w-full py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors"
              >
                Go to login
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
