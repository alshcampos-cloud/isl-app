/**
 * PrepRadio.jsx — Passive listen mode for interview prep.
 * Phase 4K v2: Dual-engine audio — server-generated MP3 (Google Cloud TTS)
 * with Web Speech API fallback. MP3 mode survives iOS screen lock.
 *
 * HD Audio (server TTS) gated behind premium: trial, paid pass, or beta.
 * Free users get browser TTS (still functional, just lower quality voice).
 *
 * Props: onBack, questions, practiceHistory, getUserContext, userTier
 */

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { ArrowLeft, Play, Pause, SkipForward, SkipBack, Volume2, Loader2, Wifi, WifiOff, Lock } from 'lucide-react';
import { getPreferredVoice, VOICE_SETTINGS } from '../../utils/voiceManager';
import { generateTTSAudio, revokeTTSAudio, clearTTSCache } from '../../utils/ttsService';
import { TIER_LIMITS } from '../../utils/creditSystem';
import {
  generateDailyBriefing,
  generateQuestionWalkthrough,
  generateStoryReview,
  generateMockInterviewAudio,
  generateAnswerReview,
  generateRecallCoach,
  generateLearnReview,
  generateAudioFlashcards,
  estimateEpisodeDuration,
} from '../../utils/prepRadioContent';
import { getRecentlyCompletedLessons } from '../../utils/learningProgress';
import { getLessonById } from '../../utils/learningContent';

const PLAYLISTS = [
  { id: 'briefing', label: 'Daily Briefing', icon: '☀️', desc: 'Your prep status and focus areas' },
  { id: 'walkthrough', label: 'Question Walkthrough', icon: '📖', desc: 'Study guides read aloud' },
  { id: 'answers', label: 'Answer Review', icon: '🎯', desc: 'Review your practice answers' },
  { id: 'stories', label: 'Story Review', icon: '📝', desc: 'Review your STAR stories' },
  { id: 'mock', label: 'Mental Rehearsal', icon: '🧠', desc: 'Questions + think time' },
  { id: 'recall', label: 'Recall Coach', icon: '💡', desc: 'Memory techniques for interviews' },
  { id: 'learn-review', label: 'Learn Review', icon: '🎓', desc: 'Replay completed lessons' },
  { id: 'flashcards', label: 'Audio Flashcards', icon: '🃏', desc: 'Hands-free question practice' },
];

const SLEEP_TIMERS = [
  { label: 'Off', minutes: 0 },
  { label: '5 min', minutes: 5 },
  { label: '15 min', minutes: 15 },
  { label: '30 min', minutes: 30 },
];

const SPEEDS = [0.8, 1.0, 1.2, 1.5];

// Voice options for MP3 mode (OpenAI TTS voices)
const VOICES = [
  { id: 'nova', label: 'Nova', desc: 'Warm & clear' },
  { id: 'shimmer', label: 'Shimmer', desc: 'Soft & friendly' },
  { id: 'echo', label: 'Echo', desc: 'Deep & calm' },
  { id: 'onyx', label: 'Onyx', desc: 'Rich & confident' },
];

// Check if Web Speech API is available (fallback engine)
const isSpeechSupported = typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined';

// ─── Unsupported browser fallback ──────────────────────────────────────────
function PrepRadioUnsupported({ onBack }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="px-4 py-4 flex items-center gap-3">
        <button onClick={onBack} onTouchEnd={(e) => { e.preventDefault(); onBack(); }} aria-label="Go back" className="p-2 hover:bg-white/10 rounded-xl">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg font-bold">Prep Radio</h1>
          <p className="text-xs text-white/50">Passive interview prep</p>
        </div>
      </div>
      <div className="px-4 py-12 max-w-lg mx-auto text-center">
        <div className="w-20 h-20 mx-auto bg-white/10 rounded-2xl flex items-center justify-center mb-4">
          <span className="text-4xl">🔇</span>
        </div>
        <h2 className="text-xl font-bold mb-2">Audio Not Available</h2>
        <p className="text-sm text-white/60 mb-4">
          Your browser doesn&apos;t support text-to-speech. Try opening this in Safari, Chrome, or Firefox.
        </p>
        <button onClick={onBack} onTouchEnd={(e) => { e.preventDefault(); onBack(); }} className="px-6 py-2.5 bg-white/20 hover:bg-white/30 rounded-xl font-semibold transition-all">
          ← Go Back
        </button>
      </div>
    </div>
  );
}

