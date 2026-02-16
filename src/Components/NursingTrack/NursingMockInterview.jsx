// NursingTrack — Mock Interview Session
// ⚠️ This component WRAPS the existing AI interview capability.
// It does NOT rebuild speech recognition, AI feedback, or STAR coaching.
// It adds: nursing-specific prompts, clinical context, walled garden guardrails.
//
// PHASE 1: Standalone prototype with direct Supabase Edge Function calls
// PHASE 2: Will integrate with existing ISL interview engine

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Mic, MicOff, Send, Bot, User, Loader2,
  Stethoscope, AlertCircle, BookOpen, ChevronDown, ChevronUp,
  RotateCcw, CheckCircle, XCircle
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { getFrameworkDetails, CLINICAL_FRAMEWORKS } from './nursingQuestions';
import useNursingQuestions from './useNursingQuestions';
import NursingLoadingSkeleton from './NursingLoadingSkeleton';
import { fetchWithRetry } from '../../utils/fetchWithRetry';
import useSpeechRecognition from './useSpeechRecognition';
import SpeechUnavailableWarning from '../SpeechUnavailableWarning';
import { canUseFeature, incrementUsage } from '../../utils/creditSystem';
import NursingSessionSummary from './NursingSessionSummary';
import { parseScoreFromResponse, stripScoreTag, getCitationSource, validateNursingResponse } from './nursingUtils';
import { createMockInterviewSession } from './nursingSessionStore';

// ============================================================
// C.O.A.C.H. PROTOCOL — AI Interview Conversation Architecture
// ============================================================
// C — Context Set: Frame the session, tell the user what to expect
// O — Only Curated Questions: Pull from library, never generate clinical scenarios
// A — Assess Communication: SBAR (clinical) or STAR (behavioral), specificity, reasoning, outcomes, authenticity
// C — Coach With Layers: 1) What was strong, 2) What to improve, 3) Offer retry
// H — Handle Follow-ups and Boundaries: Probe deeper, redirect clinical questions
// ============================================================

