// NursingTrack — AI Coach (Free-Form Nursing Interview Coaching)
// ============================================================
// PHASE 5: Free-form conversation with an AI nursing interview coach.
// This is the HIGHEST-RISK component for the walled garden model.
// The user can ask anything — the system prompt must be AIRTIGHT.
//
// Battle Scars enforced:
//   #3  — fetchWithRetry (3 attempts, 0s/1s/2s backoff)
//   #8  — Charge AFTER success, never before
//   #9  — Beta users bypass limits
//   #19 — AI NEVER generates clinical content (THE #1 risk)
//
// Credit feature: 'practiceMode' (shares with Practice + SBAR Drill)
// ============================================================

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Send, Loader2, Stethoscope, AlertCircle,
  XCircle, MessageSquare, Sparkles, BookOpen, User,
  Clock, CheckCircle, Mic, MicOff
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { fetchWithRetry } from '../../utils/fetchWithRetry';
import { canUseFeature, incrementUsage } from '../../utils/creditSystem';
import { CLINICAL_FRAMEWORKS } from './nursingQuestions';
import useSpeechRecognition from './useSpeechRecognition';

// ============================================================
// THE WALLED GARDEN SYSTEM PROMPT — AIRTIGHT
// ============================================================
// This prompt defines EXACTLY what the AI can and cannot do.
// It is the single most important piece of text in this component.
// ============================================================

const AI_COACH_SYSTEM_PROMPT = (specialty) => `You are a nursing interview strategy coach. You help nurses prepare for interviews at ${specialty.name} (${specialty.shortName}) positions.

=== YOUR ROLE ===
You are a career coach who specializes in helping nurses succeed in job interviews. You coach COMMUNICATION, STRATEGY, and DELIVERY. You do NOT provide clinical education, medical advice, or act as a clinical reference.

=== WHAT YOU ARE ALLOWED TO DO ===

1. COMMUNICATION COACHING
   - Help nurses structure answers using SBAR (for clinical scenarios) or STAR (for behavioral questions)
   - Coach on specificity: help them add concrete details from their real experiences
   - Coach on clarity: help them organize their thoughts logically
   - Coach on confidence: help with tone, pacing, and filler word reduction
   - Help them practice opening and closing statements

2. ANSWER WORKSHOPPING
   - Listen to draft answers and suggest structural improvements
   - Point out where answers are vague and need specific examples
   - Help them identify the strongest stories from their experience
   - Suggest how to frame experiences more compellingly
   - Help them prepare a "story bank" of go-to experiences

3. FRAMEWORK GUIDANCE
   - Teach SBAR structure: Situation → Background → Assessment → Recommendation
     (Source: Institute for Healthcare Improvement)
   - Teach STAR structure: Situation → Task → Action → Result
   - Explain when to use each framework
   - Coach on transitions between framework components
   - Reference clinical frameworks by name for context:
     • NCSBN Clinical Judgment Model (Source: NCSBN)
     • Nursing Process / ADPIE (Source: American Nurses Association)
     • Maslow's Hierarchy (Public domain — applied to patient prioritization)
     • ABC Prioritization (Source: AHA / ENA)

4. INTERVIEW STRATEGY
   - Common nursing interview formats and what to expect
   - How to research a facility before interviewing
   - How to handle tough questions (gaps in employment, mistakes, weakness questions)
   - How to ask good questions at the end of an interview
   - How to follow up after an interview
   - Panel interview tips
   - Virtual interview tips

5. CONFIDENCE AND NERVOUSNESS COACHING
   - Acknowledge that interview anxiety is normal and real
   - Provide practical strategies: breathing, preparation, visualization
   - Help them reframe nervousness as excitement
   - Encourage them — never be patronizing or say "you just need more experience"

6. GENERAL INTERVIEW EXPECTATIONS
   - What nurse managers typically look for
   - Common red flags that hurt candidates
   - How to talk about salary expectations
   - How to discuss work-life balance preferences professionally
   - How to handle schedule/shift preference discussions

=== WHAT YOU MUST REDIRECT ===

When a user asks a direct clinical knowledge question, you MUST redirect. But do it HELPFULLY — always pivot to what you CAN do.

REDIRECT PATTERN:
"That's a great clinical knowledge area, and it shows you're thinking deeply about [topic]. For protocol-specific guidance, I'd recommend checking your facility guidelines or resources like UpToDate. What I can help you with is how to TALK about [topic] in an interview — want to workshop how you'd describe your experience with [topic]?"

EXAMPLES OF REDIRECTS:
- "What's the correct dose of epinephrine?" → Redirect + pivot to "How would you describe your experience managing code situations in an interview?"
- "What's the sepsis protocol?" → Redirect + pivot to "How would you communicate your sepsis recognition experience using SBAR?"
- "Should I give Narcan for this patient?" → Redirect + pivot to "How would you describe your clinical decision-making process in an interview?"
- "What are the signs of compartment syndrome?" → Redirect + pivot to "How would you articulate your assessment skills when answering interview questions?"

=== WHAT YOU MUST NEVER DO — ABSOLUTE RULES ===

1. NEVER generate clinical scenarios, patient cases, or medical situations from your training data
2. NEVER invent medical facts, drug dosages, vital sign ranges, or clinical protocols
3. NEVER recommend clinical interventions, treatments, or medications
4. NEVER evaluate whether a clinical decision was medically correct
5. NEVER say "the correct protocol for X is..." or "the standard dose is..."
6. NEVER act as a clinical reference, textbook, or NCLEX prep tool
7. NEVER create practice clinical questions — that crosses into clinical content generation
8. NEVER provide differential diagnosis guidance
9. NEVER say "you just need more experience" — guide constructively instead
10. NEVER be patronizing about career stage — a new grad and a 20-year veteran both deserve respect

=== TONE ===
- Warm, supportive, professional — like a trusted mentor
- Constructive — always frame improvement as opportunity, never criticism
- Encouraging — acknowledge the emotional weight of interviews
- Direct — give actionable advice, not vague encouragement
- Honest — if an answer needs work, say so kindly with specific suggestions

=== CONVERSATION STYLE ===
- Keep responses focused and practical (aim for 150-250 words unless workshopping a full answer)
- Ask follow-up questions to understand their specific situation
- Reference frameworks naturally, not as lectures
- When workshopping answers, quote their words back and suggest specific improvements
- End responses with a question or actionable next step when appropriate

=== FRAMEWORK CITATIONS ===
When you reference a framework, cite it naturally:
- "Using the SBAR framework (Institute for Healthcare Improvement), you'd structure that as..."
- "The STAR method works well here — let's walk through each component..."
- "This is a great example of clinical judgment — the NCSBN Clinical Judgment Model (NCSBN) describes this as recognizing and analyzing cues..."

Remember: You coach HOW nurses tell their stories. You don't write the stories, evaluate the clinical content, or serve as a medical reference. The clinical knowledge lives in the nurse — you help them COMMUNICATE it effectively.`;

