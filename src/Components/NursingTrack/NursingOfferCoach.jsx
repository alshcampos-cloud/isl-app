// NursingTrack — Offer Negotiation Coach
// ============================================================
// Scenario-based salary negotiation practice for nurses.
// AI evaluates COMMUNICATION (assertiveness, professionalism, specificity,
// value framing, completeness) — NEVER recommends specific dollar amounts.
//
// Pattern: Mirrors NursingPracticeMode.jsx closely.
// Credit feature: 'practiceMode' (shared with Practice + SBAR + AI Coach + Confidence)
// Session history: localStorage (nursingNegotiationHistory)
//
// Battle Scars enforced:
//   #3  — fetchWithRetry (3 attempts, 0s/1s/2s backoff)
//   #8  — Charge AFTER success, never before
//   #9  — Beta users bypass limits (upstream tier check)
//   #16 — onClick AND onTouchEnd on ALL buttons
//   #19 — AI NEVER recommends specific dollar amounts or financial advice
//
// D.R.A.F.T. Protocol: NEW file. No existing code modified.
// ============================================================

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Send, Loader2, DollarSign, AlertCircle,
  CheckCircle, XCircle, Shuffle, ChevronRight,
  RotateCcw, Zap, BarChart3
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { fetchWithRetry } from '../../utils/fetchWithRetry';
import { canUseFeature, incrementUsage } from '../../utils/creditSystem';
import { createOfferCoachSession } from './nursingSessionStore';

