/**
 * LearnSection.jsx — Duolingo-style course map for interview learning path.
 * Phase 5, Sprint 5. D.R.A.F.T. protocol: NEW file.
 *
 * Shows 4 modules × 5 lessons each = 20 lessons.
 * Modules unlock progressively (complete Module N to unlock N+1).
 * Daily goal: complete 1 lesson per day.
 * Stars earned from active recall quizzes (0-3 per lesson).
 *
 * Props:
 *   onBack       — Return to home screen
 *   userTier     — For HD audio gating + lesson limits
 *   onUpgrade    — Open pricing/upgrade flow
 *   onStreakUpdate — Callback to update streak in parent
 *   supabase     — Supabase client (for streak updates)
 *   userId       — Auth user ID (for streak updates)
 */

import { useState, useCallback, useEffect } from 'react'
import {
  ArrowLeft, Star, Lock, CheckCircle2, ChevronRight,
  BookOpen, Trophy, Flame, Target, Sparkles
} from 'lucide-react'
import { LEARNING_MODULES, getLessonById, getNextLesson } from '../../utils/learningContent'
import {
  getProgress, completeLesson, isModuleUnlocked,
  getModuleProgress, getOverallProgress, getNextUncompletedLesson,
  checkLessonLimit
} from '../../utils/learningProgress'
import LessonPlayer from './LessonPlayer'

// Module color themes
const MODULE_COLORS = {
  1: { gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)', bg: '#ede9fe', border: '#c4b5fd', text: '#5b21b6' },
  2: { gradient: 'linear-gradient(135deg, #0ea5e9, #06b6d4)', bg: '#e0f2fe', border: '#7dd3fc', text: '#0369a1' },
  3: { gradient: 'linear-gradient(135deg, #f59e0b, #f97316)', bg: '#fef3c7', border: '#fcd34d', text: '#b45309' },
  4: { gradient: 'linear-gradient(135deg, #10b981, #059669)', bg: '#d1fae5', border: '#6ee7b7', text: '#047857' },
}

