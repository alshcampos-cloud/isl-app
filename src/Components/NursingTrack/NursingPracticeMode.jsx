// NursingTrack — Quick Practice Mode
// One question at a time. Type answer, get AI feedback with score. Rapid practice.
//
// Credit feature: 'nursingPractice' (free: 5/month, pro: unlimited)
// Uses C.O.A.C.H. protocol for AI evaluation.
// Charge-after-success pattern (Battle Scar #8).
//
// ⚠️ D.R.A.F.T. Protocol: NEW file. No existing code modified.

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Send, Loader2, Stethoscope, AlertCircle,
  CheckCircle, XCircle, Shuffle, ChevronRight, Target,
  RotateCcw, BookOpen, Mic, MicOff
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { getFrameworkDetails } from './nursingQuestions';
import useNursingQuestions from './useNursingQuestions';
import NursingLoadingSkeleton from './NursingLoadingSkeleton';
import { fetchWithRetry } from '../../utils/fetchWithRetry';
import { canUseFeature, incrementUsage } from '../../utils/creditSystem';
import { parseScoreFromResponse, stripScoreTag, scoreColor5, getCitationSource, validateNursingResponse } from './nursingUtils';
import { createPracticeSession } from './nursingSessionStore';
import useSpeechRecognition from './useSpeechRecognition';

// System prompt for quick practice — simpler than full interview
const PRACTICE_SYSTEM_PROMPT = (specialty, question) => {
  const framework = getFrameworkDetails(question.clinicalFramework);
  const frameworkContext = framework
    ? `\nRelevant framework: ${framework.name} — ${framework.description}\nSource: ${framework.source}`
    : '';

  const citationSource = getCitationSource(question);

  const isSBAR = question.responseFramework === 'sbar';
  const frameworkLabel = isSBAR ? 'SBAR' : 'STAR';

  const evalCriteria = isSBAR
    ? `Evaluate their SBAR structure:
- SITUATION: Did they state what's happening now?
- BACKGROUND: Relevant history and context?
- ASSESSMENT: Their clinical reasoning?
- RECOMMENDATION: Clear action/request?`
    : `Evaluate their STAR structure:
- SITUATION: Clear context setting?
- TASK: Their specific role/responsibility?
- ACTION: Concrete actions taken?
- RESULT: Measurable outcomes/impact?`;

  const bulletPoints = question.bullets?.length > 0
    ? `\nKEY POINTS this answer should cover:\n${question.bullets.map((b, i) => `${i + 1}. ${b}`).join('\n')}`
    : '';

  return `Nursing interview coach for ${specialty.shortName}. Question: "${question.question}" | Category: ${question.category} | Framework: ${frameworkLabel}${frameworkContext}${bulletPoints}

${evalCriteria}

RESPOND WITH ALL 4 SECTIONS BELOW. Every section is MANDATORY — do not skip any.

**Feedback:**
2-3 sentences on what they did well and what to improve. Be specific. Frame improvements as opportunities.

**${frameworkLabel} Breakdown:**
${isSBAR
  ? `- S (Situation): [What they said or "Missing"]
- B (Background): [What they said or "Missing"]
- A (Assessment): [What they said or "Missing"]
- R (Recommendation): [What they said or "Missing"]`
  : `- S (Situation): [What they said or "Missing"]
- T (Task): [What they said or "Missing"]
- A (Action): [What they said or "Missing"]
- R (Result): [What they said or "Missing"]`}

**Ideal Answer Approach:**
2-3 sentences on HOW to structure a strong answer. Do NOT invent clinical details.

**Resources to Review:**
${citationSource
  ? `📚 Cite this source: "${citationSource}" — one sentence on how it relates to this question.`
  : `📚 [Pick ONE from: SBAR Toolkit (IHI), TeamSTEPPS (AHRQ), NCSBN Clinical Judgment Model, ANA Code of Ethics, Joint Commission Safety Goals, CDC Infection Control] — one sentence why it helps.`}

[SCORE: X/5]

Rules: Coach communication ONLY. Never generate clinical content. Never patronizing.`;
};