// ============================================================
// NEGOTIATION SCENARIO LIBRARY — Hardcoded, NOT in nursingQuestions.js
// ============================================================
const NEGOTIATION_SCENARIOS = [
  {
    id: 'neg-base-salary',
    title: 'Base Salary Negotiation',
    situation: 'You receive an offer for a staff nurse position at $35/hour. Based on your research, the market range for this role in your area is $38-$42/hour. The recruiter asks, "Are you comfortable with the compensation we\'ve outlined?"',
    category: 'base-salary',
    difficulty: 'intermediate',
    tips: ['Reference your market research', 'Connect your ask to your qualifications', 'Be specific about your desired range'],
  },
  {
    id: 'neg-sign-on-bonus',
    title: 'Sign-On Bonus Negotiation',
    situation: 'The hospital offers a $5,000 sign-on bonus with a 2-year commitment. You know similar facilities are offering $8,000-$12,000. The recruiter says, "We\'ve included a competitive sign-on bonus in this package."',
    category: 'bonuses',
    difficulty: 'intermediate',
    tips: ['Acknowledge the existing offer positively', 'Present comparable data', 'Frame it as mutual investment'],
  },
  {
    id: 'neg-shift-diff',
    title: 'Shift Differential Discussion',
    situation: 'You\'re offered a night shift position with a $3/hour night differential. Your research shows the area average is $5-$6/hour for nights. The hiring manager asks if you have any questions about the schedule.',
    category: 'benefits',
    difficulty: 'beginner',
    tips: ['Ask about the differential structure casually', 'Compare to area standards', 'Frame it as a question, not a demand'],
  },
  {
    id: 'neg-tuition',
    title: 'Tuition Reimbursement Request',
    situation: 'You\'re pursuing your BSN-to-MSN and the offer doesn\'t include tuition reimbursement. You want to ask about education benefits. The recruiter says, "Do you have any other questions about our benefits package?"',
    category: 'benefits',
    difficulty: 'beginner',
    tips: ['Frame education as an investment in your role', 'Ask about existing programs first', 'Connect advanced education to patient outcomes'],
  },
  {
    id: 'neg-pto',
    title: 'PTO Negotiation',
    situation: 'The offer includes standard 2 weeks PTO. With your 7 years of experience, you feel 3 weeks is more appropriate. The recruiter is reviewing benefits with you.',
    category: 'benefits',
    difficulty: 'beginner',
    tips: ['Tie PTO to your experience level', 'Reference industry standards for your tenure', 'Be willing to offer flexibility on start date'],
  },
  {
    id: 'neg-relocation',
    title: 'Relocation Assistance',
    situation: 'You\'re moving cross-country for this position. The offer doesn\'t mention relocation assistance. The recruiter asks, "Is there anything else we can help with to make your transition smooth?"',
    category: 'benefits',
    difficulty: 'beginner',
    tips: ['This is a direct opening — take it', 'Be specific about what you need', 'Frame it as enabling your start date'],
  },
  {
    id: 'neg-counter-offer',
    title: 'Counter-Offer Response',
    situation: 'You\'ve accepted a new position, but your current employer offers you a $4/hour raise and a charge nurse title to stay. You need to respond to both parties professionally.',
    category: 'counter-offer',
    difficulty: 'advanced',
    tips: ['Be professional with both parties', 'Consider the full picture beyond salary', 'Don\'t burn bridges regardless of your decision'],
  },
  {
    id: 'neg-salary-expectations',
    title: '"What Are Your Salary Expectations?"',
    situation: 'Early in the interview process, the recruiter asks: "Before we go further, what are your salary expectations for this role?" You haven\'t received an offer yet.',
    category: 'expectations',
    difficulty: 'intermediate',
    tips: ['Deflect to the full compensation package if possible', 'If you must give a number, give a researched range', 'Anchor high within reason'],
  },
  {
    id: 'neg-decline-gracefully',
    title: 'Declining an Offer Professionally',
    situation: 'After negotiation, the hospital can\'t meet your minimum requirements. You need to decline the offer while maintaining a professional relationship — you may want to work there in the future.',
    category: 'professional-communication',
    difficulty: 'intermediate',
    tips: ['Express genuine gratitude', 'Be honest but diplomatic about the reason', 'Leave the door open for future opportunities'],
  },
  {
    id: 'neg-start-date',
    title: 'Accepting While Negotiating Start Date',
    situation: 'You want to accept the offer, but they want you to start in 2 weeks. You need 4 weeks to give proper notice at your current facility and avoid burning bridges.',
    category: 'professional-communication',
    difficulty: 'beginner',
    tips: ['Lead with your acceptance and enthusiasm', 'Frame the delay as professional responsibility', 'Offer to complete pre-hire paperwork early'],
  },
  {
    id: 'neg-weekend-diff',
    title: 'Weekend Differential Request',
    situation: 'Your offer includes every-other-weekend requirements but no mention of a weekend differential. You know other facilities in the area offer $2-$4/hour weekend premiums. During the offer review call, the recruiter asks if you have questions about scheduling.',
    category: 'benefits',
    difficulty: 'intermediate',
    tips: ['Ask about the differential structure as a question', 'Reference what you\'ve seen at comparable facilities', 'Be ready if the answer is "we don\'t offer that"'],
  },
  {
    id: 'neg-full-package',
    title: 'Negotiating the Full Package',
    situation: 'The base salary is acceptable but the overall package feels thin — limited PTO, no tuition reimbursement, and a small sign-on bonus. The recruiter asks, "Are you ready to move forward with the offer?"',
    category: 'base-salary',
    difficulty: 'advanced',
    tips: ['Acknowledge what you like about the offer first', 'Address the full package, not just one item', 'Prioritize your asks — know your dealbreakers'],
  },
];

const SCENARIO_CATEGORIES = [
  { value: 'all', label: 'All Scenarios' },
  { value: 'base-salary', label: 'Base Salary' },
  { value: 'benefits', label: 'Benefits' },
  { value: 'bonuses', label: 'Bonuses' },
  { value: 'counter-offer', label: 'Counter-Offer' },
  { value: 'expectations', label: 'Expectations' },
  { value: 'professional-communication', label: 'Professional Communication' },
];

const STORAGE_KEY_HISTORY = 'nursingNegotiationHistory';

