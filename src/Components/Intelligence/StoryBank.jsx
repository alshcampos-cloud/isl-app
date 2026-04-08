/**
 * StoryBank.jsx — Core career stories management.
 *
 * Phase 4F: The real interview coaching secret — 7-10 stories cover 35-50 questions.
 * Based on the "Story Circle" method (Linda Ashworth).
 *
 * Props:
 *   onBack — return to previous view
 *   questions — array of question objects
 *   getUserContext — function returning user context
 */

import { useState, useCallback, useEffect } from 'react';
import { ArrowLeft, Plus, Edit2, Trash2, Sparkles, BookOpen, Target, Loader2, CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { fetchWithRetry } from '../../utils/fetchWithRetry';
import { incrementUsage } from '../../utils/creditSystem';
import { buildStoryMatchPrompt } from '../../utils/storyMatchPrompt';
import NextStepSuggestion from './NextStepSuggestion';

// localStorage persistence with backup on corrupt read
function loadStories() {
  try {
    const raw = localStorage.getItem('isl_stories');
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      localStorage.setItem('isl_stories_backup', raw);
      return [];
    }
    return parsed;
  } catch {
    // Preserve corrupt data for potential recovery
    const raw = localStorage.getItem('isl_stories');
    if (raw) localStorage.setItem('isl_stories_backup', raw);
    return [];
  }
}
function saveStories(stories) {
  try { localStorage.setItem('isl_stories', JSON.stringify(stories)); } catch {}
}

function StoryBank({ onBack, questions = [], getUserContext, onNavigate }) {
  const [stories, setStories] = useState(loadStories);
  const [editingStory, setEditingStory] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [matchResults, setMatchResults] = useState(null);
  const [isMatching, setIsMatching] = useState(false);
  const [matchError, setMatchError] = useState(null);
  const [storiesInitialized, setStoriesInitialized] = useState(false);

  // Persist stories — skip first render to avoid overwriting corrupt data with []
  useEffect(() => {
    if (storiesInitialized) {
      saveStories(stories);
    } else {
      setStoriesInitialized(true);
    }
  }, [stories, storiesInitialized]);

  // Form state
  const [form, setForm] = useState({
    title: '', situation: '', task: '', actions: '', result: '', skills: '',
  });

  const resetForm = () => {
    setForm({ title: '', situation: '', task: '', actions: '', result: '', skills: '' });
    setEditingStory(null);
    setShowForm(false);
  };

  const handleSave = () => {
    if (!form.title.trim() || !form.situation.trim()) return;

    const story = {
      id: editingStory?.id || `story_${Date.now()}`,
      title: form.title.trim(),
      situation: form.situation.trim(),
      task: form.task.trim(),
      actions: form.actions.split('\n').filter(a => a.trim()),
      result: form.result.trim(),
      skills: form.skills.split(',').map(s => s.trim()).filter(Boolean),
      questionsThisAnswers: editingStory?.questionsThisAnswers || [],
      createdAt: editingStory?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (editingStory) {
      setStories(prev => prev.map(s => s.id === editingStory.id ? story : s));
    } else {
      setStories(prev => [...prev, story]);
    }
    resetForm();
  };

  const handleEdit = (story) => {
    setForm({
      title: story.title,
      situation: story.situation,
      task: story.task,
      actions: (story.actions || []).join('\n'),
      result: story.result,
      skills: (story.skills || []).join(', '),
    });
    setEditingStory(story);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (!window.confirm('Delete this story? This cannot be undone.')) return;
    setStories(prev => prev.filter(s => s.id !== id));
  };

  // AI story-to-question matching
  const matchStoriesToQuestions = useCallback(async () => {
    if (stories.length === 0 || questions.length === 0) return;

    setIsMatching(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const storySummaries = stories.map(s => ({
        id: s.id,
        title: s.title,
        skills: s.skills,
        situation: s.situation.slice(0, 100),
      }));

      const questionSummaries = questions.slice(0, 30).map(q => ({
        id: q.id,
        question: q.question,
        category: q.category,
      }));

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
            systemPrompt: buildStoryMatchPrompt(),
            userMessage: `Match these stories to these questions:\n\nSTORIES:\n${JSON.stringify(storySummaries)}\n\nQUESTIONS:\n${JSON.stringify(questionSummaries)}`,
          }),
        }
      );

      if (!response.ok) throw new Error('Matching failed');
      const data = await response.json();
      const aiText = data.content?.[0]?.text || '';
      const jsonMatch = aiText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          setMatchResults(parsed);
          setMatchError(null);

          // CHARGE AFTER SUCCESS (Battle Scar #8)
          try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) await incrementUsage(supabase, user.id, 'answer_assistant');
          } catch (e) { console.warn('Usage tracking failed:', e); }
        } catch {
          setMatchError('Matching returned unexpected format. Try again.');
        }
      } else {
        setMatchError('Could not parse matching results. Try again.');
      }
    } catch (err) {
      console.error('Story match error:', err);
      setMatchError(err.message || 'Matching failed. Please try again.');
    } finally {
      setIsMatching(false);
    }
  }, [stories, questions]);

  // Coverage calculation
  const coveredQuestions = new Set();
  if (matchResults?.matches) {
    matchResults.matches.forEach(m => {
      m.questionMatches?.forEach(qm => coveredQuestions.add(qm.questionId));
    });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={onBack} aria-label="Go back" className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-gray-800">Story Bank</h1>
            <p className="text-xs text-gray-500">{stories.length} stories • {coveredQuestions.size} questions covered</p>
          </div>
          <button
            onClick={() => { setShowForm(true); setEditingStory(null); setForm({ title: '', situation: '', task: '', actions: '', result: '', skills: '' }); }}
            className="p-2 bg-teal-500 text-white rounded-xl hover:bg-teal-600 transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-3xl">
        {/* Coverage banner */}
        {stories.length > 0 && questions.length > 0 && (
          <div className="bg-gradient-to-r from-teal-50 to-emerald-50 rounded-xl p-4 border border-teal-200 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-teal-800">
                  {matchResults ? `${coveredQuestions.size} of ${Math.min(questions.length, 30)} questions covered` : `${stories.length} stories — tap Match to see coverage`}
                </p>
                <div className="h-2 w-48 bg-teal-200 rounded-full mt-1 overflow-hidden">
                  <div
                    className="h-full bg-teal-500 rounded-full transition-all"
                    style={{ width: `${Math.min(100, (coveredQuestions.size / Math.min(questions.length, 30)) * 100)}%` }}
                  />
                </div>
              </div>
              <button
                onClick={matchStoriesToQuestions}
                disabled={isMatching}
                className="px-3 py-1.5 bg-teal-500 text-white rounded-lg text-xs font-semibold hover:bg-teal-600 transition-colors flex items-center gap-1"
              >
                {isMatching ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                {isMatching ? 'Matching...' : 'Match Stories'}
              </button>
            </div>
          </div>
        )}

        {/* Match error */}
        {matchError && (
          <div className="bg-red-50 rounded-xl p-3 border border-red-200 flex items-center gap-2 mb-4">
            <span className="text-red-500 text-sm">⚠</span>
            <span className="text-sm text-red-700 flex-1">{matchError}</span>
            <button onClick={matchStoriesToQuestions} className="text-xs text-red-600 font-semibold underline">Retry</button>
            <button onClick={() => setMatchError(null)} className="text-xs text-red-400 hover:text-red-600">Dismiss</button>
          </div>
        )}

        {/* Empty state */}
        {stories.length === 0 && !showForm && (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-teal-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Build Your Story Bank</h3>
            <p className="text-sm text-gray-500 mb-1 max-w-md mx-auto">
              The secret of great interviewers: 7-10 core career stories can answer 35-50 different questions.
            </p>
            <p className="text-xs text-gray-400 mb-4">Based on the &ldquo;Story Circle&rdquo; method by interview coaching experts.</p>
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-xl font-semibold hover:from-teal-600 hover:to-emerald-600 transition-all"
            >
              + Add Your First Story
            </button>
          </div>
        )}

        {/* Story form */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              {editingStory ? 'Edit Story' : 'Add a Career Story'}
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Story Title</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({...form, title: e.target.value})}
                  placeholder='e.g., "The time I led the emergency response drill"'
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-300/50"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Situation (When/Where)</label>
                <textarea value={form.situation} onChange={(e) => setForm({...form, situation: e.target.value})} rows={2} placeholder="Describe the context..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-y focus:ring-2 focus:ring-teal-300/50 min-h-[56px]" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Task (Your Role)</label>
                <textarea value={form.task} onChange={(e) => setForm({...form, task: e.target.value})} rows={2} placeholder="What was your specific responsibility?" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-y focus:ring-2 focus:ring-teal-300/50 min-h-[56px]" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Actions (one per line)</label>
                <textarea value={form.actions} onChange={(e) => setForm({...form, actions: e.target.value})} rows={3} placeholder="Step 1: I identified the root cause...&#10;Step 2: I coordinated with..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-y focus:ring-2 focus:ring-teal-300/50" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Result (Quantified Outcome)</label>
                <textarea value={form.result} onChange={(e) => setForm({...form, result: e.target.value})} rows={2} placeholder="Reduced response time by 40%..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-y focus:ring-2 focus:ring-teal-300/50 min-h-[56px]" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Skills (comma-separated)</label>
                <input value={form.skills} onChange={(e) => setForm({...form, skills: e.target.value})} placeholder="leadership, crisis management, teamwork" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-300/50" />
              </div>
              <div className="flex items-center gap-2 pt-3">
                <button onClick={handleSave} disabled={!form.title.trim() || !form.situation.trim()} className="flex-1 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-xl font-semibold hover:from-teal-600 hover:to-emerald-600 disabled:opacity-40 transition-all">
                  {editingStory ? 'Update Story' : 'Save Story'}
                </button>
                <button onClick={resetForm} className="px-5 py-2.5 bg-gray-100 text-gray-600 rounded-xl font-semibold hover:bg-gray-200 transition-all">Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* Story list */}
        {stories.length > 0 && (
          <div className="space-y-3">
            {stories.map(story => {
              const storyMatches = matchResults?.matches?.find(m => m.storyId === story.id);
              // Story completeness: check all 4 STAR components
              const starParts = [story.situation, story.task, (Array.isArray(story.actions) ? story.actions.join('') : story.actions), story.result];
              const filledParts = starParts.filter(p => p && p.trim().length > 10).length;
              const completeness = Math.round((filledParts / 4) * 100);
              return (
                <div key={story.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-gray-800">{story.title}</h4>
                        {completeness < 100 && (
                          <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded text-[9px] font-bold">{completeness}%</span>
                        )}
                        {completeness === 100 && (
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{story.situation}</p>
                      {completeness < 100 && (
                        <p className="text-[10px] text-amber-600 mt-1">
                          Missing: {!story.situation || story.situation.trim().length <= 10 ? 'Situation ' : ''}{!story.task || story.task.trim().length <= 10 ? 'Task ' : ''}{!(Array.isArray(story.actions) ? story.actions.join('') : story.actions) || (Array.isArray(story.actions) ? story.actions.join('') : story.actions || '').trim().length <= 10 ? 'Actions ' : ''}{!story.result || story.result.trim().length <= 10 ? 'Result' : ''}
                        </p>
                      )}
                      {story.skills?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {story.skills.map((skill, idx) => (
                            <span key={`${skill}-${idx}`} className="px-2 py-0.5 bg-teal-50 text-teal-600 rounded-full text-[10px] font-medium">
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                      {storyMatches?.questionMatches?.length > 0 && (
                        <p className="text-xs text-emerald-600 font-medium mt-2">
                          <Target className="w-3 h-3 inline mr-1" />
                          Covers {storyMatches.questionMatches.length} question{storyMatches.questionMatches.length !== 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 ml-3">
                      <button onClick={() => handleEdit(story)} aria-label="Edit story" className="p-2.5 hover:bg-gray-100 rounded-lg transition-colors">
                        <Edit2 className="w-4 h-4 text-gray-400" />
                      </button>
                      <button onClick={() => handleDelete(story.id)} aria-label="Delete story" className="p-2.5 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Suggested story topics from matching */}
        {matchResults?.suggestedStoryTopics?.length > 0 && (
          <div className="mt-4 bg-amber-50 rounded-xl p-4 border border-amber-200">
            <h4 className="text-sm font-bold text-amber-800 mb-2">💡 Story Ideas You&apos;re Missing</h4>
            <ul className="space-y-1">
              {matchResults.suggestedStoryTopics.map((topic, i) => (
                <li key={i} className="text-sm text-amber-700 flex items-start gap-2">
                  <span className="text-amber-400">•</span>
                  <span>{topic}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Next Step Suggestion after story matching */}
        {matchResults && onNavigate && (
          <div className="mt-4">
            <NextStepSuggestion context="story-match" onNavigate={onNavigate} />
          </div>
        )}
      </div>
    </div>
  );
}

export default StoryBank;
