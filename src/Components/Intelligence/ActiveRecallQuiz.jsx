/**
 * ActiveRecallQuiz.jsx — Active recall quiz component for Learn section.
 * Phase 5, Sprint 3. D.R.A.F.T. protocol: NEW file.
 *
 * Supports 4 question types:
 *   - MCQ (Multiple Choice): 4 options, tap to select, instant feedback
 *   - T/F (True/False): 2 large buttons, instant feedback
 *   - Recall: Free text input, self-grading (Got it / Partially / Missed it)
 *   - Apply: Reflective prompt, no grading — just "Continue"
 *
 * Props:
 *   quiz       — Array of question objects from learningContent.js
 *   onComplete — Callback with final score (0-3)
 *   onBack     — Optional callback to exit quiz early
 */

import { useState, useCallback } from 'react'
import { CheckCircle2, XCircle, ChevronRight, Brain, Lightbulb, MessageSquare, PenLine } from 'lucide-react'

// ─── Question Type Icons ─────────────────────────────────────
const TYPE_CONFIG = {
  mcq: { icon: Brain, label: 'Multiple Choice', color: '#6366f1' },
  tf: { icon: Lightbulb, label: 'True or False', color: '#0ea5e9' },
  recall: { icon: PenLine, label: 'Recall', color: '#f59e0b' },
  apply: { icon: MessageSquare, label: 'Apply', color: '#10b981' },
}

