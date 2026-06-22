import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { readLocalSession } from '../utils/localSessionGuard';
import Auth from '../Auth';
import useDocumentHead from '../hooks/useDocumentHead';

export default function AuthPage({ mode = 'login' }) {
  useDocumentHead({
    title: mode === 'login' ? 'Log In | InterviewAnswers.ai' : 'Sign Up | InterviewAnswers.ai',
    description: mode === 'login' ? 'Log in to your InterviewAnswers.ai account.' : 'Create your free InterviewAnswers.ai account.',
    robots: 'noindex, nofollow',
  });
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);

  // Determine redirect destination based on ?from= query param
  // e.g. /signup?from=nursing → redirect to /nursing after auth
  const from = searchParams.get('from');
  // Preserve purchase intent (from the /nurse "Get Nursing Pass" CTA) through auth,
  // so after login/signup we land on the dashboard with the checkout modal auto-opened.
  const wantsUpgrade = searchParams.get('upgrade') === 'true';
  const redirectTo = from === 'nursing'
    ? (wantsUpgrade ? '/nursing?upgrade=true' : '/nursing')
    : '/app';

  useEffect(() => {
    // FAST PATH (synchronous, no Promise) — if localStorage already has a
    // valid logged-in session, redirect immediately. Without this, when
    // getSession() deadlocks on the GoTrue Web Lock a returning logged-in
    // user clicking a "Log In" link gets stuck staring at the login form
    // (the redirect-to-/nursing branch never fires because session came
    // back null from the deadlock). The async getSession() below still
    // runs to handle anonymous-session cleanup and URL-hash auth tokens.
    const stored = readLocalSession();
    if (stored.isValid && !stored.isAnonymous) {
      navigate(redirectTo, { replace: true });
      return;
    }

    // Fallback timeout — if getSession() hangs, show auth form anyway
    const fallbackTimer = setTimeout(() => {
      console.warn('⚠️ AuthPage: getSession() timed out after 3s, showing auth form');
      setLoading(false);
    }, 3000);

    // If already authenticated, redirect (but handle anonymous sessions)
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      clearTimeout(fallbackTimer);
      if (session && session.user.is_anonymous) {
        // Anonymous session from onboarding — sign out silently so login form shows
        await supabase.auth.signOut();
        setLoading(false);
      } else if (session) {
        navigate(redirectTo, { replace: true });
      } else {
        setLoading(false);
      }
    }).catch((error) => {
      clearTimeout(fallbackTimer);
      console.error('AuthPage: getSession() failed:', error);
      setLoading(false); // Show auth form even if session check fails
    });

    return () => clearTimeout(fallbackTimer);
  }, [navigate, redirectTo]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-sky-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-slate-600 text-lg">Just a moment...</div>
        </div>
      </div>
    );
  }

  // Back destination: nursing users go to /nurse landing, general users go to /
  const backTo = from === 'nursing' ? '/nurse' : '/';

  return (
    <Auth
      onAuthSuccess={() => navigate(redirectTo, { replace: true })}
      defaultMode={mode}
      onBack={() => navigate(backTo)}
      fromNursing={from === 'nursing'}
    />
  );
}
