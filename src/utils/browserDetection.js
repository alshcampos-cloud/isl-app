// browserDetection.js — Single source of truth for browser detection
// ====================================================================
// Detects browser type, platform, and speech recognition capability.
// Used by App.jsx (main app) and useSpeechRecognition.js (nursing track).
//
// Research basis (Feb 2026):
//   - Can I Use: https://caniuse.com/speech-recognition
//   - MDN: https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition
//   - Edge broken: https://github.com/mdn/browser-compat-data/issues/22126
//
// Verified browser matrix:
//   WORKS:     Chrome desktop/Android, Safari desktop/iOS, Samsung Internet Android, Native (Capacitor)
//   BROKEN:    Edge (all), Firefox (all), Opera/GX (all), non-Safari iOS browsers, Brave
//
// Cached singleton — browser UA doesn't change during a page session.
// ====================================================================

let _cached = null;

/**
 * getBrowserInfo() — detect browser, platform, and speech compatibility.
 *
 * @returns {{
 *   browserName: string,
 *   platform: 'ios'|'android'|'desktop'|'native',
 *   hasReliableSpeech: boolean,
 *   speechUnavailableReason: string|null,
 *   hasSpeechSupport: boolean,
 *   isIOS: boolean,
 *   isIOSChrome: boolean,
 *   isIOSThirdParty: boolean,
 *   isNative: boolean,
 *   isChrome: boolean,
 *   isSafari: boolean,
 *   isFirefox: boolean,
 *   isEdge: boolean,
 *   isOpera: boolean,
 *   isOperaGX: boolean,
 *   isSamsungInternet: boolean,
 *   name: string
 * }}
 */
