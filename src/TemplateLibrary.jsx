import { useState, useMemo, useCallback } from 'react';
import { X, ChevronDown, ChevronRight, Check, Plus, Sparkles } from 'lucide-react';
import { DEFAULT_QUESTIONS, QUESTION_GROUPS } from './default_questions';

// Convert DEFAULT_QUESTIONS format to what App.jsx expects
const convertQuestion = (dq) => ({
  question: dq.question,
  category: dq.category || 'General',
  priority: dq.priority || 'Medium',
  bullets: dq.bullets || [],
  narrative: dq.narrative || '',
  keywords: dq.keywords || [],
  group: dq.group || null,
  difficulty: dq.difficulty || null,
});

// Difficulty badge colors
const DIFFICULTY_STYLES = {
  foundation: { bg: 'bg-slate-100', text: 'text-slate-600', label: 'Foundation' },
  intermediate: { bg: 'bg-amber-50', text: 'text-amber-700', label: 'Intermediate' },
  advanced: { bg: 'bg-rose-50', text: 'text-rose-700', label: 'Advanced' },
};

export default function TemplateLibrary({ onImport, onClose, onOpenAICoach, checkUsageLimit, existingQuestions = [] }) {
  const [expandedGroups, setExpandedGroups] = useState({});
  const [expandedQuestions, setExpandedQuestions] = useState({});
  const [justAdded, setJustAdded] = useState(new Set());

  // Check if a question is already in the user's bank
  const isInBank = useCallback((defaultQ) => {
    if (justAdded.has(defaultQ.id)) return true;
    return existingQuestions.some(eq =>
      eq.question?.toLowerCase().trim() === defaultQ.question?.toLowerCase().trim()
    );
  }, [existingQuestions, justAdded]);

  // Count how many questions from each group are in the bank
  const groupCounts = useMemo(() => {
    const counts = {};
    for (const group of QUESTION_GROUPS) {
      const groupQs = DEFAULT_QUESTIONS.filter(q => q.group === group.id);
      const inBank = groupQs.filter(q => isInBank(q)).length;
      counts[group.id] = { total: groupQs.length, inBank };
    }
    return counts;
  }, [isInBank]);

  // Total in bank across all groups
  const totalInBank = useMemo(() => {
    return DEFAULT_QUESTIONS.filter(q => isInBank(q)).length;
  }, [isInBank]);

  const toggleGroup = (groupId) => {
    setExpandedGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const toggleQuestion = (questionId) => {
    setExpandedQuestions(prev => ({ ...prev, [questionId]: !prev[questionId] }));
  };

  const handleAddOne = (dq) => {
    if (isInBank(dq)) return;
    onImport([convertQuestion(dq)]);
    setJustAdded(prev => new Set(prev).add(dq.id));
  };

  const handleAddAllInGroup = (groupId) => {
    const groupQuestions = DEFAULT_QUESTIONS.filter(q => q.group === groupId);
    const newOnes = groupQuestions.filter(q => !isInBank(q));
    if (newOnes.length > 0) {
      onImport(newOnes.map(convertQuestion));
      setJustAdded(prev => {
        const next = new Set(prev);
        newOnes.forEach(q => next.add(q.id));
        return next;
      });
    }
  };

  const handlePracticeWithCoach = (dq) => {
    if (onOpenAICoach) {
      onOpenAICoach(dq.question);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-slate-200 bg-white px-4 py-4 sm:px-6">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-slate-800 sm:text-2xl tracking-tight">Question Catalog</h2>
            <p className="mt-0.5 text-sm text-slate-500">Add questions to your practice bank</p>
          </div>
          <div className="flex items-center gap-3 ml-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700 whitespace-nowrap">
              <Check className="w-4 h-4" />
              {totalInBank} of {DEFAULT_QUESTIONS.length} in your bank
            </span>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Body — Scrollable accordion */}
      <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
        <div className="space-y-3 max-w-3xl mx-auto">
          {QUESTION_GROUPS.map((group) => {
            const isExpanded = !!expandedGroups[group.id];
            const counts = groupCounts[group.id] || { total: 0, inBank: 0 };
            const allAdded = counts.inBank >= counts.total;
            const newCount = counts.total - counts.inBank;
            const groupQuestions = DEFAULT_QUESTIONS.filter(q => q.group === group.id);

            return (
              <div key={group.id} className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                {/* Group header */}
                <button
                  onClick={() => toggleGroup(group.id)}
                  onTouchEnd={(e) => { e.preventDefault(); toggleGroup(group.id); }}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-slate-50 min-h-[56px] ${
                    isExpanded ? 'border-l-4 border-l-teal-500' : 'border-l-4 border-l-transparent'
                  }`}
                >
                  <span className="text-2xl flex-shrink-0" role="img" aria-label={group.label}>
                    {group.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-slate-800">{group.label}</span>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        allAdded
                          ? 'bg-teal-100 text-teal-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {counts.inBank}/{counts.total} added
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 truncate">{group.description}</p>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-slate-400 flex-shrink-0" />
                  )}
                </button>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="border-t border-slate-100">
                    {/* Add All New button */}
                    {!allAdded && (
                      <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleAddAllInGroup(group.id); }}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-teal-700 active:bg-teal-800 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          Add All {newCount} New Question{newCount !== 1 ? 's' : ''}
                        </button>
                      </div>
                    )}

                    {/* Question list */}
                    <div className="divide-y divide-slate-100">
                      {groupQuestions.map((dq) => {
                        const added = isInBank(dq);
                        const qExpanded = !!expandedQuestions[dq.id];
                        const diff = DIFFICULTY_STYLES[dq.difficulty] || DIFFICULTY_STYLES.foundation;

                        return (
                          <div key={dq.id}>
                            {/* Question row */}
                            <div
                              onClick={() => toggleQuestion(dq.id)}
                              onTouchEnd={(e) => { e.preventDefault(); toggleQuestion(dq.id); }}
                              className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-slate-50 transition-colors min-h-[48px]"
                              role="button"
                              tabIndex={0}
                            >
                              {added ? (
                                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center">
                                  <Check className="w-4 h-4 text-teal-500" />
                                </span>
                              ) : (
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleAddOne(dq); }}
                                  onTouchEnd={(e) => { e.stopPropagation(); e.preventDefault(); handleAddOne(dq); }}
                                  className="flex-shrink-0 w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center hover:bg-teal-700 active:bg-teal-800 transition-colors"
                                  aria-label="Add to bank"
                                >
                                  <Plus className="w-4 h-4 text-white" />
                                </button>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm ${added ? 'text-slate-400' : 'text-slate-800'} ${!qExpanded ? 'truncate' : ''}`}>
                                  {dq.question}
                                </p>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                {added && (
                                  <span className="text-xs text-teal-600 font-medium hidden sm:inline">Added</span>
                                )}
                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${diff.bg} ${diff.text}`}>
                                  {diff.label}
                                </span>
                              </div>
                            </div>

                            {/* Expanded question details */}
                            {qExpanded && (
                              <div className="px-4 pb-4 pl-[60px] space-y-3 bg-slate-50" onClick={(e) => e.stopPropagation()}>
                                {/* Bullets */}
                                {dq.bullets && dq.bullets.length > 0 && (
                                  <div>
                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Answer Scaffolding</p>
                                    <ul className="space-y-1">
                                      {dq.bullets.map((b, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                                          <span className="text-teal-400 mt-1 flex-shrink-0">&#8226;</span>
                                          <span>{b}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                {/* Why They Ask This */}
                                {dq.whyTheyAsk && (
                                  <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-100/60">
                                    <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-1">Why They Ask This</p>
                                    <p className="text-sm text-slate-700">{dq.whyTheyAsk}</p>
                                  </div>
                                )}

                                {/* Coaching Tip */}
                                {dq.coachingTip && (
                                  <div className="bg-amber-50 rounded-lg p-3 border border-amber-100/60">
                                    <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-1">Coaching Tip</p>
                                    <p className="text-sm text-slate-700">{dq.coachingTip}</p>
                                  </div>
                                )}

                                {/* Recommended Structure */}
                                {dq.recommendedStructure && (
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Best Structure:</span>
                                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                                      {dq.recommendedStructure === 'star' ? '⭐ STAR Method' :
                                       dq.recommendedStructure === 'prep' ? '📋 PREP' :
                                       dq.recommendedStructure === 'psb' ? '🎯 Problem-Solution-Benefit' :
                                       dq.recommendedStructure === 'add' ? '➕ Answer-Detail-Describe' :
                                       dq.recommendedStructure === 'what-so-now' ? '🔄 What-So What-Now What' :
                                       dq.recommendedStructure === 'past-present-future' ? '⏳ Past-Present-Future' :
                                       dq.recommendedStructure === 'comparison' ? '⚖️ Compare-Contrast' :
                                       dq.recommendedStructure}
                                    </span>
                                  </div>
                                )}

                                {/* Follow-ups */}
                                {dq.followUps && dq.followUps.length > 0 && (
                                  <div>
                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Likely Follow-ups</p>
                                    <ul className="space-y-1">
                                      {dq.followUps.map((f, i) => (
                                        <li key={i} className="text-sm text-slate-600 italic">
                                          &ldquo;{f}&rdquo;
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                {/* Action buttons */}
                                <div className="flex flex-wrap gap-2 pt-1">
                                  {!added && (
                                    <button
                                      onClick={(e) => { e.stopPropagation(); handleAddOne(dq); }}
                                      onTouchEnd={(e) => { e.stopPropagation(); e.preventDefault(); handleAddOne(dq); }}
                                      className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 active:bg-teal-800 transition-colors"
                                    >
                                      <Plus className="w-4 h-4" />
                                      Add to Bank
                                    </button>
                                  )}
                                  {onOpenAICoach && (
                                    <button
                                      onClick={(e) => { e.stopPropagation(); handlePracticeWithCoach(dq); }}
                                      onTouchEnd={(e) => { e.stopPropagation(); e.preventDefault(); handlePracticeWithCoach(dq); }}
                                      className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 active:bg-teal-800 transition-colors"
                                    >
                                      <Sparkles className="w-4 h-4" />
                                      Practice with AI Coach
                                    </button>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 border-t border-slate-200 bg-white px-4 py-3 sm:px-6">
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          <p className="text-sm text-slate-500">
            <span className="font-medium text-slate-800">{totalInBank}</span> question{totalInBank !== 1 ? 's' : ''} in your bank
          </p>
          <button
            onClick={onClose}
            className="rounded-lg bg-slate-100 px-5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 active:bg-slate-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
