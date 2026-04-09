/**
 * interviewFormats.js — Structured mock interview formats with sequencing algorithm
 *
 * Defines 4 interview formats (Behavioral, Phone Screen, Panel, Final Round) and
 * a deterministic question sequencing algorithm that maps format "slot types" to
 * the app's existing question_group taxonomy.
 *
 * Unlike competitors that just swap the question bank, this system:
 *   1. Picks questions in a realistic interview FLOW (warmup → main → closing)
 *   2. Changes the AI's persona, pacing, and follow-up style per format
 *   3. Supports seeded reproducibility so users can replay the same session
 *   4. Allows swapping a single question for another of the SAME slot type
 *
 * Slot types map to the 11 question_groups in default_questions.js:
 *   first-impressions, behavioral, situational, self-awareness, communication,
 *   leadership, adaptability, curveball, values, drills, closing
 */

// ============================================================
// FORMAT DEFINITIONS
// ============================================================

export const INTERVIEW_FORMATS = [
  {
    id: 'behavioral',
    name: 'Behavioral Interview',
    shortName: 'Behavioral',
    description: 'STAR-focused deep dive. Warm but probing hiring manager asks about real past experiences.',
    duration: '25-30 min',
    questionCount: 6,
    persona: 'warm but probing hiring manager',
    pacing: 'medium — lets you speak, then digs in',
    followUpStyle: 'Can you be more specific about YOUR role? What was the measurable result?',
    iconKey: 'interviewer', // maps to InterviewerIcon
    accentColor: 'teal',
    flow: [
      { stage: 'warmup',  slotType: 'first-impressions', label: 'Opening' },
      { stage: 'main',    slotType: 'behavioral',        label: 'Core behavioral' },
      { stage: 'main',    slotType: 'situational',       label: 'Situational' },
      { stage: 'main',    slotType: 'behavioral',        label: 'Deeper behavioral' },
      { stage: 'main',    slotType: 'leadership',        label: 'Leadership' },
      { stage: 'closing', slotType: 'closing',           label: 'Wrap-up + your questions' },
    ],
  },
  {
    id: 'phoneScreen',
    name: 'Phone Screen',
    shortName: 'Phone Screen',
    description: 'Fast recruiter screening call. Short and to the point — basic fit, availability, and expectations.',
    duration: '15-20 min',
    questionCount: 4,
    persona: 'friendly recruiter gatekeeping the pipeline',
    pacing: 'fast — respects the short window',
    followUpStyle: 'Light follow-ups, flagging red flags only',
    iconKey: 'coach', // maps to CoachIcon
    accentColor: 'sky',
    flow: [
      { stage: 'warmup',  slotType: 'first-impressions', label: 'Opening' },
      { stage: 'main',    slotType: 'values',            label: 'Fit & motivation' },
      { stage: 'main',    slotType: 'behavioral',        label: 'Quick behavioral check' },
      { stage: 'closing', slotType: 'closing',           label: 'Logistics & next steps' },
    ],
  },
  {
    id: 'panel',
    name: 'Panel Interview',
    shortName: 'Panel',
    description: 'Multiple interviewers with different perspectives. Questions rotate between HR, hiring manager, and peers.',
    duration: '45-60 min',
    questionCount: 8,
    persona: 'rotating panel of 3 interviewers (HR, hiring manager, peer)',
    pacing: 'varied — each panelist has their own style',
    followUpStyle: 'Attributed follow-ups: "From a hiring manager perspective..."',
    iconKey: 'starDrill', // maps to StarDrillIcon (multi-faceted)
    accentColor: 'amber',
    flow: [
      { stage: 'warmup',  slotType: 'first-impressions', label: 'Opening' },
      { stage: 'main',    slotType: 'behavioral',        label: 'HR behavioral' },
      { stage: 'main',    slotType: 'communication',     label: 'Communication' },
      { stage: 'main',    slotType: 'situational',       label: 'Hiring manager scenario' },
      { stage: 'main',    slotType: 'leadership',        label: 'Leadership' },
      { stage: 'main',    slotType: 'curveball',         label: 'Peer curveball' },
      { stage: 'main',    slotType: 'behavioral',        label: 'Deeper dive' },
      { stage: 'closing', slotType: 'closing',           label: 'Wrap-up' },
    ],
  },
  {
    id: 'finalRound',
    name: 'Final Round',
    shortName: 'Final Round',
    description: 'Executive interview. Strategic thinking, leadership philosophy, and cultural alignment.',
    duration: '30-45 min',
    questionCount: 5,
    persona: 'senior executive evaluating fit and judgment',
    pacing: 'measured — thoughtful and strategic',
    followUpStyle: 'Probes long-term thinking and values alignment',
    iconKey: 'commandCenter', // maps to CommandCenterIcon
    accentColor: 'slate',
    flow: [
      { stage: 'warmup',  slotType: 'first-impressions', label: 'Opening' },
      { stage: 'main',    slotType: 'leadership',        label: 'Leadership philosophy' },
      { stage: 'main',    slotType: 'values',            label: 'Values & culture fit' },
      { stage: 'main',    slotType: 'situational',       label: 'Strategic judgment' },
      { stage: 'closing', slotType: 'closing',           label: 'Your questions for us' },
    ],
  },
];

