// NursingTrack — Reusable Speech Recognition Hook
// ============================================================
// COPIED from App.jsx battle-tested speech implementation (lines 1298-2013).
// This hook encapsulates ALL iOS Safari workarounds (Battle Scars #4-7)
// in a standalone hook that nursing components can import.
//
// ⚠️ D.R.A.F.T. Protocol: This is a NEW file. App.jsx is NOT modified.
//
// Battle Scar #4: iOS Safari mic — keep session open, start once, pause/resume
// Battle Scar #5: getUserMedia requires user gesture on mobile
// Battle Scar #6: "Already started" InvalidStateError guard
// Battle Scar #7: Full cleanup between sessions (stop → remove listeners → null → reinit)
// ============================================================

import { useState, useRef, useCallback, useEffect } from 'react';
import { getBrowserInfo } from '../utils/browserDetection';

/**
 * useSpeechRecognition — standalone speech-to-text hook
 *
 * Returns:
 *   transcript        — accumulated final + current interim text
 *   isListening       — whether recognition is actively running
 *   isSupported       — whether browser supports Web Speech API
 *   startSession()    — request mic + start recognition (must be in user gesture)
 *   stopSession()     — full cleanup: stop recognition, release mic, null refs
 *   clearTranscript() — reset transcript to empty string
 *   error             — last error message (null if none)
 */
