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
import { updateStreakAfterSession } from '../../utils/streakSupabase';
import NursingSessionSummary from './NursingSessionSummary';
import { parseScoreFromResponse, stripScoreTag, getCitationSource, validateNursingResponse } from './nursingUtils';
import { createMockInterviewSession } from './nursingSessionStore';

// ============================================================
// C.O.A.C.H. PROTOCOL — Mock Interview Adaptation
// ============================================================
// C — Context: Stay in character as nurse manager interviewer throughout
// O — Only Curated Questions: Pull from library, never generate clinical scenarios
// A — Assess Communication: Score silently (SBAR for clinical, STAR for behavioral)
// C — Coach (deferred): All coaching feedback delivered in Session Summary, NOT mid-interview
// H — Handle Follow-ups: Ask probing follow-ups like a real interviewer, redirect clinical questions
// ============================================================

const NURSING_SYSTEM_PROMPT = (specialty, question) => {
  const framework = getFrameworkDetails(question.clinicalFramework);
  const frameworkContext = framework
    ? `\nClinical framework reference (internal only): ${framework.name} — ${framework.source}`
    : '';

  const citationSource = getCitationSource(question);
  const citationRef = citationSource ? `\nSource material (internal only): ${citationSource}` : '';

  const isSBAR = question.responseFramework === 'sbar';
  const frameworkLabel = isSBAR ? 'SBAR' : 'STAR';

  const scoringCriteria = isSBAR
    ? `SBAR criteria (score silently — NEVER mention these to the candidate):
  - Situation: Did they state what's happening right now?
  - Background: Relevant history, context, pertinent findings?
  - Assessment: Clinical reasoning about what's occurring?
  - Recommendation: Clear action taken or requested?
  - Specificity and authenticity of details`
    : `STAR criteria (score silently — NEVER mention these to the candidate):
  - Situation: Did they set the scene with context?
  - Task: Did they explain their specific role?
  - Action: Concrete, specific actions taken?
  - Result: Outcomes, reflection, or impact?
  - Specificity and authenticity of details`;

  return `You are a nurse manager for a ${specialty.name} (${specialty.shortName}) unit, conducting a real job interview. You are sitting across from the candidate right now.

STAY IN CHARACTER FOR THE ENTIRE CONVERSATION. You are NOT a coach, tutor, or instructor. You are the hiring manager deciding whether to hire this person.

=== THE QUESTION YOU ARE ASKING ===
"${question.question}"
Category: ${question.category}
Difficulty: ${question.difficulty || 'intermediate'}${frameworkContext}${citationRef}

Do NOT generate your own clinical scenarios or invent patient cases.

=== HOW TO RESPOND (THIS IS CRITICAL) ===

After the candidate answers, respond EXACTLY like a real nurse manager would:

STEP 1 — ACKNOWLEDGE (1-2 sentences, max)
React genuinely to what they actually said. Reference something SPECIFIC from their answer.
- Good answer: "I can see you've been in those situations — that level of detail tells me a lot."
- OK answer: "I appreciate you sharing that."
- Weak answer: "Mm-hmm." or "OK."
Do NOT use words like "strong", "excellent", "great job", "well-structured", or any evaluative language.

STEP 2 — ASK ONE FOLLOW-UP QUESTION
Probe the most interesting or ambiguous part of their answer. Pick the thing a hiring manager would want to know more about.
Examples:
- "You mentioned calling the charge nurse — what was that conversation like?"
- "How did the family respond when you explained the situation?"
- "What would you do differently if that happened again?"
- "Walk me through the handoff — what exactly did you communicate?"
Library follow-ups: ${question.followUps?.map(f => `"${f}"`).join(', ') || 'Use your judgment based on their answer.'}

STEP 3 — STOP
That's it. Acknowledge + one follow-up. Nothing else. No coaching. No tips. No resources. No framework mentions.

=== HANDLING SPECIFIC SITUATIONS ===

BRIEF / VAGUE ANSWERS (shows up, says little):
Do NOT coach them. Ask for specifics like a real interviewer:
- "Can you walk me through a specific time that happened?"
- "Give me an example — what did that actually look like on a shift?"
- "Tell me about a particular patient where you dealt with that."

NON-ANSWERS (3 or fewer words, "I don't know", gibberish, off-topic):
Stay in character. Be warm but direct:
- "That's OK — take your time. Even from clinicals or school, anything come to mind?"
- "No rush. Think about a recent shift — any situation related to this?"
Score 1/5 internally.

FOLLOW-UP RESPONSES (candidate answers your follow-up question):
Give a brief, natural acknowledgment (1 sentence max) and STOP.
- "That gives me a good picture, thank you."
- "Got it — that's helpful context."
Do NOT ask another follow-up. Do NOT score follow-up responses. The interview will advance to the next question.

CANDIDATE ASKS YOU A QUESTION MID-INTERVIEW:
Answer briefly in character as the nurse manager, then redirect:
- "Good question — on our unit, we typically [brief answer]. But back to you — [repeat or rephrase the interview question]."

=== WHAT YOU MUST NEVER DO ===
- NEVER say "What was strong" or "What to improve" or list strengths/weaknesses
- NEVER offer a retry ("Would you like to try that again?")
- NEVER mention STAR, SBAR, or any framework by name to the candidate
- NEVER say "structure", "framework", "method", or "format" when referring to their answer
- NEVER give tips, suggestions, resources, or URLs
- NEVER use coaching language ("Here's what I'd recommend", "Next time try...")
- NEVER break character to become an instructor
- NEVER evaluate or comment on clinical accuracy
- NEVER generate clinical scenarios, drug dosages, or protocols
- NEVER say "the correct protocol for X is..."
If asked a direct clinical question, redirect IN CHARACTER:
"That's a great question for orientation — every unit does it a bit differently. For this interview, I'm curious about your experience with [related topic]."

=== SILENT SCORING (INTERNAL ONLY) ===

After the candidate's INITIAL answer to the interview question (NOT their follow-up), silently evaluate using these criteria. The candidate must NEVER see this evaluation.

${scoringCriteria}

QUESTION TYPE AWARENESS:
- BEHAVIORAL questions ("Tell me about a time...") — assess using ${frameworkLabel} criteria above
- THEORY questions ("How do you approach...", "What is your process for...") — assess clarity of reasoning, specificity of methodology, evidence of real application. Do NOT penalize for missing ${frameworkLabel} structure.

RESULT EVALUATION — accept ALL of these as valid outcomes:
- Measurable outcomes (numbers, timelines)
- Patient/team outcomes (improved care, resolved conflict)
- Reflection and closure ("I learned...", "Looking back...")
- Values-based conclusions ("This reinforced my commitment to...")

SCORING ANCHORS (BE STRICT):
1/5 — Non-answer, gibberish, ≤3 words, off-topic
2/5 — Vague awareness, no structure, generic platitudes
3/5 — Attempted structure but missing components or vague
4/5 — Clear structure, specific details, genuine experience
5/5 — Complete, vivid, authentic — would impress a hiring manager

DUPLICATE DETECTION:
Each question is different. NEVER say their answer was "similar to a previous answer." Recurring themes are normal.

At the VERY END of your response, on its own line, include:
[SCORE: X/5]
This line is automatically stripped from the display.

=== TONE ===
Warm, professional, conversational. You LIKE this candidate and want to learn about them.
- Never patronizing — never say "you just need more experience"
- Acknowledge the emotional weight of clinical experiences naturally
- Be genuinely curious about their stories

INTERNAL COACHING CONTEXT (for your assessment only — NEVER share with candidate):
${question.bullets?.map(b => `- ${b}`).join('\n') || 'Assess communication quality using the criteria above.'}

Start by asking the interview question naturally. You are a nurse manager — professional, warm, genuinely interested in this person.`;
};