// ============================================================
// HELPERS
// ============================================================

/**
 * Get a format definition by ID.
 * @param {string} id - Format ID (e.g. 'behavioral')
 * @returns {object|null}
 */
export function getFormatById(id) {
  return INTERVIEW_FORMATS.find(f => f.id === id) || null;
}

/**
 * Generate a 6-digit numeric seed for a new session.
 * Used for reproducibility — same seed + same format = same question sequence.
 * @returns {number}
 */
export function generateSessionSeed() {
  return Math.floor(100000 + Math.random() * 900000);
}

// ============================================================
// DETERMINISTIC PRNG (mulberry32)
// Tiny 32-bit PRNG seeded from a single integer. Produces reproducible
// sequences — critical for the "same seed = same session" guarantee.
// ============================================================

function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Pick one item from an array using a seeded PRNG.
 */
function seededPick(arr, rng) {
  if (!arr || arr.length === 0) return null;
  const idx = Math.floor(rng() * arr.length);
  return arr[idx];
}

// ============================================================
// FALLBACK GROUP MAPPING
// If a format's slot type has no matching questions in the user's pool,
// fall through to these alternatives. 'behavioral' is the universal catch-all.
// ============================================================

const SLOT_FALLBACKS = {
  'first-impressions': ['behavioral', 'values'],
  'behavioral':        ['situational', 'leadership'],
  'situational':       ['behavioral', 'leadership'],
  'leadership':        ['behavioral', 'situational'],
  'communication':     ['behavioral', 'situational'],
  'values':            ['behavioral', 'self-awareness'],
  'self-awareness':    ['behavioral', 'values'],
  'curveball':         ['situational', 'behavioral'],
  'adaptability':      ['behavioral', 'situational'],
  'closing':           ['values', 'behavioral'],
  'drills':            ['behavioral'],
};

/**
 * Find questions for a given slot type, falling back through related groups if empty.
 * @param {string} slotType
 * @param {Array} pool - full question pool (already filtered by user groups)
 * @param {Set<string>} usedIds - IDs already claimed by earlier slots
 * @returns {Array} candidate questions for this slot
 */
function candidatesForSlot(slotType, pool, usedIds) {
  // Check group field (new format) and question_group field (DB format)
  const matchSlot = (q) => (q.group === slotType || q.question_group === slotType);

  const direct = pool.filter(q => matchSlot(q) && !usedIds.has(q.id));
  if (direct.length > 0) return direct;

  // Fall through to fallback groups
  const fallbacks = SLOT_FALLBACKS[slotType] || ['behavioral'];
  for (const fb of fallbacks) {
    const fbMatch = (q) => (q.group === fb || q.question_group === fb);
    const matches = pool.filter(q => fbMatch(q) && !usedIds.has(q.id));
    if (matches.length > 0) return matches;
  }

  // Last resort: any unused question
  const anyUnused = pool.filter(q => !usedIds.has(q.id));
  return anyUnused.length > 0 ? anyUnused : pool; // even repeat if desperate
}

// ============================================================
// BUILD INTERVIEW SEQUENCE
// ============================================================

/**
 * Build a structured interview sequence for a given format.
 *
 * @param {object} format - Format object from INTERVIEW_FORMATS
 * @param {Array} questionPool - Filtered question pool available to this user
 * @param {number} seed - Deterministic seed (from generateSessionSeed())
 * @returns {Array<{slotIndex, stage, slotType, label, question}>}
 */
