// NursingTrack — AI Answer Coach (NursingAnswerAssistant)
// Motivational Interviewing–based conversation to help nurses craft their "Best Answer."
//
// Modeled on src/Components/AnswerAssistant.jsx (648 lines) — adapted for:
//   - Dark theme (nursing track UI)
//   - C.O.A.C.H. protocol for AI conversation design
//   - Walled garden enforcement (NEVER generate clinical content)
//   - Self-efficacy framework (all 4 sources)
//   - STAR/SBAR/Theory framework awareness
//
// Credit feature: 'nursingCoach' (uses nursing_coach pool, same as NursingAICoach)
// Charge-after-success pattern (Battle Scar #8)
// fetchWithRetry (Battle Scar #3 — 3 attempts, backoff)
//
// ⚠️ D.R.A.F.T. Protocol: NEW file. No existing code modified.

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, MessageCircle, Sparkles, Save, Loader2, CheckCircle,
  AlertTriangle, HelpCircle, RefreshCw, Zap, Send, Stethoscope, Wind
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { fetchWithRetry } from '../../utils/fetchWithRetry';
import { upsertSavedAnswer } from './nursingSupabase';
import { getFrameworkDetails } from './nursingQuestions';

// ============================================================
// PROMPT ENGINEERING — C.O.A.C.H. Protocol + Walled Garden
// ============================================================

// Theory question detection (reused from NursingPracticeMode.jsx:59)
const isTheoryQuestion = (questionText) =>
  /^(How do you|What is your|Describe your|What steps|What factors|What approach|How would you|What do you consider)/i.test(questionText);

/**
 * MI Probing system prompt — draws out the nurse's real experience.
 * C.O.A.C.H. adapted for answer crafting.
 */
const buildProbingPrompt = (question, specialty, exchangeCount) => {
  const isTheory = isTheoryQuestion(question.question);
  const isSBAR = question.responseFramework === 'sbar';
  const frameworkLabel = isSBAR ? 'SBAR' : 'STAR';
  const framework = getFrameworkDetails(question.clinicalFramework);

  return `[C] CONTEXT SET: You are a nursing interview coach using Motivational Interviewing.
The nurse is crafting an answer for: "${question.question}"
Specialty: ${specialty.name} (${specialty.shortName})
Framework: ${isTheory ? 'Theory/Knowledge (no forced ' + frameworkLabel + ')' : frameworkLabel}
${framework ? `Clinical framework: ${framework.name} — ${framework.source}` : ''}

[O] QUESTION SOURCE: This question is from our curated library. You are helping
the nurse craft THEIR answer using THEIR real clinical experience.

[A] YOUR ROLE: Ask ONE warm, open-ended question to draw out their real experience.
Use MI principles: open questions, affirmations, reflective listening, summaries.
Focus on drawing out concrete details: specific patients, specific actions, specific outcomes.
If the user's response is very brief (5 or fewer words) or vague ("ok", "yes", "I don't know"):
- Do NOT affirm content that doesn't exist — do NOT say "That's a great start" for a response with no substance
- Instead, gently redirect: "I want to capture your real experience — can you tell me about a specific time this came up?" or "Even a brief example would help — what's one situation where you dealt with this?"
${isTheory
    ? 'This is a THEORY/KNOWLEDGE question — draw out their methodology and approach, not a specific past event.'
    : isSBAR
      ? 'This is a CLINICAL SCENARIO question — draw out SBAR details: Situation, Background, Assessment, Recommendation.'
      : 'This is a BEHAVIORAL question — draw out STAR details: Situation, Task, Action, Result.'
  }

[C] COACHING LAYERS:
- After each exchange, briefly affirm what they shared (Verbal Persuasion — be genuine, match praise to quality)
- If they've shared good detail, acknowledge their growth: "You're getting more specific — that's exactly what interviewers want to hear"
- Then ask the next probing question to deepen their answer
${exchangeCount >= 4 ? '- They have shared several exchanges. Start wrapping up with a brief summary of what they\'ve shared so far.' : ''}

[H] WALLED GARDEN — ABSOLUTE:
You are drawing out THEIR experience. NEVER invent clinical scenarios, drug dosages, or protocols.
NEVER generate clinical content. NEVER tell them what to say.
If they ask you what to say, redirect: "What actually happened in your experience?"
If they ask a clinical knowledge question, redirect: "That's a great clinical question — check your facility protocols or resources like UpToDate. Let's focus on how you'd communicate that in an interview."

Return ONLY your question or response — no preamble, no labels, no markdown headers.`;
};

