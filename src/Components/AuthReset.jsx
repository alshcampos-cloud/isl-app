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

      // Accept BOTH URL patterns (Apr 26, 2026 — cross-device fix):
      //
      //   1. NEW (preferred): ?token_hash=XXX&type=recovery
      //      Used when the Supabase email template is configured with
      //      {{ .TokenHash }}. The token is verified via verifyOtp() which
      //      does NOT require a code-verifier on the originating device.
      //      → Cross-device safe: user can request reset on laptop, click
      //        the link on phone, and it works.
      //
      //   2. OLD (fallback): ?code=XXX
      //      Used when the email template still has {{ .ConfirmationURL }}
      //      (PKCE flow). Requires the code-verifier in localStorage of the
      //      same browser that initiated the reset. BREAKS cross-device.
      //      Kept for backwards compatibility while in-flight emails drain.
      //
      // We try (1) first. If absent, fall back to (2). If neither is present,
      // the link is malformed.
      const tokenHash = params.get('token_hash');
      const type = params.get('type');
      const code = params.get('code');

      const hasTokenHash = tokenHash && type === 'recovery';
      const hasCode = !!code;

      if (!hasTokenHash && !hasCode) {
        if (!cancelled) {
          setErrorMessage(
            'This reset link is missing required parameters. Please request a new password reset email.'
          );
          setPhase('error');
        }
        return;
      }

      // Clear ANY stale local session first. Why: a logged-in user clicking
      // the reset email shouldn't have their existing session interfere with
      // recovery. We only clear local — broadcasting a SIGNED_OUT could race
      // with the SIGNED_IN that verifyOtp/exchangeCodeForSession is about to
      // fire.
      try {
        await supabase.auth.signOut({ scope: 'local' });
      } catch (err) {
        console.warn('[AuthReset] local signOut warning:', err?.message);
      }

      try {
        let error;

        // Reviewer follow-up #2 (Apr 26, 2026): wrap verification in a 15s
        // timeout race so a hung Supabase call doesn't leave the user
        // staring at a spinner forever (matches ResetPassword.jsx's own
        // 15s timeout on updateUser).
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error('Verification timed out. Please check your connection and try again.')),
            15000
          )
        );

        if (hasTokenHash) {
          // PATH 1: token_hash flow (cross-device safe).
          // verifyOtp validates the hash server-side and establishes a
          // session for the recovering user. No client-side verifier needed.
          console.log('[AuthReset] using token_hash flow (cross-device safe)');
          const result = await Promise.race([
            supabase.auth.verifyOtp({
              type: 'recovery',
              token_hash: tokenHash,
            }),
            timeoutPromise,
          ]);
          error = result.error;
        } else {
          // PATH 2: PKCE code flow (legacy fallback).
          // Requires code-verifier in localStorage. Will fail with a
          // helpful error on cross-device clicks.
          console.log('[AuthReset] using PKCE code flow (legacy)');
          const result = await Promise.race([
            supabase.auth.exchangeCodeForSession(window.location.href),
            timeoutPromise,
          ]);
          error = result.error;
        }

        if (cancelled) return;

        if (error) {
          // Common failure modes:
          //   - "Token has expired or is invalid" — link aged out (1h default)
          //   - "Auth code and code verifier should be non-empty" — old PKCE
          //     flow, user clicked email on a different device
          //   - "Email link is invalid or has expired" — already used
          console.error('[AuthReset] verification error:', error);
          const msg = error.message || '';
          let userMessage;
          if (msg.includes('verifier')) {
            // Should be rare now that token_hash is the preferred path,
            // but if a stale PKCE-flow email is clicked cross-device, this fires.
            userMessage = 'This older reset link cannot be used on a different device than where you requested it. Please request a fresh reset email — the new flow works across devices.';
          } else if (msg.toLowerCase().includes('expired') || msg.toLowerCase().includes('invalid')) {
            userMessage = 'This reset link has expired or already been used. Please request a new password reset email.';
          } else {
            userMessage = msg || 'Reset link could not be verified. Please request a new one.';
          }
          setErrorMessage(userMessage);
          setPhase('error');
          return;
        }

        // Success — session established for the recovering user.
        setPhase('ready');
      } catch (err) {
        if (cancelled) return;
        console.error('[AuthReset] verification threw:', err);
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
    // Full sign-out so the user starts fresh, then send them to /login.
    // Reviewer follow-up #1 (Apr 26, 2026): removed redundant alert() —
    // ResetPassword.jsx already shows a styled "Password updated successfully"
    // success modal for 1s before calling onSuccess, so the alert was
    // duplicate noise that fired AFTER the modal disappeared.
    try {
      await supabase.auth.signOut();
    } catch {
      /* non-fatal */
    }
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