export function buildInterviewSequence(format, questionPool, seed) {
  if (!format || !Array.isArray(format.flow) || format.flow.length === 0) return [];
  if (!Array.isArray(questionPool) || questionPool.length === 0) return [];

  const rng = mulberry32(seed || 1);
  const usedIds = new Set();
  const sequence = [];

  format.flow.forEach((slot, slotIndex) => {
    const candidates = candidatesForSlot(slot.slotType, questionPool, usedIds);
    if (candidates.length === 0) return; // skip if nothing at all

    const question = seededPick(candidates, rng);
    if (!question) return;

    usedIds.add(question.id);
    sequence.push({
      slotIndex,
      stage: slot.stage,
      slotType: slot.slotType,
      label: slot.label,
      question,
    });
  });

  return sequence;
}

// ============================================================
// SWAP QUESTION IN SEQUENCE
// ============================================================

/**
 * Replace the question at a specific slot with another of the same slot type.
 * Preserves the rest of the sequence unchanged.
 *
 * @param {Array} sequence - current sequence from buildInterviewSequence
 * @param {number} slotIndex - which slot to swap
 * @param {Array} questionPool - full question pool
 * @param {number} seed - original session seed
 * @returns {Array} new sequence with swapped slot
 */
export function swapQuestionInSequence(sequence, slotIndex, questionPool, seed) {
  if (!sequence || slotIndex < 0 || slotIndex >= sequence.length) return sequence;

  const targetSlot = sequence[slotIndex];
  if (!targetSlot) return sequence;

  // Build used IDs set EXCLUDING the current question at this slot
  // (and excluding the questions at OTHER slots so we don't create duplicates)
  const usedIds = new Set();
  sequence.forEach((s, i) => {
    if (i !== slotIndex && s.question) usedIds.add(s.question.id);
  });
  // Also exclude the current question we're swapping away from
  if (targetSlot.question) usedIds.add(targetSlot.question.id);

  const candidates = candidatesForSlot(targetSlot.slotType, questionPool, usedIds);
  if (candidates.length === 0) return sequence; // can't swap, no alternatives

  // Advance the RNG by slotIndex + 1 steps so swaps are deterministic per-slot.
  // This means swapping slot 3 always gives the same replacement for a given seed.
  const rng = mulberry32((seed || 1) + slotIndex * 7919); // 7919 is prime — scatters cleanly
  const newQuestion = seededPick(candidates, rng);
  if (!newQuestion) return sequence;

  return sequence.map((s, i) =>
    i === slotIndex ? { ...s, question: newQuestion } : s
  );
}

// ============================================================
// BUILD SEQUENCE FROM CURATED INTERVIEW
// Unlike buildInterviewSequence (random picks by slotType), this builds
// the sequence from a specific curated playlist. Each curated interview has
// a fixed ordered list of question shapes — this function takes those and:
//   1. Tries to match each shape to a real question from the user's pool
//      (same slotType + topic-similar where possible)
//   2. Falls back to the curated `suggestedText` when no match exists
//      (so the session can always run)
//
// @param {object} curatedInterview - from CURATED_INTERVIEWS
// @param {Array} questionPool - user's filtered question bank
// @returns {Array<{slotIndex, stage, slotType, label, question}>}
// ============================================================

export function buildSequenceFromCurated(curatedInterview, questionPool) {
  if (!curatedInterview || !Array.isArray(curatedInterview.questions)) return [];

  const usedIds = new Set();
  const sequence = [];

  curatedInterview.questions.forEach((slot, idx) => {
    // Try to find a matching question from user's bank
    const matchSlot = (q) => (q.group === slot.slotType || q.question_group === slot.slotType);
    const candidates = (questionPool || []).filter(q => matchSlot(q) && !usedIds.has(q.id));

    let question;
    if (candidates.length > 0) {
      // Use the first available matching question from the user's bank
      question = candidates[0];
      usedIds.add(question.id);
    } else {
      // Fall back to the curated suggested text as a synthetic question object
      question = {
        id: `curated_${curatedInterview.id}_${idx}`,
        question: slot.suggestedText,
        category: slot.slotType,
        group: slot.slotType,
        question_group: slot.slotType,
        bullets: [],
      };
    }

    sequence.push({
      slotIndex: idx,
      stage: idx === 0 ? 'warmup' : (idx === curatedInterview.questions.length - 1 ? 'closing' : 'main'),
      slotType: slot.slotType,
      label: slot.topic,
      question,
    });
  });

  return sequence;
}

// ============================================================
// EXPORTS SUMMARY
// ============================================================
// Functions:
//   - getFormatById(id)
//   - generateSessionSeed()
//   - buildInterviewSequence(format, pool, seed)
//   - buildSequenceFromCurated(curatedInterview, pool)
//   - swapQuestionInSequence(sequence, slotIndex, pool, seed)
// Constants:
//   - INTERVIEW_FORMATS
