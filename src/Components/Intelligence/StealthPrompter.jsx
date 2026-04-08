/**
 * StealthPrompter.jsx — Disguised live prompter for real interviews.
 *
 * Phase 4 Special: Makes the prompter look like a regular notes/document app.
 * When active, the UI mimics a simple note-taking interface while the AI
 * silently matches questions and displays talking points as "meeting notes."
 *
 * Toggle: Triple-tap the page title to reveal/hide the prompter overlay.
 *
 * Props: questions, matchQuestion (from parent), onExit
 */

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';

const STEALTH_THEMES = [
  {
    id: 'notes',
    appName: 'Notes',
    docTitle: 'Meeting Notes — General',
    placeholder: 'Start typing your notes...',
    bg: 'bg-white',
    accent: '#f5c542',
    headerBg: 'bg-yellow-50 border-b border-yellow-100',
    textColor: 'text-gray-800',
  },
  {
    id: 'docs',
    appName: 'Docs',
    docTitle: 'Untitled Document',
    placeholder: 'Type something...',
    bg: 'bg-white',
    accent: '#4285f4',
    headerBg: 'bg-blue-50 border-b border-blue-100',
    textColor: 'text-gray-900',
  },
  {
    id: 'agenda',
    appName: 'Calendar',
    docTitle: 'Interview Agenda',
    placeholder: 'Add notes for this event...',
    bg: 'bg-gray-50',
    accent: '#34a853',
    headerBg: 'bg-white border-b border-gray-200',
    textColor: 'text-gray-800',
  },
];

// Load portfolio from localStorage
function loadPortfolio() {
  try {
    const raw = localStorage.getItem('isl_portfolio');
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(p => p.isAnalyzed) : [];
  } catch { return []; }
}

// Find portfolio projects relevant to a question (same logic as AnswerForge)
function findRelevantProjects(question, projects) {
  if (!projects.length || !question) return [];
  const qWords = new Set(
    (question.question + ' ' + (question.keywords || []).join(' ') + ' ' + (question.category || ''))
      .toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(w => w.length > 3)
  );
  return projects
    .map(p => {
      const pText = `${p.title} ${p.aiSummary || ''} ${(p.keySkills || []).join(' ')}`.toLowerCase();
      const pWords = pText.replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(w => w.length > 3);
      const overlap = pWords.filter(w => qWords.has(w)).length;
      return { ...p, relevance: overlap };
    })
    .filter(p => p.relevance > 0)
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, 3);
}

