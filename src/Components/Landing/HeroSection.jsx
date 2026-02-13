import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Play, Mic, Bot, Target, Sparkles, CheckCircle } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
          animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl"
          animate={{ x: [0, -20, 0], y: [0, 30, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-1/3 left-1/2 w-64 h-64 bg-indigo-500/15 rounded-full blur-3xl"
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
              <span className="text-sm text-indigo-200 font-medium">AI-Powered Interview Preparation</span>
            </motion.div>

            <motion.h1
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Nail Every Interview.{' '}
              <span className="bg-gradient-to-r from-pink-400 to-orange-300 bg-clip-text text-transparent">
                Powered by AI.
              </span>
            </motion.h1>

            <motion.p
              className="mt-6 text-lg sm:text-xl text-indigo-200 leading-relaxed max-w-xl"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Build authentic answers from YOUR real experiences — not generic scripts.
              Practice with AI that adapts to you and get real-time help during actual interviews.
            </motion.p>

            {/* Trust indicators */}
            <motion.div
              className="mt-6 flex flex-col sm:flex-row gap-3 text-sm text-indigo-300"
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
                to="/signup"
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-bold text-lg px-8 py-4 rounded-xl transition-all shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5"
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
          </div>

          {/* Right: Stylized app preview */}
          <motion.div
            className="hidden lg:block"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="relative">
              {/* Glowing border effect */}
              <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl blur-xl" />

              {/* App mockup card */}
              <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl">
                {/* Title bar */}
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                  <span className="ml-3 text-sm text-white/60">InterviewAnswers.ai</span>
                </div>

                {/* Feature preview cards */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: Mic, label: 'Live Prompter', color: 'from-pink-500 to-rose-500', desc: 'Real-time help' },
                    { icon: Bot, label: 'AI Interviewer', color: 'from-purple-500 to-indigo-500', desc: 'Mock practice' },
                    { icon: Target, label: 'Practice Mode', color: 'from-blue-500 to-cyan-500', desc: 'Quick drills' },
                    { icon: Sparkles, label: 'Answer Assistant', color: 'from-green-500 to-emerald-500', desc: 'Build answers' },
                  ].map(({ icon: Icon, label, color, desc }) => (
                    <motion.div
                      key={label}
                      className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10"
                      whileHover={{ scale: 1.03 }}
                      transition={{ duration: 0.2 }}
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

                {/* Score preview */}
                <div className="mt-3 bg-white/10 rounded-xl p-4 border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white/70 text-sm">Answer Completeness</span>
                    <span className="text-green-400 font-bold">92%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2.5">
                    <motion.div
                      className="h-2.5 rounded-full bg-gradient-to-r from-green-400 to-emerald-400"
                      initial={{ width: '0%' }}
                      animate={{ width: '92%' }}
                      transition={{ duration: 1.5, delay: 1, ease: 'easeOut' }}
                    />
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
