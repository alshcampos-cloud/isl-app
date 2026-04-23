/**
 * FollowUpEmail.jsx — AI-generated post-interview thank-you email.
 * Phase 4N: Personalized follow-up based on interview context.
 *
 * Props: onBack, getUserContext
 */

import { useState, useMemo, useCallback } from 'react';
import { ArrowLeft, Loader2, Mail, Copy, CheckCircle, Sparkles } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { fetchWithRetry } from '../../utils/fetchWithRetry';
import { incrementUsage } from '../../utils/creditSystem';

function FollowUpEmail({ onBack, getUserContext }) {
  const [interviewerName, setInterviewerName] = useState('');
  const [notes, setNotes] = useState('');
  const [tone, setTone] = useState('professional');
  const [generatedEmail, setGeneratedEmail] = useState('');
  const [subjectLine, setSubjectLine] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);

  const TONES = [
    { id: 'professional', label: 'Professional', desc: 'Polished and corporate' },
    { id: 'warm', label: 'Warm', desc: 'Friendly yet professional' },
    { id: 'enthusiastic', label: 'Enthusiastic', desc: 'High energy, excited' },
  ];

  const ctx = useMemo(() => getUserContext ? getUserContext() : {}, [getUserContext]);

  const generateEmail = useCallback(async () => {
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
            systemPrompt: `You are a professional communication coach helping write a post-interview thank-you email.

Tone: ${tone === 'enthusiastic' ? 'Enthusiastic and energetic — show genuine excitement while staying professional' : tone === 'warm' ? 'Warm and personable — friendly and genuine, like a natural conversation' : 'Polished and corporate — formal but not stiff'}

Write a concise thank-you email (NOT generic). Reference specific things from the interview notes provided. Keep it under 200 words. Include:
1. Thank them for their time
2. Reference 1-2 specific topics discussed
3. Briefly reinforce your fit for the role
4. Express enthusiasm for next steps
5. Professional closing

Respond with JSON: {"subjectLine": "a short professional subject line", "body": "the full email body ready to send"}`,
            userMessage: `Role: ${ctx.targetRole || 'the position'}
Company: ${ctx.targetCompany || 'your company'}
Interviewer: ${interviewerName || 'the interviewer'}
Notes from interview: ${notes || 'General interview, discussed role responsibilities and team culture'}`,
          }),
        }
      );

      if (!response.ok) throw new Error('Generation failed');
      const data = await response.json();
      const aiText = data.content?.[0]?.text || data.response || '';
      // Try to parse JSON response with subject line
      const jsonMatch = aiText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          setGeneratedEmail(parsed.body || aiText.trim());
          setSubjectLine(parsed.subjectLine || '');
        } catch {
          setGeneratedEmail(aiText.trim());
        }
      } else {
        setGeneratedEmail(aiText.trim());
      }

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
  }, [ctx, interviewerName, notes, tone]);

  const copyToClipboard = useCallback(async () => {
    const fullText = subjectLine ? `Subject: ${subjectLine}\n\n${generatedEmail}` : generatedEmail;
    try {
      await navigator.clipboard.writeText(fullText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers or insecure contexts
      try {
        const textArea = document.createElement('textarea');
        textArea.value = fullText;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        setError('Could not copy to clipboard. Please select and copy manually.');
      }
    }
  }, [generatedEmail, subjectLine]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={onBack} aria-label="Go back" className="p-2 hover:bg-gray-100 rounded-xl">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-gray-800">Follow-Up Email</h1>
            <p className="text-xs text-gray-500">Generate a personalized thank-you email</p>
          </div>
          <Mail className="w-5 h-5 text-teal-500" />
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Input form */}
        {!generatedEmail && (
          <>
          <div className="bg-gradient-to-r from-teal-50 to-emerald-50 rounded-xl p-4 border border-teal-200 mb-4">
            <p className="text-sm text-teal-800">
              <strong>Pro tip:</strong> Send within 24 hours. Reference something specific from your conversation to stand out from generic thank-you emails.
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">Interviewer Name(s)</label>
              <input
                value={interviewerName}
                onChange={(e) => setInterviewerName(e.target.value)}
                placeholder="e.g., Sarah Johnson, Mike Chen"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-300/50"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">Brief Interview Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                placeholder="What did you discuss? Any memorable moments? Topics that came up?"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-y focus:ring-2 focus:ring-teal-300/50 min-h-[100px]"
              />
              <p className="text-xs text-gray-400 mt-1">The more specific, the better the email</p>
            </div>

            {/* Tone selector */}
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1.5">Email Tone</label>
              <div className="flex gap-2">
                {TONES.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setTone(t.id)}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all border ${
                      tone === t.id
                        ? 'bg-teal-50 border-teal-300 text-teal-700 shadow-sm'
                        : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    <p className="font-semibold">{t.label}</p>
                    <p className="text-[10px] opacity-70 mt-0.5">{t.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {ctx.targetRole && (
              <div className="bg-teal-50 rounded-lg p-3 text-xs text-teal-700">
                <strong>Context:</strong> {ctx.targetRole} at {ctx.targetCompany || 'company'}
              </div>
            )}

            <button
              onClick={generateEmail}
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-xl font-semibold disabled:opacity-40 hover:from-teal-600 hover:to-emerald-600 transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {isLoading ? 'Generating...' : 'Generate Thank-You Email'}
            </button>
          </div>
          </>
        )}

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl mt-4 flex items-center gap-2">
            <span className="text-sm text-red-700 flex-1">{error}</span>
            <button onClick={() => { setError(null); generateEmail(); }} className="text-xs text-red-600 font-semibold underline flex-shrink-0">Try Again</button>
          </div>
        )}

        {/* Generated email */}
        {generatedEmail && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-800">Your Follow-Up Email</h3>
                <button
                  onClick={copyToClipboard}
                  aria-label={copied ? 'Copied to clipboard' : 'Copy email to clipboard'}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                    copied ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {copied ? <CheckCircle className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              {subjectLine && (
                <div className="bg-teal-50 rounded-lg p-3 border border-teal-200 mb-3">
                  <p className="text-xs font-semibold text-teal-600 mb-0.5">Suggested Subject Line</p>
                  <p className="text-sm font-medium text-teal-900">{subjectLine}</p>
                </div>
              )}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <pre className="text-sm text-gray-800 whitespace-pre-wrap font-sans leading-relaxed">{generatedEmail}</pre>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => { setGeneratedEmail(''); setSubjectLine(''); }}
                className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all text-sm"
              >
                ← Edit & Regenerate
              </button>
              <button
                onClick={onBack}
                className="flex-1 py-2.5 bg-teal-500 text-white rounded-xl font-semibold hover:bg-teal-600 transition-all text-sm"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default FollowUpEmail;
