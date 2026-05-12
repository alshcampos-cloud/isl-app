// streakSupabase.js — Database layer for streak persistence
// Phase 3, Unit 1. D.R.A.F.T. protocol: NEW file.
//
// Follows creditSystem.js pattern: read → calculate → upsert.
// All functions are fire-and-forget safe: errors logged, never thrown to caller.
// Battle Scar #8: streak updates happen AFTER session success, never before.

import { calculateStreak, checkFreeze, getMilestone, getLocalDateString } from './streakCalculator';

const DEFAULT_STREAK = {
  current_streak: 0,
  longest_streak: 0,
  last_practice_date: null,
  freezes_used_this_week: 0,
  freeze_week_start: null,
};

/**
 * Fetch the user's current streak data from Supabase.
 * Returns defaults if no row exists yet.
 *
 * @param {object} supabase — Supabase client
 * @param {string} userId — auth user ID
 * @returns {Promise<object>} streak data
 */
export async function fetchStreak(supabase, userId, accessToken) {
  try {
    // Raw fetch path: avoids supabase client getSession() which deadlocks
    // after tab-switch while _recoverAndRefresh holds the auth lock.
    if (accessToken) {
      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
      const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/user_streaks?user_id=eq.${userId}&select=*&limit=1`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'apikey': SUPABASE_ANON_KEY,
          },
        }
      );
      if (!res.ok) {
        console.warn('⚠️ Streak fetch error:', res.status);
        return { ...DEFAULT_STREAK };
      }
      const rows = await res.json().catch(() => []);
      const data = Array.isArray(rows) ? rows[0] : null;
      return data || { ...DEFAULT_STREAK };
    }

    const { data, error } = await supabase
      .from('user_streaks')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.warn('⚠️ Streak fetch error:', error.message);
      return { ...DEFAULT_STREAK };
    }

    return data || { ...DEFAULT_STREAK };
  } catch (err) {
    console.warn('⚠️ Streak fetch failed:', err);
    return { ...DEFAULT_STREAK };
  }
}

/**
 * Update the user's streak after a successful session.
 * Call this AFTER incrementUsage / session save succeeds.
 *
 * This is idempotent for same-day calls (streak won't double-increment).
 * Fire-and-forget safe — never throws, always returns a result or null.
 *
 * @param {object} supabase — Supabase client
 * @param {string} userId — auth user ID
 * @returns {Promise<{ currentStreak: number, longestStreak: number, milestone: number|null, isNewDay: boolean }|null>}
 */
export async function updateStreakAfterSession(supabase, userId) {
  try {
    // 1. Fetch current streak
    const current = await fetchStreak(supabase, userId);

    // 2. Calculate new streak
    const { newStreak, streakBroken, isNewDay } = calculateStreak(
      current.last_practice_date,
      current.current_streak
    );

    // Same day — no DB write needed, return current state
    if (!isNewDay) {
      return {
        currentStreak: current.current_streak,
        longestStreak: current.longest_streak,
        milestone: null,
        isNewDay: false,
      };
    }

    // 3. Check if freeze should have saved the streak (streak was broken but freeze available)
    let finalStreak = newStreak;
    let freezeUsed = false;

    if (streakBroken && current.current_streak > 0) {
      const freezeCheck = checkFreeze(
        current.freezes_used_this_week,
        current.freeze_week_start
      );
      // Auto-freeze: if streak would break AND freeze is available, save the streak
      // User gets the benefit automatically — no manual activation needed for auto-recovery
      // Manual freeze activation is for PLANNED rest days (future feature refinement)
      if (freezeCheck.canFreeze) {
        // Streak was 1 day broken — freeze covers the gap, continue from previous streak + today
        finalStreak = current.current_streak + 1;
        freezeUsed = true;
      }
    }

    const newLongest = Math.max(current.longest_streak, finalStreak);
    const today = getLocalDateString();
    const milestone = getMilestone(finalStreak);

    // 4. Upsert to database
    const freezeInfo = checkFreeze(
      current.freezes_used_this_week,
      current.freeze_week_start
    );

    const upsertData = {
      user_id: userId,
      current_streak: finalStreak,
      longest_streak: newLongest,
      last_practice_date: today,
      freezes_used_this_week: freezeUsed
        ? (freezeInfo.weekReset ? 1 : current.freezes_used_this_week + 1)
        : (freezeInfo.weekReset ? 0 : current.freezes_used_this_week),
      freeze_week_start: freezeInfo.newWeekStart,
      updated_at: new Date().toISOString(),
    };

    const { error: upsertError } = await supabase
      .from('user_streaks')
      .upsert(upsertData, { onConflict: 'user_id' });

    if (upsertError) {
      console.warn('⚠️ Streak upsert error:', upsertError.message);
      // Still return calculated values even if DB write failed
    } else {
      console.log(`🔥 Streak updated: ${finalStreak} days${freezeUsed ? ' (freeze used)' : ''}${milestone ? ` — milestone ${milestone}!` : ''}`);
    }

    return {
      currentStreak: finalStreak,
      longestStreak: newLongest,
      milestone,
      isNewDay: true,
    };
  } catch (err) {
    console.warn('⚠️ Streak update failed (non-blocking):', err);
    return null;
  }
}

/**
 * Manually activate a streak freeze for a planned rest day.
 * (Future refinement — for now, freezes auto-apply on streak recovery)
 *
 * @param {object} supabase — Supabase client
 * @param {string} userId — auth user ID
 * @returns {Promise<boolean>} — true if freeze activated successfully
 */
export async function activateFreeze(supabase, userId) {
  try {
    const current = await fetchStreak(supabase, userId);
    const freezeCheck = checkFreeze(
      current.freezes_used_this_week,
      current.freeze_week_start
    );

    if (!freezeCheck.canFreeze) {
      console.log('❄️ No freezes remaining this week');
      return false;
    }

    const { error } = await supabase
      .from('user_streaks')
      .upsert({
        user_id: userId,
        freezes_used_this_week: freezeCheck.weekReset ? 1 : current.freezes_used_this_week + 1,
        freeze_week_start: freezeCheck.newWeekStart,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

    if (error) {
      console.warn('⚠️ Freeze activation error:', error.message);
      return false;
    }

    console.log('❄️ Streak freeze activated');
    return true;
  } catch (err) {
    console.warn('⚠️ Freeze activation failed:', err);
    return false;
  }
}
