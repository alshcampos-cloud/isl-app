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
    // If already authenticated, redirect
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate(redirectTo, { replace: true });
      } else {
        setLoading(false);
      }
    });
  }, [navigate, redirectTo]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-white text-2xl">Loading...</div>
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
