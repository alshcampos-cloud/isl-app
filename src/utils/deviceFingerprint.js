/**
 * Device fingerprinting and email normalization utilities.
 * Used for abuse prevention (multi-account detection).
 * No external dependencies — Web APIs only.
 */

const CACHE_KEY = '_dfp';

function djb2Hash(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

async function sha256(str) {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const buf = new TextEncoder().encode(str);
    const hashBuf = await crypto.subtle.digest('SHA-256', buf);
    const hashArr = Array.from(new Uint8Array(hashBuf));
    return hashArr.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  return djb2Hash(str);
}

export async function getDeviceFingerprint() {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) return cached;
  } catch (_) {
    // localStorage unavailable
  }

  const signals = [
    screen.width,
    screen.height,
    screen.colorDepth,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    navigator.language,
    navigator.platform,
  ];

  // Canvas fingerprint
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 50;
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillStyle = '#f60';
    ctx.fillRect(0, 0, 200, 50);
    ctx.fillStyle = '#069';
    ctx.fillText('DeviceFP_v1', 2, 15);
    signals.push(canvas.toDataURL());
  } catch (_) {
    signals.push('no-canvas');
  }

  const raw = signals.join('|');
  const hash = await sha256(raw);
  const fp = hash.substring(0, 16);

  try {
    localStorage.setItem(CACHE_KEY, fp);
  } catch (_) {
    // localStorage unavailable
  }

  return fp;
}

export function normalizeEmail(email) {
  const lower = email.toLowerCase().trim();
  const atIdx = lower.lastIndexOf('@');
  if (atIdx === -1) return lower;

  let local = lower.substring(0, atIdx);
  const domain = lower.substring(atIdx + 1);

  // Strip +tag suffix
  const plusIdx = local.indexOf('+');
  if (plusIdx !== -1) {
    local = local.substring(0, plusIdx);
  }

  // Remove dots for Gmail/Googlemail
  if (domain === 'gmail.com' || domain === 'googlemail.com') {
    local = local.replace(/\./g, '');
  }

  return `${local}@${domain}`;
}

export async function hashEmail(email) {
  const normalized = normalizeEmail(email);
  const hash = await sha256(normalized);
  return hash.substring(0, 16);
}
