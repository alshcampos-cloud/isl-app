import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

/**
 * AuthConfirm — handles email confirmation links that use token_hash (PKCE flow).
 *
 * This component processes URLs like:
 *   /auth/confirm?token_hash=xxx&type=signup
 *   /auth/confirm?token_hash=xxx&type=recovery
 *   /auth/confirm?token_hash=xxx&type=email_change
 *
 * By using token_hash links instead of the default Supabase ConfirmationURL,
 * the email contains links to OUR domain (interviewanswers.ai) instead of
 * the Supabase domain (supabase.co). This prevents spam filters from flagging
 * the email due to domain mismatch between sender and link URLs.
 *
 * Created: Feb 22, 2026
 * Reason: Fix email deliverability — Resend flagged domain mismatch as spam trigger
 */
export default function AuthConfirm() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // verifying | success | error
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const tokenHash = searchParams.get('token_hash');
    const type = searchParams.get('type');

    if (!tokenHash || !type) {
      setStatus('error');
      setErrorMsg('Invalid confirmation link. Missing required parameters.');
      return;
    }

    const verify = async () => {
      try {
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: type, // 'signup', 'recovery', 'email_change'
        });

        if (error) {
          console.error('Email verification error:', error);
          setStatus('error');
          setErrorMsg(error.message || 'Verification failed. The link may have expired.');
          return;
        }

        // Verification successful
        setStatus('success');

        // Determine where to redirect based on user profile
        const user = data?.user || data?.session?.user;
        if (user) {
          const onboardingField = user.user_metadata?.onboarding_field;
          const dest = onboardingField === 'nursing' ? '/nursing' : '/app';

          // Short delay so user sees success message, then redirect
          setTimeout(() => {
            navigate(dest, { replace: true });
          }, 1500);
        } else {
          // No user data — redirect to login
          setTimeout(() => {
            navigate('/login', { replace: true });
          }, 2000);
        }
      } catch (err) {
        console.error('Email verification exception:', err);
        setStatus('error');
        setErrorMsg('Something went wrong. Please try signing up again.');
      }
    };

    verify();
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
