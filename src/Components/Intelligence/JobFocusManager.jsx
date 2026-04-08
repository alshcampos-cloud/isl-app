/**
 * JobFocusManager.jsx — AI-powered question bank curation for job-specific focus.
 *
 * D.R.A.F.T. protocol: NEW file.
 *
 * Analyzes user's question bank against their job context (role, company, JD)
 * and creates a curated "favorites" subset. Unlike JD Decoder (which GENERATES
 * new questions), this CURATES existing ones. Nothing gets deleted.
 *
 * Exports:
 *   - <JobFocusManager /> — UI component for Command Center bank tab
 *   - loadFavorites(userId) — read favorites from localStorage
 *   - saveFavorites(userId, data) — write favorites to localStorage
 *   - clearFavorites(userId) — remove favorites
 *   - isFocusModeOn(userId) — check if focus mode is toggled on
 *   - setFocusMode(userId, enabled) — toggle focus mode
 *   - getFilteredQuestions(questions, userId) — returns filtered or full question list
 */

import { useState, useCallback } from 'react';
import { Sparkles, Target, Loader2, RotateCcw, X, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { fetchWithRetry } from '../../utils/fetchWithRetry';
import { incrementUsage } from '../../utils/creditSystem';

// ============================================================
// localStorage Helpers (exported for use by App.jsx)
// ============================================================

const FAVORITES_KEY = 'isl_job_favorites';
const FOCUS_MODE_KEY = 'isl_focus_mode';

export function loadFavorites(userId) {
  try {
    const raw = localStorage.getItem(`${FAVORITES_KEY}_${userId}`);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}

export function saveFavorites(userId, data) {
  try {
    localStorage.setItem(`${FAVORITES_KEY}_${userId}`, JSON.stringify(data));
  } catch (err) {
    console.warn('⚠️ Favorites save error:', err);
  }
}

export function clearFavorites(userId) {
  try {
    localStorage.removeItem(`${FAVORITES_KEY}_${userId}`);
  } catch {}
}

export function isFocusModeOn(userId) {
  try {
    return localStorage.getItem(`${FOCUS_MODE_KEY}_${userId}`) === 'true';
  } catch { return false; }
}

export function setFocusMode(userId, enabled) {
  try {
    localStorage.setItem(`${FOCUS_MODE_KEY}_${userId}`, enabled ? 'true' : 'false');
  } catch {}
}

/**
 * Filter questions based on focus mode.
 * If focus mode is on and favorites exist, return only favorite questions.
 * Falls back to all questions if no favorites match.
 */
export function getFilteredQuestions(questions, userId) {
  if (!userId || !isFocusModeOn(userId)) return questions;

  const favorites = loadFavorites(userId);
  if (!favorites || !favorites.questionIds || favorites.questionIds.length === 0) {
    return questions;
  }

  const favSet = new Set(favorites.questionIds);
  const filtered = questions.filter(q => favSet.has(q.id));

  // If no matches (stale favorites), return all
  return filtered.length > 0 ? filtered : questions;
}


// ============================================================
// Component
// ============================================================

export default function JobFocusManager({ questions, getUserContext, userId, onFavoritesUpdated }) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(() => loadFavorites(userId));

  const analyzeQuestions = useCallback(async () => {
    const ctx = getUserContext ? getUserContext() : {};
    if (!ctx.targetRole && !ctx.jobDescription) {
      setError('Please set your target role or paste a job description in the Interview Prep tab first.');
      return;
    }

    if (!questions || questions.length === 0) {
      setError('No questions in your bank to analyze. Add some questions first!');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      // Build the question list for the AI
      const questionList = questions.map((q, i) => ({
        idx: i,
        id: q.id,
        question: q.question,
        category: q.category,
        priority: q.priority,
      }));

      const systemPrompt = `You are an interview preparation expert. The user is preparing for a specific role. Your job is to analyze their question bank and select the questions most relevant to the role they're interviewing for.

Return ONLY a valid JSON object with this exact structure:
{
  "selectedIndices": [0, 2, 5],
  "reasoning": "Brief explanation of why these questions are most relevant"
}

Select approximately 40-60% of the questions as most relevant. Prioritize:
1. Questions directly related to the role responsibilities
2. Behavioral questions that match the job requirements
3. Technical questions relevant to the field
4. Core narrative questions (always relevant)

Do NOT add any questions. Only select from the provided list using their index numbers.`;

      const userMessage = `TARGET ROLE: ${ctx.targetRole || 'Not specified'}
COMPANY: ${ctx.targetCompany || 'Not specified'}
${ctx.jobDescription ? `JOB DESCRIPTION:\n${ctx.jobDescription.slice(0, 2000)}` : ''}

QUESTION BANK (${questionList.length} questions):
${questionList.map(q => `[${q.idx}] (${q.category} | ${q.priority}) ${q.question}`).join('\n')}

Select the most relevant questions for this role. Return JSON only.`;

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
      if (!jsonMatch) throw new Error('Could not parse analysis results.');

      const parsed = JSON.parse(jsonMatch[0]);
      if (!parsed.selectedIndices || !Array.isArray(parsed.selectedIndices)) {
        throw new Error('Invalid analysis format.');
      }

      // Map indices back to question IDs
      const selectedIds = parsed.selectedIndices
        .filter(idx => idx >= 0 && idx < questions.length)
        .map(idx => questions[idx].id);

      const favoritesData = {
        questionIds: selectedIds,
        role: ctx.targetRole || '',
        company: ctx.targetCompany || '',
        reasoning: parsed.reasoning || '',
        generatedAt: new Date().toISOString(),
        totalQuestions: questions.length,
        selectedCount: selectedIds.length,
      };

      saveFavorites(userId, favoritesData);
      setResult(favoritesData);
      if (onFavoritesUpdated) onFavoritesUpdated(favoritesData);

      // CHARGE AFTER SUCCESS (Battle Scar #8)
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) await incrementUsage(supabase, user.id, 'answer_assistant');
      } catch (e) { console.warn('Usage tracking failed:', e); }

      console.log(`✅ Job Focus: ${selectedIds.length}/${questions.length} questions selected`);
    } catch (err) {
      console.error('❌ Job Focus analysis error:', err);
      setError(err.message || 'Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  }, [questions, getUserContext, userId, onFavoritesUpdated]);

  const handleClear = useCallback(() => {
    clearFavorites(userId);
    setResult(null);
    if (onFavoritesUpdated) onFavoritesUpdated(null);
  }, [userId, onFavoritesUpdated]);

  // ============================================================
  // Render
  // ============================================================
  return (
    <div className="mb-6 bg-gradient-to-br from-indigo-50 via-sky-50 to-teal-50 rounded-xl p-4 border-2 border-indigo-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-indigo-600" />
          <h3 className="text-lg font-bold text-gray-900">Job Focus</h3>
        </div>
        {result && (
          <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full">
            {result.selectedCount}/{result.totalQuestions} selected
          </span>
        )}
      </div>

      {!result ? (
        <div>
          <p className="text-sm text-gray-600 mb-3">
            Let AI review your question bank and highlight the most relevant
            questions for your target role. Nothing gets deleted — just focused.
          </p>
          <button
            onClick={analyzeQuestions}
            onTouchEnd={(e) => { e.preventDefault(); analyzeQuestions(); }}
            disabled={isAnalyzing}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing your bank...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Curate for My Role
              </>
            )}
          </button>
        </div>
      ) : (
        <div>
          <div className="flex items-start gap-2 mb-3">
            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-800">
                {result.selectedCount} questions curated for {result.role || 'your role'}
                {result.company ? ` at ${result.company}` : ''}
              </p>
              {result.reasoning && (
                <p className="text-xs text-gray-500 mt-1">{result.reasoning}</p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={analyzeQuestions}
              onTouchEnd={(e) => { e.preventDefault(); analyzeQuestions(); }}
              disabled={isAnalyzing}
              className="flex-1 px-3 py-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-lg text-sm font-medium flex items-center justify-center gap-1 transition-all"
            >
              {isAnalyzing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
              Re-analyze
            </button>
            <button
              onClick={handleClear}
              onTouchEnd={(e) => { e.preventDefault(); handleClear(); }}
              className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-sm font-medium flex items-center justify-center gap-1 transition-all"
            >
              <X className="w-3.5 h-3.5" />
              Clear
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 mt-3 text-sm text-red-600">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}