// ─── MCQ Question ────────────────────────────────────────────
function MCQQuestion({ question, options, correctIndex, explanation, onAnswer }) {
  const [selected, setSelected] = useState(null)
  const [revealed, setRevealed] = useState(false)

  const handleSelect = (idx) => {
    if (revealed) return
    setSelected(idx)
    setRevealed(true)
    // Score: 1 if correct, 0 if wrong
    setTimeout(() => {
      onAnswer(idx === correctIndex ? 1 : 0)
    }, 2200)
  }

  return (
    <div>
      <p style={{ fontSize: '1.05rem', fontWeight: 600, color: '#1e293b', lineHeight: 1.5, marginBottom: '1rem' }}>
        {question}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        {options.map((opt, idx) => {
          const isCorrect = idx === correctIndex
          const isSelected = idx === selected
          let bg = '#f8fafc'
          let border = '2px solid #e2e8f0'
          let textColor = '#334155'

          if (revealed) {
            if (isCorrect) {
              bg = '#f0fdf4'
              border = '2px solid #22c55e'
              textColor = '#166534'
            } else if (isSelected && !isCorrect) {
              bg = '#fef2f2'
              border = '2px solid #ef4444'
              textColor = '#991b1b'
            } else {
              bg = '#f1f5f9'
              border = '2px solid #e2e8f0'
              textColor = '#94a3b8'
            }
          } else if (isSelected) {
            bg = '#eff6ff'
            border = '2px solid #3b82f6'
          }

          return (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              onTouchEnd={(e) => { e.preventDefault(); handleSelect(idx) }}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.85rem 1rem', borderRadius: '0.75rem',
                background: bg, border, cursor: revealed ? 'default' : 'pointer',
                textAlign: 'left', fontSize: '0.95rem', color: textColor,
                transition: 'all 0.2s ease', opacity: revealed && !isCorrect && !isSelected ? 0.6 : 1,
              }}
            >
              <span style={{
                width: '1.6rem', height: '1.6rem', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.75rem', fontWeight: 700, flexShrink: 0,
                background: revealed && isCorrect ? '#22c55e' : revealed && isSelected ? '#ef4444' : '#e2e8f0',
                color: revealed && (isCorrect || isSelected) ? '#fff' : '#64748b',
              }}>
                {revealed && isCorrect ? '✓' : revealed && isSelected && !isCorrect ? '✗' : String.fromCharCode(65 + idx)}
              </span>
              <span style={{ flex: 1 }}>{opt}</span>
            </button>
          )
        })}
      </div>

      {/* Explanation */}
      {revealed && explanation && (
        <div style={{
          marginTop: '1rem', padding: '0.85rem 1rem', borderRadius: '0.75rem',
          background: selected === correctIndex ? '#f0fdf4' : '#fefce8',
          border: `1px solid ${selected === correctIndex ? '#bbf7d0' : '#fef08a'}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            {selected === correctIndex
              ? <CheckCircle2 size={16} color="#22c55e" />
              : <XCircle size={16} color="#f59e0b" />
            }
            <span style={{ fontWeight: 600, fontSize: '0.85rem', color: selected === correctIndex ? '#166534' : '#854d0e' }}>
              {selected === correctIndex ? 'Correct!' : 'Not quite'}
            </span>
          </div>
          <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.5, margin: 0 }}>
            {explanation}
          </p>
        </div>
      )}
    </div>
  )
}

// ─── True/False Question ─────────────────────────────────────
function TFQuestion({ question, correctAnswer, explanation, onAnswer }) {
  const [selected, setSelected] = useState(null)
  const [revealed, setRevealed] = useState(false)

  const handleSelect = (val) => {
    if (revealed) return
    setSelected(val)
    setRevealed(true)
    setTimeout(() => {
      onAnswer(val === correctAnswer ? 1 : 0)
    }, 2200)
  }

  return (
    <div>
      <p style={{ fontSize: '1.05rem', fontWeight: 600, color: '#1e293b', lineHeight: 1.5, marginBottom: '1.25rem' }}>
        {question}
      </p>
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        {[true, false].map(val => {
          const isCorrect = val === correctAnswer
          const isSelected = val === selected
          let bg = '#f8fafc'
          let border = '2px solid #e2e8f0'
          let textColor = '#334155'

          if (revealed) {
            if (isCorrect) { bg = '#f0fdf4'; border = '2px solid #22c55e'; textColor = '#166534' }
            else if (isSelected) { bg = '#fef2f2'; border = '2px solid #ef4444'; textColor = '#991b1b' }
            else { textColor = '#94a3b8' }
          }

          return (
            <button
              key={String(val)}
              onClick={() => handleSelect(val)}
              onTouchEnd={(e) => { e.preventDefault(); handleSelect(val) }}
              style={{
                flex: 1, padding: '1.1rem', borderRadius: '0.75rem',
                background: bg, border, cursor: revealed ? 'default' : 'pointer',
                fontSize: '1.1rem', fontWeight: 700, color: textColor,
                transition: 'all 0.2s ease',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              }}
            >
              {revealed && isCorrect && <CheckCircle2 size={20} color="#22c55e" />}
              {revealed && isSelected && !isCorrect && <XCircle size={20} color="#ef4444" />}
              {val ? 'True' : 'False'}
            </button>
          )
        })}
      </div>

      {revealed && explanation && (
        <div style={{
          marginTop: '1rem', padding: '0.85rem 1rem', borderRadius: '0.75rem',
          background: selected === correctAnswer ? '#f0fdf4' : '#fefce8',
          border: `1px solid ${selected === correctAnswer ? '#bbf7d0' : '#fef08a'}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            {selected === correctAnswer
              ? <CheckCircle2 size={16} color="#22c55e" />
              : <XCircle size={16} color="#f59e0b" />
            }
            <span style={{ fontWeight: 600, fontSize: '0.85rem', color: selected === correctAnswer ? '#166534' : '#854d0e' }}>
              {selected === correctAnswer ? 'Correct!' : 'Not quite'}
            </span>
          </div>
          <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.5, margin: 0 }}>
            {explanation}
          </p>
        </div>
      )}
    </div>
  )
}

