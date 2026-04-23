/**
 * AnswerForge.jsx — Portfolio-Powered Answer Upgrader
 *
 * Takes existing answers, cross-references with portfolio projects,
 * and generates improved answers enriched with real proof-of-work.
 * Side-by-side comparison with editable new version.
 * Saves upgraded answer + bullets + keywords for the Practice Prompter.
 *
 * D.R.A.F.T. protocol: NEW file. No existing code modified.
 *
 * Battle Scars enforced:
 *   #3  — fetchWithRetry (3 attempts, backoff)
 *   #8  — Charge AFTER success, never before
 *   #1  — Self-contained component, minimal App.jsx touch
 *   #19 — AI uses ONLY user's own data, never invents
 */

import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import {
  ArrowLeft, Sparkles, Loader2, ChevronRight, Save, Edit2,
  Check, AlertCircle, Briefcase, Target, Zap, Copy, RefreshCw,
  BookOpen, ArrowRight, Star, FileText, MessageSquare
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { fetchWithRetry } from '../../utils/fetchWithRetry';
import { incrementUsage } from '../../utils/creditSystem';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://tzrlpwtkrtvjpdhcaayu.supabase.co';

// ─── Load portfolio from localStorage ────────────────────────────────────────

function loadPortfolio() {
  try {
    const raw = localStorage.getItem('isl_portfolio');
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(p => p.isAnalyzed) : [];
  } catch { return []; }
}

// ─── Find relevant portfolio projects for a question ─────────────────────────

function findRelevantProjects(question, projects) {
  if (!projects.length) return [];

  const qWords = new Set(
    (question.question + ' ' + (question.keywords || []).join(' ') + ' ' + (question.category || ''))
      .toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(w => w.length > 3)
  );

  return projects
    .map(p => {
      const pText = `${p.title} ${p.aiSummary || ''} ${(p.keySkills || []).join(' ')} ${(p.interviewAngles || []).join(' ')}`.toLowerCase();
      const pWords = pText.replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(w => w.length > 3);
      const overlap = pWords.filter(w => qWords.has(w)).length;
      return { ...p, relevance: overlap };
    })
    .filter(p => p.relevance > 0)
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, 5);
}

// ─── Component ───────────────────────────────────────────────────────────────

