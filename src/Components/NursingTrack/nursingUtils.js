// NursingTrack — Shared Utilities
// Score parsing, tag stripping, and other helpers shared across nursing modes.
//
// ⚠️ D.R.A.F.T. Protocol: NEW file. No existing code modified.

// ============================================================
// SCORE PARSING — Defensive, with null fallback
// ============================================================

/**
 * Parse [SCORE: X/5] tag from AI response text.
 * Returns number (1-5) or null if not found/invalid.
 * Null = "Unscored" — parsing failure never breaks session flow.
 */
export function parseScoreFromResponse(responseText) {
  if (!responseText) return null;
  try {
    const match = responseText.match(/\[SCORE:\s*(\d(?:\.\d)?)\s*\/\s*5\s*\]/i);
    if (match) {
      const score = parseFloat(match[1]);
      if (score >= 1 && score <= 5) return score;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Strip the [SCORE: X/5] tag from display text so users see clean feedback.
 */
export function stripScoreTag(responseText) {
  if (!responseText) return responseText;
  return responseText.replace(/\n?\[SCORE:\s*\d(?:\.\d)?\s*\/\s*5\s*\]/i, '').trim();
}

// ============================================================
// SBAR COMPONENT SCORE PARSING — For SBAR Drill mode
// ============================================================

/**
 * Parse per-component SBAR scores from AI response.
 * Expects format: [S-SCORE: X/10] [B-SCORE: X/10] [A-SCORE: X/10] [R-SCORE: X/10]
 * Returns { situation, background, assessment, recommendation } or nulls.
 */
export function parseSBARScores(responseText) {
  if (!responseText) return { situation: null, background: null, assessment: null, recommendation: null };

  const parseComponent = (label) => {
    try {
      const regex = new RegExp(`\\[${label}-SCORE:\\s*(\\d{1,2})\\s*/\\s*10\\s*\\]`, 'i');
      const match = responseText.match(regex);
      if (match) {
        const score = parseInt(match[1], 10);
        if (score >= 0 && score <= 10) return score;
      }
      return null;
    } catch {
      return null;
    }
  };

  return {
    situation: parseComponent('S'),
    background: parseComponent('B'),
    assessment: parseComponent('A'),
    recommendation: parseComponent('R'),
  };
}

/**
 * Strip all SBAR score tags from display text.
 */
export function stripSBARScoreTags(responseText) {
  if (!responseText) return responseText;
  return responseText
    .replace(/\n?\[[SBAR]-SCORE:\s*\d{1,2}\s*\/\s*10\s*\]/gi, '')
    .trim();
}

// ============================================================
// SCORE COLOR HELPERS
// ============================================================

/** Tailwind text color for score out of 5 */
export function scoreColor5(score) {
  if (score === null) return 'text-slate-400';
  if (score >= 4) return 'text-green-400';
  if (score >= 3) return 'text-yellow-400';
  return 'text-red-400';
}

/** Tailwind text color for score out of 10 */
export function scoreColor10(score) {
  if (score === null) return 'text-slate-400';
  if (score >= 8) return 'text-green-400';
  if (score >= 6) return 'text-yellow-400';
  return 'text-red-400';
}

/** Tailwind bg/border for score out of 10 */
export function scoreBg10(score) {
  if (score === null) return 'bg-slate-500/20';
  if (score >= 8) return 'bg-green-500/20';
  if (score >= 6) return 'bg-yellow-500/20';
  return 'bg-red-500/20';
}

// ============================================================
// CITATION SOURCE HELPER
// ============================================================

/**
 * Extract clinicalFrameworkSource from a question object.
 * Handles both shapes: Supabase (top-level) and static (nested under metadata).
 */
export function getCitationSource(question) {
  return question?.clinicalFrameworkSource || question?.metadata?.clinicalFrameworkSource || null;
}

// ============================================================
// RESPONSE QUALITY VALIDATION
// ============================================================

const WALLED_GARDEN_PHRASES = [
  'the correct dose',
  'the recommended dose',
  'recommended dosage',
  'you should administer',
  'administer the',
  'the protocol for',
  'you should give',
  'mg/kg',
  'the correct intervention',
  'the appropriate medication',
];

/**
 * Validate an AI response for completeness, walled garden violations, and truncation.
 * Non-blocking: returns flags for display warnings, never prevents rendering.
 *
 * @param {string} responseText - Raw AI response text (before score stripping)
 * @param {'practice'|'mock'|'sbar'} mode - Which nursing practice mode
 * @returns {{ isComplete: boolean, walledGardenFlag: boolean, isTruncated: boolean }}
 */
export function validateNursingResponse(responseText, mode) {
  const result = { isComplete: true, walledGardenFlag: false, isTruncated: false };

  if (!responseText || typeof responseText !== 'string') {
    return { ...result, isComplete: false, isTruncated: true };
  }

  const lower = responseText.toLowerCase();

  // 1. Section completeness (practice mode only — other modes have flexible structure)
  if (mode === 'practice') {
    const markers = ['**feedback:', '**star breakdown:', '**sbar breakdown:', '**ideal answer approach:', '**resources to review:'];
    const foundCount = markers.filter(s => lower.includes(s)).length;
    result.isComplete = foundCount >= 3;
  }

  // 2. Walled garden check (all modes)
  for (const phrase of WALLED_GARDEN_PHRASES) {
    if (lower.includes(phrase)) {
      result.walledGardenFlag = true;
      break;
    }
  }

  // 3. Truncation detection (all modes)
  const hasScoreTag = /\[SCORE:\s*\d/i.test(responseText) || /\[[SBAR]-SCORE:\s*\d/i.test(responseText);
  const endsCleanly = /[.!?\]]$/.test(responseText.trimEnd());
  if (!hasScoreTag && !endsCleanly) {
    result.isTruncated = true;
  }

  return result;
}