const NURSING_SYSTEM_PROMPT = (specialty, question) => {
  const framework = getFrameworkDetails(question.clinicalFramework);
  const frameworkContext = framework
    ? `\nRelevant clinical framework: ${framework.name} (${framework.description})\nSource: ${framework.source}`
    : '';

  const citationSource = getCitationSource(question);

  // SBAR vs STAR — dynamic evaluation based on question's responseFramework
  const isSBAR = question.responseFramework === 'sbar';
  const frameworkLabel = isSBAR ? 'SBAR' : 'STAR';

  const assessSection = isSBAR
    ? `[A] ASSESS COMMUNICATION — This is a CLINICAL SCENARIO question. Evaluate using SBAR:
1. SITUATION — Did they clearly state what was happening right now with the patient?
2. BACKGROUND — Did they provide relevant clinical history, context, and pertinent findings?
3. ASSESSMENT — Did they share their clinical assessment and reasoning about what they believed was occurring?
4. RECOMMENDATION — Did they state a clear recommendation, action taken, or request?
5. Specificity — Concrete details, or vague and generic?
6. Authenticity — Does it sound like a real clinical experience or rehearsed/generic?

When coaching, use SBAR language: "Your Situation was clear, but the Background could include more relevant history..." NOT STAR language.`
    : `[A] ASSESS COMMUNICATION — This is a BEHAVIORAL question. Evaluate using STAR:
1. SITUATION — Did they set the scene with clear context?
2. TASK — Did they explain their specific role and responsibility?
3. ACTION — Did they describe concrete, specific actions they took?
4. RESULT — Did they include measurable outcomes or impact?
5. Specificity — Concrete details, or vague and generic?
6. Authenticity — Does it sound like a real experience or rehearsed/generic?

When coaching, use STAR language: "Your Situation was strong, but the Action section could be more specific..." NOT SBAR language.`;

  return `You are a nursing interview coach conducting a mock interview for a nurse applying to a ${specialty.name} (${specialty.shortName}) position.

=== C.O.A.C.H. PROTOCOL ===

[C] CONTEXT: You are conducting a realistic mock interview. Behave like a warm but professional nurse manager. Ask the question naturally, listen to the answer, then coach.

[O] ONLY CURATED QUESTIONS: You are asking this specific question from our curated library:
"${question.question}"
Category: ${question.category}
Difficulty: ${question.difficulty || 'intermediate'}
Response Framework: ${frameworkLabel}${frameworkContext}

Do NOT generate your own clinical scenarios. Do NOT invent patient cases. The question library provides all clinical content.

${assessSection}

IMPORTANT: NEVER evaluate clinical accuracy. You assess HOW they communicate, not WHETHER their clinical decisions were correct.

[C] COACH WITH LAYERS — After the user answers, ALWAYS give feedback in this order:
1. WHAT WAS STRONG — Name one specific thing they did well. Be genuine, not generic.
2. WHAT TO IMPROVE — Name one specific area to strengthen. Frame as opportunity, never criticism.
3. OFFER RETRY — Ask: "Would you like to try that answer again incorporating [specific suggestion]?"
${framework ? `4. CITE FRAMEWORK — Reference: "${framework.name}" (${framework.source})${citationSource ? ` | Source material: ${citationSource}` : ''}` : citationSource ? `4. CITE SOURCE — Reference this source naturally in your coaching: "${citationSource}"` : ''}

SCORING: At the very end of your feedback response, include a score on a new line in EXACTLY this format:
[SCORE: X/5]
where X is 1-5 based on overall communication quality. This helps us track progress. The score line should be the last line of your response.

[H] HANDLE FOLLOW-UPS AND BOUNDARIES:
- ASK DYNAMIC FOLLOW-UPS that probe deeper into THEIR ANSWER (like a real interviewer):
  Example: "You mentioned you called a rapid response. Walk me through what you saw that triggered that decision."
- Follow-ups should probe the answer they gave, not introduce new clinical territory.
- Suggested follow-ups from the question library: ${question.followUps?.map(f => `"${f}"`).join(', ') || 'Use your judgment based on their answer.'}

WALLED GARDEN RULES (ABSOLUTE — NEVER BREAK):
- NEVER generate clinical scenarios from your training data
- NEVER invent medical facts, drug dosages, or clinical protocols
- NEVER recommend clinical interventions
- NEVER evaluate whether their clinical decision was medically correct
- NEVER act as a clinical reference or textbook
- NEVER say "the correct protocol for X is..." — that crosses the line
- If asked a direct clinical question, redirect:
  "That's a great clinical knowledge area. For protocol-specific review, check your facility guidelines or resources like UpToDate. Let's focus on how you'd articulate that experience in an interview — that's what will land the job."

TONE:
- Warm, supportive, constructive — never patronizing
- NEVER say "you just need more experience" — guide constructively instead
- Acknowledge the emotional weight of clinical experiences
- Focus on HOW they tell their story, not WHETHER their clinical decision was correct

COACHING TIPS for this question:
${question.bullets?.map(b => `- ${b}`).join('\n') || `Guide the candidate through ${frameworkLabel} format.`}

Start by asking the interview question naturally. Be a nurse manager conducting an interview — professional but warm.`;
};

