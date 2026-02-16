import React, { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import { getArchetypeConfig } from '../../utils/archetypeRouter'

/**
 * ArchetypeCTA — Personalized home screen banner
 *
 * Fetches the user's archetype from user_profiles and displays
 * a personalized CTA on the home screen.
 *
 * Three archetype variants:
 *   - urgent_seeker:      "Practice your top question now"
 *   - strategic_builder:   "Start Day 1 of your Confidence Lab"
 *   - domain_specialist:   "Choose your specialty track"
 *
 * Self-contained: fetches its own data, renders nothing if no archetype.
 * Minimal integration point in App.jsx — just drop in the component.
 */
export default function ArchetypeCTA({ onAction }) {
  const [archetype, setArchetype] = useState(null)
  const [field, setField] = useState(null)
  const [loading, setLoading] = useState(true)
  const hasFetched = useRef(false)

  useEffect(() => {
    if (hasFetched.current) return
    hasFetched.current = true

    async function fetchArchetype() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { setLoading(false); return }

        const { data, error } = await supabase
          .from('user_profiles')
          .select('archetype, onboarding_field')
          .eq('id', user.id)
          .single()

        if (error || !data?.archetype) { setLoading(false); return }

        setArchetype(data.archetype)
        setField(data.onboarding_field || null)
      } catch (err) {
        console.warn('[ArchetypeCTA] Failed to fetch archetype:', err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchArchetype()
  }, [])

  // Render nothing if loading, no archetype, or fetch failed
  if (loading || !archetype) return null

  const config = getArchetypeConfig(archetype)
  if (!config) return null

  // Build CTA text — domain_specialist gets field-specific text
  let ctaText = config.homeScreenCTA
  if (archetype === 'domain_specialist' && field && field !== 'general') {
    // Capitalize field name
    const fieldLabel = field.charAt(0).toUpperCase() + field.slice(1)
    ctaText = `Practice ${fieldLabel} questions`
  }

  // Map archetype to visual style
  const styles = {
    urgent_seeker: {
      gradient: 'from-red-500/30 to-orange-500/30',
      border: 'border-red-400/50',
      icon: '🔥',
      subtitle: 'Your interview is coming up — every practice session counts.',
      buttonGradient: 'from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600',
    },
    strategic_builder: {
      gradient: 'from-teal-500/30 to-emerald-500/30',
      border: 'border-teal-400/50',
      icon: '🌱',
      subtitle: 'Build your confidence one practice session at a time.',
      buttonGradient: 'from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600',
    },
    domain_specialist: {
      gradient: 'from-purple-500/30 to-indigo-500/30',
      border: 'border-purple-400/50',
      icon: '🎯',
      subtitle: `Questions tailored to your ${field && field !== 'general' ? field : 'specialty'} field.`,
      buttonGradient: 'from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600',
    },
  }

  const style = styles[archetype] || styles.strategic_builder

  return (
    <div className={`bg-gradient-to-r ${style.gradient} backdrop-blur-xl border-2 ${style.border} rounded-2xl p-5 text-white mb-6 shadow-xl`}>
      <div className="flex items-start gap-4">
        <div className="text-3xl flex-shrink-0">{style.icon}</div>
        <div className="flex-1">
          <p className="text-lg font-bold mb-1">{ctaText}</p>
          <p className="text-sm text-white/80 font-medium mb-3">{style.subtitle}</p>
          <button
            onClick={() => onAction?.(config.ctaAction, archetype)}
            className={`bg-gradient-to-r ${style.buttonGradient} text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-md hover:shadow-lg active:scale-[0.98]`}
          >
            {ctaText} →
          </button>
        </div>
      </div>
    </div>
  )
}
