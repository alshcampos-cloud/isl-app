import { motion } from 'framer-motion';
import { Mic, Bot, Target, Sparkles, Lightbulb, ArrowRight } from 'lucide-react';

const features = [
  {
    icon: Mic,
    name: 'Live Prompter',
    gradient: 'from-teal-500 to-emerald-500',
    description: 'Fuzzy logic identifies the question being asked and pulls your personalized bullet points in real-time during practice. Train your brain to hit every point before the real thing.',
    highlights: ['Identifies questions automatically', 'Matches questions to your answers', 'Your answers are never recorded'],
  },
  {
    icon: Bot,
    name: 'AI Interviewer',
    gradient: 'from-teal-600 to-cyan-600',
    description: 'Practice with a realistic AI interviewer that listens, scores your answers, and asks tough follow-ups — just like the real thing.',
    highlights: ['Scored feedback (0-100)', 'Adaptive follow-up questions', 'Progressive difficulty levels'],
  },
  {
    icon: Target,
    name: 'Practice Mode',
    gradient: 'from-emerald-500 to-teal-500',
    description: 'Quick drill sessions with instant AI scoring and feedback. See exactly which points you hit and what you missed.',
    highlights: ['Instant performance scoring', 'Track points covered', 'Perfect for daily reps'],
  },
  {
    icon: Sparkles,
    name: 'Answer Assistant',
    gradient: 'from-cyan-500 to-teal-600',
    description: 'Build STAR-formatted answers through conversation. Share your real experiences and let AI structure them into polished responses.',
    highlights: ['Motivational interviewing approach', 'Extracts YOUR real stories', 'STAR method formatting'],
  },
  {
    icon: Lightbulb,
    name: 'Question Generator',
    gradient: 'from-teal-400 to-emerald-500',
    description: 'Paste a job description and get personalized interview questions tailored to the role. Or pick from our template library.',
    highlights: ['AI-generated from job postings', 'Template library included', 'Custom question support'],
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
            Build answers from your real experiences, practice until they're second nature, and walk in ready.
          </p>
        </motion.div>

        {/* Top row: 2 large featured cards */}
        <motion.div
          className="grid md:grid-cols-2 gap-6 mb-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          {features.slice(0, 2).map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.name}
                className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100"
                variants={itemVariants}
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.name}</h3>
                <p className="text-gray-600 leading-relaxed mb-4">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.highlights.map((h) => (
                    <li key={h} className="flex items-center gap-2 text-sm text-gray-500">
                      <ArrowRight className="w-3.5 h-3.5 text-teal-500 flex-shrink-0" />
                      {h}
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Bottom row: 3 cards */}
        <motion.div
          className="grid md:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          {features.slice(2).map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.name}
                className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100"
                variants={itemVariants}
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.name}</h3>
                <p className="text-gray-600 leading-relaxed mb-4">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.highlights.map((h) => (
                    <li key={h} className="flex items-center gap-2 text-sm text-gray-500">
                      <ArrowRight className="w-3.5 h-3.5 text-teal-500 flex-shrink-0" />
                      {h}
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
