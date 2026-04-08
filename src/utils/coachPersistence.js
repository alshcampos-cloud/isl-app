/**
 * coachPersistence.js — localStorage persistence for coach chat messages.
 *
 * D.R.A.F.T. protocol: NEW file. No existing code modified.
 *
 * Stores messages per user per coach type (general / nursing).
 * Auto-expires after 24 hours to avoid stale AI context.
 *
 * Data shape:
 * {
 *   messages: [{ role, content, timestamp }],
 *   messageCount: number,
 *   savedAt: ISO string
 * }
 */

const GENERAL_KEY = 'isl_coach_messages';
const NURSING_KEY = 'isl_nursing_coach_messages';
const EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

function getKey(type, userId) {
  const base = type === 'nursing' ? NURSING_KEY : GENERAL_KEY;
  return userId ? `${base}_${userId}` : base;
}

/**
 * Load saved coach messages from localStorage.
 * Returns empty state if nothing saved or if expired (24h).
 */
export function loadCoachMessages(type = 'general', userId = null) {
  try {
    const key = getKey(type, userId);
    const raw = localStorage.getItem(key);
    if (!raw) return { messages: [], messageCount: 0 };

    const parsed = JSON.parse(raw);

    // Check 24-hour expiry
    if (parsed.savedAt && (Date.now() - new Date(parsed.savedAt).getTime()) > EXPIRY_MS) {
      localStorage.removeItem(key);
      return { messages: [], messageCount: 0 };
    }

    return {
      messages: parsed.messages || [],
      messageCount: parsed.messageCount || 0,
    };
  } catch (err) {
    console.warn('⚠️ Coach messages load error:', err);
    return { messages: [], messageCount: 0 };
  }
}

/**
 * Save coach messages to localStorage.
 */
export function saveCoachMessages(messages, messageCount, type = 'general', userId = null) {
  try {
    const key = getKey(type, userId);
    localStorage.setItem(key, JSON.stringify({
      messages,
      messageCount,
      savedAt: new Date().toISOString(),
    }));
  } catch (err) {
    console.warn('⚠️ Coach messages save error:', err);
  }
}

/**
 * Clear saved coach messages (for "New Chat" button).
 */
export function clearCoachMessages(type = 'general', userId = null) {
  try {
    const key = getKey(type, userId);
    localStorage.removeItem(key);
  } catch (err) {
    console.warn('⚠️ Coach messages clear error:', err);
  }
}
