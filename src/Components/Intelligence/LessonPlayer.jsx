import { isTap } from '../../utils/tapGuard';
/**
 * LessonPlayer.jsx — Audio lesson player with quiz flow for Learn section.
 * Phase 5, Sprint 4. D.R.A.F.T. protocol: NEW file.
 *
 * Flow: Listen (audio) → Quiz (active recall) → Complete (score + takeaways)
 * Reuses PrepRadio's dual-engine TTS (server MP3 + Web Speech API fallback).
 *
 * Props:
 *   lesson     — Lesson object from learningContent.js
 *   moduleTitle — Module name for display
 *   lessonNumber — e.g., "2 of 5"
 *   onComplete — (score: number) => void — called when lesson is done
 *   onBack     — () => void — return to course map
 *   userTier   — User's current tier for HD audio gating
 */

import { useState, useRef, useCallback, useEffect } from 'react'
import {
  ArrowLeft, Play, Pause, SkipForward, SkipBack,
  Volume2, Loader2, Wifi, WifiOff, CheckCircle2,
  Star, ChevronRight, RotateCcw, BookOpen
} from 'lucide-react'
import { getPreferredVoice, VOICE_SETTINGS } from '../../utils/voiceManager'
import { generateTTSAudio, revokeTTSAudio } from '../../utils/ttsService'
import { TIER_LIMITS } from '../../utils/creditSystem'
import ActiveRecallQuiz from './ActiveRecallQuiz'

const SPEEDS = [0.8, 1.0, 1.2, 1.5]

const isSpeechSupported = typeof window !== 'undefined' &&
  'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined'

// ─── Phase Enum ──────────────────────────────────────────────
const PHASE = {
  LISTEN: 'listen',
  QUIZ: 'quiz',
  COMPLETE: 'complete',
}

