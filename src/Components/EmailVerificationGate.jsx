import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

/**
 * EmailVerificationGate
 *
 * Full-screen gate that wraps a protected entry (e.g. AI Interviewer).
 * - If the current user's email is already confirmed, passes {children} through untouched.
 * - Otherwise renders a warm "verify your email" prompt with three actions:
 *     1. Primary:   "I verified — let me in"  (refreshes session, unlocks if verified)
 *     2. Secondary: "Resend verification email" (60s cooldown)
 *     3. Escape:    "Use a different email"  (signs out + /signup)
 *
 * Props:
 *   - user:        the current Supabase user object (may be null)
 *   - onVerified:  optional callback invoked when the user's verified state is detected
 *   - onResend:    optional callback invoked after a successful resend (for analytics)
 *   - children:    render tree shown once the user is verified
 *
 * Sprint 7 / Coder 3 / Part 1
 */
export default function EmailVerificationGate({ user, onVerified, onResend, children }) {
  const navigate = useNavigate();

  // Local shadow of verification state so a successful refresh unlocks without a parent re-render
  const [verifiedLocal, setVerifiedLocal] = useState(Boolean(user?.email_confirmed_at));

  const [checking, setChecking] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [shake, setShake] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [toast, setToast] = useState('');

  const cooldownTimerRef = useRef(null);
  const toastTimerRef = useRef(null);

  // Keep local verified state in sync if the user prop changes underneath us
  useEffect(() => {
    if (user?.email_confirmed_at) {
      setVerifiedLocal(true);
    }
  }, [user?.email_confirmed_at]);

  // Cooldown countdown for the Resend button
  useEffect(() => {
    if (cooldown <= 0) return;
    cooldownTimerRef.current = setTimeout(() => {
      setCooldown((n) => Math.max(0, n - 1));
    }, 1000);
    return () => {
      if (cooldownTimerRef.current) clearTimeout(cooldownTimerRef.current);
    };
  }, [cooldown]);

  // Auto-dismiss toasts
  useEffect(() => {
    if (!toast) return;
    toastTimerRef.current = setTimeout(() => setToast(''), 3500);
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, [toast]);

  // Fast path: already verified, pass through
  if (verifiedLocal || user?.email_confirmed_at) {
    return <>{children}</>;
  }

  const handleICheckedClick = async () => {
    if (checking) return;
    setErrorMsg('');
    setChecking(true);
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) throw error;
      const refreshedUser = data?.user ?? null;
      if (refreshedUser?.email_confirmed_at) {
        setVerifiedLocal(true);
        if (typeof onVerified === 'function') {
          try { onVerified(refreshedUser); } catch (_) { /* noop */ }
        }
        return;
      }
      // Still not verified — shake + message
      setErrorMsg('Still not verified — check your spam folder.');
      setShake(true);
      setTimeout(() => setShake(false), 600);
    } catch (e) {
      setErrorMsg('Couldn\u2019t check just now. Please try again in a moment.');
      setShake(true);
      setTimeout(() => setShake(false), 600);
    } finally {
      setChecking(false);
    }
  };

  const handleResendClick = async () => {
    if (resending || cooldown > 0) return;
    if (!user?.email) {
      setErrorMsg('We don\u2019t have your email on file. Try signing in again.');
      return;
    }
    setErrorMsg('');
    setResending(true);
    try {
      const { error } = await supabase.auth.resend({ type: 'signup', email: user.email });
      if (error) throw error;
      setToast('Sent — check your inbox.');
      setCooldown(60);
      if (typeof onResend === 'function') {
        try { onResend(user.email); } catch (_) { /* noop */ }
      }
    } catch (e) {
      setErrorMsg('Couldn\u2019t resend right now. Please try again shortly.');
    } finally {
      setResending(false);
    }
  };

  const handleUseDifferentEmail = async () => {
    try {
      await supabase.auth.signOut();
    } catch (_) {
      // Non-blocking — navigate regardless so the user isn't stuck
    }
    navigate('/signup');
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 py-10 bg-gradient-to-br from-slate-50 via-gray-50 to-sky-50">
      <div
        className={`bg-white rounded-2xl shadow-xl p-8 max-w-md w-full border border-teal-100 ${shake ? 'animate-shake' : ''}`}
        style={shake ? { animation: 'evg-shake 0.5s' } : undefined}
      >
        {/* Inline keyframes so we don't depend on tailwind.config changes */}
        <style>{`
          @keyframes evg-shake {
            0%, 100% { transform: translateX(0); }
            20% { transform: translateX(-8px); }
            40% { transform: translateX(8px); }
            60% { transform: translateX(-6px); }
            80% { transform: translateX(6px); }
          }
        `}</style>

        <div className="mx-auto mb-5 w-14 h-14 rounded-full bg-gradient-to-br from-teal-100 to-emerald-100 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 text-teal-600">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
            <polyline points="22,6 12,13 2,6"></polyline>
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-slate-900 text-center mb-3">
          One quick step — let&apos;s verify your email
        </h1>
        <p className="text-slate-600 text-center leading-relaxed mb-6">
          AI Interviews are the heart of InterviewAnswers.ai. We verify your email
          so your practice history, streaks, and saved answers stay with you. Check
          your inbox for a link from us.
        </p>

        {user?.email && (
          <p className="text-center text-sm text-slate-500 mb-4">
            We sent a link to <span className="font-medium text-slate-700">{user.email}</span>
          </p>
        )}

        <button
          type="button"
          onClick={handleICheckedClick}
          disabled={checking}
          className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-lg py-3 transition-all shadow-sm hover:shadow-md active:scale-[0.99]"
        >
          {checking ? 'Checking…' : 'I verified — let me in'}
        </button>

        <button
          type="button"
          onClick={handleResendClick}
          disabled={resending || cooldown > 0}
          className="mt-3 w-full border-2 border-teal-500 text-teal-700 hover:bg-teal-50 disabled:opacity-60 disabled:cursor-not-allowed font-semibold rounded-lg py-3 transition-all"
        >
          {cooldown > 0
            ? `Resend verification email (${cooldown}s)`
            : resending
              ? 'Sending…'
              : 'Resend verification email'}
        </button>

        <p className="text-center text-xs text-slate-500 mt-4">
          Meanwhile, Practice Mode and the Prompter are wide open — go warm up.
        </p>

        {errorMsg && (
          <p className="mt-4 text-center text-sm text-rose-600" role="alert">
            {errorMsg}
          </p>
        )}

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={handleUseDifferentEmail}
            className="text-sm text-gray-400 underline hover:text-gray-600"
          >
            Use a different email
          </button>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-sm px-4 py-2 rounded-full shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
