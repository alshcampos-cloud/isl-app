// learningProgress.js — localStorage persistence for Learn section progress
// Phase 5, Sprint 2. D.R.A.F.T. protocol: NEW file.
//
// Stores lesson completion, quiz scores, module progression, daily goals, and streaks.
// Uses localStorage with 'isl_learn_progress' key.
// Will migrate to Supabase later — same pattern as sparkNotes caching.
//
// Data shape:
// {
//   lessonsCompleted: { "1-1": { score: 3, completedAt: "2026-03-13T..." }, ... },
//   currentModule: 1,
//   currentLesson: "1-1",
//   totalStars: 0,
//   lastLessonDate: null,
//   dailyGoalMet: false,
//   monthlyLessonCount: 0,
//   monthKey: "2026-03"
// }

const STORAGE_KEY = 'isl_learn_progress'

const DEFAULT_PROGRESS = {
  lessonsCompleted: {},
  currentModule: 1,
  currentLesson: '1-1',
  totalStars: 0,
  lastLessonDate: null,
  dailyGoalMet: false,
  monthlyLessonCount: 0,
  monthKey: null,
}

/**
 * Read progress from localStorage.
 * Returns defaults if nothing stored yet.
 */
export function getProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT_PROGRESS }
    const parsed = JSON.parse(raw)
    // Reset daily goal if it's a new day
    const today = new Date().toISOString().split('T')[0]
    if (parsed.lastLessonDate !== today) {
      parsed.dailyGoalMet = false
    }
    // Reset monthly count if new month
    const currentMonth = today.substring(0, 7) // "2026-03"
    if (parsed.monthKey !== currentMonth) {
      parsed.monthlyLessonCount = 0
      parsed.monthKey = currentMonth
    }
    return { ...DEFAULT_PROGRESS, ...parsed }
  } catch (err) {
    console.warn('⚠️ Learn progress read error:', err)
    return { ...DEFAULT_PROGRESS }
  }
}

/**
 * Save progress to localStorage.
 */
export function saveProgress(progress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
  } catch (err) {
    console.warn('⚠️ Learn progress save error:', err)
  }
}

/**
 * Mark a lesson as completed with the user's quiz score.
 * Updates: lessonsCompleted, totalStars, currentLesson, dailyGoalMet, monthlyLessonCount.
 *
 * @param {string} lessonId — e.g., "1-3"
 * @param {number} score — quiz score (0-3)
 * @param {string|null} nextLessonId — ID of the next lesson (null if last)
 * @returns {object} — updated progress + { isNewCompletion, previousScore }
 */
export function completeLesson(lessonId, score, nextLessonId) {
  const progress = getProgress()
  const today = new Date().toISOString().split('T')[0]
  const currentMonth = today.substring(0, 7)

  const existing = progress.lessonsCompleted[lessonId]
  const isNewCompletion = !existing
  const previousScore = existing?.score ?? 0

  // Update or create completion record
  progress.lessonsCompleted[lessonId] = {
    score: Math.max(score, previousScore), // Keep best score
    completedAt: existing?.completedAt || new Date().toISOString(),
    lastAttemptAt: new Date().toISOString(),
  }

  // Recalculate total stars from all completions
  progress.totalStars = Object.values(progress.lessonsCompleted)
    .reduce((sum, l) => sum + (l.score || 0), 0)

  // Advance to next lesson
  if (nextLessonId) {
    progress.currentLesson = nextLessonId
    // Extract module number from lesson ID
    const nextModule = parseInt(nextLessonId.split('-')[0], 10)
    if (nextModule > progress.currentModule) {
      progress.currentModule = nextModule
    }
  }

  // Daily goal: complete 1 lesson per day
  progress.lastLessonDate = today
  progress.dailyGoalMet = true

  // Monthly tracking (for tier gating)
  if (progress.monthKey !== currentMonth) {
    progress.monthlyLessonCount = 0
    progress.monthKey = currentMonth
  }
  if (isNewCompletion) {
    progress.monthlyLessonCount += 1
  }

  saveProgress(progress)

  return {
    ...progress,
    isNewCompletion,
    previousScore,
  }
}

/**
 * Check if a specific lesson is completed.
 */
export function isLessonCompleted(lessonId) {
  const progress = getProgress()
  return !!progress.lessonsCompleted[lessonId]
}

/**
 * Get the score for a specific lesson (or 0 if not completed).
 */
export function getLessonScore(lessonId) {
  const progress = getProgress()
  return progress.lessonsCompleted[lessonId]?.score ?? 0
}

/**
 * Check if a module is unlocked.
 * Module N is unlocked if all lessons in Module N-1 are completed.
 * Module 1 is always unlocked.
 *
 * @param {number} moduleNum — 1-4
 * @param {Array} modules — LEARNING_MODULES array from learningContent.js
 * @returns {boolean}
 */
