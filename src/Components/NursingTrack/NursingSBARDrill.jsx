// NursingTrack — SBAR Communication Drill
// THE DIFFERENTIATOR. Rapid-fire SBAR component drill with per-component scoring.
// Situation, Background, Assessment, Recommendation — each scored 1-10.
// Optional timed mode (90 seconds per question).
//
// Credit feature: 'nursingSbar' (free: 3/month, pro: unlimited — separate pool)
// Uses C.O.A.C.H. protocol. Charge-after-success (Battle Scar #8).
//
// ⚠️ D.R.A.F.T. Protocol: NEW file. No existing code modified.

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Send, Loader2, Stethoscope, AlertCircle,
  CheckCircle, XCircle, ChevronRight, Timer, TimerOff,
  RotateCcw, Zap, BarChart3, Mic, MicOff
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { getFrameworkDetails } from './nursingQuestions';
import useNursingQuestions from './useNursingQuestions';
import NursingLoadingSkeleton from './NursingLoadingSkeleton';
import { fetchWithRetry } from '../../utils/fetchWithRetry';
import { canUseFeature, incrementUsage } from '../../utils/creditSystem';
import { parseSBARScores, stripSBARScoreTags, scoreColor10, scoreBg10, getCitationSource, validateNursingResponse } from './nursingUtils';
import { createSBARDrillSession } from './nursingSessionStore';
import useSpeechRecognition from './useSpeechRecognition';
import SpeechUnavailableWarning from '../SpeechUnavailableWarning';

const TIMER_SECONDS = 90;

// System prompt for SBAR drill — per-component scoring
const SBAR_DRILL_PROMPT = (specialty, question) => {
  const framework = getFrameworkDetails(question.clinicalFramework);
  const frameworkContext = framework
    ? `\nFramework: ${framework.name} — ${framework.description}\nSource: ${framework.source}`
    : '';
  const citationSource = getCitationSource(question);
  const citationLine = citationSource ? `\nSource material: ${citationSource}` : '';

  return `You are a nursing interview coach running an SBAR communication drill for a ${specialty.shortName} nurse.

The scenario question is:
"${question.question}"
Category: ${question.category}${frameworkContext}${citationLine}

The candidate just gave their SBAR-structured response. Score EACH component individually on a scale of 1-10:

SITUATION (1-10): Did they clearly state what is happening RIGHT NOW with the patient? Specific, concise, no excessive background.
BACKGROUND (1-10): Did they provide relevant clinical history, pertinent findings, and context that informs the current situation?
ASSESSMENT (1-10): Did they share their clinical reasoning — what they believe is occurring and why?
RECOMMENDATION (1-10): Did they state a clear recommendation, specific action taken or requested, with follow-up plan?

Give brief feedback (2-3 sentences per component). Label each section with S:, B:, A:, R: for parsing, but your coaching MUST follow this critical rule:

⚠️ NATURAL DELIVERY RULE: Experienced nurses deliver SBAR fluidly — the components flow naturally without announcing each section. NEVER coach the user to say phrases like "The situation is…", "The background is…", "My assessment is…", or "My recommendation is…". These labeled introductions sound like a student reciting a framework, NOT a confident professional communicating with a colleague. Instead, reward responses that weave SBAR elements naturally. For example, a strong Situation sounds like "I'm calling about Mrs. Chen in bed 4 — she's developed new-onset tachycardia at 130" NOT "The situation is that the patient has tachycardia." If their response already flows naturally, praise that specifically.

SCORING ANCHOR: Score each component based on its CONTENT quality (specificity, relevance, completeness) as defined above. Natural, fluid delivery is a sign of proficiency — note it positively but do NOT add or subtract points for delivery style alone. A response with labeled headers ("S: ..., B: ...") that has strong content should still score well on content, with a coaching note about natural delivery. A response that flows naturally but is vague should score lower on content.

- S: [feedback on Situation component]
- B: [feedback on Background component]
- A: [feedback on Assessment component]
- R: [feedback on Recommendation component]

Then a one-sentence overall tip.

CRITICAL: End with EXACTLY these score tags (each on its own line):
[S-SCORE: X/10]
[B-SCORE: X/10]
[A-SCORE: X/10]
[R-SCORE: X/10]

WALLED GARDEN: NEVER evaluate clinical accuracy. Coach communication structure ONLY.
TONE: Constructive, encouraging, never patronizing.`;
};

