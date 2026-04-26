import { useEffect, useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
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
    // ─────────────────────────────────────────────────────────────────
    // CRITICAL FIRST CHECK — recovery detection runs SYNCHRONOUSLY at the
    // top of useEffect, before getSession(). Why:
    //
    // The previous flow had a race where getSession() resolved with a
    // STALE cached session (e.g., user previously signed in as Account A
    // in this browser) BEFORE Supabase processed the recovery token in
    // the URL hash and fired PASSWORD_RECOVERY for Account B. Result: the
    // app briefly rendered Account A's content, OR the recovery flow got
    // confused about which user it was resetting. Founder symptom: "the
    // reset brought me to my new account."
    //
    // Fix: synchronously detect the recovery URL, clear any stale local
    // session FIRST, show the reset modal IMMEDIATELY, and skip the rest
    // of the normal session-loading path. The PASSWORD_RECOVERY event
    // (which fires AFTER Supabase parses the token) populates the user.
    //
    // Detect both implicit-flow (hash with type=recovery) and PKCE
    // (query ?code=...).
    // ─────────────────────────────────────────────────────────────────
    // Detect recovery URL — both PKCE flow (?code=...&type=recovery) and the
    // legacy implicit flow (#access_token=...&type=recovery). With
    // detectSessionInUrl=false in supabase.js, the hash is now still here
    // when this code runs (was previously stripped by SDK auto-init).
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const queryParams = new URLSearchParams(window.location.search);
    const hashType = hashParams.get('type');
    const queryType = queryParams.get('type');
    const queryCode = queryParams.get('code');

    // Strict matching: type must explicitly be 'recovery'. We DON'T treat a
    // bare `?code=...` as recovery — that would false-positive on Stripe
    // returns, OAuth callbacks, etc.
    const isRecoveryUrl =
      hashType === 'recovery' ||
      (queryType === 'recovery' && queryCode);

    if (isRecoveryUrl) {
      console.log('🔑 [Recovery] URL detected — entering recovery flow synchronously');

      // Show the modal immediately. Don't wait for events.
      setShowResetPassword(true);
      setIsRecovery(true);
      setLoading(false);

      // Clear any stale session so it can't render the wrong user's content
      // while the recovery token is being processed.
      void (async () => {
        try {
          // Clear local-only — don't broadcast a SIGNED_OUT event globally
          // because the recovery flow needs to establish a fresh session
          // for the recovering user without our SIGNED_OUT handler racing.
          await supabase.auth.signOut({ scope: 'local' });
          console.log('🔑 [Recovery] Cleared stale local session');
        } catch (err) {
          console.warn('[Recovery] signOut failed (non-fatal):', err?.message);
        }

        // Explicitly exchange the recovery token for a session. With
        // detectSessionInUrl=false, the SDK no longer does this on its
        // own — we own the moment of exchange. This also means the URL
        // hash is preserved for ProtectedRoute to read on remount.
        try {
          if (queryCode) {
            // PKCE: exchange the code from the query string.
            const { error } = await supabase.auth.exchangeCodeForSession(window.location.href);
            if (error) console.warn('[Recovery] exchangeCodeForSession error:', error.message);
            else console.log('🔑 [Recovery] PKCE code exchanged for session');
          } else {
            // Implicit: setSession from the hash tokens.
            const accessToken = hashParams.get('access_token');
            const refreshToken = hashParams.get('refresh_token');
            if (accessToken) {
              const { error } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken || '',
              });
              if (error) console.warn('[Recovery] setSession error:', error.message);
              else console.log('🔑 [Recovery] Implicit-flow session set from hash');
            }
          }
        } catch (err) {
          console.error('[Recovery] token exchange threw:', err?.message ?? err);
        }
      })();

      // Listen ONLY for PASSWORD_RECOVERY in this branch — populate user
      // when Supabase finishes processing the recovery token.
      const { data: { subscription: recoverySub } } = supabase.auth.onAuthStateChange(
        (event, session) => {
          console.log('[Recovery] auth event:', event, session?.user?.email);
          if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
            setUser(session?.user ?? null);
          }
        }
      );

      return () => {
        recoverySub.unsubscribe();
      };
    }

    // ─────────────────────────────────────────────────────────────────
    // Normal (non-recovery) flow below — listen for sign-in / sign-out,
    // then fetch the current session.
    // ─────────────────────────────────────────────────────────────────
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth event:', event, session?.user?.email);

      if (event === 'PASSWORD_RECOVERY') {
        // Defensive: if for some reason recovery fires here (e.g., user
        // clicks a recovery link while already on this page), enter the
        // recovery flow immediately.
        console.log('🔑 PASSWORD_RECOVERY event — showing reset modal');
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

      setLoading(false);
    }).catch((error) => {
      console.error('ProtectedRoute: getSession() failed:', error);
      setLoading(false); // Show auth screen even if session check fails
    });

    // SAFETY NET: If getSession/getUser hangs (slow network, Supabase outage),
    // clear loading after 5 seconds so user isn't stuck on spinner forever.
    const safetyTimer = setTimeout(() => {
      setLoading((prev) => {
        if (prev) {
          console.warn('⚠️ ProtectedRoute: session check timed out after 5s — clearing loading');
        }
        return false;
      });
    }, 5000);

    return () => {
      clearTimeout(safetyTimer);
      subscription.unsubscribe();
    };
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-sky-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-slate-600 text-lg">Setting up your session...</div>
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


  // Unauthenticated visitors hitting /app or /nursing get routed to the
  // dedicated /login page. Standard SaaS pattern: auth lives at /login,
  // not in-place on /app. This also keeps /app a clean destination for
  // returning users (bookmark → sign in → dashboard).
  //
  // Use <Navigate> component — calling navigate() in render causes a
  // re-render loop (fixed: hardboiled redirect circle).
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // FIX: Anonymous users (from onboarding) have no email and no email_confirmed_at.
  // Don't trap them on "Verify Your Email" — redirect to onboarding to complete signup.
  if (user.is_anonymous) {
    // Sign out the anonymous user and redirect to onboarding
    supabase.auth.signOut().then(() => {
      navigate('/onboarding', { replace: true });
    });
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-sky-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-slate-600 text-lg">Redirecting...</div>
        </div>
      </div>
    )
  }

  // Check if email is verified
  if (!user.email_confirmed_at) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-sky-50 flex items-center justify-center p-4">
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