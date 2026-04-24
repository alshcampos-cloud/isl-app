import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Play, Mic, Bot, Sparkles, CheckCircle, Brain, BookOpen, Layers, Flame } from 'lucide-react';

export default function HeroSection() {
  const sectionRef = useRef(null);
  const rafId = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [userHasMoved, setUserHasMoved] = useState(false);

  useEffect(() => {
    const hero = sectionRef.current;
    if (!hero) return;
    // Skip listener on touch-only devices — ambient sway will carry the vibe
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(hover: none)').matches) {
      return;
    }

    const handleMove = (e) => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
      rafId.current = requestAnimationFrame(() => {
        const rect = hero.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = (e.clientX - cx) / (rect.width / 2);  // -1..1
        const dy = (e.clientY - cy) / (rect.height / 2); // -1..1
        // Clamp to ±5deg — any more looks gimmicky
        const clamp = (v) => Math.max(-1, Math.min(1, v));
        setTilt({ x: clamp(dx) * 5, y: clamp(dy) * 5 });
        setUserHasMoved(true);
      });
    };

    hero.addEventListener('mousemove', handleMove, { passive: true });
    return () => {
      hero.removeEventListener('mousemove', handleMove);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, []);

  // Alternating checkerboard: tiles 0,2,4 pop forward; 1,3,5 sit back
  const tileZ = (i) => (i % 2 === 0 ? 15 : 5);

  return (
    <section
      ref={sectionRef}
      data-hero-section
      className="relative min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center overflow-hidden"
    >
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -right-40 w-96 h-96 bg-teal-500/15 rounded-full blur-3xl"
          animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl"
          animate={{ x: [0, -20, 0], y: [0, 30, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-1/3 left-1/2 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl"
          animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Copy */}
          <div>
            {/* Badge */}
            <motion.div
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span className="text-sm text-slate-300 font-medium">AI-Powered Interview Preparation</span>
            </motion.div>

            <motion.h1
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Rehearse the interview{' '}
              <span className="bg-gradient-to-r from-teal-400 to-emerald-300 bg-clip-text text-transparent">
                before it happens.
              </span>
              <span className="block text-2xl sm:text-3xl lg:text-4xl font-semibold text-slate-200 mt-4">
                AI interview practice, grounded in cognitive science.
              </span>
            </motion.h1>

            <motion.p
              className="mt-6 text-lg sm:text-xl text-slate-300 leading-relaxed max-w-xl"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Stop memorizing scripts. Build answers from your real experiences,
              and practice until they feel natural.{' '}
              <span className="text-white font-semibold">
                Practice out loud. See your answers scored. Walk in ready.
              </span>
            </motion.p>

            {/* Trust indicators */}
            <motion.div
              className="mt-6 flex flex-col sm:flex-row gap-3 text-sm text-slate-400"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-green-400" /> No credit card required</span>
              <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-green-400" /> Free tier available</span>
              <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-green-400" /> Cancel anytime</span>
            </motion.div>

            <motion.div
              className="mt-8 flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
            >
              <Link
                to="/onboarding"
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-bold text-lg px-8 py-4 rounded-xl transition-all shadow-xl shadow-teal-500/30 hover:shadow-teal-500/50 hover:-translate-y-0.5"
              >
                Start Practicing Free
                <ArrowRight className="w-5 h-5" />
              </Link>
              <button
                onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                className="inline-flex items-center justify-center gap-2 text-white font-medium text-lg px-8 py-4 rounded-xl border-2 border-white/25 hover:bg-white/10 transition-all"
              >
                <Play className="w-5 h-5" />
                See How It Works
              </button>
            </motion.div>

            {/* Ethics badge */}
            <motion.div
              className="mt-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Link
                to="/ethics"
                className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-teal-300 transition-colors"
              >
                <CheckCircle className="w-3.5 h-3.5 text-teal-400" />
                <span>Practice-first. Ethical by design.</span>
                <span className="underline underline-offset-2">Why</span>
              </Link>
            </motion.div>
          </div>

          {/* Right: Stylized app preview */}
          <motion.div
            className="hidden lg:block"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            {/* 3D tilt wrapper — follows cursor once moved, ambient sway otherwise.
                Kept separate from the framer-motion fade-in so we don't fight for `style.transform`. */}
            <div
              className={userHasMoved ? '' : 'hero-ambient-sway'}
              style={
                userHasMoved
                  ? {
                      transform: `perspective(1000px) rotateY(${tilt.x}deg) rotateX(${-tilt.y}deg)`,
                      transformOrigin: 'center center',
                      transformStyle: 'preserve-3d',
                      transition: 'transform 150ms ease-out',
                      willChange: 'transform',
                    }
                  : {
                      transformOrigin: 'center center',
                      willChange: 'transform',
                    }
              }
            >
            <div className="relative">
              {/* Glowing border effect */}
              <div className="absolute -inset-4 bg-gradient-to-r from-teal-500/20 via-emerald-500/20 to-sky-500/20 rounded-3xl blur-xl" />

              {/* App mockup card */}
              <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl" style={{ transformStyle: 'preserve-3d' }}>
                {/* Title bar */}
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                  <span className="ml-3 text-sm text-white/60">InterviewAnswers.ai</span>
                </div>

                {/* Feature preview cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { icon: Bot, label: 'AI Interviewer', color: 'from-teal-600 to-cyan-600', desc: 'Mock practice' },
                    { icon: Brain, label: 'AI Coach', color: 'from-teal-500 to-emerald-500', desc: 'Per-answer feedback' },
                    { icon: BookOpen, label: 'Curated Interviews', color: 'from-emerald-500 to-teal-500', desc: 'Role-specific' },
                    { icon: Layers, label: 'Flashcards', color: 'from-cyan-500 to-teal-500', desc: 'Spaced repetition' },
                    { icon: Flame, label: 'Streaks', color: 'from-teal-400 to-emerald-400', desc: 'Daily consistency' },
                    { icon: Mic, label: 'Practice Prompter', color: 'from-teal-500 to-emerald-500', desc: 'Rehearse out loud' },
                  ].map(({ icon: Icon, label, color, desc }, i) => (
                    <motion.div
                      key={label}
                      className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10"
                      whileHover={{ scale: 1.03 }}
                      transition={{ duration: 0.2 }}
                      style={{ transform: `translateZ(${tileZ(i)}px)` }}
                    >
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center mb-2`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <p className="text-white text-sm font-medium">{label}</p>
                      <p className="text-white/50 text-xs mt-0.5">{desc}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Question preview */}
                <div className="mt-4 bg-white/10 rounded-xl p-4 border border-white/10">
                  <p className="text-white/50 text-xs uppercase tracking-wide mb-1.5">Current Question</p>
                  <p className="text-white text-sm leading-relaxed">"Tell me about a time you had to deal with a difficult team member..."</p>
                  <div className="mt-3 flex gap-2">
                    <div className="h-1.5 bg-green-400/60 rounded-full flex-1" />
                    <div className="h-1.5 bg-green-400/60 rounded-full flex-1" />
                    <div className="h-1.5 bg-green-400/60 rounded-full flex-1" />
                    <div className="h-1.5 bg-white/10 rounded-full flex-1" />
                    <div className="h-1.5 bg-white/10 rounded-full flex-1" />
                  </div>
                  <p className="text-white/40 text-xs mt-1.5">3 of 5 key points covered</p>
                </div>

                {/* Score preview — example data, not a claim */}
                <div className="mt-3 bg-white/10 rounded-xl p-4 border border-white/10">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-white/70 text-sm">Answer Completeness <span className="text-white/30 text-[10px] uppercase tracking-wide ml-1">example</span></span>
                    <span className="text-green-400 font-bold">73%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2.5">
                    <motion.div
                      className="h-2.5 rounded-full bg-gradient-to-r from-green-400 to-emerald-400"
                      initial={{ width: '0%' }}
                      animate={{ width: '73%' }}
                      transition={{ duration: 1.5, delay: 1, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              </div>
            </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-1.5">
          <motion.div
            className="w-1.5 h-1.5 rounded-full bg-white/60"
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
      </motion.div>
    </section>
  );
}
