/**
 * deliveryPromptBuilder.js — Builds a delivery context addendum for AI feedback prompts.
 *
 * Phase 4C: Passes delivery metrics INTO the AI prompt so feedback includes
 * a "Delivery Note" with actionable coaching on filler words, pacing, and hedging.
 *
 * Usage:
 *   const deliveryContext = buildDeliveryContext(answer, durationSeconds);
 *   // Append to the practice mode body: body.deliveryContext = deliveryContext;
 */

import { analyzeDelivery } from './deliveryMetrics';

/**
 * Build the delivery context string to append to AI practice feedback prompts.
 *
 * @param {string} answer - The user's answer text
 * @param {number|null} durationSeconds - Recording duration in seconds (null if unknown)
 * @returns {string} Prompt addendum for the AI, or empty string if no data
 */
export function buildDeliveryContext(answer, durationSeconds = null) {
  if (!answer) return '';

  const metrics = analyzeDelivery(answer, durationSeconds);

  // Don't bother if the answer is tiny
  if (metrics.wordCount < 5) return '';

  const parts = [];
  parts.push('\n--- DELIVERY DATA (use this to add ONE brief "Delivery Note" at the end) ---');

  // Basic stats
  parts.push(`Answer: ${metrics.wordCount} words`);
  if (metrics.wpm.wpm > 0) {
    parts.push(`Pace: ~${metrics.wpm.wpm} WPM (${metrics.wpm.assessment})`);
  }

  // Filler words
  if (metrics.fillers.total > 0) {
    const fillerList = metrics.fillers.breakdown
      .map(f => `${f.word}: ${f.count}`)
      .join(', ');
    parts.push(`Filler words: ${metrics.fillers.total} total (${fillerList})`);
  }

  // Hedging language
  if (metrics.hedging.total > 0) {
    const hedgeList = metrics.hedging.breakdown
      .map(h => `"${h.phrase}": ${h.count}`)
      .join(', ');
    parts.push(`Hedging phrases: ${metrics.hedging.total} total (${hedgeList})`);
  }

  // Answer length assessment
  parts.push(`Answer length: ${metrics.answerLength}`);

  // Instructions for the AI
  parts.push('');
  parts.push('Include ONE brief "📢 Delivery Note:" sentence at the end of your feedback. Pick the MOST important issue only. Examples:');
  parts.push('- "📢 Delivery Note: You used \'um\' 4 times — try pausing silently between points instead."');
  parts.push('- "📢 Delivery Note: Replace \'I think\' with \'In my experience\' for stronger confidence signals."');
  parts.push('- "📢 Delivery Note: At 210 WPM you\'re rushing — pause between STAR sections for impact."');
  parts.push('- "📢 Delivery Note: Great pacing and zero filler words — your delivery was clean and confident."');
  parts.push('If delivery is clean (no fillers, good length, normal pace), give a brief compliment instead of a critique.');
  parts.push('--- END DELIVERY DATA ---');

  return parts.join('\n');
}
