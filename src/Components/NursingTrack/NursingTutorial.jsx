// NursingTutorial.jsx — First-time tutorial for nursing track users
// Comprehensive 7-step walkthrough: features, tools, progress tracking, pricing.
// Conversion-focused: shows users the FULL value before they start.
//
// D.R.A.F.T. Protocol: NEW file. No existing code modified.

import { useState, useEffect, useRef } from 'react';
import {
  X, ChevronRight, ChevronLeft, CheckCircle,
  Stethoscope, Bot, Target, MessageSquare,
  Layers, Sparkles, Shield, DollarSign,
  Heart, BookOpen, Crown, Zap, ArrowRight,
  BarChart3, FileText, Brain, Clock,
  Star, TrendingUp, Lightbulb, Users,
  Lock, Unlock,
} from 'lucide-react';

const STORAGE_KEY = 'nursing_tutorial_seen';

export default function NursingTutorial({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const contentRef = useRef(null);

  // Check if already seen
  useEffect(() => {
    const seen = localStorage.getItem(STORAGE_KEY);
    if (seen) {
      if (onComplete) onComplete();
    }
  }, []);

  // Scroll content to top when step changes
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [currentStep]);

  const handleComplete = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    if (onComplete) onComplete();
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  // Prevent flash if already seen
  const alreadySeen = localStorage.getItem(STORAGE_KEY);
  if (alreadySeen) return null;

  const steps = [
    // ── Step 1: Welcome ──────────────────────────────────────────
    {
      title: 'Built for Nurses, by Healthcare Professionals',
      icon: <Stethoscope className="w-10 h-10 text-sky-400" />,
      content: (
        <div className="space-y-4">
          <p className="text-slate-300 leading-relaxed text-sm">
            You have the clinical skills. We help you <strong className="text-white">communicate them effectively in interviews</strong>.
          </p>

          <div className="bg-sky-500/10 border border-sky-500/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="w-4 h-4 text-sky-400" />
              <p className="text-sky-300 font-semibold text-sm">What makes this different</p>
            </div>
            <ul className="space-y-2 text-sm text-slate-300">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />
                <span><strong className="text-white">70 clinically-sourced questions</strong> — written and reviewed by practicing nurses</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />
                <span><strong className="text-white">Specialty-specific</strong> — ED, ICU, OR, L&D, Peds, Psych, and more</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />
                <span><strong className="text-white">AI coaches delivery, not clinical knowledge</strong> — structure, clarity, and confidence</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />
                <span><strong className="text-white">Practice anytime</strong> — at 11pm after your shift, before tomorrow's interview</span>
              </li>
            </ul>
          </div>

          <p className="text-slate-500 text-xs text-center italic">
            All clinical content grounded in NCSBN, SBAR, and Nursing Process frameworks.
          </p>
        </div>
      ),
    },

    // ── Step 2: Three Practice Modes ─────────────────────────────
    {
      title: '3 Ways to Practice',
      icon: <Target className="w-10 h-10 text-sky-400" />,
      content: (
        <div className="space-y-3">
          <p className="text-slate-400 text-xs mb-1">Each mode is designed for a different stage of your prep:</p>

          {/* Mock Interview */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 relative">
            <div className="absolute -top-2 right-3 bg-amber-500 text-black text-[9px] font-bold px-2 py-0.5 rounded-full">
              MOST POPULAR
            </div>
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-sky-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="text-white font-semibold text-sm">Mock Interview</h4>
                <p className="text-slate-400 text-xs mt-0.5">Full AI-coached simulation — follow-up questions, real-time scoring, and detailed feedback on your delivery</p>
              </div>
            </div>
          </div>

          {/* Quick Practice */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="text-white font-semibold text-sm">Quick Practice</h4>
                <p className="text-slate-400 text-xs mt-0.5">One question at a time — instant AI feedback with STAR/SBAR breakdown. Save your best answers for later.</p>
              </div>
            </div>
          </div>

          {/* SBAR */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="text-white font-semibold text-sm">SBAR Drills</h4>
                <p className="text-slate-400 text-xs mt-0.5">Practice clinical communication — scored separately on Situation, Background, Assessment, and Recommendation.</p>
              </div>
            </div>
          </div>

          <div className="bg-teal-500/10 border border-teal-500/20 rounded-lg p-2.5 mt-2">
            <p className="text-teal-300 text-[11px] text-center font-medium">
              💡 Speak or type your answers — the AI adapts to both.
            </p>
          </div>
        </div>
      ),
    },

    // ── Step 3: Command Center & Progress ────────────────────────
    {
      title: 'Track Your Progress',
      icon: <BarChart3 className="w-10 h-10 text-sky-400" />,
      content: (
        <div className="space-y-3">
          <p className="text-slate-300 leading-relaxed text-sm">
            Your <strong className="text-white">Command Center</strong> is where you see how you&apos;re improving over time.
          </p>

          {/* Progress Tab */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-sky-500/20 border border-sky-500/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-4 h-4 text-sky-400" />
              </div>
              <div>
                <h4 className="text-white font-semibold text-sm">Progress Charts</h4>
                <p className="text-slate-400 text-xs mt-0.5">Visual score history across all practice sessions — see your improvement over time</p>
              </div>
            </div>
          </div>

          {/* Question Bank */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-teal-500/20 border border-teal-500/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="w-4 h-4 text-teal-400" />
              </div>
              <div>
                <h4 className="text-white font-semibold text-sm">Question Bank</h4>
                <p className="text-slate-400 text-xs mt-0.5">Browse all 70 questions by category — save answers, refine them, and jump into practice on any question</p>
              </div>
            </div>
          </div>

          {/* IRS */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-emerald-500/20 border border-emerald-500/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <Star className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <h4 className="text-white font-semibold text-sm">Interview Readiness Score</h4>
                <p className="text-slate-400 text-xs mt-0.5">A weighted score that shows how ready you are — based on practice variety, consistency, and performance</p>
              </div>
            </div>
          </div>

          <div className="bg-sky-500/10 border border-sky-500/20 rounded-lg p-2.5">
            <p className="text-sky-300 text-[11px] text-center font-medium">
              📊 Your dashboard also shows daily streaks, session stats, and remaining credits at a glance.
            </p>
          </div>
        </div>
      ),
    },

    // ── Step 4: AI Coach & Advanced Tools ────────────────────────
    {
      title: 'AI Coach & Advanced Tools',
      icon: <Sparkles className="w-10 h-10 text-sky-400" />,
      content: (
        <div className="space-y-3">
          <p className="text-slate-400 text-xs mb-1">Beyond practice modes, you have a full toolkit for interview prep:</p>

          {/* AI Coach */}
          <div className="bg-gradient-to-br from-sky-500/10 to-teal-500/10 border border-sky-500/20 rounded-xl p-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-sky-500 to-teal-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="text-white font-semibold text-sm">AI Interview Coach</h4>
                <p className="text-slate-400 text-xs mt-0.5">Have a real conversation about interview prep — ask how to answer tough questions, refine your stories, or prep for a specific role. Not a quiz — a coaching session.</p>
              </div>
            </div>
          </div>

          {/* Confidence Builder */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="text-white font-semibold text-sm">Confidence Builder</h4>
                <p className="text-slate-400 text-xs mt-0.5">4-part journey: build your professional profile, collect evidence of your strengths, get an AI prep brief, and do a pre-interview reset.</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full font-medium">3 of 4 parts FREE</span>
                </div>
              </div>
            </div>
          </div>

          {/* Offer Negotiation */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="text-white font-semibold text-sm">Offer Negotiation Coach</h4>
                <p className="text-slate-400 text-xs mt-0.5">Practice 12 real negotiation scenarios — scored on 5 dimensions including confidence, specificity, and professionalism.</p>
              </div>
            </div>
          </div>

          {/* Resources & Flashcards - compact row */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white/5 border border-white/10 rounded-xl p-2.5">
              <div className="flex items-center gap-2 mb-1">
                <BookOpen className="w-4 h-4 text-sky-400" />
                <h4 className="text-white font-semibold text-xs">Resources</h4>
              </div>
              <p className="text-slate-400 text-[10px]">Curated clinical reference links — SBAR guides, NCSBN frameworks, and more.</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-2.5">
              <div className="flex items-center gap-2 mb-1">
                <Layers className="w-4 h-4 text-teal-400" />
                <h4 className="text-white font-semibold text-xs">Flashcards</h4>
              </div>
              <p className="text-slate-400 text-[10px]">Review key questions anytime. Swipe through by specialty. Always free.</p>
            </div>
          </div>
        </div>
      ),
    },

    // ── Step 5: How AI Coaching Works ────────────────────────────
    {
      title: 'AI That Coaches, Not Quizzes',
      icon: <Lightbulb className="w-10 h-10 text-sky-400" />,
      content: (
        <div className="space-y-4">
          <p className="text-slate-300 leading-relaxed text-sm">
            You bring your <strong className="text-white">real clinical experiences</strong>. Our AI helps you tell them effectively.
          </p>

          {/* What AI evaluates */}
          <div className="bg-teal-500/10 border border-teal-500/20 rounded-xl p-3">
            <p className="text-teal-300 font-semibold text-xs mb-2">The AI evaluates how you communicate:</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'STAR/SBAR structure', desc: 'Is your answer organized?' },
                { label: 'Specificity', desc: 'Real details vs. vague claims' },
                { label: 'Confidence', desc: 'Tone and delivery strength' },
                { label: 'Clarity', desc: 'Concise and to the point' },
              ].map(item => (
                <div key={item.label} className="flex items-start gap-1.5">
                  <CheckCircle className="w-3 h-3 text-teal-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-white text-[11px] font-medium block leading-tight">{item.label}</span>
                    <span className="text-slate-500 text-[10px] leading-tight">{item.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Content trust */}
          <div className="bg-sky-500/10 border border-sky-500/20 rounded-xl p-3">
            <p className="text-sky-300 font-semibold text-xs mb-2">Content you can trust:</p>
            <ul className="space-y-1.5 text-[11px] text-slate-300">
              <li className="flex items-start gap-1.5">
                <BookOpen className="w-3 h-3 text-sky-400 flex-shrink-0 mt-0.5" />
                All 70 questions written or reviewed by nurse educators
              </li>
              <li className="flex items-start gap-1.5">
                <Shield className="w-3 h-3 text-sky-400 flex-shrink-0 mt-0.5" />
                No AI-generated clinical scenarios — ever
              </li>
              <li className="flex items-start gap-1.5">
                <Stethoscope className="w-3 h-3 text-sky-400 flex-shrink-0 mt-0.5" />
                Grounded in NCSBN, SBAR, and Nursing Process frameworks
              </li>
            </ul>
          </div>

          <p className="text-slate-500 text-[11px] text-center italic">
            &quot;You bring the experience. We help you tell it.&quot;
          </p>
        </div>
      ),
    },

    // ── Step 6: Free vs. Nursing Pass ────────────────────────────
    {
      title: "Free vs. Nursing Pass",
      icon: <Crown className="w-10 h-10 text-sky-400" />,
      content: (
        <div className="space-y-3">
          {/* Free tier */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-3">
            <div className="flex items-center justify-between mb-2.5">
              <h4 className="text-white font-semibold text-sm">Free</h4>
              <span className="text-emerald-400 text-xs font-semibold">$0 / forever</span>
            </div>
            <ul className="space-y-1.5">
              {[
                { text: '3 Quick Practice sessions / month', icon: Target, free: true },
                { text: '2 Mock Interview sessions / month', icon: Bot, free: true },
                { text: '2 SBAR Drills / month', icon: MessageSquare, free: true },
                { text: 'Unlimited Flashcards', icon: Layers, free: true },
                { text: 'Command Center (progress + question bank)', icon: BarChart3, free: true },
                { text: 'Confidence Builder (3 of 4 parts)', icon: Shield, free: true },
                { text: 'Resources page', icon: BookOpen, free: true },
              ].map(({ text, icon: Icon }) => (
                <li key={text} className="flex items-center gap-2 text-slate-300 text-[11px]">
                  <Unlock className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                  {text}
                </li>
              ))}
            </ul>
          </div>

          {/* Nursing Pass */}
          <div className="bg-gradient-to-br from-sky-500/10 to-teal-500/10 border border-sky-500/20 rounded-xl p-3 relative">
            <div className="absolute -top-2 right-3 bg-sky-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
              BEST VALUE
            </div>
            <div className="flex items-center justify-between mb-2.5">
              <h4 className="text-white font-semibold text-sm">Nursing Pass</h4>
              <span className="text-sky-300 font-bold text-sm">$19.99 <span className="text-slate-500 text-[10px] font-normal">/ 30 days</span></span>
            </div>
            <p className="text-slate-400 text-[10px] mb-2">Everything in Free, plus:</p>
            <ul className="space-y-1.5">
              {[
                { text: 'Unlimited Mock Interviews' },
                { text: 'Unlimited Quick Practice' },
                { text: 'Unlimited SBAR Drills' },
                { text: 'Unlimited AI Interview Coach' },
                { text: 'Confidence Builder — full 4 parts (AI Brief)' },
                { text: 'Offer Negotiation Coach — 12 scenarios' },
              ].map(({ text }) => (
                <li key={text} className="flex items-center gap-2 text-slate-300 text-[11px]">
                  <Crown className="w-3 h-3 text-sky-400 flex-shrink-0" />
                  {text}
                </li>
              ))}
            </ul>
          </div>

          <p className="text-center text-slate-500 text-[10px]">
            Start free — upgrade anytime from your dashboard or settings.
          </p>
        </div>
      ),
    },

    // ── Step 7: Get Started ──────────────────────────────────────
    {
      title: "Let's Get You Interview-Ready",
      icon: <Zap className="w-10 h-10 text-sky-400" />,
      content: (
        <div className="space-y-4">
          <p className="text-slate-300 text-sm leading-relaxed">
            Three steps to your first practice session:
          </p>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-sky-500/20 border border-sky-500/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-sky-400 font-bold text-sm">1</span>
              </div>
              <div>
                <h4 className="text-white font-semibold text-sm">Choose your specialty</h4>
                <p className="text-slate-400 text-xs mt-0.5">ED, ICU, OR, L&D, Peds, Psych, and more</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-teal-500/20 border border-teal-500/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-teal-400 font-bold text-sm">2</span>
              </div>
              <div>
                <h4 className="text-white font-semibold text-sm">Answer your first question</h4>
                <p className="text-slate-400 text-xs mt-0.5">Speak or type — the AI listens and coaches your delivery</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-emerald-500/20 border border-emerald-500/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-emerald-400 font-bold text-sm">3</span>
              </div>
              <div>
                <h4 className="text-white font-semibold text-sm">See your detailed score</h4>
                <p className="text-slate-400 text-xs mt-0.5">Get a STAR/SBAR breakdown, ideal answer comparison, and specific coaching tips</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-sky-500/10 to-teal-500/10 border border-sky-500/20 rounded-xl p-3">
            <div className="text-center">
              <p className="text-white text-sm font-semibold mb-1">Here&apos;s everything waiting for you:</p>
              <div className="flex flex-wrap justify-center gap-1.5 mt-2">
                {[
                  { label: 'Mock Interview', color: 'sky' },
                  { label: 'Quick Practice', color: 'teal' },
                  { label: 'SBAR Drills', color: 'purple' },
                  { label: 'AI Coach', color: 'sky' },
                  { label: 'Confidence Builder', color: 'amber' },
                  { label: 'Offer Coach', color: 'emerald' },
                  { label: 'Command Center', color: 'sky' },
                  { label: 'Flashcards', color: 'teal' },
                  { label: 'Resources', color: 'sky' },
                ].map(({ label }) => (
                  <span key={label} className="inline-flex items-center bg-white/5 border border-white/10 rounded-full px-2 py-0.5 text-[9px] text-slate-300 font-medium">
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-teal-500/10 border border-teal-500/20 rounded-lg p-2.5 text-center">
            <p className="text-teal-300 text-xs font-medium">
              Takes about 2 minutes to get started
            </p>
          </div>
        </div>
      ),
    },
  ];

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col">

        {/* Header with step dots and skip */}
        <div className="flex items-center justify-between px-5 pt-5 pb-2">
          <div className="flex gap-1.5">
            {steps.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentStep
                    ? 'w-6 bg-sky-500'
                    : idx < currentStep
                    ? 'w-1.5 bg-teal-500'
                    : 'w-1.5 bg-white/20'
                }`}
              />
            ))}
          </div>
          <button
            onClick={handleSkip}
            className="text-slate-500 hover:text-slate-300 transition-colors text-xs"
          >
            Skip
          </button>
        </div>

        {/* Content area — scrollable */}
        <div ref={contentRef} className="flex-1 overflow-y-auto px-5 pb-2">
          {/* Icon */}
          <div className="flex justify-center my-3">
            <div className="w-14 h-14 bg-sky-500/10 border border-sky-500/20 rounded-2xl flex items-center justify-center">
              {step.icon}
            </div>
          </div>

          {/* Title */}
          <h2 className="text-white text-lg font-bold text-center mb-3">
            {step.title}
          </h2>

          {/* Step content */}
          {step.content}
        </div>

        {/* Navigation buttons */}
        <div className="px-5 pb-5 pt-3 border-t border-white/5">
          <div className="flex gap-3">
            {currentStep > 0 && (
              <button
                onClick={handleBack}
                className="px-4 py-2.5 bg-white/5 border border-white/10 text-slate-300 rounded-xl text-sm font-medium hover:bg-white/10 transition-colors flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                isLastStep
                  ? 'bg-gradient-to-r from-sky-500 to-teal-500 text-white shadow-lg shadow-sky-500/20 hover:-translate-y-0.5'
                  : 'bg-sky-600 hover:bg-sky-500 text-white'
              }`}
            >
              {isLastStep ? (
                <>
                  Choose My Specialty
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          {/* Step counter */}
          <p className="text-center text-slate-600 text-[10px] mt-2">
            {currentStep + 1} of {steps.length}
          </p>
        </div>
      </div>
    </div>
  );
}