/**
 * Synthesis system prompt — turns conversation into a polished interview answer.
 * Uses ONLY facts the user actually shared (walled garden).
 */
const buildSynthesisPrompt = (question, isRush) => {
  const isTheory = isTheoryQuestion(question.question);
  const isSBAR = question.responseFramework === 'sbar';

  const frameworkInstructions = isTheory
    ? 'Structure as: Clear approach → Specific methodology → Real-world grounding. Do NOT force STAR or SBAR on this theory question.'
    : isSBAR
      ? 'Structure as: Situation → Background → Assessment → Recommendation (SBAR).'
      : 'Structure as: Situation → Task → Action → Result (STAR).';

  return `Synthesize the nurse's experiences from the conversation below into a polished
interview answer for: "${question.question}"

${frameworkInstructions}

RULES:
1. Use ONLY facts and details they actually shared. Do NOT invent anything.
2. Preserve their strongest phrases and natural voice.
3. Fill in reasonable connective tissue between their ideas.
4. Keep it conversational — this should sound like THEM, not a textbook.
5. Include a Result/outcome if they shared one. Accept reflection, closure, and values-based conclusions as valid results.
6. ${isRush ? '100-200 words' : '150-300 words'}. No bullet points — paragraph form.
7. NEVER add clinical details they didn't mention.
8. NEVER add drug names, dosages, protocols, or medical facts from your training data.

Return ONLY the synthesized answer — no commentary, no score, no headers.`;
};

