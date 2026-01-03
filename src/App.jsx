 import React, { useState, useEffect, useRef } from 'react';

import {
  Brain, Database, Play, Plus, Edit2, Trash2, TrendingUp, Download, Upload,
  Mic, MicOff, Volume2, Eye, EyeOff, Settings, Sparkles, ChevronRight, X,
  Zap, CheckCircle, Target, Bot, BookOpen, SkipForward, Pause, Award, Filter,
  Crown, Lightbulb
} from 'lucide-react';

import SupabaseTest from './SupabaseTest';
import ProtectedRoute from './ProtectedRoute';
import { supabase } from './lib/supabase';
import FirstTimeConsent from "./Components/FirstTimeConsent";
import QuestionAssistant from './Components/QuestionAssistant';
import AnswerAssistant from './Components/AnswerAssistant';
import TemplateLibrary from './TemplateLibrary';

// CSS string is OK at top-level
const styles = `
  @keyframes ripple {
    0% { transform: scale(1); opacity: 1; }
    100% { transform: scale(2); opacity: 0; }
  }

  .ripple-ring {
    position: absolute;
    border: 3px solid currentColor;
    border-radius: 50%;
    animation: ripple 1.5s ease-out infinite;
  }

  .ripple-ring:nth-child(2) { animation-delay: 0.5s; }
  .ripple-ring:nth-child(3) { animation-delay: 1s; }

  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .fade-in-up { animation: fadeInUp 0.6s ease-out forwards; }

  .feedback-section { opacity: 0; }
  .feedback-section.visible { animation: fadeInUp 0.6s ease-out forwards; }

  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

  @keyframes slideUp {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
  .animate-slideUp { animation: slideUp 0.4s ease-out; }
`;

// ==========================================
// ISL COMPLETE - FILE 1 of 2
// Core Functions + Home + Prompter + Questions
// ==========================================

const ISL = () => {
  // TEMPORARY: Test Supabase connection
  const TESTING_SUPABASE = false;

  if (TESTING_SUPABASE) {
    return <SupabaseTest />;
  }

  const [currentView, setCurrentView] = useState('home');
  const [showIdealAnswer, setShowIdealAnswer] = useState(false);
  const [currentMode, setCurrentMode] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [showTemplateLibrary, setShowTemplateLibrary] = useState(false);
  const [interviewType, setInterviewType] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [showApiSetup, setShowApiSetup] = useState(true);

  const recognitionRef = useRef(null);
  const synthRef = useRef(null);
  const accumulatedTranscript = useRef('');

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [micPermission, setMicPermission] = useState(false);
  const [matchedQuestion, setMatchedQuestion] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [spokenAnswer, setSpokenAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [conversationMode, setConversationMode] = useState(false);
  const [followUpQuestion, setFollowUpQuestion] = useState(null);
  const [exchangeCount, setExchangeCount] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [practiceHistory, setPracticeHistory] = useState([]);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [showNarrative, setShowNarrative] = useState(false);
  const [showBullets, setShowBullets] = useState(false);
  const [showFollowUps, setShowFollowUps] = useState(false);
  const [spacebarHeld, setSpacebarHeld] = useState(false);
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [aiSubtitle, setAiSubtitle] = useState('');
  const [questionHistory, setQuestionHistory] = useState([]);
  const [showResumeToast, setShowResumeToast] = useState(false);
  const [resumedQuestion, setResumedQuestion] = useState(null);
  const [flashcardSide, setFlashcardSide] = useState('question');
  const [completedQuestions, setCompletedQuestions] = useState(new Set());
  const [usageStats, setUsageStats] = useState(null);
  const [showStrengths, setShowStrengths] = useState(true);
  const [showGaps, setShowGaps] = useState(true);
  const [animatedScore, setAnimatedScore] = useState(0);
  const [revealStage, setRevealStage] = useState(0);
  const [showAllFeedback, setShowAllFeedback] = useState(false);
  const [commandCenterTab, setCommandCenterTab] = useState('analytics');
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [interviewDate, setInterviewDate] = useState(localStorage.getItem('isl_interview_date') || '');
  const [dailyGoal, setDailyGoal] = useState(parseInt(localStorage.getItem('isl_daily_goal') || '3', 10));
  const [selectedSession, setSelectedSession] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [showAnswerAssistant, setShowAnswerAssistant] = useState(false);
  const [answerAssistantQuestion, setAnswerAssistantQuestion] = useState(null);

  // ✅ Inject styles ONCE, safely, inside the component (hooks allowed here)
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (document.getElementById('isl-style-inject')) return;

    const styleSheet = document.createElement('style');
    styleSheet.id = 'isl-style-inject';
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
  }, []);

  // Animate score when feedback appears + Progressive Reveal
  useEffect(() => {
    if (feedback?.overall || feedback?.match_percentage) {
      const targetScore = feedback.overall || feedback.match_percentage / 10 || 0;

      setAnimatedScore(0);
      setRevealStage(0);
      setShowAllFeedback(false);

      const duration = 2000;
      const steps = 60;
      const stepValue = targetScore / steps;
      const stepDuration = duration / steps;

      let currentStep = 0;

      const scoreTimer = setInterval(() => {
        currentStep++;
        if (currentStep >= steps) {
          setAnimatedScore(targetScore);
          clearInterval(scoreTimer);
        } else {
          setAnimatedScore(currentStep * stepValue);
        }
      }, stepDuration);

      const revealTimers = [
        setTimeout(() => setRevealStage(1), 800),
        setTimeout(() => setRevealStage(2), 1400),
        setTimeout(() => setRevealStage(3), 2000),
        setTimeout(() => setRevealStage(4), 2600),
        setTimeout(() => setRevealStage(5), 3200),
        setTimeout(() => setRevealStage(6), 3800),
        setTimeout(() => setRevealStage(7), 4400),
      ];

      return () => {
        clearInterval(scoreTimer);
        revealTimers.forEach(t => clearTimeout(t));
      };
    }
  }, [feedback]);

  const getUserContext = () => {
    try {
      const saved = localStorage.getItem('isl_question_context');
      if (saved) {
        const { role, comp, bg } = JSON.parse(saved);
        return { targetRole: role || '', targetCompany: comp || '', background: bg || '' };
      }
    } catch (err) {
      console.error('Error loading user context:', err);
    }
    return { targetRole: '', targetCompany: '', background: '' };
  };

  const loadQuestions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        // Get practice counts for all questions
        const { data: sessions } = await supabase
          .from('practice_sessions')
          .select('question_id, ai_feedback')
          .eq('user_id', user.id);

        // Calculate practiceCount and averageScore for each question
        const questionsWithStats = data.map(q => {
          const questionSessions = sessions?.filter(s => s.question_id === q.id) || [];
          const practiceCount = questionSessions.length;
          const scores = questionSessions
            .map(s => s.ai_feedback?.overall)
            .filter(score => score != null);
          const averageScore = scores.length > 0 
            ? scores.reduce((sum, score) => sum + score, 0) / scores.length 
            : 0;
          
          return {
            ...q,
            practiceCount,
            averageScore,
            lastPracticed: questionSessions.length > 0 
              ? questionSessions[questionSessions.length - 1].created_at 
              : null
          };
        });

        setQuestions(questionsWithStats);
        console.log(`✅ Loaded ${questionsWithStats.length} questions from Supabase`);
      }
    } catch (error) {
      console.error('❌ Error loading questions:', error);
    }
  };

  // INIT
  useEffect(() => {
    const savedKey = localStorage.getItem('isl_api_key');
    if (savedKey) {
      setApiKey(savedKey);
      setShowApiSetup(false);
    }

    loadQuestions();

    const savedType = localStorage.getItem('isl_interview_type');
    if (savedType) setInterviewType(savedType);

    const savedHistory = localStorage.getItem('isl_history');
    if (savedHistory) setPracticeHistory(JSON.parse(savedHistory));

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }

    initSpeechRecognition();
  }, []);

  useEffect(() => {
    if (questions.length > 0) localStorage.setItem('isl_questions', JSON.stringify(questions));
  }, [questions]);

  useEffect(() => {
    if (practiceHistory.length > 0) localStorage.setItem('isl_history', JSON.stringify(practiceHistory));
  }, [practiceHistory]);

  useEffect(() => {
    if (interviewType) localStorage.setItem('isl_interview_type', interviewType);
  }, [interviewType]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (currentView === 'home') {
      getCurrentUsage().then(stats => {
        console.log('Usage stats loaded:', stats);
        setUsageStats(stats);
      });
    }
  }, [currentView]);
  useEffect(() => { if (currentMode === 'prompter' && transcript && !isListening) { console.log('Auto-match:', transcript); matchQuestion(transcript); } }, [transcript, isListening, currentMode]);
  // Helper to check if section should be visible
  const isSectionVisible = (stage) => {
    return showAllFeedback || revealStage >= stage;
  };

  // SPEECH RECOGNITION
  const initSpeechRecognition = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { console.warn('Speech not supported'); return; }
    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
recognition.onresult = (event) => {
      let interim = '', final = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const part = event.results[i][0].transcript;
        if (event.results[i].isFinal) final += part + ' ';
        else interim += part;
      }
      
// ACCUMULATE text instead of replacing
      if (final) {
        accumulatedTranscript.current = (accumulatedTranscript.current + ' ' + final).trim();
        setTranscript(accumulatedTranscript.current);
        console.log('Speech (final):', accumulatedTranscript.current);
        if (currentMode === 'ai-interviewer' || currentMode === 'practice') {
          setSpokenAnswer(accumulatedTranscript.current);
        }
      } else if (interim) {
        // Show interim results without saving
        const tempTranscript = (accumulatedTranscript.current + ' ' + interim).trim();
        setTranscript(tempTranscript);
      }
    };
recognition.onerror = (event) => {
  console.error('Speech error:', event.error);
  if (event.error === 'not-allowed') { 
    setMicPermission(false); 
    alert('Mic denied!'); 
  }
  if (event.error === 'no-speech') {
    console.log('No speech detected - try speaking louder or closer to mic');
  }
  if (event.error === 'aborted') {
    setIsListening(false);
  }
};
    recognition.onend = () => { 
  console.log('Speech ended'); 
  if (isListening) {
    // If we're still supposed to be listening, restart
    console.log('Restarting recognition...');
    try {
      recognitionRef.current.start();
    } catch (err) {
      console.error('Restart failed:', err);
      setIsListening(false);
    }
  } else {
    setIsListening(false);
  }
};
    recognitionRef.current = recognition;
  };
  // Save practice session to database
  const savePracticeSession = async (questionData, userAnswer, aiFeedback = null) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const wordCount = userAnswer.split(' ').filter(w => w.length > 0).length;
      const fillerWords = ['um', 'uh', 'like', 'you know', 'so', 'actually'];
      const fillerCount = fillerWords.reduce((count, word) => {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        return count + (userAnswer.match(regex) || []).length;
      }, 0);

      const { data, error } = await supabase
        .from('practice_sessions')
.insert({
  user_id: user.id,
question_id: (questionData.id && questionData.id !== "0" && typeof questionData.id === 'string' && questionData.id.includes('-')) ? questionData.id : null,
  question_bank_id: questionData.bank_id || null,
  question_text: questionData.question,
  user_answer: userAnswer,
  mode: currentMode,
  word_count: wordCount,
  filler_word_count: fillerCount,
  ai_feedback: aiFeedback,
})
        .select()
        .single();

      if (error) throw error;
      console.log('✅ Practice session saved:', data);
      return data;
    } catch (error) {
      console.error('❌ Error saving practice session:', error);
    }
  };

 // Check and increment usage
  const checkAndIncrementUsage = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { allowed: false, remaining: 0 };

      const currentMonth = new Date().toISOString().slice(0, 7);

      const { data: betaUser } = await supabase
        .from('beta_testers')
        .select('unlimited_access')
        .eq('user_id', user.id)
        .single();

      if (betaUser?.unlimited_access) {
        console.log('✅ Beta tester - unlimited access');
        return { allowed: true, remaining: 'unlimited', tier: 'beta' };
      }

      let { data: usage, error } = await supabase
        .from('usage_tracking')
        .select('*')
        .eq('user_id', user.id)
        .eq('month', currentMonth)
        .single();

      if (error && error.code === 'PGRST116') {
        const { data: newUsage } = await supabase
          .from('usage_tracking')
          .insert({ user_id: user.id, month: currentMonth, session_count: 0, tier: 'free' })
          .select()
          .single();
        usage = newUsage;
      }

      const limits = { free: 25, pro: 100, beta: Infinity };
      const limit = limits[usage.tier] || 25;
      const remaining = limit - usage.session_count;

      if (usage.session_count >= limit) {
        console.log('❌ Usage limit reached');
        return { allowed: false, remaining: 0, tier: usage.tier };
      }

      await supabase
        .from('usage_tracking')
        .update({ session_count: usage.session_count + 1 })
        .eq('user_id', user.id)
        .eq('month', currentMonth);

      console.log(`✅ Usage tracked: ${usage.session_count + 1}/${limit}`);
      return { allowed: true, remaining: remaining - 1, tier: usage.tier };
    } catch (error) {
      console.error('Usage tracking error:', error);
      return { allowed: true, remaining: 0 };
    }
  };

  const getCurrentUsage = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const currentMonth = new Date().toISOString().slice(0, 7);

      const { data: betaUser } = await supabase
        .from('beta_testers')
        .select('unlimited_access')
        .eq('user_id', user.id)
        .single();

      if (betaUser?.unlimited_access) {
        return { session_count: 0, tier: 'beta', month: currentMonth };
      }

      const { data: usage } = await supabase
        .from('usage_tracking')
        .select('*')
        .eq('user_id', user.id)
        .eq('month', currentMonth)
        .single();

      return usage || { session_count: 0, tier: 'free', month: currentMonth };
    } catch (error) {
      console.error('Get usage error:', error);
      return null;
    }
  }; 

  const requestMicPermission = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicPermission(true);
      initSpeechRecognition();
      console.log('Mic granted');
    } catch (err) {
      console.error('Mic error:', err);
      alert('Microphone permission denied.');
      setMicPermission(false);
    }
  };

const startListening = () => {
  console.log('Start listening, mode:', currentMode);
  if (!micPermission) { requestMicPermission(); return; }
  
  // Prevent double-start
  if (isListening) {
    console.log('Already listening, skipping');
    return;
  }
  
  // Auto-resume last question if available
if (questionHistory.length > 0 && currentMode === 'prompter') {
  setResumedQuestion(questionHistory[0]);
  setShowResumeToast(true);
  
  // Show "Resumed" for 2 seconds, THEN display question
  setTimeout(() => {
    setMatchedQuestion(questionHistory[0]);
    setShowResumeToast(false);
  }, 2000);
}
  
  if (recognitionRef.current && !isListening) {
    if (currentMode === 'prompter' && questionHistory.length === 0) setMatchedQuestion(null);
    setIsListening(true);
    try { recognitionRef.current.start(); console.log('Started'); } catch (err) { console.error('Start failed:', err); setIsListening(false); }
  }
};

  const stopListening = () => {
    console.log('Stop');
    if (recognitionRef.current && isListening) {
      setIsListening(false);
      try { recognitionRef.current.stop(); } catch (err) { console.error('Stop failed:', err); }
    }
  };

  const matchQuestion = (text) => {
    console.log('Matching:', text);
    const lower = text.toLowerCase();
    let bestMatch = null, highestScore = 0;
    questions.forEach(q => {
      let score = 0;
      if (q.keywords) q.keywords.forEach(kw => { if (lower.includes(kw.toLowerCase())) { score += kw.split(' ').length * 3; console.log(`✓ "${kw}" +${score}`); } });
      q.question.toLowerCase().split(' ').filter(w => w.length > 3).forEach(word => { if (lower.includes(word)) score += 1; });
      if (score > 0) console.log(`"${q.question}" = ${score}`);
      if (score > highestScore) { highestScore = score; bestMatch = q; }
    });
    console.log('Best:', bestMatch?.question, highestScore);
if (bestMatch && highestScore > 2) { 
  setMatchedQuestion(bestMatch); 
  setShowNarrative(false); 
  setQuestionHistory(prev => {
    const newHistory = [bestMatch, ...prev.filter(q => q !== bestMatch)];
    return newHistory.slice(0, 3);
  });
  console.log('✅ Matched!'); 
}
else { console.log('❌ No match - score too low:', highestScore); }
  };

