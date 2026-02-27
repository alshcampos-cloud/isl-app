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
  CheckCircle, XCircle, Shuffle, ChevronRight, ChevronDown, Target,
  RotateCcw, BookOpen, Mic, MicOff, Save, User
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { getFrameworkDetails } from './nursingQuestions';
import useNursingQuestions from './useNursingQuestions';
import NursingLoadingSkeleton from './NursingLoadingSkeleton';
import { fetchWithRetry } from '../../utils/fetchWithRetry';
import { canUseFeature, incrementUsage } from '../../utils/creditSystem';
import { updateStreakAfterSession } from '../../utils/streakSupabase';
import { parseScoreFromResponse, stripScoreTag, scoreColor5, getCitationSource, validateNursingResponse } from './nursingUtils';
import { trackBeginPractice } from '../../utils/googleAdsTracking';
import { createPracticeSession } from './nursingSessionStore';
import { upsertSavedAnswer } from './nursingSupabase';
import useSpeechRecognition from './useSpeechRecognition';
import SpeechUnavailableWarning from '../SpeechUnavailableWarning';
import { buildSelfEfficacyPrompt } from '../../utils/selfEfficacyFeedback';

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

  // Detect theory/knowledge questions vs behavioral
  const isTheoryQuestion = /^(How do you|What is your|Describe your|What steps|What factors|What approach|How would you|What do you consider)/i.test(question.question);

  return `Nursing interview coach for ${specialty.shortName}. Question: "${question.question}" | Category: ${question.category} | Framework: ${frameworkLabel}${frameworkContext}${bulletPoints}

QUESTION TYPE: ${isTheoryQuestion ? 'THEORY/KNOWLEDGE — This asks about approach/methodology, NOT a specific past experience. Do NOT penalize for missing ' + frameworkLabel + ' structure. Evaluate clarity of reasoning, specificity of methodology, and evidence of real-world application instead.' : 'BEHAVIORAL — Evaluate using ' + frameworkLabel + ' structure.'}

${isTheoryQuestion ? `Evaluate their response for:
1. Clarity of reasoning — Is their approach well-explained?
2. Specificity — Do they describe concrete steps/methods, or just vague platitudes?
3. Real-world grounding — Do they reference actual experience or protocols?
4. Completeness — Did they address all parts of the question?` : evalCriteria}

RESULT EVALUATION — When assessing Results:
Accept ALL of these as valid: measurable outcomes (numbers, timelines), patient/team outcomes, closure and reflection ("I learned...", "I believe..."), values-based conclusions, and process improvements. Do NOT mark Result as "Incomplete" just because it lacks hard numbers.

RESPOND WITH ALL 4 SECTIONS BELOW. Every section is MANDATORY — do not skip any.

**Feedback:**
2-3 sentences on what they did well and what to improve. Be specific and genuine — match your praise to the actual quality of their answer. If the answer is weak, acknowledge what they got right but be honest about what needs work. If the answer is strong, say why specifically. Never say "Great work" for a weak answer.

**${isTheoryQuestion ? 'Approach' : frameworkLabel} Breakdown:**
${isTheoryQuestion
  ? `- Reasoning: [How well did they explain their approach?]
- Specificity: [Did they give concrete steps or stay vague?]
- Application: [Did they ground it in real experience?]
- Completeness: [Did they address the full question?]`
  : isSBAR
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
  ? `📚 "${citationSource}" — one sentence on how it relates to this question. Include the URL if it's one of these: APIC (apic.org), AWHONN (awhonn.org), ENA (ena.org), ANA (nursingworld.org), NCSBN (ncsbn.org), BCEN (bcen.org), AACN (aacn.org), CDC (cdc.gov), IHI (ihi.org), Joint Commission (jointcommission.org), AHRQ (ahrq.gov).`
  : `📚 [Pick ONE from: SBAR Toolkit — ihi.org, TeamSTEPPS — ahrq.gov, NCSBN Clinical Judgment Model — ncsbn.org, ANA Code of Ethics — nursingworld.org, Joint Commission Safety Goals — jointcommission.org, CDC Infection Control — cdc.gov, APIC — apic.org, AWHONN — awhonn.org] — one sentence why it helps and include the URL.`}

