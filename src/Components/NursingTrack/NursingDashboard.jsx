// NursingTrack — Dashboard / Home View
// After selecting a specialty, this is the nurse's home base.
// Shows available practice modes tailored to their specialty.

import { motion } from 'framer-motion';
import {
  ArrowLeft, Bot, Target, BookOpen, Award,
  ChevronRight, Stethoscope, MessageSquare, Clock,
  BarChart3, Star, Sparkles, Layers, Shield, DollarSign
} from 'lucide-react';
import { getQuestionsForSpecialty, getCategories, CLINICAL_FRAMEWORKS } from './nursingQuestions';

export default function NursingDashboard({ specialty, onStartMode, onChangeSpecialty, onBack, userData }) {
  const questions = getQuestionsForSpecialty(specialty.id);
  const categories = getCategories(questions);

  // Practice modes available in the nursing track
  const practiceModes = [
    {
      id: 'mock-interview',
      name: 'Mock Interview',
      description: `AI-coached ${specialty.shortName} interview simulation using real clinical scenarios`,
      icon: Bot,
      color: 'from-sky-600 to-cyan-500',
      badge: 'Most Popular',
      detail: 'Full interview with STAR coaching and real-time feedback',
    },
    {
      id: 'practice',
      name: 'Quick Practice',
      description: `Rapid-fire ${specialty.shortName} questions with instant scoring`,
      icon: Target,
      color: 'from-blue-500 to-cyan-500',
      badge: null,
      detail: 'Practice one question at a time, build confidence',
    },
    {
      id: 'sbar-drill',
      name: 'SBAR Communication',
      description: 'Practice structured clinical communication',
      icon: MessageSquare,
      color: 'from-green-500 to-emerald-500',
      badge: 'New',
      detail: 'Situation → Background → Assessment → Recommendation',
    },
    {
      id: 'flashcards',
      name: 'Flashcards',
      description: `Review ${specialty.shortName} questions with spaced repetition`,
      icon: Layers,
      color: 'from-sky-500 to-blue-500',
      badge: 'Free',
      detail: 'Flip cards, mark confidence, focus on weak areas',
    },
    {
      id: 'ai-coach',
      name: 'AI Interview Coach',
      description: 'Free-form coaching — ask anything about interview prep',
      icon: Sparkles,
      color: 'from-violet-500 to-purple-500',
      badge: 'New',
      detail: 'Answer workshopping, strategy, SBAR/STAR guidance, confidence coaching',
    },
    {
      id: 'confidence-builder',
      name: 'Confidence Builder',
      description: `Build your ${specialty.shortName} interview confidence with evidence from your real experience`,
      icon: Shield,
      color: 'from-amber-500 to-orange-500',
      badge: 'New',
      detail: 'Background profile → Evidence file → AI confidence brief → Pre-interview reset',
    },
    {
      id: 'offer-coach',
      name: 'Offer Negotiation',
      description: 'Practice negotiating salary, sign-on bonuses, and benefits with AI coaching',
      icon: DollarSign,
      color: 'from-emerald-500 to-green-500',
      badge: 'New',
      detail: 'Scenario-based practice → AI evaluates communication, not dollar amounts',
    },
  ];

  // Stats — wire to real usage data when available
  const interviewCredits = userData?.usage?.aiInterviewer;
  const isUnlimited = userData?.isBeta || userData?.tier === 'pro';
  const stats = {
    questionsAvailable: questions.length,
    sessionsUsed: interviewCredits?.used || 0,
    creditsDisplay: isUnlimited ? '∞' : (interviewCredits ? `${interviewCredits.remaining}/${interviewCredits.limit}` : '--'),
    streak: 0,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900">
      {/* Top Nav */}
      <div className="bg-slate-900/80 backdrop-blur-lg border-b border-white/10 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <button
            onClick={onBack}
            onTouchEnd={(e) => { e.preventDefault(); onBack(); }}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm hidden sm:inline">Home</span>
          </button>

          {/* Current specialty indicator */}
          <div className="flex items-center gap-2">
            <span className="text-xl">{specialty.icon}</span>
            <span className="text-white font-medium text-sm">{specialty.name}</span>
            <button
              onClick={onChangeSpecialty}
              onTouchEnd={(e) => { e.preventDefault(); onChangeSpecialty(); }}
              className="text-xs text-sky-400 hover:text-sky-300 ml-1"
            >
              Change
            </button>
          </div>

          <div className="flex items-center gap-2">
            {userData && !userData.loading && (
              <>
                <span className="text-slate-300 text-xs hidden sm:inline">{userData.displayName}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  userData.isBeta
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : userData.tier === 'pro'
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      : 'bg-white/10 text-slate-400 border border-white/10'
                }`}>
                  {userData.isBeta ? 'Beta' : userData.tier === 'pro' ? 'Pro' : 'Free'}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        {/* Welcome Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`bg-gradient-to-r ${specialty.color} rounded-2xl p-6 sm:p-8 mb-8 relative overflow-hidden`}
        >
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Stethoscope className="w-5 h-5 text-white/80" />
              <span className="text-white/80 text-sm font-medium">Nursing Interview Prep</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              {specialty.name} Track
            </h1>
            <p className="text-white/80 text-sm sm:text-base max-w-xl">
              Practice with questions designed for {specialty.shortName} interviews.
              AI coaches your delivery — you bring your real clinical experiences.
            </p>
          </div>
          {/* Large emoji decoration */}
          <div className="absolute -right-4 -bottom-4 text-8xl opacity-20">
            {specialty.icon}
          </div>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { label: 'Questions', value: stats.questionsAvailable, icon: BookOpen, color: 'text-blue-400' },
            { label: 'Sessions', value: stats.sessionsUsed, icon: Clock, color: 'text-green-400' },
            { label: 'Credits', value: stats.creditsDisplay, icon: BarChart3, color: 'text-yellow-400' },
            { label: 'Streak', value: `${stats.streak} days`, icon: Star, color: 'text-orange-400' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
              <Icon className={`w-5 h-5 ${color} mx-auto mb-1`} />
              <div className="text-white font-bold text-lg">{value}</div>
              <div className="text-slate-400 text-xs">{label}</div>
            </div>
          ))}
        </div>

        {/* Practice Modes */}
        <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-sky-400" />
          Practice Modes
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {practiceModes.map((mode, index) => {
            const Icon = mode.icon;
            return (
              <motion.button
                key={mode.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                onClick={() => onStartMode(mode.id)}
                onTouchEnd={(e) => { e.preventDefault(); onStartMode(mode.id); }}
                className="relative text-left bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 hover:border-white/20 transition-all group"
              >
                {/* Badge */}
                {mode.badge && (
                  <span className={`absolute top-3 right-3 text-xs font-semibold px-2 py-0.5 rounded-full ${
                    mode.badge === 'New'
                      ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                      : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  }`}>
                    {mode.badge}
                  </span>
                )}

                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${mode.color} flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold text-base mb-1">{mode.name}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed mb-2">{mode.description}</p>
                    <p className="text-slate-500 text-xs">{mode.detail}</p>
                  </div>

                  <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-slate-400 group-hover:translate-x-1 transition-all mt-1 flex-shrink-0" />
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Clinical Frameworks Reference */}
        <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-sky-400" />
          Clinical Frameworks Used
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
          {Object.entries(CLINICAL_FRAMEWORKS).map(([key, framework]) => (
            <div key={key} className="bg-white/5 border border-white/10 rounded-xl p-4">
              <h4 className="text-white font-medium text-sm mb-1">{framework.name}</h4>
              <p className="text-slate-400 text-xs leading-relaxed mb-2">{framework.description}</p>
              <p className="text-slate-500 text-xs italic">Source: {framework.source}</p>
            </div>
          ))}
        </div>

        {/* Question Categories */}
        <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-sky-400" />
          Question Categories
        </h2>

        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map(cat => (
            <span key={cat} className="bg-white/10 border border-white/10 text-white/80 text-sm px-3 py-1.5 rounded-full">
              {cat}
            </span>
          ))}
        </div>

        {/* Command Center */}
        <button
          onClick={() => onStartMode('command-center')}
          onTouchEnd={(e) => { e.preventDefault(); onStartMode('command-center'); }}
          className="w-full bg-gradient-to-r from-sky-600/20 to-cyan-500/20 border border-sky-500/30 rounded-xl p-4 mb-4 flex items-center justify-between hover:from-sky-600/30 hover:to-cyan-500/30 transition-all group text-left"
        >
          <div className="flex items-center gap-3">
            <BarChart3 className="w-5 h-5 text-sky-400" />
            <div>
              <p className="text-white font-medium text-sm">Command Center</p>
              <p className="text-slate-400 text-xs">Track progress, browse questions, and assess your readiness</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-sky-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
        </button>

        {/* Resources Link */}
        <button
          onClick={() => onStartMode('resources')}
          onTouchEnd={(e) => { e.preventDefault(); onStartMode('resources'); }}
          className="w-full bg-white/5 border border-white/10 rounded-xl p-4 mb-8 flex items-center justify-between hover:bg-white/10 hover:border-white/20 transition-all group text-left"
        >
          <div className="flex items-center gap-3">
            <BookOpen className="w-5 h-5 text-sky-400" />
            <div>
              <p className="text-white font-medium text-sm">Clinical Resources & References</p>
              <p className="text-slate-400 text-xs">Free public sources for clinical knowledge — NCSBN, CDC, IHI, and more</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-slate-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
        </button>

        {/* Walled Garden Notice */}
        <div className="bg-sky-500/10 border border-sky-400/20 rounded-xl p-4 mb-8">
          <div className="flex items-start gap-3">
            <div className="text-sky-400 mt-0.5">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sky-200 text-sm font-medium mb-1">About Our Content</p>
              <p className="text-sky-300/70 text-xs leading-relaxed">
                All interview questions and clinical scenarios are written or reviewed by qualified nursing professionals.
                Our AI coaches your communication and delivery — it does not generate clinical content or serve as a clinical reference.
                For clinical questions, please refer to your facility protocols or resources like UpToDate.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
