/**
 * AIInterviewCoach.jsx — Chat-based AI Interview Coach (Walled Garden Chat)
 *
 * Modeled on Baby Decoder's AIParentCoach.jsx (P.A.R.E.N.T. protocol).
 * Adapted for interview preparation coaching.
 *
 * Architecture:
 *   - Full-screen chat view with conversation starters
 *   - Multi-turn conversation with embedded history
 *   - Citation extraction (STAR Method, Learn Center, Question Bank)
 *   - Markdown rendering (bold, italic, lists, links)
 *   - Rate limit handling with retry
 *   - Credit system integration (answer_assistant feature key)
 *   - Chat persistence via localStorage (24h expiry)
 *
 * Battle Scars enforced:
 *   #1  — NEW file, does NOT modify App.jsx
 *   #3  — fetchWithRetry (3 attempts, 0s/1s/2s backoff)
 *   #8  — Charge AFTER success, never before
 *   #9  — Beta users bypass limits
 *   #16 — onClick + onTouchEnd for iOS Safari
 *
 * Credit feature: 'answer_assistant' (reuses existing key)
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  ArrowLeft, Send, Loader2, AlertCircle, XCircle,
  MessageSquare, Sparkles, Target, Star, BookOpen,
  Brain, Zap, Heart, Info, ArrowUp
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { fetchWithRetry } from '../utils/fetchWithRetry';
import { canUseFeature, incrementUsage } from '../utils/creditSystem';
import { buildCoachSystemPrompt } from '../utils/coachPrompt';
import { loadCoachMessages, saveCoachMessages, clearCoachMessages } from '../utils/coachPersistence';

// ============================================================
// CONVERSATION STARTERS
// ============================================================
const CONVERSATION_STARTERS = [
  {
    label: 'What should I practice today?',
    prompt: "Based on what you know about my practice history, what should I focus on today? Give me a specific recommendation.",
    Icon: Target,
  },
  {
    label: 'Review my practice performance',
    prompt: "Can you review my practice performance and tell me where I'm strong and where I need improvement?",
    Icon: Star,
  },
  {
    label: 'Help me with behavioral questions',
    prompt: "I struggle with behavioral interview questions. Can you coach me on how to approach them effectively?",
    Icon: Brain,
  },
  {
    label: 'How do I use the STAR method?',
    prompt: "Walk me through the STAR method for answering interview questions. How do I structure my responses for maximum impact?",
    Icon: BookOpen,
  },
  {
    label: 'Tips for my upcoming interview',
    prompt: "I have an interview coming up. What are your top tips to help me prepare and feel confident?",
    Icon: Zap,
  },
  {
    label: 'What are my weak areas?',
    prompt: "Based on my practice sessions, what are my weakest areas? Where should I spend more time?",
    Icon: AlertCircle,
  },
  {
    label: 'Calm my nerves',
    prompt: "I'm feeling anxious about interviewing. How can I manage my nerves and show up confidently?",
    Icon: Heart,
  },
];

// ============================================================
// HELPER: Render inline markdown (bold, italic, links)
// ============================================================
function renderInlineMarkdown(text) {
  if (!text) return [text];
  const parts = [];
  let key = 0;

  // Combined regex: [title](url), **bold**, *italic*, bare URLs
  const inlineRe = /(\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|\*\*(.+?)\*\*|\*(.+?)\*|(https?:\/\/[^\s<>"')\]]+))/g;
  let lastIndex = 0;
  let match;

  while ((match = inlineRe.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    if (match[2] && match[3]) {
      // [title](url)
      parts.push(
        <a
          key={`a${key++}`}
          href={match[3]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-teal-600 hover:text-teal-700 underline break-all"
        >
          {match[2]}
        </a>
      );
    } else if (match[4]) {
      // **bold**
      parts.push(<strong key={`b${key++}`} className="font-semibold">{match[4]}</strong>);
    } else if (match[5]) {
      // *italic*
      parts.push(<em key={`i${key++}`}>{match[5]}</em>);
    } else if (match[6]) {
      // Bare URL
      let url = match[6].replace(/[.,;:!?)]+$/, '');
      const trailing = match[6].slice(url.length);
      parts.push(
        <a
          key={`a${key++}`}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-teal-600 hover:text-teal-700 underline break-all"
        >
          {url}
        </a>
      );
      if (trailing) parts.push(trailing);
    }
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
}

// ============================================================
// HELPER: Render markdown block (paragraphs, lists)
// ============================================================
function renderMarkdownBlock(text) {
  if (!text || !text.trim()) return null;

  const lines = text.split('\n');
  const elements = [];
  let currentList = [];
  let key = 0;

  const flushList = () => {
    if (currentList.length > 0) {
      elements.push(
        <ul key={`ul${key++}`} className="list-disc list-inside space-y-1 my-1">
          {currentList.map((item, i) => (
            <li key={i} className="leading-relaxed">{renderInlineMarkdown(item)}</li>
          ))}
        </ul>
      );
      currentList = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();

    const bulletMatch = trimmed.match(/^[-]\s+(.+)$/) || trimmed.match(/^\*\s+(.+)$/);
    const numberedMatch = trimmed.match(/^\d+[.)]\s+(.+)$/);

    if (bulletMatch) {
      currentList.push(bulletMatch[1]);
    } else if (numberedMatch) {
      currentList.push(numberedMatch[1]);
    } else {
      flushList();
      if (trimmed === '') {
        elements.push(<div key={`br${key++}`} className="h-1" />);
      } else {
        elements.push(
          <p key={`p${key++}`} className="leading-relaxed">{renderInlineMarkdown(trimmed)}</p>
        );
      }
    }
  }
  flushList();

  return elements;
}

// ============================================================
// HELPER: Parse structured sections (headers with **)
// ============================================================
function parseAIContent(content) {
  if (!content) return [];

  const sections = [];
  const lines = content.split('\n');
  let currentSection = { header: null, lines: [] };

  for (const line of lines) {
    const headerMatch = line.match(/^\*\*(.+?)\*\*:?\s*$/) || line.match(/^##\s+(.+)$/);
    if (headerMatch) {
      if (currentSection.lines.length > 0 || currentSection.header) {
        sections.push(currentSection);
      }
      currentSection = { header: headerMatch[1].trim(), lines: [] };
    } else {
      currentSection.lines.push(line);
    }
  }
  if (currentSection.lines.length > 0 || currentSection.header) {
    sections.push(currentSection);
  }

  return sections;
}

// ============================================================
// HELPER: Extract citation badges from AI message
// ============================================================
function extractCitations(text) {
  if (!text) return [];
  const citations = [];

  if (/\bSTAR\b/i.test(text) && /method|framework|structure|format/i.test(text)) {
    citations.push({ label: 'STAR Method', color: 'teal' });
  }
  if (/\blearn\s*center\b/i.test(text)) {
    citations.push({ label: 'Learn Center', color: 'blue' });
  }
  if (/\bquestion\s*bank\b/i.test(text)) {
    citations.push({ label: 'Question Bank', color: 'purple' });
  }
  if (/\bpractice\s*(data|history|session|performance)\b/i.test(text)) {
    citations.push({ label: 'Your Practice Data', color: 'emerald' });
  }
  if (/\bbehavioral\b/i.test(text) && /interview|question/i.test(text)) {
    citations.push({ label: 'Behavioral Prep', color: 'amber' });
  }

  return citations;
}

// Citation badge color map
const CITATION_COLORS = {
  teal: 'bg-teal-50 text-teal-700 border-teal-200',
  blue: 'bg-blue-50 text-blue-700 border-blue-200',
  purple: 'bg-purple-50 text-purple-700 border-purple-200',
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  amber: 'bg-amber-50 text-amber-700 border-amber-200',
};

// ============================================================
// COMPONENT
// ============================================================
export default function AIInterviewCoach({ user, userData, questions = [], onClose }) {
  // Chat state — restore from localStorage with 24h expiry
  const [messages, setMessages] = useState(() => loadCoachMessages('general').messages);
  const [currentInput, setCurrentInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [errorType, setErrorType] = useState(null); // 'rate_limited' | 'generic' | null
  const [lastUserMessage, setLastUserMessage] = useState(null);
  const [creditBlocked, setCreditBlocked] = useState(false);
  const [messageCount, setMessageCount] = useState(() => loadCoachMessages('general').messageCount);
  const [sessionId] = useState(() => `ic_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`);

  // Refs
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Derive user context for the system prompt
  const userTier = userData?.tier || 'free';
  const isBeta = userData?.isBeta || userTier === 'beta';
  const isUnlimited = isBeta || userTier === 'pro' || userTier === 'annual' ||
    userTier === 'general_pass' || userTier === 'nursing_pass';

  // Compute practice stats for context badge
  const totalSessions = userData?.usage?.practice_mode || 0;
  const totalAISessions = userData?.usage?.ai_interviewer || 0;

  // Credit check on mount
  useEffect(() => {
    if (userData && userData.usage) {
      const check = canUseFeature(
        userData.usage,
        userTier,
        'answer_assistant'
      );
      if (!check.allowed && !isBeta) {
        setCreditBlocked(true);
      }
    }
  }, [userData, userTier, isBeta]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Focus input after AI responds
  useEffect(() => {
    if (!isLoading && messages.length > 0 && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isLoading, messages.length]);

  // Persist messages to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      saveCoachMessages(messages, messageCount, 'general');
    }
  }, [messages, messageCount]);

  // Build coach context for system prompt
  const getCoachContext = useCallback(() => {
    // Calculate weakest category from questions
    const categories = ['Core Narrative', 'System-Level', 'Behavioral', 'Technical'];
    let weakest = null;
    let lowestPct = 101;

    for (const cat of categories) {
      const catQ = questions.filter(q => q.category === cat);
      if (catQ.length === 0) continue;
      // We don't have practice history directly, so just note the category sizes
      const pct = catQ.length;
      if (pct < lowestPct) {
        lowestPct = pct;
        weakest = cat;
      }
    }

    return {
      questionCount: questions.length,
      sessionCount: totalSessions + totalAISessions,
      weakestCategory: weakest,
    };
  }, [questions, totalSessions, totalAISessions]);

  // ============================================================
  // SEND MESSAGE
  // ============================================================
  const sendMessage = useCallback(async (overrideMessage) => {
    const userMessage = (overrideMessage || currentInput).trim();
    if (!userMessage || isLoading) return;

    if (!overrideMessage) setCurrentInput('');
    setError(null);
    setErrorType(null);
    setLastUserMessage(userMessage);

    // Add user message to chat
    setMessages(prev => [...prev, {
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString(),
    }]);

    setIsLoading(true);

    try {
      // Check network
      if (!navigator.onLine) {
        throw new Error('You appear to be offline. Please check your internet connection and try again.');
      }

      // Get auth token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Your session has expired. Please go back and sign in again.');
      }

      // Build system prompt with context
      const coachContext = getCoachContext();
      const systemPrompt = buildCoachSystemPrompt(coachContext);

      // Build multi-turn payload — embed conversation history
      let payload = userMessage;
      if (messages.length > 0) {
        const historyLines = messages.map(m =>
          `${m.role === 'user' ? 'User' : 'Coach'}: ${m.content}`
        );
        payload = `CONVERSATION SO FAR:\n${historyLines.join('\n\n')}\n\nLATEST MESSAGE FROM USER:\n${userMessage}`;
      }

      // Call AI via fetchWithRetry (Battle Scar #3)
      const response = await fetchWithRetry(
        `${import.meta.env.VITE_SUPABASE_URL || 'https://tzrlpwtkrtvjpdhcaayu.supabase.co'}/functions/v1/ai-feedback`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            mode: 'confidence-brief',
            systemPrompt,
            userMessage: payload,
          }),
        }
      );

      if (!response.ok) {
        const errText = await response.text();
        console.error('AI Interview Coach error:', response.status, errText);

        if (response.status === 401 || response.status === 403) {
          throw new Error('Your session has expired. Please go back and sign in again.');
        }

        // Check for rate limiting
        try {
          const errBody = JSON.parse(errText);
          if (response.status === 429 || errBody?.error_type === 'rate_limited') {
            setErrorType('rate_limited');
            throw new Error('RATE_LIMITED');
          }
        } catch (parseErr) {
          if (parseErr.message === 'RATE_LIMITED') throw parseErr;
        }
        throw new Error('GENERIC_ERROR');
      }

      const data = await response.json();

      // Detect Anthropic API errors passed through Edge Function
      if (data.type === 'error' && data.error) {
        const errType = data.error.type || 'unknown';
        if (errType === 'overloaded_error' || errType === 'rate_limit_error') {
          setErrorType('rate_limited');
          throw new Error('RATE_LIMITED');
        }
        throw new Error('GENERIC_ERROR');
      }

      // Detect rate_limited from successful-status but failed response
      if (data.success === false && data.error_type === 'rate_limited') {
        setErrorType('rate_limited');
        throw new Error('RATE_LIMITED');
      }

      const aiContent = data.content?.[0]?.text
        || data.response
        || data.feedback
        || "I'm here to help you prepare for your interview. What would you like to work on?";

      // Extract citations from response
      const citations = extractCitations(aiContent);

      // Add AI response to chat
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: aiContent,
        timestamp: new Date().toISOString(),
        citations,
      }]);

      setMessageCount(prev => prev + 1);

      // CHARGE AFTER SUCCESS (Battle Scar #8) — only on first exchange
      if (messageCount === 0 && user?.id) {
        try {
          await incrementUsage(supabase, user.id, 'answer_assistant');
        } catch (chargeErr) {
          console.warn('Usage increment failed (non-blocking):', chargeErr);
        }
      }

      // Re-check credits after charging
      if (userData?.usage && !isBeta && !isUnlimited) {
        const currentUsed = (userData.usage.answer_assistant || 0) + messageCount + 1;
        const check = canUseFeature(
          { answer_assistant: currentUsed },
          userTier,
          'answer_assistant'
        );
        if (!check.allowed) {
          setCreditBlocked(true);
        }
      }

    } catch (err) {
      console.error('AI Interview Coach error:', err);
      if (err.message === 'RATE_LIMITED') {
        setError('The AI is taking a quick breather -- try again in about 30 seconds.');
        setErrorType('rate_limited');
        setMessages(prev => prev.slice(0, -1));
      } else if (err.message === 'GENERIC_ERROR') {
        setError('Something went wrong with the AI. Please try again.');
        setErrorType('generic');
        setMessages(prev => prev.slice(0, -1));
      } else {
        setError(err.message || 'Something went wrong. Please try again.');
        setErrorType('generic');
      }
      // Don't charge on failure (Battle Scar #8)
    } finally {
      setIsLoading(false);
    }
  }, [currentInput, isLoading, messages, getCoachContext, messageCount, user, userData, userTier, isBeta, isUnlimited]);

  // Handle Enter key (Shift+Enter for newline)
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // New chat handler
  const handleNewChat = () => {
    setMessages([]);
    setMessageCount(0);
    setCurrentInput('');
    setError(null);
    setErrorType(null);
    clearCoachMessages('general');
  };

  // ============================================================
  // RENDER: EMPTY STATE — No messages yet (show starters)
  // ============================================================
  if (messages.length === 0) {
    const creditCheck = userData?.usage
      ? canUseFeature(userData.usage, userTier, 'answer_assistant')
      : null;

    return (
      <div className="flex flex-col bg-gray-50" style={{ height: '100vh' }}>
        {/* Header */}
        <div className="border-b sticky top-0 z-30 backdrop-blur-xl bg-white/80 border-gray-200/60"
          style={{ WebkitBackdropFilter: 'blur(40px)' }}>
          <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
            <button
              onClick={onClose}
              onTouchEnd={(e) => { e.preventDefault(); onClose(); }}
              className="flex items-center gap-2 px-2 py-1.5 rounded-2xl transition-colors text-gray-500 hover:text-gray-700 hover:bg-gray-100/80"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Back</span>
            </button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl flex items-center justify-center bg-teal-100">
                <MessageSquare className="w-3.5 h-3.5 text-teal-600" />
              </div>
              <span className="font-semibold text-sm text-gray-800">Interview Coach</span>
            </div>
            <div className="w-16" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-lg w-full">
            {/* Welcome */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg bg-gradient-to-br from-teal-100 to-emerald-100 shadow-teal-200/40">
                <MessageSquare className="w-8 h-8 text-teal-600" />
              </div>
              <h2 className="text-2xl font-bold mb-2 text-gray-800">
                Interview Coach
              </h2>
              <p className="text-sm leading-relaxed max-w-sm mx-auto text-gray-500">
                I'm your personal interview strategist. Ask me about preparation strategy,
                answer structure, confidence building, or what to practice next.
              </p>

              {/* Practice stats badge */}
              {(totalSessions > 0 || totalAISessions > 0) && (
                <div className="mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1 border bg-teal-50 border-teal-200">
                  <Sparkles className="w-3.5 h-3.5 text-teal-500" />
                  <span className="text-xs font-medium text-teal-700">
                    {totalSessions + totalAISessions} practice sessions completed
                  </span>
                </div>
              )}
            </div>

            {/* Credits */}
            {creditCheck && !isUnlimited && (
              <div className={`text-xs mb-4 px-3 py-2 rounded-lg text-center ${
                creditBlocked
                  ? 'bg-red-50 border border-red-200 text-red-600'
                  : 'bg-teal-50 border border-teal-200 text-teal-600'
              }`}>
                {creditBlocked ? (
                  <p>You've used all your free coaching messages this month. Upgrade for unlimited access.</p>
                ) : (
                  `${creditCheck.remaining} of ${creditCheck.limit} free coaching sessions remaining this month`
                )}
              </div>
            )}
            {isUnlimited && (
              <div className="text-xs mb-4 px-3 py-2 rounded-lg bg-teal-50 border border-teal-200 text-teal-600 text-center">
                {isBeta ? 'Beta Tester -- Unlimited access' : 'Unlimited coaching'}
              </div>
            )}

            {/* Conversation Starters */}
            <div className="space-y-2 mb-6">
              <p className="text-xs font-medium uppercase tracking-wider mb-3 text-center text-gray-500">
                Conversation starters
              </p>
              {CONVERSATION_STARTERS.map((starter, idx) => {
                const StarterIcon = starter.Icon;
                return (
                  <button
                    key={idx}
                    onClick={creditBlocked ? undefined : () => sendMessage(starter.prompt)}
                    onTouchEnd={creditBlocked ? undefined : (e) => { e.preventDefault(); sendMessage(starter.prompt); }}
                    disabled={creditBlocked}
                    className={`w-full text-left border rounded-2xl px-4 py-3.5 flex items-center gap-3 transition-all ${
                      creditBlocked
                        ? 'opacity-50 cursor-not-allowed'
                        : 'bg-white border-gray-200/60 hover:bg-teal-50 hover:border-teal-200 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] active:scale-[0.98]'
                    }`}
                  >
                    <StarterIcon className="w-4 h-4 flex-shrink-0 text-teal-500" />
                    <span className="text-sm text-gray-700">{starter.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Or type your own */}
            {!creditBlocked && (
              <div className="flex items-end gap-2">
                <div className="flex-1 relative">
                  <textarea
                    ref={inputRef}
                    value={currentInput}
                    onChange={(e) => setCurrentInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Or ask your own question..."
                    rows={2}
                    className="w-full border rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-1 bg-white text-gray-800 placeholder-gray-400 focus:border-teal-400 focus:ring-teal-300 border-gray-200"
                  />
                </div>
                <button
                  onClick={() => sendMessage()}
                  onTouchEnd={(e) => { e.preventDefault(); sendMessage(); }}
                  disabled={!currentInput.trim() || isLoading}
                  className={`p-3 rounded-xl transition-all flex-shrink-0 ${
                    currentInput.trim() && !isLoading
                      ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/30 hover:-translate-y-0.5'
                      : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                  }`}
                >
                  <ArrowUp className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Disclaimer */}
            <p className="text-xs mt-4 text-center text-gray-400">
              AI coaching is for practice preparation only. Not a substitute for professional career counseling.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // RENDER: ACTIVE CHAT SESSION
  // ============================================================
  return (
    <div className="flex flex-col bg-gray-50" style={{ height: '100vh' }}>
      {/* Header */}
      <div className="border-b sticky top-0 z-30 backdrop-blur-xl bg-white/80 border-gray-200/60"
        style={{ WebkitBackdropFilter: 'blur(40px)' }}>
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={onClose}
            onTouchEnd={(e) => { e.preventDefault(); onClose(); }}
            className="flex items-center gap-2 px-2 py-1.5 rounded-2xl transition-colors text-gray-500 hover:text-gray-700 hover:bg-gray-100/80"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back</span>
          </button>

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl flex items-center justify-center bg-teal-100">
              <MessageSquare className="w-3.5 h-3.5 text-teal-600" />
            </div>
            <span className="font-semibold text-sm text-gray-800">Interview Coach</span>
            <span className="text-xs text-gray-400">
              {messageCount} {messageCount === 1 ? 'reply' : 'replies'}
            </span>
          </div>

          {/* New Chat button */}
          <button
            onClick={handleNewChat}
            onTouchEnd={(e) => { e.preventDefault(); handleNewChat(); }}
            className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            title="New conversation"
          >
            <Sparkles className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {/* AI avatar */}
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 bg-teal-100">
                  <MessageSquare className="w-4 h-4 text-teal-600" />
                </div>
              )}

              {/* Message bubble */}
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                msg.role === 'user'
                  ? 'bg-teal-600 text-white rounded-br-md shadow-sm'
                  : 'bg-white border border-gray-200/60 text-gray-800 rounded-bl-md shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)]'
              }`}>
                {/* Message content */}
                {msg.role === 'assistant' ? (
                  <div className="text-sm leading-relaxed space-y-2">
                    {parseAIContent(msg.content).map((section, sIdx) => (
                      <div key={sIdx}>
                        {section.header && (
                          <p className="font-semibold text-gray-700 mt-2 mb-1">{section.header}</p>
                        )}
                        <div className="space-y-1">
                          {renderMarkdownBlock(section.lines.join('\n').trim())}
                        </div>
                      </div>
                    ))}

                    {/* Citation badges */}
                    {msg.citations && msg.citations.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3 pt-2 border-t border-gray-100">
                        {msg.citations.map((cite, cIdx) => (
                          <span
                            key={cIdx}
                            className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${CITATION_COLORS[cite.color] || CITATION_COLORS.teal}`}
                          >
                            {cite.label}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                )}

                {/* Timestamp */}
                <div className={`text-[10px] mt-1.5 ${msg.role === 'user' ? 'text-white/60' : 'text-gray-400'}`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>

              {/* User avatar spacer */}
              {msg.role === 'user' && <div className="w-8 flex-shrink-0" />}
            </div>
          ))}

          {/* Typing indicator */}
          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-teal-100">
                <MessageSquare className="w-4 h-4 text-teal-600" />
              </div>
              <div className="border rounded-2xl rounded-bl-md px-4 py-3 bg-white border-gray-200/60 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-teal-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-teal-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-teal-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className={`${errorType === 'rate_limited' ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200'} border rounded-xl p-3 flex items-center gap-2`}>
              <AlertCircle className={`w-4 h-4 ${errorType === 'rate_limited' ? 'text-amber-500' : 'text-red-500'} flex-shrink-0`} />
              <span className={`${errorType === 'rate_limited' ? 'text-amber-700' : 'text-red-600'} text-sm flex-1`}>{error}</span>
              {lastUserMessage && (
                <button
                  onClick={() => {
                    setError(null);
                    setErrorType(null);
                    setTimeout(() => {
                      sendMessage(lastUserMessage);
                    }, errorType === 'rate_limited' ? 2000 : 500);
                  }}
                  className={`${errorType === 'rate_limited' ? 'text-amber-600 hover:text-amber-800 border-amber-300' : 'text-red-600 hover:text-red-800 border-red-300'} text-xs font-medium px-2 py-1 border rounded-lg flex-shrink-0`}
                >
                  Try Again
                </button>
              )}
              <button
                onClick={() => { setError(null); setErrorType(null); }}
                className={`${errorType === 'rate_limited' ? 'text-amber-400 hover:text-amber-600' : 'text-red-400 hover:text-red-600'} flex-shrink-0`}
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Credit blocked warning */}
          {creditBlocked && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
              <p className="text-amber-700 text-sm mb-2">
                You've reached your free coaching limit for this month.
              </p>
              <p className="text-amber-600 text-xs">
                Upgrade for unlimited coaching conversations.
              </p>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      {!creditBlocked && (
        <div className="border-t p-4 backdrop-blur-xl bg-white/80 border-gray-200/60"
          style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))', WebkitBackdropFilter: 'blur(40px)' }}>
          <div className="max-w-3xl mx-auto flex items-end gap-2">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask your coach anything..."
                rows={1}
                className="w-full border rounded-xl px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-teal-300/50 focus:border-teal-300 bg-white text-gray-800 placeholder-gray-400 border-gray-200 transition-all"
                style={{ maxHeight: '120px' }}
              />
            </div>
            <button
              onClick={() => sendMessage()}
              onTouchEnd={(e) => { e.preventDefault(); sendMessage(); }}
              disabled={!currentInput.trim() || isLoading}
              className="p-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-xl disabled:opacity-40 hover:from-teal-600 hover:to-emerald-600 transition-all active:scale-[0.95] flex-shrink-0"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </div>

          {/* Disclaimer */}
          <p className="text-[10px] text-center text-gray-400 mt-2 max-w-3xl mx-auto">
            AI coaching is for practice preparation only
          </p>
        </div>
      )}
    </div>
  );
}
