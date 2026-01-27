 import React, { useState, useEffect, useRef } from 'react';

import {
  Brain, Database, Play, Plus, Edit2, Trash2, TrendingUp, Download, Upload,
  Mic, MicOff, Volume2, Eye, EyeOff, Settings, Sparkles, ChevronRight, ChevronDown, X,
  Zap, CheckCircle, Target, Bot, BookOpen, SkipForward, Pause, Award, Filter,
  Crown, Lightbulb, Square, Calendar, AlertCircle
} from 'lucide-react';

import SupabaseTest from './SupabaseTest';
import ProtectedRoute from './ProtectedRoute';
import { supabase } from './lib/supabase';
import FirstTimeConsent from "./Components/FirstTimeConsent";
import QuestionAssistant from './Components/QuestionAssistant';
import AnswerAssistant from './Components/AnswerAssistant';
import TemplateLibrary from './TemplateLibrary';
import Tutorial from './Components/Tutorial';
import { DEFAULT_QUESTIONS } from './default_questions';
import { canUseFeature, incrementUsage, getUsageStats, TIER_LIMITS } from './utils/creditSystem';
import UsageLimitModal from './Components/UsageLimitModal';
import PricingPage from './Components/PricingPage';
import ResetPassword from './Components/ResetPassword';
import ConsentDialog from './Components/ConsentDialog';
import SessionDetailsModal from './Components/SessionDetailsModal';

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

  /* Hide scrollbar for swipeable tabs */
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
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
  const currentInterimRef = useRef(''); // Track current interim separately

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
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [showStudyTips, setShowStudyTips] = useState(false);
  const [visualizationTimer, setVisualizationTimer] = useState(null);
  const [swipeStart, setSwipeStart] = useState(null);
  const [swipeDistance, setSwipeDistance] = useState(0);
  const [completedQuestions, setCompletedQuestions] = useState(new Set());
  const [usageStats, setUsageStats] = useState(null);
  const [showStrengths, setShowStrengths] = useState(true);
  const [showGaps, setShowGaps] = useState(true);
  const [animatedScore, setAnimatedScore] = useState(0);
  const [revealStage, setRevealStage] = useState(0);
  const [showAllFeedback, setShowAllFeedback] = useState(false);
  const [commandCenterTab, setCommandCenterTab] = useState('analytics');
  
  // SESSION-BASED MICROPHONE STATES
  const [interviewSessionActive, setInterviewSessionActive] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  
  // REFS TO AVOID STALE CLOSURES IN SPEECH RECOGNITION
  const interviewSessionActiveRef = useRef(false);
  const isCapturingRef = useRef(false);
  const currentModeRef = useRef(null);
  const isListeningRef = useRef(false);
  const captureSourceRef = useRef(null); // Track if capture was started by 'mouse' or 'keyboard'
  const aiQuestionRef = useRef(null); // For auto-scrolling to AI questions
  const initializingDefaultsRef = useRef(false); // Prevent double-initialization in React Strict Mode
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [interviewDate, setInterviewDate] = useState(localStorage.getItem('isl_interview_date') || '');
  const [aiGeneratorCollapsed, setAiGeneratorCollapsed] = useState(true);
  const [selectedChartPoint, setSelectedChartPoint] = useState(null);
  const [showChartModal, setShowChartModal] = useState(false);
  const [dailyGoal, setDailyGoal] = useState(parseInt(localStorage.getItem('isl_daily_goal') || '3', 10));
  const [selectedSession, setSelectedSession] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [userTier, setUserTier] = useState('free');
  const [showPricingPage, setShowPricingPage] = useState(false);
  const [showUsageDashboard, setShowUsageDashboard] = useState(false);
  // REMOVED: showResetPassword and isPasswordResetRequired - now handled in ProtectedRoute.jsx
  const [usageStatsData, setUsageStatsData] = useState(null);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [showAnswerAssistant, setShowAnswerAssistant] = useState(false);
  const [answerAssistantQuestion, setAnswerAssistantQuestion] = useState(null);
  
  // Customization & Onboarding States
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showCustomizationNudge, setShowCustomizationNudge] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const [isNewUser, setIsNewUser] = useState(false);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
  const [showDeleteChoiceModal, setShowDeleteChoiceModal] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showAddQuestionsPrompt, setShowAddQuestionsPrompt] = useState(false);
  
  // Legal Protection States
  const [showConsentDialog, setShowConsentDialog] = useState(false);
  const [hasConsented, setHasConsented] = useState(() => {
    try {
      const consent = localStorage.getItem('isl_recording_consent');
      const hasConsent = consent === 'true';
      console.log(hasConsent ? '✅ User has already consented' : '⚠️ User needs to consent');
      return hasConsent;
    } catch (err) {
      console.error('Error reading consent from localStorage:', err);
      return false; // Default to false if localStorage unavailable
    }
  });
  const [showLivePrompterWarning, setShowLivePrompterWarning] = useState(false);
  const [pendingMode, setPendingMode] = useState(null);
  
  // Usage tracking
  const [usageThisMonth, setUsageThisMonth] = useState(0);
  const [usageLimit, setUsageLimit] = useState(5);
  
  // Collapsible feedback sections
  const [showSTARAnalysis, setShowSTARAnalysis] = useState(true);
  const [showCARAnalysis, setShowCARAnalysis] = useState(false);
  const [showStrongExample, setShowStrongExample] = useState(false);
  const [showYourAnswer, setShowYourAnswer] = useState(false);
  const [showActionSteps, setShowActionSteps] = useState(false);

  // STATE FOR LIVE TRANSCRIPT BOX (Prompter mode)
  const [liveTranscript, setLiveTranscript] = useState('');
  const [matchConfidence, setMatchConfidence] = useState(0);
  const [matchDebug, setMatchDebug] = useState('');
  const [useSystemAudio, setUseSystemAudio] = useState(false); // Capture from speakers instead of mic
  const [systemAudioStream, setSystemAudioStream] = useState(null);

  // KEEP REFS IN SYNC WITH STATE (for speech recognition callbacks)
  useEffect(() => {
    interviewSessionActiveRef.current = interviewSessionActive;
  }, [interviewSessionActive]);
  
  useEffect(() => {
    isCapturingRef.current = isCapturing;
  }, [isCapturing]);
  
  useEffect(() => {
    currentModeRef.current = currentMode;
  }, [currentMode]);
  
  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  // ==========================================
  // 🔴 CRITICAL: MIC CLEANUP EFFECTS
  // Prevents mic from staying active in background
  // ==========================================

  // CLEANUP 1: Stop mic when component unmounts
  useEffect(() => {
    return () => {
      console.log('🧹 Component unmounting - cleaning up mic resources');
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (err) {
          // Ignore - may already be stopped
        }
      }
      // Also stop system audio if active
      if (systemAudioStream) {
        systemAudioStream.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  // E-008 FIX: Consent now read during state initialization above (line 183)
  // This useEffect is no longer needed and has been removed to prevent race conditions

  // CLEANUP 2: Stop mic when leaving mic-using modes
  useEffect(() => {
    // Only cleanup when switching AWAY from mic-using modes
    const micModes = ['prompter', 'ai-interviewer', 'practice'];
    const wasInMicMode = micModes.includes(currentModeRef.current);
    const isInMicMode = micModes.includes(currentMode);
    
    // If we're leaving a mic mode (or going to null/home)
    if (wasInMicMode && !isInMicMode) {
      console.log('🧹 Leaving mic mode - stopping recognition');
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (err) {
          // Ignore
        }
      }
      // Reset all mic state
      setInterviewSessionActive(false);
      interviewSessionActiveRef.current = false;
      setIsListening(false);
      isListeningRef.current = false;
      setIsCapturing(false);
      isCapturingRef.current = false;
      setSessionReady(false);
      
      // Stop system audio capture too
      if (systemAudioStream) {
        systemAudioStream.getTracks().forEach(t => t.stop());
        setSystemAudioStream(null);
        setUseSystemAudio(false);
      }
    }
  }, [currentMode]);

  // CLEANUP 3: Stop mic when app goes to background (Safari tab switch, app switch)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log('🧹 App backgrounded - stopping mic');
        if (recognitionRef.current && interviewSessionActiveRef.current) {
          try {
            recognitionRef.current.stop();
          } catch (err) {
            // Ignore
          }
          // Mark session as ended so it doesn't auto-restart
          setInterviewSessionActive(false);
          interviewSessionActiveRef.current = false;
          setIsListening(false);
          isListeningRef.current = false;
          setSessionReady(false);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

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

  // CUSTOMIZATION SYSTEM HELPERS
  const initializeDefaultQuestions = async (userId) => {
    try {
      console.log('🆕 Initializing default questions for new user:', userId);
      
      const questionsToInsert = DEFAULT_QUESTIONS.map(q => ({
        user_id: userId,
        question: q.question,
        category: q.category,
        priority: q.priority,
        keywords: q.keywords,
        bullets: q.bullets,
        narrative: q.narrative,
        follow_ups: q.followUps,
        is_default: true,
        created_at: new Date().toISOString()
      }));

      const { data, error } = await supabase
        .from('questions')
        .insert(questionsToInsert);

      if (error) {
        console.error('❌ Error inserting default questions:', error);
        return false;
      }

      console.log(`✅ Initialized ${DEFAULT_QUESTIONS.length} default questions`);
      return true;
    } catch (err) {
      console.error('❌ Exception initializing default questions:', err);
      return false;
    }
  };

  const incrementSessionCount = () => {
    if (!currentUser) return;
    
    const storageKey = `isl_session_count_${currentUser.id}`;
    const currentCount = parseInt(localStorage.getItem(storageKey) || '0', 10);
    const newCount = currentCount + 1;
    
    setSessionCount(newCount);
    localStorage.setItem(storageKey, newCount.toString());
    
    console.log(`📊 Session count: ${newCount}`);
    
    // Show nudge at sessions 4 and 6
    if (newCount === 4 || newCount === 6) {
      setTimeout(() => {
        setShowCustomizationNudge(true);
      }, 2000);
    }
    
    return newCount;
  };

  const getCustomizationStatus = () => {
    const customized = questions.filter(q => !q.is_default).length;
    const withKeywords = questions.filter(q => 
      q.keywords && Array.isArray(q.keywords) && q.keywords.length >= 5
    ).length;
    
    return {
      customizedQuestions: customized,
      questionsWithKeywords: withKeywords,
      isLocked: sessionCount >= 7 && customized < 3 && withKeywords < 3
    };
  };


  // USAGE TRACKING FUNCTIONS
  const checkAIUsageLimit = async () => {
    // Get current month's usage
    const currentMonth = new Date().toISOString().slice(0, 7); // "2026-01"
    const storageKey = `isl_usage_${currentMonth}`;
    const currentUsage = parseInt(localStorage.getItem(storageKey) || '0');
    
    const isPro = usageStats?.tier === 'pro' || 
                  usageStats?.tier === 'premium' || 
                  usageStats?.tier === 'beta';
    
    const limit = usageStats?.tier === 'premium' || usageStats?.tier === 'beta' ? 999999 :
                  usageStats?.tier === 'pro' ? 40 : 5;
    
    setUsageThisMonth(currentUsage);
    setUsageLimit(limit);
    
    if (currentUsage >= limit && !isPro) {
      alert(`⚠️ Monthly AI Limit Reached

You've used all ${limit} AI sessions this month.

Upgrade to Pro ($9.99/month) for 40 sessions!

✓ AI Answer Coach
✓ Smart practice queue
✓ Pre-interview prep
✓ More practice sessions

Your free features still work:
✓ Flashcards (unlimited)
✓ Live Prompter (unlimited)
✓ Question Bank (unlimited)`);
      return false;
    }
    
    // Warning at 80%
    if (currentUsage === Math.floor(limit * 0.8) && limit < 999999) {
      alert(`⚠️ 80% of AI sessions used

You've used ${currentUsage} of ${limit} sessions this month.

Consider upgrading to Pro for more sessions!`);
    }
    
    return true;
  };

  const incrementAIUsage = () => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const storageKey = `isl_usage_${currentMonth}`;
    const newUsage = usageThisMonth + 1;
    
    localStorage.setItem(storageKey, newUsage.toString());
    setUsageThisMonth(newUsage);
    
    console.log(`✅ AI Usage: ${newUsage}/${usageLimit}`);
  };

  // Handler for opening AI Coach from Template Library
  const handleOpenAICoachFromTemplate = async (templateQuestion) => {
    // First, save the template question to database
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('Please sign in to use AI Coach');
        return;
      }

      // Save question to database first
      const { data: savedQuestion, error } = await supabase
        .from('questions')
        .insert([{
          user_id: user.id,
          question: templateQuestion.question,
          category: templateQuestion.category || 'Template',
          priority: templateQuestion.priority || 'Standard',
          bullets: templateQuestion.bullets || [],
          narrative: '',
          keywords: []
        }])
        .select()
        .single();

      if (error) throw error;

      // Now open AI Coach with the saved question
      setAnswerAssistantQuestion(savedQuestion);
      setShowAnswerAssistant(true);
      setShowTemplateLibrary(false); // Close template library
      
      // Increment usage
      incrementAIUsage();
      
      console.log('✅ Opened AI Coach for template question');
    } catch (error) {
      console.error('Error opening AI Coach:', error);
      alert('Failed to open AI Coach: ' + error.message);
    }
  };

  // Shared handler for when Answer Assistant saves an answer
  const handleAnswerSaved = (answer) => {
    // Update current question state
    setAnswerAssistantQuestion({ 
      ...answerAssistantQuestion, 
      narrative: answer.narrative, 
      bullets: answer.bullets,
      keywords: answer.keywords || answerAssistantQuestion.keywords || []
    });
    
    // Update questions list
    const updatedQuestions = questions.map(q => 
      q.id === answerAssistantQuestion.id 
        ? { 
            ...q, 
            narrative: answer.narrative, 
            bullets: answer.bullets,
            keywords: answer.keywords || q.keywords || []
          }
        : q
    );
    setQuestions(updatedQuestions);
    
    // Reload from database to ensure sync
    loadQuestions();
    
    console.log('✅ Answer saved with all fields:', { narrative: !!answer.narrative, bullets: answer.bullets?.length, keywords: answer.keywords?.length });
  };

  // Load usage on mount
  useEffect(() => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const storageKey = `isl_usage_${currentMonth}`;
    const currentUsage = parseInt(localStorage.getItem(storageKey) || '0');
    
    const limit = usageStats?.tier === 'premium' || usageStats?.tier === 'beta' ? 999999 :
                  usageStats?.tier === 'pro' ? 40 : 5;
    
    setUsageThisMonth(currentUsage);
    setUsageLimit(limit);
  }, [usageStats]);

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