function StealthPrompter({ questions = [], matchQuestion, onExit, getUserContext }) {
  const [theme, setTheme] = useState(STEALTH_THEMES[0]);
  const [fakeNotes, setFakeNotes] = useState('');
  const [matchedQ, setMatchedQ] = useState(null);
  const [portfolio] = useState(loadPortfolio);
  const [searchText, setSearchText] = useState('');
  const [isRevealed, setIsRevealed] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [opacity, setOpacity] = useState(0.92);
  const [bulletSize, setBulletSize] = useState('normal'); // 'compact', 'normal', 'large'
  const [showHint, setShowHint] = useState(() => {
    try { return !localStorage.getItem('stealth_hint_dismissed'); } catch { return true; }
  });

  // Triple-tap detection for title
  const tapCountRef = useRef(0);
  const tapTimerRef = useRef(null);

  const ctx = useMemo(() => getUserContext ? getUserContext() : {}, [getUserContext]);

  const handleTitleTap = useCallback((e) => {
    // Prevent double-fire on touch devices (touchend + click)
    if (e.type === 'touchend') e.preventDefault();
    tapCountRef.current++;
    if (tapTimerRef.current) clearTimeout(tapTimerRef.current);

    if (tapCountRef.current >= 3) {
      setIsRevealed(prev => !prev);
      tapCountRef.current = 0;
      return;
    }

    tapTimerRef.current = setTimeout(() => {
      tapCountRef.current = 0;
    }, 500);
  }, []);

  // Cleanup tap timer on unmount
  useEffect(() => {
    return () => { if (tapTimerRef.current) clearTimeout(tapTimerRef.current); };
  }, []);

  // Local question matching (fuzzy keyword match)
  const localMatch = useCallback((text) => {
    if (!text || text.length < 3) return null;
    const words = text.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    let bestMatch = null;
    let bestScore = 0;

    for (const q of questions) {
      const qWords = (q.question + ' ' + (q.keywords || []).join(' ')).toLowerCase();
      let score = 0;
      for (const word of words) {
        if (qWords.includes(word)) score++;
      }
      const pct = words.length > 0 ? (score / words.length) * 100 : 0;
      if (pct > bestScore && pct >= 25) {
        bestScore = pct;
        bestMatch = q;
      }
    }
    return bestMatch;
  }, [questions]);

  const handleSearch = useCallback(() => {
    if (!searchText.trim()) return;
    const matched = localMatch(searchText);
    if (matched) setMatchedQ(matched);
    setSearchText('');
  }, [searchText, localMatch]);

  // Keyboard shortcut: Ctrl/Cmd + K to focus search, Escape to dismiss (prioritized)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('stealth-search')?.focus();
      }
      if (e.key === 'Escape') {
        // Priority: close settings first, then clear matched question
        if (showSettings) setShowSettings(false);
        else if (matchedQ) setMatchedQ(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showSettings, matchedQ]);

  const bulletTextSize = bulletSize === 'compact' ? 'text-sm' : bulletSize === 'large' ? 'text-xl' : 'text-base';
  const bulletSpacing = bulletSize === 'compact' ? 'space-y-1' : bulletSize === 'large' ? 'space-y-4' : 'space-y-2';

  return (
    <div className={`min-h-screen ${theme.bg}`}>
      {/* Fake app header */}
      <div className={`${theme.headerBg} sticky top-0 z-20`}>
        <div className="max-w-3xl mx-auto px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onExit}
              onTouchEnd={(e) => { e.preventDefault(); onExit(); }}
              className="text-gray-400 hover:text-gray-600 text-sm p-1"
            >
              ‹ Back
            </button>
            <div className="h-4 w-px bg-gray-200" />
            <h1
              onClick={handleTitleTap}
              onTouchEnd={handleTitleTap}
              className={`text-sm font-medium ${theme.textColor} select-none cursor-default`}
            >
              {theme.docTitle}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {isRevealed && (
              <button
                onClick={() => setShowSettings(!showSettings)}
                onTouchEnd={(e) => { e.preventDefault(); setShowSettings(!showSettings); }}
                className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1.5"
              >
                ⚙
              </button>
            )}
            <span className="text-xs text-gray-400">
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
      </div>

      {/* Settings panel (only visible when revealed) */}
      {isRevealed && showSettings && (
        <div className="max-w-3xl mx-auto px-4 py-3 bg-gray-50 border-b border-gray-200">
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-gray-500 font-medium">Theme:</span>
              {STEALTH_THEMES.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t)}
                  className={`px-2 py-1 rounded ${theme.id === t.id ? 'bg-teal-100 text-teal-700 font-bold' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  {t.appName}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500 font-medium">Size:</span>
              {['compact', 'normal', 'large'].map(s => (
                <button
                  key={s}
                  onClick={() => setBulletSize(s)}
                  className={`px-2 py-1 rounded capitalize ${bulletSize === s ? 'bg-teal-100 text-teal-700 font-bold' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500 font-medium">Opacity:</span>
              <input
                type="range"
                min="0.3"
                max="1"
                step="0.05"
                value={opacity}
                onChange={(e) => setOpacity(parseFloat(e.target.value))}
                className="w-20 accent-teal-500"
              />
            </div>
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* First-use hint — dismiss once, never show again */}
        {showHint && !isRevealed && (
          <div className="mb-4 bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-start gap-2.5">
            <span className="text-gray-400 mt-0.5 flex-shrink-0">💡</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-600 leading-relaxed">
                This looks like a notes app but it&apos;s your secret prompter. Type keywords in the search bar to match interview questions. Triple-tap the title above for advanced controls.
              </p>
            </div>
            <button
              onClick={() => { setShowHint(false); try { localStorage.setItem('stealth_hint_dismissed', '1'); } catch {} }}
              className="text-[10px] text-gray-400 hover:text-gray-600 flex-shrink-0"
            >
              Got it
            </button>
          </div>
        )}

        {/* Search bar — always visible, looks like a normal note search */}
        <div className="mb-4">
          <div className="relative">
            <input
              id="stealth-search"
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSearch();
              }}
              placeholder={isRevealed ? "Type question keywords to match..." : "Search notes..."}
              className="w-full bg-gray-100 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-gray-300 focus:ring-1 focus:ring-gray-300"
            />
            <button
              onClick={handleSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs px-2 py-1"
            >
              {isRevealed ? '🔍' : '⌘K'}
            </button>
          </div>
        </div>

        {/* Matched question — displayed as "notes" */}
        {matchedQ && (
          <div
            className="mb-6 rounded-lg border border-gray-200 overflow-hidden transition-all"
            style={{ opacity }}
          >
            {/* Question as note heading */}
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
              <p className={`font-medium ${theme.textColor} ${bulletSize === 'large' ? 'text-lg' : 'text-sm'}`}>
                {isRevealed ? '📌 ' : ''}{matchedQ.question}
              </p>
              {matchedQ.category && isRevealed && (
                <span className="text-[10px] text-gray-400 mt-0.5">{matchedQ.category}</span>
              )}
            </div>

            {/* Bullets as note body */}
            <div className="px-4 py-3">
              <ul className={bulletSpacing}>
                {matchedQ.bullets?.filter(b => b).map((bullet, i) => (
                  <li key={i} className={`flex items-start gap-2 ${bulletTextSize} ${theme.textColor}`}>
                    <span className="text-gray-400 mt-0.5 flex-shrink-0">•</span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>

              {/* Narrative (collapsed by default, click to expand) */}
              {matchedQ.narrative && (
                <NarrativeToggle narrative={matchedQ.narrative} textSize={bulletTextSize} textColor={theme.textColor} />
              )}

              {/* Follow-up ammo (collapsed by default) */}
              {matchedQ.followUps?.length > 0 && (
                <FollowUpToggle followUps={matchedQ.followUps} textSize={bulletTextSize} textColor={theme.textColor} isRevealed={isRevealed} />
              )}

              {/* Portfolio project summaries (collapsed by default) */}
              {(() => {
                const relevant = findRelevantProjects(matchedQ, portfolio);
                return relevant.length > 0 ? (
                  <ProjectToggle projects={relevant} textSize={bulletTextSize} textColor={theme.textColor} isRevealed={isRevealed} />
                ) : null;
              })()}
            </div>

            {/* Dismiss */}
            <div className="px-4 py-2 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setMatchedQ(null)}
                onTouchEnd={(e) => { e.preventDefault(); setMatchedQ(null); }}
                className="text-xs text-gray-400 hover:text-gray-600 p-1.5"
              >
                {isRevealed ? 'Clear ✕' : 'Done'}
              </button>
            </div>
          </div>
        )}

        {/* Quick Browse — scroll through questions (only when revealed) */}
        {isRevealed && !matchedQ && questions.length > 0 && (
          <div className="mb-4 border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-3 py-2 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
              <span className="text-xs text-gray-500 font-medium">Quick Browse</span>
              <span className="text-[10px] text-gray-400">Tap any question</span>
            </div>
            <div className="max-h-48 overflow-y-auto divide-y divide-gray-100">
              {questions.map((q, i) => (
                <button
                  key={q.id || i}
                  onClick={() => setMatchedQ(q)}
                  onTouchEnd={(e) => { e.preventDefault(); setMatchedQ(q); }}
                  className="w-full text-left px-3 py-2.5 hover:bg-gray-50 transition-colors"
                >
                  <p className="text-xs text-gray-700 line-clamp-1">{q.question}</p>
                  {q.category && <span className="text-[9px] text-gray-400">{q.category}</span>}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Fake note area — looks like user's own typing */}
        <div className="mb-4">
          <textarea
            value={fakeNotes}
            onChange={(e) => setFakeNotes(e.target.value)}
            placeholder={theme.placeholder}
            rows={isRevealed && !matchedQ ? 6 : 12}
            className={`w-full bg-transparent border-none outline-none resize-none ${theme.textColor} text-sm leading-relaxed placeholder-gray-300`}
            style={{ caretColor: theme.accent }}
          />
        </div>

        {/* Status bar — subtle indicator only when revealed */}
        {isRevealed && (
          <div className="fixed bottom-0 left-0 right-0 bg-gray-50 border-t border-gray-200 px-4 py-1.5">
            <div className="max-w-3xl mx-auto flex items-center justify-between text-[10px] text-gray-400">
              <span>
                {questions.length} questions loaded
                {matchedQ && ` · Matched: "${matchedQ.question.substring(0, 30)}..."`}
              </span>
              <span>Triple-tap title to toggle · ⌘K to search · Esc to clear</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function NarrativeToggle({ narrative, textSize, textColor }) {
  const [show, setShow] = useState(false);

  return (
    <div className="mt-2">
      <button
        onClick={() => setShow(!show)}
        onTouchEnd={(e) => { e.preventDefault(); setShow(!show); }}
        className="text-xs text-gray-400 hover:text-gray-600 p-1"
      >
        {show ? '▾ Less' : '▸ More details'}
      </button>
      {show && (
        <p className={`mt-1.5 ${textSize} ${textColor} opacity-80 leading-relaxed whitespace-pre-line`}>
          {narrative}
        </p>
      )}
    </div>
  );
}

function FollowUpToggle({ followUps, textSize, textColor, isRevealed }) {
  const [show, setShow] = useState(false);

  return (
    <div className="mt-2">
      <button
        onClick={() => setShow(!show)}
        onTouchEnd={(e) => { e.preventDefault(); setShow(!show); }}
        className="text-xs text-gray-400 hover:text-gray-600 p-1"
      >
        {show ? '▾ Hide follow-ups' : `▸ ${isRevealed ? 'Follow-up ammo' : 'Related notes'} (${followUps.length})`}
      </button>
      {show && (
        <div className="mt-1.5 space-y-2">
          {followUps.map((fu, i) => (
            <div key={i} className="pl-2 border-l-2 border-gray-200">
              <p className={`${textSize} font-medium ${textColor}`}>
                {typeof fu === 'string' ? fu : fu.question || fu}
              </p>
              {fu.proof && (
                <p className={`${textSize} text-gray-400 mt-0.5`}>→ {fu.proof}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ProjectToggle({ projects, textSize, textColor, isRevealed }) {
  const [show, setShow] = useState(false);

  return (
    <div className="mt-2">
      <button
        onClick={() => setShow(!show)}
        onTouchEnd={(e) => { e.preventDefault(); setShow(!show); }}
        className="text-xs text-gray-400 hover:text-gray-600 p-1"
      >
        {show ? '▾ Hide projects' : `▸ ${isRevealed ? 'Portfolio proof' : 'Reference material'} (${projects.length})`}
      </button>
      {show && (
        <div className="mt-1.5 space-y-2.5">
          {projects.map((p, i) => (
            <div key={i} className="pl-2 border-l-2 border-blue-200">
              <p className={`${textSize} font-medium ${textColor}`}>
                {p.title}
              </p>
              {p.aiSummary && (
                <p className={`${textSize} text-gray-500 mt-0.5 leading-relaxed`}>
                  {p.aiSummary.slice(0, 200)}{p.aiSummary.length > 200 ? '...' : ''}
                </p>
              )}
              {p.keySkills?.length > 0 && (
                <p className={`${textSize} text-gray-400 mt-0.5`}>
                  {p.keySkills.slice(0, 5).join(' · ')}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default StealthPrompter;
