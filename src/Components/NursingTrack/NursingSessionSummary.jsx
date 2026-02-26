// NursingTrack — Session Summary
// Shown after a mock interview session ends.
// Displays per-question scores, framework breakdown, strengths, areas to improve.
//
// Score parsing uses defensive null fallback — "Unscored" when AI doesn't format tag.
// This component NEVER generates clinical content. It summarizes communication coaching.
//
// ⚠️ D.R.A.F.T. Protocol: NEW file. No existing code modified.

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft, RotateCcw, BarChart3, CheckCircle, AlertCircle,
  BookOpen, Stethoscope, Target, TrendingUp, Save, Loader2, Award
} from 'lucide-react';
import { upsertSavedAnswer } from './nursingSupabase';
import { supabase } from '../../lib/supabase';
import { fetchWithRetry } from '../../utils/fetchWithRetry';

export default function NursingSessionSummary({ specialty, sessionResults, onRetry, onBack, userData }) {
  // Track which questions have been saved as "Best Answer" in this session
  const [savedQuestions, setSavedQuestions] = useState({}); // { [questionId]: true }
  const [savingQuestion, setSavingQuestion] = useState(null); // questionId being saved

  // AI-generated holistic interview debrief
  const [debrief, setDebrief] = useState(null);
  const [debriefLoading, setDebriefLoading] = useState(false);
  const [debriefError, setDebriefError] = useState(null);

  const userId = userData?.user?.id;

  // ── Generate AI debrief on mount ──
  useEffect(() => {
    if (!sessionResults || sessionResults.length === 0) return;

    const generateDebrief = async () => {
      setDebriefLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error('Not authenticated');

        // Build a concise summary of Q&A pairs for the AI
        const qaList = sessionResults.map((r, i) => (
          `Q${i + 1} [${r.responseFramework?.toUpperCase() || 'STAR'}, ${r.category}]: "${r.question}"\nScore: ${r.score !== null ? `${r.score}/5` : 'Unscored'}`
        )).join('\n\n');

        const debriefPrompt = `You are reviewing a completed nursing mock interview for a ${specialty.name} position. The candidate answered ${sessionResults.length} questions. Here are the results:

${qaList}

Provide a SHORT (150-200 words max) holistic interview debrief with these sections:
1. **Overall Impression** — One sentence summarizing how they'd come across to a hiring manager.
2. **Communication Strengths** — 2 specific things they did well across the session (not clinical — communication/delivery).
3. **Priority Improvement** — The ONE most impactful thing they should work on before a real interview.
4. **Interview Readiness** — A one-line honest but encouraging assessment: "Ready for interviews", "Nearly there — one more practice session would help", or "Keep practicing — you're building a strong foundation".

RULES:
- DO NOT evaluate clinical accuracy. Only assess communication quality.
- Be specific and constructive, never patronizing.
- Reference actual question categories or frameworks they practiced.
- Keep it SHORT. This is a summary, not a full coaching session.`;

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
              // No nursingFeature — debrief is part of the session they already paid for.
              // Omitting nursingFeature skips server-side credit validation entirely.
              systemPrompt: debriefPrompt,
              conversationHistory: [],
              userMessage: 'Please provide the interview debrief.',
            }),
          }
        );

        if (!response.ok) throw new Error(`Debrief failed: ${response.status}`);

        const data = await response.json();

        // Handle Anthropic errors
        if (data.type === 'error' && data.error) {
          throw new Error(data.error.message || 'AI service error');
        }

        const content = data.content?.[0]?.text || data.response || data.feedback || '';
        if (content) {
          // Strip any score tags that might sneak in
          setDebrief(content.replace(/\[SCORE:\s*\d+\/5\]/gi, '').trim());
        }
      } catch (err) {
        console.warn('⚠️ Debrief generation failed (non-blocking):', err);
        setDebriefError(true);
      } finally {
        setDebriefLoading(false);
      }
    };

    generateDebrief();
  }, []); // Run once on mount

  const handleSaveBestAnswer = async (questionId, answerText) => {
    if (!userId || !answerText?.trim() || savingQuestion) return;
    setSavingQuestion(questionId);
    try {
      const result = await upsertSavedAnswer(userId, questionId, answerText.trim());
      if (result.success) {
        setSavedQuestions(prev => ({ ...prev, [questionId]: true }));
        // localStorage fallback
        try {
          const local = JSON.parse(localStorage.getItem(`nursing_saved_answers_${userId}`) || '{}');
          local[questionId] = answerText.trim();
          localStorage.setItem(`nursing_saved_answers_${userId}`, JSON.stringify(local));
        } catch { /* ignore */ }
      }
    } catch (err) {
      console.warn('⚠️ Save best answer from summary failed:', err);
    } finally {
      setSavingQuestion(null);
    }
  };
  // ============================================================
  // COMPUTE SUMMARY STATS
  // ============================================================

  const totalQuestions = sessionResults.length;

  // Separate scored vs unscored
  const scoredResults = sessionResults.filter(r => r.score !== null);
  const unscoredCount = totalQuestions - scoredResults.length;

  // Overall average (only from scored results)
  const avgScore = scoredResults.length > 0
    ? (scoredResults.reduce((sum, r) => sum + r.score, 0) / scoredResults.length).toFixed(1)
    : null;

  // Framework breakdown
  const sbarResults = sessionResults.filter(r => r.responseFramework === 'sbar');
  const starResults = sessionResults.filter(r => r.responseFramework === 'star');

  const sbarScored = sbarResults.filter(r => r.score !== null);
  const starScored = starResults.filter(r => r.score !== null);

  const sbarAvg = sbarScored.length > 0
    ? (sbarScored.reduce((sum, r) => sum + r.score, 0) / sbarScored.length).toFixed(1)
    : null;
  const starAvg = starScored.length > 0
    ? (starScored.reduce((sum, r) => sum + r.score, 0) / starScored.length).toFixed(1)
    : null;

  // Strengths and areas to improve (top and bottom scored)
  const sortedByScore = [...scoredResults].sort((a, b) => b.score - a.score);
  const strengths = sortedByScore.slice(0, 2); // Top 2
  const toImprove = sortedByScore.length > 2
    ? sortedByScore.slice(-2).reverse() // Bottom 2
    : [];

  // Score color helper
  const scoreColor = (score) => {
    if (score === null) return 'text-slate-400';
    if (score >= 4) return 'text-green-400';
    if (score >= 3) return 'text-yellow-400';
    return 'text-red-400';
  };

  const scoreBg = (score) => {
    if (score === null) return 'bg-slate-500/10 border-slate-500/20';
    if (score >= 4) return 'bg-green-500/10 border-green-500/20';
    if (score >= 3) return 'bg-yellow-500/10 border-yellow-500/20';
    return 'bg-red-500/10 border-red-500/20';
  };

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900">
      {/* Header */}
      <div className="bg-slate-900/80 backdrop-blur-lg border-b border-white/10 sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Dashboard</span>
          </button>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-sky-400" />
            <span className="text-white font-medium text-sm">Session Summary</span>
          </div>
          <div className="w-16" />
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="text-5xl mb-3">{specialty.icon}</div>
          <h1 className="text-2xl font-bold text-white mb-2">Session Complete</h1>
          <p className="text-slate-400 text-sm">
            {specialty.name} Mock Interview — {totalQuestions} question{totalQuestions !== 1 ? 's' : ''} practiced
          </p>
        </motion.div>

        {/* AI Debrief — holistic interview assessment */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-sky-500/10 to-purple-500/10 border border-sky-400/20 rounded-2xl p-5 mb-6"
        >
          <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
            <Award className="w-4 h-4 text-sky-400" />
            Interview Debrief
          </h3>
          {debriefLoading ? (
            <div className="flex items-center gap-2 text-slate-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Generating your interview assessment...</span>
            </div>
          ) : debrief ? (
            <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{debrief}</p>
          ) : debriefError ? (
            <p className="text-slate-500 text-xs italic">Assessment unavailable — review your per-question scores below.</p>
          ) : null}
        </motion.div>

        {/* Overall Score Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6 text-center"
        >
          {avgScore !== null ? (
            <>
              <div className={`text-5xl font-bold mb-1 ${scoreColor(parseFloat(avgScore))}`}>
                {avgScore}
              </div>
              <div className="text-slate-400 text-sm">out of 5.0</div>
              <div className="text-slate-500 text-xs mt-1">
                Based on {scoredResults.length} scored response{scoredResults.length !== 1 ? 's' : ''}
                {unscoredCount > 0 && ` (${unscoredCount} unscored)`}
              </div>
            </>
          ) : (
            <>
              <div className="text-3xl font-bold text-slate-400 mb-1">No Scores</div>
              <div className="text-slate-500 text-xs">
                The AI wasn't able to generate scores for this session. Your practice is still valuable!
              </div>
            </>
          )}
        </motion.div>

        {/* Framework Breakdown — only show if BOTH frameworks have questions, or just show the one that does */}
        {(sbarResults.length > 0 || starResults.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className={`grid gap-3 mb-6 ${sbarResults.length > 0 && starResults.length > 0 ? 'grid-cols-2' : 'grid-cols-1'}`}
          >
            {sbarResults.length > 0 && (
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                <div className="text-green-400 text-xs font-semibold mb-1">SBAR</div>
                <div className="text-white text-xl font-bold">
                  {sbarAvg !== null ? sbarAvg : '--'}
                </div>
                <div className="text-slate-500 text-xs mt-1">
                  {sbarResults.length} clinical question{sbarResults.length !== 1 ? 's' : ''}
                </div>
              </div>
            )}
            {starResults.length > 0 && (
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                <div className="text-purple-400 text-xs font-semibold mb-1">STAR</div>
                <div className="text-white text-xl font-bold">
                  {starAvg !== null ? starAvg : '--'}
                </div>
                <div className="text-slate-500 text-xs mt-1">
                  {starResults.length} behavioral question{starResults.length !== 1 ? 's' : ''}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Strengths */}
        {strengths.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-400" />
              Strongest Responses
            </h3>
            <div className="space-y-2">
              {strengths.map((result, i) => (
                <div key={i} className="bg-green-500/5 border border-green-500/10 rounded-xl p-3 flex items-start gap-3">
                  <div className={`text-sm font-bold ${scoreColor(result.score)} mt-0.5`}>
                    {result.score}/5
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-medium truncate">{result.question}</p>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full mt-1 inline-block ${
                      result.responseFramework === 'sbar'
                        ? 'bg-green-500/20 text-green-300'
                        : 'bg-purple-500/20 text-purple-300'
                    }`}>
                      {result.responseFramework === 'sbar' ? 'SBAR' : 'STAR'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Areas to Improve */}
        {toImprove.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mb-6"
          >
            <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
              <Target className="w-4 h-4 text-amber-400" />
              Areas to Strengthen
            </h3>
            <div className="space-y-2">
              {toImprove.map((result, i) => (
                <div key={i} className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-3 flex items-start gap-3">
                  <div className={`text-sm font-bold ${scoreColor(result.score)} mt-0.5`}>
                    {result.score}/5
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-medium truncate">{result.question}</p>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full mt-1 inline-block ${
                      result.responseFramework === 'sbar'
                        ? 'bg-green-500/20 text-green-300'
                        : 'bg-purple-500/20 text-purple-300'
                    }`}>
                      {result.responseFramework === 'sbar' ? 'SBAR' : 'STAR'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Per-Question Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-sky-400" />
            All Questions
          </h3>
          <div className="space-y-2">
            {sessionResults.map((result, i) => (
              <div key={i} className={`border rounded-xl p-3 ${scoreBg(result.score)}`}>
                <div className="flex items-center gap-3">
                  <div className="text-slate-500 text-xs font-mono w-5 flex-shrink-0">
                    {i + 1}.
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs truncate">{result.question}</p>
                  </div>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full flex-shrink-0 ${
                    result.responseFramework === 'sbar'
                      ? 'bg-green-500/20 text-green-300'
                      : 'bg-purple-500/20 text-purple-300'
                  }`}>
                    {result.responseFramework === 'sbar' ? 'SBAR' : 'STAR'}
                  </span>
                  <div className={`text-sm font-bold flex-shrink-0 ${scoreColor(result.score)}`}>
                    {result.score !== null ? `${result.score}/5` : 'Unscored'}
                  </div>
                </div>
                {/* Save as Best Answer — shown when user has an answer and is authenticated */}
                {userId && result.userAnswer && result.questionId && (
                  <div className="mt-2 pl-8">
                    <button
                      onClick={() => handleSaveBestAnswer(result.questionId, result.userAnswer)}
                      onTouchEnd={(e) => { e.preventDefault(); handleSaveBestAnswer(result.questionId, result.userAnswer); }}
                      disabled={!!savedQuestions[result.questionId] || savingQuestion === result.questionId}
                      className={`flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-lg transition-all ${
                        savedQuestions[result.questionId]
                          ? 'bg-green-500/10 border border-green-500/20 text-green-300 cursor-default'
                          : 'bg-amber-500/10 border border-amber-500/20 text-amber-300 hover:bg-amber-500/20'
                      }`}
                    >
                      {savingQuestion === result.questionId ? (
                        <><Loader2 className="w-2.5 h-2.5 animate-spin" /> Saving...</>
                      ) : savedQuestions[result.questionId] ? (
                        <><CheckCircle className="w-2.5 h-2.5" /> Saved</>
                      ) : (
                        <><Save className="w-2.5 h-2.5" /> Save as Best Answer</>
                      )}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recommended Resources */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-sky-500/10 border border-sky-400/20 rounded-xl p-4 mb-6"
        >
          <h3 className="text-sky-200 text-sm font-medium mb-2 flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Recommended Resources
          </h3>
          <p className="text-sky-300/70 text-xs leading-relaxed mb-2">
            Continue building your clinical knowledge with these free resources:
          </p>
          <div className="space-y-1">
            {sbarResults.length > 0 && (
              <p className="text-sky-300 text-xs">
                • <strong>SBAR Toolkit</strong> — Institute for Healthcare Improvement (free)
              </p>
            )}
            <p className="text-sky-300 text-xs">
              • <strong>NCLEX-RN Test Plan</strong> — NCSBN (free PDF)
            </p>
            <p className="text-sky-300 text-xs">
              • <strong>National Patient Safety Goals</strong> — Joint Commission
            </p>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-3 mb-8"
        >
          <button
            onClick={onRetry}
            className="flex-1 bg-gradient-to-r from-sky-600 to-cyan-500 text-white font-semibold py-3 rounded-xl shadow-lg shadow-sky-500/30 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Try Again
          </button>
          <button
            onClick={onBack}
            className="flex-1 bg-white/10 border border-white/20 text-white font-semibold py-3 rounded-xl hover:bg-white/20 transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
        </motion.div>

        {/* Walled garden reminder */}
        <p className="text-slate-600 text-xs text-center mb-4">
          AI coaches your communication and delivery • Clinical content reviewed by nursing professionals
        </p>
      </div>
    </div>
  );
}