// ============================================================
// CLEAN AI RESPONSE (adapted from AnswerAssistant.jsx)
// ============================================================
const cleanAIResponse = (text) => {
  if (!text) return '';
  try {
    const trimmed = text.trim();
    // Check if entire response is JSON metadata (backend error)
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (parsed.error !== undefined || parsed.mode !== undefined) {
          console.error('Backend returned metadata instead of answer:', parsed);
          return '';
        }
      } catch { /* not JSON, proceed */ }
    }
    let cleaned = text;
    cleaned = cleaned.replace(/```[\s\S]*?```/g, '');
    cleaned = cleaned.replace(/`([^`]+)`/g, '$1');
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
    return cleaned.trim();
  } catch {
    return text;
  }
};

// ============================================================
// COMPONENT
// ============================================================
export default function NursingAnswerAssistant({
  question,
  specialty,
  userData,
  existingAnswer,
  onAnswerSaved,
  onClose,
  refreshUsage,
  onShowPricing,
}) {
  const hasExistingAnswer = existingAnswer && existingAnswer.trim().length > 0;

  // Stage flow: existing-answer → intro → probing → complete
  const [stage, setStage] = useState(hasExistingAnswer ? 'existing-answer' : 'intro');
  const [conversation, setConversation] = useState([]); // { role: 'assistant'|'user', text: string }
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedAnswer, setGeneratedAnswer] = useState(null);
  const [isRushAnswer, setIsRushAnswer] = useState(false);
  const [showMIInfo, setShowMIInfo] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);

  // Focus input when probing
  useEffect(() => {
    if (stage === 'probing' && inputRef.current && !isLoading) {
      inputRef.current.focus();
    }
  }, [stage, isLoading, conversation]);

  const userId = userData?.user?.id;
  const isProUser = userData?.isBeta || userData?.tier === 'nursing_pass' || userData?.tier === 'annual' || userData?.tier === 'pro' || userData?.tier === 'beta';

  // Framework display
  const isTheory = isTheoryQuestion(question.question);
  const isSBAR = question.responseFramework === 'sbar';
  const frameworkLabel = isTheory ? 'Theory' : isSBAR ? 'SBAR' : 'STAR';

  // ============================================================
  // AI CALLS — route through existing nursing-coach Edge Function
  // ============================================================

  /** Start the MI conversation — first AI question */
  const startConversation = async () => {
    setIsLoading(true);
    setStage('probing');
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('Not authenticated. Please sign in again.');

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
            nursingFeature: 'nursingCoach',
            systemPrompt: buildProbingPrompt(question, specialty, 0),
            conversationHistory: [],
            userMessage: `[SYSTEM: The nurse is ready to craft their answer for: "${question.question}". Ask your first warm, open-ended question to draw out their experience.]`,
          }),
        }
      );

      if (!response.ok) {
        const errText = await response.text();
        console.error('❌ Answer Coach start error:', response.status, errText);
        throw new Error(`AI failed: ${response.status}`);
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

      const rawContent = data.content?.[0]?.text || data.response || data.feedback || '';
      const cleaned = cleanAIResponse(rawContent);

      if (!cleaned) throw new Error('No response from AI');

      setConversation([{ role: 'assistant', text: cleaned }]);
    } catch (err) {
      console.error('❌ startConversation error:', err);
      setError(err.message || 'Failed to start. Please try again.');
      setStage('intro'); // Go back to intro so they can retry
    } finally {
      setIsLoading(false);
    }
  };

  /** Continue MI conversation — user sends a message */
  const sendMessage = async () => {
    if (!userInput.trim() || isLoading) return;

    const userText = userInput.trim();
    const newConversation = [...conversation, { role: 'user', text: userText }];
    setConversation(newConversation);
    setUserInput('');
    setIsLoading(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('Session expired. Please refresh.');

      // Build conversation history for the Edge Function
      const conversationHistory = newConversation.map(m => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.text,
      }));

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
            nursingFeature: 'nursingCoach',
            systemPrompt: buildProbingPrompt(question, specialty, Math.floor(newConversation.length / 2)),
            conversationHistory: conversationHistory,
            userMessage: userText,
          }),
        }
      );

      if (!response.ok) throw new Error(`AI failed: ${response.status}`);

      const data = await response.json();

      // Detect Anthropic API errors passed through Edge Function
      if (data.type === 'error' && data.error) {
        const errType = data.error.type || 'unknown';
        const errMsg = data.error.message || 'AI service error';
        console.error('❌ Anthropic API error:', errType, errMsg);
        throw new Error(errType === 'overloaded_error'
          ? 'AI is temporarily busy. Please try again in a moment.'
          : `AI error: ${errMsg}`);
      }

      const rawContent = data.content?.[0]?.text || data.response || data.feedback || '';
      const cleaned = cleanAIResponse(rawContent);

      if (!cleaned) throw new Error('Empty AI response');

      setConversation([...newConversation, { role: 'assistant', text: cleaned }]);
    } catch (err) {
      console.error('❌ sendMessage error:', err);
      setConversation([...newConversation, {
        role: 'assistant',
        text: `⚠️ Sorry, something went wrong: ${err.message}. Please try again.`,
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  /** Synthesize conversation into a polished answer */
  const synthesizeAnswer = async (isRush = false) => {
    setIsLoading(true);
    setIsRushAnswer(isRush);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('Session expired.');

      // Build the full conversation for synthesis
      const conversationHistory = conversation.map(m => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.text,
      }));

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
            nursingFeature: 'nursingCoach',
            systemPrompt: buildSynthesisPrompt(question, isRush),
            conversationHistory: conversationHistory,
            userMessage: '[SYSTEM: Synthesize the nurse\'s experiences from the conversation above into a polished interview answer. Return ONLY the answer text.]',
          }),
        }
      );

      if (!response.ok) throw new Error(`Synthesis failed: ${response.status}`);

      const data = await response.json();

      // Detect Anthropic API errors passed through Edge Function
      if (data.type === 'error' && data.error) {
        const errType = data.error.type || 'unknown';
        const errMsg = data.error.message || 'AI service error';
        console.error('❌ Anthropic API error:', errType, errMsg);
        throw new Error(errType === 'overloaded_error'
          ? 'AI is temporarily busy. Please try again in a moment.'
          : `AI error: ${errMsg}`);
      }

      const rawContent = data.content?.[0]?.text || data.response || data.feedback || '';
      const cleaned = cleanAIResponse(rawContent);

      // Guard: check total REAL user content, not just AI output length
      // Prevents synthesis from fabricating answers when user gave minimal input
      const userMessages = conversation.filter(m => m.role === 'user');
      const totalUserWords = userMessages.reduce(
        (sum, m) => sum + m.text.trim().split(/\s+/).filter(Boolean).length, 0
      );

      if (!cleaned || cleaned.length < 20 || totalUserWords < 15) {
        setError('Not enough detail to create a polished answer yet. Share a bit more about your experience — specific examples make the strongest answers!');
        setIsLoading(false);
        return;
      }

      setGeneratedAnswer(cleaned);
      setStage('complete');
    } catch (err) {
      console.error('❌ synthesizeAnswer error:', err);
      setError(err.message || 'Failed to create answer. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  /** Save the generated answer as "My Best Answer" */
  const saveAnswer = async () => {
    if (!userId || !generatedAnswer) return;
    setIsLoading(true);

    try {
      const result = await upsertSavedAnswer(userId, question.id, generatedAnswer.trim());
      if (result.success) {
        setSaved(true);
        // localStorage fallback
        try {
          const local = JSON.parse(localStorage.getItem(`nursing_saved_answers_${userId}`) || '{}');
          local[question.id] = generatedAnswer.trim();
          localStorage.setItem(`nursing_saved_answers_${userId}`, JSON.stringify(local));
        } catch { /* ignore */ }

        if (onAnswerSaved) {
          onAnswerSaved({ answerText: generatedAnswer.trim() });
        }
      } else {
        setError('Save failed. Please try again.');
      }
    } catch (err) {
      console.error('❌ saveAnswer error:', err);
      setError('Save failed: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  /** Go back to probing to keep working */
  const keepWorking = () => {
    setStage('probing');
    setGeneratedAnswer(null);
    setIsRushAnswer(false);
    setSaved(false);
  };

  /** Start completely over */
  const startOver = () => {
    setStage('intro');
    setConversation([]);
    setGeneratedAnswer(null);
    setIsRushAnswer(false);
    setSaved(false);
    setError(null);
  };

  // Handle Enter key in input
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // User exchange count (for button visibility)
  const userExchanges = conversation.filter(m => m.role === 'user').length;

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-slate-900 border border-white/10 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-900 to-cyan-900 border-b border-white/10 p-5 flex-shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Stethoscope className="w-7 h-7 text-sky-300" />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-white">AI Answer Coach</h3>
                  <button
                    onClick={() => setShowMIInfo(!showMIInfo)}
                    className="hover:bg-white/10 rounded-full p-1 transition"
                    title="What is Motivational Interviewing?"
                  >
                    <HelpCircle className="w-4 h-4 text-sky-300/70" />
                  </button>
                </div>
                {showMIInfo ? (
                  <p className="text-xs text-sky-200/80 mt-1 bg-white/5 rounded px-2 py-1">
                    <strong>Motivational Interviewing (MI)</strong> draws out YOUR real experiences through thoughtful questions. I'll never tell you what to say — I'll help you discover your best answer.
                  </p>
                ) : (
                  <p className="text-xs text-sky-200/60">Craft your best answer through guided conversation</p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/60 hover:text-white hover:bg-white/10 rounded-full p-2 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          {/* Framework badge + question preview */}
          <div className="mt-3 flex items-center gap-2">
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
              isTheory ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
              : isSBAR ? 'bg-green-500/20 text-green-300 border border-green-500/30'
              : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
            }`}>
              {frameworkLabel}
            </span>
            <p className="text-sky-100/70 text-xs truncate flex-1">{question.question}</p>
          </div>
        </div>

        {/* Content area — scrollable */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* Error banner */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
              <p className="text-red-300 text-xs">{error}</p>
              <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-300">
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* ── STAGE: EXISTING ANSWER ── */}
          {stage === 'existing-answer' && (
            <div className="py-4">
              <div className="text-center mb-5">
                <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-3" />
                <h4 className="text-lg font-bold text-white mb-1">This Question Has a Saved Answer</h4>
                <p className="text-slate-400 text-sm">Creating a new answer will replace the existing one.</p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-5">
                <p className="text-slate-500 text-xs font-medium mb-2">Current saved answer:</p>
                <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">
                  {existingAnswer}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={onClose}
                  className="py-3 rounded-xl bg-white/10 border border-white/20 text-white font-semibold text-sm hover:bg-white/20 transition-all"
                >
                  Keep Current
                </button>
                <button
                  onClick={() => setStage('intro')}
                  className="py-3 rounded-xl bg-gradient-to-r from-amber-600 to-orange-500 text-white font-semibold text-sm shadow-lg hover:-translate-y-0.5 transition-all"
                >
                  Create New Answer
                </button>
              </div>
            </div>
          )}

          {/* ── STAGE: INTRO ── */}
          {stage === 'intro' && (
            <div className="py-6 text-center">
              <div className="text-5xl mb-4">💬</div>
              <h4 className="text-lg font-bold text-white mb-3">Let's craft your best answer</h4>

              <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-5 text-left">
                <p className="text-white text-sm font-medium mb-1">"{question.question}"</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    isTheory ? 'bg-blue-500/20 text-blue-300'
                    : isSBAR ? 'bg-green-500/20 text-green-300'
                    : 'bg-purple-500/20 text-purple-300'
                  }`}>
                    {frameworkLabel}
                  </span>
                  <span className="text-slate-500 text-[10px]">{question.category}</span>
                </div>
              </div>

              <p className="text-slate-400 text-sm mb-5 leading-relaxed max-w-md mx-auto">
                I'll guide you using <strong className="text-sky-300">Motivational Interviewing</strong> — a technique that draws out your real experiences through thoughtful questions.
                You'll end up with a polished, authentic answer.
              </p>

              {isProUser ? (
                <button
                  onClick={startConversation}
                  onTouchEnd={(e) => { e.preventDefault(); if (!isLoading) startConversation(); }}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-sky-600 to-cyan-500 text-white px-8 py-3 rounded-xl font-semibold text-sm shadow-lg shadow-sky-500/30 hover:-translate-y-0.5 transition-all disabled:opacity-50"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Starting...</span>
                  ) : (
                    "Let's Get Started"
                  )}
                </button>
              ) : (
                <div>
                  <p className="text-slate-500 text-xs mb-3">AI Answer Coach requires a Nursing Pass</p>
                  <button
                    onClick={onShowPricing}
                    className="bg-gradient-to-r from-purple-600 to-sky-500 text-white px-6 py-2.5 rounded-xl font-semibold text-sm shadow-lg hover:-translate-y-0.5 transition-all"
                  >
                    Upgrade to Use AI Coach
                  </button>
                </div>
              )}

              <p className="text-slate-600 text-xs mt-4">Uses AI Coach credits</p>
            </div>
          )}

          {/* ── STAGE: PROBING (MI Conversation) ── */}
          {stage === 'probing' && (
            <>
              {/* Conversation messages */}
              <div className="space-y-3 mb-4">
                {conversation.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="w-7 h-7 rounded-full bg-sky-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                        <Stethoscope className="w-3.5 h-3.5 text-sky-400" />
                      </div>
                    )}
                    <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      msg.role === 'user'
                        ? 'bg-sky-600 text-white'
                        : 'bg-white/10 text-slate-200'
                    }`}>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    </div>
                  </div>
                ))}

                {/* Loading dots */}
                {isLoading && (
                  <div className="flex gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-sky-500/20 flex items-center justify-center flex-shrink-0">
                      <Stethoscope className="w-3.5 h-3.5 text-sky-400" />
                    </div>
                    <div className="bg-white/10 rounded-2xl px-4 py-3">
                      <div className="flex gap-1.5">
                        <div className="w-2 h-2 bg-sky-400/60 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-sky-400/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <div className="w-2 h-2 bg-sky-400/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input + action buttons */}
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Share your experience..."
                    disabled={isLoading}
                    className="flex-1 bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/30"
                  />
                  <button
                    onClick={sendMessage}
                    onTouchEnd={(e) => { e.preventDefault(); if (!isLoading && userInput.trim()) sendMessage(); }}
                    disabled={isLoading || !userInput.trim()}
                    className={`p-3 rounded-xl transition-all flex-shrink-0 ${
                      userInput.trim() && !isLoading
                        ? 'bg-sky-600 text-white shadow-lg shadow-sky-500/30 hover:-translate-y-0.5'
                        : 'bg-white/10 text-white/30 cursor-not-allowed'
                    }`}
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>

                {/* Synthesis buttons — appear after enough conversation */}
                {userExchanges >= 1 && (
                  <div className="space-y-2">
                    {/* Quick Synthesis — available after 1+ exchange, hidden after 3+ */}
                    {userExchanges >= 1 && userExchanges < 3 && (
                      <button
                        onClick={() => synthesizeAnswer(true)}
                        onTouchEnd={(e) => { e.preventDefault(); if (!isLoading) synthesizeAnswer(true); }}
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 font-medium text-sm hover:bg-amber-500/20 transition-all disabled:opacity-50"
                      >
                        <Zap className="w-4 h-4" /> Quick Synthesis
                      </button>
                    )}

                    {/* Full Polished Answer — available after 3+ exchanges */}
                    {userExchanges >= 3 && (
                      <button
                        onClick={() => synthesizeAnswer(false)}
                        onTouchEnd={(e) => { e.preventDefault(); if (!isLoading) synthesizeAnswer(false); }}
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-500 text-white font-semibold text-sm shadow-lg shadow-sky-500/30 hover:-translate-y-0.5 transition-all disabled:opacity-50"
                      >
                        <Sparkles className="w-4 h-4" /> Create Polished Answer
                      </button>
                    )}
                  </div>
                )}

                {/* Progress indicator */}
                <p className="text-slate-600 text-xs text-center">
                  {userExchanges === 0
                    ? 'Answer the question above to begin'
                    : userExchanges < 3
                      ? `${userExchanges} exchange${userExchanges !== 1 ? 's' : ''} · Quick synthesis available · ${3 - userExchanges} more for polished answer`
                      : `${userExchanges} exchanges · Ready for polished answer`
                  }
                </p>
              </div>
            </>
          )}

          {/* ── STAGE: COMPLETE ── */}
          {stage === 'complete' && generatedAnswer && (
            <div className="py-2">
              {/* Success header */}
              <div className="text-center mb-5">
                <div className="text-4xl mb-2">✨</div>
                <h4 className="text-lg font-bold text-white">
                  {isRushAnswer ? 'Quick Answer Ready' : 'Your Polished Answer'}
                </h4>
                <p className="text-slate-400 text-sm mt-1">
                  {isRushAnswer
                    ? "Here's a solid answer based on what you've shared so far"
                    : "Based on our full conversation — in your own words"}
                </p>
                {isRushAnswer && (
                  <p className="text-xs text-amber-300 mt-1">
                    ⚡ Continue the conversation for an even better answer
                  </p>
                )}
              </div>

              {/* Draft disclaimer — remind user to review and personalize */}
              <p className="text-slate-500 text-xs mb-3 px-1 italic text-center">
                Draft based on what you shared — review and personalize before saving. Add your own specific details for the strongest answer.
              </p>

              {/* Breathing prompt (Physiological Management — self-efficacy source #4) */}
              <div className="bg-teal-500/10 border border-teal-500/20 rounded-xl p-3 mb-4 flex items-center gap-2">
                <Wind className="w-4 h-4 text-teal-300 flex-shrink-0" />
                <p className="text-teal-300/80 text-xs">Take a deep breath. You just crafted a polished answer from your real experience — that's a real accomplishment.</p>
              </div>

              {/* Generated answer display */}
              <div className="bg-sky-500/5 border-2 border-sky-500/20 rounded-xl p-5 mb-5">
                <p className="text-slate-200 leading-relaxed text-sm whitespace-pre-wrap">{generatedAnswer}</p>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 mb-3">
                <button
                  onClick={keepWorking}
                  onTouchEnd={(e) => { e.preventDefault(); keepWorking(); }}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white/10 border border-white/20 text-white font-semibold text-sm hover:bg-white/20 transition-all"
                >
                  <RefreshCw className="w-4 h-4" /> Keep Working
                </button>
                <button
                  onClick={saveAnswer}
                  onTouchEnd={(e) => { e.preventDefault(); if (!isLoading && !saved) saveAnswer(); }}
                  disabled={isLoading || saved}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all ${
                    saved
                      ? 'bg-green-500/10 border border-green-500/20 text-green-300 cursor-default'
                      : 'bg-gradient-to-r from-sky-600 to-cyan-500 text-white shadow-lg shadow-sky-500/30 hover:-translate-y-0.5'
                  } disabled:opacity-50`}
                >
                  {isLoading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                  ) : saved ? (
                    <><CheckCircle className="w-4 h-4" /> Saved!</>
                  ) : (
                    <><Save className="w-4 h-4" /> Save as Best Answer</>
                  )}
                </button>
              </div>

              {saved && (
                <p className="text-green-300/70 text-xs text-center mb-3">
                  ✅ Saved to your Question Bank. Your IRS Answer Preparedness score will update.
                </p>
              )}

              <button
                onClick={startOver}
                className="w-full text-center text-slate-500 hover:text-slate-300 text-xs py-2 transition-colors"
              >
                Start Over with a Fresh Conversation
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-white/5 px-5 py-3 flex-shrink-0">
          <p className="text-slate-600 text-[10px] text-center">
            AI draws out YOUR experience • Never generates clinical content • Walled garden enforced
          </p>
        </div>
      </motion.div>
    </div>
  );
}
