 import React, { useState, useEffect, useRef, useCallback } from 'react';
import { flushSync } from 'react-dom';

import {
  Brain, Database, Play, Plus, Edit2, Trash2, TrendingUp, Download, Upload,
  Mic, MicOff, Volume2, VolumeX, Eye, EyeOff, Settings, Sparkles, ChevronRight, ChevronDown, X,
  Zap, CheckCircle, Target, Bot, BookOpen, SkipForward, Pause, Award, Filter,
  Crown, Lightbulb, Square, Calendar, AlertCircle, Mail, MessageSquare, MessageCircle,
  Star, BarChart2, ClipboardList, Trophy, RotateCcw, ArrowRight, Globe, Smartphone,
  Headphones, GraduationCap, MapPin, Briefcase, FileText, Layers
} from 'lucide-react';

import {
  GradientDefs, PrompterIcon, InterviewerIcon, PracticeIcon, FlashcardIcon,
  LearnIcon, RadioIcon, CoachIcon, DecoderIcon, StoryBankIcon, StarDrillIcon,
  PortfolioIcon, InterviewDayIcon, FollowUpIcon, NotesIcon, FlashcardCompactIcon,
  CommandCenterIcon, IconContainer,
  QuestionsStatIcon, SessionsStatIcon, UnlimitedStatIcon, DaysStatIcon, StreakStatIcon
} from './Components/icons/FeatureIcons';
import SupabaseTest from './SupabaseTest';
import ProtectedRoute from './ProtectedRoute';
import { supabase } from './lib/supabase';
import FirstTimeConsent from "./Components/FirstTimeConsent";
import SettingsPage from "./Components/SettingsPage";
import QuestionAssistant from './Components/QuestionAssistant';
import AnswerAssistant from './Components/AnswerAssistant';
import TemplateLibrary from './TemplateLibrary';
import Tutorial from './Components/Tutorial';
import { DEFAULT_QUESTIONS, QUESTION_GROUPS, getDefaultActiveGroups, filterQuestionsByGroups, getQuestionCountsByGroup } from './default_questions';
import QuestionGroupFilter from './Components/QuestionGroupFilter';
import AIInterviewCoach from './Components/AIInterviewCoach';
import HomePageV2 from './Components/HomePageV2';
import InterviewFormatModal from './Components/Intelligence/InterviewFormatModal';
import CuratedInterviewsScreen from './Components/Intelligence/CuratedInterviewsScreen';
import { buildInterviewSequence, buildSequenceFromCurated, swapQuestionInSequence, generateSessionSeed, getFormatById } from './utils/interviewFormats';
import { loadPersistedGroups } from './Components/QuestionGroupFilter';
import { canUseFeature, incrementUsage, getUsageStats, TIER_LIMITS, isBetaUser, resolveEffectiveTier } from './utils/creditSystem';
import { fetchWithRetry } from './utils/fetchWithRetry';
import UsageLimitModal from './Components/UsageLimitModal';
import GeneralPricing from './Components/GeneralPricing';
import ResetPassword from './Components/ResetPassword';
import ConsentDialog from './Components/ConsentDialog';
import SessionDetailsModal from './Components/SessionDetailsModal';
import SubscriptionManagement from './Components/SubscriptionManagement';
import ArchetypeCTA from './Components/Onboarding/ArchetypeCTA';
import { getBrowserInfo as getSharedBrowserInfo } from './utils/browserDetection';
import SpeechUnavailableWarning from './Components/SpeechUnavailableWarning';
import StreakDisplay from './Components/Streaks/StreakDisplay';
import MilestoneToast from './Components/Streaks/MilestoneToast';
import IRSDisplay from './Components/IRS/IRSDisplay';
import { updateStreakAfterSession } from './utils/streakSupabase';
import { trackPurchase } from './utils/googleAdsTracking';
import { showNursingFeatures, showGeneralFeatures, isTargetedBuild, getAppTarget } from './utils/appTarget';
import { isNativeApp } from './utils/platform';
import { getPreferredVoice, VOICE_SETTINGS } from './utils/voiceManager';
import InterviewContextHub from './Components/InterviewContextHub';
import InterviewCoach from './Components/InterviewCoach';
import QuickAddQuestion from './Components/QuickAddQuestion';
import ScoreTrendSparkline from './Components/Intelligence/ScoreTrendSparkline';
import DeliveryInsights from './Components/Intelligence/DeliveryInsights';
import { buildDeliveryContext } from './utils/deliveryPromptBuilder';
import TimerOverlay, { TimerSelector } from './Components/Intelligence/TimerOverlay';
import JDDecoder from './Components/Intelligence/JDDecoder';
import QuestionSparkNotes from './Components/Intelligence/QuestionSparkNotes';
import StoryBank from './Components/Intelligence/StoryBank';
import CompanyBrief from './Components/Intelligence/CompanyBrief';
import SessionReport from './Components/Intelligence/SessionReport';
import InterviewDayMode from './Components/Intelligence/InterviewDayMode';
import PrepRadio from './Components/Intelligence/PrepRadio';
import WeakPointDrill from './Components/Intelligence/WeakPointDrill';
import FollowUpEmail from './Components/Intelligence/FollowUpEmail';
import LearnSection from './Components/Intelligence/LearnSection';
// TrialBanner removed — 24-hour trial killed, free tier is the new onramp
import { resetAllProgress } from './utils/resetProgress';
import JobFocusManager, { isFocusModeOn, setFocusMode, getFilteredQuestions, loadFavorites } from './Components/Intelligence/JobFocusManager';
import Portfolio from './Components/Intelligence/Portfolio';
import JourneyProgress from './Components/Intelligence/JourneyProgress';

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
  // Console welcome message for developers
  useEffect(() => {
    console.log('%c InterviewAnswers.ai', 'font-size: 24px; font-weight: bold; color: #4F46E5;');
    console.log('%cBuilding something? We\'re hiring! support@interviewanswers.ai', 'font-size: 12px; color: #666;');
  }, []);

  // TEMPORARY: Test Supabase connection
  const TESTING_SUPABASE = false;

  if (TESTING_SUPABASE) {
    return <SupabaseTest />;
  }

  // FIXED: Restore last view from localStorage to survive page refresh/screen lock (IA-006, IA-007)
  // BUG 1 IMPROVEMENT: Restore session views if currentQuestion was also saved
  const [currentView, setCurrentView] = useState(() => {
    const saved = localStorage.getItem('isl_current_view');
    const savedQuestion = localStorage.getItem('isl_current_question');
    const viewsRequiringSession = ['practice', 'ai-interviewer', 'prompter', 'flashcard'];
    // Only restore session views if we also have a saved question
    if (saved && viewsRequiringSession.includes(saved)) {
      if (savedQuestion) {
        try {
          JSON.parse(savedQuestion); // Validate it's parseable
          return saved; // Restore the session view
        } catch (e) {
          return 'home'; // Invalid question data, reset to home
        }
      }
      return 'home'; // No saved question, reset to home
    }
    return saved || 'home';
  });
  const [showIdealAnswer, setShowIdealAnswer] = useState(false);
  // BUG 1 IMPROVEMENT: Restore currentMode from localStorage for session persistence
  const [currentMode, setCurrentMode] = useState(() => {
    const saved = localStorage.getItem('isl_current_mode');
    const viewsRequiringSession = ['practice', 'ai-interviewer', 'prompter', 'flashcard'];
    // Only restore mode if it's a session view
    if (saved && viewsRequiringSession.includes(saved)) {
      return saved;
    }
    return null;
  });
  const [questions, setQuestions] = useState([]);
  // BUG 1 IMPROVEMENT: Restore currentQuestion from localStorage for session persistence
  const [currentQuestion, setCurrentQuestion] = useState(() => {
    const saved = localStorage.getItem('isl_current_question');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });
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
  // Structured Mock Interviewer — format-driven sequencing (see src/utils/interviewFormats.js)
  const [showFormatModal, setShowFormatModal] = useState(false);
  const [showCuratedInterviews, setShowCuratedInterviews] = useState(false); // NEW: shown after format picked
  const [selectedFormat, setSelectedFormat] = useState(null);        // format object
  const [selectedCuratedInterview, setSelectedCuratedInterview] = useState(null); // NEW: the chosen playlist
  const [sessionSeed, setSessionSeed] = useState(null);              // numeric seed for reproducibility
  const [interviewSequence, setInterviewSequence] = useState([]);    // [{slotIndex, stage, slotType, label, question}]
  const [sequenceIndex, setSequenceIndex] = useState(0);             // current position in sequence
  const [sessionFeedback, setSessionFeedback] = useState([]);        // per-slot feedback accumulated across session
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  // P0 FIX: Track analyzing state for stale detection and late-response safety
  const isAnalyzingRef = useRef(false); // Mirror of isAnalyzing for visibility handler (avoids stale closure)
  const isAnalyzingTimestampRef = useRef(null); // When isAnalyzing was set true
  const submitAttemptRef = useRef(0); // Incrementing ID to ignore late responses
  const STALE_ANALYZING_THRESHOLD_MS = 12000; // 12 seconds - conservative for slow networks
  const [practiceHistory, setPracticeHistory] = useState([]);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [showNarrative, setShowNarrative] = useState(false);
  const [showBullets, setShowBullets] = useState(false);
  const [showFollowUps, setShowFollowUps] = useState(false);
  const [spacebarHeld, setSpacebarHeld] = useState(false);
  const [filterCategory, setFilterCategory] = useState('All');
  const [activeGroups, setActiveGroups] = useState(() => {
    try { const persisted = loadPersistedGroups ? loadPersistedGroups() : null; return persisted || getDefaultActiveGroups(); } catch { return getDefaultActiveGroups(); }
  });
  const [filterPriority, setFilterPriority] = useState('All');
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [aiSubtitle, setAiSubtitle] = useState('');
  const [voiceMuted, setVoiceMuted] = useState(() => {
    try { return localStorage.getItem('isl_voice_muted') === 'true'; } catch { return true; }
  });
  const [questionHistory, setQuestionHistory] = useState([]);
  const [showResumeToast, setShowResumeToast] = useState(false);
  // Phase 4J: Time Pressure Practice
  const [timedMode, setTimedMode] = useState(false);
  const [timerDuration, setTimerDuration] = useState(180);
  const [timerActive, setTimerActive] = useState(false);
  const [recordingElapsed, setRecordingElapsed] = useState(null);
  // Phase 4M: Confidence Calibration
  const [confidenceRating, setConfidenceRating] = useState(null);
  // Phase 4E: Question SparkNotes
  const [sparkNotesQuestion, setSparkNotesQuestion] = useState(null);
  // Phase 4G: Session Report
  const [sessionQuestions, setSessionQuestions] = useState([]);
  const [showSessionReport, setShowSessionReport] = useState(false);
  // Phase 4L: Drill target from SessionReport
  const [drillTargetComponent, setDrillTargetComponent] = useState(null);
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
  const micStreamRef = useRef(null); // MOBILE FIX: Store getUserMedia stream so we can release it
  const aiQuestionRef = useRef(null); // For auto-scrolling to AI questions
  const initializingDefaultsRef = useRef(false); // Prevent double-initialization in React Strict Mode
  const lastFeedbackRef = useRef(null); // DUAL-LAYER FIX: Backup feedback in case state gets lost during tab switch
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [interviewDate, setInterviewDate] = useState(localStorage.getItem('isl_interview_date') || '');
  const [aiGeneratorCollapsed, setAiGeneratorCollapsed] = useState(true);
  const [selectedChartPoint, setSelectedChartPoint] = useState(null);
  const [showChartModal, setShowChartModal] = useState(false);
  const [dailyGoal, setDailyGoal] = useState(parseInt(localStorage.getItem('isl_daily_goal') || '3', 10));
  const [selectedSession, setSelectedSession] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [focusModeActive, setFocusModeActive] = useState(false);
  const [cachedFavorites, setCachedFavorites] = useState(null);
  // Sync focus mode + favorites from localStorage when user changes
  useEffect(() => {
    if (currentUser) {
      setFocusModeActive(isFocusModeOn(currentUser.id));
      setCachedFavorites(loadFavorites(currentUser.id));
    }
  }, [currentUser]);
  const [userTier, setUserTier] = useState('free');
  // trialInfo state removed — trial system killed
  const [showPricingPage, setShowPricingPage] = useState(false);
  const [showCoachPanel, setShowCoachPanel] = useState(false);
  const [showSubscriptionManagement, setShowSubscriptionManagement] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState('inactive');
  const [showUsageDashboard, setShowUsageDashboard] = useState(false);
  const [streakMilestone, setStreakMilestone] = useState(null);
  const [streakRefreshTrigger, setStreakRefreshTrigger] = useState(0);
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
  const [hasAcceptedFirstTimeTerms, setHasAcceptedFirstTimeTerms] = useState(false);

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

  // P0 FIX: Keep isAnalyzingRef in sync with isAnalyzing state
  useEffect(() => {
    isAnalyzingRef.current = isAnalyzing;
  }, [isAnalyzing]);

  // CLEANUP 3: Stop mic when app goes to background (Safari tab switch, app switch)
  // ALSO: Refresh session token when returning to prevent 406 errors
  // BUG 3 FIX: True pause/resume for Practice Prompter - don't end session on tab switch
  const wasSessionPausedRef = useRef(false); // Track if we paused due to tab switch

  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.hidden) {
        // Track when user leaves for auto-refresh timing
        window._lastHiddenTime = Date.now();

        // BUG 3 FIX: Only PAUSE mic, don't end session (for Practice Prompter resume)
        if (recognitionRef.current && interviewSessionActiveRef.current) {
          console.log('🧹 App backgrounded - PAUSING mic session (not ending)');
          wasSessionPausedRef.current = true; // Remember we need to resume
          try {
            // FULL CLEANUP: Stop, abort, and null out recognition
            recognitionRef.current.stop();
            try { recognitionRef.current.abort(); } catch (e) {}
            // Remove all event listeners
            recognitionRef.current.onresult = null;
            recognitionRef.current.onerror = null;
            recognitionRef.current.onend = null;
            recognitionRef.current.onstart = null;
            // Null the reference so resume creates a fresh one
            recognitionRef.current = null;
            console.log('✅ Recognition paused on background');
          } catch (err) {
            console.log('Cleanup error (ignored):', err);
          }
          // BUG 3 FIX: Keep session active, only stop listening state
          // Session persists so user sees "Session Active" when returning
          setIsListening(false);
          isListeningRef.current = false;
          setSessionReady(false);
          // NOTE: NOT setting interviewSessionActive = false anymore!
        }
      } else {
        // TAB SWITCH FIX: Check session validity when returning to app
        console.log('👁️ App visible - checking session...');

        // P0 NUCLEAR FIX: Auto-refresh on tab return to clear ALL stale state
        // This fixes buttons not working after switching tabs/apps on desktop AND mobile
        // Only refresh if user has been away for more than 2 seconds (avoid false triggers)
        const timeAway = Date.now() - (window._lastHiddenTime || 0);
        if (timeAway > 2000) {
          console.log(`🔄 [Tab Return] Away for ${timeAway}ms - refreshing to clear stale state...`);
          // Small delay to ensure visibility state is stable
          setTimeout(() => {
            window.location.reload();
          }, 100);
          return; // Don't execute rest of handler, page is reloading
        }

        // P0 FIX: Reset STALE isAnalyzing state to unblock submit buttons
        // Uses ref to avoid stale closure (this effect has empty dep array)
        // Only reset if analyzing has been stuck for longer than threshold
        if (isAnalyzingRef.current && isAnalyzingTimestampRef.current) {
          const stuckDuration = Date.now() - isAnalyzingTimestampRef.current;
          console.log(`👁️ [Visibility] isAnalyzing=${isAnalyzingRef.current} | stuckFor=${stuckDuration}ms | threshold=${STALE_ANALYZING_THRESHOLD_MS}ms`);
          if (stuckDuration > STALE_ANALYZING_THRESHOLD_MS) {
            // Increment attemptRef so any in-flight response is ignored
            const invalidatedAttempt = submitAttemptRef.current;
            submitAttemptRef.current++;
            console.log(`🔓 [Visibility] Resetting STALE isAnalyzing | was stuck ${stuckDuration}ms | invalidated attemptId=${invalidatedAttempt} | new current=${submitAttemptRef.current}`);
            isAnalyzingTimestampRef.current = null;
            setIsAnalyzing(false);
          }
        }

        try {
          // First, just check if we have a valid session (fast, no network call if cached)
          const { data: { session: existingSession } } = await supabase.auth.getSession();

          if (existingSession) {
            // Session exists - check if it needs refresh (token expiring soon)
            const expiresAt = existingSession.expires_at;
            const now = Math.floor(Date.now() / 1000);
            const expiresIn = expiresAt - now;

            if (expiresIn < 300) { // Less than 5 minutes left
              console.log('🔄 Session expiring soon, refreshing...');
              // Try to refresh, but don't block on failure
              supabase.auth.refreshSession().then(({ data, error }) => {
                if (error) {
                  console.log('Session refresh deferred - will retry on next API call');
                } else {
                  console.log('✅ Session refreshed successfully');
                }
              }).catch(() => {
                // Silently ignore - Supabase will auto-refresh on next API call
              });
            } else {
              console.log('✅ Session valid (expires in', Math.floor(expiresIn / 60), 'min)');
            }
          } else {
            console.log('ℹ️ No active session');
          }
        } catch (err) {
          // Don't log as error - just informational
          console.log('Session check skipped:', err.message);
        }

        // BUG 3 FIX: Auto-resume Practice Prompter session if it was paused
        if (wasSessionPausedRef.current && interviewSessionActiveRef.current) {
          console.log('🎤 Auto-resuming paused session...');
          wasSessionPausedRef.current = false;

          // Reinitialize recognition and restart
          try {
            initSpeechRecognition();
            if (recognitionRef.current) {
              recognitionRef.current.start();
              setIsListening(true);
              isListeningRef.current = true;
              setSessionReady(true);
              console.log('✅ Session auto-resumed after tab switch');
            }
          } catch (err) {
            console.error('Auto-resume failed:', err);
            // Session still active, user can manually restart
            setSessionReady(false);
          }
        }
      }
      // TAB SWITCH FIX: Removed setCurrentView that was breaking buttons
      // UsageDashboard has its own visibility listener (independent)
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

  // PR 3 — dual-schema score accessor. New shape: feedback.score. Legacy: feedback.overall.
  // Keep as a stable reference inside the component so both render blocks can use it.
  const getFeedbackScore = (fb) => (fb?.score ?? fb?.overall ?? 0);

  // Animate score when feedback appears + Progressive Reveal
  useEffect(() => {
    if (feedback?.score || feedback?.overall || feedback?.match_percentage) {
      const targetScore = getFeedbackScore(feedback) || (feedback.match_percentage / 10) || 0;

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
      const interviewDate = localStorage.getItem('isl_interview_date');
      const base = { targetRole: '', targetCompany: '', background: '', interviewType: '', jobDescription: '', interviewDate: interviewDate || '', portfolioSummary: '' };
      if (saved) {
        const { role, comp, bg, type, jd } = JSON.parse(saved);
        base.targetRole = role || '';
        base.targetCompany = comp || '';
        base.background = bg || '';
        base.interviewType = type || '';
        base.jobDescription = jd || '';
      }
      // Inject portfolio summary for AI context enrichment
      const portfolioRaw = localStorage.getItem('isl_portfolio');
      if (portfolioRaw) {
        try {
          const projects = JSON.parse(portfolioRaw).filter(p => p.isAnalyzed);
          if (projects.length > 0) {
            base.portfolioSummary = projects.map(p =>
              `${p.title}: ${p.aiSummary || ''} Skills: ${(p.keySkills || []).join(', ')}`
            ).join('\n');
          }
        } catch {}
      }
      return base;
    } catch (err) {
      console.error('Error loading user context:', err);
    }
    return { targetRole: '', targetCompany: '', background: '', interviewType: '', jobDescription: '', interviewDate: '', portfolioSummary: '' };
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
          // PR 3 — support both v1 (overall) and v2 (score) shapes
          const scores = questionSessions
            .map(s => s.ai_feedback?.score ?? s.ai_feedback?.overall)
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
        question_group: q.group || null,
        difficulty: q.difficulty || null,
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
                  usageStats?.tier === 'beta' ||
                  usageStats?.tier === 'nursing_pass' ||
                  usageStats?.tier === 'general_pass' ||
                  usageStats?.tier === 'annual';

    const limit = usageStats?.tier === 'beta' ? 999999 :
                  (usageStats?.tier === 'pro' || usageStats?.tier === 'general_pass' || usageStats?.tier === 'annual') ? 40 : 5;

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
✓ Practice Prompter (unlimited)
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
    // ULTIMATE FIX: Converted to promise chains for consistency
    // Update current question state (synchronous)
    setAnswerAssistantQuestion({ 
      ...answerAssistantQuestion, 
      narrative: answer.narrative, 
      bullets: answer.bullets,
      keywords: answer.keywords || answerAssistantQuestion.keywords || []
    });
    
    // Update questions list (synchronous)
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

    // NOTE: Usage is tracked via onUsageTracked callback in AnswerAssistant
    // when AI delivers feedback - NOT here on save (to prevent double counting)
    console.log('✅ Answer saved with all fields:', {
      narrative: !!answer.narrative,
      bullets: answer.bullets?.length,
      keywords: answer.keywords?.length
    });
  };

  // Load usage on mount
  useEffect(() => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const storageKey = `isl_usage_${currentMonth}`;
    const currentUsage = parseInt(localStorage.getItem(storageKey) || '0');
    
    const limit = usageStats?.tier === 'beta' ? 999999 :
                  (usageStats?.tier === 'pro' || usageStats?.tier === 'general_pass' || usageStats?.tier === 'annual') ? 40 : 5;

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
    
    const { data: sessions, error: sessionsError } = await supabase
      .from('practice_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    console.log('🔍 practice_sessions query:', { count: sessions?.length, error: sessionsError });

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

  // Native app: refresh data when returning from background
  useEffect(() => {
    const handleResume = async () => {
      console.log('📱 App resumed from background — refreshing data');
      // Refresh Supabase session so auth tokens are fresh
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setCurrentUser(session.user);
        }
      } catch (e) {
        console.warn('📱 Session refresh failed:', e);
      }
      loadQuestions();
      loadPracticeHistory();
      // Re-init speech in case WebView killed it
      initSpeechRecognition();
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        synthRef.current = window.speechSynthesis;
      }
    };
    window.addEventListener('capacitor-resume', handleResume);
    return () => window.removeEventListener('capacitor-resume', handleResume);
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

  // FIXED: Save current view to survive page refresh/screen lock (IA-006, IA-007)
  useEffect(() => {
    localStorage.setItem('isl_current_view', currentView);
  }, [currentView]);

  // BUG 1 IMPROVEMENT: Save currentQuestion to localStorage for session persistence
  useEffect(() => {
    if (currentQuestion) {
      localStorage.setItem('isl_current_question', JSON.stringify(currentQuestion));
    } else {
      localStorage.removeItem('isl_current_question');
    }
  }, [currentQuestion]);

  // BUG 1 IMPROVEMENT: Save currentMode to localStorage for session persistence
  useEffect(() => {
    if (currentMode) {
      localStorage.setItem('isl_current_mode', currentMode);
    } else {
      localStorage.removeItem('isl_current_mode');
    }
  }, [currentMode]);

  // Helper function to load user tier and stats
  const loadUserTierAndStats = async (user, forceRefresh = false) => {
    console.log('🔍 loadUserTierAndStats called with user:', user?.id);
    if (!user) {
      console.log('⚠️ No user provided to loadUserTierAndStats');
      return 'free';
    }

    let tier = 'free';

    try {
      console.log('🔍 Fetching profile for user:', user.id);
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('tier, subscription_status, stripe_customer_id, nursing_pass_expires, general_pass_expires, premium_trial_ends')
        .eq('user_id', user.id)
        .single();

      console.log('🔍 Profile query result:', { profile, error: profileError?.message });

      if (profileError) {
        console.error('❌ Profile fetch error:', profileError.message, profileError.code);
        // Don't return - try to create profile or continue with defaults
      }

      if (profile) {
        // CRITICAL: Use resolveEffectiveTier to determine tier from pass expiry + legacy
        // This will be overridden by beta check below if user is in beta_testers table
        tier = profile.tier || 'free';
        // If user has active passes, resolveEffectiveTier upgrades the tier
        const effectiveTier = resolveEffectiveTier(profile, false);
        if (effectiveTier !== 'free') {
          tier = effectiveTier;
        }
        // Store subscription status for subscription management
        if (profile.subscription_status) {
          setSubscriptionStatus(profile.subscription_status);
        }
        console.log('📋 Profile loaded:', {
          tier: profile.tier,
          effectiveTier,
          subscription_status: profile.subscription_status,
          stripe_customer_id: profile.stripe_customer_id,
          nursing_pass_expires: profile.nursing_pass_expires,
          general_pass_expires: profile.general_pass_expires,
        });
      } else {
        // Create profile if doesn't exist — start on free tier
        console.log('📝 Creating new profile for user:', user.id);
        const { error: insertError } = await supabase
          .from('user_profiles')
          .insert([{ user_id: user.id, tier: 'free' }]);

        if (insertError) {
          console.error('❌ Profile creation error:', insertError.message);
        } else {
          console.log('✅ Profile created on free tier');
        }
      }

      // BETA FIX: Check beta_testers table to override tier for beta users
      // This ensures beta users see the Pro dashboard even if user_profiles.tier is 'free'
      if (tier !== 'pro') {
        console.log('🔍 Checking beta_testers table for user:', user.id);
        const isBeta = await isBetaUser(supabase, user.id);
        if (isBeta) {
          tier = 'beta';
          console.log('🎖️ Beta user detected! Setting tier to beta');
        }
      }
    } catch (err) {
      console.error('❌ Profile fetch exception:', err);
      // Continue with default tier
    }

    // Set tier state
    console.log('🔍 Setting userTier to:', tier);
    setUserTier(tier);

    // Load usage stats with the tier included
    try {
      const stats = await getUsageStats(supabase, user.id, tier);
      // CRITICAL: Include tier in stats object so it stays in sync
      setUsageStatsData({ ...stats, tier });
      console.log(`✅ Loaded user tier: ${tier}, stats:`, stats);
    } catch (statsErr) {
      console.error('❌ Stats fetch error:', statsErr);
      // Set minimal stats so limits work
      setUsageStatsData({ tier });
    }

    return tier;
  };

  useEffect(() => {
    // REMOVED: Password reset token detection moved to ProtectedRoute.jsx
    // (needs to run BEFORE auth check, not after)

    console.log('🔐 Auth initialization starting...');
    supabase.auth.getSession().then(async ({ data: { session }, error }) => {
      console.log('🔐 getSession result:', { hasSession: !!session, error: error?.message });
      const user = session?.user ?? null;
      setCurrentUser(user);

      // Load user tier from user_profiles
      if (user) {
        console.log('🔐 User found, loading tier and stats...');
        await loadUserTierAndStats(user);
      } else {
        console.log('🔐 No user session');
      }
    }).catch(err => {
      console.error('🔐 getSession error:', err);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔐 Auth state change:', event, { hasSession: !!session });
      const user = session?.user ?? null;
      setCurrentUser(user);

      // Load user tier on auth change
      if (user) {
        console.log('🔐 Auth change - user found, loading tier...');
        await loadUserTierAndStats(user);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // NURSING TRACK UPGRADE LINK: Auto-open pricing modal when arriving from /nursing with ?upgrade=true
  // Stores returnTo so closing modal returns user to nursing track (not stranded on /app)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('upgrade') === 'true') {
      setShowPricingPage(true);
      // Remember where user came from so we can return them there
      const returnTo = urlParams.get('returnTo');
      if (returnTo) {
        sessionStorage.setItem('upgradeReturnTo', returnTo);
      }
      // Clean up the URL param so refresh doesn't re-trigger
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // STRIPE SUCCESS HANDLER: Poll for tier update after returning from checkout
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const isSuccess = urlParams.get('success') === 'true';
    const sessionId = urlParams.get('session_id');
    // Also detect new pass-based checkout: ?purchase=success&pass=general_30day
    const isPurchaseSuccess = urlParams.get('purchase') === 'success';
    const passType = urlParams.get('pass');

    if (!(isSuccess && sessionId) && !isPurchaseSuccess) return;
    if (!currentUser) return;

    // FIX: Prevent duplicate popups - check sessionStorage for this specific session
    const handledKey = `stripe_success_handled_${sessionId || passType || 'unknown'}`;
    if (sessionStorage.getItem(handledKey)) {
      console.log('💳 Checkout success already handled for this session, skipping...');
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }

    console.log('💳 Stripe checkout success detected, polling for tier update...');
    console.log('📋 Session ID:', sessionId, 'Pass type:', passType, 'User ID:', currentUser.id);

    let pollCount = 0;
    const maxPolls = 30; // Poll for up to 30 seconds (webhook can be slow)
    let alreadyHandled = false;

    const pollForTierUpdate = async () => {
      if (alreadyHandled) return true;
      pollCount++;
      console.log(`🔄 Polling for tier update (${pollCount}/${maxPolls})...`);

      try {
        // Force fresh data - bypass any caching
        const { data: profile, error } = await supabase
          .from('user_profiles')
          .select('tier, subscription_status, stripe_customer_id, nursing_pass_expires, general_pass_expires, premium_trial_ends')
          .eq('user_id', currentUser.id)
          .single();

        console.log('📊 Profile data:', profile, 'Error:', error);

        // Check for any paid tier: legacy pro, or pass-based via resolveEffectiveTier
        const resolvedTier = resolveEffectiveTier(profile, false);
        if (profile?.tier === 'pro' || profile?.subscription_status === 'active' || resolvedTier !== 'free') {
          const finalTier = resolvedTier !== 'free' ? resolvedTier : 'pro';
          console.log('🎉 Paid tier confirmed:', finalTier);
          alreadyHandled = true;

          // FIX: Mark this session as handled to prevent duplicate popups
          sessionStorage.setItem(handledKey, 'true');

          setUserTier(finalTier);
          const stats = await getUsageStats(supabase, currentUser.id, finalTier);
          setUsageStatsData({ ...stats, tier: finalTier });

          // Clean up URL parameters
          window.history.replaceState({}, document.title, window.location.pathname);

          // Google Ads purchase conversion tracking (dynamic by pass type)
          const passAmounts = { general_30day: 14.99, nursing_30day: 19.99, annual_all_access: 99.99 };
          trackPurchase(passAmounts[passType] || 14.99, sessionId || 'pass_purchase');

          // Show success message
          alert(isPurchaseSuccess ? '🎉 Your pass is now active! Enjoy your new features.' : '🎉 Welcome to Pro! Your subscription is now active.');
          return true;
        }

        if (pollCount >= maxPolls) {
          console.log('⚠️ Tier update timeout - webhook may be delayed');
          alreadyHandled = true;

          // FIX: Mark this session as handled to prevent duplicate popups
          sessionStorage.setItem(handledKey, 'true');

          // Clean up URL and tell user to refresh
          window.history.replaceState({}, document.title, window.location.pathname);
          alert('Payment received! Your Pro features should activate within a few minutes. If not, please refresh the page or contact support.');
          return true;
        }
      } catch (err) {
        console.error('Polling error:', err);
      }

      return false;
    };

    // Start polling immediately, then every second
    pollForTierUpdate();
    const pollInterval = setInterval(async () => {
      const done = await pollForTierUpdate();
      if (done) {
        clearInterval(pollInterval);
      }
    }, 1000);

    // Cleanup
    return () => {
      alreadyHandled = true;
      clearInterval(pollInterval);
    };
  }, [currentUser]);

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

  // BROWSER DETECTION — Delegates to shared utility (src/utils/browserDetection.js)
  // All detection logic, browser matrix, and messaging live in one place.
  // This thin wrapper preserves the existing call pattern: getBrowserInfo().hasReliableSpeech, etc.
  const getBrowserInfo = () => getSharedBrowserInfo();

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

      // DEBUG: Log every speech result to help diagnose issues
      const heardText = final || interim;
      if (heardText) {
        console.log(`🎤 Speech detected: "${heardText.trim()}" | Session: ${sessionActive} | Capturing: ${capturing} | Mode: ${mode}`);
      }

      // SESSION MODE: Only accumulate when capturing
      // NON-SESSION MODE: Always accumulate
      const shouldAccumulate = sessionActive ? capturing : true;

      if (shouldAccumulate) {
        // Save FINAL results permanently
        if (final) {
          accumulatedTranscript.current = (accumulatedTranscript.current + ' ' + final).trim();
          currentInterimRef.current = ''; // Clear interim when we get final
          console.log('✅ Speech captured (final):', accumulatedTranscript.current);
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
        // Session active but not capturing - user needs to hold spacebar or button
        // Only log once per speech segment to avoid spam
        if (heardText && heardText.trim().length > 5) {
          console.log('⚠️ Speech heard but NOT captured - hold SPACEBAR or the mic button to capture');
        }
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
  const savePracticeSession = (questionData, userAnswer, aiFeedback = null) => {
    // ULTIMATE FIX: Converted to promise chains for nested call compatibility
    return supabase.auth.getUser()
      .then(({ data: { user } }) => {
        if (!user) return null;

        const wordCount = userAnswer.split(' ').filter(w => w.length > 0).length;
        const fillerWords = ['um', 'uh', 'like', 'you know', 'so', 'actually'];
        const fillerCount = fillerWords.reduce((count, word) => {
          const regex = new RegExp(`\\b${word}\\b`, 'gi');
          return count + (userAnswer.match(regex) || []).length;
        }, 0);

        // PR 3 — mark row with schema version. v2 when the new 5-field shape is
        // present (feedback.fix). Legacy 8-field rows persist as v1.
        const _feedbackVersion = (aiFeedback && aiFeedback.fix) ? 2 : 1;

        return supabase
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
            feedback_version: _feedbackVersion,
          })
          .select()
          .single();
      })
      .then(result => {
        if (!result) return null;
        if (result.error) throw result.error;
        console.log('✅ Practice session saved:', result.data);
        return result.data;
      })
      .catch(error => {
        console.error('❌ Error saving practice session:', error);
        return null;
      });
  };

 // Check and increment usage
  // CHECK AND INCREMENT USAGE - Call this before using AI features
  // Check usage WITHOUT incrementing (for Answer Assistant)
  const checkUsage = async (feature, featureName) => {
    if (!currentUser) {
      alert('Please sign in first');
      return false;
    }

    // PHASE 2: Check if beta user first (server-side verified)
    const isBeta = await isBetaUser(supabase, currentUser.id);
    if (isBeta) {
      console.log('🎖️ Beta user - unlimited access for', featureName);
      return true;
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
• Unlimited Practice Prompter

Get a 30-Day Pass for just $14.99 — no subscription!`);
      setShowPricingPage(true);
      return false;
    }

    return true;
  };

  // COMPREHENSIVE FIX: Synchronous usage check (reads from state, no await)
  // This prevents React state corruption after tab switch
  const checkUsageLimitsSync = (feature, featureName) => {
    if (!currentUser) {
      alert('Please sign in first');
      return false;
    }

    // PHASE 2: Beta users bypass all limits (check userTier state)
    if (userTier === 'beta') {
      console.log('🎖️ Beta user - unlimited access for', featureName);
      return true;
    }

    // Pro / pass / annual users have unlimited access to general features
    if (userTier === 'pro' || userTier === 'general_pass' || userTier === 'annual') {
      console.log('👑 Paid user - unlimited access for', featureName);
      return true;
    }

    // BUG FIX: usageStatsData structure is { answerAssistant: { used: 5, limit: 5, remaining: 0 } }
    // NOT raw counts like { answer_assistant: 5 }
    // So we need to check featureStats.used vs featureStats.limit directly
    const featureStats = usageStatsData?.[feature];

    if (!featureStats) {
      // No stats loaded yet - allow but log warning
      console.warn(`⚠️ No usage stats for ${feature}, allowing action`);
      return true;
    }

    const { used, limit, unlimited } = featureStats;

    // Unlimited features always allowed
    if (unlimited) {
      console.log(`♾️ Unlimited access for ${featureName}`);
      return true;
    }

    // CRITICAL FIX: Block if used >= limit (no remaining uses)
    if (used >= limit) {
      console.log(`🚫 LIMIT REACHED for ${featureName}: ${used}/${limit}`);
      alert(`You've used all ${limit} ${featureName} sessions this month!

Upgrade to Pro for UNLIMITED:
• Unlimited AI Interviewer
• Unlimited Practice Mode
• Unlimited Answer Assistant
• Unlimited Question Generator
• Unlimited Practice Prompter

Get a 30-Day Pass for just $14.99 — no subscription!`);
      setShowPricingPage(true);
      return false;
    }

    console.log(`✅ Usage OK for ${featureName}: ${used}/${limit} (${limit - used} remaining)`);
    return true;
  };

  // SERVER-SIDE USAGE ENFORCEMENT: Authoritative check that cannot be bypassed
  // This calls the check-usage Edge Function to validate entitlement + quota
  const checkUsageServerSide = async (feature, featureName) => {
    if (!currentUser) {
      alert('Please sign in first');
      return false;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        alert('Session expired. Please sign in again.');
        return false;
      }

      const response = await fetch(
        'https://tzrlpwtkrtvjpdhcaayu.supabase.co/functions/v1/check-usage',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ feature }),
        }
      );

      if (!response.ok) {
        console.error('check-usage HTTP error:', response.status);
        // Fallback to client-side check on HTTP error
        return checkUsageLimitsSync(feature === 'practice_mode' ? 'practiceMode' :
                                    feature === 'ai_interviewer' ? 'aiInterviewer' :
                                    feature === 'answer_assistant' ? 'answerAssistant' :
                                    feature === 'question_gen' ? 'questionGen' :
                                    feature === 'live_prompter_questions' ? 'livePrompterQuestions' : feature,
                                    featureName);
      }

      const result = await response.json();

      if (!result.allowed) {
        console.log(`🚫 SERVER DENIED: ${featureName} - ${result.used}/${result.limit}`);
        alert(`You've used all ${result.limit} ${featureName} sessions this month!

Upgrade to Pro for UNLIMITED:
• Unlimited AI Interviewer
• Unlimited Practice Mode
• Unlimited Answer Assistant
• Unlimited Question Generator
• Unlimited Practice Prompter

Get a 30-Day Pass for just $14.99 — no subscription!`);
        setShowPricingPage(true);
        return false;
      }

      // Update local state with server-verified tier if different
      if (result.tier && result.tier !== userTier) {
        console.log(`🔄 Updating tier from server: ${userTier} -> ${result.tier}`);
        setUserTier(result.tier);
      }

      console.log(`✅ SERVER APPROVED: ${featureName} - ${result.remaining} remaining`);
      return true;
    } catch (error) {
      console.error('Server usage check failed:', error);
      // Fallback to client-side check on network error (fail-open for UX)
      const clientFeature = feature === 'practice_mode' ? 'practiceMode' :
                           feature === 'ai_interviewer' ? 'aiInterviewer' :
                           feature === 'answer_assistant' ? 'answerAssistant' :
                           feature === 'question_gen' ? 'questionGen' :
                           feature === 'live_prompter_questions' ? 'livePrompterQuestions' : feature;
      return checkUsageLimitsSync(clientFeature, featureName);
    }
  };

  // Track usage AFTER successful completion (for Answer Assistant)
  const trackUsageAfterSuccess = (feature, featureName) => {
    // ULTIMATE FIX: Converted to promise chains (has setState after await - critical!)
    return incrementUsage(supabase, currentUser.id, feature)
      .then(() => {
        // Reload stats
        return getUsageStats(supabase, currentUser.id, userTier);
      })
      .then((stats) => {
        setUsageStatsData(stats);  // In .then() - works after tab switch!
        console.log(`✅ ${featureName} session completed and usage tracked.`);
      })
      .catch((error) => {
        console.error(`Failed to track ${featureName} usage:`, error);
      });
  };

  // COMPREHENSIVE FIX: Background usage tracking (fire and forget)
  // Doesn't block UI, tracks in background
  const trackUsageInBackground = (feature, featureName) => {
    // Fire and forget - don't await, don't block
    incrementUsage(supabase, currentUser.id, feature)
      .then(() => {
        // Reload stats in background
        return getUsageStats(supabase, currentUser.id, userTier);
      })
      .then((stats) => {
        // BUG 4 FIX: Only update if stats valid, and preserve tier
        if (stats) {
          setUsageStatsData(prev => ({ ...stats, tier: prev?.tier || userTier }));
          console.log(`✅ ${featureName} session tracked in background.`);
        } else {
          console.warn(`⚠️ ${featureName} tracked but couldn't reload stats`);
        }
      })
      .catch((error) => {
        console.error(`Failed to track ${featureName} usage:`, error);
        // Don't block user, just log error
      });
  };

  // Check AND increment (for other features like AI Interviewer, Practice Mode)
  const checkAndIncrementUsage = async (feature, featureName) => {
    const canUse = await checkUsage(feature, featureName);
    if (!canUse) return false;
    
    // For features that track usage at START (not completion)
    await trackUsageAfterSuccess(feature, featureName);
    
    return true;
  };

  // Wrapper function to open Answer Assistant with usage check ONLY
  // Usage tracked later when AI delivers feedback (Bug 5 fix)
  const openAnswerAssistant = async (question) => {
    // COMPREHENSIVE FIX: Check usage SYNCHRONOUSLY (from state)
    const canUse = checkUsageLimitsSync('answerAssistant', 'Answer Assistant');
    if (!canUse) return;
    
    // Set UI state IMMEDIATELY (no await blocking)
    setAnswerAssistantQuestion(question);
    setShowAnswerAssistant(true);
    
    // Usage will be tracked when AI delivers feedback (Bug 5 fix)
    // No tracking here, just the check
  };

  const getCurrentUsage = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const currentMonth = new Date().toISOString().slice(0, 7);

      // Check beta_testers first (highest priority)
      const { data: betaUser } = await supabase
        .from('beta_testers')
        .select('unlimited_access')
        .eq('user_id', user.id)
        .maybeSingle();

      if (betaUser?.unlimited_access) {
        return { session_count: 0, tier: 'beta', month: currentMonth };
      }

      // FIX: Get tier from user_profiles (authoritative source for subscription status)
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('tier')
        .eq('user_id', user.id)
        .single();

      const actualTier = profile?.tier || 'free';
      console.log('📋 getCurrentUsage: tier from user_profiles =', actualTier);

      const { data: usage } = await supabase
        .from('usage_tracking')
        .select('*')
        .eq('user_id', user.id)
        .eq('period', currentMonth)
        .maybeSingle();

      // Return usage data with correct tier from user_profiles
      return usage
        ? { ...usage, tier: actualTier }
        : { session_count: 0, tier: actualTier, month: currentMonth };
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
const startInterviewSession = async () => {
  console.log('🎬 Starting interview session');

  // Unsupported browsers: allow session to start (text search works)
  // but skip mic setup — voice not reliable in this browser
  const browser = getBrowserInfo();
  if (!browser.hasReliableSpeech) {
    console.log(`⚠️ ${browser.browserName} — speech not reliable, skipping mic setup. Text search still works.`);
    setInterviewSessionActive(true);
    return;
  }

  // iOS SAFARI FIX: Request mic permission FIRST in the same user gesture
  // This is CRITICAL - iOS Safari requires getUserMedia before SpeechRecognition
  // FIX: Also re-acquire stream if it was released during endInterviewSession
  if (!micPermission || !micStreamRef.current) {
    const reason = !micPermission ? 'No mic permission' : 'Stream was released';
    console.log(`⚠️ ${reason} - requesting in user gesture context...`);
    try {
      // MOBILE FIX: Store the stream so we can release it later
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;
      setMicPermission(true);
      console.log('✅ Mic permission granted, stream stored for cleanup');
    } catch (err) {
      console.error('❌ Mic permission denied:', err);
      alert('Microphone permission is required for this feature. Please allow microphone access and try again.');
      return;
    }
  }

  // Clean up existing recognition if any
  if (recognitionRef.current) {
    console.log('🔄 Cleaning up existing recognition...');
    try {
      recognitionRef.current.stop();
      recognitionRef.current.abort?.();
      recognitionRef.current.onresult = null;
      recognitionRef.current.onerror = null;
      recognitionRef.current.onend = null;
    } catch (err) {
      console.log('Cleanup during reinit:', err);
    }
  }

  // Initialize fresh recognition object
  console.log('🔄 Initializing fresh recognition...');
  initSpeechRecognition();

  // CRITICAL: Start session immediately (same user gesture context for iOS)
  // No setTimeout - iOS Safari needs this in the same gesture
  if (!recognitionRef.current) {
    console.error('❌ Recognition not initialized');
    alert('Microphone initialization failed. Please refresh the page.');
    return;
  }

  actuallyStartSession();
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
      // Handle "already started" error gracefully
      if (err.name === 'InvalidStateError') {
        console.log('Recognition already running, continuing...');
        setInterviewSessionActive(true);
        interviewSessionActiveRef.current = true;
        setSessionReady(true);
        setIsListening(true);
        isListeningRef.current = true;
      } else {
        alert('Failed to start microphone: ' + err.message + '\n\nPlease check your microphone permissions and try again.');
      }
    }
  } else {
    console.error('Recognition not initialized after init call');
    alert('Microphone initialization failed. Please refresh the page and try again.');
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
        console.log('🔇 Stopped system audio track:', track.label);
      });
      setSystemAudioStream(null);
      setUseSystemAudio(false);
      console.log('✅ System audio fully cleaned up');
    } catch (err) {
      console.error('Error stopping system audio:', err);
    }
  }

  // MOBILE FIX: Release the getUserMedia stream to free up microphone
  if (micStreamRef.current) {
    try {
      micStreamRef.current.getTracks().forEach(track => {
        track.stop();
        console.log('🔇 Stopped mic track:', track.label || 'audio');
      });
      micStreamRef.current = null;
      console.log('✅ Microphone stream released');
    } catch (err) {
      console.error('Error releasing mic stream:', err);
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
      // LIVE PROMPTER USAGE: Track when question is matched/displayed
      // SECURITY FIX: Check limits before tracking (prevents bypass)
      if (currentModeRef.current === 'prompter') {
        if (checkUsageLimitsSync('livePrompterQuestions', 'Practice Prompter')) {
          trackUsageInBackground('livePrompterQuestions', 'Practice Prompter');
        } else {
          console.log('🚫 Practice Prompter action blocked - over limit');
        }
      }
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
      // LIVE PROMPTER USAGE: Track when question is matched/displayed
      // SECURITY FIX: Check limits before tracking (prevents bypass)
      if (currentModeRef.current === 'prompter') {
        if (checkUsageLimitsSync('livePrompterQuestions', 'Practice Prompter')) {
          trackUsageInBackground('livePrompterQuestions', 'Practice Prompter');
        } else {
          console.log('🚫 Practice Prompter action blocked - over limit');
        }
      }
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
      // SPACEBAR FIX: Enhanced detection for text fields
      const isTyping = e.target.tagName === 'TEXTAREA' || 
                       e.target.tagName === 'INPUT' ||
                       e.target.isContentEditable ||
                       e.target.closest('textarea') !== null ||
                       e.target.closest('input') !== null;
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
      // SPACEBAR FIX: Enhanced detection for text fields
      const isTyping = e.target.tagName === 'TEXTAREA' || 
                       e.target.tagName === 'INPUT' ||
                       e.target.isContentEditable ||
                       e.target.closest('textarea') !== null ||
                       e.target.closest('input') !== null;
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
  // TTS with smart voice selection — supports HD (Google Cloud Neural2) and Web Speech fallback
  const speakText = async (text) => {
    // Respect mute toggle
    if (voiceMuted) {
      console.log('🔇 Voice muted — skipping TTS');
      return;
    }

    // Try HD voice first (paid users + free trial: 3 uses)
    const hasHD = userTier !== 'free' || (() => {
      try {
        const used = parseInt(localStorage.getItem('isl_hd_voice_trials') || '0', 10);
        return used < 3;
      } catch { return false; }
    })();

    if (hasHD) {
      try {
        const { generateTTSAudio } = await import('./utils/ttsService');
        const blobUrl = await generateTTSAudio([text], { voice: 'nova', speed: 1.0 });
        if (blobUrl) {
          // Track free trial usage
          if (userTier === 'free') {
            try {
              const used = parseInt(localStorage.getItem('isl_hd_voice_trials') || '0', 10);
              localStorage.setItem('isl_hd_voice_trials', String(used + 1));
            } catch {}
          }
          const audio = new Audio(blobUrl);
          setAiSpeaking(true); setAiSubtitle(text);
          audio.onended = () => { setAiSpeaking(false); setAiSubtitle(''); URL.revokeObjectURL(blobUrl); };
          audio.onerror = () => { setAiSpeaking(false); setAiSubtitle(''); };
          await audio.play();
          return;
        }
      } catch (err) {
        console.warn('HD voice failed, falling back to Web Speech:', err.message);
      }
    }

    // Fallback: Web Speech API
    if (!synthRef.current) { console.warn('TTS not available'); return; }
    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = synthRef.current.getVoices();
    const selectedVoice = getPreferredVoice(voices);
    if (selectedVoice) { utterance.voice = selectedVoice; }
    utterance.rate = VOICE_SETTINGS.rate;
    utterance.pitch = VOICE_SETTINGS.pitch;
    utterance.volume = VOICE_SETTINGS.volume;
    utterance.onstart = () => { setAiSpeaking(true); setAiSubtitle(text); };
    utterance.onend = () => { setAiSpeaking(false); setAiSubtitle(''); };
    synthRef.current.speak(utterance);
  };

  const stopSpeaking = () => { if (synthRef.current) { synthRef.current.cancel(); setAiSpeaking(false); setAiSubtitle(''); } };

  // API
  const saveApiKey = (key) => { console.log('Save API key, len:', key.length); localStorage.setItem('isl_api_key', key); setApiKey(key); setShowApiSetup(false); };

  const getAIFeedback = (question, expectedAnswer, userAnswer) => {
    // ULTIMATE FIX: Converted from async/await to promise chains
    // This prevents React state corruption after tab switch
    // setState in .then()/.catch() works where setState after await breaks
    
    if (!apiKey || apiKey.trim().length < 10) { 
      alert('Need valid API key'); 
      setShowApiSetup(true); 
      return Promise.resolve(null);
    }
    
    flushSync(() => {
      setIsAnalyzing(true);
    });
    console.log('Getting AI feedback...');
    
    return fetch('/api/claude-proxy', {
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
    })
    .then(response => {
      console.log('API status:', response.status);
      if (!response.ok) {
        return response.text().then(errorText => {
          console.error('API error:', errorText);
          throw new Error(`API error: ${response.status}`);
        });
      }
      return response.json();
    })
    .then(data => {
      console.log('Got response');
      if (data.content && data.content[0] && data.content[0].text) {
        const feedbackText = data.content[0].text;
        const jsonMatch = feedbackText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const feedback = JSON.parse(jsonMatch[0]);
          console.log('Parsed');
          flushSync(() => {
            setIsAnalyzing(false);
          });
          return feedback;
        }
      }
      throw new Error('Invalid response format');
    })
    .catch(error => {
      console.error('AI error:', error);
      flushSync(() => {
        setIsAnalyzing(false);
      });
      if (error.message.includes('401')) alert('Invalid API key. Check Settings.');
      else if (error.message.includes('429')) alert('Rate limit. Wait and try again.');
      else alert(`Error: ${error.message}\nCheck console (F12)`);
      return null;
    });
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
        keywords: question.keywords || [],
        question_group: question.group || question.question_group || null,
        difficulty: question.difficulty || null
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
        keywords: updatedQ.keywords || [],
        question_group: updatedQ.group || updatedQ.question_group || null,
        difficulty: updatedQ.difficulty || null
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

      // BUG 5 FIX: Delete questions, practice_history, AND practice_sessions (scores/attempts)
      // BUT do NOT delete usage_tracking (keeps usage counters intact)
      const deleteQuestionsPromise = supabase
        .from('questions')
        .delete()
        .eq('user_id', user.id);

      const deletePracticeHistoryPromise = supabase
        .from('practice_history')
        .delete()
        .eq('user_id', user.id);

      const deletePracticeSessionsPromise = supabase
        .from('practice_sessions')
        .delete()
        .eq('user_id', user.id);

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Delete timed out')), 10000)
      );

      let error;
      try {
        // Delete all three tables in parallel with timeout
        const [questionsResult, historyResult, sessionsResult] = await Promise.race([
          Promise.all([deleteQuestionsPromise, deletePracticeHistoryPromise, deletePracticeSessionsPromise]),
          timeoutPromise
        ]);
        error = questionsResult?.error || historyResult?.error || sessionsResult?.error;
      } catch (timeoutError) {
        console.error('Delete timeout:', timeoutError);
        // Still clear local state - user wanted to delete
        error = null;
      }

      if (error) throw error;

      setQuestions([]);
      setPracticeHistory([]);
      setShowDeleteAllConfirm(false);

      // Clear localStorage caches so data doesn't reload from fallback
      localStorage.removeItem(`isl_defaults_initialized_${user.id}`);
      localStorage.removeItem('isl_history');
      localStorage.removeItem('isl_questions');

      console.log('✅ All questions, practice history, AND practice sessions deleted from Supabase');

      // Show choice modal: Keep empty or load defaults
      setShowDeleteChoiceModal(true);
    } catch (error) {
      console.error('❌ Error deleting all data:', error);
      alert('Failed to delete data: ' + error.message);
    }
  };

  const exportQuestions = () => { const dataStr = JSON.stringify(questions, null, 2); const blob = new Blob([dataStr], { type: 'application/json' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = `isl-questions-${Date.now()}.json`; link.click(); };
  // Smart multi-format question parser — accepts JSON, plain text, numbered lists, CSV
  const parseQuestionsFromText = (rawText) => {
    const text = rawText.trim();
    if (!text) return [];

    // Try JSON first (backward compatible)
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) {
        return parsed.filter(q => q.question).map(q => ({
          question: q.question,
          category: q.category || 'Imported',
          priority: q.priority || 'Standard',
          bullets: q.bullets || [],
          narrative: q.narrative || '',
          keywords: q.keywords || [],
        }));
      }
    } catch (e) {
      // Not JSON — try other formats
    }

    // Split by newlines and parse each line
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const questions = [];

    for (const line of lines) {
      // Skip CSV headers
      if (/^question\s*[,\t]/i.test(line)) continue;

      // Try CSV: "question","category" or question,category
      const csvMatch = line.match(/^"?([^"]+)"?\s*[,\t]\s*"?([^"]*)"?$/);
      if (csvMatch && csvMatch[1].length > 10) {
        questions.push({
          question: csvMatch[1].trim(),
          category: csvMatch[2]?.trim() || 'Imported',
          priority: 'Standard',
          bullets: [],
          narrative: '',
          keywords: [],
        });
        continue;
      }

      // Strip numbered list prefixes: "1.", "1)", "- ", "• ", etc.
      let cleaned = line.replace(/^\d+[.)]\s*/, '').replace(/^[-•*]\s*/, '').trim();

      // Skip very short lines (likely not questions)
      if (cleaned.length < 10) continue;

      questions.push({
        question: cleaned,
        category: 'Imported',
        priority: 'Standard',
        bullets: [],
        narrative: '',
        keywords: [],
      });
    }

    return questions;
  };

  const importQuestions = async (rawData) => {
    try {
      const parsed = parseQuestionsFromText(rawData);

      if (!parsed || parsed.length === 0) {
        alert('No questions found. Try pasting one question per line, a numbered list, or a JSON array.');
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('Please sign in to import questions');
        return;
      }

      // Import to Supabase
      const questionsToImport = parsed.map(q => ({
        user_id: user.id,
        question: q.question,
        category: q.category,
        priority: q.priority,
        bullets: q.bullets,
        narrative: q.narrative,
        keywords: q.keywords,
      }));

      const { data, error } = await supabase
        .from('questions')
        .insert(questionsToImport)
        .select();

      if (error) throw error;

      // Reload questions to get the imported ones with IDs
      await loadQuestions();

      alert(`Imported ${data.length} question${data.length !== 1 ? 's' : ''}!`);
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

    // USAGE LIMIT GATE: Block before starting Practice Prompter
    if (!checkUsageLimitsSync('livePrompterQuestions', 'Practice Prompter')) {
      console.log('🚫 Practice Prompter blocked - usage limit reached');
      return;
    }

    if (!hasConsented) {
      console.log('⚠️ No consent - showing dialog');
      setPendingMode('prompter');
      setShowConsentDialog(true);
      return;
    }
    
    console.log('✅ Has consent - showing Practice Prompter warning');
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

    console.log('✅ Has consent - showing format modal');
    // NEW: Show format selection modal before starting the interview
    setShowFormatModal(true);
  };

  /**
   * Called from InterviewFormatModal when the user picks a format.
   * NEW BEHAVIOR: Opens the CuratedInterviewsScreen (list of named playlists)
   * instead of starting the interview immediately.
   */
  const handleFormatSelected = async (format, seed) => {
    console.log('🎯 Format selected:', format.id, 'seed:', seed);
    setShowFormatModal(false);
    setSelectedFormat(format);
    setSessionSeed(seed);
    // Show the curated interviews screen for this format
    setShowCuratedInterviews(true);
  };

  /**
   * Called from CuratedInterviewsScreen when the user picks a specific curated playlist.
   * Builds the sequence from the curated interview's ordered question list
   * (rather than randomly picking from the bank) and starts the interview.
   */
  const handleCuratedInterviewSelected = async (curatedInterview, seed) => {
    console.log('🎬 Curated interview selected:', curatedInterview.id);
    setShowCuratedInterviews(false);

    // Build the question pool from user's bank
    let pool = getFilteredQuestions(questions, currentUser?.id);
    pool = pool.filter(q => !q.question_group || activeGroups.has(q.question_group));
    if (pool.length === 0) pool = getFilteredQuestions(questions, currentUser?.id);

    // Build sequence from the CURATED interview's specific question list
    // (falls back to curated suggestedText when user's bank has no match)
    const sequence = buildSequenceFromCurated(curatedInterview, pool);
    if (!sequence || sequence.length === 0) {
      console.error('Failed to build sequence from curated interview');
      alert('Unable to start this curated interview.');
      return;
    }

    console.log(`📋 Built curated sequence: ${sequence.length} questions from "${curatedInterview.title}"`);

    setSelectedCuratedInterview(curatedInterview);
    setInterviewSequence(sequence);
    setSequenceIndex(0);
    setSessionFeedback([]);

    // Launch the interview with the first question
    await actuallyStartAIInterviewer(sequence);
  };

  const actuallyStartAIInterviewer = async (sequence) => {
    console.log('🚀 Actually starting AI Interviewer');

    // AUTHORITATIVE FIX: Server-side usage check (cannot be bypassed)
    const canUse = await checkUsageServerSide('ai_interviewer', 'AI Interviewer');
    if (!canUse) return;

    // Reset transcript & use first slot from the sequence
    accumulatedTranscript.current = '';
    const seqToUse = sequence || interviewSequence;
    if (!seqToUse || seqToUse.length === 0) {
      console.error('No interview sequence available');
      return;
    }
    const firstSlot = seqToUse[0];
    if (!firstSlot || !firstSlot.question) {
      console.error('First slot has no question');
      return;
    }

    setCurrentQuestion(firstSlot.question);
    setCurrentMode('ai-interviewer');
    setCurrentView('ai-interviewer');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setUserAnswer('');
    setSpokenAnswer('');
    flushSync(() => {
      setFeedback(null);
    });
    setConversationHistory([]);
    setFollowUpQuestion(null);
    setExchangeCount(0);
    setPendingMode(null);

    // BUG 7 FIX: Usage now tracked AFTER successful feedback (not at session start)
    // Prevents charging users for failed API calls or abandoned sessions

    // Start interview
    setTimeout(() => { speakText(firstSlot.question.question); }, 500);
  };

  /**
   * Swap the current question for another of the same slot type.
   * Preserves the rest of the sequence and the seed.
   */
  const handleSwapQuestion = () => {
    if (!interviewSequence || interviewSequence.length === 0) return;
    let pool = getFilteredQuestions(questions, currentUser?.id);
    pool = pool.filter(q => !q.question_group || activeGroups.has(q.question_group));
    if (pool.length === 0) pool = getFilteredQuestions(questions, currentUser?.id);

    const newSequence = swapQuestionInSequence(interviewSequence, sequenceIndex, pool, sessionSeed);
    setInterviewSequence(newSequence);
    const newQuestion = newSequence[sequenceIndex]?.question;
    if (!newQuestion) {
      alert('No alternative question available for this slot.');
      return;
    }
    setCurrentQuestion(newQuestion);
    setUserAnswer('');
    setSpokenAnswer('');
    setConversationHistory([]);
    setFollowUpQuestion(null);
    setExchangeCount(0);
    setFeedback(null);
    setTimeout(() => { speakText(newQuestion.question); }, 300);
  };

  /**
   * Advance to the next question in the sequence after the current one is done.
   * Called from handleAIInterviewerSubmit when the backend signals continue_conversation: false
   * AND there are still questions remaining in the sequence.
   */
  const advanceToNextSlot = () => {
    const nextIndex = sequenceIndex + 1;
    if (nextIndex >= interviewSequence.length) {
      console.log('🏁 Interview sequence complete');
      return false; // signal to caller: show final feedback
    }
    const nextSlot = interviewSequence[nextIndex];
    if (!nextSlot || !nextSlot.question) return false;

    console.log(`➡️  Advancing to slot ${nextIndex + 1}/${interviewSequence.length}: ${nextSlot.label}`);
    setSequenceIndex(nextIndex);
    setCurrentQuestion(nextSlot.question);
    setUserAnswer('');
    setSpokenAnswer('');
    setConversationHistory([]);
    setFollowUpQuestion(null);
    setExchangeCount(0);
    // Do NOT clear feedback — we'll show aggregated at the end
    // Speak the next question with a transition
    const transition = nextIndex === interviewSequence.length - 1
      ? "One last question. "
      : "Great. Next question. ";
    setTimeout(() => { speakText(transition + nextSlot.question.question); }, 500);
    return true; // signal to caller: we advanced, don't show feedback
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

    // AUTHORITATIVE FIX: Server-side usage check (cannot be bypassed)
    const canUse = await checkUsageServerSide('practice_mode', 'Practice Mode');
    if (!canUse) return;
    
    // Set UI state IMMEDIATELY (no await blocking)
    accumulatedTranscript.current = '';
    let pool = getFilteredQuestions(questions, currentUser?.id);
    // Apply question group filter
    pool = pool.filter(q => !q.question_group || activeGroups.has(q.question_group));
    if (pool.length === 0) pool = getFilteredQuestions(questions, currentUser?.id); // fallback if all filtered out
    if (!pool || pool.length === 0) { console.error('No questions available'); return; }
    const randomQ = pool[Math.floor(Math.random() * pool.length)];
    setCurrentQuestion(randomQ);
    setCurrentMode('practice');
    setCurrentView('practice');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setUserAnswer('');
    setSpokenAnswer('');
    setSessionQuestions([]);
    setConfidenceRating(null);
    setTranscript('');
    flushSync(() => {
      setFeedback(null);
    });
    setPendingMode(null);

    // BUG 7 FIX: Usage now tracked AFTER successful feedback (not at session start)
    // Prevents charging users for failed API calls or abandoned sessions
    // See handlePracticeModeSubmit() for tracking location
  };

  // Navigation functions for prev/next question
  const goToNextQuestion = () => {
    if (!currentQuestion || questions.length === 0) return;
    const filtered = questions.filter(q => !q.question_group || activeGroups.has(q.question_group));
    const pool = filtered.length > 0 ? filtered : questions;
    const currentIdx = pool.findIndex(q => q.id === currentQuestion?.id);
    const nextIdx = (currentIdx + 1) % pool.length;
    const nextQ = pool[nextIdx];
    setCurrentQuestion(nextQ);
    setUserAnswer('');
    setSpokenAnswer('');
    setTranscript('');
    accumulatedTranscript.current = '';
    flushSync(() => {
      setFeedback(null);
    });
    setFollowUpQuestion(null);
    setConversationHistory([]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToPreviousQuestion = () => {
    if (!currentQuestion || questions.length === 0) return;
    const filtered = questions.filter(q => !q.question_group || activeGroups.has(q.question_group));
    const pool = filtered.length > 0 ? filtered : questions;
    const currentIdx = pool.findIndex(q => q.id === currentQuestion?.id);
    const prevIdx = (currentIdx - 1 + pool.length) % pool.length;
    const prevQ = pool[prevIdx];
    setCurrentQuestion(prevQ);
    setUserAnswer('');
    setSpokenAnswer('');
    setTranscript('');
    accumulatedTranscript.current = '';
    flushSync(() => {
      setFeedback(null);
    });
    setFollowUpQuestion(null);
    setConversationHistory([]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const startFlashcardMode = () => { if (questions.length === 0) { alert('Add questions first!'); return; } let available = questions.filter(q => !q.question_group || activeGroups.has(q.question_group)); if (available.length === 0) available = questions; if (filterCategory !== 'All') available = available.filter(q => q.category === filterCategory); if (available.length === 0) { alert('No matching questions!'); return; } const sorted = [...available].sort((a, b) => { if (a.practiceCount === 0) return -1; if (b.practiceCount === 0) return 1; return a.averageScore - b.averageScore; }); setCurrentQuestion(sorted[0]); setCurrentMode('flashcard'); setCurrentView('flashcard'); setFlashcardSide('question'); };

  // ============================================================================
  // CALLBACK FIX: Stable handlers to prevent stale closure issues
  // These handlers are defined at component level with useCallback to ensure
  // they maintain stable references across re-renders. This prevents React
  // from ignoring setState calls from "stale closures" after tab switches.
  // ============================================================================
  
  // Practice Mode Submit Handler - Stable Reference
  const handlePracticeModeSubmit = useCallback(() => {
    // P0 INSTRUMENTATION: Log entry + gate flags
    const attemptId = ++submitAttemptRef.current;
    console.log(`🔵 [Practice] Submit clicked | attemptId=${attemptId} | isAnalyzing=${isAnalyzingRef.current}`);

    // FIX: Use ref as primary source (always current), fall back to state
    const answer = (accumulatedTranscript.current || spokenAnswer || userAnswer || '').trim();
    if (!answer) {
      alert('Please provide an answer');
      return;
    }

    // AUTHORITATIVE FIX: Server-side usage check before submit (prevents in-session bypass)
    // Wrapped in promise chain to maintain stable callback reference
    return checkUsageServerSide('practice_mode', 'Practice Mode')
      .then(canUse => {
        if (!canUse) {
          console.log('🚫 Practice Mode action blocked by server - over limit');
          return Promise.reject(new Error('USAGE_LIMIT_EXCEEDED'));
        }
        // P0 FIX: Track when analyzing started (timestamp BEFORE state change)
        isAnalyzingTimestampRef.current = Date.now();
        setIsAnalyzing(true);
        console.log(`🔵 [Practice] setIsAnalyzing(true) | attemptId=${attemptId} | timestamp=${isAnalyzingTimestampRef.current}`);
        return supabase.auth.getSession();
      })
      .then(({ data: { session }, error: sessionError }) => {
        // SESSION FIX: Check if session is valid before making API call
        if (sessionError || !session?.access_token) {
          console.error('❌ No valid session for API call:', sessionError?.message || 'No session');
          throw new Error('Your session has expired. Please sign in again.');
        }
        console.log('🔐 Using session token for API call (expires:', new Date(session.expires_at * 1000).toLocaleTimeString(), ')');

        // P0 INSTRUMENTATION: Log before API call
        console.log(`🔵 [Practice] Attempting API call | attemptId=${attemptId}`);

        // RELIABILITY FIX: Use retry wrapper (3 attempts)
        return fetchWithRetry('https://tzrlpwtkrtvjpdhcaayu.supabase.co/functions/v1/ai-feedback', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            questionText: currentQuestion.question,
            userAnswer: answer,
            deliveryContext: buildDeliveryContext(answer),
            expectedBullets: currentQuestion.bullets || [],
            userContext: getUserContext(),
            mode: 'practice',
            selfEfficacyData: {
              previousScores: practiceHistory.slice(-10).map(h => h.feedback?.overall).filter(Boolean),
              streakDays: 0, // TODO Phase 3: wire to streak system
              questionsCompleted: practiceHistory.length,
              totalQuestions: questions.length,
            }
          })
        }, 3);
      })
      .then(response => {
        return response.json().then(data => ({ response, data }));
      })
      .then(({ response, data }) => {
        console.log('Full response data:', data);

        if (!response.ok) {
          console.error('Error from Supabase function:', data.error);
          // Apr 11 2026: Handle typed errors from the Anthropic retry wrapper.
          // Server returns { error: 'rate_limited'|'upstream_unavailable'|..., message: friendly, retryable: bool }
          // with HTTP 429 or 503 after the wrapper has already retried upstream 3 times.
          // We surface the friendly message directly — no client-side retry (already handled).
          if (data?.retryable && data?.message) {
            throw new Error(data.message);
          }
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

        // P0 FIX: Gate result application - ignore late responses from stale attempts
        if (attemptId !== submitAttemptRef.current) {
          console.log(`🟡 [Practice] Result SKIPPED (stale) | attemptId=${attemptId} | current=${submitAttemptRef.current}`);
          return Promise.resolve();
        }

        console.log('🎯 FLUSHSYNC FIX: Setting feedback immediately with forced commit');

        // FLUSHSYNC: Force React to commit state immediately (no batching/deferral)
        flushSync(() => {
          // LAYER 1: Set feedback state immediately (non-blocking)
          setFeedback(feedbackJson);

          // LAYER 2: Store in ref as safety net (in case flushSync doesn't work in all scenarios)
          lastFeedbackRef.current = feedbackJson;

          setPracticeHistory([
            ...practiceHistory,
            {
              question: currentQuestion.question,
              answer,
              feedback: feedbackJson,
              date: new Date().toISOString(),
            },
          ]);

          // Phase 4G: Track this question in current session for SessionReport
          setSessionQuestions(prev => [...prev, {
            question: currentQuestion.question,
            answer,
            feedback: feedbackJson,
            date: new Date().toISOString(),
          }]);
        });

        console.log('🎯 FLUSHSYNC FIX: Feedback committed to DOM, now saving to database in parallel');

        // BUG 7 FIX: Track usage AFTER successful feedback (not at session start)
        trackUsageInBackground('practiceMode', 'Practice Mode');

        // Update streak after successful session (fire-and-forget, Phase 3 Unit 1)
        updateStreakAfterSession(supabase, currentUser.id)
          .then(r => { if (r?.milestone) setStreakMilestone(r.milestone); setStreakRefreshTrigger(t => t + 1); })
          .catch(() => {});

        // Save to database in parallel (fire-and-forget)
        savePracticeSession(currentQuestion, answer, feedbackJson)
          .then(() => console.log('✅ Database save completed'))
          .catch(err => console.error('❌ Database save failed (feedback already showing):', err));

        // Return resolved promise so .catch() and .finally() still work
        return Promise.resolve();
      })
      .catch(error => {
        // P0 INSTRUMENTATION: Log error
        console.log(`🔴 [Practice] Catch error | attemptId=${attemptId} | error=${error.message}`);
        // Don't show alert for usage limit errors (already handled by server check)
        if (error.message === 'USAGE_LIMIT_EXCEEDED') {
          console.log('🚫 Practice submit cancelled - usage limit');
          return;
        }
        console.error('Feedback error:', error);
        alert('Failed to get feedback: ' + error.message);
      })
      .finally(() => {
        // P0 FIX: Only reset if this is still the current attempt (ignore late responses)
        if (attemptId !== submitAttemptRef.current) {
          console.log(`🟡 [Practice] Finally SKIPPED (stale) | attemptId=${attemptId} | current=${submitAttemptRef.current}`);
          return;
        }
        console.log(`🟢 [Practice] Finally | attemptId=${attemptId} | resetting isAnalyzing`);
        isAnalyzingTimestampRef.current = null;
        flushSync(() => {
          setIsAnalyzing(false);
        });
      });
  }, [spokenAnswer, userAnswer, currentQuestion, practiceHistory, supabase]);

  // AI Interviewer Submit Handler - Stable Reference
  const handleAIInterviewerSubmit = useCallback(() => {
    // P0 INSTRUMENTATION: Log entry + gate flags
    const attemptId = ++submitAttemptRef.current;
    console.log(`🟣 [AI Interviewer] Submit clicked | attemptId=${attemptId} | isAnalyzing=${isAnalyzingRef.current}`);

    // FIX: Use ref as primary source (always current), fall back to state
    // This fixes race condition where state hasn't updated yet after speech capture
    const answer = (accumulatedTranscript.current || spokenAnswer || userAnswer || '').trim();
    console.log('Answer being used:', answer, '| Ref:', accumulatedTranscript.current, '| State:', spokenAnswer);

    if (!answer) {
      alert('Please provide an answer (speak or type)');
      return;
    }

    // AUTHORITATIVE FIX: Server-side usage check before submit (prevents in-session bypass)
    return checkUsageServerSide('ai_interviewer', 'AI Interviewer')
      .then(canUse => {
        if (!canUse) {
          console.log('🚫 AI Interviewer action blocked by server - over limit');
          return Promise.reject(new Error('USAGE_LIMIT_EXCEEDED'));
        }
        // P0 FIX: Track when analyzing started (timestamp BEFORE state change)
        isAnalyzingTimestampRef.current = Date.now();
        setIsAnalyzing(true);
        console.log(`🟣 [AI Interviewer] setIsAnalyzing(true) | attemptId=${attemptId} | timestamp=${isAnalyzingTimestampRef.current}`);
        return supabase.auth.getSession();
      })
      .then(({ data: { session }, error: sessionError }) => {
        // SESSION FIX: Check if session is valid before making API call
        if (sessionError || !session?.access_token) {
          console.error('❌ No valid session for API call:', sessionError?.message || 'No session');
          throw new Error('Your session has expired. Please sign in again.');
        }
        // P0 INSTRUMENTATION: Log before API call
        console.log(`🟣 [AI Interviewer] Attempting API call | attemptId=${attemptId}`);
        console.log('🔐 Using session token for AI Interviewer API call');

        // RELIABILITY FIX: Use retry wrapper (3 attempts)
        return fetchWithRetry(
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
              deliveryContext: buildDeliveryContext(answer),
              expectedBullets: currentQuestion.bullets || [],
              userContext: getUserContext(),
              mode: 'ai-interviewer',
              conversationHistory: conversationHistory,
              exchangeCount: exchangeCount,
              // NEW: Structured interview format context
              interviewFormat: selectedFormat?.id || null,
              interviewStage: interviewSequence[sequenceIndex]?.stage || null,
              slotType: interviewSequence[sequenceIndex]?.slotType || null,
              questionNumber: interviewSequence.length > 0 ? sequenceIndex + 1 : null,
              totalQuestions: interviewSequence.length || null,
              selfEfficacyData: {
                previousScores: practiceHistory.slice(-10).map(h => h.feedback?.overall).filter(Boolean),
                streakDays: 0, // TODO Phase 3: wire to streak system
                questionsCompleted: practiceHistory.length,
                totalQuestions: questions.length,
              }
            }),
          },
          3 // maxAttempts
        );
      })
      .then(response => {
        return response.json().then(data => ({ response, data }));
      })
      .then(({ response, data }) => {
        console.log('Full response data:', data);

        if (!response.ok) {
          console.error('Error from Supabase function:', data.error);
          // Apr 11 2026: Handle typed errors from the Anthropic retry wrapper.
          // Same pattern as handlePracticeSubmit above. See that function for rationale.
          if (data?.retryable && data?.message) {
            throw new Error(data.message);
          }
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

        // P0 FIX: Gate result application - ignore late responses from stale attempts
        if (attemptId !== submitAttemptRef.current) {
          console.log(`🟡 [AI Interviewer] Result SKIPPED (stale) | attemptId=${attemptId} | current=${submitAttemptRef.current}`);
          return Promise.resolve();
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

          // CRITICAL: Return resolved promise so .finally() is called properly
          return Promise.resolve();

        } else {
          // CONVERSATION ENDED for this slot - build conversation summary
          const fullConversation = [
            ...conversationHistory,
            {
              question: followUpQuestion || currentQuestion.question,
              answer: answer
            }
          ];

          // STRUCTURED FORMAT: Accumulate per-slot feedback and advance through sequence
          if (interviewSequence && interviewSequence.length > 0) {
            // Save this slot's feedback to the running aggregate
            const slotFeedback = {
              slotIndex: sequenceIndex,
              slotLabel: interviewSequence[sequenceIndex]?.label,
              question: currentQuestion.question,
              conversation: fullConversation,
              feedback: feedbackJson,
            };
            setSessionFeedback(prev => [...prev, slotFeedback]);

            // Check if there are more slots to go
            const isLastSlot = sequenceIndex >= interviewSequence.length - 1;
            if (!isLastSlot) {
              // Advance to next slot — do NOT show feedback yet
              console.log(`✅ Slot ${sequenceIndex + 1} complete, advancing...`);
              setTimeout(() => advanceToNextSlot(), 600);
              return Promise.resolve();
            }
            // else fall through to show final aggregated feedback
            console.log('🏁 Final slot complete, showing session feedback');
          }

          // Create a text summary of the entire conversation (for DB save)
          const conversationSummary = fullConversation
            .map((exchange, idx) => `Q${idx + 1}: ${exchange.question}\nA${idx + 1}: ${exchange.answer}`)
            .join('\n\n');
          
          // Save with conversation history in feedback
          const feedbackWithConversation = {
            ...feedbackJson,
            conversation_history: fullConversation
          };
          
          console.log('🎯 FLUSHSYNC FIX: Setting AI interview feedback immediately with forced commit');
          
          // FLUSHSYNC: Force React to commit state immediately (no batching/deferral)
          flushSync(() => {
            setFeedback(feedbackJson);
            
            // LAYER 2: Store in ref as safety net
            lastFeedbackRef.current = feedbackJson;
            
            setPracticeHistory([
              ...practiceHistory,
              {
                question: currentQuestion.question,
                answer,
                feedback: feedbackJson,
                date: new Date().toISOString(),
              },
            ]);

            // Phase 4G: Track this question in current session for SessionReport
            setSessionQuestions(prev => [...prev, {
              question: currentQuestion.question,
              answer,
              feedback: feedbackJson,
              date: new Date().toISOString(),
            }]);
          });

          console.log('🎯 FLUSHSYNC FIX: Feedback committed to DOM, now saving AI interview to database in parallel');

          // BUG 7 FIX: Track usage AFTER successful feedback (not at session start)
          trackUsageInBackground('aiInterviewer', 'AI Interviewer');

          // Update streak after successful session (fire-and-forget, Phase 3 Unit 1)
          updateStreakAfterSession(supabase, currentUser.id)
            .then(r => { if (r?.milestone) setStreakMilestone(r.milestone); setStreakRefreshTrigger(t => t + 1); })
            .catch(() => {});

          // Save to database in parallel (fire-and-forget)
          savePracticeSession(currentQuestion, conversationSummary, feedbackWithConversation)
            .then(() => console.log('✅ AI interview database save completed'))
            .catch(err => console.error('❌ AI interview database save failed (feedback already showing):', err));

          // Return resolved promise immediately
          return Promise.resolve();
        }
      })
      .catch(error => {
        // P0 INSTRUMENTATION: Log error
        console.log(`🔴 [AI Interviewer] Catch error | attemptId=${attemptId} | error=${error.message}`);
        // Don't show alert for usage limit errors (already handled by server check)
        if (error.message === 'USAGE_LIMIT_EXCEEDED') {
          console.log('🚫 AI Interviewer submit cancelled - usage limit');
          return;
        }
        console.error('Feedback error:', error);
        alert('Failed to get feedback: ' + error.message);
      })
      .finally(() => {
        // P0 FIX: Only reset if this is still the current attempt (ignore late responses)
        if (attemptId !== submitAttemptRef.current) {
          console.log(`🟡 [AI Interviewer] Finally SKIPPED (stale) | attemptId=${attemptId} | current=${submitAttemptRef.current}`);
          return;
        }
        console.log(`🟢 [AI Interviewer] Finally | attemptId=${attemptId} | resetting isAnalyzing`);
        isAnalyzingTimestampRef.current = null;
        flushSync(() => {
          setIsAnalyzing(false);
        });
      });
  }, [
    spokenAnswer,
    userAnswer,
    currentQuestion,
    followUpQuestion,
    conversationHistory,
    exchangeCount,
    practiceHistory,
    accumulatedTranscript,
    supabase,
    getUserContext,
    speakText,
    // Structured format state
    selectedFormat,
    interviewSequence,
    sequenceIndex,
  ]);

  // ==========================================
  // RENDERS START HERE
  // ==========================================

  // OVERLAY DIALOGS - Render BEFORE view checks so they always work
  return (
    <>
      {/* TUTORIAL - Shows for new users first, but AFTER FirstTimeConsent is dismissed */}
      <Tutorial
        user={currentUser}
        isActive={showTutorial && hasAcceptedFirstTimeTerms}
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
            className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl max-w-2xl w-full p-8 shadow-lg border-2 border-teal-500/50 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-sky-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-2 text-white">Ready to Add Questions?</h2>
              <p className="text-xl text-slate-300">Choose how you'd like to build your question bank</p>
            </div>

            <div className="space-y-4 mb-6">
              {/* Option 1: AI Generator */}
              <div className="bg-white/10 backdrop-blur rounded-xl p-5 border-2 border-teal-400/50 hover:border-teal-400 transition cursor-pointer"
                onClick={() => {
                  console.log('🟣 AI Generator clicked in Add Questions Prompt');
                  setShowAddQuestionsPrompt(false);
                  setCurrentView('command-center');
                  setCommandCenterTab('bank');
                  console.log('🟣 Should navigate to Command Center (bank tab)');
                }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-sky-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1 text-white">AI Question Generator</h3>
                    <p className="text-sm text-slate-300 mb-2">
                      Enter your target role, background, and job description. AI generates personalized questions.
                    </p>
                    <span className="inline-block px-3 py-1 bg-teal-500/20 text-teal-300 text-xs font-bold rounded-full border border-teal-500/50">
                      <Star className="w-3 h-3 inline mr-1" /> RECOMMENDED
                    </span>
                  </div>
                </div>
              </div>

              {/* Option 2: Template Library */}
              <div className="bg-white/10 backdrop-blur rounded-xl p-5 border-2 border-teal-400/30 hover:border-teal-400 transition cursor-pointer"
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
                  <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Database className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1 text-white">Template Library</h3>
                    <p className="text-sm text-slate-300">
                      Import pre-built question sets for common roles (Product Manager, Software Engineer, etc.)
                    </p>
                  </div>
                </div>
              </div>

              {/* Option 3: Manual */}
              <div className="bg-white/10 backdrop-blur rounded-xl p-5 border-2 border-teal-400/30 hover:border-teal-400 transition cursor-pointer"
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
                    <p className="text-sm text-slate-300">
                      Type or paste questions directly from job postings or past interviews
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-teal-500/20 border-2 border-teal-400/50 rounded-xl p-4 mb-6">
              <p className="text-sm text-teal-200">
                <strong><Lightbulb className="w-4 h-4 inline" /> Tip:</strong> You need at least a few questions to use Practice Prompter, AI Interviewer, and Practice modes.
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
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl max-w-2xl w-full p-8 shadow-lg border border-teal-500/30">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-2">Welcome to InterviewAnswers.ai!</h2>
              <p className="text-xl text-gray-300">We've loaded 12 common interview questions so you can start immediately</p>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-6 mb-6">
              <h3 className="font-bold text-lg mb-3 text-teal-400">You can now use:</h3>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-teal-400 font-bold">✓</span>
                  <span><strong>Practice Prompter</strong> - Real-time interview assistance (works right now!)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-400 font-bold">✓</span>
                  <span><strong>AI Practice</strong> - Get feedback on your answers</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-400 font-bold">✓</span>
                  <span><strong>Flashcard Mode</strong> - Study with spaced repetition</span>
                </li>
              </ul>
            </div>

            <div className="bg-teal-900/30 rounded-xl p-6 mb-8 border border-teal-500/30">
              <h3 className="font-bold text-lg mb-3 text-teal-300"><Lightbulb className="w-4 h-4 inline" /> Pro Tip:</h3>
              <p className="text-gray-300 mb-3">
                These default questions work great, but <strong>customizing them for YOUR specific role</strong> makes 
                Practice Prompter 10x more accurate.
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
                className="flex-1 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 py-4 rounded-xl font-bold transition-all shadow-lg"
              >
                Try Practice Prompter Now! →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOMIZATION NUDGE - After sessions 4 and 6 */}
      {showCustomizationNudge && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl max-w-lg w-full p-8 shadow-lg border border-yellow-500/30">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-gray-900" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Great session!</h2>
              <p className="text-gray-300">Session #{sessionCount} complete</p>
            </div>

            <div className="bg-yellow-900/20 rounded-xl p-6 mb-6 border border-yellow-500/30">
              <h3 className="font-bold mb-3 text-yellow-300"><Lightbulb className="w-4 h-4 inline" /> Want better accuracy?</h3>
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
          <div className="bg-white rounded-xl max-w-md w-full p-8 shadow-lg">
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
                All questions, keywords, bullets, practice history, and practice session scores will be deleted.
              </p>
              <p className="text-xs text-red-600 mt-2 italic">
                Note: Your usage counts will be preserved.
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
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl max-w-lg w-full p-8 shadow-lg border border-teal-500/30">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-teal-600" />
              </div>
              <h2 className="text-2xl font-bold mb-2">All Questions Deleted!</h2>
              <p className="text-lg text-gray-300">What would you like to do next?</p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                <h3 className="font-bold text-teal-400 mb-2">Load Default Questions</h3>
                <p className="text-sm text-gray-400">
                  Get common interview questions to start using Practice Prompter immediately
                </p>
              </div>
              
              <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                <h3 className="font-bold text-teal-400 mb-2"><Trash2 className="w-4 h-4 inline" /> Keep Question Bank Empty</h3>
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
                    console.log(`✅ Loaded ${DEFAULT_QUESTIONS.length} default questions`);
                  }
                }}
                className="flex-1 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg"
              >
                Load Default Questions
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

      {/* Phase 4E: Question SparkNotes modal */}
      <QuestionSparkNotes
        question={sparkNotesQuestion}
        isOpen={!!sparkNotesQuestion}
        onClose={() => setSparkNotesQuestion(null)}
        getUserContext={getUserContext}
      />

      {/* Phase 4G: Session Report */}
      {showSessionReport && (
        <SessionReport
          sessions={sessionQuestions}
          allHistory={practiceHistory}
          questions={questions}
          onClose={() => { setShowSessionReport(false); setSessionQuestions([]); }}
          onDrill={(component) => { setShowSessionReport(false); setDrillTargetComponent(component); setCurrentView('weak-drill'); }}
          onNavigate={(view) => { setShowSessionReport(false); setSessionQuestions([]); view === 'practice' ? startPracticeMode() : setCurrentView(view); }}
        />
      )}

      {/* FIRST-TIME CONSENT - Terms & Privacy acceptance for new users */}
      {/* onAccepted sets hasAcceptedFirstTimeTerms so Tutorial waits until consent is done */}
      {currentUser && <FirstTimeConsent user={currentUser} onAccepted={() => { console.log('✅ User accepted Terms & Privacy'); setHasAcceptedFirstTimeTerms(true); }} onAlreadyAccepted={() => setHasAcceptedFirstTimeTerms(true)} />}

      {/* LIVE PROMPTER WARNING - Shows before activating prompter */}
      {showLivePrompterWarning && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 overflow-y-auto">
          <div 
            className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-auto shadow-lg my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="text-center flex-1">
                  <span className="text-5xl">⚠️</span>
                </div>
                <button
                  onClick={() => {
                    console.log('❌ Practice Prompter warning canceled via X');
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
                Practice Prompter - Legal Warning
              </h2>
              
              <p className="text-gray-700 mb-3 text-sm text-center">
                You're about to use Practice Prompter during real interviews.
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

              <div className="bg-green-50 rounded p-3 mb-3 text-center">
                <p className="text-xs text-green-800">
                  <strong>Recommended:</strong> Use for practice only, not actual interviews.
                </p>
              </div>

              {/* Browser compatibility notice */}
              <div className="bg-teal-50 border-l-4 border-teal-400 rounded p-3 mb-4">
                <p className="font-bold text-teal-900 text-xs mb-1"><Globe className="w-3 h-3 inline" /> Browser Compatibility:</p>
                <p className="text-teal-800 text-xs mb-2">
                  Voice recognition works in:
                </p>
                <div className="flex flex-wrap gap-1 mb-2">
                  <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs font-medium">✓ Chrome (desktop/Android)</span>
                  <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs font-medium">✓ Safari</span>
                  <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs font-medium">✓ Samsung Internet (Android)</span>
                </div>
                <p className="text-red-600 text-xs font-medium mb-1">
                  <Smartphone className="w-3 h-3 inline" /> iPhone users: Use <strong>Safari</strong> only. Chrome, Edge, and Firefox on iPhone do not support voice.
                </p>
                <p className="text-teal-700 text-xs">
                  <strong>Not supported for voice:</strong> Edge, Firefox, Opera, Brave.
                  Text search and typing always work in all browsers.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    console.log('❌ Practice Prompter warning canceled');
                    setShowLivePrompterWarning(false);
                    setPendingMode(null);
                  }}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-lg text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    console.log('✅ User accepted Practice Prompter warning');
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

    // FEATURE FLAG: HomePageV2 Hero+Feed layout.
    // Enable in browser console: localStorage.setItem('isl_home_v2', '1')
    // Disable: localStorage.removeItem('isl_home_v2')
    const useHomeV2 = typeof window !== 'undefined' && localStorage.getItem('isl_home_v2') === '1';
    if (useHomeV2) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-sky-50">
          <GradientDefs />
          <HomePageV2
            currentUser={currentUser}
            userData={{ user: currentUser, tier: userTier, usage: usageStats, streak: null }}
            userTier={userTier}
            questions={questions}
            practiceHistory={practiceHistory}
            activeGroups={activeGroups}
            streakRefreshTrigger={streakRefreshTrigger}
            interviewDate={interviewDate}
            onStartPractice={startPracticeMode}
            onStartAIInterviewer={startAIInterviewer}
            onStartPrompter={startPrompterMode}
            onStartFlashcard={startFlashcardMode}
            onNavigate={(view) => setCurrentView(view)}
            onOpenCoachPanel={() => setShowCoachPanel(true)}
            onOpenUsageDashboard={() => setShowUsageDashboard(true)}
            onOpenPricing={() => setShowPricingPage(true)}
            onOpenProfileMenu={() => setShowProfileDropdown(true)}
          />
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-sky-50">
        <GradientDefs />
        {/* Trial banner removed — free tier is the new onramp */}
        <div className="container mx-auto px-4 pt-6 pb-8">

          {/* Profile Menu - Top Right Corner */}
          <div className="flex justify-end mb-6">
            <div className="relative">
              <button
                data-tutorial="menu"
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="flex items-center gap-2 bg-white hover:bg-slate-50 rounded-full px-4 py-2 text-slate-700 transition-all border border-slate-200 shadow-sm"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-full flex items-center justify-center font-bold text-sm text-white">
                  {currentUser?.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span className={`transition-transform text-sm ${showProfileDropdown ? 'rotate-180' : ''}`}>▼</span>
              </button>

              {/* Dropdown - UNCHANGED */}
              {showProfileDropdown && (
                <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-xl shadow-lg overflow-hidden z-50">
                  <div className="bg-gradient-to-r from-teal-600 to-emerald-600 p-4 text-white">
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
                    <TrendingUp className="w-5 h-5 text-teal-600" />
                    <span className="font-semibold">My Usage</span>
                  </button>
                  {userTier === 'free' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowProfileDropdown(false);
                        setShowPricingPage(true);
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-teal-50 transition flex items-center gap-3 text-teal-600 border-b border-gray-100 font-semibold"
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
                    <Settings className="w-5 h-5 text-teal-600" />
                    <span className="font-semibold">Settings</span>
                  </button>
                  <button
                    onClick={async (e) => {
                      e.stopPropagation();
                      if (confirm('Are you sure you want to sign out?')) {
                        setShowProfileDropdown(false);
                        console.log('🚪 Starting sign out...');

                        // Helper function to do local cleanup and redirect
                        const forceLocalSignOut = () => {
                          console.log('🧹 Forcing local sign out cleanup...');
                          // Clear all localStorage except API key
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
                        };

                        // SIGN OUT FIX: Don't await anything that might hang
                        // Just do local cleanup FIRST, then fire-and-forget server signout
                        try {
                          // Fire and forget - don't await server-side signout
                          supabase.auth.signOut({ scope: 'global' }).catch(() => {});
                          console.log('🚀 Server sign out triggered (fire and forget)');
                        } catch (e) {
                          // Ignore any errors
                        }

                        // Always do local cleanup immediately
                        forceLocalSignOut();
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
          <div className="text-center mb-4 sm:mb-6">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-navy-700 font-['DM_Sans'] mb-1 sm:mb-2 tracking-tight">InterviewAnswers.ai</h1>
            <p className="text-base sm:text-lg md:text-xl text-slate-500 font-medium">Master Your Interview Answers with AI</p>

            {/* Track Switcher — only shown in targeted native builds, hidden on web */}
            {showNursingFeatures() && isTargetedBuild() && (
            <div className="flex items-center justify-center gap-1 mt-3 bg-slate-100 rounded-full p-1 max-w-xs mx-auto border border-slate-200">
              <span className="flex-1 text-center px-4 py-2 rounded-full text-sm font-semibold bg-white text-teal-700 shadow-sm">
                General
              </span>
              <a href="/nursing" className="flex-1 text-center px-4 py-2 rounded-full text-sm font-semibold text-slate-500 hover:text-slate-700 hover:bg-white/60 transition-all no-underline">
                🩺 Nursing
              </a>
            </div>
            )}
          </div>

          {/* IRS Hero + Score Trend side-by-side on lg:, stacked on mobile.
              FIXED 2026-04-09: was two full-width banners creating "panel soup" on desktop.
              Viewport auditor flagged this as the #1 layout fix. */}
          <div className={`${practiceHistory.length >= 2 ? 'grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5' : ''} mb-4 sm:mb-6`}>
            <IRSDisplay refreshTrigger={streakRefreshTrigger} />
            {practiceHistory.length >= 2 && (
              <ScoreTrendSparkline
                practiceHistory={practiceHistory}
                onClick={() => {
                  setCurrentView('command-center');
                  setCommandCenterTab('progress');
                }}
              />
            )}
          </div>

          {/* Compact Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 sm:gap-3 mb-4 sm:mb-6">
            <div className="bg-white rounded-xl p-3 sm:p-4 text-slate-800 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 border border-slate-200 shadow-sm cursor-pointer" onClick={() => {
              setCurrentView('command-center');
              setCommandCenterTab('bank');
            }}>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-teal-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                  <QuestionsStatIcon size={24} />
                </div>
                <div className="min-w-0">
                  <p className="text-2xl font-bold leading-tight text-slate-800">{questions.length}</p>
                  <p className="text-xs text-slate-500 leading-tight font-medium">Questions</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-3 sm:p-4 text-slate-800 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 border border-slate-200 shadow-sm cursor-pointer" onClick={() => {
              setCurrentView('command-center');
              setCommandCenterTab('progress');
            }}>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-teal-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                  <SessionsStatIcon size={24} />
                </div>
                <div className="min-w-0">
                  <p className="text-2xl font-bold leading-tight text-slate-800">{practiceHistory.length}</p>
                  <p className="text-xs text-slate-500 leading-tight font-medium">Sessions</p>
                </div>
              </div>
            </div>
            {/* Usage Dashboard Link Card */}
            <div
              className="bg-white rounded-xl p-3 sm:p-4 text-slate-800 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer border border-slate-200 shadow-sm"
              onClick={() => setShowUsageDashboard(true)}
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                  <UnlimitedStatIcon size={24} />
                </div>
                <div className="min-w-0">
                  <p className="text-2xl font-bold leading-tight text-slate-800">
                    {(userTier === 'pro' || userTier === 'general_pass' || userTier === 'annual' || userTier === 'beta') ? '∞' : 'View'}
                  </p>
                  <p className="text-xs text-slate-500 leading-tight font-medium whitespace-nowrap">
                    {(userTier === 'pro' || userTier === 'general_pass' || userTier === 'annual' || userTier === 'beta') ? 'Unlimited' : 'Usage'}
                  </p>
                </div>
              </div>
            </div>
            {/* Days Until Interview Card */}
            <div
              className="bg-white rounded-xl p-3 sm:p-4 text-slate-800 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer border border-slate-200 shadow-sm"
              onClick={() => {
                setCurrentView('command-center');
                setCommandCenterTab('prep');
              }}
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                  <DaysStatIcon size={24} />
                </div>
                <div className="min-w-0">
                  <p className="text-2xl font-bold leading-tight text-slate-800">
                    {interviewDate
                      ? (() => {
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          const interview = new Date(interviewDate + 'T00:00:00');
                          const diffTime = interview.getTime() - today.getTime();
                          const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
                          return Math.max(0, diffDays);
                        })()
                      : '—'
                    }
                  </p>
                  <p className="text-xs text-slate-500 leading-tight font-medium whitespace-nowrap">
                    {interviewDate ? 'Days' : 'Set Date'}
                  </p>
                </div>
              </div>
            </div>
            {/* Streak Card — Phase 3 Unit 1 */}
            <StreakDisplay refreshTrigger={streakRefreshTrigger} variant="light" />
          </div>

          {/* Milestone Toast — renders nothing when no milestone */}
          <MilestoneToast milestone={streakMilestone} onDismiss={() => setStreakMilestone(null)} />

          {/* Quick Start Tip - Enhanced */}
          {questions.length === 0 && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 text-slate-800 mb-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="text-4xl font-bold text-navy-700">Welcome</div>
                <div className="flex-1">
                  <p className="text-xl font-black mb-2">Welcome{currentUser?.user_metadata?.full_name ? `, ${currentUser.user_metadata.full_name.split(' ')[0]}` : ''}! Let's build your confidence.</p>
                  <p className="text-base text-slate-600 font-medium mb-4">Start with a quick practice or explore your question bank.</p>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => startPracticeMode()}
                      className="bg-teal-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-teal-700 transition-all shadow-md"
                    >
                      Start your first practice →
                    </button>
                    <button
                      onClick={() => setCurrentView('command-center')}
                      className="bg-white text-slate-700 px-5 py-3 rounded-lg font-semibold hover:bg-slate-50 transition-all border border-slate-200"
                    >
                      Explore question bank
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Archetype-Based Personalized CTA — Phase 2B */}
          <ArchetypeCTA onAction={(action, archetype) => {
            if (action === 'practice') startPracticeMode();
            else if (action === 'assessment') setCurrentView('command-center');
            else if (action === 'tracks' && showNursingFeatures()) window.location.href = '/nursing';
          }} />

          {/* Journey Progress — 5-step prep milestone tracker */}
          <JourneyProgress
            practiceHistory={practiceHistory}
            questions={questions}
            getUserContext={getUserContext}
            onNavigate={(view) => view === 'practice' ? startPracticeMode() : setCurrentView(view)}
          />

          {/* Phase 4: Smart Next Step Recommendation */}
          {(() => {
            const ctx = getUserContext();
            const practicedTexts = new Set(practiceHistory.map(s => s.question));
            const coverage = questions.length > 0 ? Math.round((practicedTexts.size / questions.length) * 100) : 0;
            const hasStories = (() => { try { return JSON.parse(localStorage.getItem('isl_stories') || '[]').length > 0; } catch { return false; } })();
            const hasJD = !!(ctx.jobDescription && ctx.jobDescription.length > 20);
            const hasCompany = !!(ctx.targetCompany && ctx.targetCompany.length > 1);
            const daysUntil = (() => {
              if (!ctx.interviewDate) return null;
              const today = new Date(); today.setHours(0,0,0,0);
              const interview = new Date(ctx.interviewDate + 'T00:00:00');
              return Math.max(0, Math.round((interview - today) / 86400000));
            })();

            let rec = null;
            if (daysUntil === 0) {
              rec = { icon: <Star className="w-5 h-5 inline text-rose-500" />, text: "It's interview day! Review your prep and breathe.", action: 'interview-day', btn: 'Enter Day Mode', color: 'from-rose-500 to-pink-500', bg: 'from-rose-50 to-pink-50', border: 'border-rose-200' };
            } else if (questions.length === 0) {
              rec = null; // Welcome banner handles this
            } else if (!hasJD && questions.length > 0) {
              rec = { icon: <ClipboardList className="w-5 h-5 inline text-sky-500" />, text: 'Decode your job description to unlock tailored questions and strategy.', action: 'jd-decoder', btn: 'Decode JD', color: 'from-sky-500 to-blue-500', bg: 'from-sky-50 to-blue-50', border: 'border-sky-200' };
            } else if (practiceHistory.length === 0) {
              rec = { icon: <Target className="w-5 h-5 inline text-teal-500" />, text: 'Start your first practice session to build momentum.', action: 'practice', btn: 'Start Practicing', color: 'from-teal-500 to-emerald-500', bg: 'from-teal-50 to-emerald-50', border: 'border-teal-200' };
            } else if (!hasStories && practiceHistory.length >= 5) {
              rec = { icon: <BookOpen className="w-5 h-5 inline text-emerald-500" />, text: 'You\'ve practiced enough to build your Story Bank — 7 stories cover 50 questions.', action: 'story-bank', btn: 'Build Stories', color: 'from-emerald-500 to-teal-500', bg: 'from-emerald-50 to-teal-50', border: 'border-emerald-200' };
            } else if (coverage < 50 && practiceHistory.length >= 3) {
              rec = { icon: <BarChart2 className="w-5 h-5 inline text-amber-500" />, text: `You've covered ${coverage}% of your questions. Keep going to build full coverage.`, action: 'practice', btn: 'Practice More', color: 'from-amber-500 to-orange-500', bg: 'from-amber-50 to-orange-50', border: 'border-amber-200' };
            } else if (daysUntil !== null && daysUntil <= 3 && daysUntil > 0) {
              rec = { icon: '🔥', text: `${daysUntil} day${daysUntil !== 1 ? 's' : ''} until your interview! Focus on your weakest areas.`, action: 'weak-drill', btn: 'STAR Drill', color: 'from-orange-500 to-red-500', bg: 'from-orange-50 to-red-50', border: 'border-orange-200' };
            }

            if (!rec) return null;
            return (
              <div className={`mb-4 sm:mb-6 bg-gradient-to-r ${rec.bg} rounded-xl p-3.5 sm:p-4 border ${rec.border} cursor-pointer hover:shadow-md transition-all`}
                onClick={() => rec.action === 'practice' ? startPracticeMode() : setCurrentView(rec.action)}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl flex-shrink-0">{rec.icon}</span>
                  <p className="text-xs sm:text-sm text-slate-700 font-medium flex-1">{rec.text}</p>
                  <span className={`px-3 py-1.5 bg-gradient-to-r ${rec.color} text-white text-xs font-bold rounded-lg shadow-sm flex-shrink-0 whitespace-nowrap`}>
                    {rec.btn}
                  </span>
                </div>
              </div>
            );
          })()}

          {/* Practice Modes — PRIMARY ACTIONS */}
          <div className="mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-navy-700 mb-1 tracking-tight font-['DM_Sans']">Practice</h2>
            <p className="text-slate-500 text-xs sm:text-sm mb-3 font-medium">Build your skills with hands-on training</p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
              {/* Practice Prompter */}
              <div className="bg-white rounded-xl shadow-sm p-4 sm:p-5 lg:p-6 transition-all duration-200 hover:shadow-md active:scale-[0.98] cursor-pointer group border border-slate-200/80 hover:border-teal-300">
                <div className="text-center flex flex-col h-full">
                  <IconContainer color="teal" size="lg" className="mx-auto mb-3 sm:mb-4">
                    <PrompterIcon size={28} gradient="teal" />
                  </IconContainer>
                  <h3 className="text-base sm:text-lg lg:text-xl font-bold mb-1 sm:mb-2 text-navy-700">Practice Prompter</h3>
                  <p className="text-slate-500 text-xs sm:text-sm mb-3 sm:mb-4 flex-1 font-medium">Real-time bullet prompts</p>
                  <button onClick={(e) => { e.stopPropagation(); startPrompterMode(); }} onTouchEnd={(e) => { e.stopPropagation(); e.preventDefault(); startPrompterMode(); }} className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-semibold py-2.5 sm:py-3 lg:py-3.5 px-4 rounded-lg transition-all shadow-sm hover:shadow-md text-sm sm:text-base active:scale-[0.98]">
                    Start Practice
                  </button>
                </div>
              </div>

              {/* AI Interviewer */}
              <div className="bg-white rounded-xl shadow-sm p-4 sm:p-5 lg:p-6 transition-all duration-200 hover:shadow-md active:scale-[0.98] cursor-pointer group border border-slate-200/80 hover:border-slate-300">
                <div className="text-center flex flex-col h-full">
                  <IconContainer color="navy" size="lg" className="mx-auto mb-3 sm:mb-4">
                    <InterviewerIcon size={28} gradient="navy" />
                  </IconContainer>
                  <h3 className="text-base sm:text-lg lg:text-xl font-bold mb-1 sm:mb-2 text-navy-700">AI Interviewer</h3>
                  <p className="text-slate-500 text-xs sm:text-sm mb-3 sm:mb-4 flex-1 font-medium">Realistic interview practice</p>
                  <button onClick={(e) => { e.stopPropagation(); startAIInterviewer(); }} onTouchEnd={(e) => { e.stopPropagation(); e.preventDefault(); startAIInterviewer(); }} className="w-full bg-gradient-to-r from-slate-700 to-slate-900 hover:from-slate-800 hover:to-slate-950 text-white font-semibold py-2.5 sm:py-3 lg:py-3.5 px-4 rounded-lg transition-all shadow-sm hover:shadow-md text-sm sm:text-base active:scale-[0.98]">
                    Start Interview
                  </button>
                </div>
              </div>

              {/* Practice Mode */}
              <div className="bg-white rounded-xl shadow-sm p-4 sm:p-5 lg:p-6 transition-all duration-200 hover:shadow-md active:scale-[0.98] cursor-pointer group border border-slate-200/80 hover:border-teal-300">
                <div className="text-center flex flex-col h-full">
                  <IconContainer color="teal" size="lg" className="mx-auto mb-3 sm:mb-4">
                    <PracticeIcon size={28} gradient="teal" />
                  </IconContainer>
                  <h3 className="text-base sm:text-lg lg:text-xl font-bold mb-1 sm:mb-2 text-navy-700">Practice</h3>
                  <p className="text-slate-500 text-xs sm:text-sm mb-3 sm:mb-4 flex-1 font-medium">AI-powered feedback</p>
                  <button onClick={(e) => { e.stopPropagation(); startPracticeMode(); }} onTouchEnd={(e) => { e.stopPropagation(); e.preventDefault(); startPracticeMode(); }} className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-semibold py-2.5 sm:py-3 lg:py-3.5 px-4 rounded-lg transition-all shadow-sm hover:shadow-md text-sm sm:text-base active:scale-[0.98]">
                    Start Session
                  </button>
                </div>
              </div>

              {/* Flashcard */}
              <div className="bg-white rounded-xl shadow-sm p-4 sm:p-5 lg:p-6 transition-all duration-200 hover:shadow-md active:scale-[0.98] cursor-pointer group border border-slate-200/80 hover:border-amber-300">
                <div className="text-center flex flex-col h-full">
                  <IconContainer color="amber" size="lg" className="mx-auto mb-3 sm:mb-4">
                    <FlashcardIcon size={28} gradient="amber" />
                  </IconContainer>
                  <h3 className="text-base sm:text-lg lg:text-xl font-bold mb-1 sm:mb-2 text-navy-700">Flashcards</h3>
                  <p className="text-slate-500 text-xs sm:text-sm mb-3 sm:mb-4 flex-1 font-medium">Quick memory drill</p>
                  <button onClick={(e) => { e.stopPropagation(); startFlashcardMode(); }} onTouchEnd={(e) => { e.stopPropagation(); e.preventDefault(); startFlashcardMode(); }} className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold py-2.5 sm:py-3 lg:py-3.5 px-4 rounded-lg transition-all shadow-sm hover:shadow-md text-sm sm:text-base active:scale-[0.98]">
                    Start Review
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Learn & Listen */}
          <div className="mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-navy-700 mb-1 tracking-tight font-['DM_Sans']">Learn & Listen</h2>
            <p className="text-xs text-slate-500 mb-3 font-medium">Master interview skills at your own pace</p>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <button
                onClick={() => setCurrentView('learn')}
                onTouchEnd={(e) => { e.preventDefault(); setCurrentView('learn'); }}
                className="bg-gradient-to-br from-teal-600 to-emerald-600 rounded-xl p-4 sm:p-5 text-left text-white hover:shadow-lg hover:shadow-teal-500/20 hover:scale-[1.02] transition-all active:scale-[0.98] relative overflow-hidden group"
              >
                <span className="absolute top-2.5 right-2.5 px-1.5 py-0.5 bg-white/20 text-white rounded text-[9px] font-bold">NEW</span>
                <LearnIcon size={28} gradient="teal" className="mb-2" />
                <p className="text-sm sm:text-base font-bold">Learn</p>
                <p className="text-[10px] sm:text-xs text-white/70 mt-0.5">25 lessons • Quizzes • Daily goals</p>
              </button>
              <button
                onClick={() => setCurrentView('prep-radio')}
                onTouchEnd={(e) => { e.preventDefault(); setCurrentView('prep-radio'); }}
                className="bg-gradient-to-br from-slate-700 to-slate-900 rounded-xl p-4 sm:p-5 text-left text-white hover:shadow-lg hover:shadow-slate-500/20 hover:scale-[1.02] transition-all active:scale-[0.98] overflow-hidden group"
              >
                <RadioIcon size={28} gradient="navy" className="mb-2" />
                <p className="text-sm sm:text-base font-bold">Prep Radio</p>
                <p className="text-[10px] sm:text-xs text-white/70 mt-0.5">8 playlists • Hands-free audio prep</p>
              </button>
            </div>
          </div>

          {/* Tools */}
          <div className="mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-navy-700 mb-1 tracking-tight font-['DM_Sans']">Tools</h2>
            <p className="text-xs text-slate-500 mb-3 font-medium">Research, strategize, and prepare</p>
            <div className="grid grid-cols-4 gap-2 sm:gap-3 mb-2 sm:mb-3">
              {[
                { view: 'jd-decoder', icon: <DecoderIcon size={20} gradient="teal" />, label: 'JD Decoder', desc: 'Analyze job descriptions', badge: 'AI' },
                { view: 'story-bank', icon: <StoryBankIcon size={20} gradient="teal" />, label: 'Story Bank', desc: 'Build STAR stories', badge: null },
                { view: 'interview-coach', icon: <CoachIcon size={20} gradient="slate" />, label: 'AI Coach', desc: 'Guided strategy', badge: null },
                { view: 'weak-drill', icon: <StarDrillIcon size={20} gradient="amber" />, label: 'STAR Drill', desc: 'Target weak areas', badge: null },
              ].map(tool => (
                <button
                  key={tool.view}
                  onClick={() => tool.view === 'interview-coach' ? setShowCoachPanel(true) : setCurrentView(tool.view)}
                  onTouchEnd={(e) => { e.preventDefault(); tool.view === 'interview-coach' ? setShowCoachPanel(true) : setCurrentView(tool.view); }}
                  className="bg-white rounded-xl p-2.5 sm:p-3 border border-slate-200/80 hover:border-slate-300 hover:shadow-md transition-all text-center group relative"
                >
                  {tool.badge && (
                    <span className="absolute top-1.5 right-1.5 px-1 py-0.5 bg-teal-50 text-teal-700 rounded text-[8px] font-bold">{tool.badge}</span>
                  )}
                  <div className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center mx-auto mb-1 sm:mb-1.5">
                    {tool.icon}
                  </div>
                  <p className="text-[10px] sm:text-xs font-semibold text-slate-700 leading-tight">{tool.label}</p>
                  <p className="text-[8px] sm:text-[9px] text-slate-400 leading-tight mt-0.5 hidden sm:block">{tool.desc}</p>
                </button>
              ))}
            </div>
            <div className="grid grid-cols-5 gap-2 sm:gap-3">
              {[
                { view: 'portfolio', icon: <PortfolioIcon size={20} gradient="slate" />, label: 'Portfolio', desc: 'Your past work' },
                { view: 'interview-day', icon: <InterviewDayIcon size={20} gradient="amber" />, label: 'Day Mode', desc: 'Interview day prep' },
                { view: 'follow-up-email', icon: <FollowUpIcon size={20} gradient="teal" />, label: 'Follow-Up', desc: 'Thank-you email' },
                { view: 'flashcard', icon: <FlashcardCompactIcon size={20} gradient="amber" />, label: 'Flashcards', desc: 'Quick review' },
              ].map(tool => (
                <button
                  key={tool.view}
                  onClick={() => tool.view === 'flashcard' ? startFlashcardMode() : setCurrentView(tool.view)}
                  onTouchEnd={(e) => { e.preventDefault(); tool.view === 'flashcard' ? startFlashcardMode() : setCurrentView(tool.view); }}
                  className="bg-white rounded-xl p-2.5 sm:p-3 border border-slate-200/80 hover:border-slate-300 hover:shadow-md transition-all text-center group"
                >
                  <div className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center mx-auto mb-1 sm:mb-1.5">
                    {tool.icon}
                  </div>
                  <p className="text-[10px] sm:text-xs font-semibold text-slate-700 leading-tight">{tool.label}</p>
                  <p className="text-[8px] sm:text-[9px] text-slate-400 leading-tight mt-0.5 hidden sm:block">{tool.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Command Center */}
          <div data-tutorial="command-center" className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl hover:shadow-lg p-4 sm:p-5 lg:p-6 transition-all duration-200 cursor-pointer group" onClick={() => setCurrentView('command-center')} onTouchEnd={(e) => { e.preventDefault(); setCurrentView('command-center'); }}>
            <div className="flex items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                <div className="flex-shrink-0"><CommandCenterIcon size={32} gradient="teal" /></div>
                <div className="text-white min-w-0 flex-1">
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-0.5 sm:mb-1">Command Center</h3>
                  <p className="text-xs sm:text-sm text-slate-400 font-medium">Track progress, manage questions, prep interviews</p>
                </div>
              </div>
              <div className="flex items-center gap-1 sm:gap-2 text-white font-bold flex-shrink-0 group-hover:translate-x-1 transition-transform duration-300">
                <span className="hidden sm:inline text-sm lg:text-lg text-slate-400">Open</span>
                <ChevronRight className="w-5 h-5 text-slate-500" />
              </div>
            </div>
          </div>

          {/* Quick Add Question FAB removed — use Question Catalog in Command Center instead */}

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
            <div className="w-20 h-20 bg-teal-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Target className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Customize to Continue</h2>
            <p className="text-gray-300 mb-6">
              You've used your 7 free sessions! Customize at least 3 questions with 5+ keywords to unlock unlimited access.
            </p>
            
            <div className="bg-gray-800 rounded-xl p-6 mb-6">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-3xl font-bold text-teal-400">{status.customizedQuestions}/3</div>
                  <div className="text-sm text-gray-400">Custom Questions</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-teal-400">{status.questionsWithKeywords}/3</div>
                  <div className="text-sm text-gray-400">With 5+ Keywords</div>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => {
                setCurrentView('command-center');
                setCommandCenterTab('bank');
              }}
              className="bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg"
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
            <div className="w-20 h-20 bg-teal-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
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
              // CRITICAL: Comprehensive cleanup when exiting Practice Prompter
              console.log('🚪 Exiting Practice Prompter - full cleanup');
              
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
              {/* System Audio Toggle - for Teams/Zoom calls (desktop only, not available in native app) */}
              {!interviewSessionActive && !document.documentElement.classList.contains('capacitor') && (
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
                      ? 'bg-teal-500 hover:bg-teal-600 text-white'
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
                  className="bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-all shadow-lg"
                >
                  <Mic className="w-5 h-5" />
                  Start Interview
                </button>
              ) : (
                <>
                  <div className="flex items-center gap-3 bg-teal-500/20 px-4 py-2 rounded-lg border-2 border-teal-500">
                    <div className={`w-3 h-3 rounded-full ${isCapturing ? 'bg-red-500 animate-pulse' : 'bg-teal-500'}`}></div>
                    <span className="font-bold text-sm">
                      {isCapturing ? <><span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> CAPTURING...</> : <><span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> Session Active</>}
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

          {/* Browser compatibility reminder for unsupported browsers */}
          <SpeechUnavailableWarning variant="banner" darkMode />

          {!matchedQuestion ? (
            <div className="text-center py-20">
              <div className="w-32 h-32 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8">
                <Mic className="w-16 h-16 text-white" />
              </div>
              <h2 className="text-4xl font-bold mb-4">Live Interview Prompter</h2>
              
              {!interviewSessionActive ? (
                <>
                  <p className="text-xl text-gray-300 mb-8">Click "Start Session" to begin</p>
                  <SpeechUnavailableWarning variant="banner" darkMode className="mt-4 mb-6 max-w-2xl mx-auto" />
                  <div className="mt-12 bg-teal-900/30 rounded-lg p-6 max-w-2xl mx-auto">
                    <h4 className="font-bold mb-3"><Lightbulb className="w-4 h-4 inline" /> Session Mode Benefits:</h4>
                    <ul className="text-left text-sm space-y-2">
                      <li><CheckCircle className="w-4 h-4 inline text-teal-400" /> Only 2 sounds (start + end) - no annoying beeps!</li>
                      <li><CheckCircle className="w-4 h-4 inline text-teal-400" /> Hold SPACEBAR to capture questions</li>
                      <li><CheckCircle className="w-4 h-4 inline text-teal-400" /> Your answers NOT recorded</li>
                      <li><CheckCircle className="w-4 h-4 inline text-teal-400" /> Clean separation between questions</li>
                      <li><CheckCircle className="w-4 h-4 inline text-teal-400" /> Works with external keyboard on mobile</li>
                    </ul>
                    {!document.documentElement.classList.contains('capacitor') && (
                      <div className="mt-4 pt-4 border-t border-teal-500/30">
                        <h5 className="font-bold mb-2 text-teal-300"><Headphones className="w-4 h-4 inline" /> For Teams/Zoom Calls:</h5>
                        <p className="text-sm text-gray-300">Click "Tab Audio" before starting to capture audio from the browser tab where your Teams/Zoom call is running.</p>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  {getBrowserInfo().hasReliableSpeech ? (
                    <>
                      <p className="text-xl text-teal-300 mb-4">Session Active - Ready to capture questions!</p>
                      <p className="text-lg text-gray-300 mb-8">Hold SPACEBAR when interviewer asks a question</p>
                    </>
                  ) : (
                    <>
                      <p className="text-xl text-teal-300 mb-4">Session Active — Use Text Search Below</p>
                      <SpeechUnavailableWarning variant="banner" darkMode className="max-w-2xl mx-auto mb-8" />
                    </>
                  )}

                  {transcript && (
                    <div className="mt-8 bg-gray-800 rounded-lg p-6 max-w-2xl mx-auto">
                      <p className="text-sm text-gray-400 mb-2">
                        {isCapturing ? <><span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> Capturing...</> : <><CheckCircle className="w-4 h-4 inline text-teal-400" /> Last captured:</>}
                      </p>
                      <p className="text-lg">{transcript}</p>
                    </div>
                  )}

                  {/* Voice instructions — only shown when speech is available */}
                  {getBrowserInfo().hasReliableSpeech && (
                  <div className="mt-12 bg-teal-900/30 rounded-lg p-6 max-w-2xl mx-auto border-2 border-teal-500/50">
                    <h4 className="font-bold mb-3 text-teal-300"><Mic className="w-4 h-4 inline" /> How to Use (Session Mode):</h4>
                    <ol className="text-left text-sm space-y-2">
                      <li>1. Interviewer asks: "Tell me about yourself"</li>
                      <li>2. <strong>Hold SPACEBAR</strong> → Mic captures question</li>
                      <li>3. <strong>Release SPACEBAR</strong> → Question processes, bullets appear!</li>
                      <li>4. Give your answer (mic paused, not recording you)</li>
                      <li>5. Repeat for next question</li>
                    </ol>
                  </div>
                  )}

                  {/* Manual text input fallback - for browsers with broken speech recognition */}
                  <div className="mt-8 max-w-2xl mx-auto">
                    <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                      <label className="block text-sm text-gray-400 mb-2">
                        🔍 Or type question keywords to search manually:
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="e.g., tell me about yourself, greatest weakness..."
                          className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && e.target.value.trim()) {
                              matchQuestion(e.target.value.trim());
                              e.target.value = '';
                            }
                          }}
                        />
                        <button
                          onClick={(e) => {
                            const input = e.target.closest('.flex').querySelector('input');
                            if (input && input.value.trim()) {
                              matchQuestion(input.value.trim());
                              input.value = '';
                            }
                          }}
                          className="bg-teal-600 hover:bg-teal-700 px-6 py-3 rounded-lg font-bold transition-colors flex-shrink-0"
                        >
                          Search
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="max-w-5xl mx-auto">
              <div className="bg-gradient-to-br from-teal-600 to-emerald-700 rounded-xl p-8 mb-6 shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                  <CheckCircle className="w-10 h-10" />
                  <h2 className="text-3xl font-bold">Matched!</h2>
                </div>
                <div className="bg-white/20 backdrop-blur rounded-lg p-6">
                  <h3 className="text-4xl font-bold">{matchedQuestion.question}</h3>
                </div>
              </div>
              <div className="bg-gray-800 rounded-xl p-8 mb-6">
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
                    className="w-full bg-teal-600 hover:bg-teal-700 py-4 rounded-lg font-bold text-lg flex items-center justify-center gap-2 mb-4"
                  >
                    {showNarrative ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
                    {showNarrative ? 'Hide' : 'Show'} Full Narrative
                  </button>
                  {showNarrative && (
                    <div className="bg-gray-800 rounded-xl p-8">
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
                <div className="absolute bottom-24 right-0 w-80 max-w-[90vw] bg-black/90 backdrop-blur-lg rounded-xl p-4 shadow-lg border border-teal-500/50 animate-fadeIn">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-3 h-3 rounded-full ${isCapturing ? 'bg-red-500 animate-pulse' : 'bg-teal-500'}`}></div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                      {isCapturing ? <><Mic className="w-3 h-3 inline" /> Listening...</> : '✓ Captured'}
                    </span>
                    {matchConfidence > 0 && !isCapturing && (
                      <span className={`ml-auto text-xs font-bold px-2 py-1 rounded ${
                        matchConfidence >= 70 ? 'bg-teal-600 text-white' : 
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
                className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
                  isCapturing
                    ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                    : 'bg-teal-500 hover:bg-teal-600'
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
    // CALLBACK FIX: Handler now defined at top level with useCallback for stable reference
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6 text-white">
            <button onClick={() => { stopSpeaking(); setCurrentView('home');
                setSpokenAnswer(''); setUserAnswer(''); setTranscript(''); setFeedback(null);
                accumulatedTranscript.current = '';
              }} className="text-gray-300 hover:text-white">← Exit</button>
            <h1 className="text-2xl font-bold">
              {selectedCuratedInterview?.title || (selectedFormat ? selectedFormat.shortName : 'AI Mock Interview')}
            </h1>
            <div className="flex items-center gap-2">
              {interviewSequence.length > 0 && (
                <button
                  onClick={handleSwapQuestion}
                  onTouchEnd={(e) => { e.preventDefault(); handleSwapQuestion(); }}
                  className="bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5"
                  title="Try a different question of the same type"
                >
                  <RotateCcw className="w-4 h-4" /> Swap
                </button>
              )}
              <button onClick={goToPreviousQuestion} className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg font-semibold flex items-center gap-1">
                ← Prev
              </button>
              <button onClick={goToNextQuestion} className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg font-semibold flex items-center gap-1">
                Next →
              </button>
            </div>
          </div>

          {/* Structured Interview Progress Bar */}
          {interviewSequence.length > 0 && (
            <div className="max-w-4xl mx-auto mb-6">
              <div className="flex items-center justify-between text-sm text-white/70 mb-2">
                <span className="font-medium">
                  Question {sequenceIndex + 1} of {interviewSequence.length}
                  {interviewSequence[sequenceIndex]?.label && (
                    <span className="ml-2 text-white/50">• {interviewSequence[sequenceIndex].label}</span>
                  )}
                </span>
                {sessionSeed && (
                  <span className="font-mono text-xs text-white/40">Session #{sessionSeed}</span>
                )}
              </div>
              <div className="flex gap-1">
                {interviewSequence.map((slot, idx) => (
                  <div
                    key={idx}
                    className={`h-1.5 flex-1 rounded-full transition-colors ${
                      idx < sequenceIndex ? 'bg-teal-400' :
                      idx === sequenceIndex ? 'bg-teal-300' :
                      'bg-white/15'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
          
          <div className="max-w-4xl mx-auto mb-8 min-h-[55vh] flex items-center justify-center">
            {/* CLOUD AVATAR CONTAINER */}
            <div ref={aiQuestionRef} className="relative bg-gradient-to-br from-teal-800/50 to-slate-800/50 backdrop-blur-lg rounded-xl p-12 shadow-lg w-full">
              {/* Animated Cloud Avatar */}
              <div className="flex justify-center mb-8">
                <div className="relative">
                  <div className={`relative w-48 h-32 transition-all duration-300 ${aiSpeaking ? 'scale-110' : 'scale-100'}`}>
                    {/* Cloud body */}
                    <div className={`absolute inset-0 rounded-full opacity-90 ${aiSpeaking ? 'bg-gradient-to-br from-teal-400 via-sky-500 to-emerald-600 animate-pulse' : 'bg-gradient-to-br from-teal-400 via-sky-500 to-teal-600'}`}></div>
                    {/* Cloud bumps */}
                    <div className={`absolute top-0 left-8 w-24 h-24 rounded-full opacity-80 ${aiSpeaking ? 'bg-teal-300' : 'bg-sky-300'}`}></div>
                    <div className={`absolute top-2 right-8 w-20 h-20 rounded-full opacity-80 ${aiSpeaking ? 'bg-emerald-300' : 'bg-teal-300'}`}></div>
                    <div className={`absolute bottom-0 left-12 w-28 h-20 rounded-full opacity-70 ${aiSpeaking ? 'bg-sky-400' : 'bg-sky-400'}`}></div>
                    {/* Face with enhanced pulse */}
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                      <Brain className={`w-16 h-16 text-white opacity-90 transition-transform duration-300 ${aiSpeaking ? 'scale-110 animate-pulse' : 'scale-100'}`} />
                    </div>
                    {/* Sound waves */}
                    {aiSpeaking && (
                      <>
                        <div className="absolute -right-8 top-1/2 transform -translate-y-1/2">
                          <div className="w-2 h-8 bg-teal-400 rounded-full animate-pulse"></div>
                        </div>
                        <div className="absolute -right-12 top-1/2 transform -translate-y-1/2">
                          <div className="w-2 h-12 bg-sky-400 rounded-full animate-pulse" style={{animationDelay: '0.1s'}}></div>
                        </div>
                        <div className="absolute -right-16 top-1/2 transform -translate-y-1/2">
                          <div className="w-2 h-6 bg-emerald-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                        </div>
                        <div className="absolute -left-8 top-1/2 transform -translate-y-1/2">
                          <div className="w-2 h-8 bg-teal-400 rounded-full animate-pulse"></div>
                        </div>
                        <div className="absolute -left-12 top-1/2 transform -translate-y-1/2">
                          <div className="w-2 h-12 bg-sky-400 rounded-full animate-pulse" style={{animationDelay: '0.1s'}}></div>
                        </div>
                        <div className="absolute -left-16 top-1/2 transform -translate-y-1/2">
                          <div className="w-2 h-6 bg-emerald-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              {/* AI Name + Voice Toggle */}
              <h3 className="text-3xl font-bold text-white text-center mb-2">
                {aiSpeaking ? <><Mic className="w-6 h-6 inline" /> AI Interviewer Speaking...</> : <><MessageSquare className="w-6 h-6 inline" /> AI Interviewer</>}
              </h3>
              <div className="flex justify-center mb-4">
                <button
                  onClick={() => {
                    const newMuted = !voiceMuted;
                    setVoiceMuted(newMuted);
                    try { localStorage.setItem('isl_voice_muted', String(newMuted)); } catch {}
                    if (newMuted && synthRef.current) { synthRef.current.cancel(); setAiSpeaking(false); setAiSubtitle(''); }
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    voiceMuted
                      ? 'bg-white/10 text-white/60 hover:bg-white/20'
                      : 'bg-teal-500/20 text-teal-300 hover:bg-teal-500/30 ring-1 ring-teal-500/40'
                  }`}
                >
                  {voiceMuted ? <><VolumeX className="w-4 h-4 inline" /> Voice Off</> : <><Volume2 className="w-4 h-4 inline" /> Voice On</>}
                  {!voiceMuted && userTier === 'free' && (
                    <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full">
                      HD Trial: {Math.max(0, 3 - parseInt(localStorage.getItem('isl_hd_voice_trials') || '0', 10))} left
                    </span>
                  )}
                </button>
              </div>
              
              {/* SUBTITLE DISPLAY */}
              <div className="relative min-h-32">
                {aiSubtitle ? (
                  <div className="bg-black/70 backdrop-blur rounded-xl p-8 border-2 border-white/30 shadow-xl">
                    <div className="flex items-start gap-4">
                      <Volume2 className="w-8 h-8 text-teal-400 flex-shrink-0 animate-pulse" />
                      <p className="text-3xl text-white font-medium leading-relaxed">"{aiSubtitle}"</p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white/20 backdrop-blur rounded-xl p-6 border-2 border-white/20">
<p className="text-2xl text-white/90 text-center italic">{followUpQuestion || currentQuestion.question}</p>
                  </div>
                )}
              </div>
              
              {/* Status */}
              <div className="mt-6 flex items-center justify-center gap-3">
                {aiSpeaking ? (
                  <>
                    <div className="w-3 h-3 bg-teal-400 rounded-full animate-ping"></div>
                    <span className="text-teal-300 font-medium">AI is asking the question...</span>
                  </>
                ) : (
                  <>
                    <div className="w-3 h-3 bg-teal-400 rounded-full"></div>
                    <span className="text-teal-300 font-medium">Ready for your answer</span>
                  </>
                )}
              </div>
            </div>
          </div>
          
          {/* INPUT SECTION - Only show when NO feedback */}
          {!feedback && (
            <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
              <h3 className="text-2xl font-bold mb-6">Your Answer:</h3>
              
              {/* SPEECH INPUT SECTION */}
              <SpeechUnavailableWarning variant="banner" />
              {getBrowserInfo().hasReliableSpeech ? (
              <div className="bg-gradient-to-r from-teal-50 to-sky-50 border-2 border-teal-300 rounded-lg p-6 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <Mic className={`w-6 h-6 ${isListening ? 'text-red-600 animate-pulse' : 'text-teal-600'}`} />
                  <h4 className="font-bold text-teal-900">
                    {isListening ? 'Listening to your answer...' : 'Answer with Voice or Text'}
                  </h4>
                </div>
                <button
                  onMouseDown={startListening}
                  onMouseUp={stopListening}
                  onTouchStart={startListening}
                  onTouchEnd={stopListening}
                  className={`w-full py-6 rounded-lg font-bold text-lg transition mb-4 ${isListening ? 'bg-red-600 text-white animate-pulse' : 'bg-teal-600 hover:bg-teal-700 text-white'}`}
                >
                  {isListening ? <><Mic className="w-5 h-5 inline" /> Release to Stop Recording</> : <><Mic className="w-5 h-5 inline" /> Hold to Speak Your Answer</>}
                </button>
                <p className="text-xs text-center text-gray-600">Hold SPACEBAR or this button to speak. Your answer will appear below.</p>
              </div>
              ) : null}
              
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
                  <p className="text-xs text-gray-500 mt-2"><BarChart2 className="w-3 h-3 inline" /> Word count: {(spokenAnswer || transcript).split(' ').filter(w => w).length}</p>
                </div>
              )}
              
{/* Text Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Or type your answer:</label>
                <textarea
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg h-32 focus:ring-2 focus:ring-teal-500"
                  placeholder="Type your answer here (or use voice above)..."
                />
                
                {/* Help Button - Below Textarea */}
                <div className="mt-2 flex justify-center">
                  {(usageStats?.tier === 'pro' || usageStats?.tier === 'beta' || usageStats?.tier === 'general_pass' || usageStats?.tier === 'annual') ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log('Help button clicked!');
                        console.log('Current question:', currentQuestion);
                        // BUG 8 FIX: Use openAnswerAssistant to enforce usage check
                        openAnswerAssistant(currentQuestion);
                      }}
                      className="text-sm bg-gradient-to-r from-teal-100 to-sky-100 hover:from-teal-200 hover:to-sky-200 text-teal-700 px-4 py-2 rounded-lg font-semibold transition flex items-center gap-2"
                    >
                      <Lightbulb className="w-4 h-4" />
                      Can't Think of an Answer? AI Can Help
                    </button>
                  ) : (
                    <button
                      onClick={(e) => { e.stopPropagation(); alert('Pro Feature\n\nGet a 30-Day Pass ($14.99) for UNLIMITED access!\n\n✓ Unlimited AI Answer Coach sessions\n✓ Unlimited AI Interview practice\n✓ Unlimited Practice Mode\n✓ No subscription — just one payment!'); }}
                      className="text-sm bg-gradient-to-r from-yellow-100 to-amber-100 hover:from-yellow-200 hover:to-amber-200 text-yellow-800 px-4 py-2 rounded-lg font-semibold transition flex items-center gap-2"
                    >
                      <Crown className="w-4 h-4" />
                      Can't Think of an Answer? Upgrade for AI Help
                    </button>
                  )}
                </div>
              </div>
              
              {/* ULTIMATE FIX: Extracted inline async to named function with promise chains */}
              <button
                onClick={() => handleAIInterviewerSubmit()}
                className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold py-4 rounded-lg disabled:opacity-50 flex items-center justify-center gap-2"
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

 {feedback && (() => {
  // Read-time chip — sums words across all renderable feedback fields, divides by 200wpm
  const _wordCount = (v) => {
    if (!v) return 0;
    if (Array.isArray(v)) return v.reduce((n, x) => n + _wordCount(x), 0);
    if (typeof v === 'object') return Object.values(v).reduce((n, x) => n + _wordCount(x), 0);
    return String(v).trim().split(/\s+/).filter(Boolean).length;
  };
  // PR 3 — count words across BOTH v1 (legacy) and v2 (new 5-field) fields
  const _totalWords =
    _wordCount(feedback.strengths) +
    _wordCount(feedback.gaps) +
    _wordCount(feedback.specific_improvements) +
    _wordCount(feedback.ideal_answer) +
    _wordCount(feedback.framework_analysis) +
    _wordCount(feedback.points_covered) +
    _wordCount(feedback.points_missed) +
    _wordCount(feedback.verdict) +
    _wordCount(feedback.fix) +
    _wordCount(feedback.strength);
  const _readMinutes = Math.max(1, Math.ceil(_totalWords / 200));
  return (
  <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-8">
    {/* AI DISCLAIMER */}
    <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded p-3 mb-4">
      <p className="text-xs text-yellow-900">
        <span className="font-semibold"><Bot className="w-4 h-4 inline" /> AI-Generated:</span> For practice only. Not professional advice.
      </p>
    </div>

    {/* Read-time chip */}
    <div className="mb-3">
      <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 text-xs font-semibold px-3 py-1 rounded-full">
        📖 ~{_readMinutes} min read
      </span>
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
          className="text-sm bg-teal-100 hover:bg-teal-200 text-teal-700 px-4 py-2 rounded-lg font-semibold transition-all"
        >
          <Zap className="w-4 h-4 inline" /> Show All
        </button>
      )}
    </div>
    
    {/* ==================== OVERALL SCORE - Always visible, animates ==================== */}
    <div className="bg-gradient-to-r from-teal-600 to-sky-600 rounded-xl p-8 text-white text-center mb-8 shadow-xl fade-in-up">
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
      {/* Phase 4M: Confidence Calibration gap */}
      {confidenceRating > 0 && getFeedbackScore(feedback) > 0 && (() => {
        const actual = getFeedbackScore(feedback);
        const predicted = confidenceRating * 2;
        const gap = Math.abs(actual - predicted);
        const msg = gap <= 1 ? 'Great self-awareness! Your confidence matched your score.'
          : actual > predicted ? 'You scored higher than expected! Trust yourself more.'
          : `You rated ${confidenceRating}/5 but scored ${actual.toFixed(1)}/10. More practice needed here.`;
        return <p className="mt-3 text-sm opacity-90">{msg}</p>;
      })()}
    </div>

    {/* ==================== PR 3 — NEW 5-FIELD COACHING CARD (v2 schema) ==================== */}
    {feedback.fix && (
      <div className="mb-6 feedback-section visible fade-in-up">
        {/* Verdict */}
        {feedback.verdict && (
          <div className="bg-gradient-to-r from-teal-50 to-sky-50 border-2 border-teal-300 rounded-xl p-5 mb-4">
            <p className="text-sm font-bold text-teal-700 mb-1 uppercase tracking-wide">Verdict</p>
            <p className="text-gray-900 text-lg leading-relaxed">{feedback.verdict}</p>
          </div>
        )}

        {/* The Fix — quote / issue / rewrite */}
        <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-5 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-6 h-6 text-amber-600" />
            <h4 className="font-bold text-amber-900 text-xl">The One Thing to Fix</h4>
          </div>
          {feedback.fix.quote && feedback.fix.quote !== 'NO_QUOTE_AVAILABLE' && (
            <div className="bg-white rounded-lg p-3 mb-3 border-l-4 border-amber-500">
              <p className="text-xs font-bold text-amber-700 mb-1 uppercase">You said</p>
              <p className="text-gray-800 italic">"{feedback.fix.quote}"</p>
            </div>
          )}
          {feedback.fix.issue && (
            <div className="mb-3">
              <p className="text-xs font-bold text-amber-700 mb-1 uppercase">Why it's weak</p>
              <p className="text-gray-800 leading-relaxed">{feedback.fix.issue}</p>
            </div>
          )}
          {feedback.fix.rewrite && (
            <div className="bg-teal-50 rounded-lg p-3 border-l-4 border-teal-500">
              <p className="text-xs font-bold text-teal-700 mb-1 uppercase">Try saying</p>
              <p className="text-teal-900 leading-relaxed font-medium">{feedback.fix.rewrite}</p>
            </div>
          )}
        </div>

        {/* Strength — last, anti-sandwich */}
        {feedback.strength && (
          <div className="bg-green-50 border-l-4 border-green-500 rounded-xl p-5 mb-4">
            <div className="flex items-start gap-3">
              <span className="text-3xl">✓</span>
              <div>
                <p className="text-xs font-bold text-green-700 mb-1 uppercase tracking-wide">What worked</p>
                <p className="text-green-900 leading-relaxed">{feedback.strength}</p>
              </div>
            </div>
          </div>
        )}

        {/* Delivery insights still useful on v2 rows */}
        <DeliveryInsights answer={spokenAnswer || userAnswer} />
      </div>
    )}

    {/* ==================== IDEAL ANSWER - Stage 1 (legacy v1 only) ==================== */}
    {!feedback.fix && feedback.ideal_answer && isSectionVisible(1) && (
      <div className={`mb-6 feedback-section ${isSectionVisible(1) ? 'visible' : ''}`}>
        <button
          onClick={() => setShowIdealAnswer(!showIdealAnswer)}
          className="w-full bg-gradient-to-r from-teal-50 to-sky-50 hover:from-teal-100 hover:to-sky-100 border-2 border-teal-300 rounded-xl p-5 flex items-center justify-between transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-teal-500 rounded-full flex items-center justify-center">
              <Lightbulb className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <span className="font-bold text-teal-900 text-lg block">Your Answer, Coached</span>
              <span className="text-sm text-teal-700">Click to compare with your response</span>
            </div>
          </div>
          <span className="text-teal-600 text-2xl font-bold">{showIdealAnswer ? '▼' : '▶'}</span>
        </button>

        {showIdealAnswer && (
          <div className="mt-4 grid md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl border-2 border-teal-200 fade-in-up">
            <div className="bg-white rounded-lg p-5 border-2 border-gray-300">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-lg">👤</span>
                </div>
                <h5 className="font-bold text-gray-900">Your Answer</h5>
              </div>
              <p className="text-gray-800 leading-relaxed text-sm">{spokenAnswer || userAnswer}</p>
            </div>

            <div className="bg-teal-50 rounded-lg p-5 border-2 border-teal-400">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center">
                  <Star className="w-4 h-4 text-white" />
                </div>
                <h5 className="font-bold text-teal-900">Strong Example</h5>
              </div>
              <p className="text-teal-900 leading-relaxed text-sm">{feedback.ideal_answer}</p>
            </div>
          </div>
        )}
      </div>
    )}

    {/* ==================== DELIVERY INSIGHTS - Phase 4B (v1 only; v2 renders it inside the coaching card) ==================== */}
    {!feedback.fix && <DeliveryInsights answer={spokenAnswer || userAnswer} />}

    {/* ==================== STRENGTHS - Stage 2 (legacy v1 only) ==================== */}
    {!feedback.fix && feedback.strengths && feedback.strengths.length > 0 && isSectionVisible(2) && (
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

    {/* ==================== GAPS - Stage 3 (legacy v1 only) ==================== */}
    {!feedback.fix && feedback.gaps && feedback.gaps.length > 0 && isSectionVisible(3) && (
      <div className={`mb-6 feedback-section ${isSectionVisible(3) ? 'visible' : ''}`}>
        <button
          onClick={() => setShowGaps(!showGaps)}
          className="w-full bg-amber-50 hover:bg-amber-100 border-2 border-amber-300 rounded-xl p-4 flex items-center justify-between transition-all mb-3"
        >
          <h4 className="font-bold text-amber-900 text-xl flex items-center gap-2">
            <TrendingUp className="w-8 h-8 text-teal-600" /> 
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

    {/* ==================== ACTION STEPS - Stage 4 (legacy v1 only) ==================== */}
    {!feedback.fix && feedback.specific_improvements && feedback.specific_improvements.length > 0 && isSectionVisible(4) && (
      <div className={`mb-6 feedback-section ${isSectionVisible(4) ? 'visible' : ''}`}>
        <div className="bg-teal-50 border-2 border-teal-300 rounded-xl p-4 mb-3">
          <h4 className="font-bold text-teal-900 text-xl flex items-center gap-2">
            <Target className="w-8 h-8 text-teal-600" /> 
            <span>Action Steps ({feedback.specific_improvements.length})</span>
          </h4>
          <p className="text-sm text-teal-700 mt-1">Specific ways to improve your answer</p>
        </div>
        
        <div className="grid gap-3 pl-4">
          {feedback.specific_improvements.map((imp, i) => (
            <div key={i} className="bg-teal-50 border-l-4 border-teal-500 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-teal-600 text-white rounded-full flex items-center justify-center text-lg font-bold">
                  {i + 1}
                </div>
                <p className="text-teal-900 flex-1 leading-relaxed">{imp}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    )}

    {/* ==================== STAR FRAMEWORK - Stage 5 (legacy v1 only) ==================== */}
    {!feedback.fix && feedback.framework_analysis && isSectionVisible(5) && (() => {
      const _starMissingRe = /missing|not provided|n\/?a|absent|—/i;
      const _fa = feedback.framework_analysis;
      const _allStarMissing =
        (!_fa.situation || _starMissingRe.test(_fa.situation)) &&
        (!_fa.task || _starMissingRe.test(_fa.task)) &&
        (!_fa.action || _starMissingRe.test(_fa.action)) &&
        (!_fa.result || _starMissingRe.test(_fa.result));
      if (_allStarMissing) return null;
      return (
      <div className={`mb-6 feedback-section ${isSectionVisible(5) ? 'visible' : ''}`}>
        <div className="bg-gradient-to-r from-teal-50 to-sky-50 border-2 border-teal-300 rounded-xl p-4 mb-4">
          <h4 className="font-bold text-teal-900 text-xl flex items-center gap-2">
            <Star className="w-8 h-8 text-amber-500" /> 
            <span>STAR Framework Analysis</span>
          </h4>
          <p className="text-sm text-teal-700 mt-1">How your answer maps to the STAR method</p>
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
                <MapPin className="w-5 h-5 text-teal-600" />
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
                <Target className="w-5 h-5 text-teal-600" />
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
                <Zap className="w-5 h-5 text-amber-500" />
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
                <Trophy className="w-5 h-5 text-amber-500" />
              </div>
              <h5 className="font-bold text-gray-900">Result</h5>
            </div>
            <p className="text-gray-800 text-sm leading-relaxed">{feedback.framework_analysis.result || 'Not provided'}</p>
          </div>
        </div>
        
        {/* STAR Completeness Meter */}
        <div className="mt-4 bg-white rounded-lg p-4 border-2 border-teal-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700">STAR Completeness:</span>
            <span className="text-lg font-bold text-teal-600">
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
              className="bg-gradient-to-r from-teal-500 to-sky-500 h-3 rounded-full transition-all duration-500"
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
      );
    })()}

    {/* ==================== KEY POINTS COVERAGE - Stage 6 (legacy v1 only) ==================== */}
    {!feedback.fix && (feedback.points_covered || feedback.points_missed) && isSectionVisible(6) && (
      <div className={`bg-gray-50 rounded-xl p-6 mb-6 border-2 border-gray-300 feedback-section ${isSectionVisible(6) ? 'visible' : ''}`}>
        <h4 className="font-bold text-gray-900 text-xl mb-4 flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-teal-600" />
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
            flushSync(() => {
              setFeedback(null);
            });
            setUserAnswer(''); 
            setSpokenAnswer(''); 
            accumulatedTranscript.current = '';
          }} 
          className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-4 rounded-xl transition-all hover:scale-105 shadow-lg"
        >
          <RotateCcw className="w-4 h-4 inline" /> Try Again
        </button>
        <button 
          onClick={() => { 
            flushSync(() => {
              setFeedback(null);
            });
            setUserAnswer(''); 
            setSpokenAnswer(''); 
            accumulatedTranscript.current = '';
            currentMode === 'ai-interviewer' ? startAIInterviewer() : startPracticeMode(); 
          }} 
          className="flex-1 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold py-4 rounded-xl transition-all hover:scale-105 shadow-lg"
        >
          <ArrowRight className="w-4 h-4 inline" /> Next Question
        </button>
      </div>
    )}
  </div>
  );
})()}
        </div>
        
        {/* Answer Assistant Modal */}
        {showAnswerAssistant && answerAssistantQuestion && (
          <AnswerAssistant
            question={answerAssistantQuestion.question}
            questionId={answerAssistantQuestion.id}
            userContext={getUserContext()}
            userTier={usageStatsData?.tier}
            existingNarrative={answerAssistantQuestion.narrative}
            existingBullets={answerAssistantQuestion.bullets}
            onAnswerSaved={handleAnswerSaved}
            onClose={() => {
              setShowAnswerAssistant(false);
              setAnswerAssistantQuestion(null);
            }}
            onUsageTracked={() => {
              // SECURITY FIX: Check limits before tracking (prevents bypass)
              if (checkUsageLimitsSync('answerAssistant', 'Answer Assistant')) {
                trackUsageInBackground('answerAssistant', 'Answer Assistant');
              } else {
                console.log('🚫 Answer Assistant tracking blocked - over limit');
              }
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
    // CALLBACK FIX: Handler now defined at top level with useCallback for stable reference
    
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <button onClick={() => {
                if (sessionQuestions.length >= 2) { setShowSessionReport(true); }
                setCurrentView('home'); setTimerActive(false); setConfidenceRating(null);
                setSpokenAnswer(''); setUserAnswer(''); setTranscript(''); setFeedback(null);
                accumulatedTranscript.current = '';
              }} className="text-gray-600 hover:text-gray-900">← Exit</button>
            <h1 className="text-2xl font-bold">Practice Mode</h1>
            <div className="flex items-center gap-2">
              {/* Phase 4J: Timed toggle */}
              <button
                onClick={() => { setTimedMode(!timedMode); setTimerActive(false); }}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${timedMode ? 'bg-teal-100 text-teal-700 border border-teal-300' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
              >
                ⏱ {timedMode ? 'Timed' : 'Timer'}
              </button>
              <button onClick={goToPreviousQuestion} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold flex items-center gap-1">
                ← Prev
              </button>
              <button onClick={() => { goToNextQuestion(); setTimerActive(false); setConfidenceRating(null); }} className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold flex items-center gap-1">
                Next →
              </button>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Question Group Filter */}
          <div className="mb-4">
            <QuestionGroupFilter
              groups={QUESTION_GROUPS}
              activeGroups={activeGroups}
              onToggle={(groupId) => {
                setActiveGroups(prev => {
                  const next = new Set(prev);
                  if (next.has(groupId)) next.delete(groupId);
                  else next.add(groupId);
                  try { localStorage.setItem('isl_active_groups', JSON.stringify([...next])); } catch {}
                  return next;
                });
              }}
              questionCounts={getQuestionCountsByGroup(questions.length > 0 ? questions : DEFAULT_QUESTIONS)}
              compact
            />
          </div>
          {/* Phase 4J: Timer controls & overlay */}
          {timedMode && (
            <div className="mb-4 flex items-center justify-between bg-white rounded-xl shadow-sm p-3 border border-slate-200">
              <TimerSelector selectedDuration={timerDuration} onSelect={setTimerDuration} />
              <TimerOverlay
                isActive={timerActive}
                durationSeconds={timerDuration}
                onTimeUp={() => setTimerActive(false)}
                onElapsed={(elapsed) => setRecordingElapsed(elapsed)}
              />
            </div>
          )}

          <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
            <h2 className="text-4xl font-bold mb-4">{currentQuestion.question}</h2>
            {/* Phase 4E: Teach Me button */}
            <button
              onClick={() => setSparkNotesQuestion(currentQuestion)}
              className="mb-6 px-4 py-1.5 bg-purple-50 text-purple-600 rounded-full text-sm font-medium hover:bg-purple-100 transition-colors border border-purple-200"
            >
              <BookOpen className="w-4 h-4 inline" /> Teach Me This Question
            </button>

            {/* Phase 4M: Confidence Calibration - pre-answer rating */}
            {!feedback && confidenceRating === null && (
              <div className="mb-6 p-4 bg-gradient-to-r from-slate-50 to-teal-50 rounded-xl border border-slate-200">
                <p className="text-sm font-semibold text-slate-700 mb-2">How confident are you on this question?</p>
                <div className="flex items-center gap-2">
                  {[
                    { val: 1, emoji: '😰', label: 'Not at all' },
                    { val: 2, emoji: '😟', label: 'Shaky' },
                    { val: 3, emoji: '😐', label: 'Okay' },
                    { val: 4, emoji: '🙂', label: 'Good' },
                    { val: 5, emoji: '😎', label: 'Nailed it' },
                  ].map(opt => (
                    <button
                      key={opt.val}
                      onClick={() => { setConfidenceRating(opt.val); if (timedMode) setTimerActive(true); }}
                      className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-slate-200"
                    >
                      <span className="text-2xl">{opt.emoji}</span>
                      <span className="text-[10px] text-slate-500">{opt.label}</span>
                    </button>
                  ))}
                  <button
                    onClick={() => { setConfidenceRating(0); if (timedMode) setTimerActive(true); }}
                    className="ml-2 text-xs text-slate-400 hover:text-slate-600 underline"
                  >
                    Skip
                  </button>
                </div>
              </div>
            )}

            {!feedback && (
              <>
                {/* Speech Input */}
                <SpeechUnavailableWarning variant="banner" />
                {getBrowserInfo().hasReliableSpeech && (
                <div className="bg-gradient-to-r from-teal-50 to-sky-50 border-2 border-teal-300 rounded-lg p-6 mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Mic className={`w-6 h-6 ${isListening ? 'text-red-600 animate-pulse' : 'text-teal-600'}`} />
                    <h4 className="font-bold text-teal-900">{isListening ? 'Recording your answer...' : 'Speak Your Answer'}</h4>
                  </div>
                  <button
                    onMouseDown={startListening}
                    onMouseUp={stopListening}
                    onTouchStart={startListening}
                    onTouchEnd={stopListening}
                    className={`w-full py-6 rounded-lg font-bold text-lg transition mb-4 ${isListening ? 'bg-red-600 text-white animate-pulse' : 'bg-teal-600 hover:bg-teal-700 text-white'}`}
                  >
                    {isListening ? <><Mic className="w-5 h-5 inline" /> Release to Stop</> : <><Mic className="w-5 h-5 inline" /> Hold to Speak (or use SPACEBAR)</>}
                  </button>
                </div>
                )}
                
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
                    <p className="text-xs text-gray-500 mt-2"><BarChart2 className="w-3 h-3 inline" /> {(spokenAnswer || transcript).split(' ').filter(w => w).length} words</p>
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
                    {(usageStats?.tier === 'pro' || usageStats?.tier === 'beta' || usageStats?.tier === 'general_pass' || usageStats?.tier === 'annual') ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log('Help button clicked!');
                          console.log('Current question:', currentQuestion);
                          // BUG 8 FIX: Use openAnswerAssistant to enforce usage check
                          openAnswerAssistant(currentQuestion);
                        }}
                        className="text-sm bg-gradient-to-r from-teal-100 to-sky-100 hover:from-teal-200 hover:to-sky-200 text-teal-700 px-4 py-2 rounded-lg font-semibold transition flex items-center gap-2"
                      >
                        <Lightbulb className="w-4 h-4" />
                        Can't Think of an Answer? AI Can Help
                      </button>
                    ) : (
                      <button
                        onClick={(e) => { e.stopPropagation(); alert('Pro Feature\n\nGet a 30-Day Pass ($14.99) for UNLIMITED access!\n\n✓ Unlimited AI Answer Coach sessions\n✓ Unlimited AI Interview practice\n✓ Unlimited Practice Mode\n✓ No subscription — just one payment!'); }}
                        className="text-sm bg-gradient-to-r from-yellow-100 to-amber-100 hover:from-yellow-200 hover:to-amber-200 text-yellow-800 px-4 py-2 rounded-lg font-semibold transition flex items-center gap-2"
                      >
                        <Crown className="w-4 h-4" />
                        Can't Think of an Answer? Upgrade for AI Help
                      </button>
                    )}
                  </div>
                </div>
                
                {/* ULTIMATE FIX: Extracted inline async to named function with promise chains */}
                <button
                  onClick={() => handlePracticeModeSubmit()}
                  disabled={isAnalyzing}
                  className="w-full bg-gradient-to-r from-teal-600 to-sky-600 hover:from-teal-700 hover:to-sky-700 text-white font-bold py-4 rounded-lg disabled:opacity-50 flex items-center justify-center gap-2"
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

 {feedback && (() => {
  // Read-time chip — sums words across all renderable feedback fields, divides by 200wpm
  const _wordCount = (v) => {
    if (!v) return 0;
    if (Array.isArray(v)) return v.reduce((n, x) => n + _wordCount(x), 0);
    if (typeof v === 'object') return Object.values(v).reduce((n, x) => n + _wordCount(x), 0);
    return String(v).trim().split(/\s+/).filter(Boolean).length;
  };
  // PR 3 — count words across BOTH v1 (legacy) and v2 (new 5-field) fields
  const _totalWords =
    _wordCount(feedback.strengths) +
    _wordCount(feedback.gaps) +
    _wordCount(feedback.specific_improvements) +
    _wordCount(feedback.ideal_answer) +
    _wordCount(feedback.framework_analysis) +
    _wordCount(feedback.points_covered) +
    _wordCount(feedback.points_missed) +
    _wordCount(feedback.verdict) +
    _wordCount(feedback.fix) +
    _wordCount(feedback.strength);
  const _readMinutes = Math.max(1, Math.ceil(_totalWords / 200));
  return (
  <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-8">
    {/* AI DISCLAIMER */}
    <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded p-3 mb-4">
      <p className="text-xs text-yellow-900">
        <span className="font-semibold"><Bot className="w-4 h-4 inline" /> AI-Generated:</span> For practice only. Not professional advice.
      </p>
    </div>

    {/* Read-time chip */}
    <div className="mb-3">
      <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 text-xs font-semibold px-3 py-1 rounded-full">
        📖 ~{_readMinutes} min read
      </span>
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
          className="text-sm bg-teal-100 hover:bg-teal-200 text-teal-700 px-4 py-2 rounded-lg font-semibold transition-all"
        >
          <Zap className="w-4 h-4 inline" /> Show All
        </button>
      )}
    </div>
    
    {/* ==================== OVERALL SCORE - Always visible, animates ==================== */}
    <div className="bg-gradient-to-r from-teal-600 to-sky-600 rounded-xl p-8 text-white text-center mb-8 shadow-xl fade-in-up">
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
      {/* Phase 4M: Confidence Calibration gap */}
      {confidenceRating > 0 && getFeedbackScore(feedback) > 0 && (() => {
        const actual = getFeedbackScore(feedback);
        const predicted = confidenceRating * 2;
        const gap = Math.abs(actual - predicted);
        const msg = gap <= 1 ? 'Great self-awareness! Your confidence matched your score.'
          : actual > predicted ? 'You scored higher than expected! Trust yourself more.'
          : `You rated ${confidenceRating}/5 but scored ${actual.toFixed(1)}/10. More practice needed here.`;
        return <p className="mt-3 text-sm opacity-90">{msg}</p>;
      })()}
    </div>

    {/* ==================== PR 3 — NEW 5-FIELD COACHING CARD (v2 schema) ==================== */}
    {feedback.fix && (
      <div className="mb-6 feedback-section visible fade-in-up">
        {/* Verdict */}
        {feedback.verdict && (
          <div className="bg-gradient-to-r from-teal-50 to-sky-50 border-2 border-teal-300 rounded-xl p-5 mb-4">
            <p className="text-sm font-bold text-teal-700 mb-1 uppercase tracking-wide">Verdict</p>
            <p className="text-gray-900 text-lg leading-relaxed">{feedback.verdict}</p>
          </div>
        )}

        {/* The Fix — quote / issue / rewrite */}
        <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-5 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-6 h-6 text-amber-600" />
            <h4 className="font-bold text-amber-900 text-xl">The One Thing to Fix</h4>
          </div>
          {feedback.fix.quote && feedback.fix.quote !== 'NO_QUOTE_AVAILABLE' && (
            <div className="bg-white rounded-lg p-3 mb-3 border-l-4 border-amber-500">
              <p className="text-xs font-bold text-amber-700 mb-1 uppercase">You said</p>
              <p className="text-gray-800 italic">"{feedback.fix.quote}"</p>
            </div>
          )}
          {feedback.fix.issue && (
            <div className="mb-3">
              <p className="text-xs font-bold text-amber-700 mb-1 uppercase">Why it's weak</p>
              <p className="text-gray-800 leading-relaxed">{feedback.fix.issue}</p>
            </div>
          )}
          {feedback.fix.rewrite && (
            <div className="bg-teal-50 rounded-lg p-3 border-l-4 border-teal-500">
              <p className="text-xs font-bold text-teal-700 mb-1 uppercase">Try saying</p>
              <p className="text-teal-900 leading-relaxed font-medium">{feedback.fix.rewrite}</p>
            </div>
          )}
        </div>

        {/* Strength — last, anti-sandwich */}
        {feedback.strength && (
          <div className="bg-green-50 border-l-4 border-green-500 rounded-xl p-5 mb-4">
            <div className="flex items-start gap-3">
              <span className="text-3xl">✓</span>
              <div>
                <p className="text-xs font-bold text-green-700 mb-1 uppercase tracking-wide">What worked</p>
                <p className="text-green-900 leading-relaxed">{feedback.strength}</p>
              </div>
            </div>
          </div>
        )}

        {/* Delivery insights still useful on v2 rows */}
        <DeliveryInsights answer={spokenAnswer || userAnswer} />
      </div>
    )}

    {/* ==================== IDEAL ANSWER - Stage 1 (legacy v1 only) ==================== */}
    {!feedback.fix && feedback.ideal_answer && isSectionVisible(1) && (
      <div className={`mb-6 feedback-section ${isSectionVisible(1) ? 'visible' : ''}`}>
        <button
          onClick={() => setShowIdealAnswer(!showIdealAnswer)}
          className="w-full bg-gradient-to-r from-teal-50 to-sky-50 hover:from-teal-100 hover:to-sky-100 border-2 border-teal-300 rounded-xl p-5 flex items-center justify-between transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-teal-500 rounded-full flex items-center justify-center">
              <Lightbulb className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <span className="font-bold text-teal-900 text-lg block">Your Answer, Coached</span>
              <span className="text-sm text-teal-700">Click to compare with your response</span>
            </div>
          </div>
          <span className="text-teal-600 text-2xl font-bold">{showIdealAnswer ? '▼' : '▶'}</span>
        </button>

        {showIdealAnswer && (
          <div className="mt-4 grid md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl border-2 border-teal-200 fade-in-up">
            <div className="bg-white rounded-lg p-5 border-2 border-gray-300">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-lg">👤</span>
                </div>
                <h5 className="font-bold text-gray-900">Your Answer</h5>
              </div>
              <p className="text-gray-800 leading-relaxed text-sm">{spokenAnswer || userAnswer}</p>
            </div>

            <div className="bg-teal-50 rounded-lg p-5 border-2 border-teal-400">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center">
                  <Star className="w-4 h-4 text-white" />
                </div>
                <h5 className="font-bold text-teal-900">Strong Example</h5>
              </div>
              <p className="text-teal-900 leading-relaxed text-sm">{feedback.ideal_answer}</p>
            </div>
          </div>
        )}
      </div>
    )}

    {/* ==================== DELIVERY INSIGHTS - Phase 4B (v1 only; v2 renders it inside the coaching card) ==================== */}
    {!feedback.fix && <DeliveryInsights answer={spokenAnswer || userAnswer} />}

    {/* ==================== STRENGTHS - Stage 2 (legacy v1 only) ==================== */}
    {!feedback.fix && feedback.strengths && feedback.strengths.length > 0 && isSectionVisible(2) && (
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

    {/* ==================== GAPS - Stage 3 (legacy v1 only) ==================== */}
    {!feedback.fix && feedback.gaps && feedback.gaps.length > 0 && isSectionVisible(3) && (
      <div className={`mb-6 feedback-section ${isSectionVisible(3) ? 'visible' : ''}`}>
        <button
          onClick={() => setShowGaps(!showGaps)}
          className="w-full bg-amber-50 hover:bg-amber-100 border-2 border-amber-300 rounded-xl p-4 flex items-center justify-between transition-all mb-3"
        >
          <h4 className="font-bold text-amber-900 text-xl flex items-center gap-2">
            <TrendingUp className="w-8 h-8 text-teal-600" /> 
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

    {/* ==================== ACTION STEPS - Stage 4 (legacy v1 only) ==================== */}
    {!feedback.fix && feedback.specific_improvements && feedback.specific_improvements.length > 0 && isSectionVisible(4) && (
      <div className={`mb-6 feedback-section ${isSectionVisible(4) ? 'visible' : ''}`}>
        <div className="bg-teal-50 border-2 border-teal-300 rounded-xl p-4 mb-3">
          <h4 className="font-bold text-teal-900 text-xl flex items-center gap-2">
            <Target className="w-8 h-8 text-teal-600" /> 
            <span>Action Steps ({feedback.specific_improvements.length})</span>
          </h4>
          <p className="text-sm text-teal-700 mt-1">Specific ways to improve your answer</p>
        </div>
        
        <div className="grid gap-3 pl-4">
          {feedback.specific_improvements.map((imp, i) => (
            <div key={i} className="bg-teal-50 border-l-4 border-teal-500 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-teal-600 text-white rounded-full flex items-center justify-center text-lg font-bold">
                  {i + 1}
                </div>
                <p className="text-teal-900 flex-1 leading-relaxed">{imp}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    )}

    {/* ==================== STAR FRAMEWORK - Stage 5 (legacy v1 only) ==================== */}
    {!feedback.fix && feedback.framework_analysis && isSectionVisible(5) && (() => {
      const _starMissingRe = /missing|not provided|n\/?a|absent|—/i;
      const _fa = feedback.framework_analysis;
      const _allStarMissing =
        (!_fa.situation || _starMissingRe.test(_fa.situation)) &&
        (!_fa.task || _starMissingRe.test(_fa.task)) &&
        (!_fa.action || _starMissingRe.test(_fa.action)) &&
        (!_fa.result || _starMissingRe.test(_fa.result));
      if (_allStarMissing) return null;
      return (
      <div className={`mb-6 feedback-section ${isSectionVisible(5) ? 'visible' : ''}`}>
        <div className="bg-gradient-to-r from-teal-50 to-sky-50 border-2 border-teal-300 rounded-xl p-4 mb-4">
          <h4 className="font-bold text-teal-900 text-xl flex items-center gap-2">
            <Star className="w-8 h-8 text-amber-500" /> 
            <span>STAR Framework Analysis</span>
          </h4>
          <p className="text-sm text-teal-700 mt-1">How your answer maps to the STAR method</p>
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
                <MapPin className="w-5 h-5 text-teal-600" />
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
                <Target className="w-5 h-5 text-teal-600" />
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
                <Zap className="w-5 h-5 text-amber-500" />
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
                <Trophy className="w-5 h-5 text-amber-500" />
              </div>
              <h5 className="font-bold text-gray-900">Result</h5>
            </div>
            <p className="text-gray-800 text-sm leading-relaxed">{feedback.framework_analysis.result || 'Not provided'}</p>
          </div>
        </div>
        
        {/* STAR Completeness Meter */}
        <div className="mt-4 bg-white rounded-lg p-4 border-2 border-teal-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700">STAR Completeness:</span>
            <span className="text-lg font-bold text-teal-600">
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
              className="bg-gradient-to-r from-teal-500 to-sky-500 h-3 rounded-full transition-all duration-500"
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
      );
    })()}

    {/* ==================== KEY POINTS COVERAGE - Stage 6 (legacy v1 only) ==================== */}
    {!feedback.fix && (feedback.points_covered || feedback.points_missed) && isSectionVisible(6) && (
      <div className={`bg-gray-50 rounded-xl p-6 mb-6 border-2 border-gray-300 feedback-section ${isSectionVisible(6) ? 'visible' : ''}`}>
        <h4 className="font-bold text-gray-900 text-xl mb-4 flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-teal-600" />
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
            flushSync(() => {
              setFeedback(null);
            });
            setUserAnswer(''); 
            setSpokenAnswer(''); 
            accumulatedTranscript.current = '';
          }} 
          className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-4 rounded-xl transition-all hover:scale-105 shadow-lg"
        >
          <RotateCcw className="w-4 h-4 inline" /> Try Again
        </button>
        <button 
          onClick={() => { 
            flushSync(() => {
              setFeedback(null);
            });
            setUserAnswer(''); 
            setSpokenAnswer(''); 
            accumulatedTranscript.current = '';
            currentMode === 'ai-interviewer' ? startAIInterviewer() : startPracticeMode(); 
          }} 
          className="flex-1 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold py-4 rounded-xl transition-all hover:scale-105 shadow-lg"
        >
          <ArrowRight className="w-4 h-4 inline" /> Next Question
        </button>
      </div>
    )}
  </div>
  );
})()}

          </div>
        </div>
        
        {/* Answer Assistant Modal */}
        {showAnswerAssistant && answerAssistantQuestion && (
          <AnswerAssistant
            question={answerAssistantQuestion.question}
            questionId={answerAssistantQuestion.id}
            userContext={getUserContext()}
            userTier={usageStatsData?.tier}
            existingNarrative={answerAssistantQuestion.narrative}
            existingBullets={answerAssistantQuestion.bullets}
            onAnswerSaved={handleAnswerSaved}
            onClose={() => {
              setShowAnswerAssistant(false);
              setAnswerAssistantQuestion(null);
            }}
            onUsageTracked={() => {
              // SECURITY FIX: Check limits before tracking (prevents bypass)
              if (checkUsageLimitsSync('answerAssistant', 'Answer Assistant')) {
                trackUsageInBackground('answerAssistant', 'Answer Assistant');
              } else {
                console.log('🚫 Answer Assistant tracking blocked - over limit');
              }
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
      setShowStudyTips(false);
    };

    const goToPreviousCard = () => {
      const prevIndex = flashcardIndex === 0 ? flashcardDeck.length - 1 : flashcardIndex - 1;
      setFlashcardIndex(prevIndex);
      setCurrentQuestion(flashcardDeck[prevIndex]);
      setFlashcardSide('question');
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
      <div className="min-h-screen bg-gradient-to-br from-teal-500 to-emerald-600">
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
                className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-16 w-12 h-12 bg-white/20 hover:bg-white/30 backdrop-blur rounded-full items-center justify-center text-white text-2xl font-bold transition-all hover:scale-105 z-10"
              >
                ←
              </button>

              {/* Flashcard - Swipeable on Mobile, Clickable to Flip */}
              <div 
                className="bg-white rounded-xl shadow-lg p-8 md:p-12 min-h-[400px] flex items-center justify-center cursor-pointer transition-all select-none"
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
                          <span className="flex-shrink-0 w-7 h-7 bg-teal-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                            {idx + 1}
                          </span>
                          <span className="text-base md:text-lg text-gray-800 leading-snug">{bullet}</span>
                        </li>
                      ))}
                    </ul>
                    {currentQuestion.narrative && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <h4 className="text-lg font-bold text-gray-900 mb-2">Full Narrative:</h4>
                        <p className="text-base text-gray-800 leading-relaxed whitespace-pre-line">{currentQuestion.narrative}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Right Arrow - Desktop Only */}
              <button
                onClick={goToNextCard}
                className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-16 w-12 h-12 bg-white/20 hover:bg-white/30 backdrop-blur rounded-full items-center justify-center text-white text-2xl font-bold transition-all hover:scale-105 z-10"
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
                    <div className="bg-gradient-to-br from-teal-50 to-sky-50 rounded-lg p-4 border-2 border-teal-200">
                      <h4 className="font-bold text-teal-900 mb-2 flex items-center gap-2">
                        🎨 Visualization Exercise
                      </h4>
                      <p className="text-sm text-teal-800 mb-3 leading-relaxed">
                        Close your eyes. Picture yourself IN this scenario. Make it vivid—see the people, hear the sounds, feel the pressure.
                      </p>
                      {visualizationTimer === null ? (
                        <button
                          onClick={startVisualization}
                          className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-lg transition text-sm"
                        >
                          Start 20-Second Visualization
                        </button>
                      ) : (
                        <div className="text-center">
                          <div className="text-4xl font-black text-teal-600 mb-1">{visualizationTimer}s</div>
                          <div className="w-full bg-teal-200 rounded-full h-2">
                            <div
                              className="bg-teal-600 h-2 rounded-full transition-all duration-1000"
                              style={{ width: `${(20 - visualizationTimer) / 20 * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Blank Recall Reminder */}
                    <div className="bg-gradient-to-br from-teal-50 to-sky-50 rounded-lg p-4 border-2 border-teal-200">
                      <h4 className="font-bold text-teal-900 mb-2 flex items-center gap-2">
                        ✏️ Next Time: Blank Recall
                      </h4>
                      <p className="text-sm text-teal-800 leading-relaxed">
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
                          { emoji: '✓', label: 'Mastered', rating: 5 }
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

// INTERVIEW COACH
  // Phase 4D: JD Decoder
  if (currentView === 'jd-decoder') {
    return <JDDecoder
      onBack={() => setCurrentView('home')}
      jobDescription={getUserContext().jobDescription || ''}
      getUserContext={getUserContext}
      onSaveQuestions={async (newQs) => {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) { alert('Please sign in to save questions'); return; }
          const rows = newQs.map(q => ({
            user_id: user.id,
            question: q.question,
            category: q.category || 'Behavioral',
            priority: q.priority || 'Standard',
            keywords: q.keywords || [],
            bullets: q.bullets || [],
            narrative: '',
          }));
          const { error } = await supabase.from('questions').insert(rows);
          if (error) throw error;
          await loadQuestions();
          console.log(`✅ ${rows.length} JD Decoder questions saved to Supabase`);
        } catch (err) {
          console.error('❌ JD Decoder save error:', err);
          alert('Failed to save questions: ' + err.message);
        }
      }}
      onNavigate={(view) => view === 'practice' ? startPracticeMode() : setCurrentView(view)}
    />;
  }

  // Phase 4F: Story Bank
  if (currentView === 'story-bank') {
    return <StoryBank onBack={() => setCurrentView('home')} questions={questions} getUserContext={getUserContext} onNavigate={(view) => view === 'practice' ? startPracticeMode() : setCurrentView(view)} />;
  }

  // Portfolio: Work History & Confidence Builder
  if (currentView === 'portfolio') {
    return <Portfolio onBack={() => setCurrentView('home')} getUserContext={getUserContext} questions={questions} onNavigate={(view) => view === 'practice' ? startPracticeMode() : setCurrentView(view)} />;
  }

  // Phase 4K: Prep Radio
  if (currentView === 'prep-radio') {
    return <PrepRadio onBack={() => setCurrentView('home')} questions={questions} practiceHistory={practiceHistory} getUserContext={getUserContext} userTier={userTier} onUpgrade={() => setShowPricingPage(true)} />;
  }

  // Phase 5: Learn Section
  if (currentView === 'interview-coach') {
    // Redirect to home and open the popup panel instead
    setCurrentView('home');
    setShowCoachPanel(true);
    return null;
  }

  if (currentView === 'learn') {
    return <LearnSection onBack={() => setCurrentView('home')} userTier={userTier} onUpgrade={() => setShowPricingPage(true)} supabase={supabase} userId={currentUser?.id} />;
  }

  // Phase 4L: Weak STAR Drill
  if (currentView === 'weak-drill') {
    return <WeakPointDrill onBack={() => { setDrillTargetComponent(null); setCurrentView('home'); }} practiceHistory={practiceHistory} questions={questions} getUserContext={getUserContext} targetComponent={drillTargetComponent} />;
  }

  // Phase 4I: Interview Day Mode
  if (currentView === 'interview-day') {
    return <InterviewDayMode onBack={() => setCurrentView('home')} practiceHistory={practiceHistory} questions={questions} getUserContext={getUserContext} />;
  }

  // Phase 4N: Follow-Up Email
  if (currentView === 'follow-up-email') {
    return <FollowUpEmail onBack={() => setCurrentView('home')} getUserContext={getUserContext} />;
  }

  if (currentView === 'interview-coach') {
    return (
      <div className="min-h-screen" style={{ background: 'linear-gradient(to bottom right, #fafaf8, #f5f5f0, #f0f4f8)' }}>
        <InterviewCoach
          onBack={() => setCurrentView('home')}
          getUserContext={getUserContext}
          questions={questions}
          practiceHistory={practiceHistory}
          speakText={speakText}
          stopSpeaking={() => synthRef.current?.cancel()}
          aiSpeaking={aiSpeaking}
        />
      </div>
    );
  }

// COMMAND CENTER
  if (currentView === 'command-center') {
    return (
      <>
      <div className="min-h-screen bg-gray-50">
        {/* Header - Compact */}
        <div className="bg-white shadow-sm border-b border-slate-100">
          <div className="container mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
            <button onClick={() => setCurrentView('home')} className="text-slate-600 hover:text-slate-900 font-semibold text-sm sm:text-base flex items-center gap-1 hover:gap-2 transition-all">
              ← <span className="hidden sm:inline">Back</span>
            </button>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-navy-700"><Target className="w-6 h-6 inline" /> Command Center</h1>
            <div className="w-12 sm:w-16"></div>
          </div>
        </div>

        {/* Swipeable Tabs - Sticky */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm z-40">
          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 min-w-max">
              <button
                onClick={() => setCommandCenterTab('analytics')}
                className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-semibold text-xs sm:text-sm transition-all whitespace-nowrap active:scale-[0.98] ${
                  commandCenterTab === 'analytics'
                    ? 'bg-teal-600 text-white shadow-md'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <BarChart2 className="w-4 h-4 inline" /> Analytics
              </button>
              <button
                onClick={() => setCommandCenterTab('queue')}
                className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-semibold text-xs sm:text-sm transition-all whitespace-nowrap active:scale-[0.98] ${
                  commandCenterTab === 'queue'
                    ? 'bg-teal-600 text-white shadow-md'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Target className="w-4 h-4 inline" /> Queue
              </button>
              <button
                onClick={() => setCommandCenterTab('prep')}
                className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-semibold text-xs sm:text-sm transition-all whitespace-nowrap active:scale-[0.98] ${
                  commandCenterTab === 'prep'
                    ? 'bg-teal-600 text-white shadow-md'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                🗓️ Prep
              </button>
              <button
                onClick={() => setCommandCenterTab('bank')}
                className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-semibold text-xs sm:text-sm transition-all whitespace-nowrap active:scale-[0.98] ${
                  commandCenterTab === 'bank'
                    ? 'bg-teal-600 text-white shadow-md'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <BookOpen className="w-4 h-4 inline" /> Bank
              </button>
              <button
                onClick={() => setCommandCenterTab('progress')}
                className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-semibold text-xs sm:text-sm transition-all whitespace-nowrap active:scale-[0.98] ${
                  commandCenterTab === 'progress'
                    ? 'bg-teal-600 text-white shadow-md'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <TrendingUp className="w-4 h-4 inline" /> Progress
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
          {/* ==================== ANALYTICS TAB ==================== */}
          {commandCenterTab === 'analytics' && (
            <div>
              {/* Stats Overview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 mb-5 sm:mb-6">
                <div className="bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl sm:rounded-xl p-3 sm:p-4 lg:p-5 text-white cursor-pointer hover:scale-[1.02] hover:shadow-md transition-all" onClick={() => setCommandCenterTab('progress')}>
                  <p className="text-xs sm:text-sm text-white/90 font-medium mb-0.5 sm:mb-1">Total Sessions</p>
                  <p className="text-2xl sm:text-3xl lg:text-4xl font-black">{practiceHistory.length}</p>
                  <p className="text-[10px] sm:text-xs text-white/75 mt-0.5 sm:mt-1">Keep it up!</p>
                </div>
                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl sm:rounded-xl p-3 sm:p-4 lg:p-5 text-white cursor-pointer hover:scale-[1.02] hover:shadow-md transition-all" onClick={() => setCommandCenterTab('progress')}>
                  <p className="text-xs sm:text-sm text-white/90 font-medium mb-0.5 sm:mb-1">Average Score</p>
                  <p className="text-2xl sm:text-3xl lg:text-4xl font-black">
                    {practiceHistory.length > 0
                      ? (practiceHistory.reduce((sum, s) => sum + (s.feedback?.overall || 0), 0) / practiceHistory.length).toFixed(1)
                      : '0.0'}
                  </p>
                  <p className="text-[10px] sm:text-xs text-white/75 mt-0.5 sm:mt-1">Improving</p>
                </div>
                <div className="bg-gradient-to-br from-teal-500 to-sky-600 rounded-xl sm:rounded-xl p-3 sm:p-4 lg:p-5 text-white cursor-pointer hover:scale-[1.02] hover:shadow-md transition-all" onClick={() => setCommandCenterTab('bank')}>
                  <p className="text-xs sm:text-sm text-white/90 font-medium mb-0.5 sm:mb-1">Practiced</p>
                  <p className="text-2xl sm:text-3xl lg:text-4xl font-black">{questions.filter(q => q.practiceCount > 0).length}</p>
                  <p className="text-[10px] sm:text-xs text-white/75 mt-0.5 sm:mt-1">of {questions.length} total</p>
                </div>
                <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl sm:rounded-xl p-3 sm:p-4 lg:p-5 text-white cursor-pointer hover:scale-[1.02] hover:shadow-md transition-all" onClick={() => setCommandCenterTab('prep')}>
                  <p className="text-xs sm:text-sm text-white/90 font-medium mb-0.5 sm:mb-1">This Month</p>
                  <p className="text-2xl sm:text-3xl lg:text-4xl font-black">
                    {practiceHistory.filter(s => {
                      const sessionDate = new Date(s.date);
                      const now = new Date();
                      return sessionDate.getMonth() === now.getMonth() &&
                             sessionDate.getFullYear() === now.getFullYear();
                    }).length}
                  </p>
                  <p className="text-[10px] sm:text-xs text-white/75 mt-0.5 sm:mt-1">🔥 On fire!</p>
                </div>
              </div>

              {/* Most Practiced Questions */}
              <div className="bg-white rounded-xl sm:rounded-xl shadow-md border border-slate-100 p-4 sm:p-5 mb-5 sm:mb-6">
                <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-navy-700">Most practiced</h3>
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
                          <div className="text-2xl font-black text-teal-600">#{idx + 1}</div>
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
                      <div key={idx} className="border-l-4 border-teal-500 bg-gray-50 rounded-r-lg p-4 hover:shadow-md transition">
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
                            <div className="text-3xl font-black text-teal-600">
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
                <h3 className="text-xl font-bold mb-4 text-red-600"><Target className="w-5 h-5 inline" /> Let's Strengthen These {questions.filter(q => q.practiceCount === 0).length} Questions!</h3>
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
                              flushSync(() => {
                                setFeedback(null);
                              });
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
                <h3 className="text-xl font-bold mb-4 text-amber-600"><TrendingUp className="w-5 h-5 inline" /> Almost There - Keep Going!</h3>
                {questions.filter(q => q.practiceCount > 0 && q.averageScore < 7).length === 0 ? (
                  <div className="text-center py-8">
                    <p className="mb-2"><Star className="w-6 h-6 inline text-amber-500" /></p>
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
                              flushSync(() => {
                                setFeedback(null);
                              });
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
            <InterviewContextHub
              questions={questions}
              practiceHistory={practiceHistory}
              dailyGoal={dailyGoal}
              setDailyGoal={setDailyGoal}
              interviewDate={interviewDate}
              setInterviewDate={setInterviewDate}
              setCurrentView={setCurrentView}
              onGenerateQuestions={() => setCommandCenterTab('bank')}
            />
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
          className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-lg animate-slideUp"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="sticky top-0 bg-gradient-to-r from-teal-600 to-sky-600 text-white p-6 rounded-t-2xl z-10">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-2">{selectedSession.question}</h3>
                <div className="flex items-center gap-4 text-sm opacity-90">
                  <span>📅 {new Date(selectedSession.date).toLocaleDateString()}</span>
                  <span>🕐 {new Date(selectedSession.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  <span><Star className="w-4 h-4 inline" /> Score: {(selectedSession.feedback?.overall || selectedSession.feedback?.match_percentage / 10).toFixed(1)}/10</span>
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
            <div className="bg-gradient-to-br from-teal-50 to-sky-50 rounded-xl p-6 border-2 border-teal-200">
              <h4 className="font-bold text-lg mb-3 text-teal-900 flex items-center gap-2">
                <MessageCircle className="w-6 h-6 text-teal-600" />
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
                  <Star className="w-6 h-6 text-green-600" />
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
                  <CheckCircle className="w-6 h-6 text-green-600" />
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
                  <TrendingUp className="w-6 h-6 text-amber-600" />
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
              <div className="bg-teal-50 rounded-xl p-6 border-2 border-teal-200">
                <h4 className="font-bold text-lg mb-4 text-teal-900 flex items-center gap-2">
                  <Target className="w-5 h-5 text-teal-600" />
                  Action Steps ({selectedSession.feedback.specific_improvements.length})
                </h4>
                <div className="space-y-3">
                  {selectedSession.feedback.specific_improvements.map((improvement, idx) => (
                    <div key={idx} className="flex items-start gap-3 bg-white p-4 rounded-lg">
                      <span className="flex-shrink-0 w-10 h-10 bg-teal-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
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
              className="w-full bg-gradient-to-r from-teal-600 to-sky-600 hover:from-teal-700 hover:to-sky-700 text-white font-bold py-4 rounded-xl transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Overall Progress Timeline */}
    <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
      <h3 className="text-2xl font-bold mb-6"><TrendingUp className="w-6 h-6 inline" /> Overall Progress Timeline</h3>
      
      {practiceHistory.length === 0 ? (
        <div className="text-center py-16 bg-gradient-to-br from-teal-50 to-sky-50 rounded-xl border-2 border-dashed border-teal-200">
          <div className="mb-4"><BarChart2 className="w-16 h-16 inline text-teal-400" /></div>
          <h4 className="text-2xl font-bold text-gray-900 mb-2">No Practice Data Yet</h4>
          <p className="text-gray-600 mb-6">Complete some practice sessions to see your progress!</p>
          <button 
            onClick={() => setCurrentView('home')}
            className="bg-gradient-to-r from-teal-600 to-sky-600 hover:from-teal-700 hover:to-sky-700 text-white px-6 py-3 rounded-lg font-semibold"
          >
            Start Practicing →
          </button>
        </div>
      ) : (
        <>
          {(() => {
            // Calculate dynamic width based on number of sessions
            // Minimum 50px spacing between points for easy clicking
            const validSessions = practiceHistory
              .filter(s => s.feedback?.overall || s.feedback?.match_percentage)
              .sort((a, b) => new Date(a.date) - new Date(b.date));

            const pointSpacing = 60; // pixels between each point
            const leftPadding = 70;  // space for Y-axis labels
            const rightPadding = 50; // space on right side
            const minWidth = 800;    // minimum width

            // Calculate required width based on number of points
            const chartWidth = Math.max(minWidth, leftPadding + (validSessions.length * pointSpacing) + rightPadding);
            const svgWidth = chartWidth;
            const plotWidth = chartWidth - leftPadding - rightPadding;

            return (
              <div className="overflow-x-auto pb-4">
                <div className="relative" style={{ height: '400px', minWidth: `${chartWidth}px` }}>
                  <svg viewBox={`0 0 ${svgWidth} 350`} className="w-full h-full" preserveAspectRatio="xMinYMid meet">
                    {[0, 2, 4, 6, 8, 10].map(score => (
                      <g key={score}>
                        <line x1={leftPadding - 10} y1={300 - (score * 27)} x2={chartWidth - rightPadding} y2={300 - (score * 27)} stroke="#e5e7eb" strokeWidth="1" strokeDasharray={score === 0 ? "0" : "4,4"} />
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

                    {/* Line connecting all points */}
                    {validSessions.length >= 2 && (
                      <polyline
                        points={validSessions.map((session, idx) => {
                          const score = session.feedback?.overall || (session.feedback?.match_percentage / 10);
                          const x = leftPadding + (idx * pointSpacing);
                          const y = 300 - (score * 27);
                          return `${x},${y}`;
                        }).join(' ')}
                        fill="none"
                        stroke="url(#lineGradient)"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    )}

                    {/* Clickable data points */}
                    {validSessions.map((session, idx) => {
                      const score = session.feedback?.overall || (session.feedback?.match_percentage / 10);
                      const x = leftPadding + (idx * pointSpacing);
                      const y = 300 - (score * 27);
                      return (
                        <g key={idx} style={{ cursor: 'pointer' }} onClick={() => {
                          setSelectedSession(session);
                        }}>
                          {/* Larger invisible hit area for easier clicking */}
                          <circle
                            cx={x}
                            cy={y}
                            r="20"
                            fill="transparent"
                          />
                          {/* Visible dot */}
                          <circle
                            cx={x}
                            cy={y}
                            r="12"
                            fill="#6366f1"
                            stroke="white"
                            strokeWidth="3"
                            className="hover:opacity-80 transition-opacity"
                          />
                          {/* Date label below each point */}
                          <text
                            x={x}
                            y="325"
                            fontSize="10"
                            fill="#9ca3af"
                            textAnchor="middle"
                            transform={`rotate(-45, ${x}, 325)`}
                          >
                            {new Date(session.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </text>
                        </g>
                      );
                    })}

                    <text x={chartWidth / 2} y="345" fontSize="14" fill="#6b7280" textAnchor="middle" fontWeight="600">Practice Sessions (click dots for details)</text>
                    <text x="20" y="180" fontSize="14" fill="#6b7280" textAnchor="middle" transform="rotate(-90, 20, 180)" fontWeight="600">Score</text>
                  </svg>
                </div>
                {validSessions.length > 10 && (
                  <p className="text-xs text-gray-500 text-center mt-2">Scroll horizontally to see all {validSessions.length} data points</p>
                )}
              </div>
            );
          })()}


          {(() => {
            // Sort by date ascending for accurate first/latest calculation
            const validSessions = practiceHistory
              .filter(s => s.feedback?.overall || s.feedback?.match_percentage)
              .sort((a, b) => new Date(a.date) - new Date(b.date));
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
                  <p className="text-3xl font-black text-teal-600">{latestScore.toFixed(1)}</p>
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
                  <p className="text-3xl font-black text-teal-600">{average.toFixed(1)}</p>
                </div>
              </div>
            );
          })()}
        </>
      )}
    </div>

    {/* Question-by-Question Progress */}
    <div className="bg-white rounded-xl shadow-lg p-8">
      <h3 className="text-2xl font-bold mb-6"><BarChart2 className="w-6 h-6 inline" /> Question-by-Question Progress</h3>
      
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

        // Sort each question's sessions by date ascending (oldest first for chronological display)
        Object.values(questionStats).forEach(qStat => {
          qStat.sessions.sort((a, b) => new Date(a.date) - new Date(b.date));
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
                <div key={idx} className="border-2 rounded-xl p-4 md:p-6 hover:border-teal-300 transition">
                  <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-6 mb-4">
                    {/* Left: Question Info */}
                    <div className="flex-1">
                      <h4 className="font-bold text-base md:text-lg mb-2">{qStat.question}</h4>
                      <div className="flex gap-4 text-sm text-gray-600">
                        <span><BarChart2 className="w-3 h-3 inline" /> {qStat.sessions.length} attempts</span>
                        <span><Star className="w-3 h-3 inline" /> {average.toFixed(1)} avg</span>
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
                    <div className="text-center bg-teal-50 rounded-xl p-4">
                      <p className="text-sm text-gray-600 mb-1">Latest</p>
                      <p className="text-4xl font-black text-teal-600">{scores[scores.length - 1].toFixed(1)}</p>
                    </div>
                  </div>
                  
                  <details className="mt-4 pt-4 border-t">
                    <summary className="cursor-pointer text-sm font-bold text-teal-600">
                      <ClipboardList className="w-4 h-4 inline" /> View {qStat.sessions.length} attempts
                    </summary>
                    <div className="mt-4 space-y-2">
                      {qStat.sessions.slice().reverse().map((session, sIdx) => {
                        const score = getScore(session);
                        const attemptNum = qStat.sessions.length - sIdx;
                        return (
                          <div 
                            key={sIdx}
                            className="flex justify-between bg-gray-50 p-4 rounded-lg cursor-pointer hover:bg-teal-50 transition"
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
                            <span className="text-xl font-black text-teal-600">{score.toFixed(1)}</span>
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
                  className="w-full bg-gradient-to-br from-teal-50 via-sky-50 to-emerald-50 rounded-xl p-4 border-2 border-teal-300 hover:border-teal-400 transition flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div><Sparkles className="w-8 h-8 text-teal-500" /></div>
                    <div className="text-left">
                      <h3 className="text-lg font-bold text-gray-900">AI Question Generator</h3>
                      <p className="text-sm text-gray-600">Generate personalized interview questions</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {usageStatsData?.questionGen?.unlimited && (
                      <span className="px-3 py-1 bg-teal-600 text-white text-xs font-bold rounded-full">UNLIMITED</span>
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
                  <div className="mt-4 p-6 bg-white rounded-xl border-2 border-teal-200">
                    {(usageStatsData?.questionGen?.unlimited || usageStatsData?.questionGen?.remaining > 0) ? (
                      <QuestionAssistant
                        onQuestionGenerated={async (generatedQuestion) => {
                          // SECURITY FIX: Check limits BEFORE action (prevents bypass)
                          // This sync check is faster and prevents race conditions
                          if (!checkUsageLimitsSync('questionGen', 'Question Generator')) {
                            console.log('🚫 Question Generator action blocked - over limit');
                            return;
                          }

                          // Increment usage after check passes
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
                                alert('Question added to bank!');
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
                        <div className="bg-teal-50 rounded-lg p-4 mb-6 max-w-sm mx-auto">
                          <p className="text-sm font-semibold text-teal-900 mb-2">💎 Pro Benefits:</p>
                          <ul className="text-sm text-left text-teal-800 space-y-1">
                            <li><CheckCircle className="w-4 h-4 inline text-teal-500" /> <strong>UNLIMITED</strong> Question Generator</li>
                            <li><CheckCircle className="w-4 h-4 inline text-teal-500" /> <strong>UNLIMITED</strong> AI Interviewer</li>
                            <li><CheckCircle className="w-4 h-4 inline text-teal-500" /> <strong>UNLIMITED</strong> Practice Mode</li>
                            <li><CheckCircle className="w-4 h-4 inline text-teal-500" /> <strong>UNLIMITED</strong> Answer Assistant</li>
                            <li><CheckCircle className="w-4 h-4 inline text-teal-500" /> <strong>UNLIMITED</strong> Practice Prompter</li>
                          </ul>
                        </div>
                        <button
                          onClick={() => setShowPricingPage(true)}
                          className="bg-gradient-to-r from-teal-600 to-sky-600 text-white px-10 py-4 rounded-lg font-bold text-lg hover:from-teal-700 hover:to-sky-700 shadow-lg transform hover:scale-105 transition"
                        >
                          Get 30-Day Pass — $14.99
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Job Focus Manager — AI-curated favorites for target role */}
              <JobFocusManager
                questions={questions}
                getUserContext={getUserContext}
                userId={currentUser?.id}
                onFavoritesUpdated={(data) => {
                  setCachedFavorites(data);
                  if (data) {
                    setFocusModeActive(true);
                    setFocusMode(currentUser?.id, true);
                  } else {
                    setFocusModeActive(false);
                    setFocusMode(currentUser?.id, false);
                  }
                }}
              />

              {/* Focus Mode Toggle — only shown when favorites exist */}
              {currentUser && cachedFavorites && (
                <div className="mb-4 flex items-center justify-between bg-indigo-50 rounded-lg px-4 py-3 border border-indigo-200">
                  <div>
                    <span className="text-sm font-semibold text-indigo-800"><Target className="w-4 h-4 inline" /> Focus Mode</span>
                    <p className="text-xs text-indigo-600">
                      {focusModeActive ? 'Practicing only job-relevant questions' : 'Practicing all questions'}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      const newState = !focusModeActive;
                      setFocusModeActive(newState);
                      setFocusMode(currentUser?.id, newState);
                    }}
                    className={`relative w-12 h-7 rounded-full transition-colors ${
                      focusModeActive ? 'bg-indigo-600' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                      focusModeActive ? 'translate-x-5' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 mb-5 sm:mb-6">
                <button onClick={() => setEditingQuestion({ question: '', keywords: [], category: 'Core Narrative', priority: 'Must-Know', bullets: [''], narrative: '', followups: [] })} className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl flex items-center justify-center gap-2 shadow-md hover:shadow-md transition-all active:scale-[0.98] text-sm sm:text-base">
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                  Add Question
                </button>
                
                {questions.length > 0 && (
                  <button
                    onClick={() => setShowDeleteAllConfirm(true)}
                    className="bg-red-50 hover:bg-red-100 text-red-600 font-semibold px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl flex items-center gap-2 border-2 border-red-200 hover:border-red-300 transition-all active:scale-[0.98] text-sm sm:text-base"
                  >
                    <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                    Delete All ({questions.length})
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-2 mb-5 sm:mb-6">
                <button onClick={() => { const input = document.createElement('input'); input.type = 'file'; input.accept = '.json,.txt,.csv'; input.onchange = (e) => { const file = e.target.files[0]; const reader = new FileReader(); reader.onload = (event) => importQuestions(event.target.result); reader.readAsText(file); }; input.click(); }} className="px-3 sm:px-4 py-2 sm:py-2.5 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium flex items-center gap-1.5 sm:gap-2 text-slate-700 transition-all active:scale-[0.98] text-sm">
                  <Upload className="w-4 h-4" />
                  Import
                </button>
                <button onClick={exportQuestions} className="px-3 sm:px-4 py-2 sm:py-2.5 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium flex items-center gap-1.5 sm:gap-2 text-slate-700 transition-all active:scale-[0.98] text-sm">
                  <Download className="w-4 h-4" />
                  Export
                </button>
                <button onClick={() => setShowTemplateLibrary(true)} className="px-3 sm:px-4 py-2 sm:py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold flex items-center gap-1.5 sm:gap-2 shadow-sm hover:shadow-md transition-all active:scale-[0.98] text-sm">
                  <BookOpen className="w-4 h-4" />
                  Question Catalog
                </button>
                {showTemplateLibrary && (
                  <TemplateLibrary
                    onClose={() => setShowTemplateLibrary(false)}
                    existingQuestions={questions}
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
                        
                        // FIXED: Filter out duplicates (IA-001, IA-001b, IA-008)
                        const existingQuestionTexts = questions.map(q => q.question.toLowerCase().trim());
                        const newQuestions = importedQuestions.filter(q => 
                          !existingQuestionTexts.includes(q.question.toLowerCase().trim())
                        );
                        
                        if (newQuestions.length === 0) {
                          alert('⚠️ All questions from this template are already in your Question Bank!');
                          setShowTemplateLibrary(false);
                          return;
                        }
                        
                        if (newQuestions.length < importedQuestions.length) {
                          console.log(`Skipped ${importedQuestions.length - newQuestions.length} duplicate(s)`);
                        }
                        
                        // Save to Supabase
                        const questionsToImport = newQuestions.map(q => ({
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
                        
                        // FIXED: Show accurate count with duplicate info
                        const skipped = importedQuestions.length - newQuestions.length;
                        if (skipped > 0) {
                          alert(`Imported ${newQuestions.length} new question(s)!\n\n(${skipped} duplicate(s) skipped)`);
                        } else {
                          alert(`Imported ${newQuestions.length} template question(s)!`);
                        }
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
                  <div className="bg-white rounded-xl p-6 max-w-3xl w-full my-8">
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
                        <label className="block text-sm font-medium mb-2">Keywords (for Practice Prompter matching)</label>
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
                        <button onClick={() => setEditingQuestion({ ...editingQuestion, bullets: [...editingQuestion.bullets, ''] })} className="text-teal-600 text-sm hover:text-teal-700">+ Add bullet</button>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Full Narrative (Optional)</label>
                        <textarea value={editingQuestion.narrative} onChange={(e) => setEditingQuestion({ ...editingQuestion, narrative: e.target.value })} className="w-full px-4 py-2 border rounded-lg h-32" placeholder="Full answer..." />
                      </div>
                    </div>
                    <div className="flex gap-4 mt-6">
                      <button onClick={() => { if (editingQuestion.id) updateQuestion(editingQuestion.id, editingQuestion); else addQuestion(editingQuestion); setEditingQuestion(null); }} className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 rounded-lg">Save</button>
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
                          {focusModeActive && cachedFavorites?.questionIds?.includes(q.id) && (
                            <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs font-semibold"><Target className="w-3 h-3 inline" /> Focus</span>
                          )}
                        </div>
                        <h3 className="text-xl font-bold mb-2">{q.question}</h3>
                        {q.bullets.length > 0 && (
                          <ul className="text-sm text-gray-600 space-y-1">
                            {q.bullets.filter(b => b).map((b, i) => <li key={i}>• {b}</li>)}
                          </ul>
                        )}
                        {q.practiceCount > 0 && (
                          <div className="flex gap-4 text-sm text-gray-600 mt-4">
                            <span><BarChart2 className="w-3 h-3 inline" /> Practiced: {q.practiceCount}x</span>
                            <span><Star className="w-3 h-3 inline" /> Avg: {q.averageScore.toFixed(1)}/10</span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        <button 
                          onClick={() => setEditingQuestion(q)} 
                          className="px-3 py-2 bg-teal-100 hover:bg-teal-200 text-teal-700 rounded-lg transition font-medium text-sm flex items-center justify-center gap-1"
                        >
                          <Edit2 className="w-4 h-4" />
                          <span>Edit</span>
                        </button>
                        
                        {/* AI ANSWER COACH BUTTON */}
                        <button
                          onClick={async () => {
                            // Check AI usage limit (no increment on click - will be tracked when AI delivers feedback)
                            const canUse = checkUsageLimitsSync('answerAssistant', 'Answer Assistant');
                            if (!canUse) return;

                            // Open AI Answer Coach (usage tracked via onUsageTracked callback when AI delivers)
                            setAnswerAssistantQuestion(q);
                            setShowAnswerAssistant(true);
                          }}
                          className="px-3 py-2 bg-gradient-to-r from-teal-100 to-sky-100 hover:from-teal-200 hover:to-sky-200 text-teal-700 rounded-lg transition font-bold text-sm flex items-center justify-center gap-1"
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
          userTier={usageStatsData?.tier}
          existingNarrative={answerAssistantQuestion.narrative}
          existingBullets={answerAssistantQuestion.bullets}
          onAnswerSaved={handleAnswerSaved}
          onClose={() => {
            setShowAnswerAssistant(false);
            setAnswerAssistantQuestion(null);
          }}
          onUsageTracked={() => {
              // SECURITY FIX: Check limits before tracking (prevents bypass)
              if (checkUsageLimitsSync('answerAssistant', 'Answer Assistant')) {
                trackUsageInBackground('answerAssistant', 'Answer Assistant');
              } else {
                console.log('🚫 Answer Assistant tracking blocked - over limit');
              }
            }}
        />
      )}
      </>
    );
  }
  // SETTINGS
  if (currentView === 'settings') {
    return (
      <SettingsPage
        user={currentUser}
        userData={{ user: currentUser, tier: userTier }}
        supabase={supabase}
        onBack={() => setCurrentView('home')}
        onNavigate={(view) => setCurrentView(view)}
        onOpenPricing={() => setShowPricingPage(true)}
      />
    );
  }

  // LEGACY SETTINGS (replaced by SettingsPage component above)
  if (false) {
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

          {/* Account */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 mb-4">
            <h3 className="text-sm font-semibold text-navy-700 mb-2">Account</h3>
            <p className="text-xs text-slate-500">{user?.email || 'Not signed in'}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5 mb-4">
            <h2 className="text-lg font-semibold mb-3 text-gray-800">App Information</h2>
            <div className="flex justify-between py-2">
              <span className="text-gray-600 text-sm">Version</span>
              <span className="font-medium text-gray-900 text-sm">1.0.0</span>
            </div>
          </div>

          {/* Subscription Management */}
          <div className="bg-white rounded-xl shadow-sm p-5 mb-4">
            <h2 className="text-lg font-semibold mb-3 text-gray-800">Subscription</h2>
            <div className="flex justify-between items-center py-2 mb-2">
              <span className="text-gray-600 text-sm">Current Plan</span>
              <span className={`font-medium text-sm px-2 py-1 rounded ${
                userTier === 'pro' ? 'bg-teal-100 text-teal-700' :
                userTier === 'beta' ? 'bg-amber-100 text-amber-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {userTier === 'pro' ? '👑 Pro' : userTier === 'beta' ? '🎖️ Beta' : 'Free'}
              </span>
            </div>
            <button
              onClick={() => setShowSubscriptionManagement(true)}
              className="w-full flex justify-between items-center py-3 px-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm"
            >
              <span className="font-medium text-gray-700">
                {userTier === 'pro' ? 'Manage Subscription' : 'View Plan Details'}
              </span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>
            {isNativeApp() && (
              <div className="mt-2">
                <button
                  onClick={async () => {
                    if (!user?.id) return;
                    // Show restoring state inline
                    const btn = document.getElementById('restore-purchases-btn');
                    const msg = document.getElementById('restore-purchases-msg');
                    if (btn) btn.textContent = 'Restoring...';
                    if (btn) btn.disabled = true;
                    if (msg) msg.textContent = '';
                    try {
                      const { restorePurchases } = await import('./utils/nativePurchases');
                      const result = await restorePurchases(user.id);
                      if (result.restored) {
                        if (msg) msg.textContent = 'Purchases restored successfully!';
                        if (msg) msg.className = 'text-center text-xs text-green-600 mt-1';
                        setTimeout(() => window.location.reload(), 1500);
                      } else {
                        if (msg) msg.textContent = result.error || 'No active purchases found.';
                        if (msg) msg.className = 'text-center text-xs text-slate-500 mt-1';
                      }
                    } catch (err) {
                      if (msg) msg.textContent = 'Unable to restore. Please contact support@interviewanswers.ai';
                      if (msg) msg.className = 'text-center text-xs text-red-500 mt-1';
                    }
                    if (btn) btn.textContent = 'Restore Purchases';
                    if (btn) btn.disabled = false;
                  }}
                  id="restore-purchases-btn"
                  className="w-full text-center text-sm text-blue-600 hover:text-blue-800 py-2"
                >
                  Restore Purchases
                </button>
                <p id="restore-purchases-msg" className="text-center text-xs text-slate-500 mt-1"></p>
              </div>
            )}
          </div>

          {/* AI Data Sharing */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 mb-4">
            <h3 className="text-sm font-semibold text-navy-700 mb-2">AI Data Sharing</h3>
            <p className="text-xs text-slate-500 mb-3">
              Your interview practice responses are sent to Anthropic's Claude AI service for personalized coaching feedback. Audio is transcribed on your device — only text is sent.
            </p>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-700">AI-powered coaching enabled</span>
              <div className="text-xs text-emerald-600 font-medium bg-emerald-50 px-2 py-1 rounded-full">Active</div>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              To revoke consent, contact support@interviewanswers.ai. AI features require this data sharing to function.
            </p>
            <a href="https://www.anthropic.com/privacy" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline mt-1 block">
              Anthropic Privacy Policy →
            </a>
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
            <h2 className="text-lg font-semibold mb-3 text-gray-800">Support</h2>

            <a
              href="mailto:support@interviewanswers.ai"
              className="w-full flex justify-between items-center py-3 px-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm"
            >
              <span className="font-medium text-gray-700">Need help? Contact us</span>
              <Mail className="w-4 h-4 text-gray-400" />
            </a>
          </div>

          {/* Reset Progress — for new job prep */}
          <div className="bg-white rounded-xl shadow-sm p-5 mb-4">
            <h2 className="text-lg font-semibold mb-3 text-gray-800">Progress Reset</h2>
            <p className="text-sm text-gray-600 mb-3">
              Preparing for a new job? Reset your scores, streaks, and session history
              while keeping your question bank and saved answers.
            </p>
            <button
              onClick={async () => {
                if (window.confirm(
                  'Reset Practice Progress?\n\n' +
                  'This will reset:\n' +
                  '• All practice scores and session history\n' +
                  '• Streaks and learning progress\n' +
                  '• Coach chat history\n\n' +
                  'This will KEEP:\n' +
                  '• Your question bank\n' +
                  '• Your saved answers\n' +
                  '• Your subscription\n\n' +
                  'This cannot be undone.'
                )) {
                  try {
                    const { data: { user } } = await supabase.auth.getUser();
                    if (!user) { alert('Please sign in first.'); return; }
                    const result = await resetAllProgress(user.id);
                    if (result.success) {
                      setPracticeHistory([]);
                      setSessionCount(0);
                      await loadQuestions(); // Refresh stats (practiceCount/averageScore reset)
                      alert('Progress reset! Your questions and answers are still here. Fresh start!');
                    } else {
                      alert('⚠️ Progress partially reset. Some operations may have failed.\n\n' + (result.errors || []).join('\n'));
                    }
                  } catch (error) {
                    console.error('Reset error:', error);
                    alert('❌ Reset failed: ' + error.message);
                  }
                }
              }}
              className="w-full flex justify-between items-center py-3 px-3 bg-amber-50 hover:bg-amber-100 border-2 border-amber-300 rounded-lg text-sm transition-all"
            >
              <span className="font-medium text-amber-800"><RotateCcw className="w-4 h-4 inline" /> Reset Progress for New Job</span>
              <ChevronRight className="w-4 h-4 text-amber-500" />
            </button>
            <p className="text-xs text-gray-500 mt-2">
              Keeps your question bank and saved answers intact.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5 mb-4">
            <h2 className="text-lg font-semibold mb-3 text-gray-800">Data Management</h2>
            
            <button
              onClick={async () => {
                if (window.confirm('⚠️ DELETE ALL DATA?\n\nThis will PERMANENTLY delete:\n• All practice sessions\n• All questions\n• All progress\n• All usage history\n\nYour Pro subscription (if active) will NOT be canceled.\nManage your subscription in Settings or Stripe.\n\nThis CANNOT be undone.\n\nClick OK to continue.')) {
                  if (window.confirm('🛑 FINAL CONFIRMATION\n\nYou are about to delete all practice data.\n\nThis is PERMANENT.\n\nClick OK to DELETE ALL DATA NOW.')) {
                    try {
                      const { data: { user } } = await supabase.auth.getUser();
                      if (user) {
                        // ✅ FIX: Add 10-second timeout per operation to prevent hanging (Focus-Loss Cascade Bug)
                        const deleteWithTimeout = async (table) => {
                          const deletePromise = supabase.from(table).delete().eq('user_id', user.id);
                          const timeoutPromise = new Promise((_, reject) =>
                            setTimeout(() => reject(new Error(`${table} delete timed out`)), 10000)
                          );
                          try {
                            const result = await Promise.race([deletePromise, timeoutPromise]);
                            if (result?.error) {
                              console.error(`❌ ${table} delete error:`, result.error);
                            } else {
                              console.log(`✅ Deleted from ${table}`, result?.status, result?.statusText);
                            }
                          } catch (err) {
                            console.warn(`⚠️ ${table} delete failed/timeout:`, err.message);
                          }
                        };

                        // Delete ALL user practice data from Supabase with individual timeouts
                        await deleteWithTimeout('practice_sessions');
                        await deleteWithTimeout('practice_history');
                        await deleteWithTimeout('questions');
                        await deleteWithTimeout('question_banks');
                        await deleteWithTimeout('usage_tracking');

                        // ⚠️ STRIPE PROTECTION: Do NOT delete user_profiles — it contains
                        // subscription_id, stripe_customer_id, and subscription_status.
                        // Deleting this row orphans the Stripe subscription: user keeps paying
                        // but the webhook can't find them to maintain Pro access.
                        // Instead, reset non-billing fields to defaults.
                        const resetProfilePromise = supabase
                          .from('user_profiles')
                          .update({ display_name: null, updated_at: new Date().toISOString() })
                          .eq('user_id', user.id);
                        const resetTimeout = new Promise((_, reject) =>
                          setTimeout(() => reject(new Error('user_profiles reset timed out')), 10000)
                        );
                        try {
                          await Promise.race([resetProfilePromise, resetTimeout]);
                          console.log('✅ Reset user_profiles (Stripe subscription preserved)');
                        } catch (err) {
                          console.warn('⚠️ user_profiles reset failed/timeout:', err.message);
                        }

                        // Attempt to delete the Supabase auth account
                        try {
                          await supabase.rpc('delete_user');
                        } catch (e) {
                          console.log('Account deletion via RPC not available, signing out instead');
                        }
                      }

                      // Clear ALL localStorage (including consent so user starts fresh)
                      localStorage.clear();
                      
                      alert('All data deleted. You will be signed out.');
                      
                      // Sign out user completely with timeout
                      try {
                        const signOutPromise = supabase.auth.signOut();
                        const timeoutPromise = new Promise((_, reject) => 
                          setTimeout(() => reject(new Error('Sign out timed out')), 10000)
                        );
                        await Promise.race([signOutPromise, timeoutPromise]);
                      } catch (err) {
                        console.warn('⚠️ Sign out failed/timeout:', err.message);
                        // Continue to reload anyway
                      }
                      
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
              <Trash2 className="w-4 h-4 inline" /> Delete All My Data
            </button>
            
            <p className="text-xs text-gray-500 mt-2">
              Permanently deletes everything. <strong>Cannot be undone.</strong>
            </p>
          </div>

          {/* Sign Out */}
          <div className="mb-4">
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                window.location.href = '/login';
              }}
              className="w-full py-3 rounded-xl text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-all"
            >
              Sign Out
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5">
            <h2 className="text-lg font-semibold mb-3 text-gray-800">Support</h2>
            <p className="text-gray-600 mb-2 text-sm">Questions or feedback?</p>
            <a
              href="mailto:support@interviewanswers.ai"
              className="text-teal-600 hover:text-teal-700 font-medium text-sm"
            >
              support@interviewanswers.ai
            </a>
          </div>
        </div>

        {/* Subscription Management Modal */}
        {showSubscriptionManagement && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <SubscriptionManagement
              user={currentUser}
              userTier={userTier}
              subscriptionStatus={subscriptionStatus}
              onClose={() => setShowSubscriptionManagement(false)}
            />
          </div>
        )}
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
            <p className="text-sm text-gray-600 mb-6">Last updated: April 5, 2026</p>

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
              <li>Improve our service features and user experience</li>
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
              <li><strong>Anthropic (Claude API):</strong> AI-powered interview coaching and feedback generation</li>
              <li><strong>Stripe:</strong> Payment processing for subscriptions</li>
              <li><strong>Web Speech API:</strong> On-device speech recognition (no audio sent to external servers)</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-3">AI Data Processing — Anthropic (Claude)</h3>
            <p className="mb-4 text-gray-700">
              Your practice responses (text only) are sent to Anthropic's Claude AI to generate personalized coaching feedback.
              No personal identifiers (email, password, payment info) are included in AI requests. Audio is transcribed on your
              device — only the text transcript is sent for analysis. Anthropic processes your data in accordance with their Privacy Policy ({' '}
              <a href="https://www.anthropic.com/privacy" target="_blank" rel="noopener noreferrer" className="text-teal-600 underline">anthropic.com/privacy</a>
              ) and provides protection of user data consistent with the standards described in this Privacy Policy. Anthropic does not use data submitted via its API to train or improve its AI models.
            </p>
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
              <strong>Important:</strong> Practice Prompter is designed for rehearsal sessions, not live interviews with other people.
              If despite our guidance you choose to use any audio feature during a live conversation with another party,
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
              To exercise these rights, use the Delete Data function in Settings or contact us at support@interviewanswers.ai
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
            <p className="mb-2 text-gray-700">Email: support@interviewanswers.ai</p>
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
            <p className="text-sm text-gray-600 mb-6">Last updated: April 5, 2026</p>
            
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
              Practice Prompter is designed for rehearsal, not live interviews. If despite our guidance you use any recording
              functionality during a live conversation with another party, you are solely responsible for:
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
              usageStats={usageStatsData}
              onUpgrade={() => {
                setShowUsageDashboard(false);
                setShowPricingPage(true);
              }}
            />
          </div>
        </div>
      )}

      {/* ==========================================
          PRICING PAGE MODAL — GeneralPricing (pass-based)
          Replaces old PricingPage (Pro $29.99/mo subscription)
          ========================================== */}
      {showPricingPage && (
        <GeneralPricing
          userData={{ user: currentUser, tier: userTier }}
          onClose={() => {
            setShowPricingPage(false);
            const r = sessionStorage.getItem('upgradeReturnTo');
            if (r) { sessionStorage.removeItem('upgradeReturnTo'); window.location.href = r; }
          }}
        />
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
              existingQuestions={questions}
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
                  
                  // FIXED: Filter out duplicates (IA-001, IA-001b, IA-008)
                  const existingQuestionTexts = questions.map(q => q.question.toLowerCase().trim());
                  const newQuestions = importedQuestions.filter(q => 
                    !existingQuestionTexts.includes(q.question.toLowerCase().trim())
                  );
                  
                  if (newQuestions.length === 0) {
                    alert('⚠️ All questions from this template are already in your Question Bank!');
                    setShowTemplateLibrary(false);
                    return;
                  }
                  
                  if (newQuestions.length < importedQuestions.length) {
                    console.log(`Skipped ${importedQuestions.length - newQuestions.length} duplicate(s)`);
                  }
                  
                  // Save to Supabase
                  const questionsToImport = newQuestions.map(q => ({
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
                  
                  // FIXED: Show accurate count with duplicate info
                  const skipped = importedQuestions.length - newQuestions.length;
                  if (skipped > 0) {
                    alert(`Imported ${newQuestions.length} new question(s)!\n\n(${skipped} duplicate(s) skipped)`);
                  } else {
                    alert(`Imported ${newQuestions.length} template question(s)!`);
                  }
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

      {/* Interview Format Selection Modal */}
      <InterviewFormatModal
        isOpen={showFormatModal}
        onClose={() => setShowFormatModal(false)}
        onStart={(format, seed) => handleFormatSelected(format, seed)}
      />

      {/* Curated Interviews Screen (shown after format pick) */}
      <CuratedInterviewsScreen
        isOpen={showCuratedInterviews}
        format={selectedFormat}
        onBack={() => {
          setShowCuratedInterviews(false);
          setShowFormatModal(true); // go back to format picker
        }}
        onStart={(curated, seed) => handleCuratedInterviewSelected(curated, seed)}
        sessionSeed={sessionSeed}
      />

      {/* Floating AI Coach Button + Popup Chat Panel */}
      {currentView !== 'ai-interviewer' && !interviewSessionActive && currentUser && (
        <>
          {/* FAB toggle */}
          {!showCoachPanel && (
            <button
              onClick={() => setShowCoachPanel(true)}
              onTouchEnd={(e) => { e.preventDefault(); setShowCoachPanel(true); }}
              className="fixed bottom-6 right-6 z-40 w-12 h-12 bg-slate-800 hover:bg-slate-900 rounded-full shadow-md flex items-center justify-center active:scale-95 transition-all duration-200"
              aria-label="Open Interview Coach"
            >
              <MessageCircle className="w-5 h-5 text-white" />
            </button>
          )}

          {/* Slide-up chat panel */}
          {showCoachPanel && (
            <div className="fixed inset-0 z-50 flex flex-col justify-end">
              {/* Backdrop */}
              <div
                className="absolute inset-0 bg-black/30"
                onClick={() => setShowCoachPanel(false)}
                onTouchEnd={(e) => { e.preventDefault(); setShowCoachPanel(false); }}
              />
              {/* Panel */}
              <div className="relative bg-white rounded-t-2xl shadow-2xl flex flex-col" style={{ height: 'min(85vh, 680px)', maxHeight: '85vh' }}>
                <AIInterviewCoach
                  user={currentUser}
                  userData={{ user: currentUser, tier: userTier, usage: usageStats }}
                  questions={questions}
                  practiceHistory={practiceHistory}
                  userContextData={getUserContext()}
                  onClose={() => setShowCoachPanel(false)}
                  isPanel={true}
                />
              </div>
            </div>
          )}
        </>
      )}
    </>
  ); {/* Close fragment that contains dialogs + views */}
}; // Close ISL component

// Import routing
import { Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import AuthPage from './Components/AuthPage';

const LandingPage = lazy(() => import('./Components/Landing/LandingPage'));
const TermsPage = lazy(() => import('./Components/Landing/TermsPage'));
const PrivacyPage = lazy(() => import('./Components/Landing/PrivacyPage'));
const EthicsPage = lazy(() => import('./Components/Landing/EthicsPage'));
const NursingTrackApp = showNursingFeatures() ? lazy(() => import('./Components/NursingTrack/NursingTrackApp')) : () => null;
const NursingLandingPage = showNursingFeatures() ? lazy(() => import('./Components/NursingTrack/NursingLandingPage')) : () => null;
const ArchetypeOnboarding = lazy(() => import('./Components/Onboarding/ArchetypeOnboarding'));
const STARMethodGuidePage = lazy(() => import('./Components/Landing/STARMethodGuidePage'));
const BehavioralInterviewQuestionsPage = lazy(() => import('./Components/Landing/BehavioralInterviewQuestionsPage'));
const MockInterviewPracticePage = lazy(() => import('./Components/Landing/MockInterviewPracticePage'));
const TellMeAboutYourselfPage = lazy(() => import('./Components/Landing/TellMeAboutYourselfPage'));
const InterviewQuestionsPage = lazy(() => import('./Components/Landing/InterviewQuestionsPage'));
const InterviewCoachingLessonsPage = lazy(() => import('./Components/Landing/InterviewCoachingLessonsPage'));
const InterviewPrepPodcastPage = lazy(() => import('./Components/Landing/InterviewPrepPodcastPage'));
const NursingInterviewQuestionsPage = showNursingFeatures() ? lazy(() => import('./Components/Landing/NursingInterviewQuestionsPage')) : () => null;
const AuthConfirm = lazy(() => import('./Components/AuthConfirm'));
const OAuthCallback = lazy(() => import('./Components/OAuthCallback'));

const LoadingFallback = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-sky-50 flex items-center justify-center">
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mx-auto mb-4"></div>
      <div className="text-slate-600 text-lg">Loading InterviewAnswers.ai...</div>
    </div>
  </div>
);

function App() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* Root route: web → landing page, general iOS → /app, nursing iOS → /nursing */}
        <Route path="/" element={
          getAppTarget() === 'nursing' ? <Navigate to="/nursing" replace /> :
          isTargetedBuild() ? <Navigate to="/app" replace /> :
          <LandingPage />
        } />
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/signup" element={<AuthPage mode="signup" />} />
        <Route path="/auth/confirm" element={<AuthConfirm />} />
        <Route path="/auth/callback" element={<OAuthCallback />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/ethics" element={<EthicsPage />} />

        {/* General app: available in 'all' and 'general' builds */}
        {showGeneralFeatures() ? (
          <Route path="/app" element={<ProtectedRoute><ISL /></ProtectedRoute>} />
        ) : (
          <Route path="/app" element={<Navigate to="/nursing" replace />} />
        )}

        {/* Specialty routes: only registered when the specialty track is enabled. */}
        {showNursingFeatures() && (
          <>
            <Route path="/nursing" element={<ProtectedRoute><NursingTrackApp /></ProtectedRoute>} />
            <Route path="/nurse" element={getAppTarget() === 'nursing' ? <Navigate to="/nursing" replace /> : <NursingLandingPage />} />
            <Route path="/nursing-interview-questions" element={<NursingInterviewQuestionsPage />} />
          </>
        )}

        {/* SEO content pages: available in all builds */}
        <Route path="/star-method-guide" element={<STARMethodGuidePage />} />
        <Route path="/behavioral-interview-questions" element={<BehavioralInterviewQuestionsPage />} />
        <Route path="/mock-interview-practice" element={<MockInterviewPracticePage />} />
        <Route path="/tell-me-about-yourself" element={<TellMeAboutYourselfPage />} />
        <Route path="/interview-questions-and-answers" element={<InterviewQuestionsPage />} />
        <Route path="/interview-coaching-lessons" element={<InterviewCoachingLessonsPage />} />
        <Route path="/interview-prep-podcast" element={<InterviewPrepPodcastPage />} />
        <Route path="/onboarding" element={<ArchetypeOnboarding />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;