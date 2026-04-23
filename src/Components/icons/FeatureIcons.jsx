/**
 * FeatureIcons.jsx — Custom duotone SVG icons for InterviewAnswers.ai
 *
 * These replace generic Lucide icons on feature cards and headers.
 * Each icon is a custom 2-layer design:
 *   - Primary layer: full opacity, the core symbol
 *   - Secondary layer: 35% opacity, background/decorative element
 *
 * Design principles:
 *   - Rounded corners (strokeLinecap="round", strokeLinejoin="round")
 *   - 2px stroke weight for consistency
 *   - 24x24 viewBox
 *   - Color inherited via currentColor or explicit props
 */

// ============================================================
// GLOBAL SVG GRADIENT DEFINITIONS
// Place this ONCE in App.jsx near the top of the render tree
// ============================================================
export function GradientDefs() {
  return (
    <svg style={{ width: 0, height: 0, position: 'absolute' }} aria-hidden="true">
      <defs>
        {/* Teal gradient — Practice Prompter, Practice, default */}
        <linearGradient id="icon-grad-teal" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0d9488" />
          <stop offset="100%" stopColor="#14b8a6" />
        </linearGradient>
        {/* Navy gradient — AI Interviewer, Command Center */}
        <linearGradient id="icon-grad-navy" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1e3a5f" />
          <stop offset="100%" stopColor="#334155" />
        </linearGradient>
        {/* Amber gradient — Flashcards, achievements */}
        <linearGradient id="icon-grad-amber" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#d97706" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
        {/* Sky gradient — JD Decoder, analytics */}
        <linearGradient id="icon-grad-sky" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0284c7" />
          <stop offset="100%" stopColor="#38bdf8" />
        </linearGradient>
        {/* Violet gradient — AI Coach, intelligence */}
        <linearGradient id="icon-grad-violet" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#a78bfa" />
        </linearGradient>
        {/* Rose gradient — Interview Day */}
        <linearGradient id="icon-grad-rose" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#e11d48" />
          <stop offset="100%" stopColor="#fb7185" />
        </linearGradient>
        {/* Emerald gradient — Story Bank, resources */}
        <linearGradient id="icon-grad-emerald" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#059669" />
          <stop offset="100%" stopColor="#34d399" />
        </linearGradient>
        {/* Slate gradient — Notes, stealth */}
        <linearGradient id="icon-grad-slate" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#475569" />
          <stop offset="100%" stopColor="#94a3b8" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// ============================================================
// ICON: Practice Prompter — Microphone with sound waves
// ============================================================
export function PrompterIcon({ size = 28, gradient = 'teal', className = '' }) {
  const gradId = `icon-grad-${gradient}`;
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" className={className}>
      {/* Secondary: sound wave arcs */}
      <path
        d="M16.5 7.5c1 1.2 1.5 2.8 1.5 4.5s-.5 3.3-1.5 4.5"
        stroke={`url(#${gradId})`}
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity="0.3"
      />
      <path
        d="M19 5c1.7 2 2.5 4.5 2.5 7s-.8 5-2.5 7"
        stroke={`url(#${gradId})`}
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity="0.2"
      />
      {/* Primary: microphone body */}
      <rect
        x="9" y="2" width="6" height="11" rx="3"
        fill={`url(#${gradId})`}
      />
      {/* Primary: mic stand */}
      <path
        d="M12 17v4M8 21h8"
        stroke={`url(#${gradId})`}
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Primary: mic cup */}
      <path
        d="M6 11a6 6 0 0012 0"
        stroke={`url(#${gradId})`}
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

// ============================================================
// ICON: AI Interviewer — Two speech bubbles in conversation
// ============================================================
export function InterviewerIcon({ size = 28, gradient = 'navy', className = '' }) {
  const gradId = `icon-grad-${gradient}`;
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" className={className}>
      {/* Secondary: background bubble (interviewer) */}
      <path
        d="M4 4h10a2 2 0 012 2v5a2 2 0 01-2 2H8l-3 3v-3H4a2 2 0 01-2-2V6a2 2 0 012-2z"
        fill={`url(#${gradId})`}
        opacity="0.3"
      />
      {/* Primary: foreground bubble (you) */}
      <path
        d="M10 10h10a2 2 0 012 2v5a2 2 0 01-2 2h-1v3l-3-3h-6a2 2 0 01-2-2v-5a2 2 0 012-2z"
        fill={`url(#${gradId})`}
      />
      {/* Dot indicators in foreground bubble */}
      <circle cx="14" cy="14.5" r="0.8" fill="white" />
      <circle cx="17" cy="14.5" r="0.8" fill="white" />
      <circle cx="20" cy="14.5" r="0.8" fill="white" />
    </svg>
  );
}

// ============================================================
// ICON: Practice Mode — Bullseye with arrow/checkmark
// ============================================================
export function PracticeIcon({ size = 28, gradient = 'teal', className = '' }) {
  const gradId = `icon-grad-${gradient}`;
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" className={className}>
      {/* Secondary: outer ring */}
      <circle
        cx="12" cy="12" r="10"
        stroke={`url(#${gradId})`}
        strokeWidth="1.8"
        opacity="0.25"
      />
      {/* Secondary: middle ring */}
      <circle
        cx="12" cy="12" r="6.5"
        stroke={`url(#${gradId})`}
        strokeWidth="1.8"
        opacity="0.35"
      />
      {/* Primary: center filled circle (bullseye) */}
      <circle
        cx="12" cy="12" r="3"
        fill={`url(#${gradId})`}
      />
      {/* Primary: check mark in center */}
      <path
        d="M10.5 12l1 1 2-2"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ============================================================
// ICON: Flashcards — Stacked cards with flip indicator
// ============================================================
export function FlashcardIcon({ size = 28, gradient = 'amber', className = '' }) {
  const gradId = `icon-grad-${gradient}`;
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" className={className}>
      {/* Secondary: back card (rotated slightly) */}
      <rect
        x="5" y="3" width="14" height="10" rx="2"
        fill={`url(#${gradId})`}
        opacity="0.25"
        transform="rotate(-3 12 8)"
      />
      {/* Secondary: middle card */}
      <rect
        x="4" y="5" width="14" height="10" rx="2"
        fill={`url(#${gradId})`}
        opacity="0.4"
        transform="rotate(1 11 10)"
      />
      {/* Primary: front card */}
      <rect
        x="4" y="7" width="16" height="12" rx="2.5"
        fill={`url(#${gradId})`}
      />
      {/* Card content lines */}
      <line x1="7.5" y1="11" x2="16.5" y2="11" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.9" />
      <line x1="7.5" y1="14" x2="13" y2="14" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}

// ============================================================
// ICON: Learn — Graduation cap with sparkle
// ============================================================
export function LearnIcon({ size = 28, gradient = 'teal', className = '' }) {
  const gradId = `icon-grad-${gradient}`;
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" className={className}>
      {/* Secondary: book pages fanned out */}
      <path
        d="M4 19V8l8-4 8 4v11"
        stroke={`url(#${gradId})`}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.3"
      />
      {/* Primary: graduation cap top */}
      <path
        d="M2 10l10-5 10 5-10 5-10-5z"
        fill={`url(#${gradId})`}
      />
      {/* Primary: tassel hanging */}
      <path
        d="M20 10v6"
        stroke={`url(#${gradId})`}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="20" cy="17" r="1.2" fill={`url(#${gradId})`} />
      {/* Primary: cap sides */}
      <path
        d="M7 12.5v5c0 1.5 2.2 3 5 3s5-1.5 5-3v-5"
        stroke={`url(#${gradId})`}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

// ============================================================
// ICON: Headphones / Prep Radio — Over-ear with music note
// ============================================================
export function RadioIcon({ size = 28, gradient = 'navy', className = '' }) {
  const gradId = `icon-grad-${gradient}`;
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" className={className}>
      {/* Secondary: sound waves from left ear */}
      <path
        d="M3 14c-.5-.8-.8-1.8-.8-3 0-5.5 4.4-10 9.8-10s9.8 4.5 9.8 10c0 1.2-.3 2.2-.8 3"
        stroke={`url(#${gradId})`}
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.25"
      />
      {/* Primary: headband */}
      <path
        d="M4 15c0-4.4 3.6-8 8-8s8 3.6 8 8"
        stroke={`url(#${gradId})`}
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />
      {/* Primary: left ear cup */}
      <rect x="2" y="14" width="4" height="6" rx="2" fill={`url(#${gradId})`} />
      {/* Primary: right ear cup */}
      <rect x="18" y="14" width="4" height="6" rx="2" fill={`url(#${gradId})`} />
    </svg>
  );
}

// ============================================================
// ICON: AI Coach — Chat bubble with sparkle/brain
// ============================================================
export function CoachIcon({ size = 28, gradient = 'violet', className = '' }) {
  const gradId = `icon-grad-${gradient}`;
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" className={className}>
      {/* Secondary: glow/halo behind */}
      <circle
        cx="12" cy="10" r="9"
        fill={`url(#${gradId})`}
        opacity="0.12"
      />
      {/* Primary: speech bubble */}
      <path
        d="M4 6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2h-4l-4 4v-4H6a2 2 0 01-2-2V6z"
        fill={`url(#${gradId})`}
      />
      {/* Sparkle inside bubble */}
      <path
        d="M12 6.5v2M12 11.5v1M9.5 9h1M13.5 9h1"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.9"
      />
      <circle cx="12" cy="9.5" r="0.6" fill="white" opacity="0.9" />
    </svg>
  );
}

// ============================================================
// ICON: JD Decoder — Document with magnifying glass
// ============================================================
export function DecoderIcon({ size = 28, gradient = 'sky', className = '' }) {
  const gradId = `icon-grad-${gradient}`;
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" className={className}>
      {/* Secondary: document body */}
      <rect
        x="4" y="2" width="12" height="18" rx="2"
        fill={`url(#${gradId})`}
        opacity="0.3"
      />
      {/* Document lines */}
      <line x1="7" y1="6" x2="13" y2="6" stroke={`url(#${gradId})`} strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      <line x1="7" y1="9" x2="11" y2="9" stroke={`url(#${gradId})`} strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      <line x1="7" y1="12" x2="12" y2="12" stroke={`url(#${gradId})`} strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      {/* Primary: magnifying glass overlay */}
      <circle
        cx="16" cy="16" r="4"
        stroke={`url(#${gradId})`}
        strokeWidth="2.2"
      />
      <circle
        cx="16" cy="16" r="4"
        fill={`url(#${gradId})`}
        opacity="0.15"
      />
      <line
        x1="19" y1="19" x2="22" y2="22"
        stroke={`url(#${gradId})`}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ============================================================
// ICON: Story Bank — Open book with pen/sparkle
// ============================================================
export function StoryBankIcon({ size = 28, gradient = 'emerald', className = '' }) {
  const gradId = `icon-grad-${gradient}`;
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" className={className}>
      {/* Secondary: book spread */}
      <path
        d="M2 4h7a3 3 0 013 3v13a2 2 0 00-2-2H2V4z"
        fill={`url(#${gradId})`}
        opacity="0.25"
      />
      <path
        d="M22 4h-7a3 3 0 00-3 3v13a2 2 0 012-2h8V4z"
        fill={`url(#${gradId})`}
        opacity="0.35"
      />
      {/* Primary: book spine */}
      <path
        d="M12 7v13"
        stroke={`url(#${gradId})`}
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Primary: book covers */}
      <path
        d="M2 4h7a3 3 0 013 3v13a2 2 0 00-2-2H2V4zM22 4h-7a3 3 0 00-3 3v13a2 2 0 012-2h8V4z"
        stroke={`url(#${gradId})`}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Sparkle on right page */}
      <circle cx="17" cy="8" r="0.8" fill={`url(#${gradId})`} opacity="0.7" />
      <path d="M17 6.5v-1M17 9.5v1M15.5 8h-1M18.5 8h1" stroke={`url(#${gradId})`} strokeWidth="1" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}