// Load practice history from Supabase (not just localStorage)
const loadPracticeHistory = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    const { data: sessions } = await supabase
      .from('practice_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (sessions && sessions.length > 0) {
      const history = sessions.map(s => ({
        question: s.question_text,
        answer: s.user_answer,
        feedback: s.ai_feedback,
        date: s.created_at,
        mode: s.mode
      }));
      setPracticeHistory(history);
      console.log(`✅ Loaded ${history.length} practice sessions from Supabase`);
    }
  } catch (err) {
    console.error('Error loading practice history:', err);
    // Fallback to localStorage
    const savedHistory = localStorage.getItem('isl_history');
    if (savedHistory) setPracticeHistory(JSON.parse(savedHistory));
  }
};
loadPracticeHistory();

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
    // REMOVED: Password reset token detection moved to ProtectedRoute.jsx
    // (needs to run BEFORE auth check, not after)

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const user = session?.user ?? null;
      setCurrentUser(user);
      
      // Load user tier from user_profiles
      if (user) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('tier, subscription_status')
          .eq('user_id', user.id)
          .single();
        
        if (profile) {
          setUserTier(profile.tier || 'free');
        } else {
          // Create profile if doesn't exist
          await supabase
            .from('user_profiles')
            .insert([{ user_id: user.id, tier: 'free' }]);
          setUserTier('free');
        }
        
        // Load usage stats
        const stats = await getUsageStats(supabase, user.id, profile?.tier || 'free');
        setUsageStatsData(stats);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const user = session?.user ?? null;
      setCurrentUser(user);
      
      // Load user tier on auth change
      if (user) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('tier, subscription_status')
          .eq('user_id', user.id)
          .single();
        
        if (profile) {
          setUserTier(profile.tier || 'free');
        }
        
        // Load usage stats
        const stats = await getUsageStats(supabase, user.id, profile?.tier || 'free');
        setUsageStatsData(stats);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // NEW USER SETUP - Initialize default questions for first-time users
  useEffect(() => {
    const setupNewUserIfNeeded = async () => {
      if (!currentUser) return;
      
      // CRITICAL: Prevent double-run in React Strict Mode
      if (initializingDefaultsRef.current) {
        console.log('⏭️ Already initializing defaults - skipping duplicate run');
        return;
      }
      
      // Load session count from localStorage
      const storageKey = `isl_session_count_${currentUser.id}`;
      const savedCount = parseInt(localStorage.getItem(storageKey) || '0', 10);
      setSessionCount(savedCount);
      
      // CRITICAL: Check if user wants to keep their bank empty
      const keepEmptyKey = `isl_keep_empty_${currentUser.id}`;
      const wantsEmpty = localStorage.getItem(keepEmptyKey);
      
      if (wantsEmpty === 'true') {
        console.log('✅ User prefers empty question bank - skipping defaults');
        return;
      }
      
      // CRITICAL: Check if we've already initialized defaults for this user
      const defaultsInitializedKey = `isl_defaults_initialized_${currentUser.id}`;
      const alreadyInitialized = localStorage.getItem(defaultsInitializedKey);
      
      if (alreadyInitialized) {
        console.log('✅ Defaults already initialized for this user - skipping');
        return;
      }
      
      console.log('👤 Checking if user needs default questions');
      
      try {
        // Check if user has any questions
        const { data: existingQuestions, error } = await supabase
          .from('questions')
          .select('id')
          .eq('user_id', currentUser.id)
          .limit(1);

        if (error) {
          console.error('❌ Error checking questions:', error);
          return;
        }

        // If no questions exist, this is a new user
        if (!existingQuestions || existingQuestions.length === 0) {
          console.log('🆕 New user detected! Showing tutorial...');
          setIsNewUser(true);
          
          // Mark as initialized so we don't auto-load defaults
          localStorage.setItem(defaultsInitializedKey, 'true');
          
          // Show tutorial for new users (if they haven't seen it)
          const hasSeenTutorial = localStorage.getItem('isl_tutorial_seen');
          if (!hasSeenTutorial) {
            setShowTutorial(true);
          } else {
            // If they've seen tutorial but have no questions, show add questions prompt
            setShowAddQuestionsPrompt(true);
          }
        } else {
          console.log('✅ Existing user - questions already loaded');
          // Mark as initialized if they have questions
          localStorage.setItem(defaultsInitializedKey, 'true');
        }
      } catch (err) {
        console.error('❌ Error in new user setup:', err);
        initializingDefaultsRef.current = false; // Reset on error
      }
    };

    setupNewUserIfNeeded();
  }, [currentUser]);

  useEffect(() => {
    if (currentView === 'home') {
      getCurrentUsage().then(stats => {
        console.log('Usage stats loaded:', stats);
        setUsageStats(stats);
      });
    }
  }, [currentView]);

  // FIXED: Reset scroll position when navigating between views (iOS Safari mid-scroll fix)
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentView]);

  useEffect(() => { if (currentMode === 'prompter' && transcript && !isListening) { console.log('Auto-match:', transcript); matchQuestion(transcript); } }, [transcript, isListening, currentMode]);
  
  // Auto-scroll to question when AI asks a new question
  useEffect(() => {
    if (currentView === 'ai-interviewer' && aiQuestionRef.current && (followUpQuestion || currentQuestion)) {
      // Smooth scroll to the question area when new question appears
      setTimeout(() => {
        aiQuestionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300); // Small delay to ensure content is rendered
    }
  }, [followUpQuestion, currentQuestion, currentView]);
  
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
    
    // CRITICAL: Disable sound events to prevent beeps
    recognition.onsoundstart = null;
    recognition.onsoundend = null;
    recognition.onspeechstart = null;
    recognition.onspeechend = null;
    recognition.onaudiostart = null;
    recognition.onaudioend = null;
    
recognition.onresult = (event) => {
      let interim = '', final = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const part = event.results[i][0].transcript;
        if (event.results[i].isFinal) final += part + ' ';
        else interim += part;
      }
      
      // USE REFS to avoid stale closure - refs always have current value
      const sessionActive = interviewSessionActiveRef.current;
      const capturing = isCapturingRef.current;
      const mode = currentModeRef.current;
      
      // SESSION MODE: Only accumulate when capturing
      // NON-SESSION MODE: Always accumulate
      const shouldAccumulate = sessionActive ? capturing : true;
      
      if (shouldAccumulate) {
        // Save FINAL results permanently
        if (final) {
          accumulatedTranscript.current = (accumulatedTranscript.current + ' ' + final).trim();
          currentInterimRef.current = ''; // Clear interim when we get final
          console.log('Speech (final):', accumulatedTranscript.current);
        }
        
        // Track INTERIM separately (replaces previous interim, doesn't accumulate)
        if (interim) {
          currentInterimRef.current = interim;
        }
        
        // Display combined: all finals + current interim
        const displayText = (accumulatedTranscript.current + ' ' + currentInterimRef.current).trim();
        setTranscript(displayText);
        setLiveTranscript(displayText);
        
        if (mode === 'ai-interviewer' || mode === 'practice') {
          setSpokenAnswer(displayText);
        }
      } else if (sessionActive && !capturing) {
        // Session active but not capturing - don't update (silent listening)
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
  
  // USE REFS to avoid stale closure
  const sessionActive = interviewSessionActiveRef.current;
  const listening = isListeningRef.current;
  
  // SESSION MODE: Always restart (continuous listening)
  if (sessionActive) {
    console.log('Session mode - auto-restarting...');
    try {
      recognitionRef.current.start();
    } catch (err) {
      console.error('Session restart failed:', err);
      setInterviewSessionActive(false);
      setIsListening(false);
    }
  } 
  // NON-SESSION MODE: Restart if still supposed to be listening
  else if (listening) {
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
  // CHECK AND INCREMENT USAGE - Call this before using AI features
  const checkAndIncrementUsage = async (feature, featureName) => {
    if (!currentUser) {
      alert('Please sign in first');
      return false;
    }

    // Get current usage for this month
    const currentPeriod = new Date().toISOString().slice(0, 7); // YYYY-MM
    
    const { data: usage, error } = await supabase
      .from('usage_tracking')
      .select('*')
      .eq('user_id', currentUser.id)
      .eq('period', currentPeriod)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching usage:', error);
    }

    // Check if allowed
    const check = canUseFeature(usage || {}, userTier, feature);
    
    if (!check.allowed) {
      // Show upgrade modal with specific message
      alert(`You've used all ${check.limit} ${featureName} sessions this month!

Upgrade to Pro for UNLIMITED:
• Unlimited AI Interviewer
• Unlimited Practice Mode  
• Unlimited Answer Assistant
• Unlimited Question Generator
• Unlimited Live Prompter

Just $29.99/month - practice as much as you need!`);
      setShowPricingPage(true);
      return false;
    }

    // Increment usage
    await incrementUsage(supabase, currentUser.id, feature);
    
    // Reload stats
    const stats = await getUsageStats(supabase, currentUser.id, userTier);
    setUsageStatsData(stats);
    
    console.log(`✅ ${featureName} session started. ${check.remaining - 1} remaining this month.`);
    
    return true;
  };

  // Wrapper function to open Answer Assistant with usage check
  const openAnswerAssistant = async (question) => {
    const canUse = await checkAndIncrementUsage('answerAssistant', 'Answer Assistant');
    if (!canUse) return;
    
    setAnswerAssistantQuestion(question);
    setShowAnswerAssistant(true);
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
      return true; // E-009 FIX: Return success status
    } catch (err) {
      console.error('Mic error:', err);
      alert('Microphone permission denied.');
      setMicPermission(false);
      return false; // E-009 FIX: Return failure status
    }
  };

// SYSTEM AUDIO CAPTURE (for Teams/Zoom calls)
// Uses getDisplayMedia to capture audio from browser tab
const startSystemAudioCapture = async () => {
  try {
    console.log('🔊 Requesting system audio capture...');
    
    // Request screen share with audio - user must select the tab with Teams/Zoom
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: true, // Required by some browsers
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false
      }
    });
    
    // Check if audio track is present
    const audioTracks = stream.getAudioTracks();
    if (audioTracks.length === 0) {
      alert('No audio track found. Make sure to check "Share tab audio" or "Share system audio" when selecting the tab.');
      stream.getTracks().forEach(t => t.stop());
      return false;
    }
    
    // Stop video track - we only need audio
    const videoTracks = stream.getVideoTracks();
    videoTracks.forEach(t => t.stop());
    
    // Create audio-only stream
    const audioStream = new MediaStream(audioTracks);
    setSystemAudioStream(audioStream);
    
    // Create a new speech recognition that uses this audio
    // Note: Web Speech API doesn't directly support custom audio sources
    // But the system audio will go through the default input if using virtual audio cable
    // For now, we'll inform the user about the limitation
    
    console.log('✅ System audio capture started');
    alert('System audio capture started!\n\nIMPORTANT: For best results with Teams/Zoom:\n1. Make sure Teams/Zoom is in the shared browser tab\n2. Speech recognition will capture from your selected audio source\n3. You may need a virtual audio cable to route system audio to mic input');
    
    return true;
  } catch (err) {
    console.error('System audio capture failed:', err);
    if (err.name === 'NotAllowedError') {
      alert('Screen sharing was denied. System audio capture requires screen share permission.');
    } else {
      alert('System audio capture failed: ' + err.message);
    }
    return false;
  }
};

const stopSystemAudioCapture = () => {
  if (systemAudioStream) {
    systemAudioStream.getTracks().forEach(t => t.stop());
    setSystemAudioStream(null);
    console.log('🔇 System audio capture stopped');
  }
  setUseSystemAudio(false);
};
// SESSION-BASED MICROPHONE CONTROL
const startInterviewSession = () => {
  console.log('🎬 Starting interview session');
  
  // CRITICAL FIX: Always reinitialize recognition before starting new session
  // This ensures we have a clean, working recognition object
  if (!recognitionRef.current) {
    console.log('🔄 Recognition null, initializing...');
    initSpeechRecognition();
  } else {
    // Even if recognition exists, reinitialize to ensure clean state
    console.log('🔄 Reinitializing recognition for new session...');
    try {
      // Clean up existing recognition first
      recognitionRef.current.stop();
      recognitionRef.current.abort?.();
      recognitionRef.current.onresult = null;
      recognitionRef.current.onerror = null;
      recognitionRef.current.onend = null;
    } catch (err) {
      console.log('Cleanup during reinit:', err);
    }
    // Create fresh recognition object
    initSpeechRecognition();
  }
  
  // Give browser a moment to initialize
  setTimeout(() => {
    if (!micPermission) { 
      console.log('⚠️ No mic permission - requesting...');
      requestMicPermission().then(granted => {
        if (granted) {
          // E-009 FIX: Auto-continue session start after permission granted
          console.log('✅ Permission granted, continuing session start...');
          actuallyStartSession();
        }
      });
      return; 
    }
    
    actuallyStartSession();
  }, 100); // Small delay ensures recognition is ready
};

// E-009 FIX: Extracted session start logic so it can be called after permission
const actuallyStartSession = () => {
  if (interviewSessionActiveRef.current) {
    console.log('Session already active');
    return;
  }
  
  // Clear everything for fresh session
  accumulatedTranscript.current = '';
  currentInterimRef.current = '';
  setTranscript('');
  setSpokenAnswer('');
  setMatchedQuestion(null);
  setLiveTranscript('');
  
  // Start mic ONCE - it will stay active throughout session
  if (recognitionRef.current) {
    try {
      recognitionRef.current.start();
      setInterviewSessionActive(true);
      interviewSessionActiveRef.current = true; // Update ref immediately
      setSessionReady(true);
      setIsListening(true);
      isListeningRef.current = true; // Update ref immediately
      console.log('✅ Session started - mic will stay active');
    } catch (err) {
      console.error('Session start failed:', err);
      alert('Failed to start microphone. Please refresh the page and try again.');
    }
  } else {
    console.error('Recognition not initialized after init call');
    alert('Microphone initialization failed. Please refresh the page.');
  }
};

const endInterviewSession = () => {
  console.log('🛑 Ending interview session');
  
  if (!interviewSessionActiveRef.current) return;
  
  // CRITICAL: Stop and clean up microphone completely
  if (recognitionRef.current) {
    try {
      // Stop recognition
      recognitionRef.current.stop();
      
      // Abort any pending processing to release mic immediately
      try {
        recognitionRef.current.abort();
      } catch (abortErr) {
        // abort() might not be available in all browsers, ignore error
      }
      
      // Remove all event listeners to prevent ghost restarts
      recognitionRef.current.onresult = null;
      recognitionRef.current.onerror = null;
      recognitionRef.current.onend = null;
      recognitionRef.current.onstart = null;
      recognitionRef.current.onsoundstart = null;
      recognitionRef.current.onsoundend = null;
      recognitionRef.current.onspeechstart = null;
      recognitionRef.current.onspeechend = null;
      recognitionRef.current.onaudiostart = null;
      recognitionRef.current.onaudioend = null;
      
      // Nullify the reference to ensure complete cleanup
      recognitionRef.current = null;
      
      console.log('✅ Speech recognition fully cleaned up');
    } catch (err) {
      console.error('Error stopping recognition:', err);
    }
  }
  
  // Clean up system audio capture if active
  if (systemAudioStream) {
    try {
      systemAudioStream.getTracks().forEach(track => {
        track.stop();
        console.log('🔇 Stopped audio track:', track.label);
      });
      setSystemAudioStream(null);
      setUseSystemAudio(false);
      console.log('✅ System audio fully cleaned up');
    } catch (err) {
      console.error('Error stopping system audio:', err);
    }
  }
  
  // Reset all state
  setInterviewSessionActive(false);
  interviewSessionActiveRef.current = false;
  setSessionReady(false);
  setIsListening(false);
  isListeningRef.current = false;
  setIsCapturing(false);
  isCapturingRef.current = false;
  setMatchedQuestion(null);
  setTranscript('');
  setLiveTranscript('');
  accumulatedTranscript.current = '';
  currentInterimRef.current = '';
  
  console.log('✅ Session ended and mic fully released');
  
  // Track session completion for customization nudges
  incrementSessionCount();
};

// SPACEBAR CONTROLS CAPTURING (NOT MIC START/STOP)
const handleSpacebarDown = (source = 'keyboard') => {
  if (!interviewSessionActiveRef.current) {
    console.log('No active session - start session first');
    return;
  }
  
  // If already capturing, only allow the same source to continue
  if (isCapturingRef.current) {
    console.log(`Already capturing via ${captureSourceRef.current}, ignoring ${source}`);
    return;
  }
  
  console.log(`🎤 Started capturing (source: ${source})`);
  setIsCapturing(true);
  isCapturingRef.current = true;
  captureSourceRef.current = source; // Track who started the capture
  
  // Clear for fresh capture
  accumulatedTranscript.current = '';
  currentInterimRef.current = '';
  setTranscript('');
  setLiveTranscript('');
  setMatchConfidence(0);
  setMatchDebug('');
};

const handleSpacebarUp = (source = 'keyboard') => {
  if (!interviewSessionActiveRef.current || !isCapturingRef.current) return;
  
  // Only allow the source that started capturing to stop it
  if (captureSourceRef.current !== source) {
    console.log(`Capture started by ${captureSourceRef.current}, ignoring ${source} release`);
    return;
  }
  
  setIsCapturing(false);
  isCapturingRef.current = false;
  captureSourceRef.current = null;
  
  // Use BOTH final results AND current interim (in case user released before finalization)
  const capturedText = (accumulatedTranscript.current + ' ' + currentInterimRef.current).trim();
  
  console.log('⏸️ Captured:', capturedText || '(empty)');
  
  if (capturedText) {
    setLiveTranscript(capturedText);
    matchQuestion(capturedText);
    
    // Auto-clear the live transcript after 5 seconds
    setTimeout(() => {
      setLiveTranscript(prev => prev === capturedText ? '' : prev);
    }, 5000);
  } else {
    setLiveTranscript('(No speech detected - try speaking louder or closer to mic)');
    setTimeout(() => setLiveTranscript(''), 3000);
  }
  
  // Clear both accumulators for next capture
  accumulatedTranscript.current = '';
  currentInterimRef.current = '';
  setTranscript('');
};

