import { motion } from 'framer-motion';
import { Mic, Brain, BookOpen, TrendingUp, CheckCircle2 } from 'lucide-react';

const pillars = [
  {
    icon: Mic,
    name: 'Practice',
    gradient: 'from-teal-500 to-cyan-500',
    description: 'Rehearse the interview before it happens. Adaptive mock sessions, quick drills, and rehearsal prompts that build muscle memory.',
    sub: ['Adaptive mock interviews', 'Quick drills', 'Rehearse out loud'],
  },
  {
    icon: Brain,
    name: 'Coach',
    gradient: 'from-teal-500 to-emerald-500',
    description: 'Per-answer feedback grounded in cognitive-psychology research. Coaching on what to fix — not a generic tip list.',
    sub: ['Per-answer feedback', 'STAR/SBAR structure'],
  },
  {
    icon: BookOpen,
    name: 'Library',
    gradient: 'from-emerald-500 to-teal-500',
    description: 'Hand-built interview question sets, spaced-repetition flashcards, and AI-generated custom questions when you need them.',
    sub: ['Role-specific sets', 'Spaced repetition', 'AI-generated customs'],
  },
  {
    icon: TrendingUp,
    name: 'Track',
    gradient: 'from-emerald-500 to-green-500',
    description: 'Interview Readiness Score and daily streaks keep you honest. Know the number that says you\'re ready.',
    sub: ['Daily streaks', '0-100 readiness score'],
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function FeaturesSection() {
  return (
    <section id="features" className="py-16 sm:py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-teal-600 font-semibold text-sm uppercase tracking-wide mb-3">Every Tool You Need</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            From Preparation to Performance
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Four pillars. Built to take you from first rep to interview-ready.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <motion.div
                key={pillar.name}
                className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 flex flex-col"
                variants={itemVariants}
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${pillar.gradient} flex items-center justify-center mb-5 shadow-md`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{pillar.name}</h3>
                <p className="text-gray-600 leading-relaxed mb-5">{pillar.description}</p>
                <ul className="space-y-2 mt-auto">
                  {pillar.sub.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
                      <CheckCircle2 className="w-4 h-4 text-teal-500 flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