const SBAR_COMPONENTS = [
  { key: 'situation', label: 'S', fullLabel: 'Situation', color: 'sky', description: 'What is happening right now?' },
  { key: 'background', label: 'B', fullLabel: 'Background', color: 'blue', description: 'Relevant history and context' },
  { key: 'assessment', label: 'A', fullLabel: 'Assessment', color: 'cyan', description: 'Your clinical reasoning' },
  { key: 'recommendation', label: 'R', fullLabel: 'Recommendation', color: 'teal', description: 'Clear action or request' },
];

export default function NursingSBARDrill({ specialty, onBack, userData, refreshUsage, addSession }) {
  // Questions — loaded from Supabase (fallback: static), filtered to SBAR only, shuffled once
  const { questions: rawQuestions, loading: questionsLoading } = useNursingQuestions(specialty.id);
  const [questions, setQuestions] = useState([]);
  const questionsShuffledRef = useRef(false);

  useEffect(() => {
    if (rawQuestions.length > 0 && !questionsShuffledRef.current) {
      const sbarQs = rawQuestions.filter(q => q.responseFramework === 'sbar');
      setQuestions([...sbarQs].sort(() => Math.random() - 0.5));
      questionsShuffledRef.current = true;
    }
  }, [rawQuestions]);

  const [questionIndex, setQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState(null); // { text, scores: { situation, background, assessment, recommendation } }
  const [validationFlags, setValidationFlags] = useState(null);
  const [error, setError] = useState(null);
  const [creditBlocked, setCreditBlocked] = useState(false);

  // Timer
  const [timedMode, setTimedMode] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(TIMER_SECONDS);
  const [timerActive, setTimerActive] = useState(false);
  const timerRef = useRef(null);

  // Session tracking
  const [drillResults, setDrillResults] = useState([]); // Array of { questionId, scores }
  const [drillComplete, setDrillComplete] = useState(false);

  const inputRef = useRef(null);

  // Speech recognition (Battle Scars #4-7)
  const {
    transcript: speechTranscript,
    isListening: micActive,
    hasReliableSpeech,
    startSession: startMic,
    stopSession: stopMic,
    clearTranscript: clearSpeech,
    error: micError,
  } = useSpeechRecognition();

  // Sync speech → answer field
  useEffect(() => {
    if (micActive && speechTranscript) {
      setUserAnswer(speechTranscript);
    }
  }, [speechTranscript, micActive]);

  const currentQuestion = questions[questionIndex] || null;

  // Credit check
  useEffect(() => {
    if (userData && !userData.loading && userData.usage) {
      const check = canUseFeature(
        { nursing_sbar: userData.usage.nursingSbar?.used || 0 },
        userData.tier,
        'nursingSbar'
      );
      if (!check.allowed) setCreditBlocked(true);
    }
  }, [userData]);

  // Timer logic
  useEffect(() => {
    if (timerActive && timeRemaining > 0) {
      timerRef.current = setTimeout(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
    } else if (timerActive && timeRemaining === 0) {
      // Auto-submit on time expiry
      setTimerActive(false);
      if (userAnswer.trim()) {
        submitAnswer();
      }
    }
    return () => clearTimeout(timerRef.current);
  }, [timerActive, timeRemaining]);

  // Start timer when showing a new question in timed mode
  useEffect(() => {
    if (timedMode && !feedback && currentQuestion) {
      setTimeRemaining(TIMER_SECONDS);
      setTimerActive(true);
    }
    return () => setTimerActive(false);
  }, [questionIndex, timedMode, feedback]);

  // Submit answer
  const submitAnswer = useCallback(async () => {
    if (!userAnswer.trim() || isLoading || !currentQuestion) return;

    setTimerActive(false);
    setIsLoading(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetchWithRetry(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-feedback`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            mode: 'nursing-coach',
            nursingFeature: 'nursingSbar',
            systemPrompt: SBAR_DRILL_PROMPT(specialty, currentQuestion),
            conversationHistory: [],
            userMessage: userAnswer.trim(),
          }),
        }
      );

      if (!response.ok) {
        console.error('❌ SBAR drill error:', response.status);
        throw new Error(`Feedback failed: ${response.status}`);
      }

      const data = await response.json();
      const rawContent = data.content?.[0]?.text || data.response || data.feedback || '';

      const scores = parseSBARScores(rawContent);
      const cleanContent = stripSBARScoreTags(rawContent);
      const validation = validateNursingResponse(rawContent, 'sbar');

      setFeedback({ text: cleanContent, scores });
      setValidationFlags(validation);

      // Track result
      setDrillResults(prev => [...prev, {
        questionId: currentQuestion.id,
        question: currentQuestion.question,
        scores,
      }]);

      // Report to Command Center session store
      if (addSession && currentQuestion) {
        addSession(createSBARDrillSession(
          currentQuestion.id,
          currentQuestion.question,
          currentQuestion.category,
          scores,
        ));
      }

      // CHARGE AFTER SUCCESS
      if (userData?.user?.id) {
        try {
          await incrementUsage(supabase, userData.user.id, 'nursingSbar');
          if (refreshUsage) refreshUsage();
          // Re-check credits after charge to catch hitting zero
          const recheck = canUseFeature(
            { nursing_sbar: (userData.usage.nursingSbar?.used || 0) + drillResults.length + 1 },
            userData.tier,
            'nursingSbar'
          );
          if (!recheck.allowed) setCreditBlocked(true);
        } catch (chargeErr) {
          console.warn('⚠️ SBAR drill usage increment failed:', chargeErr);
        }
      }
    } catch (err) {
      console.error('❌ SBAR drill error:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [userAnswer, isLoading, currentQuestion, specialty, userData, refreshUsage]);

  // Next question
  const nextQuestion = useCallback(() => {
    const nextIdx = questionIndex + 1;
    if (nextIdx < questions.length) {
      setQuestionIndex(nextIdx);
      setUserAnswer('');
      setFeedback(null);
      setValidationFlags(null);
      setError(null);
    } else {
      setDrillComplete(true);
    }
  }, [questionIndex, questions.length]);

  // Handle Enter
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !feedback) {
      e.preventDefault();
      submitAnswer();
    }
  };

  // ============================================================
  // DRILL COMPLETE: Summary
  // ============================================================
  if (drillComplete && drillResults.length > 0) {
    // Compute per-component averages
    const avgScores = SBAR_COMPONENTS.map(comp => {
      const scored = drillResults.filter(r => r.scores[comp.key] !== null);
      return {
        ...comp,
        avg: scored.length > 0
          ? (scored.reduce((sum, r) => sum + r.scores[comp.key], 0) / scored.length).toFixed(1)
          : null,
        count: scored.length,
      };
    });

    const weakest = avgScores
      .filter(c => c.avg !== null)
      .sort((a, b) => parseFloat(a.avg) - parseFloat(b.avg))[0];

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900">
        <div className="bg-slate-900/80 backdrop-blur-lg border-b border-white/10 sticky top-0 z-30">
          <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
            <button onClick={onBack}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" /><span className="text-sm">Dashboard</span>
            </button>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-sky-400" />
              <span className="text-white font-medium text-sm">SBAR Drill Summary</span>
            </div>
            <div className="w-16" />
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 py-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <div className="text-5xl mb-3">🩺</div>
            <h1 className="text-2xl font-bold text-white mb-2">SBAR Drill Complete</h1>
            <p className="text-slate-400 text-sm">{drillResults.length} scenario{drillResults.length !== 1 ? 's' : ''} practiced</p>
          </motion.div>

          {/* Per-component scores */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            {avgScores.map(comp => (
              <motion.div key={comp.key}
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                className="bg-white/5 border border-white/10 rounded-xl p-4 text-center"
              >
                <div className="text-green-400 text-xs font-bold mb-1">{comp.fullLabel}</div>
                <div className={`text-2xl font-bold ${comp.avg !== null ? scoreColor10(parseFloat(comp.avg)) : 'text-slate-500'}`}>
                  {comp.avg !== null ? comp.avg : '--'}
                </div>
                <div className="text-slate-500 text-xs mt-1">/ 10</div>
              </motion.div>
            ))}
          </div>

          {/* Weakest component callout */}
          {weakest && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-6">
              <p className="text-amber-300 text-sm font-medium mb-1">Focus area: {weakest.fullLabel}</p>
              <p className="text-amber-300/70 text-xs">{weakest.description} — this component scored lowest. Practice structuring this part of your SBAR responses.</p>
            </div>
          )}

          {/* Per-question breakdown */}
          <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-sky-400" /> All Scenarios
          </h3>
          <div className="space-y-2 mb-8">
            {drillResults.map((result, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-3">
                <p className="text-white text-xs mb-2 truncate">{result.question}</p>
                <div className="flex gap-2">
                  {SBAR_COMPONENTS.map(comp => (
                    <div key={comp.key} className={`flex-1 text-center py-1 rounded-lg text-xs font-medium ${scoreBg10(result.scores[comp.key])}`}>
                      <span className="text-slate-400">{comp.label}:</span>{' '}
                      <span className={scoreColor10(result.scores[comp.key])}>
                        {result.scores[comp.key] !== null ? result.scores[comp.key] : '-'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button onClick={() => { setDrillResults([]); setDrillComplete(false); setQuestionIndex(0); setUserAnswer(''); setFeedback(null); setValidationFlags(null); }}
              className="flex-1 bg-gradient-to-r from-sky-600 to-cyan-500 text-white font-semibold py-3 rounded-xl shadow-lg shadow-sky-500/30 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2">
              <RotateCcw className="w-4 h-4" /> Drill Again
            </button>
            <button onClick={onBack}
              className="flex-1 bg-white/10 border border-white/20 text-white font-semibold py-3 rounded-xl hover:bg-white/20 transition-all flex items-center justify-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // ACTIVE DRILL
  // ============================================================
  if (questionsLoading) return <NursingLoadingSkeleton title="SBAR Drill" onBack={onBack} />;

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-slate-400">No SBAR questions available for {specialty.shortName}.</p>
          <button onClick={onBack}
            className="mt-4 text-sky-400 hover:text-sky-300 text-sm">← Back to Dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 flex flex-col">
      {/* Header */}
      <div className="bg-slate-900/80 backdrop-blur-lg border-b border-white/10 sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={onBack}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" /><span className="text-sm">Back</span>
          </button>

          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-green-400" />
            <span className="text-white font-medium text-sm">SBAR Drill</span>
            <span className="text-slate-500 text-xs">{questionIndex + 1}/{questions.length}</span>
            <span className="bg-green-500/20 text-green-300 text-xs px-1.5 py-0.5 rounded-full border border-green-500/30">SBAR</span>
          </div>

          {/* Timer toggle */}
          <button
            onClick={() => setTimedMode(prev => !prev)}
            className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full transition-colors ${
              timedMode ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            {timedMode ? <Timer className="w-3 h-3" /> : <TimerOff className="w-3 h-3" />}
            {timedMode ? `${timeRemaining}s` : 'Timer'}
          </button>
        </div>
      </div>

      {/* Timer bar */}
      {timedMode && timerActive && (
        <div className="h-1 bg-white/5">
          <motion.div
            className={`h-full ${timeRemaining <= 15 ? 'bg-red-500' : 'bg-sky-500'}`}
            initial={{ width: '100%' }}
            animate={{ width: `${(timeRemaining / TIMER_SECONDS) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-2xl mx-auto">
          {/* Credit block */}
          {creditBlocked && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-4 text-center">
              <p className="text-red-300 text-sm mb-2">Free practice limit reached this month.</p>
              <a
                href="/app?upgrade=true&returnTo=/nursing"
                className="inline-block text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-sky-500 px-4 py-2 rounded-lg hover:-translate-y-0.5 transition-all"
              >
                Upgrade to Pro — Unlimited Drills
              </a>
            </div>
          )}

          {/* Scenario Card */}
          <motion.div key={currentQuestion.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-slate-300">{currentQuestion.category}</span>
              {currentQuestion.clinicalFramework && (
                <span className="text-xs text-slate-500 italic">
                  {getFrameworkDetails(currentQuestion.clinicalFramework)?.name}
                </span>
              )}
            </div>
            <h2 className="text-white text-lg font-semibold leading-relaxed">{currentQuestion.question}</h2>
          </motion.div>

          {/* SBAR structure hint */}
          {!feedback && (
            <div className="grid grid-cols-4 gap-2 mb-4">
              {SBAR_COMPONENTS.map(comp => (
                <div key={comp.key} className="bg-green-500/5 border border-green-500/10 rounded-lg p-2 text-center">
                  <div className="text-green-400 text-xs font-bold">{comp.label}</div>
                  <div className="text-slate-500 text-[10px] mt-0.5">{comp.description}</div>
                </div>
              ))}
            </div>
          )}

          <AnimatePresence mode="wait">
            {!feedback ? (
              <motion.div key="input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {micError && <p className="text-red-400 text-xs mb-2">{micError}</p>}
                <SpeechUnavailableWarning variant="inline" darkMode />
                <div className="flex items-start gap-2 mb-4">
                  {hasReliableSpeech && (
                    <button
                      onClick={async () => {
                        if (micActive) { stopMic(); } else { clearSpeech(); await startMic(); }
                      }}
                      onTouchEnd={async (e) => {
                        e.preventDefault();
                        if (micActive) { stopMic(); } else { clearSpeech(); await startMic(); }
                      }}
                      className={`p-3 rounded-xl transition-all flex-shrink-0 mt-0.5 ${
                        micActive
                          ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 animate-pulse'
                          : 'bg-white/10 text-white/50 hover:text-white hover:bg-white/20'
                      }`}
                      title={micActive ? 'Stop microphone' : 'Start microphone'}
                    >
                      {micActive ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    </button>
                  )}
                  <textarea
                    ref={inputRef}
                    value={userAnswer}
                    onChange={(e) => {
                      setUserAnswer(e.target.value);
                      if (micActive) stopMic();
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder={micActive ? 'Listening... speak your SBAR response' : 'Give your response naturally — cover the situation, relevant background, your assessment, and what you recommend. No need to label each section.'}
                    rows={8}
                    disabled={creditBlocked || isLoading}
                    className={`flex-1 bg-white/10 border rounded-xl px-4 py-3 text-white text-sm placeholder-slate-500 resize-none focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/30 ${
                      micActive ? 'border-red-500/40' : 'border-white/10'
                    }`}
                  />
                </div>

                <button
                  onClick={() => { if (micActive) stopMic(); clearSpeech(); submitAnswer(); }}
                  disabled={!userAnswer.trim() || isLoading || creditBlocked}
                  className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all ${
                    userAnswer.trim() && !isLoading && !creditBlocked
                      ? 'bg-gradient-to-r from-green-600 to-emerald-500 text-white shadow-lg shadow-green-500/30 hover:-translate-y-0.5'
                      : 'bg-white/10 text-white/30 cursor-not-allowed'
                  }`}
                >
                  {isLoading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Scoring SBAR...</>
                  ) : (
                    <><Send className="w-4 h-4" /> Submit SBAR Response</>
                  )}
                </button>
              </motion.div>
            ) : (
              <motion.div key="feedback" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                {/* Per-component score bars */}
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {SBAR_COMPONENTS.map(comp => {
                    const score = feedback.scores[comp.key];
                    return (
                      <div key={comp.key} className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                        <div className="text-green-400 text-xs font-bold mb-1">{comp.fullLabel}</div>
                        <div className={`text-xl font-bold ${scoreColor10(score)}`}>
                          {score !== null ? score : '-'}
                        </div>
                        <div className="text-slate-500 text-[10px]">/ 10</div>
                        {/* Score bar */}
                        <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              score === null ? 'bg-slate-600' :
                              score >= 8 ? 'bg-green-500' :
                              score >= 6 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: score !== null ? `${score * 10}%` : '0%' }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* User's submitted answer */}
                {userAnswer && (
                  <div className="bg-slate-800/50 border border-white/10 rounded-xl p-4 mb-3">
                    <p className="text-slate-400 text-xs font-medium mb-2">Your Response:</p>
                    <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                      {userAnswer}
                    </p>
                  </div>
                )}

                {/* Walled garden warning */}
                {validationFlags?.walledGardenFlag && (
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-2 mb-3 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                    <p className="text-amber-300 text-xs">
                      This response may contain clinical guidance. Always verify with your facility protocols.
                    </p>
                  </div>
                )}

                {/* Feedback text */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-4">
                  <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">{feedback.text}</p>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => { setUserAnswer(''); setFeedback(null); setValidationFlags(null); }}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white/10 border border-white/20 text-white font-semibold text-sm hover:bg-white/20 transition-all"
                  >
                    <RotateCcw className="w-4 h-4" /> Retry
                  </button>
                  <button
                    onClick={nextQuestion}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-500 text-white font-semibold text-sm shadow-lg shadow-green-500/30 hover:-translate-y-0.5 transition-all"
                  >
                    {questionIndex + 1 < questions.length ? (
                      <>Next Scenario <ChevronRight className="w-4 h-4" /></>
                    ) : (
                      <>Finish Drill <CheckCircle className="w-4 h-4" /></>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error */}
          {error && (
            <div className="mt-4 bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span className="text-red-300 text-sm">{error}</span>
              <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-300">
                <XCircle className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-slate-900/95 border-t border-white/10 px-4 py-3">
        <p className="text-slate-600 text-xs text-center">
          AI scores your SBAR communication structure • Clinical content reviewed by nursing professionals
        </p>
      </div>
    </div>
  );
}
