/**
 * Portfolio.jsx — Work History & Confidence Builder
 *
 * Helps users upload past work projects, get AI analysis with rewritten
 * resume bullets, walk through their work interactively, match projects
 * to job descriptions, and generate pre-interview refresh briefings.
 *
 * D.R.A.F.T. protocol: NEW file. No existing code modified.
 *
 * Patterns reused:
 *   StoryBank — localStorage persistence, card list UI, skill tags
 *   JDDecoder — AI analysis via confidence-brief, JSON parsing
 *   InterviewCoach — Multi-turn chat for Walk Through mode
 *
 * Battle Scars enforced:
 *   #3  — fetchWithRetry (3 attempts, backoff)
 *   #8  — Charge AFTER success, never before
 *   #1  — Self-contained component, minimal App.jsx touch
 *
 * Props:
 *   onBack — return to home view
 *   getUserContext — function returning user interview context
 *   questions — array of question objects (for matching)
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  ArrowLeft, Plus, Edit2, Trash2, Sparkles, Briefcase, Target,
  Loader2, CheckCircle, MessageSquare, Send, ChevronRight, Clock,
  AlertCircle, BookOpen, Star, Copy, Check, Zap, FileText, RefreshCw
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { fetchWithRetry } from '../../utils/fetchWithRetry';
import { incrementUsage } from '../../utils/creditSystem';
import {
  buildPortfolioAnalysisPrompt,
  buildPortfolioWalkThroughPrompt,
  buildQuickRefreshPrompt,
  buildJDMatchPrompt,
} from '../../utils/portfolioPrompts';
import PortfolioIntake from './PortfolioIntake';
import NextStepSuggestion from './NextStepSuggestion';
import AnswerForge from './AnswerForge';
import { fetchPortfolioFromCloud, upsertPortfolioProject, deletePortfolioProject as deleteFromCloud } from '../../utils/portfolioSupabase';
import { findQuestionsForProject } from '../../utils/portfolioMatching';

// ─── localStorage persistence (StoryBank pattern) ────────────────────────────

// One-time migration: tag untagged academic projects
const UNTAGGED_COURSEWORK = new Set([
  'community engagement plan',
  'inclusive leadership plan',
  'stakeholder engagement framework',
  'swot analysis',
  'incident command system scenario',
  'after action report',
  'natural climate solution and mitigation',
  'emergency management and public administration',
  '1-page climate change questionnaire',
  'covid-19',
  'puerto rico - critical infrastructure',
  'case study - puerto rico',
  'capstone',
]);

function loadPortfolio() {
  try {
    const raw = localStorage.getItem('isl_portfolio');
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      localStorage.setItem('isl_portfolio_backup', raw);
      return [];
    }

    // One-time fix: tag academic projects that are missing the MSEM label
    const migrated = localStorage.getItem('isl_portfolio_coursework_tagged');
    if (!migrated) {
      let changed = false;
      parsed.forEach(p => {
        const titleLower = (p.title || '').toLowerCase().trim();
        const roleLower = (p.role || '').toLowerCase();
        if (UNTAGGED_COURSEWORK.has(titleLower) && !roleLower.includes('msem') && !roleLower.includes('student') && !roleLower.includes('candidate') && !roleLower.includes('coursework')) {
          p.role = 'MSEM Coursework';
          changed = true;
        }
      });
      if (changed) {
        localStorage.setItem('isl_portfolio', JSON.stringify(parsed));
        localStorage.setItem('isl_portfolio_coursework_tagged', '1');
      }
    }

    return parsed;
  } catch {
    const raw = localStorage.getItem('isl_portfolio');
    if (raw) localStorage.setItem('isl_portfolio_backup', raw);
    return [];
  }
}

function savePortfolio(items) {
  try { localStorage.setItem('isl_portfolio', JSON.stringify(items)); } catch {}
}

// Try to find the most recent JD Decoder cached result
function getLatestJDResult() {
  try {
    const keys = Object.keys(localStorage).filter(k => k.startsWith('jd_decoder_'));
    if (keys.length === 0) return null;
    // Get most recent by checking timestamps
    let latest = null;
    let latestTime = 0;
    for (const key of keys) {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      const time = parsed.timestamp || 0;
      if (time > latestTime) {
        latestTime = time;
        latest = parsed.data;
      }
    }
    return latest;
  } catch {
    return null;
  }
}

// ─── Supabase URL ────────────────────────────────────────────────────────────

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://tzrlpwtkrtvjpdhcaayu.supabase.co';

// ─── Component ───────────────────────────────────────────────────────────────

function Portfolio({ onBack, getUserContext, questions = [], onNavigate }) {
  // Core state
  const [projects, setProjects] = useState(loadPortfolio);
  const [initialized, setInitialized] = useState(false);
  const [view, setView] = useState('list'); // list | add | detail | walkthrough | refresh | jdmatch | forge
  const [selectedProject, setSelectedProject] = useState(null);

  // Form state
  const [form, setForm] = useState({ title: '', role: '', timeframe: '', rawContent: '' });
  const [editingId, setEditingId] = useState(null);

  // AI state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzingProjectId, setAnalyzingProjectId] = useState(null); // track which project
  const [analysisError, setAnalysisError] = useState(null);

  // Toast notification state
  const [toast, setToast] = useState(null); // { message, projectId, type }
  const toastTimeoutRef = useRef(null);

  // Walk-through chat state
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatError, setChatError] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Quick Refresh state
  const [refreshData, setRefreshData] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState(null);

  // JD Match state
  const [jdMatchData, setJdMatchData] = useState(null);
  const [isMatching, setIsMatching] = useState(false);
  const [matchError, setMatchError] = useState(null);

  // Copy button state
  const [copiedIdx, setCopiedIdx] = useState(null);

  // Persist projects (skip first render — StoryBank pattern)
  useEffect(() => {
    if (initialized) savePortfolio(projects);
    else setInitialized(true);
  }, [projects, initialized]);

  // Cloud sync: bi-directional merge on mount
  // 1. Fetch cloud projects
  // 2. Merge cloud-only and newer-cloud into local
  // 3. Push any local-only or newer-local projects UP to cloud
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || cancelled) return;

        const { data: cloudProjects, fromSupabase } = await fetchPortfolioFromCloud(user.id);
        const cloudList = (fromSupabase && cloudProjects) ? cloudProjects : [];
        const cloudMap = {};
        cloudList.forEach(p => { cloudMap[p.id] = p; });

        // Read current local projects
        const localProjects = loadPortfolio();
        const localMap = {};
        localProjects.forEach(p => { localMap[p.id] = p; });

        if (cancelled) return;

        // --- Merge into local state ---
        const merged = [...localProjects];
        for (const cp of cloudList) {
          const local = localMap[cp.id];
          if (!local) {
            merged.push(cp); // cloud-only → add locally
          } else if (cp.updatedAt && local.updatedAt && new Date(cp.updatedAt) > new Date(local.updatedAt)) {
            const idx = merged.findIndex(p => p.id === cp.id);
            if (idx !== -1) merged[idx] = cp; // cloud is newer → replace local
          }
        }
        setProjects(merged);

        // --- Push local-only or newer-local projects UP to cloud ---
        const toUpload = [];
        for (const lp of merged) {
          const cloud = cloudMap[lp.id];
          if (!cloud) {
            toUpload.push(lp); // local-only → push to cloud
          } else if (lp.updatedAt && cloud.updatedAt && new Date(lp.updatedAt) > new Date(cloud.updatedAt)) {
            toUpload.push(lp); // local is newer → push to cloud
          }
        }
        if (toUpload.length > 0 && !cancelled) {
          console.log(`☁️ Uploading ${toUpload.length} local portfolio project(s) to cloud...`);
          const { syncPortfolioToCloud } = await import('../../utils/portfolioSupabase');
          const result = await syncPortfolioToCloud(user.id, toUpload);
          if (result.success) {
            console.log(`☁️ Portfolio cloud sync complete — ${result.synced} project(s) uploaded`);
          }
        }
      } catch (err) {
        console.warn('⚠️ Portfolio cloud sync on mount failed:', err.message);
      }
    })();
    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isChatLoading]);

  // ─── Helpers ─────────────────────────────────────────────────────────────

  const resetForm = () => {
    setForm({ title: '', role: '', timeframe: '', rawContent: '' });
    setEditingId(null);
    setAnalysisError(null);
  };

  const getContext = useCallback(() => {
    return getUserContext ? getUserContext() : {};
  }, [getUserContext]);

  const getAuthSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');
    return session;
  };

  const callAI = async (systemPrompt, userMessage) => {
    const session = await getAuthSession();
    const response = await fetchWithRetry(`${SUPABASE_URL}/functions/v1/ai-feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ mode: 'portfolio-analysis', systemPrompt, userMessage }),
    });
    if (!response.ok) throw new Error(`AI request failed: ${response.status}`);
    const data = await response.json();
    if (data.type === 'error' && data.error) {
      throw new Error(data.error.type === 'overloaded_error'
        ? 'AI service is temporarily busy. Please try again.'
        : `AI error: ${data.error.message}`);
    }
    return data.content?.[0]?.text || data.response || '';
  };

  const parseJSON = (text) => {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('Could not parse AI response. Please try again.');
    return JSON.parse(match[0]);
  };

  const chargeCredit = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) await incrementUsage(supabase, user.id, 'answer_assistant');
    } catch (e) { console.warn('Usage tracking failed:', e); }
  };

  const copyToClipboard = (text, idx) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 2000);
    }).catch(() => {});
  };

  // ─── CRUD ────────────────────────────────────────────────────────────────

  // Background cloud upsert — fire-and-forget, localStorage is source of truth
  const syncProjectToCloud = useCallback(async (project) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) await upsertPortfolioProject(user.id, project);
    } catch (err) {
      console.warn('⚠️ Portfolio cloud upsert failed:', err.message);
    }
  }, []);

  const handleSaveDraft = () => {
    if (!form.title.trim()) return;
    const now = new Date().toISOString();
    let savedProject;
    if (editingId) {
      setProjects(prev => prev.map(p => {
        if (p.id !== editingId) return p;
        savedProject = { ...p, ...form, updatedAt: now };
        return savedProject;
      }));
    } else {
      savedProject = {
        id: `portfolio_${Date.now()}`,
        ...form,
        aiSummary: '', keySkills: [], interviewAngles: [], starStory: '',
        questionsThisAnswers: [], rewrittenBullets: [], walkThroughNotes: '',
        isAnalyzed: false, createdAt: now, updatedAt: now,
      };
      setProjects(prev => [savedProject, ...prev]);
    }
    // Cloud sync in background
    if (savedProject) syncProjectToCloud(savedProject);
    resetForm();
    setView('list');
  };

  const handleDelete = (id) => {
    if (!window.confirm('Delete this project? This cannot be undone.')) return;
    setProjects(prev => prev.filter(p => p.id !== id));
    if (selectedProject?.id === id) {
      setSelectedProject(null);
      setView('list');
    }
    // Cloud delete in background
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) await deleteFromCloud(user.id, id);
      } catch (err) {
        console.warn('⚠️ Portfolio cloud delete failed:', err.message);
      }
    })();
  };

  const handleEdit = (project) => {
    setForm({
      title: project.title,
      role: project.role,
      timeframe: project.timeframe,
      rawContent: project.rawContent,
    });
    setEditingId(project.id);
    setView('add');
  };

  // ─── AI Analysis (JDDecoder pattern) ─────────────────────────────────────

  const showToast = useCallback((message, projectId, type = 'success') => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast({ message, projectId, type });
    toastTimeoutRef.current = setTimeout(() => setToast(null), 8000);
  }, []);

  const analyzeProject = useCallback(async (project, { background = false } = {}) => {
    setIsAnalyzing(true);
    setAnalyzingProjectId(project.id);
    setAnalysisError(null);
    try {
      const context = getContext();
      const systemPrompt = buildPortfolioAnalysisPrompt(context);
      const userMessage = `Analyze this project:\n\nTitle: ${project.title}\nRole: ${project.role || 'Not specified'}\nTimeframe: ${project.timeframe || 'Not specified'}\nContent: ${project.rawContent.slice(0, 15000)}`;

      const aiText = await callAI(systemPrompt, userMessage);
      const parsed = parseJSON(aiText);

      const updated = {
        ...project,
        aiSummary: parsed.summary || '',
        keySkills: parsed.keySkills || [],
        interviewAngles: parsed.interviewAngles || [],
        starStory: parsed.starStory ? (typeof parsed.starStory === 'string' ? parsed.starStory : JSON.stringify(parsed.starStory)) : '',
        questionsThisAnswers: parsed.questionsThisAnswers || [],
        rewrittenBullets: parsed.rewrittenBullets || [],
        isAnalyzed: true,
        updatedAt: new Date().toISOString(),
      };

      setProjects(prev => prev.map(p => p.id === project.id ? updated : p));

      // Cloud sync analyzed project in background
      syncProjectToCloud(updated);

      if (background) {
        // Show toast — user can tap to view results
        showToast(`✨ "${project.title}" analysis complete!`, project.id);
      } else {
        setSelectedProject(updated);
        setView('detail');
      }

      // CHARGE AFTER SUCCESS (Battle Scar #8)
      await chargeCredit();
    } catch (err) {
      console.error('Portfolio analysis error:', err);
      setAnalysisError(err.message || 'Analysis failed. Please try again.');
      if (background) {
        showToast(`Analysis failed for "${project.title}". Tap to retry.`, project.id, 'error');
      }
    } finally {
      setIsAnalyzing(false);
      setAnalyzingProjectId(null);
    }
  }, [getContext, showToast, syncProjectToCloud]);

  const handleSaveAndAnalyze = async () => {
    if (!form.title.trim() || form.rawContent.trim().length < 50) return;
    const now = new Date().toISOString();
    let project;
    if (editingId) {
      project = { ...projects.find(p => p.id === editingId), ...form, updatedAt: now };
      setProjects(prev => prev.map(p => p.id === editingId ? project : p));
    } else {
      project = {
        id: `portfolio_${Date.now()}`, ...form,
        aiSummary: '', keySkills: [], interviewAngles: [], starStory: '',
        questionsThisAnswers: [], rewrittenBullets: [], walkThroughNotes: '',
        isAnalyzed: false, createdAt: now, updatedAt: now,
      };
      setProjects(prev => [project, ...prev]);
    }
    resetForm();
    await analyzeProject(project);
  };

  // ─── Walk Through (InterviewCoach pattern) ───────────────────────────────

  const startWalkThrough = (project) => {
    setSelectedProject(project);
    setChatMessages([]);
    setChatInput('');
    setChatError(null);
    setView('walkthrough');
  };

  const sendWalkThroughMessage = useCallback(async (overrideMessage) => {
    const userMessage = (overrideMessage || chatInput).trim();
    if (!userMessage || isChatLoading) return;

    if (!overrideMessage) setChatInput('');
    setChatError(null);
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage, timestamp: new Date() }]);
    setIsChatLoading(true);

    try {
      const context = getContext();
      const systemPrompt = buildPortfolioWalkThroughPrompt(selectedProject, context);

      // Multi-turn: embed conversation history (InterviewCoach pattern)
      let payload = userMessage;
      if (chatMessages.length > 0) {
        const historyLines = chatMessages.map(m =>
          `${m.role === 'user' ? 'User' : 'Coach'}: ${m.content}`
        );
        payload = `CONVERSATION SO FAR:\n${historyLines.join('\n\n')}\n\nLATEST MESSAGE FROM USER:\n${userMessage}`;
      }

      const aiContent = await callAI(systemPrompt, payload);
      setChatMessages(prev => [...prev, { role: 'assistant', content: aiContent, timestamp: new Date() }]);

      // Charge on first exchange only (Battle Scar #8)
      if (chatMessages.length === 0) await chargeCredit();
    } catch (err) {
      console.error('Walk-through error:', err);
      setChatError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsChatLoading(false);
    }
  }, [chatInput, isChatLoading, chatMessages, selectedProject, getContext]);

  const saveWalkThroughNotes = () => {
    if (!selectedProject || chatMessages.length === 0) return;
    const notes = chatMessages
      .filter(m => m.role === 'assistant')
      .map(m => m.content)
      .join('\n\n---\n\n');
    const updated = {
      ...selectedProject,
      walkThroughNotes: notes,
      updatedAt: new Date().toISOString(),
    };
    setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
    setSelectedProject(updated);
  };

  // ─── Quick Refresh ───────────────────────────────────────────────────────

  const generateRefresh = useCallback(async () => {
    if (projects.length === 0) return;
    setIsRefreshing(true);
    setRefreshError(null);
    try {
      const context = getContext();
      const systemPrompt = buildQuickRefreshPrompt(projects, context);
      const userMessage = 'Generate my pre-interview refresh briefing.';

      const aiText = await callAI(systemPrompt, userMessage);
      const parsed = parseJSON(aiText);
      setRefreshData(parsed);
      setView('refresh');
      await chargeCredit();
    } catch (err) {
      console.error('Quick refresh error:', err);
      setRefreshError(err.message || 'Refresh failed. Please try again.');
    } finally {
      setIsRefreshing(false);
    }
  }, [projects, getContext]);

  // ─── JD Match ────────────────────────────────────────────────────────────

  const matchToJD = useCallback(async () => {
    const jdResult = getLatestJDResult();
    if (!jdResult || projects.length === 0) return;
    setIsMatching(true);
    setMatchError(null);
    try {
      const context = getContext();
      const systemPrompt = buildJDMatchPrompt(projects, jdResult, context);
      const userMessage = 'Match my portfolio to this job description.';

      const aiText = await callAI(systemPrompt, userMessage);
      const parsed = parseJSON(aiText);
      setJdMatchData(parsed);
      setView('jdmatch');
      await chargeCredit();
    } catch (err) {
      console.error('JD match error:', err);
      setMatchError(err.message || 'Match failed. Please try again.');
    } finally {
      setIsMatching(false);
    }
  }, [projects, getContext]);

  const hasJDDecoded = getLatestJDResult() !== null;

  // ─── RENDER ──────────────────────────────────────────────────────────────

  // ── List Screen ──────────────────────────────────────────────────────────
  if (view === 'list') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200/60 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-slate-800">Portfolio</h2>
            <p className="text-xs text-slate-500">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
          </div>
          <button
            onClick={() => { resetForm(); setView('add'); }}
            className="p-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        <div className="px-4 py-4 space-y-4 max-w-2xl mx-auto">
          {/* Action buttons (only when projects exist) */}
          {projects.length > 0 && (
            <div className="flex gap-2">
              <button
                onClick={generateRefresh}
                disabled={isRefreshing}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold text-sm shadow-sm hover:shadow-md transition-all disabled:opacity-50"
              >
                {isRefreshing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                Quick Refresh
              </button>
              {hasJDDecoded && (
                <button
                  onClick={matchToJD}
                  disabled={isMatching}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-xl font-semibold text-sm shadow-sm hover:shadow-md transition-all disabled:opacity-50"
                >
                  {isMatching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Target className="w-4 h-4" />}
                  Match to JD
                </button>
              )}
            </div>
          )}

          {/* Answer Forge — upgrade answers with portfolio */}
          {projects.some(p => p.isAnalyzed) && questions.length > 0 && (
            <button
              onClick={() => setView('forge')}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold text-sm shadow-sm hover:shadow-lg transition-all"
            >
              <Sparkles className="w-4 h-4" />
              Answer Forge — Upgrade Answers with Portfolio Proof
            </button>
          )}

          {refreshError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{refreshError}</p>
            </div>
          )}
          {matchError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{matchError}</p>
            </div>
          )}

          {/* Empty state */}
          {projects.length === 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center mt-8">
              <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Briefcase className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Build Your Portfolio</h3>
              <p className="text-sm text-gray-500 mb-1 max-w-md mx-auto">
                Your past work tells a powerful story. Add your projects and let AI help
                you articulate what you accomplished.
              </p>
              <p className="text-xs text-gray-400 mb-5">
                Reading your own work is the fastest way to beat imposter syndrome.
              </p>
              <button
                onClick={() => { resetForm(); setView('add'); }}
                className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all active:scale-[0.97]"
              >
                <Plus className="w-4 h-4 inline mr-1.5" />
                Add Your First Project
              </button>
            </div>
          )}

          {/* Project cards */}
          {projects.map(project => (
            <div
              key={project.id}
              className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden"
            >
              <button
                onClick={() => { setSelectedProject(project); setView('detail'); }}
                className="w-full text-left p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-800 truncate">{project.title}</h3>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                      {project.role && <span>{project.role}</span>}
                      {project.role && project.timeframe && <span>·</span>}
                      {project.timeframe && (
                        <span className="flex items-center gap-0.5">
                          <Clock className="w-3 h-3" /> {project.timeframe}
                        </span>
                      )}
                    </div>
                  </div>
                  {analyzingProjectId === project.id ? (
                    <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full text-xs font-medium flex items-center gap-1 animate-pulse">
                      <Loader2 className="w-3 h-3 animate-spin" /> Analyzing...
                    </span>
                  ) : project.isAnalyzed ? (
                    <span className="px-2 py-0.5 bg-green-50 text-green-600 rounded-full text-xs font-medium flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Analyzed
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full text-xs font-medium">Draft</span>
                  )}
                </div>
                {project.keySkills?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {project.keySkills.slice(0, 5).map((skill, i) => (
                      <span key={i} className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full text-[11px] font-medium">{skill}</span>
                    ))}
                    {project.keySkills.length > 5 && (
                      <span className="px-2 py-0.5 bg-slate-50 text-slate-400 rounded-full text-[11px]">+{project.keySkills.length - 5}</span>
                    )}
                  </div>
                )}
              </button>
              <div className="flex border-t border-slate-100">
                <button
                  onClick={() => handleEdit(project)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs text-slate-500 hover:bg-slate-50 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Edit
                </button>
                <div className="w-px bg-slate-100" />
                <button
                  onClick={() => handleDelete(project.id)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs text-red-500 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Toast notification — slides up from bottom */}
        {toast && (
          <div className="fixed bottom-6 left-4 right-4 z-50 flex justify-center">
            <button
              onClick={() => {
                if (toast.projectId) {
                  const project = projects.find(p => p.id === toast.projectId);
                  if (project?.isAnalyzed) {
                    setSelectedProject(project);
                    setView('detail');
                  }
                }
                setToast(null);
              }}
              style={{ animation: 'pageEnter 0.3s ease-out' }}
              className={`max-w-md w-full px-4 py-3 rounded-2xl shadow-lg border flex items-center gap-3 transition-all ${
                toast.type === 'error'
                  ? 'bg-red-50 border-red-200 text-red-800'
                  : 'bg-white border-indigo-200 text-slate-800'
              }`}
            >
              {toast.type === 'error' ? (
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              ) : (
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              )}
              <span className="text-sm font-medium flex-1 text-left">{toast.message}</span>
              {toast.type !== 'error' && (
                <span className="text-xs text-indigo-500 font-semibold flex-shrink-0">View →</span>
              )}
            </button>
          </div>
        )}
      </div>
    );
  }

  // ── Add/Edit Screen (Guided Intake) ─────────────────────────────────────
  if (view === 'add') {
    return (
      <PortfolioIntake
        editingProject={editingId ? projects.find(p => p.id === editingId) : null}
        onSave={(projectData) => {
          const now = new Date().toISOString();
          if (editingId) {
            setProjects(prev => prev.map(p => p.id === editingId
              ? { ...p, ...projectData, updatedAt: now }
              : p
            ));
          } else {
            const newProject = {
              id: `portfolio_${Date.now()}`,
              ...projectData,
              aiSummary: '', keySkills: [], interviewAngles: [], starStory: '',
              questionsThisAnswers: [], rewrittenBullets: [], walkThroughNotes: '',
              isAnalyzed: false, createdAt: now, updatedAt: now,
            };
            setProjects(prev => [newProject, ...prev]);
          }
          resetForm();
          setView('list');
        }}
        onSaveAndAnalyze={async (projectData) => {
          const now = new Date().toISOString();
          let project;
          if (editingId) {
            project = { ...projects.find(p => p.id === editingId), ...projectData, updatedAt: now };
            setProjects(prev => prev.map(p => p.id === editingId ? project : p));
          } else {
            project = {
              id: `portfolio_${Date.now()}`, ...projectData,
              aiSummary: '', keySkills: [], interviewAngles: [], starStory: '',
              questionsThisAnswers: [], rewrittenBullets: [], walkThroughNotes: '',
              isAnalyzed: false, createdAt: now, updatedAt: now,
            };
            setProjects(prev => [project, ...prev]);
          }
          resetForm();
          // Go to list immediately — analysis runs in background
          setView('list');
          analyzeProject(project, { background: true });
        }}
        onCancel={() => { resetForm(); setView('list'); }}
        getUserContext={getUserContext}
      />
    );
  }

  // ── Detail Screen ────────────────────────────────────────────────────────
  if (view === 'detail' && selectedProject) {
    let starStory = null;
    if (selectedProject.starStory) {
      try {
        starStory = typeof selectedProject.starStory === 'string'
          ? JSON.parse(selectedProject.starStory)
          : selectedProject.starStory;
      } catch { starStory = null; }
    }

    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200/60 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
          <button onClick={() => setView('list')} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-slate-800 truncate">{selectedProject.title}</h2>
            <p className="text-xs text-slate-500">
              {[selectedProject.role, selectedProject.timeframe].filter(Boolean).join(' · ')}
            </p>
          </div>
          {!selectedProject.isAnalyzed && (
            <button
              onClick={() => analyzeProject(selectedProject)}
              disabled={isAnalyzing}
              className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-semibold hover:bg-indigo-100 transition-colors disabled:opacity-50"
            >
              {isAnalyzing ? <Loader2 className="w-3 h-3 animate-spin inline mr-1" /> : <Sparkles className="w-3 h-3 inline mr-1" />}
              Analyze
            </button>
          )}
        </div>

        <div className="px-4 py-4 max-w-2xl mx-auto space-y-4">
          {analysisError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-red-700">{analysisError}</p>
                <button onClick={() => analyzeProject(selectedProject)} className="text-xs text-red-500 hover:text-red-700 mt-1 underline">Try again</button>
              </div>
            </div>
          )}

          {isAnalyzing && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto mb-3" />
              <p className="text-sm text-slate-600 font-medium">Analyzing your project...</p>
              <p className="text-xs text-slate-400 mt-1">This takes about 10 seconds</p>
            </div>
          )}

          {selectedProject.isAnalyzed && !isAnalyzing && (
            <>
              {/* Hero Summary Card */}
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-5 text-white shadow-lg">
                <div className="flex items-center gap-2 mb-3 opacity-80">
                  <Star className="w-4 h-4" />
                  <span className="text-xs font-semibold uppercase tracking-wider">AI Analysis</span>
                </div>
                <p className="text-sm leading-relaxed font-medium">{selectedProject.aiSummary}</p>

                {/* Quick stats row */}
                <div className="flex gap-3 mt-4 pt-3 border-t border-white/20">
                  {selectedProject.keySkills?.length > 0 && (
                    <div className="flex items-center gap-1.5 text-xs opacity-80">
                      <Zap className="w-3 h-3" />
                      <span>{selectedProject.keySkills.length} skills</span>
                    </div>
                  )}
                  {selectedProject.interviewAngles?.length > 0 && (
                    <div className="flex items-center gap-1.5 text-xs opacity-80">
                      <Target className="w-3 h-3" />
                      <span>{selectedProject.interviewAngles.length} talking points</span>
                    </div>
                  )}
                  {selectedProject.questionsThisAnswers?.length > 0 && (
                    <div className="flex items-center gap-1.5 text-xs opacity-80">
                      <MessageSquare className="w-3 h-3" />
                      <span>{selectedProject.questionsThisAnswers.length} questions answered</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Key Skills */}
              {selectedProject.keySkills?.length > 0 && (
                <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
                  <h3 className="font-bold text-slate-800 mb-3 text-sm">Skills Demonstrated</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedProject.keySkills.map((skill, i) => (
                      <span key={i} className="px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-medium">{skill}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Interview Talking Points */}
              {selectedProject.interviewAngles?.length > 0 && (
                <div className="bg-white rounded-xl p-5 shadow-sm border border-teal-100">
                  <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2 text-sm">
                    <Target className="w-4 h-4 text-teal-600" /> How to Use This in Interviews
                  </h3>
                  <div className="space-y-3">
                    {selectedProject.interviewAngles.map((angle, i) => (
                      <div key={i} className="flex gap-3 p-3 bg-teal-50/50 rounded-lg border border-teal-100">
                        <span className="w-6 h-6 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</span>
                        <span className="text-sm text-slate-700 leading-relaxed">{angle}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STAR Story */}
              {starStory && (
                <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
                  <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2 text-sm">
                    <BookOpen className="w-4 h-4 text-amber-500" /> Ready-to-Use STAR Story
                  </h3>
                  <div className="space-y-2">
                    {[
                      { key: 'situation', label: 'S', full: 'Situation', color: 'bg-blue-500' },
                      { key: 'task', label: 'T', full: 'Task', color: 'bg-amber-500' },
                      { key: 'action', label: 'A', full: 'Action', color: 'bg-green-500' },
                      { key: 'result', label: 'R', full: 'Result', color: 'bg-purple-500' },
                    ].map(({ key, label, full, color }) => starStory[key] && (
                      <div key={key} className="flex gap-3 items-start">
                        <div className={`w-7 h-7 ${color} text-white rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5`}>{label}</div>
                        <div className="flex-1">
                          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{full}</p>
                          <p className="text-sm text-slate-700 leading-relaxed mt-0.5">{starStory[key]}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Questions This Answers — with Practice links */}
              {selectedProject.questionsThisAnswers?.length > 0 && (() => {
                const matchedQuestions = findQuestionsForProject(selectedProject, questions);
                const matchedIds = new Set(matchedQuestions.map(m => m.questionId));
                return (
                  <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
                    <h3 className="font-bold text-slate-800 mb-3 text-sm">Interview Questions This Answers</h3>
                    <div className="space-y-2">
                      {selectedProject.questionsThisAnswers.map((q, i) => (
                        <div key={i} className="flex items-start gap-2 p-2.5 bg-slate-50 rounded-lg">
                          <span className="text-indigo-400 text-xs mt-0.5">Q{i + 1}</span>
                          <p className="text-sm text-slate-700 leading-relaxed flex-1">{q}</p>
                        </div>
                      ))}
                    </div>
                    {matchedQuestions.length > 0 && onNavigate && (
                      <div className="mt-3 pt-3 border-t border-slate-100">
                        <p className="text-xs text-slate-500 mb-2">Matching questions in your question bank:</p>
                        <div className="space-y-1.5">
                          {matchedQuestions.slice(0, 5).map(m => (
                            <button
                              key={m.questionId}
                              onClick={() => onNavigate('practice', { questionId: m.questionId })}
                              onTouchEnd={() => onNavigate('practice', { questionId: m.questionId })}
                              className="w-full text-left flex items-center gap-2 p-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 transition-colors group"
                            >
                              <Target className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                              <span className="text-xs text-indigo-700 flex-1 line-clamp-1">{m.questionText}</span>
                              <span className="text-[10px] text-indigo-400 font-medium group-hover:text-indigo-600">Practice →</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Rewritten Resume Bullets */}
              {selectedProject.rewrittenBullets?.length > 0 && (
                <div className="bg-white rounded-xl p-5 shadow-sm border border-indigo-100">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
                      <FileText className="w-4 h-4 text-indigo-500" /> Polished Resume Bullets
                    </h3>
                    <button
                      onClick={() => copyToClipboard(selectedProject.rewrittenBullets.map(b => `• ${b}`).join('\n'), 'all')}
                      className="text-xs text-indigo-500 font-semibold hover:text-indigo-700 flex items-center gap-1"
                    >
                      {copiedIdx === 'all' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {copiedIdx === 'all' ? 'Copied!' : 'Copy All'}
                    </button>
                  </div>
                  <div className="space-y-2">
                    {selectedProject.rewrittenBullets.map((bullet, i) => (
                      <button
                        key={i}
                        onClick={() => copyToClipboard(bullet, i)}
                        className="w-full text-left flex items-start gap-2 p-3 bg-slate-50 hover:bg-indigo-50 rounded-lg border border-slate-200 hover:border-indigo-200 transition-all group"
                      >
                        <span className="text-sm text-slate-700 flex-1 leading-relaxed">• {bullet}</span>
                        <span className="flex-shrink-0 mt-0.5">
                          {copiedIdx === i
                            ? <Check className="w-4 h-4 text-green-500" />
                            : <Copy className="w-4 h-4 text-slate-300 group-hover:text-indigo-400" />
                          }
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Walk Through CTA */}
              <button
                onClick={() => startWalkThrough(selectedProject)}
                className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-bold text-base shadow-lg hover:shadow-xl transition-all active:scale-[0.98]"
              >
                <MessageSquare className="w-5 h-5 inline mr-2" />
                Walk Through This Project
              </button>

              {/* Re-analyze */}
              <button
                onClick={() => analyzeProject(selectedProject)}
                disabled={isAnalyzing}
                className="w-full py-2.5 text-sm text-slate-500 hover:text-indigo-600 transition-colors flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Re-analyze
              </button>
            </>
          )}

          {/* Raw content (always visible) */}
          {!selectedProject.isAnalyzed && !isAnalyzing && (
            <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
              <h3 className="font-bold text-slate-800 mb-2">Your Content</h3>
              <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">{selectedProject.rawContent}</p>
              <button
                onClick={() => analyzeProject(selectedProject)}
                disabled={isAnalyzing || (selectedProject.rawContent || '').length < 50}
                className="mt-4 w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-40"
              >
                <Sparkles className="w-4 h-4" /> Analyze This Project
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Walk Through Screen ──────────────────────────────────────────────────
  if (view === 'walkthrough' && selectedProject) {
    return (
      <div className="flex flex-col h-full" style={{ minHeight: 'calc(100vh - 60px)' }}>
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200/60 bg-white/80 backdrop-blur-sm">
          <button onClick={() => setView('detail')} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-slate-800">Walk Through</h2>
            <p className="text-xs text-slate-500 truncate">{selectedProject.title}</p>
          </div>
          {chatMessages.length > 0 && (
            <button
              onClick={() => { saveWalkThroughNotes(); }}
              className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-semibold hover:bg-indigo-100 transition-colors"
            >
              Save Notes
            </button>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {/* Empty state — conversation starters */}
          {chatMessages.length === 0 && (
            <div className="pt-8 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <MessageSquare className="w-8 h-8 text-slate-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-1">Let's walk through your project</h3>
              <p className="text-sm text-slate-500 max-w-xs mx-auto mb-6">
                I'll help you recall the details and see how much you actually accomplished.
              </p>
              <div className="flex flex-wrap justify-center gap-2 max-w-md mx-auto">
                {[
                  { label: "What was I most proud of?", icon: "🌟" },
                  { label: "What was the hardest part?", icon: "💪" },
                  { label: "How do I explain this simply?", icon: "💡" },
                  { label: "What impact did I make?", icon: "📊" },
                ].map((starter, i) => (
                  <button
                    key={i}
                    onClick={() => sendWalkThroughMessage(starter.label)}
                    className="px-3.5 py-2 bg-white border border-slate-200 rounded-full text-sm text-slate-700 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 transition-all active:scale-[0.97] shadow-sm"
                  >
                    <span className="mr-1.5">{starter.icon}</span>
                    {starter.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Chat messages */}
          {chatMessages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-md'
                  : 'bg-white border border-slate-200/60 text-slate-800 rounded-bl-md shadow-sm'
              }`}>
                <div className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</div>
                <div className={`text-[10px] mt-1.5 ${msg.role === 'user' ? 'text-white/60' : 'text-slate-400'}`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isChatLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-slate-200/60 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          {chatError && (
            <div className="mx-auto max-w-sm p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-red-700">{chatError}</p>
                <button onClick={() => setChatError(null)} className="text-xs text-red-500 hover:text-red-700 mt-1 underline">Dismiss</button>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-slate-200/60 bg-white/80 backdrop-blur-sm px-4 py-3">
          <form onSubmit={e => { e.preventDefault(); sendWalkThroughMessage(); }} className="flex items-end gap-2">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendWalkThroughMessage(); } }}
                placeholder="Tell me about this project..."
                rows={1}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm resize-none focus:ring-2 focus:ring-indigo-300/50 focus:border-indigo-300 transition-all"
                style={{ maxHeight: '120px' }}
              />
            </div>
            <button
              type="submit"
              disabled={!chatInput.trim() || isChatLoading}
              className="p-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl disabled:opacity-40 hover:from-indigo-600 hover:to-purple-600 transition-all active:scale-[0.95] flex-shrink-0"
            >
              {isChatLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ── Quick Refresh Screen ─────────────────────────────────────────────────
  if (view === 'refresh' && refreshData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-amber-200/60 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
          <button onClick={() => setView('list')} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-slate-800">Pre-Interview Refresh</h2>
            <p className="text-xs text-amber-600 font-medium">Your quick confidence briefing</p>
          </div>
          <Zap className="w-5 h-5 text-amber-500" />
        </div>

        <div className="px-4 py-4 max-w-2xl mx-auto space-y-4">
          {/* Confidence Note */}
          {refreshData.confidenceNote && (
            <div className="bg-gradient-to-r from-amber-100 to-orange-100 rounded-xl p-5 border border-amber-200">
              <h3 className="font-bold text-amber-800 mb-2 flex items-center gap-2">
                <Star className="w-4 h-4" /> Remember This
              </h3>
              <p className="text-sm text-amber-900 leading-relaxed">{refreshData.confidenceNote}</p>
            </div>
          )}

          {/* Top Talking Points */}
          {refreshData.topTalkingPoints?.length > 0 && (
            <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
              <h3 className="font-bold text-slate-800 mb-3">Top Talking Points</h3>
              <div className="space-y-2">
                {refreshData.topTalkingPoints.map((point, i) => (
                  <div key={i} className="flex gap-2 text-sm text-slate-700">
                    <span className="text-amber-500 font-bold">{i + 1}.</span>
                    <span className="leading-relaxed">{point}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills to Emphasize */}
          {refreshData.skillsToEmphasize?.length > 0 && (
            <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
              <h3 className="font-bold text-slate-800 mb-3">Skills to Emphasize</h3>
              <div className="flex flex-wrap gap-1.5">
                {refreshData.skillsToEmphasize.map((skill, i) => (
                  <span key={i} className="px-3 py-1.5 bg-amber-50 text-amber-700 rounded-full text-sm font-medium">{skill}</span>
                ))}
              </div>
            </div>
          )}

          {/* Projects to Lead With */}
          {refreshData.projectsToLead?.length > 0 && (
            <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
              <h3 className="font-bold text-slate-800 mb-3">Lead With These Projects</h3>
              <div className="space-y-3">
                {refreshData.projectsToLead.map((proj, i) => (
                  <div key={i} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="font-semibold text-sm text-slate-800">{proj.title}</p>
                    <p className="text-xs text-slate-500 mt-1">{proj.why}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="text-center text-xs text-slate-400 pt-2">You've got this. Go show them what you can do.</p>
        </div>
      </div>
    );
  }

  // ── JD Match Screen ──────────────────────────────────────────────────────
  if (view === 'jdmatch' && jdMatchData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-teal-200/60 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
          <button onClick={() => setView('list')} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-slate-800">JD Match</h2>
            <p className="text-xs text-teal-600 font-medium">Portfolio relevance to your target JD</p>
          </div>
          <Target className="w-5 h-5 text-teal-500" />
        </div>

        <div className="px-4 py-4 max-w-2xl mx-auto space-y-4">
          {/* Strategy */}
          {jdMatchData.strategy && (
            <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl p-5 border border-teal-200">
              <h3 className="font-bold text-teal-800 mb-2">Strategy</h3>
              <p className="text-sm text-teal-900 leading-relaxed">{jdMatchData.strategy}</p>
            </div>
          )}

          {/* Matches */}
          {jdMatchData.matches?.length > 0 && (
            <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
              <h3 className="font-bold text-slate-800 mb-3">Project Relevance</h3>
              <div className="space-y-3">
                {jdMatchData.matches
                  .sort((a, b) => {
                    const order = { high: 0, medium: 1, low: 2 };
                    return (order[a.relevance] || 3) - (order[b.relevance] || 3);
                  })
                  .map((match, i) => {
                    const project = projects[match.projectIndex];
                    if (!project) return null;
                    const relevanceColors = {
                      high: 'bg-green-50 text-green-700 border-green-200',
                      medium: 'bg-amber-50 text-amber-700 border-amber-200',
                      low: 'bg-slate-50 text-slate-500 border-slate-200',
                    };
                    return (
                      <div key={i} className="p-3 rounded-lg border border-slate-200">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-sm text-slate-800">{project.title}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${relevanceColors[match.relevance] || relevanceColors.low}`}>
                            {match.relevance}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">{match.reason}</p>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Gaps */}
          {jdMatchData.gaps?.length > 0 && (
            <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
              <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500" /> Gaps to Address
              </h3>
              <div className="space-y-1.5">
                {jdMatchData.gaps.map((gap, i) => (
                  <p key={i} className="text-sm text-slate-600 flex items-start gap-2">
                    <span className="text-amber-500 mt-0.5">•</span> {gap}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Next Step Suggestion after JD match */}
          {onNavigate && (
            <NextStepSuggestion context="portfolio-analysis" onNavigate={onNavigate} />
          )}
        </div>
      </div>
    );
  }

  // ─── Answer Forge View ──────────────────────────────────────────────────

  if (view === 'forge') {
    return (
      <AnswerForge
        questions={questions}
        onBack={() => setView('list')}
        getUserContext={getUserContext}
        onSaveQuestion={(qId, updates) => {
          // Update local questions state if parent provided a handler
          // The AnswerForge component handles Supabase + localStorage directly
        }}
      />
    );
  }

  // Fallback — shouldn't reach here
  return (
    <div className="p-8 text-center">
      <button onClick={() => setView('list')} className="text-indigo-600 underline">Back to Portfolio</button>
    </div>
  );
}

export default Portfolio;
