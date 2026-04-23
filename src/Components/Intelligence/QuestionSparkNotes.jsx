/**
 * QuestionSparkNotes.jsx — "Teach Me" study guide panel for any interview question.
 *
 * Phase 4E: Understand what the interviewer is REALLY testing.
 * Shows: what they're asking, framework to use, story skeleton, power phrases,
 * common mistakes, key takeaway, and methodology sources.
 *
 * Props:
 *   question — the question object { question, category, ... }
 *   isOpen — whether the panel is visible
 *   onClose — close handler
 *   getUserContext — function returning user context
 */

import { useState, useEffect, useCallback } from 'react';
import { X, Loader2, BookOpen, Sparkles, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { fetchWithRetry } from '../../utils/fetchWithRetry';
import { incrementUsage } from '../../utils/creditSystem';
import { buildSparkNotesPrompt } from '../../utils/sparkNotesPrompt';

// Cache helpers
function getCached(questionText) {
  try {
    const key = 'sparknotes_' + simpleHash(questionText);
    const cached = localStorage.getItem(key);
    if (!cached) return null;
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp > 7 * 24 * 60 * 60 * 1000) {
      localStorage.removeItem(key);
      return null;
    }
    return data;
  } catch { return null; }
}

function setCache(questionText, data) {
  try {
    const key = 'sparknotes_' + simpleHash(questionText);
    localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
  } catch {}
}

function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

function QuestionSparkNotes({ question, isOpen, onClose, getUserContext }) {
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStudyGuide = useCallback(async () => {
    if (!question?.question) return;

    // Check cache
    const cached = getCached(question.question);
    if (cached) {
      setResult(cached);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const ctx = getUserContext ? getUserContext() : {};
      const systemPrompt = buildSparkNotesPrompt({ ...ctx, category: question.category });

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
            userMessage: `Create a study guide for this interview question:\n\n"${question.question}"`,
          }),
        }
      );

      if (!response.ok) throw new Error(`Failed: ${response.status}`);

      const data = await response.json();
      const aiText = data.content?.[0]?.text || data.response || '';
      const jsonMatch = aiText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('Could not parse study guide');

      let parsed;
      try { parsed = JSON.parse(jsonMatch[0]); } catch { throw new Error('Could not parse study guide. Please try again.'); }
      if (!parsed || typeof parsed !== 'object') throw new Error('Invalid study guide format. Please try again.');
      setResult(parsed);
      setCache(question.question, parsed);

      // CHARGE AFTER SUCCESS (Battle Scar #8)
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) await incrementUsage(supabase, user.id, 'answer_assistant');
      } catch (e) { console.warn('Usage tracking failed:', e); }
    } catch (err) {
      console.error('SparkNotes error:', err);
      setError(err.message || 'Failed to generate study guide');
    } finally {
      setIsLoading(false);
    }
  }, [question, getUserContext]);

  useEffect(() => {
    if (isOpen && question && !result) {
      fetchStudyGuide();
    }
  }, [isOpen, question, result, fetchStudyGuide]);

  // Reset when question changes
  useEffect(() => {
    setResult(null);
    setError(null);
  }, [question?.question]);

  // Escape key dismiss
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" role="dialog" aria-modal="true" aria-label="Study Guide">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} onTouchEnd={(e) => { e.preventDefault(); onClose(); }} />

      {/* Panel */}
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-all duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-teal-50 to-emerald-50">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-teal-600" />
            <h2 className="text-lg font-bold text-gray-800">Study Guide</h2>
          </div>
          <button onClick={onClose} aria-label="Close" className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Question */}
        <div className="px-5 py-3 bg-gray-50 border-b">
          <p className="text-sm font-medium text-gray-800">{question?.question}</p>
          {question?.category && (
            <span className="inline-block mt-1 px-2 py-0.5 bg-teal-100 text-teal-700 rounded-full text-[10px] font-medium">
              {question.category}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {isLoading && (
            <div className="py-12 text-center">
              <Loader2 className="w-10 h-10 text-teal-500 animate-spin mx-auto mb-3" />
              <p className="text-sm text-gray-600">Generating your study guide...</p>
              <button
                onClick={onClose}
                className="mt-3 text-xs text-gray-400 hover:text-gray-600 underline"
              >
                Cancel
              </button>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <div>
                <p className="text-sm text-red-700">{error}</p>
                <button onClick={fetchStudyGuide} className="text-xs text-red-500 underline mt-1">Retry</button>
              </div>
            </div>
          )}

          {result && (
            <>
              {/* What They're Really Asking */}
              {result.whatTheyreReallyAsking && (
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-200">
                  <h3 className="text-sm font-bold text-purple-800 mb-1.5">🧠 What They&apos;re Really Asking</h3>
                  <p className="text-sm text-purple-900 leading-relaxed">{result.whatTheyreReallyAsking}</p>
                </div>
              )}

              {/* Framework */}
              {result.framework && (
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <h3 className="text-sm font-bold text-gray-800 mb-1">📐 Framework: {result.framework.name}</h3>
                  <p className="text-xs text-gray-500 mb-3">{result.framework.why}</p>
                  <div className="space-y-2">
                    {result.framework.sections?.map((sec) => (
                      <div key={sec.letter} className="flex items-start gap-2">
                        <span className="w-7 h-7 bg-teal-100 text-teal-700 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0">
                          {sec.letter}
                        </span>
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-gray-700">{sec.label}</p>
                          <p className="text-xs text-gray-500 italic">{sec.prompt}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Power Phrases */}
              {result.powerPhrases?.length > 0 && (
                <div className="bg-white rounded-xl p-4 border border-emerald-200">
                  <h3 className="text-sm font-bold text-emerald-800 mb-2">💬 Power Phrases</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {result.powerPhrases.map((phrase, i) => (
                      <span key={i} className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-medium border border-emerald-200">
                        &ldquo;{phrase}&rdquo;
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Common Mistakes */}
              {result.commonMistakes?.length > 0 && (
                <div className="bg-white rounded-xl p-4 border border-red-100">
                  <h3 className="text-sm font-bold text-red-800 mb-2">⚠️ Common Mistakes</h3>
                  <ul className="space-y-1.5">
                    {result.commonMistakes.map((m, i) => (
                      <li key={i} className="text-xs text-gray-700 flex items-start gap-2">
                        <span className="text-red-400 mt-0.5">✗</span>
                        <span>{m}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* One Thing to Remember */}
              {result.oneThingToRemember && (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200">
                  <h3 className="text-sm font-bold text-amber-800 mb-1.5">⭐ If You Only Remember One Thing</h3>
                  <p className="text-sm text-amber-900 font-medium leading-relaxed">{result.oneThingToRemember}</p>
                </div>
              )}

              {/* Sources */}
              {result.sources?.length > 0 && (
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                  <p className="text-[10px] font-semibold text-gray-500 mb-1 uppercase tracking-wide">Methodology</p>
                  <div className="space-y-0.5">
                    {result.sources.map((src, i) => (
                      <p key={i} className="text-[10px] text-gray-400 flex items-start gap-1">
                        <span>📚</span>
                        <span>{src}</span>
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default QuestionSparkNotes;
