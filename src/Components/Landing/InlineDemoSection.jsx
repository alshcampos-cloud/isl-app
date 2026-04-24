import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Lock, RefreshCw, AlertTriangle, ArrowRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { fetchWithRetry } from '../../utils/fetchWithRetry';

/**
 * InlineDemoSection
 *
 * Inline interactive AI demo on the landing page. Anonymous visitors get
 * one real AI feedback call per day — no sign-up required. This is the
 * "try it right now" moment that converts browsers into believers.
 *
 * Key design decisions:
 * - Reuses the existing `ai-feedback` Edge Function with mode `'onboarding-general'`
 *   which explicitly allows `is_anonymous === true` and skips usage tracking.
 * - Uses `supabase.auth.signInAnonymously()` (idempotent) to establish a session.
 * - Rate limit is client-side (localStorage `isl_demo_used_date`) — not a security
 *   control, a cost control. The Edge Function has its own global rate limits.
 * - On error, falls back to a clearly-labeled SAMPLE so visitors still see what
 *   the product output looks like.
 *
 * DOES NOT charge usage, modify auth flow, or touch the Edge Function.
 */

const DEMO_QUESTION = 'Tell me about a time you led a team through a difficult challenge.';
const DEMO_STORAGE_KEY = 'isl_demo_used_date';

// Curated high-quality sample shown when the real AI call fails.
// Clearly labeled as "Sample feedback" in the UI so visitors know the difference.
const FALLBACK_SAMPLE = {
  score: 7,
  feedback: `Strong structure — you used the STAR framework well by clearly identifying the Situation (your team's deadline) and your Action (reassigning priorities). Two specific improvements:

• Add more on the Task — what EXACTLY was at stake if you missed the deadline? Quantify it.
• The Result is light. "We got it done" works but doesn't sell you. Did you hit the deadline early? Did you reduce scope? What did leadership say?

Overall: solid answer for a first pass. Now practice tightening the middle.`,
};

const LOADING_MESSAGES = [
  'Reading your answer...',
  'Scoring structure...',
  'Drafting feedback...',
];

