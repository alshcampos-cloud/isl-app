import React, { useState } from 'react';
import { Lightbulb, X, MessageCircle, Sparkles, Save, Crown, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';

const AnswerAssistant = ({ question, questionId, userContext, onAnswerSaved, onClose, userTier }) => {
  const [conversation, setConversation] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [stage, setStage] = useState('intro'); // intro, probing, building, complete
  const [generatedAnswer, setGeneratedAnswer] = useState(null);
  const [generatedBullets, setGeneratedBullets] = useState([]);

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
      const aiQuestion = data.content[0].text.trim();
      
      setConversation([{ role: 'assistant', text: aiQuestion }]);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to start assistant.');
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
      const aiResponse = data.content[0].text.trim();
      
      setConversation([...newConversation, { role: 'assistant', text: aiResponse }]);
      
      // Check if AI has generated a complete answer
      if (aiResponse.includes('Great!') || aiResponse.length > 150 && !aiResponse.endsWith('?')) {
        setStage('complete');
        setGeneratedAnswer(aiResponse);
        
        // Auto-generate bullets from the answer
        await generateBullets(aiResponse);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to get response');
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
      const bulletsText = data.content[0].text.trim();
      const bullets = bulletsText
        .split('\n')
        .filter(line => line.trim().startsWith('-') || line.trim().startsWith('•'))
        .map(line => line.replace(/^[-•]\s*/, '').trim());
      
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
            bullets: generatedBullets,
            updated_at: new Date().toISOString()
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
                <h3 className="text-2xl font-bold">AI Answer Coach</h3>
                <p className="text-sm opacity-90">Let's develop your answer together using MI</p>
              </div>
            </div>
            <button onClick={onClose} className="text-white hover:bg-white/20 rounded-full p-2 transition">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[calc(85vh-100px)] overflow-y-auto">
          {stage === 'intro' ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🤔</div>
              <h4 className="text-xl font-bold mb-3">Can't think of an answer?</h4>
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-gray-900 font-medium mb-2">"{question}"</p>
              </div>
              <p className="text-gray-600 mb-6">I'll ask you some questions using <strong>Motivational Interviewing</strong> techniques to help draw out a great answer!</p>
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
              {/* GENERATED ANSWER DISPLAY */}
              <div className="mb-6">
                <h4 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-green-600" />
                  Here's the answer we came up with:
                </h4>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-6">
                  <p className="text-gray-800 leading-relaxed text-lg whitespace-pre-line">{generatedAnswer}</p>
                </div>
              </div>

              {/* GENERATED BULLETS */}
              {generatedBullets.length > 0 && (
                <div className="mb-6 bg-blue-50 border-2 border-blue-300 rounded-xl p-6">
                  <h4 className="font-bold text-blue-900 mb-3 text-lg">
                    📝 Key Bullet Points (for Prompter & Flashcards):
                  </h4>
                  <ul className="space-y-2">
                    {generatedBullets.map((bullet, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-gray-800">
                        <span className="text-blue-600 font-bold">•</span>
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
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-4 rounded-lg font-bold text-lg flex items-center justify-center gap-2 transition border-2 border-gray-300"
                >
                  <RefreshCw className="w-5 h-5" />
                  Keep Working
                </button>
                <button
                  onClick={saveAnswer}
                  disabled={!generatedBullets.length}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-lg font-bold text-lg hover:from-green-700 hover:to-emerald-700 flex items-center justify-center gap-2 transition disabled:opacity-50"
                >
                  <Save className="w-5 h-5" />
                  Save Answer
                </button>
              </div>
              <p className="text-xs text-center text-gray-600 mt-3">
                ✅ This will be saved to Prompter, AI Interviewer, Practice, Flashcards, and Question Bank
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnswerAssistant;