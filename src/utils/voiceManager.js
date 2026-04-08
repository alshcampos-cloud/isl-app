/**
 * voiceManager.js — Smart voice selection for Web Speech API TTS
 *
 * Modern devices have high-quality voices (Premium, Neural, Enhanced, Natural)
 * but the old priority list was static and missed them. This module scores all
 * available voices and picks the best one, with caching so it doesn't re-search
 * on every utterance.
 */

// Cache the selected voice so we don't re-evaluate every call
let cachedVoice = null;
let cachedVoiceList = null;

// Quality indicators in voice names — higher weight = better
const QUALITY_KEYWORDS = [
  { pattern: /premium/i, score: 100 },
  { pattern: /neural/i, score: 90 },
  { pattern: /enhanced/i, score: 85 },
  { pattern: /natural/i, score: 80 },
  { pattern: /compact/i, score: -20 }, // compact voices are low quality
  { pattern: /online/i, score: 10 },   // online voices tend to be better
];

// Preferred voices by name (known good quality, in priority order)
// iOS/macOS "Premium" and "Enhanced" voices score highest — they're the most lifelike
const PREFERRED_VOICES = [
  { pattern: /samantha/i, score: 95 },         // macOS/iOS — very natural female
  { pattern: /\bava\b/i, score: 92 },          // iOS Premium — extremely natural
  { pattern: /\bzoe\b/i, score: 88 },          // iOS/macOS — high quality female
  { pattern: /\ballison\b/i, score: 86 },      // iOS/macOS — good quality female
  { pattern: /\bvictoria\b/i, score: 82 },     // macOS — good quality female
  { pattern: /\bsiri/i, score: 90 },           // iOS Siri voices — very high quality
  { pattern: /google us english/i, score: 70 }, // Chrome — good quality
  { pattern: /google uk english female/i, score: 68 },
  { pattern: /\bkaren\b/i, score: 55 },        // macOS female Australian
  { pattern: /\bfiona\b/i, score: 48 },        // macOS Scottish
  { pattern: /microsoft zira/i, score: 50 },   // Windows — decent
  { pattern: /\balex\b/i, score: 45 },         // macOS male
  { pattern: /microsoft david/i, score: 42 },  // Windows male
];

/**
 * Score a voice based on quality indicators and known preferences
 */
function scoreVoice(voice) {
  let score = 0;

  // Must be English
  if (!voice.lang.startsWith('en')) return -1000;

  // Prefer female voices for coaching tone
  const nameLower = voice.name.toLowerCase();
  if (nameLower.includes('female') || nameLower.includes('woman')) score += 15;
  if (nameLower.includes('male') && !nameLower.includes('female')) score -= 5;

  // Check quality keywords
  for (const { pattern, score: kScore } of QUALITY_KEYWORDS) {
    if (pattern.test(voice.name)) score += kScore;
  }

  // Check known preferred voices
  for (const { pattern, score: pScore } of PREFERRED_VOICES) {
    if (pattern.test(voice.name)) score += pScore;
  }

  // Slight preference for local voices (less latency)
  if (voice.localService) score += 5;

  return score;
}

/**
 * Get the best available voice from the provided voice list.
 * Caches the result so subsequent calls are instant.
 *
 * @param {SpeechSynthesisVoice[]} voices - from synth.getVoices()
 * @returns {SpeechSynthesisVoice|null} best available voice
 */
export function getPreferredVoice(voices) {
  if (!voices || voices.length === 0) return null;

  // Return cached if voice list hasn't changed
  if (cachedVoice && cachedVoiceList === voices) return cachedVoice;

  // Score all voices and pick the best
  const scored = voices
    .map(v => ({ voice: v, score: scoreVoice(v) }))
    .filter(v => v.score > -500) // must be English
    .sort((a, b) => b.score - a.score);

  if (scored.length > 0) {
    cachedVoice = scored[0].voice;
    cachedVoiceList = voices;

    // Log top 3 for debugging
    console.log('🎙️ Voice ranking:', scored.slice(0, 3).map(s => `${s.voice.name} (${s.score})`).join(', '));
  } else {
    // Absolute fallback: any voice
    cachedVoice = voices[0];
  }

  return cachedVoice;
}

/**
 * Optimized TTS settings for interview coaching
 */
export const VOICE_SETTINGS = {
  rate: 0.88,    // Slightly slower than before (was 0.92) — clearer for interview context
  pitch: 1.02,   // Slightly less exaggerated (was 1.05) — more natural
  volume: 1.0,
};

/**
 * Clear the voice cache — call when voices change (e.g., voiceschanged event)
 */
export function clearVoiceCache() {
  cachedVoice = null;
  cachedVoiceList = null;
}
