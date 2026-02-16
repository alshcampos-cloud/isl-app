/**
 * irsSupabase.js — Data fetching layer for IRS calculation
 * Phase 3, Unit 2: Interview Readiness Score
 *
 * Follows streakSupabase.js pattern:
 * - Self-contained (calls supabase.auth.getUser internally)
 * - Fire-and-forget safe: errors logged, never thrown
 * - Returns null on any error (component renders nothing)
 *
 * Three parallel queries via Promise.all:
 *   1. user_streaks → current_streak
 *   2. practice_sessions → scores + question dedup
 *   3. questions → total count + narratives (for answer preparedness)
 */

import { supabase } from '../../lib/supabase';

/**
 * Fetch all data needed to calculate IRS.
 * Returns structured data for irsCalculator functions, or null on error.
 *
 * @returns {Promise<{
 *   currentStreak: number,
 *   scores: number[],
 *   uniquePracticed: number,
 *   totalQuestions: number,
 *   narratives: (string|null)[]
 * } | null>}
 */
export async function fetchIRSData() {
  try {
    // 1. Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      // Not logged in — not an error, just no data
      return null;
    }

    const userId = user.id;

    // 2. Run three queries in parallel (Battle Scar #12: minimize latency)
    const [streakResult, sessionsResult, questionsResult] = await Promise.all([
      // Query 1: Current streak from user_streaks
      supabase
        .from('user_streaks')
        .select('current_streak')
        .eq('user_id', userId)
        .maybeSingle(),

      // Query 2: Practice sessions — need scores + question identifiers for dedup
      supabase
        .from('practice_sessions')
        .select('question_id, question_text, ai_feedback')
        .eq('user_id', userId),

      // Query 3: Questions in user's bank — need narratives for answer preparedness
      supabase
        .from('questions')
        .select('id, narrative')
        .eq('user_id', userId),
    ]);

    // 3. Extract current streak (default 0)
    const currentStreak = streakResult.data?.current_streak || 0;
    if (streakResult.error) {
      console.warn('⚠️ IRS: streak query error (non-blocking):', streakResult.error.message);
    }

    // 4. Extract scores from ai_feedback JSON
    //    Score is at ai_feedback.overall (0-10) or ai_feedback.match_percentage / 10
    const sessions = sessionsResult.data || [];
    if (sessionsResult.error) {
      console.warn('⚠️ IRS: sessions query error (non-blocking):', sessionsResult.error.message);
    }

    const scores = sessions
      .map(s => {
        const fb = s.ai_feedback;
        if (!fb) return null;
        if (typeof fb.overall === 'number') return fb.overall;
        if (typeof fb.match_percentage === 'number') return fb.match_percentage / 10;
        return null;
      })
      .filter(s => s !== null);

    // 5. Deduplicate practiced questions
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

    // 6. Questions: total count + narratives for answer preparedness
    const questionsData = questionsResult.data || [];
    if (questionsResult.error) {
      console.warn('⚠️ IRS: questions query error (non-blocking):', questionsResult.error.message);
    }

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
