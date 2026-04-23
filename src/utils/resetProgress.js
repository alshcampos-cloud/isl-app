/**
 * resetProgress.js — Resets practice progress while keeping questions and answers.
 *
 * D.R.A.F.T. protocol: NEW file. No existing code modified.
 *
 * Resets: scores, sessions, streaks, learn progress, coach messages, session counts.
 * Keeps:  questions, saved answers, user profile, subscription.
 */

import { supabase } from '../lib/supabase';

/**
 * Reset all practice progress for a user.
 * @param {string} userId — auth user ID
 * @returns {Promise<{ success: boolean, errors?: string[] }>}
 */
export async function resetAllProgress(userId) {
  const errors = [];

  const executeOp = async (label, operation) => {
    try {
      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`${label} timed out`)), 10000)
      );
      const result = await Promise.race([operation, timeout]);
      if (result?.error) {
        console.warn(`⚠️ ${label} error:`, result.error.message);
        errors.push(`${label}: ${result.error.message}`);
      } else {
        console.log(`✅ Reset ${label}`);
      }
    } catch (err) {
      console.warn(`⚠️ ${label} failed:`, err.message);
      errors.push(`${label}: ${err.message}`);
    }
  };

  // Supabase resets (parallel for speed)
  await Promise.all([
    executeOp('practice_sessions',
      supabase.from('practice_sessions').delete().eq('user_id', userId)),
    executeOp('nursing_practice_sessions',
      supabase.from('nursing_practice_sessions').delete().eq('user_id', userId)),
    executeOp('nursing_flashcard_progress',
      supabase.from('nursing_flashcard_progress').delete().eq('user_id', userId)),
    executeOp('user_streaks', supabase
      .from('user_streaks')
      .update({
        current_streak: 0,
        // longest_streak preserved — all-time record should survive reset
        last_practice_date: null,
        freezes_used_this_week: 0,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)),
    executeOp('usage_tracking',
      supabase.from('usage_tracking').delete().eq('user_id', userId)),
  ]);

  // localStorage resets
  try {
    localStorage.removeItem('isl_history');
    localStorage.removeItem('isl_learn_progress');
    localStorage.removeItem(`isl_session_count_${userId}`);
    // Coach messages
    localStorage.removeItem(`isl_coach_messages_${userId}`);
    localStorage.removeItem('isl_coach_messages');
    localStorage.removeItem(`isl_nursing_coach_messages_${userId}`);
    localStorage.removeItem('isl_nursing_coach_messages');
    console.log('✅ localStorage progress cleared');
  } catch (err) {
    console.warn('⚠️ localStorage clear error:', err);
    errors.push('localStorage: ' + err.message);
  }

  return {
    success: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}