// ============================================================
// ICON: STAR Drill — Target with star shape
// ============================================================
export function StarDrillIcon({ size = 28, gradient = 'amber', className = '' }) {
  const gradId = `icon-grad-${gradient}`;
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" className={className}>
      {/* Secondary: crosshair lines */}
      <line x1="12" y1="2" x2="12" y2="7" stroke={`url(#${gradId})`} strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
      <line x1="12" y1="17" x2="12" y2="22" stroke={`url(#${gradId})`} strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
      <line x1="2" y1="12" x2="7" y2="12" stroke={`url(#${gradId})`} strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
      <line x1="17" y1="12" x2="22" y2="12" stroke={`url(#${gradId})`} strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
      {/* Secondary: outer ring */}
      <circle cx="12" cy="12" r="9" stroke={`url(#${gradId})`} strokeWidth="1.5" opacity="0.25" />
      {/* Primary: inner star */}
      <path
        d="M12 7l1.5 3.1 3.4.5-2.5 2.4.6 3.4L12 14.8l-3 1.6.6-3.4-2.5-2.4 3.4-.5L12 7z"
        fill={`url(#${gradId})`}
      />
    </svg>
  );
}

// ============================================================
// ICON: Portfolio — Briefcase with document
// ============================================================
export function PortfolioIcon({ size = 28, gradient = 'navy', className = '' }) {
  const gradId = `icon-grad-${gradient}`;
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" className={className}>
      {/* Secondary: shadow/depth */}
      <rect x="3" y="9" width="18" height="12" rx="2.5" fill={`url(#${gradId})`} opacity="0.2" />
      {/* Primary: briefcase body */}
      <rect x="2" y="7" width="20" height="13" rx="2.5" stroke={`url(#${gradId})`} strokeWidth="2" />
      {/* Primary: handle */}
      <path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" stroke={`url(#${gradId})`} strokeWidth="2" strokeLinecap="round" />
      {/* Primary: clasp */}
      <path d="M12 12v3" stroke={`url(#${gradId})`} strokeWidth="2" strokeLinecap="round" />
      <path d="M2 12h20" stroke={`url(#${gradId})`} strokeWidth="1.5" opacity="0.4" />
    </svg>
  );
}

