/**
 * irsCalculator.js — Pure IRS calculation functions
 * Phase 3, Unit 2: Interview Readiness Score
 *
 * Formula (from PRODUCT_ARCHITECTURE.md):
 *   consistency   = min(currentStreak / 14, 1.0) * 100
 *   starAdherence = (avgScore / 10) * 100          [general track: 0-10 scale]
 *   coverage      = min(uniquePracticed / total, 1.0) * 100
 *   IRS           = round((consistency + starAdherence + coverage) / 3)
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

// ── Composite Score ────────────────────────────────────────

/**
 * Calculate final IRS from three components
 * @param {number} consistency - 0-100
 * @param {number} starAdherence - 0-100
 * @param {number} coverage - 0-100
 * @returns {number} 0-100 (rounded integer)
 */
export function calculateIRS(consistency, starAdherence, coverage) {
  return Math.round((consistency + starAdherence + coverage) / 3);
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
 * Get actionable growth tip targeting the weakest IRS component
 * @param {number} consistency - 0-100
 * @param {number} starAdherence - 0-100
 * @param {number} coverage - 0-100
 * @returns {string}
 */
export function getGrowthTip(consistency, starAdherence, coverage) {
  const weakest = Math.min(consistency, starAdherence, coverage);
  if (weakest === consistency && consistency < 100) {
    return 'Practice daily to build your consistency score.';
  }
  if (weakest === starAdherence) {
    return 'Focus on STAR structure in your answers to boost quality.';
  }
  if (weakest === coverage) {
    return 'Try new questions to expand your coverage.';
  }
  return 'Keep practicing to maintain your readiness.';
}