function getTodayDateString() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function readStoredDemo() {
  try {
    const raw = localStorage.getItem(DEMO_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeStoredDemo(payload) {
  try {
    localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // localStorage may be blocked (private mode) — fail quietly
  }
}

export default function InlineDemoSection() {
  // view: 'idle' | 'loading' | 'feedback' | 'rate-limited' | 'error'
  const [view, setView] = useState('idle');
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(null);
  const [storedAnswer, setStoredAnswer] = useState('');
  const [isSample, setIsSample] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(LOADING_MESSAGES[0]);
  const loadingIntervalRef = useRef(null);

  // On mount: check if they've already used their demo today
  useEffect(() => {
    const stored = readStoredDemo();
    if (stored && stored.date === getTodayDateString()) {
      setScore(stored.score ?? 0);
      setFeedback(stored.feedback || '');
      setStoredAnswer(stored.answer || '');
      setUserAnswer(stored.answer || '');
      setIsSample(Boolean(stored.isSample));
      setView('rate-limited');
    }
  }, []);

  // Ensure we have an anonymous session available (fire-and-forget on mount).
  // Idempotent — no-op if a session already exists.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session && !cancelled) {
          // signInAnonymously is the supabase-js v2 method for creating
          // an anonymous user without email/password.
          await supabase.auth.signInAnonymously();
        }
      } catch (err) {
        // Non-fatal — we'll retry inside submitAnswer if needed.
        console.warn('[InlineDemo] Anonymous auth warm-up failed:', err?.message);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Rotate loading messages while waiting
  useEffect(() => {
    if (view === 'loading') {
      let idx = 0;
      setLoadingMessage(LOADING_MESSAGES[0]);
      loadingIntervalRef.current = setInterval(() => {
        idx = (idx + 1) % LOADING_MESSAGES.length;
        setLoadingMessage(LOADING_MESSAGES[idx]);
      }, 1800);
    } else if (loadingIntervalRef.current) {
      clearInterval(loadingIntervalRef.current);
      loadingIntervalRef.current = null;
    }
    return () => {
      if (loadingIntervalRef.current) {
        clearInterval(loadingIntervalRef.current);
        loadingIntervalRef.current = null;
      }
    };
  }, [view]);

  const charCount = userAnswer.trim().length;
  const canSubmit = charCount >= 1 && view === 'idle';

  async function handleSubmit() {
    if (!userAnswer.trim() || view !== 'idle') return;

    // Double-check rate limit right before firing
    const stored = readStoredDemo();
    if (stored && stored.date === getTodayDateString()) {
      setScore(stored.score ?? 0);
      setFeedback(stored.feedback || '');
      setStoredAnswer(stored.answer || '');
      setIsSample(Boolean(stored.isSample));
      setView('rate-limited');
      return;
    }

    setView('loading');

    try {
      // Ensure session exists (retry auth if warm-up failed)
      let { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        const { data, error } = await supabase.auth.signInAnonymously();
        if (error) throw error;
        session = data?.session;
      }
      if (!session) throw new Error('Could not establish anonymous session');

      const response = await fetchWithRetry(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-feedback`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            mode: 'onboarding-general',
            userMessage: `Question: ${DEMO_QUESTION}\n\nAnswer: ${userAnswer.trim()}`,
          }),
        },
        3,
        20000, // 20s per-attempt cap per spec
      );

      if (!response.ok) {
        const errText = await response.text().catch(() => '');
        console.error('[InlineDemo] ai-feedback failed:', response.status, errText);
        throw new Error(`Feedback failed: ${response.status}`);
      }

      const data = await response.json();
      const rawContent = data.content?.[0]?.text || data.response || data.feedback || '';
      if (!rawContent) throw new Error('Empty response from feedback service');

      // Parse [SCORE: X/10] from the response
      const scoreMatch = rawContent.match(/\[SCORE:\s*(\d+)\s*\/\s*10\]/);
      let parsedScore = scoreMatch ? parseInt(scoreMatch[1], 10) : 3;

      // Trivial-answer guardrail (matches OnboardingPractice belt-and-suspenders pattern)
      const wordCount = userAnswer.trim().split(/\s+/).filter(Boolean).length;
      if (wordCount <= 3 && parsedScore > 2) parsedScore = 2;

      const cleanFeedback = rawContent.replace(/\[SCORE:\s*\d+\s*\/\s*10\]/g, '').trim();

      setScore(parsedScore);
      setFeedback(cleanFeedback);
      setIsSample(false);
      setView('feedback');

      writeStoredDemo({
        date: getTodayDateString(),
        answer: userAnswer.trim(),
        score: parsedScore,
        feedback: cleanFeedback,
        isSample: false,
      });
    } catch (err) {
      console.error('[InlineDemo] submit failed:', err);
      // Fallback to curated example — user still sees what the product looks like
      setScore(FALLBACK_SAMPLE.score);
      setFeedback(FALLBACK_SAMPLE.feedback);
      setIsSample(true);
      setView('error');
    }
  }

  function handleTryAnother() {
    // "Try another" still enforces the 1-per-day cap.
    const stored = readStoredDemo();
    if (stored && stored.date === getTodayDateString()) {
      setScore(stored.score ?? 0);
      setFeedback(stored.feedback || '');
      setStoredAnswer(stored.answer || '');
      setIsSample(Boolean(stored.isSample));
      setView('rate-limited');
    } else {
      setUserAnswer('');
      setFeedback(null);
      setScore(null);
      setIsSample(false);
      setView('idle');
    }
  }

  // Score color helper
  function scoreColorClasses(s) {
    if (s == null) return 'from-slate-400 to-slate-500 text-white';
    if (s >= 7) return 'from-emerald-500 to-teal-500 text-white';
    if (s >= 4) return 'from-amber-400 to-amber-500 text-white';
    return 'from-rose-500 to-red-500 text-white';
  }

  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          className="text-center mb-8 sm:mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-xs font-semibold uppercase tracking-wide mb-3">
            <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
            Live demo
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            Try it right now. No sign-up.
          </h2>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
            Answer one interview question. Get real AI feedback in 10 seconds. That's the product.
          </p>
        </motion.div>

        {/* Demo card */}
        <motion.div
          className="bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-200 shadow-lg p-5 sm:p-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {/* Question card (always visible) */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 mb-5">
            <p className="text-xs font-semibold text-teal-600 uppercase tracking-wide mb-2">
              Interview Question
            </p>
            <p className="text-slate-800 font-medium leading-relaxed text-base sm:text-lg">
              {DEMO_QUESTION}
            </p>
          </div>

          {/* IDLE state — textarea + submit */}
          {view === 'idle' && (
            <div>
              <textarea
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Your answer... 2-3 sentences is enough to start."
                className="w-full min-h-[120px] max-h-[300px] p-4 rounded-xl border border-slate-200 bg-white resize-y text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 leading-relaxed"
              />

              <div className="flex items-center justify-between mt-2 mb-4 text-xs text-slate-500">
                <span className={charCount >= 100 ? 'text-emerald-600 font-medium' : charCount >= 30 ? 'text-slate-500' : 'text-slate-400'}>
                  {charCount} characters
                  {charCount < 30 && ' (min 30)'}
                  {charCount >= 30 && charCount < 100 && ' (100+ recommended)'}
                  {charCount >= 100 && ' — nice'}
                </span>
              </div>

              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className={`w-full sm:w-auto px-6 py-3 rounded-xl font-semibold text-sm sm:text-base transition-all inline-flex items-center justify-center gap-2
                  ${canSubmit
                    ? 'bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white shadow-lg shadow-teal-600/20'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
              >
                Get AI feedback
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>

              <p className="text-xs text-slate-400 mt-4 flex items-center gap-1.5">
                <Lock className="w-3 h-3" aria-hidden="true" />
                You get 1 free demo per day. Sign up to practice unlimited.
              </p>
            </div>
          )}

          {/* LOADING state */}
          {view === 'loading' && (
            <div className="py-10 sm:py-12 text-center" aria-live="polite">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-teal-100 mb-4">
                <div className="w-6 h-6 border-[3px] border-teal-600 border-t-transparent rounded-full animate-spin" />
              </div>
              <p className="text-slate-700 font-medium text-base">{loadingMessage}</p>
              <div className="mt-5 space-y-2 max-w-md mx-auto">
                <div className="h-3 bg-slate-100 rounded animate-pulse" />
                <div className="h-3 bg-slate-100 rounded animate-pulse w-11/12" />
                <div className="h-3 bg-slate-100 rounded animate-pulse w-10/12" />
              </div>
            </div>
          )}

          {/* FEEDBACK state (real AI success) */}
          {view === 'feedback' && feedback && (
            <div className="animate-fadeIn">
              {/* Score card */}
              <div className="flex flex-col sm:flex-row items-stretch gap-4 mb-5">
                <div className={`flex-shrink-0 sm:w-32 rounded-xl bg-gradient-to-br ${scoreColorClasses(score)} p-4 flex flex-col items-center justify-center text-center shadow-md`}>
                  <div className="text-4xl sm:text-5xl font-black leading-none">{score}</div>
                  <div className="text-xs font-semibold opacity-90 mt-1">/ 10</div>
                </div>
                <div className="flex-1 bg-white rounded-xl border border-slate-200 p-4">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Your answer</p>
                  <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed">
                    {userAnswer.trim()}
                  </p>
                </div>
              </div>

              {/* Feedback body */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 mb-5 space-y-3">
                <p className="text-xs font-semibold text-teal-600 uppercase tracking-wide mb-2">
                  AI Feedback
                </p>
                {feedback.split('\n').filter((line) => line.trim()).map((para, i) => {
                  const trimmed = para.trim();
                  const isBullet = /^[•\-\*]\s/.test(trimmed);
                  if (isBullet) {
                    return (
                      <p key={i} className="text-slate-700 leading-relaxed text-sm pl-4 relative">
                        <span className="absolute left-0 text-teal-600">•</span>
                        {trimmed.replace(/^[•\-\*]\s/, '')}
                      </p>
                    );
                  }
                  return (
                    <p key={i} className="text-slate-700 leading-relaxed text-sm">
                      {trimmed}
                    </p>
                  );
                })}
              </div>

              {/* CTA box */}
              <div className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-xl p-5 text-white text-center">
                <p className="font-bold text-lg mb-1">Want unlimited practice?</p>
                <p className="text-sm text-teal-50 mb-4">Mock interviews, STAR coaching, and hundreds of questions.</p>
                <a
                  href="/onboarding"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-white text-teal-700 font-semibold text-sm hover:bg-slate-50 transition-colors shadow-md"
                >
                  Sign up free
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </a>
              </div>

              {/* Try another */}
              <button
                onClick={handleTryAnother}
                className="w-full mt-4 text-sm text-slate-500 hover:text-teal-600 font-medium inline-flex items-center justify-center gap-1.5 py-2"
              >
                <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
                Try another question
              </button>
            </div>
          )}

          {/* RATE-LIMITED state */}
          {view === 'rate-limited' && (
            <div className="animate-fadeIn">
              <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200 mb-5">
                <Lock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="font-semibold text-amber-900">You've used your free demo today.</p>
                  <p className="text-sm text-amber-800 mt-0.5">Here's your feedback from earlier — come back tomorrow for another free demo, or sign up to practice unlimited.</p>
                </div>
              </div>

              {storedAnswer && (
                <>
                  <div className="flex flex-col sm:flex-row items-stretch gap-4 mb-5">
                    <div className={`flex-shrink-0 sm:w-32 rounded-xl bg-gradient-to-br ${scoreColorClasses(score)} p-4 flex flex-col items-center justify-center text-center shadow-md`}>
                      <div className="text-4xl sm:text-5xl font-black leading-none">{score}</div>
                      <div className="text-xs font-semibold opacity-90 mt-1">/ 10</div>
                    </div>
                    <div className="flex-1 bg-white rounded-xl border border-slate-200 p-4">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Your answer</p>
                      <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed">{storedAnswer}</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-slate-200 p-5 mb-5 space-y-3">
                    <p className="text-xs font-semibold text-teal-600 uppercase tracking-wide mb-2">
                      {isSample ? 'Sample feedback' : 'AI Feedback'}
                    </p>
                    {feedback && feedback.split('\n').filter((line) => line.trim()).map((para, i) => {
                      const trimmed = para.trim();
                      const isBullet = /^[•\-\*]\s/.test(trimmed);
                      if (isBullet) {
                        return (
                          <p key={i} className="text-slate-700 leading-relaxed text-sm pl-4 relative">
                            <span className="absolute left-0 text-teal-600">•</span>
                            {trimmed.replace(/^[•\-\*]\s/, '')}
                          </p>
                        );
                      }
                      return (
                        <p key={i} className="text-slate-700 leading-relaxed text-sm">{trimmed}</p>
                      );
                    })}
                  </div>
                </>
              )}

              <div className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-xl p-5 text-white text-center">
                <p className="font-bold text-lg mb-1">Ready for unlimited practice?</p>
                <p className="text-sm text-teal-50 mb-4">Free to start. No credit card required.</p>
                <a
                  href="/onboarding"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-white text-teal-700 font-semibold text-sm hover:bg-slate-50 transition-colors shadow-md"
                >
                  Sign up free
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </a>
              </div>
            </div>
          )}

          {/* ERROR state — shows curated fallback so visitors still see the product */}
          {view === 'error' && (
            <div className="animate-fadeIn">
              <div className="flex items-start gap-3 p-4 rounded-xl bg-rose-50 border border-rose-200 mb-5">
                <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="font-semibold text-rose-900">Our AI is taking a break.</p>
                  <p className="text-sm text-rose-800 mt-0.5">Here's a sample of what real feedback looks like — want to try the real thing?</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch gap-4 mb-5">
                <div className={`flex-shrink-0 sm:w-32 rounded-xl bg-gradient-to-br ${scoreColorClasses(score)} p-4 flex flex-col items-center justify-center text-center shadow-md`}>
                  <div className="text-4xl sm:text-5xl font-black leading-none">{score}</div>
                  <div className="text-xs font-semibold opacity-90 mt-1">/ 10</div>
                </div>
                <div className="flex-1 bg-white rounded-xl border border-slate-200 p-4">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Your answer</p>
                  <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed">{userAnswer.trim()}</p>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-5 mb-5 space-y-3">
                <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-2">
                  Sample feedback — sign up to get yours
                </p>
                {feedback && feedback.split('\n').filter((line) => line.trim()).map((para, i) => {
                  const trimmed = para.trim();
                  const isBullet = /^[•\-\*]\s/.test(trimmed);
                  if (isBullet) {
                    return (
                      <p key={i} className="text-slate-700 leading-relaxed text-sm pl-4 relative">
                        <span className="absolute left-0 text-teal-600">•</span>
                        {trimmed.replace(/^[•\-\*]\s/, '')}
                      </p>
                    );
                  }
                  return (
                    <p key={i} className="text-slate-700 leading-relaxed text-sm">{trimmed}</p>
                  );
                })}
              </div>

              <div className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-xl p-5 text-white text-center">
                <p className="font-bold text-lg mb-1">Want the real thing?</p>
                <p className="text-sm text-teal-50 mb-4">Sign up and get personalized feedback on your actual answers.</p>
                <a
                  href="/onboarding"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-white text-teal-700 font-semibold text-sm hover:bg-slate-50 transition-colors shadow-md"
                >
                  Try the real thing
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </a>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
        }
      `}</style>
    </section>
  );
}
