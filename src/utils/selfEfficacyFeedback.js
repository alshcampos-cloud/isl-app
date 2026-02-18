/**
 * selfEfficacyFeedback.js
 *
 * Generates a system-prompt addendum that instructs the AI to include
 * all four self-efficacy sources (Huang & Mayer 2020) in every feedback
 * response:
 *   1. Mastery Experience — compare to user's own past performance
 *   2. Vicarious Learning — social proof (non-competitive)
 *   3. Verbal Persuasion — growth-mindset encouragement
 *   4. Physiological Management — state-management prompt
 *
 * Phase 1 of the Product Architecture roadmap.
 * See: docs/PRODUCT_ARCHITECTURE.md → "Feedback Framework: Supportive-Specific-Actionable"
 *
 * Usage:
 *   import { buildSelfEfficacyPrompt } from '../utils/selfEfficacyFeedback';
 *   const addendum = buildSelfEfficacyPrompt({ ... });
 *   const fullPrompt = existingSystemPrompt + '\n\n' + addendum;
 *
 * This file is a pure string builder with ZERO side effects.
 * It imports nothing and depends on nothing.
 */

/**
 * @param {Object} sessionData
 * @param {string} sessionData.currentAnswer - The user's current answer text
 * @param {string} sessionData.questionText - The interview question
 * @param {number[]} sessionData.previousScores - Array of past session scores (empty = first-timer)
 * @param {number} sessionData.streakDays - Consecutive practice days (0 = no streak)
 * @param {number} sessionData.questionsCompleted - Total questions user has completed
 * @param {number} sessionData.totalQuestions - Total questions available in bank
 * @returns {string} Prompt addendum to append to existing system prompt
 */
export function buildSelfEfficacyPrompt(sessionData) {
  const {
    previousScores = [],
    streakDays = 0,
    questionsCompleted = 0,
    totalQuestions = 0,
  } = sessionData || {};

  const isFirstTime = previousScores.length === 0 && questionsCompleted === 0;
  const hasHistory = previousScores.length > 0;

  // Build mastery context for the AI
  let masteryContext = '';
  if (isFirstTime) {
    masteryContext = 'This is the user\'s FIRST practice session. Celebrate that they started — "You just completed your first practice — that\'s the hardest step."';
  } else if (hasHistory) {
    const recentAvg = previousScores.slice(-3).reduce((a, b) => a + b, 0) / Math.min(previousScores.length, 3);
    const olderScores = previousScores.slice(0, -3);
    const olderAvg = olderScores.length > 0
      ? olderScores.reduce((a, b) => a + b, 0) / olderScores.length
      : null;

    masteryContext = `User has completed ${questionsCompleted} question(s). `;
    masteryContext += `Their last ${Math.min(previousScores.length, 3)} score(s) average ${recentAvg.toFixed(1)}.`;
    if (olderAvg !== null) {
      const delta = recentAvg - olderAvg;
      if (delta > 0) {
        masteryContext += ` Their earlier average was ${olderAvg.toFixed(1)} — they have improved by ${delta.toFixed(1)} points.`;
      } else if (delta < 0) {
        masteryContext += ` Their earlier average was ${olderAvg.toFixed(1)}. Encourage them — scores fluctuate and one session doesn't define progress.`;
      } else {
        masteryContext += ` They've been consistent — acknowledge their steady practice.`;
      }
    }
  } else {
    masteryContext = `User has completed ${questionsCompleted} question(s) but no scores are available yet. Acknowledge their continued practice.`;
  }

  // Build streak context
  let streakContext = '';
  if (streakDays >= 7) {
    streakContext = `User is on a ${streakDays}-day streak. This is exceptional consistency.`;
  } else if (streakDays >= 3) {
    streakContext = `User is on a ${streakDays}-day streak. They're building a solid habit.`;
  } else if (streakDays === 1) {
    streakContext = 'User practiced yesterday too. They\'re starting a streak.';
  }

  // Build coverage context
  let coverageContext = '';
  if (totalQuestions > 0 && questionsCompleted > 0) {
    const pct = Math.round((questionsCompleted / totalQuestions) * 100);
    coverageContext = `They've practiced ${questionsCompleted} of ${totalQuestions} available questions (${pct}% coverage).`;
  }

  return `
SELF-EFFICACY FEEDBACK REQUIREMENTS (MANDATORY — include ALL four in your response):

${masteryContext}
${streakContext}
${coverageContext}

You MUST weave ALL FOUR of the following into your feedback response. Do not create separate labeled sections for them — integrate them naturally into your existing feedback structure:

1. MASTERY ACKNOWLEDGMENT: Reference the user's own progress data above. Compare to their past performance if available. If first time, celebrate starting. Be specific — cite actual numbers when you have them. Example: "Your STAR structure has tightened up — your Situation setup is more concise than your recent average."

2. VICARIOUS REFERENCE: Include ONE brief social-proof statement (non-competitive, encouraging). Examples:
   - "Users who practice at this consistency level typically see their scores climb 15+ points over the next week."
   - "Most people find that the third session is where real breakthroughs happen."
   - "Candidates who drill this type of question tend to feel noticeably more confident in real interviews."

3. VERBAL PERSUASION (growth-mindset): Include ONE specific, credible encouragement tied to something observable in their answer. NEVER generic ("Great job!"). Always reference what they actually did. Examples:
   - "The way you structured your Action section shows you're building the muscle memory for clear storytelling."
   - "Interview skills improve with practice, not talent — you're building neural pathways right now."

4. PHYSIOLOGICAL CHECK: End your feedback with ONE brief state-management prompt. Examples:
   - "Before your next question, take one deep breath — research shows this activates your parasympathetic nervous system and improves recall."
   - "Roll your shoulders back and take a slow exhale before continuing — it resets your focus."
   - "Pause for 3 seconds before your next answer. Top interviewees use this to gather their thoughts."

IMPORTANT: These four elements should feel natural and woven into your coaching voice — NOT like a checklist. The user should feel supported, not evaluated.`;
}