CRITICAL PRE-CHECK (do this FIRST before writing feedback):
Count the words in the user's answer. If the answer has 3 or fewer words, OR is gibberish, off-topic, or a non-answer like "I don't know" or "pass", you MUST score 1/5 and keep all sections brief. No exceptions.

SCORING GUIDE (BE STRICT — do not default to 3-4):
1/5 — Minimal: 3 or fewer words, "I don't know", off-topic, gibberish, or non-answer
2/5 — Vague: Shows some awareness but no structure, generic platitudes, lacks any specific detail
3/5 — Developing: Attempted ${frameworkLabel} structure but missing key components or vague on details
4/5 — Strong: Clear ${frameworkLabel} structure, specific real details, demonstrates genuine experience
5/5 — Exceptional: Complete ${frameworkLabel}, vivid specifics, authentic reflection, would impress a hiring manager

At the very end, include the score on a new line in EXACTLY this format:
[SCORE: X/5]
The score line should be the LAST line of your response.

Rules: Coach communication ONLY. Never generate clinical content. Never patronizing. Match praise to actual answer quality.`;
};

// Map score to tier label + color palette for Clinical Coaching Report
function getScoreTier(score) {
  if (score === null || score === undefined) {
    return { label: 'Unscored', textColor: 'text-slate-400', bgColor: 'bg-slate-500/20', borderColor: 'border-slate-500/30', barBgGradient: 'from-slate-600 to-slate-500', borderLeftClass: 'border-l-slate-500' };
  }
  if (score >= 5) return { label: 'Exceptional', textColor: 'text-green-400', bgColor: 'bg-green-500/10', borderColor: 'border-green-500/30', barBgGradient: 'from-green-600 to-emerald-400', borderLeftClass: 'border-l-green-500' };
  if (score >= 4) return { label: 'Strong Response', textColor: 'text-green-400', bgColor: 'bg-green-500/10', borderColor: 'border-green-500/30', barBgGradient: 'from-green-600 to-emerald-400', borderLeftClass: 'border-l-green-500' };
  if (score >= 3) return { label: 'Developing', textColor: 'text-yellow-400', bgColor: 'bg-yellow-500/10', borderColor: 'border-yellow-500/30', barBgGradient: 'from-yellow-600 to-amber-400', borderLeftClass: 'border-l-yellow-500' };
  if (score >= 2) return { label: 'Needs Work', textColor: 'text-amber-400', bgColor: 'bg-amber-500/10', borderColor: 'border-amber-500/30', barBgGradient: 'from-amber-600 to-orange-400', borderLeftClass: 'border-l-amber-500' };
  return { label: 'Minimal', textColor: 'text-red-400', bgColor: 'bg-red-500/10', borderColor: 'border-red-500/30', barBgGradient: 'from-red-600 to-red-400', borderLeftClass: 'border-l-red-500' };
}

export default function NursingPracticeMode({ specialty, onBack, userData, refreshUsage, addSession, startQuestionId = null, triggerStreakRefresh, onShowPricing }) {
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
  const [savedAsBest, setSavedAsBest] = useState(false); // "Save as Best Answer" per-question indicator
  const [savingBest, setSavingBest] = useState(false);
  const [expandedSections, setExpandedSections] = useState({}); // Collapsible feedback sections

  const toggleSection = useCallback((key) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const inputRef = useRef(null);
  const hasTrackedPracticeRef = useRef(false); // Google Ads: fire trackBeginPractice once per mount

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
            systemPrompt: PRACTICE_SYSTEM_PROMPT(specialty, currentQuestion) + '\n\n' + buildSelfEfficacyPrompt({
              currentAnswer: userAnswer.trim(),
              questionText: currentQuestion.question,
              previousScores: Array.from({ length: scoredCount }, (_, i) => scoredCount > 0 ? totalScore / scoredCount : 0),
              streakDays: 0, // TODO Phase 3: wire to streak system
              questionsCompleted: questionsAnswered,
              totalQuestions: questions.length,
            }),
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

      // Detect Anthropic API errors passed through Edge Function (overloaded, rate limit, etc.)
      if (data.type === 'error' && data.error) {
        const errType = data.error.type || 'unknown';
        const errMsg = data.error.message || 'AI service error';
        console.error('❌ Anthropic API error:', errType, errMsg);
        throw new Error(errType === 'overloaded_error'
          ? 'AI service is temporarily busy. Please try again in a moment.'
          : `AI error: ${errMsg}`);
      }

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

      // Report to Command Center session store (includes answer + feedback for review)
      if (addSession && currentQuestion) {
        addSession(createPracticeSession(
          currentQuestion.id,
          currentQuestion.question,
          currentQuestion.category,
          currentQuestion.responseFramework,
          score,
          userAnswer.trim(),
          cleanContent,
        ));
      }

      // CHARGE AFTER SUCCESS (Battle Scar #8)
      if (userData?.user?.id) {
        try {
          const usageResult = await incrementUsage(supabase, userData.user.id, 'nursingPractice');
          updateStreakAfterSession(supabase, userData.user.id).then(() => triggerStreakRefresh?.()).catch(() => {}); // Phase 3 streak
          if (refreshUsage) refreshUsage();
          // Re-check credits using ACTUAL DB count (fixes off-by-one with synthetic formula)
          const actualUsed = usageResult?.nursing_practice ?? ((userData.usage.nursingPractice?.used || 0) + 1);
          const recheck = canUseFeature(
            { nursing_practice: actualUsed },
            userData.tier,
            'nursingPractice'
          );
          if (!recheck.allowed) setCreditBlocked(true);
        } catch (chargeErr) {
          console.warn('\u26a0\ufe0f Practice usage increment failed (non-blocking):', chargeErr);
        }
      }

      // Google Ads: track first practice session (fire once per mount)
      if (!hasTrackedPracticeRef.current) {
        hasTrackedPracticeRef.current = true;
        trackBeginPractice();
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
    setSavedAsBest(false);
    setExpandedSections({});
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
    setSavedAsBest(false);
    setExpandedSections({});
  }, [questionIndex, questions.length]);

  // Handle Enter
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !feedback) {
      e.preventDefault();
      submitAnswer();
    }
  };

  const creditInfo = userData?.usage?.nursingPractice;
  const isUnlimited = userData?.isBeta || userData?.tier === 'nursing_pass' || userData?.tier === 'annual' || userData?.tier === 'pro' || userData?.tier === 'beta';
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
              <button
                onClick={onShowPricing}
                className="inline-block text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-sky-500 px-4 py-2 rounded-lg hover:-translate-y-0.5 transition-all"
              >
                Get Nursing Pass — Unlimited Practice
              </button>
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
                    {/* === CLINICAL COACHING REPORT === */}
                    {(() => {
                      const tier = getScoreTier(feedback.score);
                      const text = feedback.text || '';
                      const frameworkLabel = currentQuestion.responseFramework === 'sbar' ? 'SBAR' : 'STAR';

                      // Parse sections (updated: includes Approach for theory questions)
                      const feedbackMatch = text.match(/\*\*Feedback:\*\*([\s\S]*?)(?=\*\*(?:STAR|SBAR|Approach) Breakdown:\*\*|\*\*Ideal Answer|\*\*Resources to Review|\[SCORE|$)/);
                      const breakdownMatch = text.match(/\*\*(?:STAR|SBAR|Approach) Breakdown:\*\*([\s\S]*?)(?=\*\*Ideal Answer Approach:\*\*|\*\*Resources to Review|\[SCORE|$)/);
                      const idealMatch = text.match(/\*\*Ideal Answer Approach:\*\*([\s\S]*?)(?=\*\*Resources to Review:\*\*|\[SCORE|$)/);
                      const resourceMatch = text.match(/\*\*Resources to Review:\*\*([\s\S]*?)(?=\[SCORE|$)/);
                      const hasSections = feedbackMatch || breakdownMatch;

                      // Parse breakdown into step data for the step flow
                      const breakdownSteps = breakdownMatch
                        ? breakdownMatch[1].trim().split('\n').filter(l => l.trim().startsWith('-')).map(line => {
                            const clean = line.replace(/^-\s*/, '').trim();
                            const letterParsed = clean.match(/^([SBARTU])\s*\(([^)]+)\):\s*(.*)/);
                            const approachParsed = !letterParsed && clean.match(/^(Reasoning|Specificity|Application|Completeness):\s*(.*)/i);
                            const isMissing = clean.toLowerCase().includes('missing') || clean.toLowerCase().includes('not provided') || clean.toLowerCase().includes('not addressed');
                            if (letterParsed) return { letter: letterParsed[1], name: letterParsed[2], detail: letterParsed[3], isMissing };
                            if (approachParsed) {
                              const lMap = { reasoning: 'R', specificity: 'S', application: 'A', completeness: 'C' };
                              return { letter: lMap[approachParsed[1].toLowerCase()] || '?', name: approachParsed[1], detail: approachParsed[2], isMissing };
                            }
                            return { letter: '\u2022', name: '', detail: clean, isMissing };
                          })
                        : null;

                      return (
                        <>
                          {/* 1. Score Header — Tier Badge + Gradient Performance Bar */}
                          <div className="mb-5">
                            <div className="flex items-center justify-between mb-2.5">
                              <span className={`text-sm font-bold px-3 py-1 rounded-full border ${tier.bgColor} ${tier.borderColor} ${tier.textColor}`}>
                                {tier.label}
                              </span>
                              <span className={`text-sm font-semibold ${tier.textColor}`}>
                                {feedback.score !== null ? `${feedback.score}/5` : ''}
                              </span>
                            </div>
                            <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
                              <motion.div
                                className={`h-full rounded-full bg-gradient-to-r ${tier.barBgGradient}`}
                                initial={{ width: 0 }}
                                animate={{ width: feedback.score !== null ? `${(feedback.score / 5) * 100}%` : '0%' }}
                                transition={{ duration: 0.8, ease: 'easeOut' }}
                              />
                            </div>
                            <div className="flex justify-between mt-1 px-0.5">
                              {[1, 2, 3, 4, 5].map(n => (
                                <span key={n} className={`text-[10px] ${feedback.score !== null && n <= feedback.score ? tier.textColor : 'text-slate-600'}`}>
                                  {n}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* 2. Walled Garden Warning (unchanged) */}
                          {validationFlags?.walledGardenFlag && (
                            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-2 mb-3 flex items-start gap-2">
                              <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                              <p className="text-amber-300 text-xs">
                                This response may contain clinical guidance. Always verify with your facility protocols.
                              </p>
                            </div>
                          )}

                          {/* 3. Coaching Notes — Left-border accent card */}
                          {hasSections && feedbackMatch ? (
                            <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden mb-4">
                              <div className={`border-l-4 ${tier.borderLeftClass} p-4`}>
                                <div className="flex items-center gap-2 mb-2">
                                  <Stethoscope className="w-4 h-4 text-sky-400" />
                                  <span className="text-white text-sm font-semibold">Coaching Notes</span>
                                </div>
                                <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">
                                  {feedbackMatch[1].trim()}
                                </p>
                              </div>
                            </div>
                          ) : !hasSections && (
                            /* Fallback: raw text in coaching notes style */
                            <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden mb-4">
                              <div className="border-l-4 border-l-slate-500 p-4">
                                <div className="flex items-center gap-2 mb-2">
                                  <Stethoscope className="w-4 h-4 text-sky-400" />
                                  <span className="text-white text-sm font-semibold">Coaching Notes</span>
                                </div>
                                <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">
                                  {text}
                                </p>
                              </div>
                            </div>
                          )}

                          {/* 4. Framework Step Flow — Grid of assessment nodes */}
                          {breakdownSteps && breakdownSteps.length > 0 && (
                            <div className="mb-4">
                              <p className="text-white text-xs font-semibold mb-3 flex items-center gap-1.5">
                                <Target className="w-3.5 h-3.5 text-sky-400" />
                                {/\*\*Approach Breakdown:\*\*/i.test(text) ? 'Approach' : frameworkLabel} Assessment
                              </p>
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {breakdownSteps.map((step, i) => (
                                  <div key={i} className="flex flex-col items-center text-center bg-white/5 border border-white/10 rounded-xl p-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 mb-1.5 ${
                                      step.isMissing
                                        ? 'border-red-500/50 bg-red-500/10 text-red-400'
                                        : 'border-green-500/50 bg-green-500/10 text-green-400'
                                    }`}>
                                      {step.letter}
                                    </div>
                                    <div className="mb-1">
                                      {step.isMissing
                                        ? <XCircle className="w-3.5 h-3.5 text-red-400" />
                                        : <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                                      }
                                    </div>
                                    {step.name && (
                                      <p className={`text-[11px] font-medium mb-0.5 ${step.isMissing ? 'text-red-300' : 'text-slate-300'}`}>
                                        {step.name}
                                      </p>
                                    )}
                                    <p className={`text-[11px] leading-tight line-clamp-2 ${step.isMissing ? 'text-red-300/70' : 'text-slate-400'}`}>
                                      {step.detail}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* 5. Collapsible: View Ideal Approach */}
                          {idealMatch && (
                            <div className="mb-3">
                              <button
                                onClick={() => toggleSection('ideal')}
                                onTouchEnd={(e) => { e.preventDefault(); toggleSection('ideal'); }}
                                className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-purple-500/10 border border-purple-400/20 hover:bg-purple-500/20 transition-colors"
                              >
                                <span className="text-purple-300 text-sm font-medium flex items-center gap-2">
                                  <BookOpen className="w-3.5 h-3.5" /> View Ideal Approach
                                </span>
                                <ChevronDown className={`w-4 h-4 text-purple-400 transition-transform duration-200 ${expandedSections.ideal ? 'rotate-180' : ''}`} />
                              </button>
                              <AnimatePresence>
                                {expandedSections.ideal && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="overflow-hidden"
                                  >
                                    <div className="bg-purple-500/5 border-x border-b border-purple-400/20 rounded-b-xl px-4 py-3">
                                      <p className="text-purple-200 text-sm leading-relaxed whitespace-pre-wrap">
                                        {idealMatch[1].trim()}
                                      </p>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          )}

                          {/* 6. Collapsible: View Your Answer */}
                          {userAnswer && (
                            <div className="mb-3">
                              <button
                                onClick={() => toggleSection('userAnswer')}
                                onTouchEnd={(e) => { e.preventDefault(); toggleSection('userAnswer'); }}
                                className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-slate-700/30 border border-white/10 hover:bg-slate-700/50 transition-colors"
                              >
                                <span className="text-slate-300 text-sm font-medium flex items-center gap-2">
                                  <User className="w-3.5 h-3.5" /> View Your Answer
                                </span>
                                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${expandedSections.userAnswer ? 'rotate-180' : ''}`} />
                              </button>
                              <AnimatePresence>
                                {expandedSections.userAnswer && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="overflow-hidden"
                                  >
                                    <div className="bg-slate-800/50 border-x border-b border-white/10 rounded-b-xl px-4 py-3">
                                      <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                                        {userAnswer}
                                      </p>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          )}

                          {/* 7. Resources — Compact amber row */}
                          {resourceMatch && (
                            <div className="bg-amber-500/10 border border-amber-400/20 rounded-xl px-4 py-3 mb-4">
                              <p className="text-amber-300 text-xs font-semibold mb-1.5 flex items-center gap-1.5">
                                <BookOpen className="w-3 h-3" /> Recommended Reading
                              </p>
                              <p className="text-amber-200/80 text-sm leading-relaxed whitespace-pre-wrap">
                                {resourceMatch[1].trim().replace(/\*\*/g, '')}
                              </p>
                            </div>
                          )}
                        </>
                      );
                    })()}

                    {/* Key points from question library (unchanged) */}
                    {currentQuestion.bullets?.length > 0 && (
                      <div className="bg-sky-500/10 border border-sky-400/20 rounded-xl p-4 mb-4">
                        <p className="text-sky-300 text-xs font-medium mb-2 flex items-center gap-1">
                          <BookOpen className="w-3 h-3" /> Key points to hit:
                        </p>
                        <div className="space-y-1">
                          {currentQuestion.bullets.map((b, i) => (
                            <p key={i} className="text-sky-300/70 text-xs">{'\u2022'} {b}</p>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Save as Best Answer (unchanged) */}
                    {userData?.user?.id && currentQuestion && (
                      <div className="mb-3">
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (savedAsBest || savingBest) return;
                            setSavingBest(true);
                            try {
                              const result = await upsertSavedAnswer(userData.user.id, currentQuestion.id, userAnswer.trim());
                              if (result.success) {
                                setSavedAsBest(true);
                                try {
                                  const local = JSON.parse(localStorage.getItem(`nursing_saved_answers_${userData.user.id}`) || '{}');
                                  local[currentQuestion.id] = userAnswer.trim();
                                  localStorage.setItem(`nursing_saved_answers_${userData.user.id}`, JSON.stringify(local));
                                } catch { /* ignore */ }
                              }
                            } catch (err) {
                              console.warn('\u26a0\ufe0f Save best answer failed:', err);
                            } finally {
                              setSavingBest(false);
                            }
                          }}
                          onTouchEnd={async (e) => {
                            e.preventDefault();
                            if (savedAsBest || savingBest) return;
                            setSavingBest(true);
                            try {
                              const result = await upsertSavedAnswer(userData.user.id, currentQuestion.id, userAnswer.trim());
                              if (result.success) {
                                setSavedAsBest(true);
                                try {
                                  const local = JSON.parse(localStorage.getItem(`nursing_saved_answers_${userData.user.id}`) || '{}');
                                  local[currentQuestion.id] = userAnswer.trim();
                                  localStorage.setItem(`nursing_saved_answers_${userData.user.id}`, JSON.stringify(local));
                                } catch { /* ignore */ }
                              }
                            } catch (err) {
                              console.warn('\u26a0\ufe0f Save best answer failed:', err);
                            } finally {
                              setSavingBest(false);
                            }
                          }}
                          disabled={savedAsBest || savingBest}
                          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
                            savedAsBest
                              ? 'bg-green-500/10 border border-green-500/20 text-green-300 cursor-default'
                              : 'bg-amber-500/10 border border-amber-500/20 text-amber-300 hover:bg-amber-500/20'
                          }`}
                        >
                          {savingBest ? (
                            <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...</>
                          ) : savedAsBest ? (
                            <><CheckCircle className="w-3.5 h-3.5" /> Saved as Best Answer</>
                          ) : (
                            <><Save className="w-3.5 h-3.5" /> Save as My Best Answer</>
                          )}
                        </button>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => { setUserAnswer(''); setFeedback(null); setValidationFlags(null); setSavedAsBest(false); setExpandedSections({}); }}
                        onTouchEnd={(e) => { e.preventDefault(); setUserAnswer(''); setFeedback(null); setValidationFlags(null); setSavedAsBest(false); setExpandedSections({}); }}
                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white/10 border border-white/20 text-white font-semibold text-sm hover:bg-white/20 transition-all"
                      >
                        <RotateCcw className="w-4 h-4" /> Try Again
                      </button>
                      <button
                        onClick={nextQuestion}
                        onTouchEnd={(e) => { e.preventDefault(); nextQuestion(); }}
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
