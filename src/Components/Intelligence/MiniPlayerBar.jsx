/**
 * MiniPlayerBar.jsx — Persistent mini player bar for background audio.
 * Phase 5, Sprint 10. D.R.A.F.T. protocol: NEW file.
 *
 * Shows at the bottom of the screen when audio is playing and user
 * navigates away from Prep Radio or Learn section.
 * Only works with MP3 mode (Web Speech API can't persist across view changes).
 *
 * Props:
 *   isVisible     — Whether to show the bar
 *   isPlaying     — Current playback state
 *   title         — Episode/lesson title
 *   progress      — 0-100 playback progress
 *   onTogglePlay  — Play/pause callback
 *   onTap         — Return to full player callback
 *   onClose       — Close/stop callback
 */

import { Play, Pause, X } from 'lucide-react'

export default function MiniPlayerBar({
  isVisible = false,
  isPlaying = false,
  title = '',
  progress = 0,
  onTogglePlay,
  onTap,
  onClose,
}) {
  if (!isVisible) return null

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 999,
        background: 'linear-gradient(to right, #1e293b, #0f172a)',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.3)',
      }}
    >
      {/* Progress bar at top of mini player */}
      <div style={{
        height: '2px',
        background: 'rgba(255,255,255,0.1)',
        position: 'relative',
      }}>
        <div style={{
          height: '100%',
          width: `${progress}%`,
          background: 'linear-gradient(90deg, #14b8a6, #6366f1)',
          transition: 'width 0.5s ease',
        }} />
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '0.6rem 0.75rem',
        gap: '0.75rem',
      }}>
        {/* Tap area to return to full player */}
        <button
          onClick={onTap}
          onTouchEnd={(e) => { e.preventDefault(); onTap?.() }}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            textAlign: 'left',
            padding: 0,
          }}
        >
          {/* Mini icon */}
          <div style={{
            width: '2.25rem',
            height: '2.25rem',
            borderRadius: '0.5rem',
            background: 'linear-gradient(135deg, rgba(20,184,166,0.3), rgba(99,102,241,0.3))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <span style={{ fontSize: '1.1rem' }}>🎧</span>
          </div>

          {/* Title */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{
              fontSize: '0.85rem',
              fontWeight: 600,
              color: '#fff',
              margin: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {title || 'Now Playing'}
            </p>
            <p style={{
              fontSize: '0.7rem',
              color: 'rgba(255,255,255,0.4)',
              margin: 0,
            }}>
              {isPlaying ? 'Playing' : 'Paused'} • Tap to expand
            </p>
          </div>
        </button>

        {/* Play/Pause */}
        <button
          onClick={onTogglePlay}
          onTouchEnd={(e) => { e.preventDefault(); onTogglePlay?.() }}
          style={{
            width: '2.25rem',
            height: '2.25rem',
            borderRadius: '50%',
            background: '#14b8a6',
            border: 'none',
            color: '#fff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {isPlaying ? <Pause size={16} /> : <Play size={16} style={{ marginLeft: '1px' }} />}
        </button>

        {/* Close */}
        <button
          onClick={onClose}
          onTouchEnd={(e) => { e.preventDefault(); onClose?.() }}
          style={{
            width: '2rem',
            height: '2rem',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)',
            border: 'none',
            color: 'rgba(255,255,255,0.5)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <X size={14} />
        </button>
      </div>

      {/* Safe area padding for notched phones */}
      <div style={{ height: 'env(safe-area-inset-bottom, 0px)' }} />
    </div>
  )
}
