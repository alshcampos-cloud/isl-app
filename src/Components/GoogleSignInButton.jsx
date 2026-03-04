import React from 'react'

/**
 * GoogleSignInButton — Reusable "Continue with Google" button
 *
 * Styled per Google brand guidelines (white bg, colored G, gray text).
 * Uses both onClick + onTouchEnd for iOS Safari compatibility (Battle Scar #16).
 *
 * @param {function} onClick - Handler for sign-in action
 * @param {boolean} loading - Shows spinner when true
 * @param {string} label - Button text (default: "Continue with Google")
 * @param {boolean} disabled - Disables the button
 */
export default function GoogleSignInButton({ onClick, loading = false, label = 'Continue with Google', disabled = false }) {
  const handleInteraction = (e) => {
    e.preventDefault()
    if (!loading && !disabled && onClick) {
      onClick()
    }
  }

  return (
    <button
      type="button"
      onClick={handleInteraction}
      onTouchEnd={(e) => {
        // iOS Safari: onTouchEnd fires before onClick
        // Prevent double-fire by stopping propagation
        e.preventDefault()
        handleInteraction(e)
      }}
      disabled={loading || disabled}
      className={`
        w-full flex items-center justify-center gap-3
        px-4 py-3 rounded-xl
        bg-white border-2 border-slate-200
        text-slate-700 font-medium text-sm
        transition-all duration-150
        ${loading || disabled
          ? 'opacity-50 cursor-not-allowed'
          : 'hover:bg-slate-50 hover:border-slate-300 hover:shadow-md active:scale-[0.98]'
        }
      `}
      aria-label={label}
    >
      {loading ? (
        <span className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
      ) : (
        /* Google "G" logo — official colors */
        <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
      )}
      <span>{loading ? 'Signing in...' : label}</span>
    </button>
  )
}
