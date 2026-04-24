import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState, useCallback } from 'react';
import { Bot, Brain, Mic, Layers, Flame, BookOpen } from 'lucide-react';

// Sprint 9 / Coder 3 — Tier 2 orbital 3D feature carousel.
// Replaces FeaturesSection. Auditor-corrected signed modulo (C1), iOS gotchas (C2),
// Tier 2 scope of icon + title + description (C3,C4).

const AUTO_MS = 5000;

const FEATURES = [
  {
    id: 'ai-interviewer',
    icon: Bot,
    title: 'AI Mock Interviewer',
    description: 'Adaptive follow-up questions. Like a real interviewer, with unlimited patience.',
  },
  {
    id: 'practice-mode',
    icon: Brain,
    title: 'Practice Mode',
    description: 'Quick-fire question drills. See your score go up as your answers get tighter.',
  },
  {
    id: 'ai-coach',
    icon: Mic,
    title: 'Practice Prompter',
    description: 'Rehearse out loud with bullet points on screen. Train the rep, not the script.',
  },
  {
    id: 'flashcards',
    icon: Layers,
    title: 'Flashcards',
    description: 'Spaced-repetition review of your hardest questions. Built from your own bank.',
  },
  {
    id: 'streaks',
    icon: Flame,
    title: 'Streaks & IRS',
    description: 'Interview Readiness Score tracks your prep over time. Daily streaks keep you honest.',
  },
  {
    id: 'library',
    icon: BookOpen,
    title: 'Curated Interviews',
    description: 'Hand-built question sets for real roles — PM, SWE, nursing, and more.',
  },
];

function defaultRenderCard(item, isActive) {
  const Icon = item.icon;
  return (
    <div className="p-8 h-full flex flex-col">
      <div className="w-16 h-16 rounded-2xl bg-teal-100 flex items-center justify-center mb-6">
        <Icon className="w-8 h-8 text-teal-600" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
      <p className="text-gray-600 leading-relaxed flex-1">{item.description}</p>
      {isActive && (
        <p className="mt-4 text-sm text-teal-600 font-medium">
          Try it free →
        </p>
      )}
    </div>
  );
}

export default function FeatureCarousel({ items = FEATURES, renderCard = defaultRenderCard }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef(null);
  const reduced = useReducedMotion();
  const n = items.length;

  const go = useCallback((dir) => setActive((i) => (i + dir + n) % n), [n]);
  const snapTo = (i) => setActive(((i % n) + n) % n);

  useEffect(() => {
    if (paused || reduced) return;
    const id = setInterval(() => go(1), AUTO_MS);
    return () => clearInterval(id);
  }, [paused, reduced, go]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowLeft') go(-1);
      if (e.key === 'ArrowRight') go(1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go]);

  const onTouchStart = (e) => { touchX.current = e.touches[0].clientX; };
  const onTouchEnd = (e) => {
    if (touchX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
    touchX.current = null;
  };

  return (
    <section className="py-16 sm:py-20 bg-gray-50 relative paper-grain">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section headline */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Built for the rep you&apos;ll actually run.
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Six tools. One philosophy: practice like it&apos;s the real thing.
          </p>
        </div>

        <div
          className="relative mx-auto h-[420px] w-full max-w-5xl select-none"
          style={{ perspective: 1400, touchAction: 'pan-y' }}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <div className="absolute inset-0 flex items-center justify-center [transform-style:preserve-3d]">
            {items.map((item, i) => {
              // Auditor-corrected signed modulo (avoid ±n/2 collision)
              const raw = ((i - active) % n + n) % n;
              let off = raw > n / 2 ? raw - n : raw;
              // Clamp: prefer positive offset when abs = n/2 (avoid double-render on opposite arc point)
              if (n % 2 === 0 && Math.abs(off) === n / 2) off = n / 2;
              const visible = Math.abs(off) <= 1;

              return (
                <motion.div
                  key={item.id}
                  onClick={() => snapTo(i)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      snapTo(i);
                    }
                  }}
                  role="button"
                  tabIndex={visible ? 0 : -1}
                  aria-label={`Feature ${i + 1}: ${item.title}`}
                  className="absolute h-[380px] w-[300px] rounded-2xl shadow-xl cursor-pointer bg-white [backface-visibility:hidden]"
                  animate={reduced ? {} : {
                    x: off * 180,
                    rotateY: off * -25,
                    scale: off === 0 ? 1 : 0.82,
                    z: off === 0 ? 0 : -120,
                    opacity: visible ? (off === 0 ? 1 : 0.55) : 0,
                  }}
                  transition={{ type: 'spring', stiffness: 260, damping: 30, mass: 0.9 }}
                  style={{
                    zIndex: n - Math.abs(off),
                    pointerEvents: visible ? 'auto' : 'none',
                    willChange: 'transform',
                  }}
                >
                  {renderCard(item, off === 0)}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Dot pagination */}
        <div className="mt-8 flex justify-center gap-2">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => snapTo(i)}
              aria-label={`Go to feature ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                i === active ? 'w-6 bg-teal-500' : 'w-1.5 bg-neutral-300'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
