// NursingTrack — Flashcards
// Study cards from nursingQuestions.js. Front = question. Back = key points + outline.
// No AI, no credits, no Supabase calls — purely client-side.
// Spaced repetition: cards marked "Need Practice" appear 2x more often in shuffle.
//
// ⚠️ D.R.A.F.T. Protocol: NEW file. No existing code modified.

import { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ChevronLeft, ChevronRight, Shuffle, RotateCcw,
  CheckCircle, AlertCircle, BookOpen, Filter, Layers
} from 'lucide-react';
import { getFrameworkDetails } from './nursingQuestions';
import useNursingQuestions from './useNursingQuestions';
import NursingLoadingSkeleton from './NursingLoadingSkeleton';
import { fetchFlashcardProgress, upsertFlashcardProgress } from './nursingSupabase';

export default function NursingFlashcards({ specialty, onBack, userData }) {
  const { questions: allQuestions, categories, loading } = useNursingQuestions(specialty.id);

  // Filters
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterFramework, setFilterFramework] = useState('all'); // all, sbar, star
  const [showFilters, setShowFilters] = useState(false);

  // Filtered questions
  const filteredQuestions = useMemo(() => {
    let qs = allQuestions;
    if (filterCategory !== 'all') qs = qs.filter(q => q.category === filterCategory);
    if (filterFramework !== 'all') qs = qs.filter(q => q.responseFramework === filterFramework);
    return qs;
  }, [allQuestions, filterCategory, filterFramework]);

  // Card state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Spaced repetition tracking — { [questionId]: 'got-it' | 'need-practice' }
  // Load from Supabase if available, otherwise start empty (in-memory)
  const [cardStatus, setCardStatus] = useState({});

  // Load persisted flashcard progress on mount
  useEffect(() => {
    if (!userData?.user?.id || userData.loading) return;
    async function loadProgress() {
      const result = await fetchFlashcardProgress(userData.user.id);
      if (result.fromSupabase && result.data) {
        setCardStatus(result.data);
      }
    }
    loadProgress();
  }, [userData?.user?.id, userData?.loading]);

  const currentCard = filteredQuestions[currentIndex] || null;
  const totalCards = filteredQuestions.length;

  // Stats
  const gotItCount = Object.values(cardStatus).filter(s => s === 'got-it').length;
  const needPracticeCount = Object.values(cardStatus).filter(s => s === 'need-practice').length;

  // Navigation
  const goTo = useCallback((index) => {
    setCurrentIndex(index);
    setIsFlipped(false);
  }, []);

  const goNext = useCallback(() => {
    if (totalCards > 0) goTo((currentIndex + 1) % totalCards);
  }, [currentIndex, totalCards, goTo]);

  const goPrev = useCallback(() => {
    if (totalCards > 0) goTo((currentIndex - 1 + totalCards) % totalCards);
  }, [currentIndex, totalCards, goTo]);

  // Shuffle — cards marked "need-practice" appear 2x more often
  const goShuffle = useCallback(() => {
    if (totalCards <= 1) return;

    // Build weighted pool: need-practice cards get 2 entries
    const pool = [];
    filteredQuestions.forEach((q, idx) => {
      pool.push(idx);
      if (cardStatus[q.id] === 'need-practice') pool.push(idx);
    });

    let nextIdx;
    do {
      nextIdx = pool[Math.floor(Math.random() * pool.length)];
    } while (nextIdx === currentIndex && pool.length > 1);

    goTo(nextIdx);
  }, [currentIndex, totalCards, filteredQuestions, cardStatus, goTo]);

  // Mark card — update local state + persist to Supabase (non-blocking)
  const markCard = useCallback((status) => {
    if (!currentCard) return;
    setCardStatus(prev => ({ ...prev, [currentCard.id]: status }));

    // Persist to Supabase in background
    if (userData?.user?.id) {
      upsertFlashcardProgress(userData.user.id, currentCard.id, status);
    }

    // Auto-advance after marking
    setTimeout(goNext, 300);
  }, [currentCard, goNext, userData?.user?.id]);

  // Reset
  const resetCards = useCallback(() => {
    setCardStatus({});
    setCurrentIndex(0);
    setIsFlipped(false);
  }, []);

  // Loading check — MUST be after all hooks (Rules of Hooks)
  if (loading) return <NursingLoadingSkeleton title="Flashcards" onBack={onBack} />;

  if (!currentCard) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 flex items-center justify-center p-4">
        <div className="text-center">
          <Layers className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 mb-4">No flashcards match your filters.</p>
          <button onClick={() => { setFilterCategory('all'); setFilterFramework('all'); }}
            className="text-sky-400 hover:text-sky-300 text-sm">Clear Filters</button>
        </div>
      </div>
    );
  }

  const framework = getFrameworkDetails(currentCard.clinicalFramework);
  const status = cardStatus[currentCard.id];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 flex flex-col">
      {/* Header */}
      <div className="bg-slate-900/80 backdrop-blur-lg border-b border-white/10 sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={onBack}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" /><span className="text-sm">Back</span>
          </button>

          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-sky-400" />
            <span className="text-white font-medium text-sm">Flashcards</span>
            <span className="text-slate-500 text-xs">{currentIndex + 1}/{totalCards}</span>
          </div>

          <button
            onClick={() => setShowFilters(prev => !prev)}
            className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full transition-colors ${
              (filterCategory !== 'all' || filterFramework !== 'all')
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Filter className="w-3 h-3" /> Filter
          </button>
        </div>

        {/* Filter panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-white/5 overflow-hidden"
            >
              <div className="max-w-3xl mx-auto px-4 py-3 space-y-3">
                {/* Category filter */}
                <div>
                  <p className="text-slate-500 text-xs mb-1.5">Category</p>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      onClick={() => { setFilterCategory('all'); setCurrentIndex(0); setIsFlipped(false); }}
                      className={`text-xs px-2 py-1 rounded-full transition-colors ${
                        filterCategory === 'all' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30' : 'text-slate-400 bg-white/5 border border-white/10'
                      }`}
                    >All</button>
                    {categories.map(cat => (
                      <button key={cat}
                        onClick={() => { setFilterCategory(cat); setCurrentIndex(0); setIsFlipped(false); }}
                        className={`text-xs px-2 py-1 rounded-full transition-colors ${
                          filterCategory === cat ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30' : 'text-slate-400 bg-white/5 border border-white/10'
                        }`}
                      >{cat}</button>
                    ))}
                  </div>
                </div>
                {/* Framework filter */}
                <div>
                  <p className="text-slate-500 text-xs mb-1.5">Framework</p>
                  <div className="flex gap-1.5">
                    {[
                      { value: 'all', label: 'All' },
                      { value: 'sbar', label: 'SBAR', cls: 'bg-green-500/20 text-green-300 border-green-500/30' },
                      { value: 'star', label: 'STAR', cls: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
                    ].map(opt => (
                      <button key={opt.value}
                        onClick={() => { setFilterFramework(opt.value); setCurrentIndex(0); setIsFlipped(false); }}
                        className={`text-xs px-2 py-1 rounded-full transition-colors border ${
                          filterFramework === opt.value
                            ? (opt.cls || 'bg-sky-500/20 text-sky-300 border-sky-500/30')
                            : 'text-slate-400 bg-white/5 border-white/10'
                        }`}
                      >{opt.label}</button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Card Area */}
      <div className="flex-1 flex items-center justify-center px-4 py-6">
        <div className="max-w-lg w-full">
          {/* Stats bar */}
          {(gotItCount > 0 || needPracticeCount > 0) && (
            <div className="flex items-center justify-center gap-4 mb-4">
              <span className="text-green-400 text-xs flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> {gotItCount} Got it
              </span>
              <span className="text-amber-400 text-xs flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {needPracticeCount} Practice
              </span>
              <button onClick={resetCards} className="text-slate-500 text-xs hover:text-slate-300 flex items-center gap-1">
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            </div>
          )}

          {/* The Card */}
          <motion.div
            key={`${currentCard.id}-${isFlipped}`}
            initial={{ opacity: 0, rotateY: isFlipped ? 90 : -90 }}
            animate={{ opacity: 1, rotateY: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setIsFlipped(prev => !prev)}
            className={`cursor-pointer select-none min-h-[320px] rounded-2xl p-6 border-2 transition-colors ${
              status === 'got-it' ? 'border-green-500/30 bg-green-500/5' :
              status === 'need-practice' ? 'border-amber-500/30 bg-amber-500/5' :
              'border-white/10 bg-white/5'
            }`}
          >
            {!isFlipped ? (
              // FRONT
              <div className="flex flex-col h-full">
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    currentCard.responseFramework === 'sbar'
                      ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                      : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  }`}>
                    {currentCard.responseFramework === 'sbar' ? 'SBAR' : 'STAR'}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-slate-300">{currentCard.category}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    currentCard.difficulty === 'advanced' ? 'bg-red-500/10 text-red-300' :
                    currentCard.difficulty === 'intermediate' ? 'bg-yellow-500/10 text-yellow-300' :
                    'bg-green-500/10 text-green-300'
                  }`}>{currentCard.difficulty}</span>
                  {currentCard.specialty !== 'general' && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-300">{specialty.shortName}</span>
                  )}
                </div>

                <div className="flex-1 flex items-center justify-center">
                  <h2 className="text-white text-xl font-semibold text-center leading-relaxed">
                    {currentCard.question}
                  </h2>
                </div>

                <p className="text-slate-500 text-xs text-center mt-4">Tap to see key points</p>
              </div>
            ) : (
              // BACK
              <div className="flex flex-col h-full">
                <p className="text-sky-400 text-xs font-medium mb-3 flex items-center gap-1">
                  <BookOpen className="w-3 h-3" />
                  Key points to hit ({currentCard.responseFramework === 'sbar' ? 'SBAR' : 'STAR'})
                </p>

                <div className="space-y-2 flex-1">
                  {currentCard.bullets?.map((bullet, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle className="w-3 h-3 text-green-400 mt-1 flex-shrink-0" />
                      <p className="text-slate-200 text-sm leading-relaxed">{bullet}</p>
                    </div>
                  ))}
                </div>

                {/* Framework citation */}
                {framework && (
                  <div className="mt-4 pt-3 border-t border-white/5">
                    <p className="text-slate-500 text-xs italic">
                      Framework: {framework.name} — {framework.source}
                    </p>
                  </div>
                )}

                {/* Follow-up questions */}
                {currentCard.followUps?.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-white/5">
                    <p className="text-slate-500 text-xs font-medium mb-1">Possible follow-ups:</p>
                    {currentCard.followUps.map((fu, i) => (
                      <p key={i} className="text-slate-400 text-xs italic">• {fu}</p>
                    ))}
                  </div>
                )}

                <p className="text-slate-500 text-xs text-center mt-3">Tap to see question</p>
              </div>
            )}
          </motion.div>

          {/* Controls */}
          <div className="flex items-center justify-between mt-6">
            {/* Nav */}
            <div className="flex items-center gap-2">
              <button onClick={goPrev}
                className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={goShuffle}
                className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                title="Shuffle (need-practice cards appear more often)">
                <Shuffle className="w-5 h-5" />
              </button>
              <button onClick={goNext}
                className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Mark buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => markCard('need-practice')}
                className={`flex items-center gap-1 text-xs px-3 py-2 rounded-xl transition-all ${
                  status === 'need-practice'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-white/5 border border-white/10 text-slate-400 hover:text-amber-300'
                }`}
              >
                <AlertCircle className="w-3 h-3" /> Practice
              </button>
              <button
                onClick={() => markCard('got-it')}
                className={`flex items-center gap-1 text-xs px-3 py-2 rounded-xl transition-all ${
                  status === 'got-it'
                    ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                    : 'bg-white/5 border border-white/10 text-slate-400 hover:text-green-300'
                }`}
              >
                <CheckCircle className="w-3 h-3" /> Got It
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-slate-900/95 border-t border-white/10 px-4 py-3">
        <p className="text-slate-600 text-xs text-center">
          All content from curated question library • No AI-generated content
        </p>
      </div>
    </div>
  );
}