export default function NursingMockInterview({ specialty, onBack, userData, refreshUsage, addSession }) {
  // State
  const [messages, setMessages] = useState([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [error, setError] = useState(null);
  const [creditBlocked, setCreditBlocked] = useState(false);

  // Session results — tracks per-question data for summary
  const [sessionResults, setSessionResults] = useState([]);

  // Refs
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Speech recognition (Battle Scars #4-7 — all iOS Safari fixes included)
  const {
    transcript: speechTranscript,
    isListening: micActive,
    hasReliableSpeech,
    startSession: startMic,
    stopSession: stopMic,
    clearTranscript: clearSpeech,
    error: micError,
  } = useSpeechRecognition();

  // Sync speech transcript → input field when mic is active
  useEffect(() => {
    if (micActive && speechTranscript) {
      setCurrentInput(speechTranscript);
    }
  }, [speechTranscript, micActive]);

  // Get questions for this specialty (Supabase → fallback to static)
  const { questions, loading: questionsLoading } = useNursingQuestions(specialty.id);

  // Credit check on mount
  useEffect(() => {
    if (userData && !userData.loading && userData.usage) {
      const check = canUseFeature(
        // Nursing track uses separate credit pool
        { nursing_mock: userData.usage.nursingMock?.used || 0 },
        userData.tier,
        'nursingMock'
      );
      if (!check.allowed) {
        setCreditBlocked(true);
      }
    }
  }, [userData]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Start the interview session
  const startSession = useCallback(() => {
    const firstQuestion = questions[0];
    setCurrentQuestion(firstQuestion);
    setSessionStarted(true);
    setMessages([
      {
        role: 'assistant',
        content: `Welcome! I'm going to be your interview coach today for a ${specialty.name} nursing position. I'll ask you questions that are commonly asked in ${specialty.shortName} interviews, and I'll coach you on how to deliver strong, structured answers.\n\nRemember — I'm here to help you communicate YOUR real experiences effectively. There are no wrong answers, just opportunities to tell your story better.\n\nLet's begin.\n\n**${firstQuestion.question}**`,
        timestamp: new Date(),
      }
    ]);
  }, [questions, specialty]);

  // Send a message to the AI
  const sendMessage = useCallback(async () => {
    if (!currentInput.trim() || isLoading || creditBlocked) return;

    const userMessage = currentInput.trim();
    setCurrentInput('');
    setError(null);

    // Add user message to chat
    setMessages(prev => [...prev, {
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    }]);

    setIsLoading(true);

    try {
      // Build conversation history for context
      const conversationHistory = messages.map(m => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content,
      }));

      // Add current user message
      conversationHistory.push({ role: 'user', content: userMessage });

      // Get auth token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      // Call existing ai-feedback Edge Function with nursing context
      // Using fetchWithRetry — 3 attempts, backoff (Battle Scar #3 & #8)
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
            nursingFeature: 'nursingMock',
            systemPrompt: NURSING_SYSTEM_PROMPT(specialty, currentQuestion),
            conversationHistory: conversationHistory,
            userMessage: userMessage,
          }),
        }
      );

      if (!response.ok) {
        const errText = await response.text();
        console.error('❌ AI feedback error:', response.status, errText);
        throw new Error(`AI feedback failed: ${response.status}`);
      }

      const data = await response.json();
      const rawContent = data.content?.[0]?.text || data.response || data.feedback || 'I appreciate your answer. Could you tell me more about that experience?';

      // Parse score defensively — null fallback = "Unscored" (per user request)
      const score = parseScoreFromResponse(rawContent);
      const cleanContent = stripScoreTag(rawContent);
      const validation = validateNursingResponse(rawContent, 'mock');

      // Add AI response to chat (with score stripped from display)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: cleanContent,
        timestamp: new Date(),
        score, // attached for session results tracking
        walledGardenFlag: validation.walledGardenFlag,
      }]);

      // Track session result for this question
      if (currentQuestion) {
        setSessionResults(prev => [...prev, {
          question: currentQuestion.question,
          questionId: currentQuestion.id,
          responseFramework: currentQuestion.responseFramework,
          category: currentQuestion.category,
          userAnswer: userMessage,
          aiFeedback: cleanContent,
          score, // null = "Unscored" — parsing failure doesn't break flow
        }]);

        // Report to Command Center session store
        if (addSession) {
          addSession(createMockInterviewSession({
            questionId: currentQuestion.id,
            question: currentQuestion.question,
            category: currentQuestion.category,
            responseFramework: currentQuestion.responseFramework,
            score,
          }));
        }
      }

      // CHARGE AFTER SUCCESS (Battle Scar #8)
      // Only charge if we got a successful AI response
      if (userData?.user?.id) {
        try {
          await incrementUsage(supabase, userData.user.id, 'nursingMock');
          // Refresh parent's usage stats so dashboard stays current
          if (refreshUsage) refreshUsage();
          // Re-check credits after charge to catch hitting zero (prevents stale state bypass)
          const recheck = canUseFeature(
            { nursing_mock: (userData.usage.nursingMock?.used || 0) + sessionResults.length + 1 },
            userData.tier,
            'nursingMock'
          );
          if (!recheck.allowed) setCreditBlocked(true);
        } catch (chargeErr) {
          // Log but don't break the session — the AI response already succeeded
          console.warn('⚠️ Usage increment failed (non-blocking):', chargeErr);
        }
      }

    } catch (err) {
      console.error('❌ Interview session error:', err);
      setError('Something went wrong. Please try again.');
      // Don't charge on failure (Battle Scar #8)
    } finally {
      setIsLoading(false);
    }
  }, [currentInput, isLoading, messages, specialty, currentQuestion, userData, refreshUsage]);

  // Move to next question
  const nextQuestion = useCallback(() => {
    const nextIdx = questionIndex + 1;
    if (nextIdx < questions.length) {
      const nextQ = questions[nextIdx];
      setQuestionIndex(nextIdx);
      setCurrentQuestion(nextQ);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Great work on that one. Let's move to the next question.\n\n**${nextQ.question}**`,
        timestamp: new Date(),
      }]);
    } else {
      // All questions done → show session summary
      setSessionComplete(true);
    }
  }, [questionIndex, questions]);

  // End session early (user clicks "End Session")
  const endSessionEarly = useCallback(() => {
    setSessionComplete(true);
  }, []);

  // Handle Enter key
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // ============================================================
  // SESSION COMPLETE: Show summary
  // ============================================================
  if (sessionComplete) {
    return (
      <NursingSessionSummary
        specialty={specialty}
        sessionResults={sessionResults}
        onRetry={() => {
          // Reset everything for a new session
          setMessages([]);
          setQuestionIndex(0);
          setSessionStarted(false);
          setSessionComplete(false);
          setSessionResults([]);
          setFeedback(null);
          setError(null);
        }}
        onBack={onBack}
      />
    );
  }

  // ============================================================
  // PRE-SESSION: Show start screen
  // ============================================================
  if (!sessionStarted) {
    // Credit check gate
    const creditInfo = userData?.usage?.nursingMock;
    const isUnlimited = userData?.isBeta || userData?.tier === 'pro';

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg w-full"
        >
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
            <div className="text-5xl mb-4">{specialty.icon}</div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {specialty.name} Mock Interview
            </h2>
            <p className="text-slate-400 mb-6 text-sm leading-relaxed">
              You'll practice with {questions.length} questions tailored to {specialty.shortName} interviews.
              The AI will coach your delivery, structure, and communication — never your clinical knowledge.
            </p>

            {/* Credits remaining */}
            {creditInfo && !isUnlimited && (
              <div className={`text-xs mb-4 px-3 py-2 rounded-lg ${
                creditBlocked
                  ? 'bg-red-500/10 border border-red-500/20 text-red-300'
                  : 'bg-sky-500/10 border border-sky-500/20 text-sky-300'
              }`}>
                {creditBlocked
                  ? `You've used all ${creditInfo.limit} free interview sessions this month. Upgrade to Pro for unlimited.`
                  : `${creditInfo.remaining} of ${creditInfo.limit} free sessions remaining this month`
                }
              </div>
            )}
            {isUnlimited && (
              <div className="text-xs mb-4 px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/20 text-green-300">
                {userData.isBeta ? '🎖️ Beta Tester — Unlimited access' : '⭐ Pro — Unlimited sessions'}
              </div>
            )}

            {/* What to expect */}
            <div className="text-left bg-white/5 rounded-xl p-4 mb-6">
              <p className="text-white text-sm font-medium mb-3">What to expect:</p>
              <div className="space-y-2">
                {[
                  'Questions from our curated clinical content library',
                  'SBAR coaching for clinical scenarios, STAR for behavioral questions',
                  'Real-time feedback on specificity and communication',
                  'Constructive guidance — never patronizing',
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-300 text-xs">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {creditBlocked ? (
              <a
                href="/app?upgrade=true&returnTo=/nursing"
                className="block w-full text-center font-semibold py-3 rounded-xl transition-all bg-gradient-to-r from-purple-600 to-sky-500 text-white shadow-lg shadow-purple-500/30 hover:-translate-y-0.5"
              >
                Upgrade to Pro — Unlimited Interviews
              </a>
            ) : (
              <button
                onClick={startSession}
                className="w-full font-semibold py-3 rounded-xl transition-all bg-gradient-to-r from-sky-600 to-cyan-500 text-white shadow-lg shadow-sky-500/30 hover:-translate-y-0.5"
              >
                Start Interview
              </button>
            )}

            <button
              onClick={onBack}
              className="mt-3 text-slate-400 hover:text-white text-sm transition-colors"
            >
              ← Back to Dashboard
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ============================================================
  // ACTIVE SESSION: Chat interface
  // ============================================================
  if (questionsLoading) return <NursingLoadingSkeleton title="Mock Interview" onBack={onBack} />;

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
            <span className="text-sm">Exit</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-lg">{specialty.icon}</span>
            <span className="text-white font-medium text-sm">{specialty.shortName} Interview</span>
            <span className="text-slate-500 text-xs">
              Q{questionIndex + 1}/{questions.length}
            </span>
            {/* Framework badge */}
            {currentQuestion && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                currentQuestion.responseFramework === 'sbar'
                  ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                  : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
              }`}>
                {currentQuestion.responseFramework === 'sbar' ? 'SBAR' : 'STAR'}
              </span>
            )}
          </div>

          {/* Tips toggle */}
          <button
            onClick={() => setShowTips(!showTips)}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <BookOpen className="w-5 h-5" />
          </button>
        </div>

        {/* Collapsible tips panel */}
        <AnimatePresence>
          {showTips && currentQuestion && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-white/5 overflow-hidden"
            >
              <div className="max-w-3xl mx-auto px-4 py-3">
                <p className="text-sky-300 text-xs font-medium mb-2">💡 Tips for this question:</p>
                <div className="space-y-1">
                  {currentQuestion.bullets?.map((tip, i) => (
                    <p key={i} className="text-slate-400 text-xs">• {tip}</p>
                  ))}
                </div>
                {currentQuestion.clinicalFramework && (
                  <p className="text-slate-500 text-xs mt-2 italic">
                    Framework: {currentQuestion.clinicalFramework}
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-sky-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <Stethoscope className="w-4 h-4 text-sky-400" />
                </div>
              )}
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                msg.role === 'user'
                  ? 'bg-sky-600 text-white'
                  : 'bg-white/10 text-slate-200'
              }`}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                {msg.walledGardenFlag && (
                  <p className="text-amber-400 text-xs mt-2 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> This response may contain clinical guidance — verify with facility protocols.
                  </p>
                )}
              </div>
              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <User className="w-4 h-4 text-purple-400" />
                </div>
              )}
            </motion.div>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3"
            >
              <div className="w-8 h-8 rounded-full bg-sky-500/20 flex items-center justify-center flex-shrink-0">
                <Stethoscope className="w-4 h-4 text-sky-400" />
              </div>
              <div className="bg-white/10 rounded-2xl px-4 py-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-sky-400 animate-spin" />
                  <span className="text-slate-400 text-sm">Thinking...</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Error message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span className="text-red-300 text-sm">{error}</span>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-400 hover:text-red-300"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-slate-900/95 backdrop-blur-lg border-t border-white/10 p-4">
        <div className="max-w-3xl mx-auto">
          {/* Action buttons */}
          <div className="flex gap-2 mb-3">
            <button
              onClick={nextQuestion}
              className="text-xs text-sky-400 hover:text-sky-300 bg-sky-500/10 border border-sky-500/20 px-3 py-1.5 rounded-full transition-colors"
            >
              Next Question →
            </button>
            <button
              onClick={() => {
                setMessages([]);
                setQuestionIndex(0);
                setSessionStarted(false);
                setSessionComplete(false);
                setSessionResults([]);
                setFeedback(null);
              }}
              className="text-xs text-slate-400 hover:text-slate-300 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              Restart
            </button>
            {sessionResults.length > 0 && (
              <button
                onClick={endSessionEarly}
                className="text-xs text-amber-400 hover:text-amber-300 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-full transition-colors"
              >
                End Session →
              </button>
            )}
          </div>

          {/* Credit blocked alert — shown mid-session when credits hit zero */}
          {creditBlocked && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-3 text-center">
              <p className="text-red-300 text-xs mb-1">You've used all free interview sessions this month.</p>
              <a href="/app?upgrade=true&returnTo=/nursing" className="text-xs font-medium text-white bg-gradient-to-r from-purple-600 to-sky-500 px-3 py-1 rounded-lg inline-block">
                Upgrade to Pro
              </a>
            </div>
          )}
          {/* Input area — mic + text + send */}
          {micError && (
            <p className="text-red-400 text-xs mb-1 text-center">{micError}</p>
          )}
          <SpeechUnavailableWarning variant="inline" darkMode className="text-center" />
          <div className="flex items-end gap-2">
            {/* Mic toggle — Battle Scar #5: must be user gesture (onClick/onTouchEnd) */}
            {hasReliableSpeech && (
              <button
                onClick={async () => {
                  if (micActive) {
                    stopMic();
                  } else {
                    clearSpeech();
                    await startMic();
                  }
                }}
                onTouchEnd={async (e) => {
                  e.preventDefault();
                  if (micActive) {
                    stopMic();
                  } else {
                    clearSpeech();
                    await startMic();
                  }
                }}
                className={`p-3 rounded-xl transition-all flex-shrink-0 ${
                  micActive
                    ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 animate-pulse'
                    : 'bg-white/10 text-white/50 hover:text-white hover:bg-white/20'
                }`}
                title={micActive ? 'Stop microphone' : 'Start microphone'}
              >
                {micActive ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
            )}
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={currentInput}
                onChange={(e) => {
                  setCurrentInput(e.target.value);
                  // If user types while mic is on, stop mic (they're taking over)
                  if (micActive) stopMic();
                }}
                onKeyDown={handleKeyDown}
                placeholder={micActive ? 'Listening... speak your answer' : 'Type or tap the mic to speak your answer...'}
                rows={2}
                className={`w-full bg-white/10 border rounded-xl px-4 py-3 text-white text-sm placeholder-slate-500 resize-none focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/30 ${
                  micActive ? 'border-red-500/40' : 'border-white/10'
                }`}
              />
            </div>
            <button
              onClick={() => {
                if (micActive) stopMic();
                clearSpeech();
                sendMessage();
              }}
              disabled={!currentInput.trim() || isLoading || creditBlocked}
              className={`p-3 rounded-xl transition-all flex-shrink-0 ${
                currentInput.trim() && !isLoading && !creditBlocked
                  ? 'bg-sky-600 text-white shadow-lg shadow-sky-500/30 hover:-translate-y-0.5'
                  : 'bg-white/10 text-white/30 cursor-not-allowed'
              }`}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>

          {/* Walled garden reminder */}
          <p className="text-slate-600 text-xs mt-2 text-center">
            AI coaches your communication and delivery • Clinical content reviewed by nursing professionals
          </p>
        </div>
      </div>
    </div>
  );
}