// ============================================================
// AI SYSTEM PROMPT — Walled Garden: Communication, NOT financial advice
// ============================================================
const NEGOTIATION_SYSTEM_PROMPT = (scenario) => {
  return `You are a nursing salary negotiation communication coach. You help nurses practice HOW TO TALK about compensation — the words, framing, confidence, and professionalism.

The nurse is practicing this scenario:
TITLE: ${scenario.title}
SITUATION: ${scenario.situation}
CATEGORY: ${scenario.category}

EVALUATE THE NURSE'S RESPONSE ON THESE DIMENSIONS (score each 1-5):
1. CONFIDENCE — Did they advocate for themselves without apologizing?
2. PROFESSIONALISM — Was the tone appropriate for a business conversation?
3. SPECIFICITY — Did they reference research, market data, or concrete rationale?
4. VALUE FRAMING — Did they connect their ask to the value they bring?
5. COMPLETENESS — Did they address the full picture, not just one element?

PROVIDE FEEDBACK using the C.O.A.C.H. layered approach:
1. What was strong about their response
2. What to improve with specific suggestions
3. A "power phrase" they could use — one sentence rewrite of their weakest point

WHAT YOU NEVER DO:
- Recommend specific dollar amounts or salary targets
- Give financial advice ("you should ask for $X")
- Evaluate whether a salary is fair or unfair
- Make claims about specific hospital pay scales
- Act as a financial advisor

INSTEAD, point to external resources: "For market rate research, check BLS.gov Occupational Outlook Handbook, Glassdoor, Salary.com, or your state nurses association salary surveys."

Return your response in EXACTLY this format:

[SCORES]
Confidence: X/5 | Professionalism: X/5 | Specificity: X/5 | Value Framing: X/5 | Completeness: X/5
[/SCORES]

[FEEDBACK]
(Your layered C.O.A.C.H. feedback here — what was strong, what to improve, specific suggestions)
[/FEEDBACK]

[POWER_PHRASE]
(One rewritten sentence they can use — drawn from their weakest dimension)
[/POWER_PHRASE]

Keep total response under 400 words. Be warm, direct, and specific — not generic.`;
};

// ============================================================
// SCORE PARSING — Defensive, null fallback (never breaks UI)
// ============================================================
function parseNegotiationScores(responseText) {
  if (!responseText) return null;
  try {
    const scoresMatch = responseText.match(/\[SCORES\]([\s\S]*?)\[\/SCORES\]/i);
    if (!scoresMatch) return null;

    const scoresText = scoresMatch[1];
    const dimensions = ['Confidence', 'Professionalism', 'Specificity', 'Value Framing', 'Completeness'];
    const scores = {};

    dimensions.forEach(dim => {
      const regex = new RegExp(`${dim}:\\s*(\\d)\\s*/\\s*5`, 'i');
      const match = scoresText.match(regex);
      scores[dim.toLowerCase().replace(' ', '_')] = match ? parseInt(match[1], 10) : null;
    });

    return scores;
  } catch {
    return null;
  }
}

function parseFeedback(responseText) {
  if (!responseText) return null;
  try {
    const match = responseText.match(/\[FEEDBACK\]([\s\S]*?)\[\/FEEDBACK\]/i);
    return match ? match[1].trim() : null;
  } catch {
    return null;
  }
}

function parsePowerPhrase(responseText) {
  if (!responseText) return null;
  try {
    const match = responseText.match(/\[POWER_PHRASE\]([\s\S]*?)\[\/POWER_PHRASE\]/i);
    return match ? match[1].trim() : null;
  } catch {
    return null;
  }
}

function scoreColor(score) {
  if (score === null) return 'text-slate-400';
  if (score >= 4) return 'text-green-400';
  if (score >= 3) return 'text-yellow-400';
  return 'text-red-400';
}

function scoreBg(score) {
  if (score === null) return 'bg-slate-500/20';
  if (score >= 4) return 'bg-green-500/20';
  if (score >= 3) return 'bg-yellow-500/20';
  return 'bg-red-500/20';
}

