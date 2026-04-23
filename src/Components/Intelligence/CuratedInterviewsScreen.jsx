import React, { useState } from 'react';
import { ArrowLeft, X, ChevronRight, BookOpen } from 'lucide-react';
import { getCuratedInterviewsByFormat } from '../../utils/curatedInterviews';

const difficultyColors = {
  easy: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  medium: 'bg-amber-50 text-amber-700 border border-amber-200',
  hard: 'bg-rose-50 text-rose-700 border border-rose-200',
};

const CuratedInterviewsScreen = ({ isOpen, format, onBack, onStart, sessionSeed }) => {
  const [shownIds, setShownIds] = useState(new Set());

  if (!isOpen) return null;
  if (!format) return null;

  const interviews = getCuratedInterviewsByFormat(format.id);

  const toggleShowQuestions = (id) => {
    setShownIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBack = () => {
    if (onBack) onBack();
  };

  const handleStart = (interview) => {
    if (onStart) onStart(interview, sessionSeed);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-start p-4 overflow-y-auto"
      onClick={handleBack}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full my-8 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={handleBack}
            onTouchEnd={(e) => { e.preventDefault(); handleBack(); }}
            className="flex items-center gap-1 text-slate-500 hover:text-slate-800 transition-colors"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back</span>
          </button>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-teal-600" />
            Choose Your {format.name}
          </h2>
          <button
            onClick={handleBack}
            onTouchEnd={(e) => { e.preventDefault(); handleBack(); }}
            className="text-slate-400 hover:text-slate-700 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Empty state */}
        {interviews.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-slate-600 mb-4">No curated interviews for this format yet.</p>
            <button
              onClick={handleBack}
              onTouchEnd={(e) => { e.preventDefault(); handleBack(); }}
              className="bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4 inline mr-1" />
              Back to formats
            </button>
          </div>
        ) : (
          <>
            <p className="text-xs text-slate-500 mb-4">
              {interviews.length} curated interview{interviews.length === 1 ? '' : 's'} for this format
            </p>

            <div className="space-y-4">
              {interviews.map((interview) => (
                <div
                  key={interview.id}
                  className="border-2 border-slate-200 hover:border-teal-300 rounded-xl p-4 transition-colors"
                >
                  {/* Top row: title + difficulty + duration */}
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="text-lg font-bold text-slate-800">{interview.title}</h3>
                    <div className="flex gap-2 flex-shrink-0 items-center">
                      <span className="text-[10px] uppercase font-bold text-slate-500">
                        {interview.duration}
                      </span>
                      <span
                        className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${difficultyColors[interview.difficulty] || difficultyColors.medium}`}
                      >
                        {interview.difficulty}
                      </span>
                    </div>
                  </div>

                  {/* Summary */}
                  <p className="text-sm text-slate-600 mb-2 leading-relaxed">{interview.summary}</p>

                  {/* Who it's for */}
                  {interview.whoItsFor && (
                    <p className="text-xs text-slate-500 italic mb-3">{interview.whoItsFor}</p>
                  )}

                  {/* Insider tip */}
                  {interview.insiderTip && (
                    <div className="bg-teal-50 border-l-2 border-teal-400 px-3 py-2 mb-3 rounded-r">
                      <p className="text-xs text-teal-800">
                        <span className="font-semibold">Insider tip:</span> {interview.insiderTip}
                      </p>
                    </div>
                  )}

                  {/* Show Questions toggle */}
                  <button
                    onClick={() => toggleShowQuestions(interview.id)}
                    onTouchEnd={(e) => { e.preventDefault(); toggleShowQuestions(interview.id); }}
                    className="text-xs text-slate-500 hover:text-teal-700 underline"
                  >
                    {shownIds.has(interview.id)
                      ? 'Hide questions'
                      : `Show ${interview.questions.length} questions (spoiler)`}
                  </button>

                  {shownIds.has(interview.id) && (
                    <div className="mt-3 pl-3 border-l-2 border-slate-200">
                      <p className="text-[10px] uppercase font-bold text-slate-400 mb-2">
                        Question flow:
                      </p>
                      <ol className="space-y-2">
                        {interview.questions.map((q, idx) => (
                          <li key={idx} className="text-xs text-slate-700">
                            <span className="font-semibold">
                              {idx + 1}. {q.topic}
                            </span>
                            <span className="block text-slate-500 italic mt-0.5">
                              "{q.suggestedText}"
                            </span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {/* Begin button */}
                  <button
                    onClick={() => handleStart(interview)}
                    onTouchEnd={(e) => { e.preventDefault(); handleStart(interview); }}
                    className="mt-4 w-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-semibold py-2.5 px-4 rounded-lg transition-all shadow-sm hover:shadow-md active:scale-[0.98] flex items-center justify-center gap-1"
                  >
                    Begin Interview <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CuratedInterviewsScreen;