// ============================================================
// ICON: Interview Day — Calendar with star
// ============================================================
export function InterviewDayIcon({ size = 28, gradient = 'rose', className = '' }) {
  const gradId = `icon-grad-${gradient}`;
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" className={className}>
      {/* Secondary: calendar body fill */}
      <rect x="3" y="5" width="18" height="16" rx="2.5" fill={`url(#${gradId})`} opacity="0.2" />
      {/* Primary: calendar outline */}
      <rect x="3" y="5" width="18" height="16" rx="2.5" stroke={`url(#${gradId})`} strokeWidth="1.8" />
      {/* Calendar header bar */}
      <rect x="3" y="5" width="18" height="4" rx="2.5" fill={`url(#${gradId})`} opacity="0.6" />
      {/* Calendar hooks */}
      <line x1="8" y1="3" x2="8" y2="7" stroke={`url(#${gradId})`} strokeWidth="2" strokeLinecap="round" />
      <line x1="16" y1="3" x2="16" y2="7" stroke={`url(#${gradId})`} strokeWidth="2" strokeLinecap="round" />
      {/* Star in center */}
      <path
        d="M12 12l1 2.1 2.3.3-1.7 1.6.4 2.3L12 17.1l-2 1.1.4-2.3-1.7-1.6 2.3-.3L12 12z"
        fill={`url(#${gradId})`}
      />
    </svg>
  );
}

