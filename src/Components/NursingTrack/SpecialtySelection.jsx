// NursingTrack — Specialty Selection Screen
// This is the entry point for the nursing interview track.
// User selects their target specialty, then enters the nursing dashboard.

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft, Stethoscope, CheckCircle, LogOut } from 'lucide-react';
import { NURSING_SPECIALTIES } from './nursingQuestions';
import { supabase } from '../../lib/supabase';

export default function SpecialtySelection({ onSelectSpecialty, onBack }) {
  const [selected, setSelected] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);

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
          {/* Track Switcher — mirrors the toggle on the main app home screen */}
          <div className="flex items-center gap-1 bg-white/10 rounded-full p-0.5 border border-white/20">
            <a href="/app" className="px-3 py-1.5 rounded-full text-xs font-semibold text-white/70 hover:text-white hover:bg-white/10 transition-all no-underline">
              General
            </a>
            <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white text-slate-900 shadow-md">
              🩺 Nursing
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-sky-400" />
            <span className="text-white font-medium text-sm">Nursing Interview Track</span>
          </div>
          <button
            onClick={async () => { await supabase.auth.signOut(); window.location.href = '/'; }}
            onTouchEnd={async (e) => { e.preventDefault(); await supabase.auth.signOut(); window.location.href = '/'; }}
            className="flex items-center gap-1 text-slate-400 hover:text-red-400 text-xs transition-colors"
            title="Sign out"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 pb-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 bg-sky-600/20 border border-sky-400/30 rounded-full px-4 py-2 mb-4">
            <Stethoscope className="w-4 h-4 text-sky-300" />
            <span className="text-sm text-sky-200 font-medium">Nursing Interview Track</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            What specialty are you interviewing for?
          </h1>
          <p className="text-sky-300 text-lg max-w-2xl mx-auto">
            We'll tailor your practice questions, scenarios, and coaching to your target unit.
          </p>
        </motion.div>
      </div>

      {/* Specialty Grid */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-32">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                onMouseEnter={() => setHoveredId(specialty.id)}
                onMouseLeave={() => setHoveredId(null)}
                className={`
                  relative text-left p-5 rounded-xl border-2 transition-all duration-200
                  ${isSelected
                    ? 'border-sky-500 bg-sky-500/20 shadow-lg shadow-sky-500/20'
                    : 'border-white/10 bg-white/5 hover:border-white/25 hover:bg-white/10'
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

                {/* Name */}
                <h3 className="text-white font-semibold text-lg mb-1">
                  {specialty.name}
                </h3>

                {/* Description */}
                <p className="text-slate-400 text-sm leading-relaxed">
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
    </div>
  );
}
