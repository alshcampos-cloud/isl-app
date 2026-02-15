import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Auth from '../Auth';

export default function AuthPage({ mode = 'login' }) {
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

    // If already authenticated, redirect
    supabase.auth.getSession().then(({ data: { session } }) => {
      clearTimeout(fallbackTimer);
      if (session) {
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
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-white/80 text-lg">Just a moment...</div>
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
