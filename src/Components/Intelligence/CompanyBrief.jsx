/**
 * CompanyBrief.jsx — AI-generated company research brief.
 * Phase 4H: Rendered inside InterviewContextHub when company is set.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Loader2, Building2, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { fetchWithRetry } from '../../utils/fetchWithRetry';
import { incrementUsage } from '../../utils/creditSystem';
import { buildCompanyBriefPrompt } from '../../utils/companyBriefPrompt';

function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) { hash = ((hash << 5) - hash) + str.charCodeAt(i); hash |= 0; }
  return Math.abs(hash).toString(36);
}

function CompanyBrief({ companyName, getUserContext }) {
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBrief = useCallback(async () => {
    if (!companyName || companyName.length < 2) return;

    // Check cache (30-day)
    try {
      const key = 'company_brief_' + simpleHash(companyName.toLowerCase());
      const cached = localStorage.getItem(key);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && parsed.data && parsed.timestamp && Date.now() - parsed.timestamp < 30 * 24 * 60 * 60 * 1000) {
          setResult(parsed.data);
          return;
        }
      }
    } catch {}

    setIsLoading(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const ctx = getUserContext ? getUserContext() : {};
      const response = await fetchWithRetry(
        `${import.meta.env.VITE_SUPABASE_URL || 'https://tzrlpwtkrtvjpdhcaayu.supabase.co'}/functions/v1/ai-feedback`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
          body: JSON.stringify({
            mode: 'confidence-brief',
            systemPrompt: buildCompanyBriefPrompt(ctx),
            userMessage: `Generate a research brief for ${companyName}. Include interview-relevant intelligence.`,
          }),
        }
      );
      if (!response.ok) throw new Error(`Failed: ${response.status}`);
      const data = await response.json();
      const aiText = data.content?.[0]?.text || '';
      const jsonMatch = aiText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('Parse failed');
      let parsed;
      try { parsed = JSON.parse(jsonMatch[0]); } catch { throw new Error('Could not parse company brief. Please try again.'); }
      if (!parsed || typeof parsed !== 'object') throw new Error('Invalid brief format.');
      setResult(parsed);
      try {
        localStorage.setItem('company_brief_' + simpleHash(companyName.toLowerCase()), JSON.stringify({ data: parsed, timestamp: Date.now() }));
      } catch {}

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
  }, [companyName, getUserContext]);

  // Use ref to avoid re-triggering useEffect when getUserContext reference changes
  const fetchBriefRef = useRef(fetchBrief);
  fetchBriefRef.current = fetchBrief;

  // Clear stale state when company changes, then fetch new data
  useEffect(() => {
    setResult(null);
    setError(null);
    if (companyName) fetchBriefRef.current();
  }, [companyName]);

  if (!companyName) return null;

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 bg-gradient-to-r from-sky-50 to-teal-50 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-sky-600" />
            <h3 className="text-sm font-bold text-gray-800">Company Intel: {companyName}</h3>
          </div>
        </div>
        <div className="p-6 flex items-center justify-center gap-3 min-h-[120px]">
          <Loader2 className="w-5 h-5 text-teal-500 animate-spin" />
          <span className="text-sm text-gray-600">Researching {companyName}...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 rounded-xl p-3 border border-red-200 flex items-center gap-2">
        <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
        <span className="text-xs text-red-700 flex-1">{error}</span>
        <button onClick={fetchBrief} className="text-xs text-red-500 font-semibold underline ml-auto flex-shrink-0">Retry</button>
      </div>
    );
  }

  if (!result) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-4 py-3 bg-gradient-to-r from-sky-50 to-teal-50 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-sky-600" />
          <h3 className="text-sm font-bold text-gray-800">Company Intel: {companyName}</h3>
        </div>
      </div>
      <div className="p-4 space-y-3 text-sm">
        {result.about && (
          <div><p className="text-xs font-semibold text-gray-500 mb-0.5">About</p><p className="text-gray-700">{result.about}</p></div>
        )}
        {result.missionValues && (
          <div><p className="text-xs font-semibold text-gray-500 mb-0.5">Mission & Values</p><p className="text-gray-700">{result.missionValues}</p></div>
        )}
        {result.interviewCulture && (
          <div><p className="text-xs font-semibold text-gray-500 mb-0.5">Interview Culture</p><p className="text-gray-700">{result.interviewCulture}</p></div>
        )}
        {result.whatToEmphasize?.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">What to Emphasize</p>
            <div className="flex flex-wrap gap-1.5">
              {result.whatToEmphasize.map((t, i) => (
                <span key={i} className="px-2 py-0.5 bg-teal-50 text-teal-700 rounded-full text-xs">{t}</span>
              ))}
            </div>
          </div>
        )}
        {result.smartQuestions?.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">Smart Questions to Ask Them</p>
            <ul className="space-y-1">
              {result.smartQuestions.map((q, i) => (
                <li key={i} className="text-xs text-gray-700 flex items-start gap-1.5">
                  <span className="text-teal-500">•</span><span>{q}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {result.disclaimer && (
          <p className="text-[10px] text-gray-400 italic pt-1 border-t border-gray-100">{result.disclaimer}</p>
        )}
      </div>
    </div>
  );
}

export default CompanyBrief;