function AnswerForge({ questions = [], onBack, getUserContext, onSaveQuestion }) {
  const [portfolio] = useState(loadPortfolio);
  const [selectedQ, setSelectedQ] = useState(null);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [upgradeError, setUpgradeError] = useState(null);

  // Upgrade result
  const [upgradedAnswer, setUpgradedAnswer] = useState('');
  const [upgradedBullets, setUpgradedBullets] = useState([]);
  const [upgradedKeywords, setUpgradedKeywords] = useState([]);
  const [upgradedFollowUps, setUpgradedFollowUps] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState('');

  // Save state
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Copied state
  const [copied, setCopied] = useState(false);

  // Bulk upgrade state
  const [isBulkRunning, setIsBulkRunning] = useState(false);
  const [bulkProgress, setBulkProgress] = useState({ done: 0, total: 0, current: '' });
  const [bulkResults, setBulkResults] = useState({ upgraded: 0, failed: 0, skipped: 0 });
  const bulkCancelRef = useRef(false);

  // Draft state — load existing drafts from localStorage
  const [drafts, setDrafts] = useState(() => {
    try { return JSON.parse(localStorage.getItem('isl_answer_forge_drafts') || '{}'); } catch { return {}; }
  });
  const draftCount = Object.keys(drafts).length;

  // Get user context (memoized to prevent re-render issues)
  const context = useMemo(() => getUserContext ? getUserContext() : {}, [getUserContext]);

  // Categorize questions: relevant to interview (JD-generated, high priority, matching role keywords)
  const { interviewRelevant, answeredQuestions, unansweredQuestions } = useMemo(() => {
    const roleWords = new Set(
      ((context.targetRole || '') + ' ' + (context.jobDescription || ''))
        .toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(w => w.length > 3)
    );

    const scored = questions.map(q => {
      const isGenerated = (q.category || '').toLowerCase() === 'generated';
      const isHighPriority = (q.priority || '').toLowerCase() === 'high';
      const qWords = (q.question + ' ' + (q.keywords || []).join(' ')).toLowerCase().split(/\s+/);
      const roleOverlap = qWords.filter(w => roleWords.has(w)).length;
      const relevanceScore = (isGenerated ? 10 : 0) + (isHighPriority ? 5 : 0) + roleOverlap;
      return { ...q, relevanceScore };
    });

    // Interview-relevant: generated from JD OR high priority OR strong keyword match
    const relevant = scored
      .filter(q => q.relevanceScore >= 3)
      .sort((a, b) => b.relevanceScore - a.relevanceScore);

    const relevantIds = new Set(relevant.map(q => q.id));

    const answered = scored
      .filter(q => !relevantIds.has(q.id) && q.narrative && q.narrative.trim().length > 20);

    const unanswered = scored
      .filter(q => !relevantIds.has(q.id) && (!q.narrative || q.narrative.trim().length <= 20));

    return { interviewRelevant: relevant, answeredQuestions: answered, unansweredQuestions: unanswered };
  }, [questions, context.targetRole, context.jobDescription]);

  // ─── AI Upgrade Call ─────────────────────────────────────────────────────

  const upgradeAnswer = useCallback(async (question) => {
    setIsUpgrading(true);
    setUpgradeError(null);
    setUpgradedAnswer('');
    setUpgradedBullets([]);
    setUpgradedKeywords([]);
    setUpgradedFollowUps([]);
    setIsEditing(false);
    setSaveSuccess(false);

    try {
      const session = await supabase.auth.getSession();
      const token = session?.data?.session?.access_token;
      if (!token) throw new Error('Not authenticated');

      const relevantProjects = findRelevantProjects(question, portfolio);

      // Build DETAILED context for top matches + BRIEF list of all other projects
      const detailedProjects = relevantProjects.map(p => {
        const summary = (p.aiSummary || '').slice(0, 500);
        const star = (p.starStory || '').slice(0, 400);
        const skills = (p.keySkills || []).slice(0, 8).join(', ');
        const bullets = (p.rewrittenBullets || []).slice(0, 4).join('; ');
        return `PROJECT: ${p.title}\nTimeframe: ${p.timeframe || 'Unknown'}\nRole: ${p.role || 'N/A'}\nSummary: ${summary}\nSkills: ${skills}\nSTAR: ${star}\nBullets: ${bullets}`;
      }).join('\n\n');

      // Brief list of ALL other analyzed projects so the AI knows what else exists
      const relevantIds = new Set(relevantProjects.map(p => p.id));
      const otherProjects = portfolio
        .filter(p => p.isAnalyzed && !relevantIds.has(p.id))
        .map(p => `• ${p.title} (${p.role || 'N/A'}, ${p.timeframe || '?'}) — ${(p.aiSummary || '').slice(0, 120)}`)
        .join('\n');

      const portfolioContext = [
        detailedProjects ? `TOP KEYWORD MATCHES (detailed):\n${detailedProjects}` : '',
        otherProjects ? `\nALL OTHER PROJECTS (you may use these if they better answer the question):\n${otherProjects}` : '',
      ].filter(Boolean).join('\n\n') || 'No portfolio data available.';

      // Strip portfolioSummary from userContext to avoid duplication — we send explicit portfolioContext
      const slimContext = { ...context };
      delete slimContext.portfolioSummary;

      // Build summaries of OTHER answered questions to prevent overlap
      const otherAnswerSummaries = questions
        .filter(q => q.id !== question.id && q.narrative && q.narrative.trim().length > 20)
        .slice(0, 10) // cap to avoid token overflow
        .map(q => `Q: "${q.question.slice(0, 80)}" → ${q.narrative.slice(0, 150)}...`)
        .join('\n');
      if (otherAnswerSummaries) slimContext.otherAnswerSummaries = otherAnswerSummaries;

      const response = await fetchWithRetry(`${SUPABASE_URL}/functions/v1/ai-feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          mode: 'upgrade-answer',
          question: { question: question.question, category: question.category },
          answer: question.narrative,
          userContext: slimContext,
          conversation: [],
          portfolioContext,
          currentBullets: question.bullets || [],
          currentKeywords: question.keywords || [],
        }),
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();
      console.log('🔧 Answer Forge response:', JSON.stringify(data).slice(0, 500));

      // Check for API-level errors
      if (data.error) throw new Error(`AI error: ${typeof data.error === 'string' ? data.error : data.error.message || JSON.stringify(data.error)}`);
      if (data.type === 'error') throw new Error(`AI error: ${data.error?.message || 'Unknown API error'}`);

      // Extract text from Anthropic response format
      const aiText = data.content?.[0]?.text || data.response || data.feedback || '';
      if (!aiText) throw new Error('Empty response from AI — raw: ' + JSON.stringify(data).slice(0, 200));

      // Parse JSON response — with truncation recovery
      let parsed;
      try {
        const jsonMatch = aiText.match(/\{[\s\S]*\}/);
        parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(aiText);
      } catch (parseErr) {
        // Try to salvage truncated JSON by extracting key fields with regex
        console.warn('JSON parse failed, attempting salvage:', parseErr.message);
        const answerMatch = aiText.match(/"upgradedAnswer"\s*:\s*"([\s\S]*?)(?:"\s*,\s*"bullets|"$)/);
        const bulletsMatch = aiText.match(/"bullets"\s*:\s*\[([\s\S]*?)\]/);
        const keywordsMatch = aiText.match(/"keywords"\s*:\s*\[([\s\S]*?)\]/);
        const followUpsMatch = aiText.match(/"followUps"\s*:\s*\[([\s\S]*?)\]\s*(?:,|\})/);

        if (answerMatch) {
          parsed = {
            upgradedAnswer: answerMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"'),
            bullets: bulletsMatch ? JSON.parse('[' + bulletsMatch[1] + ']').filter(Boolean) : question.bullets || [],
            keywords: keywordsMatch ? JSON.parse('[' + keywordsMatch[1] + ']').filter(Boolean) : question.keywords || [],
            followUps: [],
          };
          try { if (followUpsMatch) parsed.followUps = JSON.parse('[' + followUpsMatch[1] + ']'); } catch {}
        } else {
          // Last resort: treat as plain text
          parsed = {
            upgradedAnswer: aiText.replace(/[{}"]/g, '').trim(),
            bullets: question.bullets || [],
            keywords: question.keywords || [],
          };
        }
      }

      setUpgradedAnswer(parsed.upgradedAnswer || parsed.answer || aiText);
      setUpgradedBullets(parsed.bullets || parsed.prompterBullets || []);
      setUpgradedKeywords(parsed.keywords || parsed.prompterKeywords || []);
      setUpgradedFollowUps(parsed.followUps || []);

      // Charge AFTER success (Battle Scar #8)
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) await incrementUsage(supabase, user.id, 'answer_assistant');
      } catch (e) { console.warn('Usage tracking failed:', e); }

    } catch (err) {
      console.error('Upgrade error:', err);
      setUpgradeError(err.message || 'Failed to upgrade answer. Please try again.');
    } finally {
      setIsUpgrading(false);
    }
  }, [portfolio, context]);

  // ─── Save Upgraded Answer ────────────────────────────────────────────────

  const saveUpgrade = useCallback(async () => {
    if (!selectedQ || !upgradedAnswer) return;
    setIsSaving(true);

    try {
      const finalAnswer = isEditing ? editText : upgradedAnswer;
      const finalBullets = upgradedBullets.length > 0 ? upgradedBullets : selectedQ.bullets;
      const finalKeywords = upgradedKeywords.length > 0 ? upgradedKeywords : selectedQ.keywords;
      const finalFollowUps = upgradedFollowUps.length > 0 ? upgradedFollowUps : (selectedQ.followUps || []);

      // Update in Supabase (followUps stored in localStorage only — no column in questions table)
      const { error } = await supabase
        .from('questions')
        .update({
          narrative: finalAnswer,
          bullets: finalBullets,
          keywords: finalKeywords,
        })
        .eq('id', selectedQ.id);

      if (error) throw error;

      // Update localStorage (includes followUps for prompter access)
      try {
        const stored = JSON.parse(localStorage.getItem('isl_questions') || '[]');
        const updated = stored.map(q => q.id === selectedQ.id
          ? { ...q, narrative: finalAnswer, bullets: finalBullets, keywords: finalKeywords, followUps: finalFollowUps }
          : q
        );
        localStorage.setItem('isl_questions', JSON.stringify(updated));
      } catch {}

      // Notify parent to refresh questions
      if (onSaveQuestion) {
        onSaveQuestion(selectedQ.id, {
          narrative: finalAnswer,
          bullets: finalBullets,
          keywords: finalKeywords,
          followUps: finalFollowUps,
        });
      }

      // Clear draft after successful save
      try {
        const currentDrafts = JSON.parse(localStorage.getItem('isl_answer_forge_drafts') || '{}');
        delete currentDrafts[selectedQ.id];
        localStorage.setItem('isl_answer_forge_drafts', JSON.stringify(currentDrafts));
        setDrafts(currentDrafts);
      } catch {}

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Save error:', err);
      setUpgradeError('Failed to save. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [selectedQ, upgradedAnswer, upgradedBullets, upgradedKeywords, upgradedFollowUps, isEditing, editText, onSaveQuestion]);

  // ─── Bulk Upgrade All Questions ─────────────────────────────────────────

  const bulkUpgradeAll = useCallback(async () => {
    // Get all questions that need upgrading — skip ones that already have drafts
    const existingDrafts = (() => { try { return JSON.parse(localStorage.getItem('isl_answer_forge_drafts') || '{}'); } catch { return {}; } })();
    const allQs = [...interviewRelevant, ...answeredQuestions, ...unansweredQuestions]
      .filter(q => !existingDrafts[q.id]); // skip already-drafted
    const skippedExisting = (interviewRelevant.length + answeredQuestions.length + unansweredQuestions.length) - allQs.length;

    if (allQs.length === 0) {
      window.alert(`All ${skippedExisting} questions already have drafts! Go to "Review Drafts" to approve them.`);
      return;
    }

    const confirmed = window.confirm(
      `Generate draft upgrades for ${allQs.length} questions?\n\n${skippedExisting > 0 ? `(${skippedExisting} already have drafts — skipping those)\n\n` : ''}Your current answers will NOT be changed. Drafts are saved for you to review and approve tomorrow.\n\nEstimated time: ${Math.ceil(allQs.length * 4 / 60)} minutes.`
    );
    if (!confirmed) return;

    setIsBulkRunning(true);
    bulkCancelRef.current = false;
    setBulkProgress({ done: 0, total: allQs.length, current: '' });
    setBulkResults({ upgraded: 0, failed: 0, skipped: 0 });

    let upgraded = 0, failed = 0, skipped = 0;

    for (let i = 0; i < allQs.length; i++) {
      if (bulkCancelRef.current) break;

      const q = allQs[i];
      setBulkProgress({ done: i, total: allQs.length, current: q.question.slice(0, 60) + '...' });

      try {
        const session = await supabase.auth.getSession();
        const token = session?.data?.session?.access_token;
        if (!token) throw new Error('Not authenticated');

        const relevantProjects = findRelevantProjects(q, portfolio);

        const detailedProjects = relevantProjects.map(p => {
          const summary = (p.aiSummary || '').slice(0, 500);
          const star = (p.starStory || '').slice(0, 400);
          const skills = (p.keySkills || []).slice(0, 8).join(', ');
          const bullets = (p.rewrittenBullets || []).slice(0, 4).join('; ');
          return `PROJECT: ${p.title}\nTimeframe: ${p.timeframe || 'Unknown'}\nRole: ${p.role || 'N/A'}\nSummary: ${summary}\nSkills: ${skills}\nSTAR: ${star}\nBullets: ${bullets}`;
        }).join('\n\n');

        const relevantIds = new Set(relevantProjects.map(p => p.id));
        const otherProjects = portfolio
          .filter(p => p.isAnalyzed && !relevantIds.has(p.id))
          .map(p => `• ${p.title} (${p.role || 'N/A'}, ${p.timeframe || '?'}) — ${(p.aiSummary || '').slice(0, 120)}`)
          .join('\n');

        const portfolioCtx = [
          detailedProjects ? `TOP KEYWORD MATCHES (detailed):\n${detailedProjects}` : '',
          otherProjects ? `\nALL OTHER PROJECTS:\n${otherProjects}` : '',
        ].filter(Boolean).join('\n\n') || 'No portfolio data available.';

        const slimCtx = { ...context };
        delete slimCtx.portfolioSummary;

        const response = await fetchWithRetry(`${SUPABASE_URL}/functions/v1/ai-feedback`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            mode: 'upgrade-answer',
            question: { question: q.question, category: q.category },
            answer: q.narrative || '',
            userContext: slimCtx,
            conversation: [],
            portfolioContext: portfolioCtx,
            currentBullets: q.bullets || [],
            currentKeywords: q.keywords || [],
          }),
        });

        if (!response.ok) throw new Error(`API ${response.status}`);
        const data = await response.json();
        if (data.error || data.type === 'error') throw new Error('AI error');

        const text = data.feedback || data.response || '';
        let parsed;
        try {
          const jsonMatch = text.match(/\{[\s\S]*\}/);
          parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
        } catch { parsed = null; }

        if (!parsed?.upgradedAnswer) {
          skipped++;
          continue;
        }

        // DRAFT MODE — save to localStorage drafts ONLY. Do NOT touch Supabase or current answers.
        try {
          const drafts = JSON.parse(localStorage.getItem('isl_answer_forge_drafts') || '{}');
          drafts[q.id] = {
            questionId: q.id,
            question: q.question,
            category: q.category,
            originalAnswer: q.narrative || '',
            upgradedAnswer: parsed.upgradedAnswer,
            bullets: parsed.bullets || [],
            keywords: parsed.keywords || [],
            followUps: parsed.followUps || [],
            generatedAt: new Date().toISOString(),
          };
          localStorage.setItem('isl_answer_forge_drafts', JSON.stringify(drafts));
        } catch {}

        upgraded++;
      } catch (err) {
        console.warn(`Bulk upgrade failed for "${q.question.slice(0, 40)}":`, err.message);
        failed++;
      }

      // Small delay to avoid rate limiting
      await new Promise(r => setTimeout(r, 1500));
    }

    setBulkProgress({ done: allQs.length, total: allQs.length, current: 'Done!' });
    setBulkResults({ upgraded, failed, skipped });
    setIsBulkRunning(false);
    // Refresh drafts from localStorage
    try { setDrafts(JSON.parse(localStorage.getItem('isl_answer_forge_drafts') || '{}')); } catch {}
  }, [interviewRelevant, answeredQuestions, unansweredQuestions, portfolio, context, onSaveQuestion]);

  // ─── Copy to clipboard ──────────────────────────────────────────────────

  const copyAnswer = () => {
    const text = isEditing ? editText : upgradedAnswer;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  };

  // ─── Auto-load draft if one exists for this question ────────────────────

  useEffect(() => {
    if (selectedQ && drafts[selectedQ.id] && !upgradedAnswer) {
      const d = drafts[selectedQ.id];
      setUpgradedAnswer(d.upgradedAnswer);
      setUpgradedBullets(d.bullets || []);
      setUpgradedKeywords(d.keywords || []);
      setUpgradedFollowUps(d.followUps || []);
    }
  }, [selectedQ]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── RENDER: Question List ─────────────────────────────────────────────

  if (!selectedQ) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 pb-20">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200">
          <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
            <button onClick={onBack} className="p-2 -ml-2 rounded-xl hover:bg-slate-100 transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </button>
            <div className="flex-1">
              <h1 className="font-bold text-slate-800 text-lg">Answer Forge</h1>
              <p className="text-xs text-slate-500">Upgrade answers with your portfolio proof</p>
            </div>
            <div className="flex items-center gap-1.5 bg-indigo-50 px-2.5 py-1 rounded-full">
              <Briefcase className="w-3.5 h-3.5 text-indigo-500" />
              <span className="text-xs font-semibold text-indigo-600">{portfolio.length} projects</span>
            </div>
          </div>
        </div>

        <div className="max-w-lg mx-auto px-4 pt-4 space-y-4">
          {/* Bulk Upgrade Progress */}
          {isBulkRunning && (
            <div className="bg-indigo-50 rounded-2xl p-4 border border-indigo-200">
              <div className="flex items-center gap-2 mb-2">
                <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
                <span className="text-sm font-bold text-indigo-800">
                  Upgrading {bulkProgress.done}/{bulkProgress.total}...
                </span>
                <button
                  onClick={() => { bulkCancelRef.current = true; }}
                  className="ml-auto text-xs text-red-500 font-medium"
                >Stop</button>
              </div>
              <div className="w-full bg-indigo-100 rounded-full h-2 mb-2">
                <div
                  className="bg-indigo-500 h-2 rounded-full transition-all"
                  style={{ width: `${bulkProgress.total ? (bulkProgress.done / bulkProgress.total * 100) : 0}%` }}
                />
              </div>
              <p className="text-xs text-indigo-600 truncate">{bulkProgress.current}</p>
            </div>
          )}

          {/* Bulk Results */}
          {!isBulkRunning && bulkResults.upgraded > 0 && (
            <div className="bg-green-50 rounded-xl p-3 border border-green-200 flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-800">
                Done! {bulkResults.upgraded} upgraded{bulkResults.failed > 0 ? `, ${bulkResults.failed} failed` : ''}{bulkResults.skipped > 0 ? `, ${bulkResults.skipped} skipped` : ''}. Refresh to see results.
              </span>
            </div>
          )}

          {/* Bulk Upgrade Button + Explainer */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-4 text-white">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5" />
              <h2 className="font-bold">Answer Forge</h2>
            </div>
            <p className="text-sm text-indigo-100 leading-relaxed mb-3">
              Upgrade answers with your portfolio proof, prep info, and job context. Pick one question or upgrade all at once.
            </p>
            <button
              onClick={bulkUpgradeAll}
              disabled={isBulkRunning}
              className="w-full py-2.5 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-bold text-white transition-colors flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              {isBulkRunning ? 'Running...' : `Generate Drafts for All ${interviewRelevant.length + answeredQuestions.length + unansweredQuestions.length} Questions`}
            </button>
            {draftCount > 0 && (
              <p className="text-xs text-indigo-200 text-center mt-2">
                📝 {draftCount} draft{draftCount > 1 ? 's' : ''} ready to review — look for the yellow badges below
              </p>
            )}
          </div>

          {/* Prep Context — show what data the AI will use */}
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5" /> Your Prep Context (from Prep section)
            </h3>
            {(context.targetRole || context.targetCompany || context.background) ? (
              <div className="space-y-1.5">
                {context.targetRole && (
                  <div className="flex items-start gap-2">
                    <span className="text-[10px] text-slate-400 font-medium mt-0.5 w-16 flex-shrink-0">ROLE</span>
                    <span className="text-xs text-slate-700">{context.targetRole}</span>
                  </div>
                )}
                {context.targetCompany && (
                  <div className="flex items-start gap-2">
                    <span className="text-[10px] text-slate-400 font-medium mt-0.5 w-16 flex-shrink-0">COMPANY</span>
                    <span className="text-xs text-slate-700">{context.targetCompany}</span>
                  </div>
                )}
                {context.background && (
                  <div className="flex items-start gap-2">
                    <span className="text-[10px] text-slate-400 font-medium mt-0.5 w-16 flex-shrink-0">RESUME</span>
                    <span className="text-xs text-slate-600 line-clamp-3">{context.background}</span>
                  </div>
                )}
                {context.jobDescription && (
                  <div className="flex items-start gap-2">
                    <span className="text-[10px] text-slate-400 font-medium mt-0.5 w-16 flex-shrink-0">JOB DESC</span>
                    <span className="text-xs text-slate-600 line-clamp-2">{context.jobDescription}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-amber-600 bg-amber-50 rounded-lg p-2.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <p className="text-xs">
                  <strong>No prep info found.</strong> Go to your Prep section and add your target role, company, and background/resume for better results.
                </p>
              </div>
            )}
          </div>

          {/* Most Relevant to Your Interview */}
          {interviewRelevant.length > 0 && (
            <div>
              <h3 className="font-semibold text-slate-700 text-sm mb-2 flex items-center gap-2">
                <Zap className="w-4 h-4 text-purple-500" />
                Most Relevant to Your Interview ({interviewRelevant.length})
              </h3>
              <div className="space-y-2">
                {interviewRelevant.map(q => {
                  const relevant = findRelevantProjects(q, portfolio);
                  const hasAnswer = q.narrative && q.narrative.trim().length > 20;
                  const hasDraft = !!drafts[q.id];
                  return (
                    <button
                      key={q.id}
                      onClick={() => setSelectedQ(q)}
                      className={`w-full text-left bg-white rounded-xl p-4 border-2 ${hasDraft ? 'border-amber-300 bg-amber-50/30' : 'border-purple-200'} hover:border-purple-400 hover:shadow-md transition-all group`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800 leading-snug line-clamp-2">
                            {q.question}
                          </p>
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
                              ⚡ Interview Priority
                            </span>
                            {hasDraft ? (
                              <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                                📝 Draft ready — review
                              </span>
                            ) : hasAnswer ? (
                              <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                ✓ Has answer
                              </span>
                            ) : (
                              <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                                Needs answer
                              </span>
                            )}
                            {relevant.length > 0 && (
                              <span className="text-[10px] text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Briefcase className="w-2.5 h-2.5" />
                                {relevant.length} project match{relevant.length > 1 ? 'es' : ''}
                              </span>
                            )}
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-purple-300 group-hover:text-purple-500 mt-1 flex-shrink-0" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Questions with answers */}
          {answeredQuestions.length > 0 && (
            <div>
              <h3 className="font-semibold text-slate-700 text-sm mb-2 flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500" />
                Other Questions with Answers ({answeredQuestions.length})
              </h3>
              <div className="space-y-2">
                {answeredQuestions.map(q => {
                  const relevant = findRelevantProjects(q, portfolio);
                  const hasDraft = !!drafts[q.id];
                  return (
                    <button
                      key={q.id}
                      onClick={() => setSelectedQ(q)}
                      className={`w-full text-left bg-white rounded-xl p-4 border ${hasDraft ? 'border-amber-300 bg-amber-50/30' : 'border-slate-200'} hover:border-indigo-300 hover:shadow-md transition-all group`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800 leading-snug line-clamp-2">
                            {q.question}
                          </p>
                          <div className="flex items-center gap-3 mt-2 flex-wrap">
                            <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                              {q.category || 'General'}
                            </span>
                            {hasDraft && (
                              <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                                📝 Draft ready
                              </span>
                            )}
                            {relevant.length > 0 && (
                              <span className="text-[10px] font-medium text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Briefcase className="w-2.5 h-2.5" />
                                {relevant.length} project match{relevant.length > 1 ? 'es' : ''}
                              </span>
                            )}
                            <span className="text-[10px] text-slate-400">
                              {(q.narrative || '').split(/\s+/).length} words
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-400 mt-1 flex-shrink-0" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Questions without answers */}
          {unansweredQuestions.length > 0 && (
            <div>
              <h3 className="font-semibold text-slate-700 text-sm mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-slate-400" />
                No Answer Yet ({unansweredQuestions.length})
              </h3>
              <div className="space-y-2">
                {unansweredQuestions.slice(0, 5).map(q => {
                  const relevant = findRelevantProjects(q, portfolio);
                  return (
                    <button
                      key={q.id}
                      onClick={() => setSelectedQ(q)}
                      className="w-full text-left bg-white/60 rounded-xl p-4 border border-dashed border-slate-200 hover:border-indigo-300 hover:bg-white transition-all group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-slate-600 leading-snug line-clamp-2">{q.question}</p>
                          {relevant.length > 0 && (
                            <span className="text-[10px] font-medium text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full mt-1.5 inline-flex items-center gap-1">
                              <Briefcase className="w-2.5 h-2.5" />
                              {relevant.length} project match{relevant.length > 1 ? 'es' : ''} — generate answer
                            </span>
                          )}
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-400 mt-1 flex-shrink-0" />
                      </div>
                    </button>
                  );
                })}
                {unansweredQuestions.length > 5 && (
                  <p className="text-xs text-slate-400 text-center">
                    + {unansweredQuestions.length - 5} more questions
                  </p>
                )}
              </div>
            </div>
          )}

          {answeredQuestions.length === 0 && unansweredQuestions.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">No questions in your bank yet.</p>
              <p className="text-slate-400 text-xs mt-1">Add questions in the Command Center first.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── RENDER: Upgrade View (Side-by-Side) ───────────────────────────────

  const relevantProjects = selectedQ ? findRelevantProjects(selectedQ, portfolio) : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => { setSelectedQ(null); setUpgradedAnswer(''); setUpgradeError(null); }}
            className="p-2 -ml-2 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-slate-800 text-sm truncate">Answer Forge</h1>
            <p className="text-[10px] text-slate-400 truncate">{selectedQ.question}</p>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-4 space-y-4">
        {/* Question */}
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <p className="text-sm font-semibold text-slate-800 leading-snug">{selectedQ.question}</p>
          <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full mt-2 inline-block">
            {selectedQ.category || 'General'}
          </span>
        </div>

        {/* Matched Projects */}
        {relevantProjects.length > 0 && (
          <div className="bg-indigo-50/50 rounded-xl p-3 border border-indigo-100">
            <p className="text-[10px] font-semibold text-indigo-600 uppercase tracking-wide mb-2">
              Portfolio matches → will be used as proof
            </p>
            <div className="space-y-1">
              {relevantProjects.map((p, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-indigo-700">
                  <Briefcase className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{p.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Current Answer */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-slate-400"></div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Current Answer</h3>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            {selectedQ.narrative ? (
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                {selectedQ.narrative}
              </p>
            ) : (
              <p className="text-sm text-slate-400 italic">No answer yet. The AI will generate one from your portfolio.</p>
            )}
            {selectedQ.bullets?.length > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-100">
                <p className="text-[10px] font-semibold text-slate-400 uppercase mb-1">Current Prompter Bullets</p>
                <ul className="space-y-0.5">
                  {selectedQ.bullets.map((b, i) => (
                    <li key={i} className="text-xs text-slate-500 flex items-start gap-1.5">
                      <span className="text-slate-300 mt-0.5">•</span>{b}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Upgrade Button */}
        {!upgradedAnswer && !isUpgrading && (
          <button
            onClick={() => upgradeAnswer(selectedQ)}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl py-3.5 font-semibold text-sm flex items-center justify-center gap-2 hover:shadow-lg transition-all active:scale-[0.98]"
          >
            <Sparkles className="w-4 h-4" />
            {selectedQ.narrative ? 'Upgrade with Portfolio Proof' : 'Generate Answer from Portfolio'}
          </button>
        )}

        {/* Loading */}
        {isUpgrading && (
          <div className="bg-indigo-50 rounded-xl p-6 text-center">
            <Loader2 className="w-6 h-6 text-indigo-500 animate-spin mx-auto mb-2" />
            <p className="text-sm text-indigo-600 font-medium">
              {selectedQ.narrative ? 'Upgrading your answer...' : 'Generating answer from portfolio...'}
            </p>
            <p className="text-xs text-indigo-400 mt-1">
              Cross-referencing {relevantProjects.length} project{relevantProjects.length !== 1 ? 's' : ''} + your background
            </p>
          </div>
        )}

        {/* Error */}
        {upgradeError && (
          <div className="bg-red-50 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-red-700">{upgradeError}</p>
              <button
                onClick={() => upgradeAnswer(selectedQ)}
                className="text-xs text-red-500 font-medium mt-1 underline"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {/* Upgraded Answer */}
        {upgradedAnswer && (
          <>
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <h3 className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">
                    {selectedQ.narrative ? 'Upgraded Answer' : 'Generated Answer'}
                  </h3>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      if (isEditing) {
                        setIsEditing(false);
                      } else {
                        setEditText(upgradedAnswer);
                        setIsEditing(true);
                      }
                    }}
                    className="text-xs text-indigo-500 font-medium flex items-center gap-1 hover:text-indigo-700"
                  >
                    <Edit2 className="w-3 h-3" />
                    {isEditing ? 'Preview' : 'Edit'}
                  </button>
                  <button
                    onClick={copyAnswer}
                    className="text-xs text-slate-400 font-medium flex items-center gap-1 hover:text-slate-600"
                  >
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>

              <div className="bg-emerald-50/50 rounded-xl p-4 border border-emerald-200">
                {isEditing ? (
                  <textarea
                    value={editText}
                    onChange={e => setEditText(e.target.value)}
                    className="w-full text-sm text-slate-700 leading-relaxed bg-white rounded-lg p-3 border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-300 min-h-[200px] resize-y"
                    placeholder="Edit your upgraded answer..."
                  />
                ) : (
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {upgradedAnswer}
                  </p>
                )}
              </div>
            </div>

            {/* Updated Bullets */}
            {upgradedBullets.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-3.5 h-3.5 text-indigo-500" />
                  <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                    New Prompter Bullets
                  </h3>
                </div>
                <div className="bg-white rounded-xl p-4 border border-indigo-100">
                  <ul className="space-y-1.5">
                    {upgradedBullets.map((b, i) => (
                      <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                        <span className="text-indigo-400 font-bold mt-0.5">•</span>{b}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Updated Keywords */}
            {upgradedKeywords.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                    Prompter Detection Keywords
                  </h3>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {upgradedKeywords.map((k, i) => (
                    <span key={i} className="text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded-full border border-amber-200">
                      {k}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Follow-Up Ammo */}
            {upgradedFollowUps.length > 0 && (
              <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl p-4 border border-violet-200">
                <div className="flex items-center gap-2 mb-3">
                  <MessageSquare className="w-3.5 h-3.5 text-violet-500" />
                  <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                    Likely Follow-Ups — Your Ammo
                  </h3>
                </div>
                <div className="space-y-3">
                  {upgradedFollowUps.map((fu, i) => (
                    <div key={i} className="bg-white/80 rounded-lg p-3 border border-violet-100">
                      <p className="text-sm font-semibold text-violet-800 mb-1">
                        "{fu.question}"
                      </p>
                      <p className="text-xs text-slate-500">
                        <span className="font-medium text-slate-600">→ Use:</span> {fu.proof}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Regenerate */}
            <button
              onClick={() => upgradeAnswer(selectedQ)}
              className="w-full text-center text-xs text-slate-400 font-medium py-2 flex items-center justify-center gap-1.5 hover:text-indigo-500"
            >
              <RefreshCw className="w-3 h-3" /> Regenerate
            </button>

            {/* Save */}
            <button
              onClick={saveUpgrade}
              disabled={isSaving}
              className={`w-full rounded-xl py-3.5 font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
                saveSuccess
                  ? 'bg-emerald-500 text-white'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:shadow-lg'
              }`}
            >
              {isSaving ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
              ) : saveSuccess ? (
                <><Check className="w-4 h-4" /> Saved! Prompter Updated ✨</>
              ) : (
                <><Save className="w-4 h-4" /> Save Answer + Update Prompter</>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default AnswerForge;
