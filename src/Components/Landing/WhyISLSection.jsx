import { motion } from 'framer-motion';
import { TrendingUp, BarChart3, Clock, RefreshCcw, Brain, Shield, Mic, ChevronRight } from 'lucide-react';

const differentiators = [
  {
    icon: TrendingUp,
    color: 'text-green-600 bg-green-100',
    title: 'Watch Your Scores Improve',
    description: 'Every practice session gives you a completeness score (0-100). Track your improvement over time and know exactly when you\'re ready.',
  },
  {
    icon: BarChart3,
    color: 'text-indigo-600 bg-indigo-100',
    title: 'Session History & Analytics',
    description: 'Review every practice session. See which questions you nailed and which need more work. Data-driven interview prep.',
  },
  {
    icon: Brain,
    color: 'text-purple-600 bg-purple-100',
    title: 'Motivational Interviewing',
    description: 'Our AI doesn\'t just quiz you — it uses proven psychological techniques to help you discover stories you didn\'t know you had.',
  },
  {
    icon: Mic,
    color: 'text-pink-600 bg-pink-100',
    title: 'Real-Time Interview Assistance',
    description: 'The only tool that helps you DURING the interview. Live Prompter gives you bullet points while you\'re actually speaking.',
  },
  {
    icon: RefreshCcw,
    color: 'text-blue-600 bg-blue-100',
    title: 'Adaptive Follow-Ups',
    description: 'Our AI Interviewer doesn\'t just ask questions — it listens to your answer and asks relevant follow-ups, just like a real interviewer would.',
  },
  {
    icon: Clock,
    color: 'text-amber-600 bg-amber-100',
    title: 'Ready in Days, Not Weeks',
    description: 'Our 5-step workflow gets you from zero to interview-ready. Generate questions, build answers, practice, refine, and go live.',
  },
];

export default function WhyISLSection() {
  return (
    <section className="py-20 sm:py-28 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Visual — Progress mockup */}
          <motion.div
            className="relative order-2 lg:order-1"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl p-8 border border-indigo-100">
              {/* Dashboard header */}
              <div className="flex items-center justify-between mb-6">
                <h4 className="font-bold text-gray-900">Your Progress</h4>
                <span className="text-xs bg-green-100 text-green-700 font-medium px-2.5 py-1 rounded-full">This Week</span>
              </div>

              {/* Score cards */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-white rounded-xl p-3 text-center shadow-sm">
                  <p className="text-2xl font-bold text-indigo-600">12</p>
                  <p className="text-xs text-gray-500">Sessions</p>
                </div>
                <div className="bg-white rounded-xl p-3 text-center shadow-sm">
                  <p className="text-2xl font-bold text-green-600">87%</p>
                  <p className="text-xs text-gray-500">Avg Score</p>
                </div>
                <div className="bg-white rounded-xl p-3 text-center shadow-sm">
                  <p className="text-2xl font-bold text-purple-600">24</p>
                  <p className="text-xs text-gray-500">Questions</p>
                </div>
              </div>

              {/* Progress bars */}
              <div className="space-y-4">
                {[
                  { label: 'Behavioral Questions', score: 92, color: 'bg-green-500' },
                  { label: 'Technical Questions', score: 78, color: 'bg-blue-500' },
                  { label: 'Leadership Questions', score: 65, color: 'bg-purple-500' },
                  { label: 'Situational Questions', score: 84, color: 'bg-indigo-500' },
                ].map((item, i) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700 font-medium">{item.label}</span>
                      <span className="text-gray-500">{item.score}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <motion.div
                        className={`h-2 rounded-full ${item.color}`}
                        initial={{ width: '0%' }}
                        whileInView={{ width: `${item.score}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.3 + i * 0.15, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Recent sessions */}
              <div className="mt-6 bg-white rounded-xl p-4 shadow-sm">
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">Recent Sessions</p>
                {[
                  { q: '"Tell me about a leadership challenge..."', score: 95, time: '2 min ago' },
                  { q: '"Describe a time you failed..."', score: 88, time: '1 hour ago' },
                  { q: '"Why do you want this role?"', score: 91, time: 'Yesterday' },
                ].map((s) => (
                  <div key={s.q} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-700 truncate">{s.q}</p>
                      <p className="text-xs text-gray-400">{s.time}</p>
                    </div>
                    <span className={`text-sm font-bold ml-3 ${s.score >= 90 ? 'text-green-600' : 'text-blue-600'}`}>{s.score}%</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right: Content */}
          <div className="order-1 lg:order-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-indigo-600 font-semibold text-sm uppercase tracking-wide mb-3">Why ISL?</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                Not Just Another AI Tool.{' '}
                <span className="text-indigo-600">A Complete System.</span>
              </h2>
              <p className="text-lg text-gray-600 mb-10 leading-relaxed">
                Most AI tools give you generic answers. ISL builds a personalized practice system
                around YOUR experiences, tracks your progress, and helps you during the actual interview.
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-2 gap-5">
              {differentiators.map((d, i) => {
                const Icon = d.icon;
                return (
                  <motion.div
                    key={d.title}
                    className="flex gap-4"
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: i * 0.08 }}
                  >
                    <div className={`w-10 h-10 rounded-xl ${d.color} flex items-center justify-center flex-shrink-0`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm mb-1">{d.title}</h4>
                      <p className="text-gray-500 text-sm leading-relaxed">{d.description}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
