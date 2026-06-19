// NursingTrack — Specialty Selection Screen
// This is the entry point for the nursing interview track.
// User selects their target specialty, then enters the nursing dashboard.

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Stethoscope, CheckCircle, LogOut, X, Sparkles } from 'lucide-react';
import { NURSING_SPECIALTIES, NURSING_QUESTIONS } from './nursingQuestions';
import { supabase } from '../../lib/supabase';
import { signOutAndRedirect } from '../../utils/localSessionGuard';
import { showGeneralFeatures } from '../../utils/appTarget';
import { isTap, tapHandlers } from '../../utils/tapGuard';

// 2026-06-11 (Layer 1 Item B): localStorage key for the "See sample question first"
// onboarding nudge. First-run users see the pill above the specialty grid; once
// they dismiss the preview modal (via X, backdrop tap, or "Pick my specialty"
// CTA), the key is set and the pill never renders again for them on this
// device. Returning users (who reach SpecialtySelection via "Change Specialty"
// from the dashboard) bypass the pill entirely on subsequent visits.
const SAMPLE_PREVIEW_SEEN_KEY = 'nursing_sample_preview_seen';

export default function SpecialtySelection({ onSelectSpecialty, onBack }) {
  const [selected, setSelected] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);

  // 2026-06-11 (Layer 1 Item B): preview modal state. Lazy initializer reads
  // localStorage ONCE at mount — no re-read on every render. `pillVisible`
  // gates the "See sample question first" CTA above the grid.
  const [showSamplePreview, setShowSamplePreview] = useState(false);
  const [pillVisible, setPillVisible] = useState(() => {
    try {
      return typeof window !== 'undefined' && !window.localStorage.getItem(SAMPLE_PREVIEW_SEEN_KEY);
    } catch (_) {
      // Private mode / disabled storage — show the pill, dismissals just won't persist
      return true;
    }
  });

  const markPreviewSeen = () => {
    try {
      window.localStorage.setItem(SAMPLE_PREVIEW_SEEN_KEY, '1');
    } catch (_) {
      // Quota / private mode — fail-soft, pill still hides this session via setPillVisible(false)
    }
  };

  const handleClosePreview = () => {
    setShowSamplePreview(false);
    setPillVisible(false);
    markPreviewSeen();
  };

  // The sample question we show in the preview — first general nursing question
  // from the validated content library (Q1, "Tell me about yourself..."). Pulls
  // from the hard-coded NURSING_QUESTIONS constant — NO Supabase call, NO Edge
  // Function. Cannot recreate the deadlock pattern PR #43 fixed.
  const sampleQuestion = NURSING_QUESTIONS[0];

  const handleContinue = () => {
    if (selected) {
      onSelectSpecialty(selected);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900">
      {/* Header */}
      <div className="bg-slate-900/80 backdrop-blur-lg border-b border-white/10 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          {/* Track label — toggle hidden on web */}
          <div className="flex items-center gap-1">
            <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white/10 text-white border border-white/20">
              🩺 NurseAnswerPro
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-sky-400" />
            <span className="text-white font-medium text-sm">Nursing Interview Track</span>
          </div>
          <button
            onClick={() => signOutAndRedirect(supabase, '/login?from=nursing')}
            onTouchEnd={(e) => { e.preventDefault(); signOutAndRedirect(supabase, '/login?from=nursing'); }}
            className="flex items-center gap-1 text-slate-400 hover:text-red-400 text-xs transition-colors"
            title="Sign out"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-4 pb-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-5 sm:mb-6"
        >
          <div className="inline-flex items-center gap-2 bg-sky-600/20 border border-sky-400/30 rounded-full px-4 py-2 mb-4">
            <Stethoscope className="w-4 h-4 text-sky-300" />
            <span className="text-sm text-sky-200 font-medium">Nursing Interview Track</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            Pick your specialty to start interview practice — you can change anytime
          </h1>
          <p className="text-sky-300 text-lg max-w-2xl mx-auto">
            We'll tailor your practice questions, scenarios, and coaching to your target unit.
          </p>
        </motion.div>
      </div>

      {/* Specialty Grid */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-32">
        {/* 2026-06-11 (Layer 1 Item B): "See sample question first" pill.
            Gives fresh users a real win in <30s — preview of an actual question
            with STAR bullets — BEFORE asking them to commit to a specialty.
            Hidden once dismissed (localStorage gate); returning users via
            "Change Specialty" never see it twice. */}
        {pillVisible && (
          <div className="flex justify-center mb-6">
            <button
              type="button"
              onClick={() => setShowSamplePreview(true)}
              {...tapHandlers(() => setShowSamplePreview(true))}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-600/20 hover:bg-sky-600/30 border border-sky-400/30 text-sky-200 hover:text-white text-sm font-medium transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              See a sample question first
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {NURSING_SPECIALTIES.map((specialty, index) => {
            const isSelected = selected?.id === specialty.id;
            const isHovered = hoveredId === specialty.id;

            return (
              <motion.button
                key={specialty.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                onClick={() => setSelected(specialty)}
                {...tapHandlers(() => setSelected(specialty))}
                onMouseEnter={() => setHoveredId(specialty.id)}
                onMouseLeave={() => setHoveredId(null)}
                className={`
                  relative text-left p-5 rounded-xl border-2 transition-all duration-200
                  ${isSelected
                    ? 'border-sky-500 bg-sky-500/20 shadow-lg shadow-sky-500/20'
                    : 'border-white/30 bg-white/10 hover:border-white/40 hover:bg-white/15'
                  }
                `}
              >
                {/* Selected checkmark */}
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-3 right-3"
                  >
                    <CheckCircle className="w-5 h-5 text-sky-400" />
                  </motion.div>
                )}

                {/* Icon */}
                <div className={`text-3xl mb-3`}>
                  {specialty.icon}
                </div>

                {/* Name — use shortName on mobile to prevent multi-line wrap at 375px */}
                <h3 className="text-white font-semibold text-lg mb-1">
                  <span className="sm:hidden">{specialty.shortName || specialty.name}</span>
                  <span className="hidden sm:inline">{specialty.name}</span>
                </h3>

                {/* Description */}
                <p className="text-slate-300 text-sm leading-relaxed">
                  {specialty.description}
                </p>

                {/* Gradient bar at bottom */}
                <div className={`mt-4 h-1 rounded-full bg-gradient-to-r ${specialty.color} ${isSelected || isHovered ? 'opacity-100' : 'opacity-30'} transition-opacity`} />
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Fixed bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-lg border-t border-white/10 p-4 z-40">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="text-sm text-slate-400">
            {selected ? (
              <span>
                Selected: <span className="text-white font-medium">{selected.icon} {selected.name}</span>
              </span>
            ) : (
              'Choose your target specialty'
            )}
          </div>
          <button
            onClick={handleContinue}
            disabled={!selected}
            className={`
              flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all
              ${selected
                ? 'bg-gradient-to-r from-sky-600 to-cyan-500 text-white shadow-lg shadow-sky-500/30 hover:-translate-y-0.5'
                : 'bg-white/10 text-white/30 cursor-not-allowed'
              }
            `}
          >
            Continue
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2026-06-11 (Layer 1 Item B): Sample question preview modal.
          Preview-only — does NOT call onSelectSpecialty, does NOT mutate parent
          state. Three independent dismiss paths (backdrop tap, X button,
          "Pick my specialty" CTA), each persists the localStorage flag so
          returning users never see the pill again. Reads from the hard-coded
          NURSING_QUESTIONS constant — no Supabase call, no Edge Function,
          cannot recreate any deadlock pattern. */}
      <AnimatePresence>
        {showSamplePreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleClosePreview}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.96 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-xl w-full bg-slate-900 border border-sky-500/30 rounded-2xl shadow-2xl p-6 sm:p-8"
            >
              {/* Close button */}
              <button
                type="button"
                onClick={handleClosePreview}
                onTouchEnd={(e) => { if (isTap(e)) { e.preventDefault(); handleClosePreview(); } }}
                className="absolute top-3 right-3 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Close preview"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Header */}
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-sky-400" />
                <span className="text-xs uppercase tracking-wider text-sky-300 font-semibold">Sample question</span>
              </div>

              {/* Question */}
              <h2 className="text-white font-bold text-xl sm:text-2xl mb-1 leading-tight">
                {sampleQuestion.question}
              </h2>
              <p className="text-slate-400 text-xs mb-5">
                {sampleQuestion.category} · {sampleQuestion.responseFramework === 'star' ? 'STAR framework' : sampleQuestion.responseFramework}
              </p>

              {/* STAR bullets */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
                <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-3">
                  What a strong answer covers
                </p>
                <ul className="space-y-2">
                  {sampleQuestion.bullets.map((bullet, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-slate-200 text-sm leading-relaxed">
                      <CheckCircle className="w-4 h-4 text-sky-400 flex-shrink-0 mt-0.5" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Dismiss CTA */}
              <button
                type="button"
                onClick={handleClosePreview}
                onTouchEnd={(e) => { if (isTap(e)) { e.preventDefault(); handleClosePreview(); } }}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-sky-600 to-cyan-500 text-white shadow-lg shadow-sky-500/30 hover:-translate-y-0.5 transition-all"
              >
                Pick my specialty
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
