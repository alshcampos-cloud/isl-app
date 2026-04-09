/**
 * QuickAddQuestion.jsx — Floating Action Button for adding questions from home screen.
 *
 * Three modes:
 * 1. "Type a question" — single question text input
 * 2. "Paste a list" — textarea for bulk plain-text questions (one per line)
 * 3. "AI Generate" — launches existing QuestionAssistant
 *
 * All modes save to Supabase `questions` table via the same insert pattern.
 */

import { useState, useRef, useEffect } from 'react';
import { Plus, X, Type, List, Sparkles, Loader2, Check, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

function QuickAddQuestion({ onQuestionsAdded, onOpenGenerator }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState(null); // null | 'single' | 'bulk'
  const [singleQuestion, setSingleQuestion] = useState('');
  const [bulkText, setBulkText] = useState('');
  const [category, setCategory] = useState('Behavioral');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const overlayRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e) => {
      if (overlayRef.current && !overlayRef.current.contains(e.target)) {
        handleClose();
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen]);

  const handleClose = () => {
    setIsOpen(false);
    setMode(null);
    setSingleQuestion('');
    setBulkText('');
    setError(null);
    setSuccess(null);
  };

  // Parse bulk text into individual questions
  const parseBulkQuestions = (text) => {
    return text
      .split('\n')
      .map(line => line.trim())
      .map(line => line.replace(/^\d+[.)]\s*/, '').replace(/^[-\u2022*]\s*/, '').trim())
      .filter(line => line.length >= 10);
  };

  const handleSubmitSingle = async () => {
    const q = singleQuestion.trim();
    if (!q || q.length < 10) {
      setError('Question must be at least 10 characters');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Please sign in first');

      const { error: insertError } = await supabase
        .from('questions')
        .insert({
          user_id: user.id,
          question: q,
          category,
          priority: 'Standard',
          bullets: [],
          narrative: '',
          keywords: [],
        });

      if (insertError) throw insertError;

      setSuccess('Question added!');
      setSingleQuestion('');
      if (onQuestionsAdded) onQuestionsAdded();

      setTimeout(() => handleClose(), 1200);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitBulk = async () => {
    const questions = parseBulkQuestions(bulkText);
    if (questions.length === 0) {
      setError('No valid questions found. Each question should be at least 10 characters, one per line.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Please sign in first');

      const toInsert = questions.map(q => ({
        user_id: user.id,
        question: q,
        category,
        priority: 'Standard',
        bullets: [],
        narrative: '',
        keywords: [],
      }));

      const { error: insertError } = await supabase
        .from('questions')
        .insert(toInsert);

      if (insertError) throw insertError;

      setSuccess(`${questions.length} question${questions.length !== 1 ? 's' : ''} added!`);
      setBulkText('');
      if (onQuestionsAdded) onQuestionsAdded();

      setTimeout(() => handleClose(), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const bulkPreview = mode === 'bulk' && bulkText.trim()
    ? parseBulkQuestions(bulkText)
    : [];

  return (
    <>
      {/* FAB Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-4 z-40 w-14 h-14 bg-slate-800 rounded-full shadow-lg flex items-center justify-center text-white hover:bg-slate-700 active:scale-90 transition-all"
        style={{ boxShadow: '0 6px 20px -4px rgba(13, 148, 136, 0.5)' }}
      >
        <Plus className="w-7 h-7" />
      </button>

      {/* Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
          <div
            ref={overlayRef}
            className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] overflow-y-auto shadow-2xl"
            style={{ boxShadow: '0 24px 64px -16px rgba(0,0,0,0.2)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-warm-200/60">
              <h3 className="text-lg font-bold text-warm-800">Add Questions</h3>
              <button onClick={handleClose} className="p-1.5 hover:bg-warm-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-warm-500" />
              </button>
            </div>

            {/* Success message */}
            {success && (
              <div className="mx-4 mt-4 p-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">{success}</span>
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            )}

            {/* Mode selection */}
            {!mode && !success && (
              <div className="p-4 space-y-3">
                <button
                  onClick={() => setMode('single')}
                  className="w-full flex items-center gap-3 p-4 bg-warm-50 hover:bg-warm-100 rounded-xl transition-colors text-left"
                >
                  <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Type className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-warm-800">Type a question</p>
                    <p className="text-xs text-warm-500">Add a single interview question</p>
                  </div>
                </button>

                <button
                  onClick={() => setMode('bulk')}
                  className="w-full flex items-center gap-3 p-4 bg-warm-50 hover:bg-warm-100 rounded-xl transition-colors text-left"
                >
                  <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <List className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-warm-800">Paste a list</p>
                    <p className="text-xs text-warm-500">Paste multiple questions, one per line</p>
                  </div>
                </button>

                {onOpenGenerator && (
                  <button
                    onClick={() => {
                      handleClose();
                      onOpenGenerator();
                    }}
                    className="w-full flex items-center gap-3 p-4 bg-warm-50 hover:bg-warm-100 rounded-xl transition-colors text-left"
                  >
                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-warm-800">AI Generate</p>
                      <p className="text-xs text-warm-500">Generate questions from your job context</p>
                    </div>
                  </button>
                )}
              </div>
            )}

            {/* Single question mode */}
            {mode === 'single' && !success && (
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-warm-600 mb-1.5">Question</label>
                  <textarea
                    value={singleQuestion}
                    onChange={(e) => setSingleQuestion(e.target.value)}
                    placeholder="e.g., Tell me about a time you led a cross-functional project..."
                    rows={3}
                    className="w-full px-3.5 py-2.5 border border-warm-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-300/50 focus:border-teal-300 transition-all resize-none"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-warm-600 mb-1.5">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-warm-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-teal-300/50 focus:border-teal-300 transition-all"
                  >
                    <option value="Behavioral">Behavioral</option>
                    <option value="Technical">Technical</option>
                    <option value="Core Narrative">Core Narrative</option>
                    <option value="System-Level">System-Level</option>
                    <option value="Imported">Other</option>
                  </select>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setMode(null)}
                    className="flex-1 py-2.5 bg-warm-100 hover:bg-warm-200 text-warm-700 rounded-xl font-medium text-sm transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleSubmitSingle}
                    disabled={loading || singleQuestion.trim().length < 10}
                    className="flex-1 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white rounded-xl font-semibold text-sm disabled:opacity-40 transition-all active:scale-[0.97]"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Add Question'}
                  </button>
                </div>
              </div>
            )}

            {/* Bulk mode */}
            {mode === 'bulk' && !success && (
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-warm-600 mb-1.5">
                    Paste your questions (one per line)
                  </label>
                  <textarea
                    value={bulkText}
                    onChange={(e) => setBulkText(e.target.value)}
                    placeholder={"1. Tell me about yourself\n2. Why do you want this role?\n3. Describe a time you handled conflict\n4. What are your biggest strengths?"}
                    rows={6}
                    className="w-full px-3.5 py-2.5 border border-warm-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-300/50 focus:border-teal-300 transition-all resize-none font-mono"
                    autoFocus
                  />
                  {bulkPreview.length > 0 && (
                    <p className="text-xs text-warm-500 mt-1.5">
                      {bulkPreview.length} question{bulkPreview.length !== 1 ? 's' : ''} detected
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-warm-600 mb-1.5">Category for all</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-warm-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-teal-300/50 focus:border-teal-300 transition-all"
                  >
                    <option value="Behavioral">Behavioral</option>
                    <option value="Technical">Technical</option>
                    <option value="Core Narrative">Core Narrative</option>
                    <option value="System-Level">System-Level</option>
                    <option value="Imported">Other</option>
                  </select>
                </div>

                {/* Preview */}
                {bulkPreview.length > 0 && (
                  <div className="bg-warm-50 rounded-xl p-3 max-h-32 overflow-y-auto">
                    <p className="text-xs font-semibold text-warm-600 mb-2">Preview:</p>
                    <ul className="space-y-1">
                      {bulkPreview.slice(0, 10).map((q, i) => (
                        <li key={i} className="text-xs text-warm-700 truncate">
                          {i + 1}. {q}
                        </li>
                      ))}
                      {bulkPreview.length > 10 && (
                        <li className="text-xs text-warm-500 italic">
                          +{bulkPreview.length - 10} more...
                        </li>
                      )}
                    </ul>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => setMode(null)}
                    className="flex-1 py-2.5 bg-warm-100 hover:bg-warm-200 text-warm-700 rounded-xl font-medium text-sm transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleSubmitBulk}
                    disabled={loading || bulkPreview.length === 0}
                    className="flex-1 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white rounded-xl font-semibold text-sm disabled:opacity-40 transition-all active:scale-[0.97]"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                    ) : (
                      `Add ${bulkPreview.length} Question${bulkPreview.length !== 1 ? 's' : ''}`
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default QuickAddQuestion;
