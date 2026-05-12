/**
 * irsSupabase.js — Data fetching layer for IRS calculation
 * Phase 3, Unit 2: Interview Readiness Score
 *
 * Uses raw REST API fetch to bypass the Supabase client's internal
 * getSession() call, which deadlocks after tab-switch while
 * _recoverAndRefresh holds the auth lock.
 *
 * Three parallel queries via Promise.all:
 *   1. user_streaks → current_streak
 *   2. practice_sessions → scores + question dedup
 *   3. questions → total count + narratives (for answer preparedness)
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Fetch all data needed to calculate IRS.
 * Returns structured data for irsCalculator functions, or null on error.
 *
 * @param {string} userId — caller must supply; avoids supabase.auth.getUser()
 *   which deadlocks after tab-switch while Supabase holds the auth lock.
 * @param {string} accessToken — raw token from sessionRef; bypasses
 *   supabase client getSession() which also deadlocks after tab-switch.
 * @returns {Promise<{
 *   currentStreak: number,
 *   scores: number[],
 *   uniquePracticed: number,
 *   totalQuestions: number,
 *   narratives: (string|null)[]
 * } | null>}
 */
export async function fetchIRSData(userId, accessToken) {
  if (!userId || !accessToken) return null;
  try {
    const headers = {
      'Authorization': `Bearer ${accessToken}`,
      'apikey': SUPABASE_ANON_KEY,
    };

    // Run three queries in parallel (Battle Scar #12: minimize latency)
    const [streakRes, sessionsRes, questionsRes] = await Promise.all([
      fetch(`${SUPABASE_URL}/rest/v1/user_streaks?user_id=eq.${userId}&select=current_streak&limit=1`, { headers }),
      fetch(`${SUPABASE_URL}/rest/v1/practice_sessions?user_id=eq.${userId}&select=question_id,question_text,ai_feedback`, { headers }),
      fetch(`${SUPABASE_URL}/rest/v1/questions?user_id=eq.${userId}&select=id,narrative`, { headers }),
    ]);

    // Extract current streak (default 0)
    const streakRows = streakRes.ok ? await streakRes.json().catch(() => []) : [];
    if (!streakRes.ok) console.warn('⚠️ IRS: streak query error (non-blocking):', streakRes.status);
    const currentStreak = (Array.isArray(streakRows) ? streakRows[0] : null)?.current_streak || 0;

    // Extract scores from ai_feedback JSON
    //    Score is at ai_feedback.overall (0-10) or ai_feedback.match_percentage / 10
    const sessions = sessionsRes.ok ? await sessionsRes.json().catch(() => []) : [];
    if (!sessionsRes.ok) console.warn('⚠️ IRS: sessions query error (non-blocking):', sessionsRes.status);

    const scores = sessions
      .map(s => {
        const fb = s.ai_feedback;
        if (!fb) return null;
        if (typeof fb.overall === 'number') return fb.overall;
        if (typeof fb.match_percentage === 'number') return fb.match_percentage / 10;
        return null;
      })
      .filter(s => s !== null);

    // Deduplicate practiced questions
    //    Use question_id first (UUID), fall back to question_text for older sessions
    const uniqueIds = new Set();
    const uniqueTexts = new Set();

    for (const session of sessions) {
      if (session.question_id) {
        uniqueIds.add(session.question_id);
      } else if (session.question_text) {
        uniqueTexts.add(session.question_text);
      }
    }

    const uniquePracticed = uniqueIds.size + uniqueTexts.size;

    // Questions: total count + narratives for answer preparedness
    const questionsData = questionsRes.ok ? await questionsRes.json().catch(() => []) : [];
    if (!questionsRes.ok) console.warn('⚠️ IRS: questions query error (non-blocking):', questionsRes.status);

    const totalQuestions = questionsData.length;
    const narratives = questionsData.map(q => q.narrative);

    return {
      currentStreak,
      scores,
      uniquePracticed,
      totalQuestions,
      narratives,
    };
  } catch (err) {
    console.warn('⚠️ IRS: fetchIRSData failed (non-blocking):', err);
    return null;
  }
}
