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

const ONBOARDING_SYSTEM_PROMPT = `You are a supportive interview coach helping someone practice for the first time.

RULES:
1. Be warm, encouraging, and specific. This is their FIRST practice ever.
2. Start with something genuinely positive about their answer.
3. Give ONE concrete suggestion for improvement (not three, not five — ONE).
4. End with an encouraging statement about their potential.
5. Keep your response under 150 words — brevity matters.
6. Include a score from 1-10 in this exact format: [SCORE: X/10]
7. Do NOT use clinical terminology. Keep it simple and accessible.

TONE: Think "supportive older sibling who interviews well" — not "professor grading an essay."

SCORING GUIDE:
- 1-3: Answer is very vague or off-topic
- 4-5: Shows effort but needs structure
- 6-7: Good foundation, specific improvement available
- 8-9: Strong answer with minor refinements
- 10: Exceptional — rare for first attempt
`

const NURSING_ONBOARDING_SYSTEM_PROMPT = `You are a supportive nursing interview coach helping a nurse practice for the first time.

RULES:
1. Be warm, encouraging, and specific. This is their FIRST practice ever.
2. Start with something genuinely positive about their answer.
3. Give ONE concrete suggestion for improvement — frame it around the SBAR communication framework (Situation, Background, Assessment, Recommendation) if relevant to their answer.
4. End with an encouraging statement about their potential.
5. Keep your response under 150 words — brevity matters.
6. Include a score from 1-10 in this exact format: [SCORE: X/10]
7. Coach COMMUNICATION quality only — do NOT evaluate clinical accuracy.
8. If they mention clinical details, acknowledge them but focus your feedback on how clearly they communicated, not whether the clinical content is correct.

TONE: Think "supportive charge nurse mentoring a colleague" — warm, professional, specific.

SCORING GUIDE:
- 1-3: Answer is very vague or off-topic
- 4-5: Shows effort but needs structure (suggest SBAR framing)
- 6-7: Good foundation, SBAR elements partially present
- 8-9: Strong answer with clear SBAR structure
- 10: Exceptional — rare for first attempt
`

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
            mode: 'confidence-brief',
            systemPrompt: fromNursing ? NURSING_ONBOARDING_SYSTEM_PROMPT : ONBOARDING_SYSTEM_PROMPT,
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
      const parsedScore = scoreMatch ? parseInt(scoreMatch[1], 10) : 6

      // Clean the score tag from visible feedback
      const cleanFeedback = rawContent.replace(/\[SCORE:\s*\d+\s*\/\s*10\]/g, '').trim()

      setScore(parsedScore)
      setFeedback(cleanFeedback)
      trackOnboardingEvent(3, 'feedback_received', { score: parsedScore })
    } catch (err) {
      console.error('Practice submission error:', err)
      setError('Could not get feedback right now. You can still continue!')
      // Set a default score so they can proceed
      setScore(6)
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
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold
              ${score >= 7 ? 'bg-green-100 text-green-700' :
                score >= 5 ? 'bg-amber-100 text-amber-700' :
                'bg-slate-100 text-slate-600'
              }`}
            >
              <span className="text-lg">
                {score >= 7 ? '🎯' : score >= 5 ? '👍' : '💪'}
              </span>
              {score}/10 — {score >= 7 ? 'Great start!' : score >= 5 ? 'Solid foundation!' : 'Good effort!'}
            </div>
          </div>

          {/* Feedback text */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-4 shadow-sm">
            <p className="text-slate-600 leading-relaxed whitespace-pre-line text-sm">
              {feedback}
            </p>
          </div>

          {/* SBAR citation for nursing users */}
          {fromNursing && (
            <p className="text-xs text-slate-400 mb-4 px-1">
              💡 This feedback references the SBAR communication framework (Institute for Healthcare Improvement)
            </p>
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
