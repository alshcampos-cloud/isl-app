/**
 * WeakPointDrill.jsx — Focused drill on weakest STAR component.
 * Phase 4L: Analyzes practice history to identify weak STAR section, drills just that.
 *
 * Props: onBack, practiceHistory, questions, getUserContext
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { ArrowLeft, Loader2, Target, Sparkles, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { fetchWithRetry } from '../../utils/fetchWithRetry';
import { incrementUsage } from '../../utils/creditSystem';

const getScore = (s) => s.feedback?.overall ?? (s.feedback?.match_percentage != null ? s.feedback.match_percentage / 10 : null);

function WeakPointDrill({ onBack, practiceHistory = [], questions = [], getUserContext, targetComponent = null }) {
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [userInput, setUserInput] = useState('');
  const [aiFeedback, setAiFeedback] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Identify weakest STAR component
  const weakestComponent = useMemo(() => {
    if (targetComponent) return targetComponent;

    const components = { Situation: 0, Task: 0, Action: 0, Result: 0 };
    const totals = { Situation: 0, Task: 0, Action: 0, Result: 0 };

    practiceHistory.forEach(s => {
      const fa = s.feedback?.framework_analysis;
      if (fa) {
        ['Situation', 'Task', 'Action', 'Result'].forEach(c => {
          const key = c.toLowerCase();
          totals[c]++;
          if (fa[key] === 'Strong' || fa[key] === 'Present') components[c]++;
        });
      }
    });

    let weakest = 'Result'; // Default
    let lowestRate = 1;
    Object.entries(components).forEach(([comp, strong]) => {
      const total = totals[comp];
      if (total > 0) {
        const rate = strong / total;
        if (rate < lowestRate) { lowestRate = rate; weakest = comp; }
      }
    });

    return weakest;
  }, [practiceHistory, targetComponent]);

  // Pick a random question for drilling
  const pickQuestion = useCallback(() => {
    const pool = questions.length > 0 ? questions : [{ question: 'Tell me about a time you had to lead a team through a difficult situation.' }];
    const random = pool[Math.floor(Math.random() * pool.length)];
    setCurrentQuestion(random);
    setUserInput('');
    setAiFeedback(null);
    setError(null);
  }, [questions]);

  // Start the drill — pickQuestion is stable since questions prop doesn't change after mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { pickQuestion(); }, [pickQuestion]);

  const submitDrill = useCallback(async () => {
    if (!userInput.trim() || !currentQuestion) return;
    setIsLoading(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetchWithRetry(
        `${import.meta.env.VITE_SUPABASE_URL || 'https://tzrlpwtkrtvjpdhcaayu.supabase.co'}/functions/v1/ai-feedback`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
          body: JSON.stringify({
            mode: 'confidence-brief',
            systemPrompt: `You are an interview coach evaluating ONLY the ${weakestComponent} part of a STAR answer. The candidate was asked to focus specifically on their ${weakestComponent}.

Evaluate on a 1-10 scale for just the ${weakestComponent} component:
- Specificity (concrete details vs vague)
- Relevance (does it match the question?)
- Completeness (did they cover what ${weakestComponent} needs?)
${weakestComponent === 'Result' ? '- Quantification (did they include numbers, percentages, or concrete outcomes?)' : ''}
${weakestComponent === 'Action' ? '- Personal ownership (did they use "I" not "we"?)' : ''}

Respond with JSON: {"score": number, "feedback": "2-3 sentences of targeted coaching", "improved_version": "A better version of just this ${weakestComponent} section"}`,
            userMessage: `Question: "${currentQuestion.question}"\n\nCandidate's ${weakestComponent}: "${userInput.trim()}"`,
          }),
        }
      );

      if (!response.ok) throw new Error('Evaluation failed');
      const data = await response.json();
      const aiText = data.content?.[0]?.text || '';
      const jsonMatch = aiText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('Could not parse feedback. Please try again.');
      let parsed;
      try { parsed = JSON.parse(jsonMatch[0]); } catch { throw new Error('Unexpected response format. Please try again.'); }
      if (typeof parsed.score !== 'number' || !parsed.feedback) throw new Error('Incomplete feedback received. Please try again.');
      setAiFeedback(parsed);

      // CHARGE AFTER SUCCESS (Battle Scar #8)
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) await incrementUsage(supabase, user.id, 'answer_assistant');
      } catch (e) { console.warn('Usage tracking failed:', e); }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [userInput, currentQuestion, weakestComponent]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={onBack} aria-label="Go back" className="p-2 hover:bg-gray-100 rounded-xl">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-gray-800">STAR Drill: {weakestComponent}</h1>
            <p className="text-xs text-gray-500">Practice just the {weakestComponent} component</p>
          </div>
          <Target className="w-5 h-5 text-purple-500" />
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-2xl space-y-4">
        {/* Why this component was chosen */}
        {!targetComponent && (
          <div className="bg-white rounded-xl p-3 border border-gray-100 text-xs text-gray-500 flex items-center gap-2">
            <Target className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
            <span>
              Based on your practice history, <strong className="text-purple-700">{weakestComponent}</strong> is your least consistent STAR component. Drilling it here builds targeted strength.
            </span>
          </div>
        )}

        {/* Explanation */}
        <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
          <p className="text-sm text-purple-800 mb-2">
            <strong>Focus:</strong> In 2-3 sentences, write ONLY the <strong>{weakestComponent}</strong> part of your answer.
            {weakestComponent === 'Situation' && ' Describe the specific when/where/context.'}
            {weakestComponent === 'Task' && ' What was YOUR role and what was at stake?'}
            {weakestComponent === 'Action' && ' What specific steps did YOU take? Use "I" not "we".'}
            {weakestComponent === 'Result' && ' What was the quantified outcome? Include numbers.'}
          </p>
          <p className="text-xs text-purple-600 italic">
            {weakestComponent === 'Situation' && 'Example: "In Q3 2024, our department of 12 faced a 40% increase in workload after two team members left unexpectedly during our busiest season."'}
            {weakestComponent === 'Task' && 'Example: "As the team lead, I was responsible for redistributing the workload while maintaining our 98% SLA compliance rate."'}
            {weakestComponent === 'Action' && 'Example: "I created a priority matrix to identify which tasks could be automated, then I personally trained two junior team members on the critical processes."'}
            {weakestComponent === 'Result' && 'Example: "We maintained 99.1% SLA compliance—actually exceeding our target—and reduced average processing time by 23% through the automation I introduced."'}
          </p>
        </div>

        {/* Question */}
        {currentQuestion && (
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <p className="text-lg font-bold text-gray-800">{currentQuestion.question}</p>
          </div>
        )}

        {/* Input */}
        {!aiFeedback && (
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <label className="text-sm font-semibold text-gray-600 block mb-2">
              Your {weakestComponent} (2-3 sentences):
            </label>
            <textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              rows={4}
              placeholder={`Write just the ${weakestComponent} part...`}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-y focus:ring-2 focus:ring-purple-300/50 min-h-[100px]"
            />
            <div className="flex items-center justify-between mt-3">
              <button onClick={pickQuestion} className="text-xs text-gray-400 hover:text-gray-600 p-1">Skip this question →</button>
              <button
                onClick={submitDrill}
                disabled={isLoading || !userInput.trim()}
                className="px-5 py-2 bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-600 disabled:opacity-40 flex items-center gap-2"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Evaluate
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <span className="text-sm text-red-700 flex-1">{error}</span>
            <button onClick={() => { setError(null); setAiFeedback(null); }} className="text-xs text-red-600 font-semibold underline flex-shrink-0">Try Again</button>
          </div>
        )}

        {/* Feedback */}
        {aiFeedback && (
          <div className="space-y-3">
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 text-center">
              <p className="text-4xl font-black text-purple-600">{aiFeedback.score}/10</p>
              <p className="text-sm text-gray-600 mt-2">{aiFeedback.feedback}</p>
            </div>

            {aiFeedback.improved_version && (
              <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                <p className="text-xs font-semibold text-purple-700 mb-1">Stronger Version:</p>
                <p className="text-sm text-purple-900 italic">{aiFeedback.improved_version}</p>
              </div>
            )}

            <button
              onClick={pickQuestion}
              className="w-full py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-indigo-600"
            >
              Next Question →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default WeakPointDrill;