// ─── Recall Question (self-graded) ──────────────────────────
function RecallQuestion({ question, expectedAnswer, explanation, onAnswer }) {
  const [userText, setUserText] = useState('')
  const [showAnswer, setShowAnswer] = useState(false)
  const [graded, setGraded] = useState(false)

  const handleReveal = () => {
    setShowAnswer(true)
  }

  const handleGrade = (score) => {
    setGraded(true)
    setTimeout(() => onAnswer(score), 800)
  }

  return (
    <div>
      <p style={{ fontSize: '1.05rem', fontWeight: 600, color: '#1e293b', lineHeight: 1.5, marginBottom: '1rem' }}>
        {question}
      </p>

      {!showAnswer ? (
        <>
          <textarea
            value={userText}
            onChange={e => setUserText(e.target.value)}
            placeholder="Type your answer here..."
            style={{
              width: '100%', minHeight: '5rem', padding: '0.85rem',
              borderRadius: '0.75rem', border: '2px solid #e2e8f0',
              fontSize: '0.95rem', color: '#334155', resize: 'vertical',
              fontFamily: 'inherit', lineHeight: 1.5,
              background: '#f8fafc',
            }}
          />
          <button
            onClick={handleReveal}
            onTouchEnd={(e) => { e.preventDefault(); handleReveal() }}
            style={{
              marginTop: '0.75rem', width: '100%', padding: '0.85rem',
              borderRadius: '0.75rem', border: 'none',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: '#fff', fontSize: '0.95rem', fontWeight: 600,
              cursor: 'pointer', transition: 'opacity 0.2s',
            }}
          >
            Show Answer
          </button>
        </>
      ) : (
        <>
          {/* The expected answer */}
          <div style={{
            padding: '0.85rem 1rem', borderRadius: '0.75rem',
            background: '#f0fdf4', border: '1px solid #bbf7d0',
            marginBottom: '0.75rem',
          }}>
            <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#166534', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Expected Answer
            </p>
            <p style={{ fontSize: '0.92rem', color: '#334155', lineHeight: 1.5, margin: 0 }}>
              {expectedAnswer}
            </p>
          </div>

          {/* User's answer for reference */}
          {userText.trim() && (
            <div style={{
              padding: '0.85rem 1rem', borderRadius: '0.75rem',
              background: '#f8fafc', border: '1px solid #e2e8f0',
              marginBottom: '0.75rem',
            }}>
              <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Your Answer
              </p>
              <p style={{ fontSize: '0.92rem', color: '#475569', lineHeight: 1.5, margin: 0 }}>
                {userText}
              </p>
            </div>
          )}

          {explanation && (
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.85rem', fontStyle: 'italic' }}>
              {explanation}
            </p>
          )}

          {/* Self-grade buttons */}
          {!graded && (
            <div>
              <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>
                How did you do?
              </p>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {[
                  { label: 'Got it!', score: 1, bg: '#f0fdf4', border: '#22c55e', color: '#166534' },
                  { label: 'Partially', score: 0.5, bg: '#fefce8', border: '#f59e0b', color: '#854d0e' },
                  { label: 'Missed it', score: 0, bg: '#fef2f2', border: '#ef4444', color: '#991b1b' },
                ].map(opt => (
                  <button
                    key={opt.label}
                    onClick={() => handleGrade(opt.score)}
                    onTouchEnd={(e) => { e.preventDefault(); handleGrade(opt.score) }}
                    style={{
                      flex: 1, padding: '0.7rem 0.5rem', borderRadius: '0.6rem',
                      background: opt.bg, border: `2px solid ${opt.border}`,
                      color: opt.color, fontSize: '0.85rem', fontWeight: 600,
                      cursor: 'pointer', transition: 'all 0.2s',
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {graded && (
            <div style={{ textAlign: 'center', padding: '0.5rem 0', color: '#6366f1', fontWeight: 600, fontSize: '0.9rem' }}>
              Recorded! Moving on...
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ─── Apply Prompt (no grading) ───────────────────────────────
function ApplyQuestion({ question, explanation, onAnswer }) {
  const [reflected, setReflected] = useState(false)

  const handleContinue = () => {
    setReflected(true)
    setTimeout(() => onAnswer(1), 600) // Always gets credit
  }

  return (
    <div>
      <p style={{ fontSize: '1.05rem', fontWeight: 600, color: '#1e293b', lineHeight: 1.5, marginBottom: '0.75rem' }}>
        {question}
      </p>

      <div style={{
        padding: '1rem', borderRadius: '0.75rem',
        background: 'linear-gradient(135deg, #f0fdf4, #ecfdf5)',
        border: '1px solid #bbf7d0',
        marginBottom: '1rem',
      }}>
        <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.6, margin: 0 }}>
          💭 Take a moment to think about this. There's no right or wrong answer — this is about applying what you've learned to your own experience.
        </p>
        {explanation && (
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.5rem', margin: '0.5rem 0 0 0' }}>
            {explanation}
          </p>
        )}
      </div>

      {!reflected ? (
        <button
          onClick={handleContinue}
          onTouchEnd={(e) => { e.preventDefault(); handleContinue() }}
          style={{
            width: '100%', padding: '0.85rem', borderRadius: '0.75rem',
            border: 'none', background: 'linear-gradient(135deg, #10b981, #059669)',
            color: '#fff', fontSize: '0.95rem', fontWeight: 600,
            cursor: 'pointer', display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: '0.5rem',
          }}
        >
          I've thought about it <ChevronRight size={18} />
        </button>
      ) : (
        <div style={{ textAlign: 'center', padding: '0.5rem 0', color: '#10b981', fontWeight: 600, fontSize: '0.9rem' }}>
          Great reflection! Moving on...
        </div>
      )}
    </div>
  )
}

// ─── Main Quiz Container ─────────────────────────────────────
export default function ActiveRecallQuiz({ quiz = [], onComplete, onBack }) {
  const [currentIdx, setCurrentIdx] = useState(0)
  const [scores, setScores] = useState([])
  const [isComplete, setIsComplete] = useState(false)

  const totalQuestions = quiz.length
  const currentQ = quiz[currentIdx]

  const handleAnswer = useCallback((score) => {
    const newScores = [...scores, score]
    setScores(newScores)

    if (currentIdx + 1 >= totalQuestions) {
      // Quiz complete
      const totalScore = Math.round(newScores.reduce((sum, s) => sum + s, 0))
      setIsComplete(true)
      // Brief delay then call onComplete
      setTimeout(() => {
        if (onComplete) onComplete(totalScore)
      }, 300)
    } else {
      // Move to next question after brief pause
      setTimeout(() => {
        setCurrentIdx(prev => prev + 1)
      }, 500)
    }
  }, [scores, currentIdx, totalQuestions, onComplete])

  if (!quiz.length) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
        No quiz questions available.
      </div>
    )
  }

  if (isComplete) return null // Parent handles completion UI

  const typeConfig = TYPE_CONFIG[currentQ?.type] || TYPE_CONFIG.mcq
  const TypeIcon = typeConfig.icon

  return (
    <div style={{ padding: '0' }}>
      {/* Progress header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <TypeIcon size={18} color={typeConfig.color} />
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: typeConfig.color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {typeConfig.label}
          </span>
        </div>
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#94a3b8' }}>
          {currentIdx + 1} of {totalQuestions}
        </span>
      </div>

      {/* Progress dots */}
      <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '1.25rem' }}>
        {quiz.map((_, idx) => (
          <div
            key={idx}
            style={{
              flex: 1, height: '4px', borderRadius: '2px',
              background: idx < currentIdx
                ? (scores[idx] >= 1 ? '#22c55e' : scores[idx] > 0 ? '#f59e0b' : '#ef4444')
                : idx === currentIdx ? '#6366f1' : '#e2e8f0',
              transition: 'background 0.3s ease',
            }}
          />
        ))}
      </div>

      {/* Render the appropriate question type */}
      {currentQ.type === 'mcq' && (
        <MCQQuestion
          key={currentIdx}
          question={currentQ.question}
          options={currentQ.options}
          correctIndex={currentQ.correctIndex}
          explanation={currentQ.explanation}
          onAnswer={handleAnswer}
        />
      )}
      {currentQ.type === 'tf' && (
        <TFQuestion
          key={currentIdx}
          question={currentQ.question}
          correctAnswer={currentQ.correctAnswer}
          explanation={currentQ.explanation}
          onAnswer={handleAnswer}
        />
      )}
      {currentQ.type === 'recall' && (
        <RecallQuestion
          key={currentIdx}
          question={currentQ.question}
          expectedAnswer={currentQ.expectedAnswer}
          explanation={currentQ.explanation}
          onAnswer={handleAnswer}
        />
      )}
      {currentQ.type === 'apply' && (
        <ApplyQuestion
          key={currentIdx}
          question={currentQ.question}
          explanation={currentQ.explanation}
          onAnswer={handleAnswer}
        />
      )}
    </div>
  )
}