export function isModuleUnlocked(moduleNum, modules) {
  if (moduleNum <= 1) return true

  const progress = getProgress()
  const prevModule = modules.find(m => m.id === moduleNum - 1)
  if (!prevModule) return false

  // All lessons in previous module must be completed
  return prevModule.lessons.every(lesson =>
    !!progress.lessonsCompleted[lesson.id]
  )
}

/**
 * Get completion count for a specific module.
 *
 * @param {number} moduleNum — 1-4
 * @param {Array} modules — LEARNING_MODULES array
 * @returns {{ completed: number, total: number, stars: number, maxStars: number }}
 */
export function getModuleProgress(moduleNum, modules) {
  const progress = getProgress()
  const module = modules.find(m => m.id === moduleNum)
  if (!module) return { completed: 0, total: 0, stars: 0, maxStars: 0 }

  let completed = 0
  let stars = 0
  const total = module.lessons.length
  const maxStars = total * 3

  for (const lesson of module.lessons) {
    const record = progress.lessonsCompleted[lesson.id]
    if (record) {
      completed++
      stars += record.score || 0
    }
  }

  return { completed, total, stars, maxStars }
}

/**
 * Get overall progress across all modules.
 *
 * @param {Array} modules — LEARNING_MODULES array
 * @returns {{ completedLessons: number, totalLessons: number, totalStars: number, maxStars: number, percentComplete: number }}
 */
export function getOverallProgress(modules) {
  const progress = getProgress()
  let totalLessons = 0
  let maxStars = 0

  for (const mod of modules) {
    totalLessons += mod.lessons.length
    maxStars += mod.lessons.length * 3
  }

  const completedLessons = Object.keys(progress.lessonsCompleted).length

  return {
    completedLessons,
    totalLessons,
    totalStars: progress.totalStars,
    maxStars,
    percentComplete: totalLessons > 0
      ? Math.round((completedLessons / totalLessons) * 100)
      : 0,
  }
}

/**
 * Get the next lesson to show the user (resume point).
 * Finds the first uncompleted lesson across unlocked modules.
 *
 * @param {Array} modules — LEARNING_MODULES array
 * @returns {{ lessonId: string, moduleId: number, title: string } | null}
 */
export function getNextUncompletedLesson(modules) {
  const progress = getProgress()

  for (const mod of modules) {
    if (!isModuleUnlocked(mod.id, modules)) continue

    for (const lesson of mod.lessons) {
      if (!progress.lessonsCompleted[lesson.id]) {
        return {
          lessonId: lesson.id,
          moduleId: mod.id,
          title: lesson.title,
        }
      }
    }
  }

  return null // All complete!
}

/**
 * Get list of recently completed lesson IDs (for Prep Radio "Learn Review" playlist).
 * Returns the 3 most recently completed, sorted by completedAt desc.
 *
 * @returns {string[]} — array of lesson IDs, e.g., ["1-3", "1-2", "1-1"]
 */
export function getRecentlyCompletedLessons() {
  const progress = getProgress()
  const entries = Object.entries(progress.lessonsCompleted)
    .filter(([, val]) => val.completedAt)
    .sort((a, b) => new Date(b[1].completedAt) - new Date(a[1].completedAt))
    .slice(0, 3)

  return entries.map(([id]) => id)
}

/**
 * Check if the user has hit their monthly lesson limit for their tier.
 *
 * @param {string} tier — from resolveEffectiveTier()
 * @returns {{ canAccess: boolean, used: number, limit: number }}
 */
export function checkLessonLimit(tier) {
  const progress = getProgress()
  const currentMonth = new Date().toISOString().substring(0, 7)

  // Reset if new month
  if (progress.monthKey !== currentMonth) {
    return { canAccess: true, used: 0, limit: getLessonLimitForTier(tier) }
  }

  const limit = getLessonLimitForTier(tier)
  return {
    canAccess: progress.monthlyLessonCount < limit,
    used: progress.monthlyLessonCount,
    limit,
  }
}

/**
 * Monthly lesson limits by tier.
 * Matches the plan: Free=5, Trial=unlimited, Pass=15, Pro=unlimited
 */
function getLessonLimitForTier(tier) {
  switch (tier) {
    case 'free': return 5
    case 'trial': return 999999
    case 'general_pass': return 15
    case 'nursing_pass': return 15
    case 'annual': return 999999
    case 'pro': return 999999
    case 'beta': return 999999
    default: return 5
  }
}

/**
 * Reset all progress (for testing/debug).
 */
export function resetProgress() {
  localStorage.removeItem(STORAGE_KEY)
}
