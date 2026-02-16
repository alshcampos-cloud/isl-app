// NursingTrack — Main Entry Point / Router
// This component manages the nursing track's internal view state.
// It is a self-contained module that can be mounted at /nursing route.
//
// Views: specialty-selection → dashboard → mock-interview | practice | sbar-drill
//
// ⚠️ D.R.A.F.T. Protocol: This is a NEW file. No existing code modified.

import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { isBetaUser, getUsageStats } from '../../utils/creditSystem';
import { fetchSessionHistory, insertPracticeSession } from './nursingSupabase';
import SpecialtySelection from './SpecialtySelection';
import NursingDashboard from './NursingDashboard';
import NursingMockInterview from './NursingMockInterview';
import NursingPracticeMode from './NursingPracticeMode';
import NursingSBARDrill from './NursingSBARDrill';
import NursingFlashcards from './NursingFlashcards';
import NursingCommandCenter from './NursingCommandCenter';
import NursingAICoach from './NursingAICoach';
import NursingResources from './NursingResources';
import NursingConfidenceBuilder from './NursingConfidenceBuilder';
import NursingOfferCoach from './NursingOfferCoach';

// Internal view states for the nursing track
const VIEWS = {
  SPECIALTY_SELECTION: 'specialty-selection',
  DASHBOARD: 'dashboard',
  MOCK_INTERVIEW: 'mock-interview',
  PRACTICE: 'practice',
  SBAR_DRILL: 'sbar-drill',
  FLASHCARDS: 'flashcards',
  COMMAND_CENTER: 'command-center',
  AI_COACH: 'ai-coach',
  RESOURCES: 'resources',
  CONFIDENCE: 'confidence-builder',
  NEGOTIATION: 'offer-coach',
};

