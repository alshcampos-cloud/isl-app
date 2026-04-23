/**
 * JDDecoder.jsx — AI-powered Job Description analysis view.
 *
 * Phase 4D: Turns JDs into actionable interview intelligence.
 * Produces: plain English summary, responsibilities, must-have vs nice-to-have,
 * culture signals, fit analysis, and predicted interview questions.
 *
 * Props:
 *   onBack — return to previous view
 *   jobDescription — JD text from context
 *   getUserContext — function returning user interview context
 *   onSaveQuestions — callback to add predicted questions to bank
 */

import { useState, useCallback, useMemo } from 'react';
import { ArrowLeft, Loader2, BookOpen, Target, AlertCircle, CheckCircle, Plus, Sparkles } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { fetchWithRetry } from '../../utils/fetchWithRetry';
import { incrementUsage } from '../../utils/creditSystem';
import { buildJDDecoderPrompt } from '../../utils/jdDecoderPrompt';
import NextStepSuggestion from './NextStepSuggestion';

// Cache helper
function getCachedResult(jdText) {
  try {
    const key = 'jd_decoder_' + simpleHash(jdText);
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

function setCachedResult(jdText, data) {
  try {
    const key = 'jd_decoder_' + simpleHash(jdText);
    localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
  } catch { /* quota exceeded — ignore */ }
}

function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

function JDDecoder({ onBack, jobDescription = '', getUserContext, onSaveQuestions, onNavigate }) {
  const [jdInput, setJdInput] = useState(jobDescription);
  const [result, setResult] = useState(() => getCachedResult(jobDescription) || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [savedQuestions, setSavedQuestions] = useState(new Set());

  const context = useMemo(() => getUserContext ? getUserContext() : {}, [getUserContext]);

  const analyzeJD = useCallback(async () => {
    const text = jdInput.trim();
    if (!text || text.length < 50) {
      setError('Please paste a full job description (at least 50 characters).');
      return;
    }

    // Check cache first
    const cached = getCachedResult(text);
    if (cached) {
      setError(null);
      setResult(cached);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const systemPrompt = buildJDDecoderPrompt(context);
      const userMessage = `Analyze this job description:\n\n${text.slice(0, 3000)}`;

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
            userMessage,
          }),
        }
      );

      if (!response.ok) throw new Error(`Analysis failed: ${response.status}`);

      const data = await response.json();
      const aiText = data.content?.[0]?.text || data.response || '';

      // Parse JSON from response
      const jsonMatch = aiText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('Could not parse analysis results. Please try again.');

      let parsed;
      try {
        parsed = JSON.parse(jsonMatch[0]);
      } catch {
        throw new Error('Analysis returned an unexpected format. Please try again.');
      }
      if (!parsed || typeof parsed !== 'object') throw new Error('Analysis returned invalid data. Please try again.');
      setResult(parsed);
      setCachedResult(text, parsed);

      // CHARGE AFTER SUCCESS (Battle Scar #8)
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) await incrementUsage(supabase, user.id, 'answer_assistant');
      } catch (e) { console.warn('Usage tracking failed:', e); }
    } catch (err) {
      console.error('JD Decoder error:', err);
      setError(err.message || 'Analysis failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [jdInput, context]);

  const handleSaveQuestion = useCallback((q, idx) => {
    if (onSaveQuestions) {
      onSaveQuestions([{
        question: q.question,
        category: q.category || 'Behavioral',
        priority: 'High',
        keywords: [],
        bullets: q.why ? [q.why] : [],
        source: 'JD Decoder',
      }]);
      setSavedQuestions(prev => new Set([...prev, idx]));
    }
  }, [onSaveQuestions]);

  const handleSaveAll = useCallback(() => {
    if (onSaveQuestions && result?.predictedQuestions) {
      const qs = result.predictedQuestions.map(q => ({
        question: q.question,
        category: q.category || 'Behavioral',
        priority: 'High',
        keywords: [],
        bullets: q.why ? [q.why] : [],
        source: 'JD Decoder',
      }));
      onSaveQuestions(qs);
      setSavedQuestions(new Set(result.predictedQuestions.map((_, i) => i)));
    }
  }, [onSaveQuestions, result]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={onBack} aria-label="Go back" className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-gray-800">JD Decoder</h1>
            <p className="text-xs text-gray-500">Turn job descriptions into interview intelligence</p>
          </div>
          <Sparkles className="w-5 h-5 text-teal-500" />
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-3xl">
        {/* Input area */}
        {!result && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Paste the job description
            </label>
            <textarea
              value={jdInput}
              onChange={(e) => setJdInput(e.target.value)}
              placeholder="Paste the full job description here..."
              rows={6}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm resize-y focus:ring-2 focus:ring-teal-300/50 focus:border-teal-300 transition-all min-h-[120px] max-h-[50vh]"
            />
            <div className="flex items-center justify-between mt-3">
              <span className="text-xs text-gray-400">{jdInput.length} characters</span>
              <button
                onClick={analyzeJD}
                disabled={isLoading || jdInput.trim().length < 50}
                className="px-6 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-xl font-semibold disabled:opacity-40 hover:from-teal-600 hover:to-emerald-600 transition-all flex items-center gap-2"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <BookOpen className="w-4 h-4" />}
                {isLoading ? 'Analyzing...' : 'Decode This JD'}
              </button>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 mb-6">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-red-700">{error}</p>
              <div className="flex items-center gap-3 mt-2">
                <button onClick={analyzeJD} className="text-xs text-red-600 font-semibold underline">Try Again</button>
                <button onClick={() => setError(null)} className="text-xs text-red-400 underline">Dismiss</button>
              </div>
            </div>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <Loader2 className="w-12 h-12 text-teal-500 animate-spin mx-auto mb-4" />
            <p className="text-lg font-semibold text-gray-700">Decoding your job description...</p>
            <p className="text-sm text-gray-500 mt-1">Analyzing requirements, predicting questions, and assessing your fit</p>
            <button
              onClick={onBack}
              className="mt-4 text-xs text-gray-400 hover:text-gray-600 underline"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Results */}
        {result && !isLoading && (
          <div className="space-y-4">
            {/* Re-analyze button */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">📋 Analysis Results</h2>
              <button
                onClick={() => { setResult(null); setSavedQuestions(new Set()); }}
                className="text-sm text-teal-600 hover:text-teal-700 font-medium"
              >
                ← Analyze another JD
              </button>
            </div>

            {/* Plain English Summary */}
            {result.plainEnglish && (
              <div className="bg-gradient-to-r from-teal-50 to-emerald-50 rounded-xl p-5 border border-teal-200">
                <h3 className="font-bold text-teal-800 mb-2">💡 What This Job Really Means</h3>
                <p className="text-sm text-teal-900 leading-relaxed">{result.plainEnglish}</p>
              </div>
            )}

            {/* Responsibilities */}
            {result.responsibilities?.length > 0 && (
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-3">📌 Key Responsibilities</h3>
                <ul className="space-y-2">
                  {result.responsibilities.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-teal-500 mt-0.5">•</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Must-Have vs Nice-to-Have */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {result.mustHave?.length > 0 && (
                <div className="bg-white rounded-xl p-5 shadow-sm border border-red-100">
                  <h3 className="font-bold text-red-800 mb-3">🔴 Must-Have</h3>
                  <ul className="space-y-1.5">
                    {result.mustHave.map((item, i) => (
                      <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                        <span className="text-red-400 mt-0.5">●</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {result.niceToHave?.length > 0 && (
                <div className="bg-white rounded-xl p-5 shadow-sm border border-amber-100">
                  <h3 className="font-bold text-amber-800 mb-3">🟡 Nice-to-Have</h3>
                  <ul className="space-y-1.5">
                    {result.niceToHave.map((item, i) => (
                      <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                        <span className="text-amber-400 mt-0.5">○</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Culture Signals */}
            {result.cultureSignals?.length > 0 && (
              <div className="bg-white rounded-xl p-5 shadow-sm border border-purple-100">
                <h3 className="font-bold text-purple-800 mb-3">🔮 Culture Signals</h3>
                <ul className="space-y-2">
                  {result.cultureSignals.map((s, i) => (
                    <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="text-purple-400 mt-0.5">◆</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Your Fit */}
            {(result.yourFit?.strengths?.length > 0 || result.yourFit?.gaps?.length > 0) && (
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-3">🎯 Your Fit</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {result.yourFit.strengths?.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-green-600 mb-2 uppercase tracking-wide">Strengths</p>
                      {result.yourFit.strengths.map((s, i) => (
                        <p key={i} className="text-sm text-gray-700 mb-1.5 flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                          <span>{s}</span>
                        </p>
                      ))}
                    </div>
                  )}
                  {result.yourFit.gaps?.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-amber-600 mb-2 uppercase tracking-wide">Gaps to Address</p>
                      {result.yourFit.gaps.map((g, i) => (
                        <p key={i} className="text-sm text-gray-700 mb-1.5 flex items-start gap-2">
                          <Target className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                          <span>{g}</span>
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Predicted Questions */}
            {result.predictedQuestions?.length > 0 && (
              <div className="bg-white rounded-xl p-5 shadow-sm border border-teal-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-teal-800">🔮 They&apos;ll Probably Ask...</h3>
                  <button
                    onClick={handleSaveAll}
                    className="px-3 py-1.5 bg-teal-100 text-teal-700 rounded-lg text-xs font-semibold hover:bg-teal-200 transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    Save All to Bank
                  </button>
                </div>
                <div className="space-y-3">
                  {result.predictedQuestions.map((q, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-bold text-teal-600 mt-0.5">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800">{q.question}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{q.why}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 bg-teal-50 text-teal-600 rounded-full text-[10px] font-medium">
                          {q.category}
                        </span>
                      </div>
                      <button
                        onClick={() => handleSaveQuestion(q, i)}
                        disabled={savedQuestions.has(i)}
                        className={`flex-shrink-0 p-1.5 rounded-lg transition-colors ${
                          savedQuestions.has(i)
                            ? 'bg-green-100 text-green-600'
                            : 'bg-gray-100 text-gray-500 hover:bg-teal-100 hover:text-teal-600'
                        }`}
                      >
                        {savedQuestions.has(i) ? <CheckCircle className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Next Step Suggestion after analysis */}
        {result && !isLoading && onNavigate && (
          <div className="mt-4">
            <NextStepSuggestion context="jd-complete" onNavigate={onNavigate} />
          </div>
        )}
      </div>
    </div>
  );
}

export default JDDecoder;