// LEGACY FUNCTIONS - Keep for non-session modes
const startListening = () => {
  console.log('Start listening, mode:', currentMode);
  if (!micPermission) { requestMicPermission(); return; }
  
  // Prevent double-start
  if (isListening) {
    console.log('Already listening, skipping');
    return;
  }
  
  // CRITICAL FIX: Reset accumulated transcript for new question
  accumulatedTranscript.current = '';
  setTranscript('');
  setSpokenAnswer('');
  
  // Auto-resume last question ONLY if no question is currently showing
  if (questionHistory.length > 0 && currentMode === 'prompter' && !matchedQuestion) {
    setResumedQuestion(questionHistory[0]);
    setShowResumeToast(true);
    
    // Show "Resumed" for 2 seconds, THEN display question
    setTimeout(() => {
      setMatchedQuestion(questionHistory[0]);
      setShowResumeToast(false);
    }, 2000);
  }
  
  // Clear matched question if starting fresh (user wants a new question)
  if (currentMode === 'prompter' && matchedQuestion) {
    console.log('Clearing previous question for fresh start');
    setMatchedQuestion(null);
  }
  
  if (recognitionRef.current && !isListening) {
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

  // IMPROVED FUZZY MATCHING UTILITIES
  const normalizeText = (text) => {
    return text.toLowerCase()
      .replace(/['']/g, "'")
      .replace(/[""]/g, '"')
      .replace(/[^\w\s'-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  };

  // Levenshtein distance for fuzzy matching
  const levenshteinDistance = (str1, str2) => {
    const m = str1.length, n = str2.length;
    if (m === 0) return n;
    if (n === 0) return m;
    
    const dp = Array.from({ length: m + 1 }, (_, i) => 
      Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
    );
    
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        dp[i][j] = str1[i-1] === str2[j-1] 
          ? dp[i-1][j-1] 
          : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
      }
    }
    return dp[m][n];
  };

  // Check if words are similar (fuzzy)
  const wordsSimilar = (word1, word2, threshold = 0.75) => {
    if (word1 === word2) return true;
    if (word1.length < 3 || word2.length < 3) return word1 === word2;
    
    // Check if one contains the other (stems)
    if (word1.includes(word2) || word2.includes(word1)) return true;
    
    const maxLen = Math.max(word1.length, word2.length);
    const distance = levenshteinDistance(word1, word2);
    return (1 - distance / maxLen) >= threshold;
  };

  // Generate n-grams (phrases) from text
  const getNGrams = (text, n) => {
    const words = text.split(' ').filter(w => w.length > 0);
    const ngrams = [];
    for (let i = 0; i <= words.length - n; i++) {
      ngrams.push(words.slice(i, i + n).join(' '));
    }
    return ngrams;
  };

  // VASTLY IMPROVED MATCHING ALGORITHM
  const matchQuestion = (text) => {
    console.log('🔍 Matching:', text, `(${questions.length} questions available)`);
    
    if (!questions || questions.length === 0) {
      console.log('❌ No questions loaded yet!');
      setLiveTranscript(`Heard: "${text}"\n\n⚠️ No questions loaded. Check your question bank.`);
      return;
    }
    
    const inputNormalized = normalizeText(text);
    const inputWords = inputNormalized.split(' ').filter(w => w.length > 2);
    const inputBigrams = getNGrams(inputNormalized, 2);
    const inputTrigrams = getNGrams(inputNormalized, 3);
    
    // Common interview question patterns to detect
    const questionPatterns = {
      'tell me about yourself': ['tell', 'about', 'yourself', 'walk me through', 'introduce'],
      'why this role': ['why', 'interested', 'role', 'position', 'job', 'apply'],
      'why leaving': ['why', 'leaving', 'leave', 'current', 'transition'],
      'strengths': ['strengths', 'strength', 'excel', 'good at', 'best'],
      'weaknesses': ['weaknesses', 'weakness', 'weak', 'improve', 'development area'],
      'conflict': ['conflict', 'disagreement', 'difficult', 'coworker', 'colleague'],
      'leadership': ['leadership', 'lead', 'leader', 'manage', 'team'],
      'challenge': ['challenge', 'difficult', 'obstacle', 'overcome', 'problem'],
      'experience': ['experience', 'background', 'worked', 'done'],
      'why company': ['why', 'company', 'organization', 'kaiser', 'stanford'],
    };
    
    let bestMatch = null;
    let highestScore = 0;
    let debugInfo = [];
    let perfectMatch = null;
    
    // FIRST PASS: Check for PERFECT/NEAR-PERFECT matches
    // This handles cases where the question is asked exactly or almost exactly
    questions.forEach(q => {
      const questionNormalized = normalizeText(q.question);
      
      // PERFECT MATCH: Input contains the exact question or vice versa
      if (inputNormalized.includes(questionNormalized) || questionNormalized.includes(inputNormalized)) {
        const similarity = Math.min(inputNormalized.length, questionNormalized.length) / 
                          Math.max(inputNormalized.length, questionNormalized.length);
        if (similarity > 0.5) { // At least 50% overlap
          console.log(`🎯 PERFECT MATCH: "${q.question}" (similarity: ${(similarity * 100).toFixed(0)}%)`);
          perfectMatch = q;
          return;
        }
      }
      
      // KEYWORD PERFECT MATCH: Input exactly matches a keyword
      if (q.keywords && q.keywords.length > 0) {
        for (const kw of q.keywords) {
          if (!kw) continue;
          const kwNorm = normalizeText(kw);
          // Input is exactly the keyword or keyword is exactly in input
          if (inputNormalized === kwNorm || inputNormalized.includes(kwNorm)) {
            const kwWords = kwNorm.split(' ').filter(w => w.length > 0);
            if (kwWords.length >= 2) { // Multi-word keyword exact match
              console.log(`🎯 KEYWORD PERFECT MATCH: "${kw}" for "${q.question}"`);
              perfectMatch = q;
              return;
            }
          }
        }
      }
    });
    
    // If we found a perfect match, use it immediately
    if (perfectMatch) {
      setMatchConfidence(95);
      setMatchDebug('Perfect match!');
      setMatchedQuestion(perfectMatch);
      setShowNarrative(false);
      setQuestionHistory(prev => {
        const newHistory = [perfectMatch, ...prev.filter(q => q.id !== perfectMatch.id)];
        return newHistory.slice(0, 3);
      });
      // Auto-scroll to top when new question detected
      window.scrollTo({ top: 0, behavior: 'smooth' });
      console.log('✅ Perfect match used!');
      return;
    }
    
    // SECOND PASS: Fuzzy matching for non-perfect matches
    questions.forEach(q => {
      let score = 0;
      let matchReasons = [];
      
      const questionNormalized = normalizeText(q.question);
      const questionWords = questionNormalized.split(' ').filter(w => w.length > 2);
      
      // 1. EXACT KEYWORD MATCHES (highest weight: 10 per multi-word, 5 per single-word)
      if (q.keywords && q.keywords.length > 0) {
        q.keywords.forEach(kw => {
          if (!kw || kw.trim().length === 0) return;
          
          const kwNorm = normalizeText(kw);
          const kwWords = kwNorm.split(' ').filter(w => w.length > 0);
          
          // Multi-word keyword match (exact phrase)
          if (kwWords.length > 1 && inputNormalized.includes(kwNorm)) {
            score += 10 * kwWords.length;
            matchReasons.push(`exact phrase "${kw}" (+${10 * kwWords.length})`);
          }
          // Single-word keyword match
          else if (kwWords.length === 1) {
            const kwWord = kwWords[0];
            // Exact match
            if (inputWords.includes(kwWord)) {
              score += 5;
              matchReasons.push(`keyword "${kw}" (+5)`);
            }
            // Fuzzy match
            else if (inputWords.some(w => wordsSimilar(w, kwWord))) {
              score += 3;
              matchReasons.push(`fuzzy "${kw}" (+3)`);
            }
          }
          // Partial multi-word keyword (at least 2 words match)
          else if (kwWords.length > 1) {
            const matchCount = kwWords.filter(kw => 
              inputWords.some(iw => wordsSimilar(iw, kw))
            ).length;
            if (matchCount >= 2) {
              score += 4 * matchCount;
              matchReasons.push(`partial phrase "${kw}" (${matchCount}/${kwWords.length} words) (+${4 * matchCount})`);
            }
          }
        });
      }
      
      // 2. QUESTION TEXT MATCHING (medium weight)
      // Important words from the question (excluding common words)
      const stopWords = ['what', 'how', 'why', 'can', 'you', 'tell', 'me', 'about', 'the', 'a', 'an', 'is', 'are', 'do', 'did', 'your', 'have', 'has', 'been', 'with', 'for', 'and', 'or', 'to', 'in', 'of', 'that', 'this', 'would', 'could', 'should'];
      
      const importantQuestionWords = questionWords.filter(w => 
        w.length > 3 && !stopWords.includes(w)
      );
      
      importantQuestionWords.forEach(qWord => {
        if (inputWords.includes(qWord)) {
          score += 2;
          matchReasons.push(`question word "${qWord}" (+2)`);
        } else if (inputWords.some(w => wordsSimilar(w, qWord))) {
          score += 1;
          matchReasons.push(`fuzzy question word "${qWord}" (+1)`);
        }
      });
      
      // 3. BIGRAM/TRIGRAM MATCHING (phrase similarity)
      const questionBigrams = getNGrams(questionNormalized, 2);
      const questionTrigrams = getNGrams(questionNormalized, 3);
      
      inputTrigrams.forEach(tri => {
        if (questionTrigrams.some(qt => qt === tri)) {
          score += 6;
          matchReasons.push(`trigram "${tri}" (+6)`);
        }
      });
      
      inputBigrams.forEach(bi => {
        if (questionBigrams.some(qb => qb === bi)) {
          score += 3;
          matchReasons.push(`bigram "${bi}" (+3)`);
        }
      });
      
      // 4. PATTERN DETECTION (boost for common interview question types)
      Object.entries(questionPatterns).forEach(([pattern, indicators]) => {
        const inputHasPattern = indicators.filter(ind => 
          inputWords.some(w => wordsSimilar(w, ind))
        ).length;
        const questionHasPattern = indicators.filter(ind => 
          questionWords.some(w => wordsSimilar(w, ind))
        ).length;
        
        if (inputHasPattern >= 2 && questionHasPattern >= 2) {
          score += 4;
          matchReasons.push(`pattern "${pattern}" (+4)`);
        }
      });
      
      // Log detailed match info
      if (score > 0) {
        const shortQ = q.question.substring(0, 50) + (q.question.length > 50 ? '...' : '');
        debugInfo.push({ question: shortQ, score, reasons: matchReasons });
        console.log(`📊 "${shortQ}" = ${score} [${matchReasons.join(', ')}]`);
      }
      
      if (score > highestScore) {
        highestScore = score;
        bestMatch = q;
      }
    });
    
    // Calculate confidence (0-100%)
    const confidence = Math.min(100, Math.round(highestScore * 5));
    setMatchConfidence(confidence);
    
    // Sort debug info by score
    debugInfo.sort((a, b) => b.score - a.score);
    setMatchDebug(debugInfo.slice(0, 3).map(d => 
      `${d.question}: ${d.score}pts`
    ).join('\n'));
    
    console.log('🏆 Best:', bestMatch?.question, `(score: ${highestScore}, confidence: ${confidence}%)`);
    
    // DYNAMIC THRESHOLD based on input length
    // LOWERED thresholds to be more permissive
    const inputLength = inputWords.length;
    let threshold;
    if (inputLength <= 3) {
      threshold = 3; // Very short input - be more permissive
    } else if (inputLength <= 6) {
      threshold = 3;
    } else if (inputLength <= 10) {
      threshold = 4;
    } else {
      threshold = 5; // Long input should have multiple matches
    }
    
    if (bestMatch && highestScore >= threshold) { 
      setMatchedQuestion(bestMatch); 
      setShowNarrative(false); 
      setQuestionHistory(prev => {
        const newHistory = [bestMatch, ...prev.filter(q => q.id !== bestMatch.id)];
        return newHistory.slice(0, 3);
      });
      // Auto-scroll to top when new question detected
      window.scrollTo({ top: 0, behavior: 'smooth' });
      console.log(`✅ Matched! (threshold: ${threshold})`); 
    } else { 
      console.log(`❌ No match - score ${highestScore} below threshold ${threshold}`); 
      const mode = currentModeRef.current;
      if (mode === 'prompter' || mode === 'ai-interviewer') {
        // Show what was heard and top candidates
        const topCandidates = debugInfo.slice(0, 2).map(d => d.question).join(' | ');
        if (topCandidates) {
          setTranscript(`Heard: "${text}"\n\nClosest matches: ${topCandidates}\n\n(Score too low for auto-match. Try adding better keywords.)`);
        } else {
          setTranscript(`Heard: "${text}"\n\nNo matching questions found. Add keywords that match this phrasing.`);
        }
      }
    }
  };

useEffect(() => {
    const handleKeyDown = (e) => { 
      const isTyping = e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT'; 
      const isButton = e.target.tagName === 'BUTTON';
      
      if (e.code === 'Space' && (currentMode === 'prompter' || currentMode === 'ai-interviewer' || currentMode === 'practice') && !spacebarHeld && !isTyping && !isButton) { 
        e.preventDefault(); 
        setSpacebarHeld(true); 
        
        // SESSION MODE: Spacebar controls capturing, not mic
        if (interviewSessionActive) {
          handleSpacebarDown('keyboard');
        } else {
          // NON-SESSION MODE: Old behavior
          startListening();
        }
      } 
    };
    
    const handleKeyUp = (e) => { 
      const isTyping = e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT'; 
      const isButton = e.target.tagName === 'BUTTON';
      
      if (e.code === 'Space' && spacebarHeld && !isTyping && !isButton) { 
        e.preventDefault(); 
        setSpacebarHeld(false); 
        
        // SESSION MODE: Spacebar controls capturing, not mic
        if (interviewSessionActive) {
          handleSpacebarUp('keyboard');
        } else {
          // NON-SESSION MODE: Old behavior
          stopListening();
        }
      } 
    };
    
    if (currentMode) { window.addEventListener('keydown', handleKeyDown); window.addEventListener('keyup', handleKeyUp); return () => { window.removeEventListener('keydown', handleKeyDown); window.removeEventListener('keyup', handleKeyUp); }; }
  }, [currentMode, spacebarHeld, isListening, interviewSessionActive, isCapturing]);
  // TTS with improved voice selection
  const speakText = (text) => {
    if (!synthRef.current) { console.warn('TTS not available'); return; }
    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = synthRef.current.getVoices();
    
    // Priority order for best voices (more natural sounding)
    const voicePriority = [
      'Samantha',           // macOS - very natural
      'Google US English',  // Google voices are good
      'Google UK English Female',
      'Microsoft Zira',     // Windows - decent
      'Microsoft David',
      'Alex',              // macOS male
      'Karen',             // macOS female
      'Fiona'              // macOS Scottish
    ];
    
    // Find the best available voice
    let selectedVoice = null;
    for (const voiceName of voicePriority) {
      selectedVoice = voices.find(v => v.name.includes(voiceName));
      if (selectedVoice) break;
    }
    
    // Fallback to any English voice if no priority match
    if (!selectedVoice) {
      selectedVoice = voices.find(v => v.lang.startsWith('en-')) || voices[0];
    }
    
    if (selectedVoice) { 
      utterance.voice = selectedVoice; 
      console.log('🎙️ Voice:', selectedVoice.name); 
    }
    
    // Optimized settings for more natural speech
    utterance.rate = 0.92;   // Slightly slower for clarity
    utterance.pitch = 1.05;  // Slightly higher pitch sounds more natural
    utterance.volume = 1.0;
    
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

  const deleteAllQuestions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('Please sign in to delete questions');
        return;
      }

      const { error } = await supabase
        .from('questions')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      setQuestions([]);
      setShowDeleteAllConfirm(false);
      
      // Clear the initialization flag so defaults CAN be reloaded if user wants
      localStorage.removeItem(`isl_defaults_initialized_${user.id}`);
      
      console.log('✅ All questions deleted from Supabase');
      
      // Show choice modal: Keep empty or load defaults
      setShowDeleteChoiceModal(true);
    } catch (error) {
      console.error('❌ Error deleting all questions:', error);
      alert('Failed to delete questions: ' + error.message);
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
  const startPrompterMode = () => { 
    console.log('🎬 startPrompterMode called');
    
    if (questions.length === 0) { 
      alert('Add questions first!'); 
      return; 
    }
    
    if (!hasConsented) {
      console.log('⚠️ No consent - showing dialog');
      setPendingMode('prompter');
      setShowConsentDialog(true);
      return;
    }
    
    console.log('✅ Has consent - showing Live Prompter warning');
    setPendingMode('prompter');
    setShowLivePrompterWarning(true);
  };
  
  const actuallyStartPrompter = () => {
    console.log('🚀 Actually starting prompter mode');
    accumulatedTranscript.current = ''; 
    setCurrentMode('prompter'); 
    setCurrentView('prompter'); 
    setMatchedQuestion(null); 
    setTranscript('');
    setPendingMode(null);
    setShowLivePrompterWarning(false);
  };
 const startAIInterviewer = async () => { 
    console.log('🎬 startAIInterviewer called');
    
    if (questions.length === 0) { 
      alert('Add questions first!'); 
      return; 
    }
    
    if (!hasConsented) {
      console.log('⚠️ No consent - showing dialog');
      setPendingMode('ai-interviewer');
      setShowConsentDialog(true);
      return;
    }
    
    console.log('✅ Has consent - starting AI Interviewer');
    await actuallyStartAIInterviewer();
  };
  
  const actuallyStartAIInterviewer = async () => {
    console.log('🚀 Actually starting AI Interviewer');
    
    // CHECK USAGE FIRST
    const canUse = await checkAndIncrementUsage('aiInterviewer', 'AI Interviewer');
    if (!canUse) return;
    
    accumulatedTranscript.current = ''; 

    const randomQ = questions[Math.floor(Math.random() * questions.length)]; 
    setCurrentQuestion(randomQ); 
    setCurrentMode('ai-interviewer'); 
    setCurrentView('ai-interviewer'); 
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setUserAnswer(''); 
    setSpokenAnswer(''); 
    setFeedback(null); 
    setConversationHistory([]);
setFollowUpQuestion(null);
setExchangeCount(0);
    setTimeout(() => { speakText(randomQ.question); }, 500);
    setPendingMode(null);
  };
const startPracticeMode = async () => { 
    console.log('🎬 startPracticeMode called');
    
    if (questions.length === 0) { 
      alert('Add questions first!'); 
      return; 
    }
    
    if (!hasConsented) {
      console.log('⚠️ No consent - showing dialog');
      setPendingMode('practice');
      setShowConsentDialog(true);
      return;
    }
    
    console.log('✅ Has consent - starting Practice');
    await actuallyStartPractice();
  };
  
  const actuallyStartPractice = async () => {
    console.log('🚀 Actually starting Practice mode');
    
    // CHECK USAGE FIRST
    const canUse = await checkAndIncrementUsage('practiceMode', 'Practice Mode');
    if (!canUse) return;
    
    accumulatedTranscript.current = ''; 

    const randomQ = questions[Math.floor(Math.random() * questions.length)]; 
    setCurrentQuestion(randomQ); 
    setCurrentMode('practice'); 
    setCurrentView('practice'); 
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setUserAnswer(''); 
    setSpokenAnswer(''); 
    setFeedback(null);
    setPendingMode(null);
  };

  // Navigation functions for prev/next question
  const goToNextQuestion = () => {
    if (!currentQuestion || questions.length === 0) return;
    const currentIndex = questions.findIndex(q => q.id === currentQuestion.id);
    const nextIndex = (currentIndex + 1) % questions.length;
    const nextQ = questions[nextIndex];
    setCurrentQuestion(nextQ);
    setUserAnswer('');
    setSpokenAnswer('');
    setTranscript('');
    accumulatedTranscript.current = '';
    setFeedback(null);
    setFollowUpQuestion(null);
    setConversationHistory([]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToPreviousQuestion = () => {
    if (!currentQuestion || questions.length === 0) return;
    const currentIndex = questions.findIndex(q => q.id === currentQuestion.id);
    const prevIndex = (currentIndex - 1 + questions.length) % questions.length;
    const prevQ = questions[prevIndex];
    setCurrentQuestion(prevQ);
    setUserAnswer('');
    setSpokenAnswer('');
    setTranscript('');
    accumulatedTranscript.current = '';
    setFeedback(null);
    setFollowUpQuestion(null);
    setConversationHistory([]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const startFlashcardMode = () => { if (questions.length === 0) { alert('Add questions first!'); return; } let available = questions; if (filterCategory !== 'All') available = available.filter(q => q.category === filterCategory); if (available.length === 0) { alert('No matching questions!'); return; } const sorted = [...available].sort((a, b) => { if (a.practiceCount === 0) return -1; if (b.practiceCount === 0) return 1; return a.averageScore - b.averageScore; }); setCurrentQuestion(sorted[0]); setCurrentMode('flashcard'); setCurrentView('flashcard'); setFlashcardSide('question'); setShowBullets(false); setShowNarrative(false); };

  // ==========================================
  // RENDERS START HERE
  // ==========================================

  // OVERLAY DIALOGS - Render BEFORE view checks so they always work
  return (
    <>
      {/* TUTORIAL - Shows for new users first */}
      <Tutorial 
        user={currentUser}
        isActive={showTutorial}
        onClose={() => {
          setShowTutorial(false);
          // After tutorial, show add questions prompt
          setShowAddQuestionsPrompt(true);
        }}
        onOpenTemplateLibrary={() => {
          setShowTutorial(false);
          setShowTemplateLibrary(true);
        }}
        onNavigateToCommandCenter={(tab = 'bank') => {
          setShowTutorial(false);
          setCurrentView('command-center');
          setCommandCenterTab(tab);
        }}
      />

      {/* ADD QUESTIONS PROMPT - Shows after tutorial or for users with no questions */}
      {showAddQuestionsPrompt && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div 
            className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-2xl max-w-2xl w-full p-8 shadow-2xl border-2 border-indigo-500/50 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-2 text-white">Ready to Add Questions?</h2>
              <p className="text-xl text-indigo-200">Choose how you'd like to build your question bank</p>
            </div>

            <div className="space-y-4 mb-6">
              {/* Option 1: AI Generator */}
              <div className="bg-white/10 backdrop-blur rounded-xl p-5 border-2 border-purple-400/50 hover:border-purple-400 transition cursor-pointer"
                onClick={() => {
                  console.log('🟣 AI Generator clicked in Add Questions Prompt');
                  setShowAddQuestionsPrompt(false);
                  setCurrentView('command-center');
                  setCommandCenterTab('bank');
                  console.log('🟣 Should navigate to Command Center (bank tab)');
                }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1 text-white">AI Question Generator</h3>
                    <p className="text-sm text-indigo-200 mb-2">
                      Enter your target role, background, and job description. AI generates personalized questions.
                    </p>
                    <span className="inline-block px-3 py-1 bg-green-500/20 text-green-300 text-xs font-bold rounded-full border border-green-500/50">
                      ⭐ RECOMMENDED
                    </span>
                  </div>
                </div>
              </div>

              {/* Option 2: Template Library */}
              <div className="bg-white/10 backdrop-blur rounded-xl p-5 border-2 border-indigo-400/30 hover:border-indigo-400 transition cursor-pointer"
                onClick={() => {
                  console.log('🔵 Template Library clicked in Add Questions Prompt');
                  console.log('🔵 Closing Add Questions Prompt...');
                  setShowAddQuestionsPrompt(false);
                  console.log('🔵 Opening Template Library...');
                  setShowTemplateLibrary(true);
                  console.log('🔵 Template Library state should now be true');
                }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Database className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1 text-white">Template Library</h3>
                    <p className="text-sm text-indigo-200">
                      Import pre-built question sets for common roles (Product Manager, Software Engineer, etc.)
                    </p>
                  </div>
                </div>
              </div>

              {/* Option 3: Manual */}
              <div className="bg-white/10 backdrop-blur rounded-xl p-5 border-2 border-indigo-400/30 hover:border-indigo-400 transition cursor-pointer"
                onClick={() => {
                  console.log('⚪ Manual Entry clicked in Add Questions Prompt');
                  setShowAddQuestionsPrompt(false);
                  setCurrentView('command-center');
                  setCommandCenterTab('bank');
                  console.log('⚪ Should navigate to Command Center (bank tab)');
                }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-gray-500 to-gray-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Edit2 className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1 text-white">Add Manually</h3>
                    <p className="text-sm text-indigo-200">
                      Type or paste questions directly from job postings or past interviews
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-500/20 border-2 border-blue-400/50 rounded-xl p-4 mb-6">
              <p className="text-sm text-blue-200">
                <strong>💡 Tip:</strong> You need at least a few questions to use Live Prompter, AI Interviewer, and Practice modes.
              </p>
            </div>

            <button
              onClick={() => setShowAddQuestionsPrompt(false)}
              className="w-full py-3 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition"
            >
              I'll Add Questions Later
            </button>
          </div>
        </div>
      )}

      {/* WELCOME MODAL - First-time user onboarding */}
      {showWelcomeModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl max-w-2xl w-full p-8 shadow-2xl border border-green-500/30">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-2">Welcome to InterviewAnswers.ai!</h2>
              <p className="text-xl text-gray-300">We've loaded 12 common interview questions so you can start immediately</p>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-6 mb-6">
              <h3 className="font-bold text-lg mb-3 text-green-400">✨ You can now use:</h3>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-green-400 font-bold">✓</span>
                  <span><strong>Live Prompter</strong> - Real-time interview assistance (works right now!)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 font-bold">✓</span>
                  <span><strong>AI Practice</strong> - Get feedback on your answers</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 font-bold">✓</span>
                  <span><strong>Flashcard Mode</strong> - Study with spaced repetition</span>
                </li>
              </ul>
            </div>

            <div className="bg-blue-900/30 rounded-xl p-6 mb-8 border border-blue-500/30">
              <h3 className="font-bold text-lg mb-3 text-blue-300">💡 Pro Tip:</h3>
              <p className="text-gray-300 mb-3">
                These default questions work great, but <strong>customizing them for YOUR specific role</strong> makes 
                Live Prompter 10x more accurate.
              </p>
              <p className="text-sm text-gray-400">
                You can customize anytime in Command Center → Bank
              </p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowWelcomeModal(false);
                  localStorage.setItem(`isl_welcome_seen_${currentUser.id}`, 'true');
                  setCurrentView('command-center');
                  setCommandCenterTab('bank');
                }}
                className="flex-1 bg-gray-700 hover:bg-gray-600 py-4 rounded-xl font-bold transition-all border border-gray-600"
              >
                Customize First (2 min)
              </button>
              <button
                onClick={() => {
                  setShowWelcomeModal(false);
                  localStorage.setItem(`isl_welcome_seen_${currentUser.id}`, 'true');
                  setCurrentView('prompter');
                }}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 py-4 rounded-xl font-bold transition-all shadow-lg"
              >
                Try Live Prompter Now! →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOMIZATION NUDGE - After sessions 4 and 6 */}
      {showCustomizationNudge && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl max-w-lg w-full p-8 shadow-2xl border border-yellow-500/30">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-gray-900" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Great session!</h2>
              <p className="text-gray-300">Session #{sessionCount} complete</p>
            </div>

            <div className="bg-yellow-900/20 rounded-xl p-6 mb-6 border border-yellow-500/30">
              <h3 className="font-bold mb-3 text-yellow-300">💡 Want better accuracy?</h3>
              <p className="text-gray-300 mb-4">
                Customizing questions for YOUR specific role and adding more keywords can boost 
                match rates to 90%+
              </p>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• Add industry-specific terminology</li>
                <li>• Include variations of how YOUR interviewer asks questions</li>
                <li>• Takes just 2-3 minutes</li>
              </ul>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setShowCustomizationNudge(false)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 py-3 rounded-xl font-bold transition-all"
              >
                Maybe Later
              </button>
              <button
                onClick={() => {
                  setShowCustomizationNudge(false);
                  setCurrentView('command-center');
                  setCommandCenterTab('bank');
                }}
                className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 py-3 rounded-xl font-bold transition-all shadow-lg"
              >
                Customize Now (2 min)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE ALL CONFIRMATION MODAL */}
      {showDeleteAllConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-10 h-10 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold mb-2 text-gray-900">Delete All Questions?</h2>
              <p className="text-gray-600">
                This will permanently delete all <strong>{questions.length} questions</strong> from your account.
              </p>
            </div>

            <div className="bg-red-50 rounded-xl p-4 mb-6 border border-red-200">
              <p className="text-sm text-red-800 font-medium mb-2">⚠️ This action cannot be undone!</p>
              <p className="text-xs text-red-700">
                All questions, keywords, bullets, and practice history will be deleted.
              </p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setShowDeleteAllConfirm(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 rounded-lg transition-all"
              >
                Cancel
              </button>
              <button
                onClick={deleteAllQuestions}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-all"
              >
                Delete All {questions.length}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CHOICE MODAL - After deleting all questions */}
      {showDeleteChoiceModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl max-w-lg w-full p-8 shadow-2xl border border-green-500/30">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold mb-2">All Questions Deleted!</h2>
              <p className="text-lg text-gray-300">What would you like to do next?</p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                <h3 className="font-bold text-green-400 mb-2">📦 Load 12 Default Questions</h3>
                <p className="text-sm text-gray-400">
                  Get common interview questions to start using Live Prompter immediately
                </p>
              </div>
              
              <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                <h3 className="font-bold text-blue-400 mb-2">🗑️ Keep Question Bank Empty</h3>
                <p className="text-sm text-gray-400">
                  Start fresh - you can add custom questions or load defaults anytime in Command Center
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={async () => {
                  // Set "keep empty" preference
                  localStorage.setItem(`isl_keep_empty_${currentUser.id}`, 'true');
                  setShowDeleteChoiceModal(false);
                  console.log('✅ User chose to keep question bank empty');
                }}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-4 rounded-xl transition-all border border-gray-600"
              >
                Keep Empty
              </button>
              <button
                onClick={async () => {
                  // Clear "keep empty" preference and load defaults
                  localStorage.removeItem(`isl_keep_empty_${currentUser.id}`);
                  const success = await initializeDefaultQuestions(currentUser.id);
                  if (success) {
                    await loadQuestions();
                    localStorage.setItem(`isl_defaults_initialized_${currentUser.id}`, 'true');
                    setShowDeleteChoiceModal(false);
                    console.log('✅ Loaded 12 default questions');
                  }
                }}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg"
              >
                Load 12 Defaults
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONSENT DIALOG - First-time recording consent */}
      <ConsentDialog 
        show={showConsentDialog && !hasConsented}
        pendingMode={pendingMode}
        onCancel={() => {
          console.log('❌ Consent canceled');
          setShowConsentDialog(false);
          setPendingMode(null);
        }}
        onAgree={() => {
          console.log('✅ User agreed to consent');
          localStorage.setItem('isl_recording_consent', 'true');
          setHasConsented(true);
          setShowConsentDialog(false);
          if (pendingMode === 'prompter') {
            setShowLivePrompterWarning(true);
          } else if (pendingMode === 'ai-interviewer') {
            actuallyStartAIInterviewer();
          } else if (pendingMode === 'practice') {
            actuallyStartPractice();
          }
        }}
        onNavigate={(view) => {
          setShowConsentDialog(false);
          setCurrentView(view);
        }}
      />


      {/* LIVE PROMPTER WARNING - Shows before activating prompter */}
      {showLivePrompterWarning && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 overflow-y-auto">
          <div 
            className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-auto shadow-2xl my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="text-center flex-1">
                  <span className="text-5xl">⚠️</span>
                </div>
                <button
                  onClick={() => {
                    console.log('❌ Live Prompter warning canceled via X');
                    setShowLivePrompterWarning(false);
                    setPendingMode(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <h2 className="text-xl font-bold text-center mb-3 text-red-600">
                Live Prompter - Legal Warning
              </h2>
              
              <p className="text-gray-700 mb-3 text-sm text-center">
                You're about to use Live Prompter during real interviews.
              </p>

              <div className="bg-red-50 border-l-4 border-red-400 rounded p-3 mb-3">
                <p className="font-bold text-red-900 text-sm mb-2">YOU MUST:</p>
                <ul className="space-y-1 text-xs text-red-800">
                  <li>• <strong>Obtain consent</strong> from interviewer before recording</li>
                  <li>• <strong>Inform them</strong> you're using assistance technology</li>
                  <li>• <strong>Comply with laws</strong> requiring all-party consent</li>
                </ul>
              </div>

              <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded p-3 mb-3">
                <p className="font-bold text-yellow-900 text-xs mb-1">Legal Consequences:</p>
                <p className="text-yellow-800 text-xs">
                  Recording without consent is <strong>illegal</strong> in CA, FL, IL, MA, PA, WA, etc. 
                  You could face criminal charges or job disqualification.
                </p>
              </div>

              <div className="bg-green-50 rounded p-3 mb-4 text-center">
                <p className="text-xs text-green-800">
                  <strong>Recommended:</strong> Use for practice only, not actual interviews.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    console.log('❌ Live Prompter warning canceled');
                    setShowLivePrompterWarning(false);
                    setPendingMode(null);
                  }}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-lg text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    console.log('✅ User accepted Live Prompter warning');
                    setShowLivePrompterWarning(false);
                    actuallyStartPrompter();
                  }}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg text-xs"
                >
                  I Understand & Accept Responsibility
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* NOW RENDER THE ACTUAL VIEW CONTENT */}
      {(() => {

// HOME
  if (currentView === 'home') {
    const categories = ['All', ...new Set(questions.map(q => q.category))];
    const priorities = ['All', ...new Set(questions.map(q => q.priority))];
    
    // Calculate user progress metrics
    const totalSessions = practiceHistory.length;
    const questionsCount = questions.length;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <div className="container mx-auto px-4 py-8">
          
          {/* Profile Menu - Top Right Corner */}
          <div className="flex justify-end mb-6">
            <div className="relative">
              <button
                data-tutorial="menu"
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-lg rounded-full px-4 py-2 text-white transition-all border border-white/20"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center font-bold text-sm">
                  {currentUser?.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span className={`transition-transform text-sm ${showProfileDropdown ? 'rotate-180' : ''}`}>▼</span>
              </button>

              {/* Dropdown - UNCHANGED */}
              {showProfileDropdown && (
                <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl overflow-hidden z-50">
                  <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 text-white">
                    <p className="font-bold text-lg">
                      {currentUser?.user_metadata?.full_name || currentUser?.email?.split('@')[0] || 'User'}
                    </p>
                    <p className="text-sm opacity-70">{currentUser?.email}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowProfileDropdown(false);
                      setShowUsageDashboard(true);
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 transition flex items-center gap-3 text-gray-700 border-b border-gray-100"
                  >
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold">My Usage</span>
                  </button>
                  {userTier === 'free' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowProfileDropdown(false);
                        setShowPricingPage(true);
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-indigo-50 transition flex items-center gap-3 text-indigo-600 border-b border-gray-100 font-semibold"
                    >
                      <Crown className="w-5 h-5" />
                      <span>Upgrade to Pro</span>
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log('Settings clicked');
                      setShowProfileDropdown(false);
                      setCurrentView('settings');
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 transition flex items-center gap-3 text-gray-700 border-b border-gray-100"
                  >
                    <Settings className="w-5 h-5 text-indigo-600" />
                    <span className="font-semibold">Settings</span>
                  </button>
                  <button
                    onClick={async (e) => {
                      e.stopPropagation();
                      if (confirm('Are you sure you want to sign out?')) {
                        setShowProfileDropdown(false);
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
                              if (key !== 'isl_api_key') {
                                keysToRemove.push(key);
                              }
                            }
                            keysToRemove.forEach(key => localStorage.removeItem(key));
                            sessionStorage.clear();
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

          {/* Clean Centered Title */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-3">InterviewAnswers.ai</h1>
            <p className="text-xl md:text-3xl text-indigo-200 mb-2">Master Your Interview Answers with AI</p>
          </div>

          {/* Compact Stats Row - Enhanced with Gradients */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <div className="bg-gradient-to-br from-indigo-500/20 to-blue-500/20 backdrop-blur-lg rounded-xl p-4 text-white hover:scale-105 transition-transform duration-200 border border-white/20 cursor-pointer" onClick={() => {
              setCurrentView('command-center');
              setCommandCenterTab('bank');
            }}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Database className="w-6 h-6 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-2xl font-black leading-tight">{questions.length}</p>
                  <p className="text-xs text-white/90 leading-tight font-bold">Questions</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-lg rounded-xl p-4 text-white hover:scale-105 transition-transform duration-200 border border-white/20 cursor-pointer" onClick={() => {
              setCurrentView('command-center');
              setCommandCenterTab('progress');
            }}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-2xl font-black leading-tight">{practiceHistory.length}</p>
                  <p className="text-xs text-white/90 leading-tight font-bold">Sessions</p>
                </div>
              </div>
            </div>
            {/* Usage Dashboard Link Card - Clickable */}
            <div 
              className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 backdrop-blur-lg rounded-xl p-4 text-white hover:scale-105 transition-transform duration-200 cursor-pointer border border-white/20"
              onClick={() => setShowUsageDashboard(true)}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-xl font-black leading-tight">
                    {userTier === 'pro' ? '∞' : 'View'}
                  </p>
                  <p className="text-xs text-white/90 leading-tight font-bold whitespace-nowrap">
                    {userTier === 'pro' ? 'Unlimited' : 'Usage'}
                  </p>
                </div>
              </div>
            </div>
            {/* Days Until Interview Card */}
            <div 
              className="bg-gradient-to-br from-pink-500/20 to-red-500/20 backdrop-blur-lg rounded-xl p-4 text-white hover:scale-105 transition-transform duration-200 cursor-pointer border border-white/20"
              onClick={() => {
                setCurrentView('command-center');
                setCommandCenterTab('prep');
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-red-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-2xl font-black leading-tight">
                    {interviewDate 
                      ? (() => {
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          const interview = new Date(interviewDate);
                          interview.setHours(0, 0, 0, 0);
                          const diffTime = interview.getTime() - today.getTime();
                          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                          return Math.max(0, diffDays);
                        })()
                      : '—'
                    }
                  </p>
                  <p className="text-xs text-white/90 leading-tight font-bold whitespace-nowrap">
                    {interviewDate ? 'Days' : 'Set Date'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Start Tip - Enhanced */}
          {questions.length === 0 && (
            <div className="bg-gradient-to-r from-blue-500/30 to-indigo-500/30 backdrop-blur-xl border-2 border-blue-400/50 rounded-2xl p-6 text-white mb-6 shadow-xl">
              <div className="flex items-start gap-4">
                <div className="text-4xl">👋</div>
                <div className="flex-1">
                  <p className="text-xl font-black mb-2">Ready to start your interview journey?</p>
                  <p className="text-base text-white/90 font-medium mb-4">Let's load some questions and start practicing!</p>
                  <button
                    onClick={() => setCurrentView('command-center')}
                    className="bg-white text-indigo-600 px-6 py-3 rounded-lg font-bold hover:bg-indigo-50 transition-all shadow-lg"
                  >
                    Go to Command Center →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Practice Modes - Enhanced with Psychology */}
          <div className="mb-6">
            <h2 className="text-2xl md:text-3xl font-black text-white mb-2">🎯 Practice Modes</h2>
            <p className="text-white/80 text-sm md:text-base mb-4 font-medium">Choose your training method and level up your skills</p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Live Prompter - Enhanced */}
              <div className="bg-white rounded-2xl shadow-2xl p-6 transition-all duration-300 hover:shadow-green-500/50 hover:-translate-y-2 cursor-pointer group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-green-400/0 to-emerald-500/0 group-hover:from-green-400/10 group-hover:to-emerald-500/10 transition-all duration-300"></div>
                <div className="text-center flex flex-col h-full relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Mic className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-black mb-2 text-gray-900">Live Prompter</h3>
                  <p className="text-gray-600 text-sm mb-4 flex-1 font-semibold">Real-time bullet prompts</p>
                  <button onClick={startPrompterMode} className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl">
                    Start Practice
                  </button>
                </div>
              </div>

              {/* AI Interviewer - Enhanced */}
              <div className="bg-white rounded-2xl shadow-2xl p-6 transition-all duration-300 hover:shadow-purple-500/50 hover:-translate-y-2 cursor-pointer group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400/0 to-pink-500/0 group-hover:from-purple-400/10 group-hover:to-pink-500/10 transition-all duration-300"></div>
                <div className="text-center flex flex-col h-full relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Bot className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-black mb-2 text-gray-900">AI Interviewer</h3>
                  <p className="text-gray-600 text-sm mb-4 flex-1 font-semibold">Realistic interview practice</p>
                  <button onClick={startAIInterviewer} className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl">
                    Start Interview
                  </button>
                </div>
              </div>

              {/* Practice Mode - Enhanced */}
              <div className="bg-white rounded-2xl shadow-2xl p-6 transition-all duration-300 hover:shadow-blue-500/50 hover:-translate-y-2 cursor-pointer group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/0 to-indigo-500/0 group-hover:from-blue-400/10 group-hover:to-indigo-500/10 transition-all duration-300"></div>
                <div className="text-center flex flex-col h-full relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Target className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-black mb-2 text-gray-900">Practice</h3>
                  <p className="text-gray-600 text-sm mb-4 flex-1 font-semibold">AI-powered feedback</p>
                  <button onClick={startPracticeMode} className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl">
                    Start Session
                  </button>
                </div>
              </div>

              {/* Flashcard - Enhanced */}
              <div className="bg-white rounded-2xl shadow-2xl p-6 transition-all duration-300 hover:shadow-orange-500/50 hover:-translate-y-2 cursor-pointer group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-400/0 to-red-500/0 group-hover:from-orange-400/10 group-hover:to-red-500/10 transition-all duration-300"></div>
                <div className="text-center flex flex-col h-full relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <BookOpen className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-black mb-2 text-gray-900">Flashcard</h3>
                  <p className="text-gray-600 text-sm mb-4 flex-1 font-semibold">Quick memory drill</p>
                  <button onClick={startFlashcardMode} className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl">
                    Start Review
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Command Center - Enhanced */}
          <div data-tutorial="command-center" className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl shadow-2xl p-6 hover:shadow-indigo-500/50 transition-all duration-300 hover:-translate-y-1 cursor-pointer border-2 border-white/20 relative overflow-hidden group" onClick={() => setCurrentView('command-center')}>
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 transform translate-x-full group-hover:translate-x-[-100%] transition-transform duration-1000"></div>
            <div className="flex items-center justify-between gap-4 relative z-10">
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <div className="text-5xl flex-shrink-0 leading-none group-hover:scale-110 transition-transform duration-300">🎯</div>
                <div className="text-white min-w-0 flex-1">
                  <h3 className="text-2xl font-black mb-1">Command Center</h3>
                  <p className="text-base text-white/90 font-semibold">Track progress, manage questions, prep interviews</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-white font-black flex-shrink-0 group-hover:translate-x-1 transition-transform duration-300">
                <span className="hidden md:inline text-lg">Open</span>
                <span className="text-3xl">→</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (currentView === 'prompter') {
    // Check if user is locked out (7+ sessions without customization)
    const status = getCustomizationStatus();
    
    if (status.isLocked) {
      return (
        <div className="min-h-screen bg-gray-900 text-white p-8 flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Target className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Customize to Continue</h2>
            <p className="text-gray-300 mb-6">
              You've used your 7 free sessions! Customize at least 3 questions with 5+ keywords to unlock unlimited access.
            </p>
            
            <div className="bg-gray-800 rounded-xl p-6 mb-6">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-3xl font-bold text-orange-400">{status.customizedQuestions}/3</div>
                  <div className="text-sm text-gray-400">Custom Questions</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-orange-400">{status.questionsWithKeywords}/3</div>
                  <div className="text-sm text-gray-400">With 5+ Keywords</div>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => {
                setCurrentView('commandCenter');
                setCommandCenterTab('bank');
              }}
              className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg"
            >
              Go Customize Now →
            </button>
          </div>
        </div>
      );
    }

    // Check for empty question bank (before defaults load)
    if (!questions || questions.length === 0) {
      return (
        <div className="min-h-screen bg-gray-900 text-white p-8 flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <Database className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Loading Your Questions...</h2>
            <p className="text-gray-300 mb-6">
              Setting up your question bank. This only happens once!
            </p>
            <div className="bg-gray-800 rounded-xl p-6">
              <p className="text-sm text-gray-400">
                If this screen doesn't change in 5 seconds, try refreshing the page.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => { 
              // CRITICAL: Comprehensive cleanup when exiting Live Prompter
              console.log('🚪 Exiting Live Prompter - full cleanup');
              
              // 1. End interview session if active
              if (interviewSessionActive) endInterviewSession();
              
              // 2. Stop system audio
              stopSystemAudioCapture();
              
              // 3. Stop any active listening
              stopListening();
              
              // 4. EXTRA CLEANUP: Force stop recognition if it somehow persists
              if (recognitionRef.current) {
                try {
                  recognitionRef.current.stop();
                  recognitionRef.current.abort?.(); // Try abort if available
                  recognitionRef.current.onend = null;
                  recognitionRef.current.onerror = null;
                  recognitionRef.current.onresult = null;
                } catch (err) {
                  console.log('Recognition already stopped:', err);
                }
              }
              
              // 5. Reset all state
              setCurrentView('home'); 
              setMatchedQuestion(null);
              setIsListening(false);
              setIsCapturing(false);
              setTranscript('');
              setLiveTranscript('');
              accumulatedTranscript.current = '';
              currentInterimRef.current = '';
              
              console.log('✅ Exit complete - all resources released');
            }} className="text-gray-300 hover:text-white">← Exit</button>
            
            {/* SESSION CONTROLS */}
            <div className="flex items-center gap-4">
              {/* System Audio Toggle - for Teams/Zoom calls */}
              {!interviewSessionActive && (
                <button
                  onClick={async () => {
                    if (useSystemAudio) {
                      stopSystemAudioCapture();
                    } else {
                      const success = await startSystemAudioCapture();
                      if (success) setUseSystemAudio(true);
                    }
                  }}
                  className={`px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-all ${
                    useSystemAudio 
                      ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                      : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                  }`}
                  title="Enable to capture audio from Teams/Zoom (speaker output)"
                >
                  <Volume2 className="w-4 h-4" />
                  {useSystemAudio ? 'Tab Audio ON' : 'Tab Audio'}
                </button>
              )}
              
              {!interviewSessionActive ? (
                <button
                  onClick={startInterviewSession}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-all shadow-lg"
                >
                  <Mic className="w-5 h-5" />
                  Start Interview
                </button>
              ) : (
                <>
                  <div className="flex items-center gap-3 bg-green-500/20 px-4 py-2 rounded-lg border-2 border-green-500">
                    <div className={`w-3 h-3 rounded-full ${isCapturing ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></div>
                    <span className="font-bold text-sm">
                      {isCapturing ? '🔴 CAPTURING...' : '🟢 Session Active'}
                    </span>
                  </div>
                  <button
                    onClick={endInterviewSession}
                    className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-all shadow-lg"
                  >
                    <Square className="w-5 h-5" />
                    End Interview
                  </button>
                </>
              )}
            </div>
            
            {matchedQuestion && <button onClick={() => { setMatchedQuestion(null); setTranscript(''); }} className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg">Clear</button>}
          </div>
          {!matchedQuestion ? (
            <div className="text-center py-20">
              <div className="w-32 h-32 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8">
                <Mic className="w-16 h-16 text-white" />
              </div>
              <h2 className="text-4xl font-bold mb-4">Live Interview Prompter</h2>
              
              {!interviewSessionActive ? (
                <>
                  <p className="text-xl text-gray-300 mb-8">Click "Start Interview" to begin session-based mode</p>
                  <div className="mt-12 bg-blue-900/30 rounded-lg p-6 max-w-2xl mx-auto">
                    <h4 className="font-bold mb-3">💡 Session Mode Benefits:</h4>
                    <ul className="text-left text-sm space-y-2">
                      <li>✅ Only 2 sounds (start + end) - no annoying beeps!</li>
                      <li>✅ Hold SPACEBAR to capture questions</li>
                      <li>✅ Your answers NOT recorded</li>
                      <li>✅ Clean separation between questions</li>
                      <li>✅ Works with external keyboard on mobile</li>
                    </ul>
                    <div className="mt-4 pt-4 border-t border-blue-500/30">
                      <h5 className="font-bold mb-2 text-orange-300">🎧 For Teams/Zoom Calls:</h5>
                      <p className="text-sm text-gray-300">Click "Tab Audio" before starting to capture audio from the browser tab where your Teams/Zoom call is running.</p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-xl text-green-300 mb-4">✨ Session Active - Ready to capture questions!</p>
                  <p className="text-lg text-gray-300 mb-8">Hold SPACEBAR when interviewer asks a question</p>
                  
                  {transcript && (
                    <div className="mt-8 bg-gray-800 rounded-lg p-6 max-w-2xl mx-auto">
                      <p className="text-sm text-gray-400 mb-2">
                        {isCapturing ? '🔴 Capturing...' : '✅ Last captured:'}
                      </p>
                      <p className="text-lg">{transcript}</p>
                    </div>
                  )}
                  
                  <div className="mt-12 bg-green-900/30 rounded-lg p-6 max-w-2xl mx-auto border-2 border-green-500/50">
                    <h4 className="font-bold mb-3 text-green-300">🎤 How to Use (Session Mode):</h4>
                    <ol className="text-left text-sm space-y-2">
                      <li>1. Interviewer asks: "Tell me about yourself"</li>
                      <li>2. <strong>Hold SPACEBAR</strong> → Mic captures question</li>
                      <li>3. <strong>Release SPACEBAR</strong> → Question processes, bullets appear!</li>
                      <li>4. Give your answer (mic paused, not recording you)</li>
                      <li>5. Repeat for next question</li>
                    </ol>
                  </div>
                </>
              )}
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
    </div>
 )} 
 
          {/* FLOATING MIC BUTTON - MOVED OUTSIDE matchedQuestion conditional */}
          {/* Now shows in BOTH states: waiting for first question AND after question matched */}
          {interviewSessionActive && (
            <div className="fixed bottom-8 right-8 z-50">
              {/* LIVE TRANSCRIPT BOX - Shows what mic is hearing in real-time */}
              {(isCapturing || liveTranscript) && (
                <div className="absolute bottom-24 right-0 w-80 max-w-[90vw] bg-black/90 backdrop-blur-lg rounded-2xl p-4 shadow-2xl border border-green-500/50 animate-fadeIn">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-3 h-3 rounded-full ${isCapturing ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                      {isCapturing ? '🎤 Listening...' : '✓ Captured'}
                    </span>
                    {matchConfidence > 0 && !isCapturing && (
                      <span className={`ml-auto text-xs font-bold px-2 py-1 rounded ${
                        matchConfidence >= 70 ? 'bg-green-600 text-white' : 
                        matchConfidence >= 40 ? 'bg-yellow-600 text-white' : 
                        'bg-red-600 text-white'
                      }`}>
                        {matchConfidence}% match
                      </span>
                    )}
                  </div>
                  <p className="text-white text-sm leading-relaxed max-h-32 overflow-y-auto">
                    {liveTranscript || 'Speak now...'}
                  </p>
                  {matchDebug && !isCapturing && (
                    <div className="mt-2 pt-2 border-t border-gray-700">
                      <p className="text-xs text-gray-500 font-mono whitespace-pre-line">{matchDebug}</p>
                    </div>
                  )}
                </div>
              )}
              
              <button
                onMouseDown={() => {
                  if (interviewSessionActive) handleSpacebarDown('mouse');
                }}
                onMouseUp={() => {
                  if (interviewSessionActive) handleSpacebarUp('mouse');
                }}
                onMouseLeave={() => {
                  // If user drags mouse off button while holding, release capture
                  if (interviewSessionActive && isCapturing && captureSourceRef.current === 'mouse') {
                    handleSpacebarUp('mouse');
                  }
                }}
                onTouchStart={(e) => {
                  e.preventDefault();
                  if (interviewSessionActive) handleSpacebarDown('touch');
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  if (interviewSessionActive) handleSpacebarUp('touch');
                }}
                className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl ${
                  isCapturing
                    ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                    : 'bg-green-500 hover:bg-green-600'
                }`}
              >
                {isCapturing && (
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
                  Hold to Capture
                </span>
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
            <div className="flex items-center gap-2">
              <button onClick={goToPreviousQuestion} className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg font-semibold flex items-center gap-1">
                ← Prev
              </button>
              <button onClick={goToNextQuestion} className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg font-semibold flex items-center gap-1">
                Next →
              </button>
            </div>
          </div>
          
          <div className="max-w-4xl mx-auto mb-8">
            {/* CLOUD AVATAR CONTAINER */}
            <div ref={aiQuestionRef} className="relative bg-gradient-to-br from-purple-800/50 to-pink-800/50 backdrop-blur-lg rounded-3xl p-12 shadow-2xl">
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
                    {/* Face with enhanced pulse */}
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                      <Brain className={`w-16 h-16 text-white opacity-90 transition-transform duration-300 ${aiSpeaking ? 'scale-110 animate-pulse' : 'scale-100'}`} />
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
                      onClick={() => alert('⭐ Pro Feature\n\nUpgrade to Pro ($29.99/month) for UNLIMITED access!\n\n✓ Unlimited AI Answer Coach sessions\n✓ Unlimited AI Interview practice\n✓ Unlimited Practice Mode\n✓ Everything unlimited - practice as much as you need!')}
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
      
      // Scroll to top so user sees the new question
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
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
    {/* AI DISCLAIMER */}
    <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded p-3 mb-4">
      <p className="text-xs text-yellow-900">
        <span className="font-semibold">🤖 AI-Generated:</span> For practice only. Not professional advice.
      </p>
    </div>
    
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
            existingNarrative={answerAssistantQuestion.narrative}
            existingBullets={answerAssistantQuestion.bullets}
            onAnswerSaved={handleAnswerSaved}
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
            <div className="flex items-center gap-2">
              <button onClick={goToPreviousQuestion} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold flex items-center gap-1">
                ← Prev
              </button>
              <button onClick={goToNextQuestion} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold flex items-center gap-1">
                Next →
              </button>
            </div>
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
                        onClick={() => alert('⭐ Pro Feature\n\nUpgrade to Pro ($29.99/month) for UNLIMITED access!\n\n✓ Unlimited AI Answer Coach sessions\n✓ Unlimited AI Interview practice\n✓ Unlimited Practice Mode\n✓ Everything unlimited - practice as much as you need!')}
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
    {/* AI DISCLAIMER */}
    <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded p-3 mb-4">
      <p className="text-xs text-yellow-900">
        <span className="font-semibold">🤖 AI-Generated:</span> For practice only. Not professional advice.
      </p>
    </div>
    
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
            existingNarrative={answerAssistantQuestion.narrative}
            existingBullets={answerAssistantQuestion.bullets}
            onAnswerSaved={handleAnswerSaved}
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
    // Filter and sort questions for flashcard deck
    let availableQuestions = questions;
    if (filterCategory !== 'All') {
      availableQuestions = availableQuestions.filter(q => q.category === filterCategory);
    }
    const flashcardDeck = [...availableQuestions].sort((a, b) => {
      if (a.practiceCount === 0) return -1;
      if (b.practiceCount === 0) return 1;
      return a.averageScore - b.averageScore;
    });

    // Swipe handlers - Robust threshold
    const handleTouchStart = (e) => {
      setSwipeStart(e.touches[0].clientX);
      setSwipeDistance(0);
    };

    const handleTouchMove = (e) => {
      if (swipeStart === null) return;
      const currentX = e.touches[0].clientX;
      const distance = currentX - swipeStart;
      setSwipeDistance(distance);
    };

    const handleTouchEnd = () => {
      // Robust threshold: 150px to prevent accidental swipes
      if (Math.abs(swipeDistance) > 150) {
        if (swipeDistance > 0) {
          // Swipe right - Previous card
          goToPreviousCard();
        } else {
          // Swipe left - Next card
          goToNextCard();
        }
      }
      setSwipeStart(null);
      setSwipeDistance(0);
    };

    const goToNextCard = () => {
      const nextIndex = (flashcardIndex + 1) % flashcardDeck.length;
      setFlashcardIndex(nextIndex);
      setCurrentQuestion(flashcardDeck[nextIndex]);
      setFlashcardSide('question');
      setShowBullets(false);
      setShowNarrative(false);
      setShowStudyTips(false);
    };

    const goToPreviousCard = () => {
      const prevIndex = flashcardIndex === 0 ? flashcardDeck.length - 1 : flashcardIndex - 1;
      setFlashcardIndex(prevIndex);
      setCurrentQuestion(flashcardDeck[prevIndex]);
      setFlashcardSide('question');
      setShowBullets(false);
      setShowNarrative(false);
      setShowStudyTips(false);
    };

    const flipCard = () => {
      setFlashcardSide(flashcardSide === 'question' ? 'answer' : 'question');
    };

    const startVisualization = () => {
      let countdown = 20;
      setVisualizationTimer(countdown);
      const interval = setInterval(() => {
        countdown--;
        setVisualizationTimer(countdown);
        if (countdown === 0) {
          clearInterval(interval);
          setVisualizationTimer(null);
        }
      }, 1000);
    };

    const saveConfidenceRating = async (rating) => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Save to practice_sessions for this question
        await supabase
          .from('practice_sessions')
          .insert([{
            user_id: user.id,
            question_id: currentQuestion.id,
            mode: 'flashcard',
            confidence_rating: rating,
            score: rating * 2 // Convert 1-5 to 2-10 scale
          }]);

        // Reload questions to update stats
        await loadQuestions();

        // Move to next card after rating
        goToNextCard();
      } catch (error) {
        console.error('Error saving confidence:', error);
      }
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-teal-600">
        <div className="container mx-auto px-4 py-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 text-white">
            <button 
              onClick={() => setCurrentView('home')} 
              className="text-white/90 hover:text-white font-bold text-sm"
            >
              ← Exit
            </button>
            <h1 className="text-xl font-bold">Flashcard Mode</h1>
            <button 
              onClick={goToNextCard}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg font-bold text-sm"
            >
              Next →
            </button>
          </div>

          <div className="max-w-3xl mx-auto">
            {/* Flashcard Container with Desktop Arrows */}
            <div className="relative">
              {/* Left Arrow - Desktop Only */}
              <button
                onClick={goToPreviousCard}
                className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-16 w-12 h-12 bg-white/20 hover:bg-white/30 backdrop-blur rounded-full items-center justify-center text-white text-2xl font-bold transition-all hover:scale-110 z-10"
              >
                ←
              </button>

              {/* Flashcard - Swipeable on Mobile, Clickable to Flip */}
              <div 
                className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 min-h-[400px] flex items-center justify-center cursor-pointer transition-all select-none"
                onClick={flipCard}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                style={{
                  transform: `translateX(${swipeDistance * 0.3}px)`,
                  transition: swipeStart === null ? 'transform 0.3s ease-out' : 'none'
                }}
              >
                {flashcardSide === 'question' ? (
                  <div className="text-center w-full">
                    <h2 className="text-2xl md:text-4xl font-bold text-gray-900 leading-tight">
                      {currentQuestion.question}
                    </h2>
                  </div>
                ) : (
                  <div className="w-full">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Answer:</h3>
                    <ul className="space-y-3 text-left">
                      {currentQuestion.bullets.filter(b => b).map((bullet, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-7 h-7 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                            {idx + 1}
                          </span>
                          <span className="text-base md:text-lg text-gray-800 leading-snug">{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Right Arrow - Desktop Only */}
              <button
                onClick={goToNextCard}
                className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-16 w-12 h-12 bg-white/20 hover:bg-white/30 backdrop-blur rounded-full items-center justify-center text-white text-2xl font-bold transition-all hover:scale-110 z-10"
              >
                →
              </button>
            </div>

            {/* Study Tips - Collapsible */}
            {flashcardSide === 'answer' && (
              <div className="mt-6">
                <button
                  onClick={() => setShowStudyTips(!showStudyTips)}
                  className="w-full bg-white/20 backdrop-blur-lg border-2 border-white/30 rounded-xl p-4 text-white font-bold text-left flex items-center justify-between hover:bg-white/30 transition"
                >
                  <span className="text-base">🧠 Study Tips</span>
                  <span className="text-xl">{showStudyTips ? '▲' : '▼'}</span>
                </button>

                {showStudyTips && (
                  <div className="mt-3 bg-white rounded-xl p-5 shadow-xl space-y-5 animate-slideUp">
                    {/* Visualization Timer */}
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border-2 border-purple-200">
                      <h4 className="font-bold text-purple-900 mb-2 flex items-center gap-2">
                        🎨 Visualization Exercise
                      </h4>
                      <p className="text-sm text-purple-800 mb-3 leading-relaxed">
                        Close your eyes. Picture yourself IN this scenario. Make it vivid—see the people, hear the sounds, feel the pressure.
                      </p>
                      {visualizationTimer === null ? (
                        <button
                          onClick={startVisualization}
                          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition text-sm"
                        >
                          Start 20-Second Visualization
                        </button>
                      ) : (
                        <div className="text-center">
                          <div className="text-4xl font-black text-purple-600 mb-1">{visualizationTimer}s</div>
                          <div className="w-full bg-purple-200 rounded-full h-2">
                            <div 
                              className="bg-purple-600 h-2 rounded-full transition-all duration-1000"
                              style={{ width: `${(20 - visualizationTimer) / 20 * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Blank Recall Reminder */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border-2 border-blue-200">
                      <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                        ✏️ Next Time: Blank Recall
                      </h4>
                      <p className="text-sm text-blue-800 leading-relaxed">
                        Before flipping the card, try to recall the answer from memory. Testing yourself = strongest learning method! (50% better than re-reading)
                      </p>
                    </div>

                    {/* Confidence Rating */}
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border-2 border-green-200">
                      <h4 className="font-bold text-green-900 mb-3 text-center">
                        How well did you know this?
                      </h4>
                      <div className="flex justify-between gap-2 mb-2">
                        {[
                          { emoji: '😰', label: "Don't know", rating: 1 },
                          { emoji: '😐', label: 'Vague', rating: 2 },
                          { emoji: '🙂', label: 'Okay', rating: 3 },
                          { emoji: '😊', label: 'Good', rating: 4 },
                          { emoji: '🎯', label: 'Mastered', rating: 5 }
                        ].map((option) => (
                          <button
                            key={option.rating}
                            onClick={() => saveConfidenceRating(option.rating)}
                            className="flex-1 bg-white hover:bg-green-100 border-2 border-green-300 hover:border-green-500 rounded-lg p-2 transition-all hover:scale-105"
                          >
                            <div className="text-3xl mb-1">{option.emoji}</div>
                            <div className="text-xs font-bold text-gray-700">{option.label}</div>
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-center text-green-800 font-medium mt-2">
                        Rating saved automatically and moves to next card
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Show Bullets/Narrative Buttons */}
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  if (flashcardSide === 'question') {
                    flipCard();
                  }
                  setShowBullets(!showBullets);
                }}
                className="flex-1 bg-white/20 hover:bg-white/30 backdrop-blur text-white font-bold py-3 rounded-xl transition text-sm"
              >
                {showBullets ? '👁️ Hide' : '👁️ Show'} Bullets
              </button>
              {currentQuestion.narrative && (
                <button
                  onClick={() => setShowNarrative(!showNarrative)}
                  className="flex-1 bg-white/20 hover:bg-white/30 backdrop-blur text-white font-bold py-3 rounded-xl transition text-sm"
                >
                  {showNarrative ? '📖 Hide' : '📖 Show'} Narrative
                </button>
              )}
            </div>

            {/* Bullets Overlay */}
            {showBullets && (
              <div className="mt-4 bg-white rounded-xl p-6 shadow-xl">
                <h4 className="text-xl font-bold mb-3 text-gray-900">Key Points:</h4>
                <ul className="space-y-2">
                  {currentQuestion.bullets.filter(b => b).map((bullet, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-xs">
                        {idx + 1}
                      </span>
                      <span className="text-base text-gray-800">{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Narrative */}
            {showNarrative && currentQuestion.narrative && (
              <div className="mt-4 bg-white rounded-xl p-6 shadow-xl">
                <h4 className="text-xl font-bold mb-3 text-gray-900">Full Narrative:</h4>
                <p className="text-base text-gray-800 leading-relaxed whitespace-pre-line">{currentQuestion.narrative}</p>
              </div>
            )}

            {/* Progress */}
            <div className="mt-6 bg-white/10 backdrop-blur rounded-xl p-5 text-white">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Progress:</span>
                <span className="text-xl font-black">{flashcardIndex + 1} / {flashcardDeck.length}</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-3">
                <div 
                  className="bg-white h-3 rounded-full transition-all duration-300"
                  style={{ width: `${((flashcardIndex + 1) / flashcardDeck.length) * 100}%` }}
                ></div>
              </div>
              <p className="text-xs text-white/75 mt-2 text-center font-medium">
                Swipe ← or → to navigate • Tap card to flip
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

// COMMAND CENTER
  if (currentView === 'command-center') {
    return (
      <>
      <div className="min-h-screen bg-gray-50">
        {/* Header - Compact */}
        <div className="bg-white shadow-sm">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <button onClick={() => setCurrentView('home')} className="text-gray-700 hover:text-gray-900 font-medium text-sm">
              ← Back
            </button>
            <h1 className="text-2xl font-bold text-gray-900">🎯 Command Center</h1>
            <div className="w-16"></div>
          </div>
        </div>

        {/* Swipeable Tabs - Sticky */}
        <div className="sticky top-0 bg-white border-b shadow-sm z-40">
          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex gap-2 px-4 py-3 min-w-max">
              <button
                onClick={() => setCommandCenterTab('analytics')}
                className={`px-4 py-2.5 rounded-lg font-bold text-sm transition-all whitespace-nowrap ${
                  commandCenterTab === 'analytics'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                📊 Analytics
              </button>
              <button
                onClick={() => setCommandCenterTab('queue')}
                className={`px-4 py-2.5 rounded-lg font-bold text-sm transition-all whitespace-nowrap ${
                  commandCenterTab === 'queue'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                🎯 Queue
              </button>
              <button
                onClick={() => setCommandCenterTab('prep')}
                className={`px-4 py-2.5 rounded-lg font-bold text-sm transition-all whitespace-nowrap ${
                  commandCenterTab === 'prep'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                🗓️ Prep
              </button>
              <button
                onClick={() => setCommandCenterTab('bank')}
                className={`px-4 py-2.5 rounded-lg font-bold text-sm transition-all whitespace-nowrap ${
                  commandCenterTab === 'bank'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                📚 Bank
              </button>
              <button
                onClick={() => setCommandCenterTab('progress')}
                className={`px-4 py-2.5 rounded-lg font-bold text-sm transition-all whitespace-nowrap ${
                  commandCenterTab === 'progress'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                📈 Progress
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="container mx-auto px-4 py-6">
          {/* ==================== ANALYTICS TAB ==================== */}
          {commandCenterTab === 'analytics' && (
            <div>
              {/* Stats Overview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-5 text-white cursor-pointer hover:scale-105 transition-transform" onClick={() => setCommandCenterTab('progress')}>
                  <p className="text-sm text-white/90 font-medium mb-1">Total Sessions</p>
                  <p className="text-4xl font-black">{practiceHistory.length}</p>
                  <p className="text-xs text-white/75 mt-1">🎯 Keep it up!</p>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-5 text-white cursor-pointer hover:scale-105 transition-transform" onClick={() => setCommandCenterTab('progress')}>
                  <p className="text-sm text-white/90 font-medium mb-1">Average Score</p>
                  <p className="text-4xl font-black">
                    {practiceHistory.length > 0 
                      ? (practiceHistory.reduce((sum, s) => sum + (s.feedback?.overall || 0), 0) / practiceHistory.length).toFixed(1)
                      : '0.0'}
                  </p>
                  <p className="text-xs text-white/75 mt-1">📈 Improving</p>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl p-5 text-white cursor-pointer hover:scale-105 transition-transform" onClick={() => setCommandCenterTab('bank')}>
                  <p className="text-sm text-white/90 font-medium mb-1">Practiced</p>
                  <p className="text-4xl font-black">{questions.filter(q => q.practiceCount > 0).length}</p>
                  <p className="text-xs text-white/75 mt-1">of {questions.length} total</p>
                </div>
                <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl p-5 text-white cursor-pointer hover:scale-105 transition-transform" onClick={() => setCommandCenterTab('prep')}>
                  <p className="text-sm text-white/90 font-medium mb-1">This Month</p>
                  <p className="text-4xl font-black">
                    {practiceHistory.filter(s => {
                      const sessionDate = new Date(s.date);
                      const now = new Date();
                      return sessionDate.getMonth() === now.getMonth() && 
                             sessionDate.getFullYear() === now.getFullYear();
                    }).length}
                  </p>
                  <p className="text-xs text-white/75 mt-1">🔥 On fire!</p>
                </div>
              </div>

              {/* Most Practiced Questions */}
              <div className="bg-white rounded-xl shadow-md p-5 mb-6">
                <h3 className="text-xl font-bold mb-4 text-gray-900">🔥 Most practiced</h3>
                {(() => {
                  // Calculate practice counts and averages from history
                  const questionStats = {};
                  practiceHistory.forEach(session => {
                    if (!questionStats[session.question]) {
                      questionStats[session.question] = {
                        question: session.question,
                        count: 0,
                        scores: []
                      };
                    }
                    questionStats[session.question].count++;
                    const score = session.feedback?.overall || (session.feedback?.match_percentage / 10);
                    if (score) {
                      questionStats[session.question].scores.push(score);
                    }
                  });
                  
                  const topQuestions = Object.values(questionStats)
                    .map(stat => ({
                      ...stat,
                      average: stat.scores.length > 0 
                        ? stat.scores.reduce((a, b) => a + b, 0) / stat.scores.length 
                        : 0
                    }))
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 5);
                  
                  if (topQuestions.length === 0) {
                    return (
                      <div className="text-center py-8">
                        <p className="text-gray-600 text-base mb-2">No practice sessions yet</p>
                        <p className="text-sm text-gray-500">Start practicing to see your progress here!</p>
                      </div>
                    );
                  }
                  
                  return (
                    <div className="space-y-3">
                      {topQuestions.map((stat, idx) => (
                        <div key={idx} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                          <div className="text-2xl font-black text-indigo-600">#{idx + 1}</div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-gray-900 text-base truncate">{stat.question}</p>
                            <p className="text-sm text-gray-600 font-medium">
                              Practiced {stat.count}x • Avg: {stat.average.toFixed(1)}/10
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>

              {/* Practice History */}
              <div className="bg-white rounded-xl shadow-md p-5">
                <h3 className="text-xl font-bold mb-4 text-gray-900">📜 Recent Practice Sessions</h3>
                {practiceHistory.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600 text-base mb-2">No practice sessions yet</p>
                    <p className="text-sm text-gray-500">Your practice history will appear here!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {practiceHistory.slice().reverse().map((session, idx) => (
                      <div key={idx} className="border-l-4 border-indigo-500 bg-gray-50 rounded-r-lg p-4 hover:shadow-md transition">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-gray-900 mb-2 text-base">{session.question}</h4>
                            <p className="text-sm text-gray-700 mb-3 line-clamp-2 font-medium">{session.answer}</p>
                            <div className="flex items-center gap-4 text-xs text-gray-600 font-medium">
                              <span>📅 {new Date(session.date).toLocaleDateString()}</span>
                              <span>🕐 {new Date(session.date).toLocaleTimeString()}</span>
                            </div>
                          </div>
                          <div className="flex-shrink-0 text-center bg-white rounded-lg p-3 shadow-sm">
                            <div className="text-3xl font-black text-indigo-600">
                              {session.feedback?.overall?.toFixed(1) || (session.feedback?.match_percentage ? (session.feedback.match_percentage / 10).toFixed(1) : 'N/A')}
                            </div>
                            <div className="text-xs text-gray-600 font-bold">score</div>
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
              <div className="bg-white rounded-xl shadow-md p-5 mb-6">
                <h3 className="text-xl font-bold mb-4 text-red-600">🎯 Let's Strengthen These {questions.filter(q => q.practiceCount === 0).length} Questions!</h3>
                {questions.filter(q => q.practiceCount === 0).length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-2xl mb-2">🎉</p>
                    <p className="text-gray-800 text-base font-bold mb-1">Amazing work!</p>
                    <p className="text-sm text-gray-600">You've practiced all questions at least once.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {questions
                      .filter(q => q.practiceCount === 0)
                      .sort((a, b) => {
                        const priorityOrder = { 'Must-Know': 0, 'Technical': 1, 'Standard': 2, 'Optional': 3 };
                        return priorityOrder[a.priority] - priorityOrder[b.priority];
                      })
                      .map(q => (
                        <div key={q.id} className="flex items-center justify-between p-4 bg-red-50 border-2 border-red-200 rounded-lg hover:border-red-300 transition">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                                q.priority === 'Must-Know' ? 'bg-red-600 text-white' : 
                                q.priority === 'Technical' ? 'bg-yellow-500 text-white' : 
                                'bg-gray-500 text-white'
                              }`}>{q.priority}</span>
                              <span className="text-sm text-gray-700 font-medium">{q.category}</span>
                            </div>
                            <p className="font-bold text-gray-900 text-base">{q.question}</p>
                          </div>
                          <button 
                            onClick={async () => {
                              const canUse = await checkAndIncrementUsage('practiceMode', 'Practice Mode');
                              if (!canUse) return;
                              
                              accumulatedTranscript.current = '';
                              setCurrentQuestion(q);
                              setCurrentMode('practice');
                              setCurrentView('practice');
                              setUserAnswer('');
                              setSpokenAnswer('');
                              setFeedback(null);
                            }}
                            className="ml-4 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition text-sm flex-shrink-0"
                          >
                            Practice Now
                          </button>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* Needs Improvement */}
              <div className="bg-white rounded-xl shadow-md p-5">
                <h3 className="text-xl font-bold mb-4 text-amber-600">📈 Almost There - Keep Going!</h3>
                {questions.filter(q => q.practiceCount > 0 && q.averageScore < 7).length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-2xl mb-2">⭐</p>
                    <p className="text-gray-800 text-base font-bold mb-1">You're crushing it!</p>
                    <p className="text-sm text-gray-600">All practiced questions scored 7+ average!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {questions
                      .filter(q => q.practiceCount > 0 && q.averageScore < 7)
                      .sort((a, b) => a.averageScore - b.averageScore)
                      .map(q => (
                        <div key={q.id} className="flex items-center justify-between p-4 bg-amber-50 border-2 border-amber-200 rounded-lg hover:border-amber-300 transition">
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-gray-900 mb-2 text-base">{q.question}</p>
                            <p className="text-sm text-gray-700 font-medium">Practiced {q.practiceCount}x • Avg: {q.averageScore.toFixed(1)}/10 • You've got this!</p>
                          </div>
                          <button 
                            onClick={async () => {
                              const canUse = await checkAndIncrementUsage('practiceMode', 'Practice Mode');
                              if (!canUse) return;
                              
                              accumulatedTranscript.current = '';
                              setCurrentQuestion(q);
                              setCurrentMode('practice');
                              setCurrentView('practice');
                              setUserAnswer('');
                              setSpokenAnswer('');
                              setFeedback(null);
                            }}
                            className="ml-4 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition text-sm flex-shrink-0"
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
              <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl p-6 text-white mb-6">
                <h3 className="text-2xl font-bold mb-4">🗓️ {interviewDate ? `${(() => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const interview = new Date(interviewDate);
                  interview.setHours(0, 0, 0, 0);
                  const diffTime = interview.getTime() - today.getTime();
                  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24)); // FIXED: Math.ceil → Math.round for accurate day count
                  return Math.max(0, diffDays);
                })()} Days to Shine!` : 'Set Your Interview Date'}</h3>
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-4">
                  <div className="flex-1 w-full">
                    <label className="block text-sm text-white/90 font-medium mb-2">Interview Date:</label>
                    <input 
                      type="date"
                      value={interviewDate}
                      onChange={(e) => {
                        setInterviewDate(e.target.value);
                        localStorage.setItem('isl_interview_date', e.target.value);
                      }}
                      className="w-full px-4 py-3 rounded-lg text-gray-900 font-bold text-base"
                    />
                  </div>
                  {interviewDate && (
                    <div className="text-center bg-white/20 backdrop-blur rounded-xl p-5 min-w-[140px]">
                      <div className="text-5xl font-black mb-1">
                        {Math.max(0, Math.ceil((new Date(interviewDate).setHours(0,0,0,0) - new Date().setHours(0,0,0,0)) / (1000 * 60 * 60 * 24)))}
                      </div>
                      <div className="text-sm text-white/90 font-bold">days left!</div>
                      <div className="text-xs text-white/75 mt-1">⭐ You've got this!</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Daily Goal */}
              <div className="bg-white rounded-xl shadow-md p-5 mb-6">
                <h3 className="text-xl font-bold mb-4 text-gray-900">🎯 Daily Practice Goal</h3>
                <div className="flex items-center gap-4 mb-4">
                  <label className="text-gray-800 font-bold text-base">Sessions per day:</label>
                  <input 
                    type="number"
                    min="1"
                    max="20"
                    value={dailyGoal}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (!isNaN(value) && value > 0) {
                        setDailyGoal(value);
                        localStorage.setItem('isl_daily_goal', e.target.value);
                      }
                    }}
                    className="w-20 px-4 py-2 border-2 rounded-lg text-center font-bold text-base"
                  />
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-gray-800">Today's Progress:</span>
                    <span className="text-xl font-black text-indigo-600">
                      {practiceHistory.filter(s => new Date(s.date).toDateString() === new Date().toDateString()).length} / {dailyGoal}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div 
                      className="bg-gradient-to-r from-indigo-500 to-purple-500 h-4 rounded-full transition-all flex items-center justify-end pr-2"
                      style={{ 
                        width: `${Math.min(100, (practiceHistory.filter(s => new Date(s.date).toDateString() === new Date().toDateString()).length / dailyGoal) * 100)}%`
                      }}
                    >
                      {practiceHistory.filter(s => new Date(s.date).toDateString() === new Date().toDateString()).length >= dailyGoal && (
                        <span className="text-white text-xs font-bold">🎉 Goal reached!</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Category Coverage */}
              <div className="bg-white rounded-xl shadow-md p-5">
                <h3 className="text-xl font-bold mb-4 text-gray-900">📚 Category Mastery</h3>
                <div className="space-y-4">
                  {['Core Narrative', 'System-Level', 'Behavioral', 'Technical'].map(category => {
                    const categoryQuestions = questions.filter(q => q.category === category);
                    const total = categoryQuestions.length;
                    
                    // Calculate how many questions in this category have been practiced
                    const practicedQuestionTexts = new Set(
                      practiceHistory.map(s => s.question)
                    );
                    const practiced = categoryQuestions.filter(q => 
                      practicedQuestionTexts.has(q.question)
                    ).length;
                    
                    const percentage = total > 0 ? (practiced / total) * 100 : 0;
                    
                    return (
                      <div key={category} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-gray-900 text-base">{category}</span>
                          <span className="text-sm text-gray-700 font-bold">{practiced} / {total} practiced</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div 
                            className={`h-3 rounded-full transition-all ${
                              percentage === 100 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                              percentage >= 50 ? 'bg-gradient-to-r from-blue-500 to-indigo-500' :
                              'bg-gradient-to-r from-yellow-500 to-orange-500'
                            }`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        {percentage === 100 && (
                          <p className="text-xs text-green-600 font-bold mt-1">✓ Mastered!</p>
                        )}
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
          <div className="overflow-x-auto pb-4">
            <div className="relative min-w-[800px]" style={{ height: '400px' }}>
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
                      <g key={idx} style={{ cursor: 'pointer' }} onClick={() => {
                        setSelectedSession(session);
                      }}>
                        <circle 
                          cx={x} 
                          cy={y} 
                          r="10" 
                          fill="#6366f1" 
                          stroke="white" 
                          strokeWidth="3" 
                          className="hover:opacity-80 transition-opacity" 
                        />
                      </g>
                    );
                  });
                })()}
                
                <text x="450" y="340" fontSize="14" fill="#6b7280" textAnchor="middle" fontWeight="600">Practice Sessions (click dots for details)</text>
                <text x="20" y="180" fontSize="14" fill="#6b7280" textAnchor="middle" transform="rotate(-90, 20, 180)" fontWeight="600">Score</text>
              </svg>
            </div>
            <p className="text-xs text-gray-500 text-center mt-2">💡 Scroll horizontally to see all data points</p>
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
          <>
            {/* Show count and toggle */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-gray-600">
                Showing {questionArray.length} question{questionArray.length !== 1 ? 's' : ''}
              </p>
            </div>
            
            {/* Scrollable container with max height - Smooth scroll */}
            <div className="space-y-6 max-h-[500px] md:max-h-[600px] overflow-y-auto pr-2 border-t-2 border-b-2 border-gray-100 py-4 scroll-smooth">
            {questionArray.sort((a, b) => b.sessions.length - a.sessions.length).map((qStat, idx) => {
              const getScore = (s) => s.feedback?.overall || (s.feedback?.match_percentage / 10);
              const scores = qStat.sessions.map(getScore);
              const trend = scores.length > 1 ? scores[scores.length - 1] - scores[0] : 0;
              const average = scores.reduce((a, b) => a + b, 0) / scores.length;
              
              return (
                <div key={idx} className="border-2 rounded-xl p-4 md:p-6 hover:border-indigo-300 transition">
                  <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-6 mb-4">
                    {/* Left: Question Info */}
                    <div className="flex-1">
                      <h4 className="font-bold text-base md:text-lg mb-2">{qStat.question}</h4>
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
                    
                    {/* Middle: Sparkline Chart - Full width on mobile */}
                    <div className="flex flex-col items-center w-full md:w-auto overflow-x-auto">
                      <div className="min-w-[280px] w-full max-w-[400px]">
                        <svg width="100%" height="100" viewBox="0 0 280 100" className="mb-2" preserveAspectRatio="xMidYMid meet">
                          {/* Grid lines */}
                          {[0, 5, 10].map(score => (
                            <line 
                              key={score}
                              x1="0" 
                              y1={90 - (score * 8)} 
                              x2="280" 
                              y2={90 - (score * 8)} 
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
                                const x = 20 + (sIdx / Math.max(1, qStat.sessions.length - 1)) * 240;
                                const y = 90 - (score * 8);
                                return `${x},${y}`;
                              }).join(' ')}
                              fill="none"
                              stroke="#6366f1"
                              strokeWidth="3"
                              strokeLinecap="round"
                            />
                          )}
                          
                          {/* Clickable dots - iOS Safari Compatible */}
                          {qStat.sessions.map((s, sIdx) => {
                            const score = getScore(s);
                            const x = 20 + (sIdx / Math.max(1, qStat.sessions.length - 1)) * 240;
                            const y = 90 - (score * 8);
                            return (
                              <g 
                                key={sIdx}
                                style={{ cursor: 'pointer' }}
                                onClick={() => {
                                  setSelectedChartPoint({ 
                                    session: s, 
                                    score, 
                                    idx: sIdx + 1, 
                                    total: qStat.sessions.length,
                                    question: qStat.question 
                                  });
                                  setShowChartModal(true);
                                }}
                              >
                                {/* Larger invisible hit target for touch */}
                                <circle
                                  cx={x}
                                  cy={y}
                                  r="16"
                                  fill="transparent"
                                  style={{ pointerEvents: 'all' }}
                                />
                                {/* Visible dot */}
                                <circle
                                  cx={x}
                                  cy={y}
                                  r="8"
                                  fill="#6366f1"
                                  stroke="white"
                                  strokeWidth="3"
                                  className="hover:scale-125 transition-transform duration-200"
                                  style={{ 
                                    willChange: 'transform',
                                    pointerEvents: 'none' 
                                  }}
                                >
                                  <title>Attempt {sIdx + 1}: {score.toFixed(1)}/10</title>
                                </circle>
                              </g>
                            );
                          })}
                        </svg>
                      </div>
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
                      📋 View {qStat.sessions.length} attempts →
                    </summary>
                    <div className="mt-4 space-y-2">
                      {qStat.sessions.slice().reverse().map((session, sIdx) => {
                        const score = getScore(session);
                        const attemptNum = qStat.sessions.length - sIdx;
                        return (
                          <div 
                            key={sIdx}
                            className="flex justify-between bg-gray-50 p-4 rounded-lg cursor-pointer hover:bg-indigo-50 transition"
                            onClick={() => {
                              setSelectedChartPoint({ 
                                session, 
                                score, 
                                idx: attemptNum, 
                                total: qStat.sessions.length,
                                question: qStat.question 
                              });
                              setShowChartModal(true);
                            }}
                          >
                            <span className="text-sm font-semibold text-gray-700">
                              Attempt {attemptNum} • {new Date(session.date).toLocaleDateString()} at {new Date(session.date).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
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
          </>
        );
      })()}
    </div>
  </div>
)}

{/* ==================== QUESTION BANK TAB ==================== */}
{commandCenterTab === 'bank' && (
            <div>
              {/* AI Question Generator - Free: 5/month, Pro: Unlimited */}
              <div className="mb-6">
                <button
                  onClick={() => setAiGeneratorCollapsed(!aiGeneratorCollapsed)}
                  className="w-full bg-gradient-to-br from-purple-50 via-indigo-50 to-pink-50 rounded-xl p-4 border-2 border-purple-300 hover:border-purple-400 transition flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">✨</div>
                    <div className="text-left">
                      <h3 className="text-lg font-bold text-gray-900">AI Question Generator</h3>
                      <p className="text-sm text-gray-600">Generate personalized interview questions</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {usageStatsData?.questionGen?.unlimited && (
                      <span className="px-3 py-1 bg-purple-600 text-white text-xs font-bold rounded-full">UNLIMITED</span>
                    )}
                    {!usageStatsData?.questionGen?.unlimited && usageStatsData?.questionGen && (
                      <span className="px-3 py-1 bg-gray-200 text-gray-700 text-xs font-bold rounded-full">
                        {usageStatsData.questionGen.remaining}/{usageStatsData.questionGen.limit}
                      </span>
                    )}
                    {aiGeneratorCollapsed ? (
                      <ChevronRight className="w-6 h-6 text-gray-600" />
                    ) : (
                      <ChevronDown className="w-6 h-6 text-gray-600" />
                    )}
                  </div>
                </button>
                
                {!aiGeneratorCollapsed && (
                  <div className="mt-4 p-6 bg-white rounded-xl border-2 border-purple-200">
                    {(usageStatsData?.questionGen?.unlimited || usageStatsData?.questionGen?.remaining > 0) ? (
                      <QuestionAssistant
                        onQuestionGenerated={async (generatedQuestion) => {
                          // Increment usage first
                          if (!usageStatsData?.questionGen?.unlimited) {
                            const canUse = await checkAndIncrementUsage('questionGen', 'Question Generator');
                            if (!canUse) {
                              console.log('❌ Out of Question Generator credits');
                              return;
                            }
                          }
                          
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
                                setQuestions([...questions, data]);
                                alert('✅ Question added to bank!');
                                setAiGeneratorCollapsed(true); // Collapse after adding
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
                      <div className="text-center py-8">
                        <div className="mb-6">
                          <div className="text-5xl mb-3">🚫</div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">
                            You've used all 5 free Question Generations this month!
                          </h3>
                          <p className="text-gray-600 mb-4 max-w-md mx-auto">
                            Upgrade to Pro for unlimited AI-powered question generation
                          </p>
                        </div>
                        <div className="bg-indigo-50 rounded-lg p-4 mb-6 max-w-sm mx-auto">
                          <p className="text-sm font-semibold text-indigo-900 mb-2">💎 Pro Benefits:</p>
                          <ul className="text-sm text-left text-indigo-800 space-y-1">
                            <li>✨ <strong>UNLIMITED</strong> Question Generator</li>
                            <li>✨ <strong>UNLIMITED</strong> AI Interviewer</li>
                            <li>✨ <strong>UNLIMITED</strong> Practice Mode</li>
                            <li>✨ <strong>UNLIMITED</strong> Answer Assistant</li>
                            <li>✨ <strong>UNLIMITED</strong> Live Prompter</li>
                          </ul>
                        </div>
                        <button
                          onClick={() => setShowPricingPage(true)}
                          className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-10 py-4 rounded-lg font-bold text-lg hover:from-purple-700 hover:to-indigo-700 shadow-lg transform hover:scale-105 transition"
                        >
                          Upgrade to Pro - $29.99/month
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between mb-6">
                <button onClick={() => setEditingQuestion({ question: '', keywords: [], category: 'Core Narrative', priority: 'Must-Know', bullets: [''], narrative: '', followups: [] })} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-lg flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Add Question
                </button>
                
                {questions.length > 0 && (
                  <button 
                    onClick={() => setShowDeleteAllConfirm(true)} 
                    className="bg-red-100 hover:bg-red-200 text-red-700 font-bold px-6 py-3 rounded-lg flex items-center gap-2 border-2 border-red-300"
                  >
                    <Trash2 className="w-5 h-5" />
                    Delete All ({questions.length})
                  </button>
                )}
              </div>
              
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
                    onOpenAICoach={handleOpenAICoachFromTemplate}
                    checkUsageLimit={checkAIUsageLimit}
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
                      <div className="flex flex-col gap-2">
                        <button 
                          onClick={() => setEditingQuestion(q)} 
                          className="px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition font-medium text-sm flex items-center justify-center gap-1"
                        >
                          <Edit2 className="w-4 h-4" />
                          <span>Edit</span>
                        </button>
                        
                        {/* AI ANSWER COACH BUTTON */}
                        <button
                          onClick={async () => {
                            // Check AI usage limit
                            const canUse = await checkAIUsageLimit();
                            if (!canUse) return;
                            
                            // Increment usage
                            incrementAIUsage();
                            
                            // Open AI Answer Coach
                            setAnswerAssistantQuestion(q);
                            setShowAnswerAssistant(true);
                          }}
                          className="px-3 py-2 bg-gradient-to-r from-purple-100 to-indigo-100 hover:from-purple-200 hover:to-indigo-200 text-purple-700 rounded-lg transition font-bold text-sm flex items-center justify-center gap-1"
                        >
                          <Sparkles className="w-4 h-4" />
                          <span>AI Coach</span>
                        </button>
                        
                        <button 
                          onClick={() => {
                            if (confirm('Delete this question?')) {
                              deleteQuestion(q.id);
                            }
                          }} 
                          className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition font-medium text-sm flex items-center justify-center gap-1"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Delete</span>
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
      
      {/* Chart Detail Modal - Using Component */}
      <SessionDetailsModal 
        selectedChartPoint={selectedChartPoint}
        showChartModal={showChartModal}
        onClose={() => setShowChartModal(false)}
      />
      
      
      {/* Answer Assistant Modal */}
      {showAnswerAssistant && answerAssistantQuestion && (
        <AnswerAssistant
          question={answerAssistantQuestion.question}
          questionId={answerAssistantQuestion.id}
          userContext={getUserContext()}
          userTier={usageStats?.tier}
          existingNarrative={answerAssistantQuestion.narrative}
          existingBullets={answerAssistantQuestion.bullets}
          onAnswerSaved={handleAnswerSaved}
          onClose={() => {
            setShowAnswerAssistant(false);
            setAnswerAssistantQuestion(null);
          }}
        />
      )}
      </>
    );
  }
  // SETTINGS
  if (currentView === 'settings') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-4">
            <button onClick={() => setCurrentView('home')} className="text-gray-600 hover:text-gray-900 text-sm">
              ← Back to Home
            </button>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-6">Settings</h1>

          <div className="bg-white rounded-xl shadow-sm p-5 mb-4">
            <h2 className="text-lg font-semibold mb-3 text-gray-800">App Information</h2>
            <div className="flex justify-between py-2">
              <span className="text-gray-600 text-sm">Version</span>
              <span className="font-medium text-gray-900 text-sm">1.0.0</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5 mb-4">
            <h2 className="text-lg font-semibold mb-3 text-gray-800">Legal</h2>
            
            <button
              onClick={() => setCurrentView('privacy')}
              className="w-full flex justify-between items-center py-3 px-3 bg-gray-50 hover:bg-gray-100 rounded-lg mb-2 text-sm"
            >
              <span className="font-medium text-gray-700">Privacy Policy</span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>
            
            <button
              onClick={() => setCurrentView('terms')}
              className="w-full flex justify-between items-center py-3 px-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm"
            >
              <span className="font-medium text-gray-700">Terms of Service</span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5 mb-4">
            <h2 className="text-lg font-semibold mb-3 text-gray-800">Data Management</h2>
            
            <button
              onClick={async () => {
                if (window.confirm('⚠️ DELETE ALL DATA?\n\nThis will PERMANENTLY delete:\n• All practice sessions\n• All questions\n• All progress\n\nThis CANNOT be undone.\n\nClick OK to continue.')) {
                  if (window.confirm('🛑 FINAL CONFIRMATION\n\nYou are about to DELETE EVERYTHING.\n\nThis is PERMANENT.\n\nClick OK to DELETE ALL DATA NOW.')) {
                    try {
                      const { data: { user } } = await supabase.auth.getUser();
                      if (user) {
                        // Delete ALL user data from Supabase
                        await supabase.from('practice_sessions').delete().eq('user_id', user.id);
                        await supabase.from('questions').delete().eq('user_id', user.id); // ← CRITICAL: Delete questions table
                        await supabase.from('question_banks').delete().eq('user_id', user.id);
                        await supabase.from('usage_tracking').delete().eq('user_id', user.id);
                        await supabase.from('user_profiles').delete().eq('user_id', user.id); // Also delete profile
                      }
                      
                      // Clear ALL localStorage (including consent so user starts fresh)
                      localStorage.clear();
                      
                      alert('✅ All data deleted. You will be signed out.');
                      
                      // Sign out user completely
                      await supabase.auth.signOut();
                      
                      // Reload to login screen
                      window.location.reload();
                    } catch (error) {
                      console.error('Delete error:', error);
                      alert('❌ Error deleting data: ' + error.message);
                    }
                  }
                }
              }}
              className="w-full bg-red-50 hover:bg-red-100 border-2 border-red-400 text-red-700 font-bold py-3 px-4 rounded-lg text-sm"
            >
              🗑️ Delete All My Data
            </button>
            
            <p className="text-xs text-gray-500 mt-2">
              Permanently deletes everything. <strong>Cannot be undone.</strong>
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5">
            <h2 className="text-lg font-semibold mb-3 text-gray-800">Support</h2>
            <p className="text-gray-600 mb-2 text-sm">Questions or feedback?</p>
            <a 
              href="mailto:support@interviewanswers.ai" 
              className="text-indigo-600 hover:text-indigo-700 font-medium text-sm"
            >
              support@interviewanswers.ai
            </a>
          </div>
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
            <p className="text-sm text-gray-600 mb-6">Last updated: January 12, 2026</p>
            
            <p className="mb-6 text-gray-700 leading-relaxed">
              InterviewAnswers.ai is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and protect your personal information.
            </p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">Information We Collect</h2>
            <p className="mb-4 text-gray-700">We collect the following information:</p>
            <ul className="list-disc pl-6 mb-6 space-y-2 text-gray-700">
              <li>Email address for account creation and authentication</li>
              <li>Audio recordings of your practice interview responses</li>
              <li>Text transcriptions generated from your audio responses</li>
              <li>Practice session history, scores, and progress metrics</li>
              <li>Question banks and custom questions you create</li>
              <li>Usage data and analytics to improve our services</li>
            </ul>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">How We Use Your Information</h2>
            <ul className="list-disc pl-6 mb-6 space-y-2 text-gray-700">
              <li>Authenticate your account and enable access across devices</li>
              <li>Generate AI-powered feedback on your interview responses</li>
              <li>Track your progress and improvement over time</li>
              <li>Improve our AI models and service features</li>
              <li>Send service-related communications and product updates</li>
              <li>Provide customer support when requested</li>
            </ul>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">Data Storage and Security</h2>
            <p className="mb-4 text-gray-700">
              We use Supabase as our database provider to store your account information and practice data. 
              Audio recordings are stored locally on your device. All data transmitted between your device 
              and our servers is encrypted using industry-standard HTTPS/TLS protocols. Data at rest is 
              encrypted using AES-256 encryption.
            </p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">Third-Party Services</h2>
            <p className="mb-4 text-gray-700">We use the following third-party services:</p>
            <ul className="list-disc pl-6 mb-6 space-y-2 text-gray-700">
              <li><strong>Supabase:</strong> Database and authentication services</li>
              <li><strong>OpenAI:</strong> AI-powered feedback generation</li>
              <li><strong>Web Speech API:</strong> Browser-based speech recognition (no data sent to external servers)</li>
            </ul>
            <p className="mb-6 text-gray-700">
              We do not sell, rent, or share your personal information with third parties for their marketing purposes.
            </p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">Microphone Access and Recording</h2>
            <p className="mb-4 text-gray-700">
              InterviewAnswers.ai requests microphone access to record your practice interview responses. You have complete 
              control over when recording occurs. Audio is used solely to generate transcriptions and provide 
              feedback. We do not monitor, listen to, or store your recordings on external servers without 
              your explicit consent.
            </p>
            
            <h3 className="text-xl font-semibold mt-6 mb-3">Recording Consent and Legal Compliance</h3>
            <p className="mb-4 text-gray-700">
              <strong>Important:</strong> If you use InterviewAnswers.ai's Live Prompter feature during actual interviews with other people, 
              you are solely responsible for obtaining consent from all parties being recorded and complying with 
              applicable recording laws. Many jurisdictions require all-party consent before recording conversations.
            </p>
            <p className="mb-4 text-gray-700">
              States requiring all-party consent include: California, Connecticut, Florida, Illinois, Maryland, 
              Massachusetts, Michigan, Montana, Nevada, New Hampshire, Pennsylvania, and Washington. This list 
              is not exhaustive. You should consult local laws and obtain appropriate consent before recording 
              any conversation.
            </p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">Your Rights and Data Control</h2>
            <p className="mb-4 text-gray-700">You have the following rights regarding your data:</p>
            <ul className="list-disc pl-6 mb-6 space-y-2 text-gray-700">
              <li><strong>Access:</strong> You can view all your data within the app</li>
              <li><strong>Deletion:</strong> You can delete all your data at any time from Settings</li>
              <li><strong>Export:</strong> You can request a copy of your data by contacting us</li>
              <li><strong>Correction:</strong> You can update or correct your information within the app</li>
              <li><strong>Opt-out:</strong> You can opt-out of non-essential communications</li>
            </ul>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">California Privacy Rights (CCPA)</h2>
            <p className="mb-4 text-gray-700">
              If you are a California resident, you have additional rights under the California Consumer Privacy Act:
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-2 text-gray-700">
              <li>Right to know what personal information we collect and how we use it</li>
              <li>Right to delete your personal information</li>
              <li>Right to opt-out of the sale of personal information (we do not sell your data)</li>
              <li>Right to non-discrimination for exercising your privacy rights</li>
            </ul>
            <p className="mb-6 text-gray-700">
              To exercise these rights, use the Delete Data function in Settings or contact us at YOUR_EMAIL@example.com
            </p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">Data Retention</h2>
            <p className="mb-6 text-gray-700">
              We retain your personal information for as long as your account is active or as needed to provide 
              services. You may delete your account and all associated data at any time from the Settings page. 
              After deletion, your data will be permanently removed from our systems within 30 days, except where 
              we are required to retain it for legal compliance.
            </p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">Children's Privacy</h2>
            <p className="mb-6 text-gray-700">
              InterviewAnswers.ai is not intended for children under the age of 13. We do not knowingly collect personal 
              information from children under 13. If you believe we have collected information from a child 
              under 13, please contact us immediately and we will delete such information.
            </p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">Changes to This Policy</h2>
            <p className="mb-6 text-gray-700">
              We may update this Privacy Policy from time to time. We will notify you of any material changes 
              by posting the new Privacy Policy on this page and updating the "Last updated" date. Your continued 
              use of InterviewAnswers.ai after such changes constitutes acceptance of the updated policy.
            </p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">Contact Us</h2>
            <p className="mb-4 text-gray-700">
              If you have questions about this Privacy Policy or wish to exercise your privacy rights, please contact us:
            </p>
            <p className="mb-2 text-gray-700">Email: YOUR_EMAIL@example.com</p>
            <p className="text-sm text-gray-500 italic">Please replace with your actual email address</p>
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
            <p className="text-sm text-gray-600 mb-6">Last updated: January 12, 2026</p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">1. Acceptance of Terms</h2>
            <p className="mb-6 text-gray-700">
              By accessing or using InterviewAnswers.ai, you agree to be bound by these Terms of Service 
              and all applicable laws and regulations. If you do not agree with these terms, you may not use InterviewAnswers.ai.
            </p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">2. License to Use</h2>
            <p className="mb-6 text-gray-700">
              We grant you a limited, non-exclusive, non-transferable, revocable license to access and use InterviewAnswers.ai 
              for personal interview practice and preparation. You may not use InterviewAnswers.ai for any commercial purpose 
              without our prior written consent.
            </p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">3. AI-Generated Content</h2>
            <p className="mb-4 text-gray-700">
              InterviewAnswers.ai uses artificial intelligence to generate interview feedback and suggestions. You acknowledge and agree that:
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-2 text-gray-700">
              <li>AI-generated feedback may contain errors, inaccuracies, or biases</li>
              <li>Feedback is provided for educational and practice purposes only</li>
              <li>AI feedback does not constitute professional career counseling or advice</li>
              <li>You should exercise your own judgment and seek professional guidance for important career decisions</li>
              <li>We make no guarantees regarding interview success, job offers, or career outcomes</li>
            </ul>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">4. Recording Consent and Legal Compliance</h2>
            <p className="mb-4 text-gray-700 font-semibold">
              User Responsibility for Recording Consent:
            </p>
            <p className="mb-4 text-gray-700">
              If you use InterviewAnswers.ai's Live Prompter feature or any recording functionality during actual interviews 
              or conversations with other people, you are solely responsible for:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700">
              <li>Obtaining explicit consent from all parties before recording</li>
              <li>Complying with all applicable federal, state, and local recording laws</li>
              <li>Informing all parties that you are using assistance technology</li>
              <li>Verifying that such use is permitted by the organization conducting the interview</li>
            </ul>
            <p className="mb-6 text-gray-700">
              Many jurisdictions require all-party consent before recording conversations. States with all-party 
              consent laws include California, Connecticut, Florida, Illinois, Maryland, Massachusetts, Michigan, 
              Montana, Nevada, New Hampshire, Pennsylvania, and Washington. This list is not exhaustive. Recording 
              without proper consent may result in criminal penalties, civil liability, and disqualification from 
              employment consideration. You agree to indemnify and hold InterviewAnswers.ai harmless from any claims arising from 
              your failure to obtain proper recording consent.
            </p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">5. Acceptable Use Policy</h2>
            <p className="mb-4 text-gray-700">You agree not to:</p>
            <ul className="list-disc pl-6 mb-6 space-y-2 text-gray-700">
              <li>Record conversations without obtaining legally required consent from all parties</li>
              <li>Use InterviewAnswers.ai for any unlawful purpose or in violation of any applicable laws</li>
              <li>Upload, transmit, or share illegal, harmful, threatening, or offensive content</li>
              <li>Attempt to gain unauthorized access to InterviewAnswers.ai's systems or other users' accounts</li>
              <li>Reverse engineer, decompile, or disassemble any part of InterviewAnswers.ai</li>
              <li>Use automated systems to access or interact with InterviewAnswers.ai without authorization</li>
              <li>Interfere with or disrupt the operation of InterviewAnswers.ai or its servers</li>
              <li>Impersonate any person or entity or misrepresent your affiliation</li>
            </ul>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">6. Limitation of Liability</h2>
            <p className="mb-4 text-gray-700 font-semibold">
              Maximum Liability Cap:
            </p>
            <p className="mb-6 text-gray-700">
              To the maximum extent permitted by law, InterviewAnswers.ai's total liability for all claims related to the service 
              shall not exceed the lesser of (a) the amount you paid to InterviewAnswers.ai in the twelve months preceding the 
              claim, or (b) one hundred dollars ($100 USD).
            </p>
            <p className="mb-4 text-gray-700 font-semibold">
              Exclusion of Damages:
            </p>
            <p className="mb-6 text-gray-700">
              InterviewAnswers.ai shall not be liable for any indirect, incidental, special, consequential, or punitive damages, 
              including but not limited to loss of profits, data, business opportunities, or goodwill, whether based 
              on contract, tort, negligence, strict liability, or otherwise, arising from your use of InterviewAnswers.ai, reliance 
              on AI-generated feedback, or violation of recording consent laws, even if InterviewAnswers.ai has been advised of the 
              possibility of such damages.
            </p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">7. Disclaimer of Warranties</h2>
            <p className="mb-6 text-gray-700">
              INTERVIEWANSWERS.AI IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, 
              INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, 
              OR NON-INFRINGEMENT. We do not warrant that InterviewAnswers.ai will be uninterrupted, secure, or error-free, that 
              defects will be corrected, or that AI-generated feedback will be accurate, complete, or reliable.
            </p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">8. Indemnification</h2>
            <p className="mb-6 text-gray-700">
              You agree to indemnify, defend, and hold harmless InterviewAnswers.ai and its officers, directors, employees, and 
              agents from and against any claims, liabilities, damages, losses, costs, or expenses (including 
              reasonable attorneys' fees) arising from or related to: (a) your use of InterviewAnswers.ai; (b) your violation 
              of these Terms; (c) your violation of any recording laws or failure to obtain proper consent; 
              (d) your reliance on AI-generated feedback; or (e) your violation of any third-party rights.
            </p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">9. Account Termination</h2>
            <p className="mb-6 text-gray-700">
              We reserve the right to suspend or terminate your access to InterviewAnswers.ai at any time, with or without notice, 
              for any reason, including but not limited to violation of these Terms, fraudulent conduct, or 
              misuse of the service. You may terminate your account at any time by deleting your account 
              through the Settings page. Upon termination, your right to use InterviewAnswers.ai will immediately cease.
            </p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">10. Dispute Resolution and Arbitration</h2>
            <p className="mb-4 text-gray-700">
              Any dispute, claim, or controversy arising out of or relating to these Terms or your use of InterviewAnswers.ai 
              shall be resolved through binding arbitration administered by the American Arbitration Association 
              under its Commercial Arbitration Rules. The arbitration shall take place in San Francisco, California, 
              or another mutually agreed location.
            </p>
            <p className="mb-6 text-gray-700 font-semibold">
              You waive your right to a jury trial and your right to participate in class action lawsuits or 
              class-wide arbitrations.
            </p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">11. Modifications to Terms</h2>
            <p className="mb-6 text-gray-700">
              We reserve the right to modify these Terms at any time. We will notify you of material changes 
              by posting the updated Terms on this page and updating the "Last updated" date. Your continued 
              use of InterviewAnswers.ai after such changes constitutes your acceptance of the modified Terms.
            </p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">12. Governing Law</h2>
            <p className="mb-6 text-gray-700">
              These Terms shall be governed by and construed in accordance with the laws of the State of California, 
              without regard to its conflict of law provisions.
            </p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">13. Severability</h2>
            <p className="mb-6 text-gray-700">
              If any provision of these Terms is found to be unenforceable or invalid, that provision shall be 
              limited or eliminated to the minimum extent necessary, and the remaining provisions shall remain 
              in full force and effect.
            </p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">14. Contact Information</h2>
            <p className="mb-4 text-gray-700">
              If you have questions about these Terms of Service, please contact us:
            </p>
            <p className="mb-6 text-gray-700">Email: support@interviewanswers.ai</p>
            
            <hr className="my-8 border-gray-300" />
            
            <p className="text-sm text-gray-600 italic">
              By using InterviewAnswers.ai, you acknowledge that you have read, understood, and agree to be bound by these 
              Terms of Service. These Terms constitute a legal agreement between you and InterviewAnswers.ai.
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  })()} {/* Close IIFE that wraps all views */}
  
      {/* ==========================================
          USAGE DASHBOARD MODAL
          ========================================== */}
      {showUsageDashboard && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
          onClick={() => setShowUsageDashboard(false)}
        >
          <div 
            className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-auto relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowUsageDashboard(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10"
            >
              <X className="w-6 h-6" />
            </button>
            <UsageLimitModal 
              user={currentUser}
              supabase={supabase}
              userTier={userTier}
              onUpgrade={() => {
                setShowUsageDashboard(false);
                setShowPricingPage(true);
              }}
            />
          </div>
        </div>
      )}

      {/* ==========================================
          PRICING PAGE MODAL - FIXED SCROLL
          ========================================== */}
      {showPricingPage && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9999] overflow-y-auto"
          onClick={() => setShowPricingPage(false)}
        >
          {/* Close button - FIXED to viewport, always visible */}
          <button
            onClick={() => setShowPricingPage(false)}
            className="fixed top-4 right-4 text-white hover:text-gray-300 z-[10000] bg-black/50 rounded-full p-2 backdrop-blur-sm"
          >
            <X className="w-8 h-8" />
          </button>
          
          {/* Content wrapper - allows scrolling */}
          <div 
            className="min-h-screen w-full py-16 px-4"
            onClick={(e) => e.stopPropagation()}
          >
            <PricingPage
              currentTier={userTier}
              onSelectTier={(tier) => {
                if (tier === 'free') {
                  setShowPricingPage(false);
                  return;
                }
                // TODO: Stripe integration coming next!
                alert(`You selected ${tier} tier!\n\nStripe payment integration coming in the next step. For now, you can test the UI!`);
                console.log('User selected tier:', tier);
              }}
            />
          </div>
        </div>
      )}

      {/* ==========================================
          TEMPLATE LIBRARY MODAL
          ========================================== */}
      {showTemplateLibrary && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
          <div 
            className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-auto relative"
            onClick={(e) => e.stopPropagation()}
          >
            <TemplateLibrary
              onClose={() => {
                console.log('🔵 Closing Template Library modal');
                setShowTemplateLibrary(false);
              }}
              onOpenAICoach={handleOpenAICoachFromTemplate}
              checkUsageLimit={checkAIUsageLimit}
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
          </div>
        </div>
      )}

      {/* ==========================================
          PASSWORD RESET MODAL
          ========================================== */}
      {/* REMOVED: PASSWORD RESET MODAL - Now handled in ProtectedRoute.jsx */}
    </>
  ); {/* Close fragment that contains dialogs + views */}
}; // Close ISL component

// Wrap ISL with ProtectedRoute before exporting
function App() {
  return (
    <ProtectedRoute>
      <ISL />
    </ProtectedRoute>
  );
}

export default App;