export default function NursingTrackApp() {
  const navigate = useNavigate();

  // Track internal view state
  const [currentView, setCurrentView] = useState(VIEWS.SPECIALTY_SELECTION);
  const [selectedSpecialty, setSelectedSpecialty] = useState(null);
  const [targetQuestionId, setTargetQuestionId] = useState(null);

  // Session history — loaded from Supabase when available, falls back to in-memory
  const [sessionHistory, setSessionHistory] = useState([]);
  const [sessionsLoadedFromDb, setSessionsLoadedFromDb] = useState(false);

  // User state — fetched on mount, passed as props (no Context needed yet)
  const [userData, setUserData] = useState({
    user: null,
    tier: 'free',
    isBeta: false,
    usage: null,
    displayName: '',
    loading: true,
  });

  // Add a session record: update in-memory state AND persist to Supabase (non-blocking)
  // NOTE: Must be declared AFTER userData to avoid ReferenceError (const doesn't hoist)
  const addSession = useCallback((sessionRecord) => {
    // Always update in-memory immediately
    setSessionHistory(prev => [...prev, sessionRecord]);

    // Persist to Supabase in the background (non-blocking, best-effort)
    if (userData?.user?.id && selectedSpecialty?.id) {
      insertPracticeSession(userData.user.id, selectedSpecialty.id, sessionRecord)
        .then(result => {
          if (!result.success) {
            console.warn('⚠️ Session persisted in-memory only (Supabase write failed)');
          }
        });
    }
  }, [userData?.user?.id, selectedSpecialty?.id]);

  // Fetch user session, profile, tier, beta status, usage on mount
  useEffect(() => {
    let cancelled = false;

    async function loadUserData() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user || cancelled) {
          setUserData(prev => ({ ...prev, loading: false }));
          return;
        }

        const user = session.user;
        const userId = user.id;

        // Fetch profile (name, tier) and beta status in parallel
        const [profileResult, betaResult] = await Promise.all([
          supabase.from('user_profiles').select('tier').eq('user_id', userId).maybeSingle(),
          isBetaUser(supabase, userId),
        ]);

        const profile = profileResult.data;
        const tier = betaResult ? 'beta' : (profile?.tier || 'free');

        // Now fetch usage stats with resolved tier
        const usageStats = await getUsageStats(supabase, userId, tier);

        if (!cancelled) {
          setUserData({
            user,
            tier,
            isBeta: betaResult,
            usage: usageStats,
            displayName: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Nurse',
            loading: false,
          });
        }
      } catch (err) {
        console.error('Error loading user data for nursing track:', err);
        if (!cancelled) {
          setUserData(prev => ({ ...prev, loading: false }));
        }
      }
    }

    loadUserData();
    return () => { cancelled = true; };
  }, []);

  // Load session history from Supabase once user data is available
  useEffect(() => {
    if (!userData.user || userData.loading || sessionsLoadedFromDb) return;

    async function loadSessions() {
      const result = await fetchSessionHistory(userData.user.id);
      if (result.fromSupabase && result.data) {
        setSessionHistory(result.data);
        setSessionsLoadedFromDb(true);
        console.log(`✅ Loaded ${result.data.length} nursing sessions from Supabase`);
      } else {
        // Supabase table doesn't exist yet or query failed — keep using in-memory
        console.log('ℹ️ Nursing sessions: using in-memory store (Supabase unavailable)');
      }
    }

    loadSessions();
  }, [userData.user, userData.loading, sessionsLoadedFromDb]);

  // Refresh usage stats (called after successful AI responses)
  const refreshUsage = useCallback(async () => {
    if (!userData.user) return;
    try {
      const usageStats = await getUsageStats(supabase, userData.user.id, userData.tier);
      setUserData(prev => ({ ...prev, usage: usageStats }));
    } catch (err) {
      console.error('Error refreshing usage:', err);
    }
  }, [userData.user, userData.tier]);

  // ============================================================
  // NAVIGATION HANDLERS
  // ============================================================

  const handleSelectSpecialty = useCallback((specialty) => {
    setSelectedSpecialty(specialty);
    setCurrentView(VIEWS.DASHBOARD);
  }, []);

  const handleChangeSpecialty = useCallback(() => {
    setCurrentView(VIEWS.SPECIALTY_SELECTION);
  }, []);

  const handleStartMode = useCallback((modeId, questionId = null) => {
    // Store target question ID for modes that support deep-linking to a specific question
    setTargetQuestionId(questionId);
    switch (modeId) {
      case 'mock-interview':
        setCurrentView(VIEWS.MOCK_INTERVIEW);
        break;
      case 'practice':
        setCurrentView(VIEWS.PRACTICE);
        break;
      case 'sbar-drill':
        setCurrentView(VIEWS.SBAR_DRILL);
        break;
      case 'flashcards':
        setCurrentView(VIEWS.FLASHCARDS);
        break;
      case 'command-center':
        setCurrentView(VIEWS.COMMAND_CENTER);
        break;
      case 'ai-coach':
        setCurrentView(VIEWS.AI_COACH);
        break;
      case 'resources':
        setCurrentView(VIEWS.RESOURCES);
        break;
      case 'confidence-builder':
        setCurrentView(VIEWS.CONFIDENCE);
        break;
      case 'offer-coach':
        setCurrentView(VIEWS.NEGOTIATION);
        break;
      default:
        console.warn('Unknown mode:', modeId);
        break;
    }
  }, []);

  const handleBackToDashboard = useCallback(() => {
    setCurrentView(VIEWS.DASHBOARD);
    // Clear any deep-link target so re-entering a mode starts fresh
    setTargetQuestionId(null);
  }, []);

  const handleBackToApp = useCallback(() => {
    // Navigate back to the main InterviewAnswers.AI app
    navigate('/app');
  }, [navigate]);

  // ============================================================
  // PRO GATE — blocks free users from premium modes
  // ============================================================
  const isProUser = userData?.isBeta || userData?.tier === 'pro' || userData?.tier === 'beta';

  const ProGateScreen = ({ modeName, modeIcon, onBack }) => (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
          <div className="text-4xl mb-4">{modeIcon}</div>
          <h2 className="text-white text-xl font-bold mb-2">{modeName}</h2>
          <p className="text-slate-400 text-sm mb-1">This is a Pro feature.</p>
          <p className="text-slate-500 text-xs mb-6">
            Upgrade to get unlimited access to {modeName}, plus all other nursing interview tools.
          </p>
          <a
            href="/app?upgrade=true&returnTo=/nursing"
            className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-500 text-white font-medium px-6 py-3 rounded-xl transition-colors text-sm mb-4"
          >
            Upgrade to Pro — $29.99/mo
          </a>
          <div>
            <button
              onClick={onBack}
              className="text-slate-500 hover:text-slate-300 text-xs transition-colors mt-2"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // ============================================================
  // VIEW RENDERING
  // Wrapped in .nursing-track for mobile readability CSS overrides
  // ============================================================

  const renderView = () => {
    switch (currentView) {
      case VIEWS.SPECIALTY_SELECTION:
        return (
          <SpecialtySelection
            onSelectSpecialty={handleSelectSpecialty}
            onBack={handleBackToApp}
          />
        );

      case VIEWS.DASHBOARD:
        return (
          <NursingDashboard
            specialty={selectedSpecialty}
            onStartMode={handleStartMode}
            onChangeSpecialty={handleChangeSpecialty}
            onBack={handleBackToApp}
            userData={userData}
            sessionHistory={sessionHistory}
          />
        );

      case VIEWS.MOCK_INTERVIEW:
        return (
          <NursingMockInterview
            specialty={selectedSpecialty}
            onBack={handleBackToDashboard}
            userData={userData}
            refreshUsage={refreshUsage}
            addSession={addSession}
          />
        );

      case VIEWS.PRACTICE:
        return (
          <NursingPracticeMode
            specialty={selectedSpecialty}
            onBack={handleBackToDashboard}
            userData={userData}
            refreshUsage={refreshUsage}
            addSession={addSession}
            startQuestionId={targetQuestionId}
          />
        );

      case VIEWS.SBAR_DRILL:
        return (
          <NursingSBARDrill
            specialty={selectedSpecialty}
            onBack={handleBackToDashboard}
            userData={userData}
            refreshUsage={refreshUsage}
            addSession={addSession}
          />
        );

      case VIEWS.FLASHCARDS:
        return (
          <NursingFlashcards
            specialty={selectedSpecialty}
            onBack={handleBackToDashboard}
            userData={userData}
          />
        );

      case VIEWS.COMMAND_CENTER:
        return (
          <NursingCommandCenter
            specialty={selectedSpecialty}
            onBack={handleBackToDashboard}
            onStartMode={handleStartMode}
            sessionHistory={sessionHistory}
            userData={userData}
          />
        );

      case VIEWS.AI_COACH:
        if (!isProUser) return <ProGateScreen modeName="AI Coach" modeIcon="🤖" onBack={handleBackToDashboard} />;
        return (
          <NursingAICoach
            specialty={selectedSpecialty}
            onBack={handleBackToDashboard}
            userData={userData}
            refreshUsage={refreshUsage}
            addSession={addSession}
          />
        );

      case VIEWS.RESOURCES:
        return (
          <NursingResources
            onBack={handleBackToDashboard}
          />
        );

      case VIEWS.CONFIDENCE:
        if (!isProUser) return <ProGateScreen modeName="Confidence Builder" modeIcon="💪" onBack={handleBackToDashboard} />;
        return (
          <NursingConfidenceBuilder
            specialty={selectedSpecialty}
            onBack={handleBackToDashboard}
            userData={userData}
            refreshUsage={refreshUsage}
          />
        );

      case VIEWS.NEGOTIATION:
        if (!isProUser) return <ProGateScreen modeName="Offer Negotiation" modeIcon="💰" onBack={handleBackToDashboard} />;
        return (
          <NursingOfferCoach
            specialty={selectedSpecialty}
            onBack={handleBackToDashboard}
            userData={userData}
            refreshUsage={refreshUsage}
            addSession={addSession}
          />
        );

      default:
        return (
          <SpecialtySelection
            onSelectSpecialty={handleSelectSpecialty}
            onBack={handleBackToApp}
          />
        );
    }
  };

  return <div className="nursing-track">{renderView()}</div>;
}
