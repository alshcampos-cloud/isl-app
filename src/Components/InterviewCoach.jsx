/**
 * InterviewCoach.jsx — Chat-based AI interview coach for the general track.
 *
 * Modeled on NursingAICoach.jsx (C.O.A.C.H. protocol) and Baby Decoder's
 * AIParentCoach.jsx (P.A.R.E.N.T. protocol). Adapted for general interview prep.
 *
 * Battle Scars enforced:
 *   #3  — fetchWithRetry (3 attempts, backoff)
 *   #4  — Reuses existing useSpeechRecognition hook (no new speech impl)
 *   #8  — Charge AFTER success, never before
 *   #9  — Beta users bypass limits
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  ArrowLeft, Send, Loader2, MessageSquare, Sparkles,
  User, Mic, MicOff, Volume2, VolumeX, AlertCircle
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { fetchWithRetry } from '../utils/fetchWithRetry';
import { incrementUsage } from '../utils/creditSystem';
import { buildCoachSystemPrompt } from '../utils/coachPrompt';
import useSpeechRecognition from './NursingTrack/useSpeechRecognition';
import { loadCoachMessages, saveCoachMessages, clearCoachMessages } from '../utils/coachPersistence';

// Conversation starters — 7 pills like Baby Decoder's AIParentCoach
const CONVERSATION_STARTERS = [
  { label: "I just got an interview \u2014 help me prep", icon: "\ud83c\udfaf" },
  { label: "I feel like an imposter", icon: "\ud83e\udd14" },
  { label: "Coach my STAR answers", icon: "\u2b50" },
  { label: "What should I research about this company?", icon: "\ud83d\udd0d" },
  { label: "Practice my weak areas", icon: "\ud83d\udcaa" },
  { label: "Questions I should ask them", icon: "\u2753" },
  { label: "Calm my nerves", icon: "\ud83e\uddd8" },
];

function InterviewCoach({
  onBack,
  getUserContext,
  questions = [],
  practiceHistory = [],
  speakText,
  stopSpeaking,
  aiSpeaking,
}) {
  // Restore coach chat from localStorage (single read via lazy init)
  const [messages, setMessages] = useState(() => loadCoachMessages('general').messages);
  const [currentInput, setCurrentInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [messageCount, setMessageCount] = useState(() => loadCoachMessages('general').messageCount);
  const [voiceEnabled, setVoiceEnabled] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Speech recognition — reuse existing hook (Battle Scar #4)
  const {
    transcript,
    isListening,
    isSupported: speechAvailable,
    startSession: startSpeech,
    stopSession: stopSpeech,
    clearTranscript,
  } = useSpeechRecognition();

  // Append transcript to input when speech recognition produces results
  useEffect(() => {
    if (transcript) {
      setCurrentInput(prev => (prev ? prev + ' ' : '') + transcript);
      clearTranscript();
    }
  }, [transcript, clearTranscript]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopSpeech();
    } else {
      startSpeech();
    }
  }, [isListening, startSpeech, stopSpeech]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Persist messages to localStorage (coach chat persistence fix)
  useEffect(() => {
    if (messages.length > 0) {
      saveCoachMessages(messages, messageCount, 'general');
    }
  }, [messages, messageCount]);

  // Build context for the system prompt
  const getCoachContext = useCallback(() => {
    const ctx = getUserContext ? getUserContext() : {};

    // Calculate weakest category
    const practicedTexts = new Set(practiceHistory.map(s => s.question));
    const categories = ['Core Narrative', 'System-Level', 'Behavioral', 'Technical'];
    let weakest = null;
    let lowestPct = 101;
    for (const cat of categories) {
      const catQ = questions.filter(q => q.category === cat);
      if (catQ.length === 0) continue;
      const practiced = catQ.filter(q => practicedTexts.has(q.question)).length;
      const pct = (practiced / catQ.length) * 100;
      if (pct < lowestPct) {
        lowestPct = pct;
        weakest = cat;
      }
    }

    // Days until interview
    let daysUntil = null;
    if (ctx.interviewDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const interview = new Date(ctx.interviewDate + 'T00:00:00');
      daysUntil = Math.max(0, Math.round((interview.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) + 1);
    }

    return {
      ...ctx,
      questionCount: questions.length,
      sessionCount: practiceHistory.length,
      weakestCategory: weakest,
      daysUntil,
    };
  }, [getUserContext, questions, practiceHistory]);

  // Build the userMessage payload — for multi-turn, embed conversation history
  // so the AI sees the full thread. Uses 'confidence-brief' mode which passes
  // systemPrompt + userMessage straight to Sonnet 4.
  const buildUserPayload = useCallback((userMessage, prevMessages) => {
    if (prevMessages.length === 0) {
      // First message — just send the user's message directly
      return userMessage;
    }
    // Multi-turn — embed conversation history so the AI has full context
    const historyLines = prevMessages.map(m =>
      `${m.role === 'user' ? 'User' : 'Coach'}: ${m.content}`
    );
    return `CONVERSATION SO FAR:\n${historyLines.join('\n\n')}\n\nLATEST MESSAGE FROM USER:\n${userMessage}`;
  }, []);

  // Send message to AI
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
      // Get auth token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      // Build system prompt with current context
      const coachContext = getCoachContext();
      const systemPrompt = buildCoachSystemPrompt(coachContext);

      // Build the message payload — embeds conversation history for multi-turn
      const payload = buildUserPayload(userMessage, messages);

      // Call AI via fetchWithRetry (Battle Scar #3)
      // Uses 'confidence-brief' mode — passes systemPrompt + userMessage to Sonnet 4
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
        console.error('\u274c Coach error:', response.status, errText);
        throw new Error(`Coach failed: ${response.status}`);
      }

      const data = await response.json();

      // Handle Anthropic API errors
      if (data.type === 'error' && data.error) {
        const errType = data.error.type || 'unknown';
        const errMsg = data.error.message || 'AI service error';
        throw new Error(errType === 'overloaded_error'
          ? 'AI service is temporarily busy. Please try again in a moment.'
          : `AI error: ${errMsg}`);
      }

      const aiContent = data.content?.[0]?.text || data.response || data.feedback ||
        "I'm here to help you prepare. Tell me about your upcoming interview!";

      // Add AI response to chat
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: aiContent,
        timestamp: new Date(),
      }]);

      setMessageCount(prev => prev + 1);

      // Voice readback if enabled
      if (voiceEnabled && speakText) {
        speakText(aiContent);
      }

      // CHARGE AFTER SUCCESS (Battle Scar #8)
      if (messageCount === 0) {
        // Only count the first exchange as a "session"
        try {
          const { data: { user: authUser } } = await supabase.auth.getUser();
          if (authUser) await incrementUsage(supabase, authUser.id, 'answer_assistant');
        } catch (e) {
          console.warn('Usage tracking failed:', e);
        }
      }

    } catch (err) {
      console.error('\u274c Coach error:', err);
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [currentInput, isLoading, messages, getCoachContext, buildUserPayload, messageCount, voiceEnabled, speakText]);

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage();
  };

  // Handle conversation starter click
  const handleStarterClick = (starter) => {
    sendMessage(starter.label);
  };

  return (
    <div className="flex flex-col h-full" style={{ minHeight: 'calc(100vh - 200px)' }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-warm-200/60 bg-white/80 backdrop-blur-sm">
        <button
          onClick={onBack}
          className="p-2 hover:bg-warm-100 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-warm-600" />
        </button>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-warm-800">Interview Coach</h2>
          <p className="text-xs text-warm-500">Your personal interview strategist</p>
        </div>
        {/* New Chat button — clears persisted conversation */}
        {messages.length > 0 && (
          <button
            onClick={() => {
              setMessages([]);
              setMessageCount(0);
              setCurrentInput('');
              setError(null);
              clearCoachMessages('general');
            }}
            className="p-2 rounded-xl text-warm-400 hover:bg-warm-100 hover:text-warm-600 transition-colors"
            title="New conversation"
          >
            <Sparkles className="w-5 h-5" />
          </button>
        )}
        {/* Voice toggle */}
        {speakText && (
          <button
            onClick={() => {
              if (aiSpeaking && stopSpeaking) stopSpeaking();
              setVoiceEnabled(!voiceEnabled);
            }}
            className={`p-2 rounded-xl transition-colors ${voiceEnabled ? 'bg-teal-50 text-teal-600' : 'text-warm-400 hover:bg-warm-100'}`}
            title={voiceEnabled ? 'Voice on' : 'Voice off'}
          >
            {voiceEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
        )}
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Empty state — show conversation starters */}
        {messages.length === 0 && (
          <div className="pt-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-teal-100 to-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <MessageSquare className="w-8 h-8 text-teal-600" />
              </div>
              <h3 className="text-xl font-bold text-warm-800 mb-1">Let's get you ready</h3>
              <p className="text-sm text-warm-500 max-w-xs mx-auto">
                I'm your interview coach. Tell me what's on your mind, or pick a topic below.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-2 max-w-md mx-auto">
              {CONVERSATION_STARTERS.map((starter, i) => (
                <button
                  key={i}
                  onClick={() => handleStarterClick(starter)}
                  className="px-3.5 py-2 bg-white border border-warm-200 rounded-full text-sm text-warm-700 hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700 transition-all active:scale-[0.97] shadow-sm"
                >
                  <span className="mr-1.5">{starter.icon}</span>
                  {starter.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chat messages */}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                msg.role === 'user'
                  ? 'bg-teal-600 text-white rounded-br-md'
                  : 'bg-white border border-warm-200/60 text-warm-800 rounded-bl-md shadow-sm'
              }`}
            >
              {/* Render message with basic markdown */}
              <div className="text-sm leading-relaxed whitespace-pre-wrap">
                {msg.content}
              </div>
              <div className={`text-[10px] mt-1.5 ${msg.role === 'user' ? 'text-white/60' : 'text-warm-400'}`}>
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-warm-200/60 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-warm-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-warm-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-warm-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mx-auto max-w-sm p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-red-700">{error}</p>
              <button
                onClick={() => setError(null)}
                className="text-xs text-red-500 hover:text-red-700 mt-1 underline"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-warm-200/60 bg-white/80 backdrop-blur-sm px-4 py-3">
        <form onSubmit={handleSubmit} className="flex items-end gap-2">
          {/* Speech button */}
          {speechAvailable && (
            <button
              type="button"
              onClick={toggleListening}
              className={`p-2.5 rounded-xl transition-colors flex-shrink-0 ${
                isListening
                  ? 'bg-red-100 text-red-600'
                  : 'bg-warm-100 text-warm-500 hover:bg-warm-200'
              }`}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
          )}

          {/* Text input */}
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Ask your coach anything..."
              rows={1}
              className="w-full px-4 py-2.5 border border-warm-200 rounded-xl text-sm resize-none focus:ring-2 focus:ring-teal-300/50 focus:border-teal-300 transition-all"
              style={{ maxHeight: '120px' }}
            />
          </div>

          {/* Send button */}
          <button
            type="submit"
            disabled={!currentInput.trim() || isLoading}
            className="p-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-xl disabled:opacity-40 hover:from-teal-600 hover:to-emerald-600 transition-all active:scale-[0.95] flex-shrink-0"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </form>
      </div>
    </div>
  );
}

export default InterviewCoach;
