/**
 * onboardingTracker.js — Phase 2B: Lightweight Onboarding Funnel Tracking
 *
 * One utility, one function, silent failure. All 5 onboarding screens import this.
 * Uses Supabase only — no external analytics (no Mixpanel, no PostHog, no Amplitude).
 *
 * Session ID: random UUID stored in sessionStorage so we can follow one user's
 * journey across all 5 screens. New session on each fresh visit.
 *
 * RULE: Tracking must NEVER break the user experience. Every call is try/catch + silent fail.
 */

import { supabase } from '../lib/supabase'

const SESSION_KEY = 'isl_onboarding_session_id'

/**
 * Get or create a session ID for this onboarding journey.
 * Stored in sessionStorage — dies when tab closes.
 */
function getSessionId() {
  try {
    let sessionId = sessionStorage.getItem(SESSION_KEY)
    if (!sessionId) {
      sessionId = crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`
      sessionStorage.setItem(SESSION_KEY, sessionId)
    }
    return sessionId
  } catch {
    // sessionStorage might be unavailable (private browsing, etc.)
    return `fallback-${Date.now()}`
  }
}

/**
 * Screen name constants for consistency across all tracking calls.
 */
export const SCREEN_NAMES = {
  1: 'archetype_detection',
  2: 'breathing',
  3: 'practice',
  4: 'irs_baseline',
  5: 'signup',
}

/**
 * Track an onboarding event. Silent failure — never throws.
 *
 * @param {number} screenNumber — 1-5
 * @param {string} action — 'viewed', 'completed', 'skipped', 'started', 'submitted', 'error', etc.
 * @param {object} [metadata={}] — optional key/value pairs (e.g. { archetype: 'urgent_seeker', score: 7 })
 * @param {number} [timeOnScreenMs] — optional milliseconds spent on this screen
 */
export async function trackOnboardingEvent(screenNumber, action, metadata = {}, timeOnScreenMs = null) {
  try {
    const sessionId = getSessionId()
    const screenName = SCREEN_NAMES[screenNumber] || `screen_${screenNumber}`

    // Get current user ID if available (may be anonymous)
    let userId = null
    try {
      const { data: { user } } = await supabase.auth.getUser()
      userId = user?.id || null
    } catch {
      // No user available — that's fine
    }

    const { error } = await supabase.from('onboarding_events').insert({
      session_id: sessionId,
      user_id: userId,
      screen_number: screenNumber,
      screen_name: screenName,
      action,
      metadata,
      time_on_screen_ms: timeOnScreenMs,
    })

    if (error) {
      console.warn('[onboarding tracker] Insert failed:', error.message)
    }
  } catch (err) {
    // Silent failure — tracking must never break the UX
    console.warn('[onboarding tracker] Error:', err.message)
  }
}

/**
 * Track time spent on a screen. Call this when screen changes.
 * Returns a cleanup function that records time_on_screen when called.
 *
 * Usage in orchestrator:
 *   const stopTimer = startScreenTimer(screenNumber)
 *   // ... when screen changes:
 *   stopTimer() // records time_on_screen_ms for that screen
 *
 * @param {number} screenNumber
 * @returns {() => void} — call to record elapsed time
 */
export function startScreenTimer(screenNumber) {
  const startTime = Date.now()

  return () => {
    const elapsed = Date.now() - startTime
    trackOnboardingEvent(screenNumber, 'time_on_screen', {}, elapsed)
  }
}
