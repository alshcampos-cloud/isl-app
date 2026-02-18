/**
 * nursingIRSData.js — Data fetching layer for Nursing IRS calculation
 * Phase 3, Unit 3. D.R.A.F.T. protocol: NEW file.
 *
 * Parallel to irsSupabase.js but queries nursing-specific tables:
 *   - user_streaks          → current_streak (shared with general track)
 *   - nursing_practice_sessions → scores (1-5 scale) + question dedup
 *   - nursing_saved_answers     → answer texts (for preparedness)
 *   - nursing_questions         → total question count
 *
 * Returns the same shape as fetchIRSData() so irsCalculator.js works unchanged.
 * Caller must pass scale='nursing' to calculateStarAdherence().
 *
 * Errors are logged, never thrown. Returns null on any failure.
 */

import { supabase } from '../../lib/supabase';

/**
 * Fetch all data needed to calculate IRS for the nursing track.
 *
 * @param {string} userId — authenticated user ID
 * @param {string} specialtyId — nursing specialty (e.g. 'general', 'icu')
 * @returns {Promise<{
 *   currentStreak: number,
 *   scores: number[],
 *   uniquePracticed: number,
 *   totalQuestions: number,
 *   narratives: (string|null)[]
 * } | null>}
 */
export async function fetchNursingIRSData(userId, specialtyId) {
  try {
    if (!userId) return null;

    // Run queries in parallel (Battle Scar #12: minimize latency)
    const [streakResult, sessionsResult, questionsResult, answersResult] = await Promise.all([
      // 1. Current streak from user_streaks (shared table)
      supabase
        .from('user_streaks')
        .select('current_streak')
        .eq('user_id', userId)
        .maybeSingle(),

      // 2. Nursing practice sessions — scores + question codes for dedup
      supabase
        .from('nursing_practice_sessions')
        .select('question_code, score')
        .eq('user_id', userId),

      // 3. Total nursing questions for this specialty
      supabase
        .from('nursing_questions')
        .select('question_code', { count: 'exact', head: true })
        .or(`specialty_id.eq.general,specialty_id.is.null${specialtyId !== 'general' ? `,specialty_id.eq.${specialtyId}` : ''}`)
        .eq('is_active', true),

      // 4. Saved answers (for answer preparedness)
      supabase
        .from('nursing_saved_answers')
        .select('question_code, answer_text')
        .eq('user_id', userId),
    ]);

    // Extract current streak (default 0)
    const currentStreak = streakResult.data?.current_streak || 0;
    if (streakResult.error) {
      console.warn('⚠️ Nursing IRS: streak query error (non-blocking):', streakResult.error.message);
    }

    // Extract scores (1-5 scale, raw values)
    const sessions = sessionsResult.data || [];
    if (sessionsResult.error) {
      console.warn('⚠️ Nursing IRS: sessions query error (non-blocking):', sessionsResult.error.message);
    }

    const scores = sessions
      .map(s => s.score)
      .filter(s => s !== null && s !== undefined);

    // Deduplicate practiced questions by question_code
    const uniqueCodes = new Set();
    for (const session of sessions) {
      if (session.question_code) {
        uniqueCodes.add(session.question_code);
      }
    }
    const uniquePracticed = uniqueCodes.size;

    // Total questions count
    const totalQuestions = questionsResult.count || 0;
    if (questionsResult.error) {
      console.warn('⚠️ Nursing IRS: questions count error (non-blocking):', questionsResult.error.message);
    }

    // Saved answers → narratives array for answer preparedness
    const answers = answersResult.data || [];
    if (answersResult.error) {
      console.warn('⚠️ Nursing IRS: saved answers error (non-blocking):', answersResult.error.message);
    }
    const narratives = answers.map(a => a.answer_text);

    return {
      currentStreak,
      scores,
      uniquePracticed,
      totalQuestions,
      narratives,
    };
  } catch (err) {
    console.warn('⚠️ Nursing IRS: fetchNursingIRSData failed (non-blocking):', err);
    return null;
  }
}
