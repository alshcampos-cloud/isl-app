import { motion } from 'framer-motion';
import { AlertCircle, Brain, MessageSquare, ArrowDown } from 'lucide-react';

const painPoints = [
  {
    icon: AlertCircle,
    color: 'bg-red-100 text-red-600',
    borderColor: 'border-red-100',
    title: 'You freeze up on behavioral questions',
    description: '"Tell me about a time when..." — and your mind goes blank. You know you have great experiences, but they vanish under pressure.',
  },
  {
    icon: Brain,
    color: 'bg-orange-100 text-orange-600',
    borderColor: 'border-orange-100',
    title: 'You rehearse but still forget',
    description: 'Hours of prep wasted. Under the spotlight, your carefully crafted answers come out jumbled or incomplete.',
  },
  {
    icon: MessageSquare,
    color: 'bg-yellow-100 text-yellow-600',
    borderColor: 'border-yellow-100',
    title: 'Generic advice doesn\'t cut it',
    description: '"Just use STAR format" is fine in theory. But your experiences are unique, and cookie-cutter scripts sound robotic to interviewers.',
  },
];

export default function ProblemSection() {
  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-red-500 font-semibold text-sm uppercase tracking-wide mb-3">The Problem</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            You've Been There
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            You're qualified. You just haven't practiced the right way.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {painPoints.map((point, i) => {
            const Icon = point.icon;
            return (
              <motion.div
                key={point.title}
                className={`text-center p-8 rounded-2xl border-2 ${point.borderColor} bg-white`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <div className={`w-16 h-16 rounded-2xl ${point.color} flex items-center justify-center mx-auto mb-5`}>
                  <Icon className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">{point.title}</h3>
                <p className="text-gray-600 leading-relaxed">{point.description}</p>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          className="text-center mt-16 flex flex-col items-center gap-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <p className="text-xl font-semibold text-gray-900">
            There's a better way to prepare.
          </p>
          <p className="text-gray-500 max-w-lg">
            InterviewAnswers.ai uses proven techniques from motivational interviewing and cognitive psychology to help you discover, structure, and practice your authentic stories.
          </p>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <ArrowDown className="w-6 h-6 text-teal-500" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
