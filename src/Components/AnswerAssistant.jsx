import React, { useState, useEffect } from 'react';
import { Lightbulb, X, MessageCircle, Sparkles, Save, Crown, RefreshCw, HelpCircle, Zap, AlertTriangle } from 'lucide-react';
import { supabase } from '../lib/supabase';

const AnswerAssistant = ({ question, questionId, userContext, onAnswerSaved, onClose, userTier, existingNarrative, existingBullets }) => {
  // Check if there's an existing answer
  const hasExistingAnswer = existingNarrative && existingNarrative.trim().length > 0;
  
  const [conversation, setConversation] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [stage, setStage] = useState('intro'); // existing-answer, intro, probing, building, complete
  const [generatedAnswer, setGeneratedAnswer] = useState(null);
  const [generatedBullets, setGeneratedBullets] = useState([]);
  const [showMIInfo, setShowMIInfo] = useState(false);
  const [isRushAnswer, setIsRushAnswer] = useState(false);
  
  // Set stage to existing-answer if there's already an answer
  useEffect(() => {
    if (hasExistingAnswer) {
      setStage('existing-answer');
    }
  }, [hasExistingAnswer]);

  // Clean markdown code blocks and formatting from AI responses
  const cleanAIResponse = (text) => {
    if (!text) return '';
    
    try {
      const trimmed = text.trim();
      
      // Check if the ENTIRE response is ONLY a JSON object (backend error/metadata)
      if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
        try {
          const parsed = JSON.parse(trimmed);
          // If it's metadata structure, return empty
          if (parsed.points_covered !== undefined || 
              parsed.points_missed !== undefined || 
              parsed.error !== undefined ||
              parsed.mode !== undefined) {
            console.error('Backend returned metadata instead of answer:', parsed);
            return ''; // Return empty so validation catches it
          }
        } catch (e) {
          // Not valid JSON, proceed with normal cleaning
        }
      }
      
      let cleaned = text;
      
      // Remove markdown code blocks (```...```)
      cleaned = cleaned.replace(/```[\s\S]*?```/g, '');
      
      // Remove inline code (`...`)  
      cleaned = cleaned.replace(/`([^`]+)`/g, '$1');
      
      // Remove excessive line breaks
      cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
      
      // Trim whitespace
      cleaned = cleaned.trim();
      
      return cleaned;
    } catch (error) {
      console.error('Error cleaning AI response:', error);
      return text;
    }
  };

  const startAssistant = async () => {
    setIsLoading(true);
    setStage('probing');
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch('https://tzrlpwtkrtvjpdhcaayu.supabase.co/functions/v1/ai-feedback', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mode: 'answer-assistant-start',
          question: question,
          userContext: userContext
        })
      });

      const data = await response.json();
      
      // FIXED: Safe response parsing with fallbacks
      let aiQuestion;
      if (data?.content?.[0]?.text) {
        aiQuestion = cleanAIResponse(data.content[0].text);
      } else if (data?.message) {
        aiQuestion = data.message;
      } else if (data?.error) {
        throw new Error(data.error);
      } else {
        throw new Error('No response content received');
      }
      
      setConversation([{ role: 'assistant', text: aiQuestion }]);
    } catch (error) {
      console.error('Error:', error);
      // FIXED: Show error in conversation instead of just alert
      setConversation([{ 
        role: 'assistant', 
        text: `⚠️ Sorry, I couldn't start the session: ${error.message || 'Unknown error'}. Please try again.` 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!userInput.trim()) return;

    const newConversation = [...conversation, { role: 'user', text: userInput }];
    setConversation(newConversation);
    setUserInput('');
    setIsLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();

      // DEBUG: Log conversation state
      console.log('🔍 SENDING MESSAGE:', {
        conversationLength: newConversation.length,
        userMessage: userInput,
        fullConversation: newConversation
      });

      const response = await fetch('https://tzrlpwtkrtvjpdhcaayu.supabase.co/functions/v1/ai-feedback', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mode: 'answer-assistant-continue',
          question: question,
          userContext: userContext,
          conversation: newConversation
        })
      });

      const data = await response.json();
      
      // FIXED: Safe response parsing with fallbacks
      let aiResponse;
      if (data?.content?.[0]?.text) {
        aiResponse = cleanAIResponse(data.content[0].text);
      } else if (data?.message) {
        aiResponse = data.message;
      } else if (data?.error) {
        throw new Error(data.error);
      } else {
        throw new Error('No response content received');
      }
      
      // DEBUG: Log AI response
      console.log('🔍 AI RESPONSE:', aiResponse);
      
      setConversation([...newConversation, { role: 'assistant', text: aiResponse }]);
    } catch (error) {
      console.error('Error:', error);
      // FIXED: Show error in conversation instead of just alert
      setConversation([...newConversation, { 
        role: 'assistant', 
        text: `⚠️ Sorry, I encountered an error: ${error.message || 'Unknown error'}. Please try again.` 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const synthesizeAnswer = async (isRush = false) => {
    setIsLoading(true);
    setIsRushAnswer(isRush);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();

      // DEBUG: Log what we're sending to backend
      console.log('🔍 SYNTHESIZE REQUEST:', {
        conversationLength: conversation.length,
        isRush: isRush,
        conversation: conversation,
        question: question
      });

      // Call AI to synthesize conversation into clean STAR answer
      const response = await fetch('https://tzrlpwtkrtvjpdhcaayu.supabase.co/functions/v1/ai-feedback', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mode: 'synthesize-star-answer',
          question: question,
          conversation: conversation,
          rushMode: isRush
        })
      });

      const data = await response.json();
      
      // DEBUG: Log what backend returned
      console.log('🔍 BACKEND RESPONSE:', data);
      
      // FIXED: Safe response parsing with fallbacks
      let synthesizedAnswer;
      if (data?.content?.[0]?.text) {
        console.log('🔍 RAW TEXT:', data.content[0].text);
        synthesizedAnswer = cleanAIResponse(data.content[0].text);
      } else if (data?.message) {
        synthesizedAnswer = data.message;
      } else if (data?.error) {
        throw new Error(data.error);
      } else {
        throw new Error('No response content received');
      }
      
      // DEBUG: Log cleaned result
      console.log('🔍 CLEANED ANSWER:', synthesizedAnswer);
      
      // Check if we got an empty response (backend returned metadata/error)
      if (!synthesizedAnswer || synthesizedAnswer.length < 10) {
        console.error('❌ Backend returned invalid response');
        alert('⚠️ Not enough information to create an answer yet.\n\nPlease continue the conversation and answer a few more questions, then try again!');
        setStage('probing');
        setIsLoading(false);
        return;
      }
      
      setGeneratedAnswer(synthesizedAnswer);
      setStage('complete');
      
      // Auto-generate bullets from the synthesized answer
      await generateBullets(synthesizedAnswer);
    } catch (error) {
      console.error('Error synthesizing:', error);
      alert('Failed to create final answer');
    } finally {
      setIsLoading(false);
    }
  };

  const generateBullets = async (answer) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch('https://tzrlpwtkrtvjpdhcaayu.supabase.co/functions/v1/ai-feedback', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mode: 'generate-bullets',
          answer: answer
        })
      });

      const data = await response.json();
      
      // FIXED: Safe response parsing with fallbacks
      let bulletsText;
      if (data?.content?.[0]?.text) {
        bulletsText = cleanAIResponse(data.content[0].text);
      } else if (data?.message) {
        bulletsText = data.message;
      } else {
        console.error('No bullets received from API');
        return; // Silently fail - bullets are optional
      }
      
      const bullets = bulletsText
        .split('\n')
        .filter(line => {
          const trimmed = line.trim();
          return trimmed.startsWith('-') || 
                 trimmed.startsWith('•') || 
                 trimmed.startsWith('*') ||
                 /^\d+\./.test(trimmed); // Also match numbered lists
        })
        .map(line => line.replace(/^[-•*]\s*/, '').replace(/^\d+\.\s*/, '').trim())
        .filter(bullet => bullet.length > 0);
      
      setGeneratedBullets(bullets);
    } catch (error) {
      console.error('Error generating bullets:', error);
    }
  };

  const keepWorking = () => {
    setStage('probing');
    setGeneratedAnswer(null);
    setGeneratedBullets([]);
  };

  const saveAnswer = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('Not authenticated');
        return;
      }

      // If questionId exists, update the question
      if (questionId) {
        const { error } = await supabase
          .from('questions')
          .update({
            narrative: generatedAnswer,
            bullets: generatedBullets
          })
          .eq('id', questionId)
          .eq('user_id', user.id);

        if (error) throw error;
      }

      // Also update localStorage for immediate sync
      const savedQuestions = JSON.parse(localStorage.getItem('isl_questions') || '[]');
      const updatedQuestions = savedQuestions.map(q => 
        q.id === questionId 
          ? { ...q, narrative: generatedAnswer, bullets: generatedBullets }
          : q
      );
      localStorage.setItem('isl_questions', JSON.stringify(updatedQuestions));

      console.log('✅ Answer saved to database and localStorage');
      
      if (onAnswerSaved) {
        onAnswerSaved({ narrative: generatedAnswer, bullets: generatedBullets });
      }
      
      alert('✅ Answer saved! Now available in Prompter, AI Interviewer, Practice Mode, Flashcards, and Question Bank.');
      onClose();
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save answer: ' + error.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Lightbulb className="w-8 h-8" />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-2xl font-bold">AI Answer Coach</h3>
                  <button
                    onClick={() => setShowMIInfo(!showMIInfo)}
                    className="hover:bg-white/20 rounded-full p-1 transition"
                    title="What is MI?"
                  >
                    <HelpCircle className="w-5 h-5" />
                  </button>
                </div>
                {showMIInfo ? (
                  <p className="text-sm opacity-90 mt-1 bg-white/10 rounded px-2 py-1">
                    <strong>Motivational Interviewing (MI)</strong> is a collaborative conversation technique that draws out your own experiences and insights through thoughtful questions, helping you craft authentic, detailed answers.
                  </p>
                ) : (
                  <p className="text-sm opacity-90">Let's develop your answer together using MI</p>
                )}
              </div>
            </div>
            <button onClick={onClose} className="text-white hover:bg-white/20 rounded-full p-2 transition">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[calc(85vh-100px)] overflow-y-auto">
          {stage === 'existing-answer' ? (
            <div className="py-8">
              <div className="text-center mb-6">
                <AlertTriangle className="w-20 h-20 text-orange-500 mx-auto mb-4" />
                <h4 className="text-2xl font-bold text-gray-900 mb-2">⚠️ This Question Already Has an Answer</h4>
                <p className="text-gray-600">Creating a new answer will permanently replace the existing one.</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm font-bold text-gray-700 mb-2">Question:</p>
                <p className="text-gray-900 font-medium">"{question}"</p>
              </div>

              {/* Current Answer Display */}
              <div className="bg-yellow-50 border-2 border-yellow-400 rounded-xl p-5 mb-6">
                <p className="text-sm font-bold text-orange-900 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Current Answer:
                </p>
                <div className="bg-white rounded-lg p-4 mb-4 max-h-60 overflow-y-auto">
                  <p className="text-gray-800 whitespace-pre-line leading-relaxed">{existingNarrative}</p>
                </div>
                
                {existingBullets && existingBullets.length > 0 && (
                  <>
                    <p className="text-sm font-bold text-orange-900 mb-2">Current Bullets:</p>
                    <div className="bg-white rounded-lg p-4">
                      <ul className="space-y-2">
                        {existingBullets.map((bullet, idx) => (
                          <li key={idx} className="flex gap-2 text-gray-800">
                            <span className="flex-shrink-0 w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                              {idx + 1}
                            </span>
                            <span className="leading-relaxed">{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={onClose}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-4 rounded-xl font-bold text-lg transition"
                >
                  ← Keep Current Answer
                </button>
                <button
                  onClick={() => setStage('intro')}
                  className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-6 py-4 rounded-xl font-bold text-lg transition shadow-lg"
                >
                  🔄 Create New Answer
                </button>
              </div>
              <p className="text-xs text-center text-gray-500 mt-3">
                💡 Tip: Only replace if you have a significantly better experience to share
              </p>
            </div>
          ) : stage === 'intro' ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🤔</div>
              <h4 className="text-xl font-bold mb-3">Can't think of an answer?</h4>
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-gray-900 font-medium mb-2">"{question}"</p>
              </div>
              
              <p className="text-gray-600 mb-6">
                I'll guide you using <strong>Motivational Interviewing (MI)</strong> - a proven technique that helps draw out your experiences through thoughtful questions, making it easier to craft authentic, detailed answers!
              </p>
              <button
                onClick={startAssistant}
                disabled={isLoading}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 transition"
              >
                {isLoading ? 'Starting...' : "🚀 Let's Get Started"}
              </button>
            </div>
          ) : stage === 'complete' ? (
            <>
              {/* SUCCESS MESSAGE */}
              <div className="text-center mb-6">
                <div className="text-6xl mb-3">🎉</div>
                <h4 className="text-2xl font-bold text-gray-900">
                  {isRushAnswer ? 'Your Quick Answer is Ready!' : 'Your Polished Answer is Ready!'}
                </h4>
                <p className="text-gray-600 mt-2">
                  {isRushAnswer 
                    ? 'Here\'s a solid answer based on what you\'ve shared so far'
                    : 'Based on our full conversation, here\'s your professional STAR-formatted answer'}
                </p>
                {isRushAnswer && (
                  <p className="text-sm text-orange-600 font-semibold mt-2">
                    ⚡ Rush Mode - Consider continuing the conversation for an even better answer
                  </p>
                )}
              </div>

              {/* GENERATED ANSWER DISPLAY */}
              <div className="mb-6">
                <h4 className="text-lg font-bold text-green-700 mb-3 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Your Professional Answer:
                </h4>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-6">
                  <p className="text-gray-900 leading-relaxed text-base whitespace-pre-line">{generatedAnswer}</p>
                </div>
              </div>

              {/* GENERATED BULLETS */}
              {generatedBullets.length > 0 && (
                <div className="mb-6 bg-blue-50 border-2 border-blue-300 rounded-xl p-6">
                  <h4 className="font-bold text-blue-900 mb-3">
                    📝 Key Bullet Points (for Prompter & Flashcards):
                  </h4>
                  <ul className="space-y-2">
                    {generatedBullets.map((bullet, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-gray-800">
                        <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {idx + 1}
                        </span>
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* ACTION BUTTONS */}
              <div className="flex gap-4">
                <button
                  onClick={keepWorking}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition border-2 border-gray-300"
                >
                  <RefreshCw className="w-5 h-5" />
                  Revise Answer
                </button>
                <button
                  onClick={saveAnswer}
                  disabled={!generatedBullets.length}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-xl font-bold text-lg hover:from-green-700 hover:to-emerald-700 flex items-center justify-center gap-2 transition disabled:opacity-50 shadow-lg"
                >
                  <Save className="w-5 h-5" />
                  Save Answer
                </button>
              </div>
              <p className="text-xs text-center text-gray-600 mt-3">
                ✅ Saves to all modes: Prompter, AI Interviewer, Practice, Flashcards, Question Bank
              </p>
            </>
          ) : (
            <>
              {/* Conversation */}
              <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
                {conversation.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                      msg.role === 'user' 
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-2xl px-4 py-3">
                      <div className="flex gap-2">
                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input - ALWAYS VISIBLE during probing */}
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                    placeholder="Share your experience..."
                    className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                    autoFocus
                  />
                  <button
                    onClick={sendMessage}
                    disabled={isLoading || !userInput.trim()}
                    className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 transition"
                  >
                    Send
                  </button>
                </div>
                
                {/* Answer Generation Buttons - Shows after some conversation */}
                {conversation.length >= 2 && (
                  <div className="space-y-2">
                    {/* Rush Answer - Available after 2 exchanges, hidden after 6 */}
                    {conversation.length >= 2 && conversation.length < 6 && (
                      <button
                        onClick={() => synthesizeAnswer(true)}
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-4 rounded-xl font-bold text-lg hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 transition shadow-lg flex items-center justify-center gap-2"
                      >
                        <Zap className="w-6 h-6" />
                        ⚡ Rush Answer (Quick Version)
                      </button>
                    )}
                    
                    {/* Full Answer - Available after 6 exchanges */}
                    {conversation.length >= 6 && (
                      <button
                        onClick={() => synthesizeAnswer(false)}
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-4 rounded-xl font-bold text-lg hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 transition shadow-lg flex items-center justify-center gap-2"
                      >
                        <Sparkles className="w-6 h-6" />
                        ✨ Create Polished Answer
                      </button>
                    )}
                  </div>
                )}
                
                <p className="text-xs text-center text-gray-500">
                  {conversation.length < 2
                    ? "Keep answering questions - the AI will help draw out details"
                    : conversation.length < 6
                    ? `🟡 Rush answer available now • 🟢 ${6 - conversation.length} more exchange${6 - conversation.length === 1 ? '' : 's'} for polished answer`
                    : "🟢 Ready for polished answer! Or choose 'Rush' for a quicker version"}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnswerAssistant;