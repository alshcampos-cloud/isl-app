import { supabase } from '../lib/supabase'

/**
 * Google OAuth Utilities
 *
 * Handles the OAuth redirect flow for "Sign in with Google".
 * Uses localStorage to preserve context through the OAuth redirect cycle
 * (same pattern as SignUpPrompt.jsx lines 89-91).
 *
 * Flow:
 * 1. User clicks "Continue with Google"
 * 2. startGoogleOAuth() saves context → signs out anonymous → redirects to Google
 * 3. Google redirects → Supabase → /auth/callback
 * 4. OAuthCallback.jsx calls consumeOAuthContext() to restore routing context
 */

const OAUTH_CONTEXT_KEY = 'isl_oauth_context'

/**
 * Start the Google OAuth flow.
 *
 * @param {object} options
 * @param {boolean} options.fromNursing - Whether user came from nursing onboarding
 * @param {string} options.archetype - User's selected archetype (if from onboarding)
 * @returns {Promise<{error: string|null}>}
 */
export async function startGoogleOAuth({ fromNursing = false, archetype = null } = {}) {
  try {
    // Step 1: Save context to localStorage (survives redirect hops)
    const context = {
      fromNursing,
      archetype,
      timestamp: Date.now(),
    }
    localStorage.setItem(OAUTH_CONTEXT_KEY, JSON.stringify(context))

    // Step 2: Set onboarding field (same pattern as SignUpPrompt line 91)
    if (fromNursing) {
      localStorage.setItem('isl_onboarding_field', 'nursing')
    }

    // Step 3: Mark tutorial as seen (same pattern as SignUpPrompt line 89)
    localStorage.setItem('isl_tutorial_seen', 'true')

    // Step 4: Sign out anonymous session (same as SignUpPrompt line 57)
    // This prevents token collision when the OAuth user session arrives
    await supabase.auth.signOut()

    // Step 5: Start OAuth redirect to Google
    const onboardingField = fromNursing ? 'nursing' : 'general'
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          prompt: 'select_account', // Always show account picker
        },
        // Store onboarding_field in user_metadata (belt-and-suspenders with localStorage)
        data: {
          onboarding_field: onboardingField,
        },
      },
    })

    if (error) {
      console.error('[GoogleOAuth] signInWithOAuth error:', error)
      return { error: error.message }
    }

    // If we reach here, the browser should be redirecting to Google.
    // Return null error for clean handling.
    return { error: null }
  } catch (err) {
    console.error('[GoogleOAuth] startGoogleOAuth exception:', err)
    return { error: err.message || 'Something went wrong. Please try again.' }
  }
}

/**
 * Read and clear OAuth context from localStorage.
 * Called by OAuthCallback.jsx after Google redirects back.
 *
 * Returns null if:
 * - No context found
 * - Context is older than 10 minutes (stale protection)
 *
 * @returns {object|null} { fromNursing, archetype } or null
 */
export function consumeOAuthContext() {
  try {
    const raw = localStorage.getItem(OAUTH_CONTEXT_KEY)
    if (!raw) return null

    // Always clear the context (consume it)
    localStorage.removeItem(OAUTH_CONTEXT_KEY)

    const context = JSON.parse(raw)

    // Stale protection: reject if older than 10 minutes
    const TEN_MINUTES = 10 * 60 * 1000
    if (!context.timestamp || Date.now() - context.timestamp > TEN_MINUTES) {
      console.warn('[GoogleOAuth] Stale OAuth context, ignoring')
      return null
    }

    return {
      fromNursing: context.fromNursing || false,
      archetype: context.archetype || null,
    }
  } catch (err) {
    console.error('[GoogleOAuth] consumeOAuthContext error:', err)
    localStorage.removeItem(OAUTH_CONTEXT_KEY)
    return null
  }
}