export default function LessonPlayer({
  lesson,
  moduleTitle = '',
  lessonNumber = '',
  onComplete,
  onBack,
  userTier = 'free',
}) {
  if (!lesson) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8' }}>
        <p>Lesson not found.</p>
        <button
          onClick={onBack}
          onTouchEnd={(e) => { if (isTap(e)) { e.preventDefault(); onBack?.() } }}
          style={{ marginTop: '1rem', padding: '0.6rem 1.5rem', borderRadius: '0.75rem', background: '#f1f5f9', border: 'none', color: '#475569', cursor: 'pointer' }}
        >
          ← Back
        </button>
      </div>
    )
  }

  const hasHDAudio = TIER_LIMITS[userTier]?.hd_audio === true

  // --- State ---
  const [phase, setPhase] = useState(PHASE.LISTEN)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [audioMode, setAudioMode] = useState(null) // 'mp3' | 'speech'
  const [speed, setSpeed] = useState(1.0)
  const [currentLine, setCurrentLine] = useState(0)

  // MP3 state
  const [audioBlobUrl, setAudioBlobUrl] = useState(null)
  const [audioProgress, setAudioProgress] = useState(0)
  const [audioDuration, setAudioDuration] = useState(0)
  const [audioCurrentTime, setAudioCurrentTime] = useState(0)

  // Quiz state
  const [quizScore, setQuizScore] = useState(0)
  const [audioCompleted, setAudioCompleted] = useState(false)

  // --- Refs ---
  const audioRef = useRef(null)
  const voiceRef = useRef(null)
  const utteranceRef = useRef(null)
  const cancelledRef = useRef(false)
  const pauseTimerRef = useRef(null)
  const linesRef = useRef(lesson.audioScript || [])
  const speedRef = useRef(1.0)

  // ─── Pre-load Web Speech API voice ──────────────────────────
  useEffect(() => {
    if (!isSpeechSupported) return
    const loadVoice = () => {
      const voices = speechSynthesis.getVoices()
      if (voices.length > 0) voiceRef.current = getPreferredVoice(voices)
    }
    loadVoice()
    speechSynthesis.addEventListener?.('voiceschanged', loadVoice)
    return () => speechSynthesis.removeEventListener?.('voiceschanged', loadVoice)
  }, [])

  // ─── MP3 Audio Event Handlers ──────────────────────────────
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const onTimeUpdate = () => {
      if (audio.duration && isFinite(audio.duration)) {
        setAudioCurrentTime(audio.currentTime)
        setAudioProgress((audio.currentTime / audio.duration) * 100)
      }
    }
    const onDurationChange = () => {
      if (audio.duration && isFinite(audio.duration)) {
        setAudioDuration(audio.duration)
      }
    }
    const onEnded = () => {
      setIsPlaying(false)
      setAudioProgress(100)
      setAudioCompleted(true)
    }
    const onPlay = () => setIsPlaying(true)
    const onPause = () => setIsPlaying(false)

    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('durationchange', onDurationChange)
    audio.addEventListener('ended', onEnded)
    audio.addEventListener('play', onPlay)
    audio.addEventListener('pause', onPause)

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.removeEventListener('durationchange', onDurationChange)
      audio.removeEventListener('ended', onEnded)
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('pause', onPause)
    }
  }, [])

  // ─── Cleanup on unmount ────────────────────────────────────
  useEffect(() => {
    return () => {
      cancelledRef.current = true
      if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current)
      if (isSpeechSupported) speechSynthesis.cancel()
      if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = '' }
      if (audioBlobUrl) revokeTTSAudio(audioBlobUrl)
    }
  }, [audioBlobUrl])

  // Keep refs synced
  linesRef.current = lesson.audioScript || []
  speedRef.current = speed

  // ─── Speech fallback: speakLine ────────────────────────────
  const speakLine = useCallback((text, index) => {
    if (cancelledRef.current) return
    const allLines = linesRef.current
    if (text === '...') {
      pauseTimerRef.current = setTimeout(() => {
        if (!cancelledRef.current) {
          const next = index + 1
          setCurrentLine(next)
          if (next < allLines.length) speakLine(allLines[next], next)
          else {
            setIsPlaying(false)
            setCurrentLine(0)
            setAudioCompleted(true)
          }
        }
      }, 2000)
      return
    }

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = VOICE_SETTINGS.rate * speedRef.current
    utterance.pitch = VOICE_SETTINGS.pitch
    utterance.volume = VOICE_SETTINGS.volume

    if (!voiceRef.current) {
      const voices = speechSynthesis.getVoices()
      if (voices.length > 0) voiceRef.current = getPreferredVoice(voices)
    }
    if (voiceRef.current) utterance.voice = voiceRef.current

    // iOS Safari workaround: onend sometimes doesn't fire.
    // Use a timer fallback that checks if speech finished.
    let endFired = false
    const advanceToNext = () => {
      if (endFired || cancelledRef.current) return
      endFired = true
      const next = index + 1
      setCurrentLine(next)
      if (next < linesRef.current.length) speakLine(linesRef.current[next], next)
      else {
        setIsPlaying(false)
        setCurrentLine(0)
        setAudioCompleted(true)
      }
    }

    utterance.onend = advanceToNext

    // Fallback: estimate duration and force-advance even if speechSynthesis.speaking is stuck true
    // Chrome sometimes reports speaking=true even after utterance completes (known browser bug)
    const estimatedMs = Math.max(2000, (text.length / 12) * 1000 / (speedRef.current || 1))
    const fallbackTimer = setTimeout(() => {
      if (!endFired && !cancelledRef.current) {
        console.log('[LessonPlayer] Fallback timer: force-advancing past line', index, 'speaking:', speechSynthesis.speaking)
        speechSynthesis.cancel() // Force stop any stuck utterance
        advanceToNext()
      }
    }, estimatedMs + 2000)

    utterance.onerror = () => {
      clearTimeout(fallbackTimer)
      advanceToNext()
    }

    utteranceRef.current = utterance
    speechSynthesis.speak(utterance)

    // Store timer ref for cleanup
    if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current)
    pauseTimerRef.current = fallbackTimer
  }, [])

  // ─── Start Playback ────────────────────────────────────────
  const playbackLockRef = useRef(false)
  const startPlayback = useCallback(async () => {
    // Guard against rapid double-invocation (double-click, re-render, etc.)
    if (playbackLockRef.current) {
      console.log('[LessonPlayer] Ignoring duplicate startPlayback call')
      return
    }
    playbackLockRef.current = true
    setTimeout(() => { playbackLockRef.current = false }, 500) // unlock after 500ms

    cancelledRef.current = true
    if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current)
    if (isSpeechSupported) speechSynthesis.cancel()
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = '' }
    if (audioBlobUrl) revokeTTSAudio(audioBlobUrl)

    const content = lesson.audioScript || []
    if (content.length === 0) {
      console.warn('[LessonPlayer] No audio script content for lesson:', lesson.id)
      return
    }
    linesRef.current = content
    setCurrentLine(0)
    setAudioProgress(0)
    setAudioCurrentTime(0)
    setAudioDuration(0)

    // Helper: start Web Speech fallback (small delay after cancel for Chrome)
    const startSpeechFallback = () => {
      console.log('[LessonPlayer] Starting Web Speech fallback, lines:', content.length)
      if (isSpeechSupported && content.length > 0) {
        setAudioMode('speech')
        setIsGenerating(false)
        // CRITICAL: Reset cancelled BEFORE the timeout so speakLine doesn't bail
        cancelledRef.current = false
        // Chrome needs ~100ms after speechSynthesis.cancel() before speaking again
        setTimeout(() => {
          if (cancelledRef.current) return // component unmounted during delay
          setIsPlaying(true)
          speakLine(content[0], 0)
        }, 150)
      } else {
        console.warn('[LessonPlayer] Web Speech API not supported in this browser')
        setIsGenerating(false)
      }
    }

    // Try pre-generated MP3 first (hosted on Supabase Storage or local /audio/lessons/)
    // Fall back to Web Speech API if MP3 not available
    const mp3Url = `/audio/lessons/lesson-${lesson.id}.mp3`
    try {
      const headResp = await fetch(mp3Url, { method: 'HEAD' })
      if (headResp.ok && audioRef.current) {
        console.log('[LessonPlayer] Found pre-generated MP3:', mp3Url)
        setAudioMode('mp3')
        setIsGenerating(false)
        audioRef.current.src = mp3Url
        audioRef.current.playbackRate = speed
        cancelledRef.current = false
        setIsPlaying(true)
        try {
          await audioRef.current.play()
          return // MP3 playing successfully
        } catch (playErr) {
          console.log('[LessonPlayer] MP3 autoplay blocked, trying speech:', playErr.message)
        }
      }
    } catch {
      // MP3 not available, fall through to HD TTS / speech
    }

    // Middle tier: server-generated HD TTS (OpenAI/nova) when tier allows
    if (hasHDAudio && content.length > 0) {
      try {
        console.log('[LessonPlayer] Attempting HD TTS generation for lesson:', lesson.id)
        setIsGenerating(true)
        const blobUrl = await generateTTSAudio(content, { voice: 'nova', speed: 1.0 })
        setIsGenerating(false)
        if (blobUrl && audioRef.current && !cancelledRef.current) {
          console.log('[LessonPlayer] HD TTS generated, playing blob URL')
          setAudioBlobUrl(blobUrl)
          setAudioMode('mp3')
          audioRef.current.src = blobUrl
          audioRef.current.playsInline = true // iOS fix
          audioRef.current.playbackRate = speed
          cancelledRef.current = false
          setIsPlaying(true)
          try {
            await audioRef.current.play()
            return // HD TTS playing successfully
          } catch (playErr) {
            console.log('[LessonPlayer] HD TTS autoplay blocked, falling back to speech:', playErr.message)
          }
        }
      } catch (err) {
        console.warn('[LessonPlayer] HD TTS failed, falling back to Web Speech:', err?.message || err)
        setIsGenerating(false)
        // fall through to Web Speech
      }
    }

    // Last resort: Web Speech API
    startSpeechFallback()
  }, [lesson, hasHDAudio, speed, audioBlobUrl, speakLine])

  // ─── Toggle play/pause ─────────────────────────────────────
  const togglePlayPause = useCallback(() => {
    if (audioMode === 'mp3' && audioRef.current) {
      if (isPlaying) audioRef.current.pause()
      else audioRef.current.play().catch(() => {})
    } else if (audioMode === 'speech') {
      if (isPlaying) {
        speechSynthesis.pause()
        setIsPlaying(false)
      } else {
        speechSynthesis.resume()
        setIsPlaying(true)
      }
    } else {
      // Not started yet — start playback
      startPlayback()
    }
  }, [audioMode, isPlaying, startPlayback])

  // ─── Speed toggle ──────────────────────────────────────────
  const cycleSpeed = useCallback(() => {
    const idx = SPEEDS.indexOf(speed)
    const next = SPEEDS[(idx + 1) % SPEEDS.length]
    setSpeed(next)
    if (audioMode === 'mp3' && audioRef.current) {
      audioRef.current.playbackRate = next
    }
  }, [speed, audioMode])

  // ─── Skip to quiz ──────────────────────────────────────────
  const skipToQuiz = useCallback(() => {
    cancelledRef.current = true
    if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current)
    if (isSpeechSupported) speechSynthesis.cancel()
    if (audioRef.current) { audioRef.current.pause() }
    setIsPlaying(false)
    setAudioCompleted(true)
    setPhase(PHASE.QUIZ)
  }, [])

  // ─── Auto-transition to quiz when audio finishes ───────────
  useEffect(() => {
    if (audioCompleted && phase === PHASE.LISTEN) {
      // Brief delay then transition to quiz
      const timer = setTimeout(() => setPhase(PHASE.QUIZ), 1500)
      return () => clearTimeout(timer)
    }
  }, [audioCompleted, phase])

  // ─── Quiz completion handler ───────────────────────────────
  const handleQuizComplete = useCallback((score) => {
    setQuizScore(score)
    setPhase(PHASE.COMPLETE)
  }, [])

  // ─── Format time ───────────────────────────────────────────
  const formatTime = (s) => {
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  // ─── Get display text for current line ─────────────────────
  const displayLines = (lesson.audioScript || []).filter(l => l && l !== '...')
  const displayLine = audioMode === 'speech'
    ? (linesRef.current[currentLine] !== '...' ? linesRef.current[currentLine] : '')
    : ''

  // ─── Handle back with cleanup ──────────────────────────────
  const handleBack = useCallback(() => {
    cancelledRef.current = true
    if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current)
    if (isSpeechSupported) speechSynthesis.cancel()
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = '' }
    onBack?.()
  }, [onBack])

  // =================================================================
  // RENDER
  // =================================================================

  return (
    <div style={{
      minHeight: '100vh',
      background: phase === PHASE.LISTEN
        ? 'linear-gradient(to bottom, #0f172a, #1e293b, #0f172a)'
        : '#f8fafc',
    }}>
      {/* Hidden audio element for MP3 mode */}
      <audio ref={audioRef} preload="none" />

      {/* ─── PHASE: LISTEN ──────────────────────────────────── */}
      {phase === PHASE.LISTEN && (
        <div style={{ color: '#fff' }}>
          {/* Header */}
          <div style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={handleBack}
              onTouchEnd={(e) => { if (isTap(e)) { e.preventDefault(); handleBack() } }}
              style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '0.75rem', color: '#fff', cursor: 'pointer' }}
            >
              <ArrowLeft size={20} />
            </button>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', margin: 0 }}>
                {moduleTitle} {lessonNumber && `• Lesson ${lessonNumber}`}
              </p>
              <h1 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>{lesson.title}</h1>
            </div>
            {audioMode && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.3rem',
                padding: '0.25rem 0.6rem', borderRadius: '1rem',
                background: audioMode === 'mp3' ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.1)',
                fontSize: '0.7rem', color: audioMode === 'mp3' ? '#86efac' : 'rgba(255,255,255,0.5)',
              }}>
                {audioMode === 'mp3' ? <Wifi size={12} /> : <WifiOff size={12} />}
                {audioMode === 'mp3' ? 'HD' : 'Basic'}
              </div>
            )}
          </div>

          {/* Album art / lesson visual */}
          <div style={{ padding: '2rem 2rem 1.5rem', textAlign: 'center' }}>
            <div style={{
              width: '10rem', height: '10rem', margin: '0 auto',
              borderRadius: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'linear-gradient(135deg, rgba(99,102,241,0.3), rgba(139,92,246,0.3))',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            }}>
              <span style={{ fontSize: '4rem' }}>🎧</span>
            </div>

            {/* Duration estimate */}
            <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginTop: '1rem' }}>
              ~{(lesson.duration || '3-5 min').replace(/\s*min\s*$/, '')} min lesson
            </p>
          </div>

          {/* Current spoken text */}
          {audioMode === 'speech' && displayLine && (
            <div style={{ padding: '0 1.5rem', marginBottom: '1rem' }}>
              <div style={{
                padding: '1rem', borderRadius: '0.75rem',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}>
                <p style={{ fontSize: '0.92rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.6, margin: 0, textAlign: 'center' }}>
                  "{displayLine}"
                </p>
              </div>
            </div>
          )}

          {/* Progress bar */}
          <div style={{ padding: '0 1.5rem' }}>
            {audioMode === 'mp3' ? (
              <>
                <div style={{
                  height: '4px', borderRadius: '2px',
                  background: 'rgba(255,255,255,0.1)', overflow: 'hidden',
                }}>
                  <div style={{
                    width: `${audioProgress}%`, height: '100%',
                    background: 'linear-gradient(90deg, #6366f1, #a78bfa)',
                    transition: 'width 0.3s ease',
                  }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.4rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>{formatTime(audioCurrentTime)}</span>
                  <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>{formatTime(audioDuration)}</span>
                </div>
              </>
            ) : audioMode === 'speech' ? (
              <>
                <div style={{
                  height: '4px', borderRadius: '2px',
                  background: 'rgba(255,255,255,0.1)', overflow: 'hidden',
                }}>
                  <div style={{
                    width: `${linesRef.current.length > 0 ? (currentLine / linesRef.current.length) * 100 : 0}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #6366f1, #a78bfa)',
                    transition: 'width 0.3s ease',
                  }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.4rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>
                    Line {Math.min(currentLine + 1, displayLines.length)} of {displayLines.length}
                  </span>
                </div>
              </>
            ) : null}
          </div>

          {/* Controls */}
          <div style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem' }}>
            {/* Speed button */}
            <button
              onClick={cycleSpeed}
              onTouchEnd={(e) => { if (isTap(e)) { e.preventDefault(); cycleSpeed() } }}
              style={{
                padding: '0.5rem 0.8rem', borderRadius: '0.6rem',
                background: 'rgba(255,255,255,0.1)', border: 'none',
                color: '#fff', fontSize: '0.8rem', fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {speed}x
            </button>

            {/* Play / Pause */}
            {isGenerating ? (
              <div style={{
                width: '4rem', height: '4rem', borderRadius: '50%',
                background: 'rgba(255,255,255,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Loader2 size={28} color="#a78bfa" className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
              </div>
            ) : (
              <button
                onClick={togglePlayPause}
                onTouchEnd={(e) => { if (isTap(e)) { e.preventDefault(); togglePlayPause() } }}
                style={{
                  width: '4rem', height: '4rem', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  border: 'none', color: '#fff', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 20px rgba(99,102,241,0.4)',
                }}
              >
                {isPlaying ? <Pause size={28} /> : <Play size={28} style={{ marginLeft: '3px' }} />}
              </button>
            )}

            {/* Skip to quiz */}
            <button
              onClick={skipToQuiz}
              onTouchEnd={(e) => { if (isTap(e)) { e.preventDefault(); skipToQuiz() } }}
              style={{
                padding: '0.5rem 0.8rem', borderRadius: '0.6rem',
                background: 'rgba(255,255,255,0.1)', border: 'none',
                color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem', fontWeight: 600,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem',
              }}
            >
              Quiz <SkipForward size={14} />
            </button>
          </div>

          {/* Read Along Transcript */}
          <div style={{ padding: '0 1rem 1rem' }}>
            <details open style={{
              borderRadius: '0.75rem',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              overflow: 'hidden',
            }}>
              <summary style={{
                padding: '0.75rem 1rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'rgba(255,255,255,0.5)',
                cursor: 'pointer',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                userSelect: 'none',
                listStyle: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}>
                <BookOpen size={14} style={{ opacity: 0.6 }} />
                Read Along
              </summary>
              <div style={{
                padding: '0 1rem 1rem',
                maxHeight: '40vh',
                overflowY: 'auto',
              }}>
                {(lesson.audioScript || []).map((line, idx) => {
                  if (line === '...') return null
                  const isActive = idx === currentLine && isPlaying
                  const isPast = idx < currentLine
                  return (
                    <p key={idx} style={{
                      fontSize: '0.85rem',
                      lineHeight: 1.7,
                      margin: '0.25rem 0',
                      padding: '0.35rem 0.6rem',
                      borderRadius: '0.4rem',
                      color: isActive
                        ? '#fff'
                        : isPast
                          ? 'rgba(255,255,255,0.35)'
                          : 'rgba(255,255,255,0.55)',
                      background: isActive ? 'rgba(99,102,241,0.2)' : 'transparent',
                      borderLeft: isActive ? '3px solid #818cf8' : '3px solid transparent',
                      transition: 'all 0.3s ease',
                    }}>
                      {line}
                    </p>
                  )
                })}
              </div>
            </details>
          </div>

          {/* Audio completed banner */}
          {audioCompleted && (
            <div style={{
              margin: '0 1rem 1rem', padding: '1rem',
              borderRadius: '0.75rem',
              background: 'rgba(34,197,94,0.15)',
              border: '1px solid rgba(34,197,94,0.3)',
              textAlign: 'center',
            }}>
              <CheckCircle2 size={24} color="#22c55e" style={{ margin: '0 auto 0.5rem' }} />
              <p style={{ fontSize: '0.95rem', fontWeight: 600, color: '#86efac', margin: '0 0 0.25rem' }}>
                Audio Complete!
              </p>
              <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', margin: 0 }}>
                Moving to active recall quiz...
              </p>
            </div>
          )}
        </div>
      )}

      {/* ─── PHASE: QUIZ ────────────────────────────────────── */}
      {phase === PHASE.QUIZ && (
        <div>
          {/* Header */}
          <div style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>
            <button
              onClick={handleBack}
              onTouchEnd={(e) => { if (isTap(e)) { e.preventDefault(); handleBack() } }}
              style={{ padding: '0.5rem', background: '#f1f5f9', border: 'none', borderRadius: '0.75rem', color: '#475569', cursor: 'pointer' }}
            >
              <ArrowLeft size={20} />
            </button>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>
                {lesson.title}
              </p>
              <h1 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>
                Active Recall Quiz
              </h1>
            </div>
          </div>

          {/* Quiz content */}
          <div style={{ padding: '1.25rem', maxWidth: '32rem', margin: '0 auto' }}>
            <ActiveRecallQuiz
              quiz={lesson.quiz || []}
              onComplete={handleQuizComplete}
            />
          </div>
        </div>
      )}

      {/* ─── PHASE: COMPLETE ────────────────────────────────── */}
      {phase === PHASE.COMPLETE && (
        <div>
          {/* Header */}
          <div style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>
            <button
              onClick={handleBack}
              onTouchEnd={(e) => { if (isTap(e)) { e.preventDefault(); handleBack() } }}
              style={{ padding: '0.5rem', background: '#f1f5f9', border: 'none', borderRadius: '0.75rem', color: '#475569', cursor: 'pointer' }}
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>
                Lesson Complete!
              </h1>
            </div>
          </div>

          <div style={{ padding: '1.5rem', maxWidth: '32rem', margin: '0 auto' }}>
            {/* Score card */}
            <div style={{
              padding: '1.5rem', borderRadius: '1rem', textAlign: 'center',
              background: 'linear-gradient(135deg, #f0fdf4, #ecfdf5)',
              border: '1px solid #bbf7d0',
              marginBottom: '1.25rem',
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🎉</div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#166534', margin: '0 0 0.5rem' }}>
                {lesson.title}
              </h2>

              {/* Stars */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.3rem', marginBottom: '0.75rem' }}>
                {[1, 2, 3].map(i => (
                  <Star
                    key={i}
                    size={28}
                    color={i <= quizScore ? '#f59e0b' : '#d1d5db'}
                    fill={i <= quizScore ? '#f59e0b' : 'none'}
                  />
                ))}
              </div>

              <p style={{ fontSize: '1rem', fontWeight: 600, color: '#475569', margin: 0 }}>
                Score: {quizScore}/3
              </p>
            </div>

            {/* Key Takeaways */}
            {lesson.keyTakeaways && lesson.keyTakeaways.length > 0 && (
              <div style={{
                padding: '1rem 1.25rem', borderRadius: '0.75rem',
                background: '#fff', border: '1px solid #e2e8f0',
                marginBottom: '1.25rem',
              }}>
                <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
                  Key Takeaways
                </h3>
                <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                  {lesson.keyTakeaways.map((t, i) => (
                    <li key={i} style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.6, marginBottom: '0.4rem' }}>
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {/* Complete & continue */}
              <button
                onClick={() => onComplete?.(quizScore)}
                onTouchEnd={(e) => { if (isTap(e)) { e.preventDefault(); onComplete?.(quizScore) } }}
                style={{
                  width: '100%', padding: '0.9rem', borderRadius: '0.75rem',
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  border: 'none', color: '#fff', fontSize: '1rem', fontWeight: 700,
                  cursor: 'pointer', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', gap: '0.5rem',
                  boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
                }}
              >
                Continue <ChevronRight size={20} />
              </button>

              {/* Replay lesson */}
              <button
                onClick={() => {
                  setPhase(PHASE.LISTEN)
                  setAudioCompleted(false)
                  setAudioProgress(0)
                  setCurrentLine(0)
                }}
                onTouchEnd={(e) => { if (isTap(e)) { e.preventDefault()
                  setPhase(PHASE.LISTEN)
                  setAudioCompleted(false)
                  setAudioProgress(0)
                  setCurrentLine(0) } }}
                style={{
                  width: '100%', padding: '0.75rem', borderRadius: '0.75rem',
                  background: '#f8fafc', border: '1px solid #e2e8f0',
                  color: '#475569', fontSize: '0.9rem', fontWeight: 600,
                  cursor: 'pointer', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', gap: '0.5rem',
                }}
              >
                <RotateCcw size={16} /> Replay Lesson
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inline CSS for spin animation */}
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
