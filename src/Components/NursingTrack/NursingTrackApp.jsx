// NursingTrack — Main Entry Point / Router
// This component manages the nursing track's internal view state.
// It is a self-contained module that can be mounted at /nursing route.
//
// Views: specialty-selection → dashboard → mock-interview | practice | sbar-drill
//
// ⚠️ D.R.A.F.T. Protocol: This is a NEW file. No existing code modified.

import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { isBetaUser, getUsageStats, resolveEffectiveTier, hasActiveNursingPass } from '../../utils/creditSystem';
import FirstTimeConsent from '../FirstTimeConsent';
import NursingTutorial from './NursingTutorial';
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
import NursingPricing from './NursingPricing';

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
  const [searchParams, setSearchParams] = useSearchParams();

  // Track whether we're verifying a recent Stripe purchase
  const [verifyingPurchase, setVerifyingPurchase] = useState(
    searchParams.get('purchase') === 'success'
  );
  // Track whether terms have been accepted (to trigger re-render after FirstTimeConsent)
  const [termsJustAccepted, setTermsJustAccepted] = useState(false);
  // Show nursing tutorial for first-time users (after terms accepted)
  const [showNursingTutorial, setShowNursingTutorial] = useState(
    !localStorage.getItem('nursing_tutorial_seen')
  );

  // Track internal view state
  const [currentView, setCurrentView] = useState(VIEWS.SPECIALTY_SELECTION);
  const [selectedSpecialty, setSelectedSpecialty] = useState(null);
  const [targetQuestionId, setTargetQuestionId] = useState(null);

  // Session history — loaded from Supabase when available, falls back to in-memory
  const [sessionHistory, setSessionHistory] = useState([]);
  const [sessionsLoadedFromDb, setSessionsLoadedFromDb] = useState(false);

  // Streak/IRS refresh trigger — incremented after any session completes to re-fetch data
  const [streakRefreshTrigger, setStreakRefreshTrigger] = useState(0);
  const triggerStreakRefresh = useCallback(() => setStreakRefreshTrigger(t => t + 1), []);

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

        // Fetch profile (name, tier, pass expiry) and beta status in parallel
        const [profileResult, betaResult] = await Promise.all([
          supabase.from('user_profiles').select('tier, subscription_status, nursing_pass_expires, general_pass_expires, accepted_terms').eq('user_id', userId).maybeSingle(),
          isBetaUser(supabase, userId),
        ]);

        let profile = profileResult.data;

        // ── Profile creation fallback ──────────────────────────────
        // If no profile exists yet (nursing users who never visited /app),
        // create one. Mirrors App.jsx line 1002-1013 pattern.
        if (!profile) {
          console.log('NursingTrackApp: No profile found, creating one...');
          const { data: newProfile, error: insertErr } = await supabase
            .from('user_profiles')
            .insert({ user_id: userId, tier: 'free', onboarding_field: 'nursing' })
            .select('tier, subscription_status, nursing_pass_expires, general_pass_expires, accepted_terms')
            .single();
          if (!insertErr && newProfile) {
            profile = newProfile;
            console.log('NursingTrackApp: Profile created successfully');
          } else if (insertErr?.code === '23505') {
            // Duplicate key — profile was created between our check and insert (race condition)
            // Re-fetch it
            const { data: refetch } = await supabase
              .from('user_profiles')
              .select('tier, subscription_status, nursing_pass_expires, general_pass_expires, accepted_terms')
              .eq('user_id', userId)
              .maybeSingle();
            profile = refetch;
            console.log('NursingTrackApp: Profile already existed (race), re-fetched');
          } else {
            console.error('NursingTrackApp: Profile creation failed:', insertErr);
          }
        }

        // Use resolveEffectiveTier to determine active tier from pass expiry + beta + legacy
        const tier = resolveEffectiveTier(profile, betaResult);

        // Now fetch usage stats with resolved tier
        const usageStats = await getUsageStats(supabase, userId, tier);

        if (!cancelled) {
          setUserData({
            user,
            tier,
            isBeta: betaResult,
            usage: usageStats,
            displayName: user.email?.split('@')[0] || 'Nurse',
            nursingPassExpires: profile?.nursing_pass_expires || null,
            generalPassExpires: profile?.general_pass_expires || null,
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
  }, [termsJustAccepted]); // Re-run when terms are accepted (profile may have been created/updated)

  // ── Post-payment verification polling ────────────────────────
  // When Stripe redirects back with ?purchase=success, the webhook may not have
  // fired yet. Poll the profile until nursing_pass_expires appears.
  useEffect(() => {
    if (!verifyingPurchase || !userData.user || userData.loading) return;

    // If tier is already set (webhook was fast), just clear the flag
    if (userData.tier === 'nursing_pass' || userData.tier === 'annual' || userData.tier === 'beta' || userData.tier === 'pro') {
      console.log('NursingTrackApp: Payment already verified, tier =', userData.tier);
      setVerifyingPurchase(false);
      // Clean up URL params
      searchParams.delete('purchase');
      searchParams.delete('pass');
      setSearchParams(searchParams, { replace: true });
      return;
    }

    let attempts = 0;
    const maxAttempts = 15; // 15 * 2s = 30 seconds max
    const pollInterval = setInterval(async () => {
      attempts++;
      console.log(`NursingTrackApp: Polling for payment verification (attempt ${attempts}/${maxAttempts})...`);

      try {
        const { data: freshProfile } = await supabase
          .from('user_profiles')
          .select('nursing_pass_expires, general_pass_expires, tier')
          .eq('user_id', userData.user.id)
          .maybeSingle();

        const freshTier = resolveEffectiveTier(freshProfile);

        if (freshTier !== 'free') {
          console.log('NursingTrackApp: Payment verified! Tier =', freshTier);
          clearInterval(pollInterval);
          setVerifyingPurchase(false);
          // Clean up URL params
          searchParams.delete('purchase');
          searchParams.delete('pass');
          setSearchParams(searchParams, { replace: true });
          // Reload full user data with new tier
          const usageStats = await getUsageStats(supabase, userData.user.id, freshTier);
          setUserData(prev => ({
            ...prev,
            tier: freshTier,
            usage: usageStats,
            nursingPassExpires: freshProfile?.nursing_pass_expires || null,
            generalPassExpires: freshProfile?.general_pass_expires || null,
          }));
          return;
        }
      } catch (err) {
        console.warn('NursingTrackApp: Poll error:', err);
      }

      if (attempts >= maxAttempts) {
        console.log('NursingTrackApp: Payment verification timeout. Showing refresh prompt.');
        clearInterval(pollInterval);
        setVerifyingPurchase(false);
        // Clean up URL params
        searchParams.delete('purchase');
        searchParams.delete('pass');
        setSearchParams(searchParams, { replace: true });
      }
    }, 2000);

    return () => clearInterval(pollInterval);
  }, [verifyingPurchase, userData.user, userData.loading, userData.tier]);

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
  // User has nursing access if: beta, nursing_pass, annual, or legacy pro
  const isProUser = userData?.isBeta || userData?.tier === 'nursing_pass' || userData?.tier === 'annual' || userData?.tier === 'pro' || userData?.tier === 'beta';

  // State for showing the in-app pricing modal
  const [showPricing, setShowPricing] = useState(false);

  const ProGateScreen = ({ modeName, modeIcon, onBack }) => (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
          <div className="text-4xl mb-4">{modeIcon}</div>
          <h2 className="text-white text-xl font-bold mb-2">{modeName}</h2>
          <p className="text-slate-400 text-sm mb-1">This feature requires a Nursing Pass.</p>
          <p className="text-slate-500 text-xs mb-6">
            Get unlimited access to {modeName}, plus all other nursing interview tools.
          </p>
          <button
            onClick={() => setShowPricing(true)}
            className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-500 text-white font-medium px-6 py-3 rounded-xl transition-colors text-sm mb-4"
          >
            Get Nursing Pass — $19.99
          </button>
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
            streakRefreshTrigger={streakRefreshTrigger}
            onShowPricing={() => setShowPricing(true)}
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
            triggerStreakRefresh={triggerStreakRefresh}
            onShowPricing={() => setShowPricing(true)}
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
            triggerStreakRefresh={triggerStreakRefresh}
            onShowPricing={() => setShowPricing(true)}
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
            triggerStreakRefresh={triggerStreakRefresh}
            onShowPricing={() => setShowPricing(true)}
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
            onShowPricing={() => setShowPricing(true)}
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
            triggerStreakRefresh={triggerStreakRefresh}
            onShowPricing={() => setShowPricing(true)}
          />
        );

      case VIEWS.RESOURCES:
        return (
          <NursingResources
            onBack={handleBackToDashboard}
          />
        );

      case VIEWS.CONFIDENCE:
        // Confidence Builder: Profile + Evidence + Reset are FREE; only AI Brief is gated by credits
        return (
          <NursingConfidenceBuilder
            specialty={selectedSpecialty}
            onBack={handleBackToDashboard}
            userData={userData}
            refreshUsage={refreshUsage}
            onShowPricing={() => setShowPricing(true)}
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
            triggerStreakRefresh={triggerStreakRefresh}
            onShowPricing={() => setShowPricing(true)}
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

  // ── Payment verification loading screen ───────────────────
  if (verifyingPurchase) {
    return (
      <div className="nursing-track">
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
              <div className="w-12 h-12 border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin mx-auto mb-4"></div>
              <h2 className="text-white text-xl font-bold mb-2">Verifying your purchase...</h2>
              <p className="text-slate-400 text-sm">This usually takes just a few seconds.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="nursing-track">
      {/* Terms & Privacy acceptance — blocks UI until accepted */}
      {userData.user && (
        <FirstTimeConsent
          user={userData.user}
          onAccepted={() => {
            console.log('NursingTrackApp: Terms accepted, refreshing user data');
            setTermsJustAccepted(prev => !prev); // Toggle to trigger loadUserData re-run
          }}
          onAlreadyAccepted={() => {
            // No action needed — terms already accepted
          }}
        />
      )}
      {/* Nursing tutorial — shows once for first-time nursing users */}
      {showNursingTutorial && (
        <NursingTutorial
          onComplete={() => setShowNursingTutorial(false)}
        />
      )}
      {renderView()}
      {showPricing && (
        <NursingPricing
          userData={userData}
          onClose={() => setShowPricing(false)}
        />
      )}
    </div>
  );
}
