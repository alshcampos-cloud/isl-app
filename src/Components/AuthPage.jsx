import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
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
  const redirectTo = from === 'nursing' ? '/nursing' : '/app';

  useEffect(() => {
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