export default function LearnSection({
  onBack,
  userTier = 'free',
  onUpgrade,
  onStreakUpdate,
  supabase,
  userId,
}) {
  const [activeLessonId, setActiveLessonId] = useState(null)
  const [progress, setProgress] = useState(() => getProgress())
  const [expandedModule, setExpandedModule] = useState(null)

  // Refresh progress when returning from lesson
  const refreshProgress = useCallback(() => {
    setProgress(getProgress())
  }, [])

  // Check lesson limit for tier gating
  const lessonLimit = checkLessonLimit(userTier)

  // Overall progress
  const overall = getOverallProgress(LEARNING_MODULES)
  const nextLesson = getNextUncompletedLesson(LEARNING_MODULES)

  // Auto-expand the module containing the next lesson
  useEffect(() => {
    if (nextLesson && expandedModule === null) {
      setExpandedModule(nextLesson.moduleId)
    }
  }, [nextLesson, expandedModule])

  // ─── Lesson completion handler ─────────────────────────────
  const handleLessonComplete = useCallback((score) => {
    if (!activeLessonId) return

    const nextLessonData = getNextLesson(activeLessonId)
    const nextId = nextLessonData?.id || null
    const result = completeLesson(activeLessonId, score, nextId)

    // Update streak via Supabase (fire-and-forget, Battle Scar #8)
    if (result.isNewCompletion && supabase && userId) {
      import('../../utils/streakSupabase').then(({ updateStreakAfterSession }) => {
        updateStreakAfterSession(supabase, userId).then(streakResult => {
          if (streakResult && onStreakUpdate) {
            onStreakUpdate(streakResult)
          }
        }).catch(() => {})
      }).catch(() => {})
    }

    setActiveLessonId(null)
    refreshProgress()
  }, [activeLessonId, supabase, userId, onStreakUpdate, refreshProgress])

  // ─── If a lesson is active, show the player ────────────────
  if (activeLessonId) {
    const lessonData = getLessonById(activeLessonId)
    const lesson = lessonData?.lesson || lessonData
    const moduleNum = parseInt(activeLessonId.split('-')[0], 10)
    const module = lessonData?.module || LEARNING_MODULES.find(m => m.id === moduleNum)
    const lessonIdx = module?.lessons.findIndex(l => l.id === activeLessonId) ?? 0

    return (
      <LessonPlayer
        lesson={lesson}
        moduleTitle={module?.title || ''}
        lessonNumber={`${lessonIdx + 1} of ${module?.lessons.length || 5}`}
        onComplete={handleLessonComplete}
        onBack={() => { setActiveLessonId(null); refreshProgress() }}
        userTier={userTier}
      />
    )
  }

  // ─── Main course map view ──────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* Header */}
      <div style={{
        padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem',
        background: '#fff', borderBottom: '1px solid #e2e8f0',
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <button
          onClick={onBack}
          onTouchEnd={(e) => { e.preventDefault(); onBack?.() }}
          style={{ padding: '0.5rem', background: '#f1f5f9', border: 'none', borderRadius: '0.75rem', color: '#475569', cursor: 'pointer' }}
        >
          <ArrowLeft size={20} />
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>
            Learn
          </h1>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>
            Master interview skills step by step
          </p>
        </div>

        {/* Streak badge */}
        {progress.dailyGoalMet && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.3rem',
            padding: '0.3rem 0.7rem', borderRadius: '1rem',
            background: '#fef3c7', border: '1px solid #fcd34d',
          }}>
            <Flame size={14} color="#f59e0b" />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#b45309' }}>
              Goal Met!
            </span>
          </div>
        )}
      </div>

      <div style={{ padding: '1rem', maxWidth: '32rem', margin: '0 auto' }}>
        {/* ─── Overall Progress / Welcome Card ─────────────────── */}
        {overall.completedLessons === 0 ? (
          <div style={{
            padding: '1.25rem', borderRadius: '1rem',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            color: '#fff', marginBottom: '1rem',
            boxShadow: '0 4px 16px rgba(99,102,241,0.25)',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎓</div>
            <p style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 0.4rem' }}>
              Your Interview Masterclass
            </p>
            <p style={{ fontSize: '0.85rem', opacity: 0.85, margin: '0 0 1rem', lineHeight: 1.5 }}>
              20 bite-sized audio lessons with quizzes and daily goals. Learn the STAR method, handle curveballs, and nail your interview.
            </p>
            <button
              onClick={() => setActiveLessonId('1-1')}
              onTouchEnd={(e) => { e.preventDefault(); setActiveLessonId('1-1') }}
              style={{
                padding: '0.7rem 1.5rem', borderRadius: '0.75rem',
                background: '#fff', border: 'none', color: '#6366f1',
                fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                transition: 'transform 0.2s ease',
              }}
            >
              Start Your First Lesson →
            </button>
            <p style={{ fontSize: '0.7rem', opacity: 0.6, marginTop: '0.6rem', margin: '0.6rem 0 0' }}>
              ~4 min per lesson • Audio + Quiz • Track your stars
            </p>
          </div>
        ) : (
          <div style={{
            padding: '1rem 1.25rem', borderRadius: '1rem',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            color: '#fff', marginBottom: '1rem',
            boxShadow: '0 4px 16px rgba(99,102,241,0.25)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
              <div>
                <p style={{ fontSize: '0.8rem', opacity: 0.8, margin: '0 0 0.15rem' }}>Your Progress</p>
                <p style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0 }}>
                  {overall.completedLessons}/{overall.totalLessons} lessons
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', justifyContent: 'flex-end' }}>
                  <Star size={16} color="#fbbf24" fill="#fbbf24" />
                  <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                    {overall.totalStars}
                  </span>
                </div>
                <p style={{ fontSize: '0.7rem', opacity: 0.7, margin: 0 }}>
                  of {overall.maxStars} stars
                </p>
              </div>
            </div>

            {/* Progress bar */}
            <div style={{
              height: '6px', borderRadius: '3px',
              background: 'rgba(255,255,255,0.2)', overflow: 'hidden',
            }}>
              <div style={{
                width: `${overall.percentComplete}%`, height: '100%',
                background: '#fff', borderRadius: '3px',
                transition: 'width 0.5s ease',
              }} />
            </div>
            <p style={{ fontSize: '0.75rem', opacity: 0.7, marginTop: '0.4rem', textAlign: 'right', margin: '0.4rem 0 0' }}>
              {overall.percentComplete}% complete
            </p>
          </div>
        )}

        {/* ─── Daily Goal Card ───────────────────────────────── */}
        <div style={{
          padding: '0.85rem 1rem', borderRadius: '0.75rem',
          background: progress.dailyGoalMet ? '#f0fdf4' : '#fff',
          border: `1px solid ${progress.dailyGoalMet ? '#bbf7d0' : '#e2e8f0'}`,
          marginBottom: '1rem',
          display: 'flex', alignItems: 'center', gap: '0.75rem',
        }}>
          <div style={{
            width: '2.5rem', height: '2.5rem', borderRadius: '50%',
            background: progress.dailyGoalMet ? '#22c55e' : '#e2e8f0',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {progress.dailyGoalMet
              ? <CheckCircle2 size={20} color="#fff" />
              : <Target size={20} color="#94a3b8" />
            }
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '0.9rem', fontWeight: 600, color: progress.dailyGoalMet ? '#166534' : '#1e293b', margin: 0 }}>
              {progress.dailyGoalMet ? 'Daily Goal Complete!' : 'Daily Goal: Complete 1 Lesson'}
            </p>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>
              {progress.dailyGoalMet
                ? 'Great job! Come back tomorrow to keep your streak going.'
                : 'Finish one lesson to hit your daily target'
              }
            </p>
          </div>
        </div>

        {/* ─── Tier Limit Warning ────────────────────────────── */}
        {!lessonLimit.canAccess && (
          <div style={{
            padding: '1rem', borderRadius: '0.75rem',
            background: '#fef3c7', border: '1px solid #fcd34d',
            marginBottom: '1rem',
          }}>
            <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#b45309', margin: '0 0 0.3rem' }}>
              Monthly lesson limit reached ({lessonLimit.used}/{lessonLimit.limit})
            </p>
            <p style={{ fontSize: '0.8rem', color: '#92400e', margin: '0 0 0.5rem' }}>
              Upgrade for unlimited access to all lessons.
            </p>
            {onUpgrade && (
              <button
                onClick={onUpgrade}
                onTouchEnd={(e) => { e.preventDefault(); onUpgrade?.() }}
                style={{
                  padding: '0.5rem 1rem', borderRadius: '0.6rem',
                  background: '#f59e0b', border: 'none', color: '#fff',
                  fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
                }}
              >
                Upgrade Now
              </button>
            )}
          </div>
        )}

        {/* ─── Next Lesson Quick Action ──────────────────────── */}
        {nextLesson && lessonLimit.canAccess && (
          <button
            onClick={() => setActiveLessonId(nextLesson.lessonId)}
            onTouchEnd={(e) => { e.preventDefault(); setActiveLessonId(nextLesson.lessonId) }}
            style={{
              width: '100%', padding: '0.85rem 1rem', borderRadius: '0.75rem',
              background: '#fff', border: '2px solid #6366f1',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem',
              marginBottom: '1.25rem',
              transition: 'all 0.2s ease',
            }}
          >
            <div style={{
              width: '2.5rem', height: '2.5rem', borderRadius: '0.6rem',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Sparkles size={18} color="#fff" />
            </div>
            <div style={{ flex: 1, textAlign: 'left' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6366f1', margin: 0 }}>
                CONTINUE LEARNING
              </p>
              <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1e293b', margin: 0 }}>
                {nextLesson.title}
              </p>
            </div>
            <ChevronRight size={20} color="#6366f1" />
          </button>
        )}

        {/* ─── Module Cards ──────────────────────────────────── */}
        {LEARNING_MODULES.map((mod) => {
          const colors = MODULE_COLORS[mod.id] || MODULE_COLORS[1]
          const modProgress = getModuleProgress(mod.id, LEARNING_MODULES)
          const unlocked = isModuleUnlocked(mod.id, LEARNING_MODULES)
          const isExpanded = expandedModule === mod.id
          const isComplete = modProgress.completed === modProgress.total

          return (
            <div
              key={mod.id}
              style={{
                marginBottom: '0.75rem', borderRadius: '1rem',
                background: unlocked ? '#fff' : '#f8fafc',
                border: `1px solid ${unlocked ? '#e2e8f0' : '#f1f5f9'}`,
                opacity: unlocked ? 1 : 0.6,
                overflow: 'hidden',
                transition: 'all 0.2s ease',
              }}
            >
              {/* Module header */}
              <button
                onClick={() => unlocked && setExpandedModule(isExpanded ? null : mod.id)}
                onTouchEnd={(e) => { e.preventDefault(); unlocked && setExpandedModule(isExpanded ? null : mod.id) }}
                style={{
                  width: '100%', padding: '1rem', border: 'none',
                  background: 'transparent', cursor: unlocked ? 'pointer' : 'default',
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  textAlign: 'left',
                }}
              >
                <div style={{
                  width: '2.75rem', height: '2.75rem', borderRadius: '0.75rem',
                  background: unlocked ? colors.gradient : '#e2e8f0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.3rem', flexShrink: 0,
                }}>
                  {unlocked ? mod.icon : <Lock size={18} color="#94a3b8" />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: unlocked ? '#1e293b' : '#94a3b8', margin: 0 }}>
                      {mod.title}
                    </h3>
                    {isComplete && <CheckCircle2 size={16} color="#22c55e" />}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.25rem' }}>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                      {modProgress.completed}/{modProgress.total} lessons
                    </span>
                    {modProgress.stars > 0 && (
                      <span style={{ fontSize: '0.75rem', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        <Star size={12} fill="#f59e0b" color="#f59e0b" />
                        {modProgress.stars}/{modProgress.maxStars}
                      </span>
                    )}
                  </div>

                  {/* Mini progress bar */}
                  {unlocked && (
                    <div style={{
                      height: '4px', borderRadius: '2px', marginTop: '0.5rem',
                      background: '#f1f5f9', overflow: 'hidden',
                    }}>
                      <div style={{
                        width: `${modProgress.total > 0 ? (modProgress.completed / modProgress.total) * 100 : 0}%`,
                        height: '100%', borderRadius: '2px',
                        background: colors.gradient,
                        transition: 'width 0.5s ease',
                      }} />
                    </div>
                  )}
                </div>

                {unlocked && (
                  <ChevronRight
                    size={20}
                    color="#94a3b8"
                    style={{
                      transition: 'transform 0.2s',
                      transform: isExpanded ? 'rotate(90deg)' : 'none',
                    }}
                  />
                )}
              </button>

              {/* Expanded lesson list */}
              {isExpanded && unlocked && (
                <div style={{ padding: '0 1rem 1rem' }}>
                  {!unlocked && (
                    <p style={{ fontSize: '0.8rem', color: '#94a3b8', textAlign: 'center', padding: '0.5rem 0' }}>
                      Complete Module {mod.id - 1} to unlock
                    </p>
                  )}

                  {mod.lessons.map((lesson, idx) => {
                    const completed = !!progress.lessonsCompleted[lesson.id]
                    const score = progress.lessonsCompleted[lesson.id]?.score ?? 0
                    const isNext = nextLesson?.lessonId === lesson.id
                    const canStart = lessonLimit.canAccess

                    return (
                      <button
                        key={lesson.id}
                        onClick={() => canStart && setActiveLessonId(lesson.id)}
                        onTouchEnd={(e) => { e.preventDefault(); canStart && setActiveLessonId(lesson.id) }}
                        disabled={!canStart && !completed}
                        style={{
                          width: '100%', padding: '0.75rem',
                          borderRadius: '0.6rem', border: 'none',
                          background: isNext ? colors.bg : completed ? '#f8fafc' : 'transparent',
                          cursor: canStart || completed ? 'pointer' : 'default',
                          display: 'flex', alignItems: 'center', gap: '0.75rem',
                          marginBottom: '0.35rem', textAlign: 'left',
                          transition: 'background 0.2s',
                          opacity: (!canStart && !completed) ? 0.5 : 1,
                        }}
                      >
                        {/* Lesson number / status */}
                        <div style={{
                          width: '2rem', height: '2rem', borderRadius: '50%',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0,
                          background: completed ? '#22c55e'
                            : isNext ? colors.gradient
                            : '#e2e8f0',
                          color: completed || isNext ? '#fff' : '#94a3b8',
                          fontSize: '0.8rem', fontWeight: 700,
                        }}>
                          {completed ? <CheckCircle2 size={14} /> : idx + 1}
                        </div>

                        {/* Lesson info */}
                        <div style={{ flex: 1 }}>
                          <p style={{
                            fontSize: '0.88rem', fontWeight: isNext ? 700 : 500,
                            color: isNext ? colors.text : completed ? '#475569' : '#64748b',
                            margin: 0,
                          }}>
                            {lesson.title}
                          </p>
                          <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: 0 }}>
                            ~{lesson.duration || '3-5'} min
                          </p>
                        </div>

                        {/* Stars for completed */}
                        {completed && (
                          <div style={{ display: 'flex', gap: '0.15rem' }}>
                            {[1, 2, 3].map(i => (
                              <Star
                                key={i}
                                size={14}
                                color={i <= score ? '#f59e0b' : '#d1d5db'}
                                fill={i <= score ? '#f59e0b' : 'none'}
                              />
                            ))}
                          </div>
                        )}

                        {/* "Start" indicator for next lesson */}
                        {isNext && !completed && (
                          <span style={{
                            fontSize: '0.72rem', fontWeight: 700, color: colors.text,
                            background: `${colors.bg}`,
                            padding: '0.2rem 0.5rem', borderRadius: '0.4rem',
                          }}>
                            START
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}

        {/* ─── Bottom Quick Actions ──────────────────────────── */}
        {overall.completedLessons > 0 && (
          <div style={{
            padding: '1rem', borderRadius: '0.75rem',
            background: '#fff', border: '1px solid #e2e8f0',
            marginTop: '0.5rem', marginBottom: '2rem',
          }}>
            <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
              Quick Actions
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <button
                onClick={() => {
                  // Find first completed lesson to replay
                  const firstCompleted = Object.keys(progress.lessonsCompleted)[0]
                  if (firstCompleted) setActiveLessonId(firstCompleted)
                }}
                onTouchEnd={(e) => {
                  e.preventDefault()
                  const firstCompleted = Object.keys(progress.lessonsCompleted)[0]
                  if (firstCompleted) setActiveLessonId(firstCompleted)
                }}
                style={{
                  width: '100%', padding: '0.6rem 0.8rem', borderRadius: '0.5rem',
                  background: '#f8fafc', border: '1px solid #e2e8f0',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem',
                  color: '#475569', fontSize: '0.85rem',
                }}
              >
                <BookOpen size={16} color="#6366f1" /> Review completed lessons
              </button>
            </div>
          </div>
        )}

        {/* All complete celebration */}
        {overall.completedLessons === overall.totalLessons && overall.totalLessons > 0 && (
          <div style={{
            padding: '1.5rem', borderRadius: '1rem', textAlign: 'center',
            background: 'linear-gradient(135deg, #f0fdf4, #ecfdf5)',
            border: '1px solid #bbf7d0',
            marginBottom: '2rem',
          }}>
            <Trophy size={40} color="#f59e0b" style={{ margin: '0 auto 0.75rem' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#166534', margin: '0 0 0.3rem' }}>
              Course Complete!
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#475569', margin: 0 }}>
              You've mastered all 20 lessons. You're ready to ace your interview!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