export default function NursingPracticeMode({ specialty, onBack, userData, refreshUsage, addSession, startQuestionId = null }) {
  // Questions — loaded from Supabase (fallback: static), shuffled once loaded
  const { questions: rawQuestions, loading: questionsLoading } = useNursingQuestions(specialty.id);
  const [questions, setQuestions] = useState([]);
  const questionsShuffledRef = useRef(false);

  useEffect(() => {
    if (rawQuestions.length > 0 && !questionsShuffledRef.current) {
      const shuffled = [...rawQuestions].sort(() => Math.random() - 0.5);

      // If a specific question was requested (e.g., "Practice This" from Command Center),
      // move it to the front so the user sees it immediately
      if (startQuestionId) {
        const targetIdx = shuffled.findIndex(q => q.id === startQuestionId);
        if (targetIdx > 0) {
          const [target] = shuffled.splice(targetIdx, 1);
          shuffled.unshift(target);
        }
      }

      setQuestions(shuffled);
      questionsShuffledRef.current = true;
    }
  }, [rawQuestions, startQuestionId]);

  const [questionIndex, setQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState(null); // { text, score }
  const [validationFlags, setValidationFlags] = useState(null);
  const [error, setError] = useState(null);
  const [creditBlocked, setCreditBlocked] = useState(false);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [scoredCount, setScoredCount] = useState(0);

  const inputRef = useRef(null);

  // Speech recognition (Battle Scars #4-7)
  const {
    transcript: speechTranscript,
    isListening: micActive,
    isSupported: micSupported,
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
        { nursing_practice: userData.usage.nursingPractice?.used || 0 },
        userData.tier,
        'nursingPractice'
      );
      if (!check.allowed) setCreditBlocked(true);
    }
  }, [userData]);

  // Focus input when feedback clears
  useEffect(() => {
    if (!feedback && inputRef.current) inputRef.current.focus();
  }, [feedback]);

  // Submit answer for AI feedback
  const submitAnswer = useCallback(async () => {
    if (!userAnswer.trim() || isLoading || !currentQuestion) return;

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
            nursingFeature: 'nursingPractice',
            systemPrompt: PRACTICE_SYSTEM_PROMPT(specialty, currentQuestion),
            conversationHistory: [],
            userMessage: userAnswer.trim(),
          }),
        }
      );

      if (!response.ok) {
        const errText = await response.text();
        console.error('❌ Practice feedback error:', response.status, errText);
        throw new Error(`Feedback failed: ${response.status}`);
      }

      const data = await response.json();
      const rawContent = data.content?.[0]?.text || data.response || data.feedback || 'Good effort! Keep practicing.';

      const score = parseScoreFromResponse(rawContent);
      const cleanContent = stripScoreTag(rawContent);
      const validation = validateNursingResponse(rawContent, 'practice');

      setFeedback({ text: cleanContent, score });
      setValidationFlags(validation);
      setQuestionsAnswered(prev => prev + 1);
      if (score !== null) {
        setTotalScore(prev => prev + score);
        setScoredCount(prev => prev + 1);
      }

      // Report to Command Center session store
      if (addSession && currentQuestion) {
        addSession(createPracticeSession(
          currentQuestion.id,
          currentQuestion.question,
          currentQuestion.category,
          currentQuestion.responseFramework,
          score,
        ));
      }

      // CHARGE AFTER SUCCESS (Battle Scar #8)
      if (userData?.user?.id) {
        try {
          await incrementUsage(supabase, userData.user.id, 'nursingPractice');
          if (refreshUsage) refreshUsage();
          // Re-check credits after charge to catch hitting zero (prevents stale state bypass)
          const recheck = canUseFeature(
            { nursing_practice: (userData.usage.nursingPractice?.used || 0) + questionsAnswered + 1 },
            userData.tier,
            'nursingPractice'
          );
          if (!recheck.allowed) setCreditBlocked(true);
        } catch (chargeErr) {
          console.warn('⚠️ Practice usage increment failed (non-blocking):', chargeErr);
        }
      }
    } catch (err) {
      console.error('❌ Practice error:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [userAnswer, isLoading, currentQuestion, specialty, userData, refreshUsage]);

  // Next question
  const nextQuestion = useCallback(() => {
    const nextIdx = (questionIndex + 1) % questions.length;
    setQuestionIndex(nextIdx);
    setUserAnswer('');
    setFeedback(null);
    setValidationFlags(null);
    setError(null);
  }, [questionIndex, questions.length]);

  // Shuffle to random question
  const shuffleQuestion = useCallback(() => {
    let nextIdx;
    do {
      nextIdx = Math.floor(Math.random() * questions.length);
    } while (nextIdx === questionIndex && questions.length > 1);
    setQuestionIndex(nextIdx);
    setUserAnswer('');
    setFeedback(null);
    setValidationFlags(null);
    setError(null);
  }, [questionIndex, questions.length]);

  // Handle Enter
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !feedback) {
      e.preventDefault();
      submitAnswer();
    }
  };

  const creditInfo = userData?.usage?.nursingPractice;
  const isUnlimited = userData?.isBeta || userData?.tier === 'pro';
  const avgScore = scoredCount > 0 ? (totalScore / scoredCount).toFixed(1) : null;

  if (questionsLoading) return <NursingLoadingSkeleton title="Quick Practice" onBack={onBack} />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 flex flex-col">
      {/* Header */}
      <div className="bg-slate-900/80 backdrop-blur-lg border-b border-white/10 sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back</span>
          </button>

          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-sky-400" />
            <span className="text-white font-medium text-sm">Quick Practice</span>
            <span className="text-slate-500 text-xs">
              {questionIndex + 1}/{questions.length}
            </span>
          </div>

          {/* Session stats */}
          <div className="flex items-center gap-2 text-xs">
            {questionsAnswered > 0 && (
              <span className="text-slate-400">
                {questionsAnswered} done
                {avgScore && <span className={` ml-1 ${scoreColor5(parseFloat(avgScore))}`}>({avgScore})</span>}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-2xl mx-auto">
          {/* Credit info */}
          {creditBlocked && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-4 text-center">
              <p className="text-red-300 text-sm mb-2">
                You've used all {creditInfo?.limit} free practice sessions this month.
              </p>
              <a
                href="/app?upgrade=true&returnTo=/nursing"
                className="inline-block text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-sky-500 px-4 py-2 rounded-lg hover:-translate-y-0.5 transition-all"
              >
                Upgrade to Pro — Unlimited Practice
              </a>
            </div>
          )}

          {currentQuestion && (
            <>
              {/* Question Card */}
              <motion.div
                key={currentQuestion.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6"
              >
                {/* Tags */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    currentQuestion.responseFramework === 'sbar'
                      ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                      : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  }`}>
                    {currentQuestion.responseFramework === 'sbar' ? 'SBAR' : 'STAR'}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-slate-300">
                    {currentQuestion.category}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    currentQuestion.difficulty === 'advanced'
                      ? 'bg-red-500/10 text-red-300'
                      : currentQuestion.difficulty === 'intermediate'
                        ? 'bg-yellow-500/10 text-yellow-300'
                        : 'bg-green-500/10 text-green-300'
                  }`}>
                    {currentQuestion.difficulty}
                  </span>
                </div>

                {/* Question */}
                <h2 className="text-white text-lg font-semibold leading-relaxed">
                  {currentQuestion.question}
                </h2>

                {/* Framework citation */}
                {currentQuestion.clinicalFramework && (
                  <p className="text-slate-500 text-xs mt-3 italic">
                    Framework: {getFrameworkDetails(currentQuestion.clinicalFramework)?.name}
                  </p>
                )}
              </motion.div>

              {/* Answer Input or Feedback */}
              <AnimatePresence mode="wait">
                {!feedback ? (
                  <motion.div
                    key="input"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {micError && <p className="text-red-400 text-xs mb-2">{micError}</p>}
                    <div className="flex items-start gap-2 mb-4">
                      {micSupported && (
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
                        placeholder={micActive ? 'Listening... speak your answer' : `Type or tap mic to speak your ${currentQuestion.responseFramework === 'sbar' ? 'SBAR' : 'STAR'} answer...`}
                        rows={6}
                        disabled={creditBlocked || isLoading}
                        className={`flex-1 bg-white/10 border rounded-xl px-4 py-3 text-white text-sm placeholder-slate-500 resize-none focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/30 ${
                          micActive ? 'border-red-500/40' : 'border-white/10'
                        }`}
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => { if (micActive) stopMic(); clearSpeech(); submitAnswer(); }}
                        disabled={!userAnswer.trim() || isLoading || creditBlocked}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all ${
                          userAnswer.trim() && !isLoading && !creditBlocked
                            ? 'bg-gradient-to-r from-sky-600 to-cyan-500 text-white shadow-lg shadow-sky-500/30 hover:-translate-y-0.5'
                            : 'bg-white/10 text-white/30 cursor-not-allowed'
                        }`}
                      >
                        {isLoading ? (
                          <><Loader2 className="w-4 h-4 animate-spin" /> Evaluating...</>
                        ) : (
                          <><Send className="w-4 h-4" /> Submit Answer</>
                        )}
                      </button>

                      <button
                        onClick={shuffleQuestion}
                        className="p-3 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                        title="Random question"
                      >
                        <Shuffle className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="feedback"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {/* Score badge */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Stethoscope className="w-4 h-4 text-sky-400" />
                        <span className="text-white font-medium text-sm">Feedback</span>
                      </div>
                      <div className={`text-lg font-bold ${scoreColor5(feedback.score)}`}>
                        {feedback.score !== null ? `${feedback.score}/5` : 'Unscored'}
                      </div>
                    </div>

                    {/* Walled garden warning */}
                    {validationFlags?.walledGardenFlag && (
                      <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-2 mb-3 flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                        <p className="text-amber-300 text-xs">
                          This response may contain clinical guidance. Always verify with your facility protocols.
                        </p>
                      </div>
                    )}

                    {/* Feedback text — parse structured sections */}
                    {(() => {
                      const text = feedback.text || '';
                      const frameworkLabel = currentQuestion.responseFramework === 'sbar' ? 'SBAR' : 'STAR';

                      // Parse sections — use section-header-aware lookaheads (not just **)
                      const sectionPattern = /\*\*(?:Feedback|(?:STAR|SBAR) Breakdown|Ideal Answer Approach|Resources to Review):\*\*/;
                      const feedbackMatch = text.match(/\*\*Feedback:\*\*([\s\S]*?)(?=\*\*(?:STAR|SBAR) Breakdown:\*\*|\*\*Ideal Answer|\*\*Resources to Review|\[SCORE|$)/);
                      const breakdownMatch = text.match(/\*\*(?:STAR|SBAR) Breakdown:\*\*([\s\S]*?)(?=\*\*Ideal Answer Approach:\*\*|\*\*Resources to Review|\[SCORE|$)/);
                      const idealMatch = text.match(/\*\*Ideal Answer Approach:\*\*([\s\S]*?)(?=\*\*Resources to Review:\*\*|\[SCORE|$)/);
                      const resourceMatch = text.match(/\*\*Resources to Review:\*\*([\s\S]*?)(?=\[SCORE|$)/);

                      const hasSections = feedbackMatch || breakdownMatch;

                      return hasSections ? (
                        <div className="space-y-3 mb-4">
                          {/* Main feedback */}
                          {feedbackMatch && (
                            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                              <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">
                                {feedbackMatch[1].trim()}
                              </p>
                            </div>
                          )}

                          {/* Framework breakdown */}
                          {breakdownMatch && (
                            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                              <p className="text-white text-xs font-semibold mb-2 flex items-center gap-1">
                                <Target className="w-3 h-3 text-sky-400" /> {frameworkLabel} Breakdown
                              </p>
                              <div className="space-y-2">
                                {breakdownMatch[1].trim().split('\n').filter(l => l.trim().startsWith('-')).map((line, i) => {
                                  const clean = line.replace(/^-\s*/, '').trim();
                                  const letterMatch = clean.match(/^([SBARTU])\s*\(([^)]+)\):\s*(.*)/);
                                  const isMissing = clean.toLowerCase().includes('missing');
                                  return (
                                    <div key={i} className="flex items-start gap-2">
                                      <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${isMissing ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300'}`}>
                                        {letterMatch ? letterMatch[1] : '•'}
                                      </span>
                                      <span className={`text-xs leading-relaxed ${isMissing ? 'text-red-300/80' : 'text-slate-300'}`}>
                                        {letterMatch ? `${letterMatch[2]}: ${letterMatch[3]}` : clean}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* Ideal answer approach */}
                          {idealMatch && (
                            <div className="bg-purple-500/10 border border-purple-400/20 rounded-xl p-4">
                              <p className="text-purple-300 text-xs font-semibold mb-2">💡 Ideal Answer Approach</p>
                              <p className="text-purple-300/80 text-xs leading-relaxed whitespace-pre-wrap">
                                {idealMatch[1].trim()}
                              </p>
                            </div>
                          )}

                          {/* Resource recommendation — strip markdown bold markers */}
                          {resourceMatch && (
                            <div className="bg-amber-500/10 border border-amber-400/20 rounded-xl p-3">
                              <p className="text-amber-300 text-xs leading-relaxed whitespace-pre-wrap">
                                {resourceMatch[1].trim().replace(/\*\*/g, '')}
                              </p>
                            </div>
                          )}
                        </div>
                      ) : (
                        /* Fallback: raw text if structured parsing fails */
                        <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-4">
                          <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">
                            {text}
                          </p>
                        </div>
                      );
                    })()}

                    {/* Key points from question library */}
                    {currentQuestion.bullets?.length > 0 && (
                      <div className="bg-sky-500/10 border border-sky-400/20 rounded-xl p-4 mb-4">
                        <p className="text-sky-300 text-xs font-medium mb-2 flex items-center gap-1">
                          <BookOpen className="w-3 h-3" /> Key points to hit:
                        </p>
                        <div className="space-y-1">
                          {currentQuestion.bullets.map((b, i) => (
                            <p key={i} className="text-sky-300/70 text-xs">• {b}</p>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => { setUserAnswer(''); setFeedback(null); setValidationFlags(null); }}
                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white/10 border border-white/20 text-white font-semibold text-sm hover:bg-white/20 transition-all"
                      >
                        <RotateCcw className="w-4 h-4" /> Try Again
                      </button>
                      <button
                        onClick={nextQuestion}
                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-500 text-white font-semibold text-sm shadow-lg shadow-sky-500/30 hover:-translate-y-0.5 transition-all"
                      >
                        Next Question <ChevronRight className="w-4 h-4" />
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
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-slate-900/95 border-t border-white/10 px-4 py-3">
        <p className="text-slate-600 text-xs text-center">
          AI coaches your communication and delivery • Clinical content reviewed by nursing professionals
        </p>
      </div>
    </div>
  );
}