function averageScore(scores) {
  if (!scores) return null;
  const vals = Object.values(scores).filter(v => v !== null);
  if (vals.length === 0) return null;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function NursingOfferCoach({ specialty, onBack, userData, refreshUsage, addSession }) {
  // State
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [userAnswer, setUserAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState(null); // { scores, feedback, powerPhrase, raw }
  const [error, setError] = useState(null);
  const [creditBlocked, setCreditBlocked] = useState(false);
  const [history, setHistory] = useState([]); // localStorage history

  const inputRef = useRef(null);

  // Load history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_HISTORY);
      if (saved) setHistory(JSON.parse(saved));
    } catch (e) {
      console.warn('Failed to load negotiation history:', e);
    }
  }, []);

  // Credit check
  useEffect(() => {
    if (userData && !userData.loading && userData.usage) {
      const check = canUseFeature(
        { practice_mode: userData.usage.practiceMode?.used || 0 },
        userData.tier,
        'practiceMode'
      );
      if (!check.allowed) setCreditBlocked(true);
    }
  }, [userData]);

  // Focus input when scenario selected
  useEffect(() => {
    if (selectedScenario && !feedback && inputRef.current) {
      inputRef.current.focus();
    }
  }, [selectedScenario, feedback]);

  // Filter scenarios
  const filteredScenarios = categoryFilter === 'all'
    ? NEGOTIATION_SCENARIOS
    : NEGOTIATION_SCENARIOS.filter(s => s.category === categoryFilter);

  // Save history to localStorage
  const saveHistory = useCallback((newHistory) => {
    setHistory(newHistory);
    try {
      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(newHistory));
    } catch (e) {
      console.warn('Failed to save negotiation history:', e);
    }
  }, []);

  // Submit answer for AI feedback — charge-after-success (Battle Scar #8)
  const submitAnswer = useCallback(async () => {
    if (!userAnswer.trim() || isLoading || !selectedScenario) return;

    setIsLoading(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetchWithRetry(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-feedback`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            mode: 'answer-assistant-continue',
            systemPrompt: NEGOTIATION_SYSTEM_PROMPT(selectedScenario),
            conversationHistory: [],
            userMessage: userAnswer.trim(),
          }),
        }
      );

      if (!response.ok) {
        const errText = await response.text();
        console.error('Negotiation feedback error:', response.status, errText);
        throw new Error(`Feedback failed: ${response.status}`);
      }

      const data = await response.json();
      const rawContent = data.response || data.feedback || 'Unable to evaluate. Please try again.';

      const scores = parseNegotiationScores(rawContent);
      const feedbackText = parseFeedback(rawContent);
      const powerPhrase = parsePowerPhrase(rawContent);

      setFeedback({
        scores,
        feedback: feedbackText || rawContent, // Fallback: show raw if parsing fails
        powerPhrase,
        raw: rawContent,
      });

      // Save to localStorage history
      const historyEntry = {
        id: `neg_${Date.now()}`,
        scenarioId: selectedScenario.id,
        scenarioTitle: selectedScenario.title,
        category: selectedScenario.category,
        scores,
        avgScore: averageScore(scores),
        timestamp: new Date().toISOString(),
      };
      saveHistory([...history, historyEntry]);

      // Persist session to Supabase via addSession (non-blocking)
      if (addSession) {
        const sessionRecord = createOfferCoachSession(
          selectedScenario.id,
          selectedScenario.title,
          selectedScenario.category,
          scores,
        );
        addSession(sessionRecord);
      }

      // CHARGE AFTER SUCCESS (Battle Scar #8)
      if (userData?.user?.id) {
        try {
          await incrementUsage(supabase, userData.user.id, 'practiceMode');
          if (refreshUsage) refreshUsage();
        } catch (chargeErr) {
          console.warn('Usage increment failed (non-blocking):', chargeErr);
        }
      }
    } catch (err) {
      console.error('Negotiation coach error:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [userAnswer, isLoading, selectedScenario, userData, refreshUsage, history, saveHistory, addSession]);

  // Navigation helpers
  const selectScenario = useCallback((scenario) => {
    setSelectedScenario(scenario);
    setUserAnswer('');
    setFeedback(null);
    setError(null);
  }, []);

  const backToScenarios = useCallback(() => {
    setSelectedScenario(null);
    setUserAnswer('');
    setFeedback(null);
    setError(null);
  }, []);

  const tryAgain = useCallback(() => {
    setUserAnswer('');
    setFeedback(null);
    setError(null);
  }, []);

  const nextRandom = useCallback(() => {
    let next;
    do {
      next = NEGOTIATION_SCENARIOS[Math.floor(Math.random() * NEGOTIATION_SCENARIOS.length)];
    } while (next.id === selectedScenario?.id && NEGOTIATION_SCENARIOS.length > 1);
    selectScenario(next);
  }, [selectedScenario, selectScenario]);

  // Handle Enter
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !feedback) {
      e.preventDefault();
      submitAnswer();
    }
  };

  const isUnlimited = userData?.isBeta || userData?.tier === 'pro';
  const creditInfo = userData?.usage?.practiceMode;
  const scenariosPracticed = new Set(history.map(h => h.scenarioId)).size;
  const historyAvg = history.length > 0
    ? (history.filter(h => h.avgScore !== null).reduce((sum, h) => sum + h.avgScore, 0) /
       history.filter(h => h.avgScore !== null).length || 0).toFixed(1)
    : null;

  // ============================================================
  // RENDER: Scenario Selection
  // ============================================================
  if (!selectedScenario) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 flex flex-col">
        {/* Header */}
        <div className="bg-slate-900/80 backdrop-blur-lg border-b border-white/10 sticky top-0 z-30">
          <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
            <button
              onClick={onBack}
              onTouchEnd={(e) => { e.preventDefault(); onBack(); }}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Back</span>
            </button>

            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span className="text-white font-medium text-sm">Offer Negotiation</span>
            </div>

            <div className="flex items-center gap-2 text-xs">
              {scenariosPracticed > 0 && (
                <span className="text-slate-400">
                  {scenariosPracticed}/{NEGOTIATION_SCENARIOS.length} practiced
                  {historyAvg && <span className={` ml-1 ${scoreColor(parseFloat(historyAvg))}`}>({historyAvg})</span>}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Main */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="max-w-2xl mx-auto">
            {/* Intro */}
            <div className="mb-6">
              <h2 className="text-white font-semibold text-lg mb-1 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-400" />
                Negotiation Scenarios
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                Practice salary, benefits, and offer conversations. The AI coaches your <strong className="text-white">communication</strong> — assertiveness,
                professionalism, and framing — never specific dollar amounts.
              </p>
            </div>

            {/* Stats bar */}
            {history.length > 0 && (
              <div className="flex items-center gap-4 mb-4 text-xs">
                <span className="text-slate-400 flex items-center gap-1">
                  <BarChart3 className="w-3 h-3" /> {history.length} practice{history.length !== 1 ? 's' : ''}
                </span>
                <span className="text-slate-400 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> {scenariosPracticed} scenarios covered
                </span>
                {historyAvg && (
                  <span className={`flex items-center gap-1 ${scoreColor(parseFloat(historyAvg))}`}>
                    <Zap className="w-3 h-3" /> Avg: {historyAvg}/5
                  </span>
                )}
              </div>
            )}

            {/* Credit warning */}
            {creditBlocked && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-4 text-center">
                <p className="text-red-300 text-sm mb-2">
                  You've used all {creditInfo?.limit} free practice sessions this month.
                </p>
                <a
                  href="/app"
                  className="inline-block text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-sky-500 px-4 py-2 rounded-lg hover:-translate-y-0.5 transition-all"
                >
                  Upgrade to Pro — Unlimited Practice
                </a>
              </div>
            )}

            {/* Category filter */}
            <div className="flex flex-wrap gap-2 mb-4">
              {SCENARIO_CATEGORIES.map(cat => (
                <button
                  key={cat.value}
                  onClick={() => setCategoryFilter(cat.value)}
                  onTouchEnd={(e) => { e.preventDefault(); setCategoryFilter(cat.value); }}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                    categoryFilter === cat.value
                      ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Random scenario button */}
            <button
              onClick={() => selectScenario(NEGOTIATION_SCENARIOS[Math.floor(Math.random() * NEGOTIATION_SCENARIOS.length)])}
              onTouchEnd={(e) => {
                e.preventDefault();
                selectScenario(NEGOTIATION_SCENARIOS[Math.floor(Math.random() * NEGOTIATION_SCENARIOS.length)]);
              }}
              className="w-full mb-4 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-emerald-500/20 to-green-500/20 border border-emerald-500/30 text-emerald-300 font-medium text-sm hover:from-emerald-500/30 hover:to-green-500/30 transition-all"
            >
              <Shuffle className="w-4 h-4" /> Random Scenario
            </button>

            {/* Scenario cards */}
            <div className="space-y-3">
              {filteredScenarios.map((scenario, index) => {
                const practiced = history.some(h => h.scenarioId === scenario.id);
                const bestEntry = history
                  .filter(h => h.scenarioId === scenario.id && h.avgScore !== null)
                  .sort((a, b) => b.avgScore - a.avgScore)[0];

                return (
                  <motion.button
                    key={scenario.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    onClick={() => selectScenario(scenario)}
                    onTouchEnd={(e) => { e.preventDefault(); selectScenario(scenario); }}
                    className="w-full text-left bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 hover:border-white/20 transition-all group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-white font-medium text-sm">{scenario.title}</h3>
                          {practiced && (
                            <CheckCircle className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-slate-400 text-xs leading-relaxed line-clamp-2">{scenario.situation}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-slate-300">
                            {scenario.category.replace('-', ' ')}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            scenario.difficulty === 'advanced'
                              ? 'bg-red-500/10 text-red-300'
                              : scenario.difficulty === 'intermediate'
                                ? 'bg-yellow-500/10 text-yellow-300'
                                : 'bg-green-500/10 text-green-300'
                          }`}>
                            {scenario.difficulty}
                          </span>
                          {bestEntry && (
                            <span className={`text-xs font-medium ${scoreColor(bestEntry.avgScore)}`}>
                              Best: {bestEntry.avgScore.toFixed(1)}/5
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-slate-400 group-hover:translate-x-1 transition-all mt-1 flex-shrink-0" />
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-900/95 border-t border-white/10 px-4 py-3">
          <p className="text-slate-600 text-xs text-center">
            AI coaches your negotiation communication • Never recommends specific dollar amounts
          </p>
        </div>
      </div>
    );
  }

  // ============================================================
  // RENDER: Active Scenario (Input + Feedback)
  // ============================================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 flex flex-col">
      {/* Header */}
      <div className="bg-slate-900/80 backdrop-blur-lg border-b border-white/10 sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={backToScenarios}
            onTouchEnd={(e) => { e.preventDefault(); backToScenarios(); }}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Scenarios</span>
          </button>

          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span className="text-white font-medium text-sm">Offer Coach</span>
          </div>

          <div className="w-16" />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-2xl mx-auto">
          {/* Scenario Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6"
          >
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {selectedScenario.category.replace('-', ' ')}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                selectedScenario.difficulty === 'advanced'
                  ? 'bg-red-500/10 text-red-300'
                  : selectedScenario.difficulty === 'intermediate'
                    ? 'bg-yellow-500/10 text-yellow-300'
                    : 'bg-green-500/10 text-green-300'
              }`}>
                {selectedScenario.difficulty}
              </span>
            </div>

            <h2 className="text-white text-lg font-semibold mb-3">{selectedScenario.title}</h2>
            <p className="text-slate-300 text-sm leading-relaxed">{selectedScenario.situation}</p>

            {/* Tips */}
            <div className="mt-4 bg-emerald-500/5 border border-emerald-500/10 rounded-lg p-3">
              <p className="text-emerald-300 text-xs font-medium mb-1">Tips for this scenario:</p>
              <ul className="space-y-0.5">
                {selectedScenario.tips.map((tip, i) => (
                  <li key={i} className="text-emerald-300/60 text-xs">• {tip}</li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Answer Input or Feedback */}
          <AnimatePresence mode="wait">
            {!feedback ? (
              <motion.div
                key="input"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <p className="text-slate-400 text-sm mb-2">How would you respond?</p>
                <textarea
                  ref={inputRef}
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type what you would say to the recruiter/hiring manager..."
                  rows={6}
                  disabled={creditBlocked || isLoading}
                  className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-500 resize-none focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 mb-4"
                />

                <div className="flex items-center gap-3">
                  <button
                    onClick={submitAnswer}
                    onTouchEnd={(e) => { e.preventDefault(); submitAnswer(); }}
                    disabled={!userAnswer.trim() || isLoading || creditBlocked}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all ${
                      userAnswer.trim() && !isLoading && !creditBlocked
                        ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg shadow-emerald-500/30 hover:-translate-y-0.5'
                        : 'bg-white/10 text-white/30 cursor-not-allowed'
                    }`}
                  >
                    {isLoading ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Evaluating...</>
                    ) : (
                      <><Send className="w-4 h-4" /> Submit Response</>
                    )}
                  </button>
                </div>

                {/* Credit info */}
                {creditBlocked && (
                  <div className="mt-4 bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center">
                    <p className="text-red-300 text-sm mb-2">
                      Free practice limit reached.
                    </p>
                    <a
                      href="/app"
                      className="inline-block text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-sky-500 px-4 py-2 rounded-lg hover:-translate-y-0.5 transition-all"
                    >
                      Upgrade to Pro — Unlimited Practice
                    </a>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="feedback"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {/* Score badges */}
                {feedback.scores && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-3">
                      <DollarSign className="w-4 h-4 text-emerald-400" />
                      <span className="text-white font-medium text-sm">Your Scores</span>
                      {averageScore(feedback.scores) !== null && (
                        <span className={`text-sm font-bold ${scoreColor(averageScore(feedback.scores))}`}>
                          ({averageScore(feedback.scores).toFixed(1)}/5 avg)
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-5 gap-2">
                      {[
                        { key: 'confidence', label: 'Confidence' },
                        { key: 'professionalism', label: 'Professional' },
                        { key: 'specificity', label: 'Specificity' },
                        { key: 'value_framing', label: 'Value' },
                        { key: 'completeness', label: 'Complete' },
                      ].map(dim => {
                        const score = feedback.scores[dim.key];
                        return (
                          <div key={dim.key} className={`${scoreBg(score)} rounded-lg p-2 text-center`}>
                            <p className={`text-lg font-bold ${scoreColor(score)}`}>
                              {score !== null ? score : '-'}
                            </p>
                            <p className="text-slate-400 text-[10px] leading-tight">{dim.label}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Feedback text */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-4">
                  <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">
                    {feedback.feedback}
                  </p>
                </div>

                {/* Power phrase callout */}
                {feedback.powerPhrase && (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 mb-4">
                    <p className="text-emerald-300 text-xs font-medium mb-1 flex items-center gap-1">
                      <Zap className="w-3 h-3" /> Power Phrase
                    </p>
                    <p className="text-emerald-200 text-sm italic leading-relaxed">
                      "{feedback.powerPhrase}"
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={tryAgain}
                    onTouchEnd={(e) => { e.preventDefault(); tryAgain(); }}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white/10 border border-white/20 text-white font-semibold text-sm hover:bg-white/20 transition-all"
                  >
                    <RotateCcw className="w-4 h-4" /> Try Again
                  </button>
                  <button
                    onClick={nextRandom}
                    onTouchEnd={(e) => { e.preventDefault(); nextRandom(); }}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 text-white font-semibold text-sm shadow-lg shadow-emerald-500/30 hover:-translate-y-0.5 transition-all"
                  >
                    Next Scenario <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error */}
          {error && (
            <div className="mt-4 bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span className="text-red-300 text-sm">{error}</span>
              <button
                onClick={() => setError(null)}
                onTouchEnd={(e) => { e.preventDefault(); setError(null); }}
                className="ml-auto text-red-400 hover:text-red-300"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-slate-900/95 border-t border-white/10 px-4 py-3">
        <p className="text-slate-600 text-xs text-center">
          AI coaches your negotiation communication • For market rates, check BLS.gov or Salary.com
        </p>
      </div>
    </div>
  );
}
