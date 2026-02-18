import React from 'react';
import { getBrowserInfo } from '../utils/browserDetection';

/**
 * SpeechUnavailableWarning — reusable component for speech recognition warnings.
 *
 * Renders nothing if the browser supports speech recognition.
 * Shows a platform-aware warning message when speech is unavailable,
 * guiding the user to a supported browser or text input.
 *
 * @param {Object} props
 * @param {'banner'|'inline'} [props.variant='inline'] — 'banner' = full card, 'inline' = single line
 * @param {boolean} [props.darkMode=false] — true for dark backgrounds (prompter, nursing)
 * @param {string} [props.className=''] — additional CSS classes
 */
export default function SpeechUnavailableWarning({ variant = 'inline', darkMode = false, className = '' }) {
  const browser = getBrowserInfo();

  // Render nothing if speech works in this browser
  if (browser.hasReliableSpeech || !browser.speechUnavailableReason) {
    return null;
  }

  const message = browser.speechUnavailableReason;

  if (variant === 'banner') {
    if (darkMode) {
      // Dark background variant (Live Prompter, nursing views)
      return (
        <div className={`bg-amber-900/30 border border-amber-500/50 rounded-lg px-4 py-3 mb-4 flex items-start gap-3 ${className}`}>
          <span className="text-lg flex-shrink-0 mt-0.5">📱</span>
          <div>
            <p className="text-sm text-amber-200 font-medium mb-0.5">Voice not available in {browser.browserName}</p>
            <p className="text-xs text-amber-200/70">{message}</p>
          </div>
        </div>
      );
    }
    // Light background variant (AI Interviewer, Practice Mode)
    return (
      <div className={`bg-amber-50 border-2 border-amber-300 rounded-lg p-4 mb-6 flex items-start gap-3 ${className}`}>
        <span className="text-xl flex-shrink-0 mt-0.5">📱</span>
        <div>
          <p className="text-sm text-amber-900 font-bold mb-0.5">Voice not available in {browser.browserName}</p>
          <p className="text-xs text-amber-800">{message}</p>
        </div>
      </div>
    );
  }

  // Inline variant — single line (nursing input areas)
  if (darkMode) {
    return <p className={`text-amber-400 text-xs mb-2 ${className}`}>{message}</p>;
  }
  return <p className={`text-amber-800 text-xs mb-2 ${className}`}>{message}</p>;
}