// ============================================================
// ICON: Follow-Up Email — Envelope with checkmark
// ============================================================
export function FollowUpIcon({ size = 28, gradient = 'amber', className = '' }) {
  const gradId = `icon-grad-${gradient}`;
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" className={className}>
      {/* Secondary: envelope body fill */}
      <rect x="2" y="5" width="20" height="14" rx="2.5" fill={`url(#${gradId})`} opacity="0.2" />
      {/* Primary: envelope */}
      <rect x="2" y="5" width="20" height="14" rx="2.5" stroke={`url(#${gradId})`} strokeWidth="1.8" />
      {/* Primary: envelope flap */}
      <path d="M2 5l10 7 10-7" stroke={`url(#${gradId})`} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      {/* Primary: check badge */}
      <circle cx="18" cy="16" r="4" fill={`url(#${gradId})`} />
      <path d="M16.5 16l1 1 2-2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ============================================================
// ICON: Stealth Notes — Document with eye/hidden
// ============================================================
export function NotesIcon({ size = 28, gradient = 'slate', className = '' }) {
  const gradId = `icon-grad-${gradient}`;
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" className={className}>
      {/* Secondary: page fill */}
      <path
        d="M6 2h8l6 6v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4a2 2 0 012-2z"
        fill={`url(#${gradId})`}
        opacity="0.2"
      />
      {/* Primary: page outline */}
      <path
        d="M6 2h8l6 6v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4a2 2 0 012-2z"
        stroke={`url(#${gradId})`}
        strokeWidth="1.8"
      />
      {/* Page fold */}
      <path d="M14 2v6h6" stroke={`url(#${gradId})`} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      {/* Text lines */}
      <line x1="8" y1="13" x2="16" y2="13" stroke={`url(#${gradId})`} strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      <line x1="8" y1="16" x2="13" y2="16" stroke={`url(#${gradId})`} strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}

// ============================================================
// ICON: Command Center — Dashboard/analytics
// ============================================================
export function CommandCenterIcon({ size = 28, gradient = 'teal', className = '' }) {
  const gradId = `icon-grad-${gradient}`;
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" className={className}>
      {/* Secondary: background grid */}
      <rect x="2" y="2" width="9" height="9" rx="2" fill={`url(#${gradId})`} opacity="0.2" />
      <rect x="13" y="2" width="9" height="5" rx="2" fill={`url(#${gradId})`} opacity="0.15" />
      <rect x="2" y="13" width="9" height="9" rx="2" fill={`url(#${gradId})`} opacity="0.15" />
      <rect x="13" y="9" width="9" height="13" rx="2" fill={`url(#${gradId})`} opacity="0.2" />
      {/* Primary: chart bars */}
      <rect x="4" y="6" width="2.5" height="3" rx="0.5" fill={`url(#${gradId})`} />
      <rect x="7.5" y="4" width="2.5" height="5" rx="0.5" fill={`url(#${gradId})`} />
      {/* Primary: grid lines */}
      <rect x="2" y="2" width="9" height="9" rx="2" stroke={`url(#${gradId})`} strokeWidth="1.5" />
      <rect x="13" y="2" width="9" height="5" rx="2" stroke={`url(#${gradId})`} strokeWidth="1.5" />
      <rect x="2" y="13" width="9" height="9" rx="2" stroke={`url(#${gradId})`} strokeWidth="1.5" />
      <rect x="13" y="9" width="9" height="13" rx="2" stroke={`url(#${gradId})`} strokeWidth="1.5" />
      {/* Trend line in bottom-right panel */}
      <path d="M15 17l2-3 2 1.5 3-3" stroke={`url(#${gradId})`} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ============================================================
// ICON: Flashcard (compact) — For tools grid
// ============================================================
export function FlashcardCompactIcon({ size = 20, gradient = 'amber', className = '' }) {
  const gradId = `icon-grad-${gradient}`;
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" className={className}>
      <rect x="3" y="5" width="15" height="11" rx="2" fill={`url(#${gradId})`} opacity="0.3" transform="rotate(-2 10 10)" />
      <rect x="4" y="7" width="16" height="12" rx="2.5" fill={`url(#${gradId})`} />
      <line x1="7.5" y1="11" x2="16.5" y2="11" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
      <line x1="7.5" y1="14" x2="13" y2="14" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}


// ============================================================
// STAT CARD ICONS — Simple white SVGs for solid color containers
// Unlike feature icons, these are single-color white with subtle depth
// ============================================================

// Questions stat — Stacked question marks / cards
export function QuestionsStatIcon({ size = 24, className = '' }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" className={className}>
      {/* Back card (secondary) */}
      <rect x="3" y="5" width="13" height="14" rx="1.5" fill="white" opacity="0.35" />
      {/* Front card (primary) */}
      <rect x="6" y="3" width="14" height="16" rx="1.8" fill="white" />
      {/* Question mark */}
      <path
        d="M13 8.5c0-.9.8-1.5 1.7-1.5s1.7.6 1.7 1.5c0 .6-.3 1-.8 1.3-.6.4-.9.7-.9 1.4v.3"
        stroke="#0d9488"
        strokeWidth="1.4"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="13.7" cy="14" r="0.8" fill="#0d9488" />
    </svg>
  );
}

// Sessions stat — Rising line chart
export function SessionsStatIcon({ size = 24, className = '' }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" className={className}>
      {/* Grid lines (secondary) */}
      <line x1="3" y1="20" x2="21" y2="20" stroke="white" strokeWidth="1.3" opacity="0.4" strokeLinecap="round" />
      <line x1="3" y1="20" x2="3" y2="4" stroke="white" strokeWidth="1.3" opacity="0.4" strokeLinecap="round" />
      {/* Area fill under line */}
      <path
        d="M3 17 L8 13 L13 15 L17 9 L21 6 L21 20 L3 20 Z"
        fill="white"
        opacity="0.25"
      />
      {/* Primary: trend line */}
      <path
        d="M3 17 L8 13 L13 15 L17 9 L21 6"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* End point dot */}
      <circle cx="21" cy="6" r="1.6" fill="white" />
    </svg>
  );
}

