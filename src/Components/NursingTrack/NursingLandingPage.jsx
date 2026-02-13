// NursingTrack — NurseInterviewPro.ai Landing Page
// Marketing landing page that funnels into the nursing track within InterviewAnswers.AI
// In production, NurseInterviewPro.ai domain points to this route
//
// ⚠️ D.R.A.F.T. Protocol: This is a NEW file. No existing code modified.

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight, Stethoscope, Bot, Target, MessageSquare,
  CheckCircle, Shield, Clock, Sparkles, Heart, DollarSign
} from 'lucide-react';

export default function NursingLandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* ============================================================
          NAVBAR
          ============================================================ */}
      <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-b border-gray-100 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <Stethoscope className="w-6 h-6 text-sky-700" />
              <span className="font-bold text-lg text-gray-900">NurseInterviewPro</span>
              <span className="text-xs text-sky-600 font-medium">.ai</span>
            </div>
            <Link to="/" className="text-[10px] text-gray-400 hover:text-indigo-500 ml-8 -mt-0.5 transition-colors">by InterviewAnswers.AI</Link>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/" className="text-gray-500 hover:text-indigo-600 text-sm hidden sm:block transition-colors">General Interviews</Link>
            <a href="#features" className="text-gray-600 hover:text-gray-900 text-sm hidden sm:block">Features</a>
            <a href="#pricing" className="text-gray-600 hover:text-gray-900 text-sm hidden sm:block">Pricing</a>
            <Link
              to="/login?from=nursing"
              className="text-gray-600 hover:text-gray-900 text-sm"
            >
              Log In
            </Link>
            <Link
              to="/signup?from=nursing"
              className="bg-sky-700 hover:bg-sky-800 text-white font-medium text-sm px-4 py-2 rounded-lg transition-colors"
            >
              Start Free
            </Link>
          </div>
        </div>
      </nav>

      {/* ============================================================
          HERO SECTION — Nursing-Specific
          ============================================================ */}
      <section className="relative pt-24 pb-16 sm:pt-32 sm:pb-24 bg-gradient-to-br from-blue-950 via-sky-900 to-blue-950 overflow-hidden">
        {/* Background orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-sky-500/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Copy */}
            <div>
              <motion.div
                className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Heart className="w-4 h-4 text-pink-300" />
                <span className="text-sm text-sky-200">Built for Nurses, by Healthcare Professionals</span>
              </motion.div>

              <motion.h1
                className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                Land Your Dream{' '}
                <span className="bg-gradient-to-r from-pink-400 to-amber-300 bg-clip-text text-transparent">
                  Nursing Job.
                </span>
              </motion.h1>

              <motion.p
                className="mt-6 text-lg sm:text-xl text-sky-200 leading-relaxed max-w-xl"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                Practice specialty-specific interview questions with an AI coach that helps you
                tell YOUR clinical stories — not memorize scripted answers.
              </motion.p>

              <motion.div
                className="mt-6 flex flex-col sm:flex-row gap-3 text-sm text-sky-300"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-green-400" /> ED, ICU, OR, L&D + more</span>
                <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-green-400" /> SBAR drills with per-component scoring</span>
                <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-green-400" /> STAR behavioral coaching</span>
              </motion.div>

              <motion.div
                className="mt-8 flex flex-col sm:flex-row gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Link
                  to="/signup?from=nursing"
                  className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-sky-600 to-cyan-500 hover:from-sky-700 hover:to-cyan-600 text-white font-bold text-lg px-8 py-4 rounded-xl transition-all shadow-xl shadow-sky-500/30 hover:shadow-sky-500/50 hover:-translate-y-0.5"
                >
                  Start Practicing Free
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </motion.div>
            </div>

            {/* Right: Specialty cards preview */}
            <motion.div
              className="hidden lg:block"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-sky-500/20 via-cyan-500/20 to-sky-400/20 rounded-3xl blur-xl" />
                <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl">
                  <div className="flex items-center gap-2 mb-4">
                    <Stethoscope className="w-5 h-5 text-sky-300" />
                    <span className="text-white font-medium">Choose Your Specialty</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { icon: '🚨', name: 'Emergency Dept', color: 'from-red-500/20 to-orange-500/20' },
                      { icon: '🫀', name: 'ICU', color: 'from-blue-500/20 to-cyan-500/20' },
                      { icon: '🔬', name: 'Operating Room', color: 'from-green-500/20 to-emerald-500/20' },
                      { icon: '👶', name: 'Labor & Delivery', color: 'from-pink-500/20 to-rose-500/20' },
                      { icon: '🧸', name: 'Pediatrics', color: 'from-yellow-500/20 to-amber-500/20' },
                      { icon: '🧠', name: 'Psych/BH', color: 'from-purple-500/20 to-violet-500/20' },
                    ].map(s => (
                      <div key={s.name} className={`bg-gradient-to-br ${s.color} backdrop-blur-sm rounded-xl p-3 border border-white/10`}>
                        <span className="text-2xl">{s.icon}</span>
                        <p className="text-white text-xs font-medium mt-1">{s.name}</p>
                      </div>
                    ))}
                  </div>

                  {/* Mock question preview */}
                  <div className="mt-4 bg-white/10 rounded-xl p-4 border border-white/10">
                    <p className="text-white/50 text-xs uppercase tracking-wide mb-1">Interview Question</p>
                    <p className="text-white text-sm">"Walk me through how you manage a sudden influx of patients in the ED."</p>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="bg-sky-500/30 text-sky-200 text-xs px-2 py-0.5 rounded-full">Clinical Judgment</div>
                      <div className="bg-red-500/30 text-red-200 text-xs px-2 py-0.5 rounded-full">ED</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============================================================
          PROBLEM SECTION — Why nurses need this
          ============================================================ */}
      <section className="py-16 sm:py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              You're a great nurse. But are you a great <span className="text-sky-700">interviewer</span>?
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Clinical skills don't automatically translate to interview skills.
              You need to learn how to tell your story.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                problem: '"Tell me about yourself" freezes you',
                solution: 'Practice with AI that coaches your delivery until your intro flows naturally',
                icon: MessageSquare,
              },
              {
                problem: 'Your STAR answers sound vague',
                solution: 'Real-time coaching draws out the specific clinical details that make answers compelling',
                icon: Target,
              },
              {
                problem: 'You can\'t practice at 11pm',
                solution: 'Available 24/7 — practice on your schedule, between shifts, whenever you\'re ready',
                icon: Clock,
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
              >
                <item.icon className="w-8 h-8 text-sky-600 mb-4" />
                <h3 className="text-gray-900 font-semibold text-lg mb-2">{item.problem}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{item.solution}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          FEATURES SECTION
          ============================================================ */}
      <section id="features" className="py-16 sm:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Everything you need to ace your nursing interview
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                icon: Bot,
                title: 'AI Mock Interviews',
                desc: 'Full interview simulations with specialty-specific questions. The AI coaches your delivery, not your clinical knowledge.',
                color: 'bg-purple-50 text-purple-600',
              },
              {
                icon: Shield,
                title: 'Clinically-Grounded Questions',
                desc: 'Every question reviewed by nursing professionals. Grounded in NCSBN, SBAR, Nursing Process, and other published frameworks.',
                color: 'bg-blue-50 text-blue-600',
              },
              {
                icon: MessageSquare,
                title: 'SBAR Communication Drills',
                desc: 'Practice the gold standard of clinical communication: Situation, Background, Assessment, Recommendation. Per-component scoring shows exactly where to improve.',
                color: 'bg-green-50 text-green-600',
              },
              {
                icon: Target,
                title: 'STAR Method Coaching',
                desc: 'Real-time guidance to structure behavioral answers: Situation, Task, Action, Result. Make your clinical stories compelling.',
                color: 'bg-amber-50 text-amber-600',
              },
              {
                icon: Sparkles,
                title: '8 Specialties Covered',
                desc: 'ED, ICU, OR, L&D, Pediatrics, Psych, Med-Surg, and Travel Nursing. Each with tailored questions and scenarios.',
                color: 'bg-orange-50 text-orange-600',
              },
              {
                icon: Heart,
                title: 'Confidence Builder',
                desc: 'Build an evidence file from your real experience, then get a personalized AI confidence brief with interview strategy and talking points.',
                color: 'bg-rose-50 text-rose-600',
              },
              {
                icon: DollarSign,
                title: 'Offer Negotiation Coach',
                desc: 'Practice salary conversations that could earn you thousands more per year. AI coaches your communication — not specific dollar amounts.',
                color: 'bg-emerald-50 text-emerald-600',
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex gap-4 p-6 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className={`w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-gray-900 font-semibold text-lg mb-1">{feature.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          BUILT FOR NURSES — Social proof without fake testimonials
          ============================================================ */}
      <section className="py-16 sm:py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Built by nurses, for nurses
          </h2>
          <p className="text-gray-600 text-lg mb-10 max-w-2xl mx-auto">
            Every question, rubric, and coaching prompt is reviewed by healthcare professionals.
            No AI-generated clinical content — ever.
          </p>

          <div className="grid sm:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="text-3xl mb-3">🩺</div>
              <p className="text-gray-900 font-semibold mb-1">25+ Curated Questions</p>
              <p className="text-gray-500 text-sm">Across 8 nursing specialties, grounded in NCSBN, SBAR, and Nursing Process frameworks</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="text-3xl mb-3">🛡️</div>
              <p className="text-gray-900 font-semibold mb-1">Clinically Reviewed</p>
              <p className="text-gray-500 text-sm">Every scenario vetted by practicing nurses and nurse educators before it reaches you</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="text-3xl mb-3">🎯</div>
              <p className="text-gray-900 font-semibold mb-1">Communication Coaching</p>
              <p className="text-gray-500 text-sm">AI evaluates how you communicate — structure, specificity, confidence — not clinical accuracy</p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          TRUST / WALLED GARDEN SECTION
          ============================================================ */}
      <section className="py-16 sm:py-24 bg-sky-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <Shield className="w-12 h-12 text-sky-700 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Clinical integrity is non-negotiable
          </h2>
          <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
            Our AI coaches how you communicate — it never generates clinical content,
            invents medical facts, or acts as a clinical reference.
          </p>

          <div className="grid sm:grid-cols-2 gap-4 text-left max-w-2xl mx-auto">
            <div className="bg-white rounded-xl p-5 border border-gray-200">
              <p className="text-green-600 font-semibold text-sm mb-2 flex items-center gap-1">
                <CheckCircle className="w-4 h-4" /> AI Does
              </p>
              <ul className="text-gray-600 text-sm space-y-1.5">
                <li>• Coach your answer structure</li>
                <li>• Give delivery feedback</li>
                <li>• Draw out your real experiences</li>
                <li>• Adapt to your responses</li>
              </ul>
            </div>
            <div className="bg-white rounded-xl p-5 border border-gray-200">
              <p className="text-red-600 font-semibold text-sm mb-2 flex items-center gap-1">
                <Shield className="w-4 h-4" /> AI Never
              </p>
              <ul className="text-gray-600 text-sm space-y-1.5">
                <li>• Generates clinical scenarios</li>
                <li>• Invents medical facts or dosages</li>
                <li>• Evaluates clinical accuracy</li>
                <li>• Replaces NCLEX or CE requirements</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          PRICING (placeholder — TBD)
          ============================================================ */}
      <section id="pricing" className="py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Simple pricing</h2>
          <p className="text-gray-600 mb-8">Start free. Upgrade when you're ready.</p>

          <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {/* Free */}
            <div className="border border-gray-200 rounded-2xl p-6 text-left">
              <h3 className="text-gray-900 font-bold text-xl mb-1">Free</h3>
              <p className="text-gray-500 text-sm mb-4">Get started with basic practice</p>
              <p className="text-4xl font-bold text-gray-900 mb-6">$0 <span className="text-base font-normal text-gray-400">/month</span></p>
              <ul className="space-y-2 mb-6">
                {['3 mock interview sessions/month', 'General nursing questions', 'STAR coaching', 'Flashcards'].map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500" />{f}
                  </li>
                ))}
              </ul>
              <Link to="/signup?from=nursing" className="block w-full text-center bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium py-3 rounded-xl transition-colors">
                Start Free
              </Link>
            </div>

            {/* Pro */}
            <div className="border-2 border-sky-600 rounded-2xl p-6 text-left relative">
              <div className="absolute -top-3 right-4 bg-sky-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                Most Popular
              </div>
              <h3 className="text-gray-900 font-bold text-xl mb-1">Pro</h3>
              <p className="text-gray-500 text-sm mb-4">Full access to all specialties</p>
              <p className="text-4xl font-bold text-gray-900 mb-6">$29.99 <span className="text-base font-normal text-gray-400">/month</span></p>
              <ul className="space-y-2 mb-6">
                {[
                  'Unlimited mock interviews',
                  'All 8 specialty tracks',
                  'SBAR drills with per-component scoring',
                  'AI Interview Coach',
                  'Confidence Builder + AI brief',
                  'Offer Negotiation Coach',
                  'Command Center analytics',
                ].map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-sky-600" />{f}
                  </li>
                ))}
              </ul>
              <Link to="/signup?from=nursing" className="block w-full text-center bg-sky-700 hover:bg-sky-800 text-white font-medium py-3 rounded-xl transition-colors shadow-lg shadow-sky-500/20">
                Get Pro Access
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          FINAL CTA
          ============================================================ */}
      <section className="py-16 sm:py-24 bg-gradient-to-br from-blue-950 via-sky-900 to-blue-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Your next interview starts here
          </h2>
          <p className="text-sky-200 text-lg mb-8 max-w-xl mx-auto">
            Stop guessing what to say. Start practicing with an AI coach that helps you tell your story with confidence.
          </p>
          <Link
            to="/signup?from=nursing"
            className="inline-flex items-center gap-2 bg-white text-blue-950 font-bold text-lg px-8 py-4 rounded-xl hover:shadow-xl hover:-translate-y-0.5 transition-all"
          >
            Start Practicing Free
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* ============================================================
          FOOTER
          ============================================================ */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-sky-400" />
              <span className="text-white font-medium">NurseInterviewPro.ai</span>
            </div>
            <p className="text-sm">
              A product of <Link to="/" className="text-white hover:text-indigo-300 transition-colors">InterviewAnswers.AI</Link>
            </p>
            <div className="flex gap-4 text-sm">
              <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
              <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden bg-white/95 backdrop-blur-lg border-t border-gray-200 p-3 z-40">
        <Link
          to="/signup?from=nursing"
          className="block w-full text-center bg-gradient-to-r from-sky-600 to-cyan-500 text-white font-bold py-3 rounded-lg shadow-lg"
        >
          Start Practicing Free
        </Link>
      </div>
    </div>
  );
}
