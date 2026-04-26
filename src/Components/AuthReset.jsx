// AuthReset — dedicated landing page for password recovery flow.
//
// WHY THIS EXISTS (Apr 26, 2026):
// In Supabase's PKCE flow, the recovery email link goes to
// <SUPABASE_URL>/auth/v1/verify?token=pkce_...&type=recovery&redirect_to=...
// Supabase consumes `type=recovery` server-side during the verify step and
// 302-redirects to your `redirect_to` with ONLY `?code=<auth_code>` appended
// (no `type=recovery` in the final URL). So a heuristic like
// `?type=recovery && ?code=...` never fires — it's the wrong shape.
//
// The previous attempt routed the recovery URL to `/app` and tried to detect
// recovery in ProtectedRoute's useEffect. That detector required type=recovery
// to be present, so it always fell through to the normal auth flow → either
// a stale-session dashboard (logged-in users) or a /login redirect.
//
// Fix: dedicate `/auth/reset` to recovery ONLY. Any `?code=...` arriving here
// is unambiguously a password recovery code (no Stripe/OAuth false positives).
// Exchange it for a session, then show the password-update modal.
//
// Flow:
//   email link → Supabase /auth/v1/verify → 302 to /auth/reset?code=ABC
//   → AuthReset reads code → exchangeCodeForSession → establishes recovering
//     user's session → ResetPassword modal lets them set a new password
//   → onSuccess: full sign-out → redirect to /login
//
// References:
//   https://supabase.com/docs/guides/auth/passwords
//   https://github.com/supabase/auth-js/issues/545
//   https://github.com/orgs/supabase/discussions/28655

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import ResetPassword from './ResetPassword';

export default function AuthReset() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState('exchanging'); // 'exchanging' | 'ready' | 'error'
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');

      if (!code) {
        if (!cancelled) {
          setErrorMessage(
            'This reset link is missing the verification code. Please request a new password reset email.'
          );
          setPhase('error');
        }
        return;
      }

      // Clear ANY stale local session first. Why: a logged-in user clicking
      // the reset email shouldn't have their existing session interfere with
      // the recovery code exchange. We only clear local — broadcasting a
      // SIGNED_OUT could race with the SIGNED_IN that exchangeCodeForSession
      // is about to fire.
      try {
        await supabase.auth.signOut({ scope: 'local' });
      } catch (err) {
        // Non-fatal — user might not have had a session anyway
        console.warn('[AuthReset] local signOut warning:', err?.message);
      }

      // Exchange the PKCE code for a session. With detectSessionInUrl=false
      // in src/lib/supabase.js, the SDK does NOT do this automatically — we
      // own the moment of exchange.
      try {
        const { error } = await supabase.auth.exchangeCodeForSession(window.location.href);
        if (cancelled) return;

        if (error) {
          // Common failure modes:
          //   - "Auth code is invalid or expired" — code was already used or
          //     timed out (Supabase default: 1h)
          //   - "Auth code and code verifier should be non-empty" — user
          //     opened email on a different device than they requested from
          //     (PKCE verifier lives in localStorage of the originating device)
          console.error('[AuthReset] exchangeCodeForSession error:', error);
          setErrorMessage(
            error.message?.includes('verifier')
              ? 'Reset links must be opened on the same device you requested them from. Please request a new link from the device where you want to reset your password.'
              : (error.message || 'Reset link is invalid or expired. Please request a new one.')
          );
          setPhase('error');
          return;
        }

        // Success — Supabase has populated the session. ResetPassword's
        // updateUser call will use it to set the new password.
        setPhase('ready');
      } catch (err) {
        if (cancelled) return;
        console.error('[AuthReset] exchangeCodeForSession threw:', err);
        setErrorMessage(err?.message || 'Something went wrong verifying the reset link.');
        setPhase('error');
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleSuccess = async () => {
    // Full sign-out so the user starts fresh, then send them to /login
    try {
      await supabase.auth.signOut();
    } catch {
      /* non-fatal */
    }
    // Use alert pattern consistent with ProtectedRoute's onSuccess
    alert('Password reset successful! Please sign in with your new password.');
    navigate('/login', { replace: true });
  };

  if (phase === 'exchanging') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-sky-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <Loader2 className="w-12 h-12 text-teal-600 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Verifying reset link…</h2>
          <p className="text-gray-600 text-sm">Just a moment.</p>
        </div>
      </div>
    );
  }

  if (phase === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-sky-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Reset link problem</h2>
          <p className="text-gray-600 mb-6">{errorMessage}</p>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition"
          >
            Back to sign in
          </button>
        </div>
      </div>
    );
  }

  // phase === 'ready' — session established for the recovering user, show modal
  return (
    <ResetPassword
      supabase={supabase}
      onClose={() => {
        // Recovery flow can't be cancelled — user must complete the password
        // change. If they navigate away, that's fine, the next sign-in works.
      }}
      onSuccess={handleSuccess}
    />
  );
}