// Unlimited stat — Infinity / lightning bolt (for usage limit)
export function UnlimitedStatIcon({ size = 24, className = '' }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" className={className}>
      {/* Lightning bolt background glow */}
      <path
        d="M13 2 L5 13 L11 13 L10 22 L19 10 L13 10 L14 2 Z"
        fill="white"
        opacity="0.3"
        transform="translate(1 0)"
      />
      {/* Primary lightning bolt */}
      <path
        d="M13 2 L5 13 L11 13 L10 22 L19 10 L13 10 L14 2 Z"
        fill="white"
        stroke="white"
        strokeWidth="0.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Days Until stat — Calendar with circled date
export function DaysStatIcon({ size = 24, className = '' }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" className={className}>
      {/* Calendar body */}
      <rect x="3" y="5" width="18" height="16" rx="2.2" fill="white" opacity="0.9" />
      {/* Header bar */}
      <rect x="3" y="5" width="18" height="4.5" rx="2.2" fill="white" />
      {/* Calendar hooks */}
      <line x1="8" y1="3" x2="8" y2="7" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="16" y1="3" x2="16" y2="7" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
      {/* Circled date */}
      <circle cx="12" cy="15" r="3.2" fill="none" stroke="#475569" strokeWidth="1.5" />
      <circle cx="12" cy="15" r="1.2" fill="#475569" />
    </svg>
  );
}

