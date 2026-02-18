// streakCalculator.js — Pure streak logic, no Supabase dependency
// Phase 3, Unit 1. D.R.A.F.T. protocol: NEW file.
//
// Rules (from PHASE_3_STREAKS_IRS.md):
// - Streak increments when user completes 1+ session in a calendar day
// - One free freeze per week (streak doesn't break if day is missed)
// - Missing a day WITHOUT freeze resets streak to 0
// - Milestones: 3, 7, 14, 30 days
// - Growth framing ONLY — no loss/guilt messaging

const MILESTONES = [3, 7, 14, 30];

/**
 * Get today's date as YYYY-MM-DD string in user's local timezone.
 * We use local dates because "today" should mean the user's today,
 * not UTC today (a user in PST finishing a session at 11pm should
 * get credit for today, not tomorrow).
 */
export function getLocalDateString(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Calculate the number of calendar days between two YYYY-MM-DD strings.
 * Returns positive if dateA is before dateB.
 */
function daysBetween(dateA, dateB) {
  const a = new Date(dateA + 'T00:00:00');
  const b = new Date(dateB + 'T00:00:00');
  return Math.round((b - a) / (1000 * 60 * 60 * 24));
}

/**
 * Calculate the new streak after a session completes.
 *
 * @param {string|null} lastPracticeDate — YYYY-MM-DD of last recorded session, or null
 * @param {number} currentStreak — current streak count (0 if none)
 * @returns {{ newStreak: number, streakBroken: boolean, isNewDay: boolean }}
 */
export function calculateStreak(lastPracticeDate, currentStreak) {
  const today = getLocalDateString();

  // First session ever
  if (!lastPracticeDate) {
    return { newStreak: 1, streakBroken: false, isNewDay: true };
  }

  const gap = daysBetween(lastPracticeDate, today);

  // Same day — already counted today
  if (gap === 0) {
    return { newStreak: currentStreak, streakBroken: false, isNewDay: false };
  }

  // Yesterday — streak continues
  if (gap === 1) {
    return { newStreak: currentStreak + 1, streakBroken: false, isNewDay: true };
  }

  // 2+ days gap — streak broken, today starts fresh at 1
  return { newStreak: 1, streakBroken: true, isNewDay: true };
}

/**
 * Check freeze availability.
 * 1 freeze per week. Week resets on Monday (ISO standard).
 *
 * @param {number} freezesUsedThisWeek — number of freezes used this week
 * @param {string|null} freezeWeekStart — YYYY-MM-DD of when current freeze week started
 * @returns {{ freezesRemaining: number, canFreeze: boolean, weekReset: boolean, newWeekStart: string }}
 */
export function checkFreeze(freezesUsedThisWeek, freezeWeekStart) {
  const today = new Date();
  const todayStr = getLocalDateString(today);

  // Calculate start of current ISO week (Monday)
  const dayOfWeek = today.getDay(); // 0=Sun, 1=Mon, ...
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset);
  const currentWeekStart = getLocalDateString(monday);

  // Check if the freeze week has rolled over
  const weekReset = !freezeWeekStart || freezeWeekStart < currentWeekStart;
  const effectiveUsed = weekReset ? 0 : freezesUsedThisWeek;
  const freezesRemaining = Math.max(0, 1 - effectiveUsed);

  return {
    freezesRemaining,
    canFreeze: freezesRemaining > 0,
    weekReset,
    newWeekStart: currentWeekStart,
  };
}

/**
 * Check if a streak value hits a milestone.
 * Returns the milestone number if it matches exactly, otherwise null.
 *
 * @param {number} streak — current streak value
 * @returns {number|null} — 3, 7, 14, or 30 if milestone hit; null otherwise
 */
export function getMilestone(streak) {
  return MILESTONES.includes(streak) ? streak : null;
}

/**
 * Get a growth-framed milestone message.
 * NO guilt/loss messaging. Growth framing ONLY.
 *
 * @param {number} milestone — 3, 7, 14, or 30
 * @returns {string}
 */
export function getMilestoneMessage(milestone) {
  switch (milestone) {
    case 3:
      return 'Three days in! Consistency is the foundation of interview confidence.';
    case 7:
      return 'One week strong! Your practice habit is taking shape.';
    case 14:
      return 'Two weeks of practice! Research shows this is when skills start to stick.';
    case 30:
      return 'A full month! You\'re building real, lasting interview readiness.';
    default:
      return `${milestone}-day streak! Keep building your interview skills.`;
  }
}