export default function useSpeechRecognition() {
  // --- State ---
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState(null);

  // --- Refs (avoid stale closures — Battle Scar #6) ---
  const recognitionRef = useRef(null);
  const micStreamRef = useRef(null);
  const isListeningRef = useRef(false);
  const accumulatedTranscript = useRef('');
  const currentInterimRef = useRef('');

  // --- Browser detection (delegated to shared utility) ---
  const browserInfo = getBrowserInfo();
  const isSupported = typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
  // Note: isSupported = raw API check (for startSession guard).
  // hasReliableSpeech = actually works reliably (for UI display).
  // These differ on iOS Chrome: isSupported=true but hasReliableSpeech=false.

  // --- Initialize speech recognition object ---
  const initRecognition = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return null;

    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    // Suppress sound events (iOS beep mitigation)
    recognition.onsoundstart = null;
    recognition.onsoundend = null;
    recognition.onspeechstart = null;
    recognition.onspeechend = null;
    recognition.onaudiostart = null;
    recognition.onaudioend = null;

    // --- onresult: accumulate transcript ---
    recognition.onresult = (event) => {
      let interim = '', final = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const part = event.results[i][0].transcript;
        if (event.results[i].isFinal) final += part + ' ';
        else interim += part;
      }

      // Save final results permanently
      if (final) {
        accumulatedTranscript.current = (accumulatedTranscript.current + ' ' + final).trim();
        currentInterimRef.current = '';
      }

      // Track interim separately (replaces previous, doesn't accumulate)
      if (interim) {
        currentInterimRef.current = interim;
      }

      // Display combined: all finals + current interim
      const displayText = (accumulatedTranscript.current + ' ' + currentInterimRef.current).trim();
      setTranscript(displayText);
    };

    // --- onerror: handle gracefully ---
    recognition.onerror = (event) => {
      console.error('🎤 Speech error:', event.error);
      if (event.error === 'not-allowed') {
        setError('Microphone permission denied. Please allow mic access.');
        setIsListening(false);
        isListeningRef.current = false;
      }
      if (event.error === 'no-speech') {
        // Normal — just means silence. Don't crash.
        console.log('No speech detected — try speaking louder or closer to mic');
      }
      if (event.error === 'aborted') {
        setIsListening(false);
        isListeningRef.current = false;
      }
    };

    // --- onend: auto-restart if still supposed to be listening ---
    // Battle Scar #4: Keep session open continuously
    recognition.onend = () => {
      if (isListeningRef.current) {
        console.log('🎤 Recognition ended — auto-restarting...');
        try {
          recognition.start();
        } catch (err) {
          console.error('Auto-restart failed:', err);
          setIsListening(false);
          isListeningRef.current = false;
        }
      }
    };

    return recognition;
  }, []);

  // --- Start session (must be called from user gesture for iOS) ---
  // Battle Scar #5: getUserMedia requires user gesture on mobile
  const startSession = useCallback(async () => {
    if (!isSupported) {
      setError('Speech recognition is not supported in this browser.');
      return false;
    }

    setError(null);

    // Step 1: Request mic permission (iOS Safari requires this FIRST, in user gesture)
    if (!micStreamRef.current) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        micStreamRef.current = stream;
        console.log('✅ Mic permission granted');
      } catch (err) {
        console.error('❌ Mic permission denied:', err);
        setError('Microphone permission is required. Please allow mic access and try again.');
        return false;
      }
    }

    // Step 2: Clean up any existing recognition (Battle Scar #7)
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
      } catch (err) {
        console.log('Cleanup during reinit:', err);
      }
      recognitionRef.current = null;
    }

    // Step 3: Initialize fresh recognition
    const recognition = initRecognition();
    if (!recognition) {
      setError('Failed to initialize speech recognition.');
      return false;
    }
    recognitionRef.current = recognition;

    // Step 4: Start (in same user gesture context for iOS)
    try {
      recognition.start();
      setIsListening(true);
      isListeningRef.current = true;
      accumulatedTranscript.current = '';
      currentInterimRef.current = '';
      setTranscript('');
      console.log('✅ Speech session started');
      return true;
    } catch (err) {
      // Battle Scar #6: Handle "already started" gracefully
      if (err.name === 'InvalidStateError') {
        console.log('Recognition already running, continuing...');
        setIsListening(true);
        isListeningRef.current = true;
        return true;
      }
      console.error('Failed to start speech:', err);
      setError('Failed to start microphone: ' + err.message);
      return false;
    }
  }, [isSupported, initRecognition]);

  // --- Stop session: full cleanup ---
  // Battle Scar #7: stop → remove listeners → null ref → release stream
  const stopSession = useCallback(() => {
    console.log('🛑 Stopping speech session');

    // Stop recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        try { recognitionRef.current.abort(); } catch (_) {}

        // Remove all listeners to prevent ghost restarts
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.onstart = null;
        recognitionRef.current.onsoundstart = null;
        recognitionRef.current.onsoundend = null;
        recognitionRef.current.onspeechstart = null;
        recognitionRef.current.onspeechend = null;
        recognitionRef.current.onaudiostart = null;
        recognitionRef.current.onaudioend = null;

        recognitionRef.current = null;
        console.log('✅ Recognition cleaned up');
      } catch (err) {
        console.error('Error stopping recognition:', err);
      }
    }

    // Release mic stream (mobile fix — free up hardware mic)
    if (micStreamRef.current) {
      try {
        micStreamRef.current.getTracks().forEach(track => {
          track.stop();
        });
        micStreamRef.current = null;
        console.log('✅ Mic stream released');
      } catch (err) {
        console.error('Error releasing mic stream:', err);
      }
    }

    // Reset state
    setIsListening(false);
    isListeningRef.current = false;

    console.log('✅ Speech session fully stopped');
  }, []);

  // --- Clear transcript without stopping ---
  const clearTranscript = useCallback(() => {
    accumulatedTranscript.current = '';
    currentInterimRef.current = '';
    setTranscript('');
  }, []);

  // --- Cleanup on unmount ---
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
          recognitionRef.current.onresult = null;
          recognitionRef.current.onerror = null;
          recognitionRef.current.onend = null;
        } catch (_) {}
        recognitionRef.current = null;
      }
      if (micStreamRef.current) {
        try {
          micStreamRef.current.getTracks().forEach(t => t.stop());
        } catch (_) {}
        micStreamRef.current = null;
      }
    };
  }, []);

  return {
    transcript,
    isListening,
    isSupported,
    hasReliableSpeech: browserInfo.hasReliableSpeech,
    speechUnavailableReason: browserInfo.speechUnavailableReason,
    // Backward compat (nursing components still reference these)
    isIOSThirdParty: browserInfo.isIOSThirdParty,
    iosThirdPartyName: browserInfo.browserName,
    startSession,
    stopSession,
    clearTranscript,
    error,
  };
}