// Day Streak stat — Flame
export function StreakStatIcon({ size = 24, className = '' }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" className={className}>
      {/* Outer flame (secondary) */}
      <path
        d="M12 2 C 9 6 6 8 6 13 C 6 17.4 8.7 21 12 21 C 15.3 21 18 17.4 18 13 C 18 10 16 8 14.5 6 C 13.5 4.5 13 3 13 2 C 13 2 12.5 3 12 2 Z"
        fill="#f59e0b"
        opacity="0.4"
      />
      {/* Inner flame (primary) */}
      <path
        d="M12 8 C 10.5 10.5 9 11.5 9 14.5 C 9 17 10.3 19 12 19 C 13.7 19 15 17 15 14.5 C 15 12.8 14 11.5 13 10 C 12.5 9 12 8.5 12 8 Z"
        fill="#f59e0b"
      />
    </svg>
  );
}


// ============================================================
// DECORATIVE ICON CONTAINER
// Wraps any icon in a soft tinted background shape
// ============================================================
export function IconContainer({ children, color = 'teal', size = 'md', className = '' }) {
  const sizes = {
    sm: 'w-9 h-9',
    md: 'w-12 h-12 sm:w-14 sm:h-14',
    lg: 'w-14 h-14 sm:w-16 sm:h-16 lg:w-18 lg:h-18',
  };

  const colors = {
    teal:    'bg-teal-50 group-hover:bg-teal-100',
    navy:    'bg-slate-100 group-hover:bg-slate-200',
    amber:   'bg-amber-50 group-hover:bg-amber-100',
    sky:     'bg-sky-50 group-hover:bg-sky-100',
    violet:  'bg-violet-50 group-hover:bg-violet-100',
    rose:    'bg-rose-50 group-hover:bg-rose-100',
    emerald: 'bg-emerald-50 group-hover:bg-emerald-100',
    slate:   'bg-slate-50 group-hover:bg-slate-100',
  };

  return (
    <div className={`${sizes[size]} ${colors[color]} rounded-2xl flex items-center justify-center transition-colors duration-200 ${className}`}>
      {children}
    </div>
  );
}