// Prompt for the "Do you have any questions for me?" closing phase
const CANDIDATE_QUESTIONS_PROMPT = (specialty) => `You are a nurse manager wrapping up a mock interview for a ${specialty.name} (${specialty.shortName}) position.

The candidate has been asked "Do you have any questions for me?" — the standard closing of a real interview.

Respond as a nurse manager would:
- Answer their question naturally and helpfully
- If they ask about the unit, describe a realistic ${specialty.shortName} unit environment
- If they ask about team dynamics, growth opportunities, or orientation — answer positively and realistically
- Keep responses concise (2-3 paragraphs max)
- After answering, add: "Do you have any other questions for me?"

DO NOT score this response. DO NOT use [SCORE: X/5]. This is a conversation, not an evaluation.
DO NOT coach their question using STAR or SBAR. Just answer naturally as the hiring manager.

WALLED GARDEN: Do not provide specific clinical protocols, drug dosages, or medical advice. Keep responses about the workplace, team, and professional environment.

TONE: Warm, professional, encouraging. Make them feel like they'd want to work on your unit.`;

export default function NursingMockInterview({ specialty, onBack, userData, refreshUsage, addSession, triggerStreakRefresh, onShowPricing }) {
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

  // Shuffled + category-balanced question queue for this session
  const [interviewQuestions, setInterviewQuestions] = useState([]);

  // Per-session credit charging (not per-message) — charged on first answer
  const [sessionCharged, setSessionCharged] = useState(false);
  const sessionChargedRef = useRef(false); // ref prevents double-charge in rapid sends

  // "Do you have any questions for me?" closing phase
  const [candidateQuestionsPhase, setCandidateQuestionsPhase] = useState(false);

  // Continue/End prompt after candidate questions
  const [showContinuePrompt, setShowContinuePrompt] = useState(false);

  // Exit popup for free users who leave without answering
  const [showExitPopup, setShowExitPopup] = useState(false);

  // How many times they've continued past the initial 7 questions
  const [continueCount, setContinueCount] = useState(0);

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

  // Credit check on mount — skip recheck once session is paid for (prevents mid-session block)
  useEffect(() => {
    if (sessionCharged) return;
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
  }, [userData, sessionCharged]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Phase-based interview queue — mirrors real nursing interview progression ──
  // Real interviews follow: Opening (warmup) → Behavioral (STAR) → Clinical (SBAR) → Closing
  // Typical: 30-45 min, 5-8 questions. We select 7 per session.
  // Questions shuffled WITHIN each phase for variety, but phases stay in order.
  const buildInterviewQueue = useCallback((sourceQuestions) => {
    if (!sourceQuestions || sourceQuestions.length === 0) return [];

    const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

    // Phase 1: Opening — warmup (Motivation + beginner Technical)
    const opening = shuffle(sourceQuestions.filter(q =>
      q.category === 'Motivation' ||
      (q.category === 'Technical' && q.difficulty === 'beginner')
    ));

    // Phase 2: Behavioral — past experiences (Behavioral + STAR-based Clinical Judgment + Technical-intermediate)
    // Technical-intermediate questions are STAR-framework clinical skills (ventilators, surgical equipment, etc.)
    // that fit the behavioral section since they ask about real experience
    const behavioral = shuffle(sourceQuestions.filter(q =>
      q.category === 'Behavioral' ||
      (q.category === 'Clinical Judgment' && q.responseFramework === 'star') ||
      (q.category === 'Technical' && q.difficulty === 'intermediate')
    ));

    // Phase 3: Clinical — SBAR communication + advanced technical
    const clinical = shuffle(sourceQuestions.filter(q =>
      q.responseFramework === 'sbar' ||
      (q.category === 'Technical' && q.difficulty === 'advanced')
    ));

    // Phase 4: Closing — softer communication questions (STAR, forward-looking)
    const closing = shuffle(sourceQuestions.filter(q =>
      q.category === 'Communication' && q.responseFramework === 'star'
    ));

    // Deduplicate: questions matching multiple phase filters only get used once
    const used = new Set();
    const pick = (pool, count) => {
      const picked = [];
      for (const q of pool) {
        if (picked.length >= count) break;
        if (!used.has(q.id)) {
          picked.push(q);
          used.add(q.id);
        }
      }
      return picked;
    };

    // 1 opening + 3 behavioral + 2 clinical + 1 closing = 7 questions
    return [
      ...pick(opening, 1),
      ...pick(behavioral, 3),
      ...pick(clinical, 2),
      ...pick(closing, 1),
    ];
  }, []);

  // Start the interview session
  const startSession = useCallback(() => {
    // Build a shuffled, category-balanced queue so every session feels different
    const queue = buildInterviewQueue(questions);
    setInterviewQuestions(queue);

    const firstQuestion = queue[0];
    setCurrentQuestion(firstQuestion);
    setSessionStarted(true);

    // Reset session-level state
    setSessionCharged(false);
    sessionChargedRef.current = false;
    setCandidateQuestionsPhase(false);
    setShowContinuePrompt(false);
    setShowExitPopup(false);
    setContinueCount(0);
    setMessages([
      {
        role: 'assistant',
        content: `Thanks for coming in today. I'm the nurse manager for our ${specialty.name} unit. I'll be asking you a series of questions — just answer naturally, like you would in a real interview.\n\nReady? Let's get started.\n\n**${firstQuestion.question}**`,
        timestamp: new Date(),
      }
    ]);
  }, [questions, specialty, buildInterviewQueue]);

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
      // Cap to last 20 messages to prevent token overflow on long/continued sessions
      const recentMessages = messages.slice(-20);
      const conversationHistory = recentMessages.map(m => ({
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
            // During "any questions?" phase, use conversational prompt (no scoring)
            systemPrompt: candidateQuestionsPhase
              ? CANDIDATE_QUESTIONS_PROMPT(specialty)
              : NURSING_SYSTEM_PROMPT(specialty, currentQuestion),
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

      // Detect Anthropic API errors passed through Edge Function (overloaded, rate limit, etc.)
      if (data.type === 'error' && data.error) {
        const errType = data.error.type || 'unknown';
        const errMsg = data.error.message || 'AI service error';
        console.error('❌ Anthropic API error:', errType, errMsg);
        throw new Error(errType === 'overloaded_error'
          ? 'AI service is temporarily busy. Please try again in a moment.'
          : `AI error: ${errMsg}`);
      }

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

      // Track session result for this question (skip during "any questions?" phase — not scored)
      // GUARD: Prevent duplicate entries when user answers a follow-up for the same question
      if (currentQuestion && !candidateQuestionsPhase) {
        setSessionResults(prev => {
          if (prev.some(r => r.questionId === currentQuestion.id)) return prev;
          return [...prev, {
            question: currentQuestion.question,
            questionId: currentQuestion.id,
            responseFramework: currentQuestion.responseFramework,
            category: currentQuestion.category,
            userAnswer: userMessage,
            aiFeedback: cleanContent,
            score, // null = "Unscored" — parsing failure doesn't break flow
          }];
        });

        // Report to Command Center — only on initial answer (same guard via sessionResults length check)
        if (addSession && !sessionResults.some(r => r.questionId === currentQuestion.id)) {
          addSession(createMockInterviewSession({
            questionId: currentQuestion.id,
            question: currentQuestion.question,
            category: currentQuestion.category,
            responseFramework: currentQuestion.responseFramework,
            score,
            userAnswer: userMessage,
            aiFeedback: cleanContent,
          }));
        }
      }

      // CHARGE PER SESSION — not per-message (Battle Scar #8)
      // 1 credit = 1 full interview session (7 questions). Charged on FIRST answer only.
      // Free users who exit without answering keep their credit (see handleExit popup).
      if (userData?.user?.id && !sessionChargedRef.current) {
        sessionChargedRef.current = true;
        setSessionCharged(true);
        try {
          await incrementUsage(supabase, userData.user.id, 'nursingMock');
          updateStreakAfterSession(supabase, userData.user.id).then(() => triggerStreakRefresh?.()).catch(() => {}); // Phase 3 streak
          // Refresh parent's usage stats so dashboard stays current
          if (refreshUsage) refreshUsage();
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
  }, [currentInput, isLoading, messages, specialty, currentQuestion, userData, refreshUsage, candidateQuestionsPhase]);

  // Interviewer-style transitions — no coaching language, just move to next question naturally
  const getTransitionMessage = () => {
    const transitions = [
      "Thank you for that. Moving on —",
      "Appreciate you sharing that. Next question —",
      "Got it, thank you. Let me ask you this —",
      "Thanks for walking me through that. Here's another one —",
    ];
    return transitions[Math.floor(Math.random() * transitions.length)];
  };

  // Move to next question — uses shuffled interviewQuestions queue
  const nextQuestion = useCallback(() => {
    const nextIdx = questionIndex + 1;
    if (nextIdx < interviewQuestions.length) {
      const nextQ = interviewQuestions[nextIdx];
      // Get the most recent score from session results for a contextual transition
      const transition = getTransitionMessage();

      setQuestionIndex(nextIdx);
      setCurrentQuestion(nextQ);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `${transition}\n\n**${nextQ.question}**`,
        timestamp: new Date(),
      }]);
    } else if (!candidateQuestionsPhase && continueCount === 0) {
      // First round complete → real interview closing: "Any questions for me?"
      setCandidateQuestionsPhase(true);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `That wraps up my questions for today. Before we finish — do you have any questions for me about this role or the unit?`,
        timestamp: new Date(),
      }]);
    } else {
      // After candidate questions or continuation rounds → show continue/end prompt
      setShowContinuePrompt(true);
    }
  }, [questionIndex, interviewQuestions, sessionResults, candidateQuestionsPhase, continueCount]);

  // End session early (user clicks "End Session")
  const endSessionEarly = useCallback(() => {
    setSessionComplete(true);
  }, []);

  // Handle exit — reassures free users who leave without answering
  const handleExit = useCallback(() => {
    const isFreeTier = !userData?.isBeta &&
      userData?.tier !== 'nursing_pass' && userData?.tier !== 'annual' &&
      userData?.tier !== 'pro' && userData?.tier !== 'beta';

    // Free user opened session but never answered → show reassuring popup
    if (isFreeTier && sessionStarted && sessionResults.length === 0) {
      setShowExitPopup(true);
      return;
    }
    onBack();
  }, [userData, sessionStarted, sessionResults, onBack]);

  // Handle "Continue" — pull more questions, charge extra credit for free users
  const handleContinue = useCallback(async () => {
    const isUnlimited = userData?.isBeta || userData?.tier === 'nursing_pass' ||
      userData?.tier === 'annual' || userData?.tier === 'pro' || userData?.tier === 'beta';

    // Free tier: charge extra credit for continuing
    if (!isUnlimited && userData?.user?.id) {
      const check = canUseFeature(
        { nursing_mock: (userData.usage.nursingMock?.used || 0) },
        userData.tier,
        'nursingMock'
      );
      if (!check.allowed) {
        setCreditBlocked(true);
        // Don't close the modal — let the upgrade prompt show inside it
        return;
      }
      try {
        await incrementUsage(supabase, userData.user.id, 'nursingMock');
        if (refreshUsage) refreshUsage();
      } catch (err) {
        console.warn('⚠️ Continue credit charge failed:', err);
      }
    }

    // Pull additional questions not yet used in this session
    const usedIds = new Set(interviewQuestions.map(q => q.id));
    const remaining = questions.filter(q => !usedIds.has(q.id));
    const shuffled = [...remaining].sort(() => Math.random() - 0.5);
    const additional = shuffled.slice(0, Math.min(4, shuffled.length));

    if (additional.length === 0) {
      setShowContinuePrompt(false);
      setSessionComplete(true);
      return;
    }

    const newQueue = [...interviewQuestions, ...additional];
    const nextQ = additional[0];
    const nextIdx = interviewQuestions.length;

    setInterviewQuestions(newQueue);
    setQuestionIndex(nextIdx);
    setCurrentQuestion(nextQ);
    setCandidateQuestionsPhase(false);
    setShowContinuePrompt(false);
    setContinueCount(prev => prev + 1);

    setMessages(prev => [...prev, {
      role: 'assistant',
      content: `Great — let's continue with a few more questions.\n\n**${nextQ.question}**`,
      timestamp: new Date(),
    }]);
  }, [interviewQuestions, questions, userData, refreshUsage]);

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
        userData={userData}
        onRetry={() => {
          // Reset everything for a new session
          setMessages([]);
          setQuestionIndex(0);
          setSessionStarted(false);
          setSessionComplete(false);
          setSessionResults([]);
          setFeedback(null);
          setError(null);
          setSessionCharged(false);
          sessionChargedRef.current = false;
          setCandidateQuestionsPhase(false);
          setShowContinuePrompt(false);
          setShowExitPopup(false);
          setContinueCount(0);
          setCreditBlocked(false);
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
    const isUnlimited = userData?.isBeta || userData?.tier === 'nursing_pass' || userData?.tier === 'annual' || userData?.tier === 'pro' || userData?.tier === 'beta';

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
              Experience a realistic interview simulation with follow-up questions, tailored to {specialty.shortName} positions.
              Detailed coaching feedback is provided in your session summary.
            </p>

            {/* Credits remaining */}
            {creditInfo && !isUnlimited && (
              <div className={`text-xs mb-4 px-3 py-2 rounded-lg ${
                creditBlocked
                  ? 'bg-red-500/10 border border-red-500/20 text-red-300'
                  : 'bg-sky-500/10 border border-sky-500/20 text-sky-300'
              }`}>
                {creditBlocked
                  ? `You've used all ${creditInfo.limit} free interview sessions this month. Get a Nursing Pass for unlimited.`
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
                  'Realistic interview simulation with follow-up questions',
                  'Questions from our curated clinical content library',
                  'Silent scoring — reviewed in your session summary',
                  'Detailed coaching debrief after the interview ends',
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-300 text-xs">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {creditBlocked ? (
              <button
                onClick={onShowPricing}
                className="block w-full text-center font-semibold py-3 rounded-xl transition-all bg-gradient-to-r from-purple-600 to-sky-500 text-white shadow-lg shadow-purple-500/30 hover:-translate-y-0.5"
              >
                Get Nursing Pass — Unlimited Interviews
              </button>
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
            onClick={handleExit}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Exit</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-lg">{specialty.icon}</span>
            <span className="text-white font-medium text-sm">{specialty.shortName} Interview</span>
            <span className="text-slate-500 text-xs">
              {candidateQuestionsPhase
                ? 'Your Questions'
                : `Q${questionIndex + 1}/${interviewQuestions.length}`
              }
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
          {/* Action buttons — different for normal vs candidate questions phase */}
          <div className="flex gap-2 mb-3">
            {candidateQuestionsPhase ? (
              <>
                <button
                  onClick={() => setShowContinuePrompt(true)}
                  className="text-xs text-sky-400 hover:text-sky-300 bg-sky-500/10 border border-sky-500/20 px-3 py-1.5 rounded-full transition-colors"
                >
                  Wrap Up Interview
                </button>
                <span className="text-xs text-slate-500 self-center">Type a question or wrap up</span>
              </>
            ) : (
              <>
                <button
                  onClick={nextQuestion}
                  className="text-xs text-sky-400 hover:text-sky-300 bg-sky-500/10 border border-sky-500/20 px-3 py-2.5 rounded-full transition-colors"
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
                    setError(null);
                    setSessionCharged(false);
                    sessionChargedRef.current = false;
                    setCandidateQuestionsPhase(false);
                    setShowContinuePrompt(false);
                    setShowExitPopup(false);
                    setContinueCount(0);
                    setCreditBlocked(false);
                  }}
                  className="text-xs text-slate-400 hover:text-slate-300 bg-white/5 border border-white/10 px-3 py-2.5 rounded-full transition-colors flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  Restart
                </button>
                {sessionResults.length > 0 && (
                  <button
                    onClick={endSessionEarly}
                    className="text-xs text-amber-400 hover:text-amber-300 bg-amber-500/10 border border-amber-500/20 px-3 py-2.5 rounded-full transition-colors"
                  >
                    End Session →
                  </button>
                )}
              </>
            )}
          </div>

          {/* Credit blocked alert — shown mid-session when credits hit zero */}
          {creditBlocked && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-3 text-center">
              <p className="text-red-300 text-xs mb-1">You've used all free interview sessions this month.</p>
              <button onClick={onShowPricing} className="text-xs font-medium text-white bg-gradient-to-r from-purple-600 to-sky-500 px-3 py-1 rounded-lg inline-block">
                Get Nursing Pass
              </button>
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

      {/* ── EXIT POPUP: Free users who leave without answering ── */}
      <AnimatePresence>
        {showExitPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-800 border border-white/10 rounded-2xl p-6 max-w-sm w-full text-center"
            >
              <div className="text-4xl mb-3">👋</div>
              <h3 className="text-white text-lg font-bold mb-2">No Credit Used</h3>
              <p className="text-slate-300 text-sm mb-6 leading-relaxed">
                We noticed you opened just to view — don't worry, you still have your credit remaining!
              </p>
              <button
                onClick={() => { setShowExitPopup(false); onBack(); }}
                onTouchEnd={(e) => { e.preventDefault(); setShowExitPopup(false); onBack(); }}
                className="w-full bg-sky-600 text-white font-semibold py-3 rounded-xl hover:bg-sky-500 transition-colors"
              >
                Got It
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── CONTINUE PROMPT: After candidate questions — continue or end? ── */}
      <AnimatePresence>
        {showContinuePrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-800 border border-white/10 rounded-2xl p-6 max-w-md w-full"
            >
              <div className="text-center mb-6">
                <div className="text-4xl mb-3">{specialty.icon}</div>
                <h3 className="text-white text-lg font-bold mb-1">Interview Complete</h3>
                <p className="text-slate-400 text-sm">
                  You've answered {sessionResults.length} question{sessionResults.length !== 1 ? 's' : ''}. Want to keep going?
                </p>
              </div>

              {(() => {
                const isUnlimited = userData?.isBeta || userData?.tier === 'nursing_pass' ||
                  userData?.tier === 'annual' || userData?.tier === 'pro' || userData?.tier === 'beta';
                const usedIds = new Set(interviewQuestions.map(q => q.id));
                const remainingQs = questions.filter(q => !usedIds.has(q.id));
                const canContinue = remainingQs.length > 0;

                return canContinue ? (
                  <div className="space-y-3">
                    <button
                      onClick={handleContinue}
                      onTouchEnd={(e) => { e.preventDefault(); handleContinue(); }}
                      className="w-full bg-gradient-to-r from-sky-600 to-cyan-500 text-white font-semibold py-3 rounded-xl shadow-lg shadow-sky-500/30 hover:-translate-y-0.5 transition-all"
                    >
                      Continue with More Questions
                      {!isUnlimited && (
                        <span className="block text-xs text-sky-200 mt-0.5">(Uses 1 additional credit)</span>
                      )}
                    </button>
                    {creditBlocked && (
                      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-center">
                        <p className="text-red-300 text-xs mb-2">No credits remaining.</p>
                        <button onClick={onShowPricing} className="text-xs font-medium text-white bg-gradient-to-r from-purple-600 to-sky-500 px-3 py-1 rounded-lg">
                          Get Nursing Pass
                        </button>
                      </div>
                    )}
                    <button
                      onClick={() => { setShowContinuePrompt(false); setSessionComplete(true); }}
                      onTouchEnd={(e) => { e.preventDefault(); setShowContinuePrompt(false); setSessionComplete(true); }}
                      className="w-full bg-white/10 border border-white/20 text-white font-semibold py-3 rounded-xl hover:bg-white/20 transition-all"
                    >
                      End Interview & View Summary
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-center text-slate-400 text-sm">You've covered all available questions — impressive!</p>
                    <button
                      onClick={() => { setShowContinuePrompt(false); setSessionComplete(true); }}
                      onTouchEnd={(e) => { e.preventDefault(); setShowContinuePrompt(false); setSessionComplete(true); }}
                      className="w-full bg-gradient-to-r from-sky-600 to-cyan-500 text-white font-semibold py-3 rounded-xl"
                    >
                      View Interview Summary
                    </button>
                  </div>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
