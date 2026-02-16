import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import Auth from './Auth'
import ResetPassword from './Components/ResetPassword' // ADDED: For password recovery flow
import { Mail } from 'lucide-react' // ADDED: For email verification UI

function ProtectedRoute({ children }) {
  const navigate = useNavigate()
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
        // FIX: After email verification, the session user may have stale email_confirmed_at.
        // Fetch fresh user data from Supabase to get the updated confirmation status.
        if (session?.user) {
          supabase.auth.getUser().then(({ data: { user: freshUser } }) => {
            console.log('🔄 Fresh user data:', freshUser?.email, 'confirmed:', !!freshUser?.email_confirmed_at);
            setUser(freshUser ?? session.user);
          }).catch(() => {
            setUser(session.user); // Fallback to session user if getUser fails
          });
        } else {
          setUser(null);
        }
      }

      if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    // getSession() automatically processes any tokens in the URL hash
    // This will trigger PASSWORD_RECOVERY event if there's a recovery token
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log('Initial session check:', session?.user?.email ?? 'no session');

      // FIX: Always fetch fresh user data to get current email_confirmed_at
      if (session?.user) {
        try {
          const { data: { user: freshUser } } = await supabase.auth.getUser();
          console.log('🔄 Fresh initial user:', freshUser?.email, 'confirmed:', !!freshUser?.email_confirmed_at);
          setUser(freshUser ?? session.user);
        } catch {
          setUser(session.user);
        }
      } else {
        setUser(null);
      }

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

  // Poll for email verification (cross-device support)
  // When user verifies on phone, desktop auto-detects within 3 seconds
  useEffect(() => {
    if (!user || user.email_confirmed_at || user.is_anonymous) return;

    const pollInterval = setInterval(async () => {
      try {
        const { data: { user: freshUser } } = await supabase.auth.getUser();
        if (freshUser?.email_confirmed_at) {
          console.log('✅ Email verified (detected by polling)');
          setUser(freshUser);
          clearInterval(pollInterval);
        }
      } catch (err) {
        console.warn('Verification poll failed:', err);
      }
    }, 3000);

    return () => clearInterval(pollInterval);
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-white/80 text-lg">Setting up your session...</div>
        </div>
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

  // FIX: Anonymous users (from onboarding) have no email and no email_confirmed_at.
  // Don't trap them on "Verify Your Email" — redirect to onboarding to complete signup.
  if (user.is_anonymous) {
    // Sign out the anonymous user and redirect to onboarding
    supabase.auth.signOut().then(() => {
      navigate('/onboarding', { replace: true });
    });
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-white/80 text-lg">Redirecting...</div>
        </div>
      </div>
    )
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
          <div className="flex flex-col gap-3">
            <button
              onClick={async () => {
                // Refresh user data — in case they already verified but this page has stale data
                const { data: { user: freshUser } } = await supabase.auth.getUser();
                if (freshUser?.email_confirmed_at) {
                  setUser(freshUser);
                } else {
                  alert('Email not yet verified. Please check your inbox and click the verification link.');
                }
              }}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition"
            >
              I've Verified — Continue
            </button>
            <button
              onClick={async () => {
                try {
                  await supabase.auth.resend({ type: 'signup', email: user.email });
                  alert('Verification email resent! Check your inbox.');
                } catch (err) {
                  alert('Could not resend email. Please try again in a moment.');
                }
              }}
              className="text-indigo-600 hover:text-indigo-700 font-medium text-sm"
            >
              Resend verification email
            </button>
            <button
              onClick={() => supabase.auth.signOut()}
              className="text-gray-500 hover:text-gray-700 font-medium text-sm"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    )
  }

  // User is authenticated and verified
  return children
}

export default ProtectedRoute