// ─── Main Prep Radio Component ─────────────────────────────────────────────
function PrepRadioInner({ onBack, questions = [], practiceHistory = [], getUserContext, userTier = 'free', onUpgrade }) {
  // HD audio access check
  const hasHDAudio = TIER_LIMITS[userTier]?.hd_audio === true;

  // --- State ---
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [lines, setLines] = useState([]);
  const [speed, setSpeed] = useState(1.0);
  const [voice, setVoice] = useState('nova');
  const [showVoicePicker, setShowVoicePicker] = useState(false);

  // MP3 mode state
  const [audioMode, setAudioMode] = useState(null); // 'mp3' | 'speech'
  const [audioBlobUrl, setAudioBlobUrl] = useState(null);
  const [audioProgress, setAudioProgress] = useState(0); // 0-100
  const [audioDuration, setAudioDuration] = useState(0);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);

  // Speech mode state (line-based)
  const [currentLine, setCurrentLine] = useState(0);

  // Sleep timer state
  const [sleepTimer, setSleepTimer] = useState(0); // minutes, 0 = off
  const [showSleepPicker, setShowSleepPicker] = useState(false);
  const sleepTimerRef = useRef(null);

  // --- Refs ---
  const audioRef = useRef(null); // HTML5 audio element
  const voiceRef = useRef(null); // Web Speech API voice
  const utteranceRef = useRef(null);
  const cancelledRef = useRef(false);
  const pauseTimerRef = useRef(null);
  const linesRef = useRef([]);
  const speedRef = useRef(1.0);

  // --- Pre-load Web Speech API voice (for fallback) ---
  useEffect(() => {
    if (!isSpeechSupported) return;
    const loadVoice = () => {
      const voices = speechSynthesis.getVoices();
      if (voices.length > 0) voiceRef.current = getPreferredVoice(voices);
    };
    loadVoice();
    speechSynthesis.addEventListener?.('voiceschanged', loadVoice);
    return () => speechSynthesis.removeEventListener?.('voiceschanged', loadVoice);
  }, []);

  // --- Stories from localStorage ---
  const stories = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('isl_stories') || '[]'); } catch { return []; }
  }, []);

  // --- Build coaching context ---
  const getCoachContext = useCallback(() => {
    const ctx = getUserContext ? getUserContext() : {};
    const categories = ['Core Narrative', 'System-Level', 'Behavioral', 'Technical'];
    let weakest = null, lowestPct = 101;
    const practicedTexts = new Set(practiceHistory.map(s => s.question));
    for (const cat of categories) {
      const catQ = questions.filter(q => q.category === cat);
      if (catQ.length === 0) continue;
      const practiced = catQ.filter(q => practicedTexts.has(q.question)).length;
      const pct = catQ.length > 0 ? (practiced / catQ.length) * 100 : 100;
      if (pct < lowestPct) { lowestPct = pct; weakest = cat; }
    }
    let daysUntil = null;
    if (ctx.interviewDate) {
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const interview = new Date(ctx.interviewDate + 'T00:00:00');
      daysUntil = Math.max(0, Math.round((interview - today) / 86400000) + 1);
    }
    return { ...ctx, questionCount: questions.length, sessionCount: practiceHistory.length, weakestCategory: weakest, daysUntil };
  }, [getUserContext, questions, practiceHistory]);

  // --- Generate content lines ---
  const generateContent = useCallback((playlistId) => {
    const ctx = getCoachContext();
    switch (playlistId) {
      case 'briefing':
        return generateDailyBriefing(ctx);
      case 'walkthrough': {
        const unpracticed = questions.filter(q => !practiceHistory.some(s => s.question === q.question));
        const target = unpracticed.length > 0 ? unpracticed.slice(0, 3) : questions.slice(0, 3);
        return target.flatMap(q => generateQuestionWalkthrough(q, null));
      }
      case 'answers': {
        const scored = practiceHistory.filter(s => s.feedback?.overall != null && s.answer);
        if (scored.length === 0) return ["You don't have any scored practice answers yet.", 'Complete a few practice sessions first, then come back.'];
        return generateAnswerReview(practiceHistory, questions);
      }
      case 'stories':
        if (stories.length === 0) return ['You have no stories in your Story Bank yet.', 'Add some stories to review them here.'];
        return stories.flatMap(s => generateStoryReview(s));
      case 'mock':
        return generateMockInterviewAudio(questions.slice(0, 5));
      case 'recall':
        return generateRecallCoach(questions, stories, practiceHistory);
      case 'learn-review': {
        const recentIds = getRecentlyCompletedLessons();
        const recentLessons = recentIds.map(id => getLessonById(id)).filter(Boolean);
        return generateLearnReview(recentLessons);
      }
      case 'flashcards':
        return generateAudioFlashcards(questions, practiceHistory);
      default:
        return ['Select a playlist to begin.'];
    }
  }, [getCoachContext, questions, practiceHistory, stories]);

  // Keep refs synced
  linesRef.current = lines;
  speedRef.current = speed;

  // ─── MP3 Audio Element Event Handlers ──────────────────────────────────
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => {
      if (audio.duration && isFinite(audio.duration)) {
        setAudioCurrentTime(audio.currentTime);
        setAudioProgress((audio.currentTime / audio.duration) * 100);
      }
    };
    const onDurationChange = () => {
      if (audio.duration && isFinite(audio.duration)) {
        setAudioDuration(audio.duration);
      }
    };
    const onEnded = () => {
      setIsPlaying(false);
      setAudioProgress(100);
    };
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('durationchange', onDurationChange);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('durationchange', onDurationChange);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
    };
  }, []);

  // ─── Speech fallback: speakLine ────────────────────────────────────────
  const speakLine = useCallback((text, index) => {
    if (cancelledRef.current) return;
    const allLines = linesRef.current;
    if (text === '...') {
      pauseTimerRef.current = setTimeout(() => {
        if (!cancelledRef.current) {
          const next = index + 1;
          setCurrentLine(next);
          if (next < allLines.length) speakLine(allLines[next], next);
          else { setIsPlaying(false); setCurrentLine(0); }
        }
      }, 2000);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = VOICE_SETTINGS.rate * speedRef.current;
    utterance.pitch = VOICE_SETTINGS.pitch;
    utterance.volume = VOICE_SETTINGS.volume;

    if (!voiceRef.current) {
      const voices = speechSynthesis.getVoices();
      if (voices.length > 0) voiceRef.current = getPreferredVoice(voices);
    }
    if (voiceRef.current) utterance.voice = voiceRef.current;

    utterance.onend = () => {
      if (cancelledRef.current) return;
      const next = index + 1;
      setCurrentLine(next);
      if (next < linesRef.current.length) speakLine(linesRef.current[next], next);
      else { setIsPlaying(false); setCurrentLine(0); }
    };

    utteranceRef.current = utterance;
    speechSynthesis.speak(utterance);
  }, []);

  // ─── Start Playback ───────────────────────────────────────────────────
  const startPlayback = useCallback(async (playlistId) => {
    // Stop anything currently playing
    cancelledRef.current = true;
    if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
    if (isSpeechSupported) speechSynthesis.cancel();
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ''; }
    if (audioBlobUrl) revokeTTSAudio(audioBlobUrl);

    // Generate content
    const content = generateContent(playlistId);
    linesRef.current = content;
    setLines(content);
    setSelectedPlaylist(playlistId);
    setCurrentLine(0);
    setAudioProgress(0);
    setAudioCurrentTime(0);
    setAudioDuration(0);

    // Try MP3 mode first (only if user has HD audio access)
    if (hasHDAudio) {
      setIsGenerating(true);
    }
    setAudioMode(null);

    try {
      if (!hasHDAudio) throw new Error('HD audio requires premium');

      const blobUrl = await generateTTSAudio(content, { voice, speed });

      if (blobUrl && audioRef.current) {
        // MP3 mode success
        setAudioBlobUrl(blobUrl);
        setAudioMode('mp3');
        setIsGenerating(false);
        audioRef.current.src = blobUrl;
        audioRef.current.playbackRate = speed;
        cancelledRef.current = false;
        setIsPlaying(true);
        try { await audioRef.current.play(); } catch (playErr) {
          console.warn('Audio play failed, trying speech fallback:', playErr);
          // Some browsers block autoplay — fall through to speech
          throw new Error('autoplay blocked');
        }
        return;
      }
    } catch (err) {
      console.warn('MP3 TTS failed, using speech fallback:', err.message);
    }

    // Fallback to Web Speech API
    setAudioMode('speech');
    setIsGenerating(false);
    setAudioBlobUrl(null);

    if (isSpeechSupported) {
      cancelledRef.current = false;
      setIsPlaying(true);
      setTimeout(() => speakLine(content[0], 0), 100);
    }
  }, [generateContent, voice, speed, speakLine, audioBlobUrl]);

  // ─── Toggle Play/Pause ────────────────────────────────────────────────
  const togglePlayPause = useCallback(() => {
    if (audioMode === 'mp3' && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(() => {});
      }
    } else if (audioMode === 'speech') {
      if (isPlaying) {
        cancelledRef.current = true;
        if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
        if (isSpeechSupported) speechSynthesis.cancel();
        setIsPlaying(false);
      } else if (selectedPlaylist) {
        cancelledRef.current = false;
        if (currentLine < linesRef.current.length) {
          setIsPlaying(true);
          speakLine(linesRef.current[currentLine], currentLine);
        }
      }
    }
  }, [audioMode, isPlaying, selectedPlaylist, currentLine, speakLine]);

  // ─── Skip ─────────────────────────────────────────────────────────────
  const skip = useCallback((delta) => {
    if (audioMode === 'mp3' && audioRef.current) {
      // Skip ±15 seconds per delta unit
      const skipSec = delta * 5;
      audioRef.current.currentTime = Math.max(0, Math.min(audioRef.current.duration || 0, audioRef.current.currentTime + skipSec));
    } else if (audioMode === 'speech') {
      cancelledRef.current = true;
      if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
      if (isSpeechSupported) speechSynthesis.cancel();
      const next = Math.max(0, Math.min(linesRef.current.length - 1, currentLine + delta));
      setCurrentLine(next);
      cancelledRef.current = false;
      setIsPlaying(true);
      speakLine(linesRef.current[next], next);
    }
  }, [audioMode, currentLine, speakLine]);

  // ─── Speed Change ─────────────────────────────────────────────────────
  const changeSpeed = useCallback((newSpeed) => {
    setSpeed(newSpeed);
    speedRef.current = newSpeed;

    if (audioMode === 'mp3' && audioRef.current) {
      audioRef.current.playbackRate = newSpeed;
    } else if (audioMode === 'speech' && isPlaying) {
      cancelledRef.current = true;
      if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
      if (isSpeechSupported) speechSynthesis.cancel();
      cancelledRef.current = false;
      speakLine(linesRef.current[currentLine], currentLine);
    }
  }, [audioMode, isPlaying, currentLine, speakLine]);

  // ─── Stop & go back to playlists ──────────────────────────────────────
  const stopAndReset = useCallback(() => {
    cancelledRef.current = true;
    if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
    if (isSpeechSupported) speechSynthesis.cancel();
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ''; }
    if (audioBlobUrl) revokeTTSAudio(audioBlobUrl);
    setSelectedPlaylist(null);
    setIsPlaying(false);
    setCurrentLine(0);
    setAudioMode(null);
    setAudioBlobUrl(null);
    setAudioProgress(0);
    setIsGenerating(false);
  }, [audioBlobUrl]);

  // ─── Go back (exit PrepRadio) ─────────────────────────────────────────
  const handleBack = useCallback(() => {
    stopAndReset();
    onBack();
  }, [stopAndReset, onBack]);

  // ─── Sleep timer effect ──────────────────────────────────────────────
  useEffect(() => {
    if (sleepTimerRef.current) clearTimeout(sleepTimerRef.current);
    if (sleepTimer > 0 && isPlaying) {
      sleepTimerRef.current = setTimeout(() => {
        // Fade out by pausing
        if (audioRef.current && audioMode === 'mp3') {
          audioRef.current.pause();
        } else if (audioMode === 'speech') {
          cancelledRef.current = true;
          if (isSpeechSupported) speechSynthesis.cancel();
        }
        setIsPlaying(false);
        setSleepTimer(0);
      }, sleepTimer * 60 * 1000);
    }
    return () => {
      if (sleepTimerRef.current) clearTimeout(sleepTimerRef.current);
    };
  }, [sleepTimer, isPlaying, audioMode]);

  // ─── Cleanup on unmount ───────────────────────────────────────────────
  useEffect(() => {
    return () => {
      cancelledRef.current = true;
      if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
      if (sleepTimerRef.current) clearTimeout(sleepTimerRef.current);
      if (isSpeechSupported) speechSynthesis.cancel();
      clearTTSCache();
    };
  }, []);

  // ─── Computed values ──────────────────────────────────────────────────
  const progress = audioMode === 'mp3'
    ? audioProgress
    : lines.length > 0 ? ((currentLine + 1) / lines.length) * 100 : 0;

  // For MP3 mode, estimate which line we're on based on time proportion
  const estimatedLine = audioMode === 'mp3' && audioDuration > 0
    ? Math.min(lines.length - 1, Math.floor((audioCurrentTime / audioDuration) * lines.length))
    : currentLine;

  const displayLine = lines[estimatedLine] || '';

  // Time formatting helper
  const formatTime = (sec) => {
    if (!sec || !isFinite(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Hidden audio element for MP3 playback */}
      <audio ref={audioRef} preload="auto" />

      {/* Header */}
      <div className="px-4 py-4 flex items-center gap-3">
        <button onClick={handleBack} onTouchEnd={(e) => { e.preventDefault(); handleBack(); }} aria-label="Go back" className="p-2 hover:bg-white/10 rounded-xl">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg font-bold">Prep Radio</h1>
          <p className="text-xs text-white/50">
            {audioMode === 'mp3' ? (
              <span className="flex items-center gap-1"><Wifi className="w-3 h-3 text-emerald-400" /> HD Audio</span>
            ) : audioMode === 'speech' ? (
              <span className="flex items-center gap-1"><WifiOff className="w-3 h-3 text-amber-400" /> Browser voice</span>
            ) : (
              'Passive interview prep'
            )}
          </p>
        </div>
        <Volume2 className="w-5 h-5 text-teal-400 ml-auto" />
      </div>

      <div className="px-4 py-6 max-w-lg mx-auto">
        {/* ── Playlist Selector ────────────────────────────────────────── */}
        {!selectedPlaylist && !isGenerating && (
          <div className="space-y-3">
            <div className="text-center mb-6">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-teal-400/20 to-emerald-400/20 rounded-2xl flex items-center justify-center mb-3">
                <span className="text-4xl">🎧</span>
              </div>
              <h2 className="text-xl font-bold">Choose a Playlist</h2>
              <p className="text-sm text-white/40 mt-1">Listen while you walk, commute, or cook</p>
            </div>

            {/* Voice selector — HD voices for premium users */}
            {hasHDAudio ? (
              <div className="mb-4">
                <button
                  onClick={() => setShowVoicePicker(!showVoicePicker)}
                  onTouchEnd={(e) => { e.preventDefault(); setShowVoicePicker(!showVoicePicker); }}
                  className="w-full flex items-center justify-between px-4 py-2.5 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
                >
                  <span className="text-sm text-white/60">
                    <span className="text-emerald-400 text-xs mr-1.5">HD</span>
                    Voice: <span className="text-white font-medium">{VOICES.find(v => v.id === voice)?.label || 'Nova'}</span>
                  </span>
                  <span className="text-white/30 text-xs">{showVoicePicker ? '▲' : '▼'}</span>
                </button>
                {showVoicePicker && (
                  <div className="mt-1 bg-white/5 rounded-xl overflow-hidden">
                    {VOICES.map(v => (
                      <button
                        key={v.id}
                        onClick={() => { setVoice(v.id); setShowVoicePicker(false); }}
                        onTouchEnd={(e) => { e.preventDefault(); setVoice(v.id); setShowVoicePicker(false); }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between ${
                          voice === v.id ? 'bg-teal-500/20 text-teal-300' : 'hover:bg-white/10 text-white/70'
                        }`}
                      >
                        <span>{v.label}</span>
                        <span className="text-xs text-white/30">{v.desc}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onUpgrade}
                onTouchEnd={(e) => { if (onUpgrade) { e.preventDefault(); onUpgrade(); } }}
                className="w-full mb-4 flex items-center justify-between px-4 py-3 bg-gradient-to-r from-teal-500/10 to-emerald-500/10 border border-teal-500/20 rounded-xl hover:from-teal-500/20 hover:to-emerald-500/20 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-teal-400" />
                  <div className="text-left">
                    <p className="text-sm text-white font-medium">HD Voice — Premium</p>
                    <p className="text-[10px] text-white/40">Natural human-like voices · Works with screen off</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-teal-500 text-white rounded-full text-[10px] font-bold flex-shrink-0">Upgrade</span>
              </button>
            )}

            {PLAYLISTS.map(pl => {
              const noStories = pl.id === 'stories' && stories.length === 0;
              const noAnswers = pl.id === 'answers' && practiceHistory.filter(s => s.feedback?.overall != null && s.answer).length === 0;
              const noLearnLessons = pl.id === 'learn-review' && getRecentlyCompletedLessons().length === 0;
              const noQuestions = pl.id === 'flashcards' && questions.length === 0;
              const isDisabled = noStories || noAnswers || noLearnLessons || noQuestions;

              // Estimate duration
              let durationEst = '';
              try {
                const content = generateContent(pl.id);
                const mins = estimateEpisodeDuration(content);
                durationEst = mins <= 1 ? '~1 min' : `~${mins} min`;
              } catch { durationEst = ''; }

              return (
                <button
                  key={pl.id}
                  onClick={() => startPlayback(pl.id)}
                  onTouchEnd={(e) => { if (!isDisabled) { e.preventDefault(); startPlayback(pl.id); } }}
                  disabled={isDisabled}
                  className="w-full bg-white/10 hover:bg-white/20 rounded-xl p-4 text-left transition-all flex items-center gap-4 disabled:opacity-30 group"
                >
                  <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center group-hover:bg-white/20 transition-colors flex-shrink-0">
                    <span className="text-2xl">{pl.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{pl.label}</p>
                      {(pl.id === 'learn-review' || pl.id === 'flashcards') && (
                        <span className="px-1.5 py-0.5 bg-violet-500/30 text-violet-300 rounded text-[9px] font-bold">NEW</span>
                      )}
                    </div>
                    <p className="text-xs text-white/50">{pl.desc}</p>
                    {durationEst && <p className="text-[10px] text-white/30 mt-0.5">{durationEst}</p>}
                    {noStories && <p className="text-[10px] text-amber-400 mt-0.5">Add stories to your Story Bank first</p>}
                    {noAnswers && <p className="text-[10px] text-amber-400 mt-0.5">Complete practice sessions first</p>}
                    {noLearnLessons && <p className="text-[10px] text-amber-400 mt-0.5">Complete Learn lessons first</p>}
                    {noQuestions && <p className="text-[10px] text-amber-400 mt-0.5">Add questions first</p>}
                  </div>
                  <span className="text-white/30 text-lg group-hover:text-white/60 transition-colors">▶</span>
                </button>
              );
            })}
          </div>
        )}

        {/* ── Generating State ─────────────────────────────────────────── */}
        {isGenerating && (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-teal-400/20 to-emerald-400/20 rounded-2xl flex items-center justify-center mb-6">
              <Loader2 className="w-10 h-10 text-teal-400 animate-spin" />
            </div>
            <h3 className="text-lg font-bold mb-2">Generating Audio...</h3>
            <p className="text-sm text-white/40">Creating your personalized episode with HD voice</p>
            <button
              onClick={stopAndReset}
              onTouchEnd={(e) => { e.preventDefault(); stopAndReset(); }}
              className="mt-6 text-xs text-white/30 hover:text-white/50 underline"
            >
              Cancel
            </button>
          </div>
        )}

        {/* ── Player ───────────────────────────────────────────────────── */}
        {selectedPlaylist && !isGenerating && (
          <div className="space-y-6">
            {/* Album art */}
            <div className="bg-white/5 rounded-2xl p-8 text-center">
              <div className={`w-24 h-24 mx-auto bg-gradient-to-br from-teal-400/30 to-emerald-400/30 rounded-2xl flex items-center justify-center mb-4 transition-all duration-500 ${isPlaying ? 'scale-105 shadow-lg shadow-teal-500/20' : ''}`}>
                <span className={`text-4xl transition-transform duration-500 ${isPlaying ? 'animate-pulse' : ''}`}>
                  {PLAYLISTS.find(p => p.id === selectedPlaylist)?.icon}
                </span>
              </div>
              <h3 className="font-bold text-lg">{PLAYLISTS.find(p => p.id === selectedPlaylist)?.label}</h3>
              <p className="text-sm text-white/40 mt-1">
                {audioMode === 'mp3' ? (
                  <span>{isPlaying ? '🔊 ' : ''}{formatTime(audioCurrentTime)} / {formatTime(audioDuration)}</span>
                ) : (
                  <span>{isPlaying ? '🔊 ' : ''}{estimatedLine + 1} / {lines.length}</span>
                )}
              </p>
              {audioMode === 'mp3' && (
                <p className="text-[10px] text-emerald-400/60 mt-1 flex items-center justify-center gap-1">
                  <Wifi className="w-2.5 h-2.5" /> HD Audio · {VOICES.find(v => v.id === voice)?.label}
                </p>
              )}
            </div>

            {/* Current text display */}
            <div className="bg-white/5 rounded-xl p-4 min-h-[60px] flex items-center justify-center">
              <p className="text-sm text-white/80 text-center leading-relaxed">
                {displayLine === '...' ? '⏸ (pause)' : displayLine || '...'}
              </p>
            </div>

            {/* Progress bar */}
            <div className="relative">
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-teal-400 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
              {/* Clickable seek for MP3 mode */}
              {audioMode === 'mp3' && (
                <div
                  className="absolute inset-0 cursor-pointer"
                  onClick={(e) => {
                    if (audioRef.current && audioDuration > 0) {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const pct = (e.clientX - rect.left) / rect.width;
                      audioRef.current.currentTime = pct * audioDuration;
                    }
                  }}
                />
              )}
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-6">
              <button onClick={() => skip(-3)} onTouchEnd={(e) => { e.preventDefault(); skip(-3); }} aria-label="Skip back" className="p-3 hover:bg-white/10 rounded-full">
                <SkipBack className="w-6 h-6" />
              </button>
              <button
                onClick={togglePlayPause}
                onTouchEnd={(e) => { e.preventDefault(); togglePlayPause(); }}
                aria-label={isPlaying ? 'Pause' : 'Play'}
                className="p-4 bg-teal-500 hover:bg-teal-600 rounded-full shadow-lg transition-all"
              >
                {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-0.5" />}
              </button>
              <button onClick={() => skip(3)} onTouchEnd={(e) => { e.preventDefault(); skip(3); }} aria-label="Skip forward" className="p-3 hover:bg-white/10 rounded-full">
                <SkipForward className="w-6 h-6" />
              </button>
            </div>

            {/* Speed control */}
            <div className="flex items-center justify-center gap-2">
              {SPEEDS.map(s => (
                <button
                  key={s}
                  onClick={() => changeSpeed(s)}
                  onTouchEnd={(e) => { e.preventDefault(); changeSpeed(s); }}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    speed === s ? 'bg-teal-500 text-white' : 'bg-white/10 text-white/60 hover:bg-white/20'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>

            {/* Sleep timer */}
            <div className="flex items-center justify-center">
              <button
                onClick={() => setShowSleepPicker(!showSleepPicker)}
                onTouchEnd={(e) => { e.preventDefault(); setShowSleepPicker(!showSleepPicker); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-xs text-white/50 transition-colors"
              >
                🌙 Sleep: {sleepTimer > 0 ? `${sleepTimer} min` : 'Off'}
              </button>
            </div>
            {showSleepPicker && (
              <div className="flex items-center justify-center gap-1.5">
                {SLEEP_TIMERS.map(t => (
                  <button
                    key={t.minutes}
                    onClick={() => { setSleepTimer(t.minutes); setShowSleepPicker(false); }}
                    onTouchEnd={(e) => { e.preventDefault(); setSleepTimer(t.minutes); setShowSleepPicker(false); }}
                    className={`px-2.5 py-1 rounded-full text-[11px] transition-all ${
                      sleepTimer === t.minutes ? 'bg-violet-500 text-white' : 'bg-white/10 text-white/50 hover:bg-white/20'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            )}

            {/* Back to playlists */}
            <button
              onClick={stopAndReset}
              onTouchEnd={(e) => { e.preventDefault(); stopAndReset(); }}
              className="w-full text-center text-sm text-white/40 hover:text-white/60 py-2"
            >
              ← Choose Different Playlist
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Wrapper: check for minimum audio support ──────────────────────────────
function PrepRadio(props) {
  // MP3 mode works everywhere (HTML5 audio). Only block if NO audio at all.
  const hasAudio = typeof window !== 'undefined' && typeof Audio !== 'undefined';
  if (!hasAudio && !isSpeechSupported) return <PrepRadioUnsupported onBack={props.onBack} />;
  return <PrepRadioInner {...props} />;
}

export default PrepRadio;
