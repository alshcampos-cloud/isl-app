/**
 * irsCalculator.js — Pure IRS calculation functions
 * Phase 3, Unit 2: Interview Readiness Score
 *
 * Formula (v1.1 — 4 equally-weighted components):
 *   consistency       = min(currentStreak / 14, 1.0) * 100
 *   starAdherence     = (avgScore / 10) * 100          [general track: 0-10 scale]
 *   coverage          = min(uniquePracticed / total, 1.0) * 100
 *   answerPreparedness = (personalizedAnswers / totalQuestions) * 100
 *   IRS               = round((consistency + starAdherence + coverage + answerPreparedness) / 4)
 *
 * Zero external dependencies. Testable in isolation.
 */

// ── Component Calculators ──────────────────────────────────

/**
 * Session consistency: streak days / 14, capped at 1.0
 * @param {number} currentStreak - Current streak day count (from user_streaks table)
 * @returns {number} 0-100
 */
export function calculateConsistency(currentStreak) {
  return Math.min((currentStreak || 0) / 14, 1.0) * 100;
}

/**
 * STAR structure adherence: average AI assessment score normalized to 0-100
 * @param {number[]} scores - Array of score values
 * @param {'general'|'nursing'} scale - Score scale ('general' = 0-10, 'nursing' = 1-5)
 * @returns {number} 0-100
 */
export function calculateStarAdherence(scores, scale = 'general') {
  if (!scores || scores.length === 0) return 0;
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  if (scale === 'nursing') {
    // Nursing: 1-5 scale → normalize so 1=0%, 5=100%
    return Math.max(0, ((avg - 1) / 4)) * 100;
  }
  // General: 0-10 scale → normalize so 0=0%, 10=100%
  return Math.min((avg / 10), 1.0) * 100;
}

/**
 * Question coverage: unique questions practiced / total in bank
 * @param {number} uniquePracticed - Count of unique questions attempted
 * @param {number} totalInBank - Total questions available to user
 * @returns {number} 0-100
 */
export function calculateCoverage(uniquePracticed, totalInBank) {
  if (!totalInBank || totalInBank <= 0) return 0;
  return Math.min((uniquePracticed || 0) / totalInBank, 1.0) * 100;
}

/**
 * Check if a narrative is a truly personalized answer (not a template).
 * Default questions ship with [UPPERCASE_PLACEHOLDER] patterns like [TITLE], [COMPANY].
 * A personalized answer has real content without these template markers.
 *
 * @param {string|null} narrative - The answer text
 * @returns {boolean} true if personalized, false if template/empty
 */
export function isPersonalizedAnswer(narrative) {
  if (!narrative || typeof narrative !== 'string' || narrative.trim().length === 0) {
    return false;
  }
  // Template placeholders are UPPERCASE words inside brackets: [TITLE], [COMPANY], [KEY RESPONSIBILITY]
  // This regex matches [TWO_OR_MORE_UPPERCASE_CHARS] patterns
  const templatePattern = /\[[A-Z][A-Z\s_/\-]{1,}\]/;
  return !templatePattern.test(narrative);
}

/**
 * Answer preparedness: personalized answers / total questions in bank
 * @param {(string|null)[]} narratives - Array of narrative texts from questions
 * @param {number} totalQuestions - Total questions in user's bank
 * @returns {number} 0-100
 */
export function calculateAnswerPreparedness(narratives, totalQuestions) {
  if (!totalQuestions || totalQuestions <= 0) return 0;
  if (!narratives || narratives.length === 0) return 0;
  const personalizedCount = narratives.filter(n => isPersonalizedAnswer(n)).length;
  return Math.min((personalizedCount / totalQuestions), 1.0) * 100;
}

// ── Composite Score ────────────────────────────────────────

/**
 * Calculate final IRS from four components
 * @param {number} consistency - 0-100
 * @param {number} starAdherence - 0-100
 * @param {number} coverage - 0-100
 * @param {number} answerPreparedness - 0-100
 * @returns {number} 0-100 (rounded integer)
 */
export function calculateIRS(consistency, starAdherence, coverage, answerPreparedness) {
  return Math.round((consistency + starAdherence + coverage + (answerPreparedness || 0)) / 4);
}

// ── Level & Messaging (growth framing only) ────────────────

/**
 * Get growth-framed level label for a given IRS score
 * No loss/guilt messaging — always forward-looking
 * @param {number} score - IRS 0-100
 * @returns {{ label: string, color: string }}
 */
export function getIRSLevel(score) {
  if (score >= 80) return { label: 'Interview Ready', color: 'emerald' };
  if (score >= 60) return { label: 'Building Strong', color: 'teal' };
  if (score >= 40) return { label: 'Growing', color: 'blue' };
  if (score >= 20) return { label: 'Getting Started', color: 'indigo' };
  return { label: 'Just Beginning', color: 'slate' };
}

/**
 * Build a pool of relevant growth tips based on which components have room to grow.
 * Returns all applicable tips — caller picks which one to display (e.g., rotating).
 *
 * @param {number} consistency - 0-100
 * @param {number} starAdherence - 0-100
 * @param {number} coverage - 0-100
 * @param {number} answerPreparedness - 0-100
 * @returns {string[]} Array of growth tips (at least 1)
 */
export function getGrowthTips(consistency, starAdherence, coverage, answerPreparedness = 0) {
  const tips = [];

  // Answer preparedness tips (< 100 means room to grow)
  if (answerPreparedness < 100) {
    tips.push('Personalize your answers using the AI Coach to boost your preparedness.');
    if (answerPreparedness < 50) {
      tips.push('Your Live Prompter works best with personalized answers — not templates.');
    }
    if (answerPreparedness > 0 && answerPreparedness < 100) {
      tips.push("You've started personalizing — keep going to complete your answer bank.");
    }
  }

  // Consistency tips
  if (consistency < 100) {
    tips.push('Practice daily to build your consistency score.');
    if (consistency < 30) {
      tips.push('Even 5 minutes a day builds interview confidence over time.');
    }
    if (consistency >= 50) {
      tips.push("Your streak is building momentum — don't break the chain!");
    }
  }

  // Quality / STAR adherence tips
  if (starAdherence < 100) {
    tips.push('Focus on STAR structure in your answers to boost quality.');
    if (starAdherence < 50) {
      tips.push('Try starting answers with a specific situation to set the scene.');
    }
    if (starAdherence >= 50) {
      tips.push('Your answer quality is improving — add measurable results for even higher scores.');
    }
  }

  // Coverage tips
  if (coverage < 100) {
    tips.push('Try new questions to expand your coverage.');
    if (coverage < 30) {
      tips.push('Practicing different question types prepares you for surprises.');
    }
    if (coverage >= 50) {
      tips.push("You've covered half your bank — the remaining questions could be the ones they ask.");
    }
  }

  // Fallback if everything is at 100 (unlikely but handle it)
  if (tips.length === 0) {
    tips.push('Keep practicing to maintain your readiness.');
    tips.push("You're interview ready — a quick daily session keeps you sharp.");
  }

  return tips;
}

/**
 * Get a single growth tip (legacy compat + simple usage).
 * Picks the tip for the weakest component.
 *
 * @param {number} consistency - 0-100
 * @param {number} starAdherence - 0-100
 * @param {number} coverage - 0-100
 * @param {number} answerPreparedness - 0-100
 * @returns {string}
 */
export function getGrowthTip(consistency, starAdherence, coverage, answerPreparedness = 0) {
  const tips = getGrowthTips(consistency, starAdherence, coverage, answerPreparedness);
  return tips[0];
}
