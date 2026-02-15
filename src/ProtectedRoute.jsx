import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import Auth from './Auth'
import ResetPassword from './Components/ResetPassword' // ADDED: For password recovery flow
import { Mail } from 'lucide-react' // ADDED: For email verification UI

function ProtectedRoute({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showResetPassword, setShowResetPassword] = useState(false) // ADDED: Track recovery modal
  const [isRecovery, setIsRecovery] = useState(false) // ADDED: Flag recovery flow

  useEffect(() => {
    // Listen for auth changes - Supabase fires PASSWORD_RECOVERY when processing reset link
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth event:', event, session?.user?.email);

      if (event === 'PASSWORD_RECOVERY') {
        console.log('🔑 PASSWORD_RECOVERY event - session established, showing reset modal');
        setUser(session?.user ?? null);
        setShowResetPassword(true);
        setIsRecovery(true);
        setLoading(false);
        return;
      }

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setUser(session?.user ?? null);
      }

      if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    // getSession() automatically processes any tokens in the URL hash
    // This will trigger PASSWORD_RECOVERY event if there's a recovery token
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session?.user?.email ?? 'no session');
      setUser(session?.user ?? null);

      // Only set loading false if we're NOT in recovery flow
      // (recovery flow sets it in the event handler)
      if (!window.location.hash.includes('type=recovery')) {
        setLoading(false);
      }
    }).catch((error) => {
      console.error('ProtectedRoute: getSession() failed:', error);
      setLoading(false); // Show auth screen even if session check fails
    });

    // Fallback: If getSession doesn't trigger PASSWORD_RECOVERY within 3 seconds
    // but we have a recovery token, show the modal anyway
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    if (hashParams.get('type') === 'recovery') {
      console.log('🔑 Recovery token detected in URL');
      const fallbackTimer = setTimeout(() => {
        if (loading) {
          console.log('⚠️ Fallback: showing reset modal after timeout');
          setShowResetPassword(true);
          setIsRecovery(true);
          setLoading(false);
        }
      }, 3000);
      return () => {
        clearTimeout(fallbackTimer);
        subscription.unsubscribe();
      };
    }

    return () => subscription.unsubscribe();
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    )
  }

  // FIXED: Show reset modal if recovery token detected (before auth check)
  if (showResetPassword && isRecovery) {
    return (
      <ResetPassword
        supabase={supabase}
        onClose={() => {
          // SECURITY: Can't close modal during required password reset
        }}
        onSuccess={async () => {
          // Force sign-out and redirect to login after successful reset
          await supabase.auth.signOut();
          window.location.hash = '';
          setShowResetPassword(false);
          setIsRecovery(false);
          alert('✅ Password reset successful! Please sign in with your new password.');
        }}
      />
    );
  }


  if (!user) {
    return <Auth onAuthSuccess={setUser} />
  }

  // Check if email is verified
  if (!user.email_confirmed_at) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-yellow-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Verify Your Email
          </h2>
          <p className="text-gray-600 mb-6">
            We sent a verification link to <strong>{user.email}</strong>
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Click the link in the email to continue. Check your spam folder if you don't see it.
          </p>
          <button
            onClick={() => supabase.auth.signOut()}
            className="text-indigo-600 hover:text-indigo-700 font-medium"
          >
            Sign out
          </button>
        </div>
      </div>
    )
  }

  // User is authenticated and verified
  return children
}

export default ProtectedRoute