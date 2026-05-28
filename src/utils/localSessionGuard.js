// localSessionGuard.js — deadlock-immune session read from localStorage.
//
// Why this exists
// ----------------
// supabase.auth.getSession() can deadlock on the GoTrue Web Lock under load
// or after concurrent auth calls — symptoms we've band-aided four times
// (PRs #29, #35, #37, #39). When it deadlocks, getSession() returns null or
// hangs even though the JWT is sitting in localStorage right next to it.
//
// Effect: logged-in users get bounced out of /nursing (ProtectedRoute sees
// no user) and trapped on /onboarding (mount-effect can't redirect them).
//
// This utility bypasses the SDK entirely and reads the JWT from localStorage
// directly. It's a synchronous, lock-free read — the supabase-js client
// persists the session at `sb-<project-ref>-auth-token` as a plain JSON
// string, and that's what we read here.
//
// IMPORTANT: this is a fast-path read for redirect / UI decisions only.
// It does NOT validate the JWT signature — for the canonical user record
// (with up-to-date email_confirmed_at, abuse flags, etc.) you still call
// supabase.auth.getUser(). But for "do I have a session, where should I
// land?", localStorage is the authoritative store.
//
// Returns
// -------
// {
//   session: <stored session object> | null,
//   user: <session.user> | null,
//   isAnonymous: boolean,
//   isExpired: boolean,
//   isValid: boolean,   // has access_token AND not expired
// }
// or { session: null, user: null, isAnonymous: false, isExpired: false, isValid: false }
// when no session is stored.

const NOTHING = { session: null, user: null, isAnonymous: false, isExpired: false, isValid: false };

/**
 * Read the persisted Supabase session straight from localStorage.
 * Returns a structured object — never throws.
 */
export function readLocalSession() {
  try {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return NOTHING;
    }
    // Supabase persists at sb-<projectRef>-auth-token. We don't hardcode the
    // project ref — just find the key by shape so this works in any env.
    const key = Object.keys(localStorage).find(
      (k) => k.startsWith('sb-') && k.endsWith('-auth-token')
    );
    if (!key) return NOTHING;

    const raw = localStorage.getItem(key);
    if (!raw) return NOTHING;

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (_) {
      // Corrupted entry — bail out cleanly. The user will land on the
      // anonymous/login path, same as if no session existed.
      return NOTHING;
    }

    const session = parsed?.access_token ? parsed : parsed?.currentSession || parsed?.session || null;
    if (!session?.access_token) return NOTHING;

    const user = session.user || null;
    const isAnonymous = Boolean(user?.is_anonymous);
    const expiresAtSec = session.expires_at || 0;
    const isExpired = expiresAtSec > 0 && expiresAtSec * 1000 < Date.now();
    const isValid = Boolean(session.access_token) && !isExpired;

    return { session, user, isAnonymous, isExpired, isValid };
  } catch (_) {
    // Never let a localStorage read break the UI.
    return NOTHING;
  }
}

/**
 * Convenience: do we have a valid, non-anonymous session right now?
 * Use this at mount-effect entry points where we want to short-circuit
 * before calling getSession() (which can deadlock).
 */
export function hasValidLoggedInSession() {
  const { isValid, isAnonymous } = readLocalSession();
  return isValid && !isAnonymous;
}

/**
 * Deadlock-safe access_token fetch for Edge Function calls.
 *
 * Pattern used in answer-assistant / coach / probing submit handlers:
 *   1. Read localStorage synchronously. If a valid (non-expired) access_token
 *      sits there, return it immediately. Supabase auto-refreshes tokens on
 *      401 from the Edge Function, so a slightly-old-but-valid token is fine.
 *   2. If localStorage is empty/corrupted, fall through to the SDK call —
 *      raced against a 5s timeout so a deadlock can't hang the UI forever.
 *   3. If both fail, return null. Caller decides how to surface the error.
 *
 * supabaseClient: pass the supabase client (we don't import it here to keep
 *   this utility import-cycle-free).
 *
 * Returns: { access_token, user } | null
 */
export async function getActiveSessionToken(supabaseClient, { timeoutMs = 5000 } = {}) {
  // FAST PATH (no lock, synchronous)
  const stored = readLocalSession();
  if (stored.isValid && stored.session?.access_token) {
    return { access_token: stored.session.access_token, user: stored.user };
  }

  // Fallback to SDK — raced against timeout so a deadlocked getSession
  // doesn't hang the submit forever.
  try {
    const result = await Promise.race([
      supabaseClient.auth.getSession(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Session check timed out')), timeoutMs)
      ),
    ]);
    const session = result?.data?.session;
    if (session?.access_token) {
      return { access_token: session.access_token, user: session.user };
    }
  } catch (_) {
    // Either the timeout or a thrown SDK error — fall through to null.
  }
  return null;
}
