/**
 * InterviewDayMode.jsx — Special calming mode for interview day.
 * Phase 4I: Confidence boost, quick review, breathing exercise.
 *
 * Props:
 *   onBack, practiceHistory, questions, getUserContext
 */

import { useState, useMemo, useRef, useEffect } from 'react';
import { ArrowLeft, Star, BookOpen, Wind, Heart, Sparkles, MessageSquare } from 'lucide-react';

const getScore = (s) => s.feedback?.overall ?? (s.feedback?.match_percentage != null ? s.feedback.match_percentage / 10 : null);

const POWER_PHRASES = [
  { phrase: "In my experience, I've found that...", context: "Leading into a STAR story" },
  { phrase: "One specific example that comes to mind is...", context: "Transitioning to concrete evidence" },
  { phrase: "The result was...", context: "Driving home the impact" },
  { phrase: "What I learned from that experience was...", context: "Showing growth and reflection" },
  { phrase: "I'm excited about this role because...", context: "Connecting your experience to the opportunity" },
];

function InterviewDayMode({ onBack, practiceHistory = [], questions = [], getUserContext }) {
  const [showBreathing, setShowBreathing] = useState(false);
  const [breathPhase, setBreathPhase] = useState('idle');
  const [breathCycle, setBreathCycle] = useState(0);

  const ctx = useMemo(() => getUserContext ? getUserContext() : {}, [getUserContext]);

  // Load saved stories from localStorage for quick reference
  const stories = useMemo(() => {
    try {
      const raw = localStorage.getItem('isl_stories');
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.slice(0, 3);
    } catch {
      return [];
    }
  }, []);

  const stats = useMemo(() => {
    const scored = practiceHistory.filter(s => getScore(s) !== null);
    const totalSessions = practiceHistory.length;
    const avgScore = scored.length > 0
      ? (scored.reduce((sum, s) => sum + getScore(s), 0) / scored.length).toFixed(1)
      : '0.0';
    const uniqueQuestions = new Set(practiceHistory.map(s => s.question)).size;

    // Top 3 weakest questions
    const questionScores = {};
    scored.forEach(s => {
      if (!questionScores[s.question]) questionScores[s.question] = [];
      questionScores[s.question].push(getScore(s));
    });
    const weakest = Object.entries(questionScores)
      .map(([q, scores]) => ({ question: q, avg: scores.reduce((a, b) => a + b, 0) / scores.length, attempts: scores.length }))
      .sort((a, b) => a.avg - b.avg)
      .slice(0, 3);

    // Strongest category
    const catScores = {};
    scored.forEach(s => {
      const q = questions.find(q => q.question === s.question);
      const cat = q?.category || 'General';
      if (!catScores[cat]) catScores[cat] = [];
      catScores[cat].push(getScore(s));
    });
    const strongest = Object.entries(catScores)
      .map(([cat, scores]) => ({ cat, avg: scores.reduce((a, b) => a + b, 0) / scores.length }))
      .sort((a, b) => b.avg - a.avg)[0];

    return { totalSessions, avgScore, uniqueQuestions, weakest, strongest };
  }, [practiceHistory, questions]);

  const breathTimerRef = useRef(null);
  const breathCancelledRef = useRef(false);

  // Cleanup breathing timer on unmount
  useEffect(() => {
    return () => {
      breathCancelledRef.current = true;
      if (breathTimerRef.current) clearTimeout(breathTimerRef.current);
    };
  }, []);

  const startBreathing = () => {
    // Cancel any existing breathing timer chain before starting new one
    breathCancelledRef.current = true;
    if (breathTimerRef.current) clearTimeout(breathTimerRef.current);
    breathCancelledRef.current = false;
    setShowBreathing(true);
    setBreathPhase('inhale');
    setBreathCycle(1);
    let count = 0;
    const phases = ['inhale', 'hold', 'exhale', 'rest'];
    const durations = [4000, 4000, 4000, 2000]; // 4-4-4-2 breathing
    const cycle = () => {
      if (breathCancelledRef.current) return; // Stop if cancelled by re-start or unmount
      const phase = phases[count % 4];
      setBreathPhase(phase);
      setBreathCycle(Math.floor(count / 4) + 1);
      count++;
      if (count < 16) { // 4 full cycles
        breathTimerRef.current = setTimeout(cycle, durations[(count - 1) % 4]);
      } else {
        setBreathPhase('done');
        setBreathCycle(4);
      }
    };
    breathTimerRef.current = setTimeout(cycle, 4000);
  };

  const breathPhaseLabel = {
    inhale: 'Inhale 4s',
    hold: 'Hold 4s',
    exhale: 'Exhale 4s',
    rest: 'Rest 2s',
    done: 'Complete',
    idle: '',
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-900 via-teal-800 to-emerald-900 text-white">
      {/* Header */}
      <div className="px-4 py-4 flex items-center gap-3">
        <button onClick={onBack} aria-label="Go back" className="p-2 hover:bg-white/10 rounded-xl transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold">Interview Day</h1>
          {ctx.targetCompany && ctx.targetRole && <p className="text-sm text-white/70">{ctx.targetRole} at {ctx.targetCompany}</p>}
        </div>
      </div>

      <div className="px-4 py-6 max-w-2xl mx-auto space-y-6">
        {/* Confidence Boost */}
        <div className="bg-white/10 backdrop-blur rounded-2xl p-6 text-center">
          <Heart className="w-10 h-10 text-pink-300 mx-auto mb-3" />
          <h2 className="text-2xl font-black mb-3">You&apos;re Ready</h2>
          <p className="text-white/80 leading-relaxed">
            {stats.totalSessions > 0 ? (
              <>
                You&apos;ve practiced <strong>{stats.totalSessions} times</strong> across{' '}
                <strong>{stats.uniqueQuestions} unique questions</strong>.
                Your average score is <strong>{stats.avgScore}/10</strong>.
                {stats.strongest && (
                  <> Your strongest area is <strong>{stats.strongest.cat}</strong>.</>
                )}
                {' '}Trust your preparation.
              </>
            ) : (
              <>
                Today is the day. Take a deep breath.
                You know more than you think you do. Be yourself, tell your stories, and show them what you bring.
              </>
            )}
          </p>
        </div>

        {/* Gentle guidance when no practice data at all */}
        {stats.totalSessions === 0 && stories.length === 0 && (
          <div className="bg-white/10 backdrop-blur rounded-2xl p-5 text-center">
            <Sparkles className="w-8 h-8 text-teal-300 mx-auto mb-2" />
            <p className="text-sm text-white/70 leading-relaxed">
              Even without practice sessions, you&apos;re here and that matters.
              Use the breathing exercise below to center yourself, and review the power phrases at the bottom.
            </p>
          </div>
        )}

        {/* Key Stories to Remember */}
        {stories.length > 0 && (
          <div className="bg-white/10 backdrop-blur rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-yellow-300" />
              <h3 className="font-bold">Key Stories to Remember</h3>
            </div>
            <p className="text-xs text-white/50 mb-3">Your prepared stories — quick refresher before you go in</p>
            <div className="space-y-2">
              {stories.map((story, i) => (
                <div key={story.id || i} className="bg-white/5 rounded-lg p-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-white/90">
                      {story.title || `Story ${i + 1}`}
                    </p>
                    {story.rating && (
                      <span className="text-xs bg-yellow-400/20 text-yellow-300 px-2 py-0.5 rounded-full whitespace-nowrap">
                        {story.rating}/10
                      </span>
                    )}
                  </div>
                  {story.skills && story.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {(Array.isArray(story.skills) ? story.skills : [story.skills]).slice(0, 4).map((skill, j) => (
                        <span key={j} className="text-xs bg-teal-400/15 text-teal-200 px-2 py-0.5 rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                  {story.summary && (
                    <p className="text-xs text-white/50 mt-1.5 line-clamp-2">{story.summary}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Review — Top 3 weakest */}
        {stats.weakest.length > 0 && (
          <div className="bg-white/10 backdrop-blur rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-5 h-5 text-amber-300" />
              <h3 className="font-bold">Quick Review — Top 3 to Revisit</h3>
            </div>
            <div className="space-y-2">
              {stats.weakest.map((q, i) => (
                <div key={i} className="bg-white/5 rounded-lg p-3">
                  <p className="text-sm text-white/90 line-clamp-2">{q.question}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-white/60">
                    <span>Avg: {q.avg.toFixed(1)}/10</span>
                    <span>Practiced {q.attempts}x</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Breathing Exercise */}
        <div className="bg-white/10 backdrop-blur rounded-2xl p-5 text-center">
          <Wind className="w-8 h-8 text-sky-300 mx-auto mb-2" />
          <h3 className="font-bold mb-2">Calm Your Nerves</h3>
          {!showBreathing ? (
            <>
              <p className="text-xs text-white/50 mb-3">4 cycles of box breathing to center yourself</p>
              <button
                onClick={startBreathing}
                className="px-6 py-2.5 bg-white/20 hover:bg-white/30 rounded-xl font-semibold transition-all"
              >
                Start 4-4-4 Breathing
              </button>
            </>
          ) : (
            <div className="py-4">
              {/* Phase labels row */}
              <div className="flex justify-center gap-2 mb-4">
                {['inhale', 'hold', 'exhale', 'rest'].map((p) => (
                  <span
                    key={p}
                    className={`text-xs px-2.5 py-1 rounded-full transition-all duration-500 ${
                      breathPhase === p
                        ? 'bg-white/25 text-white font-bold scale-110'
                        : 'bg-white/5 text-white/40'
                    }`}
                  >
                    {breathPhaseLabel[p]}
                  </span>
                ))}
              </div>

              {/* Animated circle */}
              <div className="relative w-32 h-32 mx-auto mb-3">
                {/* Outer ring pulse */}
                <div className={`absolute inset-0 rounded-full transition-all duration-1000 ${
                  breathPhase === 'inhale' ? 'bg-sky-400/15 scale-150' :
                  breathPhase === 'hold' ? 'bg-purple-400/15 scale-150' :
                  breathPhase === 'exhale' ? 'bg-teal-400/15 scale-100' :
                  breathPhase === 'done' ? 'bg-emerald-400/10 scale-110' :
                  'bg-white/5 scale-100'
                }`} />
                {/* Inner circle */}
                <div className={`absolute inset-2 rounded-full flex items-center justify-center text-xl font-bold transition-all duration-1000 ${
                  breathPhase === 'inhale' ? 'bg-sky-400/40 scale-125' :
                  breathPhase === 'hold' ? 'bg-purple-400/40 scale-125' :
                  breathPhase === 'exhale' ? 'bg-teal-400/40 scale-75' :
                  breathPhase === 'done' ? 'bg-emerald-400/40 scale-100' :
                  'bg-white/20 scale-100'
                }`}>
                  {breathPhase === 'inhale' ? 'Breathe In' :
                   breathPhase === 'hold' ? 'Hold' :
                   breathPhase === 'exhale' ? 'Breathe Out' :
                   breathPhase === 'done' ? 'Done' : 'Ready'}
                </div>
              </div>

              {/* Cycle counter */}
              <div className="flex justify-center gap-1.5 mt-2">
                {[1, 2, 3, 4].map((c) => (
                  <div
                    key={c}
                    className={`w-2 h-2 rounded-full transition-all duration-500 ${
                      breathPhase === 'done'
                        ? 'bg-emerald-400'
                        : c < breathCycle
                          ? 'bg-sky-400'
                          : c === breathCycle
                            ? 'bg-white animate-pulse'
                            : 'bg-white/20'
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-white/40 mt-2">
                {breathPhase === 'done' ? 'All 4 cycles complete' : `Cycle ${breathCycle} of 4`}
              </p>
              {breathPhase === 'done' && (
                <button
                  onClick={startBreathing}
                  className="mt-3 text-xs text-white/50 hover:text-white/70 underline"
                >
                  Restart breathing
                </button>
              )}
            </div>
          )}
        </div>

        {/* Quick Cheat Sheet — Story Bullets */}
        {stories.length > 0 && (
          <div className="bg-white/10 backdrop-blur rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-5 h-5 text-emerald-300" />
              <h3 className="font-bold">Quick Cheat Sheet</h3>
            </div>
            <p className="text-xs text-white/50 mb-3">STAR bullets for your top stories — glance before you walk in</p>
            <div className="space-y-3">
              {stories.map((story, i) => (
                <div key={story.id || i} className="bg-white/5 rounded-lg p-3">
                  <p className="text-sm font-bold text-white/90 mb-1.5">{story.title || `Story ${i + 1}`}</p>
                  <div className="space-y-1 text-xs text-white/70">
                    {story.situation && <p><span className="text-sky-300 font-bold">S:</span> {story.situation.length > 80 ? story.situation.slice(0, 80) + '...' : story.situation}</p>}
                    {story.task && <p><span className="text-purple-300 font-bold">T:</span> {story.task.length > 80 ? story.task.slice(0, 80) + '...' : story.task}</p>}
                    {story.actions && (Array.isArray(story.actions) ? story.actions.filter(Boolean) : [story.actions]).length > 0 && (() => {
                      const firstAction = Array.isArray(story.actions) ? story.actions.filter(Boolean)[0] : story.actions;
                      return firstAction ? <p><span className="text-amber-300 font-bold">A:</span> {firstAction.length > 80 ? firstAction.slice(0, 80) + '...' : firstAction}</p> : null;
                    })()}
                    {story.result && <p><span className="text-emerald-300 font-bold">R:</span> {story.result.length > 80 ? story.result.slice(0, 80) + '...' : story.result}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Power Phrases */}
        <div className="bg-white/10 backdrop-blur rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare className="w-5 h-5 text-violet-300" />
            <h3 className="font-bold">Power Phrases</h3>
          </div>
          <p className="text-xs text-white/50 mb-3">Keep these in your back pocket during the interview</p>
          <div className="space-y-2">
            {POWER_PHRASES.map((item, i) => (
              <div key={i} className="bg-white/5 rounded-lg p-3">
                <p className="text-sm text-white/90 font-medium italic">&ldquo;{item.phrase}&rdquo;</p>
                <p className="text-xs text-white/45 mt-1">{item.context}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Final encouragement */}
        <div className="text-center pt-4 pb-8">
          <Star className="w-8 h-8 text-yellow-300 mx-auto mb-2" />
          <p className="text-lg font-bold">You&apos;ve got this.</p>
          <p className="text-sm text-white/60 mt-1">Be yourself. Tell your stories. Show them what you bring.</p>
        </div>
      </div>
    </div>
  );
}

export default InterviewDayMode;