export function getBrowserInfo() {
  if (_cached) return _cached;

  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';

  // ── Platform detection ──────────────────────────────────────────
  // iOS: all browsers use WebKit. iPadOS 13+ reports as MacIntel.
  const isIOS = /iPad|iPhone|iPod/.test(ua)
    || (typeof navigator !== 'undefined' && navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isAndroid = /Android/.test(ua);

  // Native Capacitor app (WKWebView on iOS, WebView on Android)
  const isNative = typeof document !== 'undefined'
    && document.documentElement.classList.contains('capacitor');

  // ── Browser detection (order matters — UA strings overlap) ──────
  // 1. Samsung Internet first: UA also contains "Chrome"
  const isSamsungInternet = ua.includes('SamsungBrowser');

  // 2. Opera / Opera GX: UA contains "OPR/" or "Opera"
  const isOpera = !isSamsungInternet && (ua.includes('OPR/') || ua.includes('Opera'));
  const isOperaGX = isOpera && ua.includes('GX');

  // 3. Edge: desktop "Edg/", iOS "EdgiOS", Android "EdgA/"
  const isEdge = !isSamsungInternet && !isOpera
    && (ua.includes('Edg/') || ua.includes('EdgiOS') || ua.includes('EdgA/'));

  // 4. Firefox: desktop "Firefox", iOS "FxiOS"
  const isFirefox = !isSamsungInternet && !isOpera && !isEdge
    && (ua.includes('Firefox') || ua.includes('FxiOS'));

  // 5. Chrome: desktop/Android "Chrome", iOS "CriOS"
  //    Must exclude Opera, Edge, Samsung (all have "Chrome" in UA)
  const isChrome = !isSamsungInternet && !isOpera && !isEdge && !isFirefox
    && (ua.includes('Chrome') || ua.includes('CriOS'));

  // 6. Safari: what's left with "Safari" in UA (real Safari only)
  const isSafari = !isSamsungInternet && !isOpera && !isEdge && !isFirefox && !isChrome
    && ua.includes('Safari');

  // ── iOS third-party browser detection ───────────────────────────
  // All iOS browsers use WebKit, but only Safari exposes working SpeechRecognition.
  // iOS Chrome = "CriOS", iOS Firefox = "FxiOS", iOS Edge = "EdgiOS"
  const isIOSChrome = isIOS && (isChrome || ua.includes('CriOS'));
  const isIOSFirefox = isIOS && ua.includes('FxiOS');
  const isIOSEdge = isIOS && ua.includes('EdgiOS');
  const isIOSThirdParty = isIOSChrome || isIOSFirefox || isIOSEdge;

  // ── Platform string ─────────────────────────────────────────────
  const platform = isNative ? 'native' : isIOS ? 'ios' : isAndroid ? 'android' : 'desktop';

  // ── Speech recognition support ──────────────────────────────────
  const hasSpeechSupport = typeof window !== 'undefined'
    && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  // Only these browsers ACTUALLY work for speech recognition:
  //   - Chrome on desktop or Android (NOT iOS)
  //   - Safari on any platform
  //   - Samsung Internet on Android
  //   - Native Capacitor app (uses WKWebView which supports it)
  //
  // Deliberately EXCLUDED despite being Chromium-based:
  //   - Edge: MDN issue #22126, instantiates but returns no data
  //   - Opera: detectable but doesn't fire events
  //   - Brave: refused to implement
  const hasReliableSpeech = hasSpeechSupport && (
    (isChrome && !isIOS)      // Chrome desktop + Android
    || isSafari               // Safari desktop + iOS
    || (isSamsungInternet && isAndroid)  // Samsung Internet on Android
    || isNative               // Capacitor WKWebView
  );

  // ── Human-readable browser name ─────────────────────────────────
  let browserName;
  if (isNative) browserName = 'App';
  else if (isIOSChrome) browserName = 'Chrome (iOS)';
  else if (isIOSFirefox) browserName = 'Firefox (iOS)';
  else if (isIOSEdge) browserName = 'Edge (iOS)';
  else if (isSamsungInternet) browserName = 'Samsung Internet';
  else if (isOperaGX) browserName = 'Opera GX';
  else if (isOpera) browserName = 'Opera';
  else if (isFirefox) browserName = 'Firefox';
  else if (isEdge) browserName = 'Edge';
  else if (isChrome) browserName = 'Chrome';
  else if (isSafari) browserName = 'Safari';
  else browserName = 'Unknown';

  // ── Platform-aware unavailability message ────────────────────────
  let speechUnavailableReason = null;
  if (!hasReliableSpeech) {
    if (isIOSThirdParty) {
      speechUnavailableReason = `${browserName.replace(' (iOS)', '')} on iPhone doesn't support voice. Use Safari, or type your answer.`;
    } else if (isFirefox && isAndroid) {
      speechUnavailableReason = "Firefox on Android doesn't support voice. Use Chrome, or type your answer.";
    } else if (isFirefox) {
      speechUnavailableReason = "Firefox doesn't support voice recognition. Use Chrome or Safari, or type your answer.";
    } else if (isEdge) {
      speechUnavailableReason = "Edge has limited voice support. Use Chrome or Safari, or type your answer.";
    } else if (isOpera) {
      speechUnavailableReason = `${browserName} doesn't support voice recognition. Use Chrome or Safari, or type your answer.`;
    } else {
      speechUnavailableReason = "Your browser may not support voice recognition. Type your answer, or try Chrome or Safari.";
    }
  }

  _cached = {
    // Human-readable
    browserName,
    platform,

    // Speech capability
    hasReliableSpeech,
    speechUnavailableReason,
    hasSpeechSupport,

    // Browser flags (backward compat with App.jsx call sites)
    isChrome,
    isSafari,
    isFirefox,
    isEdge,
    isOpera,
    isOperaGX,
    isSamsungInternet,

    // Platform flags
    isIOS,
    isIOSChrome,
    isIOSThirdParty,
    isNative,

    // Legacy 'name' field (backward compat with App.jsx line ~1319)
    name: browserName,
  };

  return _cached;
}