useEffect(() => {
    const handleKeyDown = (e) => { 
      const isTyping = e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT'; 
      const isButton = e.target.tagName === 'BUTTON';
      if (e.code === 'Space' && (currentMode === 'prompter' || currentMode === 'ai-interviewer' || currentMode === 'practice') && !spacebarHeld && !isTyping && !isButton) { 
        e.preventDefault(); 
        setSpacebarHeld(true); 
        startListening(); 
      } 
    };
    const handleKeyUp = (e) => { 
      const isTyping = e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT'; 
      const isButton = e.target.tagName === 'BUTTON';
      if (e.code === 'Space' && spacebarHeld && !isTyping && !isButton) { 
        e.preventDefault(); 
        setSpacebarHeld(false); 
        stopListening(); 
      } 
    };
    if (currentMode) { window.addEventListener('keydown', handleKeyDown); window.addEventListener('keyup', handleKeyUp); return () => { window.removeEventListener('keydown', handleKeyDown); window.removeEventListener('keyup', handleKeyUp); }; }
  }, [currentMode, spacebarHeld, isListening]);
  // TTS
  const speakText = (text) => {
    if (!synthRef.current) { console.warn('TTS not available'); return; }
    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = synthRef.current.getVoices();
    const goodVoice = voices.find(v => v.name.includes('Google') || v.name.includes('Microsoft') || v.name.includes('Samantha') || v.name.includes('Alex')) || voices[0];
    if (goodVoice) { utterance.voice = goodVoice; console.log('Voice:', goodVoice.name); }
    utterance.rate = 0.95; utterance.pitch = 1.0; utterance.volume = 1.0;
    utterance.onstart = () => { setAiSpeaking(true); setAiSubtitle(text); };
    utterance.onend = () => { setAiSpeaking(false); setAiSubtitle(''); };
    synthRef.current.speak(utterance);
  };

  const stopSpeaking = () => { if (synthRef.current) { synthRef.current.cancel(); setAiSpeaking(false); setAiSubtitle(''); } };

  // API
  const saveApiKey = (key) => { console.log('Save API key, len:', key.length); localStorage.setItem('isl_api_key', key); setApiKey(key); setShowApiSetup(false); };

  const getAIFeedback = async (question, expectedAnswer, userAnswer) => {
    if (!apiKey || apiKey.trim().length < 10) { alert('Need valid API key'); setShowApiSetup(true); return null; }
    setIsAnalyzing(true);
    console.log('Getting AI feedback...');
    try {
      const response = await fetch('/api/claude-proxy', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          apiKey: apiKey,
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1024,
          messages: [{ role: 'user', content: `You are an interview coach analyzing practice answers. 
  
  QUESTION: "${question}"
  
  EXPECTED KEY POINTS:
  ${expectedAnswer.bullets.filter(b => b).join('\n')}
  
  USER'S ANSWER:
  "${userAnswer}"
  
  Analyze the user's answer and provide scores (1-10) for:
  1. CONCISENESS - Is it focused and to-the-point, or rambling?
  2. ACCURACY - Does it cover the key points from the expected answer?
  3. FLUENCY - Is it smooth and well-articulated, or full of filler words?
  4. IMPACT - Is it memorable and compelling?
  
  Also provide 2-3 specific, actionable suggestions for improvement.
  
  Respond in this exact JSON format:
  {
    "conciseness": <score>,
    "accuracy": <score>,
    "fluency": <score>,
    "impact": <score>,
    "overall": <average score>,
    "strengths": ["strength 1", "strength 2"],
    "improvements": ["improvement 1", "improvement 2", "improvement 3"]
  }` }]
        })
      });
      console.log('API status:', response.status);
      console.log('API status:', response.status);
      if (!response.ok) { const errorText = await response.text(); console.error('API error:', errorText); throw new Error(`API error: ${response.status}`); }
      const data = await response.json();
      console.log('Got response');
      if (data.content && data.content[0] && data.content[0].text) {
        const feedbackText = data.content[0].text;
        const jsonMatch = feedbackText.match(/\{[\s\S]*\}/);
        if (jsonMatch) { const feedback = JSON.parse(jsonMatch[0]); console.log('Parsed'); setIsAnalyzing(false); return feedback; }
      }
      throw new Error('Invalid response format');
    } catch (error) {
      console.error('AI error:', error);
      setIsAnalyzing(false);
      if (error.message.includes('401')) alert('Invalid API key. Check Settings.');
      else if (error.message.includes('429')) alert('Rate limit. Wait and try again.');
      else alert(`Error: ${error.message}\nCheck console (F12)`);
      return null;
    }
  };

  // QUESTION MANAGEMENT
  const addQuestion = async (question) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert('Please sign in to add questions');
      return;
    }

    const { data, error } = await supabase
      .from('questions')
      .insert([{
        user_id: user.id,
        question: question.question,
        category: question.category,
        priority: question.priority,
        bullets: question.bullets || [],
        narrative: question.narrative || '',
        keywords: question.keywords || []
      }])
      .select()
      .single();

    if (error) throw error;

    // Reload questions to get practice stats
    await loadQuestions();
    console.log('✅ Question saved to Supabase');
  } catch (error) {
    console.error('❌ Error adding question:', error);
    alert('Failed to save question: ' + error.message);
  }
};
  const updateQuestion = async (id, updatedQ) => {
  try {
    const { error } = await supabase
      .from('questions')
      .update({
        question: updatedQ.question,
        category: updatedQ.category,
        priority: updatedQ.priority,
        bullets: updatedQ.bullets || [],
        narrative: updatedQ.narrative || '',
        keywords: updatedQ.keywords || []
      })
      .eq('id', id);

    if (error) throw error;

    // Reload questions to get updated stats
    await loadQuestions();
    console.log('✅ Question updated in Supabase');
  } catch (error) {
    console.error('❌ Error updating question:', error);
    alert('Failed to update question: ' + error.message);
  }
};
  const deleteQuestion = async (id) => {
  if (!confirm('Delete?')) return;
  
  try {
    const { error } = await supabase
      .from('questions')
      .delete()
      .eq('id', id);

    if (error) throw error;

    setQuestions(questions.filter(q => q.id !== id));
    console.log('✅ Question deleted from Supabase');
  } catch (error) {
    console.error('❌ Error deleting question:', error);
    alert('Failed to delete question: ' + error.message);
  }
};
  const exportQuestions = () => { const dataStr = JSON.stringify(questions, null, 2); const blob = new Blob([dataStr], { type: 'application/json' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = `isl-questions-${Date.now()}.json`; link.click(); };
  const importQuestions = async (jsonData) => { 
    try { 
      const imported = JSON.parse(jsonData); 
      if (!Array.isArray(imported)) {
        alert('Invalid format: Expected an array of questions');
        return;
      }
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('Please sign in to import questions');
        return;
      }
      
      // Import to Supabase
      const questionsToImport = imported.map(q => ({
        user_id: user.id,
        question: q.question,
        category: q.category || 'Imported',
        priority: q.priority || 'Standard',
        bullets: q.bullets || [],
        narrative: q.narrative || '',
        keywords: q.keywords || []
      }));
      
      const { data, error } = await supabase
        .from('questions')
        .insert(questionsToImport)
        .select();
      
      if (error) throw error;
      
      // Reload questions to get the imported ones with IDs
      await loadQuestions();
      
      alert(`✅ Imported ${data.length} questions!`); 
    } catch (error) { 
      console.error('Import error:', error);
      alert('Failed to import: ' + error.message); 
    } 
  };

  // MODE STARTERS
  const startPrompterMode = () => { accumulatedTranscript.current = ''; if (questions.length === 0) { alert('Add questions first!'); return; } setCurrentMode('prompter'); setCurrentView('prompter'); setMatchedQuestion(null); setTranscript(''); };
 const startAIInterviewer = async () => { 
    accumulatedTranscript.current = ''; 
    if (questions.length === 0) { alert('Add questions first!'); return; } 

    const usageCheck = await checkAndIncrementUsage();
    if (!usageCheck.allowed) {
      const limit = usageCheck.tier === 'free' ? '25' : '100';
      alert(`⚠️ Monthly Limit Reached\n\nYou've used all ${limit} sessions this month.\n\nUpgrade to Pro for 100 sessions/month!`);

      return;
    }

    const randomQ = questions[Math.floor(Math.random() * questions.length)]; 
    setCurrentQuestion(randomQ); 
    setCurrentMode('ai-interviewer'); 
    setCurrentView('ai-interviewer'); 
    setUserAnswer(''); 
    setSpokenAnswer(''); 
    setFeedback(null); 
    setConversationHistory([]);
setFollowUpQuestion(null);
setExchangeCount(0);
    setTimeout(() => { speakText(randomQ.question); }, 500); 
  };
const startPracticeMode = async () => { 
    accumulatedTranscript.current = ''; 
    if (questions.length === 0) { alert('Add questions first!'); return; }

    const usageCheck = await checkAndIncrementUsage();
    if (!usageCheck.allowed) {
      const limit = usageCheck.tier === 'free' ? '25' : '100';
      alert(`⚠️ Monthly Limit Reached\n\nYou've used all ${limit} sessions this month.\n\nUpgrade to Pro for 100 sessions/month!`);

      return;
    }

    const randomQ = questions[Math.floor(Math.random() * questions.length)]; 
    setCurrentQuestion(randomQ); 
    setCurrentMode('practice'); 
    setCurrentView('practice'); 
    setUserAnswer(''); 
    setSpokenAnswer(''); 
    setFeedback(null); 
  };
  const startFlashcardMode = () => { if (questions.length === 0) { alert('Add questions first!'); return; } let available = questions; if (filterCategory !== 'All') available = available.filter(q => q.category === filterCategory); if (available.length === 0) { alert('No matching questions!'); return; } const sorted = [...available].sort((a, b) => { if (a.practiceCount === 0) return -1; if (b.practiceCount === 0) return 1; return a.averageScore - b.averageScore; }); setCurrentQuestion(sorted[0]); setCurrentMode('flashcard'); setCurrentView('flashcard'); setFlashcardSide('question'); setShowBullets(false); setShowNarrative(false); };

  // ==========================================
  // RENDERS START HERE
  // ==========================================



// HOME
  if (currentView === 'home') {
    const categories = ['All', ...new Set(questions.map(q => q.category))];
    const priorities = ['All', ...new Set(questions.map(q => q.priority))];
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-12">
            <h1 className="text-6xl font-bold text-white mb-4">ISL</h1>
            {/* Header with Profile */}
          <div className="flex items-center justify-between mb-8">
            <div></div>
            <div className="relative">
              <button
              data-tutorial="menu"
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="flex items-center gap-3 bg-white/10 hover:bg-white/20 backdrop-blur-lg rounded-full px-6 py-3 text-white transition-all border border-white/20"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center font-bold">
  {currentUser?.email?.charAt(0).toUpperCase() || 'U'}
</div>
<span className={`transition-transform ${showProfileDropdown ? 'rotate-180' : ''}`}>▼</span>
              </button>

              {/* Dropdown */}
              {showProfileDropdown && (
                <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl overflow-hidden z-50">
                  <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 text-white">
<p className="font-bold text-lg">
  {currentUser?.user_metadata?.full_name || currentUser?.email?.split('@')[0] || 'User'}
</p>
<p className="text-sm opacity-70">{currentUser?.email}</p>
                  </div>
<button
  onClick={async (e) => {
    e.stopPropagation();
    // DON'T close dropdown yet
    if (confirm('Are you sure you want to sign out?')) {
      setShowProfileDropdown(false);  // ← MOVE THIS HERE
      try {
  console.log('Starting sign out...');
  
  const { error } = await supabase.auth.signOut({ scope: 'global' });

if (error) {
  console.error('Sign out error:', error);
  alert('Failed to sign out: ' + error.message);
} else {
  console.log('✅ Signed out successfully');
  
  // Clear only auth-related items, keep API key
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    // Keep API key, remove everything else
    if (key !== 'isl_api_key') {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(key => localStorage.removeItem(key));
  
  // Clear session storage
  sessionStorage.clear();
  
  // Reload to login screen
  window.location.href = '/';
}
      } catch (err) {
        console.error('Sign out exception:', err);
        alert('Error signing out');
      }
    }
  }}
  className="w-full px-4 py-3 text-left hover:bg-gray-50 transition flex items-center gap-3 text-gray-700"
>
  <X className="w-5 h-5 text-red-600" />
  <span className="font-semibold">Sign Out</span>
</button>
                </div>
              )}
            </div>
          </div>
            <p className="text-3xl text-indigo-200 mb-2">Interview as a Second Language</p>
            <p className="text-gray-300">Master interviews with AI-powered practice</p>
          </div>

          {/* Compact Stats Row - Professional */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 text-white hover:bg-white/15 transition-all duration-200">
              <div className="flex items-center gap-3">
                <Database className="w-8 h-8 text-indigo-300 flex-shrink-0" />
                <div>
                  <p className="text-2xl font-bold">{questions.length}</p>
                  <p className="text-xs text-gray-300">Questions</p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 text-white hover:bg-white/15 transition-all duration-200">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-green-300 flex-shrink-0" />
                <div>
                  <p className="text-2xl font-bold">{practiceHistory.length}</p>
                  <p className="text-xs text-gray-300">Sessions</p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 text-white hover:bg-white/15 transition-all duration-200">
              <div className="flex items-center gap-3">
                <Sparkles className="w-8 h-8 text-pink-300 flex-shrink-0" />
                <div>
                  <p className="text-2xl font-bold">{apiKey ? '✓' : '✗'}</p>
                  <p className="text-xs text-gray-300">AI Ready</p>
                </div>
              </div>
            </div>
            {usageStats && (
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 text-white hover:bg-white/15 transition-all duration-200">
                <div className="flex items-center gap-3">
                  <Zap className="w-8 h-8 text-yellow-300 flex-shrink-0" />
                  <div>
                    <p className="text-2xl font-bold">
                      {usageStats.session_count}/{usageStats.tier === 'free' ? '25' : usageStats.tier === 'pro' ? '100' : '∞'}
                    </p>
                    <p className="text-xs text-gray-300">
                      {usageStats.tier === 'free' ? 'Free' : usageStats.tier === 'pro' ? 'Pro' : 'Beta'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Start Tip - Compact */}
          {questions.length === 0 && (
            <div className="bg-blue-500/20 backdrop-blur-lg border-2 border-blue-400/30 rounded-xl p-4 text-white mb-6">
              <p className="text-sm font-semibold mb-1">👋 Quick Start:</p>
              <p className="text-xs text-blue-100">Click Command Center → Question Bank → Import templates to get started!</p>
            </div>
          )}

          {/* Practice Modes - Professional Grid */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-4">🎯 Practice Modes</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Live Prompter */}
              <div className="bg-white rounded-xl shadow-lg p-5 transition-all duration-200 hover:shadow-2xl hover:-translate-y-1 cursor-pointer group">
                <div className="text-center">
                  <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-200">
                    <Mic className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-bold mb-1">Live Prompter</h3>
                  <p className="text-gray-600 text-xs mb-3">Hold SPACEBAR → Show bullets</p>
                  <button onClick={startPrompterMode} className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-2.5 rounded-lg transition-all duration-200 text-sm">
                    Start
                  </button>
                </div>
              </div>

              {/* AI Interviewer */}
              <div className="bg-white rounded-xl shadow-lg p-5 transition-all duration-200 hover:shadow-2xl hover:-translate-y-1 cursor-pointer group">
                <div className="text-center">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-200">
                    <Bot className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-bold mb-1">AI Interviewer</h3>
                  <p className="text-gray-600 text-xs mb-3">AI asks, you answer</p>
                  <button onClick={startAIInterviewer} className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold py-2.5 rounded-lg transition-all duration-200 text-sm">
                    Start
                  </button>
                </div>
              </div>

              {/* Practice Mode */}
              <div className="bg-white rounded-xl shadow-lg p-5 transition-all duration-200 hover:shadow-2xl hover:-translate-y-1 cursor-pointer group">
                <div className="text-center">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-200">
                    <Target className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-bold mb-1">Practice</h3>
                  <p className="text-gray-600 text-xs mb-3">Get AI feedback</p>
                  <button onClick={startPracticeMode} className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-2.5 rounded-lg transition-all duration-200 text-sm">
                    Start
                  </button>
                </div>
              </div>

              {/* Flashcard */}
              <div className="bg-white rounded-xl shadow-lg p-5 transition-all duration-200 hover:shadow-2xl hover:-translate-y-1 cursor-pointer group">
                <div className="text-center">
                  <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-200">
                    <BookOpen className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-bold mb-1">Flashcard</h3>
                  <p className="text-gray-600 text-xs mb-3">Quick recall</p>
                  <button onClick={startFlashcardMode} className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold py-2.5 rounded-lg transition-all duration-200 text-sm">
                    Start
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Command Center - Professional Button */}
          <div data-tutorial="command-center" className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-xl p-6 hover:shadow-2xl transition-all duration-200 hover:-translate-y-0.5 cursor-pointer border-2 border-white/20" onClick={() => setCurrentView('command-center')}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-5xl">🎯</div>
                <div className="text-white">
                  <h3 className="text-xl font-bold mb-1">Command Center</h3>
                  <p className="text-sm text-indigo-100">Analytics • Queue • Interview Prep • Question Bank</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-white font-semibold">
                <span className="hidden md:inline">Open Dashboard</span>
                <span className="text-2xl">→</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // LIVE PROMPTER
  if (currentView === 'prompter') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => { stopListening(); setCurrentView('home'); setMatchedQuestion(null); }} className="text-gray-300 hover:text-white">← Exit</button>
            <div className="flex items-center gap-3">
              <div className={`w-4 h-4 rounded-full ${isListening ? 'bg-red-500 animate-pulse' : 'bg-gray-600'}`}></div>
              <span className="font-bold">
  {isListening ? 'LISTENING...' : showResumeToast ? '↻ Resumed' : 'Ready'}
</span>
            </div>
            {matchedQuestion && <button onClick={() => { setMatchedQuestion(null); setTranscript(''); }} className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg">Clear</button>}
          </div>
          {!matchedQuestion ? (
            <div className="text-center py-20">
              <div className="w-32 h-32 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8">
                <Mic className="w-16 h-16 text-white" />
              </div>
              <h2 className="text-4xl font-bold mb-4">Live Interview Prompter</h2>
              <p className="text-xl text-gray-300 mb-8">Hold SPACEBAR while interviewer asks question</p>
              <div className="max-w-md mx-auto">
                <button onMouseDown={startListening} onMouseUp={stopListening} onTouchStart={startListening} onTouchEnd={stopListening} className={`w-full py-8 rounded-2xl font-bold text-2xl transition ${isListening ? 'bg-red-600 animate-pulse' : 'bg-green-600 hover:bg-green-700'}`}>
                  {isListening ? 'Release to Stop' : 'Hold to Listen'}
                </button>
              </div>
              {transcript && (
                <div className="mt-8 bg-gray-800 rounded-lg p-6 max-w-2xl mx-auto">
                  <p className="text-sm text-gray-400 mb-2">Captured:</p>
                  <p className="text-lg">{transcript}</p>
                </div>
              )}
              <div className="mt-12 bg-blue-900/30 rounded-lg p-6 max-w-2xl mx-auto">
                <h4 className="font-bold mb-3">💡 How to Use:</h4>
                <ol className="text-left text-sm space-y-2">
                  <li>1. Place device near interview speakers</li>
                  <li>2. Hold SPACEBAR (or button) when question asked</li>
                  <li>3. Release when done</li>
                  <li>4. Your bullets appear!</li>
                </ol>
              </div>
            </div>
          ) : (
            <div className="max-w-5xl mx-auto">
              <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl p-8 mb-6 shadow-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <CheckCircle className="w-10 h-10" />
                  <h2 className="text-3xl font-bold">Matched!</h2>
                </div>
                <div className="bg-white/20 backdrop-blur rounded-lg p-6">
                  <h3 className="text-4xl font-bold">{matchedQuestion.question}</h3>
                </div>
              </div>
              <div className="bg-gray-800 rounded-2xl p-8 mb-6">
                <h4 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <Target className="w-8 h-8 text-yellow-400" />
                  Your Key Points:
                </h4>
                <ul className="space-y-4">
                  {matchedQuestion.bullets.filter(b => b).map((bullet, idx) => (
                    <li key={idx} className="flex items-start gap-4">
                      <span className="flex-shrink-0 w-10 h-10 bg-yellow-500 text-gray-900 rounded-full flex items-center justify-center text-lg font-bold">
                        {idx + 1}
                      </span>
                      <span className="text-2xl leading-relaxed">{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
{matchedQuestion.narrative && (
                <div className="mb-6">
                  <button 
                    onClick={() => setShowNarrative(!showNarrative)} 
                    className="w-full bg-purple-600 hover:bg-purple-700 py-4 rounded-lg font-bold text-lg flex items-center justify-center gap-2 mb-4"
                  >
                    {showNarrative ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
                    {showNarrative ? 'Hide' : 'Show'} Full Narrative
                  </button>
                  {showNarrative && (
                    <div className="bg-gray-800 rounded-2xl p-8">
                      <h4 className="text-xl font-bold mb-4">Full Narrative:</h4>
                      <p className="text-xl leading-relaxed whitespace-pre-line">{matchedQuestion.narrative}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Floating Mic Button */}
              <div className="fixed bottom-8 right-8 z-50">
                <button
                  onMouseDown={startListening}
                  onMouseUp={stopListening}
                  onTouchStart={startListening}
                  onTouchEnd={stopListening}
                  className="relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl bg-green-500 hover:bg-green-600"
                >
                  {isListening && (
                    <>
                      <div className="ripple-ring w-20 h-20 text-red-300"></div>
                      <div className="ripple-ring w-20 h-20 text-red-300"></div>
                      <div className="ripple-ring w-20 h-20 text-red-300"></div>
                    </>
                  )}
                  <Mic className="w-10 h-10 text-white z-10" />
                </button>
                <div className="text-center mt-2">
                  <span className="text-xs font-bold text-gray-400">
                    Hold to Start
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }



  // FILE 1 END - More views in File 2
 // ==========================================
  // FILE 2 OF 2 - AI INTERVIEWER, PRACTICE, FLASHCARD
  // PASTE THIS RIGHT AFTER "return null;" in File 1
  // REPLACE the "return null;" line with this code
  // ==========================================

  // AI INTERVIEWER - WITH CLOUD AVATAR & SPEECH INPUT
  if (currentView === 'ai-interviewer' && currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 to-pink-900">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6 text-white">
            <button onClick={() => { stopSpeaking(); setCurrentView('home'); }} className="text-gray-300 hover:text-white">← Exit</button>
            <h1 className="text-2xl font-bold">AI Mock Interview</h1>
            <button onClick={startAIInterviewer} className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg">Next</button>
          </div>
          
          <div className="max-w-4xl mx-auto mb-8">
            {/* CLOUD AVATAR CONTAINER */}
            <div className="relative bg-gradient-to-br from-purple-800/50 to-pink-800/50 backdrop-blur-lg rounded-3xl p-12 shadow-2xl">
              {/* Animated Cloud Avatar */}
              <div className="flex justify-center mb-8">
                <div className="relative">
                  <div className={`relative w-48 h-32 transition-all duration-300 ${aiSpeaking ? 'scale-110' : 'scale-100'}`}>
                    {/* Cloud body */}
                    <div className={`absolute inset-0 rounded-full opacity-90 ${aiSpeaking ? 'bg-gradient-to-br from-pink-400 via-purple-500 to-indigo-600 animate-pulse' : 'bg-gradient-to-br from-purple-400 via-pink-500 to-purple-600'}`}></div>
                    {/* Cloud bumps */}
                    <div className={`absolute top-0 left-8 w-24 h-24 rounded-full opacity-80 ${aiSpeaking ? 'bg-pink-300' : 'bg-purple-300'}`}></div>
                    <div className={`absolute top-2 right-8 w-20 h-20 rounded-full opacity-80 ${aiSpeaking ? 'bg-indigo-300' : 'bg-pink-300'}`}></div>
                    <div className={`absolute bottom-0 left-12 w-28 h-20 rounded-full opacity-70 ${aiSpeaking ? 'bg-purple-400' : 'bg-purple-400'}`}></div>
                    {/* Face */}
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                      <Brain className="w-16 h-16 text-white opacity-90" />
                    </div>
                    {/* Sound waves */}
                    {aiSpeaking && (
                      <>
                        <div className="absolute -right-8 top-1/2 transform -translate-y-1/2">
                          <div className="w-2 h-8 bg-pink-400 rounded-full animate-pulse"></div>
                        </div>
                        <div className="absolute -right-12 top-1/2 transform -translate-y-1/2">
                          <div className="w-2 h-12 bg-purple-400 rounded-full animate-pulse" style={{animationDelay: '0.1s'}}></div>
                        </div>
                        <div className="absolute -right-16 top-1/2 transform -translate-y-1/2">
                          <div className="w-2 h-6 bg-indigo-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                        </div>
                        <div className="absolute -left-8 top-1/2 transform -translate-y-1/2">
                          <div className="w-2 h-8 bg-pink-400 rounded-full animate-pulse"></div>
                        </div>
                        <div className="absolute -left-12 top-1/2 transform -translate-y-1/2">
                          <div className="w-2 h-12 bg-purple-400 rounded-full animate-pulse" style={{animationDelay: '0.1s'}}></div>
                        </div>
                        <div className="absolute -left-16 top-1/2 transform -translate-y-1/2">
                          <div className="w-2 h-6 bg-indigo-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              {/* AI Name */}
              <h3 className="text-3xl font-bold text-white text-center mb-6">
                {aiSpeaking ? '🎙️ AI Interviewer Speaking...' : '💭 AI Interviewer'}
              </h3>
              
              {/* SUBTITLE DISPLAY */}
              <div className="relative min-h-32">
                {aiSubtitle ? (
                  <div className="bg-black/70 backdrop-blur rounded-2xl p-8 border-2 border-white/30 shadow-xl">
                    <div className="flex items-start gap-4">
                      <Volume2 className="w-8 h-8 text-pink-400 flex-shrink-0 animate-pulse" />
                      <p className="text-3xl text-white font-medium leading-relaxed">"{aiSubtitle}"</p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white/20 backdrop-blur rounded-2xl p-6 border-2 border-white/20">
<p className="text-2xl text-white/90 text-center italic">{followUpQuestion || currentQuestion.question}</p>
                  </div>
                )}
              </div>
              
              {/* Status */}
              <div className="mt-6 flex items-center justify-center gap-3">
                {aiSpeaking ? (
                  <>
                    <div className="w-3 h-3 bg-pink-400 rounded-full animate-ping"></div>
                    <span className="text-pink-300 font-medium">AI is asking the question...</span>
                  </>
                ) : (
                  <>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    <span className="text-green-300 font-medium">Ready for your answer</span>
                  </>
                )}
              </div>
            </div>
          </div>
          
          {/* INPUT SECTION - Only show when NO feedback */}
          {!feedback && (
            <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl p-8">
              <h3 className="text-2xl font-bold mb-6">Your Answer:</h3>
              
              {/* SPEECH INPUT SECTION */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-lg p-6 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <Mic className={`w-6 h-6 ${isListening ? 'text-red-600 animate-pulse' : 'text-blue-600'}`} />
                  <h4 className="font-bold text-blue-900">
                    {isListening ? 'Listening to your answer...' : 'Answer with Voice or Text'}
                  </h4>
                </div>
                <button
                  onMouseDown={startListening}
                  onMouseUp={stopListening}
                  onTouchStart={startListening}
                  onTouchEnd={stopListening}
                  className={`w-full py-6 rounded-lg font-bold text-lg transition mb-4 ${isListening ? 'bg-red-600 text-white animate-pulse' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                >
                  {isListening ? '🎤 Release to Stop Recording' : '🎤 Hold to Speak Your Answer'}
                </button>
                <p className="text-xs text-center text-gray-600">Hold SPACEBAR or this button to speak. Your answer will appear below.</p>
              </div>
              
              {/* Live Transcript */}
              {(spokenAnswer || transcript) && (
                <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-6 mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Volume2 className="w-5 h-5 text-gray-600" />
                      <h4 className="font-bold text-gray-900">{isListening ? 'Transcribing...' : 'Your Spoken Answer:'}</h4>
                    </div>
                    <button
                      onClick={() => {
                        setSpokenAnswer('');
                        setTranscript('');
                        accumulatedTranscript.current = '';
                      }}
                      className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 text-sm font-semibold rounded"
                    >
                      Clear Answer
                    </button>
                  </div>
                  <p className="text-lg text-gray-800 leading-relaxed">{spokenAnswer || transcript || 'Start speaking...'}</p>
                  <p className="text-xs text-gray-500 mt-2">📊 Word count: {(spokenAnswer || transcript).split(' ').filter(w => w).length}</p>
                </div>
              )}
              
{/* Text Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Or type your answer:</label>
                <textarea
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg h-32 focus:ring-2 focus:ring-purple-500"
                  placeholder="Type your answer here (or use voice above)..."
                />
                
                {/* Help Button - Below Textarea */}
                <div className="mt-2 flex justify-center">
                  {(usageStats?.tier === 'pro' || usageStats?.tier === 'premium' || usageStats?.tier === 'beta') ? (
                    <button
                      onClick={() => {
                        console.log('Help button clicked!');
                        console.log('Current question:', currentQuestion);
                        setAnswerAssistantQuestion(currentQuestion);
                        setShowAnswerAssistant(true);
                      }}
                      className="text-sm bg-gradient-to-r from-indigo-100 to-purple-100 hover:from-indigo-200 hover:to-purple-200 text-indigo-700 px-4 py-2 rounded-lg font-semibold transition flex items-center gap-2"
                    >
                      <Lightbulb className="w-4 h-4" />
                      💡 Can't Think of an Answer? AI Can Help
                    </button>
                  ) : (
                    <button
                      onClick={() => alert('⭐ Pro Feature\n\nUpgrade to Pro ($19.99/month) to use the AI Answer Coach!\n\n✓ AI guides you through developing answers\n✓ Auto-generates bullet points\n✓ Saves to all your question modes')}
                      className="text-sm bg-gradient-to-r from-yellow-100 to-amber-100 hover:from-yellow-200 hover:to-amber-200 text-yellow-800 px-4 py-2 rounded-lg font-semibold transition flex items-center gap-2"
                    >
                      <Crown className="w-4 h-4" />
                      💡 Can't Think of an Answer? Upgrade for AI Help
                    </button>
                  )}
                </div>
              </div>
              
              <button
onClick={async () => {
  const answer = (spokenAnswer || userAnswer || '').trim();
  console.log('Answer being used:', answer);

  if (!answer) {
    alert('Please provide an answer (speak or type)');
    return;
  }

  setIsAnalyzing(true);
  const userContext = getUserContext();
  
  try {
    const { data: { session } } = await supabase.auth.getSession();

    const response = await fetch(
      'https://tzrlpwtkrtvjpdhcaayu.supabase.co/functions/v1/ai-feedback',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionText: followUpQuestion || currentQuestion.question,
          userAnswer: answer,
          expectedBullets: currentQuestion.bullets || [],
          userContext: userContext,
          mode: 'ai-interviewer',
          conversationHistory: conversationHistory,
          exchangeCount: exchangeCount
        }),
      }
    );

    const data = await response.json();
    console.log('Full response data:', data);

    if (!response.ok) {
      console.error('Error from Supabase function:', data.error);
      throw new Error(
        data.error?.message || data.error || 'Failed to get feedback'
      );
    }

    let feedbackJson;

    if (data.content && data.content[0]) {
      let feedbackText = data.content[0].text;
      console.log('Raw AI text:', feedbackText);

      const jsonMatch = feedbackText.match(/\{[\s\S]*\}/);
      if (jsonMatch) feedbackText = jsonMatch[0];

      feedbackJson = JSON.parse(feedbackText);
    } else {
      feedbackJson = data;
    }

    // CHECK IF CONVERSATION SHOULD CONTINUE
    if (feedbackJson.continue_conversation && feedbackJson.follow_up_question) {
      // Add current exchange to history
      setConversationHistory([
        ...conversationHistory,
        {
          question: followUpQuestion || currentQuestion.question,
          answer: answer
        }
      ]);
      
      // Set the follow-up question
      setFollowUpQuestion(feedbackJson.follow_up_question);
      
      // Increment exchange count
      setExchangeCount(exchangeCount + 1);
      
      // Clear answer fields for next exchange
      setUserAnswer('');
      setSpokenAnswer('');
      accumulatedTranscript.current = '';
      
      // Speak the follow-up question
      setTimeout(() => {
        speakText(feedbackJson.follow_up_question);
      }, 500);
      
      console.log('✅ Conversation continuing - Exchange', exchangeCount + 1);
      
    } else {
      // CONVERSATION ENDED - Show final feedback
      // Build complete conversation summary
      const fullConversation = [
        ...conversationHistory,
        {
          question: followUpQuestion || currentQuestion.question,
          answer: answer
        }
      ];
      
      // Create a text summary of the entire conversation
      const conversationSummary = fullConversation
        .map((exchange, idx) => `Q${idx + 1}: ${exchange.question}\nA${idx + 1}: ${exchange.answer}`)
        .join('\n\n');
      
      // Save with conversation history in feedback
      const feedbackWithConversation = {
        ...feedbackJson,
        conversation_history: fullConversation
      };
      
      await savePracticeSession(currentQuestion, conversationSummary, feedbackWithConversation);

      setFeedback(feedbackJson);
      setPracticeHistory([
        ...practiceHistory,
        {
          question: currentQuestion.question,
          answer,
          feedback: feedbackJson,
          date: new Date().toISOString(),
        },
      ]);
      
      console.log('✅ Conversation ended - Showing feedback');
    }
    
  } catch (error) {
    console.error('Feedback error:', error);
    alert('Failed to get feedback: ' + error.message);
  } finally {
    setIsAnalyzing(false);
  }
}}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 rounded-lg disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    AI Analyzing Your Answer...
                  </>
                ) : (
                  <>
                    <Brain className="w-5 h-5" />
                    Get AI Feedback
                  </>
                )}
              </button>
            </div>
          )}

 {feedback && (
  <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl p-8">
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-3xl font-bold">Your Performance</h3>
      
      {/* Show All Button - appears after score animation */}
      {revealStage > 0 && revealStage < 7 && !showAllFeedback && (
        <button
          onClick={() => {
            setShowAllFeedback(true);
            setRevealStage(7);
          }}
          className="text-sm bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-4 py-2 rounded-lg font-semibold transition-all"
        >
          ⚡ Show All
        </button>
      )}
    </div>
    
    {/* ==================== OVERALL SCORE - Always visible, animates ==================== */}
    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-8 text-white text-center mb-8 shadow-xl fade-in-up">
      <p className="text-2xl mb-2">Overall Score</p>
      <p className="text-8xl font-black tracking-tight mb-2" style={{textShadow: '0 4px 12px rgba(0,0,0,0.3)'}}>
        {animatedScore.toFixed(1)}
      </p>
      <p className="text-xl opacity-90">out of 10</p>
      <div className="mt-4 w-full bg-white/20 rounded-full h-3">
        <div 
          className="bg-white h-3 rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${(animatedScore / 10) * 100}%` }}
        ></div>
      </div>
    </div>

    {/* ==================== IDEAL ANSWER - Stage 1 ==================== */}
    {feedback.ideal_answer && isSectionVisible(1) && (
      <div className={`mb-6 feedback-section ${isSectionVisible(1) ? 'visible' : ''}`}>
        <button 
          onClick={() => setShowIdealAnswer(!showIdealAnswer)}
          className="w-full bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border-2 border-blue-300 rounded-xl p-5 flex items-center justify-between transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-2xl">💡</span>
            </div>
            <div className="text-left">
              <span className="font-bold text-blue-900 text-lg block">Example of Strong Answer</span>
              <span className="text-sm text-blue-700">Click to compare with your response</span>
            </div>
          </div>
          <span className="text-blue-600 text-2xl font-bold">{showIdealAnswer ? '▼' : '▶'}</span>
        </button>
        
        {showIdealAnswer && (
          <div className="mt-4 grid md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl border-2 border-blue-200 fade-in-up">
            <div className="bg-white rounded-lg p-5 border-2 border-gray-300">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-lg">👤</span>
                </div>
                <h5 className="font-bold text-gray-900">Your Answer</h5>
              </div>
              <p className="text-gray-800 leading-relaxed text-sm">{spokenAnswer || userAnswer}</p>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-5 border-2 border-blue-400">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-lg">⭐</span>
                </div>
                <h5 className="font-bold text-blue-900">Strong Example</h5>
              </div>
              <p className="text-blue-900 leading-relaxed text-sm">{feedback.ideal_answer}</p>
            </div>
          </div>
        )}
      </div>
    )}

    {/* ==================== STRENGTHS - Stage 2 ==================== */}
    {feedback.strengths && feedback.strengths.length > 0 && isSectionVisible(2) && (
      <div className={`mb-6 feedback-section ${isSectionVisible(2) ? 'visible' : ''}`}>
        <button
          onClick={() => setShowStrengths(!showStrengths)}
          className="w-full bg-green-50 hover:bg-green-100 border-2 border-green-300 rounded-xl p-4 flex items-center justify-between transition-all mb-3"
        >
          <h4 className="font-bold text-green-900 text-xl flex items-center gap-2">
            <span className="text-3xl">✓</span> 
            <span>Strengths ({feedback.strengths.length})</span>
          </h4>
          <span className="text-green-600 text-xl font-bold">{showStrengths ? '▼' : '▶'}</span>
        </button>
        
        {showStrengths && (
          <div className="grid gap-3 pl-4">
            {feedback.strengths.map((s, i) => (
              <div key={i} className="bg-green-50 border-l-4 border-green-500 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold">
                    {i + 1}
                  </div>
                  <p className="text-green-900 flex-1">{s}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )}

    {/* ==================== GAPS - Stage 3 ==================== */}
    {feedback.gaps && feedback.gaps.length > 0 && isSectionVisible(3) && (
      <div className={`mb-6 feedback-section ${isSectionVisible(3) ? 'visible' : ''}`}>
        <button
          onClick={() => setShowGaps(!showGaps)}
          className="w-full bg-amber-50 hover:bg-amber-100 border-2 border-amber-300 rounded-xl p-4 flex items-center justify-between transition-all mb-3"
        >
          <h4 className="font-bold text-amber-900 text-xl flex items-center gap-2">
            <span className="text-3xl">📈</span> 
            <span>Growth Areas ({feedback.gaps.length})</span>
          </h4>
          <span className="text-amber-600 text-xl font-bold">{showGaps ? '▼' : '▶'}</span>
        </button>
        
        {showGaps && (
          <div className="grid gap-3 pl-4">
            {feedback.gaps.map((gap, i) => (
              <div key={i} className="bg-amber-50 border-l-4 border-amber-500 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-amber-500 text-white rounded-full flex items-center justify-center font-bold">
                    {i + 1}
                  </div>
                  <p className="text-amber-900 flex-1">{gap}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )}

    {/* ==================== ACTION STEPS - Stage 4 ==================== */}
    {feedback.specific_improvements && feedback.specific_improvements.length > 0 && isSectionVisible(4) && (
      <div className={`mb-6 feedback-section ${isSectionVisible(4) ? 'visible' : ''}`}>
        <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-4 mb-3">
          <h4 className="font-bold text-blue-900 text-xl flex items-center gap-2">
            <span className="text-3xl">🎯</span> 
            <span>Action Steps ({feedback.specific_improvements.length})</span>
          </h4>
          <p className="text-sm text-blue-700 mt-1">Specific ways to improve your answer</p>
        </div>
        
        <div className="grid gap-3 pl-4">
          {feedback.specific_improvements.map((imp, i) => (
            <div key={i} className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center text-lg font-bold">
                  {i + 1}
                </div>
                <p className="text-blue-900 flex-1 leading-relaxed">{imp}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    )}

    {/* ==================== STAR FRAMEWORK - Stage 5 ==================== */}
    {feedback.framework_analysis && isSectionVisible(5) && (
      <div className={`mb-6 feedback-section ${isSectionVisible(5) ? 'visible' : ''}`}>
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-300 rounded-xl p-4 mb-4">
          <h4 className="font-bold text-purple-900 text-xl flex items-center gap-2">
            <span className="text-3xl">⭐</span> 
            <span>STAR Framework Analysis</span>
          </h4>
          <p className="text-sm text-purple-700 mt-1">How your answer maps to the STAR method</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          {/* Situation */}
          <div className={`rounded-xl p-5 border-2 transition-all ${
            feedback.framework_analysis.situation && !feedback.framework_analysis.situation.toLowerCase().includes('missing') && !feedback.framework_analysis.situation.toLowerCase().includes('not provided')
              ? 'bg-green-50 border-green-400' 
              : 'bg-gray-50 border-gray-300'
          }`}>
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                feedback.framework_analysis.situation && !feedback.framework_analysis.situation.toLowerCase().includes('missing') && !feedback.framework_analysis.situation.toLowerCase().includes('not provided')
                  ? 'bg-green-500' 
                  : 'bg-gray-400'
              }`}>
                <span className="text-2xl">📍</span>
              </div>
              <h5 className="font-bold text-gray-900">Situation</h5>
            </div>
            <p className="text-gray-800 text-sm leading-relaxed">{feedback.framework_analysis.situation || 'Not provided'}</p>
          </div>
          
          {/* Task */}
          <div className={`rounded-xl p-5 border-2 transition-all ${
            feedback.framework_analysis.task && !feedback.framework_analysis.task.toLowerCase().includes('missing') && !feedback.framework_analysis.task.toLowerCase().includes('not provided')
              ? 'bg-green-50 border-green-400' 
              : 'bg-gray-50 border-gray-300'
          }`}>
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                feedback.framework_analysis.task && !feedback.framework_analysis.task.toLowerCase().includes('missing') && !feedback.framework_analysis.task.toLowerCase().includes('not provided')
                  ? 'bg-green-500' 
                  : 'bg-gray-400'
              }`}>
                <span className="text-2xl">🎯</span>
              </div>
              <h5 className="font-bold text-gray-900">Task</h5>
            </div>
            <p className="text-gray-800 text-sm leading-relaxed">{feedback.framework_analysis.task || 'Not provided'}</p>
          </div>
          
          {/* Action */}
          <div className={`rounded-xl p-5 border-2 transition-all ${
            feedback.framework_analysis.action && !feedback.framework_analysis.action.toLowerCase().includes('missing') && !feedback.framework_analysis.action.toLowerCase().includes('not provided')
              ? 'bg-green-50 border-green-400' 
              : 'bg-gray-50 border-gray-300'
          }`}>
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                feedback.framework_analysis.action && !feedback.framework_analysis.action.toLowerCase().includes('missing') && !feedback.framework_analysis.action.toLowerCase().includes('not provided')
                  ? 'bg-green-500' 
                  : 'bg-gray-400'
              }`}>
                <span className="text-2xl">⚡</span>
              </div>
              <h5 className="font-bold text-gray-900">Action</h5>
            </div>
            <p className="text-gray-800 text-sm leading-relaxed">{feedback.framework_analysis.action || 'Not provided'}</p>
          </div>
          
          {/* Result */}
          <div className={`rounded-xl p-5 border-2 transition-all ${
            feedback.framework_analysis.result && !feedback.framework_analysis.result.toLowerCase().includes('missing') && !feedback.framework_analysis.result.toLowerCase().includes('not provided')
              ? 'bg-green-50 border-green-400' 
              : 'bg-gray-50 border-gray-300'
          }`}>
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                feedback.framework_analysis.result && !feedback.framework_analysis.result.toLowerCase().includes('missing') && !feedback.framework_analysis.result.toLowerCase().includes('not provided')
                  ? 'bg-green-500' 
                  : 'bg-gray-400'
              }`}>
                <span className="text-2xl">🏆</span>
              </div>
              <h5 className="font-bold text-gray-900">Result</h5>
            </div>
            <p className="text-gray-800 text-sm leading-relaxed">{feedback.framework_analysis.result || 'Not provided'}</p>
          </div>
        </div>
        
        {/* STAR Completeness Meter */}
        <div className="mt-4 bg-white rounded-lg p-4 border-2 border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700">STAR Completeness:</span>
            <span className="text-lg font-bold text-purple-600">
              {[
                feedback.framework_analysis.situation && !feedback.framework_analysis.situation.toLowerCase().includes('missing'),
                feedback.framework_analysis.task && !feedback.framework_analysis.task.toLowerCase().includes('missing'),
                feedback.framework_analysis.action && !feedback.framework_analysis.action.toLowerCase().includes('missing'),
                feedback.framework_analysis.result && !feedback.framework_analysis.result.toLowerCase().includes('missing')
              ].filter(Boolean).length}/4
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500"
              style={{ 
                width: `${([
                  feedback.framework_analysis.situation && !feedback.framework_analysis.situation.toLowerCase().includes('missing'),
                  feedback.framework_analysis.task && !feedback.framework_analysis.task.toLowerCase().includes('missing'),
                  feedback.framework_analysis.action && !feedback.framework_analysis.action.toLowerCase().includes('missing'),
                  feedback.framework_analysis.result && !feedback.framework_analysis.result.toLowerCase().includes('missing')
                ].filter(Boolean).length / 4) * 100}%` 
              }}
            ></div>
          </div>
        </div>
      </div>
    )}

    {/* ==================== KEY POINTS COVERAGE - Stage 6 ==================== */}
    {(feedback.points_covered || feedback.points_missed) && isSectionVisible(6) && (
      <div className={`bg-gray-50 rounded-xl p-6 mb-6 border-2 border-gray-300 feedback-section ${isSectionVisible(6) ? 'visible' : ''}`}>
        <h4 className="font-bold text-gray-900 text-xl mb-4 flex items-center gap-2">
          <span className="text-2xl">📊</span>
          <span>Key Points Coverage</span>
        </h4>
        
        {feedback.points_covered && feedback.points_covered.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-semibold text-green-700 mb-2 flex items-center gap-2">
              <span className="text-lg">✓</span> Covered ({feedback.points_covered.length})
            </p>
            <ul className="space-y-2">
              {feedback.points_covered.map((p, i) => (
                <li key={i} className="text-green-800 text-sm flex items-start gap-2 bg-green-50 p-2 rounded">
                  <span className="text-green-600">●</span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {feedback.points_missed && feedback.points_missed.length > 0 && (
          <div>
            <p className="text-sm font-semibold text-red-700 mb-2 flex items-center gap-2">
              <span className="text-lg">✗</span> Missed ({feedback.points_missed.length})
            </p>
            <ul className="space-y-2">
              {feedback.points_missed.map((p, i) => (
                <li key={i} className="text-red-800 text-sm flex items-start gap-2 bg-red-50 p-2 rounded">
                  <span className="text-red-600">●</span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    )}

    {/* ==================== ACTION BUTTONS - Stage 7 ==================== */}
    {isSectionVisible(7) && (
      <div className={`flex gap-4 feedback-section ${isSectionVisible(7) ? 'visible' : ''}`}>
        <button 
          onClick={() => { 
            setFeedback(null); 
            setUserAnswer(''); 
            setSpokenAnswer(''); 
            accumulatedTranscript.current = '';
          }} 
          className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-4 rounded-xl transition-all hover:scale-105 shadow-lg"
        >
          🔄 Try Again
        </button>
        <button 
          onClick={() => { 
            setFeedback(null); 
            setUserAnswer(''); 
            setSpokenAnswer(''); 
            accumulatedTranscript.current = '';
            currentMode === 'ai-interviewer' ? startAIInterviewer() : startPracticeMode(); 
          }} 
          className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 rounded-xl transition-all hover:scale-105 shadow-lg"
        >
          ➡️ Next Question
        </button>
      </div>
    )}
  </div>
)}
        </div>
        
        {/* Answer Assistant Modal */}
        {showAnswerAssistant && answerAssistantQuestion && (
          <AnswerAssistant
            question={answerAssistantQuestion.question}
            questionId={answerAssistantQuestion.id}
            userContext={getUserContext()}
            userTier={usageStats?.tier}
            onAnswerSaved={(answer) => {
              setAnswerAssistantQuestion({ 
                ...answerAssistantQuestion, 
                narrative: answer.narrative, 
                bullets: answer.bullets 
              });
              const updatedQuestions = questions.map(q => 
                q.id === answerAssistantQuestion.id 
                  ? { ...q, narrative: answer.narrative, bullets: answer.bullets }
                  : q
              );
              setQuestions(updatedQuestions);
            }}
            onClose={() => {
              setShowAnswerAssistant(false);
              setAnswerAssistantQuestion(null);
            }}
          />
        )}
      </div>
    );
  }

    // Helper: Highlight matching text between user answer and ideal answer
  const highlightMatches = (userText, idealText) => {
    if (!userText || !idealText) return { userHighlighted: userText, idealHighlighted: idealText };
    
    const userWords = userText.toLowerCase().split(/\s+/);
    const idealWords = idealText.toLowerCase().split(/\s+/);
    
    const matches = [];
    for (let i = 0; i < idealWords.length - 2; i++) {
      for (let j = 0; j < userWords.length - 2; j++) {
        if (idealWords[i] === userWords[j] && 
            idealWords[i + 1] === userWords[j + 1] && 
            idealWords[i + 2] === userWords[j + 2]) {
          matches.push(idealWords.slice(i, i + 3).join(' '));
        }
      }
    }
    
    let userHighlighted = userText;
    let idealHighlighted = idealText;
    
    matches.forEach(match => {
      const regex = new RegExp(`(${match})`, 'gi');
      userHighlighted = userHighlighted.replace(regex, '<mark class="bg-green-200 text-green-900 px-1 rounded">$1</mark>');
      idealHighlighted = idealHighlighted.replace(regex, '<mark class="bg-green-200 text-green-900 px-1 rounded">$1</mark>');
    });
    
    return { userHighlighted, idealHighlighted };
  };

  // PRACTICE MODE - WITH SPEECH INPUT
  if (currentView === 'practice' && currentQuestion) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <button onClick={() => setCurrentView('home')} className="text-gray-600 hover:text-gray-900">← Exit</button>
            <h1 className="text-2xl font-bold">Practice Mode</h1>
            <button onClick={startPracticeMode} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg">Next</button>
          </div>
        </div>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
            <h2 className="text-4xl font-bold mb-8">{currentQuestion.question}</h2>
            
            {!feedback && (
              <>
                {/* Speech Input */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-lg p-6 mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Mic className={`w-6 h-6 ${isListening ? 'text-red-600 animate-pulse' : 'text-blue-600'}`} />
                    <h4 className="font-bold text-blue-900">{isListening ? 'Recording your answer...' : 'Speak Your Answer'}</h4>
                  </div>
                  <button
                    onMouseDown={startListening}
                    onMouseUp={stopListening}
                    onTouchStart={startListening}
                    onTouchEnd={stopListening}
                    className={`w-full py-6 rounded-lg font-bold text-lg transition mb-4 ${isListening ? 'bg-red-600 text-white animate-pulse' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                  >
                    {isListening ? '🎤 Release to Stop' : '🎤 Hold to Speak (or use SPACEBAR)'}
                  </button>
                </div>
                
                {(spokenAnswer || transcript) && (
                  <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-6 mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-bold text-gray-900">{isListening ? 'Recording...' : 'Your Spoken Answer:'}</h4>
                      <button
                        onClick={() => {
                          setSpokenAnswer('');
                          setTranscript('');
                          accumulatedTranscript.current = '';
                        }}
                        className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 text-sm font-semibold rounded"
                      >
                        Clear Answer
                      </button>
                    </div>
                    <p className="text-lg text-gray-800 leading-relaxed">{spokenAnswer || transcript}</p>
                    <p className="text-xs text-gray-500 mt-2">📊 {(spokenAnswer || transcript).split(' ').filter(w => w).length} words</p>
                  </div>
                )}
                
              <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Or type your answer:</label>
                  <textarea
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    className="w-full px-4 py-3 border rounded-lg h-32"
                    placeholder="Type your answer..."
                  />
                  
                  {/* Help Button - Below Textarea */}
                  <div className="mt-2 flex justify-center">
                    {(usageStats?.tier === 'pro' || usageStats?.tier === 'premium' || usageStats?.tier === 'beta') ? (
                      <button
                        onClick={() => {
                          console.log('Help button clicked!');
                          console.log('Current question:', currentQuestion);
                          setAnswerAssistantQuestion(currentQuestion);
                          setShowAnswerAssistant(true);
                        }}
                        className="text-sm bg-gradient-to-r from-indigo-100 to-purple-100 hover:from-indigo-200 hover:to-purple-200 text-indigo-700 px-4 py-2 rounded-lg font-semibold transition flex items-center gap-2"
                      >
                        <Lightbulb className="w-4 h-4" />
                        💡 Can't Think of an Answer? AI Can Help
                      </button>
                    ) : (
                      <button
                        onClick={() => alert('⭐ Pro Feature\n\nUpgrade to Pro ($19.99/month) to use the AI Answer Coach!\n\n✓ AI guides you through developing answers\n✓ Auto-generates bullet points\n✓ Saves to all your question modes')}
                        className="text-sm bg-gradient-to-r from-yellow-100 to-amber-100 hover:from-yellow-200 hover:to-amber-200 text-yellow-800 px-4 py-2 rounded-lg font-semibold transition flex items-center gap-2"
                      >
                        <Crown className="w-4 h-4" />
                        💡 Can't Think of an Answer? Upgrade for AI Help
                      </button>
                    )}
                  </div>
                </div>
                
                <button
                  onClick={async () => {
                    const answer = spokenAnswer || userAnswer;
                    if (!answer.trim()) { alert('Please provide an answer'); return; }
                    
                    setIsAnalyzing(true);
                    try {
                      const { data: { session } } = await supabase.auth.getSession();
                      
                      const response = await fetch('https://tzrlpwtkrtvjpdhcaayu.supabase.co/functions/v1/ai-feedback', {
                        method: 'POST',
                        headers: {
                          'Authorization': `Bearer ${session.access_token}`,
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                          questionText: currentQuestion.question,
                          userAnswer: answer,
                          expectedBullets: currentQuestion.bullets || [],
                          mode: 'practice'
                        })
                      });

                      const data = await response.json();
                      console.log('Full response data:', data);

                      if (!response.ok) {
                        console.error('Error from Supabase function:', data.error);
                        throw new Error(data.error?.message || data.error || 'Failed to get feedback');
                      }

                      if (data.type === 'error') {
                        console.error('AI API Error:', data.error);
                        throw new Error(data.error?.message || JSON.stringify(data.error));
                      }

                      let feedbackJson;

                      if (data.content && data.content[0]) {
                        let feedbackText = data.content[0].text;
                        console.log('Raw AI text:', feedbackText);
                        
                        const jsonMatch = feedbackText.match(/\{[\s\S]*\}/);
                        if (jsonMatch) {
                          feedbackText = jsonMatch[0];
                        }
                        
                        feedbackJson = JSON.parse(feedbackText);
                      } else {
                        feedbackJson = data;
                      }

                      await savePracticeSession(currentQuestion, answer, feedbackJson);

                      setFeedback(feedbackJson);
                      setPracticeHistory([
                        ...practiceHistory,
                        {
                          question: currentQuestion.question,
                          answer,
                          feedback: feedbackJson,
                          date: new Date().toISOString(),
                        },
                      ]);
                    } catch (error) {
                      console.error('Feedback error:', error);
                      alert('Failed to get feedback: ' + error.message);
                    } finally {
                      setIsAnalyzing(false);
                    }
                  }}
                  disabled={isAnalyzing}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 rounded-lg disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Get Feedback
                    </>
                  )}
                </button>
              </>
            )}

 {feedback && (
  <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl p-8">
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-3xl font-bold">Your Performance</h3>
      
      {/* Show All Button - appears after score animation */}
      {revealStage > 0 && revealStage < 7 && !showAllFeedback && (
        <button
          onClick={() => {
            setShowAllFeedback(true);
            setRevealStage(7);
          }}
          className="text-sm bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-4 py-2 rounded-lg font-semibold transition-all"
        >
          ⚡ Show All
        </button>
      )}
    </div>
    
    {/* ==================== OVERALL SCORE - Always visible, animates ==================== */}
    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-8 text-white text-center mb-8 shadow-xl fade-in-up">
      <p className="text-2xl mb-2">Overall Score</p>
      <p className="text-8xl font-black tracking-tight mb-2" style={{textShadow: '0 4px 12px rgba(0,0,0,0.3)'}}>
        {animatedScore.toFixed(1)}
      </p>
      <p className="text-xl opacity-90">out of 10</p>
      <div className="mt-4 w-full bg-white/20 rounded-full h-3">
        <div 
          className="bg-white h-3 rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${(animatedScore / 10) * 100}%` }}
        ></div>
      </div>
    </div>

    {/* ==================== IDEAL ANSWER - Stage 1 ==================== */}
    {feedback.ideal_answer && isSectionVisible(1) && (
      <div className={`mb-6 feedback-section ${isSectionVisible(1) ? 'visible' : ''}`}>
        <button 
          onClick={() => setShowIdealAnswer(!showIdealAnswer)}
          className="w-full bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border-2 border-blue-300 rounded-xl p-5 flex items-center justify-between transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-2xl">💡</span>
            </div>
            <div className="text-left">
              <span className="font-bold text-blue-900 text-lg block">Example of Strong Answer</span>
              <span className="text-sm text-blue-700">Click to compare with your response</span>
            </div>
          </div>
          <span className="text-blue-600 text-2xl font-bold">{showIdealAnswer ? '▼' : '▶'}</span>
        </button>
        
        {showIdealAnswer && (
          <div className="mt-4 grid md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl border-2 border-blue-200 fade-in-up">
            <div className="bg-white rounded-lg p-5 border-2 border-gray-300">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-lg">👤</span>
                </div>
                <h5 className="font-bold text-gray-900">Your Answer</h5>
              </div>
              <p className="text-gray-800 leading-relaxed text-sm">{spokenAnswer || userAnswer}</p>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-5 border-2 border-blue-400">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-lg">⭐</span>
                </div>
                <h5 className="font-bold text-blue-900">Strong Example</h5>
              </div>
              <p className="text-blue-900 leading-relaxed text-sm">{feedback.ideal_answer}</p>
            </div>
          </div>
        )}
      </div>
    )}

    {/* ==================== STRENGTHS - Stage 2 ==================== */}
    {feedback.strengths && feedback.strengths.length > 0 && isSectionVisible(2) && (
      <div className={`mb-6 feedback-section ${isSectionVisible(2) ? 'visible' : ''}`}>
        <button
          onClick={() => setShowStrengths(!showStrengths)}
          className="w-full bg-green-50 hover:bg-green-100 border-2 border-green-300 rounded-xl p-4 flex items-center justify-between transition-all mb-3"
        >
          <h4 className="font-bold text-green-900 text-xl flex items-center gap-2">
            <span className="text-3xl">✓</span> 
            <span>Strengths ({feedback.strengths.length})</span>
          </h4>
          <span className="text-green-600 text-xl font-bold">{showStrengths ? '▼' : '▶'}</span>
        </button>
        
        {showStrengths && (
          <div className="grid gap-3 pl-4">
            {feedback.strengths.map((s, i) => (
              <div key={i} className="bg-green-50 border-l-4 border-green-500 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold">
                    {i + 1}
                  </div>
                  <p className="text-green-900 flex-1">{s}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )}

    {/* ==================== GAPS - Stage 3 ==================== */}
    {feedback.gaps && feedback.gaps.length > 0 && isSectionVisible(3) && (
      <div className={`mb-6 feedback-section ${isSectionVisible(3) ? 'visible' : ''}`}>
        <button
          onClick={() => setShowGaps(!showGaps)}
          className="w-full bg-amber-50 hover:bg-amber-100 border-2 border-amber-300 rounded-xl p-4 flex items-center justify-between transition-all mb-3"
        >
          <h4 className="font-bold text-amber-900 text-xl flex items-center gap-2">
            <span className="text-3xl">📈</span> 
            <span>Growth Areas ({feedback.gaps.length})</span>
          </h4>
          <span className="text-amber-600 text-xl font-bold">{showGaps ? '▼' : '▶'}</span>
        </button>
        
        {showGaps && (
          <div className="grid gap-3 pl-4">
            {feedback.gaps.map((gap, i) => (
              <div key={i} className="bg-amber-50 border-l-4 border-amber-500 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-amber-500 text-white rounded-full flex items-center justify-center font-bold">
                    {i + 1}
                  </div>
                  <p className="text-amber-900 flex-1">{gap}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )}

    {/* ==================== ACTION STEPS - Stage 4 ==================== */}
    {feedback.specific_improvements && feedback.specific_improvements.length > 0 && isSectionVisible(4) && (
      <div className={`mb-6 feedback-section ${isSectionVisible(4) ? 'visible' : ''}`}>
        <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-4 mb-3">
          <h4 className="font-bold text-blue-900 text-xl flex items-center gap-2">
            <span className="text-3xl">🎯</span> 
            <span>Action Steps ({feedback.specific_improvements.length})</span>
          </h4>
          <p className="text-sm text-blue-700 mt-1">Specific ways to improve your answer</p>
        </div>
        
        <div className="grid gap-3 pl-4">
          {feedback.specific_improvements.map((imp, i) => (
            <div key={i} className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center text-lg font-bold">
                  {i + 1}
                </div>
                <p className="text-blue-900 flex-1 leading-relaxed">{imp}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    )}

    {/* ==================== STAR FRAMEWORK - Stage 5 ==================== */}
    {feedback.framework_analysis && isSectionVisible(5) && (
      <div className={`mb-6 feedback-section ${isSectionVisible(5) ? 'visible' : ''}`}>
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-300 rounded-xl p-4 mb-4">
          <h4 className="font-bold text-purple-900 text-xl flex items-center gap-2">
            <span className="text-3xl">⭐</span> 
            <span>STAR Framework Analysis</span>
          </h4>
          <p className="text-sm text-purple-700 mt-1">How your answer maps to the STAR method</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          {/* Situation */}
          <div className={`rounded-xl p-5 border-2 transition-all ${
            feedback.framework_analysis.situation && !feedback.framework_analysis.situation.toLowerCase().includes('missing') && !feedback.framework_analysis.situation.toLowerCase().includes('not provided')
              ? 'bg-green-50 border-green-400' 
              : 'bg-gray-50 border-gray-300'
          }`}>
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                feedback.framework_analysis.situation && !feedback.framework_analysis.situation.toLowerCase().includes('missing') && !feedback.framework_analysis.situation.toLowerCase().includes('not provided')
                  ? 'bg-green-500' 
                  : 'bg-gray-400'
              }`}>
                <span className="text-2xl">📍</span>
              </div>
              <h5 className="font-bold text-gray-900">Situation</h5>
            </div>
            <p className="text-gray-800 text-sm leading-relaxed">{feedback.framework_analysis.situation || 'Not provided'}</p>
          </div>
          
          {/* Task */}
          <div className={`rounded-xl p-5 border-2 transition-all ${
            feedback.framework_analysis.task && !feedback.framework_analysis.task.toLowerCase().includes('missing') && !feedback.framework_analysis.task.toLowerCase().includes('not provided')
              ? 'bg-green-50 border-green-400' 
              : 'bg-gray-50 border-gray-300'
          }`}>
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                feedback.framework_analysis.task && !feedback.framework_analysis.task.toLowerCase().includes('missing') && !feedback.framework_analysis.task.toLowerCase().includes('not provided')
                  ? 'bg-green-500' 
                  : 'bg-gray-400'
              }`}>
                <span className="text-2xl">🎯</span>
              </div>
              <h5 className="font-bold text-gray-900">Task</h5>
            </div>
            <p className="text-gray-800 text-sm leading-relaxed">{feedback.framework_analysis.task || 'Not provided'}</p>
          </div>
          
          {/* Action */}
          <div className={`rounded-xl p-5 border-2 transition-all ${
            feedback.framework_analysis.action && !feedback.framework_analysis.action.toLowerCase().includes('missing') && !feedback.framework_analysis.action.toLowerCase().includes('not provided')
              ? 'bg-green-50 border-green-400' 
              : 'bg-gray-50 border-gray-300'
          }`}>
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                feedback.framework_analysis.action && !feedback.framework_analysis.action.toLowerCase().includes('missing') && !feedback.framework_analysis.action.toLowerCase().includes('not provided')
                  ? 'bg-green-500' 
                  : 'bg-gray-400'
              }`}>
                <span className="text-2xl">⚡</span>
              </div>
              <h5 className="font-bold text-gray-900">Action</h5>
            </div>
            <p className="text-gray-800 text-sm leading-relaxed">{feedback.framework_analysis.action || 'Not provided'}</p>
          </div>
          
          {/* Result */}
          <div className={`rounded-xl p-5 border-2 transition-all ${
            feedback.framework_analysis.result && !feedback.framework_analysis.result.toLowerCase().includes('missing') && !feedback.framework_analysis.result.toLowerCase().includes('not provided')
              ? 'bg-green-50 border-green-400' 
              : 'bg-gray-50 border-gray-300'
          }`}>
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                feedback.framework_analysis.result && !feedback.framework_analysis.result.toLowerCase().includes('missing') && !feedback.framework_analysis.result.toLowerCase().includes('not provided')
                  ? 'bg-green-500' 
                  : 'bg-gray-400'
              }`}>
                <span className="text-2xl">🏆</span>
              </div>
              <h5 className="font-bold text-gray-900">Result</h5>
            </div>
            <p className="text-gray-800 text-sm leading-relaxed">{feedback.framework_analysis.result || 'Not provided'}</p>
          </div>
        </div>
        
        {/* STAR Completeness Meter */}
        <div className="mt-4 bg-white rounded-lg p-4 border-2 border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700">STAR Completeness:</span>
            <span className="text-lg font-bold text-purple-600">
              {[
                feedback.framework_analysis.situation && !feedback.framework_analysis.situation.toLowerCase().includes('missing'),
                feedback.framework_analysis.task && !feedback.framework_analysis.task.toLowerCase().includes('missing'),
                feedback.framework_analysis.action && !feedback.framework_analysis.action.toLowerCase().includes('missing'),
                feedback.framework_analysis.result && !feedback.framework_analysis.result.toLowerCase().includes('missing')
              ].filter(Boolean).length}/4
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500"
              style={{ 
                width: `${([
                  feedback.framework_analysis.situation && !feedback.framework_analysis.situation.toLowerCase().includes('missing'),
                  feedback.framework_analysis.task && !feedback.framework_analysis.task.toLowerCase().includes('missing'),
                  feedback.framework_analysis.action && !feedback.framework_analysis.action.toLowerCase().includes('missing'),
                  feedback.framework_analysis.result && !feedback.framework_analysis.result.toLowerCase().includes('missing')
                ].filter(Boolean).length / 4) * 100}%` 
              }}
            ></div>
          </div>
        </div>
      </div>
    )}

    {/* ==================== KEY POINTS COVERAGE - Stage 6 ==================== */}
    {(feedback.points_covered || feedback.points_missed) && isSectionVisible(6) && (
      <div className={`bg-gray-50 rounded-xl p-6 mb-6 border-2 border-gray-300 feedback-section ${isSectionVisible(6) ? 'visible' : ''}`}>
        <h4 className="font-bold text-gray-900 text-xl mb-4 flex items-center gap-2">
          <span className="text-2xl">📊</span>
          <span>Key Points Coverage</span>
        </h4>
        
        {feedback.points_covered && feedback.points_covered.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-semibold text-green-700 mb-2 flex items-center gap-2">
              <span className="text-lg">✓</span> Covered ({feedback.points_covered.length})
            </p>
            <ul className="space-y-2">
              {feedback.points_covered.map((p, i) => (
                <li key={i} className="text-green-800 text-sm flex items-start gap-2 bg-green-50 p-2 rounded">
                  <span className="text-green-600">●</span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {feedback.points_missed && feedback.points_missed.length > 0 && (
          <div>
            <p className="text-sm font-semibold text-red-700 mb-2 flex items-center gap-2">
              <span className="text-lg">✗</span> Missed ({feedback.points_missed.length})
            </p>
            <ul className="space-y-2">
              {feedback.points_missed.map((p, i) => (
                <li key={i} className="text-red-800 text-sm flex items-start gap-2 bg-red-50 p-2 rounded">
                  <span className="text-red-600">●</span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    )}

    {/* ==================== ACTION BUTTONS - Stage 7 ==================== */}
    {isSectionVisible(7) && (
      <div className={`flex gap-4 feedback-section ${isSectionVisible(7) ? 'visible' : ''}`}>
        <button 
          onClick={() => { 
            setFeedback(null); 
            setUserAnswer(''); 
            setSpokenAnswer(''); 
            accumulatedTranscript.current = '';
          }} 
          className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-4 rounded-xl transition-all hover:scale-105 shadow-lg"
        >
          🔄 Try Again
        </button>
        <button 
          onClick={() => { 
            setFeedback(null); 
            setUserAnswer(''); 
            setSpokenAnswer(''); 
            accumulatedTranscript.current = '';
            currentMode === 'ai-interviewer' ? startAIInterviewer() : startPracticeMode(); 
          }} 
          className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 rounded-xl transition-all hover:scale-105 shadow-lg"
        >
          ➡️ Next Question
        </button>
      </div>
    )}
  </div>
)}

          </div>
        </div>
        
        {/* Answer Assistant Modal */}
        {showAnswerAssistant && answerAssistantQuestion && (
          <AnswerAssistant
            question={answerAssistantQuestion.question}
            questionId={answerAssistantQuestion.id}
            userContext={getUserContext()}
            userTier={usageStats?.tier}
            onAnswerSaved={(answer) => {
              setAnswerAssistantQuestion({ 
                ...answerAssistantQuestion, 
                narrative: answer.narrative, 
                bullets: answer.bullets 
              });
              const updatedQuestions = questions.map(q => 
                q.id === answerAssistantQuestion.id 
                  ? { ...q, narrative: answer.narrative, bullets: answer.bullets }
                  : q
              );
              setQuestions(updatedQuestions);
            }}
            onClose={() => {
              setShowAnswerAssistant(false);
              setAnswerAssistantQuestion(null);
            }}
          />
        )}
      </div>
    );
  }
  // FLASHCARD MODE
  if (currentView === 'flashcard' && currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-teal-600">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6 text-white">
            <button onClick={() => setCurrentView('home')} className="text-white/80 hover:text-white">← Exit</button>
            <h1 className="text-2xl font-bold">Flashcard Mode</h1>
            <button 
              onClick={() => {
                let available = questions;
                if (filterCategory !== 'All') available = available.filter(q => q.category === filterCategory);
                const sorted = [...available].sort((a, b) => {
                  if (a.practiceCount === 0) return -1;
                  if (b.practiceCount === 0) return 1;
                  return a.averageScore - b.averageScore;
                });
                const nextQ = sorted.find(q => q.id !== currentQuestion.id) || sorted[0];
                setCurrentQuestion(nextQ);
                setFlashcardSide('question');
                setShowBullets(false);
                setShowNarrative(false);
              }}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg"
            >
              Next →
            </button>
          </div>

          <div className="max-w-4xl mx-auto">
            {/* Flashcard */}
            <div 
              className="bg-white rounded-3xl shadow-2xl p-12 min-h-96 flex items-center justify-center cursor-pointer transition-transform hover:scale-105"
              onClick={() => setFlashcardSide(flashcardSide === 'question' ? 'answer' : 'question')}
            >
              {flashcardSide === 'question' ? (
                <div className="text-center">
                  <h2 className="text-5xl font-bold text-gray-900 mb-6">{currentQuestion.question}</h2>
                  <p className="text-gray-500 text-lg">Click to see answer</p>
                </div>
              ) : (
                <div className="w-full">
                  <h3 className="text-3xl font-bold text-gray-900 mb-6">Answer:</h3>
                  <ul className="space-y-4 text-left">
                    {currentQuestion.bullets.filter(b => b).map((bullet, idx) => (
                      <li key={idx} className="flex items-start gap-3">
<span className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">                          {idx + 1}
                        </span>
                        <span className="text-xl text-gray-800">{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="mt-8 flex gap-4">
              <button
                onClick={() => setShowBullets(!showBullets)}
                className="flex-1 bg-white/20 hover:bg-white/30 backdrop-blur text-white font-bold py-4 rounded-xl transition"
              >
                {showBullets ? '👁️ Hide' : '👁️ Show'} Bullets
              </button>
              {currentQuestion.narrative && (
                <button
                  onClick={() => setShowNarrative(!showNarrative)}
                  className="flex-1 bg-white/20 hover:bg-white/30 backdrop-blur text-white font-bold py-4 rounded-xl transition"
                >
                  {showNarrative ? '📖 Hide' : '📖 Show'} Narrative
                </button>
              )}
            </div>

            {/* Bullets Overlay */}
            {showBullets && (
              <div className="mt-6 bg-white rounded-2xl p-8 shadow-xl">
                <h4 className="text-2xl font-bold mb-4">Key Points:</h4>
                <ul className="space-y-3">
                  {currentQuestion.bullets.filter(b => b).map((bullet, idx) => (
                    <li key={idx} className="flex items-start gap-3">
<span className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">                        {idx + 1}
                      </span>
                      <span className="text-lg text-gray-800">{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Narrative */}
            {showNarrative && currentQuestion.narrative && (
              <div className="mt-6 bg-white rounded-2xl p-8 shadow-xl">
                <h4 className="text-2xl font-bold mb-4">Full Narrative:</h4>
                <p className="text-lg text-gray-800 leading-relaxed whitespace-pre-line">{currentQuestion.narrative}</p>
              </div>
            )}

            {/* Progress */}
            <div className="mt-8 bg-white/10 backdrop-blur rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">Questions Reviewed:</span>
                <span className="text-2xl font-bold">{questions.filter(q => q.practiceCount > 0).length} / {questions.length}</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-3">
                <div 
                  className="bg-white h-3 rounded-full transition-all"
                  style={{ width: `${(questions.filter(q => q.practiceCount > 0).length / questions.length) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

// COMMAND CENTER
  if (currentView === 'command-center') {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <button onClick={() => setCurrentView('home')} className="text-gray-600 hover:text-gray-900">
              ← Back to Home
            </button>
            <h1 className="text-2xl font-bold text-gray-900">🎯 Command Center</h1>
            <div className="w-24"></div>
          </div>
          
          {/* Quick Help Guide */}
          <div className="container mx-auto px-4 pb-4">
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
              <p className="text-sm font-bold text-blue-900 mb-2">💡 Quick Guide:</p>
              <div className="grid md:grid-cols-5 gap-3 text-xs text-blue-800">
                <div>
                  <span className="font-bold">📊 Analytics:</span> View stats, practice history, top questions
                </div>
                <div>
                  <span className="font-bold">🎯 Queue:</span> See which questions need practice
                </div>
                <div>
                  <span className="font-bold">🗓️ Prep:</span> Set interview date & daily goals
                </div>
                <div>
                  <span className="font-bold">📚 Bank:</span> Add, edit, import questions
                </div>
                <div>
                  <span className="font-bold">📈 Progress:</span> Track improvement over time
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white border-b">
          <div className="container mx-auto px-4">
            <div className="flex gap-8">
              <button
                onClick={() => setCommandCenterTab('analytics')}
                className={`py-4 px-2 font-semibold border-b-2 transition ${
                  commandCenterTab === 'analytics'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                📊 Analytics
              </button>
              <button
                onClick={() => setCommandCenterTab('queue')}
                className={`py-4 px-2 font-semibold border-b-2 transition ${
                  commandCenterTab === 'queue'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                🎯 Practice Queue
              </button>
              <button
                onClick={() => setCommandCenterTab('prep')}
                className={`py-4 px-2 font-semibold border-b-2 transition ${
                  commandCenterTab === 'prep'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                🗓️ Interview Prep
              </button>
              <button
                onClick={() => setCommandCenterTab('bank')}
                className={`py-4 px-2 font-semibold border-b-2 transition ${
                  commandCenterTab === 'bank'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                📚 Question Bank
              </button>
              <button
                onClick={() => setCommandCenterTab('progress')}
                className={`py-4 px-2 font-semibold border-b-2 transition ${
                  commandCenterTab === 'progress'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                📈 Progress
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="container mx-auto px-4 py-8">
          {/* ==================== ANALYTICS TAB ==================== */}
          {commandCenterTab === 'analytics' && (
            <div>
              {/* Stats Overview */}
              <div className="grid md:grid-cols-4 gap-6 mb-8">
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white">
                  <p className="text-sm opacity-90 mb-2">Total Sessions</p>
                  <p className="text-5xl font-black">{practiceHistory.length}</p>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
                  <p className="text-sm opacity-90 mb-2">Average Score</p>
                  <p className="text-5xl font-black">
                    {practiceHistory.length > 0 
                      ? (practiceHistory.reduce((sum, s) => sum + (s.feedback?.overall || 0), 0) / practiceHistory.length).toFixed(1)
                      : '0.0'}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 text-white">
                  <p className="text-sm opacity-90 mb-2">Questions Practiced</p>
                  <p className="text-5xl font-black">{questions.filter(q => q.practiceCount > 0).length}</p>
                </div>
                <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-6 text-white">
                  <p className="text-sm opacity-90 mb-2">This Month</p>
                  <p className="text-5xl font-black">{usageStats?.session_count || 0}</p>
                </div>
              </div>

              {/* Most Practiced Questions */}
              <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                <h3 className="text-2xl font-bold mb-4">🔥 Most Practiced Questions</h3>
                {questions.filter(q => q.practiceCount > 0).length === 0 ? (
                  <p className="text-gray-600">No practice sessions yet!</p>
                ) : (
                  <div className="space-y-3">
                    {questions
                      .filter(q => q.practiceCount > 0)
                      .sort((a, b) => b.practiceCount - a.practiceCount)
                      .slice(0, 5)
                      .map((q, idx) => (
                        <div key={q.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                          <div className="text-3xl font-black text-gray-300">#{idx + 1}</div>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">{q.question}</p>
                            <p className="text-sm text-gray-600">Practiced {q.practiceCount}x • Avg: {q.averageScore.toFixed(1)}/10</p>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* Practice History */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-2xl font-bold mb-4">📜 Recent Practice Sessions</h3>
                {practiceHistory.length === 0 ? (
                  <p className="text-gray-600 text-center py-8">No practice sessions yet. Start practicing!</p>
                ) : (
                  <div className="space-y-4">
                    {practiceHistory.slice().reverse().map((session, idx) => (
                      <div key={idx} className="border-l-4 border-indigo-500 bg-gray-50 rounded-r-lg p-4 hover:shadow-md transition">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-900 mb-2">{session.question}</h4>
                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{session.answer}</p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span>📅 {new Date(session.date).toLocaleDateString()}</span>
                              <span>🕐 {new Date(session.date).toLocaleTimeString()}</span>
                            </div>
                          </div>
                          <div className="ml-4 text-center bg-white rounded-lg p-3 shadow-sm">
                            <div className="text-3xl font-black text-indigo-600">{session.feedback?.overall?.toFixed(1) || 'N/A'}</div>
                            <div className="text-xs text-gray-500">score</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ==================== PRACTICE QUEUE TAB ==================== */}
          {commandCenterTab === 'queue' && (
            <div>
              {/* Never Practiced */}
              <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                <h3 className="text-2xl font-bold mb-4 text-red-600">🎯 Need Practice</h3>
                {questions.filter(q => q.practiceCount === 0).length === 0 ? (
                  <p className="text-gray-600">Great job! You've practiced all questions at least once.</p>
                ) : (
                  <div className="space-y-3">
                    {questions
                      .filter(q => q.practiceCount === 0)
                      .sort((a, b) => {
                        const priorityOrder = { 'Must-Know': 0, 'Technical': 1, 'Standard': 2, 'Optional': 3 };
                        return priorityOrder[a.priority] - priorityOrder[b.priority];
                      })
                      .map(q => (
                        <div key={q.id} className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                q.priority === 'Must-Know' ? 'bg-red-100 text-red-800' : 
                                q.priority === 'Technical' ? 'bg-yellow-100 text-yellow-800' : 
                                'bg-gray-100 text-gray-800'
                              }`}>{q.priority}</span>
                              <span className="text-xs text-gray-500">{q.category}</span>
                            </div>
                            <p className="font-semibold text-gray-900">{q.question}</p>
                          </div>
                          <button 
                            onClick={async () => {
                              const usageCheck = await checkAndIncrementUsage();
                              if (!usageCheck.allowed) {
                                const limit = usageCheck.tier === 'free' ? '25' : '100';
                                alert(`⚠️ Monthly Limit Reached\n\nYou've used all ${limit} sessions this month.\n\nUpgrade to Pro for 100 sessions/month!`);

                                return;
                              }
                              accumulatedTranscript.current = '';
                              setCurrentQuestion(q);
                              setCurrentMode('practice');
                              setCurrentView('practice');
                              setUserAnswer('');
                              setSpokenAnswer('');
                              setFeedback(null);
                            }}
                            className="ml-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition"
                          >
                            Practice Now
                          </button>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* Needs Improvement */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-2xl font-bold mb-4 text-yellow-600">📈 Needs Improvement</h3>
                {questions.filter(q => q.practiceCount > 0 && q.averageScore < 7).length === 0 ? (
                  <p className="text-gray-600">All practiced questions scored 7+ average!</p>
                ) : (
                  <div className="space-y-3">
                    {questions
                      .filter(q => q.practiceCount > 0 && q.averageScore < 7)
                      .sort((a, b) => a.averageScore - b.averageScore)
                      .map(q => (
                        <div key={q.id} className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900 mb-1">{q.question}</p>
                            <p className="text-sm text-gray-600">Practiced {q.practiceCount}x • Avg: {q.averageScore.toFixed(1)}/10</p>
                          </div>
                          <button 
                            onClick={async () => {
                              const usageCheck = await checkAndIncrementUsage();
                              if (!usageCheck.allowed) {
                                const limit = usageCheck.tier === 'free' ? '25' : '100';
                                alert(`⚠️ Monthly Limit Reached\n\nYou've used all ${limit} sessions this month.\n\nUpgrade to Pro for 100 sessions/month!`);

                                return;
                              }
                              accumulatedTranscript.current = '';
                              setCurrentQuestion(q);
                              setCurrentMode('practice');
                              setCurrentView('practice');
                              setUserAnswer('');
                              setSpokenAnswer('');
                              setFeedback(null);
                            }}
                            className="ml-4 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold rounded-lg transition"
                          >
                            Practice Again
                          </button>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ==================== INTERVIEW PREP TAB ==================== */}
          {commandCenterTab === 'prep' && (
            <div>
              {/* Interview Countdown */}
              <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-8 text-white mb-8">
                <h3 className="text-3xl font-bold mb-6">🗓️ Interview Countdown</h3>
                <div className="flex items-center gap-6 mb-6">
                  <div className="flex-1">
                    <label className="block text-sm opacity-90 mb-2">Interview Date:</label>
                    <input 
                      type="date"
                      value={interviewDate}
                      onChange={(e) => {
                        setInterviewDate(e.target.value);
                        localStorage.setItem('isl_interview_date', e.target.value);
                      }}
                      className="w-full px-4 py-3 rounded-lg text-gray-900 font-semibold"
                    />
                  </div>
                  {interviewDate && (
                    <div className="text-center bg-white/20 backdrop-blur rounded-lg p-6">
                      <div className="text-6xl font-black mb-2">
                        {Math.max(0, Math.ceil((new Date(interviewDate) - new Date()) / (1000 * 60 * 60 * 24)))}
                      </div>
                      <div className="text-sm opacity-90">days remaining</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Daily Goal */}
              <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                <h3 className="text-2xl font-bold mb-4">🎯 Daily Practice Goal</h3>
                <div className="flex items-center gap-4 mb-6">
                  <label className="text-gray-700 font-semibold">Sessions per day:</label>
                  <input 
                    type="number"
                    min="1"
                    max="20"
                    value={dailyGoal}
                    onChange={(e) => {
                      setDailyGoal(parseInt(e.target.value));
                      localStorage.setItem('isl_daily_goal', e.target.value);
                    }}
                    className="w-20 px-4 py-2 border rounded-lg text-center font-bold"
                  />
                </div>
                <div className="bg-gray-100 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-700">Today's Progress:</span>
                    <span className="text-lg font-bold text-indigo-600">
                      {practiceHistory.filter(s => new Date(s.date).toDateString() === new Date().toDateString()).length} / {dailyGoal}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full transition-all"
                      style={{ 
                        width: `${Math.min(100, (practiceHistory.filter(s => new Date(s.date).toDateString() === new Date().toDateString()).length / dailyGoal) * 100)}%`
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Category Coverage */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-2xl font-bold mb-4">📚 Category Coverage</h3>
                <div className="space-y-4">
                  {['Core Narrative', 'System-Level', 'Behavioral', 'Technical'].map(category => {
                    const categoryQuestions = questions.filter(q => q.category === category);
                    const practiced = categoryQuestions.filter(q => q.practiceCount > 0).length;
                    const total = categoryQuestions.length;
                    const percentage = total > 0 ? (practiced / total) * 100 : 0;
                    
                    return (
                      <div key={category} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-gray-900">{category}</span>
                          <span className="text-sm text-gray-600">{practiced} / {total} practiced</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
          
         {/* ==================== PROGRESS TAB ==================== */}
{commandCenterTab === 'progress' && (
  <div>
    {/* Session Detail Modal */}
    {selectedSession && (
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
        onClick={() => setSelectedSession(null)}
      >
        <div 
          className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-slideUp"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-t-2xl z-10">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-2">{selectedSession.question}</h3>
                <div className="flex items-center gap-4 text-sm opacity-90">
                  <span>📅 {new Date(selectedSession.date).toLocaleDateString()}</span>
                  <span>🕐 {new Date(selectedSession.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  <span>⭐ Score: {(selectedSession.feedback?.overall || selectedSession.feedback?.match_percentage / 10).toFixed(1)}/10</span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedSession(null)}
                className="text-white hover:bg-white/20 rounded-full p-2 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Modal Content */}
          <div className="p-6 space-y-6">
            {/* Your Answer */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200">
              <h4 className="font-bold text-lg mb-3 text-blue-900 flex items-center gap-2">
                <span className="text-2xl">💬</span>
                Your Answer
              </h4>
              <p className="text-gray-800 leading-relaxed whitespace-pre-line">
                {selectedSession.answer}
              </p>
            </div>

            {/* Ideal Answer */}
            {selectedSession.feedback?.ideal_answer && (
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200">
                <h4 className="font-bold text-lg mb-3 text-green-900 flex items-center gap-2">
                  <span className="text-2xl">⭐</span>
                  Example Strong Answer
                </h4>
                <p className="text-gray-800 leading-relaxed">
                  {selectedSession.feedback.ideal_answer}
                </p>
              </div>
            )}

            {/* Strengths */}
            {selectedSession.feedback?.strengths && selectedSession.feedback.strengths.length > 0 && (
              <div className="bg-green-50 rounded-xl p-6 border-2 border-green-200">
                <h4 className="font-bold text-lg mb-4 text-green-900 flex items-center gap-2">
                  <span className="text-2xl">✅</span>
                  Strengths ({selectedSession.feedback.strengths.length})
                </h4>
                <div className="space-y-3">
                  {selectedSession.feedback.strengths.map((strength, idx) => (
                    <div key={idx} className="flex items-start gap-3 bg-white p-4 rounded-lg">
                      <span className="flex-shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold">
                        {idx + 1}
                      </span>
                      <p className="text-gray-800 flex-1">{strength}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Growth Areas */}
            {selectedSession.feedback?.gaps && selectedSession.feedback.gaps.length > 0 && (
              <div className="bg-amber-50 rounded-xl p-6 border-2 border-amber-200">
                <h4 className="font-bold text-lg mb-4 text-amber-900 flex items-center gap-2">
                  <span className="text-2xl">📈</span>
                  Growth Areas ({selectedSession.feedback.gaps.length})
                </h4>
                <div className="space-y-3">
                  {selectedSession.feedback.gaps.map((gap, idx) => (
                    <div key={idx} className="flex items-start gap-3 bg-white p-4 rounded-lg">
                      <span className="flex-shrink-0 w-8 h-8 bg-amber-500 text-white rounded-full flex items-center justify-center font-bold">
                        {idx + 1}
                      </span>
                      <p className="text-gray-800 flex-1">{gap}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Steps */}
            {selectedSession.feedback?.specific_improvements && selectedSession.feedback.specific_improvements.length > 0 && (
              <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-200">
                <h4 className="font-bold text-lg mb-4 text-blue-900 flex items-center gap-2">
                  <span className="text-2xl">🎯</span>
                  Action Steps ({selectedSession.feedback.specific_improvements.length})
                </h4>
                <div className="space-y-3">
                  {selectedSession.feedback.specific_improvements.map((improvement, idx) => (
                    <div key={idx} className="flex items-start gap-3 bg-white p-4 rounded-lg">
                      <span className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                        {idx + 1}
                      </span>
                      <p className="text-gray-800 flex-1 leading-relaxed">{improvement}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="sticky bottom-0 bg-gray-50 p-6 rounded-b-2xl border-t-2">
            <button
              onClick={() => setSelectedSession(null)}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-4 rounded-xl transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Overall Progress Timeline */}
    <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
      <h3 className="text-2xl font-bold mb-6">📈 Overall Progress Timeline</h3>
      
      {practiceHistory.length === 0 ? (
        <div className="text-center py-16 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border-2 border-dashed border-indigo-200">
          <div className="text-6xl mb-4">📊</div>
          <h4 className="text-2xl font-bold text-gray-900 mb-2">No Practice Data Yet</h4>
          <p className="text-gray-600 mb-6">Complete some practice sessions to see your progress!</p>
          <button 
            onClick={() => setCurrentView('home')}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-semibold"
          >
            Start Practicing →
          </button>
        </div>
      ) : (
        <>
          <div className="relative mb-8" style={{ height: '400px' }}>
            <svg viewBox="0 0 900 350" className="w-full h-full">
              {[0, 2, 4, 6, 8, 10].map(score => (
                <g key={score}>
                  <line x1="60" y1={300 - (score * 27)} x2="850" y2={300 - (score * 27)} stroke="#e5e7eb" strokeWidth="1" strokeDasharray={score === 0 ? "0" : "4,4"} />
                  <text x="35" y={305 - (score * 27)} fontSize="14" fill="#6b7280" fontWeight="600">{score}</text>
                </g>
              ))}
              
              <defs>
                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="50%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
              </defs>
              
              {(() => {
                const validSessions = practiceHistory.filter(s => s.feedback?.overall || s.feedback?.match_percentage);
                if (validSessions.length < 2) return null;
                return (
                  <polyline
                    points={validSessions.map((session, idx) => {
                      const score = session.feedback?.overall || (session.feedback?.match_percentage / 10);
                      const x = 60 + (idx / Math.max(1, validSessions.length - 1)) * 790;
                      const y = 300 - (score * 27);
                      return `${x},${y}`;
                    }).join(' ')}
                    fill="none"
                    stroke="url(#lineGradient)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                );
              })()}
              
              {(() => {
                const validSessions = practiceHistory.filter(s => s.feedback?.overall || s.feedback?.match_percentage);
                return validSessions.map((session, idx) => {
                  const score = session.feedback?.overall || (session.feedback?.match_percentage / 10);
                  const x = 60 + (idx / Math.max(1, validSessions.length - 1)) * 790;
                  const y = 300 - (score * 27);
                  return (
                    <g key={idx}>
                      <circle cx={x} cy={y} r="8" fill="#6366f1" stroke="white" strokeWidth="3" className="cursor-pointer" onClick={() => setSelectedSession(session)} />
                    </g>
                  );
                });
              })()}
              
              <text x="450" y="340" fontSize="14" fill="#6b7280" textAnchor="middle" fontWeight="600">Practice Sessions (click dots for details)</text>
              <text x="20" y="180" fontSize="14" fill="#6b7280" textAnchor="middle" transform="rotate(-90, 20, 180)" fontWeight="600">Score</text>
            </svg>
          </div>

          {(() => {
            const validSessions = practiceHistory.filter(s => s.feedback?.overall || s.feedback?.match_percentage);
            if (validSessions.length === 0) {
              return (
                <div className="text-center py-8 bg-yellow-50 rounded-xl border-2 border-yellow-200">
                  <p className="text-yellow-800 font-semibold">⚠️ Sessions completed but no scores available</p>
                </div>
              );
            }
            
            const scores = validSessions.map(s => s.feedback?.overall || (s.feedback?.match_percentage / 10));
            const firstScore = scores[0];
            const latestScore = scores[scores.length - 1];
            const improvement = latestScore - firstScore;
            const bestScore = Math.max(...scores);
            const average = scores.reduce((a, b) => a + b, 0) / scores.length;
            
            return (
              <div className="grid grid-cols-5 gap-4 pt-6 border-t-2">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">First</p>
                  <p className="text-3xl font-black text-gray-900">{firstScore.toFixed(1)}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Latest</p>
                  <p className="text-3xl font-black text-indigo-600">{latestScore.toFixed(1)}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Change</p>
                  <p className={`text-3xl font-black ${improvement >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {improvement >= 0 ? '+' : ''}{improvement.toFixed(1)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Best</p>
                  <p className="text-3xl font-black text-green-600">{bestScore.toFixed(1)}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Average</p>
                  <p className="text-3xl font-black text-purple-600">{average.toFixed(1)}</p>
                </div>
              </div>
            );
          })()}
        </>
      )}
    </div>

    {/* Question-by-Question Progress */}
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <h3 className="text-2xl font-bold mb-6">📊 Question-by-Question Progress</h3>
      
      {(() => {
        // Build question stats from practice history
        const questionStats = {};
        practiceHistory.forEach(session => {
          if (!questionStats[session.question]) {
            const matchingQ = questions.find(q => q.question === session.question);
            questionStats[session.question] = {
              question: session.question,
              category: matchingQ?.category || 'Unknown',
              priority: matchingQ?.priority || 'Standard',
              sessions: []
            };
          }
          if (session.feedback?.overall || session.feedback?.match_percentage) {
            questionStats[session.question].sessions.push(session);
          }
        });
        
        const questionArray = Object.values(questionStats).filter(q => q.sessions.length > 0);
        
        if (questionArray.length === 0) {
          return (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <p className="text-gray-600">Practice some questions to see progress!</p>
            </div>
          );
        }

        return (
          <div className="space-y-6">
            {questionArray.sort((a, b) => b.sessions.length - a.sessions.length).map((qStat, idx) => {
              const getScore = (s) => s.feedback?.overall || (s.feedback?.match_percentage / 10);
              const scores = qStat.sessions.map(getScore);
              const trend = scores.length > 1 ? scores[scores.length - 1] - scores[0] : 0;
              const average = scores.reduce((a, b) => a + b, 0) / scores.length;
              
              return (
                <div key={idx} className="border-2 rounded-xl p-6 hover:border-indigo-300 transition">
                  <div className="flex items-start gap-6 mb-4">
                    {/* Left: Question Info */}
                    <div className="flex-1">
                      <h4 className="font-bold text-lg mb-2">{qStat.question}</h4>
                      <div className="flex gap-4 text-sm text-gray-600">
                        <span>📊 {qStat.sessions.length} attempts</span>
                        <span>⭐ {average.toFixed(1)} avg</span>
                        {trend !== 0 && (
                          <span className={trend > 0 ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                            {trend > 0 ? '↗' : '↘'} {Math.abs(trend).toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Middle: Mini Sparkline Chart */}
                    <div className="flex flex-col items-center">
                      <svg width="200" height="80" className="mb-2">
                        {/* Grid lines */}
                        {[0, 5, 10].map(score => (
                          <line 
                            key={score}
                            x1="0" 
                            y1={70 - (score * 6)} 
                            x2="200" 
                            y2={70 - (score * 6)} 
                            stroke="#e5e7eb" 
                            strokeWidth="1"
                            strokeDasharray="2,2"
                          />
                        ))}
                        
                        {/* Line connecting points */}
                        {qStat.sessions.length > 1 && (
                          <polyline
                            points={qStat.sessions.map((s, sIdx) => {
                              const score = getScore(s);
                              const x = (sIdx / Math.max(1, qStat.sessions.length - 1)) * 200;
                              const y = 70 - (score * 6);
                              return `${x},${y}`;
                            }).join(' ')}
                            fill="none"
                            stroke="#6366f1"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                        )}
                        
                        {/* Clickable dots */}
                        {qStat.sessions.map((s, sIdx) => {
                          const score = getScore(s);
                          const x = (sIdx / Math.max(1, qStat.sessions.length - 1)) * 200;
                          const y = 70 - (score * 6);
                          return (
                            <circle
                              key={sIdx}
                              cx={x}
                              cy={y}
                              r="4"
                              fill="#6366f1"
                              stroke="white"
                              strokeWidth="2"
                              className="cursor-pointer hover:r-6 transition-all"
                              onClick={() => setSelectedSession(s)}
                            >
                              <title>Attempt {sIdx + 1}: {score.toFixed(1)}/10</title>
                            </circle>
                          );
                        })}
                      </svg>
                      <p className="text-xs text-gray-500 font-semibold">Click dots for details</p>
                    </div>
                    
                    {/* Right: Latest Score */}
                    <div className="text-center bg-indigo-50 rounded-xl p-4">
                      <p className="text-sm text-gray-600 mb-1">Latest</p>
                      <p className="text-4xl font-black text-indigo-600">{scores[scores.length - 1].toFixed(1)}</p>
                    </div>
                  </div>
                  
                  <details className="mt-4 pt-4 border-t">
                    <summary className="cursor-pointer text-sm font-bold text-indigo-600">
                      View {qStat.sessions.length} attempts →
                    </summary>
                    <div className="mt-4 space-y-2">
                      {qStat.sessions.slice().reverse().map((session, sIdx) => {
                        const score = getScore(session);
                        return (
                          <div 
                            key={sIdx}
                            className="flex justify-between bg-gray-50 p-4 rounded-lg cursor-pointer hover:bg-indigo-50"
                            onClick={() => setSelectedSession(session)}
                          >
                            <span className="text-sm">
                              {new Date(session.date).toLocaleDateString()} at {new Date(session.date).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
                            </span>
                            <span className="text-xl font-black text-indigo-600">{score.toFixed(1)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </details>
                </div>
              );
            })}
          </div>
        );
      })()}
    </div>
  </div>
)}

{/* ==================== QUESTION BANK TAB ==================== */}
{commandCenterTab === 'bank' && (
            <div>
              {/* AI Question Generator - Pro/Premium Only */}
{(usageStats?.tier === 'pro' || usageStats?.tier === 'premium' || usageStats?.tier === 'beta') ? (
  <QuestionAssistant
    onQuestionGenerated={async (generatedQuestion) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from('questions')
        .insert([{
          user_id: user.id,
          question: generatedQuestion,
          category: 'Generated',
          priority: 'Technical',
          bullets: [],
          narrative: ''
        }])
        .select()
        .single();
      
      if (!error && data) {
        // Add to local state
        setQuestions([...questions, data]);
        alert('✅ Question added to bank!');
      }
    }
  } catch (error) {
    console.error('Save error:', error);
    alert('Failed to save question');
  }
}}
    existingQuestions={questions}
  />
) : (
  <div className="bg-gradient-to-br from-purple-50 via-indigo-50 to-pink-50 rounded-xl p-8 border-2 border-purple-300 mb-6 text-center shadow-lg">
    <div className="text-6xl mb-4">✨</div>
    <h3 className="text-2xl font-bold text-gray-900 mb-2">AI Question Generator</h3>
    <p className="text-gray-600 mb-4 max-w-md mx-auto">
      Generate personalized, MI-powered interview questions tailored to your role, background, and target company.
    </p>
    <div className="bg-white rounded-lg p-4 mb-6 max-w-sm mx-auto">
      <p className="text-sm font-semibold text-purple-900 mb-2">🎯 What You Get:</p>
      <ul className="text-xs text-left text-gray-700 space-y-1">
        <li>✓ Questions tailored to YOUR background</li>
        <li>✓ Learns from your existing questions</li>
        <li>✓ MI-powered for authentic practice</li>
        <li>✓ Role & company-specific</li>
      </ul>
    </div>
    <button
      onClick={() => alert('Upgrade feature coming soon!')}
      className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-3 rounded-lg font-bold hover:from-purple-700 hover:to-indigo-700 shadow-lg transform hover:scale-105 transition"
    >
      Upgrade to Pro - $19.99/month
    </button>
  </div>
)}
              <button onClick={() => setEditingQuestion({ question: '', keywords: [], category: 'Core Narrative', priority: 'Must-Know', bullets: [''], narrative: '', followups: [] })} className="mb-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-lg flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Add Question
              </button>
              
              <div className="flex gap-2 mb-6">
                <button onClick={() => { const input = document.createElement('input'); input.type = 'file'; input.accept = '.json'; input.onchange = (e) => { const file = e.target.files[0]; const reader = new FileReader(); reader.onload = (event) => importQuestions(event.target.result); reader.readAsText(file); }; input.click(); }} className="px-4 py-2 bg-gray-200 rounded-lg flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Import
                </button>
                <button onClick={exportQuestions} className="px-4 py-2 bg-gray-200 rounded-lg flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Export
                </button>
                <button onClick={() => setShowTemplateLibrary(true)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Templates
                </button>
                {showTemplateLibrary && (
                  <TemplateLibrary
                    onClose={() => setShowTemplateLibrary(false)}
                    onImport={async (importedQuestions) => {
                      console.log('Importing questions:', importedQuestions);
                      try {
                        const { data: { user } } = await supabase.auth.getUser();
                        if (!user) {
                          alert('Please sign in to import templates');
                          return;
                        }
                        
                        // Save to Supabase
                        const questionsToImport = importedQuestions.map(q => ({
                          user_id: user.id,
                          question: q.question,
                          category: q.category || 'Template',
                          priority: q.priority || 'Standard',
                          bullets: q.bullets || [],
                          narrative: q.narrative || '',
                          keywords: q.keywords || []
                        }));
                        
                        const { error } = await supabase
                          .from('questions')
                          .insert(questionsToImport);
                        
                        if (error) throw error;
                        
                        // Reload questions
                        await loadQuestions();
                        setShowTemplateLibrary(false);
                        alert(`✅ Imported ${importedQuestions.length} template questions!`);
                      } catch (error) {
                        console.error('Error importing:', error);
                        alert('Import failed: ' + error.message);
                      }
                    }}
                  />
                )}
              </div>
              
              {editingQuestion && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
                  <div className="bg-white rounded-2xl p-6 max-w-3xl w-full my-8">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-2xl font-bold">{editingQuestion.id ? 'Edit' : 'Add'} Question</h3>
                      <button onClick={() => setEditingQuestion(null)} className="text-gray-500 hover:text-gray-700">
                        <X className="w-6 h-6" />
                      </button>
                    </div>
                    <div className="space-y-4 max-h-[70vh] overflow-y-auto">
                      <div>
                        <label className="block text-sm font-medium mb-2">Question</label>
                        <input type="text" value={editingQuestion.question} onChange={(e) => setEditingQuestion({ ...editingQuestion, question: e.target.value })} className="w-full px-4 py-2 border rounded-lg" placeholder="e.g., Tell me about yourself" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Category</label>
                          <select value={editingQuestion.category} onChange={(e) => setEditingQuestion({ ...editingQuestion, category: e.target.value })} className="w-full px-4 py-2 border rounded-lg">
                            <option>Core Narrative</option>
                            <option>Technical EM</option>
                            <option>System-Level</option>
                            <option>Behavioral</option>
                            <option>Conversational</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Priority</label>
                          <select value={editingQuestion.priority} onChange={(e) => setEditingQuestion({ ...editingQuestion, priority: e.target.value })} className="w-full px-4 py-2 border rounded-lg">
                            <option>Must-Know</option>
                            <option>Technical</option>
                            <option>Standard</option>
                            <option>Optional</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Keywords (for Live Prompter matching)</label>
                        <textarea value={editingQuestion.keywords?.join(', ') || ''} onChange={(e) => setEditingQuestion({ ...editingQuestion, keywords: e.target.value.split(',').map(k => k.trim()) })} className="w-full px-4 py-2 border rounded-lg h-20" placeholder="tell me about yourself, background, introduce yourself" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Bullet Points</label>
                        {editingQuestion.bullets?.map((bullet, idx) => (
                          <div key={idx} className="flex gap-2 mb-2">
                            <input type="text" value={bullet} onChange={(e) => { const newBullets = [...editingQuestion.bullets]; newBullets[idx] = e.target.value; setEditingQuestion({ ...editingQuestion, bullets: newBullets }); }} className="flex-1 px-4 py-2 border rounded-lg" placeholder="Key point..." />
                            {editingQuestion.bullets.length > 1 && (
                              <button onClick={() => { const newBullets = editingQuestion.bullets.filter((_, i) => i !== idx); setEditingQuestion({ ...editingQuestion, bullets: newBullets }); }} className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ))}
                        <button onClick={() => setEditingQuestion({ ...editingQuestion, bullets: [...editingQuestion.bullets, ''] })} className="text-indigo-600 text-sm hover:text-indigo-700">+ Add bullet</button>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Full Narrative (Optional)</label>
                        <textarea value={editingQuestion.narrative} onChange={(e) => setEditingQuestion({ ...editingQuestion, narrative: e.target.value })} className="w-full px-4 py-2 border rounded-lg h-32" placeholder="Full answer..." />
                      </div>
                    </div>
                    <div className="flex gap-4 mt-6">
                      <button onClick={() => { if (editingQuestion.id) updateQuestion(editingQuestion.id, editingQuestion); else addQuestion(editingQuestion); setEditingQuestion(null); }} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg">Save</button>
                      <button onClick={() => setEditingQuestion(null)} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 rounded-lg">Cancel</button>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="space-y-4">
                {questions.map(q => (
                  <div key={q.id} className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex gap-2 mb-2">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${q.priority === 'Must-Know' ? 'bg-red-100 text-red-800' : q.priority === 'Technical' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>{q.priority}</span>
                          <span className="px-2 py-1 bg-gray-100 rounded text-xs">{q.category}</span>
                        </div>
                        <h3 className="text-xl font-bold mb-2">{q.question}</h3>
                        {q.bullets.length > 0 && (
                          <ul className="text-sm text-gray-600 space-y-1">
                            {q.bullets.filter(b => b).map((b, i) => <li key={i}>• {b}</li>)}
                          </ul>
                        )}
                        {q.practiceCount > 0 && (
                          <div className="flex gap-4 text-sm text-gray-600 mt-4">
                            <span>📊 Practiced: {q.practiceCount}x</span>
                            <span>⭐ Avg: {q.averageScore.toFixed(1)}/10</span>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => setEditingQuestion(q)} className="p-2 text-gray-600 hover:text-indigo-600">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => deleteQuestion(q.id)} className="p-2 text-gray-600 hover:text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
  // PRIVACY POLICY
  if (currentView === 'privacy') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-4">
            <button onClick={() => setCurrentView('home')} className="text-gray-600 hover:text-gray-900">
              ← Back
            </button>
          </div>
        </div>
        <div className="max-w-3xl mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
          <div className="prose prose-gray max-w-none">
            <p className="text-sm text-gray-600 mb-6">Last updated: December 30, 2024</p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">What We Collect</h2>
            <p className="mb-4">We collect your email address to create your account. When you practice interviews, we store your responses to provide AI feedback and track improvement.</p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">How We Use Your Data</h2>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Authenticate your account and sync progress</li>
              <li>Provide interview feedback and track improvement</li>
              <li>Send occasional product updates (you can opt out)</li>
            </ul>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">Data Storage</h2>
            <p className="mb-4">We use Supabase to securely store your data. All data is encrypted in transit and at rest.</p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">Your Rights</h2>
            <p className="mb-4">You can delete your account and all data anytime from Settings.</p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">Microphone Access</h2>
            <p className="mb-4">We request microphone access for interview practice. You control when recording happens. Audio is processed for feedback only.</p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">Contact</h2>
            <p className="mb-4">Questions? Email: privacy@islapp.com</p>
          </div>
        </div>
      </div>
    );
  }

  // TERMS OF SERVICE
  if (currentView === 'terms') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-4">
            <button onClick={() => setCurrentView('home')} className="text-gray-600 hover:text-gray-900">
              ← Back
            </button>
          </div>
        </div>
        <div className="max-w-3xl mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>
          <div className="prose prose-gray max-w-none">
            <p className="text-sm text-gray-600 mb-6">Last updated: December 30, 2024</p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">Acceptance</h2>
            <p className="mb-4">By using ISL, you agree to these terms.</p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">Use License</h2>
            <p className="mb-4">We grant you a personal, non-transferable license to use ISL for interview practice.</p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">Acceptable Use</h2>
            <p className="mb-4">You agree not to:</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Upload illegal or harmful content</li>
              <li>Attempt to bypass security measures</li>
              <li>Harass other users or staff</li>
            </ul>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">No Guarantees</h2>
            <p className="mb-4">ISL provides practice tools and feedback. We do not guarantee interview success or job offers.</p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">Termination</h2>
            <p className="mb-4">We may suspend accounts that violate these terms. You may delete your account at any time.</p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">Contact</h2>
            <p className="mb-4">Support: support@islapp.com</p>
          </div>
        </div>
      </div>
    );
}

  // Answer Assistant Modal - ALWAYS render if active
  return (
    <>
      {showAnswerAssistant && answerAssistantQuestion && (
        <AnswerAssistant
          question={answerAssistantQuestion.question}
          questionId={answerAssistantQuestion.id}
          userContext={getUserContext()}
          userTier={usageStats?.tier}
          onAnswerSaved={(answer) => {
            // Update the current question with the new answer
            setAnswerAssistantQuestion({ 
              ...answerAssistantQuestion, 
              narrative: answer.narrative, 
              bullets: answer.bullets 
            });
            
            // Update questions array
            const updatedQuestions = questions.map(q => 
              q.id === answerAssistantQuestion.id 
                ? { ...q, narrative: answer.narrative, bullets: answer.bullets }
                : q
            );
            setQuestions(updatedQuestions);
            
            alert('✅ Answer saved! Now available in Prompter, Flashcards, and Question Bank.');
          }}
          onClose={() => {
            setShowAnswerAssistant(false);
            setAnswerAssistantQuestion(null);
          }}
        />
      )}
      {null}
    </>
  );
};

// Wrap ISL with ProtectedRoute before exporting
function App() {
  return (
    <ProtectedRoute>
      <ISL />
    </ProtectedRoute>
  );
}

export default App;