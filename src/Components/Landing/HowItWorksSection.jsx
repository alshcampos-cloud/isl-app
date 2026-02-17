import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Dumbbell, Trophy, ArrowRight } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: FileText,
    title: 'Build Your Question Bank',
    description: 'Paste a job posting and get tailored questions in seconds. Or pick from our template library. Add your own. Your bank, your way.',
  },
  {
    number: '02',
    icon: Dumbbell,
    title: 'Practice Until It\'s Natural',
    description: 'Run mock interviews with AI that asks follow-ups. Do quick drills for daily reps. Use the Answer Assistant to turn your real stories into polished answers.',
  },
  {
    number: '03',
    icon: Trophy,
    title: 'Show Up Ready',
    description: 'On interview day, Live Prompter shows your prepared bullet points in real-time as questions come. You\'re not memorizing scripts \u2014 you\'re speaking from experience, with backup.',
  },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-16 sm:py-20 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            How It Works
          </h2>
          <p className="mt-4 text-lg text-slate-300 max-w-2xl mx-auto">
            Go from unprepared to unstoppable in three simple steps.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connecting line (desktop) */}
          <div className="hidden md:block absolute top-24 left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-teal-400/30 via-emerald-400/50 to-teal-400/30" />

          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.number}
                className="relative"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
              >
                <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 text-center hover:bg-white/15 transition-colors">
                  {/* Step number */}
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 to-emerald-400 flex items-center justify-center mx-auto mb-6 text-white font-bold text-lg shadow-lg">
                    {step.number}
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-5">
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                  <p className="text-slate-300 leading-relaxed">{step.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Link
            to="/onboarding"
            className="inline-flex items-center gap-2 bg-white text-teal-700 font-bold text-lg px-8 py-4 rounded-xl hover:bg-teal-50 transition-all shadow-xl"
          >
            Start Practicing Free
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
