/**
 * archetypeRouter.js — Phase 2: Archetype Detection + Routing
 *
 * Detects user archetype from onboarding answers and returns
 * personalized config for the home screen experience.
 *
 * Three archetypes (from PRODUCT_ARCHITECTURE.md):
 *   - urgent_seeker:     Interview in < 14 days, panicking, needs rescue
 *   - strategic_builder:  Weeks/months out, systematic, wants progression
 *   - domain_specialist:  Career transition, domain-confident, interview-anxious
 */

import { showNursingFeatures } from './appTarget'

/**
 * Determine user archetype from onboarding answers.
 * @param {{ timeline: string, field: string }} answers
 * @returns {'urgent_seeker' | 'strategic_builder' | 'domain_specialist'}
 */
export function getArchetype(answers) {
  const { timeline, field } = answers

  // Domain specialist: preparing for a specific field AND selected a specialty
  if (timeline === 'specific_field' || (field && field !== 'general')) {
    // If they also have urgency, urgent_seeker wins
    if (timeline === 'this_week' || timeline === 'within_month') {
      return 'urgent_seeker'
    }
    return 'domain_specialist'
  }

  // Urgent seeker: interview this week or within a month
  if (timeline === 'this_week' || timeline === 'within_month') {
    return 'urgent_seeker'
  }

  // Strategic builder: building long-term skills (default)
  return 'strategic_builder'
}

/**
 * Get personalized config for a given archetype.
 * @param {'urgent_seeker' | 'strategic_builder' | 'domain_specialist'} archetype
 * @returns {{ homeScreenCTA: string, ctaAction: string, featureEmphasis: string, notificationCadence: string, firstQuestion: object }}
 */
export function getArchetypeConfig(archetype) {
  const configs = {
    urgent_seeker: {
      homeScreenCTA: 'Practice your top question now',
      ctaAction: 'practice',
      featureEmphasis: 'Quick wins — practice the most common questions first',
      notificationCadence: 'daily',
      firstQuestion: {
        id: 'onboarding-1',
        question: 'Tell me about your professional background.',
        category: 'General',
        tip: 'Start with your current role, highlight 2-3 key experiences, then mention what you\'re looking for next. Keep it under 2 minutes.',
      },
    },
    strategic_builder: {
      homeScreenCTA: 'Start Day 1 of your Confidence Lab',
      ctaAction: 'assessment',
      featureEmphasis: 'Build a habit — structured daily practice builds lasting confidence',
      notificationCadence: 'daily',
      firstQuestion: {
        id: 'onboarding-2',
        question: 'Describe a time you had to learn something new quickly. How did you approach it?',
        category: 'Behavioral',
        tip: 'Use the STAR method: Situation, Task, Action, Result. Be specific about what YOU did.',
      },
    },
    domain_specialist: {
      homeScreenCTA: 'Choose your specialty track',
      ctaAction: 'tracks',
      featureEmphasis: 'Expert-level prep — questions tailored to your field',
      notificationCadence: 'weekly',
      firstQuestion: {
        id: 'onboarding-3',
        question: 'What unique perspective do you bring to this field based on your experience?',
        category: 'Domain',
        tip: 'Connect your specific experiences to what makes you valuable. Concrete examples beat generic claims.',
      },
    },
  }

  return configs[archetype] || configs.strategic_builder
}

/**
 * Get the route to navigate to after onboarding + signup.
 * @param {'urgent_seeker' | 'strategic_builder' | 'domain_specialist'} archetype
 * @param {string} [field] — onboarding field (e.g. 'nursing', 'general')
 * @returns {string} — React Router path
 */
export function getPostOnboardingRoute(archetype, field) {
  // Nursing routing only enabled when nursing features are visible in this build
  // (Apple 4.3(a) compliance — general builds always route to /app)
  if (field === 'nursing' && showNursingFeatures()) {
    return '/nursing'
  }

  switch (archetype) {
    case 'urgent_seeker':
      return '/app' // Goes to main app, Practice Mode
    case 'strategic_builder':
      return '/app' // Goes to main app, IRS assessment
    case 'domain_specialist':
      return showNursingFeatures() ? '/nursing' : '/app'
    default:
      return '/app'
  }
}

/**
 * Timeline options for Screen 1
 */
export const TIMELINE_OPTIONS = [
  { value: 'this_week', label: 'This week', emoji: '🔥', description: 'I need help now' },
  { value: 'within_month', label: 'Within a month', emoji: '📅', description: 'I\'m actively preparing' },
  { value: 'long_term', label: 'Building long-term skills', emoji: '🌱', description: 'I want to be ready when the time comes' },
  { value: 'specific_field', label: 'Preparing for a specific field', emoji: '🎯', description: 'I know my industry, I need interview help' },
]

/**
 * Field options for Screen 1
 */
/**
 * Specialty first question for users arriving from a specialty landing page.
 * On general builds this falls back to a generic communication prompt so no
 * specialty strings ship in the bundle.
 */
export const NURSING_FIRST_QUESTION = showNursingFeatures()
  ? {
      id: 'onboarding-specialty-1',
      question: 'Tell me about a time you had to communicate critical information to your team.',
      category: 'Communication',
      tip: 'Think about the situation, what was at stake, what you said, and what happened as a result.',
    }
  : {
      id: 'onboarding-specialty-1',
      question: 'Tell me about a time you had to communicate critical information to your team.',
      category: 'Communication',
      tip: 'Think about the situation, what was at stake, what you said, and what happened as a result.',
    }

// FIELD_OPTIONS: specialty-specific options (like nursing) are ONLY added on
// builds where showNursingFeatures() returns true. General builds see only the
// neutral list — no 'nursing' string ever reaches the bundle.
export const FIELD_OPTIONS = [
  { value: 'general', label: 'General — any industry' },
  ...(showNursingFeatures() ? [{ value: 'nursing', label: 'Nursing / Healthcare' }] : []),
  { value: 'technology', label: 'Technology' },
  { value: 'finance', label: 'Finance / Business' },
  { value: 'government', label: 'Government' },
  { value: 'other', label: 'Other' },
]
