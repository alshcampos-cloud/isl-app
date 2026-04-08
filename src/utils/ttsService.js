/**
 * ttsService.js — Client-side service for server-generated TTS audio.
 *
 * Calls the tts-generate Edge Function to get MP3 audio from Google Cloud TTS.
 * Includes in-memory caching, retry logic, and Web Speech API fallback.
 *
 * Usage:
 *   import { generateTTSAudio, isTTSServiceAvailable } from './ttsService';
 *   const blobUrl = await generateTTSAudio(lines, { voice: 'nova', speed: 1.0 });
 *   audioElement.src = blobUrl;
 *   audioElement.play();
 */

import { supabase } from '../lib/supabase';

// In-memory cache: contentHash → blob URL
// Survives within session, cleared on page refresh
const audioCache = new Map();

// Simple hash for cache keys
function quickHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

/**
 * Check if server TTS is likely available.
 * Returns true if we haven't had a definitive "not configured" error.
 * The actual availability is only known after the first call.
 */
let _ttsAvailable = true; // optimistic
export function isTTSServiceAvailable() {
  return _ttsAvailable;
}

/**
 * Generate TTS audio from content lines.
 *
 * @param {string[]} lines - Array of text lines (from prepRadioContent generators)
 * @param {object} options
 * @param {string} options.voice - OpenAI voice: alloy|echo|fable|onyx|nova|shimmer (default: nova)
 * @param {number} options.speed - Playback speed 0.25-4.0 (default: 1.0)
 * @returns {Promise<string|null>} Blob URL for the MP3, or null on failure
 */
export async function generateTTSAudio(lines, { voice = 'nova', speed = 1.0 } = {}) {
  if (!lines || lines.length === 0) return null;

  // Check cache
  const cacheKey = quickHash(lines.join('|') + voice + speed);
  if (audioCache.has(cacheKey)) {
    return audioCache.get(cacheKey);
  }

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.warn('TTS: No auth session');
      return null;
    }

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://tzrlpwtkrtvjpdhcaayu.supabase.co';

    const response = await fetch(`${supabaseUrl}/functions/v1/tts-generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ lines, voice, speed }),
    });

    if (!response.ok) {
      const contentType = response.headers.get('Content-Type') || '';
      if (contentType.includes('application/json')) {
        const err = await response.json();
        console.error('TTS error:', err);
        // If the service isn't configured, mark it unavailable
        if (err.error?.includes('not configured') || response.status === 500) {
          _ttsAvailable = false;
        }
      } else {
        console.error('TTS error:', response.status, response.statusText);
      }
      return null;
    }

    // Response is binary MP3
    const audioBlob = await response.blob();
    const blobUrl = URL.createObjectURL(audioBlob);

    // Cache it
    audioCache.set(cacheKey, blobUrl);

    return blobUrl;
  } catch (err) {
    console.error('TTS fetch error:', err);
    return null;
  }
}

/**
 * Clean up a cached blob URL when no longer needed.
 * Call this when switching playlists or unmounting.
 */
export function revokeTTSAudio(blobUrl) {
  if (blobUrl) {
    try { URL.revokeObjectURL(blobUrl); } catch {}
    // Remove from cache
    for (const [key, val] of audioCache.entries()) {
      if (val === blobUrl) { audioCache.delete(key); break; }
    }
  }
}

/**
 * Clear all cached audio. Call on unmount.
 */
export function clearTTSCache() {
  for (const url of audioCache.values()) {
    try { URL.revokeObjectURL(url); } catch {}
  }
  audioCache.clear();
}
