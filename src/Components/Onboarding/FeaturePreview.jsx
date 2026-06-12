// FeaturePreview.jsx — Feature preview screen shown before signup
// Inserted between IRS (Screen 4) and Signup (Screen 6) in onboarding
// Shows users what the full platform offers beyond the single practice question
//
// Sprint 2 (Apr 2026): Shrunk from 4 feature cards to 2 (AI Mock Interviewer +
// Practice Prompter). Dropped the framer-motion stagger animation in favor of
// a single simple fade-in. Rationale: users already did Practice + IRS by this
// point, and SignUpPrompt already lists the full free-tier features — a 4-card
// brochure is redundant friction.

import { motion } from 'framer-motion'
import { showNursingFeatures } from '../../utils/appTarget'

export default function FeaturePreview({ fromNursing: fromNursingProp = false, practiceScore, onContinue }) {
  // Belt-and-suspenders — general builds always use the general feature preview
  const fromNursing = showNursingFeatures() && fromNursingProp

  // Two features only: the highest-leverage hooks for the value prop.
  // (Full free-tier list is shown on SignUpPrompt to avoid duplication.)
  //
  // 2026-06-11 (Day 2c — extension of Issue #2): branch on fromNursing so
  // nursing-track signups see features that ACTUALLY exist in their track.
  // Practice Prompter does NOT exist in nursing — same trust-violation
  // pattern as Issue #2 (SignUpPrompt fix in PR #62) but on the earlier
  // teaser screen between IRSBaseline and SignUpPrompt. Before this fix,
  // every nursing signup saw "Practice Prompter — 5 sessions/month" on
  // this screen, then landed in /nursing dashboard with no such feature.
  //
  // SOURCE OF TRUTH — numbers pinned to creditSystem.js TIER_LIMITS.free:
  //   Nursing: nursing_mock=2, nursing_sbar=3.
  //   General: ai_interviewer=3 ("AI Mock Interviews — 3 sessions/month"),
  //   live_prompter_questions=10 (Practice Prompter "5 sessions/month" is
  //   a product-team curated teaser display, NOT a strict cap mirror —
  //   preserving existing general-path string byte-identical to avoid
  //   any non-fix copy drift).
  //
  // HIGHLIGHTED feature gets the special science callout at line 105:
  //   "Mimicking a real interview increases recall by 3x vs. just reading
  //   notes." General path keeps Practice Prompter highlighted (preserved
  //   byte-identical). Nursing path highlights Mock Interview — matches
  //   the Issue #6C dashboard banner's "Start with mock interview" CTA.
  const features = fromNursing
    ? [
        {
          icon: '🩺',
          title: 'Nursing Mock Interviews',
          subtitle: 'Practice with a hiring-manager AI',
          description: 'Get asked specialty-specific nursing questions, respond by typing or voice, and receive instant STAR-method feedback grounded in real clinical communication scenarios.',
          free: '2 sessions/month',
          highlight: true,
        },
        {
          icon: '📋',
          title: 'SBAR Drills',
          subtitle: 'Practice structured clinical handoffs',
          description: 'Walk through Situation, Background, Assessment, Recommendation drills with per-component scoring — the framework hiring managers expect from clinical interviews.',
          free: '3 sessions/month',
        },
      ]
    : [
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
          subtitle: 'Rehearse out loud with your own bullet points',
          description: 'Read a question out loud, answer out loud, and see your prepared bullet points appear during rehearsal — train yourself to hit your key points naturally.',
          free: '5 sessions/month',
          highlight: true,
        },
      ]

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-slate-50 to-gray-100">
      <motion.div
        className="max-w-xl w-full"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🚀</div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            You just practiced your first question
          </h2>
          <p className="text-base sm:text-lg text-gray-500">
            Here's what else is waiting for you.
          </p>
        </div>

        {/* Feature cards — no stagger, just render both in the parent fade-in */}
        <div className="space-y-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${
                feature.highlight
                  ? fromNursing
                    ? 'border-sky-300 shadow-sky-100'
                    : 'border-teal-300 shadow-teal-100'
                  : 'border-gray-200'
              }`}
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
            </div>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={onContinue}
          className={`mt-8 w-full py-4 rounded-xl font-bold text-lg text-white shadow-lg transition-all hover:-translate-y-0.5 ${
            fromNursing
              ? 'bg-gradient-to-r from-sky-500 to-blue-600 shadow-sky-500/25'
              : 'bg-gradient-to-r from-teal-500 to-emerald-500 shadow-teal-500/25'
          }`}
        >
          Create free account — keep your progress →
        </button>

        <p className="text-center text-xs text-gray-400 mt-3">
          Free tier includes more than what's shown — full list on the next screen.
        </p>
      </motion.div>
    </div>
  )
}
