import React, { useState, useRef, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import { fetchWithRetry } from '../../utils/fetchWithRetry'
import { trackOnboardingEvent } from '../../utils/onboardingTracker'

/**
 * OnboardingPractice — Screen 3: First Practice Question
 *
 * One easy question with AI feedback. Value delivered in under 2 minutes,
 * before registration. Uses the self-efficacy feedback from Phase 1.
 *
 * Mastery Experience source (Huang & Mayer 2020):
 * Success at progressively harder tasks builds self-efficacy.
 */

// System prompts moved server-side (Change 8 — IP protection).
// Previously: ONBOARDING_SYSTEM_PROMPT and NURSING_ONBOARDING_SYSTEM_PROMPT were
// hardcoded here and sent in the POST body, visible in DevTools Network tab.
// Now: only a mode identifier is sent; the Edge Function looks up the prompt server-side.

export default function OnboardingPractice({ question, anonSessionReady, onComplete, fromNursing = false }) {
  const [userAnswer, setUserAnswer] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const [score, setScore] = useState(null)
  const [error, setError] = useState(null)
  const hasTrackedTyping = useRef(false)

  const submitAnswer = useCallback(async () => {
    if (!userAnswer.trim() || isLoading) return

    setIsLoading(true)
    setError(null)
    trackOnboardingEvent(3, 'submitted', { word_count: userAnswer.trim().split(/\s+/).filter(Boolean).length })

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('No session available')

      const response = await fetchWithRetry(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-feedback`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            mode: fromNursing ? 'onboarding-nursing' : 'onboarding-general',
            userMessage: `Question: ${question.question}\n\nAnswer: ${userAnswer.trim()}`,
          }),
        }
      )

      if (!response.ok) {
        const errText = await response.text()
        console.error('Onboarding practice error:', response.status, errText)
        throw new Error(`Feedback failed: ${response.status}`)
      }

      const data = await response.json()
      const rawContent = data.content?.[0]?.text || data.response || data.feedback || ''

      // Parse score from [SCORE: X/10] format
      const scoreMatch = rawContent.match(/\[SCORE:\s*(\d+)\s*\/\s*10\]/)
      let parsedScore = scoreMatch ? parseInt(scoreMatch[1], 10) : 3

      // Client-side guardrail: trivial answers (≤3 words) can never score above 2
      // Belt-and-suspenders with the Edge Function prompt's CRITICAL PRE-CHECK
      const wordCount = userAnswer.trim().split(/\s+/).filter(Boolean).length
      if (wordCount <= 3 && parsedScore > 2) {
        console.warn(`[Scoring guardrail] Capped score from ${parsedScore} to 2 (answer was ${wordCount} words)`)
        parsedScore = 2
      }

      // Clean the score tag from visible feedback
      const cleanFeedback = rawContent.replace(/\[SCORE:\s*\d+\s*\/\s*10\]/g, '').trim()

      setScore(parsedScore)
      setFeedback(cleanFeedback)
      trackOnboardingEvent(3, 'feedback_received', { score: parsedScore })
    } catch (err) {
      console.error('Practice submission error:', err)
      setError('Could not get feedback right now. You can still continue!')
      // Set a default score so they can proceed
      setScore(3)
      setFeedback("Great effort on your first practice! While I couldn't generate detailed feedback right now, the fact that you started practicing puts you ahead of most candidates. Keep going!")
      trackOnboardingEvent(3, 'feedback_error', { error: err.message })
    } finally {
      setIsLoading(false)
    }
  }, [userAnswer, isLoading, question])

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="text-center mb-6 pt-4">
        <p className="text-sm text-teal-600 font-medium tracking-wide uppercase mb-1">
          Quick Practice
        </p>
        <h2 className="text-xl font-bold text-slate-800 mb-1">
          Try answering this question
        </h2>
        <p className="text-sm text-slate-400">
          Don't overthink it — just say what comes to mind.
        </p>
      </div>

      {/* Clinical trust badge for nursing users (Change 7) */}
      {fromNursing && (
        <div className="flex items-center justify-center gap-1.5 mb-2">
          <span className="text-xs text-teal-600 bg-teal-50 px-3 py-1 rounded-full font-medium">
            🏥 Clinically reviewed question · SBAR framework
          </span>
        </div>
      )}

      {/* Question card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-4 shadow-sm">
        <p className="text-slate-800 font-medium leading-relaxed">
          {question.question}
        </p>
        {question.tip && (
          <p className="text-xs text-slate-400 mt-3 pt-3 border-t border-slate-100">
            Tip: {question.tip}
          </p>
        )}
      </div>

      {/* Answer textarea (only show if no feedback yet) */}
      {!feedback && (
        <div className="flex-1 flex flex-col">
          <textarea
            value={userAnswer}
            onChange={(e) => {
              setUserAnswer(e.target.value)
              if (!hasTrackedTyping.current && e.target.value.trim().length > 0) {
                hasTrackedTyping.current = true
                trackOnboardingEvent(3, 'typing_started')
              }
            }}
            placeholder="Type your answer here... (2-3 sentences is great for now)"
            className="flex-1 min-h-[150px] w-full p-4 rounded-2xl border border-slate-200 bg-white resize-none text-slate-700 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
            disabled={isLoading}
          />

          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-slate-300">
              {userAnswer.trim().split(/\s+/).filter(Boolean).length} words
            </span>

            <button
              onClick={submitAnswer}
              disabled={!userAnswer.trim() || isLoading || !anonSessionReady}
              className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all
                ${userAnswer.trim() && !isLoading && anonSessionReady
                  ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-600/20'
                  : 'bg-slate-100 text-slate-300 cursor-not-allowed'
                }`}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Getting feedback...
                </span>
              ) : (
                'Get feedback'
              )}
            </button>
          </div>
        </div>
      )}

      {/* Feedback display */}
      {feedback && (
        <div className="animate-fadeIn">
          {/* Score badge */}
          <div className="flex items-center justify-center mb-4">
            <div className={`inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full text-base font-bold shadow-sm
              ${score >= 7 ? 'bg-green-100 text-green-700 border border-green-200' :
                score >= 4 ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                'bg-red-50 text-red-600 border border-red-200'
              }`}
            >
              <span className="text-xl">
                {score >= 7 ? '🎯' : score >= 4 ? '👍' : '💪'}
              </span>
              {score}/10 — {score >= 7 ? 'Great start!' : score >= 4 ? 'Good first try!' : 'Let\'s build on this!'}
            </div>
          </div>

          {/* Feedback text — rendered as clean paragraphs */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-4 shadow-sm space-y-3">
            {feedback.split('\n').filter(line => line.trim()).map((paragraph, i) => (
              <p key={i} className="text-slate-600 leading-relaxed text-sm">
                {paragraph.trim()}
              </p>
            ))}
          </div>

          {/* SBAR citation + clinical safety disclaimer for nursing users (Change 7) */}
          {fromNursing && (
            <div className="text-xs text-slate-400 mb-4 px-1 space-y-1">
              <p>💡 This feedback references the SBAR communication framework (Institute for Healthcare Improvement)</p>
              <p>🛡️ AI coaches your communication delivery — clinical content reviewed by practicing nurses</p>
            </div>
          )}

          {/* Continue button */}
          <button
            onClick={() => onComplete(score, userAnswer)}
            className="w-full py-3 px-6 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-teal-600/20"
          >
            See your Interview Readiness Score
          </button>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  )
}
