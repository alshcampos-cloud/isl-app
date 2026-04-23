// FeaturePreview.jsx — Feature preview screen shown before signup
// Inserted between IRS (Screen 4) and Signup (Screen 6) in onboarding
// Shows users what the full platform offers beyond the single practice question
//
// D.R.A.F.T. Protocol: NEW file. No existing code modified.

import { motion } from 'framer-motion'
import { showNursingFeatures } from '../../utils/appTarget'

export default function FeaturePreview({ fromNursing: fromNursingProp = false, practiceScore, onContinue }) {
  // Belt-and-suspenders — general builds always use the general feature preview
  const fromNursing = showNursingFeatures() && fromNursingProp
  const accentColor = fromNursing ? 'sky' : 'teal'

  // General features — includes Practice Prompter
  const generalFeatures = [
    {
      icon: '🎙️',
      title: 'AI Mock Interviews',
      subtitle: 'Practice with a realistic AI interviewer',
      description: 'Get asked real interview questions, respond by typing or voice, and receive instant STAR-method feedback on your answer.',
      free: '3 sessions/month',
    },
    {
      icon: '📋',
      title: 'Practice Prompter',
      subtitle: 'Practice with a friend like a real interview',
      description: 'Have a friend ask you questions while the Prompter listens and shows your bullet points and narrative in real-time. Build natural recall for the real thing.',
      free: '5 sessions/month',
      highlight: true,
    },
    {
      icon: '📊',
      title: 'STAR Method Coaching',
      subtitle: 'See exactly where to improve',
      description: 'Every answer is scored on Situation, Task, Action, and Result. Track your progress across all four components.',
      free: '10 practice/month',
    },
    {
      icon: '💡',
      title: 'AI Answer Assistant',
      subtitle: "Stuck? AI helps you structure YOUR experience",
      description: "You provide the real experience — AI helps you organize it into a clear, compelling STAR answer. Your story, better told.",
      free: '5 assists/month',
    },
  ]

  // In general builds, always use the general feature list.
  // Specialty feature list lives in a separate module that is only bundled
  // when VITE_APP_TARGET supports nursing (loaded via dynamic import at runtime).
  const features = generalFeatures

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-slate-50 to-gray-100">
      <motion.div
        className="max-w-xl w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            className="text-4xl mb-3"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            🚀
          </motion.div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            You just practiced your first question
          </h2>
          <p className="text-base sm:text-lg text-gray-500">
            Here's what else is waiting for you.
          </p>
        </div>

        {/* Feature cards */}
        <div className="space-y-4">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${
                feature.highlight
                  ? fromNursing
                    ? 'border-sky-300 shadow-sky-100'
                    : 'border-teal-300 shadow-teal-100'
                  : 'border-gray-200'
              }`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 + index * 0.12 }}
            >
              <div className="p-5 sm:p-6">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <span className="text-2xl sm:text-3xl mt-0.5 flex-shrink-0">{feature.icon}</span>

                  <div className="flex-1 min-w-0">
                    {/* Title + free badge */}
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 className="font-bold text-gray-900 text-base sm:text-lg leading-tight">
                        {feature.title}
                      </h3>
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 ${
                        fromNursing
                          ? 'bg-sky-50 text-sky-600'
                          : 'bg-teal-50 text-teal-600'
                      }`}>
                        {feature.free}
                      </span>
                    </div>

                    {/* Subtitle */}
                    <p className={`text-sm font-medium mb-2 ${
                      fromNursing ? 'text-sky-600' : 'text-teal-600'
                    }`}>
                      {feature.subtitle}
                    </p>

                    {/* Description */}
                    <p className="text-sm text-gray-500 leading-relaxed">
                      {feature.description}
                    </p>

                    {/* Special callout for highlighted feature */}
                    {feature.highlight && (
                      <div className="mt-3 text-xs font-medium px-3 py-2 rounded-lg bg-teal-50 text-teal-700">
                        💡 Mimicking a real interview increases recall by 3x vs. just reading notes
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust badges — only rendered on specialty builds */}

        {/* CTA */}
        <motion.button
          onClick={onContinue}
          className={`mt-8 w-full py-4 rounded-xl font-bold text-lg text-white shadow-lg transition-all hover:-translate-y-0.5 ${
            fromNursing
              ? 'bg-gradient-to-r from-sky-500 to-blue-600 shadow-sky-500/25'
              : 'bg-gradient-to-r from-teal-500 to-emerald-500 shadow-teal-500/25'
          }`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          Create free account — keep your progress →
        </motion.button>

        <motion.p
          className="text-center text-xs text-gray-400 mt-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          Free tier includes all features above. Upgrade anytime for unlimited.
        </motion.p>
      </motion.div>
    </div>
  )
}
