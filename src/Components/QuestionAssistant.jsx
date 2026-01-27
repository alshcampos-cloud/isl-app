import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function QuestionAssistant({ onQuestionGenerated, existingQuestions = [] }) {
  const [targetRole, setTargetRole] = useState('');
  const [company, setCompany] = useState('');
  const [background, setBackground] = useState('');
  const [interviewType, setInterviewType] = useState('behavioral');
  const [customPrompt, setCustomPrompt] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuestion, setGeneratedQuestion] = useState('');
  const [error, setError] = useState('');

  // Load saved context from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('isl_question_context');
    if (saved) {
      const { role, comp, type, bg, jd } = JSON.parse(saved);
      if (role) setTargetRole(role);
      if (comp) setCompany(comp);
      if (type) setInterviewType(type);
      if (bg) setBackground(bg);
      if (jd) setJobDescription(jd);
    }
  }, []);

  // Save context when it changes
  useEffect(() => {
    if (targetRole || company || background || jobDescription) {
      localStorage.setItem('isl_question_context', JSON.stringify({
        role: targetRole,
        comp: company,
        type: interviewType,
        bg: background,
        jd: jobDescription
      }));
    }
  }, [targetRole, company, interviewType, background, jobDescription]);

  const handleGenerate = async () => {
    if (!targetRole.trim()) {
      setError('Please enter your target role first');
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(
        'https://tzrlpwtkrtvjpdhcaayu.supabase.co/functions/v1/generate-question',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            targetRole,
            targetCompany: company,
            background,
            interviewType,
            customPrompt,
            jobDescription,
            existingQuestions: existingQuestions.slice(0, 10),
            keepSimple: true,
            maxWords: 20
          })
        }
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const question = data.question;
      
      setGeneratedQuestion(question);
    } catch (err) {
      console.error('Generation error:', err);
      setError('Failed to generate question. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUseQuestion = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('Please sign in to save questions');
        return;
      }
      
      const { error } = await supabase.from('questions').insert([{
        user_id: user.id,
        question: generatedQuestion,
        category: 'Generated',
        priority: 'Technical',
        bullets: [],
        narrative: '',
        keywords: []
      }]);
      
      if (error) throw error;
      
      // Call parent callback to reload questions
      if (onQuestionGenerated) {
        onQuestionGenerated(generatedQuestion);
      }
      
      alert('✅ Question added to bank!');
      setCustomPrompt('');
      setGeneratedQuestion('');
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save: ' + error.message);
    }
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 border-2 border-purple-200 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">✨</span>
        <h3 className="text-lg font-semibold text-gray-900">AI Question Generator</h3>
        <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded">AI-POWERED</span>
        {/* FIXED: Removed confusing usage counter badge - proper usage tracking will be added in future update */}
      </div>

      <div className="space-y-4">
        {/* Context Inputs */}
        <div className="bg-white rounded-lg p-4 border border-purple-200 space-y-3">
          <p className="text-sm font-semibold text-purple-900">📋 Tell the AI About You:</p>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Target Role *
            </label>
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g., Emergency Manager, Product Manager, Software Engineer"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Target Company/Organization (optional)
            </label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g., Google, Microsoft, City Government"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your Background & Key Experiences (optional but powerful!)
            </label>
            <textarea
              value={background}
              onChange={(e) => setBackground(e.target.value)}
              placeholder="Examples:
- Current role and organization
- Relevant degrees, certifications, training
- Key projects or achievements
- Areas of expertise
- Unique experiences that make you stand out

The AI will generate questions that help you showcase THESE experiences."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 resize-none"
              rows="5"
            />
            <p className="text-xs text-purple-600 mt-1">
              💡 The more specific you are, the better the AI can generate questions that tap into YOUR real experiences
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Job Description (optional but highly recommended!)
            </label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description here. The AI will generate questions based on the specific requirements, skills, and responsibilities mentioned.

Example: What to paste:
- Required qualifications
- Key responsibilities  
- Skills needed
- Anything specific mentioned in the posting"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 resize-none"
              rows="6"
            />
            <p className="text-xs text-green-600 mt-1">
              🎯 This helps generate questions that match what the interviewer is actually looking for!
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Question Type
            </label>
            <select
              value={interviewType}
              onChange={(e) => setInterviewType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="behavioral">Behavioral (STAR stories)</option>
              <option value="leadership">Leadership & Management</option>
              <option value="technical">Technical / Systems</option>
              <option value="situational">Situational Judgment</option>
              <option value="culture-fit">Culture Fit / Values</option>
            </select>
          </div>
        </div>

        {/* Custom Prompt */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Specific Topic or Skill to Focus On (optional)
          </label>
          <textarea
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="Examples:
- Handling conflict with senior stakeholders
- Leading through organizational change
- Managing competing priorities
- Making decisions with incomplete information
- Building consensus across departments"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 resize-none"
            rows="3"
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Simplicity Reminder */}
        <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-3">
          <p className="text-sm font-bold text-blue-900 mb-1">💡 Interview Questions Should Be Clear & Direct:</p>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>✓ Good: "How do you prioritize during an emergency?"</li>
            <li>✗ Bad: "Walk me through how you would prioritize during an emergency when you have limited resources and conflicting stakeholder demands..."</li>
            <li>🎯 Aim for under 20 words per question</li>
          </ul>
        </div>

        <button
          onClick={handleGenerate}
          disabled={isGenerating || !targetRole.trim()}
          className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Generating personalized question...
            </>
          ) : (
            <>
              <span>✨</span>
              Generate Question for {targetRole || 'Your Role'}
            </>
          )}
        </button>

        {generatedQuestion && (
          <div className="bg-white rounded-lg p-5 border-2 border-green-300 space-y-4">
            <div>
              <p className="text-sm font-semibold text-green-700 mb-2 flex items-center gap-2">
                <span>🎯</span>
                Generated for: {targetRole}{company && ` at ${company}`}
              </p>
              <div className="bg-green-50 rounded-lg p-4 mb-3">
                <p className="text-gray-900 text-lg leading-relaxed font-medium">{generatedQuestion}</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={handleUseQuestion}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition shadow-lg"
              >
                ✓ Add to Question Bank
              </button>
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="px-4 py-3 border-2 border-purple-300 text-purple-700 rounded-lg font-medium hover:bg-purple-50 transition"
              >
                ↻ Try Another
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 p-4 bg-purple-100 rounded-lg">
        <p className="text-xs text-purple-900 font-semibold mb-2">
          💡 How Personalized Question Generation Works:
        </p>
        <ul className="text-xs text-purple-800 space-y-1">
          <li>• Learns from your {existingQuestions.length} existing questions</li>
          <li>• Generates questions tailored to {targetRole || 'your role'}{company && ` at ${company}`}</li>
          <li>• {background ? 'Uses YOUR background to create relevant scenarios' : 'Add your background above for even better questions!'}</li>
          <li>• {jobDescription ? 'Aligns with job description requirements' : 'Add a job description for laser-focused questions!'}</li>
          <li>• Uses Motivational Interviewing for authentic storytelling practice</li>
          <li>• Your context is saved locally for future use</li>
        </ul>
      </div>
    </div>
  );
}