import { isTap } from '../../utils/tapGuard';
/**
 * PortfolioIntake.jsx — Guided project intake with 2 paths:
 *   1. "Help me build it" — AI-guided conversation (promoted as recommended)
 *   2. "I already have content" — Upload, STAR-guided fields, or free-form paste
 *
 * D.R.A.F.T. protocol: NEW file. No existing code modified.
 *
 * Replaces the blank Add/Edit form in Portfolio.jsx with a guided
 * experience that makes it easy for users with imposter syndrome
 * to add projects without knowing what to include.
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  ArrowLeft, Upload, FileText, MessageSquare, ChevronRight, Loader2,
  AlertCircle, CheckCircle, Send, Sparkles, ChevronDown, ChevronUp,
  File, X
} from 'lucide-react';
import { parseFile, ACCEPT_STRING } from '../../utils/fileParser';
import { buildPortfolioIntakeChatPrompt, buildFleshOutPrompt } from '../../utils/portfolioPrompts';
import { supabase } from '../../lib/supabase';
import { fetchWithRetry } from '../../utils/fetchWithRetry';
import { incrementUsage } from '../../utils/creditSystem';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://tzrlpwtkrtvjpdhcaayu.supabase.co';

const CONTENT_WARNING_AMBER = 12000;
const CONTENT_WARNING_RED = 15000;

// ─── Role suggestions ─────────────────────────────────────────────────────────

const ROLE_SUGGESTIONS = [
  'Lead Developer', 'Software Engineer', 'Project Manager', 'Team Lead',
  'Individual Contributor', 'Intern', 'Research Assistant', 'Designer',
  'Data Analyst', 'Product Manager', 'QA Engineer', 'DevOps Engineer',
  'Consultant', 'Teaching Assistant', 'Volunteer Coordinator',
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function PortfolioIntake({
  onSave,
  onSaveAndAnalyze,
  onCancel,
  editingProject,
  getUserContext,
}) {
  // Navigation state
  const [step, setStep] = useState(editingProject ? 1 : 0);
  const [path, setPath] = useState(editingProject ? 'content' : null); // 'content' | 'chat' | null

  // Form state
  const [title, setTitle] = useState(editingProject?.title || '');
  const [role, setRole] = useState(editingProject?.role || '');
  const [timeframe, setTimeframe] = useState(editingProject?.timeframe || '');
  const [rawContent, setRawContent] = useState(editingProject?.rawContent || '');

  // STAR guided fields
  const [guidedSituation, setGuidedSituation] = useState('');
  const [guidedTask, setGuidedTask] = useState('');
  const [guidedAction, setGuidedAction] = useState('');
  const [guidedResult, setGuidedResult] = useState('');
  const [contentSubMode, setContentSubMode] = useState(editingProject ? 'freeform' : 'guided'); // 'guided' | 'freeform' | 'upload'

  // AI flesh-out state
  const [isFleshingOut, setIsFleshingOut] = useState(false);
  const [fleshedOutContent, setFleshedOutContent] = useState(null);
  const [fleshOutError, setFleshOutError] = useState(null);

  // File upload state
  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState(null);
  const [parsedFile, setParsedFile] = useState(null); // { fileName, fileType, charCount }
  const fileInputRef = useRef(null);

  // Chat state (for "Help me build it" path)
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatError, setChatError] = useState(null);
  const [chatCreditCharged, setChatCreditCharged] = useState(false);
  const [generatedProject, setGeneratedProject] = useState(null);
  const messagesEndRef = useRef(null);
  const chatInputRef = useRef(null);

  // UI state
  const [showRoleSuggestions, setShowRoleSuggestions] = useState(false);

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isChatLoading]);

  // ─── AI Helpers (same pattern as Portfolio.jsx) ──────────────────────────────

  const getContext = useCallback(() => {
    return getUserContext ? getUserContext() : {};
  }, [getUserContext]);

  const callAI = async (systemPrompt, userMessage) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');
    const response = await fetchWithRetry(`${SUPABASE_URL}/functions/v1/ai-feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ mode: 'confidence-brief', systemPrompt, userMessage }),
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

  const chargeCredit = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) await incrementUsage(supabase, user.id, 'answer_assistant');
    } catch (e) { console.warn('Usage tracking failed:', e); }
  };

  // ─── File Upload Handlers ───────────────────────────────────────────────────

  const handleFile = async (file) => {
    if (!file) return;
    setIsParsing(true);
    setParseError(null);
    setParsedFile(null);

    try {
      const result = await parseFile(file);
      setRawContent(result.text);
      setParsedFile({ fileName: result.fileName, fileType: result.fileType, charCount: result.charCount });
      // Switch to freeform to show the extracted content
      setContentSubMode('freeform');
    } catch (err) {
      setParseError(err.message);
    } finally {
      setIsParsing(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileInput = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  // ─── STAR Guided Helpers ──────────────────────────────────────────────────

  const combineGuidedFields = () => {
    const parts = [];
    if (guidedSituation.trim()) parts.push(`Context: ${guidedSituation.trim()}`);
    if (guidedTask.trim()) parts.push(`My role: ${guidedTask.trim()}`);
    if (guidedAction.trim()) parts.push(`What I did: ${guidedAction.trim()}`);
    if (guidedResult.trim()) parts.push(`Results: ${guidedResult.trim()}`);
    return parts.join('\n\n');
  };

  const guidedFieldCount = [guidedSituation, guidedTask, guidedAction, guidedResult]
    .filter(f => f.trim().length >= 10).length;
  const guidedCharCount = (guidedSituation + guidedTask + guidedAction + guidedResult).length;
  const canContinueGuided = guidedFieldCount >= 2 && guidedCharCount >= 50;

  const handleFleshOut = async () => {
    setIsFleshingOut(true);
    setFleshOutError(null);
    setFleshedOutContent(null);
    try {
      const context = getContext();
      const systemPrompt = buildFleshOutPrompt(context);
      const userMessage = [
        guidedSituation.trim() && `Situation: ${guidedSituation.trim()}`,
        guidedTask.trim() && `Task/Role: ${guidedTask.trim()}`,
        guidedAction.trim() && `Actions: ${guidedAction.trim()}`,
        guidedResult.trim() && `Results: ${guidedResult.trim()}`,
      ].filter(Boolean).join('\n\n');

      const aiText = await callAI(systemPrompt, userMessage);
      setFleshedOutContent(aiText);
      // Charge AFTER success (Battle Scar #8)
      await chargeCredit();
    } catch (err) {
      console.error('Flesh out error:', err);
      setFleshOutError(err.message || 'Failed to expand your content. Please try again.');
    } finally {
      setIsFleshingOut(false);
    }
  };

  const acceptFleshedOut = () => {
    if (!fleshedOutContent) return;
    setRawContent(fleshedOutContent);
    setFleshedOutContent(null);
    setStep(2);
  };

  // ─── Chat Intake Handlers ──────────────────────────────────────────────────

  const sendChatMessage = async (overrideMessage) => {
    const msg = overrideMessage || chatInput.trim();
    if (!msg || isChatLoading) return;

    const userMsg = { role: 'user', text: msg };
    const updatedMessages = [...chatMessages, userMsg];
    setChatMessages(updatedMessages);
    setChatInput('');
    setIsChatLoading(true);
    setChatError(null);

    try {
      const context = getContext();
      const systemPrompt = buildPortfolioIntakeChatPrompt(context);

      // Build conversation history (InterviewCoach pattern)
      const history = updatedMessages
        .map(m => `${m.role === 'user' ? 'User' : 'Coach'}: ${m.text}`)
        .join('\n\n');
      const userMessage = `${history}\n\nCoach:`;

      const aiText = await callAI(systemPrompt, userMessage);

      // Charge credit on first exchange only
      if (!chatCreditCharged) {
        await chargeCredit();
        setChatCreditCharged(true);
      }

      setChatMessages(prev => [...prev, { role: 'assistant', text: aiText }]);

      // Check if AI generated a project entry (look for JSON block)
      const jsonMatch = aiText.match(/```json\s*([\s\S]*?)```/);
      if (jsonMatch) {
        try {
          const projectData = JSON.parse(jsonMatch[1]);
          if (projectData.title && projectData.rawContent) {
            setGeneratedProject(projectData);
          }
        } catch {
          // JSON parse failed, that's okay — continue chatting
        }
      }
    } catch (err) {
      setChatError(err.message);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleChatKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendChatMessage();
    }
  };

  const acceptGeneratedProject = () => {
    if (!generatedProject) return;
    setTitle(generatedProject.title || '');
    setRole(generatedProject.role || '');
    setTimeframe(generatedProject.timeframe || '');
    setRawContent(generatedProject.rawContent || '');
    // Skip to save — they've been chatting enough
    onSaveAndAnalyze({
      title: generatedProject.title || '',
      role: generatedProject.role || '',
      timeframe: generatedProject.timeframe || '',
      rawContent: generatedProject.rawContent || '',
    });
  };

  // ─── Form Validation ───────────────────────────────────────────────────────

  const canSaveDraft = title.trim().length > 0;
  const canAnalyze = title.trim().length > 0 && rawContent.trim().length >= 50;

  // ─── Character count helpers ────────────────────────────────────────────────

  const charCount = rawContent.length;
  const charColor = charCount >= CONTENT_WARNING_RED
    ? 'text-red-500'
    : charCount >= CONTENT_WARNING_AMBER
    ? 'text-amber-500'
    : charCount >= 50
    ? 'text-green-500'
    : 'text-slate-400';

  // ─── RENDER ─────────────────────────────────────────────────────────────────

  // Step 0: Choose Path (2 options)
  if (step === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200/60 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
          <button onClick={onCancel} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <h2 className="text-lg font-bold text-slate-800">Add Project</h2>
        </div>

        <div className="px-4 py-6 max-w-2xl mx-auto">
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-slate-800 mb-2">How do you want to start?</h3>
            <p className="text-sm text-slate-500">Pick whatever feels easiest — you can always add more later.</p>
          </div>

          <div className="space-y-3">
            {/* Help me build it — promoted as recommended */}
            <button
              onClick={() => { setPath('chat'); setStep(1); }}
              onTouchEnd={(e) => { if (isTap(e)) { e.preventDefault(); setPath('chat'); setStep(1); } }}
              className="w-full bg-white rounded-2xl shadow-sm border-2 border-purple-200 p-5 text-left hover:border-purple-400 hover:shadow-md transition-all group relative"
            >
              <div className="absolute -top-2.5 right-4">
                <span className="px-2.5 py-0.5 bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-full shadow-sm">
                  Recommended
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-6 h-6 text-slate-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-800 group-hover:text-purple-600 transition-colors">Help me build it</h4>
                  <p className="text-sm text-slate-500 mt-0.5">I'll ask you a few questions and we'll create your entry together</p>
                </div>
                <ChevronRight className="w-5 h-5 text-purple-300 group-hover:text-purple-500 transition-colors" />
              </div>
            </button>

            {/* I already have content */}
            <button
              onClick={() => { setPath('content'); setStep(1); }}
              onTouchEnd={(e) => { if (isTap(e)) { e.preventDefault(); setPath('content'); setStep(1); } }}
              className="w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-5 text-left hover:border-indigo-300 hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-6 h-6 text-slate-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">I already have content</h4>
                  <p className="text-sm text-slate-500 mt-0.5">Upload a file, paste text, or fill in guided fields</p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-400 transition-colors" />
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Step 1c: AI Chat Intake
  if (step === 1 && path === 'chat') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200/60 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
          <button onClick={() => { setStep(0); setPath(null); setChatMessages([]); setGeneratedProject(null); }} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Let's Build This Together</h2>
            <p className="text-xs text-slate-500">Tell me about your work — I'll help you organize it</p>
          </div>
        </div>

        {/* Chat messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {chatMessages.length === 0 && !isChatLoading && (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-purple-500" />
              </div>
              <p className="text-slate-600 font-medium mb-2">Start a conversation</p>
              <p className="text-sm text-slate-400 max-w-sm mx-auto mb-6">
                Tell me about something you worked on, or pick a starter below
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {[
                  "I worked on a project I'm proud of",
                  "I want to add a recent job experience",
                  "I have a school project to add",
                  "I'm not sure where to start",
                ].map((starter, i) => (
                  <button
                    key={i}
                    onClick={() => sendChatMessage(starter)}
                    onTouchEnd={(e) => { if (isTap(e)) { e.preventDefault(); sendChatMessage(starter); } }}
                    className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-600 hover:border-purple-300 hover:text-purple-600 transition-all"
                  >
                    {starter}
                  </button>
                ))}
              </div>
            </div>
          )}

          {chatMessages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-indigo-500 text-white rounded-br-md'
                  : 'bg-white border border-slate-200 text-slate-700 rounded-bl-md shadow-sm'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}

          {isChatLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          {chatError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{chatError}</p>
            </div>
          )}

          {/* Generated project card */}
          {generatedProject && (
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-500" />
                <span className="text-sm font-semibold text-purple-700">Ready to save</span>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-800">{generatedProject.title}</p>
                {generatedProject.role && <p className="text-xs text-slate-500">Role: {generatedProject.role}</p>}
                {generatedProject.timeframe && <p className="text-xs text-slate-500">Timeframe: {generatedProject.timeframe}</p>}
              </div>
              <p className="text-xs text-slate-600 line-clamp-3">{generatedProject.rawContent}</p>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={acceptGeneratedProject}
                  onTouchEnd={(e) => { if (isTap(e)) { e.preventDefault(); acceptGeneratedProject(); } }}
                  className="flex-1 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-semibold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" /> Save & Analyze
                </button>
                <button
                  onClick={() => setGeneratedProject(null)}
                  className="px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm hover:bg-slate-50 transition-all"
                >
                  Keep chatting
                </button>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Chat input */}
        <div className="border-t border-slate-200/60 bg-white px-4 py-3">
          <div className="flex items-end gap-2 max-w-2xl mx-auto">
            <textarea
              ref={chatInputRef}
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={handleChatKeyDown}
              placeholder="Describe your work..."
              rows={1}
              className="flex-1 px-3 py-2.5 border border-slate-200 rounded-xl text-sm resize-none focus:ring-2 focus:ring-purple-300/50 focus:border-purple-300 transition-all"
              style={{ maxHeight: '120px' }}
            />
            <button
              onClick={() => sendChatMessage()}
              onTouchEnd={(e) => { if (isTap(e)) { e.preventDefault(); sendChatMessage(); } }}
              disabled={!chatInput.trim() || isChatLoading}
              className="p-2.5 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl shadow-md disabled:opacity-40 transition-all hover:shadow-lg"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Step 1: Content Input (STAR guided, free-form, or upload)
  if (step === 1 && path === 'content') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200/60 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
          <button onClick={() => { setStep(0); setPath(null); setParsedFile(null); setParseError(null); setFleshedOutContent(null); }} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <h2 className="text-lg font-bold text-slate-800">Describe Your Work</h2>
        </div>

        <div className="px-4 py-4 max-w-2xl mx-auto space-y-4">
          {/* Chat escape hatch */}
          <button
            onClick={() => { setPath('chat'); setChatMessages([]); setGeneratedProject(null); }}
            onTouchEnd={(e) => { if (isTap(e)) { e.preventDefault(); setPath('chat'); setChatMessages([]); setGeneratedProject(null); } }}
            className="w-full flex items-center gap-3 p-3 bg-purple-50 border border-purple-200 rounded-xl hover:bg-purple-100 transition-all group"
          >
            <MessageSquare className="w-4 h-4 text-purple-500" />
            <span className="text-sm text-purple-700 font-medium flex-1 text-left">Not sure what to write? Let me ask you questions instead</span>
            <ChevronRight className="w-4 h-4 text-purple-400 group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* Sub-mode tabs */}
          <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
            <button
              onClick={() => setContentSubMode('guided')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                contentSubMode === 'guided'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Guided
            </button>
            <button
              onClick={() => setContentSubMode('freeform')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                contentSubMode === 'freeform'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Paste / Type
            </button>
            <button
              onClick={() => setContentSubMode('upload')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                contentSubMode === 'upload'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Upload File
            </button>
          </div>

          {/* ── GUIDED sub-mode ────────────────────────────────── */}
          {contentSubMode === 'guided' && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-4">
                <p className="text-xs text-slate-500">Answer a few short questions — even a sentence or two per box is enough.</p>

                {/* Situation */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">What were you working on?</label>
                  <textarea
                    value={guidedSituation}
                    onChange={e => setGuidedSituation(e.target.value)}
                    placeholder='e.g., "Customer portal for a SaaS company with 500+ users"'
                    rows={2}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm resize-none focus:ring-2 focus:ring-indigo-300/50 focus:border-indigo-300 transition-all"
                  />
                </div>

                {/* Task */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">What was your role or responsibility?</label>
                  <textarea
                    value={guidedTask}
                    onChange={e => setGuidedTask(e.target.value)}
                    placeholder='e.g., "Lead developer managing 2 junior devs"'
                    rows={2}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm resize-none focus:ring-2 focus:ring-indigo-300/50 focus:border-indigo-300 transition-all"
                  />
                </div>

                {/* Action */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">What did you actually do?</label>
                  <textarea
                    value={guidedAction}
                    onChange={e => setGuidedAction(e.target.value)}
                    placeholder='e.g., "Designed the API, built the React frontend, set up CI/CD pipeline..."'
                    rows={3}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm resize-none focus:ring-2 focus:ring-indigo-300/50 focus:border-indigo-300 transition-all"
                  />
                </div>

                {/* Result */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">What happened? Any results or impact?</label>
                  <textarea
                    value={guidedResult}
                    onChange={e => setGuidedResult(e.target.value)}
                    placeholder='e.g., "Reduced load time by 60%, saved the team 10 hrs/week"'
                    rows={2}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm resize-none focus:ring-2 focus:ring-indigo-300/50 focus:border-indigo-300 transition-all"
                  />
                </div>

                {/* Progress indicator */}
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    {[guidedSituation, guidedTask, guidedAction, guidedResult].map((f, i) => (
                      <div
                        key={i}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          f.trim().length >= 10 ? 'bg-indigo-500' : 'bg-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-slate-400">
                    {guidedFieldCount}/4 fields filled {guidedFieldCount >= 2 ? '— ready to continue' : '— fill at least 2'}
                  </span>
                </div>
              </div>

              {/* AI flesh-out button */}
              {guidedFieldCount >= 2 && (
                <button
                  onClick={handleFleshOut}
                  onTouchEnd={(e) => { if (isTap(e)) { e.preventDefault(); handleFleshOut(); } }}
                  disabled={isFleshingOut}
                  className="w-full py-3 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 text-purple-700 rounded-xl font-semibold text-sm hover:from-purple-100 hover:to-indigo-100 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isFleshingOut ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Expanding your content...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" /> AI: Help me flesh this out
                    </>
                  )}
                </button>
              )}

              {fleshOutError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{fleshOutError}</p>
                </div>
              )}

              {/* AI fleshed-out preview */}
              {fleshedOutContent && (
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-500" />
                    <span className="text-sm font-semibold text-purple-700">Here's an enriched version</span>
                  </div>
                  <textarea
                    value={fleshedOutContent}
                    onChange={e => setFleshedOutContent(e.target.value)}
                    rows={8}
                    className="w-full px-3 py-2.5 border border-purple-200 rounded-xl text-sm resize-none focus:ring-2 focus:ring-purple-300/50 focus:border-purple-300 bg-white transition-all"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={acceptFleshedOut}
                      onTouchEnd={(e) => { if (isTap(e)) { e.preventDefault(); acceptFleshedOut(); } }}
                      className="flex-1 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-semibold text-sm shadow-md hover:shadow-lg transition-all"
                    >
                      Use this version
                    </button>
                    <button
                      onClick={() => setFleshedOutContent(null)}
                      className="px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm hover:bg-slate-50 transition-all"
                    >
                      Keep my original
                    </button>
                  </div>
                </div>
              )}

              {/* Continue with raw guided fields */}
              {!fleshedOutContent && (
                <button
                  onClick={() => {
                    setRawContent(combineGuidedFields());
                    setStep(2);
                  }}
                  disabled={!canContinueGuided}
                  className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-semibold text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                >
                  Continue <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          {/* ── FREEFORM sub-mode ──────────────────────────────── */}
          {contentSubMode === 'freeform' && (
            <div className="space-y-4">
              {/* Parsed file info */}
              {parsedFile && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                    <File className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">{parsedFile.fileName}</p>
                    <p className="text-xs text-slate-400">{parsedFile.charCount.toLocaleString()} characters extracted</p>
                  </div>
                  <button
                    onClick={() => { setParsedFile(null); setRawContent(''); }}
                    className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
              )}

              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-3">
                <label className="block text-sm font-semibold text-slate-700">
                  Project Details *
                </label>

                <textarea
                  value={rawContent}
                  onChange={e => setRawContent(e.target.value)}
                  placeholder={'Paste your resume bullets, project descriptions, README excerpts, performance review snippets, course assignments, or just describe what you did in your own words...\n\nDon\'t worry about making it perfect — the AI will help organize and strengthen it.'}
                  rows={12}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm resize-none focus:ring-2 focus:ring-indigo-300/50 focus:border-indigo-300 transition-all"
                />

                {/* Character counter with warnings */}
                <div className="flex items-center justify-between">
                  <p className={`text-xs ${charColor}`}>
                    {charCount < 50
                      ? `${charCount}/50 min characters`
                      : charCount >= CONTENT_WARNING_RED
                      ? `${charCount.toLocaleString()} characters — large document detected`
                      : charCount >= CONTENT_WARNING_AMBER
                      ? `${charCount.toLocaleString()} characters — getting close to the analysis limit`
                      : `${charCount.toLocaleString()} characters`
                    }
                  </p>
                  {charCount >= CONTENT_WARNING_RED && (
                    <span className="text-xs text-amber-500">The AI will focus on the first ~15,000 characters.</span>
                  )}
                </div>
              </div>

              {/* Continue button */}
              <button
                onClick={() => setStep(2)}
                disabled={rawContent.trim().length < 50}
                className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-semibold text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-40 flex items-center justify-center gap-2"
              >
                Continue <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ── UPLOAD sub-mode ────────────────────────────────── */}
          {contentSubMode === 'upload' && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
                {!parsedFile ? (
                  <>
                    <div
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onClick={() => fileInputRef.current?.click()}
                      onTouchEnd={(e) => { if (isTap(e)) { e.preventDefault(); fileInputRef.current?.click(); } }}
                      className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                        isDragging
                          ? 'border-indigo-400 bg-indigo-50'
                          : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                      }`}
                    >
                      {isParsing ? (
                        <div className="flex flex-col items-center gap-3">
                          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                          <p className="text-sm text-slate-600">Reading your file...</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-3">
                          <Upload className="w-8 h-8 text-slate-400" />
                          <div>
                            <p className="text-sm font-medium text-slate-700">
                              Drop a file here or <span className="text-indigo-500">browse</span>
                            </p>
                            <p className="text-xs text-slate-400 mt-1">PDF, Word (.docx), or text file — up to 10 MB</p>
                          </div>
                        </div>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept={ACCEPT_STRING}
                        onChange={handleFileInput}
                        className="hidden"
                      />
                    </div>

                    {parseError && (
                      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-700">{parseError}</p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                          <File className="w-4 h-4 text-indigo-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-700">{parsedFile.fileName}</p>
                          <p className="text-xs text-slate-400">{parsedFile.fileType} · {parsedFile.charCount.toLocaleString()} characters extracted</p>
                        </div>
                      </div>
                      <button
                        onClick={() => { setParsedFile(null); setRawContent(''); setParseError(null); }}
                        className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4 text-slate-400" />
                      </button>
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-xs text-green-600">Content extracted — you can review and edit on the next step</span>
                    </div>

                    {/* Continue after upload */}
                    <button
                      onClick={() => setStep(2)}
                      disabled={rawContent.trim().length < 50}
                      className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-semibold text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-40 flex items-center justify-center gap-2 mt-2"
                    >
                      Continue <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Step 2: Metadata (title, role, timeframe) + Save
  if (step === 2) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200/60 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
          <button onClick={() => setStep(1)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <h2 className="text-lg font-bold text-slate-800">{editingProject ? 'Edit Project' : 'Project Details'}</h2>
        </div>

        <div className="px-4 py-4 max-w-2xl mx-auto space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-4">
            {/* Content summary */}
            <div className="bg-slate-50 rounded-xl p-3 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-700">Content ready</p>
                <p className="text-xs text-slate-400">{rawContent.length.toLocaleString()} characters</p>
              </div>
              <button
                onClick={() => setStep(1)}
                className="text-xs text-indigo-500 hover:text-indigo-700 transition-colors"
              >
                Edit
              </button>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Project Title *</label>
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="E-commerce Migration, Senior Thesis, Marketing Campaign..."
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-300/50 focus:border-indigo-300 transition-all"
              />
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Your Role</label>
              <div className="relative">
                <input
                  value={role}
                  onChange={e => { setRole(e.target.value); setShowRoleSuggestions(true); }}
                  onFocus={() => setShowRoleSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowRoleSuggestions(false), 200)}
                  placeholder="What was your role? (e.g., Lead Developer)"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-300/50 focus:border-indigo-300 transition-all"
                />
                {showRoleSuggestions && !role.trim() && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-20 max-h-40 overflow-y-auto">
                    {ROLE_SUGGESTIONS.map((r, i) => (
                      <button
                        key={i}
                        onClick={() => { setRole(r); setShowRoleSuggestions(false); }}
                        onMouseDown={(e) => e.preventDefault()}
                        className="w-full text-left px-3 py-2 text-sm text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Timeframe */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Timeframe</label>
              <input
                value={timeframe}
                onChange={e => setTimeframe(e.target.value)}
                placeholder="Jan 2024 – Jun 2024"
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-300/50 focus:border-indigo-300 transition-all"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => onSave({ title, role, timeframe, rawContent })}
              disabled={!canSaveDraft}
              className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold text-sm hover:bg-slate-200 transition-all disabled:opacity-40"
            >
              Save Draft
            </button>
            <button
              onClick={() => onSaveAndAnalyze({ title, role, timeframe, rawContent })}
              disabled={!canAnalyze}
              className="flex-1 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-semibold text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-40 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" /> Save & Analyze
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Fallback (shouldn't reach here)
  return null;
}
