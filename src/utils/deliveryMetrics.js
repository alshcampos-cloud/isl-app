/**
 * deliveryMetrics.js — Delivery analytics for interview practice answers.
 *
 * Phase 4B: Surfaces hidden data (word count, filler words) and adds
 * hedging language detection and WPM calculation.
 *
 * Used by DeliveryInsights.jsx and deliveryPromptBuilder.js
 */

// Expanded filler word list (matches/extends what savePracticeSession already counts)
const FILLER_WORDS = [
  'um', 'uh', 'like', 'you know', 'so', 'actually',
  'basically', 'right', 'i mean', 'kind of', 'sort of',
  'literally', 'honestly', 'essentially',
];

// Hedging phrases that undermine confidence
const HEDGING_PHRASES = [
  'i think', 'maybe', 'probably', 'i guess', 'not sure',
  'possibly', 'perhaps', 'i feel like', 'it seems like',
  'i believe', 'sort of', 'kind of',
];

/**
 * Count each filler word in the text.
 * @param {string} text - The user's answer
 * @returns {{ total: number, breakdown: { word: string, count: number }[] }}
 */
export function countFillerWords(text) {
  if (!text) return { total: 0, breakdown: [] };

  const lowerText = text.toLowerCase();
  const breakdown = [];
  let total = 0;

  for (const word of FILLER_WORDS) {
    // Use word boundary matching for single words,
    // simple indexOf counting for multi-word phrases
    let count = 0;
    if (word.includes(' ')) {
      // Multi-word phrase: count occurrences
      let idx = 0;
      while ((idx = lowerText.indexOf(word, idx)) !== -1) {
        count++;
        idx += word.length;
      }
    } else {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      count = (text.match(regex) || []).length;
    }
    if (count > 0) {
      breakdown.push({ word, count });
      total += count;
    }
  }

  // Sort by count descending
  breakdown.sort((a, b) => b.count - a.count);
  return { total, breakdown };
}

/**
 * Detect hedging phrases.
 * @param {string} text
 * @returns {{ total: number, breakdown: { phrase: string, count: number }[] }}
 */
export function analyzeHedgingLanguage(text) {
  if (!text) return { total: 0, breakdown: [] };

  const lowerText = text.toLowerCase();
  const breakdown = [];
  let total = 0;

  for (const phrase of HEDGING_PHRASES) {
    let count = 0;
    let idx = 0;
    while ((idx = lowerText.indexOf(phrase, idx)) !== -1) {
      count++;
      idx += phrase.length;
    }
    if (count > 0) {
      breakdown.push({ phrase, count });
      total += count;
    }
  }

  breakdown.sort((a, b) => b.count - a.count);
  return { total, breakdown };
}

/**
 * Calculate words per minute.
 * @param {number} wordCount
 * @param {number} durationSeconds - Recording duration in seconds
 * @returns {{ wpm: number, assessment: string }}
 */
export function calculateWPM(wordCount, durationSeconds) {
  if (!durationSeconds || durationSeconds <= 0 || !wordCount) {
    return { wpm: 0, assessment: 'No timing data' };
  }

  const wpm = Math.round((wordCount / durationSeconds) * 60);

  let assessment;
  if (wpm < 100) assessment = 'Too slow — sounds rehearsed or uncertain';
  else if (wpm < 130) assessment = 'Good — thoughtful and clear';
  else if (wpm <= 150) assessment = 'Ideal — natural conversational pace';
  else if (wpm <= 180) assessment = 'A bit fast — consider pausing more';
  else assessment = 'Rushing — slow down, breathe between points';

  return { wpm, assessment };
}

/**
 * Full delivery analysis from a practice answer.
 * @param {string} text - User's answer
 * @param {number} [durationSeconds] - Optional recording duration
 * @returns {Object} Comprehensive delivery metrics
 */
export function analyzeDelivery(text, durationSeconds = null) {
  if (!text) {
    return {
      wordCount: 0,
      fillers: { total: 0, breakdown: [] },
      hedging: { total: 0, breakdown: [] },
      wpm: { wpm: 0, assessment: 'No answer provided' },
      answerLength: 'none',
    };
  }

  const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;
  const fillers = countFillerWords(text);
  const hedging = analyzeHedgingLanguage(text);
  const wpm = calculateWPM(wordCount, durationSeconds);

  // Categorize answer length
  let answerLength;
  if (wordCount < 30) answerLength = 'too-short';
  else if (wordCount < 80) answerLength = 'brief';
  else if (wordCount <= 200) answerLength = 'good';
  else if (wordCount <= 350) answerLength = 'detailed';
  else answerLength = 'too-long';

  return {
    wordCount,
    fillers,
    hedging,
    wpm,
    answerLength,
    durationSeconds,
    // Convenience: filler rate as percentage of total words
    fillerRate: wordCount > 0 ? Math.round((fillers.total / wordCount) * 100) : 0,
  };
}

/**
 * Get delivery tips based on metrics.
 * Returns top 1-2 most important tips only.
 */
export function getDeliveryTips(metrics) {
  const tips = [];

  // Priority 1: Filler words
  if (metrics.fillers.total >= 3) {
    const worst = metrics.fillers.breakdown[0];
    tips.push({
      priority: 1,
      icon: '🔇',
      tip: `You used "${worst.word}" ${worst.count} time${worst.count > 1 ? 's' : ''}. Try pausing silently instead.`,
    });
  }

  // Priority 2: Hedging language
  if (metrics.hedging.total >= 2) {
    const worst = metrics.hedging.breakdown[0];
    const replacement = worst.phrase === 'i think' ? '"In my experience"'
      : worst.phrase === 'maybe' ? '"Based on what I\'ve seen"'
      : worst.phrase === 'i guess' ? '"From my perspective"'
      : '"Based on my analysis"';
    tips.push({
      priority: 2,
      icon: '💪',
      tip: `Replace "${worst.phrase}" with ${replacement} for more confidence.`,
    });
  }

  // Priority 3: Answer too short
  if (metrics.answerLength === 'too-short') {
    tips.push({
      priority: 3,
      icon: '📏',
      tip: 'Your answer is very brief. Use the STAR framework to add specific details and results.',
    });
  }

  // Priority 4: Answer too long
  if (metrics.answerLength === 'too-long') {
    tips.push({
      priority: 4,
      icon: '✂️',
      tip: `At ${metrics.wordCount} words, your answer may lose the interviewer. Aim for 100-200 words.`,
    });
  }

  // Priority 5: Pacing
  if (metrics.wpm.wpm > 180) {
    tips.push({
      priority: 5,
      icon: '🐢',
      tip: `At ${metrics.wpm.wpm} WPM, you're rushing. Aim for 130-150 WPM — pause between STAR sections.`,
    });
  } else if (metrics.wpm.wpm > 0 && metrics.wpm.wpm < 100) {
    tips.push({
      priority: 5,
      icon: '⏩',
      tip: `At ${metrics.wpm.wpm} WPM, you're speaking slowly. This can sound uncertain — try a slightly faster, more natural pace.`,
    });
  }

  // Return top 2 tips only
  return tips.sort((a, b) => a.priority - b.priority).slice(0, 2);
}