// ============================================================
// SUGGESTED CONVERSATION STARTERS
// ============================================================
const CONVERSATION_STARTERS = [
  {
    label: 'Structure my answer',
    prompt: "I have an interview next week and I'm not sure how to structure my answers. Can you walk me through when to use SBAR vs STAR?",
    icon: BookOpen,
  },
  {
    label: 'Workshop an answer',
    prompt: "I want to practice answering 'Tell me about yourself and why you chose nursing.' Can you help me make my answer stronger?",
    icon: MessageSquare,
  },
  {
    label: 'Handle a tough question',
    prompt: "How do I answer 'Describe a time you made an error' without making myself look bad?",
    icon: Sparkles,
  },
  {
    label: 'Calm my nerves',
    prompt: "I get really anxious before interviews and my mind goes blank. What strategies can help me stay calm and focused?",
    icon: Stethoscope,
  },
  {
    label: 'Prepare for panel',
    prompt: "I have a panel interview coming up with a nurse manager and charge nurse. What should I expect and how do I prepare?",
    icon: User,
  },
  {
    label: 'Talk about my experience',
    prompt: `I'm applying for a ${'{specialty}'} position and I want to highlight my clinical experience effectively. How should I frame my background?`,
    icon: CheckCircle,
  },
];

// ============================================================
// COMPONENT
// ============================================================
export default function NursingAICoach({ specialty, onBack, userData, refreshUsage, addSession }) {
  // Chat state
  const [messages, setMessages] = useState([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [creditBlocked, setCreditBlocked] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const [sessionEnded, setSessionEnded] = useState(false);

  // Refs
  const messagesEndRef = useRef(null);
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

  // Sync speech → input field
  useEffect(() => {
    if (micActive && speechTranscript) {
      setCurrentInput(speechTranscript);
    }
  }, [speechTranscript, micActive]);

  // Credit check on mount (shares 'practiceMode' credits)
  useEffect(() => {
    if (userData && !userData.loading && userData.usage) {
      const check = canUseFeature(
        { practice_mode: userData.usage.practiceMode?.used || 0 },
        userData.tier,
        'practiceMode'
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

  // Focus input after AI responds
  useEffect(() => {
    if (!isLoading && messages.length > 0 && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isLoading, messages.length]);

  // Resolve starter prompt with specialty name
  const resolveStarter = (prompt) => {
    return prompt.replace('{specialty}', specialty.shortName);
  };

  // ============================================================
  // SEND MESSAGE
  // ============================================================
  const sendMessage = useCallback(async (overrideMessage) => {
    const userMessage = (overrideMessage || currentInput).trim();
    if (!userMessage || isLoading) return;

    if (!overrideMessage) setCurrentInput('');
    setError(null);

    // Add user message to chat
    setMessages(prev => [...prev, {
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    }]);

    setIsLoading(true);

    try {
      // Build conversation history for context (full multi-turn)
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

      // Call AI via fetchWithRetry — 3 attempts, backoff (Battle Scar #3)
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
            systemPrompt: AI_COACH_SYSTEM_PROMPT(specialty),
            conversationHistory: conversationHistory,
            userMessage: userMessage,
          }),
        }
      );

      if (!response.ok) {
        const errText = await response.text();
        console.error('❌ AI Coach error:', response.status, errText);
        throw new Error(`AI Coach failed: ${response.status}`);
      }

      const data = await response.json();
      const aiContent = data.content?.[0]?.text || data.response || data.feedback || "I'm here to help you prepare for your nursing interview. What would you like to work on?";

      // Add AI response to chat
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: aiContent,
        timestamp: new Date(),
      }]);

      setMessageCount(prev => prev + 1);

      // CHARGE AFTER SUCCESS (Battle Scar #8)
      // Each AI response = 1 credit on 'practiceMode'
      if (userData?.user?.id) {
        try {
          await incrementUsage(supabase, userData.user.id, 'practiceMode');
          if (refreshUsage) refreshUsage();
        } catch (chargeErr) {
          // Log but don't break session — AI response already succeeded
          console.warn('⚠️ Usage increment failed (non-blocking):', chargeErr);
        }
      }

      // Re-check credits after charging
      if (userData?.usage && !userData?.isBeta && userData?.tier !== 'pro') {
        const currentUsed = (userData.usage.practiceMode?.used || 0) + messageCount + 1;
        const limit = userData.usage.practiceMode?.limit || 10;
        if (currentUsed >= limit) {
          setCreditBlocked(true);
        }
      }

    } catch (err) {
      console.error('❌ AI Coach session error:', err);
      setError('Something went wrong. Please try again.');
      // Don't charge on failure (Battle Scar #8)
    } finally {
      setIsLoading(false);
    }
  }, [currentInput, isLoading, messages, specialty, userData, refreshUsage, messageCount]);

  // Handle Enter key (Shift+Enter for newline)
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // End session — save to session history
  const endSession = useCallback(() => {
    // Track the coaching session via addSession
    if (addSession && messages.length > 0) {
      const userMessages = messages.filter(m => m.role === 'user');
      const firstTopic = userMessages.length > 0
        ? userMessages[0].content.slice(0, 80)
        : 'AI Coaching Session';
      addSession({
        id: `ac_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        mode: 'ai-coach',
        questionId: `coach_${Date.now()}`,
        question: firstTopic,
        category: 'Coaching',
        responseFramework: null,
        score: null,
        sbarScores: null,
        timestamp: new Date().toISOString(),
      });
    }
    setSessionEnded(true);
  }, [addSession, messages]);

  // ============================================================
  // SESSION SUMMARY VIEW
  // ============================================================
  if (sessionEnded) {
    // Gather conversation topics from messages
    const userMessages = messages.filter(m => m.role === 'user');
    const aiMessages = messages.filter(m => m.role === 'assistant');
    const duration = messages.length >= 2
      ? Math.round((messages[messages.length - 1].timestamp - messages[0].timestamp) / 60000)
      : 0;

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg w-full"
        >
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-600 to-cyan-500 flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-1">Coaching Session Complete</h2>
              <p className="text-slate-400 text-sm">Great work investing in your interview prep!</p>
            </div>

            {/* Session Stats */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                <MessageSquare className="w-4 h-4 text-sky-400 mx-auto mb-1" />
                <div className="text-white font-bold text-lg">{userMessages.length}</div>
                <div className="text-slate-500 text-xs">Your messages</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                <Stethoscope className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
                <div className="text-white font-bold text-lg">{aiMessages.length}</div>
                <div className="text-slate-500 text-xs">Coach replies</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                <Clock className="w-4 h-4 text-green-400 mx-auto mb-1" />
                <div className="text-white font-bold text-lg">{duration > 0 ? `${duration}m` : '<1m'}</div>
                <div className="text-slate-500 text-xs">Duration</div>
              </div>
            </div>

            {/* Topics Covered */}
            {userMessages.length > 0 && (
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
                <p className="text-white text-sm font-medium mb-2">Topics covered:</p>
                <div className="space-y-2">
                  {userMessages.slice(0, 5).map((msg, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-green-400 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-300 text-xs leading-relaxed line-clamp-2">
                        {msg.content.length > 100 ? msg.content.slice(0, 100) + '...' : msg.content}
                      </span>
                    </div>
                  ))}
                  {userMessages.length > 5 && (
                    <p className="text-slate-500 text-xs ml-5">
                      +{userMessages.length - 5} more topics
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Encouragement */}
            <div className="bg-sky-500/10 border border-sky-400/20 rounded-xl p-4 mb-6">
              <p className="text-sky-200 text-sm leading-relaxed">
                Every practice conversation builds your confidence. The more you articulate your experiences, the more naturally they'll flow in your actual interview.
              </p>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={() => {
                  setMessages([]);
                  setMessageCount(0);
                  setSessionEnded(false);
                  setError(null);
                }}
                className="w-full bg-gradient-to-r from-sky-600 to-cyan-500 text-white font-semibold py-3 rounded-xl shadow-lg shadow-sky-500/30 hover:-translate-y-0.5 transition-all"
              >
                Start New Session
              </button>
              <button
                onClick={onBack}
                className="w-full bg-white/5 border border-white/10 text-slate-300 py-3 rounded-xl hover:bg-white/10 transition-all"
              >
                ← Back to Dashboard
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // ============================================================
  // EMPTY STATE — No messages yet (show starters)
  // ============================================================
  if (messages.length === 0) {
    const creditInfo = userData?.usage?.practiceMode;
    const isUnlimited = userData?.isBeta || userData?.tier === 'pro';

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
              <span className="text-lg">{specialty.icon}</span>
              <span className="text-white font-medium text-sm">AI Coach</span>
            </div>
            <div className="w-16" /> {/* Spacer for centering */}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-lg w-full"
          >
            {/* Welcome */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-600 to-cyan-500 flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Interview Strategy Coach
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed max-w-sm mx-auto">
                Ask me anything about nursing interview prep — answer structure, tough questions,
                nerves, strategy, or workshop your answers. I'll coach your communication and delivery.
              </p>
            </div>

            {/* Credits */}
            {creditInfo && !isUnlimited && (
              <div className={`text-xs mb-4 px-3 py-2 rounded-lg text-center ${
                creditBlocked
                  ? 'bg-red-500/10 border border-red-500/20 text-red-300'
                  : 'bg-sky-500/10 border border-sky-500/20 text-sky-300'
              }`}>
                {creditBlocked ? (
                  <>
                    <p className="mb-2">{`You've used all ${creditInfo.limit} free coaching messages this month.`}</p>
                    <a href="/app?upgrade=true&returnTo=/nursing" className="inline-block text-xs font-medium text-white bg-gradient-to-r from-purple-600 to-sky-500 px-3 py-1.5 rounded-lg hover:-translate-y-0.5 transition-all">
                      Upgrade to Pro
                    </a>
                  </>
                ) : (
                  `${creditInfo.remaining} of ${creditInfo.limit} free messages remaining this month`
                )}
              </div>
            )}
            {isUnlimited && (
              <div className="text-xs mb-4 px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/20 text-green-300 text-center">
                {userData.isBeta ? '🎖️ Beta Tester — Unlimited access' : '⭐ Pro — Unlimited coaching'}
              </div>
            )}

            {/* Conversation Starters */}
            <div className="space-y-2 mb-6">
              <p className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-3 text-center">
                Conversation starters
              </p>
              {CONVERSATION_STARTERS.map((starter, idx) => {
                const Icon = starter.icon;
                return (
                  <button
                    key={idx}
                    onClick={creditBlocked ? undefined : () => sendMessage(resolveStarter(starter.prompt))}
                    disabled={creditBlocked}
                    className={`w-full text-left bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex items-center gap-3 transition-all ${
                      creditBlocked
                        ? 'opacity-50 cursor-not-allowed'
                        : 'hover:bg-white/10 hover:border-white/20'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-sky-400 flex-shrink-0" />
                    <span className="text-slate-300 text-sm">{starter.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Or type/speak your own */}
            {!creditBlocked && (
              <>
                {micError && <p className="text-red-400 text-xs mb-1 text-center">{micError}</p>}
                <div className="flex items-end gap-2">
                  {micSupported && (
                    <button
                      onClick={async () => {
                        if (micActive) { stopMic(); } else { clearSpeech(); await startMic(); }
                      }}
                      onTouchEnd={async (e) => {
                        e.preventDefault();
                        if (micActive) { stopMic(); } else { clearSpeech(); await startMic(); }
                      }}
                      className={`p-3 rounded-xl transition-all flex-shrink-0 ${
                        micActive
                          ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 animate-pulse'
                          : 'bg-white/10 text-white/50 hover:text-white hover:bg-white/20'
                      }`}
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
                        if (micActive) stopMic();
                      }}
                      onKeyDown={handleKeyDown}
                      placeholder={micActive ? 'Listening...' : 'Or ask your own question...'}
                      rows={2}
                      className={`w-full bg-white/10 border rounded-xl px-4 py-3 text-white text-sm placeholder-slate-500 resize-none focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/30 ${
                        micActive ? 'border-red-500/40' : 'border-white/10'
                      }`}
                    />
                  </div>
                  <button
                    onClick={() => { if (micActive) stopMic(); clearSpeech(); sendMessage(); }}
                    disabled={!currentInput.trim() || isLoading}
                    className={`p-3 rounded-xl transition-all flex-shrink-0 ${
                      currentInput.trim() && !isLoading
                        ? 'bg-sky-600 text-white shadow-lg shadow-sky-500/30 hover:-translate-y-0.5'
                        : 'bg-white/10 text-white/30 cursor-not-allowed'
                    }`}
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </>
            )}

            {/* Walled garden notice */}
            <p className="text-slate-600 text-xs mt-4 text-center">
              AI coaches your communication and delivery • Not a clinical reference
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  // ============================================================
  // ACTIVE CHAT SESSION
  // ============================================================
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
            <span className="text-white font-medium text-sm">AI Coach</span>
            <span className="text-slate-500 text-xs">
              {messageCount} {messageCount === 1 ? 'reply' : 'replies'}
            </span>
          </div>

          <button
            onClick={endSession}
            className="text-xs text-amber-400 hover:text-amber-300 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-full transition-colors"
          >
            End Session
          </button>
        </div>
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
                  <MessageSquare className="w-4 h-4 text-sky-400" />
                </div>
              )}
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                msg.role === 'user'
                  ? 'bg-sky-600 text-white'
                  : 'bg-white/10 text-slate-200'
              }`}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
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
                <MessageSquare className="w-4 h-4 text-sky-400" />
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

          {/* Credit blocked warning */}
          {creditBlocked && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-center">
              <p className="text-amber-300 text-sm mb-2">
                You've reached your free message limit for this month.
              </p>
              <a
                href="/app?upgrade=true&returnTo=/nursing"
                className="inline-block text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-sky-500 px-4 py-2 rounded-lg hover:-translate-y-0.5 transition-all"
              >
                Upgrade to Pro — Unlimited Coaching
              </a>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-slate-900/95 backdrop-blur-lg border-t border-white/10 p-4">
        <div className="max-w-3xl mx-auto">
          {micError && <p className="text-red-400 text-xs mb-1 text-center">{micError}</p>}
          <div className="flex items-end gap-2">
            {micSupported && !creditBlocked && (
              <button
                onClick={async () => {
                  if (micActive) { stopMic(); } else { clearSpeech(); await startMic(); }
                }}
                onTouchEnd={async (e) => {
                  e.preventDefault();
                  if (micActive) { stopMic(); } else { clearSpeech(); await startMic(); }
                }}
                className={`p-3 rounded-xl transition-all flex-shrink-0 ${
                  micActive
                    ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 animate-pulse'
                    : 'bg-white/10 text-white/50 hover:text-white hover:bg-white/20'
                }`}
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
                  if (micActive) stopMic();
                }}
                onKeyDown={handleKeyDown}
                placeholder={creditBlocked ? 'Message limit reached' : micActive ? 'Listening...' : 'Ask anything about interview prep...'}
                rows={2}
                disabled={creditBlocked}
                className={`w-full bg-white/10 border rounded-xl px-4 py-3 text-white text-sm placeholder-slate-500 resize-none focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/30 ${
                  creditBlocked ? 'opacity-50 cursor-not-allowed border-white/10' : micActive ? 'border-red-500/40' : 'border-white/10'
                }`}
              />
            </div>
            <button
              onClick={() => { if (micActive) stopMic(); clearSpeech(); sendMessage(); }}
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
            AI coaches your communication and delivery • Not a clinical reference
          </p>
        </div>
      </div>
    </div>
  );
}
